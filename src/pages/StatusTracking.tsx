import React from 'react';
import { Clock, CheckCircle2, AlertCircle, Search, ArrowRight, FileText, MapPin, Shield } from 'lucide-react';
import { motion } from 'motion/react';

import { useLanguage } from '../context/LanguageContext';

export const StatusTracking = () => {
  const { language } = useLanguage();
  
  const t_track = {
    en: {
      title: "Track Application",
      appId: "Application ID",
      step1: { title: "Formal Letter Submitted", desc: "Your formal letter of request has been approved by the Federal Police Admin." },
      step2: { title: "New Application", desc: "Your full license application is currently being reviewed." },
      step3: { title: "Document Verification", desc: "Verification of all uploaded documents and background checks." },
      step4: { title: "Agreement & Payment", desc: "Signing the contract and paying the licensing fee." },
      step5: { title: "License Issuance", desc: "Final issuance of your digital and physical license." },
      status: {
        approved: "Approved",
        inProgress: "In Progress",
        pending: "Pending",
        completed: "Completed"
      }
    },
    am: {
      title: "ማመልከቻውን ይከታተሉ",
      appId: "የማመልከቻ መለያ ቁጥር",
      step1: { title: "የማመልከቻ ደብዳቤ ገብቷል", desc: "መደበኛ የማመልከቻ ደብዳቤዎ በፌዴራል ፖሊስ አስተዳዳሪ ጸድቋል።" },
      step2: { title: "አዲስ ማመልከቻ", desc: "ሙሉ የፈቃድ ማመልከቻዎ በአሁኑ ጊዜ እየተገመገመ ነው።" },
      step3: { title: "የሰነድ ማረጋገጫ", desc: "የሁሉም የተሰቀሉ ሰነዶች ማረጋገጫ እና የጀርባ ምርመራ።" },
      step4: { title: "ውል እና ክፍያ", desc: "ውል መፈረም እና የፈቃድ ክፍያ መክፈል።" },
      step5: { title: "የፈቃድ አሰጣጥ", desc: "የዲጂታል እና የአካል ፈቃድ የመጨረሻ አሰጣጥ።" },
      status: {
        approved: "ጸድቋል",
        inProgress: "በሂደት ላይ",
        pending: "በመጠባበቅ ላይ",
        completed: "ተጠናቋል"
      }
    }
  };

  const curT = t_track[language as keyof typeof t_track] || t_track.en;

  const steps = [
    { title: curT.step1.title, date: "Oct 12, 2024", status: "Approved", desc: curT.step1.desc },
    { title: curT.step2.title, date: "Oct 14, 2024", status: "In Progress", desc: curT.step2.desc },
    { title: curT.step3.title, date: "Pending", status: "Pending", desc: curT.step3.desc },
    { title: curT.step4.title, date: "Pending", status: "Pending", desc: curT.step4.desc },
    { title: curT.step5.title, date: "Pending", status: "Pending", desc: curT.step5.desc },
  ];

  const currentStatus: string = "In Progress";

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-primary">{curT.title}</h3>
          <p className="text-gray-500">{curT.appId}: #FP-PSA-2024-0892</p>
        </div>
        <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${
          currentStatus === 'Approved' ? 'bg-green-50 text-green-700 border-green-100' :
          currentStatus === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' :
          currentStatus === 'Under Review' ? 'bg-amber-50 text-amber-700 border-amber-100' :
          currentStatus === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-100' :
          'bg-gray-50 text-gray-700 border-gray-100'
        }`}>
          <Clock className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">
            {currentStatus === 'In Progress' ? curT.status.inProgress : currentStatus}
          </span>
        </div>
      </div>

      <div className="relative space-y-12">
        <div className="absolute top-0 left-8 w-1 h-full bg-gray-100 -z-10" />
        
        {steps.map((step, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start space-x-8"
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
              step.status === 'Approved' || step.status === 'Completed' ? 'bg-green-500 text-white' : 
              step.status === 'In Progress' ? 'bg-primary text-secondary animate-pulse' : 'bg-white text-gray-300 border-2 border-gray-100'
            }`}>
              {step.status === 'Approved' || step.status === 'Completed' ? <CheckCircle2 className="w-8 h-8" /> : 
               step.status === 'In Progress' ? <Clock className="w-8 h-8" /> : <Shield className="w-8 h-8" />}
            </div>
            
            <div className={`flex-grow bg-white p-8 rounded-3xl shadow-sm border transition-all ${
              step.status === 'In Progress' ? 'border-primary ring-4 ring-primary/5' : 'border-gray-100'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-xl font-bold text-primary">{step.title}</h4>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{step.date}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  step.status === 'Approved' || step.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                  step.status === 'In Progress' ? 'bg-primary text-secondary' : 'bg-gray-100 text-gray-400'
                }`}>
                  {step.status === 'Approved' ? curT.status.approved : 
                   step.status === 'In Progress' ? curT.status.inProgress : 
                   step.status === 'Pending' ? curT.status.pending : 
                   step.status === 'Completed' ? curT.status.completed : step.status}
                </span>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm">{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
