// Pagina dedicata "Aiuti sul Territorio" — versione grande con banner visivi.

import { useEffect, useState } from "react";
import {
  Image,
  ImageBackground,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";

import { colors, radius, spacing } from "@/src/theme";
import { storage } from "@/src/utils/storage";
import { IMAGES } from "@/src/lib/images";
import {
  buildGuideHtml,
  getHelpCards,
  REGIONAL_PORTALS,
  REGIONE_KEY,
} from "@/src/lib/territorio";
import { addVaultFile, isVaultUnlocked } from "@/src/lib/vault";

function toast(msg: string) {
  if (Platform.OS === "android") ToastAndroid.show(msg, ToastAndroid.SHORT);
  else console.log(msg);
}

export default function Territorio() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [regione, setRegione] = useState("Liguria");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    (async () => {
      const r = await storage.getItem<string>(REGIONE_KEY, "");
      if (r) setRegione(r);
    })();
  }, []);

  const portal = REGIONAL_PORTALS[regione];
  const cards = getHelpCards(regione);

  const downloadGuide = async () => {
    if (downloading) return;
    setDownloading(true);
    const html = buildGuideHtml(regione);
    const guideName = `Guida_Servizi_Sociali_${regione}.pdf`;
    try {
      if (Platform.OS === "web") {
        await Print.printAsync({ html });
        if (await isVaultUnlocked()) {
          await addVaultFile(guideName);
          toast("Guida salvata anche in cassaforte");
        }
        return;
      }
      const { uri } = await Print.printToFileAsync({ html });
      if (await isVaultUnlocked()) {
        const dest = `${FileSystem.documentDirectory}${Date.now()}_guida.pdf`;
        await FileSystem.copyAsync({ from: uri, to: dest });
        await addVaultFile(guideName, dest);
        toast("Guida salvata anche in cassaforte");
      }
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Guida ai Servizi Sociali",
          UTI: "com.adobe.pdf",
        });
      } else {
        toast(`PDF salvato: ${uri}`);
      }
    } catch (e) {
      console.warn("guide pdf failed", e);
      toast("Impossibile generare la guida");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]} testID="territorio-screen">
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.iconBtn}
          hitSlop={12}
          accessibilityLabel="Indietro"
          testID="territorio-back-btn"
        >
          <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Aiuti sul Territorio</Text>
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
        {/* Hero banner */}
        <ImageBackground
          source={{ uri: IMAGES.territorio }}
          style={styles.hero}
          imageStyle={styles.heroImage}
        >
          <View style={styles.heroOverlay} />
          <Text style={styles.heroTitle}>
            Assistenza, Trasporti e Fisioterapia
          </Text>
          <Text style={styles.heroSub}>
            I servizi concreti vicino a casa tua, spiegati passo dopo passo.
          </Text>
        </ImageBackground>

        {/* Banner regionale */}
        <View style={styles.regionBanner} testID="territorio-region">
          <Ionicons name="location" size={18} color={colors.brandPrimaryDark} />
          <View style={styles.flex}>
            <Text style={styles.regionBannerTitle}>
              Servizi per la tua regione: {regione}
            </Text>
            {portal && (
              <Pressable
                onPress={() => Linking.openURL(portal.url).catch(() => {})}
                hitSlop={6}
                testID="territorio-portal-link"
              >
                <Text style={styles.regionBannerLink}>{portal.label} ↗</Text>
              </Pressable>
            )}
            <Text style={styles.regionBannerHint}>
              Puoi cambiare regione dalla Home.
            </Text>
          </View>
        </View>

        {/* Schede grandi con banner visivi */}
        {cards.map((c) => (
          <View
            key={c.id}
            style={[styles.card, { borderLeftColor: c.color }]}
            testID={`territorio-card-${c.id}`}
          >
            <Image
              source={{ uri: c.image }}
              style={styles.cardImage}
              resizeMode="cover"
            />
            <View style={styles.cardBody}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardIcon, { backgroundColor: c.soft }]}>
                  <Ionicons name={c.icon} size={22} color={c.color} />
                </View>
                <View style={styles.flex}>
                  <Text style={[styles.cardLabel, { color: c.color }]}>
                    {c.label}
                  </Text>
                  <Text style={styles.cardTitle}>{c.title}</Text>
                </View>
              </View>
              <Text style={styles.cardText}>{c.body}</Text>
              <View style={styles.rows}>
                {c.rows.map((r) => (
                  <View key={r.label} style={styles.row}>
                    <View style={[styles.rowBadge, { backgroundColor: c.soft }]}>
                      <Text style={[styles.rowBadgeText, { color: c.dark }]}>
                        {r.label}
                      </Text>
                    </View>
                    <Text style={styles.rowText}>{r.text}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ))}

        {/* Download guide */}
        <Pressable
          onPress={downloadGuide}
          disabled={downloading}
          style={({ pressed }) => [
            styles.guideBtn,
            downloading && { opacity: 0.7 },
            pressed && { opacity: 0.85 },
          ]}
          accessibilityRole="button"
          testID="territorio-guide-btn"
        >
          <Ionicons
            name="download-outline"
            size={18}
            color={colors.onBrandPrimary}
          />
          <Text style={styles.guideBtnText}>
            {downloading
              ? "Preparazione guida…"
              : "Scarica Guida ai Servizi Sociali del Comune"}
          </Text>
        </Pressable>
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
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },

  hero: {
    height: 150,
    borderRadius: 16,
    overflow: "hidden",
    justifyContent: "flex-end",
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  heroImage: { borderRadius: 16 },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(11,42,72,0.45)",
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  heroSub: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    marginTop: 3,
    lineHeight: 17,
  },

  regionBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.brandSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  regionBannerTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.brandPrimaryDark,
  },
  regionBannerLink: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.brandPrimary,
    marginTop: 3,
    textDecorationLine: "underline",
  },
  regionBannerHint: {
    fontSize: 11,
    color: colors.onSurfaceTertiary,
    marginTop: 3,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    marginBottom: spacing.md,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: 120,
    backgroundColor: colors.surfaceSecondary,
  },
  cardBody: {
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  cardLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.onSurface,
    lineHeight: 20,
    marginTop: 2,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.onSurfaceSecondary,
    marginBottom: spacing.md,
  },
  rows: { gap: spacing.sm },
  row: { gap: 4 },
  rowBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  rowBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  rowText: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.onSurfaceSecondary,
  },

  guideBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.brandPrimary,
    minHeight: 54,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  guideBtnText: {
    color: colors.onBrandPrimary,
    fontSize: 13,
    fontWeight: "800",
  },
});
