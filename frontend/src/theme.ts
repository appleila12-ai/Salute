// TutelApp brand palette
// Primary: Blu Ceruleo/Avio (reassuring)
// Accent: Miele/Arancione chiaro (deadline warnings & key CTAs)
// Background: high-contrast white + very light gray
export const colors = {
  // Surfaces
  surface: "#FFFFFF",
  onSurface: "#0F172A",
  surfaceSecondary: "#F5F8FC",
  onSurfaceSecondary: "#1F2937",
  surfaceTertiary: "#E4EAF2",
  onSurfaceTertiary: "#334155",
  surfaceInverse: "#0F2A47",
  onSurfaceInverse: "#FFFFFF",

  // Primary — cerulean/air blue
  brand: "#2A75D3",
  brandPrimary: "#2A75D3",
  brandPrimaryDark: "#1F5CAE",
  onBrandPrimary: "#FFFFFF",
  brandSecondary: "#E6F0FB", // tinted background for chips/cards
  onBrandSecondary: "#1F5CAE",
  brandTertiary: "#CBDFF6",
  onBrandTertiary: "#153B5C",

  // Accent — honey / warm amber
  accent: "#F59E0B",
  accentSoft: "#FEF3C7",
  onAccent: "#78350F",
  accentDark: "#B45309",

  // States
  success: "#059669",
  successSoft: "#D1FAE5",
  warning: "#F59E0B",
  warningSoft: "#FEF3C7",
  error: "#DC2626",
  errorSoft: "#FEE2E2",
  info: "#2A75D3",

  // Neutrals
  border: "#E2E8F0",
  borderStrong: "#94A3B8",
  divider: "#F1F5F9",
  muted: "#64748B",
};

// Colori per argomento — ogni tema ha la sua identità visiva
export const topics = {
  percorso: { main: "#2A75D3", soft: "#E6F0FB", dark: "#1F5CAE" }, // blu — guida passo-passo
  legge104: { main: "#2A75D3", soft: "#E6F0FB", dark: "#1F5CAE" }, // blu — Legge 104
  invalidita: { main: "#7C3AED", soft: "#F3E8FF", dark: "#5B21B6" }, // viola — Invalidità Civile
  esenzioni: { main: "#059669", soft: "#D1FAE5", dark: "#047857" }, // verde — esenzioni/fisco
  lavoro: { main: "#EA580C", soft: "#FFEDD5", dark: "#C2410C" }, // arancio — lavoro/permessi
  documenti: { main: "#B45309", soft: "#FEF3C7", dark: "#92400E" }, // miele — documenti/scadenze
  salute: { main: "#0D9488", soft: "#CCFBF1", dark: "#0F766E" }, // teal — sede/salute
  patronato: { main: "#DB2777", soft: "#FCE7F3", dark: "#BE185D" }, // magenta — patronato
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  pill: 999,
};

export const shadow = {
  card: {
    shadowColor: "#0F2A47",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
};

export const brand = {
  name: "TutelApp",
  tagline: "La tua guida semplice ai diritti e alla Legge 104",
};
