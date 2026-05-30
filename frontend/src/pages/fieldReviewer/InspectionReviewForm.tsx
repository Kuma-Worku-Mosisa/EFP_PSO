 // filepath: frontend/src/pages/fieldReviewer/InspectionReviewForm.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Link, useParams } from "react-router-dom";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import {
  InspectionReportPdfTemplate,
  waitForPdfFonts,
  type CommitteePdfRow,
} from "./InspectionReportPdfTemplate";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
  Save,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Download,
  Eye,
  UploadCloud,
  PenLine,
  X,
} from "lucide-react";
import { motion } from "motion/react";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { apiRequest } from "../../lib/api";

type InspectionDetail = {
  id: number;
  scheduledDate?: string;
  status?: string | null;
  isLocationValid?: boolean;
  isInfrastructureValid?: boolean;
  isTrainingValid?: boolean;
  findingsSummary?: string | null;
  expertOpinion?: string | null;
  finalReportUrl?: string | null;
  application?: {
    id: number;
    status?: string | null;
    applicationDate?: string;
    organization?: {
      id?: number;
      nameEnglish?: string | null;
      nameAmharic?: string | null;
      addressId?: number | null;
      numberOfOffices?: number | null;
      numberOfVehicles?: number | null;
      numberOfComputers?: number | null;
      hasStoreHouse?: boolean | null;
      address?: {
        id?: number;
        houseNumber?: string | null;
        specialLocation?: string | null;
        kebele?: {
          id?: number;
          nameEnglish?: string | null;
          nameAmharic?: string | null;
          woreda?: {
            id?: number;
            nameEnglish?: string | null;
            nameAmharic?: string | null;
            zone?: {
              id?: number;
              nameEnglish?: string | null;
              nameAmharic?: string | null;
              region?: {
                id?: number;
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

type ReviewFormState = {
  isLocationValid: boolean;
  isInfrastructureValid: boolean;
  isTrainingValid: boolean;
  findingsSummary: string;
  expertOpinion: string;
  finalReportUrl: string;
};

type ReviewSection = "checklist" | "status" | "snapshot";

const formatDateTime = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const FILE_ORIGIN = import.meta.env.DEV ? "http://localhost:5000" : "";

const resolveFileUrl = (fileUrl?: string | null) => {
  if (!fileUrl) return "";
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
  return `${FILE_ORIGIN}/${fileUrl.replace(/^\/+/, "")}`;
};

const toggleButtonClass = (value: boolean) =>
  value ? "ring-2 ring-[#003366]/15" : "hover:shadow-sm";

const indicatorClass = (value: boolean) =>
  value
    ? "border-[#003366] bg-[#003366] text-white shadow-sm"
    : "border-[#003366] bg-white text-transparent shadow-sm";

const fetchImageAsDataUrl = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load image: ${response.statusText}`);
  }

  const blob = await response.blob();

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read image data."));
    reader.readAsDataURL(blob);
  });
};

const initialState: ReviewFormState = {
  isLocationValid: false,
  isInfrastructureValid: false,
  isTrainingValid: false,
  findingsSummary: "",
  expertOpinion: "",
  finalReportUrl: "",
};

export const InspectionReviewForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const { language } = useLanguage();
  const isAm = language === "am";
  const inspectionId = Number(id);
  const [inspection, setInspection] = useState<InspectionDetail | null>(null);
  const [form, setForm] = useState<ReviewFormState>(initialState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reportGenerating, setReportGenerating] = useState(false);
  const [pdfActionLoading, setPdfActionLoading] = useState<
    "view" | "download" | null
  >(null);
  const [signatureUploadingId, setSignatureUploadingId] = useState<
    number | null
  >(null);
  const [signatureClearingId, setSignatureClearingId] = useState<
    number | null
  >(null);
  const [leadUploading, setLeadUploading] = useState(false);
  const [pdfLanguage, setPdfLanguage] = useState<"en" | "am">(
    language === "am" ? "am" : "en",
  );
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const pdfTemplateRef = useRef<HTMLDivElement>(null);
  const pdfTemplateRootRef = useRef<Root | null>(null);
  const [activeSection, setActiveSection] =
    useState<ReviewSection>("checklist");

  useEffect(() => {
    setPdfLanguage(language === "am" ? "am" : "en");
  }, [language]);

  useEffect(() => {
    let active = true;

    const loadInspection = async () => {
      try {
        const response = await apiRequest(`/inspections/${inspectionId}`);
        const data = (response as any)?.data ?? response;

        if (!active) return;

        setInspection(data);
        setForm({
          isLocationValid: Boolean(data?.isLocationValid),
          isInfrastructureValid: Boolean(data?.isInfrastructureValid),
          isTrainingValid: Boolean(data?.isTrainingValid),
          findingsSummary: data?.findingsSummary ?? "",
          expertOpinion: data?.expertOpinion ?? "",
          finalReportUrl: data?.finalReportUrl ?? "",
        });
      } catch (requestError) {
        if (!active) return;
        console.error("Failed to load inspection", requestError);
        setError("Unable to load the inspection review form.");
      } finally {
        if (active) setLoading(false);
      }
    };

    if (Number.isFinite(inspectionId) && inspectionId > 0) {
      loadInspection();
    } else {
      setError("Invalid inspection id.");
      setLoading(false);
    }

    return () => {
      active = false;
    };
  }, [inspectionId]);

  const organizationName = useMemo(
    () =>
      inspection?.application?.organization?.nameEnglish ||
      inspection?.application?.organization?.nameAmharic ||
      `Inspection #${inspection?.id ?? inspectionId}`,
    [inspection, inspectionId],
  );

  const overallReady =
    form.isLocationValid && form.isInfrastructureValid && form.isTrainingValid;

  const sectionTabs: Array<{
    id: ReviewSection;
    label: string;
    count?: string;
  }> = [
    { id: "checklist", label: isAm ? "ቼክሊስት ግምገማ" : "Checklist Review" },
    { id: "status", label: isAm ? "የግምገማ ሁኔታ" : "Review Status" },
    { id: "snapshot", label: isAm ? "የማመልከቻ ዝርዝር" : "Application Snapshot" },
  ];

  const handleToggle = (
    field: keyof Pick<
      ReviewFormState,
      "isLocationValid" | "isInfrastructureValid" | "isTrainingValid"
    >,
  ) => {
    setForm((current) => ({ ...current, [field]: !current[field] }));
  };

  const organizationAddress = inspection?.application?.organization?.address;

  const addressRows = [
    {
      label: "Region",
      value:
        organizationAddress?.kebele?.woreda?.zone?.region?.nameEnglish ||
        organizationAddress?.kebele?.woreda?.zone?.region?.nameAmharic,
    },
    {
      label: "Zone",
      value:
        organizationAddress?.kebele?.woreda?.zone?.nameEnglish ||
        organizationAddress?.kebele?.woreda?.zone?.nameAmharic,
    },
    {
      label: "Woreda",
      value:
        organizationAddress?.kebele?.woreda?.nameEnglish ||
        organizationAddress?.kebele?.woreda?.nameAmharic,
    },
    {
      label: "Kebele",
      value:
        organizationAddress?.kebele?.nameEnglish ||
        organizationAddress?.kebele?.nameAmharic,
    },
    {
      label: "Special Location",
      value: organizationAddress?.specialLocation,
    },
    {
      label: "House Number",
      value: organizationAddress?.houseNumber,
    },
  ];

  const committeeLabel = (
    member: NonNullable<InspectionDetail["committeeMembers"]>[number],
  ) => member.expertName || "Committee Member";

  const currentUserId = Number(currentUser?.id ?? NaN);
  const leadCommittee = inspection?.committeeMembers?.find(
    (m) =>
      m.userId &&
      inspection?.leadInspector &&
      m.userId === inspection.leadInspector.id,
  );
  const isLeadInspector = inspection?.leadInspector?.id === currentUserId;
  const leadSignatureComplete = inspection?.leadInspector?.id
    ? Boolean(leadCommittee?.signatureUrl && leadCommittee?.signedAt)
    : true;
  const allCommitteeSigned = Boolean(
    inspection?.committeeMembers?.length &&
      inspection.committeeMembers.every(
        (member) => Boolean(member.signatureUrl) && Boolean(member.signedAt),
      ) && leadSignatureComplete,
  );
  const finalReportUrl = inspection?.finalReportUrl || "";

  const pdfIsAm = pdfLanguage === "am";

  const buildCommitteePdfRows = async (
    forAmharic: boolean,
  ): Promise<CommitteePdfRow[]> => {
    if (!inspection) return [];

    const rows: CommitteePdfRow[] = [];

    if (inspection.leadInspector) {
      const leadId = inspection.leadInspector.id;
      rows.push({
        id: leadId,
        name:
          leadCommittee?.expertName ||
          inspection.leadInspector.fullName ||
          inspection.leadInspector.username ||
          (forAmharic ? "ዋና ተቆጣጣሪ" : "Lead Inspector"),
        role:
          leadCommittee?.expertRole ||
          (forAmharic ? "ዋና ተቆጣጣሪ" : "Lead Inspector"),
        signedAt: leadCommittee?.signedAt ?? null,
        signatureSrc: leadCommittee?.signatureUrl
          ? await fetchImageAsDataUrl(
              resolveFileUrl(leadCommittee.signatureUrl),
            ).catch(() => null)
          : null,
      });
    }

    for (const member of inspection.committeeMembers || []) {
      if (member.userId && member.userId === inspection.leadInspector?.id) {
        continue;
      }
      rows.push({
        id: member.id,
        name:
          member.expertName ||
          (forAmharic ? "የኮሚቴ አባል" : "Committee Member"),
        role:
          member.expertRole ||
          (forAmharic ? "የኮሚቴ አባል" : "Committee Member"),
        signedAt: member.signedAt ?? null,
        signatureSrc: member.signatureUrl
          ? await fetchImageAsDataUrl(resolveFileUrl(member.signatureUrl)).catch(
              () => null,
            )
          : null,
      });
    }

    return rows;
  };

  const inspectionForPdf = useMemo(() => {
    if (!inspection) return null;
    return {
      ...inspection,
      isLocationValid: form.isLocationValid,
      isInfrastructureValid: form.isInfrastructureValid,
      isTrainingValid: form.isTrainingValid,
      findingsSummary: form.findingsSummary || inspection.findingsSummary,
      expertOpinion: form.expertOpinion || inspection.expertOpinion,
    };
  }, [inspection, form]);

  useEffect(() => {
    return () => {
      pdfTemplateRootRef.current?.unmount();
      pdfTemplateRootRef.current = null;
    };
  }, []);

  const buildFinalReportPdf = async () => {
    if (!inspectionForPdf) {
      throw new Error("Inspection data not loaded.");
    }

    if (!pdfTemplateRef.current) {
      throw new Error("PDF template ref not available.");
    }

    const committeeRows = await buildCommitteePdfRows(pdfIsAm);
    const generatedBy =
      currentUser?.fullName || currentUser?.username || "Field Reviewer";

    if (!pdfTemplateRootRef.current) {
      pdfTemplateRootRef.current = createRoot(pdfTemplateRef.current);
    }

    pdfTemplateRootRef.current.render(
      <InspectionReportPdfTemplate
        inspection={inspectionForPdf}
        isAm={pdfIsAm}
        organizationName={organizationName}
        committeeRows={committeeRows}
        generatedBy={generatedBy}
        compact
      />,
    );

    await waitForPdfFonts();

    const imgs = pdfTemplateRef.current.querySelectorAll("img");
    await Promise.all(
      Array.from(imgs)
        .filter((img) => !img.complete)
        .map(
          (img) =>
            new Promise<void>((resolve) => {
              img.onload = () => resolve();
              img.onerror = () => resolve();
            }),
        ),
    );

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });

    const canvas = await html2canvas(pdfTemplateRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      onclone: (clonedDoc) => {
        const node = clonedDoc.body.querySelector(
          "[data-inspection-pdf-root]",
        ) as HTMLElement | null;
        if (node) {
          node.style.fontFamily =
            '"Noto Sans Ethiopic", "Noto Sans", Arial, sans-serif';
        }
      },
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgData = canvas.toDataURL("image/jpeg", 0.92);
    let renderWidth = pageWidth;
    let renderHeight = (canvas.height * renderWidth) / canvas.width;

    if (renderHeight > pageHeight) {
      renderHeight = pageHeight;
      renderWidth = (canvas.width * renderHeight) / canvas.height;
    }

    const offsetX = (pageWidth - renderWidth) / 2;
    pdf.addImage(imgData, "JPEG", offsetX, 0, renderWidth, renderHeight);

    pdfTemplateRootRef.current.render(null);

    return pdf;
  };

  const handleViewPdf = async () => {
    setError(null);
    setPdfActionLoading("view");
    try {
      const pdf = await buildFinalReportPdf();
      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (requestError: unknown) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Failed to open PDF preview.";
      setError(message);
    } finally {
      setPdfActionLoading(null);
    }
  };

  const handleDownloadPdf = async () => {
    setError(null);
    setPdfActionLoading("download");
    try {
      const pdf = await buildFinalReportPdf();
      pdf.save(`inspection-${inspection?.id ?? inspectionId}-final-report.pdf`);
    } catch (requestError: unknown) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Failed to download PDF.";
      setError(message);
    } finally {
      setPdfActionLoading(null);
    }
  };

  const handleConfirmFinalReport = async () => {
    if (!inspection || !isLeadInspector || !allCommitteeSigned) {
      return;
    }

    setError(null);
    setMessage(null);
    setReportGenerating(true);

    try {
      const pdf = await buildFinalReportPdf();
      const pdfBlob = pdf.output("blob");
      const reportFile = new File(
        [pdfBlob],
        `inspection-${inspection.id}-final-report.pdf`,
        { type: "application/pdf" },
      );

      const formData = new FormData();
      formData.append("report", reportFile);

      const response = await apiRequest(`/inspections/${inspection.id}/final-report`, {
        method: "POST",
        body: formData,
      });

      const updatedInspection = (response as any)?.data ?? response;
      setInspection((current) =>
        current
          ? {
              ...current,
              finalReportUrl: updatedInspection?.finalReportUrl ?? current.finalReportUrl,
              status: updatedInspection?.status ?? current.status,
            }
          : current,
      );
      setForm((current) => ({
        ...current,
        finalReportUrl: updatedInspection?.finalReportUrl ?? current.finalReportUrl,
      }));
      setMessage("Final report generated and confirmed successfully.");
    } catch (requestError: any) {
      console.error("Failed to confirm final report", requestError);
      setError(requestError?.message || "Failed to generate final report.");
    } finally {
      setReportGenerating(false);
    }
  };

  const handleSignatureUpload = async (committeeId: number, file: File) => {
    if (!inspectionId || !Number.isFinite(currentUserId)) {
      return;
    }

    setError(null);
    setMessage(null);
    setSignatureUploadingId(committeeId);

    try {
      const formData = new FormData();
      formData.append("signature", file);

      const response = await apiRequest(
        `/inspections/${inspectionId}/committee/${committeeId}/signature`,
        {
          method: "POST",
          body: formData,
        },
      );

      const updatedCommittee = (response as any)?.data ?? response;

      setInspection((current) => {
        if (!current?.committeeMembers) return current;

        return {
          ...current,
          committeeMembers: current.committeeMembers.map((member) =>
            member.id === committeeId
              ? { ...member, ...updatedCommittee }
              : member,
          ),
        };
      });

      setMessage("Signature uploaded successfully.");
    } catch (requestError: any) {
      console.error("Failed to upload committee signature", requestError);
      setError(requestError?.message || "Failed to upload signature.");
    } finally {
      setSignatureUploadingId(null);
    }
  };

  const handleClearSignature = async (committeeId: number) => {
    if (!inspectionId || !Number.isFinite(currentUserId)) {
      return;
    }

    setError(null);
    setMessage(null);
    setSignatureClearingId(committeeId);

    try {
      const response = await apiRequest(
        `/inspections/${inspectionId}/committee/${committeeId}/signature`,
        { method: "DELETE" },
      );

      const updatedCommittee = (response as any)?.data ?? response;

      setInspection((current) => {
        if (!current?.committeeMembers) return current;

        return {
          ...current,
          committeeMembers: current.committeeMembers.map((member) =>
            member.id === committeeId
              ? {
                  ...member,
                  ...updatedCommittee,
                  signatureUrl: null,
                  signedAt: null,
                }
              : member,
          ),
        };
      });

      setMessage(
        isAm ? "ፊርማ በተሳካ ሁኔታ ተሰርዟል።" : "Signature removed successfully.",
      );
    } catch (requestError: any) {
      console.error("Failed to remove signature", requestError);
      setError(requestError?.message || "Failed to remove signature.");
    } finally {
      setSignatureClearingId(null);
    }
  };

  const handleLeadSignatureUpload = async (file: File) => {
    if (!inspectionId || !Number.isFinite(currentUserId)) return;

    setError(null);
    setMessage(null);
    setLeadUploading(true);

    try {
      const formData = new FormData();
      formData.append("signature", file);

      const response = await apiRequest(
        `/inspections/${inspectionId}/lead-signature`,
        {
          method: "POST",
          body: formData,
        },
      );

      const updatedCommittee = (response as any)?.data ?? response;

      setInspection((current) => {
        if (!current) return current;

        const existing = current.committeeMembers ?? [];
        const idx = existing.findIndex((m) => m.id === updatedCommittee.id);

        if (idx >= 0) {
          existing[idx] = { ...existing[idx], ...updatedCommittee };
        } else {
          existing.push(updatedCommittee);
        }

        return { ...current, committeeMembers: existing };
      });

      setMessage("Signature uploaded successfully.");
    } catch (requestError: any) {
      console.error("Failed to upload lead signature", requestError);
      setError(requestError?.message || "Failed to upload signature.");
    } finally {
      setLeadUploading(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const payload = {
        isLocationValid: form.isLocationValid,
        isInfrastructureValid: form.isInfrastructureValid,
        isTrainingValid: form.isTrainingValid,
        findingsSummary: form.findingsSummary,
        expertOpinion: form.expertOpinion,
      };

      await apiRequest(`/inspections/${inspectionId}/field-review`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      setMessage("Field review saved successfully.");
    } catch (requestError: any) {
      console.error("Failed to save field review", requestError);
      setError(requestError?.message || "Failed to save the field review.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex items-center gap-3 text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin text-[#003366]" />
        <span className="font-medium">
          {isAm ? "የምርመራ ቅጽ በመጫን ላይ..." : "Loading inspection review form..."}
        </span>
      </div>
    );
  }

  if (error && !inspection) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-4">
        <div className="flex items-center gap-3 text-red-600 font-bold">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
        <Link
          to="/field-reviewer/inspections"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#003366] text-white font-bold hover:bg-[#004080] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {isAm ? "ወደ ምርመራዎች ተመለስ" : "Back to inspections"}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#003366] via-[#004080] to-[#001F3F] rounded-3xl p-6 md:p-8 text-white shadow-lg">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD700] via-[#C5A022] to-[#FFD700]" />
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#FFD700]/5" />
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#FFD700] uppercase tracking-widest mb-2">
              <ShieldCheck className="w-4 h-4" />
              {isAm ? "ፊልድ ሪቪው ቦታ" : "Field Review Workspace"}
            </div>
            <h2 className="text-2xl font-black">{organizationName}</h2>
            <p className="mt-1 text-white/70 text-sm">
              {isAm ? "ቀጠሮ:" : "Scheduled:"} {formatDateTime(inspection?.scheduledDate)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 text-white border border-white/20">
              {isAm ? "ማመልከቻ" : "Application"} #{inspection?.application?.id ?? inspectionId}
            </span>
            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30">
              {inspection?.status || (isAm ? "ቀጠሮ ተይዟል" : "Scheduled")}
            </span>
          </div>
        </div>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl px-5 py-4 font-medium flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          {message}
        </motion.div>
      )}

      {error && inspection && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 font-medium flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </motion.div>
      )}

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="bg-white rounded-3xl shadow-sm border p-2 sm:p-3 overflow-x-auto">
            <div
              className="flex min-w-max gap-2"
              role="tablist"
              aria-label="Inspection review sections"
            >
              {sectionTabs.map((tab) => {
                const isActive = activeSection === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveSection(tab.id)}
                    className={`inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-bold transition-all whitespace-nowrap ${
                      isActive
                        ? "bg-[#003366] text-white shadow-sm"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {activeSection === "checklist" && (
            <div className="bg-white rounded-3xl shadow-sm border p-6 md:p-8 space-y-8">
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#003366]" />
                  <h3 className="text-lg font-bold text-[#003366]">
                    {isAm ? "ቼክሊስት ግምገማ" : "Checklist Review"}
                  </h3>
                </div>
                <p className="text-sm text-gray-500">
                  {isAm
                    ? "የመጨረሻ አስተያየትዎን ከመጻፍዎ በፊት ከዚህ በታች ያሉ የሜዳ ሁኔታዎችን ያረጋግጡ።"
                    : "Confirm the field conditions below before writing your final opinion."}
                </p>

                <div className="space-y-5">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        {isAm ? "የድርጅት መገለጫ" : "Organization Profile"}
                      </p>
                      <h4 className="mt-1 text-base font-black text-[#003366]">
                        {organizationName}
                      </h4>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-500 border">
                      {isAm ? "ማመልከቻ" : "Application"} #{inspection?.application?.id ?? inspectionId}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 text-sm">
                    <div className="rounded-2xl border bg-white p-4 space-y-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        {isAm ? "አድራሻ" : "Address"}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-4">
                        <div className="space-y-3 text-gray-500 font-semibold">
                          <p>{isAm ? "ክልል" : "Region"}</p>
                          <p>{isAm ? "ዞን" : "Zone"}</p>
                          <p>{isAm ? "ወረዳ" : "Woreda"}</p>
                          <p>{isAm ? "ቀበሌ" : "Kebele"}</p>
                          <p>{isAm ? "ልዩ ቦታ" : "Special Location"}</p>
                          <p>{isAm ? "የቤት ቁጥር" : "House Number"}</p>
                        </div>

                        <div className="space-y-3 text-gray-800 font-semibold break-words">
                          <p>{addressRows[0].value || "-"}</p>
                          <p>{addressRows[1].value || "-"}</p>
                          <p>{addressRows[2].value || "-"}</p>
                          <p>{addressRows[3].value || "-"}</p>
                          <p>{addressRows[4].value || "-"}</p>
                          <p>{addressRows[5].value || "-"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border bg-white p-4 space-y-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        {isAm ? "መሠረተ ልማት" : "Infrastructure"}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-4">
                        <div className="space-y-3 text-gray-500 font-semibold">
                          <p>{isAm ? "ጠቅላላ ቢሮ ብዛት" : "Total Office Count"}</p>
                          <p>{isAm ? "ጠቅላላ ተሽከርካሪ ብዛት" : "Total Vehicle Count"}</p>
                          <p>{isAm ? "ጠቅላላ ኮምፒውተር ብዛት" : "Total Computer Count"}</p>
                          <p>{isAm ? "መጋዘን ያለ" : "Storehouse Availability"}</p>
                        </div>

                        <div className="space-y-3 text-gray-800 font-semibold break-words">
                          <p>
                            {inspection?.application?.organization
                              ?.numberOfOffices ?? "-"}
                          </p>
                          <p>
                            {inspection?.application?.organization
                              ?.numberOfVehicles ?? "-"}
                          </p>
                          <p>
                            {inspection?.application?.organization
                              ?.numberOfComputers ?? "-"}
                          </p>
                          <p
                            className={`font-bold ${inspection?.application?.organization?.hasStoreHouse ? "text-emerald-600" : "text-amber-600"}`}
                          >
                            {inspection?.application?.organization?.hasStoreHouse
                              ? (isAm ? "አዎ" : "Yes")
                              : (isAm ? "የለም" : "No")}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">
                        {isAm
                          ? "ድርጅቱ ዝግጁ መሆኑን ለማረጋገጥ እነዚህን የተቋም ቁጥሮች ይጠቀሙ።"
                          : "Use these facility counts to confirm the organization is operationally ready."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => handleToggle("isLocationValid")}
                    aria-pressed={form.isLocationValid}
                    className={`rounded-2xl border-2 border-[#003366] bg-white p-4 text-left transition-all ${toggleButtonClass(form.isLocationValid)}`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-black transition-colors ${indicatorClass(form.isLocationValid)}`}
                        aria-hidden="true"
                      >
                        ✓
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-bold text-gray-900">
                            {isAm ? "ቦታ ትክክለኛ ነው" : "Location Valid"}
                          </span>
                          <span className={`text-xs font-bold ${form.isLocationValid ? "text-emerald-600" : "text-gray-400"}`}>
                            {form.isLocationValid ? (isAm ? "ተረጋግጧል" : "Confirmed") : (isAm ? "በመጠባበቅ" : "Pending")}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          {isAm ? "የጣቢያ መዳረሻ፣ አድራሻ እና የቦታ ዝርዝሮች ተረጋግጠዋል።" : "Site access, address, and location details are verified."}
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggle("isInfrastructureValid")}
                    aria-pressed={form.isInfrastructureValid}
                    className={`rounded-2xl border-2 border-[#003366] bg-white p-4 text-left transition-all ${toggleButtonClass(form.isInfrastructureValid)}`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-black transition-colors ${indicatorClass(form.isInfrastructureValid)}`}
                        aria-hidden="true"
                      >
                        ✓
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-bold text-gray-900">
                            {isAm ? "መሠረተ ልማት ትክክለኛ ነው" : "Infrastructure Valid"}
                          </span>
                          <span className={`text-xs font-bold ${form.isInfrastructureValid ? "text-emerald-600" : "text-gray-400"}`}>
                            {form.isInfrastructureValid ? (isAm ? "ተረጋግጧል" : "Confirmed") : (isAm ? "በመጠባበቅ" : "Pending")}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          {isAm ? "የቢሮ አቀማመጥ፣ ተቋማት እና አካላዊ ዝግጁነት ተረጋግጠዋል።" : "Office layout, facilities, and physical readiness are confirmed."}
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggle("isTrainingValid")}
                    aria-pressed={form.isTrainingValid}
                    className={`rounded-2xl border-2 border-[#003366] bg-white p-4 text-left transition-all ${toggleButtonClass(form.isTrainingValid)}`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-black transition-colors ${indicatorClass(form.isTrainingValid)}`}
                        aria-hidden="true"
                      >
                        ✓
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-bold text-gray-900">
                            {isAm ? "ስልጠና ትክክለኛ ነው" : "Training Valid"}
                          </span>
                          <span className={`text-xs font-bold ${form.isTrainingValid ? "text-emerald-600" : "text-gray-400"}`}>
                            {form.isTrainingValid ? (isAm ? "ተረጋግጧል" : "Confirmed") : (isAm ? "በመጠባበቅ" : "Pending")}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          {isAm ? "የሚያስፈልጉ የስልጠና ማስረጃዎች እና መዝገቦች ተጣጥመዋል።" : "Required training evidence and records are consistent."}
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#003366]" />
                  <h3 className="text-lg font-bold text-[#003366]">
                    {isAm ? "የግኝቶች ማጠቃለያ" : "Findings Summary"}
                  </h3>
                </div>
                <textarea
                  value={form.findingsSummary}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      findingsSummary: event.target.value,
                    }))
                  }
                  rows={6}
                  placeholder={isAm ? "አጭር የጣቢያ ግኝቶችን፣ ጉድለቶችን እና ልዩ ምልከታዎችን ይጻፉ..." : "Write concise site findings, deficiencies, and notable observations..."}
                  className="w-full rounded-2xl border border-gray-200 focus:ring-2 focus:ring-[#003366] outline-none px-4 py-3 text-sm bg-gray-50 transition-shadow"
                />
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-[#003366]" />
                  <h3 className="text-lg font-bold text-[#003366]">
                    {isAm ? "የባለሙያ አስተያየት" : "Expert Opinion"}
                  </h3>
                </div>
                <textarea
                  value={form.expertOpinion}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      expertOpinion: event.target.value,
                    }))
                  }
                  rows={5}
                  placeholder={isAm ? "ለአስተዳዳሪ ቡድን ሙያዊ አስተያየትዎን እና ምክርዎን ይጻፉ..." : "State your professional opinion and recommendation for the admin team..."}
                  className="w-full rounded-2xl border border-gray-200 focus:ring-2 focus:ring-[#003366] outline-none px-4 py-3 text-sm bg-gray-50 transition-shadow"
                />
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#003366]" />
                  <h3 className="text-lg font-bold text-[#003366]">
                    {isAm ? "የመጨረሻ የምርመራ ሪፖርት" : "Final Inspection Report"}
                  </h3>
                </div>

                {finalReportUrl ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 space-y-3">
                    <p className="text-sm font-semibold text-emerald-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      {isAm ? "የመጨረሻ ሪፖርት ተፈጥሮ ተቀምጧል።" : "Final report generated and saved."}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#003366]/15 bg-white p-3 w-full">
                      <span className="text-xs font-bold text-[#003366]">
                        {isAm ? "የPDF ሪፖርት ቋንቋ" : "PDF report language"}
                      </span>
                      <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden ml-auto">
                        <button
                          type="button"
                          onClick={() => setPdfLanguage("en")}
                          className={`px-3 py-1.5 text-xs font-bold transition-colors ${pdfLanguage === "en" ? "bg-[#003366] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                        >
                          English
                        </button>
                        <button
                          type="button"
                          onClick={() => setPdfLanguage("am")}
                          className={`px-3 py-1.5 text-xs font-bold transition-colors ${pdfLanguage === "am" ? "bg-[#003366] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                        >
                          አማርኛ
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => void handleViewPdf()}
                        disabled={pdfActionLoading !== null}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#003366] text-white font-bold hover:bg-[#004080] transition-colors shadow-sm disabled:opacity-50"
                      >
                        {pdfActionLoading === "view" ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                        {isAm ? "PDF ይመልከቱ" : "View PDF"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDownloadPdf()}
                        disabled={pdfActionLoading !== null}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#003366] text-[#003366] bg-white font-bold hover:bg-[#003366]/5 transition-colors disabled:opacity-50"
                      >
                        {pdfActionLoading === "download" ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        {isAm ? "PDF ያውርዱ" : "Download PDF"}
                      </button>
                    </div>
                    <p className="text-xs text-emerald-700/80">
                      {isAm
                        ? "ሪፖርቱ በተመረጠው ቋንቋ በአንድ ገጽ ይታያል/ይወረዳል። በሰርቨር ላይ ያለውን ፋይል ለማዘመን «አረጋግጥ እና PDF ፍጠር» ይጫኑ።"
                        : "Preview/download uses the selected language on a single page. Use Confirm & Generate PDF to update the saved server copy."}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 space-y-4">
                    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#003366]/15 bg-white p-3 w-full">
                      <span className="text-xs font-bold text-[#003366]">
                        {isAm ? "የPDF ሪፖርት ቋንቋ" : "PDF report language"}
                      </span>
                      <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden ml-auto">
                        <button
                          type="button"
                          onClick={() => setPdfLanguage("en")}
                          className={`px-3 py-1.5 text-xs font-bold transition-colors ${pdfLanguage === "en" ? "bg-[#003366] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                        >
                          English
                        </button>
                        <button
                          type="button"
                          onClick={() => setPdfLanguage("am")}
                          className={`px-3 py-1.5 text-xs font-bold transition-colors ${pdfLanguage === "am" ? "bg-[#003366] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                        >
                          አማርኛ
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {isAm
                        ? "የመጨረሻ ሪፖርቱ ሊፈጠር የሚችለው ሁሉም የኮሚቴ አባላት እና ዋና ተቆጣጣሪ ከፈረሙ በኋላ ብቻ ነው።"
                        : "The final report can only be generated after every committee member and the lead inspector sign."}
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${allCommitteeSigned ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-amber-100 text-amber-700 border-amber-200"}`}>
                        {allCommitteeSigned
                          ? (isAm ? "ሁሉም ፊርማዎች ተጠናቅቀዋል" : "All signatures complete")
                          : (isAm ? "ፊርማዎችን በመጠባበቅ ላይ" : "Waiting for signatures")}
                      </span>
                      <span className="text-xs text-gray-500">
                        {isLeadInspector
                          ? (isAm ? "እርስዎ ዋና ተቆጣጣሪ ነዎት።" : "You are the lead inspector.")
                          : (isAm ? "ዋና ተቆጣጣሪ ብቻ ሪፖርቱን ሊፈጥር ይችላል።" : "Only the lead inspector can generate the report.")}
                      </span>
                    </div>

                    {allCommitteeSigned ? (
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => void handleViewPdf()}
                          disabled={pdfActionLoading !== null}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#003366] text-[#003366] bg-white font-bold hover:bg-[#003366]/5 transition-colors disabled:opacity-50"
                        >
                          {pdfActionLoading === "view" ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                          {isAm ? "PDF ቅድመ እይታ" : "Preview PDF"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDownloadPdf()}
                          disabled={pdfActionLoading !== null}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 bg-white font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          {pdfActionLoading === "download" ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                          {isAm ? "PDF ያውርዱ" : "Download PDF"}
                        </button>
                      </div>
                    ) : null}

                    <button
                      type="button"
                      onClick={handleConfirmFinalReport}
                      disabled={!isLeadInspector || !allCommitteeSigned || reportGenerating}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#FFD700] to-[#C5A022] text-[#003366] font-black shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:active:scale-100"
                    >
                      {reportGenerating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                      {reportGenerating
                        ? (isAm ? "PDF በመፍጠር ላይ..." : "Generating PDF...")
                        : (isAm ? "አረጋግጥ እና PDF ፍጠር" : "Confirm & Generate PDF")}
                    </button>
                  </div>
                )}
              </section>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#003366] text-white font-bold hover:bg-[#004080] active:scale-95 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? (isAm ? "በማስቀመጥ ላይ..." : "Saving...") : (isAm ? "ፊልድ ሪቪው አስቀምጥ" : "Save Field Review")}
                </button>
                <Link
                  to="/field-reviewer/inspections"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {isAm ? "ወደ ምርመራዎች ተመለስ" : "Back to Queue"}
                </Link>
              </div>
            </div>
          )}

          {activeSection === "status" && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#003366]" />
                <h3 className="text-lg font-bold text-[#003366]">
                  {isAm ? "የግምገማ ሁኔታ" : "Review Status"}
                </h3>
              </div>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs text-gray-500">
                      {isAm ? "የተመደበ ተቆጣጣሪ" : "Assigned Reviewer"}
                    </div>
                    <div className="font-bold text-[#003366]">
                      {inspection?.leadInspector?.fullName ||
                        inspection?.leadInspector?.username ||
                        "-"}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-gray-500">
                      {isAm ? "የዋና ፊርማ" : "Lead Signature"}
                    </div>
                    <div className={`font-bold ${leadCommittee?.signatureUrl ? "text-emerald-600" : "text-amber-600"}`}>
                      {leadCommittee?.signatureUrl
                        ? (isAm ? "ፈርሟል" : "Signed")
                        : (isAm ? "ፊርማ ያስፈልጋል" : "Pending signature")}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>{isAm ? "ቼክሊስት ተጠናቅቋል" : "Checklist Complete"}</span>
                  <span className={`font-bold ${overallReady ? "text-emerald-600" : "text-amber-600"}`}>
                    {overallReady ? (isAm ? "አዎ" : "Yes") : (isAm ? "በሂደት ላይ" : "In Progress")}
                  </span>
                </div>
                {inspection?.leadInspector?.id === currentUserId ? (
                  <div className="mt-3 flex flex-col gap-2 rounded-lg border border-dashed border-[#003366]/30 bg-[#003366]/5 p-3">
                    <p className="text-xs font-semibold text-[#003366]">
                      {isAm ? "የዋና ተቆጣጣሪ ፊርማ" : "Lead inspector signature"}
                    </p>
                    <input
                      id={`lead-file-${inspectionId}`}
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        void handleLeadSignatureUpload(file);
                        event.target.value = "";
                      }}
                      className="hidden"
                    />
                    {leadCommittee?.signatureUrl ? (
                      <img
                        src={resolveFileUrl(leadCommittee.signatureUrl)}
                        alt="Lead inspector signature"
                        className="max-h-24 rounded-lg border bg-white object-contain"
                      />
                    ) : null}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById(
                            `lead-file-${inspectionId}`,
                          ) as HTMLInputElement | null;
                          if (el) el.click();
                        }}
                        disabled={
                          leadUploading ||
                          (leadCommittee
                            ? signatureClearingId === leadCommittee.id
                            : false)
                        }
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#003366] text-white text-sm font-bold hover:bg-[#004080] transition-colors disabled:opacity-50"
                      >
                        {leadUploading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : leadCommittee?.signatureUrl ? (
                          <PenLine className="w-4 h-4" />
                        ) : (
                          <UploadCloud className="w-4 h-4" />
                        )}
                        {leadCommittee?.signatureUrl
                          ? isAm
                            ? "ፊርማ ቀይር"
                            : "Change Signature"
                          : isAm
                            ? "ፊርማ ያስገቡ"
                            : "Upload Signature"}
                      </button>
                      {leadCommittee?.signatureUrl && leadCommittee ? (
                        <button
                          type="button"
                          onClick={() =>
                            void handleClearSignature(leadCommittee.id)
                          }
                          disabled={
                            leadUploading ||
                            signatureClearingId === leadCommittee.id
                          }
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-red-200 text-red-700 bg-white text-sm font-bold hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          {signatureClearingId === leadCommittee.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                          {isAm ? "የተጫነ ፊርማ ይሰረዝ" : "Cancel Uploaded Signature"}
                        </button>
                      ) : null}
                    </div>
                    <p className="text-[11px] text-gray-500">
                      {isAm
                        ? "የተመደበው ዋና ተቆጣጣሪ ብቻ ፊርማ ሊያስገባ ወይም ሊሰርዝ ይችላል።"
                        : "Only the assigned lead inspector can upload or remove this signature."}
                    </p>
                  </div>
                ) : leadCommittee?.signatureUrl ? (
                  <div className="mt-3">
                    <img
                      src={resolveFileUrl(leadCommittee.signatureUrl)}
                      alt="Lead inspector signature"
                      className="max-h-24 rounded-lg border bg-gray-50 object-contain"
                    />
                  </div>
                ) : null}
                <div className="flex items-center justify-between gap-3">
                  <span>{isAm ? "የኮሚቴ አባላት" : "Committee Members"}</span>
                  {inspection?.committeeMembers &&
                  inspection.committeeMembers.length > 0 ? (
                    <span className="font-bold text-[#003366]">
                      {inspection.committeeMembers.length}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">
                      {isAm ? "ምንም የኮሚቴ አባላት አልተመደቡም።" : "No committee members assigned."}
                    </span>
                  )}
                </div>
                {!!inspection?.committeeMembers?.length && (
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                      {isAm ? "የተመደቡ ኮሚቴ" : "Assigned Committee"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {inspection.committeeMembers.map((member) => (
                        <span
                          key={member.id}
                          className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold text-[#003366] border border-gray-200"
                        >
                          {committeeLabel(member)}
                          {member.expertRole ? (
                            <span className="text-[10px] text-gray-500 font-semibold">
                              {member.expertRole}
                            </span>
                          ) : null}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-2xl bg-[#003366]/5 border border-[#003366]/10 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-[#003366]/60">
                  {isAm ? "መመሪያ" : "Guidance"}
                </p>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  {isAm
                    ? "ማስታወሻዎችን ተጨባጭ ያድርጉ፣ አጭር እና ተግባራዊ ዓረፍተ ነገሮችን ይጠቀሙ።"
                    : "Keep notes objective, use short actionable sentences, and paste the final report URL only after the review is complete."}
                </p>
              </div>
            </div>
          )}

          {activeSection === "snapshot" && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                {isAm ? "የማመልከቻ ዝርዝር" : "Application Snapshot"}
              </p>
              <div>
                <h4 className="text-xl font-black text-[#003366]">
                  {organizationName}
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  {isAm ? "አመልካች:" : "Applicant:"} {inspection?.application?.user?.fullName || "-"}
                </p>
              </div>
              {finalReportUrl ? (
                <button
                  type="button"
                  onClick={() => void handleViewPdf()}
                  disabled={pdfActionLoading !== null}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#003366] text-white font-bold hover:bg-[#004080] transition-colors shadow-sm disabled:opacity-50"
                >
                  {pdfActionLoading === "view" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  {isAm ? "የመጨረሻ PDF ይመልከቱ" : "View Final PDF"}
                </button>
              ) : null}
              <div className="grid gap-3 text-sm text-gray-600">
                <div className="flex items-center justify-between gap-4">
                  <span>{isAm ? "የማመልከቻ ቀን" : "Application Date"}</span>
                  <span className="font-bold text-[#003366]">
                    {formatDateTime(inspection?.application?.applicationDate)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>{isAm ? "የአመልካች ስልክ" : "Applicant Phone"}</span>
                  <span className="font-bold text-[#003366]">
                    {inspection?.application?.user?.phone || "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>{isAm ? "የአመልካች ኢሜል" : "Applicant Email"}</span>
                  <span className="font-bold text-[#003366] break-all text-right">
                    {inspection?.application?.user?.email || "-"}
                  </span>
                </div>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  {isAm ? "የኮሚቴ አባላት" : "Committee Members"}
                </p>
                {inspection?.committeeMembers?.length ? (
                  <div className="space-y-2">
                    {inspection.committeeMembers.map((member) => (
                      <div
                        key={member.id}
                        className="space-y-3 rounded-xl bg-white px-4 py-3 border border-gray-100"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-bold text-[#003366]">
                              {committeeLabel(member)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {member.expertRole || (isAm ? "የኮሚቴ አባል" : "Committee Member")}
                            </p>
                          </div>
                          <span className={`text-xs font-bold ${member.signatureUrl ? "text-emerald-600" : "text-amber-600"}`}>
                            {member.signatureUrl
                              ? (isAm ? "ፈርሟል" : "Signed")
                              : (isAm ? "ፊርማ ያስፈልጋል" : "Pending signature")}
                          </span>
                        </div>

                        {member.signatureUrl &&
                        !(Number.isFinite(currentUserId) &&
                          member.userId === currentUserId) ? (
                          <img
                            src={resolveFileUrl(member.signatureUrl)}
                            alt={`${committeeLabel(member)} signature`}
                            className="max-h-24 rounded-lg border bg-gray-50 object-contain"
                          />
                        ) : null}

                        {Number.isFinite(currentUserId) &&
                        member.userId === currentUserId ? (
                          <div className="flex flex-col gap-2 rounded-lg border border-dashed border-[#003366]/30 bg-[#003366]/5 p-3">
                            <p className="text-xs font-semibold text-[#003366]">
                              {isAm ? "የእርስዎ ፊርማ" : "Your signature"}
                            </p>
                            <input
                              id={`committee-file-${member.id}`}
                              type="file"
                              accept="image/*"
                              onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (!file) return;
                                void handleSignatureUpload(member.id, file);
                                event.target.value = "";
                              }}
                              className="hidden"
                            />
                            {member.signatureUrl ? (
                              <img
                                src={resolveFileUrl(member.signatureUrl)}
                                alt={`${committeeLabel(member)} signature`}
                                className="max-h-24 rounded-lg border bg-white object-contain"
                              />
                            ) : null}
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const el = document.getElementById(
                                    `committee-file-${member.id}`,
                                  ) as HTMLInputElement | null;
                                  if (el) el.click();
                                }}
                                disabled={
                                  signatureUploadingId === member.id ||
                                  signatureClearingId === member.id
                                }
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#003366] text-white text-sm font-bold hover:bg-[#004080] transition-colors disabled:opacity-50"
                              >
                                {signatureUploadingId === member.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : member.signatureUrl ? (
                                  <PenLine className="w-4 h-4" />
                                ) : (
                                  <UploadCloud className="w-4 h-4" />
                                )}
                                {member.signatureUrl
                                  ? isAm
                                    ? "ፊርማ ቀይር"
                                    : "Change Signature"
                                  : isAm
                                    ? "ፊርማ ያስገቡ"
                                    : "Upload Signature"}
                              </button>
                              {member.signatureUrl ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    void handleClearSignature(member.id)
                                  }
                                  disabled={
                                    signatureUploadingId === member.id ||
                                    signatureClearingId === member.id
                                  }
                                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-red-200 text-red-700 bg-white text-sm font-bold hover:bg-red-50 transition-colors disabled:opacity-50"
                                >
                                  {signatureClearingId === member.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <X className="w-4 h-4" />
                                  )}
                                  {isAm
                                    ? "የተጫነ ፊርማ ይሰረዝ"
                                    : "Cancel Uploaded Signature"}
                                </button>
                              ) : null}
                            </div>
                            <p className="text-[11px] text-gray-500">
                              {isAm
                                ? "የተመደበው ተቆጣጣሪ ብቻ ፊርማ ሊያስገባ ወይም ሊሰርዝ ይችላል።"
                                : "Only the assigned reviewer can upload or remove this signature."}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    {isAm ? "ምንም የኮሚቴ አባላት አልተመደቡም።" : "No committee members assigned."}
                  </p>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <div
        ref={pdfTemplateRef}
        data-inspection-pdf-root
        aria-hidden
        style={{
          position: "fixed",
          left: "-10000px",
          top: 0,
          zIndex: -1,
          width: "794px",
          background: "#fff",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

export default InspectionReviewForm;
