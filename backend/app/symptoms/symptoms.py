import os
import logging
from dotenv import load_dotenv
from pynamodb.models import Model
from pynamodb.attributes import (
    UnicodeAttribute,
    UTCDateTimeAttribute,
    ListAttribute,
    MapAttribute,
)

logger = logging.getLogger("uvicorn.error")
logger.setLevel(logging.INFO)

ENV = os.getenv("ENVIRONMENT")

if ENV is not None:
    logger.info("Loading environment: %s", ENV)
    load_dotenv(f".env.{ENV}")
else:
    logger.warning("Hmm... no ENV value set")

logger.info(f"{os.getenv('SYMPTOMS_DB_NAME')=}")


class MbdSymptomsEntry(Model):
    class Meta:
        table_name = os.getenv("SYMPTOMS_DB_NAME")
        region = "us-west-2"

    user_id = UnicodeAttribute(hash_key=True)
    date_time = UTCDateTimeAttribute(range_key=True)
    symptoms = ListAttribute(of=UnicodeAttribute, default=lambda: [])

    def to_dto(self) -> dict:
        return {
            "date_time": self.date_time.isoformat(),
            "symptoms": self.symptoms,
        }
