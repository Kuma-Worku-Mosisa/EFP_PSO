import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import {
  Send,
  History,
  Eye,
  ArrowLeft,
  UserCheck,
  Loader2,
  CheckCircle2,
  X,
  Search,
} from "lucide-react";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { AutoDismissToast, ToastType } from "../../components/AutoDismissToast";
import PersonnelDetailsForm from "./PersonnelDetailsForm";
import { apiRequest } from "../../lib/api";

interface HistoryRecord {
  id: number;
  positionType: string;
  newPersonName: string;
  previousPersonName: string;
  reason: string;
  status: string;
  date: string;
}

export default function PersonnelChangeRequest() {
  const { language } = useLanguage();
  const isAm = language === "am";
  const t = (en: string, am: string) => (isAm ? am : en);

  const [activeTab, setActiveTab] = useState<
    "initiate" | "history" | "details"
  >("initiate");
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(
    null,
  );
  const [detailViewRecord, setDetailViewRecord] =
    useState<HistoryRecord | null>(null);
  const [historySearch, setHistorySearch] = useState("");
  const [historyFilter, setHistoryFilter] = useState("ALL");
  const [employeeType, setEmployeeType] = useState<"new" | "existing" | null>(
    null,
  );
  const [existingFan, setExistingFan] = useState("");
  const [existingLookupDone, setExistingLookupDone] = useState(false);
  const [existingEmployeeData, setExistingEmployeeData] = useState<{
    fullName: string;
    faydaId: string;
    organization: string;
    position: string;
    currentRole: string;
  } | null>(null);

  // State for fetching personnel change requests
  const [historyData, setHistoryData] = useState<HistoryRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastType, setToastType] = useState<ToastType>("success");
  const [toastMessage, setToastMessage] = useState("");

  // Fetch personnel change requests from backend
  useEffect(() => {
    const fetchPersonnelChangeRequests = async () => {
      setHistoryLoading(true);
      setHistoryError(null);
      try {
        const response = await apiRequest("/personnel-change-requests");
        const payload = (response && (response as any).data) || response;

        // Handle both array and paginated responses
        let requests = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : [];

        // Map backend response to HistoryRecord format
        const mappedData = requests.map((req: any) => {
          const employee = req.targetEmployee || {};
          const createdDate = req.createdAt
            ? new Date(req.createdAt).toLocaleDateString("en-CA")
            : new Date().toLocaleDateString("en-CA");

          return {
            id: req.id,
            positionType:
              req.targetPositionName || employee.position?.name || "Unassigned",
            newPersonName:
              employee.user?.fullName || employee.fullName || "N/A",
            previousPersonName: req.previousPersonName || "",
            reason: req.reason || "Personnel Change",
            status:
              (req.status || "PENDING").toUpperCase() === "PENDING"
                ? "Pending"
                : req.status,
            date: createdDate,
          };
        });

        setHistoryData(mappedData);
      } catch (err: any) {
        console.error("Failed to fetch personnel change requests:", err);
        const errorMessage =
          err?.message || "Failed to load personnel change requests";
        console.error("Failed to fetch personnel change requests:", err);
        setHistoryError(errorMessage);
        setHistoryData([]);
        setToastType("error");
        setToastMessage(errorMessage);
        setToastOpen(true);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchPersonnelChangeRequests();
  }, []);

  const handleExistingLookup = () => {
    if (!existingFan.trim()) return;
    setExistingLookupDone(true);
    setExistingEmployeeData({
      fullName: "Existing User",
      faydaId: existingFan.trim().toUpperCase(),
      organization: "Central Personnel Database",
      position: "Registered Employee",
      currentRole: "Current position from central registry",
    });
  };

  const filteredHistory = historyData.filter((row) => {
    const matchesSearch =
      !historySearch ||
      row.positionType.toLowerCase().includes(historySearch.toLowerCase()) ||
      row.newPersonName.toLowerCase().includes(historySearch.toLowerCase()) ||
      row.previousPersonName
        .toLowerCase()
        .includes(historySearch.toLowerCase()) ||
      row.reason.toLowerCase().includes(historySearch.toLowerCase());
    const matchesFilter =
      historyFilter === "ALL" || row.status === historyFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#003366] to-[#001F3F] rounded-3xl p-6 border border-white/10">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FFD700] via-[#C5A022] to-[#FFD700]" />
        <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-[#FFD700]/5" />
        <div className="relative z-10">
          <h1 className="text-xl font-black text-white uppercase tracking-tight">
            {t("Personnel Change Request", "የሰራተኞች ለውጥ ጥያቄ")}
          </h1>
          <p className="text-xs text-white/50 font-medium mt-1">
            {t(
              "Request changes to key personnel positions",
              "የቁልፍ የሰራተኞች ቦታዎች ለውጥ ይጠይቁ",
            )}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          {
            key: "initiate" as const,
            label: t("Initiate Request", "ጥያቄ ይጀምሩ"),
            icon: <Send className="w-4 h-4" />,
          },
          {
            key: "history" as const,
            label: t("Request History", "የጥያቄ ታሪክ"),
            icon: <History className="w-4 h-4" />,
          },
          ...(activeTab === "details"
            ? [
                {
                  key: "details" as const,
                  label: t("Fill Details", "ዝርዝሮች ያስገቡ"),
                  icon: <UserCheck className="w-4 h-4" />,
                },
              ]
            : []),
        ].map((tab) => (
          <motion.button
            key={tab.key}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              if (tab.key === "details") {
                setSelectedRecord(null);
              }
              setActiveTab(tab.key);
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all relative ${
              activeTab === tab.key
                ? "bg-[#003366] text-white shadow-md"
                : "bg-white text-gray-500 border border-gray-200 hover:border-[#003366]/30"
            }`}
          >
            {tab.icon}
            {tab.label}
          </motion.button>
        ))}
      </div>
      {/* TAB 1: INITIATE */}
      {activeTab === "initiate" && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {[
              {
                key: "new",
                title: t("New Employee", "አዲስ ሰራተኛ"),
                description: t(
                  "Create a new personnel request when the employee is not yet recorded in the central database.",
                  "ሰራተኛው ከመዋቅሩ ውስጥ ካልተመዘገበ አዲስ ጥያቄ ይፍጠሩ።",
                ),
              },
              {
                key: "existing",
                title: t("Existing Employee", "የነበረ ሰራተኛ"),
                description: t(
                  "Lookup the employee by FAN from the centralized database and attach the existing record.",
                  "ከማእከላዊ መረጃ ጋብዣ በተጠቃሚ ቁጥር FAN ይፈልጉ።",
                ),
              },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setEmployeeType(item.key as "new" | "existing");
                  setExistingLookupDone(false);
                  setExistingEmployeeData(null);
                }}
                className={`rounded-3xl border p-6 text-left transition-all shadow-sm hover:shadow-lg ${
                  employeeType === item.key
                    ? "border-[#003366] bg-[#003366]/10"
                    : "border-gray-200 bg-white"
                }`}
              >
                <span className="text-xs uppercase tracking-[0.3em] text-gray-500">
                  {item.key === "new" ? t("New", "አዲስ") : t("Existing", "ነበረ")}
                </span>
                <h3 className="mt-3 text-lg font-bold text-[#003366]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">{item.description}</p>
              </button>
            ))}
          </div>

          {employeeType === null ? (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
              {t(
                "Choose how you want to submit the personnel change request.",
                "የሰራተኛ ለውጥ ጥያቄ እንዴት እንደሚሰጥ ይምረጡ።",
              )}
            </div>
          ) : employeeType === "existing" ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6"
            >
              <div className="space-y-3">
                <p className="text-sm font-bold text-[#003366]">
                  {t(
                    "Lookup existing employee with FAN",
                    "በFAN የነበረውን ሰራተኛ ይፈልጉ",
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  {t(
                    "Use the centralized database FAN number to load the registered employee record and avoid duplicate entries.",
                    "በማእከላዊ የመረጃ ጎታ FAN ቁጥር ይጠቀሙ እና የቀና ዝርዝር መረጃ ያግኙ።",
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={existingFan}
                  onChange={(e) => setExistingFan(e.target.value)}
                  placeholder={t("Enter FAN number...", "FAN ቁጥር ያስገቡ...")}
                  className="col-span-2 rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition-all"
                />
                <button
                  type="button"
                  onClick={handleExistingLookup}
                  className="rounded-2xl bg-[#003366] text-white px-5 py-3 text-sm font-bold hover:bg-[#00264d] transition-all"
                >
                  {t("Lookup", "ፈልግ")}
                </button>
              </div>

              {existingLookupDone ? (
                existingEmployeeData ? (
                  <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#003366]/10 flex items-center justify-center text-[#003366]">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#003366]">
                          {t("Employee record loaded", "የሰራተኛ መዝገብ ተጫኗል")}
                        </p>
                        <p className="text-xs text-gray-500">
                          {t(
                            "Review the employee details before submitting the request.",
                            "እባክዎ ከጥያቄ ማስገባት በፊት ዝርዝሩን ይመልከቱ.",
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                          {t("Full Name", "ሙሉ ስም")}
                        </p>
                        <p className="font-semibold">
                          {existingEmployeeData.fullName}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                          {t("FAN Number", "FAN ቁጥር")}
                        </p>
                        <p className="font-semibold">
                          {existingEmployeeData.faydaId}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                          {t("Organization", "ድርጅት")}
                        </p>
                        <p className="font-semibold">
                          {existingEmployeeData.organization}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                          {t("Position", "ሹመት")}
                        </p>
                        <p className="font-semibold">
                          {existingEmployeeData.position}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-gray-200 bg-yellow-50 p-5 text-sm text-amber-800">
                    {t(
                      "No employee record was found for this FAN. Please verify the number and try again.",
                      "ለዚህ የFAN ቁጥር የሰራተኛ መዝገብ አልተገኘም። እባክዎን ቁጥሩን ያረጋግጡ እና እንደገና ይሞክሩ.",
                    )}
                  </div>
                )
              ) : null}
            </motion.div>
          ) : (
            <PersonnelDetailsForm />
          )}
        </>
      )}

      {/* TAB 2: REQUEST HISTORY */}
      {activeTab === "history" && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="relative overflow-hidden bg-gradient-to-r from-[#003366] to-[#001F3F] p-5">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD700] via-[#C5A022] to-[#FFD700]" />
            <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-[#FFD700]/5" />
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#FFD700]/20 flex items-center justify-center">
                <History className="w-4 h-4 text-[#FFD700]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {t("Request History", "የጥያቄ ታሪክ")}
                </h3>
                <p className="text-[10px] text-white/50 font-medium">
                  {t(
                    "View previous personnel change requests",
                    "የቀድሞ የሰራተኞች ለውጥ ጥያቄዎችን ይመልከቱ",
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder={t(
                  "Search by name or position...",
                  "በስም ወይም በቦታ ፈልግ...",
                )}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]/50 hover:border-[#003366]/30 transition-all"
              />
            </div>
            <select
              value={historyFilter}
              onChange={(e) => setHistoryFilter(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]/50 hover:border-[#003366]/30 transition-all"
            >
              <option value="ALL">{t("All Status", "ሁሉም ሁኔታ")}</option>
              <option value="Approved">{t("Approved", "ጸድቋል")}</option>
              <option value="Pending">{t("Pending", "በመጠባበቅ ላይ")}</option>
              <option value="Rejected">{t("Rejected", "ውድቅ")}</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            {historyLoading ? (
              <div className="w-full p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#003366] mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  {t("Loading requests...", "ጥያቄዎች እየተጫኑ ናቸው...")}
                </p>
              </div>
            ) : historyError ? (
              <div className="w-full p-6 text-center bg-red-50 border border-red-200 m-4 rounded-xl">
                <X className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-red-700 font-medium">
                  {historyError}
                </p>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="w-full p-8 text-center text-gray-500">
                <History className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">
                  {t(
                    "No personnel change requests found",
                    "የሰራተኞች ለውጥ ጥያቄ አልተገኘም",
                  )}
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#003366] text-white text-[11px] uppercase tracking-[0.2em]">
                    <th className="p-4">{t("Position", "ቦታ")}</th>
                    <th className="p-4">{t("New Person", "አዲስ ሰው")}</th>
                    <th className="p-4">{t("Previous Person", "የቀድሞ ሰው")}</th>
                    <th className="p-4">{t("Reason", "ምክንያት")}</th>
                    <th className="p-4">{t("Status", "ሁኔታ")}</th>
                    <th className="p-4">{t("Date", "ቀን")}</th>
                    <th className="p-4">{t("Action", "ድርጊት")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-700">
                  {filteredHistory.map((row) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ backgroundColor: "rgba(0,51,102,0.02)" }}
                      className="transition-colors"
                    >
                      <td className="p-4 font-bold text-[#003366]">
                        {row.positionType}
                      </td>
                      <td className="p-4">{row.newPersonName}</td>
                      <td className="p-4 text-gray-500">
                        {row.previousPersonName}
                      </td>
                      <td className="p-4">{row.reason}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            row.status === "Approved"
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : row.status === "Pending"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {isAm
                            ? row.status === "Approved"
                              ? "ጸድቋል"
                              : row.status === "Pending"
                                ? "በመጠባበቅ ላይ"
                                : "ውድቅ"
                            : row.status}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-gray-400">{row.date}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={() => setDetailViewRecord(row)}
                            className="px-3 py-1.5 bg-[#003366] text-[#FFD700] rounded-lg text-xs font-bold hover:shadow-md transition-shadow inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />{" "}
                            {t("Detail View", "ዝርዝር እይታ")}
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      )}

      {/* Detail View Modal */}
      {detailViewRecord && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setDetailViewRecord(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            <div className="relative bg-gradient-to-r from-[#003366] to-[#001F3F] p-5">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD700] via-[#C5A022] to-[#FFD700]" />
              <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-[#FFD700]/5" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#FFD700]/20 flex items-center justify-center">
                    <Eye className="w-4 h-4 text-[#FFD700]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {t("Request Detail", "የጥያቄ ዝርዝር")}
                    </h3>
                    <p className="text-[10px] text-white/50 font-medium">
                      {t(
                        "Personnel change request details",
                        "የሰራተኞች ለውጥ ጥያቄ ዝርዝሮች",
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setDetailViewRecord(null)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-1">
                    {t("Position Type", "የቦታ አይነት")}
                  </p>
                  <p className="font-bold text-[#003366]">
                    {detailViewRecord.positionType}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-1">
                    {t("New Person", "አዲስ ሰው")}
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {detailViewRecord.newPersonName}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-1">
                    {t("Previous Person", "የቀድሞ ሰው")}
                  </p>
                  <p className="text-sm font-semibold text-gray-500">
                    {detailViewRecord.previousPersonName}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-1">
                    {t("Reason", "ምክንያት")}
                  </p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 border border-gray-100">
                    {detailViewRecord.reason}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-1">
                    {t("Status", "ሁኔታ")}
                  </p>
                  <span
                    className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${
                      detailViewRecord.status === "Approved"
                        ? "bg-green-100 text-green-700"
                        : detailViewRecord.status === "Pending"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {isAm
                      ? detailViewRecord.status === "Approved"
                        ? "ጸድቋል"
                        : detailViewRecord.status === "Pending"
                          ? "በመጠባበቅ ላይ"
                          : "ውድቅ"
                      : detailViewRecord.status}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-1">
                    {t("Date", "ቀን")}
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {detailViewRecord.date}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* TAB 3: FILL DETAILS */}
      <AutoDismissToast
        isOpen={toastOpen}
        type={toastType}
        message={toastMessage}
        onClose={() => setToastOpen(false)}
      />

      {activeTab === "details" && selectedRecord && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.button
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => {
              setActiveTab("history");
              setSelectedRecord(null);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#003366] hover:text-[#FFD700] transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t("Back to History", "ወደ ታሪክ ተመለስ")}
          </motion.button>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-[#003366]">
              <UserCheck className="w-4 h-4 text-[#FFD700]" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#003366]">
                {selectedRecord.positionType}
              </p>
              <p className="text-xs text-gray-500">
                {selectedRecord.newPersonName} &middot; {selectedRecord.date}
              </p>
            </div>
            <span
              className={`ml-auto px-2 py-0.5 rounded text-xs font-semibold ${
                selectedRecord.status === "Approved"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : ""
              }`}
            >
              {isAm ? "ጸድቋል" : selectedRecord.status}
            </span>
          </div>
          <PersonnelDetailsForm />
        </motion.div>
      )}
    </motion.div>
  );
}
