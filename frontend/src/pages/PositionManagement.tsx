// filepath: frontend/src/pages/PositionManagement.tsx
import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Award,
  Plus,
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
  id?: number;
  level?: number | null;
  minimumExperienceYears: number | null;
  requiredEducationLevel: string | null;
  requiredWorkExperienceYears: number | null;
}

type PositionRequirementsValue = PositionRequirement[] | null;

interface Position {
  id: number;
  name: string;
  _count: { employees: number };
  requirements: PositionRequirementsValue;
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
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [isCriteriaModalOpen, setIsCriteriaModalOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [criteriaTargetPosition, setCriteriaTargetPosition] =
    useState<Position | null>(null);
  const [formName, setFormName] = useState("");
  const [criteriaDrafts, setCriteriaDrafts] = useState<PositionRequirement[]>([
    {
      level: 1,
      minimumExperienceYears: null,
      requiredEducationLevel: "",
      requiredWorkExperienceYears: null,
    },
  ]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Position | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCriteriaConfirmOpen, setIsCriteriaConfirmOpen] = useState(false);
  const [pendingCriteriaRequirements, setPendingCriteriaRequirements] =
    useState<PositionRequirement[] | null>(null);
  const [isCriteriaSaving, setIsCriteriaSaving] = useState(false);
  // UI helpers
  const [searchQuery, setSearchQuery] = useState("");

  const getRequirementsList = (
    requirements: PositionRequirementsValue,
  ): PositionRequirement[] => {
    if (!requirements) return [];
    return requirements;
  };

  const filteredPositions = positions.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );

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
  const openNameModal = (pos: Position | null = null) => {
    setErrorMessage(null);
    if (pos) {
      setFormName(pos.name);
      setIsEditingName(true);
    } else {
      setFormName("");
      setIsEditingName(false);
    }
    setIsNameModalOpen(true);
  };

  const resetCriteriaForm = () => {
    setCriteriaDrafts([
      {
        level: 1,
        minimumExperienceYears: null,
        requiredEducationLevel: "",
        requiredWorkExperienceYears: null,
      },
    ]);
  };

  const openCriteriaModal = (pos: Position | null = selectedPosition) => {
    if (!pos) {
      setErrorMessage("Select a position before adding criteria.");
      return;
    }

    setErrorMessage(null);
    setCriteriaTargetPosition(pos);
    const requirementList = getRequirementsList(pos.requirements);
    setCriteriaDrafts(
      requirementList.length > 0
        ? requirementList.map((requirement, index) => ({
            id: requirement.id,
            level: requirement.level ?? index + 1,
            minimumExperienceYears: requirement.minimumExperienceYears,
            requiredEducationLevel: requirement.requiredEducationLevel ?? "",
            requiredWorkExperienceYears:
              requirement.requiredWorkExperienceYears,
          }))
        : [
            {
              level: 1,
              minimumExperienceYears: null,
              requiredEducationLevel: "",
              requiredWorkExperienceYears: null,
            },
          ],
    );
    setIsCriteriaModalOpen(true);
  };

  // 4. HTTP POST / PUT - Save handler for position name only
  const handleSavePositionName = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const payload = { name: formName };

    const url =
      isEditingName && selectedPosition
        ? `${API_BASE_URL}/${selectedPosition.id}`
        : API_BASE_URL;
    const method = isEditingName ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsNameModalOpen(false);
        await fetchPositions();
        setSelectedPosition(result.data || selectedPosition);
        setToast({
          isOpen: true,
          type: "success",
          message: isEditingName
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

  // 5. HTTP POST / PUT - Save handler for requirement criteria only
  const handleSaveCriteria = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!criteriaTargetPosition) {
      setErrorMessage("Select a position before saving criteria.");
      return;
    }

    setErrorMessage(null);

    const normalizedRequirements = criteriaDrafts
      .slice()
      .sort((left, right) => (left.level ?? 0) - (right.level ?? 0))
      .map((criteria) => ({
        level: criteria.level,
        minimumExperienceYears: criteria.minimumExperienceYears,
        requiredEducationLevel: criteria.requiredEducationLevel?.trim() || null,
        requiredWorkExperienceYears: criteria.requiredWorkExperienceYears,
      }))
      .filter(
        (criteria) =>
          criteria.minimumExperienceYears !== null ||
          criteria.requiredEducationLevel !== null ||
          criteria.requiredWorkExperienceYears !== null,
      );

    if (normalizedRequirements.length === 0) {
      setErrorMessage("Add at least one criteria row before saving.");
      return;
    }

    setPendingCriteriaRequirements(normalizedRequirements);
    setIsCriteriaConfirmOpen(true);
  };

