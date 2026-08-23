import { storage } from "@/src/utils/storage";

export type AssistedOption =
  | "Me stesso"
  | "Genitore"
  | "Figlio"
  | "Coniuge/Partner";

export type ContractOption =
  | "Dipendente Privato"
  | "Dipendente Pubblico"
  | "Autonomo";

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

export interface Right {
  title: string;
  body: string;
  category: RightCategory;
}

export interface Report {
  id: string;
  createdAt: string;
  answers: Answers;
  rights: Right[];
}

const REGIONAL_BONUSES: Partial<Record<Region, Right>> = {
  Lombardia: {
    title: "Bonus regionale ausili — Lombardia",
    body:
      "Contributo regionale fino a €600 per l'acquisto di ausili tecnici e informatici non coperti dal SSN. Domanda tramite ATS di residenza.",
    category: "regionale",
  },
  Lazio: {
    title: "Assegno di cura — Regione Lazio",
    body:
      "Fino a €700/mese per assistenza domiciliare a persone non autosufficienti. Presenta la domanda al distretto socio-sanitario.",
    category: "regionale",
  },
  "Emilia-Romagna": {
    title: "Assegno di cura — Emilia-Romagna",
    body:
      "Contributo mensile per famiglie che assistono un familiare non autosufficiente al proprio domicilio.",
    category: "regionale",
  },
  Piemonte: {
    title: "Contributi mobilità — Regione Piemonte",
    body:
      "Contributi per l'adattamento del veicolo o l'acquisto di mezzi per il trasporto di persone con disabilità.",
    category: "regionale",
  },
  Veneto: {
    title: "Impegnativa di Cura Domiciliare (ICD) — Veneto",
    body:
      "Contributo economico per l'assistenza domiciliare, da €120 a €600 mensili in base al livello di non autosufficienza.",
    category: "regionale",
  },
  Toscana: {
    title: "Progetto Vita Indipendente — Toscana",
    body:
      "Contributo per l'assistente personale e progetti di vita indipendente per persone con disabilità grave.",
    category: "regionale",
  },
  Campania: {
    title: "Assegno di cura — Regione Campania",
    body:
      "Contributo mensile per l'assistenza domiciliare di persone non autosufficienti, erogato tramite gli Ambiti Territoriali.",
    category: "regionale",
  },
  Sicilia: {
    title: "Fondo per la disabilità — Sicilia",
    body:
      "Contributi per progetti di vita indipendente e per l'acquisto di ausili tecnici. Domanda al Comune di residenza.",
    category: "regionale",
  },
  Puglia: {
    title: "Assegno di cura — Regione Puglia",
    body:
      "Contributo economico a persone non autosufficienti assistite a domicilio da familiari o assistenti personali.",
    category: "regionale",
  },
  Liguria: {
    title: "Fondo per la Non Autosufficienza — Liguria",
    body:
      "Contributo per assistenza domiciliare integrata e progetti di vita indipendente.",
    category: "regionale",
  },
};

export function computeRights(a: Answers): Right[] {
  const list: Right[] = [];

  if (a.verbale === "Sì") {
    list.push({
      title: "3 giorni di permesso mensile retribuito",
      body:
        a.assisted === "Me stesso"
          ? "Puoi richiedere 3 giorni al mese di permesso retribuito per te stesso all'INPS."
          : `Puoi richiedere 3 giorni al mese di permesso retribuito per assistere ${a.assisted.toLowerCase()}.`,
      category: "permessi",
    });
    list.push({
      title: "Agevolazioni fiscali",
      body:
        "Detrazione IRPEF del 19% sulle spese sanitarie, IVA agevolata al 4% su auto e ausili tecnici, esenzione bollo auto.",
      category: "fiscale",
    });
    if (a.assisted !== "Me stesso") {
      list.push({
        title: "Congedo straordinario retribuito",
        body:
          "Fino a 2 anni di congedo straordinario retribuito per assistere un familiare con disabilità grave (art. 42 D.Lgs. 151/2001).",
        category: "permessi",
      });
    }
  } else if (a.verbale === "In corso di richiesta") {
    list.push({
      title: "Attesa del verbale",
      body:
        "La commissione medica ASL ha 90 giorni per rispondere (15 giorni per patologie oncologiche). Nel frattempo raccogli tutta la documentazione sanitaria.",
      category: "iter",
    });
    list.push({
      title: "Presentazione al patronato",
      body:
        "Un patronato può assisterti gratuitamente nella pratica INPS e in eventuali ricorsi in caso di rigetto.",
      category: "iter",
    });
  } else {
    list.push({
      title: "Come richiedere il verbale",
      body:
        "Chiedi al medico di base il certificato SS3 telematico e presenta domanda all'INPS. È il primo passo per accedere ai benefici della Legge 104.",
      category: "iter",
    });
  }

  if (a.contract === "Dipendente Pubblico") {
    list.push({
      title: "Priorità sede di lavoro (Pubblico)",
      body:
        "Come dipendente pubblico hai diritto alla scelta prioritaria della sede più vicina alla persona assistita (art. 33 c. 5 L. 104).",
      category: "lavoro",
    });
  } else if (a.contract === "Dipendente Privato") {
    list.push({
      title: "Tutela contro trasferimenti (Privato)",
      body:
        "Non puoi essere trasferito senza consenso ad altra sede se sei beneficiario di Legge 104 art. 33.",
      category: "lavoro",
    });
  } else {
    list.push({
      title: "Autonomi: agevolazioni fiscali",
      body:
        "Come lavoratore autonomo non hai diritto ai permessi retribuiti, ma puoi accedere a detrazioni fiscali e contributi regionali per l'acquisto di ausili.",
      category: "lavoro",
    });
  }

  // Regional bonus
  if (a.region) {
    const bonus = REGIONAL_BONUSES[a.region];
    if (bonus) {
      list.push(bonus);
    } else {
      list.push({
        title: `Agevolazioni regionali — ${a.region}`,
        body:
          "Verifica presso il tuo Comune o l'ATS/ASL di residenza eventuali contributi locali per assistenza domiciliare, ausili o vita indipendente.",
        category: "regionale",
      });
    }
  }

  // Age-based
  const age = a.age ? parseInt(a.age, 10) : NaN;
  if (!Number.isNaN(age)) {
    if (age < 18) {
      list.push({
        title: "Indennità di frequenza (minori)",
        body:
          "Se hai meno di 18 anni e frequenti scuole o centri di riabilitazione, potresti avere diritto all'indennità di frequenza INPS (circa €333/mese nel 2026).",
        category: "personalizzato",
      });
    } else if (age >= 65) {
      list.push({
        title: "Indennità di accompagnamento (over 65)",
        body:
          "Per persone over 65 non autosufficienti, l'indennità di accompagnamento è di circa €531/mese, indipendentemente dal reddito.",
        category: "personalizzato",
      });
    }
  }

  // Diagnosis note
  if (a.diagnosis && a.diagnosis.trim().length > 0) {
    const d = a.diagnosis.toLowerCase();
    if (d.includes("oncolog") || d.includes("tumor") || d.includes("cancro")) {
      list.push({
        title: "Corsia preferenziale per patologie oncologiche",
        body:
          "La commissione ASL è tenuta a rispondere entro 15 giorni. Hai anche diritto al congedo retribuito fino a 30 giorni l'anno per cure e visite.",
        category: "personalizzato",
      });
    } else if (d.includes("rara")) {
      list.push({
        title: "Registro Nazionale Malattie Rare",
        body:
          "Iscrivendoti al Registro Nazionale hai diritto all'esenzione totale del ticket sanitario e all'accesso a centri specializzati.",
        category: "personalizzato",
      });
    }
  }

  return list;
}

