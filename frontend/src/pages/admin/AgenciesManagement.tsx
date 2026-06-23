// filepath: frontend/src/pages/admin/AgenciesManagement.tsx
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
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
  GraduationCap,
  BookOpen,
  FileCheck,
  ArrowUpRight,
  Eye,
  X,
  Trash2,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  UserPlus,
  User,
  Clock,
  Shield,
  Search,
  SlidersHorizontal,
  Upload,
} from "lucide-react";
import DocumentPreviewer from "../../components/DocumentPreviewer";
import { AutoDismissToast, ToastType } from "../../components/AutoDismissToast";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../lib/api";



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

interface EmployeeDocumentMock {
  id: number;
  documentType: string;
  fileUrl: string;
  isVerified: boolean;
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
  phone?: string;
  faydaId?: string;
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
  documents?: EmployeeDocumentMock[];
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
  isVerified?: boolean;
}

interface OrganizationMock {
  nameEnglish: string;
  nameAmharic: string;
  tinNumber: string;
  status: string;
  email: string;
  fax: string;
  phone: string;
  headOfficeAddress: string;
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
  fax: "",
  phone: "",
  headOfficeAddress: "",
  capitalAmount: "0.00",
  numberOfOffices: 0,
  numberOfVehicles: 0,
  numberOfComputers: 0,
  hasStoreHouse: false,
  incidents: [],
  employees: [
    { id: 1, userId: 1, organizationId: 1, fullName: "Abebe Kebede", email: "abebe.k@example.com", phone: "+251911111111", faydaId: "FAN-001", positionName: "Security Manager", gender: "Male", citizenship: "Ethiopian", age: 38, educationLevel: "Degree", workExpYears: 12, totalExpYears: 15, isBlacklisted: false, employmentStatus: "Active", employmentStartDate: "2019-03-15", documents: [] },
    { id: 2, userId: 2, organizationId: 1, fullName: "Tigist Haile", email: "tigist.h@example.com", phone: "+251922222222", faydaId: "FAN-002", positionName: "Operations Head", gender: "Female", citizenship: "Ethiopian", age: 42, educationLevel: "Degree", workExpYears: 16, totalExpYears: 18, isBlacklisted: false, employmentStatus: "Active", employmentStartDate: "2018-07-22", documents: [] },
    { id: 3, userId: 3, organizationId: 1, fullName: "Dawit Eshetu", email: "dawit.e@example.com", phone: "+251933333333", faydaId: "FAN-003", positionName: "Admin Head", gender: "Male", citizenship: "Ethiopian", age: 45, educationLevel: "Degree", workExpYears: 20, totalExpYears: 22, isBlacklisted: false, employmentStatus: "Active", employmentStartDate: "2017-01-10", documents: [] },
    { id: 4, userId: 4, organizationId: 1, fullName: "Meron Alemu", email: "meron.a@example.com", phone: "+251944444444", faydaId: "FAN-004", positionName: "Security Officer", gender: "Female", citizenship: "Ethiopian", age: 29, educationLevel: "Certificate", workExpYears: 5, totalExpYears: 6, isBlacklisted: false, employmentStatus: "Active", employmentStartDate: "2021-11-05", documents: [] },
    { id: 5, userId: 5, organizationId: 1, fullName: "Biruk Tadesse", email: "biruk.t@example.com", phone: "+251955555555", faydaId: "FAN-005", positionName: "Field Agent", gender: "Male", citizenship: "Ethiopian", age: 32, educationLevel: "Diploma", workExpYears: 8, totalExpYears: 10, isBlacklisted: false, employmentStatus: "Inactive", employmentStartDate: "2022-09-12", documents: [] },
    { id: 6, userId: 6, organizationId: 1, fullName: "Sara Hailu", email: "sara.h@example.com", phone: "+251966666666", faydaId: "FAN-006", positionName: "Compliance Officer", gender: "Female", citizenship: "Ethiopian", age: 35, educationLevel: "Degree", workExpYears: 10, totalExpYears: 12, isBlacklisted: false, employmentStatus: "Approved", employmentStartDate: "2020-04-18", documents: [] },
    { id: 7, userId: 7, organizationId: 1, fullName: "Henok Mesfin", email: "henok.m@example.com", phone: "+251977777777", faydaId: "FAN-007", positionName: "IT Support", gender: "Male", citizenship: "Ethiopian", age: 27, educationLevel: "Degree", workExpYears: 4, totalExpYears: 5, isBlacklisted: false, employmentStatus: "Pending", employmentStartDate: "2023-06-30", documents: [] },
    { id: 8, userId: 8, organizationId: 1, fullName: "Betelhem Assefa", email: "betelhem.a@example.com", phone: "+251988888888", faydaId: "FAN-008", positionName: "HR Assistant", gender: "Female", citizenship: "Ethiopian", age: 24, educationLevel: "Diploma", workExpYears: 2, totalExpYears: 3, isBlacklisted: false, employmentStatus: "Pending", employmentStartDate: "2024-02-14", documents: [] },
    { id: 9, userId: 9, organizationId: 1, fullName: "Tekle Ayele", email: "tekle.a@example.com", phone: "+251999999999", faydaId: "FAN-009", positionName: "Security Guard", gender: "Male", citizenship: "Ethiopian", age: 31, educationLevel: "Grade 10-12", workExpYears: 7, totalExpYears: 9, isBlacklisted: false, employmentStatus: "Rejected", employmentStartDate: "2023-11-01", documents: [] },
    { id: 10, userId: 10, organizationId: 1, fullName: "Lemlem Wondimu", email: "lemlem.w@example.com", phone: "+251910101010", faydaId: "FAN-010", positionName: "Secretary", gender: "Female", citizenship: "Ethiopian", age: 26, educationLevel: "Degree", workExpYears: 3, totalExpYears: 4, isBlacklisted: false, employmentStatus: "Suspended", employmentStartDate: "2023-08-20", documents: [] },
  ],
  educationStats: emptyEducationStats(),
  trainingDetails: [],
  serviceContracts: [
    { id: 1, serviceUserName: "Addis Security PLC", contractUrl: "/contracts/001.pdf", assignedPersonnelCount: 15, addressText: "Bole, Addis Ababa", status: "Active", createdAt: "2023-06-01", updatedAt: "2024-06-01" },
    { id: 2, serviceUserName: "Ethio Guard Solutions", contractUrl: "/contracts/002.pdf", assignedPersonnelCount: 8, addressText: "Kazanchis, Addis Ababa", status: "Active", createdAt: "2023-09-15", updatedAt: "2024-09-15" },
    { id: 3, serviceUserName: "Tena Security Services", contractUrl: "/contracts/003.pdf", assignedPersonnelCount: 22, addressText: "Megenagna, Addis Ababa", status: "Expiring Soon", createdAt: "2022-01-10", updatedAt: "2024-01-10" },
  ],
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
  const [selectedContractUrl, setSelectedContractUrl] = useState<string | null>(
    null,
  );
  const [selectedContractName, setSelectedContractName] = useState<string>("");
  const [selectedDocUrl, setSelectedDocUrl] = useState<string | null>(null);
  const [selectedDocName, setSelectedDocName] = useState<string>("");
  const [showAppendContract, setShowAppendContract] = useState(false);
  const [newContract, setNewContract] = useState({
    serviceUserName: "",
    region: "",
    zone: "",
    woreda: "",
    kebele: "",
    houseNumber: "",
    specialLocation: "",
    assignedPersonnelCount: 0,
    status: "Active",
    contractStartDate: "",
    contractDoc: null as File | null,
  });
  // Address selection state from DB
  const [contractRegions, setContractRegions] = useState<any[]>([]);
  const [contractZones, setContractZones] = useState<any[]>([]);
  const [contractWoredas, setContractWoredas] = useState<any[]>([]);
  const [contractKebeles, setContractKebeles] = useState<any[]>([]);
  // Address dropdown open states for contract modal
  const [regionOpen, setRegionOpen] = useState(false);
  const [zoneOpen, setZoneOpen] = useState(false);
  const [woredaOpen, setWoredaOpen] = useState(false);
  const [kebeleOpen, setKebeleOpen] = useState(false);
  const [regionSearch, setRegionSearch] = useState("");
  const [zoneSearch, setZoneSearch] = useState("");
  const [woredaSearch, setWoredaSearch] = useState("");
  const [kebeleSearch, setKebeleSearch] = useState("");
  const contractRefs = {
    region: useRef<HTMLDivElement>(null),
    zone: useRef<HTMLDivElement>(null),
    woreda: useRef<HTMLDivElement>(null),
    kebele: useRef<HTMLDivElement>(null),
  };
  const LOCATION_API = "http://localhost:5000/api/location";
  const getLocationName = (obj: any) =>
    isAm ? obj?.nameAmharic || obj?.nameEnglish || "" : obj?.nameEnglish || obj?.nameAmharic || "";
  const fetchContractRegions = async () => {
    try {
      const res = await fetch(`${LOCATION_API}/regions`);
      const data = await res.json();
      setContractRegions(data?.data || data || []);
    } catch { setContractRegions([]); }
  };
  const fetchContractZones = async (regionId: number) => {
    try {
      const res = await fetch(`${LOCATION_API}/regions/${regionId}/zones`);
      const data = await res.json();
      setContractZones(data?.data || data || []);
    } catch { setContractZones([]); }
  };
  const fetchContractWoredas = async (zoneId: number) => {
    try {
      const res = await fetch(`${LOCATION_API}/zones/${zoneId}/woredas`);
      const data = await res.json();
      setContractWoredas(data?.data || data || []);
    } catch { setContractWoredas([]); }
  };
  const fetchContractKebeles = async (woredaId: number) => {
    try {
      const res = await fetch(`${LOCATION_API}/woredas/${woredaId}/kebeles`);
      const data = await res.json();
      setContractKebeles(data?.data || data || []);
    } catch { setContractKebeles([]); }
  };
  // Toast state
  const [toastOpen, setToastOpen] = useState(false);
  const [toastType, setToastType] = useState<ToastType>("success");
  const [toastMessage, setToastMessage] = useState("");
  const { user } = useAuth();
  const { language } = useLanguage();
  const isAm = language === "am";
  const navigate = useNavigate();
  const isOrgHrManager = user?.roles.includes("org_hr_manager");

