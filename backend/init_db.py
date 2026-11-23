"""Bring the database up to the latest schema. Same as `alembic upgrade head`."""
from pathlib import Path

from alembic import command
from alembic.config import Config

command.upgrade(Config(str(Path(__file__).with_name("alembic.ini"))), "head")
print("Database is up to date.")
