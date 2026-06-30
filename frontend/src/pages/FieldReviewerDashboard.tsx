// filepath: frontend/src/pages/FieldReviewerDashboard.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  ClipboardCheck,
  FileText,
  Clock,
  CheckCircle2,
  Star,
  TrendingUp,
  Eye,
  ArrowRight,
  Calendar,
  Building2,
  ShieldCheck,
  Activity,
} from "lucide-react";

import { DashboardLayout } from "../components/DashboardLayout";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";
import { Profile } from "./Profile";
import { InspectionReviewForm } from "./fieldReviewer/InspectionReviewForm";

type InspectionRow = {
  id: number;
  scheduledDate?: string;
  status?: string | null;
  findingsSummary?: string | null;
  expertOpinion?: string | null;
  committeeMembers?: Array<{
    id: number;
    userId?: number;
    signatureUrl?: string | null;
    signedAt?: string | null;
  }>;
  application?: {
    id: number;
    status?: string | null;
    applicationDate?: string;
    organization?: {
      nameEnglish?: string | null;
      nameAmharic?: string | null;
    } | null;
  } | null;
};

type DashboardSummary = {
  assignedTasks: number;
  pendingReview: number;
  inReview: number;
  completed: number;
  committeeAssignments: number;
  pendingCommitteeSignatures: number;
};

const DEFAULT_SUMMARY: DashboardSummary = {
  assignedTasks: 0,
  pendingReview: 0,
  inReview: 0,
  completed: 0,
  committeeAssignments: 0,
  pendingCommitteeSignatures: 0,
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
};

const getStatusColor = (status?: string | null) => {
  const s = String(status || "").toLowerCase();
  if (s.includes("approv") || s.includes("field_reviewed"))
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (s.includes("reject")) return "bg-red-100 text-red-700 border-red-200";
  if (s.includes("review")) return "bg-blue-100 text-blue-700 border-blue-200";
  if (s.includes("sched"))
    return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-gray-100 text-gray-600 border-gray-200";
};

