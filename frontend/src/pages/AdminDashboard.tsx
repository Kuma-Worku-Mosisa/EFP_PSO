//frontend/src/pages/AdminDashboard.tsx
import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { DashboardLayout } from "../components/DashboardLayout";
import {
  LayoutDashboard,
  Users,
  FileCheck,
  Map,
  BarChart3,
  Settings,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Database,
  Clock,
  CheckCircle,
  XCircle,
  Briefcase,
  FileText,
  Search,
  Newspaper,
  Files,
  HelpCircle,
  MessageSquare,
  ClipboardCheck,
  MapPin,
  UserCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
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

import { GPSTracking } from "./GPSTracking";
import OrganizationDashboard from "./admin/OrganizationsDashboard";
import { ApplicationsReview } from "./ApplicationsReview";
import { AdminReports } from "./AdminReports";
import SystemSettings from "./admin/system-settings";
import { LicenseManagement } from "./LicenseManagement";
import { LicenseViewer } from "./LicenseViewer";
import { HRMSReports } from "./HRMSReports";
import { UserManagement } from "./UserManagement";
import { BackupRecovery } from "./BackupRecovery";
import { PermissionsManagement } from "./PermissionsManagement";
import { Profile } from "./Profile";
import { ManageNews } from "./ManageNews";
import { ManagePublicContent } from "./ManagePublicContent";
import { ManageFAQ } from "./ManageFAQ";
import { Communications } from "./Communications";
import { Notifications } from "./Notifications";
import PositionManagement from "./PositionManagement";
import FormalRequestManager from "../components/FormalRequestManager";
import AdminAgreementManager from "./admin/AdminAgreementManager";
import AdminAgreementDetail from "./admin/AdminAgreementDetail";
import { AdminInspections } from "./AdminInspections";
import { AdminAddressApproval } from "./admin/AdminAddressApproval";
import { PersonnelChangeApprovals } from "./admin/PersonnelChangeApprovals";

const Overview = () => {
  const { language } = useLanguage();
  const isAm = language === "am";

  const [filterStatus, setFilterStatus] = useState("All");
  const [filterType, setFilterType] = useState("All");

  const navigate = useNavigate();
  const [summary, setSummary] = useState<any | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [certificationsLoading, setCertificationsLoading] = useState(false);
  const [regionsCount, setRegionsCount] = useState<number>(0);
  const [regionsLoading, setRegionsLoading] = useState(false);
  const [trendBuckets, setTrendBuckets] = useState<
    { key: string; month: number; year: number; count: number }[]
  >([]);
  const [licenseDistributionCounts, setLicenseDistributionCounts] = useState<{
    Active: number;
    Suspended: number;
    Expired: number;
    Revoked: number;
  }>({ Active: 0, Suspended: 0, Expired: 0, Revoked: 0 });

  const getApplicationDate = (app: any) => {
    const rawDate =
      app.applicationDate || app.createdAt || app.date || app.application_date;
    const parsed = new Date(rawDate);
    return Number.isFinite(parsed.getTime()) ? parsed : null;
  };

  const getTrendBuckets = () => {
    const buckets = [] as {
      key: string;
      month: number;
      year: number;
      count: number;
    }[];
    const now = new Date();
    for (let i = 5; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        count: 0,
      });
    }
    return buckets;
  };

  const normalizeCertificationStatus = (status: any) => {
    const raw = String(status || "")
      .trim()
      .toLowerCase();
    if (raw === "active") return "Active";
    if (raw === "suspended" || raw.includes("suspend")) return "Suspended";
    if (raw === "expired" || raw === "expired") return "Expired";
    if (raw === "revoked" || raw.includes("revoke")) return "Revoked";
    return "Active";
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setSummaryLoading(true);
      try {
        const { apiRequest } = await import("../lib/api");
        const res = await apiRequest<any>("/admin/summary");
        if (mounted && res) setSummary(res.data || res);
      } catch (e) {
        // keep UI functional with fallbacks
      } finally {
        if (mounted) setSummaryLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadApplications = async () => {
      setAppsLoading(true);
      try {
        const { apiRequest } = await import("../lib/api");
        const res = await apiRequest<any>(
          "/applications?limit=10&orderBy=desc",
        );
        if (mounted && res?.data) {
          const apps = Array.isArray(res.data) ? res.data : res.data.data || [];
          const parsedApps = Array.isArray(apps) ? apps : [];
          const currentBuckets = getTrendBuckets();

          parsedApps.forEach((app: any) => {
            const date = getApplicationDate(app);
            if (!date) return;
            const bucketKey = `${date.getFullYear()}-${String(
              date.getMonth() + 1,
            ).padStart(2, "0")}`;
            const bucket = currentBuckets.find((b) => b.key === bucketKey);
            if (bucket) bucket.count += 1;
          });

          const transformed = parsedApps.slice(0, 4).map((app: any) => {
            const rawType = String(
              app.type || app.application_type || "",
            ).trim();
            const rawDate =
              app.date ||
              app.applicationDate ||
              app.createdAt ||
              app.application_date;
            const rawStatus = String(
              app.status || app.application_status || "",
            ).trim();

            const normalizedType = rawType.toUpperCase();
            const normalizedStatus = rawStatus.toLowerCase();

            const resolvedType = normalizedType.includes("RENEWAL")
              ? isAm
                ? "እድሳት"
                : "Renewal"
              : normalizedType.includes("NEW")
                ? isAm
                  ? "አዲስ"
                  : "New"
                : rawType || (isAm ? "አዲስ" : "New");

            const resolvedStatus = normalizedStatus.includes("approved")
              ? isAm
                ? "ጸድቋል"
                : "Approved"
              : normalizedStatus.includes("rejected")
                ? isAm
                  ? "ውድቅ ተደርጓል"
                  : "Rejected"
                : normalizedStatus.includes("pending")
                  ? isAm
                    ? "በመጠባበቅ ላይ"
                    : "Pending"
                  : isAm
                    ? rawStatus || "በመጠባበቅ ላይ"
                    : rawStatus || "Pending";

            let formattedDate = "N/A";
            if (rawDate) {
              const parsed = new Date(rawDate);
              formattedDate = Number.isFinite(parsed.getTime())
                ? parsed.toLocaleDateString("en-GB")
                : String(rawDate);
            }

            return {
              name:
                app.organization?.nameEnglish ||
                app.organization?.nameAmharic ||
                app.agency ||
                app.organization?.name ||
                "Unknown Agency",
              organizationId:
                app.organization?.id || app.organizationId || null,
              type: resolvedType,
              date: formattedDate,
              status: resolvedStatus,
            };
          });
          if (mounted) {
            setApplications(transformed);
            setTrendBuckets(currentBuckets);
          }
        }
      } catch (e) {
        console.error("[DEBUG] Failed to load applications:", e);
        if (mounted) setApplications([]);
      } finally {
        if (mounted) setAppsLoading(false);
      }
    };
    loadApplications();
    return () => {
      mounted = false;
    };
  }, [isAm]);

  useEffect(() => {
    let mounted = true;
    const loadCertifications = async () => {
      if (mounted) setCertificationsLoading(true);
      try {
        const { apiRequest } = await import("../lib/api");
        const res = await apiRequest<any>("/certifications");
        const certs = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
            ? res.data.data
            : [];

        const counts = { Active: 0, Suspended: 0, Expired: 0, Revoked: 0 };
        certs.forEach((cert: any) => {
          const status = normalizeCertificationStatus(cert.status);
          counts[status] = (counts[status] ?? 0) + 1;
        });

        if (mounted) {
          setLicenseDistributionCounts(counts);
        }
      } catch (error) {
        console.error("[DEBUG] Failed to load certifications:", error);
      } finally {
        if (mounted) setCertificationsLoading(false);
      }
    };

    loadCertifications();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadRegions = async () => {
      if (mounted) setRegionsLoading(true);
      try {
        const { apiRequest } = await import("../lib/api");
        const res = await apiRequest<any>("/organizations");
        const orgs = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
            ? res.data.data
            : [];

        const uniqueRegionIds = new Set<number>();

        orgs.forEach((org: any) => {
          // Try to extract region from organization's address hierarchy
          // Organization -> address (Address object)
          if (org.address) {
            const address = org.address;
            // Address -> kebele (Kebele object)
            if (address.kebele && address.kebele.woreda) {
              const woreda = address.kebele.woreda;
              // Woreda -> zone (Zone object)
              if (woreda.zone && woreda.zone.regionId) {
                uniqueRegionIds.add(woreda.zone.regionId);
              }
            }
          }
        });

        if (mounted) {
          setRegionsCount(uniqueRegionIds.size);
        }
      } catch (error) {
        console.error("[DEBUG] Failed to load regions:", error);
      } finally {
        if (mounted) setRegionsLoading(false);
      }
    };

    loadRegions();
    return () => {
      mounted = false;
    };
  }, []);

  const monthNamesEn = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthNamesAm = [
    "ጥር",
    "የካ",
    "መጋ",
    "ሚያ",
    "ግን",
    "ሰኔ",
    "ሐም",
    "ነሐ",
    "መስ",
    "ጥቅ",
    "ሕዳ",
    "ታህ",
  ];

  const data =
    trendBuckets.length > 0
      ? trendBuckets.map((bucket) => ({
          name: isAm
            ? monthNamesAm[bucket.month - 1] || String(bucket.month)
            : monthNamesEn[bucket.month - 1] || String(bucket.month),
          apps: bucket.count,
        }))
      : [
          { name: isAm ? "ጥር" : "Jan", apps: 45 },
          { name: isAm ? "የካ" : "Feb", apps: 52 },
          { name: isAm ? "መጋ" : "Mar", apps: 38 },
          { name: isAm ? "ሚያ" : "Apr", apps: 65 },
          { name: isAm ? "ግን" : "May", apps: 48 },
          { name: isAm ? "ሰኔ" : "Jun", apps: 59 },
        ];

  const pieData = [
    {
      name: isAm ? "ንቁ" : "Active",
      value: licenseDistributionCounts.Active,
    },
    {
      name: isAm ? "የታገደ" : "Suspended",
      value: licenseDistributionCounts.Suspended,
    },
    {
      name: isAm ? "ጊዜው ያለፈበት" : "Expired",
      value: licenseDistributionCounts.Expired,
    },
    {
      name: isAm ? "የተሰረዘ" : "Revoked",
      value: licenseDistributionCounts.Revoked,
    },
  ];

  const recentApps =
    applications.length > 0
      ? applications
      : [
          {
            name: "Abyssinia Security",
            type: isAm ? "አዲስ" : "New",
            date: "Oct 12, 2024",
            status: isAm ? "በመጠባበቅ ላይ" : "Pending",
          },
          {
            name: "Lion Guard Services",
            type: isAm ? "እድሳት" : "Renewal",
            date: "Oct 11, 2024",
            status: isAm ? "ጸድቋል" : "Approved",
          },
          {
            name: "Nile Protection",
            type: isAm ? "አዲስ" : "New",
            date: "Oct 10, 2024",
            status: isAm ? "ውድቅ ተደርጓል" : "Rejected",
          },
          {
            name: "Eagle Eye Security",
            type: isAm ? "እድሳት" : "Renewal",
            date: "Oct 09, 2024",
            status: isAm ? "በመጠባበቅ ላይ" : "Pending",
          },
        ];

  const openOrganization = (organizationId: number | null) => {
    if (!organizationId) return;
    navigate(`/admin/organizations?organizationId=${organizationId}`);
  };

  const filteredApps = recentApps.filter((app) => {
    const statusMatch = filterStatus === "All" || app.status === filterStatus;
    const typeMatch = filterType === "All" || app.type === filterType;
    return statusMatch && typeMatch;
  });

  const COLORS = ["#22c55e", "#f59e0b", "#ef4444", "#6b7280"];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: isAm ? "የተመዘገቡ ኤጀንሲዎች" : "Registered Agencies",
            value: summaryLoading ? "..." : (summary?.organizations ?? "—"),
            icon: <ShieldCheck className="w-6 h-6 text-primary" />,
            color: "bg-blue-50",
          },
          {
            label: isAm ? "የደህንነት ሰራተኞች" : "Security Personnel",
            value: summaryLoading ? "..." : (summary?.users ?? "—"),
            icon: <Users className="w-6 h-6 text-amber-500" />,
            color: "bg-amber-50",
          },
          {
            label: isAm ? "ንቁ ፈቃዶች" : "Active Licenses",
            value: certificationsLoading
              ? "..."
              : licenseDistributionCounts.Active,
            icon: <CheckCircle className="w-6 h-6 text-green-500" />,
            color: "bg-green-50",
          },
          {
            label: isAm ? "የተሸፈኑ ክልሎች" : "Regions Covered",
            value: regionsLoading ? "..." : regionsCount,
            icon: <Map className="w-6 h-6 text-purple-500" />,
            color: "bg-purple-50",
          },
          {
            label: isAm ? "በመጠባበቅ ላይ ያሉ" : "Total Pending",
            value: "142",
            icon: <Clock className="w-6 h-6 text-amber-500" />,
            color: "bg-amber-50",
          },
          {
            label: isAm ? "ጠቅላላ ውሎች" : "Total Agreements",
            value: summaryLoading ? "..." : (summary?.agreements?.total ?? "—"),
            icon: <ShieldAlert className="w-6 h-6 text-red-400" />,
            color: "bg-red-50",
          },
          {
            label: isAm ? "ጠቅላላ ፈቃዶች" : "Total Licenses",
            value: certificationsLoading
              ? "..."
              : licenseDistributionCounts.Active +
                licenseDistributionCounts.Suspended +
                licenseDistributionCounts.Expired +
                licenseDistributionCounts.Revoked,
            icon: <ShieldCheck className="w-6 h-6 text-blue-500" />,
            color: "bg-blue-50",
          },
          {
            label: isAm ? "ውድቅ የተደረጉ" : "Rejected Applications",
            value: "24",
            icon: <XCircle className="w-6 h-6 text-red-500" />,
            color: "bg-red-50",
          },
          {
            label: isAm ? "ጠቅላላ ገቢ" : "Total Revenue",
            value: "ETB 14.2M",
            icon: <BarChart3 className="w-6 h-6 text-primary" />,
            color: "bg-blue-50",
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4 transition-all hover:shadow-xl"
          >
            <div className={`p-4 rounded-2xl ${stat.color}`}>{stat.icon}</div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                {stat.label}
              </p>
              <p className="text-2xl font-black text-primary tracking-tight">
                {stat.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div
          className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6"
          style={{ minWidth: 0 }}
        >
          <h3 className="text-lg font-bold text-primary">
            {isAm ? "የማመልከቻዎች አዝማሚያ" : "Applications Trend"}
          </h3>
          <div
            className="w-full"
            style={{ height: "300px", minWidth: 0, minHeight: 0 }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "#f3f4f6" }} />
                <Bar dataKey="apps" fill="#003366" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div
          className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6"
          style={{ minWidth: 0 }}
        >
          <h3 className="text-lg font-bold text-primary">
            {isAm ? "የፈቃድ ስርጭት" : "License Distribution"}
          </h3>
          <div
            className="relative w-full"
            style={{ height: "300px", minWidth: 0, minHeight: 0 }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="relative flex flex-col items-center text-center">
                <span className="absolute top-0 left-1/2 -translate-x-1/2 h-12 w-px bg-gray-200/80"></span>
                <div className="absolute top-12 left-1/2 -translate-x-1/2 text-gray-400 text-xs">
                  ↘
                </div>
                <div className="relative z-10 rounded-full bg-white/95 px-3 py-1 shadow-sm border border-gray-200 text-sm font-semibold text-gray-700">
                  {isAm ? "ድምር" : "Total"}
                  <div className="text-lg font-black text-primary">
                    {pieData.reduce((sum, item) => sum + item.value, 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3 text-sm">
            {pieData.map((item, index) => (
              <div
                key={item.name}
                className="flex flex-col items-center gap-2 rounded-2xl bg-gray-50 p-3"
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <p className="font-semibold text-gray-700">{item.name}</p>
                <p className="text-xs text-gray-500">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col space-y-1">
            <h3 className="text-lg font-bold text-primary">
              {isAm ? "የቅርብ ጊዜ ማመልከቻዎች" : "Recent Applications"}
            </h3>
            <p className="text-xs text-gray-400 font-medium">
              {appsLoading
                ? isAm
                  ? "በመጫን ላይ..."
                  : "Loading..."
                : isAm
                  ? "የማመልከቻዎችን ዝርዝር ይከታተሉ"
                  : "Track and review the latest commission submissions"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {isAm ? "ሁኔታ:" : "Status:"}
              </span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs font-bold px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="All">{isAm ? "ሁሉም" : "All"}</option>
                <option value={isAm ? "በመጠባበቅ ላይ" : "Pending"}>
                  {isAm ? "በመጠባበቅ ላይ" : "Pending"}
                </option>
                <option value={isAm ? "ጸድቋል" : "Approved"}>
                  {isAm ? "ጸድቋል" : "Approved"}
                </option>
                <option value={isAm ? "ውድቅ ተደርጓል" : "Rejected"}>
                  {isAm ? "ውድቅ ተደርጓል" : "Rejected"}
                </option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {isAm ? "ዓይነት:" : "Type:"}
              </span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="text-xs font-bold px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="All">{isAm ? "ሁሉም" : "All"}</option>
                <option value={isAm ? "አዲስ" : "New"}>
                  {isAm ? "አዲስ" : "New"}
                </option>
                <option value={isAm ? "እድሳት" : "Renewal"}>
                  {isAm ? "እድሳት" : "Renewal"}
                </option>
              </select>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder={isAm ? "ኤጀንሲ ይፈልጉ..." : "Search..."}
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary transition-all min-w-[200px]"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase tracking-widest">
              <tr>
                <th className="px-8 py-4 font-black">
                  {isAm ? "የኤጀንሲ ስም" : "Agency Name"}
                </th>
                <th className="px-8 py-4 font-black">
                  {isAm ? "ዓይነት" : "Type"}
                </th>
                <th className="px-8 py-4 font-black">{isAm ? "ቀን" : "Date"}</th>
                <th className="px-8 py-4 font-black">
                  {isAm ? "ሁኔታ" : "Status"}
                </th>
                <th className="px-8 py-4 font-black text-right">
                  {isAm ? "እርምጃዎች" : "Actions"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence mode="popLayout">
                {filteredApps.map((app, idx) => (
                  <motion.tr
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={`app-${idx}-${app.organizationId ?? "na"}-${app.name}`}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-8 py-4 font-bold text-primary text-sm">
                      {app.name}
                    </td>
                    <td className="px-8 py-4 text-xs font-medium text-gray-500">
                      {app.type}
                    </td>
                    <td className="px-8 py-4 text-xs font-medium text-gray-400">
                      {app.date}
                    </td>
                    <td className="px-8 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          app.status === (isAm ? "ጸድቋል" : "Approved")
                            ? "bg-green-100 text-green-700"
                            : app.status === (isAm ? "በመጠባበቅ ላይ" : "Pending")
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => openOrganization(app.organizationId)}
                        disabled={!app.organizationId}
                        className="text-secondary hover:text-primary font-black text-[10px] uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isAm ? "ገምግም" : "Review"}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filteredApps.length === 0 && (
            <div className="p-12 text-center space-y-3">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-8 h-8 text-gray-200" />
              </div>
              <p className="text-sm font-bold text-gray-400">
                {isAm
                  ? "ምንም አይነት ማመልከቻ አልተገኘም"
                  : "No applications found matching your filters"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FormalRequestsPage = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-black text-primary uppercase tracking-tight">
        Formal Requests
      </h2>
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
        Admin Portal
      </span>
    </div>
    <FormalRequestManager />
  </div>
);

export const AdminDashboard = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const isAm = language === "am";
  const isSuperAdmin = user?.roles?.includes("super_admin") ?? false;

  const sidebarItems = [
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: t.dashboard.overview,
      path: "/admin",
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: t.dashboard.agencies,
      path: "/admin/organizations",
    },
    {
      icon: <FileCheck className="w-5 h-5" />,
      label: isAm ? "መደበኛ ደብዳቤዎች" : "Formal Requests",
      path: "/admin/formal-requests",
    },
    {
      icon: <FileCheck className="w-5 h-5" />,
      label: t.dashboard.applications,
      path: "/admin/applications",
    },
    {
      icon: <ClipboardCheck className="w-5 h-5" />,
      label: t.dashboard.inspections,
      path: "/admin/inspections",
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      label: isAm ? "አድራሻ ለውጥ ፈቃዶች" : "Address Change Approvals",
      path: "/admin/address-approvals",
    },
    {
      icon: <UserCheck className="w-5 h-5" />,
      label: isAm ? "የሰራተኞች ለውጥ ማረጋገጫ" : "Personnel Change Approvals",
      path: "/admin/personnel-change-approvals",
    },
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      label: t.dashboard.licenseManagement,
      path: "/admin/licenses",
    },
    {
      icon: <Map className="w-5 h-5" />,
      label: t.dashboard.gps,
      path: "/admin/gps",
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      label: t.dashboard.reports,
      path: "/admin/reports",
    },
    {
      icon: <Briefcase className="w-5 h-5" />,
      label: isAm ? "የቦታ አስተዳደር" : "Position Management",
      path: "/admin/positions",
    },
    {
      icon: <FileCheck className="w-5 h-5" />,
      label: t.dashboard.hrmsReports,
      path: "/admin/hrms-reports",
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: isAm ? "ውሎች" : "Agreements",
      path: "/admin/agreements",
    },

    // Content Management Section (Grouped logically)
    {
      icon: <Newspaper className="w-5 h-5" />,
      label: isAm ? "ዜና እና ማስታወቂያ" : "News & Announcements",
      path: "/admin/news",
    },
    {
      icon: <Files className="w-5 h-5" />,
      label: isAm ? "የህዝብ ሰነዶች" : "Public Documents",
      path: "/admin/content",
    },
    {
      icon: <HelpCircle className="w-5 h-5" />,
      label: isAm ? "FAQ አስተዳዳሪ" : "FAQ Management",
      path: "/admin/faq-manage",
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      label: isAm ? "ኮሙኒኬሽን" : "Communications",
      path: "/admin/communications",
    },

    {
      icon: <Settings className="w-5 h-5" />,
      label: t.dashboard.settings,
      path: "/admin/settings",
    },
    ...(isSuperAdmin
      ? [
          {
            icon: <Database className="w-5 h-5" />,
            label: t.dashboard.backups,
            path: "/admin/backups",
          },
          {
            icon: <Shield className="w-5 h-5" />,
            label: t.dashboard.permissions,
            path: "/admin/permissions",
          },
          {
            icon: <Users className="w-5 h-5" />,
            label: t.dashboard.userManagement,
            path: "/admin/users",
          },
        ]
      : []),
  ];

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      title={t.dashboard.adminDashboard}
    >
      <Routes>
        <Route index element={<Overview />} />
        <Route path="organizations" element={<OrganizationDashboard />} />
        <Route path="applications" element={<ApplicationsReview />} />
        <Route path="inspections" element={<AdminInspections />} />
        <Route path="address-approvals" element={<AdminAddressApproval />} />
        <Route
          path="personnel-change-approvals"
          element={<PersonnelChangeApprovals />}
        />
        <Route path="licenses" element={<LicenseManagement />} />
        <Route path="licenses/:certificateId?" element={<LicenseViewer />} />
        <Route path="gps" element={<GPSTracking />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="positions" element={<PositionManagement />} />
        <Route path="hrms-reports" element={<HRMSReports />} />
        <Route path="agreements" element={<AdminAgreementManager />} />
        <Route
          path="agreements/:agreementId"
          element={<AdminAgreementDetail />}
        />
        <Route path="settings" element={<SystemSettings />} />
        <Route path="news" element={<ManageNews />} />
        <Route path="content" element={<ManagePublicContent />} />
        <Route path="formal-requests" element={<FormalRequestsPage />} />
        <Route path="faq-manage" element={<ManageFAQ />} />
        <Route path="communications" element={<Communications />} />
        <Route path="notifications" element={<Notifications />} />

        {/* Strictly Super Admin internal tools */}
        {isSuperAdmin && (
          <>
            <Route path="backups" element={<BackupRecovery />} />
            <Route path="permissions" element={<PermissionsManagement />} />
            <Route path="users" element={<UserManagement />} />
          </>
        )}
        <Route path="profile" element={<Profile />} />
      </Routes>
    </DashboardLayout>
  );
};
