import React from 'react';
import { Shield, Mail, Phone, MapPin, Facebook, Twitter, Linkedin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-dark-blue text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 flex items-center justify-center overflow-hidden">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/3/30/Federal_Police_Commission_of_Ethiopia_Coat_of_Arms_and_Logo.png" 
                  alt="Federal Police Logo" 
                  className="w-12 h-12 object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="font-bold text-xl tracking-tight">ETHIOPIAN FEDERAL POLICE</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {t.footer.desc}
            </p>
          </div>

          <div>
            <h3 className="text-secondary font-bold mb-6 uppercase tracking-wider text-sm">{t.footer.quickLinks}</h3>
            <ul className="space-y-4 text-gray-300 text-sm">
              <li><a href="/" className="hover:text-white transition-colors">{t.nav.home}</a></li>
              <li><a href="/services" className="hover:text-white transition-colors">{t.nav.services}</a></li>
              <li><a href="/requirements" className="hover:text-white transition-colors">{t.nav.requirements}</a></li>
              <li><a href="/faq" className="hover:text-white transition-colors">{t.nav.faq}</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-secondary font-bold mb-6 uppercase tracking-wider text-sm">{t.nav.contact}</h3>
            <ul className="space-y-4 text-gray-300 text-sm">
              <li className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-secondary" />
                <span>+251 11 123 4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-secondary" />
                <span>info@federalpolice.gov.et</span>
              </li>
              <li className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-secondary" />
                <span>{t.contact.info.visit.detail}</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-secondary font-bold mb-6 uppercase tracking-wider text-sm">{t.footer.legal}</h3>
            <div className="flex space-x-4">
              <a href="#" className="bg-white/10 p-3 rounded-full hover:bg-secondary hover:text-primary transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="bg-white/10 p-3 rounded-full hover:bg-secondary hover:text-primary transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="bg-white/10 p-3 rounded-full hover:bg-secondary hover:text-primary transition-all">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400 text-xs">
          <p>{t.footer.copyright}</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white">{t.footer.privacy}</a>
            <a href="#" className="hover:text-white">{t.footer.terms}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
