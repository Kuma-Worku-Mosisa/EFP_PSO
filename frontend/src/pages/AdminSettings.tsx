import React, { useState } from 'react';
import { Settings, Shield, Bell, Lock, Globe, Database, Save, User, Mail, ShieldAlert, Key, Fingerprint, Smartphone, Laptop, Trash2, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: "general", label: "General", icon: <Settings className="w-4 h-4" /> },
    { id: "security", label: "Security", icon: <Shield className="w-4 h-4" /> },
    { id: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
    { id: "database", label: "Database", icon: <Database className="w-4 h-4" /> },
  ];

  const handleSave = () => {
    alert("Settings updated successfully! Changes are now live across the system.");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-primary tracking-tighter uppercase">System Ecosystem Controls</h2>
        <p className="text-sm text-gray-500 font-bold uppercase tracking-widest opacity-60 italic">Global configuration and underlying security orchestration</p>
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
                  <h3 className="text-xl font-black text-primary uppercase tracking-tighter border-b pb-4">Core Identification</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Platform Branding</label>
                      <input type="text" defaultValue="FP-PSA Licensing Portal" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-bold text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Contact Authority</label>
                      <input type="email" defaultValue="admin@federalpolice.gov.et" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-bold text-sm" />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-black text-primary uppercase tracking-tighter border-b pb-4">Licensing Automation</h3>
                  <div className="space-y-4">
                    {[
                      { title: "Fayda ID Enforcement", desc: "Require national ID for all individual background checks.", active: true },
                      { title: "Intelligent Expiry Alerts", desc: "Automated SMS orchestration 30 days prior to license burnout.", active: true },
                      { title: "Audit Log Retention", desc: "Maintain immutable logs for 5 years per federal regulation.", active: false },
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
                  <h3 className="text-xl font-black text-primary uppercase tracking-tighter border-b pb-4">Hardening & Access</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 border-2 border-gray-50 rounded-[32px] space-y-4 hover:border-primary/10 transition-all">
                      <div className="flex items-center space-x-3 text-primary">
                        <Lock className="w-5 h-5" />
                        <span className="font-black text-xs uppercase tracking-widest">Two-Factor Strategy</span>
                      </div>
                      <select className="w-full p-4 bg-gray-50 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-primary">
                        <option>Mandatory for all Admins</option>
                        <option>Optional for Agencies</option>
                        <option>Disabled</option>
                      </select>
                    </div>
                    <div className="p-6 border-2 border-gray-50 rounded-[32px] space-y-4 hover:border-primary/10 transition-all">
                      <div className="flex items-center space-x-3 text-primary">
                        <Smartphone className="w-5 h-5" />
                        <span className="font-black text-xs uppercase tracking-widest">Device Trust Pool</span>
                      </div>
                      <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                        <span className="text-xs font-bold text-gray-500 italic">4 Managed Devices</span>
                        <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Revoke All</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-black text-primary uppercase tracking-tighter border-b pb-4">Credential Policy</h3>
                  <div className="space-y-6">
                    <div className="flex flex-col space-y-2">
                        <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <span>Password Entropy</span>
                            <span className="text-green-600">Secure (128-bit)</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 w-[85%]" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button className="p-4 border border-primary/20 text-primary rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all">Reset All API Tokens</button>
                        <button className="p-4 border border-gray-100 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all">Rotate Encryption Keys</button>
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
                    <h3 className="text-2xl font-black text-primary leading-tight">Notification Orchestrator</h3>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto font-medium">Control how the system communicates with agencies, applicants, and regional blocks.</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {[
                        { title: "Critical System Alerts", type: "Push, Email", status: "Enabled" },
                        { title: "Agency License Reminders", type: "SMS", status: "Priority" },
                        { title: "New Application Requests", type: "Dashboard Only", status: "Standard" },
                    ].map((row, i) => (
                        <div key={i} className="flex items-center justify-between p-6 bg-gray-50 rounded-[32px] border border-transparent hover:border-gray-200 transition-all">
                            <div className="flex items-center space-x-6">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                                <div>
                                    <p className="font-black text-primary text-sm uppercase tracking-tight">{row.title}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{row.type}</p>
                                </div>
                            </div>
                            <button className="text-xs font-black text-primary hover:underline italic">Configure</button>
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
                        <span>Cloud Firestore Cluster • High Availability</span>
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter">Database Integrity</h3>
                    <div className="grid grid-cols-3 gap-8 pt-4">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Documents</p>
                            <p className="text-2xl font-black tracking-tight">1.2M+</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Avg. Latency</p>
                            <p className="text-2xl font-black tracking-tight">42ms</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Sync Status</p>
                            <p className="text-2xl font-black tracking-tight">99.9%</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-xl font-black text-primary uppercase tracking-tighter border-b pb-4">Maintenance Operations</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button className="p-6 bg-gray-50 rounded-[32px] text-left space-y-2 group hover:bg-primary transition-all">
                            <RotateCcw className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
                            <p className="font-black text-primary group-hover:text-white uppercase text-xs tracking-widest">Full DB Backup</p>
                            <p className="text-[10px] text-gray-400 group-hover:text-white/70 italic">Schedule a complete snapshot of all datasets.</p>
                        </button>
                        <button className="p-6 bg-gray-50 rounded-[32px] text-left space-y-2 group hover:bg-primary transition-all">
                            <ShieldAlert className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
                            <p className="font-black text-primary group-hover:text-white uppercase text-xs tracking-widest">Inconsistency Scan</p>
                            <p className="text-[10px] text-gray-400 group-hover:text-white/70 italic">Identify orphaned records and link decay.</p>
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
                <span>Save Parameters</span>
              </button>
            </div>
          </motion.div>

          <div className="mt-8 bg-black p-10 rounded-[48px] space-y-6 border border-white/10 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-3xl rounded-full" />
            <div className="space-y-1">
                <h3 className="text-2xl font-black text-red-500 uppercase tracking-tighter">System Red Zone</h3>
                <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Destructive operations requiring secondary auth clearance</p>
            </div>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <button className="px-8 py-4 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                Wipe Audit Logs
              </button>
              <button className="px-8 py-4 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 shadow-xl transition-all">
                Initiate Failover Mode
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
