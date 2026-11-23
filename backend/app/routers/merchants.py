from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import CurrentUser, get_current_user, member_permissions, merchant_ids_for, require_member
from app.database import get_db
from app.models import Merchant, Product, Store, TeamMember
from app.schemas import (
    MeOut,
    MerchantCreate,
    MerchantOut,
    MerchantSummaryOut,
    OnboardingRequest,
    OnboardingResponse,
    PermissionsOut,
    TeamMemberCreate,
    TeamMemberOut,
)
from app.services import (
    ROLE_PERMISSIONS,
    ensure_email_available,
    ensure_slug_available,
    merchant_out,
    store_out,
    team_member_out,
)

router = APIRouter(tags=["merchants"])


@router.get("/me", response_model=MeOut)
def me(user: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)):
    """The signed-in user and every merchant workspace they belong to."""
    rows = (
        db.query(TeamMember, Merchant)
        .join(Merchant, Merchant.id == TeamMember.merchant_id)
        .filter(TeamMember.email == user.email)
        .order_by(TeamMember.created_at)
        .all()
    )
    memberships = []
    for member, merchant in rows:
        stores = db.query(Store).filter(Store.merchant_id == merchant.id).all()
        memberships.append({
            "merchant_id": merchant.id,
            "merchant_name": merchant.name,
            "role": member.role,
            "permissions": member_permissions(member),
            "stores": [store_out(s) for s in stores],
        })
    return {"uid": user.uid, "email": user.email, "memberships": memberships}


def _add_owner(merchant: Merchant, user: CurrentUser) -> TeamMember:
    return TeamMember(merchant=merchant, name=merchant.name, email=user.email, role="owner")


@router.post("/merchants", response_model=MerchantOut, status_code=201)
def create_merchant(payload: MerchantCreate, user: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)):
    """Create a merchant. The caller becomes its owner."""
    ensure_email_available(db, payload.email)
    merchant = Merchant(name=payload.name, email=payload.email)
    db.add_all([merchant, _add_owner(merchant, user)])
    db.commit()
    db.refresh(merchant)
    return merchant_out(merchant)


@router.get("/merchants", response_model=list[MerchantOut])
def list_my_merchants(user: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)):
    """Only the merchants the caller belongs to."""
    ids = merchant_ids_for(db, user)
    rows = db.query(Merchant).filter(Merchant.id.in_(ids)).order_by(Merchant.created_at).all() if ids else []
    return [merchant_out(m) for m in rows]


@router.post("/onboarding", response_model=OnboardingResponse, status_code=201)
def merchant_onboarding(payload: OnboardingRequest, user: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)):
    """Create merchant, first store and the caller's owner membership in one transaction.

    merchant_email is the business contact address; the owner is whoever is signed in.
    """
    ensure_email_available(db, payload.merchant_email)
    ensure_slug_available(db, payload.store_slug)

    merchant = Merchant(name=payload.merchant_name, email=payload.merchant_email)
    store = Store(
        merchant=merchant,
        name=payload.store_name,
        slug=payload.store_slug,
        domain=payload.store_domain,
        status="draft",
        business_type=payload.business_type,
    )
    owner = _add_owner(merchant, user)
    db.add_all([merchant, store, owner])
    db.commit()
    for row in (merchant, store, owner):
        db.refresh(row)

    return {
        "merchant": merchant_out(merchant),
        "store": store_out(store),
        "owner": team_member_out(owner),
        "business_type": store.business_type,
    }


@router.get("/merchants/{merchant_id}/summary", response_model=MerchantSummaryOut)
def merchant_summary(merchant_id: str, _: TeamMember = Depends(require_member()), db: Session = Depends(get_db)):
    merchant = db.get(Merchant, merchant_id)
    store_ids = [s.id for s in db.query(Store.id).filter(Store.merchant_id == merchant_id)]
    product_count = db.query(Product).filter(Product.store_id.in_(store_ids)).count() if store_ids else 0
    team_member_count = db.query(TeamMember).filter(TeamMember.merchant_id == merchant_id).count()
    return {
        "merchant": {"id": merchant.id, "name": merchant.name, "email": merchant.email},
        "store_count": len(store_ids),
        "product_count": product_count,
        "team_member_count": team_member_count,
    }


@router.post("/merchants/{merchant_id}/team-members", response_model=TeamMemberOut, status_code=201)
def create_team_member(
    merchant_id: str,
    payload: TeamMemberCreate,
    caller: TeamMember = Depends(require_member("manage_team")),
    db: Session = Depends(get_db),
):
    if payload.role == "owner" and caller.role != "owner":
        raise HTTPException(status_code=403, detail="Only an owner can add another owner.")
    exists = db.query(TeamMember).filter(TeamMember.merchant_id == merchant_id, TeamMember.email == payload.email).first()
    if exists:
        raise HTTPException(status_code=409, detail="Team member already exists for this merchant")

    member = TeamMember(merchant_id=merchant_id, name=payload.name, email=payload.email, role=payload.role)
    db.add(member)
    db.commit()
    db.refresh(member)
    return team_member_out(member)


@router.get("/merchants/{merchant_id}/team-members", response_model=list[TeamMemberOut])
def list_team_members(merchant_id: str, _: TeamMember = Depends(require_member()), db: Session = Depends(get_db)):
    members = db.query(TeamMember).filter(TeamMember.merchant_id == merchant_id).order_by(TeamMember.created_at).all()
    return [team_member_out(m) for m in members]


@router.get("/merchants/{merchant_id}/team-members/{member_id}/permissions", response_model=PermissionsOut)
def get_team_member_permissions(
    merchant_id: str, member_id: str, _: TeamMember = Depends(require_member()), db: Session = Depends(get_db)
):
    member = db.query(TeamMember).filter(TeamMember.merchant_id == merchant_id, TeamMember.id == member_id).first()
    if member is None:
        raise HTTPException(status_code=404, detail="Team member not found")

    scope = ROLE_PERMISSIONS.get(member.role, ROLE_PERMISSIONS["member"])
    return {
        "merchant_id": merchant_id,
        "member_id": member_id,
        "name": member.name,
        "email": member.email,
        "role": member.role,
        "permissions": scope["permissions"],
        "can_manage_store": scope["can_manage_store"],
        "can_manage_team": scope["can_manage_team"],
    }
