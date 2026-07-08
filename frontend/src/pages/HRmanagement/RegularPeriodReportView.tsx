//filepath: frontend/src/pages/HRmanagement/RegularPeriodReportView.tsx
import { useEffect, useState } from "react";
import {
  Calendar,
  ShieldCheck,
  UserCircle,
  Clock,
  AlertCircle,
  Pencil,
  X,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { apiRequest } from "../../lib/api";

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
  superiorName?: string | null;
  superiorTitle?: string | null;
  superiorSignatureUrl?: string | null;
  superiorFeedbackText?: string | null;
  superiorSignDate?: string | Date | null;
}

interface RegularPeriodReportViewProps {
  report: ReportData;
  onBack?: () => void;
}

export default function RegularPeriodReportView({
  report,
}: RegularPeriodReportViewProps) {
  const [isOfficerModalOpen, setIsOfficerModalOpen] = useState(false);
  const [isSuperiorModalOpen, setIsSuperiorModalOpen] = useState(false);
  const [officerReview, setOfficerReview] = useState({
    name: report.efpOfficerName ?? "",
    title: report.efpOfficerTitle ?? "",
    signatureUrl: report.efpOfficerSignatureUrl ?? "",
    signDate: report.efpSignDate
      ? new Date(report.efpSignDate).toISOString().split("T")[0]
      : "",
  });
  const [superiorReview, setSuperiorReview] = useState({
    name: report.superior?.name ?? report.superiorName ?? "",
    title: report.superior?.title ?? report.superiorTitle ?? "",
    signatureUrl:
      report.superior?.signatureUrl ?? report.superiorSignatureUrl ?? "",
    feedbackText: report.superiorFeedbackText ?? "",
    signDate: report.superiorSignDate
      ? new Date(report.superiorSignDate).toISOString().split("T")[0]
      : "",
  });
  const [officerSignatureFileName, setOfficerSignatureFileName] = useState("");
  const [superiorSignatureFileName, setSuperiorSignatureFileName] =
    useState("");
  const [officerSignatureFile, setOfficerSignatureFile] = useState<File | null>(
    null,
  );
  const [superiorSignatureFile, setSuperiorSignatureFile] =
    useState<File | null>(null);
  const [isSavingOfficer, setIsSavingOfficer] = useState(false);
  const [isSavingSuperior, setIsSavingSuperior] = useState(false);

  const { language } = useLanguage();
  const isAm = language === "am";
  const t = (en: string, am: string) => (isAm ? am : en);

  // Date formatter
  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "Pending";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatInputDate = (date: string | Date | null | undefined) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  // Helper to get nice labels for the period enum
  const formatPeriod = (period: string) => {
    return period.replace(/_/g, " ").toUpperCase();
  };

  useEffect(() => {
    setOfficerReview({
      name: report.efpOfficerName ?? "",
      title: report.efpOfficerTitle ?? "",
      signatureUrl: report.efpOfficerSignatureUrl ?? "",
      signDate: formatInputDate(report.efpSignDate),
    });
    setSuperiorReview({
      name: report.superior?.name ?? report.superiorName ?? "",
      title: report.superior?.title ?? report.superiorTitle ?? "",
      signatureUrl:
        report.superior?.signatureUrl ?? report.superiorSignatureUrl ?? "",
      feedbackText: report.superiorFeedbackText ?? "",
      signDate: formatInputDate(report.superiorSignDate),
    });
    setOfficerSignatureFileName(
      report.efpOfficerSignatureUrl ? "Current signature" : "",
    );
    setSuperiorSignatureFileName(
      report.superior?.signatureUrl || report.superiorSignatureUrl
        ? "Current signature"
        : "",
    );
    setOfficerSignatureFile(null);
    setSuperiorSignatureFile(null);
  }, [report]);

  const buildReviewFormData = (
    reviewType: "officer" | "superior",
    review: typeof officerReview | typeof superiorReview,
    signatureFile: File | null,
  ) => {
    const formData = new FormData();
    formData.append("reviewType", reviewType);

    if (reviewType === "officer") {
      formData.append("efpOfficerName", review.name || "");
      formData.append("efpOfficerTitle", review.title || "");
      if (review.signDate) {
        formData.append("signDate", review.signDate);
      }
      if (signatureFile) {
        formData.append("efpOfficerSignature", signatureFile);
      } else if (
        review.signatureUrl &&
        !review.signatureUrl.startsWith("blob:")
      ) {
        formData.append("efpOfficerSignatureUrl", review.signatureUrl);
      }
    } else {
      const superiorReviewData = review as typeof superiorReview;
      formData.append("superiorName", superiorReviewData.name || "");
      formData.append("superiorTitle", superiorReviewData.title || "");
      formData.append("feedbackText", superiorReviewData.feedbackText || "");
      if (review.signDate) {
        formData.append("signDate", review.signDate);
      }
      if (signatureFile) {
        formData.append("superiorSignature", signatureFile);
      } else if (
        review.signatureUrl &&
        !review.signatureUrl.startsWith("blob:")
      ) {
        formData.append("superiorSignatureUrl", review.signatureUrl);
      }
    }

    return formData;
  };

  const handleSaveReview = async (reviewType: "officer" | "superior") => {
    try {
      const review = reviewType === "officer" ? officerReview : superiorReview;
      const signatureFile =
        reviewType === "officer" ? officerSignatureFile : superiorSignatureFile;

      if (reviewType === "officer") {
        setIsSavingOfficer(true);
      } else {
        setIsSavingSuperior(true);
      }
      const response = await apiRequest<{
        success: boolean;
        data: any;
        message: string;
      }>(`/reports/${report.id}/review`, {
        method: "PUT",
        body: buildReviewFormData(reviewType, review, signatureFile),
      });

      const updated = response.data;

      if (reviewType === "officer") {
        setOfficerReview((prev) => ({
          ...prev,
          name: updated?.efpOfficerName ?? prev.name,
          title: updated?.efpOfficerTitle ?? prev.title,
          signatureUrl: updated?.efpOfficerSignatureUrl ?? prev.signatureUrl,
          signDate: updated?.efpSignDate
            ? formatInputDate(updated.efpSignDate)
            : prev.signDate,
        }));
        setOfficerSignatureFileName(
          updated?.efpOfficerSignatureUrl ? "Current signature" : "",
        );
        setOfficerSignatureFile(null);
        setIsOfficerModalOpen(false);
      } else {
        setSuperiorReview((prev) => ({
          ...prev,
          name: updated?.superiorName ?? prev.name,
          title: updated?.superiorTitle ?? prev.title,
          signatureUrl: updated?.superiorSignatureUrl ?? prev.signatureUrl,
          feedbackText: updated?.superiorFeedbackText ?? prev.feedbackText,
          signDate: updated?.superiorSignDate
            ? formatInputDate(updated.superiorSignDate)
            : prev.signDate,
        }));
        setSuperiorSignatureFileName(
          updated?.superiorSignatureUrl ? "Current signature" : "",
        );
        setSuperiorSignatureFile(null);
        setIsSuperiorModalOpen(false);
      }
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsSavingOfficer(false);
      setIsSavingSuperior(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 py-6">
        <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-[1480px] flex-col gap-6 px-2 sm:px-3 lg:px-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                  {report.reportTitle}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
                    <Calendar className="h-4 w-4 text-indigo-500" />
                    {t("Filed:", "የተገጠመ፡")} {formatDate(report.reportDate)}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
                    <Clock className="h-4 w-4 text-emerald-500" />
                    {t("Period:", "ጊዜ፡")} {formatPeriod(report.reportingPeriod)}
                  </span>
                  {report.organization && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
                      <ShieldCheck className="h-4 w-4 text-blue-500" />
                      {report.organization.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 xl:w-auto">
                <div className="rounded-3xl bg-slate-50 p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                    Reporter
                  </p>
                  <p className="mt-3 text-base font-semibold text-slate-900">
                    {report.reporterName}
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                    Period
                  </p>
                  <p className="mt-3 text-base font-semibold text-slate-900">
                    {formatPeriod(report.reportingPeriod)}
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                    Status
                  </p>
                  <p className="mt-3 text-base font-semibold text-slate-900">
                    {report.efpSignDate ? "Officer signed" : "Pending review"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid flex-1 min-w-0 gap-6 xl:grid-cols-[1.06fr_1fr]">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              <div className="min-w-0 rounded-[1.75rem] border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
                <div className="mb-5">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                    {t("1. Submitted By (Agency)", "1. በድርጅቱ የተላከ")}
                  </h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-slate-500">
                      {t("Reporter Full Name", "የሪፖርት ተወካይ ሙሉ ስም")}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {report.reporterName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">{t("Title", "ሽም")}</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {report.reporterTitle}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">
                    {t("Job Responsibility", "የሥራ ሀላፊነት")}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">
                    {report.reporterJobResp}
                  </p>
                </div>

                {report.reporterSignatureUrl && (
                  <div className="mt-5 rounded-3xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">
                      {t("Signature", "ፊርማ")}
                    </p>
                    <div className="mt-3 rounded-3xl bg-white p-4 shadow-sm">
                      <img
                        src={report.reporterSignatureUrl}
                        alt="Reporter Signature"
                        className="h-14 w-auto object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="min-w-0 rounded-[1.75rem] border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                    {t("2. EFP Officer Review", "2. የEFP ኦፊሰር ምርመራ")}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsOfficerModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-700"
                  >
                    <Pencil className="h-4 w-4" />
                    {t("Edit", "አርትዕ")}
                  </button>
                </div>

                {officerReview.name ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-500">
                        {t("Name", "ስም")}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">
                        {officerReview.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">
                        {t("Title", "ሽም")}
                      </p>
                      <p className="mt-2 text-base text-slate-700">
                        {officerReview.title}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:items-center">
                      <span>{t("Reviewed:", "ተገምግሟል፡")}</span>
                      <span className="font-medium text-slate-900">
                        {formatDate(officerReview.signDate)}
                      </span>
                    </div>
                    {officerReview.signatureUrl && (
                      <div className="mt-3 rounded-3xl bg-slate-50 p-4">
                        <img
                          src={officerReview.signatureUrl}
                          alt="Officer Signature"
                          className="h-12 w-auto object-contain"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    <AlertCircle className="mb-2 h-5 w-5 text-amber-600" />
                    {t("Pending Officer Review", "የኦፊሰር ምርመራ በመጠባበቅ ላይ")}
                  </div>
                )}
              </div>

              <div className="min-w-0 rounded-[1.75rem] border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                    {t("3. Superior Endorsement", "3. የከፍተኛ እገዛ")}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsSuperiorModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-700"
                  >
                    <Pencil className="h-4 w-4" />
                    {t("Edit", "አርትዕ")}
                  </button>
                </div>

                {superiorReview.feedbackText && (
                  <div className="mb-4 rounded-3xl bg-indigo-50 p-4 text-sm text-indigo-900">
                    <p className="font-semibold text-indigo-800">
                      {t("Commander Directives", "የአለቃ ትእዛዞች")}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed">
                      {superiorReview.feedbackText}
                    </p>
                  </div>
                )}

                {superiorReview.name ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-500">
                        {t("Name", "ስም")}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">
                        {superiorReview.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">
                        {t("Title", "ሽም")}
                      </p>
                      <p className="mt-2 text-base text-slate-700">
                        {superiorReview.title}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:items-center">
                      <span>{t("Endorsed:", "የተደረገ፡")}</span>
                      <span className="font-medium text-slate-900">
                        {formatDate(superiorReview.signDate)}
                      </span>
                    </div>
                    {superiorReview.signatureUrl && (
                      <div className="mt-3 rounded-3xl bg-slate-50 p-4">
                        <img
                          src={superiorReview.signatureUrl}
                          alt="Superior Signature"
                          className="h-12 w-auto object-contain"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    <UserCircle className="mb-2 h-5 w-5 text-slate-500" />
                    {t("Awaiting Superior Assignment", "የከፍተኛ መረጃ ተጠባብቋል")}
                  </div>
                )}
              </div>
            </div>
          </div>

          {isOfficerModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4">
              <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-800">
                    {t("Edit EFP Officer Review", "የEFP ኦፊሰር ምርመራ አርትዕ")}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsOfficerModalOpen(false)}
                    className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      {t("Officer Name", "የኦፊሰር ስም")}
                    </label>
                    <input
                      value={officerReview.name}
                      onChange={(e) =>
                        setOfficerReview((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Title
                    </label>
                    <input
                      value={officerReview.title}
                      onChange={(e) =>
                        setOfficerReview((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      {t("Signature Upload", "ፊርማ ማስገባት")}
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setOfficerSignatureFile(file);
                          setOfficerSignatureFileName(file.name);
                          setOfficerReview((prev) => ({
                            ...prev,
                            signatureUrl: URL.createObjectURL(file),
                          }));
                        }
                      }}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                    />
                    {officerSignatureFileName && (
                      <p className="mt-1 text-xs text-slate-500">
                        Selected file: {officerSignatureFileName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      {t("Review Date", "የምርመራ ቀን")}
                    </label>
                    <input
                      type="date"
                      value={officerReview.signDate}
                      onChange={(e) =>
                        setOfficerReview((prev) => ({
                          ...prev,
                          signDate: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOfficerModalOpen(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                  >
                    {t("Cancel", "ሰርዝ")}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveReview("officer")}
                    disabled={isSavingOfficer}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
                  >
                    {isSavingOfficer
                      ? t("Saving...", "በማስቀመጥ ላይ...")
                      : t("Save", "አስቀምጥ")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {isSuperiorModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4">
              <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Edit Superior Endorsement
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsSuperiorModalOpen(false)}
                    className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Superior Name
                    </label>
                    <input
                      value={superiorReview.name}
                      onChange={(e) =>
                        setSuperiorReview((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Title
                    </label>
                    <input
                      value={superiorReview.title}
                      onChange={(e) =>
                        setSuperiorReview((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Signature Upload
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSuperiorSignatureFile(file);
                          setSuperiorSignatureFileName(file.name);
                          setSuperiorReview((prev) => ({
                            ...prev,
                            signatureUrl: URL.createObjectURL(file),
                          }));
                        }
                      }}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                    />
                    {superiorSignatureFileName && (
                      <p className="mt-1 text-xs text-slate-500">
                        Selected file: {superiorSignatureFileName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      {t("Feedback", "አስተያየት")}
                    </label>
                    <textarea
                      value={superiorReview.feedbackText}
                      onChange={(e) =>
                        setSuperiorReview((prev) => ({
                          ...prev,
                          feedbackText: e.target.value,
                        }))
                      }
                      rows={4}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      {t("Endorsement Date", "የእገዛ ቀን")}
                    </label>
                    <input
                      type="date"
                      value={superiorReview.signDate}
                      onChange={(e) =>
                        setSuperiorReview((prev) => ({
                          ...prev,
                          signDate: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSuperiorModalOpen(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                  >
                    {t("Cancel", "ሰርዝ")}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveReview("superior")}
                    disabled={isSavingSuperior}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
                  >
                    {isSavingSuperior
                      ? t("Saving...", "በማስቀመጥ ላይ...")
                      : t("Save", "አስቀምጥ")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
