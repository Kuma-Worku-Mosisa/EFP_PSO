// filepath: frontend/src/pages/admin/AgenciesManagement.tsx
import { useState, useEffect } from "react";
import {
  Building2,
  Users,
  FileText,
  ShieldAlert,
  MapPin,
  Phone,
  Mail,
  Car,
  Monitor,
  Briefcase,
  Plus,
  AlertTriangle,
  Calendar,
  Shield,
  GraduationCap,
  Award,
  BookOpen,
  Clock,
  FileCheck,
  ArrowUpRight,
} from "lucide-react";

// --- TypeScript Interfaces ---

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bg: string;
}

interface IncidentPenaltyMock {
  id: number;
  penaltyType: string;
  amount: string;
  description: string;
  issuedDate: string;
}

interface IncidentReportMock {
  id: number;
  crimeCategory: string;
  incidentDate: string;
  locationOfIncident: string;
  incidentDescription: string;
  reportedAt: string;
  isReportedWithin24h: boolean;
  localPoliceStation: string;
  localPoliceRefNumber: string;
  federalPoliceStatus:
    | "Pending Review"
    | "Under Investigation"
    | "Penalized"
    | "Resolved";
  penalties: IncidentPenaltyMock[];
}

interface EmployeeMock {
  id: number;
  userId: number;
  organizationId: number;
  positionId?: number;
  addressId?: number;
  address?: AddressMock | null;
  fullName: string;
  email: string;
  positionName: string;
  gender: string;
  citizenship: string;
  age: number;
  educationLevel: string;
  workExpYears: number;
  totalExpYears?: number;
  isBlacklisted: boolean;
  employmentStatus: string;
  employmentStartDate: string;
}

interface AddressMock {
  id: number;
  houseNumber?: string;
  specialLocation?: string;
  kebeleId?: number;
  kebeleName?: string;
  woredaName?: string;
  zoneName?: string;
  regionName?: string;
}

interface GuardEducationStatMock {
  id: number;
  reportingDate: string;
  grade_3_9_male: number;
  grade_3_9_female: number;
  grade_10_12_male: number;
  grade_10_12_female: number;
  certificate_male: number;
  certificate_female: number;
  diploma_male: number;
  diploma_female: number;
  degree_male: number;
  degree_female: number;
  second_degree_male: number;
  second_degree_female: number;
}

interface TrainingDetailMock {
  id: number;
  trainingBodyName: string;
  trainingAddress: string;
  trainingStartDate: string;
  trainingEndDate: string;
  trainingDurationDays: number;
  totalTraineesMale: number;
  totalTraineesFemale: number;
  totalNotTraineesMale: number;
  totalNotTraineesFemale: number;
}

