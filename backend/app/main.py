import logging
import os
from typing import Annotated
import uuid
import traceback

from fastapi import FastAPI, Header, Request
from fastapi.responses import JSONResponse
from mangum import Mangum
from dto.preferences_update import PreferencesUpdate
from shared.auth import get_user_id
from preferences.preferences import MbdPreferences
from dotenv import load_dotenv

ENV = os.getenv("ENVIRONMENT")

if ENV is not None:
    load_dotenv(f".env.{ENV}")

logger = logging.getLogger()
logger.setLevel(logging.INFO)

app = FastAPI(root_path="/api/v1")

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
    authorization: Annotated[str | None, Header()] = None
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
