import { Lang, translate as trS } from "@/src/lib/i18n";
import { storage } from "@/src/utils/storage";

export type AssistedOption =
  | "Me stesso"
  | "Genitore"
  | "Figlio"
  | "Coniuge/Partner";

export type ContractOption =
  | "Dipendente Privato"
  | "Dipendente Pubblico"
  | "Autonomo"
  | "Inoccupato";

export type VerbaleOption = "Sì" | "No" | "In corso di richiesta";

export const ITALIAN_REGIONS = [
  "Abruzzo",
  "Basilicata",
  "Calabria",
  "Campania",
  "Emilia-Romagna",
  "Friuli-Venezia Giulia",
  "Lazio",
  "Liguria",
  "Lombardia",
  "Marche",
  "Molise",
  "Piemonte",
  "Puglia",
  "Sardegna",
  "Sicilia",
  "Toscana",
  "Trentino-Alto Adige",
  "Umbria",
  "Valle d'Aosta",
  "Veneto",
] as const;

export type Region = (typeof ITALIAN_REGIONS)[number];

export interface Answers {
  assisted: AssistedOption;
  contract: ContractOption;
  verbale: VerbaleOption;
  age?: string;
  diagnosis?: string;
  region?: Region;
}

export type RightCategory =
  | "permessi"
  | "fiscale"
  | "lavoro"
  | "iter"
  | "regionale"
  | "personalizzato";

export interface RightRef {
  id: string;
  category: RightCategory;
  params?: Record<string, string>;
}

export interface Report {
  id: string;
  createdAt: string;
  answers: Answers;
  rights: RightRef[];
}

// -------- Localized text for rights --------
type BiText = { it: string; en: string };
type RightText = { title: BiText; body: BiText };

