// Contenuti normativi TutelApp — guida passo-passo, certificato introduttivo,
// possibilità Legge 104 e Invalidità Civile.
// Fonti: L. 104/1992, L. 68/1999, D.Lgs. 151/2001, D.Lgs. 105/2022, D.Lgs. 62/2024.

export interface GuideStep {
  title: string;
  body: string;
}

/** Percorso passo-passo: "Ho la diagnosi in mano, e adesso?" */
export const NEXT_STEPS: GuideStep[] = [
  {
    title: "Vai dal tuo medico con la diagnosi",
    body: "Chiedi al medico curante (o a un medico certificatore) il Certificato Medico Introduttivo INPS. Fatti barrare SIA Invalidità Civile SIA Legge 104 (handicap): così farai una sola visita.",
  },
  {
    title: "Il medico invia il certificato all'INPS",
    body: "L'invio è telematico: ti consegna la ricevuta con il numero di protocollo, conservala. Il certificato in genere costa tra 30€ e 80€ (tariffa del medico).",
  },
  {
    title: "Presenta la domanda entro 90 giorni",
    body: "Dal rilascio del certificato hai 90 giorni per inviare la domanda all'INPS. Un Patronato la presenta gratuitamente al posto tuo: porta il numero di protocollo.",
  },
  {
    title: "Visita davanti alla Commissione Medica",
    body: "Riceverai la convocazione. Porta documento, referti originali e fotocopie ordinate per data. In alcuni casi la valutazione avviene solo sui documenti (agli atti).",
  },
  {
    title: "Ricevi il verbale e attiva i benefici",
    body: "Il verbale indica la percentuale di invalidità e/o la gravità dell'handicap (art. 3 L.104). Da lì attivi permessi, esenzioni e prestazioni: vedi qui sotto cosa può spettarti.",
  },
];

/** Spiegazione del Certificato Medico Introduttivo INPS */
export const CERT_EXPLAINER = {
  title: "Cos'è il Certificato Medico Introduttivo?",
  intro:
    "È il documento che AVVIA tutta la pratica: senza di esso non si può presentare nessuna domanda di invalidità o Legge 104.",
  points: [
    "Lo compila il tuo medico curante (o un medico certificatore abilitato) e lo invia telematicamente all'INPS.",
    "Contiene le diagnosi e i dati clinici: porta con te referti e documentazione aggiornata.",
    "Ti viene consegnata una ricevuta con un numero di protocollo: serve per presentare la domanda.",
    "Vale 90 giorni: entro quel termine va inviata la domanda all'INPS (il Patronato lo fa gratis).",
    "Costa in media tra 30€ e 80€, secondo la tariffa del medico.",
  ],
  reform:
    "Nota: con la riforma della disabilità (D.Lgs. 62/2024), in alcune province in sperimentazione il certificato del medico avvia da solo la valutazione, senza domanda separata. Il Patronato sa dirti cosa vale nella tua zona.",
};

export interface BenefitItem {
  text: string;
  workOnly?: boolean;
}

/** Cosa diventa possibile se viene riconosciuta la Legge 104 (art. 3 c. 3) */
export const LAW104_BENEFITS: BenefitItem[] = [
  { text: "3 giorni al mese di permessi retribuiti, frazionabili anche in ore (art. 33)", workOnly: true },
  { text: "Congedo straordinario retribuito fino a 2 anni per assistere un familiare convivente", workOnly: true },
  { text: "Scelta della sede di lavoro più vicina e diritto di rifiutare il trasferimento", workOnly: true },
  { text: "Priorità nell'accesso allo smart working (D.Lgs. 105/2022)", workOnly: true },
  { text: "IVA al 4% e detrazione IRPEF 19% su auto, ausili e strumenti informatici" },
  { text: "Esenzione bollo auto e imposta di trascrizione per un veicolo" },
  { text: "Detrazioni per l'abbattimento delle barriere architettoniche" },
];

export interface InvalidityBracket {
  range: string;
  benefit: string;
  workOnly?: boolean;
}

/** Cosa spetta in base alla percentuale di Invalidità Civile */
export const INVALIDITY_BRACKETS: InvalidityBracket[] = [
  { range: "dal 34%", benefit: "Ausili e protesi gratuiti legati alla patologia riconosciuta" },
  { range: "dal 46%", benefit: "Iscrizione al collocamento mirato per l'inserimento lavorativo (L. 68/1999)" },
  { range: "dal 51%", benefit: "Congedo per cure fino a 30 giorni l'anno (lavoratori dipendenti)", workOnly: true },
  { range: "dal 67%", benefit: "Esenzione ticket sanitario e agevolazioni sui trasporti (varia per regione)" },
  { range: "dal 74%", benefit: "Assegno mensile di assistenza (età lavorativa, entro limiti di reddito)" },
  { range: "100%", benefit: "Pensione di inabilità; indennità di accompagnamento se serve assistenza continua" },
];

/** Nota per Coniuge/Partner — D.Lgs. 105/2022 */
export const PARTNER_NOTE =
  "Anche il convivente di fatto ha gli stessi diritti del coniuge per permessi e congedo straordinario (D.Lgs. 105/2022), a condizione che la convivenza sia registrata all'anagrafe (L. 76/2016). Vale anche per le unioni civili.";
