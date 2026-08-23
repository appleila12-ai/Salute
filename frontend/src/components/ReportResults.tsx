import { Platform, Pressable, StyleSheet, Text, ToastAndroid, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useRouter } from "expo-router";

import { colors, radius, spacing } from "@/src/theme";
import { buildReportHtml, Report, Right } from "@/src/lib/reports";

interface Props {
  report: Report;
  showBackHint?: boolean;
}

const CATEGORY_META: Record<
  Right["category"],
  { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  permessi: { label: "Permessi", icon: "time-outline", color: colors.brandPrimary },
  fiscale: { label: "Fiscale", icon: "cash-outline", color: colors.success },
  lavoro: { label: "Lavoro", icon: "briefcase-outline", color: colors.info },
  iter: { label: "Iter", icon: "document-text-outline", color: colors.warning },
  regionale: { label: "Regionale", icon: "location-outline", color: colors.brandPrimary },
  personalizzato: { label: "Su misura", icon: "sparkles-outline", color: colors.success },
};

async function toastOrLog(msg: string) {
  if (Platform.OS === "android") {
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  } else {
    console.log(msg);
  }
}

async function handleExport(report: Report) {
  const html = buildReportHtml(report);
  try {
    if (Platform.OS === "web") {
      // Web: open native print dialog
      await Print.printAsync({ html });
      return;
    }
    const { uri } = await Print.printToFileAsync({ html });
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Condividi valutazione",
        UTI: "com.adobe.pdf",
      });
    } else {
      toastOrLog(`PDF salvato: ${uri}`);
    }
  } catch (e) {
    console.warn("PDF export failed", e);
    toastOrLog("Impossibile generare il PDF");
  }
}

