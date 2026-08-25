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

## Iterazione 5-6 (Giugno 2026)
- Stripe REALE (emergentintegrations proxy) per Cassaforte €4,99: /api/payments/checkout + /api/payments/status, pagina /payment-success, sblocco persistito
- Cassaforte sbloccata: salva report PDF + carica documenti (expo-document-picker/file-system), persistiti
- Rimossa data fittizia diagnosi (intro/PDF mostrano solo il bucket temporale)
- DeadlineCard: promemoria 90gg con data reale inserita dall'utente (GG/MM/AAAA), countdown persistito
- NextStepsSection: percorso 5 passi, spiegazione Certificato Introduttivo, possibilità Legge 104, tabella percentuali invalidità
- Inoccupato/Pensionato: rimosse sezioni permessi/sede → sezione "Prestazioni economiche"; suggerimenti AI dedicati
- Nota partner/convivente di fatto (D.Lgs 105/2022) nel wizard e nei risultati
- Fix ricerca CAP patronati (prefisso CAP, 1 cifra ok) + 8 nuove sedi nazionali
- Nuovo logo mano-cuore (MCI hand-heart), palette topics per argomento, card regione grande in home
- PracticalHelpSection nei risultati: 4 schede espandibili (Trasporti, ADI/SAD, Fisioterapia, RSA/sollievo) + PDF "Guida ai Servizi Sociali del Comune"
- Test: backend 27/27 pytest, frontend E2E validato (iteration_5.json)

## Iterazione 6 (Giugno 2026) — tutti i suggerimenti implementati
- Storico valutazioni in home (LE TUE VALUTAZIONI, max 3, riapribili) — home ora scrollabile
- Promemoria regionali negli Aiuti Pratici: banner regione + link portale ufficiale (10 regioni) + contatti trasporti dinamici per regione
- Guida Servizi Sociali salvata anche in Cassaforte se sbloccata (nome Guida_Servizi_Sociali_{regione}.pdf)
- Refactor: risultati/[id].tsx 1067→~400 righe; estratti AssistantCard, ShareModal, AppealSection, RightsSectionCard; nuova lib condivisa src/lib/vault.ts (usata da VaultSection, payment-success, PracticalHelpSection)
- Test: frontend E2E completo validato senza bug (iteration_6.json)

## Iterazione 7 (Giugno 2026) — UX wizard e riposizionamento blocchi
- RIMOSSO il modal "Attenzione, salva-tempo" nel wizard (passo 3): l'avviso è ora un banner inline giallo sotto le opzioni della Domanda 3; "Vedi i tuoi diritti" porta direttamente ai risultati (warn-continue-btn non esiste più)
- Card "IL PERCORSO — Hai la diagnosi in mano: e adesso?" SPOSTATA dai Risultati alla HOME, subito sotto "Inizia il percorso" (componente GuideStepsCard esportato da NextStepsSection)
- Rimosso l'indicatore 4-step dalla home; ordine home: branding → regione → Inizia il percorso → Percorso 5 passi → storico → box sostegno
- Risultati invariati per il resto (Patronati, cert explainer, 104/invalidità, vault, AI)
- Verificato con screenshot E2E: wizard 3 step senza modal, banner inline presente, percorso in home, risultati integri

## Iterazione 8 (Giugno 2026) — Pagine dedicate + immagini
- NUOVA pagina /territorio: "Aiuti sul Territorio" in grande, hero image, banner regione + portale, 4 schede con immagini di testata, download guida (salva anche in cassaforte)
- NUOVA pagina /patronati: "Dove inviare la pratica" con hero image e ricerca CAP + NUOVO tasto "Continua" sotto il campo CAP (fix "finestra non funziona")
- Risultati: Patronati e Territorio sostituiti da entry-card con immagini che portano alle nuove pagine; banner immagine "Diritti e Permessi — Legge 104" sopra le sezioni; Riepilogo (Scarica PDF/Condividi) SPOSTATO IN FONDO in card dedicata
- PDF arricchito: sezioni "Dove inviare la pratica" e "Aiuti pratici sul territorio"
- IMMAGINI: hero empatica in home ("Nessuno dovrebbe orientarsi da solo"), immagini nei 3 step del wizard (diagnosi/lavoro/certificato), banner nelle macro-categorie; tutte con angoli arrotondati 12-16, palette invariata — src/lib/images.ts (Unsplash CDN)
- Refactor: PracticalHelpSection eliminato → logica in src/lib/territorio.ts
- Verificato con screenshot E2E su home, wizard, risultati, patronati e territorio

## Iterazione 9 (Giugno 2026) — Logo ufficiale + mono + ordine home
- LOGO UFFICIALE dell'utente (nodo triangolare teal) integrato: assets/images/brand/mark.png (ritaglio quadrato) e lockup.png (logo+nome+payoff); Brand.tsx riscritto → Logo/Wordmark usano il mark, nuovo BrandLockup usato nella home al posto di titolo/sottotitolo
- "Inizia il percorso" SPOSTATO SOTTO la card "Il Percorso" in home (ordine: hero foto → lockup → desc → regione → percorso → inizia → storico → sostegno)
- IMMAGINI MONOCOLORE: Unsplash con &sat=-100 (grigio lato CDN) + velo blu brand — nuovo componente MonoImage usato in wizard (3 step), card territorio, entry-card risultati; gli hero ImageBackground diventano mono con l'overlay esistente
- NESSUN DEPLOY effettuato (richiesta esplicita utente)
- Verificato con screenshot: home, wizard, percorso
