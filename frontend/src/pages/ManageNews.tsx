//filepath: frontend/src/pages/ManageNews.tsx
import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import {
  Newspaper,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Image as ImageIcon,
  Calendar,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { apiRequest } from "../lib/api";
import { LoadingSpinner } from "../components/LoadingSpinner";

interface NewsItem {
  id: number;
  title: string;
  titleAm?: string;
  category: string;
  date: string;
  publishedAt?: string;
  summary?: string;
  summaryAm?: string;
  content: string;
  contentAm?: string;
  status: "published" | "draft";
  imageUrl?: string;
}

export const ManageNews = () => {
  const { language } = useLanguage();
  const isAm = language === "am";

  const [news, setNews] = useState<NewsItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [formData, setFormData] = useState<
    Partial<NewsItem & { imageFile?: File }>
  >({
    title: "",
    titleAm: "",
    category: "Official",
    summary: "",
    summaryAm: "",
    content: "",
    contentAm: "",
    status: "published",
    date: new Date().toISOString().split("T")[0],
    imageUrl: "",
    imageFile: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // Expose simple UI indicators for form status

  const normalizeNewsItem = (item: NewsItem, amharic?: { titleAm?: string; summaryAm?: string; contentAm?: string }) => ({
    ...item,
    imageUrl: item.imageUrl || undefined,
    titleAm: amharic?.titleAm || item.titleAm || undefined,
    summaryAm: amharic?.summaryAm || item.summaryAm || undefined,
    contentAm: amharic?.contentAm || item.contentAm || undefined,
    date:
      item.date ||
      (item.publishedAt
        ? new Date(item.publishedAt).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0]),
  });

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiRequest<{ data: NewsItem[] }>("/news/manage");
      setNews(result.data.map((item) => normalizeNewsItem(item as NewsItem)));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : isAm ? "ዜናዎችን መጫን አልተቻለም።" : "Failed to load news items.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [language]);

  const NEWS_CATEGORIES = ["all", "Official", "Alert", "Press Release"] as const;

  const filteredNews = news.filter((item) => {
    const matchesCategory =
      activeCategory === "all" || item.category === activeCategory;
    const title = (item.title ?? "").toLowerCase();
    const titleAm = (item.titleAm ?? "").toLowerCase();
    const content = (item.content ?? "").toLowerCase();
    const contentAm = (item.contentAm ?? "").toLowerCase();
    const q = searchQuery.toLowerCase();
    return (
      matchesCategory &&
      (title.includes(q) ||
        titleAm.includes(q) ||
        content.includes(q) ||
        contentAm.includes(q))
    );
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
    statsTitle: isAm ? "የዜና ስታቲስቲክስ" : "News Stats",
  };

  const handleSave = async () => {
    if (
      !formData.title?.trim() ||
      !formData.titleAm?.trim() ||
      !formData.content?.trim() ||
      !formData.contentAm?.trim()
    ) {
      setError(
        isAm ? "እባክዎ ሁለቱንም የእንግሊዝኛ እና የአማርኛ ርዕስ እና ዝርዝር ይሙሉ።" : "Both English and Amharic title and content are required.",
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let response: { data: NewsItem } | undefined;

      // If there's a selected file, send multipart/form-data
      if (formData.imageFile) {
        const fd = new FormData();
        fd.append("image", formData.imageFile);
        fd.append("title", String(formData.title || ""));
        if (formData.titleAm) fd.append("titleAm", String(formData.titleAm));
        fd.append("category", String(formData.category || "General"));
        if (formData.summary) fd.append("summary", String(formData.summary));
        if (formData.summaryAm) fd.append("summaryAm", String(formData.summaryAm));
        fd.append("content", String(formData.content || ""));
        if (formData.contentAm) fd.append("contentAm", String(formData.contentAm));
        fd.append("status", String(formData.status || "published"));
        if (formData.date) fd.append("publishedAt", String(formData.date));

        if (editingItem) {
          response = await apiRequest<{ data: NewsItem }>(
            `/news/${editingItem.id}`,
            {
              method: "PUT",
              body: fd,
            },
          );
          if (response) {
            setNews((prev) =>
              prev.map((item) =>
                item.id === editingItem.id
                  ? normalizeNewsItem(response!.data, {
                      titleAm: formData.titleAm,
                      summaryAm: formData.summaryAm,
                      contentAm: formData.contentAm,
                    })
                  : item,
              ),
            );
          }
        } else {
          response = await apiRequest<{ data: NewsItem }>("/news", {
            method: "POST",
            body: fd,
          });
          if (response) {
            setNews((prev) => [normalizeNewsItem(response!.data, {
              titleAm: formData.titleAm,
              summaryAm: formData.summaryAm,
              contentAm: formData.contentAm,
            }), ...prev]);
          }
        }
      } else {
        const payload = {
          title: formData.title,
          titleAm: formData.titleAm,
          category: formData.category || "General",
          summary: formData.summary,
          summaryAm: formData.summaryAm,
          content: formData.content,
          contentAm: formData.contentAm,
          imageUrl: formData.imageUrl,
          status: formData.status,
          publishedAt: formData.date,
        };

        if (editingItem) {
          response = await apiRequest<{ data: NewsItem }>(
            `/news/${editingItem.id}`,
            {
              method: "PUT",
              body: JSON.stringify(payload),
            },
          );
          if (response) {
            setNews((prev) =>
              prev.map((item) =>
                item.id === editingItem.id
                  ? normalizeNewsItem(response!.data, {
                      titleAm: formData.titleAm,
                      summaryAm: formData.summaryAm,
                      contentAm: formData.contentAm,
                    })
                  : item,
              ),
            );
          }
        } else {
          response = await apiRequest<{ data: NewsItem }>("/news", {
            method: "POST",
            body: JSON.stringify(payload),
          });
          if (response) {
            setNews((prev) => [normalizeNewsItem(response!.data, {
              titleAm: formData.titleAm,
              summaryAm: formData.summaryAm,
              contentAm: formData.contentAm,
            }), ...prev]);
          }
        }
      }

      setIsAdding(false);
      setEditingItem(null);
      setFormData({
        title: "",
        titleAm: "",
        category: "Official",
        summary: "",
        summaryAm: "",
        content: "",
        contentAm: "",
        status: "published",
        date: new Date().toISOString().split("T")[0],
        imageUrl: "",
        imageFile: undefined,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : isAm ? "ዜናውን ማስቀመጥ አልተቻለም።" : "Failed to save news item.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: NewsItem) => {
    setEditingItem(item);
    setFormData({
      ...item,
      summary: item.summary || "",
      summaryAm: item.summaryAm || "",
      contentAm: item.contentAm || "",
      titleAm: item.titleAm || "",
      date:
        item.date ||
        (item.publishedAt
          ? new Date(item.publishedAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0]),
      imageUrl: item.imageUrl || "",
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        isAm
          ? "ይህንን ዜና በእርግጠኝነት መሰረዝ ይፈልጋሉ?"
          : "Are you sure you want to delete this news item?",
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiRequest(`/news/${id}`, { method: "DELETE" });
      setNews((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : isAm ? "ዜናውን መሰረዝ አልተቻለም።" : "Failed to delete news item.",
      );
    } finally {
      setLoading(false);
    }
  };

  return loading && news.length === 0 ? (
    <LoadingSpinner
      size="lg"
      text={isAm ? "ዜናዎችን በመጫን ላይ..." : "Loading news..."}
      fullPage
    />
  ) : (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary tracking-tight">
            {t.title}
          </h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1">
            {isAm
              ? "የህዝብ ዜናዎችን እና ማስታወቂያዎችን ይቆጣጠሩ"
              : "Manage public news feed and official announcements"}
          </p>
          {error && (
            <div className="mt-4 rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black uppercase tracking-widest text-red-700">
              {error}
            </div>
          )}
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setFormData({
              title: "",
              titleAm: "",
              category: "Official",
              content: "",
              contentAm: "",
              status: "published",
              date: new Date().toISOString().split("T")[0],
              imageUrl: "",
            });
            setIsAdding(true);
          }}
          disabled={loading}
          className={`bg-[#003366] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center space-x-2 shadow-xl shadow-primary/20 hover:bg-[#002244] active:scale-95 transition-all ${
            loading ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>{t.addNew}</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAm ? "ዜና ፈልግ..." : "Search news..."}
            className="w-full pl-16 pr-8 py-5 bg-white rounded-[30px] border border-gray-100 shadow-sm focus:border-secondary focus:ring-4 focus:ring-secondary/5 outline-none font-bold text-sm text-primary transition-all"
          />
        </div>
        <div className="flex items-center space-x-3 overflow-x-auto pb-2 lg:pb-0 custom-scrollbar">
          {NEWS_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-4 rounded-[20px] transition-all font-black uppercase tracking-widest text-[9px] whitespace-nowrap border-2 ${
                cat === activeCategory
                  ? "gold-gradient text-primary border-secondary shadow-lg shadow-secondary/20 scale-105"
                  : "bg-white text-gray-400 border-transparent hover:border-gray-100 hover:text-primary hover:bg-gray-50"
              }`}
            >
              {cat === "all"
                ? isAm
                  ? "ሁሉም"
                  : "All"
                : cat === "Official"
                  ? isAm
                    ? "ይፋዊ"
                    : "Official"
                  : cat === "Alert"
                    ? isAm
                      ? "ማስጠንቀቂያ"
                      : "Alert"
                    : cat === "Press Release"
                      ? isAm
                        ? "መግለጫ"
                        : "Press Release"
                      : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="popLayout">
            {filteredNews.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, x: -20 }}
                className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 group hover:shadow-2xl hover:border-secondary/20 transition-all duration-500"
              >
                <div className="w-full md:w-60 h-44 bg-gray-50 rounded-[20px] flex flex-col items-center justify-center text-gray-300 group-hover:bg-secondary/5 transition-colors relative overflow-hidden border border-dashed border-gray-200 shrink-0">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <>
                      <ImageIcon className="w-12 h-12 mb-2 group-hover:scale-110 transition-transform duration-500" />
                      <span className="text-[8px] font-black uppercase tracking-[0.2em]">
                        {t.uploadImg}
                      </span>
                    </>
                  )}
                </div>
                <div className="flex-grow space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="bg-secondary/10 text-primary px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-secondary/20">
                      {isAm
                        ? item.category === "Official"
                          ? "ይፋዊ"
                          : "ማስጠንቀቂያ"
                        : item.category}
                    </span>
                    <div className="flex items-center space-x-1 text-gray-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold">{item.date}</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-primary tracking-tight group-hover:text-secondary transition-colors line-clamp-1">
                    {isAm && item.titleAm ? item.titleAm : item.title}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed font-medium">
                    {isAm && item.contentAm ? item.contentAm : item.content}
                  </p>
                  {item.summary && item.summaryAm && (
                    <p className="text-xs text-gray-400 font-medium italic line-clamp-2">
                      {isAm ? item.summaryAm : item.summary}
                    </p>
                  )}

                  <div className="flex items-center space-x-3 pt-2">
                    <div
                      className={`w-2 h-2 rounded-full ${item.status === "published" ? "bg-green-500 animate-pulse" : "bg-gray-300"}`}
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      {item.status === "published" ? t.publish : t.draft}
                    </span>
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
              <h3 className="text-2xl font-black tracking-tight">
                {t.statsTitle}
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white/5 p-6 rounded-[24px] border border-white/10">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">
                    {isAm ? "ጠቅላላ" : "Total"}
                  </p>
                  <p className="text-4xl font-black text-secondary">
                    {news.length}
                  </p>
                </div>
                <div className="bg-white/5 p-6 rounded-[24px] border border-white/10">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">
                    {isAm ? "የታተሙ" : "Published"}
                  </p>
                  <p className="text-4xl font-black text-white">
                    {news.filter((n) => n.status === "published").length}
                  </p>
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
                  <h2 className="text-2xl font-black text-primary tracking-tight">
                    {editingItem ? t.edit : t.addNew}
                  </h2>
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
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
                    {isAm ? "ምስል" : "Announcement Image"}
                  </label>
                  <div className="space-y-4">
                    <div
                      onClick={() =>
                        !formData.imageUrl && document.getElementById("news-image-upload")?.click()
                      }
                      className="w-full h-96 bg-gray-50 rounded-[30px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center group hover:bg-secondary/5 hover:border-secondary/40 transition-all cursor-pointer relative overflow-hidden"
                    >
                      {formData.imageUrl ? (
                        <img
                          src={formData.imageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-[28px]"
                        />
                      ) : (
                        <>
                          <ImageIcon className="w-12 h-12 text-gray-300 group-hover:text-secondary group-hover:scale-110 transition-all" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2">
                            {t.uploadImg}
                          </p>
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
                            const previewUrl = URL.createObjectURL(file);
                            setFormData({
                              ...formData,
                              imageUrl: previewUrl,
                              imageFile: file,
                            });
                          }
                        }}
                      />
                    </div>
                    {formData.imageUrl && (
                      <div className="flex items-center justify-center gap-4">
                        <button
                          type="button"
                          onClick={() => document.getElementById("news-image-upload")?.click()}
                          className="px-6 py-3 bg-white text-[#003366] border-2 border-[#003366] rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-all"
                        >
                          {isAm ? "ምስል ቀይር" : "Change Image"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              imageUrl: "",
                              imageFile: undefined,
                            });
                          }}
                          className="px-6 py-3 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-red-600 hover:scale-105 transition-all flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          {isAm ? "አስወግድ" : "Remove"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Image URL field removed — uploading via the image picker above */}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
                    {isAm ? "ርዕስ (እንግሊዝኛ)" : "Title (English)"}
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-8 py-5 bg-gray-50 rounded-[24px] border-2 border-transparent focus:border-secondary focus:bg-white outline-none font-bold text-primary transition-all shadow-inner"
                    placeholder={
                      isAm ? "ርዕስ ያስገቡ (እንግሊዝኛ)" : "Enter announcement title..."
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
                    {isAm ? "ርዕስ (አማርኛ)" : "Title (Amharic)"}
                  </label>
                  <input
                    type="text"
                    value={formData.titleAm || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, titleAm: e.target.value })
                    }
                    className="w-full px-8 py-5 bg-gray-50 rounded-[24px] border-2 border-dashed border-gray-200 focus:border-secondary focus:bg-white outline-none font-bold text-primary transition-all shadow-inner"
                    placeholder={
                      isAm ? "ርዕስ ያስገቡ (አማርኛ)" : "Enter announcement title (Amharic)..."
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
                      {t.category}
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full px-8 py-5 bg-gray-50 rounded-[24px] border-2 border-transparent focus:border-secondary focus:bg-white outline-none font-bold text-primary transition-all appearance-none cursor-pointer"
                    >
                      <option value="Official">
                        {isAm ? "ይፋዊ" : "Official"}
                      </option>
                      <option value="Alert">
                        {isAm ? "ማስጠንቀቂያ" : "Alert"}
                      </option>
                      <option value="Press Release">
                        {isAm ? "መግለጫ" : "Press Release"}
                      </option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
                      {t.status}
                    </label>
                    <div className="flex p-1.5 bg-gray-100 rounded-[24px]">
                      <button
                        onClick={() =>
                          setFormData({ ...formData, status: "published" })
                        }
                        className={`flex-1 py-4 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${
                          formData.status === "published"
                            ? "bg-white text-primary shadow-sm"
                            : "text-gray-400 hover:text-primary"
                        }`}
                      >
                        {t.publish}
                      </button>
                      <button
                        onClick={() =>
                          setFormData({ ...formData, status: "draft" })
                        }
                        className={`flex-1 py-4 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${
                          formData.status === "draft"
                            ? "bg-white text-primary shadow-sm"
                            : "text-gray-400 hover:text-primary"
                        }`}
                      >
                        {t.draft}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
                      {isAm ? "ማጠቃለያ (እንግሊዝኛ)" : "Summary (English)"}
                    </label>
                    <textarea
                      value={formData.summary}
                      onChange={(e) =>
                        setFormData({ ...formData, summary: e.target.value })
                      }
                      className="w-full px-8 py-5 bg-gray-50 rounded-[30px] border-2 border-transparent focus:border-secondary focus:bg-white outline-none font-medium text-primary transition-all h-28 resize-none leading-relaxed"
                      placeholder={
                        isAm ? "ማጠቃለያ ያስገቡ (እንግሊዝኛ)" : "Enter a brief summary..."
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
                      {isAm ? "ማጠቃለያ (አማርኛ)" : "Summary (Amharic)"}
                    </label>
                    <textarea
                      value={formData.summaryAm || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, summaryAm: e.target.value })
                      }
                      className="w-full px-8 py-5 bg-gray-50 rounded-[30px] border-2 border-dashed border-gray-200 focus:border-secondary focus:bg-white outline-none font-medium text-primary transition-all h-28 resize-none leading-relaxed"
                      placeholder={
                        isAm ? "ማጠቃለያ ያስገቡ (አማርኛ)" : "Enter a brief summary (Amharic)..."
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
                      {isAm ? "ዝርዝር (እንግሊዝኛ)" : "Content (English)"}
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      className="w-full px-8 py-5 bg-gray-50 rounded-[30px] border-2 border-transparent focus:border-secondary focus:bg-white outline-none font-medium text-primary transition-all h-40 resize-none leading-relaxed"
                      placeholder={
                        isAm
                          ? "ዝርዝር መግለጫ ይጥቀሱ (እንግሊዝኛ)..."
                          : "Enter full announcement details..."
                      }
                    ></textarea>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
                      {isAm ? "ዝርዝር (አማርኛ)" : "Content (Amharic)"}
                    </label>
                    <textarea
                      value={formData.contentAm || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, contentAm: e.target.value })
                      }
                      className="w-full px-8 py-5 bg-gray-50 rounded-[30px] border-2 border-dashed border-gray-200 focus:border-secondary focus:bg-white outline-none font-medium text-primary transition-all h-40 resize-none leading-relaxed"
                      placeholder={
                        isAm
                          ? "ዝርዝር መግለጫ ይጥቀሱ (አማርኛ)..."
                          : "Enter full announcement details (Amharic)..."
                      }
                    ></textarea>
                  </div>
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
