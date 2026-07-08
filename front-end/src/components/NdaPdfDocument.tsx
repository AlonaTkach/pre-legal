"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import {
  ATTRIBUTION,
  derive,
  filledTerms,
  NdaData,
  partyLabel,
} from "@/lib/nda";

const styles = StyleSheet.create({
  page: {
    paddingTop: 54,
    paddingBottom: 54,
    paddingHorizontal: 56,
    fontSize: 10,
    lineHeight: 1.5,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
  },
  title: { fontSize: 20, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#555", marginBottom: 20 },
  sectionLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
    marginTop: 12,
  },
  fieldValue: { fontSize: 11 },
  partyRow: { flexDirection: "row", marginTop: 16 },
  partyCol: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e2e2e2",
    borderRadius: 4,
    marginRight: 8,
  },
  partyColLast: { marginRight: 0 },
  partyHeading: { fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 6, color: "#333" },
  partyLine: { fontSize: 9, marginBottom: 3, color: "#333" },
  partyMuted: { color: "#aaa" },
  clauseHeading: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginTop: 12,
    marginBottom: 3,
  },
  clauseBody: { textAlign: "justify" },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 56,
    right: 56,
    fontSize: 7,
    color: "#999",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
});

function PartyBlock({
  heading,
  company,
  name,
  title,
  notice,
}: {
  heading: string;
  company: string;
  name: string;
  title: string;
  notice: string;
}) {
  return (
    <>
      <Text style={styles.partyHeading}>{heading}</Text>
      <Text style={[styles.partyLine, company ? {} : styles.partyMuted]}>
        Company: {company || "—"}
      </Text>
      <Text style={[styles.partyLine, name ? {} : styles.partyMuted]}>
        Name: {name || "—"}
      </Text>
      <Text style={[styles.partyLine, title ? {} : styles.partyMuted]}>
        Title: {title || "—"}
      </Text>
      <Text style={[styles.partyLine, notice ? {} : styles.partyMuted]}>
        Notice: {notice || "—"}
      </Text>
    </>
  );
}

export function NdaPdfDocument({ data }: { data: NdaData }) {
  const d = derive(data);
  const terms = filledTerms(data);
  const p1 = partyLabel(data.party1, "Party 1");
  const p2 = partyLabel(data.party2, "Party 2");

  return (
    <Document title="Mutual Non-Disclosure Agreement">
      {/* Cover page */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Mutual Non-Disclosure Agreement</Text>
        <Text style={styles.subtitle}>Cover Page · {p1} &amp; {p2}</Text>

        <Text style={styles.sectionLabel}>Purpose</Text>
        <Text style={styles.fieldValue}>{d.purpose}</Text>

        <Text style={styles.sectionLabel}>Effective Date</Text>
        <Text style={styles.fieldValue}>{d.effectiveDate}</Text>

        <Text style={styles.sectionLabel}>MNDA Term</Text>
        <Text style={styles.fieldValue}>{d.mndaTerm}</Text>

        <Text style={styles.sectionLabel}>Term of Confidentiality</Text>
        <Text style={styles.fieldValue}>{d.confidentialityTerm}</Text>

        <Text style={styles.sectionLabel}>Governing Law</Text>
        <Text style={styles.fieldValue}>{d.governingLaw}</Text>

        <Text style={styles.sectionLabel}>Jurisdiction</Text>
        <Text style={styles.fieldValue}>{d.jurisdiction}</Text>

        <View style={styles.partyRow}>
          <View style={styles.partyCol}>
            <PartyBlock
              heading="Party 1"
              company={data.party1.company}
              name={data.party1.name}
              title={data.party1.title}
              notice={data.party1.noticeAddress}
            />
          </View>
          <View style={[styles.partyCol, styles.partyColLast]}>
            <PartyBlock
              heading="Party 2"
              company={data.party2.company}
              name={data.party2.name}
              title={data.party2.title}
              notice={data.party2.noticeAddress}
            />
          </View>
        </View>

        <Text style={styles.footer} fixed>
          {ATTRIBUTION}
        </Text>
      </Page>

      {/* Standard terms */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Standard Terms</Text>
        {terms.map((c) => (
          <View key={c.n} wrap={false}>
            <Text style={styles.clauseHeading}>
              {c.n}. {c.title}
            </Text>
            <Text style={styles.clauseBody}>{c.body}</Text>
          </View>
        ))}
        <Text style={styles.footer} fixed>
          {ATTRIBUTION}
        </Text>
      </Page>
    </Document>
  );
}
