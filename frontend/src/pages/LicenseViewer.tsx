//filepath: frontend/src/pages/LicenseViewer.tsx
import React, { useMemo, useRef, useEffect, useState } from "react";
import { Shield, Download, Printer, User, QrCode } from "lucide-react";
import { motion } from "motion/react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { apiRequest, API_BASE } from "../lib/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type CertificationRecord = any;

type CertificateEditForm = {
  level: string;
  logoUrl: string;
  applicantPhotoUrl: string;
};

const resolveAssetUrl = (value: string, baseOrigin: string) => {
  if (!value) return "";
  if (value.startsWith("/")) return `${baseOrigin}${value}`;
  return value;
};

export const LicenseViewer = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { certificateId } = useParams<{ certificateId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const certificateRef = useRef<HTMLDivElement>(null);
  const isEditMode = searchParams.get("action") === "edit";
  const [viewMode, setViewMode] = React.useState<"certificate" | "photo">(
    "certificate",
  );
  const [certificate, setCertificate] =
    React.useState<CertificationRecord | null>(null);
  const [editForm, setEditForm] = React.useState<CertificateEditForm>({
    level: "",
    logoUrl: "",
    applicantPhotoUrl: "",
  });
  const [saving, setSaving] = React.useState(false);
  const [systemLogo, setSystemLogo] = useState<string | null>(null);
  const routeCertificate = (
    location.state as { certificate?: CertificationRecord } | null
  )?.certificate;
  const certificateBasePath = React.useMemo(() => {
    const path = location.pathname.replace(/\/$/, "");
    return certificateId ? path.replace(/\/[^/]+$/, "") : path;
  }, [certificateId, location.pathname]);

  React.useEffect(() => {
    let active = true;

    if (routeCertificate) {
      setCertificate(routeCertificate);
    }

    const loadCertificate = async () => {
      try {
        const response = certificateId
          ? await apiRequest(`/certifications/${certificateId}`)
          : await apiRequest("/certifications");

        if (!active) return;

        if (certificateId) {
          const detail = ((response as any)?.data ||
            response ||
            null) as CertificationRecord | null;
          setCertificate(detail);
          return;
        }

        const normalized = (
          Array.isArray((response as any)?.data)
            ? (response as any).data
            : Array.isArray(response)
              ? response
              : []
        ) as CertificationRecord[];

        const matched = normalized.find((record) => {
          const ownerUserId = Number(record.application?.userId ?? NaN);
          const currentUserId = Number(user?.id ?? NaN);
          return Number.isFinite(ownerUserId) && ownerUserId === currentUserId;
        });

        setCertificate(matched || normalized[0] || null);
      } catch (error) {
        console.error("Failed to load license viewer certificate", error);
        if (active) setCertificate(null);
      }
    };

    loadCertificate();

    return () => {
      active = false;
    };
  }, [certificateId, user?.id, routeCertificate]);

  // Load global system settings (Federal Police logo)
  useEffect(() => {
    let active = true;
    const loadSys = async () => {
      try {
        const resp = await apiRequest("/system-settings");
        const data = (resp as any)?.data ?? resp;
        const logo = data?.efpLogoUrl ?? null;
        if (active && logo) setSystemLogo(logo);
      } catch (err) {
        // silent
      }
    };
    void loadSys();
    return () => {
      active = false;
    };
  }, []);

  React.useEffect(() => {
    if (!isEditMode || !certificate) return;

    setEditForm({
      level: String(certificate.level || ""),
      logoUrl: certificate.organization?.logoUrl || "",
      applicantPhotoUrl:
        certificate.applicantPhotoUrl ||
        certificate.application?.manager?.user?.photoUrl ||
        certificate.application?.operationsHead?.user?.photoUrl ||
        certificate.application?.adminHead?.user?.photoUrl ||
        "",
    });
  }, [certificate, isEditMode]);

  const displayData = useMemo(() => {
    const issued = certificate?.issueDate
      ? new Date(certificate.issueDate)
      : null;
    const expiry = certificate?.expiryDate
      ? new Date(certificate.expiryDate)
      : null;
    const addressParts = [
      certificate?.organization?.address?.kebele?.woreda?.zone?.region?.name,
      certificate?.organization?.address?.kebele?.woreda?.zone?.name,
      certificate?.organization?.address?.kebele?.woreda?.name,
      certificate?.organization?.address?.kebele?.name,
      certificate?.organization?.address?.specialLocation,
      certificate?.organization?.address?.houseNumber,
      certificate?.organization?.address?.kebeleId
        ? `Kebele ${certificate.organization.address.kebeleId}`
        : null,
    ].filter(Boolean);

    return {
      agencyName:
        certificate?.organization?.name ||
        user?.agencyName ||
        "Awaiting agency data",
      logoUrl: certificate?.organization?.logoUrl || "",
      address:
        addressParts.length > 0
          ? addressParts.join(", ")
          : "Address not available",
      level: certificate?.level || certificate?.application?.type || "License",
      issuedDate: issued ? issued.toLocaleDateString() : "—",
      expiryDate: expiry ? expiry.toLocaleDateString() : "—",
      licenseNo: certificate?.certificateSerialNumber || "—",
      status: certificate?.status || "Pending",
      qrCodeValue: certificate?.qrCodeValue || "",
      applicantPhotoUrl:
        certificate?.applicantPhotoUrl ||
        certificate?.application?.manager?.user?.photoUrl ||
        certificate?.application?.operationsHead?.user?.photoUrl ||
        certificate?.application?.adminHead?.user?.photoUrl ||
        "",
      applicantName:
        certificate?.applicantName ||
        user?.fullName ||
        certificate?.organization?.name ||
        "Applicant",
    };
  }, [certificate, user?.agencyName]);

  const renderData = useMemo(
    () => ({
      ...displayData,
      level: isEditMode
        ? editForm.level || displayData.level
        : displayData.level,
      logoUrl: isEditMode
        ? editForm.logoUrl || displayData.logoUrl
        : displayData.logoUrl,
      applicantPhotoUrl: isEditMode
        ? editForm.applicantPhotoUrl || displayData.applicantPhotoUrl
        : displayData.applicantPhotoUrl,
    }),
    [displayData, editForm, isEditMode],
  );

  // Resolve relative image URLs to the backend origin when necessary
  const baseOrigin = API_BASE.replace(/\/api$/, "");
  const resolvedLogoUrl = resolveAssetUrl(renderData.logoUrl || "", baseOrigin);
  const resolvedApplicantPhoto = resolveAssetUrl(
    renderData.applicantPhotoUrl || "",
    baseOrigin,
  );
  const federalLogoSrc = resolveAssetUrl(
    systemLogo || "https://i.ibb.co/Vv8B0Xz/ethiopian-federal-police-logo.png",
    baseOrigin,
  );

  const formatLevel = (lvl: any) => {
    if (!lvl) return "License";
    const s = String(lvl).trim();
    if (/^\d+$/.test(s)) {
      if (s === "1") return "LEVEL - ONE (1)";
      if (s === "2") return "LEVEL - TWO (2)";
      if (s === "3") return "LEVEL - THREE (3)";
      return `LEVEL - ${s}`;
    }
    return s;
  };

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

  const handleEditableAssetChange = async (
    field: keyof Pick<CertificateEditForm, "logoUrl" | "applicantPhotoUrl">,
    file?: File,
  ) => {
    if (!file) return;

    const value = await readFileAsDataUrl(file);
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveChanges = async () => {
    if (!certificateId) return;

    try {
      setSaving(true);
      const response = await apiRequest(`/certifications/${certificateId}`, {
        method: "PATCH",
        body: JSON.stringify({
          level: editForm.level,
          logoUrl: editForm.logoUrl,
          applicantPhotoUrl: editForm.applicantPhotoUrl,
        }),
      });
      const updated = ((response as any)?.data ||
        response ||
        null) as CertificationRecord | null;
      if (updated) {
        setCertificate(updated);
      }
      navigate(`${certificateBasePath}/${certificateId}`);
    } catch (error) {
      console.error("Failed to save certificate changes", error);
      alert("Failed to save certificate changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    navigate(`${certificateBasePath}/${certificateId || ""}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (!certificateRef.current) return;

    try {
      const element = certificateRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("Abyssinia_Security_License.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert(
        "Failed to generate PDF. Please try using the Print option instead.",
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div>
          <h3 className="text-2xl font-bold text-primary">
            {language === "am" ? "የስራ ፈቃድ" : "My Operational License"}
          </h3>
          <div className="flex items-center space-x-2 mt-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {language === "am"
                ? "በፌዴራል ፖሊስ የተላከ"
                : "Dispatched by Federal Police"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button
              onClick={() => setViewMode("certificate")}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${viewMode === "certificate" ? "bg-primary text-white shadow-md" : "text-gray-500 hover:bg-gray-200"}`}
            >
              Digital PDF
            </button>
            <button
              onClick={() => setViewMode("photo")}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${viewMode === "photo" ? "bg-primary text-white shadow-md" : "text-gray-500 hover:bg-gray-200"}`}
            >
              Received Photo
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-6 py-3 bg-white border rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
          >
            <Printer className="w-5 h-5" />
            <span>{language === "am" ? "አትም" : "Print"}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center space-x-2 px-6 py-3 blue-gradient text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
          >
            <Download className="w-5 h-5" />
            <span>{language === "am" ? "አውርድ" : "Download PDF"}</span>
          </button>
        </div>
      </div>

      {viewMode === "photo" ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative group cursor-zoom-in"
        >
          <div className="absolute inset-0 bg-black/5 rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
            <div className="bg-white/90 backdrop-blur-md p-4 rounded-full shadow-2xl">
              <QrCode className="w-8 h-8 text-primary" />
            </div>
          </div>
          <img
            src="https://images.unsplash.com/photo-1589310210210-2de0ea9ff177?auto=format&fit=crop&q=80&w=2000"
            className="w-full h-auto rounded-[40px] shadow-2xl border-4 border-white grayscale-[0.2] sepia-[0.1]"
            alt="Scanned License Photo"
          />
          <div className="absolute bottom-10 right-10 flex flex-col items-end">
            <p className="text-[10px] font-black text-white uppercase tracking-widest drop-shadow-lg">
              Received via External Capture
            </p>
            <p className="text-[8px] font-bold text-white/80 drop-shadow-lg">
              {certificate
                ? `License No: ${renderData.licenseNo}`
                : "No live license loaded"}
            </p>
          </div>
        </motion.div>
      ) : (
        /* License Certificate - Vertical Layout matching image */
        <div
          ref={certificateRef}
          id="license-certificate"
          className="bg-white p-8 md:p-16 rounded-sm shadow-2xl border-[16px] border-double border-[var(--safe-secondary-30)] relative print:shadow-none print:border-[var(--safe-secondary-30)] mx-auto aspect-[1/1.414] w-full max-w-[800px]"
        >
          {/* Ornate Border Overlay */}
          <div className="absolute inset-4 border-2 border-[var(--safe-secondary-10)] pointer-events-none" />

          <div className="relative z-10 h-full flex flex-col">
            {/* Top Section: Logos & Photo */}
            <div className="flex justify-between items-start mb-8">
              {/* Top Left: Federal Police Logo */}
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center p-1 border-4 border-[var(--safe-secondary-20)] shadow-sm overflow-hidden">
                  <img
                    src={federalLogoSrc}
                    alt="Federal Police Logo"
                    className="w-full h-full object-contain rounded-full"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://picsum.photos/seed/police/200/200";
                    }}
                  />
                </div>
              </div>

              {/* Top Center: Agency Logo Space */}
              <div className="w-20 h-20 border-2 border-dashed border-[var(--safe-secondary-30)] rounded-xl flex flex-col items-center justify-center bg-[var(--safe-secondary-10)] text-[var(--safe-secondary-500)] p-2 text-center mt-2 overflow-hidden relative group">
                {resolvedLogoUrl ? (
                  <img
                    src={resolvedLogoUrl}
                    alt="Agency logo"
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://picsum.photos/seed/agency/200/100";
                    }}
                  />
                ) : (
                  <>
                    <Shield className="w-6 h-6 mb-1 opacity-20" />
                    <span className="text-[7px] font-bold uppercase leading-tight">
                      Agency Logo
                    </span>
                  </>
                )}
                {isEditMode && (
                  <label className="absolute inset-0 flex items-center justify-center bg-white/0 hover:bg-white/70 transition-colors cursor-pointer opacity-0 group-hover:opacity-100">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest text-center px-2">
                      Change Logo
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        void handleEditableAssetChange(
                          "logoUrl",
                          e.target.files?.[0],
                        )
                      }
                    />
                  </label>
                )}
              </div>

              {/* Top Right: Applicant Photo Space */}
              <div className="w-28 h-36 border-2 border-dashed border-[var(--safe-secondary-30)] rounded-lg flex flex-col items-center justify-center bg-[var(--safe-secondary-10)] text-[var(--safe-secondary-500)] p-2 text-center relative group overflow-hidden">
                {resolvedApplicantPhoto ? (
                  <img
                    src={resolvedApplicantPhoto}
                    alt={renderData.applicantName}
                    className="w-full h-full object-cover rounded-lg"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://picsum.photos/seed/applicant/240/320";
                    }}
                  />
                ) : (
                  <>
                    <User className="w-10 h-10 mb-2 opacity-20" />
                    <span className="text-[9px] font-bold uppercase">
                      Applicant Photo
                    </span>
                  </>
                )}
                {isEditMode && (
                  <label className="absolute inset-0 flex items-center justify-center bg-white/0 hover:bg-white/70 transition-colors cursor-pointer opacity-0 group-hover:opacity-100">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest text-center px-2">
                      Change Photo
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        void handleEditableAssetChange(
                          "applicantPhotoUrl",
                          e.target.files?.[0],
                        )
                      }
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Header Text */}
            <div className="text-center space-y-3 mb-8">
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-primary tracking-wide">
                  በኢትዮጵያ ፌዴራላዊ ዲሞክራሲያዊ ሪፐብሊክ የፌዴራል ፖሊስ
                </h4>
                <h4 className="text-base font-bold text-[#001F3F] uppercase tracking-wider">
                  The Federal Democratic Republic of Ethiopia Federal police
                </h4>
              </div>

              <div className="py-3 border-y-2 border-[var(--safe-secondary-20)]">
                <h5 className="text-xl font-black text-primary mb-1">
                  የግል ጥበቃ ተቋማት የብቃት ማረጋገጫ የምስክር ወረቀት
                </h5>
                <h5 className="text-lg font-bold text-[#C5A022] italic font-serif">
                  Private Security Agencies Quality Assurance Certificate
                </h5>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 space-y-6 text-left px-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-baseline space-x-4 border-b border-[var(--safe-secondary-10)] pb-1">
                  <span className="text-xs font-bold text-[var(--safe-gray-500)] w-40 shrink-0">
                    የተቋሙ ስም / Name of the Agency:
                  </span>
                  <span className="text-lg font-black text-primary uppercase">
                    {renderData.agencyName}
                  </span>
                </div>

                <div className="flex items-baseline space-x-4 border-b border-[var(--safe-secondary-10)] pb-1">
                  <span className="text-xs font-bold text-[var(--safe-gray-500)] w-40 shrink-0">
                    አድራሻ / Address:
                  </span>
                  <span className="text-base font-bold text-primary">
                    {renderData.address}
                  </span>
                </div>

                <div className="flex items-baseline space-x-4 border-b border-[var(--safe-secondary-10)] pb-1">
                  <span className="text-xs font-bold text-[var(--safe-gray-500)] w-40 shrink-0">
                    የብቃት ደረጃ / Level:
                  </span>
                  {isEditMode ? (
                    <select
                      value={editForm.level}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          level: e.target.value,
                        }))
                      }
                      className="text-base font-bold text-primary bg-transparent border-none outline-none px-0 py-0"
                    >
                      <option value="1">LEVEL - ONE (1)</option>
                      <option value="2">LEVEL - TWO (2)</option>
                      <option value="3">LEVEL - THREE (3)</option>
                    </select>
                  ) : (
                    <span className="text-base font-bold text-primary">
                      {formatLevel(renderData.level)}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline space-x-4 border-b border-[var(--safe-secondary-10)] pb-1">
                  <span className="text-xs font-bold text-[var(--safe-gray-500)] w-40 shrink-0">
                    የተሰጠበት ቀን / Date of Issued:
                  </span>
                  <span className="text-base font-bold text-primary">
                    {renderData.issuedDate}
                  </span>
                </div>

                <div className="flex items-baseline space-x-4 border-b border-[var(--safe-secondary-10)] pb-1">
                  <span className="text-xs font-bold text-[var(--safe-gray-500)] w-40 shrink-0">
                    የሚያበቃበት ቀን / Date of Expired:
                  </span>
                  <span className="text-base font-bold text-primary">
                    {renderData.expiryDate}
                  </span>
                </div>

                <div className="flex items-baseline space-x-4 border-b border-[var(--safe-secondary-10)] pb-1">
                  <span className="text-xs font-bold text-[var(--safe-gray-500)] w-40 shrink-0">
                    የፈቃድ ቁጥር / License No:
                  </span>
                  <span className="text-lg font-black text-[#C5A022] tracking-widest">
                    {renderData.licenseNo}
                  </span>
                </div>
              </div>

              <p className="text-[9px] text-[var(--safe-gray-400)] italic mt-6 leading-relaxed">
                This Certificate is issued pursuant to directive No. 01/2003 of
                the Federal Police Commission. The agency is authorized to
                provide private security services as per the terms and
                conditions specified in the directive.
              </p>
            </div>

            {/* Bottom Section: Signatures & QR */}
            <div className="mt-auto pt-8 flex justify-between items-end">
              {/* Signature Area */}
              <div className="space-y-3">
                <div className="w-48 h-24 border-b-2 border-[var(--safe-secondary-30)] relative flex items-center justify-center">
                  {/* Stamp Placeholder */}
                  <div className="absolute -top-4 -right-4 w-20 h-20 border-4 border-[var(--safe-secondary-30)] rounded-full flex items-center justify-center rotate-12 pointer-events-none">
                    <div className="text-[7px] font-bold text-[var(--safe-secondary-30)] text-center uppercase">
                      Federal Police
                      <br />
                      Commission
                      <br />
                      STAMP
                    </div>
                  </div>
                  <span className="text-[var(--safe-gray-300)] font-serif italic text-xs">
                    Commissioner's Signature
                  </span>
                </div>
                <p className="text-[10px] font-bold text-primary uppercase tracking-tighter">
                  Commissioner of Federal Police
                </p>
              </div>

              {isEditMode && (
                <div className="no-print absolute left-1/2 bottom-8 -translate-x-1/2 flex gap-3 bg-white/90 backdrop-blur-md border border-gray-200 rounded-2xl px-4 py-3 shadow-xl z-30">
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-bold shadow-sm hover:opacity-90 disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}

              {/* Bottom Right: QR Code Space */}
              <div className="bg-white p-4 border-4 border-primary rounded-2xl shadow-xl z-30 mb-2 mr-2">
                <div className="w-28 h-28 flex flex-col items-center justify-center text-primary">
                  <QrCode className="w-20 h-20 mb-1" />
                  <span className="text-[10px] font-black uppercase tracking-tighter">
                    Verify License
                  </span>
                  {renderData.qrCodeValue && (
                    <span className="mt-2 max-w-[110px] text-[7px] font-bold text-gray-500 text-center break-all">
                      {renderData.qrCodeValue}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Background Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
            <Shield className="w-[600px] h-[600px] text-[#FFD700]" />
          </div>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .max-w-4xl { max-width: 100% !important; margin: 0 !important; }
          .pb-20 { padding-bottom: 0 !important; }
        }
      `,
        }}
      />
    </div>
  );
};