  const handleConfirmSaveCriteria = async () => {
    if (!criteriaTargetPosition || !pendingCriteriaRequirements) return;

    const payload = {
      name: criteriaTargetPosition.name,
      requirements: pendingCriteriaRequirements,
    };

    setIsCriteriaSaving(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/${criteriaTargetPosition.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setIsCriteriaConfirmOpen(false);
        setIsCriteriaModalOpen(false);
        setPendingCriteriaRequirements(null);
        resetCriteriaForm();
        await fetchPositions();
        setSelectedPosition(result.data || criteriaTargetPosition);
        setToast({
          isOpen: true,
          type: "success",
          message: "Position criteria saved successfully.",
        });
      } else {
        const message =
          result.message || "Validation gate blocked criteria persistence.";
        setErrorMessage(message);
        setToast({ isOpen: true, type: "error", message });
      }
    } catch (err) {
      const message = "Failed to connect to transmission pathways.";
      setErrorMessage(message);
      setToast({ isOpen: true, type: "error", message });
    } finally {
      setIsCriteriaSaving(false);
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
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4">
            <div className="min-w-0">
              <h2 className="text-lg font-extrabold tracking-tight text-slate-900 md:text-xl">
                Positions
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Directory of enterprise positions
              </p>
            </div>

            <div className="min-w-0">
              <label className="sr-only">Search positions</label>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search positions..."
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm transition focus:border-[#0C2A4C] focus:outline-none focus:ring-2 focus:ring-[#0C2A4C]/10"
              />
            </div>

            <button
              onClick={() => openNameModal(null)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0C2A4C] px-4 py-2.5 text-[#DCC380] shadow-sm transition hover:bg-opacity-95"
              aria-label="Create position"
            >
              <Plus className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">
                New Position
              </span>
            </button>
          </div>
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
          ) : filteredPositions.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm font-medium border border-dashed border-gray-200 rounded-2xl">
              {positions.length === 0
                ? "No positions registered yet."
                : "No positions match your search."}
            </div>
          ) : (
            filteredPositions.map((pos) => (
              <div
                key={pos.id}
                onClick={() => {
                  setSelectedPosition(pos);
                  setErrorMessage(null);
                }}
                className={`group flex items-center justify-between p-3 rounded-2xl cursor-pointer border transition-all hover:shadow-sm ${
                  selectedPosition?.id === pos.id
                    ? "border-[#0C2A4C] bg-[#0C2A4C]/6"
                    : "border-gray-100 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg flex items-center justify-center ${
                      selectedPosition?.id === pos.id
                        ? "bg-[#0C2A4C] text-[#DCC380]"
                        : "bg-gray-50 text-gray-500"
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-slate-900 truncate">
                      {pos.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="uppercase tracking-wide">
                        {pos._count?.employees || 0} staff
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 rounded-full text-[11px] text-slate-700">
                        {getRequirementsList(pos.requirements).length} criteria
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openNameModal(pos);
                    }}
                    title="Edit"
                    className="p-2 rounded-md text-slate-600 hover:bg-gray-50"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      requestDeletePosition(pos);
                    }}
                    title="Delete"
                    className="p-2 rounded-md text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Command Center View */}
      <div className="w-full md:w-2/3 bg-white border border-gray-100 rounded-2xl flex flex-col overflow-hidden shadow">
        {selectedPosition ? (
          <>
            <div className="p-6 border-b border-gray-100 bg-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                  {selectedPosition.name}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  ID • {selectedPosition.id} •{" "}
                  {selectedPosition._count?.employees || 0} staff
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openCriteriaModal(selectedPosition)}
                  className="inline-flex items-center gap-2 px-3 py-2 border border-[#DCC380]/30 rounded-lg text-[#0C2A4C] hover:bg-[#DCC380]/10"
                >
                  <Award className="w-4 h-4" />
                  <span className="text-sm font-semibold">Edit Criteria</span>
                </button>
                <button
                  onClick={() => openNameModal(selectedPosition)}
                  className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-slate-700 hover:bg-gray-50"
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="text-sm">Rename</span>
                </button>
                <button
                  onClick={() => requestDeletePosition(selectedPosition)}
                  className="inline-flex items-center gap-2 px-3 py-2 border border-red-100 rounded-lg text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="px-6 border-b border-gray-100">
              <nav className="flex gap-4">
                <button
                  onClick={() => setActiveTab("details")}
                  className={`py-3 px-4 text-sm font-semibold rounded-t-lg ${
                    activeTab === "details"
                      ? "bg-[#0C2A4C]/6 text-[#0C2A4C]"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Requirements
                </button>
                <button
                  onClick={() => setActiveTab("employees")}
                  className={`py-3 px-4 text-sm font-semibold rounded-t-lg ${
                    activeTab === "employees"
                      ? "bg-[#0C2A4C]/6 text-[#0C2A4C]"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Allocated Staff
                </button>
              </nav>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              {activeTab === "details" && (
                <div className="bg-slate-50 rounded-lg p-4 border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-slate-900">
                      Requirement Criteria
                    </h4>
                    <button
                      onClick={() => openCriteriaModal(selectedPosition)}
                      className="text-sm text-[#0C2A4C] font-semibold"
                    >
                      Edit
                    </button>
                  </div>
                  {getRequirementsList(selectedPosition.requirements).length >
                  0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs text-slate-500 uppercase">
                            <th className="px-3 py-2">#</th>
                            <th className="px-3 py-2">For Certificate Level</th>
                            <th className="px-3 py-2">Minimum Experence</th>
                            <th className="px-3 py-2">Education Level</th>
                            <th className="px-3 py-2">Work Experience</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {getRequirementsList(
                            selectedPosition.requirements,
                          ).map((requirement, index) => (
                            <tr
                              key={requirement.id ?? index}
                              className="bg-white"
                            >
                              <td className="px-3 py-3 font-medium text-slate-800">
                                {index + 1}
                              </td>
                              <td className="px-3 py-3 text-slate-700">
                                Level {requirement.level ?? index + 1}
                              </td>
                              <td className="px-3 py-3 text-slate-700">
                                {requirement.minimumExperienceYears ?? 0} yrs
                              </td>
                              <td className="px-3 py-3 text-slate-700">
                                {requirement.requiredEducationLevel || "Open"}
                              </td>
                              <td className="px-3 py-3 text-slate-700">
                                {requirement.requiredWorkExperienceYears ?? 0}{" "}
                                yrs
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">
                      No criteria configured yet.
                    </p>
                  )}
                </div>
              )}

              {activeTab === "employees" && (
                <div className="p-6">
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">
                    Manage Allocated Staff
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">
                    Bridge staff entities to the{" "}
                    <strong>{selectedPosition.name}</strong> directory layer.
                  </p>
                  <button className="inline-flex items-center gap-2 bg-[#0C2A4C] text-[#DCC380] px-4 py-2 rounded-lg">
                    <UserPlus className="w-4 h-4" />
                    <span className="text-sm font-semibold">
                      Initialize Bridge
                    </span>
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

      {/* --- POSITION NAME MODAL --- */}
      {isNameModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-lg relative border border-gray-100">
            <button
              onClick={() => setIsNameModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              aria-label="close"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {isEditingName ? "Rename Position" : "Create Position"}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Provide a clear position name.
            </p>

            <form onSubmit={handleSavePositionName} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Position Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-1 focus:ring-[#0C2A4C]"
                  placeholder="e.g. System Security Architect"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNameModalOpen(false)}
                  className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-slate-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-[#0C2A4C] text-[#DCC380] text-sm font-semibold"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- POSITION CRITERIA MODAL --- */}
      {isCriteriaModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-lg relative border border-gray-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsCriteriaModalOpen(false);
                resetCriteriaForm();
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              aria-label="close"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              Manage Requirement Criteria
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              {criteriaTargetPosition
                ? criteriaTargetPosition.name
                : "Select a position"}
            </p>

            <form onSubmit={handleSaveCriteria} className="space-y-4">
              {criteriaDrafts.map((criteria, index) => (
                <div
                  key={criteria.id ?? index}
                  className="rounded-lg border border-gray-100 bg-slate-50 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-slate-900">
                      Criteria {index + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() =>
                        setCriteriaDrafts((current) =>
                          current.length === 1
                            ? current
                            : current.filter((_, i) => i !== index),
                        )
                      }
                      className="text-sm text-red-500"
                      disabled={criteriaDrafts.length === 1}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">
                        Level
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={criteria.level ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setCriteriaDrafts((current) =>
                            current.map((item, i) =>
                              i === index
                                ? {
                                    ...item,
                                    level: value !== "" ? Number(value) : null,
                                  }
                                : item,
                            ),
                          );
                        }}
                        className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm"
                        placeholder="e.g. 1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">
                        Min Exp (yrs)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={criteria.minimumExperienceYears ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setCriteriaDrafts((current) =>
                            current.map((item, i) =>
                              i === index
                                ? {
                                    ...item,
                                    minimumExperienceYears:
                                      value !== "" ? Number(value) : null,
                                  }
                                : item,
                            ),
                          );
                        }}
                        className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">
                        Education Level
                      </label>
                      <input
                        type="text"
                        value={criteria.requiredEducationLevel ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setCriteriaDrafts((current) =>
                            current.map((item, i) =>
                              i === index
                                ? { ...item, requiredEducationLevel: value }
                                : item,
                            ),
                          );
                        }}
                        className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm"
                        placeholder="e.g. B.Sc. Software Engineering"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">
                        Work Exp (yrs)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={criteria.requiredWorkExperienceYears ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setCriteriaDrafts((current) =>
                            current.map((item, i) =>
                              i === index
                                ? {
                                    ...item,
                                    requiredWorkExperienceYears:
                                      value !== "" ? Number(value) : null,
                                  }
                                : item,
                            ),
                          );
                        }}
                        className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm"
                        placeholder="e.g. 3"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  setCriteriaDrafts((current) => [
                    ...current,
                    {
                      level: current.length + 1,
                      minimumExperienceYears: null,
                      requiredEducationLevel: "",
                      requiredWorkExperienceYears: null,
                    },
                  ])
                }
                className="w-full py-2 rounded-md border border-dashed border-[#0C2A4C]/30 text-[#0C2A4C] text-sm"
              >
                Add Criteria
              </button>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCriteriaModalOpen(false);
                    resetCriteriaForm();
                  }}
                  className="flex-1 py-2 rounded-md border border-gray-200 text-sm text-slate-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-md bg-[#0C2A4C] text-[#DCC380] text-sm font-semibold"
                >
                  Save Criteria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={isCriteriaConfirmOpen}
        onClose={() => {
          if (isCriteriaSaving) return;
          setIsCriteriaConfirmOpen(false);
          setPendingCriteriaRequirements(null);
        }}
        onConfirm={handleConfirmSaveCriteria}
        title="Save Criteria"
        message={
          criteriaTargetPosition
            ? `Save the updated requirement criteria for ${criteriaTargetPosition.name}?`
            : "Save the updated requirement criteria?"
        }
        type="update"
        isLoading={isCriteriaSaving}
        isConfirmDisabled={!pendingCriteriaRequirements}
      />

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
