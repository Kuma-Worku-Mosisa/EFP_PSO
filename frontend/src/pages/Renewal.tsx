import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { CheckCircle2, FileText, Upload, Shield, Users, CreditCard, ArrowRight, ArrowLeft, Eye, RefreshCw, X, AlertCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '../lib/utils';

const renewalSchema = z.object({
  agencyName: z.string().min(3, 'Agency name is required'),
  headOfficeName: z.string().min(3, 'Head office name is required'),
  branchOfficeName: z.string().optional(),
  fax: z.string().optional(),
  region: z.string().min(1, 'Region is required'),
  zone: z.string().min(1, 'Zone is required'),
  woreda: z.string().min(1, 'Woreda is required'),
  kebele: z.string().min(1, 'Kebele is required'),
  houseNumber: z.string().min(1, 'House number is required'),
  phone: z.string().min(10, 'Invalid phone number'),
  email: z.string().email('Invalid email address'),
  specialLocation: z.string().optional(),
});

type RenewalFormValues = z.infer<typeof renewalSchema>;

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
    <div className="space-y-2.5 relative group text-left">
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
            disabled && !isOpenedForEdit ? "bg-gray-100/80 border-gray-100 cursor-not-allowed opacity-75 grayscale" : "rounded-2xl shadow-inner",
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
      
      <div className="flex items-center justify-between gap-4 text-left">
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
          <div className="flex-1 min-w-0 text-left">
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

export const Renewal = () => {
  const { language } = useLanguage();
  const [step, setStep] = React.useState(1);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [appStatus, setAppStatus] = React.useState<'draft' | 'pending' | 'reviewing' | 'correction'>('draft');
  const [openedFields, setOpenedFields] = React.useState<string[]>(['trade_license']); // Mock admin opened fields
  const [uploadedFiles, setUploadedFiles] = React.useState<Record<string, File | null>>({});
  const [managerChanged, setManagerChanged] = React.useState(false);
  const [opsChanged, setOpsChanged] = React.useState(false);
  const [adminChanged, setAdminChanged] = React.useState(false);
  
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
  } = useForm<RenewalFormValues>({
    resolver: zodResolver(renewalSchema),
  });

  const isFormLocked = isSubmitted || appStatus === 'pending' || appStatus === 'reviewing';

  const nextStep = async () => {
    let fieldsToValidate: (keyof RenewalFormValues)[] = [];
    if (step === 1) {
      fieldsToValidate = ['agencyName', 'headOfficeName', 'region', 'zone', 'woreda', 'kebele', 'houseNumber', 'phone', 'email'];
    }
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid || step > 1) {
      setStep(Math.min(7, step + 1));
    }
  };

  const onSubmit = async (data: RenewalFormValues) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitted(true);
  };

  const t_renewal = {
    en: {
      title: "Renewal: Agency & Office Information",
      agencyName: "Organization Name",
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
      docsTitle: "Renewal Documents",
      docsDesc: "Upload mandatory legal and organizational documents for renewal.",
      assetsTitle: "Assets & Facilities",
      assetsDesc: "Provide updated details about your physical assets.",
      offices: "No. of Offices",
      storeHouse: "Has Store House?",
      computers: "No. of Computers",
      vehicles: "No. of Vehicles",
      trainingTitle: "Training Status",
      trainingDesc: "Details about the organization's training program for renewal.",
      trainingPlace: "Place where training is provided",
      trainingProvider: "Training Provider",
      trainingDays: "No. of Days Trained",
      personnelTitle: "Personnel & Management",
      personnelDesc: "Update status of key managers and personnel.",
      managerChangeLabel: "Manager Changed?",
      opsChangeLabel: "Operations Head Changed?",
      adminChangeLabel: "Administration Head Changed?",
      dismissed: "Employees Dismissed",
      hired: "New Employees Hired",
      guardsTitle: "Security Guards Requirements",
      guardsDesc: "Recruitment criteria and education level distribution.",
      eduTitle: "Security Guards Education Level",
      reviewTitle: "Final Renewal Review",
      reviewDesc: "Please ensure all renewal documents are current. False information may lead to license revocation.",
      agency: "Agency",
      status: "Renewal Status",
      qualification: "Qualification Granted",
      criteria: "Renewal Criteria",
      warning: "Written Warning",
      back: "Back",
      continue: "Continue",
      submit: "Submit Renewal",
      processing: "Processing...",
      notChanged: "Not Changed",
      changed: "Changed",
      yes: "Yes",
      no: "No",
      met: "Met",
      notMet: "Not Met",
    },
    am: {
      title: "እድሳት፡ የተቋም እና የቢሮ መረጃ",
      agencyName: "የተቋሙ ስም",
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
      docsTitle: "የእድሳት ሰነዶች",
      docsDesc: "ለእድሳት የሚያስፈልጉ ህጋዊ እና ድርጅታዊ ሰነዶችን ይስቀሉ።",
      assetsTitle: "ንብረቶች እና መገልገያዎች",
      assetsDesc: "ስለ ቁሳዊ ንብረቶችዎ ወቅታዊ መረጃ ይስጡ።",
      offices: "የቢሮዎች ብዛት",
      storeHouse: "መጋዘን አለው?",
      computers: "የኮምፒውተሮች ብዛት",
      vehicles: "የተሸከርካሪዎች ብዛት",
      trainingTitle: "የስልጠና ሁኔታ",
      trainingDesc: "ስለ ተቋሙ የስልጠና ፕሮግራም ዝርዝር መረጃ።",
      trainingPlace: "ስልጠናው የሚሰጥበት ቦታ",
      trainingProvider: "ስልጠና ሰጪ አካል",
      trainingDays: "የሰለጠኑበት ቀናት ብዛት",
      personnelTitle: "ሰራተኞች እና አመራር",
      personnelDesc: "የቁልፍ ስራ አስኪያጆች እና ሰራተኞች ሁኔታን ያዘምኑ።",
      managerChangeLabel: "ስራ አስኪያጅ ተቀይሯል?",
      opsChangeLabel: "ኦፕሬሽን ኃላፊ ተቀይሯል?",
      adminChangeLabel: "አስተዳደር ኃላፊ ተቀይሯል?",
      dismissed: "የተሰናበቱ ሰራተኞች",
      hired: "አዲስ የተቀጠሩ ሰራተኞች",
      guardsTitle: "የጥበቃ ሰራተኞች መስፈርቶች",
      guardsDesc: "የምልመላ መስፈርቶች እና የትምህርት ደረጃ ስርጭት።",
      eduTitle: "የጥበቃ ሰራተኞች የትምህርት ደረጃ",
      reviewTitle: "የመጨረሻ የእድሳት ግምገማ",
      reviewDesc: "እባክዎ ሁሉም የእድሳት ሰነዶች ወቅታዊ መሆናቸውን ያረጋግጡ። የተሳሳተ መረጃ መስጠት ፈቃድ እንዲሰረዝ ሊያደርግ ይችላል።",
      agency: "ተቋም",
      status: "የእድሳት ሁኔታ",
      qualification: "የተሰጠው ብቃት",
      criteria: "የእድሳት መስፈርት",
      warning: "የጽሁፍ ማስጠንቀቂያ",
      back: "ተመለስ",
      continue: "ቀጥል",
      submit: "እድሳቱን አቅርብ",
      processing: "በማቀነባበር ላይ...",
      notChanged: "አልተቀየረም",
      changed: "ተቀይሯል",
      yes: "አዎ",
      no: "አይ",
      met: "አሟልቷል",
      notMet: "አላሟላም",
    }
  };

  const curT = t_renewal[language as keyof typeof t_renewal] || t_renewal.en;

  const steps = [
    { id: 1, title: language === 'am' ? "መረጃ" : "Agency Info", icon: FileText },
    { id: 2, title: language === 'am' ? "ሰነዶች" : "Org Docs", icon: Upload },
    { id: 3, title: language === 'am' ? "ንብረት" : "Assets", icon: Shield },
    { id: 4, title: language === 'am' ? "ስልጠና" : "Training", icon: CheckCircle2 },
    { id: 5, title: language === 'am' ? "ሰራተኞች" : "Personnel", icon: Users },
    { id: 6, title: language === 'am' ? "ጥበቃ" : "Guards", icon: Shield },
    { id: 7, title: language === 'am' ? "ግምገማ" : "Review", icon: CheckCircle2 },
  ];

  if (isSubmitted) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 pb-20">
        <div className="bg-white rounded-[40px] shadow-xl p-12 border border-gray-100 space-y-12">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center shadow-lg ring-4 ring-amber-50">
              <RefreshCw className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-primary uppercase tracking-tighter">Renewal Submitted</h2>
              <p className="text-gray-500 max-w-md mx-auto">Your annual renewal application is now under review. You can see all submitted details below but cannot make changes unless requested by an admin.</p>
            </div>
            <div className="px-4 py-2 bg-primary/5 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/10">
               Status: Pending Renewal Review
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          <div className="space-y-12">
            <section className="space-y-6">
              <h3 className="text-xl font-bold text-primary flex items-center space-x-3">
                 <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm font-black">1</div>
                 <span>General Information</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 bg-gray-50/50 p-8 rounded-3xl border border-gray-100">
                {[
                  { label: "Agency Name", value: watch('agencyName') },
                  { label: "Phone", value: watch('phone') },
                  { label: "Email", value: watch('email') },
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
                 <span>Renewal Documents</span>
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

            <div className="p-8 bg-gray-50 border border-dashed border-gray-200 rounded-[40px] text-center italic text-gray-400 text-sm">
              All additional records (Assets, Personnel, Training, and Guard Distributions) are securely preserved in the official archival record.
            </div>
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
                <h3 className="text-2xl font-bold text-primary">{curT.title}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormInput label={curT.agencyName} name="agencyName" register={register} value={watch('agencyName')} error={errors.agencyName} disabled={isFormLocked} isOpenedForEdit={openedFields.includes('agencyName')} />
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
                <FormInput label="Special Location Name (Optional)" name="specialLocation" register={register} value={watch('specialLocation')} error={errors.specialLocation} disabled={isFormLocked} isOpenedForEdit={openedFields.includes('specialLocation')} />
                <div className="md:col-span-2">
                  <FormInput label={curT.email} name="email" register={register} value={watch('email')} error={errors.email} disabled={isFormLocked} isOpenedForEdit={openedFields.includes('email')} />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-primary">{curT.docsTitle}</h3>
                <p className="text-sm text-gray-500">{curT.docsDesc}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: language === 'am' ? "የንግድ ስም ምደባ" : "Trade name designation", key: "trade_name" },
                  { label: language === 'am' ? "የንግድ ቅድመ-ምዝገባ" : "Trade pre-registration", key: "trade_pre" },
                  { label: language === 'am' ? "የታደሰ የንግድ ፈቃድ" : "Business license renewed", key: "trade_license" },
                  { label: language === 'am' ? "የሰራተኛ እና ክህሎት ቢሮ" : "Bureau of Labor and Skills", key: "labor_skill" },
                  { label: language === 'am' ? "የግብር ከፋይ ማጽጃ" : "Taxpayer clearance", key: "tax_clearance" },
                  { label: language === 'am' ? "የኢንሹራንስ ሽፋን" : "Insurance coverage", key: "insurance" },
                  { label: language === 'am' ? "ጥቅም ላይ የዋሉ ቴክኖሎጂዎች ዝርዝር" : "List of technology used", key: "tech_list" },
                  { label: language === 'am' ? "ካፒታል (የባንክ መግለጫ)" : "Capital (Bank statement)", key: "capital" },
                  { label: language === 'am' ? "የደመወዝ ክፍያ (ፔሮል)" : "Payroll (pay slip)", key: "payroll" },
                  { label: language === 'am' ? "የማህበራዊ ዋስትና ክፍያ ደረሰኝ" : "Social Security Payment Slip", key: "social_security" },
                  { label: language === 'am' ? "ከአገልግሎት ተጠቃሚ ጋር የተደረገ ውል" : "Contract with service user", key: "user_contract" }
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
                <h3 className="text-2xl font-bold text-primary">{curT.assetsTitle}</h3>
                <p className="text-sm text-gray-500">{curT.assetsDesc}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">{curT.offices}</label>
                  <input type="number" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">{curT.storeHouse}</label>
                  <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary">
                    <option value="yes">{curT.yes}</option>
                    <option value="no">{curT.no}</option>
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
                  label={language === 'am' ? "የቢሮ ኪራይ ውል (1 ዓመት የቀረው)" : "Office Tenancy Agreement (1 Year Remaining)"} 
                  file={uploadedFiles.office_lease}
                  onUpload={(file) => handleUpload('office_lease', file)}
                  onDelete={() => handleDelete('office_lease')}
                  onView={handleView}
                />
                <FileUpload 
                  label={language === 'am' ? "የተቋሙ ቤት ኪራይ ውል" : "Institution House Lease Agreement"} 
                  file={uploadedFiles.house_lease}
                  onUpload={(file) => handleUpload('house_lease', file)}
                  onDelete={() => handleDelete('house_lease')}
                  onView={handleView}
                />
                <FileUpload 
                  label={language === 'am' ? "የመኪና ባለቤትነት ፈቃድ (የኪራይ ውል)" : "Car Owner's License (Lease Agreement)"} 
                  file={uploadedFiles.car_lease}
                  onUpload={(file) => handleUpload('car_lease', file)}
                  onDelete={() => handleDelete('car_lease')}
                  onView={handleView}
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-primary">{language === 'am' ? 'የፎቶ ናሙናዎች' : 'Photo Samples'}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FileUpload 
                    label={language === 'am' ? "የዩኒፎርም ናሙና" : "Uniform Sample"} 
                    type="photo" 
                    file={uploadedFiles.uniform_sample}
                    onUpload={(file) => handleUpload('uniform_sample', file)}
                    onDelete={() => handleDelete('uniform_sample')}
                    onView={handleView}
                  />
                  <FileUpload 
                    label={language === 'am' ? "የመታወቂያ ናሙና (ፊት እና ጀርባ)" : "Employee ID Sample (Front & Back)"} 
                    type="photo" 
                    file={uploadedFiles.id_sample}
                    onUpload={(file) => handleUpload('id_sample', file)}
                    onDelete={() => handleDelete('id_sample')}
                    onView={handleView}
                  />
                  <FileUpload 
                    label={language === 'am' ? "የቅጥር ፎርም" : "Employment Form"} 
                    type="photo" 
                    file={uploadedFiles.employment_form}
                    onUpload={(file) => handleUpload('employment_form', file)}
                    onDelete={() => handleDelete('employment_form')}
                    onView={handleView}
                  />
                  <FileUpload 
                    label={language === 'am' ? "የቅጥር ዋስትና ፎርም" : "Employment Warranty Form"} 
                    type="photo" 
                    file={uploadedFiles.warranty_form}
                    onUpload={(file) => handleUpload('warranty_form', file)}
                    onDelete={() => handleDelete('warranty_form')}
                    onView={handleView}
                  />
                  <FileUpload 
                    label={language === 'am' ? "የተቋሙ አርማ (ሎጎ)" : "Logo of Organization"} 
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
                <h3 className="text-2xl font-bold text-primary">{curT.trainingTitle}</h3>
                <p className="text-sm text-gray-500">{curT.trainingDesc}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">{curT.trainingPlace}</label>
                  <input className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">{curT.trainingProvider}</label>
                  <input className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">{curT.trainingDays}</label>
                  <input type="number" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">{language === 'am' ? 'ወንድ' : 'Male'}</label>
                    <input type="number" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">{language === 'am' ? 'ሴት' : 'Female'}</label>
                    <input type="number" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">{language === 'am' ? 'ጠቅላላ' : 'Total'}</label>
                    <input type="number" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <FileUpload 
                    label={language === 'am' ? "የስልጠና ምስክር ወረቀት" : "Training Certificate"} 
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
                <h3 className="text-2xl font-bold text-primary">{curT.personnelTitle}</h3>
                <p className="text-sm text-gray-500">{curT.personnelDesc}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-50 rounded-[32px]">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-primary">{curT.managerChangeLabel}</label>
                  <select 
                    value={managerChanged ? 'changed' : 'notChanged'}
                    onChange={(e) => setManagerChanged(e.target.value === 'changed')}
                    className="w-full p-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="notChanged">{curT.notChanged}</option>
                    <option value="changed">{curT.changed}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-primary">{curT.opsChangeLabel}</label>
                  <select 
                    value={opsChanged ? 'changed' : 'notChanged'}
                    onChange={(e) => setOpsChanged(e.target.value === 'changed')}
                    className="w-full p-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="notChanged">{curT.notChanged}</option>
                    <option value="changed">{curT.changed}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-primary">{curT.adminChangeLabel}</label>
                  <select 
                    value={adminChanged ? 'changed' : 'notChanged'}
                    onChange={(e) => setAdminChanged(e.target.value === 'changed')}
                    className="w-full p-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="notChanged">{curT.notChanged}</option>
                    <option value="changed">{curT.changed}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-primary">{curT.dismissed}</label>
                  <input type="number" className="w-full p-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary" placeholder="0" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-primary">{curT.hired}</label>
                  <input type="number" className="w-full p-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary" placeholder="0" />
                </div>
              </div>

              <AnimatePresence>
                {(managerChanged || opsChanged || adminChanged) && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-12 overflow-hidden"
                  >
                    {managerChanged && (
                      <PersonnelSection 
                        title={language === 'am' ? "የተቋሙ ስራ አስኪያጅ" : "Manager of Organization"} 
                        prefix="manager" 
                        files={uploadedFiles}
                        onUpload={handleUpload}
                        onDelete={handleDelete}
                        onView={handleView}
                        curT={curT}
                      />
                    )}
                    {opsChanged && (
                      <PersonnelSection 
                        title={language === 'am' ? "የኦፕሬሽን ኃላፊ" : "Operations Head"} 
                        prefix="ops" 
                        files={uploadedFiles}
                        onUpload={handleUpload}
                        onDelete={handleDelete}
                        onView={handleView}
                        curT={curT}
                      />
                    )}
                    {adminChanged && (
                      <PersonnelSection 
                        title={language === 'am' ? "የአስተዳደር ኃላፊ" : "Administration Head"} 
                        prefix="admin" 
                        files={uploadedFiles}
                        onUpload={handleUpload}
                        onDelete={handleDelete}
                        onView={handleView}
                        curT={curT}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-primary">{curT.guardsTitle}</h3>
                <p className="text-sm text-gray-500">{curT.guardsDesc}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: language === 'am' ? "የዜግነት ማረጋገጫ" : "Citizenship Proof", key: "guard_citizenship" },
                  { label: language === 'am' ? "የቀበሌ መታወቂያ / ፓስፖርት የታደሰ" : "Kebele ID / Passport Renewed", key: "guard_id" },
                  { label: language === 'am' ? "የአሻራ ምርመራ ከፖሊስ" : "Fingerprint from Police", key: "guard_fingerprint" },
                  { label: language === 'am' ? "የጤና ምርመራ ምስክር ወረቀት" : "Medical Certificate", key: "guard_medical" },
                  { label: language === 'am' ? "የስራ ልምድ ምስክር ወረቀት" : "Work Experience Certificate", key: "guard_experience" },
                  { label: language === 'am' ? "የስራ መልቀቂያ" : "Resignation (Release)", key: "guard_resignation" },
                  { label: language === 'am' ? "የትምህርት ማስረጃ" : "School Certificate", key: "guard_school" },
                  { label: language === 'am' ? "የተቋሙ መታወቂያ የታደሰ" : "Renewed Institution ID", key: "guard_inst_id" },
                  { label: language === 'am' ? "የዋስትና ማረጋገጫ" : "Guarantee (Guarantor) Proof", key: "guard_guarantee" },
                  { label: language === 'am' ? "የድጋፍ ደብዳቤ (ከቀበሌ)" : "Support Letter (Kebele)", key: "guard_support" },
                  { label: language === 'am' ? "የቅጥር ደብዳቤ" : "Employment Letter", key: "guard_employment" },
                  { label: language === 'am' ? "የስልጠና ምስክር ወረቀት" : "Training Certificate", key: "guard_training" },
                  { label: language === 'am' ? "ብሄራዊ ዲጂታል መታወቂያ ካርድ" : "National Digital ID Card", key: "guard_digital_id" }
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

              <div className="space-y-6 bg-gray-50 p-6 rounded-[32px]">
                <h4 className="font-bold text-primary">{curT.eduTitle}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    language === 'am' ? "ከ3ኛ እስከ 9ኛ ክፍል" : "3rd to 9th Grade",
                    language === 'am' ? "ከ10ኛ እስከ 12ኛ ክፍል" : "10th to 12th Grade",
                    language === 'am' ? "ሰርተፍኬት" : "Certificate",
                    language === 'am' ? "ዲፕሎማ" : "Diploma",
                    language === 'am' ? "ዲግሪ" : "Degree",
                    language === 'am' ? "ሁለተኛ ዲግሪ" : "Second Degree"
                  ].map((level, i) => (
                    <div key={i} className="space-y-2">
                      <label className="text-xs font-bold text-gray-500">{level}</label>
                      <div className="grid grid-cols-3 gap-2">
                        <input type="number" placeholder="M" className="p-2 bg-white border border-gray-200 rounded-lg text-xs" />
                        <input type="number" placeholder="F" className="p-2 bg-white border border-gray-200 rounded-lg text-xs" />
                        <input type="number" placeholder="T" className="p-2 bg-white border border-gray-200 rounded-lg text-xs" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 7 && (
            <motion.div key="step7" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 text-center">
              <div className="w-24 h-24 bg-blue-100 text-primary rounded-full flex items-center justify-center mx-auto mb-8">
                <Shield className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-primary">{curT.reviewTitle}</h3>
                <p className="text-gray-500 max-w-md mx-auto">{curT.reviewDesc}</p>
              </div>
              <div className="bg-gray-50 p-8 rounded-[32px] text-left grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{curT.agency}</p>
                  <p className="text-lg font-bold text-primary">Abyssinia Security Services</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{curT.status}</p>
                  <p className="text-lg font-bold text-primary">{Object.keys(uploadedFiles).length} Files Updated</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{curT.qualification}</p>
                  <select className="w-full p-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-primary">
                    <option>{language === 'am' ? 'የመጀመሪያ' : 'First'}</option>
                    <option>{language === 'am' ? 'ሁለተኛ' : 'Second'}</option>
                    <option>{language === 'am' ? 'ሶስተኛ' : 'Third'}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{curT.criteria}</p>
                  <select className="w-full p-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-primary">
                    <option value="met">{curT.met}</option>
                    <option value="notMet">{curT.notMet}</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{curT.warning}</p>
                  <textarea className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-sm" placeholder="..."></textarea>
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
          {step === 7 ? (
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
