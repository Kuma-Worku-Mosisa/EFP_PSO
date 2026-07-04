//frontend/src/pages/LicenseManagement.tsx
import React, { useState } from "react";
import {
  Search,
  FileText,
  Send,
  Edit,
  Shield,
  RotateCw,
  AlertTriangle,
  Eye,
  X,
  Download,
  History,
  Trash2,
  Camera,
  Upload,
  QrCode,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { apiRequest, resolveBackendAssetUrl } from "../lib/api";
import { Link, useLocation } from "react-router-dom";
import { AutoDismissToast, ToastType } from "../components/AutoDismissToast";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { LoadingSpinner } from "../components/LoadingSpinner";

type LicenseRow = {
  id: number;
  organizationId: number | string | null;
  agency: string;
  ownership: string;
  licenseNo: string;
  status: string;
  issued: string;
  expiry: string;
  type: string;
  personnel: number;
  region: string;
  history: Array<{ year: string; no: string; status: string }>;
  source?: any;
};

export const LicenseManagement = () => {
  const { language } = useLanguage();
  const location = useLocation();
  const isAm = language === "am";
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLic, setSelectedLic] = useState<any>(null);
  const [actionType, setActionType] = useState<
    "none" | "renew" | "revoke" | "view" | "edit" | "send" | "history"
  >("none");
  const [licenses, setLicenses] = useState<LicenseRow[]>([]);
  const { user } = useAuth();
  const isAdmin = !!user?.roles?.some((r) =>
    String(r).toLowerCase().includes("admin"),
  );
  const isLicensingAuthority = !!user?.roles?.some(
    (r) => String(r).toLowerCase() === "licensing_authority",
  );
  const [selectedCertByOwner, setSelectedCertByOwner] = useState<
    Record<string | number, number>
  >({});
  const [loadingLicenses, setLoadingLicenses] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditSaving, setIsEditSaving] = useState(false);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [editCert, setEditCert] = useState<any>(null);
  const [toast, setToast] = useState<{
    isOpen: boolean;
    type: ToastType;
    message: string;
  }>({
    isOpen: false,
    type: "success",
    message: "",
  });
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "delete" | "approve" | "reject" | "update" | "default";
    onConfirm: (() => void) | null;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "default",
    onConfirm: null,
  });
  const [editForm, setEditForm] = useState({
    status: "Active",
    issuedDate: "",
    expiryDate: "",
    level: 1,
    applicantPhoto: "",
  });

  // Certificate State for Editor
  const [certData, setCertData] = useState({
    agencyLogo: "",
    applicantPhoto: "",
    qrCode: "",
    agencyName: "",
    address: "",
    level: 1,
    issuedDate: "",
    expiryDate: "",
    licenseNo: "",
    status: "Active",
  });

  const [historyPreview, setHistoryPreview] = useState<{
    type: "pdf" | "photo";
    data: any;
  } | null>(null);

  const normalizeCertificationStatus = (value?: string | null) =>
    String(value || "")
      .trim()
      .toLowerCase();

  const formatDateForInput = (value?: string | Date | null) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
  };

  const showToast = (type: ToastType, message: string) => {
    setToast({ isOpen: true, type, message });
  };

  const openConfirmDialog = ({
    title,
    message,
    type = "default",
    onConfirm,
  }: {
    title: string;
    message: string;
    type?: "delete" | "approve" | "reject" | "update" | "default";
    onConfirm: () => void;
  }) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
    });
  };

  const openEditModal = (cert: any) => {
    const source = cert?.source || cert;
    setEditCert(source);
    setEditForm({
      status: source?.status || "Active",
      issuedDate: formatDateForInput(source?.issueDate),
      expiryDate: formatDateForInput(source?.expiryDate),
      level: Number(source?.level) || 1,
      applicantPhoto: source?.applicantPhotoUrl || "",
    });
    setIsEditModalOpen(true);
  };

  const handleEditPhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!editCert?.id) return;

    try {
      setIsPhotoUploading(true);
      const fd = new FormData();
      fd.append("photo", file);

      const response = await apiRequest<{ success: boolean; data: any }>(
        `/certifications/${editCert.id}/photo`,
        {
          method: "POST",
          body: fd,
        },
      );

      const photoUrl =
        (response as any)?.data?.photoUrl ||
        (response as any)?.data?.applicantPhotoUrl ||
        "";

      if (photoUrl) {
        setEditForm((prev) => ({
          ...prev,
          applicantPhoto: photoUrl,
        }));
      }
    } catch (error: any) {
      showToast(
        "error",
        error?.message || (isAm ? "ፎቶ ማስገባት አልተሳካም" : "Failed to upload photo"),
      );
    } finally {
      setIsPhotoUploading(false);
    }
  };

  const handleSaveCertificateEdit = async () => {
    if (!editCert?.id) return;

    try {
      setIsEditSaving(true);
      const response = await apiRequest<{ success: boolean; data: any }>(
        `/certifications/${editCert.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: editForm.status,
            issueDate: editForm.issuedDate,
            expiryDate: editForm.expiryDate,
            level: editForm.level,
            applicantPhotoUrl: editForm.applicantPhoto,
          }),
        },
      );

      const updated = (response as any)?.data || response;
      setLicenses((prev) =>
        prev.map((lic) =>
          lic.id === updated.id
            ? {
                ...lic,
                status: updated.status || lic.status,
                issued: updated.issueDate
                  ? new Date(updated.issueDate).toISOString().slice(0, 10)
                  : lic.issued,
                expiry: updated.expiryDate
                  ? new Date(updated.expiryDate).toISOString().slice(0, 10)
                  : lic.expiry,
                type: updated.level || lic.type,
                source: updated,
              }
            : lic,
        ),
      );
      setIsEditModalOpen(false);
      setEditCert(null);
      setEditForm({
        status: "Active",
        issuedDate: "",
        expiryDate: "",
        level: 1,
        applicantPhoto: "",
      });
      showToast(
        "success",
        isAm ? "ሰርተፊኬቱ ተዘምኗል" : "Certificate updated successfully",
      );
    } catch (error: any) {
      showToast(
        "error",
        error?.message ||
          (isAm ? "ማዘመን አልተሳካም" : "Failed to update certificate"),
      );
    } finally {
      setIsEditSaving(false);
    }
  };

  const licenseBasePath = location.pathname.replace(/\/$/, "");

  const t = {
    title: isAm ? "የፈቃድ አስተዳደር" : "License Management",
    search: isAm ? "ኤጀንሲ ይፈልጉ..." : "Search agency...",
    filter: isAm ? "አጣራ" : "Filter",
    table: {
      agency: isAm ? "የኤጀንሲ ስም" : "Agency Name",
      ownership: isAm ? "ባለቤትነት" : "Ownership",
      licenseNo: isAm ? "የፈቃድ ቁጥር" : "License No",
      status: isAm ? "ሁኔታ" : "Status",
      issued: isAm ? "የተሰጠበት" : "Issued Date",
      expiry: isAm ? "የሚያበቃበት" : "Expiry Date",
      actions: isAm ? "እርምጃዎች" : "Actions",
    },
    status: {
      active: isAm ? "ንቁ" : "Active",
      expired: isAm ? "ጊዜው ያለፈበት" : "Expired",
      pending: isAm ? "በመጠባበቅ ላይ" : "Pending Approval",
      suspended: isAm ? "የታገደ" : "Suspended",
      revoked: isAm ? "የተሰረዘ" : "Revoked",
    },
    actions: {
      edit: isAm ? "አስተካክል" : "Edit",
      send: isAm ? "ላክ" : "Send",
      view: isAm ? "ተመልከት" : "Preview",
      history: isAm ? "ታሪክ" : "History",
      renew: isAm ? "እድሳት" : "Renew",
      revoke: isAm ? "ሰርዝ" : "Revoke",
    },
  };

  React.useEffect(() => {
    let active = true;

    const loadLicenses = async () => {
      try {
        setLoadingLicenses(true);
        setLoadError(null);
        const endpoint = isLicensingAuthority
          ? "/certifications/stamped-certificates"
          : "/certifications";
        const response = await apiRequest(endpoint);
        const records = Array.isArray((response as any)?.data)
          ? (response as any).data
          : Array.isArray(response)
            ? response
            : [];

        if (!active) return;

        setLicenses(
          records.map((record: any) => ({
            id: record.id,
            organizationId: record.organization?.id ?? null,
            userId:
              record.application?.userId ||
              record.application?.user?.id ||
              null,
            agency: record.organization?.name || "Unknown Agency",
            ownership:
              record.application?.user?.fullName ||
              record.application?.user?.username ||
              `User #${record.application?.userId ?? "-"}`,
            licenseNo: record.certificateSerialNumber || "PENDING",
            status: record.status || "Pending Approval",
            issued: record.issueDate
              ? new Date(record.issueDate).toISOString().slice(0, 10)
              : "-",
            expiry: record.expiryDate
              ? new Date(record.expiryDate).toISOString().slice(0, 10)
              : "-",
            type: record.level || record.application?.type || "License",
            personnel: 0,
            region:
              record.organization?.address?.specialLocation ||
              record.organization?.address?.houseNumber ||
              "-",
            history: [],
            source: record,
          })),
        );

        // Initialize selected certificate per organization to the latest issue date
        if (Array.isArray(records) && records.length > 0 && isAdmin) {
          const grouped: Record<string | number, any[]> = {};
          for (const r of records) {
            const orgKey =
              r.organization?.id ?? r.organization?.name ?? "unknown";
            grouped[orgKey] = grouped[orgKey] || [];
            grouped[orgKey].push(r);
          }
          const initialSelections: Record<string | number, number> = {};
          Object.entries(grouped).forEach(([orgKey, arr]) => {
            arr.sort(
              (a: any, b: any) =>
                new Date(b.issueDate).getTime() -
                new Date(a.issueDate).getTime(),
            );
            initialSelections[orgKey] = arr[0].id;
          });
          setSelectedCertByOwner(initialSelections);
        }
      } catch (error) {
        console.error("Failed to load certifications", error);
        if (active) setLicenses([]);
        try {
          const msg = (error as any)?.message || String(error);
          setLoadError(msg);
        } catch {
          setLoadError("Failed to load certifications");
        }
      } finally {
        if (active) setLoadingLicenses(false);
      }
    };

    loadLicenses();

    return () => {
      active = false;
    };
  }, []);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "photo" | "qr",
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCertData((prev) => ({
          ...prev,
          [type === "logo"
            ? "agencyLogo"
            : type === "photo"
              ? "applicantPhoto"
              : "qrCode"]: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const openEditor = (lic: any = null, type: "edit" | "renew" = "edit") => {
    if (!lic) return;

    setCertData({
      agencyLogo: "",
      applicantPhoto: "",
      qrCode: "",
      agencyName: lic.agency,
      address: lic.region || "Addis Ababa, Ethiopia",
      level:
        lic.type === "LEVEL - TWO (2)"
          ? 2
          : lic.type === "LEVEL - THREE (3)"
            ? 3
            : 1,
      issuedDate: lic.issued,
      expiryDate: lic.expiry,
      licenseNo: lic.licenseNo,
      status: lic.status,
    });
    setSelectedLic(lic);
    setActionType(type);
  };

  const filteredLicenses = licenses.filter((lic) => {
    const matchesSearch =
      lic.agency.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lic.ownership.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lic.licenseNo.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      normalizeCertificationStatus(lic.status) === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Group certificates by organization so one organization can show multiple yearly certificates.
  const groupedByOrganization = React.useMemo(() => {
    const map: Record<string | number, LicenseRow[]> = {};
    for (const l of filteredLicenses) {
      const key = l.organizationId ?? l.agency ?? "unknown";
      map[key] = map[key] || [];
      map[key].push(l);
    }
    return map;
  }, [filteredLicenses]);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="text-2xl font-bold text-primary shrink-0">
            {t.title}
          </h3>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary w-64 shadow-sm"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: "all", label: isAm ? "ሁሉም" : "All" },
            { key: "active", label: t.status.active },
            { key: "suspended", label: t.status.suspended },
            { key: "expired", label: t.status.expired },
            { key: "revoked", label: t.status.revoked },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setStatusFilter(opt.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                statusFilter === opt.key
                  ? "bg-[#003366] text-white shadow-md"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gradient-to-r from-[#003366] to-[#001F3F] text-white text-[10px] uppercase tracking-[0.2em] font-black">
              <tr>
                <th className="px-8 py-6">{t.table.agency}</th>
                <th className="px-8 py-6">{t.table.ownership}</th>
                <th className="px-8 py-6">{t.table.licenseNo}</th>
                <th className="px-8 py-6">{t.table.status}</th>
                <th className="px-8 py-6">{t.table.issued}</th>
                <th className="px-8 py-6">{t.table.expiry}</th>
                <th className="px-8 py-6 text-right">{t.table.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!loadingLicenses && loadError && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-8 py-16 text-center text-sm text-gray-500"
                  >
                    {loadError.includes("Authentication required") ||
                    loadError.includes("401") ? (
                      <>
                        Please sign in to view certifications. If you are signed
                        in, ensure you have sufficient permissions.
                      </>
                    ) : (
                      <>{loadError}</>
                    )}
                  </td>
                </tr>
              )}
              {!loadingLicenses &&
                !loadError &&
                filteredLicenses.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-8 py-16 text-center text-sm text-gray-500"
                    >
                      No certifications found.
                    </td>
                  </tr>
                )}
              {loadingLicenses && (
                <tr>
                  <td colSpan={7} className="px-8 py-16 text-center">
                    <LoadingSpinner
                      size="md"
                      text="Loading certifications..."
                    />
                  </td>
                </tr>
              )}
              {Object.keys(groupedByOrganization).length > 0
                ? Object.entries(groupedByOrganization).map(
                    ([organizationKey, certs]) => {
                      const selectedId =
                        selectedCertByOwner[organizationKey] ??
                        certs.sort(
                          (a, b) =>
                            new Date(b.issued).getTime() -
                            new Date(a.issued).getTime(),
                        )[0]?.id;
                      const selected =
                        certs.find((c) => c.id === selectedId) || certs[0];
                      return (
                        <tr
                          key={organizationKey}
                          className="hover:bg-gray-50/50 transition-colors group"
                        >
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                <Shield className="w-5 h-5" />
                              </div>
                              <span className="font-bold text-primary text-sm">
                                {selected.agency}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-sm text-gray-500 font-medium">
                            {selected.ownership}
                          </td>
                          <td className="px-8 py-6 text-sm text-gray-400 font-mono font-bold tracking-tight">
                            <select
                              value={selected.id}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setSelectedCertByOwner((prev) => ({
                                  ...prev,
                                  [organizationKey]: val,
                                }));
                              }}
                              className="bg-transparent text-sm font-mono"
                            >
                              {certs
                                .slice()
                                .sort(
                                  (a, b) =>
                                    new Date(b.issued).getTime() -
                                    new Date(a.issued).getTime(),
                                )
                                .map((c) => (
                                  <option
                                    key={c.id}
                                    value={c.id}
                                    className="font-mono"
                                  >
                                    {c.licenseNo} — {c.issued}
                                  </option>
                                ))}
                            </select>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-2">
                              {(() => {
                                const statusKey = normalizeCertificationStatus(
                                  selected.status,
                                );
                                return (
                                  <span
                                    className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                      statusKey === "active"
                                        ? "bg-green-100 text-green-700"
                                        : statusKey === "pending approval"
                                          ? "bg-amber-100 text-amber-700"
                                          : statusKey === "suspended"
                                            ? "bg-purple-100 text-purple-700"
                                            : statusKey === "revoked"
                                              ? "bg-gray-200 text-gray-700"
                                              : "bg-red-100 text-red-700"
                                    }`}
                                  >
                                    {selected.status === "Active"
                                      ? t.status.active
                                      : statusKey === "pending approval"
                                        ? t.status.pending
                                        : statusKey === "expired"
                                          ? t.status.expired
                                          : statusKey === "suspended"
                                            ? t.status.suspended
                                            : statusKey === "revoked"
                                              ? t.status.revoked
                                              : selected.status}
                                  </span>
                                );
                              })()}
                            </div>
                          </td>
                          <td className="px-8 py-6 text-sm text-gray-500 font-medium">
                            {selected.issued}
                          </td>
                          <td className="px-8 py-6 text-sm text-gray-500 font-medium">
                            {selected.expiry}
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex justify-end gap-3 items-center">
                              <button
                                onClick={() => openEditModal(selected)}
                                className="flex items-center space-x-2 px-3 py-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-600 hover:text-white transition-all shadow-sm group/btn"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-black uppercase tracking-wider">
                                  {t.actions.edit}
                                </span>
                              </button>
                              <Link
                                to={`${licenseBasePath}/${selected.id}`}
                                state={{ certificate: selected.source }}
                                className="flex items-center space-x-2 px-3 py-2 bg-white text-gray-600 rounded-xl hover:bg-gray-600 hover:text-white transition-all shadow-sm group/btn"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-black uppercase tracking-wider">
                                  {t.actions.view}
                                </span>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    },
                  )
                : filteredLicenses.map((lic) => (
                    <tr
                      key={lic.id}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                            <Shield className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-primary text-sm">
                            {lic.agency}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm text-gray-500 font-medium">
                        {lic.ownership}
                      </td>
                      <td className="px-8 py-6 text-sm text-gray-400 font-mono font-bold tracking-tight">
                        {lic.licenseNo}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-2">
                          {(() => {
                            const statusKey = normalizeCertificationStatus(
                              lic.status,
                            );
                            return (
                              <span
                                className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                  statusKey === "active"
                                    ? "bg-green-100 text-green-700"
                                    : statusKey === "pending approval"
                                      ? "bg-amber-100 text-amber-700"
                                      : statusKey === "suspended"
                                        ? "bg-purple-100 text-purple-700"
                                        : statusKey === "revoked"
                                          ? "bg-gray-200 text-gray-700"
                                          : "bg-red-100 text-red-700"
                                }`}
                              >
                                {statusKey === "active"
                                  ? t.status.active
                                  : statusKey === "pending approval"
                                    ? t.status.pending
                                    : statusKey === "expired"
                                      ? t.status.expired
                                      : statusKey === "suspended"
                                        ? t.status.suspended
                                        : statusKey === "revoked"
                                          ? t.status.revoked
                                          : lic.status}
                              </span>
                            );
                          })()}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm text-gray-500 font-medium">
                        {lic.issued}
                      </td>
                      <td className="px-8 py-6 text-sm text-gray-500 font-medium">
                        {lic.expiry}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-3 items-center">
                          <button
                            onClick={() => openEditModal(lic)}
                            className="flex items-center space-x-2 px-3 py-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-600 hover:text-white transition-all shadow-sm group/btn"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-wider">
                              {t.actions.edit}
                            </span>
                          </button>
                          <Link
                            to={`${licenseBasePath}/${lic.id}`}
                            state={{ certificate: lic.source }}
                            className="flex items-center space-x-2 px-3 py-2 bg-white text-gray-600 rounded-xl hover:bg-gray-600 hover:text-white transition-all shadow-sm group/btn"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-wider">
                              {t.actions.view}
                            </span>
                          </Link>
                          <button
                            onClick={() => {
                              setSelectedLic(lic);
                              setActionType("history");
                            }}
                            className="flex items-center space-x-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm group/btn"
                          >
                            <History className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-wider">
                              {t.actions.history}
                            </span>
                          </button>
                          <button
                            onClick={() => openEditor(lic, "renew")}
                            className="flex items-center space-x-2 px-3 py-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm group/btn"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-wider">
                              {t.actions.renew}
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedLic(lic);
                              setActionType("revoke");
                            }}
                            className="flex items-center space-x-2 px-3 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm group/btn"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-wider">
                              {t.actions.revoke}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isEditModalOpen && editCert && (
          <div className="fixed inset-0 z-[110] flex items-start sm:items-center justify-center p-2 sm:p-4 bg-primary/60 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[24px] sm:rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[92vh] p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 relative overflow-y-auto flex flex-col"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                <div>
                  <h4 className="text-xl sm:text-2xl font-black text-primary uppercase tracking-tighter">
                    {isAm ? "ሰርተፊኬት አስተካክል" : "Edit Certificate"}
                  </h4>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.3em] mt-1">
                    {editCert?.certificateSerialNumber ||
                      editCert?.licenseNo ||
                      ""}
                  </p>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-3 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 overflow-y-auto pr-1 sm:pr-2">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    {isAm ? "የሁኔታ ሁኔታ" : "Status"}
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Expired">Expired</option>
                    <option value="Revoked">Revoked</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    {isAm ? "የተሰጠበት ቀን" : "Issued Date"}
                  </label>
                  <input
                    type="date"
                    value={editForm.issuedDate}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        issuedDate: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    {isAm ? "የሚያበቃበት ቀን" : "Expiry Date"}
                  </label>
                  <input
                    type="date"
                    value={editForm.expiryDate}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        expiryDate: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    {isAm ? "ደረጃ" : "Level"}
                  </label>
                  <select
                    value={editForm.level}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        level: Number(e.target.value),
                      }))
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                  >
                    <option value={1}>LEVEL - ONE (1)</option>
                    <option value={2}>LEVEL - TWO (2)</option>
                    <option value={3}>LEVEL - THREE (3)</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    {isAm ? "የተጠቃሚ ፎቶ" : "Applicant Photo"}
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-28 rounded-2xl border border-gray-100 bg-gray-50 overflow-hidden flex items-center justify-center">
                      {editForm.applicantPhoto ? (
                        <img
                          src={
                            editForm.applicantPhoto.startsWith("data:")
                              ? editForm.applicantPhoto
                              : resolveBackendAssetUrl(editForm.applicantPhoto)
                          }
                          alt="Applicant"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-gray-300" />
                      )}
                    </div>
                    <label className="flex-1 cursor-pointer px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-gray-100 transition-all text-sm font-bold text-gray-600 text-center disabled:opacity-60">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleEditPhotoUpload}
                        disabled={isPhotoUploading}
                      />
                      {isPhotoUploading
                        ? isAm
                          ? "በመስቀል ላይ..."
                          : "Uploading..."
                        : isAm
                          ? "ፎቶ ምረጥ"
                          : "Choose Photo"}
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2 mt-auto">
                <button
                  onClick={handleSaveCertificateEdit}
                  disabled={isEditSaving || isPhotoUploading}
                  className="flex-1 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
                >
                  {isEditSaving
                    ? isAm
                      ? "በማዘመን ላይ..."
                      : "Saving..."
                    : isAm
                      ? "አስቀምጥ"
                      : "Save Changes"}
                </button>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                >
                  {isAm ? "ሰርዝ" : "Cancel"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Action Modals */}
      <AnimatePresence>
        {selectedLic && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/60 backdrop-blur-md overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`bg-white rounded-[40px] shadow-2xl w-full ${["edit", "renew"].includes(actionType) ? "max-w-4xl" : "max-w-2xl"} p-10 space-y-8 relative overflow-hidden`}
            >
              <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-4 rounded-2xl ${
                      ["view", "history"].includes(actionType)
                        ? "bg-blue-50 text-blue-600"
                        : actionType === "renew"
                          ? "bg-green-50 text-green-600"
                          : actionType === "send"
                            ? "bg-secondary/20 text-primary"
                            : actionType === "revoke"
                              ? "bg-red-50 text-red-600"
                              : "bg-gray-50 text-gray-600"
                    }`}
                  >
                    {actionType === "view" ? (
                      <Eye className="w-6 h-6" />
                    ) : actionType === "history" ? (
                      <History className="w-6 h-6" />
                    ) : actionType === "send" ? (
                      <Send className="w-6 h-6" />
                    ) : actionType === "renew" ? (
                      <RotateCw className="w-6 h-6" />
                    ) : actionType === "revoke" ? (
                      <Trash2 className="w-6 h-6" />
                    ) : (
                      <Edit className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-primary uppercase tracking-tighter">
                      {actionType === "view"
                        ? "License Preview"
                        : actionType === "history"
                          ? "License History Tracker"
                          : actionType === "send"
                            ? "Dispatch License"
                            : actionType === "renew"
                              ? "License Renewal Unit"
                              : actionType === "revoke"
                                ? "License Revocation System"
                                : "Update Credentials"}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">
                      {selectedLic.agency || "New Issuance"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLic(null)}
                  className="p-3 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="max-h-[70vh] overflow-y-auto px-2 space-y-8 no-scrollbar">
                {actionType === "history" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                      {selectedLic.history?.length > 0 ? (
                        selectedLic.history.map((h: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-6 bg-gray-50 rounded-[32px] border border-gray-100 hover:border-blue-200 transition-all group"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 font-black text-sm shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                                {h.year}
                              </div>
                              <div>
                                <p className="text-sm font-black text-primary font-mono">
                                  {h.no}
                                </p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                  Commission Cycle {h.year}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <button
                                title="Download PDF"
                                onClick={() =>
                                  setHistoryPreview({ type: "pdf", data: h })
                                }
                                className="flex items-center space-x-2 px-4 py-2.5 bg-white text-blue-600 rounded-xl shadow-sm hover:bg-blue-600 hover:text-white transition-all border border-blue-100"
                              >
                                <Download className="w-4 h-4" />
                                <span className="text-[9px] font-black uppercase">
                                  PDF
                                </span>
                              </button>
                              <button
                                title="Preview Photo"
                                onClick={() =>
                                  setHistoryPreview({ type: "photo", data: h })
                                }
                                className="flex items-center space-x-2 px-4 py-2.5 bg-white text-gray-600 rounded-xl shadow-sm hover:bg-gray-100 transition-all border border-gray-100"
                              >
                                <Eye className="w-4 h-4" />
                                <span className="text-[9px] font-black uppercase">
                                  Preview
                                </span>
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-10 text-center bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200">
                          <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-sm font-bold text-gray-400">
                            No prior license cycles found for this agency.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {["edit", "renew"].includes(actionType) && (
                  <div className="flex flex-col space-y-10">
                    <p className="text-xs text-amber-600 font-black uppercase tracking-widest bg-amber-50 p-4 rounded-xl text-center">
                      {actionType === "renew"
                        ? "Renewal Cycle: Only Issued/Expiry dates are configurable in this mode"
                        : "Visual Certificate Editor: Field edits update the real document format"}
                    </p>

                    {/* Visual License Editor matching the image */}
                    <div className="relative mx-auto bg-white border-[12px] border-double border-[var(--safe-secondary-30)] rounded-sm p-10 aspect-[1/1.414] w-[600px] shadow-2xl">
                      <div className="absolute inset-4 border-2 border-[var(--safe-secondary-10)] pointer-events-none" />

                      <div className="relative z-10 flex flex-col h-full space-y-6">
                        {/* Logos & Photo */}
                        <div className="flex justify-between items-start">
                          {/* Fed Police Logo (Static) */}
                          <div className="w-16 h-16 bg-white rounded-full border-2 border-[var(--safe-secondary-20)] flex items-center justify-center overflow-hidden">
                            <img
                              src="https://i.ibb.co/Vv8B0Xz/ethiopian-federal-police-logo.png"
                              className="w-full h-full object-contain"
                            />
                          </div>

                          {/* Agency Logo Upload */}
                          <div className="relative group">
                            <input
                              type="file"
                              className="hidden"
                              id="logoUpload"
                              onChange={(e) => handleImageUpload(e, "logo")}
                              disabled={actionType === "renew"}
                            />
                            <label
                              htmlFor={
                                actionType === "renew" ? "" : "logoUpload"
                              }
                              className={`w-16 h-16 border-2 border-dashed border-[var(--safe-secondary-30)] rounded-xl flex flex-col items-center justify-center bg-[var(--safe-secondary-10)] transition-all overflow-hidden ${actionType === "renew" ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-[var(--safe-secondary-20)]"}`}
                            >
                              {certData.agencyLogo ? (
                                <img
                                  src={certData.agencyLogo}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <>
                                  <Upload className="w-4 h-4 text-[var(--safe-secondary-30)]" />
                                  <span className="text-[6px] font-bold uppercase mt-1">
                                    Logo
                                  </span>
                                </>
                              )}
                            </label>
                          </div>

                          {/* Applicant Photo Upload */}
                          <div className="relative group">
                            <input
                              type="file"
                              className="hidden"
                              id="photoUpload"
                              onChange={(e) => handleImageUpload(e, "photo")}
                              disabled={actionType === "renew"}
                            />
                            <label
                              htmlFor={
                                actionType === "renew" ? "" : "photoUpload"
                              }
                              className={`w-20 h-24 border-2 border-dashed border-[var(--safe-secondary-30)] rounded-lg flex flex-col items-center justify-center bg-[var(--safe-secondary-10)] transition-all overflow-hidden ${actionType === "renew" ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-[var(--safe-secondary-20)]"}`}
                            >
                              {certData.applicantPhoto ? (
                                <img
                                  src={certData.applicantPhoto}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <>
                                  <Camera className="w-6 h-6 text-[var(--safe-secondary-30)]" />
                                  <span className="text-[8px] font-bold uppercase mt-1">
                                    Photo
                                  </span>
                                </>
                              )}
                            </label>
                          </div>
                        </div>

                        {/* Title Section */}
                        <div className="text-center space-y-1">
                          <h5 className="text-[10px] font-black text-[#003366]">
                            በኢትዮጵያ ፌዴራላዊ ዲሞክራሲያዊ ሪፐብሊክ የፌዴራል ፖሊስ
                          </h5>
                          <h5 className="text-[10px] font-black text-[#001F3F] uppercase">
                            The Federal Democratic Republic of Ethiopia Federal
                            police
                          </h5>
                          <div className="py-2 border-y border-[var(--safe-secondary-20)] mt-2">
                            <h6 className="text-sm font-black text-[#003366]">
                              የግል የጥበቃ ተቋማት የብቃት ማረጋገጫ የምስክር ወረቀት
                            </h6>
                            <h6 className="text-xs font-bold text-[#C5A022] italic">
                              Private Security Agencies Quality Assurance
                              Certificate
                            </h6>
                          </div>
                        </div>

                        {/* Editable Fields Area */}
                        <div className="space-y-4 pt-4">
                          <div className="flex items-center space-x-2 border-b border-[var(--safe-secondary-10)] pb-1">
                            <span className="text-[10px] font-bold text-[var(--safe-gray-500)] shrink-0 w-32">
                              Name of the Agency:
                            </span>
                            <input
                              placeholder="ABYSSINIA SECURITY SERVICES PLC"
                              value={certData.agencyName}
                              onChange={(e) =>
                                setCertData((prev) => ({
                                  ...prev,
                                  agencyName: e.target.value.toUpperCase(),
                                }))
                              }
                              disabled={actionType === "renew"}
                              className={`text-sm font-black text-primary outline-none bg-transparent w-full border-none ${actionType === "renew" ? "cursor-not-allowed text-gray-500" : ""}`}
                            />
                          </div>

                          <div className="flex items-center space-x-2 border-b border-[var(--safe-secondary-10)] pb-1">
                            <span className="text-[10px] font-bold text-[var(--safe-gray-500)] shrink-0 w-32">
                              Address:
                            </span>
                            <input
                              placeholder="Addis Ababa, Bole Sub-City, Ethiopia"
                              value={certData.address}
                              onChange={(e) =>
                                setCertData((prev) => ({
                                  ...prev,
                                  address: e.target.value,
                                }))
                              }
                              disabled={actionType === "renew"}
                              className={`text-xs font-bold text-primary outline-none bg-transparent w-full border-none ${actionType === "renew" ? "cursor-not-allowed text-gray-500" : ""}`}
                            />
                          </div>

                          <div className="flex items-center space-x-2 border-b border-[var(--safe-secondary-10)] pb-1">
                            <span className="text-[10px] font-bold text-[var(--safe-gray-500)] shrink-0 w-32">
                              Level:
                            </span>
                            <select
                              value={certData.level}
                              onChange={(e) =>
                                setCertData((prev) => ({
                                  ...prev,
                                  level: Number(e.target.value),
                                }))
                              }
                              disabled={actionType === "renew"}
                              className={`text-xs font-bold text-primary outline-none bg-transparent w-full border-none ${actionType === "renew" ? "cursor-not-allowed text-gray-500" : "cursor-pointer"}`}
                            >
                              <option value={1}>LEVEL - ONE (1)</option>
                              <option value={2}>LEVEL - TWO (2)</option>
                              <option value={3}>LEVEL - THREE (3)</option>
                            </select>
                          </div>

                          <div className="flex items-center space-x-2 border-b border-[var(--safe-secondary-10)] pb-1 ring-2 ring-green-400/20 bg-green-50/30 px-2 rounded-lg">
                            <span className="text-[10px] font-bold text-[var(--safe-gray-500)] shrink-0 w-32">
                              Date of Issued:
                            </span>
                            <input
                              type="date"
                              value={certData.issuedDate}
                              onChange={(e) =>
                                setCertData((prev) => ({
                                  ...prev,
                                  issuedDate: e.target.value,
                                }))
                              }
                              className="text-xs font-bold text-primary outline-none bg-transparent w-full border-none cursor-pointer"
                            />
                          </div>

                          <div className="flex items-center space-x-2 border-b border-[var(--safe-secondary-10)] pb-1 ring-2 ring-green-400/20 bg-green-50/30 px-2 rounded-lg">
                            <span className="text-[10px] font-bold text-[var(--safe-gray-500)] shrink-0 w-32">
                              Date of Expired:
                            </span>
                            <input
                              type="date"
                              value={certData.expiryDate}
                              onChange={(e) =>
                                setCertData((prev) => ({
                                  ...prev,
                                  expiryDate: e.target.value,
                                }))
                              }
                              className="text-xs font-bold text-primary outline-none bg-transparent w-full border-none cursor-pointer"
                            />
                          </div>

                          <div className="flex items-center space-x-2 border-b border-[var(--safe-secondary-10)] pb-1">
                            <span className="text-[10px] font-bold text-[var(--safe-gray-500)] shrink-0 w-32">
                              License No:
                            </span>
                            <input
                              placeholder="FP-PSA-2025-XXXX"
                              value={certData.licenseNo}
                              onChange={(e) =>
                                setCertData((prev) => ({
                                  ...prev,
                                  licenseNo: e.target.value.toUpperCase(),
                                }))
                              }
                              disabled={actionType === "renew"}
                              className={`text-sm font-black text-[#C5A022] outline-none bg-transparent w-full border-none tracking-widest ${actionType === "renew" ? "cursor-not-allowed opacity-70" : ""}`}
                            />
                          </div>
                        </div>

                        {/* Signature & QR Bottom */}
                        <div className="mt-auto flex justify-between items-end pb-4">
                          <div className="text-center">
                            <div className="w-32 border-b border-[var(--safe-secondary-30)] pb-1 mb-1">
                              <p className="text-[8px] font-serif italic text-[var(--safe-gray-300)]">
                                Signature Space
                              </p>
                            </div>
                            <p className="text-[8px] font-black text-primary uppercase">
                              Commissioner of Federal Police
                            </p>
                          </div>

                          <div className="relative group">
                            <input
                              type="file"
                              className="hidden"
                              id="qrUpload"
                              onChange={(e) => handleImageUpload(e, "qr")}
                              disabled={actionType === "renew"}
                            />
                            <label
                              htmlFor={actionType === "renew" ? "" : "qrUpload"}
                              className={`p-2 border-2 border-dashed border-[var(--safe-secondary-30)] rounded-xl flex flex-col items-center bg-[var(--safe-secondary-10)] transition-all ${actionType === "renew" ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-[var(--safe-secondary-20)]"}`}
                            >
                              {certData.qrCode ? (
                                <img
                                  src={certData.qrCode}
                                  className="w-12 h-12 object-contain"
                                />
                              ) : (
                                <QrCode className="w-12 h-12 text-primary" />
                              )}
                              <span className="text-[6px] font-black uppercase mt-1">
                                Edit QR
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-6 bg-gray-50 p-8 rounded-[40px] border border-gray-100">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                              <User className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                Recipient Applicant
                              </p>
                              <p className="text-sm font-black text-primary">
                                {selectedLic.agency || "Awaiting Agency Info"}
                              </p>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-full uppercase">
                            Verified User
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <button
                            onClick={() => {
                              showToast(
                                "success",
                                `License Dispatched ${actionType === "renew" ? "Renewal" : ""} to Applicant as PDF Successfully!`,
                              );
                              setSelectedLic(null);
                            }}
                            className="py-5 bg-primary text-white rounded-3xl font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-2"
                          >
                            <FileText className="w-5 h-5" />
                            <span>
                              {actionType === "renew"
                                ? "Renew & Send PDF"
                                : "Send as PDF"}
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              showToast(
                                "success",
                                `License Dispatched ${actionType === "renew" ? "Renewal" : ""} to Applicant as Photo Successfully!`,
                              );
                              setSelectedLic(null);
                            }}
                            className="py-5 bg-secondary text-primary rounded-3xl font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-2"
                          >
                            <Camera className="w-5 h-5" />
                            <span>
                              {actionType === "renew"
                                ? "Renew & Send Photo"
                                : "Send as Photo"}
                            </span>
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedLic(null)}
                        className="w-full py-5 bg-gray-100 text-gray-500 rounded-3xl font-black uppercase tracking-[0.2em] hover:bg-gray-200 transition-all font-mono"
                      >
                        CANCEL {actionType === "renew" ? "RENEWAL" : "DISPATCH"}
                      </button>
                    </div>
                  </div>
                )}

                {actionType === "renew" && (
                  <div className="space-y-6 text-center pt-4">
                    <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                      <RotateCw className="w-12 h-12" />
                    </div>
                    <div className="space-y-2">
                      <h5 className="text-xl font-black text-green-800">
                        12-Month Extension Active
                      </h5>
                      <p className="text-sm text-green-600/80 font-medium">
                        Automatic verification cycle completed. Do you verify
                        this agency remains in full compliance with Federal
                        Police PSA Standards?
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <button
                        className="flex-1 py-5 bg-green-600 text-white rounded-3xl font-black uppercase tracking-widest"
                        onClick={() => setSelectedLic(null)}
                      >
                        Confirm & Extend
                      </button>
                      <button
                        className="flex-1 py-5 bg-gray-100 text-gray-500 rounded-3xl font-black uppercase tracking-widest"
                        onClick={() => setSelectedLic(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {actionType === "revoke" && (
                  <div className="space-y-8 pt-4">
                    <div className="p-8 bg-red-50 rounded-[40px] border-2 border-red-100 text-center space-y-4">
                      <AlertTriangle className="w-16 h-16 text-red-600 mx-auto" />
                      <h5 className="text-2xl font-black text-red-700 uppercase tracking-tighter">
                        Immediate Revocation Only
                      </h5>
                      <p className="text-sm text-red-600 font-medium">
                        This command is IRREVERSIBLE. It will terminate all
                        operational rights and flag the agency in the national
                        database.
                      </p>
                    </div>
                    <textarea
                      rows={4}
                      className="w-full p-6 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-2 focus:ring-red-500 font-medium italic"
                      placeholder="State official reason for revocation..."
                    />
                    <button
                      className="w-full py-6 bg-red-600 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all"
                      onClick={() =>
                        openConfirmDialog({
                          title: isAm ? "ማጥፋት ያረጋግጡ" : "Confirm revocation",
                          message: isAm
                            ? "ይህ እርምጃ የፈቃዱን ሁኔታ ለመቀየር ያረጋግጣል።"
                            : "This will mark the license as revoked. Continue?",
                          type: "delete",
                          onConfirm: () => {
                            showToast(
                              "success",
                              isAm
                                ? "ፈቃዱ ተሰርዟል"
                                : "License revoked successfully",
                            );
                            setSelectedLic(null);
                          },
                        })
                      }
                    >
                      EXECUTE REVOKE PROTOCOL
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() =>
          setConfirmDialog((prev) => ({
            ...prev,
            isOpen: false,
            onConfirm: null,
          }))
        }
        onConfirm={() => {
          confirmDialog.onConfirm?.();
          setConfirmDialog((prev) => ({
            ...prev,
            isOpen: false,
            onConfirm: null,
          }));
        }}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
      />

      <AutoDismissToast
        isOpen={toast.isOpen}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* History Preview Modal */}
      <AnimatePresence>
        {historyPreview && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[40px] shadow-2xl max-w-2xl w-full p-8 space-y-6 relative"
            >
              <button
                onClick={() => setHistoryPreview(null)}
                className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 rounded-full transition-all z-10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="max-h-[85vh] overflow-y-auto pr-2 no-scrollbar space-y-6">
                <div className="flex items-center space-x-4 border-b border-gray-100 pb-6">
                  <div
                    className={`p-3 rounded-xl ${historyPreview.type === "pdf" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}
                  >
                    {historyPreview.type === "pdf" ? (
                      <FileText className="w-6 h-6" />
                    ) : (
                      <Camera className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h5 className="text-xl font-black text-primary uppercase tracking-tight">
                      Archive: {historyPreview.data.year}
                    </h5>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                      {historyPreview.type === "pdf"
                        ? "Official Document Format"
                        : "Photo Evidence Record"}
                    </p>
                  </div>
                </div>

                <div className="aspect-[1/1.414] bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 overflow-hidden relative flex items-center justify-center min-h-[400px]">
                  {historyPreview.type === "photo" ? (
                    <div className="relative w-full h-full p-8 flex flex-col items-center justify-center group">
                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')] opacity-10 grayscale" />
                      <div className="relative bg-white p-6 shadow-2xl border-[10px] border-white rounded-sm rotate-2 transform hover:rotate-0 transition-transform duration-500 max-w-[80%]">
                        <Shield className="w-32 h-32 text-primary opacity-5 mb-4 mx-auto" />
                        <div className="space-y-2 text-center">
                          <p className="text-[10px] font-black text-primary font-mono">
                            {historyPreview.data.no}
                          </p>
                          <p className="text-[6px] text-gray-400 font-bold uppercase">
                            Issued: {historyPreview.data.year}-09-22
                          </p>
                        </div>
                      </div>
                      <div className="absolute bottom-10 flex flex-col items-center text-gray-400">
                        <Camera className="w-8 h-8 mb-2 opacity-20" />
                        <p className="text-[8px] font-black uppercase tracking-[0.3em]">
                          Historical Photo Record
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full p-10 flex flex-col items-center justify-center space-y-8 bg-white">
                      <div className="w-full max-w-sm space-y-4">
                        <div className="h-4 bg-blue-50 rounded-full w-3/4 animate-pulse" />
                        <div className="h-4 bg-gray-50 rounded-full w-full animate-pulse" />
                        <div className="h-4 bg-gray-50 rounded-full w-5/6 animate-pulse" />
                        <div className="h-40 bg-blue-50/30 rounded-2xl animate-pulse" />
                        <div className="h-4 bg-gray-50 rounded-full w-2/3 animate-pulse" />
                      </div>
                      <div className="text-center">
                        <FileText className="w-12 h-12 text-blue-600 opacity-20 mx-auto mb-4" />
                        <p className="text-[10px] font-black text-blue-400 font-mono uppercase tracking-[0.2em]">
                          Archived System PDF Document
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button
                    onClick={() => {
                      showToast("success", "Downloading Archived Document...");
                      setHistoryPreview(null);
                    }}
                    className="py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Archive</span>
                  </button>
                  <button
                    onClick={() => setHistoryPreview(null)}
                    className="py-4 bg-white border border-gray-200 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm"
                  >
                    Cancel Preview
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
