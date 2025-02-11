import logging

from fastapi import FastAPI
from mangum import Mangum

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
async def pref() -> str:
    return "Preferential"
