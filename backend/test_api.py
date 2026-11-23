"""API tests. The `client` fixture (conftest.py) gives each test an empty database.

Requests are signed in with dev tokens ("dev:<email>"), the same way the
frontend's local sign-in works.
"""
from app.database import SessionLocal
from app.models import Merchant as MerchantModel

OWNER = "owner@merchant.com"


# ---------- helpers ----------

def auth(email=OWNER):
    return {"Authorization": f"Bearer dev:{email}"}


def make_merchant(client, name="Test Merchant", email="test@merchant.com", as_user=OWNER):
    response = client.post("/merchants", json={"name": name, "email": email}, headers=auth(as_user))
    assert response.status_code == 201, response.text
    return response.json()["id"]


def make_store(client, merchant_id, slug="test-store", domain=None, as_user=OWNER):
    body = {"merchant_id": merchant_id, "name": "Test Store", "slug": slug}
    if domain:
        body["domain"] = domain
    response = client.post("/stores", json=body, headers=auth(as_user))
    assert response.status_code == 201, response.text
    return response.json()["id"]


def add_member(client, merchant_id, email, role, as_user=OWNER):
    response = client.post(
        f"/merchants/{merchant_id}/team-members",
        json={"name": "Team Person", "email": email, "role": role},
        headers=auth(as_user),
    )
    assert response.status_code == 201, response.text
    return response.json()["id"]


PRODUCT = {"name": "Classic Tote", "description": "A simple premium tote", "price": 128.0, "inventory": 25, "is_active": True}
ONBOARDING = {
    "merchant_name": "North Shore Tours",
    "merchant_email": "hello@northshoretours.com",
    "store_name": "North Shore Tours Co.",
    "store_slug": "north-shore-tours",
    "store_domain": "northshoretours.com",
    "business_type": "travel",
}


# ---------- system (public) ----------

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_billing_config_endpoint_reports_status(client):
    payload = client.get("/billing/config").json()
    assert payload["service"] == "stripe"
    assert "configured" in payload


def test_auth_config_endpoint_reports_status(client):
    payload = client.get("/auth/config").json()
    assert payload["service"] == "firebase"
    assert payload["auth_mode"] == "dev"


# ---------- sign-in ----------

def test_protected_routes_require_sign_in(client):
    merchant_id = make_merchant(client)
    store_id = make_store(client, merchant_id)
    for method, url in [
        ("get", "/me"),
        ("get", "/merchants"),
        ("get", "/stores"),
        ("get", "/products"),
        ("get", f"/merchants/{merchant_id}/summary"),
        ("get", f"/merchants/{merchant_id}/stores/{store_id}/settings"),
        ("post", "/onboarding"),
        ("post", "/merchants"),
    ]:
        response = getattr(client, method)(url)
        assert response.status_code == 401, f"{method} {url} -> {response.status_code}"


def test_bad_tokens_are_rejected(client):
    assert client.get("/me", headers={"Authorization": "Bearer not-a-dev-token"}).status_code == 401
    assert client.get("/me", headers={"Authorization": "Bearer dev:no-at-sign"}).status_code == 401
    assert client.get("/me", headers={"Authorization": "Basic abc"}).status_code == 401


def test_me_lists_only_my_workspaces(client):
    assert client.get("/me", headers=auth("new@person.com")).json() == {
        "uid": "dev-new@person.com", "email": "new@person.com", "memberships": [],
    }

    merchant_id = make_merchant(client)
    store_id = make_store(client, merchant_id)
    me = client.get("/me", headers=auth(OWNER.upper())).json()  # email match is case-insensitive
    assert len(me["memberships"]) == 1
    membership = me["memberships"][0]
    assert membership["merchant_id"] == merchant_id
    assert membership["role"] == "owner"
    assert "manage_billing" in membership["permissions"]
    assert [s["id"] for s in membership["stores"]] == [store_id]


