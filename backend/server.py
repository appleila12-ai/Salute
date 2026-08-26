from fastapi import FastAPI, APIRouter, HTTPException, Header, Depends, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import secrets
import httpx
from pathlib import Path
from pydantic import BaseModel, Field
from typing import Any, Optional, List
import uuid
from datetime import datetime, timezone, timedelta

from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.payments.stripe.checkout import (
    CheckoutSessionRequest,
    StripeCheckout,
)


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')
EMERGENT_AUTH_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY', '')
VAULT_PRICE_EUR = 4.99  # amount is defined server-side only

app = FastAPI()
api_router = APIRouter(prefix="/api")


# ---------- Models ----------
class ReportIn(BaseModel):
    id: str
    answers: dict
    sections: list
    createdAt: str
    deviceId: Optional[str] = None


class ReportOut(BaseModel):
    id: str
    answers: dict
    sections: list
    createdAt: str
    shareToken: str


class AssistantIn(BaseModel):
    question: str
    context: Optional[dict] = None


class AssistantOut(BaseModel):
    answer: str


class SessionRequest(BaseModel):
    session_id: str


class UserOut(BaseModel):
    user_id: str
    email: str
    name: Optional[str] = None
    picture: Optional[str] = None


class AuthResponse(BaseModel):
    session_token: str
    user: UserOut


class SyncPayload(BaseModel):
    reports: Optional[List[dict]] = None
    checklist: Optional[dict] = None
    region: Optional[str] = None
    updatedAt: Optional[str] = None


class SyncDownload(BaseModel):
    reports: List[dict] = []
    checklist: dict = {}
    region: Optional[str] = None
    updatedAt: Optional[str] = None


# ---------- Auth helper ----------
async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Non autenticato")
    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Token mancante")

    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=401, detail="Sessione non valida")

    expires_at = session.get("expires_at")
    if isinstance(expires_at, datetime):
        # Normalize to timezone-aware
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=401, detail="Sessione scaduta")

    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Utente non trovato")
    return user


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "SaluteNav API"}


# ---------- Auth ----------
@api_router.post("/auth/session", response_model=AuthResponse)
async def auth_session(payload: SessionRequest):
    session_id = (payload.session_id or "").strip()
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id mancante")

    try:
        async with httpx.AsyncClient(timeout=15.0) as http_client:
            resp = await http_client.get(
                EMERGENT_AUTH_URL,
                headers={"X-Session-ID": session_id},
            )
    except Exception as e:
        logging.exception("emergent auth call failed")
        raise HTTPException(status_code=502, detail=f"Errore autenticazione: {e}")

    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="session_id non valido o scaduto")

    data = resp.json() or {}
    email = data.get("email")
    if not email:
        raise HTTPException(status_code=401, detail="Dati utente incompleti")

    name = data.get("name") or ""
    picture = data.get("picture") or ""
    session_token = data.get("session_token")
    if not session_token:
        raise HTTPException(status_code=502, detail="session_token mancante nella risposta")

    # Upsert user by email
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {
                "name": name or existing.get("name") or "",
                "picture": picture or existing.get("picture") or "",
                "updatedAt": datetime.now(timezone.utc).isoformat(),
            }},
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "updatedAt": datetime.now(timezone.utc).isoformat(),
        })

    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.update_one(
        {"session_token": session_token},
        {"$set": {
            "session_token": session_token,
            "user_id": user_id,
            "expires_at": expires_at,
            "created_at": datetime.now(timezone.utc),
        }},
        upsert=True,
    )

    return AuthResponse(
        session_token=session_token,
        user=UserOut(user_id=user_id, email=email, name=name, picture=picture),
    )


@api_router.get("/auth/me", response_model=UserOut)
async def auth_me(user: dict = Depends(get_current_user)):
    return UserOut(
        user_id=user["user_id"],
        email=user["email"],
        name=user.get("name") or "",
        picture=user.get("picture") or "",
    )


@api_router.post("/auth/logout")
async def auth_logout(authorization: Optional[str] = Header(None)):
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip()
        if token:
            await db.user_sessions.delete_one({"session_token": token})
    return {"ok": True}


@api_router.delete("/auth/account")
async def delete_account(user: dict = Depends(get_current_user)):
    """Cancellazione account in-app (richiesta Apple): rimuove utente,
    sessioni e dati sincronizzati sul cloud."""
    uid = user["user_id"]
    await db.user_sessions.delete_many({"user_id": uid})
    await db.user_data.delete_one({"user_id": uid})
    await db.users.delete_one({"user_id": uid})
    return {"ok": True}


