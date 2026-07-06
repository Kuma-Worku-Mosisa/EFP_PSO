// filepath: frontend/src/components/IncidentReportPDF.tsx
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import type { Language } from "../constants/i18n";

// Register the Amharic-compatible font (Ethiopic Script)
// Note: Ensure these TTF files are placed in your /public/fonts/ directory
Font.register({
  family: "NotoSansEthiopic",
  fonts: [
    { src: "/fonts/NotoSansEthiopic-Regular.ttf", fontWeight: "normal" },
    { src: "/fonts/NotoSansEthiopic-Bold.ttf", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "NotoSansEthiopic", // Replaced Helvetica to support Amharic
    fontSize: 10,
    color: "#1f2937",
    lineHeight: 1.5,
  },
  headerContainer: {
    borderBottom: "2px solid #0f172a",
    paddingBottom: 12,
    marginBottom: 20,
    textAlign: "center",
  },
  govTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#0f172a",
  },
  subGovTitle: {
    fontSize: 11,
    marginTop: 3,
    color: "#4b5563",
    textTransform: "uppercase",
  },
  docTitle: {
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 15,
    marginBottom: 15,
    backgroundColor: "#f1f5f9",
    padding: 6,
    borderRadius: 4,
    textTransform: "uppercase",
    color: "#1e3a8a",
  },
  metaGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 4,
    border: "1px solid #e2e8f0",
  },
  metaColumn: {
    flexDirection: "column",
  },
  metaLabel: {
    fontSize: 8,
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0f172a",
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1e3a8a",
    borderBottom: "1px solid #cbd5e1",
    paddingBottom: 4,
    marginTop: 15,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  fieldGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 5,
  },
  fieldBox: {
    width: "50%",
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 8,
    color: "#64748b",
    textTransform: "uppercase",
  },
  fieldValue: {
    fontSize: 10,
    color: "#0f172a",
  },
  fullWidthBox: {
    width: "100%",
    marginBottom: 8,
  },
  textBlock: {
    fontSize: 9.5,
    backgroundColor: "#f8fafc",
    padding: 8,
    borderRadius: 4,
    borderLeft: "3px solid #64748b",
    color: "#334155",
  },
  table: {
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 5,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableHeader: {
    backgroundColor: "#f1f5f9",
    fontWeight: "bold",
  },
  tableCellHeader: {
    margin: 6,
    fontSize: 9,
    fontWeight: "bold",
    color: "#334155",
    textTransform: "uppercase",
  },
  tableCell: {
    margin: 6,
    fontSize: 9,
  },
  signaturesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
    borderTop: "1px solid #e2e8f0",
    paddingTop: 15,
  },
  signatureBlock: {
    width: "30%",
    flexDirection: "column",
    alignItems: "center",
  },
  signatureLine: {
    borderBottom: "1px dashed #94a3b8",
    width: "100%",
    marginTop: 25,
    marginBottom: 5,
  },
  signatureImg: {
    height: 30,
    width: "auto",
    marginBottom: 5,
    objectFit: "contain",
  },
  signText: {
    fontSize: 8,
    color: "#475569",
    textAlign: "center",
  },
  signTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#0f172a",
    textAlign: "center",
  },
});

interface Props {
  data: any;
  language?: Language;
}

