//filepath: frontend/src/pages/admin/EFPPositionManagement.tsx
import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { apiRequest } from "../../lib/api";
import { AutoDismissToast } from "../../components/AutoDismissToast";
import { ConfirmDialog } from "../../components/ConfirmDialog";

interface EfpPosition {
  id: number;
  nameEnglish: string;
  nameAmharic: string;
  _count?: {
    officials: number;
  };
}

export default function EFPPositionManagement() {
  const { language } = useLanguage();
  const isAm = language === "am";

  const [positions, setPositions] = useState<EfpPosition[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editPositionId, setEditPositionId] = useState<number | null>(null);
  const [formEnglishName, setFormEnglishName] = useState("");
  const [formAmharicName, setFormAmharicName] = useState("");
  const [toast, setToast] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<EfpPosition | null>(null);

  const filteredPositions = positions.filter((position) => {
    const query = searchQuery.trim().toLowerCase();
    return (
      position.nameEnglish.toLowerCase().includes(query) ||
      position.nameAmharic.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await apiRequest<{
        success: boolean;
        data: EfpPosition[];
      }>("/efp-positions");
      setPositions(response.data);
    } catch (error: any) {
      setErrorMessage(error.message || "Unable to load EFP positions.");
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateForm = () => {
    setFormEnglishName("");
    setFormAmharicName("");
    setErrorMessage(null);
    setIsEditing(false);
    setEditPositionId(null);
    setIsFormOpen(true);
  };

  const openEditForm = (position: EfpPosition) => {
    setFormEnglishName(position.nameEnglish);
    setFormAmharicName(position.nameAmharic);
    setErrorMessage(null);
    setEditPositionId(position.id);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSaving(true);

    const payload = {
      nameEnglish: formEnglishName.trim(),
      nameAmharic: formAmharicName.trim(),
    };

    try {
      const endpoint =
        isEditing && editPositionId
          ? `/efp-positions/${editPositionId}`
          : "/efp-positions";
      const method = isEditing ? "PUT" : "POST";

      const response = await apiRequest<{
        success: boolean;
        message: string;
        data: EfpPosition;
      }>(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      setToast({
        isOpen: true,
        type: "success",
        message: isEditing
          ? "EFP position updated successfully."
          : "EFP position created successfully.",
      });
      setEditPositionId(null);
      setIsFormOpen(false);
      await fetchPositions();
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to save EFP position.");
      setToast({
        isOpen: true,
        type: "error",
        message: error.message || "Unable to persist your changes.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = (position: EfpPosition) => {
    setPendingDelete(position);
    setIsDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setErrorMessage(null);
    setIsDeleting(true);

    try {
      await apiRequest<{ success: boolean; message: string }>(
        `/efp-positions/${pendingDelete.id}`,
        {
          method: "DELETE",
        },
      );
      setToast({
        isOpen: true,
        type: "success",
        message: "EFP position deleted successfully.",
      });
      setIsDeleteConfirmOpen(false);
      setPendingDelete(null);
      await fetchPositions();
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to delete position.");
      setToast({
        isOpen: true,
        type: "error",
        message: error.message || "Deletion failed.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const title = isAm ? "የፌዴራል ፖሊስ የስራ ቦታ አስተዳደር" : "EFP Position Management";
  const subtitle = isAm
    ? "የፌዴራል ፖሊስ ክፍል ስራ ቦታዎችን ይስተናግዱ።"
    : "Manage Federal Police position names and assigned officials.";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-primary">{title}</h1>
          <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-4 py-3 text-sm font-black uppercase text-white transition hover:bg-slate-800"
        >
          <Plus className="w-4 h-4" />
          {isAm ? "አዲስ ቦታ ፈጥር" : "Add EFP Position"}
        </button>
      </div>

      <div className="grid gap-6">
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md">
              <Search className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-11 py-3 text-sm text-gray-900 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                placeholder={isAm ? "ፍለጋ ይስጡ..." : "Search positions..."}
              />
            </div>
            <div className="rounded-3xl bg-gray-100 px-4 py-3 text-sm text-gray-600">
              {isAm ? "የተመዘገቡ ቦታዎች" : "Total positions"}: {positions.length}
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.24em] text-gray-500">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">
                    {isAm ? "እንግሊዝኛ" : "English Name"}
                  </th>
                  <th className="px-4 py-3">
                    {isAm ? "አማርኛ" : "Amharic Name"}
                  </th>
                  <th className="px-4 py-3">
                    {isAm ? "ኦፊሻል ብዛት" : "Officials"}
                  </th>
                  <th className="px-4 py-3 text-right">
                    {isAm ? "እርምጃ" : "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      <Loader2 className="mx-auto h-10 w-10 animate-spin text-secondary" />
                      <p className="mt-3">
                        {isAm ? "በመጫን ላይ..." : "Loading positions..."}
                      </p>
                    </td>
                  </tr>
                ) : filteredPositions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      {isAm ? "አሁን የሚሰሩ ቦታዎች የሉም።" : "No EFP positions found."}
                    </td>
                  </tr>
                ) : (
                  filteredPositions.map((position, index) => (
                    <tr key={position.id}>
                      <td className="px-4 py-4 font-semibold text-gray-700">
                        {index + 1}
                      </td>
                      <td className="px-4 py-4 text-gray-700">
                        {position.nameEnglish}
                      </td>
                      <td className="px-4 py-4 text-gray-700">
                        {position.nameAmharic}
                      </td>
                      <td className="px-4 py-4 text-gray-700">
                        {position._count?.officials ?? 0}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(position)}
                            className="inline-flex items-center gap-2 rounded-2xl border border-secondary/10 bg-secondary/5 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-secondary transition hover:bg-secondary/10"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            {isAm ? "አስተካክል" : "Edit"}
                          </button>
                          <button
                            type="button"
                            onClick={() => confirmDelete(position)}
                            className="inline-flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-rose-600 transition hover:bg-rose-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            {isAm ? "አስወግድ" : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {toast && (
        <AutoDismissToast
          isOpen={toast.isOpen}
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title={isAm ? "የምዝገባ አስገደድ" : "Confirm delete"}
        message={
          isAm
            ? "እርግጠኛ ነዎት ይህን ፌዴራል ፖሊስ ስራ ቦታ ከማስወገድ ፈልጋለህ?"
            : "Are you sure you want to delete this EFP position?"
        }
        type="delete"
        isLoading={isDeleting}
      />

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-[32px] bg-white p-8 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-primary">
                  {isEditing
                    ? isAm
                      ? "የቦታ መረጃ አስተካክል"
                      : "Edit EFP Position"
                    : isAm
                      ? "አዲስ ፌዴራል ፖሊስ ቦታ"
                      : "Create EFP Position"}
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  {isAm
                    ? "የእንግሊዝኛና የአማርኛ ስሞችን ያስገቡ።"
                    : "Fill in the English and Amharic names for the position."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                {isAm ? "ዝጋ" : "Close"}
              </button>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSave}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-semibold text-gray-700">
                  <span>{isAm ? "እንግሊዝኛ ስም" : "English Name"}</span>
                  <input
                    value={formEnglishName}
                    onChange={(event) => setFormEnglishName(event.target.value)}
                    className="w-full rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                    placeholder={
                      isAm ? "የቦታ እንግሊዝኛ ስም" : "Position English name"
                    }
                  />
                </label>
                <label className="space-y-2 text-sm font-semibold text-gray-700">
                  <span>{isAm ? "አማርኛ ስም" : "Amharic Name"}</span>
                  <input
                    value={formAmharicName}
                    onChange={(event) => setFormAmharicName(event.target.value)}
                    className="w-full rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                    placeholder={isAm ? "የቦታ አማርኛ ስም" : "Position Amharic name"}
                  />
                </label>
              </div>

              {errorMessage && (
                <div className="rounded-3xl bg-rose-50 px-4 py-4 text-sm text-rose-700">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4" />
                    <p>{errorMessage}</p>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-3xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                >
                  {isAm ? "ተመለስ" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center rounded-3xl bg-secondary px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-slate-800 disabled:opacity-70"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      {isEditing
                        ? isAm
                          ? "አስተካክል"
                          : "Update"
                        : isAm
                          ? "መዝግብ"
                          : "Save"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
