import { Platform, Pressable, StyleSheet, Text, ToastAndroid, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useRouter } from "expo-router";

import { colors, radius, spacing } from "@/src/theme";
import { useI18n } from "@/src/lib/i18n";
import { buildReportHtml, Report, resolveRightWithAnswers, RightCategory } from "@/src/lib/reports";

interface Props {
  report: Report;
  showBackHint?: boolean;
}

const CATEGORY_META: Record<
  RightCategory,
  { icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  permessi: { icon: "time-outline", color: colors.brandPrimary },
  fiscale: { icon: "cash-outline", color: colors.success },
  lavoro: { icon: "briefcase-outline", color: colors.info },
  iter: { icon: "document-text-outline", color: colors.warning },
  regionale: { icon: "location-outline", color: colors.brandPrimary },
  personalizzato: { icon: "sparkles-outline", color: colors.success },
};

function toastOrLog(msg: string) {
  if (Platform.OS === "android") {
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  } else {
    console.log(msg);
  }
}

async function handleExport(report: Report, lang: "it" | "en") {
  const html = buildReportHtml(report, lang);
  try {
    if (Platform.OS === "web") {
      await Print.printAsync({ html });
      return;
    }
    const { uri } = await Print.printToFileAsync({ html });
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "SaluteNav",
        UTI: "com.adobe.pdf",
      });
    } else {
      toastOrLog(`PDF: ${uri}`);
    }
  } catch (e) {
    console.warn("PDF export failed", e);
    toastOrLog("PDF error");
  }
}

export function ReportResults({ report, showBackHint }: Props) {
  const router = useRouter();
  const { t, lang } = useI18n();
  const a = report.answers;
  const locale = lang === "en" ? "en-GB" : "it-IT";
  const dateFmt = new Date(report.createdAt).toLocaleDateString(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <View testID="report-results-root">
      <Text style={styles.resultsIntro}>{t("res.intro")}</Text>
      <Text style={styles.resultsDate} testID="report-date">
        {t("res.generatedOn")} {dateFmt}
      </Text>

      {/* Answers summary */}
      <View style={styles.summaryCard} testID="report-summary">
        <SummaryRow label={t("res.summary.assisted")} value={a.assisted} />
        <SummaryRow label={t("res.summary.contract")} value={a.contract} />
        <SummaryRow label={t("res.summary.verbale")} value={a.verbale} />
        {a.age ? <SummaryRow label={t("res.summary.age")} value={a.age} /> : null}
        {a.region ? <SummaryRow label={t("res.summary.region")} value={a.region} /> : null}
        {a.diagnosis ? (
          <SummaryRow label={t("res.summary.diagnosis")} value={a.diagnosis} />
        ) : null}
      </View>

      {/* Rights */}
      {report.rights.map((r, idx) => {
        const resolved = resolveRightWithAnswers(r, a, lang);
        const meta = CATEGORY_META[resolved.category];
        const catLabel = t(`cat.${resolved.category}` as any);
        return (
          <View
            key={`${r.id}-${idx}`}
            style={styles.rightCard}
            testID={`report-right-${idx}`}
          >
            <View style={styles.rightHeader}>
              <View style={[styles.rightIcon, { backgroundColor: `${meta.color}1A` }]}>
                <Ionicons name={meta.icon} size={18} color={meta.color} />
              </View>
              <View style={[styles.rightBadge, { backgroundColor: `${meta.color}1A` }]}>
                <Text style={[styles.rightBadgeText, { color: meta.color }]}>
                  {catLabel}
                </Text>
              </View>
            </View>
            <Text style={styles.rightTitle}>{resolved.title}</Text>
            <Text style={styles.rightBody}>{resolved.body}</Text>
          </View>
        );
      })}

      {/* PDF Export */}
      <Pressable
        onPress={() => handleExport(report, lang)}
        style={({ pressed }) => [
          styles.primaryBtn,
          { marginTop: spacing.lg },
          pressed && { opacity: 0.85 },
        ]}
        accessibilityRole="button"
        testID="report-pdf-button"
      >
        <Ionicons name="share-outline" size={20} color={colors.onBrandPrimary} />
        <Text style={styles.primaryBtnText}>{t("res.pdf")}</Text>
      </Pressable>

      {/* Next steps: Patronato */}
      <View style={styles.stepsCard} testID="report-next-steps">
        <View style={styles.stepsHeader}>
          <View style={styles.stepsIcon}>
            <Ionicons name="flag-outline" size={22} color={colors.brandPrimary} />
          </View>
          <Text style={styles.stepsTitle}>{t("res.nextSteps")}</Text>
        </View>
        <View style={styles.stepsList}>
          <StepItem index={1} text={t("res.step1")} />
          <StepItem index={2} text={t("res.step2")} />
          <StepItem index={3} text={t("res.step3")} />
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
          <Ionicons name="location" size={18} color={colors.brandPrimary} />
          <Text style={styles.secondaryBtnText}>{t("res.findPatronato")}</Text>
        </Pressable>
      </View>

      <View style={styles.disclaimer}>
        <Ionicons
          name="information-circle-outline"
          size={18}
          color={colors.onSurfaceTertiary}
        />
        <Text style={styles.disclaimerText}>{t("res.disclaimer")}</Text>
      </View>

      {showBackHint ? (
        <Pressable
          onPress={() => router.replace("/")}
          style={({ pressed }) => [styles.ghostBtn, pressed && { opacity: 0.7 }]}
          testID="report-home-button"
          accessibilityRole="button"
        >
          <Text style={styles.ghostBtnText}>{t("common.home")}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue} numberOfLines={2}>
        {value}
      </Text>
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
