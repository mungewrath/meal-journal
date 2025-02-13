import logging
from typing import Annotated

from fastapi import FastAPI, HTTPException, Header, Request
from mangum import Mangum
import boto3
from shared.auth import decode_jwt

logger = logging.getLogger()
logger.setLevel(logging.INFO)

app = FastAPI(root_path="/api/v1")

DB_NAME = "mj_user_preferences"

# Used when API Gateway/lambda is deployed
handler = Mangum(app, lifespan="off", api_gateway_base_path="/api/v1")


@app.get("/")  # Needed for local system development
@app.get("", include_in_schema=False)  # Needed for API Gateway to function
async def root() -> str:
    return "Hello, world!!"


@app.get("/preferences")
async def pref(authorization: Annotated[str | None, Header()] = None) -> str:
    print(f"{authorization=}")

    d = decode_jwt(authorization.replace("Bearer ", ""))
    user_id = d["payload"]["sub"]

    return f"Your ID is {user_id}"
