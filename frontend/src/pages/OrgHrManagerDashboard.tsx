import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { DashboardLayout } from "../components/DashboardLayout";
import { useLanguage } from "../context/LanguageContext";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  ShieldCheck,
  MapPin,
} from "lucide-react";
import AgenciesManagement from "./admin/AgenciesManagement";
import EmployeeRegistration from "./HRmanagement/EmployeeRegistration";
import EmployeeTransferManager from "./HRmanagement/EmployeeTransferManager";
import AddressChangeRequestForm from "./HRmanagement/AddressChangeRequestForm";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";
import { Profile } from "./Profile";
import { Notifications } from "./Notifications";

const Overview = () => {
  const { language } = useLanguage();
  const isAm = language === "am";

  const cards = [
    {
      label: isAm ? "የሰራተኛ ብዛት" : "Employees",
      value: "128",
      color: "bg-sky-50",
    },
    {
      label: isAm ? "ፖዚሽኖች" : "Positions",
      value: "22",
      color: "bg-emerald-50",
    },
    {
      label: isAm ? "የሥራ ሂደት" : "Hires Pending",
      value: "8",
      color: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#1e40af] p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-blue-200">
              {isAm ? "የድርጅት ሰዎች አስተዳደር" : "Organization HR Dashboard"}
            </p>
            <h1 className="mt-3 text-3xl font-black">
              {isAm ? "እንኳን ደህና መጡ" : "Welcome Back"}
            </h1>
            <p className="mt-2 text-sm text-blue-100 max-w-2xl">
              {isAm
                ? "እባክዎን ሰራተኞችን ይቅዱ ፣ ቦታዎችን ይከታተሉ እና ሰራተኛ ሰነዶችን ይከታተሉ."
                : "Manage your workforce, assign positions, and review employee records."}
            </p>
          </div>
          <div className="rounded-3xl bg-white/10 border border-white/20 px-5 py-4 text-sm font-semibold">
            {isAm ? "HR Control Center" : "HR Control Center"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`rounded-3xl border ${card.color} border-gray-200 p-6 shadow-sm`}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              {card.label}
            </p>
            <p className="mt-4 text-4xl font-black text-slate-900">
              {card.value}
            </p>
          </div>
        ))}
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
      label: isAm ? "ዋና" : "Overview",
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
      label: isAm ? "ሰራተኛ እንዲሸምጥ" : "Employee Transfer",
      path: "/org-hr-manager/employee-transfer",
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
      title={isAm ? "የHR አስተዳደር" : "HR Manager"}
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

  if (loading) return <div>Loading organization...</div>;
  if (error)
    return (
      <div className="p-6">
        <div className="text-red-600 font-semibold mb-4">{error}</div>
        <button
          onClick={() => navigate("/org-hr-manager")}
          className="px-3 py-1.5 bg-blue-600 text-white rounded"
        >
          Back
        </button>
      </div>
    );

  return (
    <AgenciesManagement
      organizationId={organizationId ?? "0"}
      onBack={() => navigate("/org-hr-manager")}
    />
  );
}
