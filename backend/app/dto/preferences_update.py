from typing import List
from pydantic import BaseModel


class PreferencesUpdate(BaseModel):
    defaultMealTimes: List[str]
    useThumbnails: bool
