import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../lib/api";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  FileText,
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  Loader2,
  Send,
  CheckCircle2,
  Download,
} from "lucide-react";

interface OrgData {
  nameEnglish: string;
  nameAmharic: string;
  tinNumber: string;
  status: string;
  email: string;
  fax: string;
  phone: string;
  headOfficeAddress: string;
  capitalAmount: string;
  numberOfOffices: number;
  numberOfVehicles: number;
  numberOfComputers: number;
  hasStoreHouse: boolean;
  incidents: any[];
  employees: any[];
  educationStats: any;
  trainingDetails: any[];
  serviceContracts: any[];
  branches: any[];
  dmsDocuments: any[];
}

type ReportPeriod = "weekly" | "monthly" | "yearly";

const periodOptions: { key: ReportPeriod; labelEn: string; labelAm: string }[] = [
  { key: "weekly", labelEn: "Weekly Report", labelAm: "ሳምንታዊ ሪፖርት" },
  { key: "monthly", labelEn: "Monthly Report", labelAm: "ወርሃዊ ሪፖርት" },
  { key: "yearly", labelEn: "Yearly Report", labelAm: "ዓመታዊ ሪፖርት" },
];

const educationLevels = ["Grade 3-9", "Grade 10-12", "Certificate", "Diploma", "Degree", "Second Degree"];

