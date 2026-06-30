import { useState, useEffect } from 'react';
import { Download, Loader2, FileText } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { apiRequest } from '../lib/api';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { AutoDismissToast, ToastType } from "../components/AutoDismissToast";

type Period = "weekly" | "monthly" | "yearly";

export const AdminReports = () => {
  const { t, language } = useLanguage();
  const isAm = language === "am";
  const [period, setPeriod] = useState<Period>("monthly");
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState<{ isOpen: boolean; type: ToastType; message: string }>({ isOpen: false, type: "success", message: "" });

  const [applications, setApplications] = useState<any[]>([]);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [inspections, setInspections] = useState<any[]>([]);
  const [agreements, setAgreements] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [appsRes, licRes, inspRes, agrRes, sumRes] = await Promise.allSettled([
          apiRequest("/applications"),
          apiRequest("/certifications"),
          apiRequest("/inspections"),
          apiRequest("/agreements?limit=999"),
          apiRequest("/admin/summary"),
        ]);
        if (!active) return;
        if (appsRes.status === "fulfilled") {
          const d = appsRes.value?.data || appsRes.value || [];
          setApplications(Array.isArray(d) ? d : []);
        }
        if (licRes.status === "fulfilled") {
          const d = licRes.value?.data || licRes.value || [];
          setLicenses(Array.isArray(d) ? d : []);
        }
        if (inspRes.status === "fulfilled") {
          const d = inspRes.value?.data || inspRes.value || [];
          setInspections(Array.isArray(d) ? d : []);
        }
        if (agrRes.status === "fulfilled") {
          const d = agrRes.value?.data || agrRes.value || [];
          setAgreements(Array.isArray(d) ? d : []);
        }
        if (sumRes.status === "fulfilled") {
          setSummary(sumRes.value?.data || sumRes.value);
        }
        setDataLoaded(true);
      } catch { /* silent */ }
    };
    load();
    return () => { active = false; };
  }, []);

  const statusCount = (items: any[], field: string = "status") => {
    const counts: Record<string, number> = {};
    items.forEach((item) => {
      const s = String(item[field] || "Unknown");
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  };

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 16;
      let y = margin;

      const header = () => {
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 51, 102);
        doc.text(t.reports.title, margin, y);
        y += 6;
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100);
        const now = new Date().toLocaleDateString(isAm ? "am-ET" : "en-US", { year: "numeric", month: "long", day: "numeric" });
        const periodLabel = isAm
          ? (period === "weekly" ? "ሳምንታዊ" : period === "monthly" ? "ወርሃዊ" : "ዓመታዊ")
          : (period === "weekly" ? "Weekly" : period === "monthly" ? "Monthly" : "Yearly");
        doc.text(`${periodLabel} ${isAm ? "ሪፖርት" : "Report"} — ${now}`, margin, y);
        y += 8;
        doc.setDrawColor(0, 51, 102);
        doc.setLineWidth(0.6);
        doc.line(margin, y, pageW - margin, y);
        y += 6;
      };

      const section = (title: string) => {
        if (y > 260) { doc.addPage(); y = margin; header(); }
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 51, 102);
        doc.text(title, margin, y);
        y += 2;
        doc.setDrawColor(200);
        doc.setLineWidth(0.3);
        doc.line(margin, y, pageW - margin, y);
        y += 5;
      };

      const kv = (label: string, value: string) => {
        if (y > 270) { doc.addPage(); y = margin; header(); }
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(60);
        doc.text(label + ":", margin, y);
        doc.setFont("helvetica", "normal");
        const lw = doc.getTextWidth(label + ":  ");
        doc.text(value, margin + lw, y);
        y += 4.5;
      };

      header();

      section(isAm ? "1. የማመልከቻ ሪፖርት" : "1. Applications Report");
      kv(isAm ? "ጠቅላላ ማመልከቻዎች" : "Total Applications", String(applications.length));
      const appCounts = statusCount(applications);
      Object.entries(appCounts).forEach(([s, c]) => kv(`  ${s}`, String(c)));
      if (applications.length > 0) {
        if (y > 240) { doc.addPage(); y = margin; header(); }
        autoTable(doc, {
          startY: y,
          head: [[isAm ? "ማንነት" : "ID", isAm ? "ኤጀንሲ" : "Agency", isAm ? "አይነት" : "Type", isAm ? "ሁኔታ" : "Status", isAm ? "ቀን" : "Date"]],
          body: applications.slice(0, 30).map((a) => [
            String(a.id || a.applicationId || "-"),
            String(a.agency || a.organization?.name || "-"),
            String(a.type || a.applicationType || "-"),
            String(a.status || "-"),
            a.date || a.applicationDate || a.createdAt ? new Date(a.date || a.applicationDate || a.createdAt).toLocaleDateString() : "-",
          ]),
          styles: { fontSize: 7 },
          headStyles: { fillColor: [0, 51, 102], textColor: 255, fontSize: 7 },
        });
        y = (doc as any).lastAutoTable.finalY + 6;
      }

      if (y > 240) { doc.addPage(); y = margin; header(); }
      section(isAm ? "2. የፈቃድ ሪፖርት" : "2. Licenses Report");
      kv(isAm ? "ጠቅላላ ፈቃዶች" : "Total Licenses", String(licenses.length));
      const licCounts = statusCount(licenses);
      Object.entries(licCounts).forEach(([s, c]) => kv(`  ${s}`, String(c)));
      if (licenses.length > 0) {
        if (y > 240) { doc.addPage(); y = margin; header(); }
        autoTable(doc, {
          startY: y,
          head: [[isAm ? "ፈቃድ ቁጥር" : "License No", isAm ? "ኤጀንሲ" : "Agency", isAm ? "ሁኔታ" : "Status", isAm ? "የተሰጠበት" : "Issued", isAm ? "የሚያበቃበት" : "Expiry"]],
          body: licenses.slice(0, 30).map((l) => [
            String(l.certificateSerialNumber || l.licenseNo || "-"),
            String(l.organization?.name || l.agency || "-"),
            String(l.status || "-"),
            l.issueDate ? new Date(l.issueDate).toLocaleDateString() : "-",
            l.expiryDate ? new Date(l.expiryDate).toLocaleDateString() : "-",
          ]),
          styles: { fontSize: 7 },
          headStyles: { fillColor: [0, 51, 102], textColor: 255, fontSize: 7 },
        });
        y = (doc as any).lastAutoTable.finalY + 6;
      }

      if (y > 240) { doc.addPage(); y = margin; header(); }
      section(isAm ? "3. የምርመራ ሪፖርት" : "3. Inspections Report");
      kv(isAm ? "ጠቅላላ ምርመራዎች" : "Total Inspections", String(inspections.length));
      const inspCounts = statusCount(inspections);
      Object.entries(inspCounts).forEach(([s, c]) => kv(`  ${s}`, String(c)));
      if (inspections.length > 0) {
        if (y > 240) { doc.addPage(); y = margin; header(); }
        autoTable(doc, {
          startY: y,
          head: [[isAm ? "ማንነት" : "ID", isAm ? "ኤጀንሲ" : "Agency", isAm ? "ሁኔታ" : "Status", isAm ? "ቀን" : "Date"]],
          body: inspections.slice(0, 30).map((i) => [
            String(i.id || "-"),
            String(i.agency || i.organization?.name || "-"),
            String(i.status || "-"),
            i.date || i.createdAt ? new Date(i.date || i.createdAt).toLocaleDateString() : "-",
          ]),
          styles: { fontSize: 7 },
          headStyles: { fillColor: [0, 51, 102], textColor: 255, fontSize: 7 },
        });
        y = (doc as any).lastAutoTable.finalY + 6;
      }

      if (y > 240) { doc.addPage(); y = margin; header(); }
      section(isAm ? "4. የስምምነት ሪፖርት" : "4. Agreements Report");
      kv(isAm ? "ጠቅላላ ስምምነቶች" : "Total Agreements", String(agreements.length));
      const agrCounts = statusCount(agreements);
      Object.entries(agrCounts).forEach(([s, c]) => kv(`  ${s}`, String(c)));
      if (agreements.length > 0) {
        if (y > 240) { doc.addPage(); y = margin; header(); }
        autoTable(doc, {
          startY: y,
          head: [[isAm ? "ማንነት" : "ID", isAm ? "ኤጀንሲ" : "Agency", isAm ? "ሁኔታ" : "Status", isAm ? "ቀን" : "Date"]],
          body: agreements.slice(0, 30).map((a) => [
            String(a.id || "-"),
            String(a.agency || a.organization?.name || "-"),
            String(a.status || "-"),
            a.date || a.createdAt ? new Date(a.date || a.createdAt).toLocaleDateString() : "-",
          ]),
          styles: { fontSize: 7 },
          headStyles: { fillColor: [0, 51, 102], textColor: 255, fontSize: 7 },
        });
        y = (doc as any).lastAutoTable.finalY + 6;
      }

      if (summary) {
        if (y > 240) { doc.addPage(); y = margin; header(); }
        section(isAm ? "5. የኤጀንሲ ማጠቃለያ" : "5. Agency Summary");
        Object.entries(summary).forEach(([k, v]) => {
          if (typeof v === "number" || typeof v === "string") {
            kv(k, String(v));
          }
        });
      }

      doc.save(`federal-police-report-${period}-${new Date().toISOString().slice(0, 10)}.pdf`);
      setToast({ isOpen: true, type: "success", message: t.reports.success });
    } catch (err) {
      console.error("PDF generation failed", err);
      setToast({ isOpen: true, type: "error", message: "Failed to generate report" });
    } finally {
      setGenerating(false);
    }
  };

  const periodOptions: { value: Period; label: string }[] = [
    { value: "weekly", label: t.reports.weekly },
    { value: "monthly", label: t.reports.monthly },
    { value: "yearly", label: t.reports.yearly },
  ];

  return (
    <div className="space-y-8">
      <AutoDismissToast
        isOpen={toast.isOpen}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
      />

      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-[#003366]">{t.reports.title}</h2>
          <p className="text-sm text-gray-500">{t.reports.subtitle}</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-xl p-1">
            {periodOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  period === opt.value
                    ? "bg-[#003366] text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            onClick={generatePDF}
            disabled={generating || !dataLoaded}
            className="flex items-center space-x-2 px-6 py-3 bg-[#003366] text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            <span>{generating ? t.reports.loading : t.reports.generatePdf}</span>
          </button>
        </div>
      </div>

      {!dataLoaded && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#003366]" />
        </div>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#003366]/5 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 text-[#003366]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#003366] mb-2">
              {isAm ? "የፌዴራል ፖሊስ አስተዳደር ሪፖርት ያመንጩ" : "Generate Federal Police Admin Report"}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {isAm
                ? "የሪፖርት ጊዜ ይምረጡ (ሳምንታዊ፣ ወርሃዊ፣ ወይም ዓመታዊ) እና PDF ያመንጩ የሚለውን ጠቅ ያድርጉ። ሪፖርቱ ሁሉንም የአስተዳደር መረጃዎች ይይዛል (ማመልከቻዎች፣ ፈቃዶች፣ ምርመራዎች፣ ስምምነቶች) እና በራስ-ሰር ይወርዳል።"
                : "Select a reporting period (Weekly, Monthly, or Yearly) and click Generate PDF. The report will include all administrative data (Applications, Licenses, Inspections, Agreements) and will be downloaded automatically."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};