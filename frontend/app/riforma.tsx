// Riforma della Disabilità (D.Lgs. 62/2024) — cosa cambia dal 2027 e
// verifica provincia: i dati arrivano dal server (aggiornabili senza update).

import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
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
import {
  AppContent,
  formatUpdatedAt,
  loadAppContent,
  RiformaFase,
} from "@/src/lib/remoteContent";

function normalizza(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-'\s]/g, "");
}

const CAMBIO_ICONE = ["document-text", "business", "analytics", "sparkles"] as const;

export default function RiformaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [content, setContent] = useState<AppContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      setContent(await loadAppContent());
      setLoading(false);
    })();
  }, []);

  const riforma = content?.riforma;

  const esito = useMemo((): { fase: RiformaFase; provincia: string } | "no" | null => {
    const q = normalizza(query);
    if (!riforma || q.length < 3) return null;
    for (const fase of riforma.fasi) {
      for (const p of fase.province) {
        const np = normalizza(p);
        if (np === q || np.startsWith(q)) return { fase, provincia: p };
      }
    }
    return "no";
  }, [query, riforma]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]} testID="riforma-screen">
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.iconBtn}
          hitSlop={12}
          accessibilityLabel="Indietro"
          testID="riforma-back-btn"
        >
          <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Riforma 2027</Text>
        <View style={styles.iconBtn} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.brandPrimary} />
        </View>
      ) : !riforma ? (
        <View style={styles.centered}>
          <Text style={styles.erroreText}>
            Contenuti non disponibili: controlla la connessione e riprova.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + spacing.xxl },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Intro */}
          <View style={styles.introCard}>
            <View style={styles.introIcon}>
              <Ionicons name="megaphone" size={22} color="#7C2D12" />
            </View>
            <Text style={styles.introText}>{riforma.intro}</Text>
          </View>

          {/* Verifica provincia */}
          <View style={styles.card} testID="riforma-check-card">
            <Text style={styles.cardTitle}>La tua provincia è già nel nuovo iter?</Text>
            <View style={styles.searchRow}>
              <Ionicons name="search" size={18} color={colors.muted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Scrivi la tua provincia (es. Genova)"
                placeholderTextColor={colors.muted}
                value={query}
                onChangeText={setQuery}
                autoCorrect={false}
                testID="riforma-provincia-input"
              />
            </View>
            {esito !== null &&
              (esito === "no" ? (
                <View style={[styles.esitoBox, styles.esitoBlu]} testID="riforma-esito-no">
                  <Ionicons name="time" size={20} color={colors.onBrandSecondary} />
                  <Text style={[styles.esitoText, { color: colors.onBrandSecondary }]}>
                    <Text style={styles.bold}>Nuovo iter dal 1° gennaio 2027. </Text>
                    Fino ad allora nella tua provincia vale la procedura attuale
                    descritta in questa app (certificato + domanda INPS).
                  </Text>
                </View>
              ) : (
                <View style={[styles.esitoBox, styles.esitoVerde]} testID="riforma-esito-si">
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  <Text style={[styles.esitoText, { color: colors.success }]}>
                    <Text style={styles.bold}>
                      {esito.provincia}: nuovo iter GIÀ attivo
                    </Text>
                    {` — ${esito.fase.etichetta}. Il certificato del tuo medico avvia da solo la pratica: niente domanda separata.`}
                  </Text>
                </View>
              ))}
            <Text style={styles.listaHint}>
              Territori già in sperimentazione:{" "}
              {riforma.fasi.reduce((n, f) => n + f.province.length, 0)} — elenco
              aggiornato al {formatUpdatedAt(content!.updatedAt)}.
            </Text>
          </View>

          {/* Cosa cambia */}
          <Text style={styles.sezTitle}>Cosa cambia con la riforma</Text>
          {riforma.cosaCambia.map((c, i) => (
            <View key={c.titolo} style={styles.cambioCard}>
              <View style={styles.cambioIcon}>
                <Ionicons
                  name={CAMBIO_ICONE[i % CAMBIO_ICONE.length]}
                  size={20}
                  color={colors.brandPrimary}
                />
              </View>
              <View style={styles.flex}>
                <Text style={styles.cambioTitle}>{c.titolo}</Text>
                <Text style={styles.cambioText}>{c.testo}</Text>
              </View>
            </View>
          ))}

          {/* Salvaguardia */}
          <View style={styles.salvaCard} testID="riforma-salvaguardia">
            <View style={styles.salvaHead}>
              <Ionicons name="shield-checkmark" size={20} color={colors.success} />
              <Text style={styles.salvaTitle}>Hai già un verbale? Sei al sicuro</Text>
            </View>
            <Text style={styles.salvaText}>{riforma.salvaguardia}</Text>
          </View>

          {/* Fonte */}
          <Pressable
            onPress={() => Linking.openURL(riforma.fonteUrl).catch(() => {})}
            style={styles.fonteRow}
            hitSlop={6}
          >
            <Ionicons name="open-outline" size={14} color={colors.brandPrimary} />
            <Text style={styles.fonteText}>
              Fonte ufficiale: INPS — Riforma della disabilità
            </Text>
          </Pressable>
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
    padding: spacing.xl,
  },
  erroreText: {
    fontSize: 14,
    color: colors.onSurfaceSecondary,
    textAlign: "center",
  },
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

  introCard: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start",
    backgroundColor: "#FFF0E6",
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  introIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  introText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: "#7C2D12",
    fontWeight: "600",
  },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.onSurface,
    paddingVertical: spacing.sm,
  },
  esitoBox: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start",
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  esitoVerde: { backgroundColor: colors.successSoft },
  esitoBlu: { backgroundColor: colors.brandSecondary },
  esitoText: { flex: 1, fontSize: 13, lineHeight: 19, fontWeight: "600" },
  bold: { fontWeight: "800" },
  listaHint: {
    fontSize: 11,
    color: colors.onSurfaceTertiary,
    marginTop: spacing.md,
    lineHeight: 16,
  },

  sezTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  cambioCard: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cambioIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.brandSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  cambioTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.onSurface,
    marginBottom: 2,
  },
  cambioText: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.onSurfaceSecondary,
  },

  salvaCard: {
    backgroundColor: colors.successSoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  salvaHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  salvaTitle: { fontSize: 15, fontWeight: "800", color: colors.success },
  salvaText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#14532D",
    fontWeight: "500",
  },

  fonteRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: spacing.md,
  },
  fonteText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.brandPrimary,
    textDecorationLine: "underline",
  },
});
