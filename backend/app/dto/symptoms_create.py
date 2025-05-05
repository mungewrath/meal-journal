from datetime import datetime
from typing import Annotated
from pydantic import BaseModel, StringConstraints


class SymptomsCreate(BaseModel):
    date_time: datetime
    symptoms: list[str]
