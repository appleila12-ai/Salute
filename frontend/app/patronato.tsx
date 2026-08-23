import { useEffect, useMemo, useState } from "react";
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Contacts from "expo-contacts";
import { useRouter } from "expo-router";

import { colors, radius, spacing } from "@/src/theme";
import { useI18n } from "@/src/lib/i18n";
import {
  estimateDistanceKm,
  Patronato,
  PATRONATI,
  sortByCapProximity,
} from "@/src/data/patronati";
import { storage } from "@/src/utils/storage";

const CAP_KEY = "salutenav:usercap";

function toast(msg: string) {
  if (Platform.OS === "android") {
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  } else {
    console.log(msg);
  }
}

async function saveContact(p: Patronato, onFail: () => void, onOk: () => void) {
  if (Platform.OS === "web") {
    // Web: download a vCard
    const vcf = buildVCard(p);
    try {
      const blob = new Blob([vcf], { type: "text/vcard" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${p.name.replace(/\s+/g, "_")}.vcf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      onOk();
    } catch (e) {
      console.warn("vcard download failed", e);
      onFail();
    }
    return;
  }
  try {
    const perm = await Contacts.requestPermissionsAsync();
    if (perm.status !== "granted") {
      onFail();
      return;
    }
    const contact: Contacts.Contact = {
      [Contacts.Fields.FirstName]: p.name,
      [Contacts.Fields.Company]: p.name,
      [Contacts.Fields.JobTitle]: "Patronato",
      contactType: Contacts.ContactTypes.Company,
      name: p.name,
      phoneNumbers: [
        {
          label: "work",
          number: p.phone,
          isPrimary: true,
        },
      ],
      emails: [{ label: "work", email: p.email, isPrimary: true }],
      addresses: [
        {
          label: "work",
          street: p.address,
          city: p.city,
          postalCode: p.cap,
          country: "Italia",
        },
      ],
    } as any;
    await Contacts.addContactAsync(contact);
    onOk();
  } catch (e) {
    console.warn("saveContact failed", e);
    onFail();
  }
}

function buildVCard(p: Patronato): string {
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${p.name} - ${p.city}`,
    `ORG:${p.name}`,
    `TEL;TYPE=WORK,VOICE:${p.phone}`,
    `EMAIL;TYPE=WORK:${p.email}`,
    `ADR;TYPE=WORK:;;${p.address};${p.city};;${p.cap};IT`,
    "END:VCARD",
  ].join("\r\n");
}

export default function PatronatoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();

  const [userCap, setUserCap] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const stored = await storage.getItem<string>(CAP_KEY, "");
      if (stored) setUserCap(stored);
    })();
  }, []);

  const handleCapChange = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 5);
    setUserCap(digits);
    if (digits.length === 5 || digits.length === 0) {
      storage.setItem(CAP_KEY, digits);
    }
  };

  const list = useMemo(() => {
    if (userCap.length < 5) return PATRONATI;
    return sortByCapProximity(PATRONATI, userCap).slice(0, 5);
  }, [userCap]);

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
          accessibilityLabel={t("common.back")}
          testID="patronato-back-button"
        >
          <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("pat.title")}</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <Ionicons name="information" size={20} color={colors.brandPrimary} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.introTitle}>{t("pat.introTitle")}</Text>
            <Text style={styles.introBody}>{t("pat.introBody")}</Text>
          </View>
        </View>

        {/* CAP search */}
        <View style={styles.capField} testID="patronato-cap-field">
          <Text style={styles.label}>{t("pat.capLabel")}</Text>
          <View
            style={[
              styles.capInputWrap,
              userCap.length === 5 && styles.capInputFilled,
            ]}
          >
            <Ionicons name="location-outline" size={20} color={colors.brandPrimary} />
            <TextInput
              style={styles.capInput}
              placeholder={t("pat.capPh")}
              placeholderTextColor={colors.muted}
              keyboardType="number-pad"
              maxLength={5}
              value={userCap}
              onChangeText={handleCapChange}
              testID="patronato-cap-input"
              accessibilityLabel={t("pat.capLabel")}
            />
            {userCap.length > 0 && (
              <Pressable
                onPress={() => {
                  setUserCap("");
                  storage.setItem(CAP_KEY, "");
                }}
                hitSlop={8}
                testID="patronato-cap-clear"
                accessibilityLabel={t("home.searchClear")}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={colors.onSurfaceTertiary}
                />
              </Pressable>
            )}
          </View>
          <Text style={styles.capHelp}>{t("pat.capHelp")}</Text>
        </View>

        {list.length === 0 ? (
          <View style={styles.emptyCard} testID="patronato-empty">
            <Ionicons
              name="sad-outline"
              size={22}
              color={colors.onSurfaceTertiary}
            />
            <Text style={styles.emptyText}>{t("pat.noResults")}</Text>
          </View>
        ) : (
          list.map((p, idx) => {
            const distance =
              userCap.length === 5 ? estimateDistanceKm(p.cap, userCap) : null;
            const isSaved = savedId === p.id;
            return (
              <View
                key={p.id}
                style={styles.card}
                testID={`patronato-card-${idx}`}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardIcon}>
                    <Ionicons name="business" size={22} color={colors.brandPrimary} />
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.cardTitle}>{p.name}</Text>
                    <Text style={styles.cardCity}>
                      {p.city} · {p.cap}
                    </Text>
                  </View>
                  {distance !== null && (
                    <View style={styles.distanceBadge}>
                      <Ionicons
                        name="location"
                        size={12}
                        color={colors.brandPrimary}
                      />
                      <Text style={styles.distanceText}>{distance} km</Text>
                    </View>
                  )}
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
                    name="mail-outline"
                    size={16}
                    color={colors.onSurfaceTertiary}
                  />
                  <Text style={styles.infoText}>{p.email}</Text>
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
                    accessibilityLabel={`${t("pat.call")} ${p.name}`}
                    testID={`patronato-call-${idx}`}
                  >
                    <Ionicons name="call" size={16} color={colors.onBrandPrimary} />
                    <Text style={styles.callBtnText}>{t("pat.call")}</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => openMaps(p.name, p.city, p.address)}
                    style={({ pressed }) => [
                      styles.actionBtn,
                      styles.mapsBtn,
                      pressed && { opacity: 0.85 },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`${t("pat.map")} ${p.name}`}
                    testID={`patronato-maps-${idx}`}
                  >
                    <Ionicons
                      name="navigate"
                      size={16}
                      color={colors.brandPrimary}
                    />
                    <Text style={styles.mapsBtnText}>{t("pat.map")}</Text>
                  </Pressable>
                </View>

                <Pressable
                  onPress={() =>
                    saveContact(
                      p,
                      () => toast(t("pat.saveFail")),
                      () => {
                        setSavedId(p.id);
                        toast(t("pat.saved"));
                      },
                    )
                  }
                  style={({ pressed }) => [
                    styles.saveContactBtn,
                    isSaved && styles.saveContactBtnSaved,
                    pressed && { opacity: 0.85 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={t("pat.saveContact")}
                  testID={`patronato-save-${idx}`}
                >
                  <Ionicons
                    name={isSaved ? "checkmark-circle" : "person-add-outline"}
                    size={18}
                    color={isSaved ? colors.success : colors.brandPrimary}
                  />
                  <Text
                    style={[
                      styles.saveContactText,
                      isSaved && styles.saveContactTextSaved,
                    ]}
                  >
                    {isSaved ? t("pat.saved") : t("pat.saveContact")}
                  </Text>
                </Pressable>
              </View>
            );
          })
        )}

        {Platform.OS === "web" ? (
          <Text style={styles.webNote}>{t("pat.webSaveHint")}</Text>
        ) : null}
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

  capField: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  capInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    minHeight: 56,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  capInputFilled: {
    borderColor: colors.brandPrimary,
    backgroundColor: colors.surface,
  },
  capInput: {
    flex: 1,
    fontSize: 16,
    color: colors.onSurface,
    padding: 0,
    ...Platform.select({ web: { outlineStyle: "none" } as any, default: {} }),
  },
  capHelp: {
    fontSize: 12,
    color: colors.onSurfaceTertiary,
    marginTop: spacing.sm,
  },

  emptyCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.lg,
    borderRadius: radius.lg,
  },
  emptyText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: colors.onSurfaceSecondary,
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
  saveContactBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    minHeight: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSecondary,
    marginTop: spacing.sm,
  },
  saveContactBtnSaved: {
    backgroundColor: "#DCFCE7",
  },
  saveContactText: {
    color: colors.brandPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  saveContactTextSaved: {
    color: colors.success,
  },
  webNote: {
    fontSize: 12,
    color: colors.onSurfaceTertiary,
    textAlign: "center",
    marginTop: spacing.md,
    fontStyle: "italic",
  },
});
