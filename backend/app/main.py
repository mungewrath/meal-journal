from datetime import datetime, timedelta, timezone
import logging
import os
from typing import Annotated
import uuid
import traceback

from fastapi import FastAPI, Header, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from dto.food_create import FoodCreate
from dto.meal_create import MealCreate
from dto.preferences_update import PreferencesUpdate
from foods.food import MbdFood, MbdFoodList
from meals.meal import MbdMeal
from shared.auth import get_user_id
from preferences.preferences import MbdPreferences
from dotenv import load_dotenv

ENV = os.getenv("ENVIRONMENT")

if ENV is not None:
    load_dotenv(f".env.{ENV}")

logger = logging.getLogger()
logger.setLevel(logging.INFO)

app = FastAPI(root_path="/api/v1")

origins = os.getenv("CORS_ALLOWED_ORIGINS").split(",")
logger.info("CORS_ALLOWED_ORIGINS: %s", origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Used when API Gateway/lambda is deployed
handler = Mangum(app, lifespan="off", api_gateway_base_path="/api/v1")


# TODO: Generalize to open telemetry / ADOT
@app.middleware("http")
async def add_correlation_id(request: Request, call_next):
    # Check if the client sent a correlation ID; otherwise generate one
    correlation_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))
    # Store the correlation ID for downstream use (e.g., logging)
    request.state.correlation_id = correlation_id

    try:
        response = await call_next(request)
    except Exception as exc:
        response = JSONResponse(
            {
                "detail": "An internal server error occurred. Please contact your belly's diary maintainers"
            },
            status_code=500,
        )
        logger.error("Exception occurred: %s", traceback.format_exc())
        logger.error("[Correlation ID: %s]", correlation_id)

    response.headers["X-Correlation-ID"] = correlation_id
    return response


@app.get("/")  # Needed for local system development
@app.get("", include_in_schema=False)  # Needed for API Gateway to function
async def root() -> str:
    return "Hello, world!!"


@app.get("/preferences")
async def get_preferences(
    authorization: Annotated[str | None, Header()] = None,
) -> dict:
    user_id = get_user_id(authorization)

    try:
        prefs = MbdPreferences.get(user_id)
    except MbdPreferences.DoesNotExist:
        prefs = MbdPreferences(user_id=user_id)

    return prefs.to_dto()


@app.post("/preferences")
async def update_preferences(
    preferences: PreferencesUpdate,
    authorization: Annotated[str | None, Header()] = None,
) -> dict:
    user_id = get_user_id(authorization)

    try:
        prefs = MbdPreferences.get(user_id)
    except MbdPreferences.DoesNotExist:
        prefs = MbdPreferences(user_id=user_id)

    prefs.default_meal_times = preferences.defaultMealTimes
    prefs.use_thumbnails = preferences.useThumbnails
    prefs.save()

    return prefs.to_dto()


@app.post("/foods")
async def create_food(
    request: FoodCreate,
    authorization: Annotated[str | None, Header()] = None,
) -> dict:
    user_id = get_user_id(authorization)
    try:
        food_list = MbdFoodList.get(user_id)
    except MbdFoodList.DoesNotExist:
        food_list = MbdFoodList(user_id=user_id)

    food = MbdFood(
        food_id=request.id,
        name=request.name,
        thumbnail=request.thumbnail,
    )
    food_list.foods = list(
        filter((lambda f: f.food_id != food.food_id), food_list.foods)
    )
    food_list.foods.append(food)
    food_list.save()

    return food.to_dto()


@app.get("/foods/{food_id}")
async def get_food(
    food_id: str, authorization: Annotated[str | None, Header()] = None
) -> dict:
    food_list = MbdFoodList.get(get_user_id(authorization))
    food = next((f for f in food_list.foods if f.food_id == food_id), None)
    return food.to_dto()


@app.get("/foods")
async def get_foods(authorization: Annotated[str | None, Header()] = None) -> dict:
    food_list = MbdFoodList.get(get_user_id(authorization))
    return food_list.to_dto()


@app.post("/meals")
async def save_meal(
    request: MealCreate,
    authorization: Annotated[str | None, Header()] = None,
) -> dict:
    user_id = get_user_id(authorization)

    meal = MbdMeal(
        user_id=user_id,
        meal_type=request.meal_type,
        date_time=request.date_time,
        foods=[
            MbdFood(
                food_id=food.food_id,
                name=food.name,
                thumbnail=food.thumbnail,
            )
            for food in request.foods
        ],
    )
    meal.save()

    return meal.to_dto()


@app.get("/meals/history")
async def get_meal_history(
    days: int = 3,
    offset: int = 0,
    authorization: Annotated[str | None, Header()] = None,
) -> list[dict]:
    user_id = get_user_id(authorization)
    meals = MbdMeal.query(
        hash_key=user_id,
        range_key_condition=MbdMeal.date_time.between(
            datetime.now(timezone.utc) - timedelta(days=days + offset),
            datetime.now(timezone.utc) - timedelta(days=offset),
        ),
    )
    meals = sorted(meals, key=lambda meal: meal.date_time, reverse=True)
    return [meal.to_dto() for meal in meals]
