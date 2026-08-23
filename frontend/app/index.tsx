import { useCallback, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";

import { colors, radius, spacing } from "@/src/theme";
import { FEATURES, SEARCH_SUGGESTIONS } from "@/src/data/mockData";
import { getReports, Report } from "@/src/lib/reports";
import { getReminders, Reminder } from "@/src/lib/reminders";
import { useI18n, type DictKey } from "@/src/lib/i18n";

const GUIDE_ITEMS: { titleKey: DictKey; bodyKey: DictKey; icon: keyof typeof Ionicons.glyphMap }[] = [
  { titleKey: "guide.err1.title", bodyKey: "guide.err1.body", icon: "documents-outline" },
  { titleKey: "guide.err2.title", bodyKey: "guide.err2.body", icon: "hourglass-outline" },
  { titleKey: "guide.err3.title", bodyKey: "guide.err3.body", icon: "flash-outline" },
  { titleKey: "guide.err4.title", bodyKey: "guide.err4.body", icon: "folder-open-outline" },
  { titleKey: "guide.err5.title", bodyKey: "guide.err5.body", icon: "people-outline" },
];

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, lang, setLang } = useI18n();

  const [query, setQuery] = useState("");
  const [reports, setReports] = useState<Report[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [warnOpen, setWarnOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        const [r1, r2] = await Promise.all([getReports(), getReminders()]);
        if (mounted) {
          setReports(r1);
          setReminders(r2);
        }
      })();
      return () => {
        mounted = false;
      };
    }, []),
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return SEARCH_SUGGESTIONS.filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q),
    ).slice(0, 6);
  }, [query]);

  const openWarnBeforeWizard = () => setWarnOpen(true);
  const proceedToWizard = () => {
    setWarnOpen(false);
    router.push("/valutazione");
  };

  const upcomingReminder = reminders[0];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + spacing.xxl },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          testID="home-scroll"
        >
          {/* Top bar with lang toggle */}
          <View style={styles.topBar} testID="home-topbar">
            <View style={styles.brandBadge}>
              <Ionicons name="medkit" size={14} color={colors.brandPrimary} />
              <Text style={styles.brandBadgeText}>SaluteNav</Text>
            </View>
            <Pressable
              onPress={() => setLangOpen(true)}
              style={({ pressed }) => [
                styles.langBtn,
                pressed && { opacity: 0.8 },
              ]}
              accessibilityRole="button"
              accessibilityLabel={t("common.language")}
              testID="home-lang-toggle"
            >
              <Ionicons name="language" size={16} color={colors.brandPrimary} />
              <Text style={styles.langBtnText}>{lang.toUpperCase()}</Text>
            </Pressable>
          </View>

          {/* Header */}
          <View style={styles.header} testID="home-header">
            <Text style={styles.hello}>{t("home.hello")}</Text>
            <Text
              style={styles.greeting}
              accessibilityRole="header"
              testID="home-greeting"
            >
              {t("home.navTitle")}
            </Text>
            <Text style={styles.subGreeting}>{t("home.navSub")}</Text>
          </View>

          {/* Search */}
          <View style={styles.searchWrap}>
            <View style={styles.searchBar} testID="home-search-container">
              <Ionicons name="search" size={20} color={colors.onSurfaceTertiary} />
              <TextInput
                style={styles.searchInput}
                placeholder={t("home.searchPh")}
                placeholderTextColor={colors.muted}
                value={query}
                onChangeText={setQuery}
                returnKeyType="search"
                accessibilityLabel={t("home.searchPh")}
                testID="home-search-input"
              />
              {query.length > 0 && (
                <Pressable
                  onPress={() => setQuery("")}
                  hitSlop={8}
                  testID="home-search-clear"
                  accessibilityLabel={t("home.searchClear")}
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={colors.onSurfaceTertiary}
                  />
                </Pressable>
              )}
            </View>

            {query.length > 0 && (
              <View style={styles.resultsCard} testID="home-search-results">
                {results.length === 0 ? (
                  <Text style={styles.noResults}>{t("home.noResults")}</Text>
                ) : (
                  results.map((r, idx) => (
                    <Pressable
                      key={r.label}
                      onPress={() => {
                        router.push(`/feature/${r.route}` as any);
                        setQuery("");
                      }}
                      style={({ pressed }) => [
                        styles.resultRow,
                        idx !== results.length - 1 && styles.resultDivider,
                        pressed && { opacity: 0.7 },
                      ]}
                      testID={`home-search-result-${idx}`}
                      accessibilityRole="button"
                    >
                      <View style={styles.resultIcon}>
                        <Ionicons name="search" size={16} color={colors.brandPrimary} />
                      </View>
                      <View style={styles.flex}>
                        <Text style={styles.resultLabel} numberOfLines={1}>
                          {r.label}
                        </Text>
                        <Text style={styles.resultCategory}>{r.category}</Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={colors.borderStrong}
                      />
                    </Pressable>
                  ))
                )}
              </View>
            )}
          </View>

          {/* Primary CTA — Inizia la Valutazione Diritti */}
          <Pressable
            onPress={openWarnBeforeWizard}
            style={({ pressed }) => [
              styles.primaryCta,
              pressed && { opacity: 0.9 },
            ]}
            accessibilityRole="button"
            accessibilityLabel={t("home.startCta")}
            testID="home-start-cta"
          >
            <LinearGradient
              colors={[colors.brandPrimary, "#1A4971"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.primaryCtaContent}>
              <View style={styles.primaryCtaIconWrap}>
                <Ionicons
                  name="shield-checkmark"
                  size={32}
                  color={colors.onBrandPrimary}
                />
              </View>
              <View style={styles.flex}>
                <Text style={styles.primaryCtaTitle}>{t("home.startCta")}</Text>
                <Text style={styles.primaryCtaSub}>{t("home.startCtaSub")}</Text>
              </View>
              <Ionicons
                name="arrow-forward"
                size={22}
                color={colors.onBrandPrimary}
              />
            </View>
          </Pressable>

          {/* Checklist secondary */}
          <Pressable
            onPress={() => router.push("/checklist")}
            style={({ pressed }) => [
              styles.secondaryCta,
              pressed && { opacity: 0.9 },
            ]}
            accessibilityRole="button"
            testID="home-checklist-cta"
          >
            <View style={styles.secondaryCtaIcon}>
              <Ionicons
                name="clipboard-outline"
                size={22}
                color={colors.brandPrimary}
              />
            </View>
            <View style={styles.flex}>
              <Text style={styles.secondaryCtaTitle}>
                {t("home.checklistCta")}
              </Text>
              <Text style={styles.secondaryCtaSub}>
                {t("home.checklistSub")}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.borderStrong}
            />
          </Pressable>

          {/* Guide accordion */}
          <View style={styles.section} testID="home-guide">
            <View style={styles.guideHeader}>
              <View style={styles.guideBadge}>
                <Ionicons name="warning" size={12} color={colors.warning} />
                <Text style={styles.guideBadgeText}>
                  {lang === "en" ? "SAVE TIME" : "SALVA TEMPO"}
                </Text>
              </View>
              <Text style={styles.guideTitle}>{t("guide.title")}</Text>
            </View>
            {GUIDE_ITEMS.map((it, idx) => {
              const open = expanded === idx;
              return (
                <Pressable
                  key={it.titleKey}
                  onPress={() => setExpanded(open ? null : idx)}
                  style={({ pressed }) => [
                    styles.accordion,
                    open && styles.accordionOpen,
                    pressed && { opacity: 0.95 },
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: open }}
                  testID={`guide-item-${idx}`}
                >
                  <View style={styles.accordionHeader}>
                    <View style={styles.accordionIcon}>
                      <Ionicons
                        name={it.icon}
                        size={18}
                        color={colors.warning}
                      />
                    </View>
                    <View style={styles.flex}>
                      <View style={styles.accordionTopRow}>
                        <Text style={styles.accordionNumber}>
                          {String(idx + 1).padStart(2, "0")}
                        </Text>
                        <Ionicons
                          name={open ? "chevron-up" : "chevron-down"}
                          size={18}
                          color={colors.onSurfaceTertiary}
                        />
                      </View>
                      <Text style={styles.accordionTitle}>{t(it.titleKey)}</Text>
                    </View>
                  </View>
                  {open && (
                    <Text
                      style={styles.accordionBody}
                      testID={`guide-item-body-${idx}`}
                    >
                      {t(it.bodyKey)}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* Saved reports + Compare */}
          {reports.length > 0 && (
            <View style={styles.section} testID="home-saved-section">
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>{t("home.savedTitle")}</Text>
                {reports.length >= 2 && (
                  <Pressable
                    onPress={() => router.push("/confronto")}
                    style={({ pressed }) => [
                      styles.linkBtn,
                      pressed && { opacity: 0.7 },
                    ]}
                    testID="home-compare-link"
                  >
                    <Ionicons
                      name="git-compare"
                      size={14}
                      color={colors.brandPrimary}
                    />
                    <Text style={styles.linkBtnText}>{t("home.compareCta")}</Text>
                  </Pressable>
                )}
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.savedRow}
              >
                {reports.map((r, idx) => {
                  const date = new Date(r.createdAt).toLocaleDateString(
                    lang === "en" ? "en-GB" : "it-IT",
                    { day: "2-digit", month: "short" },
                  );
                  return (
                    <Pressable
                      key={r.id}
                      onPress={() =>
                        router.push(`/storico/${r.id}` as any)
                      }
                      style={({ pressed }) => [
                        styles.savedCard,
                        pressed && { opacity: 0.85 },
                      ]}
                      testID={`saved-report-${idx}`}
                      accessibilityRole="button"
                    >
                      <View style={styles.savedIcon}>
                        <Ionicons
                          name="document-text"
                          size={20}
                          color={colors.brandPrimary}
                        />
                      </View>
                      <Text style={styles.savedDate}>{date}</Text>
                      <Text style={styles.savedTitle} numberOfLines={1}>
                        {r.answers.assisted}
                      </Text>
                      <Text style={styles.savedMeta}>
                        {r.rights.length} {lang === "en" ? "rights" : "diritti"}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Reminders link */}
          <Pressable
            onPress={() => router.push("/promemoria")}
            style={({ pressed }) => [
              styles.remindersCard,
              pressed && { opacity: 0.9 },
            ]}
            accessibilityRole="button"
            testID="home-reminders-cta"
          >
            <View style={styles.remindersIcon}>
              <Ionicons name="notifications" size={22} color={colors.brandPrimary} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.remindersTitle}>{t("home.remindersTitle")}</Text>
              <Text style={styles.remindersSub} numberOfLines={2}>
                {upcomingReminder
                  ? new Date(upcomingReminder.date).toLocaleDateString(
                      lang === "en" ? "en-GB" : "it-IT",
                      { day: "2-digit", month: "long", year: "numeric" },
                    )
                  : t("home.remindersSub")}
              </Text>
            </View>
            {reminders.length > 0 ? (
              <View style={styles.remindersBadge}>
                <Text style={styles.remindersBadgeText}>{reminders.length}</Text>
              </View>
            ) : (
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.borderStrong}
              />
            )}
          </Pressable>

          {/* Feature cards */}
          <Text style={styles.sectionTitle} testID="home-section-title">
            {t("home.helpTitle")}
          </Text>
          <View style={styles.featureList}>
            {FEATURES.map((f) => (
              <Pressable
                key={f.id}
                onPress={() => router.push(`/feature/${f.id}` as any)}
                style={({ pressed }) => [
                  styles.featureCard,
                  pressed && { opacity: 0.9 },
                ]}
                accessibilityRole="button"
                testID={`feature-card-${f.id}`}
              >
                <View style={styles.featureIconBox}>
                  {f.iconLib === "ion" ? (
                    <Ionicons
                      name={f.iconName as any}
                      size={28}
                      color={colors.brandPrimary}
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name={f.iconName as any}
                      size={28}
                      color={colors.brandPrimary}
                    />
                  )}
                </View>
                <View style={styles.flex}>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureSubtitle}>{f.subtitle}</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color={colors.borderStrong}
                />
              </Pressable>
            ))}
          </View>

          {/* Banner Percorso */}
          <Pressable
            onPress={() => router.push("/percorso")}
            style={({ pressed }) => [
              styles.banner,
              pressed && { opacity: 0.9 },
            ]}
            accessibilityRole="button"
            testID="home-banner-cta"
          >
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1687197180710-b2b9484a3c5f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjV8MHwxfHNlYXJjaHwyfHxhYnN0cmFjdCUyMHNvZnQlMjBibHVlJTIwd2F2ZSUyMGJhY2tncm91bmQlMjBjYWxtaW5nfGVufDB8fHx8MTc4NzQ5MTgxNnww&ixlib=rb-4.1.0&q=85",
              }}
              style={styles.bannerImage}
              contentFit="cover"
              transition={300}
            />
            <LinearGradient
              colors={["rgba(11,42,72,0.35)", "rgba(11,42,72,0.92)"]}
              locations={[0, 1]}
              style={styles.bannerScrim}
            />
            <View style={styles.bannerContent}>
              <View style={styles.bannerBadge}>
                <Ionicons name="sparkles" size={14} color={colors.onBrandPrimary} />
                <Text style={styles.bannerBadgeText}>{t("home.bannerBadge")}</Text>
              </View>
              <Text style={styles.bannerTitle}>{t("home.bannerTitle")}</Text>
              <Text style={styles.bannerBody}>{t("home.bannerBody")}</Text>
              <View style={styles.bannerCtaBtn} testID="home-banner-cta-button">
                <Text style={styles.bannerCtaText}>{t("home.bannerCta")}</Text>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={colors.brandPrimary}
                />
              </View>
            </View>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Warning modal */}
      <Modal
        visible={warnOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setWarnOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setWarnOpen(false)}>
          <Pressable style={styles.warnCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.warnIconWrap}>
              <Ionicons name="warning" size={32} color={colors.warning} />
            </View>
            <Text style={styles.warnTitle} testID="warn-title">
              {t("warn.title")}
            </Text>
            <Text style={styles.warnBody}>{t("warn.body")}</Text>
            <Pressable
              onPress={proceedToWizard}
              style={({ pressed }) => [
                styles.warnCta,
                pressed && { opacity: 0.85 },
              ]}
              accessibilityRole="button"
              testID="warn-cta"
            >
              <Text style={styles.warnCtaText}>{t("warn.cta")}</Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color={colors.onBrandPrimary}
              />
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Lang modal */}
      <Modal
        visible={langOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setLangOpen(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setLangOpen(false)}
        >
          <Pressable
            style={[
              styles.langSheet,
              { paddingBottom: insets.bottom + spacing.lg },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHandle} />
            <Text style={styles.langSheetTitle}>{t("common.language")}</Text>
            {(["it", "en"] as const).map((l) => {
              const isSel = lang === l;
              return (
                <Pressable
                  key={l}
                  onPress={() => {
                    setLang(l);
                    setLangOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.langOption,
                    pressed && { opacity: 0.7 },
                  ]}
                  testID={`lang-option-${l}`}
                >
                  <Text
                    style={[
                      styles.langOptionText,
                      isSel && styles.langOptionSelected,
                    ]}
                  >
                    {l === "it" ? t("common.italian") : t("common.english")}
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
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  brandBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.brandSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  brandBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.brandPrimary,
    letterSpacing: 0.6,
  },
  langBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  langBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.brandPrimary,
    letterSpacing: 0.6,
  },

  header: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  hello: {
    fontSize: 14,
    color: colors.onSurfaceTertiary,
    marginBottom: spacing.xs,
    fontWeight: "500",
  },
  greeting: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "800",
    color: colors.onSurface,
    letterSpacing: -0.5,
  },
  subGreeting: {
    fontSize: 15,
    color: colors.onSurfaceTertiary,
    marginTop: spacing.sm,
    lineHeight: 22,
  },

  searchWrap: {
    marginBottom: spacing.lg,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 56,
    gap: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.onSurface,
    padding: 0,
    ...Platform.select({ web: { outlineStyle: "none" } as any, default: {} }),
  },
  resultsCard: {
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  noResults: {
    padding: spacing.lg,
    fontSize: 14,
    color: colors.onSurfaceTertiary,
    textAlign: "center",
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  resultDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  resultIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.brandSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  resultLabel: {
    fontSize: 15,
    color: colors.onSurface,
    fontWeight: "600",
  },
  resultCategory: {
    fontSize: 12,
    color: colors.onSurfaceTertiary,
    marginTop: 2,
  },

  // Primary CTA
  primaryCta: {
    borderRadius: radius.lg,
    overflow: "hidden",
    minHeight: 100,
    marginBottom: spacing.md,
  },
  primaryCtaContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    padding: spacing.lg,
  },
  primaryCtaIconWrap: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryCtaTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.onBrandPrimary,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  primaryCtaSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 18,
  },

  // Secondary CTA (Checklist)
  secondaryCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.brandPrimary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  secondaryCtaIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.brandSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryCtaTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.onSurface,
    marginBottom: 2,
  },
  secondaryCtaSub: {
    fontSize: 13,
    color: colors.onSurfaceTertiary,
    lineHeight: 18,
  },

  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.onSurfaceTertiary,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  linkBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  linkBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.brandPrimary,
  },

  // Guide
  guideHeader: {
    marginBottom: spacing.md,
  },
  guideBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginBottom: spacing.sm,
  },
  guideBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.warning,
    letterSpacing: 0.8,
  },
  guideTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.onSurface,
    letterSpacing: -0.3,
  },
  accordion: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  accordionOpen: {
    borderColor: colors.warning,
    backgroundColor: "#FFFBEB",
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  accordionIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },
  accordionTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  accordionNumber: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.warning,
    letterSpacing: 1,
  },
  accordionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.onSurface,
    letterSpacing: -0.2,
  },
  accordionBody: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.onSurfaceSecondary,
    marginTop: spacing.md,
    paddingLeft: 52,
  },

  // Saved reports
  savedRow: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  savedCard: {
    width: 160,
    backgroundColor: colors.brandSecondary,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: 4,
  },
  savedIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  savedDate: {
    fontSize: 11,
    color: colors.onBrandSecondary,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  savedTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.onBrandSecondary,
  },
  savedMeta: {
    fontSize: 12,
    color: colors.onSurfaceTertiary,
    marginTop: 2,
  },

  // Reminders card
  remindersCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  remindersIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.brandSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  remindersTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.onSurface,
    marginBottom: 2,
  },
  remindersSub: {
    fontSize: 13,
    color: colors.onSurfaceTertiary,
    lineHeight: 18,
  },
  remindersBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  remindersBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.onWarning,
  },

  // Feature cards
  featureList: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 84,
  },
  featureIconBox: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.brandSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.onSurface,
    marginBottom: 2,
  },
  featureSubtitle: {
    fontSize: 14,
    color: colors.onSurfaceTertiary,
    lineHeight: 20,
  },

  // Banner
  banner: {
    borderRadius: radius.lg,
    overflow: "hidden",
    minHeight: 220,
    justifyContent: "flex-end",
  },
  bannerImage: {
    ...StyleSheet.absoluteFillObject,
  },
  bannerScrim: {
    ...StyleSheet.absoluteFillObject,
  },
  bannerContent: {
    padding: spacing.xl,
  },
  bannerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginBottom: spacing.md,
  },
  bannerBadgeText: {
    color: colors.onBrandPrimary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  bannerTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "700",
    color: colors.onBrandPrimary,
    marginBottom: spacing.sm,
  },
  bannerBody: {
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255,255,255,0.9)",
    marginBottom: spacing.lg,
  },
  bannerCtaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    minHeight: 52,
  },
  bannerCtaText: {
    color: colors.brandPrimary,
    fontSize: 15,
    fontWeight: "700",
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
    letterSpacing: -0.3,
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

  // Lang sheet
  langSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
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
  langSheetTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  langOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  langOptionText: {
    fontSize: 16,
    color: colors.onSurface,
    fontWeight: "500",
  },
  langOptionSelected: {
    color: colors.brandPrimary,
    fontWeight: "700",
  },
});
