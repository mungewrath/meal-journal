import json

with open("standardized_meals.json", "r") as f:
    meals = json.load(f)

    meals_unescaped = [json.loads(meal) for meal in meals]

with open("standardized_meals_unescaped.json", "w") as f:
    json.dump(meals_unescaped, f, indent=4)
    print("Unescaped meals saved to standardized_meals_unescaped.json")
