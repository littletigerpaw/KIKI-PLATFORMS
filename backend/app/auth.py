"""Who is calling, and what may they do?

Authentication: every protected request sends `Authorization: Bearer <token>`.
  - firebase mode: <token> is a Firebase ID token, verified with firebase-admin.
  - dev mode:      <token> is "dev:<email>". Local development only; config.py
                   refuses to start with dev mode when APP_ENV=production.

Authorization: a user may act on a merchant only through a TeamMember row
(matched by verified email) for that merchant. The member's role decides which
actions are allowed (see services.ROLE_PERMISSIONS).
"""
import logging
from dataclasses import dataclass
from typing import Callable, Optional

from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app import config
from app.database import get_db
from app.models import TeamMember
from app.services import ROLE_PERMISSIONS, get_merchant_or_404

logger = logging.getLogger("kiki.auth")
DEV_TOKEN_PREFIX = "dev:"


@dataclass(frozen=True)
class CurrentUser:
    uid: str
    email: str


def _unauthorized(detail: str) -> HTTPException:
    return HTTPException(status_code=401, detail=detail, headers={"WWW-Authenticate": "Bearer"})


def _verify_dev_token(token: str) -> CurrentUser:
    if not token.startswith(DEV_TOKEN_PREFIX):
        raise _unauthorized("Invalid dev token. Expected 'dev:<email>'.")
    email = token[len(DEV_TOKEN_PREFIX):].strip().lower()
    if "@" not in email or len(email) > 200:
        raise _unauthorized("Invalid dev token email.")
    return CurrentUser(uid=f"dev-{email}", email=email)


_firebase_app = None


def _verify_firebase_token(token: str) -> CurrentUser:
    global _firebase_app
    import firebase_admin
    from firebase_admin import auth as firebase_auth

    if _firebase_app is None:
        _firebase_app = firebase_admin.initialize_app(options={"projectId": config.FIREBASE_PROJECT_ID})
    try:
        claims = firebase_auth.verify_id_token(token, app=_firebase_app)
    except Exception as exc:  # expired, revoked, wrong project, malformed...
        logger.info("Rejected Firebase token: %s", exc)
        raise _unauthorized("Your session has expired or is invalid. Please sign in again.") from exc

    email = (claims.get("email") or "").lower()
    if not email:
        raise _unauthorized("This account has no email address.")
    if not claims.get("email_verified"):
        # Team access is matched by email, so it must be proven.
        raise HTTPException(status_code=403, detail="Please verify your email address before continuing.")
    return CurrentUser(uid=claims["uid"], email=email)


def get_current_user(authorization: Optional[str] = Header(default=None)) -> CurrentUser:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise _unauthorized("Sign in required.")
    token = authorization[7:].strip()
    if config.AUTH_MODE == "firebase":
        return _verify_firebase_token(token)
    return _verify_dev_token(token)


def member_permissions(member: TeamMember) -> list[str]:
    return ROLE_PERMISSIONS.get(member.role, ROLE_PERMISSIONS["member"])["permissions"]


def authorize(db: Session, user: CurrentUser, merchant_id: str, permission: Optional[str] = None) -> TeamMember:
    """Return the caller's membership for this merchant, or stop the request.

    Non-members get 404 (not 403) so merchant IDs can't be probed.
    """
    get_merchant_or_404(db, merchant_id)
    member = (
        db.query(TeamMember)
        .filter(TeamMember.merchant_id == merchant_id, TeamMember.email == user.email)
        .first()
    )
    if member is None:
        raise HTTPException(status_code=404, detail="Merchant not found")
    if permission and permission not in member_permissions(member):
        raise HTTPException(status_code=403, detail=f"Your role ({member.role}) does not allow this action.")
    return member


def require_member(permission: Optional[str] = None) -> Callable[..., TeamMember]:
    """Route dependency for paths containing {merchant_id}."""

    def dependency(
        merchant_id: str,
        user: CurrentUser = Depends(get_current_user),
        db: Session = Depends(get_db),
    ) -> TeamMember:
        return authorize(db, user, merchant_id, permission)

    return dependency


def merchant_ids_for(db: Session, user: CurrentUser) -> list[str]:
    return [row.merchant_id for row in db.query(TeamMember.merchant_id).filter(TeamMember.email == user.email)]
