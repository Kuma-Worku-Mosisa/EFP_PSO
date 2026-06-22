// filepath: frontend/src/components/AgreementView.tsx
import React, { useRef, useState } from "react";
import { ShieldCheck, Download, Loader2, Printer } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Define strict prop types for component reusability
interface AgreementViewProps {
  language?: "am" | "en";
  loading?: boolean;
  error?: string | null;
  org?: {
    name?: string;
    nameEnglish?: string;
    nameAmharic?: string;
    email?: string;
    phone?: string;
    faxNumber?: string;
    numberOfOffices?: number;
    numberOfComputers?: number;
    numberOfVehicles?: number;
  };
  application?: {
    user?: {
      fullName?: string;
      phone?: string;
      email?: string;
    };
  };
  agreement?: {
    agreementNumber?: string;
  };
  recruitmentDeadline?: string;
  setRecruitmentDeadline?: (value: string) => void;
  effectiveDeadline?: string;
  regionName?: string;
  regionNameEnglish?: string;
  regionNameAmharic?: string;
  zoneName?: string;
  zoneNameEnglish?: string;
  zoneNameAmharic?: string;
  woredaName?: string;
  woredaNameEnglish?: string;
  woredaNameAmharic?: string;
  kebeleName?: string;
  kebeleNameEnglish?: string;
  kebeleNameAmharic?: string;
  address?: {
    specialLocation?: string;
    houseNumber?: string;
  };
}

