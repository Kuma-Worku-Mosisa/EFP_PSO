//filepath: frontend/src/pages/admin/PersonnelChangeApprovals.tsx
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  UserCheck,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  X,
  MoreHorizontal,
  Briefcase,
  User,
  FileText,
  Mail,
  Phone,
  MapPin,
  IdCard,
  Upload,
} from "lucide-react";
import DocumentPreviewer from "../../components/DocumentPreviewer";
import { AutoDismissToast, ToastType } from "../../components/AutoDismissToast";
import LoadingSpinner from "../../components/LoadingSpinner";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { useLanguage } from "../../context/LanguageContext";
import { apiRequest } from "../../lib/api";

interface DocumentItem {
  documentId: number;
  key: string;
  labelEn: string;
  labelAm: string;
  required: boolean;
  fileUrl?: string;
  fileName?: string;
  isVerified?: boolean;
}

interface ChangeRequest {
  id: number;
  organizationName: string;
  requestType: string;
  positionType: string;
  newPersonName: string;
  previousPersonName: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  date: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  citizenship: string;
  faydaId: string;
  email: string;
  phone: string;
  position: string;
  educationLevel: string;
  workExpYears: number;
  totalExpYears: number;
  region: string;
  zone: string;
  woreda: string;
  kebele: string;
  houseNumber: string;
  specialLocation: string;
  documents: DocumentItem[];
  docsVerified: boolean;
  adminFeedback?: string;
  targetOrganizationName?: string;
  targetOrganizationNameAm?: string;
  sourceOrganizationName?: string;
  sourceOrganizationNameAm?: string;
}

const documentLabels = [
  {
    key: "fingerprint",
    labelEn: "Fingerprint from Police",
    labelAm: "ከፖሊስ የጣት አሻራ",
  },
  { key: "medical", labelEn: "Medical Result", labelAm: "የህክምና ውጤት" },
  {
    key: "training",
    labelEn: "Training Certificate",
    labelAm: "የስልጠና የምስክር ወረቀት",
  },
  {
    key: "support_letter",
    labelEn: "Support Letter (Kebele)",
    labelAm: "የድጋፍ ደብዳቤ (ቀበሌ)",
  },
  { key: "guarantee", labelEn: "Proof of Guarantee", labelAm: "የማስረጃ ማስረጃ" },
  { key: "work_exp", labelEn: "Work Experience", labelAm: "የስራ ልምድ" },
  { key: "resignation", labelEn: "Resignation Record", labelAm: "የመልቀቂያ መዝገብ" },
  {
    key: "education",
    labelEn: "Educational Certificate",
    labelAm: "የትምህርት የምስክር ወረቀት",
  },
  { key: "national_id", labelEn: "National ID", labelAm: "ብሔራዊ መታወቂያ" },
  {
    key: "kebele_id",
    labelEn: "Renewed Kebele ID/Passport",
    labelAm: "የታደሰ የቀበሌ መታወቂያ/ፓስፖርት",
  },
  {
    key: "org_id",
    labelEn: "Organization Identification",
    labelAm: "የድርጅት መታወቂያ",
  },
];

const getDocumentLabel = (key: string) =>
  documentLabels.find((doc) => doc.key === key) || {
    key,
    labelEn: key,
    labelAm: key,
  };

const normalizeDocumentTypeKey = (documentType: string): string => {
  const normalized = String(documentType || "")
    .trim()
    .toLowerCase();
  const mapping: Record<string, string> = {
    fingerprint: "fingerprint",
    "fingerprint from police": "fingerprint",
    medical: "medical",
    "medical result": "medical",
    training: "training",
    "training certificate": "training",
    "support letter": "support_letter",
    "support letter (kebele)": "support_letter",
    // guarantee: "guarantee",
    "proof of guarantee": "guarantee",
    "work experience": "work_exp",
    experience: "work_exp",
    resignation: "resignation",
    "resignation record": "resignation",
    education: "education",
    "education certificate": "education",
    "national id": "national_id",
    "kebele or passport document": "kebele_id",
    "renewed kebele id/passport": "kebele_id",
    "organizational identification": "org_id",
    "organization identification": "org_id",
    org_id: "org_id",
    kebele_id: "kebele_id",
  };
  return mapping[normalized] || normalized;
};

