import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { brand, colors, radius, spacing } from "@/src/theme";
import { storage } from "@/src/utils/storage";
import { useAuth } from "@/src/contexts/AuthContext";
import { useCloudSync } from "@/src/contexts/CloudSyncContext";
import { Logo, Wordmark } from "@/src/components/Brand";

const COFFEE_URL = "https://www.buymeacoffee.com/salutenav";
const REGIONE_KEY = "salutenav:regione";

const REGIONI = [
  "Liguria",
  "Lombardia",
  "Lazio",
  "Campania",
  "Veneto",
  "Piemonte",
  "Emilia-Romagna",
  "Toscana",
  "Sicilia",
  "Puglia",
];

const STEPS = [
  { num: 1, label: "Diagnosi", color: "#2A75D3", soft: "#E6F0FB" },
  { num: 2, label: "Lavoro", color: "#EA580C", soft: "#FFEDD5" },
  { num: 3, label: "Documenti", color: "#B45309", soft: "#FEF3C7" },
  { num: 4, label: "Patronato", color: "#DB2777", soft: "#FCE7F3" },
];

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { status, user, signIn, signOut, signingIn, error } = useAuth();
  const { state: syncState } = useCloudSync();

  const [regione, setRegione] = useState("Liguria");
  const [regionOpen, setRegionOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const r = await storage.getItem<string>(REGIONE_KEY, "");
      if (r) setRegione(r);
    })();
  }, []);

  const openCoffee = () => {
    Linking.openURL(COFFEE_URL).catch(() => {});
  };

  const pickRegion = (r: string) => {
    setRegione(r);
    storage.setItem(REGIONE_KEY, r);
    setRegionOpen(false);
  };

  const initials = (u: { name?: string; email: string }) => {
    const src = (u.name?.trim() || u.email || "").trim();
    if (!src) return "?";
    const parts = src.split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return src.slice(0, 2).toUpperCase();
  };

  const isAuth = status === "authenticated" && user;

  const syncBadge = () => {
    if (!isAuth) return null;
    if (syncState === "syncing")
      return (
        <View style={styles.syncBadge}>
          <ActivityIndicator size={9} color={colors.brandPrimary} />
          <Text style={styles.syncBadgeText}>Sync…</Text>
        </View>
      );
    if (syncState === "ok")
      return (
        <View style={styles.syncBadgeOk}>
          <Ionicons name="cloud-done" size={10} color="#16A34A" />
          <Text style={styles.syncBadgeTextOk}>Cloud</Text>
        </View>
      );
    if (syncState === "error")
      return (
        <View style={styles.syncBadgeErr}>
          <Ionicons name="cloud-offline" size={10} color="#B45309" />
          <Text style={styles.syncBadgeTextErr}>Offline</Text>
        </View>
      );
    return null;
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.container}>
        {/* Top bar: brand wordmark + region + login/user */}
        <View style={styles.topBar} testID="home-topbar">
          <Wordmark size="sm" showLogo={true} logoVariant="soft" />
          <View style={styles.topRight}>
            <Pressable
              onPress={() => setRegionOpen(true)}
              style={({ pressed }) => [
                styles.regionPill,
                pressed && { opacity: 0.85 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Scegli regione"
              testID="home-region-pill"
            >
              <Ionicons name="location" size={12} color={colors.brandPrimary} />
              <Text style={styles.regionText}>{regione}</Text>
              <Ionicons name="chevron-down" size={11} color={colors.brandPrimary} />
            </Pressable>

            {status === "loading" ? (
              <ActivityIndicator size="small" color={colors.brandPrimary} />
            ) : isAuth ? (
              <View style={styles.userRow}>
                {syncBadge()}
                <Pressable
                  onPress={() => setUserMenuOpen(true)}
                  style={({ pressed }) => [
                    styles.avatar,
                    pressed && { opacity: 0.8 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Menu utente"
                  testID="home-user-avatar"
                >
                  <Text style={styles.avatarText}>{initials(user!)}</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={signIn}
                disabled={signingIn}
                style={({ pressed }) => [
                  styles.loginBtn,
                  (pressed || signingIn) && { opacity: 0.75 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Accedi con Google"
                testID="home-login-google"
              >
                {signingIn ? (
                  <ActivityIndicator size={12} color={colors.onSurfaceSecondary} />
                ) : (
                  <Ionicons
                    name="logo-google"
                    size={12}
                    color={colors.onSurfaceSecondary}
                  />
                )}
                <Text style={styles.loginBtnText}>
                  {signingIn ? "Accesso…" : "Accedi"}
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {error && !isAuth ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={13} color="#B91C1C" />
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        ) : null}

        {/* Hero */}
        <View style={styles.hero}>
          <Logo size={84} variant="solid" style={{ marginBottom: spacing.lg }} />
          <Text style={styles.title} testID="home-title">
            {brand.name}
          </Text>
          <Text style={styles.subtitle}>
            {brand.tagline}
          </Text>
        </View>

        <View style={styles.descBox}>
          <Text style={styles.descText}>
            Un percorso semplice in 4 passi per capire quali tutele, permessi
            ed esenzioni ti spettano dopo una diagnosi.
          </Text>
        </View>

        {/* Region — ben visibile e modificabile */}
        <Pressable
          onPress={() => setRegionOpen(true)}
          style={({ pressed }) => [
            styles.regionCard,
            pressed && { opacity: 0.9 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`La tua regione: ${regione}. Tocca per cambiare`}
          testID="home-region-card"
        >
          <View style={styles.regionCardIcon}>
            <Ionicons name="location" size={22} color={colors.brandPrimary} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.regionCardLabel}>LA TUA REGIONE</Text>
            <Text style={styles.regionCardValue} testID="home-region-value">
              {regione}
            </Text>
          </View>
          <View style={styles.regionCardCta}>
            <Text style={styles.regionCardCtaText}>Cambia</Text>
            <Ionicons name="chevron-down" size={14} color={colors.brandPrimary} />
          </View>
        </Pressable>

        <Pressable
          onPress={() => router.push("/valutazione")}
          style={({ pressed }) => [
            styles.startBtn,
            pressed && { opacity: 0.9 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Inizia il percorso"
          testID="home-start-btn"
        >
          <Text style={styles.startBtnText}>Inizia il percorso</Text>
          <Ionicons name="arrow-forward" size={22} color={colors.onBrandPrimary} />
        </Pressable>

        {/* 4-step indicator — un colore per argomento */}
        <View style={styles.stepsRow} testID="home-steps">
          {STEPS.map((s, i) => (
            <View key={s.num} style={styles.stepGroup}>
              <View style={styles.stepIndicator}>
                <View
                  style={[styles.stepBadge, { backgroundColor: s.soft }]}
                >
                  <Text style={[styles.stepBadgeText, { color: s.color }]}>
                    {s.num}
                  </Text>
                </View>
                <Text style={styles.stepLabel}>{s.label}</Text>
              </View>
              {i < STEPS.length - 1 && <View style={styles.stepSep} />}
            </View>
          ))}
        </View>

        <View style={styles.spacer} />

        {/* Coffee box */}
        <View
          style={[
            styles.supportBox,
            { marginBottom: insets.bottom > 0 ? 0 : spacing.md },
          ]}
          testID="home-support-box"
        >
          <View style={styles.supportRow}>
            <Text style={styles.supportEmoji}>☕</Text>
            <View style={styles.flex}>
              <Text style={styles.supportTitle}>App 100% gratuita</Text>
              <Text style={styles.supportBody}>
                Se vuoi aiutarci a coprire i costi dei server, offrici un caffè.
              </Text>
            </View>
            <Pressable
              onPress={openCoffee}
              style={({ pressed }) => [
                styles.coffeeBtn,
                pressed && { opacity: 0.85 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Offrimi un caffè"
              testID="home-coffee-btn"
            >
              <Text style={styles.coffeeBtnText}>€3</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Region modal */}
      <Modal
        visible={regionOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setRegionOpen(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setRegionOpen(false)}
        >
          <Pressable
            style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Scegli la regione</Text>
            {REGIONI.map((r) => {
              const isSel = r === regione;
              return (
                <Pressable
                  key={r}
                  onPress={() => pickRegion(r)}
                  style={({ pressed }) => [
                    styles.sheetItem,
                    pressed && { opacity: 0.7 },
                  ]}
                  testID={`region-option-${r}`}
                >
                  <Text
                    style={[
                      styles.sheetItemText,
                      isSel && styles.sheetItemTextSelected,
                    ]}
                  >
                    {r}
                  </Text>
                  {isSel && (
                    <Ionicons name="checkmark" size={20} color={colors.brandPrimary} />
                  )}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>

      {/* User menu modal */}
      <Modal
        visible={userMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setUserMenuOpen(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setUserMenuOpen(false)}
        >
          <Pressable
            style={[
              styles.sheet,
              { paddingBottom: insets.bottom + spacing.lg },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.sheetHandle} />
            {isAuth && (
              <View style={styles.userCard} testID="home-user-card">
                <View style={styles.avatarLg}>
                  <Text style={styles.avatarLgText}>{initials(user!)}</Text>
                </View>
                <View style={styles.flex}>
                  {user?.name ? (
                    <Text style={styles.userName} numberOfLines={1}>
                      {user.name}
                    </Text>
                  ) : null}
                  <Text style={styles.userEmail} numberOfLines={1}>
                    {user?.email}
                  </Text>
                  <View style={styles.syncInlineRow}>
                    <Ionicons
                      name={
                        syncState === "syncing"
                          ? "sync"
                          : syncState === "error"
                          ? "cloud-offline"
                          : "cloud-done"
                      }
                      size={11}
                      color={colors.onSurfaceTertiary}
                    />
                    <Text style={styles.syncInlineText}>
                      {syncState === "syncing"
                        ? "Sincronizzazione…"
                        : syncState === "error"
                        ? "Sync in attesa"
                        : "Cloud sync attivo"}
                    </Text>
                  </View>
                </View>
              </View>
            )}
            <Pressable
              onPress={async () => {
                setUserMenuOpen(false);
                await signOut();
              }}
              style={({ pressed }) => [
                styles.logoutBtn,
                pressed && { opacity: 0.75 },
              ]}
              testID="home-logout-btn"
            >
              <Ionicons name="log-out-outline" size={18} color="#B91C1C" />
              <Text style={styles.logoutText}>Esci</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    alignItems: "stretch",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
    minHeight: 36,
  },
  topRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  regionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.brandSecondary,
    borderWidth: 1,
    borderColor: "rgba(42,117,211,0.18)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  regionText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.brandPrimary,
    letterSpacing: 0.2,
  },
  loginBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.divider,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  loginBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.onSurfaceSecondary,
    letterSpacing: 0.2,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.onBrandPrimary,
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 0.4,
  },
  syncBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSecondary,
  },
  syncBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.brandPrimary,
  },
  syncBadgeOk: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: "#DCFCE7",
  },
  syncBadgeTextOk: {
    fontSize: 9,
    fontWeight: "700",
    color: "#16A34A",
  },
  syncBadgeErr: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: "#FEF3C7",
  },
  syncBadgeTextErr: {
    fontSize: 9,
    fontWeight: "700",
    color: "#B45309",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEE2E2",
    borderRadius: radius.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: spacing.sm,
  },
  errorBannerText: {
    fontSize: 11,
    color: "#B91C1C",
    fontWeight: "600",
  },

  hero: {
    alignItems: "center",
    marginTop: spacing.lg,
  },
  regionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.brandSecondary,
    borderWidth: 1.5,
    borderColor: "rgba(42,117,211,0.22)",
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  regionCardIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  regionCardLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.brandPrimary,
    letterSpacing: 1.1,
  },
  regionCardValue: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.onBrandSecondary,
    marginTop: 1,
    letterSpacing: -0.3,
  },
  regionCardCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  regionCardCtaText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.brandPrimary,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.onSurface,
    textAlign: "center",
    letterSpacing: -0.6,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    color: colors.onSurfaceSecondary,
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "500",
    paddingHorizontal: spacing.md,
  },
  descBox: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  descText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    color: colors.onSurfaceTertiary,
  },

  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.brandPrimary,
    minHeight: 60,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.xl,
  },
  startBtnText: {
    color: colors.onBrandPrimary,
    fontSize: 16,
    fontWeight: "800",
  },

  stepsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  stepGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepIndicator: {
    alignItems: "center",
    gap: 4,
    width: 60,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.borderStrong,
  },
  stepLabel: {
    fontSize: 10,
    color: colors.onSurfaceTertiary,
    fontWeight: "600",
  },
  stepSep: {
    width: 12,
    height: 1.5,
    backgroundColor: colors.border,
    marginBottom: 14,
  },

  spacer: { flex: 1 },

  supportBox: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  supportRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  supportEmoji: { fontSize: 24 },
  supportTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.onSurface,
  },
  supportBody: {
    fontSize: 11,
    color: colors.onSurfaceTertiary,
    lineHeight: 16,
    marginTop: 2,
  },
  coffeeBtn: {
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  coffeeBtnText: {
    color: colors.onBrandPrimary,
    fontWeight: "800",
    fontSize: 13,
  },

  // Modals
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(11,42,72,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceTertiary,
    alignSelf: "center",
    marginBottom: spacing.md,
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  sheetItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  sheetItemText: {
    fontSize: 15,
    color: colors.onSurfaceSecondary,
    fontWeight: "600",
  },
  sheetItemTextSelected: {
    color: colors.brandPrimary,
    fontWeight: "800",
  },

  // User card
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    marginBottom: spacing.sm,
  },
  avatarLg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLgText: {
    color: colors.onBrandPrimary,
    fontWeight: "800",
    fontSize: 16,
  },
  userName: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.onSurface,
  },
  userEmail: {
    fontSize: 12,
    color: colors.onSurfaceTertiary,
    marginTop: 2,
  },
  syncInlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  syncInlineText: {
    fontSize: 10,
    color: colors.onSurfaceTertiary,
    fontWeight: "600",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "#FEF2F2",
    marginTop: spacing.sm,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#B91C1C",
  },
});
