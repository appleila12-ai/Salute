// Dati e logica condivisa per gli Aiuti Pratici sul Territorio.

import { Ionicons } from "@expo/vector-icons";
import { ImageSourcePropType } from "react-native";

import { topics } from "@/src/theme";
import { IMAGES } from "@/src/lib/images";

export const REGIONE_KEY = "salutenav:regione";

/** Portali ufficiali per tutte le 20 regioni italiane */
export const REGIONAL_PORTALS: Record<string, { label: string; url: string }> = {
  Abruzzo: { label: "Regione Abruzzo — Salute", url: "https://www.regione.abruzzo.it" },
  Basilicata: { label: "Regione Basilicata — Sanità", url: "https://www.regione.basilicata.it" },
  Calabria: { label: "Regione Calabria — Salute", url: "https://www.regione.calabria.it" },
  Campania: { label: "Regione Campania — Sanità", url: "https://www.regione.campania.it" },
  "Emilia-Romagna": { label: "Salute Emilia-Romagna", url: "https://salute.regione.emilia-romagna.it" },
  "Friuli-Venezia Giulia": { label: "Regione FVG — Salute", url: "https://www.regione.fvg.it" },
  Lazio: { label: "Salute Lazio", url: "https://www.salutelazio.it" },
  Liguria: { label: "Regione Liguria — Salute e Sociale", url: "https://www.regione.liguria.it" },
  Lombardia: { label: "Regione Lombardia — Welfare", url: "https://www.regione.lombardia.it" },
  Marche: { label: "Regione Marche — Salute", url: "https://www.regione.marche.it" },
  Molise: { label: "Regione Molise — Salute", url: "https://www.regione.molise.it" },
  Piemonte: { label: "Regione Piemonte — Sanità", url: "https://www.regione.piemonte.it" },
  Puglia: { label: "Sanità Puglia", url: "https://www.sanita.puglia.it" },
  Sardegna: { label: "Regione Sardegna — Sanità", url: "https://www.regione.sardegna.it" },
  Sicilia: { label: "Regione Siciliana — Salute", url: "https://www.regione.sicilia.it" },
  Toscana: { label: "Regione Toscana — Salute", url: "https://www.regione.toscana.it" },
  "Trentino-Alto Adige": { label: "Regione Trentino-Alto Adige", url: "https://www.regione.taa.it" },
  Umbria: { label: "Regione Umbria — Salute", url: "https://www.regione.umbria.it" },
  "Valle d'Aosta": { label: "Regione Valle d'Aosta — Sanità", url: "https://www.regione.vda.it" },
  Veneto: { label: "Regione Veneto — Sanità", url: "https://www.regione.veneto.it" },
};

/** Tutte le 20 regioni italiane, in ordine alfabetico */
export const REGIONI = Object.keys(REGIONAL_PORTALS);

export function transportContacts(regione: string): string {
  if (regione === "Liguria") {
    return "Pubblica Assistenza Sarzana — Via Falcinello 2, tel. 0187 620200. In altre zone della Liguria cerca la Pubblica Assistenza (ANPAS) o la Croce Rossa del tuo Comune.";
  }
  return `In ${regione} cerca la Pubblica Assistenza (rete ANPAS — anpas.org) o la Croce Rossa del tuo Comune: chiedi del servizio di trasporto sanitario/sociale.`;
}

export interface HelpCard {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  soft: string;
  dark: string;
  label: string;
  title: string;
  body: string;
  image: ImageSourcePropType;
  rows: { label: string; text: string }[];
}

export const HELP_CARDS: HelpCard[] = [
  {
    id: "trasporto",
    icon: "car",
    color: topics.salute.main,
    soft: topics.salute.soft,
    dark: topics.salute.dark,
    label: "TRASPORTI E PUBBLICA ASSISTENZA",
    title: "Trasporto per esami e visite",
    body: "Come richiedere il trasporto protetto con la Pubblica Assistenza per visite ed esami.",
    image: IMAGES.trasporti,
    rows: [
      {
        label: "Requisiti",
        text: "Impossibilità di deambulazione o patologie complesse. La richiesta passa dal Medico di Medicina Generale o dalla convenzione ASL.",
      },
    ],
  },
  {
    id: "domicilio",
    icon: "home",
    color: topics.legge104.main,
    soft: topics.legge104.soft,
    dark: topics.legge104.dark,
    label: "ASSISTENZA DOMICILIARE (ADI / SAD)",
    title: "Assistenza a domicilio (Infermieri e OSS)",
    body: "Due servizi diversi che spesso si confondono: ADI e SAD.",
    image: IMAGES.domiciliare,
    rows: [
      {
        label: "ADI (ASL)",
        text: "Assistenza Domiciliare Integrata: cure sanitarie a casa (infermieri, medicazioni, prelievi). È gratuita e la attiva il Medico Curante.",
      },
      {
        label: "SAD (Comune)",
        text: "Servizio di Assistenza Domiciliare: igiene e cura personale con OSS. Si richiede ai Servizi Sociali del Comune (contributo in base all'ISEE).",
      },
      {
        label: "Come attivare",
        text: "Richiesta al Medico Curante (ADI) o appuntamento con l'assistente sociale del Comune (SAD).",
      },
    ],
  },
  {
    id: "fisioterapia",
    icon: "fitness",
    color: topics.esenzioni.main,
    soft: topics.esenzioni.soft,
    dark: topics.esenzioni.dark,
    label: "FISIOTERAPIA E RIABILITAZIONE",
    title: "Fisioterapia e riabilitazione",
    body: "Diritto a cicli riabilitativi a domicilio o presso centri convenzionati.",
    image: IMAGES.fisioterapia,
    rows: [
      {
        label: "Come funziona",
        text: "Serve la prescrizione dello specialista (fisiatra) su ricettario SSN. I cicli si svolgono nei centri convenzionati o a domicilio se non puoi spostarti.",
      },
      {
        label: "Esenzioni",
        text: "Ricorda di verificare l'esenzione ticket per patologia o per invalidità: in molti casi i cicli riabilitativi sono gratuiti.",
      },
    ],
  },
  {
    id: "rsa",
    icon: "bed",
    color: topics.invalidita.main,
    soft: topics.invalidita.soft,
    dark: topics.invalidita.dark,
    label: "RSA E RICOVERI DI SOLLIEVO",
    title: "Periodi in RSA e ricoveri di sollievo",
    body: "Accesso a ricoveri temporanei per riabilitazione o per garantire un periodo di sollievo al caregiver.",
    image: IMAGES.rsa,
    rows: [
      {
        label: "Come procedere",
        text: "La valutazione passa dall'Unità Valutativa Multidimensionale (UVM) della ASL: chiedi al Medico Curante o al distretto sanitario di attivarla.",
      },
      {
        label: "Buono a sapersi",
        text: "I ricoveri di sollievo durano in genere 30-60 giorni e aiutano la famiglia a riprendere fiato senza perdere la continuità delle cure.",
      },
    ],
  },
];

