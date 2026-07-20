import React, { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  ShieldCheck,
  FileText,
  ClipboardCheck,
  User,
  ArrowRight,
} from "lucide-react";
import { DashboardLayout } from "../components/DashboardLayout";
import { useLanguage } from "../context/LanguageContext";
import { apiRequest } from "../lib/api";
import { NotFound } from "./NotFound";
import { LicenseManagement } from "./LicenseManagement";
import { LicenseStampQueue } from "./LicenseStampQueue";
import { LicenseViewer } from "./LicenseViewer";
import { Profile } from "./Profile";

const Overview = () => {
  const { language } = useLanguage();
  const [certifications, setCertifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchCertifications = async () => {
      try {
        const response = await apiRequest("/certifications");
        const data = response?.data ?? response;
        if (active) {
          if (Array.isArray(data)) {
            setCertifications(data);
          } else {
            setError("Unexpected response from certification service.");
          }
        }
      } catch (err) {
        if (active) {
          setError(
            language === "am"
              ? "የማረጋገጫ ዝርዝር ለማየት እባክዎን ድጋፍ ያስገኙ።"
              : "Unable to load certification list.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchCertifications();
    return () => {
      active = false;
    };
  }, [language]);

  const total = certifications.length;
  const signedCount = certifications.filter(
    (cert) => cert?.signedByOfficial,
  ).length;
  const pendingCount = total - signedCount;

  const cardItems = [
    {
      label: language === "am" ? "ጠቃሚ ማስታወቂያ" : "Total Certificates",
      value: total,
      icon: <ShieldCheck className="w-5 h-5" />,
      bg: "bg-sky-50",
    },
    {
      label: language === "am" ? "የተፈረመ ማረጋገጫ" : "Signed Certificates",
      value: signedCount,
      icon: <FileText className="w-5 h-5" />,
      bg: "bg-emerald-50",
    },
    {
      label: language === "am" ? "ማስፈረሚ ቀርቦ ያለው" : "Pending Stamp",
      value: pendingCount,
      icon: <ClipboardCheck className="w-5 h-5" />,
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-r from-[#0f4f8b] via-[#11528a] to-[#0c2f4f] p-8 text-white shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#d4e8ff]">
              {language === "am"
                ? "የፈቃድ የማረጋገጫ ቦርድ"
                : "Licensing Authority Dashboard"}
            </p>
            <h1 className="mt-3 text-3xl font-black">
              {language === "am" ? "እንኳን ደህና መጡ" : "Welcome Back"}
            </h1>
            <p className="mt-2 text-sm text-[#d4e8ff] max-w-2xl">
              {language === "am"
                ? "የማረጋገጫ ማስፈረሚን እና ቅርጸ ተግባር እየተከታተሉ ይቆዩ።"
                : "Manage certificate stamping, review official signatures, and monitor licensing status."}
            </p>
          </div>
          <div className="rounded-3xl bg-white/10 border border-white/20 px-5 py-4 text-sm font-semibold">
            {language === "am" ? "ጥሪ" : "Official Workflow"}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {cardItems.map((card) => (
          <div
            key={card.label}
            className={`rounded-3xl border ${card.bg} border-gray-200 p-6 shadow-sm`}
          >
            <div className="flex items-center justify-between">
              <div className="rounded-2xl bg-white p-3 text-primary">
                {card.icon}
              </div>
              <p className="text-xs font-semibold uppercase text-gray-500">
                {card.label}
              </p>
            </div>
            <p className="mt-6 text-4xl font-black text-slate-900">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: language === "am" ? "የማስፈረሚ ማረጋገጫ" : "Sign & Stamp",
            description:
              language === "am"
                ? "የፈቃድ ማረጋገጫ ላይ በማስፈረም ይገባሉ።"
                : "Open the stamping interface for pending certifications.",
            path: "/licensing-authority/license",
          },
          {
            title:
              language === "am" ? "የማረጋገጫ አስተዳደር" : "Certification Registry",
            description:
              language === "am"
                ? "የማረጋገጫ ዝርዝር ማየት እና አስተዳደር።"
                : "Browse certificates and check sign status.",
            path: "/licensing-authority/licenses",
          },
          {
            title: language === "am" ? "መገለጫ" : "My Profile",
            description:
              language === "am"
                ? "የግል መረጃዎን እና ስምርዝ ይቆጥቡ።"
                : "Review your account and official signing details.",
            path: "/licensing-authority/profile",
          },
        ].map((card) => (
          <Link
            key={card.path}
            to={card.path}
            className="block rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500">{card.description}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-primary" />
            </div>
          </Link>
        ))}
      </div>

      {error && (
        <div className="rounded-3xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
          {language === "am"
            ? "እባክዎን ቢቀጥሉ..."
            : "Loading certification data..."}
        </div>
      )}
    </div>
  );
};

export const LicensingAuthorityDashboard = () => {
  const { language } = useLanguage();

  const sidebarItems = [
    { label: language === "am" ? "ማዕከላዊ" : "Main", isHeader: true },
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: language === "am" ? "መግቢያ" : "Overview",
      path: "/licensing-authority",
    },
    {
      icon: <ClipboardCheck className="w-5 h-5" />,
      label: language === "am" ? "የማስፈረሚ ማረጋገጫ" : "Sign & Stamp",
      path: "/licensing-authority/license",
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: language === "am" ? "የማረጋገጫ እና ማስተዳደር" : "Certification Registry",
      path: "/licensing-authority/licenses",
    },
    {
      icon: <User className="w-5 h-5" />,
      label: language === "am" ? "መገለጫ" : "Profile",
      path: "/licensing-authority/profile",
    },
  ];

  return (
    <DashboardLayout
      title={language === "am" ? "የፈቃድ ሥራ መስክ" : "Licensing Authority"}
      sidebarItems={sidebarItems}
    >
      <Routes>
        <Route index element={<Overview />} />
        <Route path="licenses" element={<LicenseManagement />} />
        <Route path="licenses/:certificateId" element={<LicenseViewer />} />
        <Route path="license" element={<LicenseStampQueue />} />
        <Route path="license/:certificateId" element={<LicenseViewer />} />
        <Route path="profile" element={<Profile />} />
      </Routes>
    </DashboardLayout>
  );
};
