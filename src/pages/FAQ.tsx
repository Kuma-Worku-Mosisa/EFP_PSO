import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { HelpCircle, ArrowRight, Shield, Search } from 'lucide-react';
import { motion } from 'motion/react';

export const FAQ = () => {
  const { t } = useLanguage();

  const faqs = t.faq.items;

  return (
    <div className="py-24 space-y-24">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-accent font-bold tracking-widest uppercase text-sm">{t.faq.title}</h2>
          <h3 className="text-4xl font-bold text-primary">{t.faq.subtitle}</h3>
          <div className="w-24 h-1 bg-secondary mx-auto rounded-full" />
        </div>

        <div className="relative mb-12">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
          <input 
            type="text" 
            placeholder={t.faq.searchPlaceholder} 
            className="w-full pl-16 pr-8 py-6 bg-white border border-gray-100 rounded-[30px] shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/5 text-lg"
          />
        </div>

        <div className="space-y-6">
          {faqs.map((faq: any, i: number) => (
            <motion.details
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group bg-white rounded-[30px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
              <summary className="flex items-center justify-between p-8 cursor-pointer font-bold text-primary text-lg">
                <div className="flex items-center space-x-4">
                  <HelpCircle className="text-secondary w-6 h-6" />
                  <span>{faq.q}</span>
                </div>
                <ArrowRight className="w-6 h-6 group-open:rotate-90 transition-transform text-gray-400" />
              </summary>
              <div className="px-8 pb-8 text-gray-600 leading-relaxed border-t border-gray-50 pt-6">
                {faq.a}
              </div>
            </motion.details>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-primary rounded-[50px] p-12 md:p-20 text-white text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full -ml-48 -mt-48" />
          <h3 className="text-3xl md:text-5xl font-bold relative z-10">{t.faq.stillQuestions}</h3>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto relative z-10">
            {t.faq.stillQuestionsSub}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
            <button className="gold-gradient text-primary font-bold px-10 py-5 rounded-2xl shadow-lg hover:shadow-2xl transition-all">
              {t.faq.contactSupport}
            </button>
            <button className="bg-white/10 border border-white/20 text-white font-bold px-10 py-5 rounded-2xl hover:bg-white/20 transition-all">
              {t.faq.visitOffice}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
