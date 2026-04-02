"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const TEAL = "#14b8a6";
const CYAN = "#06b6d4";
const DARK = "#0a0c14";
const DARK_CARD = "#111318";
const GRAY = "#94a3b8";
const LIGHT_GRAY = "#cbd5e1";
const BORDER = "#1e2533";

const SEVERITY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  critical: { bg: "#7f1d1d", text: "#fca5a5", label: "CRITICAL" },
  warning: { bg: "#78350f", text: "#fcd34d", label: "WARNING" },
  info: { bg: "#0c4a6e", text: "#7dd3fc", label: "INFO" },
  good: { bg: "#064e3b", text: "#6ee7b7", label: "PASSED" },
};

const s = StyleSheet.create({
  // Page
  page: { padding: 0, fontFamily: "Helvetica", backgroundColor: DARK, color: "#ffffff" },

  // Header band
  headerBand: { backgroundColor: DARK_CARD, padding: "30 40 25 40", borderBottom: `2 solid ${TEAL}` },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brandName: { fontSize: 20, fontWeight: "bold", color: TEAL, letterSpacing: -0.5 },
  brandSub: { fontSize: 9, color: GRAY, marginTop: 2, letterSpacing: 1, textTransform: "uppercase" as any },
  reportLabel: { fontSize: 9, color: GRAY, textAlign: "right" as any, textTransform: "uppercase" as any, letterSpacing: 1 },
  reportDate: { fontSize: 11, color: LIGHT_GRAY, textAlign: "right" as any, marginTop: 2 },

  // Meta info bar
  metaBar: { flexDirection: "row", backgroundColor: "#0d1017", padding: "12 40", borderBottom: `1 solid ${BORDER}` },
  metaItem: { flex: 1 },
  metaLabel: { fontSize: 8, color: GRAY, textTransform: "uppercase" as any, letterSpacing: 0.8, marginBottom: 2 },
  metaValue: { fontSize: 10, color: LIGHT_GRAY, fontWeight: "bold" },

  // Content area
  content: { padding: "25 40" },

  // Score hero
  scoreHero: { flexDirection: "row", alignItems: "center", marginBottom: 20, padding: 20, backgroundColor: DARK_CARD, borderRadius: 10, border: `1 solid ${BORDER}` },
  scoreCircleOuter: { width: 90, height: 90, borderRadius: 45, justifyContent: "center", alignItems: "center", marginRight: 20 },
  scoreNumber: { fontSize: 32, fontWeight: "bold", textAlign: "center" as any },
  scoreGrade: { fontSize: 10, fontWeight: "bold", textAlign: "center" as any, marginTop: 1, letterSpacing: 1 },
  scoreSummary: { flex: 1 },
  scoreSummaryTitle: { fontSize: 14, fontWeight: "bold", color: "#ffffff", marginBottom: 6 },
  scoreSummaryText: { fontSize: 10, lineHeight: 1.5, color: GRAY },

  // Section
  sectionTitle: { fontSize: 13, fontWeight: "bold", color: "#ffffff", marginBottom: 10, marginTop: 20, paddingBottom: 6, borderBottom: `1 solid ${BORDER}` },
  sectionIcon: { fontSize: 11, color: TEAL, marginRight: 6 },

  // Health grid
  healthRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6, borderBottom: `1 solid ${BORDER}` },
  healthMetric: { fontSize: 10, color: LIGHT_GRAY, flex: 1 },
  healthValue: { fontSize: 10, fontWeight: "bold", width: 60, textAlign: "center" as any },
  healthStatus: { fontSize: 8, fontWeight: "bold", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, textAlign: "center" as any, width: 55 },

  // Findings
  findingCard: { marginBottom: 8, padding: 12, backgroundColor: DARK_CARD, borderRadius: 8, borderLeft: "3 solid" },
  findingHeader: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  findingBadge: { fontSize: 7, fontWeight: "bold", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3, marginRight: 8, letterSpacing: 0.5 },
  findingTitle: { fontSize: 11, fontWeight: "bold", color: "#ffffff", flex: 1 },
  findingDetail: { fontSize: 9, color: GRAY, lineHeight: 1.5 },

  // Quick wins
  quickWin: { flexDirection: "row", alignItems: "flex-start", marginBottom: 6, padding: 8, backgroundColor: "#064e3b20", borderRadius: 6, borderLeft: `2 solid #34d399` },
  quickWinDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#34d399", marginRight: 8, marginTop: 4 },
  quickWinText: { fontSize: 9, color: "#6ee7b7", flex: 1, lineHeight: 1.4 },

  // Footer
  footer: { position: "absolute" as any, bottom: 0, left: 0, right: 0, padding: "12 40", borderTop: `1 solid ${BORDER}`, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: GRAY },
  footerAccent: { fontSize: 7, color: TEAL },
});

