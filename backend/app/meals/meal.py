import os
from dotenv import load_dotenv
from pynamodb.models import Model
from pynamodb.attributes import UnicodeAttribute, UTCDateTimeAttribute, ListAttribute
import logging
from pynamodb.exceptions import TransactWriteError
from pynamodb.connection import Connection
from botocore.exceptions import ClientError

from foods.food import MbdFood
from pynamodb.transactions import TransactWrite
from shared.exceptions import MbdException


logger = logging.getLogger("uvicorn.error")
logger.setLevel(logging.INFO)

ENV = os.getenv("ENVIRONMENT")

if ENV is not None:
    logger.info("Loading environment: %s", ENV)
    load_dotenv(f".env.{ENV}")
else:
    logger.warning("Hmm... no ENV value set")

logger.info(f"{os.getenv('MEALS_DB_NAME')=}")


class MbdMeal(Model):
    class Meta:
        table_name = os.getenv("MEALS_DB_NAME")
        region = "us-west-2"

    user_id = UnicodeAttribute(hash_key=True)
    meal_type = UnicodeAttribute()
    date_time = UTCDateTimeAttribute(range_key=True)
    foods = ListAttribute(of=MbdFood, default=lambda: [])

    def to_dto(self) -> dict:
        return {
            "meal_type": self.meal_type,
            "date_time": self.date_time.isoformat(),
            "foods": [food.to_dto() for food in self.foods],
        }

    @classmethod
    def update_meal(
        cls, connection: Connection, user_id: str, original_date_time, new_meal
    ):
        """
        Update a meal with atomic transaction handling.

        Args:
            user_id: The user ID
            original_date_time: The original datetime of the meal to update
            new_meal: The new meal data

        Returns:
            The updated meal

        Raises:
            MbdException: If the meal doesn't exist or if the new datetime already exists
        """
        try:
            original_meal = cls.get(user_id, original_date_time)

            # If the datetime is changing, we need to check if the a meal with the new datetime already exists
            if original_date_time != new_meal.date_time:
                try:
                    with TransactWrite(
                        connection=connection,
                        client_request_token=str(original_date_time),
                    ) as transaction:
                        # Create a new meal with the new datetime and delete the old one
                        new_meal_obj = cls(
                            user_id=user_id,
                            meal_type=new_meal.meal_type,
                            date_time=new_meal.date_time,
                            foods=[
                                MbdFood(
                                    food_id=food.food_id,
                                    name=food.name,
                                    thumbnail=food.thumbnail,
                                )
                                for food in new_meal.foods
                            ],
                        )
                        transaction.delete(
                            original_meal,
                        )
                        transaction.save(
                            new_meal_obj,
                            condition=cls.date_time.does_not_exist(),
                        )

                except TransactWriteError as e:
                    logger.error(f"Transaction error: {str(e)}")

                    if any(
                        cr is not None and cr.code == "ConditionalCheckFailed"
                        for cr in e.cancellation_reasons
                    ):
                        # This means the condition failed, which is expected if the meal already exists
                        raise MbdException(
                            status_code=409,
                            errors=[
                                f"A meal already exists at {new_meal.date_time.isoformat()}"
                            ],
                        )
                    raise MbdException(
                        status_code=500,
                        errors=["Failed to update meal. Please try again."],
                    )
                return new_meal_obj
            else:
                # If the datetime isn't changing, just update the meal in place
                original_meal.meal_type = new_meal.meal_type
                original_meal.foods = [
                    MbdFood(
                        food_id=food.food_id,
                        name=food.name,
                        thumbnail=food.thumbnail,
                    )
                    for food in new_meal.foods
                ]
                original_meal.save()
                return original_meal

        except cls.DoesNotExist:
            logger.warning(
                f"Attempted to update a meal for {user_id} at {original_date_time.isoformat()}, but it does not exist."
            )
            raise MbdException(
                status_code=404,
                errors=[
                    f"Attempted to update a meal at {original_date_time.isoformat()}, but it does not exist."
                ],
            )
        except ClientError as e:
            logger.error(f"Client error: {str(e)}")
            raise MbdException(
                status_code=500, errors=["Failed to update meal. Please try again."]
            )
