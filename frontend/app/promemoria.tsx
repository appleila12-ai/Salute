import { useCallback, useEffect, useState } from "react";
import {
  Linking,
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
import { useI18n } from "@/src/lib/i18n";
import {
  addReminder,
  deleteReminder,
  ensureNotificationPermission,
  getReminders,
  Reminder,
  ReminderType,
} from "@/src/lib/reminders";

const REMINDER_TYPES: ReminderType[] = ["isee", "inps", "verbale", "custom"];

const TYPE_META: Record<
  ReminderType,
  { icon: keyof typeof import("@expo/vector-icons/build/Ionicons").glyphMap }
> = {
  isee: { icon: "document-text-outline" },
  inps: { icon: "medkit-outline" },
  verbale: { icon: "clipboard-outline" },
  custom: { icon: "calendar-outline" },
};

function daysUntil(iso: string): number {
  const target = new Date(iso).getTime();
  return Math.ceil((target - Date.now()) / (1000 * 60 * 60 * 24));
}

function toDatetimeLocalValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export default function Promemoria() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, lang } = useI18n();

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<ReminderType>("isee");
  const [dateISO, setDateISO] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(9, 0, 0, 0);
    return d.toISOString();
  });
  const [note, setNote] = useState("");
  const [permBlocked, setPermBlocked] = useState(false);

  const refresh = useCallback(async () => {
    setReminders(await getReminders());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleAdd = async () => {
    const perm = await ensureNotificationPermission();
    if (!perm.granted && Platform.OS !== "web") {
      setPermBlocked(!perm.canAskAgain);
      if (perm.canAskAgain) return;
    } else {
      setPermBlocked(false);
    }
    const title = t(`rem.type.${type}` as any);
    await addReminder(
      { type, date: dateISO, note: note.trim() || undefined },
      { title, body: note.trim() || t("rem.sub") },
    );
    setShowForm(false);
    setNote("");
    setType("isee");
    refresh();
  };

  const handleDelete = async (id: string) => {
    await deleteReminder(id);
    refresh();
  };

  const locale = lang === "en" ? "en-GB" : "it-IT";
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale, {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  return (
    <SafeAreaView style={styles.safe} testID="promemoria-screen">
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.iconBtn}
          hitSlop={12}
          accessibilityLabel={t("common.back")}
          testID="promemoria-back-button"
        >
          <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("rem.title")}</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>{t("rem.sub")}</Text>

        {Platform.OS === "web" ? (
          <View style={styles.webWarn} testID="promemoria-web-warn">
            <Ionicons
              name="information-circle-outline"
              size={18}
              color={colors.warning}
            />
            <Text style={styles.webWarnText}>{t("rem.notifWeb")}</Text>
          </View>
        ) : null}

        {permBlocked ? (
          <View style={styles.permCard} testID="promemoria-perm-blocked">
            <Text style={styles.permTitle}>{t("rem.permissionTitle")}</Text>
            <Text style={styles.permBody}>{t("rem.permissionBody")}</Text>
            <Pressable
              onPress={() => Linking.openSettings()}
              style={({ pressed }) => [
                styles.permBtn,
                pressed && { opacity: 0.85 },
              ]}
              accessibilityRole="button"
              testID="promemoria-open-settings"
            >
              <Text style={styles.permBtnText}>{t("rem.openSettings")}</Text>
            </Pressable>
          </View>
        ) : null}

        {reminders.length === 0 ? (
          <View style={styles.emptyCard} testID="promemoria-empty">
            <View style={styles.emptyIcon}>
              <Ionicons
                name="calendar-outline"
                size={28}
                color={colors.brandPrimary}
              />
            </View>
            <Text style={styles.emptyText}>{t("rem.empty")}</Text>
          </View>
        ) : (
          reminders.map((r, idx) => {
            const d = daysUntil(r.date);
            const overdue = d < 0;
            return (
              <View
                key={r.id}
                style={styles.reminderCard}
                testID={`reminder-card-${idx}`}
              >
                <View style={styles.reminderIcon}>
                  <Ionicons
                    name={TYPE_META[r.type].icon}
                    size={22}
                    color={colors.brandPrimary}
                  />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.reminderTitle}>
                    {t(`rem.type.${r.type}` as any)}
                  </Text>
                  <Text style={styles.reminderDate}>{fmtDate(r.date)}</Text>
                  {r.note ? (
                    <Text style={styles.reminderNote} numberOfLines={2}>
                      {r.note}
                    </Text>
                  ) : null}
                  <View
                    style={[
                      styles.reminderChip,
                      overdue
                        ? styles.chipOverdue
                        : d <= 7
                          ? styles.chipSoon
                          : styles.chipFar,
                    ]}
                  >
                    <Text style={styles.reminderChipText}>
                      {overdue
                        ? lang === "en"
                          ? `Overdue ${-d}d`
                          : `In ritardo ${-d}g`
                        : lang === "en"
                          ? `In ${d}d`
                          : `Tra ${d}g`}
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => handleDelete(r.id)}
                  hitSlop={12}
                  style={styles.reminderDelete}
                  accessibilityLabel={t("common.delete")}
                  testID={`reminder-delete-${idx}`}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                </Pressable>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* FAB */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: insets.bottom + spacing.md },
        ]}
      >
        <Pressable
          onPress={() => setShowForm(true)}
          style={({ pressed }) => [
            styles.primaryBtn,
            pressed && { opacity: 0.85 },
          ]}
          accessibilityRole="button"
          testID="promemoria-add-button"
        >
          <Ionicons name="add" size={20} color={colors.onBrandPrimary} />
          <Text style={styles.primaryBtnText}>{t("rem.add")}</Text>
        </Pressable>
      </View>

      {/* Add reminder modal */}
      <Modal
        visible={showForm}
        transparent
        animationType="slide"
        onRequestClose={() => setShowForm(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowForm(false)}
        >
          <Pressable
            style={[
              styles.modalSheet,
              { paddingBottom: insets.bottom + spacing.lg },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{t("rem.add")}</Text>

            {/* Type chips */}
            <Text style={styles.formLabel}>{t("rem.type")}</Text>
            <View style={styles.chipsRow}>
              {REMINDER_TYPES.map((rt) => {
                const isSel = type === rt;
                return (
                  <Pressable
                    key={rt}
                    onPress={() => setType(rt)}
                    style={({ pressed }) => [
                      styles.chip,
                      isSel && styles.chipSelected,
                      pressed && { opacity: 0.85 },
                    ]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSel }}
                    testID={`reminder-type-${rt}`}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSel && styles.chipTextSelected,
                      ]}
                    >
                      {t(`rem.type.${rt}` as any)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Date */}
            <Text style={styles.formLabel}>{t("rem.date")}</Text>
            {Platform.OS === "web" ? (
              // Web: native input[type=datetime-local] via createElement pattern is not standard on RN Web.
              // Use TextInput with the ISO date-time value; user can edit as YYYY-MM-DDTHH:MM.
              <View style={styles.inputWrap}>
                <TextInput
                  value={toDatetimeLocalValue(new Date(dateISO))}
                  onChangeText={(v) => {
                    const parsed = new Date(v);
                    if (!Number.isNaN(parsed.getTime())) {
                      setDateISO(parsed.toISOString());
                    }
                  }}
                  placeholder="YYYY-MM-DDTHH:MM"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  testID="reminder-date-input"
                />
              </View>
            ) : (
              <NativeDatePicker
                iso={dateISO}
                onChange={setDateISO}
              />
            )}

            {/* Note */}
            <Text style={styles.formLabel}>{t("rem.note")}</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder={t("rem.notePh")}
                placeholderTextColor={colors.muted}
                value={note}
                onChangeText={setNote}
                testID="reminder-note-input"
                multiline
              />
            </View>

            <Pressable
              onPress={handleAdd}
              style={({ pressed }) => [
                styles.primaryBtn,
                { marginTop: spacing.lg },
                pressed && { opacity: 0.85 },
              ]}
              accessibilityRole="button"
              testID="reminder-save-button"
            >
              <Ionicons
                name="notifications-outline"
                size={18}
                color={colors.onBrandPrimary}
              />
              <Text style={styles.primaryBtnText}>
                {t("rem.saveAndSchedule")}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// Lazy-load DateTimePicker only on native to avoid web import issues.
function NativeDatePicker({
  iso,
  onChange,
}: {
  iso: string;
  onChange: (iso: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const { lang } = useI18n();
  const locale = lang === "en" ? "en-GB" : "it-IT";

  // Dynamic import to keep bundle clean on web.
  const [Comp, setComp] = useState<any>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mod = await import("@react-native-community/datetimepicker");
        if (mounted) setComp(() => mod.default);
      } catch (e) {
        console.warn("datetimepicker import failed", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        style={({ pressed }) => [
          styles.dropdown,
          pressed && { opacity: 0.9 },
        ]}
        accessibilityRole="button"
        testID="reminder-date-picker"
      >
        <Text style={styles.dropdownText}>
          {new Date(iso).toLocaleString(locale)}
        </Text>
        <Ionicons name="calendar" size={20} color={colors.brandPrimary} />
      </Pressable>
      {visible && Comp ? (
        <Comp
          value={new Date(iso)}
          mode="datetime"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_: unknown, selected?: Date) => {
            setVisible(false);
            if (selected) onChange(selected.toISOString());
          }}
        />
      ) : null}
    </>
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
    marginBottom: spacing.lg,
  },

  webWarn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "#FEF3C7",
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  webWarnText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: "#78350F",
  },

  permCard: {
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
  },
  permTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.onSurface,
    marginBottom: 4,
  },
  permBody: {
    fontSize: 13,
    color: colors.onSurfaceSecondary,
    marginBottom: spacing.md,
  },
  permBtn: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.pill,
  },
  permBtnText: {
    color: colors.onBrandPrimary,
    fontWeight: "700",
    fontSize: 13,
  },

  emptyCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.brandSecondary,
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
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

  reminderCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  reminderIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.brandSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  reminderTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.onSurface,
  },
  reminderDate: {
    fontSize: 13,
    color: colors.onSurfaceTertiary,
    marginTop: 2,
  },
  reminderNote: {
    fontSize: 13,
    color: colors.onSurfaceSecondary,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  reminderChip: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    marginTop: spacing.sm,
  },
  chipFar: {
    backgroundColor: colors.brandSecondary,
  },
  chipSoon: {
    backgroundColor: "#FEF3C7",
  },
  chipOverdue: {
    backgroundColor: "#FEE2E2",
  },
  reminderChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.onSurface,
    letterSpacing: 0.4,
  },
  reminderDelete: {
    padding: 4,
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
  primaryBtnText: {
    color: colors.onBrandPrimary,
    fontSize: 16,
    fontWeight: "700",
  },

  // Modal / form
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
    fontSize: 18,
    fontWeight: "700",
    color: colors.onSurface,
    marginBottom: spacing.lg,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.onSurfaceTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    height: 40,
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
    fontSize: 13,
    fontWeight: "600",
    color: colors.onSurfaceSecondary,
  },
  chipTextSelected: {
    color: colors.onBrandSecondary,
  },
  inputWrap: {
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: "center",
  },
  input: {
    fontSize: 15,
    color: colors.onSurface,
    padding: 0,
    ...Platform.select({ web: { outlineStyle: "none" } as any, default: {} }),
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSecondary,
  },
  dropdownText: {
    fontSize: 15,
    color: colors.onSurface,
    fontWeight: "600",
  },
});
