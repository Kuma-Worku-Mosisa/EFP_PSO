// file: frontend/src/components/notification-dropdown.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bell,
  Circle,
  CheckCheck,
  Loader2,
  Trash2,
  Eye,
  X,
  Calendar,
  Info,
} from "lucide-react";
import { apiRequest } from "../lib/api";
import {
  NotificationType,
  NotificationContext,
  getBilingualTemplate,
} from "../../../backend/src/modules/notification/notification.types";

interface NotificationItem {
  id: number;
  notificationType: NotificationType;
  alertTitle: string;
  alertMessage: string;
  isReadByRecipient: boolean;
  createdAt: string;
}

interface NotificationDropdownProps {
  currentLang: "en" | "am";
  userId: number;
}

export default function NotificationDropdown({
  currentLang,
  userId,
}: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Modal State Inspector for Detail View
  const [activeInspectorNode, setActiveInspectorNode] = useState<{
    title: string;
    message: string;
    type: NotificationType;
    date: string;
  } | null>(null);

  const fetchLiveFeed = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const response = await apiRequest<any>(`/notifications/feed/${userId}`, {
        method: "GET",
      });
      const activeData = response?.data || response;
      if (Array.isArray(activeData)) {
        setNotifications(activeData);
      }
    } catch (error) {
      console.error("❌ Notification feed synchronization failed:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchLiveFeed();
    const backgroundSync = setInterval(fetchLiveFeed, 60000);
    return () => clearInterval(backgroundSync);
  }, [fetchLiveFeed]);

  const unreadCount = notifications.filter((n) => !n.isReadByRecipient).length;

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isReadByRecipient: true } : n,
        ),
      );
      await apiRequest("/notifications/read", {
        method: "PATCH",
        body: JSON.stringify({ notificationId }),
      });
    } catch (error) {
      console.error(`Failed to mark item ${notificationId} as read:`, error);
      fetchLiveFeed();
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadItems = notifications.filter((n) => !n.isReadByRecipient);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isReadByRecipient: true })),
      );
      await Promise.all(
        unreadItems.map((item) =>
          apiRequest("/notifications/read", {
            method: "PATCH",
            body: JSON.stringify({ notificationId: item.id }),
          }),
        ),
      );
    } catch (error) {
      console.error("Bulk update operations failed:", error);
      fetchLiveFeed();
    }
  };

  const handleDeleteNotification = async (notificationId: number) => {
    try {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      if (activeInspectorNode) {
        setActiveInspectorNode(null);
      }
      await apiRequest(`/notifications/${notificationId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error(`Failed to delete notification ${notificationId}:`, error);
      fetchLiveFeed();
    }
  };

  const handleClearAllFeed = async () => {
    try {
      setNotifications([]);
      await apiRequest(`/notifications/feed/clear/${userId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Failed to clear notification feed:", error);
      fetchLiveFeed();
    }
  };

  const formatOperationalDate = (dateString: string) => {
    const timeDelta = new Date().getTime() - new Date(dateString).getTime();
    const minutesDelta = Math.floor(timeDelta / 60000);

    if (minutesDelta < 1) return currentLang === "en" ? "Just now" : "አሁን";
    if (minutesDelta < 60)
      return currentLang === "en"
        ? `${minutesDelta}m ago`
        : `${minutesDelta} ደቂቃ በፊት`;

    const hoursDelta = Math.floor(minutesDelta / 60);
    if (hoursDelta < 24)
      return currentLang === "en"
        ? `${hoursDelta}h ago`
        : `${hoursDelta} ሰዓት በፊት`;

    return new Date(dateString).toLocaleDateString(
      currentLang === "en" ? "en-US" : "am-ET",
    );
  };

  // Helper utility to safely parse out contextual multilingual tokens dynamically
  const parseNotificationContent = (item: NotificationItem) => {
    let title = item.alertTitle;
    let message = item.alertMessage;

    const findBilingualSplit = (text: string) => {
      const amharicMatch = text.match(/[\u1200-\u137F]/);
      if (!amharicMatch || amharicMatch.index === undefined) return null;
      const splitIndex = text.lastIndexOf("\n\n", amharicMatch.index);
      if (splitIndex === -1) return null;
      return {
        en: text.slice(0, splitIndex).trim(),
        am: text.slice(splitIndex + 2).trim(),
      };
    };

    try {
      if (item.alertMessage.startsWith("{")) {
        const nativeCtx: NotificationContext = JSON.parse(item.alertMessage);
        const template = getBilingualTemplate(item.notificationType, nativeCtx);
        title = currentLang === "en" ? template.titleEn : template.titleAm;
        message = currentLang === "en" ? template.msgEn : template.msgAm;
      } else {
        if (item.alertTitle.includes(" / ")) {
          const splitTitles = item.alertTitle.split(" / ");
          title = currentLang === "en" ? splitTitles[0] : splitTitles[1];
        }

        const bilingualParts = findBilingualSplit(item.alertMessage);
        if (bilingualParts) {
          message =
            currentLang === "en" ? bilingualParts.en : bilingualParts.am;
        } else if (item.alertMessage.includes("\n\n")) {
          const splitBlocks = item.alertMessage.split("\n\n");
          if (splitBlocks.length >= 2) {
            message =
              currentLang === "en"
                ? splitBlocks[0]
                : splitBlocks
                    .slice(Math.floor(splitBlocks.length / 2))
                    .join("\n\n");
          }
        }
      }
    } catch (e) {
      // Fallback intact
    }
    return { title, message };
  };

  return (
    <div className="relative inline-block text-left">
      {/* Absolute boundary trigger component icon wrapper with no outer borders */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100/80 rounded-xl focus:outline-none transition-all duration-200 group"
      >
        <Bell className="w-5 h-5 group-hover:text-[#003265] dark:group-hover:text-white transition-colors" />
        {unreadCount > 0 && (
          <span
            style={{ backgroundColor: "#FFD700" }}
            className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black text-[#003265] shadow-sm animate-pulse"
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Context Dropdown Container Panel */}
          <div className="absolute right-0 mt-3 w-80 md:w-[420px] origin-top-right rounded-xl bg-white shadow-2xl z-50 overflow-hidden border border-gray-100">
            {/* Header segment configured with brand color layout `#003265` */}
            <div className="bg-[#003265] text-white px-4 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-bold tracking-tight text-sm uppercase">
                  {currentLang === "en"
                    ? "System Notifications"
                    : "የስርዓት ማሳወቂያዎች"}
                </h3>
                {loading && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FFD700]" />
                )}
              </div>

              {notifications.length > 0 && (
                <button
                  onClick={handleClearAllFeed}
                  className="flex items-center gap-1.5 text-xs text-white/80 hover:text-[#FFD700] font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>
                    {currentLang === "en" ? "Clear View" : "ሁሉንም አጥፋ"}
                  </span>
                </button>
              )}
            </div>

            {/* Quick Actions Context Utility Ribbon */}
            {unreadCount > 0 && (
              <div className="bg-gray-50 px-4 py-2 flex justify-end border-b border-gray-100">
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#003265] hover:text-[#003265]/80 uppercase tracking-wider transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-[#FFD700]" />
                  <span>
                    {currentLang === "en" ? "Mark all read" : "ሁሉንም አንብብ"}
                  </span>
                </button>
              </div>
            )}

            {/* Content Feed List Container viewports default to background surface `#F8FAFB` */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100 bg-[#F8FAFB]">
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-xs font-medium text-gray-400">
                  {currentLang === "en"
                    ? "No active alerts pending"
                    : "ምንም ያልተነበበ ማሳወቂያ የለም"}
                </div>
              ) : (
                notifications.map((item) => {
                  const { title, message } = parseNotificationContent(item);

                  return (
                    <div
                      key={item.id}
                      className={`flex gap-3 p-4 hover:bg-white transition-all duration-150 relative group/item border-l-4 ${
                        !item.isReadByRecipient
                          ? "border-l-[#FFD700] bg-white"
                          : "border-l-transparent"
                      }`}
                    >
                      {/* Active State Indication Circle Accent Component */}
                      {!item.isReadByRecipient && (
                        <div className="pt-1.5 flex-shrink-0">
                          <Circle className="w-2 h-2 fill-[#003265] text-[#003265]" />
                        </div>
                      )}

                      {/* Messaging Summary Segment Core layout */}
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-gray-900 truncate leading-tight">
                            {title}
                          </h4>
                          <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                            {formatOperationalDate(item.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed whitespace-pre-line">
                          {message}
                        </p>
                      </div>

                      {/* Interactive Inspector Context Buttons Tray Grid */}
                      <div className="flex flex-col gap-1 items-center justify-center opacity-80 md:opacity-0 group-hover/item:opacity-100 transition-opacity pl-1">
                        <button
                          title={
                            currentLang === "en"
                              ? "View full context details"
                              : "ዝርዝር እይታ"
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!item.isReadByRecipient)
                              handleMarkAsRead(item.id);
                            setActiveInspectorNode({
                              title,
                              message,
                              type: item.notificationType,
                              date: new Date(item.createdAt).toLocaleString(
                                currentLang === "en" ? "en-US" : "am-ET",
                              ),
                            });
                          }}
                          className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#003265] hover:text-[#FFD700] text-gray-600 transition-all duration-150 shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {!item.isReadByRecipient && (
                          <button
                            title={
                              currentLang === "en" ? "Mark as read" : "አንብቤዋለሁ"
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(item.id);
                            }}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-green-50 hover:text-green-600 text-gray-400 transition-colors"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          title={
                            currentLang === "en"
                              ? "Delete notification"
                              : "ማሳወቂያውን ሰርዝ"
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(item.id);
                          }}
                          className="p-1.5 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}

      {/* Atomic Popup Modal — Full Content Inspector Window */}
      {activeInspectorNode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg h-[min(90vh,calc(100vh-2rem))] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150 flex flex-col">
            {/* Modal Header configured around `#003265` branding anchor */}
            <div className="bg-[#003265] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-[#FFD700]" />
                <span className="text-xs font-bold tracking-widest uppercase text-white/90">
                  {currentLang === "en"
                    ? "Notification Detail"
                    : "የማሳወቂያው ዝርዝር ይዘት"}
                </span>
              </div>
              <button
                onClick={() => setActiveInspectorNode(null)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal content layout context box panels */}
            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              <div className="space-y-1">
                <span className="text-[10px] font-black tracking-widest text-[#003265]/60 uppercase block">
                  {currentLang === "en"
                    ? "Subject / Alert Context"
                    : "የጉዳዩ ርዕስ"}
                </span>
                <h3 className="text-sm font-black text-gray-900 leading-snug">
                  {activeInspectorNode.title}
                </h3>
              </div>

              <div className="p-4 bg-[#F8FAFB] rounded-xl border border-gray-100">
                <span className="text-[10px] font-black tracking-widest text-[#003265]/60 uppercase block mb-2">
                  {currentLang === "en" ? "Message Payload" : "መልዕክት"}
                </span>
                <p className="text-xs text-gray-700 font-medium leading-relaxed whitespace-pre-line">
                  {activeInspectorNode.message}
                </p>
              </div>

              {/* Auxiliary System Metadata Attributes Panel */}
              <div className="flex items-center justify-between pt-2 text-[11px] text-gray-400 font-semibold border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>{activeInspectorNode.date}</span>
                </div>
                <span className="bg-gray-100 px-2 py-0.5 rounded-md text-[9px] uppercase font-bold tracking-wider text-gray-500">
                  {activeInspectorNode.type}
                </span>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="bg-gray-50 px-6 py-3 flex justify-end shrink-0">
              <button
                onClick={() => setActiveInspectorNode(null)}
                style={{ backgroundColor: "#003265" }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md hover:bg-[#003265]/90 transition-colors"
              >
                {currentLang === "en" ? "Dismiss" : "ዝጋ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
