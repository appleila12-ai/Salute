// Promemoria scadenza 90 giorni — nessuna data fittizia:
// la scadenza viene calcolata SOLO dalla data reale inserita dall'utente.

import { useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors, radius, spacing, topics } from "@/src/theme";
import { storage } from "@/src/utils/storage";
import { CertOption } from "@/src/lib/reports";

const CERT_DATE_KEY = "salutenav:certDate";
const DEADLINE_DAYS = 90;

function parseItDate(s: string): Date | null {
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const day = parseInt(m[1], 10);
  const month = parseInt(m[2], 10) - 1;
  const year = parseInt(m[3], 10);
  const d = new Date(year, month, day);
  if (
    d.getFullYear() !== year ||
    d.getMonth() !== month ||
    d.getDate() !== day
  )
    return null;
  return d;
}

function formatIt(d: Date): string {
  return d.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function autoSlash(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function DeadlineCard({ cert }: { cert: CertOption }) {
  const [certDateIso, setCertDateIso] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await storage.getItem<string>(CERT_DATE_KEY, "");
      if (saved) setCertDateIso(saved);
    })();
  }, []);

  const save = async () => {
    const d = parseItDate(input);
    if (!d) {
      setInputError("Inserisci una data valida nel formato GG/MM/AAAA");
      return;
    }
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (d.getTime() > today.getTime()) {
      setInputError("La data non può essere nel futuro");
      return;
    }
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    if (d.getTime() < oneYearAgo.getTime()) {
      setInputError("Data troppo vecchia: probabilmente serve un nuovo certificato");
      return;
    }
    const iso = d.toISOString();
    setCertDateIso(iso);
    setInputError(null);
    setEditing(false);
    await storage.setItem(CERT_DATE_KEY, iso);
  };

  const clear = async () => {
    setCertDateIso(null);
    setInput("");
    setEditing(false);
    await storage.removeItem(CERT_DATE_KEY);
  };

  // Deadline computation from the REAL user-entered date
  let deadlineView = null;
  if (certDateIso && !editing) {
    const certDate = new Date(certDateIso);
    const deadline = new Date(certDate);
    deadline.setDate(deadline.getDate() + DEADLINE_DAYS);
    const msLeft = deadline.getTime() - Date.now();
    const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
    const expired = daysLeft < 0;
    const urgent = daysLeft <= 15;

    deadlineView = (
      <View style={styles.deadlineBox} testID="deadline-computed">
        <View
          style={[
            styles.deadlineBadge,
            expired
              ? { backgroundColor: colors.errorSoft }
              : urgent
                ? { backgroundColor: colors.warningSoft }
                : { backgroundColor: colors.successSoft },
          ]}
        >
          <Ionicons
            name={expired ? "close-circle" : urgent ? "alarm" : "checkmark-circle"}
            size={16}
            color={expired ? colors.error : urgent ? colors.accentDark : colors.success}
          />
          <Text
            style={[
              styles.deadlineBadgeText,
              {
                color: expired
                  ? colors.error
                  : urgent
                    ? colors.accentDark
                    : colors.success,
              },
            ]}
            testID="deadline-days-left"
          >
            {expired
              ? "Termine superato"
              : daysLeft === 0
                ? "Scade oggi!"
                : `Mancano ${daysLeft} giorni`}
          </Text>
        </View>
        <Text style={styles.deadlineDetail}>
          Certificato del {formatIt(certDate)} → invia la domanda entro il{" "}
          <Text style={styles.strong}>{formatIt(deadline)}</Text>
        </Text>
        {expired && (
          <Text style={styles.expiredHint}>
            Il certificato è scaduto: chiedi al medico di emetterne uno nuovo
            prima di presentare la domanda.
          </Text>
        )}
        <View style={styles.editRow}>
          <Pressable
            onPress={() => {
              setEditing(true);
              setInput("");
            }}
            hitSlop={8}
            testID="deadline-edit-btn"
          >
            <Text style={styles.linkText}>Modifica data</Text>
          </Pressable>
          <Pressable onPress={clear} hitSlop={8} testID="deadline-clear-btn">
            <Text style={[styles.linkText, { color: colors.error }]}>
              Rimuovi
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card} testID="results-deadline">
      <View style={styles.header}>
        <View style={styles.icon}>
          <Ionicons name="alarm" size={22} color={topics.documenti.main} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.topicLabel}>SCADENZE</Text>
          <Text style={styles.title}>La regola dei 90 giorni</Text>
        </View>
      </View>
      <Text style={styles.body}>
        {"Dal giorno in cui il medico rilascia il Certificato Medico Introduttivo hai "}
        <Text style={styles.strong}>90 giorni</Text>
        {" per inviare la domanda telematica all'INPS."}
      </Text>

      {deadlineView}

      {(!certDateIso || editing) && (
        <View style={styles.inputBlock}>
          <Text style={styles.inputLabel}>
            {cert === "Sì"
              ? "Quando è stato rilasciato il certificato? Calcoliamo la tua scadenza reale."
              : "Quando avrai il certificato, inserisci qui la data di rilascio: calcoleremo la scadenza reale."}
          </Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="GG/MM/AAAA"
              placeholderTextColor={colors.muted}
              value={input}
              onChangeText={(t) => {
                setInput(autoSlash(t));
                setInputError(null);
              }}
              keyboardType="number-pad"
              maxLength={10}
              testID="deadline-date-input"
              accessibilityLabel="Data di rilascio del certificato"
            />
            <Pressable
              onPress={save}
              disabled={input.length < 10}
              style={({ pressed }) => [
                styles.saveBtn,
                input.length < 10 && styles.saveBtnDisabled,
                pressed && { opacity: 0.85 },
              ]}
              accessibilityRole="button"
              testID="deadline-save-btn"
            >
              <Text
                style={[
                  styles.saveBtnText,
                  input.length < 10 && { color: colors.onSurfaceTertiary },
                ]}
              >
                Calcola
              </Text>
            </Pressable>
          </View>
          {inputError && (
            <Text style={styles.errorText} testID="deadline-input-error">
              {inputError}
            </Text>
          )}
          {editing && (
            <Pressable
              onPress={() => setEditing(false)}
              hitSlop={8}
              style={{ marginTop: spacing.sm }}
            >
              <Text style={styles.linkText}>Annulla</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: {
    backgroundColor: "#FFFBEB",
    borderRadius: radius.lg,
    borderLeftWidth: 4,
    borderLeftColor: topics.documenti.main,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  topicLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: topics.documenti.main,
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 15,
    fontWeight: "800",
    color: "#78350F",
    marginTop: 2,
  },
  body: {
    fontSize: 13,
    lineHeight: 19,
    color: "#78350F",
  },
  strong: { fontWeight: "800" },

  deadlineBox: {
    marginTop: spacing.md,
    backgroundColor: "#FFFFFF",
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  deadlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  deadlineBadgeText: {
    fontSize: 13,
    fontWeight: "800",
  },
  deadlineDetail: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.onSurfaceSecondary,
  },
  expiredHint: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.error,
    fontWeight: "600",
  },
  editRow: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  linkText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.brandPrimary,
  },

  inputBlock: {
    marginTop: spacing.md,
  },
  inputLabel: {
    fontSize: 12,
    lineHeight: 17,
    color: "#92400E",
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  inputRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#FDE68A",
    paddingHorizontal: spacing.md,
    minHeight: 48,
    fontSize: 15,
    color: colors.onSurface,
  },
  saveBtn: {
    backgroundColor: topics.documenti.main,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnDisabled: {
    backgroundColor: "#FDE68A",
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  errorText: {
    marginTop: spacing.sm,
    fontSize: 12,
    color: colors.error,
    fontWeight: "600",
  },
});
