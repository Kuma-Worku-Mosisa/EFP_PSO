import React from "react";
import { formatInspectionPdfDate } from "../../lib/ethiopianCalendar";

export type InspectionPdfInspection = {
  id: number;
  scheduledDate?: string;
  isLocationValid?: boolean;
  isInfrastructureValid?: boolean;
  isTrainingValid?: boolean;
  findingsSummary?: string | null;
  expertOpinion?: string | null;
  application?: {
    applicationDate?: string;
    organization?: {
      nameEnglish?: string | null;
      nameAmharic?: string | null;
      numberOfOffices?: number | null;
      numberOfVehicles?: number | null;
      numberOfComputers?: number | null;
      hasStoreHouse?: boolean | null;
      address?: {
        houseNumber?: string | null;
        specialLocation?: string | null;
        kebele?: {
          nameEnglish?: string | null;
          nameAmharic?: string | null;
          woreda?: {
            nameEnglish?: string | null;
            nameAmharic?: string | null;
            zone?: {
              nameEnglish?: string | null;
              nameAmharic?: string | null;
              region?: {
                nameEnglish?: string | null;
                nameAmharic?: string | null;
              } | null;
            } | null;
          } | null;
        } | null;
      } | null;
    } | null;
    user?: {
      fullName?: string | null;
      phone?: string | null;
      email?: string | null;
    } | null;
  } | null;
  leadInspector?: {
    id: number;
    fullName?: string | null;
    username?: string | null;
  } | null;
  committeeMembers?: Array<{
    id: number;
    userId?: number;
    expertName: string;
    expertRole?: string | null;
    signatureUrl?: string | null;
    signedAt?: string | null;
  }>;
};

export type CommitteePdfRow = {
  id: number;
  name: string;
  role: string;
  signatureSrc?: string | null;
  signedAt?: string | null;
};

const display = (value?: string | number | boolean | null) => {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
};

const fontStack =
  '"Noto Sans Ethiopic", "Noto Sans", system-ui, -apple-system, "Segoe UI", Arial, sans-serif';

type Props = {
  inspection: InspectionPdfInspection;
  isAm: boolean;
  organizationName: string;
  committeeRows: CommitteePdfRow[];
  generatedBy: string;
  compact?: boolean;
};

