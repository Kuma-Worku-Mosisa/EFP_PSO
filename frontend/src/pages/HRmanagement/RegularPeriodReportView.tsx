//filepath: frontend/src/pages/HRmanagement/RegularPeriodReportView.tsx
import {
  Calendar,
  ShieldCheck,
  UserCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import DocumentPreviewer from "../../components/DocumentPreviewer"; // Your reusable component

// Types based on your Prisma Schema
interface ReportData {
  id: number;
  reportTitle: string;
  reportDate: string | Date;
  reportingPeriod: string;
  reportFileUrl: string;
  organization?: { name: string };

  // Reporter
  reporterName: string;
  reporterTitle: string;
  reporterJobResp: string;
  reporterSignatureUrl: string;

  // EFP Officer
  efpOfficerName?: string | null;
  efpOfficerTitle?: string | null;
  efpOfficerSignatureUrl?: string | null;
  efpSignDate?: string | Date | null;

  // Superior (Joined from User relation)
  superior?: {
    name: string;
    title: string;
    signatureUrl?: string;
  } | null;
  superiorFeedbackText?: string | null;
  superiorSignDate?: string | Date | null;
}

interface RegularPeriodReportViewProps {
  report: ReportData;
}

export default function RegularPeriodReportView({
  report,
}: RegularPeriodReportViewProps) {
  // Date formatter
  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "Pending";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helper to get nice labels for the period enum
  const formatPeriod = (period: string) => {
    return period.replace(/_/g, " ").toUpperCase();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-h-screen bg-slate-50 p-4 lg:p-6 overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 shrink-0 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            {report.reportTitle}
          </h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-500" />
              Filed: {formatDate(report.reportDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-500" />
              Period: {formatPeriod(report.reportingPeriod)}
            </span>
            {report.organization && (
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-500" />
                {report.organization.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0 overflow-hidden">
        {/* Left Column: Metadata & Signature Workflow (Scrollable) */}
        <div className="w-full lg:w-1/3 flex flex-col gap-5 overflow-y-auto pr-2 pb-10">
          {/* Section 1: Agency Reporter */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
              1. Submitted By (Agency)
            </h2>
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-slate-800 text-lg">
                {report.reporterName}
              </span>
              <span className="text-sm text-slate-600 font-medium">
                {report.reporterTitle}
              </span>
              <span className="text-xs text-slate-500 mb-4">
                {report.reporterJobResp}
              </span>
              {report.reporterSignatureUrl && (
                <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-100 inline-block">
                  <img
                    src={report.reporterSignatureUrl}
                    alt="Reporter Signature"
                    className="h-12 object-contain mix-blend-multiply"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 2: EFP Officer Review */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex justify-between items-center">
              2. EFP Officer Review
              {report.efpSignDate ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <Clock className="w-4 h-4 text-amber-500" />
              )}
            </h2>
            {report.efpOfficerName ? (
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-slate-800">
                  {report.efpOfficerName}
                </span>
                <span className="text-sm text-slate-600">
                  {report.efpOfficerTitle}
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  Reviewed: {formatDate(report.efpSignDate)}
                </span>
                {report.efpOfficerSignatureUrl && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100 inline-block">
                    <img
                      src={report.efpOfficerSignatureUrl}
                      alt="Officer Signature"
                      className="h-10 object-contain mix-blend-multiply"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4" />
                Pending Officer Review
              </div>
            )}
          </div>

          {/* Section 3: Superior High-Command Endorsement */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex justify-between items-center">
              3. Superior Endorsement
              {report.superiorSignDate ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <Clock className="w-4 h-4 text-amber-500" />
              )}
            </h2>

            {/* Feedback Box */}
            {report.superiorFeedbackText && (
              <div className="mb-4 bg-indigo-50 border-l-4 border-indigo-500 p-3 rounded-r-lg">
                <span className="block text-xs font-bold text-indigo-800 mb-1">
                  Commander Directives:
                </span>
                <p className="text-sm text-indigo-900 leading-relaxed">
                  {report.superiorFeedbackText}
                </p>
              </div>
            )}

            {report.superior ? (
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-slate-800">
                  {report.superior.name}
                </span>
                <span className="text-sm text-slate-600">
                  {report.superior.title}
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  Endorsed: {formatDate(report.superiorSignDate)}
                </span>
                {report.superior.signatureUrl && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100 inline-block">
                    <img
                      src={report.superior.signatureUrl}
                      alt="Superior Signature"
                      className="h-10 object-contain mix-blend-multiply"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-500 bg-slate-50 border border-slate-100 p-3 rounded-lg text-sm">
                <UserCircle className="w-4 h-4" />
                Awaiting Superior Assignment
              </div>
            )}
          </div>
        </div>

        {/* Right Column: PDF Previewer Container */}
        <div className="w-full lg:w-2/3 h-full min-h-[500px] flex flex-col">
          <DocumentPreviewer
            url={report.reportFileUrl}
            fileName={`${report.reportTitle} - Official Document.pdf`}
            fileType="pdf"
            className="w-full h-full shadow-md"
          />
        </div>
      </div>
    </div>
  );
}
