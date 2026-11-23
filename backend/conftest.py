"""Test setup: every test runs against a fresh, throwaway SQLite database
built by the Alembic migrations, exactly as a real deployment would be.

DATABASE_URL is set before the app is imported, so tests never touch kiki.db.
"""
import os
import tempfile
from pathlib import Path

_tmp_dir = tempfile.mkdtemp(prefix="kiki-test-")
os.environ["DATABASE_URL"] = f"sqlite:///{os.path.join(_tmp_dir, 'test.db')}"
os.environ["AUTH_MODE"] = "dev"
os.environ["APP_ENV"] = "development"

import pytest  # noqa: E402
from alembic import command  # noqa: E402
from alembic.config import Config  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import MetaData  # noqa: E402

from app.database import engine  # noqa: E402
from app.main import app  # noqa: E402

_ALEMBIC_INI = str(Path(__file__).with_name("alembic.ini"))


def _rebuild_database() -> None:
    existing = MetaData()
    existing.reflect(bind=engine)
    existing.drop_all(bind=engine)  # includes alembic_version

    cfg = Config(_ALEMBIC_INI)
    cfg.attributes["configure_logger"] = False
    with engine.begin() as connection:
        cfg.attributes["connection"] = connection
        command.upgrade(cfg, "head")


@pytest.fixture()
def client():
    _rebuild_database()
    with TestClient(app) as test_client:
        yield test_client
