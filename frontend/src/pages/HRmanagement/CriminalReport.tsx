import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { apiRequest } from "../../lib/api";
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
  AlertCircle,
  Upload,
  XCircle,
  Eye,
  Image,
} from "lucide-react";
import EthiopianDatePicker from "../../components/EthiopianDatePicker";

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
  explanation: string;
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
  explanation: "",
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

  // Reporter fields
  const [reporterFirstName, setReporterFirstName] = useState("");
  const [reporterMiddleName, setReporterMiddleName] = useState("");
  const [reporterLastName, setReporterLastName] = useState("");
  const [reporterTitle, setReporterTitle] = useState("");
  const [reporterJobResponsibility, setReporterJobResponsibility] = useState("");
  const [reporterSignature, setReporterSignature] = useState("");
  const [signatureFileError, setSignatureFileError] = useState<string | null>(null);
  const [showSignaturePreview, setShowSignaturePreview] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfGenerated, setPdfGenerated] = useState(false);

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

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const req = (field: string, label: string) => {
      if (!form[field as keyof CriminalReportForm]?.toString().trim()) {
        errors[field] = t(`${label} is required.`, `${label} ያስፈልጋል።`);
      }
    };
    req("recordNumber", "Record Number");
    req("date", "Date");
    req("institutionName", "Institution Name");
    req("stolenServiceUser", "Stolen Service User");
    req("criminalActionType", "Criminal Action Type");
    req("incidentDate", "Incident Date");
    req("incidentTime", "Incident Time");
    req("criminalQuantity", "Criminal Quantity");
    req("damageType", "Damage Type");
    req("protectionWorkerQuantity", "Protection Worker Quantity");
    req("customerWorkerQuantity", "Customer Worker Quantity");
    req("anotherBodyQuantity", "Another Body Quantity");
    req("agreement", "Agreement");
    req("suspectedBodies", "Suspected Bodies");
    req("takenActionStatus", "Taken Action Status");
    if (!reporterFirstName.trim()) errors.reporterFirstName = t("First Name is required.", "ስም ያስፈልጋል።");
    if (!reporterMiddleName.trim()) errors.reporterMiddleName = t("Middle Name is required.", "የአባት ስም ያስፈልጋል።");
    if (!reporterLastName.trim()) errors.reporterLastName = t("Last Name is required.", "የአያት ስም ያስፈልጋል።");
    if (!reporterTitle.trim()) errors.reporterTitle = t("Title is required.", "ማዕረግ ያስፈልጋል።");
    if (!reporterJobResponsibility.trim()) errors.reporterJobResponsibility = t("Job Responsibility is required.", "የስራ ሃላፊነት ያስፈልጋል።");
    if (!reporterSignature) errors.reporterSignature = t("Signature image is required.", "የፊርማ ምስል ያስፈልጋል።");
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const generatePdfBlob = (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      try {
        const doc = new jsPDF({ unit: "mm", format: "a4" });
        const pageW = doc.internal.pageSize.getWidth();
        const margin = 20;
        let y = margin;

        const t_ = (en: string, am: string) => (isAm ? am : en);

        const addSection = (title: string) => {
          y += 4;
          doc.setFontSize(13);
          doc.setFont("helvetica", "bold");
          doc.text(title, margin, y);
          y += 1;
          doc.setDrawColor(0, 51, 102);
          doc.setLineWidth(0.5);
          doc.line(margin, y, pageW - margin, y);
          y += 6;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
        };

        const addRow = (label: string, value: string) => {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.text(label + ":", margin, y);
          doc.setFont("helvetica", "normal");
          const labelW = doc.getTextWidth(label + ":  ");
          const maxValW = pageW - margin * 2 - labelW;
          const val = value || "—";
          const lines = doc.splitTextToSize(val, maxValW);
          doc.text(lines, margin + labelW, y);
          y += Math.max(lines.length, 1) * 5;
        };

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(t_("Report of Criminal", "የወንጀል ሪፖርት"), margin, y);
        y += 7;

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        const today = new Date().toLocaleDateString(isAm ? "am-ET" : "en-US", { year: "numeric", month: "long", day: "numeric" });
        doc.text(`${t_("Generated", "የተዘጋጀ")}: ${today}`, margin, y);
        y += 10;

        addSection(t_("Record Information", "የመዝገብ መረጃ"));
        addRow(t_("Record Number", "የመዝገብ ቁጥር"), form.recordNumber);
        addRow(t_("Date", "ቀን"), form.date);
        addRow(t_("Institution Name", "የተቋም ስም"), form.institutionName);
        addRow(t_("Stolen Service User", "የተሰረቀ የአገልግሎት ተጠቃሚ"), form.stolenServiceUser);

        if (y > 240) { doc.addPage(); y = margin; }

        addSection(t_("Incident Details", "የክስተት ዝርዝሮች"));
        addRow(t_("Criminal Action Type", "የወንጀል ድርጊት አይነት"), form.criminalActionType);
        addRow(t_("Incident Date", "የክስተት ቀን"), form.incidentDate);
        addRow(t_("Incident Time", "የክስተት ሰዓት"), form.incidentTime);
        addRow(t_("Criminal Quantity", "የወንጀለኞች ብዛት"), form.criminalQuantity);
        addRow(t_("Damage Type", "የጉዳት አይነት"), form.damageType);
        addRow(t_("Protection Worker Quantity", "የጥበቃ ሰራተኞች ብዛት"), form.protectionWorkerQuantity);
        addRow(t_("Customer Worker Quantity", "የደንበኛ ሰራተኞች ብዛት"), form.customerWorkerQuantity);
        addRow(t_("Another Body Quantity", "የሌላ አካል ብዛት"), form.anotherBodyQuantity);
        addRow(t_("Agreement", "ስምምነት"), form.agreement);
        addRow(t_("Suspected Bodies", "የተጠረጠሩ አካላት"), form.suspectedBodies);
        addRow(t_("Taken Action / Status", "የተወሰደ እርምጃ / ሁኔታ"), form.takenActionStatus);

        if (y > 240) { doc.addPage(); y = margin; }

        if (form.explanation.trim()) {
          addSection(t_("Explanation", "ማብራሪያ"));
          addRow("", form.explanation);
        }

        addSection(t_("Report The Doer", "ሪፖርት አድራጊ"));
        addRow(t_("First Name", "ስም"), reporterFirstName);
        addRow(t_("Middle Name", "የአባት ስም"), reporterMiddleName);
        addRow(t_("Last Name", "የአያት ስም"), reporterLastName);
        addRow(t_("Title", "ማዕረግ"), reporterTitle);
        addRow(t_("Job Responsibility", "የስራ ሃላፊነት"), reporterJobResponsibility);

        const blob = doc.output("blob");
        resolve(blob);
      } catch (e) {
        resolve(null);
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const blob = await generatePdfBlob();
      if (!blob) throw new Error("Failed to generate PDF");
      setPdfBlob(blob);
      setPdfGenerated(true);
      const formData = new FormData();
      const fileName = `Criminal_Report_${new Date().toISOString().split("T")[0]}.pdf`;
      formData.append("report", blob, fileName);
      formData.append("recordNumber", form.recordNumber);
      formData.append("institutionName", form.institutionName);
      formData.append("criminalActionType", form.criminalActionType);
      formData.append("incidentDate", form.incidentDate);
      formData.append("reporterFirstName", reporterFirstName);
      formData.append("reporterMiddleName", reporterMiddleName);
      formData.append("reporterLastName", reporterLastName);
      if (reporterSignature) {
        const sigBlob = await (await fetch(reporterSignature)).blob();
        formData.append("signature", sigBlob, "signature.png");
      }
      await apiRequest("/criminal-reports/submit", { method: "POST", body: formData });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err: any) {
      setFormErrors((prev) => ({ ...prev, _submit: err?.message || t("Failed to submit report.", "ሪፖርቱን መላክ አልተሳካም።") }));
    } finally {
      setSubmitting(false);
    }
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
                {t("Record Number", "የመዝገብ ቁጥር")} <span className="text-red-500">*</span>
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
              {formErrors.recordNumber && (
                <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {formErrors.recordNumber}
                </p>
              )}
            </div>
            <div>
              <label className={labelClass}>
                {t("Date (A.D.)", "ቀን (እ.ኤ.አ.)")} <span className="text-red-500">*</span>
              </label>
              <EthiopianDatePicker
                value={form.date}
                onChange={(v) => updateField("date", v)}
                className={`${inputClass} pl-10`}
                placeholder={t("Select date...", "ቀን ይምረጡ...")}
                useEthiopian={isAm}
              />
              {formErrors.date && (
                <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {formErrors.date}
                </p>
              )}
            </div>
            <div>
              <label className={labelClass}>
                {t(
                  "Report The Provider Institution Name",
                  "ሪፖርት አቅራቢ ተቋም ስም"
                )} <span className="text-red-500">*</span>
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
              {formErrors.institutionName && (
                <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {formErrors.institutionName}
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>
                {t(
                  "Stolen Service User Organization / Individual Name",
                  "የተሰረቀ የአገልግሎት ተጠቃሚ ድርጅት / የግለሰብ ስም"
                )} <span className="text-red-500">*</span>
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
              {formErrors.stolenServiceUser && (
                <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {formErrors.stolenServiceUser}
                </p>
              )}
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
                )} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.criminalActionType}
                onChange={(e) =>
                  updateField("criminalActionType", e.target.value.replace(/[0-9]/g, ""))
                }
                placeholder={t("Describe what happened...", "ምን እንደተከሰተ ይግለጹ...")}
                className={inputClass}
              />
              {formErrors.criminalActionType && (
                <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {formErrors.criminalActionType}
                </p>
              )}
            </div>
            <div>
              <label className={labelClass}>
                {t("Incident Date", "የክስተት ቀን")} <span className="text-red-500">*</span>
              </label>
              <EthiopianDatePicker
                value={form.incidentDate}
                onChange={(v) => updateField("incidentDate", v)}
                className={`${inputClass} pl-10`}
                placeholder={t("Select date...", "ቀን ይምረጡ...")}
                useEthiopian={isAm}
              />
              {formErrors.incidentDate && (
                <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {formErrors.incidentDate}
                </p>
              )}
            </div>
            <div>
              <label className={labelClass}>
                {t("Incident Time", "የክስተት ሰዓት")} <span className="text-red-500">*</span>
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
              {formErrors.incidentTime && (
                <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {formErrors.incidentTime}
                </p>
              )}
            </div>
            <div>
              <label className={labelClass}>
                {t("Criminal Quantity", "የወንጀለኞች ብዛት")} <span className="text-red-500">*</span>
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
              {formErrors.criminalQuantity && (
                <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {formErrors.criminalQuantity}
                </p>
              )}
            </div>
            <div>
              <label className={labelClass}>
                {t("Damage Type", "የጉዳት አይነት")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.damageType}
                onChange={(e) => updateField("damageType", e.target.value.replace(/[0-9]/g, ""))}
                placeholder={t("Describe damage type...", "የጉዳት አይነት ይግለጹ...")}
                className={inputClass}
              />
              {formErrors.damageType && (
                <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {formErrors.damageType}
                </p>
              )}
            </div>
            <div>
              <label className={labelClass}>
                {t("Protection Worker Quantity", "የጥበቃ ሰራተኞች ብዛት")} <span className="text-red-500">*</span>
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
              {formErrors.protectionWorkerQuantity && (
                <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {formErrors.protectionWorkerQuantity}
                </p>
              )}
            </div>
            <div>
              <label className={labelClass}>
                {t("Customer Worker Quantity", "የደንበኛ ሰራተኞች ብዛት")} <span className="text-red-500">*</span>
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
              {formErrors.customerWorkerQuantity && (
                <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {formErrors.customerWorkerQuantity}
                </p>
              )}
            </div>
            <div>
              <label className={labelClass}>
                {t("Another Body Quantity", "የሌላ አካል ብዛት")} <span className="text-red-500">*</span>
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
              {formErrors.anotherBodyQuantity && (
                <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {formErrors.anotherBodyQuantity}
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>
                {t(
                  "Security, Customer and Other Body By Agreement",
                  "ደህንነት፣ ደንበኛ እና ሌላ አካል በስምምነት"
                )} <span className="text-red-500">*</span>
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
              {formErrors.agreement && (
                <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {formErrors.agreement}
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>
                {t(
                  "By Theft Suspected Bodies",
                  "በስርቆት የተጠረጠሩ አካላት"
                )} <span className="text-red-500">*</span>
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
              {formErrors.suspectedBodies && (
                <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {formErrors.suspectedBodies}
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>
                {t(
                  "Taken Action Where Status",
                  "የተወሰደ እርምጃ እና ሁኔታ"
                )} <span className="text-red-500">*</span>
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
              {formErrors.takenActionStatus && (
                <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {formErrors.takenActionStatus}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Explanation */}
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

        {/* Section: Report The Doer */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className={sectionHeaderClass}>
            {sectionHeaderContent(
              <User className="w-4 h-4 text-[#FFD700]" />,
              t("Report The Doer", "ሪፖርት አድራጊ")
            )}
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className={labelClass}>{t("First Name", "ስም")} <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={reporterFirstName}
                    onChange={(e) => setReporterFirstName(e.target.value.replace(/[0-9]/g, ""))}
                    placeholder={t("First name...", "ስም...")}
                    className={`${inputClass} pl-10`}
                  />
                </div>
                {formErrors.reporterFirstName && (
                  <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {formErrors.reporterFirstName}
                  </p>
                )}
              </div>
              <div>
                <label className={labelClass}>{t("Middle Name", "የአባት ስም")} <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={reporterMiddleName}
                    onChange={(e) => setReporterMiddleName(e.target.value.replace(/[0-9]/g, ""))}
                    placeholder={t("Middle name...", "የአባት ስም...")}
                    className={`${inputClass} pl-10`}
                  />
                </div>
                {formErrors.reporterMiddleName && (
                  <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {formErrors.reporterMiddleName}
                  </p>
                )}
              </div>
              <div>
                <label className={labelClass}>{t("Last Name", "የአያት ስም")} <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={reporterLastName}
                    onChange={(e) => setReporterLastName(e.target.value.replace(/[0-9]/g, ""))}
                    placeholder={t("Last name...", "የአያት ስም...")}
                    className={`${inputClass} pl-10`}
                  />
                </div>
                {formErrors.reporterLastName && (
                  <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {formErrors.reporterLastName}
                  </p>
                )}
              </div>
              <div>
                <label className={labelClass}>{t("Title", "ማዕረግ")} <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={reporterTitle}
                  onChange={(e) => setReporterTitle(e.target.value)}
                  placeholder={t("Enter title...", "ማዕረግ ያስገቡ...")}
                  className={inputClass}
                />
                {formErrors.reporterTitle && (
                  <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {formErrors.reporterTitle}
                  </p>
                )}
              </div>
              <div>
                <label className={labelClass}>{t("Job Responsibility", "የስራ ሃላፊነት")} <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={reporterJobResponsibility}
                  onChange={(e) => setReporterJobResponsibility(e.target.value)}
                  placeholder={t("Enter job responsibility...", "የስራ ሃላፊነት ያስገቡ...")}
                  className={inputClass}
                />
                {formErrors.reporterJobResponsibility && (
                  <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {formErrors.reporterJobResponsibility}
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>{t("Upload Signature Image", "የፊርማ ምስል ይስቀሉ")} <span className="text-red-500">*</span></label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                ref={(el) => {
                  if (el) (window as any).__criminalSigInput = el;
                }}
                onChange={(e) => {
                  setSignatureFileError(null);
                  const file = e.target.files?.[0] || null;
                  if (!file) { setReporterSignature(""); return; }
                  const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
                  if (!validTypes.includes(file.type)) {
                    setSignatureFileError(t("Only PNG, JPG, or WebP images are allowed.", "PNG፣ JPG ወይም WebP ምስሎች ብቻ ይፈቀዳሉ።"));
                    return;
                  }
                  const maxSize = 2 * 1024 * 1024;
                  if (file.size > maxSize) {
                    setSignatureFileError(t("File size must be under 2MB.", "የፋይል መጠን ከ 2MB በታች መሆን አለበት።"));
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    setReporterSignature(ev.target?.result as string || "");
                  };
                  reader.readAsDataURL(file);
                }}
                hidden
              />
              {!reporterSignature ? (
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => {
                    setSignatureFileError(null);
                    (window as any).__criminalSigInput?.click();
                  }}
                  className={`w-full p-8 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center gap-2 ${
                    signatureFileError
                      ? "border-red-300 bg-red-50/50"
                      : "border-gray-200 bg-gray-50/50 hover:border-[#003366]/40 hover:bg-[#003366]/5"
                  }`}
                >
                  <Upload className="w-8 h-8 text-gray-300" />
                  <span className="text-sm font-semibold text-gray-500">
                    {t("Click to upload signature image", "የፊርማ ምስል ለመስቀል ይጫኑ")}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {t("PNG, JPG or WebP - Max 2MB", "PNG፣ JPG ወይም WebP - ከፍተኛ 2MB")}
                  </span>
                </motion.button>
              ) : (
                <>
                  <div className="p-4 rounded-2xl border-2 border-green-200 bg-green-50/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-green-100">
                        <Image className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <img
                          src={reporterSignature}
                          alt={t("Signature preview", "የፊርማ ቅድመ እይታ")}
                          className="max-h-16 object-contain"
                        />
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <motion.button
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={() => {
                        setReporterSignature("");
                        setSignatureFileError(null);
                        const input = (window as any).__criminalSigInput as HTMLInputElement | null;
                        if (input) { input.value = ""; }
                      }}
                      className="inline-flex items-center gap-1.5 bg-white border border-red-200 text-red-600 text-xs font-bold px-4 py-2 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      {t("Cancel", "ሰርዝ")}
                    </motion.button>
                    <motion.button
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={() => {
                        setSignatureFileError(null);
                        (window as any).__criminalSigInput?.click();
                      }}
                      className="inline-flex items-center gap-1.5 bg-white border border-orange-200 text-orange-600 text-xs font-bold px-4 py-2 rounded-xl hover:bg-orange-50 hover:border-orange-300 transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {t("Reupload", "እንደገና ይስቀሉ")}
                    </motion.button>
                    <motion.button
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={() => setShowSignaturePreview(true)}
                      className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-[#003366] text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#003366]/5 hover:border-[#003366]/30 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {t("Preview", "እይታ")}
                    </motion.button>
                  </div>
                </>
              )}
              {signatureFileError && (
                <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {signatureFileError}
                </p>
              )}
              {formErrors.reporterSignature && (
                <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {formErrors.reporterSignature}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Signature Preview Modal */}
        {showSignaturePreview && reporterSignature && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={() => setShowSignaturePreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-[#003366] uppercase tracking-tight">
                  {t("Signature Preview", "የፊርማ ቅድመ እይታ")}
                </h3>
                <button
                  onClick={() => setShowSignaturePreview(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <img
                src={reporterSignature}
                alt={t("Signature", "ፊርማ")}
                className="w-full max-h-80 object-contain rounded-xl border border-gray-200"
              />
            </motion.div>
          </motion.div>
        )}

        {/* Submit */}
        {formErrors._submit && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {formErrors._submit}
          </div>
        )}
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
