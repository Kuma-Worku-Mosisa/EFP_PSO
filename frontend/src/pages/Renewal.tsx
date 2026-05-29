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
import { apiRequest } from "../lib/api";

const renewalSchema = z.object({
  region: z.string().min(1, "Region is required"),
  zone: z.string().min(1, "Zone is required"),
  woreda: z.string().min(1, "Woreda is required"),
  kebele: z.string().min(1, "Kebele is required"),
  houseNumber: z.string().min(1, "House number is required"),
  userContract: z.string().optional(),
  specialLocation: z.string().optional(),
  trainingPlace: z.string().optional(),
  trainingProvider: z.string().optional(),
  trainingDays: z.string().optional(),
  trainedMale: z.string().optional(),
  trainedFemale: z.string().optional(),
  notTrainedMale: z.string().optional(),
  notTrainedFemale: z.string().optional(),
  assignedPersonnelCount: z.string().optional(),
  hiredCount: z.string().optional(),
});

type RenewalFormValues = z.infer<typeof renewalSchema>;

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
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

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
                "font-black text-sm uppercase tracking-tight truncate",
                file
                  ? "text-green-600"
                  : "text-primary/70 group-hover:text-primary",
              )}
            >
              {file ? file.name : label}
            </h4>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                {file
                  ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                  : type === "photo"
                    ? "JPG, PNG Max 2MB"
                    : "PDF, DOCX Max 5MB"}
              </span>
              {required && !file && (
                <span className="text-[10px] text-amber-500 font-black uppercase tracking-widest bg-amber-50 px-1.5 rounded-md">
                  Required
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
      <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">
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
    formState: { isSubmitting },
  } = useForm<RenewalFormValues>({
    resolver: zodResolver(renewalSchema),
  });

  const isFormLocked =
    isSubmitted || appStatus === "pending" || appStatus === "reviewing";

  const nextStep = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();

    if (step < 7) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const onSubmit = async (_data: RenewalFormValues) => {
    if (isFormLocked) return;
    if (step !== 7) {
      // If somehow triggered before step 7, just advance
      nextStep();
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitted(true);
  };

  const t_renewal = {
    en: {
      title: "Renewal: Agency & Office Information",
      region: "Region",
      zone: "Zone",
      woreda: "Woreda",
      kebele: "Kebele",
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
      yes: "Yes",
      no: "No",
      met: "Met",
    },
    am: {
      title: "እድሳት፡ የተቋም እና የቢሮ መረጃ",
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
      yes: "አዎ",
      no: "አይ",
      met: "አሟልቷል",
      notMet: "አላሟላም",
    },
  };

  const curT = t_renewal[language as keyof typeof t_renewal] || t_renewal.en;

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
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6"></div>
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
                  <label className="text-xs font-bold text-gray-500">
                    {curT.offices}
                  </label>
                  <input
                    type="number"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">
                    {curT.storeHouse}
                  </label>
                  <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary">
                    <option value="yes">{curT.yes}</option>
                    <option value="no">{curT.no}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">
                    {curT.computers}
                  </label>
                  <input
                    type="number"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">
                    {curT.vehicles}
                  </label>
                  <input
                    type="number"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FileUpload
                  label={
                    language === "am"
                      ? "የቢሮ ኪራይ ውል (1 ዓመት የቀረው)"
                      : "Office Tenancy Agreement (1 Year Remaining)"
                  }
                  file={uploadedFiles.office_lease}
                  onUpload={(file) => handleUpload("office_lease", file)}
                  onDelete={() => handleDelete("office_lease")}
                  onView={handleView}
                />

                <FileUpload
                  label={
                    language === "am"
                      ? "የመኪና ባለቤትነት ፈቃድ (የኪራይ ውል)"
                      : "Car Owner's License (Lease Agreement)"
                  }
                  file={uploadedFiles.car_lease}
                  onUpload={(file) => handleUpload("car_lease", file)}
                  onDelete={() => handleDelete("car_lease")}
                  onView={handleView}
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
                    file={uploadedFiles.warranty_form}
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
                  <label className="text-sm font-bold text-gray-700">
                    {curT.trainingPlace}
                  </label>
                  <input
                    {...register("trainingPlace")}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    {curT.trainingProvider}
                  </label>
                  <input
                    {...register("trainingProvider")}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    {curT.trainingDays}
                  </label>
                  <input
                    type="number"
                    {...register("trainingDays")}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">
                      {language === "am" ? "የተማሩ ወንዶች" : "Trained (Male)"}
                    </label>
                    <input
                      type="number"
                      {...register("trainedMale")}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">
                      {language === "am" ? "የተማሩ ሴቶች" : "Trained (Female)"}
                    </label>
                    <input
                      type="number"
                      {...register("trainedFemale")}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">
                      {language === "am" ? "ያልተማሩ ወንዶች" : "Not Trained (Male)"}
                    </label>
                    <input
                      type="number"
                      {...register("notTrainedMale")}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">
                      {language === "am" ? "ያልተማሩ ሴቶች" : "Not Trained (Female)"}
                    </label>
                    <input
                      type="number"
                      {...register("notTrainedFemale")}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
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
                        <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">
                          {curT.nameServiceUser}
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
                          className="w-full p-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div className="space-y-2 text-left">
                        <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">
                          {curT.assignedPersonnelNumber}
                        </label>
                        <input
                          value={contract.assignedPersonnelCount}
                          onChange={(e) =>
                            updateServiceContract(
                              contract.id,
                              "assignedPersonnelCount",
                              e.target.value,
                            )
                          }
                          type="number"
                          placeholder="0"
                          className="w-full p-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <SearchableLocationSelect
                        label={curT.region}
                        placeholder={
                          language === "am" ? "ክልል ምረጥ" : "Select Region"
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
                  {[
                    language === "am" ? "ከ3ኛ እስከ 9ኛ ክፍል" : "3rd to 9th Grade",
                    language === "am"
                      ? "ከ10ኛ እስከ 12ኛ ክፍል"
                      : "10th to 12th Grade",
                    language === "am" ? "ሰርተፍኬት" : "Certificate",
                    language === "am" ? "ዲፕሎማ" : "Diploma",
                    language === "am" ? "ዲግሪ" : "Degree",
                    language === "am" ? "ሁለተኛ ዲግሪ" : "Second Degree",
                  ].map((level, i) => (
                    <div key={i} className="space-y-2">
                      <label className="text-xs font-bold text-gray-500">
                        {level}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="M"
                          className="p-2 bg-white border border-gray-200 rounded-lg text-xs"
                        />
                        <input
                          type="number"
                          placeholder="F"
                          className="p-2 bg-white border border-gray-200 rounded-lg text-xs"
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
                              "logo",
                              "office_lease",
                              "house_lease",
                              "car_lease",
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
                  <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        "uniform_sample",
                        "id_sample",
                        "logo",
                        "office_lease",
                        "car_lease",
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
                            {contract.region || "-"}, {contract.zone || "-"},{" "}
                            {contract.woreda || "-"}, {contract.kebele || "-"}
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
                    Ready for License Renewal?
                  </h5>
                  <p className="text-xs text-gray-500 max-w-lg mx-auto">
                    By submitting, you certify that all information above is
                    true and that you possess all original documents for
                    verification during the annual audit.
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
              disabled={isSubmitting}
              className="blue-gradient text-white px-10 py-4 rounded-2xl font-bold shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center space-x-2"
            >
              <span>{isSubmitting ? curT.processing : curT.submit}</span>
              {!isSubmitting && <ArrowRight className="w-5 h-5" />}
            </button>
          ) : (
            <button
              type="button"
              onClick={nextStep}
              className="blue-gradient text-white px-10 py-4 rounded-2xl font-bold shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center space-x-2"
            >
              <span>
                {step === 6
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
