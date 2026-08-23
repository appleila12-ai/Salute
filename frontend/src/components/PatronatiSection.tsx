import { useMemo, useState } from "react";
import {
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors, radius, spacing } from "@/src/theme";
import { findPatronati, Patronato, PATRONATI } from "@/src/data/patronati";

const PRE_VISIT_ITEMS = [
  "Codice Fiscale",
  "Documento d'Identità in corso di validità",
  "Certificato Medico Introduttivo rilasciato dal medico curante",
];

export function PatronatiSection() {
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const list = useMemo(() => findPatronati(PATRONATI, query), [query]);

  const call = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/\s+/g, "")}`).catch(() => {});
  };

  const email = (address: string) => {
    Linking.openURL(`mailto:${address}`).catch(() => {});
  };

  const openMaps = (p: Patronato) => {
    const q = encodeURIComponent(`${p.name} ${p.address} ${p.city}`);
    const url =
      Platform.OS === "ios"
        ? `http://maps.apple.com/?q=${q}`
        : `https://www.google.com/maps/search/?api=1&query=${q}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.wrap} testID="patronati-section">
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="location" size={22} color={colors.brandPrimary} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.title}>
            Dove inviare la pratica (Patronati e Assistenza)
          </Text>
          <Text style={styles.subtitle}>
            Per trasformare questa valutazione in una domanda ufficiale INPS
            senza commettere errori, puoi rivolgerti gratuitamente a un
            Patronato del tuo territorio.
          </Text>
        </View>
      </View>

      {/* Pre-visit checklist */}
      <View style={styles.preCheck} testID="patronati-pre-checklist">
        <View style={styles.preCheckHeader}>
          <Ionicons name="bag-handle" size={16} color={colors.warning} />
          <Text style={styles.preCheckTitle}>Prima di andare al Patronato</Text>
        </View>
        <Text style={styles.preCheckIntro}>Porta con te:</Text>
        {PRE_VISIT_ITEMS.map((item) => (
          <View key={item} style={styles.preCheckRow}>
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={colors.warning}
            />
            <Text style={styles.preCheckText}>{item}</Text>
          </View>
        ))}
      </View>

      {/* CAP search */}
      <Text style={styles.searchLabel}>Trova il Patronato più vicino a te</Text>
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={colors.onSurfaceTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Inserisci CAP o città"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
          testID="patronati-search-input"
          accessibilityLabel="Cerca Patronato per CAP o città"
        />
        {query.length > 0 && (
          <Pressable
            onPress={() => setQuery("")}
            hitSlop={8}
            testID="patronati-search-clear"
            accessibilityLabel="Cancella ricerca"
          >
            <Ionicons
              name="close-circle"
              size={18}
              color={colors.onSurfaceTertiary}
            />
          </Pressable>
        )}
      </View>

      <Text style={styles.listLabel}>
        {query.trim().length === 0
          ? "In evidenza — Sarzana (SP)"
          : `Risultati (${list.length})`}
      </Text>

      {list.length === 0 ? (
        <View style={styles.emptyCard} testID="patronati-empty">
          <Ionicons
            name="information-circle"
            size={18}
            color={colors.onSurfaceTertiary}
          />
          <Text style={styles.emptyText}>
            Nessuna sede trovata. Prova con un CAP o una città diversa.
          </Text>
        </View>
      ) : (
        list.map((p, idx) => {
          const isOpen = expandedId === p.id;
          return (
            <View
              key={p.id}
              style={styles.card}
              testID={`patronato-card-${idx}`}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardIcon}>
                  <Ionicons name="business" size={20} color={colors.brandPrimary} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.cardName} testID={`patronato-name-${idx}`}>
                    {p.name}
                  </Text>
                  <Text style={styles.cardCity}>
                    {p.city} ({p.province}) · {p.cap}
                  </Text>
                </View>
                {p.featured ? (
                  <View style={styles.featuredBadge}>
                    <Ionicons name="star" size={11} color={colors.warning} />
                    <Text style={styles.featuredText}>Sarzana</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.actionsRow}>
                <Pressable
                  onPress={() => call(p.phone)}
                  style={({ pressed }) => [
                    styles.actionBtn,
                    styles.primaryAction,
                    pressed && { opacity: 0.85 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Prenota appuntamento con ${p.name}`}
                  testID={`patronato-book-${idx}`}
                >
                  <Ionicons name="call" size={14} color={colors.onBrandPrimary} />
                  <Text style={styles.primaryActionText}>
                    Prenota Appuntamento
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setExpandedId(isOpen ? null : p.id)}
                  style={({ pressed }) => [
                    styles.actionBtn,
                    styles.secondaryAction,
                    pressed && { opacity: 0.85 },
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: isOpen }}
                  accessibilityLabel={`Mostra indirizzo e contatti di ${p.name}`}
                  testID={`patronato-details-${idx}`}
                >
                  <Ionicons
                    name={isOpen ? "chevron-up" : "chevron-down"}
                    size={14}
                    color={colors.brandPrimary}
                  />
                  <Text style={styles.secondaryActionText}>
                    {isOpen ? "Nascondi contatti" : "Indirizzo e contatti"}
                  </Text>
                </Pressable>
              </View>

              {isOpen && (
                <View
                  style={styles.detailsPanel}
                  testID={`patronato-details-panel-${idx}`}
                >
                  <DetailRow icon="location-outline" text={p.address} />
                  <DetailRow icon="call-outline" text={p.phone} />
                  <DetailRow icon="mail-outline" text={p.email} />
                  <DetailRow icon="time-outline" text={p.hours} />

                  <View style={styles.detailsActions}>
                    <Pressable
                      onPress={() => email(p.email)}
                      style={({ pressed }) => [
                        styles.smallBtn,
                        pressed && { opacity: 0.85 },
                      ]}
                      accessibilityRole="button"
                      testID={`patronato-email-${idx}`}
                    >
                      <Ionicons
                        name="mail"
                        size={13}
                        color={colors.brandPrimary}
                      />
                      <Text style={styles.smallBtnText}>Email</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => openMaps(p)}
                      style={({ pressed }) => [
                        styles.smallBtn,
                        pressed && { opacity: 0.85 },
                      ]}
                      accessibilityRole="button"
                      testID={`patronato-maps-${idx}`}
                    >
                      <Ionicons
                        name="navigate"
                        size={13}
                        color={colors.brandPrimary}
                      />
                      <Text style={styles.smallBtnText}>Mappa</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          );
        })
      )}
    </View>
  );
}

