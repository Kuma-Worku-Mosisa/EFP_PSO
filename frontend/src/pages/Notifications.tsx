import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import {
  Bell,
  Search,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Filter,
  CheckCheck,
  MoreVertical,
  Mail,
  UserPlus,
  FileText,
  FilePlus,
  RefreshCw,
  MessageSquare,
  ShieldAlert,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "info" | "success" | "warning" | "error" | "message";
  category: "license" | "application" | "report" | "system" | "user";
}

export const Notifications = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const isAm = language === "am";

  // Mock data based on role as requested
  const getInitialNotifications = (): Notification[] => {
    if (user?.role === "agency") {
      return [
        {
          id: "1",
          title: isAm ? "ፈቃድ እድሳት ማሳሰቢያ" : "License Renewal Reminder",
          message: isAm
            ? "የእርስዎ የንግድ ፈቃድ በ30 ቀናት ውስጥ ይቆያል። እባክዎን ቀድመው ያድሱ።"
            : "Your operating license expires in 30 days. Please renew early to avoid service interruption.",
          time: "2h ago",
          read: false,
          type: "warning",
          category: "license",
        },
        {
          id: "2",
          title: isAm ? "ማመልከቻ ጸድቋል" : "Application Approved",
          message: isAm
            ? "ለአዲስ ቅርንጫፍ ያቀረቡት ማመልከቻ በፌዴራል ፖሊስ ተቀባይነት አግኝቷል።"
            : "Your application for a new branch office has been formally approved by the Federal Police.",
          time: "5h ago",
          read: false,
          type: "success",
          category: "application",
        },
        {
          id: "3",
          title: isAm ? "አስተያየት ተሰጥቷል" : "Admin Comment",
          message: isAm
            ? 'በአስተዳዳሪው በኩል በገባው የሰው ኃይል ሪፖርት ላይ አስተያየት ተሰጥቷል - "እባክዎን ተጨማሪ መረጃ ይጨምሩ"'
            : 'Admin left a comment on your HR report: "Please provide more details on the training certifications."',
          time: "1d ago",
          read: true,
          type: "message",
          category: "system",
        },
        {
          id: "4",
          title: isAm ? "ማመልከቻ ውድቅ ተደርጓል" : "Application Rejected",
          message: isAm
            ? "የፈቃድ እድሳት ጥያቄዎ አስፈላጊ ሰነዶች በመጉደላቸው ምክንያት ውድቅ ተደርጓል።"
            : "Your renewal request was rejected due to missing technical evaluation documents.",
          time: "2d ago",
          read: true,
          type: "error",
          category: "license",
        },
      ];
    } else {
      // Federal Police Admin notifications
      return [
        {
          id: "a1",
          title: isAm ? "አዲስ አመልካች ተመዝግቧል" : "New Applicant Registered",
          message: isAm
            ? '"አቢሲኒያ ሴኩሪቲ" አዲስ ተመዝግቦ የፈቃድ መጠባበቅ ላይ ነው።'
            : '"Abyssinia Security" just registered and is awaiting initial verification.',
          time: "5m ago",
          read: false,
          type: "info",
          category: "user",
        },
        {
          id: "a2",
          title: isAm ? "ይፋዊ ደብዳቤ ገብቷል" : "Formal Letter Submitted",
          message: isAm
            ? '"አንበሳ ጥበቃ" አዲስ ይፋዊ ደብዳቤ አስገብቷል።'
            : "Lion Guard Services has submitted a new formal communication letter.",
          time: "1h ago",
          read: false,
          type: "info",
          category: "application",
        },
        {
          id: "a3",
          title: isAm ? "አዲስ ማመልከቻ ገብቷል" : "New Application Submitted",
          message: isAm
            ? "አዲስ የደህንነት ኤጀንሲ ፈቃድ ማመልከቻ ገብቷል።"
            : "A new specialized security agency application has been submitted for review.",
          time: "3h ago",
          read: false,
          type: "info",
          category: "application",
        },
        {
          id: "a4",
          title: isAm ? "የወንጀል ሪፖርት ቀርቧል" : "Criminal Report Received",
          message: isAm
            ? 'ከ"ናይል ፕሮቴክሽን" የሰራተኛ የወንጀል ሪፖርት ተልኳል።'
            : "A criminal record alert regarding a dismissed personnel was reported by Nile Protection.",
          time: "6h ago",
          read: false,
          type: "error",
          category: "report",
        },
        {
          id: "a5",
          title: isAm ? "የHRMS ሪፖርት ገብቷል" : "HRMS Report Submitted",
          message: isAm
            ? 'ከ"ኢግል አይ" ሳምንታዊ የሰው ኃይል ሁኔታ ሪፖርት ደርሷል።'
            : "Eagle Eye Security has pushed their weekly HRMS synchronization report.",
          time: "1d ago",
          read: true,
          type: "message",
          category: "report",
        },
      ];
    }
  };

  const [notifications, setNotifications] = useState<Notification[]>(
    getInitialNotifications(),
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  const filteredNotifications = notifications.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "all" || !n.read;
    return matchesSearch && matchesTab;
  });

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const toggleRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: !n.read } : n)),
    );
  };

  const getIcon = (
    type: Notification["type"],
    category: Notification["category"],
  ) => {
    if (category === "report" && type === "error")
      return <ShieldAlert className="text-red-500" />;
    if (category === "report") return <FileText className="text-blue-500" />;
    if (category === "license") return <RefreshCw className="text-amber-500" />;
    if (category === "application")
      return <FilePlus className="text-green-500" />;
    if (category === "user") return <UserPlus className="text-primary" />;

    switch (type) {
      case "success":
        return <CheckCircle className="text-green-500" />;
      case "warning":
        return <AlertCircle className="text-amber-500" />;
      case "error":
        return <Trash2 className="text-red-500" />;
      case "message":
        return <MessageSquare className="text-primary" />;
      default:
        return <Bell className="text-gray-400" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-primary tracking-tight">
                {isAm ? "ማሳወቂያዎች" : "Notifications Center"}
              </h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
                {isAm
                  ? "የቅርብ ጊዜ ዝመናዎችን እና ማንቂያዎችን ይከታተሉ"
                  : "Stay updated with your latest alerts and activities"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={markAllAsRead}
            className="px-6 py-3 bg-white border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary hover:border-primary transition-all flex items-center space-x-2 shadow-sm"
          >
            <CheckCheck className="w-4 h-4" />
            <span>{isAm ? "ሁሉንም እንዳነበብኩ ምልክት አድርግ" : "Mark All Read"}</span>
          </button>
          <button
            onClick={clearAll}
            className="px-6 py-3 bg-red-50 border border-red-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center space-x-2 shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isAm ? "ሁሉንም አጽዳ" : "Clear All"}</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl overflow-hidden min-h-[600px] flex flex-col">
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-50/30">
          <div className="flex p-1 bg-gray-100 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab("all")}
              className={cn(
                "px-8 py-2.5 rounded-xl text-xs font-black transition-all",
                activeTab === "all"
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-400 hover:text-primary",
              )}
            >
              {isAm ? "ሁሉም" : "All"}
            </button>
            <button
              onClick={() => setActiveTab("unread")}
              className={cn(
                "px-8 py-2.5 rounded-xl text-xs font-black transition-all flex items-center space-x-2",
                activeTab === "unread"
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-400 hover:text-primary",
              )}
            >
              <span>{isAm ? "ያልተነበቡ" : "Unread"}</span>
              {notifications.filter((n) => !n.read).length > 0 && (
                <span className="w-5 h-5 bg-primary text-white text-[10px] rounded-full flex items-center justify-center">
                  {notifications.filter((n) => !n.read).length}
                </span>
              )}
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={
                isAm ? "ማሳወቂያዎችን ይፈልጉ..." : "Search notifications..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary focus:shadow-lg transition-all min-w-[300px]"
            />
          </div>
        </div>

        <div className="flex-grow overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {filteredNotifications.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {filteredNotifications.map((n, i) => (
                  <motion.div
                    key={n.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      "p-8 hover:bg-gray-50 transition-all group flex items-start space-x-6 relative",
                      !n.read && "bg-blue-50/20",
                    )}
                  >
                    {!n.read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                    )}

                    <div
                      className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border transition-all group-hover:scale-110",
                        n.read
                          ? "bg-white border-gray-100"
                          : "bg-white border-primary/20 ring-4 ring-primary/5",
                      )}
                    >
                      {getIcon(n.type, n.category)}
                    </div>

                    <div className="flex-grow space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <h3
                            className={cn(
                              "text-base tracking-tight",
                              n.read
                                ? "font-bold text-gray-600"
                                : "font-black text-primary",
                            )}
                          >
                            {n.title}
                          </h3>
                          <span
                            className={cn(
                              "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                              n.category === "license"
                                ? "bg-amber-50 text-amber-600 border-amber-100"
                                : n.category === "application"
                                  ? "bg-green-50 text-green-600 border-green-100"
                                  : "bg-blue-50 text-blue-600 border-blue-100",
                            )}
                          >
                            {n.category}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center text-[10px] font-bold text-gray-400 space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{n.time}</span>
                          </div>
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => toggleRead(n.id)}
                              className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-primary transition-all shadow-sm"
                              title={n.read ? "Mark as unread" : "Mark as read"}
                            >
                              {n.read ? (
                                <Mail className="w-4 h-4" />
                              ) : (
                                <CheckCheck className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => deleteNotification(n.id)}
                              className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-500 transition-all shadow-sm"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <p
                        className={cn(
                          "text-sm leading-relaxed max-w-3xl",
                          n.read
                            ? "text-gray-400 font-medium"
                            : "text-gray-500 font-bold",
                        )}
                      >
                        {n.message}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                  <Bell className="w-12 h-12" />
                </div>
                <div className="text-center">
                  <p className="text-xl font-black text-gray-300 tracking-tight">
                    {isAm ? "ማሳወቂያ የለም" : "No notifications found"}
                  </p>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                    {searchTerm
                      ? isAm
                        ? "ፍለጋዎን ይቀይሩ"
                        : "Try adjusting your search"
                      : isAm
                        ? "ሁሉንም አጽድተዋል"
                        : "You are all caught up!"}
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-8 border-t border-gray-50 bg-gray-50/30 flex justify-between items-center">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {isAm
              ? "ከፌዴራል ፖሊስ ማሳወቂያዎች"
              : "Official Communications from Federal Police"}
          </p>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">
              {isAm ? "ቀጥታ ስርጭት" : "Real-time active"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
