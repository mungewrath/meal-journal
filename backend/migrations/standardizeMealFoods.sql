-- SELECT UPPER(SUBSTRING(meal_foods.name, 1, 1)) || LOWER(SUBSTRING(meal_foods.name, 2)) AS NormalizedText
-- FROM meal_foods;

WITH MinFoodIDs AS (
  -- Find the smallest food_id for each normalized_name
  SELECT 
    UPPER(SUBSTRING(meal_foods.name, 1, 1)) || LOWER(SUBSTRING(meal_foods.name, 2)) AS normalized_name,
    MIN(food_id) AS min_food_id
  FROM 
    meal_foods
  GROUP BY 
    normalized_name
)
-- Update the main table with the consistent food_id for the same normalized_name
UPDATE meal_foods
SET food_id = (
  SELECT min_food_id 
  FROM MinFoodIDs 
  WHERE MinFoodIDs.normalized_name = UPPER(SUBSTRING(meal_foods.name, 1, 1)) || LOWER(SUBSTRING(meal_foods.name, 2))
),
name = (
  SELECT normalized_name 
  FROM MinFoodIDs 
  WHERE MinFoodIDs.min_food_id = meal_foods.food_id
)