// filepath: frontend/src/pages/systemAdmin/SystemAdminDashboard.tsx
import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import { DashboardLayout } from "../../components/DashboardLayout";
import { LayoutDashboard, FileCheck, MapPin, Users } from "lucide-react";
import AuditLogViewer from "./audit-logs";
import LocationManager from "./LocationManager";
import { UserManagement } from "../UserManagement";
import { useLanguage } from "../../context/LanguageContext";

const Overview: React.FC = () => {
  const { language } = useLanguage();
  const isAm = language === "am";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-2xl shadow-sm border">
          <h4 className="text-sm font-bold text-gray-500">
            {isAm ? "የስርዓት ሁኔታ" : "System Status"}
          </h4>
          <p className="mt-2 text-2xl font-black text-primary">OK</p>
          <p className="text-xs text-gray-400 mt-1">All services operational</p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-sm border">
          <h4 className="text-sm font-bold text-gray-500">
            {isAm ? "የመዝገብ አይነት" : "Audit Logs"}
          </h4>
          <p className="mt-2 text-2xl font-black text-primary">
            View and monitor
          </p>
          <Link
            to="/system-admin/audit-logs"
            className="inline-block mt-3 text-sm text-blue-600"
          >
            Open Audit Logs →
          </Link>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-sm border">
          <h4 className="text-sm font-bold text-gray-500">
            {isAm ? "የእርምጃ ታሪክ" : "Recent Actions"}
          </h4>
          <p className="mt-2 text-2xl font-black text-primary">—</p>
          <p className="text-xs text-gray-400 mt-1">
            No recent critical actions
          </p>
        </div>
      </div>
    </div>
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
        <Route path="*" element={<Overview />} />
      </Routes>
    </DashboardLayout>
  );
};

export default SystemAdminDashboard;
