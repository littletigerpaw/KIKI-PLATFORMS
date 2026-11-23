from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import CurrentUser, authorize, get_current_user, merchant_ids_for, require_member
from app.database import get_db
from app.models import Product, Store, TeamMember
from app.schemas import ProductCreate, ProductOut, StoreScopedProductCreate
from app.services import get_store_for_merchant_or_404, product_out

router = APIRouter(tags=["products"])


def _create_product(db: Session, store: Store, payload: StoreScopedProductCreate) -> dict:
    product = Product(store_id=store.id, **payload.model_dump(exclude={"store_id"}))
    db.add(product)
    db.commit()
    db.refresh(product)
    return product_out(product, store.merchant_id)


@router.get("/merchants/{merchant_id}/products", response_model=list[ProductOut])
def list_merchant_products(merchant_id: str, _: TeamMember = Depends(require_member()), db: Session = Depends(get_db)):
    rows = db.query(Product).join(Store).filter(Store.merchant_id == merchant_id).all()
    return [product_out(p, merchant_id) for p in rows]


@router.get("/merchants/{merchant_id}/stores/{store_id}/products", response_model=list[ProductOut])
def list_store_products_for_merchant(
    merchant_id: str, store_id: str, _: TeamMember = Depends(require_member()), db: Session = Depends(get_db)
):
    store = get_store_for_merchant_or_404(db, merchant_id, store_id)
    return [product_out(p, merchant_id) for p in db.query(Product).filter(Product.store_id == store.id).all()]


@router.post("/merchants/{merchant_id}/stores/{store_id}/products", response_model=ProductOut, status_code=201)
def create_store_product_for_merchant(
    merchant_id: str, store_id: str, payload: StoreScopedProductCreate,
    _: TeamMember = Depends(require_member("manage_products")), db: Session = Depends(get_db),
):
    return _create_product(db, get_store_for_merchant_or_404(db, merchant_id, store_id), payload)


@router.post("/products", response_model=ProductOut, status_code=201)
def create_product(payload: ProductCreate, user: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)):
    """Older unscoped route; same permission check as the store-scoped one."""
    store = db.get(Store, payload.store_id)
    if store is None:
        raise HTTPException(status_code=404, detail="Store not found")
    authorize(db, user, store.merchant_id, "manage_products")
    return _create_product(db, store, payload)


@router.get("/products", response_model=list[ProductOut])
def list_my_products(user: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)):
    """Products across every merchant the caller belongs to."""
    ids = merchant_ids_for(db, user)
    if not ids:
        return []
    rows = db.query(Product, Store.merchant_id).join(Store).filter(Store.merchant_id.in_(ids)).all()
    return [product_out(p, merchant_id) for p, merchant_id in rows]
