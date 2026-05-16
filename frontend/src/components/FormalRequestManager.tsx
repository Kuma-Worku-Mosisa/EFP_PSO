// Location: frontend/src/components/FormalRequestManager.tsx
import React, { useState } from "react";
import {
  ChevronDown,
  FileText,
  Eye,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  User as UserIcon,
  X,
  Check,
  XCircle,
} from "lucide-react";
import { apiRequest, API_BASE } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { ConfirmDialog } from "./ConfirmDialog";
import { AutoDismissToast } from "./AutoDismissToast";

interface Request {
  id: number;
  requestLetterUrl: string;
  status: string;
  createdAt: string;
}

interface UserData {
  id: number;
  fullName: string;
  formalRequests: Request[];
}

const mapRequestsToUsers = (requests: any[]): UserData[] => {
  const usersMap = new Map<number, UserData>();

  requests.forEach((req) => {
    const user = req.user || {};
    const userId = Number(user.id || req.userId);
    if (!userId) return;

    if (!usersMap.has(userId)) {
      usersMap.set(userId, {
        id: userId,
        fullName: user.fullName || user.username || `User ${userId}`,
        formalRequests: [],
      });
    }

    usersMap.get(userId)?.formalRequests.push({
      id: req.id,
      requestLetterUrl: req.requestLetterUrl,
      status: req.status,
      createdAt: req.createdAt,
    });
  });

  return Array.from(usersMap.values()).sort((a, b) =>
    a.fullName.localeCompare(b.fullName),
  );
};

const FormalRequestManager = ({
  users: initialUsers = [],
}: {
  users?: UserData[];
}) => {
  const { token } = useAuth();
  const [users, setUsers] = React.useState<UserData[]>(initialUsers);
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const updateRequestStatus = (
    userId: number,
    requestId: number,
    status: string,
  ) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id !== userId
          ? user
          : {
              ...user,
              formalRequests: user.formalRequests.map((req) =>
                req.id === requestId ? { ...req, status } : req,
              ),
            },
      ),
    );
  };

  React.useEffect(() => {
    if (initialUsers.length > 0) return;

    const loadFormalRequests = async () => {
      setLoading(true);
      setErrorMessage(null);

      try {
        const response = await apiRequest<{ data: any[] }>("/formal-requests", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const rows = Array.isArray(response?.data) ? response.data : [];
        setUsers(mapRequestsToUsers(rows));
      } catch (error: any) {
        setErrorMessage(error?.message || "Failed to load formal requests.");
      } finally {
        setLoading(false);
      }
    };

    loadFormalRequests();
  }, [initialUsers.length, token]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <h2 className="text-xl font-black text-[#0C2A4C] uppercase tracking-tighter mb-8 border-l-4 border-[#DCC380] pl-4">
        Formal Request Management
      </h2>

      {loading && (
        <p className="text-center text-xs text-gray-400 font-bold uppercase py-4">
          Loading formal requests...
        </p>
      )}

      {!loading && errorMessage && (
        <p className="text-center text-xs text-red-500 font-bold uppercase py-4">
          {errorMessage}
        </p>
      )}

      {!loading && !errorMessage && users.length === 0 && (
        <p className="text-center text-xs text-gray-400 font-bold uppercase py-4">
          No formal requests found.
        </p>
      )}

      {!loading &&
        !errorMessage &&
        users.length > 0 &&
        users.map((user) => (
          <UserRequestDropdown
            key={user.id}
            user={user}
            token={token}
            onStatusUpdate={updateRequestStatus}
          />
        ))}
    </div>
  );
};

