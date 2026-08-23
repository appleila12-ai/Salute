import { useCallback, useEffect, useMemo, useState } from "react";
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
import { useI18n } from "@/src/lib/i18n";
import { getReports, Report, resolveRightWithAnswers } from "@/src/lib/reports";

export default function Confronto() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, lang } = useI18n();
  const locale = lang === "en" ? "en-GB" : "it-IT";

  const [reports, setReports] = useState<Report[]>([]);
  const [firstId, setFirstId] = useState<string | null>(null);
  const [secondId, setSecondId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const list = await getReports();
    setReports(list);
    if (list.length >= 2) {
      setFirstId((prev) => prev ?? list[1].id);
      setSecondId((prev) => prev ?? list[0].id);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const first = reports.find((r) => r.id === firstId) ?? null;
  const second = reports.find((r) => r.id === secondId) ?? null;

  const diff = useMemo(() => {
    if (!first || !second) return { added: [], removed: [], shared: [] };
    const firstIds = new Set(first.rights.map((r) => r.id));
    const secondIds = new Set(second.rights.map((r) => r.id));
    const added = second.rights.filter((r) => !firstIds.has(r.id));
    const removed = first.rights.filter((r) => !secondIds.has(r.id));
    const shared = first.rights.filter((r) => secondIds.has(r.id));
    return { added, removed, shared };
  }, [first, second]);

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(locale, {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    });

  const renderPicker = (
    label: string,
    selectedId: string | null,
    onPick: (id: string) => void,
    testId: string,
  ) => (
    <View style={styles.pickerBlock}>
      <Text style={styles.pickerLabel}>{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {reports.map((r, idx) => {
          const isSel = selectedId === r.id;
          return (
            <Pressable
              key={r.id}
              onPress={() => onPick(r.id)}
              style={({ pressed }) => [
                styles.pickChip,
                isSel && styles.pickChipSelected,
                pressed && { opacity: 0.85 },
              ]}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSel }}
              testID={`${testId}-${idx}`}
            >
              <Text
                style={[
                  styles.pickChipText,
                  isSel && styles.pickChipTextSelected,
                ]}
              >
                {fmt(r.createdAt)} · {r.answers.assisted}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} testID="confronto-screen">
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.iconBtn}
          hitSlop={12}
          accessibilityLabel={t("common.back")}
          testID="confronto-back-button"
        >
          <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("cmp.title")}</Text>
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
        {reports.length < 2 ? (
          <View style={styles.emptyCard} testID="confronto-empty">
            <View style={styles.emptyIcon}>
              <Ionicons
                name="git-compare-outline"
                size={26}
                color={colors.brandPrimary}
              />
            </View>
            <Text style={styles.emptyText}>{t("cmp.needTwo")}</Text>
          </View>
        ) : (
          <>
            {renderPicker(
              t("cmp.pickFirst"),
              firstId,
              setFirstId,
              "confronto-first",
            )}
            {renderPicker(
              t("cmp.pickSecond"),
              secondId,
              setSecondId,
              "confronto-second",
            )}

            {first && second ? (
              <View style={styles.diffWrap}>
                {diff.added.length > 0 ? (
                  <DiffSection
                    label={t("cmp.added")}
                    icon="add-circle"
                    color={colors.success}
                    items={diff.added.map((r) => {
                      const res = resolveRightWithAnswers(r, second.answers, lang);
                      return res.title;
                    })}
                    testID="confronto-added"
                  />
                ) : null}
                {diff.removed.length > 0 ? (
                  <DiffSection
                    label={t("cmp.removed")}
                    icon="remove-circle"
                    color={colors.error}
                    items={diff.removed.map((r) => {
                      const res = resolveRightWithAnswers(r, first.answers, lang);
                      return res.title;
                    })}
                    testID="confronto-removed"
                  />
                ) : null}
                {diff.shared.length > 0 ? (
                  <DiffSection
                    label={t("cmp.shared")}
                    icon="checkmark-circle"
                    color={colors.brandPrimary}
                    items={diff.shared.map((r) => {
                      const res = resolveRightWithAnswers(r, second.answers, lang);
                      return res.title;
                    })}
                    testID="confronto-shared"
                  />
                ) : null}
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function DiffSection({
  label,
  icon,
  color,
  items,
  testID,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  items: string[];
  testID: string;
}) {
  return (
    <View
      style={[styles.diffCard, { borderLeftColor: color }]}
      testID={testID}
    >
      <View style={styles.diffHeader}>
        <Ionicons name={icon} size={20} color={color} />
        <Text style={[styles.diffLabel, { color }]}>
          {label} · {items.length}
        </Text>
      </View>
      {items.map((it, idx) => (
        <View key={`${it}-${idx}`} style={styles.diffItem}>
          <View
            style={[styles.diffDot, { backgroundColor: color }]}
          />
          <Text style={styles.diffItemText}>{it}</Text>
        </View>
      ))}
    </View>
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

  emptyCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.brandSecondary,
    padding: spacing.lg,
    borderRadius: radius.lg,
  },
  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.onBrandSecondary,
    fontWeight: "500",
  },

  pickerBlock: {
    marginBottom: spacing.lg,
  },
  pickerLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.onSurfaceTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  chipsRow: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  pickChip: {
    paddingHorizontal: spacing.lg,
    height: 44,
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  pickChipSelected: {
    backgroundColor: colors.brandSecondary,
    borderColor: colors.brandPrimary,
  },
  pickChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.onSurfaceSecondary,
  },
  pickChipTextSelected: {
    color: colors.onBrandSecondary,
  },

  diffWrap: {
    marginTop: spacing.md,
    gap: spacing.md,
  },
  diffCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    padding: spacing.lg,
  },
  diffHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  diffLabel: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  diffItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    paddingVertical: 6,
  },
  diffDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  diffItemText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: colors.onSurface,
    fontWeight: "500",
  },
});
