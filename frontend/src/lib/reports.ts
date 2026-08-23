import { storage } from "@/src/utils/storage";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const DEVICE_KEY = "salutenav:deviceId";

export type WhoOption = "Io stesso" | "Un genitore" | "Un figlio" | "Coniuge/Partner";
export type WhenOption = "Meno di 30 giorni fa" | "Da 1 a 6 mesi fa" | "Oltre 6 mesi fa";
export type WorkOption =
  | "Dipendente Privato"
  | "Dipendente Pubblico"
  | "Autonomo"
  | "Inoccupato/Pensionato";
export type CertOption = "Sì" | "No" | "Non so cos'è";

export interface Answers {
  who: WhoOption;
  when: WhenOption;
  diagnosisDate: string; // ISO — derived from `when`
  work: WorkOption;
  cert: CertOption;
}

export interface RightSection {
  id: "permessi" | "sede" | "fiscali";
  title: string;
  intro: string;
  bullets: string[];
  footer?: string;
}

export interface Report {
  id: string;
  createdAt: string;
  answers: Answers;
  sections: RightSection[];
  shareToken?: string;
}

const whoRef = (w: WhoOption): string => {
  switch (w) {
    case "Io stesso":
      return "te stesso";
    case "Un genitore":
      return "tuo genitore";
    case "Un figlio":
      return "tuo figlio";
    case "Coniuge/Partner":
      return "il tuo coniuge o partner";
  }
};

export function computeSections(a: Answers): RightSection[] {
  const isSelf = a.who === "Io stesso";
  const isPublic = a.work === "Dipendente Pubblico";
  const isPrivate = a.work === "Dipendente Privato";
  const isEmployee = isPublic || isPrivate;
  // cert not currently used in the returned sections but kept in `a` for context.

  // -------- Section 1: Permessi e Congedo --------
  const s1: RightSection = {
    id: "permessi",
    title: "Permessi lavorativi e Congedo Straordinario",
    intro: isEmployee
      ? `Se ${isSelf ? "sei" : whoRef(a.who) + " è"} riconosciuto con handicap grave (art. 3 c. 3 L.104), come lavoratore dipendente puoi richiedere questi benefici retribuiti.`
      : a.work === "Autonomo"
        ? "Come lavoratore autonomo non maturi i permessi retribuiti, ma alcune tutele restano attive."
        : "Non essendoci un contratto di lavoro dipendente, i permessi non si applicano. Restano però attive altre tutele.",
    bullets:
      isEmployee
        ? [
            "3 giorni al mese di permesso retribuito, frazionabili anche in ore",
            !isSelf
              ? "Congedo straordinario retribuito fino a 2 anni per assistere un familiare con disabilità grave"
              : "Permessi orari giornalieri (1 o 2 ore) al posto dei 3 giorni",
            "Copertura contributiva figurativa durante i permessi",
          ]
        : a.work === "Autonomo"
          ? [
              "Nessun permesso retribuito, ma detrazioni per le spese di assistenza",
              "Congedo di 2 anni possibile solo per il familiare dipendente convivente",
            ]
          : [
              "Nessun permesso lavorativo perché manca il contratto",
              "Priorità nel collocamento mirato (L. 68/1999) per l'inserimento lavorativo",
            ],
    footer: isEmployee
      ? "Il beneficio si attiva dopo l'invio della domanda telematica all'INPS."
      : undefined,
  };

  // -------- Section 2: Sede lavorativa e smart working --------
  const s2: RightSection = {
    id: "sede",
    title: "Scelta della sede lavorativa e priorità smart working",
    intro: isPublic
      ? "Nel pubblico impiego hai priorità assoluta nella scelta della sede più vicina alla persona assistita."
      : isPrivate
        ? "Come dipendente privato hai protezioni forti contro trasferimenti indesiderati e accesso prioritario al lavoro agile."
        : "Il diritto alla sede si applica solo ai lavoratori dipendenti. Puoi comunque richiedere adattamenti in altri contesti.",
    bullets: isPublic
      ? [
          "Priorità nella scelta della sede al momento dell'assunzione o del trasferimento",
          "Diritto di rifiutare il trasferimento verso sede più lontana dal familiare assistito",
          "Precedenza nell'assegnazione al lavoro agile (D.L. 105/2022)",
        ]
      : isPrivate
        ? [
            "Nessun trasferimento senza consenso ad altra sede (art. 33 c. 5 L.104)",
            "Diritto di priorità al lavoro agile / smart working",
            "Diritto di trasferimento verso sede più vicina, se disponibile",
        ]
        : [
            "Non applicabile in assenza di rapporto di lavoro subordinato",
            "Se cambi contratto ricontrolla i tuoi diritti",
          ],
  };

  // -------- Section 3: Esenzioni e Agevolazioni fiscali --------
  const s3: RightSection = {
    id: "fiscali",
    title: "Esenzione ticket e Agevolazioni fiscali",
    intro:
      "Le esenzioni e le detrazioni si applicano sempre, indipendentemente dal tipo di contratto di lavoro.",
    bullets: [
      "Esenzione del ticket sanitario per visite ed esami legati alla patologia",
      "Detrazione IRPEF del 19% sulle spese sanitarie e sull'acquisto di ausili",
      "IVA agevolata al 4% su auto, computer e strumenti tecnici",
      "Esenzione bollo auto e imposta di trascrizione per un veicolo",
      "Detrazioni fino a €2.100/anno per l'assistenza di persone non autosufficienti",
    ],
    footer:
      "Per applicare le esenzioni serve il verbale di invalidità civile e/o handicap.",
  };

  return [s1, s2, s3];
}

