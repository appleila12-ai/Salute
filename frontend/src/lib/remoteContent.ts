// Contenuti aggiornabili dal server (importi, FAQ, glossario, dopo-verbale)
// con cache offline: quando cambia una legge si aggiorna solo il server.

import { storage } from "@/src/utils/storage";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const CACHE_KEY = "salutenav:remoteContent";

export interface Importo {
  nome: string;
  importo: string;
  requisiti: string;
  reddito: string;
  url: string;
}

export interface FaqItem {
  d: string;
  r: string;
}

export interface GlossaryItem {
  t: string;
  d: string;
}

export interface VerbaleStep {
  titolo: string;
  come: string;
}

export interface RiformaCambio {
  titolo: string;
  testo: string;
}

export interface RiformaFase {
  dal: string;
  etichetta: string;
  province: string[];
}

export interface Riforma {
  regimeNazionale: string;
  fonteUrl: string;
  intro: string;
  cosaCambia: RiformaCambio[];
  salvaguardia: string;
  fasi: RiformaFase[];
}

export interface LivelloSostegno {
  nome: string;
  colore: string;
  descrizione: string;
  fisco: string[];
  lavoro: string[];
}

export interface LivelliSostegno {
  intro: string;
  livelli: LivelloSostegno[];
}

export interface AppContent {
  updatedAt: string;
  fonte: string;
  importi: Importo[];
  faq: FaqItem[];
  glossario: GlossaryItem[];
  dopoVerbale: VerbaleStep[];
  riforma?: Riforma;
  livelliSostegno?: LivelliSostegno;
}

/** Scarica dal server; se offline usa la cache dell'ultima versione. */
export async function loadAppContent(): Promise<AppContent | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/content`);
    if (res.ok) {
      const data = (await res.json()) as AppContent;
      await storage.setItem(CACHE_KEY, JSON.stringify(data));
      return data;
    }
  } catch {
    /* offline: usa la cache */
  }
  const cached = await storage.getItem<string>(CACHE_KEY, "");
  if (cached) {
    try {
      return JSON.parse(cached) as AppContent;
    } catch {
      /* ignore */
    }
  }
  return null;
}

export function formatUpdatedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/** Normalizza un nome provincia per il confronto (accenti, trattini, spazi). */
export function normalizzaTesto(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-'\s]/g, "");
}

/** Cerca la provincia tra le fasi della sperimentazione (match esatto o prefisso). */
export function trovaProvincia(
  fasi: RiformaFase[],
  query: string,
): { fase: RiformaFase; provincia: string } | null {
  const q = normalizzaTesto(query);
  if (q.length < 3) return null;
  for (const fase of fasi) {
    for (const p of fase.province) {
      const np = normalizzaTesto(p);
      if (np === q || np.startsWith(q)) return { fase, provincia: p };
    }
  }
  return null;
}
