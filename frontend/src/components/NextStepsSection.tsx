// "E adesso cosa faccio?" — guida passo-passo dopo la diagnosi,
// spiegazione del Certificato Introduttivo e possibilità 104/Invalidità.

import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors, radius, spacing, topics } from "@/src/theme";
import {
  CERT_EXPLAINER,
  INVALIDITY_BRACKETS,
  LAW104_BENEFITS,
  NEXT_STEPS,
  PARTNER_NOTE,
} from "@/src/lib/content";
import { CertOption, WhoOption, WorkOption } from "@/src/lib/reports";

interface Props {
  work: WorkOption;
  cert: CertOption;
  who: WhoOption;
}

export function NextStepsSection({ work, cert, who }: Props) {
  const isUnemployed = work === "Inoccupato/Pensionato";
  const [certOpen, setCertOpen] = useState(cert === "Non so cos'è");

  const law104 = LAW104_BENEFITS.filter((b) => !isUnemployed || !b.workOnly);
  const brackets = INVALIDITY_BRACKETS.filter(
    (b) => !isUnemployed || !b.workOnly,
  );

  return (
    <View testID="next-steps-section">
      {/* Percorso passo-passo */}
      <View
        style={[styles.card, { borderLeftColor: topics.percorso.main }]}
        testID="guide-steps-card"
      >
        <View style={styles.cardHeader}>
          <View style={[styles.cardIcon, { backgroundColor: topics.percorso.soft }]}>
            <Ionicons name="footsteps" size={22} color={topics.percorso.main} />
          </View>
          <View style={styles.flex}>
            <Text style={[styles.topicLabel, { color: topics.percorso.main }]}>
              IL PERCORSO
            </Text>
            <Text style={styles.cardTitle}>
              Hai la diagnosi in mano: e adesso?
            </Text>
          </View>
        </View>
        <View style={styles.timeline}>
          {NEXT_STEPS.map((s, idx) => (
            <View key={s.title} style={styles.timelineRow}>
              <View style={styles.timelineLeft}>
                <View
                  style={[
                    styles.stepDot,
                    { backgroundColor: topics.percorso.main },
                  ]}
                >
                  <Text style={styles.stepDotText}>{idx + 1}</Text>
                </View>
                {idx < NEXT_STEPS.length - 1 && (
                  <View
                    style={[
                      styles.timelineBar,
                      { backgroundColor: topics.percorso.soft },
                    ]}
                  />
                )}
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.stepTitle}>{s.title}</Text>
                <Text style={styles.stepBody}>{s.body}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Certificato introduttivo — spiegazione */}
      <View
        style={[styles.card, { borderLeftColor: topics.documenti.main }]}
        testID="cert-explainer-card"
      >
        <Pressable
          onPress={() => setCertOpen((v) => !v)}
          style={styles.cardHeader}
          accessibilityRole="button"
          accessibilityState={{ expanded: certOpen }}
          testID="cert-explainer-toggle"
        >
          <View style={[styles.cardIcon, { backgroundColor: topics.documenti.soft }]}>
            <Ionicons
              name="document-text"
              size={22}
              color={topics.documenti.main}
            />
          </View>
          <View style={styles.flex}>
            <Text style={[styles.topicLabel, { color: topics.documenti.main }]}>
              DOCUMENTI
            </Text>
            <Text style={styles.cardTitle}>{CERT_EXPLAINER.title}</Text>
          </View>
          <Ionicons
            name={certOpen ? "chevron-up" : "chevron-down"}
            size={20}
            color={colors.onSurfaceTertiary}
          />
        </Pressable>
        {certOpen && (
          <View testID="cert-explainer-body">
            <Text style={styles.certIntro}>{CERT_EXPLAINER.intro}</Text>
            <View style={styles.bullets}>
              {CERT_EXPLAINER.points.map((p) => (
                <View key={p} style={styles.bulletRow}>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={topics.documenti.main}
                    style={styles.bulletIcon}
                  />
                  <Text style={styles.bulletText}>{p}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.certReform}>{CERT_EXPLAINER.reform}</Text>
          </View>
        )}
      </View>

      {/* Nota Partner / convivente di fatto */}
      {who === "Coniuge/Partner" && (
        <View style={styles.partnerNote} testID="partner-note">
          <Ionicons name="people" size={18} color={topics.legge104.dark} />
          <Text style={styles.partnerNoteText}>{PARTNER_NOTE}</Text>
        </View>
      )}

      {/* Se ottieni la Legge 104 */}
      <View
        style={[styles.card, { borderLeftColor: topics.legge104.main }]}
        testID="law104-card"
      >
        <View style={styles.cardHeader}>
          <View style={[styles.cardIcon, { backgroundColor: topics.legge104.soft }]}>
            <Ionicons name="ribbon" size={22} color={topics.legge104.main} />
          </View>
          <View style={styles.flex}>
            <Text style={[styles.topicLabel, { color: topics.legge104.main }]}>
              LEGGE 104
            </Text>
            <Text style={styles.cardTitle}>
              Se ti riconoscono la Legge 104
            </Text>
          </View>
        </View>
        <View style={styles.bullets}>
          {law104.map((b) => (
            <View key={b.text} style={styles.bulletRow}>
              <View
                style={[styles.dot, { backgroundColor: topics.legge104.main }]}
              />
              <Text style={styles.bulletText}>{b.text}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Se ottieni l'Invalidità Civile */}
      <View
        style={[styles.card, { borderLeftColor: topics.invalidita.main }]}
        testID="invalidity-card"
      >
        <View style={styles.cardHeader}>
          <View
            style={[styles.cardIcon, { backgroundColor: topics.invalidita.soft }]}
          >
            <Ionicons name="pulse" size={22} color={topics.invalidita.main} />
          </View>
          <View style={styles.flex}>
            <Text style={[styles.topicLabel, { color: topics.invalidita.main }]}>
              INVALIDITÀ CIVILE
            </Text>
            <Text style={styles.cardTitle}>
              Cosa spetta in base alla percentuale
            </Text>
          </View>
        </View>
        <View style={styles.bracketList}>
          {brackets.map((b) => (
            <View key={b.range} style={styles.bracketRow}>
              <View
                style={[
                  styles.bracketBadge,
                  { backgroundColor: topics.invalidita.soft },
                ]}
              >
                <Text
                  style={[styles.bracketText, { color: topics.invalidita.dark }]}
                >
                  {b.range}
                </Text>
              </View>
              <Text style={styles.bulletText}>{b.benefit}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.footerNote}>
          La percentuale la stabilisce la Commissione Medica nel verbale. Gli
          importi sono aggiornati ogni anno: verifica con INPS o Patronato.
        </Text>
      </View>
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  topicLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.onSurface,
    letterSpacing: -0.2,
    marginTop: 2,
  },

  // Timeline
  timeline: { gap: 0 },
  timelineRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  timelineLeft: {
    alignItems: "center",
    width: 28,
  },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  timelineBar: {
    flex: 1,
    width: 3,
    borderRadius: 2,
    marginVertical: 3,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: spacing.lg,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.onSurface,
    marginBottom: 3,
    lineHeight: 19,
  },
  stepBody: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.onSurfaceSecondary,
  },

  // Cert explainer
  certIntro: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: colors.onSurfaceSecondary,
    marginBottom: spacing.md,
  },
  certReform: {
    fontSize: 12,
    lineHeight: 17,
    fontStyle: "italic",
    color: colors.onSurfaceTertiary,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },

  // Bullets
  bullets: { gap: spacing.sm },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  bulletIcon: { marginTop: 2 },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.onSurfaceSecondary,
  },

  // Brackets
  bracketList: { gap: spacing.sm },
  bracketRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  bracketBadge: {
    minWidth: 62,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignItems: "center",
  },
  bracketText: {
    fontSize: 12,
    fontWeight: "800",
  },
  footerNote: {
    fontSize: 12,
    fontStyle: "italic",
    color: colors.onSurfaceTertiary,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    lineHeight: 17,
  },

  // Partner note
  partnerNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: topics.legge104.soft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  partnerNoteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: topics.legge104.dark,
    fontWeight: "500",
  },
});
