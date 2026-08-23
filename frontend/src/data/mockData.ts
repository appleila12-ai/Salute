export type FeatureId = "diritti" | "diagnosi" | "telemedicina" | "community";

export interface Feature {
  id: FeatureId;
  title: string;
  subtitle: string;
  iconLib: "ion" | "mci";
  iconName: string;
  heroImage: string;
  intro: string;
  sections: {
    title: string;
    body: string;
    bullets?: string[];
  }[];
}

export const FEATURES: Feature[] = [
  {
    id: "diritti",
    title: "Diritti e Legge 104",
    subtitle: "Tutele, permessi, agevolazioni",
    iconLib: "mci",
    iconName: "scale-balance",
    heroImage:
      "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODR8MHwxfHNlYXJjaHwxfHxlbXBhdGhldGljJTIwaGVhbHRoY2FyZSUyMHBhdGllbnQlMjBkb2N0b3IlMjBzdXBwb3J0fGVufDB8fHx8MTc4NzQ5MTgxNnww&ixlib=rb-4.1.0&q=85",
    intro:
      "Conosci i tuoi diritti. La Legge 104/1992 tutela le persone con disabilità e i loro familiari, garantendo permessi, agevolazioni fiscali e supporto lavorativo.",
    sections: [
      {
        title: "Chi ha diritto",
        body:
          "La Legge 104 si applica a persone con handicap riconosciuto dalla commissione medica ASL, e ai loro familiari conviventi o meno.",
      },
      {
        title: "Principali benefici",
        body: "Ecco cosa puoi richiedere:",
        bullets: [
          "3 giorni di permesso retribuito al mese",
          "Congedo straordinario fino a 2 anni",
          "Agevolazioni fiscali su auto e ausili",
          "Detrazioni IRPEF e IVA agevolata",
          "Priorità nella scelta della sede di lavoro",
        ],
      },
      {
        title: "Come richiederla",
        body:
          "Presenta domanda all'INPS con il certificato del medico curante. La commissione ASL valuterà entro 90 giorni. In caso di patologie oncologiche i tempi sono ridotti a 15 giorni.",
      },
    ],
  },
  {
    id: "diagnosi",
    title: "Dopo la Diagnosi",
    subtitle: "I primi passi, senza sentirsi soli",
    iconLib: "ion",
    iconName: "navigate",
    heroImage:
      "https://images.unsplash.com/photo-1581056771107-24ca5f033842?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODR8MHwxfHNlYXJjaHwyfHxlbXBhdGhldGljJTIwaGVhbHRoY2FyZSUyMHBhdGllbnQlMjBkb2N0b3IlMjBzdXBwb3J0fGVufDB8fHx8MTc4NzQ5MTgxNnww&ixlib=rb-4.1.0&q=85",
    intro:
      "Una diagnosi cambia il ritmo della vita. Prenditi il tempo che ti serve: qui trovi i passaggi essenziali per orientarti con calma.",
    sections: [
      {
        title: "Respira e informati",
        body:
          "Chiedi al tuo medico una copia scritta della diagnosi e degli esami. Comprendere ogni parola è il primo passo per riprendere il controllo.",
      },
      {
        title: "Costruisci il tuo team di cura",
        body: "Le persone che ti accompagneranno:",
        bullets: [
          "Medico di base come riferimento",
          "Specialista di riferimento per la patologia",
          "Psicologo o psiconcologo se necessario",
          "Assistente sociale del distretto",
        ],
      },
      {
        title: "Attiva le tutele",
        body:
          "Richiedi subito l'invalidità civile e la Legge 104. Contatta un patronato per essere assistito gratuitamente in tutte le pratiche.",
      },
    ],
  },
  {
    id: "telemedicina",
    title: "Telemedicina e Consulti",
    subtitle: "Visite specialistiche a distanza",
    iconLib: "mci",
    iconName: "stethoscope",
    heroImage:
      "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODR8MHwxfHNlYXJjaHwxfHxlbXBhdGhldGljJTIwaGVhbHRoY2FyZSUyMHBhdGllbnQlMjBkb2N0b3IlMjBzdXBwb3J0fGVufDB8fHx8MTc4NzQ5MTgxNnww&ixlib=rb-4.1.0&q=85",
    intro:
      "Consulta uno specialista da casa, senza spostamenti né code. La telemedicina è riconosciuta dal SSN e integrata nei percorsi di cura.",
    sections: [
      {
        title: "Cosa puoi fare",
        body: "Servizi disponibili in remoto:",
        bullets: [
          "Televisita con specialisti convenzionati",
          "Teleconsulto tra medici sul tuo caso",
          "Telemonitoraggio dei parametri vitali",
          "Rinnovo di piani terapeutici",
        ],
      },
      {
        title: "Come prenotare",
        body:
          "Accedi al Fascicolo Sanitario Elettronico della tua regione o contatta il CUP. Molte visite di controllo possono essere convertite in televisite su richiesta.",
      },
      {
        title: "Serve una connessione stabile",
        body:
          "Bastano uno smartphone e una linea internet. Se hai difficoltà, i punti di facilitazione digitale nei Comuni offrono supporto gratuito.",
      },
    ],
  },
  {
    id: "community",
    title: "Community e Supporto",
    subtitle: "Non sei solo in questo percorso",
    iconLib: "ion",
    iconName: "people",
    heroImage:
      "https://images.unsplash.com/photo-1581056771107-24ca5f033842?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODR8MHwxfHNlYXJjaHwyfHxlbXBhdGhldGljJTIwaGVhbHRoY2FyZSUyMHBhdGllbnQlMjBkb2N0b3IlMjBzdXBwb3J0fGVufDB8fHx8MTc4NzQ5MTgxNnww&ixlib=rb-4.1.0&q=85",
    intro:
      "Chi ha vissuto la tua stessa esperienza può capire meglio di chiunque altro. Trova gruppi, associazioni e persone che ti ascoltano.",
    sections: [
      {
        title: "Gruppi di sostegno",
        body: "Puoi partecipare a:",
        bullets: [
          "Gruppi tematici per patologia",
          "Incontri per caregiver e familiari",
          "Cerchi di ascolto con psicologi",
          "Community online moderata 24/7",
        ],
      },
      {
        title: "Associazioni di pazienti",
        body:
          "In Italia esistono centinaia di associazioni che offrono consulenza gratuita, supporto legale e attività sociali. Cerca quella della tua patologia sul portale del Ministero della Salute.",
      },
      {
        title: "Numeri utili",
        body: "Sempre attivi:",
        bullets: [
          "Telefono Amico: 02 2327 2327",
          "Telefono Verde SSN: 1500",
          "Sportello Diritti del Paziente della tua ASL",
        ],
      },
    ],
  },
];

