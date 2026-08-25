import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useLocalSearchParams, useRouter } from "expo-router";

import { colors, radius, spacing } from "@/src/theme";
import { PatronatiSection } from "@/src/components/PatronatiSection";
import { PracticalHelpSection } from "@/src/components/PracticalHelpSection";
import { NextStepsSection } from "@/src/components/NextStepsSection";
import { DeadlineCard } from "@/src/components/DeadlineCard";
import { VaultSection } from "@/src/components/VaultSection";
import { AssistantCard } from "@/src/components/AssistantCard";
import { RightsSectionCard } from "@/src/components/RightsSectionCard";
import { AppealSection } from "@/src/components/AppealSection";
import { ShareModal } from "@/src/components/ShareModal";
import {
  buildReportHtml,
  getQrUrl,
  getReport,
  getShareUrl,
  Report,
} from "@/src/lib/reports";

function toast(msg: string) {
  if (Platform.OS === "android") ToastAndroid.show(msg, ToastAndroid.SHORT);
  else console.log(msg);
}

export default function Risultati() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const r = await getReport(id);
      if (mounted) {
        setReport(r);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const shareUrl = useMemo(() => (report ? getShareUrl(report) : null), [report]);
  const qrUrl = useMemo(() => (shareUrl ? getQrUrl(shareUrl) : null), [shareUrl]);

  const handleDownloadPdf = useCallback(async () => {
    if (!report) return;
    const html = buildReportHtml(report);
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
          dialogTitle: "TutelApp",
          UTI: "com.adobe.pdf",
        });
      } else {
        toast(`PDF salvato: ${uri}`);
      }
    } catch (e) {
      console.warn("pdf failed", e);
      toast("Impossibile generare il PDF");
    }
  }, [report]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.brandPrimary} />
        </View>
      </SafeAreaView>
    );
  }
  if (!report) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Report non trovato.</Text>
          <Pressable onPress={() => router.replace("/")} style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>Torna alla home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const a = report.answers;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]} testID="results-screen">
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => router.replace("/")}
            style={styles.iconBtn}
            hitSlop={12}
            accessibilityLabel="Home"
            testID="results-home-btn"
          >
            <Ionicons name="home-outline" size={20} color={colors.onSurface} />
          </Pressable>
          <Text style={styles.headerTitle}>I tuoi diritti</Text>
          <View style={styles.iconBtn} />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + spacing.xxl },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Empathic intro */}
          <View style={styles.introCard}>
            <View style={styles.introIcon}>
              <Ionicons name="sparkles" size={20} color={colors.brandPrimary} />
            </View>
            <Text style={styles.introText}>
              In base alla tua diagnosi (
              <Text style={styles.introStrong}>{a.when.toLowerCase()}</Text>) e
              alla tua situazione di{" "}
              <Text style={styles.introStrong}>{a.work.toLowerCase()}</Text>,
              ecco a cosa hai diritto passo dopo passo.
            </Text>
          </View>

          {/* Promemoria scadenza 90 giorni (data reale inserita dall'utente) */}
          <DeadlineCard cert={a.cert} />

          {/* Percorso passo-passo + certificato + possibilità 104/invalidità */}
          <NextStepsSection work={a.work} cert={a.cert} who={a.who} />

          {/* Rights sections */}
          {report.sections.map((s) => (
            <RightsSectionCard key={s.id} section={s} />
          ))}

          {/* PDF + Share row */}
          <View style={styles.actionsRow}>
            <Pressable
              onPress={handleDownloadPdf}
              style={({ pressed }) => [
                styles.primaryBtn,
                pressed && { opacity: 0.85 },
              ]}
              accessibilityRole="button"
              testID="results-pdf-btn"
            >
              <Ionicons
                name="download-outline"
                size={18}
                color={colors.onBrandPrimary}
              />
              <Text style={styles.primaryBtnText}>Scarica PDF</Text>
            </Pressable>
            <Pressable
              onPress={() => setShareOpen(true)}
              style={({ pressed }) => [
                styles.secondaryBtn,
                pressed && { opacity: 0.85 },
              ]}
              accessibilityRole="button"
              testID="results-share-btn"
            >
              <Ionicons
                name="people-outline"
                size={18}
                color={colors.brandPrimary}
              />
              <Text style={styles.secondaryBtnText}>Condividi Famiglia</Text>
            </Pressable>
          </View>

          {/* Patronati e Sportelli Territoriali */}
          <PatronatiSection />

          {/* Aiuti Pratici sul Territorio */}
          <PracticalHelpSection />

          {/* AI Assistant */}
          <AssistantCard answers={a} />

          {/* Cassaforte referti — Stripe reale + PDF + upload */}
          <VaultSection report={report} />

          {/* Checklist link */}
          <Pressable
            onPress={() => router.push("/checklist")}
            style={({ pressed }) => [
              styles.checklistLink,
              pressed && { opacity: 0.9 },
            ]}
            accessibilityRole="button"
            testID="results-checklist-link"
          >
            <Ionicons
              name="clipboard-outline"
              size={20}
              color={colors.brandPrimary}
            />
            <Text style={styles.checklistLinkText}>
              Checklist documenti per la visita
            </Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.borderStrong}
            />
          </Pressable>

          {/* Ricorso / riesame */}
          <AppealSection />

          <Text style={styles.disclaimer}>
            Questo report è orientativo, generato in base alle risposte fornite.
            Per la conferma nel tuo caso specifico rivolgiti a un patronato, a
            un CAF o al tuo ufficio HR/Personale.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Share modal */}
      <ShareModal
        visible={shareOpen}
        onClose={() => setShareOpen(false)}
        shareUrl={shareUrl}
        qrUrl={qrUrl}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
    padding: spacing.xl,
  },
  emptyText: { fontSize: 15, color: colors.onSurfaceSecondary },
  retryBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.pill,
  },
  retryBtnText: { color: colors.onBrandPrimary, fontWeight: "700" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: colors.onSurface,
  },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },

  introCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.brandSecondary,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  introIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  introText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.onBrandSecondary,
  },
  introStrong: { fontWeight: "800", color: colors.brandPrimary },

  actionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.brandPrimary,
    minHeight: 52,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
  },
  primaryBtnText: {
    color: colors.onBrandPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.brandPrimary,
    minHeight: 52,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
  },
  secondaryBtnText: {
    color: colors.brandPrimary,
    fontSize: 14,
    fontWeight: "800",
  },

  checklistLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  checklistLinkText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: colors.onSurface,
  },

  disclaimer: {
    fontSize: 12,
    color: colors.onSurfaceTertiary,
    lineHeight: 17,
    marginTop: spacing.md,
    textAlign: "center",
    fontStyle: "italic",
  },
});
