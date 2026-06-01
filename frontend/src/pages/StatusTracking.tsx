// filepath: frontend/src/pages/StatusTracking.tsx
import { useEffect, useMemo, useState } from "react";
import { Clock, CheckCircle2, AlertCircle, Search, Shield } from "lucide-react";
import { motion } from "motion/react";
import { useSearchParams } from "react-router-dom";

import { useLanguage } from "../context/LanguageContext";
import { apiRequest } from "../lib/api";

type TrackingUser = {
  id?: number;
  fullName?: string | null;
  username?: string | null;
  email?: string | null;
};

type TrackingHistoryItem = {
  id: number;
  statusState?: string | null;
  remarks?: string | null;
  changedAt?: string;
  changedBy?: number;
  user?: TrackingUser | null;
};

type TrackingCommitteeMember = {
  id: number;
  userId?: number | null;
  expertName?: string | null;
  expertRole?: string | null;
  signatureUrl?: string | null;
  signedAt?: string | null;
};

type TrackingInspection = {
  id: number;
  scheduledDate?: string | null;
  status?: string | null;
  findingsSummary?: string | null;
  expertOpinion?: string | null;
  finalReportUrl?: string | null;
  leadInspector?: TrackingUser | null;
  committeeMembers?: TrackingCommitteeMember[];
};

type TrackingApplication = {
  applicationId?: number;
  id?: number;
  status?: string | null;
  applicationDate?: string | null;
  totalEvents?: number;
  history?: TrackingHistoryItem[];
  inspection?: TrackingInspection | null;
  inspections?: TrackingInspection[];
};

type TimelineStatus =
  | "Approved"
  | "Rejected"
  | "Reviewing"
  | "Correction Requested"
  | "Pending"
  | "Completed"
  | "Other";

const STATUS_LABELS = {
  en: {
    title: "Track Application",
    appId: "Application ID",
    loading: "Loading application history...",
    empty: "No application history is available yet.",
    noApplication: "You have not submitted an application yet.",
    noApplicationHint:
      "Once you submit your first application, its status and review history will appear here.",
    noCurrentYear:
      "You do not have an application submitted in the current year yet.",
    noCurrentYearHint:
      "Submit a new application to see this year's tracking timeline.",
    error: "Unable to load application tracking data.",
    noRemarks: "No remarks provided.",
    submittedBy: "Updated by",
    lastUpdated: "Last updated",
    status: {
      approved: "Approved",
      rejected: "Rejected",
      reviewing: "In Progress",
      correction: "Correction Requested",
      pending: "Pending",
      completed: "Completed",
      other: "In Progress",
    },
    step: {
      approved: "Application Approved",
      rejected: "Application Rejected",
      reviewing: "Application Under Review",
      correction: "Correction Requested",
      pending: "Pending Review",
      other: "Application Update",
    },
  },
  am: {
    title: "ማመልከቻውን ይከታተሉ",
    appId: "የማመልከቻ መለያ ቁጥር",
    loading: "የማመልከቻ ሁኔታ እየተጫነ ነው...",
    empty: "እስካሁን የማመልከቻ ታሪክ አልተገኘም።",
    noApplication: "እስካሁን ማመልከቻ አላስገቡም።",
    noApplicationHint: "የመጀመሪያዎን ማመልከቻ ካስገቡ በኋላ የተገመገመው ሁኔታ እና ታሪኩ እዚህ ይታያል።",
    noCurrentYear: "በዚህ ዓመት የተጠረጠረ ማመልከቻ አልተገኘም።",
    noCurrentYearHint: "አዲስ ማመልከቻ ያስገቡ እና የዚህ ዓመት ክትትል ሁኔታ ይመልከቱ።",
    error: "የማመልከቻ ክትትል መረጃ መጫን አልተቻለም።",
    noRemarks: "ማብራሪያ አልተሰጠም።",
    submittedBy: "ያዘመነው",
    lastUpdated: "መጨረሻ የተሻሻለበት",
    status: {
      approved: "ጸድቋል",
      rejected: "ተሰርዟል",
      reviewing: "በሂደት ላይ",
      correction: "እርማት ተጠይቋል",
      pending: "በመጠባበቅ ላይ",
      completed: "ተጠናቋል",
      other: "በሂደት ላይ",
    },
    step: {
      approved: "ማመልከቻው ጸድቋል",
      rejected: "ማመልከቻው ተሰርዟል",
      reviewing: "ማመልከቻው በግምገማ ላይ ነው",
      correction: "እርማት ተጠይቋል",
      pending: "ግምገማ ይጠበቃል",
      other: "የማመልከቻ ማዘመን",
    },
  },
} as const;

