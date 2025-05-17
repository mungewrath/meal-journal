import json
import logging
import os
import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)
console_handler = logging.StreamHandler()
logger.addHandler(console_handler)

TABLE_NAME = "mbd_meals"
ENV = os.getenv("AWS_PROFILE")

logger.info(f"About to import meals into the table {TABLE_NAME}")

# Confirm we are in the right environment
confirm = input(f"Enter the environment name '{ENV}' to confirm: ")
if confirm != ENV:
    logger.error("Environment name does not match. Exiting.")
    exit(1)

client = boto3.client("dynamodb")
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(TABLE_NAME)

response = client.describe_table(TableName=TABLE_NAME)
item_count = response["Table"]["ItemCount"]
logger.info(
    f"Approximately {item_count} items in the table {TABLE_NAME} before import."
)

# Read the JSON file
with open("standardized_meals_unescaped.json", "r") as file:
    meals = json.load(file)
    logger.info(f"Loaded {len(meals)} meals from the JSON file.")

# Import data into the DynamoDB table
for meal in meals:
    table.put_item(Item=meal)

logger.info(f"Imported {len(meals)} meals into the table {TABLE_NAME}.")

response = client.describe_table(TableName=TABLE_NAME)
item_count = response["Table"]["ItemCount"]
logger.info(f"Approximately {item_count} items in the table {TABLE_NAME} after import.")
logger.info("Import completed successfully.")
