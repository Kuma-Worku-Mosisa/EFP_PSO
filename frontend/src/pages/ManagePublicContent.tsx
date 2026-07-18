import React, { useState, useMemo } from "react";
import { useLanguage } from "../context/LanguageContext";
import {
  FileText,
  Trash2,
  Download,
  Search,
  FileUp,
  Shield,
  Gavel,
  X,
  Eye,
  Edit2,
  Check,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PublicDocument {
  id: number;
  title: string;
  type: "Regulation" | "Policy" | "Manual" | "Form";
  version: string;
  date: string;
  fileSize: string;
  description?: string;
}

export const ManagePublicContent = () => {
  const { language } = useLanguage();
  const isAm = language === "am";

  const [documents, setDocuments] = useState<PublicDocument[]>([
    {
      id: 1,
      title: isAm
        ? "የግል ጥበቃ ድርጅቶች መመሪያ"
        : "Private Security Organization Directive",
      type: "Regulation",
      version: "v2.1",
      date: "2024-01-15",
      fileSize: "2.4 MB",
      description: isAm
        ? "ይህ መመሪያ  የግል ጥበቃ ድርጅቶችን አሰራር እና አስተዳደር ይወስናል"
        : "This directive determines the operation and management of private security Organization.",
    },
    {
      id: 2,
      title: isAm ? "የሰራተኞች የባህሪ ደንብ" : "Code of Conduct for Personnel",
      type: "Policy",
      version: "v1.0",
      date: "2023-11-20",
      fileSize: "1.1 MB",
      description: isAm
        ? "የደህንነት ሰራተኞች ሊከተሏቸው የሚገቡ የባህሪ እና የስነ-ምግባር ደንቦች"
        : "Behavioral and ethical rules that security personnel must follow.",
    },
    {
      id: 3,
      title: isAm
        ? "የማመልከቻ ቅጽ - የንብረት ጥበቃ"
        : "Application Form - Asset Guarding",
      type: "Form",
      version: "2024",
      date: "2024-02-01",
      fileSize: "450 KB",
      description: isAm
        ? "ለንብረት ጥበቃ አገልግሎት ፈቃድ ለማግኘት የሚያገለግል ቅጽ"
        : "Form used to obtain a license for asset guarding services.",
    },
    {
      id: 4,
      title: isAm ? "የአደጋ ጊዜ ዝግጁነት ማኑዋል" : "Emergency Preparedness Manual",
      type: "Manual",
      version: "v3.0",
      date: "2024-03-10",
      fileSize: "5.2 MB",
      description: isAm
        ? "ለአደጋ ጊዜ ሁኔታዎች ዝግጅት እና ምላሽ አሰጣጥ መመሪያ"
        : "Guidelines for preparation and response to emergency situations.",
    },
  ]);

  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [editingDoc, setEditingDoc] = useState<PublicDocument | null>(null);
  const [previewingDoc, setPreviewingDoc] = useState<PublicDocument | null>(
    null,
  );
  const [newDoc, setNewDoc] = useState({
    title: "",
    type: "Regulation" as const,
    description: "",
  });

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "regulations" && doc.type === "Regulation") ||
        (activeFilter === "forms" && doc.type === "Form") ||
        (activeFilter === "manuals" && doc.type === "Manual") ||
        (activeFilter === "policies" && doc.type === "Policy");

      const matchesSearch =
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.type.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [documents, activeFilter, searchQuery]);

  const t = {
    title: isAm
      ? "የሰነዶች እና መመሪያዎች አስተዳደር"
      : "Documents & Regulations Management",
    upload: isAm ? "አዲስ ስቀል" : "Upload New Document",
    search: isAm ? "ሰነድ ይፈልጉ..." : "Search documents...",
    regulations: isAm ? "መመሪያዎች" : "Regulations",
    forms: isAm ? "ቅጾች" : "Forms",
    manuals: isAm ? "ማኑዋሎች" : "Manuals",
    policies: isAm ? "ፖሊሲዎች" : "Policies",
    docName: isAm ? "የሰነድ ስም" : "Document Name",
    type: isAm ? "ዓይነት" : "Type",
    version: isAm ? "ዝርዝር" : "Version",
    date: isAm ? "የተጫነበት ቀን" : "Upload Date",
    actions: isAm ? "ተግባራት" : "Actions",
    all: isAm ? "ሁሉም" : "All",
    cancel: isAm ? "ሰርዝ" : "Cancel",
    confirm: isAm ? "አረጋግጥ" : "Confirm",
    edit: isAm ? "አስተካክል" : "Edit Document",
    preview: isAm ? "ቅድመ እይታ" : "Preview",
    description: isAm ? "መግለጫ" : "Description",
    save: isAm ? "መዝግብ" : "Save Changes",
  };

  const handleUpload = () => {
    if (!newDoc.title) return;
    const doc: PublicDocument = {
      id: Date.now(),
      title: newDoc.title,
      type: newDoc.type,
      fileSize: "1.2 MB",
      version: "v1.0",
      date: new Date().toISOString().split("T")[0],
      description: newDoc.description,
    };
    setDocuments([doc, ...documents]);
    setIsUploading(false);
    setNewDoc({ title: "", type: "Regulation", description: "" });
  };

  const handleEdit = () => {
    if (!editingDoc) return;
    setDocuments((prev) =>
      prev.map((d) => (d.id === editingDoc.id ? editingDoc : d)),
    );
    setEditingDoc(null);
  };

  const handleDelete = (id: number) => {
    // Custom attractive confirmation would be better but keeping consistency
    if (
      confirm(
        isAm
          ? "ይህንን ሰነድ በእርግጠኝነት መሰረዝ ይፈልጋሉ?"
          : "Are you sure you want to delete this document?",
      )
    ) {
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary tracking-tight">
            {t.title}
          </h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1">
            {isAm
              ? "የህዝብ ሰነዶችን እና የህግ መመሪያዎችን ያቀናብሩ"
              : "Control public access documents and legal regulations"}
          </p>
        </div>
        <button
          onClick={() => setIsUploading(true)}
          className="gold-gradient text-primary px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center space-x-2 shadow-xl shadow-secondary/20 hover:scale-105 active:scale-95 transition-all"
        >
          <FileUp className="w-4 h-4" />
          <span>{t.upload}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: <Gavel />,
            label: isAm ? "ደንቦች" : "Regulations",
            count: documents.filter((d) => d.type === "Regulation").length,
            color: "bg-blue-50 text-blue-600",
          },
          {
            icon: <Shield />,
            label: isAm ? "ፖሊሲዎች" : "Policies",
            count: documents.filter((d) => d.type === "Policy").length,
            color: "bg-green-50 text-green-600",
          },
          {
            icon: <FileText />,
            label: isAm ? "ቅጾች" : "Forms",
            count: documents.filter((d) => d.type === "Form").length,
            color: "bg-amber-50 text-amber-600",
          },
          {
            icon: <Download />,
            label: isAm ? "ጠቅላላ ሰነዶች" : "Total Documents",
            count: documents.length,
            color: "bg-purple-50 text-purple-600",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center space-x-4 hover:shadow-lg transition-shadow"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}
            >
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                {stat.label}
              </p>
              <p className="text-xl font-black text-primary">
                {stat.count} {isAm ? "ፋይሎች" : "Files"}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-gray-50 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search}
              className="w-full pl-14 pr-6 py-4 bg-gray-50 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-secondary/10 transition-all font-bold text-sm text-primary"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: t.all },
              { id: "regulations", label: t.regulations },
              { id: "policies", label: t.policies },
              { id: "forms", label: t.forms },
              { id: "manuals", label: t.manuals },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeFilter === cat.id
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {t.docName}
                </th>
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {t.type}
                </th>
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {t.version}
                </th>
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {t.date}
                </th>
                <th className="px-8 py-6 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {t.actions}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredDocuments.map((doc) => (
                <tr
                  key={doc.id}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-black text-primary tracking-tight">
                          {doc.title}
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">
                          {doc.fileSize}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                        doc.type === "Regulation"
                          ? "bg-red-50 text-red-600 border border-red-100"
                          : doc.type === "Policy"
                            ? "bg-green-50 text-green-600 border border-green-100"
                            : doc.type === "Form"
                              ? "bg-amber-50 text-amber-600 border border-amber-100"
                              : "bg-purple-50 text-purple-600 border border-purple-100"
                      }`}
                    >
                      {isAm
                        ? doc.type === "Regulation"
                          ? "መመሪያ"
                          : doc.type === "Policy"
                            ? "ፖሊሲ"
                            : doc.type === "Form"
                              ? "ቅጽ"
                              : "ማኑዋል"
                        : doc.type}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-[10px] font-black text-primary/60">
                    {doc.version}
                  </td>
                  <td className="px-8 py-6 text-[10px] font-black text-gray-400">
                    {doc.date}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => setPreviewingDoc(doc)}
                        className="p-3 text-blue-400 hover:text-white hover:bg-blue-500 rounded-xl transition-all shadow-sm border border-transparent hover:border-blue-100"
                        title={t.preview}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingDoc(doc)}
                        className="p-3 text-amber-400 hover:text-white hover:bg-amber-500 rounded-xl transition-all shadow-sm border border-transparent hover:border-amber-100"
                        title={t.edit}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-3 text-red-400 hover:text-white hover:bg-red-500 rounded-xl transition-all shadow-sm border border-transparent hover:border-red-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDocuments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="max-w-xs mx-auto space-y-4">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                        <Search className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                        {isAm
                          ? "ምንም ሰነድ አልተገኘም"
                          : "No documents match your search"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploading && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-primary/20 backdrop-blur-xl"
              onClick={() => setIsUploading(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl relative z-10 overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-gray-50 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-xl font-black text-primary tracking-tight">
                    {t.upload}
                  </h2>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                    Add to public repository
                  </p>
                </div>
                <button
                  onClick={() => setIsUploading(false)}
                  className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8 space-y-5 overflow-y-auto max-h-[70vh] custom-scrollbar">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">
                    {t.docName}
                  </label>
                  <input
                    type="text"
                    value={newDoc.title}
                    onChange={(e) =>
                      setNewDoc({ ...newDoc, title: e.target.value })
                    }
                    className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-secondary focus:bg-white outline-none font-bold text-sm text-primary transition-all shadow-inner"
                    placeholder={isAm ? "የሰነድ ስም ያስገቡ..." : "Enter title..."}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">
                    {t.type}
                  </label>
                  <select
                    value={newDoc.type}
                    onChange={(e) =>
                      setNewDoc({ ...newDoc, type: e.target.value as any })
                    }
                    className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-secondary focus:bg-white outline-none font-bold text-sm text-primary transition-all appearance-none cursor-pointer"
                  >
                    <option value="Regulation">
                      {isAm ? "መመሪያ" : "Regulation"}
                    </option>
                    <option value="Policy">{isAm ? "ፖሊሲ" : "Policy"}</option>
                    <option value="Form">{isAm ? "ቅጽ" : "Form"}</option>
                    <option value="Manual">{isAm ? "ማኑዋል" : "Manual"}</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">
                    {t.description}
                  </label>
                  <textarea
                    value={newDoc.description}
                    onChange={(e) =>
                      setNewDoc({ ...newDoc, description: e.target.value })
                    }
                    className="w-full px-5 py-3 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-secondary focus:bg-white outline-none font-bold text-xs text-primary transition-all shadow-inner h-20 resize-none leading-relaxed"
                    placeholder={
                      isAm ? "መግለጫ እዚህ ያስገቡ..." : "Enter document summary..."
                    }
                  />
                </div>
                <div className="w-full py-8 bg-gray-50 rounded-[30px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:bg-white hover:border-secondary transition-all cursor-pointer group">
                  <div className="p-3 bg-white rounded-2xl shadow-sm mb-3 group-hover:scale-110 transition-transform">
                    <FileUp className="w-6 h-6 text-secondary" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    {isAm ? "ፋይል ለመምረጥ እዚህ ይጫኑ" : "Select or Drop File"}
                  </span>
                </div>
              </div>
              <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end items-center space-x-3 shrink-0">
                <button
                  onClick={() => setIsUploading(false)}
                  className="px-6 py-3 text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-primary transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleUpload}
                  className="blue-gradient text-white px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-[0.1em] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                  {t.confirm}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingDoc && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-primary/20 backdrop-blur-xl"
              onClick={() => setEditingDoc(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl relative z-10 overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-gray-50 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-xl font-black text-primary tracking-tight">
                    {t.edit}
                  </h2>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                    Modify document properties
                  </p>
                </div>
                <button
                  onClick={() => setEditingDoc(null)}
                  className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8 space-y-5 overflow-y-auto max-h-[70vh] custom-scrollbar">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">
                    {t.docName}
                  </label>
                  <input
                    type="text"
                    value={editingDoc.title}
                    onChange={(e) =>
                      setEditingDoc({ ...editingDoc, title: e.target.value })
                    }
                    className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-amber-500 focus:bg-white outline-none font-bold text-sm text-primary transition-all shadow-inner"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">
                    {t.description}
                  </label>
                  <textarea
                    value={editingDoc.description}
                    onChange={(e) =>
                      setEditingDoc({
                        ...editingDoc,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-5 py-3 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-amber-500 focus:bg-white outline-none font-bold text-xs text-primary transition-all shadow-inner h-20 resize-none leading-relaxed"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">
                      {t.type}
                    </label>
                    <select
                      value={editingDoc.type}
                      onChange={(e) =>
                        setEditingDoc({
                          ...editingDoc,
                          type: e.target.value as any,
                        })
                      }
                      className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-amber-500 focus:bg-white outline-none font-bold text-sm text-primary transition-all appearance-none cursor-pointer"
                    >
                      <option value="Regulation">
                        {isAm ? "መመሪያ" : "Regulation"}
                      </option>
                      <option value="Policy">{isAm ? "ፖሊሲ" : "Policy"}</option>
                      <option value="Form">{isAm ? "ቅጽ" : "Form"}</option>
                      <option value="Manual">{isAm ? "ማኑዋል" : "Manual"}</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">
                      {t.version}
                    </label>
                    <input
                      type="text"
                      value={editingDoc.version}
                      onChange={(e) =>
                        setEditingDoc({
                          ...editingDoc,
                          version: e.target.value,
                        })
                      }
                      className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-amber-500 focus:bg-white outline-none font-bold text-sm text-primary transition-all shadow-inner"
                    />
                  </div>
                </div>
              </div>
              <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end items-center space-x-3 shrink-0">
                <button
                  onClick={() => setEditingDoc(null)}
                  className="px-6 py-3 text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-primary transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleEdit}
                  className="bg-amber-500 text-white px-10 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{t.save}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewingDoc && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-primary/20 backdrop-blur-xl"
              onClick={() => setPreviewingDoc(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="bg-white w-full max-w-lg h-[85vh] rounded-[50px] shadow-2xl relative z-10 overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-blue-50/50 shrink-0">
                <div className="flex items-center space-x-6">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-blue-600">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-primary tracking-tight leading-tight line-clamp-1">
                      {previewingDoc.title}
                    </h2>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-100/50 px-3 py-1 rounded-full">
                        {previewingDoc.type}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                        {previewingDoc.version}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewingDoc(null)}
                  className="p-4 bg-white rounded-2xl hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-all shadow-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto bg-gray-100/50 p-8">
                <div className="space-y-6">
                  {/* Metadata Row */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">
                        {t.date}
                      </p>
                      <p className="text-xs font-black text-primary">
                        {previewingDoc.date}
                      </p>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">
                        Size
                      </p>
                      <p className="text-xs font-black text-primary">
                        {previewingDoc.fileSize}
                      </p>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">
                        Status
                      </p>
                      <div className="flex items-center justify-center space-x-1 text-green-600">
                        <Shield className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase">
                          Verified
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Document Content Simulation (The "Page") */}
                  <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-10 min-h-[500px] flex flex-col items-center">
                    <div className="w-full flex justify-between items-start mb-12 border-b-2 border-gray-50 pb-8">
                      <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center">
                        <Shield className="w-8 h-8 text-primary/20" />
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-primary/20 uppercase tracking-[0.2em]">
                          Federal Police Commission
                        </p>
                        <p className="text-[8px] font-bold text-primary/10 uppercase tracking-widest">
                          Official Document Viewer
                        </p>
                      </div>
                    </div>

                    <div className="w-full space-y-6">
                      <div className="h-4 bg-gray-50 rounded-full w-3/4 mx-auto" />
                      <div className="h-4 bg-gray-50 rounded-full w-1/2 mx-auto" />
                      <div className="h-2 bg-gray-50/50 rounded-full w-full" />
                      <div className="h-2 bg-gray-50/50 rounded-full w-full" />
                      <div className="h-2 bg-gray-50/50 rounded-full w-5/6" />
                      <div className="h-2 bg-gray-50/50 rounded-full w-full" />
                      <div className="h-2 bg-gray-50/50 rounded-full w-4/5" />

                      <div className="py-8 px-10 bg-gray-50/30 rounded-3xl border border-gray-50">
                        <p className="text-xs font-bold text-primary/40 leading-relaxed italic text-center">
                          {previewingDoc.description ||
                            (isAm
                              ? "ምንም መግለጫ አልተገኘም"
                              : "No description available for this document.")}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-12">
                        <div className="h-20 bg-gray-50 overflow-hidden rounded-2xl relative">
                          <div className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-gray-300 uppercase tracking-widest rotate-6">
                            Official Seal
                          </div>
                        </div>
                        <div className="h-20 bg-gray-50 overflow-hidden rounded-2xl relative">
                          <div className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-gray-300 uppercase tracking-widest -rotate-6">
                            Verified Signature
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-amber-50 rounded-[30px] border border-amber-100 flex items-start space-x-4">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-1" />
                    <div>
                      <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">
                        Disclaimer
                      </p>
                      <p className="text-[10px] font-bold text-amber-900 leading-relaxed">
                        {isAm
                          ? "ያልተፈቀደ ስርጭት የተከለከለ ነው።"
                          : "Unauthorized distribution is prohibited."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-white border-t border-gray-50 flex justify-between items-center shrink-0">
                <button
                  onClick={() => setPreviewingDoc(null)}
                  className="px-6 py-4 text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-primary transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  className="blue-gradient text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center space-x-2"
                  onClick={() =>
                    alert(isAm ? "ሰነዱ በመውረድ ላይ ነው..." : "Downloading...")
                  }
                >
                  <Download className="w-4 h-4" />
                  <span>{isAm ? "አውርድ" : "Download PDF"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
