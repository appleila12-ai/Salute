import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useLocalSearchParams, useRouter } from "expo-router";

import { colors, radius, spacing } from "@/src/theme";
import { PatronatiSection } from "@/src/components/PatronatiSection";
import {
  askAssistant,
  buildReportHtml,
  formatDate,
  getQrUrl,
  getReport,
  getShareUrl,
  Report,
  RightSection,
} from "@/src/lib/reports";

const SUGGESTIONS = [
  "Mio padre vive in un'altra regione, ho diritto ai permessi?",
  "Posso rifiutare il trasferimento di sede?",
  "Come si richiede il congedo straordinario di 2 anni?",
  "Che percentuale di invalidità serve per l'accompagnamento?",
];

const SECTION_META: Record<
  RightSection["id"],
  { icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  permessi: { icon: "time-outline", color: colors.brandPrimary },
  sede: { icon: "location-outline", color: colors.info },
  fiscali: { icon: "cash-outline", color: colors.success },
};

const APPEAL_STEPS = [
  "Richiedi copia del verbale entro 60 giorni dalla notifica",
  "Prepara nuovi referti clinici o esami mancati nella prima visita",
  "Chiedi al tuo medico curante un aggiornamento della relazione",
  "Contatta un patronato per la richiesta di riesame (gratuita)",
  "In alternativa, avvia il ricorso al giudice del lavoro (accertamento tecnico preventivo — ATP) entro 6 mesi",
];

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
  const [appealOpen, setAppealOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [askLoading, setAskLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [stripeOpen, setStripeOpen] = useState(false);
  const [vaultFiles, setVaultFiles] = useState<string[]>([]);

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
          dialogTitle: "SaluteNav",
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

  const handleShareLink = async () => {
    if (!shareUrl) return;
    try {
      await Share.share({
        message: `Ecco il mio report TutelApp: ${shareUrl}`,
        url: shareUrl,
      });
    } catch (e) {
      console.warn(e);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    await Clipboard.setStringAsync(shareUrl);
    toast("Link copiato");
  };

  const handleAsk = async (q: string) => {
    const finalQ = q.trim();
    if (!finalQ || askLoading) return;
    setAskLoading(true);
    setAnswer(null);
    try {
      const a = await askAssistant(finalQ, report?.answers);
      setAnswer(a);
    } catch (e) {
      console.warn(e);
      setAnswer(
        "Al momento non riesco a rispondere. Riprova tra qualche minuto o contatta un patronato.",
      );
    } finally {
      setAskLoading(false);
    }
  };

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
  const diagDate = formatDate(a.diagnosisDate);

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
              In base alla tua diagnosi del{" "}
              <Text style={styles.introStrong}>{diagDate}</Text> e alla tua
              situazione di{" "}
              <Text style={styles.introStrong}>{a.work.toLowerCase()}</Text>,
              ecco a cosa hai diritto passo dopo passo.
            </Text>
          </View>

          {/* 90-day deadline warning */}
          <View style={styles.deadlineCard} testID="results-deadline">
            <Ionicons name="alarm" size={22} color={colors.warning} />
            <View style={styles.flex}>
              <Text style={styles.deadlineTitle}>Occhio ai 90 giorni</Text>
              <Text style={styles.deadlineBody}>
                {"Dal rilascio del certificato medico introduttivo hai "}
                <Text style={styles.deadlineStrong}>90 giorni</Text>
                {" per inviare la domanda telematica all'INPS."}
              </Text>
            </View>
          </View>

          {/* Rights sections */}
          {report.sections.map((s, idx) => {
            const meta = SECTION_META[s.id];
            return (
              <View
                key={s.id}
                style={styles.sectionCard}
                testID={`results-section-${s.id}`}
              >
                <View style={styles.sectionHeader}>
                  <View
                    style={[
                      styles.sectionIcon,
                      { backgroundColor: `${meta.color}1A` },
                    ]}
                  >
                    <Ionicons name={meta.icon} size={22} color={meta.color} />
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.sectionStep}>PARTE {idx + 1}</Text>
                    <Text style={styles.sectionTitle}>{s.title}</Text>
                  </View>
                </View>
                <Text style={styles.sectionIntro}>{s.intro}</Text>
                <View style={styles.bullets}>
                  {s.bullets.map((b) => (
                    <View key={b} style={styles.bulletRow}>
                      <View
                        style={[
                          styles.bulletDot,
                          { backgroundColor: meta.color },
                        ]}
                      />
                      <Text style={styles.bulletText}>{b}</Text>
                    </View>
                  ))}
                </View>
                {s.footer ? (
                  <Text style={styles.sectionFooter}>{s.footer}</Text>
                ) : null}
              </View>
            );
          })}

          {/* PDF + Share row */}
          <View style={styles.actionsRow}>
            <Pressable
              onPress={handleDownloadPdf}
              style={({ pressed }) => [
                styles.primaryBtn,
                { flex: 1 },
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
                { flex: 1 },
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

          {/* AI Assistant */}
          <View style={styles.aiCard} testID="results-assistant">
            <View style={styles.aiHeader}>
              <View style={styles.aiHeaderIcon}>
                <Ionicons
                  name="chatbubbles"
                  size={22}
                  color={colors.brandPrimary}
                />
              </View>
              <View style={styles.flex}>
                <Text style={styles.aiTitle}>
                  Fai una domanda alla Legge 104
                </Text>
                <Text style={styles.aiSub}>
                  Risposta immediata basata sulla normativa vigente.
                </Text>
              </View>
            </View>

            <View style={styles.aiInputWrap}>
              <TextInput
                style={styles.aiInput}
                placeholder="Scrivi la tua domanda…"
                placeholderTextColor={colors.muted}
                value={question}
                onChangeText={setQuestion}
                multiline
                testID="assistant-input"
                accessibilityLabel="Domanda per l'assistente"
              />
            </View>

            <Text style={styles.aiSuggLabel}>Suggerimenti veloci</Text>
            <View style={styles.aiSuggs}>
              {SUGGESTIONS.map((s, idx) => (
                <Pressable
                  key={s}
                  onPress={() => {
                    setQuestion(s);
                    handleAsk(s);
                  }}
                  style={({ pressed }) => [
                    styles.aiSuggChip,
                    pressed && { opacity: 0.85 },
                  ]}
                  testID={`assistant-suggestion-${idx}`}
                >
                  <Text style={styles.aiSuggText} numberOfLines={2}>
                    {s}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={() => handleAsk(question)}
              disabled={askLoading || question.trim().length === 0}
              style={({ pressed }) => [
                styles.aiAskBtn,
                (askLoading || question.trim().length === 0) &&
                  styles.aiAskBtnDisabled,
                pressed && !askLoading && { opacity: 0.85 },
              ]}
              accessibilityRole="button"
              testID="assistant-ask-btn"
            >
              {askLoading ? (
                <ActivityIndicator color={colors.onBrandPrimary} size="small" />
              ) : (
                <>
                  <Ionicons
                    name="send"
                    size={16}
                    color={colors.onBrandPrimary}
                  />
                  <Text style={styles.aiAskBtnText}>Chiedi</Text>
                </>
              )}
            </Pressable>

            {answer && (
              <View style={styles.aiAnswerCard} testID="assistant-answer">
                <View style={styles.aiAnswerHeader}>
                  <Ionicons
                    name="sparkles"
                    size={14}
                    color={colors.brandPrimary}
                  />
                  <Text style={styles.aiAnswerLabel}>Risposta</Text>
                </View>
                <Text style={styles.aiAnswerText} selectable>
                  {answer}
                </Text>
              </View>
            )}
          </View>

          {/* Cassaforte referti */}
          <View style={styles.vaultCard} testID="vault-card">
            <View style={styles.vaultHeader}>
              <View style={styles.vaultIcon}>
                <Ionicons name="lock-closed" size={22} color={colors.brandPrimary} />
              </View>
              <View style={styles.vaultBadge}>
                <Text style={styles.vaultBadgeText}>
                  {vaultUnlocked ? "Attiva" : "€4,99 una tantum"}
                </Text>
              </View>
            </View>
            <Text style={styles.vaultTitle}>
              Conserva tutti i referti in un unico posto
            </Text>
            <Text style={styles.vaultBody}>
              Carica foto e PDF di analisi, TAC e verbali INPS. Ordinati in
              automatico per data, pronti da mostrare alla Commissione Medica.
            </Text>
            {vaultUnlocked ? (
              <View style={styles.vaultUnlocked} testID="vault-unlocked">
                <Pressable
                  onPress={() =>
                    setVaultFiles((prev) => [
                      ...prev,
                      `Referto_${prev.length + 1}.pdf`,
                    ])
                  }
                  style={({ pressed }) => [
                    styles.vaultUploadBtn,
                    pressed && { opacity: 0.85 },
                  ]}
                  accessibilityRole="button"
                  testID="vault-upload-btn"
                >
                  <Ionicons name="cloud-upload" size={16} color={colors.onBrandPrimary} />
                  <Text style={styles.vaultUploadText}>
                    Carica un referto
                  </Text>
                </Pressable>
                {vaultFiles.map((f, i) => (
                  <View
                    key={`${f}-${i}`}
                    style={styles.vaultFileRow}
                    testID={`vault-file-${i}`}
                  >
                    <Ionicons
                      name="document-text"
                      size={14}
                      color={colors.success}
                    />
                    <Text style={styles.vaultFileText} numberOfLines={1}>
                      {f}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Pressable
                onPress={() => setStripeOpen(true)}
                style={({ pressed }) => [
                  styles.vaultBtn,
                  pressed && { opacity: 0.85 },
                ]}
                accessibilityRole="button"
                testID="vault-cta"
              >
                <Text style={styles.vaultBtnText}>Sblocca con Stripe · €4,99</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.brandPrimary} />
              </Pressable>
            )}
          </View>

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
            <Ionicons name="chevron-forward" size={18} color={colors.borderStrong} />
          </Pressable>

          {/* Appeal collapsible */}
          <Pressable
            onPress={() => setAppealOpen((v) => !v)}
            style={styles.appealHeader}
            accessibilityRole="button"
            accessibilityState={{ expanded: appealOpen }}
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
              name={appealOpen ? "chevron-up" : "chevron-down"}
              size={20}
              color={colors.onSurfaceTertiary}
            />
          </Pressable>
          {appealOpen && (
            <View style={styles.appealBody} testID="appeal-body">
              <Text style={styles.appealIntro}>
                Non demordere: nel 40% dei casi il riesame o il ricorso porta a
                un riconoscimento più alto. Ecco come procedere.
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
                💡 Tutta la procedura è gratuita se ti rivolgi a un patronato
                (ACLI, INCA CGIL, ITAL UIL, INAS CISL).
              </Text>
            </View>
          )}

          <Text style={styles.disclaimer}>
            Questo report è orientativo, generato in base alle risposte fornite.
            Per la conferma nel tuo caso specifico rivolgiti a un patronato, a
            un CAF o al tuo ufficio HR/Personale.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Share modal */}
      <Modal
        visible={shareOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setShareOpen(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShareOpen(false)}
        >
          <Pressable
            style={styles.shareCard}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.shareTitle}>Condividi con la famiglia</Text>
            <Text style={styles.shareSub}>
              Un familiare o caregiver può leggere il report inquadrando questo
              codice, senza dover ripetere le domande.
            </Text>
            {qrUrl ? (
              <Image
                source={{ uri: qrUrl }}
                style={styles.qrImage}
                resizeMode="contain"
                testID="share-qr"
              />
            ) : (
              <View style={styles.qrPlaceholder}>
                <ActivityIndicator color={colors.brandPrimary} />
              </View>
            )}
            {shareUrl ? (
              <Text style={styles.shareUrl} selectable numberOfLines={2}>
                {shareUrl}
              </Text>
            ) : null}
            <View style={styles.shareActions}>
              <Pressable
                onPress={handleCopyLink}
                style={({ pressed }) => [
                  styles.secondaryBtn,
                  { flex: 1 },
                  pressed && { opacity: 0.85 },
                ]}
                testID="share-copy-btn"
              >
                <Ionicons name="copy-outline" size={16} color={colors.brandPrimary} />
                <Text style={styles.secondaryBtnText}>Copia link</Text>
              </Pressable>
              <Pressable
                onPress={handleShareLink}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  { flex: 1 },
                  pressed && { opacity: 0.85 },
                ]}
                testID="share-share-btn"
              >
                <Ionicons name="share-outline" size={16} color={colors.onBrandPrimary} />
                <Text style={styles.primaryBtnText}>Condividi</Text>
              </Pressable>
            </View>
            <Pressable
              onPress={() => setShareOpen(false)}
              style={styles.shareClose}
              testID="share-close-btn"
            >
              <Text style={styles.shareCloseText}>Chiudi</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
      {/* Stripe checkout modal (placeholder) */}
      <Modal
        visible={stripeOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setStripeOpen(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setStripeOpen(false)}
        >
          <Pressable
            style={styles.shareCard}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.stripeIconWrap}>
              <Ionicons name="card" size={32} color={colors.brandPrimary} />
            </View>
            <Text style={styles.shareTitle}>Checkout Stripe · €4,99</Text>
            <Text style={styles.shareSub}>
              Spazio cloud crittografato per i tuoi referti. Pagamento una
              tantum, nessun abbonamento.
            </Text>
            <View style={styles.shareActions}>
              <Pressable
                onPress={() => setStripeOpen(false)}
                style={({ pressed }) => [
                  styles.secondaryBtn,
                  { flex: 1 },
                  pressed && { opacity: 0.85 },
                ]}
                testID="stripe-cancel-btn"
              >
                <Text style={styles.secondaryBtnText}>Annulla</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setVaultUnlocked(true);
                  setStripeOpen(false);
                  toast("Cassaforte sbloccata");
                }}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  { flex: 1 },
                  pressed && { opacity: 0.85 },
                ]}
                testID="stripe-pay-btn"
              >
                <Text style={styles.primaryBtnText}>Paga ora</Text>
              </Pressable>
            </View>
            <Text style={styles.stripeFooter}>
              Simulazione dimostrativa · Stripe reale verrà integrato nella
              prossima release.
            </Text>
          </Pressable>
        </Pressable>
      </Modal>
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

  deadlineCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: "#FEF3C7",
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  deadlineTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#78350F",
    marginBottom: 2,
  },
  deadlineBody: { fontSize: 13, lineHeight: 19, color: "#78350F" },
  deadlineStrong: { fontWeight: "800" },

  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.onSurfaceTertiary,
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

  actionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  primaryBtn: {
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

  // AI
  aiCard: {
    backgroundColor: colors.brandSecondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  aiHeaderIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  aiTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.onBrandSecondary,
    marginBottom: 2,
  },
  aiSub: { fontSize: 13, color: colors.onSurfaceTertiary, lineHeight: 18 },
  aiInputWrap: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 72,
    marginBottom: spacing.md,
  },
  aiInput: {
    fontSize: 15,
    color: colors.onSurface,
    padding: 0,
    minHeight: 48,
    ...Platform.select({ web: { outlineStyle: "none" } as any, default: {} }),
  },
  aiSuggLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.onSurfaceTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  aiSuggs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  aiSuggChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    maxWidth: "100%",
    borderWidth: 1,
    borderColor: colors.border,
  },
  aiSuggText: {
    fontSize: 12,
    color: colors.brandPrimary,
    fontWeight: "600",
    lineHeight: 16,
  },
  aiAskBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.brandPrimary,
    minHeight: 48,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
  },
  aiAskBtnDisabled: { backgroundColor: colors.surfaceTertiary },
  aiAskBtnText: {
    color: colors.onBrandPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  aiAnswerCard: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.brandPrimary,
  },
  aiAnswerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: spacing.xs,
  },
  aiAnswerLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.brandPrimary,
    letterSpacing: 0.8,
  },
  aiAnswerText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.onSurfaceSecondary,
  },

  // Vault
  vaultCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  vaultHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  vaultIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.brandSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  vaultBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  vaultBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.warning,
  },
  vaultTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.onSurface,
    marginBottom: 4,
  },
  vaultBody: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.onSurfaceSecondary,
    marginBottom: spacing.md,
  },
  vaultBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    alignSelf: "flex-start",
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSecondary,
  },
  vaultBtnText: {
    color: colors.brandPrimary,
    fontSize: 13,
    fontWeight: "800",
  },
  vaultUnlocked: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  vaultUploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.brandPrimary,
    minHeight: 44,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
  },
  vaultUploadText: {
    color: colors.onBrandPrimary,
    fontSize: 13,
    fontWeight: "800",
  },
  vaultFileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  vaultFileText: {
    flex: 1,
    fontSize: 12,
    color: colors.onSurface,
    fontWeight: "600",
  },
  stripeIconWrap: {
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  stripeFooter: {
    fontSize: 10,
    fontStyle: "italic",
    color: colors.onSurfaceTertiary,
    marginTop: spacing.sm,
    textAlign: "center",
  },

  // Checklist link
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

  // Appeal
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
    color: colors.onWarning,
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

  disclaimer: {
    fontSize: 12,
    color: colors.onSurfaceTertiary,
    lineHeight: 17,
    marginTop: spacing.md,
    textAlign: "center",
    fontStyle: "italic",
  },

  // Share modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(11,42,72,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  shareCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: "center",
  },
  shareTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.onSurface,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  shareSub: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.onSurfaceTertiary,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  qrImage: {
    width: 220,
    height: 220,
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
  },
  qrPlaceholder: {
    width: 220,
    height: 220,
    marginBottom: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
  },
  shareUrl: {
    fontSize: 11,
    color: colors.onSurfaceTertiary,
    textAlign: "center",
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  shareActions: {
    flexDirection: "row",
    gap: spacing.sm,
    alignSelf: "stretch",
    marginBottom: spacing.md,
  },
  shareClose: {
    paddingVertical: spacing.sm,
  },
  shareCloseText: {
    color: colors.onSurfaceTertiary,
    fontSize: 14,
    fontWeight: "600",
  },
});
