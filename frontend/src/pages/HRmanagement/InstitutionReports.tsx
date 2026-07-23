import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../lib/api";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { AutoDismissToast } from "../../components/AutoDismissToast";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import {
  FileText,
  AlertCircle,
  Loader2,
  Send,
  CheckCircle2,
  Download,
  User,
  Clock,
  XCircle,
  Upload,
  ChevronDown,
  Image,
  Eye,
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

const educationLevels = [
  "Grade 3-9",
  "Grade 10-12",
  "Certificate",
  "Diploma",
  "Degree",
  "Second Degree",
];

export default function InstitutionReports() {
  const { language } = useLanguage();
  const isAm = language === "am";
  const t = (en: string, am: string) => (isAm ? am : en);
  const { user } = useAuth();

  const inputClass =
    "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]/50 hover:border-[#003366]/30 transition-all bg-white";

  const labelClass =
    "text-[11px] uppercase tracking-[0.15em] font-bold text-[#003366] mb-1.5 block";

  const sectionHeaderClass =
    "relative overflow-hidden bg-gradient-to-r from-[#003366] to-[#001F3F] rounded-2xl p-5 border border-white/10";

  const SectionHeaderContent = (icon: React.ReactNode, title: string) => (
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

  const [orgData, setOrgData] = useState<OrgData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period] = useState<ReportPeriod>("monthly");
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Report Implementation Period
  const [selectedReportPeriod, setSelectedReportPeriod] = useState<string>(
    "reportPeriod3Months",
  );

  // Report type selection
  const [selectedReportType, setSelectedReportType] =
    useState<string>("comprehensive");

  // Upload & explanation for payroll/training
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [periodUploadedFile, setPeriodUploadedFile] = useState<File | null>(
    null,
  );
  const [periodUploadError, setPeriodUploadError] = useState<string | null>(
    null,
  );
  const [explanation, setExplanation] = useState("");

  // Reporter
  const [reporterFirstName, setReporterFirstName] = useState("");
  const [reporterMiddleName, setReporterMiddleName] = useState("");
  const [reporterLastName, setReporterLastName] = useState("");
  const [reporterTitle, setReporterTitle] = useState("");
  const [reporterJobResponsibility, setReporterJobResponsibility] =
    useState("");
  const [reporterSignature, setReporterSignature] = useState("");
  const [signatureFileError, setSignatureFileError] = useState<string | null>(
    null,
  );
  const [showLearnMore, setShowLearnMore] = useState(false);
  const [showSignaturePreview, setShowSignaturePreview] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMessage, setToastMessage] = useState("");

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
        const orgRes = await apiRequest(
          `/organizations/${data.organizationId}/details`,
        );
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
            capitalAmount: details.capitalAmount
              ? String(details.capitalAmount)
              : "0.00",
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
      "Grade 10-12":
        gender === "male" ? "grade_10_12_male" : "grade_10_12_female",
      Certificate:
        gender === "male" ? "certificate_male" : "certificate_female",
      Diploma: gender === "male" ? "diploma_male" : "diploma_female",
      Degree: gender === "male" ? "degree_male" : "degree_female",
      "Second Degree":
        gender === "male" ? "second_degree_male" : "second_degree_female",
    };
    return orgData.educationStats[keyMap[level]] ?? 0;
  };

  const generatePdfBlob = (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!orgData) {
        resolve(null);
        return;
      }

      const org = orgData;
      const orgName = isAm
        ? org.nameAmharic || org.nameEnglish
        : org.nameEnglish || org.nameAmharic;
      const today = new Date().toLocaleDateString(isAm ? "am-ET" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentW = pageW - 2 * margin;
      let y = margin;

      const activeEmps = org.employees.filter(
        (e: any) =>
          e.employmentStatus === "Active" || e.employmentStatus === "Approved",
      );
      const maleEmps = org.employees.filter(
        (e: any) => e.gender === "Male",
      ).length;
      const femaleEmps = org.employees.filter(
        (e: any) => e.gender === "Female",
      ).length;

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
      const periodLabels: Record<ReportPeriod, string> = {
        weekly: isAm ? "ሳምንታዊ ሪፖርት" : "Weekly Report",
        monthly: isAm ? "ወርሃዊ ሪፖርት" : "Monthly Report",
        yearly: isAm ? "ዓመታዊ ሪፖርት" : "Yearly Report",
      };
      const reportTypeLabels: Record<string, string> = {
        comprehensive: isAm ? "ሁሉን አቀፍ" : "Comprehensive",
        personnel: isAm ? "የሰራተኞች ሰነዶች" : "Personnel Documents",
        payroll: isAm ? "ደመወዝ እና ጥቅማጥቅሞች" : "Payroll & Benefits",
        training: isAm ? "የስልጠና ምስክር ወረቀቶች" : "Training Certificates",
      };
      doc.text(
        `${reportTypeLabels[selectedReportType] ?? "Report"} - ${periodLabels[period]} - ${today}`,
        margin,
        y,
      );
      y += 10;

      if (selectedReportType === "comprehensive") {
        addSection(t("1. Organization Details", "1. የድርጅት ዝርዝሮች"));
        addRow(
          t("Organization Name", "የድርጅት ስም"),
          isAm
            ? org.nameAmharic || org.nameEnglish
            : org.nameEnglish || org.nameAmharic,
        );
        addRow(t("TIN Number", "ቲን ቁጥር"), org.tinNumber || "—");
        addRow(t("Status", "ሁኔታ"), org.status || "—");
        addRow(t("Email", "ኢሜይል"), org.email || "—");
        addRow(t("Phone", "ስልክ"), org.phone || "—");
        addRow(t("Fax", "ፋክስ"), org.fax || "—");
        addRow(
          t("Head Office Address", "ዋና ፅህፈት ቤት አድራሻ"),
          org.headOfficeAddress || "—",
        );

        if (y > 250) {
          doc.addPage();
          y = margin;
        }

        addSection(t("2. Assets & Infrastructure", "2. ንብረቶች እና መሰረተ ልማት"));
        addRow(
          t("Number of Offices", "የቢሮዎች ብዛት"),
          String(org.numberOfOffices),
        );
        addRow(
          t("Number of Vehicles", "የተሽከርካሪዎች ብዛት"),
          String(org.numberOfVehicles),
        );
        addRow(
          t("Number of Computers", "የኮምፒውተሮች ብዛት"),
          String(org.numberOfComputers),
        );
        addRow(
          t("Has Store House", "መጋዘን አለ"),
          org.hasStoreHouse ? (isAm ? "አለ" : "Yes") : isAm ? "የለም" : "No",
        );
        addRow(
          t("Capital Amount", "የካፒታል መጠን"),
          `${new Intl.NumberFormat(isAm ? "am-ET" : "en-US", { style: "currency", currency: "ETB", minimumFractionDigits: 2 }).format(parseFloat(org.capitalAmount) || 0)}`,
        );

        if (y > 250) {
          doc.addPage();
          y = margin;
        }

        addSection(t("3. Employee Statistics", "3. የሰራተኞች ስታቲስቲክስ"));
        addRow(
          t("Total Employees", "ጠቅላላ ሰራተኞች"),
          String(org.employees.length),
        );
        addRow(t("Active Employees", "ንቁ ሰራተኞች"), String(activeEmps.length));
        addRow(t("Male", "ወንድ"), String(maleEmps));
        addRow(t("Female", "ሴት"), String(femaleEmps));

        y += 2;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text(
          t("Education Level Breakdown:", "የትምህርት ደረጃ ስብስብ:"),
          margin,
          y,
        );
        y += 5;

        const eduHeaders = [
          t("Level", "ደረጃ"),
          t("Male", "ወንድ"),
          t("Female", "ሴት"),
          t("Total", "ጠቅላላ"),
        ];
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
          headStyles: {
            fillColor: [0, 51, 102],
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: "bold",
          },
          bodyStyles: { fontSize: 9 },
          margin: { left: margin, right: margin },
          tableWidth: contentW,
        });
        y = (doc as any).lastAutoTable.finalY + 6;

        if (y > 250) {
          doc.addPage();
          y = margin;
        }

        addSection(t("4. Service Contracts", "4. የአገልግሎት ውሎች"));
        if (org.serviceContracts.length === 0) {
          y += 2;
          doc.setFont("helvetica", "italic");
          doc.setFontSize(10);
          doc.text(
            t("No service contracts registered.", "ምንም የአገልግሎት ውሎች አልተመዘገቡም።"),
            margin,
            y,
          );
          y += 6;
        } else {
          const scHeaders = [
            t("Service User", "ተጠቃሚ"),
            t("Address", "አድራሻ"),
            t("Personnel", "ሰራተኞች"),
            t("Status", "ሁኔታ"),
          ];
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
            headStyles: {
              fillColor: [0, 51, 102],
              textColor: [255, 255, 255],
              fontSize: 9,
              fontStyle: "bold",
            },
            bodyStyles: { fontSize: 8 },
            margin: { left: margin, right: margin },
            tableWidth: contentW,
          });
          y = (doc as any).lastAutoTable.finalY + 6;
        }

        if (y > 250) {
          doc.addPage();
          y = margin;
        }

        addSection(t("5. Branches", "5. ቅርንጫፎች"));
        if (org.branches.length === 0) {
          y += 2;
          doc.setFont("helvetica", "italic");
          doc.setFontSize(10);
          doc.text(
            t("No branches registered.", "ምንም ቅርንጫፎች አልተመዘገቡም።"),
            margin,
            y,
          );
          y += 6;
        } else {
          org.branches.forEach((b: any) => {
            addRow("-", b.addressText || b.name || "—");
          });
          y += 2;
        }

        if (y > 250) {
          doc.addPage();
          y = margin;
        }

        addSection(t("6. Incident Reports", "6. የክስተት ሪፖርቶች"));
        if (org.incidents.length === 0) {
          y += 2;
          doc.setFont("helvetica", "italic");
          doc.setFontSize(10);
          doc.text(t("No incidents reported.", "ምንም ክስተቶች አልተገኙም።"), margin, y);
          y += 6;
        } else {
          const incHeaders = [
            t("Type", "አይነት"),
            t("Date", "ቀን"),
            t("Description", "መግለጫ"),
            t("Status", "ሁኔታ"),
          ];
          const incRows = org.incidents
            .slice(0, 10)
            .map((inc: any) => [
              inc.type || inc.incidentType || "—",
              inc.date
                ? new Date(inc.date).toLocaleDateString()
                : inc.reportedAt
                  ? new Date(inc.reportedAt).toLocaleDateString()
                  : "—",
              inc.description || "—",
              inc.status || "—",
            ]);
          autoTable(doc, {
            startY: y,
            head: [incHeaders],
            body: incRows,
            theme: "grid",
            headStyles: {
              fillColor: [0, 51, 102],
              textColor: [255, 255, 255],
              fontSize: 9,
              fontStyle: "bold",
            },
            bodyStyles: { fontSize: 8 },
            margin: { left: margin, right: margin },
            tableWidth: contentW,
          });
          y = (doc as any).lastAutoTable.finalY + 6;
        }

        if (y > 250) {
          doc.addPage();
          y = margin;
        }

        addSection(t("7. Training Details", "7. የስልጠና ዝርዝሮች"));
        if (org.trainingDetails.length === 0) {
          y += 2;
          doc.setFont("helvetica", "italic");
          doc.setFontSize(10);
          doc.text(
            t("No training records.", "ምንም የስልጠና መረጃዎች የሉም።"),
            margin,
            y,
          );
          y += 6;
        } else {
          const trHeaders = [
            t("Training", "ስልጠና"),
            t("Date", "ቀን"),
            t("Participants", "ተሳታፊዎች"),
            t("Status", "ሁኔታ"),
          ];
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
            headStyles: {
              fillColor: [0, 51, 102],
              textColor: [255, 255, 255],
              fontSize: 9,
              fontStyle: "bold",
            },
            bodyStyles: { fontSize: 8 },
            margin: { left: margin, right: margin },
            tableWidth: contentW,
          });
          y = (doc as any).lastAutoTable.finalY + 6;
        }
      }

      // Report-type-specific sections
      if (selectedReportType === "personnel") {
        addSection(t("Personnel Documents", "የሰራተኞች ሰነዶች"));
        if (org.dmsDocuments && org.dmsDocuments.length > 0) {
          const docHeaders = [
            t("Document", "ሰነድ"),
            t("Type", "አይነት"),
            t("Status", "ሁኔታ"),
          ];
          const docRows = org.dmsDocuments
            .slice(0, 15)
            .map((d: any) => [
              d.documentName || d.name || "—",
              d.documentType || d.type || "—",
              d.status || "—",
            ]);
          autoTable(doc, {
            startY: y,
            head: [docHeaders],
            body: docRows,
            theme: "grid",
            headStyles: {
              fillColor: [0, 51, 102],
              textColor: [255, 255, 255],
              fontSize: 9,
              fontStyle: "bold",
            },
            bodyStyles: { fontSize: 8 },
            margin: { left: margin, right: margin },
            tableWidth: contentW,
          });
          y = (doc as any).lastAutoTable.finalY + 6;
        } else {
          y += 2;
          doc.setFont("helvetica", "italic");
          doc.setFontSize(10);
          doc.text(
            t("No personnel documents uploaded.", "ምንም የሰራተኞች ሰነዶች አልተሰቀሉም።"),
            margin,
            y,
          );
          y += 6;
        }
      }

      if (selectedReportType === "payroll") {
        if (y > 250) {
          doc.addPage();
          y = margin;
        }
        addSection(t("Payroll & Benefits", "ደመወዝ እና ጥቅማጥቅሞች"));
        addRow(
          t("Total Employees", "ጠቅላላ ሰራተኞች"),
          String(org.employees.length),
        );
        addRow(t("Active Employees", "ንቁ ሰራተኞች"), String(activeEmps.length));
        const estimatedMonthlyPayroll = (
          org.employees.length * 8500
        ).toLocaleString();
        addRow(
          t("Estimated Monthly Payroll (ETB)", "የተገመተ ወርሃዊ ደመወዝ (ETB)"),
          estimatedMonthlyPayroll,
        );
        addRow(
          t("Estimated Annual Payroll (ETB)", "የተገመተ ዓመታዊ ደመወዝ (ETB)"),
          (org.employees.length * 8500 * 12).toLocaleString(),
        );
        y += 2;
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.text(
          t(
            "* Payroll figures are estimates based on industry averages.",
            "* የደመወዝ አሃዞች በኢንዱስትሪ አማካይ ላይ የተመሰረቱ ግምቶች ናቸው።",
          ),
          margin,
          y,
        );
        y += 4;
      }

      if (selectedReportType === "training") {
        if (y > 250) {
          doc.addPage();
          y = margin;
        }
        addSection(t("Training Certificates", "የስልጠና ምስክር ወረቀቶች"));
        if (org.trainingDetails.length === 0) {
          y += 2;
          doc.setFont("helvetica", "italic");
          doc.setFontSize(10);
          doc.text(
            t("No training records.", "ምንም የስልጠና መረጃዎች የሉም።"),
            margin,
            y,
          );
          y += 6;
        } else {
          const certHeaders = [
            t("Training", "ስልጠና"),
            t("Date", "ቀን"),
            t("Participants", "ተሳታፊዎች"),
            t("Certified", "የተሰጠ"),
          ];
          const certRows = org.trainingDetails.map((tr: any) => [
            tr.trainingName || tr.name || "—",
            tr.date ? new Date(tr.date).toLocaleDateString() : "—",
            String(tr.participants ?? tr.participantCount ?? "—"),
            tr.certifiedCount ?? tr.certified ?? "—",
          ]);
          autoTable(doc, {
            startY: y,
            head: [certHeaders],
            body: certRows,
            theme: "grid",
            headStyles: {
              fillColor: [0, 51, 102],
              textColor: [255, 255, 255],
              fontSize: 9,
              fontStyle: "bold",
            },
            bodyStyles: { fontSize: 8 },
            margin: { left: margin, right: margin },
            tableWidth: contentW,
          });
          y = (doc as any).lastAutoTable.finalY + 6;
        }
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

  const handleDownload = () => {
    void generatePdfBlob;
    if (!pdfBlob) return;
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(orgData?.nameEnglish || "Report").replace(/[^a-zA-Z0-9]/g, "_")}_${selectedReportType}_${period}_${new Date().toISOString().split("T")[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSend = async (reportFile?: Blob | File) => {
    const file = reportFile || pdfBlob || periodUploadedFile;
    if (!file || !orgData) return;
    setSending(true);
    try {
      const res = await apiRequest(`/employees/my-organization`);
      const data = res?.data ?? res?.payload ?? res;
      const organizationId = data?.organizationId;
      if (!organizationId) throw new Error("Organization ID not found");

      const selectedPeriodValue =
        selectedReportPeriod === "reportPeriod6Months"
          ? "6 Months"
          : selectedReportPeriod === "reportPeriod9Months"
            ? "9 Months"
            : selectedReportPeriod === "reportPeriod1Year"
              ? "1 Year"
              : "3 Months";

      const formData = new FormData();
      const fileName = `${(orgData.nameEnglish || "Org").replace(/[^a-zA-Z0-9]/g, "_")}_${selectedPeriodValue}_${new Date().toISOString().split("T")[0]}.pdf`;
      formData.append("report", file, fileName);
      formData.append("organizationId", String(organizationId));
      formData.append("period", selectedPeriodValue);
      formData.append("reportPeriod", selectedPeriodValue);
      formData.append("reportType", selectedReportType);
      if (uploadedFile) {
        formData.append("supplementaryDocument", uploadedFile);
      }
      if (explanation.trim()) {
        formData.append("explanation", explanation.trim());
      }
      if (reporterFirstName.trim()) {
        formData.append("reporterFirstName", reporterFirstName.trim());
      }
      if (reporterMiddleName.trim()) {
        formData.append("reporterMiddleName", reporterMiddleName.trim());
      }
      if (reporterLastName.trim()) {
        formData.append("reporterLastName", reporterLastName.trim());
      }
      if (reporterTitle.trim()) {
        formData.append("reporterTitle", reporterTitle.trim());
      }
      if (reporterJobResponsibility.trim()) {
        formData.append(
          "reporterJobResponsibility",
          reporterJobResponsibility.trim(),
        );
        formData.append("reporterJobResp", reporterJobResponsibility.trim());
      }
      if (periodUploadedFile && file !== periodUploadedFile) {
        formData.append("periodDocument", periodUploadedFile);
      }

      // Attach signature image as a file if provided (reporterSignature is a data URL)
      if (reporterSignature) {
        try {
          const sigRes = await fetch(reporterSignature);
          const sigBlob = await sigRes.blob();
          const mime = sigBlob.type || "image/png";
          const ext = (mime.split("/")[1] || "png").split("+")[0];
          const sigName = `${(orgData.nameEnglish || "org").replace(/[^a-zA-Z0-9]/g, "_")}_signature.${ext}`;
          formData.append("reporterSignature", sigBlob, sigName);
        } catch (e) {
          // fallback: send the data URL string so backend can still store it
          formData.append("reporterSignatureUrl", reporterSignature);
        }
      }
      await apiRequest(`/reports/submit`, {
        method: "POST",
        body: formData,
      });

      setSent(true);
      const successMessage = isAm
        ? "ሪፖርቱ በተሳካ ሁኔታ ተልኳል!"
        : "Report sent successfully to Federal Police Admin!";

      setToastType("success");
      setToastMessage(successMessage);
      setToastOpen(true);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      const errorMessage =
        err?.message || (isAm ? "ሪፖርቱን መላክ አልተሳካም" : "Failed to send report");

      setToastType("error");
      setToastMessage(errorMessage);
      setToastOpen(true);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner
          size="lg"
          text={t("Loading organization data...", "የድርጅት መረጃ በማግኘት ላይ...")}
        />
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
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="institution-reports space-y-6"
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
                  {t(
                    "Generate and send institutional reports to Federal Police Admin",
                    "የተቋም ሪፖርቶችን ያመንጩ እና ለፌዴራል ፖሊስ አስተዳደር ይላኩ",
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {pdfGenerated && (
          <div className="flex justify-end">
            <div className="flex items-center gap-2">
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
            </div>
          </div>
        )}

        {!pdfGenerated && (
          <>
            {/* Section: Report Implementation Period */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className={sectionHeaderClass}>
                <div className="relative z-10 flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-[#FFD700]" />
                    </div>
                    <h2 className="text-sm font-black text-white uppercase tracking-tight">
                      {t("Standard Report Implementation", "መደበኛ የሪፖርት ትግበራ")}
                    </h2>
                  </div>
                </div>
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FFD700] via-[#C5A022] to-[#FFD700]" />
                <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-[#FFD700]/5" />
                <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-[#FFD700]/5" />
              </div>
              <div className="p-6 space-y-6">
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedReportType("comprehensive");
                    setPdfGenerated(false);
                    setPdfBlob(null);
                    setSent(false);
                    setUploadedFile(null);
                    setExplanation("");
                  }}
                  className={`w-full p-5 rounded-3xl border-2 text-left transition-all relative overflow-hidden ${
                    selectedReportType === "comprehensive"
                      ? "border-[#003366] bg-gradient-to-br from-[#003366]/5 to-[#003366]/10 shadow-lg shadow-[#003366]/10"
                      : "border-gray-100 bg-white hover:border-[#003366]/30 shadow-sm hover:shadow-md"
                  }`}
                >
                  {selectedReportType === "comprehensive" && (
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#003366]" />
                  )}
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-xl transition-all ${
                        selectedReportType === "comprehensive"
                          ? "bg-[#003366] shadow-md shadow-[#003366]/20"
                          : "bg-[#003366]/10"
                      }`}
                    >
                      <FileText
                        className={`w-5 h-5 ${
                          selectedReportType === "comprehensive"
                            ? "text-white"
                            : "text-[#003366]"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-black text-[#003366] uppercase tracking-tight">
                        {t("Comprehensive Report", "ሁሉን አቀፍ ሪፖርት")}
                      </h4>
                      <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                        {t(
                          "Full institutional report with all sections.",
                          "ሁሉንም ክፍሎች የያዘ ሙሉ የተቋም ሪፖርት።",
                        )}
                      </p>
                    </div>
                  </div>
                </motion.button>
                <div className="pt-6 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    {t("Select the reporting period:", "የሪፖርት ማቅረቢያ ጊዜ ይምረጡ:")}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowLearnMore(!showLearnMore)}
                    className="flex items-center gap-1.5 text-[11px] text-orange-500 font-semibold mb-4 hover:text-orange-600 transition-colors"
                  >
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${showLearnMore ? "rotate-180" : ""}`}
                    />
                    {t("Learn more", "የበለጠ ይረዱ")}
                  </button>
                  {showLearnMore && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[11px] text-orange-600 mb-4 italic leading-relaxed"
                    >
                      {t(
                        "The report must be sent every 3 months, totaling 4 times per year.",
                        "ሪፖርቱ በየ 3 ወሩ መላክ አለበት, በዓመት 4 ጊዜ.",
                      )}
                    </motion.p>
                  )}
                  <div className="flex flex-wrap gap-4">
                    {[
                      {
                        key: "reportPeriod3Months",
                        label: t("3 Months", "3 ወራት"),
                      },
                      {
                        key: "reportPeriod6Months",
                        label: t("6 Months", "6 ወራት"),
                      },
                      {
                        key: "reportPeriod9Months",
                        label: t("9 Months", "9 ወራት"),
                      },
                      { key: "reportPeriod1Year", label: t("1 Year", "1 ዓመት") },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedReportPeriod === item.key
                            ? "border-[#003366] bg-[#003366]/5"
                            : "border-gray-200 bg-white hover:border-[#003366]/30"
                        }`}
                      >
                        <input
                          type="radio"
                          name="reportPeriod"
                          checked={selectedReportPeriod === item.key}
                          onChange={() => setSelectedReportPeriod(item.key)}
                          className="w-4 h-4 border-gray-300 text-[#003366] focus:ring-[#003366]/20"
                        />
                        <span className="text-sm font-semibold text-gray-700">
                          {item.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-5 pt-5 border-t border-gray-100">
                    <label className={labelClass}>
                      {t("Upload Report PDF", "የሪፖርት PDF ይስቀሉ")}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <p className="text-[11px] text-amber-600 font-medium mb-3 leading-relaxed">
                      {t(
                        "The file number must be written on the PDF so when the federal police field reviewer comes they can check the files by that file number.",
                        "የፋይል ቁጥሩ በPDF ላይ መፃፍ አለበት ስለዚህ የፌዴራል ፖሊስ የመስክ ገምጋሚ ሲመጣ ፋይሎቹን በዚያ የፋይል ቁጥር መፈተሽ ይችላል።",
                      )}
                    </p>
                    <input
                      type="file"
                      accept=".pdf"
                      ref={(el) => {
                        if (el) (window as any).__periodPdfInput = el;
                      }}
                      onChange={(e) => {
                        setPeriodUploadError(null);
                        const file = e.target.files?.[0] || null;
                        if (!file) {
                          setPeriodUploadedFile(null);
                          return;
                        }
                        if (file.type !== "application/pdf") {
                          setPeriodUploadError(
                            t(
                              "Only PDF files are allowed.",
                              "የPDF ፋይሎች ብቻ ይፈቀዳሉ።",
                            ),
                          );
                          return;
                        }
                        const maxSize = 10 * 1024 * 1024;
                        if (file.size > maxSize) {
                          setPeriodUploadError(
                            t(
                              "File size must be under 10MB.",
                              "የፋይል መጠን ከ 10MB በታች መሆን አለበት።",
                            ),
                          );
                          return;
                        }
                        setPeriodUploadedFile(file);
                      }}
                      hidden
                    />
                    {!periodUploadedFile ? (
                      <motion.button
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        onClick={() => {
                          setPeriodUploadError(null);
                          (window as any).__periodPdfInput?.click();
                        }}
                        className="w-full p-8 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 hover:border-[#003366]/40 hover:bg-[#003366]/5 transition-all flex flex-col items-center gap-2"
                      >
                        <Upload className="w-8 h-8 text-gray-300" />
                        <span className="text-sm font-semibold text-gray-500">
                          {t("Click to upload PDF", "PDF ለመስቀል ይጫኑ")}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {t("Max 10MB", "ከፍተኛ 10MB")}
                        </span>
                      </motion.button>
                    ) : (
                      <>
                        <div className="p-4 rounded-2xl border-2 border-green-200 bg-green-50/50">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-green-100">
                              <FileText className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-700 truncate">
                                {periodUploadedFile.name}
                              </p>
                              <p className="text-[11px] text-gray-500">
                                {(periodUploadedFile.size / 1024).toFixed(1)} KB
                              </p>
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
                              setPeriodUploadedFile(null);
                              setPeriodUploadError(null);
                              const input = (window as any)
                                .__periodPdfInput as HTMLInputElement | null;
                              if (input) {
                                input.value = "";
                              }
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
                              setPeriodUploadError(null);
                              (window as any).__periodPdfInput?.click();
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
                            onClick={() => {
                              if (periodUploadedFile) {
                                if (pdfPreviewUrl)
                                  URL.revokeObjectURL(pdfPreviewUrl);
                                const url =
                                  URL.createObjectURL(periodUploadedFile);
                                setPdfPreviewUrl(url);
                                setShowPdfPreview(true);
                              }
                            }}
                            className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-[#003366] text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#003366]/5 hover:border-[#003366]/30 transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            {t("Preview", "እይታ")}
                          </motion.button>
                        </div>
                      </>
                    )}
                    {periodUploadError && (
                      <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {periodUploadError}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {selectedReportType !== "comprehensive" ? (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className={sectionHeaderClass}>
                  {SectionHeaderContent(
                    <FileText className="w-4 h-4 text-[#FFD700]" />,
                    t(
                      "Additional Documents & Explanation",
                      "ተጨማሪ ሰነዶች እና ማብራሪያ",
                    ),
                  )}
                </div>
                <div className="p-6 space-y-5">
                  <div>
                    <label className={labelClass}>
                      {t(
                        "Upload PDF Document (optional)",
                        "የPDF ሰነድ ይስቀሉ (አማራጭ)",
                      )}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setUploadedFile(file);
                        }}
                        className={`${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#003366]/10 file:text-[#003366] hover:file:bg-[#003366]/20`}
                      />
                    </div>
                    {uploadedFile && (
                      <p className="mt-1.5 text-xs text-green-600 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {uploadedFile.name} (
                        {(uploadedFile.size / 1024).toFixed(1)} KB)
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>
                      {t("Explanation / Notes", "ማብራሪያ / ማስታወሻ")}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={explanation}
                      onChange={(e) => setExplanation(e.target.value)}
                      rows={4}
                      placeholder={t(
                        "Enter any additional notes or explanation...",
                        "ተጨማሪ ማብራሪያ ወይም ማስታወሻ ያስገቡ...",
                      )}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {/* Section: Declaration */}
            <div className="bg-amber-50/50 rounded-3xl border border-amber-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-800 uppercase tracking-[0.1em] mb-1">
                      {t("Declaration", "ማረጋገጫ")}
                    </p>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      {t(
                        "From here above in the proposal form base, the standard report as expected as event situation report supplier and the institution common sense information. If not available by law for those who ask, anyone case responsibility I'll take it.",
                        "ከላይ በቀረበው የሪፖርት ቅፅ መሰረት ደረጃውን የጠበቀ ሪፖርት እንደተጠበቀው የክስተት ሁኔታ ሪፖርት አቅራቢ እና የተቋሙ የጋራ እውቀት መረጃ በህግ ለማይገኝ ለሚጠይቁ ሁሉ የጉዳይ ሃላፊነት እወስዳለሁ።",
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Report The Doer */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className={sectionHeaderClass}>
                {SectionHeaderContent(
                  <User className="w-4 h-4 text-[#FFD700]" />,
                  t("Report The Doer", "ሪፖርት አድራጊ"),
                )}
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className={labelClass}>
                    {t("First Name", "ስም")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={reporterFirstName}
                      onChange={(e) =>
                        setReporterFirstName(
                          e.target.value.replace(/[0-9]/g, ""),
                        )
                      }
                      placeholder={t("First name...", "ስም...")}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>
                    {t("Middle Name", "የአባት ስም")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={reporterMiddleName}
                      onChange={(e) =>
                        setReporterMiddleName(
                          e.target.value.replace(/[0-9]/g, ""),
                        )
                      }
                      placeholder={t("Middle name...", "የአባት ስም...")}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>
                    {t("Last Name", "የአያት ስም")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={reporterLastName}
                      onChange={(e) =>
                        setReporterLastName(
                          e.target.value.replace(/[0-9]/g, ""),
                        )
                      }
                      placeholder={t("Last name...", "የአያት ስም...")}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>
                    {t("Title", "ማዕረግ")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={reporterTitle}
                    onChange={(e) => setReporterTitle(e.target.value)}
                    placeholder={t("Enter title...", "ማዕረግ ያስገቡ...")}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    {t("Job Responsibility", "የስራ ሃላፊነት")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={reporterJobResponsibility}
                    onChange={(e) =>
                      setReporterJobResponsibility(e.target.value)
                    }
                    placeholder={t(
                      "Enter job responsibility...",
                      "የስራ ሃላፊነት ያስገቡ...",
                    )}
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>
                    {t("Upload Signature Image", "የፊርማ ምስል ይስቀሉ")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    ref={(el) => {
                      if (el) (window as any).__sigInput = el;
                    }}
                    onChange={(e) => {
                      setSignatureFileError(null);
                      const file = e.target.files?.[0] || null;
                      if (!file) {
                        setReporterSignature("");
                        return;
                      }
                      const validTypes = [
                        "image/png",
                        "image/jpeg",
                        "image/jpg",
                        "image/webp",
                      ];
                      if (!validTypes.includes(file.type)) {
                        setSignatureFileError(
                          t(
                            "Only PNG, JPG, or WebP images are allowed.",
                            "PNG፣ JPG ወይም WebP ምስሎች ብቻ ይፈቀዳሉ።",
                          ),
                        );
                        return;
                      }
                      const maxSize = 2 * 1024 * 1024;
                      if (file.size > maxSize) {
                        setSignatureFileError(
                          t(
                            "File size must be under 2MB.",
                            "የፋይል መጠን ከ 2MB በታች መሆን አለበት።",
                          ),
                        );
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        setReporterSignature(
                          (ev.target?.result as string) || "",
                        );
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
                        (window as any).__sigInput?.click();
                      }}
                      className={`w-full p-8 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center gap-2 ${
                        signatureFileError
                          ? "border-red-300 bg-red-50/50"
                          : "border-gray-200 bg-gray-50/50 hover:border-[#003366]/40 hover:bg-[#003366]/5"
                      }`}
                    >
                      <Upload className="w-8 h-8 text-gray-300" />
                      <span className="text-sm font-semibold text-gray-500">
                        {t(
                          "Click to upload signature image",
                          "የፊርማ ምስል ለመስቀል ይጫኑ",
                        )}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {t(
                          "PNG, JPG or WebP - Max 2MB",
                          "PNG፣ JPG ወይም WebP - ከፍተኛ 2MB",
                        )}
                      </span>
                    </motion.button>
                  ) : (
                    <>
                      <div
                        className={`p-4 rounded-2xl border-2 ${
                          signatureFileError
                            ? "border-red-200 bg-red-50/50"
                            : "border-green-200 bg-green-50/50"
                        }`}
                      >
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
                            const input = (window as any)
                              .__sigInput as HTMLInputElement | null;
                            if (input) {
                              input.value = "";
                            }
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
                            (window as any).__sigInput?.click();
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
                </div>
              </div>
            </div>
          </>
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
                    {t(
                      "You can now send it to the Federal Police Admin",
                      "አሁን ለፌዴራል ፖሊስ አስተዳደር መላክ ይችላሉ",
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 flex justify-end">
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSend(pdfBlob ?? undefined)}
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

        <AutoDismissToast
          isOpen={toastOpen}
          type={toastType}
          message={toastMessage}
          onClose={() => setToastOpen(false)}
        />

        <div className="flex justify-end">
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSend()}
            disabled={sending || sent || (!periodUploadedFile && !pdfBlob)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#003366] to-[#001F3F] text-white text-sm font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : sent ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            {sending
              ? t("Submitting...", "በማስገባት ላይ...")
              : sent
                ? t("Submitted", "ገብቷል")
                : t("Submit Report", "ሪፖርቱን ያስገቡ")}
          </motion.button>
        </div>

        {showPdfPreview && pdfPreviewUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={() => {
              setShowPdfPreview(false);
              if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
              setPdfPreviewUrl(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-4 max-w-3xl w-full h-[90vh] shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3 shrink-0">
                <h3 className="text-sm font-black text-[#003366] uppercase tracking-tight">
                  {t("PDF Preview", "የPDF ቅድመ እይታ")}
                </h3>
                <button
                  onClick={() => {
                    setShowPdfPreview(false);
                    if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
                    setPdfPreviewUrl(null);
                  }}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <iframe
                src={pdfPreviewUrl}
                className="w-full flex-1 rounded-xl border border-gray-200"
                title={t("PDF Preview", "የPDF ቅድመ እይታ")}
              />
            </motion.div>
          </motion.div>
        )}

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
      </motion.div>
    </>
  );
}