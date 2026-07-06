//filepath: frontend/src/pages/HRmanagement/IncidentDetailView.tsx
import React, { useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import {
  FileText,
  Calendar,
  Building,
  ShieldAlert,
  DollarSign,
  Users,
  User,
  FileClock,
  AlertCircle,
  ShieldCheck,
  CheckSquare,
  Download,
} from "lucide-react";
import { IncidentReportPDF } from "../../components/IncidentReportPDF";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { apiRequest } from "../../lib/api";
import {
  uploadOrganizationDocuments,
  validateFile,
  formatFileSize,
} from "../../lib/fileUploadHelper";

// TypeScript interfaces matching your Prisma Schema
interface Suspect {
  id: number;
  suspectName: string;
  relationToAgency: string | null;
  employeeId: number | null;
}

interface IncidentReport {
  id: number;
  fileNumber: string;
  reportDate: string;
  organizationId: number;
  organization?: { name: string };
  serviceReceiverName: string;
  crimeType: string;
  crimeInCapitalAmount: number | null;
  incidentStartTimestamp: string;
  crimeCount: number;
  damageDescription: string;
  securityPersonnelCount: number;
  customerPersonnelCount: number;
  otherPartiesCount: number;
  SecurityCustomerOtherBodyCount: number;
  suspectedBodiesCount: number;
  actionTakenStatus: string | null;
  explanation: string | null;
  reporterName: string;
  reporterTitle: string;
  reporterJobResp: string;
  reporterSignatureUrl: string;
  efpOfficerName: string | null;
  efpOfficerTitle: string | null;
  efpOfficerJobResp: string | null;
  efpOfficerSignatureUrl: string | null;
  efpSignDate: string | null;
  superiorName: string | null;
  superiorTitle: string | null;
  superiorJobResp: string | null;
  superiorFeedback: string | null;
  superiorSignatureUrl: string | null;
  superiorSignDate: string | null;
  suspects: Suspect[];
}

interface DetailProps {
  report: IncidentReport;
  onClose?: () => void;
}

export const IncidentReportDetail: React.FC<DetailProps> = ({ report }) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isAmharic = language === "am";
  const labels = {
    incidentCaseProfile: isAmharic ? "የክስተት ጉዳይ መገለጫ" : "Incident Case Profile",
    fileRef: isAmharic ? "የመዝገብ ማጣቀሻ" : "File Ref",
    preparing: isAmharic ? "በማዘጋጀት ላይ..." : "Preparing...",
    downloadPdf: isAmharic ? "ፒዲኤፍ አውርድ" : "Download PDF",
    coreIncidentParticulars: isAmharic
      ? "የክስተት ዋና ዝርዝሮች"
      : "Core Incident Particulars",
    serviceReceiverLabel: isAmharic
      ? "የአገልግሎት ተቀባይ (ደንበኛ ቦታ)"
      : "Service Receiver (Client Location)",
    crimeTypeLabel: isAmharic ? "የወንጀል አይነት" : "Categorized Crime Type",
    occurrenceTimelineLabel: isAmharic
      ? "የክስተት ሰዓት መስመር"
      : "Incident Occurrence Timeline",
    financialImpactLabel: isAmharic
      ? "የገንዘብ ተጽእኖ (ETB)"
      : "Evaluated Financial Impact (ETB)",
    filingDateLabel: isAmharic ? "የመዝገብ ቀን" : "Filing Document Date",
    crimeCountLabel: isAmharic ? "የወንጀል ብዛት" : "Distinct Crime Counts",
    damageTitle: isAmharic
      ? "የጉዳት እና የኪሳራ መግለጫ"
      : "Concrete Log of Damage & Asset Loss",
    actionTakenTitle: isAmharic ? "የተወሰደው እርምጃ ሁኔታ" : "Action Taken Status",
    explanationTitle: isAmharic
      ? "ተጨማሪ ማብራሪያ"
      : "Additional Agency Explanatory Context",
    sceneSummaryTitle: isAmharic ? "የቦታ ስብስብ ማጠቃለያ" : "Scene Presence Summary",
    onDutyGuardsLabel: isAmharic ? "በሥራ ላይ ያሉ ጠባቂዎች" : "On-Duty Guards",
    clientStaffLabel: isAmharic ? "የደንበኛ ሰራተኞች" : "Client Staff",
    bystandersLabel: isAmharic ? "ታዳሚዎች" : "Bystanders",
    aggregateCountLabel: isAmharic ? "አጠቃላይ ብዛት" : "Aggregate Count",
    suspectsTitle: isAmharic ? "የተጠርጣሪዎች ዝርዝር" : "Implicated Suspects",
    suspectNameLabel: isAmharic ? "ሙሉ ስም" : "Suspect Full Name",
    relationLabel: isAmharic ? "ከተቋሙ ጋር ያለው ግንኙነት" : "Relation To Institution",
    typeLabel: isAmharic ? "አይነት" : "Type",
    internalEmployeeLabel: isAmharic ? "የውስጥ ሰራተኛ" : "Internal Employee",
    externalEntityLabel: isAmharic ? "የውጭ አካል" : "External Entity",
    noSuspectsLabel: isAmharic
      ? "ምንም ተጠርጣሪ አልተዘረዘረም።"
      : "No explicit suspects listed.",
    adminSignoffTitle: isAmharic
      ? "የአስተዳደር ማረጋገጫ እና የከፍተኛ ተቆጣጣሪ አስተያየት"
      : "Administrative Signoff & Superior Feedback",
    efpOfficerSignoffTitle: isAmharic
      ? "የኤፍፒ ኦፊሰር ማረጋገጫ"
      : "EFP Officer Signoff",
    superiorFeedbackTitle: isAmharic
      ? "የከፍተኛ ተቆጣጣሪ አስተያየት እና ማረጋገጫ"
      : "Superior Feedback & Sign-off",
    officerNamePlaceholder: isAmharic ? "የኦፊሰር ሙሉ ስም" : "Officer full name",
    officerTitlePlaceholder: isAmharic ? "የኦፊሰር ማዕረግ" : "Officer title",
    officerJobPlaceholder: isAmharic ? "የሥራ ኃላፊነት" : "Job responsibility",
    superiorNamePlaceholder: isAmharic
      ? "የከፍተኛ ተቆጣጣሪ ሙሉ ስም"
      : "Superior full name",
    superiorTitlePlaceholder: isAmharic ? "የከፍተኛ ተቆጣጣሪ ማዕረግ" : "Superior title",
    superiorFeedbackPlaceholder: isAmharic
      ? "የአስተያየት / የመመሪያ ማስታወሻዎች"
      : "Feedback / directive notes",
    recordedOffenseLabel: isAmharic ? "የተመዘገበ ወንጀል" : "Recorded Offense",
    recordedOffensesLabel: isAmharic ? "የተመዘገበ ወንጀል" : "Recorded Offenses",
    unspecifiedLabel: isAmharic ? "ያልተገለጸ" : "Unspecified",
    signatureImageLabel: isAmharic ? "የፊርማ ምስል" : "Signature Image",
    removeLabel: isAmharic ? "አስወግድ" : "Remove",
    invalidFileLabel: isAmharic ? "ልክ ያልሆነ ፋይል" : "Invalid file",
    unknownOrganizationLabel: isAmharic ? "ያልታወቀ ድርጅት" : "Unknown Organization",
    pleaseProvideOfficerName: isAmharic
      ? "እባክዎ ከመቀመጥዎ በፊት የኦፊሰር ስም ያቅርቡ።"
      : "Please provide officer name before saving.",
    pleaseProvideOfficerAndSignature: isAmharic
      ? "እባክዎ ከመቀመጥዎ በፊት የኦፊሰር ስም እና ፊርማ ይስጡ።"
      : "Please provide officer name and upload a signature before saving.",
    pleaseProvideDirectiveNotes: isAmharic
      ? "እባክዎ ከመቀመጥዎ በፊት የመመሪያ ማስታወሻዎች ያቅርቡ።"
      : "Please provide directive notes before saving.",
    pleaseProvideDirectiveAndSignature: isAmharic
      ? "እባክዎ ከመቀመጥዎ በፊት የመመሪያ ማስታወሻዎች እና ፊርማ ይስጡ።"
      : "Please provide directive notes and upload a signature before saving.",
    efpSavedMessage: isAmharic ? "የኤፍፒ ማረጋገጫ ተቀምጧል።" : "EFP sign-off saved.",
    superiorSavedMessage: isAmharic
      ? "የከፍተኛ ተቆጣጣሪ አስተያየት ተቀምጧል።"
      : "Superior feedback saved.",
    uploadFailedMessage: isAmharic ? "መጫን አልተሳካም:" : "Upload failed:",
    saveFailedMessage: isAmharic ? "ማስቀመጥ አልተሳካም:" : "Failed to save:",
    saveEfpLabel: isAmharic ? "የኤፍፒ ማረጋገጫ አስቀምጥ" : "Save EFP Sign-off",
    savingLabel: isAmharic ? "በማስቀመጥ ላይ..." : "Saving...",
    saveSuperiorLabel: isAmharic
      ? "የከፍተኛ ተቆጣጣሪ አስተያየት አስቀምጥ"
      : "Save Superior Feedback",
    authenticationTitle: isAmharic
      ? "የማረጋገጫ እና የግምገማ ሰንሰለት"
      : "Authentication & Chain of Review Verification",
    submittingReporterLabel: isAmharic
      ? "1. የማቅረቢያ አሳዳጊ"
      : "1. Submitting Reporter",
    federalPoliceAuditorLabel: isAmharic
      ? "2. የፌዴራል ፖሊስ ተመራማሪ"
      : "2. Federal Police Auditor",
    highCommandDirectivesLabel: isAmharic
      ? "3. የከፍተኛ ትዕዛዝ መመሪያ"
      : "3. High Command Directives",
    awaitingAllocationLabel: isAmharic
      ? "ወደ መስክ የመረመረ ባለሙያ በመጠበቅ ላይ"
      : "Awaiting allocation to field investigative professional.",
    pendingReviewAuthorityLabel: isAmharic
      ? "የግምገማ ስልጣን አስተያየት በመጠበቅ ላይ"
      : "Pending Review Authority feedback validation loop.",
    secureStampLabel: isAmharic ? "ደህንነቱ የተጠበቀ ማህተም" : "Secure Stamp Signature",
    officialEfpEndorsementLabel: isAmharic
      ? "ኦፊሴላዊ የኤፍፒ ማረጋገጫ"
      : "Official EFP Endorsement",
    superiorCommandSignoffLabel: isAmharic
      ? "የከፍተኛ ትዕዛዝ ማረጋገጫ"
      : "Superior Command Sign-off",
    commandDirectiveNotesLabel: isAmharic
      ? "የትዕዛዝ ማሳሰቢያዎች:"
      : "Command Directive Notes:",
    scopeLabel: isAmharic ? "ዓላማ:" : "Scope:",
    assignmentLabel: isAmharic ? "ተመድቧል:" : "Assignment:",
    auditedOnLabel: isAmharic ? "ተመረመረበት:" : "Audited on:",
    executiveSignoffLabel: isAmharic ? "የአስተዳደር ማረጋገጫ:" : "Executive signoff:",
  };
  const isPrivileged =
    !!user &&
    (user.roles.includes("admin") || user.roles.includes("super_admin"));
  const actionTakenValue = report.actionTakenStatus;

  // EFP officer signoff state
  const [efpName, setEfpName] = useState(report.efpOfficerName ?? "");
  const [efpTitle, setEfpTitle] = useState(report.efpOfficerTitle ?? "");
  const [efpJob, setEfpJob] = useState(report.efpOfficerJobResp ?? "");
  const [efpSignatureUrl, setEfpSignatureUrl] = useState(
    report.efpOfficerSignatureUrl ?? "",
  );
  const [efpLoading, setEfpLoading] = useState(false);
  const [efpFile, setEfpFile] = useState<File | null>(null);
  const [efpPreview, setEfpPreview] = useState<string | null>(null);
  const [efpUploading, setEfpUploading] = useState(false);

  // Superior feedback state
  const [supName, setSupName] = useState(report.superiorName ?? "");
  const [supTitle, setSupTitle] = useState(report.superiorTitle ?? "");
  const [supJob, setSupJob] = useState(report.superiorJobResp ?? "");
  const [supFeedback, setSupFeedback] = useState(report.superiorFeedback ?? "");
  const [supSignatureUrl, setSupSignatureUrl] = useState(
    report.superiorSignatureUrl ?? "",
  );
  const [supLoading, setSupLoading] = useState(false);
  const [supFile, setSupFile] = useState<File | null>(null);
  const [supPreview, setSupPreview] = useState<string | null>(null);
  const [supUploading, setSupUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleEfpSign = async () => {
    if (!isPrivileged) return;
    setEfpLoading(true);
    setMessage(null);
    try {
      if (!efpName) {
        setMessage(labels.pleaseProvideOfficerName);
        return;
      }

      let signatureUrl = efpSignatureUrl;
      if (!signatureUrl) {
        if (efpFile) {
          const uploadedUrl = await uploadEfpSignature();
          if (!uploadedUrl) {
            return;
          }
          signatureUrl = uploadedUrl;
        } else {
          setMessage(labels.pleaseProvideOfficerAndSignature);
          return;
        }
      }

      await apiRequest(`/incident-reports/${report.id}/efp-sign`, {
        method: "PATCH",
        body: JSON.stringify({
          efpOfficerName: efpName,
          efpOfficerTitle: efpTitle,
          efpOfficerJobResp: efpJob,
          efpOfficerSignatureUrl: signatureUrl,
        }),
      });
      setMessage(labels.efpSavedMessage);
    } catch (err: any) {
      setMessage(`${labels.saveFailedMessage} ${err?.message || String(err)}`);
    } finally {
      setEfpLoading(false);
    }
  };

  const handleSuperiorSubmit = async () => {
    if (!isPrivileged) return;
    setSupLoading(true);
    setMessage(null);
    try {
      // Client-side validation: backend requires feedback text and signature URL
      if (!supFeedback) {
        setMessage(labels.pleaseProvideDirectiveNotes);
        return;
      }

      let signatureUrl = supSignatureUrl;
      if (!signatureUrl) {
        if (supFile) {
          const uploadedUrl = await uploadSupSignature();
          if (!uploadedUrl) {
            return;
          }
          signatureUrl = uploadedUrl;
        } else {
          setMessage(labels.pleaseProvideDirectiveAndSignature);
          return;
        }
      }

      await apiRequest(`/incident-reports/${report.id}/superior-feedback`, {
        method: "PATCH",
        body: JSON.stringify({
          superiorName: supName,
          superiorTitle: supTitle,
          superiorJobResp: supJob,
          superiorFeedback: supFeedback,
          superiorSignatureUrl: signatureUrl,
        }),
      });
      setMessage(labels.superiorSavedMessage);
    } catch (err: any) {
      setMessage(`${labels.saveFailedMessage} ${err?.message || String(err)}`);
    } finally {
      setSupLoading(false);
    }
  };

  // File selection handlers
  const orgNameForUpload =
    (report as any).organization?.nameEnglish ||
    (report as any).organization?.name ||
    labels.unknownOrganizationLabel;

  const onEfpFileChange = (f?: File) => {
    if (!f) return;
    const valid = validateFile(f);
    if (!valid.valid) {
      setMessage(valid.error ?? "Invalid file");
      return;
    }
    setEfpFile(f);
    setEfpPreview(URL.createObjectURL(f));
  };

  const removeEfpFile = () => {
    if (efpPreview) URL.revokeObjectURL(efpPreview);
    setEfpFile(null);
    setEfpPreview(null);
  };

  const uploadEfpSignature = async (): Promise<string | null> => {
    if (!efpFile) return null;
    setEfpUploading(true);
    setMessage(null);
    try {
      const filesMap = { organization_efp_signature: efpFile } as Record<
        string,
        File
      >;
      const res = await uploadOrganizationDocuments(
        orgNameForUpload,
        filesMap,
        {
          context: "incident_signature",
          incidentId: String(report.id),
        },
      );
      if (!res.success || !res.data) {
        throw new Error(res.message || "Upload failed");
      }
      const url = res.data.uploadedFiles?.organization_efp_signature;
      if (!url) {
        throw new Error("Upload did not return file URL");
      }
      setEfpSignatureUrl(url);
      removeEfpFile();
      return url;
    } catch (err: any) {
      setMessage(`Upload failed: ${err?.message || String(err)}`);
      return null;
    } finally {
      setEfpUploading(false);
    }
  };

  const onSupFileChange = (f?: File) => {
    if (!f) return;
    const valid = validateFile(f);
    if (!valid.valid) {
      setMessage(valid.error ?? "Invalid file");
      return;
    }
    setSupFile(f);
    setSupPreview(URL.createObjectURL(f));
  };

  const removeSupFile = () => {
    if (supPreview) URL.revokeObjectURL(supPreview);
    setSupFile(null);
    setSupPreview(null);
  };

  const uploadSupSignature = async (): Promise<string | null> => {
    if (!supFile) return null;
    setSupUploading(true);
    setMessage(null);
    try {
      const filesMap = { organization_superior_signature: supFile } as Record<
        string,
        File
      >;
      const res = await uploadOrganizationDocuments(
        orgNameForUpload,
        filesMap,
        {
          context: "incident_signature",
          incidentId: String(report.id),
        },
      );
      if (!res.success || !res.data) {
        throw new Error(res.message || "Upload failed");
      }
      const url = res.data.uploadedFiles?.organization_superior_signature;
      if (!url) {
        throw new Error("Upload did not return file URL");
      }
      setSupSignatureUrl(url);
      removeSupFile();
      return url;
    } catch (err: any) {
      setMessage(`Upload failed: ${err?.message || String(err)}`);
      return null;
    } finally {
      setSupUploading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-[#f7fbff] min-h-screen p-6 rounded-xl shadow-sm border border-[#003162]/20">
      {/* HEADER ACTION BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-[#003162]/20 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 bg-[#003162] rounded-lg text-[#FFD700]">
              <ShieldAlert size={24} />
            </span>
            <div>
              <h1 className="text-xl font-bold text-[#003162] tracking-tight">
                {labels.incidentCaseProfile}
              </h1>
              <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                <FileText size={14} /> {labels.fileRef}:{" "}
                <span className="font-semibold text-slate-700">
                  {report.fileNumber}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <PDFDownloadLink
            document={<IncidentReportPDF data={report} language={language} />}
            fileName={`${(report.fileNumber || "incident-report").replace(/[^a-zA-Z0-9]/g, "_")}.pdf`}
            className="inline-flex items-center gap-2 rounded-lg border border-[#003162] bg-[#003162] px-3 py-2 text-sm font-semibold text-[#FFD700] transition hover:bg-[#002b4d]"
          >
            {({ loading }) => (
              <>
                <Download size={16} />
                {loading ? labels.preparing : labels.downloadPdf}
              </>
            )}
          </PDFDownloadLink>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT & CENTER COLUMNS (MAIN METADATA & NARRATIVE) */}
        <div className="lg:col-span-2 space-y-6">
          {/* CORE METADATA GRID */}
          <div className="bg-white p-6 rounded-xl border border-[#003162]/15 shadow-sm">
            <h2 className="text-sm font-semibold text-[#003162] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Building size={16} className="text-[#003162]" />{" "}
              {labels.coreIncidentParticulars}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
              <div>
                <span className="text-xs font-medium text-slate-400 block uppercase">
                  {labels.serviceReceiverLabel}
                </span>
                <span className="text-sm font-semibold text-slate-700">
                  {report.serviceReceiverName}
                </span>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400 block uppercase">
                  {labels.crimeTypeLabel}
                </span>
                <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <AlertCircle size={15} className="text-rose-500" />{" "}
                  {report.crimeType}
                </span>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400 block uppercase">
                  {labels.occurrenceTimelineLabel}
                </span>
                <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <Calendar size={15} className="text-slate-400" />
                  {new Date(report.incidentStartTimestamp).toLocaleString(
                    "en-US",
                    { hour12: true },
                  )}
                </span>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400 block uppercase">
                  {labels.financialImpactLabel}
                </span>
                <span className="text-sm font-bold text-slate-800 flex items-center gap-0.5">
                  <DollarSign size={15} className="text-emerald-600" />
                  {report.crimeInCapitalAmount
                    ? Number(report.crimeInCapitalAmount).toLocaleString(
                        undefined,
                        { minimumFractionDigits: 2 },
                      )
                    : "0.00"}{" "}
                  ETB
                </span>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400 block uppercase">
                  {labels.filingDateLabel}
                </span>
                <span className="text-sm font-medium text-slate-600">
                  {new Date(report.reportDate).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400 block uppercase">
                  {labels.crimeCountLabel}
                </span>
                <span className="text-sm font-semibold text-slate-700">
                  {report.crimeCount}{" "}
                  {report.crimeCount === 1
                    ? labels.recordedOffenseLabel
                    : labels.recordedOffensesLabel}
                </span>
              </div>
            </div>
          </div>

          {/* DAMAGE & NARRATIVE CARD */}
          <div className="bg-white p-6 rounded-xl border border-[#003162]/15 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-[#003162] uppercase tracking-wider mb-2 flex items-center gap-2">
                <FileText size={16} className="text-[#003162]" />{" "}
                {labels.damageTitle}
              </h2>
              <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100 leading-relaxed whitespace-pre-line">
                {report.damageDescription}
              </p>
            </div>
            {actionTakenValue && (
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  {labels.actionTakenTitle}
                </h3>
                <p className="text-sm text-[#003162] bg-[#f7fbff] p-4 rounded-lg border border-[#003162]/15 leading-relaxed">
                  {actionTakenValue}
                </p>
              </div>
            )}

            {report.explanation && (
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  {labels.explanationTitle}
                </h3>
                <p className="text-sm text-slate-600 bg-slate-50/50 p-4 rounded-lg border border-dashed border-slate-200 leading-relaxed">
                  {report.explanation}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (HEADCOUNTS & SUSPECTS) */}
        <div className="space-y-6">
          {/* HEADCOUNT STATS BLOCK */}
          <div className="bg-white p-6 rounded-xl border border-[#003162]/15 shadow-sm">
            <h2 className="text-sm font-semibold text-[#003162] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Users size={16} className="text-[#003162]" />{" "}
              {labels.sceneSummaryTitle}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                <span className="text-xl font-bold text-slate-800 block">
                  {report.securityPersonnelCount}
                </span>
                <span className="text-xxs uppercase font-medium text-slate-400">
                  {labels.onDutyGuardsLabel}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                <span className="text-xl font-bold text-slate-800 block">
                  {report.customerPersonnelCount}
                </span>
                <span className="text-xxs uppercase font-medium text-slate-400">
                  {labels.clientStaffLabel}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                <span className="text-xl font-bold text-slate-800 block">
                  {report.otherPartiesCount}
                </span>
                <span className="text-xxs uppercase font-medium text-slate-400">
                  {labels.bystandersLabel}
                </span>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-center">
                <span className="text-xl font-bold text-blue-700 block">
                  {report.SecurityCustomerOtherBodyCount}
                </span>
                <span className="text-xxs uppercase font-bold text-blue-500">
                  {labels.aggregateCountLabel}
                </span>
              </div>
            </div>
          </div>

          {/* SUSPECTS PROFILE ROUTER LIST */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <User size={16} className="text-rose-600" />{" "}
                {labels.suspectsTitle}({report.suspectedBodiesCount})
              </h2>
            </div>

            {report.suspects && report.suspects.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {labels.suspectNameLabel}
                      </th>
                      <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {labels.relationLabel}
                      </th>
                      <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {labels.typeLabel}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {report.suspects.map((suspect) => (
                      <tr key={suspect.id} className="hover:bg-slate-50">
                        <td className="px-3 py-3 font-medium text-slate-700">
                          {suspect.suspectName}
                        </td>
                        <td className="px-3 py-3 text-slate-600">
                          {suspect.relationToAgency || labels.unspecifiedLabel}
                        </td>
                        <td className="px-3 py-3">
                          {suspect.employeeId ? (
                            <span className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-600">
                              {labels.internalEmployeeLabel}
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                              {labels.externalEntityLabel}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 py-6 text-center text-sm text-slate-400">
                {labels.noSuspectsLabel}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Privileged EFP / Superior update form (admin / super_admin only) */}
      {isPrivileged && (
        <div className="mt-4 bg-white p-6 rounded-xl border border-[#003162]/15 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">
            {labels.adminSignoffTitle}
          </h3>
          {message && (
            <div className="mb-4 rounded-md bg-emerald-50 border border-emerald-100 p-3 text-sm text-emerald-800">
              {message}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* EFP Officer Signoff */}
            <div>
              <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3">
                {labels.efpOfficerSignoffTitle}
              </h4>
              <div className="space-y-3">
                <input
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  placeholder={labels.officerNamePlaceholder}
                  value={efpName}
                  onChange={(e) => setEfpName(e.target.value)}
                />
                <input
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  placeholder={labels.officerTitlePlaceholder}
                  value={efpTitle}
                  onChange={(e) => setEfpTitle(e.target.value)}
                />
                <input
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  placeholder={labels.officerJobPlaceholder}
                  value={efpJob}
                  onChange={(e) => setEfpJob(e.target.value)}
                />
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-2">
                    {labels.signatureImageLabel}
                  </label>
                  {efpPreview ? (
                    <div className="flex items-start gap-3">
                      <img
                        src={efpPreview}
                        alt="Preview"
                        className="h-20 w-32 object-contain rounded-md border"
                      />
                      <div className="flex flex-col gap-2">
                        <div className="text-sm text-slate-600">
                          {efpFile?.name}
                        </div>
                        <div className="text-xxs text-slate-400">
                          {efpFile ? formatFileSize(efpFile.size) : ""}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={removeEfpFile}
                            className="rounded-md border px-2 py-1 text-sm"
                          >
                            {labels.removeLabel}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <input
                        id="efp-sign-file"
                        type="file"
                        accept="image/*"
                        onChange={(e) => onEfpFileChange(e.target.files?.[0])}
                        disabled={efpUploading}
                        className="w-full text-sm"
                      />
                    </div>
                  )}
                  {/* Metadata save button */}
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      type="button"
                      onClick={handleEfpSign}
                      disabled={efpLoading}
                      className="inline-flex items-center gap-2 rounded-md bg-[#003162] px-3 py-2 text-sm font-semibold text-[#FFD700] hover:bg-[#002b4d] disabled:opacity-60"
                    >
                      {efpLoading ? labels.savingLabel : labels.saveEfpLabel}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Superior Feedback */}
            <div>
              <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3">
                {labels.superiorFeedbackTitle}
              </h4>
              <div className="space-y-3">
                <input
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  placeholder={labels.superiorNamePlaceholder}
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                />
                <input
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  placeholder={labels.superiorTitlePlaceholder}
                  value={supTitle}
                  onChange={(e) => setSupTitle(e.target.value)}
                />
                <input
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  placeholder={labels.officerJobPlaceholder}
                  value={supJob}
                  onChange={(e) => setSupJob(e.target.value)}
                />
                <textarea
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm min-h-[92px]"
                  placeholder={labels.superiorFeedbackPlaceholder}
                  value={supFeedback}
                  onChange={(e) => setSupFeedback(e.target.value)}
                />
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-2">
                    {labels.signatureImageLabel}
                  </label>
                  {supPreview ? (
                    <div className="flex items-start gap-3">
                      <img
                        src={supPreview}
                        alt="Preview"
                        className="h-20 w-32 object-contain rounded-md border"
                      />
                      <div className="flex flex-col gap-2">
                        <div className="text-sm text-slate-600">
                          {supFile?.name}
                        </div>
                        <div className="text-xxs text-slate-400">
                          {supFile ? formatFileSize(supFile.size) : ""}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={removeSupFile}
                            className="rounded-md border px-2 py-1 text-sm"
                          >
                            {labels.removeLabel}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <input
                        id="sup-sign-file"
                        type="file"
                        accept="image/*"
                        onChange={(e) => onSupFileChange(e.target.files?.[0])}
                        disabled={supUploading}
                        className="w-full text-sm"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      type="button"
                      onClick={handleSuperiorSubmit}
                      disabled={supLoading}
                      className="inline-flex items-center gap-2 rounded-md bg-[#003162] px-3 py-2 text-sm font-semibold text-[#FFD700] hover:bg-[#002b4d] disabled:opacity-60"
                    >
                      {supLoading
                        ? labels.savingLabel
                        : labels.saveSuperiorLabel}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* THREE-COLUMN WORKFLOW ACCOUNTABILITY & SIGNATURE PANEL */}
      <div className="mt-6 bg-white rounded-xl border border-[#003162]/15 shadow-sm overflow-hidden">
        <div className="bg-slate-100 px-6 py-3 border-b border-slate-200">
          <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
            <CheckSquare size={15} /> {labels.authenticationTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {/* ACTOR 1: ORIGINAL COMPLIANCE REPORTER */}
          <div className="p-6 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xxs font-bold text-blue-600 uppercase tracking-wider block mb-2 flex items-center gap-1">
                <FileClock size={12} /> {labels.submittingReporterLabel}
              </span>
              <h3 className="text-base font-bold text-slate-800">
                {report.reporterName}
              </h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                {report.reporterTitle}
              </p>
              <p className="text-xs text-slate-400 mt-2 italic leading-relaxed">
                {labels.scopeLabel} {report.reporterJobResp}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <span className="text-xxs text-slate-400 uppercase font-medium tracking-wider block mb-1">
                {labels.secureStampLabel}
              </span>
              <div className="h-16 w-full bg-slate-50 border border-slate-200 rounded flex items-center justify-center overflow-hidden p-2">
                <img
                  src={report.reporterSignatureUrl}
                  alt="Reporter Signature"
                  className="max-h-full max-w-full object-contain mix-blend-multiply"
                />
              </div>
            </div>
          </div>

          {/* ACTOR 2: RECEIVING FEDERAL POLICE AUDITOR */}
          <div className="p-6 flex flex-col justify-between space-y-4 bg-slate-50/30">
            <div>
              <span className="text-xxs font-bold text-indigo-600 uppercase tracking-wider block mb-2 flex items-center gap-1">
                <ShieldCheck size={12} /> {labels.federalPoliceAuditorLabel}
              </span>
              {report.efpOfficerName ? (
                <>
                  <h3 className="text-base font-bold text-slate-800">
                    {report.efpOfficerName}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    {report.efpOfficerTitle}
                  </p>
                  <p className="text-xs text-slate-400 mt-2 italic">
                    {labels.assignmentLabel} {report.efpOfficerJobResp}
                  </p>
                  {report.efpSignDate && (
                    <p className="text-xxs text-slate-400 mt-1">
                      {labels.auditedOnLabel}{" "}
                      {new Date(report.efpSignDate).toLocaleDateString()}
                    </p>
                  )}
                </>
              ) : (
                <div className="text-slate-400 text-xs italic py-4">
                  {labels.awaitingAllocationLabel}
                </div>
              )}
            </div>

            {report.efpOfficerName && report.efpOfficerSignatureUrl && (
              <div className="pt-4 border-t border-slate-100">
                <span className="text-xxs text-slate-400 uppercase font-medium tracking-wider block mb-1">
                  Official EFP Endorsement
                </span>
                <div className="h-16 w-full bg-slate-50 border border-slate-200 rounded flex items-center justify-center overflow-hidden p-2">
                  <img
                    src={report.efpOfficerSignatureUrl}
                    alt="EFP Officer Signature"
                    className="max-h-full max-w-full object-contain mix-blend-multiply"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ACTOR 3: COMMAND SUPERVISOR REVIEWER */}
          <div className="p-6 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xxs font-bold text-emerald-600 uppercase tracking-wider block mb-2 flex items-center gap-1">
                <CheckSquare size={12} /> {labels.highCommandDirectivesLabel}
              </span>
              {report.superiorName ? (
                <>
                  <h3 className="text-base font-bold text-slate-800">
                    {report.superiorName}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    {report.superiorTitle}
                  </p>
                  <div className="mt-2 p-2 bg-emerald-50/50 border border-emerald-100 rounded text-xs text-slate-600">
                    <span className="font-semibold text-emerald-800 block mb-0.5">
                      {labels.commandDirectiveNotesLabel}
                    </span>
                    {report.superiorFeedback}
                  </div>
                  {report.superiorSignDate && (
                    <p className="text-xxs text-slate-400 mt-2">
                      {labels.executiveSignoffLabel}{" "}
                      {new Date(report.superiorSignDate).toLocaleDateString()}
                    </p>
                  )}
                </>
              ) : (
                <div className="text-slate-400 text-xs italic py-4">
                  {labels.pendingReviewAuthorityLabel}
                </div>
              )}
            </div>

            {report.superiorName && report.superiorSignatureUrl && (
              <div className="pt-4 border-t border-slate-100">
                <span className="text-xxs text-slate-400 uppercase font-medium tracking-wider block mb-1">
                  Superior Command Sign-off
                </span>
                <div className="h-16 w-full bg-slate-50 border border-slate-200 rounded flex items-center justify-center overflow-hidden p-2">
                  <img
                    src={report.superiorSignatureUrl}
                    alt="Superior Signature"
                    className="max-h-full max-w-full object-contain mix-blend-multiply"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