export const InspectionReportPdfTemplate: React.FC<Props> = ({
  inspection,
  isAm,
  organizationName,
  committeeRows,
  generatedBy,
  compact = true,
}) => {
  const org = inspection.application?.organization;
  const addr = org?.address;
  const appUser = inspection.application?.user;

  const region =
    addr?.kebele?.woreda?.zone?.region?.nameEnglish ||
    addr?.kebele?.woreda?.zone?.region?.nameAmharic ||
    "-";
  const zone =
    addr?.kebele?.woreda?.zone?.nameEnglish ||
    addr?.kebele?.woreda?.zone?.nameAmharic ||
    "-";
  const woreda =
    addr?.kebele?.woreda?.nameEnglish || addr?.kebele?.woreda?.nameAmharic || "-";
  const kebele =
    addr?.kebele?.nameEnglish || addr?.kebele?.nameAmharic || "-";

  const checks = [
    {
      label: isAm ? "ቦታ ትክክል ነው" : "Location Valid",
      ok: Boolean(inspection.isLocationValid),
    },
    {
      label: isAm ? "መሠረተ ልማት ትክክል ነው" : "Infrastructure Valid",
      ok: Boolean(inspection.isInfrastructureValid),
    },
    {
      label: isAm ? "ስልጠና ትክክል ነው" : "Training Valid",
      ok: Boolean(inspection.isTrainingValid),
    },
  ];

  const rowGap = compact ? 5 : 10;
  const labelSize = compact ? 8 : 10;
  const valueSize = compact ? 10 : 13;
  const sectionPad = compact ? "5px 10px" : "7px 14px";
  const sectionMargin = compact ? 8 : 14;
  const bodyPad = compact ? "10px 18px 14px" : "20px 32px 32px";
  const headerPad = compact ? "14px 18px 12px" : "28px 32px 20px";
  const titleSize = compact ? 17 : 22;

  const formatDate = (value?: string, includeTime = true) =>
    formatInspectionPdfDate(value, { ethiopian: isAm, includeTime });

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div style={{ marginBottom: rowGap }}>
      <div
        style={{
          fontSize: labelSize,
          color: "#6b7280",
          fontWeight: 600,
          marginBottom: 1,
          fontFamily: fontStack,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: valueSize,
          color: "#111827",
          fontWeight: 400,
          fontFamily: fontStack,
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );

  const TwoCol = ({
    left,
    right,
  }: {
    left: React.ReactNode;
    right: React.ReactNode;
  }) => (
    <div style={{ display: "flex", gap: compact ? 14 : 24, marginBottom: 2 }}>
      <div style={{ flex: 1 }}>{left}</div>
      <div style={{ flex: 1 }}>{right}</div>
    </div>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <div
      style={{
        background: "#003366",
        borderRadius: 6,
        padding: sectionPad,
        marginBottom: sectionMargin,
        marginTop: compact ? 4 : 8,
      }}
    >
      <span
        style={{
          color: "#FFD700",
          fontWeight: 700,
          fontSize: compact ? 11 : 13,
          fontFamily: fontStack,
        }}
      >
        {title}
      </span>
    </div>
  );

  const NarrativeText = ({ title, text }: { title: string; text: string }) => (
    <div style={{ marginBottom: compact ? 12 : 18 }}>
      <SectionHeader title={title} />
      <div
        style={{
          background: "#f8fafc",
          border: "1px solid #dce8f0",
          borderRadius: 6,
          padding: compact ? "12px 14px" : "16px 18px",
          borderLeft: "4px solid #003366",
          fontSize: compact ? 10 : 12,
          color: "#1f2937",
          lineHeight: 1.65,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          fontFamily: fontStack,
          minHeight: compact ? 88 : 110,
        }}
      >
        {text || "-"}
      </div>
    </div>
  );

  return (
    <div
      data-inspection-pdf-root
      style={{
        fontFamily: fontStack,
        width: 794,
        background: "#fff",
        padding: 0,
      }}
    >
      <div
        style={{
          background: "#001F3F",
          padding: headerPad,
          borderBottom: "3px solid #FFD700",
        }}
      >
        <div
          style={{
            fontSize: titleSize,
            fontWeight: 800,
            color: "#FFD700",
            marginBottom: compact ? 4 : 6,
            fontFamily: fontStack,
          }}
        >
          {isAm ? "የምርመራ መጨረሻ ሪፖርት" : "Inspection Final Report"}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#c8d8ea",
            fontFamily: fontStack,
          }}
        >
          {organizationName}
          {"  |  "}
          {isAm ? "ምርመራ" : "Inspection"} #{inspection.id}
          {"  |  "}
          {formatDate(inspection.scheduledDate)}
        </div>
      </div>

      <div style={{ padding: bodyPad }}>
        <SectionHeader
          title={isAm ? "የአመልካች መረጃ" : "Applicant Information"}
        />
        <TwoCol
          left={
            <>
              <Row
                label={isAm ? "ሙሉ ስም" : "Full Name"}
                value={display(appUser?.fullName)}
              />
              <Row label={isAm ? "ኢሜይል" : "Email"} value={display(appUser?.email)} />
            </>
          }
          right={
            <>
              <Row label={isAm ? "ስልክ" : "Phone"} value={display(appUser?.phone)} />
              <Row
                label={isAm ? "የማመልከቻ ቀን" : "Application Date"}
                value={formatDate(
                  inspection.application?.applicationDate,
                  false,
                )}
              />
            </>
          }
        />

        <SectionHeader title={isAm ? "የአድራሻ ዝርዝር" : "Address Details"} />
        <TwoCol
          left={
            <>
              <Row label={isAm ? "ክልል" : "Region"} value={region} />
              <Row label={isAm ? "ወረዳ" : "Woreda"} value={woreda} />
              <Row
                label={isAm ? "ልዩ ቦታ" : "Special Location"}
                value={display(addr?.specialLocation)}
              />
            </>
          }
          right={
            <>
              <Row label={isAm ? "ዞን" : "Zone"} value={zone} />
              <Row label={isAm ? "ቀበሌ" : "Kebele"} value={kebele} />
              <Row
                label={isAm ? "የቤት ቁጥር" : "House Number"}
                value={display(addr?.houseNumber)}
              />
            </>
          }
        />

        <SectionHeader title={isAm ? "መሠረተ ልማት" : "Infrastructure"} />
        <TwoCol
          left={
            <>
              <Row
                label={isAm ? "ጠቅላላ ቢሮ ብዛት" : "Total Office Count"}
                value={display(org?.numberOfOffices)}
              />
              <Row
                label={isAm ? "ጠቅላላ ኮምፒዩተር ብዛት" : "Total Computer Count"}
                value={display(org?.numberOfComputers)}
              />
            </>
          }
          right={
            <>
              <Row
                label={isAm ? "ጠቅላላ ተሽከርካሪ ብዛት" : "Total Vehicle Count"}
                value={display(org?.numberOfVehicles)}
              />
              <Row
                label={isAm ? "መጋዘን" : "Storehouse"}
                value={
                  org?.hasStoreHouse
                    ? isAm
                      ? "አዎ"
                      : "Yes"
                    : isAm
                      ? "አይ"
                      : "No"
                }
              />
            </>
          }
        />

        <SectionHeader
          title={isAm ? "የቼክሊስት ውጤቶች" : "Checklist Results"}
        />
        <div
          style={{
            display: "flex",
            gap: compact ? 8 : 12,
            marginBottom: compact ? 8 : 16,
          }}
        >
          {checks.map((check) => (
            <div
              key={check.label}
              style={{
                flex: 1,
                background: check.ok ? "#ecfdf5" : "#fff7ed",
                border: `1px solid ${check.ok ? "#6ee7b7" : "#fcd34d"}`,
                borderRadius: 8,
                padding: compact ? "6px 8px" : "10px 12px",
                fontFamily: fontStack,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: check.ok ? "#065f46" : "#92400e",
                  marginBottom: 4,
                }}
              >
                {check.label}
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: check.ok ? "#059669" : "#d97706",
                }}
              >
                {check.ok
                  ? isAm
                    ? "✓ ተረጋግጧል"
                    : "✓ Confirmed"
                  : isAm
                    ? "✗ አልተረጋገጠም"
                    : "✗ Not Confirmed"}
              </div>
            </div>
          ))}
        </div>

        <NarrativeText
          title={isAm ? "የግኝት ማጠቃለያ" : "Findings Summary"}
          text={display(inspection.findingsSummary)}
        />

        <NarrativeText
          title={isAm ? "የባለሙያ አስተያየት" : "Expert Opinion"}
          text={display(inspection.expertOpinion)}
        />

        <SectionHeader
          title={isAm ? "የምርመራ ኮሚቴ" : "Inspection Committee"}
        />
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: compact ? 9 : 11,
            fontFamily: fontStack,
            pageBreakInside: "avoid",
          }}
        >
          <thead>
            <tr style={{ background: "#003366" }}>
              {(isAm
                ? ["ስም", "ሚና", "ፊርማ", "የተፈረመበት ቀን"]
                : ["Name", "Role", "Signature", "Signed At"]
              ).map((header) => (
                <th
                  key={header}
                  style={{
                    color: "#FFD700",
                    fontWeight: 700,
                    padding: "8px 10px",
                    textAlign: "left",
                    fontSize: 11,
                    fontFamily: fontStack,
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {committeeRows.map((member, index) => (
              <tr
                key={member.id}
                style={{
                  background: index % 2 === 0 ? "#f8fafc" : "#fff",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <td
                  style={{
                    padding: "10px",
                    fontWeight: 700,
                    color: "#003366",
                    fontSize: 11,
                  }}
                >
                  {member.name}
                </td>
                <td style={{ padding: "10px", color: "#374151", fontSize: 11 }}>
                  {member.role}
                </td>
                <td style={{ padding: compact ? "4px 6px" : "6px 10px" }}>
                  {member.signatureSrc ? (
                    <img
                      src={member.signatureSrc}
                      alt=""
                      style={{
                        maxHeight: compact ? 28 : 44,
                        maxWidth: compact ? 90 : 110,
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        color: "#9ca3af",
                        fontStyle: "italic",
                        fontSize: 10,
                      }}
                    >
                      {isAm ? "ፊርማ የለም" : "No signature"}
                    </span>
                  )}
                </td>
                <td style={{ padding: "10px", color: "#374151", fontSize: 10 }}>
                  {member.signedAt ? formatDate(member.signedAt) : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div
          style={{
            marginTop: compact ? 10 : 24,
            paddingTop: compact ? 6 : 12,
            borderTop: "1px solid #e2e8f0",
            fontSize: compact ? 8 : 9,
            color: "#9ca3af",
            fontFamily: fontStack,
            lineHeight: 1.5,
          }}
        >
          {isAm ? "ሪፖርቱን ያመነበት" : "Generated by"} {generatedBy} |{" "}
          {formatDate(new Date().toISOString())}
          <br />
          {isAm
            ? "የኢትዮጵያ ፌዴራል ፖሊስ ኮሚሽን — የግል ጥበቃ ድርጅት ፈቃድ ፖርታል"
            : "Ethiopian Federal Police Commission — Private Security Agency Licensing Portal"}
        </div>
      </div>
    </div>
  );
};

export const waitForPdfFonts = async () => {
  const loads = [
    document.fonts.load('400 14px "Noto Sans Ethiopic"'),
    document.fonts.load('700 14px "Noto Sans Ethiopic"'),
    document.fonts.load('800 22px "Noto Sans Ethiopic"'),
  ];
  await Promise.all(loads);
  await document.fonts.ready;
};
