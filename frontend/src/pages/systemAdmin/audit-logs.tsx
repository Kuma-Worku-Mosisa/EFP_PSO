//filepath: frontend/src/pages/systemAdmin/audit-logs.tsx
import React, { useState, useEffect } from "react";
import { X, Loader2, ArrowLeftCircle, ArrowRightCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { apiRequest, resolveBackendAssetUrl } from "../../lib/api";
import { useLanguage } from "../../context/LanguageContext";

interface ActorUser {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  faydaId: string;
  photoUrl: string | null;
  status: string;
  createdAt: string;
  user_roles?: {
    role_id: number;
    roles: { role_name: string };
  }[];
}

// System Admin Audit Log Viewer — protected: requires `system_admin` role
export default function AuditLogViewer() {
  const { user, isAuthenticated } = useAuth() as any;
  const { language } = useLanguage();
  const isAm = language === "am";
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [jumpPage, setJumpPage] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [userFilter, setUserFilter] = useState<string>("");
  const [entityFilter, setEntityFilter] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [actionFilter, setActionFilter] = useState<string>("");

  const [actorModalOpen, setActorModalOpen] = useState(false);
  const [actorLoading, setActorLoading] = useState(false);
  const [actorError, setActorError] = useState<string | null>(null);
  const [actorDetails, setActorDetails] = useState<ActorUser | null>(null);
  const [selectedActorId, setSelectedActorId] = useState<number | null>(null);

  const isSystemAdmin = Boolean(user?.roles?.includes("system_admin"));

  const unwrapApiData = <T,>(payload: unknown): T => {
    if (payload && typeof payload === "object" && "success" in payload) {
      const envelope = payload as { success: boolean; data: T };
      return envelope.success ? envelope.data : (payload as T);
    }
    return payload as T;
  };

  const closeActorModal = () => {
    setActorModalOpen(false);
    setActorDetails(null);
    setActorError(null);
    setSelectedActorId(null);
    setActorLoading(false);
  };

  const openActorDetails = async (userId: number) => {
    setSelectedActorId(userId);
    setActorModalOpen(true);
    setActorLoading(true);
    setActorError(null);
    setActorDetails(null);

    try {
      const payload = await apiRequest(`/users/${userId}`);
      setActorDetails(unwrapApiData<ActorUser>(payload));
    } catch (error) {
      console.error("Failed to fetch actor details", error);
      setActorError("Unable to load actor details. Please try again.");
    } finally {
      setActorLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !isSystemAdmin) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const fetchLogs = async () => {
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("pageSize", String(pageSize));
        if (userFilter) params.set("userId", userFilter);
        if (entityFilter) params.set("entityName", entityFilter);
        if (actionFilter) params.set("action", actionFilter);
        if (fromDate) params.set("from", fromDate);

        const data: any = await apiRequest(
          `/admin/audit-logs?${params.toString()}`,
        );
        if (data.success) {
          setLogs(data.data.items || []);
          setTotal(data.data.total || 0);
        } else {
          console.error("API Error fetching logs", data);
        }
      } catch (error) {
        console.error("Failed to fetch logs", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [isAuthenticated, isSystemAdmin, page, pageSize, refreshKey]);

  // Utility to safely parse the stringified JSON from your backend
  const parseJSON = (jsonString: string | null) => {
    if (!jsonString) return null;
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      return jsonString; // Fallback if it's just a raw string
    }
  };

  // Render state as key-value pairs, optionally diff-highlighted
  const renderStateFields = (
    raw: string | null,
    compareRaw?: string | null,
    highlightDiff?: boolean,
  ) => {
    const obj = parseJSON(raw);
    const compareObj =
      highlightDiff && compareRaw ? parseJSON(compareRaw) : null;

    if (!obj || typeof obj !== "object") {
      return (
        <div className="p-6 rounded-xl border border-dashed border-[#003366]/20 text-xs text-gray-500 italic text-center font-medium">
          {raw ? String(raw) : isAm ? "ምንም ውሂብ የለም" : "No data"}
        </div>
      );
    }

    const entries = Object.entries(obj as Record<string, unknown>);

    if (entries.length === 0) {
      return (
        <div className="p-6 rounded-xl border border-dashed border-[#003366]/20 text-xs text-gray-500 italic text-center font-medium">
          {isAm ? "ባዶ ውሂብ" : "Empty data"}
        </div>
      );
    }

    const rowBg = highlightDiff
      ? "bg-green-50 hover:bg-green-100"
      : "bg-red-50 hover:bg-red-100";

    return (
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#003366] text-white">
              <th className="px-4 py-3 font-bold uppercase tracking-wider text-left w-1/3">
                {isAm ? "የውሂብ መስክ" : "Field"}
              </th>
              <th className="px-4 py-3 font-bold uppercase tracking-wider text-left">
                {highlightDiff
                  ? isAm
                    ? "አዲስ እሴት"
                    : "New Value"
                  : isAm
                    ? "እሴት"
                    : "Value"}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {entries.map(([key, value]) => {
              const displayValue =
                value !== null && value !== undefined ? String(value) : "—";
              const isChanged =
                highlightDiff &&
                compareObj &&
                typeof compareObj === "object" &&
                JSON.stringify((compareObj as Record<string, unknown>)[key]) !==
                  JSON.stringify(value);

              return (
                <tr
                  key={key}
                  className={
                    isChanged
                      ? "bg-amber-100 border-l-4 border-l-amber-500 shadow-inner"
                      : rowBg
                  }
                >
                  <td className="px-4 py-3 font-bold text-gray-700 whitespace-nowrap">
                    {key}
                  </td>
                  <td className="px-4 py-3 text-gray-900 break-words font-medium">
                    {displayValue}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // Utility for Badge Colors
  const getActionBadge = (action: string) => {
    switch (action) {
      case "CREATE":
        return (
          <span className="px-2 py-1 text-xs font-bold rounded-md bg-green-100 text-green-800 border border-green-200">
            CREATE
          </span>
        );
      case "UPDATE":
        return (
          <span className="px-2 py-1 text-xs font-bold rounded-md bg-blue-100 text-blue-800 border border-blue-200">
            UPDATE
          </span>
        );
      case "DELETE":
        return (
          <span className="px-2 py-1 text-xs font-bold rounded-md bg-red-100 text-red-800 border border-red-200">
            DELETE
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-bold rounded-md bg-gray-100 text-gray-800 border border-gray-200">
            {action}
          </span>
        );
    }
  };

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPage(1);
    setLoading(true);
    setRefreshKey((k) => k + 1);
  };

  if (loading)
    return (
      <div className="p-10 text-center text-[#003366] font-medium">
        {isAm ? "የስርዓት መዝገቦችን በመጫን ላይ..." : "Loading System Logs..."}
      </div>
    );

  if (!isSystemAdmin) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h2 className="text-xl font-bold text-rose-600">
          {isAm ? "መዳረሻ ተከልክሏል" : "Access Denied"}
        </h2>
        <p className="text-sm text-gray-600 mt-2">
          {isAm
            ? "የስርዓት መዝገቦችን ለማየት ፈቃድ የለዎትም። ይህ ቦታ የsystem_admin ሚና ላላቸው ተጠቃሚዎች ብቻ ነው።"
            : "You do not have permission to view system audit logs. This area is restricted to users with the"}
          <span className="font-mono"> system_admin</span>{" "}
          {isAm ? "ሚና" : "role"}.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#003366]">
          {isAm ? "የስርዓት መዝገቦች" : "System Audit Logs"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isAm
            ? "የሁሉም አስተዳደራዊ እና የተጠቃሚ ድርጊቶች የማይሻር መዝገብ"
            : "Immutable record of all administrative and user actions."}
        </p>
      </div>

      {/* Filters */}
      <div
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleApply();
          }
        }}
        className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-wrap items-center gap-3"
      >
        <input
          placeholder={isAm ? "የተጠቃሚ መለያ" : "User ID"}
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition-all w-32"
        />
        <input
          placeholder={isAm ? "የድርጅት ስም" : "Entity Name"}
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition-all w-48"
        />
        <label className="sr-only" htmlFor="fromDate">
          {isAm ? "ቀን (ከ)" : "Date (from)"}
        </label>
        <input
          id="fromDate"
          type="date"
          title={
            isAm
              ? "በዚህ ቀን ወይም በኋላ ውጤቶችን አጣራ"
              : "Filter results on or after this date"
          }
          aria-label={isAm ? "ቀን ከ" : "Date from"}
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition-all"
        />
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition-all"
        >
          <option value="">{isAm ? "ሁሉም ድርጊቶች" : "All Actions"}</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
          <option value="LOGIN">LOGIN</option>
        </select>
        <button
          type="button"
          onClick={() => handleApply()}
          className="px-5 py-2.5 bg-[#003366] text-white rounded-xl font-bold text-sm hover:bg-[#002244] transition-all shadow-md hover:shadow-lg"
        >
          {isAm ? "አጣራ" : "Filter"}
        </button>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-gray-500 font-medium">
            {isAm ? "የገጽ መጠን" : "Page Size"}
          </span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition-all"
          >
            {[10, 25, 50, 100].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-bold text-[#003366] text-xs uppercase tracking-wider">
                {isAm ? "የተፈጠረበት ቀን" : "Timestamp"}
              </th>
              <th className="px-6 py-4 font-bold text-[#003366] text-xs uppercase tracking-wider">
                {isAm ? "ድርጊት" : "Action"}
              </th>
              <th className="px-6 py-4 font-bold text-[#003366] text-xs uppercase tracking-wider">
                {isAm ? "ዒላማ" : "Entity Target"}
              </th>
              <th className="px-6 py-4 font-bold text-[#003366] text-xs uppercase tracking-wider">
                {isAm ? "ተጠቃሚ" : "Actor (User ID)"}
              </th>
              <th className="px-6 py-4 font-bold text-[#003366] text-xs uppercase tracking-wider text-right">
                {isAm ? "ዝርዝር" : "Details"}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.map((log) => (
              <React.Fragment key={log.id}>
                {/* Main Row */}
                <tr className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">{getActionBadge(log.action)}</td>
                  <td className="px-6 py-4 font-medium text-[#003366]">
                    {log.entityName}{" "}
                    <span className="text-gray-400 font-mono text-xs">
                      #{log.entityId}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {log.userId ? (
                      <div className="flex items-center gap-2">
                        <span className="bg-[#003366]/5 text-[#003366] px-2.5 py-1 rounded-lg text-xs font-mono border border-[#003366]/10">
                          ID: {log.userId}
                        </span>
                        <button
                          type="button"
                          onClick={() => openActorDetails(log.userId)}
                          className="text-[#003366] hover:text-[#001F3F] font-semibold text-xs transition-colors whitespace-nowrap"
                        >
                          {isAm ? "ዝርዝር ይመልከቱ" : "View Details"}
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">
                        System / Anonymous
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() =>
                        setExpandedRow(expandedRow === log.id ? null : log.id)
                      }
                      className="text-[#003366] hover:text-[#001F3F] font-semibold text-sm transition-colors"
                    >
                      {expandedRow === log.id
                        ? isAm
                          ? "ውሂብ ደብቅ"
                          : "Hide Data"
                        : isAm
                          ? "ውሂብ ይመልከቱ"
                          : "View Payload"}
                    </button>
                  </td>
                </tr>

                {/* Expanded Payload Row */}
                {expandedRow === log.id && (
                  <tr className="bg-[#003366]/[0.02] border-b border-gray-100">
                    <td colSpan={5} className="p-0">
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-100">
                        <div>
                          <h4 className="text-xs font-bold text-[#003366] uppercase tracking-wider mb-3 flex items-center gap-2">
                            <ArrowLeftCircle className="w-4 h-4 text-red-500" />
                            {isAm ? "የቀድሞ ሁኔታ" : "Previous State"}
                          </h4>
                          {log.oldValue ? (
                            renderStateFields(log.oldValue)
                          ) : (
                            <div className="bg-[#003366]/5 p-6 rounded-xl border border-dashed border-[#003366]/20 text-xs text-gray-500 italic text-center font-medium">
                              {isAm
                                ? "ምንም የቀድሞ ውሂብ የለም"
                                : "No previous data (New Creation)"}
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#003366] uppercase tracking-wider mb-3 flex items-center gap-2">
                            <ArrowRightCircle className="w-4 h-4 text-green-500" />
                            {isAm ? "አዲስ ሁኔታ" : "New State"}
                          </h4>
                          {log.newValue ? (
                            renderStateFields(log.newValue, log.oldValue, true)
                          ) : (
                            <div className="bg-[#003366]/5 p-6 rounded-xl border border-dashed border-[#003366]/20 text-xs text-gray-500 italic text-center font-medium">
                              {isAm ? "ምንም ውሂብ የለም" : "No data"}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {/* Actor Details Modal */}
      {actorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="bg-primary text-white px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold tracking-widest uppercase text-white/80">
                  {isAm ? "የተጠቃሚ ዝርዝር" : "Actor Details"}
                </p>
                <p className="text-sm font-semibold mt-0.5">
                  {isAm ? "የተጠቃሚ መለያ #" : "User ID #"}
                  {selectedActorId}
                </p>
              </div>
              <button
                type="button"
                onClick={closeActorModal}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close actor details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              {actorLoading && (
                <div className="flex items-center justify-center py-10 text-gray-500 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">
                    {isAm ? "የተጠቃሚ መረጃ በመጫን ላይ..." : "Loading actor profile..."}
                  </span>
                </div>
              )}

              {!actorLoading && actorError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {actorError}
                </div>
              )}

              {!actorLoading && !actorError && actorDetails && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    {actorDetails.photoUrl ? (
                      <img
                        src={resolveBackendAssetUrl(actorDetails.photoUrl)}
                        alt={actorDetails.fullName || actorDetails.username}
                        className="w-14 h-14 rounded-full object-cover border"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display =
                            "none";
                        }}
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-primary font-bold text-lg border">
                        {actorDetails.fullName?.charAt(0) ||
                          actorDetails.username?.charAt(0) ||
                          "?"}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-gray-900">
                        {actorDetails.fullName || "—"}
                      </p>
                      <p className="text-sm text-gray-500">
                        @{actorDetails.username}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {isAm ? "ኢሜይል" : "Email"}
                      </p>
                      <p className="text-sm mt-1 text-gray-800">
                        {actorDetails.email || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {isAm ? "ስልክ" : "Phone"}
                      </p>
                      <p className="text-sm mt-1 text-gray-800">
                        {actorDetails.phone || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {isAm ? "የፋይዳ መለያ" : "Fayda ID"}
                      </p>
                      <p className="text-sm mt-1 text-gray-800 font-mono">
                        {actorDetails.faydaId || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {isAm ? "ሚና" : "Role"}
                      </p>
                      <p className="text-sm mt-1 text-gray-800 capitalize">
                        {(
                          actorDetails.user_roles?.[0]?.roles?.role_name ||
                          (isAm ? "አልተመደበም" : "Unassigned")
                        ).replace(/_/g, " ")}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {isAm ? "ሁኔታ" : "Status"}
                      </p>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          actorDetails.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : actorDetails.status === "Suspended"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {actorDetails.status || "—"}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {isAm ? "መለያ የተፈጠረበት" : "Account Created"}
                      </p>
                      <p className="text-sm mt-1 text-gray-800">
                        {actorDetails.createdAt
                          ? new Date(actorDetails.createdAt).toLocaleString()
                          : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-6 py-3 flex justify-end border-t">
              <button
                type="button"
                onClick={closeActorModal}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:opacity-90 transition-colors"
              >
                {isAm ? "ዝጋ" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {isAm ? "የሚታየው" : "Showing"}{" "}
          {total === 0 ? 0 : (page - 1) * pageSize + 1} -{" "}
          {Math.min(total, page * pageSize)} {isAm ? "ከ" : "of"} {total}
        </div>
        <div className="flex items-center space-x-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage(1)}
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-sm text-[#003366] font-medium disabled:opacity-50 hover:bg-gray-50 transition-all"
          >
            {isAm ? "መጀመሪያ" : "First"}
          </button>
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-sm text-[#003366] font-medium disabled:opacity-50 hover:bg-gray-50 transition-all"
          >
            {isAm ? "ቀዳሚ" : "Prev"}
          </button>

          {(() => {
            const totalPages = Math.max(1, Math.ceil(total / pageSize));
            const windowSize = 5;
            let start = Math.max(1, page - Math.floor(windowSize / 2));
            let end = Math.min(totalPages, start + windowSize - 1);
            if (end - start + 1 < windowSize)
              start = Math.max(1, end - windowSize + 1);
            const pages = [];
            for (let p = start; p <= end; p++) pages.push(p);
            return (
              <div className="flex items-center space-x-1">
                {pages.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-1.5 border border-gray-200 rounded-xl text-sm font-medium transition-all ${
                      p === page
                        ? "bg-[#003366] text-white shadow-md"
                        : "bg-white text-[#003366] hover:bg-gray-50"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                {end < totalPages && (
                  <span className="px-2 text-sm text-gray-400">...</span>
                )}
              </div>
            );
          })()}

          <button
            disabled={page * pageSize >= total}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-sm text-[#003366] font-medium disabled:opacity-50 hover:bg-gray-50 transition-all"
          >
            {isAm ? "ቀጣይ" : "Next"}
          </button>
          <button
            disabled={page * pageSize >= total}
            onClick={() => setPage(Math.max(1, Math.ceil(total / pageSize)))}
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-sm text-[#003366] font-medium disabled:opacity-50 hover:bg-gray-50 transition-all"
          >
            {isAm ? "መጨረሻ" : "Last"}
          </button>

          <div className="flex items-center space-x-2">
            <input
              type="number"
              min={1}
              max={Math.max(1, Math.ceil(total / pageSize))}
              placeholder={isAm ? "ሂድ ወደ" : "Go to"}
              value={jumpPage}
              onChange={(e) => setJumpPage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const v = Number(jumpPage);
                  const totalPages = Math.max(1, Math.ceil(total / pageSize));
                  if (!isNaN(v) && v >= 1 && v <= totalPages) {
                    setPage(v);
                  }
                }
              }}
              className="w-20 px-3 py-1.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition-all"
            />
            <button
              onClick={() => {
                const v = Number(jumpPage);
                const totalPages = Math.max(1, Math.ceil(total / pageSize));
                if (!isNaN(v) && v >= 1 && v <= totalPages) {
                  setPage(v);
                }
              }}
              className="px-4 py-1.5 bg-[#003366] text-white rounded-xl text-sm font-medium hover:bg-[#002244] transition-all"
            >
              {isAm ? "ሂድ" : "Go"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
