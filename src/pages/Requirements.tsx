import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { CheckCircle2, AlertCircle, FileText, Shield, Users, MapPin, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export const Requirements = () => {
  const { t } = useLanguage();

  return (
    <div className="py-24 space-y-24">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-accent font-bold tracking-widest uppercase text-sm">{t.requirements.title}</h2>
          <h3 className="text-4xl font-bold text-primary">
            {t.requirements.subtitle}
          </h3>
          <div className="w-24 h-1 bg-secondary mx-auto rounded-full" />
        </div>

        <div className="space-y-12">
          {t.requirements.sections.map((section: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="bg-primary p-8 text-white flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  {[<Shield />, <Users />, <MapPin />, <CreditCard />][i] || <FileText />}
                </div>
                <h4 className="text-2xl font-bold">{section.title}</h4>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {section.items.map((item: string, j: number) => (
                  <div key={j} className="flex items-start space-x-3 p-3 rounded-2xl hover:bg-gray-50 transition-all group">
                    <div className="mt-1">
                      <CheckCircle2 className="text-secondary w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-gray-700 text-sm font-medium leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-[40px] shadow-xl p-8 md:p-16 space-y-12 border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-amber-50 rounded-2xl">
                <AlertCircle className="text-amber-500 w-8 h-8" />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-primary">
                  {t.requirements.notice}
                </h4>
                <p className="text-gray-500">
                  {t.requirements.noticeSub}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {t.requirements.notes.map((note: string, i: number) => (
                <div key={i} className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                  <CheckCircle2 className="text-green-500 w-6 h-6 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 font-medium leading-relaxed">
                    {note}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-8 border-t">
              <Link to="/register" className="w-full gold-gradient text-primary font-bold py-5 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center">
                {t.requirements.startApp}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
