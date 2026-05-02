import React, { useRef } from 'react';
import { Shield, Download, Printer, CheckCircle, MapPin, Calendar, User, QrCode } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const LicenseViewer = () => {
  const { language } = useLanguage();
  const certificateRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = React.useState<'certificate' | 'photo'>('certificate');

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
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Abyssinia_Security_License.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try using the Print option instead.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div>
          <h3 className="text-2xl font-bold text-primary">
            {language === 'am' ? 'የስራ ፈቃድ' : 'My Operational License'}
          </h3>
          <div className="flex items-center space-x-2 mt-1">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
               {language === 'am' ? 'በፌዴራል ፖሊስ የተላከ' : 'Dispatched by Federal Police'}
             </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
             <button 
               onClick={() => setViewMode('certificate')}
               className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${viewMode === 'certificate' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'}`}
             >
               Digital PDF
             </button>
             <button 
               onClick={() => setViewMode('photo')}
               className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${viewMode === 'photo' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'}`}
             >
               Received Photo
             </button>
          </div>
          
          <button 
            onClick={handlePrint}
            className="flex items-center space-x-2 px-6 py-3 bg-white border rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
          >
            <Printer className="w-5 h-5" />
            <span>{language === 'am' ? 'አትም' : 'Print'}</span>
          </button>
          <button 
            onClick={handleDownload}
            className="flex items-center space-x-2 px-6 py-3 blue-gradient text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
          >
            <Download className="w-5 h-5" />
            <span>{language === 'am' ? 'አውርድ' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {viewMode === 'photo' ? (
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
              <p className="text-[10px] font-black text-white uppercase tracking-widest drop-shadow-lg">Received via External Capture</p>
              <p className="text-[8px] font-bold text-white/80 drop-shadow-lg">Timestamp: 2026-04-23 10:49:16</p>
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
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center p-1 border-4 border-[var(--safe-secondary-20)] shadow-sm">
                <img 
                  src="https://i.ibb.co/Vv8B0Xz/ethiopian-federal-police-logo.png" 
                  alt="Federal Police Logo" 
                  className="w-full h-full object-contain rounded-full"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/police/200/200';
                  }}
                />
              </div>
            </div>

            {/* Top Center: Agency Logo Space */}
            <div className="w-20 h-20 border-2 border-dashed border-[var(--safe-secondary-30)] rounded-xl flex flex-col items-center justify-center bg-[var(--safe-secondary-10)] text-[var(--safe-secondary-500)] p-2 text-center mt-2">
              <Shield className="w-6 h-6 mb-1 opacity-20" />
              <span className="text-[7px] font-bold uppercase leading-tight">Agency Logo</span>
            </div>

            {/* Top Right: Applicant Photo Space */}
            <div className="w-28 h-36 border-2 border-dashed border-[var(--safe-secondary-30)] rounded-lg flex flex-col items-center justify-center bg-[var(--safe-secondary-10)] text-[var(--safe-secondary-500)] p-2 text-center">
              <User className="w-10 h-10 mb-2 opacity-20" />
              <span className="text-[9px] font-bold uppercase">Applicant Photo</span>
            </div>
          </div>

          {/* Header Text */}
          <div className="text-center space-y-3 mb-8">
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-primary tracking-wide">በኢትዮጵያ ፌዴራላዊ ዲሞክራሲያዊ ሪፐብሊክ የፌዴራል ፖሊስ</h4>
              <h4 className="text-base font-bold text-[#001F3F] uppercase tracking-wider">The Federal Democratic Republic of Ethiopia Federal police</h4>
            </div>
            
            <div className="py-3 border-y-2 border-[var(--safe-secondary-20)]">
              <h5 className="text-xl font-black text-primary mb-1">የግል የጥበቃ ተቋማት የብቃት ማረጋገጫ የምስክር ወረቀት</h5>
              <h5 className="text-lg font-bold text-[#C5A022] italic font-serif">Private Security Agencies Quality Assurance Certificate</h5>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 space-y-6 text-left px-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-baseline space-x-4 border-b border-[var(--safe-secondary-10)] pb-1">
                <span className="text-xs font-bold text-[var(--safe-gray-500)] w-40 shrink-0">የተቋሙ ስም / Name of the Agency:</span>
                <span className="text-lg font-black text-primary uppercase">Abyssinia Security Services PLC</span>
              </div>

              <div className="flex items-baseline space-x-4 border-b border-[var(--safe-secondary-10)] pb-1">
                <span className="text-xs font-bold text-[var(--safe-gray-500)] w-40 shrink-0">አድራሻ / Address:</span>
                <span className="text-base font-bold text-primary">Addis Ababa, Bole Sub-City, Woreda 03, House No. 123</span>
              </div>

              <div className="flex items-baseline space-x-4 border-b border-[var(--safe-secondary-10)] pb-1">
                <span className="text-xs font-bold text-[var(--safe-gray-500)] w-40 shrink-0">የብቃት ደረጃ / Level:</span>
                <span className="text-base font-bold text-primary">LEVEL - ONE (1)</span>
              </div>

              <div className="flex items-baseline space-x-4 border-b border-[var(--safe-secondary-10)] pb-1">
                <span className="text-xs font-bold text-[var(--safe-gray-500)] w-40 shrink-0">የተሰጠበት ቀን / Date of Issued:</span>
                <span className="text-base font-bold text-primary">22/09/2025</span>
              </div>

              <div className="flex items-baseline space-x-4 border-b border-[var(--safe-secondary-10)] pb-1">
                <span className="text-xs font-bold text-[var(--safe-gray-500)] w-40 shrink-0">የሚያበቃበት ቀን / Date of Expired:</span>
                <span className="text-base font-bold text-primary">21/09/2026</span>
              </div>

              <div className="flex items-baseline space-x-4 border-b border-[var(--safe-secondary-10)] pb-1">
                <span className="text-xs font-bold text-[var(--safe-gray-500)] w-40 shrink-0">የፈቃድ ቁጥር / License No:</span>
                <span className="text-lg font-black text-[#C5A022] tracking-widest">FP-PSA-2025-0892</span>
              </div>
            </div>

            <p className="text-[9px] text-[var(--safe-gray-400)] italic mt-6 leading-relaxed">
              This Certificate is issued pursuant to directive No. 01/2003 of the Federal Police Commission. 
              The agency is authorized to provide private security services as per the terms and conditions specified in the directive.
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
                    Federal Police<br/>Commission<br/>STAMP
                  </div>
                </div>
                <span className="text-[var(--safe-gray-300)] font-serif italic text-xs">Commissioner's Signature</span>
              </div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-tighter">Commissioner of Federal Police</p>
            </div>

            {/* Bottom Right: QR Code Space */}
            <div className="bg-white p-4 border-4 border-primary rounded-2xl shadow-xl z-30 mb-2 mr-2">
              <div className="w-28 h-28 flex flex-col items-center justify-center text-primary">
                <QrCode className="w-20 h-20 mb-1" />
                <span className="text-[10px] font-black uppercase tracking-tighter">Verify License</span>
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

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .max-w-4xl { max-width: 100% !important; margin: 0 !important; }
          .pb-20 { padding-bottom: 0 !important; }
        }
      `}} />
    </div>
  );
};
