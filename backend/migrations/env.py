"""Alembic environment: uses the app's DATABASE_URL and models as the source of truth."""
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from app import models  # noqa: F401  (registers every table on Base.metadata)
from app.config import DATABASE_URL
from app.database import Base

config = context.config
config.set_main_option("sqlalchemy.url", DATABASE_URL.replace("%", "%%"))

if config.config_file_name is not None and config.attributes.get("configure_logger", True):
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def _options() -> dict:
    return {
        "target_metadata": target_metadata,
        # SQLite can't ALTER most things in place; batch mode rebuilds the table safely.
        "render_as_batch": DATABASE_URL.startswith("sqlite"),
        "compare_type": True,
    }


def run_migrations_offline() -> None:
    context.configure(url=DATABASE_URL, literal_binds=True, dialect_opts={"paramstyle": "named"}, **_options())
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = config.attributes.get("connection")
    if connectable is None:
        connectable = engine_from_config(config.get_section(config.config_ini_section, {}), prefix="sqlalchemy.", poolclass=pool.NullPool)
        with connectable.connect() as connection:
            context.configure(connection=connection, **_options())
            with context.begin_transaction():
                context.run_migrations()
    else:  # a connection handed in by tests
        context.configure(connection=connectable, **_options())
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
