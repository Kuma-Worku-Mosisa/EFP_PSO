import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { CheckCircle2, Circle, FileText, Upload, Shield, Users, MapPin, CreditCard, ArrowRight, ArrowLeft, AlertCircle, Eye, RefreshCw, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '../lib/utils';
import { DigitalPayment } from '../components/DigitalPayment';

const applicationSchema = z.object({
  // Step 1: Agency Info
  agencyName: z.string().min(3, 'Agency name is required'),
  headOfficeName: z.string().min(3, 'Head office name is required'),
  branchOfficeName: z.string().optional(),
  region: z.string().min(1, 'Region is required'),
  zone: z.string().min(1, 'Zone is required'),
  woreda: z.string().min(1, 'Woreda is required'),
  kebele: z.string().min(1, 'Kebele is required'),
  houseNumber: z.string().min(1, 'House number is required'),
  phone: z.string().min(10, 'Invalid phone number'),
  fax: z.string().optional(),
  email: z.string().email('Invalid email address'),
  specialLocation: z.string().optional(),

  // Step 3 & 4: Assets
  officesCount: z.string().optional(),
  computersCount: z.string().optional(),
  vehiclesCount: z.string().optional(),
  hasStoreHouse: z.boolean().optional(),

  // Step 5: Personnel (Simplified for schema, but UI will have all)
  managerName: z.string().min(3, 'Manager name is required'),
  opsHeadName: z.string().min(3, 'Operations head name is required'),
  adminHeadName: z.string().min(3, 'Administration head name is required'),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

const ViewerModal = ({ 
  isOpen, 
  onClose, 
  file, 
  previewUrl 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  file: File | null, 
  previewUrl: string | null 
}) => {
  const [rotation, setRotation] = React.useState(0);

  React.useEffect(() => {
    if (!isOpen) setRotation(0);
  }, [isOpen]);

  if (!isOpen || !file) return null;

  const isImage = file.type.startsWith('image/');
  const isPDF = file.type === 'application/pdf';

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
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
              <p className="text-xs text-gray-500 uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
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
                <p className="text-sm text-gray-500">This file type cannot be previewed directly. You can download it to verify contents.</p>
              </div>
              <button 
                onClick={() => window.open(previewUrl || '', '_blank')}
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
  isOpenedForEdit = false
}: { 
  label: string, 
  value?: string,
  register: any, 
  name: string, 
  placeholder?: string, 
  type?: string,
  error?: any,
  disabled?: boolean,
  isOpenedForEdit?: boolean
}) => {
  const isFilled = value && value.length > 0;
  
  return (
    <div className="space-y-2.5 relative group">
      <div className="flex justify-between items-center px-1">
        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
        {isFilled && !error && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center space-x-1.5 text-[10px] text-green-500 font-black uppercase tracking-widest">
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
            error ? "border-red-300 ring-4 ring-red-50 bg-red-50/10" : "focus:border-primary focus:ring-4 focus:ring-primary/10",
            disabled && !isOpenedForEdit ? "bg-gray-100/80 border-gray-100 cursor-not-allowed opacity-75 grayscale" : "rounded-2xl",
            isOpenedForEdit && "border-amber-400 ring-4 ring-amber-50 animate-pulse border-dashed bg-amber-50/20"
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
        <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] text-red-500 font-bold ml-2 uppercase tracking-wider flex items-center space-x-1">
          <AlertCircle className="w-3 h-3" />
          <span>{error.message}</span>
        </motion.p>
      )}
    </div>
  );
};

