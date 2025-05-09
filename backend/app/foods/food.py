import os
from dotenv import load_dotenv
from pynamodb.models import Model
from pynamodb.attributes import UnicodeAttribute, ListAttribute, MapAttribute

ENV = os.getenv("ENVIRONMENT")

if ENV is not None:
    load_dotenv(f".env.{ENV}")


class MbdFood(MapAttribute):
    food_id = UnicodeAttribute(range_key=True)
    name = UnicodeAttribute()
    thumbnail = UnicodeAttribute()

    def to_dto(self) -> dict:
        return {
            "food_id": self.food_id,
            "name": self.name,
            "thumbnail": self.thumbnail,
        }

    def __hash__(self):
        return self.food_id.__hash__()

    def __eq__(self, other):
        if not isinstance(other, MbdFood):
            return False
        return (
            self.food_id == other.food_id
            and self.name == other.name
            and self.thumbnail == other.thumbnail
        )


class MbdFoodList(Model):
    class Meta:
        table_name = os.getenv("FOODS_DB_NAME")
        region = "us-west-2"

    user_id = UnicodeAttribute(hash_key=True)
    foods = ListAttribute(of=MbdFood, default=lambda: [])

    def to_dto(self) -> dict:
        return {
            "foods": [food.to_dto() for food in self.foods],
        }
