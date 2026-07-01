// filepath: frontend/src/pages/AdminInspections.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  ClipboardCheck,
  Download,
  FileText,
  RefreshCw,
  Shield,
  ShieldCheck,
  X,
  UserRound,
  UsersRound,
  Edit,
  Search,
} from "lucide-react";
import { motion } from "motion/react";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { AutoDismissToast } from "../components/AutoDismissToast";
import UpdateInspectionModal from "../components/UpdateInspectionModal";

import { useLanguage } from "../context/LanguageContext";
import { apiRequest, resolveBackendAssetUrl } from "../lib/api";

type InspectionRow = {
  id: number;
  scheduledDate?: string;
  status?: string | null;
  findingsSummary?: string | null;
  expertOpinion?: string | null;
  final_report_url?: string | null;
  finalReportUrl?: string | null;
  application?: {
    id: number;
    status?: string | null;
    applicationDate?: string;
    organization?: {
      nameEnglish?: string | null;
      nameAmharic?: string | null;
    } | null;
    manager?: {
      id: number;
      user?: {
        id: number;
        fullName?: string | null;
        username?: string | null;
        email?: string | null;
        phone?: string | null;
        faydaId?: string | null;
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
    expertName?: string;
    expertRole?: string | null;
    signatureUrl?: string | null;
    signedAt?: string | null;
  }>;
};

const formatDate = (value?: string) => {
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

const getStatusTone = (status?: string | null) => {
  const normalized = String(status || "").toLowerCase();
  if (
    normalized.includes("field_reviewed") ||
    normalized.includes("completed")
  ) {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }
  if (normalized.includes("reject")) {
    return "bg-red-100 text-red-700 border-red-200";
  }
  if (normalized.includes("review")) {
    return "bg-blue-100 text-blue-700 border-blue-200";
  }
  if (normalized.includes("sched")) {
    return "bg-amber-100 text-amber-700 border-amber-200";
  }
  return "bg-gray-100 text-gray-600 border-gray-200";
};

const translateStatus = (status?: string | null, isAm = false) => {
  const normalized = String(status || "").toLowerCase();
  if (!isAm) return status || "Scheduled";
  if (
    normalized.includes("field_reviewed") ||
    normalized.includes("completed")
  ) {
    return "ተጠናቋል";
  }
  if (normalized.includes("reject")) return "ውድቅ ሆኗል";
  if (normalized.includes("review")) return "በግምገማ ላይ";
  if (normalized.includes("sched")) return "ቀጠሮ ተይዟል";
  return status || "ቀጠሮ ተይዟል";
};

const getOrganizationName = (inspection?: InspectionRow | null, isAm = false) =>
  (isAm
    ? inspection?.application?.organization?.nameAmharic ||
      inspection?.application?.organization?.nameEnglish
    : inspection?.application?.organization?.nameEnglish ||
      inspection?.application?.organization?.nameAmharic) ||
  (isAm
    ? `ምርመራ #${inspection?.id ?? "-"}`
    : `Inspection #${inspection?.id ?? "-"}`);

const resolveInspectionReportUrl = (url?: string | null) =>
  resolveBackendAssetUrl(url);

const getReportFileName = (url?: string | null) => {
  if (!url) return "inspection-final-report.pdf";

  const cleanUrl = url.split("?")[0].split("#")[0];
  const parts = cleanUrl.split("/").filter(Boolean);
  return decodeURIComponent(
    parts[parts.length - 1] || "inspection-final-report.pdf",
  );
};

const getFinalReportUrl = (inspection?: InspectionRow | null) =>
  inspection?.final_report_url ?? inspection?.finalReportUrl ?? null;

const StatCard = ({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  tone: "blue" | "green" | "amber" | "slate";
}) => {
  const styles = {
    blue: "from-[#003366]/10 to-[#0F4C81]/5 border-[#003366]/15 text-[#003366]",
    green: "from-emerald-50 to-green-50 border-emerald-200 text-emerald-700",
    amber: "from-amber-50 to-yellow-50 border-amber-200 text-amber-700",
    slate: "from-slate-50 to-gray-50 border-slate-200 text-slate-700",
  };

  return (
    <div
      className={`rounded-3xl border bg-gradient-to-br p-5 shadow-sm ${styles[tone]}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-3xl font-black">{value}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
          {icon}
        </div>
      </div>
    </div>
  );
};

const InspectionDetailsContent = ({
  inspection,
  isAm,
  onOpenReview,
  onOpenApplications,
}: {
  inspection: InspectionRow;
  isAm: boolean;
  onOpenReview: () => void;
  onOpenApplications: () => void;
}) => {
  const committeeCount = inspection.committeeMembers?.length || 0;
  const managerUser = inspection.application?.manager?.user || null;
  const applicantName =
    managerUser?.fullName ||
    managerUser?.username ||
    inspection.application?.user?.fullName ||
    inspection.application?.user?.email ||
    "-";
  const applicantEmail =
    managerUser?.email || inspection.application?.user?.email || "-";
  const applicantPhone =
    managerUser?.phone || inspection.application?.user?.phone || "-";

  const finalReportUrl = getFinalReportUrl(inspection);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleDownload = async (url?: string | null) => {
    if (!url) return;
    const resolved = resolveInspectionReportUrl(url);
    const token = localStorage.getItem("efp_token");
    const fileName = getReportFileName(url);

    try {
      const res = await fetch(resolved, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error(
        "Failed to download file, falling back to direct link",
        err,
      );
      const a = document.createElement("a");
      a.href = resolved;
      a.download = fileName;
      a.target = "_blank";
      a.rel = "noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2 border-b border-slate-100 pb-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#003366]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-[#003366]">
          <FileText className="h-4 w-4" />
          {isAm ? "ምርመራ ዝርዝሮች" : "Inspection Details"}
        </div>
        <h2 className="text-2xl font-black text-[#003366]">
          {getOrganizationName(inspection, isAm)}
        </h2>
        <p className="text-sm text-slate-500">
          {isAm ? `ምርመራ #${inspection.id}` : `Inspection #${inspection.id}`}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            {isAm ? "ቀጠሮ ቀን" : "Scheduled"}
          </p>
          <p className="mt-2 text-sm font-semibold text-[#003366]">
            {formatDate(inspection.scheduledDate)}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            {isAm ? "ሁኔታ" : "Status"}
          </p>
          <p className="mt-2 text-sm font-semibold text-[#003366]">
            {translateStatus(inspection.status, isAm)}
          </p>
        </div>
      </div>

      <div className="space-y-3 rounded-3xl border border-slate-100 bg-slate-50 p-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[#003366]">
          <Building2 className="h-4 w-4 text-slate-400" />
          {isAm ? "ማመልከቻ መረጃ" : "Application Info"}
        </div>
        <div className="grid gap-3 text-sm text-slate-600">
          <div className="flex items-start justify-between gap-4">
            <span>{isAm ? "ድርጅት" : "Organization"}</span>
            <span className="max-w-[60%] text-right font-semibold text-[#003366]">
              {getOrganizationName(inspection, isAm)}
            </span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <span>{isAm ? "ማመልከቻ" : "Application"}</span>
            <span className="font-semibold text-[#003366]">
              #{inspection.application?.id ?? "-"}
            </span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <span>{isAm ? "የማመልከቻ ሁኔታ" : "Application Status"}</span>
            <span className="font-semibold text-[#003366]">
              {inspection.application?.status || "-"}
            </span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <span>{isAm ? "አመልካች" : "Applicant"}</span>
            <span className="max-w-[60%] text-right font-semibold text-[#003366]">
              {applicantName}
            </span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <span>{isAm ? "ኢሜይል" : "Email"}</span>
            <span className="max-w-[60%] text-right font-semibold text-[#003366]">
              {applicantEmail}
            </span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <span>{isAm ? "ስልክ" : "Phone"}</span>
            <span className="max-w-[60%] text-right font-semibold text-[#003366]">
              {applicantPhone}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-[#003366]">
          <UsersRound className="h-4 w-4 text-slate-400" />
          {isAm ? "ኮሚቴ" : "Committee"}
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-4">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-slate-500">
              {isAm ? "ዋና ባለሞያ" : "Lead Inspector"}
            </span>
            <span className="font-semibold text-[#003366]">
              {inspection.leadInspector?.fullName ||
                inspection.leadInspector?.username ||
                (isAm ? "አልተመደበም" : "Unassigned")}
            </span>
          </div>

          <div className="space-y-2">
            {(inspection.committeeMembers || []).length > 0 ? (
              inspection.committeeMembers?.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#003366]">
                      {member.expertName ||
                        (isAm ? "ኮሚቴ አባል" : "Committee Member")}
                    </p>
                    <p className="text-xs text-slate-500">
                      {member.expertRole ||
                        (isAm ? "ሚና አልተገለጸም" : "No role provided")}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-bold ${member.signatureUrl ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}
                  >
                    {member.signatureUrl
                      ? isAm
                        ? "ተፈርሟል"
                        : "Signed"
                      : isAm
                        ? "አልተፈረመም"
                        : "Pending"}
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500">
                {isAm ? "ኮሚቴ አባላት አልተመደቡም" : "No committee members assigned"}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-[#003366]">
          <ShieldCheck className="h-4 w-4 text-slate-400" />
          {isAm ? "ምዘና ማጠቃለያ" : "Review Summary"}
        </div>
        <div className="space-y-3 rounded-3xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              {isAm ? "ግኝቶች" : "Findings"}
            </p>
            <p className="mt-2 leading-6 text-slate-700">
              {inspection.findingsSummary ||
                (isAm ? "ግኝቶች አልተመዘገቡም" : "No findings summary yet.")}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              {isAm ? "የባለሙያ አመለካከት" : "Expert Opinion"}
            </p>
            <p className="mt-2 leading-6 text-slate-700">
              {inspection.expertOpinion ||
                (isAm ? "የባለሙያ አመለካከት አልተመዘገበም" : "No expert opinion yet.")}
            </p>
          </div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            {isAm
              ? `${committeeCount} ኮሚቴ አባላት`
              : `${committeeCount} committee members`}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-[#003366]">
          <FileText className="h-4 w-4 text-slate-400" />
          {isAm ? "የመጨረሻ ሪፖርት" : "Final Report"}
        </div>
        {finalReportUrl ? (
          <div className="space-y-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  {isAm ? "ፋይል ስም" : "File Name"}
                </p>
                <p className="mt-2 truncate text-sm font-semibold text-[#003366]">
                  {getReportFileName(finalReportUrl)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                >
                  {isAm ? "ቅድመ እይታ" : "Preview"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Preview modal */}
            {previewOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
                <button
                  type="button"
                  aria-label={isAm ? "ዝርዝር መስኮት ዝጋ" : "Close preview"}
                  className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
                  onClick={() => setPreviewOpen(false)}
                />
                <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-[1rem] border border-slate-200 bg-white shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#003366]">
                        {isAm ? "የመጨረሻ ሪፖርት" : "Final report"}
                      </p>
                      <p className="text-sm font-semibold text-[#003366]">
                        {getReportFileName(finalReportUrl)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void handleDownload(finalReportUrl)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-[#003366]/15 bg-[#003366] px-3 py-2 text-sm font-semibold text-white shadow-sm"
                      >
                        <Download className="h-4 w-4" />
                        {isAm ? "PDF አውርድ" : "Download"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewOpen(false)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="overflow-hidden rounded-lg border bg-slate-50">
                      <iframe
                        src={`${resolveInspectionReportUrl(finalReportUrl)}#toolbar=0&navpanes=0`}
                        title={
                          isAm ? "የመጨረሻ ሪፖርት ቅድመ እይታ" : "Final report preview"
                        }
                        className="h-[70vh] w-full border-0 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
            {isAm
              ? "የመጨረሻ ሪፖርት አልተጫነም"
              : "No final report has been uploaded yet."}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onOpenReview}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#003366] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#003366]/20 transition hover:-translate-y-0.5 hover:bg-[#0f4c81]"
        >
          {isAm ? "ዝርዝር ሪፖርት ክፈት" : "Open Review Form"}
          <ArrowRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onOpenApplications}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#003366]/25 hover:text-[#003366]"
        >
          {isAm ? "ወደ ማመልከቻ" : "Back to Applications"}
        </button>
      </div>
    </div>
  );
};

export const AdminInspections = () => {
  const { language } = useLanguage();
  const isAm = language === "am";
  const navigate = useNavigate();
  const [inspections, setInspections] = useState<InspectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInspectionId, setSelectedInspectionId] = useState<
    number | null
  >(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMessage, setToastMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadInspections = async (showToast = false) => {
    setLoading(true);
    try {
      const response = await apiRequest("/inspections");
      const data = (response as any)?.data ?? response;
      const rows = Array.isArray(data) ? data : [];
      setInspections(rows);
      setSelectedInspectionId((current) => current ?? rows[0]?.id ?? null);
      if (showToast) {
        setToastType("success");
        setToastMessage(
          isAm ? "ምርመራዎች ተጫኑ።" : "Inspections loaded successfully.",
        );
        setToastOpen(true);
      }
    } catch (error) {
      console.error("Failed to load admin inspections", error);
      setInspections([]);
      setToastType("error");
      setToastMessage(
        isAm ? "ምርመራዎችን ለማግኘት አልቻለም።" : "Failed to load inspections.",
      );
      setToastOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadInspections();
  }, []);

  useEffect(() => {
    if (!inspections.length) {
      setSelectedInspectionId(null);
      setDetailModalOpen(false);
      return;
    }

    const hasSelected = inspections.some(
      (inspection) => inspection.id === selectedInspectionId,
    );
    if (!hasSelected) {
      setSelectedInspectionId(inspections[0].id);
    }
  }, [inspections, selectedInspectionId]);

  const selectedInspection = useMemo(
    () =>
      inspections.find(
        (inspection) => inspection.id === selectedInspectionId,
      ) || null,
    [inspections, selectedInspectionId],
  );

  const summary = useMemo(() => {
    const normalized = inspections.map((inspection) =>
      String(inspection.status || "").toLowerCase(),
    );

    return {
      total: inspections.length,
      scheduled: normalized.filter((status) => status.includes("sched")).length,
      reviewing: normalized.filter(
        (status) =>
          status.includes("review") && !status.includes("field_reviewed"),
      ).length,
      completed: normalized.filter(
        (status) =>
          status.includes("field_reviewed") || status.includes("completed"),
      ).length,
    };
  }, [inspections]);

  const filteredInspections = useMemo(() => {
    return inspections.filter((inspection) => {
      const matchesSearch =
        !searchQuery ||
        getOrganizationName(inspection, false)
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        getOrganizationName(inspection, true)
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        String(inspection.id).includes(searchQuery);

      const statusKey = String(inspection.status || "").toLowerCase();
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "scheduled" && statusKey.includes("sched")) ||
        (statusFilter === "reviewing" &&
          statusKey.includes("review") &&
          !statusKey.includes("field_reviewed")) ||
        (statusFilter === "completed" &&
          (statusKey.includes("field_reviewed") ||
            statusKey.includes("completed"))) ||
        (statusFilter === "rejected" && statusKey.includes("reject"));

      return matchesSearch && matchesStatus;
    });
  }, [inspections, searchQuery, statusFilter]);

  const subtitle = isAm
    ? "ሁሉንም የቀጠሮ ምርመራዎች ይቆጣጠሩ፣ ዝርዝሮችን ይመልከቱ እና ወደ ማመልከቻዎች ይመለሱ።"
    : "Track scheduled inspections, review details, and jump back to application assignment when needed.";

  return (
    <main className="min-h-full bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/50 backdrop-blur"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#003366]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.28em] text-[#003366]">
                <ClipboardCheck className="h-4 w-4" />
                {isAm ? "ምርመራ አስተዳደር" : "Inspection Management"}
              </div>
              <h1 className="text-3xl font-black tracking-tight text-[#003366] lg:text-4xl">
                {isAm ? "የምርመራ ዳሽቦርድ" : "Admin Inspections"}
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-slate-600 lg:text-base">
                {subtitle}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void loadInspections(true)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#003366]/25 hover:text-[#003366]"
              >
                <RefreshCw className="h-4 w-4" />
                {isAm ? "እንደገና ጫን" : "Refresh"}
              </button>
              <Link
                to="/admin/applications"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#003366] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#003366]/20 transition hover:-translate-y-0.5 hover:bg-[#0f4c81]"
              >
                {isAm ? "ወደ ማመልከቻዎች" : "Open Applications"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label={isAm ? "ጠቅላላ ምርመራዎች" : "Total Inspections"}
              value={summary.total}
              icon={<ClipboardCheck className="h-5 w-5" />}
              tone="blue"
            />
            <StatCard
              label={isAm ? "ቀጠሮ የተያዙ" : "Scheduled"}
              value={summary.scheduled}
              icon={<CalendarDays className="h-5 w-5" />}
              tone="amber"
            />
            <StatCard
              label={isAm ? "በግምገማ ላይ" : "In Review"}
              value={summary.reviewing}
              icon={<ShieldCheck className="h-5 w-5" />}
              tone="slate"
            />
            <StatCard
              label={isAm ? "የተጠናቀቁ" : "Completed"}
              value={summary.completed}
              icon={<BadgeCheck className="h-5 w-5" />}
              tone="green"
            />
          </div>
        </motion.section>

        <section className="grid gap-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/50"
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-[#003366]">
                  {isAm ? "የምርመራ ዝርዝር" : "Inspection Queue"}
                </h2>
                <p className="text-sm text-slate-500">
                  {isAm
                    ? "ምርመራ ለመክፈት ከታች ይምረጡ"
                    : "Select an inspection below to inspect the details."}
                </p>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                {filteredInspections.length}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={isAm ? "ድርጅት ይፈልጉ..." : "Search agency..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003366] w-full shadow-sm"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: "all", label: isAm ? "ሁሉም" : "All" },
                  { key: "scheduled", label: isAm ? "ቀጠሮ የተያዙ" : "Scheduled" },
                  { key: "reviewing", label: isAm ? "በግምገማ ላይ" : "Reviewing" },
                  { key: "completed", label: isAm ? "የተጠናቀቁ" : "Completed" },
                  { key: "rejected", label: isAm ? "ውድቅ የተደረጉ" : "Rejected" },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setStatusFilter(opt.key)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                      statusFilter === opt.key
                        ? "bg-[#003366] text-white shadow-md"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {loading ? (
                <div className="py-12">
                  <LoadingSpinner
                    fullPage
                    size="lg"
                    text={isAm ? "በመጫን ላይ..." : "Loading inspections..."}
                  />
                </div>
              ) : inspections.length === 0 ? (
                <div className="px-8 py-16 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <Shield className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">
                    {isAm ? "ምርመራ አልተገኘም" : "No inspections found"}
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-slate-500">
                    {isAm
                      ? "ከፍልት ጋር የሚዛመድ ምርመራ አልተገኘም።"
                      : "No inspections match your current search or filter."}
                  </p>
                  <Link
                    to="/super-admin/applications"
                    className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#003366] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#003366]/20 transition hover:bg-[#0f4c81]"
                  >
                    {isAm ? "ማመልከቻዎችን ክፈት" : "Open Applications"}
                  </Link>
                </div>
              ) : filteredInspections.length === 0 ? (
                <div className="px-8 py-16 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <Shield className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">
                    {isAm ? "ምርመራ አልተገኘም" : "No matching inspections"}
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-slate-500">
                    {isAm
                      ? "እባክዎ በስም ወይም በሁኔታ መፈለግዎን ይቀይሩ።"
                      : "Try a different search term or filter to find matching inspections."}
                  </p>
                </div>
              ) : null}

              {!loading &&
                filteredInspections.map((inspection, index) => {
                  const selected = inspection.id === selectedInspectionId;
                  const organizationName = getOrganizationName(
                    inspection,
                    isAm,
                  );
                  const committeeCount =
                    inspection.committeeMembers?.length || 0;

                  return (
                    <div
                      key={inspection.id}
                      onClick={() => setSelectedInspectionId(inspection.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelectedInspectionId(inspection.id);
                        }
                      }}
                      className={`w-full rounded-3xl border p-4 text-left transition ${
                        selected
                          ? "border-[#003366]/25 bg-[#003366]/5 shadow-md shadow-[#003366]/10"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-[#003366]">
                              <span className="text-sm font-black">
                                {index + 1}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <h3 className="truncate font-bold text-[#003366]">
                                {organizationName}
                              </h3>
                              <p className="text-sm text-slate-500">
                                {isAm
                                  ? `ማመልከቻ #${inspection.application?.id ?? "-"}`
                                  : `Application #${inspection.application?.id ?? "-"}`}
                              </p>
                            </div>
                          </div>

                          <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-3">
                            <div className="inline-flex items-center gap-2">
                              <CalendarDays className="h-4 w-4 text-slate-400" />
                              <span>
                                {formatDate(inspection.scheduledDate)}
                              </span>
                            </div>
                            <div className="inline-flex items-center gap-2">
                              <UserRound className="h-4 w-4 text-slate-400" />
                              <span>
                                {inspection.leadInspector?.fullName ||
                                  inspection.leadInspector?.username ||
                                  (isAm
                                    ? "ዋና ባለሞያ አልተመደበም"
                                    : "No lead inspector")}
                              </span>
                            </div>
                            <div className="inline-flex items-center gap-2">
                              <UsersRound className="h-4 w-4 text-slate-400" />
                              <span>
                                {isAm
                                  ? `${committeeCount} ኮሚቴ አባላት`
                                  : `${committeeCount} committee members`}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-start gap-3 md:items-end">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getStatusTone(inspection.status)}`}
                          >
                            {translateStatus(inspection.status, isAm)}
                          </span>
                          {inspection.findingsSummary && (
                            <div className="text-xs text-slate-400">
                              <span>{isAm ? "ግኝቶች አሉ" : "Has findings"}</span>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedInspectionId(inspection.id);
                              setDetailModalOpen(true);
                            }}
                            className="inline-flex items-center gap-2 rounded-2xl border border-[#003366]/15 bg-white px-4 py-2 text-xs font-bold text-[#003366] transition hover:border-[#003366]/30 hover:bg-[#003366]/5"
                          >
                            {isAm ? "ዝርዝር ይመልከቱ" : "Detail View"}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                          {String(inspection.status || "")
                            .toLowerCase()
                            .includes("field_reviewed") ? (
                            <button
                              type="button"
                              disabled
                              title={
                                isAm
                                  ? "የተጠናቋል - አዲስ ማሻሻያ አይታደርግ"
                                  : "Field reviewed - cannot edit"
                              }
                              className="inline-flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-400"
                            >
                              <Edit className="h-4 w-4" />
                              {isAm ? "አስተካክል" : "Edit"}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                setSelectedInspectionId(inspection.id);
                                setUpdateModalOpen(true);
                              }}
                              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300"
                            >
                              <Edit className="h-4 w-4 text-[#003366]" />
                              {isAm ? "አስተካክል" : "Edit"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </motion.div>
        </section>

        {detailModalOpen && selectedInspection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
            <button
              type="button"
              aria-label={isAm ? "ዝርዝር መስኮት ዝጋ" : "Close detail modal"}
              className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
              onClick={() => setDetailModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              className="relative z-10 w-full max-w-4xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#003366]">
                    {isAm ? "ምርመራ ዝርዝሮች" : "Inspection Details"}
                  </p>
                  <h3 className="text-lg font-black text-[#003366]">
                    {getOrganizationName(selectedInspection, isAm)}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailModalOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="max-h-[78vh] overflow-y-auto p-5">
                <InspectionDetailsContent
                  inspection={selectedInspection}
                  isAm={isAm}
                  onOpenReview={() =>
                    navigate(
                      `/field-reviewer/inspections/${selectedInspection.id}`,
                    )
                  }
                  onOpenApplications={() =>
                    navigate("/super-admin/applications")
                  }
                />
              </div>
            </motion.div>
          </div>
        )}
        {updateModalOpen && selectedInspection && (
          <UpdateInspectionModal
            isOpen={updateModalOpen}
            inspectionId={selectedInspection.id}
            initialLeadId={selectedInspection.leadInspector?.id ?? null}
            initialCommitteeIds={(
              selectedInspection.committeeMembers || []
            ).map((m) => m.userId ?? m.id)}
            initialScheduledAt={selectedInspection.scheduledDate ?? null}
            onClose={() => setUpdateModalOpen(false)}
            onUpdated={() => {
              setUpdateModalOpen(false);
              void loadInspections(true);
            }}
          />
        )}
        <AutoDismissToast
          isOpen={toastOpen}
          type={toastType}
          message={toastMessage}
          onClose={() => setToastOpen(false)}
        />
      </div>
    </main>
  );
};
