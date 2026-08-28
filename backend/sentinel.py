"""Sentinella AI — confronta gli importi INPS nel database con le fonti
ufficiali sul web (GPT-5 + web_search via Emergent LLM key) e segnala le
discrepanze; l'admin può applicare o ignorare ogni aggiornamento proposto.
"""

import asyncio
import json
import logging
import os
import re
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException
from openai import AsyncOpenAI
from pydantic import BaseModel

from app_content import APP_CONTENT_SEED

logger = logging.getLogger(__name__)

LLM_BASE_URL = "https://integrations.emergentagent.com/llm"
RUNNING_TIMEOUT_MIN = 10  # un check "running" più vecchio è considerato morto


def _parse_json(text: str) -> dict:
    """Estrae il primo oggetto JSON dalla risposta del modello."""
    cleaned = re.sub(r"```(?:json)?", "", text).strip()
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("Nessun JSON nella risposta")
    return json.loads(cleaned[start : end + 1])


def _item_prompt(anno: int, item: dict) -> str:
    return (
        f'Sei la "Sentinella AI" di TutelApp. Verifica sul web il valore ufficiale {anno} '
        f'della prestazione INPS: "{item["nome"]}".\n\n'
        "Valori attualmente mostrati nell'app:\n"
        f"- importo: {item['importo']}\n"
        f"- limite di reddito: {item['reddito']}\n\n"
        "Cerca sul web dando priorità a fonti ufficiali (inps.it, gazzettaufficiale.it) "
        "o autorevoli (patronati, testate specializzate). Confronta i valori.\n\n"
        "Rispondi SOLO con un oggetto JSON valido, senza testo extra:\n"
        "{\n"
        '  "stato": "ok" | "discrepanza" | "non_verificato",\n'
        '  "importoTrovato": "€ X,XX / mese" oppure null,\n'
        '  "redditoTrovato": stringa nello stesso stile del valore attuale oppure null,\n'
        '  "nota": "max 2 frasi in italiano: cosa hai trovato e da dove",\n'
        '  "fonte": "URL della fonte più autorevole" oppure null\n'
        "}\n\n"
        'Regole: "ok" solo se i numeri coincidono (ignora differenze di formattazione); '
        '"discrepanza" se anche un solo numero differisce (valorizza SEMPRE importoTrovato '
        "e/o redditoTrovato con il valore corretto trovato); "
        f'"non_verificato" se non trovi fonti affidabili per il {anno}. '
        "Non inventare cifre."
    )


async def _check_item(client: AsyncOpenAI, anno: int, item: dict) -> dict:
    base = {
        "nome": item["nome"],
        "tipo": "importo",
        "importoAttuale": item["importo"],
        "redditoAttuale": item["reddito"],
        "importoTrovato": None,
        "redditoTrovato": None,
        "nota": "",
        "fonte": None,
        "esito": None,
    }
    try:
        resp = await client.responses.create(
            model="gpt-5",
            input=_item_prompt(anno, item),
            tools=[{"type": "web_search"}],
        )
        data = _parse_json(resp.output_text or "")
        stato = data.get("stato")
        if stato not in ("ok", "discrepanza", "non_verificato"):
            stato = "non_verificato"
        base.update(
            stato=stato,
            importoTrovato=data.get("importoTrovato") or None,
            redditoTrovato=data.get("redditoTrovato") or None,
            nota=str(data.get("nota") or "").strip(),
            fonte=data.get("fonte") or None,
            esito="in_attesa" if stato == "discrepanza" else None,
        )
    except Exception as e:
        logger.exception("sentinel item check failed: %s", item["nome"])
        base.update(
            stato="non_verificato",
            nota=f"Verifica non riuscita: {type(e).__name__}. Riprova più tardi.",
        )
    return base


def _riforma_prompt(anno: int, riforma: dict) -> str:
    fasi_txt = "\n".join(
        f"- {f['etichetta']}: {', '.join(f['province'])}" for f in riforma.get("fasi", [])
    )
    return (
        f'Sei la "Sentinella AI" di TutelApp. Verifica sul web lo stato {anno} della '
        "sperimentazione della Riforma della Disabilità (D.Lgs. 62/2024).\n\n"
        "Dati attualmente mostrati nell'app:\n"
        f"- Entrata a regime nazionale: {riforma.get('regimeNazionale')}\n"
        f"- Fasi e province in sperimentazione:\n{fasi_txt}\n\n"
        "Cerca su fonti ufficiali (inps.it, disabilita.governo.it, gazzettaufficiale.it): "
        "l'elenco delle province è cambiato? Sono state annunciate nuove fasi, nuove "
        "province o proroghe/anticipi della data di entrata a regime?\n\n"
        "Rispondi SOLO con un oggetto JSON valido:\n"
        "{\n"
        '  "stato": "ok" | "discrepanza" | "non_verificato",\n'
        '  "nota": "max 3 frasi in italiano: cosa è cambiato (elenca le differenze principali) oppure conferma che è tutto allineato",\n'
        '  "fonte": "URL della fonte più autorevole" oppure null\n'
        "}\n\n"
        'Regole: "ok" se elenco province e data di regime coincidono; "discrepanza" se '
        "ci sono province mancanti/in più, nuove fasi o date diverse; "
        f'"non_verificato" se non trovi fonti affidabili per il {anno}. Non inventare.'
    )


