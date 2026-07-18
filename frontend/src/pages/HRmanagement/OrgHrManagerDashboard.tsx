//filepath: frontend/src/pages/HRmanagement/OrgHrManagerDashboard.tsx
import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserMinus,
  FileBarChart2,
  BadgeCheck,
  ClipboardList,
  Star,
  AlertCircle,
  Building2,
  ArrowLeftRight,
  UserRoundPlus,
  FileSearch,
  Gavel,
  House,
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
import { DashboardLayout } from "../../components/DashboardLayout";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../lib/api";
import AgenciesManagement from "../admin/AgenciesManagement";
import { Profile } from "../Profile";
import EmployeeRegistration from "./EmployeeRegistration";
import EmployeeTransferManager from "./EmployeeTransferManager";
import AddressChangeRequestForm from "./AddressChangeRequestForm";
import PersonnelChangeRequest from "./PersonnelChangeRequest";
import CriminalReport from "./CriminalReport";
import InstitutionReports from "./InstitutionReports";
import {
  LoadingSpinner,
  SkeletonCard,
  SkeletonChart,
} from "../../components/LoadingSpinner";

const COLORS = [
  "#003366",
  "#FFD700",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
];

const Overview = () => {
  const { language } = useLanguage();
  const isAm = language === "am";
  const { user } = useAuth();
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalReports, setTotalReports] = useState(0);
  const [activeStaff, setActiveStaff] = useState(0);
  const [resignedEmployees, setResignedEmployees] = useState(0);
  const [pendingHires, setPendingHires] = useState(0);
  const [genderData, setGenderData] = useState([
    { name: "Male", value: 0 },
    { name: "Female", value: 0 },
  ]);
  const [eduData, setEduData] = useState([
    { level: "Grade 3-9", count: 0 },
    { level: "Grade 10-12", count: 0 },
    { level: "Certificate", count: 0 },
    { level: "Diploma", count: 0 },
    { level: "Degree", count: 0 },
    { level: "Second Degree", count: 0 },
  ]);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id) {
        setDashboardLoading(false);
        return;
      }

      try {
        setDashboardLoading(true);
        const orgRes = await apiRequest<any>(`/employees/my-organization`);
        const orgPayload = orgRes?.data ?? orgRes?.payload ?? orgRes;
        const organizationId = orgPayload?.organizationId ?? orgPayload?.id;

        if (!organizationId) {
          throw new Error("Organization not found for current user");
        }

        const detailsRes = await apiRequest<any>(
          `/organizations/${organizationId}/details`,
        );
        const detailsPayload =
          detailsRes?.data ?? detailsRes?.payload ?? detailsRes;
        const employees = Array.isArray(detailsPayload?.employees)
          ? detailsPayload.employees
          : [];
        const incidents = Array.isArray(detailsPayload?.incidents)
          ? detailsPayload.incidents
          : [];
        const regularReportCount = Number(
          detailsPayload?.regularPeriodReportsCount ??
            detailsPayload?.totalReports ??
            detailsPayload?.reportsCount ??
            (Array.isArray(detailsPayload?.regularPeriodReports)
              ? detailsPayload.regularPeriodReports.length
              : 0) ??
            incidents.length ??
            0,
        );

        const genderCounts = employees.reduce(
          (acc: Record<string, number>, employee: any) => {
            const rawGender = String(employee?.gender ?? "")
              .trim()
              .toLowerCase();
            if (rawGender === "male" || rawGender === "m") {
              acc.male += 1;
            } else if (rawGender === "female" || rawGender === "f") {
              acc.female += 1;
            }
            return acc;
          },
          { male: 0, female: 0 },
        );

        const educationStats = detailsPayload?.educationStats;
        const educationCounts = educationStats
          ? [
              {
                level: "Grade 3-9",
                count:
                  Number(educationStats.grade_3_9_male ?? 0) +
                  Number(educationStats.grade_3_9_female ?? 0),
              },
              {
                level: "Grade 10-12",
                count:
                  Number(educationStats.grade_10_12_male ?? 0) +
                  Number(educationStats.grade_10_12_female ?? 0),
              },
              {
                level: "Certificate",
                count:
                  Number(educationStats.certificate_male ?? 0) +
                  Number(educationStats.certificate_female ?? 0),
              },
              {
                level: "Diploma",
                count:
                  Number(educationStats.diploma_male ?? 0) +
                  Number(educationStats.diploma_female ?? 0),
              },
              {
                level: "Degree",
                count:
                  Number(educationStats.degree_male ?? 0) +
                  Number(educationStats.degree_female ?? 0),
              },
              {
                level: "Second Degree",
                count:
                  Number(educationStats.second_degree_male ?? 0) +
                  Number(educationStats.second_degree_female ?? 0),
              },
            ]
          : [
              { level: "Grade 3-9", count: 0 },
              { level: "Grade 10-12", count: 0 },
              { level: "Certificate", count: 0 },
              { level: "Diploma", count: 0 },
              { level: "Degree", count: 0 },
              { level: "Second Degree", count: 0 },
            ];

        const statusCounts = employees.reduce(
          (acc: Record<string, number>, employee: any) => {
            const status = String(employee?.employmentStatus ?? "")
              .trim()
              .toLowerCase();
            if (status.includes("active")) {
              acc.Active += 1;
            } else if (status.includes("leave")) {
              acc["On Leave"] += 1;
            } else if (status.includes("suspend")) {
              acc.Suspended += 1;
            } else if (status.includes("pending")) {
              acc.Pending += 1;
            } else if (
              status.includes("resign") ||
              status.includes("terminated") ||
              status.includes("inactive")
            ) {
              acc.Resigned += 1;
            }
            return acc;
          },
          { Active: 0, "On Leave": 0, Suspended: 0, Pending: 0, Resigned: 0 },
        );

        setTotalEmployees(employees.length);
        setTotalReports(regularReportCount);
        setActiveStaff(statusCounts.Active);
        setResignedEmployees(statusCounts.Resigned);
        setPendingHires(statusCounts.Pending);
        setGenderData([
          { name: "Male", value: genderCounts.male },
          { name: "Female", value: genderCounts.female },
        ]);
        setEduData(educationCounts);
      } catch (error: any) {
        console.error("Failed to load organization dashboard data", error);
      } finally {
        setDashboardLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.id]);

  const cards = [
    {
      label: isAm ? "የሰራተኛ ብዛት" : "Total Employees",
      value: totalEmployees.toString(),
      icon: <Users className="w-6 h-6" />,
      accent: "blue",
    },
    {
      label: isAm ? "አጠቃላይ የመደበኛ ሪፖርቶች" : "Total Regular Reports",
      value: totalReports.toString(),
      icon: <FileBarChart2 className="w-6 h-6" />,
      accent: "gold",
    },
    {
      label: isAm ? "ንቁ ሰራተኞች" : "Active Staff",
      value: activeStaff.toString(),
      icon: <BadgeCheck className="w-6 h-6" />,
      accent: "green",
    },
    {
      label: isAm ? "ተሰናብተዋል" : "Resigned Employees",
      value: resignedEmployees.toString(),
      icon: <UserMinus className="w-6 h-6" />,
      accent: "amber",
    },
    {
      label: isAm ? "ቅጥር በመጠባበቅ ላይ" : "Hires Pending",
      value: pendingHires.toString(),
      icon: <ClipboardList className="w-6 h-6" />,
      accent: "amber",
    },
  ];

  const accentMap: Record<
    string,
    { bg: string; iconBg: string; value: string }
  > = {
    blue: {
      bg: "bg-[#003366]",
      iconBg: "bg-[#FFD700] text-[#003366]",
      value: "text-[#FFD700]",
    },
    gold: {
      bg: "bg-[#003366]",
      iconBg: "bg-[#FFD700] text-[#003366]",
      value: "text-[#FFD700]",
    },
    green: {
      bg: "bg-[#003366]",
      iconBg: "bg-[#FFD700] text-[#003366]",
      value: "text-[#FFD700]",
    },
    amber: {
      bg: "bg-[#003366]",
      iconBg: "bg-[#FFD700] text-[#003366]",
      value: "text-[#FFD700]",
    },
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
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 items-stretch">
        {cards.map((card, i) => {
          const a = accentMap[card.accent];
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: i * 0.12, ease: "easeOut" }}
              whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
              className={`rounded-3xl border border-gray-100 ${a.bg} p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-default w-full h-full min-h-[132px] flex items-center justify-center`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl ${a.iconBg} flex items-center justify-center flex-shrink-0`}
                >
                  {card.icon}
                </div>
                <div className="min-w-0">
                  <p
                    className={`text-xs font-bold uppercase tracking-widest ${a.value}`}
                  >
                    {card.label}
                  </p>
                  <p className={`mt-2 text-3xl font-black ${a.value}`}>
                    {card.value}
                  </p>
                </div>
              </div>
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
            <BarChart
              data={eduData}
              barCategoryGap={6}
              margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="level"
                axisLine={false}
                tickLine={false}
                interval={0}
                tick={{ fontSize: 10, fill: "#4b5563" }}
                minTickGap={-10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#4b5563" }}
              />
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
                label={({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
              >
                {genderData.map((_, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={COLORS[idx % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2">
            {genderData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-2 text-sm">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[idx] }}
                />
                <span className="text-gray-600">
                  {item.name}: <strong>{item.value}</strong>
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
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
      icon: <Building2 className="w-5 h-5" />,
      label: isAm ? "የድርጅት መረጃ" : "Organization Details",
      path: "/org-hr-manager/organization",
    },
    {
      icon: <House className="w-5 h-5" />,
      label: isAm ? "የአድራሻ ለውጥ ጥያቄ" : "Address Change Request",
      path: "/org-hr-manager/address-change-request",
    },
    {
      icon: <ArrowLeftRight className="w-5 h-5" />,
      label: isAm ? "የሰራተኞች ዝዉውር" : "Employee Transfer",
      path: "/org-hr-manager/employee-transfer",
    },
    {
      icon: <UserRoundPlus className="w-5 h-5" />,
      label: isAm ? "የአመራሮች ለውጥ ጥያቄ" : "Leaders Change Request",
      path: "/org-hr-manager/personnel-change-request",
    },
    {
      icon: <FileSearch className="w-5 h-5" />,
      label: isAm ? "ከተቋም ሪፖርቶች" : "Reports from the Institution",
      path: "/org-hr-manager/institution-reports",
    },
    {
      icon: <Gavel className="w-5 h-5" />,
      label: isAm ? "የወንጀል ሪፖርት" : "Report of Criminal",
      path: "/org-hr-manager/criminal-report",
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
        <Route
          path="personnel-change-request"
          element={<PersonnelChangeRequest />}
        />
        <Route path="institution-reports" element={<InstitutionReports />} />
        <Route path="criminal-report" element={<CriminalReport />} />
        <Route path="profile" element={<Profile />} />
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
