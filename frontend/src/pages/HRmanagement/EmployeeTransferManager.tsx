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
    "initiate" | "incoming" | "history"
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
  const [pendingRequests, setPendingRequests] = useState<TransferRequestItem[]>([
    { id: 1, employeeId: 101, employee: { user: { fullName: "Abebe Kebede", faydaId: "FAN-2024-001" }, position: { name: "Security Guard" } }, sourceOrganization: { name: "Alpha Security Plc" }, targetOrganization: { name: "Beta Logistics" }, position: { name: "Senior Security Guard" }, status: "PENDING", reason: "Career advancement within the security division", createdAt: "2025-01-15T10:00:00Z", updatedAt: "2025-01-15T10:00:00Z" },
    { id: 2, employeeId: 102, employee: { user: { fullName: "Tigist Haile", faydaId: "FAN-2024-002" }, position: { name: "Admin Officer" } }, sourceOrganization: { name: "Beta Logistics" }, targetOrganization: { name: "Gamma Industries" }, position: { name: "Senior Admin Officer" }, status: "PENDING", reason: "Promotion to senior administrative role", createdAt: "2025-02-20T14:30:00Z", updatedAt: "2025-02-20T14:30:00Z" },
    { id: 3, employeeId: 103, employee: { user: { fullName: "Dawit Eshetu", faydaId: "FAN-2024-003" }, position: { name: "Operations Head" } }, sourceOrganization: { name: "Gamma Industries" }, targetOrganization: { name: "Alpha Security Plc" }, position: { name: "Regional Operations Manager" }, status: "PENDING", reason: "Inter-company transfer for expanded operational oversight", createdAt: "2025-03-10T09:15:00Z", updatedAt: "2025-03-10T09:15:00Z" },
  ]);
  const [incomingSearch, setIncomingSearch] = useState("");
  const [incomingFilter, setIncomingFilter] = useState<string>("ALL");
  const [historySearch, setHistorySearch] = useState("");
  const [historyFilter, setHistoryFilter] = useState<string>("ALL");
  const [transferHistory, setTransferHistory] =
    useState<TransferHistoryResponse | null>({
      initiated: [
        { id: 4, employeeId: 104, employee: { user: { fullName: "Meron Alemu", faydaId: "FAN-2024-004" }, position: { name: "HR Coordinator" } }, sourceOrganization: { name: "Alpha Security Plc" }, targetOrganization: { name: "Delta Construction" }, position: { name: "HR Manager" }, status: "APPROVED", reason: "Promotion to managerial position", createdAt: "2024-11-01T08:00:00Z", updatedAt: "2024-11-15T10:00:00Z" },
        { id: 5, employeeId: 105, employee: { user: { fullName: "Biruk Tadesse", faydaId: "FAN-2024-005" }, position: { name: "IT Support" } }, sourceOrganization: { name: "Alpha Security Plc" }, targetOrganization: { name: "Epsilon Tech" }, position: { name: "IT Team Lead" }, status: "REJECTED", reason: "Skills mismatch with target role", createdAt: "2025-01-05T11:00:00Z", updatedAt: "2025-01-12T16:00:00Z" },
      ],
      incoming: [
        { id: 6, employeeId: 106, employee: { user: { fullName: "Sara Hailu", faydaId: "FAN-2024-006" }, position: { name: "Accountant" } }, sourceOrganization: { name: "Zeta Finance" }, targetOrganization: { name: "Alpha Security Plc" }, position: { name: "Senior Accountant" }, status: "APPROVED", reason: "Financial expertise needed for expansion", createdAt: "2025-02-10T07:30:00Z", updatedAt: "2025-02-25T09:00:00Z" },
        { id: 7, employeeId: 107, employee: { user: { fullName: "Lemma Hailu", faydaId: "FAN-2024-007" }, position: { name: "Field Officer" } }, sourceOrganization: { name: "Eta Services" }, targetOrganization: { name: "Alpha Security Plc" }, position: { name: "Senior Field Officer" }, status: "SOURCE_RELEASED", reason: "Experienced field personnel transfer", createdAt: "2025-03-01T13:00:00Z", updatedAt: "2025-03-10T08:00:00Z" },
      ],
    });

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
      if (result?.data && result.data.length > 0) {
        setPendingRequests(result.data);
      }
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
      if (result?.data && (result.data.initiated?.length > 0 || result.data.incoming?.length > 0)) {
        setTransferHistory(result.data);
      }
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

          <div className="p-4 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={incomingSearch}
                  onChange={(e) => setIncomingSearch(e.target.value)}
                  placeholder={t("Search by name, Fayda ID, or organization...", "በስም፣ በፋይዳ መታወቂያ ወይም በድርጅት ይፈልጉ...")}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition-all"
                />
              </div>
              <select
                value={incomingFilter}
                onChange={(e) => setIncomingFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 bg-gray-50 outline-none focus:ring-2 focus:ring-[#003366]/20"
              >
                <option value="ALL">{t("All Status", "ሁሉም ሁኔታ")}</option>
                <option value="PENDING">{t("Pending", "በመጠባበቅ ላይ")}</option>
              </select>
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
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#003366] text-white text-[11px] uppercase tracking-[0.2em]">
                    <th className="p-4">{t("Employee Name", "የሰራተኛ ስም")}</th>
                    <th className="p-4">{t("Fayda ID", "የፋይዳ መታወቂያ")}</th>
                    <th className="p-4">{t("From", "ከ")}</th>
                    <th className="p-4">{t("To", "ወደ")}</th>
                    <th className="p-4">{t("Position", "ሹመት")}</th>
                    <th className="p-4">{t("Reason", "ምክንያት")}</th>
                    <th className="p-4">{t("Status", "ሁኔታ")}</th>
                    <th className="p-4">{t("Action", "ድርጊት")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-700">
                  {(() => {
                    const filtered = pendingRequests.filter((r) => {
                      const q = incomingSearch.toLowerCase();
                      const matchesSearch = !incomingSearch ||
                        r.employee?.user?.fullName.toLowerCase().includes(q) ||
                        r.employee?.user?.faydaId.toLowerCase().includes(q) ||
                        r.sourceOrganization?.name.toLowerCase().includes(q) ||
                        r.targetOrganization?.name.toLowerCase().includes(q);
                      const matchesFilter = incomingFilter === "ALL" || r.status === incomingFilter;
                      return matchesSearch && matchesFilter;
                    });
                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td colSpan={8} className="p-12 text-center">
                            <Search className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm text-gray-400 font-medium">
                              {t("No matching requests found", "ምንም የሚዛመድ ጥያቄ አልተገኘም")}
                            </p>
                          </td>
                        </tr>
                      );
                    }
                    return filtered.map((request, idx) => (
                      <motion.tr
                      key={request.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      whileHover={{ backgroundColor: "rgba(0,51,102,0.02)" }}
                      className="transition-colors"
                    >
                      <td className="p-4 font-bold text-[#003366]">{request.employee?.user?.fullName}</td>
                      <td className="p-4 text-xs text-gray-500">{request.employee?.user?.faydaId}</td>
                      <td className="p-4">{request.sourceOrganization?.name}</td>
                      <td className="p-4">{request.targetOrganization?.name}</td>
                      <td className="p-4">{request.position?.name || request.employee?.position?.name || "-"}</td>
                      <td className="p-4 max-w-[160px] truncate">{request.reason}</td>
                      <td className="p-4">
                        <span className="text-[10px] bg-[#FFD700]/15 text-[#C5A022] font-bold px-2.5 py-1 rounded-full">
                          {t("Pending Review", "በግምገማ ላይ")}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            type="button"
                            disabled={isLoading}
                            onClick={() => openApproveDialog(request.id, request.employee?.user?.fullName)}
                            className="px-3 py-1.5 bg-gradient-to-r from-[#003366] to-[#001F3F] text-white rounded-lg text-xs font-bold hover:shadow-md transition-all disabled:opacity-50 inline-flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" /> {t("Release", "ልቀቅ")}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            type="button"
                            disabled={isLoading}
                            onClick={() => openRejectDialog(request.id, request.employee?.user?.fullName)}
                            className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all disabled:opacity-50 inline-flex items-center gap-1"
                          >
                            <X className="w-3 h-3" /> {t("Decline", "አይቀበል")}
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                    ));
                  })()}
                </tbody>
              </table>
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

          <div className="p-4 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder={t("Search history by name, Fayda ID, or organization...", "በስም፣ በፋይዳ መታወቂያ ወይም በድርጅት ታሪክ ይፈልጉ...")}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition-all"
                />
              </div>
              <select
                value={historyFilter}
                onChange={(e) => setHistoryFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 bg-gray-50 outline-none focus:ring-2 focus:ring-[#003366]/20"
              >
                <option value="ALL">{t("All Status", "ሁሉም ሁኔታ")}</option>
                <option value="APPROVED">{t("Approved", "ጸድቋል")}</option>
                <option value="REJECTED">{t("Rejected", "ውድቅ")}</option>
                <option value="SOURCE_RELEASED">{t("Released", "የተለቀቀ")}</option>
              </select>
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
                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-[#003366] text-white text-[11px] uppercase tracking-[0.2em]">
                          <th className="p-3">{t("Employee Name", "የሰራተኛ ስም")}</th>
                          <th className="p-3">{t("Fayda ID", "የፋይዳ መታወቂያ")}</th>
                          <th className="p-3">{t("Destination", "መድረሻ")}</th>
                          <th className="p-3">{t("Position", "ሹመት")}</th>
                          <th className="p-3">{t("Status", "ሁኔታ")}</th>
                          <th className="p-3">{t("Date", "ቀን")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 text-gray-700">
                        {(() => {
                          const filtered = transferHistory.initiated.filter((r) => {
                            const q = historySearch.toLowerCase();
                            const matchesSearch = !historySearch ||
                              r.employee.user.fullName.toLowerCase().includes(q) ||
                              r.employee.user.faydaId.toLowerCase().includes(q) ||
                              r.targetOrganization.name.toLowerCase().includes(q);
                            const matchesFilter = historyFilter === "ALL" || r.status === historyFilter;
                            return matchesSearch && matchesFilter;
                          });
                          return filtered.length > 0 ? filtered.map((request, idx) => (
                          <motion.tr
                            key={`initiated-${request.id}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: idx * 0.05 }}
                            whileHover={{ backgroundColor: "rgba(0,51,102,0.02)" }}
                            className="transition-colors"
                          >
                            <td className="p-3 font-bold text-[#003366]">{request.employee.user.fullName}</td>
                            <td className="p-3 text-xs text-gray-500">{request.employee.user.faydaId}</td>
                            <td className="p-3">{request.targetOrganization.name}</td>
                            <td className="p-3">{request.position?.name || request.employee.position?.name || t("Unspecified", "ያልተገለጸ")}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${statusBadge(request.status)}`}>
                                {isAm ? 
                                  request.status === "APPROVED" ? "ጸድቋል" : 
                                  request.status === "REJECTED" ? "ውድቅ" : 
                                  request.status.includes("RELEASE") ? "የተለቀቀ" : request.status : 
                                  request.status.replace("_", " ")}
                              </span>
                            </td>
                            <td className="p-3 text-xs text-gray-400">{new Date(request.updatedAt).toLocaleString()}</td>
                           </motion.tr>
                          )) : (
                            <tr>
                              <td colSpan={6} className="p-8 text-center">
                                <Search className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-400 font-medium">
                                  {t("No matching history found", "ምንም የሚዛመድ ታሪክ አልተገኘም")}
                                </p>
                              </td>
                            </tr>
                          );
                        })()}
                      </tbody>
                    </table>
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
                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-[#003366] text-white text-[11px] uppercase tracking-[0.2em]">
                          <th className="p-3">{t("Employee Name", "የሰራተኛ ስም")}</th>
                          <th className="p-3">{t("Fayda ID", "የፋይዳ መታወቂያ")}</th>
                          <th className="p-3">{t("Source", "ምንጭ")}</th>
                          <th className="p-3">{t("Position", "ሹመት")}</th>
                          <th className="p-3">{t("Status", "ሁኔታ")}</th>
                          <th className="p-3">{t("Date", "ቀን")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 text-gray-700">
                        {(() => {
                          const filtered = transferHistory.incoming.filter((r) => {
                            const q = historySearch.toLowerCase();
                            const matchesSearch = !historySearch ||
                              r.employee.user.fullName.toLowerCase().includes(q) ||
                              r.employee.user.faydaId.toLowerCase().includes(q) ||
                              r.sourceOrganization.name.toLowerCase().includes(q);
                            const matchesFilter = historyFilter === "ALL" || r.status === historyFilter;
                            return matchesSearch && matchesFilter;
                          });
                          return filtered.length > 0 ? filtered.map((request, idx) => (
                          <motion.tr
                            key={`incoming-${request.id}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: idx * 0.05 }}
                            whileHover={{ backgroundColor: "rgba(0,51,102,0.02)" }}
                            className="transition-colors"
                          >
                            <td className="p-3 font-bold text-[#003366]">{request.employee.user.fullName}</td>
                            <td className="p-3 text-xs text-gray-500">{request.employee.user.faydaId}</td>
                            <td className="p-3">{request.sourceOrganization.name}</td>
                            <td className="p-3">{request.position?.name || request.employee.position?.name || t("Unspecified", "ያልተገለጸ")}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${statusBadge(request.status)}`}>
                                {isAm ? 
                                  request.status === "APPROVED" ? "ጸድቋል" : 
                                  request.status === "REJECTED" ? "ውድቅ" : 
                                  request.status.includes("RELEASE") ? "የተለቀቀ" : request.status : 
                                  request.status.replace("_", " ")}
                              </span>
                            </td>
                            <td className="p-3 text-xs text-gray-400">{new Date(request.updatedAt).toLocaleString()}</td>
                          </motion.tr>
                          )) : (
                            <tr>
                              <td colSpan={6} className="p-8 text-center">
                                <Search className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-400 font-medium">
                                  {t("No matching history found", "ምንም የሚዛመድ ታሪክ አልተገኘም")}
                                </p>
                              </td>
                            </tr>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}

    </motion.div>
  );
}
