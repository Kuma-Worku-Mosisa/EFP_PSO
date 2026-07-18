import { useState, useEffect } from "react";
import { Download, Loader2, FileText } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { apiRequest } from "../lib/api";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { AutoDismissToast, ToastType } from "../components/AutoDismissToast";

type Period = "weekly" | "monthly" | "yearly";

function periodDate(period: Period): string {
  const now = new Date();
  if (period === "weekly") {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return d.toISOString();
  }
  if (period === "monthly") {
    const d = new Date(now);
    d.setMonth(d.getMonth() - 1);
    return d.toISOString();
  }
  const d = new Date(now);
  d.setFullYear(d.getFullYear() - 1);
  return d.toISOString();
}

function countBy<T>(
  items: T[],
  key: keyof T | ((item: T) => string),
): Record<string, number> {
  const counts: Record<string, number> = {};
  items.forEach((item) => {
    const k =
      typeof key === "function" ? key(item) : String(item[key] ?? "Unknown");
    counts[k] = (counts[k] || 0) + 1;
  });
  return counts;
}

function wrapText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lineH: number,
): number {
  const words = text.split(" ");
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (doc.getTextWidth(test) > maxW && line) {
      doc.text(line, x, y);
      y += lineH;
      line = w;
    } else {
      line = test;
    }
  }
  if (line) doc.text(line, x, y);
  return y;
}