const UserRequestDropdown = ({
  user,
  token,
  onStatusUpdate,
}: {
  user: UserData;
  token: string | null;
  onStatusUpdate: (userId: number, requestId: number, status: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeRequest, setActiveRequest] = useState<Request | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [statusSelection, setStatusSelection] = useState<
    "APPROVED" | "REJECTED"
  >("APPROVED");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMessage, setToastMessage] = useState("");
  const [feedbackByRequest, setFeedbackByRequest] = useState<
    Record<number, string>
  >({});
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const getFileTypeFromUrl = (url: string) => {
    const cleanPath = url.split("?")[0].split("#")[0];
    const ext = cleanPath.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return "application/pdf";
    if (ext === "png") return "image/png";
    if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
    if (ext === "webp") return "image/webp";
    if (ext === "gif") return "image/gif";
    return "application/octet-stream";
  };

  const getFileNameFromUrl = (url: string) => {
    const cleanPath = url.split("?")[0].split("#")[0];
    return cleanPath.split("/").pop() || "formal_request";
  };

  const getDownloadFileName = (url: string) => {
    const fileName = getFileNameFromUrl(url);
    const prefix = "FormalRequest_";
    return `${prefix}${fileName}`;
  };

  const resolveFileUrl = (url: string) => {
    if (!url) return url;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const base = API_BASE.replace(/\/api\/?$/, "");
    return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const currentFeedback = activeRequest
    ? feedbackByRequest[activeRequest.id] || ""
    : "";
  const trimmedFeedbackLength = currentFeedback.trim().length;
  const isFinalStatus =
    activeRequest?.status === "APPROVED" ||
    activeRequest?.status === "REJECTED";
  const isFeedbackValid =
    statusSelection !== "REJECTED" || trimmedFeedbackLength >= 30;

  const handleFeedbackChange = (value: string) => {
    if (!activeRequest) return;
    setFeedbackByRequest((prev) => ({ ...prev, [activeRequest.id]: value }));
    if (feedbackError) {
      setFeedbackError(null);
    }
  };

  const handleOpenViewer = (request: Request) => {
    setActiveRequest(request);
    setIsViewerOpen(true);
    setStatusSelection(request.status === "REJECTED" ? "REJECTED" : "APPROVED");
    setUpdateError(null);
    setFeedbackError(null);
  };

  const handleUpdateStatus = async () => {
    if (!activeRequest) return;
    if (isFinalStatus) return;

    if (statusSelection === "REJECTED") {
      if (trimmedFeedbackLength < 30) {
        setFeedbackError("Please provide at least 30 characters of feedback.");
        return;
      }
    }

    setIsUpdating(true);
    setUpdateError(null);
    setFeedbackError(null);

    try {
      const endpoint =
        statusSelection === "APPROVED"
          ? `/formal-requests/${activeRequest.id}/approve`
          : `/formal-requests/${activeRequest.id}/reject`;

      await apiRequest(endpoint, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: JSON.stringify({
          adminFeedback:
            statusSelection === "REJECTED" ? currentFeedback.trim() : "",
        }),
      });

      onStatusUpdate(user.id, activeRequest.id, statusSelection);
      setActiveRequest({ ...activeRequest, status: statusSelection });
      setToastType("success");
      setToastMessage(
        statusSelection === "APPROVED"
          ? "Formal request approved."
          : "Formal request rejected.",
      );
      setToastOpen(true);
      setIsViewerOpen(false);
    } catch (error: any) {
      setUpdateError(error?.message || "Failed to update status.");
      setToastType("error");
      setToastMessage(error?.message || "Failed to update status.");
      setToastOpen(true);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRequestStatusUpdate = () => {
    if (!activeRequest) return;
    if (isFinalStatus) return;
    if (statusSelection === "REJECTED") {
      if (trimmedFeedbackLength < 30) {
        setFeedbackError("Please provide at least 30 characters of feedback.");
        return;
      }
    }
    setIsConfirmOpen(true);
  };

  const handleDownload = (url: string) => {
    const resolvedUrl = resolveFileUrl(url);
    const fileName = getDownloadFileName(url);
    
    // For PDFs and other files, fetch and create blob for reliable download
    fetch(resolvedUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.blob();
      })
      .then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      })
      .catch((error) => {
        console.error("Download failed:", error);
        // Fallback to direct download
        const link = document.createElement("a");
        link.href = resolvedUrl;
        link.download = fileName;
        link.rel = "noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
  };

  // LOGIC: Group requests by year calculated from 'createdAt'
  const groupedRequests = user.formalRequests?.reduce(
    (acc, request) => {
      const year = new Date(request.createdAt).getFullYear();
      if (!acc[year]) acc[year] = [];
      acc[year].push(request);
      return acc;
    },
    {} as Record<number, Request[]>,
  );

  const sortedYears = Object.keys(groupedRequests || {}).sort(
    (a, b) => Number(b) - Number(a),
  );

  return (
    <div className="overflow-hidden rounded-[32px] border-2 border-gray-100 bg-white transition-all shadow-sm">
      {/* Header: User Profile */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center justify-between p-6 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-2xl bg-[#0C2A4C] flex items-center justify-center">
            <UserIcon className="text-[#DCC380] w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-[#0C2A4C] uppercase text-sm">
              {user.fullName}
            </h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Total Submissions: {user.formalRequests.length}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-[#0C2A4C] transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {/* Expanded Content: Year-based Grouping */}
      {isOpen && (
        <div className="bg-gray-50/50 p-6 border-t border-gray-100 space-y-8">
          {sortedYears.length > 0 ? (
            sortedYears.map((year) => (
              <div key={year} className="space-y-4">
                {/* Year Label */}
                <div className="flex items-center space-x-3">
                  <span className="text-[11px] font-black text-[#DCC380] uppercase tracking-[0.2em] bg-white px-3 py-1 rounded-full border border-gray-200">
                    Year {year}
                  </span>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>

                {/* Letters for that year */}
                <div className="grid gap-3 pl-4">
                  {groupedRequests[Number(year)].map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 group hover:border-[#0C2A4C] transition-all"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-[#0C2A4C]/5 p-2 rounded-lg group-hover:bg-[#0C2A4C] transition-colors">
                          <FileText className="w-4 h-4 text-[#0C2A4C] group-hover:text-[#DCC380]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#0C2A4C]">
                            Request Letter #{req.id}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {new Date(req.createdAt).toLocaleDateString(
                              "en-US",
                              { day: "numeric", month: "short" },
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div
                          className={`flex items-center space-x-1 px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                            req.status === "APPROVED"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {req.status === "APPROVED" ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          <span>{req.status}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenViewer(req)}
                          className="p-2 text-[#0C2A4C] hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-xs text-gray-400 font-bold uppercase py-4">
              No requests found for this user.
            </p>
          )}
        </div>
      )}
      {isViewerOpen && activeRequest && (
        <div className="fixed inset-0 z-[120] overflow-y-auto bg-black/60 p-4 sm:p-6">
          <div className="mx-auto my-8 bg-white w-full max-w-5xl max-h-[calc(100vh-3rem)] rounded-[28px] shadow-2xl flex flex-col overflow-visible">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                  Formal Request
                </p>
                <h3 className="text-lg sm:text-xl font-black text-[#0C2A4C] truncate">
                  {getFileNameFromUrl(activeRequest.requestLetterUrl)}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Submitted{" "}
                  {new Date(activeRequest.createdAt).toLocaleDateString(
                    "en-US",
                    { day: "numeric", month: "long", year: "numeric" },
                  )}
                </p>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload(activeRequest.requestLetterUrl)}
                  className="inline-flex items-center justify-center rounded-xl border-2 border-blue-500 bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-blue-600 hover:bg-blue-500 hover:text-white transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
                <button
                  type="button"
                  onClick={() => setIsViewerOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="sm:hidden border-b px-5 py-4 space-y-3">
              <div className="flex flex-col items-center gap-2">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">
                  Status Action
                </p>
                {isFinalStatus && (
                  <span
                    title="This request is finalized and cannot be changed."
                    className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded-full"
                  >
                    Finalized
                  </span>
                )}
              </div>
                                 {!isFinalStatus && (
                      <>
                  
    <div className="flex justify-end items-center gap-20 mt-4">
  <button
    type="button"
    onClick={() => {
      setStatusSelection("APPROVED");
      setFeedbackError(null);
    }}
    className={`flex items-center justify-center rounded-xl px-10 py-3 text-xs font-black uppercase tracking-widest border-2 transition-all ${
      statusSelection === "APPROVED"
        ? "bg-white text-green-600 border-green-600 shadow-lg shadow-green-200"
        : "bg-white text-green-600 border-green-200"
    }`}
  >
    ✓ APPROVE
  </button>

  <button
    type="button"
    onClick={() => {
      setStatusSelection("REJECTED");
      setFeedbackError(null);
    }}
    className={`flex items-center justify-center rounded-xl px-10 py-3 text-xs font-black uppercase tracking-widest border-2 transition-all ${
      statusSelection === "REJECTED"
        ? "bg-white text-red-600 border-red-600 shadow-lg shadow-red-200"
        : "bg-white text-red-600 border-red-200"
    }`}
  >
    <XCircle className="w-3 h-3 mr-1.5" />
    REJECT
  </button>
</div>
                        <div className="flex justify-center">
                          <button
                            type="button"
                            onClick={handleRequestStatusUpdate}
                            disabled={isUpdating}
                            className="inline-flex items-center justify-center rounded-xl bg-[#0C2A4C] text-[#DCC380] text-xs font-black uppercase tracking-widest px-24 py-4 transition-all transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:bg-[#0C2A4C]/90 w-96"
                          >
                            {isUpdating ? "Updating..." : `Apply ${statusSelection}`}
                          </button>
                        </div>
                        {statusSelection === "REJECTED" && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                Rejection Feedback
                              </label>
                              <span
                                className={`text-[10px] font-black uppercase tracking-widest ${
                                  trimmedFeedbackLength < 30
                                    ? "text-yellow-600"
                                    : "text-blue-600"
                                }`}
                              >
                                {trimmedFeedbackLength}/30
                              </span>
                            </div>
                            <textarea
                              value={currentFeedback}
                              onChange={(event) =>
                                handleFeedbackChange(event.target.value)
                              }
                              rows={5}
                              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-[#0C2A4C] focus:outline-none focus:ring-2 focus:ring-yellow-300/20"
                              placeholder="Provide reason for rejection..."
                            />
                            {feedbackError && (
                              <p className="text-xs text-red-500 font-bold">
                                {feedbackError}
                              </p>
                            )}
                          </div>
                        )}
                        {updateError && (
                          <p className="text-xs text-red-500 font-bold">
                            {updateError}
                          </p>
                        )}
                      </>
                    )}
            </div>

            <div className="min-h-0">
              <div className="grid grid-cols-1 lg:grid-cols-[1.6fr,1fr] min-h-0">
                <div className="bg-gray-50 p-4 sm:p-6 min-h-0 flex items-center justify-center overflow-hidden">
                  {getFileTypeFromUrl(
                    activeRequest.requestLetterUrl,
                  ).startsWith("image/") ? (
                    <img
                      src={resolveFileUrl(activeRequest.requestLetterUrl)}
                      alt="Formal request"
                      className="max-h-[35vh] sm:max-h-[40vh] max-w-full rounded-2xl shadow-lg bg-white"
                    />
                  ) : getFileTypeFromUrl(activeRequest.requestLetterUrl) ===
                    "application/pdf" ? (
                    <iframe
                      src={`${resolveFileUrl(activeRequest.requestLetterUrl)}#toolbar=0`}
                      title="Formal request"
                      className="w-full h-[35vh] sm:h-[40vh] min-h-[250px] rounded-2xl border-0 bg-white shadow-lg"
                    />
                  ) : (
                    <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                      <FileText className="w-10 h-10 text-gray-300 mx-auto" />
                      <p className="mt-3 text-sm text-gray-500">
                        Preview not available.
                      </p>
                    </div>
                  )}
                </div>

                  <div className="lg:flex lg:flex-col min-h-0 bg-white">
                    <div className="hidden sm:block space-y-3 p-4 sm:p-6 border-b border-gray-100">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">
                        Status Action
                      </p>
                      {isFinalStatus && (
                        <span
                          title="This request is finalized and cannot be changed."
                          className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded-full"
                        >
                          Finalized
                        </span>
                      )}
                    </div>
                    {!isFinalStatus && (
                      <>
                        <div className="flex justify-center items-center gap-20">
                          <button
                            type="button"
                            onClick={() => {
                              setStatusSelection("APPROVED");
                              setFeedbackError(null);
                            }}
                            className={`inline-flex items-center justify-center rounded-xl px-1 py-3 text-xs font-black uppercase tracking-widest transition-all transform hover:scale-105 border-2 w-64 ${
                              statusSelection === "APPROVED"
                                ? "bg-white text-green-600 border-green-600 shadow-lg shadow-green-200"
                                : "bg-white text-green-600 border-green-200 hover:border-green-600"
                            }`}
                          >
                            <Check className="w-3 h-3 mr-1.5" />
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setStatusSelection("REJECTED");
                              setFeedbackError(null);
                            }}
                            className={`inline-flex items-center justify-center rounded-xl px-1 py-3 text-xs font-black uppercase tracking-widest transition-all transform hover:scale-105 border-2 w-64 ${
                              statusSelection === "REJECTED"
                                ? "bg-white text-red-600 border-red-600 shadow-lg shadow-red-200"
                                : "bg-white text-red-600 border-red-200 hover:border-red-600"
                            }`}
                          >
                            <XCircle className="w-3 h-3 mr-1.5" />
                            Reject
                          </button>
                        </div>
                        <div className="flex justify-center">
                          <button
                            type="button"
                            onClick={handleRequestStatusUpdate}
                            disabled={isUpdating}
                            className="inline-flex items-center justify-center rounded-xl bg-[#0C2A4C] text-[#DCC380] text-xs font-black uppercase tracking-widest px-24 py-4 transition-all transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:bg-[#0C2A4C]/90 w-96"
                          >
                            {isUpdating ? "Updating..." : `Apply ${statusSelection}`}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex-1 p-4 sm:p-6 space-y-6">
                    {statusSelection === "REJECTED" && !isFinalStatus && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Rejection Feedback
                          </label>
                          <span
                            className={`text-[10px] font-black uppercase tracking-widest ${
                              trimmedFeedbackLength < 30
                                ? "text-yellow-600"
                                : "text-blue-600"
                            }`}
                          >
                            {trimmedFeedbackLength}/30
                          </span>
                        </div>
                        <textarea
                          value={currentFeedback}
                          onChange={(event) =>
                            handleFeedbackChange(event.target.value)
                          }
                          rows={6}
                          className="w-full rounded-xl border border-gray-200 px-1.5 py-3 text-sm text-[#0C2A4C] focus:outline-none focus:ring-2 focus:ring-yellow-300/20"
                          placeholder="Provide reason for rejection..."
                        />
                        {feedbackError && (
                          <p className="text-xs text-red-500 font-bold">
                            {feedbackError}
                          </p>
                        )}
                      </div>
                    )}
                    {updateError && !isFinalStatus && (
                      <div>
                        <p className="text-xs text-red-500 font-bold">
                          {updateError}
                        </p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">
                        File Actions
                      </p>
                      {getFileTypeFromUrl(activeRequest.requestLetterUrl) ===
                        "application/pdf" && (
                        <div className="flex justify-center">
                          <a
                            href={resolveFileUrl(activeRequest.requestLetterUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center rounded-xl bg-[#0C2A4C] px-24 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-[#123A6B] w-96"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Fullscreen
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <>
        <ConfirmDialog
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={async () => {
            await handleUpdateStatus();
            setIsConfirmOpen(false);
          }}
          isConfirmDisabled={!isFeedbackValid || isFinalStatus}
          title={statusSelection === "APPROVED"
            ? "Approve request?"
            : "Reject request?"}
          message={statusSelection === "APPROVED"
            ? "This will mark the request as approved and notify the user."
            : "This will mark the request as rejected and notify the user."}
          type={statusSelection === "APPROVED" ? "approve" : "reject"}
          isLoading={isUpdating} />
        <AutoDismissToast
          isOpen={toastOpen}
          type={toastType}
          message={toastMessage}
          onClose={() => setToastOpen(false)} />
      </>
    </div>
  );
};

export default FormalRequestManager;
