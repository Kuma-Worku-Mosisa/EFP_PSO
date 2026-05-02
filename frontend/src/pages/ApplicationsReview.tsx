import React, { useState } from 'react';
import { Search, Filter, CheckCircle, XCircle, Clock, Eye, FileText, Shield, User, Calendar, AlertTriangle, ArrowRight, X, ShieldCheck, RefreshCw, Users, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { cn } from '../lib/utils';

export const ApplicationsReview = () => {
  const { language } = useLanguage();
  const isAm = language === 'am';
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'reviewing' | 'correction'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [viewingStage, setViewingStage] = useState<'selection' | 'formal' | 'new' | 'renewal'>('selection');
  const [docStatuses, setDocStatuses] = useState<Record<string, { status: 'approved' | 'rejected' | 'pending', comment?: string }>>({});
  const [showNotification, setShowNotification] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerFile, setViewerFile] = useState<{ name: string, type: string, size: number } | null>(null);

  const t = {
    title: isAm ? "የማመልከቻዎች ግምገማ" : "Applications Review",
    subtitle: isAm ? "የኤጀንሲዎችን የፈቃድ ማመልከቻዎች ይገምግሙ እና ያጽድቁ/ውድቅ ያድርጉ።" : "Review and approve/reject agency license applications.",
    tabs: {
      all: isAm ? "ሁሉም" : "All",
      pending: isAm ? "በመጠባበቅ ላይ" : "Pending",
      reviewing: isAm ? "በግምገማ ላይ" : "Reviewing",
      correction: isAm ? "ማስተካከያ የሚፈልጉ" : "Need Correction"
    },
    stages: {
      formal: isAm ? "መደበኛ ደብዳቤ" : "Formal Letter",
      new: isAm ? "አዲስ ማመልከቻ" : "New Application",
      renewal: isAm ? "የእድሳት ማመልከቻ" : "Renewal Review"
    },
    table: {
      appId: isAm ? "የማመልከቻ መለያ" : "App ID",
      agency: isAm ? "ኤጀንሲ" : "Agency",
      type: isAm ? "ዓይነት" : "Type",
      date: isAm ? "ቀን" : "Date",
      priority: isAm ? "ቅድሚያ" : "Priority",
      status: isAm ? "ሁኔታ" : "Status",
      actions: isAm ? "እርምጃዎች" : "Actions"
    },
    status: {
      pending: isAm ? "በመጠባበቅ ላይ" : "Pending",
      reviewing: isAm ? "በግምገማ ላይ" : "Reviewing",
      approved: isAm ? "ጸድቋል" : "Approved",
      rejected: isAm ? "ውድቅ ተደርጓል" : "Rejected",
      suspended: isAm ? "የታገደ" : "Suspended",
      correction: isAm ? "ለማስተካከያ የተላከ" : "Correction Requested"
    },
    actions: {
      approve: isAm ? "አጽድቅ" : "Approve",
      reject: isAm ? "ውድቅ አድርግ" : "Reject",
      suspend: isAm ? "አግድ" : "Suspend",
      view: isAm ? "ተመልከት" : "Review Details",
      pending: isAm ? "አቆይ" : "Set Pending"
    }
  };

  const applications = [
    { id: "APP-001", agency: "Abyssinia Security", type: "New Application", date: "Oct 12, 2024", status: "Pending", priority: "High", stage: 'formal', documents: ["Application Letter", "Trade License", "Bank Statement"] },
    { id: "APP-002", agency: "Lion Guard Services", type: "Renewal", date: "Oct 11, 2024", status: "Reviewing", priority: "Medium", stage: 'renewal', documents: ["Tax Clearance", "Renewed Trade License", "Personnel List"] },
    { id: "APP-003", agency: "Nile Protection", type: "New Application", date: "Oct 10, 2024", status: "Correction Requested", priority: "Low", stage: 'new', documents: ["Articles of Association", "Manager ID"] },
  ];

  const filteredApps = applications.filter(app => {
    const matchesTab = activeTab === 'all' || app.status.toLowerCase().includes(activeTab);
    const matchesSearch = app.agency.toLowerCase().includes(searchQuery.toLowerCase()) || app.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleDocAction = (key: string, status: 'approved' | 'rejected' | 'pending', comment?: string) => {
    setDocStatuses(prev => ({ ...prev, [key]: { status, comment } }));
    if (status === 'rejected') {
      setNotifMessage(`Item "${key}" opened for correction`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }
  };

  const ReviewItem = ({ label, value, id, isFile = false }: { label: string, value: string, id: string, isFile?: boolean }) => {
    const status = docStatuses[id]?.status || 'pending';
    const [showComment, setShowComment] = useState(false);
    const [commentText, setCommentText] = useState(docStatuses[id]?.comment || '');

    const handleSendComment = () => {
      handleDocAction(id, status, commentText);
      setShowComment(false);
      setNotifMessage(`Comment sent for "${label}"`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    };

    return (
      <div className={cn(
        "p-6 rounded-[32px] border-2 transition-all flex flex-col justify-between shadow-sm min-h-[160px]",
        status === 'approved' ? "border-green-200 bg-green-50/20" : 
        status === 'rejected' ? "border-amber-200 bg-amber-50/20" : "border-gray-100 bg-white"
      )}>
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
            <div className="flex items-start space-x-2">
              {isFile && <FileText className="w-4 h-4 text-primary shrink-0 mt-0.5" />}
              <p className="text-sm font-bold text-primary break-words line-clamp-2">{value || '-'}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {isFile && (
              <button 
                type="button"
                onClick={() => {
                  setViewerFile({ name: value, type: value.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg', size: 1024 * 1024 });
                  setIsViewerOpen(true);
                }}
                className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                title="Preview"
              >
                <Eye className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-tight">Preview</span>
              </button>
            )}
            <button 
              type="button"
              onClick={() => handleDocAction(id, 'approved')}
              className={cn(
                "flex items-center space-x-2 px-3 py-1.5 rounded-xl transition-all shadow-sm",
                status === 'approved' ? "bg-green-600 text-white" : "bg-green-50 text-green-600 hover:bg-green-600 hover:text-white"
              )}
              title="Approve"
            >
              <CheckCircle className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-tight">Approve</span>
            </button>
            <button 
              type="button"
              onClick={() => handleDocAction(id, 'rejected')}
              className={cn(
                "flex items-center space-x-2 px-3 py-1.5 rounded-xl transition-all shadow-sm",
                status === 'rejected' ? "bg-amber-600 text-white" : "bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white"
              )}
              title="Open for Correction"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-tight">Correct</span>
            </button>
            <button 
              type="button"
              onClick={() => setShowComment(!showComment)}
              className={cn(
                "flex items-center space-x-2 px-3 py-1.5 rounded-xl transition-all shadow-sm",
                docStatuses[id]?.comment ? "bg-primary text-white" : "bg-gray-50 text-gray-400 hover:bg-primary hover:text-white"
              )}
              title="Send Comment"
            >
              <FileText className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-tight">Comment</span>
            </button>
          </div>
        </div>

        {showComment && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="pt-2 space-y-2">
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
          <h3 className="text-7xl font-black text-primary uppercase tracking-tighter leading-none">Choose Review Category</h3>
          <p className="text-gray-400 text-xl font-medium max-w-3xl mx-auto leading-relaxed">
            Directly select which phase of <span className="text-primary font-black">{selectedApp.agency}</span>'s submission you wish to audit. 
            All documents and inputs are live-synced from the agency dashboard.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full max-w-7xl">
           {[
             { id: 'formal', title: 'Formal Letter', desc: 'Process and verify the initial competency certificate request and official letters.', icon: FileText, color: 'blue', delay: 0 },
             { id: 'new', title: 'New Application', desc: 'Comprehensive audit of organizational structure, capital assets, and personnel profiles.', icon: Shield, color: 'green', delay: 0.1 },
             { id: 'renewal', title: 'Renewal Review', desc: 'Annual compliance review including tax clearance, financial health, and guard statistics.', icon: RefreshCw, color: 'amber', delay: 0.2 }
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
                  <h4 className="text-3xl font-black text-primary uppercase tracking-tight leading-tight">{item.title}</h4>
                  <p className="text-base text-gray-400 font-medium px-4 leading-relaxed">{item.desc}</p>
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

    const renderFormalLetter = () => (
      <div className="space-y-8">
        <div className="bg-blue-50 border border-blue-100 p-8 rounded-[40px] flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <h4 className="text-xl font-black text-primary uppercase tracking-tighter">Request Letter</h4>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Formal Request for Competency Certificate</p>
            </div>
          </div>
          <button 
            onClick={() => {
              setViewerFile({ name: "formal_letter.pdf", type: 'application/pdf', size: 2.1 * 1024 * 1024 });
              setIsViewerOpen(true);
            }}
            className="px-8 py-3 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm hover:shadow-xl transition-all border border-blue-100"
          >
            Preview Document
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <ReviewItem label="Formal Letter Status" value="formal_letter.pdf" id="formal_letter" isFile={true} />
        </div>
      </div>
    );

    const renderNewApplication = () => (
      <div className="space-y-10 pb-24">
        {/* Agency Info */}
        <section className="space-y-6">
          <div className="flex items-center space-x-3 px-4">
            <div className="w-1.5 h-6 bg-green-500 rounded-full" />
            <h4 className="text-base font-black text-primary uppercase tracking-tight">Agency & Office Information</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            <ReviewItem label="Organization Name" value="Abyssinia Security" id="new_org_name" />
            <ReviewItem label="Head Office Name" value="Abyssinia Towers HQ" id="new_head_office" />
            <ReviewItem label="Branch Office Name" value="Bole Branch Ext" id="new_branch_office" />
            <ReviewItem label="Email Address" value="info@abyssiniasecurity.com" id="new_email" />
            <ReviewItem label="Permanent Telephone/Fax" value="+251 911 223344 / +251 116" id="new_phone_fax" />
            <ReviewItem label="Region" value="Addis Ababa" id="new_region" />
            <ReviewItem label="Zone" value="Kirkos" id="new_zone" />
            <ReviewItem label="Woreda" value="03" id="new_woreda" />
            <ReviewItem label="Kebele" value="12" id="new_kebele" />
            <ReviewItem label="House Number" value="New-1049" id="new_house_no" />
            <ReviewItem label="Special Location" value="Near Meskel Square" id="new_special_location" />
          </div>
        </section>

        {/* Legal & Registration */}
        <section className="space-y-6">
          <div className="flex items-center space-x-3 px-4">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
            <h4 className="text-base font-black text-primary uppercase tracking-tight">Legal & Registration</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            <ReviewItem label="Trade Name" value="Abyssinia Security Services" id="new_trade_designation" />
            <ReviewItem label="Trade Pre-registration" value="pre_reg_doc.pdf" id="new_pre_reg" isFile />
            <ReviewItem label="Renewed Trade License" value="trade_license_2024.pdf" id="new_trade_license" isFile />
            <ReviewItem label="Labor & Skill Bureau Reg" value="labor_bureau.pdf" id="new_labor_bureau" isFile />
            <ReviewItem label="TIN Number" value="8273615420" id="new_tin" />
            <ReviewItem label="Trademark License" value="trademark.pdf" id="new_trademark" isFile />
          </div>
        </section>

        {/* Organizational Docs */}
        <section className="space-y-6">
          <div className="flex items-center space-x-3 px-4">
            <div className="w-1.5 h-6 bg-purple-600 rounded-full" />
            <h4 className="text-base font-black text-primary uppercase tracking-tight">Organizational Documents</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            <ReviewItem label="Organizational Structure" value="structure.pdf" id="new_structure" isFile />
            <ReviewItem label="Articles of Incorporation" value="articles.pdf" id="new_articles" isFile />
            <ReviewItem label="Internal Regulations" value="regulations.pdf" id="new_regulations" isFile />
            <ReviewItem label="Lists of Technologies Used" value="tech_list.pdf" id="new_tech_list" isFile />
            <ReviewItem label="Capital (Bank Statement)" value="bank_statement.pdf" id="new_bank_statement" isFile />
          </div>
        </section>

        {/* Assets & Facilities */}
        <section className="space-y-6">
          <div className="flex items-center space-x-3 px-4">
            <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
            <h4 className="text-base font-black text-primary uppercase tracking-tight">Assets & Facilities</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            <ReviewItem label="No. of Offices" value="4" id="new_offices_count" />
            <ReviewItem label="Store House" value="Yes - Bolle Area" id="new_storehouse" />
            <ReviewItem label="No. of Computers" value="18" id="new_computers_count" />
            <ReviewItem label="No. of Vehicles" value="6" id="new_vehicles_count" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5 mt-4">
            <ReviewItem label="House Rent/Ownership Doc" value="house_docs.pdf" id="new_house_docs" isFile />
            <ReviewItem label="Vehicle Rent/Ownership Doc" value="vehicle_docs.pdf" id="new_vehicle_docs" isFile />
          </div>
        </section>

        {/* Branding & Forms */}
        <section className="space-y-6">
          <div className="flex items-center space-x-3 px-4">
            <div className="w-1.5 h-6 bg-pink-500 rounded-full" />
            <h4 className="text-base font-black text-primary uppercase tracking-tight">Branding & Forms</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            <ReviewItem label="Uniform/Clothing Sample" value="uniform_sample.jpg" id="new_uniform" isFile />
            <ReviewItem label="Employee ID Card Sample" value="id_sample.jpg" id="new_id_card" isFile />
            <ReviewItem label="Logo of Organization" value="org_logo.png" id="new_logo" isFile />
            <ReviewItem label="Employment Form" value="employment_form.pdf" id="new_employment_form" isFile />
            <ReviewItem label="Employment Warranty Form" value="warranty_form.pdf" id="new_warranty_form" isFile />
          </div>
        </section>

        {/* Training Programs */}
        <section className="space-y-6">
          <div className="flex items-center space-x-3 px-4">
            <div className="w-1.5 h-6 bg-red-500 rounded-full" />
            <h4 className="text-base font-black text-primary uppercase tracking-tight">Training Programs</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            <ReviewItem label="Training Manual" value="training_manual.pdf" id="new_training_manual" isFile />
            <ReviewItem label="Training Address" value="Bole Sub-city, Center A" id="new_training_address" />
            <ReviewItem label="Days Trained" value="45 Days" id="new_training_days" />
            <ReviewItem label="Training Provider Body" value="Federal Police Academy" id="new_training_provider" />
            <ReviewItem label="Certificate of Training" value="training_cert.pdf" id="new_training_cert" isFile />
          </div>
        </section>

        {/* Manager Details */}
        <section className="space-y-6 pt-10 border-t border-gray-100">
          <div className="flex items-center space-x-3 px-4">
            <div className="w-1.5 h-6 bg-cyan-600 rounded-full" />
            <h4 className="text-lg font-black text-primary uppercase tracking-tighter">I. Manager Requirements</h4>
          </div>
          <div className="p-6 bg-gray-50/30 rounded-[40px] border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
              <ReviewItem label="Full Name" value="Abebe Bikila" id="new_mgr_name" />
              <ReviewItem label="Gender" value="Male" id="new_mgr_gender" />
              <ReviewItem label="Citizenship" value="Ethiopian" id="new_mgr_citizen" />
              <ReviewItem label="Phone/Email" value="+251 988 / abebe@agency.com" id="new_mgr_contact" />
              <ReviewItem label="Address (Reg/Wor/Kebele)" value="Addis, K-11, H-902" id="new_mgr_address" />
              <ReviewItem label="Fingerprint Doc" value="mgr_fingerprint.pdf" id="new_mgr_finger" isFile />
              <ReviewItem label="Medical Result" value="mgr_medical.pdf" id="new_mgr_med" isFile />
              <ReviewItem label="Training Certificate" value="mgr_training.pdf" id="new_mgr_train" isFile />
              <ReviewItem label="Kebele Support Letter" value="mgr_kebele_support.pdf" id="new_mgr_kebele" isFile />
              <ReviewItem label="Proof of Collateral" value="mgr_collateral.pdf" id="new_mgr_collateral" isFile />
              <ReviewItem label="Police/Defense Experience" value="mgr_exp.pdf" id="new_mgr_exp" isFile />
              <ReviewItem label="Resignation Record" value="mgr_resignation.pdf" id="new_mgr_resign" isFile />
              <ReviewItem label="Education Card (Degree)" value="mgr_degree.pdf" id="new_mgr_edu" isFile />
              <ReviewItem label="National ID / Passport" value="mgr_national_id.pdf" id="new_mgr_id" isFile />
              <ReviewItem label="Org Identification" value="mgr_org_id.pdf" id="new_mgr_oid" isFile />
            </div>
          </div>
        </section>

        {/* Operations Head Details */}
        <section className="space-y-6 pt-10">
          <div className="flex items-center space-x-3 px-4">
            <div className="w-1.5 h-6 bg-blue-700 rounded-full" />
            <h4 className="text-lg font-black text-primary uppercase tracking-tighter">II. Operations Head Requirements</h4>
          </div>
          <div className="p-6 bg-gray-50/30 rounded-[40px] border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
              <ReviewItem label="Full Name" value="Teresa Kumala" id="new_ops_name" />
              <ReviewItem label="Gender" value="Female" id="new_ops_gender" />
              <ReviewItem label="Citizenship" value="Ethiopian" id="new_ops_citizen" />
              <ReviewItem label="Phone/Email" value="+251 922 / teresa@agency.com" id="new_ops_contact" />
              <ReviewItem label="Address (Reg/Wor/Kebele)" value="Addis, Bole, H-12" id="new_ops_address" />
              <ReviewItem label="Fingerprint Doc" id="new_ops_finger" value="ops_fingerprint.pdf" isFile />
              <ReviewItem label="Medical Result" id="new_ops_med" value="ops_medical.pdf" isFile />
              <ReviewItem label="Training Certificate" id="new_ops_train" value="ops_training.pdf" isFile />
              <ReviewItem label="Kebele Support Letter" id="new_ops_kebele" value="ops_kebele.pdf" isFile />
              <ReviewItem label="Proof of Collateral" id="new_ops_collateral" value="ops_collateral.pdf" isFile />
              <ReviewItem label="Exp Record (2+ Years)" id="new_ops_exp" value="ops_exp.pdf" isFile />
              <ReviewItem label="Resignation Record" id="new_ops_resign" value="ops_resignation.pdf" isFile />
              <ReviewItem label="Education Card (Degree)" id="new_ops_edu" value="ops_degree.pdf" isFile />
              <ReviewItem label="National ID / Passport" id="new_ops_id" value="ops_id.pdf" isFile />
              <ReviewItem label="Org Identification" id="new_ops_oid" value="ops_org_id.pdf" isFile />
            </div>
          </div>
        </section>

        {/* Administration Head Details */}
        <section className="space-y-6 pt-10">
          <div className="flex items-center space-x-3 px-4">
            <div className="w-1.5 h-6 bg-purple-700 rounded-full" />
            <h4 className="text-lg font-black text-primary uppercase tracking-tighter">III. Administration Head Requirements</h4>
          </div>
          <div className="p-6 bg-gray-50/30 rounded-[40px] border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
              <ReviewItem label="Full name" value="Mulugeta Tesfaye" id="new_admin_name" />
              <ReviewItem label="Gender" value="Male" id="new_admin_gender" />
              <ReviewItem label="Citizenship" value="Ethiopian" id="new_admin_citizen" />
              <ReviewItem label="Phone Number" value="+251 933 556677" id="new_admin_phone" />
              <ReviewItem label="Email" value="mulugeta.admin@agency.com" id="new_admin_email" />
              <ReviewItem label="Address (Reg/Zone/Wor/Keb/Loc/House)" value="Addis, Kirkos, 03, 12, Square, New-10" id="new_admin_address" />
              <ReviewItem label="Fingerprint from police" id="new_admin_finger" value="admin_fingerprint.pdf" isFile />
              <ReviewItem label="Medical result" id="new_admin_med" value="admin_medical.pdf" isFile />
              <ReviewItem label="training certificate" id="new_admin_train" value="admin_training.pdf" isFile />
              <ReviewItem label="support letter from kebele" id="new_admin_kebele" value="admin_kebele.pdf" isFile />
              <ReviewItem label="proof of collateral" id="new_admin_collateral" value="admin_collateral.pdf" isFile />
              <ReviewItem label="Work experience (Admin 2+ Years / Degree)" id="new_admin_exp" value="admin_exp.pdf" isFile />
              <ReviewItem label="Dismissal / resignation record" id="new_admin_resign" value="admin_resignation.pdf" isFile />
              <ReviewItem label="Educational certificate" id="new_admin_edu" value="admin_degree.pdf" isFile />
              <ReviewItem label="National Id" id="new_admin_id" value="admin_id.pdf" isFile />
              <ReviewItem label="Renewed Kebele ID / passport" id="new_admin_kid" value="admin_id_renewed.pdf" isFile />
              <ReviewItem label="Organization identification" id="new_admin_oid" value="admin_org_id.pdf" isFile />
            </div>
          </div>
        </section>
      </div>
    );

    const renderRenewalReview = () => (
      <div className="space-y-10 pb-24">
        {/* Basic Agency Info */}
        <section className="space-y-6">
          <div className="flex items-center space-x-3 px-4">
            <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
            <h4 className="text-base font-black text-primary uppercase tracking-tight">Agency & Office Information</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            <ReviewItem label="Organization Name" value="Lion Guard Services" id="ren_org_name" />
            <ReviewItem label="Head Office Name" value="Lion HQ Center" id="ren_head_office" />
            <ReviewItem label="Branch Office Name" value="Bole Area Branch" id="ren_branch_office" />
            <ReviewItem label="Permanent Tel / Fax" value="+251 988 / +251 11" id="ren_contact_pair" />
            <ReviewItem label="Email Address" value="renew@lionguard.com" id="ren_email" />
            <ReviewItem label="Region (City)" value="Addis Ababa" id="ren_region" />
            <ReviewItem label="Zone (City)" value="Bole" id="ren_zone" />
            <ReviewItem label="Woreda / Kebele" value="W-03 / K-05" id="ren_wor_keb" />
            <ReviewItem label="Special Location" value="Near Bole Bridge" id="ren_special_location" />
            <ReviewItem label="House Number" value="LB-992" id="ren_house_no" />
          </div>
        </section>

        {/* Legal & Compliance */}
        <section className="space-y-6">
          <div className="flex items-center space-x-3 px-4">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
            <h4 className="text-base font-black text-primary uppercase tracking-tight">Legal & Compliance</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            <ReviewItem label="Trade Name" value="Lion Guard Security" id="ren_trade_name" />
            <ReviewItem label="Trade Pre-registration" value="pre_reg.pdf" id="ren_pre_reg" isFile />
            <ReviewItem label="Renewed License" value="license_2024.pdf" id="ren_license" isFile />
            <ReviewItem label="Labor & Skills Bureau" value="labor_doc.pdf" id="ren_labor" isFile />
            <ReviewItem label="Taxpayer Clearance" value="tax_clearance.pdf" id="ren_tax" isFile />
            <ReviewItem label="Insurance Coverage" value="insurance_policy.pdf" id="ren_insurance" isFile />
            <ReviewItem label="List of Tech Used" value="tech_list.pdf" id="ren_tech" isFile />
            <ReviewItem label="Capital (Level)" value="Level A - 5M ETB" id="ren_capital" />
          </div>
        </section>

        {/* Training & Logistics */}
        <section className="space-y-6">
          <div className="flex items-center space-x-3 px-4">
            <div className="w-1.5 h-6 bg-red-500 rounded-full" />
            <h4 className="text-base font-black text-primary uppercase tracking-tight">Training & Logistics</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            <ReviewItem label="Training Place" value="Sub-site Academy" id="ren_train_place" />
            <ReviewItem label="Training Provider" value="Global Sec Academy" id="ren_train_provider" />
            <ReviewItem label="Days of Training" value="30 Days" id="ren_train_days" />
            <ReviewItem label="People (M/F/Total)" value="24/12/36" id="ren_train_people" />
            <ReviewItem label="Training Cert" value="train_cert_batch.pdf" id="ren_train_cert" isFile />
            <ReviewItem label="No. of Offices" value="3" id="ren_offices_count" />
            <ReviewItem label="Has Store House" value="Yes" id="ren_storehouse" />
            <ReviewItem label="No. of Computers" value="12" id="ren_computers_count" />
            <ReviewItem label="No. of Vehicles" value="4" id="ren_vehicles_count" />
          </div>
        </section>

        {/* Employee & Operations Docs */}
        <section className="space-y-6">
          <div className="flex items-center space-x-3 px-4">
            <div className="w-1.5 h-6 bg-purple-600 rounded-full" />
            <h4 className="text-base font-black text-primary uppercase tracking-tight">Employee & Operations Documents</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            <ReviewItem label="List of Employees" value="staff_list.pdf" id="ren_employee_list" isFile />
            <ReviewItem label="Guard Insurance Type" value="Full Coverage Life" id="ren_guard_ins" />
            <ReviewItem label="Job Classification" value="standard_sop.pdf" id="ren_job_class" isFile />
            <ReviewItem label="Guard Training Cert" value="guards_training.pdf" id="ren_guard_train" isFile />
            <ReviewItem label="Payroll (Pay Slips)" value="payroll_recent.pdf" id="ren_payroll" isFile />
            <ReviewItem label="Social Security Slips" value="soc_sec.pdf" id="ren_social_sec" isFile />
          </div>
        </section>

        {/* Agreements & Leases */}
        <section className="space-y-6">
          <div className="flex items-center space-x-3 px-4">
            <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
            <h4 className="text-base font-black text-primary uppercase tracking-tight">Agreements & Leases</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            <ReviewItem label="Service User Contract" value="client_contracts.pdf" id="ren_client_contract" isFile />
            <ReviewItem label="Office Lease (1yr left)" value="office_lease.pdf" id="ren_office_lease" isFile />
            <ReviewItem label="House Lease Agreement" value="house_lease.pdf" id="ren_house_lease" isFile />
            <ReviewItem label="Vehicle Lease Docs" value="vehicle_leases.pdf" id="ren_vehicle_lease" isFile />
          </div>
        </section>

        {/* Statistical Records */}
        <section className="space-y-6">
          <div className="flex items-center space-x-3 px-4">
            <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
            <h4 className="text-base font-black text-primary uppercase tracking-tight">V. Verification & Statistical Records</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            <ReviewItem label="Fingerprint (M/F/T)" value="150/50/200" id="ren_stat_finger" />
            <ReviewItem label="Medical Certs (M/F/T)" value="145/45/190" id="ren_stat_med" />
            <ReviewItem label="Guarantee Proof (M/F/T)" value="160/40/200" id="ren_stat_guarantee" />
            <ReviewItem label="Kebele Support (M/F/T)" value="155/45/200" id="ren_stat_kebele" />
            <ReviewItem label="Training History (M/F/T)" value="160/40/200" id="ren_stat_trained" />
            <ReviewItem label="Applicant Address List" value="address_list.pdf" id="ren_address_list" isFile />
          </div>
        </section>

        {/* Operational Status */}
        <section className="space-y-6">
          <div className="flex items-center space-x-3 px-4">
            <div className="w-1.5 h-6 bg-gray-600 rounded-full" />
            <h4 className="text-base font-black text-primary uppercase tracking-tight">Operational & Change Status</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            <ReviewItem label="Manager Changed?" value="No" id="ren_man_changed" />
            <ReviewItem label="Ops Head Changed?" value="Yes" id="ren_ops_changed" />
            <ReviewItem label="Admin Head Changed?" value="No" id="ren_adm_changed" />
            <ReviewItem label="Employees Dismissed" value="12" id="ren_dismissed" />
            <ReviewItem label="New Hires" value="25" id="ren_new_hires" />
            <ReviewItem label="Qualification Level" value="First Grade" id="ren_qual_level" />
            <ReviewItem label="Written Warning?" value="None" id="ren_warning" />
            <ReviewItem label="Renewal Criteria Met?" value="Yes" id="ren_met_criteria" />
          </div>
        </section>

        {/* Personnel Requirements Grid */}
        <div className="space-y-12 mt-16 pt-16 border-t border-gray-200">
          {/* Manager & Key Personnel Audit */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-4">
              <h4 className="text-lg font-black text-primary uppercase tracking-tighter">I. Organization Manager Requirements</h4>
              <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-full border border-amber-100 uppercase tracking-widest">Audit Terminal</span>
            </div>
            <div className="p-6 bg-gray-50/40 rounded-[40px] border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                <ReviewItem label="Full name" value="Abdi Wahid" id="ren_mgr_name" />
                <ReviewItem label="Gender" value="Male" id="ren_mgr_gender" />
                <ReviewItem label="Citizenship" value="Ethiopian" id="ren_mgr_citizen" />
                <ReviewItem label="Phone Number" value="+251 912" id="ren_mgr_phone" />
                <ReviewItem label="Email" value="abdi@lion.com" id="ren_mgr_email" />
                <ReviewItem label="Address (R/Z/W/K/Loc/H)" value="Addis, Bole, 02, 05, Bridge, 102" id="ren_mgr_addr" />
                <ReviewItem label="Fingerprint from police" id="ren_mgr_finger" value="mgr_finger.pdf" isFile />
                <ReviewItem label="Medical result" id="ren_mgr_med" value="mgr_med.pdf" isFile />
                <ReviewItem label="Training certificate" id="ren_mgr_train" value="mgr_train.pdf" isFile />
                <ReviewItem label="Support letter (Kebele)" id="ren_mgr_kebele" value="mgr_kb.pdf" isFile />
                <ReviewItem label="Proof of collateral" id="ren_mgr_coll" value="mgr_coll.pdf" isFile />
                <ReviewItem label="Exp (Police/Def/Mgr Min 2yr)" id="ren_mgr_exp" value="mgr_exp.pdf" isFile />
                <ReviewItem label="Resignation record" id="ren_mgr_resign" value="mgr_rs.pdf" isFile />
                <ReviewItem label="Edu (Degree Min)" id="ren_mgr_edu" value="mgr_edu.pdf" isFile />
                <ReviewItem label="National Id" id="ren_mgr_nid" value="mgr_nid.pdf" isFile />
                <ReviewItem label="Renewed ID/Passport" id="ren_mgr_kid" value="mgr_kid.pdf" isFile />
                <ReviewItem label="Org identification" id="ren_mgr_oid" value="mgr_oid.pdf" isFile />
              </div>
            </div>
          </section>

          {/* Ops Head Audit */}
          <section className="space-y-6">
            <h4 className="px-4 text-lg font-black text-primary uppercase tracking-tighter">II. Operations Head Requirements</h4>
            <div className="p-6 bg-gray-50/40 rounded-[40px] border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                <ReviewItem label="Full name" value="Selam Mengesha" id="ren_ops_name" />
                <ReviewItem label="Gender" value="Female" id="ren_ops_gender" />
                <ReviewItem label="Citizenship" value="Ethiopian" id="ren_ops_citizen" />
                <ReviewItem label="Phone Number" value="+251 922" id="ren_ops_phone" />
                <ReviewItem label="Email" value="selam@lion.com" id="ren_ops_email" />
                <ReviewItem label="Address (R/Z/W/K/Loc/H)" value="Addis, Yeka, 04, 10, Mall, 203" id="ren_ops_addr" />
                <ReviewItem label="Fingerprint from police" id="ren_ops_finger" value="ops_finger.pdf" isFile />
                <ReviewItem label="Medical result" id="ren_ops_med" value="ops_med.pdf" isFile />
                <ReviewItem label="Training certificate" id="ren_ops_train" value="ops_train.pdf" isFile />
                <ReviewItem label="Support letter (Kebele)" id="ren_ops_kebele" value="ops_kb.pdf" isFile />
                <ReviewItem label="Proof of collateral" id="ren_ops_coll" value="ops_coll.pdf" isFile />
                <ReviewItem label="Exp (Def/Police/Sec Law 2yr)" id="ren_ops_exp" value="ops_exp.pdf" isFile />
                <ReviewItem label="Resignation record" id="ren_ops_resign" value="ops_rs.pdf" isFile />
                <ReviewItem label="Edu (Degree Min)" id="ren_ops_edu" value="ops_edu.pdf" isFile />
                <ReviewItem label="National Id" id="ren_ops_nid" value="ops_nid.pdf" isFile />
                <ReviewItem label="Renewed ID/Passport" id="ren_ops_kid" value="ops_kid.pdf" isFile />
                <ReviewItem label="Org identification" id="ren_ops_oid" value="ops_oid.pdf" isFile />
              </div>
            </div>
          </section>

          {/* Admin Head Audit */}
          <section className="space-y-6">
            <h4 className="px-4 text-lg font-black text-primary uppercase tracking-tighter">III. Administration Head Requirements</h4>
            <div className="p-6 bg-gray-50/40 rounded-[40px] border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                <ReviewItem label="Full name" value="Dawit Haile" id="ren_adm_name" />
                <ReviewItem label="Gender" value="Male" id="ren_adm_gender" />
                <ReviewItem label="Citizenship" value="Ethiopian" id="ren_adm_citizen" />
                <ReviewItem label="Phone Number" value="+251 933" id="ren_adm_phone" />
                <ReviewItem label="Email" value="dawit@lion.com" id="ren_adm_email" />
                <ReviewItem label="Address (R/Z/W/K/Loc/H)" value="Addis, Arada, 01, 15, Church, 401" id="ren_adm_addr" />
                <ReviewItem label="Fingerprint from police" id="ren_adm_finger" value="adm_finger.pdf" isFile />
                <ReviewItem label="Medical result" id="ren_adm_med" value="adm_med.pdf" isFile />
                <ReviewItem label="Training certificate" id="ren_adm_train" value="adm_train.pdf" isFile />
                <ReviewItem label="Support letter (Kebele)" id="ren_adm_kebele" value="adm_kb.pdf" isFile />
                <ReviewItem label="Proof of collateral" id="ren_adm_coll" value="adm_coll.pdf" isFile />
                <ReviewItem label="Exp (Admin 2+ yr / Degree)" id="ren_adm_exp" value="adm_exp.pdf" isFile />
                <ReviewItem label="Resignation record" id="ren_adm_resign" value="adm_rs.pdf" isFile />
                <ReviewItem label="Educational certificate" id="ren_adm_edu" value="adm_edu.pdf" isFile />
                <ReviewItem label="National Id" id="ren_adm_nid" value="adm_nid.pdf" isFile />
                <ReviewItem label="Renewed ID/Passport" id="ren_adm_kid" value="adm_kid.pdf" isFile />
                <ReviewItem label="Org identification" id="ren_adm_oid" value="adm_oid.pdf" isFile />
              </div>
            </div>
          </section>

          {/* Security Guard Personnel Requirements */}
          <section className="space-y-6">
            <h4 className="px-4 text-lg font-black text-primary uppercase tracking-tighter">IV. Security Guard Personnel Requirements (General)</h4>
            <div className="p-6 bg-gray-50/40 rounded-[40px] border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                <ReviewItem label="Full name" value="Elias Tadesse" id="ren_grd_name" />
                <ReviewItem label="Gender" value="Male" id="ren_grd_gender" />
                <ReviewItem label="Citizenship" value="Ethiopian" id="ren_grd_citizen" />
                <ReviewItem label="Phone / Email" value="+251 944 / elias@lion.com" id="ren_grd_contact" />
                <ReviewItem label="Address (R/Z/W/K/Loc/H)" value="Addis, Kolfe, 08, 22, School, 005" id="ren_grd_addr" />
                <ReviewItem label="Fingerprint from police" id="ren_grd_finger" value="grd_finger.pdf" isFile />
                <ReviewItem label="Medical result" id="ren_grd_med" value="grd_med.pdf" isFile />
                <ReviewItem label="Training certificate" id="ren_grd_train" value="grd_train.pdf" isFile />
                <ReviewItem label="Support letter (Kebele)" id="ren_grd_kebele" value="grd_kb.pdf" isFile />
                <ReviewItem label="Proof of collateral" id="ren_grd_coll" value="grd_coll.pdf" isFile />
                <ReviewItem label="Exp (Admin 2+ yr / Degree)" id="ren_grd_exp" value="grd_exp.pdf" isFile />
                <ReviewItem label="Resignation record" id="ren_grd_resign" value="grd_rs.pdf" isFile />
                <ReviewItem label="Educational certificate" id="ren_grd_edu" value="grd_edu.pdf" isFile />
                <ReviewItem label="National Id" id="ren_grd_nid" value="grd_nid.pdf" isFile />
                <ReviewItem label="Renewed ID/Passport" id="ren_grd_kid" value="grd_kid.pdf" isFile />
                <ReviewItem label="Org identification" id="ren_grd_oid" value="grd_oid.pdf" isFile />
              </div>
            </div>
          </section>

          {/* Recruitment Details */}
          <section className="space-y-6">
            <div className="flex items-center space-x-3 px-4">
               <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
               <h4 className="text-lg font-black text-primary uppercase tracking-tighter">Recruitment & Defense History</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
              <ReviewItem label="Kebele ID / Passport Renewed" value="Yes" id="ren_rec_id" />
              <ReviewItem label="Fingerprint (Stat)" value="Provided" id="ren_rec_finger" />
              <ReviewItem label="Guarantor Proof" value="Provided" id="ren_rec_guarantee" />
              <ReviewItem label="Kebele Support Submited?" value="Yes" id="ren_rec_kebele" />
              <ReviewItem label="Employment Letter" value="empl_letter.pdf" id="ren_rec_letter" isFile />
              <ReviewItem label="Defense History (Years/Role)" value="5 Years / Squad Leader" id="ren_rec_defense" />
              <ReviewItem label="Police History (Years/Role)" value="2 Years / Patrol" id="ren_rec_police" />
              <ReviewItem label="Total Law Enforcement Years" value="7 Years" id="ren_rec_total_yrs" />
              <ReviewItem label="National Digital ID" value="DIG-827361" id="ren_rec_digid" />
              <ReviewItem label="Candidate Age" value="28" id="ren_rec_age" />
            </div>
          </section>

          {/* Education Breakdown */}
          <section className="space-y-6">
            <div className="flex items-center space-x-3 px-4">
               <div className="w-1.5 h-6 bg-pink-500 rounded-full" />
               <h4 className="text-lg font-black text-primary uppercase tracking-tighter">Security Guards Education Level Breakdown</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
              <ReviewItem label="3rd to 9th Grade (M/F/T)" value="40/10/50" id="ren_edu_3_9" />
              <ReviewItem label="10th to 12th Grade (M/F/T)" value="100/30/130" id="ren_edu_10_12" />
              <ReviewItem label="Vocational Certificate (M/F/T)" value="20/5/25" id="ren_edu_cert" />
              <ReviewItem label="Diploma (M/F/T)" value="15/5/20" id="ren_edu_diploma" />
              <ReviewItem label="Degree (M/F/T)" value="10/2/12" id="ren_edu_degree" />
              <ReviewItem label="Second Degree (M/F/T)" value="2/0/2" id="ren_edu_2nd" />
            </div>
          </section>
        </div>
      </div>
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
            {viewingStage === 'selection' ? (
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
                      onClick={() => setViewingStage('selection')}
                      className="p-2 bg-gray-50 text-primary rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm group"
                      title="Back to Selection"
                    >
                      <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="w-0.5 h-6 bg-gray-100 rounded-full" />
                    <div className="flex items-center space-x-2">
                      <div className="w-9 h-9 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                        {viewingStage === 'formal' ? <FileText className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-primary uppercase tracking-tighter shrink-0 leading-none">
                          {viewingStage === 'formal' ? "Formal Letter Review" : viewingStage === 'new' ? "New Application Audit" : "Renewal Audit"}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-none">{selectedApp.agency}</span>
                          <span className="text-[8px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-wider">{selectedApp.id}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button onClick={() => setSelectedApp(null)} className="p-2 bg-red-50 text-red-500 rounded-xl transition-all shadow-sm">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Maximized Body */}
                <div className="flex-1 overflow-y-auto bg-gray-50/5 relative">
                  <div className="max-w-[1800px] mx-auto p-6 md:p-8">
                    {viewingStage === 'formal' && renderFormalLetter()}
                    {viewingStage === 'new' && renderNewApplication()}
                    {viewingStage === 'renewal' && renderRenewalReview()}
                  </div>
                </div>

                {/* Compact Footer */}
                <div className="p-3 md:px-6 border-t bg-white flex flex-col md:flex-row items-center justify-between gap-3 shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.1)] z-20">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                        <h5 className="font-black text-xs text-primary uppercase tracking-tight leading-none">Review Terminal</h5>
                        <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Permanent review actions.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="px-4 py-2 bg-gray-100 text-gray-500 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-gray-200 transition-all">
                        On Hold
                    </button>
                    <button className="px-4 py-2 bg-red-50 text-red-500 border-2 border-red-100 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm">
                        Reject
                    </button>
                    <button className="px-8 py-2 blue-gradient text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/30 hover:scale-[1.02] transition-all flex items-center space-x-2">
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
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[48px] w-full max-w-6xl h-full overflow-hidden flex flex-col shadow-2xl">
                   <div className="p-8 border-b flex justify-between items-center bg-white shadow-sm">
                      <div className="flex items-center space-x-4">
                         <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg">
                            <Eye className="w-6 h-6" />
                         </div>
                         <div>
                            <h4 className="font-black text-primary uppercase tracking-tighter">{viewerFile.name}</h4>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Document Preview Mode</p>
                         </div>
                      </div>
                      <button onClick={() => setIsViewerOpen(false)} className="p-4 bg-gray-100 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all">
                         <X className="w-6 h-6" />
                      </button>
                   </div>
                   <div className="flex-1 bg-gray-100 p-12 flex items-center justify-center">
                      {viewerFile.type === 'application/pdf' ? (
                        <div className="w-full h-full bg-white rounded-[40px] shadow-2xl flex items-center justify-center relative overflow-hidden group">
                           <FileText className="w-32 h-32 text-gray-100" />
                           <div className="absolute inset-0 flex items-center justify-center flex-col space-y-4">
                             <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                                <FileText className="w-10 h-10" />
                             </div>
                             <p className="text-xl font-black text-primary uppercase tracking-tighter">PDF PREVIEW SIMULATED</p>
                             <p className="text-gray-400 text-sm max-w-xs text-center font-medium">Standard browser integration would render the PDF canvas here.</p>
                           </div>
                        </div>
                      ) : (
                        <div className="w-full h-full bg-white rounded-[40px] shadow-2xl flex items-center justify-center border-8 border-white overflow-hidden p-8">
                           <div className="w-full h-full bg-gray-50 rounded-[28px] flex items-center justify-center flex-col space-y-4 border-2 border-dashed border-gray-200">
                             <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center">
                                <Users className="w-10 h-10" />
                             </div>
                             <p className="text-xl font-black text-green-600 uppercase tracking-tighter">PHOTO PREVIEW SIMULATED</p>
                             <p className="text-gray-400 text-sm max-w-xs text-center font-medium">Detailed high-resolution image analysis would be visible here.</p>
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

  return (
    <div className="space-y-8">
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
            {(['all', 'pending', 'reviewing'] as const).map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-bold text-xs rounded-lg transition-all ${
                  activeTab === tab ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:bg-white/50'
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
                <th className="px-8 py-6">{t.table.agency}</th>
                <th className="px-8 py-6">{t.table.type}</th>
                <th className="px-8 py-6">{t.table.date}</th>
                <th className="px-8 py-6">{t.table.priority}</th>
                <th className="px-8 py-6">{t.table.status}</th>
                <th className="px-8 py-6 text-right">{t.table.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{app.id}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <Shield className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-primary text-sm">{app.agency}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-gray-600 font-medium">{app.type}</td>
                  <td className="px-8 py-6 text-sm text-gray-500">{app.date}</td>
                  <td className="px-8 py-6">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                      app.priority === 'High' ? 'bg-red-50 text-red-500' : 
                      app.priority === 'Medium' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'
                    }`}>
                      {app.priority}
                    </span>
                  </td>
                  <td className="px-8 py-6 font-bold text-xs uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        app.status === 'Pending' ? 'bg-amber-400' : 
                        app.status === 'Suspended' ? 'bg-red-500' : 'bg-blue-400'
                      }`} />
                      <span className="text-gray-700">
                        {app.status === 'Pending' ? t.status.pending : 
                         app.status === 'Reviewing' ? t.status.reviewing : 
                         app.status === 'Suspended' ? t.status.suspended : app.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => { setSelectedApp(app); setViewingStage('selection'); }}
                        className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 text-white rounded-2xl font-black text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Review</span>
                      </button>
                      <button className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm" title="Approve">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm" title="Reject">
                        <XCircle className="w-4 h-4" />
                      </button>
                      <button className="p-2.5 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-sm" title="Set Pending">
                        <Clock className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {selectedApp && <ReviewModal />}
      </AnimatePresence>
    </div>
  );
};
