# SaluteNav — Navigatore Sanitario

## Overview
Flusso lineare a 3 passi (IT) per capire i diritti dopo una diagnosi (Legge 104 / Invalidità Civile). Design minimale soft blue / white, tono empatico, sync backend anonimo.

## Screens
1. **Home** (`app/index.tsx`)
   - **Pillola regione** (default Liguria) top-left con sheet 10 regioni
   - **Icone login social** Google/Apple top-right (chip post-login, mock)
   - Titolo "Navigatore Sanitario — La tua guida passo-passo ai diritti in {regione}"
   - Bottone "Inizia il percorso"
   - **4 step** (Diagnosi / Lavoro / Documenti / Patronato) con badge attivo brand
   - Box "Offrici un caffè €3"

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
   - **NUOVO — Patronati e Sportelli Territoriali** (componente `src/components/PatronatiSection.tsx`)
     - Checklist gialla "Prima di andare al Patronato" (Codice Fiscale, Documento d'Identità, Certificato Medico Introduttivo)
     - Campo di ricerca per CAP o città con ordinamento per prossimità
     - 3 patronati Sarzana in evidenza (INCA CGIL Via XXI Luglio, ACLI Via Lucri, ITAL UIL Via Landinelli) con badge stella
     - Ogni card: bottone "**Prenota Slot**" → modale con 5 slot orari (stile Calendly) → conferma con box verde "Prenotato: ..."
     - Pannello "Indirizzo e contatti" con azioni Chiama / Email / Mappa
     - 10 patronati totali (Sarzana, La Spezia, Genova, Milano, Roma, Napoli, Torino, Bologna)
   - Box AI "Fai una domanda alla Legge 104" con 4 suggerimenti rapidi + risposta Claude Sonnet 4.6
   - Card **Cassaforte Referti** (€4,99): tap → **modale Stripe** placeholder → "Paga ora" sblocca l'upload dei referti (Referto_1.pdf, Referto_2.pdf…)
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

## Aggiornamento (Giugno 2026 - fork post-ricarica)
- Rebranding "TutelApp" VERIFICATO: logo scudo/spunta, palette blu ceruleo #2A75D3 + arancio #F59E0B, home renderizza correttamente
- Google Auth reale + Cloud Sync attivi (backend 22/22 test passati)
- Problema "non vedo più niente" post-ricarica: risolto con riavvio servizi nel nuovo ambiente forkato
- Prossimi step: Stripe reale per Cassaforte Referti (P1), refactor risultati/[id].tsx (P2)
