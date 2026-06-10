// filepath: frontend/src/pages/LicenseViewer.tsx
import React, { useRef } from "react";
import { Shield, Download, Printer, User, QrCode } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useParams, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiRequest, resolveBackendAssetUrl } from "../lib/api";
import { AutoDismissToast, ToastType } from "../components/AutoDismissToast";

// Helper to convert OKLCH/OKLAB strings to safe sRGB colors for html2canvas
const convertOklchStringToRgb = (str: string): string => {
  if (
    typeof str !== "string" ||
    (!str.includes("oklch") && !str.includes("oklab"))
  )
    return str;

  // Handle OKLCH colors
  let result = str.replace(/oklch\(([^)]+)\)/g, (match, content) => {
    try {
      const parts = content.split("/");
      const colorParts = parts[0].trim().split(/\s+/);
      const alphaPart = parts[1] ? parts[1].trim() : null;

      if (colorParts.length < 3) return match;

      let l = parseFloat(colorParts[0]);
      if (colorParts[0].includes("%")) {
        l = parseFloat(colorParts[0]) / 100;
      }

      let c = parseFloat(colorParts[1]);
      if (colorParts[1].includes("%")) {
        c = parseFloat(colorParts[1]) / 100;
      }

      const h = parseFloat(colorParts[2]);

      let a: number | undefined = undefined;
      if (alphaPart) {
        if (alphaPart.includes("%")) {
          a = parseFloat(alphaPart) / 100;
        } else {
          a = parseFloat(alphaPart);
        }
      }

      // Convert OKLCH to OKLAB
      const L = l;
      const a_val = c * Math.cos((h * Math.PI) / 180);
      const b_val = c * Math.sin((h * Math.PI) / 180);

      // Convert OKLAB to LMS
      const l_lms = L + 0.3963377774 * a_val + 0.2158037573 * b_val;
      const m_lms = L - 0.1055613458 * a_val - 0.0638541128 * b_val;
      const s_lms = L - 0.0894841775 * a_val - 1.291485548 * b_val;

      const l_lin = l_lms * l_lms * l_lms;
      const m_lin = m_lms * m_lms * m_lms;
      const s_lin = s_lms * s_lms * s_lms;

      const rVal =
        l_lin * 4.0767416621 + m_lin * -3.3077115913 + s_lin * 0.2309699292;
      const gVal =
        l_lin * -1.2684380046 + m_lin * 2.6097574011 + s_lin * -0.3413193965;
      const bVal =
        l_lin * -0.0041960863 + m_lin * -0.7034186147 + s_lin * 1.707614701;

      const toSRGB = (v: number) => {
        const value =
          v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
        return Math.max(0, Math.min(255, Math.round(value * 255)));
      };

      const red = toSRGB(rVal);
      const green = toSRGB(gVal);
      const blue = toSRGB(bVal);

      if (a !== undefined) {
        return `rgba(${red}, ${green}, ${blue}, ${a})`;
      }
      return `rgb(${red}, ${green}, ${blue})`;
    } catch (e) {
      console.error("Failed to parse oklch color:", content, e);
      return match;
    }
  });

  // Handle OKLAB colors
  result = result.replace(/oklab\(([^)]+)\)/g, (match, content) => {
    try {
      const parts = content.split("/");
      const colorParts = parts[0].trim().split(/\s+/);
      const alphaPart = parts[1] ? parts[1].trim() : null;

      if (colorParts.length < 3) return match;

      let L = parseFloat(colorParts[0]);
      if (colorParts[0].includes("%")) {
        L = parseFloat(colorParts[0]) / 100;
      }

      let a_val = parseFloat(colorParts[1]);
      if (colorParts[1].includes("%")) {
        a_val = (parseFloat(colorParts[1]) / 100) * 0.4;
      }

      let b_val = parseFloat(colorParts[2]);
      if (colorParts[2].includes("%")) {
        b_val = (parseFloat(colorParts[2]) / 100) * 0.4;
      }

      let a: number | undefined = undefined;
      if (alphaPart) {
        if (alphaPart.includes("%")) {
          a = parseFloat(alphaPart) / 100;
        } else {
          a = parseFloat(alphaPart);
        }
      }

      // Convert OKLAB to LMS
      const l_lms = L + 0.3963377774 * a_val + 0.2158037573 * b_val;
      const m_lms = L - 0.1055613458 * a_val - 0.0638541128 * b_val;
      const s_lms = L - 0.0894841775 * a_val - 1.291485548 * b_val;

      const l_lin = l_lms * l_lms * l_lms;
      const m_lin = m_lms * m_lms * m_lms;
      const s_lin = s_lms * s_lms * s_lms;

      const rVal =
        l_lin * 4.0767416621 + m_lin * -3.3077115913 + s_lin * 0.2309699292;
      const gVal =
        l_lin * -1.2684380046 + m_lin * 2.6097574011 + s_lin * -0.3413193965;
      const bVal =
        l_lin * -0.0041960863 + m_lin * -0.7034186147 + s_lin * 1.707614701;

      const toSRGB = (v: number) => {
        const value =
          v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
        return Math.max(0, Math.min(255, Math.round(value * 255)));
      };

      const red = toSRGB(rVal);
      const green = toSRGB(gVal);
      const blue = toSRGB(bVal);

      if (a !== undefined) {
        return `rgba(${red}, ${green}, ${blue}, ${a})`;
      }
      return `rgb(${red}, ${green}, ${blue})`;
    } catch (e) {
      console.error("Failed to parse oklab color:", content, e);
      return match;
    }
  });

  return result;
};

// Recursively copies computed styles as flat inline styles on the cloned DOM nodes
const inlineStylesRecursively = (originalEl: Element, clonedEl: Element) => {
  if (originalEl instanceof HTMLElement || originalEl instanceof SVGElement) {
    try {
      const computed = window.getComputedStyle(originalEl);
      const clonedStyle = (clonedEl as any).style;
      if (clonedStyle && typeof clonedStyle.setProperty === "function") {
        for (let i = 0; i < computed.length; i++) {
          const prop = computed[i];
          let val = computed.getPropertyValue(prop);
          if (
            typeof val === "string" &&
            (val.includes("oklch") || val.includes("oklab"))
          ) {
            val = convertOklchStringToRgb(val);
          }
          clonedStyle.setProperty(
            prop,
            val,
            computed.getPropertyPriority(prop),
          );
        }
      }
    } catch (err) {
      console.warn("Error copying styles for node:", originalEl, err);
    }
  }

  // Recurse children in parallel
  const originalChildren = Array.from(originalEl.children);
  const clonedChildren = Array.from(clonedEl.children);

  for (let i = 0; i < originalChildren.length; i++) {
    if (clonedChildren[i]) {
      inlineStylesRecursively(originalChildren[i], clonedChildren[i]);
    }
  }
};

