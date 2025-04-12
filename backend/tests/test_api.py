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
