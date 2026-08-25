"""Backend regression + auth/sync tests for Navigatore Sanitario.

Covers:
- Auth: /api/auth/session (invalid + empty), /api/auth/me (no header + bad token),
  /api/auth/logout (no token = idempotent 200).
- Sync: /api/sync/upload and /api/sync/download reject without token.
- Startup indexes: verified against MongoDB directly.
- Regression: /api/reports (create + share + device list), /api/assistant.
- End-to-end with a MOCK session injected directly into Mongo.
"""
import os
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pytest
import requests
from dotenv import load_dotenv
from pymongo import MongoClient

# Load backend .env to get MONGO_URL / DB_NAME
BACKEND_ENV = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(BACKEND_ENV)

# Public base URL (Kubernetes ingress -> :8001 for /api)
FRONTEND_ENV = Path(__file__).resolve().parents[2] / "frontend" / ".env"
load_dotenv(FRONTEND_ENV, override=False)

BASE_URL = (
    os.environ.get("EXPO_PUBLIC_BACKEND_URL")
    or os.environ.get("EXPO_BACKEND_URL")
).rstrip("/")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]

API = f"{BASE_URL}/api"


# ---------- Fixtures ----------
@pytest.fixture(scope="session")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def mongo_db():
    client = MongoClient(MONGO_URL)
    try:
        yield client[DB_NAME]
    finally:
        client.close()


@pytest.fixture(scope="session")
def mock_user_session(mongo_db):
    """Inject a fake user + session into Mongo to simulate a logged-in user.

    Yields (session_token, user_id). Cleans up after the test session.
    """
    user_id = f"user_TEST_{uuid.uuid4().hex[:8]}"
    session_token = f"TEST_tok_{uuid.uuid4().hex}"
    email = f"TEST_{uuid.uuid4().hex[:6]}@example.com"

    mongo_db.users.insert_one(
        {
            "user_id": user_id,
            "email": email,
            "name": "TEST User",
            "picture": "",
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "updatedAt": datetime.now(timezone.utc).isoformat(),
        }
    )
    mongo_db.user_sessions.insert_one(
        {
            "session_token": session_token,
            "user_id": user_id,
            "expires_at": datetime.now(timezone.utc) + timedelta(days=1),
            "created_at": datetime.now(timezone.utc),
        }
    )
    yield session_token, user_id, email

    # Cleanup
    mongo_db.user_sessions.delete_many({"user_id": user_id})
    mongo_db.users.delete_many({"user_id": user_id})
    mongo_db.user_data.delete_many({"user_id": user_id})


# ---------- Root / smoke ----------
class TestRoot:
    def test_root(self, api_client):
        r = api_client.get(f"{API}/")
        assert r.status_code == 200
        assert r.json().get("message") == "SaluteNav API"


# ---------- Auth: negative cases ----------
class TestAuthNegative:
    def test_session_invalid_id_returns_401(self, api_client):
        r = api_client.post(f"{API}/auth/session", json={"session_id": "invalid"})
        assert r.status_code == 401, r.text
        detail = r.json().get("detail", "")
        assert "session_id non valido o scaduto" in detail

    def test_session_empty_body_returns_422(self, api_client):
        # Missing session_id field -> Pydantic 422
        r = api_client.post(f"{API}/auth/session", json={})
        assert r.status_code in (400, 422), r.text

    def test_session_empty_session_id_returns_400(self, api_client):
        r = api_client.post(f"{API}/auth/session", json={"session_id": ""})
        assert r.status_code in (400, 422), r.text
        if r.status_code == 400:
            assert "session_id mancante" in r.json().get("detail", "")

    def test_me_without_header_returns_401(self, api_client):
        # IMPORTANT: must be 401 (not 403). Uses manual Header, not HTTPAuthorizationCredentials.
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401, f"expected 401 got {r.status_code} body={r.text}"
        assert "Non autenticato" in r.json().get("detail", "")

    def test_me_with_invalid_bearer_returns_401(self, api_client):
        r = requests.get(
            f"{API}/auth/me",
            headers={"Authorization": "Bearer invalid-token"},
        )
        assert r.status_code == 401
        assert "Sessione non valida" in r.json().get("detail", "")

    def test_logout_without_token_is_200_idempotent(self, api_client):
        r = requests.post(f"{API}/auth/logout")
        assert r.status_code == 200
        assert r.json() == {"ok": True}


# ---------- Sync: negative auth ----------
class TestSyncNoAuth:
    def test_sync_upload_no_token_401(self):
        r = requests.post(f"{API}/sync/upload", json={"region": "IT-25"})
        assert r.status_code == 401, r.text

    def test_sync_download_no_token_401(self):
        r = requests.get(f"{API}/sync/download")
        assert r.status_code == 401, r.text


