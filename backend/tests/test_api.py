from unittest.mock import patch, MagicMock
from uuid import uuid4


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
    mock_food_list.foods = [
        MagicMock(food_id=existing_food_id, name="Blueberries", thumbnail="🫐")
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
    data = response.json()
    assert data["detail"] == "Food with the specified name already exists."

    # Verify no new food was added to the list
    assert len(mock_food_list.foods) == 1
    mock_food_list.save.assert_not_called()
