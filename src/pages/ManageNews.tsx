import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Newspaper, Plus, Trash2, Edit, Save, X, Image as ImageIcon, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NewsItem {
  id: number;
  title: string;
  category: string;
  date: string;
  content: string;
  status: 'published' | 'draft';
  image?: string;
}

export const ManageNews = () => {
  const { language } = useLanguage();
  const isAm = language === 'am';
  
  const [news, setNews] = useState<NewsItem[]>([
    { id: 1, title: isAm ? "አዲስ የደህንነት መመሪያ" : "New Security Directive", category: "Official", date: "2024-04-28", content: isAm ? "ስለ መመሪያው ዝርዝር መረጃ እዚህ ይገኛል..." : "Details about the directive...", status: 'published' },
    { id: 2, title: isAm ? "የፈቃድ እድሳት ማሳሰቢያ" : "License Renewal Notice", category: "Alert", date: "2024-04-20", content: isAm ? "ጠቃሚ ማሳሰቢያ ለሁሉም ኤጀንሲዎች..." : "Important reminder for all agencies...", status: 'published' },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [formData, setFormData] = useState<Partial<NewsItem>>({
    title: '',
    category: 'Official',
    content: '',
    status: 'published'
  });

  const t = {
    title: isAm ? "ዜና እና ማስታወቂያዎች አስተዳደር" : "News & Announcements Management",
    addNew: isAm ? "አዲስ ጨምር" : "Add New Announcement",
    category: isAm ? "ምድብ" : "Category",
    date: isAm ? "ቀን" : "Date",
    status: isAm ? "ሁኔታ" : "Status",
    publish: isAm ? "አትም" : "Publish",
    draft: isAm ? "ረቂቅ" : "Draft",
    edit: isAm ? "አስተካክል" : "Edit",
    delete: isAm ? "ሰርዝ" : "Delete",
    save: isAm ? "አስቀምጥ" : "Save Changes",
    content: isAm ? "ይዘት" : "Content",
    uploadImg: isAm ? "ምስል ምረጥ" : "Select Image",
    statsTitle: isAm ? "የዜና ስታቲስቲክስ" : "News Stats"
  };

  const handleSave = () => {
    if (editingItem) {
      setNews(prev => prev.map(item => item.id === editingItem.id ? { ...item, ...formData as NewsItem } : item));
    } else {
      const newItem: NewsItem = {
        id: Date.now(),
        title: formData.title || '',
        category: formData.category || 'Official',
        date: new Date().toISOString().split('T')[0],
        content: formData.content || '',
        status: (formData.status as any) || 'published'
      };
      setNews(prev => [newItem, ...prev]);
    }
    setIsAdding(false);
    setEditingItem(null);
    setFormData({ title: '', category: 'Official', content: '', status: 'published' });
  };

  const handleEdit = (item: NewsItem) => {
    setEditingItem(item);
    setFormData(item);
    setIsAdding(true);
  };

  const handleDelete = (id: number) => {
    if (confirm(isAm ? "ይህንን ዜና በእርግጠኝነት መሰረዝ ይፈልጋሉ?" : "Are you sure you want to delete this news item?")) {
      setNews(prev => prev.filter(item => item.id !== id));
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary tracking-tight">{t.title}</h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1">
            {isAm ? "የህዝብ ዜናዎችን እና ማስታወቂያዎችን ይቆጣጠሩ" : "Manage public news feed and official announcements"}
          </p>
        </div>
        <button 
          onClick={() => {
            setEditingItem(null);
            setFormData({ title: '', category: 'Official', content: '', status: 'published' });
            setIsAdding(true);
          }}
          className="gold-gradient text-primary px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center space-x-2 shadow-xl shadow-secondary/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addNew}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="popLayout">
            {news.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, x: -20 }}
                className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 group hover:shadow-2xl hover:border-secondary/20 transition-all duration-500"
              >
                <div className="w-full md:w-56 h-40 bg-gray-50 rounded-[20px] flex flex-col items-center justify-center text-gray-300 group-hover:bg-secondary/5 transition-colors relative overflow-hidden border border-dashed border-gray-200">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <ImageIcon className="w-12 h-12 mb-2 group-hover:scale-110 transition-transform duration-500" />
                      <span className="text-[8px] font-black uppercase tracking-[0.2em]">{t.uploadImg}</span>
                    </>
                  )}
                </div>
                <div className="flex-grow space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="bg-secondary/10 text-primary px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-secondary/20">
                      {isAm ? (item.category === 'Official' ? 'ይፋዊ' : 'ማስጠንቀቂያ') : item.category}
                    </span>
                    <div className="flex items-center space-x-1 text-gray-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold">{item.date}</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-primary tracking-tight group-hover:text-secondary transition-colors line-clamp-1">{item.title}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed font-medium">{item.content}</p>
                  
                  <div className="flex items-center space-x-3 pt-2">
                    <div className={`w-2 h-2 rounded-full ${item.status === 'published' ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{item.status === 'published' ? t.publish : t.draft}</span>
                  </div>
                </div>
                <div className="flex md:flex-col justify-end gap-3 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                  <button 
                    onClick={() => handleEdit(item)}
                    className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-primary hover:text-white transition-all shadow-sm group/btn"
                  >
                    <Edit className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-4 bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm group/btn"
                  >
                    <Trash2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-primary rounded-[40px] p-10 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:scale-125 transition-transform duration-1000" />
            <div className="relative z-10 space-y-6">
              <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center border border-white/20">
                <Newspaper className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-2xl font-black tracking-tight">{t.statsTitle}</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white/5 p-6 rounded-[24px] border border-white/10">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">{isAm ? "ጠቅላላ" : "Total"}</p>
                  <p className="text-4xl font-black text-secondary">{news.length}</p>
                </div>
                <div className="bg-white/5 p-6 rounded-[24px] border border-white/10">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">{isAm ? "የታተሙ" : "Published"}</p>
                  <p className="text-4xl font-black text-white">{news.filter(n => n.status === 'published').length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
              className="bg-white w-full max-w-2xl rounded-[50px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] relative z-10 overflow-hidden border border-white"
            >
              <div className="p-10 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 gold-gradient rounded-2xl flex items-center justify-center shadow-lg shadow-secondary/20">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-black text-primary tracking-tight">{editingItem ? t.edit : t.addNew}</h2>
                </div>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="p-4 bg-white rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all border border-gray-100"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-10 space-y-8 overflow-y-auto max-h-[60vh] custom-scrollbar">
                {/* Image Upload Area */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Announcement Image</label>
                  <div 
                    onClick={() => document.getElementById('news-image-upload')?.click()}
                    className="w-full h-48 bg-gray-50 rounded-[30px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center group hover:bg-secondary/5 hover:border-secondary/40 transition-all cursor-pointer relative overflow-hidden"
                  >
                    {formData.image ? (
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover rounded-[28px]" />
                    ) : (
                      <>
                        <ImageIcon className="w-12 h-12 text-gray-300 group-hover:text-secondary group-hover:scale-110 transition-all" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2">{t.uploadImg}</p>
                      </>
                    )}
                    <input 
                      id="news-image-upload"
                      type="file" 
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData({...formData, image: reader.result as string});
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">{isAm ? "ርዕስ" : "Title"}</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-8 py-5 bg-gray-50 rounded-[24px] border-2 border-transparent focus:border-secondary focus:bg-white outline-none font-bold text-primary transition-all shadow-inner" 
                    placeholder={isAm ? "ርዕስ ያስገቡ..." : "Enter announcement title..."} 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">{t.category}</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-8 py-5 bg-gray-50 rounded-[24px] border-2 border-transparent focus:border-secondary focus:bg-white outline-none font-bold text-primary transition-all appearance-none cursor-pointer"
                    >
                      <option value="Official">{isAm ? "ይፋዊ" : "Official"}</option>
                      <option value="Alert">{isAm ? "ማስጠንቀቂያ" : "Alert"}</option>
                      <option value="Press Release">{isAm ? "መግለጫ" : "Press Release"}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">{t.status}</label>
                    <div className="flex p-1.5 bg-gray-100 rounded-[24px]">
                      <button 
                        onClick={() => setFormData({...formData, status: 'published'})}
                        className={`flex-1 py-4 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${
                          formData.status === 'published' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-primary'
                        }`}
                      >
                        {t.publish}
                      </button>
                      <button 
                        onClick={() => setFormData({...formData, status: 'draft'})}
                        className={`flex-1 py-4 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${
                          formData.status === 'draft' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-primary'
                        }`}
                      >
                        {t.draft}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">{t.content}</label>
                  <textarea 
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="w-full px-8 py-5 bg-gray-50 rounded-[30px] border-2 border-transparent focus:border-secondary focus:bg-white outline-none font-medium text-primary transition-all h-40 resize-none leading-relaxed" 
                    placeholder={isAm ? "ዝርዝር መግለጫ ይጥቀሱ..." : "Enter full announcement details..."}
                  ></textarea>
                </div>
              </div>

              <div className="p-10 bg-gray-50/80 backdrop-blur-md flex flex-col sm:flex-row justify-end gap-4 border-t border-white">
                <button 
                  onClick={() => setIsAdding(false)}
                  className="px-10 py-5 text-gray-400 font-black uppercase text-xs tracking-widest hover:text-red-500 transition-colors"
                >
                  {isAm ? "ሰርዝ" : "Cancel"}
                </button>
                <button 
                  onClick={handleSave}
                  className="blue-gradient text-white px-12 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-3"
                >
                  <Save className="w-5 h-5" />
                  <span>{editingItem ? t.save : t.publish}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
