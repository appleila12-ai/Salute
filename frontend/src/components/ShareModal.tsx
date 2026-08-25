// Modal di condivisione report (QR + link famiglia/caregiver).

import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";

import { colors, radius, spacing } from "@/src/theme";

interface Props {
  visible: boolean;
  onClose: () => void;
  shareUrl: string | null;
  qrUrl: string | null;
}

function toast(msg: string) {
  if (Platform.OS === "android") ToastAndroid.show(msg, ToastAndroid.SHORT);
  else console.log(msg);
}

export function ShareModal({ visible, onClose, shareUrl, qrUrl }: Props) {
  const handleCopyLink = async () => {
    if (!shareUrl) return;
    await Clipboard.setStringAsync(shareUrl);
    toast("Link copiato");
  };

  const handleShareLink = async () => {
    if (!shareUrl) return;
    try {
      await Share.share({
        message: `Ecco il mio report TutelApp: ${shareUrl}`,
        url: shareUrl,
      });
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.shareCard} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.shareTitle}>Condividi con la famiglia</Text>
          <Text style={styles.shareSub}>
            Un familiare o caregiver può leggere il report inquadrando questo
            codice, senza dover ripetere le domande.
          </Text>
          {qrUrl ? (
            <Image
              source={{ uri: qrUrl }}
              style={styles.qrImage}
              resizeMode="contain"
              testID="share-qr"
            />
          ) : (
            <View style={styles.qrPlaceholder}>
              <ActivityIndicator color={colors.brandPrimary} />
            </View>
          )}
          {shareUrl ? (
            <Text style={styles.shareUrl} selectable numberOfLines={2}>
              {shareUrl}
            </Text>
          ) : null}
          <View style={styles.shareActions}>
            <Pressable
              onPress={handleCopyLink}
              style={({ pressed }) => [
                styles.secondaryBtn,
                pressed && { opacity: 0.85 },
              ]}
              testID="share-copy-btn"
            >
              <Ionicons
                name="copy-outline"
                size={16}
                color={colors.brandPrimary}
              />
              <Text style={styles.secondaryBtnText}>Copia link</Text>
            </Pressable>
            <Pressable
              onPress={handleShareLink}
              style={({ pressed }) => [
                styles.primaryBtn,
                pressed && { opacity: 0.85 },
              ]}
              testID="share-share-btn"
            >
              <Ionicons
                name="share-outline"
                size={16}
                color={colors.onBrandPrimary}
              />
              <Text style={styles.primaryBtnText}>Condividi</Text>
            </Pressable>
          </View>
          <Pressable onPress={onClose} style={styles.shareClose} testID="share-close-btn">
            <Text style={styles.shareCloseText}>Chiudi</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(11,42,72,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  shareCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: "center",
  },
  shareTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.onSurface,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  shareSub: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.onSurfaceTertiary,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  qrImage: {
    width: 220,
    height: 220,
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
  },
  qrPlaceholder: {
    width: 220,
    height: 220,
    marginBottom: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
  },
  shareUrl: {
    fontSize: 11,
    color: colors.onSurfaceTertiary,
    textAlign: "center",
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  shareActions: {
    flexDirection: "row",
    gap: spacing.sm,
    alignSelf: "stretch",
    marginBottom: spacing.md,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.brandPrimary,
    minHeight: 52,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
  },
  primaryBtnText: {
    color: colors.onBrandPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.brandPrimary,
    minHeight: 52,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
  },
  secondaryBtnText: {
    color: colors.brandPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  shareClose: {
    paddingVertical: spacing.sm,
  },
  shareCloseText: {
    color: colors.onSurfaceTertiary,
    fontSize: 14,
    fontWeight: "600",
  },
});
