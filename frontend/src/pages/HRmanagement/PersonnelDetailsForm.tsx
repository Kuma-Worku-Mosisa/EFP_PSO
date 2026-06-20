import React, { useState } from "react";
import { motion } from "framer-motion";
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
  Loader2,
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
  { key: "medical", labelEn: "Medical Test Result", labelAm: "የህክምና ምርመራ ውጤት", required: true },
  { key: "education", labelEn: "Educational Certificate", labelAm: "የትምህርት የምስክር ወረቀት", required: true },
  { key: "national_id", labelEn: "National ID / Digital Fayda", labelAm: "ብሄራዊ መታወቂያ / ዲጂታል ፋይዳ", required: true },
  { key: "passport_kebele", labelEn: "Renewed Kebele ID / Passport", labelAm: "የታደሰ የቀበሌ መታወቂያ / ፓስፖርት", required: true },
];

export default function PersonnelDetailsForm() {
  const { language } = useLanguage();
  const isAm = language === "am";
  const t = (en: string, am: string) => (isAm ? am : en);

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fullName, setFullName] = useState("");
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-[#003366] uppercase tracking-wider mb-1.5">
                {t("Full Name", "ሙሉ ስም")} <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder={t("Enter full name...", "ሙሉ ስም ያስገቡ...")}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] hover:border-[#003366]/30 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
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
              </label>
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
              </label>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documentTypes.map((doc) => (
              <motion.div
                key={doc.key}
                whileHover={{ y: -2 }}
                className="rounded-xl border-2 border-dashed border-gray-200 p-4 hover:border-[#FFD700]/40 hover:bg-[#FFD700]/5 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-1.5 rounded-lg bg-[#003366]">
                    <FileText className="w-3.5 h-3.5 text-[#FFD700]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#003366] truncate">
                      {isAm ? doc.labelAm : doc.labelEn}
                    </p>
                    {doc.required && (
                      <span className="text-[9px] font-bold text-orange-500">
                        {t("Required", "የግድ ነው")}
                      </span>
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    className="p-1.5 rounded-lg bg-[#003366]/5 text-[#003366] hover:bg-[#003366]/10 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#003366] to-[#001F3F] text-white text-xs font-bold tracking-wide px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            {submitting
              ? t("Sending...", "በመላክ ላይ...")
              : t("Send Personnel Details", "የሰራተኛ ዝርዝሮችን ይላኩ")}
          </motion.button>
        </div>
      </motion.form>
    </motion.div>
  );
}
