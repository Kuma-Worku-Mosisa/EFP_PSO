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
    const link = document.createElement("a");
    link.href = resolvedUrl;
    link.download = getFileNameFromUrl(url);
    link.rel = "noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 sm:p-6">
          <div className="bg-white w-full max-w-5xl max-h-[88vh] sm:max-h-[92vh] rounded-[28px] shadow-2xl overflow-hidden flex flex-col">
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
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#0C2A4C] hover:bg-gray-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
                <button
                  type="button"
                  onClick={() => setIsViewerOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="sm:hidden border-b px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Status Action
                </p>
                {isFinalStatus && (
                  <span
                    title="This request is finalized and cannot be changed."
                    className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full"
                  >
                    Finalized
                  </span>
                )}
              </div>
              {!isFinalStatus && (
                <>
                  <select
                    value={statusSelection}
                    onChange={(e) => {
                      setStatusSelection(
                        e.target.value as "APPROVED" | "REJECTED",
                      );
                      setFeedbackError(null);
                    }}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-[#0C2A4C]"
                  >
                    <option value="APPROVED">Approve</option>
                    <option value="REJECTED">Reject</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleRequestStatusUpdate}
                    disabled={isUpdating || !isFeedbackValid}
                    className="w-full rounded-xl bg-[#0C2A4C] text-white text-xs font-black uppercase tracking-widest py-3 disabled:opacity-60"
                  >
                    {isUpdating ? "Updating..." : "Apply Status"}
                  </button>
                  {statusSelection === "REJECTED" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          Rejection Feedback
                        </label>
                        <span
                          className={`text-[10px] font-black uppercase tracking-widest ${
                            trimmedFeedbackLength < 30
                              ? "text-rose-500"
                              : "text-emerald-500"
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
                        rows={4}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-[#0C2A4C] focus:outline-none focus:ring-2 focus:ring-[#0C2A4C]/20"
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

            <div className="flex-1 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-[1.6fr,1fr] h-full">
                <div className="bg-gray-50 p-4 sm:p-6 flex items-center justify-center overflow-auto">
                  {getFileTypeFromUrl(
                    activeRequest.requestLetterUrl,
                  ).startsWith("image/") ? (
                    <img
                      src={resolveFileUrl(activeRequest.requestLetterUrl)}
                      alt="Formal request"
                      className="max-h-[50vh] sm:max-h-[55vh] max-w-full rounded-2xl shadow-lg bg-white"
                    />
                  ) : getFileTypeFromUrl(activeRequest.requestLetterUrl) ===
                    "application/pdf" ? (
                    <iframe
                      src={`${resolveFileUrl(activeRequest.requestLetterUrl)}#toolbar=0`}
                      title="Formal request"
                      className="w-full h-[50vh] sm:h-[55vh] min-h-[280px] rounded-2xl border-0 bg-white shadow-lg"
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

                <div className="p-4 sm:p-6 space-y-6 overflow-y-auto bg-white">
                  <div className="hidden sm:block space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                        Status Action
                      </p>
                      {isFinalStatus && (
                        <span
                          title="This request is finalized and cannot be changed."
                          className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full"
                        >
                          Finalized
                        </span>
                      )}
                    </div>
                    {!isFinalStatus && (
                      <>
                        <select
                          value={statusSelection}
                          onChange={(e) => {
                            setStatusSelection(
                              e.target.value as "APPROVED" | "REJECTED",
                            );
                            setFeedbackError(null);
                          }}
                          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-[#0C2A4C]"
                        >
                          <option value="APPROVED">Approve</option>
                          <option value="REJECTED">Reject</option>
                        </select>
                        <button
                          type="button"
                          onClick={handleRequestStatusUpdate}
                          disabled={isUpdating || !isFeedbackValid}
                          className="w-full rounded-xl bg-[#0C2A4C] text-white text-xs font-black uppercase tracking-widest py-3 disabled:opacity-60"
                        >
                          {isUpdating ? "Updating..." : "Apply Status"}
                        </button>
                        {statusSelection === "REJECTED" && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                Rejection Feedback
                              </label>
                              <span
                                className={`text-[10px] font-black uppercase tracking-widest ${
                                  trimmedFeedbackLength < 30
                                    ? "text-rose-500"
                                    : "text-emerald-500"
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
                              rows={4}
                              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-[#0C2A4C] focus:outline-none focus:ring-2 focus:ring-[#0C2A4C]/20"
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

                  <div className="space-y-2">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                      File Actions
                    </p>
                    {getFileTypeFromUrl(activeRequest.requestLetterUrl) ===
                      "application/pdf" && (
                      <a
                        href={resolveFileUrl(activeRequest.requestLetterUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center w-full rounded-xl bg-[#0C2A4C] px-3 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-[#123A6B]"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Fullscreen
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={async () => {
          await handleUpdateStatus();
          setIsConfirmOpen(false);
        }}
        isConfirmDisabled={!isFeedbackValid || isFinalStatus}
        title={
          statusSelection === "APPROVED"
            ? "Approve request?"
            : "Reject request?"
        }
        message={
          statusSelection === "APPROVED"
            ? "This will mark the request as approved and notify the user."
            : "This will mark the request as rejected and notify the user."
        }
        type={statusSelection === "APPROVED" ? "approve" : "reject"}
        isLoading={isUpdating}
      />
      <AutoDismissToast
        isOpen={toastOpen}
        type={toastType}
        message={toastMessage}
        onClose={() => setToastOpen(false)}
      />
    </div>
  );
};

export default FormalRequestManager;
