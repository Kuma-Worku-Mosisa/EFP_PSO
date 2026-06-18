//frontend/src/pages/NewApplication.tsx
import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import {
  Info,
  CheckCircle2,
  FileText,
  Upload,
  Shield,
  Users,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Eye,
  RefreshCw,
  X,
  Trash2,
  ShieldCheck,
  Plus,
  Search,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { cn } from "../lib/utils";
import { mapLocalizedLocationRows } from "../lib/locationLabels";

import { apiRequest } from "../lib/api";
import { uploadOrganizationDocuments } from "../lib/fileUploadHelper";

// 1. Define a reusable schema for Personnel (Manager, Ops, Admin)
const personnelSchema = z.object({
  fullName: z.string().min(3, "Full name is required"),
  gender: z.string().min(1, "Gender is required"),
  citizenship: z.string().min(2, "Citizenship is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Invalid phone number"),
  faydaId: z.string().min(1, "Fayda ID is required"),
  otp: z.string().optional(),
  positionId: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined ? undefined : Number(val),
    z.number().optional(),
  ),
  educationLevel: z.string().optional(),
  workExpYears: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined ? undefined : Number(val),
    z.number().optional(),
  ),
  TotalExpYears: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined ? undefined : Number(val),
    z.number().optional(),
  ),
  region: z.string().min(1, "Region is required"),
  zone: z.string().min(1, "Zone is required"),
  woreda: z.string().min(1, "Woreda is required"),
  kebele: z.string().min(1, "Kebele is required"),
  houseNo: z.string().min(1, "House number is required"),
  specialLocation: z.string().optional(),
}).refine(
  (val) => {
    if (val.workExpYears === undefined || val.TotalExpYears === undefined) return true;
    return val.TotalExpYears >= val.workExpYears;
  },
  {
    path: ["TotalExpYears"],
    message: "Total experience years must be equal to or greater than work experience years",
  },
);

const branchAddressSchema = z.object({
  region: z.string().optional(),
  zone: z.string().optional(),
  woreda: z.string().optional(),
  kebeleId: z.string().min(1, "Branch kebele is required"),
  houseNumber: z.string().optional(),
  specialLocation: z.string().optional(),
});

export const applicationSchema = z
  .object({
    // Step 1: Agency Info
    agencyName: z.string().min(3, "Agency name is required"),
    agencyNameEnglish: z
      .string()
      .min(3, "Agency name (English) is required")
      .optional(),
    agencyNameAmharic: z
      .string()
      .min(3, "Agency name (Amharic) is required")
      .optional(),
    tradeName: z.string().min(4, "Trade name must be at least 4 characters"),
    branchAddresses: z.array(branchAddressSchema).optional().default([]),

    // Agency Location
    region: z.string().min(1, "Region is required"),
    zone: z.string().min(1, "Zone is required"),
    woreda: z.string().min(1, "Woreda is required"),
    kebele: z.string().min(1, "Kebele is required"),
    houseNumber: z.string().min(1, "House number is required"),
    specialLocation: z.string().optional(),

    // Contact Info
    agencyphone: z.string().min(10, "Invalid phone number"),
    faxNumber: z.string().optional(),
    email: z.string().email("Invalid email address"),
    tinNumber: z.string().min(2, "TIN number is required"),

    // Step 2: Documents

    // Step 3 & 4: Assets (Preprocessing strings to numbers for Prisma)
    officesCount: z.preprocess(
      (val) => Number(val),
      z.number().min(0, "Cannot be negative"),
    ),
    computersCount: z.preprocess(
      (val) => Number(val),
      z.number().min(0, "Cannot be negative"),
    ),
    vehiclesCount: z.preprocess(
      (val) => Number(val),
      z.number().min(0, "Cannot be negative"),
    ),
    hasStoreHouse: z.preprocess(
      (val) => val === true || val === "true",
      z.boolean().default(false),
    ),
    capitalAmount: z.preprocess(
      (val) => Number(val),
      z.number().min(0, "Cannot be negative"),
    ),

    // Step 4: Training
    trainingAddress: z.string().optional(),
    trainingProvider: z.string().optional(),
    trainingDays: z.preprocess(
      (val) =>
        val === "" || val === null || val === undefined
          ? undefined
          : Number(val),
      z.number().optional(),
    ),
    totalTraineesMale: z.preprocess(
      (val) =>
        val === "" || val === null || val === undefined
          ? undefined
          : Number(val),
      z.number().optional(),
    ),
    totalTraineesFemale: z.preprocess(
      (val) =>
        val === "" || val === null || val === undefined
          ? undefined
          : Number(val),
      z.number().optional(),
    ),
    totalMaleUntrained: z.preprocess(
      (val) =>
        val === "" || val === null || val === undefined
          ? undefined
          : Number(val),
      z.number().optional(),
    ),
    totalFemaleUntrained: z.preprocess(
      (val) =>
        val === "" || val === null || val === undefined
          ? undefined
          : Number(val),
      z.number().optional(),
    ),

    // Step 5: Personnel (Nested Objects)
    // These match the 'prefix' prop you passed to PersonnelSection
    manager: personnelSchema,
    ops: personnelSchema,
    admin: personnelSchema,
  })
  .refine(
    (val) => {
      const branches = val.branchAddresses || [];
      // If any branch addresses are present, each must have a kebeleId
      if (branches.length === 0) return true;
      return branches.every((b: any) => {
        const id = b?.kebeleId;
        return id !== undefined && id !== null && String(id).trim().length > 0;
      });
    },
    {
      path: ["branchAddresses"],
      message: "Each branch address must have a kebele selected",
    },
  );

export type ApplicationFormValues = z.infer<typeof applicationSchema>;

