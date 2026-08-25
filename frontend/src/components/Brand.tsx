// TutelApp brand components: Logo (shield + check) and Wordmark
// Composed with react-native Views + Ionicons (no SVG dep).

import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/src/theme";

interface LogoProps {
  size?: number;
  style?: ViewStyle;
  variant?: "solid" | "soft";
}

/**
 * Logo mark: rounded soft shield with a checkmark inside.
 * `solid` = filled gradient (used on Home hero / white backgrounds).
 * `soft`  = light tinted background (used inline next to wordmark).
 */
export function Logo({ size = 64, style, variant = "solid" }: LogoProps) {
  // Shield uses a slight radius asymmetry (rounded top, tapered bottom feel via padding)
  const borderRadius = size * 0.32;
  const iconSize = Math.round(size * 0.58);

  if (variant === "soft") {
    return (
      <View
        style={[
          {
            width: size,
            height: size,
            borderRadius,
            backgroundColor: colors.brandSecondary,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1.5,
            borderColor: "rgba(42,117,211,0.18)",
          },
          style,
        ]}
      >
        <Ionicons
          name="shield-checkmark"
          size={iconSize}
          color={colors.brandPrimary}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius,
          overflow: "hidden",
          shadowColor: colors.brandPrimaryDark,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.18,
          shadowRadius: 12,
          elevation: 4,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={[colors.brandPrimary, colors.brandPrimaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* subtle inner highlight */}
      <View
        style={{
          position: "absolute",
          top: size * 0.1,
          left: size * 0.15,
          right: size * 0.35,
          height: size * 0.15,
          borderRadius: size * 0.1,
          backgroundColor: "rgba(255,255,255,0.14)",
        }}
      />
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="shield" size={iconSize + 4} color="rgba(255,255,255,0.18)" />
        <Ionicons
          name="checkmark-sharp"
          size={iconSize}
          color="#FFFFFF"
          style={{ position: "absolute" }}
        />
      </View>
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

/**
 * Full brand lockup: Logo + "TutelApp" wordmark. Used in Home header + hero.
 */
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
