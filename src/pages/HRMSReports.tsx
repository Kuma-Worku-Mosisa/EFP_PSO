import React, { useState } from 'react';
import { Search, Filter, Users, FileBarChart, Download, ExternalLink, Shield, MapPin, X, FileText, CreditCard, AlertCircle, Award, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

export const HRMSReports = () => {
  const { language } = useLanguage();
  const isAm = language === 'am';
  const [selectedAgency, setSelectedAgency] = useState<any>(null);
  const [activeReport, setActiveReport] = useState<string | null>(null);

  const t = {
    title: isAm ? "የኤጀንሲዎች HRMS ሪፖርቶች" : "Agencies HRMS Reports",
    subtitle: isAm ? "ከኤጀንሲዎች የሰው ኃይል አስተዳደር ስርዓት የተገኙ ሪፖርቶች" : "Reports retrieved from individual agency HRMS systems",
    search: isAm ? "ኤጀንሲ ይፈልጉ..." : "Search agency...",
    table: {
      agency: isAm ? "የኤጀንሲ ስም" : "Agency Name",
      totalStaff: isAm ? "ጠቅላላ ሰራተኞች" : "Total Staff",
      trained: isAm ? "የሰለጠኑ" : "Trained",
      deployed: isAm ? "የተሰማሩ" : "Deployed",
      lastUpdate: isAm ? "የመጨረሻ ዝመና" : "Last Update",
      actions: isAm ? "እርምጃዎች" : "Actions"
    }
  };

  const reports = [
    { id: 1, agency: "Abyssinia Security", total: 450, trained: 420, deployed: 380, lastUpdate: "2024-10-15" },
    { id: 2, agency: "Lion Guard Services", total: 280, trained: 275, deployed: 250, lastUpdate: "2024-10-14" },
    { id: 3, agency: "Nile Protection", total: 120, trained: 110, deployed: 95, lastUpdate: "2024-10-12" },
    { id: 4, agency: "Eagle Eye Security", total: 600, trained: 580, deployed: 540, lastUpdate: "2024-10-15" },
  ];

  const reportTypes = [
    { id: 'monthly', name: 'Monthly Performance', icon: <Calendar className="w-5 h-5 text-blue-500" />, desc: 'Statistical overview of agency activities.' },
    { id: 'personnel', name: 'Personnel Documents', icon: <FileText className="w-5 h-5 text-purple-500" />, desc: 'Background checks and legal IDs of guards.' },
    { id: 'payroll', name: 'Payroll & Benefits', icon: <CreditCard className="w-5 h-5 text-green-500" />, desc: 'Wages, insurance, and social security compliance.' },
    { id: 'incidents', name: 'Crime & Incidents', icon: <AlertCircle className="w-5 h-5 text-red-500" />, desc: 'Reported crimes or disciplinary actions by staff.' },
    { id: 'training', name: 'Training Certs', icon: <Award className="w-5 h-5 text-amber-500" />, desc: 'Certification status of all security personnel.' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-end gap-6">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-primary">{t.title}</h3>
          <p className="text-gray-500 text-sm">{t.subtitle}</p>
        </div>
        <div className="flex space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={t.search} 
              className="pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary w-64 shadow-sm" 
            />
          </div>
          <button className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all">
            <Download className="w-4 h-4" />
            <span>{isAm ? "ሪፖርት አውርድ" : "Export All"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: isAm ? "ጠቅላላ የደህንነት ሰራተኞች" : "Total Security Personnel", value: "25,482", icon: <Users className="text-blue-600" />, color: "bg-blue-50" },
          { label: isAm ? "የሰለጠኑ ሰራተኞች" : "Certified Trained Staff", value: "23,120", icon: <Shield className="text-green-600" />, color: "bg-green-50" },
          { label: isAm ? "ንቁ ስምሪቶች" : "Active Deployments", value: "18,940", icon: <MapPin className="text-purple-600" />, color: "bg-purple-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className={`p-4 rounded-2xl ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-primary">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="px-8 py-6">{t.table.agency}</th>
                <th className="px-8 py-6">{t.table.totalStaff}</th>
                <th className="px-8 py-6">{t.table.trained}</th>
                <th className="px-8 py-6">{t.table.deployed}</th>
                <th className="px-8 py-6">{t.table.lastUpdate}</th>
                <th className="px-8 py-6 text-right">{t.table.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6 font-bold text-primary text-sm">{report.agency}</td>
                  <td className="px-8 py-6 text-sm text-gray-600 font-medium">{report.total}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-2">
                      <div className="flex-grow bg-gray-100 h-2 rounded-full overflow-hidden max-w-[100px]">
                        <div 
                          className="bg-green-500 h-full" 
                          style={{ width: `${(report.trained / report.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-black text-gray-400">{Math.round((report.trained / report.total) * 100)}%</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-gray-600 font-medium">{report.deployed}</td>
                  <td className="px-8 py-6 text-sm text-gray-500">{report.lastUpdate}</td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => setSelectedAgency(report)}
                      className="text-primary hover:bg-primary/5 p-3 rounded-xl transition-all"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reports Drilldown Modal */}
      <AnimatePresence>
        {selectedAgency && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl p-10 flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-8 border-b pb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center">
                    <FileBarChart className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-primary uppercase tracking-tighter">Agency HRMS Reports</h4>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{selectedAgency.agency} Management System</p>
                  </div>
                </div>
                <button onClick={() => { setSelectedAgency(null); setActiveReport(null); }} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {!activeReport ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-2">
                  {reportTypes.map((type) => (
                    <motion.button
                      key={type.id}
                      whileHover={{ scale: 1.02, y: -4 }}
                      onClick={() => setActiveReport(type.id)}
                      className="p-6 bg-gray-50 rounded-[32px] text-left space-y-4 hover:shadow-xl transition-all border-2 border-transparent hover:border-primary/10"
                    >
                      <div className="p-3 bg-white rounded-2xl w-fit shadow-sm">
                        {type.icon}
                      </div>
                      <div>
                        <h5 className="font-black text-primary uppercase tracking-tighter">{type.name}</h5>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed mt-1">{type.desc}</p>
                      </div>
                      <div className="flex items-center text-xs font-black text-primary uppercase tracking-widest pt-2">
                        View Report <ExternalLink className="w-3 h-3 ml-2" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="space-y-8 overflow-y-auto pr-2">
                  <div className="flex items-center space-x-4">
                    <button onClick={() => setActiveReport(null)} className="text-primary font-bold text-sm hover:underline italic">← Back to selection</button>
                    <div className="h-4 w-px bg-gray-200" />
                    <h5 className="text-lg font-black text-primary uppercase tracking-tighter">{reportTypes.find(r => r.id === activeReport)?.name}</h5>
                  </div>

                  <div className="bg-gray-50 p-8 rounded-[40px] space-y-6">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-bold text-gray-500 italic">Showing live data for {selectedAgency.agency}</p>
                      <button className="flex items-center space-x-2 text-xs font-black text-blue-600 bg-white px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all">
                        <Download className="w-4 h-4" />
                        <span>Download PDF</span>
                      </button>
                    </div>

                    {/* Mock Content Based on type */}
                    {activeReport === 'incidents' ? (
                      <div className="space-y-4">
                        {[
                          { date: '2024-09-12', personnel: 'Kassa T.', type: 'Theft Suspect', status: 'Investigation' },
                          { date: '2024-08-01', personnel: 'Mulu B.', type: 'Assault', status: 'Dismissed' },
                        ].map((inc, i) => (
                          <div key={i} className="flex justify-between items-center p-4 bg-white rounded-2xl border border-red-50">
                            <div>
                              <p className="text-sm font-black text-red-600 uppercase tracking-tighter">{inc.type}</p>
                              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">{inc.personnel} • {inc.date}</p>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{inc.status}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-64 flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-gray-200 rounded-[32px]">
                        <FileBarChart className="w-12 h-12 text-gray-300" />
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Generating {activeReport} data visualization...</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
