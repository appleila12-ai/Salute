from fastapi import FastAPI, APIRouter, HTTPException, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import secrets
from pathlib import Path
from pydantic import BaseModel, Field
from typing import Any, Optional
import uuid
from datetime import datetime, timezone

from emergentintegrations.llm.chat import LlmChat, UserMessage


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

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


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "SaluteNav API"}


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


SYSTEM_PROMPT = (
    "Sei l'assistente esperto di Navigatore Sanitario, un'app italiana che aiuta i cittadini "
    "a orientarsi tra Legge 104/1992 e Invalidità Civile.\n\n"
    "Regole:\n"
    "1. Rispondi SEMPRE in italiano, con tono empatico, chiaro e diretto.\n"
    "2. Fonda ogni risposta sulla normativa vigente (L. 104/1992, L. 68/1999, art. 42 D.Lgs. 151/2001, "
    "D.L. 105/2022 per lo smart working, procedure INPS 2024-2026).\n"
    "3. Sii SINTETICO: max 6 frasi, vai al punto. Se serve elenca 2-3 passi pratici.\n"
    "4. Se la domanda è troppo specifica per rispondere senza dati clinici, indica cosa chiedere al patronato.\n"
    "5. Non dare mai indicazioni mediche. Solo procedurali e legali.\n"
    "6. Non inventare cifre. Se non sei certo di un importo, scrivi 'consulta l'INPS'.\n"
    "7. Chiudi sempre con una frase incoraggiante e con l'invito a rivolgersi a un patronato per la conferma."
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


app.include_router(api_router)

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


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
