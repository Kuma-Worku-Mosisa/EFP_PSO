//frontend/src/components/AutoDismissToast.tsx

import React from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export type ToastType = "success" | "error";

interface AutoDismissToastProps {
  isOpen: boolean;
  type: ToastType;
  message: string;
  onClose: () => void;
  durationMs?: number;
}

export const AutoDismissToast: React.FC<AutoDismissToastProps> = ({
  isOpen,
  type,
  message,
  onClose,
  durationMs = 5000,
}) => {
  const [progressWidth, setProgressWidth] = React.useState("100%");

  React.useEffect(() => {
    if (!isOpen) {
      setProgressWidth("100%");
      return;
    }

    setProgressWidth("100%");
    const animationFrame = window.requestAnimationFrame(() => {
      setProgressWidth("0%");
    });

    const closeTimer = window.setTimeout(() => {
      onClose();
    }, durationMs);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(closeTimer);
    };
  }, [durationMs, isOpen, onClose]);

  if (!isOpen) return null;

  const isSuccess = type === "success";

  const borderColor = "#003366";
  const accentColor = "#FFD700";

  return (
    <div className="fixed top-5 right-5 z-[100] w-[92vw] max-w-md">
      <div
        style={{ borderColor }}
        className={`overflow-hidden rounded-2xl border bg-white shadow-2xl backdrop-blur-sm`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start gap-3 p-4">
          <div
            className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-full`}
            style={{
              background: isSuccess ? accentColor : borderColor,
              color: isSuccess ? borderColor : accentColor,
            }}
          >
            {isSuccess ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900">
              {isSuccess ? "Success" : "Error"}
            </p>
            <p className="mt-1 text-sm leading-5 text-gray-600">{message}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Dismiss notification"
            className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="h-1 w-full bg-gray-100">
          <div
            className={`h-full transition-[width] duration-5000 ease-linear`}
            style={{
              width: progressWidth,
              background: isSuccess ? borderColor : accentColor,
            }}
          />
        </div>
      </div>
    </div>
  );
};
