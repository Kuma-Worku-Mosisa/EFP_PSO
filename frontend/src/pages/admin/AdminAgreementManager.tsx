// filepath: frontend/src/pages/admin/AdminAgreementManager.tsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  FileCheck,
  Building2,
  Calendar,
  Layers,
  PlusCircle,
} from "lucide-react";
import { apiRequest } from "../../lib/api";
import { useLanguage } from "../../context/LanguageContext";

// --- System Types & Framework Interfaces ---
interface AgreementSnapshot {
  agencyName: string;
  email: string;
  phone: string;
  fax: string;
  managerName: string;
  signedByFullName: string;
  signedByPhone: string;
  region: string;
  zone: string;
  woreda: string;
  kebele: string;
  location: string;
  number: string;
  numberOfOffices: number;
  hasOneYearRentContract: boolean;
  numberOfVehicles: number;
  numberOfComputers: number;
  signedAtDate: string;
  date: string;
}

interface Agreement {
  id: number;
  agreementNumber: string;
  organizationId: number;
  signedById: number;
  status: "Pending" | "Active" | "Superseded" | "Expired" | "Revoked";
  snapshotData: AgreementSnapshot;
  recruitmentDeadline: string;
  issuedDate: string;
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
  organization: { name: string; tinNumber: string };
  signedBy: { fullName: string; email: string };
}

