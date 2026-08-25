// Card di una sezione diritti (permessi, sede, esenzioni, prestazioni)
// con colore per argomento.

import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors, radius, spacing, topics } from "@/src/theme";
import { RightSection } from "@/src/lib/reports";

const SECTION_META: Record<
  RightSection["id"],
  {
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    soft: string;
    label: string;
  }
> = {
  permessi: {
    icon: "time-outline",
    color: topics.lavoro.main,
    soft: topics.lavoro.soft,
    label: "LAVORO",
  },
  sede: {
    icon: "location-outline",
    color: topics.salute.main,
    soft: topics.salute.soft,
    label: "SEDE E SMART WORKING",
  },
  fiscali: {
    icon: "cash-outline",
    color: topics.esenzioni.main,
    soft: topics.esenzioni.soft,
    label: "ESENZIONI",
  },
  prestazioni: {
    icon: "wallet-outline",
    color: topics.invalidita.main,
    soft: topics.invalidita.soft,
    label: "PRESTAZIONI ECONOMICHE",
  },
};

export function RightsSectionCard({ section }: { section: RightSection }) {
  const meta = SECTION_META[section.id];
  return (
    <View
      style={[styles.sectionCard, { borderLeftColor: meta.color }]}
      testID={`results-section-${section.id}`}
    >
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: meta.soft }]}>
          <Ionicons name={meta.icon} size={22} color={meta.color} />
        </View>
        <View style={styles.flex}>
          <Text style={[styles.sectionStep, { color: meta.color }]}>
            {meta.label}
          </Text>
          <Text style={styles.sectionTitle}>{section.title}</Text>
        </View>
      </View>
      <Text style={styles.sectionIntro}>{section.intro}</Text>
      <View style={styles.bullets}>
        {section.bullets.map((b) => (
          <View key={b} style={styles.bulletRow}>
            <View style={[styles.bulletDot, { backgroundColor: meta.color }]} />
            <Text style={styles.bulletText}>{b}</Text>
          </View>
        ))}
      </View>
      {section.footer ? (
        <Text style={styles.sectionFooter}>{section.footer}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  sectionIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionStep: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.onSurface,
    letterSpacing: -0.2,
    marginTop: 2,
  },
  sectionIntro: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.onSurfaceSecondary,
    marginBottom: spacing.md,
  },
  bullets: { gap: spacing.sm },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  bulletDot: {
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
  sectionFooter: {
    fontSize: 12,
    fontStyle: "italic",
    color: colors.onSurfaceTertiary,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
});
