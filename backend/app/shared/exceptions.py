from typing import List

from fastapi import HTTPException


class MbdException(HTTPException):
    """Standardized error format for MBD.
    Unhandled exceptions will be treated as 500 by default."""

    def __init__(self, status_code: int, errors: List[str] = None, headers=None):
        super().__init__(status_code, detail=errors, headers=headers)