def test_list_endpoints_only_show_my_data(client):
    mine = make_merchant(client, "Mine", "mine@shop.com", as_user="alice@a.com")
    mine_store = make_store(client, mine, slug="mine", as_user="alice@a.com")
    client.post(f"/merchants/{mine}/stores/{mine_store}/products", json=PRODUCT, headers=auth("alice@a.com"))

    theirs = make_merchant(client, "Theirs", "theirs@shop.com", as_user="bob@b.com")
    make_store(client, theirs, slug="theirs", as_user="bob@b.com")

    alice = auth("alice@a.com")
    assert [m["id"] for m in client.get("/merchants", headers=alice).json()] == [mine]
    assert [s["slug"] for s in client.get("/stores", headers=alice).json()] == ["mine"]
    assert len(client.get("/products", headers=alice).json()) == 1
    assert client.get("/products", headers=auth("bob@b.com")).json() == []


# ---------- merchants ----------

def test_create_merchant_persists_and_makes_caller_owner(client):
    merchant_id = make_merchant(client, "Persistent Merchant", "persistent@merchant.com")
    db = SessionLocal()
    merchant = db.query(MerchantModel).filter(MerchantModel.email == "persistent@merchant.com").first()
    db.close()
    assert merchant is not None and merchant.name == "Persistent Merchant"

    members = client.get(f"/merchants/{merchant_id}/team-members", headers=auth()).json()
    assert [(m["email"], m["role"]) for m in members] == [(OWNER, "owner")]


def test_merchant_email_is_normalized_and_unique_case_insensitively(client):
    response = client.post("/merchants", json={"name": "Case Co", "email": "  Hello@CaseCo.com "}, headers=auth())
    assert response.status_code == 201
    assert response.json()["email"] == "hello@caseco.com"

    duplicate = client.post("/merchants", json={"name": "Case Co Again", "email": "HELLO@caseco.com"}, headers=auth())
    assert duplicate.status_code == 409


def test_invalid_merchant_email_is_rejected(client):
    assert client.post("/merchants", json={"name": "Bad Email", "email": "not-an-email"}, headers=auth()).status_code == 422


def test_unknown_fields_are_rejected(client):
    response = client.post("/merchants", json={"name": "Extra", "email": "x@extra.com", "is_admin": True}, headers=auth())
    assert response.status_code == 422


# ---------- onboarding ----------

def test_onboarding_creates_merchant_store_and_signed_in_owner(client):
    response = client.post("/onboarding", json=ONBOARDING, headers=auth("founder@gmail.com"))
    assert response.status_code == 201, response.text
    payload = response.json()
    assert payload["merchant"]["email"] == "hello@northshoretours.com"
    assert payload["store"]["slug"] == "north-shore-tours"
    assert payload["business_type"] == "travel"
    # The owner is whoever signed in, not the business contact email.
    assert payload["owner"]["email"] == "founder@gmail.com"
    assert payload["owner"]["role"] == "owner"

    me = client.get("/me", headers=auth("founder@gmail.com")).json()
    assert me["memberships"][0]["merchant_id"] == payload["merchant"]["id"]


def test_onboarding_with_blank_domain_and_bad_type(client):
    base = {**ONBOARDING, "merchant_email": "blank@domain.com", "store_slug": "blank-store", "store_domain": ""}
    assert client.post("/onboarding", json={**base, "business_type": "spaceships"}, headers=auth()).status_code == 422

    ok = client.post("/onboarding", json={**base, "business_type": "dropshipping"}, headers=auth())
    assert ok.status_code == 201, ok.text
    assert ok.json()["store"]["domain"] is None


def test_onboarding_rejects_taken_slug(client):
    merchant_id = make_merchant(client)
    make_store(client, merchant_id, slug="taken")
    response = client.post("/onboarding", json={**ONBOARDING, "store_slug": "taken"}, headers=auth("late@co.com"))
    assert response.status_code == 409


# ---------- stores ----------

def test_create_merchant_and_store(client):
    merchant_id = make_merchant(client, "Nova Atelier", "hello@novaatelier.com")
    response = client.post("/stores", json={
        "merchant_id": merchant_id, "name": "Nova Atelier Store", "slug": "nova-atelier", "domain": "novaatelier.com",
    }, headers=auth())
    assert response.status_code == 201
    assert response.json()["slug"] == "nova-atelier"


def test_cannot_create_store_for_someone_elses_merchant(client):
    merchant_id = make_merchant(client)
    response = client.post("/stores", json={"merchant_id": merchant_id, "name": "Squatter", "slug": "squatter"},
                           headers=auth("stranger@evil.com"))
    assert response.status_code == 404