# ---------- Sync ----------
@api_router.post("/sync/upload")
async def sync_upload(payload: SyncPayload, user: dict = Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    update: dict = {"updatedAt": now}
    if payload.reports is not None:
        update["reports"] = payload.reports[:50]
    if payload.checklist is not None:
        update["checklist"] = payload.checklist
    if payload.region is not None:
        update["region"] = payload.region
    await db.user_data.update_one(
        {"user_id": user["user_id"]},
        {"$set": update, "$setOnInsert": {"createdAt": now, "user_id": user["user_id"]}},
        upsert=True,
    )
    return {"ok": True, "updatedAt": now}


@api_router.get("/sync/download", response_model=SyncDownload)
async def sync_download(user: dict = Depends(get_current_user)):
    doc = await db.user_data.find_one({"user_id": user["user_id"]}, {"_id": 0})
    if not doc:
        return SyncDownload()
    return SyncDownload(
        reports=doc.get("reports") or [],
        checklist=doc.get("checklist") or {},
        region=doc.get("region"),
        updatedAt=doc.get("updatedAt"),
    )


# ---------- Reports (legacy device-based) ----------
@api_router.post("/reports", response_model=ReportOut)
async def create_report(report: ReportIn):
    doc = report.dict()
    doc["shareToken"] = secrets.token_urlsafe(12)
    doc["updatedAt"] = datetime.now(timezone.utc).isoformat()
    # Upsert by device id + report id so re-saves don't duplicate
    await db.reports.update_one(
        {"id": report.id},
        {"$set": doc},
        upsert=True,
    )
    return ReportOut(
        id=doc["id"],
        answers=doc["answers"],
        sections=doc["sections"],
        createdAt=doc["createdAt"],
        shareToken=doc["shareToken"],
    )


@api_router.get("/reports/device/{device_id}")
async def list_reports(device_id: str):
    cursor = db.reports.find({"deviceId": device_id}, {"_id": 0}).sort("createdAt", -1)
    items = await cursor.to_list(50)
    return {"items": items}


@api_router.get("/reports/share/{share_token}")
async def get_shared_report(share_token: str):
    doc = await db.reports.find_one({"shareToken": share_token}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Report non trovato")
    return doc


# ---------- Payments (Stripe — Cassaforte Referti) ----------
class CheckoutIn(BaseModel):
    originUrl: str
    deviceId: Optional[str] = None


@api_router.post("/payments/checkout")
async def create_payment_checkout(payload: CheckoutIn):
    if not STRIPE_API_KEY:
        raise HTTPException(status_code=500, detail="Stripe non configurato")
    origin = (payload.originUrl or "").strip().rstrip("/")
    if not origin.startswith("http"):
        raise HTTPException(status_code=400, detail="originUrl non valido")

    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY)
    request = CheckoutSessionRequest(
        amount=VAULT_PRICE_EUR,
        currency="eur",
        success_url=f"{origin}/payment-success?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{origin}/?payment=cancelled",
        metadata={"product": "vault", "deviceId": payload.deviceId or ""},
    )
    try:
        session = await stripe_checkout.create_checkout_session(request)
    except Exception as e:
        logging.exception("stripe checkout failed")
        raise HTTPException(status_code=502, detail=f"Errore creazione pagamento: {e}")

    now = datetime.now(timezone.utc).isoformat()
    await db.payment_transactions.insert_one({
        "session_id": session.session_id,
        "amount": VAULT_PRICE_EUR,
        "currency": "eur",
        "product": "vault",
        "deviceId": payload.deviceId or "",
        "payment_status": "pending",
        "createdAt": now,
        "updatedAt": now,
    })
    return {"url": session.url, "sessionId": session.session_id}


@api_router.get("/payments/status/{session_id}")
async def payment_status(session_id: str):
    doc = await db.payment_transactions.find_one(
        {"session_id": session_id}, {"_id": 0}
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Sessione di pagamento non trovata")
    # Idempotent: once paid, always paid — no double processing
    if doc.get("payment_status") == "paid":
        return {"status": "complete", "paymentStatus": "paid"}

    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY)
    try:
        status = await stripe_checkout.get_checkout_status(session_id)
    except Exception as e:
        logging.exception("stripe status failed")
        raise HTTPException(status_code=502, detail=f"Errore verifica pagamento: {e}")

    if status.payment_status == "paid":
        await db.payment_transactions.update_one(
            {"session_id": session_id, "payment_status": {"$ne": "paid"}},
            {"$set": {
                "payment_status": "paid",
                "paidAt": datetime.now(timezone.utc).isoformat(),
                "updatedAt": datetime.now(timezone.utc).isoformat(),
            }},
        )
    elif status.status == "expired":
        await db.payment_transactions.update_one(
            {"session_id": session_id, "payment_status": "pending"},
            {"$set": {
                "payment_status": "expired",
                "updatedAt": datetime.now(timezone.utc).isoformat(),
            }},
        )
    return {"status": status.status, "paymentStatus": status.payment_status}


# ---------- AI Assistant ----------
SYSTEM_PROMPT = (
    "Sei l'assistente esperto di TutelApp, un'app italiana che aiuta i cittadini "
    "a orientarsi tra Legge 104/1992 e Invalidità Civile.\n\n"
    "Regole:\n"
    "1. Rispondi SEMPRE in italiano, con tono empatico, chiaro e diretto.\n"
    "2. Fonda ogni risposta sulla normativa vigente (L. 104/1992, L. 68/1999, art. 42 D.Lgs. 151/2001, "
    "D.Lgs. 105/2022, D.Lgs. 62/2024 — riforma disabilità in sperimentazione, procedure INPS 2024-2026).\n"
    "3. Ricorda: dal D.Lgs. 105/2022 il convivente di fatto (L. 76/2016, convivenza registrata all'anagrafe) "
    "è equiparato al coniuge e all'unito civilmente per i permessi art. 33 e il congedo straordinario.\n"
    "4. Sii SINTETICO: max 6 frasi, vai al punto. Se serve elenca 2-3 passi pratici.\n"
    "5. Se la domanda è troppo specifica per rispondere senza dati clinici, indica cosa chiedere al patronato.\n"
    "6. Non dare mai indicazioni mediche. Solo procedurali e legali.\n"
    "7. Non inventare cifre né date. Se non sei certo di un importo, scrivi 'consulta l'INPS'.\n"
    "8. Se l'utente è inoccupato o pensionato, NON parlare di permessi lavorativi: orienta su prestazioni "
    "economiche (assegno mensile, pensione di inabilità, indennità di accompagnamento) ed esenzioni.\n"
    "9. Chiudi sempre con una frase incoraggiante e con l'invito a rivolgersi a un patronato per la conferma."
)


@api_router.post("/assistant", response_model=AssistantOut)
async def assistant(payload: AssistantIn):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="LLM key mancante")
    question = payload.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Domanda vuota")

    context_msg = ""
    if payload.context:
        who = payload.context.get("who")
        work = payload.context.get("work")
        cert = payload.context.get("cert")
        when = payload.context.get("when")
        parts = []
        if who:
            parts.append(f"chi ha ricevuto la diagnosi: {who}")
        if when:
            parts.append(f"quando: {when}")
        if work:
            parts.append(f"situazione lavorativa: {work}")
        if cert:
            parts.append(f"certificato INPS: {cert}")
        if parts:
            context_msg = "\n\n[Contesto utente] " + "; ".join(parts) + "."

    session_id = f"salutenav-{uuid.uuid4()}"
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=SYSTEM_PROMPT,
    ).with_model("anthropic", "claude-sonnet-4-6")

    try:
        response: Any = await chat.send_message(
            UserMessage(text=question + context_msg)
        )
        text = str(response).strip() if response else ""
    except Exception as e:
        logging.exception("assistant call failed")
        raise HTTPException(status_code=502, detail=f"Errore assistente: {e}")

    if not text:
        text = (
            "Mi dispiace, al momento non riesco a rispondere. "
            "Per un caso così specifico ti consiglio di contattare un patronato "
            "(ACLI, INCA CGIL, ITAL UIL o INAS CISL): il servizio è gratuito."
        )
    return AssistantOut(answer=text)


