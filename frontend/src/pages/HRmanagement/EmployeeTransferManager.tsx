//filepath: frontend/src/pages/HRmanagement/EmployeeTransferManager.tsx
import React, { useState, useEffect } from "react";
import {
  Search,
  ArrowLeftRight,
  UserCheck,
  FileCheck,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { AutoDismissToast } from "../../components/AutoDismissToast";
import { apiRequest } from "../../lib/api";

// Expected TypeScript interface for an employee returned from lookups
interface EmployeeProfile {
  id: number;
  faydaId: string;
  user: {
    fullName: string;
    email: string;
    phone?: string;
    status: string;
  };
  organization: { id: number; name: string };
  position: { id: number; name: string };
}

// Expected TypeScript interface for incoming transfer requests
interface TransferRequestItem {
  id: number;
  employeeId: number;
  employee: {
    user: {
      fullName: string;
      faydaId: string;
    };
    position?: { name: string } | null;
  };
  sourceOrganization: { name: string };
  targetOrganization: { name: string };
  position?: { name: string } | null;
  status: string;
  reason: string;
  createdAt: string;
  updatedAt: string;
}

interface TransferHistoryResponse {
  initiated: TransferRequestItem[];
  incoming: TransferRequestItem[];
}

export default function EmployeeTransferManager() {
  const [activeTab, setActiveTab] = useState<
    "initiate" | "incoming" | "history"
  >("initiate");
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);
  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<
    "approve" | "reject" | "default"
  >("default");
  const [confirmTargetId, setConfirmTargetId] = useState<number | null>(null);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  // Toast handled by AutoDismissToast
  const [toastOpen, setToastOpen] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMessage, setToastMessage] = useState("");

  // Tab 1: Initiate Form State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedEmployee, setSearchedEmployee] =
    useState<EmployeeProfile | null>(null);
  const [transferPayload, setTransferPayload] = useState({
    transferReason: "",
  });

  // Tab 2: Incoming Requests State
  const [pendingRequests, setPendingRequests] = useState<TransferRequestItem[]>(
    [],
  );
  const [transferHistory, setTransferHistory] =
    useState<TransferHistoryResponse | null>(null);

  // Automatically fetch pending items or history when changing tabs
  useEffect(() => {
    if (activeTab === "incoming") {
      fetchPendingRequests();
    }
    if (activeTab === "history") {
      fetchTransferHistory();
    }
  }, [activeTab]);

  // Clear notifications automatically after 4 seconds
  useEffect(() => {
    if (globalError || globalSuccess) {
      const timer = setTimeout(() => {
        setGlobalError(null);
        setGlobalSuccess(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [globalError, globalSuccess]);

  // Action A: Look up active personnel inside the system via backend database registry
  const handleEmployeeLookup = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setGlobalError(null);
    setSearchedEmployee(null);

    try {
      const result = await apiRequest(
        `/transfers/employee-lookup?query=${encodeURIComponent(searchQuery.trim())}`,
      );
      setSearchedEmployee(result.data);
    } catch (err: any) {
      setGlobalError(
        err.message || "No active employee found matching identity parameters.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Action B: Push a new pending routing record downstream to target organization
  const handleInitiateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchedEmployee) return;

    setIsLoading(true);
    setGlobalError(null);

    try {
      await apiRequest("/transfers", {
        method: "POST",
        body: JSON.stringify({
          employeeId: searchedEmployee.id,
          // targetOrganizationId intentionally omitted; backend will default to initiator org
          // requestedPositionId intentionally omitted (use current position if required)
          reason: transferPayload.transferReason,
        }),
      });

      setGlobalSuccess(
        `Transfer record for ${searchedEmployee.user.fullName} dispatched safely!`,
      );

      // Clear initiate forms state
      setSearchedEmployee(null);
      setSearchQuery("");
      setTransferPayload({ transferReason: "" });
    } catch (err: any) {
      setGlobalError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Action C: Get live unapproved inbound transfer records for current organization context
  const fetchPendingRequests = async () => {
    setIsLoading(true);
    setGlobalError(null);
    try {
      const result = await apiRequest("/transfers/incoming-pending");
      setPendingRequests(result.data || []);
    } catch (err: any) {
      setGlobalError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransferHistory = async () => {
    setIsLoading(true);
    setGlobalError(null);
    try {
      const result = await apiRequest("/transfers/history");
      setTransferHistory(result.data || null);
    } catch (err: any) {
      setGlobalError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Action D: Execute transactional workflow actions (RELEASE or REJECT)
  const handleApprovalDecision = async (
    id: number,
    decision: "RELEASE" | "FINALIZE_APPROVE" | "REJECT",
    rejectionReason?: string,
  ) => {
    setIsLoading(true);
    setGlobalError(null);

    try {
      await apiRequest(`/transfers/${id}/decision`, {
        method: "PATCH",
        body: JSON.stringify({
          action: decision,
          rejectionReason: rejectionReason || null,
        }),
      });

      const successMsg = `Request tracking ID #${id} updated to state: ${decision}`;
      setGlobalSuccess(successMsg);
      setToastType("success");
      setToastMessage(successMsg);
      setToastOpen(true);
      // Atomically filter out items from frontend layout display matrix
      setPendingRequests((prev) => prev.filter((req) => req.id !== id));
    } catch (err: any) {
      const msg = err.message || "Failed to route transfer tracking record.";
      setGlobalError(msg);
      setToastType("error");
      setToastMessage(msg);
      setToastOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const openApproveDialog = (id: number, employeeName?: string) => {
    setConfirmTargetId(id);
    setConfirmType("approve");
    setConfirmTitle("Release Employee for Transfer");
    setConfirmMessage(
      `Are you sure you want to release ${employeeName || "this employee"} for transfer? This action will mark the request as SOURCE_RELEASED and notify the destination organization.`,
    );
    setConfirmOpen(true);
  };

  const openRejectDialog = (id: number, employeeName?: string) => {
    setConfirmTargetId(id);
    setConfirmType("reject");
    setConfirmTitle("Decline Transfer Request");
    setConfirmMessage(
      `Provide a short justification for rejecting the transfer request for ${employeeName || "this employee"}. This reason will be included in notifications.`,
    );
    setRejectionReason("");
    setConfirmOpen(true);
  };

  const handleDialogConfirm = async () => {
    if (!confirmTargetId) return;
    setConfirmLoading(true);
    try {
      if (confirmType === "approve") {
        await handleApprovalDecision(confirmTargetId, "RELEASE");
      } else if (confirmType === "reject") {
        if (!rejectionReason.trim()) {
          // show inline error via toast
          setToastType("error");
          setToastMessage("Rejection reason is required.");
          setToastOpen(true);
          return;
        }
        await handleApprovalDecision(
          confirmTargetId,
          "REJECT",
          rejectionReason,
        );
      }
    } finally {
      setConfirmLoading(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p-10 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto">
        {/* GLOBAL STATUS NOTIFICATION PORTAL */}
        {globalError && (
          <div className="mb-4 flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 p-4 rounded-xl border border-red-200 shadow-xs animate-bounce">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {globalError}
          </div>
        )}
        {globalSuccess && (
          <div className="mb-4 flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-xs">
            <Check className="h-4 w-4 flex-shrink-0" />
            {globalSuccess}
          </div>
        )}

        {/* Confirm Dialog for approve/reject */}
        <ConfirmDialog
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleDialogConfirm}
          title={confirmTitle}
          message={confirmMessage}
          type={confirmType}
          isLoading={confirmLoading}
          isConfirmDisabled={
            confirmType === "reject" && !rejectionReason.trim()
          }
          inputLabel={
            confirmType === "reject" ? "Rejection Justification" : undefined
          }
          inputValue={rejectionReason}
          onInputChange={(v) => setRejectionReason(v)}
          inputPlaceholder={
            confirmType === "reject"
              ? "Enter a concise justification for rejection"
              : undefined
          }
        />

        <AutoDismissToast
          isOpen={toastOpen}
          type={toastType}
          message={toastMessage}
          onClose={() => setToastOpen(false)}
        />
        {/* Header Module */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-6 mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <ArrowLeftRight className="h-6 w-6 text-purple-600" />
              Employee Inter-Organization Transfer
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Transfer existing personnel references across organizational
              structures safely without schema replication.
            </p>
          </div>

          {/* Tab Selection Navigation Toggle */}
          <div className="flex bg-slate-200/70 p-1 rounded-xl mt-4 md:mt-0">
            <button
              onClick={() => setActiveTab("initiate")}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === "initiate"
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Initiate Request
            </button>
            <button
              onClick={() => setActiveTab("incoming")}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all relative ${
                activeTab === "incoming"
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Incoming Requests
              {pendingRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold animate-pulse">
                  {pendingRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("history")}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === "history"
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Transfer History
            </button>
          </div>
        </div>

        {/* WORKSPACE AREA */}
        <div className="grid grid-cols-1 gap-8">
          {/* TAB 1: INITIATE REQUEST FLOW */}
          {activeTab === "initiate" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-3">
                  Step 1: System Personnel Lookup
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      disabled={isLoading}
                      placeholder="Enter Employee Fayda ID (e.g., ET-123456789) or Official Email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 outline-none text-sm focus:ring-2 focus:ring-purple-500 transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleEmployeeLookup}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-xs font-black uppercase tracking-wider px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
                  >
                    {isLoading ? "Verifying..." : "Verify Identity"}
                  </button>
                </div>
              </div>

              {/* Step 1.2: Identity Card & Routing Options */}
              {searchedEmployee && (
                <form
                  onSubmit={handleInitiateSubmit}
                  className="space-y-6 animate-in slide-in-from-top-4 duration-300"
                >
                  <div className="bg-gradient-to-r from-purple-900 to-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                      <div>
                        <span className="text-[10px] bg-purple-500/30 text-purple-300 px-2.5 py-1 rounded-full font-black uppercase tracking-widest">
                          Existing Profile Locked
                        </span>
                        <h2 className="text-xl font-black mt-2 tracking-tight">
                          {searchedEmployee.user.fullName}
                        </h2>
                      </div>
                      <UserCheck className="h-8 w-8 text-purple-400 opacity-80" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <p className="text-purple-300 font-bold uppercase tracking-wider text-[9px] mb-0.5">
                          Fayda Identification
                        </p>
                        <p className="font-mono text-sm font-bold">
                          {searchedEmployee.faydaId}
                        </p>
                      </div>
                      <div>
                        <p className="text-purple-300 font-bold uppercase tracking-wider text-[9px] mb-0.5">
                          Current Station
                        </p>
                        <p className="font-semibold text-sm">
                          {searchedEmployee.organization.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-purple-300 font-bold uppercase tracking-wider text-[9px] mb-0.5">
                          Assigned Post
                        </p>
                        <p className="font-semibold text-sm">
                          {searchedEmployee.position.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-purple-300 font-bold uppercase tracking-wider text-[9px] mb-0.5">
                          Email Identity
                        </p>
                        <p className="font-semibold text-sm">
                          {searchedEmployee.user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Operational Settings Form */}
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-1">
                        Step 2: Request Destination Routing & Justification
                      </h3>
                    </div>

                    <div className="col-span-2 text-xs text-slate-500 space-y-1">
                      <p>
                        Employee entered:{" "}
                        {searchedEmployee.faydaId ||
                          searchedEmployee.user.email}
                      </p>
                      <p>
                        Current organization:{" "}
                        {searchedEmployee.organization.name}
                      </p>
                      <p>Current position: {searchedEmployee.position.name}</p>
                    </div>

                    {/* Target organization and proposed position selections removed — backend uses initiator org and current position info is displayed above */}

                    <div className="col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Institutional Statement / Reason for Request *
                      </label>
                      <textarea
                        required
                        disabled={isLoading}
                        rows={3}
                        value={transferPayload.transferReason}
                        onChange={(e) =>
                          setTransferPayload({
                            ...transferPayload,
                            transferReason: e.target.value,
                          })
                        }
                        placeholder="State the official justification for reassignment..."
                        className="w-full border border-slate-300 p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      />
                    </div>

                    <div className="col-span-2 pt-4 flex justify-end">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-xs font-black uppercase tracking-widest px-8 py-3 rounded-xl shadow-md transition-colors"
                      >
                        {isLoading
                          ? "Processing Dispatch..."
                          : "Dispatch Routing Request"}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: INCOMING TRANSFERS */}
          {activeTab === "incoming" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 bg-slate-50 border-b border-slate-100">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
                    Action Required: Pending Transfer Endorsements
                  </h3>
                </div>

                {pendingRequests.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <FileCheck className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-sm font-medium">
                      All clear. No incoming employee transfer requests pending
                      authorization.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {pendingRequests.map((request) => (
                      <div
                        key={request.id}
                        className="p-6 md:p-8 hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                          <div className="space-y-3 max-w-2xl">
                            <div>
                              <span className="text-[10px] bg-amber-100 text-amber-800 font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full">
                                Pending Inbound Review
                              </span>
                              <h4 className="text-lg font-black text-slate-900 mt-1.5">
                                {request.employee?.user?.fullName}
                              </h4>
                              <p className="font-mono text-xs text-slate-500 font-bold mt-0.5">
                                Fayda ID:{" "}
                                {request.employee?.user?.faydaId || "Unknown"}
                              </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-100/60 p-4 rounded-xl border border-slate-200/50 text-xs">
                              <div>
                                <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">
                                  Employee Name
                                </span>
                                <span className="font-semibold text-slate-800 mt-0.5 block">
                                  {request.employee?.user?.fullName ||
                                    "Unknown"}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">
                                  Fayda Number
                                </span>
                                <span className="font-semibold text-slate-800 mt-0.5 block">
                                  {request.employee?.user?.faydaId || "Unknown"}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">
                                  Source Organization
                                </span>
                                <span className="font-semibold text-slate-800 mt-0.5 block">
                                  {request.sourceOrganization?.name ||
                                    "Unknown"}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">
                                  Destination Organization
                                </span>
                                <span className="font-semibold text-slate-800 mt-0.5 block">
                                  {request.targetOrganization?.name ||
                                    "Unknown"}
                                </span>
                              </div>
                            </div>
                            <div className="mt-4 bg-slate-100/60 p-4 rounded-xl border border-slate-200/50 text-xs">
                              <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">
                                Requested Position
                              </span>
                              <span className="font-bold text-purple-700 flex items-center gap-1 mt-0.5">
                                <UserCheck className="h-3 w-3" />{" "}
                                {request.position?.name ||
                                  request.employee?.position?.name ||
                                  "Unspecified Assignment"}
                              </span>
                            </div>

                            <div>
                              <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">
                                Justification Docket
                              </span>
                              <p className="text-xs text-slate-600 italic mt-1 leading-relaxed bg-white p-3 border border-slate-200 rounded-xl">
                                "{request.reason}"
                              </p>
                            </div>
                          </div>

                          {/* Action CTA Panel */}
                          <div className="flex lg:flex-col gap-2 min-w-[160px] justify-end lg:justify-start pt-2">
                            <button
                              type="button"
                              disabled={isLoading}
                              onClick={() =>
                                openApproveDialog(
                                  request.id,
                                  request.employee?.user?.fullName,
                                )
                              }
                              className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-sm transition-colors"
                            >
                              <Check className="h-4 w-4" /> Release Employee
                            </button>
                            <button
                              type="button"
                              disabled={isLoading}
                              onClick={() =>
                                openRejectDialog(
                                  request.id,
                                  request.employee?.user?.fullName,
                                )
                              }
                              className="inline-flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-red-50 hover:text-red-600 text-slate-700 text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition-colors"
                            >
                              <X className="h-4 w-4" /> Decline
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TRANSFER HISTORY */}
          {activeTab === "history" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 bg-slate-50 border-b border-slate-100">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
                    Completed Transfer History
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    View initiated and incoming requests that have been approved
                    or rejected.
                  </p>
                </div>

                {!transferHistory ? (
                  <div className="p-12 text-center text-slate-400">
                    <FileCheck className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-sm font-medium">
                      Loading completed transfer history...
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    <div className="p-6 border-b border-slate-100">
                      <h4 className="text-sm font-black uppercase tracking-widest text-slate-600">
                        Initiated by Your Organization
                      </h4>
                      {transferHistory.initiated.length === 0 ? (
                        <p className="text-xs text-slate-500 mt-3">
                          No initiated transfer requests have completed yet.
                        </p>
                      ) : (
                        <div className="mt-4 space-y-4">
                          {transferHistory.initiated.map((request) => (
                            <div
                              key={`initiated-${request.id}`}
                              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                                    {request.status.replace("_", " ")}
                                  </p>
                                  <h5 className="text-base font-bold text-slate-900 mt-1">
                                    {request.employee.user.fullName}
                                  </h5>
                                  <p className="text-xs text-slate-500">
                                    Fayda Number (FAN): {request.employee.user.faydaId}
                                  </p>
                                </div>
                                <div className="text-right text-xs text-slate-500">
                                  <p>
                                    Updated:{" "}
                                    {new Date(
                                      request.updatedAt,
                                    ).toLocaleString()}
                                  </p>
                                  <p>
                                    Requested:{" "}
                                    {new Date(
                                      request.createdAt,
                                    ).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs text-slate-600">
                                <div className="bg-white p-3 rounded-xl border border-slate-200">
                                  <p className="font-bold text-slate-800">
                                    Destination
                                  </p>
                                  <p>{request.targetOrganization.name}</p>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-slate-200">
                                  <p className="font-bold text-slate-800">
                                    Requested Position
                                  </p>
                                  <p>
                                    {request.position?.name ||
                                      request.employee.position?.name ||
                                      "Unspecified"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h4 className="text-sm font-black uppercase tracking-widest text-slate-600">
                        Incoming to Our Organization
                      </h4>
                      {transferHistory.incoming.length === 0 ? (
                        <p className="text-xs text-slate-500 mt-3">
                          No incoming transfer requests have completed yet.
                        </p>
                      ) : (
                        <div className="mt-4 space-y-4">
                          {transferHistory.incoming.map((request) => (
                            <div
                              key={`incoming-${request.id}`}
                              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                                    {request.status.replace("_", " ")}
                                  </p>
                                  <h5 className="text-base font-bold text-slate-900 mt-1">
                                    {request.employee.user.fullName}
                                  </h5>
                                  <p className="text-xs text-slate-500">
                                    Fayda Number (FAN): {request.employee.user.faydaId}
                                  </p>
                                </div>
                                <div className="text-right text-xs text-slate-500">
                                  <p>
                                    Updated:{" "}
                                    {new Date(
                                      request.updatedAt,
                                    ).toLocaleString()}
                                  </p>
                                  <p>
                                    Requested:{" "}
                                    {new Date(
                                      request.createdAt,
                                    ).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs text-slate-600">
                                <div className="bg-white p-3 rounded-xl border border-slate-200">
                                  <p className="font-bold text-slate-800">
                                    Source
                                  </p>
                                  <p>{request.sourceOrganization.name}</p>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-slate-200">
                                  <p className="font-bold text-slate-800">
                                    Requested Position
                                  </p>
                                  <p>
                                    {request.position?.name ||
                                      request.employee.position?.name ||
                                      "Unspecified"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