export const AdminReports = () => {
  const { t, language } = useLanguage();
  const isAm = language === "am";
  const [period, setPeriod] = useState<Period>("monthly");
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState<{
    isOpen: boolean;
    type: ToastType;
    message: string;
  }>({ isOpen: false, type: "success", message: "" });

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
        const since = periodDate(period);
        const filterParam = `?since=${encodeURIComponent(since)}`;
        const [appsRes, licRes, inspRes, agrRes, sumRes] =
          await Promise.allSettled([
            apiRequest(`/applications${filterParam}`),
            apiRequest(`/certifications${filterParam}`),
            apiRequest(`/inspections${filterParam}`),
            apiRequest(`/agreements${filterParam}&limit=999`),
            apiRequest("/admin/summary"),
          ]);
        if (!active) return;
        if (appsRes.status === "fulfilled") {
          const d = appsRes.value?.data || appsRes.value || [];
          setApplications(Array.isArray(d) ? d : []);
        } else setApplications([]);
        if (licRes.status === "fulfilled") {
          const d = licRes.value?.data || licRes.value || [];
          setLicenses(Array.isArray(d) ? d : []);
        } else setLicenses([]);
        if (inspRes.status === "fulfilled") {
          const d = inspRes.value?.data || inspRes.value || [];
          setInspections(Array.isArray(d) ? d : []);
        } else setInspections([]);
        if (agrRes.status === "fulfilled") {
          const d = agrRes.value?.data || agrRes.value || [];
          setAgreements(Array.isArray(d) ? d : []);
        } else setAgreements([]);
        if (sumRes.status === "fulfilled") {
          setSummary(sumRes.value?.data || sumRes.value);
        } else setSummary(null);
        setDataLoaded(true);
      } catch {
        /* silent */
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [period]);

  const periodLabel = isAm
    ? period === "weekly"
      ? "ሳምንታዊ"
      : period === "monthly"
        ? "ወርሃዊ"
        : "ዓመታዊ"
    : period === "weekly"
      ? "Weekly"
      : period === "monthly"
        ? "Monthly"
        : "Yearly";

  const toEth = (dateStr?: string) => {
    try {
      const d = dateStr ? new Date(dateStr) : new Date();
      if (isNaN(d.getTime())) return "-";
      return d.toLocaleDateString("am-ET", {
        calendar: "ethiopic",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "-";
    }
  };

  const amVal = (v: string | undefined | null, def = "-") => {
    if (!v) return def;
    const map: Record<string, string> = {
      Pending: "በመጠባበቅ ላይ",
      Approved: "ጸድቋል",
      Rejected: "ውድቅ ተደርጓል",
      Active: "ንቁ",
      Expired: "ጊዜው ያለፈበት",
      Suspended: "የታገደ",
      New: "አዲስ",
      Renewal: "እድሳት",
      active: "ንቁ",
      inactive: "እንቅስቃሴ የሌለው",
      expired: "ጊዜው ያለፈ",
      pending: "በመጠባበቅ ላይ",
      approved: "ጸድቋል",
      rejected: "ውድቅ ተደርጓል",
      draft: "ረቂቅ",
      submitted: "ቀርቧል",
      completed: "ተጠናቋል",
      True: "አዎ",
      False: "አይ",
      true: "አዎ",
      false: "አይ",
      Scheduled: "በታቀደ ላይ",
      "In Progress": "በመካሄድ ላይ",
      Cancelled: "ተሰርዟል",
      scheduled: "በታቀደ ላይ",
      "in progress": "በመካሄድ ላይ",
      cancelled: "ተሰርዟል",
      Passed: "አልፏል",
      Failed: "ወድቋል",
      "Under Review": "በመገምገም ላይ",
      passed: "አልፏል",
      failed: "ወድቋል",
      "under review": "በመገምገም ላይ",
      Amendment: "ማሻሻያ",
      Transfer: "ዝውውር",
      Replacement: "መተካት",
      Correction: "እርማት",
      amendment: "ማሻሻያ",
      transfer: "ዝውውር",
      replacement: "መተካት",
      correction: "እርማት",
      Renew: "አድስ",
      renew: "አድስ",
    };
    return map[v] || v;
  };

  const amKey = (k: string) => {
    const map: Record<string, string> = {
      totalAgencies: "ጠቅላላ ድርጅቶች",
      activeAgencies: "ንቁ ድርጅቶች",
      inactiveAgencies: "እንቅስቃሴ የሌላቸው ድርጅቶች",
      totalLicenses: "ጠቅላላ ፈቃዶች",
      activeLicenses: "ንቁ ፈቃዶች",
      expiredLicenses: "ጊዜያቸው ያለፈ ፈቃዶች",
      totalApplications: "ጠቅላላ ማመልከቻዎች",
      pendingApplications: "በመጠባበቅ ላይ ያሉ ማመልከቻዎች",
      totalPersonnel: "ጠቅላላ ሰራተኞች",
      totalRevenue: "ጠቅላላ ገቢ",
      totalOrganizations: "ጠቅላላ ድርጅቶች",
      totalUsers: "ጠቅላላ ተጠቃሚዎች",
      totalInspections: "ጠቅላላ ምርመራዎች",
      totalAgreements: "ጠቅላላ ስምምነቶች",
      regions: "ክልሎች",
      agencies: "ድርጅቶች",
      organizations: "ድርጅቶች",
      users: "ተጠቃሚዎች",
    };
    return map[k] || k;
  };

  const nowAm = toEth();

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 16;
      const maxW = pageW - 2 * margin;
      const now = isAm
        ? nowAm
        : new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });

      if (isAm) {
        const appCounts = countBy(applications, "status");
        const licCounts = countBy(licenses, "status");
        const inspCounts = countBy(inspections, "status");
        const agrCounts = countBy(agreements, "status");

        const bodyHtml = `
  <h1>${t.reports.title}</h1>
  <div class="sub">${periodLabel} ሪፖርት — ${nowAm}</div>
  <hr class="hline">
  <h2>1. የማመልከቻ ሪፖርት</h2><hr class="sline">
  <p><strong>ጠቅላላ ማመልከቻዎች:</strong> ${applications.length}</p>
  ${Object.entries(appCounts)
    .map(([s, c]) => `<p class="ind"><strong>${amVal(s)}:</strong> ${c}</p>`)
    .join("")}
  <h2>2. የፈቃድ ሪፖርት</h2><hr class="sline">
  <p><strong>ጠቅላላ ፈቃዶች:</strong> ${licenses.length}</p>
  ${Object.entries(licCounts)
    .map(([s, c]) => `<p class="ind"><strong>${amVal(s)}:</strong> ${c}</p>`)
    .join("")}
  <h2>3. የምርመራ ሪፖርት</h2><hr class="sline">
  <p><strong>ጠቅላላ ምርመራዎች:</strong> ${inspections.length}</p>
  ${Object.entries(inspCounts)
    .map(([s, c]) => `<p class="ind"><strong>${amVal(s)}:</strong> ${c}</p>`)
    .join("")}
  <h2>4. የስምምነት ሪፖርት</h2><hr class="sline">
  <p><strong>ጠቅላላ ስምምነቶች:</strong> ${agreements.length}</p>
  ${Object.entries(agrCounts)
    .map(([s, c]) => `<p class="ind"><strong>${amVal(s)}:</strong> ${c}</p>`)
    .join("")}
  ${
    summary
      ? `<h2>5. የድርጅት ማጠቃለያ</h2><hr class="sline">${Object.entries(summary)
          .filter(([, v]) => typeof v === "number" || typeof v === "string")
          .map(([k, v]) => `<p><strong>${amKey(k)}:</strong> ${v}</p>`)
          .join("")}`
      : ""
  }`;

        const wrapper = document.createElement("div");
        wrapper.style.position = "absolute";
        wrapper.style.left = "-9999px";
        wrapper.style.top = "0";
        wrapper.innerHTML = `<style>
  * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Ebrima', 'Segoe UI', Tahoma, sans-serif; }
  .page { width: 210mm; background: #fff; padding: 16mm; }
  h1 { color: #003366; font-size: 16pt; font-weight: bold; margin-bottom: 8mm; }
  .sub { color: #666; font-size: 9pt; margin-bottom: 10mm; }
  .hline { border: none; border-top: 0.6mm solid #003366; margin-bottom: 8mm; width: 100%; }
  h2 { color: #003366; font-size: 13pt; font-weight: bold; margin-bottom: 4mm; }
  .sline { border: none; border-top: 0.3mm solid #ccc; margin-bottom: 7mm; width: 100%; }
  p { margin-bottom: 6mm; font-size: 9pt; color: #1a1a1a; }
  p strong { color: #3c3c3c; }
  .ind { margin-left: 3mm; }
</style>
<div class="page">${bodyHtml}</div>`;

        document.body.appendChild(wrapper);
        await document.fonts.ready;
        await new Promise((r) => setTimeout(r, 500));
        const canvas = await html2canvas(wrapper, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
        });
        document.body.removeChild(wrapper);
        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        const pdfH = (canvas.height * 210) / canvas.width;
        let pos = 0;
        doc.addImage(imgData, "JPEG", 0, pos, 210, pdfH);
        pos -= 297;
        while (-pos < pdfH) {
          doc.addPage();
          doc.addImage(imgData, "JPEG", 0, pos, 210, pdfH);
          pos -= 297;
        }
        doc.save(
          `federal-police-report-${period}-${new Date().toISOString().slice(0, 10)}.pdf`,
        );
      } else {
        let y = margin;
        const header = () => {
          doc.setFontSize(16);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(0, 51, 102);
          doc.text(t.reports.title, margin, y);
          y += 8;
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(100);
          doc.text(`${periodLabel} Report — ${now}`, margin, y);
          y += 10;
          doc.setDrawColor(0, 51, 102);
          doc.setLineWidth(0.6);
          doc.line(margin, y, pageW - margin, y);
          y += 8;
        };
        const section = (title: string) => {
          if (y > 250) {
            doc.addPage();
            y = margin;
            header();
          }
          doc.setFontSize(13);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(0, 51, 102);
          doc.text(title, margin, y);
          y += 4;
          doc.setDrawColor(200);
          doc.setLineWidth(0.3);
          doc.line(margin, y, pageW - margin, y);
          y += 7;
        };
        const kv = (label: string, value: string) => {
          if (y > 260) {
            doc.addPage();
            y = margin;
            header();
          }
          doc.setFontSize(9);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(60);
          doc.text(label + ":", margin, y);
          doc.setFont("helvetica", "normal");
          const lw = doc.getTextWidth(label + ":  ");
          y = wrapText(doc, value, margin + lw, y, maxW - lw, 6);
          y += 6;
        };

        header();
        section("1. Applications Report");
        kv("Total Applications", String(applications.length));
        const appCounts = countBy(applications, "status");
        Object.entries(appCounts).forEach(([s, c]) => kv(`  ${s}`, String(c)));

        section("2. Licenses Report");
        kv("Total Licenses", String(licenses.length));
        const licCounts = countBy(licenses, "status");
        Object.entries(licCounts).forEach(([s, c]) => kv(`  ${s}`, String(c)));

        section("3. Inspections Report");
        kv("Total Inspections", String(inspections.length));
        const inspCounts = countBy(inspections, "status");
        Object.entries(inspCounts).forEach(([s, c]) => kv(`  ${s}`, String(c)));

        section("4. Agreements Report");
        kv("Total Agreements", String(agreements.length));
        const agrCounts = countBy(agreements, "status");
        Object.entries(agrCounts).forEach(([s, c]) => kv(`  ${s}`, String(c)));

        if (summary) {
          if (y > 230) {
            doc.addPage();
            y = margin;
            header();
          }
          section("5. Agency Summary");
          Object.entries(summary).forEach(([k, v]) => {
            if (typeof v === "number" || typeof v === "string") {
              kv(k, String(v));
            }
          });
        }

        doc.save(
          `federal-police-report-${period}-${new Date().toISOString().slice(0, 10)}.pdf`,
        );
      }
      setToast({ isOpen: true, type: "success", message: t.reports.success });
    } catch (err) {
      console.error("PDF generation failed", err);
      setToast({
        isOpen: true,
        type: "error",
        message: "Failed to generate report",
      });
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
          <h2 className="text-2xl font-bold text-[#003366]">
            {t.reports.title}
          </h2>
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
            <span>
              {generating ? t.reports.loading : t.reports.generatePdf}
            </span>
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
              {isAm
                ? "የፌዴራል ፖሊስ አስተዳደር ሪፖርት ያመንጩ"
                : "Generate Federal Police Admin Report"}
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