async def _check_riforma(client: AsyncOpenAI, anno: int, riforma: dict) -> dict:
    tot = sum(len(f.get("province", [])) for f in riforma.get("fasi", []))
    base = {
        "nome": "Riforma 2027 · province in sperimentazione",
        "tipo": "riforma",
        "importoAttuale": f"{tot} territori in {len(riforma.get('fasi', []))} fasi · regime dal {riforma.get('regimeNazionale')}",
        "redditoAttuale": "",
        "importoTrovato": None,
        "redditoTrovato": None,
        "nota": "",
        "fonte": None,
        "esito": None,
    }
    try:
        resp = await client.responses.create(
            model="gpt-5",
            input=_riforma_prompt(anno, riforma),
            tools=[{"type": "web_search"}],
        )
        data = _parse_json(resp.output_text or "")
        stato = data.get("stato")
        if stato not in ("ok", "discrepanza", "non_verificato"):
            stato = "non_verificato"
        base.update(
            stato=stato,
            nota=str(data.get("nota") or "").strip(),
            fonte=data.get("fonte") or None,
            esito="in_attesa" if stato == "discrepanza" else None,
        )
    except Exception as e:
        logger.exception("sentinel riforma check failed")
        base.update(
            stato="non_verificato",
            nota=f"Verifica non riuscita: {type(e).__name__}. Riprova più tardi.",
        )
    return base


def create_sentinel_router(db) -> APIRouter:
    router = APIRouter(prefix="/api/sentinel")

    async def _get_content() -> dict:
        doc = await db.app_content.find_one({"key": "main"}, {"_id": 0})
        if not doc:
            await db.app_content.insert_one(dict(APP_CONTENT_SEED))
            doc = {k: v for k, v in APP_CONTENT_SEED.items()}
        return doc

    async def _run_check(check_id: str):
        try:
            content = await _get_content()
            anno = datetime.now(timezone.utc).year
            client = AsyncOpenAI(
                api_key=os.environ.get("EMERGENT_LLM_KEY", ""),
                base_url=LLM_BASE_URL,
                timeout=180.0,
            )
            results = await asyncio.gather(
                *[_check_item(client, anno, it) for it in content.get("importi", [])],
                *(
                    [_check_riforma(client, anno, content["riforma"])]
                    if content.get("riforma")
                    else []
                ),
            )
            await db.sentinel_checks.update_one(
                {"check_id": check_id},
                {"$set": {
                    "status": "done",
                    "results": list(results),
                    "finishedAt": datetime.now(timezone.utc).isoformat(),
                }},
            )
        except Exception as e:
            logger.exception("sentinel check failed")
            await db.sentinel_checks.update_one(
                {"check_id": check_id},
                {"$set": {
                    "status": "errore",
                    "error": str(e),
                    "finishedAt": datetime.now(timezone.utc).isoformat(),
                }},
            )

    @router.post("/check")
    async def start_check():
        if not os.environ.get("EMERGENT_LLM_KEY"):
            raise HTTPException(status_code=500, detail="LLM key mancante")

        # Se c'è già un check in corso recente, non avviarne un altro
        running = await db.sentinel_checks.find_one(
            {"status": "running"}, {"_id": 0}, sort=[("startedAt", -1)]
        )
        if running:
            started = datetime.fromisoformat(running["startedAt"])
            age_min = (datetime.now(timezone.utc) - started).total_seconds() / 60
            if age_min < RUNNING_TIMEOUT_MIN:
                return {"checkId": running["check_id"], "status": "running"}
            await db.sentinel_checks.update_one(
                {"check_id": running["check_id"]},
                {"$set": {"status": "errore", "error": "Timeout"}},
            )

        check_id = f"chk_{uuid.uuid4().hex[:10]}"
        await db.sentinel_checks.insert_one({
            "check_id": check_id,
            "status": "running",
            "startedAt": datetime.now(timezone.utc).isoformat(),
        })
        asyncio.create_task(_run_check(check_id))
        return {"checkId": check_id, "status": "running"}

    @router.get("/latest")
    async def latest_check():
        doc = await db.sentinel_checks.find_one(
            {}, {"_id": 0}, sort=[("startedAt", -1)]
        )
        return {"check": doc}

    class ResolveIn(BaseModel):
        checkId: str
        nome: str
        azione: str  # "applica" | "ignora"

    @router.post("/resolve")
    async def resolve(payload: ResolveIn):
        if payload.azione not in ("applica", "ignora"):
            raise HTTPException(status_code=400, detail="azione non valida")

        check = await db.sentinel_checks.find_one(
            {"check_id": payload.checkId}, {"_id": 0}
        )
        if not check:
            raise HTTPException(status_code=404, detail="Check non trovato")
        result = next(
            (r for r in check.get("results", []) if r["nome"] == payload.nome), None
        )
        if not result:
            raise HTTPException(status_code=404, detail="Voce non trovata nel check")

        if payload.azione == "applica":
            set_fields = {}
            if result.get("importoTrovato"):
                set_fields["importi.$.importo"] = result["importoTrovato"]
            if result.get("redditoTrovato"):
                set_fields["importi.$.reddito"] = result["redditoTrovato"]
            if not set_fields:
                raise HTTPException(
                    status_code=400, detail="Nessun nuovo valore da applicare"
                )
            set_fields["updatedAt"] = datetime.now(timezone.utc).date().isoformat()
            await _get_content()  # assicura che il doc esista
            updated = await db.app_content.update_one(
                {"key": "main", "importi.nome": payload.nome},
                {"$set": set_fields},
            )
            if updated.matched_count == 0:
                raise HTTPException(
                    status_code=404, detail="Prestazione non trovata nei contenuti"
                )
            esito = "applicato"
        else:
            esito = "ignorato"

        await db.sentinel_checks.update_one(
            {"check_id": payload.checkId},
            {"$set": {"results.$[el].esito": esito}},
            array_filters=[{"el.nome": payload.nome}],
        )
        return {"ok": True, "esito": esito}

    return router
