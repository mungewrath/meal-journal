import os
from unittest.mock import patch
import pytest
from fastapi.testclient import TestClient

os.environ["CORS_ALLOWED_ORIGINS"] = "http://localhost:3000"

from app.main import app


@pytest.fixture
def client():
    """
    Create a test client for the FastAPI application.
    """
    return TestClient(app)


@pytest.fixture
def mock_get_user_id():
    with patch("app.main.get_user_id") as mock:
        mock.return_value = "test-user"
        yield mock


@pytest.fixture
def mock_aws_credentials():
    """
    Mock AWS credentials for testing.
    """
    os.environ["AWS_ACCESS_KEY_ID"] = "testing"
    os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
    os.environ["AWS_SECURITY_TOKEN"] = "testing"
    os.environ["AWS_SESSION_TOKEN"] = "testing"
    os.environ["AWS_DEFAULT_REGION"] = "us-east-1"
    yield
    # Clean up
    os.environ.pop("AWS_ACCESS_KEY_ID", None)
    os.environ.pop("AWS_SECRET_ACCESS_KEY", None)
    os.environ.pop("AWS_SECURITY_TOKEN", None)
    os.environ.pop("AWS_SESSION_TOKEN", None)
    os.environ.pop("AWS_DEFAULT_REGION", None)
