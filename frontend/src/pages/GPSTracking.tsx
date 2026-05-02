import React from 'react';
import { MapPin, Search, Filter, Shield, Info, Navigation, User, Building2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

export const GPSTracking = () => {
  const { language } = useLanguage();
  const isAm = language === 'am';
  const [selectedAgency, setSelectedAgency] = React.useState<any>(null);
  const [trackingType, setTrackingType] = React.useState<'bureau' | 'manager'>('bureau');

  const t = {
    title: isAm ? "የጂፒኤስ ክትትል" : "GPS Tracking",
    bureaus: isAm ? "የኤጀንሲ ቢሮዎች" : "Agency Bureaus",
    managers: isAm ? "ሥራ አስኪያጆች" : "Agency Managers",
    search: isAm ? "ኤጀንሲ ይፈልጉ..." : "Search agency...",
    active: isAm ? "ንቁ" : "Active",
    inactive: isAm ? "ቦዝኗል" : "Inactive",
    manager: isAm ? "ሥራ አስኪያጅ" : "Manager",
    staff: isAm ? "የሰራተኞች ብዛት" : "Staff Count",
    status: isAm ? "ሁኔታ" : "Status",
    viewProfile: isAm ? "መገለጫውን ተመልከት" : "View Profile",
    location: isAm ? "ቦታ" : "Location"
  };

  const agencies = [
    { 
      id: 1, 
      name: "Abyssinia Security", 
      lat: 40, 
      lng: 30, 
      status: "Active", 
      staff: 124, 
      manager: "Abenezer Kassa",
      managerLat: 42,
      managerLng: 32,
      lastSeen: "2 mins ago"
    },
    { 
      id: 2, 
      name: "Lion Guard Services", 
      lat: 60, 
      lng: 70, 
      status: "Active", 
      staff: 85, 
      manager: "Tewodros M.",
      managerLat: 58,
      managerLng: 72,
      lastSeen: "5 mins ago"
    },
    { 
      id: 3, 
      name: "Nile Protection", 
      lat: 20, 
      lng: 80, 
      status: "Inactive", 
      staff: 42, 
      manager: "Selamawit G.",
      managerLat: 22,
      managerLng: 78,
      lastSeen: "1 hour ago"
    },
    { 
      id: 4, 
      name: "Eagle Eye Security", 
      lat: 80, 
      lng: 20, 
      status: "Active", 
      staff: 210, 
      manager: "Dawit H.",
      managerLat: 78,
      managerLng: 22,
      lastSeen: "Just now"
    },
  ];

  return (
    <div className="h-[calc(100vh-160px)] flex gap-8">
      {/* Sidebar List */}
      <div className="w-96 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div className="p-6 border-b space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-primary">{t.title}</h3>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button 
                onClick={() => setTrackingType('bureau')}
                className={`p-2 rounded-lg transition-all ${trackingType === 'bureau' ? 'bg-white shadow-sm text-primary' : 'text-gray-400'}`}
                title={t.bureaus}
              >
                <Building2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setTrackingType('manager')}
                className={`p-2 rounded-lg transition-all ${trackingType === 'manager' ? 'bg-white shadow-sm text-primary' : 'text-gray-400'}`}
                title={t.managers}
              >
                <User className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={t.search} 
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary" 
            />
          </div>
        </div>
        <div className="flex-grow overflow-y-auto p-4 space-y-3">
          {agencies.map((agency) => (
            <button
              key={agency.id}
              onClick={() => setSelectedAgency(agency)}
              className={`w-full text-left p-4 rounded-2xl transition-all border ${
                selectedAgency?.id === agency.id ? 'bg-primary text-white border-primary shadow-lg' : 'bg-gray-50 border-transparent hover:bg-gray-100'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <p className="font-bold text-sm">{agency.name}</p>
                <div className={`w-2 h-2 rounded-full ${agency.status === 'Active' ? 'bg-green-400' : 'bg-red-400'}`} />
              </div>
              <div className="flex items-center space-x-2 text-xs opacity-70">
                {trackingType === 'bureau' ? <MapPin className="w-3 h-3" /> : <User className="w-3 h-3" />}
                <span>{trackingType === 'bureau' ? "Addis Ababa, Bole Subcity" : agency.manager}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-grow bg-gray-900 rounded-[40px] relative overflow-hidden shadow-2xl border-8 border-white">
        {/* Mock Map Background */}
        <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/38.7578,8.9806,12,0/800x600?access_token=mock')] bg-cover opacity-40" />
        
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,20 Q20,10 40,30 T80,20 T100,40" fill="none" stroke="#4a5568" strokeWidth="0.5" />
          <path d="M10,0 Q30,40 20,60 T40,100" fill="none" stroke="#4a5568" strokeWidth="0.5" />
          <path d="M0,80 Q50,70 100,90" fill="none" stroke="#4a5568" strokeWidth="0.5" />
        </svg>

        {/* Markers */}
        {agencies.map((agency) => (
          <motion.button
            key={agency.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.2 }}
            onClick={() => setSelectedAgency(agency)}
            className="absolute z-10"
            style={{ 
              top: `${trackingType === 'bureau' ? agency.lat : agency.managerLat}%`, 
              left: `${trackingType === 'bureau' ? agency.lng : agency.managerLng}%` 
            }}
          >
            <div className="relative">
              <div className={`absolute -inset-4 rounded-full blur-xl opacity-50 ${agency.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`} />
              <div className={`w-8 h-8 rounded-full border-4 border-white shadow-lg flex items-center justify-center ${agency.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}>
                {trackingType === 'bureau' ? <Building2 className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
              </div>
              {selectedAgency?.id === agency.id && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white px-3 py-1 rounded-full shadow-xl whitespace-nowrap">
                  <span className="text-[10px] font-bold text-primary">{trackingType === 'bureau' ? agency.name : agency.manager}</span>
                </div>
              )}
            </div>
          </motion.button>
        ))}

        {/* Info Overlay */}
        {selectedAgency && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white/20 flex items-center justify-between"
          >
            <div className="flex items-center space-x-6">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white ${selectedAgency.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}>
                {trackingType === 'bureau' ? <Building2 className="w-8 h-8" /> : <User className="w-8 h-8" />}
              </div>
              <div>
                <h4 className="text-xl font-bold text-primary">{selectedAgency.name}</h4>
                <p className="text-sm text-gray-500">{t.manager}: {selectedAgency.manager}</p>
                {trackingType === 'manager' && <p className="text-[10px] text-primary font-bold uppercase mt-1">Last Seen: {selectedAgency.lastSeen}</p>}
              </div>
              <div className="h-12 w-px bg-gray-200 mx-4" />
              <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                <p className="text-xs text-gray-400">{t.staff}</p>
                <p className="text-xs text-gray-400">{t.status}</p>
                <p className="text-sm font-bold text-primary">{selectedAgency.staff} Personnel</p>
                <p className="text-sm font-bold text-green-600">{selectedAgency.status === 'Active' ? t.active : t.inactive}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="p-3 bg-gray-100 rounded-xl text-gray-600 hover:bg-gray-200 transition-all">
                <Navigation className="w-5 h-5" />
              </button>
              <button className="p-3 bg-primary text-white rounded-xl font-bold px-6 hover:bg-primary/90 transition-all">
                {t.viewProfile}
              </button>
            </div>
          </motion.div>
        )}

        {/* Map Controls */}
        <div className="absolute top-8 right-8 flex flex-col space-y-2">
          <button className="p-3 bg-white rounded-xl shadow-lg text-gray-600 hover:bg-gray-50 font-bold">+</button>
          <button className="p-3 bg-white rounded-xl shadow-lg text-gray-600 hover:bg-gray-50 font-bold">-</button>
          <button className="p-3 bg-white rounded-xl shadow-lg text-gray-600 hover:bg-gray-50">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
