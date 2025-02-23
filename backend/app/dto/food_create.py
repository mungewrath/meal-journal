from typing import Annotated
from pydantic import BaseModel, StringConstraints


class FoodCreate(BaseModel):
    id: Annotated[str, StringConstraints(min_length=36)]
    name: Annotated[str, StringConstraints(min_length=1)]
    thumbnail: Annotated[str, StringConstraints(min_length=1, max_length=1)]
