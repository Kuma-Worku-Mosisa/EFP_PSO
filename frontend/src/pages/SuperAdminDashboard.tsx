import React from "react";
import { Routes, Route } from "react-router-dom";
import { DashboardLayout } from "../components/DashboardLayout";
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  Globe,
  Settings,
  Database,
  Building2,
  FileCheck,
  Map,
  ShieldCheck,
  BarChart3,
  Clock,
  Terminal,
  Activity,
  History,
  Lock,
  ChevronRight,
  XCircle,
  Newspaper,
  Files,
  HelpCircle,
  MessageSquare,
} from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "../context/LanguageContext";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { AdminSettings } from "./AdminSettings";
import { AdminReports } from "./AdminReports";
import { Profile } from "./Profile";
import { ApplicationsReview } from "./ApplicationsReview";
import { LicenseManagement } from "./LicenseManagement";
import { LicenseViewer } from "./LicenseViewer";
import { GPSTracking } from "./GPSTracking";
import { HRMSReports } from "./HRMSReports";
import { BackupRecovery } from "./BackupRecovery";
import { PermissionsManagement } from "./PermissionsManagement";

import { ManageNews } from "./ManageNews";
import { ManagePublicContent } from "./ManagePublicContent";
import { ManageFAQ } from "./ManageFAQ";
import { Communications } from "./Communications";
import { Notifications } from "./Notifications";

