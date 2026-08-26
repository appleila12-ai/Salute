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
        {"t": "Riforma disabilità (D.Lgs 62/2024)", "d": "La nuova procedura in sperimentazione: certificato unico e Progetto di Vita. Attiva solo in alcune province."},
    ],
}