export default function AdminAgreementManager() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const safeText = (value?: string | null, fallback = "N/A") =>
    value && value.trim().length > 0 ? value : fallback;
  const normalize = (value?: string | null) =>
    safeText(value, "").toLowerCase();
  // State Matrix
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionProcessing, setActionProcessing] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pagination State
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [pages, setPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Administrative Filter Matrix
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [yearFilter, setYearFilter] = useState<string>("All");

  // Agreement generation modal
  const [generateOpen, setGenerateOpen] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generatePayload, setGeneratePayload] = useState({
    userId: "",
    organizationId: "",
    recruitmentDeadline: "",
  });

  // Stats Counters
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    revoked: 0,
  });

  // Fetch Agreements Registry from Server
  const fetchAdminRegistry = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const statusParam = statusFilter !== "All" ? statusFilter : undefined;
      const yearParam = yearFilter !== "All" ? yearFilter : undefined;
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (statusParam) query.set("status", statusParam);
      if (yearParam) query.set("year", yearParam);

      const result = await apiRequest<any>(`/agreements?${query.toString()}`);

      if (result.success) {
        const data: Agreement[] = result.data.agreements || [];
        setAgreements(data);
        setTotalCount(result.data.total || 0);
        setPages(result.data.pages || 1);

        // Calculate operational summary dashboard counts
        setStats({
          total: result.data.total || data.length,
          active: data.filter((a) => a.status === "Active").length,
          pending: data.filter((a) => a.status === "Pending").length,
          revoked: data.filter((a) => a.status === "Revoked").length,
        });
      } else {
        setErrorMessage(result.message || "Failed to load agreements.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setErrorMessage(message || "Failed to load agreements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminRegistry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, statusFilter, yearFilter]);

  // Core Admin Action Handlers
  const handleModifyStatus = async (
    id: number,
    nextStatus: "Superseded" | "Expired" | "Revoked",
  ) => {
    const confirmMessage =
      nextStatus === "Revoked"
        ? `🚨 WARNING: Revoking an agreement is an un-doable regulatory action. It will instantly suspend company access licenses. Proceed?`
        : `Are you sure you want to change the agreement operational lifecycle status to ${nextStatus}?`;

    if (!window.confirm(confirmMessage)) return;

    setActionProcessing(id);
    try {
      const result = await apiRequest<any>(`/agreements/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });

      if (result.success) {
        setAgreements((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: result.data.status } : item,
          ),
        );
      }
    } catch (error) {
      alert("Error processing transaction status updates.");
    } finally {
      setActionProcessing(null);
    }
  };

  const handleGenerateAgreement = async () => {
    setGenerateLoading(true);
    try {
      const payload = {
        userId: Number(generatePayload.userId),
        organizationId: Number(generatePayload.organizationId),
        recruitmentDeadline: generatePayload.recruitmentDeadline,
      };

      const result = await apiRequest<any>("/agreements/generate", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (result.success) {
        setGenerateOpen(false);
        setGeneratePayload({
          userId: "",
          organizationId: "",
          recruitmentDeadline: "",
        });
        fetchAdminRegistry();
      } else {
        alert(result.message || "Failed to generate agreement.");
      }
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to generate agreement.",
      );
    } finally {
      setGenerateLoading(false);
    }
  };

  // Pipeline Filter Logic
  const filteredAgreements = agreements.filter((item) => {
    const orgObj = item.organization || { name: item.snapshotData?.agencyName };
    const orgName =
      language === "am"
        ? orgObj?.nameAmharic || orgObj?.name || orgObj?.nameEnglish || ""
        : orgObj?.nameEnglish || orgObj?.name || orgObj?.nameAmharic || "";
    const tinNumber = item.organization?.tinNumber;
    const signedByName = item.snapshotData?.signedByFullName;
    const matchesSearch =
      normalize(orgName).includes(searchQuery.toLowerCase()) ||
      normalize(item.agreementNumber).includes(searchQuery.toLowerCase()) ||
      normalize(signedByName).includes(searchQuery.toLowerCase()) ||
      normalize(tinNumber).includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || item.status === statusFilter;
    const matchesYear =
      yearFilter === "All" ||
      new Date(item.issuedDate).getFullYear().toString() === yearFilter;

    return matchesSearch && matchesStatus && matchesYear;
  });

  // Dynamic Tailwind Badge Color Maps
  const getBadgeStyle = (status: Agreement["status"]) => {
    const styles = {
      Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
      Pending: "bg-amber-50 text-amber-700 border-amber-200",
      Superseded: "bg-blue-50 text-blue-700 border-blue-200",
      Expired: "bg-slate-100 text-slate-700 border-slate-300",
      Revoked: "bg-rose-50 text-rose-700 border-rose-200",
    };
    return `px-2.5 py-1 text-xs font-semibold rounded-md border ${styles[status]}`;
  };

  const years = useMemo(() => {
    const set = new Set<string>();
    agreements.forEach((a) => {
      if (a.issuedDate)
        set.add(new Date(a.issuedDate).getFullYear().toString());
    });
    return Array.from(set).sort((a, b) => Number(b) - Number(a));
  }, [agreements]);

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans antialiased text-slate-800">
      {/* 1. Page Main Header Layout Component */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-6 mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <FileCheck className="text-indigo-600 h-8 w-8" />
            Central Regulatory Agreements Registry
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Global Administrative Control Workspace. Inspect company metadata
            snapshots, audit system operations, and modify license compliance
            timelines.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setGenerateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
          >
            <PlusCircle className="h-4 w-4" /> Generate Agreement
          </button>
          <button
            onClick={fetchAdminRegistry}
            className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 active:scale-95 transition-all text-slate-700"
          >
            <RefreshCw
              className={`h-4 w-4 text-slate-500 ${loading ? "animate-spin" : ""}`}
            />{" "}
            Refresh Database
          </button>
        </div>
      </div>

      {/* 2. Executive Stat KPI Dashboard Counter Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Total Generated
            </p>
            <h3 className="text-2xl font-black text-slate-900">
              {stats.total}
            </h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Active Licenses
            </p>
            <h3 className="text-2xl font-black text-emerald-600">
              {stats.active}
            </h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-50 rounded-lg">
            <Calendar className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Pending Sign
            </p>
            <h3 className="text-2xl font-black text-amber-600">
              {stats.pending}
            </h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Revoked / Suspended
            </p>
            <h3 className="text-2xl font-black text-rose-600">
              {stats.revoked}
            </h3>
          </div>
        </div>
      </div>

      {/* 3. Advanced Filtering Operations Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search matching items by Serial Code, Agency Name, TIN Number, Signee Representative..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
          />
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 bg-slate-50">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-sm font-medium focus:outline-none py-2 cursor-pointer text-slate-700"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Superseded">Superseded</option>
              <option value="Expired">Expired</option>
              <option value="Revoked">Revoked</option>
            </select>
          </div>
          <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 bg-slate-50">
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="bg-transparent text-sm font-medium focus:outline-none py-2 cursor-pointer text-slate-700"
            >
              <option value="All">All Calendar Years</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm p-3 rounded-lg mb-6">
          {errorMessage}
        </div>
      )}

      {/* 4. Core Master Database Table Registry */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400 text-sm font-medium">
          <RefreshCw className="h-5 w-5 animate-spin mr-2 text-indigo-600" />{" "}
          Connecting to server registries...
        </div>
      ) : filteredAgreements.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-16 text-center text-slate-400 font-medium">
          No administrative agreement rows match your active search filters.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-400 tracking-wider">
                  <th className="p-4 pl-6">Serial Number</th>
                  <th className="p-4">Agency Information</th>
                  <th className="p-4">Officer Signature Context</th>
                  <th className="p-4">Active Contract Windows</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right pr-6">
                    Administrative Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium">
                {filteredAgreements.map((agreement) => (
                  <tr
                    key={agreement.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="p-4 pl-6 font-mono font-bold text-indigo-600">
                      {agreement.agreementNumber}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Building2 className="h-4 w-4 text-slate-400" />{" "}
                        {(() => {
                          const orgObj = agreement.organization || {
                            name: agreement.snapshotData?.agencyName,
                          };
                          const displayName =
                            language === "am"
                              ? (orgObj as any).nameAmharic ||
                                orgObj.name ||
                                (orgObj as any).nameEnglish ||
                                "N/A"
                              : (orgObj as any).nameEnglish ||
                                orgObj.name ||
                                (orgObj as any).nameAmharic ||
                                "N/A";
                          return displayName;
                        })()}
                      </div>
                      {/* <div className="text-xs text-slate-400 font-semibold mt-0.5">
                        TIN: {safeText(agreement.organization?.tinNumber)}
                      </div> */}
                    </td>
                    <td className="p-4 text-slate-600">
                      <div>
                        {safeText(agreement.snapshotData?.signedByFullName)}
                      </div>
                      <div className="text-xs text-slate-400">
                        Database User Account Link: #{agreement.signedById}
                      </div>
                    </td>
                    <td className="p-4 text-xs font-semibold text-slate-600">
                      <div>
                        <span className="text-slate-400">Commence:</span>{" "}
                        {new Date(agreement.issuedDate).toLocaleDateString(
                          "en-GB",
                        )}
                      </div>
                      <div className="mt-0.5">
                        <span className="text-slate-400">Terminates:</span>{" "}
                        {new Date(agreement.expiryDate).toLocaleDateString(
                          "en-GB",
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={getBadgeStyle(agreement.status)}>
                        {agreement.status}
                      </span>
                    </td>
                    <td className="p-4 text-right pr-6 flex items-center justify-end gap-2">
                      <button
                        onClick={() =>
                          navigate(`/admin/agreements/${agreement.id}`)
                        }
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-md border border-slate-200 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" /> Inspect Context
                      </button>

                      {/* Status Mutation Logic Guards */}
                      {agreement.status === "Active" && (
                        <>
                          <button
                            disabled={actionProcessing !== null}
                            onClick={() =>
                              handleModifyStatus(agreement.id, "Expired")
                            }
                            className="px-2.5 py-1.5 text-xs font-bold border border-slate-200 hover:bg-slate-100 hover:text-slate-900 text-slate-600 rounded-md transition-colors disabled:opacity-50"
                          >
                            Expire
                          </button>
                          <button
                            disabled={actionProcessing !== null}
                            onClick={() =>
                              handleModifyStatus(agreement.id, "Revoked")
                            }
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-md border border-rose-100 transition-all disabled:opacity-50"
                          >
                            <ShieldAlert className="h-3.5 w-3.5" /> Revoke
                            License
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredAgreements.length > 0 && (
        <div className="flex items-center justify-between mt-6 text-sm text-slate-600">
          <div>
            Showing {(page - 1) * limit + 1}-
            {Math.min(page * limit, totalCount)} of {totalCount}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1 rounded border border-slate-200 disabled:opacity-50"
            >
              Prev
            </button>
            <span>
              Page {page} of {pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page >= pages}
              className="px-3 py-1 rounded border border-slate-200 disabled:opacity-50"
            >
              Next
            </button>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="ml-2 border border-slate-200 rounded px-2 py-1"
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {generateOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-xl p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-slate-900">
                Generate Agreement
              </h2>
              <button
                onClick={() => setGenerateOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold border p-1 px-2.5 rounded-lg hover:bg-slate-50 border-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">
                  User ID
                </label>
                <input
                  value={generatePayload.userId}
                  onChange={(e) =>
                    setGeneratePayload((p) => ({
                      ...p,
                      userId: e.target.value,
                    }))
                  }
                  className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="e.g. 45"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">
                  Organization ID
                </label>
                <input
                  value={generatePayload.organizationId}
                  onChange={(e) =>
                    setGeneratePayload((p) => ({
                      ...p,
                      organizationId: e.target.value,
                    }))
                  }
                  className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="e.g. 36"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">
                  Recruitment Deadline
                </label>
                <input
                  type="datetime-local"
                  value={generatePayload.recruitmentDeadline}
                  onChange={(e) =>
                    setGeneratePayload((p) => ({
                      ...p,
                      recruitmentDeadline: e.target.value,
                    }))
                  }
                  className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setGenerateOpen(false)}
                className="px-4 py-2 rounded bg-slate-100 text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateAgreement}
                disabled={generateLoading}
                className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-50"
              >
                {generateLoading ? "Generating..." : "Generate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
