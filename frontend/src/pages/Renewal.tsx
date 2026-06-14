//filepath: frontend/src/pages/Renewal.tsx
import React from "react";
import { useLanguage } from "../context/LanguageContext";
import {
  CheckCircle2,
  FileText,
  Upload,
  Shield,
  Users,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  Eye,
  RefreshCw,
  ChevronDown,
  X,
  AlertCircle,
  Trash2,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "../lib/utils";
import { mapLocalizedLocationRows } from "../lib/locationLabels";
import { apiRequest, ApiError } from "../lib/api";

const renewalSchema = z.object({
  certificateSerialNumber: z
    .string()
    .min(1, "Certificate serial number is required"),
  region: z.string().optional(),
  zone: z.string().optional(),
  woreda: z.string().optional(),
  kebele: z.string().optional(),
  houseNumber: z.string().optional(),
  userContract: z.string().optional(),
  specialLocation: z.string().optional(),
  trainingPlace: z.string().optional(),
  trainingProvider: z.string().optional(),
  trainingDays: z.string().optional(),
  trainedMale: z.string().optional(),
  trainedFemale: z.string().optional(),
  notTrainedMale: z.string().optional(),
  notTrainedFemale: z.string().optional(),
  offices: z.string().optional(),
  capitalAmount: z.string().optional(),
  storeHouse: z.string().optional(),
  computers: z.string().optional(),
  vehicles: z.string().optional(),
  grade3to9Male: z.string().optional(),
  grade3to9Female: z.string().optional(),
  grade10to12Male: z.string().optional(),
  grade10to12Female: z.string().optional(),
  certificateMale: z.string().optional(),
  certificateFemale: z.string().optional(),
  diplomaMale: z.string().optional(),
  diplomaFemale: z.string().optional(),
  degreeMale: z.string().optional(),
  degreeFemale: z.string().optional(),
  secondDegreeMale: z.string().optional(),
  secondDegreeFemale: z.string().optional(),
  assignedPersonnelCount: z.string().optional(),
  hiredCount: z.string().optional(),
});

type RenewalFormValues = z.infer<typeof renewalSchema>;

type RenewalPolicyInfo = {
  renewalYear: number;
  issueDate: string;
  expiryDate: string;
  earliestSubmitDate: string;
  canSubmit: boolean;
};

const formatPolicyDate = (value: string, language: "en" | "am") => {
  const parsed = new Date(value);
  const calendar = new Date(
    parsed.getUTCFullYear(),
    parsed.getUTCMonth(),
    parsed.getUTCDate(),
  );
  return calendar.toLocaleDateString(language === "am" ? "am-ET" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getRenewalErrorCode = (error: unknown): string | undefined => {
  if (error instanceof ApiError) return error.code;
  if (error && typeof error === "object" && "code" in error) {
    return String((error as { code?: string }).code);
  }
  return undefined;
};

const mapRenewalEligibilityError = (
  message: string,
  language: "en" | "am",
  code?: string,
): string => {
  switch (code) {
    case "CERTIFICATE_NOT_FOUND":
      return language === "am"
        ? "በዚህ ተከታታይ ቁጥር ምስክር አልተገኘም። በፈቃድዎ ላይ ያለውን ቁጥር ያረጋግጡ።"
        : "No certificate was found with this serial number. Check the number printed on your license document.";
    case "CERTIFICATE_NOT_LINKED":
      return language === "am"
        ? "ይህ ምስክር ከድርጅት ጋር አልተገናኘም። ድጋፍ ለማግኘት EFP-PSOን ያግኙ።"
        : "This certificate is not linked to an organization. Contact EFP-PSO support.";
    case "NO_ORGANIZATION":
      return language === "am"
        ? "መለያዎ ከተፈቀደ ድርጅት ጋር አልተገናኘም። እድሳት ከመቀጠልዎ በፊት የፈቃድ ማመልከቻዎን ያጠናቅቁ።"
        : "Your account is not linked to a licensed organization. Complete your license application before renewing.";
    case "CERTIFICATE_NOT_OWNED":
      return language === "am"
        ? "ይህ የምስክር ቁጥር ለድርጅትዎ አይደለም። የራስዎን ንቁ ፈቃድ ቁጥር ያስገቡ።"
        : "This certificate does not belong to your organization. Enter the serial number from your own license.";
    case "ORGANIZATION_INACTIVE":
      return language === "am"
        ? "ድርጅትዎ ንቁ አይደለም። እድሳት ከመቀጠልዎ በፊት EFP-PSOን ያግኙ።"
        : "Your organization is not active. Contact EFP-PSO support before renewing.";
    case "CERTIFICATE_INACTIVE":
      return language === "am"
        ? "ምስክርዎ ጊዜው አልፏል ወይም ንቁ አይደለም። EFP-PSOን ያግኙ።"
        : "Your certificate is expired or inactive. Contact EFP-PSO support.";
    case "RENEWAL_ALREADY_SUBMITTED":
      return language === "am"
        ? "ለዚህ የቀን መቁጠሪያ ዓመት አስቀድመው የእድሳት ማመልከቻ አስገብተዋል። በአንድ ዓመት አንድ ማመልከቻ ብቻ ይፈቀዳል።"
        : "You have already submitted a renewal application for this calendar year.";
    case "RENEWAL_TOO_EARLY":
      return language === "am"
        ? "እድሳት በምስክርዎ የሚያበቃበት ወራት ውስጥ ብቻ ሊቀርብ ይችላል።"
        : "Renewal opens in the final month before your certificate expires.";
    case "AUTHENTICATION_REQUIRED":
      return language === "am"
        ? "እባክዎ ወደ መለያዎ ይግቡ እና እንደገና ይሞክሩ።"
        : "Please sign in to your account and try again.";
    default:
      break;
  }

  const lower = message.toLowerCase();

  if (
    lower.includes("validity period") ||
    lower.includes("earliest date") ||
    lower.includes("11 months")
  ) {
    const dateMatch = message.match(/(\d{4}-\d{2}-\d{2})/);
    const dateLabel = dateMatch
      ? formatPolicyDate(dateMatch[1], language)
      : null;
    return language === "am"
      ? dateLabel
        ? `እድሳት በምስክርዎ የሚያበቃበት ወራት ውስጥ ብቻ ሊቀርብ ይችላል። የመጀመሪያ ቀን፡ ${dateLabel}።`
        : "እድሳት በምስክርዎ የሚያበቃበት ወራት ውስጥ ብቻ ሊቀርብ ይችላል።"
      : dateLabel
        ? `Renewal opens in the final month before your certificate expires. Earliest date: ${dateLabel}.`
        : "Renewal opens in the final month before your certificate expires.";
  }

  if (
    lower.includes("does not belong") ||
    lower.includes("not belong to your organization")
  ) {
    return language === "am"
      ? "ይህ የምስክር ቁጥር ለድርጅትዎ አይደለም። የራስዎን ንቁ ፈቃድ ቁጥር ያስገቡ።"
      : "This certificate does not belong to your organization. Enter the serial number from your own license.";
  }

  if (lower.includes("no certificate was found") || lower.includes("not found")) {
    return language === "am"
      ? "በዚህ ተከታታይ ቁጥር ምስክር አልተገኘም። በፈቃድዎ ላይ ያለውን ቁጥር ያረጋግጡ።"
      : "No certificate was found with this serial number. Check the number on your license document.";
  }

  if (lower.includes("already been submitted") || lower.includes("per calendar year")) {
    return language === "am"
      ? "ለዚህ የቀን መቁጠሪያ ዓመት አስቀድመው የእድሳት ማመልከቻ አስገብተዋል።"
      : "You have already submitted a renewal application for this calendar year.";
  }

  return message;
};

type ServiceContractEntry = {
  id: number;
  serviceUserName: string;
  assignedPersonnelCount: string;
  region: string;
  zone: string;
  woreda: string;
  kebele: string;
};

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

  React.useEffect(() => {
    if (!isOpen) setRotation(0);
  }, [isOpen]);

  if (!isOpen || !file) return null;

  const isImage = file.type.startsWith("image/");
  const isPDF = file.type === "application/pdf";

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
          {isImage && previewUrl ? (
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full max-h-full object-contain rounded-xl shadow-lg transition-transform duration-300"
                style={{ transform: `rotate(${rotation}deg)` }}
              />
            </div>
          ) : isPDF && previewUrl ? (
            <iframe
              src={`${previewUrl}#toolbar=0`}
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

/* FormInput removed — not used in this file. */

/* FormSelect removed — not used in this file. */
/* FormSelect removed — not used in this file. */

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
        "group relative rounded-[28px] border-2 transition-all duration-500 p-5",
        file
          ? "bg-white border-solid border-green-200 shadow-lg shadow-green-500/5 ring-4 ring-green-50/30"
          : "bg-gray-50/50 border-dashed border-gray-200 hover:border-primary/40 hover:bg-white cursor-pointer hover:shadow-xl",
        isOpenedForEdit &&
          "border-amber-400 bg-amber-50/20 ring-4 ring-amber-50 animate-pulse border-dashed",
      )}
    >
      {file && (
        <div className="absolute -top-3 -right-3 z-10">
          <div className="flex items-center space-x-1.5 bg-green-500 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-green-500/30 border-2 border-white animate-in zoom-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Uploaded</span>
          </div>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        disabled={isDisabled}
        accept={type === "photo" ? "image/*" : ".pdf,.doc,.docx"}
      />

      {infoText && (
        <div className="mb-3 flex flex-col items-start">
          <button
            type="button"
            onClick={() => setShowInfo(!showInfo)}
            className="flex items-center space-x-1 text-[10px] font-black text-amber-700 uppercase tracking-wider hover:text-amber-800 transition-colors"
          >
            <span>{language === "am" ? "ተጨማሪ መረጃ" : "Learn more"}</span>
            <span className={`transition-transform duration-200 ${showInfo ? "rotate-90" : ""}`}>→</span>
          </button>
          {showInfo && (
            <p className="mt-1 text-[10px] text-amber-700 bg-amber-50 rounded-xl px-3 py-2 font-medium w-full">
              {language === "am" && infoTextAm ? infoTextAm : infoText}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-4 text-left">
        <div className="flex items-center space-x-5 flex-1 min-w-0">
          <div
            className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 flex-shrink-0 shadow-sm",
              file
                ? "bg-green-50 text-green-500"
                : "bg-white border text-gray-400 group-hover:scale-105 group-hover:text-primary group-hover:shadow-lg",
            )}
          >
            {isOpenedForEdit ? (
              <RefreshCw className="w-8 h-8 animate-spin-slow text-amber-500" />
            ) : file ? (
              <FileText className="w-8 h-8" />
            ) : type === "photo" ? (
              <Users className="w-8 h-8" />
            ) : (
              <Upload className="w-8 h-8" />
            )}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <h4
              className={cn(
                "font-black text-sm",
                file
                  ? "text-green-600"
                  : "text-primary/70 group-hover:text-primary",
              )}
            >
              {file ? file.name : label}
            </h4>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-[10px] text-gray-400 font-bold">
                {file
                  ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                  : type === "photo"
                    ? "JPG, PNG Max 2MB"
                    : "PDF, DOCX Max 5MB"}
              </span>
              {!file && required && (
                <span className="text-[9px] font-black rounded-md px-1.5 py-0.5 text-red-600 bg-red-50">
                  *
                </span>
              )}
              {!file && !required && (
                <span className="text-[9px] font-black rounded-md px-1.5 py-0.5 text-amber-700 bg-amber-50 uppercase tracking-widest">
                  {language === "am" ? "አማራጭ" : "Optional"}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!file || isOpenedForEdit ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isDisabled}
              className="px-6 py-3 bg-white border-2 border-gray-100 text-primary rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:border-primary hover:shadow-lg transition-all active:scale-95 whitespace-nowrap"
            >
              Select File
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => onView(file, previewUrl)}
                className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
              >
                <Eye className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => onDelete()}
                className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
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
      <label className="text-[11px] font-black text-gray-500 flex items-center space-x-1.5">
        <span>{label}</span>
        <span className="text-[9px] font-black rounded-md px-1.5 py-0.5 text-red-600 bg-red-50">*</span>
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
          "w-full p-4 pr-12 rounded-2xl border-2 text-left flex items-center justify-between gap-3 transition-all relative",
          disabled
            ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-white border-gray-200 hover:border-primary focus:border-primary",
        )}
      >
        <span
          className={cn(
            "whitespace-normal break-words",
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
              className="w-full bg-transparent outline-none text-sm text-primary font-bold placeholder:text-gray-400"
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
                No matching options
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const Renewal = () => {
  const { language } = useLanguage();
  const [step, setStep] = React.useState(1);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [isCheckingEligibility, setIsCheckingEligibility] =
    React.useState(false);
  const [eligibilityError, setEligibilityError] = React.useState<string | null>(
    null,
  );
  const [eligibleOrganization, setEligibleOrganization] = React.useState<{
    id: number;
    nameEnglish: string;
    nameAmharic: string;
    status: string;
  } | null>(null);
  const [, setRenewalPolicy] =
    React.useState<RenewalPolicyInfo | null>(null);
  const [appStatus] = React.useState<
    "draft" | "pending" | "reviewing" | "correction"
  >("draft");
  // Mock admin opened fields (not used in current UI)
  const [uploadedFiles, setUploadedFiles] = React.useState<
    Record<string, File | null>
  >({});
  const [serviceContracts, setServiceContracts] = React.useState<
    ServiceContractEntry[]
  >([
    {
      id: 1,
      serviceUserName: "",
      assignedPersonnelCount: "",
      region: "",
      zone: "",
      woreda: "",
      kebele: "",
    },
  ]);

  const [branchAddresses, setBranchAddresses] = React.useState<
    { id: number; region: string; zone: string; woreda: string; kebele: string; houseNumber: string; specialLocation: string }[]
  >([]);

  const addBranchAddress = () => {
    setBranchAddresses((prev) => [
      ...prev,
      { id: Date.now(), region: "", zone: "", woreda: "", kebele: "", houseNumber: "", specialLocation: "" },
    ]);
  };

  const removeBranchAddress = (id: number) => {
    setBranchAddresses((prev) => prev.filter((b) => b.id !== id));
  };

  const updateBranchAddress = (id: number, field: string, value: string) => {
    setBranchAddresses((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b)),
    );
  };

  // Location lookup caches (regions -> zones -> woredas -> kebeles)
  const [regionsList, setRegionsList] = React.useState<any[]>([]);
  const [zonesByRegion, setZonesByRegion] = React.useState<
    Record<string, any[]>
  >({});
  const [woredasByZone, setWoredasByZone] = React.useState<
    Record<string, any[]>
  >({});
  const [kebelesByWoreda, setKebelesByWoreda] = React.useState<
    Record<string, any[]>
  >({});

  React.useEffect(() => {
    let mounted = true;
    apiRequest<any>("/location/regions")
      .then((res) => {
        if (!mounted) return;
        const rows = res.data || res || [];
        setRegionsList(mapLocalizedLocationRows(rows, language));
      })
      .catch(() => {
        if (!mounted) return;
        setRegionsList([]);
      });
    return () => {
      mounted = false;
    };
  }, [language]);

  const loadZonesForRegion = async (regionId: string | number) => {
    if (!regionId) return;
    const key = String(regionId);
    if (zonesByRegion[key]) return;
    try {
      const res = await apiRequest<any>(`/location/regions/${regionId}/zones`);
      const rows = res.data || res || [];
      setZonesByRegion((prev) => ({
        ...prev,
        [key]: mapLocalizedLocationRows(rows, language),
      }));
    } catch (e) {
      // ignore
    }
  };

  const loadWoredasForZone = async (zoneId: string | number) => {
    if (!zoneId) return;
    const key = String(zoneId);
    if (woredasByZone[key]) return;
    try {
      const res = await apiRequest<any>(`/location/zones/${zoneId}/woredas`);
      const rows = res.data || res || [];
      setWoredasByZone((prev) => ({
        ...prev,
        [key]: mapLocalizedLocationRows(rows, language),
      }));
    } catch (e) {
      // ignore
    }
  };

  const loadKebelesForWoreda = async (woredaId: string | number) => {
    if (!woredaId) return;
    const key = String(woredaId);
    if (kebelesByWoreda[key]) return;
    try {
      const res = await apiRequest<any>(
        `/location/woredas/${woredaId}/kebeles`,
      );
      const rows = res.data || res || [];
      setKebelesByWoreda((prev) => ({
        ...prev,
        [key]: mapLocalizedLocationRows(rows, language),
      }));
    } catch (e) {
      // ignore
    }
  };

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

  const updateServiceContract = (
    id: number,
    field: keyof Omit<ServiceContractEntry, "id">,
    value: string,
  ) => {
    setServiceContracts((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry,
      ),
    );
  };

  const addServiceContract = () => {
    setServiceContracts((prev) => {
      const nextId = prev.length
        ? Math.max(...prev.map((entry) => entry.id)) + 1
        : 1;
      return [
        ...prev,
        {
          id: nextId,
          serviceUserName: "",
          assignedPersonnelCount: "",
          region: "",
          zone: "",
          woreda: "",
          kebele: "",
        },
      ];
    });
  };

  const removeServiceContract = (id: number) => {
    if (serviceContracts.length === 1) return;
    handleDelete(`user_contract_${id}`);
    setServiceContracts((prev) => prev.filter((entry) => entry.id !== id));
  };

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    formState: { isSubmitting },
  } = useForm<RenewalFormValues>({
    resolver: zodResolver(renewalSchema),
  });

  const certificateSerialNumber = watch("certificateSerialNumber");
  const vehiclesCount = watch("vehicles");

  React.useEffect(() => {
    setEligibleOrganization(null);
    setRenewalPolicy(null);
    setEligibilityError(null);
  }, [certificateSerialNumber]);

  React.useEffect(() => {
    const count = Number(vehiclesCount);
    if (count === 0 && uploadedFiles.vehicle_rent) {
      handleDelete("vehicle_rent");
    }
  }, [vehiclesCount]);

  const isFormLocked =
    isSubmitted || appStatus === "pending" || appStatus === "reviewing";

  const reviewStoreHouse = (() => {
    const value = watch("storeHouse");
    if (value === "1") return language === "am" ? "አዎ" : "Yes";
    if (value === "0") return language === "am" ? "አይ" : "No";
    return "-";
  })();

  const getLocationName = (
    value: string,
    options: Array<{ id: number; name: string }>,
  ) => {
    if (!value) return "-";
    const found = options.find((option) => String(option.id) === String(value));
    return found?.name || value;
  };

  const getContractAddressLabel = (contract: ServiceContractEntry) => {
    const regionName = getLocationName(contract.region, regionsList || []);
    const zoneName = getLocationName(
      contract.zone,
      zonesByRegion[String(contract.region)] || [],
    );
    const woredaName = getLocationName(
      contract.woreda,
      woredasByZone[String(contract.zone)] || [],
    );
    const kebeleName = getLocationName(
      contract.kebele,
      kebelesByWoreda[String(contract.woreda)] || [],
    );

    return `${regionName}, ${zoneName}, ${woredaName}, ${kebeleName}`;
  };

  const nextStep = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();

    if (step === 1) {
      if (eligibleOrganization) {
        setStep(2);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const serial = String(getValues("certificateSerialNumber") || "").trim();

      if (!serial) {
        setEligibilityError(
          language === "am"
            ? "የምስክሩን ተከታታይ ቁጥር ያስገቡ"
            : "Enter the certificate serial number",
        );
        return;
      }

      setIsCheckingEligibility(true);
      setEligibilityError(null);

      try {
        const response = await apiRequest<any>("/renewals/validate", {
          method: "POST",
          body: JSON.stringify({ certificateSerialNumber: serial }),
        });

        const policy = response?.data?.renewalPolicy as
          | RenewalPolicyInfo
          | undefined;

        if (policy && policy.canSubmit === false) {
          setEligibleOrganization(null);
          setRenewalPolicy(null);
          setEligibilityError(
            language === "am"
              ? "እድሳት ማመልከት አልተፈቀደም።"
              : "Renewal submission is not allowed at this time.",
          );
          return;
        }

        setEligibleOrganization(response?.data?.organization || null);
        setRenewalPolicy(policy ?? null);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (error: unknown) {
        setEligibleOrganization(null);
        setRenewalPolicy(null);
        setEligibilityError(
          mapRenewalEligibilityError(
            error instanceof Error
              ? error.message
              : "Unable to validate renewal eligibility",
            language as "en" | "am",
            getRenewalErrorCode(error),
          ),
        );
      } finally {
        setIsCheckingEligibility(false);
      }

      return;
    }

    if (step < 7) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const onSubmit = async (_data: RenewalFormValues) => {
    if (isFormLocked) return;
    if (!eligibleOrganization) {
      setEligibilityError(
        language === "am"
          ? "እባክዎ የምስክር ቁጥርዎን ያረጋግጡ ከመቀጠልዎ በፊት።"
          : "Please verify your certificate before submitting.",
      );
      setStep(1);
      return;
    }
    if (step !== 7) {
      // If somehow triggered before step 7, just advance
      nextStep();
      return;
    }

    const serial = String(getValues("certificateSerialNumber") || "").trim();
    if (!serial) {
      setEligibilityError("Certificate serial number is required");
      return;
    }

    try {
      const payload = {
        ..._data,
        serviceContracts,
        branchAddresses,
        uploadedFiles: Object.fromEntries(
          Object.entries(uploadedFiles).map(([key, file]) => [
            key,
            file?.name || null,
          ]),
        ),
        organization: eligibleOrganization,
      };

      const formData = new FormData();
      formData.append("certificateSerialNumber", serial);
      formData.append("renewalYear", String(new Date().getFullYear()));
      formData.append("payload", JSON.stringify(payload));

      Object.entries(uploadedFiles).forEach(([key, file]) => {
        if (file) {
          formData.append(key, file);
        }
      });

      await apiRequest("/renewals", {
        method: "POST",
        body: formData,
      });

      // Notify admins about the renewal application submission
      try {
        console.log("[Renewal] Notifying admins about renewal submission");
        console.log("[Renewal] Organization:", eligibleOrganization?.nameEnglish);
        await apiRequest("/notifications/notify-application-submission", {
          method: "POST",
          body: JSON.stringify({
            organizationName: eligibleOrganization?.nameEnglish || "Unknown Organization",
            organizationNameAm: eligibleOrganization?.nameAmharic || eligibleOrganization?.nameEnglish || "Unknown Organization",
            applicationType: "Renewal Application",
          }),
        });
        console.log("[Renewal] Admin notification sent successfully");
      } catch (notificationError) {
        console.error("[Renewal] Failed to notify admins:", notificationError);
        // Don't block the submission if notification fails
      }

      setIsSubmitted(true);
    } catch (error: unknown) {
      setEligibilityError(
        mapRenewalEligibilityError(
          error instanceof Error
            ? error.message
            : "Failed to submit renewal application",
          language as "en" | "am",
          getRenewalErrorCode(error),
        ),
      );
      setStep(1);
    }
  };

  const t_renewal = {
    en: {
      title: "Renewal: Agency & Office Information",
      certificateSerialNumber: "Certificate Serial Number",
      certificateSerialPlaceholder: "Enter certificate serial number",
      eligibilityHelp:
        "Your certificate and organization must be active. Renewal opens in the final month of your certificate period (from issue to expiry date), and only one renewal application is allowed per calendar year.",
      renewalPolicyTitle: "Renewal eligibility",
      certificateIssued: "Certificate issued",
      certificateExpires: "Certificate expires",
      renewalOpens: "Renewal opens",
      renewalYearLimit: "Calendar year",
      renewalYearLimitValue: "One renewal application per year",
      verifyAndContinue: "Verify and Continue",
      verifying: "Verifying...",
      region: "REGION",
      zone: "ZONE",
      woreda: "WOREDA",
      kebele: "KEBELE",
      houseNo: "House No.",
      specialLocation: "Special Location Name (Optional)",
      faydaId: "Fayda ID Number",
      otp: "OTP Code",
      docsTitle: "Renewal Documents",
      docsDesc:
        "Upload mandatory legal and organizational documents for renewal.",
      assetsTitle: "Assets & Facilities",
      assetsDesc: "Provide updated details about your physical assets.",
      offices: "Number of Offices",
      capitalAmount: "Capital Amount",
      storeHouse: "Has Store House?",
      computers: "Number of Computers",
      vehicles: "Number of Vehicles",
      trainingTitle: "Training Status & Details",
      trainingDesc:
        "Provide clear details about the organization's training program that support this renewal: where training is delivered, the training provider, typical course length, curriculum highlights, number of personnel trained (male/female), and whether training is certified or ongoing. Attach training certificates or attendance records where available.",
      trainingPlace: "Place where training is provided",
      trainingProvider: "Training Provider",
      trainingDays: "Number of Days Trained",
      personnelTitle: "services",
      contractservice: "services and contract with user",
      assignedPersonnelNumber: "Number of Assigned Personnel",
      nameServiceUser: "Name for service user",
      userContract: "Contract with service user",
      addServiceContract: "Add Another Contract",
      removeServiceContract: "Remove Contract",
      contractItem: "Contract",
      guardsTitle: "Security Guards Requirements",
      guardsDesc: "Recruitment criteria and education level distribution.",
      eduTitle: "Security Guards Education Level",
      reviewTitle: "Final Renewal Review",
      reviewDesc:
        "Please ensure all renewal documents are current. False information may lead to license revocation.",
      agency: "Agency",
      status: "Renewal Status",
      qualification: "Qualification Granted",
      criteria: "Renewal Criteria",
      warning: "Written Warning",
      back: "Back",
      continue: "Continue",
      submit: "Submit Renewal",
      processing: "Processing...",
      selectStore: "Select Store",
      yes: "Yes",
      no: "No",
      met: "Met",
    },
    am: {
      title: "እድሳት፡ የተቋም እና የቢሮ መረጃ",
      certificateSerialNumber: "የምስክር ተከታታይ ቁጥር",
      certificateSerialPlaceholder: "የምስክር ተከታታይ ቁጥር ያስገቡ",
      eligibilityHelp:
        "ምስክሩ እና ድርጅቱ ንቁ መሆን አለባቸው። እድሳት ከምስክር ወጣበት እስከ የሚያበቃበት ቀን ድረስ በመጨረሻው ወር ይከፈታል፣ ለእያንዳንዱ የቀን መቁጠሪያ ዓመት አንድ የእድሳት ማመልከቻ ብቻ ይፈቀዳል።",
      renewalPolicyTitle: "የእድሳት ብቁነት",
      certificateIssued: "ምስክር የወጣበት ቀን",
      certificateExpires: "ምስክር የሚያበቃበት ቀን",
      renewalOpens: "እድሳት የሚከፈትበት",
      renewalYearLimit: "የቀን መቁጠሪያ ዓመት",
      renewalYearLimitValue: "በአንድ ዓመት አንድ የእድሳት ማመልከቻ",
      verifyAndContinue: "አረጋግጥ እና ቀጥል",
      verifying: "በማረጋገጥ ላይ...",
      region: "ክልል",
      zone: "ዞን",
      woreda: "ወረዳ",
      kebele: "ቀበሌ",
      houseNo: "የቤት ቁጥር",
      specialLocation: "የልዩ ቦታ ስም (አማራጭ)",
      faydaId: "የፋይዳ መለያ ቁጥር",
      otp: "የኦቲፒ ኮድ",
      docsTitle: "የእድሳት ሰነዶች",
      docsDesc: "ለእድሳት የሚያስፈልጉ ህጋዊ እና ድርጅታዊ ሰነዶችን ይስቀሉ።",
      assetsTitle: "ንብረቶች እና መገልገያዎች",
      assetsDesc: "ስለ ቁሳዊ ንብረቶችዎ ወቅታዊ መረጃ ይስጡ።",
      offices: "የቢሮዎች ብዛት",
      capitalAmount: "የካፒታል መጠን",
      storeHouse: "መጋዘን አለው?",
      computers: "የኮምፒውተሮች ብዛት",
      vehicles: "የተሸከርካሪዎች ብዛት",
      trainingTitle: "የስልጠና ሁኔታ እና ዝርዝሮች",
      trainingDesc:
        "እባክዎ ስለ ድርጅቱ የስልጠና ፕሮግራም ዝርዝር መረጃ ይስጡ፡ የስልጠና ቦታ፣ የሰጠው ተቋም፣ የትምህርት ብዛት (ወንድ/ሴት)፣ የትምህርት ቀናት፣ እና የማረጋገጫ ሁኔታ ይካተቱ። የስልጠና ማረጋገጫዎችን ከሆነ ያስገቡ።",
      trainingPlace: "ስልጠናው የሚሰጥበት ቦታ",
      trainingProvider: "ስልጠና ሰጪ አካል",
      trainingDays: "የሰለጠኑበት ቀናት ብዛት",
      eduTitle: "የጥበቃ ሰራተኞች የትምህርት ደረጃ",
      contractservice: "ሰራተኞች እና አመራር",
      assignedPersonnelNumber: "የተሰጠው ሰራተኞች ብዛት",
      nameServiceUser: "ለአገልግሎት ተጠቃሚ የሚሰጥ ስም",
      userContract: "ከአገልግሎት ተጠቃሚ ጋር ያለው ውል",
      addServiceContract: "ሌላ ውል ጨምር",
      removeServiceContract: "ውሉን አስወግድ",
      contractItem: "ውል",
      reviewTitle: "የመጨረሻ የእድሳት ግምገማ",
      reviewDesc:
        "እባክዎ ሁሉም የእድሳት ሰነዶች ወቅታዊ መሆናቸውን ያረጋግጡ። የተሳሳተ መረጃ መስጠት ፈቃድ እንዲሰረዝ ሊያደርግ ይችላል።",
      agency: "ተቋም",
      status: "የእድሳት ሁኔታ",
      qualification: "የተሰጠው ብቃት",
      criteria: "የእድሳት መስፈርት",
      warning: "የጽሁፍ ማስጠንቀቂያ",
      back: "ተመለስ",
      continue: "ቀጥል",
      submit: "እድሳቱን አቅርብ",
      processing: "በማቀነባበር ላይ...",
      selectStore: "ሱቅ ይምረጡ",
      yes: "አዎ",
      no: "አይ",
      met: "አሟልቷል",
      notMet: "አላሟላም",
    },
  };

  const curT = t_renewal[language as keyof typeof t_renewal] || t_renewal.en;

  const educationLevels = [
    {
      label: language === "am" ? "ከ3ኛ እስከ 9ኛ ክፍል" : "3rd to 9th Grade",
      maleKey: "grade3to9Male",
      femaleKey: "grade3to9Female",
    },
    {
      label: language === "am" ? "ከ10ኛ እስከ 12ኛ ክፍል" : "10th to 12th Grade",
      maleKey: "grade10to12Male",
      femaleKey: "grade10to12Female",
    },
    {
      label: language === "am" ? "ሰርተፍኬት" : "Certificate",
      maleKey: "certificateMale",
      femaleKey: "certificateFemale",
    },
    {
      label: language === "am" ? "ዲፕሎማ" : "Diploma",
      maleKey: "diplomaMale",
      femaleKey: "diplomaFemale",
    },
    {
      label: language === "am" ? "ዲግሪ" : "Degree",
      maleKey: "degreeMale",
      femaleKey: "degreeFemale",
    },
    {
      label: language === "am" ? "ሁለተኛ ዲግሪ" : "Second Degree",
      maleKey: "secondDegreeMale",
      femaleKey: "secondDegreeFemale",
    },
  ] as const;

  const steps = [
    { id: 1, title: language === "am" ? "መረጃ" : "Agency Info", icon: FileText },
    { id: 2, title: language === "am" ? "ሰነዶች" : "Org Docs", icon: Upload },
    { id: 3, title: language === "am" ? "ንብረት" : "Assets", icon: Shield },
    {
      id: 4,
      title: language === "am" ? "ስልጠና" : "Training",
      icon: CheckCircle2,
    },
    {
      id: 5,
      title: language === "am" ? "የአገልግሎት ግንኙነት" : "Contract",
      icon: Users,
    },
    { id: 6, title: language === "am" ? "ጥበቃ" : "Guards", icon: Shield },
    { id: 7, title: language === "am" ? "ግምገማ" : "Review", icon: CheckCircle2 },
  ];

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
                Renewal Submitted
              </h2>
              <p className="text-gray-500 max-w-md mx-auto">
                Your annual renewal application has been successfully received.
                A non-editable summary of your submission is provided below for
                your records.
              </p>
            </div>
            <div className="px-6 py-2 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100 flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-ping" />
              <span>Status: Pending Audit Review</span>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          <div className="flex justify-center pt-8">
            <button
              type="button"
              onClick={() => (window.location.href = "/dashboard")}
              className="px-12 py-5 bg-primary text-secondary rounded-[24px] font-black uppercase tracking-widest text-sm hover:shadow-2xl hover:scale-105 transition-all active:scale-95 shadow-xl shadow-primary/20"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      {/* Stepper */}
      <div className="flex justify-between items-center relative px-4">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 z-0" />
        {steps.map((s) => (
          <div
            key={s.id}
            className="relative z-10 flex flex-col items-center space-y-2"
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

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-[40px] shadow-xl p-6 md:p-12 border border-gray-100 min-h-[600px] flex flex-col"
      >
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
                  {curT.title}
                </h3>
                <p className="text-sm text-gray-500 max-w-2xl">
                  {curT.eligibilityHelp}
                </p>
              </div>
              <div className="space-y-4 max-w-xl">
                <label className="text-xs font-black text-gray-500 flex items-center space-x-1.5">
                  <span>{curT.certificateSerialNumber}</span>
                  <span className="text-[9px] font-black rounded-md px-1.5 py-0.5 text-red-600 bg-red-50">*</span>
                </label>
                <input
                  {...register("certificateSerialNumber")}
                  placeholder={curT.certificateSerialPlaceholder}
                  className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary text-primary font-bold"
                />
                {eligibilityError && (
                  <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-red-600 text-sm font-medium">
                    {eligibilityError}
                  </div>
                )}
              </div>

              {eligibleOrganization && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-primary uppercase tracking-widest">
                      {language === "am" ? "የቅርንጫፍ አድራሻዎች (አማራጭ)" : "Branch Addresses (Optional)"}
                    </h4>
                    <button
                      type="button"
                      onClick={addBranchAddress}
                      className="inline-flex items-center space-x-2 rounded-xl bg-primary px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:shadow-lg"
                    >
                      <span>{language === "am" ? "አድራሻ ያክሉ" : "Add Address"}</span>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    {language === "am"
                      ? "አንድም ቢሆን፣ አንድም ባይኖር ወይም በርካታ የቅርንጫፍ አድራሻዎችን ያክሉ።"
                      : "Add none, one, or multiple branch locations."}
                  </p>
                  {branchAddresses.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-4 text-xs text-gray-500">
                      {language === "am"
                        ? "ምንም የቅርንጫፍ አድራሻ አልተጨመረም። በዋና መሥሪያ ቤት አድራሻ ብቻ ማስገባት ይችላሉ።"
                        : "No branch address added. You can submit with only the head office address."}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {branchAddresses.map((branch) => (
                        <div key={branch.id} className="space-y-4 rounded-[28px] border border-dashed border-gray-200 p-5 bg-gray-50/50">
                          <div className="flex items-center justify-between">
                            <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest">
                              {language === "am" ? `የቅርንጫፍ አድራሻ #${branchAddresses.indexOf(branch) + 1}` : `Branch Address #${branchAddresses.indexOf(branch) + 1}`}
                            </p>
                            <button
                              type="button"
                              onClick={() => removeBranchAddress(branch.id)}
                              className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all"
                            >
                              <span>{language === "am" ? "አስወግድ" : "Remove"}</span>
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <SearchableLocationSelect
                              label={language === "am" ? "ክልል" : "REGION"}
                              placeholder={language === "am" ? "ክልል ምረጥ" : "Select Region"}
                              searchPlaceholder={language === "am" ? "ክልል ፈልግ" : "Search region"}
                              value={branch.region}
                              options={regionsList}
                              onChange={(val) => {
                                updateBranchAddress(branch.id, "region", val);
                                updateBranchAddress(branch.id, "zone", "");
                                updateBranchAddress(branch.id, "woreda", "");
                                updateBranchAddress(branch.id, "kebele", "");
                                if (val) loadZonesForRegion(val);
                              }}
                              onClear={() => {
                                updateBranchAddress(branch.id, "region", "");
                                updateBranchAddress(branch.id, "zone", "");
                                updateBranchAddress(branch.id, "woreda", "");
                                updateBranchAddress(branch.id, "kebele", "");
                              }}
                              onOpen={() => { if (branch.region) void loadZonesForRegion(branch.region); }}
                            />
                            <SearchableLocationSelect
                              label={`${language === "am" ? "ዞን" : "ZONE"} / ${language === "am" ? "ክፍለ ከተማ" : "SUBCITY"}`}
                              placeholder={language === "am" ? "ዞን/ክፍለ ከተማ ምረጥ" : "Select Zone / Subcity"}
                              searchPlaceholder={language === "am" ? "ዞን ፈልግ" : "Search zone"}
                              value={branch.zone}
                              options={zonesByRegion[String(branch.region)] || []}
                              disabled={!branch.region}
                              onChange={(val) => {
                                updateBranchAddress(branch.id, "zone", val);
                                updateBranchAddress(branch.id, "woreda", "");
                                updateBranchAddress(branch.id, "kebele", "");
                                if (val) loadWoredasForZone(val);
                              }}
                              onClear={() => {
                                updateBranchAddress(branch.id, "zone", "");
                                updateBranchAddress(branch.id, "woreda", "");
                                updateBranchAddress(branch.id, "kebele", "");
                              }}
                              onOpen={() => { if (branch.region) void loadZonesForRegion(branch.region); }}
                            />
                            <SearchableLocationSelect
                              label={language === "am" ? "ወረዳ" : "WOREDA"}
                              placeholder={language === "am" ? "ወረዳ ምረጥ" : "Select Woreda"}
                              searchPlaceholder={language === "am" ? "ወረዳ ፈልግ" : "Search woreda"}
                              value={branch.woreda}
                              options={woredasByZone[String(branch.zone)] || []}
                              disabled={!branch.zone}
                              onChange={(val) => {
                                updateBranchAddress(branch.id, "woreda", val);
                                updateBranchAddress(branch.id, "kebele", "");
                                if (val) loadKebelesForWoreda(val);
                              }}
                              onClear={() => {
                                updateBranchAddress(branch.id, "woreda", "");
                                updateBranchAddress(branch.id, "kebele", "");
                              }}
                              onOpen={() => { if (branch.zone) void loadWoredasForZone(branch.zone); }}
                            />
                            <SearchableLocationSelect
                              label={language === "am" ? "ቀበሌ" : "KEBELE"}
                              placeholder={language === "am" ? "ቀበሌ ምረጥ" : "Select Kebele"}
                              searchPlaceholder={language === "am" ? "ቀበሌ ፈልግ" : "Search kebele"}
                              value={branch.kebele}
                              options={kebelesByWoreda[String(branch.woreda)] || []}
                              disabled={!branch.woreda}
                              onChange={(val) => updateBranchAddress(branch.id, "kebele", val)}
                              onClear={() => updateBranchAddress(branch.id, "kebele", "")}
                              onOpen={() => { if (branch.woreda) void loadKebelesForWoreda(branch.woreda); }}
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[11px] font-black text-gray-400 flex items-center space-x-1.5">
                                <span>{language === "am" ? "የቤት ቁጥር" : "HOUSE NO."}</span>
                                <span className="text-[9px] font-black rounded-md px-1.5 py-0.5 text-red-600 bg-red-50">*</span>
                              </label>
                              <input
                                type="text"
                                value={branch.houseNumber}
                                onChange={(e) => updateBranchAddress(branch.id, "houseNumber", e.target.value)}
                                placeholder={language === "am" ? "የቤት ቁጥር ያስገቡ" : "Enter house number"}
                                className="w-full p-4 bg-white border-2 border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary text-primary font-bold text-sm"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[11px] font-black text-gray-400 flex items-center space-x-1.5">
                                <span>{language === "am" ? "ልዩ ቦታ (አማራጭ)" : "Special Location (Optional)"}</span>
                                <span className="text-[9px] font-black rounded-md px-1.5 py-0.5 text-amber-700 bg-amber-50">opt</span>
                              </label>
                              <input
                                type="text"
                                value={branch.specialLocation}
                                onChange={(e) => updateBranchAddress(branch.id, "specialLocation", e.target.value)}
                                placeholder={language === "am" ? "ልዩ ቦታ ያስገቡ" : "Enter special location"}
                                className="w-full p-4 bg-white border-2 border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary text-primary font-bold text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
                  {curT.docsTitle}
                </h3>
                <p className="text-sm text-gray-500">{curT.docsDesc}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    label:
                      language === "am"
                        ? "የታደሰ የንግድ ፈቃድ"
                        : "Business license renewed",
                    key: "trade_license",
                  },
                  {
                    label:
                      language === "am"
                        ? "የሰራተኛ እና ክህሎት ቢሮ"
                        : "Bureau of Labor and Skills",
                    key: "labor_skill",
                  },
                  {
                    label:
                      language === "am" ? "የግብር ከፋይ ማጽጃ" : "Taxpayer clearance",
                    key: "tax_clearance",
                  },
                  {
                    label:
                      language === "am" ? "የኢንሹራንስ ሽፋን" : "Insurance coverage",
                    key: "insurance",
                  },
                  {
                    label:
                      language === "am"
                        ? "ጥቅም ላይ የዋሉ ቴክኖሎጂዎች ዝርዝር"
                        : "List of technology used",
                    key: "tech_list",
                  },
                  {
                    label:
                      language === "am"
                        ? "ካፒታል (የባንክ መግለጫ)"
                        : "Capital (Bank statement)",
                    key: "capital",
                  },
                  {
                    label:
                      language === "am"
                        ? "የደመወዝ ክፍያ (ፔሮል)"
                        : "Payroll (pay slip)",
                    key: "payroll",
                  },
                  {
                    label:
                      language === "am"
                        ? "የማህበራዊ ዋስትና ክፍያ ደረሰኝ"
                        : "Social Security Payment Slip",
                    key: "social_security",
                  },
                ].map((doc) => (
                  <FileUpload
                    key={doc.key}
                    label={doc.label}
                    file={uploadedFiles[doc.key]}
                    onUpload={(file) => handleUpload(doc.key, file)}
                    onDelete={() => handleDelete(doc.key)}
                    onView={handleView}
                    required={doc.key !== "tech_list"}
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
                  {curT.assetsTitle}
                </h3>
                <p className="text-sm text-gray-500">{curT.assetsDesc}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 flex items-center space-x-1.5">
                    <span>{curT.offices}</span>
                    <span className="text-[9px] font-black rounded-md px-1.5 py-0.5 text-red-600 bg-red-50">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder={
                      language === "am" ? "ቁጥር ያስገቡ" : "Enter number"
                    }
                    {...register("offices")}
                    className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-primary font-bold outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 flex items-center space-x-1.5">
                    <span>{curT.capitalAmount}</span>
                    <span className="text-[9px] font-black rounded-md px-1.5 py-0.5 text-red-600 bg-red-50">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder={
                      language === "am" ? "መጠኑን ያስገቡ" : "Enter amount"
                    }
                    {...register("capitalAmount")}
                    className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-primary font-bold outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 flex items-center space-x-1.5">
                    <span>{curT.storeHouse}</span>
                    <span className="text-[9px] font-black rounded-md px-1.5 py-0.5 text-red-600 bg-red-50">*</span>
                  </label>
                  <select
                    {...register("storeHouse")}
                    className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-primary font-bold outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">{curT.selectStore}</option>
                    <option value="1">{curT.yes}</option>
                    <option value="0">{curT.no}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 flex items-center space-x-1.5">
                    <span>{curT.computers}</span>
                    <span className="text-[9px] font-black rounded-md px-1.5 py-0.5 text-red-600 bg-red-50">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder={
                      language === "am" ? "ቁጥር ያስገቡ" : "Enter number"
                    }
                    {...register("computers")}
                    className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-primary font-bold outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 flex items-center space-x-1.5">
                    <span>{curT.vehicles}</span>
                    <span className="text-[9px] font-black rounded-md px-1.5 py-0.5 text-red-600 bg-red-50">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    defaultValue="0"
                    placeholder={
                      language === "am" ? "ቁጥር ያስገቡ" : "Enter number"
                    }
                    {...register("vehicles")}
                    className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-primary font-bold outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FileUpload
                  label={
                    language === "am"
                      ? "የተሽከርካሪ ኪራይ/ባለቤትነት (Notarized)"
                      : "Notarized Vehicle Rent/Ownership"
                  }
                  file={uploadedFiles.vehicle_rent}
                  onUpload={(file) => handleUpload("vehicle_rent", file)}
                  onDelete={() => handleDelete("vehicle_rent")}
                  onView={handleView}
                  disabled={!watch("vehicles") || Number(watch("vehicles")) === 0}
                  infoText="If rented, upload a document showing 1 year paid rent. If owned, upload ownership documents."
                  infoTextAm="ተሽከርካሪ የተከራየ ከሆነ የ1 አመት ክፍያ የተከፈለበትን ሰነድ ይስቀሉ። የራስ ከሆነ የባለቤትነት ሰነድ ይስቀሉ።"
                  required={false}
                />
                <FileUpload
                  label={
                    language === "am"
                      ? "የቤት ኪራይ/ባለቤትነት (Notarized)"
                      : "Notarized House Rent/Ownership"
                  }
                  file={uploadedFiles.house_rent}
                  onUpload={(file) => handleUpload("house_rent", file)}
                  onDelete={() => handleDelete("house_rent")}
                  onView={handleView}
                  infoText="If rented, upload a document showing 1 year paid rent. If owned, upload ownership documents."
                  infoTextAm="ቤት የተከራየ ከሆነ የ1 አመት ክፍያ የተከፈለበትን ሰነድ ይስቀሉ። የራስ ከሆነ የባለቤትነት ሰነድ ይስቀሉ።"
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-primary">
                  {language === "am" ? "የፎቶ ናሙናዎች" : "Photo Samples"}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FileUpload
                    label={
                      language === "am"
                        ? "የጥበቃ ሰራተኞች የዋስትና አይነት"
                        : "Security guard Warranty Form"
                    }
                    type="photo"
                    file={uploadedFiles.security_guard_warranty_form}
                    onUpload={(file) =>
                      handleUpload("security_guard_warranty_form", file)
                    }
                    onDelete={() =>
                      handleDelete("security_guard_warranty_form")
                    }
                    onView={handleView}
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
                  {curT.trainingTitle}
                </h3>
                <p className="text-sm text-gray-500">{curT.trainingDesc}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center space-x-1.5">
                    <span>{curT.trainingPlace}</span>
                    <span className="text-[9px] font-black rounded-md px-1.5 py-0.5 text-red-600 bg-red-50">*</span>
                  </label>
                  <input
                    {...register("trainingPlace")}
                    className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary text-primary font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center space-x-1.5">
                    <span>{curT.trainingProvider}</span>
                    <span className="text-[9px] font-black rounded-md px-1.5 py-0.5 text-red-600 bg-red-50">*</span>
                  </label>
                  <input
                    {...register("trainingProvider")}
                    className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary text-primary font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center space-x-1.5">
                    <span>{curT.trainingDays}</span>
                    <span className="text-[9px] font-black rounded-md px-1.5 py-0.5 text-red-600 bg-red-50">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    {...register("trainingDays")}
                    className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary text-primary font-bold"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 flex items-center space-x-1.5">
                      <span>{language === "am" ? "የተማሩ ወንዶች" : "Trained (Male)"}</span>
                      <span className="text-[9px] font-black rounded-md px-1.5 py-0.5 text-red-600 bg-red-50">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      {...register("trainedMale")}
                      className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-primary font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 flex items-center space-x-1.5">
                      <span>{language === "am" ? "የተማሩ ሴቶች" : "Trained (Female)"}</span>
                      <span className="text-[9px] font-black rounded-md px-1.5 py-0.5 text-red-600 bg-red-50">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      {...register("trainedFemale")}
                      className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-primary font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 flex items-center space-x-1.5">
                      <span>{language === "am" ? "ያልተማሩ ወንዶች" : "Not Trained (Male)"}</span>
                      <span className="text-[9px] font-black rounded-md px-1.5 py-0.5 text-red-600 bg-red-50">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      {...register("notTrainedMale")}
                      className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-primary font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 flex items-center space-x-1.5">
                      <span>{language === "am" ? "ያልተማሩ ሴቶች" : "Not Trained (Female)"}</span>
                      <span className="text-[9px] font-black rounded-md px-1.5 py-0.5 text-red-600 bg-red-50">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      {...register("notTrainedFemale")}
                      className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-primary font-bold"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <FileUpload
                    label={
                      language === "am"
                        ? "የስልጠና ምስክር ወረቀት"
                        : "Training Certificate"
                    }
                    file={uploadedFiles.training_cert}
                    onUpload={(file) => handleUpload("training_cert", file)}
                    onDelete={() => handleDelete("training_cert")}
                    onView={handleView}
                    required={false}
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
              className="space-y-8"
            >
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-primary">
                  {curT.contractservice}
                </h3>
                <p className="text-sm text-gray-500">{curT.contractservice}</p>
              </div>

              <div className="space-y-6">
                {serviceContracts.map((contract, index) => (
                  <div
                    key={contract.id}
                    className="rounded-[28px] border border-gray-200 bg-gray-50/60 p-5 md:p-6 space-y-6"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-sm md:text-base font-black text-primary uppercase tracking-wider">
                        {curT.contractItem} #{index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeServiceContract(contract.id)}
                        disabled={serviceContracts.length === 1}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {curT.removeServiceContract}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 text-left">
                        <label className="text-[11px] font-black text-gray-500 flex items-center space-x-1.5">
                          <span>{curT.nameServiceUser}</span>
                          <span className="text-[9px] font-black rounded-md px-1.5 py-0.5 text-red-600 bg-red-50">*</span>
                        </label>
                        <input
                          value={contract.serviceUserName}
                          onChange={(e) =>
                            updateServiceContract(
                              contract.id,
                              "serviceUserName",
                              e.target.value,
                            )
                          }
                          placeholder={curT.nameServiceUser}
                          className="w-full p-4 bg-white border-2 border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary text-primary font-bold"
                        />
                      </div>

                      <div className="space-y-2 text-left">
                        <label className="text-[11px] font-black text-gray-500 flex items-center space-x-1.5">
                          <span>{curT.assignedPersonnelNumber}</span>
                          <span className="text-[9px] font-black rounded-md px-1.5 py-0.5 text-red-600 bg-red-50">*</span>
                        </label>
                        <input
                          value={contract.assignedPersonnelCount}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "" || Number(val) >= 0) {
                              updateServiceContract(
                                contract.id,
                                "assignedPersonnelCount",
                                val,
                              );
                            }
                          }}
                          type="number"
                          min="0"
                          placeholder="0"
                          className="w-full p-4 bg-white border-2 border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary text-primary font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <SearchableLocationSelect
                        label={curT.region}
                        placeholder={
                          language === "am" ? "ክልል ምረጥ" : "Select region"
                        }
                        searchPlaceholder={
                          language === "am" ? "ክልል ፈልግ" : "Search region"
                        }
                        value={contract.region}
                        options={regionsList}
                        onChange={(val) => {
                          updateServiceContract(contract.id, "region", val);
                          updateServiceContract(contract.id, "zone", "");
                          updateServiceContract(contract.id, "woreda", "");
                          updateServiceContract(contract.id, "kebele", "");
                          if (val) loadZonesForRegion(val);
                        }}
                        onClear={() => {
                          updateServiceContract(contract.id, "region", "");
                          updateServiceContract(contract.id, "zone", "");
                          updateServiceContract(contract.id, "woreda", "");
                          updateServiceContract(contract.id, "kebele", "");
                        }}
                        onOpen={() => {
                          if (contract.region) {
                            void loadZonesForRegion(contract.region);
                          }
                        }}
                      />

                      <SearchableLocationSelect
                        label={curT.zone}
                        placeholder={
                          language === "am" ? "ዞን ምረጥ" : "Select Zone"
                        }
                        searchPlaceholder={
                          language === "am" ? "ዞን ፈልግ" : "Search zone"
                        }
                        value={contract.zone}
                        options={zonesByRegion[String(contract.region)] || []}
                        disabled={!contract.region}
                        onChange={(val) => {
                          updateServiceContract(contract.id, "zone", val);
                          updateServiceContract(contract.id, "woreda", "");
                          updateServiceContract(contract.id, "kebele", "");
                          if (val) loadWoredasForZone(val);
                        }}
                        onClear={() => {
                          updateServiceContract(contract.id, "zone", "");
                          updateServiceContract(contract.id, "woreda", "");
                          updateServiceContract(contract.id, "kebele", "");
                        }}
                        onOpen={() => {
                          if (contract.region) {
                            void loadZonesForRegion(contract.region);
                          }
                          if (contract.zone) {
                            void loadWoredasForZone(contract.zone);
                          }
                        }}
                      />

                      <SearchableLocationSelect
                        label={curT.woreda}
                        placeholder={
                          language === "am" ? "ወረዳ ምረጥ" : "Select Woreda"
                        }
                        searchPlaceholder={
                          language === "am" ? "ወረዳ ፈልግ" : "Search woreda"
                        }
                        value={contract.woreda}
                        options={woredasByZone[String(contract.zone)] || []}
                        disabled={!contract.zone}
                        onChange={(val) => {
                          updateServiceContract(contract.id, "woreda", val);
                          updateServiceContract(contract.id, "kebele", "");
                          if (val) loadKebelesForWoreda(val);
                        }}
                        onClear={() => {
                          updateServiceContract(contract.id, "woreda", "");
                          updateServiceContract(contract.id, "kebele", "");
                        }}
                        onOpen={() => {
                          if (contract.zone) {
                            void loadWoredasForZone(contract.zone);
                          }
                          if (contract.woreda) {
                            void loadKebelesForWoreda(contract.woreda);
                          }
                        }}
                      />

                      <SearchableLocationSelect
                        label={curT.kebele}
                        placeholder={
                          language === "am" ? "ቀበሌ ምረጥ" : "Select Kebele"
                        }
                        searchPlaceholder={
                          language === "am" ? "ቀበሌ ፈልግ" : "Search kebele"
                        }
                        value={contract.kebele}
                        options={kebelesByWoreda[String(contract.woreda)] || []}
                        disabled={!contract.woreda}
                        onChange={(val) =>
                          updateServiceContract(contract.id, "kebele", val)
                        }
                        onClear={() => {
                          updateServiceContract(contract.id, "kebele", "");
                        }}
                        onOpen={() => {
                          if (contract.woreda) {
                            void loadKebelesForWoreda(contract.woreda);
                          }
                        }}
                      />
                    </div>

                    <FileUpload
                      label={
                        language === "am"
                          ? "ከአገልግሎት ተጠቃሚ ጋር የተደረገ ውል"
                          : "Contract with service user document"
                      }
                      file={uploadedFiles[`user_contract_${contract.id}`]}
                      onUpload={(file) =>
                        handleUpload(`user_contract_${contract.id}`, file)
                      }
                      onDelete={() =>
                        handleDelete(`user_contract_${contract.id}`)
                      }
                      onView={handleView}
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addServiceContract}
                  className="w-full md:w-auto px-5 py-3 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:shadow-lg transition-all"
                >
                  + {curT.addServiceContract}
                </button>
              </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-6 bg-gray-50 p-6 rounded-[32px]">
                <h4 className="font-bold text-primary">{curT.eduTitle}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {educationLevels.map((level, i) => (
                    <div key={i} className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 flex items-center space-x-1.5">
                        <span>{level.label}</span>
                        <span className="text-[9px] font-black rounded-md px-1.5 py-0.5 text-red-600 bg-red-50">*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="number"
                          min="0"
                          placeholder={language === "am" ? "ወንድ" : "Male"}
                          {...register(level.maleKey)}
                          className="p-2 bg-white border-2 border-gray-200 rounded-lg text-xs text-primary font-bold"
                        />
                        <input
                          type="number"
                          min="0"
                          placeholder={language === "am" ? "ሴት" : "Female"}
                          {...register(level.femaleKey)}
                          className="p-2 bg-white border-2 border-gray-200 rounded-lg text-xs text-primary font-bold"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 7 && (
            <motion.div
              key="step7"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 text-left">
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-primary uppercase tracking-tighter">
                    {curT.reviewTitle}
                  </h3>
                  <p className="text-gray-500 max-w-md">{curT.reviewDesc}</p>
                </div>
                <div className="px-6 py-3 bg-amber-50 text-amber-600 rounded-2xl flex items-center space-x-3 border border-amber-100 shadow-sm">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                    Draft Mode: Review & Edit
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 text-left">
                {/* 1. General Info */}
                <section className="bg-gray-50/50 rounded-[32px] border border-gray-100 overflow-hidden">
                  <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-primary">
                      <Shield className="w-5 h-5" />
                      <h4 className="font-black text-xs uppercase tracking-widest">
                        {curT.title}
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
                </section>

                {/* 2. Documents */}
                <section className="bg-gray-50/50 rounded-[32px] border border-gray-100 overflow-hidden">
                  <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-blue-600">
                      <FileText className="w-5 h-5" />
                      <h4 className="font-black text-xs uppercase tracking-widest">
                        {curT.docsTitle}
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
                  <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(uploadedFiles)
                        .filter(
                          ([key]) =>
                            ![
                              "uniform_sample",
                              "id_sample",
                              "employment_form",
                              "warranty_form",
                              "security_guard_warranty_form",
                              "logo",
                              "house_lease",
                            ].some((k) => key.includes(k)) &&
                            !key.startsWith("manager") &&
                            !key.startsWith("ops") &&
                            !key.startsWith("admin"),
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

                {/* 3. Assets & Photos */}
                <section className="bg-gray-50/50 rounded-[32px] border border-gray-100 overflow-hidden">
                  <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-amber-600">
                      <CreditCard className="w-5 h-5" />
                      <h4 className="font-black text-xs uppercase tracking-widest">
                        {curT.assetsTitle} & Samples
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 hover:text-white transition-all"
                    >
                      Edit Details
                    </button>
                  </div>
                  <div className="p-8 space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                      {[
                        { label: curT.offices, value: watch("offices") || "-" },
                        {
                          label: curT.capitalAmount,
                          value: watch("capitalAmount")
                            ? `${watch("capitalAmount")} ETB`
                            : "-",
                        },
                        { label: curT.storeHouse, value: reviewStoreHouse },
                        {
                          label: curT.computers,
                          value: watch("computers") || "-",
                        },
                        {
                          label: curT.vehicles,
                          value: watch("vehicles") || "-",
                        },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="p-4 bg-white rounded-2xl border border-gray-100 space-y-1"
                        >
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            {item.label}
                          </p>
                          <p className="text-sm font-bold text-primary truncate">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
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

                {/* 4. Training Status */}
                <section className="bg-gray-50/50 rounded-[32px] border border-gray-100 overflow-hidden">
                  <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-indigo-600">
                      <CheckCircle2 className="w-5 h-5" />
                      <h4 className="font-black text-xs uppercase tracking-widest">
                        {curT.trainingTitle}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
                    >
                      Edit Training
                    </button>
                  </div>
                  <div className="p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      {
                        label: curT.trainingPlace,
                        value: watch("trainingPlace") || "-",
                      },
                      {
                        label: curT.trainingProvider,
                        value: watch("trainingProvider") || "-",
                      },
                      {
                        label: curT.trainingDays,
                        value: watch("trainingDays")
                          ? `${watch("trainingDays")} days`
                          : "-",
                      },
                      {
                        label: language === "am" ? "ማረጋገጫ" : "Certificate",
                        value: uploadedFiles.training_cert
                          ? "Attached"
                          : "Not attached",
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

                {/* 5. contract Services user */}
                <section className="bg-gray-50/50 rounded-[32px] border border-gray-100 overflow-hidden">
                  <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-purple-600">
                      <Users className="w-5 h-5" />
                      <h4 className="font-black text-xs uppercase tracking-widest">
                        {curT.contractservice} Status
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(5)}
                      className="px-4 py-2 bg-purple-50 text-purple-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all"
                    >
                      Edit contract Services
                    </button>
                  </div>
                  <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {serviceContracts.map((contract, index) => (
                        <div
                          key={contract.id}
                          className="p-5 bg-white rounded-2xl border border-gray-100 space-y-2"
                        >
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            {curT.contractItem} #{index + 1}
                          </p>
                          <p className="text-sm font-bold text-primary">
                            {contract.serviceUserName || "-"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {curT.assignedPersonnelNumber}:{" "}
                            {contract.assignedPersonnelCount || "0"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {getContractAddressLabel(contract)}
                          </p>
                          <p className="text-xs font-bold text-green-600">
                            {uploadedFiles[`user_contract_${contract.id}`]
                              ? "Contract file attached"
                              : "No contract file"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* 5. Guards Recruitment */}
                <section className="bg-gray-50/50 rounded-[32px] border border-gray-100 overflow-hidden">
                  <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(6)}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                    >
                      Edit Guards
                    </button>
                  </div>
                  <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        Renewal Documentation
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(uploadedFiles)
                          .filter((k) => k.startsWith("guard_"))
                          .map((k) => (
                            <span
                              key={k}
                              className="px-3 py-1 bg-green-50 text-green-600 text-[9px] font-black uppercase rounded-full border border-green-100"
                            >
                              {k.replace("guard_", "").replace(/_/g, " ")}
                            </span>
                          ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        Education Audit
                      </p>
                      <p className="text-sm font-bold text-primary">
                        Distribution Verified for All Ranks
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              <div className="p-8 bg-blue-50 rounded-[40px] border-2 border-dashed border-blue-200 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-white text-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                  <RefreshCw className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h5 className="text-xl font-black text-primary uppercase tracking-tight">
                    {language === "am" ? "ለፈቃድ እድሳት ዝግጁ ነዎት?" : "Ready for License Renewal?"}
                  </h5>
                  <p className="text-xs text-gray-500 max-w-lg mx-auto">
                    {language === "am"
                      ? "በማስገባት፣ ከላይ ያለው መረጃ ሁሉ እውነት መሆኑን እና በዓመታዊ ኦዲት ወቅት ለማረጋገጥ ሁሉንም ዋና ሰነዶች እንደያዙ ያረጋግጣሉ።"
                      : "By submitting, you certify that all information above is true and that you possess all original documents for verification during the annual audit."}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between pt-12 mt-auto">
          <button
            type="button"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="flex items-center space-x-2 px-8 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 disabled:opacity-0 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{curT.back}</span>
          </button>
          {step === 7 ? (
            <button
              type="submit"
              disabled={isSubmitting || !eligibleOrganization}
              className="blue-gradient text-white px-10 py-4 rounded-2xl font-bold shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center space-x-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              <span>{isSubmitting ? curT.processing : curT.submit}</span>
              {!isSubmitting && <ArrowRight className="w-5 h-5" />}
            </button>
          ) : (
            <button
              type="button"
              onClick={nextStep}
              disabled={isCheckingEligibility}
              className="blue-gradient text-white px-10 py-4 rounded-2xl font-bold shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center space-x-2"
            >
              <span>
                {step === 1
                  ? isCheckingEligibility
                    ? curT.verifying
                    : curT.verifyAndContinue
                  : step === 6
                    ? language === "am"
                      ? "ባለሙያ ግምገማ"
                      : "Review Application"
                    : curT.continue}
              </span>
              {!isCheckingEligibility && <ArrowRight className="w-5 h-5" />}
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