const translateStatus = (status?: string | null, isAm = false) => {
  const s = String(status || "").toLowerCase();
  if (!isAm) return status || "Scheduled";
  if (s.includes("approv")) return "ጸድቋል";
  if (s.includes("reject")) return "ውድቅ ሆኗል";
  if (s.includes("field_reviewed")) return "ፊልድ ግምገማ ተጠናቋል";
  if (s.includes("review")) return "በግምገማ ላይ";
  if (s.includes("sched")) return "ቀጠሮ ተይዟል";
  return status || "ቀጠሮ ተይዟል";
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({
  label,
  value,
  icon,
  accent,
  delay = 0,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent: "gold" | "blue" | "green" | "amber";
  delay?: number;
}) => {
  const accentMap = {
    gold: {
      bg: "from-[#FFD700]/20 to-[#C5A022]/10",
      icon: "bg-[#FFD700]/20 text-[#C5A022]",
      value: "text-[#C5A022]",
      border: "border-[#FFD700]/30",
    },
    blue: {
      bg: "from-[#003366]/10 to-[#001F3F]/5",
      icon: "bg-[#003366]/10 text-[#003366]",
      value: "text-[#003366]",
      border: "border-[#003366]/20",
    },
    green: {
      bg: "from-emerald-50 to-green-50",
      icon: "bg-emerald-100 text-emerald-600",
      value: "text-emerald-700",
      border: "border-emerald-200",
    },
    amber: {
      bg: "from-amber-50 to-yellow-50",
      icon: "bg-amber-100 text-amber-600",
      value: "text-amber-700",
      border: "border-amber-200",
    },
  };
  const c = accentMap[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className={`relative overflow-hidden bg-gradient-to-br ${c.bg} border ${c.border} rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300`}
    >
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl ${c.icon}`}>{icon}</div>
        <TrendingUp className="w-4 h-4 text-gray-300" />
      </div>
      <div className="mt-4">
        <p className={`text-3xl font-black ${c.value}`}>{value}</p>
        <p className="mt-1 text-sm font-medium text-gray-500">{label}</p>
      </div>
      {/* decorative circle */}
      <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-white/20" />
    </motion.div>
  );
};

// ─── Overview ─────────────────────────────────────────────────────────────────
const Overview = ({
  inspections,
  isAm,
  summary,
}: {
  inspections: InspectionRow[];
  isAm: boolean;
  summary: DashboardSummary;
}) => {
  const stats = [
    {
      label: isAm ? "የተመደቡ ተግባራት" : "Assigned Tasks",
      value: summary.assignedTasks,
      icon: <ClipboardCheck className="w-5 h-5" />,
      accent: "blue" as const,
    },
    {
      label: isAm ? "በመጠባበቅ ላይ" : "Pending Review",
      value: summary.pendingReview,
      icon: <Clock className="w-5 h-5" />,
      accent: "amber" as const,
    },
    {
      label: isAm ? "በግምገማ ላይ" : "In Review",
      value: summary.inReview,
      icon: <Activity className="w-5 h-5" />,
      accent: "gold" as const,
    },
    {
      label: isAm ? "የተጠናቀቁ" : "Completed",
      value: summary.completed,
      icon: <CheckCircle2 className="w-5 h-5" />,
      accent: "green" as const,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome banner — top */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#003366] via-[#004080] to-[#001F3F] p-6 md:p-8 text-white shadow-lg"
      >
        {/* gold accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD700] via-[#C5A022] to-[#FFD700]" />
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-[#FFD700]/5" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/5" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-[#FFD700]" />
              <span className="text-[#FFD700] text-xs font-bold uppercase tracking-widest">
                {isAm ? "ፊልድ ሪቪዩ ዳሽቦርድ" : "Field Review Dashboard"}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black">
              {isAm ? "እንኳን ደህና መጡ" : "Welcome Back"}
            </h2>
            <p className="mt-1 text-white/70 text-sm">
              {isAm
                ? "የተመደቡ ምርመራዎችዎን ይከታተሉ እና ሪፖርቶችን ያስገቡ።"
                : "Track your assigned inspections and submit field findings."}
            </p>
          </div>
          <Link
            to="/field-reviewer/inspections"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#FFD700] text-[#003366] font-bold text-sm hover:bg-[#C5A022] transition-colors shadow-md whitespace-nowrap self-start sm:self-auto"
          >
            {isAm ? "ምርመራዎችን ይመልከቱ" : "View Inspections"}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} delay={i * 0.08} />
        ))}
      </div>

      {/* Recent inspections */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5 }}
        className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#003366]">
              {isAm ? "የቅርብ ጊዜ ምርመራዎች" : "Recent Inspections"}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {isAm
                ? "የቅርብ ጊዜ የምርመራ ዝርዝሮች"
                : "Latest assigned inspection records"}
            </p>
          </div>
          <div className="p-2 rounded-xl bg-[#003366]/5">
            <ClipboardCheck className="w-5 h-5 text-[#003366]" />
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {inspections.slice(0, 5).map((inspection, idx) => (
            <motion.div
              key={inspection.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + idx * 0.06 }}
              className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50/60 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#003366]/8 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-4 h-4 text-[#003366]" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-[#003366] truncate">
                    {inspection.application?.organization?.nameEnglish ||
                      inspection.application?.organization?.nameAmharic ||
                      `${isAm ? "ምርመራ" : "Inspection"} #${inspection.id}`}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    {formatDate(inspection.scheduledDate)}
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border flex-shrink-0 ${getStatusColor(inspection.status)}`}
              >
                {translateStatus(inspection.status, isAm)}
              </span>
            </motion.div>
          ))}
          {inspections.length === 0 && (
            <div className="px-6 py-12 text-center">
              <ClipboardCheck className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">
                {isAm ? "ምንም ምርመራ አልተመደበም።" : "No inspections assigned yet."}
              </p>
            </div>
          )}
        </div>

        {inspections.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/40">
            <Link
              to="/field-reviewer/inspections"
              className="text-sm font-bold text-[#003366] hover:text-[#C5A022] transition-colors flex items-center gap-1"
            >
              {isAm ? "ሁሉንም ምርመራዎች ይመልከቱ" : "View all inspections"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// ─── Inspection List ──────────────────────────────────────────────────────────
const InspectionList = ({
  inspections,
  currentUserId,
  isAm,
}: {
  inspections: InspectionRow[];
  currentUserId: number;
  isAm: boolean;
}) => (
  <div className="space-y-4">
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between"
    >
      <div>
        <h2 className="text-xl font-black text-[#003366]">
          {isAm ? "የምርመራ ዝርዝር" : "Inspection List"}
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {isAm
            ? `${inspections.length} ምርመራዎች ተመድበዋል`
            : `${inspections.length} inspection${inspections.length !== 1 ? "s" : ""} assigned`}
        </p>
      </div>
      <div className="px-3 py-1.5 rounded-xl bg-[#FFD700]/15 border border-[#FFD700]/30">
        <span className="text-sm font-bold text-[#C5A022]">
          {inspections.length}
        </span>
      </div>
    </motion.div>

    <AnimatePresence>
      {inspections.map((inspection, idx) => {
        const needsSignature =
          Number.isFinite(currentUserId) &&
          inspection.committeeMembers?.some(
            (m) => Number(m.userId) === currentUserId && !m.signatureUrl,
          );

        return (
          <motion.div
            key={inspection.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ delay: idx * 0.06, duration: 0.35 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-[#FFD700]/40 transition-all duration-300"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              {/* Left info */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#003366]/10 to-[#003366]/5 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-[#003366]" />
                </div>
                <div>
                  <h4 className="text-base font-black text-[#003366]">
                    {inspection.application?.organization?.nameEnglish ||
                      inspection.application?.organization?.nameAmharic ||
                      `${isAm ? "ምርመራ" : "Inspection"} #${inspection.id}`}
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {isAm ? "ቀጠሮ:" : "Scheduled:"}{" "}
                      {formatDate(inspection.scheduledDate)}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {isAm ? "ማመልከቻ ሁኔታ:" : "App status:"}{" "}
                      {inspection.application?.status || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right badges + action */}
              <div className="flex flex-wrap items-center gap-2 sm:flex-shrink-0">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(inspection.status)}`}
                >
                  {translateStatus(inspection.status, isAm)}
                </span>
                {needsSignature && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    {isAm ? "ፊርማ ያስፈልጋል" : "Signature pending"}
                  </span>
                )}
                <Link
                  to={`/field-reviewer/inspections/${inspection.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#003366] text-white font-bold text-sm hover:bg-[#004080] active:scale-95 transition-all duration-200 shadow-sm"
                >
                  <Eye className="w-4 h-4" />
                  {isAm ? "ይከፍቱ" : "Open Review"}
                </Link>
              </div>
            </div>
          </motion.div>
        );
      })}
    </AnimatePresence>

    {inspections.length === 0 && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
          <ClipboardCheck className="w-8 h-8 text-gray-300" />
        </div>
        <p className="text-gray-500 font-medium">
          {isAm
            ? "ለእርስዎ ምንም ምርመራ አልተመደበም።"
            : "No inspection records found for your account."}
        </p>
      </motion.div>
    )}
  </div>
);