# ---------- Startup indexes ----------
class TestIndexes:
    def test_users_indexes(self, mongo_db):
        idx = mongo_db.users.index_information()
        # Expect unique indexes on email and user_id
        keys = {tuple(v["key"]) for v in idx.values()}
        assert (("email", 1),) in keys, idx
        assert (("user_id", 1),) in keys, idx
        # Check unique flag
        assert any(
            v.get("unique") and v["key"] == [("email", 1)] for v in idx.values()
        )
        assert any(
            v.get("unique") and v["key"] == [("user_id", 1)] for v in idx.values()
        )

    def test_user_sessions_indexes_with_ttl(self, mongo_db):
        idx = mongo_db.user_sessions.index_information()
        # session_token unique
        assert any(
            v.get("unique") and v["key"] == [("session_token", 1)]
            for v in idx.values()
        ), idx
        # TTL index on expires_at with expireAfterSeconds == 0
        ttl_found = any(
            v["key"] == [("expires_at", 1)] and v.get("expireAfterSeconds") == 0
            for v in idx.values()
        )
        assert ttl_found, f"TTL index on expires_at missing: {idx}"

    def test_user_data_indexes(self, mongo_db):
        idx = mongo_db.user_data.index_information()
        assert any(
            v.get("unique") and v["key"] == [("user_id", 1)] for v in idx.values()
        ), idx


# ---------- Regression: reports & assistant ----------
class TestReportsRegression:
    @pytest.fixture(scope="class")
    def created(self, api_client, mongo_db):
        rid = f"TEST_r_{uuid.uuid4().hex[:8]}"
        did = f"TEST_dev_{uuid.uuid4().hex[:6]}"
        payload = {
            "id": rid,
            "answers": {"who": "Io stesso", "work": "Dipendente"},
            "sections": [{"title": "Legge 104", "items": ["step1"]}],
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "deviceId": did,
        }
        r = api_client.post(f"{API}/reports", json=payload)
        assert r.status_code == 200, r.text
        body = r.json()
        yield body, did
        # Cleanup
        mongo_db.reports.delete_many({"id": rid})

    def test_create_report_returns_share_token(self, created):
        body, _ = created
        assert body["id"].startswith("TEST_r_")
        assert isinstance(body.get("shareToken"), str) and len(body["shareToken"]) > 5
        assert body["answers"]["who"] == "Io stesso"

    def test_get_report_by_share_token(self, api_client, created):
        body, _ = created
        r = api_client.get(f"{API}/reports/share/{body['shareToken']}")
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["id"] == body["id"]
        assert "_id" not in data  # ObjectId excluded

    def test_list_reports_by_device(self, api_client, created):
        _, did = created
        r = api_client.get(f"{API}/reports/device/{did}")
        assert r.status_code == 200
        data = r.json()
        assert "items" in data
        assert len(data["items"]) >= 1
        assert all("_id" not in it for it in data["items"])

    def test_share_token_not_found_404(self, api_client):
        r = api_client.get(f"{API}/reports/share/DOES_NOT_EXIST_xyz")
        assert r.status_code == 404


