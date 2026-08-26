"""Sentinella AI - quick backend regression tests.

Covers:
- POST /api/sentinel/check (already-running short-circuit)
- GET /api/sentinel/latest
- POST /api/sentinel/resolve (400 on invalid action, 404 on missing check)
- GET /api/content regression (accompagnamento post-applicazione)
"""
import os
import time

import pytest
import requests

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL", "").rstrip("/") or \
    "https://salute-naviga.preview.emergentagent.com"


@pytest.fixture
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# --- GET /api/sentinel/latest -----------------------------------------------
def test_latest_returns_check_object(api):
    r = api.get(f"{BASE_URL}/api/sentinel/latest", timeout=15)
    assert r.status_code == 200, r.text
    body = r.json()
    assert "check" in body
    # a check exists from previous runs
    check = body["check"]
    assert check is not None, "expected at least one persisted check"
    assert "check_id" in check
    assert "status" in check
    assert check["status"] in ("running", "done", "errore")
    # no MongoDB _id leaked
    assert "_id" not in check


# --- POST /api/sentinel/resolve validations ---------------------------------
def test_resolve_invalid_action_returns_400(api):
    r = api.post(
        f"{BASE_URL}/api/sentinel/resolve",
        json={"checkId": "chk_nonexistent", "nome": "Foo", "azione": "boh"},
        timeout=15,
    )
    assert r.status_code == 400, r.text


def test_resolve_unknown_check_returns_404(api):
    r = api.post(
        f"{BASE_URL}/api/sentinel/resolve",
        json={
            "checkId": "chk_doesnotexist_xyz",
            "nome": "Assegno mensile di assistenza",
            "azione": "ignora",
        },
        timeout=15,
    )
    assert r.status_code == 404, r.text


# --- POST /api/sentinel/check idempotency -----------------------------------
def test_check_not_started_twice_if_running(api):
    """Se un check running non è presente, la POST ne avvia uno e la seconda
    POST immediata deve tornare lo stesso checkId (short-circuit)."""
    r1 = api.post(f"{BASE_URL}/api/sentinel/check", timeout=30)
    assert r1.status_code == 200, r1.text
    b1 = r1.json()
    assert "checkId" in b1 and b1.get("status") == "running"
    check_id = b1["checkId"]

    # subito dopo, la stessa POST deve restituire lo stesso check
    time.sleep(1)
    r2 = api.post(f"{BASE_URL}/api/sentinel/check", timeout=30)
    assert r2.status_code == 200, r2.text
    b2 = r2.json()
    assert b2.get("status") == "running"
    assert b2.get("checkId") == check_id, (
        f"expected reuse of running check, got {b2.get('checkId')} vs {check_id}"
    )

    # /latest riflette lo stesso check
    r3 = api.get(f"{BASE_URL}/api/sentinel/latest", timeout=15)
    assert r3.status_code == 200
    latest = r3.json().get("check") or {}
    assert latest.get("check_id") == check_id


# --- Regressione /api/content -----------------------------------------------
def test_content_still_loads_with_updated_accompagnamento(api):
    r = api.get(f"{BASE_URL}/api/content", timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "importi" in data and isinstance(data["importi"], list)
    assert len(data["importi"]) >= 3
    accompagnamento = next(
        (i for i in data["importi"] if "ccompagnamento" in i.get("nome", "")),
        None,
    )
    assert accompagnamento is not None, "voce accompagnamento assente"
    # dopo l'applicazione reale il main agent riporta 551,53
    assert "551,53" in accompagnamento["importo"] or "552,27" in accompagnamento["importo"], (
        f"unexpected importo: {accompagnamento['importo']}"
    )
    # niente _id
    assert "_id" not in data
