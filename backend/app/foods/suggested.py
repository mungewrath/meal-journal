from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo
from typing import List, Set
from collections import Counter

from foods.food import MbdFood
from meals.meal import MbdMeal


def get_suggested_foods(user_id: str, meal_type: str) -> List[MbdFood]:
    # Get foods from yesterday's meals of the specified type
    yesterdays_foods_map = get_yesterdays_foods(user_id, meal_type)

    # Get frequently eaten foods from the last 20 meals
    frequent_foods_map = get_frequent_foods(user_id)
    return list(yesterdays_foods_map | frequent_foods_map)


def get_yesterdays_foods(user_id: str, meal_type: str) -> Set[MbdFood]:
    """
    Get foods from yesterday's meals of the specified type.

    Args:
        user_id: The user ID
        meal_type: The meal type (e.g., "Breakfast", "Lunch", "Dinner")

    Returns:
        Set of food IDs from yesterday's meals of the specified type
    """

    yesterdays_meals = MbdMeal.query(
        hash_key=user_id,
        range_key_condition=MbdMeal.date_time.between(*get_yesterday_start_and_end()),
    )

    # Filter for the specific meal type
    yesterdays_meals_of_type = [
        meal for meal in yesterdays_meals if meal.meal_type == meal_type
    ]

    yesterdays_foods = set()
    for meal in yesterdays_meals_of_type:
        yesterdays_foods.update(meal.foods)

    return yesterdays_foods


def get_yesterday_start_and_end() -> tuple[datetime, datetime]:
    # Get the current date from the user's timezone (Pacific time for now).
    # Then, calculate the start and end of their "yesterday" in UTC.
    # All dates are input as local time, but stored UTC
    yesterday = datetime.now(ZoneInfo("US/Pacific")) - timedelta(days=1)
    yesterday_date = yesterday.date()
    yesterday_start = datetime.combine(
        yesterday_date, datetime.min.time(), tzinfo=timezone.utc
    )

    yesterday_end = yesterday_start + timedelta(days=1)

    return yesterday_start, yesterday_end


def get_frequent_foods(user_id: str) -> Set[MbdFood]:
    """
    Get foods that appear in >80% of the user's last 20 meals.

    Args:
        user_id: The user ID

    Returns:
        Set of food IDs that appear frequently
    """
    # Get the last 30 days of meals (to ensure we have enough)
    now = datetime.now()
    thirty_days_ago = now - timedelta(days=30)

    # Query meals from the last 30 days
    recent_meals = MbdMeal.query(
        hash_key=user_id,
        range_key_condition=MbdMeal.date_time.between(thirty_days_ago, now),
    )

    # Sort by date_time in descending order and take the last 20
    last_20_meals = sorted(recent_meals, key=lambda meal: meal.date_time, reverse=True)[
        :20
    ]

    # Count food occurrences
    food_counter = Counter()
    frequent_foods_map = {}
    for meal in last_20_meals:
        for food in meal.foods:
            food_counter[food.food_id] += 1
            frequent_foods_map[food.food_id] = food

    frequent_foods = {
        frequent_foods_map[food_id]
        for food_id, count in food_counter.items()
        if count >= len(last_20_meals) * 0.6
    }

    return frequent_foods