const normalizeStatus = (value?: string | null): TimelineStatus => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();

  if (!normalized) return "Pending";
  if (normalized.includes("approve")) return "Approved";
  if (normalized.includes("reject")) return "Rejected";
  if (normalized.includes("correction")) return "Correction Requested";
  if (normalized.includes("review") || normalized.includes("progress")) {
    return "Reviewing";
  }
  if (normalized.includes("pending")) return "Pending";
  return "Other";
};

const formatDate = (value?: string | null, language?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  // If Amharic selected, prefer Ethiopic calendar formatting when available
  if (language === "am") {
    // Use a deterministic Ethiopic date + Ethiopian clock conversion
    const ethiopicMonthNames = [
      "መስከረም",
      "ጥቅምት",
      "ህዳር",
      "ታህሳስ",
      "ጥር",
      "የካቲት",
      "መጋቢት",
      "ሚያዝያ",
      "ግንቦት",
      "ሰኔ",
      "መጋቢት",
      "ሐምሌ",
      "ነሐሴ",
    ];

    const pad = (n: number) => String(n).padStart(2, "0");

    const gY = date.getFullYear();

    const isGregorianLeap = (y: number) =>
      y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);

    const newYearDay = isGregorianLeap(gY + 1) ? 12 : 11;
    const startOfEthiopianYear = new Date(gY, 8, newYearDay);

    let etYear: number;
    let daysSinceStart: number;

    if (date >= startOfEthiopianYear) {
      etYear = gY - 7;
      daysSinceStart = Math.floor(
        (date.getTime() - startOfEthiopianYear.getTime()) / 86400000,
      );
    } else {
      const prevNewYearDay = isGregorianLeap(gY) ? 12 : 11;
      const prevStart = new Date(gY - 1, 8, prevNewYearDay);
      etYear = gY - 8;
      daysSinceStart = Math.floor(
        (date.getTime() - prevStart.getTime()) / 86400000,
      );
    }

    const etMonthIndex = Math.floor(daysSinceStart / 30);
    const etDay = (daysSinceStart % 30) + 1;
    const monthName =
      ethiopicMonthNames[Math.max(0, Math.min(etMonthIndex, 12))] ||
      ethiopicMonthNames[0];

    const minutes = pad(date.getMinutes());

    // Ethiopian clock: hour = (Gregorian hour + 6) % 12, display 12 for 0
    const rawEthHour = (date.getHours() + 6) % 12;
    const ethHourDisplay = rawEthHour === 0 ? 12 : rawEthHour;

    return `${monthName} ${etDay}, ${etYear} ${ethHourDisplay}:${minutes} ሰዓት`;
  }

  // Default: English / Gregorian formatting
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getDaysUntilInspection = (value?: string | null, language?: string) => {
  if (!value) return null;

  const target = new Date(value);
  if (Number.isNaN(target.getTime())) return null;

  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const startOfTarget = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
  );
  const diffDays = Math.round(
    (startOfTarget.getTime() - startOfToday.getTime()) / 86400000,
  );

  const makeLabel = (en: string, am: string) => (language === "am" ? am : en);

  if (diffDays === 0)
    return { label: makeLabel("Today", "ዛሬ"), tone: "text-amber-700" };

  if (diffDays > 0) {
    const en = diffDays === 1 ? `1 day left` : `${diffDays} days left`;
    const am = `በ${diffDays} ቀናት ውስጥ`;
    return {
      label: makeLabel(en, am),
      tone: diffDays <= 2 ? "text-amber-700" : "text-emerald-700",
    };
  }

  const overdueDays = Math.abs(diffDays);
  const en =
    overdueDays === 1 ? `1 day overdue` : `${overdueDays} days overdue`;
  const am = `${overdueDays} ቀናት በፊት ያልተካለ`;
  return {
    label: makeLabel(en, am),
    tone: "text-red-700",
  };
};

