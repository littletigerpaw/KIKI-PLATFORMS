from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

# Allowed values shared by the API and the dashboard dropdowns.
BusinessType = Literal["commerce", "dropshipping", "restaurant", "booking", "travel", "membership", "services", "digital"]
StoreStatus = Literal["draft", "live", "paused"]
Role = Literal["owner", "admin", "manager", "member"]
AppStatus = Literal["draft", "ready_for_preview", "live"]
MobilePlatform = Literal["android", "ios", "both"]
PublishStatus = Literal["draft", "ready_for_review", "live"]

EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
SLUG_PATTERN = r"^[a-z0-9]+(?:-[a-z0-9]+)*$"
DOMAIN_PATTERN = r"^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$"
HEX_COLOR_PATTERN = r"^#[0-9a-fA-F]{6}$"


class StrictModel(BaseModel):
    """Reject unknown fields and trim surrounding whitespace on every input."""

    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


def _lower(value: Optional[str]) -> Optional[str]:
    return value.lower() if isinstance(value, str) else value


def _blank_to_none(value: Optional[str]) -> Optional[str]:
    if isinstance(value, str) and not value.strip():
        return None
    return value.strip().lower() if isinstance(value, str) else value


# ---------- Merchants and team ----------

class MerchantCreate(StrictModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: str = Field(..., max_length=200, pattern=EMAIL_PATTERN)

    _normalize_email = field_validator("email", mode="before")(_lower)


class MerchantOut(BaseModel):
    id: str
    name: str
    email: str
    created_at: str


class TeamMemberCreate(StrictModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: str = Field(..., max_length=200, pattern=EMAIL_PATTERN)
    role: Role = "member"

    _normalize_email = field_validator("email", mode="before")(_lower)
    _normalize_role = field_validator("role", mode="before")(_lower)


class TeamMemberOut(BaseModel):
    id: str
    merchant_id: str
    name: str
    email: str
    role: str
    created_at: str


class PermissionsOut(BaseModel):
    merchant_id: str
    member_id: str
    name: str
    email: str
    role: str
    permissions: list[str]
    can_manage_store: bool
    can_manage_team: bool


class MembershipOut(BaseModel):
    merchant_id: str
    merchant_name: str
    role: str
    permissions: list[str]
    stores: list["StoreOut"]


class MeOut(BaseModel):
    uid: str
    email: str
    memberships: list[MembershipOut]


class MerchantSummaryOut(BaseModel):
    merchant: dict[str, str]
    store_count: int
    product_count: int
    team_member_count: int


# ---------- Stores ----------

class StoreCreate(StrictModel):
    merchant_id: str
    name: str = Field(..., min_length=2, max_length=120)
    slug: str = Field(..., min_length=2, max_length=63, pattern=SLUG_PATTERN)
    domain: Optional[str] = Field(default=None, max_length=253, pattern=DOMAIN_PATTERN)
    business_type: BusinessType = "commerce"

    _normalize_domain = field_validator("domain", mode="before")(_blank_to_none)


class StoreOut(BaseModel):
    id: str
    merchant_id: str
    name: str
    slug: str
    domain: Optional[str] = None
    status: str
    business_type: str


class StoreSettingsUpdate(StrictModel):
    status: Optional[StoreStatus] = None
    custom_domain: Optional[str] = Field(default=None, max_length=253, pattern=DOMAIN_PATTERN)
    business_type: Optional[BusinessType] = None

    _normalize_domain = field_validator("custom_domain", mode="before")(_blank_to_none)


class StoreSettingsOut(BaseModel):
    merchant_id: str
    store_id: str
    name: str
    slug: str
    status: str
    custom_domain: Optional[str] = None
    business_type: str


class BrandingUpdate(StrictModel):
    theme: Optional[str] = Field(default=None, min_length=2, max_length=40)
    accent_color: Optional[str] = Field(default=None, pattern=HEX_COLOR_PATTERN)
    app_status: Optional[AppStatus] = None


class BrandingOut(BaseModel):
    merchant_id: str
    store_id: str
    store_name: str
    theme: str
    accent_color: str
    app_status: str


class MobileAppUpdate(StrictModel):
    platform: Optional[MobilePlatform] = None
    publish_status: Optional[PublishStatus] = None

    _normalize_platform = field_validator("platform", mode="before")(_lower)


class MobileAppOut(BaseModel):
    merchant_id: str
    store_id: str
    store_name: str
    bundle_id: str
    platform: str
    publish_status: str


# ---------- Products ----------

class StoreScopedProductCreate(StrictModel):
    name: str = Field(..., min_length=2, max_length=180)
    description: Optional[str] = Field(default=None, max_length=500)
    price: float = Field(..., ge=0, le=1_000_000)
    inventory: int = Field(..., ge=0, le=10_000_000)
    is_active: bool = True


class ProductCreate(StoreScopedProductCreate):
    store_id: str


class ProductOut(BaseModel):
    id: str
    store_id: str
    merchant_id: str
    name: str
    description: Optional[str] = None
    price: float
    inventory: int
    is_active: bool


# ---------- Onboarding ----------

class OnboardingRequest(StrictModel):
    merchant_name: str = Field(..., min_length=2, max_length=120)
    merchant_email: str = Field(..., max_length=200, pattern=EMAIL_PATTERN)
    store_name: str = Field(..., min_length=2, max_length=120)
    store_slug: str = Field(..., min_length=2, max_length=63, pattern=SLUG_PATTERN)
    store_domain: Optional[str] = Field(default=None, max_length=253, pattern=DOMAIN_PATTERN)
    business_type: BusinessType

    _normalize_email = field_validator("merchant_email", mode="before")(_lower)
    _normalize_domain = field_validator("store_domain", mode="before")(_blank_to_none)


class OnboardingResponse(BaseModel):
    merchant: MerchantOut
    store: StoreOut
    owner: TeamMemberOut
    business_type: str


MembershipOut.model_rebuild()