interface ServiceContractMock {
  id: number;
  serviceUserName: string;
  contractUrl: string;
  assignedPersonnelCount: number;
  addressText: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrganizationBranchMock {
  id: number;
  addressText: string;
}

// Added structure for Document Management System
interface DMSDocumentMock {
  id: string;
  documentName: string;
  documentNameAmharic?: string;
  type: "Basic" | "Yearly Renewed";
  referenceNumber: string;
  issuedDate: string;
  expiryDate?: string;
  status: "Active" | "Expiring Soon" | "Expired" | "Permanent";
  fileUrl: string;
}

interface OrganizationMock {
  nameEnglish: string;
  nameAmharic: string;
  tinNumber: string;
  status: string;
  email: string;
  phone: string;
  capitalAmount: string;
  numberOfOffices: number;
  numberOfVehicles: number;
  numberOfComputers: number;
  hasStoreHouse: boolean;
  incidents: IncidentReportMock[];
  employees: EmployeeMock[];
  educationStats: GuardEducationStatMock;
  trainingDetails: TrainingDetailMock[];
  serviceContracts: ServiceContractMock[];
  branches: OrganizationBranchMock[];
  dmsDocuments: DMSDocumentMock[]; // Integrated DMS array
}

interface AgenciesManagementProps {
  organizationId: string;
  onBack: () => void;
}

// Real data: helper to create defaults
const emptyEducationStats = (): GuardEducationStatMock => ({
  id: 0,
  reportingDate: new Date().toISOString().split("T")[0],
  grade_3_9_male: 0,
  grade_3_9_female: 0,
  grade_10_12_male: 0,
  grade_10_12_female: 0,
  certificate_male: 0,
  certificate_female: 0,
  diploma_male: 0,
  diploma_female: 0,
  degree_male: 0,
  degree_female: 0,
  second_degree_male: 0,
  second_degree_female: 0,
});

const defaultOrg = (): OrganizationMock => ({
  nameEnglish: "",
  nameAmharic: "",
  tinNumber: "",
  status: "",
  email: "",
  phone: "",
  capitalAmount: "0.00",
  numberOfOffices: 0,
  numberOfVehicles: 0,
  numberOfComputers: 0,
  hasStoreHouse: false,
  incidents: [],
  employees: [],
  educationStats: emptyEducationStats(),
  trainingDetails: [],
  serviceContracts: [],
  branches: [],
  dmsDocuments: [],
});

// --- Main Component (Named Export to prevent router import crashes) ---

export function AgenciesManagement({
  organizationId,
  onBack,
}: AgenciesManagementProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [selectedOrg, setSelectedOrg] = useState<OrganizationMock | null>(null);

  // Fetch detailed data for selected organization
  useEffect(() => {
    async function loadOrgDetails() {
      const orgId = Number(organizationId);
      if (Number.isNaN(orgId)) {
        console.error(
          "Invalid organization id passed to AgenciesManagement:",
          organizationId,
        );
        setSelectedOrg(defaultOrg());
        return;
      }

      try {
        const res = await fetch(`/api/organizations/${orgId}/details`);
        const data = await res.json();
        const details = data?.data ?? data?.payload ?? data;

        if (details && typeof details === "object") {
          setSelectedOrg({
            nameEnglish: details.nameEnglish ?? "",
            nameAmharic: details.nameAmharic ?? "",
            tinNumber: details.tinNumber ?? "",
            status: details.status ?? "",
            email: details.email ?? "",
            phone: details.phone ?? "",
            capitalAmount: details.capitalAmount
              ? String(details.capitalAmount)
              : "0.00",
            numberOfOffices: details.numberOfOffices ?? 0,
            numberOfVehicles: details.numberOfVehicles ?? 0,
            numberOfComputers: details.numberOfComputers ?? 0,
            hasStoreHouse: details.hasStoreHouse ?? false,
            incidents: details.incidents ?? [],
            employees: details.employees ?? [],
            educationStats: details.educationStats ?? emptyEducationStats(),
            trainingDetails: details.trainingDetails ?? [],
            serviceContracts: details.serviceContracts ?? [],
            branches: details.branches ?? [],
            dmsDocuments: details.dmsDocuments ?? [],
          });
        } else {
          setSelectedOrg(defaultOrg());
        }
      } catch (err) {
        console.error("Failed to load organization details:", err);
        setSelectedOrg(defaultOrg());
      }
    }

    loadOrgDetails();
  }, [organizationId]);

  const org = selectedOrg ?? defaultOrg();
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeMock | null>(
    null,
  );
  const [addressDetails, setAddressDetails] = useState<AddressMock | null>(
    null,
  );
  const [addressLoading, setAddressLoading] = useState(false);

  // Fetch address details when selectedEmployee changes
  useEffect(() => {
    if (!selectedEmployee) {
      setAddressDetails(null);
      setAddressLoading(false);
      return;
    }

    setAddressLoading(true);

    if (selectedEmployee.address) {
      setAddressDetails({
        id: selectedEmployee.address.id,
        houseNumber: selectedEmployee.address.houseNumber,
        specialLocation: selectedEmployee.address.specialLocation,
        kebeleId: selectedEmployee.address.kebeleId,
        kebeleName: selectedEmployee.address.kebeleName,
        woredaName: selectedEmployee.address.woredaName,
        zoneName: selectedEmployee.address.zoneName,
        regionName: selectedEmployee.address.regionName,
      });
    } else {
      setAddressDetails(null);
    }

    setAddressLoading(false);
  }, [selectedEmployee]);

  const openContract = (contractUrl?: string) => {
    if (!contractUrl) return;
    window.open(contractUrl, "_blank", "noopener,noreferrer");
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Resolved":
        return "bg-green-100 text-green-700 border-green-200";
      case "Under Investigation":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "Penalized":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getContractStatusBadge = (status?: string) => {
    const normalized = (status || "").toLowerCase();
    if (normalized.includes("active")) {
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    }
    if (normalized.includes("expire")) {
      return "bg-amber-50 text-amber-700 border border-amber-200";
    }
    if (
      normalized.includes("terminated") ||
      normalized.includes("revoked") ||
      normalized.includes("reject")
    ) {
      return "bg-red-50 text-red-700 border border-red-200";
    }
    if (normalized.includes("pending")) {
      return "bg-slate-50 text-slate-700 border border-slate-200";
    }
    return "bg-gray-50 text-gray-600 border border-gray-200";
  };

  const getDmsBadgeStyles = (status: string) => {
    switch (status) {
      case "Permanent":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Active":
        return "bg-green-50 text-green-700 border-green-200";
      case "Expiring Soon":
        return "bg-amber-50 text-amber-700 border-amber-200 animate-pulse";
      case "Expired":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const eduStatRows = [
    {
      label: "Grade 3-9",
      male: org.educationStats.grade_3_9_male,
      female: org.educationStats.grade_3_9_female,
    },
    {
      label: "Grade 10-12",
      male: org.educationStats.grade_10_12_male,
      female: org.educationStats.grade_10_12_female,
    },
    {
      label: "Vocational Certificate",
      male: org.educationStats.certificate_male,
      female: org.educationStats.certificate_female,
    },
    {
      label: "Advanced Diploma",
      male: org.educationStats.diploma_male,
      female: org.educationStats.diploma_female,
    },
    {
      label: "Bachelor's Degree",
      male: org.educationStats.degree_male,
      female: org.educationStats.degree_female,
    },
    {
      label: "Master's Degree (Second)",
      male: org.educationStats.second_degree_male,
      female: org.educationStats.second_degree_female,
    },
  ];

  const totalContractedPersonnel = org.serviceContracts.reduce(
    (acc, curr) => acc + (curr.assignedPersonnelCount || 0),
    0,
  );

  // DMS helper counts
  const basicDocs = org.dmsDocuments.filter((d) => d.type === "Basic");
  const yearlyDocs = org.dmsDocuments.filter(
    (d) => d.type === "Yearly Renewed",
  );
  const alertDocsCount = yearlyDocs.filter(
    (d) => d.status === "Expired" || d.status === "Expiring Soon",
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      {/* 1. Page Header Dashboard Context */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={onBack}
              className="text-sm font-semibold text-primary hover:text-primary/80"
            >
              ← Back to Organizations
            </button>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                <Building2 size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {org.nameEnglish}
                </h1>
                <h2
                  className="text-lg font-medium text-gray-500 mt-0.5"
                  style={{
                    fontFamily: "Nyala, Noto Sans Ethiopic, sans-serif",
                  }}
                >
                  {org.nameAmharic}
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <FileText size={16} /> TIN: {org.tinNumber}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Tab Navigation Bar (Now featuring DMS) */}
      <div className="bg-white border border-gray-200 border-b-0 rounded-t-xl px-6">
        <nav className="flex gap-6 overflow-x-auto">
          {[
            { id: "overview", label: "Overview", icon: Building2 },
            {
              id: "personnel",
              label: `HR & Personnel (${org.employees.length})`,
              icon: Users,
            },
            { id: "compliance", label: "Education Stats", icon: GraduationCap },
            {
              id: "training",
              label: `Training Details (${org.trainingDetails.length})`,
              icon: BookOpen,
            },
            {
              id: "contracts",
              label: `Service Contracts (${org.serviceContracts.length})`,
              icon: FileCheck,
            },
            {
              id: "dms",
              label: `DMS Vault (${org.dmsDocuments.length})`,
              icon: FileText,
            },
            {
              id: "operations",
              label: `Operations & Incidents (${org.incidents.length})`,
              icon: ShieldAlert,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600 font-bold"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 3. Tab Content Area */}
      <div className="space-y-6">
        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Capital (ETB)"
                value={org.capitalAmount}
                icon={Briefcase}
                color="text-emerald-600"
                bg="bg-emerald-50"
              />
              <StatCard
                title="Registered Vehicles"
                value={org.numberOfVehicles}
                icon={Car}
                color="text-blue-600"
                bg="bg-blue-50"
              />
              <StatCard
                title="Registered Computers"
                value={org.numberOfComputers}
                icon={Monitor}
                color="text-indigo-600"
                bg="bg-indigo-50"
              />
              <StatCard
                title="Number of Offices"
                value={org.numberOfOffices}
                icon={MapPin}
                color="text-orange-600"
                bg="bg-orange-50"
              />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                Contact & Infrastructure
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                <div>
                  <label className="text-sm text-gray-500">
                    Official Phone Number
                  </label>
                  <p className="font-medium text-gray-900 flex items-center gap-2 mt-1">
                    <Phone size={16} className="text-gray-400" /> {org.phone}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">
                    Official Email Address
                  </label>
                  <p className="font-medium text-gray-900 flex items-center gap-2 mt-1">
                    <Mail size={16} className="text-gray-400" /> {org.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">
                    Store House / Armory
                  </label>
                  <p className="font-medium text-gray-900 mt-1">
                    {org.hasStoreHouse
                      ? "Yes, Verified Secure Facility"
                      : "None Registered"}
                  </p>
                </div>
              </div>

              {org.branches.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h4 className="font-semibold text-gray-900 text-sm">
                      Branch Office Address{org.branches.length > 1 ? "es" : ""}
                    </h4>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {org.branches.length} branch
                      {org.branches.length > 1 ? "es" : ""}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {org.branches.map((branch) => (
                      <div key={branch.id} className="flex items-start gap-2">
                        <MapPin
                          size={16}
                          className="text-blue-500 mt-0.5 shrink-0"
                        />
                        <span className="text-sm leading-relaxed text-gray-700">
                          {branch.addressText}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "personnel" && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <span className="font-semibold text-sm text-gray-700">
                Active Operational Personnel Directory
              </span>
              <button className="px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-xs font-medium transition flex items-center gap-1">
                <Plus size={14} /> Register Employee
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100/75 border-b border-gray-200 text-gray-600 font-medium text-xs uppercase tracking-wider">
                    <th className="p-4">Employee ID / Name</th>
                    <th className="p-4">Assigned Position</th>
                    <th className="p-4">Demographics</th>
                    <th className="p-4">Experience</th>
                    <th className="p-4">Status & Clearances</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-700">
                  {org.employees.map((emp) => (
                    <tr
                      key={emp.id}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      <td className="p-4">
                        <div className="font-bold text-gray-900">
                          {emp.fullName}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {emp.email}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 font-medium text-gray-800">
                          <Shield size={16} className="text-blue-500" />
                          {emp.positionName}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          Started: {emp.employmentStartDate}
                        </div>
                      </td>
                      <td className="p-4 text-xs space-y-0.5">
                        <p>
                          <span className="text-gray-400">Gender/Age:</span>{" "}
                          {emp.gender}, {emp.age} yrs
                        </p>
                        <p>
                          <span className="text-gray-400">Citizenship:</span>{" "}
                          {emp.citizenship}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 font-medium text-gray-900">
                          <Award size={16} className="text-amber-500" />
                          <span>{emp.workExpYears} Years</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          Education: {emp.educationLevel}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1.5 items-start">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              emp.employmentStatus === "Active"
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {emp.employmentStatus}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedEmployee(emp)}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
                        >
                          Detail View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "compliance" && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100/50 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase tracking-wider">
                  <th className="p-4">Education Tier</th>
                  <th className="p-4 text-center">Male Count</th>
                  <th className="p-4 text-center">Female Count</th>
                  <th className="p-4 text-right">Sub-Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700">
                {eduStatRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-4 font-medium text-gray-900">
                      {row.label}
                    </td>
                    <td className="p-4 text-center text-blue-600 font-medium">
                      {row.male}
                    </td>
                    <td className="p-4 text-center text-pink-600 font-medium">
                      {row.female}
                    </td>
                    <td className="p-4 text-right font-bold text-gray-800">
                      {row.male + row.female}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "training" && (
          <div className="space-y-6">
            {org.trainingDetails.map((train) => {
              const totalEnrolled =
                train.totalTraineesMale + train.totalTraineesFemale;
              const totalFailedOrNot =
                train.totalNotTraineesMale + train.totalNotTraineesFemale;
              const globalCohortSize = totalEnrolled + totalFailedOrNot;

              return (
                <div
                  key={train.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                >
                  <div className="bg-gray-50 p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <BookOpen className="text-blue-600" size={22} />
                        <h3 className="text-lg font-bold text-gray-900">
                          {train.trainingBodyName}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin size={14} className="text-gray-400" />{" "}
                        {train.trainingAddress}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-600 bg-white px-3 py-1.5 rounded-lg border shadow-sm">
                      <Clock size={14} className="text-blue-500" />
                      <span>
                        Duration:{" "}
                        <strong className="text-gray-900">
                          {train.trainingDurationDays} Days
                        </strong>{" "}
                        ({train.trainingStartDate} to {train.trainingEndDate})
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
                        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                          Total Operational Cohort
                        </p>
                        <p className="text-2xl font-black text-blue-900 mt-1">
                          {globalCohortSize}{" "}
                          <span className="text-xs font-normal text-blue-500">
                            Personnel
                          </span>
                        </p>
                      </div>
                      <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl">
                        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                          Passed / Certified Trainees
                        </p>
                        <p className="text-2xl font-black text-emerald-900 mt-1">
                          {totalEnrolled}
                        </p>
                      </div>
                      <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl">
                        <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                          Uncertified / Not Trained
                        </p>
                        <p className="text-2xl font-black text-amber-900 mt-1">
                          {totalFailedOrNot}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "contracts" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                  <FileCheck size={24} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Active Service Contracts
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-0.5">
                    {org.serviceContracts.length} Corporate Clients
                  </p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Deployed Guard Strength
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-0.5">
                    {totalContractedPersonnel} Personnel
                  </p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                  <Building2 size={24} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Operational Utilization
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-0.5">
                    100% Active
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 bg-gray-50/70 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">
                    Active B2B Service Engagements
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Legal binding digital document entries verified by Federal
                    Police Registry.
                  </p>
                </div>
                <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 self-start sm:self-auto">
                  <Plus size={14} /> Append Contract
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100/50 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase tracking-wider">
                      <th className="p-4">Contract ID & Client Entity</th>
                      <th className="p-4">
                        Deployment Site Location (Address)
                      </th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Assigned Guards</th>
                      <th className="p-4">Audit Dates</th>
                      <th className="p-4 text-right">Legal Documents</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-700">
                    {org.serviceContracts.map((contract) => (
                      <tr
                        key={contract.id}
                        className="hover:bg-gray-50/40 transition-colors"
                      >
                        <td className="p-4">
                          <div className="font-bold text-gray-900">
                            {contract.serviceUserName}
                          </div>
                          <div className="text-xs text-gray-400 mt-1 font-mono flex items-center gap-1">
                            <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 text-[10px]">
                              CID-{contract.id}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-start gap-1 text-xs text-gray-600 max-w-xs leading-relaxed">
                            <MapPin
                              size={14}
                              className="text-gray-400 shrink-0 mt-0.5"
                            />
                            <span>{contract.addressText}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center justify-center text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 ${getContractStatusBadge(contract.status)}`}
                          >
                            {contract.status ?? "Unknown"}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center justify-center font-bold text-sm text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-lg min-w-[50px]">
                            {contract.assignedPersonnelCount}
                          </span>
                        </td>
                        <td className="p-4 text-xs space-y-1 text-gray-500">
                          <p>
                            <span className="text-gray-400 font-medium">
                              Logged:
                            </span>{" "}
                            {contract.createdAt}
                          </p>
                          <p>
                            <span className="text-gray-400 font-medium">
                              Updated:
                            </span>{" "}
                            {contract.updatedAt}
                          </p>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            type="button"
                            onClick={() => openContract(contract.contractUrl)}
                            className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold bg-blue-50/40 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition"
                          >
                            <span>Review Contract</span>
                            <ArrowUpRight size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. DMS (Document Management System) Tab Panel Implementation */}
        {activeTab === "dms" && (
          <div className="space-y-6">
            {/* Top Info Cards specific to Document Control */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                  <FileText size={24} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Basic Records
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-0.5">
                    {basicDocs.length} Permanent
                  </p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Yearly Managed
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-0.5">
                    {yearlyDocs.length} Annual Cycles
                  </p>
                </div>
              </div>
              <div
                className={`p-5 rounded-xl border shadow-sm flex items-center gap-4 ${alertDocsCount > 0 ? "bg-red-50/40 border-red-200" : "bg-white border-gray-200"}`}
              >
                <div
                  className={`p-3 rounded-lg shrink-0 ${alertDocsCount > 0 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}
                >
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Action Required
                  </p>
                  <p
                    className={`text-2xl font-bold mt-0.5 ${alertDocsCount > 0 ? "text-red-700" : "text-gray-900"}`}
                  >
                    {alertDocsCount} Alerts
                  </p>
                </div>
              </div>
            </div>

            {/* Split Grid for Developer-Preferred Structured DMS File System */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Box A: Basic Foundational Items */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="p-4 bg-gray-50/70 border-b border-gray-200 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">
                        Basic / Statutory Credentials
                      </h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Permanent organizational foundational registry
                        documents.
                      </p>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-medium">
                      Immutable
                    </span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {basicDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-4 hover:bg-gray-50/30 transition flex flex-col sm:flex-row justify-between sm:items-center gap-2"
                      >
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {doc.documentName}
                          </p>
                          {doc.documentNameAmharic && (
                            <p
                              className="text-xs text-gray-400 mt-0.5 font-medium"
                              style={{ fontFamily: "Nyala, sans-serif" }}
                            >
                              {doc.documentNameAmharic}
                            </p>
                          )}
                          <p className="text-[11px] text-gray-500 mt-1">
                            Ref:{" "}
                            <span className="font-mono text-gray-700 font-medium">
                              {doc.referenceNumber}
                            </span>{" "}
                            • Filed: {doc.issuedDate}
                          </p>
                        </div>
                        <div className="flex sm:flex-col items-start sm:items-end justify-between gap-1.5 shrink-0">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold border rounded ${getDmsBadgeStyles(doc.status)}`}
                          >
                            {doc.status}
                          </span>
                          <a
                            href={doc.fileUrl}
                            className="text-xs text-blue-600 font-medium inline-flex items-center gap-0.5 hover:underline"
                          >
                            <span>Open</span> <ArrowUpRight size={12} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-3 bg-gray-50/30 border-t text-right">
                  <button className="text-xs bg-white border text-gray-700 font-medium py-1 px-2.5 rounded-md hover:bg-gray-50 transition">
                    Upload Base Doc
                  </button>
                </div>
              </div>

              {/* Box B: Yearly Renewed Items */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="p-4 bg-gray-50/70 border-b border-gray-200 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">
                        Yearly Renewed Documents
                      </h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Time-bound certifications subject to cyclical statutory
                        renewal checks.
                      </p>
                    </div>
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-mono font-medium">
                      Annual Audit
                    </span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {yearlyDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-4 hover:bg-gray-50/30 transition flex flex-col sm:flex-row justify-between sm:items-center gap-2"
                      >
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {doc.documentName}
                          </p>
                          {doc.documentNameAmharic && (
                            <p
                              className="text-xs text-gray-400 mt-0.5 font-medium"
                              style={{ fontFamily: "Nyala, sans-serif" }}
                            >
                              {doc.documentNameAmharic}
                            </p>
                          )}
                          <p className="text-[11px] text-gray-500 mt-1">
                            Ref:{" "}
                            <span className="font-mono text-gray-700 font-medium">
                              {doc.referenceNumber}
                            </span>{" "}
                            • Expiry:{" "}
                            <span
                              className={`font-semibold ${doc.status === "Expired" ? "text-red-600" : doc.status === "Expiring Soon" ? "text-amber-600" : "text-gray-700"}`}
                            >
                              {doc.expiryDate}
                            </span>
                          </p>
                        </div>
                        <div className="flex sm:flex-col items-start sm:items-end justify-between gap-1.5 shrink-0">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold border rounded ${getDmsBadgeStyles(doc.status)}`}
                          >
                            {doc.status}
                          </span>
                          <a
                            href={doc.fileUrl}
                            className="text-xs text-blue-600 font-medium inline-flex items-center gap-0.5 hover:underline"
                          >
                            <span>Update File</span> <ArrowUpRight size={12} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-3 bg-gray-50/30 border-t text-right">
                  <button className="text-xs bg-blue-600 text-white font-medium py-1 px-2.5 rounded-md hover:bg-blue-700 transition flex items-center gap-1 inline-flex ml-auto">
                    <Plus size={12} /> File Renewal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="relative w-full max-w-3xl overflow-hidden rounded-[32px] bg-white shadow-2xl ring-1 ring-slate-200">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-slate-50 px-6 py-5">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Personnel Details
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Detailed employee profile for {selectedEmployee.fullName}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEmployee(null)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-600 transition hover:bg-slate-100"
                  aria-label="Close detail modal"
                >
                  ✕
                </button>
              </div>
              <div className="grid gap-6 p-6 sm:grid-cols-2">
                <div className="space-y-4 rounded-3xl bg-slate-50 p-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Identity
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      <span className="font-semibold">Employee ID:</span>{" "}
                      {selectedEmployee.id}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      <span className="font-semibold">User ID:</span>{" "}
                      {selectedEmployee.userId}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      <span className="font-semibold">Organization ID:</span>{" "}
                      {selectedEmployee.organizationId}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Contact & Role
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      <span className="font-semibold">Email:</span>{" "}
                      {selectedEmployee.email}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      <span className="font-semibold">Position:</span>{" "}
                      {selectedEmployee.positionName || "Unassigned"}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      <span className="font-semibold">Position ID:</span>{" "}
                      {selectedEmployee.positionId ?? "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Employment
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      <span className="font-semibold">Status:</span>{" "}
                      {selectedEmployee.employmentStatus || "Unknown"}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      <span className="font-semibold">Started:</span>{" "}
                      {selectedEmployee.employmentStartDate ?? "—"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 rounded-3xl bg-slate-50 p-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Personal Profile
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      <span className="font-semibold">Full Name:</span>{" "}
                      {selectedEmployee.fullName}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      <span className="font-semibold">Gender:</span>{" "}
                      {selectedEmployee.gender || "Unknown"}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      <span className="font-semibold">Citizenship:</span>{" "}
                      {selectedEmployee.citizenship || "Unknown"}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      <span className="font-semibold">Age:</span>{" "}
                      {selectedEmployee.age ?? "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Experience
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      <span className="font-semibold">Work Experience:</span>{" "}
                      {selectedEmployee.workExpYears} years
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      <span className="font-semibold">Total Experience:</span>{" "}
                      {selectedEmployee.totalExpYears ??
                        selectedEmployee.workExpYears}{" "}
                      years
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      <span className="font-semibold">Education:</span>{" "}
                      {selectedEmployee.educationLevel || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Risk & Location
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      <span className="font-semibold">Blacklisted:</span>{" "}
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${
                          selectedEmployee.isBlacklisted
                            ? "bg-red-100 text-red-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {selectedEmployee.isBlacklisted ? "Yes" : "No"}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      <span className="font-semibold">Address ID:</span>{" "}
                      {selectedEmployee.addressId ?? "N/A"}
                    </p>
                  </div>
                  {selectedEmployee.addressId && (
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        Address Details
                      </p>
                      {addressLoading ? (
                        <p className="mt-2 text-sm text-slate-600 italic">
                          Loading address details...
                        </p>
                      ) : addressDetails ? (
                        <div className="mt-2 space-y-1">
                          {addressDetails.regionName && (
                            <p className="text-sm text-slate-700">
                              <span className="font-semibold">Region:</span>{" "}
                              {addressDetails.regionName}
                            </p>
                          )}
                          {addressDetails.zoneName && (
                            <p className="text-sm text-slate-700">
                              <span className="font-semibold">
                                Subcity/Zone:
                              </span>{" "}
                              {addressDetails.zoneName}
                            </p>
                          )}
                          {addressDetails.woredaName && (
                            <p className="text-sm text-slate-700">
                              <span className="font-semibold">Weroda:</span>{" "}
                              {addressDetails.woredaName}
                            </p>
                          )}
                          {addressDetails.kebeleName && (
                            <p className="text-sm text-slate-700">
                              <span className="font-semibold">Kebele:</span>{" "}
                              {addressDetails.kebeleName}
                            </p>
                          )}
                          {addressDetails.houseNumber && (
                            <p className="text-sm text-slate-700">
                              <span className="font-semibold">
                                House Number:
                              </span>{" "}
                              {addressDetails.houseNumber}
                            </p>
                          )}
                          {addressDetails.specialLocation && (
                            <p className="text-sm text-slate-700">
                              <span className="font-semibold">
                                Special Location:
                              </span>{" "}
                              {addressDetails.specialLocation}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-slate-500 italic">
                          No address details found
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setSelectedEmployee(null)}
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "operations" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 text-gray-700 font-medium">
                <AlertTriangle className="text-red-500" size={20} />
                <span>Logged Incident Misconduct Case Reports</span>
              </div>
            </div>

            {org.incidents.map((incident) => (
              <div
                key={incident.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
              >
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h4 className="text-base font-bold text-gray-900">
                    {incident.crimeCategory}
                  </h4>
                  <span
                    className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusStyles(incident.federalPoliceStatus)}`}
                  >
                    {incident.federalPoliceStatus}
                  </span>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {incident.incidentDescription}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Reusable Metric Card Sub-Component ---

function StatCard({ title, value, icon: Icon, color, bg }: StatCardProps) {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-lg ${bg} ${color} shrink-0`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
        <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// Fixed build safety target redundancy fallback export mapping rules:
export default AgenciesManagement;
