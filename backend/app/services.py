"""Shared lookups and response shaping used by the routers.

Every merchant-owned lookup goes through these helpers so tenant scoping
(merchant -> store -> product) is enforced in one place.
"""
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models import MobileAppConfig, Merchant, Product, Store, StoreBranding, TeamMember

ROLE_PERMISSIONS: dict[str, dict] = {
    "owner": {
        "permissions": ["manage_store", "manage_team", "manage_products", "manage_orders", "manage_billing", "access_reports"],
        "can_manage_store": True,
        "can_manage_team": True,
    },
    "admin": {
        "permissions": ["manage_store", "manage_team", "manage_products", "manage_orders", "access_reports"],
        "can_manage_store": True,
        "can_manage_team": True,
    },
    "manager": {
        "permissions": ["manage_store", "manage_products", "manage_orders", "access_reports"],
        "can_manage_store": True,
        "can_manage_team": False,
    },
    "member": {
        "permissions": ["view_store", "view_reports"],
        "can_manage_store": False,
        "can_manage_team": False,
    },
}


# ---------- Tenant-scoped lookups ----------

def get_merchant_or_404(db: Session, merchant_id: str) -> Merchant:
    merchant = db.get(Merchant, merchant_id)
    if merchant is None:
        raise HTTPException(status_code=404, detail="Merchant not found")
    return merchant


def get_store_for_merchant_or_404(db: Session, merchant_id: str, store_id: str) -> Store:
    get_merchant_or_404(db, merchant_id)
    store = db.query(Store).filter(Store.id == store_id, Store.merchant_id == merchant_id).first()
    if store is None:
        raise HTTPException(status_code=404, detail="Store not found for this merchant")
    return store


def ensure_email_available(db: Session, email: str) -> None:
    if db.query(Merchant).filter(Merchant.email == email).first():
        raise HTTPException(status_code=409, detail="Merchant email already exists")


def ensure_slug_available(db: Session, slug: str) -> None:
    if db.query(Store).filter(Store.slug == slug).first():
        raise HTTPException(status_code=409, detail="Store slug already exists")


def get_or_create_branding(db: Session, store: Store) -> StoreBranding:
    if store.branding is None:
        store.branding = StoreBranding(store_id=store.id)
        db.add(store.branding)
    return store.branding


def get_or_create_mobile_app(db: Session, store: Store) -> MobileAppConfig:
    if store.mobile_app is None:
        store.mobile_app = MobileAppConfig(store_id=store.id)
        db.add(store.mobile_app)
    return store.mobile_app


# ---------- Response shaping ----------

def merchant_out(merchant: Merchant) -> dict:
    return {
        "id": merchant.id,
        "name": merchant.name,
        "email": merchant.email,
        "created_at": merchant.created_at.isoformat(),
    }


def team_member_out(member: TeamMember) -> dict:
    return {
        "id": member.id,
        "merchant_id": member.merchant_id,
        "name": member.name,
        "email": member.email,
        "role": member.role,
        "created_at": member.created_at.isoformat(),
    }


def store_out(store: Store) -> dict:
    return {
        "id": store.id,
        "merchant_id": store.merchant_id,
        "name": store.name,
        "slug": store.slug,
        "domain": store.domain,
        "status": store.status,
        "business_type": store.business_type,
    }


def store_settings_out(store: Store) -> dict:
    return {
        "merchant_id": store.merchant_id,
        "store_id": store.id,
        "name": store.name,
        "slug": store.slug,
        "status": store.status,
        "custom_domain": store.domain,
        "business_type": store.business_type,
    }


def branding_out(store: Store) -> dict:
    branding = store.branding or StoreBranding(theme="minimal", accent_color="#4f46e5", app_status="draft")
    return {
        "merchant_id": store.merchant_id,
        "store_id": store.id,
        "store_name": store.name,
        "theme": branding.theme,
        "accent_color": branding.accent_color,
        "app_status": branding.app_status,
    }


def mobile_app_out(store: Store) -> dict:
    config = store.mobile_app or MobileAppConfig(platform="android", publish_status="draft")
    return {
        "merchant_id": store.merchant_id,
        "store_id": store.id,
        "store_name": store.name,
        "bundle_id": f"com.merchant.{store.slug.replace('-', '')}",
        "platform": config.platform,
        "publish_status": config.publish_status,
    }


def product_out(product: Product, merchant_id: str) -> dict:
    return {
        "id": product.id,
        "store_id": product.store_id,
        "merchant_id": merchant_id,
        "name": product.name,
        "description": product.description,
        "price": product.price,
        "inventory": product.inventory,
        "is_active": product.is_active,
    }
