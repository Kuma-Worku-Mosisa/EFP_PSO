import React, { useState, cloneElement, ReactElement } from 'react';
import { Routes, Route } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { 
  LayoutDashboard, 
  Users, 
  FileCheck, 
  Map, 
  BarChart3, 
  Settings,
  Shield,
  ShieldCheck,
  Database,
  Clock,
  CheckCircle,
  XCircle,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
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
  Cell
} from 'recharts';

import { GPSTracking } from './GPSTracking';
import { AgenciesManagement } from './AgenciesManagement';
import { ApplicationsReview } from './ApplicationsReview';
import { AdminReports } from './AdminReports';
import { AdminSettings } from './AdminSettings';
import { LicenseManagement } from './LicenseManagement';
import { HRMSReports } from './HRMSReports';
import { UserManagement } from './UserManagement';
import { BackupRecovery } from './BackupRecovery';
import { PermissionsManagement } from './PermissionsManagement';
import { Profile } from './Profile';

const Overview = () => {
  const { t, language } = useLanguage();
  const data = [
    { name: language === 'am' ? 'ጥር' : 'Jan', apps: 45 },
    { name: language === 'am' ? 'የካ' : 'Feb', apps: 52 },
    { name: language === 'am' ? 'መጋ' : 'Mar', apps: 38 },
    { name: language === 'am' ? 'ሚያ' : 'Apr', apps: 65 },
    { name: language === 'am' ? 'ግን' : 'May', apps: 48 },
    { name: language === 'am' ? 'ሰኔ' : 'Jun', apps: 59 },
  ];

  const pieData = [
    { name: language === 'am' ? 'ንቁ' : 'Active', value: 400 },
    { name: language === 'am' ? 'ጊዜው ያለፈበት' : 'Expired', value: 80 },
    { name: language === 'am' ? 'የታገደ' : 'Suspended', value: 20 },
  ];

  const COLORS = ['#003366', '#FFD700', '#EF4444'];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: language === 'am' ? "የተመዘገቡ ኤጀንሲዎች" : "Registered Agencies", value: "524", icon: <ShieldCheck className="w-6 h-6 text-primary" />, color: "bg-blue-50" },
          { label: language === 'am' ? "የደህንነት ሰራተኞች" : "Security Personnel", value: "25,482", icon: <Users className="w-6 h-6 text-amber-500" />, color: "bg-amber-50" },
          { label: language === 'am' ? "ንቁ ፈቃዶች" : "Active Licenses", value: "482", icon: <CheckCircle className="w-6 h-6 text-green-500" />, color: "bg-green-50" },
          { label: language === 'am' ? "የተሸፈኑ ክልሎች" : "Regions Covered", value: "11", icon: <Map className="w-6 h-6 text-purple-500" />, color: "bg-purple-50" },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4 transition-all hover:shadow-xl"
          >
            <div className={`p-4 rounded-2xl ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-primary tracking-tight">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-lg font-bold text-primary">{language === 'am' ? 'የማመልከቻዎች አዝማሚያ' : 'Applications Trend'}</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f3f4f6'}} />
                <Bar dataKey="apps" fill="#003366" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-lg font-bold text-primary">{language === 'am' ? 'የፈቃድ ስርጭት' : 'License Distribution'}</h3>
          <div className="h-[300px] flex items-center justify-center">
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
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b flex items-center justify-between">
          <h3 className="text-lg font-bold text-primary">{language === 'am' ? 'የቅርብ ጊዜ ማመልከቻዎች' : 'Recent Applications'}</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder={language === 'am' ? "ኤጀንሲ ይፈልጉ..." : "Search agency..."} className="pl-10 pr-4 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-8 py-4 font-bold">{language === 'am' ? 'የኤጀንሲ ስም' : 'Agency Name'}</th>
                <th className="px-8 py-4 font-bold">{language === 'am' ? 'ዓይነት' : 'Type'}</th>
                <th className="px-8 py-4 font-bold">{language === 'am' ? 'ቀን' : 'Date'}</th>
                <th className="px-8 py-4 font-bold">{language === 'am' ? 'ሁኔታ' : 'Status'}</th>
                <th className="px-8 py-4 font-bold text-right">{language === 'am' ? 'እርምጃዎች' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { name: "Abyssinia Security", type: language === 'am' ? "አዲስ" : "New", date: "Oct 12, 2024", status: language === 'am' ? "በመጠባበቅ ላይ" : "Pending" },
                { name: "Lion Guard Services", type: language === 'am' ? "እድሳት" : "Renewal", date: "Oct 11, 2024", status: language === 'am' ? "ጸድቋል" : "Approved" },
                { name: "Nile Protection", type: language === 'am' ? "አዲስ" : "New", date: "Oct 10, 2024", status: language === 'am' ? "ውድቅ ተደርጓል" : "Rejected" },
                { name: "Eagle Eye Security", type: language === 'am' ? "እድሳት" : "Renewal", date: "Oct 09, 2024", status: language === 'am' ? "በመጠባበቅ ላይ" : "Pending" },
              ].map((app, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-4 font-bold text-primary text-sm">{app.name}</td>
                  <td className="px-8 py-4 text-sm text-gray-600">{app.type}</td>
                  <td className="px-8 py-4 text-sm text-gray-600">{app.date}</td>
                  <td className="px-8 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      app.status === (language === 'am' ? 'ጸድቋል' : 'Approved') ? 'bg-green-100 text-green-700' : 
                      app.status === (language === 'am' ? 'በመጠባበቅ ላይ' : 'Pending') ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <button className="text-primary font-bold text-xs hover:underline">{language === 'am' ? 'ገምግም' : 'Review'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const AdminDashboard = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const userRole = user?.role || 'admin';

  const sidebarItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: t.dashboard.overview, path: "/admin" },
    { icon: <Users className="w-5 h-5" />, label: t.dashboard.agencies, path: "/admin/agencies" },
    { icon: <FileCheck className="w-5 h-5" />, label: t.dashboard.applications, path: "/admin/applications" },
    { icon: <ShieldCheck className="w-5 h-5" />, label: t.dashboard.licenseManagement, path: "/admin/licenses" },
    { icon: <Map className="w-5 h-5" />, label: t.dashboard.gps, path: "/admin/gps" },
    { icon: <BarChart3 className="w-5 h-5" />, label: t.dashboard.reports, path: "/admin/reports" },
    { icon: <FileCheck className="w-5 h-5" />, label: t.dashboard.hrmsReports, path: "/admin/hrms-reports" },
    { icon: <Database className="w-5 h-5" />, label: t.dashboard.backups, path: "/admin/backups" },
    { icon: <Shield className="w-5 h-5" />, label: t.dashboard.permissions, path: "/admin/permissions" },
    { icon: <Settings className="w-5 h-5" />, label: t.dashboard.settings, path: "/admin/settings" },
    ...(userRole === 'super_admin' ? [
      { icon: <Users className="w-5 h-5" />, label: t.dashboard.userManagement, path: "/admin/users" }
    ] : []),
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems} title={t.dashboard.adminDashboard}>
      <Routes>
        <Route index element={<Overview />} />
        <Route path="agencies" element={<AgenciesManagement />} />
        <Route path="applications" element={<ApplicationsReview />} />
        <Route path="licenses" element={<LicenseManagement />} />
        <Route path="gps" element={<GPSTracking />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="hrms-reports" element={<HRMSReports />} />
        <Route path="backups" element={<BackupRecovery />} />
        <Route path="permissions" element={<PermissionsManagement />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="profile" element={<Profile />} />
      </Routes>
    </DashboardLayout>
  );
};
