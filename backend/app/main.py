import json
import logging
import os
from typing import Annotated

from fastapi import FastAPI, Header
from mangum import Mangum
from shared.auth import get_user_id
import boto3
from botocore.exceptions import ClientError
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


@app.get("/")  # Needed for local system development
@app.get("", include_in_schema=False)  # Needed for API Gateway to function
async def root() -> str:
    return "Hello, world!!"


@app.get("/preferences")
async def pref(authorization: Annotated[str | None, Header()] = None) -> dict:
    user_id = get_user_id(authorization)

    try:
        prefs = MbdPreferences.get(user_id)
    except MbdPreferences.DoesNotExist:
        prefs = MbdPreferences(user_id=user_id)

    return prefs.to_simple_dict()
