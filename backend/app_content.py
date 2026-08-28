"""Contenuti aggiornabili di TutelApp: importi, FAQ, glossario, dopo-verbale.

Seed idempotente: inserito solo se assente. Per aggiornare gli importi basta
modificare il documento in Mongo (collezione app_content, key="main") o questo
seed + cancellare il documento.
"""

APP_CONTENT_SEED = {
    "key": "main",
    "updatedAt": "2026-06-01",
    "fonte": "Circolare INPS importi 2026",
    "importi": [
        {
            "nome": "Indennità di accompagnamento",
            "importo": "€ 552,27 / mese",
            "requisiti": "Invalidità 100% con impossibilità a camminare senza aiuto o necessità di assistenza continua. Senza limiti di età.",
            "reddito": "Nessun limite di reddito",
            "url": "https://www.inps.it/it/it/dettaglio-scheda.schede-servizio-strumento.schede-servizi.indennita-di-accompagnamento-per-invalidi-civili-50592.indennit%C3%A0-di-accompagnamento-per-invalidi-civili.html",
        },
        {
            "nome": "Pensione di inabilità (invalidi totali 100%)",
            "importo": "€ 340,71 / mese",
            "requisiti": "Invalidità al 100%, età tra 18 e 67 anni.",
            "reddito": "Limite di reddito personale: € 20.029,55 l'anno",
            "url": "https://www.inps.it",
        },
        {
            "nome": "Assegno mensile di assistenza (74%-99%)",
            "importo": "€ 340,71 / mese",
            "requisiti": "Invalidità dal 74%, età 18-67 anni, non svolgere attività lavorativa.",
            "reddito": "Limite di reddito personale: € 5.852,21 l'anno",
            "url": "https://www.inps.it",
        },
        {
            "nome": "Indennità di frequenza (minorenni)",
            "importo": "€ 340,71 / mese",
            "requisiti": "Minori con difficoltà persistenti che frequentano scuola o centri terapeutici.",
            "reddito": "Limite di reddito: € 5.852,21 l'anno",
            "url": "https://www.inps.it",
        },
    ],
    "dopoVerbale": [
        {
            "titolo": "Esenzione ticket sanitario",
            "come": "Porta il verbale allo sportello esenzioni della tua ASL (o chiedi al medico di famiglia): ti registrano il codice di esenzione collegato alla tessera sanitaria.",
        },
        {
            "titolo": "Permessi 104 col datore di lavoro",
            "come": "Invia la domanda telematica all'INPS (il patronato la fa gratis) e consegna copia del verbale all'ufficio del personale. Con l'accoglimento, il datore non può rifiutare i 3 giorni al mese: si concorda solo la programmazione.",
        },
        {
            "titolo": "IVA 4% e detrazione auto/ausili",
            "come": "Porta verbale e certificazioni al concessionario PRIMA dell'acquisto: applicano l'IVA agevolata direttamente in fattura. La detrazione del 19% si recupera nella dichiarazione dei redditi.",
        },
        {
            "titolo": "Esenzione bollo auto",
            "come": "Domanda all'ufficio tributi della tua Regione o all'ACI con verbale e libretto del veicolo. Va fatta una sola volta: vale finché possiedi l'auto.",
        },
        {
            "titolo": "Prestazioni economiche (assegno, pensione, accompagnamento)",
            "come": "Dopo il verbale, l'INPS chiede i dati di pagamento con il modello AP70 (il patronato lo compila). Se dopo 3-4 mesi non arriva nulla, fai un sollecito tramite patronato.",
        },
        {
            "titolo": "Collocamento mirato (se cerchi lavoro)",
            "come": "Con invalidità dal 46%, iscriviti alle liste del collocamento mirato al Centro per l'Impiego portando verbale e relazione conclusiva.",
        },
        {
            "titolo": "Contrassegno disabili e agevolazioni comunali",
            "come": "Richiedi il contrassegno auto al Comune (polizia locale) con il certificato del medico legale ASL. Chiedi anche di eventuali riduzioni TARI o trasporti locali.",
        },
    ],
    "faq": [
        {"d": "Quanto tempo ci mette l'INPS a convocare la visita?", "r": "In media 2-4 mesi dalla domanda (l'obiettivo di legge è 90 giorni, 15 per i malati oncologici). Se tarda troppo, il patronato può inviare un sollecito."},
        {"d": "Posso lavorare se prendo l'indennità di accompagnamento?", "r": "Sì. L'accompagnamento non dipende dal reddito né dal lavoro: conta solo la condizione sanitaria."},
        {"d": "I permessi 104 valgono per assistere due familiari?", "r": "Sì, in casi particolari è possibile il cumulo (es. genitore e coniuge): servono i requisiti per ciascuno. Chiedi conferma al patronato per il tuo caso."},
        {"d": "Il datore di lavoro può rifiutare i permessi 104?", "r": "No, se hai il verbale art. 3 comma 3 e la domanda INPS accolta. Può solo chiederti una programmazione ragionevole dei giorni."},
        {"d": "Cosa succede se salto la visita della Commissione?", "r": "Viene fissata una nuova convocazione. Alla seconda assenza non giustificata la domanda decade e va ripresentata."},
        {"d": "Il verbale ha una scadenza?", "r": "Alcuni verbali indicano una data di revisione, ma i benefici restano validi fino alla conclusione della nuova visita (L. 114/2014). Nessun vuoto di tutele."},
        {"d": "La persona non può muoversi da casa: come fa la visita?", "r": "Si può chiedere la visita domiciliare: il medico curante invia la richiesta almeno 5 giorni prima della data fissata."},
        {"d": "L'accompagnamento si perde se c'è un ricovero?", "r": "Viene sospesa solo per ricoveri gratuiti a carico dello Stato superiori a 29 giorni. Ricoveri brevi o a pagamento non la toccano."},
        {"d": "Quanto costa farsi seguire da un patronato?", "r": "Nulla: l'assistenza per queste pratiche è gratuita per legge, finanziata dallo Stato."},
        {"d": "La percentuale riconosciuta è più bassa del previsto: che faccio?", "r": "Puoi chiedere il riesame o fare ricorso al giudice (ATP) entro 6 mesi dal verbale. Nel frattempo raccogli referti aggiornati. Il patronato ti segue gratis."},
        {"d": "Cos'è la Riforma della Disabilità 2027?", "r": "Dal 1° gennaio 2027 (D.Lgs. 62/2024) in tutta Italia: basta il certificato del medico per avviare la pratica, la visita è solo INPS e si valuta l'impatto sulla vita quotidiana, non solo la percentuale. In molte province è già attiva in via sperimentale."},
        {"d": "Con la riforma perdo il mio verbale attuale?", "r": "No. I verbali già rilasciati restano validi a tempo indeterminato e non perdi nessuna agevolazione: la riforma vale solo per le nuove domande."},
        {"d": "La mia provincia è nella sperimentazione: cosa cambia per me?", "r": "Il tuo medico invia il certificato introduttivo e la pratica parte da sola: niente più domanda amministrativa separata. Puoi anche chiedere il Progetto di Vita personalizzato."},
    ],
    "glossario": [
        {"t": "Verbale", "d": "Il documento finale della Commissione Medica: indica percentuale di invalidità e/o gravità dell'handicap."},
        {"t": "Certificato medico introduttivo", "d": "Il certificato del medico che avvia la pratica: vale 90 giorni per presentare la domanda."},
        {"t": "Art. 3 comma 3 (L. 104)", "d": "La dicitura che indica handicap GRAVE: è quella che dà diritto a permessi e congedi."},
        {"t": "UVM", "d": "Unità Valutativa Multidimensionale della ASL: decide su assistenza domiciliare e ricoveri in RSA."},
        {"t": "ATP", "d": "Accertamento Tecnico Preventivo: il ricorso al giudice contro un verbale sbagliato, entro 6 mesi."},
        {"t": "Collocamento mirato", "d": "Il canale di assunzione riservato alle persone con invalidità dal 46% (L. 68/1999)."},
        {"t": "Indennità di accompagnamento", "d": "Contributo mensile per chi non è autosufficiente: senza limiti di età o reddito."},
        {"t": "Esenzione ticket", "d": "Il diritto a non pagare visite ed esami legati alla patologia o all'invalidità."},
        {"t": "Congedo straordinario", "d": "Fino a 2 anni retribuiti per assistere un familiare convivente con handicap grave."},
        {"t": "AP70", "d": "Il modello INPS con cui comunichi i dati di pagamento dopo l'accoglimento della domanda."},
        {"t": "ISEE", "d": "L'indicatore della situazione economica: serve per SAD comunale e altre agevolazioni (non per l'accompagnamento)."},
        {"t": "Riforma disabilità (D.Lgs 62/2024)", "d": "La nuova procedura: certificato unico, valutazione di base INPS e Progetto di Vita. Già attiva in molte province, in tutta Italia dal 1° gennaio 2027."},
    ],
    "riforma": {
        "regimeNazionale": "2027-01-01",
        "fonteUrl": "https://www.inps.it/it/it/inps-comunica/dossier/riforma-della-disabilita/fase-sperimentale.html",
        "intro": "Dal 1° gennaio 2027 la Riforma della Disabilità (D.Lgs. 62/2024) vale in tutta Italia. In molte province la nuova procedura è già attiva in via sperimentale: verifica la tua qui sotto.",
        "cosaCambia": [
            {"titolo": "Basta doppia domanda", "testo": "Il certificato medico introduttivo del tuo medico avvia DA SOLO la pratica: non serve più presentare la domanda amministrativa separata all'INPS."},
            {"titolo": "INPS unico valutatore", "testo": "La visita è gestita solo dall'INPS (non più dalle commissioni ASL): un solo accertamento, chiamato Valutazione di Base."},
            {"titolo": "Nuova valutazione (criteri OMS)", "testo": "Non si guarda solo la percentuale: si valuta quanto la condizione impatta la vita quotidiana (ICF-WHODAS). L'esito indica il livello di sostegno necessario, da lieve a molto elevato."},
            {"titolo": "Progetto di Vita", "testo": "Puoi chiedere un piano personalizzato che coordina in un unico documento sostegni sanitari, sociali, scuola, lavoro e vita indipendente."},
        ],
        "salvaguardia": "Chi ha GIÀ un verbale (invalidità civile o Legge 104, incluso art. 3 comma 3) NON deve rifare nulla: i verbali già rilasciati restano validi a tempo indeterminato e le agevolazioni non si perdono. La riforma vale solo per le nuove domande.",
        "fasi": [
            {
                "dal": "2025-01-01",
                "etichetta": "1ª fase sperimentale (dal 1° gennaio 2025)",
                "province": ["Brescia", "Catanzaro", "Firenze", "Forlì-Cesena", "Frosinone", "Perugia", "Salerno", "Sassari", "Trieste"],
            },
            {
                "dal": "2025-09-30",
                "etichetta": "2ª fase sperimentale (dal 30 settembre 2025)",
                "province": ["Alessandria", "Genova", "Isernia", "Lecce", "Macerata", "Matera", "Palermo", "Teramo", "Vicenza", "Trento", "Aosta"],
            },
            {
                "dal": "2026-03-01",
                "etichetta": "3ª fase sperimentale (dal 1° marzo 2026)",
                "province": ["Ancona", "Arezzo", "Ascoli Piceno", "Asti", "Bergamo", "Bologna", "Brindisi", "Cagliari", "Caltanissetta", "Campobasso", "Caserta", "Catania", "Chieti", "Como", "Cosenza", "Crotone", "Cuneo", "La Spezia", "Mantova", "Massa-Carrara", "Messina", "Milano", "Pavia", "Piacenza", "Pordenone", "Potenza", "Ravenna", "Reggio Calabria", "Rimini", "Roma", "Savona", "Sondrio", "Terni", "Torino", "Treviso", "Udine", "Venezia", "Verona", "Vibo Valentia"],
            },
        ],
    },
    "livelliSostegno": {
        "intro": "Con la Riforma 2027 l'esito della visita non è più solo una percentuale: indica il livello di sostegno di cui hai bisogno nella vita quotidiana. Tocca un livello per vedere le agevolazioni collegate.",
        "livelli": [
            {
                "nome": "Sostegno Lieve",
                "colore": "#1E7E34",
                "descrizione": "Difficoltà contenute nella vita quotidiana: sostegni mirati e agevolazioni di base.",
                "fisco": [
                    "Detrazione 19% delle spese sanitarie e di assistenza specifica",
                    "IVA 4% su ausili e sussidi tecnici/informatici collegati alla condizione",
                ],
                "lavoro": [
                    "Priorità nella scelta della sede di lavoro più vicina, ove possibile",
                    "Priorità di accesso allo smart working secondo i contratti",
                ],
            },
            {
                "nome": "Sostegno Medio",
                "colore": "#B45309",
                "descrizione": "Impatto significativo sulla vita quotidiana: più tutele economiche e sul lavoro.",
                "fisco": [
                    "Detrazione 19% spese sanitarie + deduzione spese di assistenza specifica",
                    "IVA 4% su ausili, tecnologia e domotica assistiva",
                    "IVA 4% sull'auto in caso di ridotte capacità motorie (con adattamento)",
                ],
                "lavoro": [
                    "Permessi retribuiti secondo quanto indicato nel verbale",
                    "Priorità di accesso allo smart working",
                    "Nessun trasferimento di sede senza il tuo consenso",
                ],
            },
            {
                "nome": "Sostegno Grave (ex art. 3 c. 3)",
                "colore": "#C2410C",
                "descrizione": "Corrisponde all'attuale handicap grave: agevolazioni piene per te e per chi ti assiste.",
                "fisco": [
                    "IVA 4% sull'acquisto dell'auto anche senza adattamento (limiti di cilindrata)",
                    "Esenzione totale del bollo auto e dell'imposta di trascrizione",
                    "Deduzione integrale delle spese di assistenza specifica",
                    "Detrazione per l'abbattimento delle barriere architettoniche",
                ],
                "lavoro": [
                    "3 giorni di permesso retribuito al mese (anche per chi ti assiste)",
                    "Congedo straordinario fino a 2 anni per il familiare convivente",
                    "Diritto alla sede più vicina e divieto di trasferimento senza consenso",
                ],
            },
            {
                "nome": "Sostegno Gravissimo (non autosufficienza)",
                "colore": "#B91C1C",
                "descrizione": "Necessità di assistenza continua: massime tutele economiche e di cura.",
                "fisco": [
                    "Indennità di accompagnamento, senza limiti di reddito o età",
                    "Tutte le agevolazioni auto del livello Grave",
                    "Deduzioni per spese di assistenza e badanti",
                    "Detrazioni per barriere architettoniche e domotica assistiva",
                ],
                "lavoro": [
                    "Permessi e congedo straordinario potenziati per i caregiver",
                    "Budget di cura coordinato nel Progetto di Vita con ASL e Comune",
                ],
            },
        ],
    },
}
