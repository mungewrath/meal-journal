import base64
import json

from shared.exceptions import MbdException


def get_user_id(auth_token: str) -> str:
    if not auth_token:
        raise MbdException(status_code=401, errors=["Authorization header is required"])

    d = decode_jwt(auth_token.replace("Bearer ", ""))
    return d["payload"]["sub"]


def decode_base64_url(data: str) -> bytes:
    """
    Decodes Base64-URL encoded strings (used in JWT) to raw bytes.
    Handles missing padding if the input string length is not a multiple of 4.
    """
    # Add back the required padding if it's missing
    padding_needed = len(data) % 4
    if padding_needed:
        data += "=" * (4 - padding_needed)
    return base64.urlsafe_b64decode(data)


def decode_jwt(jwt: str) -> dict:
    """
    Decodes the header and payload of a JWT without verifying the signature.
    """
    # JWT format: [header].[payload].[signature]
    parts = jwt.split(".")
    if len(parts) != 3:
        raise ValueError("Invalid JWT format. Expecting header.payload.signature")

    # Decode header and payload (signature is not decoded here)
    header = json.loads(decode_base64_url(parts[0]).decode("utf-8"))
    payload = json.loads(decode_base64_url(parts[1]).decode("utf-8"))

    return {
        "header": header,
        "payload": payload,
        "signature": parts[2],  # Include the signature as-is (optional)
    }