export default function InstitutionReports() {
  const { language } = useLanguage();
  const isAm = language === "am";
  const t = (en: string, am: string) => (isAm ? am : en);
  const { user } = useAuth();

  const [orgData, setOrgData] = useState<OrgData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<ReportPeriod>("monthly");
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiRequest(`/employees/my-organization`);
        const data = res?.data ?? res?.payload ?? res;
        if (!data || !data.organizationId) {
          setError("Organization not found for current user");
          setOrgData(null);
          return;
        }
        const orgRes = await apiRequest(`/organizations/${data.organizationId}/details`);
        const details = orgRes?.data ?? orgRes?.payload ?? orgRes;
        if (details && typeof details === "object") {
          setOrgData({
            nameEnglish: details.nameEnglish ?? "",
            nameAmharic: details.nameAmharic ?? "",
            tinNumber: details.tinNumber ?? "",
            status: details.status ?? "",
            email: details.email ?? "",
            fax: details.fax ?? "",
            phone: details.phone ?? "",
            headOfficeAddress: details.headOfficeAddress ?? "",
            capitalAmount: details.capitalAmount ? String(details.capitalAmount) : "0.00",
            numberOfOffices: details.numberOfOffices ?? 0,
            numberOfVehicles: details.numberOfVehicles ?? 0,
            numberOfComputers: details.numberOfComputers ?? 0,
            hasStoreHouse: details.hasStoreHouse ?? false,
            incidents: details.incidents ?? [],
            employees: details.employees ?? [],
            educationStats: details.educationStats ?? {},
            trainingDetails: details.trainingDetails ?? [],
            serviceContracts: details.serviceContracts ?? [],
            branches: details.branches ?? [],
            dmsDocuments: details.dmsDocuments ?? [],
          });
        } else {
          setError("No organization data found");
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load organization data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const getEduCount = (level: string, gender: "male" | "female") => {
    if (!orgData?.educationStats) return 0;
    const keyMap: Record<string, string> = {
      "Grade 3-9": gender === "male" ? "grade_3_9_male" : "grade_3_9_female",
      "Grade 10-12": gender === "male" ? "grade_10_12_male" : "grade_10_12_female",
      Certificate: gender === "male" ? "certificate_male" : "certificate_female",
      Diploma: gender === "male" ? "diploma_male" : "diploma_female",
      Degree: gender === "male" ? "degree_male" : "degree_female",
      "Second Degree": gender === "male" ? "second_degree_male" : "second_degree_female",
    };
    return orgData.educationStats[keyMap[level]] ?? 0;
  };

  const generatePdfBlob = (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!orgData) { resolve(null); return; }

      const org = orgData;
      const orgName = isAm ? (org.nameAmharic || org.nameEnglish) : (org.nameEnglish || org.nameAmharic);
      const today = new Date().toLocaleDateString(isAm ? "am-ET" : "en-US", { year: "numeric", month: "long", day: "numeric" });

      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentW = pageW - 2 * margin;
      let y = margin;

      const activeEmps = org.employees.filter((e: any) => e.employmentStatus === "Active" || e.employmentStatus === "Approved");
      const maleEmps = org.employees.filter((e: any) => e.gender === "Male").length;
      const femaleEmps = org.employees.filter((e: any) => e.gender === "Female").length;

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
        doc.text(value, margin + labelW, y);
        y += 5;
      };

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(orgName.toUpperCase(), margin, y);
      y += 7;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`${periodOptions.find((p) => p.key === period) ? (isAm ? periodOptions.find((p) => p.key === period)!.labelAm : periodOptions.find((p) => p.key === period)!.labelEn) : ""} - ${today}`, margin, y);
      y += 10;

      addSection(t("1. Organization Details", "1. የድርጅት ዝርዝሮች"));
      addRow(t("Organization Name", "የድርጅት ስም"), isAm ? (org.nameAmharic || org.nameEnglish) : (org.nameEnglish || org.nameAmharic));
      addRow(t("TIN Number", "ቲን ቁጥር"), org.tinNumber || "—");
      addRow(t("Status", "ሁኔታ"), org.status || "—");
      addRow(t("Email", "ኢሜይል"), org.email || "—");
      addRow(t("Phone", "ስልክ"), org.phone || "—");
      addRow(t("Fax", "ፋክስ"), org.fax || "—");
      addRow(t("Head Office Address", "ዋና ፅህፈት ቤት አድራሻ"), org.headOfficeAddress || "—");

      if (y > 250) { doc.addPage(); y = margin; }

      addSection(t("2. Assets & Infrastructure", "2. ንብረቶች እና መሰረተ ልማት"));
      addRow(t("Number of Offices", "የቢሮዎች ብዛት"), String(org.numberOfOffices));
      addRow(t("Number of Vehicles", "የተሽከርካሪዎች ብዛት"), String(org.numberOfVehicles));
      addRow(t("Number of Computers", "የኮምፒውተሮች ብዛት"), String(org.numberOfComputers));
      addRow(t("Has Store House", "መጋዘን አለ"), org.hasStoreHouse ? (isAm ? "አለ" : "Yes") : (isAm ? "የለም" : "No"));
      addRow(t("Capital Amount", "የካፒታል መጠን"), `${new Intl.NumberFormat(isAm ? "am-ET" : "en-US", { style: "currency", currency: "ETB", minimumFractionDigits: 2 }).format(parseFloat(org.capitalAmount) || 0)}`);

      if (y > 250) { doc.addPage(); y = margin; }

      addSection(t("3. Employee Statistics", "3. የሰራተኞች ስታቲስቲክስ"));
      addRow(t("Total Employees", "ጠቅላላ ሰራተኞች"), String(org.employees.length));
      addRow(t("Active Employees", "ንቁ ሰራተኞች"), String(activeEmps.length));
      addRow(t("Male", "ወንድ"), String(maleEmps));
      addRow(t("Female", "ሴት"), String(femaleEmps));

      y += 2;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(t("Education Level Breakdown:", "የትምህርት ደረጃ ስብስብ:"), margin, y);
      y += 5;

      const eduHeaders = [t("Level", "ደረጃ"), t("Male", "ወንድ"), t("Female", "ሴት"), t("Total", "ጠቅላላ")];
      const eduRows = educationLevels.map((level) => {
        const m = getEduCount(level, "male");
        const f = getEduCount(level, "female");
        return [level, String(m), String(f), String(m + f)];
      });

      autoTable(doc, {
        startY: y,
        head: [eduHeaders],
        body: eduRows,
        theme: "grid",
        headStyles: { fillColor: [0, 51, 102], textColor: [255, 255, 255], fontSize: 9, fontStyle: "bold" },
        bodyStyles: { fontSize: 9 },
        margin: { left: margin, right: margin },
        tableWidth: contentW,
      });
      y = (doc as any).lastAutoTable.finalY + 6;

      if (y > 250) { doc.addPage(); y = margin; }

      addSection(t("4. Service Contracts", "4. የአገልግሎት ውሎች"));
      if (org.serviceContracts.length === 0) {
        y += 2;
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.text(t("No service contracts registered.", "ምንም የአገልግሎት ውሎች አልተመዘገቡም።"), margin, y);
        y += 6;
      } else {
        const scHeaders = [t("Service User", "ተጠቃሚ"), t("Address", "አድራሻ"), t("Personnel", "ሰራተኞች"), t("Status", "ሁኔታ")];
        const scRows = org.serviceContracts.map((sc: any) => [
          sc.serviceUserName || sc.serviceUser || "—",
          sc.addressText || "—",
          String(sc.assignedPersonnelCount ?? "—"),
          sc.status || "—",
        ]);
        autoTable(doc, {
          startY: y,
          head: [scHeaders],
          body: scRows,
          theme: "grid",
          headStyles: { fillColor: [0, 51, 102], textColor: [255, 255, 255], fontSize: 9, fontStyle: "bold" },
          bodyStyles: { fontSize: 8 },
          margin: { left: margin, right: margin },
          tableWidth: contentW,
        });
        y = (doc as any).lastAutoTable.finalY + 6;
      }

      if (y > 250) { doc.addPage(); y = margin; }

      addSection(t("5. Branches", "5. ቅርንጫፎች"));
      if (org.branches.length === 0) {
        y += 2;
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.text(t("No branches registered.", "ምንም ቅርንጫፎች አልተመዘገቡም።"), margin, y);
        y += 6;
      } else {
        org.branches.forEach((b: any) => {
          addRow("-", b.addressText || b.name || "—");
        });
        y += 2;
      }

      if (y > 250) { doc.addPage(); y = margin; }

      addSection(t("6. Incident Reports", "6. የክስተት ሪፖርቶች"));
      if (org.incidents.length === 0) {
        y += 2;
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.text(t("No incidents reported.", "ምንም ክስተቶች አልተገኙም።"), margin, y);
        y += 6;
      } else {
        const incHeaders = [t("Type", "አይነት"), t("Date", "ቀን"), t("Description", "መግለጫ"), t("Status", "ሁኔታ")];
        const incRows = org.incidents.slice(0, 10).map((inc: any) => [
          inc.type || inc.incidentType || "—",
          inc.date ? new Date(inc.date).toLocaleDateString() : (inc.reportedAt ? new Date(inc.reportedAt).toLocaleDateString() : "—"),
          inc.description || "—",
          inc.status || "—",
        ]);
        autoTable(doc, {
          startY: y,
          head: [incHeaders],
          body: incRows,
          theme: "grid",
          headStyles: { fillColor: [0, 51, 102], textColor: [255, 255, 255], fontSize: 9, fontStyle: "bold" },
          bodyStyles: { fontSize: 8 },
          margin: { left: margin, right: margin },
          tableWidth: contentW,
        });
        y = (doc as any).lastAutoTable.finalY + 6;
      }

      if (y > 250) { doc.addPage(); y = margin; }

      addSection(t("7. Training Details", "7. የስልጠና ዝርዝሮች"));
      if (org.trainingDetails.length === 0) {
        y += 2;
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.text(t("No training records.", "ምንም የስልጠና መረጃዎች የሉም።"), margin, y);
        y += 6;
      } else {
        const trHeaders = [t("Training", "ስልጠና"), t("Date", "ቀን"), t("Participants", "ተሳታፊዎች"), t("Status", "ሁኔታ")];
        const trRows = org.trainingDetails.map((tr: any) => [
          tr.trainingName || tr.name || "—",
          tr.date ? new Date(tr.date).toLocaleDateString() : "—",
          String(tr.participants ?? tr.participantCount ?? "—"),
          tr.status || "—",
        ]);
        autoTable(doc, {
          startY: y,
          head: [trHeaders],
          body: trRows,
          theme: "grid",
          headStyles: { fillColor: [0, 51, 102], textColor: [255, 255, 255], fontSize: 9, fontStyle: "bold" },
          bodyStyles: { fontSize: 8 },
          margin: { left: margin, right: margin },
          tableWidth: contentW,
        });
        y = (doc as any).lastAutoTable.finalY + 6;
      }

      y = Math.max(y, pageW - 20);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      const footerText = `${t("Report Generated On", "ሪፖርት የተፈጠረበት ቀን")}: ${today} | ${t("This is a computer-generated report", "ይህ በኮምፒውተር የተፈጠረ ሪፖርት ነው")}`;
      doc.text(footerText, margin, y);

      const blob = doc.output("blob");
      resolve(blob);
    });
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const blob = await generatePdfBlob();
      if (blob) {
        setPdfBlob(blob);
        setPdfGenerated(true);
        setSent(false);
        setSendResult(null);
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!pdfBlob) return;
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(orgData?.nameEnglish || "Report").replace(/[^a-zA-Z0-9]/g, "_")}_${period}_${new Date().toISOString().split("T")[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSend = async () => {
    if (!pdfBlob || !orgData) return;
    setSending(true);
    setSendResult(null);
    try {
      const res = await apiRequest(`/employees/my-organization`);
      const data = res?.data ?? res?.payload ?? res;
      const organizationId = data?.organizationId;
      if (!organizationId) throw new Error("Organization ID not found");

      const formData = new FormData();
      const fileName = `${(orgData.nameEnglish || "Org").replace(/[^a-zA-Z0-9]/g, "_")}_${period}_${new Date().toISOString().split("T")[0]}.pdf`;
      formData.append("report", pdfBlob, fileName);
      formData.append("organizationId", String(organizationId));
      formData.append("period", period);

      await apiRequest(`/reports/submit`, {
        method: "POST",
        body: formData,
      });

      setSent(true);
      setSendResult({ success: true, message: isAm ? "ሪፖርቱ በተሳካ ሁኔታ ተልኳል!" : "Report sent successfully to Federal Police Admin!" });
    } catch (err: any) {
      setSendResult({
        success: false,
        message: err?.message || (isAm ? "ሪፖርቱን መላክ አልተሳካም" : "Failed to send report"),
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text={t("Loading organization data...", "የድርጅት መረጃ በማግኘት ላይ...")} />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[60vh] gap-4"
      >
        <div className="p-5 rounded-2xl bg-red-50 border border-red-200">
          <AlertCircle className="w-10 h-10 text-red-400" />
        </div>
        <p className="text-sm font-bold text-red-600">{error}</p>
      </motion.div>
    );
  }

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
        <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-[#FFD700]/5" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white uppercase tracking-tight">
                {t("Reports from the Institution", "ከተቋም ሪፖርቶች")}
              </h1>
              <p className="text-xs text-white/50 font-medium mt-0.5">
                {t("Generate and send institutional reports to Federal Police Admin", "የተቋም ሪፖርቶችን ያመንጩ እና ለፌዴራል ፖሊስ አስተዳደር ይላኩ")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative">
          <button
            onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-xl border border-gray-200 text-sm font-bold text-[#003366] hover:border-[#003366]/30 transition-all shadow-sm"
          >
            <Calendar className="w-4 h-4" />
            {periodOptions.find((p) => p.key === period) ? (isAm ? periodOptions.find((p) => p.key === period)!.labelAm : periodOptions.find((p) => p.key === period)!.labelEn) : ""}
            <ChevronDown className="w-4 h-4" />
          </button>
          {showPeriodDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full mt-1 left-0 bg-white rounded-xl border border-gray-200 shadow-lg z-20 w-48 overflow-hidden"
            >
              {periodOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => { setPeriod(opt.key); setShowPeriodDropdown(false); setPdfGenerated(false); setPdfBlob(null); setSent(false); setSendResult(null); }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 ${period === opt.key ? "bg-[#003366] text-white" : "text-gray-700 hover:bg-gray-50"}`}
                >
                  {opt.key === "weekly" && <Clock className="w-4 h-4" />}
                  {opt.key === "monthly" && <Calendar className="w-4 h-4" />}
                  {opt.key === "yearly" && <TrendingUp className="w-4 h-4" />}
                  {isAm ? opt.labelAm : opt.labelEn}
                </button>
              ))}
            </motion.div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {pdfGenerated && (
            <motion.button
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleDownload}
              className="inline-flex items-center gap-2 bg-white border border-gray-200 text-[#003366] text-xs font-bold px-6 py-2.5 rounded-xl shadow-sm hover:shadow-md hover:border-[#003366]/30 transition-all"
            >
              <Download className="w-4 h-4" />
              {t("Download PDF", "PDF አውርድ")}
            </motion.button>
          )}
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#003366] to-[#001F3F] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            {generating
              ? t("Generating...", "በማመንጨት ላይ...")
              : t("Generate PDF", "PDF ያመንጩ")}
          </motion.button>
        </div>
      </div>

      {!pdfGenerated && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#003366]/5 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-[#003366]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#003366] mb-2">
                {t("Generate Institutional Report", "የተቋም ሪፖርት ያመንጩ")}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {t(
                  "Select a reporting period and click Generate PDF to create the report. After generation, you can send it to the Federal Police Admin.",
                  "የሪፖርት ጊዜ ይምረጡ እና PDF ያመንጩ የሚለውን ጠቅ ያድርጉ። ከተፈጠረ በኋላ ለፌዴራል ፖሊስ አስተዳደር መላክ ይችላሉ።"
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {pdfGenerated && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="relative bg-gradient-to-r from-green-600 to-green-800 p-5">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-300 via-green-400 to-green-300" />
            <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-green-400/10" />
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-green-400/20 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-green-300" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {t("Report Generated Successfully", "ሪፖርት በተሳካ ሁኔታ ተፈጥሯል")}
                </h3>
                <p className="text-[10px] text-green-200 font-medium">
                  {t("You can now send it to the Federal Police Admin", "አሁን ለፌዴራል ፖሊስ አስተዳደር መላክ ይችላሉ")}
                </p>
              </div>
            </div>
          </div>

          {sendResult && (
            <div className={`mx-5 mt-5 p-3 rounded-xl border text-sm font-medium flex items-center gap-2 ${
              sendResult.success
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}>
              {sendResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              {sendResult.message}
            </div>
          )}

          <div className="p-5 flex justify-end">
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSend}
              disabled={sending || sent}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#003366] to-[#001F3F] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : sent ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {sending
                ? t("Sending...", "በመላክ ላይ...")
                : sent
                  ? t("Sent", "ተልኳል")
                  : t("Send to Federal Police Admin", "ለፌዴራል ፖሊስ አስተዳደር ላክ")}
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
