// "Verbale in mano: e ora?" — come attivare concretamente ogni beneficio.
// Contenuti aggiornabili dal server.

import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors, radius, spacing, topics } from "@/src/theme";
import { loadAppContent, VerbaleStep } from "@/src/lib/remoteContent";

export function VerbaleSection() {
  const [open, setOpen] = useState(false);
  const [steps, setSteps] = useState<VerbaleStep[]>([]);

  useEffect(() => {
    (async () => {
      const c = await loadAppContent();
      if (c?.dopoVerbale) setSteps(c.dopoVerbale);
    })();
  }, []);

  if (steps.length === 0) return null;

  return (
    <View
      style={[styles.card, { borderLeftColor: topics.esenzioni.main }]}
      testID="verbale-section"
    >
      <Pressable
        onPress={() => setOpen((v) => !v)}
        style={styles.header}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        testID="verbale-toggle"
      >
        <View style={styles.icon}>
          <Ionicons
            name="checkmark-done"
            size={22}
            color={topics.esenzioni.main}
          />
        </View>
        <View style={styles.flex}>
          <Text style={[styles.label, { color: topics.esenzioni.main }]}>
            DOPO IL VERBALE
          </Text>
          <Text style={styles.title}>Verbale in mano: e ora?</Text>
        </View>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={20}
          color={colors.onSurfaceTertiary}
        />
      </Pressable>

      {open && (
        <View style={styles.body} testID="verbale-body">
          <Text style={styles.intro}>
            Il verbale non attiva nulla da solo: ogni beneficio va richiesto al
            posto giusto. Ecco come, uno per uno.
          </Text>
          {steps.map((s, i) => (
            <View key={s.titolo} style={styles.stepRow}>
              <View
                style={[styles.stepDot, { backgroundColor: topics.esenzioni.main }]}
              >
                <Text style={styles.stepDotText}>{i + 1}</Text>
              </View>
              <View style={styles.flex}>
                <Text style={styles.stepTitle}>{s.titolo}</Text>
                <Text style={styles.stepBody}>{s.come}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: topics.esenzioni.soft,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.onSurface,
    marginTop: 2,
    letterSpacing: -0.2,
  },
  body: { marginTop: spacing.md },
  intro: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.onSurfaceSecondary,
    marginBottom: spacing.md,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  stepDotText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.onSurface,
    marginBottom: 2,
    lineHeight: 19,
  },
  stepBody: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.onSurfaceSecondary,
  },
});
