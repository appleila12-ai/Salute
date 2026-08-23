# SaluteNav — Navigatore Sanitario

## Overview
Mobile dashboard (Italian + English) for a Legge 104 / Invalidità Civile navigator. Empathetic, highly accessible (WCAG AA+), soft blue/white + orange for warnings.

## Screens
1. **Home** (`app/index.tsx`)
   - Top bar: brand badge + language toggle (IT/EN)
   - Header: "Ciao / Navigatore Sanitario — La tua guida ai diritti e alla burocrazia"
   - Search bar (mock suggestions)
   - Primary CTA "Inizia la Valutazione Diritti" (opens warning modal → wizard)
   - Secondary CTA "Checklist Documenti per la Visita"
   - Accordion "Guida Salva-Tempo: Evita i 5 errori più comuni" (5 numbered cards)
   - Saved reports carousel + "Confronta valutazioni" link
   - Promemoria scadenze card with count badge
   - 4 feature cards
   - Percorso guidato banner

2. **Valutazione** (`app/valutazione.tsx`)
   - Warning modal (from home) prima dell'accesso
   - 3 required + 3 optional fields
   - Contract now includes **Inoccupato** (esenzioni, collocamento mirato L. 68/1999)
   - Results include category badges, PDF export, next-steps block, patronato CTA

3. **Checklist Documenti** (`app/checklist.tsx`)
   - 5 checkbox items con progress bar 0–100%
   - Salvataggio automatico nello storage
   - Chip "Tutto pronto!" quando 100%
   - Tip giallo "Porta sempre le fotocopie"
   - Reset via icona in header

4. **Patronato** (`app/patronato.tsx`)
   - Filtro CAP con ordinamento per prossimità
   - 10 patronati mock su tutta Italia
   - Chiama / Mappa / **Salva Contatto** (expo-contacts nativo, vCard su web)

5. **Promemoria** (`app/promemoria.tsx`)
   - Reminder tipo (ISEE, INPS, verbale, custom) + data + note
   - Local notifications via expo-notifications (native)
   - Fallback web con warning
   - Chip stato: "Tra Xg" / "In ritardo"

6. **Confronto** (`app/confronto.tsx`)
   - Selettore orizzontale delle valutazioni salvate
   - Diff highlights: Nuovi diritti (verde), Non più applicabili (rosso), In comune (blu)

7. **Storico dettaglio** (`app/storico/[id].tsx`) + Report shared component

## i18n
- `src/lib/i18n.tsx` — provider + `useI18n()` hook + `t()` + storage-backed language
- Dizionario copre home, wizard, risultati, patronato, checklist, promemoria, confronto, guida, warning
- Report content localizzato via `RIGHTS_TEXTS` map (IT + EN) — 20+ chiavi diritti

## Storage
- `salutenav:lang`
- `salutenav:reports`
- `salutenav:reminders`
- `salutenav:usercap`
- `salutenav:checklist`

## Design tokens
- Palette: `#2C6496` brand, `#EBF2FA` brandSecondary, `#FFFFFF`, `#111827`
- Warnings: `#D97706` + `#FEF3C7`
- Success: `#059669` + `#DCFCE7`
- Border radius: pill/lg/md
- Min touch target 44/56 pt

## Not built (yet)
- Real backend / cloud sync
- Auth / accounts
- AI-assisted rights lookup
- Community chat
