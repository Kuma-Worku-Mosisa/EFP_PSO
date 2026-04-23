import React, { useState } from 'react';
import { Search, Filter, FileText, Send, Edit, CheckCircle, Clock, XCircle, Shield, RotateCw, AlertTriangle, Eye, X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

export const LicenseManagement = () => {
  const { language } = useLanguage();
  const isAm = language === 'am';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLic, setSelectedLic] = useState<any>(null);
  const [actionType, setActionType] = useState<'none' | 'renew' | 'revoke' | 'view'>('none');

  const t = {
    title: isAm ? "የፈቃድ አስተዳደር" : "License Management",
    search: isAm ? "ኤጀንሲ ይፈልጉ..." : "Search agency...",
    filter: isAm ? "አጣራ" : "Filter",
    table: {
      agency: isAm ? "የኤጀንሲ ስም" : "Agency Name",
      licenseNo: isAm ? "የፈቃድ ቁጥር" : "License No",
      status: isAm ? "ሁኔታ" : "Status",
      issued: isAm ? "የተሰጠበት" : "Issued Date",
      expiry: isAm ? "የሚያበቃበት" : "Expiry Date",
      actions: isAm ? "እርምጃዎች" : "Actions"
    },
    status: {
      active: isAm ? "ንቁ" : "Active",
      expired: isAm ? "ጊዜው ያለፈበት" : "Expired",
      pending: isAm ? "በመጠባበቅ ላይ" : "Pending Approval",
      suspended: isAm ? "የታገደ" : "Suspended"
    },
    actions: {
      edit: isAm ? "አስተካክል" : "Edit License",
      send: isAm ? "ላክ" : "Send to Agency",
      view: isAm ? "ተመልከት" : "View Details",
      renew: isAm ? "እድሳት" : "Renew",
      revoke: isAm ? "ሰርዝ" : "Revoke"
    }
  };

  const licenses = [
    { id: 1, agency: "Abyssinia Security", licenseNo: "FP-PSA-2025-0892", status: "Active", issued: "2025-09-22", expiry: "2026-09-21", type: "Grade A", personnel: 450, region: "Addis Ababa" },
    { id: 2, agency: "Lion Guard Services", licenseNo: "FP-PSA-2024-1102", status: "Active", issued: "2024-11-15", expiry: "2025-11-14", type: "Grade B", personnel: 280, region: "Oromia" },
    { id: 3, agency: "Nile Protection", licenseNo: "PENDING", status: "Pending Approval", issued: "-", expiry: "-", type: "Grade C", personnel: 120, region: "Amhara" },
    { id: 4, agency: "Eagle Eye Security", licenseNo: "FP-PSA-2023-0541", status: "Expired", issued: "2023-05-10", expiry: "2024-05-09", type: "Grade A", personnel: 600, region: "Oromia" },
  ];

  const filteredLicenses = licenses.filter(lic => 
    lic.agency.toLowerCase().includes(searchQuery.toLowerCase()) || 
    lic.licenseNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <h3 className="text-2xl font-bold text-primary">{t.title}</h3>
        <div className="flex flex-wrap gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={t.search} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary w-64 shadow-sm" 
            />
          </div>
          <button className="flex items-center space-x-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 shadow-sm transition-all">
            <Filter className="w-4 h-4" />
            <span>{t.filter}</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="px-8 py-6">{t.table.agency}</th>
                <th className="px-8 py-6">{t.table.licenseNo}</th>
                <th className="px-8 py-6">{t.table.status}</th>
                <th className="px-8 py-6">{t.table.issued}</th>
                <th className="px-8 py-6">{t.table.expiry}</th>
                <th className="px-8 py-6 text-right">{t.table.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLicenses.map((lic) => (
                <tr key={lic.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <Shield className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-primary text-sm">{lic.agency}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-gray-400 font-mono font-bold tracking-tight">{lic.licenseNo}</td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      lic.status === 'Active' ? 'bg-green-100 text-green-700' : 
                      lic.status === 'Pending Approval' ? 'bg-amber-100 text-amber-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {lic.status === 'Active' ? t.status.active : 
                       lic.status === 'Pending Approval' ? t.status.pending : 
                       lic.status === 'Expired' ? t.status.expired : lic.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm text-gray-500 font-medium">{lic.issued}</td>
                  <td className="px-8 py-6 text-sm text-gray-500 font-medium">{lic.expiry}</td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end space-x-1">
                      <button 
                        onClick={() => { setSelectedLic(lic); setActionType('view'); }}
                        className="p-2.5 text-gray-400 hover:bg-primary/5 hover:text-primary rounded-xl transition-all" 
                        title={t.actions.view}
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => { setSelectedLic(lic); setActionType('renew'); }}
                        className="p-2.5 text-gray-400 hover:bg-green-50 hover:text-green-600 rounded-xl transition-all" 
                        title={t.actions.renew}
                      >
                        <RotateCw className="w-5 h-5" />
                      </button>
                      <button 
                         onClick={() => { setSelectedLic(lic); setActionType('revoke'); }}
                        className="p-2.5 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all" 
                        title={t.actions.revoke}
                      >
                        <AlertTriangle className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modals */}
      <AnimatePresence>
        {selectedLic && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl p-10 space-y-8"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className={`p-4 rounded-2xl ${
                    actionType === 'view' ? 'bg-blue-50 text-blue-600' : 
                    actionType === 'renew' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {actionType === 'view' ? <Eye className="w-6 h-6" /> : 
                     actionType === 'renew' ? <RotateCw className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-primary uppercase tracking-tighter">
                      {actionType === 'view' ? 'License Details' : 
                       actionType === 'renew' ? 'Renew License' : 'Revoke License'}
                    </h4>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{selectedLic.agency}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedLic(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {actionType === 'view' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-[32px]">
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1">License No</p>
                      <p className="text-sm font-black text-primary font-mono">{selectedLic.licenseNo}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1">Category</p>
                      <p className="text-sm font-black text-primary">{selectedLic.type}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1">Staff Count</p>
                      <p className="text-sm font-black text-primary">{selectedLic.personnel} Active</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1">Region</p>
                      <p className="text-sm font-black text-primary">{selectedLic.region}</p>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button className="flex-1 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center space-x-2">
                      <Download className="w-5 h-5" />
                      <span>Download PDF</span>
                    </button>
                    <button className="flex-1 py-4 bg-gray-100 text-primary rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all">
                      Print Certificate
                    </button>
                  </div>
                </div>
              )}

              {actionType === 'renew' && (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-100 p-6 rounded-3xl space-y-2">
                    <p className="text-sm font-bold text-green-800">Renewal Policy Confirmation</p>
                    <p className="text-xs text-green-700">By renewing, you extend the license validity for another 12 months. Ensure all background checks are current.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-2">Renewal Notes</label>
                    <textarea rows={4} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 font-medium text-sm" placeholder="Enter reason for renewal..." />
                  </div>
                  <button 
                    onClick={() => { alert(`License for ${selectedLic.agency} renewed!`); setSelectedLic(null); }}
                    className="w-full py-4 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-green-700 transition-all"
                  >
                    Confirm Renewal
                  </button>
                </div>
              )}

              {actionType === 'revoke' && (
                <div className="space-y-6">
                  <div className="bg-red-50 border border-red-100 p-6 rounded-3xl space-y-2">
                    <p className="text-sm font-bold text-red-800 tracking-tight">Revocation Warning!</p>
                    <p className="text-xs text-red-700">This action will immediately disable the agency's operational portal and invalidate their physical licenses.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-2">Revocation Reason</label>
                    <textarea rows={4} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 font-medium text-sm" placeholder="Detailed reason for revocation..." />
                  </div>
                  <button 
                    onClick={() => { alert(`License for ${selectedLic.agency} REVOKED!`); setSelectedLic(null); }}
                    className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-red-700 transition-all"
                  >
                    Revoke License Permanently
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
