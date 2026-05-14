// frontend/src/components/ConfirmDialog.tsx
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  X,
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
}

const actionConfig = {
  delete: {
    icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
    btnClass: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    iconBg: "bg-red-50",
    confirmText: "Delete",
  },
  approve: {
    icon: <CheckCircle className="w-6 h-6 text-emerald-600" />,
    btnClass: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500",
    iconBg: "bg-emerald-50",
    confirmText: "Approve",
  },
  reject: {
    icon: <XCircle className="w-6 h-6 text-rose-600" />,
    btnClass: "bg-rose-600 hover:bg-rose-700 focus:ring-rose-500",
    iconBg: "bg-rose-50",
    confirmText: "Reject",
  },
  update: {
    icon: <RefreshCw className="w-6 h-6 text-blue-600" />,
    btnClass: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    iconBg: "bg-blue-50",
    confirmText: "Update",
  },
  default: {
    icon: <AlertTriangle className="w-6 h-6 text-primary" />,
    btnClass: "bg-primary hover:bg-primary/90 focus:ring-primary",
    iconBg: "bg-primary/10",
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
                "ring-4 ring-[#DCC380]/30", // Outer Goldish Border (Soft Ring)
              )}
              style={{ backgroundColor: "#DCC380" }} // Using as the outer layer color
            >
              <div
                className="bg-white rounded-[26px] border-[2.5px] p-7 overflow-hidden"
                style={{ borderColor: "#0C2A4C" }} // Inner Deep Blue Border
              >
                {/* Header Section */}
                <div className="flex items-start justify-between mb-6">
                  <div
                    className={cn(
                      "p-3.5 rounded-2xl shadow-inner",
                      config.iconBg,
                    )}
                  >
                    {config.icon}
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
                    style={{ color: "#0C2A4C" }}
                  >
                    {title}
                  </h3>
                  <p className="text-sm text-gray-600 font-medium leading-relaxed">
                    {message}
                  </p>
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
                      config.confirmText
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
