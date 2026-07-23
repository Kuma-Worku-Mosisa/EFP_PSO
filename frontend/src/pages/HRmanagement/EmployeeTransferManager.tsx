//filepath: frontend/src/pages/HRmanagement/EmployeeTransferManager.tsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  ArrowLeftRight,
  UserCheck,
  Check,
  AlertCircle,
  Send,
  History,
  Clock,
  MapPin,
  Briefcase,
  Mail,
  Fingerprint,
  Upload,
  FileText,
  Eye,
  Trash2,
  CheckCircle2,
  X,
} from "lucide-react";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { AutoDismissToast } from "../../components/AutoDismissToast";
import { apiRequest } from "../../lib/api";
import {
  uploadOrganizationDocuments,
  validateFile,
  formatFileSize,
  getDocumentTypeName,
} from "../../lib/fileUploadHelper";
import { useLanguage } from "../../context/LanguageContext";

// Expected TypeScript interface for an employee returned from lookups
interface EmployeeProfile {
  id: number;
  faydaId: string;
  isBlacklisted: boolean;
  employmentStatus: string;
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
  const [activeTab, setActiveTab] = useState<"initiate" | "history">(
    "initiate",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);

  const [transferDocumentFiles, setTransferDocumentFiles] = useState<
    Record<string, File | null>
  >({
    fingerprint_doc: null,
    organization_id_doc: null,
    medical_doc: null,
    guarantee_doc: null,
    resignation_record_doc: null,
  });
  const [documentUploadError, setDocumentUploadError] = useState<string | null>(
    null,
  );

