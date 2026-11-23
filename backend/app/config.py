"""Central place for environment-driven settings."""
import os

from dotenv import load_dotenv

load_dotenv()


def _csv(name: str, default: str) -> list[str]:
    return [item.strip() for item in os.getenv(name, default).split(",") if item.strip()]


DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./kiki.db")
CORS_ORIGINS = _csv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")

STRIPE_MODE = os.getenv("STRIPE_MODE", "test")
STRIPE_PUBLISHABLE_KEY = os.getenv("STRIPE_PUBLISHABLE_KEY", "pk_test_placeholder")
STRIPE_CONFIGURED = bool(os.getenv("STRIPE_SECRET_KEY"))

FIREBASE_MODE = os.getenv("FIREBASE_MODE", "test")
FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "demo-kiki-project")
FIREBASE_CONFIGURED = bool(os.getenv("FIREBASE_CLIENT_EMAIL") and os.getenv("FIREBASE_PRIVATE_KEY"))

# APP_ENV: "development" (default) or "production".
APP_ENV = os.getenv("APP_ENV", "development").lower()

# AUTH_MODE: "firebase" verifies real Firebase ID tokens.
#            "dev" accepts "dev:<email>" tokens so the app can be built without Firebase keys.
# Defaults to firebase when a real project id is set, otherwise dev.
_has_real_firebase_project = bool(os.getenv("FIREBASE_PROJECT_ID")) and FIREBASE_PROJECT_ID != "demo-kiki-project"
AUTH_MODE = (os.getenv("AUTH_MODE") or ("firebase" if _has_real_firebase_project else "dev")).lower()

if AUTH_MODE not in ("dev", "firebase"):
    raise RuntimeError(f"AUTH_MODE must be 'dev' or 'firebase', got {AUTH_MODE!r}")
if AUTH_MODE == "dev" and APP_ENV == "production":
    raise RuntimeError("AUTH_MODE=dev lets anyone sign in as any email and must never run in production.")
