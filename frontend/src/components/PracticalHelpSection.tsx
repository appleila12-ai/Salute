// Aiuti Pratici sul Territorio — Assistenza, Trasporti e Fisioterapia.
// Sezione espandibile con 4 schede guidate + guida PDF scaricabile.

import { useState } from "react";
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

import { colors, radius, spacing, topics } from "@/src/theme";

interface HelpCard {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  soft: string;
  dark: string;
  label: string;
  title: string;
  body: string;
  rows: { label: string; text: string }[];
}

const CARDS: HelpCard[] = [
  {
    id: "trasporto",
    icon: "car",
    color: topics.salute.main,
    soft: topics.salute.soft,
    dark: topics.salute.dark,
    label: "TRASPORTI",
    title: "Trasporto per esami e visite",
    body: "Come richiedere il trasporto protetto con la Pubblica Assistenza per visite ed esami.",
    rows: [
      {
        label: "Requisiti",
        text: "Impossibilità di deambulazione o patologie complesse. La richiesta passa dal Medico di Medicina Generale o dalla convenzione ASL.",
      },
      {
        label: "Contatti locali",
        text: "Pubblica Assistenza Sarzana — Via Falcinello 2, tel. 0187 620200. In altre zone cerca la Pubblica Assistenza o la Croce Rossa del tuo Comune.",
      },
    ],
  },
  {
    id: "domicilio",
    icon: "home",
    color: topics.legge104.main,
    soft: topics.legge104.soft,
    dark: topics.legge104.dark,
    label: "ASSISTENZA",
    title: "Assistenza a domicilio (Infermieri e OSS)",
    body: "Due servizi diversi che spesso si confondono: ADI e SAD.",
    rows: [
      {
        label: "ADI (ASL)",
        text: "Assistenza Domiciliare Integrata: cure sanitarie a casa (infermieri, medicazioni, prelievi). È gratuita e la attiva il Medico Curante.",
      },
      {
        label: "SAD (Comune)",
        text: "Servizio di Assistenza Domiciliare: igiene e cura personale con OSS. Si richiede ai Servizi Sociali del Comune (contributo in base all'ISEE).",
      },
      {
        label: "Come attivare",
        text: "Richiesta al Medico Curante (ADI) o appuntamento con l'assistente sociale del Comune (SAD).",
      },
    ],
  },
  {
    id: "fisioterapia",
    icon: "fitness",
    color: topics.esenzioni.main,
    soft: topics.esenzioni.soft,
    dark: topics.esenzioni.dark,
    label: "RIABILITAZIONE",
    title: "Fisioterapia e riabilitazione",
    body: "Diritto a cicli riabilitativi a domicilio o presso centri convenzionati.",
    rows: [
      {
        label: "Come funziona",
        text: "Serve la prescrizione dello specialista (fisiatra) su ricettario SSN. I cicli si svolgono nei centri convenzionati o a domicilio se non puoi spostarti.",
      },
      {
        label: "Esenzioni",
        text: "Ricorda di verificare l'esenzione ticket per patologia o per invalidità: in molti casi i cicli riabilitativi sono gratuiti.",
      },
    ],
  },
  {
    id: "rsa",
    icon: "bed",
    color: topics.invalidita.main,
    soft: topics.invalidita.soft,
    dark: topics.invalidita.dark,
    label: "RICOVERI",
    title: "Periodi in RSA e ricoveri di sollievo",
    body: "Accesso a ricoveri temporanei per riabilitazione o per garantire un periodo di sollievo al caregiver.",
    rows: [
      {
        label: "Come procedere",
        text: "La valutazione passa dall'Unità Valutativa Multidimensionale (UVM) della ASL: chiedi al Medico Curante o al distretto sanitario di attivarla.",
      },
      {
        label: "Buono a sapersi",
        text: "I ricoveri di sollievo durano in genere 30-60 giorni e aiutano la famiglia a riprendere fiato senza perdere la continuità delle cure.",
      },
    ],
  },
];

function toast(msg: string) {
  if (Platform.OS === "android") ToastAndroid.show(msg, ToastAndroid.SHORT);
  else console.log(msg);
}

