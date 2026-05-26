// filepath: frontend/src/pages/fieldReviewer/InspectionReviewForm.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { jsPDF } from "jspdf";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
  Save,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Loader2,
  UploadCloud,
} from "lucide-react";
import { motion } from "motion/react";

import { useAuth } from "../../context/AuthContext";
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

const truncateText = (value: string, maxLength = 90) => {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
};

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
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const inspectionId = Number(id);
  const [inspection, setInspection] = useState<InspectionDetail | null>(null);
  const [form, setForm] = useState<ReviewFormState>(initialState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reportGenerating, setReportGenerating] = useState(false);
  const [signatureUploadingId, setSignatureUploadingId] = useState<
    number | null
  >(null);
  const [leadUploading, setLeadUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [activeSection, setActiveSection] =
    useState<ReviewSection>("checklist");

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
    { id: "checklist", label: "Checklist Review" },
    { id: "status", label: "Review Status" },
    { id: "snapshot", label: "Application Snapshot" },
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

  const addressLocationPath = addressRows
    .slice(0, 4)
    .map((row) => row.value)
    .filter(Boolean)
    .join(" / ");

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

  const buildFinalReportPdf = async () => {
    if (!inspection) {
      throw new Error("Inspection data not loaded.");
    }

    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const marginX = 14;
    let cursorY = 14;
    const contentWidth = pageWidth - marginX * 2;

    const line = (y: number) => {
      pdf.setDrawColor(0, 51, 102);
      pdf.setLineWidth(0.4);
      pdf.line(marginX, y, pageWidth - marginX, y);
    };

    const sectionTitle = (title: string) => {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10.5);
      pdf.setTextColor(0, 51, 102);
      pdf.text(title, marginX, cursorY);
      cursorY += 3.5;
      line(cursorY);
      cursorY += 4;
    };

    const safeText = (value?: string | number | boolean | null) => {
      if (value === null || value === undefined || value === "") return "-";
      return String(value);
    };

    const labelValue = (
      label: string,
      value: string,
      x: number,
      width: number,
    ) => {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8.5);
      pdf.setTextColor(90, 90, 90);
      pdf.text(label, x, cursorY);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(25, 25, 25);
      const wrapped = pdf.splitTextToSize(value, width);
      pdf.text(wrapped, x, cursorY + 4.4);
      return cursorY + 4.4 + wrapped.length * 3.8;
    };

    const committeeRows = (() => {
      const rows = [] as Array<{
        id: number;
        name: string;
        role: string;
        signatureUrl?: string | null;
        signedAt?: string | null;
      }>;

      const leadRow = inspection.leadInspector
        ? {
            id: inspection.leadInspector.id,
            name:
              leadCommittee?.expertName ||
              inspection.leadInspector.fullName ||
              inspection.leadInspector.username ||
              "Lead Inspector",
            role: leadCommittee?.expertRole || "Lead Inspector",
            signatureUrl: leadCommittee?.signatureUrl ?? null,
            signedAt: leadCommittee?.signedAt ?? null,
          }
        : null;

      if (leadRow) rows.push(leadRow);

      for (const member of inspection.committeeMembers || []) {
        if (member.userId && member.userId === inspection.leadInspector?.id) {
          continue;
        }

        rows.push({
          id: member.id,
          name: member.expertName || "Committee Member",
          role: member.expertRole || "Committee Member",
          signatureUrl: member.signatureUrl ?? null,
          signedAt: member.signedAt ?? null,
        });
      }

      return rows;
    })();

    const committeeSignatureMap = new Map<number, string>();
    await Promise.all(
      committeeRows.map(async (member) => {
        if (!member.signatureUrl) return;

        try {
          const dataUrl = await fetchImageAsDataUrl(resolveFileUrl(member.signatureUrl));
          committeeSignatureMap.set(member.id, dataUrl);
        } catch (loadError) {
          console.warn("Failed to load signature image for PDF", loadError);
        }
      }),
    );

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(15);
    pdf.setTextColor(0, 51, 102);
    pdf.text("Inspection Final Report", marginX, cursorY);
    cursorY += 7;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(70, 70, 70);
    pdf.text(
      `${safeText(organizationName)} | Inspection #${inspection.id} | ${formatDateTime(inspection.scheduledDate)}`,
      marginX,
      cursorY,
    );
    cursorY += 8;

    sectionTitle("Address Details");
    const leftX = marginX;
    const rightX = marginX + contentWidth / 2 + 4;
    const columnWidth = contentWidth / 2 - 4;
    const address = inspection.application?.organization?.address;
    const region =
      address?.kebele?.woreda?.zone?.region?.nameEnglish ||
      address?.kebele?.woreda?.zone?.region?.nameAmharic ||
      "-";
    const zone =
      address?.kebele?.woreda?.zone?.nameEnglish ||
      address?.kebele?.woreda?.zone?.nameAmharic ||
      "-";
    const woreda =
      address?.kebele?.woreda?.nameEnglish ||
      address?.kebele?.woreda?.nameAmharic ||
      "-";
    const kebele =
      address?.kebele?.nameEnglish || address?.kebele?.nameAmharic || "-";

    const topLeftY = labelValue("Region", region, leftX, columnWidth);
    cursorY += 0;
    pdf.text(
      `Special Location: ${truncateText(safeText(address?.specialLocation))}`,
      leftX,
      topLeftY + 4,
    );
    pdf.text(
      `House Number: ${truncateText(safeText(address?.houseNumber))}`,
      leftX,
      topLeftY + 9,
    );

    const topRightY = labelValue("Zone", zone, rightX, columnWidth);
    pdf.text(
      `Woreda: ${truncateText(safeText(woreda))}`,
      rightX,
      topRightY + 4,
    );
    pdf.text(
      `Kebele: ${truncateText(safeText(kebele))}`,
      rightX,
      topRightY + 9,
    );
    cursorY = Math.max(topLeftY + 15, topRightY + 15) + 2;

    sectionTitle("Infrastructure");
    const infraLeftY = labelValue(
      "Total Office Count",
      safeText(inspection.application?.organization?.numberOfOffices),
      leftX,
      columnWidth,
    );
    const infraRightY = labelValue(
      "Total Vehicle Count",
      safeText(inspection.application?.organization?.numberOfVehicles),
      rightX,
      columnWidth,
    );
    pdf.text(
      `Total Computer Count: ${safeText(inspection.application?.organization?.numberOfComputers)}`,
      leftX,
      infraLeftY + 4,
    );
    pdf.text(
      `Storehouse Availability: ${inspection.application?.organization?.hasStoreHouse ? "Yes" : "No"}`,
      rightX,
      infraRightY + 4,
    );
    cursorY = Math.max(infraLeftY + 10, infraRightY + 10) + 3;

    sectionTitle("Findings Summary");
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(25, 25, 25);
    const summary = pdf.splitTextToSize(
      safeText(inspection.findingsSummary),
      contentWidth,
    ).slice(0, 6);
    if (summary.length > 0 && safeText(inspection.findingsSummary) !== "-") {
      const sourceLines = pdf.splitTextToSize(
        safeText(inspection.findingsSummary),
        contentWidth,
      );
      if (sourceLines.length > summary.length) {
        summary[summary.length - 1] = `${summary[summary.length - 1].replace(/\.*$/, "")}...`;
      }
    }
    pdf.text(summary, marginX, cursorY);
    cursorY += summary.length * 4 + 2;

    sectionTitle("Expert Opinion");
    const opinion = pdf.splitTextToSize(
      safeText(inspection.expertOpinion),
      contentWidth,
    ).slice(0, 6);
    if (opinion.length > 0 && safeText(inspection.expertOpinion) !== "-") {
      const sourceLines = pdf.splitTextToSize(
        safeText(inspection.expertOpinion),
        contentWidth,
      );
      if (sourceLines.length > opinion.length) {
        opinion[opinion.length - 1] = `${opinion[opinion.length - 1].replace(/\.*$/, "")}...`;
      }
    }
    pdf.text(opinion, marginX, cursorY);
    cursorY += opinion.length * 4 + 2;

    sectionTitle("Inspection Committee");
    const tableX = marginX;
    const tableY = cursorY;
    const colWidths = [54, 38, 42, 40];
    const headerHeight = 6;
    const rowHeight = 14;
    const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);

    pdf.setFillColor(240, 244, 248);
    pdf.rect(tableX, tableY, tableWidth, headerHeight, "F");
    pdf.setDrawColor(210, 216, 224);
    pdf.rect(tableX, tableY, tableWidth, headerHeight + rowHeight * Math.max(committeeRows.length, 1));

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(0, 51, 102);
    pdf.text("Name", tableX + 2, tableY + 4);
    pdf.text("Role", tableX + colWidths[0] + 2, tableY + 4);
    pdf.text("Signature", tableX + colWidths[0] + colWidths[1] + 2, tableY + 4);
    pdf.text(
      "Signed At",
      tableX + colWidths[0] + colWidths[1] + colWidths[2] + 2,
      tableY + 4,
    );

    let rowTop = tableY + headerHeight;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(30, 30, 30);

    committeeRows.forEach((member, index) => {
      const isLastRow = index === committeeRows.length - 1;
      const rowBottom = rowTop + rowHeight;
      const signatureDataUrl = committeeSignatureMap.get(member.id);

      pdf.line(tableX, rowBottom, tableX + tableWidth, rowBottom);
      pdf.line(tableX + colWidths[0], rowTop, tableX + colWidths[0], rowBottom);
      pdf.line(
        tableX + colWidths[0] + colWidths[1],
        rowTop,
        tableX + colWidths[0] + colWidths[1],
        rowBottom,
      );
      pdf.line(
        tableX + colWidths[0] + colWidths[1] + colWidths[2],
        rowTop,
        tableX + colWidths[0] + colWidths[1] + colWidths[2],
        rowBottom,
      );

      pdf.text(truncateText(member.name, 22), tableX + 2, rowTop + 5);
      pdf.text(truncateText(member.role, 18), tableX + colWidths[0] + 2, rowTop + 5);

      if (signatureDataUrl) {
        try {
          const imageFormat = signatureDataUrl.includes("image/jpeg")
            ? "JPEG"
            : "PNG";
          pdf.addImage(
            signatureDataUrl,
            imageFormat,
            tableX + colWidths[0] + colWidths[1] + 2,
            rowTop + 2,
            34,
            9,
          );
        } catch {
          pdf.text("Signed", tableX + colWidths[0] + colWidths[1] + 2, rowTop + 5);
        }
      } else {
        pdf.text("Signed", tableX + colWidths[0] + colWidths[1] + 2, rowTop + 5);
      }

      pdf.text(
        member.signedAt ? formatDateTime(member.signedAt) : "-",
        tableX + colWidths[0] + colWidths[1] + colWidths[2] + 2,
        rowTop + 5,
      );

      if (!isLastRow) {
        rowTop = rowBottom;
      }
    });

    cursorY = rowTop + rowHeight + 2;

    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(8);
    pdf.setTextColor(120, 120, 120);
    pdf.text(
      `Generated by ${safeText(currentUser?.fullName || currentUser?.username)} on ${formatDateTime(new Date().toISOString())}`,
      marginX,
      pageHeight - 10,
    );

    return pdf;
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
      <div className="bg-white rounded-3xl shadow-sm border p-8 flex items-center gap-3 text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading inspection review form...
      </div>
    );
  }

  if (error && !inspection) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border p-8 space-y-4">
        <div className="flex items-center gap-3 text-red-600 font-bold">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
        <Link
          to="/field-reviewer/inspections"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to inspections
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border p-6 md:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            Field Review Workspace
          </div>
          <h2 className="mt-2 text-2xl font-black text-primary">
            {organizationName}
          </h2>
          <p className="mt-2 text-gray-500">
            Scheduled: {formatDateTime(inspection?.scheduledDate)}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <span className="px-3 py-2 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
            Application #{inspection?.application?.id ?? inspectionId}
          </span>
          <span className="px-3 py-2 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
            {inspection?.status || "Scheduled"}
          </span>
        </div>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-100 text-green-700 rounded-2xl px-5 py-4 font-medium">
          {message}
        </div>
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
                        ? "bg-primary text-white shadow-sm"
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
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold text-primary">
                    Checklist Review
                  </h3>
                </div>
                <p className="text-sm text-gray-500">
                  Confirm the field conditions below before writing your final
                  opinion.
                </p>

                <div className="space-y-5">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        Organization Profile
                      </p>
                      <h4 className="mt-1 text-base font-black text-primary">
                        {organizationName}
                      </h4>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-500 border">
                      Application #{inspection?.application?.id ?? inspectionId}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 text-sm">
                    <div className="rounded-2xl border bg-white p-4 space-y-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        Address
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-4">
                        <div className="space-y-3 text-gray-500 font-semibold">
                          <p>Region</p>
                          <p>Zone</p>
                          <p>Woreda</p>
                          <p>Kebele</p>
                          <p>Special Location</p>
                          <p>House Number</p>
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
                        Infrastructure
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-4">
                        <div className="space-y-3 text-gray-500 font-semibold">
                          <p>Total Office Count</p>
                          <p>Total Vehicle Count</p>
                          <p>Total Computer Count</p>
                          <p>Storehouse Availability</p>
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
                            className={`font-bold ${inspection?.application?.organization?.hasStoreHouse ? "text-green-600" : "text-amber-600"}`}
                          >
                            {inspection?.application?.organization
                              ?.hasStoreHouse
                              ? "Yes"
                              : "No"}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">
                        Use these facility counts to confirm the organization is
                        operationally ready.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => handleToggle("isLocationValid")}
                    aria-pressed={form.isLocationValid}
                    className={`rounded-2xl border-2 border-[#003366] bg-white p-4 text-left transition-all ${toggleButtonClass(
                      form.isLocationValid,
                    )}`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-black transition-colors ${indicatorClass(
                          form.isLocationValid,
                        )}`}
                        aria-hidden="true"
                      >
                        ✓
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-bold text-gray-900">
                            Location Valid
                          </span>
                          <span
                            className={`text-xs font-bold ${form.isLocationValid ? "text-green-600" : "text-gray-400"}`}
                          >
                            {form.isLocationValid ? "Confirmed" : "Pending"}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          Site access, address, and location details are
                          verified.
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggle("isInfrastructureValid")}
                    aria-pressed={form.isInfrastructureValid}
                    className={`rounded-2xl border-2 border-[#003366] bg-white p-4 text-left transition-all ${toggleButtonClass(
                      form.isInfrastructureValid,
                    )}`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-black transition-colors ${indicatorClass(
                          form.isInfrastructureValid,
                        )}`}
                        aria-hidden="true"
                      >
                        ✓
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-bold text-gray-900">
                            Infrastructure Valid
                          </span>
                          <span
                            className={`text-xs font-bold ${form.isInfrastructureValid ? "text-green-600" : "text-gray-400"}`}
                          >
                            {form.isInfrastructureValid
                              ? "Confirmed"
                              : "Pending"}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          Office layout, facilities, and physical readiness are
                          confirmed.
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggle("isTrainingValid")}
                    aria-pressed={form.isTrainingValid}
                    className={`rounded-2xl border-2 border-[#003366] bg-white p-4 text-left transition-all ${toggleButtonClass(
                      form.isTrainingValid,
                    )}`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-black transition-colors ${indicatorClass(
                          form.isTrainingValid,
                        )}`}
                        aria-hidden="true"
                      >
                        ✓
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-bold text-gray-900">
                            Training Valid
                          </span>
                          <span
                            className={`text-xs font-bold ${form.isTrainingValid ? "text-green-600" : "text-gray-400"}`}
                          >
                            {form.isTrainingValid ? "Confirmed" : "Pending"}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          Required training evidence and records are consistent.
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold text-primary">
                    Findings Summary
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
                  placeholder="Write concise site findings, deficiencies, and notable observations..."
                  className="w-full rounded-2xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none px-4 py-3 text-sm bg-gray-50"
                />
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold text-primary">
                    Expert Opinion
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
                  placeholder="State your professional opinion and recommendation for the admin team..."
                  className="w-full rounded-2xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none px-4 py-3 text-sm bg-gray-50"
                />
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold text-primary">
                    Final Inspection Report
                  </h3>
                </div>

                {finalReportUrl ? (
                  <div className="rounded-2xl border bg-green-50 p-4 space-y-3">
                    <p className="text-sm font-semibold text-green-800">
                      Final report generated and saved.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <a
                        href={resolveFileUrl(finalReportUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-bold"
                      >
                        <FileText className="w-4 h-4" />
                        View PDF
                      </a>
                      <a
                        href={resolveFileUrl(finalReportUrl)}
                        download={`inspection-${inspection?.id ?? inspectionId}-final-report.pdf`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-primary text-primary bg-white font-bold"
                      >
                        <UploadCloud className="w-4 h-4 rotate-180" />
                        Download PDF
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border bg-gray-50 p-4 space-y-3">
                    <p className="text-sm text-gray-600">
                      The final report can only be generated after every committee member and the lead inspector sign.
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${allCommitteeSigned ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                        {allCommitteeSigned ? "All signatures complete" : "Waiting for signatures"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {isLeadInspector ? "You are the lead inspector." : "Only the lead inspector can generate the report."}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleConfirmFinalReport}
                      disabled={!isLeadInspector || !allCommitteeSigned || reportGenerating}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-primary text-white font-bold disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {reportGenerating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                      Confirm & Generate PDF
                    </button>
                  </div>
                )}
              </section>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-primary text-white font-bold disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Field Review
                </button>
                <Link
                  to="/field-reviewer/inspections"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Queue
                </Link>
              </div>
            </div>
          )}

          {activeSection === "status" && (
            <div className="bg-white rounded-3xl shadow-sm border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-primary">
                  Review Status
                </h3>
              </div>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs text-gray-500">
                      Assigned Reviewer
                    </div>
                    <div className="font-bold text-primary">
                      {inspection?.leadInspector?.fullName ||
                        inspection?.leadInspector?.username ||
                        "-"}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-gray-500">Lead Signature</div>
                    <div className="font-bold text-primary">
                      {leadCommittee?.signatureUrl
                        ? "Signed"
                        : "Pending signature"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Checklist Complete</span>
                  <span
                    className={`font-bold ${overallReady ? "text-green-600" : "text-amber-600"}`}
                  >
                    {overallReady ? "Yes" : "In Progress"}
                  </span>
                </div>
                {leadCommittee?.signatureUrl ? (
                  <div className="mt-3">
                    <img
                      src={leadCommittee.signatureUrl}
                      alt="Lead inspector signature"
                      className="max-h-24 rounded-lg border bg-gray-50 object-contain"
                    />
                  </div>
                ) : null}

                {!leadCommittee?.signatureUrl &&
                inspection?.leadInspector?.id === currentUserId ? (
                  <div className="mt-3 flex flex-col gap-2 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-3">
                    <p className="text-xs font-semibold text-primary">
                      Upload your lead signature image
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

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById(
                            `lead-file-${inspectionId}`,
                          ) as HTMLInputElement | null;
                          if (el) el.click();
                        }}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-white text-sm font-semibold"
                      >
                        <UploadCloud className="w-4 h-4" />
                        Upload
                      </button>
                      <p className="text-[11px] text-gray-500">
                        Only the assigned lead inspector can upload this
                        signature.
                      </p>
                    </div>

                    {leadUploading ? (
                      <p className="text-xs text-gray-500">
                        Uploading signature...
                      </p>
                    ) : null}
                  </div>
                ) : null}
                <div className="flex items-center justify-between gap-3">
                  <span>Committee Members</span>
                  {inspection?.committeeMembers &&
                  inspection.committeeMembers.length > 0 ? (
                    <span className="font-bold text-primary">
                      {inspection.committeeMembers.length}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">
                      No committee members assigned.
                    </span>
                  )}
                </div>
                {!!inspection?.committeeMembers?.length && (
                  <div className="rounded-2xl border bg-gray-50 p-4 space-y-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                      Assigned Committee
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {inspection.committeeMembers.map((member) => (
                        <span
                          key={member.id}
                          className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold text-primary border"
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

              <div className="rounded-2xl bg-gray-50 border p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Guidance
                </p>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  Keep notes objective, use short actionable sentences, and
                  paste the final report URL only after the review is complete.
                </p>
              </div>
            </div>
          )}

          {activeSection === "snapshot" && (
            <div className="bg-white rounded-3xl shadow-sm border p-6 space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Application Snapshot
              </p>
              <div>
                <h4 className="text-xl font-black text-primary">
                  {organizationName}
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  Applicant: {inspection?.application?.user?.fullName || "-"}
                </p>
              </div>
              {finalReportUrl ? (
                <a
                  href={resolveFileUrl(finalReportUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-bold"
                >
                  <FileText className="w-4 h-4" />
                  View Final PDF
                </a>
              ) : null}
              <div className="grid gap-3 text-sm text-gray-600">
                <div className="flex items-center justify-between gap-4">
                  <span>Application Date</span>
                  <span className="font-bold text-primary">
                    {formatDateTime(inspection?.application?.applicationDate)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Applicant Phone</span>
                  <span className="font-bold text-primary">
                    {inspection?.application?.user?.phone || "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Applicant Email</span>
                  <span className="font-bold text-primary break-all text-right">
                    {inspection?.application?.user?.email || "-"}
                  </span>
                </div>
              </div>
              <div className="rounded-2xl border bg-gray-50 p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Committee Members
                </p>
                {inspection?.committeeMembers?.length ? (
                  <div className="space-y-2">
                    {inspection.committeeMembers.map((member) => (
                      <div
                        key={member.id}
                        className="space-y-3 rounded-xl bg-white px-4 py-3 border"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-bold text-primary">
                              {committeeLabel(member)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {member.expertRole || "Committee Member"}
                            </p>
                          </div>
                          <span className="text-xs font-bold text-gray-400">
                            {member.signatureUrl
                              ? "Signed"
                              : "Pending signature"}
                          </span>
                        </div>

                        {member.signatureUrl ? (
                          <img
                            src={member.signatureUrl}
                            alt={`${committeeLabel(member)} signature`}
                            className="max-h-24 rounded-lg border bg-gray-50 object-contain"
                          />
                        ) : null}

                        {Number.isFinite(currentUserId) &&
                        member.userId === currentUserId &&
                        !member.signatureUrl ? (
                          <div className="flex flex-col gap-2 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-3">
                            <p className="text-xs font-semibold text-primary">
                              Upload your own signature image
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

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const el = document.getElementById(
                                    `committee-file-${member.id}`,
                                  ) as HTMLInputElement | null;
                                  if (el) el.click();
                                }}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-white text-sm font-semibold"
                              >
                                <UploadCloud className="w-4 h-4" />
                                Upload
                              </button>
                              <p className="text-[11px] text-gray-500">
                                Only the assigned reviewer can upload this
                                signature.
                              </p>
                            </div>
                          </div>
                        ) : null}

                        {signatureUploadingId === member.id ? (
                          <p className="text-xs font-semibold text-gray-500">
                            Uploading signature...
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No committee members assigned.
                  </p>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default InspectionReviewForm;