const getCertificateFileName = (cert: any) => {
  const rawName =
    cert?.organization?.nameEnglish ||
    cert?.organization?.nameAmharic ||
    cert?.organization?.name ||
    cert?.certificateSerialNumber ||
    "license";

  const sanitized = String(rawName)
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9-_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();

  return `${sanitized || "license"}_license.pdf`;
};

const getEthiopicLicenseNumber = (
  serial?: string,
  issueDate?: string | Date | null,
) => {
  if (!serial) return "-";

  const match = serial.match(/^(.*?-)(\d{4})(-.*)$/);
  if (!match) return serial;

  let ethYear: number | null = null;
  if (issueDate) {
    try {
      const d = new Date(issueDate);
      if (!Number.isNaN(d.getTime())) {
        ethYear = convertToEthiopicDate(d).year;
      }
    } catch {
      ethYear = null;
    }
  }

  if (ethYear === null) {
    const rawYear = Number(match[2]);
    ethYear = Number.isNaN(rawYear) ? null : rawYear - 8;
  }

  if (ethYear === null) return serial;
  return `${match[1]}${ethYear}${match[3]}`;
};

const convertToEthiopicDate = (gregorianDate: Date) => {
  const utc = (date: Date) =>
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const isGregorianLeap = (year: number) =>
    year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

  const year = gregorianDate.getFullYear();
  const newYearDay = isGregorianLeap(year) ? 12 : 11;
  const newYearUtc = Date.UTC(year, 8, newYearDay);

  let ethYear: number;
  let deltaDays: number;

  if (utc(gregorianDate) >= newYearUtc) {
    ethYear = year - 7;
    deltaDays = Math.floor((utc(gregorianDate) - newYearUtc) / 86400000);
  } else {
    const prevYear = year - 1;
    const prevNewYearDay = isGregorianLeap(prevYear) ? 12 : 11;
    const prevNewYearUtc = Date.UTC(prevYear, 8, prevNewYearDay);
    ethYear = prevYear - 7;
    deltaDays = Math.floor((utc(gregorianDate) - prevNewYearUtc) / 86400000);
  }

  const ethMonth = Math.floor(deltaDays / 30) + 1;
  const ethDay = (deltaDays % 30) + 1;
  return { day: ethDay, month: ethMonth, year: ethYear };
};

const formatDate = (raw?: string | Date | null, locale: "am" | "en" = "en") => {
  if (!raw) return "-";
  try {
    const d = new Date(raw);

    if (locale === "am") {
      try {
        const formatted = new Intl.DateTimeFormat("am-ET-u-ca-ethiopic", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
        }).format(d);
        return `${formatted} E.C.`;
      } catch {
        const eth = convertToEthiopicDate(d);
        return `${eth.day}/${eth.month}/${eth.year} E.C.`;
      }
    }

    return d.toLocaleDateString();
  } catch {
    return String(raw);
  }
};

