"""Guards that the migrations and the models never drift apart.

If test_migrations_match_models fails, you changed app/models.py without adding
a migration. Run:  npm run db:new -- "describe the change"
"""
import os
import tempfile
from pathlib import Path

from alembic import command
from alembic.autogenerate import compare_metadata
from alembic.config import Config
from alembic.migration import MigrationContext
from sqlalchemy import create_engine, inspect

from app.database import Base

ALEMBIC_INI = str(Path(__file__).with_name("alembic.ini"))


def _migrate(url: str, target: str = "head", down: bool = False) -> None:
    cfg = Config(ALEMBIC_INI)
    cfg.attributes["configure_logger"] = False
    engine = create_engine(url)
    with engine.begin() as connection:
        cfg.attributes["connection"] = connection
        (command.downgrade if down else command.upgrade)(cfg, target)
    engine.dispose()


def _fresh_url() -> str:
    return f"sqlite:///{os.path.join(tempfile.mkdtemp(prefix='kiki-mig-'), 'm.db')}"


def test_migrations_match_models():
    url = _fresh_url()
    _migrate(url)
    engine = create_engine(url)
    with engine.connect() as connection:
        diff = compare_metadata(MigrationContext.configure(connection, opts={"compare_type": True}), Base.metadata)
    engine.dispose()
    assert diff == [], f"Models changed without a migration: {diff}"


def test_migrations_can_roll_back_and_reapply():
    url = _fresh_url()
    _migrate(url)
    _migrate(url, "base", down=True)
    engine = create_engine(url)
    assert set(inspect(engine).get_table_names()) <= {"alembic_version"}
    engine.dispose()
    _migrate(url)