# ---------- Contenuti aggiornabili (importi, FAQ, glossario, dopo-verbale) ----------
from app_content import APP_CONTENT_SEED


@api_router.get("/content")
async def get_app_content():
    doc = await db.app_content.find_one({"key": "main"}, {"_id": 0})
    if not doc:
        await db.app_content.insert_one(dict(APP_CONTENT_SEED))
        doc = {k: v for k, v in APP_CONTENT_SEED.items()}
    return doc


# ---------- Sentinella AI (verifica importi INPS sul web) ----------
from sentinel import create_sentinel_router

app.include_router(api_router)
app.include_router(create_sentinel_router(db))

# Static assets (illustrazioni servite al client, funziona anche su Expo Go)
from fastapi.staticfiles import StaticFiles

app.mount("/api/assets", StaticFiles(directory=str(ROOT_DIR / "static")), name="assets")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def create_indexes():
    try:
        await db.users.create_index("email", unique=True)
        await db.users.create_index("user_id", unique=True)
        await db.user_sessions.create_index("session_token", unique=True)
        await db.user_sessions.create_index("user_id")
        await db.user_sessions.create_index("expires_at", expireAfterSeconds=0)
        await db.user_data.create_index("user_id", unique=True)
        logger.info("Mongo indexes created/verified")
    except Exception as e:
        logger.warning(f"Index creation warning: {e}")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
