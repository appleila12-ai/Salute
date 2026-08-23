export interface Patronato {
  name: string;
  city: string;
  address: string;
  phone: string;
  hours: string;
  distanceKm: number;
}

export const PATRONATI: Patronato[] = [
  {
    name: "Patronato ACLI",
    city: "Roma",
    address: "Via Marcora 18/20",
    phone: "06 5840501",
    hours: "Lun-Ven 9:00 – 13:00 / 15:00 – 18:00",
    distanceKm: 1.2,
  },
  {
    name: "Patronato INCA CGIL",
    city: "Milano",
    address: "Corso di Porta Vittoria 43",
    phone: "02 55025333",
    hours: "Lun-Ven 9:00 – 17:00",
    distanceKm: 2.8,
  },
  {
    name: "Patronato ITAL UIL",
    city: "Napoli",
    address: "Via Toledo 353",
    phone: "081 5525855",
    hours: "Lun-Ven 9:00 – 13:00",
    distanceKm: 3.4,
  },
  {
    name: "Patronato INAS CISL",
    city: "Torino",
    address: "Via Madama Cristina 50",
    phone: "011 6548111",
    hours: "Lun-Ven 8:30 – 13:00 / 14:30 – 17:30",
    distanceKm: 4.1,
  },
  {
    name: "Patronato EPACA Coldiretti",
    city: "Bologna",
    address: "Via Bigari 5/2",
    phone: "051 6199560",
    hours: "Lun-Ven 9:00 – 12:30",
    distanceKm: 5.6,
  },
];
