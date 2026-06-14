// frontend/src/pages/ApplicationsReview.tsx
import React, { useState } from "react";
import {
  Search,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Shield,
  AlertTriangle,
  ArrowRight,
  X,
  ShieldCheck,
  RefreshCw,
  Users,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "../context/LanguageContext";
import { apiRequest } from "../lib/api";
import AssignInspectionModal from "../components/AssignInspectionModal.tsx";
import {
  AutoDismissToast,
  type ToastType,
} from "../components/AutoDismissToast";
import { cn } from "../lib/utils";
import { RenewalReviewContent } from "../components/ApplicationsReview/RenewalReviewContent";
import { ConfirmDialog } from "../components/ConfirmDialog";

const FILE_ORIGIN = import.meta.env.DEV ? "http://localhost:5000" : "";

const resolveFileUrl = (fileUrl?: string) => {
  if (!fileUrl) return "";
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
  return `${FILE_ORIGIN}/${fileUrl.replace(/^\/+/, "")}`;
};

const getFileName = (fileUrl?: string) => {
  if (!fileUrl) return "";
  const cleanPath = fileUrl.split("?")[0].split("#")[0];
  const lastPart = cleanPath.split("/").pop() || cleanPath;
  try {
    return decodeURIComponent(lastPart);
  } catch {
    return lastPart;
  }
};

const getFileType = (fileUrl?: string) => {
  const ext = (getFileName(fileUrl).split(".").pop() || "").toLowerCase();
  if (ext === "pdf") return "application/pdf";
  if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext))
    return `image/${ext === "jpg" ? "jpeg" : ext}`;
  return "application/octet-stream";
};

const buildDocumentCards = (
  docs: Array<{
    id?: number | string;
    documentType?: string;
    fileUrl?: string;
    isVerified?: boolean;
    verifiedAt?: string | null;
  }>,
  prefix: string,
) =>
  (docs || []).map((doc, index) => ({
    id: `${prefix}_${index}`,
    documentId: doc.id,
    label: doc.documentType || "Document",
    fileUrl: doc.fileUrl || "",
    fileName: getFileName(doc.fileUrl),
    isVerified: Boolean(doc.isVerified),
    verifiedAt: doc.verifiedAt,
  }));

const getOrganizationDocumentCards = (application?: any) =>
  buildDocumentCards(application?.organization?.documents || [], "org-grid");

const findOrganizationDocument = (application: any, terms: string[]) => {
  const documents = getOrganizationDocumentCards(application);
  return documents.find((doc) =>
    terms.some((term) =>
      normalizeText(doc.label).includes(normalizeText(term)),
    ),
  );
};

