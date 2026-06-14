import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Shield,
  CheckCircle,
  Clock,
  Download,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";

interface Employee {
  id: number;
  user?: {
    fullName: string;
    faydaId?: string;
  };
  fullName: string;
  positionId?: number;
  position?: {
    name: string;
  };
  employmentStatus?: string;
  employmentStartDate?: string;
}

export const PersonnelManagement = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError(null);

        // Debug: Current user info
        console.log("[PersonnelManagement] Current user:", {
          id: user?.id,
          fullName: user?.fullName,
          roles: user?.roles,
        });

        if (!user?.id) {
          console.warn("[PersonnelManagement] User not authenticated");
          setError("User authentication required");
          setLoading(false);
          setEmployees([]);
          return;
        }

        // STEP 1: Fetch current user's Employee record to get organizationId
        // This endpoint should return the Employee record with the organization
        console.log(
          "[PersonnelManagement] Fetching user's organization via employee record...",
        );
        const employeeResponse = await apiRequest<{
          success: boolean;
          data?: any;
        }>(`/employees/my-organization`);

        const userOrgData = employeeResponse?.data;
        console.log("[PersonnelManagement] User org response:", userOrgData);

        if (!userOrgData || !userOrgData.organizationId) {
          console.error(
            "[PersonnelManagement] Cannot determine user's organization. Response:",
            userOrgData,
          );
          setError(
            "Organization assignment not found. Please ensure your employee record is created and linked to an organization.",
          );
          setEmployees([]);
          setLoading(false);
          return;
        }

        const organizationId = userOrgData.organizationId;
        console.log(
          "[PersonnelManagement] User organization ID:",
          organizationId,
        );

        // STEP 2: Fetch organization with all employees
        console.log("[PersonnelManagement] Fetching organization details...");
        const orgResponse = await apiRequest<{
          success: boolean;
          data?: any;
        }>(`/organizations/${organizationId}`);

        const orgData = orgResponse?.data;
        console.log(
          "[PersonnelManagement] Organization:",
          orgData?.nameEnglish,
          "Employees count:",
          orgData?.employees?.length || 0,
        );

        if (!orgData) {
          setError("Failed to fetch organization details");
          setEmployees([]);
          setLoading(false);
          return;
        }

        // STEP 3: Format employees for display
        if (orgData && Array.isArray(orgData.employees)) {
          const formattedEmployees = orgData.employees.map((emp: any) => ({
            id: emp.id,
            fullName: emp.user?.fullName || emp.fullName || "Unknown",
            faydaId: emp.user?.faydaId || "N/A",
            positionName:
              emp.position?.name || emp.positionName || "Unassigned",
            employmentStatus: emp.employmentStatus || "Unknown",
            employmentStartDate: emp.employmentStartDate,
          }));
          setEmployees(formattedEmployees);
          console.log(
            "[PersonnelManagement] Successfully loaded",
            formattedEmployees.length,
            "employees",
          );
        } else {
          console.warn(
            "[PersonnelManagement] No employees found in organization",
          );
          setEmployees([]);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load employees";
        console.error("[PersonnelManagement] Error:", message, err);
        setError(`Failed to load employees: ${message}`);
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [user?.id]);

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.faydaId.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalStaff = employees.length;
  const activeStaff = employees.filter(
    (emp) => emp.employmentStatus?.toLowerCase() === "active",
  ).length;
  const pendingVerification = employees.filter(
    (emp) =>
      emp.employmentStatus?.toLowerCase() === "pending" ||
      !emp.employmentStatus,
  ).length;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
    }).format(date);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-primary">
            Personnel Management
          </h2>
          <p className="text-sm text-gray-500">
            Manage your security staff, training records, and Fayda ID
            verification.
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-6 py-3 bg-white border rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all">
            <Download className="w-5 h-5" />
            <span>Export HRMS</span>
          </button>
          <button className="flex items-center space-x-2 px-6 py-3 blue-gradient text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">
            <UserPlus className="w-5 h-5" />
            <span>Add Personnel</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "Total Staff",
            value: totalStaff.toString(),
            icon: <Users className="text-primary" />,
            color: "bg-blue-50",
          },
          {
            label: "Active Duty",
            value: activeStaff.toString(),
            icon: <CheckCircle className="text-green-500" />,
            color: "bg-green-50",
          },
          {
            label: "Pending Verification",
            value: pendingVerification.toString(),
            icon: <Clock className="text-amber-500" />,
            color: "bg-amber-50",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4"
          >
            <div className={`p-4 rounded-xl ${stat.color}`}>{stat.icon}</div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <p className="text-xl font-bold text-primary">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-3xl border border-red-100 bg-red-50 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-700">Error loading employees</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="rounded-3xl border border-gray-100 bg-white p-8 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-gray-500">Loading employee data...</p>
        </div>
      )}

      {/* Search & Filter */}
      {!loading && (
        <>
          <div className="flex gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or Fayda ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button className="p-4 bg-white border rounded-2xl text-gray-500 hover:bg-gray-50 transition-all">
              <Filter className="w-6 h-6" />
            </button>
          </div>

          {/* Staff Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {filteredEmployees.length === 0 ? (
              <div className="px-8 py-12 text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No employees found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-8 py-6 font-bold">Name</th>
                      <th className="px-8 py-6 font-bold">Position</th>
                      <th className="px-8 py-6 font-bold">Fayda ID</th>
                      <th className="px-8 py-6 font-bold">Joined</th>
                      <th className="px-8 py-6 font-bold">Status</th>
                      <th className="px-8 py-6 font-bold text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredEmployees.map((person) => (
                      <tr
                        key={person.id}
                        className="hover:bg-gray-50 transition-colors group"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-primary font-bold border-2 border-white shadow-sm">
                              {person.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .substring(0, 2)}
                            </div>
                            <span className="font-bold text-primary text-sm">
                              {person.fullName}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-sm text-gray-600">
                          {person.positionName}
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-xs font-mono font-bold text-gray-400">
                            {person.faydaId}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-sm text-gray-600">
                          {formatDate(person.employmentStartDate)}
                        </td>
                        <td className="px-8 py-6">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              person.employmentStatus?.toLowerCase() ===
                              "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {person.employmentStatus || "Unknown"}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              className="p-2 hover:bg-primary/5 text-primary rounded-lg transition-colors"
                              title="View Profile"
                            >
                              <Shield className="w-5 h-5" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 text-gray-400 rounded-lg transition-colors">
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
