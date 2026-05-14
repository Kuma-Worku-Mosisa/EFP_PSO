// filepath: frontend/src/pages/PositionManagement.tsx
import React, { useState, useEffect } from "react";
import {
  Briefcase,
  GraduationCap,
  Award,
  Plus,
  ChevronRight,
  UserPlus,
  Trash2,
  Edit3,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { AutoDismissToast } from "../components/AutoDismissToast";
import { ConfirmDialog } from "../components/ConfirmDialog";

// --- API Configuration Base URL ---
const API_BASE_URL = "http://localhost:5000/api/positions";

// --- Type Interfaces ---
interface PositionRequirement {
  minimumExperienceYears: number | null;
  requiredEducationLevel: string | null;
  requiredExperienceField: string | null;
}

interface Position {
  id: number;
  name: string;
  _count: { employees: number };
  requirements: PositionRequirement | null;
}

export default function PositionManagement() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<"details" | "employees">(
    "details",
  );

  // UI Status Management
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formName, setFormName] = useState("");
  const [formExpYears, setFormExpYears] = useState<number | "">("");
  const [formEduLevel, setFormEduLevel] = useState("");
  const [formExpField, setFormExpField] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Position | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. Initial Load Hook
  useEffect(() => {
    fetchPositions();
  }, []);

  // 2. HTTP GET - Fetch All Entries
  const fetchPositions = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch(API_BASE_URL);
      const result = await response.json();

      if (result.success) {
        setPositions(result.data);
        // Automatically select the first row if available
        if (result.data.length > 0 && !selectedPosition) {
          setSelectedPosition(result.data[0]);
        }
      } else {
        setErrorMessage(result.message || "Failed to sync directories.");
      }
    } catch (err) {
      setErrorMessage(
        "Network error: Unable to communicate with ERP backend engine.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Open Modal Configuration Controller
  const openModal = (pos: Position | null = null) => {
    setErrorMessage(null);
    if (pos) {
      setIsEditing(true);
      setFormName(pos.name);
      setFormExpYears(pos.requirements?.minimumExperienceYears ?? "");
      setFormEduLevel(pos.requirements?.requiredEducationLevel ?? "");
      setFormExpField(pos.requirements?.requiredExperienceField ?? "");
    } else {
      setIsEditing(false);
      setFormName("");
      setFormExpYears("");
      setFormEduLevel("");
      setFormExpField("");
    }
    setIsModalOpen(true);
  };

  // 4. HTTP POST / PUT - Save handler
  const handleSavePosition = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const payload = {
      name: formName,
      requirements: {
        minimumExperienceYears:
          formExpYears !== "" ? Number(formExpYears) : null,
        requiredEducationLevel: formEduLevel.trim() || null,
        requiredExperienceField: formExpField.trim() || null,
      },
    };

    const url =
      isEditing && selectedPosition
        ? `${API_BASE_URL}/${selectedPosition.id}`
        : API_BASE_URL;
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsModalOpen(false);
        // Refresh local memory indexes directly from the backend response tracking states
        await fetchPositions();

        if (isEditing && selectedPosition) {
          // Keep current target contextual selection in view
          setSelectedPosition(result.data || result.data[0]);
        }
        setToast({
          isOpen: true,
          type: "success",
          message: isEditing
            ? "Position updated successfully."
            : "Position created successfully.",
        });
      } else {
        const message =
          result.message ||
          "Validation gate blocked data persistence parameters.";
        setErrorMessage(message);
        setToast({ isOpen: true, type: "error", message });
      }
    } catch (err) {
      const message = "Failed to connect to transmission pathways.";
      setErrorMessage(message);
      setToast({ isOpen: true, type: "error", message });
    }
  };

  // 5. HTTP DELETE - Purge position record nodes
  const requestDeletePosition = (pos: Position) => {
    setPendingDelete(pos);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;

    setErrorMessage(null);
    setIsDeleting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/${pendingDelete.id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (response.ok && result.success) {
        setSelectedPosition(null);
        await fetchPositions();
        setToast({
          isOpen: true,
          type: "success",
          message: "Position deleted successfully.",
        });
        setIsConfirmOpen(false);
        setPendingDelete(null);
      } else {
        const message =
          result.message ||
          "Database constraints prevented record deletion routing.";
        setErrorMessage(message);
        setToast({ isOpen: true, type: "error", message });
      }
    } catch (err) {
      const message = "Communications failure during remote drop operation.";
      setErrorMessage(message);
      setToast({ isOpen: true, type: "error", message });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 flex flex-col md:flex-row gap-6 h-[calc(100vh-4rem)]">
      {/* LEFT PANEL: Master Directory */}
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-[#0C2A4C] uppercase tracking-tighter">
            Positions Directory
          </h2>
          <button
            onClick={() => openModal(null)}
            className="bg-[#0C2A4C] text-[#DCC380] p-2 rounded-xl hover:bg-opacity-90 shadow-sm transition-all"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Global Inline Notifications Block */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Dynamic List Rendering Area */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-[#0C2A4C]" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Syncing Database Matrix...
              </span>
            </div>
          ) : positions.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs font-medium border border-dashed border-gray-200 rounded-2xl">
              No positions registered inside directory engine.
            </div>
          ) : (
            positions.map((pos) => (
              <div
                key={pos.id}
                onClick={() => {
                  setSelectedPosition(pos);
                  setErrorMessage(null);
                }}
                className={`group flex items-center justify-between p-4 rounded-2xl cursor-pointer border-2 transition-all ${
                  selectedPosition?.id === pos.id
                    ? "border-[#0C2A4C] bg-[#0C2A4C]/5 shadow-sm"
                    : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl ${selectedPosition?.id === pos.id ? "bg-[#0C2A4C] text-[#DCC380]" : "bg-gray-50 text-gray-400"}`}
                  >
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-700">
                      {pos.name}
                    </h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {pos._count?.employees || 0} Staff Members
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Command Center View */}
      <div className="w-full md:w-2/3 bg-white border-2 border-gray-100 rounded-[32px] flex flex-col overflow-hidden shadow-sm">
        {selectedPosition ? (
          <>
            <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-black text-[#0C2A4C] uppercase tracking-tighter mb-2">
                  {selectedPosition.name}
                </h2>
                <span className="inline-flex items-center gap-1.5 bg-[#0C2A4C]/10 text-[#0C2A4C] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  ID Node: {selectedPosition.id}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openModal(selectedPosition)}
                  className="p-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => requestDeletePosition(selectedPosition)}
                  className="p-2 border border-red-100 text-red-500 rounded-xl hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex px-8 border-b border-gray-100 mt-4">
              <button
                onClick={() => setActiveTab("details")}
                className={`pb-4 px-4 text-xs font-black uppercase tracking-widest border-b-2 ${activeTab === "details" ? "border-[#0C2A4C] text-[#0C2A4C]" : "border-transparent text-gray-400"}`}
              >
                Requirements Matrix
              </button>
              <button
                onClick={() => setActiveTab("employees")}
                className={`pb-4 px-4 text-xs font-black uppercase tracking-widest border-b-2 ${activeTab === "employees" ? "border-[#0C2A4C] text-[#0C2A4C]" : "border-transparent text-gray-400"}`}
              >
                Manage Allocated Staff
              </button>
            </div>

            <div className="p-8 flex-1 overflow-y-auto">
              {activeTab === "details" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                      <Award className="w-5 h-5 text-[#DCC380]" />
                      <h4 className="font-bold text-[#0C2A4C] text-sm uppercase tracking-wider">
                        Experience Controls
                      </h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                          Minimum Record Barrier
                        </p>
                        <p className="text-gray-800 font-semibold">
                          {selectedPosition.requirements
                            ?.minimumExperienceYears ?? "0"}{" "}
                          Years Required
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                          Target Field Domain
                        </p>
                        <p className="text-gray-800 font-semibold">
                          {selectedPosition.requirements
                            ?.requiredExperienceField ||
                            "No Structural Constraints"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                      <GraduationCap className="w-5 h-5 text-[#DCC380]" />
                      <h4 className="font-bold text-[#0C2A4C] text-sm uppercase tracking-wider">
                        Academic Education
                      </h4>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      Required Accreditation Matrix
                    </p>
                    <p className="text-gray-800 font-semibold mt-1">
                      {selectedPosition.requirements?.requiredEducationLevel ||
                        "Open Parameters / Non-restricted"}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "employees" && (
                <div className="flex flex-col items-center justify-center text-center h-full py-12">
                  <div className="w-14 h-14 bg-[#0C2A4C]/5 text-[#0C2A4C] rounded-full flex items-center justify-center mb-3">
                    <UserPlus className="w-6 Sec h-6" />
                  </div>
                  <h3 className="text-base font-black text-[#0C2A4C] uppercase tracking-tight">
                    Allocate Workforce Nodes
                  </h3>
                  <p className="text-xs text-gray-500 max-w-xs mt-1 mb-4">
                    Bridge staff entities to the {selectedPosition.name}{" "}
                    directory structure layer.
                  </p>
                  <button className="bg-[#0C2A4C] text-[#DCC380] px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-opacity-90 transition-all">
                    Initialize Router Bridge
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 flex-col gap-2">
            <Briefcase className="w-8 h-8 opacity-40" />
            <p className="text-xs font-bold uppercase tracking-widest">
              Select an entity from directory listing
            </p>
          </div>
        )}
      </div>

      {/* --- CRUD MODAL COMPONENT OVERLAY --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl relative border border-gray-100">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-[#0C2A4C] uppercase tracking-tight mb-4">
              {isEditing
                ? "Modify Position Parameters"
                : "Register New Enterprise Position"}
            </h3>

            <form onSubmit={handleSavePosition} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                  Position Profile Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-[#0C2A4C]"
                  placeholder="e.g. System Security Architect"
                />
              </div>

              <div className="border-t border-gray-100 pt-3">
                <h4 className="text-xs font-bold text-[#DCC380] uppercase tracking-wide mb-3">
                  Linked Parameters & Requirements
                </h4>

                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="col-span-1">
                    <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">
                      Min Exp (Yrs)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formExpYears}
                      onChange={(e) =>
                        setFormExpYears(
                          e.target.value !== "" ? Number(e.target.value) : "",
                        )
                      }
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-[#0C2A4C]"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">
                      Education Level Track
                    </label>
                    <input
                      type="text"
                      value={formEduLevel}
                      onChange={(e) => setFormEduLevel(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-[#0C2A4C]"
                      placeholder="e.g. B.Sc. Software Engineering"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">
                    Specialization Field Scope
                  </label>
                  <input
                    type="text"
                    value={formExpField}
                    onChange={(e) => setFormExpField(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-[#0C2A4C]"
                    placeholder="e.g. Backend Systems Security"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/3 py-2.5 border border-gray-200 rounded-xl text-xs font-black uppercase text-gray-500 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-[#0C2A4C] text-[#DCC380] rounded-xl text-xs font-black uppercase tracking-wider hover:bg-opacity-95"
                >
                  Save Structural Parameters
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => {
          if (isDeleting) return;
          setIsConfirmOpen(false);
          setPendingDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Position"
        message={
          pendingDelete
            ? `Are you sure you want to delete ${pendingDelete.name}? This will remove all linked requirement settings.`
            : "Are you sure you want to delete this position?"
        }
        type="delete"
        isLoading={isDeleting}
      />

      <AutoDismissToast
        isOpen={!!toast?.isOpen}
        type={toast?.type || "success"}
        message={toast?.message || ""}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
