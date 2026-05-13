//frontend/src/pages/NewApplication.tsx
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
  AlertCircle,
  Eye,
  RefreshCw,
  X,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { cn } from "../lib/utils";

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
  region: z.string().min(1, "Region is required"),
  zone: z.string().min(1, "Zone is required"),
  woreda: z.string().min(1, "Woreda is required"),
  kebele: z.string().min(1, "Kebele is required"),
  houseNo: z.string().min(1, "House number is required"),
  specialLocation: z.string().optional(),
});

export const applicationSchema = z.object({
  // Step 1: Agency Info
  agencyName: z.string().min(3, "Agency name is required"),
  headOfficeName: z.string().min(3, "Head office name is required"),
  branchOfficeName: z.string().optional(),
  tradeName: z.string().min(4, "Trade name must be at least 4 characters"),

  // Agency Location
  region: z.string().min(1, "Region is required"),
  zone: z.string().min(1, "Zone is required"),
  woreda: z.string().min(1, "Woreda is required"),
  kebele: z.string().min(1, "Kebele is required"),
  houseNumber: z.string().min(1, "House number is required"),
  specialLocation: z.string().optional(),

  // Contact Info
  agencyphone: z.string().min(10, "Invalid phone number"),
  faxNumber: z.string().min(1, "Fax number is required"),
  email: z.string().email("Invalid email address"),
  tinNumber: z.string().min(2, "TIN number is required"),

  // Step 2: Documents

  // Step 3 & 4: Assets (Preprocessing strings to numbers for Prisma)
  officesCount: z.preprocess(
    (val) => Number(val),
    z.number().min(1, "At least 1 office required"),
  ),
  computersCount: z.preprocess(
    (val) => Number(val),
    z.number().min(1, "Must be 1 or more"),
  ),
  vehiclesCount: z.preprocess(
    (val) => Number(val),
    z.number().min(1, "Must be 1 or more"),
  ),
  hasStoreHouse: z.preprocess(
    (val) => val === true || val === "true",
    z.boolean().default(false),
  ),
  capitalAmount: z.preprocess(
    (val) => Number(val),
    z.number().min(300, "Capital amount must be at least 300"),
  ),

  // Step 4: Training
  trainingAddress: z.string().optional(),
  trainingProvider: z.string().optional(),
  trainingDays: z.preprocess((val) => Number(val || 0), z.number()),
  totalTraineesMale: z.preprocess((val) => Number(val || 0), z.number()),
  totalTraineesFemale: z.preprocess((val) => Number(val || 0), z.number()),

  // Step 5: Personnel (Nested Objects)
  // These match the 'prefix' prop you passed to PersonnelSection
  manager: personnelSchema,
  ops: personnelSchema,
  admin: personnelSchema,

  // Flat fields for legacy or UI tracking
  managerName: z.string().optional(),
  opsHeadName: z.string().optional(),
  adminHeadName: z.string().optional(),
});

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

