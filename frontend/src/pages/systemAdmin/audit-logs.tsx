//filepath: frontend/src/pages/systemAdmin/audit-logs.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

// System Admin Audit Log Viewer — protected: requires `system_admin` role
export default function AuditLogViewer() {
  const { user, token, isAuthenticated } = useAuth() as any;
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

  const isSystemAdmin = Boolean(user?.roles?.includes("system_admin"));

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

        const response = await fetch(
          `http://localhost:5000/api/admin/audit-logs?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          },
        );
        const data = await response.json();
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
  }, [
    isAuthenticated,
    isSystemAdmin,
    token,
    page,
    pageSize,
    userFilter,
    entityFilter,
    fromDate,
    actionFilter,
    refreshKey,
  ]);

  // Utility to safely parse the stringified JSON from your backend
  const parseJSON = (jsonString: string | null) => {
    if (!jsonString) return null;
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      return jsonString; // Fallback if it's just a raw string
    }
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
      <div className="p-10 text-center text-gray-500">
        Loading System Logs...
      </div>
    );

  if (!isSystemAdmin) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h2 className="text-xl font-bold text-rose-600">Access Denied</h2>
        <p className="text-sm text-gray-600 mt-2">
          You do not have permission to view system audit logs. This area is
          restricted to users with the{" "}
          <span className="font-mono">system_admin</span> role.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Audit Logs</h1>
        <p className="text-sm text-gray-500">
          Immutable record of all administrative and user actions.
        </p>
      </div>

      {/* Filters */}
      <div
        onKeyDown={(e) => {
          // Intercept Enter and run the same apply logic without causing a native submit
          if (e.key === "Enter") {
            e.preventDefault();
            handleApply();
          }
        }}
        className="bg-white p-4 rounded-lg shadow-sm border flex flex-wrap items-center gap-3"
      >
        <input
          placeholder="User ID"
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleApply();
            }
          }}
          className="px-3 py-2 border rounded-lg w-32"
        />
        <input
          placeholder="Entity Name"
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleApply();
            }
          }}
          className="px-3 py-2 border rounded-lg w-48"
        />
        <label className="sr-only" htmlFor="fromDate">
          Date (from)
        </label>
        <input
          id="fromDate"
          type="date"
          title="Filter results on or after this date"
          aria-label="Date from"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleApply();
            }
          }}
          className="px-3 py-2 border rounded-lg"
        />
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleApply();
            }
          }}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="">All Actions</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
          <option value="LOGIN">LOGIN</option>
        </select>
        <button
          type="button"
          onClick={() => handleApply()}
          className="px-4 py-2 bg-primary text-white rounded-lg"
          title="Filter audit logs"
        >
          Filter
        </button>
        <div className="ml-auto flex items-center space-x-2">
          <span className="text-sm text-gray-500">Page Size</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="px-2 py-1 border rounded-lg"
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
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b text-gray-900">
            <tr>
              <th className="p-4 font-semibold">Timestamp</th>
              <th className="p-4 font-semibold">Action</th>
              <th className="p-4 font-semibold">Entity Target</th>
              <th className="p-4 font-semibold">Actor (User ID)</th>
              <th className="p-4 font-semibold text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.map((log) => (
              <React.Fragment key={log.id}>
                {/* Main Row */}
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4">{getActionBadge(log.action)}</td>
                  <td className="p-4 font-medium text-gray-900">
                    {log.entityName}{" "}
                    <span className="text-gray-400 font-mono text-xs">
                      #{log.entityId}
                    </span>
                  </td>
                  <td className="p-4">
                    {log.userId ? (
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono border">
                        ID: {log.userId}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">
                        System / Anonymous
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() =>
                        setExpandedRow(expandedRow === log.id ? null : log.id)
                      }
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                    >
                      {expandedRow === log.id ? "Hide Data" : "View Payload"}
                    </button>
                  </td>
                </tr>

                {/* Expanded Payload Row */}
                {expandedRow === log.id && (
                  <tr className="bg-slate-50 border-b">
                    <td colSpan={5} className="p-0">
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 shadow-inner border-y border-slate-200">
                        {/* Old Value Box */}
                        <div>
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            Previous State
                          </h4>
                          {log.oldValue ? (
                            <pre className="bg-white p-3 rounded-md border border-gray-200 text-xs text-red-700 overflow-x-auto shadow-sm font-mono">
                              {JSON.stringify(parseJSON(log.oldValue), null, 2)}
                            </pre>
                          ) : (
                            <div className="bg-gray-100 p-3 rounded-md border text-xs text-gray-400 italic text-center">
                              No previous data (New Creation)
                            </div>
                          )}
                        </div>

                        {/* New Value Box */}
                        <div>
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            New State
                          </h4>
                          <pre className="bg-white p-3 rounded-md border border-green-200 text-xs text-green-800 overflow-x-auto shadow-sm font-mono">
                            {JSON.stringify(parseJSON(log.newValue), null, 2)}
                          </pre>
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
      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {total === 0 ? 0 : (page - 1) * pageSize + 1} -{" "}
          {Math.min(total, page * pageSize)} of {total}
        </div>
        <div className="flex items-center space-x-2">
          {/** First */}
          <button
            disabled={page <= 1}
            onClick={() => setPage(1)}
            className="px-2 py-1 bg-white border rounded disabled:opacity-50"
          >
            First
          </button>
          {/** Prev */}
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-2 py-1 bg-white border rounded disabled:opacity-50"
          >
            Prev
          </button>

          {/** Page numbers window */}
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
                    className={`px-2 py-1 border rounded ${p === page ? "bg-primary text-white" : "bg-white"}`}
                  >
                    {p}
                  </button>
                ))}
                {end < totalPages && <span className="px-2">...</span>}
              </div>
            );
          })()}

          {/** Next */}
          <button
            disabled={page * pageSize >= total}
            onClick={() => setPage((p) => p + 1)}
            className="px-2 py-1 bg-white border rounded disabled:opacity-50"
          >
            Next
          </button>
          {/** Last */}
          <button
            disabled={page * pageSize >= total}
            onClick={() => setPage(Math.max(1, Math.ceil(total / pageSize)))}
            className="px-2 py-1 bg-white border rounded disabled:opacity-50"
          >
            Last
          </button>

          {/** Jump to page */}
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min={1}
              max={Math.max(1, Math.ceil(total / pageSize))}
              placeholder="Go to"
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
              className="w-20 px-2 py-1 border rounded"
            />
            <button
              onClick={() => {
                const v = Number(jumpPage);
                const totalPages = Math.max(1, Math.ceil(total / pageSize));
                if (!isNaN(v) && v >= 1 && v <= totalPages) {
                  setPage(v);
                }
              }}
              className="px-3 py-1 bg-primary text-white rounded"
            >
              Go
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
