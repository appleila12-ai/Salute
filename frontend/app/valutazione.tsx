import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
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

import { colors, radius, spacing, topics } from "@/src/theme";
import {
  Answers,
  CertOption,
  Report,
  saveReport,
  WhenOption,
  WhoOption,
  WorkOption,
} from "@/src/lib/reports";
import { PARTNER_NOTE } from "@/src/lib/content";

const WHO_OPTIONS: WhoOption[] = ["Io stesso", "Un genitore", "Un figlio", "Coniuge/Partner"];
const WHEN_OPTIONS: WhenOption[] = [
  "Meno di 30 giorni fa",
  "Da 1 a 6 mesi fa",
  "Oltre 6 mesi fa",
];
const WORK_OPTIONS: WorkOption[] = [
  "Dipendente Privato",
  "Dipendente Pubblico",
  "Autonomo",
  "Inoccupato/Pensionato",
];
const CERT_OPTIONS: CertOption[] = ["Sì", "No", "Non so cos'è"];

type StepId = 1 | 2 | 3;

export default function Wizard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<StepId>(1);
  const [who, setWho] = useState<WhoOption | null>(null);
  const [when, setWhen] = useState<WhenOption | null>(null);
  const [work, setWork] = useState<WorkOption | null>(null);
  const [cert, setCert] = useState<CertOption | null>(null);
  const [warnOpen, setWarnOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const canProceed = useMemo(() => {
    if (step === 1) return !!who && !!when;
    if (step === 2) return !!work;
    if (step === 3) return !!cert;
    return false;
  }, [step, who, when, work, cert]);

  const handleBack = () => {
    if (step === 1) router.back();
    else setStep((s) => (s - 1) as StepId);
  };

  const handleNext = () => {
    if (!canProceed) return;
    if (step < 3) {
      setStep((s) => (s + 1) as StepId);
    } else {
      // Final step: show warning modal before results
      setWarnOpen(true);
    }
  };

  const handleContinueToResults = async () => {
    if (!who || !when || !work || !cert || saving) return;
    setSaving(true);
    const answers: Answers = {
      who,
      when,
      work,
      cert,
    };
    const report: Report = await saveReport(answers);
    setWarnOpen(false);
    setSaving(false);
    router.replace(`/risultati/${report.id}` as any);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header with progress */}
        <View style={styles.header}>
          <Pressable
            onPress={handleBack}
            style={styles.iconBtn}
            hitSlop={12}
            accessibilityLabel="Indietro"
            testID="wizard-back-btn"
          >
            <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
          </Pressable>
          <Text style={styles.stepIndicator} testID="wizard-step-indicator">
            Passo {step} di 3
          </Text>
          <View style={styles.iconBtn} />
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + 130 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === 1 && (
            <View testID="step-1">
              <View style={styles.stepIconWrap}>
                <View style={[styles.stepIcon, { backgroundColor: topics.legge104.soft }]}>
                  <Ionicons
                    name="heart-outline"
                    size={26}
                    color={topics.legge104.main}
                  />
                </View>
                <Text style={[styles.stepBadge, { color: topics.legge104.main }]}>LA DIAGNOSI</Text>
              </View>
              <Text style={styles.question}>Chi ha ricevuto la diagnosi?</Text>
              <Text style={styles.helper}>
                Prenditi il tempo che ti serve. Nessuna risposta è sbagliata.
              </Text>
              <View style={styles.optionsList}>
                {WHO_OPTIONS.map((opt) => (
                  <OptionCard
                    key={opt}
                    label={opt}
                    selected={who === opt}
                    onPress={() => setWho(opt)}
                    testID={`opt-who-${opt}`}
                  />
                ))}
              </View>
              {who === "Coniuge/Partner" && (
                <View style={styles.partnerNote} testID="wizard-partner-note">
                  <Ionicons
                    name="information-circle"
                    size={16}
                    color={colors.brandPrimaryDark}
                  />
                  <Text style={styles.partnerNoteText}>{PARTNER_NOTE}</Text>
                </View>
              )}

              <Text style={[styles.question, { marginTop: spacing.xl }]}>
                Quando è avvenuta la diagnosi?
              </Text>
              <Text style={styles.helper}>
                Ci aiuta a stabilire tempi e priorità.
              </Text>
              <View style={styles.optionsList}>
                {WHEN_OPTIONS.map((opt) => (
                  <OptionCard
                    key={opt}
                    label={opt}
                    selected={when === opt}
                    onPress={() => setWhen(opt)}
                    testID={`opt-when-${opt}`}
                  />
                ))}
              </View>
            </View>
          )}

          {step === 2 && (
            <View testID="step-2">
              <View style={styles.stepIconWrap}>
                <View style={[styles.stepIcon, { backgroundColor: topics.lavoro.soft }]}>
                  <Ionicons
                    name="briefcase-outline"
                    size={26}
                    color={topics.lavoro.main}
                  />
                </View>
                <Text style={[styles.stepBadge, { color: topics.lavoro.main }]}>LAVORO</Text>
              </View>
              <Text style={styles.question}>
                Qual è la situazione lavorativa di chi assiste o del paziente?
              </Text>
              <Text style={styles.helper}>
                Il tipo di contratto determina quali permessi e sedi puoi
                richiedere.
              </Text>
              <View style={styles.optionsList}>
                {WORK_OPTIONS.map((opt) => (
                  <OptionCard
                    key={opt}
                    label={opt}
                    selected={work === opt}
                    onPress={() => setWork(opt)}
                    testID={`opt-work-${opt}`}
                  />
                ))}
              </View>
            </View>
          )}

          {step === 3 && (
            <View testID="step-3">
              <View style={styles.stepIconWrap}>
                <View style={[styles.stepIcon, { backgroundColor: topics.documenti.soft }]}>
                  <Ionicons
                    name="document-text-outline"
                    size={26}
                    color={topics.documenti.main}
                  />
                </View>
                <Text style={[styles.stepBadge, { color: topics.documenti.main }]}>DOCUMENTI</Text>
              </View>
              <Text style={styles.question}>
                {"Avete già il certificato medico introduttivo dell'INPS?"}
              </Text>
              <Text style={styles.helper}>
                {"È il primo documento necessario per attivare la pratica. Se non sai cos'è nessun problema, te lo spieghiamo dopo."}
              </Text>
              <View style={styles.optionsList}>
                {CERT_OPTIONS.map((opt) => (
                  <OptionCard
                    key={opt}
                    label={opt}
                    selected={cert === opt}
                    onPress={() => setCert(opt)}
                    testID={`opt-cert-${opt}`}
                  />
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Sticky CTA */}
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: insets.bottom + spacing.md },
          ]}
        >
          <Pressable
            onPress={handleNext}
            disabled={!canProceed}
            style={({ pressed }) => [
              styles.primaryBtn,
              !canProceed && styles.primaryBtnDisabled,
              canProceed && pressed && { opacity: 0.85 },
            ]}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canProceed }}
            testID="wizard-next-btn"
          >
            <Text
              style={[
                styles.primaryBtnText,
                !canProceed && styles.primaryBtnTextDisabled,
              ]}
            >
              {step === 3 ? "Vedi i tuoi diritti" : "Avanti"}
            </Text>
            {canProceed && (
              <Ionicons
                name="arrow-forward"
                size={18}
                color={colors.onBrandPrimary}
              />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* Warning modal */}
      <Modal
        visible={warnOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setWarnOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.warnCard}>
            <View style={styles.warnIconWrap}>
              <Ionicons name="warning" size={32} color={colors.warning} />
            </View>
            <Text style={styles.warnTitle}>Attenzione, salva-tempo</Text>
            <Text style={styles.warnBody}>
              {"Verifica che il medico abbia spuntato SIA l'Invalidità Civile SIA la Legge 104 sul certificato per non ripetere la procedura!"}
            </Text>
            <Pressable
              onPress={handleContinueToResults}
              disabled={saving}
              style={({ pressed }) => [
                styles.warnCta,
                saving && { opacity: 0.7 },
                !saving && pressed && { opacity: 0.85 },
              ]}
              accessibilityRole="button"
              testID="warn-continue-btn"
            >
              <Text style={styles.warnCtaText}>
                {saving ? "Elaborazione…" : "Ho capito, prosegui"}
              </Text>
              {!saving && (
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={colors.onBrandPrimary}
                />
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function OptionCard({
  label,
  selected,
  onPress,
  testID,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  testID: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.optionCard,
        selected && styles.optionCardSelected,
        pressed && { opacity: 0.9 },
      ]}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      testID={testID}
    >
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && (
          <Ionicons name="checkmark" size={14} color={colors.onBrandPrimary} />
        )}
      </View>
      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
        {label}
      </Text>
    </Pressable>
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
  stepIndicator: {
    fontSize: 14,
    fontWeight: "700",
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
    padding: spacing.xl,
    paddingTop: spacing.xl,
  },
  stepIconWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  stepIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.brandSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBadge: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.brandPrimary,
    letterSpacing: 1.2,
  },
  question: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "800",
    color: colors.onSurface,
    letterSpacing: -0.4,
    marginBottom: spacing.sm,
  },
  helper: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.onSurfaceTertiary,
    marginBottom: spacing.lg,
  },
  optionsList: {
    gap: spacing.md,
  },
  partnerNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.brandSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  partnerNoteText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: colors.brandPrimaryDark,
    fontWeight: "500",
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    minHeight: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  optionCardSelected: {
    borderColor: colors.brandPrimary,
    backgroundColor: colors.brandSecondary,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
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
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
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

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(11,42,72,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  warnCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: "center",
  },
  warnIconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  warnTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.onSurface,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  warnBody: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.onSurfaceSecondary,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  warnCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    alignSelf: "stretch",
    backgroundColor: colors.brandPrimary,
    minHeight: 52,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
  },
  warnCtaText: {
    color: colors.onBrandPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
});