export const LicenseViewer = () => {
  const { language } = useLanguage();
  const params = useParams();
  const location = useLocation();
  const certificateRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const labelClass =
    "text-xs font-semibold text-gray-500 leading-5 font-sans antialiased";
  const valueClass =
    "text-sm font-medium text-primary leading-6 font-sans antialiased";
  const [scale, setScale] = React.useState(1);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [isSigning, setIsSigning] = React.useState(false);
  const [isStamping, setIsStamping] = React.useState(false);
  const [showSignModal, setShowSignModal] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [signFile, setSignFile] = React.useState<File | null>(null);
  const [signSignaturePreviewUrl, setSignSignaturePreviewUrl] = React.useState<
    string | null
  >(null);
  const [signSignaturePreviewIsObjectUrl, setSignSignaturePreviewIsObjectUrl] =
    React.useState(false);
  const [showSignPreview, setShowSignPreview] = React.useState(false);
  const [showStampModal, setShowStampModal] = React.useState(false);
  const stampFileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [stampFile, setStampFile] = React.useState<File | null>(null);
  const [stampPreviewUrl, setStampPreviewUrl] = React.useState<string | null>(
    null,
  );
  const [stampPreviewIsObjectUrl, setStampPreviewIsObjectUrl] =
    React.useState(false);
  const [showStampPreview, setShowStampPreview] = React.useState(false);
  const [toast, setToast] = React.useState<{
    isOpen: boolean;
    type: ToastType;
    message: string;
  }>({
    isOpen: false,
    type: "success",
    message: "",
  });
  const [signFullNameEn, setSignFullNameEn] = React.useState("");
  const [signFullNameAm, setSignFullNameAm] = React.useState("");
  const [signPositionId, setSignPositionId] = React.useState<number | null>(
    null,
  );
  const [positions, setPositions] = React.useState<any[]>([]);
  const [cert, setCert] = React.useState<any>(null);
  const [loadingCert, setLoadingCert] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const { user } = useAuth();
  const normalizedRoles = (user?.roles || []).map((role: string) =>
    String(role).toLowerCase(),
  );
  const signerRoles = (
    cert?.signedByOfficial?.userRoles?.length
      ? cert.signedByOfficial.userRoles
      : normalizedRoles
  ).map((role: string) => String(role).toLowerCase());
  const isSignedBySuperAdmin = signerRoles.some(
    (role: string) =>
      role.includes("super_admin") || role.includes("superadmin"),
  );
  const isSignedByAdmin =
    !isSignedBySuperAdmin &&
    signerRoles.some((role: string) => role.includes("admin"));
  const isSignedByLicensingAuthority =
    !isSignedBySuperAdmin &&
    !isSignedByAdmin &&
    signerRoles.some((role: string) => role === "licensing_authority");
  const isAuthorizedSigner = normalizedRoles.some(
    (role: string) => role.includes("admin") || role === "licensing_authority",
  );
  const isLicensingAuthority = normalizedRoles.some(
    (role: string) => role === "licensing_authority",
  );
  const signatureAuthorityTitleLines = cert?.signedByOfficial
    ? isSignedBySuperAdmin
      ? [
          "የጦር መሳሪያ እና የጥበቃ",
          "ተቋማት ቁጥጥር መምረያ ሓላፈ",
          "Fire arms & security Institution",
          "Monitoring Department Head",
        ]
      : isSignedByAdmin
        ? [
            "የጥበ/አገ/ሰጪ/ድር/ቁጥ/",
            "ወና ክፍል ሓለፍ",
            "Sec/serve/Org/Control/",
            "Main Section Head",
          ]
        : isSignedByLicensingAuthority
          ? [
              "የሽማግሌ እና የፈቃድ",
              "ማስፈሪያ አቅራቢ",
              "Licensing Authority",
              "Certification Stamp Officer",
            ]
          : []
    : [];

  React.useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const parentWidth = containerRef.current.clientWidth;
        if (parentWidth < 800) {
          setScale(parentWidth / 800);
        } else {
          setScale(1);
        }
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  React.useEffect(() => {
    let active = true;
    const loadCert = async () => {
      try {
        setLoadingCert(true);
        setLoadError(null);
        const navCert = (location as any)?.state?.certificate;
        if (navCert) {
          if (!active) return;
          if (navCert?.applicantPhotoUrl || !navCert?.id) {
            setCert({
              ...navCert,
              applicantPhotoUrl: resolveBackendAssetUrl(
                navCert.applicantPhotoUrl,
              ),
            });
            return;
          }
        }

        const idRaw = (params as any)?.certificateId;
        if (!idRaw) {
          const endpoint = isLicensingAuthority
            ? "/certifications/pending-stamps"
            : "/certifications";
          const listResp = await apiRequest(endpoint);
          const listData =
            listResp && (listResp as any).data
              ? (listResp as any).data
              : listResp;
          const firstCert = Array.isArray(listData) ? listData[0] : null;
          if (!active) return;
          if (firstCert) {
            setCert({
              ...firstCert,
              applicantPhotoUrl: resolveBackendAssetUrl(
                firstCert?.applicantPhotoUrl,
              ),
            });
          }
          return;
        }

        const resp = await apiRequest(`/certifications/${idRaw}`);
        const data = resp && (resp as any).data ? (resp as any).data : resp;
        if (!active) return;
        setCert({
          ...data,
          applicantPhotoUrl: resolveBackendAssetUrl(data?.applicantPhotoUrl),
        });
      } catch (err: any) {
        console.error("Failed to load certificate", err);
        setLoadError((err && err.message) || String(err));
      } finally {
        if (active) setLoadingCert(false);
      }
    };

    loadCert();
    return () => {
      active = false;
    };
  }, [params, location]);

  const formatLevel = (level?: any, locale: "am" | "en" = "en") => {
    if (level === null || level === undefined || level === "") {
      return locale === "am" ? "አንድ (1)" : "ONE (1)";
    }
    const str = String(level).trim();
    const n = parseInt(str, 10);
    if (!isNaN(n)) {
      if (locale === "am") {
        const amMap: Record<number, string> = { 1: "አንድ", 2: "ሁለት", 3: "ሶስት" };
        return `${amMap[n] || str} (${n})`;
      }
      const enMap: Record<number, string> = { 1: "ONE", 2: "TWO", 3: "THREE" };
      return `${enMap[n] || String(str).toUpperCase()} (${n})`;
    }

    // Fallback: try to extract number in parentheses
    const m = str.match(/(\d+)/);
    const found = m ? m[1] : null;
    if (found) {
      if (locale === "am") return `አንድ (${found})`;
      return `ONE (${found})`;
    }
    return locale === "am" ? `አንድ (1)` : `ONE (1)`;
  };

  const formatAddress = (org: any, locale: "am" | "en" = "en") => {
    if (!org || !org.address) return "";
    const a = org.address;
    const parts = [] as string[];
    // Choose language specific geographic names where available
    const keb =
      locale === "am"
        ? a.kebele?.nameAmharic || a.kebele?.nameEnglish
        : a.kebele?.nameEnglish || a.kebele?.nameAmharic;
    if (keb) parts.push(keb);

    const woreda =
      locale === "am"
        ? a.kebele?.woreda?.nameAmharic || a.kebele?.woreda?.nameEnglish
        : a.kebele?.woreda?.nameEnglish || a.kebele?.woreda?.nameAmharic;
    if (woreda) parts.push(woreda);

    const zone =
      locale === "am"
        ? a.kebele?.woreda?.zone?.nameAmharic ||
          a.kebele?.woreda?.zone?.nameEnglish
        : a.kebele?.woreda?.zone?.nameEnglish ||
          a.kebele?.woreda?.zone?.nameAmharic;
    if (zone) parts.push(zone);

    const region =
      locale === "am"
        ? a.kebele?.woreda?.zone?.region?.nameAmharic ||
          a.kebele?.woreda?.zone?.region?.nameEnglish
        : a.kebele?.woreda?.zone?.region?.nameEnglish ||
          a.kebele?.woreda?.zone?.region?.nameAmharic;
    if (region) parts.push(region);
    return parts.join(", ");
  };

  const getSpecialLocation = (org: any) => {
    if (!org || !org.address?.specialLocation) return "";
    return String(org.address.specialLocation);
  };

  const fetchPositions = async () => {
    try {
      const resp = await apiRequest<{ success: boolean; data: any[] }>(
        "/efp-positions",
      );
      const data = resp && (resp as any).data ? (resp as any).data : resp;
      setPositions(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn("Failed to load EFP positions", e);
    }
  };

  const fetchCurrentOfficial = async () => {
    try {
      const resp = await apiRequest<{ success: boolean; data: any }>(
        "/certifications/current-official",
      );
      const data = resp && (resp as any).data ? (resp as any).data : resp;
      if (data) {
        setSignFullNameEn(data.fullName || user?.fullName || "");
        setSignFullNameAm(data.fullNameAm || "");
        setSignPositionId(data.efpPositionId ?? null);
        setSignSignaturePreviewUrl(
          data.signatureUrl ? resolveBackendAssetUrl(data.signatureUrl) : null,
        );
        setSignSignaturePreviewIsObjectUrl(false);
        setShowSignPreview(false);
      } else {
        setSignFullNameEn(user?.fullName || "");
        setSignFullNameAm("");
        setSignPositionId(null);
        setSignSignaturePreviewUrl(null);
        setSignSignaturePreviewIsObjectUrl(false);
        setShowSignPreview(false);
      }
    } catch (e) {
      console.warn("Failed to load current official details", e);
      setSignFullNameEn(user?.fullName || "");
      setSignFullNameAm("");
      setSignPositionId(null);
      setSignSignaturePreviewUrl(null);
      setSignSignaturePreviewIsObjectUrl(false);
    }
  };

  React.useEffect(() => {
    return () => {
      if (signSignaturePreviewIsObjectUrl && signSignaturePreviewUrl) {
        URL.revokeObjectURL(signSignaturePreviewUrl);
      }
    };
  }, [signSignaturePreviewUrl, signSignaturePreviewIsObjectUrl]);

  const handleSubmitSign = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!cert?.id || isSigning) return;
    if (!signFullNameAm || !signPositionId) {
      setToast({
        isOpen: true,
        type: "error",
        message:
          language === "am"
            ? "ስምና ቦታ ያስገቡ"
            : "Please provide name and position",
      });
      return;
    }

    try {
      setIsSigning(true);
      const form = new FormData();
      if (signFile) form.append("signature", signFile);
      form.append("fullNameEn", signFullNameEn);
      form.append("fullNameAm", signFullNameAm);
      form.append("positionId", String(signPositionId));

      const response = await apiRequest(
        `/certifications/${cert.id}/sign-with-official`,
        {
          method: "POST",
          body: form,
        } as any,
      );

      const updated =
        response && (response as any).data ? (response as any).data : response;
      setCert({
        ...updated,
        applicantPhotoUrl: resolveBackendAssetUrl(updated?.applicantPhotoUrl),
      });
      setShowSignModal(false);
      setSignFile(null);
      setSignSignaturePreviewUrl(null);
      setSignSignaturePreviewIsObjectUrl(false);
      setShowSignPreview(false);
      setSignFullNameAm("");
      setSignFullNameEn("");
      setSignPositionId(null);
      setToast({
        isOpen: true,
        type: "success",
        message:
          language === "am"
            ? "ሰርተፊኬቱ ተፈረምኗል።"
            : "Certificate signed successfully.",
      });
    } catch (err: any) {
      console.error("Failed to sign certificate with payload", err);
      setToast({
        isOpen: true,
        type: "error",
        message:
          (err && err.message) ||
          (language === "am" ? "ማስፈረም አልተሳካም" : "Signing failed"),
      });
    } finally {
      setIsSigning(false);
    }
  };

  const handleStampCertificate = async () => {
    // Open the stamp upload modal and prepopulate with existing stamp if available
    if (!cert?.id || isStamping) return;
    setShowStampModal(true);
    // If a stamp already exists, show it in the preview
    if (cert?.signedByOfficial?.stampUrl) {
      setStampPreviewUrl(
        resolveBackendAssetUrl(cert.signedByOfficial.stampUrl),
      );
      setStampPreviewIsObjectUrl(false);
      setShowStampPreview(true);
    }
  };

  const handleSubmitStamp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!cert?.id || isStamping) return;

    const isUsingExistingStamp = !!stampPreviewUrl && !stampPreviewIsObjectUrl;
    if (!stampFile && !isUsingExistingStamp) {
      setToast({
        isOpen: true,
        type: "error",
        message:
          language === "am" ? "እባክዎ ስም ፎቶ ይምረጡ" : "Please select a stamp image",
      });
      return;
    }

    try {
      setIsStamping(true);
      const form = new FormData();
      if (stampFile) {
        form.append("stamp", stampFile);
      }

      const response = await apiRequest(`/certifications/${cert.id}/stamp`, {
        method: "POST",
        body: form,
      } as any);

      const updated =
        response && (response as any).data ? (response as any).data : response;
      setCert({
        ...updated,
        applicantPhotoUrl: resolveBackendAssetUrl(updated?.applicantPhotoUrl),
      });
      setShowStampModal(false);
      setStampFile(null);
      setStampPreviewUrl(null);
      setStampPreviewIsObjectUrl(false);
      setShowStampPreview(false);
      // Also reset modal state when closing
      setTimeout(() => {
        setStampPreviewUrl(null);
        setShowStampPreview(false);
      }, 100);
      setToast({
        isOpen: true,
        type: "success",
        message:
          language === "am" ? "ማስፈረሚ ተሳካ" : "Certificate stamped successfully.",
      });
    } catch (err: any) {
      console.error("Failed to stamp certificate", err);
      setToast({
        isOpen: true,
        type: "error",
        message:
          (err && err.message) ||
          (language === "am" ? "ማስፈረም አልተሳካም" : "Stamping failed"),
      });
    } finally {
      setIsStamping(false);
    }
  };

  if (loadingCert) {
    return <div className="p-8 text-center">Loading certificate...</div>;
  }

  if (loadError) {
    return (
      <div className="p-8 text-center text-red-600">Error: {loadError}</div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (!certificateRef.current || isDownloading) return;

    setIsDownloading(true);
    let container: HTMLDivElement | null = null;

    try {
      const element = certificateRef.current;

      // Extract, parse, and clean all stylesheets to convert any OKLCH colors into sRGB colors
      let cleanedStyles = "";
      try {
        for (let i = 0; i < document.styleSheets.length; i++) {
          try {
            const sheet = document.styleSheets[i];
            if (
              sheet.href &&
              (sheet.href.includes("fonts.googleapis.com") ||
                sheet.href.includes("fonts.gstatic.com"))
            ) {
              continue;
            }
            const rules = sheet.cssRules || sheet.rules;
            if (rules) {
              for (let j = 0; j < rules.length; j++) {
                cleanedStyles += rules[j].cssText + "\n";
              }
            }
          } catch (e) {
            console.warn(
              "CORS barrier reading sheet.cssRules, fall back to parsing text:",
              e,
            );
          }
        }
      } catch (err) {
        console.error("Error reading stylesheets:", err);
      }
      cleanedStyles = convertOklchStringToRgb(cleanedStyles);

      // Create a hidden clone container to render at absolute 1:1 scale (800x1130) safe from parent scaling factors
      container = document.createElement("div");
      container.style.position = "fixed";
      container.style.top = "-99999px";
      container.style.left = "-99999px";
      container.style.width = "800px";
      container.style.height = "1130px";
      container.style.overflow = "hidden";
      container.style.background = "#ffffff";
      container.style.zIndex = "-99999";

      const clone = element.cloneNode(true) as HTMLDivElement;

      // Inline computed styles completely from the original, visible styled elements onto the clone
      inlineStylesRecursively(element, clone);

      // Override responsive scaling / viewport limits on the cloned element to ensure layout rendering exactly as A4
      clone.style.transform = "none";
      clone.style.position = "relative";
      clone.style.left = "auto";
      clone.style.top = "auto";
      clone.style.margin = "0";
      clone.style.width = "800px";
      clone.style.height = "1130px";
      clone.style.boxShadow = "none";
      clone.style.borderRadius = "0";

      container.appendChild(clone);
      document.body.appendChild(container);

      // Give browser layout engines and image rendering decoders a moment to draw the new tree
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Run html2canvas rendering safe from oklch crashes!
      const canvas = await html2canvas(clone, {
        scale: 2.5, // 2.5x high density density for crisp text and sharp emblem edges
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          // 1. Remove all existing styles
          const styleTags = clonedDoc.querySelectorAll("style");
          styleTags.forEach((el) => el.parentNode?.removeChild(el));

          // 2. Remove all link stylesheets except Google Fonts
          const linkTags = clonedDoc.querySelectorAll('link[rel="stylesheet"]');
          linkTags.forEach((el) => {
            const href = (el as HTMLLinkElement).href;
            if (
              href &&
              (href.includes("fonts.googleapis.com") ||
                href.includes("fonts.gstatic.com"))
            ) {
              // Keep font styles intact
            } else {
              el.parentNode?.removeChild(el);
            }
          });

          // 3. Inject our pre-compiled, absolutely cleaned, oklch-free Tailwind styles!
          const styleEl = clonedDoc.createElement("style");
          styleEl.textContent = cleanedStyles;
          clonedDoc.head.appendChild(styleEl);

          const photoFrame = clonedDoc.querySelector(
            ".applicant-photo-frame",
          ) as HTMLElement | null;
          if (photoFrame) {
            photoFrame.style.height = "11.75rem";
            photoFrame.style.padding = "0.25rem";
          }
        },
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        pdfWidth,
        pdfHeight,
        undefined,
        "FAST",
      );
      pdf.save(getCertificateFileName(cert));
    } catch (error) {
      console.error("Error generating PDF:", error);
      setToast({
        isOpen: true,
        type: "error",
        message:
          language === "am"
            ? 'PDF ማውረድ አልተሳካም። እባክዎ "አትም" የሚለውን አማራጭ ይጠቀሙ።'
            : "Failed to generate PDF. Please try using the Print option instead.",
      });
    } finally {
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 pb-10 md:pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print px-4 md:px-0">
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-primary">
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

        <div className="flex flex-wrap gap-2 md:gap-3 w-full md:w-auto">
          <button
            onClick={handlePrint}
            className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 md:px-6 py-2 md:py-3 bg-white border rounded-xl font-bold text-gray-600 text-xs md:text-sm hover:bg-gray-50 transition-all shadow-sm"
          >
            <Printer className="w-4 h-4 md:w-5 md:h-5" />
            <span>{language === "am" ? "አትም" : "Print"}</span>
          </button>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 md:px-6 py-2 md:py-3 blue-gradient text-white rounded-xl font-bold text-xs md:text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>
                  {language === "am" ? "በማዘጋጀት ላይ..." : "Preparing PDF..."}
                </span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 md:w-5 md:h-5" />
                <span>{language === "am" ? "አውርድ" : "Download"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="w-full overflow-hidden pb-8 print:overflow-visible flex justify-center relative"
      >
        <div
          id="license-scaler-container"
          style={{
            width: `${800 * scale}px`,
            height: `${1130 * scale}px`,
          }}
          className="relative print:w-full print:h-auto flex justify-center shrink-0"
        >
          <div
            id="license-scale-wrapper"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top center",
              width: "800px",
              height: "1130px",
              position: "absolute",
              top: 0,
              left: "50%",
              marginLeft: "-400px",
            }}
            className="transition-all duration-150 print:transform-none print:relative print:h-auto print:w-full flex justify-center shrink-0"
          >
            <div
              ref={certificateRef}
              id="license-certificate"
              className="bg-white p-12 rounded-sm shadow-2xl border-[16px] border-double border-[var(--safe-secondary-30)] relative print:shadow-none print:border-[var(--safe-secondary-30)] mx-auto aspect-[1/1.414] w-[800px] h-[1130px] shrink-0"
            >
              {/* Ornate Border Overlay */}
              <div className="absolute inset-4 border-2 border-[var(--safe-secondary-10)] pointer-events-none" />

              <div className="relative z-10 h-full flex flex-col">
                {/* Top Section: Logos & Photo */}
                <div className="flex justify-between items-start mb-8">
                  {/* Top Left: Federal Police Logo */}
                  <div className="flex flex-col items-center">
                    <div className="w-35 h-35 bg-white rounded-full flex items-center justify-center border-[var(--safe-secondary-20)] shadow-sm">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/3/30/Federal_Police_Commission_of_Ethiopia_Coat_of_Arms_and_Logo.png"
                        alt="Federal Police Logo"
                        className="w-full h-full object-contain rounded-full"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          (e.target as HTMLImageElement).removeAttribute(
                            "crossOrigin",
                          );
                          (e.target as HTMLImageElement).src =
                            "https://picsum.photos/seed/police/200/200";
                        }}
                      />
                    </div>
                  </div>

                  {/* Top Center: Ethiopian Flag */}
                  <div className="w-44 h-28 bg-white rounded-xl flex items-center justify-center p-1 shadow-sm mt-2 overflow-hidden">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Flag_of_Ethiopia.svg/640px-Flag_of_Ethiopia.svg.png"
                      alt="Ethiopian Flag"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        if (img.src.includes("wikimedia.org")) {
                          img.src = "https://flagcdn.com/w640/et.png";
                        } else if (img.src.includes("flagcdn.com")) {
                          img.removeAttribute("crossOrigin");
                          img.src = "https://flagcdn.com/w320/et.png";
                        } else {
                          img.removeAttribute("crossOrigin");
                          img.src = "https://picsum.photos/seed/flaget/320/190";
                        }
                      }}
                    />
                  </div>

                  {/* Top Right: Applicant Photo Space */}
                  <div className="applicant-photo-frame w-36 h-40 border-2 border-solid border-[var(--safe-secondary-30)] rounded-lg flex flex-col items-center justify-center bg-[var(--safe-secondary-10)] text-[var(--safe-secondary-500)] text-center">
                    {cert?.applicantPhotoUrl ? (
                      <img
                        src={resolveBackendAssetUrl(cert.applicantPhotoUrl)}
                        alt={language === "am" ? "የተቋሙ ፎቶ" : "Applicant Photo"}
                        className="w-full h-full object-cover rounded-sm"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.removeAttribute("crossOrigin");
                          img.src =
                            "https://picsum.photos/seed/applicant/200/260";
                        }}
                      />
                    ) : (
                      <>
                        <User className="w-10 h-10 mb-2 opacity-20" />
                        <span className="text-[9px] font-bold uppercase">
                          {language === "am" ? "የተጠየቀ ፎቶ" : "Applicant Photo"}
                        </span>
                      </>
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
                      የግል ጥበቃ ተቋማት የብቃት ማረጋገጫ ምስክር ወረቀት
                    </h5>
                    <h5 className="text-lg font-bold text-[#C5A022] italic font-serif">
                      Private Security Agencies Quality Assurance Certificate
                    </h5>
                  </div>
                </div>

                {/* Main Content Area - Two Column Layout */}
                <div className="flex-1 space-y-5 text-left px-4">
                  <div className="grid grid-cols-2 gap-8">
                    {/* Amharic Column (Left) */}
                    <div className="space-y-4">
                      <div className="border-b border-[var(--safe-secondary-10)] pb-1.5">
                        <span className={labelClass}>የተቋሙ ስም:</span>
                        <span
                          className={`${valueClass} uppercase font-black break-words`}
                        >
                          {cert?.organization?.nameAmharic ||
                            cert?.organization?.name ||
                            "Unknown Agency"}
                        </span>
                      </div>

                      <div className="border-b border-[var(--safe-secondary-10)] pb-1.5">
                        <span className={labelClass}>አድራሻ: </span>
                        <span className={valueClass}>
                          {formatAddress(cert?.organization, "am") ||
                            "Addis Ababa, Ethiopia"}
                        </span>
                      </div>

                      <div className="border-b border-[var(--safe-secondary-10)] pb-1.5">
                        <span className={labelClass}>ልዩ ቦታ: </span>
                        <span className={valueClass}>
                          {getSpecialLocation(cert?.organization) || "-"}
                        </span>
                      </div>

                      <div className="border-b border-[var(--safe-secondary-10)] pb-1.5">
                        <span className={labelClass}>የቤት ቁጥር: </span>
                        <span className={valueClass}>
                          {cert?.organization?.address?.houseNumber || "-"}
                        </span>
                      </div>

                      <div className="border-b border-[var(--safe-secondary-10)] pb-1.5">
                        <span className={labelClass}>የብቃት ደረጃ: </span>
                        <span className={`${valueClass} uppercase`}>
                          {formatLevel(cert?.level, "am")}
                        </span>
                      </div>

                      <div className="border-b border-[var(--safe-secondary-10)] pb-1.5">
                        <span className={labelClass}>የተሰጠበት ቀን: </span>
                        <span className={valueClass}>
                          {formatDate(cert?.issueDate, "am")}
                        </span>
                      </div>

                      <div className="border-b border-[var(--safe-secondary-10)] pb-1.5">
                        <span className={labelClass}>የሚያበቃበት ቀን: </span>
                        <span className={valueClass}>
                          {formatDate(cert?.expiryDate, "am")}
                        </span>
                      </div>

                      <div className="border-b border-[var(--safe-secondary-10)] pb-1.5">
                        <span className={labelClass}>የፈቃድ ቁጥር: </span>
                        <span
                          className={`${valueClass} font-black text-[#C5A022] tracking-widest uppercase`}
                        >
                          {getEthiopicLicenseNumber(
                            cert?.certificateSerialNumber,
                            cert?.issueDate,
                          )}
                        </span>
                      </div>
                    </div>

                    {/* English Column (Right) */}
                    <div className="space-y-4">
                      <div className="border-b border-[var(--safe-secondary-10)] pb-1.5">
                        <span className={labelClass}>Name of the Agency: </span>
                        <span
                          className={`${valueClass} uppercase font-black break-words`}
                        >
                          {cert?.organization?.nameEnglish ||
                            cert?.organization?.name ||
                            "Unknown Agency"}
                        </span>
                      </div>

                      <div className="border-b border-[var(--safe-secondary-10)] pb-1.5">
                        <span className={labelClass}>Address: </span>
                        <span className={valueClass}>
                          {formatAddress(cert?.organization, "en") ||
                            "Oromia, East Hararghe, Haramaya Woreda, Kebele 01"}
                        </span>
                      </div>

                      <div className="border-b border-[var(--safe-secondary-10)] pb-1.5">
                        <span className={labelClass}>Special Location:</span>
                        <span className={valueClass}>
                          {getSpecialLocation(cert?.organization) || "-"}
                        </span>
                      </div>

                      <div className="border-b border-[var(--safe-secondary-10)] pb-1.5">
                        <span className={labelClass}>House No: </span>
                        <span className={valueClass}>
                          {cert?.organization?.address?.houseNumber || "-"}
                        </span>
                      </div>

                      <div className="border-b border-[var(--safe-secondary-10)] pb-1.5">
                        <span className={labelClass}>Level: </span>
                        <span className={`${valueClass} uppercase`}>
                          {formatLevel(cert?.level, "en")}
                        </span>
                      </div>

                      <div className="border-b border-[var(--safe-secondary-10)] pb-1.5">
                        <span className={labelClass}>Date of Issued: </span>
                        <span className={valueClass}>
                          {cert?.expiryDate
                            ? `${formatDate(cert.issueDate, "en")} G.C.`
                            : "-"}
                        </span>
                      </div>

                      <div className="border-b border-[var(--safe-secondary-10)] pb-1.5">
                        <span className={labelClass}>Date of Expired: </span>
                        <span className={valueClass}>
                          {cert?.expiryDate
                            ? `${formatDate(cert.expiryDate, "en")} G.C.`
                            : "-"}
                        </span>
                      </div>

                      <div className="border-b border-[var(--safe-secondary-10)] pb-1.5">
                        <span className={labelClass}>License No: </span>
                        <span
                          className={`${valueClass} font-black text-[#C5A022] tracking-widest uppercase`}
                        >
                          {cert?.certificateSerialNumber || "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[9.5px] text-[var(--safe-gray-400)] italic mt-5 leading-relaxed">
                    ይህ የብቃት ማረጋገጫ ምስክር ወረቀት በፌዴራል ፖሊስ ኮሚሽን መመሪያ ቁጥር 01/2003 መሠረት
                    የተሰጠ ነው። ተቋሙ በመመሪያ በተጠቀሱት ውሎችና ግዴታዎች መሠረት የግል ጥበቃ አገልግሎት
                    ለመስጠት ፈቃድ ተሰጥቶታል። / This Certificate is issued pursuant to
                    directive No. 01/2003 of the Federal Police Commission. The
                    agency is authorized to provide private security services as
                    per the terms and conditions specified in the directive.
                  </p>
                </div>

                {/* Bottom Section: Signatures & QR */}
                <div className="mt-auto pt-4">
                  <div className="flex justify-between items-start gap-0">
                    <div className="flex-1 min-w-[150px] max-w-[180px] rounded-3xl  p-1 text-center text-primary">
                      <div className="mx-auto h-34 w-34 rounded-full bg-white shadow-inner flex items-center justify-center text-xs font-black uppercase tracking-[0.2em] text-primary overflow-hidden">
                        {cert?.stampedByUserId &&
                        cert?.signedByOfficial?.stampUrl ? (
                          <img
                            src={resolveBackendAssetUrl(
                              cert.signedByOfficial.stampUrl,
                            )}
                            alt={language === "am" ? "ማስፈረሚ" : "Stamp"}
                            className="max-w-full max-h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        ) : !cert?.stampedByUserId && isLicensingAuthority ? (
                          <button
                            disabled={isStamping}
                            onClick={handleStampCertificate}
                            className="px-3 py-2 bg-[#00305F] text-white rounded-lg text-[9px] font-bold hover:bg-[#00284d] transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                          >
                            {isStamping
                              ? language === "am"
                                ? "በማስፈረም..."
                                : "Stamping..."
                              : language === "am"
                                ? "ማስፈረሚ"
                                : "Stamp Certificate"}
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex-[2] rounded-3xl bg-white p-4">
                      <div className="space-y-1 text-left">
                        <div className="text-[13px] font-bold text-primary text-center">
                          {cert?.signedByOfficial?.fullNameAm || "—"}
                        </div>
                        <div className="text-[13px] font-bold text-primary text-center">
                          {cert?.signedByOfficial?.fullName || "—"}
                        </div>
                      </div>
                      <div className="mt-4 space-y-1">
                        <div className="text-[13px] font-bold text-primary text-center">
                          {cert?.signedByOfficial?.positionAmharic || "—"}
                        </div>
                        <div className="text-[13px] font-bold text-primary text-center">
                          {cert?.signedByOfficial?.positionEnglish || "—"}
                        </div>
                      </div>
                    </div>

                    <div className="flex-[0.9] min-w-[140px] rounded-3xl bg-white p-3 flex flex-col items-center justify-between">
                      <div className="w-full max-h-28 flex items-center justify-center -mt-[30px]">
                        <div className="w-full h-full rounded-3xl p-2 flex items-center justify-center">
                          {cert?.signedByOfficial?.signatureUrl ? (
                            <img
                              src={resolveBackendAssetUrl(
                                cert.signedByOfficial.signatureUrl,
                              )}
                              alt={language === "am" ? "ፊርማ" : "Signature"}
                              className="max-w-full max-h-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="text-center">
                              <p className="text-[9px] text-gray-400 font-bold uppercase">
                                {language === "am"
                                  ? "የታረገ ፊርማ"
                                  : "Authorized Signature"}
                              </p>
                              <p className="text-[10px] text-gray-400 italic">
                                {cert?.signedByOfficial
                                  ? cert.signedByOfficial.fullName
                                  : language === "am"
                                    ? "እየታረገ ላይ"
                                    : "Pending signature"}
                              </p>
                            </div>
                          )}

                          {showStampModal && (
                            <div className="fixed inset-0 z-[70] grid place-items-center bg-black/40 p-4">
                              <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-lg font-bold">
                                    {language === "am"
                                      ? "ማስፈረሚ ፎቶ ይጨምሩ"
                                      : "Upload Stamp Image"}
                                  </h3>
                                  <button
                                    onClick={() => {
                                      setShowStampModal(false);
                                      setShowStampPreview(false);
                                      // Only clear new uploads, not existing stamp preview
                                      if (stampPreviewIsObjectUrl) {
                                        setStampPreviewUrl(null);
                                        setStampFile(null);
                                      }
                                    }}
                                    className="text-sm text-gray-500"
                                  >
                                    {language === "am" ? "ዝጋ" : "Close"}
                                  </button>
                                </div>
                                <form
                                  className="mt-4 space-y-4"
                                  onSubmit={handleSubmitStamp}
                                >
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700">
                                      {language === "am"
                                        ? "ማስፈረሚ ፎቶ"
                                        : "Stamp Image"}
                                    </label>
                                    <input
                                      ref={stampFileInputRef}
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file =
                                          e.target.files?.[0] || null;
                                        if (
                                          stampPreviewIsObjectUrl &&
                                          stampPreviewUrl
                                        ) {
                                          URL.revokeObjectURL(stampPreviewUrl);
                                        }
                                        if (file) {
                                          setStampFile(file);
                                          setStampPreviewUrl(
                                            URL.createObjectURL(file),
                                          );
                                          setStampPreviewIsObjectUrl(true);
                                          setShowStampPreview(false);
                                        } else {
                                          setStampFile(null);
                                          setStampPreviewUrl(null);
                                          setStampPreviewIsObjectUrl(false);
                                          setShowStampPreview(false);
                                        }
                                      }}
                                      className="hidden"
                                    />
                                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                      {stampPreviewUrl ? (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setShowStampPreview((p) => !p)
                                            }
                                            className="rounded-lg bg-primary px-3 py-1 text-white text-xs font-semibold hover:bg-primary/90"
                                          >
                                            {showStampPreview
                                              ? language === "am"
                                                ? "ይቅር"
                                                : "Hide preview"
                                              : language === "am"
                                                ? "እይታ"
                                                : "Preview"}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              stampFileInputRef.current?.click()
                                            }
                                            className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                          >
                                            {language === "am"
                                              ? "ቀይር"
                                              : "Change"}
                                          </button>
                                          <span className="text-xs text-gray-400">
                                            {stampFile?.name ||
                                              (language === "am"
                                                ? "ቀድሞ የተወሰደ ፎቶ"
                                                : "Existing stamp available")}
                                          </span>
                                        </>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            stampFileInputRef.current?.click()
                                          }
                                          className="rounded-lg bg-primary px-3 py-2 text-white text-xs font-semibold hover:bg-primary/90"
                                        >
                                          {language === "am"
                                            ? "ፎቶ ይጨምሩ"
                                            : "Upload stamp"}
                                        </button>
                                      )}
                                    </div>
                                    {stampPreviewUrl && showStampPreview && (
                                      <div className="mt-3 w-full overflow-hidden rounded-xl border border-gray-200">
                                        <img
                                          src={stampPreviewUrl}
                                          alt={
                                            language === "am"
                                              ? "የማስፈረሚ እይታ"
                                              : "Stamp preview"
                                          }
                                          className="object-contain mx-auto"
                                          style={{
                                            minWidth: 160,
                                            maxWidth: 420,
                                            minHeight: 120,
                                            maxHeight: 260,
                                          }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setShowStampModal(false);
                                        setShowStampPreview(false);
                                        // Only clear new uploads, not existing stamp preview
                                        if (stampPreviewIsObjectUrl) {
                                          setStampPreviewUrl(null);
                                          setStampFile(null);
                                        }
                                      }}
                                      className="px-4 py-2 bg-white border rounded-lg"
                                    >
                                      {language === "am" ? "ተመለስ" : "Cancel"}
                                    </button>
                                    <button
                                      type="submit"
                                      disabled={isStamping}
                                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg"
                                    >
                                      {isStamping
                                        ? language === "am"
                                          ? "በማስፈረም ላይ..."
                                          : "Stamping..."
                                        : language === "am"
                                          ? "ማስፈረሚ ይሙሉ"
                                          : "Stamp Certificate"}
                                    </button>
                                  </div>
                                </form>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      {signatureAuthorityTitleLines.length > 0 && (
                        <div className=" min-w-[140px] w-full text-center text-[10px] leading-tight font-semibold text-primary space-y-1 mr-2 -mt-[10px]">
                          {signatureAuthorityTitleLines.map((line, index) => (
                            <div key={index}>{line}</div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-white p-3 border-4 border-primary rounded-2xl shadow-xl z-30 mb-2 mr-[-2px] ml-auto min-w-[120px]">
                      <div className="w-32 h-32 flex flex-col items-center justify-center text-primary">
                        {cert?.qrCodeValue ? (
                          <a
                            href={cert.qrCodeValue}
                            target="_blank"
                            rel="noreferrer"
                            className="flex flex-col items-center justify-center"
                          >
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(
                                cert.qrCodeValue,
                              )}`}
                              alt={
                                language === "am"
                                  ? "የፈቃድ እይታ QR"
                                  : "License verification QR"
                              }
                              className="w-28 h-28 mb-1 object-contain"
                              referrerPolicy="no-referrer"
                            />
                            <span className="text-[8px] font-black uppercase tracking-tighter text-center leading-tight">
                              Verify License
                            </span>
                          </a>
                        ) : (
                          <>
                            <QrCode className="w-16 h-16 mb-1" />
                            <span className="text-[8px] font-black uppercase tracking-tighter text-center leading-tight">
                              Verify License
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {cert?.signedByOfficial ? (
                      cert?.stampedAt ? null : isLicensingAuthority ? null : null
                    ) : isAuthorizedSigner ? (
                      <button
                        disabled={isSigning}
                        onClick={() => {
                          setSignFullNameAm("");
                          setSignPositionId(null);
                          fetchPositions();
                          fetchCurrentOfficial();
                          setShowSignModal(true);
                        }}
                        className="mt-3 inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isSigning
                          ? language === "am"
                            ? "በማስፈረም ላይ..."
                            : "Signing..."
                          : language === "am"
                            ? "ፈቃድ ይፈርሙ"
                            : "Sign Certificate"}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Background Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                <Shield className="w-[600px] h-[600px] text-[#FFD700]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <AutoDismissToast
        isOpen={toast.isOpen}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          .no-print { display: none !important; }
          
          /* Hide parent dashboard sidebars, headers, and footers */
          aside, header, footer { display: none !important; }
          
          body, html, #root {
            background: white !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          div.h-screen, 
          div.overflow-hidden, 
          div.overflow-y-auto,
          div.flex-grow,
          .sidebar-scrollbar,
          .custom-scrollbar {
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            overflow: visible !important;
            display: block !important;
            position: relative !important;
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
          }

          main {
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            height: auto !important;
            display: block !important;
          }
          
          .max-w-4xl { max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
          .pb-20 { padding-bottom: 0 !important; }
          
         @page {
  size: A4 portrait;
  margin: 0;
}

@media print {
  .no-print {
    display: none !important;
  }

  html,
  body,
  #root {
    width: 210mm !important;
    height: 297mm !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    background: white !important;
  }

  #license-scaler-container {
    width: 210mm !important;
    height: 297mm !important;
    overflow: hidden !important;
    margin: 0 !important;
    padding: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    page-break-after: avoid !important;
    page-break-inside: avoid !important;
  }

  #license-scale-wrapper {
    transform: none !important;
    width: 100% !important;
    height: 100% !important;
    position: relative !important;
    left: 0 !important;
    top: 0 !important;
    margin: 0 !important;
    overflow: hidden !important;
  }

  #license-certificate,
  #license-certificate * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  #license-certificate {
    width: 198mm !important;
    height: 285mm !important;
    margin: auto !important;
    padding: 8mm !important;
    box-sizing: border-box !important;
    overflow: hidden !important;

    border: 10px double var(--safe-secondary-30) !important;
    border-radius: 0 !important;
    box-shadow: none !important;

    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
}
        }
      `,
        }}
      />
      {showSignModal && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">
                {language === "am"
                  ? "ፊርማ ይጨምሩ"
                  : "Upload Signature and Details"}
              </h3>
              <button
                onClick={() => {
                  setShowSignModal(false);
                  setShowSignPreview(false);
                }}
                className="text-sm text-gray-500"
              >
                {language === "am" ? "ዝጋ" : "Close"}
              </button>
            </div>
            <form className="mt-4 space-y-4" onSubmit={handleSubmitSign}>
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  {language === "am" ? "ፊርማ ፎቶ" : "Signature Photo"}
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    if (
                      signSignaturePreviewIsObjectUrl &&
                      signSignaturePreviewUrl
                    ) {
                      URL.revokeObjectURL(signSignaturePreviewUrl);
                    }
                    if (file) {
                      setSignFile(file);
                      setSignSignaturePreviewUrl(URL.createObjectURL(file));
                      setSignSignaturePreviewIsObjectUrl(true);
                      setShowSignPreview(false);
                    } else {
                      setSignFile(null);
                      setSignSignaturePreviewUrl(null);
                      setSignSignaturePreviewIsObjectUrl(false);
                      setShowSignPreview(false);
                    }
                  }}
                  className="hidden"
                />
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                  {signSignaturePreviewUrl ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowSignPreview((prev) => !prev)}
                        className="rounded-lg bg-primary px-3 py-1 text-white text-xs font-semibold hover:bg-primary/90"
                      >
                        {showSignPreview
                          ? language === "am"
                            ? "ይቅር"
                            : "Hide preview"
                          : language === "am"
                            ? "እይታ"
                            : "Preview"}
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        {language === "am" ? "ቀይር" : "Change"}
                      </button>
                      <span className="text-xs text-gray-400">
                        {signFile?.name ||
                          (language === "am"
                            ? "ቀድሞ የተወሰደ ፎቶ"
                            : "Existing signature available")}
                      </span>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-lg bg-primary px-3 py-2 text-white text-xs font-semibold hover:bg-primary/90"
                    >
                      {language === "am" ? "ፊርማ ይጨምሩ" : "Upload signature"}
                    </button>
                  )}
                </div>
                {signSignaturePreviewUrl && showSignPreview && (
                  <div className="mt-3 w-full overflow-hidden rounded-xl border border-gray-200">
                    <img
                      src={signSignaturePreviewUrl}
                      alt={language === "am" ? "የፊርማ እይታ" : "Signature preview"}
                      className="object-contain mx-auto"
                      style={{
                        minWidth: 160,
                        maxWidth: 420,
                        minHeight: 120,
                        maxHeight: 260,
                      }}
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  {language === "am" ? "ሙሉ ስም (እንግሊዝኛ)" : "Full name (English)"}
                </label>
                <input
                  value={signFullNameEn}
                  readOnly
                  className="w-full mt-2 rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-gray-700 cursor-not-allowed"
                  placeholder={
                    language === "am"
                      ? "Full name in English"
                      : "Full name in English"
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  {language === "am" ? "ሙሉ ስም (አማርኛ)" : "Full name (Amharic)"}
                </label>
                <input
                  value={signFullNameAm}
                  onChange={(e) => setSignFullNameAm(e.target.value)}
                  className="w-full mt-2 rounded-lg border px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  {language === "am"
                    ? "የፌዴራል ፖሊስ ቦታ"
                    : "Federal Police Position"}
                </label>
                <select
                  value={signPositionId ?? ""}
                  onChange={(e) =>
                    setSignPositionId(
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                  className="w-full mt-2 rounded-lg border px-3 py-2"
                >
                  <option value="">
                    {language === "am" ? "ቦታ ይምረጡ" : "Select position"}
                  </option>
                  {positions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nameEnglish} — {p.nameAmharic}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowSignModal(false);
                    setShowSignPreview(false);
                  }}
                  className="px-4 py-2 bg-white border rounded-lg"
                >
                  {language === "am" ? "ተመለስ" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isSigning}
                  className="px-4 py-2 bg-primary text-white rounded-lg"
                >
                  {isSigning
                    ? language === "am"
                      ? "በማስፈረም..."
                      : "Signing..."
                    : language === "am"
                      ? "ፈቃድ ይፈርሙ"
                      : "Sign Certificate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LicenseViewer;
