import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";

import { colors, radius, spacing } from "@/src/theme";
import { FEATURES, FeatureId } from "@/src/data/mockData";

export default function FeatureDetail() {
  const { id } = useLocalSearchParams<{ id: FeatureId }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const feature = FEATURES.find((f) => f.id === id);

  if (!feature) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Contenuto non trovato.
          </Text>
          <Pressable onPress={() => router.back()} style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>Torna indietro</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.safe} testID={`feature-screen-${feature.id}`}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxl }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Image
            source={{ uri: feature.heroImage }}
            style={styles.heroImage}
            contentFit="cover"
            transition={300}
          />
          <LinearGradient
            colors={["rgba(11,42,72,0.55)", "rgba(11,42,72,0.95)"]}
            locations={[0, 1]}
            style={StyleSheet.absoluteFillObject}
          />
          <SafeAreaView edges={["top"]} style={styles.heroSafe}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.backBtn,
                pressed && { opacity: 0.7 },
              ]}
              accessibilityLabel="Torna indietro"
              accessibilityRole="button"
              hitSlop={12}
              testID="feature-back-button"
            >
              <Ionicons name="chevron-back" size={22} color={colors.onBrandPrimary} />
            </Pressable>
            <View style={styles.heroContent}>
              <View style={styles.heroIconBox}>
                {feature.iconLib === "ion" ? (
                  <Ionicons
                    name={feature.iconName as any}
                    size={26}
                    color={colors.onBrandPrimary}
                  />
                ) : (
                  <MaterialCommunityIcons
                    name={feature.iconName as any}
                    size={26}
                    color={colors.onBrandPrimary}
                  />
                )}
              </View>
              <Text style={styles.heroTitle} testID="feature-title">
                {feature.title}
              </Text>
              <Text style={styles.heroSubtitle}>{feature.subtitle}</Text>
            </View>
          </SafeAreaView>
        </View>

        {/* Body */}
        <View style={styles.body}>
          <Text style={styles.intro}>{feature.intro}</Text>

          {feature.sections.map((s, idx) => (
            <View
              key={s.title}
              style={styles.section}
              testID={`feature-section-${idx}`}
            >
              <Text style={styles.sectionTitle}>{s.title}</Text>
              <Text style={styles.sectionBody}>{s.body}</Text>
              {s.bullets && (
                <View style={styles.bullets}>
                  {s.bullets.map((b) => (
                    <View key={b} style={styles.bulletRow}>
                      <View style={styles.bulletDot}>
                        <Ionicons
                          name="checkmark"
                          size={14}
                          color={colors.brandPrimary}
                        />
                      </View>
                      <Text style={styles.bulletText}>{b}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}

          <View style={styles.helpCard}>
            <Ionicons
              name="chatbubbles-outline"
              size={22}
              color={colors.brandPrimary}
            />
            <View style={styles.flex}>
              <Text style={styles.helpTitle}>Serve altro aiuto?</Text>
              <Text style={styles.helpBody}>
                Un operatore può richiamarti gratuitamente entro 24 ore.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  hero: {
    height: 280,
    justifyContent: "flex-end",
    backgroundColor: colors.surfaceInverse,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroSafe: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
  },
  heroContent: {
    gap: spacing.sm,
  },
  heroIconBox: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  heroTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
    color: colors.onBrandPrimary,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
  },

  body: {
    padding: spacing.lg,
  },
  intro: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.onSurfaceSecondary,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  sectionBody: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.onSurfaceSecondary,
  },
  bullets: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  bulletDot: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: colors.onSurfaceSecondary,
  },

  helpCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.brandSecondary,
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginTop: spacing.sm,
  },
  helpTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.onBrandSecondary,
    marginBottom: 2,
  },
  helpBody: {
    fontSize: 13,
    color: colors.onBrandSecondary,
    lineHeight: 18,
  },

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
    padding: spacing.xl,
  },
  emptyText: { fontSize: 16, color: colors.onSurfaceSecondary },
  retryBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.pill,
  },
  retryBtnText: { color: colors.onBrandPrimary, fontWeight: "700" },
});
