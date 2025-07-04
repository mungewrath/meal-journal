from datetime import datetime

from dto.meal_create import MealCreate


class MealUpdate(MealCreate):
    original_date_time: datetime
