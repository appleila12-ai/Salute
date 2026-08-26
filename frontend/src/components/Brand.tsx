// TutelApp brand components — logo ufficiale (scudo intrecciato teal)
// servito dal backend come le illustrazioni (fix asset non caricati su
// Expo Go/web): /api/assets/brand/mark.png.

import React from "react";
import { Image, StyleSheet, Text, View, ViewStyle } from "react-native";

import { colors } from "@/src/theme";

const MARK = {
  uri: `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/assets/brand/mark.png`,
};

interface LogoProps {
  size?: number;
  style?: ViewStyle;
  variant?: "solid" | "soft";
}

/** Logo mark ufficiale su fondo bianco pulito. */
export function Logo({ size = 64, style, variant = "solid" }: LogoProps) {
  const borderRadius = size * 0.24;
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius,
          overflow: "hidden",
          backgroundColor: "#FFFFFF",
          borderWidth: variant === "soft" ? 1 : 0,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      <Image
        source={MARK}
        style={StyleSheet.absoluteFill}
        resizeMode="contain"
        accessibilityLabel="Logo TutelApp"
      />
    </View>
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
});
