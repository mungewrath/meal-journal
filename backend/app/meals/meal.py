import os
from dotenv import load_dotenv
from pynamodb.models import Model
from pynamodb.attributes import UnicodeAttribute, UTCDateTimeAttribute, ListAttribute
import logging

from foods.food import MbdFood


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
            "mealType": self.meal_type,
            "dateTime": self.date_time.isoformat(),
            "foods": [food.to_dto() for food in self.foods],
        }