interface ReportPDFProps {
  companyName?: string;
  accentColor?: string;
  audit: {
    url: string;
    agent: string;
    score: number;
    grade: string;
    summary: string;
    createdAt: string;
    user?: { name: string };
    project?: { name: string } | null;
    data: {
      highlights?: { metric: string; value: string; status: string }[];
      findings?: { title: string; severity: string; detail: string }[];
      quickWins?: string[];
    };
  };
}

export function ReportPDF({ audit, companyName, accentColor }: ReportPDFProps) {
  const accent = accentColor || TEAL;
  const brand = companyName || "Agents Hub";
  const scoreColor = audit.score >= 70 ? "#34d399" : audit.score >= 50 ? "#fbbf24" : "#f87171";
  const scoreRingBg = audit.score >= 70 ? "#064e3b" : audit.score >= 50 ? "#78350f" : "#7f1d1d";

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* ── Header Band ── */}
        <View style={s.headerBand}>
          <View style={s.headerRow}>
            <View>
              <Text style={[s.brandName, { color: accent }]}>{brand}</Text>
              <Text style={s.brandSub}>SEO Audit Report</Text>
            </View>
            <View>
              <Text style={s.reportLabel}>Generated</Text>
              <Text style={s.reportDate}>
                {new Date(audit.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Meta Info Bar ── */}
        <View style={s.metaBar}>
          <View style={s.metaItem}>
            <Text style={s.metaLabel}>Website</Text>
            <Text style={s.metaValue}>{audit.url}</Text>
          </View>
          <View style={s.metaItem}>
            <Text style={s.metaLabel}>Agent</Text>
            <Text style={s.metaValue}>{audit.agent}</Text>
          </View>
          <View style={s.metaItem}>
            <Text style={s.metaLabel}>Auditor</Text>
            <Text style={s.metaValue}>{audit.user?.name || "System"}</Text>
          </View>
          {audit.project && (
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Project</Text>
              <Text style={s.metaValue}>{audit.project.name}</Text>
            </View>
          )}
        </View>

        {/* ── Content ── */}
        <View style={s.content}>
          {/* Score Hero */}
          <View style={s.scoreHero}>
            <View style={[s.scoreCircleOuter, { backgroundColor: scoreRingBg, border: `3 solid ${scoreColor}` }]}>
              <Text style={[s.scoreNumber, { color: scoreColor }]}>{audit.score}</Text>
              <Text style={[s.scoreGrade, { color: scoreColor }]}>{audit.grade}</Text>
            </View>
            <View style={s.scoreSummary}>
              <Text style={s.scoreSummaryTitle}>{audit.agent} Analysis</Text>
              <Text style={s.scoreSummaryText}>{audit.summary}</Text>
            </View>
          </View>

          {/* Health Check */}
          {audit.data.highlights && audit.data.highlights.length > 0 && (
            <View>
              <Text style={s.sectionTitle}>Health Check</Text>
              {audit.data.highlights.map((h, i) => {
                const statusColor = h.status === "pass" ? "#34d399" : h.status === "warn" ? "#fbbf24" : "#f87171";
                const statusBg = h.status === "pass" ? "#064e3b" : h.status === "warn" ? "#78350f" : "#7f1d1d";
                return (
                  <View key={i} style={s.healthRow}>
                    <Text style={s.healthMetric}>{h.metric}</Text>
                    <Text style={[s.healthValue, { color: LIGHT_GRAY }]}>{h.value}</Text>
                    <Text style={[s.healthStatus, { backgroundColor: statusBg, color: statusColor }]}>
                      {h.status.toUpperCase()}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Findings */}
          {audit.data.findings && audit.data.findings.length > 0 && (
            <View>
              <Text style={s.sectionTitle}>
                Findings ({audit.data.findings.length})
              </Text>
              {audit.data.findings.map((f, i) => {
                const sev = SEVERITY_COLORS[f.severity] || SEVERITY_COLORS.info;
                return (
                  <View key={i} style={[s.findingCard, { borderLeftColor: sev.text }]}>
                    <View style={s.findingHeader}>
                      <Text style={[s.findingBadge, { backgroundColor: sev.bg, color: sev.text }]}>
                        {sev.label}
                      </Text>
                      <Text style={s.findingTitle}>{f.title}</Text>
                    </View>
                    <Text style={s.findingDetail}>{f.detail}</Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Quick Wins */}
          {audit.data.quickWins && audit.data.quickWins.length > 0 && (
            <View>
              <Text style={s.sectionTitle}>Quick Wins</Text>
              {audit.data.quickWins.map((w, i) => (
                <View key={i} style={s.quickWin}>
                  <View style={s.quickWinDot} />
                  <Text style={s.quickWinText}>{w}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            Generated by {brand} — AI-Powered SEO Intelligence
          </Text>
          <Text style={s.footerAccent}>
            Confidential Report
          </Text>
        </View>
      </Page>
    </Document>
  );
}
