import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import {
  ShieldAlert,
  Send,
  Loader2,
  CheckCircle2,
  FileText,
  User,
  Building2,
  Clock,
  Hash,
  AlertTriangle,
  Users,
  Shield,
  Briefcase,
  Search,
  PenTool,
} from "lucide-react";
import EthiopianDatePicker from "../../components/EthiopianDatePicker";
import SignaturePad from "../../components/SignaturePad";

interface CriminalReportForm {
  recordNumber: string;
  date: string;
  institutionName: string;
  stolenServiceUser: string;
  criminalActionType: string;
  incidentTime: string;
  incidentDate: string;
  criminalQuantity: string;
  damageType: string;
  protectionWorkerQuantity: string;
  customerWorkerQuantity: string;
  anotherBodyQuantity: string;
  agreement: string;
  suspectedBodies: string;
  takenActionStatus: string;
  reportPeriod3Months: boolean;
  reportPeriod6Months: boolean;
  reportPeriod9Months: boolean;
  reportPeriod1Year: boolean;
  explanation: string;
  // Reporter
  reporterFirstName: string;
  reporterMiddleName: string;
  reporterLastName: string;
  reporterTitle: string;
  reporterJobResponsibility: string;
  reporterSignature: string;
}

const initialForm: CriminalReportForm = {
  recordNumber: "",
  date: "",
  institutionName: "",
  stolenServiceUser: "",
  criminalActionType: "",
  incidentTime: "",
  incidentDate: "",
  criminalQuantity: "",
  damageType: "",
  protectionWorkerQuantity: "",
  customerWorkerQuantity: "",
  anotherBodyQuantity: "",
  agreement: "",
  suspectedBodies: "",
  takenActionStatus: "",
  reportPeriod3Months: false,
  reportPeriod6Months: false,
  reportPeriod9Months: false,
  reportPeriod1Year: false,
  explanation: "",
  reporterFirstName: "",
  reporterMiddleName: "",
  reporterLastName: "",
  reporterTitle: "",
  reporterJobResponsibility: "",
  reporterSignature: "",
};

const criminalActionTypes = [
  "Theft",
  "Armed Robbery",
  "Burglary",
  "Assault",
  "Vandalism",
  "Fraud",
  "Trespassing",
  "Cyber Crime",
  "Other",
];

const damageTypes = [
  "Property Damage",
  "Financial Loss",
  "Physical Injury",
  "Data Breach",
  "Equipment Theft",
  "Document Loss",
  "Other",
];

