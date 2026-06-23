//filepath: frontend/src/pages/HRmanagement/AddressChangeRequestForm.tsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Send,
  History,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  X,
  ChevronDown,
} from "lucide-react";
import { apiRequest } from "../../lib/api";
import { cn } from "../../lib/utils";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { AutoDismissToast, ToastType } from "../../components/AutoDismissToast";
import { useLanguage } from "../../context/LanguageContext";
import { useSidebar } from "../../context/SidebarContext";

interface AddressFormData {
  regionId: string;
  zoneId: string;
  woredaId: string;
  kebeleId: string;
  houseNumber: string;
  specialLocation: string;
  reason: string;
}

interface AddressDetails {
  regionName?: string | null;
  zoneName?: string | null;
  woredaName?: string | null;
  kebeleName?: string | null;
  specialLocation?: string | null;
  houseNumber?: string | null;
}

interface AddressHistoryRequest {
  id: number;
  status: string;
  requestedAddressText?: string;
  currentAddress?: AddressDetails;
  requestedAddress?: AddressDetails;
  reason?: string | null;
  adminFeedback?: string | null;
  createdAt: string;
}

interface LocationOption {
  id: number;
  nameEnglish?: string | null;
  nameAmharic?: string | null;
}

const SearchableLocationSelect = ({
  label,
  placeholder,
  searchPlaceholder,
  value,
  options,
  disabled = false,
  onChange,
  onOpen,
  onClear,
  required = false,
  isOptional = false,
}: {
  label: string;
  placeholder: string;
  searchPlaceholder: string;
  value: string;
  options: { id: number; name: string }[];
  disabled?: boolean;
  onChange: (value: string) => void;
  onOpen?: () => void;
  onClear?: () => void;
  required?: boolean;
  isOptional?: boolean;
}) => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selectedOption = options.find(
    (option) => String(option.id) === String(value),
  );

  React.useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((option) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return option.name.toLowerCase().includes(term);
  });

  return (
    <div ref={containerRef} className="space-y-1.5 text-left relative">
      <label className="text-sm font-bold text-[#003366] flex items-center gap-1">
        {label}
        {required && <span className="text-orange-500">*</span>}
        {isOptional && (
          <span className="text-[10px] font-bold text-orange-500 tracking-wide">
            ({language === "am" ? "አማራጭ" : "OPTIONAL"})
          </span>
        )}
      </label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setIsOpen((prev) => !prev);
          onOpen?.();
        }}
        className={cn(
          "w-full px-4 py-2.5 rounded-xl border text-left flex items-center justify-between gap-3 transition-all relative text-sm",
          disabled
            ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-white border-gray-200 hover:border-[#003366]/50 focus:border-[#003366]",
        )}
      >
        <span
          className={cn(
            "truncate",
            selectedOption ? "text-gray-900 font-medium" : "text-gray-400",
          )}
        >
          {selectedOption?.name || placeholder}
        </span>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-gray-400">
          {selectedOption ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onClear?.();
              }}
              className="p-0.5 rounded-full hover:bg-red-50 hover:text-red-600 transition-all"
              aria-label={`Clear ${label}`}
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </span>
      </button>

      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1.5 rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden">
          <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2.5 bg-gray-50">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400"
              autoFocus
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="shrink-0 p-1 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="max-h-52 overflow-auto p-1.5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onChange(String(option.id));
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all",
                    String(option.id) === String(value)
                      ? "bg-[#003366] text-white font-bold"
                      : "hover:bg-gray-100 text-gray-700",
                  )}
                >
                  {option.name}
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-sm text-gray-400 text-center">
                {searchTerm
                  ? language === "am"
                    ? "ምንም አማራጭ አልተገኘም"
                    : "No matching options"
                  : language === "am"
                    ? "ምንም አማራጭ የለም"
                    : "No options available"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function AddressChangeRequestForm() {
  const { language } = useLanguage();
  const isAm = language === "am";
  const [activeTab, setActiveTab] = useState<"form" | "history">("form");
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [requests, setRequests] = useState<AddressHistoryRequest[]>([]);
  const [historyFilter, setHistoryFilter] = useState<
    "ALL" | "PENDING" | "APPROVED" | "REJECTED"
  >("ALL");
  const [historySearch, setHistorySearch] = useState("");
  const [expandedRows, setExpandedRows] = useState<
    Record<
      number,
      { from?: boolean; to?: boolean; reason?: boolean; feedback?: boolean }
    >
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [formData, setFormData] = useState<AddressFormData>({
    regionId: "",
    zoneId: "",
    woredaId: "",
    kebeleId: "",
    houseNumber: "",
    specialLocation: "",
    reason: "",
  });
  const [regions, setRegions] = useState<LocationOption[]>([]);
  const [zones, setZones] = useState<LocationOption[]>([]);
  const [woredas, setWoredas] = useState<LocationOption[]>([]);
  const [kebeles, setKebeles] = useState<LocationOption[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    isOpen: boolean;
    type: ToastType;
    message: string;
  }>({ isOpen: false, type: "success", message: "" });
  const [loading, setLoading] = useState({
    regions: false,
    zones: false,
    woredas: false,
    kebeles: false,
  });
  const [hasPendingRequest, setHasPendingRequest] = useState(false);

  useEffect(() => {
    if (activeTab !== "history") return;

    let isMounted = true;
    const loadRequests = async () => {
      setHistoryLoading(true);
      setHistoryError(null);
      try {
        const res = await apiRequest<any>(
          "/organizations/address-change-requests",
        );
        if (!isMounted) return;
        // Debug log the raw response to help diagnose shapes
        if (import.meta.env.DEV)
          console.log("Loaded address-change-requests response:", res);

        // Normalize possible response shapes: { success, message, data: [...] } or { data: [...] } or direct array
        let list: any[] = [];
        if (!res) list = [];
        else if (Array.isArray(res)) list = res;
        else if (Array.isArray(res.data)) list = res.data;
        else if (Array.isArray(res?.data?.data)) list = res.data.data;
        else list = [];

        if (list.length > 0) {
          setRequests(list);
        }
      } catch (err: any) {
        if (!isMounted) return;
        setHistoryError(
          err?.message || "Failed to load address change requests.",
        );
      } finally {
        if (!isMounted) return;
        setHistoryLoading(false);
      }
    };

    loadRequests();
    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  // Check for existing pending requests to prevent duplicate submissions
  useEffect(() => {
    let isMounted = true;
    const checkPending = async () => {
      try {
        const res = await apiRequest<any>(
          "/organizations/address-change-requests",
        );
        if (!isMounted) return;
        let list: any[] = [];
        if (!res) list = [];
        else if (Array.isArray(res)) list = res;
        else if (Array.isArray(res.data)) list = res.data;
        else if (Array.isArray(res?.data?.data)) list = res.data.data;
        else list = [];

        const pending = (list || []).some((r) => r.status === "PENDING");
        setHasPendingRequest(Boolean(pending));
      } catch (err) {
        // ignore — keep existing form behavior
      }
    };

    checkPending();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadRegions = async () => {
      setLoading((state) => ({ ...state, regions: true }));
      setLoadError(null);

      try {
        const res = await apiRequest<{ data: LocationOption[] }>(
          "/location/regions",
        );
        if (!isMounted) return;
        setRegions(res.data || []);
      } catch (error: any) {
        if (!isMounted) return;
        setLoadError(
          error?.message || "Failed to load region list. Please refresh.",
        );
      } finally {
        if (!isMounted) return;
        setLoading((state) => ({ ...state, regions: false }));
      }
    };

    loadRegions();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!formData.regionId) {
      setZones([]);
      setWoredas([]);
      setKebeles([]);
      setFormData((prev) => ({
        ...prev,
        zoneId: "",
        woredaId: "",
        kebeleId: "",
      }));
      return;
    }

    let isMounted = true;
    const loadZones = async () => {
      setLoading((state) => ({ ...state, zones: true }));
      setLoadError(null);

      try {
        const res = await apiRequest<{ data: LocationOption[] }>(
          `/location/regions/${formData.regionId}/zones`,
        );
        if (!isMounted) return;
        setZones(res.data || []);
      } catch (error: any) {
        if (!isMounted) return;
        setLoadError(
          error?.message || "Unable to load zones for selected region.",
        );
      } finally {
        if (!isMounted) return;
        setLoading((state) => ({ ...state, zones: false }));
      }
    };

    loadZones();
    return () => {
      isMounted = false;
    };
  }, [formData.regionId]);

  useEffect(() => {
    if (!formData.zoneId) {
      setWoredas([]);
      setKebeles([]);
      setFormData((prev) => ({
        ...prev,
        woredaId: "",
        kebeleId: "",
      }));
      return;
    }

    let isMounted = true;
    const loadWoredas = async () => {
      setLoading((state) => ({ ...state, woredas: true }));
      setLoadError(null);

      try {
        const res = await apiRequest<{ data: LocationOption[] }>(
          `/location/zones/${formData.zoneId}/woredas`,
        );
        if (!isMounted) return;
        setWoredas(res.data || []);
      } catch (error: any) {
        if (!isMounted) return;
        setLoadError(
          error?.message || "Unable to load woredas for selected zone.",
        );
      } finally {
        if (!isMounted) return;
        setLoading((state) => ({ ...state, woredas: false }));
      }
    };

    loadWoredas();
    return () => {
      isMounted = false;
    };
  }, [formData.zoneId]);

  useEffect(() => {
    if (!formData.woredaId) {
      setKebeles([]);
      setFormData((prev) => ({ ...prev, kebeleId: "" }));
      return;
    }

    let isMounted = true;
    const loadKebeles = async () => {
      setLoading((state) => ({ ...state, kebeles: true }));
      setLoadError(null);

      try {
        const res = await apiRequest<{ data: LocationOption[] }>(
          `/location/woredas/${formData.woredaId}/kebeles`,
        );
        if (!isMounted) return;
        setKebeles(res.data || []);
      } catch (error: any) {
        if (!isMounted) return;
        setLoadError(
          error?.message || "Unable to load kebeles for selected woreda.",
        );
      } finally {
        if (!isMounted) return;
        setLoading((state) => ({ ...state, kebeles: false }));
      }
    };

    loadKebeles();
    return () => {
      isMounted = false;
    };
  }, [formData.woredaId]);

  const getOptionName = (item: LocationOption) =>
    item.nameEnglish || item.nameAmharic || `#${item.id}`;

  const mapOptions = (items: LocationOption[]) =>
    items.map((item) => ({ id: item.id, name: getOptionName(item) }));

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setLoadError(null);
    setIsConfirmOpen(true);
  };

  const submitRequest = async () => {
    setConfirmLoading(true);
    setIsSubmitting(true);
    try {
      if (hasPendingRequest) {
        setToast({
          isOpen: true,
          type: "error",
          message: "You already have a pending address change request.",
        });
        setIsConfirmOpen(false);
        return;
      }
      const payload = {
        requestedKebeleId: Number(formData.kebeleId),
        requestedHouseNumber: formData.houseNumber || undefined,
        requestedSpecialLocation: formData.specialLocation || undefined,
        reason: formData.reason,
      };

      console.log("Submitting request payload:", payload);
      await apiRequest("/organizations/address-change-requests", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setToast({
        isOpen: true,
        type: "success",
        message: "Address change request submitted successfully.",
      });
      setHasPendingRequest(true);
      setFormData({
        regionId: "",
        zoneId: "",
        woredaId: "",
        kebeleId: "",
        houseNumber: "",
        specialLocation: "",
        reason: "",
      });
      setZones([]);
      setWoredas([]);
      setKebeles([]);
      setIsConfirmOpen(false);
    } catch (error: any) {
      console.error("Failed to submit request", error);
      const msg =
        error?.message ||
        "Unable to submit address change request. Please try again.";
      setLoadError(msg);
      setToast({ isOpen: true, type: "error", message: msg });
    } finally {
      setConfirmLoading(false);
      setIsSubmitting(false);
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="w-4 h-4" />;
      case "REJECTED":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const statusColors = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-100 text-emerald-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-[#FFD700]/15 text-[#C5A022]";
    }
  };

  const { isSidebarOpen } = useSidebar();

  const containerClass = isSidebarOpen
    ? "max-w-4xl mx-auto transition-all"
    : "max-w-6xl mx-auto transition-all";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={containerClass}
    >
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
            <MapPin className="w-6 h-6 text-[#FFD700]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {isAm ? "የአድራሻ ለውጥ ጥያቄ" : "Address Change Request"}
            </h2>
            <p className="text-sm text-white/60">
              {isAm
                ? "ለአስተዳደሩ ማረጋገጫ አዲስ አድራሻ ያስገቡ"
                : "Submit a new address for admin approval"}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="flex gap-2 mb-6">
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setActiveTab("form")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all ${
            activeTab === "form"
              ? "bg-[#003366] text-white shadow-md"
              : "bg-white text-gray-500 border border-gray-200 hover:border-[#003366]/30"
          }`}
        >
          <MapPin className="w-4 h-4" />
          {isAm ? "የአድራሻ ለውጥ ጠይቅ" : "Request Change"}
        </motion.button>
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all ${
            activeTab === "history"
              ? "bg-[#003366] text-white shadow-md"
              : "bg-white text-gray-500 border border-gray-200 hover:border-[#003366]/30"
          }`}
        >
          <History className="w-4 h-4" />
          {isAm ? "ታሪክ" : "History"}
        </motion.button>
      </div>

      {activeTab === "form" ? (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <form
            onSubmit={handleOpenConfirm}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6"
          >
            {loadError ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex items-start gap-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-4"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{loadError}</span>
              </motion.div>
            ) : null}
            {hasPendingRequest ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex items-start gap-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-4"
              >
                <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>
                  {isAm
                    ? "የማይፈታ የአድራሻ ለውጥ ጥያቄ አለዎት። እስኪከናወን ድረስ አዲስ ማስገባት አይችሉም።"
                    : "You have a pending address change request. You cannot submit a new one until it is processed."}
                </span>
              </motion.div>
            ) : null}

            <div className="grid grid-cols-2 gap-5">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <SearchableLocationSelect
                  label={isAm ? "ክልል" : "Region"}
                  placeholder={isAm ? "ክልል ይምረጡ" : "Select Region"}
                  searchPlaceholder={isAm ? "ክልል ፈልግ..." : "Search region..."}
                  value={formData.regionId}
                  options={mapOptions(regions)}
                  required
                  onChange={(val) =>
                    setFormData({
                      ...formData,
                      regionId: val,
                      zoneId: "",
                      woredaId: "",
                      kebeleId: "",
                    })
                  }
                  onClear={() =>
                    setFormData({
                      ...formData,
                      regionId: "",
                      zoneId: "",
                      woredaId: "",
                      kebeleId: "",
                    })
                  }
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <SearchableLocationSelect
                  label={isAm ? "ዞን/ከተማ ንዑስ" : "Zone/Sub-city"}
                  placeholder={isAm ? "ዞን ይምረጡ" : "Select Zone"}
                  searchPlaceholder={isAm ? "ዞን ፈልግ..." : "Search zone..."}
                  value={formData.zoneId}
                  options={mapOptions(zones)}
                  disabled={!formData.regionId || loading.zones}
                  required
                  onChange={(val) =>
                    setFormData({
                      ...formData,
                      zoneId: val,
                      woredaId: "",
                      kebeleId: "",
                    })
                  }
                  onClear={() =>
                    setFormData({
                      ...formData,
                      zoneId: "",
                      woredaId: "",
                      kebeleId: "",
                    })
                  }
                />
              </motion.div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <SearchableLocationSelect
                  label={isAm ? "ወረዳ" : "Woreda"}
                  placeholder={isAm ? "ወረዳ ይምረጡ" : "Select Woreda"}
                  searchPlaceholder={isAm ? "ወረዳ ፈልግ..." : "Search woreda..."}
                  value={formData.woredaId}
                  options={mapOptions(woredas)}
                  disabled={!formData.zoneId || loading.woredas}
                  required
                  onChange={(val) =>
                    setFormData({
                      ...formData,
                      woredaId: val,
                      kebeleId: "",
                    })
                  }
                  onClear={() =>
                    setFormData({
                      ...formData,
                      woredaId: "",
                      kebeleId: "",
                    })
                  }
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <SearchableLocationSelect
                  label={isAm ? "ቀበሌ" : "Kebele"}
                  placeholder={isAm ? "ቀበሌ ይምረጡ" : "Select Kebele"}
                  searchPlaceholder={isAm ? "ቀበሌ ፈልግ..." : "Search kebele..."}
                  value={formData.kebeleId}
                  options={mapOptions(kebeles)}
                  disabled={!formData.woredaId || loading.kebeles}
                  required
                  onChange={(val) =>
                    setFormData({ ...formData, kebeleId: val })
                  }
                  onClear={() => setFormData({ ...formData, kebeleId: "" })}
                />
              </motion.div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-bold text-[#003366] mb-1.5 flex items-center gap-1">
                  {isAm ? "የቤት ቁጥር" : "House Number"}
                  <span className="text-orange-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder={isAm ? "ለምሳሌ 124/ሀ" : "e.g. 124/A"}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] outline-none text-sm"
                  value={formData.houseNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, houseNumber: e.target.value })
                  }
                />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <label className="block text-sm font-bold text-[#003366] mb-1.5 flex items-center gap-1">
                {isAm ? "ልዩ ቦታ" : "Special Location"}
                <span className="text-[10px] font-bold text-orange-500 tracking-wide">
                  ({isAm ? "አማራጭ" : "OPTIONAL"})
                </span>
              </label>
              <input
                type="text"
                placeholder={isAm ? "ከቴሌ መብራት ጀርባ" : "Around Tele"}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] outline-none text-sm"
                value={formData.specialLocation}
                onChange={(e) =>
                  setFormData({ ...formData, specialLocation: e.target.value })
                }
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-bold text-[#003366] mb-1.5">
                {isAm ? "የለውጥ ምክንያት *" : "Reason for Change *"}
              </label>
              <textarea
                required
                rows={3}
                placeholder={
                  isAm
                    ? "ድርጅቱ የሚዛወርበትን ምክንያት ያብራሩ..."
                    : "Explain why the organization is moving..."
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] outline-none resize-none text-sm"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="pt-4 border-t border-gray-100 flex justify-end"
            >
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={isSubmitting || hasPendingRequest}
                className="flex items-center gap-2 bg-gradient-to-r from-[#003366] to-[#001F3F] hover:from-[#001F3F] hover:to-[#000F1F] disabled:from-gray-300 disabled:to-gray-300 text-white px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md"
              >
                <Send className="w-4 h-4" />
                {isSubmitting
                  ? isAm
                    ? "በማስገባት ላይ..."
                    : "Submitting..."
                  : isAm
                    ? "ጥያቄ ያስገቡ"
                    : "Submit Request"}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#003366] to-[#001F3F] text-[#FFD700] flex items-center justify-center shadow-sm">
                <History className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-[#003366]">
                {isAm ? "የአድራሻ ለውጥ ታሪክ" : "Address Change History"}
              </h3>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder={isAm ? "በአድራሻ ፈልግ..." : "Search by address..."}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50 outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]/50 transition-all"
                />
              </div>
              <select
                value={historyFilter}
                onChange={(e) => setHistoryFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 bg-gray-50 outline-none focus:ring-2 focus:ring-[#003366]/20"
              >
                <option value="ALL">{isAm ? "ሁሉም" : "All"}</option>
                <option value="PENDING">
                  {isAm ? "በመጠባበቅ ላይ" : "Pending"}
                </option>
                <option value="APPROVED">{isAm ? "ጸድቋል" : "Approved"}</option>
                <option value="REJECTED">
                  {isAm ? "ውድቅ ሆኗል" : "Rejected"}
                </option>
              </select>
              <span className="text-xs font-medium text-gray-400 bg-gray-50 px-3 py-2 rounded-xl whitespace-nowrap">
                {historyLoading
                  ? isAm
                    ? "በማምጣት ላይ..."
                    : "Loading..."
                  : `${requests.length} ${isAm ? "ጥያቄዎች" : "requests"}`}
              </span>
            </div>
          </div>

          {historyError ? (
            <div className="flex items-start gap-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{historyError}</span>
            </div>
          ) : null}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#003366] text-white text-[11px] uppercase tracking-[0.2em]">
                  <th className="p-4">{isAm ? "የጥያቄ መለያ" : "Request ID"}</th>
                  <th className="p-4">{isAm ? "ከ አድራሻ" : "From Address"}</th>
                  <th className="p-4">{isAm ? "ወደ አድራሻ" : "To Address"}</th>
                  <th className="p-4">{isAm ? "ምክንያት" : "Reason"}</th>
                  <th className="p-4">
                    {isAm ? "የአስተዳዳሪ አስተያየት" : "Admin Feedback"}
                  </th>
                  <th className="p-4">{isAm ? "ሁኔታ" : "Status"}</th>
                  <th className="p-4">{isAm ? "ቀን" : "Date"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700">
                {(requests || [])
                  .filter((r) => {
                    if (historyFilter !== "ALL" && r.status !== historyFilter)
                      return false;
                    if (historySearch) {
                      const q = historySearch.toLowerCase();
                      if (
                        !(r.requestedAddressText?.toLowerCase() || "").includes(
                          q,
                        ) &&
                        !(
                          r.currentAddress?.houseNumber?.toLowerCase() || ""
                        ).includes(q) &&
                        !(
                          r.currentAddress?.specialLocation?.toLowerCase() || ""
                        ).includes(q) &&
                        !(
                          r.currentAddress?.kebeleName?.toLowerCase() || ""
                        ).includes(q) &&
                        !(
                          r.currentAddress?.woredaName?.toLowerCase() || ""
                        ).includes(q) &&
                        !(
                          r.currentAddress?.zoneName?.toLowerCase() || ""
                        ).includes(q) &&
                        !(
                          r.currentAddress?.regionName?.toLowerCase() || ""
                        ).includes(q) &&
                        !(
                          r.requestedAddress?.houseNumber?.toLowerCase() || ""
                        ).includes(q) &&
                        !(
                          r.requestedAddress?.specialLocation?.toLowerCase() ||
                          ""
                        ).includes(q) &&
                        !(
                          r.requestedAddress?.kebeleName?.toLowerCase() || ""
                        ).includes(q) &&
                        !(
                          r.requestedAddress?.woredaName?.toLowerCase() || ""
                        ).includes(q) &&
                        !(
                          r.requestedAddress?.zoneName?.toLowerCase() || ""
                        ).includes(q) &&
                        !(
                          r.requestedAddress?.regionName?.toLowerCase() || ""
                        ).includes(q) &&
                        !(r.reason || "").toLowerCase().includes(q) &&
                        !(r.adminFeedback || "").toLowerCase().includes(q) &&
                        !String(r.id).includes(q)
                      )
                        return false;
                    }
                    return true;
                  })
                  .map((r, idx) => (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      whileHover={{ backgroundColor: "rgba(0,51,102,0.02)" }}
                      className="transition-colors"
                    >
                      <td className="p-4 font-bold text-[#003366]">
                        {idx + 1}
                      </td>
                      <td className="p-4 min-w-[240px] max-w-[280px] align-top">
                        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700">
                              {isAm ? "ከ:" : "From:"}
                            </span>
                            <span className="text-xs text-blue-600 font-semibold">
                              {r.currentAddress?.houseNumber
                                ? `H-${r.currentAddress.houseNumber.replace(/^H-|^H/, "")}`
                                : "—"}
                            </span>
                          </div>
                          <div
                            className={cn(
                              "text-xs leading-5 space-y-1 text-gray-700 overflow-hidden transition-[max-height] duration-200",
                              expandedRows[r.id]?.from
                                ? "max-h-96"
                                : "max-h-[4.5rem]",
                            )}
                          >
                            <div>
                              <span className="font-semibold">
                                {isAm ? "ሥ.ቦታ:" : "Sp.Loc.:"}
                              </span>{" "}
                              {r.currentAddress?.specialLocation || "—"}
                            </div>
                            <div>
                              <span className="font-semibold">
                                {isAm ? "ቀበሌ:" : "Kebele:"}
                              </span>{" "}
                              {r.currentAddress?.kebeleName || "—"}
                            </div>
                            <div>
                              <span className="font-semibold">
                                {isAm ? "ወሬዳ:" : "Woreda:"}
                              </span>{" "}
                              {r.currentAddress?.woredaName || "—"}
                            </div>
                            <div>
                              <span className="font-semibold">
                                {isAm ? "ዞን:" : "Zone:"}
                              </span>{" "}
                              {r.currentAddress?.zoneName || "—"}
                            </div>
                            <div>
                              <span className="font-semibold">
                                {isAm ? "ክልል:" : "Region:"}
                              </span>{" "}
                              {r.currentAddress?.regionName || "—"}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedRows((prev) => ({
                                ...prev,
                                [r.id]: {
                                  ...(prev[r.id] || {}),
                                  from: !prev[r.id]?.from,
                                },
                              }))
                            }
                            className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-800 underline"
                          >
                            {expandedRows[r.id]?.from
                              ? isAm
                                ? "ቀልጣፋ"
                                : "Collapse"
                              : isAm
                                ? "ዝርዝር"
                                : "Details"}
                          </button>
                        </div>
                      </td>
                      <td className="p-4 min-w-[240px] max-w-[280px] align-top">
                        <div className="rounded-2xl border border-green-100 bg-green-50 p-3">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-green-700">
                              {isAm ? "ወደ:" : "To:"}
                            </span>
                            <span className="text-xs text-green-600 font-semibold">
                              {r.requestedAddress?.houseNumber
                                ? `H-${r.requestedAddress.houseNumber.replace(/^H-|^H/, "")}`
                                : "—"}
                            </span>
                          </div>
                          <div
                            className={cn(
                              "text-xs leading-5 space-y-1 text-gray-700 overflow-hidden transition-[max-height] duration-200",
                              expandedRows[r.id]?.to
                                ? "max-h-96"
                                : "max-h-[4.5rem]",
                            )}
                          >
                            <div>
                              <span className="font-semibold">
                                {isAm ? "ሥ.ቦታ:" : "Sp.Loc.:"}
                              </span>{" "}
                              {r.requestedAddress?.specialLocation || "—"}
                            </div>
                            <div>
                              <span className="font-semibold">
                                {isAm ? "ቀበሌ:" : "Kebele:"}
                              </span>{" "}
                              {r.requestedAddress?.kebeleName || "—"}
                            </div>
                            <div>
                              <span className="font-semibold">
                                {isAm ? "ወሬዳ:" : "Woreda:"}
                              </span>{" "}
                              {r.requestedAddress?.woredaName || "—"}
                            </div>
                            <div>
                              <span className="font-semibold">
                                {isAm ? "ዞን:" : "Zone:"}
                              </span>{" "}
                              {r.requestedAddress?.zoneName || "—"}
                            </div>
                            <div>
                              <span className="font-semibold">
                                {isAm ? "ክልል:" : "Region:"}
                              </span>{" "}
                              {r.requestedAddress?.regionName || "—"}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedRows((prev) => ({
                                ...prev,
                                [r.id]: {
                                  ...(prev[r.id] || {}),
                                  to: !prev[r.id]?.to,
                                },
                              }))
                            }
                            className="mt-2 text-xs font-bold text-green-600 hover:text-green-800 underline"
                          >
                            {expandedRows[r.id]?.to
                              ? isAm
                                ? "ቀልጣፋ"
                                : "Collapse"
                              : isAm
                                ? "ዝርዝር"
                                : "Details"}
                          </button>
                        </div>
                      </td>
                      <td className="p-4 min-w-[180px] max-w-[220px] align-top">
                        <div className="relative">
                          <div
                            className={cn(
                              "text-sm text-gray-700 leading-5 overflow-hidden transition-[max-height] duration-200 break-words",
                              expandedRows[r.id]?.reason
                                ? "max-h-96"
                                : "max-h-[3.5rem]",
                            )}
                          >
                            {r.reason || "-"}
                          </div>
                          {r.reason && r.reason.length > 120 ? (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedRows((prev) => ({
                                  ...prev,
                                  [r.id]: {
                                    ...(prev[r.id] || {}),
                                    reason: !prev[r.id]?.reason,
                                  },
                                }))
                              }
                              className="mt-1 text-xs font-semibold text-[#003366] underline"
                            >
                              {expandedRows[r.id]?.reason
                                ? isAm
                                  ? "ቀልጣፋ አቆርጥ"
                                  : "Show less"
                                : isAm
                                  ? "ሙሉውን ይመልከቱ"
                                  : "Show more"}
                            </button>
                          ) : null}
                        </div>
                      </td>
                      <td className="p-4 min-w-[180px] max-w-[220px] align-top text-gray-400">
                        <div className="relative">
                          <div
                            className={cn(
                              "text-sm leading-5 overflow-hidden transition-[max-height] duration-200 break-words",
                              expandedRows[r.id]?.feedback
                                ? "max-h-96"
                                : "max-h-[3.5rem]",
                            )}
                          >
                            {r.adminFeedback || "-"}
                          </div>
                          {r.adminFeedback && r.adminFeedback.length > 120 ? (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedRows((prev) => ({
                                  ...prev,
                                  [r.id]: {
                                    ...(prev[r.id] || {}),
                                    feedback: !prev[r.id]?.feedback,
                                  },
                                }))
                              }
                              className="mt-1 text-xs font-semibold text-[#003366] underline"
                            >
                              {expandedRows[r.id]?.feedback
                                ? isAm
                                  ? "ቀልጣፋ አቆርጥ"
                                  : "Show less"
                                : isAm
                                  ? "ሙሉውን ይመልከቱ"
                                  : "Show more"}
                            </button>
                          ) : null}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full w-fit ${statusColors(r.status)}`}
                        >
                          {statusIcon(r.status)}
                          {r.status === "PENDING"
                            ? isAm
                              ? "በመጠባበቅ ላይ"
                              : "Pending"
                            : r.status === "APPROVED"
                              ? isAm
                                ? "ጸድቋል"
                                : "Approved"
                              : isAm
                                ? "ውድቅ"
                                : "Rejected"}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-gray-400">
                        {new Date(r.createdAt).toLocaleString()}
                      </td>
                    </motion.tr>
                  ))}
              </tbody>
            </table>
            {(!requests || requests.length === 0) && !historyLoading && (
              <div className="text-center py-12">
                <Search className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-400 font-medium">
                  {isAm ? "ምንም ጥያቄ የለም" : "No requests found"}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={submitRequest}
        title={isAm ? "የአድራሻ ለውጥ ጥያቄ ያረጋግጡ" : "Confirm Address Change Request"}
        message={
          isAm
            ? "እርግጠኛ ነዎት ይህን የአድራሻ ለውጥ ጥያቄ ለአስተዳዳሪ ማረጋገጫ ማስገባት ይፈልጋሉ?"
            : "Are you sure you want to submit this address change request for admin approval?"
        }
        type="default"
        isLoading={confirmLoading}
        isConfirmDisabled={!formData.kebeleId || confirmLoading}
      />
      <AutoDismissToast
        isOpen={toast.isOpen}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, isOpen: false })}
      />
    </motion.div>
  );
}
