import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import {
  Send,
  History,
  Mail,
  Phone,
  FileText,
  Eye,
  CheckCircle2,
  UserPlus,
  Loader2,
  ArrowLeft,
  UserCheck,
} from "lucide-react";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import PersonnelDetailsForm from "./PersonnelDetailsForm";

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

  const [activeTab, setActiveTab] = useState<"initiate" | "history" | "details">("initiate");
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);
  const [positionType, setPositionType] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const historyData: HistoryRecord[] = [
    { id: 1, positionType: t("Personnel Manager", "የሰራተኞች አስተዳዳሪ"), newPersonName: "Abebe Kebede", previousPersonName: "Meron Alemu", reason: t("Resignation", "ስራ መልቀቅ"), status: "Approved", date: "2025-01-15" },
    { id: 2, positionType: t("Operations", "ኦፕሬሽን"), newPersonName: "Tigist Haile", previousPersonName: "Dawit Eshetu", reason: t("Transfer", "ዝውውር"), status: "Pending", date: "2025-03-10" },
    { id: 3, positionType: t("Administration", "አስተዳደር"), newPersonName: "Biruk Tadesse", previousPersonName: "Sara Hailu", reason: t("Promotion", "ማስተዋወቅ"), status: "Rejected", date: "2025-02-20" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    }, 1500);
  };

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
            {t("Request changes to key personnel positions", "የቁልፍ የሰራተኞች ቦታዎች ለውጥ ይጠይቁ")}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "initiate" as const, label: t("Initiate Request", "ጥያቄ ይጀምሩ"), icon: <Send className="w-4 h-4" /> },
          { key: "history" as const, label: t("Request History", "የጥያቄ ታሪክ"), icon: <History className="w-4 h-4" /> },
          ...(activeTab === "details" ? [{ key: "details" as const, label: t("Fill Details", "ዝርዝሮች ያስገቡ"), icon: <UserCheck className="w-4 h-4" /> }] : []),
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
        <motion.form
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-5 relative"
        >
          {submitting && <LoadingSpinner overlay text="Submitting request..." />}

          {submitted && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {t("Request submitted successfully!", "ጥያቄ በተሳካ ሁኔታ ቀርቧል!")}
            </div>
          )}

          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#003366] to-[#001F3F] text-[#FFD700] flex items-center justify-center shadow-sm">
              <Send className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#003366]">
              {t("Personnel Change Details", "የሰራተኞች ለውጥ ዝርዝሮች")}
            </h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#003366] uppercase tracking-wider mb-1.5">
              {t("Position Type", "የቦታ አይነት")} <span className="text-orange-500">*</span>
            </label>
            <select
              value={positionType}
              onChange={(e) => setPositionType(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] hover:border-[#003366]/30 transition-all"
            >
              <option value="">{t("Select position type...", "የቦታ አይነት ይምረጡ...")}</option>
              <option value="Manager">{t("Personnel Manager", "የሰራተኞች አስተዳዳሪ")}</option>
              <option value="Operations">{t("Operations", "ኦፕሬሽን")}</option>
              <option value="Admin">{t("Administration", "አስተዳደር")}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#003366] uppercase tracking-wider mb-1.5">
              {t("New Person Full Name", "የአዲሱ ሰው ሙሉ ስም")} <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder={t("Enter full name...", "ሙሉ ስም ያስገቡ...")}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] hover:border-[#003366]/30 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#003366] uppercase tracking-wider mb-1.5">
                <Mail className="w-3.5 h-3.5 inline mr-1 text-[#FFD700]" />
                {t("Email Address", "የኢሜይል አድራሻ")} <span className="text-orange-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={t("email@example.com", "email@example.com")}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] hover:border-[#003366]/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#003366] uppercase tracking-wider mb-1.5">
                <Phone className="w-3.5 h-3.5 inline mr-1 text-[#FFD700]" />
                {t("Phone Number", "ስልክ ቁጥር")} <span className="text-orange-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="+251..."
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] hover:border-[#003366]/30 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#003366] uppercase tracking-wider mb-1.5">
              <FileText className="w-3.5 h-3.5 inline mr-1 text-[#FFD700]" />
              {t("Reason for Change", "የለውጡ ምክንያት")} <span className="text-orange-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={3}
              placeholder={t("Describe the reason for this change...", "የዚህን ለውጥ ምክንያት ይግለጹ...")}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] hover:border-[#003366]/30 transition-all resize-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#003366] to-[#001F3F] text-white text-xs font-bold tracking-wide px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {submitting
                ? t("Submitting...", "በማስገባት ላይ...")
                : t("Submit Request", "ጥያቄ ያስገቡ")}
            </motion.button>
          </div>
        </motion.form>
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
                  {t("View previous personnel change requests", "የቀድሞ የሰራተኞች ለውጥ ጥያቄዎችን ይመልከቱ")}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
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
                {historyData.map((row) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ backgroundColor: "rgba(0,51,102,0.02)" }}
                    className="transition-colors"
                  >
                    <td className="p-4 font-bold text-[#003366]">{row.positionType}</td>
                    <td className="p-4">{row.newPersonName}</td>
                    <td className="p-4 text-gray-500">{row.previousPersonName}</td>
                    <td className="p-4">{row.reason}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        row.status === "Approved" ? "bg-green-50 text-green-700 border border-green-200" :
                        row.status === "Pending" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                        "bg-red-50 text-red-700 border border-red-200"
                      }`}>
                        {isAm ?
                          row.status === "Approved" ? "ጸድቋል" :
                          row.status === "Pending" ? "በመጠባበቅ ላይ" :
                          "ውድቅ"
                          : row.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-400">{row.date}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        {row.status === "Approved" && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={() => {
                              setSelectedRecord(row);
                              setActiveTab("details");
                            }}
                            className="px-3 py-1.5 bg-[#FFD700] text-[#003366] rounded-lg text-xs font-bold hover:shadow-md transition-shadow inline-flex items-center gap-1"
                          >
                            <UserPlus className="w-3.5 h-3.5" /> {t("Fill Details", "ዝርዝሮች ያስገቡ")}
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          className="px-3 py-1.5 bg-[#003366] text-[#FFD700] rounded-lg text-xs font-bold hover:shadow-md transition-shadow inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> {t("Detail View", "ዝርዝር እይታ")}
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* TAB 3: FILL DETAILS */}
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
            onClick={() => { setActiveTab("history"); setSelectedRecord(null); }}
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
              <p className="text-xs font-bold text-[#003366]">{selectedRecord.positionType}</p>
              <p className="text-xs text-gray-500">
                {selectedRecord.newPersonName} &middot; {selectedRecord.date}
              </p>
            </div>
            <span className={`ml-auto px-2 py-0.5 rounded text-xs font-semibold ${
              selectedRecord.status === "Approved" ? "bg-green-50 text-green-700 border border-green-200" : ""
            }`}>
              {isAm ? "ጸድቋል" : selectedRecord.status}
            </span>
          </div>
          <PersonnelDetailsForm />
        </motion.div>
      )}
    </motion.div>
  );
}
