// Domande Frequenti + Glossario — contenuti aggiornabili dal server.

import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
  AppContent,
  loadAppContent,
} from "@/src/lib/remoteContent";

export default function Faq() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [content, setContent] = useState<AppContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setContent(await loadAppContent());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]} testID="faq-screen">
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.iconBtn}
          hitSlop={12}
          accessibilityLabel="Indietro"
          testID="faq-back-btn"
        >
          <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Domande e Glossario</Text>
        <View style={styles.iconBtn} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.brandPrimary} />
        </View>
      ) : !content ? (
        <View style={styles.centered}>
          <Text style={styles.errText}>
            Contenuti non disponibili. Controlla la connessione.
          </Text>
          <Pressable onPress={load} style={styles.retryBtn} testID="faq-retry">
            <Text style={styles.retryText}>Riprova</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + spacing.xxl },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.groupLabel, { color: topics.legge104.main }]}>
            DOMANDE FREQUENTI
          </Text>
          {content.faq.map((f, i) => {
            const open = openIdx === i;
            return (
              <View key={f.d} style={styles.faqCard}>
                <Pressable
                  onPress={() => setOpenIdx(open ? null : i)}
                  style={styles.faqHeader}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: open }}
                  testID={`faq-item-${i}`}
                >
                  <Text style={styles.faqQ}>{f.d}</Text>
                  <Ionicons
                    name={open ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={colors.onSurfaceTertiary}
                  />
                </Pressable>
                {open && (
                  <Text style={styles.faqA} testID={`faq-answer-${i}`}>
                    {f.r}
                  </Text>
                )}
              </View>
            );
          })}

          <Text
            style={[
              styles.groupLabel,
              { color: topics.documenti.main, marginTop: spacing.lg },
            ]}
          >
            GLOSSARIO SEMPLICE
          </Text>
          {content.glossario.map((g) => (
            <View key={g.t} style={styles.glossRow}>
              <Text style={styles.glossTerm}>{g.t}</Text>
              <Text style={styles.glossDef}>{g.d}</Text>
            </View>
          ))}

          <Text style={styles.disclaimer}>
            Risposte orientative: per il tuo caso specifico conferma sempre con
            un patronato.
          </Text>
        </ScrollView>
      )}
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
    gap: spacing.md,
    padding: spacing.xl,
  },
  errText: { fontSize: 14, color: colors.onSurfaceSecondary, textAlign: "center" },
  retryBtn: {
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  retryText: { color: colors.onBrandPrimary, fontWeight: "800" },
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
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  groupLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
  },
  faqCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 44,
  },
  faqQ: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: colors.onSurface,
    lineHeight: 19,
  },
  faqA: {
    marginTop: spacing.sm,
    fontSize: 14,
    lineHeight: 20,
    color: colors.onSurfaceSecondary,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  glossRow: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  glossTerm: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.onSurface,
  },
  glossDef: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.onSurfaceSecondary,
    marginTop: 2,
  },
  disclaimer: {
    fontSize: 11,
    fontStyle: "italic",
    color: colors.onSurfaceTertiary,
    textAlign: "center",
    marginTop: spacing.md,
    lineHeight: 16,
  },
});