def test_invalid_slug_is_rejected(client):
    merchant_id = make_merchant(client)
    for slug in ["Has Caps", "trailing-", "double--dash", "a"]:
        response = client.post("/stores", json={"merchant_id": merchant_id, "name": "Bad Slug", "slug": slug}, headers=auth())
        assert response.status_code == 422, slug


def test_store_settings_and_custom_domain_are_configurable(client):
    merchant_id = make_merchant(client)
    store_id = make_store(client, merchant_id, slug="domain-store", domain="example.com")
    url = f"/merchants/{merchant_id}/stores/{store_id}/settings"

    payload = client.get(url, headers=auth()).json()
    assert payload["merchant_id"] == merchant_id
    assert payload["custom_domain"] == "example.com"

    updated = client.patch(url, json={"status": "live", "custom_domain": "Shop.DomainMerchant.com"}, headers=auth())
    assert updated.status_code == 200, updated.text
    assert updated.json()["status"] == "live"
    assert updated.json()["custom_domain"] == "shop.domainmerchant.com"

    cleared = client.patch(url, json={"custom_domain": ""}, headers=auth())
    assert cleared.json()["custom_domain"] is None
    assert cleared.json()["status"] == "live"  # untouched fields stay as they were


def test_store_settings_reject_invalid_values(client):
    merchant_id = make_merchant(client)
    store_id = make_store(client, merchant_id)
    url = f"/merchants/{merchant_id}/stores/{store_id}/settings"
    assert client.patch(url, json={"status": "deleted"}, headers=auth()).status_code == 422
    assert client.patch(url, json={"custom_domain": "not a domain"}, headers=auth()).status_code == 422
    assert client.patch(url, json={"slug": "sneaky-rename"}, headers=auth()).status_code == 422


def test_store_branding_is_saved(client):
    merchant_id = make_merchant(client)
    store_id = make_store(client, merchant_id, slug="brand-store")
    url = f"/merchants/{merchant_id}/stores/{store_id}/branding"

    assert client.get(url, headers=auth()).json()["theme"] == "minimal"

    update = client.patch(url, json={"theme": "luxury", "accent_color": "#7c3aed", "app_status": "ready_for_preview"}, headers=auth())
    assert update.status_code == 200, update.text

    saved = client.get(url, headers=auth()).json()  # read back: proves it persisted
    assert saved["theme"] == "luxury"
    assert saved["accent_color"] == "#7c3aed"
    assert saved["app_status"] == "ready_for_preview"

    assert client.patch(url, json={"accent_color": "purple"}, headers=auth()).status_code == 422


def test_store_mobile_app_configuration_is_saved(client):
    merchant_id = make_merchant(client)
    store_id = make_store(client, merchant_id, slug="mobile-store")
    url = f"/merchants/{merchant_id}/stores/{store_id}/mobile-app"

    payload = client.get(url, headers=auth()).json()
    assert payload["bundle_id"] == "com.merchant.mobilestore"
    assert payload["publish_status"] == "draft"

    update = client.patch(url, json={"publish_status": "ready_for_review", "platform": "ios"}, headers=auth())
    assert update.status_code == 200, update.text

    saved = client.get(url, headers=auth()).json()
    assert saved["publish_status"] == "ready_for_review"
    assert saved["platform"] == "ios"

    assert client.patch(url, json={"platform": "windows-phone"}, headers=auth()).status_code == 422


# ---------- team and roles ----------

def test_team_member_role_model_is_supported_for_merchant(client):
    merchant_id = make_merchant(client, "Role Merchant", "role@merchant.com")
    response = client.post(f"/merchants/{merchant_id}/team-members", json={
        "name": "Taylor Admin", "email": "Admin@Merchant.com", "role": "Admin",
    }, headers=auth())
    assert response.status_code == 201, response.text
    payload = response.json()
    assert payload["merchant_id"] == merchant_id
    assert payload["role"] == "admin"
    assert payload["email"] == "admin@merchant.com"

    members = client.get(f"/merchants/{merchant_id}/team-members", headers=auth()).json()
    assert any(m["email"] == "admin@merchant.com" for m in members)

    duplicate = client.post(f"/merchants/{merchant_id}/team-members", json={
        "name": "Taylor Again", "email": "admin@merchant.com", "role": "member",
    }, headers=auth())
    assert duplicate.status_code == 409


