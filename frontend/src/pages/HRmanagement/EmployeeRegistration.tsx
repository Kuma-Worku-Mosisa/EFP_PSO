//filepath: frontend/src/pages/HRmanagement/EmployeeRegistration.tsx
import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  User,
  Briefcase,
  FileText,
  CheckCircle2,
  MapPin,
  UploadCloud,
  ArrowRight,
  ArrowLeft,
  Search,
  X,
  ChevronDown,
  Fingerprint,
  Heart,
  Award,
  Shield,
  File,
  GraduationCap,
  IdCard,
  BookOpen,
  Building2,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";
import { apiRequest } from "../../lib/api";
import { uploadOrganizationDocuments } from "../../lib/fileUploadHelper";
import { useLanguage } from "../../context/LanguageContext";
import EthiopianDatePicker from "../../components/EthiopianDatePicker";
import { AutoDismissToast } from "../../components/AutoDismissToast";

export default function EmployeeRegistration() {
  const { language } = useLanguage();
  const isAm = language === "am";
  const [currentStep, setCurrentStep] = useState(1);

  // Searchable address dropdown state
  const [regionSearch, setRegionSearch] = useState("");
  const [zoneSearch, setZoneSearch] = useState("");
  const [woredaSearch, setWoredaSearch] = useState("");
  const [kebeleSearch, setKebeleSearch] = useState("");
  const [regionOpen, setRegionOpen] = useState(false);
  const [zoneOpen, setZoneOpen] = useState(false);
  const [woredaOpen, setWoredaOpen] = useState(false);
  const [kebeleOpen, setKebeleOpen] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const woredaRef = useRef<HTMLDivElement>(null);
  const kebeleRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (regionRef.current && !regionRef.current.contains(e.target as Node))
        setRegionOpen(false);
      if (zoneRef.current && !zoneRef.current.contains(e.target as Node))
        setZoneOpen(false);
      if (woredaRef.current && !woredaRef.current.contains(e.target as Node))
        setWoredaOpen(false);
      if (kebeleRef.current && !kebeleRef.current.contains(e.target as Node))
        setKebeleOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const locName = (item: any) =>
    isAm
      ? item.nameAmharic || item.name || item.title || ""
      : item.nameEnglish || item.name || item.title || "";

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

    // Names: only allow alphabets, spaces, hyphens, and apostrophes
    if (name === "firstName" || name === "middleName" || name === "lastName") {
      const filtered = value.replace(/[^a-zA-Z\u1200-\u137F\s'\-]/g, "");
      setFormData((prev) => ({ ...prev, [name]: filtered }));
      return;
    }

    // Phone: only digits after +251 prefix, total 13 chars (+251 + 9 digits)
    if (name === "phone") {
      const prefix = "+251";
      if (value === prefix) {
        setFormData((prev) => ({ ...prev, [name]: prefix }));
        return;
      }
      if (!value.startsWith(prefix) && !value.startsWith("251")) {
        setFormData((prev) => ({ ...prev, [name]: prefix + value.replace(/[^0-9]/g, "") }));
        return;
      }
      const digits = value.replace(/[^0-9]/g, "").slice(0, 12);
      setFormData((prev) => ({ ...prev, [name]: "+" + digits }));
      return;
    }

    // Fayda ID: only 16 digits
    if (name === "faydaId") {
      const digits = value.replace(/[^0-9]/g, "").slice(0, 16);
      setFormData((prev) => ({ ...prev, [name]: digits }));
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
  const [toastOpen, setToastOpen] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMessage, setToastMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWorkExpLearnMore, setShowWorkExpLearnMore] = useState(false);
  const [showTotalExpLearnMore, setShowTotalExpLearnMore] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [docPreviewUrl, setDocPreviewUrl] = useState<string | null>(null);

  const hiddenPositionNames = [
    "Manager of Organization",
    "Operation of Organization",
    "Administrative and Finance of Organization",
  ];

  const isHiddenPosition = (position: any) => {
    const name = String(position?.name || "")
      .trim()
      .toLowerCase();
    return hiddenPositionNames.some(
      (hiddenName) => name === hiddenName.toLowerCase(),
    );
  };

  const visiblePositions = positions.filter(
    (position: any) => !isHiddenPosition(position),
  );

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
          throw new Error(
            isAm ? "የድርጅት መረጃ አይገኝም" : "Organization information not available",
          );
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
            (isAm
              ? "ለምዝገባ ድርጅትዎን መለየት አልተቻለም።"
              : "Unable to determine your organization for registration."),
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
  const showToast = (type: "success" | "error", message: string) => {
    setToastType(type);
    setToastMessage(message);
    setToastOpen(true);
  };

  const handleValidate = (field: string) => {
    const value = formData[field as keyof typeof formData] as string;
    const normalizedField = field === "faydaId" ? "faydaId" : field;

    if (!value || typeof value !== "string") {
      showToast(
        "error",
        isAm
          ? "እባክዎ ከማረጋገጥዎ በፊት እሴት ያስገቡ።"
          : "Please enter a value before validating.",
      );
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
          showToast("error", data.message);
          return;
        }
        showToast(
          data.exists ? "error" : "success",
          data.exists
            ? isAm
              ? `${field} አስቀድሞ ተመዝግቧል፣ እባክዎ የተለየ እሴት ይምረጡ።`
              : `${field} is already registered, please choose a different value.`
            : isAm
              ? `${field} ይገኛል።`
              : `${field} is available.`,
        );
      })
      .catch((error) => {
        console.error("Validation error:", error);
        showToast(
          "error",
          isAm
            ? error.message || "ማረጋገጥ አልተሳካም።"
            : error.message || "Validation failed.",
        );
      });
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.firstName.trim() || !formData.middleName.trim() || !formData.lastName.trim()) {
        const message = isAm ? "ስሙ ያስፈልጋል። ስም በሙሉ ያስገቡ።" : "Full name is required. Please fill in all name fields.";
        setSubmissionError(message);
        showToast("error", message);
        return;
      }
      const phoneRegex = /^\+251\d{9}$/;
      if (!phoneRegex.test(formData.phone)) {
        const message = isAm ? "የትክክለኛ ስልክ ቁጥር ያስፈልጋል (+251 ቀጥሎ 9 አሃዝ)" : "Valid phone number required (+251 followed by 9 digits).";
        setSubmissionError(message);
        showToast("error", message);
        return;
      }
      if (!/^\d{16}$/.test(formData.faydaId)) {
        const message = isAm ? "የፋይዳ መለያ 16 አሃዝ መሆን አለበት" : "Fayda ID must be exactly 16 digits.";
        setSubmissionError(message);
        showToast("error", message);
        return;
      }
      if (!formData.email.trim()) {
        const message = isAm ? "ኢሜይል አድራሻ አስፈላጊ ነው" : "Email address is required.";
        setSubmissionError(message);
        showToast("error", message);
        return;
      }
      if (!formData.username.trim()) {
        const message = isAm ? "የተጠቃሚ ስም አስፈላጊ ነው" : "Username is required.";
        setSubmissionError(message);
        showToast("error", message);
        return;
      }
      if (!formData.password) {
        const message = isAm ? "የይለፍ ቃል አስፈላጊ ነው" : "Password is required.";
        setSubmissionError(message);
        showToast("error", message);
        return;
      }
    }
    setSubmissionError(null);
    setCurrentStep((p) => Math.min(p + 1, 4));
  };
  const prevStep = () => setCurrentStep((p) => Math.max(p - 1, 1));

  const getPasswordStrength = (pw: string) => {
    if (!pw) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^a-zA-Z0-9]/.test(pw)) score++;

    if (score <= 1) return { score, label: isAm ? "ንቀት" : "Weak", color: "bg-red-500" };
    if (score <= 2) return { score, label: isAm ? "መካከለኛ" : "Fair", color: "bg-orange-500" };
    if (score <= 3) return { score, label: isAm ? "ጥሩ" : "Good", color: "bg-yellow-500" };
    if (score <= 4) return { score, label: isAm ? "ጠንካራ" : "Strong", color: "bg-lime-500" };
    return { score, label: isAm ? "በጣም ጠንካራ" : "Very Strong", color: "bg-green-600" };
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const passwordsMatch = formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword;
  const passwordsMismatch = formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword;

  const steps = [
    { number: 1, title: isAm ? "መለያ ማዋቀር" : "Account Setup", icon: User },
    {
      number: 2,
      title: isAm ? "የሰው ኃይል እና አድራሻ" : "HR & Location",
      icon: Briefcase,
    },
    { number: 3, title: isAm ? "ሰነዶች" : "Documents", icon: FileText },
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
      const message = isAm
        ? "ያለ ድርጅት አውድ ሰራተኛ መመዝገብ አይቻልም። እባክዎ ያድሱ ወይም ድጋፍ ያግኙ።"
        : "Cannot register employee without organization context. Please refresh or contact support.";
      setSubmissionError(message);
      showToast("error", message);
      return;
    }

    if (
      !formData.region ||
      !formData.zone ||
      !formData.woreda ||
      !formData.kebele
    ) {
      const message = isAm
        ? "እባክዎ የአድራሻ ምርጫን ያጠናቅቁ፦ ክልል፣ ዞን/ከተማ፣ ወረዳ እና ቀበሌ ያስፈልጋሉ።"
        : "Please complete the address selection: Region, Zone/Subcity, Woreda, and Kebele are required.";
      setSubmissionError(message);
      showToast("error", message);
      return;
    }

    const kebeleIdValue = Number(formData.kebele);
    if (!Number.isInteger(kebeleIdValue) || kebeleIdValue <= 0) {
      const message = isAm
        ? "የተመረጠው ቀበሌ ልክ አይደለም። እባክዎ ከማስገባትዎ በፊት ልክ የሆነ ቀበሌ ይምረጡ።"
        : "Selected Kebele is invalid. Please choose a valid kebele before submitting.";
      setSubmissionError(message);
      showToast("error", message);
      return;
    }

    if (!formData.password || formData.password !== formData.confirmPassword) {
      const message = isAm
        ? "የይለፍ ቃል እና የይለፍ ቃል ማረጋገጫ መመሳሰል አለባቸው።"
        : "Password and confirm password must match.";
      setSubmissionError(message);
      showToast("error", message);
      return;
    }

    const missingRequiredDocs = getRequiredDocuments().filter(
      (doc) => doc.required && !formData.documents[doc.key],
    );

    if (missingRequiredDocs.length > 0) {
      const message = `${isAm ? "መጀመሪያ አስፈላጊ ሰነዶችን ይስቀሉ፦ " : "Upload required documents first: "}${missingRequiredDocs
        .map((doc) => doc.label)
        .join(", ")}`;
      setSubmissionError(message);
      showToast("error", message);
      return;
    }

    const filesToUpload = buildUploadFilesPayload();
    if (Object.keys(filesToUpload).length === 0) {
      const message = isAm
        ? "ምዝገባውን ከማጠናቀቅዎ በፊት ቢያንስ አንድ የሰራተኛ ሰነድ ያያይዙ።"
        : "Please attach at least one employee document before completing registration.";
      setSubmissionError(message);
      showToast("error", message);
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
          uploadResult.error ||
            uploadResult.message ||
            (isAm ? "መስቀል አልተሳካም" : "Upload failed"),
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

      setSubmissionError(null);
      showToast(
        "success",
        isAm ? "ምዝገባ በተሳካ ሁኔታ ተጠናቋል" : "Registration completed successfully.",
      );
      setCurrentStep(4);
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error: any) {
      console.error("Employee registration failed:", error);
      const message =
        error?.message ||
        (isAm
          ? "ምዝገባ አልተሳካም። እባክዎ እንደገና ይሞክሩ።"
          : "Registration failed. Please try again.");
      setSubmissionError(message);
      showToast("error", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Document icon mapping
  const getDocIcon = (key: string) => {
    const icons: Record<string, React.ReactNode> = {
      fingerprint: <Fingerprint className="h-4 w-4 text-[#FFD700]" />,
      medical: <Heart className="h-4 w-4 text-[#FFD700]" />,
      training: <Award className="h-4 w-4 text-[#FFD700]" />,
      support_letter: <FileText className="h-4 w-4 text-[#FFD700]" />,
      guarantee: <Shield className="h-4 w-4 text-[#FFD700]" />,
      experience: <Briefcase className="h-4 w-4 text-[#FFD700]" />,
      resignation: <File className="h-4 w-4 text-[#FFD700]" />,
      education: <GraduationCap className="h-4 w-4 text-[#FFD700]" />,
      national_id: <IdCard className="h-4 w-4 text-[#FFD700]" />,
      kebele_or_passport: <BookOpen className="h-4 w-4 text-[#FFD700]" />,
      organizational_id: <Building2 className="h-4 w-4 text-[#FFD700]" />,
    };
    return icons[key] || <FileText className="h-4 w-4 text-[#FFD700]" />;
  };

  // Document Configuration Array for clean mapping
  const getRequiredDocuments = () => {
    const baseDocuments = [
      {
        key: "fingerprint",
        label: isAm ? "ከፖሊስ የጣት አሻራ" : "Fingerprint from Police",
        required: true,
      },
      {
        key: "medical",
        label: isAm ? "የህክምና ውጤት" : "Medical Result",
        required: true,
      },
      {
        key: "training",
        label: isAm ? "የስልጠና የምስክር ወረቀት" : "Training Certificate",
        required: false,
      },
      {
        key: "support_letter",
        label: isAm ? "የድጋፍ ደብዳቤ (ቀበሌ)" : "Support Letter (Kebele)",
        required: false,
      },
      {
        key: "guarantee",
        label: isAm ? "የዋስትና ማረጋገጫ" : "Proof of Guarantee",
        required: true,
      },
      {
        key: "experience",
        label: isAm ? "የስራ ልምድ" : "Work Experience",
        // Required if workExpYears >= 1, optional if 0
        required: formData.workExpYears >= 1,
      },
      {
        key: "resignation",
        label: isAm ? "የስራ መልቀቂያ ሪከርድ" : "Resignation Record",
        // Required if TotalExpYears >= 1, optional if 0
        required: formData.TotalExpYears >= 1,
      },
      {
        key: "education",
        label: isAm ? "የትምህርት የምስክር ወረቀት (ዲግሪ)" : "Educational Cert (Degree)",
        required: true,
      },
      {
        key: "national_id",
        label: isAm ? "ብሔራዊ መታወቂያ" : "National ID",
        required: true,
      },
      {
        key: "kebele_or_passport",
        label: isAm ? "የታደሰ የቀበሌ መታወቂያ/ፓስፖርት" : "Renewed Kebele ID/Passport",
        required: true,
      },
      {
        key: "organizational_id",
        label: isAm ? "የድርጅት መታወቂያ" : "Organizational Identification",
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
      <AutoDismissToast
        isOpen={toastOpen}
        type={toastType}
        message={toastMessage}
        onClose={() => setToastOpen(false)}
      />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#003366] tracking-tight">
            {isAm ? "አዲስ ሰራተኛ ይመዝገቡ" : "Register New Employee"}
          </h1>
          <div className="mt-3 h-1 w-20 rounded-full bg-[#FFD700] shadow-sm" />
          <p className="text-sm text-slate-500 mt-4">
            {isAm
              ? "ሰራተኞችን ወደ ድርጅቱ ስርዓት ያስገቡ።"
              : "Onboard personnel into the organization system."}
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
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden transition-transform duration-500 ease-out hover:-translate-y-1 relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#003366] via-[#FFD700] to-[#003366]" />
          <div className="p-8">
            {/* STEP 1: USER ACCOUNT DETAILS */}
            {currentStep === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 bg-gradient-to-br from-white to-[#f5f8ff] rounded-3xl border border-[#dbe2f0] p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#003366] to-[#001F3F] flex items-center justify-center">
                    <User className="h-4 w-4 text-[#FFD700]" />
                  </div>
                  <span className="text-[#003366]">
                    {isAm ? "የስርዓት መለያ" : "System Account Identity"}
                  </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* SEPARATED NAME FIELDS */}
                  <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-[#003366] mb-1">
                        {isAm ? "ስም" : "First Name"}
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#003366]/30 focus:border-[#003366] outline-none text-sm bg-white hover:border-[#003366]/50 transition-all shadow-sm uppercase"
                        placeholder={isAm ? "አበበ" : "Abebe"}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#003366] mb-1">
                        {isAm ? "የአባት ስም" : "Middle Name"}
                      </label>
                      <input
                        type="text"
                        name="middleName"
                        value={formData.middleName}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#003366]/30 focus:border-[#003366] outline-none text-sm bg-white hover:border-[#003366]/50 transition-all shadow-sm uppercase"
                        placeholder={isAm ? "ከበደ" : "Kebede"}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#003366] mb-1">
                        {isAm ? "የአያት ስም" : "Last Name"}
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#003366]/30 focus:border-[#003366] outline-none text-sm bg-white hover:border-[#003366]/50 transition-all shadow-sm uppercase"
                        placeholder={isAm ? "ተሰማ" : "Tessema"}
                      />
                    </div>
                  </div>

                  {/* FIELDS WITH VALIDATE BUTTONS */}
                  <div>
                    <label className="block text-sm font-bold text-[#003366] mb-1">
                      {isAm ? "የኢሜይል አድራሻ" : "Email Address"}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#003366]/30 focus:border-[#003366] outline-none text-sm bg-white hover:border-[#003366]/50 transition-all shadow-sm"
                      placeholder="abebe@example.com"
                    />
                    <div className="flex justify-end mt-4 gap-2">
                      <button
                        type="button"
                        onClick={() => handleValidate("email")}
                        className="text-xs font-semibold px-3 py-1 rounded bg-[#003366] text-white hover:bg-[#00264d] transition-colors"
                      >
                        {isAm ? "አረጋግጡ" : "Validate"}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#003366] mb-1">
                      {isAm ? "ስልክ ቁጥር" : "Phone Number"}
                    </label>
                    <div className="flex items-center rounded-lg border border-slate-300 bg-[#003366]/5 overflow-hidden focus-within:ring-2 focus-within:ring-[#003366]/30 focus-within:border-[#003366] transition-all shadow-sm">
                      <span className="px-3 py-2.5 text-sm font-semibold text-[#003366] bg-slate-100 border-r border-slate-300 select-none shrink-0">
                        +251
                      </span>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone.replace(/^\+251/, "")}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/[^0-9]/g, "").slice(0, 9);
                          handleInputChange({
                            target: { name: "phone", value: "+251" + digits },
                          } as any);
                        }}
                        className="w-full px-3 py-2.5 text-sm bg-transparent outline-none"
                        placeholder="911 000 000"
                      />
                    </div>
                    <div className="flex justify-end mt-4 gap-2">
                      <button
                        type="button"
                        onClick={() => handleValidate("phone")}
                        className="text-xs font-semibold px-3 py-1 rounded bg-[#003366] text-white hover:bg-[#00264d] transition-colors"
                      >
                        {isAm ? "አረጋግጡ" : "Validate"}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#003366] mb-1">
                      {isAm
                        ? "የፋይዳ መለያ (ብሔራዊ መታወቂያ)"
                        : "Fayda ID (National ID)"}
                    </label>
                    <input
                      type="text"
                      name="faydaId"
                      value={formData.faydaId}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#003366]/30 focus:border-[#003366] outline-none text-sm bg-[#003366]/5 hover:border-[#003366]/50 transition-all shadow-sm"
                      placeholder={isAm ? "ባለ16-አሃዝ መለያ" : "16-digit ID"}
                    />
                    <div className="flex justify-end mt-4 gap-2">
                      <button
                        type="button"
                        onClick={() => handleValidate("faydaId")}
                        className="text-xs font-semibold px-3 py-1 rounded bg-[#003366] text-white hover:bg-[#00264d] transition-colors"
                      >
                        {isAm ? "አረጋግጡ" : "Validate"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#003366] mb-1">
                      {isAm ? "የተጠቃሚ ስም" : "Username"}
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#003366]/30 focus:border-[#003366] outline-none text-sm bg-white hover:border-[#003366]/50 transition-all shadow-sm"
                      placeholder={isAm ? "የተጠቃሚ ስም123" : "username123"}
                    />
                    <div className="flex justify-end mt-4 gap-2">
                      <button
                        type="button"
                        onClick={() => handleValidate("username")}
                        className="text-xs font-semibold px-3 py-1 rounded bg-[#003366] text-white hover:bg-[#00264d] transition-colors"
                      >
                        {isAm ? "አረጋግጡ" : "Validate"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#003366] mb-1">
                      {isAm ? "አዲስ የይለፍ ቃል" : "New Password"}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-slate-300 p-2.5 pr-10 focus:ring-2 focus:ring-[#003366]/30 focus:border-[#003366] outline-none text-sm bg-white hover:border-[#003366]/50 transition-all shadow-sm"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                                i <= passwordStrength.score ? passwordStrength.color : "bg-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        <span className={`text-xs font-semibold ${
                          passwordStrength.score <= 1 ? "text-red-500" :
                          passwordStrength.score <= 2 ? "text-orange-500" :
                          passwordStrength.score <= 3 ? "text-yellow-600" :
                          passwordStrength.score <= 4 ? "text-lime-600" :
                          "text-green-600"
                        }`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                    )}
                    <div className="mt-4">
                      <label className="block text-sm font-bold text-[#003366] mb-1">
                        {isAm ? "የይለፍ ቃል ያረጋግጡ" : "Confirm Password"}
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className={`w-full rounded-lg border p-2.5 pr-10 focus:ring-2 outline-none text-sm bg-white transition-all shadow-sm ${
                            passwordsMatch
                              ? "border-green-500 focus:ring-green-500/30 focus:border-green-500"
                              : passwordsMismatch
                                ? "border-red-500 focus:ring-red-500/30 focus:border-red-500"
                                : "border-slate-300 focus:ring-[#003366]/30 focus:border-[#003366] hover:border-[#003366]/50"
                          }`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {formData.confirmPassword && (
                        <div className="mt-1 flex items-center gap-1.5">
                          {passwordsMatch ? (
                            <>
                              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-xs font-semibold text-green-600">
                                {isAm ? "መሳረጫ ተመሳṭይ ነው" : "Passwords match"}
                              </span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              <span className="text-xs font-semibold text-red-500">
                                {isAm ? "መሳረጫ አይመሳሰልም" : "Passwords do not match"}
                              </span>
                            </>
                          )}
                        </div>
                      )}
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
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#003366] to-[#001F3F] flex items-center justify-center">
                      <Briefcase className="h-4 w-4 text-[#FFD700]" />
                    </div>
                    <span className="text-[#003366]">
                      {isAm ? "የሰው ኃይል መገለጫ" : "Human Resources Profile"}
                    </span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Position and Education Level - First Row */}
                    <div>
                      <label className="block text-sm font-bold text-[#003366] mb-1">
                        {isAm ? "ሹመት" : "Position"}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="position"
                        value={formData.position}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#003366]/30 focus:border-[#003366] outline-none text-sm bg-white hover:border-[#003366]/50 transition-all shadow-sm cursor-pointer"
                      >
                        <option value="">
                          {isAm ? "ሹመት ይምረጡ" : "Select Position"}
                        </option>
                        {visiblePositions.map((p: any) => (
                          <option key={p.id} value={String(p.id)}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-[#003366] mb-1">
                        {isAm ? "የትምህርት ደረጃ" : "Education Level"}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="educationLevel"
                        value={formData.educationLevel}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#003366]/30 focus:border-[#003366] outline-none text-sm bg-white hover:border-[#003366]/50 transition-all shadow-sm cursor-pointer"
                      >
                        <option value="">
                          {isAm ? "ደረጃ ይምረጡ" : "Select Level"}
                        </option>
                        {educationOptions.length > 0 ? (
                          educationOptions.map((option: string) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="High School">
                              {isAm ? "የሁለተኛ ደረጃ ዲፕሎማ" : "High School Diploma"}
                            </option>
                            <option value="Bachelors">
                              {isAm ? "የመጀመሪያ ዲግሪ" : "Bachelor's Degree"}
                            </option>
                            <option value="Masters">
                              {isAm ? "የማስተርስ ዲግሪ" : "Master's Degree"}
                            </option>
                          </>
                        )}
                      </select>
                    </div>

                    {/* Gender, Age, Citizenship */}
                    <div>
                      <label className="block text-sm font-bold text-[#003366] mb-1">
                        {isAm ? "ጾታ" : "Gender"}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#003366]/30 focus:border-[#003366] outline-none text-sm bg-white hover:border-[#003366]/50 transition-all shadow-sm cursor-pointer"
                      >
                        <option value="">
                          {isAm ? "ጾታ ይምረጡ" : "Select Gender"}
                        </option>
                        <option value="Male">{isAm ? "ወንድ" : "Male"}</option>
                        <option value="Female">{isAm ? "ሴት" : "Female"}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#003366] mb-1">
                        {isAm ? "እድሜ" : "Age"}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#003366]/30 focus:border-[#003366] outline-none text-sm bg-white hover:border-[#003366]/50 transition-all shadow-sm"
                        placeholder={isAm ? "ለምሳሌ 28" : "e.g. 28"}
                        min="18"
                        max="120"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#003366] mb-1">
                        {isAm ? "የተቀጠሩበት ቀን" : "Employment Start Date"}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <EthiopianDatePicker
                        value={formData.startedDate}
                        onChange={(iso) =>
                          handleInputChange({
                            target: { name: "startedDate", value: iso },
                          } as any)
                        }
                        useEthiopian={isAm}
                        className="w-full rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#003366]/30 focus:border-[#003366] outline-none text-sm bg-white hover:border-[#003366]/50 transition-all shadow-sm"
                        placeholder={isAm ? "ቀን ይምረጡ..." : "Select date..."}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#003366] mb-1">
                        {isAm ? "ዜግነት" : "Citizenship"}
                      </label>
                      <div className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-600 flex items-center gap-2 cursor-not-allowed">
                        <Shield className="h-4 w-4 text-[#003366]" />
                        <span className="font-semibold">
                          {isAm ? "ኢትዮጵያዊ" : "Ethiopian"}
                        </span>
                      </div>
                    </div>

                    {/* Work Experience */}
                    <div>
                      <label className="block text-sm font-bold text-[#003366] mb-1">
                        {isAm ? "የስራ ልምድ (ዓመታት)" : "Work Experience (Years)"}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="workExpYears"
                        value={formData.workExpYears}
                        onChange={handleInputChange}
                        min="0"
                        max="99"
                        className="w-full rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#003366]/30 focus:border-[#003366] outline-none text-sm bg-white hover:border-[#003366]/50 transition-all shadow-sm"
                        placeholder={isAm ? "ለምሳሌ 5" : "e.g. 5"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowWorkExpLearnMore(!showWorkExpLearnMore)}
                        className="flex items-center gap-1.5 text-[11px] text-orange-500 font-semibold mt-2 hover:text-orange-600 transition-colors"
                      >
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform ${showWorkExpLearnMore ? "rotate-180" : ""}`}
                        />
                        {isAm ? "የበለጠ ይረዱ" : "Learn more"}
                      </button>
                      {showWorkExpLearnMore && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-[11px] text-orange-600 mt-1 italic leading-relaxed"
                        >
                          {isAm
                            ? "የስራ ልምድዎ በዚህ ተቋም ውስጥ ያለዎትን የሙሉ ዓመታት ብዛት ይወክላል። ከተመቻቸ በኋላ የሚከተሉትን ማስታወሻ ያስገቡ።"
                            : "Work experience represents the full years of service at this institution. Include partial years rounded appropriately."}
                        </motion.p>
                      )}
                    </div>

                    {/* Total Experience */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-[#003366] mb-1">
                        {isAm ? "አጠቃላይ ልምድ (ዓመታት)" : "Total Experience (Years)"}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="TotalExpYears"
                        value={formData.TotalExpYears}
                        onChange={handleInputChange}
                        min="0"
                        max="99"
                        className="w-full rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#003366]/30 focus:border-[#003366] outline-none text-sm bg-white hover:border-[#003366]/50 transition-all shadow-sm"
                        placeholder={isAm ? "ለምሳሌ 10" : "e.g. 10"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowTotalExpLearnMore(!showTotalExpLearnMore)}
                        className="flex items-center gap-1.5 text-[11px] text-orange-500 font-semibold mt-2 hover:text-orange-600 transition-colors"
                      >
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform ${showTotalExpLearnMore ? "rotate-180" : ""}`}
                        />
                        {isAm ? "የበለጠ ይረዱ" : "Learn more"}
                      </button>
                      {showTotalExpLearnMore && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-[11px] text-orange-600 mt-1 italic leading-relaxed"
                        >
                          {isAm
                            ? "አጠቃላይ ልምድ ከመጀመሪያ ተቋማት እንዲሁም ከዚህ ተቋም የሚያገኙትን ሁሉ ያቀርባል። የመጀመሪያ እና የሁለተኛ ደረጃ ትምህርት ዘመንን ጨምሮ ያስገቡ።"
                            : "Total experience includes all professional experience across institutions. Include years from previous positions as well."}
                        </motion.p>
                      )}
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Location Details */}
                <div>
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#003366] to-[#001F3F] flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-[#FFD700]" />
                    </div>
                    <span className="text-[#003366]">
                      {isAm ? "የመኖሪያ አድራሻ" : "Residential Address"}
                    </span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Region - Searchable */}
                    <div ref={regionRef} className="relative">
                      <label className="block text-sm font-bold text-[#003366] mb-1">
                        {isAm ? "ክልል" : "Region"}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div
                        onClick={() => {
                          setRegionOpen(!regionOpen);
                          setRegionSearch("");
                        }}
                        className="w-full rounded-lg border border-slate-300 p-2.5 text-sm bg-white cursor-pointer flex items-center justify-between hover:border-[#003366]/40 transition"
                      >
                        <span
                          className={
                            formData.region
                              ? "text-slate-800"
                              : "text-slate-400"
                          }
                        >
                          {formData.region
                            ? locName(
                                regions.find(
                                  (r: any) => String(r.id) === formData.region,
                                ),
                              )
                            : isAm
                              ? "ክልል ይምረጡ..."
                              : "Select Region..."}
                        </span>
                        <div className="flex items-center gap-1">
                          {formData.region && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInputChange({
                                  target: { name: "region", value: "" },
                                } as any);
                                setZoneSearch("");
                                setWoredaSearch("");
                                setKebeleSearch("");
                              }}
                              className="text-slate-400 hover:text-red-500 transition"
                            >
                              <X size={14} />
                            </button>
                          )}
                          <ChevronDown
                            size={16}
                            className={`text-slate-400 transition ${regionOpen ? "rotate-180" : ""}`}
                          />
                        </div>
                      </div>
                      {regionOpen && (
                        <div className="absolute z-20 mt-1 w-full bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
                          <div className="p-2 border-b border-slate-100">
                            <div className="relative">
                              <Search
                                size={14}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                              />
                              <input
                                type="text"
                                value={regionSearch}
                                onChange={(e) =>
                                  setRegionSearch(e.target.value)
                                }
                                placeholder={
                                  isAm ? "ክልል ይፈልጉ..." : "Search region..."
                                }
                                className="w-full pl-8 pr-8 py-2 rounded-lg border border-slate-100 bg-slate-50 text-sm focus:outline-none focus:ring-1 focus:ring-[#003366]/30"
                              />
                              {regionSearch && (
                                <button
                                  onClick={() => setRegionSearch("")}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                  <X size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="max-h-40 overflow-y-auto">
                            {regions
                              .filter((r: any) =>
                                locName(r)
                                  .toLowerCase()
                                  .includes(regionSearch.toLowerCase()),
                              )
                              .map((r: any) => (
                                <button
                                  key={r.id}
                                  type="button"
                                  onClick={() => {
                                    handleInputChange({
                                      target: {
                                        name: "region",
                                        value: String(r.id),
                                      },
                                    } as any);
                                    setRegionOpen(false);
                                    setZoneSearch("");
                                    setWoredaSearch("");
                                    setKebeleSearch("");
                                  }}
                                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#003366]/5 transition ${
                                    formData.region === String(r.id)
                                      ? "bg-[#003366]/10 text-[#003366] font-bold"
                                      : "text-slate-700"
                                  }`}
                                >
                                  {locName(r)}
                                </button>
                              ))}
                            {regions.length === 0 && (
                              <p className="px-4 py-3 text-sm text-slate-400">
                                {isAm
                                  ? "ክልሎች እየተጫኑ ነው..."
                                  : "Loading regions..."}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Zone / Subcity - Searchable */}
                    <div ref={zoneRef} className="relative">
                      <label className="block text-sm font-bold text-[#003366] mb-1">
                        {isAm ? "ዞን / ክፍለ ከተማ" : "Zone / Subcity"}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div
                        onClick={() => {
                          if (formData.region) {
                            setZoneOpen(!zoneOpen);
                            setZoneSearch("");
                          }
                        }}
                        className={`w-full rounded-lg border p-2.5 text-sm bg-white cursor-pointer flex items-center justify-between transition ${
                          !formData.region
                            ? "border-slate-200 bg-slate-50"
                            : "border-slate-300 hover:border-[#003366]/40"
                        }`}
                      >
                        <span
                          className={
                            formData.zone ? "text-slate-800" : "text-slate-400"
                          }
                        >
                          {formData.zone
                            ? locName(
                                zones.find(
                                  (z: any) => String(z.id) === formData.zone,
                                ),
                              )
                            : !formData.region
                              ? isAm
                                ? "መጀመሪያ ክልል ይምረጡ"
                                : "Select region first"
                              : isAm
                                ? "ዞን ይምረጡ..."
                                : "Select Zone..."}
                        </span>
                        <div className="flex items-center gap-1">
                          {formData.zone && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInputChange({
                                  target: { name: "zone", value: "" },
                                } as any);
                                setWoredaSearch("");
                                setKebeleSearch("");
                              }}
                              className="text-slate-400 hover:text-red-500 transition"
                            >
                              <X size={14} />
                            </button>
                          )}
                          <ChevronDown
                            size={16}
                            className={`text-slate-400 transition ${zoneOpen ? "rotate-180" : ""}`}
                          />
                        </div>
                      </div>
                      {zoneOpen && (
                        <div className="absolute z-20 mt-1 w-full bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
                          <div className="p-2 border-b border-slate-100">
                            <div className="relative">
                              <Search
                                size={14}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                              />
                              <input
                                type="text"
                                value={zoneSearch}
                                onChange={(e) => setZoneSearch(e.target.value)}
                                placeholder={
                                  isAm ? "ዞን ይፈልጉ..." : "Search zone..."
                                }
                                className="w-full pl-8 pr-8 py-2 rounded-lg border border-slate-100 bg-slate-50 text-sm focus:outline-none focus:ring-1 focus:ring-[#003366]/30"
                              />
                              {zoneSearch && (
                                <button
                                  onClick={() => setZoneSearch("")}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                  <X size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="max-h-40 overflow-y-auto">
                            {zones
                              .filter((z: any) =>
                                locName(z)
                                  .toLowerCase()
                                  .includes(zoneSearch.toLowerCase()),
                              )
                              .map((z: any) => (
                                <button
                                  key={z.id}
                                  type="button"
                                  onClick={() => {
                                    handleInputChange({
                                      target: {
                                        name: "zone",
                                        value: String(z.id),
                                      },
                                    } as any);
                                    setZoneOpen(false);
                                    setWoredaSearch("");
                                    setKebeleSearch("");
                                  }}
                                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#003366]/5 transition ${
                                    formData.zone === String(z.id)
                                      ? "bg-[#003366]/10 text-[#003366] font-bold"
                                      : "text-slate-700"
                                  }`}
                                >
                                  {locName(z)}
                                </button>
                              ))}
                            {zones.length === 0 && (
                              <p className="px-4 py-3 text-sm text-slate-400">
                                {isAm ? "ዞኖች እየተጫኑ ነው..." : "Loading zones..."}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Woreda - Searchable */}
                    <div ref={woredaRef} className="relative">
                      <label className="block text-sm font-bold text-[#003366] mb-1">
                        {isAm ? "ወረዳ" : "Woreda"}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div
                        onClick={() => {
                          if (formData.zone) {
                            setWoredaOpen(!woredaOpen);
                            setWoredaSearch("");
                          }
                        }}
                        className={`w-full rounded-lg border p-2.5 text-sm bg-white cursor-pointer flex items-center justify-between transition ${
                          !formData.zone
                            ? "border-slate-200 bg-slate-50"
                            : "border-slate-300 hover:border-[#003366]/40"
                        }`}
                      >
                        <span
                          className={
                            formData.woreda
                              ? "text-slate-800"
                              : "text-slate-400"
                          }
                        >
                          {formData.woreda
                            ? locName(
                                woredas.find(
                                  (w: any) => String(w.id) === formData.woreda,
                                ),
                              )
                            : !formData.zone
                              ? isAm
                                ? "መጀመሪያ ዞን ይምረጡ"
                                : "Select zone first"
                              : isAm
                                ? "ወረዳ ይምረጡ..."
                                : "Select Woreda..."}
                        </span>
                        <div className="flex items-center gap-1">
                          {formData.woreda && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInputChange({
                                  target: { name: "woreda", value: "" },
                                } as any);
                                setKebeleSearch("");
                              }}
                              className="text-slate-400 hover:text-red-500 transition"
                            >
                              <X size={14} />
                            </button>
                          )}
                          <ChevronDown
                            size={16}
                            className={`text-slate-400 transition ${woredaOpen ? "rotate-180" : ""}`}
                          />
                        </div>
                      </div>
                      {woredaOpen && (
                        <div className="absolute z-20 mt-1 w-full bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
                          <div className="p-2 border-b border-slate-100">
                            <div className="relative">
                              <Search
                                size={14}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                              />
                              <input
                                type="text"
                                value={woredaSearch}
                                onChange={(e) =>
                                  setWoredaSearch(e.target.value)
                                }
                                placeholder={
                                  isAm ? "ወረዳ ይፈልጉ..." : "Search woreda..."
                                }
                                className="w-full pl-8 pr-8 py-2 rounded-lg border border-slate-100 bg-slate-50 text-sm focus:outline-none focus:ring-1 focus:ring-[#003366]/30"
                              />
                              {woredaSearch && (
                                <button
                                  onClick={() => setWoredaSearch("")}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                  <X size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="max-h-40 overflow-y-auto">
                            {woredas
                              .filter((w: any) =>
                                locName(w)
                                  .toLowerCase()
                                  .includes(woredaSearch.toLowerCase()),
                              )
                              .map((w: any) => (
                                <button
                                  key={w.id}
                                  type="button"
                                  onClick={() => {
                                    handleInputChange({
                                      target: {
                                        name: "woreda",
                                        value: String(w.id),
                                      },
                                    } as any);
                                    setWoredaOpen(false);
                                    setKebeleSearch("");
                                  }}
                                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#003366]/5 transition ${
                                    formData.woreda === String(w.id)
                                      ? "bg-[#003366]/10 text-[#003366] font-bold"
                                      : "text-slate-700"
                                  }`}
                                >
                                  {locName(w)}
                                </button>
                              ))}
                            {woredas.length === 0 && (
                              <p className="px-4 py-3 text-sm text-slate-400">
                                {isAm
                                  ? "ወረዳዎች እየተጫኑ ነው..."
                                  : "Loading woredas..."}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Kebele - Searchable */}
                    <div ref={kebeleRef} className="relative">
                      <label className="block text-sm font-bold text-[#003366] mb-1">
                        {isAm ? "ቀበሌ" : "Kebele"}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div
                        onClick={() => {
                          if (formData.woreda) {
                            setKebeleOpen(!kebeleOpen);
                            setKebeleSearch("");
                          }
                        }}
                        className={`w-full rounded-lg border p-2.5 text-sm bg-white cursor-pointer flex items-center justify-between transition ${
                          !formData.woreda
                            ? "border-slate-200 bg-slate-50"
                            : "border-slate-300 hover:border-[#003366]/40"
                        }`}
                      >
                        <span
                          className={
                            formData.kebele
                              ? "text-slate-800"
                              : "text-slate-400"
                          }
                        >
                          {formData.kebele
                            ? locName(
                                kebeles.find(
                                  (k: any) => String(k.id) === formData.kebele,
                                ),
                              )
                            : !formData.woreda
                              ? isAm
                                ? "መጀመሪያ ወረዳ ይምረጡ"
                                : "Select woreda first"
                              : isAm
                                ? "ቀበሌ ይምረጡ..."
                                : "Select Kebele..."}
                        </span>
                        <div className="flex items-center gap-1">
                          {formData.kebele && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInputChange({
                                  target: { name: "kebele", value: "" },
                                } as any);
                              }}
                              className="text-slate-400 hover:text-red-500 transition"
                            >
                              <X size={14} />
                            </button>
                          )}
                          <ChevronDown
                            size={16}
                            className={`text-slate-400 transition ${kebeleOpen ? "rotate-180" : ""}`}
                          />
                        </div>
                      </div>
                      {kebeleOpen && (
                        <div className="absolute z-20 mt-1 w-full bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
                          <div className="p-2 border-b border-slate-100">
                            <div className="relative">
                              <Search
                                size={14}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                              />
                              <input
                                type="text"
                                value={kebeleSearch}
                                onChange={(e) =>
                                  setKebeleSearch(e.target.value)
                                }
                                placeholder={
                                  isAm ? "ቀበሌ ይፈልጉ..." : "Search kebele..."
                                }
                                className="w-full pl-8 pr-8 py-2 rounded-lg border border-slate-100 bg-slate-50 text-sm focus:outline-none focus:ring-1 focus:ring-[#003366]/30"
                              />
                              {kebeleSearch && (
                                <button
                                  onClick={() => setKebeleSearch("")}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                  <X size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="max-h-40 overflow-y-auto">
                            {kebeles
                              .filter((k: any) =>
                                locName(k)
                                  .toLowerCase()
                                  .includes(kebeleSearch.toLowerCase()),
                              )
                              .map((k: any) => (
                                <button
                                  key={k.id}
                                  type="button"
                                  onClick={() => {
                                    handleInputChange({
                                      target: {
                                        name: "kebele",
                                        value: String(k.id),
                                      },
                                    } as any);
                                    setKebeleOpen(false);
                                  }}
                                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#003366]/5 transition ${
                                    formData.kebele === String(k.id)
                                      ? "bg-[#003366]/10 text-[#003366] font-bold"
                                      : "text-slate-700"
                                  }`}
                                >
                                  {locName(k)}
                                </button>
                              ))}
                            {kebeles.length === 0 && (
                              <p className="px-4 py-3 text-sm text-slate-400">
                                {isAm
                                  ? "ቀበሌዎች እየተጫኑ ነው..."
                                  : "Loading kebeles..."}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-[#003366] mb-1">
                        {isAm ? "የቤት ቁጥር" : "House Number."}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="houseNo"
                        value={formData.houseNo}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#003366]/30 focus:border-[#003366] outline-none text-sm bg-white hover:border-[#003366]/50 transition-all shadow-sm"
                        placeholder={isAm ? "ለምሳሌ 124" : "e.g. 124"}
                      />
                    </div>
                    <div className="col-span-1 md:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-bold text-[#003366] mb-1">
                        {isAm ? "ልዩ ቦታ ስም" : "Special Location Name"}{" "}
                        <span className="text-orange-500 font-bold">
                          {isAm ? "(አማራጭ)" : "(OPTIONAL)"}
                        </span>
                      </label>
                      <input
                        type="text"
                        name="specialLocation"
                        value={formData.specialLocation}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#003366]/30 focus:border-[#003366] outline-none text-sm bg-white hover:border-[#003366]/50 transition-all shadow-sm"
                        placeholder={
                          isAm
                            ? "ለምሳሌ ከዋናው ፖስታ ቤት ጀርባ"
                            : "e.g. Behind the main post office"
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: REQUIRED DOCUMENTS */}
            {currentStep === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-bold mb-2 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#003366] to-[#001F3F] flex items-center justify-center">
                    <FileText className="h-4 w-4 text-[#FFD700]" />
                  </div>
                  <span className="text-[#003366]">
                    {isAm ? "የሚፈለጉ ሰነዶች" : "Required Documents"}
                  </span>
                </h2>
                <p className="text-sm text-slate-500 mb-6">
                  {isAm
                    ? "ሁሉንም አስፈላጊ ፋይሎች በPDF ቅርጸት ይስቀሉ (ከፍተኛ 5ሜባ በአንድ ፋይል)"
                    : "Upload all mandatory files in PDF format (Max 5MB per file)."}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getRequiredDocuments().map((doc, index) => (
                    <motion.div
                      key={doc.key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="p-4 border border-slate-200 rounded-xl bg-gradient-to-br from-white to-slate-50/50 flex flex-col justify-between hover:border-[#003366]/30 hover:shadow-md transition-all duration-300 group"
                    >
                      <div className="mb-3">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#003366] to-[#001F3F] flex items-center justify-center shrink-0 mt-0.5">
                            {getDocIcon(doc.key)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <label className="text-sm font-bold text-[#003366] block leading-snug">
                                {doc.label}{" "}
                                {doc.required && (
                                  <span className="text-red-500">*</span>
                                )}
                              </label>
                              {!doc.required && (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full shrink-0">
                                  {isAm ? "አማራጭ" : "Optional"}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              {isAm ? "PDF ከፍተኛ 5ሜባ" : "PDF Max 5MB"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <input
                          type="file"
                          id={doc.key}
                          accept=".pdf"
                          onChange={(e) => handleFileChange(e, doc.key)}
                          className="hidden"
                        />
                        {formData.documents[doc.key] ? (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#003366]/5 border border-[#003366]/20 text-sm">
                              <File className="h-4 w-4 text-[#003366] shrink-0" />
                              <span className="flex-1 truncate font-medium text-[#003366] text-xs">
                                {formData.documents[doc.key]?.name}
                              </span>
                              <span className="text-[10px] font-bold text-gray-400 shrink-0">
                                {(
                                  (formData.documents[doc.key]?.size || 0) /
                                  (1024 * 1024)
                                ).toFixed(2)}{" "}
                                MB
                              </span>
                            </div>
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  const url = URL.createObjectURL(
                                    formData.documents[doc.key]!,
                                  );
                                  setDocPreviewUrl(url);
                                }}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[#003366]/20 text-[10px] font-bold text-[#003366] hover:bg-[#003366]/5 transition-colors"
                              >
                                <Eye className="h-3.5 w-3.5" />{" "}
                                {isAm ? "ተመልከት" : "Preview"}
                              </button>
                              <label
                                htmlFor={doc.key}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-amber-200 text-[10px] font-bold text-amber-600 hover:bg-amber-50 cursor-pointer transition-colors"
                              >
                                <UploadCloud className="h-3.5 w-3.5" />{" "}
                                {isAm ? "እንደገና ጫን" : "Reupload"}
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => {
                                    const docs = { ...prev.documents };
                                    delete docs[doc.key];
                                    return { ...prev, documents: docs };
                                  });
                                }}
                                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-red-200 text-[10px] font-bold text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label
                            htmlFor={doc.key}
                            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 border-2 border-dashed bg-white border-slate-300 text-slate-600 hover:border-[#003366]/50 hover:bg-[#003366]/5"
                          >
                            <UploadCloud className="h-4 w-4" />
                            {isAm ? "ፋይል ይምረጡ" : "Select File"}
                          </label>
                        )}
                      </div>
                    </motion.div>
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
                  {isAm ? "ምዝገባ ተጠናቋል!" : "Registration Complete!"}
                </h2>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">
                  <strong className="text-slate-800">
                    {getCombinedName()}
                  </strong>{" "}
                  {isAm
                    ? "በስርዓቱ ውስጥ በተሳካ ሁኔታ ተመዝግቧል። የተጠቃሚ አካውንት እና የሰው ሃይል መገለጫ ተዘጋጅቷል።"
                    : "has been successfully added to the system. User account and HR profile generated."}
                </p>
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    window.location.reload();
                  }}
                  className="bg-gradient-to-r from-[#FFD700] to-[#C5A022] text-[#003366] px-6 py-2.5 rounded-lg text-sm font-bold hover:from-[#e6c200] hover:to-[#b8921f] transition-all shadow-md"
                >
                  {isAm ? "ሌላ ሰራተኛ ይመዝገቡ" : "Register Another Employee"}
                </motion.button>
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
                <motion.button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  whileHover={currentStep > 1 ? { y: -1 } : {}}
                  whileTap={currentStep > 1 ? { scale: 0.97 } : {}}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    currentStep === 1
                      ? "text-slate-400 cursor-not-allowed"
                      : "text-[#003366] hover:bg-[#003366]/10 bg-[#003366]/5 border border-[#003366]/10"
                  }`}
                >
                  <ArrowLeft className="h-4 w-4" /> {isAm ? "ተመለስ" : "Back"}
                </motion.button>

                {currentStep < 3 ? (
                  <motion.button
                    type="button"
                    onClick={nextStep}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold text-[#003366] bg-gradient-to-r from-[#FFD700] to-[#C5A022] hover:from-[#e6c200] hover:to-[#b8921f] transition-all shadow-sm"
                  >
                    {isAm ? "ቀጣይ" : "Continue"}{" "}
                    <ArrowRight className="h-4 w-4" />
                  </motion.button>
                ) : (
                  <motion.button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !!organizationLoadError}
                    whileHover={
                      !(isSubmitting || organizationLoadError) ? { y: -1 } : {}
                    }
                    whileTap={
                      !(isSubmitting || organizationLoadError)
                        ? { scale: 0.97 }
                        : {}
                    }
                    className={`inline-flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-sm ${
                      isSubmitting || organizationLoadError
                        ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#FFD700] to-[#C5A022] text-[#003366] hover:from-[#e6c200] hover:to-[#b8921f]"
                    }`}
                  >
                    {isSubmitting
                      ? isAm
                        ? "በመመዝገብ ላይ..."
                        : "Submitting..."
                      : isAm
                        ? "ምዝገባ ያጠናቅቁ"
                        : "Complete Registration"}
                    <CheckCircle2 className="h-4 w-4" />
                  </motion.button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {docPreviewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => {
            URL.revokeObjectURL(docPreviewUrl);
            setDocPreviewUrl(null);
          }}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-[90vw] max-w-4xl h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm font-bold text-[#003366]">
                {isAm ? "የሰነድ ቅድመ ዕይታ" : "Document Preview"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  URL.revokeObjectURL(docPreviewUrl);
                  setDocPreviewUrl(null);
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <iframe
              src={docPreviewUrl}
              title="Document Preview"
              className="flex-1 w-full border-0"
            />
          </div>
        </div>
      )}
    </div>
  );
}
