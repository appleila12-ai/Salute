# SaluteNav — Dashboard di Navigazione Sanitaria

## Overview
Mobile dashboard (Italian) for a health navigation app. Empathetic, highly accessible (WCAG AA+), soft blue & white design. No backend, all content mocked.

## Screens
1. **Home Dashboard** (`app/index.tsx`)
   - Warm greeting "Come possiamo aiutarti oggi?"
   - Search bar with live mock suggestions filtering
   - 4 vertical feature cards (large touch targets, Ionicons/MaterialCommunityIcons in `brandSecondary` boxes)
   - Bottom banner "Hai appena ricevuto una diagnosi?" with CTA "Inizia il Percorso Guidato"

2. **Feature Detail** (`app/feature/[id].tsx`)
   - Dynamic route for 4 features: `diritti`, `diagnosi`, `telemedicina`, `community`
   - Hero image with dark gradient scrim + back button
   - Empathetic intro + sections with bullet lists
   - Help card at bottom

3. **Percorso Guidato** (`app/percorso.tsx`)
   - 4-step wizard with progress bar
   - One question per step, single-select options
   - `Avanti` disabled until selection; `Concludi` on last step
   - Completion screen with summary + return to home

## Data
- `src/data/mockData.ts` — features content, search suggestions, wizard steps
- `src/theme.ts` — design tokens (colors, spacing, radius)

## Design tokens
- Palette: `#2C6496` (brand), `#EBF2FA` (brandSecondary), `#FFFFFF` surfaces, `#111827` text
- Radius: `md` 12, `lg` 20, `pill` 999
- Min touch target 56pt on cards, 44pt on icon buttons

## Integrations
- None (fully static/mock as requested)

## Not built (yet)
- Real search backend / AI assistance
- Real telemedicine booking
- Community chat
- Auth
