import { useEffect, useState } from "react";
import {
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
import { storage } from "@/src/utils/storage";

const CHECKLIST_KEY = "salutenav:checklist";

const ITEMS = [
  "Certificato medico introduttivo con codice INPS",
  "Ricevuta di invio della domanda telematica",
  "Documento d'identità e Codice Fiscale",
  "Referti originali + fotocopie ordinate per data",
];

export default function Checklist() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [checked, setChecked] = useState<boolean[]>(ITEMS.map(() => false));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const raw = await storage.getItem<string>(CHECKLIST_KEY, "");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length === ITEMS.length) {
            setChecked(parsed.map(Boolean));
          }
        } catch {
          /* ignore */
        }
      }
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (ready) storage.setItem(CHECKLIST_KEY, JSON.stringify(checked));
  }, [checked, ready]);

  const toggle = (idx: number) =>
    setChecked((prev) => prev.map((v, i) => (i === idx ? !v : v)));

  const done = checked.filter(Boolean).length;
  const pct = Math.round((done / ITEMS.length) * 100);
  const allDone = done === ITEMS.length;

  return (
    <SafeAreaView style={styles.safe} testID="checklist-screen">
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.iconBtn}
          hitSlop={12}
          accessibilityLabel="Indietro"
          testID="checklist-back-btn"
        >
          <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Checklist per la visita</Text>
        <Pressable
          onPress={() => setChecked(ITEMS.map(() => false))}
          style={styles.iconBtn}
          hitSlop={12}
          accessibilityLabel="Ricomincia"
          testID="checklist-reset-btn"
        >
          <Ionicons name="refresh" size={20} color={colors.onSurfaceTertiary} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          Spunta ogni voce prima di uscire di casa il giorno della commissione
          ASL/INPS.
        </Text>

        {/* Progress */}
        <View style={styles.progressCard} testID="checklist-progress">
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Completato</Text>
            <Text
              style={[styles.progressPct, allDone && { color: colors.success }]}
              testID="checklist-progress-text"
            >
              {done}/{ITEMS.length} · {pct}%
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${pct}%`,
                  backgroundColor: allDone ? colors.success : colors.brandPrimary,
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.itemsList}>
          {ITEMS.map((label, idx) => {
            const isChecked = checked[idx];
            return (
              <Pressable
                key={label}
                onPress={() => toggle(idx)}
                style={({ pressed }) => [
                  styles.itemRow,
                  isChecked && styles.itemRowChecked,
                  pressed && { opacity: 0.85 },
                ]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isChecked }}
                testID={`checklist-item-${idx}`}
              >
                <View
                  style={[
                    styles.checkbox,
                    isChecked && styles.checkboxChecked,
                  ]}
                >
                  {isChecked && (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color={colors.onBrandPrimary}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.itemText,
                    isChecked && styles.itemTextChecked,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.tipCard} testID="checklist-tip">
          <View style={styles.tipIcon}>
            <Ionicons name="bulb" size={20} color={colors.warning} />
          </View>
          <Text style={styles.tipText}>
            Porta sempre con te le fotocopie: la commissione potrebbe trattenere
            i fogli originali!
          </Text>
        </View>
      </ScrollView>
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
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.onSurfaceTertiary,
    marginBottom: spacing.lg,
  },
  progressCard: {
    backgroundColor: colors.brandSecondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.onBrandSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  progressPct: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.brandPrimary,
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  progressFill: {
    height: 8,
    borderRadius: radius.pill,
  },
  itemsList: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    minHeight: 64,
  },
  itemRowChecked: {
    backgroundColor: colors.brandSecondary,
    borderColor: colors.brandPrimary,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  itemText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: colors.onSurfaceSecondary,
    fontWeight: "500",
  },
  itemTextChecked: {
    color: colors.onBrandSecondary,
    fontWeight: "700",
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: "#FEF3C7",
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "#78350F",
    fontWeight: "500",
  },
});
