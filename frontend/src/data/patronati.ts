export interface Patronato {
  id: string;
  name: string;
  city: string;
  province: string;
  address: string;
  cap: string;
  phone: string;
  email: string;
  hours: string;
  featured?: boolean;
}

/**
 * Patronati e Sportelli Territoriali.
 * L'elenco include gli sportelli di Sarzana (SP) come esempio in evidenza
 * (INCA CGIL, ACLI, ITAL UIL) e una selezione di sedi nazionali per la
 * ricerca per CAP.
 */
export const PATRONATI: Patronato[] = [
  {
    id: "inca-sarzana",
    name: "INCA CGIL Sarzana",
    city: "Sarzana",
    province: "SP",
    address: "Via XXI Luglio 17",
    cap: "19038",
    phone: "0187 620411",
    email: "sarzana@inca.it",
    hours: "Lun-Ven 9:00 – 12:30 / 15:00 – 17:30",
    featured: true,
  },
  {
    id: "acli-sarzana",
    name: "Patronato ACLI Sarzana",
    city: "Sarzana",
    province: "SP",
    address: "Via Lucri 15",
    cap: "19038",
    phone: "0187 620255",
    email: "sarzana@patronato.acli.it",
    hours: "Lun-Mer-Ven 9:00 – 12:30",
    featured: true,
  },
  {
    id: "ital-sarzana",
    name: "ITAL UIL Sarzana",
    city: "Sarzana",
    province: "SP",
    address: "Via Landinelli 22",
    cap: "19038",
    phone: "0187 622311",
    email: "sarzana@italuil.it",
    hours: "Mar-Gio 9:00 – 13:00 / 15:00 – 18:00",
    featured: true,
  },
  {
    id: "inca-laspezia",
    name: "INCA CGIL La Spezia",
    city: "La Spezia",
    province: "SP",
    address: "Via Bologna 55",
    cap: "19122",
    phone: "0187 771711",
    email: "laspezia@inca.it",
    hours: "Lun-Ven 8:30 – 12:30 / 14:30 – 17:30",
  },
  {
    id: "acli-genova",
    name: "Patronato ACLI Genova",
    city: "Genova",
    province: "GE",
    address: "Piazza Campetto 2",
    cap: "16123",
    phone: "010 5533811",
    email: "genova@patronato.acli.it",
    hours: "Lun-Ven 9:00 – 13:00 / 14:30 – 17:00",
  },
  {
    id: "inca-milano",
    name: "INCA CGIL Milano",
    city: "Milano",
    province: "MI",
    address: "Corso di Porta Vittoria 43",
    cap: "20122",
    phone: "02 55025333",
    email: "milano@inca.it",
    hours: "Lun-Ven 9:00 – 17:00",
  },
  {
    id: "acli-roma",
    name: "Patronato ACLI Roma",
    city: "Roma",
    province: "RM",
    address: "Via Marcora 18/20",
    cap: "00153",
    phone: "06 5840501",
    email: "roma@patronato.acli.it",
    hours: "Lun-Ven 9:00 – 13:00 / 15:00 – 18:00",
  },
  {
    id: "ital-napoli",
    name: "ITAL UIL Napoli",
    city: "Napoli",
    province: "NA",
    address: "Via Toledo 353",
    cap: "80132",
    phone: "081 5525855",
    email: "napoli@italuil.it",
    hours: "Lun-Ven 9:00 – 13:00",
  },
  {
    id: "inas-torino",
    name: "INAS CISL Torino",
    city: "Torino",
    province: "TO",
    address: "Via Madama Cristina 50",
    cap: "10125",
    phone: "011 6548111",
    email: "torino@inas.it",
    hours: "Lun-Ven 8:30 – 13:00 / 14:30 – 17:30",
  },
  {
    id: "epaca-bologna",
    name: "Patronato EPACA Coldiretti Bologna",
    city: "Bologna",
    province: "BO",
    address: "Via Bigari 5/2",
    cap: "40128",
    phone: "051 6199560",
    email: "bologna@epaca.it",
    hours: "Lun-Ven 9:00 – 12:30",
  },
  {
    id: "inca-firenze",
    name: "INCA CGIL Firenze",
    city: "Firenze",
    province: "FI",
    address: "Borgo de' Greci 3",
    cap: "50122",
    phone: "055 27001",
    email: "firenze@inca.it",
    hours: "Lun-Ven 9:00 – 13:00 / 14:30 – 17:00",
  },
  {
    id: "acli-bari",
    name: "Patronato ACLI Bari",
    city: "Bari",
    province: "BA",
    address: "Via De Bellis 37",
    cap: "70126",
    phone: "080 5424564",
    email: "bari@patronato.acli.it",
    hours: "Lun-Ven 9:00 – 12:30",
  },
  {
    id: "inas-palermo",
    name: "INAS CISL Palermo",
    city: "Palermo",
    province: "PA",
    address: "Via Villa Heloise 10",
    cap: "90143",
    phone: "091 6113090",
    email: "palermo@inas.it",
    hours: "Lun-Ven 8:30 – 13:00",
  },
  {
    id: "ital-venezia",
    name: "ITAL UIL Venezia-Mestre",
    city: "Mestre",
    province: "VE",
    address: "Via Bembo 2/B",
    cap: "30172",
    phone: "041 2905865",
    email: "venezia@italuil.it",
    hours: "Lun-Ven 9:00 – 12:30 / 15:00 – 17:00",
  },
  {
    id: "inca-cagliari",
    name: "INCA CGIL Cagliari",
    city: "Cagliari",
    province: "CA",
    address: "Viale Monastir 35",
    cap: "09122",
    phone: "070 2795201",
    email: "cagliari@inca.it",
    hours: "Lun-Ven 9:00 – 13:00",
  },
  {
    id: "acli-ancona",
    name: "Patronato ACLI Ancona",
    city: "Ancona",
    province: "AN",
    address: "Via Di Vittorio 16",
    cap: "60127",
    phone: "071 2905000",
    email: "ancona@patronato.acli.it",
    hours: "Lun-Mer-Ven 9:00 – 12:30",
  },
  {
    id: "inas-catania",
    name: "INAS CISL Catania",
    city: "Catania",
    province: "CT",
    address: "Via Crociferi 40",
    cap: "95124",
    phone: "095 7159111",
    email: "catania@inas.it",
    hours: "Lun-Ven 8:30 – 13:00",
  },
];

