export interface Patronato {
  id: string;
  name: string;
  city: string;
  address: string;
  cap: string;
  phone: string;
  email: string;
  hours: string;
}

// Mock list of Italian patronati/CAF across the country.
// CAP is used to compute proximity to the user's postcode.
export const PATRONATI: Patronato[] = [
  {
    id: "acli-roma",
    name: "Patronato ACLI",
    city: "Roma",
    address: "Via Marcora 18/20",
    cap: "00153",
    phone: "06 5840501",
    email: "roma@patronato.acli.it",
    hours: "Lun-Ven 9:00 – 13:00 / 15:00 – 18:00",
  },
  {
    id: "inca-milano",
    name: "Patronato INCA CGIL",
    city: "Milano",
    address: "Corso di Porta Vittoria 43",
    cap: "20122",
    phone: "02 55025333",
    email: "milano@inca.it",
    hours: "Lun-Ven 9:00 – 17:00",
  },
  {
    id: "ital-napoli",
    name: "Patronato ITAL UIL",
    city: "Napoli",
    address: "Via Toledo 353",
    cap: "80132",
    phone: "081 5525855",
    email: "napoli@italuil.it",
    hours: "Lun-Ven 9:00 – 13:00",
  },
  {
    id: "inas-torino",
    name: "Patronato INAS CISL",
    city: "Torino",
    address: "Via Madama Cristina 50",
    cap: "10125",
    phone: "011 6548111",
    email: "torino@inas.it",
    hours: "Lun-Ven 8:30 – 13:00 / 14:30 – 17:30",
  },
  {
    id: "epaca-bologna",
    name: "Patronato EPACA Coldiretti",
    city: "Bologna",
    address: "Via Bigari 5/2",
    cap: "40128",
    phone: "051 6199560",
    email: "bologna@epaca.it",
    hours: "Lun-Ven 9:00 – 12:30",
  },
  {
    id: "caf-cgil-firenze",
    name: "CAF CGIL",
    city: "Firenze",
    address: "Borgo dei Greci 3",
    cap: "50122",
    phone: "055 27311",
    email: "firenze@cafcgil.it",
    hours: "Lun-Ven 9:00 – 13:00 / 15:00 – 18:00",
  },
  {
    id: "acli-palermo",
    name: "Patronato ACLI",
    city: "Palermo",
    address: "Via Trapani 3",
    cap: "90141",
    phone: "091 6113111",
    email: "palermo@patronato.acli.it",
    hours: "Lun-Ven 9:00 – 13:00",
  },
  {
    id: "inca-bari",
    name: "Patronato INCA CGIL",
    city: "Bari",
    address: "Via Vittorio Veneto 8",
    cap: "70123",
    phone: "080 5789111",
    email: "bari@inca.it",
    hours: "Lun-Ven 9:00 – 12:30 / 15:00 – 17:30",
  },
  {
    id: "ital-genova",
    name: "Patronato ITAL UIL",
    city: "Genova",
    address: "Via San Giovanni d'Acri 6",
    cap: "16151",
    phone: "010 6459111",
    email: "genova@italuil.it",
    hours: "Lun-Ven 9:00 – 13:00",
  },
  {
    id: "inas-venezia",
    name: "Patronato INAS CISL",
    city: "Venezia",
    address: "Via Ca' Marcello 10",
    cap: "30172",
    phone: "041 5320611",
    email: "venezia@inas.it",
    hours: "Lun-Ven 8:30 – 12:30",
  },
];

/** Sort patronati by numerical CAP distance from user's CAP. */
export function sortByCapProximity(list: Patronato[], userCap: string): Patronato[] {
  const target = parseInt(userCap, 10);
  if (Number.isNaN(target)) return list;
  return [...list].sort((a, b) => {
    const da = Math.abs(parseInt(a.cap, 10) - target);
    const db = Math.abs(parseInt(b.cap, 10) - target);
    return da - db;
  });
}

/** Approximate km distance from CAP delta (very rough heuristic for UI). */
export function estimateDistanceKm(a: string, b: string): number | null {
  const na = parseInt(a, 10);
  const nb = parseInt(b, 10);
  if (Number.isNaN(na) || Number.isNaN(nb)) return null;
  const delta = Math.abs(na - nb);
  // Very rough: 1 CAP unit ≈ 0.1 km (post-code numbers cluster geographically in IT).
  return Math.round(delta * 0.1 * 10) / 10;
}
