from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import config
from app.database import Base, engine
from app.routers import merchants, products, stores, system


def create_app() -> FastAPI:
    application = FastAPI(title="KIKI Merchant Platform API", version="0.2.0")
    application.add_middleware(
        CORSMiddleware,
        allow_origins=config.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    for module in (system, merchants, stores, products):
        application.include_router(module.router)
    return application


# Creates any missing tables (e.g. store_branding, mobile_app_configs) on startup.
# Existing tables are not altered; switch to Alembic migrations with the Postgres move.
Base.metadata.create_all(bind=engine)

app = create_app()
