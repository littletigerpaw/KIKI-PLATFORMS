"""Test setup: every test runs against a fresh, throwaway SQLite database.

DATABASE_URL is set before the app is imported, so tests never touch kiki.db.
"""
import os
import tempfile

_tmp_dir = tempfile.mkdtemp(prefix="kiki-test-")
os.environ["DATABASE_URL"] = f"sqlite:///{os.path.join(_tmp_dir, 'test.db')}"
os.environ["AUTH_MODE"] = "dev"
os.environ["APP_ENV"] = "development"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.database import Base, engine  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture()
def client():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as test_client:
        yield test_client
