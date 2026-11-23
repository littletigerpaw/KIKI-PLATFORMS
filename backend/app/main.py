from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import config
from app.routers import merchants, products, stores, system


def create_app() -> FastAPI:
    application = FastAPI(title="KIKI Merchant Platform API", version="0.3.0")
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


# Database tables are created and changed by Alembic migrations, not here.
# Run `npm run db:migrate` (or `alembic upgrade head` in backend/) before starting.
app = create_app()
