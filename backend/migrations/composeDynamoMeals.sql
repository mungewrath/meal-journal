CREATE TABLE standardized_meals AS
SELECT 
    json_object(
        'user_id', meals.user_id,
        'meal_type', meals.meal_type,
        'date_time', meals.date_time,
        'foods', (
            SELECT json_group_array(
                json_object(
                    'food_id', meal_foods.food_id,
                    'name', meal_foods.name,
                    'thumbnail', meal_foods.thumbnail,
                )
            )
            FROM meal_foods
            WHERE meal_foods.meal_id = meals.meal_type || '_' || meals.date_time
        )
    ) AS meal_json
FROM meals;