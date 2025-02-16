import datetime
from typing import Annotated, List
from pydantic import BaseModel, field_validator, validator
from datetime import datetime


class PreferencesUpdate(BaseModel):
    defaultMealTimes: List[str]
    useThumbnails: bool

    @field_validator("defaultMealTimes", mode="before")
    @classmethod
    def validate_time_format(cls, value):
        if not isinstance(value, list):
            raise ValueError("times must be a list")

        invalid_times = []
        for time in value:
            try:
                # Validate the time string using strptime
                datetime.strptime(time, "%H:%M")
            except ValueError:
                invalid_times.append(time)

        if invalid_times:
            raise ValueError(
                f"Invalid time formats: {invalid_times}. Must be in 'hh:MM' 24-hour format."
            )

        return value