const ViewerModal = ({
  isOpen,
  onClose,
  file,
  previewUrl,
}: {
  isOpen: boolean;
  onClose: () => void;
  file: File | null;
  previewUrl: string | null;
}) => {
  const [rotation, setRotation] = React.useState(0);
  const [internalPreviewUrl, setInternalPreviewUrl] = React.useState<
    string | null
  >(null);

  React.useEffect(() => {
    if (!isOpen) setRotation(0);
  }, [isOpen]);

  React.useEffect(() => {
    // If caller didn't provide a previewUrl but we have a File, create one
    if (isOpen && file && !previewUrl) {
      try {
        const url = URL.createObjectURL(file);
        setInternalPreviewUrl(url);
        return () => {
          URL.revokeObjectURL(url);
          setInternalPreviewUrl(null);
        };
      } catch (e) {
        // ignore
      }
    }
    return;
  }, [isOpen, file, previewUrl]);

  if (!isOpen || !file) return null;

  const isImage = file.type?.startsWith?.("image/") ?? false;
  const isPDF = file.type === "application/pdf";
  const effectivePreviewUrl = previewUrl || internalPreviewUrl;

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-[32px] shadow-2xl w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b flex items-center justify-between bg-white z-10">
          <div className="flex items-center space-x-4">
            <div>
              <h3 className="font-bold text-primary">{file.name}</h3>
              <p className="text-xs text-gray-500 uppercase tracking-widest">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            {isImage && (
              <button
                onClick={handleRotate}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-bold text-primary transition-all ml-4"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Rotate</span>
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 md:p-8 bg-gray-100 flex items-center justify-center">
          {isImage && effectivePreviewUrl ? (
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              <img
                src={effectivePreviewUrl}
                alt="Preview"
                className="max-w-full max-h-full object-contain rounded-xl shadow-lg transition-transform duration-300"
                style={{ transform: `rotate(${rotation}deg)` }}
              />
            </div>
          ) : isPDF && effectivePreviewUrl ? (
            <iframe
              src={`${effectivePreviewUrl}#toolbar=0`}
              className="w-full h-full rounded-xl border-0 bg-white shadow-lg"
              title="PDF Preview"
            />
          ) : (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto">
                <FileText className="w-10 h-10 text-primary" />
              </div>
              <div>
                <p className="font-bold text-primary">Preview Not Available</p>
                <p className="text-sm text-gray-500">
                  This file type cannot be previewed directly. You can download
                  it to verify contents.
                </p>
              </div>
              <button
                onClick={() => window.open(previewUrl || "", "_blank")}
                className="px-6 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all"
              >
                Download File
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const FormInput = ({
  label,
  value,
  register,
  name,
  placeholder,
  type = "text",
  inputMode,
  error,
  required = true,
  disabled = false,
  isOpenedForEdit = false,
  onChange,
  min,
  onInput,
  infoText,
  infoTextAm,
}: {
  label: string;
  value?: string;
  register: any;
  name: string;
  placeholder?: string;
  type?: string;
  inputMode?: string;
  error?: any;
  required?: boolean;
  disabled?: boolean;
  isOpenedForEdit?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min?: number;
  onInput?: (e: React.FormEvent<HTMLInputElement>) => void;
  infoText?: string;
  infoTextAm?: string;
}) => {
  const { language } = useLanguage();
  const [showInfo, setShowInfo] = React.useState(false);
  const fiOpt = language === "am" ? "አማራጭ" : "Optional";
  const isFilled = value && value.length > 0;
  const autoPlaceholder = placeholder || (language === "am"
    ? type === "email"
      ? "ስም@ኢሜል.ኮም"
      : type === "number"
        ? "ቁጥር ያስገቡ"
        : type === "tel"
          ? "ስልክ ቁጥር ያስገቡ"
          : `ያስገቡ ${label.toLowerCase()}`
    : type === "email"
      ? "name@example.com"
      : type === "number"
        ? "Enter a number"
        : type === "tel"
          ? "Enter phone number"
          : `Enter ${label.toLowerCase()}`);

  return (
    <div className="space-y-2.5 relative group">
      <div className="flex justify-between items-center px-1">
        <label className={`${language === "am" ? "text-sm" : "text-[11px]"} font-black text-primary uppercase tracking-widest flex items-center space-x-1.5`}>
          <span>{label}</span>
          <span
            className={cn(
              "text-[9px] font-black rounded-md px-1.5 py-0.5",
              required
                ? "text-red-600 bg-red-50"
                : "text-amber-700 bg-amber-50",
            )}
          >
            {required ? "*" : fiOpt}
          </span>
        </label>
        {isFilled && !error && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center space-x-1.5 text-[10px] text-green-500 font-black uppercase tracking-widest"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
          </motion.div>
        )}
      </div>

      {infoText && (
        <div className="px-1">
          <button
            type="button"
            onClick={() => setShowInfo(!showInfo)}
            className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-amber-600 hover:text-amber-500 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <motion.span
              animate={{ rotate: showInfo ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-50 text-amber-600"
            >
              <Info className="w-3 h-3" />
            </motion.span>
            <span>{language === "am" ? "ተጨማሪ መረጃ" : "Learn more"}</span>
            <motion.span
              animate={{ rotate: showInfo ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="text-amber-400"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {showInfo && (
              <motion.div
                key="info"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="mt-2 p-3 bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200/70 rounded-xl shadow-sm">
                  <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
                    {language === "am" && infoTextAm ? infoTextAm : infoText}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="relative">
        <input
          {...(() => {
            const reg = register(name);
            if (onChange) {
              const origOnChange = reg.onChange;
              return {
                ...reg,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  onChange(e);
                  origOnChange(e);
                },
              };
            }
            return reg;
          })()}
          type={type}
          inputMode={inputMode ?? "text"}
          min={min}
          onInput={onInput}
          disabled={disabled && !isOpenedForEdit}
          className={cn(
            "w-full p-4 transition-all duration-300 outline-none border-2 text-primary font-bold shadow-sm",
            !isFilled
              ? "bg-gray-50/50 border-solid border-gray-200 hover:border-gray-300 focus:bg-white"
              : "bg-white border-solid border-green-200 shadow-green-500/5",
            error
              ? "border-red-300 ring-4 ring-red-50 bg-red-50/10"
              : "focus:border-primary focus:ring-4 focus:ring-primary/10",
            disabled && !isOpenedForEdit
              ? "bg-gray-100/80 border-gray-100 cursor-not-allowed opacity-75 grayscale"
              : "rounded-2xl",
            isOpenedForEdit &&
              "border-amber-400 ring-4 ring-amber-50 animate-pulse border-solid bg-amber-50/20",
          )}
          placeholder={autoPlaceholder}
        />
        {isOpenedForEdit && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2 text-amber-600 bg-white px-2 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tighter shadow-sm border border-amber-100">
            <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
            <span>Update Required</span>
          </div>
        )}
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] text-red-500 font-bold ml-2 uppercase tracking-wider flex items-center space-x-1"
        >
          <AlertCircle className="w-3 h-3" />
          <span>{error.message}</span>
        </motion.p>
      )}
    </div>
  );
};

type LocationOption = {
  id: number;
  name: string;
};

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
}: {
  label: string;
  placeholder: string;
  searchPlaceholder: string;
  value: string;
  options: LocationOption[];
  disabled?: boolean;
  onChange: (value: string) => void;
  onOpen?: () => void;
  onClear?: () => void;
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
    <div ref={containerRef} className="space-y-2 text-left relative">
      <label className={`${language === "am" ? "text-sm" : "text-[11px]"} font-black text-primary uppercase tracking-widest`}>
        {label}
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
          "w-full p-4 pr-12 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all relative",
          disabled
            ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-white border-gray-200 hover:border-primary focus:border-primary",
        )}
      >
        <span
          className={cn(
            "truncate",
            selectedOption ? "text-primary font-medium" : "text-gray-400",
          )}
        >
          {selectedOption?.name || placeholder}
        </span>
        <span className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400">
          {selectedOption ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onClear?.();
              }}
              className="p-1 rounded-full hover:bg-red-50 hover:text-red-600 transition-all"
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
        <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
          <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-3 bg-gray-50">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent outline-none text-sm text-primary placeholder:text-gray-400"
              autoFocus
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="shrink-0 p-1.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="max-h-56 overflow-auto p-2">
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
                    "w-full text-left px-3 py-3 rounded-xl text-sm transition-all",
                    String(option.id) === String(value)
                      ? "bg-primary text-white font-bold"
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

// --- Dynamic Location Data ---
type PositionOption = { id: number; name: string };

function useLocationData() {
  const [regions, setRegions] = React.useState<LocationOption[]>([]);
  const [zonesByRegion, setZonesByRegion] = React.useState<
    Record<string, LocationOption[]>
  >({});
  const [woredasByZone, setWoredasByZone] = React.useState<
    Record<string, LocationOption[]>
  >({});
  const [kebelesByWoreda, setKebelesByWoreda] = React.useState<
    Record<string, LocationOption[]>
  >({});
  const { language } = useLanguage();

  React.useEffect(() => {
    apiRequest<any>("/location/regions")
      .then((res) => {
        const mapped = mapLocalizedLocationRows(
          res.data || [],
          language,
        ) as LocationOption[];
        setRegions(mapped);
      })
      .catch(() => setRegions([]));
  }, [language]);

  const loadZones = async (regionId: string | number) => {
    if (!regionId) return;
    const key = String(regionId);
    if (zonesByRegion[key]) return;
    try {
      const res = await apiRequest<any>(`/location/regions/${regionId}/zones`);
      const mapped = mapLocalizedLocationRows(
        res.data || [],
        language,
      ) as LocationOption[];
      setZonesByRegion((prev) => ({ ...prev, [key]: mapped }));
    } catch (e) {
      /* ignore */
    }
  };

  const loadWoredas = async (zoneId: string | number) => {
    if (!zoneId) return;
    const key = String(zoneId);
    if (woredasByZone[key]) return;
    try {
      const res = await apiRequest<any>(`/location/zones/${zoneId}/woredas`);
      const mapped = mapLocalizedLocationRows(
        res.data || [],
        language,
      ) as LocationOption[];
      setWoredasByZone((prev) => ({ ...prev, [key]: mapped }));
    } catch (e) {
      /* ignore */
    }
  };

  const loadKebeles = async (woredaId: string | number) => {
    if (!woredaId) return;
    const key = String(woredaId);
    if (kebelesByWoreda[key]) return;
    try {
      const res = await apiRequest<any>(
        `/location/woredas/${woredaId}/kebeles`,
      );
      const mapped = mapLocalizedLocationRows(
        res.data || [],
        language,
      ) as LocationOption[];
      setKebelesByWoreda((prev) => ({ ...prev, [key]: mapped }));
    } catch (e) {
      /* ignore */
    }
  };

  return {
    regions,
    zonesByRegion,
    woredasByZone,
    kebelesByWoreda,
    loadZones,
    loadWoredas,
    loadKebeles,
    // backward-compatible flat arrays (used by review section)
    get zones() {
      return Object.values(zonesByRegion).flat();
    },
    get woredas() {
      return Object.values(woredasByZone).flat();
    },
    get kebeles() {
      return Object.values(kebelesByWoreda).flat();
    },
    setRegionId: loadZones,
    setZoneId: loadWoredas,
    setWoredaId: loadKebeles,
  };
}

const FormSelect = ({
  label,
  options,
  register,
  name,
  error,
  required = true,
  disabled = false,
  onChange,
  value,
  placeholder = "Select...",
}: {
  label: string;
  options: { value: string | number; label: string }[];
  register: any;
  name: string;
  error?: any;
  required?: boolean;
  disabled?: boolean;
  onChange?: (value: string | number) => void;
  value?: string | number;
  placeholder?: string;
}) => {
  const { language } = useLanguage();
  const fsOpt = language === "am" ? "አማራጭ" : "Optional";
  const computedPlaceholder = required
    ? placeholder
    : `${placeholder} (${language === "am" ? "አማራጭ" : "optional"})`;

  // Obtain register helpers once to support controlled selects
  const reg = register ? register(name) : undefined;

  return (
    <div className="space-y-2.5 relative group">
      <div className="flex justify-between items-center px-1">
        <label className={`${language === "am" ? "text-sm" : "text-[11px]"} font-black text-primary uppercase tracking-widest flex items-center space-x-1.5`}>
          <span>{label}</span>
          <span
            className={cn(
              "text-[9px] font-black rounded-md px-1.5 py-0.5",
              required
                ? "text-red-600 bg-red-50"
                : "text-amber-700 bg-amber-50",
            )}
          >
            {required ? "*" : fsOpt}
          </span>
        </label>
      </div>
      <div className="relative">
        <select
          name={name}
          ref={reg?.ref}
          value={value ?? ""}
          onChange={(e) => {
            // update react-hook-form state first
            reg?.onChange?.(e as any);
            // then call the local onChange callback with normalized value
            onChange?.(e.target.value);
          }}
          disabled={disabled}
          className={cn(
            "w-full p-4 transition-all duration-300 outline-none border-2 text-primary font-bold shadow-sm bg-gray-50/50 rounded-2xl appearance-none text-sm",
            error
              ? "border-red-300 ring-4 ring-red-50 bg-red-50/10"
              : "focus:border-primary focus:ring-4 focus:ring-primary/10 border-solid border-gray-200 hover:border-gray-300",
            disabled
              ? "bg-gray-100/80 border-gray-100 cursor-not-allowed opacity-75 grayscale"
              : "bg-white",
          )}
        >
          <option value="">{computedPlaceholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <ArrowRight className="w-4 h-4 rotate-90" />
        </div>
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] text-red-500 font-bold ml-2 uppercase tracking-wider flex items-center space-x-1"
        >
          <AlertCircle className="w-3 h-3" />
          <span>{error.message}</span>
        </motion.p>
      )}
    </div>
  );
};

const uploadLbl = (lang: string) => {
  const m: Record<string, Record<string, string>> = {
    en: {
      uploaded: "Uploaded",
      selectFile: "Select File",
      optional: "Optional",
      docHint: "PDF Max 5MB",
      photoHint: "JPG, PNG Max 2MB",
    },
    am: {
      uploaded: "ተሰቅሏል",
      selectFile: "ፋይል ይምረጡ",
      optional: "አማራጭ",
      docHint: "ፒዲኤፍ ከፍተኛ 5ሜባ",
      photoHint: "ጄፒጂ፣ ፒኤንጂ ከፍተኛ 2ሜባ",
    },
  };
  return m[lang] || m.en;
};

const FileUpload = ({
  label,
  type = "document",
  required = true,
  file,
  onUpload,
  onDelete,
  onView,
  disabled = false,
  isOpenedForEdit = false,
  infoText,
  infoTextAm,
}: {
  label: string;
  type?: "document" | "photo";
  required?: boolean;
  file?: File | null;
  onUpload: (file: File) => void;
  onDelete: () => void;
  onView: (file: File, url: string | null) => void;
  disabled?: boolean;
  isOpenedForEdit?: boolean;
  infoText?: string;
  infoTextAm?: string;
}) => {
  const { language } = useLanguage();
  const lbl = uploadLbl(language);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [showInfo, setShowInfo] = React.useState(false);

  React.useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  const isDisabled = disabled && !isOpenedForEdit;

  return (
    <div
      className={cn(
        "group relative rounded-[28px] border-2 transition-all duration-500 p-4 sm:p-5",
        file
          ? "bg-white border-solid border-green-200 shadow-lg shadow-green-500/5 ring-4 ring-green-50/30"
          : "bg-gray-50/50 border-dashed border-gray-200 hover:border-primary/40 hover:bg-white cursor-pointer hover:shadow-xl",
        isOpenedForEdit &&
          "border-amber-400 bg-amber-50/20 ring-4 ring-amber-50 animate-pulse border-dashed",
      )}
    >
      {infoText && (
        <div className="px-1 mb-3">
          <button
            type="button"
            onClick={() => setShowInfo(!showInfo)}
            className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-amber-600 hover:text-amber-500 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <motion.span
              animate={{ rotate: showInfo ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-50 text-amber-600"
            >
              <Info className="w-3 h-3" />
            </motion.span>
            <span>{language === "am" ? "ተጨማሪ መረጃ" : "Learn more"}</span>
            <motion.span
              animate={{ rotate: showInfo ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="text-amber-400"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {showInfo && (
              <motion.div
                key="info"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="mt-2 p-3 bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200/70 rounded-xl shadow-sm">
                  <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
                    {language === "am" && infoTextAm ? infoTextAm : infoText}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {file && (
        <div className="absolute -top-3 -right-3 z-10">
          <div className="flex items-center space-x-1.5 bg-green-500 text-white px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-xl shadow-green-500/30 border-2 border-white animate-in zoom-in">
            <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>{lbl.uploaded}</span>
          </div>
        </div>
      )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          disabled={isDisabled}
          accept={type === "photo" ? "image/*" : ".pdf"}
        />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
          <div
            className={cn(
              "w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-500 flex-shrink-0 shadow-sm",
              file
                ? "bg-green-50 text-green-500"
                : "bg-white border text-gray-400 group-hover:scale-105 group-hover:text-primary group-hover:shadow-lg",
            )}
          >
            {isOpenedForEdit ? (
              <RefreshCw className="w-6 h-6 sm:w-7 sm:h-7 animate-spin-slow text-amber-500" />
            ) : file ? (
              <FileText className="w-6 h-6 sm:w-7 sm:h-7" />
            ) : type === "photo" ? (
              <Users className="w-6 h-6 sm:w-7 sm:h-7" />
            ) : (
              <Upload className="w-6 h-6 sm:w-7 sm:h-7" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4
              className={cn(
                "font-black text-xs sm:text-sm tracking-tight break-words leading-snug w-full",
                file
                  ? "text-green-600"
                  : "text-primary/70 group-hover:text-primary",
              )}
            >
              {file ? file.name : label}
            </h4>
            {!required && !file && (
              <span className="text-[9px] text-amber-700 bg-amber-50 font-black rounded-md px-1.5 py-0.5 uppercase tracking-widest">
                {lbl.optional}
              </span>
            )}
            <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mt-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                {file
                  ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                  : type === "photo"
                    ? lbl.photoHint
                    : lbl.docHint}
              </span>
              {required && !file && (
                <span className="text-[10px] text-amber-500 font-black uppercase tracking-widest bg-amber-50 px-1.5 rounded-md">
                  *
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2 flex-shrink-0">
          {!file || isOpenedForEdit ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isDisabled}
              className="px-5 py-2.5 sm:px-6 sm:py-3 bg-white border-2 border-gray-100 text-primary rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:border-primary hover:shadow-lg transition-all active:scale-95 whitespace-nowrap"
            >
              {lbl.selectFile}
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => onView(file, previewUrl)}
                className="p-2.5 sm:p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
              >
                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                type="button"
                onClick={() => onDelete()}
                className="p-2.5 sm:p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function LocationFields({
  register,
  errors,
  watch,
  isFormLocked,
  openedFields,
  setValue,
  curT,
  isAm,
}: any) {
  const {
    regions,
    zonesByRegion,
    woredasByZone,
    kebelesByWoreda,
    loadZones,
    loadWoredas,
    loadKebeles,
  } = useLocationData();

  const selectedRegion = watch("region");
  const selectedZone = watch("zone");
  const selectedWoreda = watch("woreda");
  const selectedKebele = watch("kebele");

  return (
    <div className="w-full grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <SearchableLocationSelect
        label={curT?.region || "Region"}
        placeholder={isAm ? "ክልል ምረጥ" : "Select Region"}
        searchPlaceholder={isAm ? "ክልል ፈልግ" : "Search region"}
        value={selectedRegion}
        options={regions}
        onChange={(val) => {
          setValue?.("region", val);
          setValue?.("zone", "");
          setValue?.("woreda", "");
          setValue?.("kebele", "");
          if (val) loadZones(val);
        }}
        onClear={() => {
          setValue?.("region", "");
          setValue?.("zone", "");
          setValue?.("woreda", "");
          setValue?.("kebele", "");
        }}
      />
      <SearchableLocationSelect
        label={`${curT?.zone || "Zone"} / ${isAm ? "ክፍለ ከተማ" : "Subcity"}`}
        placeholder={isAm ? "ዞን/ክፍለ ከተማ ምረጥ" : "Select Zone / Subcity"}
        searchPlaceholder={isAm ? "ዞን ፈልግ" : "Search zone"}
        value={selectedZone}
        options={zonesByRegion[String(selectedRegion)] || []}
        disabled={!selectedRegion}
        onChange={(val) => {
          setValue?.("zone", val);
          setValue?.("woreda", "");
          setValue?.("kebele", "");
          if (val) loadWoredas(val);
        }}
        onClear={() => {
          setValue?.("zone", "");
          setValue?.("woreda", "");
          setValue?.("kebele", "");
        }}
        onOpen={() => {
          if (selectedRegion) loadZones(selectedRegion);
        }}
      />
      <SearchableLocationSelect
        label={curT?.woreda || "Woreda"}
        placeholder={isAm ? "ወረዳ ምረጥ" : "Select Woreda"}
        searchPlaceholder={isAm ? "ወረዳ ፈልግ" : "Search woreda"}
        value={selectedWoreda}
        options={woredasByZone[String(selectedZone)] || []}
        disabled={!selectedZone}
        onChange={(val) => {
          setValue?.("woreda", val);
          setValue?.("kebele", "");
          if (val) loadKebeles(val);
        }}
        onClear={() => {
          setValue?.("woreda", "");
          setValue?.("kebele", "");
        }}
        onOpen={() => {
          if (selectedZone) loadWoredas(selectedZone);
        }}
      />
      <SearchableLocationSelect
        label={curT?.kebele || "Kebele"}
        placeholder={isAm ? "ቀበሌ ምረጥ" : "Select Kebele"}
        searchPlaceholder={isAm ? "ቀበሌ ፈልግ" : "Search kebele"}
        value={selectedKebele}
        options={kebelesByWoreda[String(selectedWoreda)] || []}
        disabled={!selectedWoreda}
        onChange={(val) => setValue?.("kebele", val)}
        onClear={() => setValue?.("kebele", "")}
        onOpen={() => {
          if (selectedWoreda) loadKebeles(selectedWoreda);
        }}
      />
      <FormInput
        label={curT?.houseNo || "House No"}
        name="houseNumber"
        type="text"
        register={register}
        value={watch("houseNumber")}
        error={errors.houseNumber}
        disabled={isFormLocked}
        isOpenedForEdit={openedFields?.includes("houseNumber")}
      />
    </div>
  );
}

function BranchAddressRow({
  index,
  register,
  errors,
  watch,
  setValue,
  onRemove,
  isFormLocked,
  isRequired = false,
  isAm,
}: any) {
  const {
    regions,
    zonesByRegion,
    woredasByZone,
    kebelesByWoreda,
    loadZones,
    loadWoredas,
    loadKebeles,
  } = useLocationData();

  const selectedRegion = watch(`branchAddresses.${index}.region`);
  const selectedZone = watch(`branchAddresses.${index}.zone`);
  const selectedWoreda = watch(`branchAddresses.${index}.woreda`);
  const selectedKebeleId = watch(`branchAddresses.${index}.kebeleId`);

  const branchErrors = errors?.branchAddresses?.[index] || {};

  return (
    <div className="space-y-4 rounded-[28px] border border-dashed border-gray-200 p-5 bg-gray-50/50">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest">
          {isAm ? `የቅርንጫፍ አድራሻ #${index + 1}` : `Branch Address #${index + 1}`}
        </p>
        <button
          type="button"
          onClick={onRemove}
          disabled={isFormLocked}
          className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{isAm ? "አስወግድ" : "Remove"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SearchableLocationSelect
          label={isAm ? "ክልል" : "Region"}
          placeholder={isAm ? "ክልል ምረጥ" : "Select Region"}
          searchPlaceholder={isAm ? "ክልል ፈልግ" : "Search region"}
          value={selectedRegion}
          options={regions}
          onChange={(val) => {
            setValue(`branchAddresses.${index}.region`, val);
            setValue(`branchAddresses.${index}.zone`, "");
            setValue(`branchAddresses.${index}.woreda`, "");
            setValue(`branchAddresses.${index}.kebeleId`, "");
            if (val) loadZones(val);
          }}
          onClear={() => {
            setValue(`branchAddresses.${index}.region`, "");
            setValue(`branchAddresses.${index}.zone`, "");
            setValue(`branchAddresses.${index}.woreda`, "");
            setValue(`branchAddresses.${index}.kebeleId`, "");
          }}
        />
        <SearchableLocationSelect
          label={`Zone / ${isAm ? "ክፍለ ከተማ" : "Subcity"}`}
          placeholder={isAm ? "ዞን/ክፍለ ከተማ ምረጥ" : "Select Zone / Subcity"}
          searchPlaceholder={isAm ? "ዞን ፈልግ" : "Search zone"}
          value={selectedZone}
          options={zonesByRegion[String(selectedRegion)] || []}
          disabled={!selectedRegion}
          onChange={(val) => {
            setValue(`branchAddresses.${index}.zone`, val);
            setValue(`branchAddresses.${index}.woreda`, "");
            setValue(`branchAddresses.${index}.kebeleId`, "");
            if (val) loadWoredas(val);
          }}
          onClear={() => {
            setValue(`branchAddresses.${index}.zone`, "");
            setValue(`branchAddresses.${index}.woreda`, "");
            setValue(`branchAddresses.${index}.kebeleId`, "");
          }}
          onOpen={() => {
            if (selectedRegion) loadZones(selectedRegion);
          }}
        />
        <SearchableLocationSelect
          label={isAm ? "ወረዳ" : "Woreda"}
          placeholder={isAm ? "ወረዳ ምረጥ" : "Select Woreda"}
          searchPlaceholder={isAm ? "ወረዳ ፈልግ" : "Search woreda"}
          value={selectedWoreda}
          options={woredasByZone[String(selectedZone)] || []}
          disabled={!selectedZone}
          onChange={(val) => {
            setValue(`branchAddresses.${index}.woreda`, val);
            setValue(`branchAddresses.${index}.kebeleId`, "");
            if (val) loadKebeles(val);
          }}
          onClear={() => {
            setValue(`branchAddresses.${index}.woreda`, "");
            setValue(`branchAddresses.${index}.kebeleId`, "");
          }}
          onOpen={() => {
            if (selectedZone) loadWoredas(selectedZone);
          }}
        />
        <SearchableLocationSelect
          label={isAm ? "ቀበሌ" : "Kebele"}
          placeholder={isAm ? "ቀበሌ ምረጥ" : "Select Kebele"}
          searchPlaceholder={isAm ? "ቀበሌ ፈልግ" : "Search kebele"}
          value={selectedKebeleId}
          options={kebelesByWoreda[String(selectedWoreda)] || []}
          disabled={!selectedWoreda}
          onChange={(val) => setValue(`branchAddresses.${index}.kebeleId`, val)}
          onClear={() => setValue(`branchAddresses.${index}.kebeleId`, "")}
          onOpen={() => {
            if (selectedWoreda) loadKebeles(selectedWoreda);
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label={isAm ? (isRequired ? "የቤት ቁጥር" : "የቤት ቁጥር (አማራጭ)") : (isRequired ? "House No." : "House No. (Optional)")}
          name={`branchAddresses.${index}.houseNumber`}
          register={register}
          value={watch(`branchAddresses.${index}.houseNumber`) || ""}
          error={branchErrors.houseNumber}
          required={isRequired}
          disabled={isFormLocked}
        />
        <FormInput
          label={isAm ? "ልዩ ቦታ (አማራጭ)" : "Special Location (Optional)"}
          name={`branchAddresses.${index}.specialLocation`}
          register={register}
          value={watch(`branchAddresses.${index}.specialLocation`) || ""}
          error={branchErrors.specialLocation}
          required={false}
          disabled={isFormLocked}
        />
      </div>
    </div>
  );
}

const PersonnelSection = ({
  title,
  prefix,
  currentUser,
  files,
  onUpload,
  onDelete,
  onView,
  curT,
  register,
  errors,
  isFormLocked,
  positions,
  positionEducationOptions,
  onPositionChange,
  watch,
  setValue,
  openedFields,
  isAm,
}: {
  title: string;
  prefix: string;
  currentUser?: {
    fullName?: string;
    email?: string;
    phone?: string;
    faydaId?: string;
  } | null;
  files: Record<string, File | null>;
  onUpload: (key: string, file: File) => void;
  onDelete: (key: string) => void;
  onView: (file: File, url: string | null) => void;
  curT: any;
  register: any;
  errors: any;
  isFormLocked?: boolean;
  positions: PositionOption[];
  positionEducationOptions?: Record<number, string[]>;
  onPositionChange?: (positionId: number) => void;
  setValue?: any;
  watch?: any;
  openedFields?: string[];
  isAm?: boolean;
}) => {
  const isManagerSection = prefix === "manager";
  const correctionOpenedFields = openedFields || [];
  const workExpVal = watch?.(`${prefix}.workExpYears`);
  const hasWorkExp = !!workExpVal && String(workExpVal).trim().length > 0;
  const personnelDocs = [
    {
      label: curT.fingerprintDoc,
      key: "fingerprint_doc",
      required: true,
      infoText: "Fingerprint from the police (proof of criminal record)",
      infoTextAm: "የጣት አሻራ ከፖሊስ (የወንጀል ሪከርድ ማረጋገጫ)",
    },
    {
      label: curT.medicalDoc,
      key: "medical_doc",
      required: true,
      infoText: "Bring your medical test outcome from a hospital or clinic",
      infoTextAm: "የህክምና ምርመራ ውጤትዎን ከሆስፒታል ወይም ክሊኒክ ያስገቡ",
    },
    { label: curT.trainingDoc, key: "training_doc", required: false },
    { label: curT.supportDoc, key: "support_doc", required: false },
    { label: curT.collateralDoc, key: "collateral_doc", required: true },
    { label: curT.experienceDoc, key: "experience_doc", required: hasWorkExp },
    {
      label: curT.resignationDoc,
      key: "resignation_letter_doc",
      required: hasWorkExp,
    },
    { label: curT.educationDoc, key: "education_doc", required: true },
    {
      label: curT.nationalIdDoc,
      key: "national_id_doc",
      required: true,
      infoText:
        "Upload a photo of your National ID or Digital Fayda ID front and back as a PDF",
      infoTextAm:
        "የብሔራዊ መታወቂያዎን ወይም የዲጂታል ፋይዳ መታወቂያዎን ፊት እና ጀርባ እንደ ፒዲኤፍ ያስገቡ",
    },
    { label: curT.kebeleIdDoc, key: "passport_or_kabele_doc", required: true },
    { label: curT.orgIdDoc, key: "organization_Id_doc", required: true },
  ];

  const {
    regions,
    zonesByRegion,
    woredasByZone,
    kebelesByWoreda,
    loadZones,
    loadWoredas,
    loadKebeles,
  } = useLocationData();

  const selectedRegion = watch?.(`${prefix}.region`);
  const selectedZone = watch?.(`${prefix}.zone`);
  const selectedWoreda = watch?.(`${prefix}.woreda`);
  const selectedKebele = watch?.(`${prefix}.kebele`);
  const selectedPositionId = Number(watch?.(`${prefix}.positionId`));
  const selectedEducationLevel = watch?.(`${prefix}.educationLevel`);

  React.useEffect(() => {
    setValue?.(`${prefix}.citizenship`, "ETHIOPIAN");
  }, [prefix, setValue]);

  React.useEffect(() => {
    if (!isManagerSection || !currentUser || !setValue) {
      return;
    }

    setValue(`${prefix}.fullName`, currentUser.fullName ?? "", {
      shouldDirty: false,
      shouldTouch: false,
    });
    setValue(`${prefix}.email`, currentUser.email ?? "", {
      shouldDirty: false,
      shouldTouch: false,
    });
    setValue(`${prefix}.phone`, currentUser.phone ?? "", {
      shouldDirty: false,
      shouldTouch: false,
    });
    setValue(`${prefix}.faydaId`, currentUser.faydaId ?? "", {
      shouldDirty: false,
      shouldTouch: false,
    });
  }, [currentUser, isManagerSection, prefix, setValue]);

  React.useEffect(() => {
    if (!selectedPositionId || Number.isNaN(selectedPositionId)) {
      setValue?.(`${prefix}.educationLevel`, "", {
        shouldDirty: false,
        shouldTouch: false,
      });
    }
  }, [prefix, selectedPositionId, setValue]);

  // Helper to get nested error messages safely
  const getError = (fieldName: string) => {
    return errors[prefix]?.[fieldName]?.message;
  };

  const personnelErrors = (errors?.[prefix] || {}) as any;

  return (
    <div className="space-y-6 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm transition-all hover:shadow-md">
      {/* Section Header */}
      <div className="flex items-center space-x-4 border-b border-gray-50 pb-5">
        <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-xl font-black text-primary uppercase tracking-tight">
            {title}
          </h4>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
            {curT.personnelTitle}
          </p>
        </div>
      </div>

      {/* Basic Info Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput
          label={curT.fullName}
          name={`${prefix}.fullName`}
          value={watch?.(`${prefix}.fullName`)}
          register={register}
          error={errors[prefix]?.fullName}
          disabled={isFormLocked || isManagerSection}
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2.5">
            <label className={`${isAm ? "text-sm" : "text-[11px]"} font-black text-primary uppercase tracking-widest px-1 flex items-center space-x-1.5`}>
              <span>{curT.gender}</span>
              <span className="text-[9px] font-black rounded-md px-1.5 py-0.5 text-red-600 bg-red-50">
                *
              </span>
            </label>
            <div className="relative">
              <select
                {...register(`${prefix}.gender`)}
                disabled={isFormLocked}
                className={cn(
                  "w-full appearance-none p-4 pl-12 pr-12 bg-gray-50/50 border-2 border-solid border-gray-200 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-primary text-sm",
                  isFormLocked && "opacity-75 grayscale cursor-not-allowed",
                )}
              >
                <option value="">{curT.genderOption}</option>
                <option value="Male">{curT.male}</option>
                <option value="Female">{curT.female}</option>
              </select>
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-xl bg-primary/5 text-primary">
                <Users className="h-4 w-4" />
              </div>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-xl bg-white text-gray-400 shadow-sm ring-1 ring-gray-100">
                <ArrowRight className="h-4 w-4 rotate-90" />
              </div>
            </div>
          </div>
          <FormInput
            label={curT.citizenship}
            name={`${prefix}.citizenship`}
            register={register}
            value={watch?.(`${prefix}.citizenship`) || curT.ethiopian}
            error={errors[prefix]?.citizenship}
            disabled={true}
          />
        </div>
      </div>

      {/* Identity & Contact Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-gray-50 pt-6">
        <div className="md:col-span-1 space-y-2.5">
          <label className={`${isAm ? "text-sm" : "text-[11px]"} font-black text-primary uppercase tracking-widest px-1`}>
            {curT.faydaId || "Fayda ID & OTP"}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              maxLength={16}
              {...(() => {
                const reg = register(`${prefix}.faydaId`);
                const origOnChange = reg.onChange;
                return {
                  ...reg,
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                    e.target.value = e.target.value.replace(/\D/g, "");
                    origOnChange(e);
                  },
                };
              })()}
              disabled={isFormLocked || isManagerSection}
              placeholder="FAYDA-XXXXX"
              className="flex-1 p-4 bg-white border-2 border-gray-100 rounded-2xl outline-none focus:border-primary text-sm font-bold text-primary shadow-sm"
            />
            <div className="flex items-center space-x-2 px-3 bg-primary/5 rounded-2xl border border-primary/10 w-32">
              <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
              <input
                type="text"
                {...register(`${prefix}.otp`)}
                disabled={isFormLocked || isManagerSection}
                placeholder={curT.otp || "OTP"}
                className="w-full bg-transparent border-none outline-none text-[10px] font-black text-primary placeholder:text-primary/40"
              />
            </div>
          </div>
          {getError("faydaId") && (
            <p className="text-[10px] text-red-500 font-bold uppercase ml-2">
              {getError("faydaId")}
            </p>
          )}
        </div>

        <FormInput
          label={curT.email || "Email"}
          name={`${prefix}.email`}
          value={watch?.(`${prefix}.email`)}
          type="email"
          register={register}
          placeholder="email@example.com"
          error={errors[prefix]?.email}
          disabled={isFormLocked || isManagerSection}
        />
        <FormInput
          label={curT.phone || "Phone Number"}
          name={`${prefix}.phone`}
          type="tel"
          register={register}
          value={watch?.(`${prefix}.phone`)}
          error={errors[prefix]?.phone}
          disabled={isFormLocked || isManagerSection}
          onChange={(e) => {
            let raw = e.target.value;
            if (!raw.startsWith("+251")) raw = "+251";
            const digits = raw.slice(4).replace(/\D/g, "");
            e.target.value = `+251${digits}`;
          }}
        />
      </div>

      {/* Position & Experience */}
      <div className="bg-gray-50/60 p-5 rounded-[28px] border border-dashed border-gray-200 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect
            label={curT.position}
            name={`${prefix}.positionId`}
            register={register}
            value={watch?.(`${prefix}.positionId`)}
            options={positions.map((position) => ({
              value: position.id,
              label: position.name,
            }))}
            onChange={(val) => {
              const nextPositionId = Number(val);
              setValue?.(`${prefix}.positionId`, val);
              setValue?.(`${prefix}.educationLevel`, "", {
                shouldDirty: false,
                shouldTouch: false,
              });

              if (Number.isFinite(nextPositionId) && nextPositionId > 0) {
                onPositionChange?.(nextPositionId);
              }
            }}
            required={false}
            disabled={isFormLocked}
            placeholder={curT.selectPosition}
          />

          <FormSelect
            label={curT.educationLevel}
            name={`${prefix}.educationLevel`}
            register={register}
            value={watch?.(`${prefix}.educationLevel`)}
            options={(() => {
              const pid = selectedPositionId;
              const fromPosition =
                pid && typeof positionEducationOptions !== "undefined"
                  ? positionEducationOptions[pid] || []
                  : [];
              const uniqueLevels = new Set(fromPosition);

              if (
                selectedEducationLevel &&
                !uniqueLevels.has(String(selectedEducationLevel))
              ) {
                uniqueLevels.add(String(selectedEducationLevel));
              }

              return Array.from(uniqueLevels).map((level) => ({
                value: level,
                label: level,
              }));
            })()}
            onChange={(val) => setValue?.(`${prefix}.educationLevel`, val)}
            required={false}
            disabled={isFormLocked || !selectedPositionId}
            placeholder={
              selectedPositionId
                ? curT.selectEducationLevel
                : curT.selectPositionFirst
            }
          />

          <FormInput
            label={curT.workExpYears}
            name={`${prefix}.workExpYears`}
            type="number"
            register={register}
            value={watch?.(`${prefix}.workExpYears`)}
            error={personnelErrors.workExpYears}
            required={false}
            disabled={isFormLocked}
            min={0}
            onInput={(e) => {
              const el = e.target as HTMLInputElement;
              const val = parseInt(el.value, 10);
              if (el.value !== "" && (isNaN(val) || val < 0)) el.value = "";
            }}
            infoText="Enter your work experience years relevant to your current position."
            infoTextAm="አሁን ባሉበት ቦታ ያገለገሉትን የስራ ልምድ ዓመታት ያስገቡ።"
          />

          <FormInput
            label={curT.totalExpYears}
            name={`${prefix}.TotalExpYears`}
            type="number"
            register={register}
            value={watch?.(`${prefix}.TotalExpYears`)}
            error={personnelErrors.TotalExpYears}
            required={false}
            disabled={isFormLocked}
            min={0}
            onInput={(e) => {
              const el = e.target as HTMLInputElement;
              const val = parseInt(el.value, 10);
              if (el.value !== "" && (isNaN(val) || val < 0)) el.value = "";
            }}
            infoText="Enter your total experience years across Police, Defence force, or other work areas."
            infoTextAm="በፖሊስ፣ በመከላከያ ሠራዊት ወይም በሌሎች የስራ ዘርፎች ያለዎትን ጠቅላላ የልምድ ዓመታት ያስገቡ።"
          />
        </div>
      </div>

      {/* Location Section */}
      <div className="bg-gray-50/50 p-6 rounded-[32px] border-2 border-dashed border-gray-200 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SearchableLocationSelect
            label={curT?.region || "Region"}
            placeholder={isAm ? "ክልል ምረጥ" : "Select Region"}
            searchPlaceholder={isAm ? "ክልል ፈልግ" : "Search region"}
            value={selectedRegion}
            options={regions}
            onChange={(val) => {
              setValue?.(`${prefix}.region`, val);
              setValue?.(`${prefix}.zone`, "");
              setValue?.(`${prefix}.woreda`, "");
              setValue?.(`${prefix}.kebele`, "");
              if (val) loadZones(val);
            }}
            onClear={() => {
              setValue?.(`${prefix}.region`, "");
              setValue?.(`${prefix}.zone`, "");
              setValue?.(`${prefix}.woreda`, "");
              setValue?.(`${prefix}.kebele`, "");
            }}
          />
          <SearchableLocationSelect
            label={`${curT?.zone || "Zone"} / ${isAm ? "ክፍለ ከተማ" : "Subcity"}`}
            placeholder={isAm ? "ዞን/ክፍለ ከተማ ምረጥ" : "Select Zone / Subcity"}
            searchPlaceholder={isAm ? "ዞን ፈልግ" : "Search zone"}
            value={selectedZone}
            options={zonesByRegion[String(selectedRegion)] || []}
            disabled={!selectedRegion}
            onChange={(val) => {
              setValue?.(`${prefix}.zone`, val);
              setValue?.(`${prefix}.woreda`, "");
              setValue?.(`${prefix}.kebele`, "");
              if (val) loadWoredas(val);
            }}
            onClear={() => {
              setValue?.(`${prefix}.zone`, "");
              setValue?.(`${prefix}.woreda`, "");
              setValue?.(`${prefix}.kebele`, "");
            }}
            onOpen={() => {
              if (selectedRegion) loadZones(selectedRegion);
            }}
          />
          <SearchableLocationSelect
            label={curT?.woreda || "Woreda"}
            placeholder={isAm ? "ወረዳ ምረጥ" : "Select Woreda"}
            searchPlaceholder={isAm ? "ወረዳ ፈልግ" : "Search woreda"}
            value={selectedWoreda}
            options={woredasByZone[String(selectedZone)] || []}
            disabled={!selectedZone}
            onChange={(val) => {
              setValue?.(`${prefix}.woreda`, val);
              setValue?.(`${prefix}.kebele`, "");
              if (val) loadKebeles(val);
            }}
            onClear={() => {
              setValue?.(`${prefix}.woreda`, "");
              setValue?.(`${prefix}.kebele`, "");
            }}
            onOpen={() => {
              if (selectedZone) loadWoredas(selectedZone);
            }}
          />
          <SearchableLocationSelect
            label={curT?.kebele || "Kebele"}
            placeholder={isAm ? "ቀበሌ ምረጥ" : "Select Kebele"}
            searchPlaceholder={isAm ? "ቀበሌ ፈልግ" : "Search kebele"}
            value={selectedKebele}
            options={kebelesByWoreda[String(selectedWoreda)] || []}
            disabled={!selectedWoreda}
            onChange={(val) => setValue?.(`${prefix}.kebele`, val)}
            onClear={() => setValue?.(`${prefix}.kebele`, "")}
            onOpen={() => {
              if (selectedWoreda) loadKebeles(selectedWoreda);
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label={curT.houseNo || "House No"}
            name={`${prefix}.houseNo`}
            register={register}
            error={errors[prefix]?.houseNo}
            disabled={isFormLocked}
          />
          <FormInput
            label={curT.specialLocation || "Special Location"}
            name={`${prefix}.specialLocation`}
            register={register}
            value={watch("specialLocation")}
            error={errors[prefix]?.specialLocation}
            required={false}
            disabled={isFormLocked}
          />
        </div>
      </div>

      {/* File Uploads Grid */}
      <div className="space-y-4 border-t border-gray-50 pt-6">
        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1 block mb-2">
          {curT.requiredDocs}
        </label>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {personnelDocs.map((doc: any) => (
            <FileUpload
              key={doc.key}
              label={doc.label}
              file={files[`${prefix}_${doc.key}`]}
              onUpload={(file) => onUpload(`${prefix}_${doc.key}`, file)}
              onDelete={() => onDelete(`${prefix}_${doc.key}`)}
              onView={onView}
              required={doc.required}
              disabled={isFormLocked}
              isOpenedForEdit={correctionOpenedFields.includes(
                `${prefix}_${doc.key}`,
              )}
              infoText={doc.infoText}
              infoTextAm={doc.infoTextAm}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export const NewApplication = () => {
  const { user: currentUser } = useAuth();
  const { language } = useLanguage();
  const isAm = language === "am";
  const locationLookup = useLocationData();
  const [positions, setPositions] = React.useState<PositionOption[]>([]);
  // Map of positionId -> unique education level strings derived from position requirements
  const [positionEducationOptions, setPositionEducationOptions] =
    React.useState<Record<number, string[]>>({});
  const [serverUserProfile, setServerUserProfile] = React.useState<any>(null);
  const [step, setStep] = React.useState(1);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [eligibilityLoading, setEligibilityLoading] = React.useState(true);
  const [eligibilityError, setEligibilityError] = React.useState<string | null>(
    null,
  );
  const [approvedFormalYear, setApprovedFormalYear] = React.useState<
    number | null
  >(null);
  const [latestApplicationStatus, setLatestApplicationStatus] = React.useState<
    string | null
  >(null);
  const [latestApplicationDate, setLatestApplicationDate] = React.useState<
    string | null
  >(null);
  const [accessBlockedReason, setAccessBlockedReason] = React.useState<
    "formal" | "application" | null
  >(null);
  const [accessBlockedTitle, setAccessBlockedTitle] = React.useState("");
  const [accessBlockedMessage, setAccessBlockedMessage] = React.useState("");
  const [submissionError, setSubmissionError] = React.useState<string | null>(
    null,
  );
  const [openedFields] = React.useState<string[]>(() => {
    const defaultOpenedFields = ["trade_license", "kebele_id_m_2024"];

    if (typeof window === "undefined") {
      return defaultOpenedFields;
    }

    try {
      const stored = window.localStorage.getItem(
        "applicationCorrectionUploadFields",
      );
      const parsed = stored ? (JSON.parse(stored) as string[]) : [];

      return Array.from(
        new Set([...defaultOpenedFields, ...parsed.filter(Boolean)]),
      );
    } catch {
      return defaultOpenedFields;
    }
  });
  const [uploadedFiles, setUploadedFiles] = React.useState<
    Record<string, File | null>
  >({});
  const [reviewLocationLabels, setReviewLocationLabels] = React.useState<
    Record<string, string>
  >({});

  // Fetch position requirements and extract unique `requiredEducationLevel` values
  const fetchPositionRequirements = async (positionId: number) => {
    if (!positionId || positionEducationOptions[positionId]) return;
    try {
      // Try common endpoints: /positions/:id and /positions/:id/requirements
      let res: any = null;
      try {
        res = await apiRequest(`/positions/${positionId}`);
      } catch (e) {
        // ignore and try fallback
      }

      let requirements: any[] | undefined;
      if (res) {
        requirements =
          res.data?.requirements ||
          res.requirements ||
          res.data?.positionRequirements ||
          res.positionRequirements;
      }

      if (!requirements) {
        try {
          const r2 = await apiRequest(`/positions/${positionId}/requirements`);
          requirements = r2.data || r2;
        } catch (e) {
          // final fallback: empty
          requirements = [];
        }
      }

      const eduSet = new Set<string>();
      (requirements || []).forEach((req: any) => {
        const v = req?.requiredEducationLevel;
        if (v && String(v).trim().length > 0) eduSet.add(String(v).trim());
      });

      const arr = Array.from(eduSet);
      if (arr.length > 0) {
        setPositionEducationOptions((prev) => ({ ...prev, [positionId]: arr }));
      } else {
        // store empty array to avoid re-fetch attempts
        setPositionEducationOptions((prev) => ({ ...prev, [positionId]: [] }));
      }
    } catch (err) {
      // non-fatal
      console.warn("Failed to load requirements for position", positionId, err);
      setPositionEducationOptions((prev) => ({ ...prev, [positionId]: [] }));
    }
  };

  const t_new = {
    en: {
      steps: [
        "Agency Info",
        "Org Docs",
        "Assets",
        "Training",
        "Personnel",
        "Review",
      ],
      submittedTitle: "Application Submitted!",
      submittedDesc:
        "Your application for a new private security agency license has been successfully submitted. The Federal Police will review your documents and contact you for the next steps.",
      step1Title: "Agency & Office Information",
      orgName: "Organization Name (English)",
      orgNameAmharic: "Organization Name (Amharic)",
      headOfficeAddress: "Head Office Address",
      headOffice: "Head Office Name",
      faxNumber: "Fax Number",
      region: "Region",
      zone: "Zone",
      woreda: "Woreda",
      kebele: "Kebele",
      houseNo: "House No.",
      agencyphone: "Phone Number",
      tinNumber: "TIN Number",
      email: "Email Address",
      tradeName: "Trade Name",
      specialLocation: "Special Location Name (Optional)",
      faydaId: "Fayda ID Number",
      otp: "OTP Code",
      step2Title: "Organization Documents",
      step2Desc: "Upload mandatory legal and organizational documents.",
      step3Title: "Assets & Facilities",
      step3Desc: "Provide details about your physical assets and branding.",
      capitalAmount: "Capital Amount",
      offices: "Number of Offices",
      storeHouse: "Has Store House?",
      computers: "Number of Computers",
      vehicles: "Number of Vehicles",
      photoSamples: "Photo Samples",
      step4Title: "Training Status",
      step4Desc: "Details about the organization's training program.",
      trainingAddress: "Training Address",
      trainingDays: "Number of Days Trained",
      trainingMale: "Number of Males Trained",
      trainingFemale: "Number of Females Trained",
      trainingMaleUntrained: "Number of Males Not Trained",
      trainingFemaleUntrained: "Number of Females Not Trained",
      trainingProvider: "Training Provider Body",
      step5Title: "Key Personnel Requirements",
      step5Desc:
        "Provide details and documents for the Manager, Operations Head, and Admin Head.",
      step6Title: "Final Review",
      step6Desc:
        "Please ensure all uploaded documents and photos are clear and valid. False information may lead to permanent disqualification.",
      fullName: "Full Name",
      gender: "Gender",
      male: "Male",
      female: "Female",
      citizenship: "Citizenship",
      ethiopian: "ETHIOPIAN",
      position: "Position",
      selectPosition: "Select Position",
      educationLevel: "Education Level",
      selectEducationLevel: "Select Education Level",
      selectPositionFirst: "Select Position First",
      workExpYears: "Work Experience Years",
      totalExpYears: "Total Experience Years",
      uploaded: "Uploaded",
      selectFile: "Select File",
      documentHint: "PDF Max 5MB",
      photoHint: "JPG, PNG Max 2MB",
      optional: "Optional",
      genderOption: "Select gender",
      addAddress: "Add Address",
      branchAddresses: "Branch Addresses (Optional)",
      branchAddressDesc: "Add none, one, or multiple branch locations.",
      noBranchAddress:
        "No branch address added. You can submit with only the head office address.",
      completeBranchFirst:
        "Please complete the current branch address before adding another one.",
      remove: "Remove",
      headOfficeDesc:
        "Primary office location used for the application record.",
      edit: "Edit",
      reviewApplication: "Review Application",
      returnToDashboard: "Return to Dashboard",
      selectOption: "Select option",
      yes: "Yes",
      no: "No",
      docTradeName: "Trade name designation",
      docTradePreReg: "Trade pre-registration",
      docRenewedLicense: "Renewed Trade license",
      docLaborSkill: "Labor and Skill Bureau registration",

      docTaxpayerClearance: "Taxpayer clearance",
      docOrgStructure: "Organizational structure",
      docArticlesInc: "Memorandum of association",
      docInternalRegs: "Internal regulations",
      docTechList: "Lists of technologies used",
      docCapital: "Capital (Bank statement)",
      docInsurance: "Insurance",
      docVehicleRent: "Notarized Vehicle Rent/Ownership",
      docHouseRent: "Notarized House Rent/Ownership",
      docUniformSample: "Uniform Sample",
      docEmployeeId: "Organization Employee ID Sample (Front & Back)",
      docEmploymentForm: "Employment Form",
      docWarrantyForm: "Employment Warranty Form",
      docLogo: "Logo of Organization",
      docTrainingManual: "Training Manual",
      docTrainingCert: "Certificate of Training (Optional)",
      personnelTitle: "Key Personnel Requirements",
      personnelDesc:
        "Provide details and documents for the Manager, Operations Head, and Admin Head.",
      personnelNote:
        "Note: Ensure all uploaded documents are clear and legible. The Fayda ID and Phone number must be active for verification purposes.",
      fingerprintDoc: "Fingerprint from Police",
      medicalDoc: "Medical Result",
      trainingDoc: "Training Certificate",
      supportDoc: "Support Letter (Kebele)",
      collateralDoc: "Proof of Collateral",
      experienceDoc: "Work Experience",
      resignationDoc: "Resignation Record",
      educationDoc: "Educational Certificate",
      nationalIdDoc: "National ID",
      kebeleIdDoc: "Renewed Kebele ID/Passport",
      orgIdDoc: "Organization Identification",
      requiredDocs: "Required Documents",
      back: "Back",
      continue: "Continue",
      submit: "Submit Application",
      processing: "Submitting...",
    },
    am: {
      steps: ["መረጃ", "ሰነዶች", "ንብረቶች", "ስልጠና", "ሰራተኞች", "ግምገማ"],
      submittedTitle: "ማመልከቻው ገብቷል!",
      submittedDesc:
        "ለአዲስ የግል ጥበቃ ተቋም ፈቃድ ያቀረቡት ማመልከቻ በተሳካ ሁኔታ ገብቷል። ፌዴራል ፖሊስ ሰነዶችዎን ገምግሞ ለቀጣይ እርምጃዎች ያገኝዎታል።",
      step1Title: "የተቋም እና የቢሮ መረጃ",
      orgName: "የተቋሙ ስም (ኢንጊሊዘኛ)",
      orgNameAmharic: "የተቋሙ ስም (አማርኛ)",
      headOfficeAddress: "የዋና መስሪያ ቤት አድራሻ",
      headOffice: "የዋና መስሪያ ቤት ስም",
      faxNumber: "የፋክስ ቁጥር",
      region: "ክልል",
      zone: "ዞን",
      woreda: "ወረዳ",
      kebele: "ቀበሌ",
      houseNo: "የቤት ቁጥር",
      agencyphone: "ስልክ ቁጥር",
      tinNumber: "የቲን ቁጥር",
      email: "ኢሜል አድራሻ",
      tradeName: "የንግድ ስም",
      specialLocation: "የልዩ ቦታ ስም (አማራጭ)",
      faydaId: "የፋይዳ መለያ ቁጥር",
      otp: "የኦቲፒ ኮድ",
      step2Title: "የተቋም ሰነዶች",
      step2Desc: "አስገዳጅ የሆኑ ህጋዊ እና ድርጅታዊ ሰነዶችን ይስቀሉ።",
      step3Title: "ንብረቶች እና መገልገያዎች",
      step3Desc: "ስለ ቁሳዊ ንብረቶችዎ እና ስለ ተቋሙ መለያዎች ዝርዝር መረጃ ይስጡ።",
      capitalAmount: "የካፒታል መጠን",
      offices: "የቢሮ ብዛት",
      storeHouse: "ግምጃ አለው?",
      computers: "የኮምፒውተር ብዛት",
      vehicles: "የተሸከርካሪ ብዛት",
      photoSamples: "የፎቶ ናሙናዎች",
      step4Title: "የስልጠና ሁኔታ",
      step4Desc: "ስለ ተቋሙ የስልጠና ፕሮግራም ዝርዝር መረጃ።",
      trainingAddress: "ስልጠና ሚሰጠበት ቦታ",
      trainingDays: "የሰለጠኑበት ቀን ብዛት",
      trainingMale: "የሰለጠኑ ወንዶች ብዛት",
      trainingFemale: "የሰለጠኑ ሴቶች ብዛት",
      trainingMaleUntrained: "ያልሰለጠኑ ወንዶች ብዛት",
      trainingFemaleUntrained: "ያልሰለጠኑ ሴቶች ብዛት",
      trainingProvider: "ስልጠና የሰጠው አካል",
      step5Title: "የቁልፍ ሰራተኞች መስፈርቶች",
      step5Desc: "ለስራ አስኪያጅ፣ ለኦፕሬሽን ኃላፊ እና ለአስተዳደር ኃላፊ ዝርዝር መረጃ እና ሰነዶችን ያቅርቡ።",
      step6Title: "የመጨረሻ ግምገማ",
      step6Desc:
        "እባክዎ ሁሉም የተሰቀሉ ሰነዶች እና ፎቶዎች ግልጽ እና ትክክለኛ መሆናቸውን ያረጋግጡ። የተሳሳተ መረጃ መስጠት ለዘላቂ ብቁ አለመሆን ሊያጋልጥ ይችላል።",
      fullName: "ሙሉ ስም",
      gender: "ጾታ",
      male: "ወንድ",
      female: "ሴት",
      citizenship: "ዜግነት",
      ethiopian: "ኢትዮጵያዊ",
      position: "ቦታ",
      selectPosition: "ቦታ ይምረጡ",
      educationLevel: "የትምህርት ደረጃ",
      selectEducationLevel: "የትምህርት ደረጃ ይምረጡ",
      selectPositionFirst: "መጀመሪያ ቦታ ይምረጡ",
      workExpYears: "የስራ ልምድ ዓመታት",
      totalExpYears: "ጠቅላላ የልምድ ዓመታት",
      uploaded: "ተሰቅሏል",
      selectFile: "ፋይል ይምረጡ",
      documentHint: "ፒዲኤፍ ከፍተኛ 5ሜባ",
      photoHint: "ጄፒጂ፣ ፒኤንጂ ከፍተኛ 2ሜባ",
      optional: "አማራጭ",
      genderOption: "ጾታ ይምረጡ",
      addAddress: "አድራሻ ያክሉ",
      branchAddresses: "የቅርንጫፍ አድራሻዎች (አማራጭ)",
      branchAddressDesc: "አንድም ቢሆን፣ አንድም ባይኖር ወይም በርካታ የቅርንጫፍ አድራሻዎችን ያክሉ።",
      noBranchAddress:
        "ምንም የቅርንጫፍ አድራሻ አልተጨመረም። በዋና መሥሪያ ቤት አድራሻ ብቻ ማስገባት ይችላሉ።",
      completeBranchFirst: "ሌላ ከመጨመርዎ በፊት እባክዎ የአሁኑን የቅርንጫፍ አድራሻ ያጠናቅቁ።",
      remove: "አስወግድ",
      headOfficeDesc: "ለማመልከቻው መዝገብ የሚያገለግል ዋና የቢሮ አድራሻ።",
      edit: "አርትዕ",
      reviewApplication: "ማመልከቻውን ይገምግሙ",
      returnToDashboard: "ወደ ዳሽቦርድ ይመለሱ",
      selectOption: "አማራጭ ይምረጡ",
      yes: "አዎ",
      no: "አይ",
      docTradeName: "የንግድ ስም ስያሜ",
      docTradePreReg: "የንግድ ቅድመ ምዝገባ",
      docRenewedLicense: "የንግድ ሥራ ፍቃድ የታደሰ",
      docLaborSkill: "የስራና ክህሎት ቢሮ",

      docTaxpayerClearance: "የግብር ከፋይነት መለያ ቁጥር",
      docOrgStructure: "የድርጅት መዋቅር",
      docArticlesInc: "የመመሰረቻ ጽሁፍ",
      docInternalRegs: "የውስጥ መተዳደርያ ደንብ",
      docTechList: "የሚጠቀመው ቴክኖሎጂ ዝርዝር",
      docCapital: "ካፒታል እንደ ደረጃው (የባንክ ሂሳብ መግለጫ)",
      docInsurance: "ኢንሹራንስ",
      docVehicleRent: "የተሽከርካሪ ኪራይ/ባለቤትነት",
      docHouseRent: "የቤት ኪራይ/ባለቤትነት",
      docUniformSample: "የዩኒፎርም ናሙና",
      docEmployeeId: "የድርጅት ሰራተኛ መታወቂያ ናሙና (ፊት እና ጀርባ)",
      docEmploymentForm: "የቅጥር ፎርም",
      docWarrantyForm: "የዋስትና ፎርም ",
      docLogo: "የድርጅት አርማ (ሎጎ)",
      docTrainingManual: "የስልጠና ማኑዋል",
      docTrainingCert: "የስልጠና የምስክር ወረቀት (አማራጭ)",
      personnelTitle: "የቁልፍ ሰራተኞች መስፈርቶች",
      personnelDesc:
        "ለስራ አስኪያጅ፣ ለኦፕሬሽን ኃላፊ እና ለአስተዳደር ኃላፊ ዝርዝር መረጃ እና ሰነዶችን ያቅርቡ።",
      personnelNote:
        "ማሳሰቢያ፡ ሁሉም የተሰቀሉ ሰነዶች ግልጽ እና ሊነበቡ የሚችሉ መሆናቸውን ያረጋግጡ። ፋይዳ አይዲ እና ስልክ ቁጥር ለማረጋገጫ ዓላማ ንቁ መሆን አለባቸው።",
      fingerprintDoc: "የጣት አሻራ ከፖሊስ",
      medicalDoc: "የሕክምና ውጤት",
      trainingDoc: "የስልጠና ምስክር ወረቀት",
      supportDoc: "የድጋፍ ደብዳቤ ከቀበሌ",
      collateralDoc: "የዋስትና ማስረጃ",
      experienceDoc: "የሥራ ልምድ",
      resignationDoc: "ከሥራ የመልቀቂያ ማስረጃ",
      educationDoc: "የትምህርት ማስረጃ",
      nationalIdDoc: "ፋይዳ / ብሔራዊ መታወቂያ",
      kebeleIdDoc: "የታደሰ የቀበሌ መታወቂያ ወይም ፓስፖርት",
      orgIdDoc: "የድርጅት መታወቂያ",
      requiredDocs: "የሚፈለጉ ሰነዶች",
      back: "ተመለስ",
      continue: "ቀጥል",
      submit: "ማመልከቻውን አቅርብ",
      processing: "በማቅረብ ላይ...",
    },
  };

  const curT = t_new[language as keyof typeof t_new] || t_new.en;

  const [viewerState, setViewerState] = React.useState<{
    isOpen: boolean;
    file: File | null;
    url: string | null;
  }>({
    isOpen: false,
    file: null,
    url: null,
  });

  const handleView = (file: File, url: string | null) => {
    setViewerState({ isOpen: true, file, url });
  };

  const handleUpload = (key: string, file: File) => {
    setUploadedFiles((prev) => ({ ...prev, [key]: file }));
  };

  const handleDelete = (key: string) => {
    setUploadedFiles((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const normalizeText = (value: unknown) => {
    if (typeof value !== "string") return "";
    return value.trim();
  };

  const getLocationLabel = (
    items: Array<{ id: number; name: string }>,
    value: unknown,
  ) => {
    const id = Number(value);
    if (!Number.isFinite(id)) {
      return normalizeText(value) || "-";
    }

    return items.find((item) => item.id === id)?.name || String(value || "-");
  };

  const getCachedLocationLabel = (
    items: Array<{ id: number; name: string }>,
    value: unknown,
    cacheKey: string,
  ) => {
    const cached = reviewLocationLabels[cacheKey];
    if (cached) return cached;
    const fallback = getLocationLabel(items, value);
    return fallback;
  };

  const hasApprovedFormalLetterThisYear =
    approvedFormalYear === new Date().getFullYear();
  const isApplicationBlockingStatus =
    latestApplicationStatus === "pending" ||
    latestApplicationStatus === "approved";
  const canOpenNewApplicationPage =
    !eligibilityLoading &&
    !eligibilityError &&
    hasApprovedFormalLetterThisYear &&
    accessBlockedReason === null;

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue, // Added this to handle location resets
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      // It's good practice to initialize nested objects
      agencyphone: "+251",
      manager: { gender: "", citizenship: "ETHIOPIAN", phone: "+251" },
      ops: { gender: "", citizenship: "ETHIOPIAN", phone: "+251" },
      admin: { gender: "", citizenship: "ETHIOPIAN", phone: "+251" },
      branchAddresses: [],
      vehiclesCount: undefined,
    },
  });

  const watchedRegion = watch("region");
  const watchedZone = watch("zone");
  const watchedWoreda = watch("woreda");
  const watchedManager = useWatch({ control, name: "manager" });
  const watchedOps = useWatch({ control, name: "ops" });
  const watchedAdmin = useWatch({ control, name: "admin" });
  const watchedBranchAddresses = useWatch({ control, name: "branchAddresses" });

  React.useEffect(() => {
    if (!currentUser) {
      return;
    }

    setValue("manager.fullName", currentUser.fullName ?? "", {
      shouldDirty: false,
      shouldTouch: false,
    });
    setValue("manager.email", currentUser.email ?? "", {
      shouldDirty: false,
      shouldTouch: false,
    });
    setValue("manager.phone", currentUser.phone || "+251", {
      shouldDirty: false,
      shouldTouch: false,
    });
    setValue("manager.faydaId", currentUser.faydaId ?? "", {
      shouldDirty: false,
      shouldTouch: false,
    });
  }, [currentUser, setValue]);

  React.useEffect(() => {
    if (watchedRegion) {
      locationLookup.setRegionId(Number(watchedRegion));
    }
  }, [locationLookup, watchedRegion]);

  React.useEffect(() => {
    if (watchedZone) {
      locationLookup.setZoneId(Number(watchedZone));
    }
  }, [locationLookup, watchedZone]);

  React.useEffect(() => {
    if (watchedWoreda) {
      locationLookup.setWoredaId(Number(watchedWoreda));
    }
  }, [locationLookup, watchedWoreda]);

  React.useEffect(() => {
    let isMounted = true;

    apiRequest<{ data: any }>("/users/me")
      .then((res) => {
        if (!isMounted) return;
        setServerUserProfile(res.data ?? null);
      })
      .catch(() => {
        // Fall back to the locally cached auth profile if the server profile is unavailable.
      });

    return () => {
      isMounted = false;
    };
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    const currentYear = new Date().getFullYear();

    const normalizeStatus = (value: unknown) =>
      String(value || "")
        .trim()
        .toLowerCase();

    const getRequestYear = (request: any) => {
      const fileName =
        String(request?.requestLetterUrl || "")
          .split(/[\\/]/)
          .pop() || "";
      const fileYear = fileName.match(/^(20\d{2})-/)?.[1];
      if (fileYear) {
        return Number(fileYear);
      }

      const createdAt = request?.createdAt ? new Date(request.createdAt) : null;
      return createdAt && !Number.isNaN(createdAt.getTime())
        ? createdAt.getFullYear()
        : null;
    };

    const loadEligibility = async () => {
      if (!currentUser?.id) {
        if (!cancelled) {
          setEligibilityLoading(false);
          setEligibilityError("Sign in to check application eligibility.");
          setAccessBlockedReason("formal");
          setAccessBlockedTitle("Sign in required");
          setAccessBlockedMessage(
            "You need an authenticated account before you can open the new application page.",
          );
        }
        return;
      }

      try {
        if (!cancelled) {
          setEligibilityLoading(true);
          setEligibilityError(null);
        }

        const applicationPromise = apiRequest<any>("/applications/me").catch(
          (error: any) => {
            if (error?.statusCode === 404) {
              return null;
            }
            throw error;
          },
        );

        const [formalRes, applicationRes] = await Promise.all([
          apiRequest<any>(`/formal-requests/user/${currentUser.id}/all`),
          applicationPromise,
        ]);

        const formalRequests = Array.isArray(formalRes.data)
          ? formalRes.data
          : [];
        const approvedFormalRequest = formalRequests.find((request: any) => {
          return (
            normalizeStatus(request?.status) === "approved" &&
            getRequestYear(request) === currentYear
          );
        });

        const application = applicationRes?.data ?? null;
        const applicationStatus = normalizeStatus(application?.status);
        const applicationDate = application?.applicationDate
          ? String(application.applicationDate)
          : null;
        const applicationYear = applicationDate
          ? new Date(applicationDate).getFullYear()
          : null;
        const isBlockingApplication =
          (applicationStatus === "pending" ||
            applicationStatus === "approved") &&
          (applicationYear === null || applicationYear === currentYear);

        if (!cancelled) {
          setApprovedFormalYear(approvedFormalRequest ? currentYear : null);
          setLatestApplicationStatus(applicationStatus || null);
          setLatestApplicationDate(applicationDate);

          if (!approvedFormalRequest) {
            setAccessBlockedReason("formal");
            setAccessBlockedTitle("Formal letter approval required");
            setAccessBlockedMessage(
              `Your formal letter must be approved for ${currentYear} before you can open the new application page.`,
            );
          } else if (isBlockingApplication) {
            setAccessBlockedReason("application");
            setAccessBlockedTitle("Application already submitted");
            setAccessBlockedMessage(
              `Your latest application is ${applicationStatus === "approved" ? "approved" : "pending"}${applicationDate ? ` since ${applicationDate.slice(0, 10)}` : ""}. The new application page is hidden until the status changes.`,
            );
          } else {
            setAccessBlockedReason(null);
            setAccessBlockedTitle("");
            setAccessBlockedMessage("");
          }
        }
      } catch (error: any) {
        if (!cancelled) {
          setEligibilityError(
            error?.message || "Failed to verify application eligibility.",
          );
          setAccessBlockedReason("formal");
          setAccessBlockedTitle("Eligibility check failed");
          setAccessBlockedMessage(
            "We could not verify your formal letter approval or application status right now.",
          );
        }
      } finally {
        if (!cancelled) {
          setEligibilityLoading(false);
        }
      }
    };

    void loadEligibility();

    return () => {
      cancelled = true;
    };
  }, [currentUser?.id]);

  // Watch selected positionId for each personnel and fetch requirements when needed
  React.useEffect(() => {
    const managerPid = Number(watch("manager.positionId"));
    const opsPid = Number(watch("ops.positionId"));
    const adminPid = Number(watch("admin.positionId"));

    if (Number.isFinite(managerPid) && managerPid > 0) {
      void fetchPositionRequirements(managerPid);
    }
    if (Number.isFinite(opsPid) && opsPid > 0) {
      void fetchPositionRequirements(opsPid);
    }
    if (Number.isFinite(adminPid) && adminPid > 0) {
      void fetchPositionRequirements(adminPid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    watch("manager.positionId"),
    watch("ops.positionId"),
    watch("admin.positionId"),
  ]);

  React.useEffect(() => {
    let isMounted = true;

    apiRequest<any>("/positions")
      .then((res) => {
        if (!isMounted) return;
        setPositions(
          (res.data || []).map((position: any) => ({
            id: position.id,
            name: position.name,
          })),
        );
      })
      .catch(() => {
        if (!isMounted) return;
        setPositions([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  React.useEffect(() => {
    const count = Number(watch("vehiclesCount"));
    if (count === 0 && uploadedFiles.vehicle_rent) {
      handleDelete("vehicle_rent");
    }
  }, [watch("vehiclesCount")]);

  React.useEffect(() => {
    let cancelled = false;

    const personnel = [
      { prefix: "manager", data: watchedManager },
      { prefix: "ops", data: watchedOps },
      { prefix: "admin", data: watchedAdmin },
    ].filter((entry) => entry.data);
    const branchAddresses = (watchedBranchAddresses || []).filter(Boolean);

    const load = async () => {
      try {
        const nextCache: Record<string, string> = {};

        const allRegions = await apiRequest<any>("/location/regions");
        const regionRows = allRegions.data || [];

        for (const entry of personnel) {
          const regionId = Number(entry.data?.region);
          const zoneId = Number(entry.data?.zone);
          const woredaId = Number(entry.data?.woreda);
          const kebeleId = Number(entry.data?.kebele);

          if (Number.isFinite(regionId)) {
            const region = regionRows.find((item: any) => item.id === regionId);
            nextCache[`${entry.prefix}:region:${regionId}`] =
              region?.nameEnglish ||
              region?.nameAmharic ||
              region?.name ||
              String(regionId);

            if (Number.isFinite(zoneId)) {
              const zonesRes = await apiRequest<any>(
                `/location/regions/${regionId}/zones`,
              );
              const zoneRows = zonesRes.data || [];
              const zone = zoneRows.find((item: any) => item.id === zoneId);
              nextCache[`${entry.prefix}:zone:${zoneId}`] =
                zone?.nameEnglish ||
                zone?.nameAmharic ||
                zone?.name ||
                String(zoneId);

              if (Number.isFinite(woredaId)) {
                const woredasRes = await apiRequest<any>(
                  `/location/zones/${zoneId}/woredas`,
                );
                const woredaRows = woredasRes.data || [];
                const woreda = woredaRows.find(
                  (item: any) => item.id === woredaId,
                );
                nextCache[`${entry.prefix}:woreda:${woredaId}`] =
                  woreda?.nameEnglish ||
                  woreda?.nameAmharic ||
                  woreda?.name ||
                  String(woredaId);

                if (Number.isFinite(kebeleId)) {
                  const kebelesRes = await apiRequest<any>(
                    `/location/woredas/${woredaId}/kebeles`,
                  );
                  const kebeleRows = kebelesRes.data || [];
                  const kebele = kebeleRows.find(
                    (item: any) => item.id === kebeleId,
                  );
                  nextCache[`${entry.prefix}:kebele:${kebeleId}`] =
                    kebele?.nameEnglish ||
                    kebele?.nameAmharic ||
                    kebele?.name ||
                    String(kebeleId);
                }
              }
            }
          }
        }

        for (const [index, branch] of branchAddresses.entries()) {
          const regionId = Number(branch?.region);
          const zoneId = Number(branch?.zone);
          const woredaId = Number(branch?.woreda);
          const kebeleId = Number(branch?.kebeleId);

          if (Number.isFinite(regionId)) {
            const region = regionRows.find((item: any) => item.id === regionId);
            nextCache[`branch:${index}:region:${regionId}`] =
              region?.nameEnglish ||
              region?.nameAmharic ||
              region?.name ||
              String(regionId);

            if (Number.isFinite(zoneId)) {
              const zonesRes = await apiRequest<any>(
                `/location/regions/${regionId}/zones`,
              );
              const zoneRows = zonesRes.data || [];
              const zone = zoneRows.find((item: any) => item.id === zoneId);
              nextCache[`branch:${index}:zone:${zoneId}`] =
                zone?.nameEnglish ||
                zone?.nameAmharic ||
                zone?.name ||
                String(zoneId);

              if (Number.isFinite(woredaId)) {
                const woredasRes = await apiRequest<any>(
                  `/location/zones/${zoneId}/woredas`,
                );
                const woredaRows = woredasRes.data || [];
                const woreda = woredaRows.find(
                  (item: any) => item.id === woredaId,
                );
                nextCache[`branch:${index}:woreda:${woredaId}`] =
                  woreda?.nameEnglish ||
                  woreda?.nameAmharic ||
                  woreda?.name ||
                  String(woredaId);

                if (Number.isFinite(kebeleId)) {
                  const kebelesRes = await apiRequest<any>(
                    `/location/woredas/${woredaId}/kebeles`,
                  );
                  const kebeleRows = kebelesRes.data || [];
                  const kebele = kebeleRows.find(
                    (item: any) => item.id === kebeleId,
                  );
                  nextCache[`branch:${index}:kebele:${kebeleId}`] =
                    kebele?.nameEnglish ||
                    kebele?.nameAmharic ||
                    kebele?.name ||
                    String(kebeleId);
                }
              }
            }
          }
        }

        if (!cancelled) {
          setReviewLocationLabels(nextCache);
        }
      } catch {
        // Keep fallback labels from the current in-memory location lists.
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [watchedManager, watchedOps, watchedAdmin, watchedBranchAddresses]);

  const managerProfile = serverUserProfile ?? currentUser;

  const {
    fields: branchAddressFields,
    append: appendBranchAddress,
    remove: removeBranchAddress,
  } = useFieldArray({
    control,
    name: "branchAddresses",
  });

  const branchAddresses = watch("branchAddresses") || [];
  const canAppendBranchAddress =
    branchAddresses.length === 0 ||
    Boolean(
      branchAddresses[branchAddresses.length - 1]?.kebeleId?.toString().trim(),
    );

  const nextStep = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (step < 6) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const mapSubmissionKeyToUploadField = (key: string) => {
    if (key.startsWith("manager_")) {
      return key;
    }

    if (key.startsWith("ops_")) {
      return `operations_${key.slice(4)}`;
    }

    if (key.startsWith("admin_")) {
      return `administrator_${key.slice(6)}`;
    }

    if (key === "capital") {
      return "organization_bank_statement_capital";
    }

    return `organization_${key}`;
  };

  const mapUploadFieldToSubmissionKey = (fieldName: string) => {
    if (fieldName.startsWith("operations_")) {
      return `ops_${fieldName.slice("operations_".length)}`;
    }

    if (fieldName.startsWith("administrator_")) {
      return `admin_${fieldName.slice("administrator_".length)}`;
    }

    if (fieldName === "organization_bank_statement_capital") {
      return "bank_statement_capital";
    }

    if (fieldName.startsWith("organization_")) {
      return fieldName.replace(/^organization_/, "");
    }

    return fieldName;
  };

  const buildUploadPayload = () => {
    const files: Record<string, File> = {};

    Object.entries(uploadedFiles).forEach(([key, file]) => {
      if (!file) return;
      files[mapSubmissionKeyToUploadField(key)] = file;
    });

    return files;
  };

  const uploadApplicationFiles = async () => {
    const files = buildUploadPayload();

    if (Object.keys(files).length === 0) {
      return {};
    }

    const orgDisplayName =
      language === "am"
        ? String(watch("agencyNameAmharic") || watch("agencyName") || "")
        : String(watch("agencyName") || watch("agencyNameAmharic") || "");

    const uploadOrganizationName = orgDisplayName.startsWith("organization/")
      ? orgDisplayName
      : `organization/${orgDisplayName}`;

    const result = await uploadOrganizationDocuments(
      uploadOrganizationName,
      files,
    );

    if (!result.success || !result.data?.uploadedFiles) {
      throw new Error(result.error || "File upload failed");
    }

    return Object.fromEntries(
      Object.entries(result.data.uploadedFiles).map(([fieldName, fileUrl]) => [
        mapUploadFieldToSubmissionKey(fieldName),
        fileUrl,
      ]),
    );
  };

  const onSubmit = async (data: any) => {
    // if (step !== 6) {
    //   nextStep();
    //   return;
    // }
    try {
      setSubmissionError(null);
      console.groupCollapsed("[DEBUG] Submitting Application - start");
      console.debug("Form values (raw):", data);
      console.debug("Uploaded files (keys):", Object.keys(uploadedFiles));
      try {
        // show basic info about files
        Object.entries(uploadedFiles).forEach(([k, f]) =>
          console.debug(
            `file:${k}`,
            f ? { name: f.name, size: f.size, type: f.type } : null,
          ),
        );
      } catch (e) {
        console.debug("Uploaded files debug error", e);
      }
      console.groupEnd();

      const normalizedBranchAddresses = (data.branchAddresses || [])
        .filter((branch: any) => branch?.kebeleId)
        .map((branch: any) => ({
          kebeleId: Number(branch.kebeleId),
          houseNumber: branch.houseNumber?.trim() || null,
          specialLocation: branch.specialLocation?.trim() || null,
        }));

      // 1. Gather form data
      const formData = {
        agencyName: normalizeText(data.agencyName),
        agencyNameEnglish:
          normalizeText(data.agencyNameEnglish) ||
          normalizeText(data.agencyName) ||
          null,
        agencyNameAmharic:
          normalizeText(data.agencyNameAmharic) ||
          normalizeText(data.agencyName) ||
          null,
        email: data.email,
        phone: data.agencyphone,
        faxNumber: data.faxNumber,
        tinNumber: data.tinNumber,
        tradeName: data.tradeName,
        kebele: data.kebele,
        houseNumber: data.houseNumber,
        specialLocation: data.specialLocation,
        branchAddresses: normalizedBranchAddresses,
        numberOfOffices: Number(data.officesCount),
        numberOfComputers: Number(data.computersCount),
        numberOfVehicles: Number(data.vehiclesCount ?? 0),
        hasStoreHouse:
          data.hasStoreHouse === true || data.hasStoreHouse === "true",
        capitalAmount: Number(data.capitalAmount),
        trainingAddress: data.trainingAddress,
        trainingDays: Number(data.trainingDays || 0),
        trainingProvider: data.trainingProvider,
        totalTraineesMale: Number(data.totalTraineesMale || 0),
        totalTraineesFemale: Number(data.totalTraineesFemale || 0),
        totalMaleUntrained: Number(data.totalMaleUntrained || 0),
        totalFemaleUntrained: Number(data.totalFemaleUntrained || 0),
        manager: data.manager,
        ops: data.ops,
        admin: data.admin,
      };

      // 2. Upload files to backend storage and remap returned URLs back to submission keys
      console.groupCollapsed("[DEBUG] Uploading files to backend");
      const uploadedFilesUrls = await uploadApplicationFiles();
      console.debug("Uploaded file URLs:", uploadedFilesUrls);
      console.groupEnd();

      // 4. Send POST request
      const payload = {
        formData,
        uploadedFiles: uploadedFilesUrls,
      };
      console.groupCollapsed("[DEBUG] Final submission payload");
      console.debug("Payload:", payload);
      console.groupEnd();

      await apiRequest("/applications/submit", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // Notify admins about the new application submission
      try {
        await apiRequest("/notifications/notify-application-submission", {
          method: "POST",
          body: JSON.stringify({
            organizationName: data.agencyName || "Unknown Organization",
            organizationNameAm:
              data.agencyNameAmharic ||
              data.agencyName ||
              "Unknown Organization",
            applicationType: "New Application",
          }),
        });
      } catch (notificationError) {
        console.error("Failed to notify admins:", notificationError);
        // Don't block the submission if notification fails
      }

      setSubmissionError(null);
      setIsSubmitted(true);
      console.info("[DEBUG] Submission completed — isSubmitted=true");
    } catch (err: any) {
      console.error("[DEBUG] Submission error:", err);

      const errorMessage = String(
        err?.message || "Failed to submit application.",
      );
      const isDuplicateIdentityError = errorMessage.includes(
        "Fayda ID or Email already exists",
      );
      const isDuplicateOrganizationError = errorMessage.includes(
        "An organization with this name already exists.",
      );

      if (isDuplicateIdentityError) {
        setStep(5);
        setSubmissionError(errorMessage);
        return;
      }

      if (isDuplicateOrganizationError) {
        setStep(1);
        setSubmissionError(errorMessage);
        return;
      }

      setSubmissionError(errorMessage);
    }
  };

  const onInvalid = (formErrors: any) => {
    console.warn("[DEBUG] Submission validation failed:", formErrors);

    const errorPaths = Object.keys(formErrors);
    const hasStep1Error = errorPaths.some((key) =>
      [
        "agencyName",
        "branchAddresses",
        "tradeName",
        "region",
        "zone",
        "woreda",
        "kebele",
        "houseNumber",
        "specialLocation",
        "agencyphone",
        "faxNumber",
        "email",
        "tinNumber",
      ].includes(key),
    );
    const hasStep3Error = errorPaths.some((key) =>
      [
        "capitalAmount",
        "officesCount",
        "computersCount",
        "vehiclesCount",
        "hasStoreHouse",
      ].includes(key),
    );
    const hasStep4Error = errorPaths.some((key) =>
      [
        "trainingAddress",
        "trainingProvider",
        "trainingDays",
        "totalTraineesMale",
        "totalTraineesFemale",
      ].includes(key),
    );
    const hasStep5Error = errorPaths.some((key) =>
      ["manager", "ops", "admin"].some((prefix) => key.startsWith(prefix)),
    );

    if (hasStep1Error) {
      setStep(1);
    } else if (hasStep3Error) {
      setStep(3);
    } else if (hasStep4Error) {
      setStep(4);
    } else if (hasStep5Error) {
      setStep(5);
    }

    const firstError = Object.values(formErrors)?.[0];
    const firstMessage =
      typeof firstError === "object" &&
      firstError !== null &&
      "message" in firstError &&
      typeof (firstError as { message?: unknown }).message === "string"
        ? (firstError as { message: string }).message
        : "Please complete the required fields before submitting.";
    alert(String(firstMessage));
  };

  const steps = [
    { id: 1, title: curT.steps[0], icon: FileText },
    { id: 2, title: curT.steps[1], icon: Upload },
    { id: 3, title: curT.steps[2], icon: Shield },
    { id: 4, title: curT.steps[3], icon: CheckCircle2 },
    { id: 5, title: curT.steps[4], icon: Users },
    { id: 6, title: curT.steps[5], icon: CheckCircle2 },
  ];

  const formLocked =
    isSubmitted || isApplicationBlockingStatus || !canOpenNewApplicationPage;

  if (eligibilityLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <div className="rounded-[32px] border border-gray-100 bg-white p-10 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/5 text-primary">
            <RefreshCw className="h-8 w-8 animate-spin" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-primary">
            Checking application access
          </h2>
          <p className="mt-3 text-sm text-gray-500">
            We are verifying your formal letter approval and latest application
            status.
          </p>
        </div>
      </div>
    );
  }

  if (!canOpenNewApplicationPage && !isSubmitted) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20">
        <div className="rounded-[36px] border border-gray-100 bg-white p-10 shadow-xl sm:p-12">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-amber-600 ring-4 ring-amber-50">
              <AlertCircle className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black uppercase tracking-tighter text-primary">
                {accessBlockedTitle || "Access restricted"}
              </h2>
              <p className="mx-auto max-w-2xl text-sm leading-6 text-gray-600">
                {accessBlockedMessage}
              </p>
            </div>

            {accessBlockedReason === "application" && (
              <div className="rounded-2xl border border-gray-100 bg-gray-50 px-6 py-4 text-left text-sm text-gray-600">
                <p className="font-bold text-primary">Current application</p>
                <p className="mt-1">
                  Status: {latestApplicationStatus || "Unknown"}
                  {latestApplicationDate
                    ? ` • Submitted: ${latestApplicationDate.slice(0, 10)}`
                    : ""}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => (window.location.href = "/dashboard")}
              className="rounded-[24px] bg-primary px-10 py-4 text-sm font-black uppercase tracking-widest text-secondary shadow-xl shadow-primary/20 transition-all hover:scale-105"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 pb-20">
        <div className="bg-white rounded-[40px] shadow-xl p-12 border border-gray-100 space-y-12">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center shadow-lg ring-4 ring-green-50">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-primary uppercase tracking-tighter">
                Application Submitted
              </h2>
              <p className="text-gray-500 max-w-md mx-auto">
                Your application for a new private security agency license has
                been successfully received. A non-editable summary of your
                submission is provided below.
              </p>
            </div>
            <div className="px-6 py-2 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100 flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-ping" />
              <span>Status: Pending Document Verification</span>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          <div className="flex justify-center pt-8">
            <button
              type="button"
              onClick={() => (window.location.href = "/dashboard")}
              className="px-12 py-5 bg-primary text-secondary rounded-[24px] font-black uppercase tracking-widest text-sm hover:shadow-2xl hover:scale-105 transition-all shadow-xl shadow-primary/20"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-3 pb-20 sm:px-4 lg:px-6 xl:px-8 lg:space-y-12">
      {/* Stepper */}
      <div className="relative overflow-x-auto px-1 pb-2 sm:px-4">
        <div className="absolute left-4 right-4 top-1/2 z-0 h-0.5 -translate-y-1/2 bg-gray-200" />
        <div className="relative flex min-w-[720px] items-center justify-between gap-2 sm:min-w-0 sm:gap-0">
          {steps.map((s) => (
            <div
              key={s.id}
              className="relative z-10 flex flex-1 flex-col items-center space-y-2"
            >
              <div
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                  step >= s.id
                    ? "bg-primary text-secondary shadow-lg scale-110"
                    : "bg-white text-gray-400 border-2 border-gray-200"
                }`}
              >
                {step > s.id ? (
                  <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
                ) : (
                  <s.icon className="w-5 h-5 md:w-6 md:h-6" />
                )}
              </div>
              <span
                className={`hidden md:block text-[10px] font-bold uppercase tracking-wider ${step >= s.id ? "text-primary" : "text-gray-400"}`}
              >
                {s.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        className="flex min-h-[600px] flex-col rounded-[28px] border border-gray-100 bg-white p-4 shadow-xl sm:rounded-[32px] sm:p-6 md:rounded-[40px] md:p-10 lg:p-12"
      >
        {submissionError && (
          <div className="mb-6 rounded-[24px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">
            <p className="font-black uppercase tracking-widest text-[11px]">
              Submission blocked
            </p>
            <p className="mt-1 font-medium">{submissionError}</p>
            {submissionError.includes("Fayda ID or Email already exists") && (
              <p className="mt-2 text-xs text-red-600">
                Use a different Fayda ID or email address, or check whether the
                existing personnel record should be updated instead.
              </p>
            )}
            {submissionError.includes(
              "An organization with this name already exists.",
            ) && (
              <p className="mt-2 text-xs text-red-600">
                Change the organization name or verify whether this company has
                already been submitted under a previous application.
              </p>
            )}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-primary">
                  {curT.step1Title}
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
                <div className="md:col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                  <FormInput
                    label={curT.orgName}
                    name="agencyName"
                    register={register}
                    value={watch("agencyName")}
                    error={errors.agencyName}
                    disabled={formLocked}
                    isOpenedForEdit={openedFields.includes("agencyName")}
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(/[^a-zA-Z0-9\s\-\.\,\'\(\)\/\&]/g, "");
                    }}
                  />
                  <FormInput
                    label={curT.orgNameAmharic}
                    name="agencyNameAmharic"
                    register={register}
                    value={watch("agencyNameAmharic")}
                    error={errors.agencyNameAmharic}
                    disabled={formLocked}
                    isOpenedForEdit={openedFields.includes("agencyNameAmharic")}
                    onChange={(e) => {
                     e.target.value = e.target.value.replace(/[^\u1200-\u137F\s\-\.\,\'\(\)\/\&]/g, "");
                    }}
                  />
                </div>

                <section className="md:col-span-2 rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm space-y-5">
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-primary uppercase tracking-widest">
                      {curT.headOfficeAddress || "Head Office Address"}
                    </h4>
                    <p className="text-xs text-gray-500">
                      Primary office location used for the application record.
                    </p>
                  </div>

                  <LocationFields
                    register={register}
                    errors={errors}
                    watch={watch}
                    isFormLocked={formLocked}
                    openedFields={openedFields}
                    setValue={setValue}
                    curT={curT}
                    isAm={isAm}
                  />

                  <FormInput
                    label={curT.specialLocation}
                    name="specialLocation"
                    register={register}
                    value={watch("specialLocation")}
                    error={errors.specialLocation}
                    required={false}
                    disabled={formLocked}
                    isOpenedForEdit={openedFields.includes("specialLocation")}
                  />
                </section>

                <div className="md:col-span-2 space-y-4 rounded-[24px] border border-dashed border-primary/20 bg-primary/5 p-4 sm:rounded-[28px] sm:p-5 lg:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="text-sm font-black text-primary uppercase tracking-widest">
                        {curT.branchAddresses}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {curT.branchAddressDesc}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={formLocked || !canAppendBranchAddress}
                      onClick={() => {
                        if (!canAppendBranchAddress) {
                          alert(
                            "Please complete the current branch address before adding another one.",
                          );
                          return;
                        }

                        appendBranchAddress({
                          region: "",
                          zone: "",
                          woreda: "",
                          kebeleId: "",
                          houseNumber: "",
                          specialLocation: "",
                        });
                      }}
                      className="inline-flex items-center justify-center space-x-2 rounded-xl bg-primary px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:shadow-lg disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{curT.addAddress}</span>
                    </button>
                  </div>

                  {branchAddressFields.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-4 text-xs text-gray-500 sm:p-5">
                      {curT.noBranchAddress}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {branchAddressFields.map((field, index) => (
                        <BranchAddressRow
                          key={field.id}
                          index={index}
                          register={register}
                          errors={errors}
                          watch={watch}
                          setValue={setValue}
                          isFormLocked={formLocked}
                          isRequired={branchAddressFields.length > 0}
                          onRemove={() => removeBranchAddress(index)}
                          isAm={isAm}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center px-1">
                    <label className={`${isAm ? "text-sm" : "text-[11px]"} font-black text-primary uppercase tracking-widest`}>
                      {curT.agencyphone}
                    </label>
                  </div>
                  <input
                    value={watch("agencyphone") || "+251"}
                    onChange={(e) => {
                      let raw = e.target.value;
                      if (!raw.startsWith("+251")) raw = "+251";
                      const digits = raw.slice(4).replace(/\D/g, "");
                      setValue("agencyphone", `+251${digits}`);
                    }}
                    type="tel"
                    disabled={formLocked}
                    className="w-full p-4 transition-all duration-300 outline-none border-2 text-primary font-bold shadow-sm bg-white border-solid border-green-200 shadow-green-500/5 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl"
                  />
                  {errors.agencyphone && (
                    <p className="text-[10px] text-red-500 font-bold ml-2 uppercase tracking-wider flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{(errors.agencyphone as any)?.message}</span>
                    </p>
                  )}
                </div>
                <FormInput
                  label={curT.faxNumber}
                  name="faxNumber"
                  type="text"
                  register={register}
                  value={watch("faxNumber")}
                  error={errors.faxNumber}
                  required={false}
                  disabled={formLocked}
                  isOpenedForEdit={openedFields.includes("faxNumber")}
                />
                <FormInput
                  label={curT.tradeName}
                  name="tradeName"
                  register={register}
                  value={watch("tradeName")}
                  error={errors.tradeName}
                  disabled={formLocked}
                  isOpenedForEdit={openedFields.includes("tradeName")}
                />
                <FormInput
                  label={curT.email}
                  name="email"
                  register={register}
                  value={watch("email")}
                  error={errors.email}
                  disabled={formLocked}
                  isOpenedForEdit={openedFields.includes("email")}
                />

                <FormInput
                  label={curT.tinNumber}
                  name="tinNumber"
                  type="text"
                  inputMode="numeric"
                  register={register}
                  value={watch("tinNumber")}
                  error={errors.tinNumber}
                  disabled={formLocked}
                  isOpenedForEdit={openedFields.includes("tinNumber")}
                  onChange={(e) => {
                    e.target.value = e.target.value.replace(/\D/g, "");
                  }}
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-primary">
                  {curT.step2Title}
                </h3>
                <p className="text-sm text-gray-500">{curT.step2Desc}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: curT.docTradeName, key: "trade_name_designation" },
                  { label: curT.docTradePreReg, key: "trade_pre_registration" },
                  {
                    label: curT.docRenewedLicense,
                    key: "renewed_trade_license",
                  },
                  { label: curT.docLaborSkill, key: "labor_and_skill_bureau" },
                  { label: curT.docTaxpayerClearance, key: "taxpayer_clearance" },
                  { label: curT.docOrgStructure, key: "org_structure" },
                  {
                    label: curT.docArticlesInc,
                    key: "articles_of_incorporation",
                  },
                  { label: curT.docInternalRegs, key: "internal_regulations" },
                  { label: curT.docTechList, key: "tech_list_used", required: false },
                  { label: curT.docCapital, key: "capital" },
                  { label: curT.docInsurance, key: "insurance" },
                ].map((doc) => (
                  <FileUpload
                    key={doc.key}
                    label={doc.label}
                    file={uploadedFiles[doc.key]}
                    onUpload={(file) => handleUpload(doc.key, file)}
                    onDelete={() => handleDelete(doc.key)}
                    onView={handleView}
                    required={doc.required ?? true}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-primary">
                  {curT.step3Title}
                </h3>
                <p className="text-sm text-gray-500">{curT.step3Desc}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={`${isAm ? "text-sm" : "text-xs"} font-black text-primary flex items-center space-x-1.5`}>
                    <span>{curT.capitalAmount}</span>
                    <span className="text-[9px] font-black rounded-md px-1.5 py-0.5 text-red-600 bg-red-50">
                      *
                    </span>
                  </label>
                  <input
                    type="number"
                    {...register("capitalAmount")}
                    disabled={formLocked}
                    min={0}
                    placeholder={
                      isAm ? "የካፒታል መጠን ያስገቡ" : "Enter capital amount"
                    }
                    onInput={(e) => {
                      const el = e.target as HTMLInputElement;
                      const val = parseInt(el.value, 10);
                      if (el.value !== "" && (isNaN(val) || val < 0))
                        el.value = "";
                    }}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.capitalAmount && (
                    <p className="text-red-500 text-[10px]">
                      {String(errors.capitalAmount?.message)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className={`${isAm ? "text-sm" : "text-xs"} font-black text-primary flex items-center space-x-1.5`}>
                    <span>{curT.offices}</span>
                    <span className="text-[9px] font-black rounded-md px-1.5 py-0.5 text-red-600 bg-red-50">
                      *
                    </span>
                  </label>
                  <input
                    type="number"
                    {...register("officesCount")}
                    disabled={formLocked}
                    min={0}
                    placeholder={
                      isAm ? "የቢሮዎች ብዛት ያስገቡ" : "Enter number of offices"
                    }
                    onInput={(e) => {
                      const el = e.target as HTMLInputElement;
                      const val = parseInt(el.value, 10);
                      if (el.value !== "" && (isNaN(val) || val < 0)) {
                        el.value = "";
                      }
                    }}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.officesCount && (
                    <p className="text-red-500 text-[10px]">
                      {String(errors.officesCount?.message)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className={`${isAm ? "text-sm" : "text-xs"} font-black text-primary flex items-center space-x-1.5`}>
                    <span>{curT.storeHouse}</span>
                    <span className="text-[9px] font-black rounded-md px-1.5 py-0.5 text-red-600 bg-red-50">
                      *
                    </span>
                  </label>
                  <select
                    {...register("hasStoreHouse")}
                    disabled={formLocked}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select option</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className={`${isAm ? "text-sm" : "text-xs"} font-black text-primary flex items-center space-x-1.5`}>
                    <span>{curT.computers}</span>
                    <span className="text-[9px] font-black rounded-md px-1.5 py-0.5 text-red-600 bg-red-50">
                      *
                    </span>
                  </label>
                  <input
                    type="number"
                    {...register("computersCount")}
                    disabled={formLocked}
                    min={0}
                    placeholder={
                      isAm ? "የኮምፒውተሮች ብዛት ያስገቡ" : "Enter number of computers"
                    }
                    onInput={(e) => {
                      const el = e.target as HTMLInputElement;
                      const val = parseInt(el.value, 10);
                      if (el.value !== "" && (isNaN(val) || val < 0)) {
                        el.value = "";
                      }
                    }}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.computersCount && (
                    <p className="text-red-500 text-[10px]">
                      {String(errors.computersCount?.message)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className={`${isAm ? "text-sm" : "text-xs"} font-black text-primary flex items-center space-x-1.5`}>
                    <span>{curT.vehicles}</span>
                    <span className="text-[9px] font-black rounded-md px-1.5 py-0.5 text-red-600 bg-red-50">
                      *
                    </span>
                  </label>
                  <input
                    type="number"
                    {...register("vehiclesCount")}
                    disabled={formLocked}
                    min={0}
                    placeholder={
                      isAm ? "የተሸከርካሪዎች ብዛት ያስገቡ" : "Enter number of vehicles"
                    }
                    onInput={(e) => {
                      const el = e.target as HTMLInputElement;
                      const val = parseInt(el.value, 10);
                      if (el.value !== "" && (isNaN(val) || val < 0)) { el.value = ""; }
                    }}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.vehiclesCount && (
                    <p className="text-red-500 text-[10px]">
                      {String(errors.vehiclesCount?.message)}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FileUpload
                  label={curT.docVehicleRent}
                  file={uploadedFiles.vehicle_rent}
                  onUpload={(file) => handleUpload("vehicle_rent", file)}
                  onDelete={() => handleDelete("vehicle_rent")}
                  onView={handleView}
                  isOpenedForEdit={openedFields.includes("vehicle_rent")}
                  disabled={!watch("vehiclesCount") || Number(watch("vehiclesCount")) === 0}
                  infoText="If rented, upload a document showing 1 year paid vehicle rent deal. If owned, upload the vehicle libre (ownership certificate)."
                  infoTextAm="ተሽከርካሪ የተከራየ ከሆነ የ1 አመት የኪራይ ውል ሰነድ ይስቀሉ። የራስ ከሆነ የተሽከርካሪ ሊብሬ (የባለቤትነት ሰርተፍኬት) ይስቀሉ።"
                  required={false}
                />
                <FileUpload
                  label={curT.docHouseRent}
                  file={uploadedFiles.house_rent}
                  onUpload={(file) => handleUpload("house_rent", file)}
                  onDelete={() => handleDelete("house_rent")}
                  onView={handleView}
                  isOpenedForEdit={openedFields.includes("house_rent")}
                  infoText="If rented, upload a document showing 1 year paid house rent deal. If owned, upload the Carta and house plan."
                  infoTextAm="ቤት የተከራየ ከሆነ የ1 አመት የቤት ኪራይ ውል ሰነድ ይስቀሉ። የራስ ከሆነ ካርታ እና የቤት ፕላን ይስቀሉ።"
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-primary">{curT.photoSamples}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FileUpload
                    label={curT.docUniformSample}
                    type="photo"
                    file={uploadedFiles.uniform_sample}
                    onUpload={(file) => handleUpload("uniform_sample", file)}
                    onDelete={() => handleDelete("uniform_sample")}
                    onView={handleView}
                    isOpenedForEdit={openedFields.includes("uniform_sample")}
                    infoText="A photo of the security guard wearing a uniform"
                    infoTextAm="የጥበቃ ሰራተኛ ዩኒፎርም ለብሶ የሚያሳይ ፎቶ"
                  />
                  <FileUpload
                    label={curT.docEmployeeId}
                    type="photo"
                    file={uploadedFiles.id_sample}
                    onUpload={(file) => handleUpload("id_sample", file)}
                    onDelete={() => handleDelete("id_sample")}
                    onView={handleView}
                    isOpenedForEdit={openedFields.includes("id_sample")}
                    infoText="A sample of a serial numbered employee ID card with full details on the front and back."
                    infoTextAm="ተከታታይ ቁጥር ያለው የሰራተኛ መታወቂያ ካርድ ናሙና ከፊት እና ከኋላ ያለውን ሙሉ መረጃ የሚያሳይ"
                  />
                  <FileUpload
                    label={curT.docEmploymentForm}
                    type="photo"
                    file={uploadedFiles.employment_form}
                    onUpload={(file) => handleUpload("employment_form", file)}
                    onDelete={() => handleDelete("employment_form")}
                    onView={handleView}
                    isOpenedForEdit={openedFields.includes("employment_form")}
                  />
                  <FileUpload
                    label={curT.docWarrantyForm}
                    type="photo"
                    file={uploadedFiles.warranty_form}
                    onUpload={(file) => handleUpload("warranty_form", file)}
                    onDelete={() => handleDelete("warranty_form")}
                    onView={handleView}
                    isOpenedForEdit={openedFields.includes("warranty_form")}
                  />
                  <FileUpload
                    label={curT.docLogo}
                    type="photo"
                    file={uploadedFiles.logo}
                    onUpload={(file) => handleUpload("logo", file)}
                    onDelete={() => handleDelete("logo")}
                    onView={handleView}
                    isOpenedForEdit={openedFields.includes("logo")}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-primary">
                  {curT.step4Title}
                </h3>
                <p className="text-sm text-gray-500">{curT.step4Desc}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center space-x-1.5">
                    <span>{curT.trainingAddress}</span>
                    <span className="text-[9px] font-black rounded-md px-1.5 py-0.5 text-amber-700 bg-amber-50">
                      {isAm ? "አማራጭ" : "Optional"}
                    </span>
                  </label>
                  <input
                    {...register("trainingAddress")}
                    disabled={formLocked}
                    placeholder={
                      isAm ? "የስልጠና አድራሻ ያስገቡ" : "Enter training address"
                    }
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center space-x-1.5">
                    <span>
                      {curT.trainingDays} ({isAm ? "አማራጭ" : "Optional"})
                    </span>
                    <span className="text-[9px] font-black rounded-md px-1.5 py-0.5 text-amber-700 bg-amber-50">
                      {isAm ? "አማራጭ" : "Optional"}
                    </span>
                  </label>
                  <input
                    type="number"
                    {...register("trainingDays")}
                    disabled={formLocked}
                    min={1}
                    max={99}
                    placeholder={
                      isAm ? "የቀናት ብዛት ያስገቡ" : "Enter number of days"
                    }
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                    onInput={(e) => {
                      const el = e.target as HTMLInputElement;
                      const val = parseInt(el.value, 10);
                      if (el.value !== "" && (isNaN(val) || val <= 0)) {
                        el.value = "";
                        return;
                      }
                      if (val > 99) el.value = "99";
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center space-x-1.5">
                    <span>
                      {curT.trainingMale} ({isAm ? "አማራጭ" : "Optional"})
                    </span>
                    <span className="text-[9px] font-black rounded-md px-1.5 py-0.5 text-amber-700 bg-amber-50">
                      {isAm ? "አማራጭ" : "Optional"}
                    </span>
                  </label>
                  <input
                    type="number"
                    {...register("totalTraineesMale")}
                    disabled={formLocked}
                    min={1}
                    max={99}
                    placeholder={
                      isAm ? "የወንዶች ብዛት ያስገቡ" : "Enter number of males"
                    }
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                    onInput={(e) => {
                      const el = e.target as HTMLInputElement;
                      const val = parseInt(el.value, 10);
                      if (el.value !== "" && (isNaN(val) || val <= 0)) {
                        el.value = "";
                        return;
                      }
                      if (val > 99) el.value = "99";
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center space-x-1.5">
                    <span>
                      {curT.trainingFemale} ({isAm ? "አማራጭ" : "Optional"})
                    </span>
                    <span className="text-[9px] font-black rounded-md px-1.5 py-0.5 text-amber-700 bg-amber-50">
                      {isAm ? "አማራጭ" : "Optional"}
                    </span>
                  </label>
                  <input
                    type="number"
                    {...register("totalTraineesFemale")}
                    disabled={formLocked}
                    min={0}
                    max={999}
                    placeholder={
                      isAm ? "የሴቶች ብዛት ያስገቡ" : "Enter number of females"
                    }
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                    onInput={(e) => {
                      const el = e.target as HTMLInputElement;
                      const val = parseInt(el.value, 10);
                      if (el.value !== "" && (isNaN(val) || val < 0)) {
                        el.value = "";
                        return;
                      }
                      if (val > 999) el.value = "999";
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center space-x-1.5">
                    <span>
                      {curT.trainingMaleUntrained} ({isAm ? "አማራጭ" : "Optional"})
                    </span>
                    <span className="text-[9px] font-black rounded-md px-1.5 py-0.5 text-amber-700 bg-amber-50">
                      {isAm ? "አማራጭ" : "Optional"}
                    </span>
                  </label>
                  <input
                    type="number"
                    {...register("totalMaleUntrained")}
                    disabled={formLocked}
                    min={0}
                    placeholder={
                      isAm ? "ያልሰለጠኑ ወንዶች ብዛት ያስገቡ" : "Enter males not trained"
                    }
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                    onInput={(e) => {
                      const el = e.target as HTMLInputElement;
                      const val = parseInt(el.value, 10);
                      if (el.value !== "" && (isNaN(val) || val < 0)) {
                        el.value = "";
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center space-x-1.5">
                    <span>
                      {curT.trainingFemaleUntrained} ({isAm ? "አማራጭ" : "Optional"})
                    </span>
                    <span className="text-[9px] font-black rounded-md px-1.5 py-0.5 text-amber-700 bg-amber-50">
                      {isAm ? "አማራጭ" : "Optional"}
                    </span>
                  </label>
                  <input
                    type="number"
                    {...register("totalFemaleUntrained")}
                    disabled={formLocked}
                    min={0}
                    placeholder={
                      isAm ? "ያልሰለጠኑ ሴቶች ብዛት ያስገቡ" : "Enter females not trained"
                    }
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                    onInput={(e) => {
                      const el = e.target as HTMLInputElement;
                      const val = parseInt(el.value, 10);
                      if (el.value !== "" && (isNaN(val) || val < 0)) {
                        el.value = "";
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center space-x-1.5">
                    <span>{curT.trainingProvider}</span>
                    <span className="text-[9px] font-black rounded-md px-1.5 py-0.5 text-amber-700 bg-amber-50">
                      {isAm ? "አማራጭ" : "Optional"}
                    </span>
                  </label>
                  <input
                    {...register("trainingProvider")}
                    disabled={formLocked}
                    placeholder={
                      isAm ? "የስልጠና ሰጪ አካል ያስገቡ" : "Enter training provider"
                    }
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <FileUpload
                    label={curT.docTrainingManual}
                    file={uploadedFiles.training_manual}
                    onUpload={(file) => handleUpload("training_manual", file)}
                    onDelete={() => handleDelete("training_manual")}
                    onView={handleView}
                    isOpenedForEdit={openedFields.includes("training_manual")}
                  />
                </div>
                <div className="md:col-span-2">
                  <FileUpload
                    label={curT.docTrainingCert}
                    required={false}
                    file={uploadedFiles.training_cert}
                    onUpload={(file) => handleUpload("training_cert", file)}
                    onDelete={() => handleDelete("training_cert")}
                    onView={handleView}
                    isOpenedForEdit={openedFields.includes("training_cert")}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              {/* Step Header */}
              <div className="bg-primary/5 p-8 rounded-[32px] border border-primary/10 relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-3xl font-black text-primary uppercase tracking-tight">
                    {curT.step5Title || "Personnel Details"}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium mt-2 max-w-2xl">
                    {curT.step5Desc ||
                      "Please provide the identification and required documentation for the key management personnel."}
                  </p>
                </div>
                <Users className="absolute right-[-20px] bottom-[-20px] w-48 h-48 text-primary/5 -rotate-12" />
              </div>

              <div className="space-y-16">
                {/* 1. Manager Section */}
                <PersonnelSection
                  title="General Manager"
                  prefix="manager"
                  currentUser={managerProfile}
                  register={register}
                  errors={errors}
                  setValue={setValue} // Passing setValue for location resets
                  watch={watch}
                  isFormLocked={formLocked}
                  positions={positions}
                  positionEducationOptions={positionEducationOptions}
                  onPositionChange={fetchPositionRequirements}
                  files={uploadedFiles}
                  onUpload={handleUpload}
                  onDelete={handleDelete}
                  onView={handleView}
                  curT={curT}
                  isAm={isAm}
                />

                {/* 2. Operations Head Section */}
                <div className="relative py-4">
                  <div
                    className="absolute inset-0 flex items-center"
                    aria-hidden="true"
                  >
                    <div className="w-full border-t border-dashed border-gray-200"></div>
                  </div>
                </div>

                <PersonnelSection
                  title="Operations Head"
                  prefix="ops"
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  watch={watch}
                  isFormLocked={formLocked}
                  positions={positions}
                  positionEducationOptions={positionEducationOptions}
                  onPositionChange={fetchPositionRequirements}
                  files={uploadedFiles}
                  onUpload={handleUpload}
                  onDelete={handleDelete}
                  onView={handleView}
                  curT={curT}
                  isAm={isAm}
                />

                {/* 3. Administration Head Section */}
                <div className="relative py-4">
                  <div
                    className="absolute inset-0 flex items-center"
                    aria-hidden="true"
                  >
                    <div className="w-full border-t border-dashed border-gray-200"></div>
                  </div>
                </div>

                <PersonnelSection
                  title="Administration Head"
                  prefix="admin"
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  watch={watch}
                  isFormLocked={formLocked}
                  positions={positions}
                  positionEducationOptions={positionEducationOptions}
                  onPositionChange={fetchPositionRequirements}
                  files={uploadedFiles}
                  onUpload={handleUpload}
                  onDelete={handleDelete}
                  onView={handleView}
                  curT={curT}
                  isAm={isAm}
                />
              </div>

              {/* Form Navigation/Status Hint */}
              {!formLocked && (
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start space-x-3">
                  <ShieldCheck className="w-5 h-5 text-amber-600 mt-0.5" />
                  <p className="text-xs text-amber-700 leading-relaxed">
                    <strong>Note:</strong> Ensure all uploaded documents are
                    clear and legible. The Fayda ID and Phone number must be
                    active for verification purposes.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {step === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-primary uppercase tracking-tighter">
                    {curT.step6Title}
                  </h3>
                  <p className="text-gray-500 max-w-md">{curT.step6Desc}</p>
                </div>
                <div className="px-6 py-3 bg-amber-50 text-amber-600 rounded-2xl flex items-center space-x-3 border border-amber-100 shadow-sm">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                    Draft Mode: Review & Edit
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {/* 1. Agency Info */}
                <section className="bg-gray-50/50 rounded-[32px] border border-gray-100 overflow-hidden">
                  <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-primary">
                      <Shield className="w-5 h-5" />
                      <h4 className="font-black text-xs uppercase tracking-widest">
                        {curT.steps[0]}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-2 bg-primary/5 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-6">
                    {[
                      {
                        label: "Organization Name (English)",
                        value: watch("agencyName") || "-",
                      },
                      {
                        label: "Organization Name (Amharic)",
                        value: watch("agencyNameAmharic") || "-",
                      },
                      {
                        label: "Branch Addresses",
                        value:
                          (watch("branchAddresses") || []).length > 0
                            ? `${(watch("branchAddresses") || []).length} added`
                            : "-",
                      },
                      { label: curT.agencyphone, value: watch("agencyphone") },
                      { label: curT.email, value: watch("email") },
                      {
                        label: curT.region,
                        value: getLocationLabel(
                          locationLookup.regions,
                          watch("region"),
                        ),
                      },
                      {
                        label: curT.zone,
                        value: getLocationLabel(
                          locationLookup.zones,
                          watch("zone"),
                        ),
                      },
                      {
                        label: curT.woreda,
                        value: getLocationLabel(
                          locationLookup.woredas,
                          watch("woreda"),
                        ),
                      },
                      {
                        label: curT.kebele,
                        value: getLocationLabel(
                          locationLookup.kebeles,
                          watch("kebele"),
                        ),
                      },
                      { label: curT.houseNo, value: watch("houseNumber") },
                      { label: curT.tradeName, value: watch("tradeName") },
                      {
                        label: "Special Location",
                        value: watch("specialLocation") || "-",
                      },
                    ].map((item, i) => (
                      <div key={i} className="space-y-1">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                          {item.label}
                        </p>
                        <p className="text-sm font-bold text-primary truncate">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 2. Documents */}
                <section className="bg-gray-50/50 rounded-[32px] border border-gray-100 overflow-hidden">
                  <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-blue-600">
                      <FileText className="w-5 h-5" />
                      <h4 className="font-black text-xs uppercase tracking-widest">
                        {curT.steps[1]}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                    >
                      Edit Documents
                    </button>
                  </div>
                  <div className="p-8 space-y-6">
                    {(watch("branchAddresses") || []).length > 0 && (
                      <div className="space-y-4">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                          Branch Addresses
                        </p>
                        {(watch("branchAddresses") || []).map(
                          (branch: any, index: number) => {
                            const regionCacheKey = `branch:${index}:region:${branch?.region ?? ""}`;
                            const zoneCacheKey = `branch:${index}:zone:${branch?.zone ?? ""}`;
                            const woredaCacheKey = `branch:${index}:woreda:${branch?.woreda ?? ""}`;
                            const kebeleCacheKey = `branch:${index}:kebele:${branch?.kebeleId ?? ""}`;

                            const branchRegionName =
                              reviewLocationLabels[regionCacheKey] || "-";
                            const branchZoneName =
                              reviewLocationLabels[zoneCacheKey] || "-";
                            const branchWoredaName =
                              reviewLocationLabels[woredaCacheKey] || "-";
                            const branchKebeleName =
                              reviewLocationLabels[kebeleCacheKey] || "-";

                            return (
                              <div
                                key={index}
                                className="p-4 bg-white border border-gray-100 rounded-2xl space-y-3"
                              >
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                                  Branch #{index + 1}
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  {[
                                    {
                                      label: "Region",
                                      value: branchRegionName,
                                    },
                                    {
                                      label: "Zone",
                                      value: branchZoneName,
                                    },
                                    {
                                      label: "Woreda",
                                      value: branchWoredaName,
                                    },
                                    {
                                      label: "Kebele",
                                      value: branchKebeleName,
                                    },
                                  ].map((item) => (
                                    <div key={item.label} className="space-y-1">
                                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                                        {item.label}
                                      </p>
                                      <p className="text-sm font-bold text-primary truncate">
                                        {item.value}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                                <p className="text-xs text-gray-600">
                                  {branch?.houseNumber || "No house no"}
                                  {branch?.specialLocation
                                    ? `, ${branch.specialLocation}`
                                    : ""}
                                </p>
                              </div>
                            );
                          },
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(uploadedFiles)
                        .filter(
                          ([key]) =>
                            ![
                              "vehicle_rent",
                              "house_rent",
                              "uniform_sample",
                              "id_sample",
                              "employment_form",
                              "warranty_form",
                              "logo",
                              "training_manual",
                              "training_cert",
                            ].some((k) => key.includes(k)) &&
                            !["manager", "ops", "admin"].some((k) =>
                              key.startsWith(k),
                            ),
                        )
                        .map(([key, file]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl group hover:border-blue-200 transition-all"
                          >
                            <div className="flex items-center space-x-3 min-w-0">
                              <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest truncate">
                                  {key.replace(/_/g, " ")}
                                </p>
                                <p className="text-[10px] font-bold text-primary truncate max-w-[150px]">
                                  {file?.name}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => file && handleView(file, null)}
                              className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                </section>

                {/* 3. Assets */}
                <section className="bg-gray-50/50 rounded-[32px] border border-gray-100 overflow-hidden">
                  <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-amber-600">
                      <CreditCard className="w-5 h-5" />
                      <h4 className="font-black text-xs uppercase tracking-widest">
                        {curT.steps[2]} & {curT.steps[3]}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 hover:text-white transition-all"
                    >
                      Edit Assets
                    </button>
                  </div>
                  <div className="p-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                      {[
                        { label: "Offices", value: watch("officesCount") },
                        { label: "Computers", value: watch("computersCount") },
                        { label: "Vehicles", value: watch("vehiclesCount") },
                        {
                          label: "Store House",
                          value:
                            watch("hasStoreHouse") === true ||
                            watch("hasStoreHouse") === "true"
                              ? "Yes"
                              : "No",
                        },

                        {
                          label: "Training Address",
                          value: watch("trainingAddress"),
                        },
                        {
                          label: "Number of Days Trained",
                          value: watch("trainingDays"),
                        },
                        {
                          label: "Number of Males Trained",
                          value: watch("totalTraineesMale"),
                        },
                        {
                          label: "Number of Females Trained",
                          value: watch("totalTraineesFemale"),
                        },

                        {
                          label: "Training Provider Body",
                          value: watch("trainingProvider"),
                        },
                      ].map((item, i) => (
                        <div key={i} className="space-y-1">
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            {item.label}
                          </p>
                          <p className="text-sm font-bold text-primary">
                            {item.value || "0"}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        "vehicle_rent",
                        "house_rent",
                        "uniform_sample",
                        "id_sample",
                        "logo",
                      ].map(
                        (key) =>
                          uploadedFiles[key] && (
                            <div
                              key={key}
                              className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl"
                            >
                              <div className="flex items-center space-x-3 min-w-0">
                                <div className="p-2 bg-amber-50 text-amber-500 rounded-lg">
                                  <Eye className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest truncate">
                                    {key.replace(/_/g, " ")}
                                  </p>
                                  <p className="text-[10px] font-bold text-primary truncate">
                                    {uploadedFiles[key]?.name}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  uploadedFiles[key] &&
                                  handleView(uploadedFiles[key]!, null)
                                }
                                className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-amber-600 hover:text-white transition-all"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          ),
                      )}
                    </div>
                  </div>
                </section>

                {/* 4. Personnel */}
                <section className="bg-gray-50/50 rounded-[32px] border border-gray-100 overflow-hidden">
                  <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-purple-600">
                      <Users className="w-5 h-5" />
                      <h4 className="font-black text-xs uppercase tracking-widest">
                        {curT.steps[4]}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(5)}
                      className="px-4 py-2 bg-purple-50 text-purple-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all"
                    >
                      Edit Personnel
                    </button>
                  </div>
                  <div className="p-8">
                    <div className="grid grid-cols-1 gap-8">
                      {["manager", "ops", "admin"].map((prefix) => {
                        const titles: Record<string, string> = {
                          manager: "General Manager",
                          ops: "Operations Head",
                          admin: "Admin Head",
                        };
                        const personnelData = watch(prefix);
                        return (
                          <div
                            key={prefix}
                            className="space-y-4 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm"
                          >
                            {/* Header with Name and Title */}
                            <div className="pb-4 border-b border-gray-100">
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
                                {titles[prefix]}
                              </p>
                              <p className="text-lg font-black text-primary uppercase">
                                {personnelData?.fullName || "NOT PROVIDED"}
                              </p>
                            </div>

                            {/* Personnel Details Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                              {[
                                { label: "Email", value: personnelData?.email },
                                { label: "Phone", value: personnelData?.phone },
                                {
                                  label: "Fayda ID",
                                  value: personnelData?.faydaId,
                                },
                                {
                                  label: "Gender",
                                  value: personnelData?.gender,
                                },
                                {
                                  label: "Citizenship",
                                  value: personnelData?.citizenship,
                                },
                              ].map((item, i) => (
                                <div key={i}>
                                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">
                                    {item.label}
                                  </p>
                                  <p className="text-sm font-bold text-primary">
                                    {item.value || "-"}
                                  </p>
                                </div>
                              ))}
                            </div>

                            {/* Location Details */}
                            <div className="pt-4 border-t border-gray-100">
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">
                                Residential Address
                              </p>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {[
                                  {
                                    label: "Region",
                                    value: getCachedLocationLabel(
                                      locationLookup.regions,
                                      personnelData?.region,
                                      `${prefix}:region:${personnelData?.region ?? ""}`,
                                    ),
                                  },
                                  {
                                    label: "Zone",
                                    value: getCachedLocationLabel(
                                      locationLookup.zones,
                                      personnelData?.zone,
                                      `${prefix}:zone:${personnelData?.zone ?? ""}`,
                                    ),
                                  },
                                  {
                                    label: "Woreda",
                                    value: getCachedLocationLabel(
                                      locationLookup.woredas,
                                      personnelData?.woreda,
                                      `${prefix}:woreda:${personnelData?.woreda ?? ""}`,
                                    ),
                                  },
                                  {
                                    label: "Kebele",
                                    value: getCachedLocationLabel(
                                      locationLookup.kebeles,
                                      personnelData?.kebele,
                                      `${prefix}:kebele:${personnelData?.kebele ?? ""}`,
                                    ),
                                  },
                                  {
                                    label: "House No",
                                    value: personnelData?.houseNo,
                                  },
                                ].map((item, i) => (
                                  <div key={i}>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">
                                      {item.label}
                                    </p>
                                    <p className="text-sm font-bold text-primary">
                                      {item.value || "-"}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Position & Experience */}
                            <div className="pt-4 border-t border-gray-100">
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">
                                Position & Experience
                              </p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                  {
                                    label: "Position",
                                    value:
                                      positions.find(
                                        (position) =>
                                          position.id ===
                                          Number(personnelData?.positionId),
                                      )?.name || personnelData?.positionId,
                                  },
                                  {
                                    label: "Education Level",
                                    value: personnelData?.educationLevel,
                                  },
                                  {
                                    label: "Work Experience",
                                    value: personnelData?.workExpYears,
                                  },
                                  {
                                    label: "Total Experience",
                                    value: personnelData?.TotalExpYears,
                                  },
                                ].map((item, i) => (
                                  <div key={i}>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">
                                      {item.label}
                                    </p>
                                    <p className="text-sm font-bold text-primary">
                                      {item.value ?? "-"}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Documents Section */}
                            <div className="pt-4 border-t border-gray-100">
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">
                                Documents
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                  `${prefix}_fingerprint_doc`,
                                  `${prefix}_medical_doc`,
                                  `${prefix}_training_doc`,
                                  `${prefix}_support_doc`,
                                  `${prefix}_collateral_doc`,
                                  `${prefix}_experience_doc`,
                                  `${prefix}_resignation_letter_doc`,
                                  `${prefix}_education_doc`,
                                  `${prefix}_passport_or_kabele_doc`,
                                  `${prefix}_organization_Id_doc`,
                                ].map((key) =>
                                  uploadedFiles[key] ? (
                                    <div
                                      key={key}
                                      className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-lg"
                                    >
                                      <div className="flex items-center space-x-2 min-w-0">
                                        <div className="p-1 bg-purple-50 text-purple-500 rounded">
                                          <FileText className="w-3 h-3" />
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest truncate">
                                            {key.replace(/_/g, " ")}
                                          </p>
                                          <p className="text-[9px] font-bold text-primary truncate">
                                            {uploadedFiles[key]?.name}
                                          </p>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          uploadedFiles[key] &&
                                          handleView(uploadedFiles[key]!, null)
                                        }
                                        className="p-1 bg-gray-100 text-gray-400 rounded hover:bg-purple-600 hover:text-white transition-all flex-shrink-0"
                                      >
                                        <Eye className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ) : (
                                    <div
                                      key={key}
                                      className="text-[9px] text-gray-400"
                                    >
                                      {key.replace(/_/g, " ")} - Not uploaded
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>

                {/* Guards Recruitment Criteria removed per request */}
              </div>

              <div className="p-8 bg-primary/5 rounded-[40px] border-2 border-dashed border-primary/20 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-white text-primary rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3">
                  <Shield className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h5 className="text-xl font-black text-primary uppercase tracking-tight">
                    {isAm ? "ለመጨረሻ ማቅረቢያ ዝግጁ ነዎት?" : "Ready for Final Submission?"}
                  </h5>
                  <p className="text-xs text-gray-500 max-w-lg mx-auto">
                    {isAm
                      ? "በማስገባት፣ ከላይ ያለው መረጃ ሁሉ እውነት መሆኑን እና በፌደራል ፖሊስ የቦታ ጉብኝት ወቅት ለማረጋገጥ ሁሉንም ዋና ሰነዶች እንደያዙ ያረጋግጣሉ።"
                      : "By submitting, you certify that all information above is true and that you possess all original documents for verification during the Federal Police site visit."}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-auto flex flex-col-reverse gap-3 pt-8 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pt-12">
          <button
            type="button"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="flex w-full items-center justify-center space-x-2 rounded-2xl px-6 py-4 font-bold text-gray-500 transition-all hover:bg-gray-100 disabled:opacity-0 sm:w-auto sm:px-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{curT.back}</span>
          </button>
          {step === 6 ? (
            <button
              type="submit"
              disabled={isSubmitting}
              className="blue-gradient flex w-full items-center justify-center space-x-2 rounded-2xl px-8 py-4 font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-2xl sm:w-auto sm:px-10"
            >
              <span>{isSubmitting ? curT.processing : curT.submit}</span>
              {!isSubmitting && <ArrowRight className="w-5 h-5" />}
            </button>
          ) : (
            <button
              type="button"
              onClick={nextStep}
              className="blue-gradient flex w-full items-center justify-center space-x-2 rounded-2xl px-8 py-4 font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-2xl sm:w-auto sm:px-10"
            >
              <span>
                {step === 5
                  ? language === "am"
                    ? "ባለሙያ ግምገማ"
                    : "Review Application"
                  : curT.continue}
              </span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      <AnimatePresence>
        <ViewerModal
          isOpen={viewerState.isOpen}
          onClose={() => setViewerState((prev) => ({ ...prev, isOpen: false }))}
          file={viewerState.file}
          previewUrl={viewerState.url}
        />
      </AnimatePresence>
    </div>
  );
};