export default function CriminalReport() {
  const { language } = useLanguage();
  const isAm = language === "am";
  const t = (en: string, am: string) => (isAm ? am : en);

  const [form, setForm] = useState<CriminalReportForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const criminalActionAm = [
    "ስርቆት",
    "የታጠቀ ዘረፋ",
    "ሰርጎ መግባት",
    "ጥቃት",
    "ብልሽት",
    "ማጭበርበር",
    "ያለፍቃድ መግባት",
    "የሳይበር ወንጀል",
    "ሌላ",
  ];

  const damageAm = [
    "የንብረት ውድመት",
    "የገንዘብ ኪሳራ",
    "የአካል ጉዳት",
    "የመረጃ ፍሳሽ",
    "የመሳሪያ ስርቆት",
    "የሰነድ መጥፋት",
    "ሌላ",
  ];

  const updateField = (
    field: keyof CriminalReportForm,
    value: string | boolean
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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

  const inputClass =
    "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]/50 hover:border-[#003366]/30 transition-all bg-white";

  const labelClass =
    "text-[11px] uppercase tracking-[0.15em] font-bold text-[#003366] mb-1.5 block";

  const sectionHeaderClass =
    "relative overflow-hidden bg-gradient-to-r from-[#003366] to-[#001F3F] rounded-2xl p-5 border border-white/10 mb-5";

  const sectionHeaderContent = (icon: React.ReactNode, title: string) => (
    <>
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FFD700] via-[#C5A022] to-[#FFD700]" />
      <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-[#FFD700]/5" />
      <div className="relative z-10 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#FFD700]/20 flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-sm font-bold text-white">{title}</h3>
      </div>
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#003366] to-[#001F3F] rounded-3xl p-6 border border-white/10">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FFD700] via-[#C5A022] to-[#FFD700]" />
        <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-[#FFD700]/5" />
        <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-[#FFD700]/5" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white uppercase tracking-tight">
                {t("Report of Criminal", "የወንጀል ሪፖርት")}
              </h1>
              <p className="text-xs text-white/50 font-medium mt-0.5">
                {t(
                  "In Ethiopia Available Personal Protection Institutions Service",
                  "በኢትዮጵያ ውስጥ በሚገኙ የግል ጥበቃ ተቋማት አገልግሎት"
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {submitted && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {t(
              "Criminal report submitted successfully!",
              "የወንጀል ሪፖርት በተሳካ ሁኔታ ቀርቧል!"
            )}
          </div>
        )}

        {/* Section 1: Basic Info */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className={sectionHeaderClass}>
            {sectionHeaderContent(
              <FileText className="w-4 h-4 text-[#FFD700]" />,
              t("Record Information", "የመዝገብ መረጃ")
            )}
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>
                {t("Record Number", "የመዝገብ ቁጥር")}
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={form.recordNumber}
                  onChange={(e) => updateField("recordNumber", e.target.value.replace(/\D/g, ""))}
                  placeholder={t("Enter record number...", "የመዝገብ ቁጥር ያስገቡ...")}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>
                {t("Date (A.D.)", "ቀን (እ.ኤ.አ.)")}
              </label>
              <EthiopianDatePicker
                value={form.date}
                onChange={(v) => updateField("date", v)}
                className={`${inputClass} pl-10`}
                placeholder={t("Select date...", "ቀን ይምረጡ...")}
                useEthiopian={isAm}
              />
            </div>
            <div>
              <label className={labelClass}>
                {t(
                  "Report The Provider Institution Name",
                  "ሪፖርት አቅራቢ ተቋም ስም"
                )}
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={form.institutionName}
                  onChange={(e) =>
                    updateField("institutionName", e.target.value.replace(/[0-9]/g, ""))
                  }
                  placeholder={t(
                    "Enter institution name...",
                    "የተቋም ስም ያስገቡ..."
                  )}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>
                {t(
                  "Stolen Service User Organization / Individual Name",
                  "የተሰረቀ የአገልግሎት ተጠቃሚ ድርጅት / የግለሰብ ስም"
                )}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={form.stolenServiceUser}
                  onChange={(e) =>
                    updateField("stolenServiceUser", e.target.value.replace(/[0-9]/g, ""))
                  }
                  placeholder={t(
                    "Enter organization or individual name...",
                    "የድርጅት ወይም የግል ስም ያስገቡ..."
                  )}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Incident Details */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className={sectionHeaderClass}>
            {sectionHeaderContent(
              <AlertTriangle className="w-4 h-4 text-[#FFD700]" />,
              t("Incident Details", "የክስተት ዝርዝሮች")
            )}
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className={labelClass}>
                {t(
                  "What happened? Criminal Action Type",
                  "ምን ተከሰተ? የወንጀል ድርጊት አይነት"
                )}
              </label>
              <select
                value={form.criminalActionType}
                onChange={(e) =>
                  updateField("criminalActionType", e.target.value)
                }
                className={inputClass}
              >
                <option value="">
                  {t("Select criminal action type...", "የወንጀል ድርጊት አይነት ይምረጡ...")}
                </option>
                {criminalActionTypes.map((type, i) => (
                  <option key={type} value={type}>
                    {isAm ? criminalActionAm[i] : type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>
                {t("Incident Date", "የክስተት ቀን")}
              </label>
              <EthiopianDatePicker
                value={form.incidentDate}
                onChange={(v) => updateField("incidentDate", v)}
                className={`${inputClass} pl-10`}
                placeholder={t("Select date...", "ቀን ይምረጡ...")}
                useEthiopian={isAm}
              />
            </div>
            <div>
              <label className={labelClass}>
                {t("Incident Time", "የክስተት ሰዓት")}
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="time"
                  value={form.incidentTime}
                  onChange={(e) => updateField("incidentTime", e.target.value)}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>
                {t("Criminal Quantity", "የወንጀለኞች ብዛት")}
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  value={form.criminalQuantity}
                  onChange={(e) =>
                    updateField("criminalQuantity", e.target.value)
                  }
                  placeholder="0"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>
                {t("Damage Type", "የጉዳት አይነት")}
              </label>
              <select
                value={form.damageType}
                onChange={(e) => updateField("damageType", e.target.value)}
                className={inputClass}
              >
                <option value="">
                  {t("Select damage type...", "የጉዳት አይነት ይምረጡ...")}
                </option>
                {damageTypes.map((type, i) => (
                  <option key={type} value={type}>
                    {isAm ? damageAm[i] : type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>
                {t("Protection Worker Quantity", "የጥበቃ ሰራተኞች ብዛት")}
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  value={form.protectionWorkerQuantity}
                  onChange={(e) =>
                    updateField("protectionWorkerQuantity", e.target.value)
                  }
                  placeholder="0"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>
                {t("Customer Worker Quantity", "የደንበኛ ሰራተኞች ብዛት")}
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  value={form.customerWorkerQuantity}
                  onChange={(e) =>
                    updateField("customerWorkerQuantity", e.target.value)
                  }
                  placeholder="0"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>
                {t("Another Body Quantity", "የሌላ አካል ብዛት")}
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  value={form.anotherBodyQuantity}
                  onChange={(e) =>
                    updateField("anotherBodyQuantity", e.target.value)
                  }
                  placeholder="0"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>
                {t(
                  "Security, Customer and Other Body By Agreement",
                  "ደህንነት፣ ደንበኛ እና ሌላ አካል በስምምነት"
                )}
              </label>
              <input
                type="text"
                value={form.agreement}
                onChange={(e) => updateField("agreement", e.target.value)}
                placeholder={t(
                  "Describe the agreement...",
                  "ስምምነቱን ይግለጹ..."
                )}
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>
                {t(
                  "By Theft Suspected Bodies",
                  "በስርቆት የተጠረጠሩ አካላት"
                )}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  value={form.suspectedBodies}
                  onChange={(e) =>
                    updateField("suspectedBodies", e.target.value === "" ? "" : String(Math.max(0, parseInt(e.target.value) || 0)))
                  }
                  placeholder={t(
                    "Enter suspected bodies...",
                    "የተጠረጠሩ አካላትን ያስገቡ..."
                  )}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>
                {t(
                  "Taken Action Where Status",
                  "የተወሰደ እርምጃ እና ሁኔታ"
                )}
              </label>
              <textarea
                rows={3}
                value={form.takenActionStatus}
                onChange={(e) => {
                  const lines = e.target.value.split("\n");
                  if (lines.length > 3) return;
                  updateField("takenActionStatus", e.target.value);
                }}
                placeholder={t(
                  "Describe action taken and current status...",
                  "የተወሰደውን እርምጃ እና አሁን ያለበትን ሁኔታ ይግለጹ..."
                )}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Report Implementation Period */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className={sectionHeaderClass}>
            <div className="relative z-10 flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-[#FFD700]" />
                </div>
                <h2 className="text-sm font-black text-white uppercase tracking-tight">
                  {t(
                    "Standard Report Implementation Period",
                    "መደበኛ የሪፖርት ትግበራ ጊዜ"
                  )}
                </h2>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-yellow-400/20 text-yellow-300 px-2.5 py-1 rounded-full border border-yellow-400/30">
                {t("Optional", "አማራጭ")}
              </span>
            </div>
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FFD700] via-[#C5A022] to-[#FFD700]" />
            <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-[#FFD700]/5" />
            <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-[#FFD700]/5" />
          </div>
          <div className="p-6">
            <p className="text-xs font-medium text-gray-500 mb-4">
              {t(
                "Select the reporting period:",
                "የሪፖርት ማቅረቢያ ጊዜ ይምረጡ:"
              )}
            </p>
            <div className="flex flex-wrap gap-4">
              {[
                {
                  key: "reportPeriod3Months" as const,
                  label: t("3 Months", "3 ወራት"),
                },
                {
                  key: "reportPeriod6Months" as const,
                  label: t("6 Months", "6 ወራት"),
                },
                {
                  key: "reportPeriod9Months" as const,
                  label: t("9 Months", "9 ወራት"),
                },
                {
                  key: "reportPeriod1Year" as const,
                  label: t("1 Year", "1 ዓመት"),
                },
              ].map((item) => (
                <label
                  key={item.key}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                    form[item.key]
                      ? "border-[#003366] bg-[#003366]/5"
                      : "border-gray-200 bg-white hover:border-[#003366]/30"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form[item.key]}
                    onChange={(e) => updateField(item.key, e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#003366] focus:ring-[#003366]/20"
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
            </div>
        </div>

        {/* Section 4: Explanation */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className={sectionHeaderClass}>
            {sectionHeaderContent(
              <PenTool className="w-4 h-4 text-[#FFD700]" />,
              t("Explanation", "ማብራሪያ")
            )}
          </div>
          <div className="p-6">
            <textarea
              rows={4}
              value={form.explanation}
              onChange={(e) => updateField("explanation", e.target.value)}
              placeholder={t(
                "Provide additional explanation...",
                "ተጨማሪ ማብራሪያ ይስጡ..."
              )}
              className={inputClass}
            />
          </div>
        </div>

        {/* Declaration */}
        <div className="bg-amber-50/50 rounded-3xl border border-amber-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-800 uppercase tracking-[0.1em] mb-1">
                  {t("Declaration", "ማረጋገጫ")}
                </p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  {t(
                    "From here above in the proposal form base, the standard report as expected as event situation report supplier and the institution common sense information. If not available by law for those who ask, anyone case responsibility I'll take it.",
                    "ከላይ በቀረበው የሪፖርት ቅፅ መሰረት ደረጃውን የጠበቀ ሪፖርት እንደተጠበቀው የክስተት ሁኔታ ሪፖርት አቅራቢ እና የተቋሙ የጋራ እውቀት መረጃ በህግ ለማይገኝ ለሚጠይቁ ሁሉ የጉዳይ ሃላፊነት እወስዳለሁ።"
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Signatories */}
        <div className="space-y-6">
          {/* Reporter */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className={sectionHeaderClass}>
              {sectionHeaderContent(
                <User className="w-4 h-4 text-[#FFD700]" />,
                t("Report The Doer", "ሪፖርት አድራጊ")
              )}
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className={labelClass}>
                  {t("First Name", "ስም")}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.reporterFirstName}
                    onChange={(e) =>
                      updateField("reporterFirstName", e.target.value.replace(/[0-9]/g, ""))
                    }
                    placeholder={t("First name...", "ስም...")}
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>
                  {t("Middle Name", "የአባት ስም")}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.reporterMiddleName}
                    onChange={(e) =>
                      updateField("reporterMiddleName", e.target.value.replace(/[0-9]/g, ""))
                    }
                    placeholder={t("Middle name...", "የአባት ስም...")}
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>
                  {t("Last Name", "የአያት ስም")}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.reporterLastName}
                    onChange={(e) =>
                      updateField("reporterLastName", e.target.value.replace(/[0-9]/g, ""))
                    }
                    placeholder={t("Last name...", "የአያት ስም...")}
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>
                  {t("Title", "ማዕረግ")}
                </label>
                <input
                  type="text"
                  value={form.reporterTitle}
                  onChange={(e) =>
                    updateField("reporterTitle", e.target.value)
                  }
                  placeholder={t("Enter title...", "ማዕረግ ያስገቡ...")}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  {t("Job Responsibility", "የስራ ሃላፊነት")}
                </label>
                <input
                  type="text"
                  value={form.reporterJobResponsibility}
                  onChange={(e) =>
                    updateField("reporterJobResponsibility", e.target.value)
                  }
                  placeholder={t(
                    "Enter job responsibility...",
                    "የስራ ሃላፊነት ያስገቡ..."
                  )}
                  className={inputClass}
                />
              </div>
              <div className="md:col-span-2">
                <SignaturePad
                  value={form.reporterSignature}
                  onChange={(v) => updateField("reporterSignature", v)}
                  label={t("Signature", "ፊርማ")}
                  placeholder={t(
                    "Use left click / touch and drag to sign",
                    "ለመፈረም የግራ ጠቅታ / ንክኪ እና ጎትት ይጠቀሙ"
                  )}
                />
              </div>
            </div>
          </div>


        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#003366] to-[#001F3F] text-white text-xs font-bold tracking-wide px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {submitting
              ? t("Submitting...", "በማስገባት ላይ...")
              : t("Submit Report", "ሪፖርት ያስገቡ")}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