function buildGuideHtml(): string {
  const cardsHtml = CARDS.map(
    (c) => `
    <div class="card" style="border-left: 4px solid ${c.color};">
      <div class="label" style="color:${c.color};">${c.label}</div>
      <div class="title">${c.title}</div>
      <div class="body">${c.body}</div>
      ${c.rows
        .map(
          (r) =>
            `<div class="row"><b>${r.label}:</b> ${r.text}</div>`,
        )
        .join("")}
    </div>`,
  ).join("");

  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8" />
<title>TutelApp — Guida ai Servizi Sociali del Comune</title>
<style>
  body { font-family: -apple-system, "Helvetica Neue", Arial, sans-serif; color: #0F172A; padding: 40px; margin: 0; }
  .brand { color: #2A75D3; font-weight: 800; font-size: 13px; letter-spacing: 1.2px; text-transform: uppercase; }
  h1 { font-size: 22px; margin: 8px 0 4px 0; letter-spacing: -0.4px; }
  .sub { color: #6B7280; font-size: 13px; margin-bottom: 24px; line-height: 1.5; }
  .card { background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 12px; padding: 18px; margin-bottom: 14px; }
  .label { font-size: 10px; font-weight: 800; letter-spacing: 1.2px; margin-bottom: 4px; }
  .title { font-weight: 800; font-size: 15px; color: #111827; margin-bottom: 6px; }
  .body { font-size: 13px; color: #1F2937; line-height: 1.55; margin-bottom: 10px; }
  .row { font-size: 12.5px; color: #374151; line-height: 1.55; margin-bottom: 6px; }
  .steps { background: #F5F8FC; border-radius: 12px; padding: 16px 18px; margin-top: 20px; }
  .steps .title { margin-bottom: 8px; }
  ol { margin: 0; padding-left: 20px; }
  ol li { font-size: 13px; color: #1F2937; line-height: 1.6; margin-bottom: 4px; }
  .disclaimer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #E5E7EB; color: #6B7280; font-size: 11px; line-height: 1.5; }
</style>
</head>
<body>
  <div class="brand">TutelApp</div>
  <h1>Guida ai Servizi Sociali del Comune</h1>
  <div class="sub">Aiuti pratici sul territorio: assistenza, trasporti, riabilitazione e ricoveri di sollievo. Porta questa guida ai Servizi Sociali o al Patronato.</div>
  ${cardsHtml}
  <div class="steps">
    <div class="title">Come muoversi con i Servizi Sociali del Comune</div>
    <ol>
      <li>Chiama il centralino del tuo Comune e chiedi dei <b>Servizi Sociali</b> (o Sportello del Cittadino).</li>
      <li>Fissa un appuntamento con l'<b>assistente sociale</b> di zona: è gratuito.</li>
      <li>Porta: documento, tessera sanitaria, ISEE aggiornato e verbale di invalidità/104 se già disponibile.</li>
      <li>Chiedi la <b>valutazione del bisogno</b>: da lì si attivano SAD, contributi, pasti a domicilio e telesoccorso.</li>
      <li>Per i servizi sanitari (ADI, UVM, riabilitazione) il riferimento è il <b>Medico Curante</b> e il distretto ASL.</li>
    </ol>
  </div>
  <div class="disclaimer">Contenuto orientativo generato da TutelApp. Servizi, tempi e contributi variano da Comune a Comune: verifica sempre con i Servizi Sociali o con un Patronato.</div>
</body>
</html>`;
}

export function PracticalHelpSection() {
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const downloadGuide = async () => {
    if (downloading) return;
    setDownloading(true);
    const html = buildGuideHtml();
    try {
      if (Platform.OS === "web") {
        await Print.printAsync({ html });
        return;
      }
      const { uri } = await Print.printToFileAsync({ html });
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
    <View style={styles.wrap} testID="practical-help-section">
      {/* Section header (expandable) */}
      <Pressable
        onPress={() => setOpen((v) => !v)}
        style={({ pressed }) => [
          styles.sectionHeader,
          pressed && { opacity: 0.9 },
        ]}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        testID="practical-help-toggle"
      >
        <View style={styles.sectionIcon}>
          <Ionicons name="hand-left" size={22} color={topics.salute.main} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.sectionLabel}>SUL TERRITORIO</Text>
          <Text style={styles.sectionTitle}>
            Aiuti Pratici sul Territorio (Assistenza, Trasporti e Fisioterapia)
          </Text>
        </View>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={20}
          color={colors.onSurfaceTertiary}
        />
      </Pressable>

      {open && (
        <View testID="practical-help-body">
          {CARDS.map((c) => {
            const isOpen = expandedId === c.id;
            return (
              <View
                key={c.id}
                style={[styles.card, { borderLeftColor: c.color }]}
                testID={`help-card-${c.id}`}
              >
                <Pressable
                  onPress={() => setExpandedId(isOpen ? null : c.id)}
                  style={styles.cardHeader}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: isOpen }}
                  testID={`help-card-toggle-${c.id}`}
                >
                  <View style={[styles.cardIcon, { backgroundColor: c.soft }]}>
                    <Ionicons name={c.icon} size={20} color={c.color} />
                  </View>
                  <View style={styles.flex}>
                    <Text style={[styles.cardLabel, { color: c.color }]}>
                      {c.label}
                    </Text>
                    <Text style={styles.cardTitle}>{c.title}</Text>
                  </View>
                  <Ionicons
                    name={isOpen ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={colors.onSurfaceTertiary}
                  />
                </Pressable>
                <Text style={styles.cardBody}>{c.body}</Text>
                {isOpen && (
                  <View style={styles.rows} testID={`help-card-body-${c.id}`}>
                    {c.rows.map((r) => (
                      <View key={r.label} style={styles.row}>
                        <View
                          style={[styles.rowBadge, { backgroundColor: c.soft }]}
                        >
                          <Text style={[styles.rowBadgeText, { color: c.dark }]}>
                            {r.label}
                          </Text>
                        </View>
                        <Text style={styles.rowText}>{r.text}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}

          {/* Download guide button */}
          <Pressable
            onPress={downloadGuide}
            disabled={downloading}
            style={({ pressed }) => [
              styles.guideBtn,
              downloading && { opacity: 0.7 },
              pressed && { opacity: 0.85 },
            ]}
            accessibilityRole="button"
            testID="practical-help-guide-btn"
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
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    borderLeftColor: topics.salute.main,
    marginBottom: spacing.sm,
  },
  sectionIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: topics.salute.soft,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: topics.salute.main,
    letterSpacing: 1.2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.onSurface,
    letterSpacing: -0.2,
    lineHeight: 19,
    marginTop: 2,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  cardIcon: {
    width: 40,
    height: 40,
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
    fontSize: 14,
    fontWeight: "800",
    color: colors.onSurface,
    lineHeight: 18,
    marginTop: 1,
  },
  cardBody: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.onSurfaceSecondary,
  },
  rows: {
    marginTop: spacing.md,
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  row: {
    gap: 4,
  },
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
    minHeight: 52,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
  },
  guideBtnText: {
    color: colors.onBrandPrimary,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: -0.1,
  },
});