const FileUpload = ({ 
  label, 
  type = 'document', 
  required = true,
  file,
  onUpload,
  onDelete,
  onView,
  disabled = false,
  isOpenedForEdit = false
}: { 
  label: string, 
  type?: 'document' | 'photo', 
  required?: boolean,
  file?: File | null,
  onUpload: (file: File) => void,
  onDelete: () => void,
  onView: (file: File, url: string | null) => void,
  disabled?: boolean,
  isOpenedForEdit?: boolean
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
    <div className={cn(
      "group relative rounded-[28px] border-2 transition-all duration-500 p-5",
      file 
        ? "bg-white border-solid border-green-200 shadow-lg shadow-green-500/5 ring-4 ring-green-50/30" 
        : "bg-gray-50/50 border-dashed border-gray-200 hover:border-primary/40 hover:bg-white cursor-pointer hover:shadow-xl",
      isOpenedForEdit && "border-amber-400 bg-amber-50/20 ring-4 ring-amber-50 animate-pulse border-dashed"
    )}>
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
        accept={type === 'photo' ? "image/*" : ".pdf,.doc,.docx"}
      />
      
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center space-x-5 flex-1 min-w-0">
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 flex-shrink-0 shadow-sm",
            file ? "bg-green-50 text-green-500" : "bg-white border text-gray-400 group-hover:scale-105 group-hover:text-primary group-hover:shadow-lg"
          )}>
            {isOpenedForEdit ? (
              <RefreshCw className="w-8 h-8 animate-spin-slow text-amber-500" />
            ) : (
              file ? <FileText className="w-8 h-8" /> : (type === 'photo' ? <Users className="w-8 h-8" /> : <Upload className="w-8 h-8" />)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={cn(
              "font-black text-sm uppercase tracking-tight truncate",
              file ? "text-green-600" : "text-primary/70 group-hover:text-primary"
            )}>
              {file ? file.name : label}
            </h4>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : (type === 'photo' ? 'JPG, PNG Max 2MB' : 'PDF, DOCX Max 5MB')}
              </span>
              {required && !file && (
                <span className="text-[10px] text-amber-500 font-black uppercase tracking-widest bg-amber-50 px-1.5 rounded-md">Required</span>
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

const PersonnelSection = ({ 
  title, 
  prefix,
  files,
  onUpload,
  onDelete,
  onView,
  curT
}: { 
  title: string, 
  prefix: string,
  files: Record<string, File | null>,
  onUpload: (key: string, file: File) => void,
  onDelete: (key: string) => void,
  onView: (file: File, url: string | null) => void,
  curT: any
}) => {
  const personnelDocs = [
    { label: "Fingerprint from Police", key: "fingerprint" },
    { label: "Medical Result", key: "medical" },
    { label: "Training Certificate", key: "training" },
    { label: "Support Letter (Kebele)", key: "support" },
    { label: "Proof of Collateral", key: "collateral" },
    { label: "Work Experience", key: "experience" },
    { label: "Resignation Record", key: "resignation" },
    { label: "Educational Cert (Degree)", key: "education" },
    { label: "National ID", key: "nationalId" },
    { label: "Renewed Kebele ID/Passport", key: "idPassport" },
    { label: "Org Identification", key: "orgId" },
  ];

  return (
    <div className="space-y-6 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
      <h4 className="text-lg font-bold text-primary flex items-center space-x-2">
        <Users className="w-5 h-5" />
        <span>{title}</span>
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 ml-1">Full Name</label>
          <input type="text" className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm" placeholder="Full Name" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 ml-1">Gender</label>
            <select className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm">
              <option>Male</option>
              <option>Female</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 ml-1">Citizenship</label>
            <input type="text" className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm" placeholder="Ethiopian" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-6">
        <div className="space-y-1 text-left">
          <label className="text-xs font-bold text-gray-500 ml-1">{curT.faydaId}</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input type="text" className="flex-1 p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm" placeholder="FAYDA-XXXXX" />
            <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-xl border border-gray-200 w-full sm:w-40">
              <Shield className="w-4 h-4 text-primary shrink-0" />
              <input type="text" placeholder={curT.otp} className="w-full bg-transparent border-none outline-none text-xs font-bold text-primary" />
            </div>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 ml-1">{curT.email}</label>
          <input type="email" className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm" placeholder="email@example.com" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 ml-1">{curT.phone}</label>
          <input type="tel" className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm" placeholder="+251..." />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 ml-1">{curT.region}</label>
          <input type="text" className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 ml-1">{curT.zone}</label>
          <input type="text" className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 ml-1">{curT.woreda}</label>
          <input type="text" className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 ml-1">{curT.kebele}</label>
          <input type="text" className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 ml-1">{curT.houseNo}</label>
          <input type="text" className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 ml-1">{curT.specialLocation}</label>
          <input type="text" className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-6">
        {personnelDocs.map((doc) => (
          <div key={doc.key} className="space-y-2">
            <FileUpload 
              label={doc.label} 
              file={files[`${prefix}_${doc.key}`]}
              onUpload={(file) => onUpload(`${prefix}_${doc.key}`, file)}
              onDelete={() => onDelete(`${prefix}_${doc.key}`)}
              onView={onView}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export const NewApplication = () => {
  const { language } = useLanguage();
  const [step, setStep] = React.useState(1);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [appStatus, setAppStatus] = React.useState<'draft' | 'pending' | 'reviewing' | 'correction'>('draft');
  const [openedFields, setOpenedFields] = React.useState<string[]>(['trade_license', 'kebele_id_m_2024']); // Mock admin opened fields
  const [uploadedFiles, setUploadedFiles] = React.useState<Record<string, File | null>>({});

  const isFormLocked = isSubmitted || appStatus === 'pending' || appStatus === 'reviewing';

  const t_new = {
    en: {
      steps: ["Agency Info", "Org Docs", "Assets", "Training", "Personnel", "Review"],
      submittedTitle: "Application Submitted!",
      submittedDesc: "Your application for a new private security agency license has been successfully submitted. The Federal Police will review your documents and contact you for the next steps.",
      step1Title: "Agency & Office Information",
      orgName: "Organization Name",
      headOffice: "Head Office Name",
      branchOffice: "Branch Office Name (Optional)",
      fax: "Fax Number",
      region: "Region",
      zone: "Zone",
      woreda: "Woreda",
      kebele: "Kebele",
      houseNo: "House No.",
      phone: "Phone Number",
      email: "Email Address",
      specialLocation: "Special Location Name (Optional)",
      faydaId: "Fayda ID Number",
      otp: "OTP Code",
      step2Title: "Organization Documents",
      step2Desc: "Upload mandatory legal and organizational documents.",
      step3Title: "Assets & Facilities",
      step3Desc: "Provide details about your physical assets and branding.",
      offices: "No. of Offices",
      storeHouse: "Has Store House?",
      computers: "No. of Computers",
      vehicles: "No. of Vehicles",
      step4Title: "Training Status",
      step4Desc: "Details about the organization's training program.",
      step5Title: "Key Personnel Requirements",
      step5Desc: "Provide details and documents for the Manager, Operations Head, and Admin Head.",
      step6Title: "Final Review",
      step6Desc: "Please ensure all uploaded documents and photos are clear and valid. False information may lead to permanent disqualification.",
      back: "Back",
      continue: "Continue",
      submit: "Submit Application",
      processing: "Submitting..."
    },
    am: {
      steps: ["መረጃ", "ሰነዶች", "ንብረቶች", "ስልጠና", "ሰራተኞች", "ግምገማ"],
      submittedTitle: "ማመልከቻው ገብቷል!",
      submittedDesc: "ለአዲስ የግል ጥበቃ ተቋም ፈቃድ ያቀረቡት ማመልከቻ በተሳካ ሁኔታ ገብቷል። ፌዴራል ፖሊስ ሰነዶችዎን ገምግሞ ለቀጣይ እርምጃዎች ያገኝዎታል።",
      step1Title: "የተቋም እና የቢሮ መረጃ",
      orgName: "የተቋሙ ስም",
      headOffice: "የዋና መስሪያ ቤት ስም",
      branchOffice: "የቅርንጫፍ መስሪያ ቤት ስም (አማራጭ)",
      fax: "የፋክስ ቁጥር",
      region: "ክልል",
      zone: "ዞን",
      woreda: "ወረዳ",
      kebele: "ቀበሌ",
      houseNo: "የቤት ቁጥር",
      phone: "ስልክ ቁጥር",
      email: "ኢሜል አድራሻ",
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
      step6Desc: "እባክዎ ሁሉም የተሰቀሉ ሰነዶች እና ፎቶዎች ግልጽ እና ትክክለኛ መሆናቸውን ያረጋግጡ። የተሳሳተ መረጃ መስጠት ለዘላቂ ብቁ አለመሆን ሊያጋልጥ ይችላል።",
      back: "ተመለስ",
      continue: "ቀጥል",
      submit: "ማመልከቻውን አቅርብ",
      processing: "በማቅረብ ላይ..."
    }
  };

  const curT = t_new[language as keyof typeof t_new] || t_new.en;
  
  const [viewerState, setViewerState] = React.useState<{
    isOpen: boolean;
    file: File | null;
    url: string | null;
  }>({
    isOpen: false,
    file: null,
    url: null
  });

  const handleView = (file: File, url: string | null) => {
    setViewerState({ isOpen: true, file, url });
  };

  const handleUpload = (key: string, file: File) => {
    setUploadedFiles(prev => ({ ...prev, [key]: file }));
  };

  const handleDelete = (key: string) => {
    setUploadedFiles(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
  });

  const nextStep = async () => {
    let fieldsToValidate: (keyof ApplicationFormValues)[] = [];
    if (step === 1) {
      fieldsToValidate = ['agencyName', 'headOfficeName', 'region', 'zone', 'woreda', 'kebele', 'houseNumber', 'phone', 'email'];
    }
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid || step > 1) {
      setStep(Math.min(6, step + 1));
    }
  };

  const onSubmit = async (data: ApplicationFormValues) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitted(true);
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
              <h2 className="text-3xl font-black text-primary uppercase tracking-tighter">Application Submitted</h2>
              <p className="text-gray-500 max-w-md mx-auto">Your application is now under review. You can see all submitted details below but cannot make changes unless requested by an admin.</p>
            </div>
            <div className="px-4 py-2 bg-primary/5 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/10">
               Status: Pending Formal Letter Review
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          <div className="space-y-12">
            <section className="space-y-6">
              <h3 className="text-xl font-bold text-primary flex items-center space-x-3">
                 <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm font-black">1</div>
                 <span>{curT.steps[0]}</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 bg-gray-50/50 p-8 rounded-3xl border border-gray-100">
                {[
                  { label: curT.orgName, value: watch('agencyName') },
                  { label: curT.headOffice, value: watch('headOfficeName') },
                  { label: curT.branchOffice, value: watch('branchOfficeName') || '-' },
                  { label: curT.phone, value: watch('phone') },
                  { label: curT.email, value: watch('email') },
                  { label: curT.region, value: watch('region') },
                  { label: curT.zone, value: watch('zone') },
                  { label: curT.woreda, value: watch('woreda') },
                  { label: curT.kebele, value: watch('kebele') },
                  { label: curT.houseNo, value: watch('houseNumber') },
                  { label: "Special Location", value: watch('specialLocation') || '-' },
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.label}</p>
                    <p className="text-sm font-bold text-primary truncate">{item.value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6 text-left">
              <h3 className="text-xl font-bold text-primary flex items-center space-x-3">
                 <div className="w-8 h-8 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center text-sm font-black">2</div>
                 <span>{curT.steps[1]}</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(uploadedFiles).map(([key, file]) => (
                  <div key={key} className="p-5 bg-white border border-green-100 rounded-[24px] flex items-center justify-between group shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center space-x-4">
                       <div className="p-3 bg-green-50 text-green-500 rounded-xl">
                         <FileText className="w-5 h-5" />
                       </div>
                       <div className="min-w-0">
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{key.replace(/_/g, ' ')}</p>
                         <p className="text-xs font-bold text-primary truncate max-w-[150px]">{file?.name}</p>
                         <div className="flex items-center space-x-1 mt-1 text-[8px] font-black text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full inline-flex">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>UPLOADED</span>
                         </div>
                       </div>
                    </div>
                    <button 
                      onClick={() => file && handleView(file, null)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6 text-left">
              <h3 className="text-xl font-bold text-primary flex items-center space-x-3">
                 <div className="w-8 h-8 bg-amber-50 text-amber-500 rounded-lg flex items-center justify-center text-sm font-black">3</div>
                 <span>{curT.steps[2]} & {curT.steps[3]}</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 bg-gray-50/50 p-8 rounded-[32px] border border-gray-100">
                {[
                  { label: "Offices", value: watch('officesCount') },
                  { label: "Computers", value: watch('computersCount') },
                  { label: "Vehicles", value: watch('vehiclesCount') },
                  { label: "Store House", value: watch('hasStoreHouse') ? 'Yes' : 'No' },
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.label}</p>
                    <p className="text-sm font-bold text-primary">{item.value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6 text-left">
              <h3 className="text-xl font-bold text-primary flex items-center space-x-3">
                 <div className="w-8 h-8 bg-purple-50 text-purple-500 rounded-lg flex items-center justify-center text-sm font-black">4</div>
                 <span>Personnel & Management</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 bg-gray-50/50 p-8 rounded-[32px] border border-gray-100">
                {[
                  { label: "Manager Name", value: watch('managerName') },
                  { label: "Ops Head", value: watch('opsHeadName') },
                  { label: "Admin Head", value: watch('adminHeadName') },
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.label}</p>
                    <p className="text-sm font-bold text-primary">{item.value}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="flex justify-center">
             <button type="button" onClick={() => setIsSubmitted(false)} className="px-12 py-4 blue-gradient text-white rounded-2xl font-bold hover:shadow-xl transition-all">
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
          <div key={s.id} className="relative z-10 flex flex-col items-center space-y-2">
            <div 
              className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                step >= s.id ? 'bg-primary text-secondary shadow-lg scale-110' : 'bg-white text-gray-400 border-2 border-gray-200'
              }`}
            >
              {step > s.id ? <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" /> : <s.icon className="w-5 h-5 md:w-6 md:h-6" />}
            </div>
            <span className={`hidden md:block text-[10px] font-bold uppercase tracking-wider ${step >= s.id ? 'text-primary' : 'text-gray-400'}`}>
              {s.title}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-[40px] shadow-xl p-6 md:p-12 border border-gray-100 min-h-[600px] flex flex-col">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-primary">{curT.step1Title}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormInput label={curT.orgName} name="agencyName" register={register} value={watch('agencyName')} error={errors.agencyName} disabled={isFormLocked} isOpenedForEdit={openedFields.includes('agencyName')} />
                  <FormInput label={curT.headOffice} name="headOfficeName" register={register} value={watch('headOfficeName')} error={errors.headOfficeName} disabled={isFormLocked} isOpenedForEdit={openedFields.includes('headOfficeName')} />
                  <FormInput label={curT.branchOffice} name="branchOfficeName" register={register} value={watch('branchOfficeName')} error={errors.branchOfficeName} disabled={isFormLocked} isOpenedForEdit={openedFields.includes('branchOfficeName')} />
                </div>

                <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-5 gap-4">
                  <FormInput label={curT.region} name="region" register={register} value={watch('region')} error={errors.region} disabled={isFormLocked} isOpenedForEdit={openedFields.includes('region')} />
                  <FormInput label={curT.zone} name="zone" register={register} value={watch('zone')} error={errors.zone} disabled={isFormLocked} isOpenedForEdit={openedFields.includes('zone')} />
                  <FormInput label={curT.woreda} name="woreda" register={register} value={watch('woreda')} error={errors.woreda} disabled={isFormLocked} isOpenedForEdit={openedFields.includes('woreda')} />
                  <FormInput label={curT.kebele} name="kebele" register={register} value={watch('kebele')} error={errors.kebele} disabled={isFormLocked} isOpenedForEdit={openedFields.includes('kebele')} />
                  <FormInput label={curT.houseNo} name="houseNumber" register={register} value={watch('houseNumber')} error={errors.houseNumber} disabled={isFormLocked} isOpenedForEdit={openedFields.includes('houseNumber')} />
                </div>

                <FormInput label={curT.phone} name="phone" register={register} value={watch('phone')} error={errors.phone} disabled={isFormLocked} isOpenedForEdit={openedFields.includes('phone')} />
                <FormInput label={curT.fax} name="fax" register={register} value={watch('fax')} error={errors.fax} disabled={isFormLocked} isOpenedForEdit={openedFields.includes('fax')} />
                <FormInput label={curT.specialLocation} name="specialLocation" register={register} value={watch('specialLocation')} error={errors.specialLocation} disabled={isFormLocked} isOpenedForEdit={openedFields.includes('specialLocation')} />
                <div className="md:col-span-2">
                  <FormInput label={curT.email} name="email" register={register} value={watch('email')} error={errors.email} disabled={isFormLocked} isOpenedForEdit={openedFields.includes('email')} />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-primary">{curT.step2Title}</h3>
                <p className="text-sm text-gray-500">{curT.step2Desc}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Trade name designation", key: "trade_name" },
                  { label: "Trade pre-registration", key: "trade_pre" },
                  { label: "Renewed Trade license", key: "trade_license" },
                  { label: "Labor and Skill Bureau registration", key: "labor_skill" },
                  { label: "TIN number", key: "tin" },
                  { label: "Trademark", key: "trademark" },
                  { label: "Organizational structure", key: "org_structure" },
                  { label: "Articles of incorporation", key: "articles" },
                  { label: "Internal regulations", key: "regulations" },
                  { label: "Lists of technologies used", key: "tech_list" },
                  { label: "Capital (Bank statement)", key: "capital" }
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
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-primary">{curT.step3Title}</h3>
                <p className="text-sm text-gray-500">{curT.step3Desc}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">{curT.offices}</label>
                  <input type="number" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">{curT.storeHouse}</label>
                  <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary">
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">{curT.computers}</label>
                  <input type="number" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">{curT.vehicles}</label>
                  <input type="number" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FileUpload 
                  label="Notarized Vehicle Rent/Ownership" 
                  file={uploadedFiles.vehicle_rent}
                  onUpload={(file) => handleUpload('vehicle_rent', file)}
                  onDelete={() => handleDelete('vehicle_rent')}
                  onView={handleView}
                />
                <FileUpload 
                  label="Notarized House Rent/Ownership" 
                  file={uploadedFiles.house_rent}
                  onUpload={(file) => handleUpload('house_rent', file)}
                  onDelete={() => handleDelete('house_rent')}
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
                    onUpload={(file) => handleUpload('uniform_sample', file)}
                    onDelete={() => handleDelete('uniform_sample')}
                    onView={handleView}
                  />
                  <FileUpload 
                    label="Employee ID Sample (Front & Back)" 
                    type="photo" 
                    file={uploadedFiles.id_sample}
                    onUpload={(file) => handleUpload('id_sample', file)}
                    onDelete={() => handleDelete('id_sample')}
                    onView={handleView}
                  />
                  <FileUpload 
                    label="Employment Form" 
                    type="photo" 
                    file={uploadedFiles.employment_form}
                    onUpload={(file) => handleUpload('employment_form', file)}
                    onDelete={() => handleDelete('employment_form')}
                    onView={handleView}
                  />
                  <FileUpload 
                    label="Employment Warranty Form" 
                    type="photo" 
                    file={uploadedFiles.warranty_form}
                    onUpload={(file) => handleUpload('warranty_form', file)}
                    onDelete={() => handleDelete('warranty_form')}
                    onView={handleView}
                  />
                  <FileUpload 
                    label="Logo of Organization" 
                    type="photo" 
                    file={uploadedFiles.logo}
                    onUpload={(file) => handleUpload('logo', file)}
                    onDelete={() => handleDelete('logo')}
                    onView={handleView}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-primary">{curT.step4Title}</h3>
                <p className="text-sm text-gray-500">{curT.step4Desc}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Training Address</label>
                  <input className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">No. of Days Trained</label>
                  <input type="number" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Training Provider Body</label>
                  <input className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="space-y-2">
                  <FileUpload 
                    label="Training Manual" 
                    file={uploadedFiles.training_manual}
                    onUpload={(file) => handleUpload('training_manual', file)}
                    onDelete={() => handleDelete('training_manual')}
                    onView={handleView}
                  />
                </div>
                <div className="md:col-span-2">
                  <FileUpload 
                    label="Certificate of Training" 
                    file={uploadedFiles.training_cert}
                    onUpload={(file) => handleUpload('training_cert', file)}
                    onDelete={() => handleDelete('training_cert')}
                    onView={handleView}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-primary">{curT.step5Title}</h3>
                <p className="text-sm text-gray-500">{curT.step5Desc}</p>
              </div>
              <div className="space-y-12">
                <PersonnelSection 
                  title="Manager of Organization" 
                  prefix="manager" 
                  files={uploadedFiles}
                  onUpload={handleUpload}
                  onDelete={handleDelete}
                  onView={handleView}
                  curT={curT}
                />
                <PersonnelSection 
                  title="Operations Head" 
                  prefix="ops" 
                  files={uploadedFiles}
                  onUpload={handleUpload}
                  onDelete={handleDelete}
                  onView={handleView}
                  curT={curT}
                />
                <PersonnelSection 
                  title="Administration Head" 
                  prefix="admin" 
                  files={uploadedFiles}
                  onUpload={handleUpload}
                  onDelete={handleDelete}
                  onView={handleView}
                  curT={curT}
                />
              </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 text-center">
              <div className="w-24 h-24 bg-blue-100 text-primary rounded-full flex items-center justify-center mx-auto mb-8">
                <Shield className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-primary">{curT.step6Title}</h3>
                <p className="text-gray-500 max-w-md mx-auto">{curT.step6Desc}</p>
              </div>
              <div className="bg-gray-50 p-8 rounded-[32px] text-left grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Agency</p>
                  <p className="text-lg font-bold text-primary">Abyssinia Security Services</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Documents</p>
                  <p className="text-lg font-bold text-primary">{Object.keys(uploadedFiles).length} Files Uploaded</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Personnel</p>
                  <p className="text-lg font-bold text-primary">3 Key Heads Verified</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status</p>
                  <p className="text-lg font-bold text-green-600">Ready for Submission</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between pt-12 mt-auto">
          <button type="button" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1} className="flex items-center space-x-2 px-8 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 disabled:opacity-0 transition-all">
            <ArrowLeft className="w-5 h-5" />
            <span>{curT.back}</span>
          </button>
          {step === 6 ? (
            <button type="submit" disabled={isSubmitting} className="blue-gradient text-white px-10 py-4 rounded-2xl font-bold shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center space-x-2">
              <span>{isSubmitting ? curT.processing : curT.submit}</span>
              {!isSubmitting && <ArrowRight className="w-5 h-5" />}
            </button>
          ) : (
            <button type="button" onClick={nextStep} className="blue-gradient text-white px-10 py-4 rounded-2xl font-bold shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center space-x-2">
              <span>{curT.continue}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      <AnimatePresence>
        <ViewerModal 
          isOpen={viewerState.isOpen}
          onClose={() => setViewerState(prev => ({ ...prev, isOpen: false }))}
          file={viewerState.file}
          previewUrl={viewerState.url}
        />
      </AnimatePresence>
    </div>
  );
};
