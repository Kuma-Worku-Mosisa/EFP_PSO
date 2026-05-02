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
  ShieldAlert,
  Database,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Newspaper,
  Files,
  HelpCircle,
  MessageSquare
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
import { ManageNews } from './ManageNews';
import { ManagePublicContent } from './ManagePublicContent';
import { ManageFAQ } from './ManageFAQ';
import { Communications } from './Communications';
import { Notifications } from './Notifications';

const Overview = () => {
  const { language } = useLanguage();
  const isAm = language === 'am';
  
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');

  const data = [
    { name: isAm ? 'ጥር' : 'Jan', apps: 45 },
    { name: isAm ? 'የካ' : 'Feb', apps: 52 },
    { name: isAm ? 'መጋ' : 'Mar', apps: 38 },
    { name: isAm ? 'ሚያ' : 'Apr', apps: 65 },
    { name: isAm ? 'ግን' : 'May', apps: 48 },
    { name: isAm ? 'ሰኔ' : 'Jun', apps: 59 },
  ];

  const pieData = [
    { name: isAm ? 'ንቁ' : 'Active', value: 400 },
    { name: isAm ? 'ጊዜው ያለፈበት' : 'Expired', value: 80 },
    { name: isAm ? 'የታገደ' : 'Suspended', value: 20 },
  ];

  const recentApps = [
    { name: "Abyssinia Security", type: isAm ? "አዲስ" : "New", date: "Oct 12, 2024", status: isAm ? "በመጠባበቅ ላይ" : "Pending" },
    { name: "Lion Guard Services", type: isAm ? "እድሳት" : "Renewal", date: "Oct 11, 2024", status: isAm ? "ጸድቋል" : "Approved" },
    { name: "Nile Protection", type: isAm ? "አዲስ" : "New", date: "Oct 10, 2024", status: isAm ? "ውድቅ ተደርጓል" : "Rejected" },
    { name: "Eagle Eye Security", type: isAm ? "እድሳት" : "Renewal", date: "Oct 09, 2024", status: isAm ? "በመጠባበቅ ላይ" : "Pending" },
  ];

  const filteredApps = recentApps.filter(app => {
    const statusMatch = filterStatus === 'All' || app.status === filterStatus;
    const typeMatch = filterType === 'All' || app.type === filterType;
    return statusMatch && typeMatch;
  });

  const COLORS = ['#003366', '#FFD700', '#EF4444'];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: isAm ? "የተመዘገቡ ኤጀንሲዎች" : "Registered Agencies", value: "524", icon: <ShieldCheck className="w-6 h-6 text-primary" />, color: "bg-blue-50" },
          { label: isAm ? "የደህንነት ሰራተኞች" : "Security Personnel", value: "25,482", icon: <Users className="w-6 h-6 text-amber-500" />, color: "bg-amber-50" },
          { label: isAm ? "ንቁ ፈቃዶች" : "Active Licenses", value: "482", icon: <CheckCircle className="w-6 h-6 text-green-500" />, color: "bg-green-50" },
          { label: isAm ? "የተሸፈኑ ክልሎች" : "Regions Covered", value: "11", icon: <Map className="w-6 h-6 text-purple-500" />, color: "bg-purple-50" },
          { label: isAm ? "በመጠባበቅ ላይ ያሉ" : "Total Pending", value: "142", icon: <Clock className="w-6 h-6 text-amber-500" />, color: "bg-amber-50" },
          { label: isAm ? "ንቁ ያልሆኑ ፈቃዶች" : "Inactive Licenses", value: "38", icon: <ShieldAlert className="w-6 h-6 text-red-400" />, color: "bg-red-50" },
          { label: isAm ? "ውድቅ የተደረጉ" : "Rejected Applications", value: "24", icon: <XCircle className="w-6 h-6 text-red-500" />, color: "bg-red-50" },
          { label: isAm ? "ጠቅላላ ገቢ" : "Total Revenue", value: "ETB 14.2M", icon: <BarChart3 className="w-6 h-6 text-primary" />, color: "bg-blue-50" },
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
          <h3 className="text-lg font-bold text-primary">{isAm ? 'የማመልከቻዎች አዝማሚያ' : 'Applications Trend'}</h3>
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
          <h3 className="text-lg font-bold text-primary">{isAm ? 'የፈቃድ ስርጭት' : 'License Distribution'}</h3>
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
        <div className="p-8 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col space-y-1">
            <h3 className="text-lg font-bold text-primary">{isAm ? 'የቅርብ ጊዜ ማመልከቻዎች' : 'Recent Applications'}</h3>
            <p className="text-xs text-gray-400 font-medium">{isAm ? 'የማመልከቻዎችን ዝርዝር ይከታተሉ' : 'Track and review the latest commission submissions'}</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isAm ? 'ሁኔታ:' : 'Status:'}</span>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs font-bold px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="All">{isAm ? 'ሁሉም' : 'All'}</option>
                <option value={isAm ? "በመጠባበቅ ላይ" : "Pending"}>{isAm ? "በመጠባበቅ ላይ" : "Pending"}</option>
                <option value={isAm ? "ጸድቋል" : "Approved"}>{isAm ? "ጸድቋል" : "Approved"}</option>
                <option value={isAm ? "ውድቅ ተደርጓል" : "Rejected"}>{isAm ? "ውድቅ ተደርጓል" : "Rejected"}</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isAm ? 'ዓይነት:' : 'Type:'}</span>
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="text-xs font-bold px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="All">{isAm ? 'ሁሉም' : 'All'}</option>
                <option value={isAm ? "አዲስ" : "New"}>{isAm ? "አዲስ" : "New"}</option>
                <option value={isAm ? "እድሳት" : "Renewal"}>{isAm ? "እድሳት" : "Renewal"}</option>
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
                <th className="px-8 py-4 font-black">{isAm ? 'የኤጀንሲ ስም' : 'Agency Name'}</th>
                <th className="px-8 py-4 font-black">{isAm ? 'ዓይነት' : 'Type'}</th>
                <th className="px-8 py-4 font-black">{isAm ? 'ቀን' : 'Date'}</th>
                <th className="px-8 py-4 font-black">{isAm ? 'ሁኔታ' : 'Status'}</th>
                <th className="px-8 py-4 font-black text-right">{isAm ? 'እርምጃዎች' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence mode="popLayout">
                {filteredApps.map((app, i) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={app.name} 
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-8 py-4 font-bold text-primary text-sm">{app.name}</td>
                    <td className="px-8 py-4 text-xs font-medium text-gray-500">{app.type}</td>
                    <td className="px-8 py-4 text-xs font-medium text-gray-400">{app.date}</td>
                    <td className="px-8 py-4">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        app.status === (isAm ? 'ጸድቋል' : 'Approved') ? 'bg-green-100 text-green-700' : 
                        app.status === (isAm ? 'በመጠባበቅ ላይ' : 'Pending') ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <button className="text-secondary hover:text-primary font-black text-[10px] uppercase tracking-widest transition-colors">{isAm ? 'ገምግም' : 'Review'}</button>
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
              <p className="text-sm font-bold text-gray-400">{isAm ? 'ምንም አይነት ማመልከቻ አልተገኘም' : 'No applications found matching your filters'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const AdminDashboard = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const isAm = language === 'am';
  
  const userRole = user?.role || 'admin';

  const sidebarItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: t.dashboard.overview, path: "/admin" },
    { icon: <Users className="w-5 h-5" />, label: t.dashboard.agencies, path: "/admin/agencies" },
    { icon: <FileCheck className="w-5 h-5" />, label: t.dashboard.applications, path: "/admin/applications" },
    { icon: <ShieldCheck className="w-5 h-5" />, label: t.dashboard.licenseManagement, path: "/admin/licenses" },
    { icon: <Map className="w-5 h-5" />, label: t.dashboard.gps, path: "/admin/gps" },
    { icon: <BarChart3 className="w-5 h-5" />, label: t.dashboard.reports, path: "/admin/reports" },
    { icon: <FileCheck className="w-5 h-5" />, label: t.dashboard.hrmsReports, path: "/admin/hrms-reports" },
    
    // Content Management Section (Grouped logically)
    { icon: <Newspaper className="w-5 h-5" />, label: isAm ? "ዜና እና ማስታወቂያ" : "News & Announcements", path: "/admin/news" },
    { icon: <Files className="w-5 h-5" />, label: isAm ? "የህዝብ ሰነዶች" : "Public Documents", path: "/admin/content" },
    { icon: <HelpCircle className="w-5 h-5" />, label: isAm ? "FAQ አስተዳዳሪ" : "FAQ Management", path: "/admin/faq-manage" },
    { icon: <MessageSquare className="w-5 h-5" />, label: isAm ? "ኮሙኒኬሽን" : "Communications", path: "/admin/communications" },
    
    { icon: <Settings className="w-5 h-5" />, label: t.dashboard.settings, path: "/admin/settings" },
    ...(userRole === 'super_admin' ? [
      { icon: <Database className="w-5 h-5" />, label: t.dashboard.backups, path: "/admin/backups" },
      { icon: <Shield className="w-5 h-5" />, label: t.dashboard.permissions, path: "/admin/permissions" },
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
        <Route path="settings" element={<AdminSettings />} />
        <Route path="news" element={<ManageNews />} />
        <Route path="content" element={<ManagePublicContent />} />
        <Route path="faq-manage" element={<ManageFAQ />} />
        <Route path="communications" element={<Communications />} />
        <Route path="notifications" element={<Notifications />} />
        
        {/* Strictly Super Admin internal tools */}
        {userRole === 'super_admin' && (
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
