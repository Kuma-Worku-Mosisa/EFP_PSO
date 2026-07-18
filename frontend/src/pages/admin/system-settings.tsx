import React, { useState, useEffect } from "react";
import {
  Loader2,
  Upload,
  Trash2,
  Save,
  Eye,
  CheckCircle2,
  AlertCircle,
  Settings as SettingsIcon,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { apiRequest } from "../../lib/api";

export default function SystemSettings() {
  const { language } = useLanguage();
  const isAm = language === "am";

  const [formData, setFormData] = useState({
    governmentName: "",
    issuingAuthority: "",
    efpLogoUrl: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const result: any = await apiRequest("/system-settings");
        if (result.success) {
          setFormData({
            governmentName: result.data.governmentName,
            issuingAuthority: result.data.issuingAuthority,
            efpLogoUrl: result.data.efpLogoUrl,
          });
        }
      } catch {
        setNotification({
          type: "error",
          text: isAm
            ? "ከሰርቨር ጋር መገናኘት አልተሳካም።"
            : "Failed to connect to the server.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.append("efp_logo", file);
      const j: any = await apiRequest("/system-settings/upload", {
        method: "POST",
        body: fd,
      });
      if (j.success && j.url) {
        setFormData((prev) => ({ ...prev, efpLogoUrl: j.url }));
        setNotification({
          type: "success",
          text: isAm
            ? "ሎጎ ተሰቅሏል (ተቆጥቧል)። ለማስቀመጥ ያስቀምጡ።"
            : "Logo uploaded (staged). Save to persist.",
        });
      } else {
        setNotification({
          type: "error",
          text: j.message || (isAm ? "ሰቀላ አልተሳካም።" : "Upload failed."),
        });
      }
    } catch {
      setNotification({
        type: "error",
        text: isAm ? "የኔትወርክ ስህተት ተከስቷል።" : "Upload network error.",
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, efpLogoUrl: "" }));
    setNotification({
      type: "success",
      text: isAm ? "ሎጎ ተወግዷል።" : "Staged logo cleared.",
    });
    setTimeout(() => setNotification(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setNotification(null);
    try {
      const result: any = await apiRequest("/system-settings", {
        method: "PUT",
        body: JSON.stringify(formData),
      });
      if (result.success) {
        setNotification({
          type: "success",
          text: isAm
            ? "የስርዓት ቅንብሮች በተሳካ ሁኔታ ተዘምነዋል።"
            : "System settings updated successfully.",
        });
        if (result.data) {
          setFormData((prev) => ({
            ...prev,
            governmentName: result.data.governmentName || prev.governmentName,
            issuingAuthority:
              result.data.issuingAuthority || prev.issuingAuthority,
            efpLogoUrl: result.data.efpLogoUrl || prev.efpLogoUrl,
          }));
        }
      } else {
        setNotification({
          type: "error",
          text: result.message || (isAm ? "ዝማኔ አልተሳካም።" : "Update failed."),
        });
      }
    } catch {
      setNotification({
        type: "error",
        text: isAm ? "የኔትወርክ ስህተት ተከስቷል።" : "A network error occurred.",
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#003366]" />
          <p className="text-sm text-gray-500 font-medium">
            {isAm ? "የውቅር ሞተር በመጫን ላይ..." : "Loading Configuration Engine..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-[#003366] flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-[#003366]" />
            {isAm ? "የስርዓት ውቅሮች" : "System Configurations"}
          </h2>
          <p className="text-sm text-gray-500">
            {isAm
              ? "ለፌዴራል ፖሊስ ዳሽቦርድ ዓለም አቀፍ የማንነት ተለዋዋጮችን ያስተዳድሩ።"
              : "Manage global identity variables for the Federal Police dashboard."}
          </p>
        </div>
      </div>

      {notification && (
        <div
          className={`flex items-center gap-2 p-4 rounded-2xl text-sm font-bold shadow-sm border ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-rose-50 text-rose-700 border-rose-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          {notification.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-[#003366] border-b border-gray-100 pb-3">
            {isAm ? "የማንነት ማትሪክስ" : "Identity Matrix"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                {isAm ? "የመንግስት ቅርንጫፍ ስም" : "Government Branch Name"}
              </label>
              <input
                type="text"
                name="governmentName"
                value={formData.governmentName}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                {isAm
                  ? "የሰጪ ባለስልጣን / ዳይሬክቶሬት"
                  : "Issuing Authority / Directorate"}
              </label>
              <input
                type="text"
                name="issuingAuthority"
                value={formData.issuingAuthority}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                {isAm ? "የኢ.ፌ.ፖ. ሎጎ" : "Official EFP Logo"}
              </label>
              <div className="flex items-start gap-4">
                <div className="w-28 h-28 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 shrink-0">
                  <img
                    src={
                      formData.efpLogoUrl ||
                      "https://via.placeholder.com/112?text=LOGO"
                    }
                    alt="EFP Logo"
                    className="w-full h-full object-contain"
                    onError={(e) =>
                      (e.currentTarget.src =
                        "https://via.placeholder.com/112?text=LOGO")
                    }
                  />
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 cursor-pointer hover:bg-gray-50 hover:border-[#003366]/30 transition-all shadow-sm">
                      <Upload className="w-4 h-4" />
                      {isAm ? "ሎጎ ስቀል" : "Upload Logo"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>

                    {formData.efpLogoUrl ? (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-sm font-bold hover:bg-rose-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                        {isAm ? "አስወግድ" : "Remove"}
                      </button>
                    ) : (
                      <span className="text-sm text-gray-400 font-medium">
                        {isAm ? "ሎጎ አልተሰቀለም" : "No logo staged"}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-400">
                    {isAm
                      ? "የሚመከሩ ቅርፀቶች: PNG, JPG, SVG። ሎጎው ካሬ ቅርፅ ያለው እንዲሆን ያድርጉ። ሰቅለው ያስቀምጡ።"
                      : 'Recommended formats: PNG, JPG, SVG. Keep logo square for best results. Upload stages the file; click "Save Configuration" to persist.'}
                  </p>

                  {isSaving && (
                    <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />{" "}
                      {isAm ? "በመስቀል ላይ..." : "Uploading..."}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#003366] text-white rounded-xl font-bold shadow-lg shadow-[#003366]/20 hover:bg-[#002244] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {isSaving
                  ? isAm
                    ? "ሰርቨሮችን በማመሳሰል ላይ..."
                    : "Synchronizing Servers..."
                  : isAm
                    ? "ውቅር አስቀምጥ"
                    : "Save Configuration"}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-[#003366] flex items-center gap-2">
            <Eye className="w-5 h-5" />
            {isAm ? "የቀጥታ የምስክር ወረቀት ቅድመ-እይታ" : "Live Certificate Preview"}
          </h3>

          <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-[#003366]/20 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between border-b-2 border-gray-100 pb-4">
              <img
                src={
                  formData.efpLogoUrl ||
                  "https://via.placeholder.com/80?text=LOGO"
                }
                alt="EFP Logo"
                className="w-20 h-20 object-contain bg-white rounded-xl border border-gray-100 p-1"
                onError={(e) =>
                  (e.currentTarget.src =
                    "https://via.placeholder.com/80?text=LOGO")
                }
              />
              <div className="text-right">
                <h3 className="text-xl font-black text-[#003366] uppercase tracking-wide">
                  {formData.governmentName ||
                    (isAm ? "የፌዴራል ፖሊስ" : "Federal Police")}
                </h3>
                <p className="text-sm font-bold text-[#003366]/70 mt-1">
                  {formData.issuingAuthority ||
                    (isAm ? "የዳይሬክቶሬት ስም" : "Directorate Name")}
                </p>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-medium">
                  {isAm
                    ? "የይፋዊ የደህንነት ድርጅት የምስክር ወረቀት"
                    : "Official Security Organization Certificate"}
                </p>
              </div>
            </div>

            <div className="py-8 text-center text-gray-300 font-mono text-sm">
              [{" "}
              {isAm
                ? "የምስክር ወረቀት ይዘት እዚህ ይታያል"
                : "Certificate Body Content Renders Here"}{" "}
              ]
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center">
            {isAm
              ? "ይህ ቅድመ-እይታ ራስጌው በህዝብ ማረጋገጫ ፖርታል እና በታተሙ PDFዎች ላይ እንዴት እንደሚፈጠር ያሳያል።"
              : "This preview shows exactly how the header will generate on the public verification portal and printed PDFs."}
          </p>
        </div>
      </div>
    </div>
  );
}