// ─── Reports ──────────────────────────────────────────────────────────────────
const Reports = ({
  inspections,
  user,
  isAm,
  summary,
}: {
  inspections: InspectionRow[];
  user: any;
  isAm: boolean;
  summary: DashboardSummary;
}) => {
  const completed = inspections.filter((i) =>
    ["field_reviewed", "approved", "rejected"].includes(
      String(i.status || "").toLowerCase(),
    ),
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#003366] to-[#001F3F] rounded-3xl p-6 md:p-8 text-white shadow-lg">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD700] via-[#C5A022] to-[#FFD700]" />
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-[#FFD700]/5" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-[#FFD700]" />
            <span className="text-[#FFD700] text-xs font-bold uppercase tracking-widest">
              {isAm ? "ሪፖርቶች" : "Reports"}
            </span>
          </div>
          <h2 className="text-2xl font-black">
            {isAm ? "የግምገማ ሪፖርቶች" : "Review Reports"}
          </h2>
          <p className="mt-1 text-white/70 text-sm">
            {isAm
              ? "የቀረቡ ግኝቶች፣ አስተያየቶች እና የመጨረሻ ሪፖርቶች።"
              : "Submitted findings, comments, and final field notes."}
          </p>
        </div>
      </div>

      {/* Reviewer info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
            {isAm ? "ሪቪዩ አድራጊ" : "Reviewer"}
          </p>
          <p className="text-lg font-black text-[#003366]">
            {user?.fullName || (isAm ? "ፊልድ ሪቪዩ አድራጊ" : "Field Reviewer")}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
            {isAm ? "የተጠቃሚ ስም" : "Account"}
          </p>
          <p className="text-lg font-black text-[#003366]">
            {user?.username || "-"}
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: isAm ? "ጠቅላላ ምርመራዎች" : "Total Inspections",
            value: summary.assignedTasks,
            color: "text-[#003366]",
            bg: "bg-[#003366]/5",
          },
          {
            label: isAm ? "የተጠናቀቁ" : "Completed",
            value: summary.completed,
            color: "text-emerald-700",
            bg: "bg-emerald-50",
          },
          {
            label: isAm ? "በመጠባበቅ ላይ" : "Pending",
            value: summary.pendingReview,
            color: "text-amber-700",
            bg: "bg-amber-50",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`${s.bg} rounded-2xl p-5 border border-gray-100`}
          >
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Completed inspections list */}
      {completed.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h3 className="font-bold text-[#003366]">
              {isAm ? "የተጠናቀቁ ምርመራዎች" : "Completed Inspections"}
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            {completed.map((inspection) => (
              <div
                key={inspection.id}
                className="px-6 py-4 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-bold text-[#003366] text-sm">
                    {inspection.application?.organization?.nameEnglish ||
                      inspection.application?.organization?.nameAmharic ||
                      `#${inspection.id}`}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDate(inspection.scheduledDate)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(inspection.status)}`}
                  >
                    {translateStatus(inspection.status, isAm)}
                  </span>
                  <Link
                    to={`/field-reviewer/inspections/${inspection.id}`}
                    className="p-2 rounded-xl bg-[#003366]/5 hover:bg-[#003366]/10 text-[#003366] transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// ─── Loading skeleton ─────────────────────────────────────────────────────────
const LoadingSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-28 bg-gray-100 rounded-2xl" />
      ))}
    </div>
    <div className="h-40 bg-gray-100 rounded-3xl" />
    <div className="h-64 bg-gray-100 rounded-3xl" />
  </div>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export const FieldReviewerDashboard: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const isAm = language === "am";
  const [inspections, setInspections] = useState<InspectionRow[]>([]);
  const [summary, setSummary] = useState<DashboardSummary>(DEFAULT_SUMMARY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [inspectionsResponse, summaryResponse] = await Promise.all([
          apiRequest("/inspections"),
          apiRequest("/inspections/summary"),
        ]);
        const inspectionsData =
          (inspectionsResponse as any)?.data ?? inspectionsResponse;
        const summaryData = (summaryResponse as any)?.data ?? summaryResponse;

        if (!active) return;

        setInspections(Array.isArray(inspectionsData) ? inspectionsData : []);
        setSummary({
          assignedTasks: Number(
            summaryData?.assignedTasks ??
              summaryData?.totalAssigned ??
              (Array.isArray(inspectionsData) ? inspectionsData.length : 0),
          ),
          pendingReview: Number(summaryData?.pendingReview ?? 0),
          inReview: Number(summaryData?.inReview ?? 0),
          completed: Number(summaryData?.completed ?? 0),
          committeeAssignments: Number(summaryData?.committeeAssignments ?? 0),
          pendingCommitteeSignatures: Number(
            summaryData?.pendingCommitteeSignatures ?? 0,
          ),
        });
      } catch (error) {
        if (!active) return;
        console.error("Failed to load field reviewer inspections", error);
        setInspections([]);
        setSummary(DEFAULT_SUMMARY);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const sidebarItems = useMemo(
    () => [
      {
        icon: <LayoutDashboard className="w-5 h-5" />,
        label: isAm ? "አጠቃላይ እይታ" : "Overview",
        path: "/field-reviewer",
      },
      {
        icon: <ClipboardCheck className="w-5 h-5" />,
        label: isAm ? "ምርመራዎች" : "Inspections",
        path: "/field-reviewer/inspections",
      },
      {
        icon: <FileText className="w-5 h-5" />,
        label: isAm ? "ሪፖርቶች" : "Reports",
        path: "/field-reviewer/reports",
      },
    ],
    [isAm],
  );

  const title = isAm ? "ፊልድ ሪቪዩ ዳሽቦርድ" : "Field Reviewer Dashboard";
  const currentUserId = Number(user?.id ?? NaN);

  return (
    <DashboardLayout sidebarItems={sidebarItems} title={title}>
      <Routes>
        <Route
          index
          element={
            loading ? (
              <LoadingSkeleton />
            ) : (
              <Overview
                inspections={inspections}
                isAm={isAm}
                summary={summary}
              />
            )
          }
        />
        <Route
          path="inspections"
          element={
            loading ? (
              <LoadingSkeleton />
            ) : (
              <InspectionList
                inspections={inspections}
                currentUserId={currentUserId}
                isAm={isAm}
              />
            )
          }
        />
        <Route path="inspections/:id" element={<InspectionReviewForm />} />
        <Route
          path="reports"
          element={
            loading ? (
              <LoadingSkeleton />
            ) : (
              <Reports
                inspections={inspections}
                user={user}
                isAm={isAm}
                summary={summary}
              />
            )
          }
        />
        <Route path="profile" element={<Profile />} />
      </Routes>
    </DashboardLayout>
  );
};

export default FieldReviewerDashboard;