const RIGHTS_TEXTS: Record<string, RightText> = {
  "perm.3days.self": {
    title: {
      it: "3 giorni di permesso mensile retribuito",
      en: "3 paid leave days per month",
    },
    body: {
      it: "Puoi richiedere 3 giorni al mese di permesso retribuito per te stesso all'INPS.",
      en: "You can request 3 paid leave days per month for yourself from INPS.",
    },
  },
  "perm.3days.other": {
    title: {
      it: "3 giorni di permesso mensile retribuito",
      en: "3 paid leave days per month",
    },
    body: {
      it: "Puoi richiedere 3 giorni al mese di permesso retribuito per assistere {who}.",
      en: "You can request 3 paid leave days per month to care for {who}.",
    },
  },
  "fiscal.deductions": {
    title: { it: "Agevolazioni fiscali", en: "Tax benefits" },
    body: {
      it: "Detrazione IRPEF del 19% sulle spese sanitarie, IVA agevolata al 4% su auto e ausili tecnici, esenzione bollo auto.",
      en: "19% IRPEF deduction on medical expenses, 4% VAT on cars and technical aids, car tax exemption.",
    },
  },
  "perm.congedo": {
    title: {
      it: "Congedo straordinario retribuito",
      en: "Extraordinary paid leave",
    },
    body: {
      it: "Fino a 2 anni di congedo straordinario retribuito per assistere un familiare con disabilità grave (art. 42 D.Lgs. 151/2001).",
      en: "Up to 2 years of extraordinary paid leave to care for a severely disabled family member (art. 42 D.Lgs. 151/2001).",
    },
  },
  "iter.waitVerbale": {
    title: { it: "Attesa del verbale", en: "Awaiting the certificate" },
    body: {
      it: "La commissione medica ASL ha 90 giorni per rispondere (15 giorni per patologie oncologiche). Nel frattempo raccogli tutta la documentazione sanitaria.",
      en: "The ASL medical board has 90 days to reply (15 days for oncology). In the meantime gather all medical documentation.",
    },
  },
  "iter.patronato": {
    title: {
      it: "Presentazione al patronato",
      en: "Support from a patronato",
    },
    body: {
      it: "Un patronato può assisterti gratuitamente nella pratica INPS e in eventuali ricorsi in caso di rigetto.",
      en: "A patronato can help you free of charge with the INPS application and any appeals.",
    },
  },
  "iter.request": {
    title: {
      it: "Come richiedere il verbale",
      en: "How to request the certificate",
    },
    body: {
      it: "Chiedi al medico di base il certificato SS3 telematico e presenta domanda all'INPS. È il primo passo per accedere ai benefici della Legge 104.",
      en: "Ask your GP for the digital SS3 certificate and submit the request to INPS. This is the first step to access Law 104 benefits.",
    },
  },
  "work.pubblico": {
    title: {
      it: "Priorità sede di lavoro (Pubblico)",
      en: "Workplace priority (Public sector)",
    },
    body: {
      it: "Come dipendente pubblico hai diritto alla scelta prioritaria della sede più vicina alla persona assistita (art. 33 c. 5 L. 104).",
      en: "As a public-sector employee you have priority to choose the workplace nearest to the person you care for (art. 33 c. 5 Law 104).",
    },
  },
  "work.privato": {
    title: {
      it: "Tutela contro trasferimenti (Privato)",
      en: "Protection against transfers (Private)",
    },
    body: {
      it: "Non puoi essere trasferito senza consenso ad altra sede se sei beneficiario di Legge 104 art. 33.",
      en: "You cannot be transferred to a different workplace without consent if you benefit from Law 104 art. 33.",
    },
  },
  "work.autonomo": {
    title: {
      it: "Autonomi: agevolazioni fiscali",
      en: "Self-employed: tax benefits",
    },
    body: {
      it: "Come lavoratore autonomo non hai diritto ai permessi retribuiti, ma puoi accedere a detrazioni fiscali e contributi regionali per l'acquisto di ausili.",
      en: "As a self-employed worker you don't get paid leave, but you can access tax deductions and regional grants for assistive devices.",
    },
  },
  "work.inoccupato": {
    title: {
      it: "Inoccupato: esenzioni e contributi",
      en: "Unemployed: exemptions and grants",
    },
    body: {
      it: "Senza contratto attivo non maturi permessi retribuiti, ma con il verbale ottieni esenzione ticket, iscrizione preferenziale al collocamento mirato (L. 68/1999) e accesso ai fondi regionali per l'assistenza.",
      en: "Without an active contract you don't earn paid leave, but with the certificate you get ticket exemption, priority in the targeted job placement (Law 68/1999) and access to regional care funds.",
    },
  },
  "personalizzato.minori": {
    title: {
      it: "Indennità di frequenza (minori)",
      en: "Attendance allowance (minors)",
    },
    body: {
      it: "Se hai meno di 18 anni e frequenti scuole o centri di riabilitazione, potresti avere diritto all'indennità di frequenza INPS (circa €333/mese nel 2026).",
      en: "Under-18s attending school or rehabilitation centres may be entitled to INPS attendance allowance (~€333/month in 2026).",
    },
  },
  "personalizzato.over65": {
    title: {
      it: "Indennità di accompagnamento (over 65)",
      en: "Attendance allowance (over 65)",
    },
    body: {
      it: "Per persone over 65 non autosufficienti, l'indennità di accompagnamento è di circa €531/mese, indipendentemente dal reddito.",
      en: "For over-65s who are not self-sufficient, the attendance allowance is ~€531/month, regardless of income.",
    },
  },
  "personalizzato.oncologico": {
    title: {
      it: "Corsia preferenziale per patologie oncologiche",
      en: "Fast track for oncology patients",
    },
    body: {
      it: "La commissione ASL è tenuta a rispondere entro 15 giorni. Hai anche diritto al congedo retribuito fino a 30 giorni l'anno per cure e visite.",
      en: "The ASL board must reply within 15 days. You are also entitled to up to 30 paid leave days a year for treatments and visits.",
    },
  },
  "personalizzato.malattierare": {
    title: {
      it: "Registro Nazionale Malattie Rare",
      en: "National Rare Diseases Registry",
    },
    body: {
      it: "Iscrivendoti al Registro Nazionale hai diritto all'esenzione totale del ticket sanitario e all'accesso a centri specializzati.",
      en: "By joining the National Registry you get full ticket exemption and access to specialised centres.",
    },
  },
  "regional.generic": {
    title: {
      it: "Agevolazioni regionali — {region}",
      en: "Regional benefits — {region}",
    },
    body: {
      it: "Verifica presso il tuo Comune o l'ATS/ASL di residenza eventuali contributi locali per assistenza domiciliare, ausili o vita indipendente.",
      en: "Check with your Municipality or local health authority for local grants for home care, aids or independent living.",
    },
  },
  "regional.Lombardia": {
    title: {
      it: "Bonus regionale ausili — Lombardia",
      en: "Regional aids bonus — Lombardy",
    },
    body: {
      it: "Contributo regionale fino a €600 per l'acquisto di ausili tecnici e informatici non coperti dal SSN. Domanda tramite ATS di residenza.",
      en: "Regional grant up to €600 for technical and IT aids not covered by the NHS. Apply through your local ATS.",
    },
  },
  "regional.Lazio": {
    title: { it: "Assegno di cura — Regione Lazio", en: "Care allowance — Lazio" },
    body: {
      it: "Fino a €700/mese per assistenza domiciliare a persone non autosufficienti. Presenta la domanda al distretto socio-sanitario.",
      en: "Up to €700/month for home care for non-self-sufficient people. Apply at your local social-health district.",
    },
  },
  "regional.Emilia-Romagna": {
    title: {
      it: "Assegno di cura — Emilia-Romagna",
      en: "Care allowance — Emilia-Romagna",
    },
    body: {
      it: "Contributo mensile per famiglie che assistono un familiare non autosufficiente al proprio domicilio.",
      en: "Monthly grant for families caring for a non-self-sufficient relative at home.",
    },
  },
  "regional.Piemonte": {
    title: {
      it: "Contributi mobilità — Regione Piemonte",
      en: "Mobility grants — Piedmont",
    },
    body: {
      it: "Contributi per l'adattamento del veicolo o l'acquisto di mezzi per il trasporto di persone con disabilità.",
      en: "Grants for vehicle adaptations or transport for persons with disabilities.",
    },
  },
  "regional.Veneto": {
    title: {
      it: "Impegnativa di Cura Domiciliare (ICD) — Veneto",
      en: "Home Care Grant (ICD) — Veneto",
    },
    body: {
      it: "Contributo economico per l'assistenza domiciliare, da €120 a €600 mensili in base al livello di non autosufficienza.",
      en: "Monthly grant for home care from €120 to €600 depending on the level of dependency.",
    },
  },
  "regional.Toscana": {
    title: {
      it: "Progetto Vita Indipendente — Toscana",
      en: "Independent Living Project — Tuscany",
    },
    body: {
      it: "Contributo per l'assistente personale e progetti di vita indipendente per persone con disabilità grave.",
      en: "Grant for personal assistant and independent living projects for severely disabled people.",
    },
  },
  "regional.Campania": {
    title: {
      it: "Assegno di cura — Regione Campania",
      en: "Care allowance — Campania",
    },
    body: {
      it: "Contributo mensile per l'assistenza domiciliare di persone non autosufficienti, erogato tramite gli Ambiti Territoriali.",
      en: "Monthly grant for home care for non-self-sufficient people, provided through Territorial Areas.",
    },
  },
  "regional.Sicilia": {
    title: {
      it: "Fondo per la disabilità — Sicilia",
      en: "Disability Fund — Sicily",
    },
    body: {
      it: "Contributi per progetti di vita indipendente e per l'acquisto di ausili tecnici. Domanda al Comune di residenza.",
      en: "Grants for independent living projects and technical aids. Apply at your Municipality.",
    },
  },
  "regional.Puglia": {
    title: {
      it: "Assegno di cura — Regione Puglia",
      en: "Care allowance — Apulia",
    },
    body: {
      it: "Contributo economico a persone non autosufficienti assistite a domicilio da familiari o assistenti personali.",
      en: "Grant for non-self-sufficient people cared for at home by relatives or personal assistants.",
    },
  },
  "regional.Liguria": {
    title: {
      it: "Fondo per la Non Autosufficienza — Liguria",
      en: "Non-Self-Sufficiency Fund — Liguria",
    },
    body: {
      it: "Contributo per assistenza domiciliare integrata e progetti di vita indipendente.",
      en: "Grant for integrated home care and independent living projects.",
    },
  },
};

