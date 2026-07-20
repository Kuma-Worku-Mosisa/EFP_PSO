import { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { DashboardLayout } from "../components/DashboardLayout";
import {
  LayoutDashboard,
  FilePlus,
  RefreshCw,
  Search,
  Award,
  FileText,
  CheckCircle2,
  Clock,
  ShieldCheck,
  CreditCard,
  Building2,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { apiRequest } from "../lib/api";
import { NotFound } from "./NotFound";

import { NewApplication } from "./NewApplication";
import { LicenseViewer } from "./LicenseViewer";
import { StatusTracking } from "./StatusTracking";
import { Renewal } from "./Renewal";
import { FormalLetter } from "./FormalLetter";
import { Agreement } from "./Agreement";
import { AgencyPayment } from "./AgencyPayment";
import { Profile } from "./Profile";

const Overview = () => {
  const { language } = useLanguage();
  const [summary, setSummary] = useState<{
    licenseStatus: string;
    expiryDate: string | null;
    organizationStatus: string;
    organizationName: string;
    pendingTasks: number;
    applicationProgress: number;
    activity: Array<{ title: string; status?: string; time: string }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const response = await apiRequest<{ data: any }>("/dashboard/agency");
        setSummary(response.data);
      } catch (err: any) {
        setError(
          err?.message ||
            "Failed to load dashboard summary. Please refresh the page.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  const stats = [
    {
      label: language === "am" ? "የፈቃድ ሁኔታ" : "License Status",
      value:
        summary?.licenseStatus ?? (language === "am" ? "በጥንቃቄ" : "Pending"),
      icon: <Award className="text-green-500" />,
      color: "bg-green-50",
    },
    {
      label: language === "am" ? "የማብቂያ ቀን" : "Expiry Date",
      value: summary?.expiryDate
        ? new Date(summary.expiryDate).toLocaleDateString("en-GB")
        : language === "am"
          ? "አልተወሰነም"
          : "---",
      icon: <Clock className="text-blue-500" />,
      color: "bg-blue-50",
    },
    {
      label: language === "am" ? "ድርጅት ሁኔታ" : "Organization Status",
      value:
        summary?.organizationStatus ?? (language === "am" ? "አልተወሰነም" : "N/A"),
      icon: <Building2 className="text-indigo-500" />,
      color: "bg-indigo-50",
    },
    {
      label: language === "am" ? "የማመልከቻ ሂደት" : "Application Progress",
      value:
        typeof summary?.applicationProgress === "number"
          ? `${summary.applicationProgress}%`
          : "—",
      icon: <CheckCircle2 className="text-purple-500" />,
      color: "bg-purple-50",
    },
  ];

  const activityItems = summary?.activity ?? [];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4"
          >
            <div className={`p-4 rounded-xl ${stat.color}`}>{stat.icon}</div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              {loading ? (
                <p className="text-xl font-bold text-primary">
                  {language === "am" ? "በታጣቂ" : "Loading..."}
                </p>
              ) : (
                <p className="text-xl font-bold text-primary">{stat.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-lg font-bold text-primary">
            {language === "am" ? "የቅርብ ጊዜ እንቅስቃሴ" : "Recent Activity"}
          </h3>

          {loading ? (
            <div className="py-12 text-center text-gray-500">
              {language === "am" ? "መጫን እየተከናወን..." : "Loading activity..."}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-red-700">
              {error}
            </div>
          ) : activityItems.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 text-gray-600">
              {language === "am"
                ? "ምንም እንቅስቃሴ አልተገኘም።"
                : "No recent activity found."}
            </div>
          ) : (
            <div className="space-y-6">
              {activityItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl"
                >
                  <div className="space-y-1">
                    <p className="font-bold text-primary text-sm">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.time).toLocaleString("en-GB")}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                    {item.status || (language === "am" ? "የላከ" : "Status")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-primary rounded-3xl p-8 text-white space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-2xl -mr-16 -mt-16" />
          <h3 className="text-lg font-bold">
            {language === "am" ? "ፈጣን እርምጃዎች" : "Quick Actions"}
          </h3>
          <div className="space-y-4">
            <Link
              to="letter"
              className="flex items-center justify-between p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all border border-white/10"
            >
              <span className="font-bold text-sm">
                {language === "am" ? "የይፋዊ ደብዳቤ አስገባ" : "Submit Formal Letter"}
              </span>
              <FileText className="w-5 h-5 text-secondary" />
            </Link>
            <Link
              to="new"
              className="flex items-center justify-between p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all border border-white/10"
            >
              <span className="font-bold text-sm">
                {language === "am" ? "ለአዲስ ፈቃድ ያመልክቱ" : "Apply for New License"}
              </span>
              <FilePlus className="w-5 h-5 text-secondary" />
            </Link>
            <Link
              to="agreement"
              className="flex items-center justify-between p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all border border-white/10"
            >
              <span className="font-bold text-sm">
                {language === "am" ? "ውል ይፈርሙ" : "Sign Agreement"}
              </span>
              <ShieldCheck className="w-5 h-5 text-secondary" />
            </Link>
            <Link
              to="payment"
              className="flex items-center justify-between p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all border border-white/10"
            >
              <span className="font-bold text-sm">
                {language === "am" ? "ክፍያ ይፈጽሙ" : "Make Payment"}
              </span>
              <CreditCard className="w-5 h-5 text-secondary" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AgencyDashboard = () => {
  const { t } = useLanguage();

  const sidebarItems = [
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: t.dashboard.overview,
      path: "/dashboard",
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: t.dashboard.formalLetter,
      path: "/dashboard/letter",
    },
    {
      icon: <FilePlus className="w-5 h-5" />,
      label: t.dashboard.newApplication,
      path: "/dashboard/new",
    },
    {
      icon: <RefreshCw className="w-5 h-5" />,
      label: t.dashboard.renewal,
      path: "/dashboard/renewal",
    },
    {
      icon: <Search className="w-5 h-5" />,
      label: t.dashboard.trackStatus,
      path: "/dashboard/track",
    },
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      label: t.dashboard.agreement,
      path: "/dashboard/agreement",
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      label: t.dashboard.payment,
      path: "/dashboard/payment",
    },
    {
      icon: <Award className="w-5 h-5" />,
      label: t.dashboard.license,
      path: "/dashboard/license",
    },
  ];

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      title={t.dashboard.agencyDashboard}
    >
      <Routes>
        <Route index element={<Overview />} />
        <Route path="letter" element={<FormalLetter />} />
        <Route path="new" element={<NewApplication />} />
        <Route path="renewal" element={<Renewal />} />
        <Route path="track" element={<StatusTracking />} />
        <Route path="agreement" element={<Agreement />} />
        <Route path="payment" element={<AgencyPayment />} />
        <Route path="license/:certificateId?" element={<LicenseViewer />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </DashboardLayout>
  );
};
