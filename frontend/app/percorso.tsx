import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { colors, radius, spacing } from "@/src/theme";
import { PERCORSO_STEPS } from "@/src/data/mockData";

export default function Percorso() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState(false);

  const total = PERCORSO_STEPS.length;
  const current = PERCORSO_STEPS[stepIndex];
  const progress = ((stepIndex + 1) / total) * 100;
  const selected = current ? answers[current.id] : undefined;

  const handleSelect = (opt: string) => {
    if (!current) return;
    setAnswers((a) => ({ ...a, [current.id]: opt }));
  };

  const handleNext = () => {
    if (stepIndex < total - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleBack = () => {
    if (stepIndex === 0) {
      router.back();
    } else {
      setStepIndex(stepIndex - 1);
    }
  };

  if (completed) {
    return (
      <SafeAreaView style={styles.safe} testID="percorso-completed">
        <StatusBar barStyle="dark-content" />
        <View style={styles.completedWrap}>
          <View style={styles.completedIcon}>
            <Ionicons
              name="checkmark"
              size={40}
              color={colors.onBrandPrimary}
            />
          </View>
          <Text style={styles.completedTitle}>Grazie per aver risposto</Text>
          <Text style={styles.completedBody}>
            Abbiamo preparato un percorso personalizzato per te. Un operatore ti
            contatterà con calma nei tempi che hai scelto.
          </Text>

          <View style={styles.summaryCard}>
            {PERCORSO_STEPS.map((s) => (
              <View key={s.id} style={styles.summaryRow}>
                <Text style={styles.summaryQ}>{s.question}</Text>
                <Text style={styles.summaryA}>
                  {answers[s.id] ?? "—"}
                </Text>
              </View>
            ))}
          </View>

          <Pressable
            onPress={() => router.replace("/")}
            style={({ pressed }) => [
              styles.primaryBtn,
              { marginBottom: insets.bottom + spacing.md },
              pressed && { opacity: 0.85 },
            ]}
            testID="percorso-home-button"
            accessibilityRole="button"
          >
            <Text style={styles.primaryBtnText}>Torna alla home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} testID="percorso-screen">
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [
            styles.iconBtn,
            pressed && { opacity: 0.7 },
          ]}
          accessibilityLabel="Indietro"
          accessibilityRole="button"
          hitSlop={12}
          testID="percorso-back-button"
        >
          <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.stepIndicator} testID="percorso-step-indicator">
          {stepIndex + 1} di {total}
        </Text>
        <View style={styles.iconBtn} />
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.question} testID="percorso-question">
          {current.question}
        </Text>
        <Text style={styles.helper}>{current.helper}</Text>

        <View style={styles.optionsList}>
          {current.options.map((opt, idx) => {
            const isSel = selected === opt;
            return (
              <Pressable
                key={opt}
                onPress={() => handleSelect(opt)}
                style={({ pressed }) => [
                  styles.optionCard,
                  isSel && styles.optionCardSelected,
                  pressed && { opacity: 0.9 },
                ]}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSel }}
                testID={`percorso-option-${idx}`}
              >
                <View
                  style={[
                    styles.optionRadio,
                    isSel && styles.optionRadioSelected,
                  ]}
                >
                  {isSel && (
                    <Ionicons
                      name="checkmark"
                      size={14}
                      color={colors.onBrandPrimary}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.optionText,
                    isSel && styles.optionTextSelected,
                  ]}
                >
                  {opt}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Sticky bottom CTA */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: insets.bottom + spacing.md },
        ]}
      >
        <Pressable
          onPress={handleNext}
          disabled={!selected}
          style={({ pressed }) => [
            styles.primaryBtn,
            !selected && styles.primaryBtnDisabled,
            pressed && selected && { opacity: 0.85 },
          ]}
          accessibilityRole="button"
          accessibilityState={{ disabled: !selected }}
          testID="percorso-next-button"
        >
          <Text
            style={[
              styles.primaryBtnText,
              !selected && styles.primaryBtnTextDisabled,
            ]}
          >
            {stepIndex === total - 1 ? "Concludi" : "Avanti"}
          </Text>
          {selected && (
            <Ionicons
              name="arrow-forward"
              size={18}
              color={colors.onBrandPrimary}
            />
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepIndicator: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.onSurfaceTertiary,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.divider,
    marginHorizontal: spacing.lg,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  progressFill: {
    height: 4,
    backgroundColor: colors.brandPrimary,
  },
  scroll: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  question: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "700",
    color: colors.onSurface,
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
  },
  helper: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.onSurfaceTertiary,
    marginBottom: spacing.xl,
  },
  optionsList: {
    gap: spacing.md,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    minHeight: 64,
  },
  optionCardSelected: {
    borderColor: colors.brandPrimary,
    backgroundColor: colors.brandSecondary,
  },
  optionRadio: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  optionRadioSelected: {
    borderColor: colors.brandPrimary,
    backgroundColor: colors.brandPrimary,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: colors.onSurfaceSecondary,
    fontWeight: "500",
  },
  optionTextSelected: {
    color: colors.onBrandSecondary,
    fontWeight: "700",
  },

  bottomBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    backgroundColor: colors.surface,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.brandPrimary,
    minHeight: 56,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
  },
  primaryBtnDisabled: {
    backgroundColor: colors.surfaceTertiary,
  },
  primaryBtnText: {
    color: colors.onBrandPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  primaryBtnTextDisabled: {
    color: colors.onSurfaceTertiary,
  },

  completedWrap: {
    flex: 1,
    padding: spacing.xl,
    alignItems: "center",
  },
  completedIcon: {
    width: 80,
    height: 80,
    borderRadius: radius.pill,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xxl,
    marginBottom: spacing.xl,
  },
  completedTitle: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "700",
    color: colors.onSurface,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  completedBody: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.onSurfaceSecondary,
    textAlign: "center",
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  summaryCard: {
    alignSelf: "stretch",
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  summaryRow: {
    gap: 4,
  },
  summaryQ: {
    fontSize: 13,
    color: colors.onSurfaceTertiary,
    fontWeight: "600",
  },
  summaryA: {
    fontSize: 15,
    color: colors.onSurface,
    fontWeight: "700",
  },
});