def test_unknown_team_role_is_rejected(client):
    merchant_id = make_merchant(client)
    response = client.post(f"/merchants/{merchant_id}/team-members", json={
        "name": "Wizard", "email": "wizard@merchant.com", "role": "superuser",
    }, headers=auth())
    assert response.status_code == 422


def test_team_member_permissions_are_role_scoped_for_merchant(client):
    merchant_id = make_merchant(client, "Permission Merchant", "permissions@merchant.com")
    member_id = add_member(client, merchant_id, "admin@permission.com", "admin")

    payload = client.get(f"/merchants/{merchant_id}/team-members/{member_id}/permissions", headers=auth()).json()
    assert payload["role"] == "admin"
    assert "manage_store" in payload["permissions"]
    assert "manage_team" in payload["permissions"]
    assert payload["can_manage_store"] is True


def test_roles_limit_what_team_members_can_change(client):
    merchant_id = make_merchant(client)
    store_id = make_store(client, merchant_id)
    add_member(client, merchant_id, "viewer@shop.com", "member")
    add_member(client, merchant_id, "manager@shop.com", "manager")
    add_member(client, merchant_id, "admin@shop.com", "admin")
    store_url = f"/merchants/{merchant_id}/stores/{store_id}"

    viewer = auth("viewer@shop.com")
    assert client.get(f"{store_url}/settings", headers=viewer).status_code == 200      # can look
    assert client.patch(f"{store_url}/settings", json={"status": "live"}, headers=viewer).status_code == 403
    assert client.post(f"{store_url}/products", json=PRODUCT, headers=viewer).status_code == 403

    manager = auth("manager@shop.com")
    assert client.post(f"{store_url}/products", json=PRODUCT, headers=manager).status_code == 201
    assert client.patch(f"{store_url}/branding", json={"theme": "bold"}, headers=manager).status_code == 200
    assert client.post(f"/merchants/{merchant_id}/team-members",
                       json={"name": "New Hire", "email": "hire@shop.com", "role": "member"},
                       headers=manager).status_code == 403  # managers can't manage the team

    admin = auth("admin@shop.com")
    assert client.post(f"/merchants/{merchant_id}/team-members",
                       json={"name": "New Hire", "email": "hire@shop.com", "role": "member"},
                       headers=admin).status_code == 201
    # ...but only an owner can create another owner.
    assert client.post(f"/merchants/{merchant_id}/team-members",
                       json={"name": "Coup", "email": "coup@shop.com", "role": "owner"},
                       headers=admin).status_code == 403
    add_member(client, merchant_id, "coowner@shop.com", "owner")  # owner can


# ---------- products and tenant isolation ----------

def test_create_product(client):
    merchant_id = make_merchant(client)
    store_id = make_store(client, merchant_id)
    response = client.post("/products", json={"store_id": store_id, **PRODUCT}, headers=auth())
    assert response.status_code == 201, response.text
    assert response.json()["name"] == "Classic Tote"
    assert response.json()["merchant_id"] == merchant_id

    # The older unscoped route enforces the same rules.
    assert client.post("/products", json={"store_id": store_id, **PRODUCT}, headers=auth("stranger@x.com")).status_code == 404


def test_product_rejects_negative_price(client):
    merchant_id = make_merchant(client)
    store_id = make_store(client, merchant_id)
    response = client.post(f"/merchants/{merchant_id}/stores/{store_id}/products", json={**PRODUCT, "price": -5}, headers=auth())
    assert response.status_code == 422


def test_merchant_dashboard_data_is_scoped_by_merchant(client):
    merchant_id = make_merchant(client, "Dashboard Merchant", "dashboard@merchant.com")
    store_id = make_store(client, merchant_id, slug="dashboard-store", domain="dashboardstore.com")
    assert client.post("/products", json={"store_id": store_id, **PRODUCT, "name": "Premium Bundle"}, headers=auth()).status_code == 201

    stores = client.get(f"/merchants/{merchant_id}/stores", headers=auth()).json()
    assert len(stores) == 1 and stores[0]["slug"] == "dashboard-store"

    products = client.get(f"/merchants/{merchant_id}/products", headers=auth()).json()
    assert len(products) == 1 and products[0]["name"] == "Premium Bundle"

    assert client.get(f"/merchants/{merchant_id}/summary", headers=auth()).status_code == 200


