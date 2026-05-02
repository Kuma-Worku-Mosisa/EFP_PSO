import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { cn } from '../lib/utils';
import { FileText, Upload, CheckCircle2, Clock, XCircle, AlertCircle, ShieldCheck, Eye, Trash2, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ViewerModal = ({ 
  isOpen, 
  onClose, 
  file, 
  previewUrl 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  file: File | null, 
  previewUrl: string | null 
}) => {
  const [rotation, setRotation] = React.useState(0);

  React.useEffect(() => {
    if (!isOpen) setRotation(0);
  }, [isOpen]);

  if (!isOpen || !file) return null;

  const isImage = file.type.startsWith('image/');
  const isPDF = file.type === 'application/pdf';

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-[32px] shadow-2xl w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b flex items-center justify-between bg-white z-10">
          <div className="flex items-center space-x-4">
            <div>
              <h3 className="font-bold text-primary">{file.name}</h3>
              <p className="text-xs text-gray-500 uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            {isImage && (
              <button 
                onClick={handleRotate}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-bold text-primary transition-all ml-4"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Rotate</span>
              </button>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-gray-100 flex items-center justify-center">
          {isImage && previewUrl ? (
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="max-w-full max-h-full object-contain rounded-xl shadow-lg transition-transform duration-300" 
                style={{ transform: `rotate(${rotation}deg)` }}
              />
            </div>
          ) : isPDF && previewUrl ? (
            <iframe 
              src={`${previewUrl}#toolbar=0`} 
              className="w-full h-full rounded-xl border-0 bg-white shadow-lg"
              title="PDF Preview"
            />
          ) : (
            <div className="bg-white p-12 rounded-3xl text-center space-y-4 shadow-xl">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-400">
                <FileText className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-primary">No visual preview available</p>
                <p className="text-sm text-gray-500">You can still download the file to view it.</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export const FormalLetter = () => {
  const { language } = useLanguage();
  const [file, setFile] = React.useState<File | null>(null);
  const [status, setStatus] = React.useState<'none' | 'pending' | 'approved' | 'rejected' | 'correction'>('none');
  const [openedForEdit, setOpenedForEdit] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [isViewerOpen, setIsViewerOpen] = React.useState(false);

  const isLocked = status === 'pending' || status === 'approved';

  React.useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  const t_letter = {
    en: {
      title: "Formal Letter of Request",
      desc: "Submit your formal application request letter for review by the Federal Police.",
      upload: "Click to upload or drag and drop",
      format: "PDF, DOCX (Max 5MB)",
      select: "Select File",
      submit: "Submit Request Letter",
      pendingTitle: "Request Under Review",
      pendingDesc: "Your formal letter has been submitted and is currently being reviewed by the Federal Police Admin. You will be notified once it is approved.",
      pendingStatus: "Status: Pending Review",
      approvedTitle: "Request Approved!",
      approvedDesc: "Your formal letter of request has been approved. You can now proceed with the full license application.",
      approvedBtn: "Go to New Application",
      rejectedTitle: "Request Rejected",
      rejectedDesc: "Unfortunately, your formal letter of request was not approved. Please review the requirements and submit a corrected letter.",
      rejectedBtn: "Try Again",
      guidelinesTitle: "Official Guidelines & Requirements",
      guidelinesDesc: "What the formal letter of request must fulfill for the Federal Police Commission.",
      important: "Important Note",
      importantDesc: "The formal letter of request must be on your agency's official letterhead, signed by the manager, and stamped. It should clearly state the purpose of the application and the type of security services you intend to provide."
    },
    am: {
      title: "የማመልከቻ ደብዳቤ",
      desc: "በፌዴራል ፖሊስ እንዲገመገም መደበኛ የማመልከቻ ደብዳቤዎን ያቅርቡ።",
      upload: "ለመስቀል እዚህ ይጫኑ ወይም ፋይሉን ጎትተው ያስገቡ",
      format: "PDF, DOCX (ቢበዛ 5MB)",
      select: "ፋይል ይምረጡ",
      submit: "ማመልከቻውን ላክ",
      pendingTitle: "ማመልከቻው በመገምገም ላይ ነው",
      pendingDesc: "መደበኛ ደብዳቤዎ ገብቷል እና በአሁኑ ጊዜ በፌዴራል ፖሊስ አስተዳዳሪ እየተገመገመ ነው። ሲፈቀድ ማሳወቂያ ይደርስዎታል።",
      pendingStatus: "ሁኔታ፡ በመጠባበቅ ላይ",
      approvedTitle: "ማመልከቻው ጸድቋል!",
      approvedDesc: "መደበኛ የማመልከቻ ደብዳቤዎ ጸድቋል። አሁን ወደ ሙሉ የፈቃድ ማመልከቻ መቀጠል ይችላሉ።",
      approvedBtn: "ወደ አዲስ ማመልከቻ ይሂዱ",
      rejectedTitle: "ማመልከቻው ውድቅ ተደርጓል",
      rejectedDesc: "እንደ አለመታደል ሆኖ መደበኛ የማመልከቻ ደብዳቤዎ አልጸደቀም። እባክዎ መስፈርቶቹን ይገምግሙ እና የተስተካከለ ደብዳቤ ያቅርቡ።",
      rejectedBtn: "እንደገና ይሞክሩ",
      guidelinesTitle: "ይፋዊ መመሪያዎች እና መስፈርቶች",
      guidelinesDesc: "መደበኛ የማመልከቻ ደብዳቤ ለፌዴራል ፖሊስ ኮሚሽን ማሟላት ያለባቸው ነገሮች።",
      important: "ጠቃሚ ማሳሰቢያ",
      importantDesc: "መደበኛ የማመልከቻ ደብዳቤው በተቋምዎ ይፋዊ የደብዳቤ ራስ (letterhead) ላይ መሆን አለበት፣ በስራ አስኪያጁ ተፈርሞ እና ማህተም ተደርጎበት። የማመልከቻውን ዓላማ እና ለማቅረብ ያሰቡትን የጥበቃ አገልግሎት አይነት በግልፅ መግለጽ አለበት።"
    }
  };

  const curT = t_letter[language as keyof typeof t_letter] || t_letter.en;

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      setStatus('pending');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-primary">{curT.title}</h2>
            <p className="text-gray-500 text-sm">{curT.desc}</p>
          </div>
        </div>

        {status === 'none' && (
          <form onSubmit={handleSubmit} className="space-y-6">
              <div className={cn(
                "border-2 rounded-[40px] p-16 text-center space-y-6 transition-all group relative overflow-hidden",
                !file 
                  ? "border-dashed border-gray-300 bg-gray-50/30 hover:border-primary/50 hover:bg-white" 
                  : "border-solid border-green-200 bg-green-50/10 shadow-inner",
                openedForEdit && "border-amber-400 border-dashed bg-amber-50/20 ring-4 ring-amber-50 animate-pulse"
              )}>
                {file && (
                  <div className="absolute top-4 right-4 animate-in fade-in zoom-in duration-300">
                    <div className="flex items-center space-x-2 bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Uploaded Successfully</span>
                    </div>
                  </div>
                )}
                
                <div className={cn(
                  "w-24 h-24 rounded-3xl flex items-center justify-center mx-auto transition-all duration-500 shadow-sm",
                  file 
                    ? "bg-green-500 text-white scale-110 shadow-lg shadow-green-500/20" 
                    : "bg-white border-2 border-dashed border-gray-200 text-gray-400 group-hover:border-primary group-hover:text-primary"
                )}>
                  {openedForEdit ? (
                    <RefreshCw className="w-10 h-10 animate-spin-slow" />
                  ) : (
                    file ? <CheckCircle2 className="w-12 h-12" /> : <Upload className="w-10 h-10 group-hover:bounce" />
                  )}
                </div>
                
                <div className="space-y-2 text-center">
                   <p className={cn(
                     "text-lg font-black uppercase tracking-tight transition-colors",
                     file ? "text-green-600" : "text-primary group-hover:text-primary-focus"
                   )}>
                     {file ? file.name : curT.upload}
                   </p>
                   <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{curT.format}</p>
                   {openedForEdit && (
                     <div className="mt-4 px-4 py-2 bg-amber-100 text-amber-700 rounded-2xl text-[10px] font-black uppercase tracking-widest inline-flex items-center space-x-2 shadow-sm border border-amber-200">
                       <AlertCircle className="w-3 h-3" />
                       <span>Admin requested correction</span>
                     </div>
                   )}
                </div>

                <input 
                  type="file" 
                  className="hidden" 
                  id="letter-upload" 
                  onChange={handleUpload}
                  accept=".pdf,.docx"
                  disabled={isLocked && !openedForEdit}
                />
                
                <div className="flex items-center justify-center space-x-4 pt-4">
                  {(!file || openedForEdit) ? (
                    <label 
                      htmlFor="letter-upload"
                      className="px-8 py-3 bg-white border-2 border-gray-200 text-primary rounded-2xl font-black text-sm uppercase tracking-widest cursor-pointer hover:border-primary hover:text-primary hover:shadow-xl transition-all active:scale-95 flex items-center space-x-2 shadow-sm"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{curT.select}</span>
                    </label>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <button 
                        type="button"
                        onClick={() => setIsViewerOpen(true)}
                        className="px-6 py-3 bg-white border-2 border-gray-100 text-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:border-primary hover:shadow-xl transition-all flex items-center space-x-2 shadow-sm"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Preview</span>
                      </button>
                      <button 
                        type="button"
                        onClick={() => document.getElementById('letter-upload')?.click()}
                        className="p-3 bg-white border-2 border-gray-100 text-blue-500 rounded-2xl hover:border-blue-500 hover:shadow-xl transition-all shadow-sm"
                        title={language === 'am' ? 'እንደገና ጫን' : 'Re-upload'}
                      >
                        <RefreshCw className="w-5 h-5" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFile(null)}
                        className="p-3 bg-white border-2 border-gray-100 text-red-500 rounded-2xl hover:border-red-500 hover:shadow-xl transition-all shadow-sm"
                        title={language === 'am' ? 'ሰርዝ' : 'Delete'}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

            <button 
              type="submit"
              disabled={!file || (isLocked && !openedForEdit)}
              className={cn(
                "w-full blue-gradient text-white font-bold py-4 rounded-2xl hover:shadow-xl transition-all",
                (!file || (isLocked && !openedForEdit)) && "opacity-50 cursor-not-allowed"
              )}
            >
              {curT.submit}
            </button>
          </form>
        )}

        {status === 'pending' && (
          <div className="p-12 text-center space-y-6">
            <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto">
              <Clock className="w-10 h-10 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-primary">{curT.pendingTitle}</h3>
              <p className="text-gray-500">{curT.pendingDesc}</p>
            </div>
            <div className="inline-block px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wider">
              {curT.pendingStatus}
            </div>
          </div>
        )}

        {status === 'approved' && (
          <div className="p-12 text-center space-y-6">
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-primary">{curT.approvedTitle}</h3>
              <p className="text-gray-500">{curT.approvedDesc}</p>
            </div>
            <button 
              onClick={() => window.location.href = '/dashboard/new'}
              className="px-8 py-3 blue-gradient text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              {curT.approvedBtn}
            </button>
          </div>
        )}

        {status === 'rejected' && (
          <div className="p-12 text-center space-y-6">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-primary">{curT.rejectedTitle}</h3>
              <p className="text-gray-500">{curT.rejectedDesc}</p>
            </div>
            <button 
              onClick={() => setStatus('none')}
              className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
            >
              {curT.rejectedBtn}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-secondary/10 rounded-2xl">
              <ShieldCheck className="w-8 h-8 text-secondary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-primary">{curT.guidelinesTitle}</h2>
              <p className="text-gray-500 text-sm">{curT.guidelinesDesc}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* English Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 border-b pb-4">
              <span className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-bold">EN</span>
              <h3 className="text-xl font-bold text-primary">English Requirements</h3>
            </div>
            <div className="space-y-4">
              {[
                "Applicants for a personal security clearance must submit an application signed by the owner or manager of the facility or their representative, with an original copy certified by the Registration and Certification Service.",
                "When any institution applies to re-issue a certificate of competency that it has issued on its own initiative; or when it is ordered to do so based on a court decision.",
                "Subject to the provisions of sub-section (1) of this Article, the Certification Authority may accept applications in exceptional circumstances when it deems it necessary.",
                "Any institution or person whose application is accepted must complete and submit the attached form, fulfilling the requirements for obtaining a certificate of competency in accordance with the provisions of the amended guidelines.",
                "You can submit the documents listed in order numbers 1-4 to the head of the Special Office of the Commissioner General of Police during regular working hours."
              ].map((text, i) => (
                <div key={i} className="flex space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-secondary/20 text-secondary rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                  <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Amharic Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 border-b pb-4">
              <span className="w-10 h-10 bg-secondary text-primary rounded-xl flex items-center justify-center font-bold">አማ</span>
              <h3 className="text-xl font-bold text-primary">የአማርኛ መመሪያዎች</h3>
            </div>
            <div className="space-y-4">
              {[
                "የግል ጥበቃ ብቃት ማረጋገጫ ለማግኘት በማመልከቻ ለሚጠይቁ በተቋሙ ባለቤት ወይም ሥራ አስኪያጅ ወይም በውክልና በሰነዶች ምዝገባና ማረጋገጫ አገልግሎት የተረጋገጠ ዋና ቅጂ አባሪ በማድረግ ተፈርሞ መቅረብ አለበት።",
                "ማንኛውም ተቋም በራሱ ፍላጎት የመለሰውን ብቃት ማረጋገጫ በድጋሚ ለመስራት ሲያመለክት፤ ወይም በፍርድ ቤት ውሳኔ መሰረት እንዲሰራ ሲወሰን፤",
                "በዚህ አንቀጽ ንዑስ አንቀጽ (1) የተደነገገው እንደተጠበቀ ሆኖ ለብቃት ማረጋገጫ ሰጪው አስፈላጊ ሆኖ ሲያገኘው በልዩ ሁኔታ ማመልከቻ ሊቀበል ይችላል።",
                "ማንኛውም ተቋም ወይም ሰው ማመልከቻው ተቀባይነት ካገኘ በተሻሻለው መመሪያው ድንጋጌ መሰረት የብቃት ማረጋገጫ ለመውሰድ መሟላት የሚገባቸውን መስፈርቶች አሟልቶ በዚህ አባሪ ቅጽ ላይ ተሞልቶ መቅረብ አለበት።",
                "ከተራ ቁጥር 1-4 የተዘረዘሩትን ሰነዶች በማሟላት በመደበኛ የሥራ ሰዓት በኢትዮጵያ ፌዴራል ፖሊስ ኮሚሽን ኮሚሽነር ጄኔራል ልዩ ጽ/ቤት ኃላፊ ማቅረብ ይችላሉ።"
              ].map((text, i) => (
                <div key={i} className="flex space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                  <p className="text-sm text-gray-600 leading-relaxed font-medium">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 flex items-start space-x-4">
        <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
        <div className="space-y-1">
          <p className="font-bold text-amber-900 text-sm">{curT.important}</p>
          <p className="text-amber-800 text-xs leading-relaxed">
            {curT.importantDesc}
          </p>
        </div>
      </div>
      <AnimatePresence>
        <ViewerModal 
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          file={file}
          previewUrl={previewUrl}
        />
      </AnimatePresence>
    </div>
  );
};
