//filepath: frontend/src/pages/ManageFAQ.tsx
import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import {
  HelpCircle,
  Plus,
  Trash2,
  Edit,
  Save,
  Search,
  GripVertical,
  X,
  Eye,
} from "lucide-react";
import { motion, Reorder, AnimatePresence } from "motion/react";
import { apiRequest } from "../lib/api";
import { AutoDismissToast, ToastType } from "../components/AutoDismissToast";
import { ConfirmDialog } from "../components/ConfirmDialog";

type FaqRow = {
  id: number;
  q: string;
  a: string;
  qAm?: string;
  aAm?: string;
  cat: string;
  isPublished: boolean;
  hitCount: number;
};

type FaqApiRow = {
  id: number;
  categoryType: string;
  questionText: string;
  answerText: string;
  questionTextAm?: string;
  answerTextAm?: string;
  isPublished: boolean;
  hitCount?: number;
};

const FAQ_CATEGORIES = [
  "all",
  "general",
  "licensing",
  "technical",
  "payment",
] as const;

const normalizeCategory = (value: string) => value.trim().toLowerCase();

const mapFaqFromApi = (faq: FaqApiRow): FaqRow => ({
  id: faq.id,
  q: faq.questionText,
  a: faq.answerText,
  qAm: faq.questionTextAm || undefined,
  aAm: faq.answerTextAm || undefined,
  cat: normalizeCategory(faq.categoryType || "general"),
  isPublished: Boolean(faq.isPublished),
  hitCount: faq.hitCount ?? 0,
});

const toFaqPayload = (faq: {
  q: string;
  a: string;
  qAm?: string;
  aAm?: string;
  cat: string;
  isPublished: boolean;
}) => ({
  categoryType: faq.cat,
  questionText: faq.q,
  answerText: faq.a,
  questionTextAm: faq.qAm || null,
  answerTextAm: faq.aAm || null,
  isPublished: faq.isPublished,
});

