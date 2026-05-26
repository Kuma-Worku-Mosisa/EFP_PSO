// filepath: frontend/src/pages/FieldReviewerDashboard.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  ClipboardCheck,
  FileText,
  AlertTriangle,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
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

const Overview = ({ inspections }: { inspections: InspectionRow[] }) => {
  const pending = inspections.filter((item) =>
    String(item.status || "")
      .toLowerCase()
      .includes("sched"),
  ).length;
  const reviewed = inspections.filter((item) =>
    String(item.status || "")
      .toLowerCase()
      .includes("review"),
  ).length;
  const completed = inspections.filter((item) =>
    ["field_reviewed", "approved", "rejected"].includes(
      String(item.status || "").toLowerCase(),
    ),
  ).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-2xl shadow-sm border">
          <h4 className="text-sm font-bold text-gray-500">Assigned Tasks</h4>
          <p className="mt-2 text-3xl font-black text-primary">
            {inspections.length}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Inspections currently visible to you
          </p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-sm border">
          <h4 className="text-sm font-bold text-gray-500">Pending Review</h4>
          <p className="mt-2 text-3xl font-black text-amber-600">{pending}</p>
          <p className="text-xs text-gray-400 mt-1">Waiting to be visited</p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-sm border">
          <h4 className="text-sm font-bold text-gray-500">Completed</h4>
          <p className="mt-2 text-3xl font-black text-green-600">
            {completed || reviewed}
          </p>
          <p className="text-xs text-gray-400 mt-1">Field findings submitted</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
        <div className="px-6 py-5 border-b flex items-center justify-between">
          <div>
            <h4 className="text-lg font-bold text-primary">
              Latest Inspections
            </h4>
            <p className="text-sm text-gray-500">
              Review assignments and leave findings comments.
            </p>
          </div>
          <ClipboardCheck className="w-6 h-6 text-primary" />
        </div>

        <div className="divide-y">
          {inspections.slice(0, 5).map((inspection) => (
            <div
              key={inspection.id}
              className="p-6 flex items-center justify-between gap-4"
            >
              <div>
                <p className="font-bold text-primary">
                  {inspection.application?.organization?.nameEnglish ||
                    inspection.application?.organization?.nameAmharic ||
                    `Application #${inspection.application?.id ?? inspection.id}`}
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                  <Clock className="w-4 h-4" />
                  {formatDate(inspection.scheduledDate)}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                {inspection.status || "Scheduled"}
              </span>
            </div>
          ))}
          {inspections.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No inspections have been assigned yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InspectionList = ({
  inspections,
  currentUserId,
}: {
  inspections: InspectionRow[];
  currentUserId: number;
}) => (
  <div className="space-y-4">
    {inspections.map((inspection) => (
      <div
        key={inspection.id}
        className="bg-white rounded-3xl shadow-sm border p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h4 className="text-lg font-bold text-primary">
            {inspection.application?.organization?.nameEnglish ||
              inspection.application?.organization?.nameAmharic ||
              `Inspection #${inspection.id}`}
          </h4>
          <p className="text-sm text-gray-500 mt-1">
            Scheduled: {formatDate(inspection.scheduledDate)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Application status: {inspection.application?.status || "-"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
            {inspection.status || "Scheduled"}
          </span>
          {Number.isFinite(currentUserId) &&
          inspection.committeeMembers?.some(
            (member) =>
              Number(member.userId) === currentUserId && !member.signatureUrl,
          ) ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700">
              Signature pending
            </span>
          ) : null}
          <Link
            to={`/field-reviewer/inspections/${inspection.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-bold"
          >
            Open Review
          </Link>
        </div>
      </div>
    ))}

    {inspections.length === 0 && (
      <div className="bg-white rounded-3xl shadow-sm border p-10 text-center text-gray-500">
        No inspection records were found for your account.
      </div>
    )}
  </div>
);

export const FieldReviewerDashboard: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [inspections, setInspections] = useState<InspectionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await apiRequest("/inspections");
        const data = (response as any)?.data ?? response;
        if (!active) return;
        setInspections(Array.isArray(data) ? data : []);
      } catch (error) {
        if (!active) return;
        console.error("Failed to load field reviewer inspections", error);
        setInspections([]);
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
        label: language === "am" ? "እይታ" : "Overview",
        path: "/field-reviewer",
      },
      {
        icon: <ClipboardCheck className="w-5 h-5" />,
        label: language === "am" ? "ምርመራዎች" : "Inspections",
        path: "/field-reviewer/inspections",
      },
      {
        icon: <FileText className="w-5 h-5" />,
        label: language === "am" ? "ሪፖርት" : "Reports",
        path: "/field-reviewer/reports",
      },
    ],
    [language],
  );

  const title =
    language === "am" ? "Field Reviewer Dashboard" : "Field Reviewer Dashboard";

  const currentUserId = Number(user?.id ?? NaN);

  return (
    <DashboardLayout sidebarItems={sidebarItems} title={title}>
      <Routes>
        <Route
          index
          element={
            loading ? (
              <div className="text-gray-500">Loading...</div>
            ) : (
              <Overview inspections={inspections} />
            )
          }
        />
        <Route
          path="inspections"
          element={
            loading ? (
              <div className="text-gray-500">Loading...</div>
            ) : (
              <InspectionList
                inspections={inspections}
                currentUserId={currentUserId}
              />
            )
          }
        />
        <Route path="inspections/:id" element={<InspectionReviewForm />} />
        <Route
          path="reports"
          element={
            <div className="bg-white rounded-3xl shadow-sm border p-8">
              <h4 className="text-xl font-bold text-primary">Review Reports</h4>
              <p className="mt-2 text-gray-500">
                Use this space for submitted findings, comments, and final field
                notes.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="p-4 rounded-2xl bg-gray-50 border">
                  <p className="text-sm font-bold text-gray-600">Reviewer</p>
                  <p className="text-lg font-black text-primary">
                    {user?.fullName || "Field Reviewer"}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 border">
                  <p className="text-sm font-bold text-gray-600">Account</p>
                  <p className="text-lg font-black text-primary">
                    {user?.username || "-"}
                  </p>
                </div>
              </div>
            </div>
          }
        />
        <Route path="profile" element={<Profile />} />
      </Routes>
    </DashboardLayout>
  );
};

export default FieldReviewerDashboard;
