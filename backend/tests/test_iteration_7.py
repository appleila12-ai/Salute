# Tests for iteration 7: static illustration assets + /api/content endpoint

import os
import pytest
import requests

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL") or "https://salute-naviga.preview.emergentagent.com"
BASE_URL = BASE_URL.rstrip("/")

ILLUSTRATIONS = [
    "home_hero",
    "wizard_diagnosi",
    "wizard_lavoro",
    "wizard_certificato",
    "diritti104",
    "patronati",
    "territorio",
    "trasporti",
    "domiciliare",
    "fisioterapia",
    "rsa",
]


@pytest.fixture(scope="module")
def api_client():
    s = requests.Session()
    return s


# ---------- Static illustrations ----------
class TestIllustrations:
    @pytest.mark.parametrize("name", ILLUSTRATIONS)
    def test_illustration_served(self, api_client, name):
        url = f"{BASE_URL}/api/assets/illustrations/{name}.jpg"
        r = api_client.get(url, timeout=15)
        assert r.status_code == 200, f"{url} returned {r.status_code}"
        ctype = r.headers.get("content-type", "")
        assert "image/jpeg" in ctype or "image" in ctype, f"unexpected content-type {ctype}"
        assert len(r.content) > 1000, f"payload too small for {name}"


# ---------- /api/content ----------
class TestContent:
    def test_content_shape(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/content", timeout=15)
        assert r.status_code == 200
        data = r.json()
        # updatedAt
        assert data.get("updatedAt") == "2026-06-01"
        # importi
        importi = data.get("importi") or []
        assert len(importi) == 4
        for it in importi:
            for k in ("nome", "importo", "requisiti", "reddito", "url"):
                assert k in it and it[k], f"campo mancante {k} in {it}"
        # accompagnamento importo
        first = importi[0]
        assert "552,27" in first["importo"], f"importo non atteso: {first['importo']}"
        # faq
        faq = data.get("faq") or []
        assert len(faq) == 10
        assert all("d" in f and "r" in f for f in faq)
        # glossario
        gloss = data.get("glossario") or []
        assert len(gloss) == 12
        assert all("t" in g and "d" in g for g in gloss)
        # dopoVerbale
        dopo = data.get("dopoVerbale") or []
        assert len(dopo) == 7
        assert all("titolo" in s and "come" in s for s in dopo)
        # keys expected in dopoVerbale
        titles = " ".join(s["titolo"] for s in dopo)
        assert "Esenzione ticket" in titles
        assert "IVA 4%" in titles
        aps = " ".join(s["come"] for s in dopo)
        assert "AP70" in aps

    def test_content_idempotent(self, api_client):
        # Two consecutive calls must return the same payload
        r1 = api_client.get(f"{BASE_URL}/api/content", timeout=15).json()
        r2 = api_client.get(f"{BASE_URL}/api/content", timeout=15).json()
        assert r1 == r2
        # No _id leaked
        assert "_id" not in r1
        assert "_id" not in r2

    def test_no_duplicates_in_mongo_via_public(self, api_client):
        # Repeated hits must not duplicate content: keep calling and verify shape stable
        for _ in range(3):
            r = api_client.get(f"{BASE_URL}/api/content", timeout=15)
            assert r.status_code == 200
            data = r.json()
            assert len(data["importi"]) == 4
            assert len(data["faq"]) == 10
            assert len(data["glossario"]) == 12
            assert len(data["dopoVerbale"]) == 7


# ---------- Smoke: root + previously validated endpoints ----------
class TestRoot:
    def test_root(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/", timeout=15)
        assert r.status_code == 200
        assert r.json().get("message")
