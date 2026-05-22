import React, { useState } from "react";
import {
  Search,
  Filter,
  MoreVertical,
  Shield,
  Users,
  MapPin,
  ExternalLink,
  Mail,
  Phone,
  X,
  AlertCircle,
  MessageSquare,
  Briefcase,
  HardDrive,
  FileCheck,
  Calendar,
  Clock,
  BadgeCheck,
  FileText,
  Package,
  LayoutGrid,
  CheckCircle2,
  FileDown,
  Download,
  Eye,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "../context/LanguageContext";
import { jsPDF } from "jspdf";

export const AgenciesManagement = () => {
  const { language } = useLanguage();
  const isAm = language === "am";
  const getDisplayName = (obj?: any) =>
    language === "am"
      ? obj?.nameAmharic || obj?.name || obj?.nameEnglish || ""
      : obj?.nameEnglish || obj?.name || obj?.nameAmharic || "";
  const [selectedAgency, setSelectedAgency] = useState<any>(null);
  const [commType, setCommType] = useState<"none" | "email" | "sms">("none");
  const [previewFile, setPreviewFile] = useState<{
    name: string;
    type: string;
    date: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"info" | "docs" | "license">(
    "info",
  );
  const [filterType, setFilterType] = useState<"All" | "National" | "Regional">(
    "All",
  );
  const [filterStatus, setFilterStatus] = useState<
    "All" | "Active" | "Suspended" | "Expired"
  >("All");
  const [showFilters, setShowFilters] = useState(false);

  const FileDisplay = ({ label, file }: { label: string; file: string }) => {
    const previewFileFunc = (name: string, date?: string) => {
      setPreviewFile({
        name,
        type: name.split(".").pop() || "pdf",
        date: date || new Date().toISOString().split("T")[0],
      });
    };

    return (
      <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between group">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="p-2 bg-primary/5 text-primary rounded-xl shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-gray-700 truncate">{label}</p>
            <p className="text-[9px] text-gray-400 font-medium uppercase tracking-widest">
              {file}
            </p>
          </div>
        </div>
        <button
          onClick={() => previewFileFunc(file)}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-primary text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-primary/90 shadow-sm"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            Preview
          </span>
        </button>
      </div>
    );
  };

  const t = {
    title: isAm ? "የኤጀንሲዎች አስተዳደር" : "Agencies Management",
    subtitle: isAm
      ? "ሁሉንም የተመዘገቡ የግል የደህንነት ኤጀንሲዎችን ያስተዳድሩ እና ይቆጣጠሩ።"
      : "Manage and monitor all registered private security agencies.",
    filter: isAm ? "አጣራ" : "Filter",
    export: isAm ? "መረጃ ላክ" : "Export Data",
    search: isAm
      ? "በኤጀንሲ ስም፣ ሥራ አስኪያጅ ወይም ቦታ ይፈልጉ..."
      : "Search by agency name, manager, or location...",
    manager: isAm ? "ሥራ አስኪያጅ" : "Manager",
    staff: isAm ? "የሰራተኞች ብዛት" : "Staff Count",
    viewDetails: isAm ? "ዝርዝሩን ተመልከት" : "View Details",
    status: {
      active: isAm ? "ንቁ" : "Active",
      suspended: isAm ? "የታገደ" : "Suspended",
      expired: isAm ? "ጊዜው ያለፈበት" : "Expired",
    },
    tabs: {
      info: isAm ? "መረጃ" : "Info",
      docs: isAm ? "የማመልከቻ ሂደት" : "Application Process",
      license: isAm ? "ፈቃድ" : "License",
    },
    docCategories: {
      new: isAm ? "የመጀመሪያ ማመልከቻ" : "Initial Application",
      renewal: isAm ? "የእድሳት ማመልከቻ" : "Renewal Application",
    },
    processSteps: {
      letter: isAm ? "1. ይፋዊ የጥያቄ ደብዳቤ" : "1. Formal Request Letter",
      form: isAm ? "2. አዲስ የማመልከቻ ቅጽ" : "2. Application Form",
      agreement: isAm ? "3. ውል እና ስምምነት" : "3. Contractual Agreement",
      payment: isAm ? "4. የክፍያ መረጃ" : "4. License Payment",
    },
    ui: {
      contactChannels: isAm ? "መገናኛ መንገዶች" : "Contact Channels",
      officialEmail: isAm ? "ይፋዊ ኢሜይል" : "Official Email",
      phoneSupport: isAm ? "የስልክ ድጋፍ" : "Phone Support",
      fax: isAm ? "የፋክስ ቁጥር" : "Fax Number",
      faydaId: isAm ? "የፋይዳ መለያ ቁጥር" : "Fayda ID Number",
      otp: isAm ? "የኦቲፒ ኮድ" : "OTP Code",
      region: isAm ? "ክልል" : "Region",
      zone: isAm ? "ዞን" : "Zone",
      woreda: isAm ? "ወረዳ" : "Woreda",
      kebele: isAm ? "ቀበሌ" : "Kebele",
      houseNo: isAm ? "የቤት ቁጥር" : "House Number",
      specialLocation: isAm ? "ልዩ ቦታ" : "Special Location",
      regionalPresence: isAm ? "የክልል መገኘት" : "Regional Presence",
      licenseTypeLabel: isAm ? "የፈቃድ አይነት" : "License Type",
      verified: isAm ? "ተረጋግጧል" : "Verified",
      pending: isAm ? "በሂደት ላይ" : "Pending",
      expired: isAm ? "ጊዜው ያለፈበት" : "Expired",
      hq: isAm ? "ዋና መሥሪያ ቤት" : "Headquarters",
      foundedDate: isAm ? "የተመሰረተበት ቀን" : "Founded Date",
      personnelRegistry: isAm ? "የሰራተኞች ዝርዝር" : "Personnel Registry",
      totalStaff: isAm ? "ጠቅላላ ሰራተኞች" : "Total Staff",
      registeredAssets: isAm ? "የተመዘገቡ ንብረቶች" : "Registered Assets",
      validUntil: isAm ? "እስከሚከተለው ቀን ድረስ" : "Valid Until",
      downloadLetter: isAm ? "ደብዳቤውን አውርድ" : "Download Letter",
      revokeLicense: isAm ? "ፈቃድ ሰርዝ" : "Revoke License",
      contactManager: isAm ? "ሥራ አስኪያጁን ያግኙ" : "Contact Manager",
      employee: isAm ? "ተቀጣሪ" : "Employee",
      id: "ID",
      role: isAm ? "ተግባር" : "Role",
      docs: isAm ? "ሰነዶች" : "Docs",
      statusLabel: isAm ? "ሁኔታ" : "Status",
      official: isAm ? "ይፋዊ" : "Official",
      license: isAm ? "ፈቃድ" : "License",
      printPermit: isAm ? "ፈቃድ አትም" : "Print Permit",
      downloadPDF: isAm ? "PDF አውርድ" : "Download PDF",
      newApplicationBundle: isAm
        ? "ሙሉ አዲስ የማመልከቻ ሰነድ"
        : "Complete New Application Dossier",
      renewalBundle: isAm
        ? "ሙሉ የእድሳት ማመልከቻ ሰነድ"
        : "Complete Renewal Application Dossier",
    },
    exportPDF: isAm ? "የኤጀንሲውን መረጃ በPDF ላክ" : "Export Agency Dossier PDF",
    paymentHistory: isAm ? "የክፍያ ታሪክ" : "Payment History",
    allFiles: isAm ? "ሁሉም ፋይሎች" : "All Submitted Files",
  };

  const BundleDisplay = ({
    bundle,
    bundleTitle,
    refId,
    isRenewal = false,
  }: {
    bundle: any;
    bundleTitle: string;
    refId: string;
    isRenewal?: boolean;
  }) => {
    if (!bundle) return null;

    return (
      <div className="bg-white rounded-[64px] shadow-2xl border-2 border-gray-100 overflow-hidden mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Dossier Header */}
        <div className="p-12 border-b-8 border-primary bg-gray-50/30">
          <div className="flex flex-col space-y-4 text-center">
            <h4 className="text-3xl font-black text-primary uppercase tracking-tighter">
              {bundleTitle}
            </h4>
            <div className="flex items-center justify-center space-x-4">
              <div className="px-4 py-1.5 bg-gray-900 text-secondary rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                DOC-REF: {refId}
              </div>
              <div className="px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
                Verified Official Record
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: Formal Letter */}
        <section className="p-12 space-y-8 border-b-2 border-gray-50">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-secondary shadow-lg">
                <Mail className="w-6 h-6" />
              </div>
              <h5 className="text-2xl font-black text-primary uppercase tracking-tighter">
                {t.processSteps.letter}
              </h5>
            </div>
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-xl">
              {bundle.formalLetter?.date}
            </span>
          </div>
          <div className="p-10 bg-gray-50/50 rounded-[40px] border border-gray-100 italic text-gray-600 leading-relaxed text-xl relative">
            <div className="absolute top-4 left-4 text-primary/10 text-6xl font-serif">
              "
            </div>
            <span className="relative z-10">
              {bundle.formalLetter?.content ||
                bundle.formalLetter?.summary ||
                "Official request for security services licensing."}
            </span>
            <div className="absolute bottom-4 right-4 text-primary/10 text-6xl font-serif rotate-180">
              "
            </div>
          </div>
        </section>

        {/* Detailed Form Breakdown */}
        {bundle.newForm && (
          <>
            {/* Part 1: Agency & Office Info */}
            <section className="p-12 space-y-8 border-b-2 border-gray-50">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-secondary shadow-lg">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h5 className="text-2xl font-black text-primary uppercase tracking-tighter">
                    {t.processSteps.form}
                  </h5>
                </div>
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-xl">
                  {bundle.newForm.date}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Organization Details
                  </p>
                  <div className="bg-gray-50 p-6 rounded-3xl space-y-3">
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">
                        Agency Name
                      </p>
                      <p className="text-sm font-black text-primary">
                        {bundle.newForm.agencyName || bundle.newForm.orgName}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">
                        Head Office
                      </p>
                      <p className="text-sm font-black text-primary">
                        {bundle.newForm.headOfficeName || "N/A"}
                      </p>
                    </div>
                    {bundle.newForm.fax && (
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">
                          {t.ui.fax}
                        </p>
                        <p className="text-sm font-black text-primary">
                          {bundle.newForm.fax}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Address & Location
                  </p>
                  <div className="bg-gray-50 p-6 rounded-3xl grid grid-cols-2 md:grid-cols-5 gap-6">
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">
                        {t.ui.region}
                      </p>
                      <p className="text-sm font-black text-primary">
                        {bundle.newForm.region}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">
                        {t.ui.zone}
                      </p>
                      <p className="text-sm font-black text-primary">
                        {bundle.newForm.zone}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">
                        {t.ui.woreda}
                      </p>
                      <p className="text-sm font-black text-primary">
                        {bundle.newForm.woreda}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">
                        {t.ui.kebele}
                      </p>
                      <p className="text-sm font-black text-primary">
                        {bundle.newForm.kebele}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">
                        {t.ui.houseNo}
                      </p>
                      <p className="text-sm font-black text-primary">
                        {bundle.newForm.houseNumber}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Part 2: Org Docs */}
            <section className="p-12 space-y-8 border-b-2 border-gray-50">
              <h6 className="text-sm font-black text-primary uppercase tracking-widest flex items-center">
                <span className="w-2 h-2 bg-secondary rounded-full mr-2" />
                Part II: Organization Documents
              </h6>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {bundle.newForm.orgDocs?.map((doc: any, di: number) => (
                  <FileDisplay
                    key={`org-doc-${di}`}
                    label={doc.label}
                    file={doc.fileName}
                  />
                ))}
                {/* Detailed Requested Docs */}
                {bundle.newForm.renewedTradeLicense && (
                  <FileDisplay
                    label="Renewed Trade License"
                    file={bundle.newForm.renewedTradeLicense}
                  />
                )}
                {bundle.newForm.laborSkillRegistration && (
                  <FileDisplay
                    label="Labor & Skill Bureau Registration"
                    file={bundle.newForm.laborSkillRegistration}
                  />
                )}
                {bundle.newForm.trademark && (
                  <FileDisplay
                    label="Trademark"
                    file={bundle.newForm.trademark}
                  />
                )}
                {bundle.newForm.orgStructure && (
                  <FileDisplay
                    label="Organizational Structure"
                    file={bundle.newForm.orgStructure}
                  />
                )}
                {bundle.newForm.internalRegulations && (
                  <FileDisplay
                    label="Internal Regulations"
                    file={bundle.newForm.internalRegulations}
                  />
                )}
                {bundle.newForm.technologyLists && (
                  <FileDisplay
                    label="Lists of Technologies Used"
                    file={bundle.newForm.technologyLists}
                  />
                )}
                {bundle.newForm.bankStatement && (
                  <FileDisplay
                    label="Capital or Bank Statement"
                    file={bundle.newForm.bankStatement}
                  />
                )}

                {isRenewal && bundle.form?.licenseStatus && (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 italic text-[10px] text-amber-600 font-bold">
                    License Status: {bundle.form.licenseStatus}
                  </div>
                )}
              </div>
            </section>

            {/* Part 3: Assets & Facilities */}
            <section className="p-12 space-y-8 border-b-2 border-gray-50">
              <h6 className="text-sm font-black text-primary uppercase tracking-widest flex items-center">
                <span className="w-2 h-2 bg-secondary rounded-full mr-2" />
                Part III: Assets & Facilities
              </h6>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[9px] font-bold text-gray-400 uppercase italic">
                    Offices
                  </p>
                  <p className="text-sm font-black text-primary">
                    {bundle.newForm.assets?.offices}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[9px] font-bold text-gray-400 uppercase italic">
                    Store House
                  </p>
                  <p className="text-sm font-black text-primary">
                    {bundle.newForm.assets?.storeHouse}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[9px] font-bold text-gray-400 uppercase italic">
                    Computers
                  </p>
                  <p className="text-sm font-black text-primary">
                    {bundle.newForm.assets?.computers}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[9px] font-bold text-gray-400 uppercase italic">
                    Vehicles
                  </p>
                  <p className="text-sm font-black text-primary">
                    {bundle.newForm.assets?.vehicles}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Ownership & Employment Docs
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {bundle.newForm.assets?.notarizedVehicle && (
                    <FileDisplay
                      label="Notarized Vehicle Rent/Ownership"
                      file={bundle.newForm.assets.notarizedVehicle}
                    />
                  )}
                  {bundle.newForm.assets?.notarizedHouse && (
                    <FileDisplay
                      label="Notarized House Rent/Ownership"
                      file={bundle.newForm.assets.notarizedHouse}
                    />
                  )}
                  {bundle.newForm.assets?.employmentForm && (
                    <FileDisplay
                      label="Employment Form"
                      file={bundle.newForm.assets.employmentForm}
                    />
                  )}
                  {bundle.newForm.assets?.employmentWarranty && (
                    <FileDisplay
                      label="Employment Warranty Form"
                      file={bundle.newForm.assets.employmentWarranty}
                    />
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-50">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Branding & Samples
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bundle.newForm.assets?.photos?.map((ph: any, pi: number) => (
                    <FileDisplay
                      key={`asset-photo-${pi}`}
                      label={ph.label}
                      file={ph.fileName}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Part 4: Training */}
            {!isRenewal && bundle.newForm.training && (
              <section className="p-12 space-y-8 border-b-2 border-gray-50">
                <h6 className="text-sm font-black text-primary uppercase tracking-widest flex items-center">
                  <span className="w-2 h-2 bg-secondary rounded-full mr-2" />
                  Part IV: Training Status
                </h6>
                <div className="bg-gray-50 p-8 rounded-[40px] grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">
                      Provider
                    </p>
                    <p className="text-sm font-black text-primary">
                      {bundle.newForm.training?.provider}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">
                      Duration
                    </p>
                    <p className="text-sm font-black text-primary">
                      {bundle.newForm.training?.days} Days
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">
                      Location
                    </p>
                    <p className="text-sm font-black text-primary">
                      {bundle.newForm.training?.address}
                    </p>
                  </div>
                  {bundle.newForm.training?.stats && (
                    <div className="md:col-span-3 grid grid-cols-3 gap-4 border-t border-gray-200 pt-6">
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">
                          Male Trained
                        </p>
                        <p className="text-sm font-black text-primary">
                          {bundle.newForm.training.stats.male}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">
                          Female Trained
                        </p>
                        <p className="text-sm font-black text-primary">
                          {bundle.newForm.training.stats.female}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">
                          Total Trained
                        </p>
                        <p className="text-sm font-black text-primary">
                          {bundle.newForm.training.stats.total}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FileDisplay
                      label="Training Manual"
                      file={bundle.newForm.training?.manual}
                    />
                    {bundle.newForm.training?.certificate && (
                      <FileDisplay
                        label="Certificate of Training"
                        file={bundle.newForm.training.certificate}
                      />
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Part 5: Key Personnel & Stats */}
            <section className="p-12 space-y-8 border-b-2 border-gray-50">
              <div className="flex justify-between items-center">
                <h6 className="text-sm font-black text-primary uppercase tracking-widest">
                  Part V: Key Personnel {isRenewal && "& Updates"}
                </h6>
                {isRenewal && bundle.newForm.personnelStats && (
                  <div className="flex space-x-4">
                    <div className="px-4 py-2 bg-red-50 rounded-xl border border-red-100 italic">
                      <p className="text-[8px] font-bold text-red-500 uppercase tracking-widest">
                        Dismissed
                      </p>
                      <p className="text-sm font-black text-red-600">
                        {bundle.newForm.personnelStats.dismissed}
                      </p>
                    </div>
                    <div className="px-4 py-2 bg-green-50 rounded-xl border border-green-100 italic">
                      <p className="text-[8px] font-bold text-green-500 uppercase tracking-widest">
                        Newly Hired
                      </p>
                      <p className="text-sm font-black text-green-600">
                        {bundle.newForm.personnelStats.hired}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-8">
                {bundle.newForm.personnel?.map((p: any, pix: number) => (
                  <div
                    key={`personnel-${pix}`}
                    className="bg-white border border-gray-100 p-8 rounded-[40px] shadow-sm space-y-6"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-50 pb-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-primary/5 rounded-[20px] flex items-center justify-center text-primary shadow-inner">
                          <Users className="w-8 h-8" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                            {p.role}
                          </p>
                          <p className="text-xl font-black text-primary">
                            Full Name: {getDisplayName(p)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <p className="text-[9px] font-bold text-gray-400 uppercase">
                            {t.ui.faydaId}
                          </p>
                          <p className="text-sm font-black text-primary">
                            {p.faydaId || "N/A"}
                          </p>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <div className="px-4 py-2 bg-green-50 rounded-xl border border-green-100 flex items-center space-x-2">
                            <Shield className="w-4 h-4 text-green-600" />
                            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">
                              {t.ui.verified}
                            </span>
                          </div>
                          <div className="px-3 py-1 bg-blue-50 rounded-lg text-[8px] font-black text-blue-600 uppercase tracking-[0.2em] text-center">
                            OTP Validated
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                      <div>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                          Gender / Citizenship
                        </p>
                        <p className="text-[10px] font-black text-primary">
                          {p.gender || "N/A"} / {p.citizenship || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                          Email Address
                        </p>
                        <p className="text-[10px] font-black text-gray-700 truncate">
                          {p.email || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                          Phone Number
                        </p>
                        <p className="text-[10px] font-black text-gray-700">
                          {p.phone || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                          Region / Zone
                        </p>
                        <p className="text-[10px] font-black text-gray-700">
                          {p.address?.region || "N/A"} /{" "}
                          {p.address?.zone || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                          Woreda / Kebele
                        </p>
                        <p className="text-[10px] font-black text-gray-700">
                          {p.address?.woreda || "N/A"} /{" "}
                          {p.address?.kebele || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                          House No. / Special Location
                        </p>
                        <p className="text-[10px] font-black text-gray-700">
                          H:{p.address?.houseNo || "N/A"} |{" "}
                          {p.address?.special || "None"}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-50 flex flex-wrap gap-3">
                      {p.docs?.map((pd: any, pdix: number) => (
                        <div
                          key={`p-doc-${pix}-${pdix}`}
                          className="flex items-center space-x-1"
                        >
                          <button
                            onClick={() => {
                              const fileName =
                                typeof pd === "string" ? pd : pd.fileName;
                              setPreviewFile({
                                name: fileName,
                                type: fileName.split(".").pop() || "pdf",
                                date: new Date().toISOString().split("T")[0],
                              });
                            }}
                            className="px-4 py-2 bg-gray-50 hover:bg-primary hover:text-white rounded-xl border border-gray-100 text-[10px] font-bold text-primary uppercase tracking-widest transition-all inline-flex items-center space-x-2"
                          >
                            <Eye className="w-3 h-3" />
                            <span>
                              Preview:{" "}
                              {typeof pd === "string"
                                ? pd
                                : pd.label || pd.fileName}
                            </span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Part 6: Guards Requirements (Renewal Only) */}
            {isRenewal && bundle.newForm.guards && (
              <section className="p-12 space-y-8 border-b-2 border-gray-50">
                <h6 className="text-sm font-black text-primary uppercase tracking-widest">
                  Part VI: Security Guards Requirements
                </h6>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {bundle.newForm.guards.docs?.map((gdoc: any, gdi: number) => (
                    <FileDisplay
                      key={`guard-doc-${gdi}`}
                      label={gdoc.label}
                      file={gdoc.fileName}
                    />
                  ))}
                </div>

                {bundle.newForm.guards.education && (
                  <div className="mt-8 bg-gray-50 p-8 rounded-[40px] space-y-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Education Level Distribution
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                      {bundle.newForm.guards.education.map(
                        (edu: any, edui: number) => (
                          <div
                            key={`edu-${edui}`}
                            className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm"
                          >
                            <p className="text-[8px] font-bold text-gray-400 uppercase mb-2 truncate">
                              {edu.level}
                            </p>
                            <div className="flex justify-between items-end">
                              <div className="text-center">
                                <p className="text-[8px] text-blue-400 font-bold uppercase">
                                  M
                                </p>
                                <p className="text-xs font-black text-primary">
                                  {edu.m}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-[8px] text-pink-400 font-bold uppercase">
                                  F
                                </p>
                                <p className="text-xs font-black text-primary">
                                  {edu.f}
                                </p>
                              </div>
                              <div className="text-center bg-gray-900 text-secondary px-2 py-1 rounded-lg">
                                <p className="text-[8px] font-bold uppercase">
                                  T
                                </p>
                                <p className="text-xs font-black">{edu.t}</p>
                              </div>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </section>
            )}
          </>
        )}

        {/* Step 3: Agreement */}
        <section className="p-12 space-y-8 border-b-2 border-gray-50">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-secondary shadow-lg">
                <Shield className="w-6 h-6" />
              </div>
              <h5 className="text-2xl font-black text-primary uppercase tracking-tighter">
                {t.processSteps.agreement}
              </h5>
            </div>
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-xl">
              {bundle.agreement?.date}
            </span>
          </div>
          <div className="p-10 bg-primary/5 rounded-[48px] border border-primary/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
            <div className="relative z-10">
              <p className="text-2xl font-black text-primary mb-4 leading-tight">
                {bundle.agreement?.terms}
              </p>
              <p className="text-lg font-medium text-gray-600 leading-relaxed max-w-2xl">
                {bundle.agreement?.commitments}
              </p>
            </div>
            {bundle.newForm?.qualification && (
              <div className="mt-8 flex space-x-6 border-t border-primary/10 pt-6">
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    Qualification Granted
                  </p>
                  <p className="text-xl font-black text-primary uppercase">
                    {bundle.newForm.qualification}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    Criteria Status
                  </p>
                  <p
                    className={`text-xl font-black uppercase ${bundle.newForm.criteriaMet ? "text-green-600" : "text-amber-600"}`}
                  >
                    {bundle.newForm.criteriaMet ? "Fully Met" : "Partially Met"}
                  </p>
                </div>
              </div>
            )}
            <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity">
              <Shield className="w-48 h-48" />
            </div>
          </div>
        </section>

        {/* Step 4: Payment */}
        <section className="p-12 space-y-8">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-secondary shadow-lg">
                <BadgeCheck className="w-6 h-6" />
              </div>
              <h5 className="text-2xl font-black text-primary uppercase tracking-tighter">
                {t.processSteps.payment}
              </h5>
            </div>
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-xl">
              {bundle.payment?.date}
            </span>
          </div>
          <div className="p-10 bg-green-500 rounded-[48px] shadow-2xl flex flex-col md:flex-row justify-between items-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 -mr-32 -mt-32 rounded-full" />
            <div className="relative z-10 space-y-4 text-center md:text-left">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.3em] opacity-80 mb-2">
                  Final Clearance & Payment
                </p>
                <p className="text-5xl font-black tracking-tighter">
                  {bundle.payment?.amount}
                </p>
              </div>
              <div className="flex flex-wrap gap-4 pt-2 justify-center md:justify-start">
                <div className="px-4 py-2 bg-white/20 rounded-2xl backdrop-blur-md border border-white/20">
                  <p className="text-[9px] font-bold uppercase opacity-70">
                    Method
                  </p>
                  <p className="text-sm font-black">{bundle.payment?.method}</p>
                </div>
                {bundle.payment?.ref && (
                  <div className="px-4 py-2 bg-white/20 rounded-2xl backdrop-blur-md border border-white/20">
                    <p className="text-[9px] font-bold uppercase opacity-70">
                      Reference
                    </p>
                    <p className="text-sm font-black">{bundle.payment?.ref}</p>
                  </div>
                )}
              </div>
            </div>
            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              className="relative z-10 mt-8 md:mt-0"
            >
              <CheckCircle2 className="w-32 h-32 text-white/90 drop-shadow-2xl" />
            </motion.div>
          </div>
          {bundle.newForm?.warningNotes && (
            <div className="mt-8 p-10 bg-amber-50 rounded-[48px] border border-amber-100 flex items-start space-x-6">
              <AlertCircle className="w-12 h-12 text-amber-500 shrink-0" />
              <div>
                <h6 className="text-xl font-black text-amber-600 uppercase tracking-tight">
                  Renewal Warning Notes
                </h6>
                <p className="text-lg font-medium text-amber-700/80 leading-relaxed italic">
                  "{bundle.newForm.warningNotes}"
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    );
  };

  const agencies = [
    {
      id: 1,
      name: "Abyssinia Security",
      manager: "Abenezer Kassa",
      staff: 124,
      status: "Active",
      location: "Addis Ababa",
      email: "info@abyssinia.com",
      phone: "+251 911 223344",
      guards: 450,
      vehicles: 12,
      offices: "Addis Ababa, Adama",
      founded: "2015",
      type: "National",
      licenseNumber: "FPS-2024-001",
      licenseExpiry: "2026-05-15",
      applicationBundle: {
        formalLetter: {
          title: "Request for Initial Registration",
          date: "2015-05-20",
          summary: "Official letter seeking setup permission.",
          content:
            "Abyssinia Security Services formally requests registration as a national private security provider. We commit to the highest standards of safety and compliance with Federal Police regulations.",
        },
        newForm: {
          date: "2015-06-01",
          agencyName: "Abyssinia Security Services",
          headOfficeName: "Abyssinia HQ - Piazza",
          branchOfficeName: "Bole Branch",
          fax: "+251 11 223345",
          region: "Addis Ababa",
          zone: "Kirkos",
          woreda: "02",
          kebele: "03",
          houseNumber: "882",
          email: "info@abyssinia-security.com",
          phone: "+251911123456",
          orgDocs: [
            {
              label: "Trade name designation",
              date: "2015-05-10",
              fileName: "trade_name.pdf",
            },
            {
              label: "Trade pre-registration",
              date: "2015-05-12",
              fileName: "pre_reg.pdf",
            },
            {
              label: "TIN number",
              date: "2015-05-15",
              fileName: "tin_cert.jpg",
            },
            {
              label: "Articles of incorporation",
              date: "2015-05-18",
              fileName: "articles.pdf",
            },
          ],
          renewedTradeLicense: "renewed_license.pdf",
          laborSkillRegistration: "labor_cert.pdf",
          trademark: "trademark.pdf",
          orgStructure: "org_structure.pdf",
          internalRegulations: "internal_regulations.pdf",
          technologyLists: "tech_inventory.pdf",
          bankStatement: "bank_statement_2024.pdf",
          assets: {
            offices: 5,
            storeHouse: "Yes",
            computers: 25,
            vehicles: 12,
            notarizedVehicle: "vehicle_ownership.pdf",
            notarizedHouse: "house_rent.pdf",
            employmentForm: "employment_standard.pdf",
            employmentWarranty: "warranty_doc.pdf",
            photos: [
              { label: "Uniform Sample", fileName: "uniform.jpg" },
              { label: "ID Sample", fileName: "id_card.png" },
              { label: "Logo", fileName: "logo.svg" },
            ],
          },
          training: {
            address: "Kotebe Police Training Wing",
            days: 60,
            provider: "National Security Institute",
            manual: "Security_Handbook_v1.pdf",
            certificate: "training_accreditation.pdf",
          },
          personnel: [
            {
              role: "Manager",
              name: "Abenezer Kassa",
              gender: "Male",
              citizenship: "Ethiopian",
              email: "abenezer@abyssinia.com",
              phone: "+251 911 001122",
              faydaId: "FAYDA-998811",
              address: {
                region: "Addis Ababa",
                zone: "Lideta",
                woreda: "04",
                kebele: "05",
                houseNo: "221",
                special: "Near Piazza",
              },
              docs: [
                { label: "Fingerprint", fileName: "fingerprint.pdf" },
                { label: "Medical Result", fileName: "medical_cert.pdf" },
                {
                  label: "Training Certificate",
                  fileName: "training_cert.pdf",
                },
                { label: "Support Letter", fileName: "kebele_support.pdf" },
                { label: "Collateral Proof", fileName: "collateral.pdf" },
                { label: "Work Experience", fileName: "experience_doc.pdf" },
                { label: "Resignation Record", fileName: "resignation.pdf" },
                { label: "Education Degree", fileName: "degree_cert.pdf" },
                { label: "Kebele ID", fileName: "kebele_id.pdf" },
                { label: "Org ID", fileName: "org_id.pdf" },
              ],
            },
            {
              role: "Operations Head",
              name: "Kebede Alemu",
              gender: "Male",
              citizenship: "Ethiopian",
              email: "kebede@abyssinia.com",
              phone: "+251 911 334455",
              faydaId: "FAYDA-776655",
              address: {
                region: "Addis Ababa",
                zone: "Kirkos",
                woreda: "01",
                kebele: "02",
                houseNo: "334",
                special: "Stadium Area",
              },
              docs: [
                { label: "Fingerprint", fileName: "fingerprint_ops.pdf" },
                { label: "Medical Result", fileName: "medical_ops.pdf" },
                { label: "Training Certificate", fileName: "training_ops.pdf" },
                { label: "Support Letter", fileName: "kebele_support_ops.pdf" },
                { label: "Collateral Proof", fileName: "collateral_ops.pdf" },
                { label: "Work Experience", fileName: "experience_ops.pdf" },
                {
                  label: "Resignation Record",
                  fileName: "resignation_ops.pdf",
                },
                { label: "Education Degree", fileName: "degree_ops.pdf" },
                { label: "Kebele ID", fileName: "kebele_id_ops.pdf" },
                { label: "Org ID", fileName: "org_id_ops.pdf" },
              ],
            },
            {
              role: "Administration Head",
              name: "Genet Tadesse",
              gender: "Female",
              citizenship: "Ethiopian",
              email: "genet@abyssinia.com",
              phone: "+251 922 556677",
              faydaId: "FAYDA-112233",
              address: {
                region: "Addis Ababa",
                zone: "Bole",
                woreda: "03",
                kebele: "04",
                houseNo: "112",
                special: "Bole Roundabout",
              },
              docs: [
                { label: "Fingerprint", fileName: "fingerprint_admin.pdf" },
                { label: "Medical Result", fileName: "medical_admin.pdf" },
                {
                  label: "Training Certificate",
                  fileName: "training_admin.pdf",
                },
                {
                  label: "Support Letter",
                  fileName: "kebele_support_admin.pdf",
                },
                { label: "Education Degree", fileName: "degree_admin.pdf" },
                { label: "Org ID", fileName: "org_id_admin.pdf" },
              ],
            },
          ],
        },
        agreement: {
          date: "2015-04-20",
          terms: "Standard Operating Agreement v1.0",
          commitments:
            "Technical committee inspection passed. Commitment to hire 100+ guards within 3 months.",
        },
        payment: {
          date: "2015-05-01",
          method: "CBE Bank Transfer",
          amount: "150,000 ETB",
          ref: "TRF-882100",
        },
      },
      renewalHistory: [
        {
          year: "2024",
          bundle: {
            formalLetter: {
              title: "2024 License Renewal",
              date: "2024-01-05",
              summary:
                "Annual renewal request for the fiscal year 2024. All operations remain compliant with existing regulations.",
            },
            agreement: {
              date: "2024-01-15",
              terms: "Renewal Agreement v4.2",
              commitments: "Ongoing commitment to standards and training.",
            },
            payment: {
              date: "2024-01-20",
              amount: "55,000 ETB",
              method: "Telebirr",
              ref: "TLB-772211",
            },
            newForm: {
              date: "2024-01-08",
              agencyName: "Abyssinia Security Services",
              orgName: "Abyssinia Security",
              licenseStatus: "Current",
              region: "Addis Ababa",
              zone: "Kirkos",
              woreda: "05",
              kebele: "02",
              houseNumber: "991",
              fax: "+251 11 639 0000",
              qualification: "First Level",
              criteriaMet: true,
              warningNotes:
                "Please ensure all field supervisors attend the leadership workshop by Q3.",
              personnelStats: { dismissed: 12, hired: 45 },
              assets: {
                offices: "Head Office + 3 Branches",
                storeHouse: "2 Main Warehouses",
                computers: "45 Units",
                vehicles: "12 Patrol Cars",
              },
              training: {
                provider: "Federal Police Training Wing",
                days: 15,
                address: "Kotebe, Addis Ababa",
                manual: "Renewal_Manual_2024.pdf",
                stats: { male: 120, female: 80, total: 200 },
              },
              personnel: [
                {
                  role: "Manager",
                  name: "Abenezer Kassa",
                  gender: "Male",
                  citizenship: "Ethiopian",
                  email: "abenezer@abyssinia.com",
                  phone: "+251 911 001122",
                  faydaId: "FAYDA-998811",
                  address: {
                    region: "Addis Ababa",
                    zone: "Lideta",
                    woreda: "04",
                    kebele: "05",
                    houseNo: "221",
                    special: "Near Piazza",
                  },
                  docs: [
                    {
                      label: "Fingerprint",
                      fileName: "fingerprint_m_2024.pdf",
                    },
                    { label: "Medical Result", fileName: "medical_m_2024.pdf" },
                    {
                      label: "Training Certificate",
                      fileName: "training_m_2024.pdf",
                    },
                    { label: "Degree Cert", fileName: "degree_m_2024.pdf" },
                    {
                      label: "Renewed Kebele ID",
                      fileName: "kebele_id_m_2024.pdf",
                    },
                  ],
                },
                {
                  role: "Operations Head",
                  name: "Kebede Alemu",
                  gender: "Male",
                  citizenship: "Ethiopian",
                  email: "kebede@abyssinia.com",
                  phone: "+251 911 334455",
                  faydaId: "FAYDA-776655",
                  address: {
                    region: "Addis Ababa",
                    zone: "Kirkos",
                    woreda: "01",
                    kebele: "02",
                    houseNo: "334",
                    special: "Stadium Area",
                  },
                  docs: [
                    {
                      label: "Fingerprint",
                      fileName: "fingerprint_ops_2024.pdf",
                    },
                    {
                      label: "Medical Result",
                      fileName: "medical_ops_2024.pdf",
                    },
                    {
                      label: "Training Certificate",
                      fileName: "training_ops_2024.pdf",
                    },
                    {
                      label: "Support Letter",
                      fileName: "kebele_support_ops_2024.pdf",
                    },
                    {
                      label: "Collateral Proof",
                      fileName: "collateral_ops_2024.pdf",
                    },
                    {
                      label: "Work Experience",
                      fileName: "experience_ops_2024.pdf",
                    },
                    {
                      label: "Resignation Record",
                      fileName: "resignation_ops_2024.pdf",
                    },
                    {
                      label: "Education Degree",
                      fileName: "degree_ops_2024.pdf",
                    },
                    { label: "Kebele ID", fileName: "kebele_id_ops_2024.pdf" },
                    { label: "Org ID", fileName: "org_id_ops_2024.pdf" },
                  ],
                },
                {
                  role: "Administration Head",
                  name: "Genet Tadesse",
                  gender: "Female",
                  citizenship: "Ethiopian",
                  email: "genet@abyssinia.com",
                  phone: "+251 922 556677",
                  faydaId: "FAYDA-112233",
                  address: {
                    region: "Addis Ababa",
                    zone: "Bole",
                    woreda: "03",
                    kebele: "04",
                    houseNo: "112",
                    special: "Bole Roundabout",
                  },
                  docs: [
                    {
                      label: "Fingerprint",
                      fileName: "fingerprint_admin_2024.pdf",
                    },
                    {
                      label: "Medical Result",
                      fileName: "medical_admin_2024.pdf",
                    },
                    {
                      label: "Training Certificate",
                      fileName: "training_admin_2024.pdf",
                    },
                    {
                      label: "Support Letter",
                      fileName: "kebele_support_admin_2024.pdf",
                    },
                    {
                      label: "Education Degree",
                      fileName: "degree_admin_2024.pdf",
                    },
                    {
                      label: "Kebele ID",
                      fileName: "kebele_id_admin_2024.pdf",
                    },
                    { label: "Org ID", fileName: "org_id_admin_2024.pdf" },
                  ],
                },
              ],
              guards: {
                docs: [
                  {
                    label: "Citizenship Proof",
                    fileName: "guards_citizen.pdf",
                  },
                  {
                    label: "Police Fingerprint",
                    fileName: "guards_finger.pdf",
                  },
                  { label: "Medical Cert", fileName: "guards_med.pdf" },
                ],
                education: [
                  { level: "3rd to 9th Grade", m: 45, f: 12, t: 57 },
                  { level: "10th to 12th Grade", m: 120, f: 65, t: 185 },
                  { level: "Certificate", m: 30, f: 15, t: 45 },
                  { level: "Diploma", m: 10, f: 5, t: 15 },
                  { level: "Degree", m: 5, f: 2, t: 7 },
                ],
              },
            },
          },
        },
      ],
      assets: [
        {
          type: "Communication Devices",
          details: "85 Walkie-talkies, 15 Satellite phones",
        },
        { type: "Tactical Gear", details: "500 Uniform sets, 200 Body armors" },
        {
          type: "Specialized Vehicles",
          details: "4 Armored cash-in-transit vans",
        },
      ],
      personnelGroups: [
        { role: "Executive Officers", count: 8 },
        { role: "Field Supervisors", count: 25 },
        { role: "Active Guards", count: 417 },
      ],
      personnelRegistry: [
        {
          name: "Kebede Tolossa",
          id: "G-4412",
          role: "Guard",
          docs: "All Verified",
          status: "Active",
        },
        {
          name: "Sara Abraham",
          id: "G-4901",
          role: "Guard",
          docs: "Pending Background",
          status: "Inactive",
        },
        {
          name: "Mohammed Ali",
          id: "S-1022",
          role: "Supervisor",
          docs: "All Verified",
          status: "Active",
        },
      ],
    },
    {
      id: 2,
      name: "Lion Guard Services",
      manager: "Tewodros M.",
      staff: 85,
      status: "Active",
      location: "Bishoftu",
      email: "contact@lionguard.et",
      phone: "+251 922 445566",
      guards: 280,
      vehicles: 5,
      offices: "Bishoftu",
      founded: "2018",
      type: "Regional",
      licenseNumber: "FPS-2024-012",
      licenseExpiry: "2026-08-20",
      applicationBundle: {
        formalLetter: {
          title: "Initial Registration",
          date: "2018-02-10",
          summary: "Request to operate in Bishoftu region.",
          content:
            "Lion Guard Services requests permission to provide specialized security in the Oromia region...",
        },
        newForm: {
          date: "2018-02-15",
          agencyName: "Lion Guard Services",
          headOfficeName: "Bishoftu, Center Mall, 2nd Floor",
          region: "Oromia",
          zone: "East Shewa",
          woreda: "Bishoftu",
          kebele: "01",
          houseNumber: "442",
          email: "contact@lionguard.et",
          phone: "+251 922 445566",
          orgDocs: [
            {
              label: "Trade name designation",
              status: "Verified",
              date: "2018-01-05",
            },
            {
              label: "Trade pre-registration",
              status: "Verified",
              date: "2018-01-10",
            },
            { label: "TIN number", status: "Verified", date: "2018-01-12" },
            {
              label: "Articles of incorporation",
              status: "Verified",
              date: "2018-01-20",
            },
          ],
          assets: {
            offices: "1 Headquarters, 2 Field Units",
            storeHouse: "Yes (Climate Controlled)",
            computers: "12 Workstations",
            vehicles: "5 Patrol Vehicles",
            uniformSamples: "Verified",
            idSamples: "Verified",
            logo: "Verified",
          },
          training: {
            address: "Bishoftu Training Center, Lake View Blvd",
            days: 45,
            provider: "National Defense Academy",
            manual: "Standard Security Protocol v1.0",
          },
          personnel: [
            {
              name: "Tewodros M.",
              role: "Manager",
              verified: true,
              docs: ["Manager_ID.pdf"],
            },
            {
              name: "Abate K.",
              role: "Operations Head",
              verified: true,
              docs: ["Ops_Cert.pdf"],
            },
            {
              name: "Genet T.",
              role: "Administration Head",
              verified: true,
              docs: ["Admin_Degree.pdf"],
            },
          ],
        },
        agreement: {
          date: "2018-02-25",
          terms: "Regional Service Agreement v2.1",
          commitments: "Focus on industrial park security and rapid response.",
        },
        payment: {
          date: "2018-03-01",
          method: "Awash Bank",
          amount: "85,000 ETB",
          ref: "AWB-22100",
        },
      },
      renewalHistory: [
        {
          year: "2024",
          bundle: {
            formalLetter: { title: "2024 Renewal", date: "2024-03-12" },
            form: { licenseStatus: "Valid" },
            agreement: { date: "2024-03-20" },
            payment: { amount: "25,000 ETB" },
          },
        },
      ],
      orgDocs: [
        { title: "Trade License", status: "Verified", date: "2023-12-10" },
        { title: "TIN Certificate", status: "Verified", date: "2018-02-15" },
      ],
      assets: [
        { type: "Communication", details: "40 Radio units" },
        { type: "Equipment", details: "300 Basic guard kits" },
      ],
      personnelGroups: [
        { role: "Management", count: 5 },
        { role: "Staff", count: 80 },
      ],
    },
    {
      id: 3,
      name: "Nile Protection",
      manager: "Selamawit G.",
      staff: 42,
      status: "Suspended",
      location: "Bahir Dar",
      email: "nile@protection.com",
      phone: "+251 933 667788",
      guards: 120,
      vehicles: 3,
      offices: "Bahir Dar",
      founded: "2020",
      type: "Regional",
      licenseNumber: "FPS-2024-045",
      licenseExpiry: "2025-01-10",
      applicationBundle: {
        formalLetter: {
          title: "Setup Request",
          date: "2020-05-10",
          summary: "Establishment in Amhara region.",
          content:
            "Seeking to establish Nile Protection as a premier regional security firm...",
        },
        newForm: {
          date: "2020-05-15",
          orgName: "Nile Protection",
          headOffice: "Bahir Dar, Lake View Bldg",
          requirements: [
            {
              id: 1,
              text: "Region: Amhara, Zone: West Gojjam, Woreda: Bahir Dar",
            },
          ],
        },
        agreement: {
          date: "2020-06-01",
          terms: "Regional Agreement v1.5",
          commitments: "Standard regional security protocols.",
        },
        payment: {
          date: "2020-06-10",
          method: "Abyssinia Bank",
          amount: "45,000 ETB",
          ref: "BOA-99211",
        },
      },
      orgDocs: [
        { title: "Trade License", status: "Expired", date: "2023-12-30" },
        { title: "TIN Certificate", status: "Verified", date: "2020-06-12" },
      ],
      assets: [{ type: "Vehicles", details: "3 Patrol cars" }],
      personnelGroups: [{ role: "Total Employees", count: 42 }],
    },
    {
      id: 4,
      name: "Eagle Eye Security",
      manager: "Dawit H.",
      staff: 210,
      status: "Active",
      location: "Adama",
      email: "eagle@eye.et",
      phone: "+251 944 889900",
      guards: 610,
      vehicles: 20,
      offices: "Adama, Hawassa, Dire Dawa",
      founded: "2012",
      type: "National",
      licenseNumber: "FPS-2024-005",
      licenseExpiry: "2026-11-30",
      applicationBundle: {
        formalLetter: {
          title: "National License Request",
          date: "2012-08-01",
          summary: "Apply for multi-regional license.",
          content:
            "Eagle Eye Security aims to be the leading national security provider...",
        },
        newForm: {
          date: "2012-08-05",
          orgName: "Eagle Eye Security",
          headOffice: "Adama, Station Rd",
          requirements: [
            { id: 1, text: "National Coverage Approval Required" },
          ],
        },
        agreement: {
          date: "2012-08-20",
          terms: "Premium National Contract v5.1",
          commitments: "Nationwide rapid response capability.",
        },
        payment: {
          date: "2012-08-25",
          method: "Dashen Bank",
          amount: "250,000 ETB",
          ref: "DASH-00223",
        },
      },
      orgDocs: [
        { title: "Trade License", status: "Verified", date: "2023-11-01" },
        { title: "TIN Certificate", status: "Verified", date: "2012-08-11" },
        { title: "Operational Permit", status: "Active", date: "2023-11-15" },
      ],
      assets: [
        { type: "Electronics", details: "CCTV Control Room, Drone units" },
      ],
      personnelGroups: [
        { role: "Command Staff", count: 15 },
        { role: "Field Personnel", count: 195 },
      ],
    },
    {
      id: 5,
      name: "Blue Nile Guards",
      manager: "Mulugeta B.",
      staff: 67,
      status: "Expired",
      location: "Hawassa",
      email: "bluenile@guards.com",
      phone: "+251 955 001122",
      guards: 150,
      vehicles: 4,
      offices: "Hawassa",
      founded: "2019",
      type: "Regional",
      licenseNumber: "FPS-2024-088",
      licenseExpiry: "2024-03-12",
      formalLetter: null,
      agreement: null,
      payments: [],
      orgDocs: [
        { title: "Trade License", status: "Expired", date: "2024-03-12" },
      ],
      assets: [],
      personnelGroups: [],
    },
  ];

  const filteredAgencies = agencies.filter((a) => {
    const matchesSearch =
      getDisplayName(a).toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.manager.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === "All" || a.type === filterType;
    const matchesStatus = filterStatus === "All" || a.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const exportToPDF = (agency: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 15;

    const addText = (
      text: string,
      size = 12,
      bold = false,
      color = [0, 0, 0],
    ) => {
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(size);
      doc.setTextColor(color[0], color[1], color[2]);

      const splitText = doc.splitTextToSize(text, pageWidth - 40);
      doc.text(splitText, 20, y);
      y += splitText.length * (size / 2) + 4;

      if (y > 270) {
        doc.addPage();
        y = 15;
      }
    };

    const addSectionHeader = (title: string) => {
      y += 5;
      doc.setFillColor(0, 31, 63);
      doc.rect(15, y - 5, pageWidth - 30, 10, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(title.toUpperCase(), 20, y + 1.5);
      doc.setTextColor(0, 0, 0);
      y += 12;
    };

    // Header
    doc.setFillColor(0, 31, 63);
    doc.rect(0, 0, pageWidth, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("FEDERAL POLICE COMMISSION", pageWidth / 2, 15, {
      align: "center",
    });
    doc.setFontSize(10);
    doc.text(
      "PRIVATE SECURITY AGENCIES REGULATION DEPARTMENT",
      pageWidth / 2,
      22,
      { align: "center" },
    );
    y = 40;

    addText(
      `OFFICIAL DOSSIER: ${getDisplayName(agency).toUpperCase()}`,
      14,
      true,
      [0, 31, 63],
    );
    addText(`License Number: ${agency.licenseNumber}`, 10, true);
    addText(
      `Status: ${agency.status}`,
      10,
      true,
      agency.status === "Active" ? [0, 150, 0] : [200, 0, 0],
    );
    y += 5;

    // INITIAL APPLICATION BUNDLE
    const bundle = agency.applicationBundle;
    if (bundle) {
      addSectionHeader("Section I: Initial Registration Dossier");

      addText("Step 1: Formal Request Letter", 11, true);
      addText(`Date: ${bundle.formalLetter.date}`, 9);
      addText(`Content Summary: ${bundle.formalLetter.summary}`, 9);
      addText(`Full Letter Content:`, 9, true);
      addText(`"${bundle.formalLetter.content}"`, 9);
      y += 4;

      addText("Step 2: Formal Application Form", 11, true);
      addText(`Submission Date: ${bundle.newForm.date}`, 9);
      addText(`Organization Name: ${bundle.newForm.orgName}`, 9);
      addText(`Head Office Address: ${bundle.newForm.headOffice}`, 9);
      addText(`Compliance Checklist:`, 9, true);
      bundle.newForm.requirements.forEach((req: any) =>
        addText(` - ${req.text}`, 8),
      );
      y += 4;

      addText("Step 3: Signed Service Agreement", 11, true);
      addText(`Date: ${bundle.agreement.date}`, 10);
      addText(`Terms: ${bundle.agreement.terms}`, 9);
      addText(`Major Commitments: ${bundle.agreement.commitments}`, 9);
      y += 4;

      addText("Step 4: Registration & License Payment", 11, true);
      addText(`Payment Date: ${bundle.payment.date}`, 9);
      addText(`Amount Paid: ${bundle.payment.amount}`, 10, true, [0, 100, 0]);
      addText(`Payment Method: ${bundle.payment.method}`, 9);
      addText(`Reference Number: ${bundle.payment.ref}`, 9);
    }

    // RENEWAL BUNDLES
    if (agency.renewalHistory?.length > 0) {
      addSectionHeader("Section II: Renewal History Dossier");
      agency.renewalHistory.forEach((renewal: any) => {
        addText(
          `REGULATORY RENEWAL CYCLE: ${renewal.year}`,
          11,
          true,
          [184, 134, 11],
        ); // Golden brown
        addText(
          `1. Formal Request: ${renewal.bundle.formalLetter.title} (Date: ${renewal.bundle.formalLetter.date})`,
          9,
        );
        addText(
          `2. Renewal Form Status: ${renewal.bundle.form.licenseStatus}`,
          9,
        );
        addText(
          `3. Updated Agreement Date: ${renewal.bundle.agreement.date}`,
          9,
        );
        addText(
          `4. License Fee Payment: ${renewal.bundle.payment.amount}`,
          10,
          true,
          [0, 100, 0],
        );
        y += 6;
      });
    }

    // Footer
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Generated on ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`,
        pageWidth / 2,
        287,
        { align: "center" },
      );
    }

    doc.save(
      `${getDisplayName(agency).replace(/\s/g, "_")}_Official_Dossier.pdf`,
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-primary">{t.title}</h2>
          <p className="text-sm text-gray-500">{t.subtitle}</p>
        </div>
        <div className="flex space-x-3 relative">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-6 py-3 border rounded-xl font-bold transition-all ${showFilters ? "bg-primary text-white border-primary shadow-lg" : "bg-white text-gray-600 hover:bg-gray-50"}`}
          >
            <Filter className="w-5 h-5" />
            <span>{t.filter}</span>
          </button>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 z-50 space-y-6"
              >
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                    {isAm ? "የፍቃድ አይነት" : "License Type"}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["All", "National", "Regional"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setFilterType(type as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === type ? "bg-primary text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                    {isAm ? "ሁኔታ" : "Status"}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["All", "Active", "Suspended", "Expired"].map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === status ? "bg-primary text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setFilterType("All");
                    setFilterStatus("All");
                  }}
                  className="w-full py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  {isAm ? "ሁሉንም አፅዳ" : "Clear All"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => {
              const csvContent =
                "data:text/csv;charset=utf-8," +
                "ID,Name,Manager,Staff,Status,Location,Type\n" +
                filteredAgencies
                  .map(
                    (a) =>
                      `${a.id},${getDisplayName(a)},${a.manager},${a.staff},${a.status},${a.location},${a.type}`,
                  )
                  .join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute(
                "download",
                `agencies_report_${new Date().toISOString().split("T")[0]}.csv`,
              );
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="flex items-center space-x-2 px-6 py-3 blue-gradient text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
          >
            <span>{t.export}</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder={t.search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Agencies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgencies.map((agency) => (
          <motion.div
            key={agency.id}
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6 relative overflow-hidden group"
          >
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-secondary transition-colors">
                <Shield className="w-6 h-6" />
              </div>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  agency.status === "Active"
                    ? "bg-green-100 text-green-700"
                    : agency.status === "Suspended"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                }`}
              >
                {agency.status === "Active"
                  ? t.status.active
                  : agency.status === "Suspended"
                    ? t.status.suspended
                    : t.status.expired}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-primary">
                {getDisplayName(agency)}
              </h3>
              <p className="text-sm text-gray-500 flex items-center mt-1">
                <MapPin className="w-3 h-3 mr-1" />
                {agency.location}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-50">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">
                  {t.manager}
                </p>
                <p className="text-sm font-bold text-gray-700">
                  {agency.manager}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">
                  {t.staff}
                </p>
                <p className="text-sm font-bold text-gray-700">
                  {agency.staff} {isAm ? "ሰራተኞች" : "Personnel"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedAgency(agency);
                    setCommType("email");
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-primary transition-colors"
                >
                  <Mail className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setSelectedAgency(agency);
                    setCommType("sms");
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-primary transition-colors"
                >
                  <Phone className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => setSelectedAgency(agency)}
                className="flex items-center space-x-1 text-xs font-bold text-primary hover:underline"
              >
                <span>{t.viewDetails}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedAgency && commType === "none" && (
          <div
            key="detail-modal-root"
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm"
          >
            <motion.div
              key="detail-modal-content"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[48px] shadow-2xl w-full max-w-[95vw] h-[95vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="bg-primary p-3 px-8 relative flex-shrink-0">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-xl flex items-center justify-center border-2 border-white/20">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white uppercase tracking-tighter leading-none">
                        {getDisplayName(selectedAgency)}
                      </h3>
                      <div className="flex items-center space-x-3 mt-0.5">
                        <p className="text-white/60 font-bold text-[9px] uppercase tracking-widest flex items-center">
                          <MapPin className="w-2.5 h-2.5 mr-1" />
                          {selectedAgency.location}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div
                      className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-[0.2em] shadow-lg ${
                        selectedAgency.status === "Active"
                          ? "bg-secondary text-primary"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {selectedAgency.status}
                    </div>
                    <button
                      onClick={() => setSelectedAgency(null)}
                      className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex space-x-4 mt-3 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    {
                      id: "info",
                      label: t.tabs.info,
                      icon: <LayoutGrid className="w-3.5 h-3.5" />,
                    },
                    {
                      id: "docs",
                      label: t.tabs.docs,
                      icon: <FileText className="w-3.5 h-3.5" />,
                    },
                    {
                      id: "license",
                      label: t.tabs.license,
                      icon: <BadgeCheck className="w-3.5 h-3.5" />,
                    },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center space-x-1.5 pb-1.5 text-[9px] font-black uppercase tracking-widest transition-all relative flex-shrink-0 ${
                        activeTab === tab.id
                          ? "text-secondary"
                          : "text-white/50 hover:text-white"
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-secondary rounded-full"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-10 bg-gray-50/50 scroll-smooth text-left">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {activeTab === "info" && (
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
                            <Briefcase className="w-5 h-5 text-secondary mb-4" />
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                              {t.manager}
                            </p>
                            <p className="text-lg font-black text-primary">
                              {selectedAgency.manager}
                            </p>
                          </div>
                          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
                            <Users className="w-5 h-5 text-secondary mb-4" />
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                              {t.staff}
                            </p>
                            <p className="text-lg font-black text-primary">
                              {selectedAgency.staff} {isAm ? "ሰራተኞች" : "Staff"}
                            </p>
                          </div>
                          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
                            <MapPin className="w-5 h-5 text-secondary mb-4" />
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                              {isAm ? "ዋና ቢሮ" : "Headquarters"}
                            </p>
                            <p className="text-lg font-black text-primary">
                              {selectedAgency.location}
                            </p>
                          </div>
                        </div>

                        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                          <div className="space-y-6">
                            <h4 className="text-sm font-black text-primary uppercase tracking-widest flex items-center">
                              <span className="w-2 h-2 bg-secondary rounded-full mr-2" />
                              Detailed Address
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 bg-gray-50 rounded-2xl">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                  Region
                                </p>
                                <p className="text-sm font-bold text-primary">
                                  {selectedAgency.applicationBundle?.newForm
                                    ?.region || selectedAgency.location}
                                </p>
                              </div>
                              <div className="p-4 bg-gray-50 rounded-2xl">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                  Zone
                                </p>
                                <p className="text-sm font-bold text-primary">
                                  {selectedAgency.applicationBundle?.newForm
                                    ?.zone || "N/A"}
                                </p>
                              </div>
                              <div className="p-4 bg-gray-50 rounded-2xl">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                  Woreda / Kebele
                                </p>
                                <p className="text-sm font-bold text-primary">
                                  {
                                    selectedAgency.applicationBundle?.newForm
                                      ?.woreda
                                  }{" "}
                                  /{" "}
                                  {
                                    selectedAgency.applicationBundle?.newForm
                                      ?.kebele
                                  }
                                </p>
                              </div>
                              <div className="p-4 bg-gray-50 rounded-2xl">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                  House / Branch
                                </p>
                                <p className="text-sm font-bold text-primary">
                                  H:
                                  {
                                    selectedAgency.applicationBundle?.newForm
                                      ?.houseNumber
                                  }{" "}
                                  |{" "}
                                  {selectedAgency.applicationBundle?.newForm
                                    ?.branchOfficeName || "No Branches"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 p-4 bg-gray-100 rounded-2xl border border-gray-200 border-dashed">
                              <MapPin className="w-5 h-5 text-primary" />
                              <div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                  Special Location / Map coordinates
                                </p>
                                <p className="text-xs font-medium text-gray-600">
                                  {selectedAgency.applicationBundle?.newForm
                                    ?.specialLocation ||
                                    "Main Road, Near Federal HQ"}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-6">
                            <h4 className="text-sm font-black text-primary uppercase tracking-widest flex items-center">
                              <span className="w-2 h-2 bg-secondary rounded-full mr-2" />
                              {t.ui.contactChannels}
                            </h4>
                            <div className="space-y-4">
                              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl">
                                <Mail className="w-5 h-5 text-primary" />
                                <div>
                                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                    {t.ui.officialEmail}
                                  </p>
                                  <p className="text-sm font-bold text-primary">
                                    {selectedAgency.email}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl">
                                <Phone className="w-5 h-5 text-primary" />
                                <div>
                                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                    {t.ui.phoneSupport}
                                  </p>
                                  <p className="text-sm font-bold text-primary">
                                    {selectedAgency.phone}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl">
                                <RefreshCw className="w-5 h-5 text-primary" />
                                <div>
                                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                    {t.ui.fax}
                                  </p>
                                  <p className="text-sm font-bold text-primary">
                                    {selectedAgency.applicationBundle?.newForm
                                      ?.fax || "N/A"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "docs" && (
                      <div className="space-y-12 pb-20">
                        {/* Initial Dossier */}
                        <BundleDisplay
                          bundle={selectedAgency.applicationBundle}
                          bundleTitle={t.ui.newApplicationBundle}
                          refId={`INITIAL-${selectedAgency.id}`}
                        />

                        {/* Renewal History Bundles */}
                        {selectedAgency.renewalHistory &&
                          selectedAgency.renewalHistory.length > 0 && (
                            <div className="mt-20 space-y-12">
                              <div className="flex justify-between items-center border-b-4 border-amber-500 pb-4">
                                <h4 className="text-2xl font-black text-primary uppercase tracking-tighter">
                                  {t.ui.renewalBundle}
                                </h4>
                              </div>
                              {selectedAgency.renewalHistory.map(
                                (renewal: any, ridx: number) => (
                                  <BundleDisplay
                                    key={`renewal-${ridx}-${renewal.year}`}
                                    bundle={renewal.bundle}
                                    bundleTitle={`Renewal Cycle: ${renewal.year}`}
                                    refId={`RENEW-${renewal.year}-${selectedAgency.id}`}
                                    isRenewal={true}
                                  />
                                ),
                              )}
                            </div>
                          )}

                        {!selectedAgency.applicationBundle &&
                          (!selectedAgency.renewalHistory ||
                            selectedAgency.renewalHistory.length === 0) && (
                            <div className="p-20 text-center">
                              <AlertCircle className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                              <p className="text-lg font-black text-gray-400 uppercase tracking-widest italic">
                                No submission data available in digital format.
                              </p>
                            </div>
                          )}
                      </div>
                    )}

                    {activeTab === "license" && (
                      <div className="flex flex-col items-center justify-center space-y-10 py-10">
                        <div className="relative">
                          <div className="absolute inset-0 bg-secondary/20 blur-[80px] rounded-full scale-150 animate-pulse" />
                          <div className="w-48 h-64 bg-white border-[12px] border-primary rounded-[32px] shadow-2xl relative z-10 flex flex-col items-center justify-between p-6">
                            <Shield className="w-12 h-12 text-primary" />
                            <div className="text-center space-y-1">
                              <div className="w-12 h-1 bg-secondary mx-auto rounded-full" />
                              <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                                {t.ui.official}
                              </p>
                              <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                                {t.ui.license}
                              </p>
                            </div>
                            <div className="w-full aspect-square bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                              <div className="grid grid-cols-4 grid-rows-4 gap-1 p-2 opacity-20">
                                {[...Array(16)].map((_, i) => (
                                  <div
                                    key={i}
                                    className="w-full h-full bg-primary"
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-center space-y-2">
                          <h4 className="text-3xl font-black text-primary uppercase tracking-tighter">
                            {t.ui.license} {selectedAgency.licenseNumber}
                          </h4>
                          <p className="text-gray-400 font-bold tracking-widest uppercase text-xs flex items-center justify-center">
                            <Clock className="w-4 h-4 mr-2" />
                            {t.ui.validUntil}: {selectedAgency.licenseExpiry}
                          </p>
                        </div>
                        <div className="flex space-x-4">
                          <button className="gold-gradient text-primary px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">
                            {t.ui.downloadPDF}
                          </button>
                          <button className="bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">
                            {t.ui.printPermit}
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Modal Footer / Actions */}
              <div className="p-8 bg-white border-t border-gray-100 flex justify-between items-center flex-shrink-0">
                <div className="flex space-x-4">
                  <button
                    onClick={() => exportToPDF(selectedAgency)}
                    className="flex items-center space-x-3 px-8 py-4 bg-secondary text-primary rounded-2xl font-black uppercase tracking-widest shadow-lg hover:shadow-xl transition-all"
                  >
                    <FileDown className="w-5 h-5" />
                    <span>{t.exportPDF}</span>
                  </button>
                  <button
                    onClick={() => setCommType("email")}
                    className="flex items-center space-x-3 px-8 py-4 bg-gray-100 text-primary rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                  >
                    <Mail className="w-5 h-5" />
                    <span>{t.ui.contactManager}</span>
                  </button>
                </div>
                <div className="flex space-x-4">
                  <button className="flex items-center space-x-3 px-8 py-4 border-2 border-red-100 text-red-500 rounded-2xl font-black uppercase tracking-widest hover:bg-red-50 transition-all">
                    <Shield className="w-5 h-5 shadow-sm" />
                    <span>{t.ui.revokeLicense}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Comm Modal */}
        {selectedAgency && commType !== "none" && (
          <div
            key="comm-modal-root"
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-primary/60 backdrop-blur-md"
          >
            <motion.div
              key="comm-modal-content"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg p-10 space-y-8"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-3 rounded-2xl ${commType === "email" ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"}`}
                  >
                    {commType === "email" ? (
                      <Mail className="w-6 h-6" />
                    ) : (
                      <MessageSquare className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-primary uppercase tracking-tighter">
                      Send {commType === "email" ? "Email" : "SMS"}
                    </h4>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                      To: {getDisplayName(selectedAgency)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCommType("none")}
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest pl-2">
                    Subject / Reference
                  </label>
                  <input
                    type="text"
                    placeholder={
                      commType === "email"
                        ? "Letter of compliance..."
                        : "Security alert..."
                    }
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-bold text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest pl-2">
                    Body Message
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Enter your official response here..."
                    className="w-full p-6 bg-gray-50 border border-gray-100 rounded-[32px] outline-none focus:ring-2 focus:ring-primary font-medium text-sm resize-none"
                  />
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  onClick={() => {
                    alert(
                      `${commType.toUpperCase()} Sent successfully to ${getDisplayName(selectedAgency)}`,
                    );
                    setCommType("none");
                    setSelectedAgency(null);
                  }}
                  className="flex-1 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl hover:scale-[1.02] transition-all"
                >
                  Confirm & Send
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* File Preview Modal */}
        <AnimatePresence>
          {previewFile && (
            <div
              key="preview-modal-root"
              className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm"
            >
              <motion.div
                key="preview-modal-content"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-[32px] shadow-2xl w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col"
              >
                <div className="p-6 border-b flex items-center justify-between bg-white z-10">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-primary">
                        {previewFile.name}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        Document Record • {previewFile.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-2 px-4 py-2 bg-primary/5 hover:bg-primary/10 rounded-xl text-xs font-bold text-primary transition-all font-mono">
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                    <button
                      onClick={() => setPreviewFile(null)}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-50 hover:bg-red-100 rounded-xl text-xs font-bold text-red-500 transition-all uppercase tracking-widest"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-auto p-4 md:p-8 bg-gray-50 flex items-center justify-center">
                  <div className="w-full max-w-4xl bg-white aspect-[1/1.4] shadow-2xl rounded-lg p-12 relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -mr-16 -mt-16 rounded-full" />
                    <div className="border-b-2 border-gray-200 pb-8 mb-8 flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-black text-primary">
                          FEDERAL POLICE COMMISSION
                        </h2>
                        <p className="text-[10px] font-bold text-gray-400">
                          REGULATION DEPARTMENT
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-primary uppercase">
                          Official Archive
                        </p>
                        <p className="text-[10px] font-bold text-gray-400">
                          REF: {previewFile.name.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-12">
                      <div className="h-4 bg-gray-100 rounded w-1/3" />
                      <div className="space-y-4">
                        <div className="h-2 bg-gray-100 rounded w-full" />
                        <div className="h-2 bg-gray-100 rounded w-full" />
                        <div className="h-2 bg-gray-100 rounded w-5/6" />
                        <div className="h-2 bg-gray-100 rounded w-full" />
                        <div className="h-2 bg-gray-100 rounded w-4/6" />
                      </div>
                      <div className="space-y-4">
                        <div className="h-2 bg-gray-100 rounded w-full" />
                        <div className="h-2 bg-gray-100 rounded w-3/6" />
                        <div className="h-2 bg-gray-100 rounded w-full" />
                      </div>
                      <div className="pt-20 border-t border-gray-100 flex justify-between items-end">
                        <div className="space-y-4">
                          <div className="w-24 h-24 border-2 border-primary/20 rounded-xl flex items-center justify-center">
                            <Shield className="w-12 h-12 text-primary opacity-20" />
                          </div>
                          <p className="text-[8px] font-bold text-gray-400 uppercase">
                            Certified System Record
                          </p>
                        </div>
                        <div className="text-center space-y-2">
                          <div className="w-32 h-1 bg-primary/50" />
                          <p className="text-[10px] font-bold text-primary">
                            Authorized Signature
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </AnimatePresence>
    </div>
  );
};
