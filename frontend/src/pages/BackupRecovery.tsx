import React from 'react';
import { 
  Database, 
  RotateCcw, 
  Download, 
  Calendar, 
  Cloud, 
  HardDrive, 
  Settings,
  History,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { cn } from '../lib/utils';

export const BackupRecovery = () => {
  const { language } = useLanguage();
  const isAm = language === 'am';

  const backups = [
    { id: 1, name: "System_Full_Backup_20241022.sql", date: "Oct 22, 2024 02:00 AM", size: "1.2 GB", type: "Automated", status: "Success" },
    { id: 2, name: "Agency_Docs_Snapshot.zip", date: "Oct 21, 2024 02:00 AM", size: "450 MB", type: "Manual", status: "Success" },
    { id: 3, name: "Personnel_Db_Weekly.sql", date: "Oct 15, 2024 01:00 AM", size: "890 MB", type: "Automated", status: "Success" },
    { id: 4, name: "Audit_Logs_Archive.gz", date: "Oct 01, 2024 12:00 AM", size: "2.5 GB", type: "System", status: "Archived" },
  ];

  return (
    <div className="space-y-10 pb-20">
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-primary tracking-tighter uppercase">{isAm ? "መጠባበቂያ እና ማግኛ" : "Backup & Recovery"}</h2>
        <p className="text-sm text-gray-500 font-bold uppercase tracking-widest opacity-60 italic">{isAm ? "የስርአት ውሂብን መጠባበቂያ ያስተዳድሩ እና የመመለሻ ነጥቦችን ያቅዱ" : "Manage system data backups and schedule restoration nodes"}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: isAm ? "ጠቅላላ መጠባበቂያዎች" : "Total Backups", value: "142", icon: <Database className="w-5 h-5 text-blue-600" />, color: "bg-blue-50" },
          { label: isAm ? "ደመና ማከማቻ" : "Cloud Storage Used", value: "48.2 GB", icon: <Cloud className="w-5 h-5 text-purple-600" />, color: "bg-purple-50" },
          { label: isAm ? "ቀጣይ የታቀደ" : "Next Scheduled", value: "2 hrs 14m", icon: <Calendar className="w-5 h-5 text-amber-600" />, color: "bg-amber-50" },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex items-center space-x-6"
          >
            <div className={`p-4 rounded-2xl ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-primary tracking-tighter">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Actions Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-primary p-8 rounded-[40px] text-white space-y-6 shadow-2xl relative overflow-hidden">
            <RotateCcw className="absolute -bottom-6 -right-6 w-32 h-32 opacity-10" />
            <h3 className="text-xl font-black uppercase tracking-tight">{isAm ? "አፋጣኝ እርምጃዎች" : "Instant Actions"}</h3>
            <div className="space-y-3">
              <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center space-x-3 border border-white/10 group">
                <Database className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>{isAm ? "አሁን መጠባበቂያ ፍጠር" : "Full Snapshot Now"}</span>
              </button>
              <button className="w-full py-4 bg-white text-primary hover:bg-gray-100 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center space-x-3 shadow-xl">
                <RotateCcw className="w-4 h-4" />
                <span>{isAm ? "ስርአቱን ይመልሱ" : "Restore From File"}</span>
              </button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-base font-black text-primary uppercase tracking-tight flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>{isAm ? "አውቶማቲካሊ መጠባበቂያ ቅንብሮች" : "Automation Settings"}</span>
            </h3>
            <div className="space-y-4">
              {[
                { label: isAm ? "የየቀኑ ራስ-ሰር መጠባበቂያ" : "Daily Auto Backup", active: true },
                { label: isAm ? "ከሳይት ውጪ መጠባበቂያ" : "Off-site Replication", active: true },
                { label: isAm ? "ኢሜል ማሳወቂያ" : "Email Success Alerts", active: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{item.label}</span>
                  <div className={`w-10 h-5 rounded-full relative transition-all ${item.active ? 'bg-primary' : 'bg-gray-300'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${item.active ? 'right-1' : 'left-1'}`} />
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full py-3 bg-gray-50 text-gray-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all border border-dashed border-gray-200">
              {isAm ? "ተጨማሪ ቅንብሮች" : "Advanced Scheduling"}
            </button>
          </div>
        </div>

        {/* History Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-8 border-b flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gray-50 rounded-2xl">
                  <History className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-primary uppercase tracking-tight">{isAm ? "የመጠባበቂያ ታሪክ" : "Backup Library"}</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{isAm ? "ተገኝተዋል 142 ፋይሎች" : "142 files detected"}</p>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input 
                  type="text" 
                  placeholder={isAm ? "መጠባበቂያ ፈልግ..." : "Search backups..."}
                  className="pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary w-64" 
                />
              </div>
            </div>
            
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black">
                  <tr>
                    <th className="px-8 py-5">{isAm ? "የፋይል ስም" : "Filename"}</th>
                    <th className="px-8 py-5">{isAm ? "ቀን" : "Date"}</th>
                    <th className="px-8 py-5">{isAm ? "መጠን" : "Size"}</th>
                    <th className="px-8 py-5">{isAm ? "ሁኔታ" : "Status"}</th>
                    <th className="px-8 py-5 text-right font-black italic">{isAm ? "ድርጊት" : "RESTORE"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {backups.map((bk) => (
                    <tr key={bk.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center space-x-3">
                          {bk.name.endsWith('.sql') ? <RotateCcw className="w-4 h-4 text-blue-500" /> : <HardDrive className="w-4 h-4 text-purple-500" />}
                          <div>
                            <p className="text-sm font-black text-primary tracking-tight">{bk.name}</p>
                            <p className="text-[10px] font-bold text-gray-400 tracking-widest flex items-center space-x-2">
                                <span>{bk.type}</span>
                                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                <span>SHA-256 Verified</span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-[11px] font-black text-gray-500 tabular-nums uppercase">{bk.date}</td>
                      <td className="px-8 py-5 text-[11px] font-bold text-gray-400 tabular-nums">{bk.size}</td>
                      <td className="px-8 py-5">
                        <div className={cn(
                          "flex items-center space-x-2 px-3 py-1 rounded-full w-fit",
                          bk.status === 'Success' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                        )}>
                          {bk.status === 'Success' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          <span className="text-[10px] font-black uppercase tracking-widest">{bk.status === 'Success' ? (isAm ? 'ተሳክቷል' : 'Success') : (isAm ? 'ተመዝግቧል' : 'Archived')}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button className="p-2 text-gray-400 hover:text-primary transition-colors hover:scale-110">
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-8 border-t bg-gray-50/30 flex justify-center">
                <button className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:underline bg-white px-6 py-2 rounded-full border border-gray-100 shadow-sm">
                    {isAm ? "ሁሉንም የመጠባበቂያ ታሪክ ይመልከቱ" : "Access Full Cloud Repository"}
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
