// Illustrazioni TutelApp servite dal backend (funzionano anche su Expo Go,
// dove gli asset impacchettati non venivano caricati dal tunnel).

import { ImageSourcePropType } from "react-native";

const BASE = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/assets/illustrations`;

const img = (name: string): ImageSourcePropType => ({ uri: `${BASE}/${name}.jpg` });

export const IMAGES: Record<string, ImageSourcePropType> = {
  homeHero: img("home_hero"),
  wizardDiagnosi: img("wizard_diagnosi"),
  wizardLavoro: img("wizard_lavoro"),
  wizardCertificato: img("wizard_certificato"),
  diritti104: img("diritti104"),
  patronati: img("patronati"),
  territorio: img("territorio"),
  trasporti: img("trasporti"),
  domiciliare: img("domiciliare"),
  fisioterapia: img("fisioterapia"),
  rsa: img("rsa"),
};
