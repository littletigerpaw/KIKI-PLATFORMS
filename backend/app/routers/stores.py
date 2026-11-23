from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import CurrentUser, authorize, get_current_user, merchant_ids_for, require_member
from app.database import get_db
from app.models import Store, TeamMember
from app.schemas import (
    BrandingOut,
    BrandingUpdate,
    MobileAppOut,
    MobileAppUpdate,
    StoreCreate,
    StoreOut,
    StoreSettingsOut,
    StoreSettingsUpdate,
)
from app.services import (
    branding_out,
    ensure_slug_available,
    get_or_create_branding,
    get_or_create_mobile_app,
    get_store_for_merchant_or_404,
    mobile_app_out,
    store_out,
    store_settings_out,
)

router = APIRouter(tags=["stores"])

view_access = require_member()
manage_store = require_member("manage_store")


@router.post("/stores", response_model=StoreOut, status_code=201)
def create_store(payload: StoreCreate, user: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)):
    authorize(db, user, payload.merchant_id, "manage_store")
    ensure_slug_available(db, payload.slug)
    store = Store(
        merchant_id=payload.merchant_id,
        name=payload.name,
        slug=payload.slug,
        domain=payload.domain,
        status="draft",
        business_type=payload.business_type,
    )
    db.add(store)
    db.commit()
    db.refresh(store)
    return store_out(store)


@router.get("/stores", response_model=list[StoreOut])
def list_my_stores(user: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)):
    """Stores across every merchant the caller belongs to."""
    ids = merchant_ids_for(db, user)
    return [store_out(s) for s in db.query(Store).filter(Store.merchant_id.in_(ids)).all()] if ids else []


@router.get("/merchants/{merchant_id}/stores", response_model=list[StoreOut])
def list_merchant_stores(merchant_id: str, _: TeamMember = Depends(view_access), db: Session = Depends(get_db)):
    return [store_out(s) for s in db.query(Store).filter(Store.merchant_id == merchant_id).all()]


@router.get("/merchants/{merchant_id}/stores/{store_id}/settings", response_model=StoreSettingsOut)
def get_store_settings(merchant_id: str, store_id: str, _: TeamMember = Depends(view_access), db: Session = Depends(get_db)):
    return store_settings_out(get_store_for_merchant_or_404(db, merchant_id, store_id))


@router.patch("/merchants/{merchant_id}/stores/{store_id}/settings", response_model=StoreSettingsOut)
def update_store_settings(
    merchant_id: str, store_id: str, payload: StoreSettingsUpdate,
    _: TeamMember = Depends(manage_store), db: Session = Depends(get_db),
):
    store = get_store_for_merchant_or_404(db, merchant_id, store_id)
    changes = payload.model_dump(exclude_unset=True)
    if changes.get("status") is not None:
        store.status = changes["status"]
    if "custom_domain" in changes:
        store.domain = changes["custom_domain"]  # None clears the domain
    if changes.get("business_type") is not None:
        store.business_type = changes["business_type"]
    db.commit()
    db.refresh(store)
    return store_settings_out(store)


@router.get("/merchants/{merchant_id}/stores/{store_id}/branding", response_model=BrandingOut)
def get_store_branding(merchant_id: str, store_id: str, _: TeamMember = Depends(view_access), db: Session = Depends(get_db)):
    return branding_out(get_store_for_merchant_or_404(db, merchant_id, store_id))


@router.patch("/merchants/{merchant_id}/stores/{store_id}/branding", response_model=BrandingOut)
def update_store_branding(
    merchant_id: str, store_id: str, payload: BrandingUpdate,
    _: TeamMember = Depends(manage_store), db: Session = Depends(get_db),
):
    store = get_store_for_merchant_or_404(db, merchant_id, store_id)
    branding = get_or_create_branding(db, store)
    for field, value in payload.model_dump(exclude_unset=True, exclude_none=True).items():
        setattr(branding, field, value)
    db.commit()
    db.refresh(store)
    return branding_out(store)


@router.get("/merchants/{merchant_id}/stores/{store_id}/mobile-app", response_model=MobileAppOut)
def get_mobile_app_config(merchant_id: str, store_id: str, _: TeamMember = Depends(view_access), db: Session = Depends(get_db)):
    return mobile_app_out(get_store_for_merchant_or_404(db, merchant_id, store_id))


@router.patch("/merchants/{merchant_id}/stores/{store_id}/mobile-app", response_model=MobileAppOut)
def update_mobile_app_config(
    merchant_id: str, store_id: str, payload: MobileAppUpdate,
    _: TeamMember = Depends(manage_store), db: Session = Depends(get_db),
):
    store = get_store_for_merchant_or_404(db, merchant_id, store_id)
    config = get_or_create_mobile_app(db, store)
    for field, value in payload.model_dump(exclude_unset=True, exclude_none=True).items():
        setattr(config, field, value)
    db.commit()
    db.refresh(store)
    return mobile_app_out(store)
