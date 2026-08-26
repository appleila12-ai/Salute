// Importi e Prestazioni — cifre aggiornate dal server con data e fonte INPS.

import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
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
  formatUpdatedAt,
  loadAppContent,
} from "@/src/lib/remoteContent";

export default function Importi() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [content, setContent] = useState<AppContent | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setContent(await loadAppContent());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]} testID="importi-screen">
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.iconBtn}
          hitSlop={12}
          accessibilityLabel="Indietro"
          testID="importi-back-btn"
        >
          <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Importi e Prestazioni</Text>
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
          <Pressable onPress={load} style={styles.retryBtn} testID="importi-retry">
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
          {/* Badge trasparenza — tieni premuto per aprire la Sentinella AI (admin) */}
          <Pressable
            style={styles.updateBadge}
            testID="importi-updated-badge"
            onLongPress={() => router.push("/sentinella")}
            delayLongPress={600}
          >
            <Ionicons name="shield-checkmark" size={16} color={colors.success} />
            <Text style={styles.updateText}>
              Dati aggiornati al{" "}
              <Text style={styles.updateStrong}>
                {formatUpdatedAt(content.updatedAt)}
              </Text>
              {" · "}
              {content.fonte}
            </Text>
          </Pressable>

          {content.importi.map((it) => (
            <View
              key={it.nome}
              style={styles.card}
              testID={`importo-card-${it.nome.slice(0, 10)}`}
            >
              <Text style={styles.cardName}>{it.nome}</Text>
              <Text style={styles.cardAmount}>{it.importo}</Text>
              <View style={styles.rowLine}>
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={topics.invalidita.main}
                  style={styles.rowIcon}
                />
                <Text style={styles.rowText}>{it.requisiti}</Text>
              </View>
              <View style={styles.rowLine}>
                <Ionicons
                  name="wallet"
                  size={14}
                  color={topics.esenzioni.main}
                  style={styles.rowIcon}
                />
                <Text style={styles.rowText}>{it.reddito}</Text>
              </View>
              <Pressable
                onPress={() => Linking.openURL(it.url).catch(() => {})}
                hitSlop={6}
                style={styles.linkRow}
              >
                <Ionicons name="open-outline" size={13} color={colors.brandPrimary} />
                <Text style={styles.linkText}>Verifica sulla fonte ufficiale INPS</Text>
              </Pressable>
            </View>
          ))}

          <Text style={styles.disclaimer}>
            Gli importi vengono rivalutati ogni anno dall'INPS: questa pagina si
            aggiorna automaticamente senza bisogno di aggiornare l'app.
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

  updateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.successSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  updateText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: colors.success,
    fontWeight: "600",
  },
  updateStrong: { fontWeight: "800" },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    borderLeftColor: topics.invalidita.main,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardName: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.onSurface,
    lineHeight: 19,
  },
  cardAmount: {
    fontSize: 24,
    fontWeight: "800",
    color: topics.invalidita.dark,
    marginVertical: spacing.sm,
    letterSpacing: -0.4,
  },
  rowLine: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  rowIcon: { marginTop: 3 },
  rowText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: colors.onSurfaceSecondary,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: spacing.sm,
  },
  linkText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.brandPrimary,
    textDecorationLine: "underline",
  },
  disclaimer: {
    fontSize: 11,
    fontStyle: "italic",
    color: colors.onSurfaceTertiary,
    textAlign: "center",
    marginTop: spacing.sm,
    lineHeight: 16,
  },
});
