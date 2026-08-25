import { storage } from "@/src/utils/storage";
import { NEXT_STEPS } from "@/src/lib/content";

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
  diagnosisDate?: string; // legacy field — no longer displayed (era una data fittizia)
  work: WorkOption;
  cert: CertOption;
}

export interface RightSection {
  id: "permessi" | "sede" | "fiscali" | "prestazioni";
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

const PARTNER_FOOTER =
  "Anche il convivente di fatto (convivenza registrata all'anagrafe, L. 76/2016) ha gli stessi diritti del coniuge per permessi e congedo straordinario (D.Lgs. 105/2022).";

export function computeSections(a: Answers): RightSection[] {
  const isSelf = a.who === "Io stesso";
  const isPublic = a.work === "Dipendente Pubblico";
  const isPrivate = a.work === "Dipendente Privato";
  const isEmployee = isPublic || isPrivate;
  const isUnemployed = a.work === "Inoccupato/Pensionato";
  const isPartner = a.who === "Coniuge/Partner";

  const sections: RightSection[] = [];

  if (!isUnemployed) {
    // -------- Permessi e Congedo (solo se c'è un rapporto di lavoro) --------
    sections.push({
      id: "permessi",
      title: "Permessi lavorativi e Congedo Straordinario",
      intro: isEmployee
        ? `Se ${isSelf ? "sei" : whoRef(a.who) + " è"} riconosciuto con handicap grave (art. 3 c. 3 L.104), come lavoratore dipendente puoi richiedere questi benefici retribuiti.`
        : "Come lavoratore autonomo non maturi i permessi retribuiti, ma alcune tutele restano attive.",
      bullets: isEmployee
        ? [
            "3 giorni al mese di permesso retribuito, frazionabili anche in ore",
            !isSelf
              ? "Congedo straordinario retribuito fino a 2 anni per assistere un familiare con disabilità grave"
              : "Permessi orari giornalieri (1 o 2 ore) al posto dei 3 giorni",
            "Copertura contributiva figurativa durante i permessi",
          ]
        : [
            "Nessun permesso retribuito, ma detrazioni per le spese di assistenza",
            "Congedo di 2 anni possibile solo per il familiare dipendente convivente",
          ],
      footer: isPartner
        ? PARTNER_FOOTER
        : isEmployee
          ? "Il beneficio si attiva dopo l'invio della domanda telematica all'INPS."
          : undefined,
    });

    // -------- Sede lavorativa e smart working --------
    sections.push({
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
            "Precedenza nell'assegnazione al lavoro agile (D.Lgs. 105/2022)",
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
    });
  } else {
    // -------- Prestazioni economiche (inoccupati e pensionati) --------
    // Niente permessi/sede: senza contratto genererebbero solo confusione.
    sections.push({
      id: "prestazioni",
      title: "Prestazioni economiche e assistenziali",
      intro:
        "Senza un contratto di lavoro dipendente i permessi lavorativi non si applicano. L'invalidità civile però dà accesso a prestazioni economiche e assistenziali importanti.",
      bullets: [
        "Indennità di accompagnamento se serve assistenza continua o non si cammina autonomamente (senza limiti di età o reddito)",
        "Assegno mensile di assistenza con invalidità dal 74% (età lavorativa, entro limiti di reddito)",
        "Pensione di inabilità con invalidità al 100% (entro limiti di reddito)",
        "Dopo i 67 anni le prestazioni per invalidità parziale si trasformano in assegno sociale",
        "Iscrizione al collocamento mirato (L. 68/1999) se si cerca lavoro, con invalidità dal 46%",
      ],
      footer: isPartner
        ? PARTNER_FOOTER
        : "Gli importi vengono aggiornati ogni anno: verifica le cifre attuali con INPS o Patronato.",
    });
  }

  // -------- Esenzioni e Agevolazioni fiscali (sempre) --------
  sections.push({
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
  });

  return sections;
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

/** Storico delle valutazioni salvate sul dispositivo (più recente prima). */
export async function listReports(): Promise<Report[]> {
  return readLocal();
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
  const genDate = formatDate(r.createdAt);
  const stepsHtml = NEXT_STEPS.map(
    (s) =>
      `<li><b>${escapeHtml(s.title)}</b><br/><span class="step-body">${escapeHtml(s.body)}</span></li>`,
  ).join("");
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
<title>TutelApp — Report</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Helvetica Neue", Arial, sans-serif; color: #0F172A; padding: 40px; margin: 0; }
  .brand { color: #2A75D3; font-weight: 800; font-size: 13px; letter-spacing: 1.2px; text-transform: uppercase; }
  h1 { font-size: 24px; margin: 8px 0 4px 0; letter-spacing: -0.4px; }
  .date { color: #6B7280; font-size: 12px; margin-bottom: 24px; }
  .section-title { font-size: 12px; font-weight: 800; color: #6B7280; text-transform: uppercase; letter-spacing: 1.1px; margin: 24px 0 8px 0; }
  .card { background: #F4F7FA; border-radius: 12px; padding: 16px; margin-bottom: 8px; font-size: 13px; color: #1F2937; line-height: 1.5; }
  .right { background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 12px; padding: 18px; margin-bottom: 12px; }
  .right-title { font-weight: 700; color: #111827; margin-bottom: 6px; font-size: 15px; }
  .right-intro { color: #1F2937; font-size: 13px; line-height: 1.55; margin-bottom: 10px; }
  ul { margin: 0; padding-left: 20px; }
  li { font-size: 13px; color: #1F2937; line-height: 1.5; margin-bottom: 4px; }
  ol.steps { margin: 0; padding-left: 20px; }
  ol.steps li { font-size: 13px; color: #1F2937; line-height: 1.5; margin-bottom: 10px; }
  .step-body { color: #4B5563; font-size: 12px; }
  .footer-note { margin-top: 12px; padding-top: 10px; border-top: 1px dashed #E5E7EB; color: #6B7280; font-size: 12px; }
  .warn { background: #FEF3C7; border-left: 4px solid #D97706; border-radius: 8px; padding: 14px 16px; color: #78350F; font-size: 13px; line-height: 1.5; margin: 24px 0; }
  .disclaimer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #E5E7EB; color: #6B7280; font-size: 11px; line-height: 1.5; }
</style>
</head>
<body>
  <div class="brand">TutelApp</div>
  <h1>La tua guida ai diritti</h1>
  <div class="date">Report generato il ${genDate}</div>

  <div class="section-title">Le tue risposte</div>
  <div class="card">
    <div><b>Chi ha ricevuto la diagnosi:</b> ${escapeHtml(a.who)}</div>
    <div><b>Quando:</b> ${escapeHtml(a.when)}</div>
    <div><b>Situazione lavorativa:</b> ${escapeHtml(a.work)}</div>
    <div><b>Certificato INPS:</b> ${escapeHtml(a.cert)}</div>
  </div>

  <div class="warn">
    ⏰ Dal rilascio del certificato medico introduttivo hai <b>90 giorni</b> per inviare la domanda telematica all'INPS.
  </div>

  <div class="section-title">E adesso cosa faccio? Il percorso passo dopo passo</div>
  <ol class="steps">${stepsHtml}</ol>

  <div class="section-title">I tuoi diritti passo dopo passo</div>
  ${sectionsHtml}

  <div class="section-title">Dove inviare la pratica</div>
  <div class="card">
    <div>Il <b>Patronato</b> (ACLI, INCA CGIL, ITAL UIL, INAS CISL) presenta la domanda all'INPS <b>gratuitamente</b> al posto tuo.</div>
    <div style="margin-top:6px;">Porta con te: <b>Codice Fiscale</b>, <b>documento d'identità</b> e la <b>ricevuta con il numero di protocollo</b> del certificato medico introduttivo.</div>
  </div>

  <div class="section-title">Aiuti pratici sul territorio</div>
  <div class="card">
    <ul>
      <li><b>Trasporto per esami e visite:</b> trasporto protetto con la Pubblica Assistenza (richiesta tramite Medico di Medicina Generale o convenzione ASL).</li>
      <li><b>Assistenza a domicilio:</b> ADI della ASL (cure sanitarie, gratuita, la attiva il Medico Curante) e SAD del Comune (igiene e cura personale, via Servizi Sociali).</li>
      <li><b>Fisioterapia e riabilitazione:</b> cicli a domicilio o in centri convenzionati con prescrizione del fisiatra; verifica l'esenzione ticket.</li>
      <li><b>RSA e ricoveri di sollievo:</b> ricoveri temporanei tramite valutazione dell'Unità Valutativa Multidimensionale (UVM) della ASL.</li>
    </ul>
  </div>

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