export const SEARCH_SUGGESTIONS: {
  label: string;
  category: string;
  route: FeatureId;
}[] = [
  { label: "Legge 104 - permessi lavorativi", category: "Diritti", route: "diritti" },
  { label: "Invalidità civile: come richiederla", category: "Diritti", route: "diritti" },
  { label: "Diagnosi oncologica - primi passi", category: "Dopo la diagnosi", route: "diagnosi" },
  { label: "Diabete tipo 2 - guida", category: "Dopo la diagnosi", route: "diagnosi" },
  { label: "Sclerosi multipla - orientamento", category: "Dopo la diagnosi", route: "diagnosi" },
  { label: "Televisita cardiologica", category: "Telemedicina", route: "telemedicina" },
  { label: "Teleconsulto oncologico", category: "Telemedicina", route: "telemedicina" },
  { label: "Gruppi di supporto caregiver", category: "Community", route: "community" },
  { label: "Associazioni pazienti oncologici", category: "Community", route: "community" },
  { label: "Detrazioni fiscali disabilità", category: "Diritti", route: "diritti" },
];

export const PERCORSO_STEPS = [
  {
    id: "step1",
    question: "Da quanto tempo hai ricevuto la diagnosi?",
    helper: "Prenditi il tuo tempo. Ogni risposta ti aiuta a trovare il supporto giusto.",
    options: [
      "Meno di una settimana",
      "Meno di un mese",
      "1-6 mesi fa",
      "Più di 6 mesi fa",
    ],
  },
  {
    id: "step2",
    question: "Di cosa hai più bisogno adesso?",
    helper: "Puoi cambiare risposta in ogni momento.",
    options: [
      "Capire meglio la mia diagnosi",
      "Conoscere i miei diritti",
      "Trovare uno specialista",
      "Parlare con qualcuno che mi capisca",
    ],
  },
  {
    id: "step3",
    question: "Chi ti accompagna in questo percorso?",
    helper: "Nessuna risposta è sbagliata.",
    options: [
      "Sono da solo/a",
      "Ho un familiare vicino",
      "Ho un caregiver",
      "Preferisco non rispondere",
    ],
  },
  {
    id: "step4",
    question: "Come preferisci essere contattato/a?",
    helper: "Rispetteremo sempre le tue preferenze.",
    options: [
      "Chat nell'app",
      "Videochiamata",
      "Telefonata",
      "Solo materiale scritto",
    ],
  },
];