const mapPersonnelChangeRequest = (req: any): ChangeRequest => {
  const targetEmployee = req.targetEmployee || {};
  const user = targetEmployee.user || {};
  const fullName = String(user.fullName || targetEmployee.fullName || "");
  const nameParts = fullName.trim().split(" ");
  const firstName = nameParts[0] || "";
  const middleName = nameParts.length > 2 ? nameParts[1] : "";
  const lastName =
    nameParts.length > 2 ? nameParts.slice(2).join(" ") : nameParts[1] || "";
  const documents: DocumentItem[] = (targetEmployee.documents || []).map(
    (doc: {
      id?: number;
      documentType?: string;
      fileUrl?: string;
      isVerified?: boolean;
    }) => {
      const normalizedKey = normalizeDocumentTypeKey(
        String(doc.documentType || "document"),
      );
      const label = getDocumentLabel(normalizedKey);
      const fileUrl = String(doc.fileUrl || "");
      return {
        documentId: Number(doc.id ?? 0),
        key: normalizedKey,
        labelEn: label.labelEn,
        labelAm: label.labelAm,
        required: true,
        fileUrl,
        fileName: fileUrl.split("/").pop() || undefined,
        isVerified: Boolean(doc.isVerified),
      };
    },
  );

  const docsVerified =
    documents.length > 0 && documents.every((doc) => doc.isVerified === true);

  return {
    id: Number(req.id),
    organizationName:
      req.targetOrganizationName ||
      targetEmployee.organization?.nameEnglish ||
      req.sourceOrganizationName ||
      "N/A",
    requestType: String(req.requestType || "Personnel Change"),
    positionType:
      req.targetPositionName || targetEmployee.position?.name || "Unassigned",
    newPersonName: user.fullName || targetEmployee.fullName || "---",
    previousPersonName: req.previousPersonName || "",
    reason: req.reason || "Personnel Change",
    status:
      String(req.status || "PENDING").toUpperCase() === "PENDING"
        ? "Pending"
        : String(req.status || "").toUpperCase() === "APPROVED"
          ? "Approved"
          : "Rejected",
    date: req.createdAt
      ? new Date(req.createdAt).toLocaleDateString("en-CA")
      : new Date().toLocaleDateString("en-CA"),
    firstName,
    middleName,
    lastName,
    gender: String(targetEmployee.gender || "").trim() || "N/A",
    citizenship: String(targetEmployee.citizenship || "").trim() || "N/A",
    faydaId: String(user.faydaId || "").trim() || "N/A",
    email: String(user.email || "").trim() || "N/A",
    phone: String(user.phone || "").trim() || "N/A",
    position: targetEmployee.position?.name || req.targetPositionName || "N/A",
    educationLevel: String(targetEmployee.educationLevel || "").trim() || "N/A",
    workExpYears: Number(targetEmployee.workExpYears ?? 0),
    totalExpYears: Number(targetEmployee.TotalExpYears ?? 0),
    region:
      String(
        targetEmployee.address?.kebele?.woreda?.zone?.region?.nameEnglish || "",
      ).trim() || "N/A",
    zone:
      String(
        targetEmployee.address?.kebele?.woreda?.zone?.nameEnglish || "",
      ).trim() || "N/A",
    woreda:
      String(
        targetEmployee.address?.kebele?.woreda?.nameEnglish || "",
      ).trim() || "N/A",
    kebele:
      String(targetEmployee.address?.kebele?.nameEnglish || "").trim() || "N/A",
    houseNumber:
      String(targetEmployee.address?.houseNumber || "").trim() || "N/A",
    specialLocation:
      String(targetEmployee.address?.specialLocation || "").trim() || "",
    documents,
    docsVerified,
    adminFeedback: String(req.adminFeedback || "").trim() || undefined,
    sourceOrganizationName:
      req.sourceOrganizationName ||
      targetEmployee.organization?.nameEnglish ||
      req.targetOrganizationName ||
      null,
    sourceOrganizationNameAm:
      req.sourceOrganizationNameAm ||
      targetEmployee.organization?.nameAmharic ||
      req.targetOrganizationNameAm ||
      req.targetOrganizationName ||
      null,
    targetOrganizationName:
      req.targetOrganizationName ||
      req.sourceOrganizationName ||
      targetEmployee.organization?.nameEnglish ||
      null,
    targetOrganizationNameAm:
      req.targetOrganizationNameAm ||
      req.sourceOrganizationNameAm ||
      targetEmployee.organization?.nameAmharic ||
      req.sourceOrganizationName ||
      null,
  };
};