def test_tenant_boundaries_between_merchants(client):
    alice, bob = "alice@a.com", "bob@b.com"
    merchant_a = make_merchant(client, "Merchant A", "merchant-a@example.com", as_user=alice)
    store_a = make_store(client, merchant_a, slug="merchant-a-store", as_user=alice)
    merchant_b = make_merchant(client, "Merchant B", "merchant-b@example.com", as_user=bob)
    store_b = make_store(client, merchant_b, slug="merchant-b-store", as_user=bob)

    created = client.post(f"/merchants/{merchant_a}/stores/{store_a}/products", json={**PRODUCT, "name": "Protected Bundle"}, headers=auth(alice))
    assert created.status_code == 201

    # Alice can't reach Bob's store through her own merchant id...
    via_own = f"/merchants/{merchant_a}/stores/{store_b}"
    assert client.get(f"{via_own}/products", headers=auth(alice)).status_code == 404
    assert client.post(f"{via_own}/products", json=PRODUCT, headers=auth(alice)).status_code == 404

    # ...or through Bob's merchant id directly.
    direct = f"/merchants/{merchant_b}/stores/{store_b}"
    for method, path, body in [
        ("get", "/products", None),
        ("post", "/products", PRODUCT),
        ("get", "/settings", None),
        ("patch", "/settings", {"status": "paused"}),
        ("patch", "/branding", {"theme": "hacked"}),
        ("patch", "/mobile-app", {"platform": "ios"}),
    ]:
        kwargs = {"headers": auth(alice)}
        if body is not None:
            kwargs["json"] = body
        response = getattr(client, method)(f"{direct}{path}", **kwargs)
        assert response.status_code == 404, f"{method} {path} -> {response.status_code}"
    assert client.get(f"/merchants/{merchant_b}/summary", headers=auth(alice)).status_code == 404
    assert client.get(f"/merchants/{merchant_b}/team-members", headers=auth(alice)).status_code == 404

    summary = client.get(f"/merchants/{merchant_a}/summary", headers=auth(alice)).json()
    assert summary["merchant"]["id"] == merchant_a
    assert summary["store_count"] == 1
    assert summary["product_count"] == 1
    assert summary["team_member_count"] == 1  # the owner


# ---------- firebase mode (Firebase's verifier is simulated) ----------

def _firebase_mode(monkeypatch, claims=None, error=None):
    import firebase_admin
    from firebase_admin import auth as firebase_auth

    from app import auth as app_auth, config

    def fake_verify(token, app=None):
        if error:
            raise error
        return claims

    monkeypatch.setattr(config, "AUTH_MODE", "firebase")
    monkeypatch.setattr(app_auth, "_firebase_app", object())  # skip real initialize_app
    monkeypatch.setattr(firebase_auth, "verify_id_token", fake_verify)


def test_firebase_verified_user_is_accepted(client, monkeypatch):
    _firebase_mode(monkeypatch, claims={"uid": "fb-123", "email": "Real@User.com", "email_verified": True})
    me = client.get("/me", headers={"Authorization": "Bearer real-firebase-token"})
    assert me.status_code == 200
    assert me.json()["uid"] == "fb-123"
    assert me.json()["email"] == "real@user.com"


def test_firebase_mode_rejects_dev_and_invalid_tokens(client, monkeypatch):
    _firebase_mode(monkeypatch, error=ValueError("bad signature"))
    assert client.get("/me", headers=auth("anyone@x.com")).status_code == 401


def test_firebase_unverified_email_is_refused(client, monkeypatch):
    _firebase_mode(monkeypatch, claims={"uid": "fb-9", "email": "new@user.com", "email_verified": False})
    assert client.get("/me", headers={"Authorization": "Bearer t"}).status_code == 403


def test_dev_mode_cannot_start_in_production(monkeypatch):
    import importlib

    from app import config

    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("AUTH_MODE", "dev")
    try:
        importlib.reload(config)
        raise AssertionError("config should refuse dev auth in production")
    except RuntimeError as exc:
        assert "must never run in production" in str(exc)
    finally:
        monkeypatch.setenv("APP_ENV", "development")
        importlib.reload(config)