export const AgreementView: React.FC<AgreementViewProps> = ({
  language = "en",
  loading = false,
  error = null,
  org,
  application,
  agreement,
  recruitmentDeadline = "",
  setRecruitmentDeadline,
  effectiveDeadline,
  regionName = "",
  regionNameEnglish,
  regionNameAmharic,
  zoneName = "",
  zoneNameEnglish,
  zoneNameAmharic,
  woredaName = "",
  woredaNameEnglish,
  woredaNameAmharic,
  kebeleName = "",
  kebeleNameEnglish,
  kebeleNameAmharic,
  address,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  // Fallback utility functions to ensure self-containment
  const safeText = (text: any, fallback = "---") => text || fallback;
  const safeNumber = (num: any, fallback = 0) =>
    num !== undefined && num !== null ? num : fallback;
  const formatDate = (dateStr: any) => {
    if (!dateStr) return "---";
    try {
      return new Date(dateStr).toLocaleDateString(
        language === "am" ? "am-ET" : "en-US",
      );
    } catch {
      return dateStr;
    }
  };

  const localizedRegionName =
    language === "am"
      ? regionNameAmharic || regionName || regionNameEnglish || ""
      : regionNameEnglish || regionName || regionNameAmharic || "";
  const localizedZoneName =
    language === "am"
      ? zoneNameAmharic || zoneName || zoneNameEnglish || ""
      : zoneNameEnglish || zoneName || zoneNameAmharic || "";
  const localizedWoredaName =
    language === "am"
      ? woredaNameAmharic || woredaName || woredaNameEnglish || ""
      : woredaNameEnglish || woredaName || woredaNameAmharic || "";
  const localizedKebeleName =
    language === "am"
      ? kebeleNameAmharic || kebeleName || kebeleNameEnglish || ""
      : kebeleNameEnglish || kebeleName || kebeleNameAmharic || "";

  const concatenatedAddress =
    [
      localizedRegionName,
      localizedZoneName,
      localizedWoredaName,
      localizedKebeleName,
      address?.specialLocation,
      address?.houseNumber,
    ]
      .filter(Boolean)
      .join(", ") || "---";

  const orgDisplayName =
    language === "am"
      ? org?.nameAmharic || org?.name || org?.nameEnglish || "---"
      : org?.nameEnglish || org?.name || org?.nameAmharic || "---";

  // PDF Export Engine
  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    setIsDownloading(true);

    try {
      // Configuration options for crisp text image rendering
      const canvasOptions = {
        scale: 2, // High DPI capture
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      };

      const canvas = await html2canvas(contentRef.current, canvasOptions);

      // Create an A4 Portrait Document context
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const pageHeightPx = Math.floor((canvas.width * pdfHeight) / pdfWidth);
      let remainingHeight = canvas.height;
      let position = 0;
      let pageIndex = 0;

      while (remainingHeight > 0) {
        const sliceHeight = Math.min(pageHeightPx, remainingHeight);
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sliceHeight;

        const ctx = sliceCanvas.getContext("2d");
        if (!ctx) break;

        ctx.drawImage(
          canvas,
          0,
          position,
          canvas.width,
          sliceHeight,
          0,
          0,
          canvas.width,
          sliceHeight,
        );

        const imgData = sliceCanvas.toDataURL("image/jpeg", 0.95);
        if (pageIndex > 0) pdf.addPage();
        const sliceHeightMm = (sliceHeight * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, sliceHeightMm);

        remainingHeight -= sliceHeight;
        position += sliceHeight;
        pageIndex += 1;
      }

      // Save document
      const fileName = `Agreement_${agreement?.agreementNumber || "Contract"}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 print:max-w-none print:mx-0 print:space-y-0">
      {/* Upper Navigation & Action Header */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex items-center justify-between print:hidden">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-50 rounded-2xl">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {language === "am" ? "የውል ስምምነት" : "Agreement & Contract"}
            </h2>
            <p className="text-gray-500 text-sm">
              {language === "am"
                ? "ከፌዴራል ፖሊስ ጋር የመጨረሻውን የፈቃድ ስምምነት ይገምግሙ እና ይፈርሙ።"
                : "Review and sign the final licensing agreement with the Federal Police."}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            disabled={loading || !!error}
            className="flex items-center space-x-2 px-4 py-2.5 bg-white text-gray-700 rounded-xl font-bold text-sm border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            <span>{language === "am" ? "አትም" : "Print"}</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading || loading || !!error}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all disabled:opacity-50"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>
              {isDownloading
                ? language === "am"
                  ? "በማዘጋጀት ላይ..."
                  : "Generating..."
                : language === "am"
                  ? "አውርድ (PDF)"
                  : "Download PDF"}
            </span>
          </button>
        </div>
      </div>

      {/* Main Core View Area */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center text-gray-500 border border-gray-100 shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
          {language === "am" ? "መረጃ በመጫን ላይ..." : "Loading agreement data..."}
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4 text-sm">
          {error}
        </div>
      ) : (
        <div className="space-y-8 print:space-y-0" ref={contentRef}>
          {/* ==================== PAGE WRAPPER ==================== */}
          <div
            className="bg-white p-12 rounded-3xl border border-gray-200 space-y-8 w-full flex flex-col justify-between shadow-sm print:shadow-none print:border-transparent print:rounded-none print:p-0 print:aspect-auto print:justify-start"
            style={{ boxSizing: "border-box" }}
          >
            <div className="space-y-2">
              {setRecruitmentDeadline && (
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block">
                    {language === "am"
                      ? "የቅጥር መጨረሻ ቀን"
                      : "Recruitment Deadline"}
                  </label>
                  <input
                    type="datetime-local"
                    value={recruitmentDeadline}
                    onChange={(e) => setRecruitmentDeadline(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Preamble Content Blocks */}
              <div className="font-serif text-gray-800 leading-relaxed space-y-4 text-base">
                {language === "am" ? (
                  <>
                    <div className="font-bold text-gray-900 text-center">
                      የኢትዮጵያ ፌዴራል ፖሊስ
                    </div>
                    <h3 className="font-bold text-center text-lg py-2 border-b border-gray-100">
                      የብቃት ማረጋገጫ ከፌደራል ፖሊስ ወስደው የግል ጥበቃ አገልግሎት መስጠት ለሚጀምሩ ተቋማት
                      የሚሞላ የውል ቅጽ
                    </h3>
                    <p className="text-justify indent-8">
                      እኛ{" "}
                      <span className="font-semibold text-gray-900 underline px-1">
                        {orgDisplayName}
                      </span>{" "}
                      የግል ጥበቃ አገልግሎት ተቋማት ኃላ/የተ/የግ/ማህበር የከፈትነው ዋና መስሪያ ቤት አድራሻ፡
                      ክልል{" "}
                      <span className="font-semibold text-gray-900">
                        {safeText(localizedRegionName, "---")}
                      </span>
                      , ዞን{" "}
                      <span className="font-semibold text-gray-900">
                        {safeText(localizedZoneName, "---")}
                      </span>
                      , ወረደ{" "}
                      <span className="font-semibold text-gray-900">
                        {safeText(localizedWoredaName, "---")}
                      </span>
                      , ቀበሌ{" "}
                      <span className="font-semibold text-gray-900">
                        {safeText(localizedKebeleName, "---")}
                      </span>
                      , ልዩ ቦታ{" "}
                      <span className="font-semibold text-gray-900">
                        {safeText(address?.specialLocation, "---")}
                      </span>
                      , የቤት ቁጥር{" "}
                      <span className="font-semibold text-gray-900">
                        {safeText(address?.houseNumber, "---")}
                      </span>{" "}
                      ስልክ{" "}
                      <span className="font-semibold text-gray-900">
                        {safeText(org?.phone, "---")}
                      </span>{" "}
                      ሲሆን የፌደራል ፖሊስ ባዘጋጀው የሙያ ብቃት ማረጋገጫ መስፈርት አሰጣጥና ምክር አገልግሎት
                      መሰረት የቴክኒክ ኮሚቴ በአካል ሄዶ የኢንስፔክሽንና ጥናት ላይ የሚመለከታቸው ይሆናል፡፡
                    </p>
                    <p>1. ኃላፊዎች አልተቀየሩም / ተቀይረዋል / የተሰናበቱ / የተቀጠሩ ሠራተኞች</p>
                    <p>
                      2. የሰራተኞች ስም ዝርዝር፣ የስራ ምደባ፣ የቢሮ ብዛት (
                      <span className="font-semibold text-gray-900">
                        {safeNumber(org?.numberOfOffices)}
                      </span>
                      ), የኮምፒውተር ብዛት (
                      <span className="font-semibold text-gray-900">
                        {safeNumber(org?.numberOfComputers)}
                      </span>
                      )
                    </p>
                    <p>
                      3. የተሸከርካሪ (በተቋሙ ስም የተመዘገቡ) ብዛት (
                      <span className="font-semibold text-gray-900">
                        {safeNumber(org?.numberOfVehicles)}
                      </span>
                      ), የቤት ኪራይ ውል (የይዞታ ማረጋገጫ ካርታ)
                    </p>
                    <p>
                      4. የመስሪያ ቤቱ የስራ ቦታ ለስራ ግልፅና አመች መሆኑን በትክክል አሟልተን ያቀረብን
                      መሆናችንን እና ለወደፊትም በወር ውስጥ ሰራተኛ መቅጠር ስንጀምር ኢንሹራንስ ሽፋን ሪፖርት፣
                      የደመወዝ ፔሮል፣ የማህበራዊ ዋስትና የክክፍያ ደረሰኝ
                    </p>
                    <p>
                      5. ከሚኖሩበት የቀበሌ አስተዳደር የድጋፍ ደብዳቤ፣ መልካም ሥነ-ምግባር ያለው/ት፣ የት/ት
                      ደረጃ፣ የስልጠና ማንዋል፣ የስልጠና ቦታ፣ ስልጠና የሰጠው አካል፣ ስልጠና የወሰደ /
                      ያልወሰደ፣ ስልጠና የተሰጠው ቀን፣ የስልጠና ምስክር ወረቀት፣ ግምጃ ቤት፣ የጥበቃ ሰራተኞች
                      አሻራ፣ ሜዲካል፣ የዋሱ አድራሻና የሰራበት ተቋም፣ የዋስትና አይነት፣ የቀበሌ መታወቂያ
                      /ፓስፖርት/ የታደሰ፣ የሰራ ልምድ፣ መልቀቂያ፣ የት/ት ደረጃ፣ የተቋሙ መታወቂያ የታደሰ፣
                      የቅጥር ደብዳቤ፣ የነበረበት ተቋም ስም መከላከያ / ፖሊስ / ሌሎች፣ ብሄራዊ ዲጂታል
                      መታወቂያ ካርድ፣ ዕድሜ፣ ቁመት ለወንድ (ሜትር) እና ክብደት (ኪ/ግራም)።
                    </p>
                    <p>
                      6. የሚጠቀመው ቴክኖሎጂ፣ የአገልግሎት ተጠቃሚ ውል፣ የቦታው ስም፣ የተመደበ የሰው ኃይል
                      ብዛት
                    </p>
                    <p>
                      ከዚህ በላይ ከተራ ቁጥር 1-6 በተመላከተው የጥበቃ ሰራተኞች ምልመላና ቅጥር መስፈርት
                      መሰረት ማሟላት የሚገባንን የምናሟላ መሆናችንን እያመለከትን እናሟላለን ያልናቸውን ሳናሟላ
                      በሀሰት እንዳሟላን ሆኖ አቅርበን ከተገኘብን እንዲሁም በተገለጸው ጊዜ አሟልተን ካልተገኘን
                      በፌደራል ፖሊስ በወጣው መመሪያ ቁጥር 2018 አንቀፅ መሰረት ለፌደራል ፖሊስ ሙያ ብቃት
                      ማረጋገጫና ምክር አገልግሎት የስራ ክፍል በተሰጠው ስልጣን ከተገለጸው በተጨማሪ ከተራ ቁጥር
                      አንዱን አጉድለን ከተገኘን በተቋማችን ላይ ለሚወሰደው የመመሪያ ጥሰት እና ህጋዊ እርምጃ
                      እያንዳንዱን አንብበን የተስማማን መሆናችንን በፊርማችን አረጋግጠናል፡፡
                    </p>
                  </>
                ) : (
                  <>
                    <div className="font-bold uppercase tracking-wide text-gray-900 text-center">
                      Ethiopian Federal Police
                    </div>
                    <h3 className="font-bold text-center text-lg uppercase py-2 border-b border-gray-100">
                      Qualification Confirmation Contract Form for Private
                      Security Service Providers
                    </h3>
                    <p className="text-justify indent-8">
                      We{" "}
                      <span className="font-semibold text-gray-900 underline px-1">
                        {orgDisplayName}
                      </span>
                      , a Private Protection Service Institution, having our
                      main office address at: Region/City{" "}
                      <span className="font-semibold text-gray-900">
                        {safeText(localizedRegionName, "---")}
                      </span>
                      , Zone/Sub-city{" "}
                      <span className="font-semibold text-gray-900">
                        {safeText(localizedZoneName, "---")}
                      </span>
                      , Woreda{" "}
                      <span className="font-semibold text-gray-900">
                        {safeText(localizedWoredaName, "---")}
                      </span>
                      , Kebele{" "}
                      <span className="font-semibold text-gray-900">
                        {safeText(localizedKebeleName, "---")}
                      </span>
                      , Special Place{" "}
                      <span className="font-semibold text-gray-900">
                        {safeText(address?.specialLocation, "---")}
                      </span>
                      , House Number{" "}
                      <span className="font-semibold text-gray-900">
                        {safeText(address?.houseNumber, "---")}
                      </span>
                      , with permanent phone number{" "}
                      <span className="font-semibold text-gray-900">
                        {safeText(org?.phone, "---")}
                      </span>
                      , hereby acknowledge that the Technical Committee will
                      conduct an in-person inspection and study based on the
                      Career Competence Confirmation requirements set by the
                      Federal Police.
                    </p>
                    <p>
                      1. Confirmation that administrative leadership/officers
                      have not changed / or have been updated accordingly.
                    </p>
                    <p>
                      2. Complete list of personnel, work assignments, number of
                      operational offices (
                      <span className="font-semibold text-gray-900">
                        {safeNumber(org?.numberOfOffices)}
                      </span>
                      ), and total functional computers (
                      <span className="font-semibold text-gray-900">
                        {safeNumber(org?.numberOfComputers)}
                      </span>
                      ).
                    </p>
                    <p>
                      3. Number of official vehicles registered in the
                      institution's name (
                      <span className="font-semibold text-gray-900">
                        {safeNumber(org?.numberOfVehicles)}
                      </span>
                      ) along with valid lease contracts or deeds.
                    </p>
                    <p>
                      4. We confirm that the workplace is explicitly structured
                      and suitable for security administration. Furthermore,
                      within{" "}
                      <span className="font-semibold text-gray-900">
                        {formatDate(effectiveDeadline)}
                      </span>{" "}
                      months of active recruitment initialization, we pledge to
                      submit regular insurance cover profiles, active salary
                      payroll matrix records, and official social security
                      receipts.
                    </p>
                    <p>
                      5. Structural prerequisites: Kebele clearance
                      documentation, ethical track statements, standard training
                      manual blueprints, certified equipment depots, mandatory
                      ballistic/fingerprint bio-scans, verified guarantor
                      identities, active National Digital ID cards, and
                      biometric compliance checklists (height/weight ranges).
                    </p>
                    <p>
                      6. Deployed technology lists, consumer protection
                      agreements, tactical deployment maps, and human asset
                      quantities.
                    </p>
                    <p>
                      We hereby declare that we will fulfill all baseline
                      criteria listed under provisions 1-6. If discovered that
                      false validation metrics were supplied, or if we fail to
                      execute compliance criteria within{" "}
                      <span className="font-semibold text-gray-900">
                        {formatDate(effectiveDeadline)}
                      </span>
                      , we fully surrender to corporate structural penalties,
                      dynamic audit suspensions, or formal legal indictments
                      issued under Federal Police Commission Directive No. 2018.
                    </p>
                  </>
                )}
              </div>
            </div>
            {/* Validation Verification Footer */}
            <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-end text-[10px] text-gray-400 font-mono space-y-4 sm:space-y-0 print:pt-6 print:text-gray-700 print:break-inside-avoid">
              <div className="space-y-1">
                <p>
                  {language === "am"
                    ? "በስርዓቱ የተረጋገጠ ሰነድ"
                    : "SYSTEM VERIFIED DOCUMENT"}
                </p>
                <p>
                  {language === "am" ? "መለያ" : "ID"}:{" "}
                  <span className="font-semibold text-gray-800">
                    {agreement?.agreementNumber || "FP-AGR-XXXXXXX"}
                  </span>
                </p>
              </div>
              <div className="text-left sm:text-right space-y-1">
                <p>
                  {language === "am" ? "አመልካች" : "APPLICANT"}:{" "}
                  <span className="font-semibold text-gray-800 uppercase">
                    {safeText(application?.user?.fullName, "Full Name")}
                  </span>
                </p>
                <p>
                  {language === "am" ? "ስልክ" : "PHONE"}:{" "}
                  <span className="font-semibold text-gray-800">
                    {safeText(application?.user?.phone, "Phone Number")}
                  </span>
                </p>
                {/* <p className="text-[9px] text-blue-500 font-semibold uppercase tracking-wider">
                  {language === "am"
                    ? "ዲጂታል ፊርማ በስርዓቱ ጸድቋል"
                    : "DIGITAL SIGNATURE ATTACHED UPON SUBMISSION"}
                </p> */}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