// -------- Utility: derive ISO date from "when" bucket (mid-point) --------
export function deriveDiagnosisDate(when: WhenOption): string {
  const now = new Date();
  const past = new Date(now);
  if (when === "Meno di 30 giorni fa") past.setDate(now.getDate() - 15);
  else if (when === "Da 1 a 6 mesi fa") past.setMonth(now.getMonth() - 3);
  else past.setMonth(now.getMonth() - 9);
  return past.toISOString();
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// -------- Storage --------
const REPORTS_KEY = "salutenav:reports";

async function getDeviceId(): Promise<string> {
  const existing = await storage.secureGet<string>(DEVICE_KEY, "");
  if (existing) return existing;
  const id = `d-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  await storage.secureSet(DEVICE_KEY, id);
  return id;
}

async function readLocal(): Promise<Report[]> {
  const raw = await storage.getItem<string>(REPORTS_KEY, "");
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Report[]) : [];
  } catch {
    return [];
  }
}

async function writeLocal(list: Report[]): Promise<void> {
  await storage.setItem(REPORTS_KEY, JSON.stringify(list.slice(0, 20)));
}

async function syncToBackend(report: Report): Promise<Report> {
  if (!BACKEND_URL) return report;
  try {
    const deviceId = await getDeviceId();
    const res = await fetch(`${BACKEND_URL}/api/reports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...report, deviceId }),
    });
    if (!res.ok) return report;
    const data = await res.json();
    return { ...report, shareToken: data.shareToken };
  } catch (e) {
    console.warn("sync failed", e);
    return report;
  }
}

export async function saveReport(answers: Answers): Promise<Report> {
  const localReport: Report = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    answers,
    sections: computeSections(answers),
  };
  const list = await readLocal();
  list.unshift(localReport);
  await writeLocal(list);
  // Fire-and-forget sync so we can also share
  const synced = await syncToBackend(localReport);
  if (synced.shareToken && synced.shareToken !== localReport.shareToken) {
    const updated = list.map((r) => (r.id === localReport.id ? synced : r));
    await writeLocal(updated);
    return synced;
  }
  return localReport;
}

export async function getReport(id: string): Promise<Report | null> {
  const list = await readLocal();
  return list.find((r) => r.id === id) ?? null;
}

export function getShareUrl(report: Report): string | null {
  if (!report.shareToken || !BACKEND_URL) return null;
  return `${BACKEND_URL}/api/reports/share/${report.shareToken}`;
}