export const IncidentReportPDF: React.FC<Props> = ({
  data,
  language = "en",
}) => {
  const normalizedLanguage = (language ?? "en").toLowerCase();
  const isAmharic = normalizedLanguage === "am";

  const formatCurrency = (amount: any) => {
    if (!amount) return "N/A";
    return `${parseFloat(amount).toLocaleString()} ETB`;
  };

  const formatDate = (dateString: any) => {
    if (!dateString) return "---";
    return new Date(dateString).toLocaleDateString(
      isAmharic ? "am-ET" : "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
    );
  };

  const organizationName = (() => {
    const org = data?.organization;
    const fallback =
      data?.organizationName ||
      org?.name ||
      org?.nameEnglish ||
      org?.nameAmharic ||
      "—";

    if (isAmharic) {
      return org?.nameAmharic || org?.nameEnglish || org?.name || fallback;
    }

    return org?.nameEnglish || org?.nameAmharic || org?.name || fallback;
  })();

  const labels = {
    govTitle: isAmharic
      ? "የኢትዮጵያ ፌደራል ፖሊስ ኮሚሽን"
      : "Ethiopian Federal Police Commission",
    subGovTitle: isAmharic
      ? "የግል ጥበቃ ድርጅቶች ቁጥጥር እና አስተዳደር ዳይሬክቶሬት"
      : "Private Security Organizations Control & Administration Directorate",
    docTitle: isAmharic
      ? "የወንጀል እና የክስተት ምርመራ ሪፖርት"
      : "Official Crime & Incident Investigation Report",
    fileNumber: isAmharic ? "የመዝገብ ቁጥር" : "Official File Number",
    filingDate: isAmharic ? "የተመዘገበበት ቀን" : "Filing Date",
    organizationLabel: isAmharic ? "የተቋሙ ስም" : "Organization Name",
    section1Title: isAmharic
      ? "1. የክስተት ኢላማ እና ዋና መረጃ"
      : "1. Incident Target & Core Metadata",
    section2Title: isAmharic
      ? "2. የቦታ ሰራተኞች ብዛት"
      : "2. Dynamic Scene Personnel Headcounts",
    section3Title: isAmharic
      ? "3. የተጠርጣሪዎች እና የተቋሙ ግንኙነት"
      : "3. Identified Suspects & Affiliation",
    serviceReceiverLabel: isAmharic
      ? "የአገልግሎት ተቀባይ (ደንበኛ ኢላማ)"
      : "Service Receiver (Client Target)",
    crimeTypeLabel: isAmharic
      ? "የወንጀል / የክስተት ምድብ"
      : "Crime / Incident Category",
    occurrenceLabel: isAmharic ? "የክስተት ሰዓት" : "Occurrence Timestamp",
    financialImpactLabel: isAmharic
      ? "የተገመገመ የገንዘብ ጉዳት (ETB)"
      : "Evaluated Financial Loss (ETB)",
    damageLabel: isAmharic ? "የጉዳት እና የኪሳራ መግለጫ" : "Damage & Loss Description",
    actionTakenLabel: isAmharic ? "የተወሰደው እርምጃ ሁኔታ" : "Action Taken Status",
    additionalExplanationLabel: isAmharic
      ? "ተጨማሪ ማብራሪያ"
      : "Additional Explanation",
    suspectNameLabel: isAmharic ? "የተጠርጣሪ ስም" : "Suspect Name",
    relationLabel: isAmharic ? "ከአካል ጋር ያለው ግንኙነት" : "Relation to Agency",
    employeeIdLabel: isAmharic ? "የሰራተኛ መታወቂያ" : "Employee ID",
    reviewerFeedbackLabel: isAmharic
      ? "የገመጋው እርማት እና አስተያየት"
      : "Reviewer Directives & Feedback",
    submittingAgencyLabel: isAmharic ? "1. የሚልክ አካል" : "1. Submitting Agency",
    auditingOfficerLabel: isAmharic
      ? "2. የሚቆጣጠር ኤፍፒ ኦፊሰር"
      : "2. Auditing EFP Officer",
    endorsingSuperiorLabel: isAmharic
      ? "3. የሚደግፍ ኤፍፒ ከፍተኛ ተቆጣጣሪ"
      : "3. Endorsing EFP Superior",
    pendingReviewLabel: isAmharic ? "በመጠበቅ ላይ" : "Pending Review",
    pendingApprovalLabel: isAmharic ? "በማረጋገጥ ላይ" : "Pending Approval",
    signedLabel: isAmharic ? "ተፈርመዋል:" : "Signed:",
    unknownValue: isAmharic ? "ያልታወቀ" : "Unknown",
    naValue: isAmharic ? "የለም" : "N/A",
    guardsLabel: isAmharic ? "ጠባቂዎች" : "Guards",
    clientStaffLabel: isAmharic ? "የደንበኛ ሰራተኞች" : "Client Staff",
    bystandersLabel: isAmharic ? "ታዳሚዎች" : "Bystanders",
    totalPresentLabel: isAmharic ? "አጠቃላይ የተገኙ" : "Total Present",
    suspectsLabel: isAmharic ? "ተጠርጣሪዎች" : "Suspects",
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerContainer}>
          <Text style={styles.govTitle}>{labels.govTitle}</Text>
          <Text style={styles.subGovTitle}>{labels.subGovTitle}</Text>
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaColumn}>
            <Text style={styles.metaLabel}>{labels.fileNumber}</Text>
            <Text style={styles.metaValue}>{data.fileNumber}</Text>
          </View>
          <View style={styles.metaColumn}>
            <Text style={styles.metaLabel}>{labels.organizationLabel}</Text>
            <Text style={styles.metaValue}>{organizationName}</Text>
          </View>
          <View style={styles.metaColumn}>
            <Text style={styles.metaLabel}>{labels.filingDate}</Text>
            <Text style={styles.metaValue}>
              {(data.reportDate || "").substring(0, 10)}
            </Text>
          </View>
        </View>

        <Text style={styles.docTitle}>{labels.docTitle}</Text>

        <View style={styles.sectionTitle}>
          <Text>{labels.section1Title}</Text>
        </View>
        <View style={styles.fieldGrid}>
          <View style={styles.fieldBox}>
            <Text style={styles.fieldLabel}>{labels.serviceReceiverLabel}</Text>
            <Text style={styles.fieldValue}>{data.serviceReceiverName}</Text>
          </View>
          <View style={styles.fieldBox}>
            <Text style={styles.fieldLabel}>{labels.crimeTypeLabel}</Text>
            <Text style={styles.fieldValue}>{data.crimeType}</Text>
          </View>
          <View style={styles.fieldBox}>
            <Text style={styles.fieldLabel}>{labels.occurrenceLabel}</Text>
            <Text style={styles.fieldValue}>
              {formatDate(data.incidentStartTimestamp)}
            </Text>
          </View>
          <View style={styles.fieldBox}>
            <Text style={styles.fieldLabel}>{labels.financialImpactLabel}</Text>
            <Text style={styles.fieldValue}>
              {formatCurrency(data.crimeInCapitalAmount)}
            </Text>
          </View>
        </View>

        <View style={styles.sectionTitle}>
          <Text>{labels.section2Title}</Text>
        </View>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={{ width: "20%" }}>
              <Text style={styles.tableCellHeader}>{labels.guardsLabel}</Text>
            </View>
            <View style={{ width: "20%" }}>
              <Text style={styles.tableCellHeader}>
                {labels.clientStaffLabel}
              </Text>
            </View>
            <View style={{ width: "20%" }}>
              <Text style={styles.tableCellHeader}>
                {labels.bystandersLabel}
              </Text>
            </View>
            <View style={{ width: "20%" }}>
              <Text style={styles.tableCellHeader}>
                {labels.totalPresentLabel}
              </Text>
            </View>
            <View style={{ width: "20%" }}>
              <Text style={styles.tableCellHeader}>{labels.suspectsLabel}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={{ width: "20%" }}>
              <Text style={styles.tableCell}>
                {data.securityPersonnelCount}
              </Text>
            </View>
            <View style={{ width: "20%" }}>
              <Text style={styles.tableCell}>
                {data.customerPersonnelCount}
              </Text>
            </View>
            <View style={{ width: "20%" }}>
              <Text style={styles.tableCell}>{data.otherPartiesCount}</Text>
            </View>
            <View style={{ width: "20%" }}>
              <Text style={styles.tableCell}>
                {data.SecurityCustomerOtherBodyCount}
              </Text>
            </View>
            <View style={{ width: "20%" }}>
              <Text style={styles.tableCell}>{data.suspectedBodiesCount}</Text>
            </View>
          </View>
        </View>

        {data.actionTakenStatus && (
          <View>
            <View style={styles.fullWidthBox}>
              <Text style={styles.fieldLabel}>{labels.damageLabel}</Text>
              <Text style={styles.textBlock}>{data.damageDescription}</Text>
            </View>
            <View style={styles.metaColumn}>
              <Text style={styles.metaLabel}>{labels.actionTakenLabel}</Text>
              <Text style={[styles.textBlock, { borderLeftColor: "#1e3a8a" }]}>
                {data.actionTakenStatus}
              </Text>
            </View>
          </View>
        )}

        {data.explanation && (
          <View style={[styles.fullWidthBox, { marginTop: 6 }]}>
            <Text style={styles.fieldLabel}>
              {labels.additionalExplanationLabel}
            </Text>
            <Text style={[styles.textBlock, { borderLeftColor: "#1e3a8a" }]}>
              {data.explanation}
            </Text>
          </View>
        )}

        <View style={styles.sectionTitle}>
          <Text>{labels.section3Title}</Text>
        </View>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={{ width: "40%" }}>
              <Text style={styles.tableCellHeader}>
                {labels.suspectNameLabel}
              </Text>
            </View>
            <View style={{ width: "35%" }}>
              <Text style={styles.tableCellHeader}>{labels.relationLabel}</Text>
            </View>
            <View style={{ width: "25%" }}>
              <Text style={styles.tableCellHeader}>
                {labels.employeeIdLabel}
              </Text>
            </View>
          </View>
          {data.suspects?.map((suspect: any, idx: number) => (
            <View key={idx} style={styles.tableRow}>
              <View style={{ width: "40%" }}>
                <Text style={styles.tableCell}>{suspect.suspectName}</Text>
              </View>
              <View style={{ width: "35%" }}>
                <Text style={styles.tableCell}>
                  {suspect.relationToAgency || labels.unknownValue}
                </Text>
              </View>
              <View style={{ width: "25%" }}>
                <Text style={styles.tableCell}>
                  {suspect.employeeId || labels.naValue}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {data.superiorFeedback && (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.fieldLabel}>
              {labels.reviewerFeedbackLabel}
            </Text>
            <Text
              style={[
                styles.textBlock,
                { backgroundColor: "#fef2f2", borderLeftColor: "#dc2626" },
              ]}
            >
              {data.superiorFeedback}
            </Text>
          </View>
        )}

        <View style={styles.signaturesContainer}>
          <View style={styles.signatureBlock}>
            <Text style={styles.metaLabel}>{labels.submittingAgencyLabel}</Text>
            <View style={styles.signatureLine}>
              {data.reporterSignatureUrl && (
                <Image
                  style={styles.signatureImg}
                  src={data.reporterSignatureUrl}
                />
              )}
            </View>
            <Text style={styles.signTitle}>{data.reporterName}</Text>
            <Text style={styles.signText}>{data.reporterTitle}</Text>
          </View>

          <View style={styles.signatureBlock}>
            <Text style={styles.metaLabel}>{labels.auditingOfficerLabel}</Text>
            <View style={styles.signatureLine}>
              {data.efpOfficerSignatureUrl && (
                <Image
                  style={styles.signatureImg}
                  src={data.efpOfficerSignatureUrl}
                />
              )}
            </View>
            <Text style={styles.signTitle}>
              {data.efpOfficerName || labels.pendingReviewLabel}
            </Text>
            <Text style={styles.signText}>
              {data.efpSignDate
                ? `${labels.signedLabel} ${data.efpSignDate.substring(0, 10)}`
                : ""}
            </Text>
          </View>

          <View style={styles.signatureBlock}>
            <Text style={styles.metaLabel}>
              {labels.endorsingSuperiorLabel}
            </Text>
            <View style={styles.signatureLine}>
              {data.superiorSignatureUrl && (
                <Image
                  style={styles.signatureImg}
                  src={data.superiorSignatureUrl}
                />
              )}
            </View>
            <Text style={styles.signTitle}>
              {data.superiorName || labels.pendingApprovalLabel}
            </Text>
            <Text style={styles.signText}>
              {data.superiorSignDate
                ? `${labels.signedLabel} ${data.superiorSignDate.substring(0, 10)}`
                : ""}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