const ASSISTED_TR: Record<AssistedOption, BiText> = {
  "Me stesso": { it: "te stesso", en: "yourself" },
  Genitore: { it: "genitore", en: "parent" },
  Figlio: { it: "figlio", en: "child" },
  "Coniuge/Partner": { it: "coniuge/partner", en: "spouse/partner" },
};

const CATEGORY_FOR_ID: Record<string, RightCategory> = {
  "perm.3days.self": "permessi",
  "perm.3days.other": "permessi",
  "fiscal.deductions": "fiscale",
  "perm.congedo": "permessi",
  "iter.waitVerbale": "iter",
  "iter.patronato": "iter",
  "iter.request": "iter",
  "work.pubblico": "lavoro",
  "work.privato": "lavoro",
  "work.autonomo": "lavoro",
  "work.inoccupato": "lavoro",
  "personalizzato.minori": "personalizzato",
  "personalizzato.over65": "personalizzato",
  "personalizzato.oncologico": "personalizzato",
  "personalizzato.malattierare": "personalizzato",
  "regional.generic": "regionale",
  // regional.{Region} handled dynamically
};

function applyParams(s: string, params?: Record<string, string>): string {
  if (!params) return s;
  return Object.keys(params).reduce(
    (acc, k) => acc.replaceAll(`{${k}}`, params[k]),
    s,
  );
}

