import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  ShieldCheck,
  MapPin,
  UserCheck,
  GraduationCap,
  TrendingUp,
  Star,
  Search,
  Filter,
  Clock,
  UserPlus,
  FileUp,
  RefreshCw,
  Move,
  UserCog,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { DashboardLayout } from "../components/DashboardLayout";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";
import AgenciesManagement from "./admin/AgenciesManagement";
import EmployeeRegistration from "./HRmanagement/EmployeeRegistration";
import EmployeeTransferManager from "./HRmanagement/EmployeeTransferManager";
import AddressChangeRequestForm from "./HRmanagement/AddressChangeRequestForm";
import PersonnelChangeRequest from "./HRmanagement/PersonnelChangeRequest";
import { LoadingSpinner, SkeletonCard, SkeletonChart, SkeletonTable, SkeletonActivityList } from "../components/LoadingSpinner";
import { Profile } from "./Profile";
import { Notifications } from "./Notifications";

const COLORS = ["#003366", "#FFD700", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

const genderData = [
  { name: "Male", value: 78 },
  { name: "Female", value: 50 },
];

const eduData = [
  { level: "Grade 3-9", count: 12 },
  { level: "Grade 10-12", count: 34 },
  { level: "Certificate", count: 28 },
  { level: "Diploma", count: 30 },
  { level: "Degree", count: 20 },
  { level: "Second Degree", count: 4 },
];

const statusData = [
  { name: "Active", value: 98 },
  { name: "On Leave", value: 18 },
  { name: "Suspended", value: 8 },
  { name: "Pending", value: 4 },
];

const Overview = () => {
  const { language } = useLanguage();
  const isAm = language === "am";
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [dashboardLoading, setDashboardLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setDashboardLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const iconStyle = { iconBg: "bg-[#003366]", iconColor: "text-[#FFD700]", badge: "bg-[#FFD700]/15 text-[#C5A022]" };

  const badgeLabel: Record<string, string> = {
    registration: isAm ? "ምዝገባ" : "Registration",
    position: isAm ? "ሹመት" : "Position",
    document: isAm ? "ሰነድ" : "Document",
    update: isAm ? "ዝማኔ" : "Update",
    transfer: isAm ? "ዝውውር" : "Transfer",
  };

  const allActivities = [
    {
      action: isAm ? "አዲስ ሰራተኛ ተመዝግቧል" : "New employee registered",
      detail: isAm ? "አበራ ለማ - ደህንነት ሹም" : "Abebe Kebede - Security Guard",
      time: isAm ? "2 ሰአት በፊት" : "2 hours ago",
      type: "registration",
      icon: <UserPlus className="w-3.5 h-3.5" />,
    },
    {
      action: isAm ? "የስራ መደብ ተመድቧል" : "Position assigned",
      detail: isAm ? "አለም በቀለ → ኦፕሬሽንስ ኃላፊ" : "Lemma Hailu → Operations Head",
      time: isAm ? "5 ሰአት በፊት" : "5 hours ago",
      type: "position",
      icon: <Briefcase className="w-3.5 h-3.5" />,
    },
    {
      action: isAm ? "ሰነድ ተሰቅሏል" : "Document uploaded",
      detail: isAm ? "የሳራ ጥላሁን የትምህርት ሰርተፍኬት" : "Sara Tilahun - Education Certificate",
      time: isAm ? "1 ቀን በፊት" : "1 day ago",
      type: "document",
      icon: <FileUp className="w-3.5 h-3.5" />,
    },
    {
      action: isAm ? "መረጃ ተሻሽሏል" : "Record updated",
      detail: isAm ? "የተቀሌ አየለ የቀበሌ መታወቂያ ታድሷል" : "Kebele ID renewed - Tekle Ayele",
      time: isAm ? "3 ቀናት በፊት" : "3 days ago",
      type: "update",
      icon: <RefreshCw className="w-3.5 h-3.5" />,
    },
    {
      action: isAm ? "ሰራተኛ ተዛውሯል" : "Employee transferred",
      detail: isAm ? "ብርሃነ ገ/ሄር → ቅርንጫፍ ቢሮ 2" : "Birhane G/Hiwot → Branch Office 2",
      time: isAm ? "5 ቀናት በፊት" : "5 days ago",
      type: "transfer",
      icon: <Move className="w-3.5 h-3.5" />,
    },
    {
      action: isAm ? "አዲስ ሰራተኛ ተመዝግቧል" : "New employee registered",
      detail: isAm ? "ማርቆስ አዳነ - ደህንነት ሹም" : "Markos Adane - Security Guard",
      time: isAm ? "1 ሳምንት በፊት" : "1 week ago",
      type: "registration",
      icon: <UserPlus className="w-3.5 h-3.5" />,
    },
    {
      action: isAm ? "ሰነድ ተሰቅሏል" : "Document uploaded",
      detail: isAm ? "የአበራ ለማ የልምድ ሰርተፍኬት" : "Abeba Lemma - Experience Certificate",
      time: isAm ? "1 ሳምንት በፊት" : "1 week ago",
      type: "document",
      icon: <FileUp className="w-3.5 h-3.5" />,
    },
    {
      action: isAm ? "የስራ መደብ ተመድቧል" : "Position assigned",
      detail: isAm ? "ሄለን በቀለ → አስተዳደር ኃላፊ" : "Helen Bekele → Admin Head",
      time: isAm ? "2 ሳምንታት በፊት" : "2 weeks ago",
      type: "position",
      icon: <Briefcase className="w-3.5 h-3.5" />,
    },
  ];

  const filteredActivities = allActivities.filter((item) => {
    const matchesSearch =
      item.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.detail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || item.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const cards = [
    {
      label: isAm ? "የሰራተኛ ብዛት" : "Total Employees",
      value: "128",
      icon: <Users className="w-6 h-6" />,
      accent: "blue",
    },
    {
      label: isAm ? "ፖዚሽኖች" : "Positions",
      value: "22",
      icon: <Briefcase className="w-6 h-6" />,
      accent: "gold",
    },
    {
      label: isAm ? "ንቁ ሰራተኞች" : "Active Staff",
      value: "98",
      icon: <UserCheck className="w-6 h-6" />,
      accent: "green",
    },
    {
      label: isAm ? "ቅጥር በመጠባበቅ ላይ" : "Hires Pending",
      value: "8",
      icon: <TrendingUp className="w-6 h-6" />,
      accent: "amber",
    },
  ];

  const accentMap: Record<string, { bg: string; iconBg: string; value: string }> = {
    blue: { bg: "bg-blue-50", iconBg: "bg-blue-100 text-[#003366]", value: "text-[#003366]" },
    gold: { bg: "bg-amber-50", iconBg: "bg-amber-100 text-[#C5A022]", value: "text-[#C5A022]" },
    green: { bg: "bg-emerald-50", iconBg: "bg-emerald-100 text-emerald-600", value: "text-emerald-700" },
    amber: { bg: "bg-orange-50", iconBg: "bg-orange-100 text-orange-600", value: "text-orange-700" },
  };

  if (dashboardLoading) {
    return (
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#003366] via-[#004080] to-[#001F3F] p-6 md:p-8 text-white shadow-xl">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD700] via-[#C5A022] to-[#FFD700]" />
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/10 animate-pulse" />
            <div className="space-y-2">
              <div className="h-3 w-48 rounded-full bg-white/20 animate-pulse" />
              <div className="h-5 w-64 rounded-full bg-white/10 animate-pulse" />
            </div>
            <div className="ml-auto h-10 w-36 rounded-xl bg-white/10 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>
        <SkeletonTable rows={4} />
        <SkeletonActivityList />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#003366] via-[#004080] to-[#001F3F] p-6 md:p-8 text-white shadow-xl hover:shadow-2xl transition-shadow duration-500"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD700] via-[#C5A022] to-[#FFD700]" />
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#FFD700]/5" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#FFD700] font-bold">
              {isAm ? "የድርጅት የሰው ኃይል አስተዳደር" : "Organization HR Dashboard"}
            </p>
            <h1 className="mt-3 text-3xl font-black">
              {isAm ? "እንኳን ደህና መጡ" : "Welcome Back"}
            </h1>
            <p className="mt-2 text-sm text-white/70 max-w-2xl">
              {isAm
                ? "ሰራተኞችን ያስተዳድሩ፣ የስራ መደቦችን ይመድቡ እና የሰራተኛ መረጃዎችን ይከልሱ"
                : "Manage your workforce, assign positions, and review employee records"}
            </p>
          </div>
          <div className="rounded-3xl bg-white/10 border border-white/20 px-5 py-4 text-sm font-semibold backdrop-blur-sm whitespace-nowrap">
            <Star className="w-4 h-4 inline mr-2 text-[#FFD700]" />
            {isAm ? "የHR መቆጣጠሪያ ማዕከል" : "HR Control Center"}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card, i) => {
          const a = accentMap[card.accent];
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: i * 0.12, ease: "easeOut" }}
              whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
              className={`rounded-3xl border border-gray-100 ${a.bg} p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-default`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  {card.label}
                </p>
                <div className={`w-10 h-10 rounded-xl ${a.iconBg} flex items-center justify-center`}>
                  {card.icon}
                </div>
              </div>
              <p className={`mt-4 text-4xl font-black ${a.value}`}>
                {card.value}
              </p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#003366] to-[#001F3F] text-[#FFD700] flex items-center justify-center shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#003366]">
              {isAm ? "የትምህርት ደረጃ ስርጭት" : "Education Level Distribution"}
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={eduData} barCategoryGap={8}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="level" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: "#f3f4f6" }} />
              <Bar dataKey="count" fill="#003366" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#C5A022] text-white flex items-center justify-center shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#003366]">
              {isAm ? "የሰራተኛ ፆታ ስርጭት" : "Employee Gender Distribution"}
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {genderData.map((_, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2">
            {genderData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                <span className="text-gray-600">{item.name}: <strong>{item.value}</strong></span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow-sm">
            <TrendingUp className="w-5 h-5" />
          </div>
            <h3 className="font-bold text-[#003366]">
              {isAm ? "የሰራተኛ ሁኔታ" : "Employee Status Overview"}
            </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statusData.map((item, idx) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.4 + idx * 0.08 }}
              whileHover={{ y: -3, scale: 1.03, transition: { duration: 0.2 } }}
              className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 text-center hover:border-[#003366]/20 hover:bg-gradient-to-b hover:from-white hover:to-blue-50/30 transition-all duration-300 cursor-default"
            >
              <div
                className="w-5 h-5 rounded-full mx-auto mb-2 shadow-sm"
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              />
              <p className="text-2xl font-black text-gray-900">{item.value}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">{item.name}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

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
                  {isAm ? "የሰራተኛ እንቅስቃሴ ታሪክ" : "Employee activity history"}
                </p>
              </div>
            </div>
            <span className="text-[10px] text-[#FFD700] font-bold bg-[#FFD700]/10 px-3 py-1.5 rounded-full border border-[#FFD700]/20 whitespace-nowrap">
              {isAm ? "የተዘመነ አሁን" : "Updated just now"}
            </span>
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
                { key: "registration", label: isAm ? "ምዝገባ" : "Registration" },
                { key: "position", label: isAm ? "ሹመት" : "Position" },
                { key: "document", label: isAm ? "ሰነድ" : "Document" },
                { key: "update", label: isAm ? "ዝማኔ" : "Update" },
                { key: "transfer", label: isAm ? "ዝውውር" : "Transfer" },
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
            {filteredActivities.length > 0 ? (
              filteredActivities.map((item, idx) => {
                const style = iconStyle;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="group flex items-start gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100 hover:border-[#FFD700]/30 hover:bg-gradient-to-r hover:from-[#FFD700]/5 hover:to-transparent transition-all duration-300"
                  >
                    <motion.div
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 0 }}
                      whileHover={{ rotate: [0, -8, 8, -4, 4, 0], scale: 1.15 }}
                      transition={{ duration: 0.4 }}
                      className={`w-9 h-9 rounded-xl ${style.iconBg} flex items-center justify-center ${style.iconColor} flex-shrink-0 mt-0.5 group-hover:shadow-md transition-all duration-300`}
                    >
                      {item.icon}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-gray-900">{item.action}</p>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${style.badge} tracking-wide uppercase`}>
                          {badgeLabel[item.type]}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{item.detail}</p>
                    </div>
                    <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap flex-shrink-0 mt-1 bg-gray-100 px-2 py-1 rounded-full group-hover:bg-[#FFD700]/10 group-hover:text-[#C5A022] transition-all">
                      {item.time}
                    </span>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <Search className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-400 font-medium">
                  {isAm ? "ምንም የሚገኝ ነገር የለም" : "No activities found"}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const OrgHrManagerDashboard = () => {
  const { language } = useLanguage();
  const isAm = language === "am";

  const sidebarItems = [
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: isAm ? "አጠቃላይ እይታ" : "Overview",
      path: "/org-hr-manager",
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: isAm ? "የድርጅት መረጃ" : "Organization",
      path: "/org-hr-manager/organization",
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      label: isAm ? "የአድራሻ ለውጥ ጥያቄ" : "Address Change Request",
      path: "/org-hr-manager/address-change-request",
    },
    {
      icon: <Briefcase className="w-5 h-5" />,
      label: isAm ? "የሰራተኞች ዝዉውር" : "Employee Transfer",
      path: "/org-hr-manager/employee-transfer",
    },
    {
      icon: <UserCog className="w-5 h-5" />,
      label: isAm ? "የሰራተኞች ለውጥ ጥያቄ" : "Personnel Change Request",
      path: "/org-hr-manager/personnel-change-request",
    },
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      label: isAm ? "መገለጫ" : "Profile",
      path: "/org-hr-manager/profile",
    },
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      label: isAm ? "ማስታወቂያዎች" : "Notifications",
      path: "/org-hr-manager/notifications",
    },
  ];

  return (
    <DashboardLayout
      title={isAm ? "የሰው ኃይል አስተዳደር" : "HR Manager"}
      sidebarItems={sidebarItems}
    >
      <Routes>
        <Route index element={<Overview />} />
        <Route path="organization" element={<OrgOrganizationView />} />
        <Route
          path="address-change-request"
          element={<AddressChangeRequestForm />}
        />
        <Route path="employee-transfer" element={<EmployeeTransferManager />} />
        <Route path="personnel-change-request" element={<PersonnelChangeRequest />} />
        <Route path="profile" element={<Profile />} />
        <Route path="notifications" element={<Notifications />} />
        <Route
          path="employee-registration"
          element={<EmployeeRegistration />}
        />
      </Routes>
    </DashboardLayout>
  );
};

export default OrgHrManagerDashboard;

function OrgOrganizationView() {
  const { language } = useLanguage();
  const isAm = language === "am";
  const { user } = useAuth();
  const navigate = useNavigate();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiRequest(`/employees/my-organization`);
        const data = res?.data ?? res?.payload ?? res;
        if (!data || !data.organizationId) {
          setError("Organization not found for current user");
          setOrganizationId(null);
          return;
        }
        setOrganizationId(String(data.organizationId));
      } catch (err: any) {
        setError(err?.message || "Failed to load organization");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.id]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading organization..." />
      </div>
    );
  if (error)
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[60vh] gap-4"
      >
        <div className="p-5 rounded-2xl bg-red-50 border border-red-200">
          <AlertCircle className="w-10 h-10 text-red-400" />
        </div>
        <p className="text-sm font-bold text-red-600">{error}</p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/org-hr-manager")}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#003366] to-[#001F3F] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
        >
          {isAm ? "ተመለስ" : "Back to Dashboard"}
        </motion.button>
      </motion.div>
    );

  return (
    <AgenciesManagement
      organizationId={organizationId ?? "0"}
      onBack={() => navigate("/org-hr-manager")}
    />
  );
}
