// filepath: frontend/src/components/DocumentPreviewer.tsx
import { useState } from "react";
import {
  ExternalLink,
  FileText,
  ImageIcon,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface DocumentPreviewerProps {
  url: string;
  /** * Optional: Explicitly tell the component what type of file it is.
   * If left blank, it will try to guess from the URL extension.
   */
  fileType?: "pdf" | "image";
  fileName?: string;
  /** Pass class names to control the height of the container */
  className?: string;
  isVerified?: boolean;
  onToggleVerified?: () => void;
}

export default function DocumentPreviewer({
  url,
  fileType,
  fileName = "Document",
  className = "h-[80vh] w-full",
  isVerified,
  onToggleVerified,
}: DocumentPreviewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Normalize URL to handle both relative and absolute paths
  const normalizeUrl = (inputUrl: string) => {
    if (!inputUrl) return "";

    // If it's already an absolute URL (http/https/blob/data), return as-is
    if (
      inputUrl.startsWith("http://") ||
      inputUrl.startsWith("https://") ||
      inputUrl.startsWith("blob:") ||
      inputUrl.startsWith("data:")
    ) {
      return inputUrl;
    }

    // If it's a relative path, prepend the origin
    if (inputUrl.startsWith("/")) {
      return `${window.location.origin}${inputUrl}`;
    }

    // Otherwise assume it's a relative path from root
    return `${window.location.origin}/${inputUrl}`;
  };

  const normalizedUrl = normalizeUrl(url);

  // Auto-detect file type if not explicitly provided
  const detectedType =
    fileType ||
    (normalizedUrl.toLowerCase().includes(".pdf") ||
    fileName.toLowerCase().includes(".pdf")
      ? "pdf"
      : "image");

  if (!normalizedUrl) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-xl ${className}`}
      >
        <AlertCircle className="h-8 w-8 text-slate-400 mb-2" />
        <p className="text-sm font-medium text-slate-500">
          No document URL provided.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`relative flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      {/* Header Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/80">
        <div className="flex items-center gap-2">
          {detectedType === "pdf" ? (
            <FileText className="h-4 w-4 text-indigo-600" />
          ) : (
            <ImageIcon className="h-4 w-4 text-emerald-600" />
          )}
          <span className="text-sm font-bold text-slate-700 truncate max-w-[200px] sm:max-w-md">
            {fileName}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            if (normalizedUrl) {
              window.open(normalizedUrl, "_blank", "noopener,noreferrer");
            }
          }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-200 shadow-sm cursor-pointer"
          title="Open in new tab"
        >
          Open External
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Loading State Overlay */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 top-[53px] flex flex-col items-center justify-center bg-slate-50 z-10">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mb-3" />
          <span className="text-xs font-medium text-slate-500 tracking-wider uppercase">
            Loading Document...
          </span>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 top-[53px] flex flex-col items-center justify-center bg-rose-50 z-10">
          <AlertCircle className="h-8 w-8 text-rose-500 mb-3" />
          <span className="text-sm font-bold text-rose-800">
            Failed to load document
          </span>
          <p className="text-xs text-rose-600 mt-1">
            The file might have been moved or the URL is invalid.
          </p>
        </div>
      )}

      {/* Document Viewer Canvas */}
      <div className="relative flex-1 min-h-0 overflow-hidden bg-slate-100">
        {detectedType === "pdf" ? (
          <iframe
            src={`${normalizedUrl}#view=FitH`} // FitH tells the native PDF viewer to fit horizontally
            className="w-full h-full border-none"
            title={fileName}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-4">
            <img
              src={normalizedUrl}
              alt={fileName}
              className="max-w-full max-h-full object-contain drop-shadow-md rounded"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
            />
          </div>
        )}

        {onToggleVerified && (
          <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-white/95 border border-slate-300 px-3 py-2 shadow-lg backdrop-blur">
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                isVerified
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {isVerified ? "Verified" : "Unverified"}
            </span>
            <button
              type="button"
              onClick={onToggleVerified}
              className="text-xs font-semibold text-slate-700 rounded-full border border-slate-200 px-2 py-1 transition duration-150 cursor-pointer hover:bg-slate-100 active:bg-slate-200 hover:border-slate-300 hover:text-slate-900"
            >
              {isVerified ? "Mark as Unverified" : "Mark as Verified"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
