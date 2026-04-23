import React, { useState } from 'react';
import { User, Mail, Shield, Briefcase, MapPin, Camera, Save, Fingerprint } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const Profile = () => {
  const { user, updateAvatar } = useAuth();
  const { language } = useLanguage();
  const isAm = language === 'am';

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.role === 'agency' ? '+251 911 223344' : '+251 988 776655',
    location: user?.role === 'agency' ? 'Addis Ababa, Bole Subcity' : 'Federal Police HQ, Addis Ababa',
    bio: user?.role === 'agency' ? 'Authorized manager for Abyssinia Security Services. Managing over 500 security personnel.' : 'Verified administrator for the Federal Police PSA licensing commission.'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      <div className="relative h-72 bg-primary rounded-[50px]">
        <div className="absolute inset-0 opacity-10 overflow-hidden rounded-[50px]">
          <Shield className="w-[500px] h-[500px] absolute -right-20 -top-20 animate-pulse" />
        </div>
        <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="relative group">
            <div className="w-80 h-80 bg-white rounded-full p-3 shadow-2xl ring-[16px] ring-white/40 group-hover:ring-white/60 transition-all duration-500">
              <div className="w-full h-full bg-gray-50 rounded-full flex items-center justify-center text-8xl font-black text-primary border-8 border-secondary overflow-hidden shadow-inner ring-4 ring-primary/5">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="flex flex-col items-center animate-in fade-in zoom-in duration-700">
                    <span className="leading-none text-9xl">{user?.initials}</span>
                    <span className="text-[10px] font-black text-gray-400 mt-6 uppercase tracking-[0.4em] opacity-60">Verified Admin</span>
                  </div>
                )}
              </div>
            </div>
            <label className="absolute bottom-4 right-4 p-6 bg-secondary text-primary rounded-full shadow-2xl hover:scale-110 hover:rotate-12 transition-all cursor-pointer border-[8px] border-white group-hover:shadow-secondary/50">
              <Camera className="w-12 h-12 group-hover:scale-110 transition-transform" />
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>
          </div>
        </div>
      </div>

      <div className="pt-48 text-center space-y-2">
        <h2 className="text-4xl font-black text-primary tracking-tight uppercase">{formData.name}</h2>
        <div className="flex items-center justify-center space-x-3">
          <span className="h-[2px] w-8 bg-secondary rounded-full" />
          <p className="text-gray-500 font-black uppercase text-xs tracking-widest flex items-center">
            <Briefcase className="w-4 h-4 mr-2 text-secondary" />
            {user?.role === 'agency' ? (isAm ? 'የኤጀንሲ ስራ አስኪያጅ' : 'Agency Manager') : (isAm ? 'ፖሊስ አስተዳዳሪ' : 'Police Admin')}
          </p>
          <span className="h-[2px] w-8 bg-secondary rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-8">
            <h3 className="text-lg font-bold text-primary border-b pb-4">
              {isAm ? 'የግል መረጃ' : 'Personal Information'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{isAm ? 'ሙሉ ስም' : 'Full Name'}</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{isAm ? 'ኢሜል' : 'Email Address'}</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{isAm ? 'ስልክ ቁጥር' : 'Phone Number'}</label>
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{isAm ? 'አድራሻ' : 'Location'}</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium" 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{isAm ? 'ስለ እኔ' : 'About Me / Professional Bio'}</label>
              <textarea 
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium resize-none"
              />
            </div>

            <div className="pt-4 flex justify-between items-center">
              <div>
                {saveSuccess && (
                  <motion.p 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-green-600 font-bold text-sm"
                  >
                    ✓ {isAm ? 'በተሳካ ሁኔታ ተቀምጧል' : 'Profile updated successfully'}
                  </motion.p>
                )}
              </div>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="blue-gradient text-white px-10 py-4 rounded-2xl font-bold shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center space-x-3 disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>{isAm ? 'አዘምን' : 'Update Profile'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-6">
            <h3 className="text-lg font-bold text-primary">{isAm ? 'የደህንነት ሁኔታ' : 'Security Status'}</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-2xl border border-green-100">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Fingerprint className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-green-900">{isAm ? 'ፋይዳ ተረጋግጧል' : 'Fayda ID Verified'}</p>
                  <p className="text-[10px] text-green-700">ET-092-2234-5561</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-primary text-white rounded-2xl shadow-xl">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Shield className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-xs font-bold">{isAm ? 'የመለያ ደረጃ' : 'Account Level'}</p>
                  <p className="text-[10px] opacity-80 uppercase tracking-widest">{user?.role === 'super_admin' ? 'Root Administrator' : 'Authorized Personnel'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
