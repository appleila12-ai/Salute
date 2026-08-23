import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { colors, radius, spacing } from "@/src/theme";

const COFFEE_URL = "https://www.buymeacoffee.com/salutenav";

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const openCoffee = () => {
    Linking.openURL(COFFEE_URL).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.container}>
        {/* Brand pill */}
        <View style={styles.brandPill}>
          <Ionicons name="medkit" size={14} color={colors.brandPrimary} />
          <Text style={styles.brandText}>SaluteNav</Text>
        </View>

        {/* Header */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons
              name="shield-checkmark"
              size={40}
              color={colors.brandPrimary}
            />
          </View>
          <Text style={styles.title} testID="home-title">
            Navigatore Sanitario
          </Text>
          <Text style={styles.subtitle}>
            La tua guida passo-passo ai diritti.
          </Text>
        </View>

        {/* Description */}
        <View style={styles.descBox}>
          <Text style={styles.descText}>
            Un percorso semplice in 3 passi per capire quali tutele, permessi
            ed esenzioni ti spettano dopo una diagnosi.
          </Text>
        </View>

        {/* Start CTA */}
        <Pressable
          onPress={() => router.push("/valutazione")}
          style={({ pressed }) => [
            styles.startBtn,
            pressed && { opacity: 0.9 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Inizia il percorso"
          testID="home-start-btn"
        >
          <Text style={styles.startBtnText}>Inizia il percorso</Text>
          <Ionicons
            name="arrow-forward"
            size={22}
            color={colors.onBrandPrimary}
          />
        </Pressable>

        <View style={styles.stepsRow}>
          <StepIndicator num="1" label="Diagnosi" />
          <View style={styles.stepSep} />
          <StepIndicator num="2" label="Lavoro" />
          <View style={styles.stepSep} />
          <StepIndicator num="3" label="Documenti" />
        </View>

        <View style={styles.spacer} />

        {/* Support box */}
        <View
          style={[styles.supportBox, { marginBottom: insets.bottom > 0 ? 0 : spacing.md }]}
          testID="home-support-box"
        >
          <View style={styles.supportRow}>
            <Text style={styles.supportEmoji}>☕</Text>
            <View style={styles.flex}>
              <Text style={styles.supportTitle}>App 100% gratuita</Text>
              <Text style={styles.supportBody}>
                Se vuoi aiutarci a coprire i costi dei server, offrici un caffè.
              </Text>
            </View>
            <Pressable
              onPress={openCoffee}
              style={({ pressed }) => [
                styles.coffeeBtn,
                pressed && { opacity: 0.85 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Offrimi un caffè"
              testID="home-coffee-btn"
            >
              <Text style={styles.coffeeBtnText}>€3</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function StepIndicator({ num, label }: { num: string; label: string }) {
  return (
    <View style={styles.stepIndicator}>
      <View style={styles.stepBadge}>
        <Text style={styles.stepBadgeText}>{num}</Text>
      </View>
      <Text style={styles.stepLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    alignItems: "stretch",
  },
  brandPill: {
    flexDirection: "row",
    alignSelf: "center",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.brandSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  brandText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.brandPrimary,
    letterSpacing: 0.6,
  },

  hero: {
    alignItems: "center",
    marginTop: spacing.xxl,
  },
  heroIcon: {
    width: 88,
    height: 88,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.onSurface,
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 17,
    color: colors.onSurfaceSecondary,
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "500",
  },

  descBox: {
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.md,
  },
  descText: {
    fontSize: 15,
    lineHeight: 23,
    textAlign: "center",
    color: colors.onSurfaceTertiary,
  },

  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.brandPrimary,
    minHeight: 64,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
  },
  startBtnText: {
    color: colors.onBrandPrimary,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.2,
  },

  stepsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  stepIndicator: {
    alignItems: "center",
    gap: 6,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBadgeText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.brandPrimary,
  },
  stepLabel: {
    fontSize: 12,
    color: colors.onSurfaceTertiary,
    fontWeight: "600",
  },
  stepSep: {
    width: 24,
    height: 1.5,
    backgroundColor: colors.border,
    marginBottom: 18,
  },

  spacer: { flex: 1 },

  supportBox: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  supportRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  supportEmoji: {
    fontSize: 28,
  },
  supportTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.onSurface,
  },
  supportBody: {
    fontSize: 12,
    color: colors.onSurfaceTertiary,
    lineHeight: 17,
    marginTop: 2,
  },
  coffeeBtn: {
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radius.pill,
  },
  coffeeBtnText: {
    color: colors.onBrandPrimary,
    fontWeight: "800",
    fontSize: 14,
  },
});
