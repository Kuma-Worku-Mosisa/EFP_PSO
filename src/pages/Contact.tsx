import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Mail, Phone, MapPin, Clock, Send, Shield, Facebook, Twitter, Linkedin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Contact = () => {
  const { t, language } = useLanguage();
  const isAm = language === 'am';
  const [showMap, setShowMap] = React.useState(false);

  return (
    <div className="py-24 space-y-24">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-accent font-bold tracking-widest uppercase text-sm">{t.contact.badge}</h2>
          <h3 className="text-4xl font-bold text-primary">{t.contact.title}</h3>
          <div className="w-24 h-1 bg-secondary mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info Cards */}
          <div className="space-y-6">
            {[
              { icon: <Phone className="w-6 h-6" />, title: t.contact.info.phone.title, detail: t.contact.info.phone.val, sub: t.contact.info.phone.sub },
              { icon: <Mail className="w-6 h-6" />, title: t.contact.info.email.title, detail: t.contact.info.email.val, sub: t.contact.info.email.sub },
              { icon: <MapPin className="w-6 h-6" />, title: t.contact.info.visit.title, detail: t.contact.info.visit.detail, sub: t.contact.info.visit.sub },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-[30px] shadow-sm border border-gray-100 flex items-start space-x-6"
              >
                <div className="p-4 bg-gray-50 rounded-2xl text-primary">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{item.title}</h4>
                  <p className="text-xl font-bold text-primary mb-1">{item.detail}</p>
                  <p className="text-xs text-gray-500">{item.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white p-8 md:p-12 rounded-[40px] shadow-xl border border-gray-100">
            <form className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">{t.contact.form.name}</label>
                  <input type="text" placeholder={t.contact.form.placeholder.name} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">{t.contact.form.email}</label>
                  <input type="email" placeholder={t.contact.form.placeholder.email} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">{t.contact.form.subject}</label>
                <input type="text" placeholder={t.contact.form.placeholder.subject} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">{t.contact.form.message}</label>
                <textarea rows={6} placeholder={t.contact.form.placeholder.message} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all resize-none" />
              </div>
              <button className="w-full blue-gradient text-white font-bold py-5 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-[1.01] transition-all flex items-center justify-center space-x-3">
                <span>{t.contact.form.submit}</span>
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-[500px] bg-gray-100 rounded-[50px] relative overflow-hidden shadow-2xl border border-gray-100">
          <AnimatePresence mode="wait">
            {!showMap ? (
              <motion.div 
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="absolute inset-0 opacity-20">
                  <img 
                    src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=2000" 
                    alt="Map Background" 
                    className="w-full h-full object-cover grayscale"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="relative z-10 bg-white/80 backdrop-blur-xl p-10 rounded-[40px] shadow-2xl border border-white/50 flex flex-col items-center text-center space-y-6 max-w-sm">
                  <div className="w-20 h-20 bg-red-50 rounded-[28px] flex items-center justify-center text-red-600 shadow-2xl animate-bounce border border-red-100">
                    <MapPin className="w-10 h-10 fill-red-600/10" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-2xl font-black text-primary uppercase tracking-tighter">{t.contact.map.title}</h4>
                    <p className="text-gray-500 text-sm font-medium">{t.contact.map.desc}</p>
                  </div>
                  <button 
                    onClick={() => setShowMap(true)}
                    className="gold-gradient text-primary font-black px-10 py-4 rounded-2xl shadow-xl hover:scale-105 transition-all text-sm uppercase tracking-widest"
                  >
                    {t.contact.map.btn}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="map"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="w-full h-full relative"
              >
                <iframe 
                  src="https://maps.google.com/maps?q=9.01127,38.74087+(Ethiopian+Federal+Police+Commission+HQ)&hl=en&z=18&t=m&output=embed"
                  className="w-full h-full border-0"
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ethiopian Federal Police HQ Map"
                ></iframe>
                <button 
                  onClick={() => setShowMap(false)}
                  className="absolute bottom-10 left-10 bg-white/95 backdrop-blur-md text-red-600 px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl border border-red-50 hover:bg-red-600 hover:text-white transition-all flex items-center space-x-2"
                >
                  <MapPin className="w-3 h-3 fill-current" />
                  <span>{isAm ? "ካርታውን ዝጋ" : "Hide Map"}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};
