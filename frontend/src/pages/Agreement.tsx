//filepath: frontend/src/pages/Agreement.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import {
  CheckCircle2,
  Download,
  AlertCircle,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { apiRequest } from "../lib/api";

type AgreementPayload = {
  id: number;
  agreementNumber: string;
  status: string;
  recruitmentDeadline: string;
  issuedDate: string;
  expiryDate: string;
  snapshotData: Record<string, any>;
  organization?: { name: string; tinNumber: string };
  signedBy?: { fullName: string; email: string; phone?: string };
};

type ApplicationPayload = {
  id: number;
  organization: {
    name: string;
    email: string;
    phone: string;
    faxNumber?: string | null;
    numberOfOffices?: number | null;
    numberOfComputers?: number | null;
    numberOfVehicles?: number | null;
    address?: {
      houseNumber?: string | null;
      specialLocation?: string | null;
      kebele?: {
        name?: string | null;
        woreda?: {
          name?: string | null;
          zone?: { name?: string | null; region?: { name?: string | null } };
        };
      };
    };
  };
  user: { fullName: string; phone: string; email: string };
};

export const Agreement = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [agreed, setAgreed] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [application, setApplication] =
    React.useState<ApplicationPayload | null>(null);
  const [agreement, setAgreement] = React.useState<AgreementPayload | null>(
    null,
  );
  const [recruitmentYear, setRecruitmentYear] = React.useState("");
  const [recruitmentMonth, setRecruitmentMonth] = React.useState("");
  const [recruitmentDay, setRecruitmentDay] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [calendarType, setCalendarType] = React.useState<
    "gregorian" | "ethiopian"
  >("gregorian");

  const safeText = (value?: string | null, fallback = "N/A") =>
    value && value.trim().length > 0 ? value : fallback;
  const safeNumber = (value?: number | null, fallback = "N/A") =>
    typeof value === "number" && Number.isFinite(value)
      ? value.toString()
      : fallback;
  const formatDate = (value?: string | null) => {
    if (!value) return "N/A";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "N/A"
      : date.toLocaleDateString("en-GB");
  };

  const currentYear = new Date().getUTCFullYear();
  const yearOptions = React.useMemo(() => {
    if (calendarType === "gregorian") return [String(currentYear)];
    // Ethiopian year approx = gregorian year - 8
    const ethCurrent = currentYear - 8;
    return [String(ethCurrent)];
  }, [calendarType, currentYear]);

  React.useEffect(() => {
    if (!recruitmentYear && yearOptions.length > 0) {
      setRecruitmentYear(yearOptions[0]);
    }
  }, [yearOptions, recruitmentYear]);

  const gregorianMonthOptions = React.useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        value: String(i + 1).padStart(2, "0"),
        label: new Date(0, i).toLocaleString("en-GB", { month: "short" }),
      })),
    [],
  );
  const ethiopianMonthList = [
    { value: "01", label: language === "am" ? "መስከረም" : "Meskerem" },
    { value: "02", label: language === "am" ? "ጥቅምት" : "Tikimt" },
    { value: "03", label: language === "am" ? "ህዳር" : "Hidar" },
    { value: "04", label: language === "am" ? "ታኅሣሥ" : "Tahsas" },
    { value: "05", label: language === "am" ? "ጥር" : "Tir" },
    { value: "06", label: language === "am" ? "የካቲት" : "Yekatit" },
    { value: "07", label: language === "am" ? "መጋቢት" : "Megabit" },
    { value: "08", label: language === "am" ? "ሚያዝያ" : "Miazia" },
    { value: "09", label: language === "am" ? "ግንቦት" : "Ginbot" },
    { value: "10", label: language === "am" ? "ሰኔ" : "Sene" },
    { value: "11", label: language === "am" ? "ሀምሌ" : "Hamle" },
    { value: "12", label: language === "am" ? "ነሐሴ" : "Nehasse" },
    { value: "13", label: language === "am" ? "ጳጉሜ" : "Pagume" },
  ];

  const dayOptionsFor = React.useCallback(
    (year: string, monthValue: string) => {
      if (calendarType === "gregorian")
        return Array.from({ length: 31 }, (_, i) =>
          String(i + 1).padStart(2, "0"),
        );
      // Ethiopian months 1-12 have 30 days, month 13 has 5 or 6 depending on leap year
      const m = Number(monthValue);
      if (!monthValue)
        return Array.from({ length: 31 }, (_, i) =>
          String(i + 1).padStart(2, "0"),
        );
      if (m >= 1 && m <= 12)
        return Array.from({ length: 30 }, (_, i) =>
          String(i + 1).padStart(2, "0"),
        );
      // month 13
      const y = Number(year);
      const isLeap = y % 4 === 3; // approximate Ethiopian leap rule
      return Array.from({ length: isLeap ? 6 : 5 }, (_, i) =>
        String(i + 1).padStart(2, "0"),
      );
    },
    [calendarType],
  );

  const assembleDateISO = () => {
    if (!recruitmentYear || !recruitmentMonth || !recruitmentDay) return null;
    if (calendarType === "gregorian") {
      const y = Number(recruitmentYear);
      const m = Number(recruitmentMonth);
      const d = Number(recruitmentDay);
      const dt = new Date(Date.UTC(y, m - 1, d));
      if (
        dt.getUTCFullYear() === y &&
        dt.getUTCMonth() + 1 === m &&
        dt.getUTCDate() === d
      ) {
        return dt.toISOString();
      }
      return null;
    }

    // approximate Ethiopian -> Gregorian conversion
    const eY = Number(recruitmentYear);
    const eM = Number(recruitmentMonth);
    const eD = Number(recruitmentDay);
    // Ethiopian new year roughly falls on Gregorian Sep 11 (or Sep 12 in some years)
    const baseGregYear = eY + 7;
    const base = new Date(Date.UTC(baseGregYear, 8, 11)); // Sep 11
    const totalDays = (eM - 1) * 30 + (eD - 1);
    const g = new Date(base.getTime() + totalDays * 86400000);
    return g.toISOString();
  };

  const isValidDate = () => !!assembleDateISO();

  const org = application?.organization;
  const address = org?.address;
  const regionName = address?.kebele?.woreda?.zone?.region?.name;
  const zoneName = address?.kebele?.woreda?.zone?.name;
  const woredaName = address?.kebele?.woreda?.name;
  const kebeleName = address?.kebele?.name;
  const effectiveDeadline = (() => {
    if (agreement?.recruitmentDeadline) return agreement.recruitmentDeadline;
    const assembled = assembleDateISO();
    return assembled ? assembled : null;
  })();

  const loadAgreementContext = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const appRes = await apiRequest<any>("/applications/me");
      const appData = appRes?.data as ApplicationPayload;
      setApplication(appData);

      try {
        const agrRes = await apiRequest<any>("/agreements/me");
        const agrData = agrRes?.data as AgreementPayload;
        setAgreement(agrData);
        if (agrData?.recruitmentDeadline) {
          const d = new Date(agrData.recruitmentDeadline);
          if (!Number.isNaN(d.getTime())) {
            setRecruitmentYear(String(d.getUTCFullYear()));
            setRecruitmentMonth(String(d.getUTCMonth() + 1).padStart(2, "0"));
            setRecruitmentDay(String(d.getUTCDate()).padStart(2, "0"));
          }
        }
      } catch {
        setAgreement(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Failed to load agreement data.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadAgreementContext();
  }, [loadAgreementContext]);

  const handleConfirm = async () => {
    if (!application?.id) {
      setError("Application not found for this account.");
      return;
    }
    if (!isValidDate()) {
      setError("Recruitment deadline is required.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        applicationId: application.id,
        recruitmentDeadline: assembleDateISO(),
      };
      const result = await apiRequest<any>("/agreements/generate", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setAgreement(result?.data as AgreementPayload);
      navigate("/dashboard/payment");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Failed to generate agreement.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-primary">
                {language === "am" ? "የውል ስምምነት እና ውል" : "Agreement & Contract"}
              </h2>
              <p className="text-gray-500 text-sm">
                {language === "am"
                  ? "ከፌዴራል ፖሊስ ጋር የመጨረሻውን የፈቃድ ስምምነት ይገምግሙ እና ይፈርሙ።"
                  : "Review and sign the final licensing agreement with the Federal Police."}
              </p>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl font-bold text-sm border border-gray-100 hover:bg-gray-100 transition-all print:hidden"
          >
            <Download className="w-4 h-4" />
            <span>{language === "am" ? "ታትም" : "Print"}</span>
          </button>
        </div>

        <div className="bg-gray-50 rounded-3xl p-1 md:p-8 border border-gray-100 space-y-6">
          <div className="bg-white p-8 md:p-12 rounded-2xl shadow-inner border border-gray-100 font-serif text-gray-800 leading-relaxed space-y-8 max-h-[600px] overflow-y-auto print:max-h-none print:overflow-visible print:shadow-none print:border-transparent">
            {language === "am" ? (
              <div className="space-y-6 text-sm md:text-base">
                <div className="flex justify-between items-start">
                  <div className="font-bold">የኢትዮጵያ ፌዴራል ፖሊስ ኮሚሽን</div>
                </div>

                <h3 className="text-center font-bold text-lg">
                  የብቃት ማረጋገጫ ከፌደራል ፖሊስ ወስደው የግል ጥበቃ አገልግሎት መስጠት ለሚጀምሩ ተቋማት የሚሞላ
                  የውል ቅጽ
                </h3>

                <p>
                  እኛ
                  <span className="font-semibold text-gray-900">
                    {safeText(org?.name, "የተቋሙ ስም")}
                  </span>
                  የግል ጥበቃ አገልግሎት ተቋማት ኃላ/የተ/የግ/ማህበር የከፈትነው ዋና መስሪያ እና ቅርንጫፍ መስሪያ
                  ቤት አድራሻ፡- ክልል/ከተማ /አስ/ር
                  <span className="font-semibold text-gray-900">
                    {safeText(regionName, "ክልል")}
                  </span>
                  ዞን/ክ/ከተማ
                  <span className="font-semibold text-gray-900">
                    {safeText(zoneName, "ዞን")}
                  </span>
                  ወረዳ
                  <span className="font-semibold text-gray-900">
                    {safeText(woredaName, "ወረዳ")}
                  </span>
                  ቀበሌ
                  <span className="font-semibold text-gray-900">
                    {safeText(kebeleName, "ቀበሌ")}
                  </span>
                  ልዩ ቦታ
                  <span className="font-semibold text-gray-900">
                    {safeText(address?.specialLocation, "ቦታ")}
                  </span>
                  የቤት ቁጥር
                  <span className="font-semibold text-gray-900">
                    {safeText(address?.houseNumber, "ቁጥር")}
                  </span>
                  በተቋም ስም ቋሚ ስልክ ቁጥር
                  <span className="font-semibold text-gray-900">
                    {safeText(org?.phone, "ስልክ")}
                  </span>
                  ፋክስ ቁጥ
                  <span className="font-semibold text-gray-900">
                    {safeText(org?.faxNumber, "ፋክስ")}
                  </span>
                  ኢሜል አድሪስ
                  <span className="font-semibold text-gray-900">
                    {safeText(org?.email, "ኢሜል")}
                  </span>
                  ሲሆን የፌደራል ፖሊስ ባዘጋጀው የሙያ ብቃት ማረጋገጫ መስፈርት አሰጣጥና ምክር አገልግሎት መሰረት
                  የቴክኒክ ኮሚቴ በአካል ሄዶ የኢንስፔክሽንና ጥናት ላይ የሚመለከታቸው ይሆናል፡፡
                </p>

                <div className="space-y-4">
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
                    የደመወዝ ፔሮል፣ የማህበራዊ ዋስትና የክፍያ ደረሰኝ
                  </p>
                  <p>
                    5. ከሚኖሩበት የቀበሌ አስተዳደር የድጋፍ ደብዳቤ፣ መልካም ሥነ-ምግባር ያለው/ት፣ የት/ት
                    ደረጃ፣ የስልጠና ማንዋል፣ የስልጠና ቦታ፣ ስልጠና የሰጠው አካል፣ ስልጠና የወሰደ / ያልወሰደ፣
                    ስልጠና የተሰጠው ቀን፣ የስልጠና ምስክር ወረቀት፣ ግምጃ ቤት፣ የጥበቃ ሰራተኞች አሻራ፣
                    ሜዲካል፣ የዋሱ አድራሻና የሰራበት ተቋም፣ የዋስትና አይነት፣ የቀበሌ መታወቂያ /ፓስፖርት/
                    የታደሰ፣ የሰራ ልምድ፣ መልቀቂያ፣ የት/ት ደረጃ፣ የተቋሙ መታወቂያ የታደሰ፣ የቅጥር ደብዳቤ፣
                    የነበረበት ተቋም ስም መከላከያ / ፖሊስ / ሌሎች፣ ብሄራዊ ዲጂታል መታወቂያ ካርድ፣ ዕድሜ፣
                    ቁመት ለወንድ (ሜትር) እና ክብደት (ኪ/ግራም)፣ ለሴት (ሜትር) እና ክብደት (ኪ/ግራም)
                  </p>
                  <p>
                    6. የሚጠቀመው ቴክኖሎጂ፣ የአገልግሎት ተጠቃሚ ውል፣ የቦታው ስም፣ የተመደበ የሰው ኃይል ብዛት
                  </p>
                  <p>
                    7. ከዚህ በላይ ከተራ ቁጥር 1-6 በተመላከተው የጥበቃ ሰራተኞች ምልመላና ቅጥር መስፈርት
                    መሰረት ማሟላት የሚገባንን የምናሟላ መሆናችንን እያመለከትን እናሟላለን ያልናቸውን ሳናሟላ
                    በሀሰት እንዳሟላን ሆኖ አቅርበን ከተገኘብን እንዲሁም በተገለጸው ጊዜ አሟልተን ካልተገኘን
                    በፌደራል ፖሊስ በወጣው መመሪያ ቁጥር 2018 አንቀፅ መሰረት ለፌደራል ፖሊስ ሙያ ብቃት
                    ማረጋገጫና ምክር አገልግሎት የስራ ክፍል በተሰጠው ስልጣን ከተገለጸው በተጨማሪ ከተራ ቁጥር
                    አንዱን አጉድለን ከተገኘን በተቋማችን ላይ ለሚወሰደው የመመሪያ ጥሰት እና ህጋዊ እርምጃ
                    እያንዳንዱን አንብበን የተስማማን መሆናችንን በፊርማችን አረጋግጠናል፡፡
                  </p>
                </div>

                <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-end text-[10px] text-gray-400 font-mono space-y-4 md:space-y-0">
                  <div className="space-y-1">
                    <p>በስርዓቱ የተረጋገጠ ሰነድ</p>
                    <p>
                      መለያ:{" "}
                      <span className="font-semibold text-gray-900">
                        {agreement?.agreementNumber || "FP-AGR-XXXXXXX"}
                      </span>
                    </p>
                  </div>
                  <div className="text-left md:text-right space-y-1">
                    <p>
                      አመልካች:{" "}
                      <span className="font-semibold text-gray-900">
                        {safeText(application?.user?.fullName, "ሙሉ ስም")}
                      </span>
                    </p>
                    <p>
                      ስልክ:{" "}
                      <span className="font-semibold text-gray-900">
                        {safeText(application?.user?.phone, "የስልክ ቁጥር")}
                      </span>
                    </p>
                    <p>ዲጂታል ፊርማ ሲገባ ይያያዛል</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 text-sm md:text-base">
                <div className="flex justify-between items-start">
                  <div className="font-bold uppercase tracking-wide text-center">
                    Ethiopian Federal Police
                  </div>
                </div>

                <h3 className="text-center font-bold text-lg uppercase">
                  Qualification Confirmation Contract Form for Private Security
                  Service Providers
                </h3>

                <p>
                  We{" "}
                  <span className="font-semibold text-gray-900">
                    {safeText(org?.name, "Agency Name")}
                  </span>
                  , a Private Protection Service Institution, having our main
                  office address at: Region/City{" "}
                  <span className="font-semibold text-gray-900">
                    {safeText(regionName, "Region")}
                  </span>{" "}
                  , Zone/Sub-city{" "}
                  <span className="font-semibold text-gray-900">
                    {safeText(zoneName, "Zone")}
                  </span>
                  , Woreda
                  <span className="font-semibold text-gray-900">
                    {safeText(woredaName, "Woreda")}
                  </span>
                  , Kebele
                  <span className="font-semibold text-gray-900">
                    {safeText(kebeleName, "Kebele")}
                  </span>
                  , Special Place
                  <span className="font-semibold text-gray-900">
                    {safeText(address?.specialLocation, "Location")}
                  </span>
                  , House Number{" "}
                  <span className="font-semibold text-gray-900">
                    {safeText(address?.houseNumber, "Number")}
                  </span>
                  , with permanent phone number
                  <span className="font-semibold text-gray-900">
                    {safeText(org?.phone, "Phone")}
                  </span>
                  , Fax
                  <span className="font-semibold text-gray-900">
                    {safeText(org?.faxNumber, "Fax")}
                  </span>
                  , and Email
                  <span className="font-semibold text-gray-900">
                    {safeText(org?.email, "Email")}
                  </span>
                  , hereby acknowledge that the Technical Committee will conduct
                  an in-person inspection and study based on the Career
                  Competence Confirmation requirements set by the Federal
                  Police.
                </p>

                <div className="space-y-4">
                  <p>
                    1. number of offices (registered in the institution's name)
                    or Household Rent Contract for one year left days:{" "}
                    <span className="font-semibold text-gray-900">
                      {safeNumber(org?.numberOfOffices)}
                    </span>
                  </p>
                  <p>
                    2. Number of Vehicles (registered in the institution's name)
                    Contract that confimed by rental agreement of the vehicle:{" "}
                    <span className="font-semibold text-gray-900">
                      {safeNumber(org?.numberOfVehicles)}
                    </span>
                  </p>
                  <p>
                    3. Number of Computers:{" "}
                    <span className="font-semibold text-gray-900">
                      {safeNumber(org?.numberOfComputers)}
                    </span>
                  </p>
                  <p>
                    4. We confirm that the workplace is clear and suitable for
                    work, and we have fulfilled all requirements. For the
                    future, within{" "}
                    <span className="font-semibold text-gray-900">
                      {formatDate(effectiveDeadline)}
                    </span>{" "}
                    the specified months of starting recruitment, we will
                    provide: Insurance Cover Report, Salary Payroll, Social
                    Security Payment Receipt
                  </p>
                  <p>
                    5. Support Letter from Kebele Management, Good Ethics,
                    Education Level, Training Manual, Training Place, training
                    provider, training status (took/not taken), training date,
                    Training Certificate, Storehouse, Security Employees
                    Fingerprint, Medical, Guarantor's address and institution,
                    Type of guarantee, Kebele ID / Passport (Renewed), Work
                    Experience, Resignation, Education level, Institution ID
                    (Renewed), Employment Letter, Previous Institution
                    (Defense/Police/Others), National Digital ID Card, Age,
                    Height (---cm) and Weight (kg), Height (Female) and Weight
                    Height Male (---Cm) and Weight (---kg), Height Female
                    (---Cm) and Weight (---kg)
                  </p>
                  <p>
                    6. Technology used, Service User Contract, Location Name,
                    Assigned Human Power Quantity
                  </p>
                  <p>
                    We hereby declare that we will fulfill all requirements as
                    mentioned in points 1-6 above. If it is found that we have
                    provided false information or failed to fulfill the
                    requirements within{" "}
                    <span className="font-semibold text-gray-900">
                      {formatDate(effectiveDeadline)}
                    </span>{" "}
                    the specified time, we agree to the legal actions and
                    measures taken by the Federal Police as per Directive No.
                    2018 and the authority given to the Federal Police
                    Professional Competence Certification and Advisory Service.
                    We have read and agreed to each point and confirmed with our
                    signature.
                  </p>
                </div>

                <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-end text-[10px] text-gray-400 font-mono space-y-4 md:space-y-0">
                  <div className="space-y-1">
                    <p>
                      ID:{" "}
                      <span className="font-semibold text-gray-900">
                        {agreement?.agreementNumber || "FP-AGR-XXXXXXX"}
                      </span>
                    </p>
                  </div>
                  <div className="text-left md:text-right space-y-1">
                    <p>
                      APPLICANT:{" "}
                      <span className="font-semibold text-gray-900">
                        {safeText(application?.user?.fullName, "Full Name")}
                      </span>
                    </p>
                    <p>
                      PHONE:{" "}
                      <span className="font-semibold text-gray-900">
                        {safeText(application?.user?.phone, "Phone Number")}
                      </span>
                    </p>
                    <p>DIGITAL SIGNATURE ATTACHED UPON SUBMISSION</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="bg-gray-50 rounded-2xl p-6 text-sm text-gray-500">
              {language === "am"
                ? "መረጃ በመጫን ላይ..."
                : "Loading agreement data..."}
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4 text-sm">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 rounded-3xl p-6 border border-gray-100">
              <div className="space-y-3">
                <h3 className="text-sm font-black text-primary uppercase tracking-widest">
                  {language === "am" ? "የተቋም መረጃ" : "Organization Details"}
                </h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <div>
                    <span className="text-gray-500">
                      {language === "am" ? "ስም" : "Name"}:
                    </span>{" "}
                    <span className="font-semibold text-gray-900">
                      {safeText(org?.name)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">
                      {language === "am" ? "ኢሜል" : "Email"}:
                    </span>{" "}
                    <span className="font-semibold text-gray-900">
                      {safeText(org?.email)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">
                      {language === "am" ? "ስልክ" : "Phone"}:
                    </span>{" "}
                    <span className="font-semibold text-gray-900">
                      {safeText(org?.phone)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">
                      {language === "am" ? "ፋክስ" : "Fax"}:
                    </span>{" "}
                    <span className="font-semibold text-gray-900">
                      {safeText(org?.faxNumber)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">
                      {language === "am" ? "አድራሻ" : "Address"}:
                    </span>{" "}
                    <span className="font-semibold text-gray-900">
                      {safeText(
                        [
                          regionName,
                          zoneName,
                          woredaName,
                          kebeleName,
                          address?.specialLocation,
                          address?.houseNumber,
                        ]
                          .filter(Boolean)
                          .join(", "),
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-black text-primary uppercase tracking-widest">
                  {language === "am" ? "የተፈረመው መረጃ" : "Signed User"}
                </h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <div>
                    <span className="text-gray-500">
                      {language === "am" ? "ሙሉ ስም" : "Full Name"}:
                    </span>{" "}
                    <span className="font-semibold text-gray-900">
                      {safeText(application?.user?.fullName)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">
                      {language === "am" ? "ስልክ" : "Phone"}:
                    </span>{" "}
                    <span className="font-semibold text-gray-900">
                      {safeText(application?.user?.phone)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">
                      {language === "am" ? "ኢሜል" : "Email"}:
                    </span>{" "}
                    <span className="font-semibold text-gray-900">
                      {safeText(application?.user?.email)}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center justify-between">
                    <span>
                      {language === "am"
                        ? "የቅጥር መጨረሻ ቀን"
                        : "Recruitment Deadline"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowDatePicker(true)}
                      className="ml-2 p-2 rounded-md hover:bg-gray-100"
                      aria-label={language === "am" ? "ቀን መምረጥ" : "Select date"}
                    >
                      <Calendar className="w-5 h-5 text-gray-600" />
                    </button>
                  </label>

                  <div className="mt-2 text-sm text-gray-700">
                    {isValidDate() ? (
                      <div className="font-semibold text-gray-900">
                        {formatDate(assembleDateISO() || undefined)}
                      </div>
                    ) : (
                      <div className="text-rose-600">
                        {language === "am"
                          ? "የቅጥር መጨረሻ ቀን ያስፈልጋል"
                          : "No recruitment deadline selected"}
                      </div>
                    )}
                  </div>

                  {showDatePicker && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                      <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setShowDatePicker(false)}
                      />
                      <div className="relative bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
                        <h4 className="text-lg font-semibold mb-4">
                          {language === "am" ? "የቀን መምረጫ" : "Select Date"}
                        </h4>
                        <div className="mb-3 flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setCalendarType("gregorian")}
                            className={`px-3 py-1 rounded-xl text-sm ${calendarType === "gregorian" ? "bg-primary text-white" : "bg-gray-100"}`}
                          >
                            {language === "am" ? "ግሪጎሪያን" : "Gregorian"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setCalendarType("ethiopian")}
                            className={`px-3 py-1 rounded-xl text-sm ${calendarType === "ethiopian" ? "bg-primary text-white" : "bg-gray-100"}`}
                          >
                            {language === "am" ? "ኢትዮጵያ" : "Ethiopian"}
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <select
                            aria-label="Year"
                            value={recruitmentYear}
                            onChange={(e) => setRecruitmentYear(e.target.value)}
                            className="rounded-xl px-3 py-2 text-sm border border-gray-200 bg-white"
                          >
                            <option value="">
                              {language === "am" ? "ዓመት" : "Year"}
                            </option>
                            {yearOptions.map((y) => (
                              <option key={y} value={y}>
                                {y}
                              </option>
                            ))}
                          </select>

                          <select
                            aria-label="Month"
                            value={recruitmentMonth}
                            onChange={(e) =>
                              setRecruitmentMonth(e.target.value)
                            }
                            className="rounded-xl px-3 py-2 text-sm border border-gray-200 bg-white"
                          >
                            <option value="">
                              {language === "am" ? "ወር" : "Month"}
                            </option>
                            {(calendarType === "gregorian"
                              ? gregorianMonthOptions
                              : ethiopianMonthList
                            ).map((m: any) => (
                              <option key={m.value} value={m.value}>
                                {m.label}
                              </option>
                            ))}
                          </select>

                          <select
                            aria-label="Day"
                            value={recruitmentDay}
                            onChange={(e) => setRecruitmentDay(e.target.value)}
                            className="rounded-xl px-3 py-2 text-sm border border-gray-200 bg-white"
                          >
                            <option value="">
                              {language === "am" ? "ቀን" : "Day"}
                            </option>
                            {dayOptionsFor(
                              recruitmentYear || String(yearOptions[0]),
                              recruitmentMonth,
                            ).map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </div>

                        {!isValidDate() && (
                          <p className="text-rose-600 text-xs mt-3">
                            {language === "am"
                              ? "እባክዎ የትክክለኛ ዓመት/ወር/ቀን ይምረጡ"
                              : "Please select a valid Year/Month/Day."}
                          </p>
                        )}

                        <div className="mt-4 flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => setShowDatePicker(false)}
                            className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm"
                          >
                            {language === "am" ? "ተዝግ" : "Cancel"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowDatePicker(false)}
                            disabled={!isValidDate()}
                            className={`px-4 py-2 rounded-xl text-sm text-white ${isValidDate() ? "bg-primary" : "bg-gray-300"}`}
                          >
                            {language === "am" ? "አረጋግጥ" : "Save"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-start space-x-3 p-4 bg-primary/5 rounded-2xl border border-primary/10 print:hidden">
            <input
              type="checkbox"
              id="agree-check"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
            />
            <label
              htmlFor="agree-check"
              className="text-sm text-primary font-medium leading-relaxed cursor-pointer"
            >
              {language === "am"
                ? "ሁሉንም የፌዴራል ፖሊስ የግል ጥበቃ አገልግሎት ስምምነት ውሎችን አንብቤ ተስማምቻለሁ። እነዚህን ውሎች መጣስ ወደ ሕጋዊ እርምጃ እና የፈቃድ ስረዛ ሊያመራ እንደሚችል ተረድቻለሁ።"
                : "I have read and agree to all terms and conditions of the Federal Police Private Security Service Agreement. I understand that any violation of these terms may lead to legal action and license cancellation."}
            </label>
          </div>
        </div>

        <div className="flex justify-end print:hidden">
          <button
            onClick={handleConfirm}
            disabled={!agreed || submitting || !isValidDate()}
            className={`px-12 py-5 blue-gradient text-white rounded-2xl font-bold hover:shadow-xl transition-all flex items-center space-x-3 ${!agreed || submitting || !isValidDate() ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <span>
              {submitting
                ? language === "am"
                  ? "በሂደት ላይ..."
                  : "Processing..."
                : language === "am"
                  ? "ውሉን አረጋግጥ"
                  : "Confirm Agreement"}
            </span>
            <CheckCircle2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center space-x-2 text-gray-400 text-xs font-medium print:hidden">
        <AlertCircle className="w-4 h-4" />
        <span>
          {language === "am"
            ? "ደህንነቱ የተጠበቀ የክፍያ በር • የፌዴራል ፖሊስ ኮሚሽን"
            : "Secure Payment Gateway • Federal Police Commission"}
        </span>
      </div>
    </div>
  );
};