/** Card con i contatti trasporti adattati alla regione */
export function getHelpCards(regione: string): HelpCard[] {
  return HELP_CARDS.map((c) =>
    c.id === "trasporto"
      ? {
          ...c,
          rows: [
            ...c.rows,
            { label: "Contatti locali", text: transportContacts(regione) },
          ],
        }
      : c,
  );
}

export function buildGuideHtml(regione: string): string {
  const cards = getHelpCards(regione);
  const portal = REGIONAL_PORTALS[regione];
  const cardsHtml = cards
    .map(
      (c) => `
    <div class="card" style="border-left: 4px solid ${c.color};">
      <div class="label" style="color:${c.color};">${c.label}</div>
      <div class="title">${c.title}</div>
      <div class="body">${c.body}</div>
      ${c.rows.map((r) => `<div class="row"><b>${r.label}:</b> ${r.text}</div>`).join("")}
    </div>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8" />
<title>TutelApp — Guida ai Servizi Sociali del Comune</title>
<style>
  body { font-family: -apple-system, "Helvetica Neue", Arial, sans-serif; color: #0F172A; padding: 40px; margin: 0; }
  .brand { color: #2A75D3; font-weight: 800; font-size: 13px; letter-spacing: 1.2px; text-transform: uppercase; }
  h1 { font-size: 22px; margin: 8px 0 4px 0; letter-spacing: -0.4px; }
  .sub { color: #6B7280; font-size: 13px; margin-bottom: 24px; line-height: 1.5; }
  .card { background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 12px; padding: 18px; margin-bottom: 14px; }
  .label { font-size: 10px; font-weight: 800; letter-spacing: 1.2px; margin-bottom: 4px; }
  .title { font-weight: 800; font-size: 15px; color: #111827; margin-bottom: 6px; }
  .body { font-size: 13px; color: #1F2937; line-height: 1.55; margin-bottom: 10px; }
  .row { font-size: 12.5px; color: #374151; line-height: 1.55; margin-bottom: 6px; }
  .steps { background: #F5F8FC; border-radius: 12px; padding: 16px 18px; margin-top: 20px; }
  .steps .title { margin-bottom: 8px; }
  ol { margin: 0; padding-left: 20px; }
  ol li { font-size: 13px; color: #1F2937; line-height: 1.6; margin-bottom: 4px; }
  .disclaimer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #E5E7EB; color: #6B7280; font-size: 11px; line-height: 1.5; }
</style>
</head>
<body>
  <div class="brand">TutelApp</div>
  <h1>Guida ai Servizi Sociali del Comune</h1>
  <div class="sub">Aiuti pratici sul territorio: assistenza, trasporti, riabilitazione e ricoveri di sollievo. Regione di riferimento: <b>${regione}</b>${portal ? ` — portale ufficiale: ${portal.url}` : ""}. Porta questa guida ai Servizi Sociali o al Patronato.</div>
  ${cardsHtml}
  <div class="steps">
    <div class="title">Come muoversi con i Servizi Sociali del Comune</div>
    <ol>
      <li>Chiama il centralino del tuo Comune e chiedi dei <b>Servizi Sociali</b> (o Sportello del Cittadino).</li>
      <li>Fissa un appuntamento con l'<b>assistente sociale</b> di zona: è gratuito.</li>
      <li>Porta: documento, tessera sanitaria, ISEE aggiornato e verbale di invalidità/104 se già disponibile.</li>
      <li>Chiedi la <b>valutazione del bisogno</b>: da lì si attivano SAD, contributi, pasti a domicilio e telesoccorso.</li>
      <li>Per i servizi sanitari (ADI, UVM, riabilitazione) il riferimento è il <b>Medico Curante</b> e il distretto ASL.</li>
    </ol>
  </div>
  <div class="disclaimer">Contenuto orientativo generato da TutelApp. Servizi, tempi e contributi variano da Comune a Comune: verifica sempre con i Servizi Sociali o con un Patronato.</div>
</body>
</html>`;
}
