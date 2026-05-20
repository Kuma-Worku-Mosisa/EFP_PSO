// filepath: frontend/src/pages/admin/LocationManager.tsx
import { useState, useEffect } from "react";
import { Edit, Trash2 } from "lucide-react";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { AutoDismissToast } from "../../components/AutoDismissToast";

interface NodeItem {
  id: number;
  name: string;
}

export default function LocationManager() {
  // Cascading Layer States
  const [regions, setRegions] = useState<NodeItem[]>([]);
  const [zones, setZones] = useState<NodeItem[]>([]);
  const [woredas, setWoredas] = useState<NodeItem[]>([]);
  const [kebeles, setKebeles] = useState<NodeItem[]>([]);

  // Selection Tree Pointers
  const [selRegion, setSelRegion] = useState<NodeItem | null>(null);
  const [selZone, setSelZone] = useState<NodeItem | null>(null);
  const [selWoreda, setSelWoreda] = useState<NodeItem | null>(null);

  // Column-Scoped Search / Filter Queries
  const [queryRegion, setQueryRegion] = useState("");
  const [queryZone, setQueryZone] = useState("");
  const [queryWoreda, setQueryWoreda] = useState("");
  const [queryKebele, setQueryKebele] = useState("");

  // In-line Operational Edit Focus Buffers
  const [editTier, setEditTier] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  // System Feedback Log State
  const [errorLog, setErrorLog] = useState<string | null>(null);
  // Confirm dialog state for deletes
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteEndpoint, setPendingDeleteEndpoint] = useState<
    string | null
  >(null);
  const [pendingDeleteRefresh, setPendingDeleteRefresh] = useState<
    (() => void) | null
  >(null);

  // Toast state
  const [toastOpen, setToastOpen] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMessage, setToastMessage] = useState("");

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editModalTier, setEditModalTier] = useState<string | null>(null);
  const [editModalId, setEditModalId] = useState<number | null>(null);
  const [editModalValue, setEditModalValue] = useState("");
  const [editModalLoading, setEditModalLoading] = useState(false);
  // Add modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalTier, setAddModalTier] = useState<string | null>(null);
  const [addModalParentId, setAddModalParentId] = useState<number | null>(null);
  const [addModalValue, setAddModalValue] = useState("");
  const [addModalLoading, setAddModalLoading] = useState(false);

  const API_ROOT = "http://localhost:5000/api/location";

  // Generic request wrapper with error handling and JSON parsing
  const stripHtml = (s: string) =>
    s
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const request = async (
    method: "GET" | "POST" | "PUT" | "DELETE",
    endpoint: string,
    body?: object,
  ) => {
    setErrorLog(null);
    try {
      const init: RequestInit = { method };
      if (method !== "GET" && body !== undefined) {
        init.headers = { "Content-Type": "application/json" } as any;
        init.body = JSON.stringify(body);
      }

      const res = await fetch(`${API_ROOT}${endpoint}`, init);

      // Honor 204 No Content early
      if (res.status === 204) return { success: true, data: null };

      const text = await res.text();
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (e) {
        // Non-JSON response: synthesize a response object
        const message = text ? stripHtml(text).slice(0, 1000) : res.statusText;
        data = { success: res.ok, data: null, message };
      }

      // If server returned an explicit failure structure, show its message
      if (data && data.success === false) {
        setErrorLog(data.message || `Request failed (${res.status})`);
        return data;
      }

      // Non-OK HTTP status without JSON error
      if (!res.ok) {
        const message =
          (data && data.message) || res.statusText || `HTTP ${res.status}`;
        setErrorLog(message);
        return { success: false, message };
      }

      // Success: return parsed data (or wrap if server didn't include `success`)
      if (data && typeof data === "object") return data;
      return { success: true, data };
    } catch (err: any) {
      setErrorLog(err?.message || "Network error");
      return { success: false, message: err?.message || "Network error" };
    }
  };

  // Initial Seed Hook
  useEffect(() => {
    fetchRegions();
  }, []);

  // Cascading Dynamic Invalidation Effects (Resets child queues and filters on parent shifts)
  useEffect(() => {
    setZones([]);
    setWoredas([]);
    setKebeles([]);
    setSelZone(null);
    setSelWoreda(null);
    setQueryZone("");
    setQueryWoreda("");
    setQueryKebele("");
    if (selRegion) fetchZones(selRegion.id);
  }, [selRegion]);

  useEffect(() => {
    setWoredas([]);
    setKebeles([]);
    setSelWoreda(null);
    setQueryWoreda("");
    setQueryKebele("");
    if (selZone) fetchWoredas(selZone.id);
  }, [selZone]);

  useEffect(() => {
    setKebeles([]);
    setQueryKebele("");
    if (selWoreda) fetchKebeles(selWoreda.id);
  }, [selWoreda]);

  // Network Fetch Subsystems
  const fetchRegions = async () => {
    const data = await request("GET", "/regions");
    if (data.success) setRegions(data.data || []);
  };

  const fetchZones = async (rId: number) => {
    const data = await request("GET", `/regions/${rId}/zones`);
    if (data.success) setZones(data.data || []);
  };

  const fetchWoredas = async (zId: number) => {
    const data = await request("GET", `/zones/${zId}/woredas`);
    if (data.success) setWoredas(data.data || []);
  };

  const fetchKebeles = async (wId: number) => {
    const data = await request("GET", `/woredas/${wId}/kebeles`);
    if (data.success) setKebeles(data.data || []);
  };

  // Mutative Action Engines
  const executeUpdate = async (
    endpoint: string,
    body: object,
    refreshCallback: () => void,
  ) => {
    setErrorLog(null);
    const result = await request("PUT", endpoint, body);
    if (result.success) {
      setEditTier(null);
      setEditId(null);
      setEditValue("");
      refreshCallback();
    }
  };

  const executeDelete = async (
    endpoint: string,
    refreshCallback: () => void,
  ) => {
    // open confirm dialog and store endpoint + callback
    setErrorLog(null);
    setPendingDeleteEndpoint(endpoint);
    setPendingDeleteRefresh(() => refreshCallback);
    setConfirmOpen(true);
  };

  const openEditModal = (tier: string, id: number, name: string) => {
    setEditModalTier(tier);
    setEditModalId(id);
    setEditModalValue(name);
    setEditModalOpen(true);
  };

  const openAddModal = (tier: string, parentId: number | null = null) => {
    setAddModalTier(tier);
    setAddModalParentId(parentId);
    setAddModalValue("");
    setAddModalOpen(true);
  };

  const saveAddModal = async () => {
    if (!addModalTier) return;
    setAddModalLoading(true);
    let endpoint = "";
    if (addModalTier === "r") endpoint = `/regions`;
    else if (addModalTier === "z" && addModalParentId)
      endpoint = `/regions/${addModalParentId}/zones`;
    else if (addModalTier === "w" && addModalParentId)
      endpoint = `/zones/${addModalParentId}/woredas`;
    else if (addModalTier === "k" && addModalParentId)
      endpoint = `/woredas/${addModalParentId}/kebeles`;
    else {
      setAddModalLoading(false);
      setToastType("error");
      setToastMessage("Missing parent for this tier");
      setToastOpen(true);
      return;
    }

    const result = await request("POST", endpoint, { name: addModalValue });
    setAddModalLoading(false);
    setAddModalOpen(false);
    if (result.success) {
      // refresh lists
      if (addModalTier === "r") fetchRegions();
      if (addModalTier === "z" && addModalParentId)
        fetchZones(addModalParentId);
      if (addModalTier === "w" && addModalParentId)
        fetchWoredas(addModalParentId);
      if (addModalTier === "k" && addModalParentId)
        fetchKebeles(addModalParentId);
      setToastType("success");
      setToastMessage("Created successfully");
      setToastOpen(true);
    } else {
      setToastType("error");
      setToastMessage(result.message || "Create failed");
      setToastOpen(true);
    }
  };

  const saveEditModal = async () => {
    if (!editModalTier || editModalId === null) return;
    setEditModalLoading(true);
    const id = editModalId;
    let endpoint = "";
    if (editModalTier === "r") endpoint = `/regions/${id}`;
    else if (editModalTier === "z") endpoint = `/zones/${id}`;
    else if (editModalTier === "w") endpoint = `/woredas/${id}`;
    else if (editModalTier === "k") endpoint = `/kebeles/${id}`;

    const result = await request("PUT", endpoint, { name: editModalValue });
    setEditModalLoading(false);
    setEditModalOpen(false);
    if (result.success) {
      // refresh appropriate list
      if (editModalTier === "r") fetchRegions();
      if (editModalTier === "z" && selRegion) fetchZones(selRegion.id);
      if (editModalTier === "w" && selZone) fetchWoredas(selZone.id);
      if (editModalTier === "k" && selWoreda) fetchKebeles(selWoreda.id);
      setToastType("success");
      setToastMessage("Updated successfully");
      setToastOpen(true);
    } else {
      setToastType("error");
      setToastMessage(result.message || "Update failed");
      setToastOpen(true);
    }
  };

  const performPendingDelete = async () => {
    if (!pendingDeleteEndpoint) return;
    const endpoint = pendingDeleteEndpoint;
    const refresh = pendingDeleteRefresh;
    setConfirmOpen(false);
    setPendingDeleteEndpoint(null);
    setPendingDeleteRefresh(null);

    const result = await request("DELETE", endpoint);
    if (result.success) {
      if (refresh) refresh();
      setToastType("success");
      setToastMessage("Deleted successfully");
      setToastOpen(true);
    } else {
      setToastType("error");
      setToastMessage(result.message || "Delete failed");
      setToastOpen(true);
    }
  };

  // Client-Side Live Filter Computations
  const filteredRegions = regions.filter((r) =>
    r.name.toLowerCase().includes(queryRegion.toLowerCase()),
  );
  const filteredZones = zones.filter((z) =>
    z.name.toLowerCase().includes(queryZone.toLowerCase()),
  );
  const filteredWoredas = woredas.filter((w) =>
    w.name.toLowerCase().includes(queryWoreda.toLowerCase()),
  );
  const filteredKebeles = kebeles.filter((k) =>
    k.name.toLowerCase().includes(queryKebele.toLowerCase()),
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto min-h-screen flex flex-col space-y-6">
      <div className="flex flex-col gap-2 sm:gap-3">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          Geographic Address Matrix
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Search, filter, and manage cascading administrative regional settings
          dynamically.
        </p>
      </div>

      {errorLog && (
        <div className="p-4 bg-red-50 border-l-4 border-red-600 text-red-800 text-sm font-semibold rounded shadow-sm">
          ⚠️ Operational Error: {errorLog}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={performPendingDelete}
        title="Confirm Deletion"
        message="Are you absolutely certain you want to remove this entity?"
        type="delete"
        isLoading={false}
      />

      {editModalOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setEditModalOpen(false)}
          />
          <div className="relative bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-[#003366] mb-3">
              Edit{" "}
              {editModalTier === "r"
                ? "Region"
                : editModalTier === "z"
                  ? "Zone"
                  : editModalTier === "w"
                    ? "Woreda"
                    : "Kebele"}
            </h3>
            <input
              value={editModalValue}
              onChange={(e) => setEditModalValue(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 rounded bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={saveEditModal}
                disabled={editModalLoading}
                className="px-4 py-2 rounded bg-[#003366] text-[#FFD700] disabled:opacity-60"
              >
                {editModalLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {addModalOpen && (
        <div className="fixed inset-0 z-[1110] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setAddModalOpen(false)}
          />
          <div className="relative bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-[#003366] mb-3">
              Add{" "}
              {addModalTier === "r"
                ? "Region"
                : addModalTier === "z"
                  ? "Zone"
                  : addModalTier === "w"
                    ? "Woreda"
                    : "Kebele"}
            </h3>
            {addModalTier !== "r" && (
              <div className="text-sm text-gray-500 mb-2">
                Parent:{" "}
                {addModalTier === "z"
                  ? regions.find((rt) => rt.id === addModalParentId)?.name
                  : addModalTier === "w"
                    ? zones.find((z) => z.id === addModalParentId)?.name
                    : addModalTier === "k"
                      ? woredas.find((w) => w.id === addModalParentId)?.name
                      : "-"}
              </div>
            )}
            <input
              value={addModalValue}
              onChange={(e) => setAddModalValue(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              placeholder={`Enter ${addModalTier === "r" ? "region" : addModalTier === "z" ? "zone" : addModalTier === "w" ? "woreda" : "kebele"} name`}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setAddModalOpen(false)}
                className="px-4 py-2 rounded bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={saveAddModal}
                disabled={addModalLoading}
                className="px-4 py-2 rounded bg-[#003366] text-[#FFD700] disabled:opacity-60"
              >
                {addModalLoading ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      <AutoDismissToast
        isOpen={toastOpen}
        type={toastType}
        message={toastMessage}
        onClose={() => setToastOpen(false)}
      />

      {/* 4-Tier Interactive Desktop Scroller Pane */}
      <div className="flex flex-col lg:flex-row flex-1 gap-4 lg:overflow-x-auto pb-4 items-start select-none">
        {/* LEVEL 1: REGIONS */}
        <div className="w-full lg:w-72 border bg-white rounded-xl shadow-sm flex flex-col h-[520px] sm:h-[620px] flex-shrink-0">
          <div className="p-4 border-b bg-gray-50 rounded-t-xl space-y-2">
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider">
              1. Regions
            </h2>
            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Filter regions..."
                className="w-full text-xs p-2 pl-7 border rounded-lg bg-white shadow-inner focus:ring-1 focus:ring-[#003366]"
                value={queryRegion}
                onChange={(e) => setQueryRegion(e.target.value)}
              />
            </div>
            <div className="flex">
              <button
                onClick={() => openAddModal("r")}
                className="bg-[#003366] text-[#FFD700] px-3 py-1 rounded-lg text-sm font-bold hover:bg-[#002244] flex items-center justify-center"
                title="Add region"
              >
                Add Region
              </button>
            </div>
          </div>

          <ul className="overflow-y-auto flex-1 p-2 space-y-1">
            {filteredRegions.length === 0 && regions.length > 0 && (
              <div className="text-center text-xs text-gray-400 p-4 italic">
                No matched regions found
              </div>
            )}
            {filteredRegions.map((r) => (
              <li
                key={r.id}
                onClick={() => setSelRegion(r)}
                className={`p-2.5 rounded-lg text-xs font-medium cursor-pointer flex justify-between items-center transition-all ${
                  selRegion?.id === r.id
                    ? "bg-[#003366] text-[#FFD700] shadow-sm font-bold"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                {editTier === "r" && editId === r.id ? (
                  <input
                    type="text"
                    className="text-black p-0.5 rounded w-36 text-xs"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      executeUpdate(
                        `/regions/${r.id}`,
                        { name: editValue },
                        fetchRegions,
                      )
                    }
                  />
                ) : (
                  <span>{r.name}</span>
                )}
                <div className="flex space-x-2 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal("r", r.id, r.name);
                    }}
                    className={`opacity-80 hover:opacity-100 px-2 ${
                      selRegion?.id === r.id
                        ? "text-[#FFD700]"
                        : "text-gray-600 hover:text-[#003366]"
                    }`}
                    title="Edit region"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      executeDelete(`/regions/${r.id}`, () => {
                        fetchRegions();
                        setSelRegion(null);
                      });
                    }}
                    className={`opacity-80 hover:opacity-100 px-2 ${
                      selRegion?.id === r.id
                        ? "text-[#FFD700]"
                        : "text-gray-600 hover:text-red-600"
                    }`}
                    title="Delete region"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* LEVEL 2: ZONES */}
        <div className="w-full lg:w-72 border bg-white rounded-xl shadow-sm flex flex-col h-[520px] sm:h-[620px] flex-shrink-0">
          {selRegion ? (
            <>
              <div className="p-4 border-b bg-gray-50 rounded-t-xl space-y-2">
                <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider truncate">
                  2. Zones ({selRegion.name})
                </h2>
                <input
                  type="text"
                  placeholder="🔍 Filter zones..."
                  className="w-full text-xs p-2 border rounded-lg bg-white shadow-inner focus:ring-1 focus:ring-[#003366]"
                  value={queryZone}
                  onChange={(e) => setQueryZone(e.target.value)}
                />
                <div className="flex">
                  <button
                    onClick={() => openAddModal("z", selRegion?.id ?? null)}
                    className="bg-[#003366] text-[#FFD700] px-3 py-1 rounded-lg text-sm hover:bg-[#002244] flex items-center justify-center"
                    title="Add zone"
                  >
                    Add Zone
                  </button>
                </div>
              </div>

              <ul className="overflow-y-auto flex-1 p-2 space-y-1">
                {filteredZones.length === 0 && zones.length > 0 && (
                  <div className="text-center text-xs text-gray-400 p-4 italic">
                    No matched zones found
                  </div>
                )}
                {filteredZones.map((z) => (
                  <li
                    key={z.id}
                    onClick={() => setSelZone(z)}
                    className={`p-2.5 rounded-lg text-xs font-medium cursor-pointer flex justify-between items-center transition-all ${
                      selZone?.id === z.id
                        ? "bg-[#003366] text-[#FFD700] shadow-sm font-bold"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {editTier === "z" && editId === z.id ? (
                      <input
                        type="text"
                        className="text-black p-0.5 rounded w-36 text-xs"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          executeUpdate(
                            `/zones/${z.id}`,
                            { name: editValue },
                            () => fetchZones(selRegion.id),
                          )
                        }
                      />
                    ) : (
                      <span>{z.name}</span>
                    )}
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal("z", z.id, z.name);
                        }}
                        className={`opacity-80 hover:opacity-100 px-2 ${
                          selZone?.id === z.id
                            ? "text-[#FFD700]"
                            : "text-gray-600 hover:text-[#003366]"
                        }`}
                        title="Edit zone"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          executeDelete(`/zones/${z.id}`, () =>
                            fetchZones(selRegion.id),
                          );
                        }}
                        className={`opacity-80 hover:opacity-100 px-2 ${
                          selZone?.id === z.id
                            ? "text-[#FFD700]"
                            : "text-gray-600 hover:text-red-600"
                        }`}
                        title="Delete zone"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="m-auto text-gray-300 text-xs text-center p-4">
              Select a parent Region to display internal structural Zones.
            </div>
          )}
        </div>

        {/* LEVEL 3: WOREDAS */}
        <div className="w-full lg:w-72 border bg-white rounded-xl shadow-sm flex flex-col h-[520px] sm:h-[620px] flex-shrink-0">
          {selZone ? (
            <>
              <div className="p-4 border-b bg-gray-50 rounded-t-xl space-y-2">
                <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider truncate">
                  3. Woredas ({selZone.name})
                </h2>
                <input
                  type="text"
                  placeholder="🔍 Filter woredas..."
                  className="w-full text-xs p-2 border rounded-lg bg-white shadow-inner focus:ring-1 focus:ring-blue-500"
                  value={queryWoreda}
                  onChange={(e) => setQueryWoreda(e.target.value)}
                />
                <div className="flex">
                  <button
                    onClick={() => openAddModal("w", selZone?.id ?? null)}
                    className="bg-[#003366] text-[#FFD700] px-3 py-1 rounded-lg text-sm hover:bg-[#002244] flex items-center justify-center"
                    title="Add woreda"
                  >
                    Add Woreda
                  </button>
                </div>
              </div>
              <ul className="overflow-y-auto flex-1 p-2 space-y-1">
                {filteredWoredas.length === 0 && woredas.length > 0 && (
                  <div className="text-center text-xs text-gray-400 p-4 italic">
                    No matched woredas found
                  </div>
                )}
                {filteredWoredas.map((w) => (
                  <li
                    key={w.id}
                    onClick={() => setSelWoreda(w)}
                    className={`p-2.5 rounded-lg text-xs font-medium cursor-pointer flex justify-between items-center transition-all ${selWoreda?.id === w.id ? "bg-[#003366] text-[#FFD700] shadow-sm font-bold" : "hover:bg-gray-100 text-gray-700"}`}
                  >
                    {editTier === "w" && editId === w.id ? (
                      <input
                        type="text"
                        className="text-black p-0.5 rounded w-36 text-xs"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          executeUpdate(
                            `/woredas/${w.id}`,
                            { name: editValue },
                            () => fetchWoredas(selZone.id),
                          )
                        }
                      />
                    ) : (
                      <span>{w.name}</span>
                    )}
                    <div className="flex space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal("w", w.id, w.name);
                        }}
                        className={`opacity-80 hover:opacity-100 px-2 ${
                          selWoreda?.id === w.id
                            ? "text-[#FFD700]"
                            : "text-gray-600 hover:text-[#003366]"
                        }`}
                        title="Edit woreda"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          executeDelete(`/woredas/${w.id}`, () =>
                            fetchWoredas(selZone.id),
                          );
                        }}
                        className={`opacity-80 hover:opacity-100 px-2 ${
                          selWoreda?.id === w.id
                            ? "text-[#FFD700]"
                            : "text-gray-600 hover:text-red-600"
                        }`}
                        title="Delete woreda"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="m-auto text-gray-300 text-xs text-center p-4">
              Select an active Zone parameter configuration tree.
            </div>
          )}
        </div>

        {/* LEVEL 4: KEBELES */}
        <div className="w-full lg:w-72 border bg-white rounded-xl shadow-sm flex flex-col h-[520px] sm:h-[620px] flex-shrink-0">
          {selWoreda ? (
            <>
              <div className="p-4 border-b bg-gray-50 rounded-t-xl space-y-2">
                <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider truncate">
                  4. Kebeles ({selWoreda.name})
                </h2>
                <input
                  type="text"
                  placeholder="🔍 Filter kebeles..."
                  className="w-full text-xs p-2 border rounded-lg bg-white shadow-inner focus:ring-1 focus:ring-blue-500"
                  value={queryKebele}
                  onChange={(e) => setQueryKebele(e.target.value)}
                />
                <div className="flex">
                  <button
                    onClick={() => openAddModal("k", selWoreda?.id ?? null)}
                    className="bg-[#003366] text-[#FFD700] px-3 py-1 rounded-lg text-sm hover:bg-[#002244] flex items-center justify-center"
                    title="Add kebele"
                  >
                    Add Kebele
                  </button>
                </div>
              </div>
              <ul className="overflow-y-auto flex-1 p-2 space-y-1">
                {filteredKebeles.length === 0 && kebeles.length > 0 && (
                  <div className="text-center text-xs text-gray-400 p-4 italic">
                    No matched kebeles found
                  </div>
                )}
                {filteredKebeles.map((k) => (
                  <li
                    key={k.id}
                    className="p-2.5 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 flex justify-between items-center transition-all"
                  >
                    {editTier === "k" && editId === k.id ? (
                      <input
                        type="text"
                        className="text-black p-0.5 rounded w-36 text-xs"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          executeUpdate(
                            `/kebeles/${k.id}`,
                            { name: editValue },
                            () => fetchKebeles(selWoreda.id),
                          )
                        }
                      />
                    ) : (
                      <span>{k.name}</span>
                    )}
                    <div className="flex space-x-1">
                      <button
                        onClick={() => {
                          openEditModal("k", k.id, k.name);
                        }}
                        className={`opacity-80 hover:opacity-100 px-2 ${
                          selWoreda?.id === k.id
                            ? "text-[#FFD700]"
                            : "text-gray-600 hover:text-[#003366]"
                        }`}
                        title="Edit kebele"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          executeDelete(`/kebeles/${k.id}`, () =>
                            fetchKebeles(selWoreda.id),
                          )
                        }
                        className={`opacity-80 hover:opacity-100 px-2 ${
                          selWoreda?.id === k.id
                            ? "text-[#FFD700]"
                            : "text-gray-600 hover:text-red-600"
                        }`}
                        title="Delete kebele"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="m-auto text-gray-300 text-xs text-center p-4">
              Select an internal operational Woreda partition.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
