// filepath: frontend/src/pages/systemAdmin/SystemAdminDashboard.tsx
import { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { DashboardLayout } from "../../components/DashboardLayout";
import {
  LayoutDashboard,
  Star,
  FileCheck,
  MapPin,
  Users,
  Newspaper,
  BookOpen,
  Briefcase,
  Database,
  Shield,
  Building2,
  Activity,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  FileText,
  Globe,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import AuditLogViewer from "./audit-logs";
import LocationManager from "./LocationManager";
import { ManageNews } from "../ManageNews";
import { ManageFAQ } from "../ManageFAQ";
import { BackupRecovery } from "../BackupRecovery";
import { UserManagement } from "../UserManagement";
import EFPPositionManagement from "../admin/EFPPositionManagement";
import { useLanguage } from "../../context/LanguageContext";

const PIE_COLORS = ["#003366", "#C5A022", "#0055A4", "#3399FF", "#FFD700", "#99DDFF"];

const Overview: React.FC = () => {
  const { language } = useLanguage();
  const isAm = language === "am";
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const stats = [
    { icon: Building2, label: isAm ? "ድርጅቶች" : "Organizations", value: "156", change: "+12%", accent: "blue" },
    { icon: Users, label: isAm ? "ተጠቃሚዎች" : "Users", value: "1,284", change: "+8%", accent: "gold" },
    { icon: Shield, label: isAm ? "ንቁ ውሎች" : "Active Contracts", value: "342", change: "+5%", accent: "green" },
    { icon: Globe, label: isAm ? "ክልሎች" : "Regions", value: "12", change: "—", accent: "amber" },
  ];

  const accentMap: Record<string, { bg: string; iconBg: string; value: string }> = {
    blue: { bg: "bg-blue-50", iconBg: "bg-blue-100 text-[#003366]", value: "text-[#003366]" },
    gold: { bg: "bg-amber-50", iconBg: "bg-amber-100 text-[#C5A022]", value: "text-[#C5A022]" },
    green: { bg: "bg-emerald-50", iconBg: "bg-emerald-100 text-emerald-600", value: "text-emerald-700" },
    amber: { bg: "bg-orange-50", iconBg: "bg-orange-100 text-orange-600", value: "text-orange-700" },
  };

  const orgStatusData = [
    { name: isAm ? "ንቁ" : "Active", value: 98 },
    { name: isAm ? "ታግዶ" : "Suspended", value: 23 },
    { name: isAm ? "በመጠባበቅ ላይ" : "Pending", value: 35 },
  ];

  const monthlyData = [
    { month: isAm ? "ጥር" : "Jan", organizations: 8, users: 45 },
    { month: isAm ? "የካ" : "Feb", organizations: 12, users: 62 },
    { month: isAm ? "መጋ" : "Mar", organizations: 15, users: 78 },
    { month: isAm ? "ሚያ" : "Apr", organizations: 10, users: 55 },
    { month: isAm ? "ግን" : "May", organizations: 18, users: 90 },
    { month: isAm ? "ሰኔ" : "Jun", organizations: 14, users: 72 },
  ];

  const allActivities = [
    { icon: UserPlus, action: isAm ? "አዲስ ተጠቃሚ ተመዝግቧል" : "New user registered", user: "Abebe Kebede", time: isAm ? "2 ደቂቃ በፊት" : "2 min ago", status: "active" },
    { icon: Building2, action: isAm ? "ድርጅት ተዘምኗል" : "Organization updated", user: "ABC Security PLC", time: isAm ? "15 ደቂቃ በፊት" : "15 min ago", status: "active" },
    { icon: FileText, action: isAm ? "አዲስ ውል ተፈርሟል" : "New contract signed", user: "Ethio Guard Solutions", time: isAm ? "1 ሰዓት በፊት" : "1 hour ago", status: "active" },
    { icon: AlertTriangle, action: isAm ? "የውል ማስጠንቀቂያ" : "Contract expiry alert", user: "Tena Security", time: isAm ? "3 ሰዓት በፊት" : "3 hours ago", status: "inactive" },
    { icon: CheckCircle2, action: isAm ? "ማረጋገጫ ተሰጥቷል" : "Approval granted", user: "Addis Shield PLC", time: isAm ? "5 ሰዓት በፊት" : "5 hours ago", status: "active" },
  ];

  const filteredActivities = allActivities.filter((item) => {
    const matchesSearch =
      item.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.user.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || item.status === filterType;
    return matchesSearch && matchesFilter;
  });

  const badgeLabel: Record<string, string> = {
    active: isAm ? "ንቁ" : "Active",
    inactive: isAm ? "ተወስኗል" : "Inactive",
    suspended: isAm ? "ታግዶ" : "Suspended",
  };

  const badgeColor: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    inactive: "bg-gray-100 text-gray-600",
    suspended: "bg-red-100 text-red-700",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { staggerChildren: 0.08 } }}
      className="space-y-8">

      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#003366] via-[#004080] to-[#001F3F] p-6 md:p-8 text-white shadow-xl"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD700] via-[#C5A022] to-[#FFD700]" />
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#FFD700]/5" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-[#FFD700]/20 flex items-center justify-center shrink-0">
              <LayoutDashboard className="w-7 h-7 text-[#FFD700]" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#FFD700] font-bold">
                {isAm ? "ሲስተም አስተዳዳሪ" : "System Admin"}
              </p>
              <h1 className="mt-3 text-3xl font-black">
                {isAm ? "እንኳን ደህና መጡ" : "Welcome Back"}
              </h1>
              <p className="mt-2 text-sm text-white/70 max-w-2xl">
                {isAm ? "የስርዓት አጠቃላይ ሁኔታ ይቆጣጠሩ እና ይከልሱ" : "Monitor and review overall system status"}
              </p>
            </div>
          </div>
          <div className="rounded-3xl bg-white/10 border border-white/20 px-5 py-4 text-sm font-semibold backdrop-blur-sm whitespace-nowrap">
            <Star className="w-4 h-4 inline mr-2 text-[#FFD700]" />
            {isAm ? "የስርዓት መቆጣጠሪያ ማዕከል" : "System Control Center"}
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, i) => {
          const accent = accentMap[s.accent];
          return (
            <motion.div
              key={i}
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.08, type: "spring", stiffness: 120, damping: 14 }}
              whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,51,102,0.12)" }}
              className={`relative overflow-hidden rounded-3xl border border-gray-100 ${accent.bg} p-6 shadow-sm hover:shadow-xl transition-all duration-300`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{s.label}</p>
                  <p className={`mt-4 text-4xl font-black ${accent.value}`}>{s.value}</p>
                  <span className="inline-block mt-3 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{s.change}</span>
                </div>
                <div className={`w-11 h-11 rounded-xl ${accent.iconBg} flex items-center justify-center shadow-lg`}>
                  <s.icon className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 120, damping: 14 }}
          className="rounded-3xl bg-white border border-gray-100 p-6 shadow-sm hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#003366] to-[#001F3F] text-[#FFD700] flex items-center justify-center shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#003366]">{isAm ? "ወርሃዊ አዝማሚያ" : "Monthly Trends"}</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">{isAm ? "ድርጅቶች እና ተጠቃሚዎች" : "Organizations & Users"}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyData} barGap={4} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  fontSize: 12,
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, fontWeight: 600 }}
                iconType="circle"
                iconSize={8}
              />
              <Bar dataKey="organizations" name={isAm ? "ድርጅቶች" : "Organizations"} fill="#003366" radius={[4, 4, 0, 0]} />
              <Bar dataKey="users" name={isAm ? "ተጠቃሚዎች" : "Users"} fill="#C5A022" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 120, damping: 14 }}
          className="rounded-3xl bg-white border border-gray-100 p-6 shadow-sm hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#003366] to-[#001F3F] text-[#FFD700] flex items-center justify-center shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#003366]">{isAm ? "የድርጅት ሁኔታ" : "Organization Status"}</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">{isAm ? "አጠቃላይ ስርጭት" : "Overall distribution"}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={orgStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                animationBegin={300}
                animationDuration={1200}
                label={({ name, percent }) => `${name ?? "—"} ${((percent ?? 0) * 100).toFixed(0)}%`}
              >
                {orgStatusData.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index]} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2">
            {orgStatusData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[idx] }} />
                <span className="text-gray-600">{item.name}: <strong>{item.value}</strong></span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="relative overflow-hidden bg-gradient-to-r from-[#003366] to-[#001F3F] p-6">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD700] via-[#C5A022] to-[#FFD700]" />
          <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-[#FFD700]/5" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFD700]/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#FFD700]" />
              </div>
              <div>
                <h3 className="font-bold text-white">
                  {isAm ? "የቅርብ ጊዜ እንቅስቃሴ" : "Recent Activity"}
                </h3>
                <p className="text-[10px] text-white/50 font-medium">
                  {isAm ? "የስርዓት እንቅስቃሴ ታሪክ" : "System activity history"}
                </p>
              </div>
            </div>
            <Link
              to="/system-admin/audit-logs"
              className="text-[10px] uppercase tracking-wider font-bold text-[#FFD700] hover:text-white transition-colors flex items-center gap-1"
            >
              {isAm ? "ሁሉንም ይመልከቱ" : "View All"} <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
        <div className="p-5">
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAm ? "ፈልግ..." : "Search activities..."}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition-all"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { key: "all", label: isAm ? "ሁሉም" : "All" },
                { key: "active", label: isAm ? "ንቁ" : "Active" },
                { key: "inactive", label: isAm ? "ተወስኗል" : "Inactive" },
                { key: "suspended", label: isAm ? "ታግዶ" : "Suspended" },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilterType(f.key)}
                  className={`px-3.5 py-2 rounded-xl text-[11px] font-bold tracking-wide transition-all ${
                    filterType === f.key
                      ? "bg-[#003366] text-white shadow-md"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2.5">
            <AnimatePresence>
              {filteredActivities.length > 0 ? (
                filteredActivities.map((a, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="group flex items-start gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100 hover:border-[#FFD700]/30 hover:bg-gradient-to-r hover:from-[#FFD700]/5 hover:to-transparent transition-all duration-300"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#003366] to-[#001F3F] flex items-center justify-center shrink-0 mt-0.5">
                      <a.icon className="w-4 h-4 text-[#FFD700]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-gray-900">{a.action}</p>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${badgeColor[a.status]} tracking-wide uppercase`}>
                          {badgeLabel[a.status]}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{a.user}</p>
                    </div>
                    <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap shrink-0 mt-1 bg-gray-100 px-2 py-1 rounded-full group-hover:bg-[#FFD700]/10 group-hover:text-[#C5A022] transition-all">
                      {a.time}
                    </span>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Search className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-400 font-medium">
                    {isAm ? "ምንም የሚገኝ ነገር የለም" : "No activities found"}
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const SystemAdminDashboard: React.FC = () => {
  const { language } = useLanguage();
  const isAm = language === "am";

  const sidebarItems = [
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: isAm ? "እይታ" : "Overview",
      path: "/system-admin/dashboard",
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: isAm ? "የተጠቃሚዎች አስተዳደር" : "User Management",
      path: "/system-admin/users",
    },
    {
      icon: <FileCheck className="w-5 h-5" />,
      label: isAm ? "የስርዓት መዝገቦች" : "Audit Logs",
      path: "/system-admin/audit-logs",
    },
    {
      icon: <Briefcase className="w-5 h-5" />,
      label: isAm ? "የEFP ቦታ አስተዳደር" : "EFP Position Management",
      path: "/system-admin/efp-positions",
    },
    {
      icon: <Newspaper className="w-5 h-5" />,
      label: isAm ? "ዜና እና ማስታወቂያዎች" : "News & Announcements",
      path: "/system-admin/news",
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      label: isAm ? "FAQ አስተዳደር" : "FAQ Management",
      path: "/system-admin/faq-manage",
    },
    {
      icon: <Database className="w-5 h-5" />,
      label: isAm ? "መጠባበቂያ እና ማግኛ" : "Backup & Recovery",
      path: "/system-admin/backups",
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      label: isAm ? "አድራሻ አስተዳደር" : "Manage Address",
      path: "/system-admin/manage-address",
    },
  ];

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      title={isAm ? "የስርዓት አስተዳደር" : "System Admin"}
    >
      <Routes>
        <Route index element={<Overview />} />
        <Route path="dashboard" element={<Overview />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="audit-logs" element={<AuditLogViewer />} />
        <Route path="manage-address" element={<LocationManager />} />
        <Route path="efp-positions" element={<EFPPositionManagement />} />
        <Route path="news" element={<ManageNews />} />
        <Route path="faq-manage" element={<ManageFAQ />} />
        <Route path="backups" element={<BackupRecovery />} />
        <Route path="*" element={<Overview />} />
      </Routes>
    </DashboardLayout>
  );
};

export default SystemAdminDashboard;
