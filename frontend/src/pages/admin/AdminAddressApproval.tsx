import React, { useState, useEffect } from "react";
import AdminAddressApprovalCard, {
  AddressChangeRequest,
} from "./AdminAddressApprovalCard";
import { MapPin } from "lucide-react";
import { apiRequest } from "../../lib/api";
import { AutoDismissToast, ToastType } from "../../components/AutoDismissToast";

export const AdminAddressApproval = () => {
  const [requests, setRequests] = useState<AddressChangeRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastType, setToastType] = useState<ToastType>("success");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    fetchAddressChangeRequests();
  }, []);

  const showToast = (type: ToastType, message: string) => {
    setToastType(type);
    setToastMessage(message);
    setToastOpen(true);
  };

  const fetchAddressChangeRequests = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<{
        success: boolean;
        message: string;
        data: AddressChangeRequest[];
      }>("/organizations/address-change-requests");
      setRequests(res.data || []);
    } catch (err) {
      showToast(
        "error",
        err instanceof Error
          ? err.message
          : "Failed to fetch address change requests",
      );
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRequest = async (
    requestId: number,
    action: "APPROVED" | "REJECTED",
    feedback: string,
  ) => {
    try {
      await apiRequest(`/organizations/address-change-requests/${requestId}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: action,
          feedback,
        }),
      });

      // Show success toast
      showToast(
        "success",
        `Address change request ${action.toLowerCase()} successfully`,
      );

      // Refresh the list so the UI shows the actual status returned by server
      await fetchAddressChangeRequests();
    } catch (err) {
      showToast(
        "error",
        err instanceof Error
          ? err.message
          : `Failed to ${action.toLowerCase()} request`,
      );
    }
  };

  return (
    <div className="space-y-6">
      <AutoDismissToast
        isOpen={toastOpen}
        type={toastType}
        message={toastMessage}
        onClose={() => setToastOpen(false)}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-3 rounded-lg">
            <MapPin className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-primary uppercase tracking-tight">
              Address Change Approvals
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Review and approve organization address change requests
            </p>
          </div>
        </div>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
          {requests.filter((r) => r.status === "PENDING").length} Pending
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <MapPin className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">
            No pending address change requests
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {requests.map((request) => (
            <AdminAddressApprovalCard
              key={request.id}
              request={request}
              onProcessRequest={handleProcessRequest}
              onShowToast={showToast}
            />
          ))}
        </div>
      )}
    </div>
  );
};
