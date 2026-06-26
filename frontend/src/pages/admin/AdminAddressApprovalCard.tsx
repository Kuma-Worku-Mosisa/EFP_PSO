//filepath: frontend/src/pages/admin/AdminAddressApprovalCard.tsx
import React, { useState } from "react";
import { CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { ToastType } from "../../components/AutoDismissToast";
import { useLanguage } from "../../context/LanguageContext";

interface AddressDetails {
  regionName: string;
  zoneName: string;
  woredaName: string;
  kebeleName: string;
  specialLocation: string | null;
  houseNumber: string | null;
}

export interface AddressChangeRequest {
  id: number;
  organizationName: string;
  createdAt: string;
  reason: string;
  status: string;
  adminFeedback?: string | null;
  currentAddress: AddressDetails;
  requestedAddress: AddressDetails;
}

interface AdminAddressApprovalCardProps {
  request: AddressChangeRequest;
  onProcessRequest: (
    requestId: number,
    action: "APPROVED" | "REJECTED",
    feedback: string,
  ) => Promise<void>;
  onShowToast?: (type: ToastType, message: string) => void;
}

export default function AdminAddressApprovalCard({
  request,
  onProcessRequest,
  onShowToast,
}: AdminAddressApprovalCardProps) {
  const { language } = useLanguage();
  const isAm = language === "am";
  const [feedback, setFeedback] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async (action: "APPROVED" | "REJECTED") => {
    if (action === "REJECTED" && !feedback.trim()) {
      onShowToast?.("error", isAm ? "እምቢ ለማለት አስተያየት ያስፈልጋል።" : "Feedback is required to reject a request.");
      return;
    }

    setIsProcessing(true);
    try {
      await onProcessRequest(request.id, action, feedback);
    } catch (error) {
      console.error(`Failed to ${action.toLowerCase()} request`, error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-gray-800">
            {isAm ? "የአድራሻ ለውጥ ጥያቄ" : "Address Change Request"}
          </h3>
          <p className="text-sm text-gray-500">
            {request.organizationName} • {isAm ? "የቀረበ" : "Submitted"}{" "}
            {new Date(request.createdAt).toLocaleDateString()}
          </p>
        </div>
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full border ${
            request.status === "PENDING"
              ? "bg-yellow-100 text-yellow-800 border-yellow-200"
              : request.status === "APPROVED"
                ? "bg-green-100 text-green-800 border-green-200"
                : "bg-red-100 text-red-800 border-red-200"
          }`}
        >
          {request.status}
        </span>
      </div>

      <div className="p-6">
        {/* Comparison View */}
        <div className="grid gap-4 mb-6 lg:grid-cols-[1fr_20px_1fr]">
          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider mb-4">
              {isAm ? "አሁን ያለው አድራሻ" : "Current Address"}
            </h4>
            <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-x-4 gap-y-3 text-sm text-gray-700">
              <span className="font-semibold text-gray-600">{isAm ? "ክልል:" : "Region:"}</span>
              <span>{request.currentAddress.regionName || (isAm ? "የለም" : "N/A")}</span>
              <span className="font-semibold text-gray-600">{isAm ? "ክፍለ ከተማ/ዞን:" : "Subcity/Zone:"}</span>
              <span>{request.currentAddress.zoneName || (isAm ? "የለም" : "N/A")}</span>
              <span className="font-semibold text-gray-600">{isAm ? "ወረዳ:" : "Woreda:"}</span>
              <span>{request.currentAddress.woredaName || (isAm ? "የለም" : "N/A")}</span>
              <span className="font-semibold text-gray-600">{isAm ? "ቀበሌ:" : "Kebele:"}</span>
              <span>{request.currentAddress.kebeleName || (isAm ? "የለም" : "N/A")}</span>
              <span className="font-semibold text-gray-600">
                {isAm ? "ልዩ ቦታ:" : "Special Location:"}
              </span>
              <span>{request.currentAddress.specialLocation || (isAm ? "የለም" : "N/A")}</span>
              <span className="font-semibold text-gray-600">{isAm ? "የቤት ቁጥር:" : "House Number:"}</span>
              <span>{request.currentAddress.houseNumber || (isAm ? "የለም" : "N/A")}</span>
            </div>
          </div>

          <ArrowRight
            className="text-gray-400 self-center justify-self-center"
            size={24}
          />

          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <h4 className="text-xs font-bold text-green-800 uppercase tracking-wider mb-4">
              {isAm ? "የተጠየቀው አድራሻ" : "Requested Address"}
            </h4>
            <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-x-4 gap-y-3 text-sm text-gray-700">
              <span className="font-semibold text-gray-600">{isAm ? "ክልል:" : "Region:"}</span>
              <span>{request.requestedAddress.regionName || (isAm ? "የለም" : "N/A")}</span>
              <span className="font-semibold text-gray-600">{isAm ? "ክፍለ ከተማ/ዞን:" : "Subcity/Zone:"}</span>
              <span>{request.requestedAddress.zoneName || (isAm ? "የለም" : "N/A")}</span>
              <span className="font-semibold text-gray-600">{isAm ? "ወረዳ:" : "Woreda:"}</span>
              <span>{request.requestedAddress.woredaName || (isAm ? "የለም" : "N/A")}</span>
              <span className="font-semibold text-gray-600">{isAm ? "ቀበሌ:" : "Kebele:"}</span>
              <span>{request.requestedAddress.kebeleName || (isAm ? "የለም" : "N/A")}</span>
              <span className="font-semibold text-gray-600">
                {isAm ? "ልዩ ቦታ:" : "Special Location:"}
              </span>
              <span>{request.requestedAddress.specialLocation || (isAm ? "የለም" : "N/A")}</span>
              <span className="font-semibold text-gray-600">{isAm ? "የቤት ቁጥር:" : "House Number:"}</span>
              <span>{request.requestedAddress.houseNumber || (isAm ? "የለም" : "N/A")}</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-800 mb-1">
            {isAm ? "የለውጥ ምክንያት:" : "Reason for Change:"}
          </h4>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
            {request.reason}
          </p>
        </div>

        {/* Action Area */}
        <div className="space-y-4 pt-4 border-t">
          <textarea
            placeholder={isAm ? "የአስተዳዳሪ አስተያየት ያስገቡ (እምቢ ለማለት ያስፈልጋል)..." : "Add admin feedback (required for rejection)..."}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
            rows={2}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            disabled={request.status !== "PENDING"}
          />

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => handleAction("REJECTED")}
              disabled={isProcessing || request.status !== "PENDING"}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition disabled:opacity-50"
            >
              <XCircle size={18} className="text-red-500" />
              {isAm ? "እምቢ በል" : "Reject"}
            </button>
            <button
              onClick={() => handleAction("APPROVED")}
              disabled={isProcessing || request.status !== "PENDING"}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition disabled:opacity-50"
            >
              <CheckCircle size={18} />
              {isAm ? "ለውጡን ያረጋግጡ" : "Approve Change"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
