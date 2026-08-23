import { useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { colors, radius, spacing } from "@/src/theme";
import { ReportResults } from "@/src/components/ReportResults";
import {
  Answers,
  AssistedOption,
  ContractOption,
  ITALIAN_REGIONS,
  Region,
  Report,
  saveReport,
  VerbaleOption,
} from "@/src/lib/reports";

const ASSISTED_OPTIONS: AssistedOption[] = [
  "Me stesso",
  "Genitore",
  "Figlio",
  "Coniuge/Partner",
];

const CONTRACT_OPTIONS: ContractOption[] = [
  "Dipendente Privato",
  "Dipendente Pubblico",
  "Autonomo",
];

const VERBALE_OPTIONS: VerbaleOption[] = [
  "Sì",
  "No",
  "In corso di richiesta",
];

type ModalKind = "contract" | "region" | null;

export default function Valutazione() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [assisted, setAssisted] = useState<AssistedOption | null>(null);
  const [contract, setContract] = useState<ContractOption | null>(null);
  const [verbale, setVerbale] = useState<VerbaleOption | null>(null);
  const [age, setAge] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [region, setRegion] = useState<Region | null>(null);
  const [modal, setModal] = useState<ModalKind>(null);
  const [savedReport, setSavedReport] = useState<Report | null>(null);
  const [saving, setSaving] = useState(false);

  const canSubmit = !!assisted && !!contract && !!verbale;

  const modalOptions = useMemo(() => {
    if (modal === "contract") return CONTRACT_OPTIONS as readonly string[];
    if (modal === "region") return ITALIAN_REGIONS;
    return [] as readonly string[];
  }, [modal]);

  const handleSubmit = async () => {
    if (!canSubmit || saving) return;
    setSaving(true);
    const answers: Answers = {
      assisted: assisted!,
      contract: contract!,
      verbale: verbale!,
      age: age.trim() || undefined,
      diagnosis: diagnosis.trim() || undefined,
      region: region ?? undefined,
    };
    const report = await saveReport(answers);
    setSavedReport(report);
    setSaving(false);
  };

  // -------- Results screen --------
  if (savedReport) {
    return (
      <SafeAreaView style={styles.safe} testID="valutazione-results">
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
        <View style={styles.header}>
          <Pressable
            onPress={() => setSavedReport(null)}
            style={styles.iconBtn}
            hitSlop={12}
            accessibilityLabel="Modifica risposte"
            testID="valutazione-edit-button"
          >
            <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
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
          <ReportResults report={savedReport} showBackHint />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // -------- Form screen --------
  return (
    <SafeAreaView style={styles.safe} testID="valutazione-screen">
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.iconBtn}
          hitSlop={12}
          accessibilityLabel="Indietro"
          testID="valutazione-back-button"
        >
          <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle} testID="valutazione-title">
          Valutazione Tutele e Permessi
        </Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.subtitle}>
          Rispondi alle prime 3 domande. Le informazioni extra sono opzionali
          ma rendono i risultati più precisi.
        </Text>

        {/* Choice Chips */}
        <View style={styles.field} testID="field-assisted">
          <Text style={styles.label}>Chi assisti?</Text>
          <View style={styles.chipsRow}>
            {ASSISTED_OPTIONS.map((opt) => {
              const isSel = assisted === opt;
              return (
                <Pressable
                  key={opt}
                  onPress={() => setAssisted(opt)}
                  style={({ pressed }) => [
                    styles.chip,
                    isSel && styles.chipSelected,
                    pressed && { opacity: 0.85 },
                  ]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSel }}
                  testID={`chip-assisted-${opt}`}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSel && styles.chipTextSelected,
                    ]}
                  >
                    {opt}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Dropdown Contract */}
        <View style={styles.field} testID="field-contract">
          <Text style={styles.label}>Tipo di contratto di lavoro</Text>
          <Pressable
            onPress={() => setModal("contract")}
            style={({ pressed }) => [
              styles.dropdown,
              contract && styles.dropdownFilled,
              pressed && { opacity: 0.9 },
            ]}
            accessibilityRole="button"
            accessibilityLabel={contract ?? "Seleziona il tipo di contratto"}
            testID="dropdown-contract"
          >
            <Text
              style={[
                styles.dropdownText,
                !contract && styles.dropdownPlaceholder,
              ]}
            >
              {contract ?? "Seleziona un'opzione"}
            </Text>
            <Ionicons
              name="chevron-down"
              size={20}
              color={colors.onSurfaceTertiary}
            />
          </Pressable>
        </View>

        {/* Radio Verbale */}
        <View style={styles.field} testID="field-verbale">
          <Text style={styles.label}>Hai già un verbale di invalidità?</Text>
          <View style={styles.radioList}>
            {VERBALE_OPTIONS.map((opt) => {
              const isSel = verbale === opt;
              return (
                <Pressable
                  key={opt}
                  onPress={() => setVerbale(opt)}
                  style={({ pressed }) => [
                    styles.radioRow,
                    isSel && styles.radioRowSelected,
                    pressed && { opacity: 0.9 },
                  ]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSel }}
                  testID={`radio-verbale-${opt}`}
                >
                  <View
                    style={[
                      styles.radioOuter,
                      isSel && styles.radioOuterSelected,
                    ]}
                  >
                    {isSel && <View style={styles.radioInner} />}
                  </View>
                  <Text
                    style={[
                      styles.radioText,
                      isSel && styles.radioTextSelected,
                    ]}
                  >
                    {opt}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Optional extras */}
        <View style={styles.extrasHeader}>
          <View style={styles.extrasBadge}>
            <Ionicons name="sparkles" size={12} color={colors.brandPrimary} />
            <Text style={styles.extrasBadgeText}>Opzionale</Text>
          </View>
          <Text style={styles.extrasSubtitle}>
            Aggiungi qualche dettaglio in più per risultati personalizzati
            (bonus regionali, indennità per età, patologie specifiche).
          </Text>
        </View>

        <View style={styles.field} testID="field-age">
          <Text style={styles.label}>Età della persona assistita</Text>
          <View
            style={[
              styles.inputWrap,
              age.length > 0 && styles.inputWrapFilled,
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder="Es. 45"
              placeholderTextColor={colors.muted}
              keyboardType="number-pad"
              maxLength={3}
              value={age}
              onChangeText={setAge}
              testID="input-age"
              accessibilityLabel="Età in anni"
            />
          </View>
        </View>

        <View style={styles.field} testID="field-diagnosis">
          <Text style={styles.label}>Patologia o diagnosi</Text>
          <View
            style={[
              styles.inputWrap,
              diagnosis.length > 0 && styles.inputWrapFilled,
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder="Es. malattia rara, oncologica, ecc."
              placeholderTextColor={colors.muted}
              value={diagnosis}
              onChangeText={setDiagnosis}
              testID="input-diagnosis"
              accessibilityLabel="Patologia o diagnosi"
              returnKeyType="done"
            />
          </View>
        </View>

        <View style={styles.field} testID="field-region">
          <Text style={styles.label}>Regione di residenza</Text>
          <Pressable
            onPress={() => setModal("region")}
            style={({ pressed }) => [
              styles.dropdown,
              region && styles.dropdownFilled,
              pressed && { opacity: 0.9 },
            ]}
            accessibilityRole="button"
            accessibilityLabel={region ?? "Seleziona la tua regione"}
            testID="dropdown-region"
          >
            <Text
              style={[
                styles.dropdownText,
                !region && styles.dropdownPlaceholder,
              ]}
            >
              {region ?? "Seleziona la tua regione"}
            </Text>
            <Ionicons
              name="chevron-down"
              size={20}
              color={colors.onSurfaceTertiary}
            />
          </Pressable>
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
          onPress={handleSubmit}
          disabled={!canSubmit || saving}
          style={({ pressed }) => [
            styles.primaryBtn,
            (!canSubmit || saving) && styles.primaryBtnDisabled,
            canSubmit && !saving && pressed && { opacity: 0.85 },
          ]}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSubmit }}
          testID="valutazione-submit"
        >
          <Text
            style={[
              styles.primaryBtnText,
              !canSubmit && styles.primaryBtnTextDisabled,
            ]}
          >
            {saving ? "Elaborazione…" : "Elabora i miei diritti"}
          </Text>
          {canSubmit && !saving && (
            <Ionicons
              name="arrow-forward"
              size={18}
              color={colors.onBrandPrimary}
            />
          )}
        </Pressable>
      </View>

      {/* Dropdown Modal */}
      <Modal
        visible={modal !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setModal(null)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setModal(null)}
        >
          <Pressable
            style={[
              styles.modalSheet,
              { paddingBottom: insets.bottom + spacing.lg },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>
              {modal === "contract" ? "Tipo di contratto" : "Regione"}
            </Text>
            <ScrollView
              style={{ maxHeight: 380 }}
              showsVerticalScrollIndicator={false}
            >
              {modalOptions.map((opt, idx) => {
                const isSel =
                  modal === "contract"
                    ? contract === opt
                    : region === (opt as Region);
                return (
                  <Pressable
                    key={opt}
                    onPress={() => {
                      if (modal === "contract") {
                        setContract(opt as ContractOption);
                      } else if (modal === "region") {
                        setRegion(opt as Region);
                      }
                      setModal(null);
                    }}
                    style={({ pressed }) => [
                      styles.modalItem,
                      idx !== modalOptions.length - 1 && styles.modalItemDivider,
                      pressed && { opacity: 0.7 },
                    ]}
                    testID={
                      modal === "contract"
                        ? `option-contract-${opt}`
                        : `option-region-${opt}`
                    }
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        isSel && styles.modalItemTextSelected,
                      ]}
                    >
                      {opt}
                    </Text>
                    {isSel && (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={colors.brandPrimary}
                      />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
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

  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.onSurfaceTertiary,
    marginBottom: spacing.xl,
  },

  field: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.onSurface,
    marginBottom: spacing.md,
  },

  // Chips
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    height: 44,
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  chipSelected: {
    backgroundColor: colors.brandSecondary,
    borderColor: colors.brandPrimary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.onSurfaceSecondary,
  },
  chipTextSelected: {
    color: colors.onBrandSecondary,
  },

  // Dropdown
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  dropdownFilled: {
    borderColor: colors.brandPrimary,
    backgroundColor: colors.surface,
  },
  dropdownText: {
    fontSize: 16,
    color: colors.onSurface,
    fontWeight: "600",
  },
  dropdownPlaceholder: {
    color: colors.muted,
    fontWeight: "500",
  },

  // Radio
  radioList: {
    gap: spacing.sm,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  radioRowSelected: {
    borderColor: colors.brandPrimary,
    backgroundColor: colors.brandSecondary,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: colors.brandPrimary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.brandPrimary,
  },
  radioText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: colors.onSurfaceSecondary,
  },
  radioTextSelected: {
    color: colors.onBrandSecondary,
    fontWeight: "700",
  },

  // Input
  inputWrap: {
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1.5,
    borderColor: "transparent",
    justifyContent: "center",
  },
  inputWrapFilled: {
    borderColor: colors.brandPrimary,
    backgroundColor: colors.surface,
  },
  input: {
    fontSize: 16,
    color: colors.onSurface,
    padding: 0,
    ...Platform.select({ web: { outlineStyle: "none" } as any, default: {} }),
  },

  // Optional extras header
  extrasHeader: {
    marginBottom: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  extrasBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    alignSelf: "flex-start",
    backgroundColor: colors.brandSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  extrasBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.brandPrimary,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  extrasSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.onSurfaceTertiary,
  },

  // Bottom bar
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
    backgroundColor: "rgba(11,42,72,0.35)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceTertiary,
    alignSelf: "center",
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.lg,
  },
  modalItemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  modalItemText: {
    fontSize: 16,
    color: colors.onSurfaceSecondary,
    fontWeight: "500",
  },
  modalItemTextSelected: {
    color: colors.brandPrimary,
    fontWeight: "700",
  },
});
