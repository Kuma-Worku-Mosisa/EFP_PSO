import React, { useState, useEffect, useRef } from 'react';
import { Search, Users, User, FileBarChart, Download, Eye, X, FileText, Award, Loader2, TrendingUp, ShieldAlert, Building2, ChevronRight, MessageSquare, PenTool, ArrowLeft, Send } from 'lucide-react';
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
          if (orgs.length > 0) {
            setAgencies(orgs);
          } else {
            setAgencies(getMockAgencies());
          }
        }
      } catch (err: any) {
        if (mounted) {
          setAgencies(getMockAgencies());
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchAgencies();
    return () => { mounted = false; };
  }, []);

  const getMockAgencies = () => [
    { id: 1, nameEnglish: 'Alpha Security PLC', nameAmharic: 'አልፋ ሴኪዩሪቲ ፕላስ', _count: { employees: 145, certifications: 98 }, createdAt: '2024-01-15T10:00:00Z' },
    { id: 2, nameEnglish: 'Beta Guard Services', nameAmharic: 'ቤታ ጋርድ አገልግሎቶች', _count: { employees: 87, certifications: 62 }, createdAt: '2024-02-20T10:00:00Z' },
    { id: 3, nameEnglish: 'Gamma Protection Ltd', nameAmharic: 'ጋማ ፕሮቴክሽን ኃላፊነቱ የተወሰነ', _count: { employees: 210, certifications: 175 }, createdAt: '2024-03-10T10:00:00Z' },
    { id: 4, nameEnglish: 'Delta Secure Solutions', nameAmharic: 'ዴልታ ሴኪዩር ሶሉሽንስ', _count: { employees: 53, certifications: 41 }, createdAt: '2024-04-05T10:00:00Z' },
    { id: 5, nameEnglish: 'Epsilon Watch Corp', nameAmharic: 'ኤፕሲሎን ዋች ኮርፖሬሽን', _count: { employees: 312, certifications: 280 }, createdAt: '2024-05-12T10:00:00Z' },
  ];

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

  const generatePdfUrl = (agency: any, type: 'institution' | 'criminal') => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = margin;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(type === 'institution' ? 'INSTITUTION REPORT' : 'CRIMINAL INCIDENT REPORT', margin, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${agency.nameEnglish || agency.nameAmharic} - 2024-03-15`, margin, y);
    y += 8;

    const addSection = (title: string) => {
      y += 4;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(title, margin, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
    };

    const addRow = (label: string, value: string) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label + ':', margin, y);
      doc.setFont('helvetica', 'normal');
      const labelW = doc.getTextWidth(label + ':  ');
      doc.text(value, margin + labelW, y);
      y += 5;
    };

    addSection('1. Organization Details');
    addRow('Name', agency.nameEnglish || agency.nameAmharic);
    addRow('TIN Number', '100-234-5678');
    addRow('Phone', '+251-11-123-4567');
    addRow('Email', `info@${(agency.nameEnglish || 'agency').toLowerCase().replace(/\s+/g, '')}.com`);
    addRow('Address', 'Bole Road, Addis Ababa');

    addSection('2. Employee Statistics');
    addRow('Total Employees', String(agency._count?.employees || 0));
    addRow('Active', String(Math.floor((agency._count?.employees || 0) * 0.65)));
    addRow('Male', String(Math.floor((agency._count?.employees || 0) * 0.7)));
    addRow('Female', String(Math.floor((agency._count?.employees || 0) * 0.3)));
    addRow('Trained', String(agency._count?.certifications || 0));

    addSection('3. Assets & Infrastructure');
    addRow('Offices', '5');
    addRow('Vehicles', '12');
    addRow('Computers', '25');
    addRow('Store House', 'Yes');

    y = Math.max(y + 10, pageW - 10);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('This is a computer-generated report | Generated on: 2024-03-15 | Page 1/1', margin, y);

    const blob = doc.output('blob');
    return URL.createObjectURL(blob);
  };

  const handleViewReport = (agency: any, type: 'institution' | 'criminal') => {
    if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
    const url = generatePdfUrl(agency, type);
    setPdfPreviewUrl(url);
    setReportType(type);
    setShowPdfPreview(true);
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

      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
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
        ) : (
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
                {agencies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-gray-400 text-sm font-medium">
                      {language === 'am' ? 'ምንም ኤጀንሲዎች አልተገኙም' : 'No agencies found'}
                    </td>
                  </tr>
                ) : (
                  agencies.map((org: any) => {
                    const total = org._count?.employees ?? (org.employees?.length ?? 0);
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
                            onClick={() => setSelectedAgency(org)}
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

              {!showPdfPreview ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto pr-2">
                  <motion.button
                    whileHover={{ y: -4, scale: 1.01 }}
                    onClick={() => handleViewReport(selectedAgency, 'institution')}
                    className="bg-gray-50 rounded-[32px] p-8 text-left space-y-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-primary/10 text-center flex flex-col items-center"
                  >
                    <div className="p-5 bg-white rounded-3xl shadow-sm">
                      <Building2 className="w-10 h-10 text-blue-600" />
                    </div>
                    <div>
                      <h5 className="text-xl font-black text-primary uppercase tracking-tighter">
                        {language === 'am' ? 'ከተቋም ሪፖርቶች' : 'Reports from the Institution'}
                      </h5>
                      <p className="text-xs text-gray-400 font-medium mt-1">
                        {language === 'am' ? 'ሪፖርቱን ለማየት ይጫኑ' : 'Click to view reports'}
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 text-xs font-bold text-primary bg-white px-6 py-3 rounded-xl shadow-sm">
                      <Eye className="w-4 h-4" />
                      {language === 'am' ? 'ይመልከቱ' : 'View Reports'}
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ y: -4, scale: 1.01 }}
                    onClick={() => handleViewReport(selectedAgency, 'criminal')}
                    className="bg-gray-50 rounded-[32px] p-8 text-left space-y-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-primary/10 text-center flex flex-col items-center"
                  >
                    <div className="p-5 bg-white rounded-3xl shadow-sm">
                      <ShieldAlert className="w-10 h-10 text-red-600" />
                    </div>
                    <div>
                      <h5 className="text-xl font-black text-primary uppercase tracking-tighter">
                        {language === 'am' ? 'የወንጀል ሪፖርት' : 'Report of Criminal'}
                      </h5>
                      <p className="text-xs text-gray-400 font-medium mt-1">
                        {language === 'am' ? 'ሪፖርቱን ለማየት ይጫኑ' : 'Click to view reports'}
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 text-xs font-bold text-primary bg-white px-6 py-3 rounded-xl shadow-sm">
                      <Eye className="w-4 h-4" />
                      {language === 'am' ? 'ይመልከቱ' : 'View Reports'}
                    </div>
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-6 overflow-y-auto pr-2">
                  {/* Back button */}
                  <button
                    onClick={() => { setShowPdfPreview(false); setReportType(null); setShowFeedbackForm(false); if (pdfPreviewUrl) { URL.revokeObjectURL(pdfPreviewUrl); setPdfPreviewUrl(null); } }}
                    className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {language === 'am' ? 'ወደ ሪፖርቶች ተመለስ' : 'Back to Reports'}
                  </button>

                  {/* iframe PDF Preview */}
                  <div className="bg-gray-50 rounded-[32px] p-8 space-y-6">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white rounded-xl shadow-sm">
                          <FileText className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <h5 className="font-black text-primary text-sm uppercase tracking-tighter">
                            {language === 'am' ? 'የPDF ቅድመ እይታ' : 'PDF Preview'}
                          </h5>
                          <p className="text-xs text-gray-400 font-medium">
                            {selectedAgency.nameEnglish || selectedAgency.nameAmharic}
                          </p>
                        </div>
                      </div>
                      <button onClick={() => { if (pdfPreviewUrl) { const a = document.createElement('a'); a.href = pdfPreviewUrl; a.download = `${selectedAgency.nameEnglish || 'report'}.pdf`; a.click(); } }} className="inline-flex items-center gap-2 text-xs font-bold text-primary bg-white px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100">
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
