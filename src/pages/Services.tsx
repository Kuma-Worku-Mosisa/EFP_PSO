import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Shield, 
  FileText, 
  CheckCircle, 
  Users, 
  Map, 
  CreditCard, 
  ArrowRight, 
  RefreshCw, 
  HelpCircle,
  Newspaper,
  BookOpen,
  Award,
  Zap,
  Globe,
  Lock,
  Headphones,
  Archive,
  BarChart3,
  UserCheck,
  IdCard,
  Scale,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

export const Services = () => {
  const { t, language } = useLanguage();
  const isAm = language === 'am';

  const services = t.services.items.map((item: any, i: number) => ({
    ...item,
    icon: [
      <FileText key="1" className="w-10 h-10" />,
      <RefreshCw key="2" className="w-10 h-10" />,
      <Newspaper key="3" className="w-10 h-10" />,
      <HelpCircle key="4" className="w-10 h-10" />,
      <IdCard key="5" className="w-10 h-10" />,
      <Scale key="6" className="w-10 h-10" />,
    ][i]
  }));

  const steps = [
    { number: "01", title: isAm ? "መመዝገብ" : "Register", desc: isAm ? "የኤጀንሲዎን ዝርዝር መረጃ በመያዝ መለያ ይፍጠሩ።" : "Create your agency account using verified manager details and Fayda ID." },
    { number: "02", title: isAm ? "ሰነድ ማስገባት" : "Submit Docs", desc: isAm ? "አስፈላጊ ሰነዶችን በፒዲኤፍ ቅርጸት በዲጂታል ፖርታሉ ይጫኑ።" : "Upload all required organization and personnel documents in PDF format." },
    { number: "03", title: isAm ? "ማረጋገጫ" : "Verification", desc: isAm ? "የፌዴራል ፖሊስ ባለሙያዎች ሰነዶችዎን እና ቢሮዎን ይፈትሻሉ።" : "Federal Police officers will verify your documents and conduct bureau inspections." },
    { number: "04", title: isAm ? "ፈቃድ ማግኘት" : "Get Licensed", desc: isAm ? "ክፍያ ከፈጸሙ በኋላ ዲጂታል ፈቃድዎን ይቀበላሉ።" : "Receive your official digital license after approval and fee payment." }
  ];

  const benefits = [
    { icon: <Zap className="w-6 h-6 text-yellow-500" />, title: isAm ? "ፈጣን ሂደት" : "Rapid Processing", desc: isAm ? "የዲጂታል ስርዓቱ የፈቃድ አሰጣጥ ሂደቱን በእጅጉ ያሳጥራል።" : "Digital integration cuts down physical paperwork and processing time by 60%." },
    { icon: <Lock className="w-6 h-6 text-green-500" />, title: isAm ? "ደህንነቱ የተጠበቀ" : "Maximum Security", desc: isAm ? "በፋይዳ መታወቂያ የተደገፈ ማንነት ማረጋገጫ ማጭበርበርን ይከላከላታል።" : "Fayda ID verification ensures only vetted individuals manage security agencies." },
    { icon: <Globe className="w-6 h-6 text-blue-500" />, title: isAm ? "ማዕከላዊ ቁጥጥር" : "Unified Platform", desc: isAm ? "ሁሉንም ኤጀንሲዎች በአንድ ማዕከላዊ ስርዓት ለመቆጣጠር ይረዳል።" : "Manage applications, personnel, and renewals from a single national database." },
    { icon: <BarChart3 className="w-6 h-6 text-purple-500" />, title: isAm ? "ግልጽነት" : "Total Transparency", desc: isAm ? "የማመልከቻዎን ሁኔታ በማንኛውም ጊዜ በቀጥታ መከታተል ይችላሉ።" : "Track your application status in real-time with instant email and SMS notifications." }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  } as const;

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 30 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    },
    hover: { 
      y: -15, 
      scale: 1.02,
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
      transition: { type: "spring", stiffness: 400, damping: 10 }
    }
  } as const;

  return (
    <div className="py-24 space-y-32 overflow-hidden">
      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6 mb-20 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1 bg-secondary/10 border border-secondary/20 rounded-full"
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="w-3 h-3 text-secondary animate-pulse" />
              <span className="text-secondary font-black uppercase text-[10px] tracking-widest">{t.services.badge}</span>
            </div>
          </motion.div>
          <h3 className="text-4xl md:text-5xl font-black text-primary uppercase tracking-tighter leading-none">{t.services.subtitle}</h3>
          <p className="text-gray-500 font-medium text-lg italic">{isAm ? "በኢትዮጵያ ፌዴራል ፖሊስ የሚሰጡ የተቀናጁ የደህንነት ቁጥጥር አገልግሎቶች" : "Integrated security oversight services provided by the Ethiopian Federal Police."}</p>
          <div className="w-24 h-1.5 bg-secondary mx-auto rounded-full" />
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {services.map((service: any, i: number) => (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover="hover"
              className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[80px] -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
              
              <div className="mb-6 relative z-10 text-primary transform group-hover:rotate-12 transition-transform duration-500">
                {service.icon}
              </div>
              
              <h4 className="text-xl font-black text-primary mb-3 uppercase tracking-tight leading-tight min-h-[3rem] line-clamp-2">{service.title}</h4>
              <p className="text-gray-500 text-xs font-bold leading-relaxed mb-6 italic">{service.desc}</p>
              
              <div className="space-y-2 mb-8">
                {service.features.map((f: string, j: number) => (
                  <motion.div 
                    key={j} 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + (j * 0.1) }}
                    className="flex items-center space-x-2 text-[10px] font-black text-gray-400 uppercase tracking-widest"
                  >
                    <CheckCircle className="text-green-500 w-3 h-3 flex-shrink-0" />
                    <span>{f}</span>
                  </motion.div>
                ))}
              </div>
              
              <Link to="/register" className="inline-flex items-center space-x-2 text-xs font-black text-primary bg-gray-50 px-5 py-3 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all w-full justify-between">
                <span>{t.services.getStarted}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How it Works section - with dark blue heading accent and golden steps */}
      <section className="bg-dark-blue py-32 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 right-0 w-[800px] h-[800px] border-[20px] border-white/5 rounded-full -mr-96 -mt-96" 
          />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary opacity-5 blur-[100px] rounded-full -ml-48 -mb-48" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="text-[#efdd0f] font-black uppercase tracking-[0.2em] text-xs flex items-center space-x-3 bg-white/10 w-fit px-4 py-1 rounded-full">
                <span className="w-8 h-px bg-[#efdd0f]" />
                <span>{isAm ? "እንዴት እንደሚሰራ" : "Direct Pathway"}</span>
              </h2>
              <h3 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
                {isAm ? "የእርስዎ ፈቃድ በጥቂት እርምጃዎች" : "Your Security License in Simple Steps"}
              </h3>
              <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-lg">
                {isAm ? "ባለፉት አመታት የፈቃድ አሰጣጥ ሂደቱን ቀላል እና ዲጂታል አድርገናል። አሁን ኤጀንሲዎን በደቂቃዎች ውስጥ መመዝገብ ይችላሉ።" : "We've engineered a seamless regulatory journey. No more endless queues or lost paperwork. Transition from application to approval entirely on your dashboard."}
              </p>
              <div className="pt-6">
                <Link to="/register" className="gold-gradient text-primary px-12 py-6 rounded-[30px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all inline-flex items-center space-x-3">
                  <span>{isAm ? "አሁኑኑ ይጀምሩ" : "Initiate Registration"}</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8, y: 40 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, type: "spring", bounce: 0.4 }}
                  whileHover={{ y: -10, borderColor: "rgba(255, 215, 0, 0.5)" }}
                  className="bg-white/5 backdrop-blur-md border border-white/10 p-10 rounded-[50px] space-y-5 hover:bg-white/10 transition-all border-b-8 border-b-secondary shadow-2xl group"
                >
                  <span className="text-5xl font-black text-secondary/30 group-hover:text-secondary/60 transition-colors block tracking-tighter">{step.number}</span>
                  <h4 className="text-2xl font-black text-white uppercase tracking-tight">{step.title}</h4>
                  <p className="text-sm text-gray-400 font-medium leading-relaxed italic">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section - Detail Addition */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {benefits.map((benefit, i) => (
            <div key={i} className="space-y-4 text-center lg:text-left">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto lg:mx-0 shadow-inner">
                {benefit.icon}
              </div>
              <h4 className="text-xl font-black text-primary uppercase tracking-tight leading-tight">{benefit.title}</h4>
              <p className="text-sm text-gray-500 font-medium leading-relaxed italic">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Support CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="bg-gray-50 rounded-[64px] p-12 md:p-20 flex flex-col items-center text-center space-y-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-secondary/5 to-transparent pointer-events-none" />
          <Headphones className="w-16 h-16 text-primary animate-bounce" />
          <div className="space-y-4">
            <h3 className="text-3xl md:text-4xl font-black text-primary uppercase tracking-tighter">{isAm ? "እርዳታ ይፈልጋሉ?" : "Need Tactical Support?"}</h3>
            <p className="text-gray-500 font-medium max-w-xl mx-auto italic">
              {isAm ? "የእኛ የድጋፍ ቡድን በፈቃድ አሰጣጥ ሂደቱ ላይ ሊመራዎት ዝግጁ ነው። ስለ ደንቦች ወይም ሰነዶች ማንኛውም ጥያቄ ካለዎት ይደውሉልን።" : "Our specialized regulatory team is standing by to guide you through complex vetting or equipment approval processes. Reach out to the Federal Help Desk."}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="bg-primary text-white px-10 py-5 rounded-[24px] font-black uppercase tracking-widest shadow-xl hover:bg-hover active:scale-95 transition-all">
              {isAm ? "ያግኙን" : "Contact Officer"}
            </Link>
            <Link to="/faq" className="bg-white border-2 border-primary/20 text-primary px-10 py-5 rounded-[24px] font-black uppercase tracking-widest hover:bg-gray-100 active:scale-95 transition-all">
              {isAm ? "ተደጋጋሚ ጥያቄዎች" : "Read Knowledgebase"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
