import { Linking, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { colors, radius, spacing } from "@/src/theme";
import { PATRONATI } from "@/src/data/patronati";

export default function PatronatoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const call = (phone: string) => {
    const url = `tel:${phone.replace(/\s+/g, "")}`;
    Linking.openURL(url).catch(() => {});
  };

  const openMaps = (name: string, city: string, address: string) => {
    const q = encodeURIComponent(`${name} ${address} ${city}`);
    const url =
      Platform.OS === "ios"
        ? `http://maps.apple.com/?q=${q}`
        : `https://www.google.com/maps/search/?api=1&query=${q}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.safe} testID="patronato-screen">
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.iconBtn}
          hitSlop={12}
          accessibilityLabel="Indietro"
          testID="patronato-back-button"
        >
          <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Patronati vicino a te</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <Ionicons name="information" size={20} color={colors.brandPrimary} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.introTitle}>Assistenza gratuita</Text>
            <Text style={styles.introBody}>
              I patronati inviano gratuitamente la tua pratica INPS e ti
              seguono in eventuali ricorsi.
            </Text>
          </View>
        </View>

        {PATRONATI.map((p, idx) => (
          <View key={p.name} style={styles.card} testID={`patronato-card-${idx}`}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIcon}>
                <Ionicons
                  name="business"
                  size={22}
                  color={colors.brandPrimary}
                />
              </View>
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>{p.name}</Text>
                <Text style={styles.cardCity}>{p.city}</Text>
              </View>
              <View style={styles.distanceBadge}>
                <Ionicons
                  name="location"
                  size={12}
                  color={colors.brandPrimary}
                />
                <Text style={styles.distanceText}>{p.distanceKm} km</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons
                name="location-outline"
                size={16}
                color={colors.onSurfaceTertiary}
              />
              <Text style={styles.infoText}>{p.address}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons
                name="time-outline"
                size={16}
                color={colors.onSurfaceTertiary}
              />
              <Text style={styles.infoText}>{p.hours}</Text>
            </View>

            <View style={styles.actionsRow}>
              <Pressable
                onPress={() => call(p.phone)}
                style={({ pressed }) => [
                  styles.actionBtn,
                  styles.callBtn,
                  pressed && { opacity: 0.85 },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Chiama ${p.name}`}
                testID={`patronato-call-${idx}`}
              >
                <Ionicons name="call" size={16} color={colors.onBrandPrimary} />
                <Text style={styles.callBtnText}>Chiama</Text>
              </Pressable>
              <Pressable
                onPress={() => openMaps(p.name, p.city, p.address)}
                style={({ pressed }) => [
                  styles.actionBtn,
                  styles.mapsBtn,
                  pressed && { opacity: 0.85 },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Apri ${p.name} in mappa`}
                testID={`patronato-maps-${idx}`}
              >
                <Ionicons
                  name="navigate"
                  size={16}
                  color={colors.brandPrimary}
                />
                <Text style={styles.mapsBtnText}>Mappa</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
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

  introCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.brandSecondary,
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
  },
  introIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  introTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.onBrandSecondary,
    marginBottom: 2,
  },
  introBody: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.onBrandSecondary,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.brandSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.onSurface,
  },
  cardCity: {
    fontSize: 13,
    color: colors.onSurfaceTertiary,
    marginTop: 2,
  },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.brandSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  distanceText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.brandPrimary,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    paddingVertical: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: colors.onSurfaceSecondary,
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    minHeight: 44,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
  },
  callBtn: {
    backgroundColor: colors.brandPrimary,
  },
  callBtnText: {
    color: colors.onBrandPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  mapsBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.brandPrimary,
  },
  mapsBtnText: {
    color: colors.brandPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
});
