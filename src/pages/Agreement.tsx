import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { FileText, CheckCircle2, Download, CreditCard, AlertCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export const Agreement = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [agreed, setAgreed] = React.useState(false);

  const handleConfirm = () => {
    // Navigate to payment page after agreement
    navigate('/dashboard/payment');
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
                {language === 'am' ? 'የውል ስምምነት እና ውል' : 'Agreement & Contract'}
              </h2>
              <p className="text-gray-500 text-sm">
                {language === 'am' 
                  ? 'ከፌዴራል ፖሊስ ጋር የመጨረሻውን የፈቃድ ስምምነት ይገምግሙ እና ይፈርሙ።' 
                  : 'Review and sign the final licensing agreement with the Federal Police.'}
              </p>
            </div>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl font-bold text-sm border border-gray-100 hover:bg-gray-100 transition-all">
            <Download className="w-4 h-4" />
            <span>{language === 'am' ? 'አውርድ' : 'Download'}</span>
          </button>
        </div>

        <div className="bg-gray-50 rounded-3xl p-1 md:p-8 border border-gray-100 space-y-6">
          <div className="bg-white p-8 md:p-12 rounded-2xl shadow-inner border border-gray-100 font-serif text-gray-800 leading-relaxed space-y-8 max-h-[600px] overflow-y-auto print:max-h-none print:overflow-visible">
            {language === 'am' ? (
              <div className="space-y-6 text-sm md:text-base">
                <div className="flex justify-between items-start">
                  <div className="font-bold">የኢትዮጵያ ፌዴራል ፖሊስ ኮሚሽን</div>
                </div>
                
                <h3 className="text-center font-bold text-lg">የብቃት ማረጋገጫ ከፌደራል ፖሊስ ወስደው የግል ጥበቃ አገልግሎት መስጠት ለሚጀምሩ ተቋማት የሚሞላ የውል ቅጽ</h3>
                
                <p>
                  እኛ [የተቋሙ ስም] የግል ጥበቃ አገልግሎት ተቋማት ኃላ/የተ/የግ/ማህበር የከፈትነው ዋና መስሪያ እና ቅርንጫፍ መስሪያ ቤት አድራሻ፡- ክልል/ከተማ /አስ/ር [ክልል] ዞን/ክ/ከተማ [ዞን] ወረዳ [ወረዳ] ቀበሌ [ቀበሌ] ልዩ ቦታ [ቦታ] የቤት ቁጥር [ቁጥር] በተቋም ስም ቋሚ ስልክ ቁጥር [ስልክ] ፋክስ ቁጥ [ፋክስ] ኢሜል አድሪስ [ኢሜል] ሲሆን የፌደራል ፖሊስ ባዘጋጀው የሙያ ብቃት ማረጋገጫ መስፈርት አሰጣጥና ምክር አገልግሎት መሰረት የቴክኒክ ኮሚቴ በአካል ሄዶ የኢንስፔክሽንና ጥናት ላይ የሚመለከታቸው ይሆናል፡፡
                </p>

                <div className="space-y-4">
                  <p>1. ኃላፊዎች አልተቀየሩም / ተቀይረዋል / የተሰናበቱ / የተቀጠሩ ሠራተኞች</p>
                  <p>2. የሰራተኞች ስም ዝርዝር፣ የስራ ምደባ፣ የቢሮ ብዛት፣ የኮምፒውተር ብዛት</p>
                  <p>3. የተሸከርካሪ (በተቋሙ ስም የተመዘገቡ) ብዛት፣ የቤት ኪራይ ውል (የይዞታ ማረጋገጫ ካርታ)</p>
                  <p>4. የመስሪያ ቤቱ የስራ ቦታ ለስራ ግልፅና አመች መሆኑን በትክክል አሟልተን ያቀረብን መሆናችንን እና ለወደፊትም በወር ውስጥ ሰራተኛ መቅጠር ስንጀምር ኢንሹራንስ ሽፋን ሪፖርት፣ የደመወዝ ፔሮል፣ የማህበራዊ ዋስትና የክፍያ ደረሰኝ</p>
                  <p>5. ከሚኖሩበት የቀበሌ አስተዳደር የድጋፍ ደብዳቤ፣ መልካም ሥነ-ምግባር ያለው/ት፣ የት/ት ደረጃ፣ የስልጠና ማንዋል፣ የስልጠና ቦታ፣ ስልጠና የሰጠው አካል፣ ስልጠና የወሰደ / ያልወሰደ፣ ስልጠና የተሰጠው ቀን፣ የስልጠና ምስክር ወረቀት፣ ግምጃ ቤት፣ የጥበቃ ሰራተኞች አሻራ፣ ሜዲካል፣ የዋሱ አድራሻና የሰራበት ተቋም፣ የዋስትና አይነት፣ የቀበሌ መታወቂያ /ፓስፖርት/ የታደሰ፣ የሰራ ልምድ፣ መልቀቂያ፣ የት/ት ደረጃ፣ የተቋሙ መታወቂያ የታደሰ፣ የቅጥር ደብዳቤ፣ የነበረበት ተቋም ስም መከላከያ / ፖሊስ / ሌሎች፣ ብሄራዊ ዲጂታል መታወቂያ ካርድ፣ ዕድሜ፣ ቁመት ለወንድ (ሜትር) እና ክብደት (ኪ/ግራም)፣ ለሴት (ሜትር) እና ክብደት (ኪ/ግራም)</p>
                  <p>6. የሚጠቀመው ቴክኖሎጂ፣ የአገልግሎት ተጠቃሚ ውል፣ የቦታው ስም፣ የተመደበ የሰው ኃይል ብዛት</p>
                  <p>7. ከዚህ በላይ ከተራ ቁጥር 1-6 በተመላከተው የጥበቃ ሰራተኞች ምልመላና ቅጥር መስፈርት መሰረት ማሟላት የሚገባንን የምናሟላ መሆናችንን እያመለከትን እናሟላለን ያልናቸውን ሳናሟላ በሀሰት እንዳሟላን ሆኖ አቅርበን ከተገኘብን እንዲሁም በተገለጸው ጊዜ አሟልተን ካልተገኘን በፌደራል ፖሊስ በወጣው መመሪያ ቁጥር 2018 አንቀፅ መሰረት ለፌደራል ፖሊስ ሙያ ብቃት ማረጋገጫና ምክር አገልግሎት የስራ ክፍል በተሰጠው ስልጣን ከተገለጸው በተጨማሪ ከተራ ቁጥር አንዱን አጉድለን ከተገኘን በተቋማችን ላይ ለሚወሰደው የመመሪያ ጥሰት እና ህጋዊ እርምጃ እያንዳንዱን አንብበን የተስማማን መሆናችንን በፊርማችን አረጋግጠናል፡፡</p>
                </div>

                <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-end text-[10px] text-gray-400 font-mono space-y-4 md:space-y-0">
                  <div className="space-y-1">
                    <p>በስርዓቱ የተረጋገጠ ሰነድ</p>
                    <p>መለያ: FP-AGR-8829310</p>
                  </div>
                  <div className="text-left md:text-right space-y-1">
                    <p>አመልካች: [የሥራ አስኪያጅ ስም]</p>
                    <p>ስልክ: [የስልክ ቁጥር]</p>
                    <p>ዲጂታል ፊርማ ሲገባ ይያያዛል</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 text-sm md:text-base">
                <div className="flex justify-between items-start">
                  <div className="font-bold uppercase tracking-wide">Ethiopian Federal Police Commission</div>
                </div>
                
                <h3 className="text-center font-bold text-lg uppercase">Qualification Confirmation Contract Form for Private Security Service Providers</h3>
                
                <p>
                  We [Agency Name], a Private Protection Service Institution, having our main and branch office address at: Region/City [Region], Zone/Sub-city [Zone], Woreda [Woreda], Kebele [Kebele], Special Place [Location], House Number [Number], with permanent phone number [Phone], Fax [Fax], and Email [Email], hereby acknowledge that the Technical Committee will conduct an in-person inspection and study based on the Career Competence Confirmation requirements set by the Federal Police.
                </p>

                <div className="space-y-4">
                  <p>1. Officials: Not changed / Changed / Fired / Hired / Workers</p>
                  <p>2. Employees: Name list, job classification, number of offices, number of computers</p>
                  <p>3. Vehicles (registered in the institution's name): Quantity, Household Rent Contract (tenure confirmation map)</p>
                  <p>4. We confirm that the workplace is clear and suitable for work, and we have fulfilled all requirements. For the future, within the specified months of starting recruitment, we will provide: Insurance Cover Report, Salary Payroll, Social Security Payment Receipt</p>
                  <p>5. Support Letter from Kebele Management, Good Ethics, Education Level, Training Manual, Training Place, training provider, training status (took/not taken), training date, Training Certificate, Storehouse, Security Employees Fingerprint, Medical, Guarantor's address and institution, Type of guarantee, Kebele ID / Passport (Renewed), Work Experience, Resignation, Education level, Institution ID (Renewed), Employment Letter, Previous Institution (Defense/Police/Others), National Digital ID Card, Age, Height (Male) and Weight (kg), Height (Female) and Weight (kg)</p>
                  <p>6. Technology used, Service User Contract, Location Name, Assigned Human Power Quantity</p>
                  <p>7. We hereby declare that we will fulfill all requirements as mentioned in points 1-6 above. If it is found that we have provided false information or failed to fulfill the requirements within the specified time, we agree to the legal actions and measures taken by the Federal Police as per Directive No. 2018 and the authority given to the Federal Police Professional Competence Certification and Advisory Service. We have read and agreed to each point and confirmed with our signature.</p>
                </div>

                <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-end text-[10px] text-gray-400 font-mono space-y-4 md:space-y-0">
                  <div className="space-y-1">
                    <p>SYSTEM VERIFIED DOCUMENT</p>
                    <p>ID: FP-AGR-8829310</p>
                  </div>
                  <div className="text-left md:text-right space-y-1">
                    <p>APPLICANT: [MANAGER NAME]</p>
                    <p>PHONE: [PHONE NUMBER]</p>
                    <p>DIGITAL SIGNATURE ATTACHED UPON SUBMISSION</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-start space-x-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
            <input 
              type="checkbox" 
              id="agree-check" 
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
            />
            <label htmlFor="agree-check" className="text-sm text-primary font-medium leading-relaxed cursor-pointer">
              {language === 'am' 
                ? 'ሁሉንም የፌዴራል ፖሊስ የግል ጥበቃ አገልግሎት ስምምነት ውሎችን አንብቤ ተስማምቻለሁ። እነዚህን ውሎች መጣስ ወደ ሕጋዊ እርምጃ እና የፈቃድ ስረዛ ሊያመራ እንደሚችል ተረድቻለሁ።'
                : 'I have read and agree to all terms and conditions of the Federal Police Private Security Service Agreement. I understand that any violation of these terms may lead to legal action and license cancellation.'}
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            onClick={handleConfirm}
            disabled={!agreed}
            className={`px-12 py-5 blue-gradient text-white rounded-2xl font-bold hover:shadow-xl transition-all flex items-center space-x-3 ${!agreed ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span>{language === 'am' ? 'ውሉን አረጋግጥ' : 'Confirm Agreement'}</span>
            <CheckCircle2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center space-x-2 text-gray-400 text-xs font-medium">
        <AlertCircle className="w-4 h-4" />
        <span>
          {language === 'am' 
            ? 'ደህንነቱ የተጠበቀ የክፍያ በር • የፌዴራል ፖሊስ ኮሚሽን' 
            : 'Secure Payment Gateway • Federal Police Commission'}
        </span>
      </div>
    </div>
  );
};
