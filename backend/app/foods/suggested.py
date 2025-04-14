from datetime import datetime, timedelta, timezone
from typing import List, Dict, Set, Tuple
from collections import Counter

from foods.food import MbdFood
from meals.meal import MbdMeal


def get_suggested_foods(user_id: str, meal_type: str) -> List[MbdFood]:
    # Get foods from yesterday's meals of the specified type
    yesterdays_foods_map = get_yesterdays_foods(user_id, meal_type)

    # Get frequently eaten foods from the last 20 meals
    frequent_foods_map = get_frequent_foods(user_id)

    return list((yesterdays_foods_map | frequent_foods_map).values())


def get_yesterdays_foods(user_id: str, meal_type: str) -> Dict[str, MbdFood]:
    """
    Get foods from yesterday's meals of the specified type.

    Args:
        user_id: The user ID
        meal_type: The meal type (e.g., "Breakfast", "Lunch", "Dinner")

    Returns:
        A tuple containing:
        - Set of food IDs from yesterday's meals of the specified type
        - Dictionary mapping food IDs to food objects
    """
    # Get yesterday's date range
    yesterday = datetime.now(timezone.utc) - timedelta(days=1)
    yesterday_start = yesterday.replace(hour=0, minute=0, second=0, microsecond=0)
    yesterday_end = yesterday_start + timedelta(days=1)

    yesterdays_meals = MbdMeal.query(
        hash_key=user_id,
        range_key_condition=MbdMeal.date_time.between(yesterday_start, yesterday_end),
    )

    # Filter for the specific meal type
    yesterdays_meals_of_type = [
        meal for meal in yesterdays_meals if meal.meal_type == meal_type
    ]

    yesterdays_foods = {}
    for meal in yesterdays_meals_of_type:
        for food in meal.foods:
            yesterdays_foods[food.food_id] = food

    return yesterdays_foods


def get_frequent_foods(user_id: str) -> Dict[str, MbdFood]:
    """
    Get foods that appear in >80% of the user's last 20 meals.

    Args:
        user_id: The user ID

    Returns:
        A tuple containing:
        - Set of food IDs that appear frequently
        - Dictionary mapping food IDs to food objects
    """
    # Get the last 30 days of meals (to ensure we have enough)
    now = datetime.now(timezone.utc)
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
        food_id: frequent_foods_map[food_id]
        for food_id, count in food_counter.items()
        if count >= len(last_20_meals) * 0.8
    }

    return frequent_foods


def convert_food_ids_to_objects(
    food_ids: Set[str],
    yesterday_foods_map: Dict[str, MbdFood],
    frequent_foods_map: Dict[str, MbdFood],
) -> List[MbdFood]:
    """
    Convert food IDs to food objects, prioritizing foods from yesterday.

    Args:
        food_ids: Set of food IDs to convert
        yesterday_foods_map: Dictionary mapping food IDs to food objects from yesterday
        frequent_foods_map: Dictionary mapping food IDs to food objects from frequent meals

    Returns:
        A list of food objects
    """
    suggested_foods = []
    for food_id in food_ids:
        # Try to get the food from either map, prioritizing yesterday's foods
        if food_id in yesterday_foods_map:
            suggested_foods.append(yesterday_foods_map[food_id])
        elif food_id in frequent_foods_map:
            suggested_foods.append(frequent_foods_map[food_id])

    return suggested_foods
