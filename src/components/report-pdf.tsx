"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", backgroundColor: "#0d0f1a", color: "#ffffff" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#818cf8" },
  subheader: { fontSize: 16, fontWeight: "bold", marginBottom: 10, marginTop: 15 },
  text: { fontSize: 11, lineHeight: 1.5, color: "#94a3b8" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  badge: { fontSize: 10, padding: "2 6", borderRadius: 4 },
  divider: { borderBottom: "1 solid #1e293b", marginVertical: 10 },
  score: { fontSize: 48, fontWeight: "bold", textAlign: "center", marginVertical: 20 },
  finding: { marginBottom: 8, padding: 8, backgroundColor: "#111827", borderRadius: 6 },
  findingTitle: { fontSize: 12, fontWeight: "bold", color: "#ffffff" },
  findingDetail: { fontSize: 10, color: "#94a3b8", marginTop: 2 },
});

interface ReportPDFProps {
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

export function ReportPDF({ audit }: ReportPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>SEO Agents Hub Report</Text>
        <View style={styles.row}>
          <Text style={styles.text}>URL: {audit.url}</Text>
          <Text style={styles.text}>Agent: {audit.agent}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.text}>Date: {new Date(audit.createdAt).toLocaleDateString()}</Text>
          <Text style={styles.text}>By: {audit.user?.name || "N/A"}</Text>
        </View>
        {audit.project && <Text style={styles.text}>Project: {audit.project.name}</Text>}

        <View style={styles.divider} />

        <Text style={[styles.score, { color: audit.score >= 70 ? "#34d399" : audit.score >= 50 ? "#fbbf24" : "#f87171" }]}>
          {audit.score}/100 ({audit.grade})
        </Text>

        <Text style={styles.text}>{audit.summary}</Text>

        {audit.data.highlights && audit.data.highlights.length > 0 && (
          <>
            <Text style={styles.subheader}>Health Check</Text>
            {audit.data.highlights.map((h, i) => (
              <View key={i} style={styles.row}>
                <Text style={styles.text}>{h.metric}</Text>
                <Text style={[styles.text, { color: h.status === "pass" ? "#34d399" : h.status === "warn" ? "#fbbf24" : "#f87171" }]}>
                  {h.status.toUpperCase()}
                </Text>
              </View>
            ))}
          </>
        )}

        {audit.data.findings && audit.data.findings.length > 0 && (
          <>
            <Text style={styles.subheader}>Findings</Text>
            {audit.data.findings.map((f, i) => (
              <View key={i} style={styles.finding}>
                <Text style={styles.findingTitle}>[{f.severity.toUpperCase()}] {f.title}</Text>
                <Text style={styles.findingDetail}>{f.detail}</Text>
              </View>
            ))}
          </>
        )}

        {audit.data.quickWins && audit.data.quickWins.length > 0 && (
          <>
            <Text style={styles.subheader}>Quick Wins</Text>
            {audit.data.quickWins.map((w, i) => (
              <Text key={i} style={styles.text}>• {w}</Text>
            ))}
          </>
        )}
      </Page>
    </Document>
  );
}