const getStatusTone = (status: TimelineStatus) => {
  switch (status) {
    case "Approved":
    case "Completed":
      return {
        badge: "bg-green-50 text-green-700 border-green-100",
        pill: "bg-green-100 text-green-700",
        icon: "bg-green-500 text-white",
        panel: "border-green-100 ring-4 ring-green-50",
      };
    case "Rejected":
      return {
        badge: "bg-red-50 text-red-700 border-red-100",
        pill: "bg-red-100 text-red-700",
        icon: "bg-red-500 text-white",
        panel: "border-red-100 ring-4 ring-red-50",
      };
    case "Correction Requested":
      return {
        badge: "bg-amber-50 text-amber-700 border-amber-100",
        pill: "bg-amber-100 text-amber-700",
        icon: "bg-amber-500 text-white",
        panel: "border-amber-100 ring-4 ring-amber-50",
      };
    case "Reviewing":
      return {
        badge: "bg-blue-50 text-blue-700 border-blue-100",
        pill: "bg-primary text-secondary",
        icon: "bg-primary text-secondary",
        panel: "border-primary ring-4 ring-primary/5",
      };
    case "Pending":
      return {
        badge: "bg-gray-50 text-gray-700 border-gray-100",
        pill: "bg-gray-100 text-gray-400",
        icon: "bg-white text-gray-300 border-2 border-gray-100",
        panel: "border-gray-100",
      };
    default:
      return {
        badge: "bg-blue-50 text-blue-700 border-blue-100",
        pill: "bg-primary text-secondary",
        icon: "bg-primary text-secondary",
        panel: "border-primary ring-4 ring-primary/5",
      };
  }
};

const getStatusIcon = (status: TimelineStatus) => {
  switch (status) {
    case "Approved":
    case "Completed":
      return <CheckCircle2 className="w-8 h-8" />;
    case "Rejected":
      return <AlertCircle className="w-8 h-8" />;
    case "Correction Requested":
    case "Pending":
      return <Shield className="w-8 h-8" />;
    case "Reviewing":
    default:
      return <Clock className="w-8 h-8" />;
  }
};

const formatInspectionLabel = (inspection?: TrackingInspection | null) => {
  if (!inspection) return "-";
  return `Inspection #${inspection.id}`;
};

const getInspectionStatusLabel = (value?: string | null) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  if (!normalized) return "Pending";
  if (normalized.includes("approve")) return "Approved";
  if (normalized.includes("reject")) return "Rejected";
  if (normalized.includes("correction")) return "Correction Requested";
  if (normalized.includes("review") || normalized.includes("progress")) {
    return "Reviewing";
  }
  if (
    normalized.includes("completed") ||
    normalized.includes("field_reviewed")
  ) {
    return "Completed";
  }
  if (normalized.includes("sched")) return "Pending";
  return "Other";
};