function DetailRow({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={15} color={colors.onSurfaceTertiary} />
      <Text style={styles.detailText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.brandSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.onSurface,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.onSurfaceSecondary,
  },

  preCheck: {
    backgroundColor: "#FFFBEB",
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  preCheckHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  preCheckTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#78350F",
    letterSpacing: 0.2,
  },
  preCheckIntro: {
    fontSize: 12,
    color: "#78350F",
    marginBottom: 4,
  },
  preCheckRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: 2,
  },
  preCheckText: {
    flex: 1,
    fontSize: 13,
    color: "#78350F",
    lineHeight: 18,
    fontWeight: "500",
  },

  searchLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.onSurfaceTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.md,
    minHeight: 52,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.onSurface,
    padding: 0,
    ...Platform.select({ web: { outlineStyle: "none" } as any, default: {} }),
  },

  listLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.onSurfaceTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },

  emptyCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
  },
  emptyText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: colors.onSurfaceSecondary,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.brandSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  cardName: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.onSurface,
    letterSpacing: -0.1,
  },
  cardCity: {
    fontSize: 12,
    color: colors.onSurfaceTertiary,
    marginTop: 2,
  },
  featuredBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  featuredText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.warning,
    letterSpacing: 0.4,
  },

  actionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minHeight: 44,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
  },
  primaryAction: {
    backgroundColor: colors.brandPrimary,
  },
  primaryActionText: {
    color: colors.onBrandPrimary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: -0.1,
  },
  secondaryAction: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.brandPrimary,
  },
  secondaryActionText: {
    color: colors.brandPrimary,
    fontSize: 12,
    fontWeight: "800",
  },

  detailsPanel: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  detailText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: colors.onSurfaceSecondary,
  },
  detailsActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  smallBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.brandSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  smallBtnText: {
    color: colors.brandPrimary,
    fontSize: 12,
    fontWeight: "700",
  },
});
