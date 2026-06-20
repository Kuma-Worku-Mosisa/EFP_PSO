//filepath: frontend/src/pages/HRmanagement/EmployeeTransferManager.tsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  ArrowLeftRight,
  UserCheck,
  FileCheck,
  Check,
  X,
  AlertCircle,
  Send,
  History,
  Clock,
  MapPin,
  Briefcase,
  Mail,
  Fingerprint,
  Eye,
} from "lucide-react";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { AutoDismissToast } from "../../components/AutoDismissToast";
import { apiRequest } from "../../lib/api";
import { useLanguage } from "../../context/LanguageContext";

// Expected TypeScript interface for an employee returned from lookups
interface EmployeeProfile {
  id: number;
  faydaId: string;
  user: {
    fullName: string;
    email: string;
    phone?: string;
    status: string;
  };
  organization: { id: number; name: string };
  position: { id: number; name: string };
}

// Expected TypeScript interface for incoming transfer requests
interface TransferRequestItem {
  id: number;
  employeeId: number;
  employee: {
    user: {
      fullName: string;
      faydaId: string;
    };
    position?: { name: string } | null;
  };
  sourceOrganization: { name: string };
  targetOrganization: { name: string };
  position?: { name: string } | null;
  status: string;
  reason: string;
  createdAt: string;
  updatedAt: string;
}

interface TransferHistoryResponse {
  initiated: TransferRequestItem[];
  incoming: TransferRequestItem[];
}

