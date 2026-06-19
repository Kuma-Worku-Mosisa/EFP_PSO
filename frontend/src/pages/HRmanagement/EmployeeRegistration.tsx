//filepath: frontend/src/pages/HRmanagement/EmployeeRegistration.tsx
import React, { useEffect, useState } from "react";
import {
  User,
  Briefcase,
  FileText,
  CheckCircle2,
  MapPin,
  UploadCloud,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { apiRequest } from "../../lib/api";
import { uploadOrganizationDocuments } from "../../lib/fileUploadHelper";

export default function EmployeeRegistration() {
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    // User Identity
    firstName: "",
    username: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    faydaId: "",

    // HR Details
    gender: "",
    citizenship: "Ethiopian",
    age: "",
    startedDate: "",
    educationLevel: "",
    position: "",
    workExpYears: 0,
    TotalExpYears: 0,

    // Location Data (store ids as strings coming from select values)
    region: "",
    zone: "",
    woreda: "",
    kebele: "",
    houseNo: "",
    specialLocation: "",

    // Documents (Storing file objects or names)
    documents: {} as Record<string, File | null>,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    // Handle experience fields with validation
    if (name === "workExpYears") {
      let numValue = parseInt(value) || 0;
      // Ensure non-negative and max 2 digits (0-99)
      numValue = Math.max(0, Math.min(99, numValue));
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
        // Ensure Total Experience >= Work Experience
        TotalExpYears: Math.max(numValue, prev.TotalExpYears),
      }));
      return;
    }

    if (name === "TotalExpYears") {
      let numValue = parseInt(value) || 0;
      // Ensure non-negative and max 2 digits (0-99)
      numValue = Math.max(0, Math.min(99, numValue));
      // Ensure Total Experience >= Work Experience
      numValue = Math.max(numValue, formData.workExpYears);
      setFormData((prev) => ({ ...prev, [name]: numValue }));
      return;
    }

    // If a parent location changes, clear downstream selections and fetch children
    if (name === "region") {
      setFormData((prev) => ({
        ...prev,
        region: value,
        zone: "",
        woreda: "",
        kebele: "",
      }));
      fetchZones(value);
      setWoredas([]);
      setKebeles([]);
      return;
    }

    if (name === "zone") {
      setFormData((prev) => ({ ...prev, zone: value, woreda: "", kebele: "" }));
      fetchWoredas(value);
      setKebeles([]);
      return;
    }

    if (name === "woreda") {
      setFormData((prev) => ({ ...prev, woreda: value, kebele: "" }));
      fetchKebeles(value);
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    docKey: string,
  ) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({
      ...prev,
      documents: { ...prev.documents, [docKey]: file },
    }));
  };

  // Lists loaded from backend
  const [positions, setPositions] = useState<Array<any>>([]);
  const [regions, setRegions] = useState<Array<any>>([]);
  const [zones, setZones] = useState<Array<any>>([]);
  const [woredas, setWoredas] = useState<Array<any>>([]);
  const [kebeles, setKebeles] = useState<Array<any>>([]);
  const [educationOptions, setEducationOptions] = useState<string[]>([]);
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [organizationName, setOrganizationName] = useState<string>("");
  const [organizationLoadError, setOrganizationLoadError] = useState<
    string | null
  >(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch positions and regions on mount
    fetch("/api/positions")
      .then((r) => r.json())
      .then((payload) => setPositions(payload.data || payload || []))
      .catch((e) => console.error("Failed to load positions", e));

    fetch("/api/location/regions")
      .then((r) => r.json())
      .then((payload) => setRegions(payload.data || payload || []))
      .catch((e) => console.error("Failed to load regions", e));

    const fetchOrganization = async () => {
      try {
        const response = await apiRequest<{
          success: boolean;
          data?: any;
        }>("/employees/my-organization");

        const payload = response.data || response;
        const orgId =
          payload?.organizationId || payload?.id || payload?.organization?.id;
        if (!payload || !orgId) {
          throw new Error("Organization information not available");
        }

        setOrganizationId(Number(orgId));
        setOrganizationName(
          payload.nameEnglish ||
            payload.nameAmharic ||
            payload.name ||
            payload.organization?.nameEnglish ||
            payload.organization?.nameAmharic ||
            "organization",
        );
      } catch (error: any) {
        console.error("Failed to load organization info", error);
        setOrganizationLoadError(
          error?.message ||
            "Unable to determine your organization for registration.",
        );
      }
    };

    fetchOrganization();
  }, []);

  // When a position is selected, fetch its requirements to derive education levels
  useEffect(() => {
    const posId = formData.position;
    if (!posId) {
      setEducationOptions([]);
      return;
    }

    fetch(`/api/positions/${posId}`)
      .then((r) => r.json())
      .then((payload) => {
        const pos = payload.data || payload;
        const reqs = pos?.requirements || [];
        const levels = Array.from(
          new Set(
            reqs
              .map((item: any) => item?.requiredEducationLevel)
              .filter(
                (v: any): v is string =>
                  typeof v === "string" && v.trim().length > 0,
              )
              .map((s: string) => s.trim()),
          ),
        ) as string[];
        setEducationOptions(levels);
        // clear any existing selection whenever position changes
        setFormData((prev) => ({ ...prev, educationLevel: "" }));
      })
      .catch((e) => {
        console.error("Failed to load position details", e);
        setEducationOptions([]);
      });
  }, [formData.position]);

  const fetchZones = (regionId: string) => {
    if (!regionId) return setZones([]);
    fetch(`/api/location/regions/${regionId}/zones`)
      .then((r) => r.json())
      .then((payload) => setZones(payload.data || payload || []))
      .catch((e) => console.error("Failed to load zones", e));
  };

  const fetchWoredas = (zoneId: string) => {
    if (!zoneId) return setWoredas([]);
    fetch(`/api/location/zones/${zoneId}/woredas`)
      .then((r) => r.json())
      .then((payload) => setWoredas(payload.data || payload || []))
      .catch((e) => console.error("Failed to load woredas", e));
  };

  const fetchKebeles = (woredaId: string) => {
    if (!woredaId) return setKebeles([]);
    fetch(`/api/location/woredas/${woredaId}/kebeles`)
      .then((r) => r.json())
      .then((payload) => setKebeles(payload.data || payload || []))
      .catch((e) => console.error("Failed to load kebeles", e));
  };

  // Mock validation handler
  const handleValidate = (field: string) => {
    const value = formData[field as keyof typeof formData] as string;
    const normalizedField = field === "faydaId" ? "faydaId" : field;

    if (!value || typeof value !== "string") {
      alert("Please enter a value before validating.");
      return;
    }

    const queryParams = new URLSearchParams({
      field: normalizedField,
      value,
    });

    fetch(`/api/users/validate?${queryParams.toString()}`)
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.message || "Validation failed");
        }
        const { data } = payload;
        if (data.validFormat === false) {
          alert(data.message);
          return;
        }
        alert(
          data.exists
            ? `${field} is already registered, please choose a different value.`
            : `${field} is available.`,
        );
      })
      .catch((error) => {
        console.error("Validation error:", error);
        alert(error.message || "Validation failed.");
      });
  };

  const nextStep = () => setCurrentStep((p) => Math.min(p + 1, 4));
  const prevStep = () => setCurrentStep((p) => Math.max(p - 1, 1));

  const steps = [
    { number: 1, title: "Account Setup", icon: User },
    { number: 2, title: "HR & Location", icon: Briefcase },
    { number: 3, title: "Documents", icon: FileText },
  ];

  const getCombinedName = () => {
    return [formData.firstName, formData.middleName, formData.lastName]
      .filter(Boolean)
      .join(" ");
  };

  const getUploadRoleForPosition = (positionId: string) => {
    const selectedPosition = positions.find((p) => String(p.id) === positionId);
    const title = String(selectedPosition?.name || "").toLowerCase();

    if (title.includes("manager")) return "manager";
    if (title.includes("administrator") || title.includes("admin"))
      return "administrator";
    if (title.includes("operation")) return "operations";
    if (title.includes("security") || title.includes("guard"))
      return "security_guard";
    return "organization";
  };

  const buildUploadFilesPayload = () => {
    const uploadRole = getUploadRoleForPosition(formData.position);
    return Object.entries(formData.documents).reduce<Record<string, File>>(
      (payload, [docKey, file]) => {
        if (file) {
          payload[`${uploadRole}_${docKey}`] = file;
        }
        return payload;
      },
      {},
    );
  };

  const normalizeUploadedFilesKeys = (
    uploadedFiles: Record<string, string>,
  ): Record<string, string> => {
    const uploadRole = getUploadRoleForPosition(formData.position);
    const result: Record<string, string> = {};

    for (const [fieldName, url] of Object.entries(uploadedFiles)) {
      if (!fieldName) continue;

      if (fieldName.startsWith(`${uploadRole}_`)) {
        const withoutPrefix = fieldName.slice(uploadRole.length + 1);
        // Always include the key without the role prefix so server-side
        // document mapping (e.g. `education`, `fingerprint`) works.
        result[withoutPrefix] = url;

        // For all roles, also keep the prefixed key so the backend move helper
        // can detect prefixed entries (e.g., `security_guard_...`, `manager_...`)
        // and relocate files into per-person, per-position folders.
        result[fieldName] = url;
        continue;
      }

      const segments = fieldName.split("_");
      const key = segments.slice(1).join("_");
      result[key] = url;
    }

    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);

    if (!organizationId || !organizationName) {
      setSubmissionError(
        "Cannot register employee without organization context. Please refresh or contact support.",
      );
      return;
    }

    if (
      !formData.region ||
      !formData.zone ||
      !formData.woreda ||
      !formData.kebele
    ) {
      setSubmissionError(
        "Please complete the address selection: Region, Zone/Subcity, Woreda, and Kebele are required.",
      );
      return;
    }

    const kebeleIdValue = Number(formData.kebele);
    if (!Number.isInteger(kebeleIdValue) || kebeleIdValue <= 0) {
      setSubmissionError(
        "Selected Kebele is invalid. Please choose a valid kebele before submitting.",
      );
      return;
    }

    if (!formData.password || formData.password !== formData.confirmPassword) {
      setSubmissionError("Password and confirm password must match.");
      return;
    }

    const missingRequiredDocs = getRequiredDocuments().filter(
      (doc) => doc.required && !formData.documents[doc.key],
    );

    if (missingRequiredDocs.length > 0) {
      setSubmissionError(
        `Upload required documents first: ${missingRequiredDocs
          .map((doc) => doc.label)
          .join(", ")}`,
      );
      return;
    }

    const filesToUpload = buildUploadFilesPayload();
    if (Object.keys(filesToUpload).length === 0) {
      setSubmissionError(
        "Please attach at least one employee document before completing registration.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadResult = await uploadOrganizationDocuments(
        organizationName,
        filesToUpload,
        {
          employeeFullName: getCombinedName(),
          employeePositionName:
            positions.find((p) => String(p.id) === String(formData.position))
              ?.name || "",
        },
      );

      if (!uploadResult.success || !uploadResult.data?.uploadedFiles) {
        throw new Error(
          uploadResult.error || uploadResult.message || "Upload failed",
        );
      }

      const uploadedFiles = normalizeUploadedFilesKeys(
        uploadResult.data.uploadedFiles,
      );

      const payload = {
        username: formData.username.trim(),
        fullName: getCombinedName(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        faydaId: formData.faydaId.trim(),
        positionId: formData.position ? Number(formData.position) : null,
        educationLevel: formData.educationLevel || null,
        workExpYears: formData.workExpYears,
        TotalExpYears: formData.TotalExpYears,
        gender: formData.gender || null,
        citizenship: formData.citizenship || null,
        age: formData.age ? Number(formData.age) : null,
        startedDate: formData.startedDate || null,
        organizationId,
        kebeleId: Number(formData.kebele),
        houseNo: formData.houseNo || null,
        specialLocation: formData.specialLocation || null,
        uploadedFiles,
      };

      await apiRequest("/employees/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setCurrentStep(4);
    } catch (error: any) {
      console.error("Employee registration failed:", error);
      setSubmissionError(
        error?.message || "Registration failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Document Configuration Array for clean mapping
  const getRequiredDocuments = () => {
    const baseDocuments = [
      { key: "fingerprint", label: "Fingerprint from Police", required: true },
      { key: "medical", label: "Medical Result", required: true },
      { key: "training", label: "Training Certificate", required: false },
      {
        key: "support_letter",
        label: "Support Letter (Kebele)",
        required: false,
      },
      { key: "collateral", label: "Proof of Collateral", required: true },
      {
        key: "experience",
        label: "Work Experience",
        // Required if workExpYears >= 1, optional if 0
        required: formData.workExpYears >= 1,
      },
      {
        key: "resignation",
        label: "Resignation Record",
        // Required if TotalExpYears >= 1, optional if 0
        required: formData.TotalExpYears >= 1,
      },
      { key: "education", label: "Educational Cert (Degree)", required: true },
      { key: "national_id", label: "National ID", required: true },
      {
        key: "kebele_or_passport",
        label: "Renewed Kebele ID/Passport",
        required: true,
      },
      {
        key: "organizational_id",
        label: "Organizational Identification",
        required: true,
      },
    ];
    return baseDocuments;
  };

  return (
    <div
      className="min-h-screen p-6 sm:p-10 font-sans text-slate-800"
      style={{
        background: "linear-gradient(135deg, #f8f9fc 0%, #e8eff9 100%)",
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#003366] tracking-tight">
            Register New Employee
          </h1>
          <div className="mt-3 h-1 w-20 rounded-full bg-[#FFD700] shadow-sm" />
          <p className="text-sm text-slate-500 mt-4">
            Onboard personnel into the organization system.
          </p>
        </div>

        {/* Stepper Navigation */}
        {organizationLoadError && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {organizationLoadError}
          </div>
        )}
        {currentStep < 4 && (
          <div className="flex items-center justify-between mb-8 relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 rounded-full z-0"></div>
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 rounded-full z-0 transition-all duration-300"
              style={{
                width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                backgroundColor: "#003366",
              }}
            ></div>

            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep >= step.number;
              return (
                <div
                  key={step.number}
                  className="relative z-10 flex flex-col items-center gap-2 bg-slate-50 px-2"
                >
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isActive
                        ? "bg-[#003366] border-[#003366] text-white shadow-lg ring-2 ring-[#FFD700] ring-opacity-40"
                        : "bg-white border-slate-300 text-slate-400"
                    }`}
                  >
                    {currentStep > step.number ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <span
                    className={`text-xs font-semibold uppercase tracking-wider ${isActive ? "text-[#003366]" : "text-slate-400"}`}
                  >
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden transition-transform duration-500 ease-out hover:-translate-y-1">
          <div className="p-8">
            {/* STEP 1: USER ACCOUNT DETAILS */}
            {currentStep === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 bg-[#f5f8ff]/75 rounded-3xl border border-[#dbe2f0] p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <User className="h-5 w-5 text-[#003366]" />
                  System Account Identity
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* SEPARATED NAME FIELDS */}
                  <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full uppercase rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-[#003366] outline-none text-sm"
                        placeholder="Abebe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Middle Name
                      </label>
                      <input
                        type="text"
                        name="middleName"
                        value={formData.middleName}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-slate-300 uppercase border p-2.5 focus:ring-2 focus:ring-[#003366] outline-none text-sm"
                        placeholder="Kebede"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-slate-300 uppercase border p-2.5 focus:ring-2 focus:ring-[#003366] outline-none text-sm"
                        placeholder="Tessema"
                      />
                    </div>
                  </div>

                  {/* FIELDS WITH VALIDATE BUTTONS */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-[#003366] outline-none text-sm"
                      placeholder="abebe@example.com"
                    />
                    <div className="flex justify-end mt-4 gap-2">
                      <button
                        type="button"
                        onClick={() => handleValidate("email")}
                        className="text-xs font-semibold px-3 py-1 rounded bg-[#003366] text-white hover:bg-[#00264d] transition-colors"
                      >
                        Validate
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-[#003366] outline-none text-sm"
                      placeholder="+251 911 000 000"
                    />
                    <div className="flex justify-end mt-4 gap-2">
                      <button
                        type="button"
                        onClick={() => handleValidate("phone")}
                        className="text-xs font-semibold px-3 py-1 rounded bg-[#003366] text-white hover:bg-[#00264d] transition-colors"
                      >
                        Validate
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Fayda ID (National ID)
                    </label>
                    <input
                      type="text"
                      name="faydaId"
                      value={formData.faydaId}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-[#003366] outline-none text-sm bg-[#003366]/10"
                      placeholder="12-digit ID"
                    />
                    <div className="flex justify-end mt-4 gap-2">
                      <button
                        type="button"
                        onClick={() => handleValidate("faydaId")}
                        className="text-xs font-semibold px-3 py-1 rounded bg-[#003366] text-white hover:bg-[#00264d] transition-colors"
                      >
                        Validate
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-[#003366] outline-none text-sm"
                      placeholder="username123"
                    />
                    <div className="flex justify-end mt-4 gap-2">
                      <button
                        type="button"
                        onClick={() => handleValidate("username")}
                        className="text-xs font-semibold px-3 py-1 rounded bg-[#003366] text-white hover:bg-[#00264d] transition-colors"
                      >
                        Validate
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-[#003366] outline-none text-sm"
                      placeholder="••••••••"
                    />
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-[#003366] outline-none text-sm"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: HR & LOCATION DETAILS */}
            {currentStep === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-10">
                {/* HR Details */}
                <div>
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-[#003366]" />
                    Human Resources Profile
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Position and Education Level - First Row */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Position
                      </label>
                      <select
                        name="position"
                        value={formData.position}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-[#003366] outline-none text-sm bg-white"
                      >
                        <option value="">Select Position</option>
                        {positions.map((p: any) => (
                          <option key={p.id} value={String(p.id)}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Education Level
                      </label>
                      <select
                        name="educationLevel"
                        value={formData.educationLevel}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-[#003366] outline-none text-sm bg-white"
                      >
                        <option value="">Select Level</option>
                        {educationOptions.length > 0 ? (
                          educationOptions.map((option: string) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="High School">
                              High School Diploma
                            </option>
                            <option value="Bachelors">Bachelor's Degree</option>
                            <option value="Masters">Master's Degree</option>
                          </>
                        )}
                      </select>
                    </div>

                    {/* Gender, Age, Citizenship */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-[#003366] outline-none text-sm bg-white"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Age
                      </label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-[#003366] outline-none text-sm"
                        placeholder="e.g. 28"
                        min="18"
                        max="120"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Employment Start Date
                      </label>
                      <input
                        type="date"
                        name="startedDate"
                        value={formData.startedDate}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-[#003366] outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Citizenship
                      </label>
                      <input
                        type="text"
                        name="citizenship"
                        value={formData.citizenship}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-[#003366] outline-none text-sm"
                      />
                    </div>

                    {/* Work Experience and Total Experience */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Work Experience (Years)
                      </label>
                      <input
                        type="number"
                        name="workExpYears"
                        value={formData.workExpYears}
                        onChange={handleInputChange}
                        min="0"
                        max="99"
                        className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-[#003366] outline-none text-sm"
                        placeholder="e.g. 5"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Total Experience (Years)
                      </label>
                      <input
                        type="number"
                        name="TotalExpYears"
                        value={formData.TotalExpYears}
                        onChange={handleInputChange}
                        min="0"
                        max="99"
                        className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-[#003366] outline-none text-sm"
                        placeholder="e.g. 10"
                      />
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Location Details */}
                <div>
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[#003366]" />
                    Residential Address
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Region <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="region"
                        value={formData.region}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-[#003366] outline-none text-sm bg-white"
                      >
                        <option value="">Select Region</option>
                        {regions.map((r: any) => (
                          <option key={r.id} value={String(r.id)}>
                            {r.nameEnglish ||
                              r.name ||
                              r.title ||
                              r.nameAmharic ||
                              r.id}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Zone / Subcity <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="zone"
                        value={formData.zone}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-[#003366] outline-none text-sm bg-white"
                      >
                        <option value="">Select Zone / Subcity</option>
                        {zones.map((z: any) => (
                          <option key={z.id} value={String(z.id)}>
                            {z.nameEnglish ||
                              z.name ||
                              z.title ||
                              z.nameAmharic ||
                              z.id}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Woreda <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="woreda"
                        value={formData.woreda}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-[#003366] outline-none text-sm bg-white"
                      >
                        <option value="">Select Woreda</option>
                        {woredas.map((w: any) => (
                          <option key={w.id} value={String(w.id)}>
                            {w.nameEnglish ||
                              w.name ||
                              w.title ||
                              w.nameAmharic ||
                              w.id}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Kebele <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="kebele"
                        value={formData.kebele}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-[#003366] outline-none text-sm bg-white"
                      >
                        <option value="">Select Kebele</option>
                        {kebeles.map((k: any) => (
                          <option key={k.id} value={String(k.id)}>
                            {k.nameEnglish ||
                              k.name ||
                              k.title ||
                              k.nameAmharic ||
                              k.id}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        House No. <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="houseNo"
                        value={formData.houseNo}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-[#003366] outline-none text-sm"
                        placeholder="e.g. 124"
                      />
                    </div>
                    <div className="col-span-1 md:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Special Location Name (Optional)
                      </label>
                      <input
                        type="text"
                        name="specialLocation"
                        value={formData.specialLocation}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-[#003366] outline-none text-sm"
                        placeholder="e.g. Behind the main post office"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: REQUIRED DOCUMENTS */}
            {currentStep === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#003366]" />
                  Required Documents
                </h2>
                <p className="text-sm text-slate-500 mb-6">
                  Upload all mandatory files in PDF or DOCX format (Max 5MB per
                  file).
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getRequiredDocuments().map((doc) => (
                    <div
                      key={doc.key}
                      className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 flex flex-col justify-between"
                    >
                      <div className="mb-3">
                        <div className="flex items-start justify-between">
                          <label className="text-sm font-semibold text-slate-800 block">
                            {doc.label}{" "}
                            {doc.required && (
                              <span className="text-red-500">*</span>
                            )}
                          </label>
                          {!doc.required && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">
                              Optional
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          PDF, DOCX Max 5MB
                        </p>
                      </div>

                      <div className="relative">
                        <input
                          type="file"
                          id={doc.key}
                          accept=".pdf,.docx"
                          onChange={(e) => handleFileChange(e, doc.key)}
                          className="hidden"
                        />
                        <label
                          htmlFor={doc.key}
                          className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-[#003366] transition-colors cursor-pointer"
                        >
                          <UploadCloud className="h-4 w-4 text-[#003366]" />
                          {formData.documents[doc.key]
                            ? formData.documents[doc.key]?.name
                            : "Select File"}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: SUCCESS */}
            {currentStep === 4 && (
              <div className="py-12 text-center animate-in zoom-in-95 duration-500">
                <div className="mx-auto w-20 h-20 bg-[#FFD700]/15 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <CheckCircle2 className="h-10 w-10 text-[#FFD700]" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Registration Complete!
                </h2>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">
                  <strong className="text-slate-800">
                    {getCombinedName()}
                  </strong>{" "}
                  has been successfully added to the system. User account and HR
                  profile generated.
                </p>
                <button
                  onClick={() => {
                    setCurrentStep(1);
                    setFormData({
                      ...formData,
                      firstName: "",
                      middleName: "",
                      lastName: "",
                      email: "",
                      phone: "",
                      faydaId: "",
                      documents: {},
                    });
                  }}
                  className="bg-[#FFD700] text-[#003366] px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#e6c200] transition-colors shadow-md"
                >
                  Register Another Employee
                </button>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          {currentStep < 4 && (
            <>
              {submissionError && (
                <div className="px-8 py-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-b-2xl">
                  {submissionError}
                </div>
              )}
              <div className="px-8 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    currentStep === 1
                      ? "text-slate-400 cursor-not-allowed"
                      : "text-slate-700 hover:bg-slate-200 bg-slate-200/50"
                  }`}
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="inline-flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold text-white bg-[#003366] hover:bg-[#00264d] transition-colors shadow-sm"
                  >
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !!organizationLoadError}
                    className={`inline-flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold text-white transition-colors shadow-sm ${
                      isSubmitting || organizationLoadError
                        ? "bg-slate-300 cursor-not-allowed"
                        : "bg-[#003366] hover:bg-[#00264d]"
                    }`}
                  >
                    {isSubmitting ? "Submitting..." : "Complete Registration"}
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