export function resolveRight(
  r: RightRef,
  lang: Lang,
): { title: string; body: string; category: RightCategory } {
  const text = RIGHTS_TEXTS[r.id];
  const category =
    r.category ??
    CATEGORY_FOR_ID[r.id] ??
    (r.id.startsWith("regional.") ? "regionale" : "personalizzato");
  if (!text) {
    return {
      title: r.id,
      body: "",
      category,
    };
  }
  return {
    title: applyParams(text.title[lang], r.params),
    body: applyParams(text.body[lang], r.params),
    category,
  };
}

// -------- Compute --------
export function computeRightRefs(a: Answers): RightRef[] {
  const list: RightRef[] = [];

  if (a.verbale === "Sì") {
    if (a.assisted === "Me stesso") {
      list.push({ id: "perm.3days.self", category: "permessi" });
    } else {
      list.push({
        id: "perm.3days.other",
        category: "permessi",
        params: { assistedKey: a.assisted },
      });
    }
    list.push({ id: "fiscal.deductions", category: "fiscale" });
    if (a.assisted !== "Me stesso") {
      list.push({ id: "perm.congedo", category: "permessi" });
    }
  } else if (a.verbale === "In corso di richiesta") {
    list.push({ id: "iter.waitVerbale", category: "iter" });
    list.push({ id: "iter.patronato", category: "iter" });
  } else {
    list.push({ id: "iter.request", category: "iter" });
  }

  if (a.contract === "Dipendente Pubblico") {
    list.push({ id: "work.pubblico", category: "lavoro" });
  } else if (a.contract === "Dipendente Privato") {
    list.push({ id: "work.privato", category: "lavoro" });
  } else if (a.contract === "Autonomo") {
    list.push({ id: "work.autonomo", category: "lavoro" });
  } else {
    list.push({ id: "work.inoccupato", category: "lavoro" });
  }

  if (a.region) {
    const key = `regional.${a.region}`;
    if (RIGHTS_TEXTS[key]) {
      list.push({ id: key, category: "regionale" });
    } else {
      list.push({
        id: "regional.generic",
        category: "regionale",
        params: { region: a.region },
      });
    }
  }

  const age = a.age ? parseInt(a.age, 10) : NaN;
  if (!Number.isNaN(age)) {
    if (age < 18) list.push({ id: "personalizzato.minori", category: "personalizzato" });
    else if (age >= 65)
      list.push({ id: "personalizzato.over65", category: "personalizzato" });
  }

  if (a.diagnosis && a.diagnosis.trim().length > 0) {
    const d = a.diagnosis.toLowerCase();
    if (d.includes("oncolog") || d.includes("tumor") || d.includes("cancro") || d.includes("cancer")) {
      list.push({ id: "personalizzato.oncologico", category: "personalizzato" });
    } else if (d.includes("rara") || d.includes("rare")) {
      list.push({ id: "personalizzato.malattierare", category: "personalizzato" });
    }
  }

  return list;
}

// Resolve params (assisted translation) at render time so the "who" varies with lang.
export function resolveRightWithAnswers(
  r: RightRef,
  a: Answers,
  lang: Lang,
): { title: string; body: string; category: RightCategory } {
  const resolved = { ...r };
  if (r.id === "perm.3days.other") {
    const who = ASSISTED_TR[a.assisted]?.[lang] ?? a.assisted;
    resolved.params = { ...r.params, who };
  }
  return resolveRight(resolved, lang);
}

