// Sentinella AI — pagina riservata al gestore dell'app.
// L'AI confronta gli importi INPS del database con le fonti ufficiali sul web
// e propone gli aggiornamenti: l'admin li applica o li ignora.

import { useCallback, useEffect, useRef, useState } from "react";
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

import { colors, radius, spacing } from "@/src/theme";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const POLL_MS = 4000;

type Stato = "ok" | "discrepanza" | "non_verificato";
type Esito = "in_attesa" | "applicato" | "ignorato" | null;

interface SentinelResult {
  nome: string;
  importoAttuale: string;
  redditoAttuale: string;
  stato: Stato;
  importoTrovato: string | null;
  redditoTrovato: string | null;
  nota: string;
  fonte: string | null;
  esito?: Esito;
}

interface SentinelCheck {
  check_id: string;
  status: "running" | "done" | "errore";
  startedAt: string;
  finishedAt?: string;
  results?: SentinelResult[];
  error?: string;
}

const STATO_UI: Record<Stato, { label: string; icon: string; color: string; soft: string }> = {
  ok: { label: "Allineato", icon: "checkmark-circle", color: colors.success, soft: colors.successSoft },
  discrepanza: { label: "Discrepanza", icon: "alert-circle", color: colors.accentDark, soft: colors.accentSoft },
  non_verificato: { label: "Non verificato", icon: "help-circle", color: colors.muted, soft: colors.surfaceSecondary },
};

