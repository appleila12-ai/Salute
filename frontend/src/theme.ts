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
