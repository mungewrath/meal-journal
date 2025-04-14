from datetime import datetime, timedelta, timezone
from unittest.mock import patch, MagicMock
import pytest
from uuid import uuid4

from foods.food import MbdFood
from meals.meal import MbdMeal
from foods.suggested import get_suggested_foods


def create_mock_food(food_id=None, name=None, thumbnail=None):
    """Helper function to create a mock food object"""
    if food_id is None:
        food_id = str(uuid4())
    if name is None:
        name = f"Food {food_id[:8]}"
    if thumbnail is None:
        thumbnail = "🍎"

    food = MbdFood()
    food.food_id = food_id
    food.name = name
    food.thumbnail = thumbnail
    return food


def create_mock_meal(user_id, meal_type, date_time, foods):
    """Helper function to create a mock meal object"""
    meal = MbdMeal()
    meal.user_id = user_id
    meal.meal_type = meal_type
    meal.date_time = date_time
    meal.foods = foods
    return meal


@patch("foods.suggested.MbdMeal.query")
def test_get_suggested_foods__includes_foods_from_yesterday_meal(mock_query):
    """Test that foods from yesterday's meal of the specified type are included"""
    # Setup
    user_id = "test-user"
    meal_type = "Breakfast"

    # Create mock foods
    food1 = create_mock_food(name="Oatmeal", thumbnail="🥣")
    food2 = create_mock_food(name="Banana", thumbnail="🍌")

    # Create yesterday's date
    yesterday = datetime.now(timezone.utc) - timedelta(days=1)
    yesterday_breakfast_time = yesterday.replace(
        hour=8, minute=0, second=0, microsecond=0
    )

    # Create mock meals
    yesterday_breakfast = create_mock_meal(
        user_id=user_id,
        meal_type=meal_type,
        date_time=yesterday_breakfast_time,
        foods=[food1, food2],
    )

    # Mock the query to return yesterday's breakfast
    mock_query.return_value = [yesterday_breakfast]

    # Call the function
    suggested_foods = get_suggested_foods(user_id, meal_type)

    # Verify the results
    assert len(suggested_foods) == 2
    food_ids = {food.food_id for food in suggested_foods}
    assert food1.food_id in food_ids
    assert food2.food_id in food_ids


@patch("foods.suggested.MbdMeal.query")
def test_get_suggested_foods__includes_frequently_eaten_foods(mock_query):
    """Test that foods that appear in >80% of the last 20 meals are included"""
    # Setup
    user_id = "test-user"
    meal_type = "Lunch"

    # Create mock foods
    food1 = create_mock_food(name="Sandwich", thumbnail="🥪")
    food2 = create_mock_food(name="Apple", thumbnail="🍎")
    food3 = create_mock_food(name="Cookie", thumbnail="🍪")

    # Create mock meals for the last 20 days
    meals = []
    now = datetime.now(timezone.utc)

    # Create 20 meals with food1 and food2 appearing in 17 of them (85%)
    for i in range(20):
        meal_time = now - timedelta(days=i)
        meal_foods = [food1, food2]

        # Only add food3 to 5 of the meals
        if i < 5:
            meal_foods.append(food3)

        meal = create_mock_meal(
            user_id=user_id,
            meal_type="Any",  # Meal type doesn't matter for this test
            date_time=meal_time,
            foods=meal_foods,
        )
        meals.append(meal)

    # Mock the query to return the meals
    mock_query.return_value = meals

    # Call the function
    suggested_foods = get_suggested_foods(user_id, meal_type)

    # Verify the results
    assert len(suggested_foods) == 2
    food_ids = {food.food_id for food in suggested_foods}
    assert food1.food_id in food_ids
    assert food2.food_id in food_ids
    assert food3.food_id not in food_ids