export default function EmployeeTransferManager() {
  const { language } = useLanguage();
  const isAm = language === "am";
  const [activeTab, setActiveTab] = useState<
    "initiate" | "incoming" | "history" | "addressHistory"
  >("initiate");
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);
  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<
    "approve" | "reject" | "default"
  >("default");
  const [confirmTargetId, setConfirmTargetId] = useState<number | null>(null);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  // Toast handled by AutoDismissToast
  const [toastOpen, setToastOpen] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMessage, setToastMessage] = useState("");

  // Tab 1: Initiate Form State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedEmployee, setSearchedEmployee] =
    useState<EmployeeProfile | null>(null);
  const [transferPayload, setTransferPayload] = useState({
    transferReason: "",
  });

  // Tab 2: Incoming Requests State
  const [pendingRequests, setPendingRequests] = useState<TransferRequestItem[]>(
    [],
  );
  const [transferHistory, setTransferHistory] =
    useState<TransferHistoryResponse | null>(null);

  // Automatically fetch pending items or history when changing tabs
  useEffect(() => {
    if (activeTab === "incoming") {
      fetchPendingRequests();
    }
    if (activeTab === "history") {
      fetchTransferHistory();
    }
  }, [activeTab]);

  // Clear notifications automatically after 4 seconds
  useEffect(() => {
    if (globalError || globalSuccess) {
      const timer = setTimeout(() => {
        setGlobalError(null);
        setGlobalSuccess(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [globalError, globalSuccess]);

  // Action A: Look up active personnel inside the system via backend database registry
  const handleEmployeeLookup = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setGlobalError(null);
    setSearchedEmployee(null);

    try {
      const result = await apiRequest(
        `/transfers/employee-lookup?query=${encodeURIComponent(searchQuery.trim())}`,
      );
      setSearchedEmployee(result.data);
    } catch (err: any) {
      setGlobalError(
        err.message || "No active employee found matching identity parameters.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Action B: Push a new pending routing record downstream to target organization
  const handleInitiateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchedEmployee) return;

    setIsLoading(true);
    setGlobalError(null);

    try {
      await apiRequest("/transfers", {
        method: "POST",
        body: JSON.stringify({
          employeeId: searchedEmployee.id,
          // targetOrganizationId intentionally omitted; backend will default to initiator org
          // requestedPositionId intentionally omitted (use current position if required)
          reason: transferPayload.transferReason,
        }),
      });

      setGlobalSuccess(
        `Transfer record for ${searchedEmployee.user.fullName} dispatched safely!`,
      );

      // Clear initiate forms state
      setSearchedEmployee(null);
      setSearchQuery("");
      setTransferPayload({ transferReason: "" });
    } catch (err: any) {
      setGlobalError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Action C: Get live unapproved inbound transfer records for current organization context
  const fetchPendingRequests = async () => {
    setIsLoading(true);
    setGlobalError(null);
    try {
      const result = await apiRequest("/transfers/incoming-pending");
      setPendingRequests(result.data || []);
    } catch (err: any) {
      setGlobalError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransferHistory = async () => {
    setIsLoading(true);
    setGlobalError(null);
    try {
      const result = await apiRequest("/transfers/history");
      setTransferHistory(result.data || null);
    } catch (err: any) {
      setGlobalError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Action D: Execute transactional workflow actions (RELEASE or REJECT)
  const handleApprovalDecision = async (
    id: number,
    decision: "RELEASE" | "FINALIZE_APPROVE" | "REJECT",
    rejectionReason?: string,
  ) => {
    setIsLoading(true);
    setGlobalError(null);

    try {
      await apiRequest(`/transfers/${id}/decision`, {
        method: "PATCH",
        body: JSON.stringify({
          action: decision,
          rejectionReason: rejectionReason || null,
        }),
      });

      const successMsg = `Request tracking ID #${id} updated to state: ${decision}`;
      setGlobalSuccess(successMsg);
      setToastType("success");
      setToastMessage(successMsg);
      setToastOpen(true);
      // Atomically filter out items from frontend layout display matrix
      setPendingRequests((prev) => prev.filter((req) => req.id !== id));
    } catch (err: any) {
      const msg = err.message || "Failed to route transfer tracking record.";
      setGlobalError(msg);
      setToastType("error");
      setToastMessage(msg);
      setToastOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const openApproveDialog = (id: number, employeeName?: string) => {
    setConfirmTargetId(id);
    setConfirmType("approve");
    setConfirmTitle("Release Employee for Transfer");
    setConfirmMessage(
      `Are you sure you want to release ${employeeName || "this employee"} for transfer? This action will mark the request as SOURCE_RELEASED and notify the destination organization.`,
    );
    setConfirmOpen(true);
  };

  const openRejectDialog = (id: number, employeeName?: string) => {
    setConfirmTargetId(id);
    setConfirmType("reject");
    setConfirmTitle("Decline Transfer Request");
    setConfirmMessage(
      `Provide a short justification for rejecting the transfer request for ${employeeName || "this employee"}. This reason will be included in notifications.`,
    );
    setRejectionReason("");
    setConfirmOpen(true);
  };

  const handleDialogConfirm = async () => {
    if (!confirmTargetId) return;
    setConfirmLoading(true);
    try {
      if (confirmType === "approve") {
        await handleApprovalDecision(confirmTargetId, "RELEASE");
      } else if (confirmType === "reject") {
        if (!rejectionReason.trim()) {
          // show inline error via toast
          setToastType("error");
          setToastMessage("Rejection reason is required.");
          setToastOpen(true);
          return;
        }
        await handleApprovalDecision(
          confirmTargetId,
          "REJECT",
          rejectionReason,
        );
      }
    } finally {
      setConfirmLoading(false);
      setConfirmOpen(false);
    }
  };

  const statusBadge = (status: string) => {
    switch (status.replace("_", " ").toUpperCase()) {
      case "APPROVED":
      case "FINALIZE APPROVE":
        return "bg-emerald-100 text-emerald-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      case "PENDING":
      case "SOURCE RELEASED":
        return "bg-[#FFD700]/15 text-[#C5A022]";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const t = (en: string, am: string) => (isAm ? am : en);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto"
    >
      {globalError && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-4 flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 p-4 rounded-xl border border-red-200"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {globalError}
        </motion.div>
      )}
      {globalSuccess && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-4 flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 p-4 rounded-xl border border-emerald-200"
        >
          <Check className="h-4 w-4 flex-shrink-0" />
          {globalSuccess}
        </motion.div>
      )}

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDialogConfirm}
        title={confirmTitle}
        message={confirmMessage}
        type={confirmType}
        isLoading={confirmLoading}
        isConfirmDisabled={confirmType === "reject" && !rejectionReason.trim()}
        inputLabel={confirmType === "reject" ? t("Rejection Justification", "የመቀበል ማረጋገጫ") : undefined}
        inputValue={rejectionReason}
        onInputChange={(v) => setRejectionReason(v)}
        inputPlaceholder={confirmType === "reject" ? t("Enter a concise justification for rejection", "እባክዎ አጭር ማረጋገጫ ያስገቡ") : undefined}
      />

      <AutoDismissToast
        isOpen={toastOpen}
        type={toastType}
        message={toastMessage}
        onClose={() => setToastOpen(false)}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative overflow-hidden bg-gradient-to-r from-[#003366] to-[#001F3F] rounded-3xl p-6 mb-6"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD700] via-[#C5A022] to-[#FFD700]" />
        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-[#FFD700]/5" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FFD700]/20 flex items-center justify-center">
            <ArrowLeftRight className="w-6 h-6 text-[#FFD700]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {t("Employee Inter-Organization Transfer", "የሰራተኞች ዝውውር")}
            </h2>
            <p className="text-sm text-white/60">
              {t("Transfer personnel across organizational structures safely.", "ሰራተኞችን በድርጅት መዋቅሮች መካከል በደህና ያስተላልፉ።")}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "initiate", label: t("Initiate Request", "ጥያቄ ይጀምሩ"), icon: <Send className="w-4 h-4" /> },
          { key: "incoming", label: t("Incoming Requests", "ገቢ ጥያቄዎች"), icon: <UserCheck className="w-4 h-4" /> },
          { key: "history", label: t("Transfer History", "የዝውውር ታሪክ"), icon: <History className="w-4 h-4" /> },
          { key: "addressHistory", label: t("Request Address History", "የአድራሻ ጥያቄ ታሪክ"), icon: <MapPin className="w-4 h-4" /> },
        ].map((tab) => (
          <motion.button
            key={tab.key}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveTab(tab.key as any)}
            disabled={isLoading}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all relative ${
              activeTab === tab.key
                ? "bg-[#003366] text-white shadow-md"
                : "bg-white text-gray-500 border border-gray-200 hover:border-[#003366]/30"
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.key === "incoming" && pendingRequests.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white w-5 h-5 rounded-full text-[9px] flex items-center justify-center font-bold shadow-md">
                {pendingRequests.length}
              </span>
            )}
          </motion.button>
        ))}
      </div>

      {/* TAB 1: INITIATE */}
      {activeTab === "initiate" && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#003366] to-[#001F3F] text-[#FFD700] flex items-center justify-center shadow-sm">
                <Search className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#003366]">
                {t("Step 1: Employee Lookup", "ደረጃ 1፡ የሰራተኛ ፍለጋ")}
              </h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  disabled={isLoading}
                  placeholder={t("Enter Fayda ID or Email...", "የፋይዳ መታወቂያ ወይም ኢሜይል ያስገቡ...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition-all"
                />
              </div>
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                disabled={isLoading}
                onClick={handleEmployeeLookup}
                className="bg-gradient-to-r from-[#003366] to-[#001F3F] hover:from-[#001F3F] hover:to-[#000F1F] disabled:from-gray-300 disabled:to-gray-300 text-white text-xs font-bold tracking-wide px-6 py-3 rounded-xl transition-all shadow-md whitespace-nowrap"
              >
                {isLoading ? t("Verifying...", "በማረጋገጥ ላይ...") : t("Verify Identity", "ማንነት ያረጋግጡ")}
              </motion.button>
            </div>
          </div>

          {searchedEmployee && (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleInitiateSubmit}
              className="space-y-6"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="relative overflow-hidden bg-gradient-to-r from-[#003366] to-[#001F3F] rounded-3xl p-6 border border-white/10"
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FFD700] via-[#C5A022] to-[#FFD700]" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                    <div>
                      <span className="text-[10px] bg-[#FFD700]/15 text-[#FFD700] px-2.5 py-1 rounded-full font-bold tracking-wide">
                        {t("Existing Profile Locked", "የተገኘ መገለጫ")}
                      </span>
                      <h2 className="text-xl font-bold mt-2 text-white">
                        {searchedEmployee.user.fullName}
                      </h2>
                    </div>
                    <UserCheck className="h-8 w-8 text-[#FFD700]/60" />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                      <p className="text-[#FFD700]/80 font-bold tracking-wide text-[9px] mb-1 uppercase">
                        {t("Fayda ID", "የፋይዳ መታወቂያ")}
                      </p>
                      <p className="font-mono text-sm font-bold text-white flex items-center gap-1.5">
                        <Fingerprint className="w-3.5 h-3.5 text-[#FFD700]/60" />
                        {searchedEmployee.faydaId}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                      <p className="text-[#FFD700]/80 font-bold tracking-wide text-[9px] mb-1 uppercase">
                        {t("Organization", "ድርጅት")}
                      </p>
                      <p className="font-semibold text-sm text-white flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#FFD700]/60" />
                        {searchedEmployee.organization.name}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                      <p className="text-[#FFD700]/80 font-bold tracking-wide text-[9px] mb-1 uppercase">
                        {t("Position", "ሹመት")}
                      </p>
                      <p className="font-semibold text-sm text-white flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-[#FFD700]/60" />
                        {searchedEmployee.position.name}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                      <p className="text-[#FFD700]/80 font-bold tracking-wide text-[9px] mb-1 uppercase">
                        {t("Email", "ኢሜይል")}
                      </p>
                      <p className="font-semibold text-sm text-white flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-[#FFD700]/60 shrink-0" />
                        {searchedEmployee.user.email}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#003366] to-[#001F3F] text-[#FFD700] flex items-center justify-center shadow-sm">
                    <ArrowLeftRight className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-[#003366]">
                    {t("Step 2: Transfer Details", "ደረጃ 2፡ የዝውውር ዝርዝሮች")}
                  </h3>
                </div>

                <div className="text-xs text-gray-500 space-y-1 mb-4 p-3 bg-gray-50 rounded-xl">
                  <p>{t("Employee:", "ሰራተኛ፡")} {searchedEmployee.faydaId || searchedEmployee.user.email}</p>
                  <p>{t("Organization:", "ድርጅት፡")} {searchedEmployee.organization.name}</p>
                  <p>{t("Position:", "ሹመት፡")} {searchedEmployee.position.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#003366] mb-1.5 flex items-center gap-1">
                    {t("Reason for Transfer", "የዝውውር ምክንያት")}
                    <span className="text-orange-500">*</span>
                  </label>
                  <textarea
                    required
                    disabled={isLoading}
                    rows={3}
                    value={transferPayload.transferReason}
                    onChange={(e) =>
                      setTransferPayload({
                        ...transferPayload,
                        transferReason: e.target.value,
                      })
                    }
                    placeholder={t("State the official justification for reassignment...", "የዝውውሩን ይፋዊ ማረጋገጫ ያስገቡ...")}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 mt-4 flex justify-end">
                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#003366] to-[#001F3F] hover:from-[#001F3F] hover:to-[#000F1F] disabled:from-gray-300 disabled:to-gray-300 text-white px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md"
                  >
                    <Send className="w-4 h-4" />
                    {isLoading ? t("Processing...", "በማስኬድ ላይ...") : t("Submit Transfer Request", "የዝውውር ጥያቄ ያስገቡ")}
                  </motion.button>
                </div>
              </div>
            </motion.form>
          )}
        </motion.div>
      )}

      {/* TAB 2: INCOMING */}
      {activeTab === "incoming" && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="relative overflow-hidden bg-gradient-to-r from-[#003366] to-[#001F3F] p-5">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD700] via-[#C5A022] to-[#FFD700]" />
            <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-[#FFD700]/5" />
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#FFD700]/20 flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-[#FFD700]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {t("Pending Transfer Requests", "በመጠባበቅ ላይ ያሉ የዝውውር ጥያቄዎች")}
                </h3>
                <p className="text-[10px] text-white/50 font-medium">
                  {t("Review and decide on incoming transfer requests", "የገቡ የዝውውር ጥያቄዎችን ይገምግሙ እና ይወስኑ")}
                </p>
              </div>
            </div>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <FileCheck className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-400">
                {t("No incoming transfer requests pending.", "ምንም የገባ የዝውውር ጥያቄ የለም።")}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {pendingRequests.map((request, idx) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  whileHover={{ backgroundColor: "rgba(255, 215, 0, 0.03)" }}
                  className="p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="space-y-3 max-w-2xl">
                      <div>
                        <span className="text-[10px] bg-[#FFD700]/15 text-[#C5A022] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full">
                          {t("Pending Review", "በግምገማ ላይ")}
                        </span>
                        <h4 className="text-lg font-bold text-gray-900 mt-1.5">
                          {request.employee?.user?.fullName}
                        </h4>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                          {t("Fayda ID:", "የፋይዳ መታወቂያ፡")} {request.employee?.user?.faydaId || t("Unknown", "ያልታወቀ")}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs">
                        <div>
                          <span className="text-gray-400 font-bold uppercase text-[9px] tracking-wider block">{t("Name", "ስም")}</span>
                          <span className="font-semibold text-gray-800 mt-0.5 block">{request.employee?.user?.fullName || t("Unknown", "ያልታወቀ")}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-bold uppercase text-[9px] tracking-wider block">{t("Fayda", "ፋይዳ")}</span>
                          <span className="font-semibold text-gray-800 mt-0.5 block">{request.employee?.user?.faydaId || t("Unknown", "ያልታወቀ")}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-bold uppercase text-[9px] tracking-wider block">{t("From", "ከ")}</span>
                          <span className="font-semibold text-gray-800 mt-0.5 block">{request.sourceOrganization?.name || t("Unknown", "ያልታወቀ")}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-bold uppercase text-[9px] tracking-wider block">{t("To", "ወደ")}</span>
                          <span className="font-semibold text-gray-800 mt-0.5 block">{request.targetOrganization?.name || t("Unknown", "ያልታወቀ")}</span>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs">
                        <span className="text-gray-400 font-bold uppercase text-[9px] tracking-wider block">{t("Requested Position", "የተጠየቀ ሹመት")}</span>
                        <span className="font-bold text-[#003366] flex items-center gap-1.5 mt-0.5">
                          <Briefcase className="w-3 h-3" /> {request.position?.name || request.employee?.position?.name || t("Unspecified", "ያልተገለጸ")}
                        </span>
                      </div>

                      <div className="text-xs text-gray-500 italic bg-white p-3 border border-gray-100 rounded-xl">
                        "{request.reason}"
                      </div>
                    </div>

                    <div className="flex lg:flex-col gap-2 min-w-[160px] justify-end lg:justify-start pt-2">
                      <motion.button
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        disabled={isLoading}
                        onClick={() => openApproveDialog(request.id, request.employee?.user?.fullName)}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#003366] to-[#001F3F] hover:from-[#001F3F] hover:to-[#000F1F] disabled:from-gray-300 disabled:to-gray-300 text-white text-xs font-bold tracking-wide px-4 py-2.5 rounded-xl shadow-sm transition-all"
                      >
                        <Check className="h-4 w-4" /> {t("Release", "ልቀቅ")}
                      </motion.button>
                      <motion.button
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        disabled={isLoading}
                        onClick={() => openRejectDialog(request.id, request.employee?.user?.fullName)}
                        className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-gray-600 text-xs font-bold tracking-wide px-4 py-2.5 rounded-xl transition-all"
                      >
                        <X className="h-4 w-4" /> {t("Decline", "አይቀበል")}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* TAB 3: HISTORY */}
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
                  {t("Transfer History", "የዝውውር ታሪክ")}
                </h3>
                <p className="text-[10px] text-white/50 font-medium">
                  {t("View completed transfer requests", "የተጠናቀቁ የዝውውር ጥያቄዎችን ይመልከቱ")}
                </p>
              </div>
            </div>
          </div>

          {!transferHistory ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-400">
                {t("Loading history...", "ታሪክን በማምጣት ላይ...")}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              <div className="p-6">
                <h4 className="text-sm font-bold text-[#003366] mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#003366] to-[#001F3F] text-[#FFD700] flex items-center justify-center shadow-sm">
                    <Send className="w-3 h-3" />
                  </div>
                  {t("Initiated by Your Organization", "በድርጅትዎ የተጀመሩ")}
                </h4>
                {transferHistory.initiated.length === 0 ? (
                  <p className="text-xs text-gray-400 ml-8">{t("No initiated transfers completed yet.", "ገና ምንም የተጀመረ ዝውውር አልተጠናቀቀም።")}</p>
                ) : (
                  <div className="space-y-3 ml-8">
                    {transferHistory.initiated.map((request, idx) => (
                      <motion.div
                        key={`initiated-${request.id}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        whileHover={{ y: -1 }}
                        className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 hover:border-[#FFD700]/30 hover:bg-gradient-to-r hover:from-[#FFD700]/5 hover:to-transparent transition-all"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge(request.status)}`}>
                              {isAm ? 
                                request.status === "APPROVED" ? "ጸድቋል" : 
                                request.status === "REJECTED" ? "ውድቅ" : 
                                request.status.includes("RELEASE") ? "የተለቀቀ" : request.status : 
                                request.status.replace("_", " ")}
                            </span>
                            <h5 className="text-base font-bold text-gray-900 mt-1">{request.employee.user.fullName}</h5>
                            <p className="text-xs text-gray-500">{t("Fayda:", "ፋይዳ፡")} {request.employee.user.faydaId}</p>
                          </div>
                          <div className="text-right text-xs text-gray-400">
                            <p className="flex items-center gap-1 justify-end"><Clock className="w-3 h-3" /> {new Date(request.updatedAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-3 text-xs text-gray-600">
                          <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                            <p className="font-bold text-gray-800">{t("Destination", "መድረሻ")}</p>
                            <p>{request.targetOrganization.name}</p>
                          </div>
                          <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                            <p className="font-bold text-gray-800">{t("Position", "ሹመት")}</p>
                            <p>{request.position?.name || request.employee.position?.name || t("Unspecified", "ያልተገለጸ")}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6">
                <h4 className="text-sm font-bold text-[#003366] mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#003366] to-[#001F3F] text-[#FFD700] flex items-center justify-center shadow-sm">
                    <UserCheck className="w-3 h-3" />
                  </div>
                  {t("Incoming to Your Organization", "ወደ ድርጅትዎ የገቡ")}
                </h4>
                {transferHistory.incoming.length === 0 ? (
                  <p className="text-xs text-gray-400 ml-8">{t("No incoming transfers completed yet.", "ገና ምንም የገባ ዝውውር አልተጠናቀቀም።")}</p>
                ) : (
                  <div className="space-y-3 ml-8">
                    {transferHistory.incoming.map((request, idx) => (
                      <motion.div
                        key={`incoming-${request.id}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        whileHover={{ y: -1 }}
                        className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 hover:border-[#FFD700]/30 hover:bg-gradient-to-r hover:from-[#FFD700]/5 hover:to-transparent transition-all"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge(request.status)}`}>
                              {isAm ? 
                                request.status === "APPROVED" ? "ጸድቋል" : 
                                request.status === "REJECTED" ? "ውድቅ" : 
                                request.status.includes("RELEASE") ? "የተለቀቀ" : request.status : 
                                request.status.replace("_", " ")}
                            </span>
                            <h5 className="text-base font-bold text-gray-900 mt-1">{request.employee.user.fullName}</h5>
                            <p className="text-xs text-gray-500">{t("Fayda:", "ፋይዳ፡")} {request.employee.user.faydaId}</p>
                          </div>
                          <div className="text-right text-xs text-gray-400">
                            <p className="flex items-center gap-1 justify-end"><Clock className="w-3 h-3" /> {new Date(request.updatedAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-3 text-xs text-gray-600">
                          <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                            <p className="font-bold text-gray-800">{t("Source", "ምንጭ")}</p>
                            <p>{request.sourceOrganization.name}</p>
                          </div>
                          <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                            <p className="font-bold text-gray-800">{t("Position", "ሹመት")}</p>
                            <p>{request.position?.name || request.employee.position?.name || t("Unspecified", "ያልተገለጸ")}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* TAB 4: REQUEST ADDRESS HISTORY */}
      {activeTab === "addressHistory" && (
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
                <MapPin className="w-4 h-4 text-[#FFD700]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {t("Request Address History", "የአድራሻ ጥያቄ ታሪክ")}
                </h3>
                <p className="text-[10px] text-white/50 font-medium">
                  {t("View address change requests submitted by employees", "በሰራተኞች የቀረቡ የአድራሻ ለውጥ ጥያቄዎችን ይመልከቱ")}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#003366] text-white text-[11px] uppercase tracking-[0.2em]">
                  <th className="p-4">{t("Employee Name", "የሰራተኛ ስም")}</th>
                  <th className="p-4">{t("Fayda ID", "የፋይዳ መታወቂያ")}</th>
                  <th className="p-4">{t("From Address", "የቀድሞ አድራሻ")}</th>
                  <th className="p-4">{t("To Address", "አዲስ አድራሻ")}</th>
                  <th className="p-4">{t("Status", "ሁኔታ")}</th>
                  <th className="p-4">{t("Date", "ቀን")}</th>
                  <th className="p-4">{t("Action", "ድርጊት")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700">
                {[
                  { id: 1, name: "Abebe Kebede", fayda: "FAN-2024-001", from: "Bole, Woreda 03", to: "Kazanchis, Woreda 01", status: "Approved", date: "2024-12-15" },
                  { id: 2, name: "Tigist Haile", fayda: "FAN-2024-002", from: "Megenagna, Woreda 08", to: "CMC, Woreda 12", status: "Pending", date: "2025-01-10" },
                  { id: 3, name: "Dawit Eshetu", fayda: "FAN-2024-003", from: "Piassa, Woreda 02", to: "Mexico, Woreda 05", status: "Rejected", date: "2025-02-20" },
                  { id: 4, name: "Meron Alemu", fayda: "FAN-2024-004", from: "Saris, Woreda 07", to: "Ayat, Woreda 15", status: "Approved", date: "2025-03-05" },
                  { id: 5, name: "Biruk Tadesse", fayda: "FAN-2024-005", from: "Gofa, Woreda 11", to: "Summit, Woreda 09", status: "Suspended", date: "2025-03-18" },
                ].map((row) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ backgroundColor: "rgba(0,51,102,0.02)" }}
                    className="transition-colors"
                  >
                    <td className="p-4 font-bold text-[#003366]">{row.name}</td>
                    <td className="p-4 text-xs text-gray-500">{row.fayda}</td>
                    <td className="p-4">{row.from}</td>
                    <td className="p-4">{row.to}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        row.status === "Approved" ? "bg-green-50 text-green-700 border border-green-200" :
                        row.status === "Pending" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                        row.status === "Rejected" ? "bg-red-50 text-red-700 border border-red-200" :
                        "bg-gray-50 text-gray-700 border border-gray-200"
                      }`}>
                        {isAm ?
                          row.status === "Approved" ? "ጸድቋል" :
                          row.status === "Pending" ? "በመጠባበቅ ላይ" :
                          row.status === "Rejected" ? "ውድቅ" :
                          row.status === "Suspended" ? "ታግዷል" : row.status
                          : row.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-400">{row.date}</td>
                    <td className="p-4 text-right">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        className="px-3 py-1.5 bg-[#003366] text-[#FFD700] rounded-lg text-xs font-bold hover:shadow-md transition-shadow inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> {t("Detail View", "ዝርዝር እይታ")}
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
