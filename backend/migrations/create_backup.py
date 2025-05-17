import os
import sys
import csv
from datetime import datetime
import boto3

if len(sys.argv) != 2:
    print(f"Usage: python {sys.argv[0]} <table_name>")
    print("AWS_PROFILE must be set in the environment.")
    sys.exit(1)

TABLE_NAME = sys.argv[1]
ENV = os.getenv("AWS_PROFILE")

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(TABLE_NAME)

scan_kwargs = {}
items = []
done = False
start_key = None

while not done:
    if start_key:
        scan_kwargs["ExclusiveStartKey"] = start_key
    response = table.scan(**scan_kwargs)
    items.extend(response.get("Items", []))
    start_key = response.get("LastEvaluatedKey", None)
    done = start_key is None

meal_foods = []
for item in items:
    meal_id = f"{item['meal_type']}_{item['date_time']}"

    for food in item.get("foods", []):
        meal_foods.append({**food, "meal_id": meal_id})

now = datetime.now()
formatted_date = now.strftime("%Y-%m-%d_%H-%M-%S")
meal_filename = f"{TABLE_NAME}_{ENV}_{formatted_date}.csv"

with open(meal_filename, "w", newline="") as csvfile:
    writer = csv.DictWriter(csvfile, fieldnames=items[0].keys())
    writer.writeheader()
    writer.writerows(items)

print(f"Backup of table {TABLE_NAME} to {meal_filename} completed successfully.")

meal_foods_filename = f"{TABLE_NAME}_foods_{ENV}_{formatted_date}.csv"
with open(meal_foods_filename, "w", newline="") as csvfile:
    writer = csv.DictWriter(csvfile, fieldnames=meal_foods[0].keys())
    writer.writeheader()
    writer.writerows(meal_foods)

print(f"Backup of meal foods to {meal_foods_filename} completed successfully.")