export const PersonnelChangeApprovals = () => {
  const { language } = useLanguage();
  const isAm = language === "am";
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [previewRequest, setPreviewRequest] = useState<ChangeRequest | null>(
    null,
  );
  const [previewDocKey, setPreviewDocKey] = useState<string | null>(null);
  const [actionMenuOpenId, setActionMenuOpenId] = useState<number | null>(null);
  const actionMenuRef = useRef<HTMLDivElement | null>(null);
  const [rejectionDialogRequest, setRejectionDialogRequest] =
    useState<ChangeRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [toastType, setToastType] = useState<ToastType>("success");
  const [toastMessage, setToastMessage] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);

  const handleToggleActionMenu = (requestId: number) => {
    setActionMenuOpenId((prev) => (prev === requestId ? null : requestId));
  };

  const handlePreviewRow = (req: ChangeRequest) => {
    setPreviewRequest(req);
    setActionMenuOpenId(null);
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target as Node)
      ) {
        setActionMenuOpenId(null);
      }
    };

    if (actionMenuOpenId !== null) {
      document.addEventListener("mousedown", handleOutsideClick);
      return () => {
        document.removeEventListener("mousedown", handleOutsideClick);
      };
    }

    return undefined;
  }, [actionMenuOpenId]);

  const handleApproveRequest = async (req: ChangeRequest) => {
    setIsActionLoading(true);

    try {
      await apiRequest(`/personnel-change-requests/${req.id}/approve`, {
        method: "POST",
      });
      setRequests((prev) =>
        prev.map((item) =>
          item.id === req.id ? { ...item, status: "Approved" } : item,
        ),
      );
      if (previewRequest?.id === req.id) {
        setPreviewRequest((prev) =>
          prev ? { ...prev, status: "Approved" } : prev,
        );
      }
      setToastType("success");
      setToastMessage(isAm ? "ጥያቄው ተጸድቋል።" : "Request approved successfully.");
      setToastOpen(true);
      setActionMenuOpenId(null);
    } catch (err: any) {
      console.error("Failed to approve request:", err);
      setToastType("error");
      setToastMessage(err?.message || "Failed to approve request.");
      setToastOpen(true);
    } finally {
      setIsActionLoading(false);
    }
  };

  const openRejectDialog = (req: ChangeRequest) => {
    setRejectionDialogRequest(req);
    setRejectionReason("");
    setActionMenuOpenId(null);
  };

  const handleRejectRequest = async (req: ChangeRequest, reason: string) => {
    if (reason.trim().length < 30) {
      setToastType("error");
      setToastMessage(
        isAm
          ? "በመጠኑ 30 ቁምፊ ያህል ማብራሪያ ያስገቡ."
          : "Rejection reason must be at least 30 characters.",
      );
      setToastOpen(true);
      return;
    }

    setIsActionLoading(true);

    try {
      await apiRequest(`/personnel-change-requests/${req.id}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason: reason.trim() }),
      });
      setRequests((prev) =>
        prev.map((item) =>
          item.id === req.id ? { ...item, status: "Rejected" } : item,
        ),
      );
      if (previewRequest?.id === req.id) {
        setPreviewRequest((prev) =>
          prev ? { ...prev, status: "Rejected" } : prev,
        );
      }
      setToastType("success");
      setToastMessage(
        isAm ? "ጥያቄው ውድቅ ተደርጓል።" : "Request rejected successfully.",
      );
      setToastOpen(true);
      setRejectionDialogRequest(null);
      setRejectionReason("");
      setActionMenuOpenId(null);
    } catch (err: any) {
      console.error("Failed to reject request:", err);
      setToastType("error");
      setToastMessage(err?.message || "Failed to reject request.");
      setToastOpen(true);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleToggleDocumentVerification = async (
    uploadedDoc: DocumentItem,
  ) => {
    if (!previewRequest) return;

    const action = uploadedDoc.isVerified ? "unverify" : "verify";

    try {
      await apiRequest(
        `/personnel-change-requests/${previewRequest.id}/documents/${uploadedDoc.documentId}/${action}`,
        { method: "POST" },
      );

      setPreviewRequest((prev) => {
        if (!prev) return prev;
        const nextDocuments = prev.documents.map((doc) =>
          doc.documentId === uploadedDoc.documentId
            ? { ...doc, isVerified: !doc.isVerified }
            : doc,
        );
        return {
          ...prev,
          documents: nextDocuments,
          docsVerified:
            nextDocuments.length > 0 &&
            nextDocuments.every((doc) => doc.isVerified === true),
        };
      });

      setRequests((prev) =>
        prev.map((req) => {
          if (req.id !== previewRequest.id) return req;
          const nextDocuments = req.documents.map((doc) =>
            doc.documentId === uploadedDoc.documentId
              ? { ...doc, isVerified: !doc.isVerified }
              : doc,
          );
          return {
            ...req,
            documents: nextDocuments,
            docsVerified:
              nextDocuments.length > 0 &&
              nextDocuments.every((doc) => doc.isVerified === true),
          };
        }),
      );
    } catch (err: any) {
      console.error(`Failed to ${action} personnel change document:`, err);
      setToastType("error");
      setToastMessage(
        err?.message ||
          `Failed to ${uploadedDoc.isVerified ? "unverify" : "verify"} document.`,
      );
      setToastOpen(true);
    }
  };

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiRequest("/personnel-change-requests");
        const payload = (response as any).data || response;
        const rawRequests = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : [];
        const mappedRequests = rawRequests.map(mapPersonnelChangeRequest);
        setRequests(mappedRequests);
      } catch (err: any) {
        console.error("Failed to load personnel change approvals:", err);
        setError(err?.message || "Failed to load personnel change approvals");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const filtered = requests.filter((r) => {
    const matchesSearch =
      !searchQuery ||
      r.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.positionType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.newPersonName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "ALL" || r.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="relative overflow-hidden bg-gradient-to-r from-[#003366] to-[#001F3F] rounded-3xl p-6 border border-white/10">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FFD700] via-[#C5A022] to-[#FFD700]" />
        <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-[#FFD700]/5" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FFD700]/20 flex items-center justify-center">
            <UserCheck className="w-6 h-6 text-[#FFD700]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white uppercase tracking-tight">
              {isAm ? "የሰራተኞች ለውጥ ማረጋገጫ" : "Personnel Change Approvals"}
            </h1>
            <p className="text-xs text-white/50 font-medium mt-1">
              {isAm
                ? "ከድርጅቶች የቀረቡ የሰራተኞች ለውጥ ጥያቄዎችን ይመልከቱ እና ያረጋግጡ"
                : "Review and approve personnel change requests submitted by organizations"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isAm
                  ? "በድርጅት ወይም በስም ፈልግ..."
                  : "Search by organization or name..."
              }
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]/50 outline-none transition-all"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]/50 outline-none transition-all"
          >
            <option value="ALL">{isAm ? "ሁሉም" : "All Status"}</option>
            <option value="Pending">{isAm ? "በመጠባበቅ ላይ" : "Pending"}</option>
            <option value="Approved">{isAm ? "ጸድቋል" : "Approved"}</option>
            <option value="Rejected">{isAm ? "ውድቅ" : "Rejected"}</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center">
              <LoadingSpinner
                fullPage={false}
                text={isAm ? "በመጫን ላይ..." : "Loading approvals..."}
              />
            </div>
          ) : error ? (
            <div className="p-10 text-center text-red-600">{error}</div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#003366] text-white text-[11px] uppercase tracking-[0.2em]">
                  <th className="p-4">{isAm ? "ድርጅት" : "Organization"}</th>
                  <th className="p-4">{isAm ? "የጥያቄ አይነት" : "Request Type"}</th>
                  <th className="p-4">{isAm ? "ቦታ" : "Position"}</th>
                  <th className="p-4">{isAm ? "አዲስ ሰው" : "New Person"}</th>
                  <th className="p-4">{isAm ? "የቀድሞ ሰው" : "Previous"}</th>
                  <th className="p-4">
                    {isAm ? "ምክንያት" : "Reason For Change"}
                  </th>
                  <th className="p-4">
                    {isAm ? "የአስተዳዳሪ ግብረመልስ" : "Admin Feedback"}
                  </th>
                  <th className="p-4">{isAm ? "ሁኔታ" : "Status"}</th>
                  <th className="p-4">{isAm ? "ቀን" : "Date"}</th>
                  <th className="p-4 text-right">{isAm ? "ድርጊት" : "Action"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700">
                {filtered.map((req) => (
                  <motion.tr
                    key={req.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ backgroundColor: "rgba(0,51,102,0.02)" }}
                    className="transition-colors"
                  >
                    <td className="p-4 font-bold text-[#003366]">
                      {req.organizationName}
                    </td>
                    <td className="p-4">
                      {req.requestType === "NEW_EMPLOYEE"
                        ? isAm
                          ? "አዲስ ሰራተኛ"
                          : "New Employee"
                        : req.requestType}
                    </td>
                    <td className="p-4">{req.positionType}</td>
                    <td className="p-4">{req.newPersonName}</td>
                    <td className="p-4 text-gray-500">
                      {req.previousPersonName}
                    </td>
                    <td className="p-4 max-w-[120px] truncate">{req.reason}</td>
                    <td className="p-4 max-w-[120px] truncate text-gray-500">
                      {req.adminFeedback || "-"}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
                          req.status === "Approved"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : req.status === "Pending"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {req.status === "Approved" ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : req.status === "Pending" ? (
                          <Clock className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {isAm
                          ? req.status === "Approved"
                            ? "ጸድቋል"
                            : req.status === "Pending"
                              ? "በመጠባበቅ ላይ"
                              : "ውድቅ"
                          : req.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-400">{req.date}</td>
                    <td className="p-4 text-right relative">
                      <div className="inline-flex items-center justify-end">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleToggleActionMenu(req.id)}
                          className="w-9 h-9 inline-flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 transition-colors"
                          aria-label={isAm ? "እርምጃ" : "Actions"}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </motion.button>
                      </div>
                      {actionMenuOpenId === req.id && (
                        <div
                          ref={actionMenuRef}
                          className="absolute right-0 mt-2 w-44 rounded-2xl border-2 border-[#003366] bg-[#003366] text-[#FFD700] p-2 shadow-lg ring-1 ring-black/5"
                        >
                          <button
                            type="button"
                            onClick={() => handlePreviewRow(req)}
                            className="w-full text-left px-4 py-2 text-sm font-medium text-[#FFD700] cursor-pointer hover:bg-[#002244] active:bg-[#001A33] transition-colors"
                          >
                            {isAm ? "ተመልከት" : "Preview"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApproveRequest(req)}
                            className="w-full text-left px-4 py-2 text-sm font-medium text-[#FFD700] cursor-pointer hover:bg-[#002244] active:bg-[#001A33] transition-colors"
                          >
                            {isAm ? "እርግጠኛ አድርግ" : "Approve"}
                          </button>
                          <button
                            type="button"
                            onClick={() => openRejectDialog(req)}
                            className="w-full text-left px-4 py-2 text-sm font-medium text-[#FFD700] cursor-pointer hover:bg-[#002244] active:bg-[#001A33] transition-colors"
                          >
                            {isAm ? "ይቃወሙ" : "Reject"}
                          </button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-gray-400">
                      {isAm ? "ምንም ጥያቄ የለም" : "No requests found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={Boolean(rejectionDialogRequest)}
        onClose={() => setRejectionDialogRequest(null)}
        onConfirm={() =>
          rejectionDialogRequest &&
          handleRejectRequest(rejectionDialogRequest, rejectionReason)
        }
        title={isAm ? "የእቅድ ክስተት ምክንያት" : "Rejection Reason"}
        message={
          isAm
            ? "እባክዎን የክስተት ምክንያት ቢያንስ 30 ቁምፊ ያህል ያስገቡ."
            : "Please provide at least 30 characters describing the rejection reason."
        }
        type="reject"
        isLoading={isActionLoading}
        isConfirmDisabled={rejectionReason.trim().length < 30}
        inputLabel={isAm ? "ምክንያት" : "Reason"}
        inputValue={rejectionReason}
        onInputChange={setRejectionReason}
        inputPlaceholder={
          isAm ? "እዚህ የክስተት ምክንያት ያስገቡ..." : "Enter the reason for rejection..."
        }
      />

      <AutoDismissToast
        isOpen={toastOpen}
        type={toastType}
        message={toastMessage}
        onClose={() => setToastOpen(false)}
      />

      {/* Preview Modal */}
      {previewRequest && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 pt-8 overflow-y-auto"
          onClick={() => setPreviewRequest(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden my-8"
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
                      {isAm ? "የጥያቄ ዝርዝር" : "Request Details"}
                    </h3>
                    <p className="text-[10px] text-white/50 font-medium">
                      {isAm
                        ? "ከድርጅቱ የቀረበውን ሙሉ መረጃ ይገምግሙ"
                        : "Review full details submitted by the organization"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewRequest(null)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-6 max-h-[calc(100vh-12rem)] overflow-y-auto space-y-5">
              {/* Basic Information */}
              <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-blue-50/30 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <User className="w-4 h-4 text-[#003366]" />
                  <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#003366]">
                    {isAm ? "መሠረታዊ መረጃ" : "Basic Information"}
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-gray-400 mb-1">
                      {isAm ? "ስም" : "First Name"} *
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {previewRequest.firstName}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-gray-400 mb-1">
                      {isAm ? "የአባት ስም" : "Middle Name"} *
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {previewRequest.middleName}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-gray-400 mb-1">
                      {isAm ? "የአያት ስም" : "Last Name"} *
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {previewRequest.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-gray-400 mb-1">
                      {isAm ? "ጾታ" : "Gender"} *
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {previewRequest.gender}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-gray-400 mb-1">
                      {isAm ? "ዜግነት" : "Citizenship"}
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {previewRequest.citizenship}
                    </p>
                  </div>
                </div>
              </div>

              {/* Organization Details */}
              <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-sky-50/30 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <Briefcase className="w-4 h-4 text-[#003366]" />
                  <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#003366]">
                    {isAm ? "የድርጅት መረጃ" : "Organization Details"}
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-gray-400 mb-1">
                      {isAm ? "የመነሻ ድርጅት" : "Source Organization"}
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {isAm
                        ? previewRequest.sourceOrganizationNameAm ||
                          previewRequest.sourceOrganizationName ||
                          "N/A"
                        : previewRequest.sourceOrganizationName || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-gray-400 mb-1">
                      {isAm ? "የመድረሻ ድርጅት" : "Target Organization"}
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {isAm
                        ? previewRequest.targetOrganizationNameAm ||
                          previewRequest.targetOrganizationName ||
                          "N/A"
                        : previewRequest.targetOrganizationName || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Identity & Contact */}
              <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-purple-50/30 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <IdCard className="w-4 h-4 text-[#003366]" />
                  <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#003366]">
                    {isAm ? "መታወቂያ እና መገኛ" : "Identity & Contact"}
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-gray-400 mb-1">
                      Fayda ID *
                    </p>
                    <p className="text-sm font-semibold font-mono text-gray-800">
                      {previewRequest.faydaId}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-gray-400 mb-1">
                      Email *
                    </p>
                    <p className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-gray-400" />{" "}
                      {previewRequest.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-gray-400 mb-1">
                      Phone *
                    </p>
                    <p className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-gray-400" />{" "}
                      {previewRequest.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Position & Experience */}
              <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-emerald-50/30 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <Briefcase className="w-4 h-4 text-[#003366]" />
                  <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#003366]">
                    {isAm ? "ቦታ እና ልምድ" : "Position & Experience"}
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-gray-400 mb-1">
                      {isAm ? "ቦታ" : "Position"} *
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {previewRequest.position}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-gray-400 mb-1">
                      {isAm ? "የትምህርት ደረጃ" : "Education Level"}
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {previewRequest.educationLevel || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-gray-400 mb-1">
                      {isAm ? "የስራ ልምድ (ዓመታት)" : "Work Experience (Years)"}
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {previewRequest.workExpYears} {isAm ? "ዓመታት" : "years"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-gray-400 mb-1">
                      {isAm ? "አጠቃላይ ልምድ (ዓመታት)" : "Total Experience (Years)"}
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {previewRequest.totalExpYears} {isAm ? "ዓመታት" : "years"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Residential Address */}
              <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-amber-50/30 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <MapPin className="w-4 h-4 text-[#003366]" />
                  <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#003366]">
                    {isAm ? "የመኖሪያ አድራሻ" : "Residential Address"}
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-gray-400 mb-1">
                      {isAm ? "ክልል" : "Region"} *
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {previewRequest.region}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-gray-400 mb-1">
                      {isAm ? "ዞን" : "Zone"} *
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {previewRequest.zone}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-gray-400 mb-1">
                      {isAm ? "ወረዳ" : "Woreda"} *
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {previewRequest.woreda}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-gray-400 mb-1">
                      {isAm ? "ቀበሌ" : "Kebele"} *
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {previewRequest.kebele}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-gray-400 mb-1">
                      {isAm ? "የቤት ቁጥር" : "House Number"} *
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {previewRequest.houseNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-gray-400 mb-1">
                      {isAm ? "ልዩ ቦታ" : "Special Location"}
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {previewRequest.specialLocation || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reason for Change */}
              <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-red-50/30 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <FileText className="w-4 h-4 text-[#003366]" />
                  <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#003366]">
                    {isAm ? "የለውጥ ምክንያት" : "Reason for Change"}
                  </h4>
                </div>
                <p className="text-sm text-gray-700 bg-white rounded-xl p-3 border border-gray-100">
                  {previewRequest.reason}
                </p>
              </div>

              {/* Required Documents */}
              <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-cyan-50/30 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <Upload className="w-4 h-4 text-[#003366]" />
                  <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#003366]">
                    {isAm ? "አስፈላጊ ሰነዶች" : "Required Documents"}
                  </h4>
                  {previewDocKey && (
                    <button
                      onClick={() => setPreviewDocKey(null)}
                      className="ml-auto text-[10px] font-bold text-[#003366] hover:text-[#FFD700] transition-colors flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />{" "}
                      {isAm ? "ወደ ዝርዝር ተመለስ" : "Back to list"}
                    </button>
                  )}
                </div>
                {previewDocKey ? (
                  <div className="space-y-3">
                    {(() => {
                      const doc = documentLabels.find(
                        (d) => d.key === previewDocKey,
                      );
                      const uploaded = previewRequest.documents.find(
                        (d) => d.key === previewDocKey,
                      );
                      if (!doc) return null;
                      return (
                        <>
                          <div className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
                            <DocumentPreviewer
                              url={uploaded?.fileUrl || ""}
                              fileName={
                                uploaded?.fileName ||
                                (isAm ? doc.labelAm : doc.labelEn)
                              }
                              fileType="pdf"
                              className="h-[400px] w-full"
                              isVerified={uploaded?.isVerified}
                              onToggleVerified={
                                uploaded
                                  ? () =>
                                      handleToggleDocumentVerification(uploaded)
                                  : undefined
                              }
                            />
                          </div>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {documentLabels.map((doc) => {
                      const uploaded = previewRequest.documents.find(
                        (d) => d.key === doc.key,
                      );
                      const isRequired =
                        previewRequest.documents.find((d) => d.key === doc.key)
                          ?.required ?? false;
                      return (
                        <div
                          key={doc.key}
                          className={`flex items-center gap-3 p-3 rounded-xl border text-sm ${
                            uploaded
                              ? "bg-green-50/50 border-green-200"
                              : "bg-gray-50/50 border-gray-200 text-gray-400"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              uploaded
                                ? "bg-green-100 text-green-600"
                                : "bg-gray-200 text-gray-400"
                            }`}
                          >
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-xs font-semibold ${uploaded ? "text-gray-800" : "text-gray-400"}`}
                            >
                              {isAm ? doc.labelAm : doc.labelEn}
                              {isRequired && (
                                <span className="text-red-500 ml-0.5">*</span>
                              )}
                            </p>
                            {uploaded?.fileName ? (
                              <p className="text-[10px] text-green-600 truncate">
                                {uploaded.fileName}
                              </p>
                            ) : (
                              <p className="text-[10px]">
                                {isAm ? "አልተሰቀለም" : "Not uploaded"}
                              </p>
                            )}
                          </div>
                          {uploaded && (
                            <span
                              className={`text-[10px] rounded-full px-2 py-0.5 font-semibold ${
                                uploaded.isVerified
                                  ? "bg-green-100 text-green-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {uploaded.isVerified
                                ? isAm
                                  ? "ተረጋግጧል"
                                  : "Verified"
                                : isAm
                                  ? "አልተረጋገጠም"
                                  : "Pending"}
                            </span>
                          )}
                          <button
                            onClick={() => setPreviewDocKey(doc.key)}
                            className="shrink-0 w-7 h-7 rounded-lg bg-[#003366]/10 hover:bg-[#003366]/20 flex items-center justify-center transition-colors"
                            title={isAm ? "ተመልከት" : "Preview"}
                          >
                            <Eye className="w-3.5 h-3.5 text-[#003366]" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};
