// file: frontend/src/components/payment/RefundManagementModal.tsx
"use client";

import { useState } from "react";
import {
  RefreshCw,
  X,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  orderNumber: string;
  settledAmount: number;
  onRefundComplete: () => void;
}

export default function RefundManagementModal({
  isOpen,
  onClose,
  transactionId,
  orderNumber,
  settledAmount,
  onRefundComplete,
}: RefundModalProps) {
  const [amount, setAmount] = useState(settledAmount.toString());
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "SUCCESS" | "ERROR";
    msg: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parseFloat(amount) > settledAmount) {
      setFeedback({
        type: "ERROR",
        msg: "Refund volume cannot exceed original aggregate order value.",
      });
      return;
    }

    try {
      setSubmitting(true);
      setFeedback(null);

      const response = await fetch("/api/payments/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId, amount, reason }),
      });
      const res = await response.json();

      if (res?.success) {
        setFeedback({
          type: "SUCCESS",
          msg: `Refund executed successfully! Tracking ID: ${res.refundOrderId}`,
        });
        onRefundComplete();
      } else {
        setFeedback({
          type: "ERROR",
          msg: res?.error || "Transaction dropped by processing gateway rules.",
        });
      }
    } catch (err) {
      setFeedback({
        type: "ERROR",
        msg: "Communication break with transaction engine server.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-[#F8FAFB] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-[#003265] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#FFD700]" />
            <h3 className="text-xs font-black tracking-widest uppercase text-white/90">
              Issue Telebirr Gateway Refund
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleRefundSubmit} className="p-6 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400 font-medium">Order Number:</span>
              <span className="font-bold text-gray-900">{orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-medium">Max Limit:</span>
              <span className="font-bold text-[#003265]">
                {settledAmount} ETB
              </span>
            </div>
          </div>

          {feedback && (
            <div
              className={`p-3 rounded-xl flex items-start gap-2.5 text-xs font-medium ${feedback.type === "SUCCESS" ? "bg-green-50 text-green-800 border border-green-100" : "bg-red-50 text-red-800 border border-red-100"}`}
            >
              {feedback.type === "SUCCESS" ? (
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <span>{feedback.msg}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-[#003265]/70 block">
              Refund Amount (ETB)
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={submitting}
              className="w-full bg-white border border-gray-200 px-3 py-2.5 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#003265] transition-colors"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-[#003265]/70 block">
              Reason for Refund Allocation
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={submitting}
              rows={3}
              placeholder="Provide exact regulatory or processing audit cancellation parameters..."
              className="w-full bg-white border border-gray-200 p-3 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:border-[#003265] transition-colors resize-none"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 bg-gray-200/70 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{ backgroundColor: "#003265" }}
              className="px-5 py-2.5 text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#003265]/90 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#FFD700]" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5 text-[#FFD700]" />
              )}
              <span>Execute Refund</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
