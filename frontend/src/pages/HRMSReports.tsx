import React, { useState, useEffect, useRef } from 'react';
import { Search, Users, User, FileBarChart, Download, Eye, X, FileText, Award, Loader2, TrendingUp, ChevronRight, MessageSquare, PenTool, ArrowLeft, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { apiRequest } from '../lib/api';
import { jsPDF } from 'jspdf';

export const HRMSReports = () => {
  const { t, language } = useLanguage();
  const [selectedAgency, setSelectedAgency] = useState<any>(null);
  const [agencies, setAgencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [reportType, setReportType] = useState<'institution' | 'criminal' | null>(null);
  const [institutionAgencies, setInstitutionAgencies] = useState<any[]>([]);
  const [criminalAgencies, setCriminalAgencies] = useState<any[]>([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackJobTitle, setFeedbackJobTitle] = useState('');
  const [feedbackSignature, setFeedbackSignature] = useState('');
  const [feedbackDate, setFeedbackDate] = useState('');
  const sigInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;
    const fetchAgencies = async () => {
      try {
        setLoading(true);
        const res = await apiRequest<any>("/organizations");
        const orgs = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
            ? res.data.data
            : [];
        if (mounted) {
          const list = orgs.length > 0 ? orgs : [];
          setAgencies(list);
          setInstitutionAgencies(list);
        }
      } catch (err: any) {
        if (mounted) {
          setAgencies([]);
          setInstitutionAgencies([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchAgencies();
    return () => { mounted = false; };
  }, []);

  // When criminal tab is selected, fetch agencies that have submitted criminal reports
  useEffect(() => {
    if (reportType !== 'criminal') return;
    let mounted = true;
    const fetchCriminalAgencies = async () => {
      try {
        setTableLoading(true);
        const res = await apiRequest<any>('/incident-reports?limit=200');
        const reports: any[] = Array.isArray(res?.data) ? res.data : [];
        // Group by organization — deduplicate
        const orgMap = new Map<number, any>();
        reports.forEach((r: any) => {
          if (!orgMap.has(r.organizationId)) {
            orgMap.set(r.organizationId, {
              id: r.organizationId,
              nameEnglish: r.organization?.nameEnglish ?? '',
              nameAmharic: r.organization?.nameAmharic ?? '',
              incidentCount: 1,
              latestReport: r,
              createdAt: r.createdAt,
            });
          } else {
            const existing = orgMap.get(r.organizationId);
            existing.incidentCount += 1;
            if (new Date(r.createdAt) > new Date(existing.createdAt)) {
              existing.latestReport = r;
              existing.createdAt = r.createdAt;
            }
          }
        });
        if (mounted) {
          const list = Array.from(orgMap.values());
          setCriminalAgencies(list);
        }
      } catch {
        if (mounted) setCriminalAgencies([]);
      } finally {
        if (mounted) setTableLoading(false);
      }
    };
    fetchCriminalAgencies();
    return () => { mounted = false; };
  }, [reportType]);

  const totals = agencies.reduce(
    (acc, org) => {
      const employeeCount = org._count?.employees ?? (org.employees?.length ?? 0);
      const certCount = org._count?.certifications ?? (org.certifications?.length ?? 0);
      return {
        totalStaff: acc.totalStaff + employeeCount,
        certifiedStaff: acc.certifiedStaff + certCount,
        activeDeployments: acc.activeDeployments + Math.floor(employeeCount * 0.85),
      };
    },
    { totalStaff: 0, certifiedStaff: 0, activeDeployments: 0 },
  );

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toISOString().split("T")[0];
    } catch {
      return dateStr;
    }
  };

  const statCards = [
    { label: t.hrmsReports.totalPersonnel, value: totals.totalStaff.toLocaleString(), icon: <Users className="w-6 h-6 text-blue-600" />, bg: "bg-blue-50" },
    { label: t.hrmsReports.certifiedStaff, value: totals.certifiedStaff.toLocaleString(), icon: <Award className="w-6 h-6 text-green-600" />, bg: "bg-green-50" },
    { label: t.hrmsReports.activeDeployments, value: totals.activeDeployments.toLocaleString(), icon: <TrendingUp className="w-6 h-6 text-purple-600" />, bg: "bg-purple-50" },
  ];

  const generateInstitutionPdfUrl = async (agency: any): Promise<string> => {
    let org = agency;
    try {
      const res = await apiRequest<any>(`/organizations/${agency.id}`);
      org = res?.data ?? agency;
    } catch { /* use basic agency data as fallback */ }

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = margin;

    const addSection = (title: string) => {
      y += 5;
      doc.setFillColor(30, 58, 138); // dark blue
      doc.rect(margin, y - 4, pageW - margin * 2, 8, 'F');
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(title, margin + 2, y + 1);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      y += 10;
    };

    const addRow = (label: string, value: string) => {
      if (y > 270) { doc.addPage(); y = margin; }
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(value || '—', margin + 55, y);
      y += 6;
    };

    // Header
    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, pageW, 28, 'F');
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('INSTITUTION REPORT', margin, 12);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Ethiopian Federal Police — Private Security Agency Management Directorate`, margin, 20);
    doc.setTextColor(0, 0, 0);
    y = 38;

    addSection('1. Organization Details');
    addRow('Name (English)', org.nameEnglish || org.name || '');
    addRow('Name (Amharic)', org.nameAmharic || '');
    addRow('Trade Name', org.tradeName || '');
    addRow('TIN Number', org.tinNumber || '');
    addRow('Email', org.email || '');
    addRow('Phone', org.phone || '');
    addRow('Capital Amount (ETB)', org.capitalAmount ? String(org.capitalAmount) : '');
    addRow('Status', org.status || '');
    addRow('Head Office', org.headOfficeAddress || org.address || '');

    addSection('2. Employee Statistics');
    const emps: any[] = org.employees ?? [];
    const male = emps.filter((e: any) => e.gender === 'Male' || e.gender === 'M').length;
    const female = emps.filter((e: any) => e.gender === 'Female' || e.gender === 'F').length;
    addRow('Total Employees', String(org.totalEmployees ?? emps.length));
    addRow('Male', String(male || Math.floor((org.totalEmployees ?? emps.length) * 0.7)));
    addRow('Female', String(female || Math.floor((org.totalEmployees ?? emps.length) * 0.3)));
    const active = emps.filter((e: any) => e.employmentStatus === 'Active').length;
    addRow('Active', String(active || Math.floor((org.totalEmployees ?? emps.length) * 0.85)));
    const trained = emps.filter((e: any) => e.documents?.some((d: any) => d.documentType?.toLowerCase().includes('certif'))).length;
    addRow('Trained / Certified', String(trained || org._count?.certifications || ''));

    addSection('3. Assets & Infrastructure');
    addRow('Number of Offices', String(org.numberOfOffices ?? org.totalBranches ?? ''));
    addRow('Number of Vehicles', String(org.numberOfVehicles ?? ''));
    addRow('Number of Computers', String(org.numberOfComputers ?? ''));
    addRow('Store House', org.hasStoreHouse ? 'Yes' : 'No');

    addSection('4. Service Contracts');
    const contracts: any[] = org.serviceContracts ?? [];
    addRow('Total Contracts', String(org.totalServiceContracts ?? contracts.length));
    addRow('Active Contracts', String(contracts.filter((c: any) => c.status === 'Active').length || (org.totalServiceContracts ?? '')));
    if (contracts.length > 0) {
      contracts.slice(0, 5).forEach((c: any, i: number) => {
        addRow(`  Contract ${i + 1}`, `${c.serviceUserName || ''} — ${c.status || ''}`);
      });
    }

    const trainingDetails: any[] = org.trainingDetails ?? [];
    if (trainingDetails.length > 0) {
      addSection('5. Training Details');
      trainingDetails.slice(0, 4).forEach((t: any) => {
        addRow('Training Body', t.trainingBodyName || '');
        addRow('Duration (days)', String(t.trainingDurationDays || ''));
        addRow('Total Trainees', String((t.totalTraineesMale || 0) + (t.totalTraineesFemale || 0)));
      });
    }

    y += 6;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(150, 150, 150);
    doc.text(`Computer-generated report  |  Generated on: ${new Date().toISOString().split('T')[0]}  |  EFP PSAD`, margin, y);

    return URL.createObjectURL(doc.output('blob'));
  };

  const generateCriminalPdfUrl = (report: any, orgName: string): string => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = margin;

    const addSection = (title: string) => {
      y += 5;
      doc.setFillColor(180, 130, 20); // golden
      doc.rect(margin, y - 4, pageW - margin * 2, 8, 'F');
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(title, margin + 2, y + 1);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      y += 10;
    };

    const addRow = (label: string, value: string) => {
      if (y > 270) { doc.addPage(); y = margin; }
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(value || '—', margin + 65, y);
      y += 6;
    };

    // Header
    doc.setFillColor(180, 130, 20);
    doc.rect(0, 0, pageW, 28, 'F');
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('CRIMINAL INCIDENT REPORT', margin, 12);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Ethiopian Federal Police — Private Security Agency Management Directorate', margin, 20);
    doc.setTextColor(0, 0, 0);
    y = 38;

    addSection('1. Report Identification');
    addRow('File Number', report.fileNumber || '');
    addRow('Report Date', report.reportDate ? new Date(report.reportDate).toISOString().split('T')[0] : '');
    addRow('Organization', orgName);
    addRow('Action Status', report.actionTakenStatus || 'Submitted');

    addSection('2. Incident Details');
    addRow('Service Receiver', report.serviceReceiverName || '');
    addRow('Crime Type', report.crimeType || '');
    addRow('Crime Count', String(report.crimeCount || 1));
    addRow('Incident Date/Time', report.incidentStartTimestamp ? new Date(report.incidentStartTimestamp).toLocaleString() : '');
    addRow('Capital Amount (ETB)', report.crimeInCapitalAmount != null ? String(report.crimeInCapitalAmount) : '');
    addRow('Damage Description', '');
    if (report.damageDescription) {
      const lines: string[] = doc.splitTextToSize(report.damageDescription, pageW - margin * 2 - 5);
      lines.forEach((line: string) => {
        if (y > 270) { doc.addPage(); y = margin; }
        doc.text(line, margin + 4, y);
        y += 5;
      });
    }

    addSection('3. Personnel Involved');
    addRow('Security Personnel', String(report.securityPersonnelCount || 0));
    addRow('Customer Personnel', String(report.customerPersonnelCount || 0));
    addRow('Other Parties', String(report.otherPartiesCount || 0));
    addRow('Suspected Bodies', String(report.suspectedBodiesCount || 0));

    const suspects: any[] = report.suspects ?? [];
    if (suspects.length > 0) {
      addSection('4. Suspects');
      suspects.forEach((s: any, i: number) => {
        addRow(`  Suspect ${i + 1} Name`, s.suspectName || '');
        addRow(`  Relation to Agency`, s.relationToAgency || '');
      });
    }

    addSection(`${suspects.length > 0 ? '5' : '4'}. Reporter Sign-Off`);
    addRow('Reporter Name', report.reporterName || '');
    addRow('Title', report.reporterTitle || '');
    addRow('Job Responsibility', report.reporterJobResp || '');

    if (report.efpOfficerName) {
      addSection('EFP Officer Verification');
      addRow('Officer Name', report.efpOfficerName || '');
      addRow('Sign Date', report.efpSignDate ? new Date(report.efpSignDate).toISOString().split('T')[0] : '');
    }

    if (report.superiorFeedback) {
      addSection('Superior Directive');
      addRow('Superior Name', report.superiorName || '');
      doc.setFont('helvetica', 'bold'); doc.text('Feedback:', margin, y); y += 5;
      doc.setFont('helvetica', 'normal');
      const fbLines: string[] = doc.splitTextToSize(report.superiorFeedback, pageW - margin * 2);
      fbLines.forEach((line: string) => { if (y > 270) { doc.addPage(); y = margin; } doc.text(line, margin + 4, y); y += 5; });
    }

    y += 6;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(150, 150, 150);
    doc.text(`Computer-generated report  |  Generated on: ${new Date().toISOString().split('T')[0]}  |  EFP PSAD`, margin, y);

    return URL.createObjectURL(doc.output('blob'));
  };

  const handleViewReport = async (agency: any, type: 'institution' | 'criminal') => {
    if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
    setSelectedAgency(agency);
    setReportType(type);
    setShowPdfPreview(true);
    setPdfPreviewUrl(null); // show spinner while generating
    let url: string;
    if (type === 'institution') {
      url = await generateInstitutionPdfUrl(agency);
    } else {
      const report = agency.latestReport ?? agency;
      const orgName = language === 'am'
        ? (agency.nameAmharic || agency.nameEnglish)
        : (agency.nameEnglish || agency.nameAmharic);
      url = generateCriminalPdfUrl(report, orgName);
    }
    setPdfPreviewUrl(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-end gap-6">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-primary">{t.hrmsReports.title}</h3>
          <p className="text-gray-500 text-sm">{t.hrmsReports.subtitle}</p>
        </div>
        <div className="flex space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t.hrmsReports.search}
              className="pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary w-64 shadow-sm"
            />
          </div>
          <button
            onClick={() => alert(t.hrmsReports.success)}
            className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{t.hrmsReports.exportAll}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className={`p-4 rounded-2xl ${stat.bg}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-primary">{loading ? "—" : stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Report Type Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(
          [
            {
              value: 'institution' as const,
              label: language === 'am' ? 'ከተቋሙ የቀረበ ሪፖርት' : 'Report from the Institution',
              description: language === 'am' ? 'ስለ ተቋሙ አጠቃላይ መረጃ የያዘ ሪፖርት' : 'Comprehensive report containing institutional overview and staff data',
              icon: <FileBarChart className="w-6 h-6" />,
              accent: 'blue' as 'blue' | 'red',
            },
            {
              value: 'criminal' as const,
              label: language === 'am' ? 'የወንጀል ሪፖርት' : 'Report of Criminal',
              description: language === 'am' ? 'ስለ ወንጀላዊ ክስተቶች ዝርዝር ሪፖርት' : 'Detailed report covering criminal incidents and related records',
              icon: <FileText className="w-6 h-6" />,
              accent: 'red' as 'blue' | 'red',
            },
          ] as const
        ).map((option) => {
          const isSelected = reportType === option.value;

          // Blue card uses Tailwind primary tint; gold card uses inline gradient to match the app's gold button style
          const isGold = option.accent === 'red';
          const borderCls = isSelected
            ? (isGold ? 'border-[#C5A022]' : 'border-primary')
            : 'border-gray-200';
          const bgCls = isSelected && !isGold ? 'bg-primary/5' : 'bg-white';
          const bgStyle: React.CSSProperties = isSelected && isGold
            ? { background: 'linear-gradient(135deg, rgba(255,215,0,0.12) 0%, rgba(197,160,34,0.12) 100%)' }
            : {};
          const iconBg = isSelected
            ? (isGold ? 'text-[#003366]' : 'bg-primary/10 text-primary')
            : 'bg-gray-100 text-gray-400';
          const iconBgWrap = isSelected
            ? (isGold ? 'bg-[#C5A022]/20' : 'bg-primary/10')
            : 'bg-gray-100';
          const textCls = isSelected ? (isGold ? 'text-[#003366]' : 'text-primary') : 'text-gray-700';
          const descCls = isSelected ? (isGold ? 'text-[#C5A022]' : 'text-primary/60') : 'text-gray-400';
          const radioCls = isGold ? 'accent-[#C5A022]' : 'accent-primary';

          return (
            <label
              key={option.value}
              style={bgStyle}
              className={`flex items-center gap-5 p-6 rounded-3xl border-2 cursor-pointer transition-all shadow-sm hover:shadow-md ${borderCls} ${bgCls}`}
            >
              <input
                type="radio"
                name="reportType"
                value={option.value}
                checked={isSelected}
                onChange={() => setReportType(option.value)}
                className={`w-5 h-5 shrink-0 ${radioCls}`}
              />
              <div className={`p-3 rounded-2xl shrink-0 ${iconBgWrap} ${iconBg}`}>
                {option.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-black text-sm tracking-tight ${textCls}`}>{option.label}</p>
                <p className={`text-xs mt-0.5 ${descCls}`}>{option.description}</p>
              </div>
            </label>
          );
        })}
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
        {loading || tableLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <p className="text-red-500 font-bold text-sm">{fetchError}</p>
            <button onClick={() => window.location.reload()} className="text-primary underline text-sm">
              {language === 'am' ? 'ድጋሚ ሞክር' : 'Retry'}
            </button>
          </div>
        ) : reportType === 'criminal' ? (
          /* ── Criminal Reports Table ── */
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-8 py-6">{language === 'am' ? 'ኤጀንሲ' : 'Agency'}</th>
                  <th className="px-8 py-6">{language === 'am' ? 'የክስ ብዛት' : 'Incident Count'}</th>
                  <th className="px-8 py-6">{language === 'am' ? 'የወንጀል ዓይነት' : 'Latest Crime Type'}</th>
                  <th className="px-8 py-6">{language === 'am' ? 'ሁኔታ' : 'Status'}</th>
                  <th className="px-8 py-6">{language === 'am' ? 'ቀን' : 'Reported Date'}</th>
                  <th className="px-8 py-6 text-right">{language === 'am' ? 'እርምጃ' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {criminalAgencies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-gray-400 text-sm font-medium">
                      {language === 'am' ? 'ምንም የወንጀል ሪፖርት አልተገኘም' : 'No criminal reports submitted yet'}
                    </td>
                  </tr>
                ) : (
                  criminalAgencies.map((org: any) => (
                    <tr key={org.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-6 font-bold text-primary text-sm">
                        {language === 'am' ? (org.nameAmharic || org.nameEnglish) : (org.nameEnglish || org.nameAmharic)}
                      </td>
                      <td className="px-8 py-6 text-sm text-gray-600 font-medium">{org.incidentCount}</td>
                      <td className="px-8 py-6 text-sm text-gray-600">{org.latestReport?.crimeType || '—'}</td>
                      <td className="px-8 py-6">
                        <span
                          style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.15) 0%, rgba(197,160,34,0.15) 100%)', borderColor: '#C5A022' }}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-[#003366] border"
                        >
                          {org.latestReport?.actionTakenStatus || 'Submitted'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-sm text-gray-500">{formatDate(org.createdAt)}</td>
                      <td className="px-8 py-6 text-right">
                        <button
                          onClick={() => handleViewReport(org, 'criminal')}
                          style={{ background: 'linear-gradient(135deg, #FFD700 0%, #C5A022 100%)' }}
                          className="inline-flex items-center gap-2 px-5 py-2.5 text-[#003366] text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow-md hover:opacity-90"
                        >
                          <Eye className="w-4 h-4" />
                          {language === 'am' ? 'ቅድመ እይታ' : 'Preview'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* ── Institution Reports Table (default) ── */
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-8 py-6">{t.hrmsReports.table.agency}</th>
                  <th className="px-8 py-6">{t.hrmsReports.table.totalStaff}</th>
                  <th className="px-8 py-6">{t.hrmsReports.table.trained}</th>
                  <th className="px-8 py-6">{t.hrmsReports.table.deployed}</th>
                  <th className="px-8 py-6">{t.hrmsReports.table.lastUpdate}</th>
                  <th className="px-8 py-6 text-right">{t.hrmsReports.table.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {institutionAgencies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-gray-400 text-sm font-medium">
                      {language === 'am' ? 'ምንም ኤጀንሲዎች አልተገኙም' : 'No agencies found'}
                    </td>
                  </tr>
                ) : (
                  institutionAgencies.map((org: any) => {
                    const total = org._count?.employees ?? org.totalEmployees ?? (org.employees?.length ?? 0);
                    const trained = org._count?.certifications ?? (org.certifications?.length ?? 0);
                    const deployed = Math.floor(total * 0.85);
                    const pct = total > 0 ? Math.round((trained / total) * 100) : 0;
                    return (
                      <tr key={org.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-8 py-6 font-bold text-primary text-sm">
                          {language === 'am' ? (org.nameAmharic || org.nameEnglish) : (org.nameEnglish || org.nameAmharic)}
                        </td>
                        <td className="px-8 py-6 text-sm text-gray-600 font-medium">{total}</td>
                        <td className="px-8 py-6">
                          <div className="flex items-center space-x-2">
                            <div className="flex-grow bg-gray-100 h-2 rounded-full overflow-hidden max-w-[100px]">
                              <div className="bg-green-500 h-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs font-black text-gray-400">{pct}%</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-sm text-gray-600 font-medium">{deployed}</td>
                        <td className="px-8 py-6 text-sm text-gray-500">{formatDate(org.createdAt)}</td>
                        <td className="px-8 py-6 text-right">
                          <button
                            onClick={() => handleViewReport(org, 'institution')}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-sm hover:shadow-md"
                          >
                            <Eye className="w-4 h-4" />
                            {language === 'am' ? 'ቅድመ እይታ' : 'Preview'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedAgency && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-5xl p-10 flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-8 border-b pb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center">
                    <FileBarChart className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-primary uppercase tracking-tighter">
                      {showPdfPreview
                        ? (language === 'am' ? 'የPDF ቅድመ እይታ' : 'PDF Preview')
                        : (language === 'am' ? 'የሪፖርት ቅድመ እይታ' : 'Report Preview')}
                    </h4>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                      {(language === 'am' ? (selectedAgency.nameAmharic || selectedAgency.nameEnglish) : (selectedAgency.nameEnglish || selectedAgency.nameAmharic))}
                    </p>
                  </div>
                </div>
                <button onClick={() => { setSelectedAgency(null); setShowPdfPreview(false); setReportType(null); setShowFeedbackForm(false); if (pdfPreviewUrl) { URL.revokeObjectURL(pdfPreviewUrl); setPdfPreviewUrl(null); } }} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {showPdfPreview && (
                <div className="space-y-6 overflow-y-auto pr-2">
                  <button
                    onClick={() => { setShowPdfPreview(false); setReportType(null); setShowFeedbackForm(false); if (pdfPreviewUrl) { URL.revokeObjectURL(pdfPreviewUrl); setPdfPreviewUrl(null); } }}
                    className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {language === 'am' ? 'ወደ ሪፖርቶች ተመለስ' : 'Back to Reports'}
                  </button>

                  <div className={`rounded-[32px] p-8 space-y-6 ${reportType === 'criminal' ? '' : 'bg-gray-50'}`}
                    style={reportType === 'criminal' ? { background: 'linear-gradient(135deg, rgba(255,215,0,0.10) 0%, rgba(197,160,34,0.10) 100%)', border: '1px solid rgba(197,160,34,0.25)' } : {}}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white rounded-xl shadow-sm">
                          <FileText className={`w-5 h-5 ${reportType === 'criminal' ? 'text-[#C5A022]' : 'text-blue-500'}`} />
                        </div>
                        <div>
                          <h5 className={`font-black text-sm uppercase tracking-tighter ${reportType === 'criminal' ? 'text-[#003366]' : 'text-primary'}`}>
                            {language === 'am' ? 'የPDF ቅድመ እይታ' : 'PDF Preview'}
                          </h5>
                          <p className="text-xs text-gray-400 font-medium">
                            {selectedAgency.nameEnglish || selectedAgency.nameAmharic}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => { if (pdfPreviewUrl) { const a = document.createElement('a'); a.href = pdfPreviewUrl; a.download = `${selectedAgency.nameEnglish || 'report'}.pdf`; a.click(); } }}
                        style={reportType === 'criminal' ? { background: 'linear-gradient(135deg, #FFD700 0%, #C5A022 100%)' } : {}}
                        className={`inline-flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all ${reportType === 'criminal' ? 'text-[#003366] hover:opacity-90' : 'text-primary bg-white border border-gray-100'}`}
                      >
                        <Download className="w-4 h-4" />
                        {language === 'am' ? 'PDF አውርድ' : 'Download PDF'}
                      </button>
                    </div>

                    <div className="bg-gray-100 rounded-2xl shadow-inner border border-gray-200 p-4">
                      {pdfPreviewUrl ? (
                        <iframe
                          src={pdfPreviewUrl}
                          className="w-full h-[500px] rounded-xl bg-white"
                          title={language === 'am' ? 'የPDF ቅድመ እይታ' : 'PDF Preview'}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-64 bg-white rounded-xl">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                      )}
                    </div>
                  </div>

                  {reportType === 'institution' ? (
                    <button
                      onClick={() => alert(language === 'am' ? 'ሪፖርቱ ለተቀባይ ተልኳል' : 'Report sent to receiver')}
                      className="w-full inline-flex items-center justify-center gap-2 text-sm font-bold text-white bg-green-700 px-6 py-3.5 rounded-2xl hover:bg-green-800 transition-all shadow-md hover:shadow-lg"
                    >
                      <Send className="w-4 h-4" />
                      {language === 'am' ? 'ወደ ሪፖርት ተቀባይ ይላኩ' : 'Send to Report Receiver'}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                        className="w-full inline-flex items-center justify-center gap-2 text-sm font-bold text-white bg-primary px-6 py-3.5 rounded-2xl hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
                      >
                        <MessageSquare className="w-4 h-4" />
                        {language === 'am' ? 'ግብረ መልስ ይስጡ' : 'Give Feedback'}
                        <ChevronRight className={`w-4 h-4 transition-transform ${showFeedbackForm ? 'rotate-90' : ''}`} />
                      </button>

                      {showFeedbackForm && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gray-50 rounded-[32px] p-8 space-y-6"
                        >
                          <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                            <div className="p-2.5 bg-white rounded-xl shadow-sm">
                              <PenTool className="w-5 h-5 text-primary" />
                            </div>
                            <h5 className="font-black text-primary text-sm uppercase tracking-tighter">
                              {language === 'am' ? 'የግብረ መልስ ቅጽ' : 'Feedback Form'}
                            </h5>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                              <label className="text-[11px] uppercase tracking-[0.15em] font-bold text-primary mb-1.5 block">
                                {language === 'am' ? 'ሙሉ ስም' : 'Full Name'} <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                  type="text"
                                  value={feedbackName}
                                  onChange={e => setFeedbackName(e.target.value)}
                                  placeholder={language === 'am' ? 'ሙሉ ስም ያስገቡ...' : 'Enter full name...'}
                                  className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all bg-white"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-[11px] uppercase tracking-[0.15em] font-bold text-primary mb-1.5 block">
                                {language === 'am' ? 'ማዕረግ' : 'Title'} <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={feedbackTitle}
                                onChange={e => setFeedbackTitle(e.target.value)}
                                placeholder={language === 'am' ? 'ማዕረግ ያስገቡ...' : 'Enter title...'}
                                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all bg-white"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] uppercase tracking-[0.15em] font-bold text-primary mb-1.5 block">
                                {language === 'am' ? 'የስራ ሃላፊነት' : 'Job Title Responsibility'} <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={feedbackJobTitle}
                                onChange={e => setFeedbackJobTitle(e.target.value)}
                                placeholder={language === 'am' ? 'የስራ ሃላፊነት ያስገቡ...' : 'Enter job responsibility...'}
                                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all bg-white"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] uppercase tracking-[0.15em] font-bold text-primary mb-1.5 block">
                                {language === 'am' ? 'ቀን' : 'Date'} <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="date"
                                value={feedbackDate}
                                onChange={e => setFeedbackDate(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all bg-white"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="text-[11px] uppercase tracking-[0.15em] font-bold text-primary mb-1.5 block">
                                {language === 'am' ? 'ፊርማ' : 'Signature'} <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/webp"
                                ref={sigInputRef}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) { setFeedbackSignature(''); return; }
                                  const reader = new FileReader();
                                  reader.onload = (ev) => setFeedbackSignature(ev.target?.result as string || '');
                                  reader.readAsDataURL(file);
                                }}
                                hidden
                              />
                              {!feedbackSignature ? (
                                <button
                                  type="button"
                                  onClick={() => sigInputRef.current?.click()}
                                  className="w-full p-6 rounded-2xl border-2 border-dashed border-gray-200 bg-white/50 hover:border-primary/40 hover:bg-primary/5 transition-all flex flex-col items-center gap-2"
                                >
                                  <PenTool className="w-6 h-6 text-gray-300" />
                                  <span className="text-xs font-semibold text-gray-500">
                                    {language === 'am' ? 'የፊርማ ምስል ይስቀሉ' : 'Upload Signature Image'}
                                  </span>
                                </button>
                              ) : (
                                <div className="flex items-center gap-4">
                                  <div className="p-3 rounded-xl border border-green-200 bg-green-50">
                                    <img src={feedbackSignature} alt="Signature" className="h-12 object-contain" />
                                  </div>
                                  <button
                                    onClick={() => { setFeedbackSignature(''); if (sigInputRef.current) sigInputRef.current.value = ''; }}
                                    className="text-xs font-bold text-red-600 hover:underline"
                                  >
                                    {language === 'am' ? 'አስወግድ' : 'Remove'}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-end pt-4 border-t border-gray-200">
                            <button className="inline-flex items-center gap-2 text-sm font-bold text-white bg-primary px-8 py-3 rounded-xl hover:bg-primary/90 transition-all shadow-md hover:shadow-lg">
                              <Send className="w-4 h-4" />
                              {language === 'am' ? 'ግብረ መልስ ይላኩ' : 'Submit Feedback'}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
