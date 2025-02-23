from datetime import datetime
from typing import Annotated
from pydantic import BaseModel, StringConstraints


class FoodEntry(BaseModel):
    food_id: Annotated[str, StringConstraints(min_length=36)]
    name: Annotated[str, StringConstraints(min_length=1)]
    thumbnail: Annotated[str, StringConstraints(min_length=1, max_length=1)]


class MealCreate(BaseModel):
    meal_type: Annotated[str, StringConstraints(min_length=1)]
    date_time: datetime
    foods: list[FoodEntry]