// ---------- Storage helpers ----------
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
    rights: computeRights(answers),
  };
  const list = await readAll();
  list.unshift(report);
  await writeAll(list.slice(0, 20)); // keep last 20
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

// ---------- PDF ----------
export function buildReportHtml(r: Report): string {
  const dateFmt = new Date(r.createdAt).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const a = r.answers;
  const rightsHtml = r.rights
    .map(
      (right) => `
      <div class="right">
        <div class="right-title">${escapeHtml(right.title)}</div>
        <div class="right-body">${escapeHtml(right.body)}</div>
      </div>`,
    )
    .join("");
  const extras: string[] = [];
  if (a.age) extras.push(`<div><b>Età:</b> ${escapeHtml(a.age)}</div>`);
  if (a.diagnosis)
    extras.push(`<div><b>Diagnosi:</b> ${escapeHtml(a.diagnosis)}</div>`);
  if (a.region) extras.push(`<div><b>Regione:</b> ${escapeHtml(a.region)}</div>`);

  return `
<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8" />
<title>Valutazione Tutele e Permessi</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Helvetica Neue", Arial, sans-serif; color: #111827; padding: 40px; margin: 0; }
  .brand { color: #2C6496; font-weight: 800; font-size: 14px; letter-spacing: 1.2px; text-transform: uppercase; }
  h1 { font-size: 26px; margin: 8px 0 4px 0; letter-spacing: -0.5px; }
  .date { color: #6B7280; font-size: 13px; margin-bottom: 24px; }
  .section-title { font-size: 12px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 1.1px; margin: 24px 0 8px 0; }
  .card { background: #F4F7FA; border-radius: 12px; padding: 16px; margin-bottom: 8px; }
  .card b { color: #111827; }
  .card div { font-size: 14px; color: #1F2937; line-height: 1.5; }
  .right { background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 12px; padding: 16px; margin-bottom: 10px; }
  .right-title { font-weight: 700; color: #111827; margin-bottom: 6px; font-size: 15px; }
  .right-body { color: #1F2937; font-size: 13px; line-height: 1.55; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #E5E7EB; color: #6B7280; font-size: 11px; line-height: 1.5; }
</style>
</head>
<body>
  <div class="brand">SaluteNav — Valutazione Legge 104</div>
  <h1>Valutazione Tutele e Permessi</h1>
  <div class="date">Report generato il ${dateFmt}</div>

  <div class="section-title">Le tue risposte</div>
  <div class="card">
    <div><b>Chi assisti:</b> ${escapeHtml(a.assisted)}</div>
    <div><b>Tipo di contratto:</b> ${escapeHtml(a.contract)}</div>
    <div><b>Verbale di invalidità:</b> ${escapeHtml(a.verbale)}</div>
    ${extras.join("")}
  </div>

  <div class="section-title">Diritti e agevolazioni</div>
  ${rightsHtml}

  <div class="footer">
    Questo documento è un riepilogo orientativo generato automaticamente in base alle risposte fornite.
    Per la conferma dei diritti spettanti nel tuo caso specifico rivolgiti a un patronato, a un CAF o al tuo ufficio HR / Personale.
  </div>
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