class TestAssistantRegression:
    def test_assistant_valid_question(self, api_client):
        r = api_client.post(
            f"{API}/assistant",
            json={"question": "Cos'è la Legge 104 in una frase?"},
            timeout=90,
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert isinstance(body.get("answer"), str)
        assert len(body["answer"]) > 10
        # Prompt is Italian TutelApp -> answer should be Italian (heuristic: contains at least one Italian stop word)
        low = body["answer"].lower()
        assert any(w in low for w in [" e ", " la ", " il ", " di ", " che ", "104", "invalidit"])

    def test_assistant_empty_question_400(self, api_client):
        r = api_client.post(f"{API}/assistant", json={"question": "   "})
        assert r.status_code == 400


# ---------- Payments (Stripe) ----------
class TestPayments:
    ORIGIN_URL = "https://salute-naviga.preview.emergentagent.com"

    @pytest.fixture(scope="class")
    def created_session(self, api_client, mongo_db):
        r = api_client.post(
            f"{API}/payments/checkout",
            json={"originUrl": self.ORIGIN_URL, "deviceId": "TEST_dev_pay"},
            timeout=60,
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert "url" in body and "sessionId" in body
        yield body
        # Cleanup
        mongo_db.payment_transactions.delete_many({"session_id": body["sessionId"]})

    def test_checkout_returns_stripe_url_and_sessionid(self, created_session):
        body = created_session
        assert body["url"].startswith("https://checkout.stripe.com"), body["url"]
        assert isinstance(body["sessionId"], str) and len(body["sessionId"]) > 5

    def test_checkout_creates_pending_transaction_in_mongo(
        self, created_session, mongo_db
    ):
        body = created_session
        doc = mongo_db.payment_transactions.find_one(
            {"session_id": body["sessionId"]}
        )
        assert doc is not None, "payment_transactions doc not created"
        assert doc["payment_status"] == "pending"
        assert doc["amount"] == 4.99
        assert doc["currency"] == "eur"
        assert doc["product"] == "vault"
        assert doc["deviceId"] == "TEST_dev_pay"

    def test_status_returns_pending_for_unpaid_session(self, api_client, created_session):
        body = created_session
        r = api_client.get(f"{API}/payments/status/{body['sessionId']}", timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        # A freshly-created session hasn't been paid yet
        assert "status" in data and "paymentStatus" in data
        # Session should still be open/pending, paymentStatus 'unpaid' (or 'no_payment_required'/pending)
        assert data["paymentStatus"] in ("unpaid", "pending", "no_payment_required"), data
        assert data["status"] in ("open", "pending", "complete"), data

    def test_status_unknown_session_returns_404(self, api_client):
        r = api_client.get(
            f"{API}/payments/status/cs_test_DOES_NOT_EXIST_xyz123", timeout=30
        )
        assert r.status_code == 404, r.text

    def test_checkout_invalid_origin_returns_400(self, api_client):
        r = api_client.post(
            f"{API}/payments/checkout", json={"originUrl": "abc"}
        )
        assert r.status_code == 400, r.text
        assert "originUrl" in r.json().get("detail", "").lower() or "non valido" in r.json().get("detail", "")


# ---------- E2E with injected mock session ----------
class TestAuthenticatedE2E:
    def test_me_with_valid_session(self, mock_user_session):
        token, user_id, email = mock_user_session
        r = requests.get(
            f"{API}/auth/me", headers={"Authorization": f"Bearer {token}"}
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["user_id"] == user_id
        assert data["email"] == email

    def test_sync_upload_then_download(self, mock_user_session):
        token, user_id, _ = mock_user_session
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }
        payload = {
            "reports": [{"id": "r1", "title": "test report"}],
            "checklist": {"cert_medico": True, "isee": False},
            "region": "IT-25",
            "updatedAt": datetime.now(timezone.utc).isoformat(),
        }
        up = requests.post(f"{API}/sync/upload", json=payload, headers=headers)
        assert up.status_code == 200, up.text
        assert up.json().get("ok") is True

        dw = requests.get(f"{API}/sync/download", headers=headers)
        assert dw.status_code == 200, dw.text
        data = dw.json()
        assert data["region"] == "IT-25"
        assert data["checklist"] == {"cert_medico": True, "isee": False}
        assert len(data["reports"]) == 1
        assert data["reports"][0]["id"] == "r1"

    def test_logout_deletes_session_then_me_401(self, mongo_db):
        """Create a throwaway session, logout, verify it is gone."""
        user_id = f"user_TEST_{uuid.uuid4().hex[:8]}"
        token = f"TEST_tok_{uuid.uuid4().hex}"
        mongo_db.users.insert_one(
            {
                "user_id": user_id,
                "email": f"TEST_{uuid.uuid4().hex[:6]}@example.com",
                "name": "temp",
                "picture": "",
                "createdAt": datetime.now(timezone.utc).isoformat(),
                "updatedAt": datetime.now(timezone.utc).isoformat(),
            }
        )
        mongo_db.user_sessions.insert_one(
            {
                "session_token": token,
                "user_id": user_id,
                "expires_at": datetime.now(timezone.utc) + timedelta(days=1),
                "created_at": datetime.now(timezone.utc),
            }
        )

        try:
            # Confirm login works
            r = requests.get(
                f"{API}/auth/me", headers={"Authorization": f"Bearer {token}"}
            )
            assert r.status_code == 200

            # Logout
            r = requests.post(
                f"{API}/auth/logout",
                headers={"Authorization": f"Bearer {token}"},
            )
            assert r.status_code == 200 and r.json() == {"ok": True}

            # /me should now 401
            r = requests.get(
                f"{API}/auth/me", headers={"Authorization": f"Bearer {token}"}
            )
            assert r.status_code == 401

            # Session doc must be gone
            assert mongo_db.user_sessions.find_one({"session_token": token}) is None
        finally:
            mongo_db.users.delete_many({"user_id": user_id})
            mongo_db.user_sessions.delete_many({"user_id": user_id})

    def test_expired_session_returns_401(self, mongo_db):
        user_id = f"user_TEST_{uuid.uuid4().hex[:8]}"
        token = f"TEST_tok_{uuid.uuid4().hex}"
        mongo_db.users.insert_one(
            {
                "user_id": user_id,
                "email": f"TEST_{uuid.uuid4().hex[:6]}@example.com",
                "name": "temp",
                "picture": "",
                "createdAt": datetime.now(timezone.utc).isoformat(),
                "updatedAt": datetime.now(timezone.utc).isoformat(),
            }
        )
        mongo_db.user_sessions.insert_one(
            {
                "session_token": token,
                "user_id": user_id,
                "expires_at": datetime.now(timezone.utc) - timedelta(days=1),
                "created_at": datetime.now(timezone.utc) - timedelta(days=8),
            }
        )
        try:
            r = requests.get(
                f"{API}/auth/me", headers={"Authorization": f"Bearer {token}"}
            )
            assert r.status_code == 401
            assert "Sessione scaduta" in r.json().get("detail", "")
        finally:
            mongo_db.users.delete_many({"user_id": user_id})
            mongo_db.user_sessions.delete_many({"user_id": user_id})
