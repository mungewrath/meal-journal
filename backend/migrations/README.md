# Standardization process

- `python3 create_backup <table name>`
- Import into SQLite
  - meals CSV
  - meal_foods CSV
- Run `composeDynamoMeals.sql`
- Run `standardizeMealFoods.sql`
- Save changes (if in the GUI)
- `sqlite3 mbd.db "SELECT json_group_array(meal_json) AS meals_json FROM standardized_meals;" > standardized_meals.json`
- `python3 unescape.py`
- Take a manual backup in AWS!
- `python3 replace_meals.py`