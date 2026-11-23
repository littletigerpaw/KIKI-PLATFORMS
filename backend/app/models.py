from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def new_id() -> str:
    return str(uuid4())


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Merchant(Base):
    __tablename__ = "merchants"

    id: Mapped[str] = mapped_column(String, primary_key=True, index=True, default=new_id)
    name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    stores: Mapped[list["Store"]] = relationship(back_populates="merchant", cascade="all, delete-orphan")
    team_members: Mapped[list["TeamMember"]] = relationship(back_populates="merchant", cascade="all, delete-orphan")


class TeamMember(Base):
    __tablename__ = "team_members"
    __table_args__ = (UniqueConstraint("merchant_id", "email", name="uq_team_members_merchant_email"),)

    id: Mapped[str] = mapped_column(String, primary_key=True, index=True, default=new_id)
    merchant_id: Mapped[str] = mapped_column(String, ForeignKey("merchants.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False, index=True)
    role: Mapped[str] = mapped_column(String, default="member", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    merchant: Mapped[Merchant] = relationship(back_populates="team_members")


class Store(Base):
    __tablename__ = "stores"

    id: Mapped[str] = mapped_column(String, primary_key=True, index=True, default=new_id)
    merchant_id: Mapped[str] = mapped_column(String, ForeignKey("merchants.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    slug: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    domain: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, default="draft", nullable=False)
    business_type: Mapped[str] = mapped_column(String, default="commerce", nullable=False)

    merchant: Mapped[Merchant] = relationship(back_populates="stores")
    products: Mapped[list["Product"]] = relationship(back_populates="store", cascade="all, delete-orphan")
    branding: Mapped[Optional["StoreBranding"]] = relationship(
        back_populates="store", uselist=False, cascade="all, delete-orphan"
    )
    mobile_app: Mapped[Optional["MobileAppConfig"]] = relationship(
        back_populates="store", uselist=False, cascade="all, delete-orphan"
    )


class Product(Base):
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(String, primary_key=True, index=True, default=new_id)
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    inventory: Mapped[int] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    store: Mapped[Store] = relationship(back_populates="products")


class StoreBranding(Base):
    """Saved storefront look. One row per store, created on first save."""

    __tablename__ = "store_branding"

    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"), primary_key=True)
    theme: Mapped[str] = mapped_column(String, default="minimal", nullable=False)
    accent_color: Mapped[str] = mapped_column(String, default="#4f46e5", nullable=False)
    app_status: Mapped[str] = mapped_column(String, default="draft", nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    store: Mapped[Store] = relationship(back_populates="branding")


class MobileAppConfig(Base):
    """Saved mobile app settings. One row per store, created on first save."""

    __tablename__ = "mobile_app_configs"

    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"), primary_key=True)
    platform: Mapped[str] = mapped_column(String, default="android", nullable=False)
    publish_status: Mapped[str] = mapped_column(String, default="draft", nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    store: Mapped[Store] = relationship(back_populates="mobile_app")
