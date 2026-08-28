// "I 4 livelli di sostegno" (Riforma 2027) — cosa comporta ciascun livello
// con le agevolazioni fiscali e le tutele sul lavoro. Contenuti dal server.

import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { colors, radius, spacing } from "@/src/theme";
import { LivelliSostegno, loadAppContent } from "@/src/lib/remoteContent";

const ACCENT = "#C2410C"; // arancio riforma

export function LivelliSection() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [dati, setDati] = useState<LivelliSostegno | null>(null);
  const [espanso, setEspanso] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const c = await loadAppContent();
      if (c?.livelliSostegno) setDati(c.livelliSostegno);
    })();
  }, []);

  if (!dati) return null;

  return (
    <View style={[styles.card, { borderLeftColor: ACCENT }]} testID="livelli-section">
      <Pressable
        onPress={() => setOpen((v) => !v)}
        style={styles.header}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        testID="livelli-toggle"
      >
        <View style={styles.icon}>
          <Ionicons name="stats-chart" size={22} color={ACCENT} />
        </View>
        <View style={styles.flex}>
          <Text style={[styles.label, { color: ACCENT }]}>RIFORMA 2027</Text>
          <Text style={styles.title}>I 4 livelli di sostegno</Text>
        </View>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={20}
          color={colors.onSurfaceTertiary}
        />
      </Pressable>

      {open && (
        <View style={styles.body} testID="livelli-body">
          <Text style={styles.intro}>{dati.intro}</Text>

          {dati.livelli.map((l) => {
            const attivo = espanso === l.nome;
            return (
              <View
                key={l.nome}
                style={[styles.livelloCard, attivo && { borderColor: l.colore }]}
              >
                <Pressable
                  onPress={() => setEspanso(attivo ? null : l.nome)}
                  style={styles.livelloHead}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: attivo }}
                  testID={`livello-toggle-${l.nome.slice(0, 14)}`}
                >
                  <View style={[styles.pallino, { backgroundColor: l.colore }]} />
                  <Text style={[styles.livelloNome, { color: l.colore }]}>
                    {l.nome}
                  </Text>
                  <Ionicons
                    name={attivo ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={colors.onSurfaceTertiary}
                  />
                </Pressable>

                {attivo && (
                  <View style={styles.livelloBody}>
                    <Text style={styles.descrizione}>{l.descrizione}</Text>

                    <Text style={styles.gruppoTitolo}>💶 Agevolazioni fiscali</Text>
                    {l.fisco.map((v) => (
                      <View key={v} style={styles.voceRow}>
                        <Ionicons name="checkmark" size={14} color={l.colore} />
                        <Text style={styles.voceText}>{v}</Text>
                      </View>
                    ))}

                    <Text style={styles.gruppoTitolo}>💼 Tutele sul lavoro</Text>
                    {l.lavoro.map((v) => (
                      <View key={v} style={styles.voceRow}>
                        <Ionicons name="checkmark" size={14} color={l.colore} />
                        <Text style={styles.voceText}>{v}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}

          <Text style={styles.nota}>
            Elenco orientativo: la spettanza effettiva dipende dal verbale e dai
            requisiti di legge. Chi ha già un verbale non perde nulla.
          </Text>

          <Pressable
            onPress={() => router.push("/riforma")}
            style={styles.linkRiforma}
            accessibilityRole="button"
            testID="livelli-link-riforma"
          >
            <Ionicons name="megaphone" size={15} color={ACCENT} />
            <Text style={styles.linkRiformaText}>
              Scopri la Riforma 2027 e verifica la tua provincia
            </Text>
            <Ionicons name="chevron-forward" size={15} color={ACCENT} />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: "#FFF0E6",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.onSurface,
    marginTop: 2,
    letterSpacing: -0.2,
  },
  body: { marginTop: spacing.md },
  intro: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.onSurfaceSecondary,
    marginBottom: spacing.md,
  },
  livelloCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    overflow: "hidden",
  },
  livelloHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    minHeight: 48,
  },
  pallino: { width: 12, height: 12, borderRadius: 6 },
  livelloNome: { flex: 1, fontSize: 14, fontWeight: "800" },
  livelloBody: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  descrizione: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.onSurfaceSecondary,
    marginBottom: spacing.sm,
  },
  gruppoTitolo: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.onSurface,
    marginTop: spacing.sm,
    marginBottom: 4,
  },
  voceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 4,
    paddingRight: spacing.sm,
  },
  voceText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.onSurfaceSecondary,
  },
  nota: {
    fontSize: 11,
    fontStyle: "italic",
    color: colors.onSurfaceTertiary,
    lineHeight: 16,
    marginTop: spacing.sm,
  },
  linkRiforma: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FFF0E6",
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
    minHeight: 44,
  },
  linkRiformaText: {
    fontSize: 12.5,
    fontWeight: "800",
    color: ACCENT,
  },
});
