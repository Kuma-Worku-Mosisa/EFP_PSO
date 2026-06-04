// filepath: frontend/src/pages/LicenseViewer.tsx
import React, { useRef } from "react";
import { Shield, Download, Printer, User, QrCode } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useParams, useLocation } from "react-router-dom";
import { apiRequest, resolveBackendAssetUrl } from "../lib/api";

// Helper to convert OKLCH strings to safe sRGB colors for html2canvas
const convertOklchStringToRgb = (str: string): string => {
  if (typeof str !== "string" || !str.includes("oklch")) return str;

  return str.replace(/oklch\(([^)]+)\)/g, (match, content) => {
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
          if (typeof val === "string" && val.includes("oklch")) {
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
  const [cert, setCert] = React.useState<any>(null);
  const [loadingCert, setLoadingCert] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);

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
          const listResp = await apiRequest("/certifications");
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

  const formatDate = (
    raw?: string | Date | null,
    locale: "am" | "en" = "en",
  ) => {
    if (!raw) return "-";
    try {
      const d = new Date(raw);
      return locale === "am"
        ? d.toLocaleDateString("am-ET")
        : d.toLocaleDateString();
    } catch {
      return String(raw);
    }
  };

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
      pdf.save("Abyssinia_Security_Agency_License.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert(
        language === "am"
          ? 'PDF ማውረድ አልተሳካም። እባክዎ "አትም" የሚለውን አማራጭ ይጠቀሙ።'
          : "Failed to generate PDF. Please try using the Print option instead.",
      );
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
                    <div className="w-34 h-34 bg-white rounded-full flex items-center justify-center p-1 border-4 border-[var(--safe-secondary-20)] shadow-sm">
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
                  <div className="w-44 h-28 bg-white rounded-xl flex items-center justify-center p-1 border-2 border-[var(--safe-secondary-20)] shadow-sm mt-2 overflow-hidden">
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
                  <div className="applicant-photo-frame w-36 h-44 border-2 border-dashed border-[var(--safe-secondary-30)] rounded-lg flex flex-col items-center justify-center bg-[var(--safe-secondary-10)] text-[var(--safe-secondary-500)] p-1.5 text-center">
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
                          {cert?.certificateSerialNumber || "-"}
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
                          {formatDate(cert?.issueDate, "en")}
                        </span>
                      </div>

                      <div className="border-b border-[var(--safe-secondary-10)] pb-1.5">
                        <span className={labelClass}>Date of Expired: </span>
                        <span className={valueClass}>
                          {formatDate(cert?.expiryDate, "en")}
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
                <div className="mt-auto pt-4 flex justify-between items-end">
                  {/* Signature Area */}
                  <div className="space-y-3">
                    <div className="w-56 h-24 border-b-2 border-[var(--safe-secondary-30)] relative flex items-center justify-center">
                      {/* Stamp Placeholder */}
                      <div className="absolute -top-4 -right-12 w-20 h-20 border-4 border-[var(--safe-secondary-30)] rounded-full flex items-center justify-center rotate-12 pointer-events-none">
                        <div className="text-[7px] font-bold text-[var(--safe-secondary-30)] text-center uppercase">
                          የፌዴራል ፖሊስ
                          <br />
                          ኮሚሽን ማህተም
                          <br />
                          STAMP
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] text-gray-400 font-bold uppercase">
                          የኮሚሽነሩ ፊርማ
                        </p>
                        <p className="text-[10px] text-gray-400 italic">
                          Commissioner's Signature
                        </p>
                      </div>
                    </div>
                    <p className="text-[9px] font-bold text-primary uppercase tracking-tighter">
                      የፌዴራል ፖሊስ ኮሚሽነር / Commissioner of Federal Police
                    </p>
                  </div>

                  {/* Bottom Right: QR Code Space */}
                  <div className="bg-white p-3 border-4 border-primary rounded-2xl shadow-xl z-30 mb-2 mr-2">
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
              </div>

              {/* Background Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                <Shield className="w-[600px] h-[600px] text-[#FFD700]" />
              </div>
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default LicenseViewer;