@patch("foods.suggested.MbdMeal.query")
def test_get_suggested_foods__combines_yesterday_and_frequent_foods(mock_query):
    """Test that both rules are applied and combined correctly"""
    # Setup
    user_id = "test-user"
    meal_type = "Dinner"

    # Create mock foods
    food1 = create_mock_food(name="Pizza", thumbnail="🍕")
    food2 = create_mock_food(name="Salad", thumbnail="🥗")
    food3 = create_mock_food(name="Pasta", thumbnail="🍝")

    # Create yesterday's date
    yesterday = datetime.now(timezone.utc) - timedelta(days=1)
    yesterday_dinner_time = yesterday.replace(
        hour=19, minute=0, second=0, microsecond=0
    )

    # Create mock meals
    yesterday_dinner = create_mock_meal(
        user_id=user_id,
        meal_type=meal_type,
        date_time=yesterday_dinner_time,
        foods=[food1, food2],  # Yesterday's dinner had pizza and salad
    )

    # Create 20 meals with food2 and food3 appearing in 17 of them (85%)
    recent_meals = []
    now = datetime.now(timezone.utc)

    for i in range(20):
        meal_time = now - timedelta(days=i)
        meal_foods = [food2, food3]

        # Only add food1 to 5 of the meals
        if i < 5:
            meal_foods.append(food1)

        meal = create_mock_meal(
            user_id=user_id,
            meal_type="Any",  # Meal type doesn't matter for this test
            date_time=meal_time,
            foods=meal_foods,
        )
        recent_meals.append(meal)

    # Combine all meals
    all_meals = [yesterday_dinner] + recent_meals

    # Mock the query to return all meals
    mock_query.return_value = all_meals

    # Call the function
    suggested_foods = get_suggested_foods(user_id, meal_type)

    # Verify the results
    # Should include food1 (from yesterday) and food2, food3 (frequent foods)
    assert len(suggested_foods) == 3
    food_ids = {food.food_id for food in suggested_foods}
    assert food1.food_id in food_ids
    assert food2.food_id in food_ids
    assert food3.food_id in food_ids


@patch("foods.suggested.MbdMeal.query")
def test_get_suggested_foods__combines_without_duplicates(mock_query):
    # Setup
    user_id = "test-user"
    meal_type = "Dinner"

    # Create mock foods
    food1 = create_mock_food(name="Pizza", thumbnail="🍕")
    food2 = create_mock_food(name="Salad", thumbnail="🥗")
    food3 = create_mock_food(name="Pasta", thumbnail="🍝")

    # Create yesterday's date
    yesterday = datetime.now(timezone.utc) - timedelta(days=1)
    yesterday_dinner_time = yesterday.replace(
        hour=19, minute=0, second=0, microsecond=0
    )

    # Create mock meals
    yesterday_dinner = create_mock_meal(
        user_id=user_id,
        meal_type=meal_type,
        date_time=yesterday_dinner_time,
        foods=[food1, food2],  # Yesterday's dinner had pizza and salad
    )

    # Create 20 meals with food2 and food3 appearing in 17 of them (85%)
    recent_meals = []
    now = datetime.now(timezone.utc)

    for i in range(20):
        meal_time = now - timedelta(days=i)
        meal_foods = [food1, food2, food3]

        meal = create_mock_meal(
            user_id=user_id,
            meal_type="Any",  # Meal type doesn't matter for this test
            date_time=meal_time,
            foods=meal_foods,
        )
        recent_meals.append(meal)

    # Combine all meals
    all_meals = [yesterday_dinner] + recent_meals

    # Mock the query to return all meals
    mock_query.return_value = all_meals

    # Call the function
    suggested_foods = get_suggested_foods(user_id, meal_type)

    # Verify the results
    # Should include food1 (from yesterday) and food2, food3 (frequent foods)
    assert len(suggested_foods) == 3
    food_ids = {food.food_id for food in suggested_foods}
    assert food1.food_id in food_ids
    assert food2.food_id in food_ids
    assert food3.food_id in food_ids


@patch("foods.suggested.MbdMeal.query")
def test_get_suggested_foods__returns_empty_list_when_no_data(mock_query):
    """Test behavior when there's no data"""
    # Setup
    user_id = "test-user"
    meal_type = "Snack"

    # Mock the query to return no meals
    mock_query.return_value = []

    # Call the function
    suggested_foods = get_suggested_foods(user_id, meal_type)

    # Verify the results
    assert len(suggested_foods) == 0
