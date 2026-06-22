import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import {
  Users,
  Mail,
  Phone,
  Fingerprint,
  GraduationCap,
  Briefcase,
  MapPin,
  Shield,
  CheckCircle2,
  Upload,
  FileText,
  Eye,
  Trash2,
  ChevronDown,
  Info,
} from "lucide-react";
import { LoadingSpinner } from "../../components/LoadingSpinner";

interface LocationOption {
  id: number;
  name: string;
}

const mockRegions: LocationOption[] = [
  { id: 1, name: "Addis Ababa" },
  { id: 2, name: "Oromia" },
  { id: 3, name: "Amhara" },
];

const mockZones: LocationOption[] = [
  { id: 1, name: "Arada" },
  { id: 2, name: "Bole" },
  { id: 3, name: "Kirkos" },
];

const mockWoredas: LocationOption[] = [
  { id: 1, name: "Woreda 01" },
  { id: 2, name: "Woreda 02" },
  { id: 3, name: "Woreda 03" },
];

const mockKebeles: LocationOption[] = [
  { id: 1, name: "Kebele 01" },
  { id: 2, name: "Kebele 02" },
  { id: 3, name: "Kebele 03" },
];

const documentTypes = [
  { key: "fingerprint", labelEn: "Fingerprint from Police", labelAm: "ከፖሊስ የጣት አሻራ", required: true },
  { key: "medical", labelEn: "Medical Result", labelAm: "የህክምና ውጤት", required: true },
  { key: "training", labelEn: "Training Certificate", labelAm: "የስልጠና የምስክር ወረቀት", required: false },
  { key: "support_letter", labelEn: "Support Letter (Kebele)", labelAm: "የድጋፍ ደብዳቤ (ቀበሌ)", required: false },
  { key: "collateral", labelEn: "Proof of Collateral", labelAm: "የማስረጃ ማስረጃ", required: true },
  { key: "work_exp", labelEn: "Work Experience", labelAm: "የስራ ልምድ", required: false },
  { key: "resignation", labelEn: "Resignation Record", labelAm: "የመልቀቂያ መዝገብ", required: false },
  { key: "education", labelEn: "Educational Certificate", labelAm: "የትምህርት የምስክር ወረቀት", required: true },
  { key: "national_id", labelEn: "National ID", labelAm: "ብሄራዊ መታወቂያ", required: true },
  { key: "passport_kebele", labelEn: "Renewed Kebele ID/Passport", labelAm: "የታደሰ የቀበሌ መታወቂያ/ፓስፖርት", required: true },
  { key: "org_id", labelEn: "Organization Identification", labelAm: "የድርጅት መታወቂያ", required: true },
];

