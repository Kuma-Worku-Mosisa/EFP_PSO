import React, { useState } from 'react';
import { Settings, Shield, Bell, Lock, Globe, Database, Save, User, Mail, ShieldAlert, Key, Fingerprint, Smartphone, Laptop, Trash2, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const AdminSettings = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: "general", label: t.settings.tabs.general, icon: <Settings className="w-4 h-4" /> },
    { id: "security", label: t.settings.tabs.security, icon: <Shield className="w-4 h-4" /> },
    { id: "notifications", label: t.settings.tabs.notifications, icon: <Bell className="w-4 h-4" /> },
    ...(user?.role === 'super_admin' ? [{ id: "database", label: t.settings.tabs.database, icon: <Database className="w-4 h-4" /> }] : []),
  ];

  const handleSave = () => {
    alert(t.settings.alertSuccess);
  };

  const handleRevokeAll = () => {
    if (confirm("Are you sure you want to revoke all managed devices? All administrators will be logged out.")) {
      alert("All devices revoked successfully.");
    }
  };

  const handleResetTokens = () => {
    if (confirm("Resetting all API tokens will break active integrations. Continue?")) {
      alert("API tokens reset.");
    }
  };

  const handleRotateKeys = () => {
    alert("Encryption keys rotation initiated. This process may take a few minutes.");
  };

  const handleWipeLogs = () => {
    if (confirm("This action is permanent and irreversible. Wipe all system audit logs?")) {
      alert("Audit logs wiped.");
    }
  };

  const handleFailover = () => {
    alert("Failover mode activated. System is now running on secondary cluster.");
  };

  const handleMaintenanceOp = (op: string) => {
    alert(`${op} ${t.common.success}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-primary tracking-tighter uppercase">{t.settings.title}</h2>
        <p className="text-sm text-gray-500 font-bold uppercase tracking-widest opacity-60 italic">{t.settings.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 space-y-2">
          {tabs.map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === item.id 
                  ? 'bg-primary text-white shadow-2xl scale-[1.02]' 
                  : 'text-gray-400 hover:bg-gray-100 hover:text-primary'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-10 rounded-[48px] shadow-sm border border-gray-100 space-y-12"
          >
            {activeTab === 'general' && (
              <div className="space-y-10">
                <div className="space-y-6">
                  <h3 className="text-xl font-black text-primary uppercase tracking-tighter border-b pb-4">{t.settings.general.coreId}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">{t.settings.general.branding}</label>
                      <input type="text" defaultValue="FP-PSA Licensing Portal" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-bold text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">{t.settings.general.authority}</label>
                      <input type="email" defaultValue="admin@federalpolice.gov.et" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-bold text-sm" />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-black text-primary uppercase tracking-tighter border-b pb-4">{t.settings.general.automation}</h3>
                  <div className="space-y-4">
                    {[
                      { title: t.settings.general.fayda, desc: t.settings.general.faydaDesc, active: true },
                      { title: t.settings.general.expiry, desc: t.settings.general.expiryDesc, active: true },
                      { title: t.settings.general.audit, desc: t.settings.general.auditDesc, active: false },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-6 bg-gray-50 rounded-[28px] hover:bg-gray-100/50 transition-all cursor-pointer">
                        <div>
                          <p className="font-black text-primary text-sm uppercase tracking-tight">{item.title}</p>
                          <p className="text-xs text-gray-500 font-bold tracking-wide mt-1">{item.desc}</p>
                        </div>
                        <div className={`w-14 h-8 rounded-full relative transition-all shadow-inner ${item.active ? 'bg-primary' : 'bg-gray-300'}`}>
                          <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all ${item.active ? 'right-1' : 'left-1'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-10">
                <div className="space-y-6">
                  <h3 className="text-xl font-black text-primary uppercase tracking-tighter border-b pb-4">{t.settings.security.hardening}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 border-2 border-gray-50 rounded-[32px] space-y-4 hover:border-primary/10 transition-all">
                      <div className="flex items-center space-x-3 text-primary">
                        <Lock className="w-5 h-5" />
                        <span className="font-black text-xs uppercase tracking-widest">{t.settings.security.twoFactor}</span>
                      </div>
                      <select className="w-full p-4 bg-gray-50 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-primary">
                        <option>{t.settings.security.mandatoryAdmin}</option>
                        <option>{t.settings.security.optionalAgency}</option>
                        <option>{t.settings.security.disabled}</option>
                      </select>
                    </div>
                    <div className="p-6 border-2 border-gray-50 rounded-[32px] space-y-4 hover:border-primary/10 transition-all">
                      <div className="flex items-center space-x-3 text-primary">
                        <Smartphone className="w-5 h-5" />
                        <span className="font-black text-xs uppercase tracking-widest">{t.settings.security.deviceTrust}</span>
                      </div>
                      <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                        <span className="text-xs font-bold text-gray-500 italic">{t.settings.security.managedDevices}</span>
                        <button onClick={handleRevokeAll} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">{t.settings.security.revokeAll}</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-black text-primary uppercase tracking-tighter border-b pb-4">{t.settings.security.policy}</h3>
                  <div className="space-y-6">
                    <div className="flex flex-col space-y-2">
                        <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <span>{t.settings.security.entropy}</span>
                            <span className="text-green-600">{t.settings.security.secure}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 w-[85%]" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button onClick={handleResetTokens} className="p-4 border border-primary/20 text-primary rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all">{t.settings.security.resetTokens}</button>
                        <button onClick={handleRotateKeys} className="p-4 border border-gray-100 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all">{t.settings.security.rotateKeys}</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-10">
                <div className="space-y-6 text-center py-10">
                    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <Bell className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black text-primary leading-tight">{t.settings.notifications.orchestrator}</h3>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto font-medium">{t.settings.notifications.desc}</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {[
                        { title: t.settings.notifications.critical, type: t.settings.notifications.pushEmail, status: "Enabled" },
                        { title: t.settings.notifications.agencyReminders, type: t.settings.notifications.sms, status: "Priority" },
                        { title: t.settings.notifications.newApps, type: t.settings.notifications.dashboardOnly, status: "Standard" },
                    ].map((row, i) => (
                        <div key={i} className="flex items-center justify-between p-6 bg-gray-50 rounded-[32px] border border-transparent hover:border-gray-200 transition-all">
                            <div className="flex items-center space-x-6">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                                <div>
                                    <p className="font-black text-primary text-sm uppercase tracking-tight">{row.title}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{row.type}</p>
                                </div>
                            </div>
                            <button onClick={() => alert(`${t.settings.notifications.configure} ${row.title}...`)} className="text-xs font-black text-primary hover:underline italic">{t.settings.notifications.configure}</button>
                        </div>
                    ))}
                </div>
              </div>
            )}

            {activeTab === 'database' && (
              <div className="space-y-10">
                <div className="p-8 bg-blue-600 rounded-[40px] text-white space-y-4 shadow-2xl relative overflow-hidden">
                    <Database className="absolute -bottom-10 -right-10 w-48 h-48 opacity-10" />
                    <div className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest opacity-70">
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                        <span>{t.settings.database.cluster}</span>
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter">{t.settings.database.integrity}</h3>
                    <div className="grid grid-cols-3 gap-8 pt-4">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{t.settings.database.totalDocs}</p>
                            <p className="text-2xl font-black tracking-tight">1.2M+</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{t.settings.database.latency}</p>
                            <p className="text-2xl font-black tracking-tight">42ms</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{t.settings.database.sync}</p>
                            <p className="text-2xl font-black tracking-tight">99.9%</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-xl font-black text-primary uppercase tracking-tighter border-b pb-4">{t.settings.database.maintenance}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button onClick={() => handleMaintenanceOp(t.settings.database.fullBackup)} className="p-6 bg-gray-50 rounded-[32px] text-left space-y-2 group hover:bg-primary transition-all">
                            <RotateCcw className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
                            <p className="font-black text-primary group-hover:text-white uppercase text-xs tracking-widest">{t.settings.database.fullBackup}</p>
                            <p className="text-[10px] text-gray-400 group-hover:text-white/70 italic">{t.settings.database.backupDesc}</p>
                        </button>
                        <button onClick={() => handleMaintenanceOp(t.settings.database.scan)} className="p-6 bg-gray-50 rounded-[32px] text-left space-y-2 group hover:bg-primary transition-all">
                            <ShieldAlert className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
                            <p className="font-black text-primary group-hover:text-white uppercase text-xs tracking-widest">{t.settings.database.scan}</p>
                            <p className="text-[10px] text-gray-400 group-hover:text-white/70 italic">{t.settings.database.scanDesc}</p>
                        </button>
                    </div>
                </div>
              </div>
            )}

            <div className="pt-8 flex justify-end">
              <button 
                onClick={handleSave}
                className="blue-gradient text-white px-12 py-5 rounded-[24px] font-black uppercase tracking-widest shadow-2xl hover:scale-[1.05] active:scale-95 transition-all flex items-center space-x-3"
              >
                <Save className="w-6 h-6" />
                <span>{t.settings.save}</span>
              </button>
            </div>
          </motion.div>

          {user?.role === 'super_admin' && (
            <div className="mt-8 bg-black p-10 rounded-[48px] space-y-6 border border-white/10 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-3xl rounded-full" />
              <div className="space-y-1">
                  <h3 className="text-2xl font-black text-red-500 uppercase tracking-tighter">{t.settings.redZone.title}</h3>
                  <p className="text-xs text-white/40 font-bold uppercase tracking-widest">{t.settings.redZone.subtitle}</p>
              </div>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <button onClick={handleWipeLogs} className="px-8 py-4 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                  {t.settings.redZone.wipeLogs}
                </button>
                <button onClick={handleFailover} className="px-8 py-4 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 shadow-xl transition-all">
                  {t.settings.redZone.failover}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