function formatWhen(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("it-IT", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Sentinella() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [check, setCheck] = useState<SentinelCheck | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [resolving, setResolving] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPoll = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const fetchLatest = useCallback(async (): Promise<SentinelCheck | null> => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/sentinel/latest`);
      if (!res.ok) return null;
      const data = await res.json();
      return (data.check as SentinelCheck) || null;
    } catch {
      return null;
    }
  }, []);

  const startPolling = useCallback(() => {
    stopPoll();
    pollRef.current = setInterval(async () => {
      const c = await fetchLatest();
      if (c) {
        setCheck(c);
        if (c.status !== "running") stopPoll();
      }
    }, POLL_MS);
  }, [fetchLatest]);

  useEffect(() => {
    (async () => {
      const c = await fetchLatest();
      setCheck(c);
      setLoading(false);
      if (c?.status === "running") startPolling();
    })();
    return stopPoll;
  }, [fetchLatest, startPolling]);

  const startCheck = async () => {
    setStarting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/sentinel/check`, {
        method: "POST",
      });
      if (res.ok) {
        const c = await fetchLatest();
        setCheck(c);
        startPolling();
      }
    } catch {
      /* rete assente: resta lo stato precedente */
    }
    setStarting(false);
  };

  const resolve = async (nome: string, azione: "applica" | "ignora") => {
    if (!check) return;
    setResolving(nome);
    try {
      const res = await fetch(`${BACKEND_URL}/api/sentinel/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkId: check.check_id, nome, azione }),
      });
      if (res.ok) {
        const data = await res.json();
        setCheck((prev) =>
          prev
            ? {
                ...prev,
                results: prev.results?.map((r) =>
                  r.nome === nome ? { ...r, esito: data.esito as Esito } : r,
                ),
              }
            : prev,
        );
      }
    } catch {
      /* ignora errori di rete */
    }
    setResolving(null);
  };

  const running = check?.status === "running";
  const discrepancies =
    check?.results?.filter((r) => r.stato === "discrepanza").length ?? 0;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]} testID="sentinella-screen">
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.iconBtn}
          hitSlop={12}
          accessibilityLabel="Indietro"
          testID="sentinella-back-btn"
        >
          <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Sentinella AI</Text>
        <View style={styles.iconBtn} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.brandPrimary} />
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
          {/* Intro admin */}
          <View style={styles.introCard}>
            <View style={styles.introIconWrap}>
              <Ionicons name="eye" size={20} color={colors.brandPrimary} />
            </View>
            <Text style={styles.introText}>
              {"Area riservata al gestore dell'app. L'AI cerca sul web le fonti ufficiali (INPS) e confronta gli importi con quelli mostrati agli utenti. Tu decidi cosa applicare."}
            </Text>
          </View>

          {/* Avvia / stato */}
          {running ? (
            <View style={styles.runningCard} testID="sentinella-running">
              <ActivityIndicator color={colors.brandPrimary} />
              <View style={styles.flex}>
                <Text style={styles.runningTitle}>Controllo in corso…</Text>
                <Text style={styles.runningSub}>
                  {"L'AI sta consultando le fonti ufficiali sul web. Richiede 1-2 minuti: puoi restare su questa pagina."}
                </Text>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={startCheck}
              disabled={starting}
              style={[styles.startBtn, starting && styles.btnDisabled]}
              testID="sentinella-start-btn"
            >
              {starting ? (
                <ActivityIndicator color={colors.onBrandPrimary} />
              ) : (
                <Ionicons name="search" size={18} color={colors.onBrandPrimary} />
              )}
              <Text style={styles.startBtnText}>
                {check ? "Avvia nuovo controllo" : "Avvia controllo AI"}
              </Text>
            </Pressable>
          )}

          {check?.status === "errore" && (
            <View style={styles.errorCard}>
              <Ionicons name="warning" size={16} color={colors.error} />
              <Text style={styles.errorText}>
                Ultimo controllo non riuscito. Riprova tra qualche minuto.
              </Text>
            </View>
          )}

          {/* Riepilogo ultimo check */}
          {check?.status === "done" && (
            <View style={styles.summaryRow} testID="sentinella-summary">
              <Ionicons
                name={discrepancies > 0 ? "alert-circle" : "shield-checkmark"}
                size={16}
                color={discrepancies > 0 ? colors.accentDark : colors.success}
              />
              <Text style={styles.summaryText}>
                Ultimo controllo: {formatWhen(check.finishedAt)} ·{" "}
                {discrepancies > 0
                  ? `${discrepancies} discrepanz${discrepancies === 1 ? "a" : "e"} da valutare`
                  : "tutti gli importi risultano allineati"}
              </Text>
            </View>
          )}

          {/* Risultati */}
          {check?.status === "done" &&
            check.results?.map((r) => {
              const ui = STATO_UI[r.stato];
              const pending = r.stato === "discrepanza" && r.esito === "in_attesa";
              return (
                <View key={r.nome} style={styles.card} testID={`sentinella-card-${r.nome.slice(0, 10)}`}>
                  <View style={styles.cardHead}>
                    <Text style={styles.cardName}>{r.nome}</Text>
                    <View style={[styles.badge, { backgroundColor: ui.soft }]}>
                      <Ionicons name={ui.icon as never} size={13} color={ui.color} />
                      <Text style={[styles.badgeText, { color: ui.color }]}>
                        {ui.label}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.valueRow}>
                    <Text style={styles.valueLabel}>{"Nell'app"}</Text>
                    <Text style={styles.valueText}>{r.importoAttuale}</Text>
                  </View>
                  {r.importoTrovato && r.stato === "discrepanza" && r.importoTrovato !== r.importoAttuale && (
                    <View style={styles.valueRow}>
                      <Text style={[styles.valueLabel, styles.foundLabel]}>
                        Trovato
                      </Text>
                      <Text style={[styles.valueText, styles.foundText]}>
                        {r.importoTrovato}
                      </Text>
                    </View>
                  )}
                  {r.redditoTrovato && r.stato === "discrepanza" && r.redditoTrovato !== r.redditoAttuale && (
                    <View style={styles.valueRow}>
                      <Text style={[styles.valueLabel, styles.foundLabel]}>
                        Reddito
                      </Text>
                      <Text style={[styles.valueText, styles.foundText]}>
                        {r.redditoTrovato}
                      </Text>
                    </View>
                  )}

                  {!!r.nota && <Text style={styles.nota}>{r.nota}</Text>}

                  {!!r.fonte && (
                    <Pressable
                      onPress={() => Linking.openURL(r.fonte!).catch(() => {})}
                      hitSlop={6}
                      style={styles.linkRow}
                    >
                      <Ionicons name="open-outline" size={13} color={colors.brandPrimary} />
                      <Text style={styles.linkText} numberOfLines={1}>
                        Vedi la fonte
                      </Text>
                    </Pressable>
                  )}

                  {pending && (
                    <View style={styles.actionsRow}>
                      <Pressable
                        onPress={() => resolve(r.nome, "applica")}
                        disabled={resolving === r.nome}
                        style={[styles.applyBtn, resolving === r.nome && styles.btnDisabled]}
                        testID={`sentinella-apply-${r.nome.slice(0, 10)}`}
                      >
                        {resolving === r.nome ? (
                          <ActivityIndicator size="small" color={colors.onBrandPrimary} />
                        ) : (
                          <Ionicons name="checkmark" size={16} color={colors.onBrandPrimary} />
                        )}
                        <Text style={styles.applyText}>Applica aggiornamento</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => resolve(r.nome, "ignora")}
                        disabled={resolving === r.nome}
                        style={styles.ignoreBtn}
                        testID={`sentinella-ignore-${r.nome.slice(0, 10)}`}
                      >
                        <Text style={styles.ignoreText}>Ignora</Text>
                      </Pressable>
                    </View>
                  )}

                  {r.esito === "applicato" && (
                    <View style={styles.appliedRow}>
                      <Ionicons name="checkmark-circle" size={15} color={colors.success} />
                      <Text style={styles.appliedText}>
                        Aggiornamento applicato: gli utenti vedono già il nuovo valore.
                      </Text>
                    </View>
                  )}
                  {r.esito === "ignorato" && (
                    <View style={styles.appliedRow}>
                      <Ionicons name="remove-circle" size={15} color={colors.muted} />
                      <Text style={[styles.appliedText, { color: colors.muted }]}>
                        Segnalazione ignorata.
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}

          <Text style={styles.disclaimer}>
            La Sentinella è un aiuto, non una decisione automatica: verifica
            sempre la fonte prima di applicare un aggiornamento.
          </Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
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
    backgroundColor: colors.brandSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  introIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  introText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: colors.onBrandSecondary,
    fontWeight: "600",
  },

  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md + 2,
    marginBottom: spacing.md,
    minHeight: 48,
  },
  startBtnText: { color: colors.onBrandPrimary, fontWeight: "800", fontSize: 15 },
  btnDisabled: { opacity: 0.6 },

  runningCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  runningTitle: { fontSize: 14, fontWeight: "800", color: colors.onSurface },
  runningSub: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.onSurfaceSecondary,
    marginTop: 2,
  },

  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.errorSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: { flex: 1, fontSize: 12, color: colors.error, fontWeight: "600" },

  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  summaryText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: colors.onSurfaceSecondary,
    fontWeight: "600",
  },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardHead: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  cardName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
    color: colors.onSurface,
    lineHeight: 19,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 11, fontWeight: "800" },

  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: 2,
  },
  valueLabel: {
    width: 64,
    fontSize: 11,
    fontWeight: "700",
    color: colors.muted,
    textTransform: "uppercase",
  },
  valueText: { flex: 1, fontSize: 14, fontWeight: "700", color: colors.onSurface },
  foundLabel: { color: colors.accentDark },
  foundText: { color: colors.accentDark, fontWeight: "800" },

  nota: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.onSurfaceSecondary,
    marginTop: spacing.sm,
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

  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  applyBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    minHeight: 44,
  },
  applyText: { color: colors.onBrandPrimary, fontWeight: "800", fontSize: 13 },
  ignoreBtn: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  ignoreText: { color: colors.onSurfaceSecondary, fontWeight: "700", fontSize: 13 },

  appliedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.md,
  },
  appliedText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    color: colors.success,
    lineHeight: 17,
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
