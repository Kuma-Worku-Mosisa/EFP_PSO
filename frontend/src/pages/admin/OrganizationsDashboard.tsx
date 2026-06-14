// filepath: frontend/src/pages/admin/OrganizationsDashboard.tsx
import { useState, useEffect } from "react";
import {
  Building2,
  Search,
  SlidersHorizontal,
  Plus,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  FileSignature,
  Network,
  Calendar,
  DollarSign,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AgenciesManagement from "./AgenciesManagement";
import type { ComponentType } from "react";
import { apiRequest, ApiError } from "../../lib/api";

interface Organization {
  id: number; // Int @id
  nameAmharic: string; // NVarChar(255)
  nameEnglish: string; // VarChar(255)
  tradeName?: string 
  email: string;
  phone: string;
  capitalAmount?: number | null; // db.Decimal(18, 2)
  status: string; // db.VarChar(50)
  createdAt: string; // db.DateTime

  // Dynamic Aggregate Relations Count Matrix (Prisma _count mappings)
  totalBranches: number; // mapping from branches relations count
  totalEmployees: number; // mapping from employees relations count
  totalServiceContracts: number; // mapping from serviceContracts relations count

  // Organization branding & identity
  logoUrl?: string | null; // mapping from organization_documents logo URL
}

export default function OrganizationDashboard() {
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedLogoUrl, setSelectedLogoUrl] = useState<string | null>(null);
  const [editingOrgId, setEditingOrgId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState<string>("Pending");
  const [editCreatedAt, setEditCreatedAt] = useState<string>("");

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Ensure the imported component is recognized with expected props
  const AgenciesManagementComponent = AgenciesManagement as ComponentType<{
    organizationId: string;
    onBack: () => void;
  }>;

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const resp = await apiRequest<{
          success: boolean;
          message?: string;
          data?: Organization[];
        }>("/organizations");
        if (!mounted) return;
        const data = resp?.data ?? null;
        if (Array.isArray(data) && data.length > 0) {
          setOrganizations(data as Organization[]);
        } else {
          // No organizations returned: show empty state (no fallback mock)
          setOrganizations([]);
        }
      } catch (err) {
        if (!mounted) return;
        setOrganizations([]);
        // Clean and user-friendly error messages
        const raw = err instanceof Error ? err.message : String(err);
        // If server returned HTML (e.g., Express 404 page), strip tags and summarize
        const isHtml = /<\/?html|<!DOCTYPE/i.test(raw);
        let message = raw;
        if (isHtml) {
          // extract 'Cannot GET /api/organizations' if present
          const match = raw.match(/Cannot GET \s*([^<\s]+)/i);
          if (match && match[0]) {
            message = `Endpoint not found: ${match[1]}`;
          } else {
            // fallback: remove tags and trim
            message = raw
              .replace(/<[^>]*>/g, "")
              .trim()
              .slice(0, 200);
          }
        }
        if (err instanceof ApiError) {
          setError(message || `API error ${err.statusCode}`);
        } else {
          setError(message);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Normalize various DB status strings into UI keys/labels/styles
  function normalizeStatus(s?: string) {
    if (!s)
      return {
        key: "unknown",
        label: "Unknown",
        style: "bg-gray-50 text-gray-700 border border-gray-100",
      } as const;
    const v = s.toLowerCase();
    if (v.includes("suspend"))
      return {
        key: "suspended",
        label: "Suspended",
        style: "bg-purple-50 text-purple-700 border border-purple-100",
      } as const;
    if (v.includes("review"))
      return {
        key: "under_review",
        label: "Under Review",
        style: "bg-sky-50 text-sky-700 border border-sky-100",
      } as const;
    if (v.includes("approve") || v.includes("active"))
      return {
        key: "active",
        label: "Active",
        style: "bg-green-50 text-green-700 border border-green-100",
      } as const;
    if (v.includes("pending"))
      return {
        key: "pending",
        label: "Pending",
        style: "bg-amber-50 text-amber-700 border border-amber-100",
      } as const;
    if (v.includes("reject") || v.includes("revock") || v.includes("revoked"))
      return {
        key: "revocked",
        label: "Revocked",
        style: "bg-red-50 text-red-700 border border-red-100",
      } as const;
    return {
      key: "other",
      label: s,
      style: "bg-gray-50 text-gray-700 border border-gray-100",
    } as const;
  }

  // Client-side search optimization targeting localization parameters
  const filteredOrganizations = organizations.filter((org) => {
    const matchesSearch =
      org.nameEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.nameAmharic.includes(searchQuery);

    const matchesStatus =
      statusFilter === "ALL" ||
      normalizeStatus(org.status).label === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalOrgs = organizations.length;
  const activeOrgs = organizations.filter(
    (o) => normalizeStatus(o.status).key === "active",
  ).length;
  const pendingOrgs = organizations.filter(
    (o) => normalizeStatus(o.status).key === "pending",
  ).length;

  const renderOrgLogo = (name: string, id: number, logoUrl?: string | null) => {
    // If logo URL is available, render the clickable image
    if (logoUrl) {
      return (
        <button
          onClick={() => setSelectedLogoUrl(logoUrl)}
          className="h-10 w-10 rounded-xl overflow-hidden shadow-sm ring-2 ring-white flex items-center justify-center bg-gray-100 hover:ring-4 hover:ring-primary transition-all duration-200 cursor-pointer"
          title="Click to view logo"
        >
          <img
            src={logoUrl}
            alt={name}
            className="h-full w-full object-cover"
            onError={(e) => {
              // Fallback to initials if image fails to load
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </button>
      );
    }

    // Fallback to initials badge
    const themes = [
      "from-blue-600 to-indigo-700 text-blue-100",
      "from-slate-700 to-slate-900 text-slate-100",
      "from-emerald-600 to-teal-700 text-emerald-100",
      "from-amber-600 to-orange-700 text-amber-100",
    ];
    const selectTheme = themes[id % themes.length];
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    return (
      <div
        className={`h-10 w-10 rounded-xl bg-gradient-to-br ${selectTheme} flex items-center justify-center font-bold font-mono text-xs tracking-wider shadow-sm ring-2 ring-white`}
      >
        {initials}
      </div>
    );
  };

  const openEditModal = (org: Organization) => {
    setEditingOrgId(org.id);
    setEditStatus(normalizeStatus(org.status).label ?? "Pending");
    // convert ISO to local datetime-local input value
    try {
      const d = new Date(org.createdAt);
      const tzOffset = d.getTimezoneOffset() * 60000;
      const localISO = new Date(d.getTime() - tzOffset)
        .toISOString()
        .slice(0, 16);
      setEditCreatedAt(localISO);
    } catch {
      setEditCreatedAt("");
    }
  };

  const closeEditModal = () => {
    setEditingOrgId(null);
    setEditStatus("Pending");
    setEditCreatedAt("");
  };

  const submitUpdate = async () => {
    if (!editingOrgId) return;
    try {
      const payload: any = { status: editStatus };
      if (editCreatedAt) {
        // convert local datetime-local back to ISO
        const iso = new Date(editCreatedAt).toISOString();
        payload.createdAt = iso;
      }
      const resp = await apiRequest<{
        success: boolean;
        message?: string;
        data?: any;
      }>(`/organizations/${editingOrgId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      if (resp?.data) {
        setOrganizations((prev) =>
          prev.map((o) =>
            o.id === editingOrgId
              ? {
                  ...o,
                  status: resp.data.status,
                  createdAt: resp.data.createdAt,
                }
              : o,
          ),
        );
      }
      closeEditModal();
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      setError(raw);
    }
  };

  if (selectedOrgId) {
    return (
      <AgenciesManagementComponent
        organizationId={String(selectedOrgId)}
        onBack={() => setSelectedOrgId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {loading && (
        <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 rounded">
          Loading organizations...
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border-l-4 border-red-400 text-red-700 rounded">
          Could not load organizations: {error}
        </div>
      )}
      {/* Structural Header Ribbon */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2">
        <div>
          <h2 className="text-2xl font-black text-primary uppercase tracking-tight">
            Organization Registry
          </h2>
          <p className="text-xs text-gray-400 font-medium mt-1">
            Audit licensed enterprise records, operational branch scope,
            deployment workforce sizes, and legal authorization signatures.
          </p>
        </div>
        <div>
          <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-black text-white uppercase tracking-wider shadow-sm hover:bg-opacity-90 transition-all duration-200 active:scale-95">
            <Plus className="h-4 w-4" />
            Register Enterprise
          </button>
        </div>
      </div>

      {/* Aggregate Analytical Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "Total Legal Entities",
            value: totalOrgs,
            icon: <Building2 className="w-5 h-5 text-blue-600" />,
            color: "bg-blue-50/60",
          },
          {
            label: "Authorized Nodes",
            value: activeOrgs,
            icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
            color: "bg-emerald-50/60",
          },
          {
            label: "Awaiting Clearance",
            value: pendingOrgs,
            icon: <Clock className="w-5 h-5 text-amber-500" />,
            color: "bg-amber-50/60",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm"
          >
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                {stat.label}
              </p>
              <p className="text-3xl font-black text-primary tracking-tight mt-1">
                {stat.value}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${stat.color}`}>{stat.icon}</div>
          </div>
        ))}
      </div>

      {/* Control Filters Layer */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by corporate name or አማርኛ መስሪያ ቤት..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-gray-100 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium text-slate-700"
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-gray-400 hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-bold rounded-xl border border-gray-100 bg-gray-50/50 py-2.5 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-primary transition-all text-slate-600 cursor-pointer"
          >
            <option value="ALL">All Classifications</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending Clearance</option>
            <option value="Under Review">Under Review</option>
            <option value="Revocked">Revocked</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Corporate High-Density Table System */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-[10px] font-black text-gray-400 tracking-widest uppercase">
                <th className="px-6 py-4 text-center w-12">Logo</th>
                <th className="px-6 py-4">Organization Name</th>
                <th className="px-6 py-4">Trade Name</th>
                <th className="px-6 py-4">Branch Network</th>
                <th className="px-6 py-4">Total Workforce</th>
                <th className="px-6 py-4">Service Contracts</th>
                <th className="px-6 py-4">Capital Strength</th>
                <th className="px-6 py-4">Registered Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm font-medium text-slate-700">
              <AnimatePresence mode="popLayout">
                {filteredOrganizations.map((org) => (
                  <motion.tr
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={org.id}
                    className="hover:bg-gray-50/40 transition-colors group"
                  >
                    {/* Identity Logo */}
                    <td className="px-6 py-4 text-center align-middle">
                      {renderOrgLogo(org.nameEnglish, org.id, org.logoUrl)}
                    </td>

                    {/* Corporate Entity Names */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-primary group-hover:text-secondary transition-colors duration-150">
                          {org.nameEnglish}
                        </span>
                        <span className="text-xs text-gray-400 font-medium mt-0.5 tracking-normal">
                          {org.nameAmharic}
                        </span>
                      </div>
                    </td>

                    {/* Trade Names */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-primary group-hover:text-secondary transition-colors duration-150">
                          {org.tradeName || "----"}
                        </span>
                      </div>
                    </td>

                    {/* Column Add: Number of Address Branches */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500">
                          <Network className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">
                            {org.totalBranches}
                          </span>
                          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                            Bureaus
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Column Add: Total Employee Force */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                          <Users className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">
                            {org.totalEmployees.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                            Personnel
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Column Add: Total Service Contract (Client) */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                          <FileSignature className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">
                            {org.totalServiceContracts}
                          </span>
                          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                            Active Clients
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Capital Strength Metric */}
                    <td className="px-6 py-4 font-mono text-xxs font-bold text-slate-700">
                      <div className="flex items-center text-primary">
                        {org.capitalAmount
                          ? org.capitalAmount.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            })
                          : "0.00"}
                        <span className=" text-xxs text-gray-400 font-sans font-medium ml-1">
                          .ETB
                        </span>
                      </div>
                    </td>

                    {/* Column Add: Created At Timestamp */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        <span>
                          {new Date(org.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </td>

                    {/* Prisma Status State Mapping */}
                    <td className="px-6 py-4">
                      {(() => {
                        const s = normalizeStatus(org.status);
                        return (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${s.style}`}
                          >
                            {s.key === "active" ? (
                              <>
                                <span className="h-1 w-1 rounded-full bg-green-500 animate-pulse" />
                                {s.label}
                              </>
                            ) : s.key === "pending" ? (
                              <>
                                <span className="h-1 w-1 rounded-full bg-amber-400" />
                                {s.label}
                              </>
                            ) : s.key === "revocked" ? (
                              <>
                                <XCircle className="h-3 w-3" />
                                {s.label}
                              </>
                            ) : s.key === "under_review" ? (
                              <>
                                <Clock className="h-3 w-3" />
                                {s.label}
                              </>
                            ) : (
                              <>{s.label}</>
                            )}
                          </span>
                        );
                      })()}
                    </td>

                    {/* Actions Trigger Block */}
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedOrgId(org.id)}
                        className="inline-flex items-center gap-1.5 text-[10px] font-black text-secondary hover:text-primary uppercase tracking-widest transition-colors cursor-pointer group/btn px-3 py-1 rounded-lg border border-gray-100 bg-white"
                      >
                        Agencies
                        <ArrowRight className="h-3 w-3 transition-transform duration-150 group-hover/btn:translate-x-0.5" />
                      </button>

                      <button
                        onClick={() => openEditModal(org)}
                        className="inline-flex items-center gap-1 text-[10px] font-black text-white bg-primary px-3 py-1 rounded-lg uppercase tracking-wider hover:bg-opacity-90 transition-all"
                      >
                        Update
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          {/* Missing State Overlay */}
          {filteredOrganizations.length === 0 && (
            <div className="p-16 text-center space-y-3">
              <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto border border-gray-100">
                <Building2 className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-sm font-bold text-gray-400">
                No organization matches found across regional branches.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Logo Viewer Modal */}
      <AnimatePresence>
        {selectedLogoUrl && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLogoUrl(null)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-primary to-secondary p-4 flex items-center justify-between">
                  <h3 className="text-white font-black uppercase tracking-wider text-sm">
                    Organization Logo
                  </h3>
                  <button
                    onClick={() => setSelectedLogoUrl(null)}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                    title="Close modal"
                  >
                    <X className="h-5 w-5 text-white" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 flex items-center justify-center bg-gray-50">
                  <img
                    src={selectedLogoUrl}
                    alt="Organization Logo"
                    className="max-w-xs max-h-80 object-contain rounded-lg shadow-md"
                  />
                </div>

                {/* Modal Footer */}
                <div className="p-4 bg-gray-100 flex justify-end">
                  <button
                    onClick={() => setSelectedLogoUrl(null)}
                    className="px-4 py-2 bg-primary text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-opacity-90 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Organization Modal */}
      <AnimatePresence>
        {editingOrgId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeEditModal}
              className="fixed inset-0 bg-black/40 z-40"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
                <div className="p-4 flex items-center justify-between border-b">
                  <h3 className="font-black uppercase tracking-wider text-sm">
                    Edit Organization
                  </h3>
                  <button
                    onClick={closeEditModal}
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">
                      Status
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full rounded-lg border p-2 text-sm"
                    >
                      <option>Active</option>
                      <option>Pending</option>
                      <option>Under Review</option>
                      <option>Revocked</option>
                      <option>Suspended</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">
                      Registered Date
                    </label>
                    <input
                      type="datetime-local"
                      value={editCreatedAt}
                      onChange={(e) => setEditCreatedAt(e.target.value)}
                      className="w-full rounded-lg border p-2 text-sm"
                    />
                  </div>
                </div>

                <div className="p-4 bg-gray-50 flex justify-end gap-2">
                  <button
                    onClick={closeEditModal}
                    className="px-4 py-2 rounded-lg border"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitUpdate}
                    className="px-4 py-2 rounded-lg bg-primary text-white font-bold"
                  >
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
