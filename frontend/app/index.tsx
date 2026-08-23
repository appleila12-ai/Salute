import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
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
import { useRouter } from "expo-router";

import { colors, radius, spacing } from "@/src/theme";
import { FEATURES, SEARCH_SUGGESTIONS } from "@/src/data/mockData";

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return SEARCH_SUGGESTIONS.filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q),
    ).slice(0, 6);
  }, [query]);

  const showResults = query.length > 0;

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
          {/* Header */}
          <View style={styles.header} testID="home-header">
            <Text style={styles.hello}>Ciao</Text>
            <Text
              style={styles.greeting}
              accessibilityRole="header"
              testID="home-greeting"
            >
              Come possiamo aiutarti oggi?
            </Text>
            <Text style={styles.subGreeting}>
              Cerca una patologia, un diritto o un servizio.
            </Text>
          </View>

          {/* Search */}
          <View style={styles.searchWrap}>
            <View
              style={[styles.searchBar, focused && styles.searchBarFocused]}
              testID="home-search-container"
            >
              <Ionicons name="search" size={20} color={colors.onSurfaceTertiary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Es. Legge 104, diagnosi, televisita…"
                placeholderTextColor={colors.muted}
                value={query}
                onChangeText={setQuery}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                returnKeyType="search"
                accessibilityLabel="Cerca patologia o diritto"
                testID="home-search-input"
              />
              {query.length > 0 && (
                <Pressable
                  onPress={() => setQuery("")}
                  hitSlop={8}
                  testID="home-search-clear"
                  accessibilityLabel="Cancella ricerca"
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={colors.onSurfaceTertiary}
                  />
                </Pressable>
              )}
            </View>

            {showResults && (
              <View style={styles.resultsCard} testID="home-search-results">
                {results.length === 0 ? (
                  <Text style={styles.noResults}>
                    Nessun risultato. Prova con un altro termine.
                  </Text>
                ) : (
                  results.map((r, idx) => (
                    <Pressable
                      key={r.label}
                      onPress={() => {
                        router.push(`/feature/${r.route}` as any);
                        setQuery("");
                        setFocused(false);
                      }}
                      style={({ pressed }) => [
                        styles.resultRow,
                        idx !== results.length - 1 && styles.resultDivider,
                        pressed && styles.pressed,
                      ]}
                      testID={`home-search-result-${idx}`}
                      accessibilityRole="button"
                    >
                      <View style={styles.resultIcon}>
                        <Ionicons
                          name="search"
                          size={16}
                          color={colors.brandPrimary}
                        />
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

          {/* Section title */}
          <Text style={styles.sectionTitle} testID="home-section-title">
            Come possiamo aiutarti
          </Text>

          {/* Feature cards */}
          <View style={styles.featureList}>
            {FEATURES.map((f) => (
              <Pressable
                key={f.id}
                onPress={() => router.push(`/feature/${f.id}` as any)}
                style={({ pressed }) => [
                  styles.featureCard,
                  pressed && styles.pressedCard,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`${f.title}. ${f.subtitle}`}
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

          {/* Bottom banner CTA */}
          <Pressable
            onPress={() => router.push("/percorso")}
            style={({ pressed }) => [
              styles.banner,
              pressed && styles.pressedCard,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Hai appena ricevuto una diagnosi? Inizia il percorso guidato."
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
                <Ionicons
                  name="sparkles"
                  size={14}
                  color={colors.onBrandPrimary}
                />
                <Text style={styles.bannerBadgeText}>Percorso guidato</Text>
              </View>
              <Text style={styles.bannerTitle}>
                Hai appena ricevuto una diagnosi?
              </Text>
              <Text style={styles.bannerBody}>
                Ti guidiamo passo dopo passo, con calma e senza giudizi.
              </Text>
              <View style={styles.bannerCta} testID="home-banner-cta-button">
                <Text style={styles.bannerCtaText}>
                  Inizia il Percorso Guidato
                </Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  hello: {
    fontSize: 16,
    color: colors.onSurfaceTertiary,
    marginBottom: spacing.xs,
    fontWeight: "500",
  },
  greeting: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700",
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
    marginBottom: spacing.xl,
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
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  searchBarFocused: {
    borderColor: colors.brandPrimary,
    backgroundColor: colors.surface,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.onSurface,
    padding: 0,
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

  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.onSurfaceTertiary,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: spacing.md,
  },

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
    fontSize: 22,
    lineHeight: 28,
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
  bannerCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    minHeight: 52,
    alignSelf: "stretch",
  },
  bannerCtaText: {
    color: colors.brandPrimary,
    fontSize: 16,
    fontWeight: "700",
  },

  pressed: { opacity: 0.7 },
  pressedCard: { opacity: 0.85 },
});