// -------- Storage --------
const REPORTS_KEY = "salutenav:reports";

async function readAll(): Promise<Report[]> {
  const raw = await storage.getItem<string>(REPORTS_KEY, "");
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Report[]) : [];
  } catch {
    return [];
  }
}

async function writeAll(list: Report[]): Promise<void> {
  await storage.setItem(REPORTS_KEY, JSON.stringify(list));
}

export async function saveReport(answers: Answers): Promise<Report> {
  const report: Report = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    answers,
    rights: computeRightRefs(answers),
  };
  const list = await readAll();
  list.unshift(report);
  await writeAll(list.slice(0, 20));
  return report;
}

export async function getReports(): Promise<Report[]> {
  return readAll();
}

export async function getReport(id: string): Promise<Report | null> {
  const list = await readAll();
  return list.find((r) => r.id === id) ?? null;
}

export async function deleteReport(id: string): Promise<void> {
  const list = await readAll();
  await writeAll(list.filter((r) => r.id !== id));
}

// -------- PDF --------
export function buildReportHtml(r: Report, lang: Lang): string {
  const locale = lang === "en" ? "en-GB" : "it-IT";
  const dateFmt = new Date(r.createdAt).toLocaleDateString(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const a = r.answers;

  const rightsHtml = r.rights
    .map((right) => {
      const { title, body } = resolveRightWithAnswers(right, a, lang);
      return `
      <div class="right">
        <div class="right-title">${escapeHtml(title)}</div>
        <div class="right-body">${escapeHtml(body)}</div>
      </div>`;
    })
    .join("");

  const summaryLine = (labelKey: any, value: string) =>
    `<div><b>${escapeHtml(trS(labelKey, lang))}:</b> ${escapeHtml(value)}</div>`;

  const extras: string[] = [];
  if (a.age) extras.push(summaryLine("res.summary.age", a.age));
  if (a.diagnosis) extras.push(summaryLine("res.summary.diagnosis", a.diagnosis));
  if (a.region) extras.push(summaryLine("res.summary.region", a.region));

  return `
<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(trS("val.title", lang))}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Helvetica Neue", Arial, sans-serif; color: #111827; padding: 40px; margin: 0; }
  .brand { color: #2C6496; font-weight: 800; font-size: 14px; letter-spacing: 1.2px; text-transform: uppercase; }
  h1 { font-size: 26px; margin: 8px 0 4px 0; letter-spacing: -0.5px; }
  .date { color: #6B7280; font-size: 13px; margin-bottom: 24px; }
  .section-title { font-size: 12px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 1.1px; margin: 24px 0 8px 0; }
  .card { background: #F4F7FA; border-radius: 12px; padding: 16px; margin-bottom: 8px; }
  .card div { font-size: 14px; color: #1F2937; line-height: 1.5; }
  .right { background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 12px; padding: 16px; margin-bottom: 10px; }
  .right-title { font-weight: 700; color: #111827; margin-bottom: 6px; font-size: 15px; }
  .right-body { color: #1F2937; font-size: 13px; line-height: 1.55; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #E5E7EB; color: #6B7280; font-size: 11px; line-height: 1.5; }
</style>
</head>
<body>
  <div class="brand">SaluteNav — ${escapeHtml(trS("val.title", lang))}</div>
  <h1>${escapeHtml(trS("val.title", lang))}</h1>
  <div class="date">${escapeHtml(trS("res.generatedOn", lang))} ${dateFmt}</div>

  <div class="section-title">${lang === "en" ? "Your answers" : "Le tue risposte"}</div>
  <div class="card">
    ${summaryLine("res.summary.assisted", a.assisted)}
    ${summaryLine("res.summary.contract", a.contract)}
    ${summaryLine("res.summary.verbale", a.verbale)}
    ${extras.join("")}
  </div>

  <div class="section-title">${lang === "en" ? "Rights and benefits" : "Diritti e agevolazioni"}</div>
  ${rightsHtml}

  <div class="footer">${escapeHtml(trS("res.disclaimer", lang))}</div>
</body>
</html>
  `;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
