//filepath: frontend/src/pages/HRmanagement/AddressChangeRequestForm.tsx
import React, { useEffect, useState } from "react";
import { MapPin, Send } from "lucide-react";
import { apiRequest } from "../../lib/api";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { AutoDismissToast, ToastType } from "../../components/AutoDismissToast";

interface AddressFormData {
  regionId: string;
  zoneId: string;
  woredaId: string;
  kebeleId: string;
  houseNumber: string;
  specialLocation: string;
  reason: string;
}

interface LocationOption {
  id: number;
  nameEnglish?: string | null;
  nameAmharic?: string | null;
}

export default function AddressChangeRequestForm() {
  const [activeTab, setActiveTab] = useState<"form" | "history">("form");
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [requests, setRequests] = useState<Array<any>>([]);
  const [historyFilter, setHistoryFilter] = useState<
    "ALL" | "PENDING" | "APPROVED" | "REJECTED"
  >("ALL");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [formData, setFormData] = useState<AddressFormData>({
    regionId: "",
    zoneId: "",
    woredaId: "",
    kebeleId: "",
    houseNumber: "",
    specialLocation: "",
    reason: "",
  });
  const [regions, setRegions] = useState<LocationOption[]>([]);
  const [zones, setZones] = useState<LocationOption[]>([]);
  const [woredas, setWoredas] = useState<LocationOption[]>([]);
  const [kebeles, setKebeles] = useState<LocationOption[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    isOpen: boolean;
    type: ToastType;
    message: string;
  }>({ isOpen: false, type: "success", message: "" });
  const [loading, setLoading] = useState({
    regions: false,
    zones: false,
    woredas: false,
    kebeles: false,
  });
  const [hasPendingRequest, setHasPendingRequest] = useState(false);

  useEffect(() => {
    if (activeTab !== "history") return;

    let isMounted = true;
    const loadRequests = async () => {
      setHistoryLoading(true);
      setHistoryError(null);
      try {
        const res = await apiRequest<any>(
          "/organizations/address-change-requests",
        );
        if (!isMounted) return;
        // Debug log the raw response to help diagnose shapes
        if (import.meta.env.DEV)
          console.log("Loaded address-change-requests response:", res);

        // Normalize possible response shapes: { success, message, data: [...] } or { data: [...] } or direct array
        let list: any[] = [];
        if (!res) list = [];
        else if (Array.isArray(res)) list = res;
        else if (Array.isArray(res.data)) list = res.data;
        else if (Array.isArray(res?.data?.data)) list = res.data.data;
        else list = [];

        setRequests(list || []);
      } catch (err: any) {
        if (!isMounted) return;
        setHistoryError(
          err?.message || "Failed to load address change requests.",
        );
      } finally {
        if (!isMounted) return;
        setHistoryLoading(false);
      }
    };

    loadRequests();
    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  // Check for existing pending requests to prevent duplicate submissions
  useEffect(() => {
    let isMounted = true;
    const checkPending = async () => {
      try {
        const res = await apiRequest<any>(
          "/organizations/address-change-requests",
        );
        if (!isMounted) return;
        let list: any[] = [];
        if (!res) list = [];
        else if (Array.isArray(res)) list = res;
        else if (Array.isArray(res.data)) list = res.data;
        else if (Array.isArray(res?.data?.data)) list = res.data.data;
        else list = [];

        const pending = (list || []).some((r) => r.status === "PENDING");
        setHasPendingRequest(Boolean(pending));
      } catch (err) {
        // ignore — keep existing form behavior
      }
    };

    checkPending();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadRegions = async () => {
      setLoading((state) => ({ ...state, regions: true }));
      setLoadError(null);

      try {
        const res = await apiRequest<{ data: LocationOption[] }>(
          "/location/regions",
        );
        if (!isMounted) return;
        setRegions(res.data || []);
      } catch (error: any) {
        if (!isMounted) return;
        setLoadError(
          error?.message || "Failed to load region list. Please refresh.",
        );
      } finally {
        if (!isMounted) return;
        setLoading((state) => ({ ...state, regions: false }));
      }
    };

    loadRegions();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!formData.regionId) {
      setZones([]);
      setWoredas([]);
      setKebeles([]);
      setFormData((prev) => ({
        ...prev,
        zoneId: "",
        woredaId: "",
        kebeleId: "",
      }));
      return;
    }

    let isMounted = true;
    const loadZones = async () => {
      setLoading((state) => ({ ...state, zones: true }));
      setLoadError(null);

      try {
        const res = await apiRequest<{ data: LocationOption[] }>(
          `/location/regions/${formData.regionId}/zones`,
        );
        if (!isMounted) return;
        setZones(res.data || []);
      } catch (error: any) {
        if (!isMounted) return;
        setLoadError(
          error?.message || "Unable to load zones for selected region.",
        );
      } finally {
        if (!isMounted) return;
        setLoading((state) => ({ ...state, zones: false }));
      }
    };

    loadZones();
    return () => {
      isMounted = false;
    };
  }, [formData.regionId]);

  useEffect(() => {
    if (!formData.zoneId) {
      setWoredas([]);
      setKebeles([]);
      setFormData((prev) => ({
        ...prev,
        woredaId: "",
        kebeleId: "",
      }));
      return;
    }

    let isMounted = true;
    const loadWoredas = async () => {
      setLoading((state) => ({ ...state, woredas: true }));
      setLoadError(null);

      try {
        const res = await apiRequest<{ data: LocationOption[] }>(
          `/location/zones/${formData.zoneId}/woredas`,
        );
        if (!isMounted) return;
        setWoredas(res.data || []);
      } catch (error: any) {
        if (!isMounted) return;
        setLoadError(
          error?.message || "Unable to load woredas for selected zone.",
        );
      } finally {
        if (!isMounted) return;
        setLoading((state) => ({ ...state, woredas: false }));
      }
    };

    loadWoredas();
    return () => {
      isMounted = false;
    };
  }, [formData.zoneId]);

  useEffect(() => {
    if (!formData.woredaId) {
      setKebeles([]);
      setFormData((prev) => ({ ...prev, kebeleId: "" }));
      return;
    }

    let isMounted = true;
    const loadKebeles = async () => {
      setLoading((state) => ({ ...state, kebeles: true }));
      setLoadError(null);

      try {
        const res = await apiRequest<{ data: LocationOption[] }>(
          `/location/woredas/${formData.woredaId}/kebeles`,
        );
        if (!isMounted) return;
        setKebeles(res.data || []);
      } catch (error: any) {
        if (!isMounted) return;
        setLoadError(
          error?.message || "Unable to load kebeles for selected woreda.",
        );
      } finally {
        if (!isMounted) return;
        setLoading((state) => ({ ...state, kebeles: false }));
      }
    };

    loadKebeles();
    return () => {
      isMounted = false;
    };
  }, [formData.woredaId]);

  const getOptionLabel = (item: LocationOption) =>
    item.nameEnglish || item.nameAmharic || `#${item.id}`;

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setLoadError(null);
    setIsConfirmOpen(true);
  };

  const submitRequest = async () => {
    setConfirmLoading(true);
    setIsSubmitting(true);
    try {
      if (hasPendingRequest) {
        setToast({
          isOpen: true,
          type: "error",
          message: "You already have a pending address change request.",
        });
        setIsConfirmOpen(false);
        return;
      }
      const payload = {
        requestedKebeleId: Number(formData.kebeleId),
        requestedHouseNumber: formData.houseNumber || undefined,
        requestedSpecialLocation: formData.specialLocation || undefined,
        reason: formData.reason,
      };

      console.log("Submitting request payload:", payload);
      await apiRequest("/organizations/address-change-requests", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setToast({
        isOpen: true,
        type: "success",
        message: "Address change request submitted successfully.",
      });
      setHasPendingRequest(true);
      setFormData({
        regionId: "",
        zoneId: "",
        woredaId: "",
        kebeleId: "",
        houseNumber: "",
        specialLocation: "",
        reason: "",
      });
      setZones([]);
      setWoredas([]);
      setKebeles([]);
      setIsConfirmOpen(false);
    } catch (error: any) {
      console.error("Failed to submit request", error);
      const msg =
        error?.message ||
        "Unable to submit address change request. Please try again.";
      setLoadError(msg);
      setToast({ isOpen: true, type: "error", message: msg });
    } finally {
      setConfirmLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center gap-3 mb-6 border-b pb-4">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
          <MapPin size={24} />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Request Address Change
          </h2>
          <p className="text-sm text-gray-500">
            Submit a new address for admin approval.
          </p>
        </div>
      </div>
      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setActiveTab("form")}
            className={`px-4 py-2 rounded-t-lg border-b-2 ${
              activeTab === "form"
                ? "border-blue-600 text-blue-700 bg-blue-50"
                : "border-transparent text-gray-600 bg-white"
            }`}
          >
            Request Address Change
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-t-lg border-b-2 ${
              activeTab === "history"
                ? "border-blue-600 text-blue-700 bg-blue-50"
                : "border-transparent text-gray-600 bg-white"
            }`}
          >
            Request Address History
          </button>
        </div>
      </div>

      {activeTab === "form" ? (
        <form onSubmit={handleOpenConfirm} className="space-y-6">
          <div className="space-y-4">
            {loadError ? (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                {loadError}
              </div>
            ) : null}
            {hasPendingRequest ? (
              <div className="text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                You have a pending address change request. You cannot submit a
                new one until it is processed.
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Region *
                </label>
                <select
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  value={formData.regionId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      regionId: e.target.value,
                      zoneId: "",
                      woredaId: "",
                      kebeleId: "",
                    })
                  }
                >
                  <option value="">
                    {loading.regions
                      ? "Loading regions..."
                      : "-- Select Region --"}
                  </option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {getOptionLabel(region)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zone/Sub-city *
                </label>
                <select
                  required
                  disabled={!formData.regionId || loading.zones}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white disabled:bg-gray-100"
                  value={formData.zoneId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      zoneId: e.target.value,
                      woredaId: "",
                      kebeleId: "",
                    })
                  }
                >
                  <option value="">
                    {formData.regionId
                      ? loading.zones
                        ? "Loading zones..."
                        : "-- Select Zone --"
                      : "Select a region first"}
                  </option>
                  {zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {getOptionLabel(zone)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Woreda *
                </label>
                <select
                  required
                  disabled={!formData.zoneId || loading.woredas}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white disabled:bg-gray-100"
                  value={formData.woredaId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      woredaId: e.target.value,
                      kebeleId: "",
                    })
                  }
                >
                  <option value="">
                    {formData.zoneId
                      ? loading.woredas
                        ? "Loading woredas..."
                        : "-- Select Woreda --"
                      : "Select a zone first"}
                  </option>
                  {woredas.map((woreda) => (
                    <option key={woreda.id} value={woreda.id}>
                      {getOptionLabel(woreda)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kebele *
                </label>
                <select
                  required
                  disabled={!formData.woredaId || loading.kebeles}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white disabled:bg-gray-100"
                  value={formData.kebeleId}
                  onChange={(e) =>
                    setFormData({ ...formData, kebeleId: e.target.value })
                  }
                >
                  <option value="">
                    {formData.woredaId
                      ? loading.kebeles
                        ? "Loading kebeles..."
                        : "-- Select Kebele --"
                      : "Select a woreda first"}
                  </option>
                  {kebeles.map((kebele) => (
                    <option key={kebele.id} value={kebele.id}>
                      {getOptionLabel(kebele)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  House Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 124/A"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.houseNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, houseNumber: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Location (ልዩ ቦታ)
              </label>
              <input
                type="text"
                placeholder="e.g. ከቴሌ መብራት ጀርባ"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.specialLocation}
                onChange={(e) =>
                  setFormData({ ...formData, specialLocation: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Change *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Explain why the organization is moving..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
              />
            </div>
          </div>

          <div className="pt-4 border-t flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || hasPendingRequest}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              <Send size={18} />
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Filter:</label>
              <select
                value={historyFilter}
                onChange={(e) => setHistoryFilter(e.target.value as any)}
                className="px-3 py-1 border rounded"
              >
                <option value="ALL">All</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <div className="text-sm text-gray-500">
              {historyLoading ? "Loading..." : `${requests.length} requests`}
            </div>
          </div>

          {historyError ? (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              {historyError}
            </div>
          ) : null}

          <div className="space-y-3">
            {(requests || [])
              .filter(
                (r) => historyFilter === "ALL" || r.status === historyFilter,
              )
              .map((r) => (
                <div key={r.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Request #{r.id}</div>
                    <div>
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          r.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : r.status === "APPROVED"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-700 mt-2">
                    {r.requestedAddressText}
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    Reason: {r.reason || "-"}
                  </div>
                  {r.adminFeedback ? (
                    <div className="text-sm text-gray-500 mt-2">
                      Admin feedback: {r.adminFeedback}
                    </div>
                  ) : null}
                  <div className="text-xs text-gray-400 mt-2">
                    Submitted: {new Date(r.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={submitRequest}
        title="Confirm Address Change Request"
        message="Are you sure you want to submit this address change request for admin approval?"
        type="default"
        isLoading={confirmLoading}
        isConfirmDisabled={!formData.kebeleId || confirmLoading}
      />
      <AutoDismissToast
        isOpen={toast.isOpen}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, isOpen: false })}
      />
    </div>
  );
}
