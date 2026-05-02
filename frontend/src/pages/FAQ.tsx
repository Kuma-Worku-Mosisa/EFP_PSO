import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { HelpCircle, Plus, Minus, Shield, Search, Sparkles, MessageCircle, Info, CreditCard, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const FAQ = () => {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const isAm = language === 'am';
  const categories = t.faq.categories;
  const faqs = t.faq.items;

  const filteredFaqs = faqs.filter((faq: any) => {
    const matchesSearch = faq.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         faq.a.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.cat === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryIcons: Record<string, any> = {
    all: Sparkles,
    general: Info,
    licensing: Shield,
    technical: Settings,
    payment: CreditCard
  };

  return (
    <div className="py-24 space-y-24 bg-gray-50/30">
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-20 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-secondary/20 blur-[100px] rounded-full" />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center space-x-2 bg-secondary/10 px-4 py-2 rounded-full border border-secondary/20 mb-4 relative z-10"
          >
            <HelpCircle className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{t.faq.title}</span>
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black text-primary tracking-tight leading-none mb-6">
            {isAm ? "እንዴት ልንረዳዎ እንችላለን?" : "How can we help?"}
          </h1>
          <div className="w-24 h-1.5 gold-gradient mx-auto rounded-full mb-8 relative z-10 shadow-lg shadow-secondary/20" />
          <p className="text-gray-400 font-bold max-w-2xl mx-auto uppercase tracking-widest text-[10px]">
            {t.faq.subtitle}
          </p>
        </div>

        {/* Search & Categories */}
        <div className="space-y-12">
          <div className="relative group max-w-3xl mx-auto">
            <div className="absolute inset-0 bg-secondary blur-2xl opacity-10 group-focus-within:opacity-20 transition-opacity rounded-[40px]" />
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-primary/40 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.faq.searchPlaceholder} 
              className="w-full pl-20 pr-10 py-8 bg-white/80 backdrop-blur-xl border border-white rounded-[40px] shadow-2xl focus:outline-none focus:ring-4 focus:ring-secondary/20 text-lg font-bold text-primary placeholder:text-primary/20 relative z-10"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {['all', 'general', 'licensing', 'technical', 'payment'].map((cat) => {
              const Icon = categoryIcons[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center space-x-3 px-8 py-4 rounded-[24px] border-2 transition-all font-black uppercase tracking-widest text-[10px] ${
                    activeCategory === cat 
                    ? 'gold-gradient text-primary border-secondary shadow-xl shadow-secondary/20 scale-105' 
                    : 'bg-white text-gray-400 border-transparent hover:border-gray-100 hover:text-primary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{cat === 'all' ? (isAm ? 'ሁሉም' : 'All') : categories[cat]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="mt-20 space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredFaqs.map((faq: any, i: number) => {
              const isOpen = openIndex === i;
              return (
                <motion.div
                  key={faq.q}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className={`group rounded-[40px] border transition-all duration-500 overflow-hidden ${
                    isOpen 
                    ? 'bg-white border-primary/10 shadow-2xl shadow-primary/5 ' 
                    : 'bg-white/50 border-white hover:bg-white hover:border-gray-100'
                  }`}
                >
                  <button 
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full flex items-center justify-between p-10 cursor-pointer text-left"
                  >
                    <div className="flex items-center space-x-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                        isOpen ? 'gold-gradient text-primary rotate-12 shadow-lg shadow-secondary/20' : 'bg-gray-100 text-gray-400 group-hover:bg-white group-hover:shadow-lg'
                      }`}>
                        <HelpCircle className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <span className={`text-xs font-black uppercase tracking-widest ${isOpen ? 'text-secondary/80' : 'text-gray-400'}`}>
                          {categories[faq.cat]}
                        </span>
                        <h4 className={`text-xl font-black tracking-tight transition-colors ${isOpen ? 'text-primary' : 'text-gray-600'}`}>
                          {faq.q}
                        </h4>
                      </div>
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                      isOpen ? 'bg-primary text-secondary rotate-180 scale-110 shadow-lg shadow-primary/20' : 'bg-gray-50 text-gray-300'
                    }`}>
                      {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                      >
                        <div className="px-10 pb-10">
                          <div className="pl-[88px]">
                            <div className="p-8 bg-gray-50/50 rounded-[30px] border border-gray-100/50 text-lg text-gray-500 leading-relaxed font-medium">
                              {faq.a}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredFaqs.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 space-y-4"
            >
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-300">
                <Search className="w-10 h-10" />
              </div>
              <p className="font-black text-gray-400 uppercase tracking-widest text-[10px]">No results found for your search</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Support Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-primary rounded-[60px] p-12 md:p-24 text-white text-center space-y-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/10 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform duration-1000" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2" />
          
          <div className="relative z-10 space-y-6">
            <h3 className="text-4xl md:text-7xl font-black tracking-tighter leading-none">{t.faq.stillQuestions}</h3>
            <p className="text-white/60 text-lg md:text-xl font-bold max-w-2xl mx-auto leading-relaxed">
              {t.faq.stillQuestionsSub}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 relative z-10">
            <button className="gold-gradient text-primary font-black px-12 py-6 rounded-[24px] shadow-2xl hover:shadow-secondary/20 hover:scale-[1.05] active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center space-x-3">
              <MessageCircle className="w-5 h-5" />
              <span>{t.faq.contactSupport}</span>
            </button>
            <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-black px-12 py-6 rounded-[24px] hover:bg-white/20 hover:border-white/40 transition-all text-sm uppercase tracking-widest">
              {t.faq.visitOffice}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

