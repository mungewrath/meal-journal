from unittest.mock import patch, MagicMock
from uuid import uuid4

from foods.food import MbdFood


@patch("app.main.MbdFoodList.get")
async def test_create_food__returns_new_food(mock_get, client, mock_get_user_id):
    # Mock the food list
    mock_food_list = MagicMock()
    mock_food_list.foods = []
    mock_get.return_value = mock_food_list

    # Make the request
    new_food_id = str(uuid4())
    response = client.post(
        "/foods",
        headers={"Authorization": "Bearer test-token"},
        json={
            "id": new_food_id,
            "name": "Blueberries",
            "thumbnail": "🫐",
        },
    )

    # Verify the response
    assert response.status_code == 200
    data = response.json()
    assert data["food_id"] == new_food_id
    assert data["name"] == "Blueberries"
    assert data["thumbnail"] == "🫐"

    # Verify the food was added to the list and saved
    assert len(mock_food_list.foods) == 1
    assert mock_food_list.foods[0].food_id == new_food_id
    mock_food_list.save.assert_called_once()


@patch("app.main.MbdFoodList.get")
async def test_create_food__returns_bad_request_if_food_exists(
    mock_get, client, mock_get_user_id
):
    # Mock the food list with an existing food
    mock_food_list = MagicMock()
    existing_food_id = str(uuid4())
    existing_food = MbdFood()
    existing_food.food_id = existing_food_id
    existing_food.name = "Blueberries"
    existing_food.thumbnail = "🫐"
    mock_food_list.foods = [
        existing_food,
    ]
    mock_get.return_value = mock_food_list

    # Make the request with the same food name
    response = client.post(
        "/foods",
        headers={"Authorization": "Bearer test-token"},
        json={
            "id": str(uuid4()),
            "name": "Blueberries",
            "thumbnail": "🫐",
        },
    )

    # Verify the response
    assert response.status_code == 400

    # Verify no new food was added to the list
    assert len(mock_food_list.foods) == 1
    mock_food_list.save.assert_not_called()


@patch("app.main.MbdFoodList.get")
async def test_create_food__returns_bad_request_if_food_exists_ignoring_case(
    mock_get, client, mock_get_user_id
):
    # Mock the food list with an existing food
    mock_food_list = MagicMock()
    existing_food_id = str(uuid4())
    existing_food = MbdFood()
    existing_food.food_id = existing_food_id
    existing_food.name = "blueberries"
    existing_food.thumbnail = "🫐"
    mock_food_list.foods = [
        existing_food,
    ]
    mock_get.return_value = mock_food_list

    # Make the request with the same food name
    response = client.post(
        "/foods",
        headers={"Authorization": "Bearer test-token"},
        json={
            "id": str(uuid4()),
            "name": "BLUEBERRIES",
            "thumbnail": "🫐",
        },
    )

    # Verify the response
    assert response.status_code == 400

    # Verify no new food was added to the list
    assert len(mock_food_list.foods) == 1
    mock_food_list.save.assert_not_called()


@patch("app.main.get_suggested_foods")
async def test_get_suggested_foods_endpoint(
    mock_get_suggested_foods, client, mock_get_user_id
):
    # Setup
    meal_type = "Breakfast"

    # Create mock foods
    food1 = MbdFood()
    food1.food_id = str(uuid4())
    food1.name = "Oatmeal"
    food1.thumbnail = "🥣"

    food2 = MbdFood()
    food2.food_id = str(uuid4())
    food2.name = "Banana"
    food2.thumbnail = "🍌"

    # Mock the get_suggested_foods function
    mock_get_suggested_foods.return_value = [food1, food2]

    # Make the request
    response = client.get(
        f"/foods/suggested/{meal_type}",
        headers={"Authorization": "Bearer test-token"},
    )

    # Verify the response
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2

    # Verify the food data
    food_ids = {food["food_id"] for food in data}
    assert food1.food_id in food_ids
    assert food2.food_id in food_ids

    # Verify the function was called with the correct arguments
    mock_get_suggested_foods.assert_called_once_with("test-user", meal_type)