const SuperOverview = () => {
  const { language } = useLanguage();
  const isAm = language === "am";

  const performanceData = [
    { name: "00:00", load: 12 },
    { name: "04:00", load: 8 },
    { name: "08:00", load: 45 },
    { name: "12:00", load: 78 },
    { name: "16:00", load: 62 },
    { name: "20:00", load: 35 },
  ];

  return (
    <div className="space-y-8">
      {/* Commission Overview Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-primary uppercase tracking-tight">
            {isAm ? "የኮሚሽኑ ዓለም አቀፍ አጠቃላይ እይታ" : "Commission Global Overview"}
          </h3>
          <span className="px-4 py-1 bg-secondary/10 text-primary text-[10px] font-black rounded-full border border-secondary/20 uppercase tracking-widest">
            {isAm ? "ከአስተዳዳሪ የመጣ" : "Pooled from Admin"}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              label: isAm ? "የተመዘገቡ ኤጀንሲዎች" : "Registered Agencies",
              value: "524",
              icon: <ShieldCheck className="w-5 h-5 text-primary" />,
              trend: "+2%",
            },
            {
              label: isAm ? "የደህንነት ሰራተኞች" : "Security Personnel",
              value: "25,482",
              icon: <Users className="w-5 h-5 text-amber-500" />,
              trend: "+8%",
            },
            {
              label: isAm ? "ንቁ ፈቃዶች" : "Active Licenses",
              value: "482",
              icon: <FileCheck className="w-5 h-5 text-green-500" />,
              trend: "+3%",
            },
            {
              label: isAm ? "የተሸፈኑ ክልሎች" : "Regions Covered",
              value: "11",
              icon: <Map className="w-5 h-5 text-purple-500" />,
              trend: "Stable",
            },
            {
              label: isAm ? "በመጠባበቅ ላይ ያሉ ማመልከቻዎች" : "Pending Applications",
              value: "142",
              icon: <Clock className="w-5 h-5 text-amber-500" />,
              trend: "+12%",
            },
            {
              label: isAm ? "ንቁ ያልሆኑ ፈቃዶች" : "Inactive Licenses",
              value: "38",
              icon: <ShieldAlert className="w-5 h-5 text-red-400" />,
              trend: "+1%",
            },
            {
              label: isAm ? "ውድቅ የተደረጉ ማመልከቻዎች" : "Rejected Applications",
              value: "24",
              icon: <XCircle className="w-5 h-5 text-red-500" />,
              trend: "-5%",
            },
            {
              label: isAm ? "አጠቃላይ የኮሚሽን ገቢ" : "Commission Revenue",
              value: "ETB 14.2M",
              icon: <BarChart3 className="w-5 h-5 text-primary" />,
              trend: "+22%",
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex flex-col justify-between h-32"
            >
              <div className="flex justify-between items-start">
                <div className="p-2 bg-gray-50 rounded-xl">{stat.icon}</div>
                <span
                  className={`text-[10px] font-black ${stat.trend.startsWith("+") ? "text-green-500" : "text-red-500"}`}
                >
                  {stat.trend}
                </span>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  {stat.label}
                </p>
                <p className="text-xl font-black text-primary">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="h-[2px] bg-gray-100/50 rounded-full w-full" />

      {/* System Health Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Overall System Status",
            value: "Operational",
            icon: <Globe className="w-5 h-5 text-green-500" />,
            status: "bg-green-500",
          },
          {
            label: "Active Connections",
            value: "1,294",
            icon: <Activity className="w-5 h-5 text-blue-500" />,
            status: "bg-blue-500",
          },
          {
            label: "Storage Capacity",
            value: "42%",
            icon: <Database className="w-5 h-5 text-amber-500" />,
            status: "bg-amber-500",
          },
          {
            label: "Security Alerts",
            value: "0",
            icon: <ShieldAlert className="w-5 h-5 text-green-500" />,
            status: "bg-green-500",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 relative overflow-hidden"
          >
            <div
              className={`absolute top-0 left-0 w-1 h-full ${stat.status}`}
            />
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                  {stat.label}
                </p>
                <p className="text-2xl font-black text-primary">{stat.value}</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* System Load Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black text-primary uppercase tracking-tight">
              Real-time System Load
            </h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-primary uppercase tracking-widest underline decoration-secondary decoration-2 underline-offset-4">
                LIVE UPDATES
              </span>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#003366" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#003366" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 900 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 900 }}
                />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="load"
                  stroke="#003366"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorLoad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Global Access Log */}
        <div className="bg-primary rounded-[40px] p-8 text-white space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="flex items-center space-x-3 mb-2">
            <Terminal className="w-6 h-6 text-secondary" />
            <h3 className="text-xl font-black uppercase tracking-tight">
              Security Protocol
            </h3>
          </div>
          <div className="space-y-4">
            {[
              { type: "LOGIN", user: "Admin_South", time: "12:42:01" },
              { type: "AUTH", user: "SA_Root", time: "12:40:55" },
              { type: "CONFIG", user: "Sys_Auto", time: "12:35:12" },
              { type: "RENEW", user: "Agency_42", time: "12:30:10" },
            ].map((log, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/5 font-mono text-[10px]"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-secondary font-black">
                    [{log.type}]
                  </span>
                  <span className="text-blue-100">{log.user}</span>
                </div>
                <span className="text-white/40">{log.time}</span>
              </div>
            ))}
          </div>
          <button className="w-full py-4 bg-white text-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center space-x-2">
            <span>Access Audit Logs</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const SuperAdminDashboard = () => {
  const { t, language } = useLanguage();
  const isAm = language === "am";

  const sidebarItems = [
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: "Global Overview",
      path: "/super-admin/dashboard",
    },

    // Admin Monitor Section
    { label: "Admin Monitoring", isHeader: true },
    {
      icon: <Building2 className="w-5 h-5" />,
      label: "Agencies (Admin)",
      path: "/super-admin/dashboard/admin-agencies",
    },
    {
      icon: <FileCheck className="w-5 h-5" />,
      label: "Applications (Admin)",
      path: "/super-admin/dashboard/admin-apps",
    },
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      label: "Licenses (Admin)",
      path: "/super-admin/dashboard/admin-licenses",
    },
    {
      icon: <Map className="w-5 h-5" />,
      label: "GPS Tracking (Admin)",
      path: "/super-admin/dashboard/admin-gps",
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      label: "HRMS Reports (Admin)",
      path: "/super-admin/dashboard/admin-hrms",
    },

    // System Section
    { label: "System Control", isHeader: true },
    {
      icon: <History className="w-5 h-5" />,
      label: "Global Audit",
      path: "/super-admin/dashboard/audit",
    },
    {
      icon: <Database className="w-5 h-5" />,
      label: "Backup & Recovery",
      path: "/super-admin/dashboard/backup",
    },
    {
      icon: <Lock className="w-5 h-5" />,
      label: "Permissions",
      path: "/super-admin/dashboard/permissions",
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: "System Settings",
      path: "/super-admin/dashboard/settings",
    },

    // Content Management (Mirrored from Admin)
    { label: "Content & Communication", isHeader: true },
    {
      icon: <Newspaper className="w-5 h-5" />,
      label: isAm ? "ዜና እና ማስታወቂያ" : "News & Announcements",
      path: "/super-admin/dashboard/news",
    },
    {
      icon: <Files className="w-5 h-5" />,
      label: isAm ? "የህዝብ ሰነዶች" : "Public Documents",
      path: "/super-admin/dashboard/content",
    },
    {
      icon: <HelpCircle className="w-5 h-5" />,
      label: isAm ? "FAQ አስተዳዳሪ" : "FAQ Management",
      path: "/super-admin/dashboard/faq-manage",
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      label: isAm ? "ኮሙኒኬሽን" : "Communications",
      path: "/super-admin/dashboard/communications",
    },
  ];

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      title={t.dashboard.superAdminDashboard}
    >
      <Routes>
        <Route index element={<SuperOverview />} />
        <Route path="audit" element={<AdminReports />} />
        <Route path="profile" element={<Profile />} />

        {/* Admin Mirrored Routes ... */}
        <Route path="admin-apps" element={<ApplicationsReview />} />
        <Route path="admin-licenses" element={<LicenseManagement />} />
        <Route
          path="admin-licenses/:certificateId?"
          element={<LicenseViewer />}
        />
        <Route path="admin-gps" element={<GPSTracking />} />
        <Route path="admin-hrms" element={<HRMSReports />} />
        <Route path="backup" element={<BackupRecovery />} />
        <Route path="news" element={<ManageNews />} />
        <Route path="content" element={<ManagePublicContent />} />
        <Route path="faq-manage" element={<ManageFAQ />} />
        <Route path="communications" element={<Communications />} />
        <Route path="permissions" element={<PermissionsManagement />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="notifications" element={<Notifications />} />

        <Route path="*" element={<SuperOverview />} />
      </Routes>
    </DashboardLayout>
  );
};
