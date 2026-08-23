import { useMemo, useState } from "react";
import {
  Modal,
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

import { colors, radius, spacing } from "@/src/theme";

type AssistedOption =
  | "Me stesso"
  | "Genitore"
  | "Figlio"
  | "Coniuge/Partner";

type ContractOption =
  | "Dipendente Privato"
  | "Dipendente Pubblico"
  | "Autonomo";

type VerbaleOption = "Sì" | "No" | "In corso di richiesta";

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

export default function Valutazione() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [assisted, setAssisted] = useState<AssistedOption | null>(null);
  const [contract, setContract] = useState<ContractOption | null>(null);
  const [verbale, setVerbale] = useState<VerbaleOption | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = !!assisted && !!contract && !!verbale;

  const results = useMemo(() => {
    if (!assisted || !contract || !verbale) return [];
    const list: { title: string; body: string }[] = [];

    if (verbale === "Sì") {
      list.push({
        title: "3 giorni di permesso mensile retribuito",
        body:
          assisted === "Me stesso"
            ? "Puoi richiedere 3 giorni al mese di permesso retribuito per te stesso all'INPS."
            : `Puoi richiedere 3 giorni al mese di permesso retribuito per assistere ${assisted.toLowerCase()}.`,
      });
      list.push({
        title: "Agevolazioni fiscali",
        body:
          "Detrazione IRPEF del 19% sulle spese sanitarie, IVA agevolata al 4% su auto e ausili tecnici.",
      });
      if (assisted !== "Me stesso") {
        list.push({
          title: "Congedo straordinario retribuito",
          body:
            "Fino a 2 anni di congedo straordinario retribuito per assistenza a familiare disabile grave.",
        });
      }
    } else if (verbale === "In corso di richiesta") {
      list.push({
        title: "Attesa del verbale",
        body:
          "La commissione medica ASL ha 90 giorni per rispondere (15 giorni per patologie oncologiche). Nel frattempo puoi già raccogliere la documentazione sanitaria.",
      });
      list.push({
        title: "Presentazione al patronato",
        body:
          "Un patronato può assisterti gratuitamente nella pratica e in eventuali ricorsi.",
      });
    } else {
      list.push({
        title: "Come richiedere il verbale",
        body:
          "Chiedi al medico di base il certificato SS3 telematico e presenta domanda all'INPS. È il primo passo per accedere ai benefici della Legge 104.",
      });
    }

    if (contract === "Dipendente Pubblico") {
      list.push({
        title: "Priorità sede di lavoro (Pubblico)",
        body:
          "Come dipendente pubblico hai diritto alla scelta prioritaria della sede di lavoro più vicina alla persona assistita.",
      });
    } else if (contract === "Dipendente Privato") {
      list.push({
        title: "Tutela contro trasferimenti (Privato)",
        body:
          "Non puoi essere trasferito senza consenso ad altra sede se sei beneficiario di Legge 104 art. 33.",
      });
    } else {
      list.push({
        title: "Autonomi: agevolazioni fiscali",
        body:
          "Come lavoratore autonomo non hai diritto ai permessi retribuiti, ma puoi accedere a detrazioni fiscali e contributi regionali per l'acquisto di ausili.",
      });
    }

    return list;
  }, [assisted, contract, verbale]);

  if (submitted) {
    return (
      <SafeAreaView style={styles.safe} testID="valutazione-results">
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
        <View style={styles.header}>
          <Pressable
            onPress={() => setSubmitted(false)}
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
          <Text style={styles.resultsIntro}>
            In base alle tue risposte, ecco cosa puoi richiedere adesso:
          </Text>
          {results.map((r, idx) => (
            <View
              key={r.title}
              style={styles.resultCard}
              testID={`valutazione-result-${idx}`}
            >
              <View style={styles.resultIcon}>
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={colors.brandPrimary}
                />
              </View>
              <View style={styles.flex}>
                <Text style={styles.resultTitle}>{r.title}</Text>
                <Text style={styles.resultBody}>{r.body}</Text>
              </View>
            </View>
          ))}

          <View style={styles.disclaimer}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color={colors.onSurfaceTertiary}
            />
            <Text style={styles.disclaimerText}>
              Queste indicazioni sono orientative. Per la tua situazione
              specifica rivolgiti a un patronato o al tuo medico di base.
            </Text>
          </View>

          <Pressable
            onPress={() => router.replace("/")}
            style={({ pressed }) => [
              styles.primaryBtn,
              { marginTop: spacing.lg },
              pressed && { opacity: 0.85 },
            ]}
            testID="valutazione-home-button"
            accessibilityRole="button"
          >
            <Text style={styles.primaryBtnText}>Torna alla home</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} testID="valutazione-screen">
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* Header */}
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
          Rispondi a 3 brevi domande. Ti aiuteremo a capire quali diritti puoi
          esercitare.
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

        {/* Dropdown */}
        <View style={styles.field} testID="field-contract">
          <Text style={styles.label}>Tipo di contratto di lavoro</Text>
          <Pressable
            onPress={() => setDropdownOpen(true)}
            style={({ pressed }) => [
              styles.dropdown,
              contract && styles.dropdownFilled,
              pressed && { opacity: 0.9 },
            ]}
            accessibilityRole="button"
            accessibilityLabel={
              contract ?? "Seleziona il tipo di contratto"
            }
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

        {/* Radio */}
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
      </ScrollView>

      {/* Sticky bottom CTA */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: insets.bottom + spacing.md },
        ]}
      >
        <Pressable
          onPress={() => setSubmitted(true)}
          disabled={!canSubmit}
          style={({ pressed }) => [
            styles.primaryBtn,
            !canSubmit && styles.primaryBtnDisabled,
            canSubmit && pressed && { opacity: 0.85 },
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
            Elabora i miei diritti
          </Text>
          {canSubmit && (
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
        visible={dropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownOpen(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setDropdownOpen(false)}
        >
          <Pressable
            style={[styles.modalSheet, { paddingBottom: insets.bottom + spacing.lg }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Tipo di contratto</Text>
            {CONTRACT_OPTIONS.map((opt, idx) => {
              const isSel = contract === opt;
              return (
                <Pressable
                  key={opt}
                  onPress={() => {
                    setContract(opt);
                    setDropdownOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.modalItem,
                    idx !== CONTRACT_OPTIONS.length - 1 && styles.modalItemDivider,
                    pressed && { opacity: 0.7 },
                  ]}
                  testID={`option-contract-${opt}`}
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

  // Results
  resultsIntro: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.onSurfaceSecondary,
    marginBottom: spacing.lg,
  },
  resultCard: {
    flexDirection: "row",
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  resultIcon: {
    marginTop: 2,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.onSurface,
    marginBottom: 4,
  },
  resultBody: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.onSurfaceSecondary,
  },
  disclaimer: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginTop: spacing.md,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: colors.onSurfaceTertiary,
  },
});
