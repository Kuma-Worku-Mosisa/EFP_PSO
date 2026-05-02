import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { 
  LayoutDashboard, 
  FilePlus, 
  RefreshCw, 
  Search, 
  Award, 
  LogOut, 
  User, 
  Bell,
  Shield,
  Settings,
  ArrowLeft,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface SidebarItem {
  icon?: React.ReactNode;
  label: string;
  path?: string;
  isHeader?: boolean;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarItems: SidebarItem[];
  title: string;
}

export const DashboardLayout = ({ children, sidebarItems, title }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();

  // Specialized notifications based on role
  const [notifications, setNotifications] = useState(() => {
    if (user?.role === 'agency') {
      return [
        { id: '1', title: language === 'am' ? 'ፈቃድ እድሳት ማሳሰቢያ' : 'License Renewal Reminder', message: language === 'am' ? 'የእርስዎ የንግድ ፈቃድ በ30 ቀናት ውስጥ ይቆያል።' : 'Your operating license expires in 30 days.', time: '2h ago', read: false, type: 'warning' },
        { id: '2', title: language === 'am' ? 'ማመልከቻ ጸድቋል' : 'Application Approved', message: language === 'am' ? 'ለአዲስ ቅርንጫፍ ያቀረቡት ማመልከቻ ጸድቋል።' : 'Your new branch application is approved.', time: '5h ago', read: false, type: 'success' },
        { id: '3', title: language === 'am' ? 'አስተያየት ተሰጥቷል' : 'Admin Comment', message: language === 'am' ? 'አስተዳዳሪው በሪፖርቱ ላይ አስተያየት ሰጥተዋል።' : 'Admin left a comment on your report.', time: '1d ago', read: true, type: 'message' },
      ];
    } else {
      return [
        { id: 'a1', title: language === 'am' ? 'አዲስ አመልካች ተመዝግቧል' : 'New Applicant Registered', message: language === 'am' ? '"አቢሲኒያ ሴኩሪቲ" አዲስ ተመዝግቧል።' : '"Abyssinia Security" just registered.', time: '5m ago', read: false, type: 'info' },
        { id: 'a2', title: language === 'am' ? 'ይፋዊ ደብዳቤ ገብቷል' : 'Formal Letter Submitted', message: language === 'am' ? '"አንበሳ ጥበቃ" ደብዳቤ አስገብቷል።' : 'Lion Guard submitted a letter.', time: '1h ago', read: false, type: 'info' },
        { id: 'a4', title: language === 'am' ? 'የወንጀል ሪፖርት ቀርቧል' : 'Criminal Report Received', message: language === 'am' ? 'የወንጀል ሪፖርት ተልኳል።' : 'A criminal alert was reported.', time: '6h ago', read: false, type: 'error' },
      ];
    }
  });

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleViewAll = () => {
    setShowNotifications(false);
    const basePath = user?.role === 'agency' ? '/dashboard' : (user?.role === 'super_admin' ? '/super-admin/dashboard' : '/admin');
    navigate(`${basePath}/notifications`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-[#001835] text-white transition-all duration-300 flex flex-col z-50 h-full",
          isSidebarOpen ? "w-72" : "w-20"
        )}
      >
        <div className="h-20 flex items-center px-6 border-b border-white/10 flex-shrink-0">
          <Shield className="text-secondary w-8 h-8 flex-shrink-0" />
          {isSidebarOpen && (
            <span className="ml-3 font-bold text-lg tracking-tight whitespace-nowrap">FP-LICENSING</span>
          )}
        </div>

        <nav className="flex-grow py-8 px-4 space-y-2 overflow-y-auto sidebar-scrollbar">
          {sidebarItems.map((item, idx) => {
            if (item.isHeader) {
              return isSidebarOpen ? (
                <div key={`header-${idx}`} className="pt-6 pb-2 px-3">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{item.label}</p>
                </div>
              ) : (
                <div key={`header-${idx}`} className="h-px bg-white/10 my-4" />
              );
            }

            return (
              <Link
                key={item.path || idx}
                to={item.path || '#'}
                className={cn(
                  "flex items-center p-3 rounded-xl transition-all group",
                  location.pathname === item.path 
                    ? "bg-secondary text-primary font-bold shadow-lg scale-105 ml-2" 
                    : "hover:bg-white/10 text-gray-300"
                )}
              >
                <div className={cn("flex-shrink-0", isSidebarOpen ? "mr-4" : "mx-auto")}>
                  {item.icon}
                </div>
                {isSidebarOpen && <span className="text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className={cn(
              "flex items-center w-full p-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all",
              !isSidebarOpen && "justify-center"
            )}
          >
            <LogOut className={cn("w-5 h-5", isSidebarOpen && "mr-4")} />
            {isSidebarOpen && <span className="text-sm font-medium">{language === 'am' ? 'ውጣ' : 'Logout'}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-grow flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b flex items-center justify-between px-8 z-40 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-primary/5 rounded-xl text-primary transition-all group"
            >
              {isSidebarOpen ? <PanelLeftClose className="w-6 h-6" /> : <PanelLeft className="w-6 h-6" />}
            </button>

            <div className="h-8 w-px bg-gray-200" />

            <div>
              <h1 className="text-xl font-bold text-primary">{title}</h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                {new Date().toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setLanguage('en')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  language === 'en' ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-primary"
                )}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('am')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  language === 'am' ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-primary"
                )}
              >
                አማ
              </button>
            </div>

            <div className="relative">
              <button 
                onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
                className={cn(
                  "p-2 rounded-full relative transition-all",
                  showNotifications ? "bg-primary text-white" : "hover:bg-gray-100 text-gray-500"
                )}
              >
                <Bell className="w-5 h-5" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                  >
                    <div className="p-4 border-b flex justify-between items-center">
                      <h3 className="font-bold text-primary">{language === 'am' ? 'ማሳወቂያዎች' : 'Notifications'}</h3>
                      <button 
                        onClick={handleClearAll}
                        className="text-[10px] text-accent font-bold uppercase tracking-wider hover:underline"
                      >
                        {language === 'am' ? 'ሁሉንም አጽዳ' : 'Clear All'}
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div key={n.id} className={cn("p-4 border-b hover:bg-gray-50 transition-all cursor-pointer", !n.read && "bg-blue-50/50")}>
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="text-xs font-bold text-primary">{n.title}</h4>
                              <span className="text-[10px] text-gray-400">{n.time}</span>
                            </div>
                            <p className="text-[11px] text-gray-500 line-clamp-2">{n.message}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-gray-400 text-xs italic">
                          {language === 'am' ? 'ምንም ማሳወቂያ የለም' : 'No notifications'}
                        </div>
                      )}
                    </div>
                    <div className="p-3 text-center border-t">
                      <button 
                        onClick={handleViewAll}
                        className="text-xs font-bold text-accent hover:underline w-full"
                      >
                        {language === 'am' ? 'ሁሉንም ተመልከት' : 'View All Notifications'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="relative flex items-center space-x-3 pl-6 border-l">
              <div 
                className="flex items-center space-x-3 cursor-pointer group"
                onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-primary group-hover:text-accent transition-all">{user?.name || "User"}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{user?.role === 'agency' ? (language === 'am' ? 'የኤጀንሲ ስራ አስኪያጅ' : 'Agency Manager') : (language === 'am' ? 'ፖሊስ አስተዳዳሪ' : 'Police Admin')}</p>
                </div>
                <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center text-primary font-black border-2 border-secondary group-hover:scale-105 transition-all overflow-hidden shadow-sm">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user?.initials || "U"
                  )}
                </div>
              </div>

              <AnimatePresence>
                {showProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-14 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                  >
                    <div className="p-4 bg-primary text-white">
                      <p className="text-xs font-bold truncate">{user?.name}</p>
                      <p className="text-[10px] opacity-70 truncate">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      <Link 
                        to={user?.role === 'agency' ? '/dashboard/profile' : (user?.role === 'super_admin' ? '/super-admin/dashboard/profile' : '/admin/profile')}
                        onClick={() => setShowProfile(false)}
                        className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-all text-sm text-gray-600"
                      >
                        <User className="w-4 h-4" />
                        <span>{language === 'am' ? 'የግል መገለጫ' : 'My Profile'}</span>
                      </Link>
                      <div className="h-px bg-gray-100 my-2" />
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-red-50 transition-all text-sm text-red-600 font-bold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{language === 'am' ? 'ውጣ' : 'Logout'}</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-grow overflow-y-auto flex flex-col custom-scrollbar bg-slate-50/50">
          <div className="flex-grow p-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </div>

          {/* Footer Back Button */}
          <footer className="p-8 pt-0 mt-auto">
            <div className="border-t border-gray-100 pt-8 flex items-center justify-between">
              <button 
                onClick={() => navigate(-1)}
                className="group flex items-center space-x-3 bg-white border border-gray-200 px-6 py-3 rounded-2xl shadow-sm hover:shadow-md hover:border-primary transition-all active:scale-95"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <ArrowLeft className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
                    {language === 'am' ? 'ወደ ኋላ' : 'Go Back'}
                  </p>
                  <p className="text-sm font-black text-primary leading-none">
                    {language === 'am' ? 'ተመለስ' : 'Back to Previous'}
                  </p>
                </div>
              </button>
              
              <div className="hidden lg:block">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-right">
                  Ethiopian Federal Police Commission<br />
                  <span className="text-primary opacity-60">Licensing & Regulation Portal v1.0</span>
                </p>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};