export function getQrUrl(data: string): string {
  const encoded = encodeURIComponent(data);
  return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=8&data=${encoded}`;
}

export async function askAssistant(
  question: string,
  answers?: Answers,
): Promise<string> {
  if (!BACKEND_URL) return "Servizio non disponibile.";
  const res = await fetch(`${BACKEND_URL}/api/assistant`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question,
      context: answers
        ? {
            who: answers.who,
            when: answers.when,
            work: answers.work,
            cert: answers.cert,
          }
        : undefined,
    }),
  });
  if (!res.ok) {
    throw new Error(`assistant ${res.status}`);
  }
  const data = await res.json();
  return data.answer as string;
}

// -------- PDF --------
export function buildReportHtml(r: Report): string {
  const a = r.answers;
  const diagDate = formatDate(a.diagnosisDate);
  const genDate = formatDate(r.createdAt);
  const sectionsHtml = r.sections
    .map((s) => {
      const bullets = s.bullets
        .map((b) => `<li>${escapeHtml(b)}</li>`)
        .join("");
      const footer = s.footer
        ? `<div class="footer-note">${escapeHtml(s.footer)}</div>`
        : "";
      return `
      <div class="right">
        <div class="right-title">${escapeHtml(s.title)}</div>
        <div class="right-intro">${escapeHtml(s.intro)}</div>
        <ul>${bullets}</ul>
        ${footer}
      </div>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8" />
<title>Navigatore Sanitario — Report</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Helvetica Neue", Arial, sans-serif; color: #111827; padding: 40px; margin: 0; }
  .brand { color: #2C6496; font-weight: 800; font-size: 13px; letter-spacing: 1.2px; text-transform: uppercase; }
  h1 { font-size: 24px; margin: 8px 0 4px 0; letter-spacing: -0.4px; }
  .date { color: #6B7280; font-size: 12px; margin-bottom: 24px; }
  .section-title { font-size: 12px; font-weight: 800; color: #6B7280; text-transform: uppercase; letter-spacing: 1.1px; margin: 24px 0 8px 0; }
  .card { background: #F4F7FA; border-radius: 12px; padding: 16px; margin-bottom: 8px; font-size: 13px; color: #1F2937; line-height: 1.5; }
  .right { background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 12px; padding: 18px; margin-bottom: 12px; }
  .right-title { font-weight: 700; color: #111827; margin-bottom: 6px; font-size: 15px; }
  .right-intro { color: #1F2937; font-size: 13px; line-height: 1.55; margin-bottom: 10px; }
  ul { margin: 0; padding-left: 20px; }
  li { font-size: 13px; color: #1F2937; line-height: 1.5; margin-bottom: 4px; }
  .footer-note { margin-top: 12px; padding-top: 10px; border-top: 1px dashed #E5E7EB; color: #6B7280; font-size: 12px; }
  .warn { background: #FEF3C7; border-left: 4px solid #D97706; border-radius: 8px; padding: 14px 16px; color: #78350F; font-size: 13px; line-height: 1.5; margin: 24px 0; }
  .disclaimer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #E5E7EB; color: #6B7280; font-size: 11px; line-height: 1.5; }
</style>
</head>
<body>
  <div class="brand">Navigatore Sanitario</div>
  <h1>La tua guida ai diritti</h1>
  <div class="date">Report generato il ${genDate}</div>

  <div class="section-title">Le tue risposte</div>
  <div class="card">
    <div><b>Chi ha ricevuto la diagnosi:</b> ${escapeHtml(a.who)}</div>
    <div><b>Data della diagnosi:</b> ${escapeHtml(diagDate)} (${escapeHtml(a.when.toLowerCase())})</div>
    <div><b>Situazione lavorativa:</b> ${escapeHtml(a.work)}</div>
    <div><b>Certificato INPS:</b> ${escapeHtml(a.cert)}</div>
  </div>

  <div class="warn">
    ⏰ Dal rilascio del certificato medico introduttivo hai <b>90 giorni</b> per inviare la domanda telematica all'INPS.
  </div>

  <div class="section-title">I tuoi diritti passo dopo passo</div>
  ${sectionsHtml}

  <div class="disclaimer">
    Il contenuto di questo report è orientativo e generato in base alle risposte fornite. Per la conferma nel tuo caso specifico rivolgiti a un patronato, a un CAF o al tuo ufficio HR/Personale.
  </div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
