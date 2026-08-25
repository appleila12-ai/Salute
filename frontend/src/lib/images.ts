// Immagini illustrative (Unsplash CDN) — stile caldo, umano, empatico.
// Angoli arrotondati applicati dai componenti (radius 12-16).

const U = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?w=${w}&q=65&auto=format&fit=crop&sat=-100`;

export const IMAGES = {
  /** Home hero — mani che si sostengono, cura familiare */
  homeHero: U("photo-1544027993-37dbfe43562a", 1080),
  /** Wizard passo 1 — diagnosi (stetoscopio) */
  wizardDiagnosi: U("photo-1584982751601-97dcc096659c"),
  /** Wizard passo 2 — lavoro (team) */
  wizardLavoro: U("photo-1521737604893-d14cc237f11d"),
  /** Wizard passo 3 — certificato (firma documento) */
  wizardCertificato: U("photo-1450101499163-c8848c66ca85"),
  /** Risultati — diritti e permessi 104 (consulenza/documenti) */
  diritti104: U("photo-1556761175-b413da4baf72"),
  /** Patronati e assistenza (sportello/ufficio) */
  patronati: U("photo-1577962917302-cd874c4e31d2"),
  /** Aiuti sul territorio (mani che si aiutano) */
  territorio: U("photo-1521791136064-7986c2920216"),
  /** Trasporti e pubblica assistenza */
  trasporti: U("photo-1587745416684-47953f16f02f"),
  /** Assistenza domiciliare ADI/SAD */
  domiciliare: U("photo-1544027993-37dbfe43562a"),
  /** Fisioterapia */
  fisioterapia: U("photo-1571019613454-1cb2f99b2d8b"),
  /** RSA e ricoveri di sollievo */
  rsa: U("photo-1559757148-5c350d0d3c56"),
};
