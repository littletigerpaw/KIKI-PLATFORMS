from fastapi import APIRouter

from app import config

router = APIRouter(tags=["system"])


@router.get("/health")
def health_check() -> dict:
    return {"status": "ok", "service": "kiki-platform-api"}


@router.get("/billing/config")
def billing_config() -> dict:
    return {
        "service": "stripe",
        "configured": config.STRIPE_CONFIGURED,
        "mode": config.STRIPE_MODE,
        "publishable_key": config.STRIPE_PUBLISHABLE_KEY,
        "requires_onboarding": True,
    }


@router.get("/auth/config")
def auth_config() -> dict:
    return {
        "service": "firebase",
        "configured": config.FIREBASE_CONFIGURED,
        "mode": config.FIREBASE_MODE,
        "auth_mode": config.AUTH_MODE,
        "project_id": config.FIREBASE_PROJECT_ID,
        "requires_login": True,
    }
