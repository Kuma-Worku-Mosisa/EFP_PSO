import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { HelpCircle, Plus, Trash2, Edit, Save, Search, GripVertical, X } from 'lucide-react';
import { motion, Reorder, AnimatePresence } from 'motion/react';

export const ManageFAQ = () => {
  const { language, t } = useLanguage();
  const isAm = language === 'am';
  
  const [faqs, setFaqs] = useState(t.faq.items);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingFaq, setEditingFaq] = useState<any>(null);
  const [formData, setFormData] = useState({ q: '', a: '', cat: 'general' });
  const [showSaveToast, setShowSaveToast] = useState(false);

  const categories = t.faq.categories;

  const filteredFaqs = faqs.filter((faq: any) => {
    const matchesCategory = activeCategory === 'all' || faq.cat === activeCategory;
    const matchesSearch = faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleGlobalSave = () => {
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3000);
  };

  const labels = {
    title: isAm ? "በተደጋጋሚ የሚነሱ ጥያቄዎች አስተዳደር" : "FAQ Management",
    subtitle: isAm ? "በድረ-ገጹ ላይ የሚታዩ ጥያቄዎችን እና መልሶችን ያቀናብሩ" : "Manage questions and answers displayed on the public FAQ page",
    addBtn: isAm ? "አዲስ ጥያቄ ጨምር" : "Add New Question",
    saveAll: isAm ? "ሁሉንም አስቀምጥ" : "Save All Changes",
    unsaved: isAm ? "ያልተቀመጡ ለውጦች አሉ" : "Unsaved Changes",
    saveDesc: isAm ? "ለውጦቹን ለማጽደቅ አስቀምጥ የሚለውን ይጫኑ" : "Make sure to save after re-ordering or editing",
    edit: isAm ? "አስተካክል" : "Edit",
    delete: isAm ? "ሰርዝ" : "Delete",
    question: isAm ? "ጥያቄ" : "Question",
    answer: isAm ? "መልስ" : "Answer",
    category: isAm ? "ምድብ" : "Category",
    cancel: isAm ? "ሰርዝ" : "Cancel",
    save: isAm ? "አስቀምጥ" : "Save",
    searchPlaceholder: isAm ? "ጥያቄዎችን ፈልግ..." : "Search questions...",
    noResults: isAm ? "ምንም ጥያቄ አልተገኘም" : "No FAQs found matching your criteria"
  };

  const handleSave = () => {
    if (editingFaq) {
      setFaqs(prev => prev.map(f => f.q === editingFaq.q ? { ...formData } : f));
    } else {
      setFaqs(prev => [formData, ...prev]);
    }
    setIsAdding(false);
    setEditingFaq(null);
    setFormData({ q: '', a: '', cat: 'general' });
  };

  const handleEdit = (faq: any) => {
    setEditingFaq(faq);
    setFormData(faq);
    setIsAdding(true);
  };

  const handleDelete = (question: string) => {
    if (confirm(isAm ? "ይህንን ጥያቄ መሰረዝ ይፈልጋሉ?" : "Are you sure you want to delete this question?")) {
      setFaqs(prev => prev.filter(f => f.q !== question));
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary tracking-tight">{labels.title}</h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1">
            {labels.subtitle}
          </p>
        </div>
        <button 
          onClick={() => {
            setEditingFaq(null);
            setFormData({ q: '', a: '', cat: 'general' });
            setIsAdding(true);
          }}
          className="gold-gradient text-primary px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center space-x-2 shadow-xl shadow-secondary/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{labels.addBtn}</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={labels.searchPlaceholder}
            className="w-full pl-16 pr-8 py-5 bg-white rounded-[30px] border border-gray-100 shadow-sm focus:border-secondary focus:ring-4 focus:ring-secondary/5 outline-none font-bold text-sm text-primary transition-all"
          />
        </div>
        <div className="flex items-center space-x-3 overflow-x-auto pb-2 lg:pb-0 custom-scrollbar">
          {['all', 'general', 'licensing', 'technical', 'payment'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-4 rounded-[20px] transition-all font-black uppercase tracking-widest text-[9px] whitespace-nowrap border-2 ${
                cat === activeCategory 
                ? 'gold-gradient text-primary border-secondary shadow-lg shadow-secondary/20 scale-105' 
                : 'bg-white text-gray-400 border-transparent hover:border-gray-100 hover:text-primary hover:bg-gray-50'
              }`}
            >
              {cat === 'all' ? (isAm ? 'ሁሉም' : 'All') : categories[cat]}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm min-h-[400px]">
        {filteredFaqs.length > 0 ? (
          <Reorder.Group axis="y" values={faqs} onReorder={setFaqs} className="space-y-4">
            {filteredFaqs.map((faq: any) => (
              <Reorder.Item 
                key={faq.q} 
                value={faq}
                className="group bg-gray-50/50 rounded-[30px] border border-transparent hover:border-secondary/30 hover:bg-white transition-all duration-300 p-8 flex items-center space-x-6 shadow-sm hover:shadow-xl"
              >
                <div className="cursor-grab active:cursor-grabbing text-gray-300 group-hover:text-secondary transition-all">
                  <GripVertical className="w-6 h-6" />
                </div>
                
                <div className="flex-grow space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-primary shadow-sm group-hover:bg-secondary/10 group-hover:text-secondary group-hover:border-secondary/20 transition-all">
                        <HelpCircle className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-secondary/80">
                        {categories[faq.cat]}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => handleEdit(faq)}
                        className="p-3 bg-white text-gray-400 hover:text-primary hover:border-primary border border-gray-100 rounded-xl transition-all shadow-sm group/btn"
                      >
                        <Edit className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                      </button>
                      <button 
                        onClick={() => handleDelete(faq.q)}
                        className="p-3 bg-white text-red-400 hover:text-white hover:bg-red-500 border border-gray-100 rounded-xl transition-all shadow-sm group/btn"
                      >
                        <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-primary tracking-tight mb-3 group-hover:text-secondary transition-colors">{faq.q}</h4>
                    <p className="text-gray-500 text-sm font-medium leading-relaxed bg-white/50 p-4 rounded-2xl border border-gray-50 italic">{faq.a}</p>
                  </div>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6">
              <Search className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-primary mb-2">{labels.noResults}</h3>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>

      <div className="bg-primary rounded-[40px] p-10 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-1000" />
        <div className="flex items-center space-x-6 relative z-10">
          <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-secondary shadow-lg border border-white/20">
            <Save className="w-8 h-8" />
          </div>
          <div>
            <p className="text-2xl font-black text-white tracking-tight leading-none mb-1">{labels.unsaved}</p>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{labels.saveDesc}</p>
          </div>
        </div>
        <button 
          onClick={handleGlobalSave}
          className="gold-gradient text-primary px-16 py-6 rounded-[24px] font-black text-sm uppercase tracking-widest shadow-2xl shadow-secondary/20 hover:scale-105 active:scale-95 transition-all relative z-10"
        >
          {labels.saveAll}
        </button>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showSaveToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[3000] gold-gradient px-8 py-4 rounded-2xl shadow-2xl flex items-center space-x-4 border border-secondary"
          >
            <Save className="w-5 h-5 text-primary" />
            <span className="text-xs font-black text-primary uppercase tracking-widest">
              {isAm ? "ለውጦች በተሳካ ሁኔታ ተቀምጠዋል!" : "Changes saved successfully!"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-primary/20 backdrop-blur-xl" 
              onClick={() => setIsAdding(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-gray-50 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-xl font-black text-primary tracking-tight">{editingFaq ? labels.edit : labels.addBtn}</h2>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Manage public knowledge base</p>
                </div>
                <button onClick={() => setIsAdding(false)} className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">{labels.question}</label>
                  <input 
                    type="text" 
                    value={formData.q}
                    onChange={(e) => setFormData({...formData, q: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-secondary focus:bg-white outline-none font-bold text-sm text-primary transition-all shadow-inner" 
                    placeholder={isAm ? "ጥያቄውን እዚህ ያስገቡ..." : "Enter question..."}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">{labels.category}</label>
                  <select 
                    value={formData.cat}
                    onChange={(e) => setFormData({...formData, cat: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-secondary focus:bg-white outline-none font-bold text-sm text-primary transition-all appearance-none cursor-pointer"
                  >
                    {Object.entries(categories).map(([key, value]) => (
                      <option key={key} value={key}>{value as string}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">{labels.answer}</label>
                  <textarea 
                    value={formData.a}
                    onChange={(e) => setFormData({...formData, a: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-secondary focus:bg-white outline-none font-medium text-xs text-primary transition-all h-32 resize-none leading-relaxed"
                    placeholder={isAm ? "መልሱን እዚህ ይጻፉ..." : "Enter answer..."}
                  />
                </div>
              </div>
              <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end items-center space-x-3 shrink-0">
                <button onClick={() => setIsAdding(false)} className="px-6 py-3 text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-primary transition-colors">{labels.cancel}</button>
                <button onClick={handleSave} className="blue-gradient text-white px-10 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                  {labels.save}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
