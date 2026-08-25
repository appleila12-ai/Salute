// Pagina di ritorno dal checkout Stripe (web): verifica il pagamento
// e sblocca la Cassaforte Referti.

import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { colors, radius, spacing } from "@/src/theme";
import { storage } from "@/src/utils/storage";
import { getPaymentStatus } from "@/src/lib/payments";
import { unlockVault, VAULT_PENDING_KEY } from "@/src/lib/vault";

type State = "checking" | "paid" | "failed" | "timeout";

export default function PaymentSuccess() {
  const { session_id } = useLocalSearchParams<{ session_id?: string }>();
  const router = useRouter();
  const [state, setState] = useState<State>("checking");
  const attempts = useRef(0);

  useEffect(() => {
    if (!session_id) {
      setState("failed");
      return;
    }
    let cancelled = false;
    const timer = setInterval(async () => {
      attempts.current += 1;
      try {
        const s = await getPaymentStatus(session_id);
        if (cancelled) return;
        if (s.paymentStatus === "paid") {
          clearInterval(timer);
          await unlockVault();
          setState("paid");
          return;
        }
        if (s.status === "expired") {
          clearInterval(timer);
          await storage.removeItem(VAULT_PENDING_KEY);
          setState("failed");
          return;
        }
      } catch {
        /* retry */
      }
      if (attempts.current >= 12) {
        clearInterval(timer);
        setState("timeout");
      }
    }, 2000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [session_id]);

  return (
    <SafeAreaView style={styles.safe} testID="payment-success-screen">
      <View style={styles.centered}>
        {state === "checking" && (
          <>
            <ActivityIndicator size="large" color={colors.brandPrimary} />
            <Text style={styles.title}>Verifica del pagamento…</Text>
            <Text style={styles.body}>
              Un attimo, stiamo confermando la transazione con Stripe.
            </Text>
          </>
        )}
        {state === "paid" && (
          <>
            <View style={styles.iconOk}>
              <Ionicons name="checkmark" size={44} color="#FFFFFF" />
            </View>
            <Text style={styles.title} testID="payment-paid-title">
              Pagamento riuscito!
            </Text>
            <Text style={styles.body}>
              La Cassaforte Referti è sbloccata: ora puoi salvare PDF e
              documenti in un unico posto sicuro.
            </Text>
          </>
        )}
        {(state === "failed" || state === "timeout") && (
          <>
            <View style={styles.iconWarn}>
              <Ionicons name="alert" size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>
              {state === "timeout"
                ? "Verifica in corso"
                : "Pagamento non completato"}
            </Text>
            <Text style={styles.body}>
              {state === "timeout"
                ? "Il pagamento potrebbe richiedere ancora qualche istante. Riapri la pagina dei risultati tra poco: se il pagamento è andato a buon fine la cassaforte si sbloccherà da sola."
                : "Nessun addebito effettuato. Puoi riprovare in qualsiasi momento dalla pagina dei risultati."}
            </Text>
          </>
        )}
        <Pressable
          onPress={() => router.replace("/")}
          style={({ pressed }) => [styles.btn, pressed && { opacity: 0.85 }]}
          accessibilityRole="button"
          testID="payment-back-btn"
        >
          <Text style={styles.btnText}>{"Torna all'app"}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  iconOk: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWarn: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.warning,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.onSurface,
    textAlign: "center",
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.onSurfaceSecondary,
    textAlign: "center",
    maxWidth: 340,
  },
  btn: {
    marginTop: spacing.lg,
    backgroundColor: colors.brandPrimary,
    minHeight: 52,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xxl,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    color: colors.onBrandPrimary,
    fontSize: 15,
    fontWeight: "800",
  },
});