export default function PersonnelDetailsForm() {
  const { language } = useLanguage();
  const isAm = language === "am";
  const t = (en: string, am: string) => (isAm ? am : en);

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [citizenship] = useState("ETHIOPIAN");
  const [faydaId, setFaydaId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [workExpYears, setWorkExpYears] = useState("");
  const [totalExpYears, setTotalExpYears] = useState("");
  const [region, setRegion] = useState("");
  const [zone, setZone] = useState("");
  const [woreda, setWoreda] = useState("");
  const [kebele, setKebele] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [specialLocation, setSpecialLocation] = useState("");
  const [reason, setReason] = useState("");
  const [files, setFiles] = useState<Record<string, File>>({});
  const [activeDocKey, setActiveDocKey] = useState<string | null>(null);
  const [openInfo, setOpenInfo] = useState<string | null>(null);
  const [openPosInfo, setOpenPosInfo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const infoTexts: Record<string, { en: string; am: string }> = {
    fingerprint: {
      en: "Fingerprint from the police (proof of criminal record)",
      am: "ከፖሊስ የጣት አሻራ (የወንጀል ሪከርድ ማረጋገጫ)",
    },
    medical: {
      en: "Bring your medical test outcome from a hospital or clinic",
      am: "ከሆስፒታል ወይም ክሊኒክ የህክምና ምርመራ ውጤትዎን ያምጡ",
    },
    national_id: {
      en: "Upload a photo of your National ID or Digital Fayda ID front and back as a PDF",
      am: "የብሄራዊ መታወቂያዎ ወይም የዲጂታል ፋይዳ መታወቂያዎ ፊት እና ጀርባ ፎቶ እንደ PDF ያስገቡ",
    },
  };

  const handleFileSelect = (docKey: string) => {
    setActiveDocKey(docKey);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeDocKey) {
      setFiles((prev) => ({ ...prev, [activeDocKey]: file }));
    }
    e.target.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="relative overflow-hidden bg-gradient-to-r from-[#003366] to-[#001F3F] rounded-3xl p-6 border border-white/10">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FFD700] via-[#C5A022] to-[#FFD700]" />
        <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-[#FFD700]/5" />
        <div className="relative z-10">
          <h1 className="text-xl font-black text-white uppercase tracking-tight">
            {t("New Personnel Details", "የአዲስ ሰራተኛ ዝርዝሮች")}
          </h1>
          <p className="text-xs text-white/50 font-medium mt-1">
            {t("Fill in the details for the new personnel member", "የአዲሱን የሰራተኛ አባል ዝርዝሮች ያስገቡ")}
          </p>
        </div>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="space-y-8 relative"
      >
        {submitting && <LoadingSpinner overlay text="Sending personnel details..." />}

        {submitted && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {t("Personnel details sent successfully!", "የሰራተኛ ዝርዝሮች በተሳካ ሁኔታ ተልከዋል!")}
          </div>
        )}

        {/* Basic Info */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#003366] to-[#001F3F] text-[#FFD700] flex items-center justify-center shadow-sm">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#003366]">
              {t("Basic Information", "መሰረታዊ መረጃ")}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#003366] uppercase tracking-wider mb-1.5">
                {t("First Name", "ስም")} <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder={t("First name...", "ስም...")}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] hover:border-[#003366]/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#003366] uppercase tracking-wider mb-1.5">
                {t("Middle Name", "የአባት ስም")} <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                required
                placeholder={t("Middle name...", "የአባት ስም...")}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] hover:border-[#003366]/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#003366] uppercase tracking-wider mb-1.5">
                {t("Last Name", "የአያት ስም")} <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                placeholder={t("Last name...", "የአያት ስም...")}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] hover:border-[#003366]/30 transition-all"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#003366] uppercase tracking-wider mb-1.5">
                  {t("Gender", "ጾታ")} <span className="text-orange-500">*</span>
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] hover:border-[#003366]/30 transition-all"
                >
                  <option value="">{t("Select...", "ይምረጡ...")}</option>
                  <option value="Male">{t("Male", "ወንድ")}</option>
                  <option value="Female">{t("Female", "ሴት")}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#003366] uppercase tracking-wider mb-1.5">
                  {t("Citizenship", "ዜግነት")}
                </label>
                <input
                  type="text"
                  value={citizenship}
                  disabled
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-gray-50 text-gray-500 outline-none cursor-not-allowed"
                />
              </div>
            </div>
          </div>

        {/* Identity & Contact */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#003366] to-[#001F3F] text-[#FFD700] flex items-center justify-center shadow-sm">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#003366]">
              {t("Identity & Contact", "መታወቂያ እና ግንኙነት")}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-[#003366] uppercase tracking-wider mb-1.5">
                <Fingerprint className="w-3.5 h-3.5 inline mr-1 text-[#FFD700]" />
                {t("Fayda ID", "የፋይዳ መታወቂያ")} <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                value={faydaId}
                onChange={(e) => setFaydaId(e.target.value)}
                required
                placeholder="FAN-XXXXX"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] hover:border-[#003366]/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#003366] uppercase tracking-wider mb-1.5">
                <Mail className="w-3.5 h-3.5 inline mr-1 text-[#FFD700]" />
                {t("Email", "ኢሜይል")} <span className="text-orange-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="email@example.com"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] hover:border-[#003366]/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#003366] uppercase tracking-wider mb-1.5">
                <Phone className="w-3.5 h-3.5 inline mr-1 text-[#FFD700]" />
                {t("Phone", "ስልክ")} <span className="text-orange-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="+251..."
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] hover:border-[#003366]/30 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Position & Experience */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#003366] to-[#001F3F] text-[#FFD700] flex items-center justify-center shadow-sm">
              <Briefcase className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#003366]">
              {t("Position & Experience", "ሹመት እና ልምድ")}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-[#003366] uppercase tracking-wider mb-1.5">
                <Briefcase className="w-3.5 h-3.5 inline mr-1 text-[#FFD700]" />
                {t("Position", "ሹመት")} <span className="text-orange-500">*</span>
              </label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] hover:border-[#003366]/30 transition-all"
              >
                <option value="">{t("Select position...", "ሹመት ይምረጡ...")}</option>
                <option value="Manager">{t("Personnel Manager", "የሰራተኞች አስተዳዳሪ")}</option>
                <option value="Operations">{t("Operations Head", "የኦፕሬሽን ኃላፊ")}</option>
                <option value="Admin">{t("Administration Head", "የአስተዳደር ኃላፊ")}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#003366] uppercase tracking-wider mb-1.5">
                <GraduationCap className="w-3.5 h-3.5 inline mr-1 text-[#FFD700]" />
                {t("Education Level", "የትምህርት ደረጃ")}
                <span className="text-orange-500 font-normal ml-1">({t("Optional", "አማራጭ")})</span>
              </label>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] hover:border-[#003366]/30 transition-all"
              >
                <option value="">{t("Select...", "ይምረጡ...")}</option>
                <option value="PhD">{t("PhD", "ዶክትሬት")}</option>
                <option value="Masters">{t("Master's Degree", "የማስተርስ ዲግሪ")}</option>
                <option value="Bachelor">{t("Bachelor's Degree", "የባችለር ዲግሪ")}</option>
                <option value="Diploma">{t("Diploma", "ዲፕሎማ")}</option>
                <option value="HighSchool">{t("High School", "ሁለተኛ ደረጃ")}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#003366] uppercase tracking-wider mb-1.5">
                {t("Work Experience (Years)", "የስራ ልምድ (ዓመታት)")}
                <span className="text-orange-500 font-normal ml-1">({t("Optional", "አማራጭ")})</span>
              </label>
              <button
                type="button"
                onClick={() => setOpenPosInfo(openPosInfo === "workExp" ? null : "workExp")}
                className="inline-flex items-center space-x-1 text-[10px] font-bold text-orange-600 hover:text-orange-500 transition-all duration-300 hover:scale-105 active:scale-95 mb-1"
              >
                <motion.span
                  animate={{ rotate: openPosInfo === "workExp" ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-center w-4 h-4 rounded-full bg-orange-50 text-orange-600"
                >
                  <Info className="w-2.5 h-2.5" />
                </motion.span>
                <span>{t("Learn more", "ተጨማሪ ይወቁ")}</span>
                <motion.span
                  animate={{ rotate: openPosInfo === "workExp" ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-orange-400"
                >
                  <ChevronDown className="w-3 h-3" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {openPosInfo === "workExp" && (
                  <motion.div
                    key="workExpInfo"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="mb-2 p-2 bg-gradient-to-br from-orange-50 to-amber-50/50 border border-orange-200/70 rounded-xl shadow-sm">
                      <p className="text-[10px] text-orange-900 leading-relaxed font-medium">
                        {t("Enter your work experience years relevant to your current position.", "ከአሁን ሹመትዎ ጋር የሚዛመድ የስራ ልምድ ዓመታትዎን ያስገቡ።")}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <input
                type="number"
                min="0"
                value={workExpYears}
                onChange={(e) => setWorkExpYears(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] hover:border-[#003366]/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#003366] uppercase tracking-wider mb-1.5">
                {t("Total Experience (Years)", "አጠቃላይ ልምድ (ዓመታት)")}
                <span className="text-orange-500 font-normal ml-1">({t("Optional", "አማራጭ")})</span>
              </label>
              <button
                type="button"
                onClick={() => setOpenPosInfo(openPosInfo === "totalExp" ? null : "totalExp")}
                className="inline-flex items-center space-x-1 text-[10px] font-bold text-orange-600 hover:text-orange-500 transition-all duration-300 hover:scale-105 active:scale-95 mb-1"
              >
                <motion.span
                  animate={{ rotate: openPosInfo === "totalExp" ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-center w-4 h-4 rounded-full bg-orange-50 text-orange-600"
                >
                  <Info className="w-2.5 h-2.5" />
                </motion.span>
                <span>{t("Learn more", "ተጨማሪ ይወቁ")}</span>
                <motion.span
                  animate={{ rotate: openPosInfo === "totalExp" ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-orange-400"
                >
                  <ChevronDown className="w-3 h-3" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {openPosInfo === "totalExp" && (
                  <motion.div
                    key="totalExpInfo"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="mb-2 p-2 bg-gradient-to-br from-orange-50 to-amber-50/50 border border-orange-200/70 rounded-xl shadow-sm">
                      <p className="text-[10px] text-orange-900 leading-relaxed font-medium">
                        {t("Enter your total experience years across Police, Defence force, or other work areas.", "በፖሊስ፣ በመከላከያ ሠራዊት ወይም በሌሎች የስራ ዘርፎች ያለዎትን አጠቃላይ የልምድ ዓመታት ያስገቡ።")}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <input
                type="number"
                min="0"
                value={totalExpYears}
                onChange={(e) => setTotalExpYears(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] hover:border-[#003366]/30 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#003366] to-[#001F3F] text-[#FFD700] flex items-center justify-center shadow-sm">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#003366]">
              {t("Residential Address", "የመኖሪያ አድራሻ")}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-[#003366] uppercase tracking-wider mb-1.5">
                {t("Region", "ክልል")} <span className="text-orange-500">*</span>
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] hover:border-[#003366]/30 transition-all"
              >
                <option value="">{t("Select region...", "ክልል ይምረጡ...")}</option>
                {mockRegions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#003366] uppercase tracking-wider mb-1.5">
                {t("Zone", "ዞን")} <span className="text-orange-500">*</span>
              </label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] hover:border-[#003366]/30 transition-all"
              >
                <option value="">{t("Select zone...", "ዞን ይምረጡ...")}</option>
                {mockZones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#003366] uppercase tracking-wider mb-1.5">
                {t("Woreda", "ወረዳ")} <span className="text-orange-500">*</span>
              </label>
              <select
                value={woreda}
                onChange={(e) => setWoreda(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] hover:border-[#003366]/30 transition-all"
              >
                <option value="">{t("Select woreda...", "ወረዳ ይምረጡ...")}</option>
                {mockWoredas.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#003366] uppercase tracking-wider mb-1.5">
                {t("Kebele", "ቀበሌ")} <span className="text-orange-500">*</span>
              </label>
              <select
                value={kebele}
                onChange={(e) => setKebele(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] hover:border-[#003366]/30 transition-all"
              >
                <option value="">{t("Select kebele...", "ቀበሌ ይምረጡ...")}</option>
                {mockKebeles.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#003366] uppercase tracking-wider mb-1.5">
                {t("House Number", "የቤት ቁጥር")} <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                value={houseNo}
                onChange={(e) => setHouseNo(e.target.value)}
                required
                placeholder={t("e.g. House 123", "ለምሳሌ ቤት 123")}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] hover:border-[#003366]/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#003366] uppercase tracking-wider mb-1.5">
                {t("Special Location", "ልዩ ቦታ")}
                <span className="text-orange-500 font-normal ml-1">({t("Optional", "አማራጭ")})</span>
              </label>
              <input
                type="text"
                value={specialLocation}
                onChange={(e) => setSpecialLocation(e.target.value)}
                placeholder={t("Near landmark...", "መስህር አጠገብ...")}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] hover:border-[#003366]/30 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Reason for Change */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#003366] to-[#001F3F] text-[#FFD700] flex items-center justify-center shadow-sm">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#003366]">
              {t("Reason for Change", "የለውጡ ምክንያት")} <span className="text-orange-500">*</span>
            </h3>
          </div>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            rows={4}
            placeholder={t("Describe the reason for this personnel change...", "የዚህን የሰራተኛ ለውጥ ምክንያት ይግለጹ...")}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] hover:border-[#003366]/30 transition-all resize-none"
          />
        </div>

        {/* Document Uploads */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#003366] to-[#001F3F] text-[#FFD700] flex items-center justify-center shadow-sm">
              <Upload className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#003366]">
              {t("Required Documents", "የሚፈለጉ ሰነዶች")}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {documentTypes.map((doc) => {
              const uploadedFile = files[doc.key];
              const previewUrl = uploadedFile ? URL.createObjectURL(uploadedFile) : null;
              const hasExperience = Number(workExpYears) > 0 || Number(totalExpYears) > 0;
              const isRequired = doc.required || (hasExperience && (doc.key === "work_exp" || doc.key === "resignation"));
              return (
              <motion.div
                key={doc.key}
                whileHover={{ y: -2 }}
                className={`group relative rounded-[20px] border-2 transition-all duration-500 p-4 ${
                  uploadedFile
                    ? "bg-white border-solid border-green-200 shadow-lg shadow-green-500/5 ring-4 ring-green-50/30"
                    : "bg-gray-50/50 border-dashed border-gray-200 hover:border-[#003366]/40 hover:bg-white"
                }`}
              >
                {uploadedFile && (
                  <div className="absolute -top-3 -right-3 z-10">
                    <div className="flex items-center space-x-1 bg-green-500 text-white px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl shadow-green-500/30 border-2 border-white">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{t("UPLOADED", "ተሰቅሏል")}</span>
                    </div>
                  </div>
                )}

                {["fingerprint", "medical", "national_id"].includes(doc.key) && infoTexts[doc.key] && (
                  <div className="mb-3">
                    <button
                      type="button"
                      onClick={() => setOpenInfo(openInfo === doc.key ? null : doc.key)}
                      className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-orange-600 hover:text-orange-500 transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      <motion.span
                        animate={{ rotate: openInfo === doc.key ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-50 text-orange-600"
                      >
                        <Info className="w-3 h-3" />
                      </motion.span>
                      <span>{t("Learn more", "ተጨማሪ ይወቁ")}</span>
                      <motion.span
                        animate={{ rotate: openInfo === doc.key ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-orange-400"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {openInfo === doc.key && (
                        <motion.div
                          key="info"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="mt-2 p-3 bg-gradient-to-br from-orange-50 to-amber-50/50 border border-orange-200/70 rounded-xl shadow-sm">
                            <p className="text-[11px] text-orange-900 leading-relaxed font-medium">
                              {isAm ? infoTexts[doc.key]?.am : infoTexts[doc.key]?.en}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 flex-shrink-0 shadow-sm ${
                    uploadedFile ? "bg-green-50 text-green-500" : "bg-white border text-gray-400"
                  }`}>
                    {uploadedFile ? (
                      <FileText className="w-6 h-6" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className={`text-sm font-black tracking-tight break-words leading-snug ${
                        uploadedFile ? "text-green-600" : "text-[#003366]"
                      }`}>
                        {uploadedFile ? uploadedFile.name : (isAm ? doc.labelAm : doc.labelEn)}
                      </h4>
                      {isRequired && !uploadedFile && (
                        <span className="text-xs text-orange-500 font-black bg-orange-50 px-1.5 rounded-md">*</span>
                      )}
                      {!isRequired && !uploadedFile && (
                        <span className="text-[10px] text-amber-700 bg-amber-50 font-black rounded-md px-1.5 py-0.5 uppercase tracking-widest">
                          {t("Optional", "አማራጭ")}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                        {uploadedFile
                          ? `${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB`
                          : "PDF Max 5MB"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {!uploadedFile ? (
                      <button
                        type="button"
                        onClick={() => handleFileSelect(doc.key)}
                        className="px-4 py-2 bg-white border-2 border-gray-100 text-[#003366] rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:border-[#003366] hover:shadow-lg transition-all active:scale-95"
                      >
                        {t("Select File", "ፋይል ይምረጡ")}
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => window.open(previewUrl || "", "_blank")}
                          className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFiles((prev) => {
                              const next = { ...prev };
                              delete next[doc.key];
                              return next;
                            });
                          }}
                          className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
              );
            })}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf"
            className="hidden"
          />
        </div>

      </motion.form>
    </motion.div>
  );
}
