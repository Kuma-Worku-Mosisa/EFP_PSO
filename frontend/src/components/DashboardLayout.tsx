import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { resolveBackendAssetUrl } from "../lib/api";
import {
  LogOut,
  User,
  Shield,
  ArrowLeft,
  PanelLeftClose,
  PanelLeft,
  Key,
  Menu,
  X,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import ChangePasswordModal from "./ChangePasswordModal";
import { AutoDismissToast, ToastType } from "./AutoDismissToast";
import NotificationDropdown from "./notification-dropdown";

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

export const DashboardLayout = ({
  children,
  sidebarItems,
  title,
}: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const [isChangeOpen, setIsChangeOpen] = useState(false);
  const [toast, setToast] = useState<{
    isOpen: boolean;
    type: ToastType;
    message: string;
  }>({ isOpen: false, type: "success", message: "" });

  // Logic to determine the primary role for UI display
  const isSuperAdmin = user?.roles.includes("super_admin");
  const isLicensingAuthority = user?.roles.includes("licensing_authority");
  const isAdmin = !isLicensingAuthority && user?.roles.includes("admin");
  const isAgency = user?.roles.includes("agency");
  const isFieldReviewer = user?.roles.includes("field_reviewer");

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden print:block print:bg-white">
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar — desktop: always visible, mobile: slide-in drawer */}
      <aside
        className={cn(
          "bg-[#001835] text-white flex flex-col z-50 h-full print:hidden transition-all duration-300 hidden lg:flex",
          isSidebarOpen ? "lg:w-72" : "lg:w-20",
        )}
      >
        <div className="h-20 flex items-center px-6 border-b border-white/10 flex-shrink-0">
          <Shield className="text-secondary w-8 h-8 flex-shrink-0" />
          {isSidebarOpen && (
            <span className="ml-3 font-bold text-lg tracking-tight whitespace-nowrap uppercase">
              EFP-PSO Portal
            </span>
          )}
        </div>

        <nav className="flex-grow py-8 px-4 space-y-2 overflow-y-auto sidebar-scrollbar">
          {sidebarItems.map((item, idx) => {
            if (item.isHeader) {
              return isSidebarOpen ? (
                <div key={`header-${idx}`} className="pt-6 pb-2 px-3">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                    {item.label}
                  </p>
                </div>
              ) : (
                <div key={`header-${idx}`} className="h-px bg-white/10 my-4" />
              );
            }
            return (
              <Link
                key={item.path || idx}
                to={item.path || "#"}
                className={cn(
                  "flex items-center p-3 rounded-xl transition-all group",
                  location.pathname === item.path
                    ? "bg-secondary text-primary font-bold shadow-lg scale-105 ml-2"
                    : "hover:bg-white/10 text-gray-300",
                )}
              >
                <div
                  className={cn(
                    "flex-shrink-0",
                    isSidebarOpen ? "mr-4" : "mx-auto",
                  )}
                >
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
              !isSidebarOpen && "justify-center",
            )}
          >
            <LogOut className={cn("w-5 h-5", isSidebarOpen && "mr-4")} />
            {isSidebarOpen && (
              <span className="text-sm font-medium">
                {language === "am" ? "ውጣ" : "Logout"}
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed top-0 left-0 h-full w-72 bg-[#001835] text-white flex flex-col z-50 lg:hidden print:hidden"
          >
            <div className="h-20 flex items-center justify-between px-6 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-3">
                <Shield className="text-secondary w-8 h-8 flex-shrink-0" />
                <span className="font-bold text-lg tracking-tight uppercase">
                  EFP-PSO Portal
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-all"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-grow py-8 px-4 space-y-2 overflow-y-auto sidebar-scrollbar">
              {sidebarItems.map((item, idx) => {
                if (item.isHeader) {
                  return (
                    <div key={`header-${idx}`} className="pt-6 pb-2 px-3">
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                        {item.label}
                      </p>
                    </div>
                  );
                }
                return (
                  <Link
                    key={item.path || idx}
                    to={item.path || "#"}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center p-3 rounded-xl transition-all",
                      location.pathname === item.path
                        ? "bg-secondary text-primary font-bold shadow-lg"
                        : "hover:bg-white/10 text-gray-300",
                    )}
                  >
                    <div className="flex-shrink-0 mr-4">{item.icon}</div>
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-white/10">
              <button
                onClick={handleLogout}
                className="flex items-center w-full p-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
              >
                <LogOut className="w-5 h-5 mr-4" />
                <span className="text-sm font-medium">
                  {language === "am" ? "ውጣ" : "Logout"}
                </span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-grow flex flex-col overflow-hidden min-w-0">
        <header className="h-16 lg:h-20 bg-white border-b flex items-center justify-between px-4 lg:px-8 z-40 flex-shrink-0 print:hidden">
          <div className="flex items-center space-x-3 lg:space-x-4">
            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 hover:bg-primary/5 rounded-xl text-primary transition-all lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Desktop sidebar toggle */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-primary/5 rounded-xl text-primary transition-all hidden lg:flex"
            >
              {isSidebarOpen ? (
                <PanelLeftClose className="w-6 h-6" />
              ) : (
                <PanelLeft className="w-6 h-6" />
              )}
            </button>

            <div className="h-8 w-px bg-gray-200" />
            <div>
              <h1 className="text-base lg:text-xl font-bold text-primary truncate max-w-[160px] sm:max-w-none">
                {title}
              </h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest hidden sm:block">
                {new Date().toLocaleDateString(
                  language === "am" ? "am-ET" : "en-US",
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  },
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 lg:space-x-6">
            {/* Language Switcher */}
            <div className="flex items-center bg-gray-100 rounded-xl p-1">
              {["en", "am"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang as "en" | "am")}
                  className={cn(
                    "px-2 lg:px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                    language === lang
                      ? "bg-white text-primary shadow-sm"
                      : "text-gray-500",
                  )}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Live Synchronized Notification Dropdown Engine */}
            {user?.id && (
              <NotificationDropdown currentLang={language} userId={user.id} />
            )}

            {/* Profile Dropdown */}
            <div className="relative flex items-center space-x-3 pl-3 lg:pl-6 border-l">
              <div
                className="flex items-center space-x-2 lg:space-x-3 cursor-pointer group"
                onClick={() => {
                  setShowProfile(!showProfile);
                }}
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-primary truncate max-w-[120px] lg:max-w-[150px]">
                    {user?.fullName || "User"}
                  </p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    {isSuperAdmin
                      ? "Super Admin"
                      : isLicensingAuthority
                        ? "Licensing Authority"
                        : isFieldReviewer
                          ? "Field Reviewer"
                          : isAdmin
                            ? "Police Admin"
                            : "Agency Manager"}
                  </p>
                </div>
                <div className="w-9 h-9 lg:w-10 lg:h-10 bg-primary/5 rounded-full flex items-center justify-center text-primary font-black border-2 border-secondary overflow-hidden">
                  {user?.avatar ? (
                    <img
                      src={resolveBackendAssetUrl(user.avatar)}
                      alt={
                        language === "am"
                          ? `${user?.fullName || "ተጠቃሚ"} ፕሮፋይል ፎቶ`
                          : `${user?.fullName || "User"} profile photo`
                      }
                      title={
                        language === "am"
                          ? `${user?.fullName || "ተጠቃሚ"} ፕሮፋይል ፎቶ`
                          : `${user?.fullName || "User"} profile photo`
                      }
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.initials
                  )}
                </div>
              </div>

              <AnimatePresence>
                {showProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-14 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                  >
                    <div className="p-4 bg-primary text-white">
                      <p className="text-xs font-bold truncate">
                        {user?.fullName}
                      </p>
                      <p className="text-[10px] opacity-70 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <div className="p-2">
                      <Link
                        to={
                          isSuperAdmin
                            ? "/super-admin/profile"
                            : isLicensingAuthority
                              ? "/licensing-authority/profile"
                              : isFieldReviewer
                                ? "/field-reviewer/profile"
                                : isAgency
                                  ? "/dashboard/profile"
                                  : "/admin/profile"
                        }
                        onClick={() => setShowProfile(false)}
                        className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 text-sm text-gray-600"
                      >
                        <User className="w-4 h-4" />
                        <span>
                          {language === "am" ? "የግል መገለጫ" : "My Profile"}
                        </span>
                      </Link>
                      <button
                        onClick={() => {
                          setShowProfile(false);
                          setIsChangeOpen(true);
                        }}
                        className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 text-sm text-gray-600"
                      >
                        <Key className="w-4 h-4" />
                        <span>
                          {language === "am"
                            ? "የይለፍ ቃል ቀይር"
                            : "Change Password"}
                        </span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-red-50 text-sm text-red-600 font-bold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{language === "am" ? "ውጣ" : "Logout"}</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <ChangePasswordModal
          isOpen={isChangeOpen}
          onClose={() => setIsChangeOpen(false)}
          onSuccess={() =>
            setToast({
              isOpen: true,
              type: "success",
              message:
                language === "am"
                  ? "የይለፍ ቃል ቀይር ተደርጓል"
                  : "Password changed successfully",
            })
          }
        />

        <AutoDismissToast
          isOpen={toast.isOpen}
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ ...toast, isOpen: false })}
        />

        <main className="flex-grow overflow-y-auto flex flex-col custom-scrollbar bg-slate-50/50 print:bg-white print:overflow-visible">
          <div className="flex-grow p-4 lg:p-8 print:p-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {children}
            </motion.div>
          </div>

          <footer className="p-4 lg:p-8 pt-0 mt-auto print:hidden">
            <div className="border-t border-gray-100 pt-6 lg:pt-8 flex items-center justify-between">
              <button
                onClick={() => navigate(-1)}
                className="group flex items-center space-x-3 bg-white border border-gray-200 px-4 lg:px-6 py-3 rounded-2xl shadow-sm hover:border-primary transition-all"
              >
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    {language === "am" ? "ወደ ኋላ" : "Go Back"}
                  </p>
                  <p className="text-sm font-black text-primary">
                    {language === "am" ? "ተመለስ" : "Back to Previous"}
                  </p>
                </div>
              </button>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-right hidden sm:block">
                Ethiopian Federal Police Commission
                <br />
                <span className="text-primary opacity-60">
                  Licensing & Regulation Portal v1.0
                </span>
              </p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};
