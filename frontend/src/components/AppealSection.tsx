// Sezione ricorso/riesame — cosa fare se la domanda viene respinta.

import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors, radius, spacing } from "@/src/theme";

const APPEAL_STEPS = [
  "Richiedi copia del verbale entro 60 giorni dalla notifica",
  "Prepara nuovi referti clinici o esami mancati nella prima visita",
  "Chiedi al tuo medico curante un aggiornamento della relazione",
  "Contatta un patronato per la richiesta di riesame (gratuita)",
  "In alternativa, avvia il ricorso al giudice del lavoro (accertamento tecnico preventivo — ATP) entro 6 mesi",
];

export function AppealSection() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        style={styles.appealHeader}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        testID="appeal-toggle"
      >
        <View style={styles.appealIcon}>
          <Ionicons name="alert-circle" size={22} color={colors.warning} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.appealTitle}>
            Cosa fare se la domanda viene respinta o la percentuale è troppo
            bassa?
          </Text>
        </View>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={20}
          color={colors.onSurfaceTertiary}
        />
      </Pressable>
      {open && (
        <View style={styles.appealBody} testID="appeal-body">
          <Text style={styles.appealIntro}>
            Non demordere: nel 40% dei casi il riesame o il ricorso porta a un
            riconoscimento più alto. Ecco come procedere.
          </Text>
          <View style={styles.appealSteps}>
            {APPEAL_STEPS.map((s, idx) => (
              <View key={s} style={styles.appealStep}>
                <View style={styles.appealStepBadge}>
                  <Text style={styles.appealStepBadgeText}>{idx + 1}</Text>
                </View>
                <Text style={styles.appealStepText}>{s}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.appealFooter}>
            💡 Tutta la procedura è gratuita se ti rivolgi a un patronato (ACLI,
            INCA CGIL, ITAL UIL, INAS CISL).
          </Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  appealHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  appealIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },
  appealTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.onSurface,
    letterSpacing: -0.2,
    lineHeight: 19,
  },
  appealBody: {
    backgroundColor: "#FFFBEB",
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  appealIntro: {
    fontSize: 13,
    lineHeight: 19,
    color: "#78350F",
    marginBottom: spacing.md,
  },
  appealSteps: { gap: spacing.md, marginBottom: spacing.md },
  appealStep: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  appealStepBadge: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.warning,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  appealStepBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  appealStepText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: "#78350F",
  },
  appealFooter: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#92400E",
    lineHeight: 17,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "#FDE68A",
  },
});