const FormInput = ({
  label,
  value,
  register,
  name,
  placeholder,
  type = "text",
  error,
  disabled = false,
  isOpenedForEdit = false,
}: {
  label: string;
  value?: string;
  register: any;
  name: string;
  placeholder?: string;
  type?: string;
  error?: any;
  disabled?: boolean;
  isOpenedForEdit?: boolean;
}) => {
  const isFilled = value && value.length > 0;

  return (
    <div className="space-y-2.5 relative group">
      <div className="flex justify-between items-center px-1">
        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
          {label}
        </label>
        {isFilled && !error && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center space-x-1.5 text-[10px] text-green-500 font-black uppercase tracking-widest"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified</span>
          </motion.div>
        )}
      </div>
      <div className="relative">
        <input
          {...register(name)}
          type={type}
          disabled={disabled && !isOpenedForEdit}
          className={cn(
            "w-full p-4 transition-all duration-300 outline-none border-2 text-primary font-bold shadow-sm",
            !isFilled
              ? "bg-gray-50/50 border-dashed border-gray-200 hover:border-gray-300 focus:bg-white"
              : "bg-white border-solid border-green-200 shadow-green-500/5",
            error
              ? "border-red-300 ring-4 ring-red-50 bg-red-50/10"
              : "focus:border-primary focus:ring-4 focus:ring-primary/10",
            disabled && !isOpenedForEdit
              ? "bg-gray-100/80 border-gray-100 cursor-not-allowed opacity-75 grayscale"
              : "rounded-2xl",
            isOpenedForEdit &&
              "border-amber-400 ring-4 ring-amber-50 animate-pulse border-dashed bg-amber-50/20",
          )}
          placeholder={placeholder}
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

type Kebele = { id: number; name: string; woredaId: number };

// --- Dynamic Location Data ---
type Region = { id: number; name: string };
type Zone = { id: number; name: string; regionId: number };
type Woreda = { id: number; name: string; zoneId: number };

function useLocationData() {
  const [regions, setRegions] = React.useState<Region[]>([]);
  const [zones, setZones] = React.useState<Zone[]>([]);
  const [woredas, setWoredas] = React.useState<Woreda[]>([]);
  const [kebeles, setKebeles] = React.useState<Kebele[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [regionId, setRegionId] = React.useState<number | null>(null);
  const [zoneId, setZoneId] = React.useState<number | null>(null);
  const [woredaId, setWoredaId] = React.useState<number | null>(null);

  React.useEffect(() => {
    setLoading(true);
    apiRequest<{ data: Region[] }>("/location/regions")
      .then((res) => setRegions(res.data))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    if (regionId) {
      setLoading(true);
      apiRequest<{ data: Zone[] }>(`/location/regions/${regionId}/zones`)
        .then((res) => setZones(res.data))
        .finally(() => setLoading(false));
    } else {
      setZones([]);
    }
    setZoneId(null);
    setWoredas([]);
    setWoredaId(null);
    setKebeles([]);
  }, [regionId]);

  React.useEffect(() => {
    if (zoneId) {
      setLoading(true);
      apiRequest<{ data: Woreda[] }>(`/location/zones/${zoneId}/woredas`)
        .then((res) => setWoredas(res.data))
        .finally(() => setLoading(false));
    } else {
      setWoredas([]);
    }
    setWoredaId(null);
    setKebeles([]);
  }, [zoneId]);

  React.useEffect(() => {
    if (woredaId) {
      setLoading(true);
      apiRequest<{ data: Kebele[] }>(`/location/woredas/${woredaId}/kebeles`)
        .then((res) => setKebeles(res.data))
        .finally(() => setLoading(false));
    } else {
      setKebeles([]);
    }
  }, [woredaId]);

  return {
    regions,
    zones,
    woredas,
    kebeles,
    loading,
    setRegionId,
    setZoneId,
    setWoredaId,
    regionId,
    zoneId,
    woredaId,
  };
}

const FormSelect = ({
  label,
  options,
  register,
  name,
  error,
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
  disabled?: boolean;
  onChange?: (value: string | number) => void;
  value?: string | number;
  placeholder?: string;
}) => {
  return (
    <div className="space-y-2.5 relative group">
      <div className="flex justify-between items-center px-1">
        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
          {label}
        </label>
      </div>
      <div className="relative">
        <select
          {...register(name)}
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className={cn(
            "w-full p-4 transition-all duration-300 outline-none border-2 text-primary font-bold shadow-sm bg-gray-50/50 rounded-2xl appearance-none",
            error
              ? "border-red-300 ring-4 ring-red-50 bg-red-50/10"
              : "focus:border-primary focus:ring-4 focus:ring-primary/10 border-dashed border-gray-200 hover:border-gray-300",
            disabled
              ? "bg-gray-100/80 border-gray-100 cursor-not-allowed opacity-75 grayscale"
              : "bg-white",
          )}
        >
          <option value="">{placeholder}</option>
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

      <div className="flex items-center justify-between gap-4">
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
          <div className="flex-1 min-w-0">
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

function LocationFields({
  register,
  errors,
  watch,
  isFormLocked,
  openedFields,
  setValue,
}: any) {
  const {
    regions,
    zones,
    woredas,
    kebeles,
    setRegionId,
    setZoneId,
    setWoredaId,
    regionId,
    zoneId,
    woredaId,
  } = useLocationData();

  const selectedRegion = watch("region");
  const selectedZone = watch("zone");
  const selectedWoreda = watch("woreda");
  const selectedKebele = watch("kebele");

  React.useEffect(() => {
    if (selectedRegion) {
      const region = regions.find(
        (r) => r.id === Number(selectedRegion) || r.name === selectedRegion,
      );
      if (region) setRegionId(region.id);
    }
  }, [selectedRegion, regions, setRegionId]);

  React.useEffect(() => {
    if (selectedZone) {
      const zone = zones.find(
        (z) => z.id === Number(selectedZone) || z.name === selectedZone,
      );
      if (zone) setZoneId(zone.id);
    }
  }, [selectedZone, zones, setZoneId]);

  React.useEffect(() => {
    if (selectedWoreda) {
      const woreda = woredas.find(
        (w) => w.id === Number(selectedWoreda) || w.name === selectedWoreda,
      );
      if (woreda) setWoredaId(woreda.id);
    }
  }, [selectedWoreda, woredas, setWoredaId]);

  return (
    <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-5 gap-4">
      <FormSelect
        label="Region"
        name="region"
        register={register}
        value={selectedRegion}
        options={regions.map((r) => ({ value: r.id, label: r.name }))}
        onChange={(val) => {
          setValue?.("region", val);
          setRegionId(Number(val));
          try {
            setValue?.("zone", "");
            setValue?.("woreda", "");
            setValue?.("kebele", "");
          } catch (e) {
            /* ignore */
          }
        }}
        error={errors.region}
        disabled={isFormLocked}
        placeholder="Select Region"
      />
      <FormSelect
        label="Zone"
        name="zone"
        register={register}
        value={selectedZone}
        options={zones.map((z) => ({ value: z.id, label: z.name }))}
        onChange={(val) => {
          setValue?.("zone", val);
          setZoneId(Number(val));
          try {
            setValue?.("woreda", "");
            setValue?.("kebele", "");
          } catch (e) {
            /* ignore */
          }
        }}
        error={errors.zone}
        disabled={isFormLocked || !regionId}
        placeholder="Select Zone"
      />
      <FormSelect
        label="Woreda"
        name="woreda"
        register={register}
        value={selectedWoreda}
        options={woredas.map((w) => ({ value: w.id, label: w.name }))}
        onChange={(val) => {
          setValue?.("woreda", val);
          setWoredaId(Number(val));
          try {
            setValue?.("kebele", "");
          } catch (e) {
            /* ignore */
          }
        }}
        error={errors.woreda}
        disabled={isFormLocked || !zoneId}
        placeholder="Select Woreda"
      />
      <FormSelect
        label="Kebele"
        name="kebele"
        register={register}
        value={selectedKebele}
        options={kebeles.map((k) => ({ value: k.id, label: k.name }))}
        onChange={(val) => setValue?.("kebele", val)}
        error={errors.kebele}
        disabled={isFormLocked || !woredaId}
        placeholder="Select Kebele"
      />
      <FormInput
        label="House No"
        name="houseNumber"
        register={register}
        value={watch("houseNumber")}
        error={errors.houseNumber}
        disabled={isFormLocked}
        isOpenedForEdit={openedFields.includes("houseNumber")}
      />
    </div>
  );
}

const PersonnelSection = ({
  title,
  prefix,
  files,
  onUpload,
  onDelete,
  onView,
  curT,
  register,
  errors,
  isFormLocked,
  watch,
  setValue,
}: {
  title: string;
  prefix: string;
  files: Record<string, File | null>;
  onUpload: (key: string, file: File) => void;
  onDelete: (key: string) => void;
  onView: (file: File, url: string | null) => void;
  curT: any;
  register: any;
  errors: any;
  isFormLocked?: boolean;
  setValue?: any;
  watch?: any;
}) => {
  const personnelDocs = [
    { label: "Fingerprint from Police", key: "fingerprint_doc" },
    { label: "Medical Result", key: "medical_doc" },
    { label: "Training Certificate", key: "training_doc" },
    { label: "Support Letter (Kebele)", key: "support_doc" },
    { label: "Proof of Collateral", key: "collateral_doc" },
    { label: "Work Experience", key: "experience_doc" },
    { label: "Resignation Record", key: "resignation_letter_doc" },
    { label: "Educational Cert (Degree)", key: "education_doc" },
    { label: "National ID", key: "national_id_doc" },
    { label: "Renewed Kebele ID/Passport", key: "passport_or_kabele_doc" },
    { label: "Org Identification", key: "organization_Id_doc" },
  ];

  const {
    regions,
    zones,
    woredas,
    kebeles,
    setRegionId,
    setZoneId,
    setWoredaId,
    regionId,
    zoneId,
    woredaId,
  } = useLocationData();

  const selectedRegion = watch?.(`${prefix}.region`);
  const selectedZone = watch?.(`${prefix}.zone`);
  const selectedWoreda = watch?.(`${prefix}.woreda`);
  const selectedKebele = watch?.(`${prefix}.kebele`);

  // Find regionId by name or id and trigger zone fetch
  React.useEffect(() => {
    if (selectedRegion) {
      const region = regions.find(
        (r) => r.id === Number(selectedRegion) || r.name === selectedRegion,
      );
      if (region) setRegionId(region.id);
    }
  }, [selectedRegion, regions, setRegionId]);

  // Find zoneId by name or id and trigger woreda fetch
  React.useEffect(() => {
    if (selectedZone) {
      const zone = zones.find(
        (z) => z.id === Number(selectedZone) || z.name === selectedZone,
      );
      if (zone) setZoneId(zone.id);
    }
  }, [selectedZone, zones, setZoneId]);

  // Find woredaId by name or id and trigger kebele fetch
  React.useEffect(() => {
    if (selectedWoreda) {
      const woreda = woredas.find(
        (w) => w.id === Number(selectedWoreda) || w.name === selectedWoreda,
      );
      if (woreda) setWoredaId(woreda.id);
    }
  }, [selectedWoreda, woredas, setWoredaId]);

  // Helper to get nested error messages safely
  const getError = (fieldName: string) => {
    return errors[prefix]?.[fieldName]?.message;
  };

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
            Personnel Identification & Documentation
          </p>
        </div>
      </div>

      {/* Basic Info Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput
          label="Full Name"
          name={`${prefix}.fullName`}
          value={watch("fullName")}
          register={register}
          placeholder="Enter legal full name"
          error={errors[prefix]?.fullName}
          disabled={isFormLocked}
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2.5">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
              Gender
            </label>
            <select
              {...register(`${prefix}.gender`)}
              disabled={isFormLocked}
              className={cn(
                "w-full p-4 bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-primary text-sm appearance-none",
                isFormLocked && "opacity-75 grayscale cursor-not-allowed",
              )}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <FormInput
            label="Citizenship"
            name={`${prefix}.citizenship`}
            register={register}
            placeholder="Ethiopian"
            value={watch("citizenship")}
            error={errors[prefix]?.citizenship}
            disabled={isFormLocked}
          />
        </div>
      </div>

      {/* Identity & Contact Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-gray-50 pt-6">
        <div className="md:col-span-1 space-y-2.5">
          <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
            {curT.faydaId || "Fayda ID & OTP"}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              {...register(`${prefix}.faydaId`)}
              disabled={isFormLocked}
              placeholder="FAYDA-XXXXX"
              value={watch("faydaId")}
              className="flex-1 p-4 bg-white border-2 border-gray-100 rounded-2xl outline-none focus:border-primary text-sm font-bold text-primary shadow-sm"
            />
            <div className="flex items-center space-x-2 px-3 bg-primary/5 rounded-2xl border border-primary/10 w-32">
              <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
              <input
                type="text"
                {...register(`${prefix}.otp`)}
                disabled={isFormLocked}
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
          value={watch("email")}
          type="email"
          register={register}
          placeholder="email@example.com"
          error={errors[prefix]?.email}
          disabled={isFormLocked}
        />
        <FormInput
          label={curT.phone || "Phone Number"}
          name={`${prefix}.phone`}
          type="tel"
          register={register}
          placeholder="+251..."
          value={watch("phone")}
          error={errors[prefix]?.phone}
          disabled={isFormLocked}
        />
      </div>

      {/* Location Section */}
      <div className="bg-gray-50/50 p-6 rounded-[32px] border-2 border-dashed border-gray-200 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FormSelect
            label="Region"
            name={`${prefix}.region`}
            register={register}
            value={selectedRegion}
            options={regions.map((r) => ({ value: r.id, label: r.name }))}
            onChange={(val) => {
              setValue?.(`${prefix}.region`, val);
              setRegionId(Number(val));
              try {
                setValue?.(`${prefix}.zone`, "");
                setValue?.(`${prefix}.woreda`, "");
                setValue?.(`${prefix}.kebele`, "");
              } catch (e) {
                /* ignore */
              }
            }}
            error={errors[prefix]?.region}
            disabled={isFormLocked}
          />
          <FormSelect
            label="Zone"
            name={`${prefix}.zone`}
            register={register}
            value={selectedZone}
            options={zones.map((z) => ({ value: z.id, label: z.name }))}
            onChange={(val) => {
              setValue?.(`${prefix}.zone`, val);
              setZoneId(Number(val));
              try {
                setValue?.(`${prefix}.woreda`, "");
                setValue?.(`${prefix}.kebele`, "");
              } catch (e) {
                /* ignore */
              }
            }}
            error={errors[prefix]?.zone}
            disabled={!regionId || isFormLocked}
          />
          <FormSelect
            label="Woreda"
            name={`${prefix}.woreda`}
            register={register}
            value={selectedWoreda}
            options={woredas.map((w) => ({ value: w.id, label: w.name }))}
            onChange={(val) => {
              setValue?.(`${prefix}.woreda`, val);
              setWoredaId(Number(val));
              try {
                setValue?.(`${prefix}.kebele`, "");
              } catch (e) {
                /* ignore */
              }
            }}
            error={errors[prefix]?.woreda}
            disabled={!zoneId || isFormLocked}
          />
          <FormSelect
            label="Kebele"
            name={`${prefix}.kebele`}
            register={register}
            value={selectedKebele}
            options={kebeles.map((k) => ({ value: k.id, label: k.name }))}
            onChange={(val) => {
              setValue?.(`${prefix}.kebele`, val);
            }}
            error={errors[prefix]?.kebele}
            disabled={!woredaId || isFormLocked}
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
            disabled={isFormLocked}
          />
        </div>
      </div>

      {/* File Uploads Grid */}
      <div className="space-y-4 border-t border-gray-50 pt-6">
        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1 block mb-2">
          Required Documents
        </label>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {personnelDocs.map((doc) => (
            <FileUpload
              key={doc.key}
              label={doc.label}
              file={files[`${prefix}_${doc.key}`]}
              onUpload={(file) => onUpload(`${prefix}_${doc.key}`, file)}
              onDelete={() => onDelete(`${prefix}_${doc.key}`)}
              onView={onView}
              disabled={isFormLocked}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export const NewApplication = () => {
  const { language } = useLanguage();
  const [step, setStep] = React.useState(1);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [appStatus] = React.useState<
    "draft" | "pending" | "reviewing" | "correction"
  >("draft");
  const [openedFields] = React.useState<string[]>([
    "trade_license",
    "kebele_id_m_2024",
  ]); // Mock admin opened fields
  const [uploadedFiles, setUploadedFiles] = React.useState<
    Record<string, File | null>
  >({});

  const isFormLocked =
    isSubmitted || appStatus === "pending" || appStatus === "reviewing";

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
      orgName: "Organization Name",
      headOffice: "Head Office Name",
      branchOffice: "Branch Office Name (Optional)",
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
      offices: "Number of Offices",
      storeHouse: "Has Store House?",
      computers: "Number of Computers",
      vehicles: "Number of Vehicles",
      step4Title: "Training Status",
      step4Desc: "Details about the organization's training program.",
      step5Title: "Key Personnel Requirements",
      step5Desc:
        "Provide details and documents for the Manager, Operations Head, and Admin Head.",
      step6Title: "Final Review",
      step6Desc:
        "Please ensure all uploaded documents and photos are clear and valid. False information may lead to permanent disqualification.",
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
      orgName: "የተቋሙ ስም",
      headOffice: "የዋና መስሪያ ቤት ስም",
      branchOffice: "የቅርንጫፍ መስሪያ ቤት ስም (አማራጭ)",
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
      offices: "የቢሮዎች ብዛት",
      storeHouse: "መጋዘን አለው?",
      computers: "የኮምፒውተሮች ብዛት",
      vehicles: "የተሸከርካሪዎች ብዛት",
      step4Title: "የስልጠና ሁኔታ",
      step4Desc: "ስለ ተቋሙ የስልጠና ፕሮግራም ዝርዝር መረጃ።",
      step5Title: "የቁልፍ ሰራተኞች መስፈርቶች",
      step5Desc: "ለስራ አስኪያጅ፣ ለኦፕሬሽን ኃላፊ እና ለአስተዳደር ኃላፊ ዝርዝር መረጃ እና ሰነዶችን ያቅርቡ።",
      step6Title: "የመጨረሻ ግምገማ",
      step6Desc:
        "እባክዎ ሁሉም የተሰቀሉ ሰነዶች እና ፎቶዎች ግልጽ እና ትክክለኛ መሆናቸውን ያረጋግጡ። የተሳሳተ መረጃ መስጠት ለዘላቂ ብቁ አለመሆን ሊያጋልጥ ይችላል።",
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

  const {
    register,
    handleSubmit,
    watch,
    setValue, // Added this to handle location resets
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      // It's good practice to initialize nested objects
      manager: { gender: "Male", citizenship: "Ethiopian" },
      ops: { gender: "Male", citizenship: "Ethiopian" },
      admin: { gender: "Male", citizenship: "Ethiopian" },
    },
  });

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

    const result = await uploadOrganizationDocuments(
      String(watch("agencyName") || ""),
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
      // 1. Gather form data
      const formData = {
        agencyName: data.agencyName,
        headOfficeName: data.headOfficeName,
        branchOfficeName: data.branchOfficeName,
        email: data.email,
        phone: data.agencyphone,
        faxNumber: data.faxNumber,
        tinNumber: data.tinNumber,
        tradeName: data.tradeName,
        kebele: data.kebele,
        houseNumber: data.houseNumber,
        numberOfOffices: Number(data.officesCount),
        numberOfComputers: Number(data.computersCount),
        numberOfVehicles: Number(data.vehiclesCount),
        hasStoreHouse:
          data.hasStoreHouse === true || data.hasStoreHouse === "true",
        capitalAmount: Number(data.capitalAmount),
        trainingAddress: data.trainingAddress,
        trainingDays: Number(data.trainingDays || 0),
        trainingProvider: data.trainingProvider,
        totalTraineesMale: Number(data.totalTraineesMale || 0),
        totalTraineesFemale: Number(data.totalTraineesFemale || 0),
        managerName:
          data.managerName || data.manager?.fullName || "manager name missing",
        opsHeadName:
          data.opsHeadName || data.ops?.fullName || "ops head name missing",
        adminHeadName:
          data.adminHeadName ||
          data.admin?.fullName ||
          "admin head name missing",
        manager: data.manager,
        ops: data.ops,
        admin: data.admin,
      };

      // 2. Upload files to backend storage and remap returned URLs back to submission keys
      console.groupCollapsed("[DEBUG] Uploading files to backend");
      const uploadedFilesUrls = await uploadApplicationFiles();
      console.debug("Uploaded file URLs:", uploadedFilesUrls);
      console.groupEnd();

      // 3. Get JWT token (replace with your auth logic)
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated");

      // 4. Send POST request
      const payload = {
        formData,
        uploadedFiles: uploadedFilesUrls,
      };
      console.groupCollapsed("[DEBUG] Final submission payload");
      console.debug("Token present?", !!token);
      console.debug("Payload:", payload);
      console.groupEnd();

      await apiRequest("/applications/submit", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      setIsSubmitted(true);
      console.info("[DEBUG] Submission completed — isSubmitted=true");
    } catch (err: any) {
      console.error("[DEBUG] Submission error:", err);
      alert(err.message || "Failed to submit application.");
    }
  };

  const onInvalid = (formErrors: any) => {
    console.warn("[DEBUG] Submission validation failed:", formErrors);

    const errorPaths = Object.keys(formErrors);
    const hasStep1Error = errorPaths.some((key) =>
      [
        "agencyName",
        "headOfficeName",
        "branchOfficeName",
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

          <div className="space-y-12 text-left">
            <div className="grid grid-cols-1 gap-12">
              {/* 1. Agency */}
              <section className="space-y-6">
                <div className="flex items-center space-x-3 text-primary">
                  <Shield className="w-6 h-6" />
                  <h3 className="text-xl font-bold uppercase tracking-tight">
                    Organization Profile
                  </h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 bg-gray-50/50 p-8 rounded-[32px] border border-gray-100">
                  {[
                    { label: curT.orgName, value: watch("agencyName") },
                    { label: curT.headOffice, value: watch("headOfficeName") },

                    {
                      label: curT.agencyphone,
                      value: watch("agencyphone"),
                    },
                    { label: curT.email, value: watch("email") },
                    { label: curT.tinNumber, value: watch("tinNumber") },
                    {
                      label: "Location",
                      value: `${watch("region")}, ${watch("zone")}`,
                    },
                    {
                      label: "Woreda/Kebele",
                      value: `${watch("woreda")}/${watch("kebele")}`,
                    },
                    { label: "House No", value: watch("houseNumber") },
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
              <section className="space-y-6">
                <div className="flex items-center space-x-3 text-blue-600">
                  <FileText className="w-6 h-6" />
                  <h3 className="text-xl font-bold uppercase tracking-tight">
                    Submitted Documents
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(uploadedFiles).map(([key, file]) => (
                    <div
                      key={key}
                      className="p-5 bg-white border border-gray-100 rounded-[24px] flex items-center justify-between shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-center space-x-4 min-w-0">
                        <div className="p-3 bg-blue-50 text-blue-500 rounded-xl flex-shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest truncate">
                            {key.replace(/_/g, " ")}
                          </p>
                          <p className="text-[11px] font-bold text-primary truncate max-w-[140px]">
                            {file?.name}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => file && handleView(file, null)}
                        className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* 3. Assets & Personnel Summary */}
              <section className="space-y-6">
                <div className="flex items-center space-x-3 text-amber-600">
                  <Shield className="w-6 h-6" />
                  <h3 className="text-xl font-bold uppercase tracking-tight">
                    System Records & Staff
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-6 bg-gray-900 rounded-[32px] text-white space-y-1">
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">
                      Manager
                    </p>
                    <p className="text-sm font-black text-secondary truncate">
                      {watch("managerName") || "Verified"}
                    </p>
                  </div>
                  <div className="p-6 bg-gray-900 rounded-[32px] text-white space-y-1">
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">
                      Operations Head
                    </p>
                    <p className="text-sm font-black truncate">
                      {watch("opsHeadName") || "Enrolled"}
                    </p>
                  </div>
                  <div className="p-6 bg-gray-900 rounded-[32px] text-white space-y-1">
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">
                      Admin Head
                    </p>
                    <p className="text-sm font-black text-secondary truncate">
                      {watch("adminHeadName") || "Cleared"}
                    </p>
                  </div>
                  <div className="p-6 bg-gray-900 rounded-[32px] text-white space-y-1">
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">
                      Branch Profile
                    </p>
                    <p className="text-sm font-black truncate">
                      {watch("branchOfficeName") || "Initiated"}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className="flex justify-center pt-8">
            <button
              type="button"
              onClick={() => (window.location.href = "/")}
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
        onSubmit={handleSubmit(onSubmit, onInvalid)}
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
                  {curT.step1Title}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormInput
                    label={curT.orgName}
                    name="agencyName"
                    register={register}
                    value={watch("agencyName")}
                    error={errors.agencyName}
                    disabled={isFormLocked}
                    isOpenedForEdit={openedFields.includes("agencyName")}
                  />
                  <FormInput
                    label={curT.headOffice}
                    name="headOfficeName"
                    register={register}
                    value={watch("headOfficeName")}
                    error={errors.headOfficeName}
                    disabled={isFormLocked}
                    isOpenedForEdit={openedFields.includes("headOfficeName")}
                  />
                  <FormInput
                    label={curT.branchOffice}
                    name="branchOfficeName"
                    register={register}
                    value={watch("branchOfficeName")}
                    error={errors.branchOfficeName}
                    disabled={isFormLocked}
                    isOpenedForEdit={openedFields.includes("branchOfficeName")}
                  />
                </div>

                <LocationFields
                  register={register}
                  errors={errors}
                  watch={watch}
                  isFormLocked={isFormLocked}
                  openedFields={openedFields}
                  setValue={setValue}
                />

                <FormInput
                  label={curT.agencyphone}
                  name="agencyphone"
                  register={register}
                  value={watch("agencyphone")}
                  error={errors.agencyphone}
                  disabled={isFormLocked}
                  isOpenedForEdit={openedFields.includes("agencyphone")}
                />
                <FormInput
                  label={curT.faxNumber}
                  name="faxNumber"
                  register={register}
                  value={watch("faxNumber")}
                  error={errors.faxNumber}
                  disabled={isFormLocked}
                  isOpenedForEdit={openedFields.includes("faxNumber")}
                />
                <FormInput
                  label={curT.tradeName}
                  name="tradeName"
                  register={register}
                  value={watch("tradeName")}
                  error={errors.tradeName}
                  disabled={isFormLocked}
                  isOpenedForEdit={openedFields.includes("tradeName")}
                />

                <FormInput
                  label={curT.specialLocation}
                  name="specialLocation"
                  register={register}
                  value={watch("specialLocation")}
                  error={errors.specialLocation}
                  disabled={isFormLocked}
                  isOpenedForEdit={openedFields.includes("specialLocation")}
                />

                <div className="md:col-span-2">
                  <FormInput
                    label={curT.email}
                    name="email"
                    register={register}
                    value={watch("email")}
                    error={errors.email}
                    disabled={isFormLocked}
                    isOpenedForEdit={openedFields.includes("email")}
                  />
                </div>

                <FormInput
                  label={curT.tinNumber}
                  name="tinNumber"
                  register={register}
                  value={watch("tinNumber")}
                  error={errors.tinNumber}
                  disabled={isFormLocked}
                  isOpenedForEdit={openedFields.includes("tinNumber")}
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
                  {
                    label: "Trade name designation",
                    key: "trade_name_designation",
                  },
                  {
                    label: "Trade pre-registration",
                    key: "trade_pre_registration",
                  },
                  {
                    label: "Renewed Trade license",
                    key: "renewed_trade_license",
                  },
                  {
                    label: "Labor and Skill Bureau registration",
                    key: "labor_and_skill_bureau",
                  },
                  { label: "TIN number paper", key: "tin_number_paper" },
                  {
                    label: "Organizational Trademark",
                    key: "organizational_trademark",
                  },
                  { label: "Organizational structure", key: "org_structure" },
                  {
                    label: "Articles of incorporation",
                    key: "articles_of_incorporation",
                  },
                  {
                    label: "Internal regulations",
                    key: "internal_regulations",
                  },
                  {
                    label: "Lists of technologies used",
                    key: "tech_list_used",
                  },
                  {
                    label: "Capital (Bank statement)",
                    key: "capital",
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
                  {curT.step3Title}
                </h3>
                <p className="text-sm text-gray-500">{curT.step3Desc}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">
                    Capital Amount
                  </label>
                  <input
                    type="number"
                    {...register("capitalAmount")}
                    disabled={isFormLocked}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.capitalAmount && (
                    <p className="text-red-500 text-[10px]">
                      {String(errors.capitalAmount?.message)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">
                    {curT.offices}
                  </label>
                  <input
                    type="number"
                    {...register("officesCount")}
                    disabled={isFormLocked}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.officesCount && (
                    <p className="text-red-500 text-[10px]">
                      {String(errors.officesCount?.message)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">
                    {curT.storeHouse}
                  </label>
                  <select
                    {...register("hasStoreHouse")}
                    disabled={isFormLocked}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">
                    {curT.computers}
                  </label>
                  <input
                    type="number"
                    {...register("computersCount")}
                    disabled={isFormLocked}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.computersCount && (
                    <p className="text-red-500 text-[10px]">
                      {String(errors.computersCount?.message)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">
                    {curT.vehicles}
                  </label>
                  <input
                    type="number"
                    {...register("vehiclesCount")}
                    disabled={isFormLocked}
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
                  label="Notarized Vehicle Rent/Ownership"
                  file={uploadedFiles.vehicle_rent}
                  onUpload={(file) => handleUpload("vehicle_rent", file)}
                  onDelete={() => handleDelete("vehicle_rent")}
                  onView={handleView}
                />
                <FileUpload
                  label="Notarized House Rent/Ownership"
                  file={uploadedFiles.house_rent}
                  onUpload={(file) => handleUpload("house_rent", file)}
                  onDelete={() => handleDelete("house_rent")}
                  onView={handleView}
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-primary">Photo Samples</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FileUpload
                    label="Uniform Sample"
                    type="photo"
                    file={uploadedFiles.uniform_sample}
                    onUpload={(file) => handleUpload("uniform_sample", file)}
                    onDelete={() => handleDelete("uniform_sample")}
                    onView={handleView}
                  />
                  <FileUpload
                    label=" Organization Employee ID Sample (Front & Back)"
                    type="photo"
                    file={uploadedFiles.id_sample}
                    onUpload={(file) => handleUpload("id_sample", file)}
                    onDelete={() => handleDelete("id_sample")}
                    onView={handleView}
                  />
                  <FileUpload
                    label="Employment Form"
                    type="photo"
                    file={uploadedFiles.employment_form}
                    onUpload={(file) => handleUpload("employment_form", file)}
                    onDelete={() => handleDelete("employment_form")}
                    onView={handleView}
                  />
                  <FileUpload
                    label="Employment Warranty Form"
                    type="photo"
                    file={uploadedFiles.warranty_form}
                    onUpload={(file) => handleUpload("warranty_form", file)}
                    onDelete={() => handleDelete("warranty_form")}
                    onView={handleView}
                  />
                  <FileUpload
                    label="Logo of Organization"
                    type="photo"
                    file={uploadedFiles.logo}
                    onUpload={(file) => handleUpload("logo", file)}
                    onDelete={() => handleDelete("logo")}
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
                  {curT.step4Title}
                </h3>
                <p className="text-sm text-gray-500">{curT.step4Desc}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Training Address
                  </label>
                  <input
                    {...register("trainingAddress")}
                    disabled={isFormLocked}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Number of Days Trained
                  </label>
                  <input
                    type="number"
                    {...register("trainingDays")}
                    disabled={isFormLocked}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Number of Males Trained
                  </label>
                  <input
                    type="number"
                    {...register("totalTraineesMale")}
                    disabled={isFormLocked}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Number of Females Trained
                  </label>
                  <input
                    type="number"
                    {...register("totalTraineesFemale")}
                    disabled={isFormLocked}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Training Provider Body
                  </label>
                  <input
                    {...register("trainingProvider")}
                    disabled={isFormLocked}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <FileUpload
                    label="Training Manual"
                    file={uploadedFiles.training_manual}
                    onUpload={(file) => handleUpload("training_manual", file)}
                    onDelete={() => handleDelete("training_manual")}
                    onView={handleView}
                  />
                </div>
                <div className="md:col-span-2">
                  <FileUpload
                    label="Certificate of Training"
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
                  register={register}
                  errors={errors}
                  setValue={setValue} // Passing setValue for location resets
                  watch={watch}
                  isFormLocked={isFormLocked}
                  files={uploadedFiles}
                  onUpload={handleUpload}
                  onDelete={handleDelete}
                  onView={handleView}
                  curT={curT}
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
                  isFormLocked={isFormLocked}
                  files={uploadedFiles}
                  onUpload={handleUpload}
                  onDelete={handleDelete}
                  onView={handleView}
                  curT={curT}
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
                  isFormLocked={isFormLocked}
                  files={uploadedFiles}
                  onUpload={handleUpload}
                  onDelete={handleDelete}
                  onView={handleView}
                  curT={curT}
                />
              </div>

              {/* Form Navigation/Status Hint */}
              {!isFormLocked && (
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
                      { label: curT.orgName, value: watch("agencyName") },
                      {
                        label: curT.headOffice,
                        value: watch("headOfficeName"),
                      },
                      {
                        label: curT.branchOffice,
                        value: watch("branchOfficeName") || "-",
                      },
                      { label: curT.agencyphone, value: watch("agencyphone") },
                      { label: curT.email, value: watch("email") },
                      { label: curT.region, value: watch("region") },
                      { label: curT.zone, value: watch("zone") },
                      { label: curT.woreda, value: watch("woreda") },
                      { label: curT.kebele, value: watch("kebele") },
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
                  <div className="p-8">
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
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                                    value: personnelData?.region,
                                  },
                                  { label: "Zone", value: personnelData?.zone },
                                  {
                                    label: "Woreda",
                                    value: personnelData?.woreda,
                                  },
                                  {
                                    label: "Kebele",
                                    value: personnelData?.kebele,
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

                            {/* Documents Section */}
                            <div className="pt-4 border-t border-gray-100">
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">
                                Documents
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                  `${prefix}fingerprint_doc`,
                                  `${prefix}medical_doc`,
                                  `${prefix}training_doc`,
                                  `${prefix}support_doc`,
                                  `${prefix}collateral_doc`,
                                  `${prefix}experience_doc`,
                                  `${prefix}resignation_letter_doc`,
                                  `${prefix}education_doc`,
                                  `${prefix}id_passport_or_kabele_doc`,
                                  `${prefix}organization_Id_doc`,
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

                {/* 5. Guards (Summary) */}
                <section className="bg-gray-50/50 rounded-[32px] border border-gray-100 overflow-hidden">
                  <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-red-600">
                      <Shield className="w-5 h-5" />
                      <h4 className="font-black text-xs uppercase tracking-widest">
                        Guards Recruitment Criteria
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(5)}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                    >
                      Edit Criteria
                    </button>
                  </div>
                  <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        Mandatory Requirements Status
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "No Criminal Record",
                          "Healthy / Medical Fit",
                          "Training Completed",
                          "Fingerprint Verified",
                        ].map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-green-50 text-green-600 text-[9px] font-black uppercase rounded-full border border-green-100"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        Education Distribution
                      </p>
                      <div className="flex items-center space-x-6 text-primary">
                        <div>
                          <p className="text-2xl font-black italic">80%</p>
                          <p className="text-[8px] font-bold text-gray-400 uppercase">
                            Grades 9-12
                          </p>
                        </div>
                        <div className="w-px h-8 bg-gray-200" />
                        <div>
                          <p className="text-2xl font-black italic">20%</p>
                          <p className="text-[8px] font-bold text-gray-400 uppercase">
                            Cert / Diploma
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <div className="p-8 bg-primary/5 rounded-[40px] border-2 border-dashed border-primary/20 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-white text-primary rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3">
                  <Shield className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h5 className="text-xl font-black text-primary uppercase tracking-tight">
                    Ready for Final Submission?
                  </h5>
                  <p className="text-xs text-gray-500 max-w-lg mx-auto">
                    By submitting, you certify that all information above is
                    true and that you possess all original documents for
                    verification during the Federal Police site visit.
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
          {step === 6 ? (
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
