import React, { useEffect } from 'react';
import { MapPin, Search, Filter, Shield, Info, Navigation, User, Building2, Layers, Crosshair } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';

// Fix for default Leaflet icons in Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Marker Creator
const createCustomIcon = (color: string, isBureau: boolean) => {
  const bgClass = color === 'green' ? 'bg-green-500' : color === 'amber' ? 'bg-amber-500' : 'bg-red-500';
  const iconHtml = `<div class="relative flex items-center justify-center">
    <div class="absolute w-10 h-10 rounded-full blur-md opacity-30 ${bgClass}"></div>
    <div class="w-8 h-8 rounded-xl border-2 border-white shadow-lg flex items-center justify-center text-white ${bgClass} transition-transform hover:scale-110">
      ${isBureau ? '🏢' : '👤'}
    </div>
  </div>`;
  
  return L.divIcon({
    html: iconHtml,
    className: 'custom-div-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  });
};

const ChangeView = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, {
      animate: true,
      duration: 1
    });
  }, [center, zoom, map]);
  return null;
};

export const GPSTracking = () => {
  const { language } = useLanguage();
  const isAm = language === 'am';
  const [selectedAgency, setSelectedAgency] = React.useState<any>(null);
  const [trackingType, setTrackingType] = React.useState<'bureau' | 'manager'>('bureau');
  const [statusFilter, setStatusFilter] = React.useState<string>('All');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [mapCenter, setMapCenter] = React.useState<[number, number]>([9.0192, 38.7525]); // Addis Ababa Center
  const [zoomLevel, setZoomLevel] = React.useState(13);
  const [liveAgencies, setLiveAgencies] = React.useState<any[]>([]);
  const [trails, setTrails] = React.useState<Record<number, [number, number][]>>({});
  const [userLocation, setUserLocation] = React.useState<[number, number] | null>(null);

  const [showSatellite, setShowSatellite] = React.useState(false);

  const t = {
    title: isAm ? "የጂፒኤስ ክትትል" : "GPS Tracking Portal",
    bureaus: isAm ? "የኤጀንሲ ቢሮዎች" : "Agency Bureaus",
    managers: isAm ? "ሥራ አስኪያጆች" : "Agency Managers",
    search: isAm ? "ኤጀንሲ ይፈልጉ..." : "Search live database...",
    active: isAm ? "ንቁ" : "Active",
    inactive: isAm ? "ቦዝኗል" : "Inactive",
    suspended: isAm ? "የታገደ" : "Suspended",
    manager: isAm ? "ሥራ አስኪያጅ" : "Manager Account",
    staff: isAm ? "የሰራተኞች ብዛት" : "Personnel Pool",
    status: isAm ? "ሁኔታ" : "Operational Status",
    viewProfile: isAm ? "ለይተህ ተመልከት" : "Focus Location",
    location: isAm ? "ቦታ" : "Coordinates",
    satellite: isAm ? "ሳተላይት" : "Satellite View",
    standard: isAm ? "መደበኛ" : "Standard View"
  };

  const getTranslatedName = (name: string) => {
    if (!isAm) return name;
    const translations: Record<string, string> = {
      "Abyssinia Security HQ": "አቢሲኒያ የደህንነት ዋና መስሪያ ቤት",
      "Lion Guard Base": "አንበሳ ጥበቃ ማዕከል",
      "Nile Protection Center": "አባይ ጥበቃ ማዕከል",
      "Eagle Eye Security Unit": "ንስር የደህንነት ክፍል",
      "Vulcan Security Group": "ቩልካን ደህንነት ግሩፕ",
      "Atlas Guardian": "አትላስ ጠባቂ"
    };
    return translations[name] || name;
  };

  const getTranslatedManager = (name: string) => {
    if (!isAm) return name;
    const translations: Record<string, string> = {
      "Abenezer Kassa": "አቤኔዘር ካሳ",
      "Tewodros M.": "ቴዎድሮስ መ.",
      "Selamawit G.": "ሰላማዊት ገ.",
      "Dawit H.": "ዳዊት ኃ.",
      "Kassahun T.": "ካሳሁን ተ.",
      "Birtukan A.": "ብርቱካን አ."
    };
    return translations[name] || name;
  };

  // Initialize and simulate live movement
  React.useEffect(() => {
    const initialAgencies = [
      { 
        id: 1, 
        name: "Abyssinia Security HQ", 
        lat: 9.0238, 
        lng: 38.7508, 
        status: "Active", 
        staff: 124, 
        manager: "Abenezer Kassa",
        managerLat: 9.032,
        managerLng: 38.745,
        lastSeen: "Just now"
      },
      { 
        id: 2, 
        name: "Lion Guard Base", 
        lat: 8.9948, 
        lng: 38.7636, 
        status: "Active", 
        staff: 85, 
        manager: "Tewodros M.",
        managerLat: 9.015,
        managerLng: 38.775,
        lastSeen: "Just now"
      },
      { 
        id: 3, 
        name: "Nile Protection Center", 
        lat: 9.0112, 
        lng: 38.7328, 
        status: "Inactive", 
        staff: 42, 
        manager: "Selamawit G.",
        managerLat: 8.99,
        managerLng: 38.75,
        lastSeen: "1 hour ago"
      },
      { 
        id: 4, 
        name: "Eagle Eye Security Unit", 
        lat: 9.0482, 
        lng: 38.7915, 
        status: "Active", 
        staff: 210, 
        manager: "Dawit H.",
        managerLat: 9.025,
        managerLng: 38.72,
        lastSeen: "Just now"
      },
      { 
        id: 5, 
        name: "Vulcan Security Group", 
        lat: 9.0050, 
        lng: 38.7800, 
        status: "Suspended", 
        staff: 156, 
        manager: "Kassahun T.",
        managerLat: 9.0050,
        managerLng: 38.7800,
        lastSeen: "Disconnected"
      },
      { 
        id: 6, 
        name: "Atlas Guardian", 
        lat: 9.0300, 
        lng: 38.7200, 
        status: "Active", 
        staff: 98, 
        manager: "Birtukan A.",
        managerLat: 9.0350,
        managerLng: 38.7250,
        lastSeen: "Just now"
      },
    ];
    setLiveAgencies(initialAgencies);
    
    // Initialize trails
    const initialTrails: Record<number, [number, number][]> = {};
    initialAgencies.forEach(a => {
      initialTrails[a.id] = [[a.managerLat, a.managerLng]];
    });
    setTrails(initialTrails);

    // Get real user location if permitted
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => console.log("Geolocation error:", err)
      );
    }

    // Simulate movement for managers
    const interval = setInterval(() => {
      setLiveAgencies(prev => prev.map(a => {
        if (a.status === 'Active') {
          const newLat = a.managerLat + (Math.random() - 0.5) * 0.0005;
          const newLng = a.managerLng + (Math.random() - 0.5) * 0.0005;
          
          setTrails(tPrev => ({
            ...tPrev,
            [a.id]: [...(tPrev[a.id] || []).slice(-20), [newLat, newLng] as [number, number]]
          }));

          return {
            ...a,
            managerLat: newLat,
            managerLng: newLng,
            lastSeen: "Just now"
          };
        }
        return a;
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleFocus = (agency: any) => {
    setSelectedAgency(agency);
    const coords: [number, number] = trackingType === 'bureau' ? [agency.lat, agency.lng] : [agency.managerLat, agency.managerLng];
    setMapCenter(coords);
  };

  const filteredAgencies = liveAgencies.filter(agency => {
    const statusMatch = statusFilter === 'All' || agency.status === statusFilter;
    const searchMatch = agency.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      agency.manager.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  // Re-center if tracking type changes while focused, or if the selected agency moves
  useEffect(() => {
    if (selectedAgency) {
      const currentAgency = liveAgencies.find(a => a.id === selectedAgency.id);
      if (currentAgency) {
        const coords: [number, number] = trackingType === 'bureau' ? [currentAgency.lat, currentAgency.lng] : [currentAgency.managerLat, currentAgency.managerLng];
        setMapCenter(coords);
      }
    }
  }, [trackingType, liveAgencies, selectedAgency?.id]);

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  return (
    <div className="h-[calc(100vh-160px)] flex gap-8">
      {/* Sidebar List */}
      <div className="w-96 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div className="p-6 border-b space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-primary tracking-tight uppercase">{t.title}</h3>
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
          <div className="flex flex-col space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.search} 
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium" 
              />
            </div>
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-hide">
              {['All', 'Active', 'Inactive', 'Suspended'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                    statusFilter === status 
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                    : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                  }`}
                >
                  {status === 'All' ? (isAm ? 'ሁሉም' : 'All') : (status === 'Active' ? t.active : status === 'Inactive' ? t.inactive : t.suspended)}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-gray-50/30">
          {filteredAgencies.map((agency) => (
            <button
              key={agency.id}
              onClick={() => handleFocus(agency)}
              className={`w-full text-left p-5 rounded-[28px] transition-all border-2 relative overflow-hidden group ${
                selectedAgency?.id === agency.id 
                ? 'bg-primary text-white border-primary shadow-2xl shadow-primary/20 -translate-y-1' 
                : 'bg-white border-transparent hover:border-gray-100 shadow-sm'
              }`}
            >
              {selectedAgency?.id === agency.id && (
                <div className="absolute top-0 right-0 p-4 opacity-20">
                  <Shield className="w-12 h-12" />
                </div>
              )}
              <div className="flex justify-between items-start mb-3">
                <p className={`font-black text-sm uppercase tracking-tight ${selectedAgency?.id === agency.id ? 'text-white' : 'text-primary'}`}>{getTranslatedName(agency.name)}</p>
                <div className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                  agency.status === 'Active' ? 'bg-green-100 text-green-700' : 
                  agency.status === 'Suspended' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    agency.status === 'Active' ? 'bg-green-500' : 
                    agency.status === 'Suspended' ? 'bg-amber-500' : 'bg-red-500'
                  } animate-pulse`} />
                  <span>{agency.status === 'Active' ? t.active : agency.status === 'Suspended' ? t.suspended : t.inactive}</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-2 text-[10px] font-bold opacity-70">
                  {trackingType === 'bureau' ? <Building2 className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5 text-secondary" />}
                  <span className="uppercase tracking-widest">{trackingType === 'bureau' ? (isAm ? "አዲስ አበባ፣ ዋና መስሪያ ቤት" : "Addis Ababa, HQ") : getTranslatedManager(agency.manager)}</span>
                </div>
                {userLocation && (
                  <div className="flex items-center space-x-1 text-[9px] font-black text-primary bg-secondary/10 px-2 py-0.5 rounded-md">
                    <Navigation className="w-3 h-3" />
                    <span>{getDistance(userLocation[0], userLocation[1], trackingType === 'bureau' ? agency.lat : agency.managerLat, trackingType === 'bureau' ? agency.lng : agency.managerLng)} km</span>
                  </div>
                )}
              </div>
            </button>
          ))}
          {filteredAgencies.length === 0 && (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">No matching agencies</p>
            </div>
          )}
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-grow bg-white rounded-[40px] relative overflow-hidden shadow-2xl border-8 border-white group">
        <MapContainer 
          center={mapCenter} 
          zoom={zoomLevel} 
          style={{ height: '100%', width: '100%', borderRadius: '32px' }}
          zoomControl={false}
        >
          <ChangeView center={mapCenter} zoom={zoomLevel} />
          <TileLayer
            attribution={showSatellite ? '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community' : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}
            url={showSatellite ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
          />

          {trackingType === 'manager' && selectedAgency && trails[selectedAgency.id] && (
            <Polyline 
              positions={trails[selectedAgency.id]} 
              pathOptions={{ color: '#003366', weight: 4, opacity: 0.5, dashArray: '10, 10' }} 
            />
          )}

          {filteredAgencies.map((agency) => (
            <React.Fragment key={`meta-${agency.id}`}>
              {trackingType === 'bureau' && (
                <Circle 
                  center={[agency.lat, agency.lng]}
                  radius={1000} // 1km jurisdiction
                  pathOptions={{ 
                    fillColor: agency.status === 'Active' ? '#10b981' : '#ef4444',
                    fillOpacity: 0.1,
                    color: agency.status === 'Active' ? '#10b981' : '#ef4444',
                    weight: 1,
                    dashArray: '5, 5'
                  }}
                />
              )}
            </React.Fragment>
          ))}
          
          {userLocation && (
            <Marker 
              position={userLocation}
              icon={L.divIcon({
                html: `<div class="relative flex items-center justify-center">
                  <div class="absolute w-12 h-12 bg-blue-500 rounded-full animate-ping opacity-20"></div>
                  <div class="w-10 h-10 rounded-full bg-blue-600 border-4 border-white shadow-2xl flex items-center justify-center text-white text-lg">
                    📡
                  </div>
                </div>`,
                className: 'custom-user-icon',
                iconSize: [40, 40],
                iconAnchor: [20, 20]
              })}
            >
              <Popup>
                <div className="text-center font-black text-blue-600 uppercase tracking-tighter">Your Location (HQ Command)</div>
              </Popup>
            </Marker>
          )}

          {filteredAgencies.map((agency) => (
            <Marker 
              key={agency.id} 
              position={[trackingType === 'bureau' ? agency.lat : agency.managerLat, trackingType === 'bureau' ? agency.lng : agency.managerLng]}
              icon={createCustomIcon(
                agency.status === 'Active' ? 'green' : 
                agency.status === 'Suspended' ? 'amber' : 'red', 
                trackingType === 'bureau'
              )}
              eventHandlers={{
                click: () => handleFocus(agency),
              }}
            >
              <Popup className="custom-popup">
                <div className="p-1 min-w-[200px]">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-black text-primary uppercase text-[11px] tracking-tight truncate max-w-[140px]">{trackingType === 'bureau' ? getTranslatedName(agency.name) : getTranslatedManager(agency.manager)}</p>
                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${
                      agency.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {agency.status === 'Active' ? t.active : t.inactive}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-2 mt-2">
                    <div>
                      <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">{t.staff}</p>
                      <p className="text-[10px] font-black text-primary">{agency.staff}</p>
                    </div>
                    <div>
                      <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">{isAm ? 'አድራሻ' : 'HQ Location'}</p>
                      <p className="text-[10px] font-black text-primary truncate">Addis Ababa</p>
                    </div>
                    <div>
                      <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">{t.location}</p>
                      <p className="text-[10px] font-black text-primary truncate">
                        {(trackingType === 'bureau' ? agency.lat : agency.managerLat).toFixed(4)}, 
                        {(trackingType === 'bureau' ? agency.lng : agency.managerLng).toFixed(4)}
                      </p>
                    </div>
                  </div>
                  {trackingType === 'manager' && (
                    <div className="mt-2 pt-2 border-t border-gray-100 flex items-center space-x-1.5">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                      <p className="text-[8px] font-bold text-blue-600 uppercase">Live: {agency.lastSeen}</p>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        
        {/* Animated Overlay Grids */}
        <div className="absolute inset-0 pointer-events-none border-[1px] border-primary/5 rounded-[32px] overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,51,102,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,51,102,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        {/* Info Overlay */}
        <AnimatePresence>
          {selectedAgency && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="absolute bottom-8 left-8 right-8 z-[1000]"
            >
              <div className="bg-white/95 backdrop-blur-xl p-8 rounded-[40px] shadow-2xl border border-white/50 flex items-center justify-between">
                <div className="flex items-center space-x-8">
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-2xl transition-all scale-110 ${selectedAgency.status === 'Active' ? 'bg-green-600 shadow-green-200' : 'bg-red-600 shadow-red-200'}`}>
                    {trackingType === 'bureau' ? <Building2 className="w-10 h-10" /> : <User className="w-10 h-10" />}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-2xl font-black text-primary uppercase tracking-tighter">{getTranslatedName(selectedAgency.name)}</h4>
                    <div className="flex items-center space-x-3">
                       <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{t.manager}: <span className="text-primary">{getTranslatedManager(selectedAgency.manager)}</span></p>
                       {trackingType === 'manager' && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black rounded-md uppercase tracking-widest border border-blue-100">Live: {selectedAgency.lastSeen}</span>}
                    </div>
                  </div>
                  <div className="h-14 w-px bg-gray-100 mx-4" />
                  <div className="grid grid-cols-2 gap-x-10 gap-y-1">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{t.staff}</p>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{t.status}</p>
                    <p className="text-md font-black text-primary tracking-tight">{selectedAgency.staff} Units</p>
                    <p className={`text-md font-black uppercase tracking-tight ${selectedAgency.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>{selectedAgency.status === 'Active' ? t.active : t.inactive}</p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-400 hover:text-primary hover:bg-gray-100 transition-all group">
                    <Navigation className="w-6 h-6 group-hover:rotate-45 transition-transform" />
                  </button>
                  <button className="p-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] px-10 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                    {t.viewProfile}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map Controls */}
        <div className="absolute top-8 right-8 flex flex-col space-y-3 z-[1000]">
          <div className="flex flex-col bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/50 overflow-hidden">
            <button 
              onClick={() => setZoomLevel(prev => Math.min(prev + 1, 18))}
              className="p-4 text-primary hover:bg-gray-50 font-black text-xl border-b border-gray-100 transition-colors"
            >+</button>
            <button 
              onClick={() => setZoomLevel(prev => Math.max(prev - 1, 8))}
              className="p-4 text-primary hover:bg-gray-50 font-black text-xl transition-colors"
            >-</button>
          </div>
          <button 
            onClick={() => setShowSatellite(!showSatellite)}
            className={`p-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/50 transition-all ${showSatellite ? 'text-blue-600 bg-blue-50/90' : 'text-gray-400 hover:text-primary'}`}
            title={showSatellite ? t.standard : t.satellite}
          >
            <Layers className="w-6 h-6" />
          </button>
          <button 
            onClick={() => userLocation && setMapCenter(userLocation)}
            className="p-4 bg-secondary text-primary rounded-2xl shadow-2xl shadow-secondary/20 hover:scale-110 active:scale-90 transition-all disabled:opacity-50 disabled:scale-100"
            disabled={!userLocation}
          >
            <Crosshair className="w-6 h-6" />
          </button>
        </div>

        {/* Global Tracker Label */}
        <div className="absolute top-8 left-8 z-[1000] p-4 bg-primary/95 backdrop-blur-sm rounded-2xl border border-white/10 shadow-2xl flex items-center space-x-3">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
          <p className="text-[10px] font-black text-white uppercase tracking-[0.25em]">LIVE AGENT TRACKING ACTIVE</p>
        </div>
      </div>
    </div>
  );
};
