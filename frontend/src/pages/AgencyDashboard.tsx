import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import { DashboardLayout } from "../components/DashboardLayout";
import {
  LayoutDashboard,
  FilePlus,
  RefreshCw,
  Search,
  Award,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

import { NewApplication } from "./NewApplication";
import { LicenseViewer } from "./LicenseViewer";
import { StatusTracking } from "./StatusTracking";
import { Renewal } from "./Renewal";
import { FormalLetter } from "./FormalLetter";
import { Agreement } from "./Agreement";
import { AgencyPayment } from "./AgencyPayment";
import { Profile } from "./Profile";
import { Notifications } from "./Notifications";

const Overview = () => {
  const { t, language } = useLanguage();
  const stats = [
    {
      label: language === "am" ? "የፈቃድ ሁኔታ" : "License Status",
      value: language === "am" ? "ንቁ" : "Active",
      icon: <Award className="text-green-500" />,
      color: "bg-green-50",
    },
    {
      label: language === "am" ? "የማብቂያ ቀን" : "Expiry Date",
      value: language === "am" ? "ጥቅምት 12, 2026" : "Oct 12, 2026",
      icon: <Clock className="text-blue-500" />,
      color: "bg-blue-50",
    },
    {
      label: language === "am" ? "የሚጠባበቁ ተግባራት" : "Pending Tasks",
      value: "2",
      icon: <AlertCircle className="text-amber-500" />,
      color: "bg-amber-50",
    },
    {
      label: language === "am" ? "የማመልከቻ ሂደት" : "Application Progress",
      value: "75%",
      icon: <CheckCircle2 className="text-purple-500" />,
      color: "bg-purple-50",
    },
  ];

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
              <p className="text-xl font-bold text-primary">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-lg font-bold text-primary">
            {language === "am" ? "የቅርብ ጊዜ እንቅስቃሴ" : "Recent Activity"}
          </h3>
          <div className="space-y-6">
            {[
              {
                title:
                  language === "am"
                    ? "የይፋዊ ደብዳቤ ጸድቋል"
                    : "Formal Letter Approved",
                time: language === "am" ? "ከ2 ሰዓት በፊት" : "2 hours ago",
                status: language === "am" ? "ጸድቋል" : "Approved",
                icon: <CheckCircle2 className="text-green-500" />,
              },
              {
                title:
                  language === "am"
                    ? "አዲስ ማመልከቻ ገብቷል"
                    : "New Application Submitted",
                time: language === "am" ? "ትላንትና" : "Yesterday",
                status: language === "am" ? "በግምገማ ላይ" : "Under Review",
                icon: <Clock className="text-amber-500" />,
              },
              {
                title:
                  language === "am"
                    ? "ዓመታዊ የእድሳት ማሳሰቢያ"
                    : "Annual Renewal Reminder",
                time: language === "am" ? "ከ3 ቀናት በፊት" : "3 days ago",
                status: language === "am" ? "በመጠባበቅ ላይ" : "Pending",
                icon: <Clock className="text-amber-500" />,
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-bold text-primary text-sm">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500">{item.time}</p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    item.status === (language === "am" ? "ጸድቋል" : "Approved")
                      ? "bg-green-100 text-green-700"
                      : item.status ===
                          (language === "am" ? "በግምገማ ላይ" : "Under Review")
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
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
        <Route path="notifications" element={<Notifications />} />
      </Routes>
    </DashboardLayout>
  );
};
