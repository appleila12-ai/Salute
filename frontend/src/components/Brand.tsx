// TutelApp brand components — logo ufficiale (nodo triangolare teal)
// fornito dall'utente: assets/images/brand/mark.png + lockup.png.

import React from "react";
import { Image, ImageStyle, StyleSheet, Text, View, ViewStyle } from "react-native";

import { colors } from "@/src/theme";

const MARK = require("../../assets/images/brand/mark.png");
const LOCKUP = require("../../assets/images/brand/lockup.png");

interface LogoProps {
  size?: number;
  style?: ViewStyle;
  variant?: "solid" | "soft";
}

/** Logo mark ufficiale (immagine). Le due varianti differiscono solo per il bordo. */
export function Logo({ size = 64, style, variant = "solid" }: LogoProps) {
  const borderRadius = size * 0.28;
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius,
          overflow: "hidden",
          backgroundColor: "#EEF1F6",
          borderWidth: variant === "soft" ? 1.5 : 0,
          borderColor: "rgba(42,117,211,0.18)",
        },
        variant === "solid" && {
          shadowColor: colors.brandPrimaryDark,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.14,
          shadowRadius: 10,
          elevation: 3,
        },
        style,
      ]}
    >
      <Image
        source={MARK}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        accessibilityLabel="Logo TutelApp"
      />
    </View>
  );
}

/** Lockup completo (logo + nome + payoff) — usato nella Home. */
export function BrandLockup({ style }: { style?: ImageStyle }) {
  return (
    <Image
      source={LOCKUP}
      style={[styles.lockup, style]}
      resizeMode="cover"
      accessibilityLabel="TutelApp — La tua guida semplice ai diritti e alla Legge 104"
    />
  );
}

interface WordmarkProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  showLogo?: boolean;
  logoVariant?: "solid" | "soft";
  style?: ViewStyle;
}

/** Logo + "TutelApp" testuale. Usato nell'header. */
export function Wordmark({
  size = "md",
  color = colors.onSurface,
  showLogo = true,
  logoVariant = "solid",
  style,
}: WordmarkProps) {
  const cfg =
    size === "lg"
      ? { logo: 60, font: 26, gap: 12, letter: -0.6 }
      : size === "sm"
      ? { logo: 22, font: 15, gap: 6, letter: -0.2 }
      : { logo: 32, font: 19, gap: 8, letter: -0.4 };

  return (
    <View style={[styles.row, { gap: cfg.gap }, style]}>
      {showLogo && <Logo size={cfg.logo} variant={logoVariant} />}
      <Text
        style={{
          fontSize: cfg.font,
          fontWeight: "800",
          color,
          letterSpacing: cfg.letter,
        }}
      >
        Tutel<Text style={{ color: colors.brandPrimary }}>App</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  lockup: {
    width: "100%",
    height: 158,
    borderRadius: 16,
  },
});
