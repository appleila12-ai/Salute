# SaluteNav — Navigatore Sanitario

## Overview
Flusso lineare a 3 passi (IT) per capire i diritti dopo una diagnosi (Legge 104 / Invalidità Civile). Design minimale soft blue / white, tono empatico, sync backend anonimo.

## Screens (soltanto 4, come richiesto)
1. **Home** (`app/index.tsx`)
   - Titolo "Navigatore Sanitario — La tua guida passo-passo ai diritti"
   - Bottone "Inizia il percorso"
   - 3 step indicator (Diagnosi / Lavoro / Documenti)
   - Box discreto "App 100% gratuita — Offrici un caffè €3"

2. **Wizard** (`app/valutazione.tsx`)
   - Passo 1: chi + quando la diagnosi
   - Passo 2: situazione lavorativa (Privato / Pubblico / Autonomo / Inoccupato-Pensionato)
   - Passo 3: certificato INPS (Sì / No / Non so cos'è)
   - Modale d'avviso salva-tempo "Ho capito, prosegui" prima dei risultati

3. **Risultati** (`app/risultati/[id].tsx`)
   - Intro empatico personalizzato con data diagnosi + situazione lavorativa
   - Avviso 90 giorni (banner giallo)
   - 3 sezioni categorizzate: Permessi & Congedo / Sede & Smart Working / Esenzioni & Fiscali
   - Bottone "Scarica PDF" (expo-print + expo-sharing)
   - Bottone "Condividi Famiglia" → modal con **QR code** + link + copy + native share
   - Box AI "Fai una domanda alla Legge 104" con 4 suggerimenti rapidi + risposta Claude Sonnet 4.6
   - Card promozionale "Cassaforte Referti" (€4,99, prossimamente)
   - Link "Checklist documenti"
   - Sezione pieghevole "Cosa fare se la domanda viene respinta" (5 step di ricorso INPS)

4. **Checklist** (`app/checklist.tsx`)
   - 4 caselle (certificato, ricevuta, ID, referti originali + copie)
   - Progress bar 0-100 %, salvataggio locale, tip giallo "Porta sempre le fotocopie"

## Backend (`backend/server.py`)
- `POST /api/reports` — salva/upsert per `deviceId`, restituisce `shareToken`
- `GET /api/reports/share/{token}` — visualizza report condiviso
- `GET /api/reports/device/{device_id}` — lista report del dispositivo
- `POST /api/assistant` — Claude Sonnet 4.6 (Emergent LLM key) con system prompt italiano su L.104 + contesto risposte utente

## Sync
- **Silent cloud sync** via `deviceId` anonimo salvato in `SecureStore` alla prima app-open
- Ogni valutazione viene upserted lato backend senza account
- QR code condivisibile puntando direttamente all'endpoint `share/{token}`
- ⚠️ Google/Apple login social non implementato in questa iterazione (richiesta esplicita futura)

## Design tokens
- Palette: `#2C6496` brand, `#EBF2FA` brandSecondary, `#FFFFFF`, `#111827`
- Warnings: `#D97706` + `#FEF3C7`
- Success: `#059669`
- Radius: pill / lg / md, min touch 44/56 pt

## Removed / Cleaned up
- Dashboard con 4 feature cards, banner Percorso guidato
- Search bar, feature detail screens, storico, confronto, patronato, promemoria
- i18n toggle (app solo IT)