export const StatusTracking = () => {
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();
  const [application, setApplication] = useState<TrackingApplication | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noApplicationYet, setNoApplicationYet] = useState(false);

  const curT =
    STATUS_LABELS[language as keyof typeof STATUS_LABELS] || STATUS_LABELS.en;

  const applicationIdParam = useMemo(() => {
    const raw = searchParams.get("applicationId") || searchParams.get("id");
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [searchParams]);

  const latestInspection = useMemo(() => {
    const inspection =
      application?.inspection ?? application?.inspections?.[0] ?? null;
    if (!inspection) return null;

    const sortedCommittee = [...(inspection.committeeMembers || [])].sort(
      (left, right) => (left.id || 0) - (right.id || 0),
    );

    return {
      ...inspection,
      committeeMembers: sortedCommittee,
    };
  }, [application]);

  useEffect(() => {
    let active = true;

    const loadTracking = async () => {
      setLoading(true);
      setError(null);
      setNoApplicationYet(false);

      try {
        const endpoint = applicationIdParam
          ? `/applications/${applicationIdParam}/history`
          : "/applications/me";
        const response = await apiRequest(endpoint);
        const data = (response as any)?.data ?? response;

        if (!active) return;

        if (applicationIdParam) {
          const history = Array.isArray(data?.history) ? data.history : [];
          setApplication({
            applicationId: Number(data?.applicationId ?? applicationIdParam),
            totalEvents: Number(data?.totalEvents ?? history.length),
            status: history[0]?.statusState ?? null,
            history,
            inspection: data?.inspection ?? null,
            inspections: Array.isArray(data?.inspections)
              ? data.inspections
              : data?.inspection
                ? [data.inspection]
                : [],
          });
        } else {
          const history = Array.isArray(data?.history) ? data.history : [];
          setApplication({
            id: Number(data?.id ?? data?.applicationId ?? null) || undefined,
            applicationId:
              Number(data?.id ?? data?.applicationId ?? null) || undefined,
            status: data?.status ?? history[0]?.statusState ?? null,
            applicationDate: data?.applicationDate ?? null,
            totalEvents: history.length,
            history,
            inspection: data?.inspection ?? data?.inspections?.[0] ?? null,
            inspections: Array.isArray(data?.inspections)
              ? data.inspections
              : data?.inspection
                ? [data.inspection]
                : [],
          });
        }
      } catch (requestError) {
        if (!active) return;

        console.error("Failed to load application tracking", requestError);
        const statusCode = (requestError as { statusCode?: number } | null)
          ?.statusCode;
        const message = String(
          (requestError as { message?: string } | null)?.message || "",
        ).toLowerCase();

        if (
          !applicationIdParam &&
          (statusCode === 404 || message.includes("not found"))
        ) {
          setApplication(null);
          setNoApplicationYet(true);
        } else {
          setApplication(null);
          setError(curT.error);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadTracking();

    return () => {
      active = false;
    };
  }, [applicationIdParam, curT.error]);

  const timelineEntries = useMemo(() => {
    const history = [...(application?.history || [])].sort((left, right) => {
      const leftDate = new Date(left.changedAt || 0).getTime();
      const rightDate = new Date(right.changedAt || 0).getTime();
      return leftDate - rightDate;
    });

    return history.map((entry, index) => {
      const normalizedStatus = normalizeStatus(entry.statusState);
      const statusTone = getStatusTone(normalizedStatus);
      const stepLabel =
        curT.step[
          normalizedStatus === "Approved"
            ? "approved"
            : normalizedStatus === "Rejected"
              ? "rejected"
              : normalizedStatus === "Correction Requested"
                ? "correction"
                : normalizedStatus === "Reviewing"
                  ? "reviewing"
                  : normalizedStatus === "Pending"
                    ? "pending"
                    : "other"
        ];

      return {
        id: entry.id ?? index,
        title: stepLabel,
        date: formatDate(entry.changedAt, language),
        status: normalizedStatus,
        desc: entry.remarks?.trim() || curT.noRemarks,
        actor:
          entry.user?.fullName?.trim() ||
          entry.user?.username?.trim() ||
          entry.user?.email?.trim() ||
          null,
        statusTone,
      };
    });
  }, [application?.history, curT, language]);

  const currentStatus = normalizeStatus(
    application?.status ??
      timelineEntries[timelineEntries.length - 1]?.status ??
      timelineEntries[0]?.status ??
      null,
  );
  const currentTone = getStatusTone(currentStatus);
  const applicationLabel =
    application?.applicationId ?? application?.id ?? applicationIdParam ?? "—";
  const currentYear = new Date().getFullYear();
  const applicationYear = application?.applicationDate
    ? new Date(application.applicationDate).getFullYear()
    : null;
  const isViewingSpecificApplication = applicationIdParam !== null;
  const hasCurrentYearApplication =
    isViewingSpecificApplication ||
    applicationYear === null ||
    applicationYear === currentYear;
  const showCurrentYearNotice =
    !loading && !error && !hasCurrentYearApplication && !!application;
  const showNoApplicationCard = !loading && !error && noApplicationYet;
  const inspectionStatus = getInspectionStatusLabel(latestInspection?.status);
  const inspectionTone = getStatusTone(inspectionStatus);
  const inspectionCountdown = getDaysUntilInspection(
    latestInspection?.scheduledDate,
    language,
  );

  const committeeMembersExcludingLead =
    latestInspection?.committeeMembers?.filter((m) => {
      const leadId = latestInspection?.leadInspector?.id;
      const leadName = latestInspection?.leadInspector?.fullName?.trim();
      if (leadId && m.userId) return m.userId !== leadId;
      if (leadName && m.expertName) return m.expertName.trim() !== leadName;
      return true;
    });

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-primary">{curT.title}</h3>
          <p className="text-gray-500">
            {curT.appId}: #{applicationLabel}
          </p>
        </div>
        <div
          className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${currentTone.badge}`}
        >
          <Clock className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">
            {
              curT.status[
                currentStatus === "Approved"
                  ? "approved"
                  : currentStatus === "Rejected"
                    ? "rejected"
                    : currentStatus === "Correction Requested"
                      ? "correction"
                      : currentStatus === "Reviewing"
                        ? "reviewing"
                        : currentStatus === "Pending"
                          ? "pending"
                          : "other"
              ]
            }
          </span>
        </div>
      </div>

      {latestInspection ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
        >
          <div className="flex flex-col gap-4 border-b border-gray-100 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                {language === "am" ? "የተመደበ ምርመራ" : "Assigned Inspection"}
              </p>
              <h4 className="mt-2 text-xl font-bold text-primary">
                {formatInspectionLabel(latestInspection)}
              </h4>
              <p className="mt-1 text-sm text-gray-500">
                {formatDate(latestInspection.scheduledDate, language)}
              </p>
            </div>
            <span
              className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${inspectionTone.badge}`}
            >
              {inspectionStatus}
            </span>
          </div>

          <div className="grid gap-4 p-6 md:grid-cols-2">
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                {language === "am" ? "ቀጠሮ ቀን" : "Scheduled Date"}
              </p>
              <p className="mt-2 text-sm font-semibold text-gray-800">
                {formatDate(latestInspection.scheduledDate, language)}
              </p>
              {inspectionCountdown ? (
                <p
                  className={`mt-1 text-xs font-bold ${inspectionCountdown.tone}`}
                >
                  {inspectionCountdown.label}
                </p>
              ) : null}
            </div>
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                {language === "am" ? "ዋና ባለሞያ" : "Lead Inspector"}
              </p>
              <p className="mt-2 text-sm font-semibold text-gray-800">
                {latestInspection.leadInspector?.fullName?.trim() ||
                  latestInspection.leadInspector?.username?.trim() ||
                  (language === "am" ? "አልተመደበም" : "Unassigned")}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-100 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  {language === "am" ? "ኮሚቴ አባላት" : "Assigned Committee"}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {committeeMembersExcludingLead?.length || 0}{" "}
                  {language === "am" ? "አባላት" : "members"}
                </p>
              </div>
            </div>

            {committeeMembersExcludingLead?.length ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {committeeMembersExcludingLead.map((member) => (
                  <div
                    key={member.id}
                    className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
                  >
                    <p className="font-semibold text-gray-800">
                      {member.expertName ||
                        (language === "am" ? "ኮሚቴ አባል" : "Committee Member")}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {member.expertRole ||
                        (language === "am" ? "ሚና አልተገለጸም" : "No role provided")}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                {language === "am"
                  ? "እስካሁን የተመደቡ ኮሚቴ አባላት የሉም።"
                  : "No committee members have been assigned yet."}
              </p>
            )}
          </div>
        </motion.div>
      ) : null}

      <div className="relative space-y-12">
        <div className="absolute top-0 left-8 w-1 h-full bg-gray-100 -z-10" />

        {loading ? (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start space-x-8"
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg bg-primary text-secondary animate-pulse">
              <Search className="w-8 h-8" />
            </div>

            <div className="flex-grow bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-xl font-bold text-primary">
                    {curT.loading}
                  </h4>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {curT.lastUpdated}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-400">
                  ...
                </span>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm">
                {curT.loading}
              </p>
            </div>
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start space-x-8"
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg bg-red-50 text-red-600 border border-red-100">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="flex-grow bg-white p-8 rounded-3xl shadow-sm border border-red-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-xl font-bold text-primary">{error}</h4>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {curT.appId}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700">
                  {curT.status.rejected}
                </span>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm">
                {curT.error}
              </p>
            </div>
          </motion.div>
        ) : showNoApplicationCard ? (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start space-x-8"
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg bg-primary text-secondary">
              <Shield className="w-8 h-8" />
            </div>

            <div className="flex-grow bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-xl font-bold text-primary">
                    {curT.noApplication}
                  </h4>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {curT.appId}
                  </p>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm">
                {curT.noApplicationHint}
              </p>
            </div>
          </motion.div>
        ) : showCurrentYearNotice ? (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start space-x-8"
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg bg-amber-50 text-amber-600 border border-amber-100">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="flex-grow bg-white p-8 rounded-3xl shadow-sm border border-amber-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-xl font-bold text-primary">
                    {curT.noCurrentYear}
                  </h4>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {currentYear}
                  </p>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm">
                {curT.noCurrentYearHint}
              </p>
            </div>
          </motion.div>
        ) : timelineEntries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start space-x-8"
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg bg-white text-gray-300 border-2 border-gray-100">
              <Shield className="w-8 h-8" />
            </div>

            <div className="flex-grow bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-xl font-bold text-primary">
                    {curT.empty}
                  </h4>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {curT.appId}
                  </p>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm">
                {curT.empty}
              </p>
            </div>
          </motion.div>
        ) : (
          timelineEntries.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              className="flex items-start space-x-8"
            >
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${step.statusTone.icon}`}
              >
                {getStatusIcon(step.status)}
              </div>

              <div
                className={`flex-grow bg-white p-8 rounded-3xl shadow-sm border transition-all ${step.statusTone.panel}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-primary">
                      {step.title}
                    </h4>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      {step.date}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${step.statusTone.pill}`}
                  >
                    {
                      curT.status[
                        step.status === "Approved"
                          ? "approved"
                          : step.status === "Rejected"
                            ? "rejected"
                            : step.status === "Correction Requested"
                              ? "correction"
                              : step.status === "Reviewing"
                                ? "reviewing"
                                : step.status === "Pending"
                                  ? "pending"
                                  : "other"
                      ]
                    }
                  </span>
                </div>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {step.desc}
                </p>
                {step.actor ? (
                  <p className="mt-4 text-xs font-medium text-gray-400 uppercase tracking-widest">
                    {curT.submittedBy}: {step.actor}
                  </p>
                ) : null}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
