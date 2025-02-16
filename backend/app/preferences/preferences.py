import os
from dotenv import load_dotenv
from pynamodb.models import Model
from pynamodb.attributes import UnicodeAttribute, ListAttribute, BooleanAttribute

ENV = os.getenv("ENVIRONMENT")

if ENV is not None:
    load_dotenv(f".env.{ENV}")


class MbdPreferences(Model):
    """
    A DynamoDB model for storing user preferences
    """

    class Meta:
        table_name = os.getenv("PREFERENCES_DB_NAME")
        region = "us-west-2"

    user_id = UnicodeAttribute(hash_key=True)
    default_meal_times = ListAttribute(default=lambda: ["9:00", "12:00", "18:00"])
    use_thumbnails = BooleanAttribute(default=True)

    def to_dto(self) -> dict:
        return {
            "defaultMealTimes": self.default_meal_times,
            "useThumbnails": self.use_thumbnails,
        }