  const getOrganizationDocumentActionLabel = (
    doc: DMSDocumentMock,
    loading: boolean,
  ) => {
    if (loading) return isAm ? "በማዘመን ላይ..." : "Updating...";
    if (isOrgHrManager) {
      return doc.isVerified ? (isAm ? "የተረጋገጠ" : "Verified") : (isAm ? "አዘምን" : "Update");
    }
    return doc.isVerified ? (isAm ? "ያልተረጋገጠ አድርግ" : "Mark Unverified") : (isAm ? "የተረጋገጠ አድርግ" : "Mark Verified");
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [documentReplacementTarget, setDocumentReplacementTarget] = useState<{
    docId: number;
    docName: string;
  } | null>(null);
  const [documentUpdateFile, setDocumentUpdateFile] = useState<File | null>(
    null,
  );
  const [documentUpdatePreviewUrl, setDocumentUpdatePreviewUrl] = useState<
    string | null
  >(null);
  const [basicDocsExpanded, setBasicDocsExpanded] = useState(true);

  const showToast = (type: ToastType, message: string) => {
    setToastType(type);
    setToastMessage(message);
    setToastOpen(true);
  };

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
        const data = await apiRequest(`/organizations/${orgId}/details`);
        const details = data?.data ?? data?.payload ?? data;

        if (details && typeof details === "object") {
          setSelectedOrg({
            nameEnglish: details.nameEnglish ?? "",
            nameAmharic: details.nameAmharic ?? "",
            tinNumber: details.tinNumber ?? "",
            status: details.status ?? "",
            email: details.email ?? "",
            fax: details.fax ?? "",
            phone: details.phone ?? "",
            headOfficeAddress: details.headOfficeAddress ?? "",
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
  const [personnelSearch, setPersonnelSearch] = useState("");
  const [personnelFilter, setPersonnelFilter] = useState("ALL");
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

  // Fetch regions when append contract modal opens
  useEffect(() => {
    if (showAppendContract) {
      fetchContractRegions();
      setContractZones([]);
      setContractWoredas([]);
      setContractKebeles([]);
    }
  }, [showAppendContract]);

  // Close address dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      Object.entries(contractRefs).forEach(([key, ref]) => {
        if (ref.current && !ref.current.contains(e.target as Node)) {
          if (key === "region") { setRegionOpen(false); setRegionSearch(""); }
          if (key === "zone") { setZoneOpen(false); setZoneSearch(""); }
          if (key === "woreda") { setWoredaOpen(false); setWoredaSearch(""); }
          if (key === "kebele") { setKebeleOpen(false); setKebeleSearch(""); }
        }
      });
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch zones when region changes
  const handleContractRegionChange = (value: string) => {
    const region = contractRegions.find((r: any) => (r.nameEnglish || r.name) === value || String(r.id) === value);
    setNewContract((prev: any) => ({ ...prev, region: value, zone: "", woreda: "", kebele: "" }));
    if (region?.id) fetchContractZones(region.id);
    else setContractZones([]);
    setContractWoredas([]);
    setContractKebeles([]);
  };

  // Fetch woredas when zone changes
  const handleContractZoneChange = (value: string) => {
    const zone = contractZones.find((z: any) => (z.nameEnglish || z.name) === value || String(z.id) === value);
    setNewContract((prev: any) => ({ ...prev, zone: value, woreda: "", kebele: "" }));
    if (zone?.id) fetchContractWoredas(zone.id);
    else setContractWoredas([]);
    setContractKebeles([]);
  };

  // Fetch kebeles when woreda changes
  const handleContractWoredaChange = (value: string) => {
    const woreda = contractWoredas.find((w: any) => (w.nameEnglish || w.name) === value || String(w.id) === value);
    setNewContract((prev: any) => ({ ...prev, woreda: value, kebele: "" }));
    if (woreda?.id) fetchContractKebeles(woreda.id);
    else setContractKebeles([]);
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

  const getDocumentBadgeStyle = (isVerified: boolean) =>
    isVerified
      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
      : "bg-amber-50 text-amber-700 border border-amber-200";

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
  const translateDocStatus = (status: string) => {
    if (!isAm) return status;
    const map: Record<string, string> = {
      "Permanent": "ቋሚ",
      "Active": "ንቁ",
      "Expiring Soon": "በቅርቡ የሚያልቅ",
      "Expired": "ያለፈበት",
    };
    return map[status] || status;
  };

  const eduStatLabels: [string, string][] = [
    ["Grade 3-9", "ከ3-9ኛ ክፍል"],
    ["Grade 10-12", "ከ10-12ኛ ክፍል"],
    ["Vocational Certificate", "የሙያ ሰርተፍኬት"],
    ["Advanced Diploma", "ከፍተኛ ዲፕሎማ"],
    ["Bachelor's Degree", "የመጀመሪያ ዲግሪ"],
    ["Master's Degree (Second)", "የሁለተኛ ዲግሪ"],
  ];
  const eduStatRows = eduStatLabels.map(([en, am], i) => {
    const data = [
      { male: org.educationStats.grade_3_9_male, female: org.educationStats.grade_3_9_female },
      { male: org.educationStats.grade_10_12_male, female: org.educationStats.grade_10_12_female },
      { male: org.educationStats.certificate_male, female: org.educationStats.certificate_female },
      { male: org.educationStats.diploma_male, female: org.educationStats.diploma_female },
      { male: org.educationStats.degree_male, female: org.educationStats.degree_female },
      { male: org.educationStats.second_degree_male, female: org.educationStats.second_degree_female },
    ];
    return { label: isAm ? am : en, ...data[i] };
  });

  const educationTotals = eduStatRows.reduce(
    (totals, row) => ({
      male: totals.male + row.male,
      female: totals.female + row.female,
    }),
    { male: 0, female: 0 },
  );

  const totalContractedPersonnel = org.serviceContracts.reduce(
    (acc, curr) => acc + (curr.assignedPersonnelCount || 0),
    0,
  );

  const [documentActionLoading, setDocumentActionLoading] = useState<
    Record<number, boolean>
  >({});

  const setDocumentLoading = (docId: number, loading: boolean) => {
    setDocumentActionLoading((prev) => ({ ...prev, [docId]: loading }));
  };

  const updateDocumentState = (
    docId: number,
    isVerified: boolean,
    scope: "employee" | "organization" = "employee",
  ) => {
    if (scope === "employee") {
      if (!selectedEmployee) return;

      const updatedDocuments = selectedEmployee.documents?.map((doc) =>
        doc.id === docId ? { ...doc, isVerified } : doc,
      );

      setSelectedEmployee({
        ...selectedEmployee,
        documents: updatedDocuments,
      });
      return;
    }

    if (!selectedOrg) return;

    const updatedDocuments = org.dmsDocuments.map((doc) =>
      Number(doc.id) === docId ? { ...doc, isVerified } : doc,
    );

    setSelectedOrg({
      ...org,
      dmsDocuments: updatedDocuments,
    });
  };

  const toggleDocumentVerification = async (
    docId: number,
    shouldVerify: boolean,
    scope: "employee" | "organization" = "employee",
  ) => {
    if (scope === "employee" && !selectedEmployee) return;
    if (scope === "organization" && !selectedOrg) return;

    setDocumentLoading(docId, true);

    try {
      await apiRequest(
        `/applications/documents/${scope}/${docId}/${shouldVerify ? "verify" : "unverify"}`,
        {
          method: "POST",
        },
      );

      updateDocumentState(docId, shouldVerify, scope);
      showToast(
        "success",
        `Document ${shouldVerify ? "verified" : "marked unverified"} successfully.`,
      );
    } catch (error: any) {
      console.error(
        `Failed to ${shouldVerify ? "verify" : "unverify"} document ${docId}:`,
        error,
      );
      const msg = error?.message || "Server error while updating document.";
      showToast("error", msg);
    } finally {
      setDocumentLoading(docId, false);
    }
  };

  const deleteOrganizationDocument = async (docId: number, docName: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${docName}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    if (!selectedOrg) return;

    setDocumentLoading(docId, true);

    try {
      await apiRequest(`/organizations/documents/${docId}`, {
        method: "DELETE",
      });

      // Remove document from organization state
      const updatedDocuments = org.dmsDocuments.filter(
        (doc) => Number(doc.id) !== docId,
      );

      setSelectedOrg({
        ...org,
        dmsDocuments: updatedDocuments,
      });

      showToast("success", `Document "${docName}" deleted successfully.`);
    } catch (error: any) {
      console.error(`Failed to delete document ${docId}:`, error);
      const msg = error?.message || "Server error while deleting document.";
      showToast("error", msg);
    } finally {
      setDocumentLoading(docId, false);
    }
  };

  const triggerOrganizationDocumentUpdate = (doc: DMSDocumentMock) => {
    setDocumentReplacementTarget({
      docId: Number(doc.id),
      docName: doc.documentName,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const closeDocumentUpdateModal = () => {
    setDocumentReplacementTarget(null);
    setDocumentUpdateFile(null);
    if (documentUpdatePreviewUrl) {
      URL.revokeObjectURL(documentUpdatePreviewUrl);
      setDocumentUpdatePreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const confirmDocumentUpdate = async () => {
    if (!documentUpdateFile || !documentReplacementTarget) return;
    await replaceOrganizationDocument(
      documentReplacementTarget.docId,
      documentReplacementTarget.docName,
      documentUpdateFile,
    );
    closeDocumentUpdateModal();
  };

  const deriveDocumentStatus = (
    expiryDate?: string,
  ): DMSDocumentMock["status"] => {
    if (!expiryDate) return "Permanent";

    const expiry = new Date(expiryDate);
    if (expiry < new Date()) return "Expired";
    return expiry.getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000
      ? "Expiring Soon"
      : "Active";
  };

  const replaceOrganizationDocument = async (
    docId: number,
    docName: string,
    file: File,
  ) => {
    if (!selectedOrg) return;
    setDocumentLoading(docId, true);

    try {
      const formData = new FormData();
      formData.append("document", file);

      const response = await apiRequest(`/organizations/documents/${docId}`, {
        method: "PATCH",
        body: formData,
      });

      const updated =
        response?.data?.document ?? response?.document ?? response;

      if (!updated) {
        throw new Error("Invalid response from server.");
      }

      const updatedDocuments = org.dmsDocuments.map((doc) => {
        if (Number(doc.id) !== docId) return doc;
        return {
          ...doc,
          fileUrl: updated.fileUrl ?? doc.fileUrl,
          isVerified: updated.isVerified,
          issuedDate: updated.issuedDate
            ? new Date(updated.issuedDate).toISOString().split("T")[0]
            : doc.issuedDate,
          expiryDate: updated.expiryDate
            ? new Date(updated.expiryDate).toISOString().split("T")[0]
            : doc.expiryDate,
          status: deriveDocumentStatus(updated.expiryDate ?? doc.expiryDate),
        };
      });

      setSelectedOrg({
        ...org,
        dmsDocuments: updatedDocuments,
      });

      showToast("success", `Document "${docName}" updated successfully.`);
    } catch (error: any) {
      console.error(`Failed to update organization document ${docId}:`, error);
      const msg = error?.message || "Server error while updating document.";
      showToast("error", msg);
    } finally {
      setDocumentLoading(docId, false);
    }
  };

  const handleOrganizationDocumentFileSelected = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    const target = documentReplacementTarget;
    if (!file || !target) {
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setDocumentUpdateFile(file);
    setDocumentUpdatePreviewUrl(previewUrl);
  };

  // DMS helper counts
  const basicDocs = org.dmsDocuments.filter((d) => d.type === "Basic");
  const yearlyDocs = org.dmsDocuments.filter(
    (d) => d.type === "Yearly Renewed",
  );
  const alertDocsCount = yearlyDocs.filter(
    (d) => d.type === "Yearly Renewed",
  ).length;

  // --- SearchableLocationSelect Component ---
  const SearchableLocationSelect = ({
    label, placeholder, searchPlaceholder, value, options, disabled = false, isOpen, onToggle, onSelect, onClear, searchTerm, onSearchChange, innerRef,
  }: {
    label: string; placeholder: string; searchPlaceholder: string; value: string; options: any[]; disabled?: boolean;
    isOpen: boolean; onToggle: () => void; onSelect: (val: string) => void; onClear: () => void;
    searchTerm: string; onSearchChange: (v: string) => void; innerRef: React.RefObject<HTMLDivElement | null>;
  }) => {
    const selected = options.find((o: any) => (o.nameEnglish || o.name || String(o.id)) === value);
    const filtered = options.filter((o: any) => (getLocationName(o) || "").toLowerCase().includes(searchTerm.toLowerCase()));
    return (
      <div ref={innerRef} className="relative">
        <div className="flex items-center justify-between mb-1">
          <label className="text-[9px] uppercase tracking-[0.1em] font-bold text-[#003366]">{label} <span className="text-orange-500">*</span></label>
        </div>
        <button type="button" disabled={disabled}
          onClick={onToggle}
          className={`w-full px-3 py-2.5 rounded-xl border text-sm text-left flex items-center justify-between gap-2 transition-all relative ${disabled ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "bg-white text-gray-700 hover:border-[#003366]/30 cursor-pointer"} ${isOpen ? "border-[#003366]/50 ring-2 ring-[#003366]/20" : "border-gray-200"}`}
        >
          <span className={`truncate ${selected ? "font-bold text-[#003366]" : "text-gray-400"}`}>
            {selected ? getLocationName(selected) : placeholder}
          </span>
          <span className="flex items-center gap-1 shrink-0">
            {selected ? (
              <button type="button" onClick={(e) => { e.stopPropagation(); onClear(); }}
                className="text-red-400 hover:text-red-600 transition-colors p-0.5" title="Clear">
                <X className="w-4 h-4" />
              </button>
            ) : (
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            )}
          </span>
        </button>
        {isOpen && !disabled && (
          <div className="absolute left-0 right-0 top-full z-30 mt-1 rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden">
            <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2.5 bg-gray-50">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input type="text" value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400"
                autoFocus
              />
              {searchTerm && (
                <button type="button" onClick={() => onSearchChange("")}
                  className="shrink-0 p-0.5 rounded-full text-gray-400 hover:text-red-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="max-h-44 overflow-y-auto p-1.5">
              {filtered.length > 0 ? filtered.map((o: any) => {
                const val = o.nameEnglish || o.name || String(o.id);
                return (
                  <button key={o.id} type="button"
                    onClick={() => { onSelect(val); }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all ${val === value ? "bg-[#003366]/10 text-[#003366] font-bold" : "text-gray-700 hover:bg-gray-100"}`}
                  >
                    {getLocationName(o)}
                  </button>
                );
              }) : (
                <div className="px-3 py-4 text-sm text-gray-400 text-center">
                  {searchTerm ? (isAm ? "ምንም አማራጭ አልተገኘም" : "No matching options") : (isAm ? "ምንም አማራጭ የለም" : "No options available")}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      {/* 1. Page Header Dashboard Context */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#003366] to-[#001F3F] rounded-2xl shadow-lg px-6 py-6 mb-6 relative overflow-hidden border-t-4 border-[#FFD700]"
      >
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-[#FFD700]/5 to-transparent" />
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 relative z-10">
          <div className="flex flex-col gap-3">
            <motion.button
              whileHover={{ x: -2 }}
              type="button"
              onClick={onBack}
              className="text-xs font-bold text-[#FFD700] hover:text-[#FFD700]/80 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> {isAm ? "ወደ ድርጅቶች ተመለስ" : "Back to Organizations"}
            </motion.button>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-[#FFD700] flex items-center justify-center shrink-0 shadow-md">
                <Building2 className="w-7 h-7 text-[#003366]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {org.nameEnglish}
                </h1>
                <h2
                  className="text-base font-medium text-white/70 mt-0.5"
                  style={{
                    fontFamily: "Nyala, Noto Sans Ethiopic, sans-serif",
                  }}
                >
                  {org.nameAmharic}
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-white/10 text-white px-2.5 py-1 rounded-full border border-white/20">
                    <FileText size={14} /> {isAm ? "ቲን" : "TIN"}: {org.tinNumber}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Toast */}
      <AutoDismissToast
        isOpen={toastOpen}
        type={toastType}
        message={toastMessage}
        onClose={() => setToastOpen(false)}
      />
      {/* 2. Tab Navigation Bar (Now featuring DMS) */}
      <div className="bg-white border border-gray-200 border-b-0 rounded-t-xl px-6 pt-2 mb-6">
        <nav className="flex gap-6 overflow-x-auto">
          {[
            { id: "overview", label: isAm ? "አጠቃላይ እይታ" : "Overview", icon: Building2 },
            {
              id: "personnel",
              label: `${isAm ? "ሰራተኞች" : "HR & Personnel"} (${org.employees.length})`,
              icon: Users,
            },
            { id: "compliance", label: isAm ? "የትምህርት ስታቲስቲክስ" : "Education Stats", icon: GraduationCap },
            {
              id: "training",
              label: `${isAm ? "የስልጠና ዝርዝሮች" : "Training Details"} (${org.trainingDetails.length})`,
              icon: BookOpen,
            },
            {
              id: "contracts",
              label: `${isAm ? "የአገልግሎት ውሎች" : "Service Contracts"} (${org.serviceContracts.length})`,
              icon: FileCheck,
            },
            {
              id: "dms",
              label: `${isAm ? "የሰነድ ማከማቻ" : "DMS Vault"} (${org.dmsDocuments.length})`,
              icon: FileText,
            },
            {
              id: "operations",
              label: `${isAm ? "ክዋኔዎች እና ክስተቶች" : "Operations & Incidents"} (${org.incidents.length})`,
              icon: ShieldAlert,
            },
          ].map((tab, idx) => (
            <motion.button
              key={tab.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-4 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-[#003366] text-white shadow-sm"
                  : "bg-[#003366]/10 text-[#003366] hover:bg-[#003366]/20"
              }`}
            >
              <tab.icon size={18} /> {tab.label}
            </motion.button>
          ))}
        </nav>
      </div>

      {/* 3. Tab Content Area */}
      <div className="space-y-6">
        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: isAm ? "ጠቅላላ ካፒታል (ETB)" : "Total Capital (ETB)", value: org.capitalAmount, icon: Briefcase, delay: 0.1 },
                { title: isAm ? "የተመዘገቡ ተሽከርካሪዎች" : "Registered Vehicles", value: org.numberOfVehicles, icon: Car, delay: 0.2 },
                { title: isAm ? "የተመዘገቡ ኮምፒውተሮች" : "Registered Computers", value: org.numberOfComputers, icon: Monitor, delay: 0.3 },
                { title: isAm ? "የቢሮዎች ብዛት" : "Number of Offices", value: org.numberOfOffices, icon: MapPin, delay: 0.4 },
              ].map((card) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: card.delay }}
                  whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(0,51,102,0.12)" }}
                  className="bg-gradient-to-br from-white to-[#f8faff] p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-[#FFD700]/40 transition-all duration-300"
                >
                  <div className="p-3 rounded-lg bg-gradient-to-br from-[#003366] to-[#001F3F] shrink-0">
                    <card.icon className="h-6 w-6 text-[#FFD700]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#003366] uppercase tracking-wider">{card.title}</p>
                    <p className="text-xl font-bold text-slate-900 mt-0.5">{card.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div>
              <div className="bg-gradient-to-r from-[#003366] to-[#001F3F] px-6 py-4 rounded-t-xl border-t-4 border-[#FFD700] relative overflow-hidden">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#FFD700] shrink-0">
                    <Building2 size={18} className="text-[#003366]" />
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {isAm ? "ግንኙነት እና መሠረተ ልማት" : "Contact & Infrastructure"}
                  </h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#FFD700]/40 to-transparent" />
                </div>
              </div>
              <div className="bg-white border border-gray-200 border-t-0 rounded-b-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                  {[
                    { icon: Phone, label: isAm ? "ኦፊሴላዊ ስልክ ቁጥር" : "Official Phone Number", value: org.phone, delay: 0.3 },
                    { icon: Mail, label: isAm ? "ኦፊሴላዊ የኢሜይል አድራሻ" : "Official Email Address", value: org.email, delay: 0.35 },
                    { icon: Phone, label: isAm ? "ኦፊሴላዊ የፋክስ ቁጥር" : "Official Fax number", value: org.fax || (isAm ? "የለም" : "N/A"), delay: 0.4 },
                    { icon: Shield, label: isAm ? "መጋዘን / የጦር መሳሪያ ክምችት" : "Store House / Armory", value: org.hasStoreHouse ? (isAm ? "አዎ፣ የተረጋገጠ ደህንነቱ የተጠበቀ ተቋም" : "Yes, Verified Secure Facility") : (isAm ? "ምንም አልተመዘገበም" : "None Registered"), delay: 0.45 },
                  ].map((field) => (
                    <motion.div
                      key={field.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: field.delay }}
                      className="group"
                    >
                      <label className="text-sm font-black text-[#003366] uppercase tracking-wider flex items-center gap-2 mb-1.5">
                        <span className="p-1.5 rounded-lg bg-[#003366]">
                          <field.icon size={18} className="text-[#FFD700]" />
                        </span>
                        {field.label}
                      </label>
                      <p className="text-gray-900 pl-9">
                        {field.value}
                      </p>
                    </motion.div>
                  ))}
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 pt-6 border-t border-gray-100"
                >
                  <h4 className="text-sm font-black text-[#003366] flex items-center gap-2 mb-1.5">
                    <span className="p-1.5 rounded-lg bg-[#003366]">
                      <MapPin size={18} className="text-[#FFD700]" />
                    </span>
                    {isAm ? "ዋና ቢሮ አድራሻ" : "Head Office Address"}
                  </h4>
                  <p className="text-sm text-gray-700 pl-9 leading-relaxed">
                    {org.headOfficeAddress || "---"}
                  </p>
                </motion.div>

                {org.branches.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.55 }}
                    className="mt-6 pt-6 border-t border-gray-100"
                  >
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <h4 className="text-sm font-black text-[#003366] flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-[#003366]">
                          <Building2 size={18} className="text-[#FFD700]" />
                        </span>
                        {isAm ? "የቅርንጫፍ ቢሮ አድራሻዎች" : "Branch Office Addresses"}
                      </h4>
                      <span className="text-[10px] font-bold text-[#003366] bg-[#003366]/5 border border-[#003366]/10 px-2 py-0.5 rounded-full">
                        {org.branches.length} {isAm ? "ቅርንጫፍ" : "branch"}{org.branches.length > 1 ? (isAm ? "ዎች" : "es") : ""}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {org.branches.map((branch) => (
                        <div key={branch.id} className="flex items-start gap-2">
                          <MapPin
                            size={16}
                            className="text-[#003366] mt-0.5 shrink-0"
                          />
                          <span className="text-sm leading-relaxed text-gray-700">
                            {branch.addressText}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === "personnel" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[#003366] to-[#001F3F] border-t-4 border-[#FFD700]">
            <div className="p-4 flex justify-between items-center">
              <span className="font-bold text-sm text-white">
                {isAm ? "ንቁ የሰራተኞች ዳይሬክተሪ" : "Active Operational Personnel Directory"}
              </span>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() =>
                  navigate("/org-hr-manager/employee-registration")
                }
                className="px-3 py-1.5 bg-[#FFD700] text-[#003366] hover:bg-[#FFD700]/90 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
              >
                <UserPlus size={14} /> {isAm ? "ሰራተኛ ይመዝገቡ" : "Register Employee"}
              </motion.button>
            </div>
            </div>
            <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={personnelSearch}
                  onChange={(e) => setPersonnelSearch(e.target.value)}
                  placeholder={isAm ? "በስም ፈልግ..." : "Search by name..."}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]/50 hover:border-[#003366]/30 transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-3.5 w-3.5 text-gray-400 hidden sm:block" />
                <select
                  value={personnelFilter}
                  onChange={(e) => setPersonnelFilter(e.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]/50 hover:border-[#003366]/30 transition-all"
                >
                  <option value="ALL">{isAm ? "ሁሉም" : "All Status"}</option>
                  <option value="Active">{isAm ? "ንቁ" : "Active"}</option>
                  <option value="Inactive">{isAm ? "የማይንቀሳቀስ" : "Inactive"}</option>
                  <option value="Approved">{isAm ? "የጸደቀ" : "Approved"}</option>
                  <option value="Pending">{isAm ? "በመጠባበቅ ላይ" : "Pending"}</option>
                  <option value="Rejected">{isAm ? "አልተቀበለም" : "Rejected"}</option>
                  <option value="Suspended">{isAm ? "የታገደ" : "Suspended"}</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#003366] text-white text-[11px] uppercase tracking-[0.2em]">
                    <th className="p-4">{isAm ? "የሰራተኛ ሙሉ ስም" : "Employee FULL Name"}</th>
                    <th className="p-4">{isAm ? "የተሰጠ ሀላፊነት" : "Assigned Position"}</th>
                    <th className="p-4">{isAm ? "የፋይዳ ቁጥር" : "Fayda Number (FAN)"}</th>
                    <th className="p-4">{isAm ? "የስራ ልምድ" : "Work Experience"}</th>
                    <th className="p-4">{isAm ? "ሁኔታ እና ማረጋገጫ" : "Status & Clearances"}</th>
                    <th className="p-4">{isAm ? "ድርጊት" : "Action"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-700">
                  {(() => {
                    const filtered = org.employees.filter((emp) => {
                      const matchesSearch = emp.fullName.toLowerCase().includes(personnelSearch.toLowerCase());
                      const matchesFilter = personnelFilter === "ALL" || (emp.employmentStatus ?? "").toLowerCase() === personnelFilter.toLowerCase();
                      return matchesSearch && matchesFilter;
                    });
                    return filtered.map((emp, idx) => (
                    <motion.tr
                      key={emp.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + idx * 0.03 }}
                      whileHover={{ backgroundColor: "rgba(0,51,102,0.02)" }}
                      className="transition-colors"
                    >
                      <td className="p-4">
                        <div className="font-bold text-[#003366]">
                          {emp.fullName}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {emp.email}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 font-medium text-gray-800">
                          <User size={14} className="text-[#003366]/40" /> {emp.positionName}
                        </div>
                      </td>
                      <td className="p-4 text-xs space-y-0.5">
                        <p>
                          <span className="text-gray-400">{isAm ? "ፋይዳ:" : "FAN:"} </span>{" "}
                          {emp.faydaId}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 font-medium text-gray-900">
                          <Clock size={14} className="text-[#003366]/40" />
                          <span>{emp.workExpYears} {isAm ? "ዓመታት" : "Years"}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1.5 items-start">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              emp.employmentStatus === "Active"
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : emp.employmentStatus === "Inactive"
                                  ? "bg-gray-100 text-gray-600 border border-gray-200"
                                  : emp.employmentStatus === "Approved"
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : emp.employmentStatus === "Pending"
                                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                                      : emp.employmentStatus === "Rejected"
                                        ? "bg-red-50 text-red-700 border border-red-200"
                                        : emp.employmentStatus === "Suspended"
                                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                                          : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {emp.employmentStatus === "Active" && isAm ? "ንቁ" : emp.employmentStatus === "Inactive" && isAm ? "የማይንቀሳቀስ" : emp.employmentStatus === "Approved" && isAm ? "የጸደቀ" : emp.employmentStatus === "Pending" && isAm ? "በመጠባበቅ ላይ" : emp.employmentStatus === "Rejected" && isAm ? "አልተቀበለም" : emp.employmentStatus === "Suspended" && isAm ? "የታገደ" : emp.employmentStatus}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={() => setSelectedEmployee(emp)}
                          className="px-3 py-1.5 bg-[#003366] text-[#FFD700] rounded-lg text-xs font-bold hover:shadow-md transition-shadow"
                        >
                          {isAm ? "ዝርዝር እይታ" : "Detail View"}
                        </motion.button>
                      </td>
                    </motion.tr>
                  ));
                  })()}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === "compliance" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            <div className="p-4 bg-gradient-to-r from-gray-50 to-[#f8faff] border-b border-gray-200">
              <h3 className="font-bold text-[#003366] text-sm">
                {isAm ? "የትምህርት ደረጃ ስታቲስቲክስ" : "Education Level Statistics"}
              </h3>
            </div>
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#003366] text-white font-bold text-xs uppercase tracking-wider">
                  <th className="p-4">{isAm ? "የትምህርት ደረጃ" : "Education Level"}</th>
                  <th className="p-4 text-center">{isAm ? "ወንድ" : "Number of Males"}</th>
                  <th className="p-4 text-center">{isAm ? "ሴት" : "Number of Females"}</th>
                  <th className="p-4 text-right">{isAm ? "አጠቃላይ" : "Sub-Total"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700">
                {eduStatRows.map((row, idx) => (
                  <motion.tr
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + idx * 0.05 }}
                    whileHover={{ backgroundColor: "rgba(0,51,102,0.02)" }}
                    className="transition-colors"
                  >
                    <td className="p-4 font-bold text-[#003366]">{row.label}</td>
                    <td className="p-4 text-center text-blue-600 font-medium">{row.male}</td>
                    <td className="p-4 text-center text-pink-600 font-medium">{row.female}</td>
                    <td className="p-4 text-right font-bold text-gray-800">{row.male + row.female}</td>
                  </motion.tr>
                ))}
                <tr className="bg-[#003366]/5 text-[#003366] font-bold">
                  <td className="p-4">{isAm ? "ድምር" : "Total"}</td>
                  <td className="p-4 text-center">{educationTotals.male}</td>
                  <td className="p-4 text-center">{educationTotals.female}</td>
                  <td className="p-4 text-right">{educationTotals.male + educationTotals.female}</td>
                </tr>
              </tbody>
            </table>
          </motion.div>
        )}

        {activeTab === "training" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            {org.trainingDetails.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-10 text-center text-slate-500"
              >
                <BookOpen className="mx-auto mb-4 text-slate-400" size={32} />
                <p className="text-lg font-bold text-[#003366]">
                  {isAm ? "እስካሁን የስልጠና ዝርዝሮች የሉም" : "No training details available yet"}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {isAm ? "የስልጠና መረጃዎች ከተዛማጅ መተግበሪያዎች የተሰበሰቡ ናቸው" : "Training records are loaded from related applications and help you review the trainee cohort, venue, and timeline."}
                </p>
              </motion.div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-[#003366] text-white text-[11px] uppercase tracking-[0.2em]">
                      <th className="p-4 text-left">{isAm ? "የስልጠና ተቋም" : "Training Body"}</th>
                      <th className="p-4 text-left">{isAm ? "ቦታ" : "Location"}</th>
                      <th className="p-4 text-center">{isAm ? "ቆይታ" : "Duration"}</th>
                      <th className="p-4 text-center">{isAm ? "የመጀመሪያ ቀን" : "Start Date"}</th>
                      <th className="p-4 text-center">{isAm ? "የማጠናቀቂያ ቀን" : "End Date"}</th>
                      <th className="p-4 text-center">{isAm ? "ወንድ የሰለጠኑ" : "Male Trained"}</th>
                      <th className="p-4 text-center">{isAm ? "ሴት የሰለጠኑ" : "Female Trained"}</th>
                      <th className="p-4 text-center">{isAm ? "ያልሰለጠኑ ወንድ" : "Male Not Trained"}</th>
                      <th className="p-4 text-center">{isAm ? "ያልሰለጠኑ ሴት" : "Female Not Trained"}</th>
                      <th className="p-4 text-center">{isAm ? "ድምር" : "Total"}</th>
                      <th className="p-4 text-right">{isAm ? "ስኬት" : "Success"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {org.trainingDetails.map((train, idx) => {
                      const totalEnrolled =
                        train.totalTraineesMale + train.totalTraineesFemale;
                      const totalFailedOrNot =
                        train.totalNotTraineesMale +
                        train.totalNotTraineesFemale;
                      const cohortSize = totalEnrolled + totalFailedOrNot;
                      const successRate =
                        cohortSize > 0
                          ? Math.round((totalEnrolled / cohortSize) * 100)
                          : 0;

                      return (
                        <motion.tr
                          key={train.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + idx * 0.03 }}
                          whileHover={{ backgroundColor: "rgba(0,51,102,0.02)" }}
                          className="transition-colors"
                        >
                          <td className="p-4 font-bold text-[#003366]">
                            {train.trainingBodyName || "—"}
                          </td>
                          <td className="p-4 text-slate-600">
                            {train.trainingAddress || "—"}
                          </td>
                          <td className="p-4 text-center text-slate-900">
                            {train.trainingDurationDays} {isAm ? "ቀናት" : "days"}
                          </td>
                          <td className="p-4 text-center">
                            {train.trainingStartDate || "—"}
                          </td>
                          <td className="p-4 text-center">
                            {train.trainingEndDate || "—"}
                          </td>
                          <td className="p-4 text-center text-blue-600">
                            {train.totalTraineesMale}
                          </td>
                          <td className="p-4 text-center text-pink-600">
                            {train.totalTraineesFemale}
                          </td>
                          <td className="p-4 text-center text-slate-800">
                            {train.totalNotTraineesMale}
                          </td>
                          <td className="p-4 text-center text-slate-800">
                            {train.totalNotTraineesFemale}
                          </td>
                          <td className="p-4 text-center font-bold text-[#003366]">
                            {cohortSize}
                          </td>
                          <td className="p-4 text-right">
                            <span className="inline-flex items-center justify-end gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                              {successRate}%
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "contracts" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: isAm ? "ንቁ የአገልግሎት ውሎች" : "Active Service Contracts", value: `${org.serviceContracts.length} ${isAm ? "የድርጅት ደንበኞች" : "Corporate Clients"}`, icon: FileCheck, delay: 0.1 },
                { title: isAm ? "የተሰማራ የጥበቃ ሃይል" : "Deployed Guard Strength", value: `${totalContractedPersonnel} ${isAm ? "ሰራተኞች" : "Personnel"}`, icon: Users, delay: 0.2 },
                { title: isAm ? "የአሰራር አጠቃቀም" : "Operational Utilization", value: isAm ? "100% ንቁ" : "100% Active", icon: Building2, delay: 0.3 },
              ].map((card) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: card.delay }}
                  whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(0,51,102,0.12)" }}
                  className="bg-gradient-to-br from-white to-[#f8faff] p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-[#FFD700]/40 transition-all duration-300"
                >
                  <div className="p-3 rounded-lg bg-gradient-to-br from-[#003366] to-[#001F3F] shrink-0">
                    <card.icon className="h-6 w-6 text-[#FFD700]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#003366] uppercase tracking-wider">{card.title}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-0.5">{card.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <div className="p-5 bg-gradient-to-r from-gray-50 to-[#f8faff] border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-[#003366] text-sm">
                    {isAm ? "ንቁ የB2B አገልግሎት ውሎች" : "Active B2B Service Engagements"}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {isAm ? "በፌዴራል ፖሊስ መዝገብ የተረጋገጡ ህጋዊ ዲጂታል ሰነዶች" : "Legal binding digital document entries verified by Federal Police Registry."}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAppendContract(true)}
                  className="px-3 py-1.5 bg-gradient-to-r from-[#003366] to-[#001F3F] hover:from-[#001F3F] hover:to-[#003366] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
                >
                  <Plus size={14} /> {isAm ? "ውል ያክሉ" : "Append Contract"}
                </motion.button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-[#003366] text-white text-[11px] uppercase tracking-[0.2em]">
                      <th className="p-4">{isAm ? "የውል መለያ እና ደንበኛ" : "Contract ID & Client Entity"}</th>
                      <th className="p-4">{isAm ? "የተሰማራበት ቦታ" : "Deployment Site Location"}</th>
                      <th className="p-4">{isAm ? "ሁኔታ" : "Status"}</th>
                      <th className="p-4 text-center">{isAm ? "የተመደቡ ጠባቂዎች" : "Assigned Guards"}</th>
                      <th className="p-4">{isAm ? "የኦዲት ቀናት" : "Audit Dates"}</th>
                      <th className="p-4 text-right">{isAm ? "ህጋዊ ሰነዶች" : "Legal Documents"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-700">
                    {org.serviceContracts.map((contract, idx) => (
                      <motion.tr
                        key={contract.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.03 }}
                        whileHover={{ backgroundColor: "rgba(0,51,102,0.02)" }}
                        className="transition-colors"
                      >
                        <td className="p-4">
                          <div className="font-bold text-[#003366]">
                            {contract.serviceUserName}
                          </div>
                          <div className="text-xs text-gray-400 mt-1 font-mono flex items-center gap-1">
                            <span className="px-1.5 py-0.5 bg-[#003366]/5 text-[#003366] rounded text-[10px] font-bold">
                              CID-{contract.id}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-start gap-1 text-xs text-gray-600 max-w-xs leading-relaxed">
                            <MapPin size={14} className="text-[#003366]/40 shrink-0 mt-0.5" />
                            <span>{contract.addressText}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center justify-center text-xs font-bold uppercase tracking-wider rounded-full px-3 py-1 ${getContractStatusBadge(contract.status)}`}
                          >
                            {contract.status ?? (isAm ? "ያልታወቀ" : "Unknown")}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center justify-center font-bold text-sm text-[#003366] bg-[#003366]/5 border border-[#003366]/10 px-3 py-1 rounded-lg min-w-[50px]">
                            {contract.assignedPersonnelCount}
                          </span>
                        </td>
                        <td className="p-4 text-xs space-y-1 text-gray-500">
                          <p>
                            <span className="text-gray-400 font-medium">
                              {isAm ? "የተመዘገበ:" : "Logged:"}
                            </span>{" "}
                            {contract.createdAt}
                          </p>
                          <p>
                            <span className="text-gray-400 font-medium">
                              {isAm ? "የተሻሻለ:" : "Updated:"}
                            </span>{" "}
                            {contract.updatedAt}
                          </p>
                        </td>
                        <td className="p-4 text-right">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={() => {
                              setSelectedContractUrl(contract.contractUrl);
                              setSelectedContractName(contract.serviceUserName);
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#003366] bg-[#003366]/5 hover:bg-[#003366]/10 px-3 py-1.5 rounded-lg border border-[#003366]/10 transition"
                          >
                            <span>{isAm ? "ውሉን ይመልከቱ" : "Review Contract"}</span>
                            <ArrowUpRight size={14} />
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}

        {/* 4. DMS (Document Management System) Tab Panel Implementation */}
        {activeTab === "dms" && (
          <div className="space-y-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,image/png,image/jpeg,image/jpg,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
              onChange={handleOrganizationDocumentFileSelected}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-[#003366]/10 bg-[#003366]/5 p-3 text-sm text-[#003366]"
            >
              <strong>{isAm ? "ለኤችአር አስተዳዳሪዎች ማሳሰቢያ:" : "Note for HR Managers:"}</strong> {isAm ? "ዝማኔው ያልተረጋገጠውን የድርጅት ሰነድ ይተካና አዲሱን ፋይል በዝማኔ ስም መቅድም ያስቀምጣል።" : "Update replaces the selected unverified organization document and saves the new file with an update-specific filename prefix."}
            </motion.div>
            {documentUpdateFile && documentReplacementTarget && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-6">
                <div className="w-full max-w-lg rounded-[32px] bg-white shadow-2xl ring-1 ring-slate-200 overflow-hidden">
                  <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
                        <Eye size={20} />
                      </div>
                    <div>
                      <p className="text-sm font-bold text-[#003366]">
                        {isAm ? "የሰነድ ዝማኔ ያረጋግጡ" : "Confirm document update"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {isAm ? "የተመረጠውን ፋይል ይመልከቱ፣ ከዚያ ያልተረጋገጠውን ሰነድ ለመተካት ያረጋግጡ።" : "Preview the selected file, then confirm to replace the unverified document."}
                      </p>
                    </div>
                    </div>
                    <button
                      type="button"
                      onClick={closeDocumentUpdateModal}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-100"
                      aria-label="Cancel update"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="space-y-4 px-5 py-5">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {documentReplacementTarget.docName}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {isAm ? "የሚሰቀል ፋይል:" : "File to upload:"} {documentUpdateFile.name}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-white p-3 text-blue-700 border border-blue-100">
                          <FileText size={20} />
                        </div>
                      </div>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white p-4">
                      <p className="text-sm font-bold text-[#003366] mb-2">
                        {isAm ? "ቅድመ እይታ" : "Preview"}
                      </p>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                        {documentUpdatePreviewUrl ? (
                          <div className="space-y-3">
                            <p className="text-xs text-slate-500">
                              {isAm ? "ቅድመ እይታ ከተመረጠው ፋይል የመነጨ ነው። እስኪያረጋግጡ ድረስ አይላክም።" : "Preview is generated from the selected file. It will not be sent until you confirm."}
                            </p>
                            <a
                              href={documentUpdatePreviewUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 rounded-full bg-[#003366] text-white px-3 py-2 font-bold hover:bg-[#001F3F] text-xs"
                            >
                              <Eye size={16} />
                              {isAm ? "ቅድመ እይታ ይክፈቱ" : "Open Preview"}
                            </a>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">
                            {isAm ? "ለማረጋገጥ አዲስ ሰነድ ይምረጡ።" : "Select a new document to preview before confirming."}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={closeDocumentUpdateModal}
                      className="flex-1 rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100"
                    >
                      {isAm ? "ይቀለል" : "Cancel"}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={confirmDocumentUpdate}
                      className="flex-1 rounded-3xl bg-gradient-to-r from-[#003366] to-[#001F3F] px-4 py-3 text-sm font-bold text-white hover:shadow-md"
                    >
                      {isAm ? "ዝማኔ ያረጋግጡ" : "Confirm Update"}
                    </motion.button>
                  </div>
                </div>
              </div>
            )}
            {/* Top Info Cards specific to Document Control */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: isAm ? "መሰረታዊ መዝገቦች" : "Basic Records", value: `${basicDocs.length} ${isAm ? "ቋሚ" : "Permanent"}`, icon: FileText, delay: 0.1, bg: "from-[#003366] to-[#001F3F]" },
                { title: isAm ? "ዓመታዊ አስተዳደር" : "Yearly Managed", value: `${yearlyDocs.length} ${isAm ? "ዓመታዊ ዑደቶች" : "Annual Cycles"}`, icon: Calendar, delay: 0.2, bg: "from-[#003366] to-[#001F3F]" },
                { title: isAm ? "የሚፈለግ እርምጃ" : "Action Required", value: `${alertDocsCount} ${isAm ? "ማስጠንቀቂያዎች" : "Alerts"}`, icon: AlertTriangle, delay: 0.3, bg: "from-[#003366] to-[#001F3F]" },
              ].map((card) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: card.delay }}
                  whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(0,51,102,0.12)" }}
                  className="bg-gradient-to-br from-white to-[#f8faff] p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-[#FFD700]/40 transition-all duration-300"
                >
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${card.bg} shrink-0`}>
                    <card.icon className="h-6 w-6 text-[#FFD700]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#003366] uppercase tracking-wider">{card.title}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-0.5">{card.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Split Grid for Developer-Preferred Structured DMS File System */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Box A: Basic Foundational Items */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="p-4 bg-gray-50/70 border-b border-gray-200 flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-[#003366] text-sm">
                        {isAm ? "መሰረታዊ / ህጋዊ ማረጋገጫዎች" : "Basic / Statutory Credentials"}
                      </h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {isAm ? "ቋሚ የድርጅት መሰረታዊ መዝገብ ሰነዶች።" : "Permanent organizational foundational registry documents."}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-[#003366]/10 text-[#003366] px-2 py-0.5 rounded font-mono font-bold">
                        {isAm ? "የማይለወጥ" : "Immutable"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setBasicDocsExpanded((prev) => !prev)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        aria-label={
                          basicDocsExpanded
                            ? isAm ? "የሰነድ ዝርዝር ዘጋ" : "Collapse document list"
                            : isAm ? "የሰነድ ዝርዝር ዘርጋ" : "Expand document list"
                        }
                      >
                        {basicDocsExpanded ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                  {basicDocsExpanded ? (
                    <div className="divide-y divide-gray-100">
                      {basicDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-4 hover:bg-gray-50/30 transition flex flex-col sm:flex-row justify-between sm:items-center gap-2"
                        >
                          <div>
                            <p className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                              <FileText size={14} className="text-slate-500" />
                              <span>{doc.documentName}</span>
                              <span
                                className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                  doc.isVerified
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-amber-100 text-amber-700"
                                }`}
                              >
                                {doc.isVerified ? "Verified" : "Pending"}
                              </span>
                              {doc.documentNameAmharic && (
                                <span
                                  className="text-xs text-gray-400 ml-2"
                                  style={{ fontFamily: "Nyala, sans-serif" }}
                                >
                                  {doc.documentNameAmharic}
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-gray-500 mt-1">
                              {isAm ? "ማጣቀሻ:" : "Ref:"}{" "}
                              <span className="font-mono text-gray-700 font-medium">
                                {doc.referenceNumber}
                              </span>{" "}
                              • {isAm ? "የተመዘገበ:" : "Filed:"} {doc.issuedDate}
                            </p>
                          </div>
                          <div className="flex sm:flex-col items-start sm:items-end justify-between gap-2 shrink-0">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedDocUrl(doc.fileUrl);
                                  setSelectedDocName(doc.documentName);
                                }}
                                className="text-xxs text-blue-600 font-medium inline-flex items-center gap-1 hover:underline hover:cursor-pointer"
                              >
                                <span>{isAm ? "ክፈት" : "Open"}</span>
                                <ArrowUpRight size={12} />
                              </button>
                              {(() => {
                                const key = Number(doc.id);
                                const loading = !!documentActionLoading[key];
                                const shouldVerify = !doc.isVerified;
                                return (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (isOrgHrManager && !doc.isVerified) {
                                          triggerOrganizationDocumentUpdate(
                                            doc,
                                          );
                                        } else {
                                          toggleDocumentVerification(
                                            key,
                                            shouldVerify,
                                            "organization",
                                          );
                                        }
                                      }}
                                      disabled={
                                        loading ||
                                        (isOrgHrManager && doc.isVerified)
                                      }
                                      className={`text-xs font-medium hover:cursor-pointer px-2 py-1 rounded transition ${
                                        isOrgHrManager
                                          ? doc.isVerified
                                            ? "border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                                            : `border border-emerald-200 ${loading ? "bg-emerald-100 text-emerald-400 cursor-not-allowed" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`
                                          : doc.isVerified
                                            ? `border border-red-200 ${loading ? "bg-red-100 text-red-400 cursor-not-allowed" : "bg-red-50 text-red-700 hover:bg-red-100"}`
                                            : `border border-emerald-200 ${loading ? "bg-emerald-100 text-emerald-400 cursor-not-allowed" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`
                                      }`}
                                    >
                                      {getOrganizationDocumentActionLabel(
                                        doc,
                                        loading,
                                      )}
                                    </button>
                                    {!isOrgHrManager && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          deleteOrganizationDocument(
                                            key,
                                            doc.documentName,
                                          )
                                        }
                                        disabled={loading}
                                        className={`text-xs font-medium hover:cursor-pointer px-2 py-1 rounded transition border ${
                                          loading
                                            ? "border-red-200 bg-red-100 text-red-400 cursor-not-allowed"
                                            : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                                        } inline-flex items-center gap-1`}
                                      >
                                        <Trash2 size={12} />
                                        {loading ? (isAm ? "በማስወገድ ላይ..." : "Deleting...") : (isAm ? "አስወግድ" : "Delete")}
                                      </button>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold border rounded ${getDmsBadgeStyles(doc.status)}`}
                            >
                              {translateDocStatus(doc.status)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="p-3 bg-gray-50/30 border-t text-right">
                  <button className="text-xs bg-[#003366] text-white font-bold py-1 px-2.5 rounded-md hover:bg-[#001F3F] transition shadow-sm">
                    {isAm ? "መሰረታዊ ሰነድ ያስገቡ" : "Upload Base Doc"}
                  </button>
                </div>
              </div>

              {/* Box B: Yearly Renewed Items */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-[#f8faff] border-b border-gray-200 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-[#003366] text-sm">
                        {isAm ? "ዓመታዊ የታደሱ ሰነዶች" : "Yearly Renewed Documents"}
                      </h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {isAm ? "ወቅታዊ የምስክር ወረቀቶች በህግ መሰረት የሚታደሱ" : "Time-bound certifications subject to cyclical statutory renewal checks."}
                      </p>
                    </div>
                    <span className="text-[10px] bg-[#003366]/10 text-[#003366] px-2 py-0.5 rounded font-mono font-bold">
                      {isAm ? "ዓመታዊ ኦዲት" : "Annual Audit"}
                    </span>
                  </div>
                  <div className="space-y-2 p-4">
                    {/* Group yearly documents by year */}
                    {Object.entries(
                      yearlyDocs.reduce((acc: Record<string, any[]>, d) => {
                        const year =
                          new Date(d.issuedDate).getFullYear() || "Unknown";
                        acc[year] = acc[year] || [];
                        acc[year].push(d);
                        return acc;
                      }, {}),
                    ).map(([year, docsForYear]) => (
                      <details key={year} className="border rounded-lg">
                        <summary className="px-4 py-2 bg-gray-50 cursor-pointer font-bold text-[#003366]">
                          {year} {isAm ? "የእድሳት ሰነዶች" : "Renewal Documents"} ({docsForYear.length})
                        </summary>
                        <div className="divide-y">
                          {docsForYear.map((doc: any) => (
                            <div
                              key={doc.id}
                              className="p-3 flex items-center justify-between gap-3"
                            >
                              <div>
                                <p className="font-medium text-sm flex items-center gap-2">
                                  <FileText
                                    size={14}
                                    className="text-slate-500"
                                  />
                                  <span>{doc.documentName}</span>
                                  <span
                                    className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                      doc.isVerified
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-amber-100 text-amber-700"
                                    }`}
                                  >
                                {doc.isVerified ? (isAm ? "የተረጋገጠ" : "Verified") : (isAm ? "በመጠባበቅ ላይ" : "Pending")}
                                  </span>
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {isAm ? "ማጣቀሻ:" : "Ref:"}{" "}
                                  <span className="font-mono">
                                    {doc.referenceNumber}
                                  </span>
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedDocUrl(doc.fileUrl);
                                    setSelectedDocName(doc.documentName);
                                  }}
                                  className="text-xxs text-[#003366] hover:underline cursor-pointer flex items-center gap-1 font-bold"
                                >
                                  {isAm ? "ክፈት" : "Open"} <ArrowUpRight size={12} />
                                </button>
                                {(() => {
                                  const key = Number(doc.id);
                                  const loading = !!documentActionLoading[key];
                                  const shouldVerify = !doc.isVerified;
                                  return (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (
                                            isOrgHrManager &&
                                            !doc.isVerified
                                          ) {
                                            triggerOrganizationDocumentUpdate(
                                              doc,
                                            );
                                          } else {
                                            toggleDocumentVerification(
                                              key,
                                              shouldVerify,
                                              "organization",
                                            );
                                          }
                                        }}
                                        disabled={
                                          loading ||
                                          (isOrgHrManager && doc.isVerified)
                                        }
                                        className={`text-xs font-medium px-2 py-1 rounded transition ${
                                          isOrgHrManager
                                            ? doc.isVerified
                                              ? "border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                                              : `border border-emerald-200 ${loading ? "bg-emerald-100 text-emerald-400 cursor-not-allowed" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`
                                            : doc.isVerified
                                              ? `border border-red-200 ${loading ? "bg-red-100 text-red-400 cursor-not-allowed" : "bg-red-50 text-red-700 hover:bg-red-100"}`
                                              : `border border-emerald-200 ${loading ? "bg-emerald-100 text-emerald-400 cursor-not-allowed" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`
                                        }`}
                                      >
                                        {getOrganizationDocumentActionLabel(
                                          doc,
                                          loading,
                                        )}
                                      </button>
                                      {!isOrgHrManager && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            deleteOrganizationDocument(
                                              key,
                                              doc.documentName,
                                            )
                                          }
                                          disabled={loading}
                                          className={`text-xs font-medium px-2 py-1 rounded transition border ${
                                            loading
                                              ? "border-red-200 bg-red-100 text-red-400 cursor-not-allowed"
                                              : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                                          } inline-flex items-center gap-1`}
                                        >
                                          <Trash2 size={12} />
                                          {loading ? (isAm ? "እየሰረዘ..." : "Deleting...") : (isAm ? "ሰርዝ" : "Delete")}
                                        </button>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
                <div className="p-3 bg-gray-50/30 border-t text-right">
                  <button className="text-xs bg-gradient-to-r from-[#003366] to-[#001F3F] text-white font-bold py-1 px-2.5 rounded-md hover:shadow-md transition flex items-center gap-1 inline-flex ml-auto">
                    <Plus size={12} /> {isAm ? "የፋይል እድሳት" : "File Renewal"}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {showAppendContract && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setShowAppendContract(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="relative bg-gradient-to-r from-[#003366] to-[#001F3F] p-5">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD700] via-[#C5A022] to-[#FFD700]" />
                <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-[#FFD700]/5" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#FFD700]/20 flex items-center justify-center">
                      <Plus className="w-4 h-4 text-[#FFD700]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        {isAm ? "አዲስ ውል ያክሉ" : "Append Contract"}
                      </h3>
                      <p className="text-[10px] text-white/50 font-medium">
                        {isAm ? "አዲስ የአገልግሎት ውል ያስገቡ" : "Enter new service contract details"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAppendContract(false)}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-6 max-h-[calc(100vh-10rem)] overflow-y-auto space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#003366] mb-1.5 block">
                    {isAm ? "የደንበኛ ስም" : "Client Name"} <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newContract.serviceUserName}
                    onChange={(e) => setNewContract({ ...newContract, serviceUserName: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]/50 outline-none transition-all"
                    placeholder={isAm ? "የድርጅት ስም ያስገቡ" : "Enter organization name"}
                  />
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-[#003366]" />
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#003366]">
                      {isAm ? "የአገልግሎት ቦታ አድራሻ" : "Site Address"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <SearchableLocationSelect
                      label={isAm ? "ክልል" : "Region"}
                      placeholder={isAm ? "ክልል ይምረጡ..." : "Select region..."}
                      searchPlaceholder={isAm ? "ክልል ይፈልጉ..." : "Search region..."}
                      value={newContract.region}
                      options={contractRegions}
                      isOpen={regionOpen}
                      onToggle={() => { if (!regionOpen) { setContractZones([]); setContractWoredas([]); setContractKebeles([]); } setRegionOpen(!regionOpen); setRegionSearch(""); }}
                      onSelect={(val) => { handleContractRegionChange(val); setRegionOpen(false); setRegionSearch(""); }}
                      onClear={() => { handleContractRegionChange(""); setRegionOpen(false); setRegionSearch(""); }}
                      searchTerm={regionSearch}
                      onSearchChange={setRegionSearch}
                      innerRef={contractRefs.region}
                    />
                    <SearchableLocationSelect
                      label={isAm ? "ዞን/ከተማ" : "Zone/Sub-city"}
                      placeholder={isAm ? "ዞን ይምረጡ..." : "Select zone..."}
                      searchPlaceholder={isAm ? "ዞን ይፈልጉ..." : "Search zone..."}
                      value={newContract.zone}
                      options={contractZones}
                      disabled={!newContract.region}
                      isOpen={zoneOpen}
                      onToggle={() => { setZoneOpen(!zoneOpen); setZoneSearch(""); }}
                      onSelect={(val) => { handleContractZoneChange(val); setZoneOpen(false); setZoneSearch(""); }}
                      onClear={() => { handleContractZoneChange(""); setZoneOpen(false); setZoneSearch(""); }}
                      searchTerm={zoneSearch}
                      onSearchChange={setZoneSearch}
                      innerRef={contractRefs.zone}
                    />
                    <SearchableLocationSelect
                      label={isAm ? "ወረዳ" : "Woreda"}
                      placeholder={isAm ? "ወረዳ ይምረጡ..." : "Select woreda..."}
                      searchPlaceholder={isAm ? "ወረዳ ይፈልጉ..." : "Search woreda..."}
                      value={newContract.woreda}
                      options={contractWoredas}
                      disabled={!newContract.zone}
                      isOpen={woredaOpen}
                      onToggle={() => { setWoredaOpen(!woredaOpen); setWoredaSearch(""); }}
                      onSelect={(val) => { handleContractWoredaChange(val); setWoredaOpen(false); setWoredaSearch(""); }}
                      onClear={() => { handleContractWoredaChange(""); setWoredaOpen(false); setWoredaSearch(""); }}
                      searchTerm={woredaSearch}
                      onSearchChange={setWoredaSearch}
                      innerRef={contractRefs.woreda}
                    />
                    <SearchableLocationSelect
                      label={isAm ? "ቀበሌ" : "Kebele"}
                      placeholder={isAm ? "ቀበሌ ይምረጡ..." : "Select kebele..."}
                      searchPlaceholder={isAm ? "ቀበሌ ይፈልጉ..." : "Search kebele..."}
                      value={newContract.kebele}
                      options={contractKebeles}
                      disabled={!newContract.woreda}
                      isOpen={kebeleOpen}
                      onToggle={() => { setKebeleOpen(!kebeleOpen); setKebeleSearch(""); }}
                      onSelect={(val) => { setNewContract((prev: any) => ({ ...prev, kebele: val })); setKebeleOpen(false); setKebeleSearch(""); }}
                      onClear={() => { setNewContract((prev: any) => ({ ...prev, kebele: "" })); setKebeleOpen(false); setKebeleSearch(""); }}
                      searchTerm={kebeleSearch}
                      onSearchChange={setKebeleSearch}
                      innerRef={contractRefs.kebele}
                    />
                    <div>
                      <label className="text-[9px] uppercase tracking-[0.1em] font-bold text-[#003366] mb-1 block">
                        {isAm ? "የቤት ቁጥር" : "House Number"} <span className="text-orange-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newContract.houseNumber}
                        onChange={(e) => setNewContract({ ...newContract, houseNumber: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]/50 outline-none transition-all"
                        placeholder={isAm ? "ለምሳሌ ቤት 123" : "e.g. House 123"}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase tracking-[0.1em] font-bold text-[#003366] mb-1 block">
                        {isAm ? "ልዩ ቦታ" : "Special Location"} <span className="text-[9px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded ml-1">{isAm ? "አማራጭ" : "OPTIONAL"}</span>
                      </label>
                      <input
                        type="text"
                        value={newContract.specialLocation}
                        onChange={(e) => setNewContract({ ...newContract, specialLocation: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]/50 outline-none transition-all"
                        placeholder={isAm ? "ልዩ ምልክት..." : "Near landmark..."}
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#003366] mb-1.5 block">
                      {isAm ? "የተመደቡ ጠባቂዎች" : "Assigned Guards"} <span className="text-orange-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newContract.assignedPersonnelCount}
                      onChange={(e) => setNewContract({ ...newContract, assignedPersonnelCount: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]/50 outline-none transition-all"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#003366] mb-1.5 block">
                      {isAm ? "ሁኔታ" : "Status"} <span className="text-orange-500">*</span>
                    </label>
                    <select
                      value={newContract.status}
                      onChange={(e) => setNewContract({ ...newContract, status: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]/50 outline-none transition-all"
                    >
                      <option value="Active">Active</option>
                      <option value="Expiring Soon">Expiring Soon</option>
                      <option value="Expired">Expired</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#003366] mb-1.5 block">
                    {isAm ? "የውል መጀመሪያ ቀን" : "Contract Start Date"} <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newContract.contractStartDate}
                    onChange={(e) => setNewContract({ ...newContract, contractStartDate: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]/50 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#003366] mb-1.5 block">
                    {isAm ? "የውል ሰነድ" : "Contract Document"} <span className="text-orange-500">*</span>
                  </label>
                  {newContract.contractDoc ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200">
                        <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate">{newContract.contractDoc.name}</p>
                          <p className="text-xs text-gray-500">{(newContract.contractDoc.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button
                          onClick={() => {
                            const url = URL.createObjectURL(newContract.contractDoc);
                            setSelectedContractUrl(url);
                            setSelectedContractName(newContract.contractDoc.name);
                          }}
                          className="w-8 h-8 rounded-lg bg-white border border-blue-200 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors"
                          title={isAm ? "ተመልከት" : "Preview"}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setNewContract({ ...newContract, contractDoc: null })}
                          className="w-8 h-8 rounded-lg bg-white border border-red-200 flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                          title={isAm ? "ሰርዝ" : "Cancel"}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border-2 border-dashed border-gray-300 text-sm font-semibold text-gray-500 hover:border-[#003366]/50 hover:bg-[#003366]/5 cursor-pointer transition-all">
                      <Upload className="w-4 h-4" />
                      {isAm ? "ፋይል ይምረጡ" : "Choose File"}
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setNewContract({ ...newContract, contractDoc: e.target.files?.[0] || null })}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <div className="flex gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAppendContract(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    {isAm ? "ሰርዝ" : "Cancel"}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (!newContract.serviceUserName.trim() || !newContract.region || !newContract.zone || !newContract.woreda || !newContract.kebele || !newContract.houseNumber || !newContract.contractStartDate || !newContract.contractDoc || newContract.assignedPersonnelCount <= 0) return;
                      const now = new Date().toISOString().slice(0, 10);
                      const contractFileName = newContract.contractDoc ? newContract.contractDoc.name : "";
                      const fullAddress = `${newContract.region}, ${newContract.zone}, ${newContract.woreda}, ${newContract.kebele}, ${newContract.houseNumber}${newContract.specialLocation ? `, ${newContract.specialLocation}` : ""}`;
                      setSelectedOrg((prev) => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          serviceContracts: [
                            ...prev.serviceContracts,
                            { id: Date.now(), serviceUserName: newContract.serviceUserName, addressText: fullAddress, assignedPersonnelCount: newContract.assignedPersonnelCount, status: newContract.status, contractUrl: contractFileName, createdAt: newContract.contractStartDate || now, updatedAt: now },
                          ],
                        };
                      });
                      setNewContract({ serviceUserName: "", region: "", zone: "", woreda: "", kebele: "", houseNumber: "", specialLocation: "", assignedPersonnelCount: 0, status: "Active", contractStartDate: "", contractDoc: null });
                      setShowAppendContract(false);
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#003366] to-[#001F3F] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all"
                  >
                    {isAm ? "ውል ያስገቡ" : "Add Contract"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {selectedEmployee && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-7xl max-h-[90vh] overflow-hidden rounded-[32px] bg-white shadow-2xl ring-1 ring-slate-200"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6 sm:py-5">
                <div>
                  <h2 className="text-xl font-bold text-[#003366]">
                    {isAm ? "የሰራተኛ ዝርዝር መረጃ" : "Personnel Details"}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1 uppercase">
                    {isAm ? "የተሟላ የሰራተኛ መረጃ ለ:" : "Detailed employee profile for:"}{" "}
                    <strong>{selectedEmployee.fullName}</strong>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEmployee(null)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-600 transition hover:bg-slate-100"
                  aria-label={isAm ? "ዝርዝር መረጃ ዝጋ" : "Close detail modal"}
                >
                  ✕
                </button>
              </div>
              <div className="grid gap-5 p-4 sm:p-6 grid-cols-1 lg:grid-cols-3 max-h-[calc(90vh-7.5rem)] overflow-y-auto">
                <div className="space-y-4 rounded-3xl bg-slate-50 p-4 sm:p-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#003366] font-bold">
                      {isAm ? "የግል መረጃ" : "Personal Profile"}
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      <span className="font-bold text-[#003366]">{isAm ? "ሙሉ ስም:" : "Full Name:"}</span>{" "}
                      {selectedEmployee.fullName}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      <span className="font-bold text-[#003366]">{isAm ? "ጾታ:" : "Gender:"}</span>{" "}
                      {selectedEmployee.gender || "---"}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      <span className="font-bold text-[#003366]">{isAm ? "ዜግነት:" : "Citizenship:"}</span>{" "}
                      {selectedEmployee.citizenship || "---"}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      <span className="font-bold text-[#003366]">{isAm ? "ዕድሜ:" : "Age:"}</span>{" "}
                      {selectedEmployee.age ?? "---"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#003366] font-bold">
                      {isAm ? "ልምድ" : "Experience"}
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      <span className="font-bold text-[#003366]">{isAm ? "የስራ ልምድ:" : "Work Experience:"}</span>{" "}
                      {selectedEmployee.workExpYears} {isAm ? "ዓመታት" : "years"}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      <span className="font-bold text-[#003366]">{isAm ? "አጠቃላይ ልምድ:" : "Total Experience:"}</span>{" "}
                      {selectedEmployee.totalExpYears ??
                        selectedEmployee.workExpYears}{" "}
                      {isAm ? "ዓመታት" : "years"}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      <span className="font-bold text-[#003366]">{isAm ? "ትምህርት:" : "Education:"}</span>{" "}
                      {selectedEmployee.educationLevel || (isAm ? "አልተገለጸም" : "Not specified")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#003366] font-bold">
                      {isAm ? "አደጋ እና አካባቢ" : "Risk & Location"}
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      <span className="font-bold text-[#003366]">{isAm ? "በጥቁር ዝርዝር ውስጥ:" : "Blacklisted:"}</span>{" "}
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${
                          selectedEmployee.isBlacklisted
                            ? "bg-red-100 text-red-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {selectedEmployee.isBlacklisted ? (isAm ? "አዎ" : "Yes") : (isAm ? "አይ" : "No")}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="space-y-4 rounded-3xl bg-slate-50 p-4 sm:p-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#003366] font-bold">
                      {isAm ? "ግንኙነት እና ሚና" : "Contact & Role"}
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      <span className="font-bold text-[#003366]">{isAm ? "ኢሜይል:" : "Email:"}</span>{" "}
                      {selectedEmployee.email}
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      <span className="font-bold text-[#003366]">{isAm ? "ስልክ ቁጥር:" : "Phone Number:"}</span>{" "}
                      {selectedEmployee.phone || (isAm ? "አልተሟላም" : "Not provided")}
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      <span className="font-bold text-[#003366]">{isAm ? "የፋይዳ ቁጥር:" : "FAN Number:"}</span>{" "}
                      {selectedEmployee.faydaId || (isAm ? "አልተሟላም" : "Not provided")}
                    </p>
                    <p className="mt-1 text-sm text-slate-700 mb-2">
                      <span className="font-bold text-[#003366]">{isAm ? "ሀላፊነት:" : "Position:"}</span>{" "}
                      {selectedEmployee.positionName || (isAm ? "አልተመደበም" : "Unassigned")}
                    </p>
                    {selectedEmployee.addressId && (
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-[#003366] font-bold">
                          {isAm ? "የአድራሻ ዝርዝሮች" : "Address Details"}
                        </p>
                        {addressLoading ? (
                          <p className="mt-2 text-sm text-slate-600 italic">
                            {isAm ? "የአድራሻ ዝርዝሮችን በመጫን ላይ..." : "Loading address details..."}
                          </p>
                        ) : addressDetails ? (
                          <div className="mt-2 space-y-1">
                            {addressDetails.regionName && (
                              <p className="text-sm text-slate-700">
                                <span className="font-bold text-[#003366]">{isAm ? "ክልል:" : "Region:"}</span>{" "}
                                {addressDetails.regionName}
                              </p>
                            )}
                            {addressDetails.zoneName && (
                              <p className="text-sm text-slate-700">
                                <span className="font-bold text-[#003366]">{isAm ? "ክፍለ ከተማ/ዞን:" : "Subcity/Zone:"}</span>{" "}
                                {addressDetails.zoneName}
                              </p>
                            )}
                            {addressDetails.woredaName && (
                              <p className="text-sm text-slate-700">
                                <span className="font-bold text-[#003366]">{isAm ? "ወረዳ:" : "Woreda:"}</span>{" "}
                                {addressDetails.woredaName}
                              </p>
                            )}
                            {addressDetails.kebeleName && (
                              <p className="text-sm text-slate-700">
                                <span className="font-bold text-[#003366]">{isAm ? "ቀበሌ:" : "Kebele:"}</span>{" "}
                                {addressDetails.kebeleName}
                              </p>
                            )}
                            {addressDetails.houseNumber && (
                              <p className="text-sm text-slate-700">
                                <span className="font-bold text-[#003366]">{isAm ? "የቤት ቁጥር:" : "House Number:"}</span>{" "}
                                {addressDetails.houseNumber}
                              </p>
                            )}
                            {addressDetails.specialLocation && (
                              <p className="text-sm text-slate-700">
                                <span className="font-bold text-[#003366]">
                                  {isAm ? "ልዩ ቦታ:" : "Special Location:"}
                                </span>{" "}
                                {addressDetails.specialLocation}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="mt-2 text-sm text-slate-500 italic">
                            {isAm ? "ምንም የአድራሻ ዝርዝር አልተገኘም" : "No address details found"}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#003366] font-bold">
                      {isAm ? "የስራ ሁኔታ" : "Employment"}
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      <span className="font-bold text-[#003366]">{isAm ? "ሁኔታ:" : "Status:"}</span>{" "}
                      {selectedEmployee.employmentStatus || (isAm ? "ያልታወቀ" : "Unknown")}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      <span className="font-bold text-[#003366]">{isAm ? "የተጀመረበት:" : "Started:"}</span>{" "}
                      {selectedEmployee.employmentStartDate ?? "—"}
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl bg-white border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col">
                  <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 mb-4">
                    <div>
                      <h3 className="text-base font-bold text-[#003366]">
                        {isAm ? "የሰራተኛ ሰነዶች" : "Personnel Documents"}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {isAm ? "ለዚህ ሰራተኛ የተሰቀሉ የስራ ሰነዶች።" : "Employment documents uploaded for this employee."}
                      </p>
                    </div>
                    <span className="text-xs uppercase tracking-[0.22em] text-slate-500">
                      {selectedEmployee.documents?.length ?? 0} {isAm ? "ሰነድ" : "document"}
                      {(selectedEmployee.documents?.length ?? 0) !== 1
                        ? (isAm ? "ዎች" : "s")
                        : ""}
                    </span>
                  </div>
                  {selectedEmployee.documents &&
                  selectedEmployee.documents.length > 0 ? (
                    <div className="space-y-2 flex-1 overflow-y-auto">
                      {selectedEmployee.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-3 flex flex-col gap-2"
                        >
                          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                            <FileText size={16} className="text-slate-500" />
                            <span>{doc.documentType}</span>
                            <span
                              className={`inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-semibold ${getDocumentBadgeStyle(doc.isVerified)}`}
                            >
                              {doc.isVerified ? (isAm ? "የተረጋገጠ" : "Verified") : (isAm ? "በመጠባበቅ ላይ" : "Pending")}
                            </span>
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedDocUrl(doc.fileUrl);
                                  setSelectedDocName(doc.documentType);
                                }}
                                className="inline-flex items-center justify-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold hover:bg-[#003366]/5 hover:border-[#003366]/20 transition text-[#003366]"
                              >
                                {isAm ? "ዝርዝር ይመልከቱ" : "View Details"}
                              </button>
                              {doc.isVerified ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleDocumentVerification(doc.id, false)
                                  }
                                  disabled={!!documentActionLoading[doc.id]}
                                  className={`inline-flex items-center justify-center gap-1 rounded-full border px-2.5 py-1.5 text-xs font-semibold transition ${
                                    documentActionLoading[doc.id]
                                      ? "border-red-200 bg-red-100 text-red-400 cursor-not-allowed"
                                      : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                                  }`}
                                >
                                  {documentActionLoading[doc.id]
                                    ? (isAm ? "በማዘመን ላይ..." : "Updating...")
                                    : (isAm ? "ያልተረጋገጠ አድርግ" : "Mark Unverified")}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleDocumentVerification(doc.id, true)
                                  }
                                  disabled={!!documentActionLoading[doc.id]}
                                  className={`inline-flex items-center justify-center gap-1 rounded-full border px-2.5 py-1.5 text-xs font-semibold transition ${
                                    documentActionLoading[doc.id]
                                      ? "border-emerald-200 bg-emerald-100 text-emerald-400 cursor-not-allowed"
                                      : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                  }`}
                                >
                                  {documentActionLoading[doc.id]
                                    ? (isAm ? "በማዘመን ላይ..." : "Updating...")
                                    : (isAm ? "የተረጋገጠ አድርግ" : "Mark Verified")}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-500 flex-1 flex items-center justify-center">
                      {isAm ? "ምንም ሰነዶች የሉም" : "No documents"}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setSelectedEmployee(null)}
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                >
                  {isAm ? "ዝጋ" : "Close"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === "operations" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm"
            >
              <div className="flex items-center gap-2 text-[#003366] font-bold">
                <AlertTriangle className="text-[#003366]" size={20} />
                <span>{isAm ? "የተመዘገቡ የስነምግባር ጥሰት ሪፖርቶች" : "Logged Incident Misconduct Case Reports"}</span>
              </div>
            </motion.div>

            {org.incidents.map((incident, idx) => (
              <motion.div
                key={incident.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                whileHover={{ boxShadow: "0 8px 30px rgba(0,51,102,0.08)" }}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
              >
                <div className="bg-gradient-to-r from-gray-50 to-[#f8faff] px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h4 className="text-base font-bold text-[#003366]">
                    {incident.crimeCategory}
                  </h4>
                  <span
                    className={`px-2.5 py-1 text-xs font-bold rounded-full border ${getStatusStyles(incident.federalPoliceStatus)}`}
                  >
                    {incident.federalPoliceStatus}
                  </span>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {incident.incidentDescription}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Selected Employee Document Preview Modal */}
      {selectedDocUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex  items-center justify-center p-3 sm:p-4 bg-black/70"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-7xl h-[95vh] sm:h-[92vh] md:h-[88vh] lg:h-[85vh] rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="flex items-center pl-7 justify-between gap-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h2 className="text-lg font-bold text-[#003366]">
                  {isAm ? "የሰነድ ቅድመ እይታ ለ" : "Document Preview for"} {selectedDocName || (isAm ? "የሰራተኛ ሰነድ" : "Employee Document")}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedDocUrl(null);
                  setSelectedDocName("");
                }}
                className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-100"
                aria-label={isAm ? "የሰነድ ቅድመ እይታ ዝጋ" : "Close document preview"}
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <DocumentPreviewer
                url={selectedDocUrl}
                fileName={selectedDocName || "Employee Document"}
                className="h-full w-full border-none rounded-none"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <p className="text-xs text-slate-500 order-2 sm:order-1">
                {isAm ? "ቅድመ እይታ የአሳሽ መመልከቻን ይጠቀማል። ሙሉ ለማየት ወይም ለማውረድ ውጪ ይክፈቱ።" : "Preview uses the browser viewer. Open externally to download or inspect in full."}
              </p>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => {
                  setSelectedDocUrl(null);
                  setSelectedDocName("");
                }}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 order-1 sm:order-2"
              >
                {isAm ? "ቅድመ እይታ ዝጋ" : "Close Preview"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Contract Document Preview Modal */}
      {selectedContractUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full  max-w-6xl h-[95vh] sm:h-[92vh] md:h-[88vh] lg:h-[98vh] rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-center pl-7 justify-between gap-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h2 className="text-lg font-bold text-[#003366]">
                  {isAm ? "የውል ሰነድ ቅድመ እይታ ለ" : "Contract Document Preview for"}{" "}
                  {selectedContractName || (isAm ? "የውል ሰነድ" : "Contract Document")}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedContractUrl(null);
                  setSelectedContractName("");
                }}
                className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-100"
                aria-label={isAm ? "የቅድመ እይታ መስኮት ዝጋ" : "Close preview modal"}
              >
                <X size={20} />
              </button>
            </div>

            {/* Document Previewer */}
            <div className="flex-1 overflow-hidden">
              {selectedContractUrl ? (
                <DocumentPreviewer
                  url={selectedContractUrl}
                  fileName={selectedContractName || "Contract Document"}
                  className="h-full w-full border-none rounded-none"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-slate-50">
                  <div className="text-center text-slate-500">
                    <FileText
                      size={48}
                      className="mx-auto mb-3 text-slate-300"
                    />
                    <p className="font-bold text-[#003366]">{isAm ? "የሰነድ ዩአርኤል አልተሰጠም" : "No document URL provided"}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <p className="text-xs text-slate-500 order-2 sm:order-1">
                {isAm ? "ሙሉ ማያ ገጽ ለማየት ወይም ለማውረድ \"ውጪ ክፈት\" የሚለውን ይጫኑ።" : "Click \"Open External\" to view the document in full screen or download it."}
              </p>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => {
                  setSelectedContractUrl(null);
                  setSelectedContractName("");
                }}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 order-1 sm:order-2"
              >
                {isAm ? "ቅድመ እይታ ዝጋ" : "Close Preview"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

// Fixed build safety target redundancy fallback export mapping rules:
export default AgenciesManagement;