export const ManageFAQ = () => {
  const { language, t } = useLanguage();
  const isAm = language === "am";

  const [faqs, setFaqs] = useState<FaqRow[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqRow | null>(null);
  const [formData, setFormData] = useState({
    q: "",
    a: "",
    qAm: "",
    aAm: "",
    cat: "general",
    isPublished: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toastState, setToastState] = useState<{
    isOpen: boolean;
    type: ToastType;
    message: string;
  }>({
    isOpen: false,
    type: "success",
    message: "",
  });
  const [deleteTarget, setDeleteTarget] = useState<FaqRow | null>(null);

  const categories = t.faq.categories;

  const loadFaqs = async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await apiRequest<{
        success: boolean;
        data: FaqApiRow[];
      }>("/faqs/manage");
      setFaqs((response.data || []).map(mapFaqFromApi));
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Failed to load FAQs.",
      );
      setFaqs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadFaqs();
  }, []);

  const filteredFaqs = faqs.filter((faq: any) => {
    const matchesCategory =
      activeCategory === "all" || faq.cat === activeCategory;
    const question = String(faq.q ?? "").toLowerCase();
    const answer = String(faq.a ?? "").toLowerCase();
    const questionAm = String(faq.qAm ?? "").toLowerCase();
    const answerAm = String(faq.aAm ?? "").toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      question.includes(query) ||
      answer.includes(query) ||
      questionAm.includes(query) ||
      answerAm.includes(query);
    return matchesCategory && matchesSearch;
  });

  const showToast = (type: ToastType, message: string) => {
    setToastState({
      isOpen: true,
      type,
      message,
    });
  };

  const closeToast = () => {
    setToastState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleGlobalSave = async () => {
    await loadFaqs();
    showToast(
      "success",
      isAm ? "FAQ ዝርዝር ተሻሽሏል" : "FAQ list refreshed successfully",
    );
  };

  const labels = {
    title: isAm ? "በተደጋጋሚ የሚነሱ ጥያቄዎች አስተዳደር" : "FAQ Management",
    subtitle: isAm
      ? "በድረ-ገጹ ላይ የሚታዩ ጥያቄዎችን እና መልሶችን ያቀናብሩ"
      : "Manage questions and answers displayed on the public FAQ page",
    addBtn: isAm ? "አዲስ ጥያቄ ጨምር" : "Add New Question",
    saveAll: isAm ? "ሁሉንም አስቀምጥ" : "Save All Changes",
    unsaved: isAm ? "ያልተቀመጡ ለውጦች አሉ" : "Unsaved Changes",
    saveDesc: isAm
      ? "ለውጦቹን ለማጽደቅ አስቀምጥ የሚለውን ይጫኑ"
      : "Make sure to save after re-ordering or editing",
    edit: isAm ? "አስተካክል" : "Edit",
    delete: isAm ? "ሰርዝ" : "Delete",
    question: isAm ? "ጥያቄ" : "Question",
    answer: isAm ? "መልስ" : "Answer",
    category: isAm ? "ምድብ" : "Category",
    published: isAm ? "ተለጥፏል" : "Published",
    cancel: isAm ? "ሰርዝ" : "Cancel",
    save: isAm ? "አስቀምጥ" : "Save",
    searchPlaceholder: isAm ? "ጥያቄዎችን ፈልግ..." : "Search questions...",
    noResults: isAm ? "ምንም ጥያቄ አልተገኘም" : "No FAQs found matching your criteria",
    loading: isAm ? "FAQ በመጫን ላይ..." : "Loading FAQs...",
    loadError: isAm ? "FAQ ማምጣት አልተሳካም" : "Failed to load FAQs",
  };

  const handleSave = async () => {
    if (!formData.q.trim() || !formData.a.trim() || !formData.qAm.trim() || !formData.aAm.trim()) {
      showToast(
        "error",
        isAm ? "እንግሊዝኛ እና አማርኛ ጥያቄና መልስ መሙላት ያስፈልጋል" : "Both English and Amharic question & answer are required",
      );
      return;
    }

    try {
      if (editingFaq) {
        const response = await apiRequest<{
          success: boolean;
          data: FaqApiRow;
        }>(`/faqs/${editingFaq.id}`, {
          method: "PUT",
          body: JSON.stringify(toFaqPayload(formData)),
        });
        const updatedFaq = mapFaqFromApi(response.data);
        setFaqs((prev) =>
          prev.map((f) => (f.id === editingFaq.id ? updatedFaq : f)),
        );
      } else {
        const response = await apiRequest<{
          success: boolean;
          data: FaqApiRow;
        }>("/faqs", {
          method: "POST",
          body: JSON.stringify(toFaqPayload(formData)),
        });
        const createdFaq = mapFaqFromApi(response.data);
        setFaqs((prev) => [createdFaq, ...prev]);
      }

      setIsAdding(false);
      setEditingFaq(null);
      setFormData({ q: "", a: "", qAm: "", aAm: "", cat: "general", isPublished: true });
      showToast(
        "success",
        isAm ? "FAQ በተሳካ ሁኔታ ተቀምጧል" : "FAQ saved successfully",
      );
    } catch (error) {
      showToast(
        "error",
        error instanceof Error
          ? error.message
          : isAm
            ? "FAQ ማስቀመጥ አልተሳካም"
            : "Failed to save FAQ",
      );
    }
  };

  const handleEdit = (faq: any) => {
    setEditingFaq(faq);
    setFormData({
      q: faq.q,
      a: faq.a,
      qAm: faq.qAm || "",
      aAm: faq.aAm || "",
      cat: faq.cat,
      isPublished: faq.isPublished,
    });
    setIsAdding(true);
  };

  const handleDelete = async (faq: FaqRow) => {
    try {
      await apiRequest(`/faqs/${faq.id}`, {
        method: "DELETE",
      });
      setFaqs((prev) => prev.filter((f) => f.id !== faq.id));
      setDeleteTarget(null);
      showToast("success", isAm ? "FAQ ተሰርዟል" : "FAQ deleted successfully");
    } catch (error) {
      setDeleteTarget(null);
      showToast(
        "error",
        error instanceof Error
          ? error.message
          : isAm
            ? "FAQ ማስወገድ አልተሳካም"
            : "Failed to delete FAQ",
      );
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary tracking-tight">
            {labels.title}
          </h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1">
            {labels.subtitle}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingFaq(null);
            setFormData({ q: "", a: "", qAm: "", aAm: "", cat: "general", isPublished: true });
            setIsAdding(true);
          }}
          className="bg-[#003366] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center space-x-2 shadow-xl shadow-primary/20 hover:bg-[#002244] active:scale-95 transition-all"
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
          {FAQ_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-4 rounded-[20px] transition-all font-black uppercase tracking-widest text-[9px] whitespace-nowrap border-2 ${
                cat === activeCategory
                  ? "gold-gradient text-primary border-secondary shadow-lg shadow-secondary/20 scale-105"
                  : "bg-white text-gray-400 border-transparent hover:border-gray-100 hover:text-primary hover:bg-gray-50"
              }`}
            >
              {cat === "all" ? (isAm ? "ሁሉም" : "All") : categories[cat]}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6 animate-pulse">
              <Search className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-primary mb-2">
              {labels.loading}
            </h3>
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-300 mb-6">
              <Search className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-primary mb-2">
              {labels.loadError}
            </h3>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
              {loadError}
            </p>
            <button
              onClick={() => void loadFaqs()}
              className="mt-6 px-6 py-3 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest"
            >
              Retry
            </button>
          </div>
        ) : filteredFaqs.length > 0 ? (
          <Reorder.Group
            axis="y"
            values={faqs}
            onReorder={setFaqs}
            className="space-y-4"
          >
            {filteredFaqs.map((faq: any) => (
              <Reorder.Item
                key={faq.id}
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
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${faq.isPublished ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}
                      >
                        {faq.isPublished
                          ? isAm
                            ? "ታይቷል"
                            : "Published"
                          : isAm
                            ? "የተደበቀ"
                            : "Draft"}
                      </span>
                      <div className="ml-3 inline-flex items-center space-x-2 text-xs text-gray-500">
                        <Eye className="w-4 h-4" />
                        <span className="font-black">{faq.hitCount}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleEdit(faq)}
                        className="p-3 bg-white text-gray-400 hover:text-primary hover:border-primary border border-gray-100 rounded-xl transition-all shadow-sm group/btn"
                      >
                        <Edit className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(faq)}
                        className="p-3 bg-white text-red-400 hover:text-white hover:bg-red-500 border border-gray-100 rounded-xl transition-all shadow-sm group/btn"
                      >
                        <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-primary tracking-tight mb-3 group-hover:text-secondary transition-colors">
                      {isAm && faq.qAm ? faq.qAm : faq.q}
                    </h4>
                    <p className="text-gray-500 text-sm font-medium leading-relaxed bg-white/50 p-4 rounded-2xl border border-gray-50 italic">
                      {isAm && faq.aAm ? faq.aAm : faq.a}
                    </p>
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
            <h3 className="text-xl font-black text-primary mb-2">
              {labels.noResults}
            </h3>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
              Try adjusting your filters or search terms
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-[#003366] to-[#001F3F] rounded-[40px] p-8 text-white relative overflow-hidden group md:col-span-2">
          <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/10 rounded-full blur-[80px] -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-1000" />
          <div className="relative z-10 space-y-4">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-secondary shadow-lg border border-white/20">
              <HelpCircle className="w-7 h-7" />
            </div>
            <div>
              <p className="text-3xl font-black tracking-tight">{faqs.length}</p>
              <p className="text-sm font-bold text-white/60 uppercase tracking-widest">
                {isAm ? "ጠቅላላ ጥያቄዎች" : "Total FAQs"}
              </p>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <div>
                <span className="text-secondary font-black">{faqs.filter(f => f.isPublished).length}</span>
                <span className="text-white/40 ml-1.5">{isAm ? "የታተሙ" : "Published"}</span>
              </div>
              <div>
                <span className="text-white font-black">{faqs.filter(f => !f.isPublished).length}</span>
                <span className="text-white/40 ml-1.5">{isAm ? "ረቂቅ" : "Draft"}</span>
              </div>
              <div>
                <span className="text-secondary font-black">{faqs.reduce((s, f) => s + f.hitCount, 0)}</span>
                <span className="text-white/40 ml-1.5">{isAm ? "እይታዎች" : "Views"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-[60px] -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
          <div className="relative z-10 space-y-4">
            <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary shadow-sm">
              <Eye className="w-7 h-7" />
            </div>
            <p className="text-3xl font-black text-primary tracking-tight">{faqs.reduce((s, f) => s + f.hitCount, 0)}</p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {isAm ? "ጠቅላላ እይታዎች" : "Total Views"}
            </p>
          </div>
          <div className="mt-6 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (faqs.reduce((s, f) => s + f.hitCount, 0) / 500) * 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-secondary to-amber-600 rounded-[40px] p-8 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[60px] -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
          <div className="relative z-10 space-y-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg border border-white/20">
              <Save className="w-7 h-7" />
            </div>
            <p className="text-lg font-black tracking-tight leading-tight">
              {isAm ? "ሁሉንም ለውጦች ያስቀምጡ" : "Save All Changes"}
            </p>
            <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest leading-relaxed">
              {isAm ? "የተደረጉ ለውጦችን ለማስቀመጥ አስቀምጥ የሚለውን ይጫኑ" : "Click to persist any changes made above"}
            </p>
            <button
              onClick={handleGlobalSave}
              className="bg-white text-primary px-8 py-4 rounded-[20px] font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all w-full"
            >
              {isAm ? "አስቀምጥ" : "Save All"}
            </button>
          </div>
        </div>
      </div>

      <AutoDismissToast
        isOpen={toastState.isOpen}
        type={toastState.type}
        message={toastState.message}
        onClose={closeToast}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            void handleDelete(deleteTarget);
          }
        }}
        title={isAm ? "FAQ ማስወገድ" : "Delete FAQ"}
        message={
          isAm
            ? "ይህንን FAQ እርግጠኛ ሆነው ማስወገድ ይፈልጋሉ?"
            : "Are you sure you want to permanently delete this FAQ?"
        }
        type="delete"
        isLoading={false}
      />

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
                  <h2 className="text-xl font-black text-primary tracking-tight">
                    {editingFaq ? labels.edit : labels.addBtn}
                  </h2>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                    Manage public knowledge base
                  </p>
                </div>
                <button
                  onClick={() => setIsAdding(false)}
                  className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
                    {labels.question} (English)
                  </label>
                  <input
                    type="text"
                    value={formData.q}
                    onChange={(e) =>
                      setFormData({ ...formData, q: e.target.value })
                    }
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-secondary focus:bg-white outline-none font-bold text-sm text-primary transition-all shadow-inner"
                    placeholder={
                      isAm ? "ጥያቄውን እዚህ ያስገቡ..." : "Enter question..."
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
                    {labels.question} (Amharic)
                  </label>
                  <input
                    type="text"
                    value={formData.qAm}
                    onChange={(e) =>
                      setFormData({ ...formData, qAm: e.target.value })
                    }
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 focus:border-secondary focus:bg-white outline-none font-bold text-sm text-primary transition-all shadow-inner"
                    placeholder="ጥያቄውን በአማርኛ ያስገቡ..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
                    {labels.category}
                  </label>
                  <select
                    value={formData.cat}
                    onChange={(e) =>
                      setFormData({ ...formData, cat: e.target.value })
                    }
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-secondary focus:bg-white outline-none font-bold text-sm text-primary transition-all appearance-none cursor-pointer"
                  >
                    {Object.entries(categories).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value as string}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
                    Views
                  </label>
                  <div className="px-6 py-4 bg-gray-50 rounded-2xl border border-transparent text-sm font-bold text-gray-700 inline-flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span>{editingFaq ? editingFaq.hitCount : 0}</span>
                  </div>
                </div>
                <label className="flex items-center space-x-3 px-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isPublished: e.target.checked,
                      })
                    }
                    className="h-5 w-5 rounded border-gray-300 text-secondary focus:ring-secondary"
                  />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {labels.published}
                  </span>
                </label>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
                    {labels.answer} (English)
                  </label>
                  <textarea
                    value={formData.a}
                    onChange={(e) =>
                      setFormData({ ...formData, a: e.target.value })
                    }
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-secondary focus:bg-white outline-none font-medium text-xs text-primary transition-all h-32 resize-none leading-relaxed"
                    placeholder={isAm ? "መልሱን እዚህ ይጻፉ..." : "Enter answer..."}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
                    {labels.answer} (Amharic)
                  </label>
                  <textarea
                    value={formData.aAm}
                    onChange={(e) =>
                      setFormData({ ...formData, aAm: e.target.value })
                    }
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 focus:border-secondary focus:bg-white outline-none font-medium text-xs text-primary transition-all h-32 resize-none leading-relaxed"
                    placeholder="መልሱን በአማርኛ ይጻፉ..."
                  />
                </div>
              </div>
              <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end items-center space-x-3 shrink-0">
                <button
                  onClick={() => setIsAdding(false)}
                  className="px-6 py-3 text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-primary transition-colors"
                >
                  {labels.cancel}
                </button>
                <button
                  onClick={() => void handleSave()}
                  className="blue-gradient text-white px-10 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
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
