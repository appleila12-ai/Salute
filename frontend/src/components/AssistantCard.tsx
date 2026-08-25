// Assistente AI — card domande sulla Legge 104 / Invalidità Civile.

import { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors, radius, spacing } from "@/src/theme";
import { Answers, askAssistant } from "@/src/lib/reports";

const SUGGESTIONS_WORKER = [
  "Mio padre vive in un'altra regione, ho diritto ai permessi?",
  "Posso rifiutare il trasferimento di sede?",
  "Come si richiede il congedo straordinario di 2 anni?",
  "Che percentuale di invalidità serve per l'accompagnamento?",
];

const SUGGESTIONS_NO_WORK = [
  "Quali aiuti economici spettano con l'invalidità civile?",
  "Come funziona l'indennità di accompagnamento?",
  "Che percentuale serve per l'esenzione del ticket?",
  "Sono pensionato: cosa cambia per me?",
];

export function AssistantCard({ answers }: { answers: Answers }) {
  const [question, setQuestion] = useState("");
  const [askLoading, setAskLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);

  const suggestions =
    answers.work === "Inoccupato/Pensionato"
      ? SUGGESTIONS_NO_WORK
      : SUGGESTIONS_WORKER;

  const handleAsk = async (q: string) => {
    const finalQ = q.trim();
    if (!finalQ || askLoading) return;
    setAskLoading(true);
    setAnswer(null);
    try {
      const a = await askAssistant(finalQ, answers);
      setAnswer(a);
    } catch (e) {
      console.warn(e);
      setAnswer(
        "Al momento non riesco a rispondere. Riprova tra qualche minuto o contatta un patronato.",
      );
    } finally {
      setAskLoading(false);
    }
  };

  return (
    <View style={styles.aiCard} testID="results-assistant">
      <View style={styles.aiHeader}>
        <View style={styles.aiHeaderIcon}>
          <Ionicons name="chatbubbles" size={22} color={colors.brandPrimary} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.aiTitle}>Fai una domanda alla Legge 104</Text>
          <Text style={styles.aiSub}>
            Risposta immediata basata sulla normativa vigente.
          </Text>
        </View>
      </View>

      <View style={styles.aiInputWrap}>
        <TextInput
          style={styles.aiInput}
          placeholder="Scrivi la tua domanda…"
          placeholderTextColor={colors.muted}
          value={question}
          onChangeText={setQuestion}
          multiline
          testID="assistant-input"
          accessibilityLabel="Domanda per l'assistente"
        />
      </View>

      <Text style={styles.aiSuggLabel}>Suggerimenti veloci</Text>
      <View style={styles.aiSuggs}>
        {suggestions.map((s, idx) => (
          <Pressable
            key={s}
            onPress={() => {
              setQuestion(s);
              handleAsk(s);
            }}
            style={({ pressed }) => [
              styles.aiSuggChip,
              pressed && { opacity: 0.85 },
            ]}
            testID={`assistant-suggestion-${idx}`}
          >
            <Text style={styles.aiSuggText} numberOfLines={2}>
              {s}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={() => handleAsk(question)}
        disabled={askLoading || question.trim().length === 0}
        style={({ pressed }) => [
          styles.aiAskBtn,
          (askLoading || question.trim().length === 0) &&
            styles.aiAskBtnDisabled,
          pressed && !askLoading && { opacity: 0.85 },
        ]}
        accessibilityRole="button"
        testID="assistant-ask-btn"
      >
        {askLoading ? (
          <ActivityIndicator color={colors.onBrandPrimary} size="small" />
        ) : (
          <>
            <Ionicons name="send" size={16} color={colors.onBrandPrimary} />
            <Text style={styles.aiAskBtnText}>Chiedi</Text>
          </>
        )}
      </Pressable>

      {answer && (
        <View style={styles.aiAnswerCard} testID="assistant-answer">
          <View style={styles.aiAnswerHeader}>
            <Ionicons name="sparkles" size={14} color={colors.brandPrimary} />
            <Text style={styles.aiAnswerLabel}>Risposta</Text>
          </View>
          <Text style={styles.aiAnswerText} selectable>
            {answer}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  aiCard: {
    backgroundColor: colors.brandSecondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  aiHeaderIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  aiTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.onBrandSecondary,
    marginBottom: 2,
  },
  aiSub: { fontSize: 13, color: colors.onSurfaceTertiary, lineHeight: 18 },
  aiInputWrap: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 72,
    marginBottom: spacing.md,
  },
  aiInput: {
    fontSize: 15,
    color: colors.onSurface,
    padding: 0,
    minHeight: 48,
    ...Platform.select({ web: { outlineStyle: "none" } as any, default: {} }),
  },
  aiSuggLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.onSurfaceTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  aiSuggs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  aiSuggChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    maxWidth: "100%",
    borderWidth: 1,
    borderColor: colors.border,
  },
  aiSuggText: {
    fontSize: 12,
    color: colors.brandPrimary,
    fontWeight: "600",
    lineHeight: 16,
  },
  aiAskBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.brandPrimary,
    minHeight: 48,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
  },
  aiAskBtnDisabled: { backgroundColor: colors.surfaceTertiary },
  aiAskBtnText: {
    color: colors.onBrandPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  aiAnswerCard: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.brandPrimary,
  },
  aiAnswerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: spacing.xs,
  },
  aiAnswerLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.brandPrimary,
    letterSpacing: 0.8,
  },
  aiAnswerText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.onSurfaceSecondary,
  },
});
