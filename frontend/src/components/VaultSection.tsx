// Cassaforte Referti — GRATUITA (il pagamento Stripe è stato disattivato su
// richiesta: potrà essere riattivato in futuro; il backend resta pronto).
// Salvataggio del PDF del report e caricamento documenti, tutto persistito.

import { useCallback, useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";

import { colors, radius, spacing, topics } from "@/src/theme";
import { buildReportHtml, Report } from "@/src/lib/reports";
import {
  addVaultFile,
  loadVaultFiles,
  removeVaultFileEntry,
  subscribeVault,
  VaultFile,
} from "@/src/lib/vault";

function toast(msg: string) {
  if (Platform.OS === "android") ToastAndroid.show(msg, ToastAndroid.SHORT);
  else console.log(msg);
}

export function VaultSection({ report }: { report: Report }) {
  const [files, setFiles] = useState<VaultFile[]>([]);

  const loadState = useCallback(async () => {
    setFiles(await loadVaultFiles());
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeVault(setFiles);
    loadState();
    return unsubscribe;
  }, [loadState]);

  const saveReportPdf = async () => {
    const html = buildReportHtml(report);
    const name = `Report_TutelApp_${new Date()
      .toLocaleDateString("it-IT")
      .replace(/\//g, "-")}.pdf`;
    try {
      if (Platform.OS === "web") {
        await Print.printAsync({ html });
        await addVaultFile(name);
        return;
      }
      const { uri } = await Print.printToFileAsync({ html });
      const dest = `${FileSystem.documentDirectory}${Date.now()}_report.pdf`;
      await FileSystem.copyAsync({ from: uri, to: dest });
      await addVaultFile(name, dest);
      toast("PDF salvato in cassaforte");
    } catch (e) {
      console.warn("save pdf failed", e);
      toast("Impossibile salvare il PDF");
    }
  };

  const pickDocument = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (res.canceled || !res.assets?.length) return;
      const asset = res.assets[0];
      let uri = asset.uri;
      if (Platform.OS !== "web") {
        const ext = asset.name?.split(".").pop() || "bin";
        const dest = `${FileSystem.documentDirectory}${Date.now()}_doc.${ext}`;
        await FileSystem.copyAsync({ from: asset.uri, to: dest });
        uri = dest;
      }
      await addVaultFile(asset.name || "Documento", uri);
      toast("Documento aggiunto");
    } catch (e) {
      console.warn("pick failed", e);
      toast("Impossibile caricare il documento");
    }
  };

  const openFile = async (f: VaultFile) => {
    if (!f.uri) {
      toast("Anteprima non disponibile");
      return;
    }
    try {
      if (Platform.OS === "web") {
        window.open(f.uri, "_blank");
        return;
      }
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) await Sharing.shareAsync(f.uri);
    } catch (e) {
      console.warn("open failed", e);
    }
  };

  const removeFile = async (f: VaultFile) => {
    if (f.uri && Platform.OS !== "web") {
      FileSystem.deleteAsync(f.uri, { idempotent: true }).catch(() => {});
    }
    await removeVaultFileEntry(f.id);
  };

  return (
    <View style={styles.card} testID="vault-card">
      <View style={styles.header}>
        <View style={styles.icon}>
          <Ionicons name="lock-open" size={22} color={topics.patronato.main} />
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Inclusa</Text>
        </View>
      </View>
      <Text style={styles.title}>
        Conserva tutti i referti in un unico posto
      </Text>
      <Text style={styles.body}>
        Salva il PDF del report, carica foto e documenti di analisi, TAC e
        verbali INPS: sempre pronti da mostrare alla Commissione Medica.
      </Text>

      <View style={styles.unlockedBox} testID="vault-unlocked">
          <View style={styles.actionsRow}>
            <Pressable
              onPress={saveReportPdf}
              style={({ pressed }) => [
                styles.actionBtn,
                pressed && { opacity: 0.85 },
              ]}
              accessibilityRole="button"
              testID="vault-save-report-btn"
            >
              <Ionicons name="document-text" size={15} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>Salva report PDF</Text>
            </Pressable>
            <Pressable
              onPress={pickDocument}
              style={({ pressed }) => [
                styles.actionBtnAlt,
                pressed && { opacity: 0.85 },
              ]}
              accessibilityRole="button"
              testID="vault-upload-btn"
            >
              <Ionicons
                name="cloud-upload"
                size={15}
                color={topics.patronato.main}
              />
              <Text style={styles.actionBtnAltText}>Carica documento</Text>
            </Pressable>
          </View>
          {files.length === 0 ? (
            <Text style={styles.emptyText}>
              La cassaforte è vuota: salva il report o carica il primo
              documento.
            </Text>
          ) : (
            files.map((f, i) => (
              <View key={f.id} style={styles.fileRow} testID={`vault-file-${i}`}>
                <Ionicons
                  name="document-attach"
                  size={16}
                  color={topics.patronato.main}
                />
                <Pressable style={styles.flex} onPress={() => openFile(f)}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {f.name}
                  </Text>
                  <Text style={styles.fileDate}>
                    {new Date(f.date).toLocaleDateString("it-IT")}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => removeFile(f)}
                  hitSlop={8}
                  accessibilityLabel={`Elimina ${f.name}`}
                  testID={`vault-file-delete-${i}`}
                >
                  <Ionicons
                    name="trash-outline"
                    size={17}
                    color={colors.onSurfaceTertiary}
                  />
                </Pressable>
              </View>
            ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    borderLeftColor: topics.patronato.main,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: topics.patronato.soft,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    backgroundColor: colors.successSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.success,
  },
  title: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.onSurface,
    marginBottom: 4,
  },
  body: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.onSurfaceSecondary,
    marginBottom: spacing.md,
  },

  unlockedBox: {
    gap: spacing.sm,
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: topics.patronato.main,
    minHeight: 46,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  actionBtnAlt: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: topics.patronato.soft,
    minHeight: 46,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
  },
  actionBtnAltText: {
    color: topics.patronato.main,
    fontSize: 12,
    fontWeight: "800",
  },
  emptyText: {
    fontSize: 12,
    color: colors.onSurfaceTertiary,
    fontStyle: "italic",
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  fileName: {
    fontSize: 12,
    color: colors.onSurface,
    fontWeight: "700",
  },
  fileDate: {
    fontSize: 10,
    color: colors.onSurfaceTertiary,
    marginTop: 1,
  },
});