const normalizeText = (value?: string | null) =>
  (value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getEmployeeDocumentTarget = (
  employee: any,
  terms: string[],
  excludeTerms: string[] = [],
) => {
  const doc = findEmployeeDoc(employee, terms, excludeTerms);

  if (!doc?.id) {
    return null;
  }

  return {
    scope: "employee" as const,
    id: Number(doc.id),
    isVerified: Boolean(doc.isVerified),
    verifiedAt: doc.verifiedAt ?? null,
  };
};

const getEmployeeOnlyDocumentTarget = (
  employee: any,
  terms: string[],
  excludeTerms: string[] = [],
) => {
  const docs = (employee?.documents || []).filter(Boolean);
  const include = terms.map((term) => normalizeText(term)).filter(Boolean);
  const exclude = excludeTerms
    .map((term) => normalizeText(term))
    .filter(Boolean);

  let bestDoc: any = undefined;
  let bestScore = -1;

  for (const doc of docs) {
    const searchText = normalizeText(
      `${doc?.documentType || ""} ${getFileName(doc?.fileUrl)}`,
    );

    if (exclude.some((term) => searchText.includes(term))) {
      continue;
    }

    const score = include.reduce(
      (sum, term) => sum + (searchText.includes(term) ? 1 : 0),
      0,
    );

    if (score > bestScore) {
      bestScore = score;
      bestDoc = doc;
    }
  }

  if (!bestDoc?.id || bestScore <= 0) {
    return null;
  }

  return {
    scope: "employee" as const,
    id: Number(bestDoc.id),
    fileUrl: bestDoc.fileUrl || "",
    isVerified: Boolean(bestDoc.isVerified),
    verifiedAt: bestDoc.verifiedAt ?? null,
  };
};

const getEmployeeOnlyDocumentCard = (
  employee: any,
  terms: string[],
  excludeTerms: string[] = [],
) => getEmployeeOnlyDocumentTarget(employee, terms, excludeTerms);

const getEmployeeTrainingCertificate = (employee: any) => {
  const docs = (employee?.documents || []).filter(Boolean);

  // Specifically look for training certificate by checking file URL pattern
  const trainingDoc = docs.find((doc: any) => {
    const fileUrl = doc?.fileUrl || "";
    const docType = normalizeText(doc?.documentType || "");
    const fileName = normalizeText(getFileName(fileUrl));

    // Look for training_doc in the path AND training certificate in the type or filename
    const hasTrainingDocInPath = fileUrl.includes("training_doc");
    const hasTrainingCertificate =
      docType.includes("training") && docType.includes("certificate");
    const hasTrainingCertInFile =
      fileName.includes("training") && fileName.includes("certificate");

    return (
      hasTrainingDocInPath && (hasTrainingCertificate || hasTrainingCertInFile)
    );
  });

  if (!trainingDoc?.id) return null;

  return {
    scope: "employee" as const,
    id: Number(trainingDoc.id),
    fileUrl: trainingDoc.fileUrl || "",
    isVerified: Boolean(trainingDoc.isVerified),
    verifiedAt: trainingDoc.verifiedAt ?? null,
  };
};

const inferEmployeeSectionRole = (id: string, verificationKey?: string) => {
  const roleSource = `${verificationKey || ""} ${id || ""}`.toLowerCase();

  if (roleSource.includes("manager") || roleSource.includes("_mgr_")) {
    return "manager" as const;
  }

  if (roleSource.includes("operations") || roleSource.includes("_ops_")) {
    return "operations" as const;
  }

  if (roleSource.includes("admin") || roleSource.includes("_admin_")) {
    return "admin" as const;
  }

  return null;
};

const CORRECTION_UPLOAD_FIELDS_STORAGE_KEY =
  "applicationCorrectionUploadFields";

const persistCorrectionUploadField = (fieldKey: string | null) => {
  if (!fieldKey || typeof window === "undefined") return;

  try {
    const existingRaw = window.localStorage.getItem(
      CORRECTION_UPLOAD_FIELDS_STORAGE_KEY,
    );
    const existing = Array.isArray(existingRaw ? JSON.parse(existingRaw) : [])
      ? (JSON.parse(existingRaw || "[]") as string[])
      : [];
    const next = Array.from(new Set([...existing, fieldKey]));
    window.localStorage.setItem(
      CORRECTION_UPLOAD_FIELDS_STORAGE_KEY,
      JSON.stringify(next),
    );
  } catch (error) {
    console.warn("Failed to persist correction upload field", error);
  }
};

const getEmployeeRolePrefix = (
  application: any,
  documentId: number | undefined,
  verificationKey?: string,
) => {
  const scopedRole = normalizeText(verificationKey?.split(":")?.[0]);
  if (scopedRole === "manager") return "manager";
  if (scopedRole === "operations") return "ops";
  if (scopedRole === "admin") return "admin";

  const employeeBuckets: Array<["manager" | "ops" | "admin", any]> = [
    ["manager", application?.manager],
    ["ops", application?.operationsHead],
    ["admin", application?.adminHead],
  ];

  for (const [role, employee] of employeeBuckets) {
    const employeeDocs = getEmployeeDocs(employee);
    if (
      employeeDocs.some((doc: any) => Number(doc?.id) === Number(documentId))
    ) {
      return role;
    }
  }

  return null;
};

// Map action keys to icon components
const actionIconMap: Record<string, any> = {
  preview: Eye,
  under_review: Clock,
  approve: CheckCircle,
  reject: X,
  correction: FileText,
};

const getCorrectionUploadFieldKey = (
  application: any,
  label: string,
  verificationKey?: string,
  target?: {
    scope: "organization" | "employee" | "education";
    id: number;
  } | null,
) => {
  const normalizedLabel = normalizeText(label);
  const organizationScope = target?.scope === "organization";

  if (organizationScope) {
    if (normalizedLabel.includes("logo")) return "logo";
    if (normalizedLabel.includes("uniform")) return "uniform_sample";
    if (
      normalizedLabel.includes("id card sample") ||
      normalizedLabel.includes("employee id sample")
    ) {
      return "id_sample";
    }
    if (normalizedLabel.includes("training manual")) return "training_manual";
    if (
      normalizedLabel.includes("training certificate") ||
      normalizedLabel.includes("certificate of training")
    ) {
      return "training_cert";
    }
    if (normalizedLabel.includes("employment form")) return "employment_form";
    if (
      normalizedLabel.includes("organization id") ||
      normalizedLabel.includes("organization identification") ||
      normalizedLabel.includes("org identification")
    ) {
      return "organization_Id_doc";
    }
    if (normalizedLabel.includes("vehicle rent")) return "vehicle_rent";
    if (normalizedLabel.includes("house rent")) return "house_rent";
    return null;
  }

  const rolePrefix = getEmployeeRolePrefix(
    application,
    target?.id,
    verificationKey,
  );
  if (!rolePrefix) return null;

  if (normalizedLabel.includes("fingerprint"))
    return `${rolePrefix}_fingerprint_doc`;
  if (normalizedLabel.includes("medical")) return `${rolePrefix}_medical_doc`;
  if (normalizedLabel.includes("training certificate"))
    return `${rolePrefix}_training_doc`;
  if (
    normalizedLabel.includes("support letter") ||
    normalizedLabel.includes("kebele")
  ) {
    return `${rolePrefix}_support_doc`;
  }
  if (normalizedLabel.includes("collateral"))
    return `${rolePrefix}_collateral_doc`;
  if (normalizedLabel.includes("experience"))
    return `${rolePrefix}_experience_doc`;
  if (normalizedLabel.includes("resignation"))
    return `${rolePrefix}_resignation_letter_doc`;
  if (
    normalizedLabel.includes("degree") ||
    normalizedLabel.includes("educational")
  ) {
    return `${rolePrefix}_education_doc`;
  }
  if (
    normalizedLabel.includes("passport") ||
    normalizedLabel.includes("kabele") ||
    normalizedLabel.includes("renewed id")
  ) {
    return `${rolePrefix}_passport_or_kabele_doc`;
  }
  if (normalizedLabel.includes("national id"))
    return `${rolePrefix}_national_id_doc`;
  if (
    normalizedLabel.includes("organization id") ||
    normalizedLabel.includes("organization identification") ||
    normalizedLabel.includes("org identification")
  ) {
    return `${rolePrefix}_organization_Id_doc`;
  }

  return null;
};

const getEmployeeDocs = (employee: any) => [
  ...(employee?.educationDocs || []),
  ...(employee?.documents || []),
];

const collectApplicationDocuments = (application: any) => [
  ...(application?.organization?.documents || []).map((doc: any) => ({
    scope: "organization",
    id: doc?.id,
    isVerified: Boolean(doc?.isVerified),
  })),
  ...getEmployeeDocs(application?.manager).map((doc: any) => ({
    scope: "manager",
    id: doc?.id,
    isVerified: Boolean(doc?.isVerified),
  })),
  ...getEmployeeDocs(application?.operationsHead).map((doc: any) => ({
    scope: "operationsHead",
    id: doc?.id,
    isVerified: Boolean(doc?.isVerified),
  })),
  ...getEmployeeDocs(application?.adminHead).map((doc: any) => ({
    scope: "adminHead",
    id: doc?.id,
    isVerified: Boolean(doc?.isVerified),
  })),
];

const hasUnverifiedApplicationDocuments = (application: any) => {
  const docs = collectApplicationDocuments(application);
  return docs.length > 0 && docs.some((doc) => !doc.isVerified);
};

const normalizeFileReference = (value?: string | null) =>
  normalizeText(
    (value || "").split("?")[0].split("#")[0].split("/").pop() || value,
  );

const resolveDocumentVerificationTarget = (
  application: any,
  label: string,
  fileUrl?: string,
  value?: string,
  sectionRole?: "manager" | "operations" | "admin" | null,
) => {
  const labelTerms = [label, value]
    .filter(Boolean)
    .map((term) => normalizeText(term));
  const normalizedFileName = normalizeFileReference(fileUrl || value);

  const matches = (doc: any, typeKey = "documentType") => {
    const docType = normalizeText(doc?.[typeKey]);
    const docFileName = normalizeFileReference(doc?.fileUrl);

    if (normalizedFileName && docFileName === normalizedFileName) {
      return true;
    }

    return labelTerms.some(
      (term) => term && (docType.includes(term) || docFileName.includes(term)),
    );
  };

  const sectionEmployee =
    sectionRole === "manager"
      ? application?.manager
      : sectionRole === "operations"
        ? application?.operationsHead
        : sectionRole === "admin"
          ? application?.adminHead
          : null;

  if (sectionEmployee) {
    const employeeDoc = (sectionEmployee?.documents || []).find((doc: any) =>
      matches(doc),
    );
    if (employeeDoc) {
      return {
        scope: "employee" as const,
        id: employeeDoc.id,
        isVerified: Boolean(employeeDoc.isVerified),
        verifiedAt: employeeDoc.verifiedAt ?? null,
      };
    }

    const educationDoc = (sectionEmployee?.educationDocs || []).find(
      (doc: any) => matches(doc, "educationDocumentType"),
    );
    if (educationDoc) {
      return {
        scope: "education" as const,
        id: educationDoc.id,
        isVerified: Boolean(educationDoc.isVerified),
        verifiedAt: educationDoc.verifiedAt ?? null,
      };
    }

    return null;
  }

  const organizationDocs = application?.organization?.documents || [];
  const organizationDoc = organizationDocs.find((doc: any) => matches(doc));
  if (organizationDoc) {
    return {
      scope: "organization" as const,
      id: organizationDoc.id,
      isVerified: Boolean(organizationDoc.isVerified),
      verifiedAt: organizationDoc.verifiedAt ?? null,
    };
  }

  const employees = [
    application?.manager,
    application?.operationsHead,
    application?.adminHead,
  ].filter(Boolean);

  for (const employee of employees) {
    const employeeDoc = (employee?.documents || []).find((doc: any) =>
      matches(doc),
    );
    if (employeeDoc) {
      return {
        scope: "employee" as const,
        id: employeeDoc.id,
        isVerified: Boolean(employeeDoc.isVerified),
        verifiedAt: employeeDoc.verifiedAt ?? null,
      };
    }

    const educationDoc = (employee?.educationDocs || []).find((doc: any) =>
      matches(doc, "educationDocumentType"),
    );
    if (educationDoc) {
      return {
        scope: "education" as const,
        id: educationDoc.id,
        isVerified: Boolean(educationDoc.isVerified),
        verifiedAt: educationDoc.verifiedAt ?? null,
      };
    }
  }

  return null;
};

const findEmployeeDoc = (
  employee: any,
  terms: string[],
  excludeTerms: string[] = [],
) => {
  const docs = getEmployeeDocs(employee);
  const include = terms.map((term) => normalizeText(term)).filter(Boolean);
  const exclude = excludeTerms
    .map((term) => normalizeText(term))
    .filter(Boolean);

  let bestDoc: any = undefined;
  let bestScore = -1;

  for (const doc of docs) {
    const searchText = normalizeText(
      `${doc?.documentType || doc?.educationDocumentType || ""} ${getFileName(doc?.fileUrl)}`,
    );

    if (exclude.some((term) => searchText.includes(term))) {
      continue;
    }

    const score = include.reduce(
      (sum, term) => sum + (searchText.includes(term) ? 1 : 0),
      0,
    );

    if (score > bestScore) {
      bestScore = score;
      bestDoc = doc;
    }
  }

  return bestScore > 0 ? bestDoc : undefined;
};

const getEmployeeDisplayName = (employee: any) =>
  employee?.user?.fullName || employee?.fullName || "-";

const getEmployeeAddressDetails = (employee: any) => {
  const address = employee?.address;
  const region = address?.kebele?.woreda?.zone?.region;
  const zone = address?.kebele?.woreda?.zone;
  const woreda = address?.kebele?.woreda;
  const kebele = address?.kebele;

  return {
    region: region?.nameEnglish || region?.nameAmharic || region?.name || "-",
    zone: zone?.nameEnglish || zone?.nameAmharic || zone?.name || "-",
    woreda: woreda?.nameEnglish || woreda?.nameAmharic || woreda?.name || "-",
    kebele: kebele?.nameEnglish || kebele?.nameAmharic || kebele?.name || "-",
    specialLocation: address?.specialLocation || "-",
    houseNumber: address?.houseNumber || "-",
  };
};

const getEmployeeEmploymentDetails = (employee: any) => ({
  educationLevel: employee?.educationLevel || "-",
  workExpYears:
    employee?.workExpYears !== undefined && employee?.workExpYears !== null
      ? String(employee.workExpYears)
      : "-",
  totalExpYears:
    employee?.TotalExpYears !== undefined && employee?.TotalExpYears !== null
      ? String(employee.TotalExpYears)
      : "-",
  isBlacklisted:
    employee?.isBlacklisted === undefined || employee?.isBlacklisted === null
      ? "-"
      : employee.isBlacklisted
        ? "Yes"
        : "No",
});

export const ApplicationsReview = () => {
  const { language } = useLanguage();
  const isAm = language === "am";
  const [activeTab, setActiveTab] = useState<
    "all" | "pending" | "reviewing" | "correction"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [viewingStage, setViewingStage] = useState<
    "selection" | "new" | "renewal"
  >("selection");
  const [docStatuses, setDocStatuses] = useState<
    Record<
      string,
      { status: "approved" | "rejected" | "pending"; comment?: string }
    >
  >({});
  const [showNotification, setShowNotification] = useState(false);
  const [notifMessage, setNotifMessage] = useState("");
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerFile, setViewerFile] = useState<{
    name: string;
    type: string;
    size: number;
    url?: string;
  } | null>(null);

  const t = {
    title: isAm ? "የማመልከቻዎች ግምገማ" : "Applications Review",
    subtitle: isAm
      ? "የኤጀንሲዎችን የፈቃድ ማመልከቻዎች ይገምግሙ እና ያጽድቁ/ውድቅ ያድርጉ።"
      : "Review and approve/reject agency license applications.",
    tabs: {
      all: isAm ? "ሁሉም" : "All",
      pending: isAm ? "በመጠባበቅ ላይ" : "Pending",
      reviewing: isAm ? "በግምገማ ላይ" : "Reviewing",
      correction: isAm ? "ማስተካከያ የሚፈልጉ" : "Need Correction",
    },
    table: {
      appId: isAm ? "የማመልከቻ መለያ" : "App ID",
      applicant: isAm ? "አመልካች" : "Applicant",
      agency: isAm ? "ኤጀንሲ" : "Agency",
      type: isAm ? "ዓይነት" : "Type",
      date: isAm ? "ቀን" : "Date",
      status: isAm ? "ሁኔታ" : "Status",
      actions: isAm ? "እርምጃዎች" : "Actions",
    },
    status: {
      pending: isAm ? "በመጠባበቅ ላይ" : "Pending",
      reviewing: isAm ? "በግምገማ ላይ" : "Reviewing",
      approved: isAm ? "ጸድቋል" : "Approved",
      rejected: isAm ? "ውድቅ ተደርጓል" : "Rejected",
      suspended: isAm ? "የታገደ" : "Suspended",
      correction: isAm ? "ለማስተካከያ የተላከ" : "Correction Requested",
    },
    actions: {
      approve: isAm ? "አጽድቅ" : "Approve",
      reject: isAm ? "ውድቅ አድርግ" : "Reject",
      suspend: isAm ? "አግድ" : "Suspend",
      view: isAm ? "ተመልከት" : "Review Details",
      pending: isAm ? "አቆይ" : "Set Pending",
    },
  };

  const [applications, setApplications] = useState<any[]>([]);
  const [toast, setToast] = React.useState<{
    isOpen: boolean;
    type: ToastType;
    message: string;
  }>({ isOpen: false, type: "success", message: "" });

  const [assignModal, setAssignModal] = useState<{ isOpen: boolean; app: any }>(
    { isOpen: false, app: null },
  );
  const showToast = (type: ToastType, message: string) =>
    setToast({ isOpen: true, type, message });

  const fetchApplications = React.useCallback(async () => {
    try {
      const res = await apiRequest("/applications");
      // assume backend returns { data: Application[] }
      const data = res?.data || res || [];
      setApplications(Array.isArray(data) ? data : [data]);
    } catch (err: any) {
      console.error("Failed to fetch applications", err);
      showToast("error", "Failed to load applications.");
    }
  }, []);

  React.useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const filteredApps = applications.filter((app) => {
    const statusStr = String(app?.status || "").toLowerCase();
    const agencyStr = String(app?.agency || "").toLowerCase();
    const idStr = String(app?.id || "").toLowerCase();

    const matchesTab = activeTab === "all" || statusStr.includes(activeTab);
    const q = String(searchQuery || "").toLowerCase();
    const matchesSearch = agencyStr.includes(q) || idStr.includes(q);
    return matchesTab && matchesSearch;
  });

  const inferViewingStageFromApplication = (
    app: any,
  ): "selection" | "new" | "renewal" => {
    const typeValue = normalizeText(
      String(app?.applicationType || app?.type || ""),
    );

    if (typeValue.includes("renew")) {
      return "renewal";
    }

    if (typeValue.includes("new")) {
      return "new";
    }

    return "selection";
  };

  const handleApproveApp = async (appId: number | string) => {
    try {
      await apiRequest(`/applications/${appId}/approve`, { method: "POST" });
      showToast("success", "Application approved.");
      // refresh list
      await fetchApplications();
    } catch (err: any) {
      console.error("Approve failed", err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to approve application.";
      showToast("error", errMsg);
    }
  };

  const handleRejectApp = async (appId: number | string) => {
    try {
      await apiRequest(`/applications/${appId}/reject`, { method: "POST" });
      showToast("success", "Application rejected.");
      await fetchApplications();
    } catch (err: any) {
      console.error("Reject failed", err);
      showToast("error", "Failed to reject application.");
    }
  };

  const markDocumentAsVerifiedLocally = React.useCallback(
    (target: {
      scope: "organization" | "employee" | "education";
      id: number;
    }) => {
      const verifyById = (docs?: any[]) =>
        (docs || []).map((doc: any) =>
          doc?.id === target.id
            ? {
                ...doc,
                isVerified: true,
                verifiedAt: doc?.verifiedAt || new Date().toISOString(),
              }
            : doc,
        );

      setSelectedApp((prev: any) => {
        if (!prev) return prev;

        if (target.scope === "organization") {
          return {
            ...prev,
            organization: {
              ...prev.organization,
              documents: verifyById(prev.organization?.documents),
            },
          };
        }

        const updateEmployee = (employee: any) => {
          if (!employee) return employee;

          if (target.scope === "employee") {
            return {
              ...employee,
              documents: verifyById(employee.documents),
            };
          }

          return {
            ...employee,
            educationDocs: verifyById(employee.educationDocs),
          };
        };

        return {
          ...prev,
          manager: updateEmployee(prev.manager),
          operationsHead: updateEmployee(prev.operationsHead),
          adminHead: updateEmployee(prev.adminHead),
        };
      });
    },
    [],
  );

  const markDocumentAsUnverifiedLocally = React.useCallback(
    (target: {
      scope: "organization" | "employee" | "education";
      id: number;
    }) => {
      const unverifyById = (docs?: any[]) =>
        (docs || []).map((doc: any) =>
          doc?.id === target.id
            ? {
                ...doc,
                isVerified: false,
                verifiedAt: null,
              }
            : doc,
        );

      setSelectedApp((prev: any) => {
        if (!prev) return prev;

        if (target.scope === "organization") {
          return {
            ...prev,
            organization: {
              ...prev.organization,
              documents: unverifyById(prev.organization?.documents),
            },
          };
        }

        const updateEmployee = (employee: any) => {
          if (!employee) return employee;

          if (target.scope === "employee") {
            return {
              ...employee,
              documents: unverifyById(employee.documents),
            };
          }

          return {
            ...employee,
            educationDocs: unverifyById(employee.educationDocs),
          };
        };

        return {
          ...prev,
          manager: updateEmployee(prev.manager),
          operationsHead: updateEmployee(prev.operationsHead),
          adminHead: updateEmployee(prev.adminHead),
        };
      });
    },
    [],
  );

  const handleVerifyDocument = async (
    stateKey: string,
    label: string,
    target: {
      scope: "organization" | "employee" | "education";
      id: number;
    } | null,
  ) => {
    if (!selectedApp) return;

    if (!target) {
      showToast(
        "error",
        "This file is not linked to a database document, so it cannot be verified here.",
      );
      return;
    }

    try {
      const res = await apiRequest(
        `/applications/documents/${target.scope}/${target.id}/verify`,
        { method: "POST" },
      );

      setDocStatuses((prev) => ({
        ...prev,
        [stateKey]: {
          status: "approved",
          comment: prev[stateKey]?.comment,
        },
      }));

      const successMessage =
        res?.message || res?.data?.message || `${label} verified and saved.`;
      showToast("success", successMessage);

      // Keep New Application Audit stable without refetching the entire page data.
      if (viewingStage === "new") {
        markDocumentAsVerifiedLocally(target);
        return;
      }

      await fetchApplications();
    } catch (err: any) {
      console.error("Document verification failed", err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to verify the selected document.";
      showToast("error", errMsg);
    }
  };

  const handleRequestDocumentCorrection = async (
    stateKey: string,
    label: string,
    target: {
      scope: "organization" | "employee" | "education";
      id: number;
    } | null,
    uploadFieldKey: string | null,
  ) => {
    if (!selectedApp) return;

    if (!target) {
      showToast(
        "error",
        "This file is not linked to a database document, so it cannot be marked for correction here.",
      );
      return;
    }

    try {
      const res = await apiRequest(
        `/applications/documents/${target.scope}/${target.id}/unverify`,
        { method: "POST" },
      );

      setDocStatuses((prev) => ({
        ...prev,
        [stateKey]: {
          status: "pending",
          comment: prev[stateKey]?.comment,
        },
      }));

      persistCorrectionUploadField(uploadFieldKey);
      markDocumentAsUnverifiedLocally(target);

      const successMessage =
        res?.message || res?.data?.message || `${label} sent for correction.`;
      showToast("success", successMessage);

      if (viewingStage !== "new") {
        await fetchApplications();
      }
    } catch (err: any) {
      console.error("Document correction request failed", err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to mark the selected document for correction.";
      showToast("error", errMsg);
    }
  };

  const isApplicationReadyForApproval = (app: any) => {
    if (!app) return false;

    return !hasUnverifiedApplicationDocuments(app);
  };

  const handleDocAction = (
    key: string,
    status: "approved" | "rejected" | "pending",
    comment?: string,
  ) => {
    setDocStatuses((prev) => ({ ...prev, [key]: { status, comment } }));
    if (status === "rejected") {
      setNotifMessage(`Item "${key}" opened for correction`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }
  };

  const openDocumentPreview = (fileUrl: string, label: string) => {
    if (!fileUrl) return;

    const resolvedUrl = resolveFileUrl(fileUrl);
    setViewerFile({
      name: label,
      type: getFileType(fileUrl),
      size: 0,
      url: resolvedUrl,
    });
    setIsViewerOpen(true);
  };

  const ReviewItem = ({
    label,
    value,
    id,
    isFile = false,
    fileUrl,
    verificationKey,
    documentTarget,
    initialVerified = false,
  }: {
    label: string;
    value: string;
    id: string;
    isFile?: boolean;
    fileUrl?: string;
    verificationKey?: string;
    documentTarget?: {
      scope: "organization" | "employee" | "education";
      id: number;
      isVerified?: boolean;
      verifiedAt?: string | null;
    } | null;
    initialVerified?: boolean;
  }) => {
    const resolvedTarget = isFile
      ? (documentTarget ??
        resolveDocumentVerificationTarget(
          selectedApp,
          label,
          fileUrl,
          value,
          inferEmployeeSectionRole(id, verificationKey),
        ))
      : null;
    const correctionUploadKey = resolvedTarget
      ? getCorrectionUploadFieldKey(
          selectedApp,
          label,
          verificationKey,
          resolvedTarget,
        )
      : null;
    const scopedVerificationKey = resolvedTarget
      ? `${selectedApp?.id ?? "app"}:${viewingStage}:${resolvedTarget.scope}:${resolvedTarget.id}`
      : verificationKey
        ? `${selectedApp?.id ?? "app"}:${viewingStage}:${verificationKey}`
        : `${selectedApp?.id ?? "app"}:${viewingStage}:${id}`;
    const status =
      docStatuses[scopedVerificationKey]?.status ||
      (resolvedTarget?.isVerified || initialVerified ? "approved" : "pending");
    const [showComment, setShowComment] = useState(false);
    const [commentText, setCommentText] = useState(
      docStatuses[scopedVerificationKey]?.comment || "",
    );

    const [isVerifying, setIsVerifying] = useState(false);
    const [isCorrecting, setIsCorrecting] = useState(false);

    const handleSendComment = () => {
      handleDocAction(scopedVerificationKey, status, commentText);
      setShowComment(false);
      setNotifMessage(`Comment sent for "${label}"`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    };

    return (
      <div
        className={cn(
          "p-6 rounded-[32px] border-2 transition-all flex flex-col justify-between shadow-sm min-h-[160px]",
          status === "approved"
            ? "border-green-200 bg-green-50/20"
            : status === "rejected"
              ? "border-amber-200 bg-amber-50/20"
              : "border-gray-100 bg-white",
        )}
      >
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {label}
            </p>
            <div className="flex items-start space-x-2">
              {isFile && (
                <FileText className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              )}
              <p className="text-sm font-bold text-primary break-words line-clamp-2">
                {value || "-"}
              </p>
            </div>
          </div>

          {isFile && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                type="button"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  if (fileUrl) {
                    openDocumentPreview(fileUrl, label);
                    return;
                  }

                  setViewerFile({
                    name: value,
                    type: value.endsWith(".pdf")
                      ? "application/pdf"
                      : "image/jpeg",
                    size: 1024 * 1024,
                  });
                  setIsViewerOpen(true);
                }}
                className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                title="Preview"
              >
                <Eye className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-tight">
                  Preview
                </span>
              </button>
              <button
                type="button"
                onClick={async (e: React.MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  setIsVerifying(true);
                  try {
                    await handleVerifyDocument(
                      scopedVerificationKey,
                      label,
                      resolvedTarget,
                    );
                  } finally {
                    setIsVerifying(false);
                  }
                }}
                disabled={isVerifying}
                className={cn(
                  "flex items-center space-x-2 px-3 py-1.5 rounded-xl transition-all shadow-sm",
                  isVerifying ? "opacity-60 pointer-events-none" : "",
                  status === "approved"
                    ? "bg-green-600 text-white"
                    : "bg-green-50 text-green-600 hover:bg-green-600 hover:text-white",
                )}
                title="Verify document"
              >
                <CheckCircle className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-tight">
                  {isVerifying
                    ? isAm
                      ? "Verifying..."
                      : "Verifying..."
                    : status === "approved"
                      ? "Verified"
                      : "Verify"}
                </span>
              </button>
              <button
                type="button"
                onClick={async (e: React.MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  setIsCorrecting(true);
                  try {
                    await handleRequestDocumentCorrection(
                      scopedVerificationKey,
                      label,
                      resolvedTarget,
                      correctionUploadKey,
                    );
                  } finally {
                    setIsCorrecting(false);
                  }
                }}
                disabled={isCorrecting}
                className={cn(
                  "flex items-center space-x-2 px-3 py-1.5 rounded-xl transition-all shadow-sm",
                  isCorrecting ? "opacity-60 pointer-events-none" : "",
                  status === "rejected"
                    ? "bg-amber-600 text-white"
                    : "bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white",
                )}
                title="Open for Correction"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-tight">
                  Unverify
                </span>
              </button>
              <button
                type="button"
                onClick={() => setShowComment(!showComment)}
                className={cn(
                  "flex items-center space-x-2 px-3 py-1.5 rounded-xl transition-all shadow-sm",
                  docStatuses[scopedVerificationKey]?.comment
                    ? "bg-primary text-white"
                    : "bg-gray-50 text-gray-400 hover:bg-primary hover:text-white",
                )}
                title="Send Comment"
              >
                <FileText className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-tight">
                  Comment
                </span>
              </button>
            </div>
          )}
        </div>

        {showComment && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="pt-2 space-y-2"
          >
            <textarea
              placeholder="Add a comment for the agency..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full p-3 bg-white border border-gray-100 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-primary shadow-inner"
              rows={2}
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSendComment}
                className="px-4 py-1.5 bg-primary text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-md active:scale-95"
              >
                Send Comment
              </button>
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  const renderPersonnelInfoSection = ({
    accentClass,
    title,
    name,
    gender,
    citizenship,
    phoneLabel,
    phoneValue,
    emailLabel,
    emailValue,
    addressTitle,
    regionLabel,
    regionValue,
    zoneLabel,
    zoneValue,
    woredaLabel,
    woredaValue,
    kebeleLabel,
    kebeleValue,
    specialLocationLabel,
    specialLocationValue,
    houseNumberLabel,
    houseNumberValue,
    educationLevelLabel,
    educationLevelValue,
    workExpYearsLabel,
    workExpYearsValue,
    totalExpYearsLabel,
    totalExpYearsValue,
    isBlacklistedLabel,
    isBlacklistedValue,
  }: {
    accentClass: string;
    title: string;
    name: string;
    gender: string;
    citizenship: string;
    phoneLabel: string;
    phoneValue: string;
    emailLabel: string;
    emailValue: string;
    addressTitle: string;
    regionLabel: string;
    regionValue: string;
    zoneLabel: string;
    zoneValue: string;
    woredaLabel: string;
    woredaValue: string;
    kebeleLabel: string;
    kebeleValue: string;
    specialLocationLabel: string;
    specialLocationValue: string;
    houseNumberLabel: string;
    houseNumberValue: string;
    educationLevelLabel?: string;
    educationLevelValue?: string;
    workExpYearsLabel?: string;
    workExpYearsValue?: string;
    totalExpYearsLabel?: string;
    totalExpYearsValue?: string;
    isBlacklistedLabel?: string;
    isBlacklistedValue?: string;
  }) => (
    <div className="space-y-4 mb-6">
      <div className="flex items-center space-x-3 px-4">
        <div className={`w-1.5 h-6 rounded-full ${accentClass}`} />
        <h5 className="text-sm font-black text-primary uppercase tracking-tight">
          {title}
        </h5>
      </div>
      <div className="rounded-[28px] border border-gray-200 bg-white/70 px-5 py-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="space-y-3 text-sm leading-relaxed">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-black text-[#0C2A4C]">Full Name:</span>
              <span className="font-bold text-gray-700">{name}</span>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-black text-[#0C2A4C]">Gender:</span>
              <span className="font-bold text-gray-700">{gender}</span>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-black text-[#0C2A4C]">Citizenship:</span>
              <span className="font-bold text-gray-700">{citizenship}</span>
            </div>
          </div>

          <div className="space-y-3 text-sm leading-relaxed lg:border-l lg:border-gray-200 lg:pl-5">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-black text-[#0C2A4C]">{phoneLabel}:</span>
              <span className="font-bold text-gray-700">{phoneValue}</span>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-black text-[#0C2A4C]">{emailLabel}:</span>
              <span className="font-bold text-gray-700">{emailValue}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-[24px] border border-gray-100 bg-gray-50/70 px-4 py-4">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-1.5 h-5 rounded-full bg-[#0C2A4C]" />
            <h6 className="text-xs font-black text-[#0C2A4C] uppercase tracking-[0.18em]">
              {addressTitle}
            </h6>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 text-sm leading-relaxed">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-black text-[#0C2A4C]">{regionLabel}:</span>
              <span className="font-bold text-gray-700">{regionValue}</span>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-black text-[#0C2A4C]">{zoneLabel}:</span>
              <span className="font-bold text-gray-700">{zoneValue}</span>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-black text-[#0C2A4C]">{woredaLabel}:</span>
              <span className="font-bold text-gray-700">{woredaValue}</span>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-black text-[#0C2A4C]">{kebeleLabel}:</span>
              <span className="font-bold text-gray-700">{kebeleValue}</span>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-black text-[#0C2A4C]">
                {specialLocationLabel}:
              </span>
              <span className="font-bold text-gray-700">
                {specialLocationValue}
              </span>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-black text-[#0C2A4C]">
                {houseNumberLabel}:
              </span>
              <span className="font-bold text-gray-700">
                {houseNumberValue}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-[24px] border border-gray-100 bg-white/90 px-4 py-4">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-1.5 h-5 rounded-full bg-[#0C2A4C]" />
            <h6 className="text-xs font-black text-[#0C2A4C] uppercase tracking-[0.18em]">
              Employment Details
            </h6>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 text-sm leading-relaxed">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-black text-[#0C2A4C]">
                {educationLevelLabel || "Education Level"}:
              </span>
              <span className="font-bold text-gray-700">
                {educationLevelValue || "-"}
              </span>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-black text-[#0C2A4C]">
                {workExpYearsLabel || "Work Exp. Years"}:
              </span>
              <span className="font-bold text-gray-700">
                {workExpYearsValue || "-"}
              </span>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-black text-[#0C2A4C]">
                {totalExpYearsLabel || "Total Exp. Years"}:
              </span>
              <span className="font-bold text-gray-700">
                {totalExpYearsValue || "-"}
              </span>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-black text-[#0C2A4C]">
                {isBlacklistedLabel || "Blacklisted"}:
              </span>
              <span className="font-bold text-gray-700">
                {isBlacklistedValue || "-"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ReviewModal = () => {
    if (!selectedApp) return null;

    const renderSelectionScreen = () => (
      <div className="flex flex-col items-center justify-center min-h-full w-full py-16 px-12 space-y-20 bg-gray-50/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="inline-flex items-center space-x-3 bg-blue-50 text-blue-600 px-8 py-3 rounded-full text-xs font-black uppercase tracking-[0.3em] shadow-sm ring-4 ring-blue-50/50">
            <ShieldCheck className="w-5 h-5" />
            <span>Federal Police Review Portal</span>
          </div>
          <h3 className="text-7xl font-black text-primary uppercase tracking-tighter leading-none">
            Choose Review Category
          </h3>
          <p className="text-gray-400 text-xl font-medium max-w-3xl mx-auto leading-relaxed">
            Directly select which phase of{" "}
            <span className="text-primary font-black">
              {selectedApp.agency}
            </span>
            's submission you wish to audit. All documents and inputs are
            live-synced from the agency dashboard.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-7xl">
          {[
            {
              id: "new",
              title: "New Application",
              desc: "Comprehensive audit of organizational structure, capital assets, and personnel profiles.",
              icon: Shield,
              color: "green",
              delay: 0.1,
            },
            {
              id: "renewal",
              title: "Renewal Review",
              desc: "Annual compliance review including tax clearance, financial health, and guard statistics.",
              icon: RefreshCw,
              color: "amber",
              delay: 0.2,
            },
          ].map((item) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: item.delay, type: "spring", stiffness: 100 }}
              whileHover={{ scale: 1.02, translateY: -12 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setViewingStage(item.id as any)}
              className="group relative bg-white rounded-[70px] p-16 border-2 border-transparent hover:border-blue-500 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] flex flex-col items-center text-center space-y-10 transition-all aspect-[4/5] overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-[80px] -mr-8 -mt-8 transition-all group-hover:bg-blue-50 group-hover:w-40 group-hover:h-40" />
              <div className="w-32 h-32 rounded-[48px] flex items-center justify-center bg-gray-50 text-gray-400 group-hover:bg-primary group-hover:text-white group-hover:rotate-6 transition-all duration-700 shadow-sm z-10">
                <item.icon className="w-16 h-16" />
              </div>
              <div className="space-y-6 z-10 flex-1 flex flex-col justify-center">
                <h4 className="text-3xl font-black text-primary uppercase tracking-tight leading-tight">
                  {item.title}
                </h4>
                <p className="text-base text-gray-400 font-medium px-4 leading-relaxed">
                  {item.desc}
                </p>
              </div>
              <div className="w-full flex items-center justify-center space-x-4 text-blue-600 font-black text-sm uppercase tracking-widest bg-blue-50 py-6 rounded-[32px] group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm z-10">
                <span>Start Audit</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );

    const renderNewApplication = () => (
      <div className="space-y-10 pb-24">
        {/* Agency & Office Information */}
        <section className="grid grid-cols-1 gap-10 py-6 lg:grid-cols-2 lg:items-start">
          {/* SECTION 1: ORGANIZATION INFORMATION */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 border-b border-gray-100 pb-3">
              <div className="w-1 h-5 bg-[#DCC380] rounded-full" />
              <h4 className="text-sm font-black text-[#0C2A4C] uppercase tracking-[0.2em]">
                Organization Information
              </h4>
            </div>

            <div className="bg-gray-50/50 rounded-[32px] border border-gray-100 p-8 shadow-sm h-full">
              <div className="flex flex-wrap gap-y-4 text-sm leading-relaxed">
                <div className="flex items-center mr-6">
                  <span className="font-black text-[#0C2A4C] mr-2">
                    Organization Name (Amharic):
                  </span>
                  <span className="font-bold text-gray-700">
                    {selectedApp.organization?.nameAmharic ||
                      selectedApp.agency ||
                      "—"}
                  </span>
                  <span className="mx-4 text-[#DCC380] font-light">|</span>
                </div>

                <div className="flex items-center mr-6">
                  <span className="font-black text-[#0C2A4C] mr-2">
                    Organization Name (English):
                  </span>
                  <span className="font-bold text-gray-700">
                    {selectedApp.organization?.nameEnglish || "—"}
                  </span>
                  <span className="mx-4 text-[#DCC380] font-light">|</span>
                </div>

                <div className="flex items-center mr-6">
                  <span className="font-black text-[#0C2A4C] mr-2">
                    Trade Name:
                  </span>
                  <span className="font-bold text-gray-700">
                    {selectedApp.organization?.tradeName || "—"}
                  </span>
                  <span className="mx-4 text-[#DCC380] font-light">|</span>
                </div>

                <div className="flex items-center">
                  <span className="font-black text-[#0C2A4C] mr-2">
                    TIN Number:
                  </span>
                  <span className="font-mono font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 uppercase">
                    {selectedApp.organization?.tinNumber || "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: CONTACT AND ADDRESS */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 border-b border-gray-100 pb-3">
              <div className="w-1 h-5 bg-[#DCC380] rounded-full" />
              <h4 className="text-sm font-black text-[#0C2A4C] uppercase tracking-[0.2em]">
                Contact and Address
              </h4>
            </div>

            <div className="bg-[#0C2A4C] rounded-[32px] p-8 shadow-xl shadow-blue-900/10 relative overflow-hidden h-full">
              {/* Decorative Brand Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#DCC380] opacity-5 -mr-16 -mt-16 rounded-full" />

              <div className="space-y-6 text-sm">
                {/* Address Row */}
                <div className="flex flex-wrap items-center gap-y-3 text-white/90">
                  <span className="font-black text-[#DCC380] mr-2 uppercase tracking-wider">
                    Region:
                  </span>
                  <span className="font-bold mr-4">
                    {selectedApp.organization?.address?.kebele?.woreda?.zone
                      ?.region?.name || "—"}
                  </span>

                  <span className="font-black text-[#DCC380] mr-2 uppercase tracking-wider">
                    Zone:
                  </span>
                  <span className="font-bold mr-4">
                    {selectedApp.organization?.address?.kebele?.woreda?.zone
                      ?.name || "—"}
                  </span>

                  <span className="font-black text-[#DCC380] mr-2 uppercase tracking-wider">
                    Woreda:
                  </span>
                  <span className="font-bold mr-4">
                    {selectedApp.organization?.address?.kebele?.woreda?.name ||
                      "—"}
                  </span>

                  <span className="font-black text-[#DCC380] mr-2 uppercase tracking-wider">
                    Kebele:
                  </span>
                  <span className="font-bold mr-4">
                    {selectedApp.organization?.address?.kebele?.name || "—"}
                  </span>

                  <span className="font-black text-[#DCC380] mr-2 uppercase tracking-wider">
                    Special Location:
                  </span>
                  <span className="font-bold mr-4">
                    {selectedApp.organization?.address?.specialLocation || "—"}
                  </span>

                  <span className="font-black text-[#DCC380] mr-2 uppercase tracking-wider">
                    House No:
                  </span>
                  <span className="font-bold">
                    {selectedApp.organization?.address?.houseNumber || "—"}
                  </span>
                </div>

                {/* Divider */}
                <div className="h-px bg-white/10 w-full" />

                {/* Contact Row */}
                <div className="flex flex-wrap items-center gap-y-3 text-white/90">
                  <div className="flex items-center mr-8">
                    <span className="font-black text-[#DCC380] mr-2 uppercase tracking-wider">
                      Email Address:
                    </span>
                    <span className="font-bold italic">
                      {selectedApp.organization?.email || "—"}
                    </span>
                  </div>

                  <div className="flex items-center mr-8">
                    <span className="font-black text-[#DCC380] mr-2 uppercase tracking-wider">
                      Fax:
                    </span>
                    <span className="font-bold">
                      {selectedApp.organization?.faxNumber || "—"}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <span className="font-black text-[#DCC380] mr-2 uppercase tracking-wider">
                      Permanent Telephone:
                    </span>
                    <span className="font-bold underline decoration-[#DCC380] underline-offset-4">
                      {selectedApp.organization?.phone || "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Legal & Registration */}
        <section className="space-y-6">
          <div className="flex items-center space-x-3 px-4">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
            <h4 className="text-base font-black text-primary uppercase tracking-tight">
              Legal & Registration
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {selectedApp.organization?.logoUrl && (
              <ReviewItem
                label="Logo File"
                value={getFileName(selectedApp.organization.logoUrl)}
                id="new_logo_live"
                isFile
                fileUrl={selectedApp.organization.logoUrl}
                verificationKey="organization:logo"
              />
            )}
            {selectedApp.organization?.uniformSampleUrl && (
              <ReviewItem
                label="Uniform Sample"
                value={getFileName(selectedApp.organization.uniformSampleUrl)}
                id="new_uniform_live"
                isFile
                fileUrl={selectedApp.organization.uniformSampleUrl}
                verificationKey="organization:uniform"
              />
            )}
            {selectedApp.organization?.idCardSampleUrl && (
              <ReviewItem
                label="ID Card Sample"
                value={getFileName(selectedApp.organization.idCardSampleUrl)}
                id="new_id_sample_live"
                isFile
                fileUrl={selectedApp.organization.idCardSampleUrl}
                verificationKey="organization:id-card"
              />
            )}
            {buildDocumentCards(
              selectedApp.organization?.documents || [],
              "org-grid",
            )
              .slice(0, 3)
              .map((doc) => (
                <ReviewItem
                  key={doc.id}
                  label={doc.label}
                  value={doc.fileName}
                  id={doc.id}
                  isFile
                  fileUrl={doc.fileUrl}
                  verificationKey={
                    doc.documentId ? `organization:${doc.documentId}` : doc.id
                  }
                  initialVerified={doc.isVerified}
                />
              ))}
          </div>
        </section>

        {/* Assets & Facilities */}
        <section className="space-y-6">
          <div className="flex items-center space-x-3 px-4">
            <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
            <h4 className="text-base font-black text-primary uppercase tracking-tight">
              Assets & Facilities
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            <ReviewItem
              label="No. of Offices"
              value={
                selectedApp.organization?.numberOfOffices !== undefined &&
                selectedApp.organization?.numberOfOffices !== null
                  ? String(selectedApp.organization.numberOfOffices)
                  : "-"
              }
              id="new_offices_count"
            />
            <ReviewItem
              label="Store House"
              value={
                selectedApp.organization?.hasStoreHouse === undefined ||
                selectedApp.organization?.hasStoreHouse === null
                  ? "-"
                  : selectedApp.organization.hasStoreHouse
                    ? "Yes"
                    : "No"
              }
              id="new_storehouse"
            />
            <ReviewItem
              label="No. of Computers"
              value={
                selectedApp.organization?.numberOfComputers !== undefined &&
                selectedApp.organization?.numberOfComputers !== null
                  ? String(selectedApp.organization.numberOfComputers)
                  : "-"
              }
              id="new_computers_count"
            />
            <ReviewItem
              label="No. of Vehicles"
              value={
                selectedApp.organization?.numberOfVehicles !== undefined &&
                selectedApp.organization?.numberOfVehicles !== null
                  ? String(selectedApp.organization.numberOfVehicles)
                  : "-"
              }
              id="new_vehicles_count"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5 mt-4">
            <ReviewItem
              label="House Rent/Ownership Doc"
              value={
                findOrganizationDocument(selectedApp, [
                  "house rent",
                  "house ownership",
                ])?.fileName || "-"
              }
              id="new_house_docs"
              isFile
              fileUrl={
                findOrganizationDocument(selectedApp, [
                  "house rent",
                  "house ownership",
                ])?.fileUrl
              }
            />
            <ReviewItem
              label="Vehicle Rent/Ownership Doc"
              value={
                findOrganizationDocument(selectedApp, [
                  "vehicle rent",
                  "vehicle ownership",
                ])?.fileName || "-"
              }
              id="new_vehicle_docs"
              isFile
              fileUrl={
                findOrganizationDocument(selectedApp, [
                  "vehicle rent",
                  "vehicle ownership",
                ])?.fileUrl
              }
            />
          </div>
        </section>

        {/* Branding & Forms */}
        <section className="space-y-6">
          <div className="flex items-center space-x-3 px-4">
            <div className="w-1.5 h-6 bg-pink-500 rounded-full" />
            <h4 className="text-base font-black text-primary uppercase tracking-tight">
              Branding & Forms
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            <ReviewItem
              label="Uniform/Clothing Sample"
              value={
                getFileName(selectedApp.organization?.uniformSampleUrl) || "-"
              }
              id="new_uniform"
              isFile
              fileUrl={selectedApp.organization?.uniformSampleUrl}
              verificationKey="organization:uniform-sample"
            />
            <ReviewItem
              label="Employee ID Card Sample"
              value={
                getFileName(selectedApp.organization?.idCardSampleUrl) || "-"
              }
              id="new_id_card"
              isFile
              fileUrl={selectedApp.organization?.idCardSampleUrl}
              verificationKey="organization:id-card-sample"
            />
            <ReviewItem
              label="Logo of Organization"
              value={getFileName(selectedApp.organization?.logoUrl) || "-"}
              id="new_logo"
              isFile
              fileUrl={selectedApp.organization?.logoUrl}
              verificationKey="organization:logo-file"
            />
            <ReviewItem
              label="Employment Form"
              value={
                findOrganizationDocument(selectedApp, ["employment form"])
                  ?.fileName || "-"
              }
              id="new_employment_form"
              isFile
              fileUrl={
                findOrganizationDocument(selectedApp, ["employment form"])
                  ?.fileUrl
              }
              verificationKey={
                findOrganizationDocument(selectedApp, ["employment form"])
                  ? `organization:${findOrganizationDocument(selectedApp, ["employment form"])?.documentId}`
                  : "organization:employment-form"
              }
              initialVerified={Boolean(
                findOrganizationDocument(selectedApp, ["employment form"])
                  ?.isVerified,
              )}
            />
            <ReviewItem
              label="Employment Warranty Form"
              value={
                findOrganizationDocument(selectedApp, [
                  "warranty",
                  "warranty form",
                ])?.fileName || "-"
              }
              id="new_warranty_form"
              isFile
              fileUrl={
                findOrganizationDocument(selectedApp, [
                  "warranty",
                  "warranty form",
                ])?.fileUrl
              }
              verificationKey={
                findOrganizationDocument(selectedApp, [
                  "warranty",
                  "warranty form",
                ])
                  ? `organization:${findOrganizationDocument(selectedApp, ["warranty", "warranty form"])?.documentId}`
                  : "organization:warranty-form"
              }
              initialVerified={Boolean(
                findOrganizationDocument(selectedApp, [
                  "warranty",
                  "warranty form",
                ])?.isVerified,
              )}
            />
          </div>
        </section>

        {/* All Organizational Documents */}
        <section className="space-y-6">
          <div className="flex items-center space-x-3 px-4">
            <div className="w-1.5 h-6 bg-slate-600 rounded-full" />
            <h4 className="text-base font-black text-primary uppercase tracking-tight">
              All Organizational Documents
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {buildDocumentCards(
              selectedApp.organization?.documents || [],
              "org-docs",
            ).map((doc) => (
              <ReviewItem
                key={doc.id}
                label={doc.label}
                value={doc.fileName}
                id={doc.id}
                isFile
                fileUrl={doc.fileUrl}
                documentTarget={
                  doc.documentId
                    ? {
                        scope: "organization",
                        id: Number(doc.documentId),
                        isVerified: doc.isVerified,
                        verifiedAt: doc.verifiedAt ?? null,
                      }
                    : null
                }
                verificationKey={
                  doc.documentId ? `organization:${doc.documentId}` : doc.id
                }
                initialVerified={doc.isVerified}
              />
            ))}
          </div>
        </section>

        {/* Training Programs */}
        <section className="space-y-6">
          <div className="flex items-center space-x-3 px-4">
            <div className="w-1.5 h-6 bg-red-500 rounded-full" />
            <h4 className="text-base font-black text-primary uppercase tracking-tight">
              Training Programs
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            <ReviewItem
              label="Training Manual"
              value={
                getFileName(selectedApp.training?.trainingManualUrl) || "-"
              }
              id="new_training_manual"
              isFile
              fileUrl={selectedApp.training?.trainingManualUrl}
            />
          </div>
        </section>

        {/* Manager Details */}
        <section className="space-y-6 pt-10 border-t border-gray-100">
          <div className="flex items-center space-x-3 px-4">
            <div className="w-1.5 h-6 bg-cyan-600 rounded-full" />
            <h4 className="text-lg font-black text-primary uppercase tracking-tighter">
              I. Manager Requirements
            </h4>
          </div>
          <div className="p-6 bg-gray-50/30 rounded-[40px] border border-gray-200">
            {renderPersonnelInfoSection({
              accentClass: "bg-cyan-600",
              title: "Personal Information",
              name: getEmployeeDisplayName(selectedApp.manager),
              gender: selectedApp.manager?.gender || "-",
              citizenship: selectedApp.manager?.citizenship || "-",
              phoneLabel: "Phone",
              phoneValue:
                selectedApp.manager?.user?.phone ||
                selectedApp.manager?.phone ||
                "-",
              emailLabel: "Email",
              emailValue:
                selectedApp.manager?.user?.email ||
                selectedApp.manager?.email ||
                "-",
              addressTitle: "Address",
              regionLabel: "Region",
              regionValue: getEmployeeAddressDetails(selectedApp.manager)
                .region,
              zoneLabel: "Zone",
              zoneValue: getEmployeeAddressDetails(selectedApp.manager).zone,
              woredaLabel: "Woreda",
              woredaValue: getEmployeeAddressDetails(selectedApp.manager)
                .woreda,
              kebeleLabel: "Kebele",
              kebeleValue: getEmployeeAddressDetails(selectedApp.manager)
                .kebele,
              specialLocationLabel: "Special Location",
              specialLocationValue: getEmployeeAddressDetails(
                selectedApp.manager,
              ).specialLocation,
              houseNumberLabel: "House Number",
              houseNumberValue: getEmployeeAddressDetails(selectedApp.manager)
                .houseNumber,
              educationLevelLabel: "Education Level",
              educationLevelValue: getEmployeeEmploymentDetails(
                selectedApp.manager,
              ).educationLevel,
              workExpYearsLabel: "Work Exp. Years",
              workExpYearsValue: getEmployeeEmploymentDetails(
                selectedApp.manager,
              ).workExpYears,
              totalExpYearsLabel: "Total Exp. Years",
              totalExpYearsValue: getEmployeeEmploymentDetails(
                selectedApp.manager,
              ).totalExpYears,
              isBlacklistedLabel: "Blacklisted",
              isBlacklistedValue: getEmployeeEmploymentDetails(
                selectedApp.manager,
              ).isBlacklisted,
            })}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
              <ReviewItem
                label="Fingerprint Doc"
                value={
                  getFileName(
                    findEmployeeDoc(selectedApp.manager, ["fingerprint"])
                      ?.fileUrl,
                  ) || "-"
                }
                id="new_mgr_finger"
                isFile
                fileUrl={
                  findEmployeeDoc(selectedApp.manager, ["fingerprint"])?.fileUrl
                }
                verificationKey={
                  findEmployeeDoc(selectedApp.manager, ["fingerprint"])?.id
                    ? `manager:${findEmployeeDoc(selectedApp.manager, ["fingerprint"])?.id}`
                    : "manager:fingerprint"
                }
                initialVerified={Boolean(
                  findEmployeeDoc(selectedApp.manager, ["fingerprint"])
                    ?.isVerified,
                )}
              />
              <ReviewItem
                label="Medical Result"
                value={
                  getFileName(
                    findEmployeeDoc(selectedApp.manager, ["medical"])?.fileUrl,
                  ) || "-"
                }
                id="new_mgr_med"
                isFile
                fileUrl={
                  findEmployeeDoc(selectedApp.manager, ["medical"])?.fileUrl
                }
              />
              <ReviewItem
                label="Training Certificate"
                value={
                  getFileName(
                    getEmployeeTrainingCertificate(selectedApp.manager)
                      ?.fileUrl,
                  ) || "-"
                }
                id="new_mgr_train"
                isFile
                fileUrl={
                  getEmployeeTrainingCertificate(selectedApp.manager)?.fileUrl
                }
                documentTarget={getEmployeeTrainingCertificate(
                  selectedApp.manager,
                )}
                verificationKey={
                  getEmployeeTrainingCertificate(selectedApp.manager)?.id
                    ? `manager:${getEmployeeTrainingCertificate(selectedApp.manager)?.id}`
                    : "manager:training-certificate"
                }
                initialVerified={Boolean(
                  getEmployeeTrainingCertificate(selectedApp.manager)
                    ?.isVerified,
                )}
              />
              <ReviewItem
                label="Kebele Support Letter"
                value={
                  getFileName(
                    findEmployeeDoc(selectedApp.manager, ["support", "kebele"])
                      ?.fileUrl,
                  ) || "-"
                }
                id="new_mgr_kebele"
                isFile
                fileUrl={
                  findEmployeeDoc(selectedApp.manager, ["support", "kebele"])
                    ?.fileUrl
                }
              />
              <ReviewItem
                label="Proof of Collateral"
                value={
                  getFileName(
                    findEmployeeDoc(selectedApp.manager, ["collateral"])
                      ?.fileUrl,
                  ) || "-"
                }
                id="new_mgr_collateral"
                isFile
                fileUrl={
                  findEmployeeDoc(selectedApp.manager, ["collateral"])?.fileUrl
                }
              />
              <ReviewItem
                label="Police/Defense Experience"
                value={
                  getFileName(
                    findEmployeeDoc(selectedApp.manager, ["experience"])
                      ?.fileUrl,
                  ) || "-"
                }
                id="new_mgr_exp"
                isFile
                fileUrl={
                  findEmployeeDoc(selectedApp.manager, ["experience"])?.fileUrl
                }
              />
              <ReviewItem
                label="Resignation Record"
                value={
                  getFileName(
                    findEmployeeDoc(selectedApp.manager, ["resignation"])
                      ?.fileUrl,
                  ) || "-"
                }
                id="new_mgr_resign"
                isFile
                fileUrl={
                  findEmployeeDoc(selectedApp.manager, ["resignation"])?.fileUrl
                }
              />
              <ReviewItem
                label="Education Card (Degree)"
                value={
                  getFileName(
                    findEmployeeDoc(selectedApp.manager, ["education"])
                      ?.fileUrl,
                  ) || "-"
                }
                id="new_mgr_edu"
                isFile
                fileUrl={
                  findEmployeeDoc(selectedApp.manager, ["education"])?.fileUrl
                }
              />
              <ReviewItem
                label="National ID / Passport"
                value={
                  getFileName(
                    findEmployeeDoc(
                      selectedApp.manager,
                      ["national id doc"],
                      [
                        "organization id",
                        "organization identification",
                        "passport",
                        "kebele",
                      ],
                    )?.fileUrl,
                  ) || "-"
                }
                id="new_mgr_id"
                isFile
                fileUrl={
                  findEmployeeDoc(
                    selectedApp.manager,
                    ["national id doc"],
                    [
                      "organization id",
                      "organization identification",
                      "passport",
                      "kebele",
                    ],
                  )?.fileUrl
                }
                documentTarget={getEmployeeDocumentTarget(
                  selectedApp.manager,
                  ["national id doc"],
                  [
                    "organization id",
                    "organization identification",
                    "passport",
                    "kebele",
                  ],
                )}
              />
              <ReviewItem
                label="Renewed Kebele ID / passport"
                value={
                  getFileName(
                    findEmployeeDoc(
                      selectedApp.manager,
                      ["passport or kabele doc"],
                      [
                        "organization id",
                        "organization identification",
                        "national id doc",
                      ],
                    )?.fileUrl,
                  ) || "-"
                }
                id="new_mgr_kid"
                isFile
                fileUrl={
                  findEmployeeDoc(
                    selectedApp.manager,
                    ["passport or kabele doc"],
                    [
                      "organization id",
                      "organization identification",
                      "national id doc",
                    ],
                  )?.fileUrl
                }
                documentTarget={getEmployeeDocumentTarget(
                  selectedApp.manager,
                  ["passport or kabele doc"],
                  [
                    "organization id",
                    "organization identification",
                    "national id doc",
                  ],
                )}
              />
              <ReviewItem
                label="Org Identification"
                value={
                  getFileName(
                    findEmployeeDoc(
                      selectedApp.manager,
                      ["organization id", "organization identification"],
                      ["passport", "kebele", "national"],
                    )?.fileUrl,
                  ) || "-"
                }
                id="new_mgr_oid"
                isFile
                fileUrl={
                  findEmployeeDoc(
                    selectedApp.manager,
                    ["organization id", "organization identification"],
                    ["passport", "kebele", "national"],
                  )?.fileUrl
                }
              />
            </div>
          </div>
        </section>

        {/* Operations Head Details */}
        <section className="space-y-6 pt-10">
          <div className="flex items-center space-x-3 px-4">
            <div className="w-1.5 h-6 bg-blue-700 rounded-full" />
            <h4 className="text-lg font-black text-primary uppercase tracking-tighter">
              II. Operations Head Requirements
            </h4>
          </div>
          <div className="p-6 bg-gray-50/30 rounded-[40px] border border-gray-200">
            {renderPersonnelInfoSection({
              accentClass: "bg-blue-700",
              title: "Personal Information",
              name: getEmployeeDisplayName(selectedApp.operationsHead),
              gender: selectedApp.operationsHead?.gender || "-",
              citizenship: selectedApp.operationsHead?.citizenship || "-",
              phoneLabel: "Phone",
              phoneValue:
                selectedApp.operationsHead?.user?.phone ||
                selectedApp.operationsHead?.phone ||
                "-",
              emailLabel: "Email",
              emailValue:
                selectedApp.operationsHead?.user?.email ||
                selectedApp.operationsHead?.email ||
                "-",
              addressTitle: "Address",
              regionLabel: "Region",
              regionValue: getEmployeeAddressDetails(selectedApp.operationsHead)
                .region,
              zoneLabel: "Zone",
              zoneValue: getEmployeeAddressDetails(selectedApp.operationsHead)
                .zone,
              woredaLabel: "Woreda",
              woredaValue: getEmployeeAddressDetails(selectedApp.operationsHead)
                .woreda,
              kebeleLabel: "Kebele",
              kebeleValue: getEmployeeAddressDetails(selectedApp.operationsHead)
                .kebele,
              specialLocationLabel: "Special Location",
              specialLocationValue: getEmployeeAddressDetails(
                selectedApp.operationsHead,
              ).specialLocation,
              houseNumberLabel: "House Number",
              houseNumberValue: getEmployeeAddressDetails(
                selectedApp.operationsHead,
              ).houseNumber,
              educationLevelLabel: "Education Level",
              educationLevelValue: getEmployeeEmploymentDetails(
                selectedApp.operationsHead,
              ).educationLevel,
              workExpYearsLabel: "Work Exp. Years",
              workExpYearsValue: getEmployeeEmploymentDetails(
                selectedApp.operationsHead,
              ).workExpYears,
              totalExpYearsLabel: "Total Exp. Years",
              totalExpYearsValue: getEmployeeEmploymentDetails(
                selectedApp.operationsHead,
              ).totalExpYears,
              isBlacklistedLabel: "Blacklisted",
              isBlacklistedValue: getEmployeeEmploymentDetails(
                selectedApp.operationsHead,
              ).isBlacklisted,
            })}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
              <ReviewItem
                label="Fingerprint Doc"
                id="new_ops_finger"
                value={
                  getFileName(
                    findEmployeeDoc(selectedApp.operationsHead, ["fingerprint"])
                      ?.fileUrl,
                  ) || "-"
                }
                isFile
                fileUrl={
                  findEmployeeDoc(selectedApp.operationsHead, ["fingerprint"])
                    ?.fileUrl
                }
                documentTarget={getEmployeeOnlyDocumentTarget(
                  selectedApp.operationsHead,
                  ["fingerprint"],
                )}
                verificationKey={
                  getEmployeeOnlyDocumentTarget(selectedApp.operationsHead, [
                    "fingerprint",
                  ])?.id
                    ? `operations:${
                        getEmployeeOnlyDocumentTarget(
                          selectedApp.operationsHead,
                          ["fingerprint"],
                        )?.id
                      }`
                    : "operations:fingerprint"
                }
                initialVerified={Boolean(
                  getEmployeeOnlyDocumentTarget(selectedApp.operationsHead, [
                    "fingerprint",
                  ])?.isVerified,
                )}
              />
              <ReviewItem
                label="Medical Result"
                id="new_ops_med"
                value={
                  getFileName(
                    findEmployeeDoc(selectedApp.operationsHead, ["medical"])
                      ?.fileUrl,
                  ) || "-"
                }
                isFile
                fileUrl={
                  findEmployeeDoc(selectedApp.operationsHead, ["medical"])
                    ?.fileUrl
                }
              />
              <ReviewItem
                label="Training Certificate"
                id="new_ops_train"
                value={
                  getFileName(
                    getEmployeeTrainingCertificate(selectedApp.operationsHead)
                      ?.fileUrl,
                  ) || "-"
                }
                isFile
                fileUrl={
                  getEmployeeTrainingCertificate(selectedApp.operationsHead)
                    ?.fileUrl
                }
                documentTarget={getEmployeeTrainingCertificate(
                  selectedApp.operationsHead,
                )}
                verificationKey={
                  getEmployeeTrainingCertificate(selectedApp.operationsHead)?.id
                    ? `operations:${getEmployeeTrainingCertificate(selectedApp.operationsHead)?.id}`
                    : "operations:training-certificate"
                }
                initialVerified={Boolean(
                  getEmployeeTrainingCertificate(selectedApp.operationsHead)
                    ?.isVerified,
                )}
              />
              <ReviewItem
                label="Kebele Support Letter"
                id="new_ops_kebele"
                value={
                  getFileName(
                    findEmployeeDoc(selectedApp.operationsHead, [
                      "support",
                      "kebele",
                    ])?.fileUrl,
                  ) || "-"
                }
                isFile
                fileUrl={
                  findEmployeeDoc(selectedApp.operationsHead, [
                    "support",
                    "kebele",
                  ])?.fileUrl
                }
              />
              <ReviewItem
                label="Proof of Collateral"
                id="new_ops_collateral"
                value={
                  getFileName(
                    findEmployeeDoc(selectedApp.operationsHead, ["collateral"])
                      ?.fileUrl,
                  ) || "-"
                }
                isFile
                fileUrl={
                  findEmployeeDoc(selectedApp.operationsHead, ["collateral"])
                    ?.fileUrl
                }
              />
              <ReviewItem
                label="Exp Record (2+ Years)"
                id="new_ops_exp"
                value={
                  getFileName(
                    findEmployeeDoc(selectedApp.operationsHead, ["experience"])
                      ?.fileUrl,
                  ) || "-"
                }
                isFile
                fileUrl={
                  findEmployeeDoc(selectedApp.operationsHead, ["experience"])
                    ?.fileUrl
                }
              />
              <ReviewItem
                label="Resignation Record"
                id="new_ops_resign"
                value={
                  getFileName(
                    findEmployeeDoc(selectedApp.operationsHead, ["resignation"])
                      ?.fileUrl,
                  ) || "-"
                }
                isFile
                fileUrl={
                  findEmployeeDoc(selectedApp.operationsHead, ["resignation"])
                    ?.fileUrl
                }
              />
              <ReviewItem
                label="Education Card (Degree)"
                id="new_ops_edu"
                value={
                  getFileName(
                    findEmployeeDoc(selectedApp.operationsHead, ["education"])
                      ?.fileUrl,
                  ) || "-"
                }
                isFile
                fileUrl={
                  findEmployeeDoc(selectedApp.operationsHead, ["education"])
                    ?.fileUrl
                }
              />
              <ReviewItem
                label="National ID / Passport"
                id="new_ops_id"
                value={
                  getFileName(
                    findEmployeeDoc(
                      selectedApp.operationsHead,
                      ["national id doc"],
                      [
                        "organization id",
                        "organization identification",
                        "passport",
                        "kebele",
                      ],
                    )?.fileUrl,
                  ) || "-"
                }
                isFile
                fileUrl={
                  findEmployeeDoc(
                    selectedApp.operationsHead,
                    ["national id doc"],
                    [
                      "organization id",
                      "organization identification",
                      "passport",
                      "kebele",
                    ],
                  )?.fileUrl
                }
                documentTarget={getEmployeeDocumentTarget(
                  selectedApp.operationsHead,
                  ["national id doc"],
                  [
                    "organization id",
                    "organization identification",
                    "passport",
                    "kebele",
                  ],
                )}
              />
              <ReviewItem
                label="Renewed Kebele ID / passport"
                id="new_ops_kid"
                value={
                  getFileName(
                    findEmployeeDoc(
                      selectedApp.operationsHead,
                      ["passport or kabele doc"],
                      [
                        "organization id",
                        "organization identification",
                        "national id doc",
                      ],
                    )?.fileUrl,
                  ) || "-"
                }
                isFile
                fileUrl={
                  findEmployeeDoc(
                    selectedApp.operationsHead,
                    ["passport or kabele doc"],
                    [
                      "organization id",
                      "organization identification",
                      "national id doc",
                    ],
                  )?.fileUrl
                }
                documentTarget={getEmployeeDocumentTarget(
                  selectedApp.operationsHead,
                  ["passport or kabele doc"],
                  [
                    "organization id",
                    "organization identification",
                    "national id doc",
                  ],
                )}
              />
              <ReviewItem
                label="Org Identification"
                id="new_ops_oid"
                value={
                  getFileName(
                    findEmployeeDoc(
                      selectedApp.operationsHead,
                      ["organization id", "organization identification"],
                      ["passport", "kebele", "national"],
                    )?.fileUrl,
                  ) || "-"
                }
                isFile
                fileUrl={
                  findEmployeeDoc(
                    selectedApp.operationsHead,
                    ["organization id", "organization identification"],
                    ["passport", "kebele", "national"],
                  )?.fileUrl
                }
              />
            </div>
          </div>
        </section>

        {/* Administration Head Details */}
        <section className="space-y-6 pt-10">
          <div className="flex items-center space-x-3 px-4">
            <div className="w-1.5 h-6 bg-purple-700 rounded-full" />
            <h4 className="text-lg font-black text-primary uppercase tracking-tighter">
              III. Administration Head Requirements
            </h4>
          </div>
          <div className="p-6 bg-gray-50/30 rounded-[40px] border border-gray-200">
            {renderPersonnelInfoSection({
              accentClass: "bg-purple-700",
              title: "Personal Information",
              name: getEmployeeDisplayName(selectedApp.adminHead),
              gender: selectedApp.adminHead?.gender || "-",
              citizenship: selectedApp.adminHead?.citizenship || "-",
              phoneLabel: "Phone",
              phoneValue:
                selectedApp.adminHead?.user?.phone ||
                selectedApp.adminHead?.phone ||
                "-",
              emailLabel: "Email",
              emailValue:
                selectedApp.adminHead?.user?.email ||
                selectedApp.adminHead?.email ||
                "-",
              addressTitle: "Address",
              regionLabel: "Region",
              regionValue: getEmployeeAddressDetails(selectedApp.adminHead)
                .region,
              zoneLabel: "Zone",
              zoneValue: getEmployeeAddressDetails(selectedApp.adminHead).zone,
              woredaLabel: "Woreda",
              woredaValue: getEmployeeAddressDetails(selectedApp.adminHead)
                .woreda,
              kebeleLabel: "Kebele",
              kebeleValue: getEmployeeAddressDetails(selectedApp.adminHead)
                .kebele,
              specialLocationLabel: "Special Location",
              specialLocationValue: getEmployeeAddressDetails(
                selectedApp.adminHead,
              ).specialLocation,
              houseNumberLabel: "House Number",
              houseNumberValue: getEmployeeAddressDetails(selectedApp.adminHead)
                .houseNumber,
              educationLevelLabel: "Education Level",
              educationLevelValue: getEmployeeEmploymentDetails(
                selectedApp.adminHead,
              ).educationLevel,
              workExpYearsLabel: "Work Exp. Years",
              workExpYearsValue: getEmployeeEmploymentDetails(
                selectedApp.adminHead,
              ).workExpYears,
              totalExpYearsLabel: "Total Exp. Years",
              totalExpYearsValue: getEmployeeEmploymentDetails(
                selectedApp.adminHead,
              ).totalExpYears,
              isBlacklistedLabel: "Blacklisted",
              isBlacklistedValue: getEmployeeEmploymentDetails(
                selectedApp.adminHead,
              ).isBlacklisted,
            })}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
              <ReviewItem
                label="Fingerprint from police"
                id="new_admin_finger"
                value={
                  getFileName(
                    findEmployeeDoc(selectedApp.adminHead, ["fingerprint"])
                      ?.fileUrl,
                  ) || "-"
                }
                isFile
                fileUrl={
                  findEmployeeDoc(selectedApp.adminHead, ["fingerprint"])
                    ?.fileUrl
                }
              />
              <ReviewItem
                label="Medical result"
                id="new_admin_med"
                value={
                  getFileName(
                    findEmployeeDoc(selectedApp.adminHead, ["medical"])
                      ?.fileUrl,
                  ) || "-"
                }
                isFile
                fileUrl={
                  findEmployeeDoc(selectedApp.adminHead, ["medical"])?.fileUrl
                }
              />
              <ReviewItem
                label="Training Certificate"
                id="new_admin_train"
                value={
                  getFileName(
                    getEmployeeTrainingCertificate(selectedApp.adminHead)
                      ?.fileUrl,
                  ) || "-"
                }
                isFile
                fileUrl={
                  getEmployeeTrainingCertificate(selectedApp.adminHead)?.fileUrl
                }
                documentTarget={getEmployeeTrainingCertificate(
                  selectedApp.adminHead,
                )}
                verificationKey={
                  getEmployeeTrainingCertificate(selectedApp.adminHead)?.id
                    ? `admin:${getEmployeeTrainingCertificate(selectedApp.adminHead)?.id}`
                    : "admin:training-certificate"
                }
                initialVerified={Boolean(
                  getEmployeeTrainingCertificate(selectedApp.adminHead)
                    ?.isVerified,
                )}
              />
              <ReviewItem
                label="support letter from kebele"
                id="new_admin_kebele"
                value={
                  getFileName(
                    findEmployeeDoc(selectedApp.adminHead, [
                      "support",
                      "kebele",
                    ])?.fileUrl,
                  ) || "-"
                }
                isFile
                fileUrl={
                  findEmployeeDoc(selectedApp.adminHead, ["support", "kebele"])
                    ?.fileUrl
                }
              />
              <ReviewItem
                label="proof of collateral"
                id="new_admin_collateral"
                value={
                  getFileName(
                    findEmployeeDoc(selectedApp.adminHead, ["collateral"])
                      ?.fileUrl,
                  ) || "-"
                }
                isFile
                fileUrl={
                  findEmployeeDoc(selectedApp.adminHead, ["collateral"])
                    ?.fileUrl
                }
              />
              <ReviewItem
                label="Work experience (Admin 2+ Years / Degree)"
                id="new_admin_exp"
                value={
                  getFileName(
                    findEmployeeDoc(selectedApp.adminHead, ["experience"])
                      ?.fileUrl,
                  ) || "-"
                }
                isFile
                fileUrl={
                  findEmployeeDoc(selectedApp.adminHead, ["experience"])
                    ?.fileUrl
                }
              />
              <ReviewItem
                label="Dismissal / resignation record"
                id="new_admin_resign"
                value={
                  getFileName(
                    findEmployeeDoc(selectedApp.adminHead, ["resignation"])
                      ?.fileUrl,
                  ) || "-"
                }
                isFile
                fileUrl={
                  findEmployeeDoc(selectedApp.adminHead, ["resignation"])
                    ?.fileUrl
                }
              />
              <ReviewItem
                label="Educational certificate"
                id="new_admin_edu"
                value={
                  getFileName(
                    findEmployeeDoc(selectedApp.adminHead, ["education"])
                      ?.fileUrl,
                  ) || "-"
                }
                isFile
                fileUrl={
                  findEmployeeDoc(selectedApp.adminHead, ["education"])?.fileUrl
                }
              />
              <ReviewItem
                label="National Id"
                id="new_admin_id"
                value={
                  getFileName(
                    findEmployeeDoc(
                      selectedApp.adminHead,
                      ["national id doc"],
                      [
                        "organization id",
                        "organization identification",
                        "passport",
                        "kebele",
                      ],
                    )?.fileUrl,
                  ) || "-"
                }
                isFile
                fileUrl={
                  findEmployeeDoc(
                    selectedApp.adminHead,
                    ["national id doc"],
                    [
                      "organization id",
                      "organization identification",
                      "passport",
                      "kebele",
                    ],
                  )?.fileUrl
                }
                documentTarget={getEmployeeDocumentTarget(
                  selectedApp.adminHead,
                  ["national id doc"],
                  [
                    "organization id",
                    "organization identification",
                    "passport",
                    "kebele",
                  ],
                )}
              />
              <ReviewItem
                label="Renewed Kebele ID / passport"
                id="new_admin_kid"
                value={
                  getFileName(
                    findEmployeeDoc(
                      selectedApp.adminHead,
                      ["passport or kabele doc", "passport", "kebele"],
                      [
                        "organization id",
                        "organization identification",
                        "national id doc",
                      ],
                    )?.fileUrl,
                  ) || "-"
                }
                isFile
                fileUrl={
                  findEmployeeDoc(
                    selectedApp.adminHead,
                    ["passport or kabele doc", "passport", "kebele"],
                    [
                      "organization id",
                      "organization identification",
                      "national id doc",
                    ],
                  )?.fileUrl
                }
              />
              <ReviewItem
                label="Organization identification"
                id="new_admin_oid"
                value={
                  getFileName(
                    findEmployeeDoc(
                      selectedApp.adminHead,
                      ["organization id", "organization identification"],
                      ["passport", "kebele", "national id doc"],
                    )?.fileUrl,
                  ) || "-"
                }
                isFile
                fileUrl={
                  findEmployeeDoc(
                    selectedApp.adminHead,
                    ["organization id", "organization identification"],
                    ["passport", "kebele", "national id doc"],
                  )?.fileUrl
                }
              />
            </div>
          </div>
        </section>
      </div>
    );

    const renderRenewalReview = () => (
      <RenewalReviewContent
        selectedApp={selectedApp}
        ReviewItem={ReviewItem}
        renderPersonnelInfoSection={renderPersonnelInfoSection}
        getEmployeeDisplayName={getEmployeeDisplayName}
        getEmployeeAddressDetails={getEmployeeAddressDetails}
        getEmployeeEmploymentDetails={getEmployeeEmploymentDetails}
        findOrganizationDocument={findOrganizationDocument}
        findEmployeeDoc={findEmployeeDoc}
        getEmployeeDocumentTarget={getEmployeeDocumentTarget}
        getEmployeeOnlyDocumentTarget={getEmployeeOnlyDocumentTarget}
        getEmployeeOnlyDocumentCard={getEmployeeOnlyDocumentCard}
        getFileName={getFileName}
        buildDocumentCards={buildDocumentCards}
      />
    );

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-primary/40 backdrop-blur-xl overflow-hidden p-2 md:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 100 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="bg-white rounded-[32px] shadow-[0_0_200px_-50px_rgba(0,0,0,0.5)] w-full max-w-[99vw] h-[98vh] overflow-hidden flex flex-col border-[2px] border-white"
        >
          <AnimatePresence mode="wait">
            {viewingStage === "selection" ? (
              <motion.div
                key="selector"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
                transition={{ duration: 0.4 }}
                className="flex-1 overflow-y-auto relative"
              >
                <button
                  onClick={() => setSelectedApp(null)}
                  className="absolute top-6 right-6 p-4 bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-400 rounded-[25px] transition-all z-50 group"
                >
                  <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
                </button>
                {renderSelectionScreen()}
              </motion.div>
            ) : (
              <motion.div
                key="review-content"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                {/* Compact Header */}
                <div className="p-3 md:px-6 border-b flex justify-between items-center bg-white shadow-sm z-20">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setViewingStage("selection")}
                      className="p-2 bg-gray-50 text-primary rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm group"
                      title="Back to Selection"
                    >
                      <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="w-0.5 h-6 bg-gray-100 rounded-full" />
                    <div className="flex items-center space-x-2">
                      <div className="w-9 h-9 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                        {viewingStage === "new" ? (
                          <ShieldCheck className="w-5 h-5" />
                        ) : (
                          <RefreshCw className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-primary uppercase tracking-tighter shrink-0 leading-none">
                          {viewingStage === "new"
                            ? "New Application Audit"
                            : "Renewal Audit"}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-none">
                            {selectedApp.agency}
                          </span>
                          <span className="text-[8px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                            {selectedApp.id}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedApp(null)}
                      className="p-2 bg-red-50 text-red-500 rounded-xl transition-all shadow-sm"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Maximized Body */}
                <div className="flex-1 overflow-y-auto bg-gray-50/5 relative">
                  <div className="max-w-[1800px] mx-auto p-6 md:p-8">
                    {viewingStage === "new" && renderNewApplication()}
                    {viewingStage === "renewal" && renderRenewalReview()}
                  </div>
                </div>

                {/* Compact Footer */}
                <div className="p-3 md:px-6 border-t bg-white flex flex-col md:flex-row items-center justify-between gap-3 shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.1)] z-20">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-black text-xs text-primary uppercase tracking-tight leading-none">
                        Review Terminal
                      </h5>
                      <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">
                        Permanent review actions.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button className="px-4 py-2 bg-gray-100 text-gray-500 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-gray-200 transition-all">
                      On Hold
                    </button>
                    <button className="px-4 py-2 bg-red-50 text-red-500 border-2 border-red-100 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm">
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!selectedApp) return;
                        if (!isApplicationReadyForApproval(selectedApp)) {
                          showToast(
                            "error",
                            "License issuance blocked: verify every required document first. Open each file and click Verify, then try again.",
                          );
                          return;
                        }

                        handleOpenConfirm(
                          selectedApp.id,
                          selectedApp.agency,
                          "approve",
                        );
                      }}
                      disabled={!isApplicationReadyForApproval(selectedApp)}
                      className="px-8 py-2 blue-gradient text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/30 hover:scale-[1.02] transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Issue License</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Nested Viewer for Review Items */}
        <AnimatePresence>
          {isViewerOpen && viewerFile && (
            <div className="fixed inset-0 z-[220] flex items-center justify-center p-8 bg-black/80 backdrop-blur-xl">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[48px] w-full max-w-6xl h-full overflow-hidden flex flex-col shadow-2xl"
              >
                <div className="p-8 border-b flex justify-between items-center bg-white shadow-sm">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg">
                      <Eye className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-primary uppercase tracking-tighter">
                        {viewerFile.name}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        Document Preview Mode
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsViewerOpen(false)}
                    className="p-4 bg-gray-100 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="flex-1 bg-gray-100 p-12 flex items-stretch justify-center overflow-auto">
                  {viewerFile.url ? (
                    viewerFile.type === "application/pdf" ? (
                      <iframe
                        src={viewerFile.url}
                        title={viewerFile.name}
                        className="w-full h-full min-h-[70vh] rounded-[32px] bg-white shadow-2xl border-0"
                      />
                    ) : viewerFile.type.startsWith("image/") ? (
                      <img
                        src={viewerFile.url}
                        alt={viewerFile.name}
                        className="h-full w-auto max-w-full object-contain rounded-[32px] shadow-2xl bg-white"
                      />
                    ) : (
                      <a
                        href={viewerFile.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-6 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest"
                      >
                        Open File
                      </a>
                    )
                  ) : viewerFile.type === "application/pdf" ? (
                    <div className="w-full h-full bg-white rounded-[40px] shadow-2xl flex items-center justify-center relative overflow-hidden group">
                      <FileText className="w-32 h-32 text-gray-100" />
                      <div className="absolute inset-0 flex items-center justify-center flex-col space-y-4">
                        <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                          <FileText className="w-10 h-10" />
                        </div>
                        <p className="text-xl font-black text-primary uppercase tracking-tighter">
                          PDF PREVIEW SIMULATED
                        </p>
                        <p className="text-gray-400 text-sm max-w-xs text-center font-medium">
                          Standard browser integration would render the PDF
                          canvas here.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-white rounded-[40px] shadow-2xl flex items-center justify-center border-8 border-white overflow-hidden p-8">
                      <div className="w-full h-full bg-gray-50 rounded-[28px] flex items-center justify-center flex-col space-y-4 border-2 border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center">
                          <Users className="w-10 h-10" />
                        </div>
                        <p className="text-xl font-black text-green-600 uppercase tracking-tighter">
                          PHOTO PREVIEW SIMULATED
                        </p>
                        <p className="text-gray-400 text-sm max-w-xs text-center font-medium">
                          Detailed high-resolution image analysis would be
                          visible here.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // State to control the Dialog
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    type: "approve" | "reject" | "update" | "default";
    appId: string | null;
    agencyName: string;
  }>({
    isOpen: false,
    type: "default",
    appId: null,
    agencyName: "",
  });

  // Action modal state for approve/reject with remarks
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    type?: "approve" | "reject" | "suspend" | "correction" | "under_review";
    appId?: string | null;
    agencyName?: string;
    remarks?: string;
  }>({
    isOpen: false,
    type: undefined,
    appId: null,
    agencyName: "",
    remarks: "",
  });

  const [isActionLoading, setIsActionLoading] = useState(false);
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(
    null,
  );
  // Pop-up modal state for actions (replaces inline dropdown)
  const [actionPopup, setActionPopup] = useState<{
    isOpen: boolean;
    app?: any | null;
  }>({ isOpen: false, app: null });

  // Function to trigger the dialog from the table buttons
  const handleOpenConfirm = (
    id: string,
    agency: string,
    type: "approve" | "reject" | "update",
  ) => {
    setConfirmState({
      isOpen: true,
      type,
      appId: id,
      agencyName: agency,
    });
  };

  // Function called when user clicks the "Confirm" button inside the Dialog
  const handleExecuteAction = async () => {
    if (!confirmState.appId) return;

    setIsActionLoading(true);
    try {
      if (confirmState.type === "approve") {
        await handleApproveApp(confirmState.appId);
      } else if (confirmState.type === "reject") {
        await handleRejectApp(confirmState.appId);
      }
      // Add success notification here
      setConfirmState((prev) => ({ ...prev, isOpen: false }));
    } catch (error) {
      console.error("Action failed", error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleListActionChange = (app: any, action: string) => {
    if (!action) return;

    setActiveActionMenuId(null);

    if (action === "preview") {
      // Open the matching review screen directly when application type is known.
      setSelectedApp(app);
      setViewingStage(inferViewingStageFromApplication(app));
      return;
    }

    if (action === "under_review") {
      // open modal to allow remarks / scheduling notes for under review status
      setActionModal({
        isOpen: true,
        type: "under_review",
        appId: String(app.id),
        agencyName: app.agency,
        remarks: "",
      });
      return;
    }

    if (action === "correction") {
      // open correction remarks modal
      setActionModal({
        isOpen: true,
        type: "correction",
        appId: String(app.id),
        agencyName: app.agency,
        remarks: "",
      });
      return;
    }

    if (action === "approve") {
      if (hasUnverifiedApplicationDocuments(app)) {
        showToast(
          "error",
          "Verify every required document before approving this application.",
        );
        return;
      }

      // Open action modal to allow entering optional remarks before approving
      setActionModal({
        isOpen: true,
        type: "approve",
        appId: String(app.id),
        agencyName: app.agency,
        remarks: "",
      });
      return;
    }

    if (action === "reject") {
      // Open action modal to allow entering rejection remarks
      setActionModal({
        isOpen: true,
        type: "reject",
        appId: String(app.id),
        agencyName: app.agency,
        remarks: "",
      });
      return;
    }

    if (action === "assign_inspection") {
      setAssignModal({ isOpen: true, app });
      return;
    }
  };

  void activeActionMenuId;
  void handleListActionChange;

  return (
    <div className="space-y-8">
      <AutoDismissToast
        isOpen={toast.isOpen}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((s) => ({ ...s, isOpen: false }))}
        durationMs={5000}
      />
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-primary">{t.title}</h2>
          <p className="text-sm text-gray-500">{t.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <AnimatePresence>
            {showNotification && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-lg ring-4 ring-primary/10"
              >
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>{notifMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none transition-all w-64"
            />
          </div>

          <div className="flex space-x-2 bg-gray-100 p-1 rounded-xl">
            {(["all", "pending", "reviewing"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-bold text-xs rounded-lg transition-all ${
                  activeTab === tab
                    ? "bg-white text-primary shadow-sm"
                    : "text-gray-500 hover:bg-white/50"
                }`}
              >
                {t.tabs[tab]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="px-8 py-6">{t.table.appId}</th>
                <th className="px-8 py-6">{t.table.applicant}</th>
                <th className="px-8 py-6">{t.table.agency}</th>
                <th className="px-8 py-6">{t.table.type}</th>
                <th className="px-8 py-6">{t.table.date}</th>
                <th className="px-8 py-6">{t.table.status}</th>
                <th className="px-8 py-6 text-right">{t.table.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredApps.map((app) => (
                <tr
                  key={app.id}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="px-8 py-6">
                    <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                      {app.id}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm text-gray-700 font-semibold">
                    {app.applicantFullName || app.user?.fullName || "-"}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <Shield className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-primary text-sm">
                        {app.agency}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-gray-600 font-medium">
                    {app.type}
                  </td>
                  <td className="px-8 py-6 text-sm text-gray-500">
                    {app.date}
                  </td>
                  <td className="px-8 py-6 font-bold text-xs uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          app.status === "Pending"
                            ? "bg-amber-400"
                            : app.status === "Suspended"
                              ? "bg-red-500"
                              : "bg-blue-400"
                        }`}
                      />
                      <span className="text-gray-700">
                        {app.status === "Pending"
                          ? t.status.pending
                          : app.status === "Reviewing"
                            ? t.status.reviewing
                            : app.status === "Suspended"
                              ? t.status.suspended
                              : app.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right relative">
                    <div className="flex items-center justify-end">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setActionPopup({ isOpen: true, app })}
                          className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 text-primary rounded-xl font-black text-xs hover:border-primary hover:shadow-sm transition-all"
                          title="Choose action"
                        >
                          <span>Actions</span>
                          <Clock className="w-4 h-4" />
                        </button>

                        {/* actions dropdown replaced by centered pop-up modal */}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* REUSABLE DIALOG INSTANCE */}
        <ConfirmDialog
          isOpen={confirmState.isOpen}
          isLoading={isActionLoading}
          type={confirmState.type}
          onClose={() =>
            setConfirmState((prev) => ({ ...prev, isOpen: false }))
          }
          onConfirm={handleExecuteAction}
          title={
            confirmState.type === "approve"
              ? "Approve Application"
              : "Reject Application"
          }
          message={`Are you sure you want to ${confirmState.type} the application for ${confirmState.agencyName}? This action will update their status immediately.`}
        />
        {/* Centered action pop-up modal (replaces dropdown) */}
        <AnimatePresence>
          {actionPopup.isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] flex items-center justify-center p-6"
            >
              <div
                className="absolute inset-0 bg-black/30"
                onClick={() => setActionPopup({ isOpen: false, app: null })}
              />
              <motion.div
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 12, opacity: 0 }}
                className="relative z-50 w-full max-w-2xl rounded-2xl border-4"
                style={{ borderColor: "#02305E", background: "#02305E" }}
              >
                {/* gold ring with same thickness */}
                <div
                  className="rounded-xl border-4"
                  style={{ borderColor: "#FFD700", padding: "8px" }}
                >
                  {/* inner content area: white background with same border thickness */}
                  <div
                    className="bg-white rounded-lg p-8 border-4 min-h-[320px]"
                    style={{ borderColor: "#02305E" }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-black text-lg text-[#02305E]">
                        Actions for {actionPopup.app?.agency}
                      </h4>
                      <button
                        onClick={() =>
                          setActionPopup({ isOpen: false, app: null })
                        }
                        className="p-2 rounded-lg text-[#02305E] hover:bg-[#02305E]/10 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid gap-2">
                      {[
                        { label: "Preview", value: "preview" },
                        {
                          label: "Assign Inspection",
                          value: "assign_inspection",
                        },
                        { label: "Under review", value: "under_review" },
                        { label: "Approve", value: "approve" },
                        { label: "Reject", value: "reject" },
                        { label: "Correction", value: "correction" },
                      ].map((item) => {
                        const Icon = actionIconMap[item.value];
                        return (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => {
                              setActionPopup({ isOpen: false, app: null });
                              handleListActionChange(
                                actionPopup.app,
                                item.value,
                              );
                            }}
                            className="w-full text-left px-4 py-4 rounded-lg flex items-center text-sm font-bold cursor-pointer active:scale-95 active:opacity-90 focus:outline-none"
                            style={{
                              background: "#FFFFFF",
                              color: "#02305E",
                              border: "2px solid #02305E",
                            }}
                          >
                            {Icon && (
                              <Icon
                                className="w-5 h-5 mr-3"
                                style={{ color: "#02305E" }}
                              />
                            )}
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() =>
                          setActionPopup({ isOpen: false, app: null })
                        }
                        className="px-6 py-3 rounded-lg font-bold cursor-pointer"
                        style={{
                          border: "4px solid #02305E",
                          color: "#02305E",
                          background: "#FFFFFF",
                        }}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Action modal for entering remarks and updating status */}
        <AnimatePresence>
          {actionModal.isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-8"
            >
              <div
                className="absolute inset-0 bg-black/30"
                onClick={() => setActionModal({ isOpen: false })}
              />
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl z-50 w-full max-w-3xl p-8 max-h-[80vh] overflow-auto"
              >
                <h3 className="text-lg font-black mb-2">
                  {actionModal.type === "approve"
                    ? "Approve Application"
                    : actionModal.type === "reject"
                      ? "Reject Application"
                      : actionModal.type === "under_review"
                        ? "Mark Under Review"
                        : "Request Correction"}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Update status for{" "}
                  <span className="font-bold">{actionModal.agencyName}</span>.
                  Add optional remarks below.
                </p>
                <textarea
                  value={actionModal.remarks}
                  onChange={(e) =>
                    setActionModal((s) => ({ ...s, remarks: e.target.value }))
                  }
                  placeholder="Optional remarks..."
                  className="w-full min-h-[220px] border rounded-lg p-4 text-sm mb-4"
                />
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setActionModal({ isOpen: false })}
                    className="px-4 py-2 rounded-lg border"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (!actionModal.appId || !actionModal.type) return;
                      setIsActionLoading(true);
                      try {
                        if (actionModal.type === "approve") {
                          await apiRequest(
                            `/applications/${actionModal.appId}/approve`,
                            {
                              method: "POST",
                              body: JSON.stringify({
                                remarks: actionModal.remarks,
                              }),
                            },
                          );
                          showToast("success", "Application approved.");
                        } else if (actionModal.type === "reject") {
                          await apiRequest(
                            `/applications/${actionModal.appId}/reject`,
                            {
                              method: "POST",
                              body: JSON.stringify({
                                remarks: actionModal.remarks,
                              }),
                            },
                          );
                          showToast("success", "Application rejected.");
                        } else if (actionModal.type === "correction") {
                          await apiRequest(
                            `/applications/${actionModal.appId}/correction`,
                            {
                              method: "POST",
                              body: JSON.stringify({
                                remarks: actionModal.remarks,
                              }),
                            },
                          );
                          showToast("success", "Correction requested.");
                        } else if (actionModal.type === "under_review") {
                          await apiRequest(
                            `/applications/${actionModal.appId}/under-review`,
                            {
                              method: "POST",
                              body: JSON.stringify({
                                remarks: actionModal.remarks,
                              }),
                            },
                          );
                          showToast(
                            "success",
                            "Application marked under review.",
                          );
                        }
                        setActionModal({ isOpen: false });
                        await fetchApplications();
                      } catch (err: any) {
                        console.error("Action failed", err);
                        showToast(
                          "error",
                          err?.message ||
                            "Failed to update application status.",
                        );
                      } finally {
                        setIsActionLoading(false);
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-primary text-white font-bold"
                  >
                    {actionModal.type === "approve"
                      ? "Approve"
                      : actionModal.type === "reject"
                        ? "Reject"
                        : actionModal.type === "under_review"
                          ? "Mark Under Review"
                          : "Request Correction"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Assign inspection modal for admin */}
        <AssignInspectionModal
          isOpen={assignModal.isOpen}
          applicationId={assignModal.app?.id}
          onClose={() => setAssignModal({ isOpen: false, app: null })}
          onAssigned={async () => {
            setAssignModal({ isOpen: false, app: null });
            showToast("success", "Inspection scheduled.");
            await fetchApplications();
          }}
        />
      </div>
      {/* Review Modal */}
      <AnimatePresence>{selectedApp && ReviewModal()}</AnimatePresence>
    </div>
  );
};