  const [lookupBlockedMessage, setLookupBlockedMessage] = useState<
    string | null
  >(null);
  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType] = useState<"approve" | "reject" | "default">("default");
  const [confirmTargetId] = useState<number | null>(null);
  const [confirmTitle] = useState("");
  const [confirmMessage] = useState("");
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  // Toast handled by AutoDismissToast
  const [toastOpen, setToastOpen] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMessage, setToastMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeDocField, setActiveDocField] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Tab 1: Initiate Form State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedEmployee, setSearchedEmployee] =
    useState<EmployeeProfile | null>(null);
  const [transferPayload, setTransferPayload] = useState({
    transferReason: "",
  });

  const [historySearch, setHistorySearch] = useState("");
  const [historyFilter, setHistoryFilter] = useState<string>("ALL");
  const [transferHistory, setTransferHistory] =
    useState<TransferHistoryResponse | null>(null);

  // Automatically fetch pending items or history when changing tabs
  useEffect(() => {
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
    setLookupBlockedMessage(null);
    setSearchedEmployee(null);

    try {
      const result = await apiRequest(
        `/transfers/employee-lookup?query=${encodeURIComponent(searchQuery.trim())}`,
      );
      const employee: EmployeeProfile = result.data;
      const normalizedEmploymentStatus = String(employee.employmentStatus ?? "")
        .trim()
        .toLowerCase();

      if (employee.isBlacklisted) {
        setLookupBlockedMessage(
          t(
            "This employee is blacklisted and cannot be processed until the blacklist status is cleared. Please contact EFP to resolve the blacklist record before proceeding.",
            "ይህ ሰራተኛ በጥርስ ዝርዝር ላይ ነው፣ እስካሁን ድረስ ማንኛውም ሂደት ሊከናወን አይችልም። እባክዎ ጥርስ ሁኔታውን ከEFP ጋር ያከናውኑ።",
          ),
        );
        return;
      }

      const isResigned = normalizedEmploymentStatus === "resigned";
      if (!isResigned) {
        setLookupBlockedMessage(
          t(
            "This employee is not marked as 'Resigned'. Transfer verification documents can only be submitted for resigned employees.",
            "ይህ ሰራተኛ 'የተቀረ' እንደማይሆን ተመልከቱ። የዝውውር ማረጋገጫ ሰነዶች ለየተቀረ ሰራተኞች ብቻ ናቸው።",
          ),
        );
        setSearchedEmployee(employee);
        return;
      }

      setSearchedEmployee(employee);
    } catch (err: any) {
      setGlobalError(
        err.message || "No active employee found matching identity parameters.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Action B: Push a new pending routing record downstream to target organization
  const handleTransferDocSelect = (fieldName: string, file: File | null) => {
    setDocumentUploadError(null);

    if (!file) {
      setTransferDocumentFiles((prev) => ({
        ...prev,
        [fieldName]: null,
      }));
      return;
    }

    const validation = validateFile(file);
    if (!validation.valid) {
      setDocumentUploadError(validation.error || "Invalid file selection.");
      setTransferDocumentFiles((prev) => ({
        ...prev,
        [fieldName]: null,
      }));
      return;
    }

    setTransferDocumentFiles((prev) => ({
      ...prev,
      [fieldName]: file,
    }));
  };

  const handleInitiateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchedEmployee) return;

    const requiredDocumentFields = [
      "fingerprint_doc",
      "organization_id_doc",
      "medical_doc",
      "guarantee_doc",
      "resignation_record_doc",
    ];

    const missingDocs = requiredDocumentFields.filter(
      (fieldName) => !transferDocumentFiles[fieldName],
    );

    if (missingDocs.length > 0) {
      setDocumentUploadError(
        t(
          "Please attach all required resigned employee documents before submitting.",
          "የተቀረ ሰራተኛ ሰነዶችን ከማስገባት በፊት እባክዎ ያገኙ።",
        ),
      );
      return;
    }

    // Build the upload payload using role-prefixed field names so the backend
    // middleware accepts the form fields as valid `{role}_{documentType}` entries.
    const filesToUpload: Record<string, File> = {};

    requiredDocumentFields.forEach((fieldName) => {
      const file = transferDocumentFiles[fieldName];
      if (file) filesToUpload[fieldName] = file;
    });

    setIsLoading(true);
    setGlobalError(null);
    setDocumentUploadError(null);

    try {
      const uploadResult = await uploadOrganizationDocuments(
        searchedEmployee.organization.name,
        filesToUpload,
        {
          employeeId: String(searchedEmployee.id),
          employeeFullName: searchedEmployee.user.fullName,
          employeePositionName: searchedEmployee.position.name,
        },
      );

      if (!uploadResult.success || !uploadResult.data?.uploadedFiles) {
        throw new Error(
          uploadResult.error ||
            uploadResult.message ||
            "Document upload failed",
        );
      }

      const uploadedFiles = uploadResult.data.uploadedFiles || {};

      await apiRequest("/transfers", {
        method: "POST",
        body: JSON.stringify({
          employeeId: searchedEmployee.id,
          reason: transferPayload.transferReason,
          uploadedFiles,
        }),
      });

      setGlobalSuccess(
        `Change record for ${searchedEmployee.user.fullName} Done safely!`,
      );
      setToastType("success");
      setToastMessage(
        t(
          "Leader Change request submitted successfully.",
          "የአመራር ለውጥ ጥያቄ በተሳካ ሁኔታ ተላከ።",
        ),
      );
      setToastOpen(true);

      setSearchedEmployee(null);
      setSearchQuery("");
      setTransferPayload({ transferReason: "" });
      setTransferDocumentFiles({
        fingerprint_doc: null,
        organization_id_doc: null,
        medical_doc: null,
        guarantee_doc: null,
        resignation_record_doc: null,
      });

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      setDocumentUploadError(err.message || null);
      setGlobalError(err.message || "Failed to submit transfer request.");
    } finally {
      setIsLoading(false);
    }
  };

  // (Incoming requests removed)

  const fetchTransferHistory = async () => {
    setIsLoading(true);
    setGlobalError(null);
    try {
      const result = await apiRequest("/transfers/history");
      if (
        result?.data &&
        (result.data.initiated?.length > 0 || result.data.incoming?.length > 0)
      ) {
        setTransferHistory(result.data);
      }
    } catch (err: any) {
      setGlobalError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Action D: Execute transactional workflow actions (REJECT only)
  const handleApprovalDecision = async (
    id: number,
    decision: "REJECT",
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
      // No incoming list maintained on this UI; frontend history will refresh separately
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

  const handleDialogConfirm = async () => {
    if (!confirmTargetId) return;
    setConfirmLoading(true);
    try {
      if (confirmType === "reject") {
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
        inputLabel={
          confirmType === "reject"
            ? t("Rejection Justification", "የመቀበል ማረጋገጫ")
            : undefined
        }
        inputValue={rejectionReason}
        onInputChange={(v) => setRejectionReason(v)}
        inputPlaceholder={
          confirmType === "reject"
            ? t(
                "Enter a concise justification for rejection",
                "እባክዎ አጭር ማረጋገጫ ያስገቡ",
              )
            : undefined
        }
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
              {t(
                "Transfer personnel across organizational structures safely.",
                "ሰራተኞችን በድርጅት መዋቅሮች መካከል በደህና ያስተላልፉ።",
              )}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          {
            key: "initiate",
            label: t("Initiate Request", "ጥያቄ ይጀምሩ"),
            icon: <Send className="w-4 h-4" />,
          },
          {
            key: "history",
            label: t("Transfer  and Received History", "የዝውውር ታሪክ"),
            icon: <History className="w-4 h-4" />,
          },
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
                  placeholder={t(
                    "Enter Fayda ID or Email...",
                    "የፋይዳ መታወቂያ ወይም ኢሜይል ያስገቡ...",
                  )}
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
                {isLoading
                  ? t("Verifying...", "በማረጋገጥ ላይ...")
                  : t("Verify Identity", "ማንነት ያረጋግጡ")}
              </motion.button>
            </div>
          </div>

          {lookupBlockedMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
            >
              <div className="font-bold mb-2">
                {t("Verification blocked", "ማረጋገጫ ተከልክሏል")}
              </div>
              <p>{lookupBlockedMessage}</p>
            </motion.div>
          )}

          {searchedEmployee && !lookupBlockedMessage && (
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
                    {t("Step 2: Recieved Details", "ደረጃ 2፡ የተቀበሉ ዝርዝሮች")}
                  </h3>
                </div>

                <div className="text-xs text-gray-500 space-y-1 mb-4 p-3 bg-gray-50 rounded-xl">
                  <p>
                    {t("Employee:", "ሰራተኛ፡")}{" "}
                    {searchedEmployee.faydaId || searchedEmployee.user.email}
                  </p>
                  <p>
                    {t("Organization:", "ድርጅት፡")}{" "}
                    {searchedEmployee.organization.name}
                  </p>
                  <p>
                    {t("Position:", "ሹመት፡")} {searchedEmployee.position.name}
                  </p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-6"
                >
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#003366] to-[#001F3F] text-[#FFD700] flex items-center justify-center shadow-sm">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#003366]">
                        {t("Upload required documents", "የሚያስፈልጉ ሰነዶችን ይስቀሉ")}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {t(
                          "Add the resigned employee documents below before submitting the transfer request.",
                          "የተቀረው ሰራተኛ ሰነዶችን የዝውውር ጥያቄ ከማስገባት በፊት ያስጨምሩ።",
                        )}
                      </p>
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file && activeDocField) {
                        handleTransferDocSelect(activeDocField, file);
                      }
                      e.target.value = "";
                    }}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      {
                        fieldName: "fingerprint_doc",
                        labelEn: "Fingerprint from Police",
                        labelAm: "ከፖሊስ የጣት አሻራ",
                      },
                      {
                        fieldName: "organization_id_doc",
                        labelEn: "Organizational Identification",
                        labelAm: "የድርጅት መታወቂያ",
                      },
                      {
                        fieldName: "medical_doc",
                        labelEn: "Medical Result",
                        labelAm: "የህክምና ውጤት",
                      },
                      {
                        fieldName: "guarantee_doc",
                        labelEn: "Proof of Guarantee",
                        labelAm: "የማስረጃ ማስረጃ",
                      },
                      {
                        fieldName: "resignation_record_doc",
                        labelEn: "Resignation Record",
                        labelAm: "የመልቀቂያ መዝገብ",
                      },
                    ].map((docItem) => {
                      const selectedFile = transferDocumentFiles[docItem.fieldName];
                      const docLabel = isAm ? docItem.labelAm : docItem.labelEn;
                      return (
                        <motion.div
                          key={docItem.fieldName}
                          whileHover={{ y: -2 }}
                          className={`group relative rounded-[20px] border-2 transition-all duration-500 p-4 ${
                            selectedFile
                              ? "bg-white border-solid border-green-200 shadow-lg shadow-green-500/5 ring-4 ring-green-50/30"
                              : "bg-gray-50/50 border-dashed border-gray-200 hover:border-[#003366]/40 hover:bg-white"
                          }`}
                        >
                          {selectedFile && (
                            <div className="absolute -top-3 -right-3 z-10">
                              <div className="flex items-center space-x-1 bg-green-500 text-white px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl shadow-green-500/30 border-2 border-white">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{t("UPLOADED", "ተሰቅሏል")}</span>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-4">
                            <div
                              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 flex-shrink-0 shadow-sm ${
                                selectedFile
                                  ? "bg-green-50 text-green-500"
                                  : "bg-white border text-gray-400"
                              }`}
                            >
                              {selectedFile ? (
                                <FileText className="w-6 h-6" />
                              ) : (
                                <Upload className="w-6 h-6" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h4
                                  className={`text-sm font-black tracking-tight break-words leading-snug ${
                                    selectedFile ? "text-green-600" : "text-[#003366]"
                                  }`}
                                >
                                  {selectedFile ? selectedFile.name : docLabel}
                                </h4>
                                <span className="text-xs text-orange-500 font-black bg-orange-50 px-1.5 rounded-md">
                                  *
                                </span>
                              </div>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                                  {selectedFile
                                    ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                                    : "PDF Max 5MB"}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 flex-shrink-0">
                              {!selectedFile ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveDocField(docItem.fieldName);
                                    fileInputRef.current?.click();
                                  }}
                                  className="px-4 py-2 bg-white border-2 border-gray-100 text-[#003366] rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:border-[#003366] hover:shadow-lg transition-all active:scale-95"
                                >
                                  {t("Select File", "ፋይል ይምረጡ")}
                                </button>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (selectedFile) {
                                        setPreviewUrl(URL.createObjectURL(selectedFile));
                                      }
                                    }}
                                    className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setTransferDocumentFiles((prev) => ({
                                        ...prev,
                                        [docItem.fieldName]: null,
                                      }));
                                    }}
                                    className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {documentUploadError && (
                    <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {documentUploadError}
                    </div>
                  )}
                </motion.div>

                <div className="pt-4 border-t border-gray-100 mt-4 flex justify-end">
                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#003366] to-[#001F3F] hover:from-[#001F3F] hover:to-[#000F1F] disabled:from-gray-300 disabled:to-gray-300 text-white px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md"
                  >
                    <Send className="w-4 h-4" />
                    {isLoading
                      ? t("Processing...", "በማስኬድ ላይ...")
                      : t("Submit Change Request", "የለውጥ ጥያቄ ያስገቡ")}
                  </motion.button>
                </div>
              </div>
            </motion.form>
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
                  {t(
                    "View completed transfer requests",
                    "የተጠናቀቁ የዝውውር ጥያቄዎችን ይመልከቱ",
                  )}
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
                  placeholder={t(
                    "Search history by name, Fayda ID, or organization...",
                    "በስም፣ በፋይዳ መታወቂያ ወይም በድርጅት ታሪክ ይፈልጉ...",
                  )}
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
                <option value="SOURCE_RELEASED">
                  {t("Released", "የተለቀቀ")}
                </option>
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
                  <p className="text-xs text-gray-400 ml-8">
                    {t(
                      "No initiated transfers completed yet.",
                      "ገና ምንም የተጀመረ ዝውውር አልተጠናቀቀም።",
                    )}
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-[#003366] text-white text-[11px] uppercase tracking-[0.2em]">
                          <th className="p-3">
                            {t("Employee Name", "የሰራተኛ ስም")}
                          </th>
                          <th className="p-3">{t("Fayda ID", "የፋይዳ መታወቂያ")}</th>
                          <th className="p-3">{t("Destination", "መድረሻ")}</th>
                          <th className="p-3">{t("Position", "ሹመት")}</th>
                          <th className="p-3">{t("Status", "ሁኔታ")}</th>
                          <th className="p-3">{t("Date", "ቀን")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 text-gray-700">
                        {(() => {
                          const filtered = transferHistory.initiated.filter(
                            (r) => {
                              const q = historySearch.toLowerCase();
                              const matchesSearch =
                                !historySearch ||
                                r.employee.user.fullName
                                  .toLowerCase()
                                  .includes(q) ||
                                r.employee.user.faydaId
                                  .toLowerCase()
                                  .includes(q) ||
                                r.targetOrganization.name
                                  .toLowerCase()
                                  .includes(q);
                              const matchesFilter =
                                historyFilter === "ALL" ||
                                r.status === historyFilter;
                              return matchesSearch && matchesFilter;
                            },
                          );
                          return filtered.length > 0 ? (
                            filtered.map((request, idx) => (
                              <motion.tr
                                key={`initiated-${request.id}`}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  duration: 0.3,
                                  delay: idx * 0.05,
                                }}
                                whileHover={{
                                  backgroundColor: "rgba(0,51,102,0.02)",
                                }}
                                className="transition-colors"
                              >
                                <td className="p-3 font-bold text-[#003366]">
                                  {request.employee.user.fullName}
                                </td>
                                <td className="p-3 text-xs text-gray-500">
                                  {request.employee.user.faydaId}
                                </td>
                                <td className="p-3">
                                  {request.targetOrganization.name}
                                </td>
                                <td className="p-3">
                                  {request.position?.name ||
                                    request.employee.position?.name ||
                                    t("Unspecified", "ያልተገለጸ")}
                                </td>
                                <td className="p-3">
                                  <span
                                    className={`px-2 py-0.5 rounded text-xs font-semibold ${statusBadge(request.status)}`}
                                  >
                                    {isAm
                                      ? request.status === "APPROVED"
                                        ? "ጸድቋል"
                                        : request.status === "REJECTED"
                                          ? "ውድቅ"
                                          : request.status.includes("RELEASE")
                                            ? "የተለቀቀ"
                                            : request.status
                                      : request.status.replace("_", " ")}
                                  </span>
                                </td>
                                <td className="p-3 text-xs text-gray-400">
                                  {new Date(request.updatedAt).toLocaleString()}
                                </td>
                              </motion.tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="p-8 text-center">
                                <Search className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-400 font-medium">
                                  {t(
                                    "No matching history found",
                                    "ምንም የሚዛመድ ታሪክ አልተገኘም",
                                  )}
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
                  <p className="text-xs text-gray-400 ml-8">
                    {t(
                      "No incoming transfers completed yet.",
                      "ገና ምንም የገባ ዝውውር አልተጠናቀቀም።",
                    )}
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-[#003366] text-white text-[11px] uppercase tracking-[0.2em]">
                          <th className="p-3">
                            {t("Employee Name", "የሰራተኛ ስም")}
                          </th>
                          <th className="p-3">{t("Fayda ID", "የፋይዳ መታወቂያ")}</th>
                          <th className="p-3">{t("Source", "ምንጭ")}</th>
                          <th className="p-3">{t("Position", "ሹመት")}</th>
                          <th className="p-3">{t("Status", "ሁኔታ")}</th>
                          <th className="p-3">{t("Date", "ቀን")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 text-gray-700">
                        {(() => {
                          const filtered = transferHistory.incoming.filter(
                            (r) => {
                              const q = historySearch.toLowerCase();
                              const matchesSearch =
                                !historySearch ||
                                r.employee.user.fullName
                                  .toLowerCase()
                                  .includes(q) ||
                                r.employee.user.faydaId
                                  .toLowerCase()
                                  .includes(q) ||
                                r.sourceOrganization.name
                                  .toLowerCase()
                                  .includes(q);
                              const matchesFilter =
                                historyFilter === "ALL" ||
                                r.status === historyFilter;
                              return matchesSearch && matchesFilter;
                            },
                          );
                          return filtered.length > 0 ? (
                            filtered.map((request, idx) => (
                              <motion.tr
                                key={`incoming-${request.id}`}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  duration: 0.3,
                                  delay: idx * 0.05,
                                }}
                                whileHover={{
                                  backgroundColor: "rgba(0,51,102,0.02)",
                                }}
                                className="transition-colors"
                              >
                                <td className="p-3 font-bold text-[#003366]">
                                  {request.employee.user.fullName}
                                </td>
                                <td className="p-3 text-xs text-gray-500">
                                  {request.employee.user.faydaId}
                                </td>
                                <td className="p-3">
                                  {request.sourceOrganization.name}
                                </td>
                                <td className="p-3">
                                  {request.position?.name ||
                                    request.employee.position?.name ||
                                    t("Unspecified", "ያልተገለጸ")}
                                </td>
                                <td className="p-3">
                                  <span
                                    className={`px-2 py-0.5 rounded text-xs font-semibold ${statusBadge(request.status)}`}
                                  >
                                    {isAm
                                      ? request.status === "APPROVED"
                                        ? "ጸድቋል"
                                        : request.status === "REJECTED"
                                          ? "ውድቅ"
                                          : request.status.includes("RELEASE")
                                            ? "የተለቀቀ"
                                            : request.status
                                      : request.status.replace("_", " ")}
                                  </span>
                                </td>
                                <td className="p-3 text-xs text-gray-400">
                                  {new Date(request.updatedAt).toLocaleString()}
                                </td>
                              </motion.tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="p-8 text-center">
                                <Search className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-400 font-medium">
                                  {t(
                                    "No matching history found",
                                    "ምንም የሚዛመድ ታሪክ አልተገኘም",
                                  )}
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

      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-2xl shadow-2xl w-[90vw] max-w-4xl h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm font-bold text-[#003366]">
                {t("Document Preview", "የሰነድ ቅድመ ዕይታ")}
              </h3>
              <button
                type="button"
                onClick={() => {
                  URL.revokeObjectURL(previewUrl);
                  setPreviewUrl(null);
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <iframe
              src={previewUrl}
              title="Document Preview"
              className="flex-1 w-full border-0"
            />
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