export function ReportResults({ report, showBackHint }: Props) {
  const router = useRouter();
  const a = report.answers;
  const dateFmt = new Date(report.createdAt).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <View testID="report-results-root">
      <Text style={styles.resultsIntro}>
        In base alle tue risposte, ecco cosa puoi richiedere adesso.
      </Text>
      <Text style={styles.resultsDate} testID="report-date">
        Generato il {dateFmt}
      </Text>

      {/* Answers summary */}
      <View style={styles.summaryCard} testID="report-summary">
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Chi assisti</Text>
          <Text style={styles.summaryValue}>{a.assisted}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Contratto</Text>
          <Text style={styles.summaryValue}>{a.contract}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Verbale</Text>
          <Text style={styles.summaryValue}>{a.verbale}</Text>
        </View>
        {a.age ? (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Età</Text>
            <Text style={styles.summaryValue}>{a.age}</Text>
          </View>
        ) : null}
        {a.region ? (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Regione</Text>
            <Text style={styles.summaryValue}>{a.region}</Text>
          </View>
        ) : null}
        {a.diagnosis ? (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Diagnosi</Text>
            <Text style={styles.summaryValue} numberOfLines={2}>
              {a.diagnosis}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Rights */}
      {report.rights.map((r, idx) => {
        const meta = CATEGORY_META[r.category];
        return (
          <View
            key={`${r.title}-${idx}`}
            style={styles.rightCard}
            testID={`report-right-${idx}`}
          >
            <View style={styles.rightHeader}>
              <View
                style={[
                  styles.rightIcon,
                  { backgroundColor: `${meta.color}1A` },
                ]}
              >
                <Ionicons name={meta.icon} size={18} color={meta.color} />
              </View>
              <View
                style={[
                  styles.rightBadge,
                  { backgroundColor: `${meta.color}1A` },
                ]}
              >
                <Text style={[styles.rightBadgeText, { color: meta.color }]}>
                  {meta.label}
                </Text>
              </View>
            </View>
            <Text style={styles.rightTitle}>{r.title}</Text>
            <Text style={styles.rightBody}>{r.body}</Text>
          </View>
        );
      })}

      {/* PDF Export */}
      <Pressable
        onPress={() => handleExport(report)}
        style={({ pressed }) => [
          styles.primaryBtn,
          { marginTop: spacing.lg },
          pressed && { opacity: 0.85 },
        ]}
        accessibilityRole="button"
        testID="report-pdf-button"
      >
        <Ionicons
          name="share-outline"
          size={20}
          color={colors.onBrandPrimary}
        />
        <Text style={styles.primaryBtnText}>Scarica o Condividi PDF</Text>
      </Pressable>

      {/* Next steps: Patronato */}
      <View style={styles.stepsCard} testID="report-next-steps">
        <View style={styles.stepsHeader}>
          <View style={styles.stepsIcon}>
            <Ionicons
              name="flag-outline"
              size={22}
              color={colors.brandPrimary}
            />
          </View>
          <Text style={styles.stepsTitle}>I prossimi passi ufficiali</Text>
        </View>
        <View style={styles.stepsList}>
          <StepItem index={1} text="Porta questo PDF al patronato più vicino." />
          <StepItem
            index={2}
            text="Il patronato invia gratuitamente la pratica all'INPS per te."
          />
          <StepItem
            index={3}
            text="Riceverai la convocazione dalla commissione ASL entro 90 giorni (15 se oncologico)."
          />
        </View>
        <Pressable
          onPress={() => router.push("/patronato")}
          style={({ pressed }) => [
            styles.secondaryBtn,
            pressed && { opacity: 0.85 },
          ]}
          accessibilityRole="button"
          testID="report-patronato-button"
        >
          <Ionicons
            name="location"
            size={18}
            color={colors.brandPrimary}
          />
          <Text style={styles.secondaryBtnText}>
            Cerca il Patronato più vicino
          </Text>
        </Pressable>
      </View>

      <View style={styles.disclaimer}>
        <Ionicons
          name="information-circle-outline"
          size={18}
          color={colors.onSurfaceTertiary}
        />
        <Text style={styles.disclaimerText}>
          Queste indicazioni sono orientative. Per la tua situazione specifica
          rivolgiti a un patronato o al tuo medico di base.
        </Text>
      </View>

      {showBackHint ? (
        <Pressable
          onPress={() => router.replace("/")}
          style={({ pressed }) => [
            styles.ghostBtn,
            pressed && { opacity: 0.7 },
          ]}
          testID="report-home-button"
          accessibilityRole="button"
        >
          <Text style={styles.ghostBtnText}>Torna alla home</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function StepItem({ index, text }: { index: number; text: string }) {
  return (
    <View style={styles.stepItem}>
      <View style={styles.stepBadge}>
        <Text style={styles.stepBadgeText}>{index}</Text>
      </View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  resultsIntro: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.onSurfaceSecondary,
    marginBottom: spacing.xs,
  },
  resultsDate: {
    fontSize: 13,
    color: colors.onSurfaceTertiary,
    marginBottom: spacing.lg,
  },

  summaryCard: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.onSurfaceTertiary,
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 14,
    color: colors.onSurface,
    fontWeight: "700",
    flexShrink: 1,
    textAlign: "right",
  },

  rightCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  rightHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  rightIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  rightBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  rightBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  rightTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.onSurface,
    marginBottom: 4,
  },
  rightBody: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.onSurfaceSecondary,
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
  primaryBtnText: {
    color: colors.onBrandPrimary,
    fontSize: 16,
    fontWeight: "700",
  },

  stepsCard: {
    backgroundColor: colors.brandSecondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
  stepsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  stepsIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  stepsTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: colors.onBrandSecondary,
  },
  stepsList: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  stepBadgeText: {
    color: colors.onBrandPrimary,
    fontSize: 12,
    fontWeight: "700",
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.onBrandSecondary,
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    minHeight: 52,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.brandPrimary,
  },
  secondaryBtnText: {
    color: colors.brandPrimary,
    fontSize: 15,
    fontWeight: "700",
  },

  disclaimer: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginTop: spacing.lg,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: colors.onSurfaceTertiary,
  },

  ghostBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
    marginTop: spacing.md,
  },
  ghostBtnText: {
    color: colors.brandPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
});
