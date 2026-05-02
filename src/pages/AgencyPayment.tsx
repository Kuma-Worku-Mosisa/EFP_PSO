import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { CreditCard, CheckCircle2, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AgencyPayment = () => {
  const { language } = useLanguage();
  const isAm = language === 'am';
  const [paid, setPaid] = React.useState(false);
  const [selectedMethod, setSelectedMethod] = React.useState<'telebirr' | 'cbe' | 'bank' | null>(null);

  const t = {
    title: isAm ? "ክፍያ" : "Payments & Fees",
    subtitle: isAm ? "የፈቃድ ክፍያዎችን እና የአገልግሎት ዋጋዎችን እዚህ ይክፈሉ" : "Pay licensing fees and service charges securely",
    amount: "15,000 ETB",
    feeLabel: isAm ? "የፈቃድ ክፍያ" : "Licensing Fee",
    payBtn: isAm ? "ክፈል እና አጠናቅ" : "Pay Now",
    successTitle: isAm ? "ክፍያ ተሳክቷል!" : "Payment Successful!",
    successDesc: isAm ? "የፈቃድ ክፍያዎ በትክክል ተፈጽሟል። አሁን ፈቃድዎን ማውረድ ይችላሉ።" : "Your licensing fee has been processed successfully. You can now download your license.",
    viewLicense: isAm ? "ፈቃዴን እይ" : "View My License",
    secure: isAm ? "ደህንነቱ የተጠበቀ የክፍያ በር • የፌዴራል ፖሊስ ኮሚሽን" : "Secure Payment Gateway • Federal Police Commission",
    methods: isAm ? "የክፍያ አማራጮች" : "Payment Methods",
    selectMethod: isAm ? "እባክዎን የመክፈያ ዘዴ ይምረጡ" : "Please select a payment method",
    history: isAm ? "የክፍያ ታሪክ" : "Payment History",
    transactionId: "TRX-9928310",
    date: isAm ? "ሚያዝያ 21, 2016" : "April 29, 2024"
  };

  const handlePayment = () => {
    if (!selectedMethod) return;
    setPaid(true);
  };

  if (paid) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto p-12 text-center space-y-6 bg-green-50 rounded-[40px] border border-green-100 shadow-xl shadow-green-900/5 mt-10"
      >
        <div className="w-24 h-24 bg-white text-green-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h3 className="text-3xl font-black text-primary tracking-tight">
            {t.successTitle}
          </h3>
          <p className="text-gray-500 font-medium leading-relaxed">
            {t.successDesc}
          </p>
        </div>
        <div className="bg-white/50 p-6 rounded-3xl border border-white space-y-3">
          <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
            <span>Transaction ID</span>
            <span className="text-primary">{t.transactionId}</span>
          </div>
          <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
            <span>Amount Paid</span>
            <span className="text-primary">{t.amount}</span>
          </div>
        </div>
        <button 
          onClick={() => window.location.href = '/dashboard/license'}
          className="w-full py-5 blue-gradient text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {t.viewLicense}
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-primary tracking-tighter uppercase">{t.title}</h2>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">{t.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Payment Card */}
          <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100 space-y-8">
            <div className="flex items-center space-x-6">
               <div className="p-5 bg-blue-50 rounded-3xl">
                 <CreditCard className="w-10 h-10 text-blue-600" />
               </div>
               <div>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">{t.feeLabel}</p>
                  <p className="text-4xl font-black text-primary">{t.amount}</p>
               </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">{t.methods}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'telebirr', name: 'Telebirr', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Telebirr_Logo.png/1200px-Telebirr_Logo.png' },
                  { id: 'cbe', name: 'CBE Birr', img: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Commercial_Bank_of_Ethiopia_logo.png/220px-Commercial_Bank_of_Ethiopia_logo.png' },
                  { id: 'bank', name: 'Other Bank', icon: <ShieldCheck className="w-8 h-8" /> }
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id as any)}
                    className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center justify-center space-y-3 group ${
                      selectedMethod === method.id 
                        ? 'border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-900/5' 
                        : 'border-gray-50 bg-gray-50 hover:border-gray-200 hover:bg-white'
                    }`}
                  >
                    <div className="h-12 flex items-center justify-center">
                      {method.img ? (
                        <img src={method.img} alt={method.name} className="h-full object-contain filter group-hover:brightness-110 transition-all" />
                      ) : (
                        <div className={`p-2 rounded-xl ${selectedMethod === method.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                          {method.icon}
                        </div>
                      )}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${selectedMethod === method.id ? 'text-blue-600' : 'text-gray-400'}`}>
                      {method.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handlePayment}
              disabled={!selectedMethod}
              className={`w-full py-6 blue-gradient text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-3 ${!selectedMethod ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
            >
              <span>{t.payBtn}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* History */}
          <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100">
            <h3 className="text-lg font-black text-primary uppercase tracking-tight mb-8">{t.history}</h3>
            <div className="space-y-4">
              {[1].map((i) => (
                <div key={i} className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100 hover:bg-white hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex items-center space-x-6">
                    <div className="p-3 bg-white rounded-2xl group-hover:bg-blue-50 transition-colors">
                      <CreditCard className="w-6 h-6 text-gray-400 group-hover:text-blue-600" />
                    </div>
                    <div>
                      <p className="font-black text-primary uppercase text-xs tracking-tight">{t.feeLabel}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{t.transactionId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-primary">{t.amount}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{t.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-primary rounded-[40px] p-10 text-white space-y-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-2xl -mr-16 -mt-16" />
             <div className="relative z-10 space-y-6">
                <AlertCircle className="w-10 h-10 text-secondary" />
                <h3 className="text-xl font-black uppercase tracking-tight leading-tight">Payment Security Guidelines</h3>
                <p className="text-sm font-medium text-white/70 leading-relaxed">
                  All transactions are encrypted using federal-grade security protocols. Ensure you are scanning the official QR codes.
                </p>
                <div className="pt-4 border-t border-white/10 space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-secondary" />
                    <span className="text-[10px] font-black uppercase tracking-widest">SSL Encrypted</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-secondary" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Fraud Protection</span>
                  </div>
                </div>
             </div>
          </div>

          <div className="p-8 bg-amber-50 rounded-[40px] border border-amber-100">
             <p className="text-[9px] font-black text-amber-600 uppercase tracking-[0.2em] mb-4">Support & Help</p>
             <p className="text-xs font-bold text-amber-900 leading-relaxed">
               If you experience any issues with your payment, please contact the Federal Police Finance Bureau at +251 115 54 05 28.
             </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center space-x-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
        <ShieldCheck className="w-4 h-4" />
        <span>{t.secure}</span>
      </div>
    </div>
  );
};