/**
 * Filtra e ordina per prossimità di CAP o corrispondenza di città.
 * Ricerca CAP: confronto per prefisso (i CAP italiani sono zone geografiche:
 * più cifre iniziali in comune = più vicino), poi per distanza numerica.
 */
export function findPatronati(
  list: Patronato[],
  query: string,
  limit = 6,
): Patronato[] {
  const q = query.trim().toLowerCase();
  if (!q) return list.filter((p) => p.featured);

  // Query numerica (anche parziale, es. "1", "19", "19125"): modalità CAP
  if (/^\d+$/.test(q)) {
    const cap = q.slice(0, 5);
    const target = parseInt(cap.padEnd(5, "0"), 10);
    const scored = list.map((p) => {
      let prefix = 0;
      while (
        prefix < cap.length &&
        prefix < 5 &&
        p.cap[prefix] === cap[prefix]
      ) {
        prefix += 1;
      }
      return { p, prefix, dist: Math.abs(parseInt(p.cap, 10) - target) };
    });
    scored.sort((a, b) => b.prefix - a.prefix || a.dist - b.dist);
    return scored.slice(0, limit).map((s) => s.p);
  }

  // Altrimenti match testuale su città, provincia o nome
  return list
    .filter(
      (p) =>
        p.city.toLowerCase().includes(q) ||
        p.province.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q),
    )
    .slice(0, limit);
}
