import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { storage } from "@/src/utils/storage";

export type Lang = "it" | "en";

const LANG_KEY = "salutenav:lang";

// -------- Dictionary --------
export const DICT = {
  // Common
  "common.back": { it: "Indietro", en: "Back" },
  "common.next": { it: "Avanti", en: "Next" },
  "common.done": { it: "Concludi", en: "Done" },
  "common.save": { it: "Salva", en: "Save" },
  "common.cancel": { it: "Annulla", en: "Cancel" },
  "common.delete": { it: "Elimina", en: "Delete" },
  "common.home": { it: "Torna alla home", en: "Back to home" },
  "common.retry": { it: "Riprova", en: "Retry" },
  "common.optional": { it: "Opzionale", en: "Optional" },
  "common.language": { it: "Lingua", en: "Language" },
  "common.italian": { it: "Italiano", en: "Italian" },
  "common.english": { it: "Inglese", en: "English" },

  // Home
  "home.hello": { it: "Ciao", en: "Hello" },
  "home.greeting": {
    it: "Come possiamo aiutarti oggi?",
    en: "How can we help you today?",
  },
  "home.subgreeting": {
    it: "Cerca una patologia, un diritto o un servizio.",
    en: "Search for a condition, right or service.",
  },
  "home.searchPh": {
    it: "Es. Legge 104, diagnosi, televisita…",
    en: "E.g. Law 104, diagnosis, telemedicine…",
  },
  "home.searchClear": { it: "Cancella ricerca", en: "Clear search" },
  "home.noResults": {
    it: "Nessun risultato. Prova con un altro termine.",
    en: "No results. Try a different term.",
  },
  "home.savedTitle": { it: "Le tue valutazioni", en: "Your assessments" },
  "home.compareCta": { it: "Confronta valutazioni", en: "Compare assessments" },
  "home.remindersTitle": { it: "Promemoria scadenze", en: "Deadline reminders" },
  "home.remindersCta": {
    it: "Gestisci promemoria",
    en: "Manage reminders",
  },
  "home.remindersSub": {
    it: "Non perdere rinnovi ISEE, revisioni INPS e verbali temporanei.",
    en: "Never miss ISEE renewals, INPS reviews and temporary reports.",
  },
  "home.helpTitle": { it: "Come possiamo aiutarti", en: "How we can help" },

  // Feature titles/subtitles (mirrors mockData) — kept minimal; content stays IT for legal accuracy.
  // Valutazione form
  "val.title": {
    it: "Valutazione Tutele e Permessi",
    en: "Rights & Leave Assessment",
  },
  "val.subtitle": {
    it: "Rispondi alle prime 3 domande. Le informazioni extra sono opzionali ma rendono i risultati più precisi.",
    en: "Answer the first 3 questions. Extra info is optional but makes results more precise.",
  },
  "val.qAssisted": { it: "Chi assisti?", en: "Who do you care for?" },
  "val.qContract": {
    it: "Tipo di contratto di lavoro",
    en: "Employment type",
  },
  "val.qVerbale": {
    it: "Hai già un verbale di invalidità?",
    en: "Do you already have a disability certificate?",
  },
  "val.extrasBadge": { it: "Opzionale", en: "Optional" },
  "val.extrasSub": {
    it: "Aggiungi qualche dettaglio in più per risultati personalizzati (bonus regionali, indennità per età, patologie specifiche).",
    en: "Add a few more details for personalised results (regional bonuses, age-based benefits, specific conditions).",
  },
  "val.age": {
    it: "Età della persona assistita",
    en: "Age of the person cared for",
  },
  "val.diagnosis": { it: "Patologia o diagnosi", en: "Condition or diagnosis" },
  "val.region": { it: "Regione di residenza", en: "Region of residence" },
  "val.selectOpt": { it: "Seleziona un'opzione", en: "Select an option" },
  "val.selectRegion": {
    it: "Seleziona la tua regione",
    en: "Select your region",
  },
  "val.submit": { it: "Elabora i miei diritti", en: "Compute my rights" },
  "val.submitting": { it: "Elaborazione…", en: "Processing…" },

  // Options
  "opt.assisted.Me stesso": { it: "Me stesso", en: "Myself" },
  "opt.assisted.Genitore": { it: "Genitore", en: "Parent" },
  "opt.assisted.Figlio": { it: "Figlio", en: "Child" },
  "opt.assisted.Coniuge/Partner": {
    it: "Coniuge/Partner",
    en: "Spouse/Partner",
  },
  "opt.contract.Dipendente Privato": {
    it: "Dipendente Privato",
    en: "Private-sector employee",
  },
  "opt.contract.Dipendente Pubblico": {
    it: "Dipendente Pubblico",
    en: "Public-sector employee",
  },
  "opt.contract.Autonomo": { it: "Autonomo", en: "Self-employed" },
  "opt.contract.Inoccupato": { it: "Inoccupato", en: "Unemployed" },
  "opt.verbale.Sì": { it: "Sì", en: "Yes" },
  "opt.verbale.No": { it: "No", en: "No" },
  "opt.verbale.In corso di richiesta": {
    it: "In corso di richiesta",
    en: "Application pending",
  },

  // Results
  "res.title": { it: "I tuoi diritti", en: "Your rights" },
  "res.intro": {
    it: "In base alle tue risposte, ecco cosa puoi richiedere adesso.",
    en: "Based on your answers, here is what you can request now.",
  },
  "res.generatedOn": { it: "Generato il", en: "Generated on" },
  "res.pdf": {
    it: "Scarica o Condividi PDF",
    en: "Download or share PDF",
  },
  "res.nextSteps": {
    it: "I prossimi passi ufficiali",
    en: "Official next steps",
  },
  "res.step1": {
    it: "Porta questo PDF al patronato più vicino.",
    en: "Bring this PDF to the nearest patronato office.",
  },
  "res.step2": {
    it: "Il patronato invia gratuitamente la pratica all'INPS per te.",
    en: "The patronato submits the INPS application for you, free of charge.",
  },
  "res.step3": {
    it: "Riceverai la convocazione dalla commissione ASL entro 90 giorni (15 se oncologico).",
    en: "You will be summoned by the ASL commission within 90 days (15 for oncology).",
  },
  "res.findPatronato": {
    it: "Cerca il Patronato più vicino",
    en: "Find the nearest patronato",
  },
  "res.disclaimer": {
    it: "Queste indicazioni sono orientative. Per la tua situazione specifica rivolgiti a un patronato o al tuo medico di base.",
    en: "This is guidance only. For your specific situation, contact a patronato or your GP.",
  },
  "res.summary.assisted": { it: "Chi assisti", en: "Caring for" },
  "res.summary.contract": { it: "Contratto", en: "Contract" },
  "res.summary.verbale": { it: "Verbale", en: "Certificate" },
  "res.summary.age": { it: "Età", en: "Age" },
  "res.summary.region": { it: "Regione", en: "Region" },
  "res.summary.diagnosis": { it: "Diagnosi", en: "Diagnosis" },

  // Categories
  "cat.permessi": { it: "Permessi", en: "Leave" },
  "cat.fiscale": { it: "Fiscale", en: "Tax" },
  "cat.lavoro": { it: "Lavoro", en: "Work" },
  "cat.iter": { it: "Iter", en: "Process" },
  "cat.regionale": { it: "Regionale", en: "Regional" },
  "cat.personalizzato": { it: "Su misura", en: "Tailored" },

  // Patronato
  "pat.title": { it: "Patronati vicino a te", en: "Patronati near you" },
  "pat.introTitle": { it: "Assistenza gratuita", en: "Free assistance" },
  "pat.introBody": {
    it: "I patronati inviano gratuitamente la tua pratica INPS e ti seguono in eventuali ricorsi.",
    en: "Patronati submit your INPS application for free and support you in any appeals.",
  },
  "pat.capLabel": {
    it: "Il tuo CAP",
    en: "Your postal code",
  },
  "pat.capPh": { it: "Es. 20100", en: "e.g. 20100" },
  "pat.capHelp": {
    it: "Mostreremo i patronati più vicini al tuo CAP.",
    en: "We will show the patronati closest to your postal code.",
  },
  "pat.noResults": {
    it: "Nessun patronato trovato per questo CAP. Prova un altro CAP vicino.",
    en: "No patronato found for this postal code. Try a nearby one.",
  },
  "pat.call": { it: "Chiama", en: "Call" },
  "pat.map": { it: "Mappa", en: "Map" },
  "pat.saveContact": { it: "Salva Contatto", en: "Save contact" },
  "pat.saved": { it: "Contatto salvato", en: "Contact saved" },
  "pat.saveFail": {
    it: "Impossibile salvare. Verifica i permessi Contatti.",
    en: "Unable to save. Check Contacts permissions.",
  },
  "pat.webSaveHint": {
    it: "Su web viene scaricato un file .vcf da importare nella tua rubrica.",
    en: "On web a .vcf file is downloaded to import in your address book.",
  },

  // Reminders
  "rem.title": { it: "Promemoria scadenze", en: "Deadline reminders" },
  "rem.sub": {
    it: "Ti avvisiamo prima delle scadenze burocratiche importanti.",
    en: "We remind you before important administrative deadlines.",
  },
  "rem.empty": {
    it: "Nessun promemoria attivo. Aggiungi la prima scadenza.",
    en: "No active reminder. Add your first deadline.",
  },
  "rem.add": { it: "Aggiungi promemoria", en: "Add reminder" },
  "rem.type": { it: "Tipo di scadenza", en: "Deadline type" },
  "rem.date": { it: "Data della scadenza", en: "Deadline date" },
  "rem.note": { it: "Note (opzionale)", en: "Notes (optional)" },
  "rem.notePh": {
    it: "Es. Portare CUD e ISEE aggiornato",
    en: "E.g. Bring updated CUD and ISEE",
  },
  "rem.saveAndSchedule": {
    it: "Salva e programma notifica",
    en: "Save and schedule notification",
  },
  "rem.permissionTitle": { it: "Attiva le notifiche", en: "Enable notifications" },
  "rem.permissionBody": {
    it: "Per ricevere i promemoria devi consentire le notifiche.",
    en: "To receive reminders you must allow notifications.",
  },
  "rem.openSettings": { it: "Apri impostazioni", en: "Open settings" },
  "rem.scheduledOn": { it: "Programmato per il", en: "Scheduled for" },
  "rem.notifWeb": {
    it: "Le notifiche funzionano su build nativa (Expo Go, iOS, Android).",
    en: "Notifications work on native builds (Expo Go, iOS, Android).",
  },
  "rem.type.isee": { it: "Rinnovo ISEE", en: "ISEE renewal" },
  "rem.type.inps": { it: "Revisione visita INPS", en: "INPS medical review" },
  "rem.type.verbale": {
    it: "Scadenza verbale temporaneo",
    en: "Temporary certificate expiry",
  },
  "rem.type.custom": { it: "Altra scadenza", en: "Other deadline" },

  // Compare
  "cmp.title": { it: "Confronto valutazioni", en: "Compare assessments" },
  "cmp.pickFirst": {
    it: "Seleziona la prima valutazione",
    en: "Select the first assessment",
  },
  "cmp.pickSecond": {
    it: "Seleziona la seconda valutazione",
    en: "Select the second assessment",
  },
  "cmp.needTwo": {
    it: "Servono almeno due valutazioni salvate.",
    en: "You need at least two saved assessments.",
  },
  "cmp.added": { it: "Nuovi diritti", en: "New rights" },
  "cmp.removed": { it: "Non più applicabili", en: "No longer applicable" },
  "cmp.shared": { it: "Diritti in comune", en: "Shared rights" },
  "cmp.diffCta": { it: "Confronta", en: "Compare" },

  // Home banner
  "home.bannerBadge": { it: "Percorso guidato", en: "Guided path" },
  "home.bannerTitle": {
    it: "Hai appena ricevuto una diagnosi?",
    en: "Have you just received a diagnosis?",
  },
  "home.bannerBody": {
    it: "Ti guidiamo passo dopo passo, con calma e senza giudizi.",
    en: "We guide you step by step, calmly and without judgement.",
  },
  "home.bannerCta": {
    it: "Inizia il Percorso Guidato",
    en: "Start the guided path",
  },

  // Navigator dashboard
  "home.navTitle": {
    it: "Navigatore Sanitario",
    en: "Health Navigator",
  },
  "home.navSub": {
    it: "La tua guida ai diritti e alla burocrazia.",
    en: "Your guide to rights and paperwork.",
  },
  "home.startCta": {
    it: "Inizia la Valutazione Diritti",
    en: "Start rights assessment",
  },
  "home.startCtaSub": {
    it: "3 domande per scoprire cosa puoi richiedere subito.",
    en: "3 questions to discover what you can request now.",
  },
  "home.checklistCta": {
    it: "Checklist Documenti per la Visita",
    en: "Documents checklist for the visit",
  },
  "home.checklistSub": {
    it: "Non dimenticare nulla il giorno della commissione.",
    en: "Don't miss anything on commission day.",
  },
  "home.compareCtaSub": {
    it: "Vedi come cambiano i tuoi diritti nel tempo.",
    en: "See how your rights change over time.",
  },

  // Guide (5 errors)
  "guide.title": {
    it: "Guida Salva-Tempo: Evita i 5 errori più comuni",
    en: "Time-Saver Guide: Avoid the top 5 mistakes",
  },
  "guide.err1.title": {
    it: "Invalidità Civile vs Legge 104",
    en: "Civil Disability vs Law 104",
  },
  "guide.err1.body": {
    it: "Sono due verbali distinti: l'Invalidità Civile dà diritto a pensione, ticket e ausili, la Legge 104 dà i permessi lavorativi. Chiedi al medico di contrassegnare ENTRAMBE le caselle nel certificato introduttivo, altrimenti perdi i permessi.",
    en: "These are two separate certificates: Civil Disability grants pension, ticket exemption and aids; Law 104 grants paid leave. Ask the doctor to tick BOTH boxes on the introductory certificate, otherwise you lose paid leave.",
  },
  "guide.err2.title": {
    it: "La scadenza dei 90 giorni",
    en: "The 90-day deadline",
  },
  "guide.err2.body": {
    it: "Il certificato medico introduttivo INPS ha validità 90 giorni. Se non presenti la domanda entro questo termine, dovrai farlo rifare dal medico curante (con altri costi e attese).",
    en: "The INPS introductory medical certificate is valid for 90 days. If you don't submit the application in time, you'll need a new one from your GP (extra cost and delay).",
  },
  "guide.err3.title": {
    it: "Non aspettare la fine delle cure",
    en: "Don't wait until treatments end",
  },
  "guide.err3.body": {
    it: "Puoi avviare l'iter di invalidità e Legge 104 non appena hai la diagnosi. Aspettare fine terapie allunga i tempi di 6-12 mesi. Se sei in trattamento oncologico i tempi si riducono a 15 giorni per legge.",
    en: "You can start the disability and Law 104 process as soon as you have a diagnosis. Waiting until treatments end adds 6-12 months. For oncology patients the process is 15 days by law.",
  },
  "guide.err4.title": {
    it: "Documentazione incompleta",
    en: "Incomplete documentation",
  },
  "guide.err4.body": {
    it: "La Commissione valuta SOLO i referti che porti il giorno della visita. Un solo esame mancante può ridurre la percentuale riconosciuta. Organizza tutto in ordine cronologico e porta le fotocopie.",
    en: "The Commission only evaluates the reports you bring on the day. A single missing exam can lower the recognised percentage. Sort everything chronologically and bring photocopies.",
  },
  "guide.err5.title": {
    it: "Caregiver e referente unico",
    en: "Caregiver and single reference",
  },
  "guide.err5.body": {
    it: "I 3 giorni di permesso mensile spettano a UN SOLO familiare per la stessa persona assistita. Il referente unico si designa in fase di richiesta INPS: sceglietelo bene, si può cambiare ma la procedura richiede tempo.",
    en: "The 3 monthly leave days apply to ONE family member per person cared for. The single reference is designated during the INPS application: pick carefully — you can change but it takes time.",
  },

  // Warning modal
  "warn.title": { it: "Prima di iniziare", en: "Before you start" },
  "warn.body": {
    it: "Assicurati che il tuo medico curante abbia contrassegnato SIA la casella «Invalidità Civile» SIA quella «Legge 104» nel certificato introduttivo, per non dover ripetere la procedura da capo.",
    en: "Make sure your GP has ticked BOTH the «Civil Disability» AND «Law 104» boxes on the introductory certificate, so you don't have to redo the process from scratch.",
  },
  "warn.cta": { it: "Ho capito, prosegui", en: "Got it, continue" },

  // Checklist
  "check.title": {
    it: "Checklist Documenti Visita",
    en: "Visit documents checklist",
  },
  "check.sub": {
    it: "Spunta ogni voce mentre prepari la cartellina per la commissione ASL/INPS.",
    en: "Tick each item while preparing the folder for the ASL/INPS commission.",
  },
  "check.progress": { it: "Completato", en: "Completed" },
  "check.item1": {
    it: "Certificato medico introduttivo con codice INPS",
    en: "Introductory medical certificate with INPS code",
  },
  "check.item2": {
    it: "Ricevuta di invio della domanda telematica",
    en: "Receipt of the online application",
  },
  "check.item3": {
    it: "Documento d'identità e Codice Fiscale",
    en: "ID card and tax code",
  },
  "check.item4": {
    it: "Relazione clinica dello specialista con diagnosi ed esami recenti",
    en: "Specialist's clinical report with recent diagnosis and exams",
  },
  "check.item5": {
    it: "Fotocopie di tutta la documentazione ordinata per data",
    en: "Photocopies of all documentation sorted by date",
  },
  "check.tip": {
    it: "Porta sempre con te le fotocopie: la commissione potrebbe trattenere i fogli!",
    en: "Always bring photocopies: the commission may keep the originals!",
  },
  "check.reset": { it: "Ricomincia da capo", en: "Start over" },
  "check.complete": { it: "Tutto pronto!", en: "All ready!" },
} as const;

export type DictKey = keyof typeof DICT;

// -------- Context --------
interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: DictKey) => string;
}

const I18nContext = createContext<Ctx>({
  lang: "it",
  setLang: () => {},
  t: (k) => (DICT[k] ? DICT[k].it : (k as string)),
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("it");

  useEffect(() => {
    (async () => {
      const stored = await storage.getItem<string>(LANG_KEY, "it");
      if (stored === "en" || stored === "it") setLangState(stored);
    })();
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    storage.setItem(LANG_KEY, l);
  }, []);

  const t = useCallback(
    (k: DictKey) => {
      const entry = DICT[k];
      if (!entry) return k as string;
      return entry[lang] ?? entry.it;
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

// Non-hook accessor for headless usage (PDF, etc.)
export function translate(k: DictKey, lang: Lang): string {
  const entry = DICT[k];
  if (!entry) return k as string;
  return entry[lang] ?? entry.it;
}
