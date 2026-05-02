import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Mail, MessageSquare, Send, Users, AlertCircle, Clock, CheckCircle, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Communications = () => {
  const { language } = useLanguage();
  const isAm = language === 'am';
  
  const [method, setMethod] = useState<'email' | 'sms'>('email');
  const [targetType, setTargetType] = useState<'all' | 'specific' | 'category'>('all');
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  
  const t = {
    title: isAm ? "የኮሙኒኬሽን ማዕከል" : "Communication Center",
    subtitle: isAm ? "ለኤጀንሲዎች ቀጥታ መልእክት ይላኩ" : "Send direct notifications and updates via Email or SMS",
    sendEmail: isAm ? "ኢሜይል ላክ" : "Send Email",
    sendSms: isAm ? "SMS ላክ" : "Send SMS",
    subject: isAm ? "ርዕሰ ጉዳይ" : "Subject",
    message: isAm ? "መልእክት" : "Message",
    history: isAm ? "የተላኩ መልእክቶች" : "Sent History",
    allAgencies: isAm ? "ሁሉም ኤጀንሲዎች" : "All Agencies",
    activeOnly: isAm ? "ንቁ የሆኑት ብቻ" : "Active Only",
    recipient: isAm ? "ተቀባይ ቡድን" : "Recipient Group",
    priority: isAm ? "ቅድሚያ የሚሰጠው" : "Message Priority",
    urgent: isAm ? "አስቸኳይ" : "Urgent",
    normal: isAm ? "መደበኛ" : "Normal",
    recipients: isAm ? "ተቀባዮች" : "Recipients"
  };

  const [sentHistory, setSentHistory] = useState([
    { type: 'email', title: isAm ? "ሳምንታዊ የደህንነት ዝመና" : "Weekly Security Update", date: isAm ? "ዛሬ" : "Today, 10:45 AM", count: 452, status: 'Sent' },
    { type: 'sms', title: isAm ? "የአደጋ ጊዜ ማስጠንቀቂያ" : "Emergency System Alert", date: isAm ? "ትላንት" : "Yesterday", count: 1240, status: 'Sent' },
    { type: 'email', title: isAm ? "አዲስ ደንብ v2.1 ታትሟል" : "New Regulation v2.1 Published", date: "24 Apr 2024", count: 450, status: 'Sent' },
    { type: 'sms', title: isAm ? "የፈቃድ እድሳት ማሳሰቢያ" : "License Renewal Reminder", date: "20 Apr 2024", count: 85, status: 'Sent' },
  ]);

  const handleSend = () => {
    if (!message) {
      alert(isAm ? "እባክዎን መልእክት ያስገቡ" : "Please enter a message");
      return;
    }
    
    const newEntry = {
      type: method,
      title: method === 'email' ? (subject || (isAm ? "ርዕስ የሌለው" : "No Subject")) : (message.substring(0, 30) + "..."),
      date: isAm ? "አሁን" : "Just now",
      count: targetType === 'all' ? 1500 : 45,
      status: 'Sent'
    };

    setSentHistory([newEntry, ...sentHistory]);
    setMessage('');
    setSubject('');
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary tracking-tight">{t.title}</h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1">
            {t.subtitle}
          </p>
        </div>
        <div className="flex p-1.5 bg-white border border-gray-100 rounded-[24px] shadow-sm">
          <button 
            onClick={() => setMethod('email')}
            className={`px-8 py-3 rounded-[18px] flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest transition-all ${
              method === 'email' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-primary'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>EMAIL</span>
          </button>
          <button 
            onClick={() => setMethod('sms')}
            className={`px-8 py-3 rounded-[18px] flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest transition-all ${
              method === 'sms' ? 'gold-gradient text-primary shadow-lg shadow-secondary/20' : 'text-gray-400 hover:text-primary'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>SMS</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white rounded-[40px] border border-gray-100 p-10 shadow-sm space-y-8 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 ${method === 'email' ? 'bg-blue-50' : 'bg-secondary/10'} rounded-full blur-3xl -mr-16 -mt-16`} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">{t.recipient}</label>
                <div className="space-y-3">
                  {['all', 'category', 'specific'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setTargetType(type as any)}
                      className={`w-full p-5 rounded-[24px] border-2 flex items-center justify-between transition-all group ${
                        targetType === type ? 'border-primary bg-primary/5 text-primary' : 'border-gray-50 text-gray-400 hover:border-gray-100 font-bold'
                      }`}
                    >
                      <span className="text-[11px] font-black uppercase tracking-widest leading-none">
                        {type === 'all' ? t.allAgencies : (isAm ? (type === 'category' ? 'በምድብ' : 'ለተመረጡ') : type)}
                      </span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        targetType === type ? 'border-primary' : 'border-gray-200'
                      }`}>
                        {targetType === type && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">{t.priority}</label>
                <div className="grid grid-cols-1 gap-3">
                  <button className="w-full p-5 bg-gray-50 rounded-[24px] text-[11px] font-black uppercase tracking-widest border-2 border-transparent hover:border-red-500 transition-all text-gray-400 hover:text-red-600 flex items-center justify-between">
                    <span>{t.urgent}</span>
                    <AlertCircle className="w-4 h-4" />
                  </button>
                  <button className="w-full p-5 blue-gradient text-white rounded-[24px] text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center justify-between">
                    <span>{t.normal}</span>
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-10 border-t border-gray-50 relative z-10">
              {method === 'email' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">{t.subject}</label>
                  <input 
                    type="text" 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-8 py-5 bg-gray-50 rounded-[24px] border-2 border-transparent focus:border-primary focus:bg-white outline-none font-bold transition-all text-primary shadow-inner" 
                    placeholder={isAm ? "ርዕስ እዚህ ይጥቀሱ..." : "Enter email subject..."} 
                  />
                </div>
              )}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">{t.message}</label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-8 py-5 bg-gray-50 rounded-[30px] border-2 border-transparent focus:border-primary focus:bg-white outline-none font-medium transition-all h-56 resize-none text-primary leading-relaxed shadow-inner" 
                  placeholder={isAm ? "መልዕክትዎን እዚህ ይጻፉ..." : "Type your message here..."}
                ></textarea>
                <div className="flex justify-between items-center px-4 pt-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">{method === 'sms' ? `${message.length} / 160 characters (1 SMS)` : "HTML formatting supported"}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 relative z-10">
              <button 
                onClick={handleSend}
                className={`${method === 'email' ? 'blue-gradient' : 'gold-gradient'} text-${method === 'email' ? 'white' : 'primary'} px-16 py-6 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center space-x-4`}
              >
                <Send className="w-5 h-5" />
                <span>{method === 'email' ? t.sendEmail : t.sendSms}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col space-y-8">
          <div className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-8 px-2">
              <h3 className="text-xl font-black text-primary flex items-center space-x-3 tracking-tight">
                <Clock className="w-6 h-6 text-secondary" />
                <span>{t.history}</span>
              </h3>
              <button className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all">
                <Search className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
              {sentHistory.map((item, i) => (
                <div key={i} className="p-6 bg-gray-50/50 rounded-[30px] border border-transparent hover:border-gray-200 hover:bg-white transition-all group cursor-pointer shadow-sm hover:shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${item.type === 'email' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                        {item.type === 'email' ? <Mail className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                      </div>
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{item.type}</span>
                    </div>
                    <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-100 flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>{isAm ? "ተልኳል" : item.status}</span>
                    </span>
                  </div>
                  <h4 className="font-black text-primary text-base tracking-tight line-clamp-1 group-hover:text-secondary transition-colors">{item.title}</h4>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Users className="w-4 h-4" />
                      <span className="text-[10px] font-bold">{item.count} {t.recipients}</span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-300">{item.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
