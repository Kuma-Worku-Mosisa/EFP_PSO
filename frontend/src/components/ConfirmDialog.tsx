// frontend/src/components/ConfirmDialog.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  X,
  Check,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ActionType = "delete" | "approve" | "reject" | "update" | "default";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: ActionType;
  isLoading?: boolean;
  isConfirmDisabled?: boolean;
  // optional input for dialogs that need user text (e.g., rejection reason)
  inputLabel?: string;
  inputValue?: string;
  onInputChange?: (val: string) => void;
  inputPlaceholder?: string;
}
interface ActionConfigItem {
  icon: React.ReactElement;
  iconColor?: string;
  btnClass: string;
  iconBg?: string;
  btnIcon?: React.ReactElement;
  confirmText: string;
}

const actionConfig: Record<ActionType, ActionConfigItem> = {
  delete: {
    icon: <AlertTriangle className="w-6 h-6" />,
    iconColor: "#FFD700",
    btnClass: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    iconBg: "#003366",
    btnIcon: <Trash2 className="w-4 h-4 mr-2" />,
    confirmText: "Delete",
  },
  approve: {
    icon: <CheckCircle className="w-6 h-6" />,
    iconColor: "#003366",
    btnClass: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500",
    iconBg: "#FFD700",
    confirmText: "Approve",
  },
  reject: {
    icon: <XCircle className="w-6 h-6" />,
    iconColor: "#FFD700",
    btnClass: "bg-rose-600 hover:bg-rose-700 focus:ring-rose-500",
    iconBg: "#003366",
    confirmText: "Reject",
  },
  update: {
    icon: <RefreshCw className="w-6 h-6" />,
    iconColor: "#003366",
    btnClass: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    iconBg: "#FFD700",
    btnIcon: <RefreshCw className="w-4 h-4 mr-2" />,
    confirmText: "Update",
  },
  default: {
    icon: <AlertTriangle className="w-6 h-6" />,
    iconColor: "#003366",
    btnClass: "bg-[#003366] hover:bg-[#002244] focus:ring-[#003366]",
    iconBg: "#FFD700",
    btnIcon: <Check className="w-4 h-4 mr-2" />,
    confirmText: "Confirm",
  },
};

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "default",
  isLoading,
  isConfirmDisabled = false,
  // input props
  inputLabel,
  inputValue,
  onInputChange,
  inputPlaceholder,
}: ConfirmDialogProps) => {
  const config = actionConfig[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[999]"
          />

          {/* Dialog Container */}
          <div className="fixed inset-0 flex items-center justify-center z-[1000] p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={cn(
                "bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden relative p-1.5",
                "ring-4",
              )}
              style={{
                backgroundColor: "#FFD700",
                boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
              }}
            >
              <div
                className="bg-white rounded-[26px] border-[2.5px] p-7 overflow-hidden confirm-dialog"
                style={{ borderColor: "#003366" }}
              >
                <style>{`
                  .confirm-dialog ::selection { background: #FFD700; color: #003366; }
                  .confirm-dialog { font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif; font-size: 14px; }
                  .confirm-dialog h3 { font-size: 20px; font-weight: 800; }
                  .confirm-dialog p { font-size: 14px; }
                `}</style>
                {/* Header Section */}
                <div className="flex items-start justify-between mb-6">
                  <div
                    className="p-3.5 rounded-2xl shadow-inner"
                    style={{ backgroundColor: config.iconBg || "#FFD700" }}
                  >
                    {React.cloneElement(config.icon as any, {
                      style: { color: config.iconColor || "#003366" },
                    })}
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400 hover:text-gray-900 group"
                  >
                    <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                  </button>
                </div>

                {/* Content Section */}
                <div className="space-y-3">
                  <h3
                    className="text-2xl font-black tracking-tight leading-tight"
                    style={{ color: "#003366" }}
                  >
                    {title}
                  </h3>
                  <p className="text-sm text-gray-600 font-medium leading-relaxed">
                    {message}
                  </p>
                  {/* Optional input */}
                  {/** render input if inputLabel provided via props **/}
                  {(inputLabel || inputPlaceholder) && (
                    <div className="mt-2">
                      <label className="block text-xs font-bold text-slate-600 mb-1">
                        {inputLabel}
                      </label>
                      <textarea
                        value={inputValue}
                        onChange={(e) =>
                          onInputChange && onInputChange(e.target.value)
                        }
                        placeholder={inputPlaceholder}
                        className="w-full border border-slate-300 p-3 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        rows={4}
                      />
                    </div>
                  )}
                </div>

                {/* Actions Section */}
                <div className="flex items-center space-x-3 mt-8">
                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="flex-1 px-4 py-4 rounded-2xl text-sm font-extrabold text-gray-500 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all active:scale-[0.97] disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onConfirm}
                    disabled={isLoading || isConfirmDisabled}
                    className={cn(
                      "flex-[1.5] px-4 py-4 rounded-2xl text-sm font-extrabold text-white shadow-lg transition-all active:scale-[0.97] focus:ring-4 focus:ring-offset-2 flex items-center justify-center",
                      config.btnClass,
                      (isLoading || isConfirmDisabled) &&
                        "opacity-80 cursor-not-allowed",
                    )}
                  >
                    {isLoading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        {config.btnIcon}
                        {config.confirmText}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
