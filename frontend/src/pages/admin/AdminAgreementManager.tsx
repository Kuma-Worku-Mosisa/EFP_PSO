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
  organization: { name: string; nameAmharic?: string; nameEnglish?: string; tinNumber: string };
  signedBy: { fullName: string; email: string };
}

export default function AdminAgreementManager() {
  const { language } = useLanguage();
  const isAm = language === "am";
  const navigate = useNavigate();
  const safeText = (value?: string | null, fallback = "N/A") =>
    value && value.trim().length > 0 ? value : (isAm ? fallback : fallback);
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
        ? isAm
          ? "🚨 ማስጠንቀቂያ: ስምምነትን መሰረዝ የማይቀለበስ የቁጥጥር እርምጃ ነው። የኩባንያውን የመዳረሻ ፈቃዶች ወዲያውኑ ያቋርጣል። ይቀጥላሉ?"
          : `🚨 WARNING: Revoking an agreement is an un-doable regulatory action. It will instantly suspend company access licenses. Proceed?`
        : isAm ? `የስምምነቱን የስራ ሁኔታ ወደ ${nextStatus} መቀየር ይፈልጋሉ?`
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
      alert(isAm ? "የግብይት ሁኔታ ዝማኔን በማስኬድ ላይ ስህተት ተከስቷል።" : "Error processing transaction status updates.");
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
        alert(result.message || (isAm ? "ስምምነት መፍጠር አልተሳካም።" : "Failed to generate agreement."));
      }
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : isAm ? "ስምምነት መፍጠር አልተሳካም።"
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
    return `px-2.5 py-1 text-xs font-semibold rounded-xl border ${styles[status]}`;
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
    <div className="min-h-screen bg-gray-50 p-8 font-sans antialiased">
      {/* 1. Page Main Header Layout Component */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200 pb-6 mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#003366] flex items-center gap-2">
            <FileCheck className="text-[#003366] h-8 w-8" />
            {isAm ? "ማዕከላዊ የቁጥጥር ስምምነት መዝገብ" : "Central Regulatory Agreements Registry"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isAm ? "አጠቃላይ የአስተዳደር ቁጥጥር የስራ ቦታ። የኩባንያ ሜታዳታ ቅጽበታዊ ገጽታዎችን ይመርምሩ።" : "Global Administrative Control Workspace. Inspect company metadata snapshots, audit system operations, and modify license compliance timelines."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setGenerateOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#003366] text-white rounded-2xl text-sm font-black shadow-lg shadow-[#003366]/30 hover:bg-[#002244] active:scale-95 transition-all"
          >
            <PlusCircle className="h-4 w-4" /> {isAm ? "ስምምነት ፍጠር" : "Generate Agreement"}
          </button>
          <button
            onClick={fetchAdminRegistry}
            className="flex items-center gap-2 px-5 py-3 text-sm font-bold bg-white border border-gray-200 rounded-2xl shadow-sm hover:bg-gray-50 active:scale-95 transition-all text-gray-600"
          >
            <RefreshCw
              className={`h-4 w-4 text-gray-400 ${loading ? "animate-spin" : ""}`}
            />{" "}
            {isAm ? "ዳታቤዝ አድስ" : "Refresh Database"}
          </button>
        </div>
      </div>

      {/* 2. Executive Stat KPI Dashboard Counter Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-[#003366]/10 text-[#003366] rounded-xl">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
              {isAm ? "ጠቅላላ የተፈጠረ" : "Total Generated"}
            </p>
            <h3 className="text-2xl font-black text-[#003366]">
              {stats.total}
            </h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
              {isAm ? "ንቁ ፈቃዶች" : "Active Licenses"}
            </p>
            <h3 className="text-2xl font-black text-emerald-600">
              {stats.active}
            </h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
              {isAm ? "በመጠባበቅ ላይ" : "Pending Sign"}
            </p>
            <h3 className="text-2xl font-black text-amber-600">
              {stats.pending}
            </h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
              {isAm ? "የተሰረዘ / የታገደ" : "Revoked / Suspended"}
            </p>
            <h3 className="text-2xl font-black text-rose-600">
              {stats.revoked}
            </h3>
          </div>
        </div>
      </div>

      {/* 3. Advanced Filtering Operations Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={isAm ? "በተከታታይ ኮድ፣ የኤጀንሲ ስም፣ ቲን ቁጥር፣ ፈራሚ ይፈልጉ..." : "Search matching items by Serial Code, Agency Name, TIN Number, Signee Representative..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003366] transition-all"
          />
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 bg-gray-50">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-sm font-medium focus:outline-none py-2 cursor-pointer text-gray-700"
            >
              <option value="All">{isAm ? "ሁሉም ሁኔታዎች" : "All Statuses"}</option>
              <option value="Active">{isAm ? "ንቁ" : "Active"}</option>
              <option value="Pending">{isAm ? "በመጠባበቅ ላይ" : "Pending"}</option>
              <option value="Superseded">{isAm ? "የተተካ" : "Superseded"}</option>
              <option value="Expired">{isAm ? "ያለፈበት" : "Expired"}</option>
              <option value="Revoked">{isAm ? "የተሰረዘ" : "Revoked"}</option>
            </select>
          </div>
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 bg-gray-50">
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="bg-transparent text-sm font-medium focus:outline-none py-2 cursor-pointer text-gray-700"
            >
              <option value="All">{isAm ? "ሁሉም አመታት" : "All Calendar Years"}</option>
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
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm p-3 rounded-xl mb-6">
          {errorMessage}
        </div>
      )}

      {/* 4. Core Master Database Table Registry */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400 text-sm font-medium">
          <RefreshCw className="h-5 w-5 animate-spin mr-2 text-[#003366]" />{" "}
          {isAm ? "ከሰርቨር መዝገቦች ጋር በመገናኘት ላይ..." : "Connecting to server registries..."}
        </div>
      ) : filteredAgreements.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center text-gray-400 font-medium">
          {isAm ? "ምንም የአስተዳደር ስምምነት ከፍልፋዮችዎ ጋር አልተገናኘም።" : "No administrative agreement rows match your active search filters."}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-[#003366] to-[#001F3F] text-white text-xs font-bold uppercase tracking-wider">
                  <th className="p-4 pl-6">{isAm ? "ተከታታይ ቁጥር" : "Serial Number"}</th>
                  <th className="p-4">{isAm ? "የኤጀንሲ መረጃ" : "Agency Information"}</th>
                  <th className="p-4">{isAm ? "የኃላፊ ፊርማ መረጃ" : "Officer Signature Context"}</th>
                  <th className="p-4">{isAm ? "ንቁ የውል ቀናት" : "Active Contract Windows"}</th>
                  <th className="p-4">{isAm ? "ሁኔታ" : "Status"}</th>
                  <th className="p-4 text-right pr-6">
                    {isAm ? "የአስተዳደር እርምጃዎች" : "Administrative Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-medium">
                {filteredAgreements.map((agreement) => (
                  <tr
                    key={agreement.id}
                    className="hover:bg-gray-50/80 transition-colors"
                  >
                    <td className="p-4 pl-6 font-mono font-bold text-[#003366]">
                      {agreement.agreementNumber}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-[#003366] flex items-center gap-1.5">
                        <Building2 className="h-4 w-4 text-gray-400" />{" "}
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
                    </td>
                    <td className="p-4 text-gray-600">
                      <div>
                        {safeText(agreement.snapshotData?.signedByFullName)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {isAm ? "የዳታቤዝ ተጠቃሚ አካውንት አገናኝ: #" : "Database User Account Link: #"}{agreement.signedById}
                      </div>
                    </td>
                    <td className="p-4 text-xs font-semibold text-gray-600">
                      <div>
                        <span className="text-gray-400">{isAm ? "የሚጀምርበት:" : "Commence:"}</span>{" "}
                        {new Date(agreement.issuedDate).toLocaleDateString(
                          isAm ? "en-GB" : "en-GB",
                        )}
                      </div>
                      <div className="mt-0.5">
                        <span className="text-gray-400">{isAm ? "የሚያበቃበት:" : "Terminates:"}</span>{" "}
                        {new Date(agreement.expiryDate).toLocaleDateString(
                          isAm ? "en-GB" : "en-GB",
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={getBadgeStyle(agreement.status)}>
                        {agreement.status}
                      </span>
                    </td>
                    <td className="p-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            navigate(`/admin/agreements/${agreement.id}`)
                          }
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-gray-100 hover:bg-[#003366]/10 hover:text-[#003366] text-gray-600 rounded-xl border border-gray-200 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" /> {isAm ? "መረጃ ይመልከቱ" : "Inspect Context"}
                        </button>

                        {agreement.status === "Active" && (
                          <>
                            <button
                              disabled={actionProcessing !== null}
                              onClick={() =>
                                handleModifyStatus(agreement.id, "Expired")
                              }
                              className="px-2.5 py-1.5 text-xs font-bold border border-gray-200 hover:bg-gray-100 hover:text-gray-900 text-gray-600 rounded-xl transition-colors disabled:opacity-50"
                            >
                              {isAm ? "ያቋርጡ" : "Expire"}
                            </button>
                            <button
                              disabled={actionProcessing !== null}
                              onClick={() =>
                                handleModifyStatus(agreement.id, "Revoked")
                              }
                              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border border-rose-100 transition-all disabled:opacity-50"
                            >
                              <ShieldAlert className="h-3.5 w-3.5" /> {isAm ? "ፈቃድ ይሰርዙ" : "Revoke License"}
                            </button>
                          </>
                        )}
                      </div>
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
        <div className="flex items-center justify-between mt-6 text-sm text-gray-600">
          <div>
            {(isAm ? "እያሳየ " : "Showing ")}{(page - 1) * limit + 1}-{Math.min(page * limit, totalCount)} {isAm ? " ከ" : " of "}{totalCount}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1 rounded-xl border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              {isAm ? "ቀዳሚ" : "Prev"}
            </button>
            <span>
              {isAm ? "ገፅ" : "Page"} {page} {isAm ? "ከ" : "of"} {pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page >= pages}
              className="px-3 py-1 rounded-xl border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              {isAm ? "ቀጣይ" : "Next"}
            </button>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="ml-2 border border-gray-200 rounded-xl px-2 py-1 text-sm"
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n} {isAm ? "/ ገፅ" : "/ page"}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {generateOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-xl border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-[#003366]">
                {isAm ? "ስምምነት ፍጠር" : "Generate Agreement"}
              </h2>
              <button
                onClick={() => setGenerateOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold border p-1 px-2.5 rounded-xl hover:bg-gray-50 border-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500">
                  {isAm ? "የተጠቃሚ መለያ" : "User ID"}
                </label>
                <input
                  value={generatePayload.userId}
                  onChange={(e) =>
                    setGeneratePayload((p) => ({
                      ...p,
                      userId: e.target.value,
                    }))
                  }
                  className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]"
                  placeholder={isAm ? "ለምሳሌ 45" : "e.g. 45"}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500">
                  {isAm ? "የድርጅት መለያ" : "Organization ID"}
                </label>
                <input
                  value={generatePayload.organizationId}
                  onChange={(e) =>
                    setGeneratePayload((p) => ({
                      ...p,
                      organizationId: e.target.value,
                    }))
                  }
                  className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]"
                  placeholder={isAm ? "ለምሳሌ 36" : "e.g. 36"}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500">
                  {isAm ? "የምልመላ መጨረሻ ቀን" : "Recruitment Deadline"}
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
                  className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setGenerateOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-bold hover:bg-gray-200 transition-colors"
              >
                {isAm ? "ሰርዝ" : "Cancel"}
              </button>
              <button
                onClick={handleGenerateAgreement}
                disabled={generateLoading}
                className="px-5 py-2.5 rounded-xl bg-[#003366] text-white text-sm font-bold disabled:opacity-50 hover:bg-[#002244] transition-colors"
              >
                {generateLoading
                  ? isAm ? "በመፍጠር ላይ..." : "Generating..."
                  : isAm ? "ፍጠር" : "Generate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
