//filepath: frontend/src/pages/HRmanagement/PersonnelDetailsForm.tsx
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import {
  Users,
  Mail,
  Phone,
  Fingerprint,
  GraduationCap,
  Briefcase,
  MapPin,
  Shield,
  CheckCircle2,
  Upload,
  FileText,
  Eye,
  Trash2,
  ChevronDown,
  Info,
  Send,
  Loader2,
  X,
  Search,
} from "lucide-react";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { apiRequest } from "../../lib/api";
import { uploadOrganizationDocuments } from "../../lib/fileUploadHelper";

interface LocationOption {
  id: number;
  name: string;
  nameEnglish?: string;
  nameAmharic?: string;
}

interface PositionOption {
  id: number;
  name: string;
  nameEnglish?: string;
  nameAmharic?: string;
}

interface EducationOption {
  value: string;
  labelEn: string;
  labelAm: string;
}

const allowedPositionNames = [
  "Manager of Organization",
  "Operation of Organization",
  "Administrative and Finance of Organization",
];

const isAllowedPosition = (name: string) => {
  const normalized = String(name || "")
    .trim()
    .toLowerCase();
  return allowedPositionNames.some(
    (allowed) => normalized === allowed.toLowerCase(),
  );
};

const getLocalizedName = (
  item:
    | { name?: string; nameEnglish?: string; nameAmharic?: string }
    | null
    | undefined,
  isAm: boolean,
) => {
  const english = String(item?.nameEnglish || item?.name || "").trim();
  const amharic = String(item?.nameAmharic || "").trim();
  return isAm ? amharic || english : english || amharic;
};

const documentTypes = [
  {
    key: "fingerprint",
    labelEn: "Fingerprint from Police",
    labelAm: "ከፖሊስ የጣት አሻራ",
    required: true,
  },
  {
    key: "medical",
    labelEn: "Medical Result",
    labelAm: "የህክምና ውጤት",
    required: true,
  },
  {
    key: "training",
    labelEn: "Training Certificate",
    labelAm: "የስልጠና የምስክር ወረቀት",
    required: false,
  },
  {
    key: "support_letter",
    labelEn: "Support Letter (Kebele)",
    labelAm: "የድጋፍ ደብዳቤ (ቀበሌ)",
    required: false,
  },
  {
    key: "guarantee",
    labelEn: "Proof of Guarantee",
    labelAm: "የማስረጃ ማስረጃ",
    required: true,
  },
  {
    key: "experience",
    labelEn: "Work Experience",
    labelAm: "የስራ ልምድ",
    required: false,
  },
  {
    key: "resignation",
    labelEn: "Resignation Record",
    labelAm: "የመልቀቂያ መዝገብ",
    required: false,
  },
  {
    key: "education",
    labelEn: "Educational Certificate",
    labelAm: "የትምህርት የምስክር ወረቀት",
    required: true,
  },
  {
    key: "national_id",
    labelEn: "National ID",
    labelAm: "ብሄራዊ መታወቂያ",
    required: true,
  },
  {
    key: "kebele_or_passport",
    labelEn: "Renewed Kebele ID/Passport",
    labelAm: "የታደሰ የቀበሌ መታወቂያ/ፓስፖርት",
    required: true,
  },
  {
    key: "organizational_id",
    labelEn: "Organization Identification",
    labelAm: "የድርጅት መታወቂያ",
    required: true,
  },
];

const SearchableLocationSelect = ({
  label,
  placeholder,
  searchPlaceholder,
  value,
  options,
  disabled = false,
  required = false,
  language,
  onChange,
  onClear,
}: {
  label: string;
  placeholder: string;
  searchPlaceholder: string;
  value: string;
  options: LocationOption[];
  disabled?: boolean;
  required?: boolean;
  language: string;
  onChange: (value: string) => void;
  onClear: () => void;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isAm = language === "am";

  const selectedOption = options.find(
    (option) => String(option.id) === String(value),
  );
  const getOptionLabel = (option: LocationOption) =>
    getLocalizedName(option, isAm);

  React.useEffect(() => {
    if (!isOpen) setSearchTerm("");
  }, [isOpen]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((option) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return getOptionLabel(option).toLowerCase().includes(term);
  });

  return (
    <div ref={containerRef} className="space-y-1.5 text-left relative">
      <label className="block text-xs font-bold text-[#003366] uppercase tracking-wider mb-1.5">
        {label}
        {required && <span className="text-orange-500"> *</span>}
      </label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setIsOpen((prev) => !prev);
        }}
        className={`w-full rounded-xl border px-4 py-2.5 text-sm text-left flex items-center justify-between gap-3 transition-all relative ${
          disabled
            ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-white border-gray-200 hover:border-[#003366]/50"
        }`}
      >
        <span
          className={`truncate ${
            selectedOption ? "text-gray-900 font-medium" : "text-gray-400"
          }`}
        >
          {getOptionLabel(selectedOption as LocationOption) || placeholder}
        </span>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-gray-400">
          {selectedOption ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onClear();
              }}
              className="p-0.5 rounded-full hover:bg-red-50 hover:text-red-600 transition-all"
              aria-label={`Clear ${label}`}
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </span>
      </button>

      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1.5 rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden">
          <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2.5 bg-gray-50">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400"
              autoFocus
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="shrink-0 p-1 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="max-h-52 overflow-auto p-1.5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onChange(String(option.id));
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all ${
                    String(option.id) === String(value)
                      ? "bg-[#003366] text-white font-bold"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {getOptionLabel(option)}
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-sm text-gray-400 text-center">
                {searchTerm
                  ? isAm
                    ? "ምንም አማራጭ አልተገኘም"
                    : "No matching options"
                  : isAm
                    ? "ምንም አማራጭ የለም"
                    : "No options available"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function PersonnelDetailsForm() {
  const { language } = useLanguage();
  const isAm = language === "am";
  const t = (en: string, am: string) => (isAm ? am : en);

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("");
  const [citizenship] = useState("ETHIOPIAN");
  const [age, setAge] = useState("");
  const [faydaId, setFaydaId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+251");
  const [position, setPosition] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [workExpYears, setWorkExpYears] = useState("");
  const [totalExpYears, setTotalExpYears] = useState("");
  const [region, setRegion] = useState("");
  const [zone, setZone] = useState("");
  const [woreda, setWoreda] = useState("");
  const [kebele, setKebele] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [specialLocation, setSpecialLocation] = useState("");
  const [reason, setReason] = useState("");
  const [files, setFiles] = useState<Record<string, File>>({});
  const [activeDocKey, setActiveDocKey] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [openInfo, setOpenInfo] = useState<string | null>(null);
  const [openPosInfo, setOpenPosInfo] = useState<string | null>(null);
  const [positionOptions, setPositionOptions] = useState<PositionOption[]>([]);
  const [regions, setRegions] = useState<LocationOption[]>([]);
  const [zones, setZones] = useState<LocationOption[]>([]);
  const [woredas, setWoredas] = useState<LocationOption[]>([]);
  const [kebeles, setKebeles] = useState<LocationOption[]>([]);
  const [positionLoading, setPositionLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [educationOptions, setEducationOptions] = useState<EducationOption[]>(
    [],
  );
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [organizationName, setOrganizationName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation UI state
  const [usernameValid, setUsernameValid] = useState<
    "idle" | "loading" | "valid" | "invalid"
  >("idle");
  const [faydaValid, setFaydaValid] = useState<
    "idle" | "loading" | "valid" | "invalid"
  >("idle");
  const [emailValid, setEmailValid] = useState<
    "idle" | "loading" | "valid" | "invalid"
  >("idle");
  const [phoneValid, setPhoneValid] = useState<
    "idle" | "loading" | "valid" | "invalid"
  >("idle");

  // Store exact-match info returned from backend to provide precise feedback
  const [usernameExactMatch, setUsernameExactMatch] = useState<boolean | null>(
    null,
  );
  const [usernameExistingValue, setUsernameExistingValue] = useState<
    string | null
  >(null);
  const [faydaExactMatch, setFaydaExactMatch] = useState<boolean | null>(null);
  const [faydaExistingValue, setFaydaExistingValue] = useState<string | null>(
    null,
  );
  const [emailExactMatch, setEmailExactMatch] = useState<boolean | null>(null);
  const [emailExistingValue, setEmailExistingValue] = useState<string | null>(
    null,
  );
  const [phoneExactMatch, setPhoneExactMatch] = useState<boolean | null>(null);
  const [phoneExistingValue, setPhoneExistingValue] = useState<string | null>(
    null,
  );

  // Lock state: when a value is available (not existing) we lock input to prevent edits
  const [usernameLocked, setUsernameLocked] = useState(false);
  const [faydaLocked, setFaydaLocked] = useState(false);
  const [emailLocked, setEmailLocked] = useState(false);
  const [phoneLocked, setPhoneLocked] = useState(false);

  const validateUsername = async () => {
    setUsernameValid("loading");
    try {
      const val = username.trim();
      if (!val) throw new Error("empty");
      const res = await apiRequest(
        `/users/validate?field=username&value=${encodeURIComponent(val)}`,
      );
      const payload = (res && (res as any).data) || res;
      const exists = Boolean(payload?.exists);
      const exactMatch =
        typeof payload?.exactMatch === "boolean" ? payload.exactMatch : null;
      const existingValue = payload?.existingValue ?? null;

      setUsernameExactMatch(exactMatch);
      setUsernameExistingValue(existingValue);

      if (exists) {
        // already exists in system -> mark invalid and allow editing
        setUsernameValid("invalid");
        setUsernameLocked(false);
      } else {
        // not exists -> available -> lock the input
        setUsernameValid("valid");
        setUsernameLocked(true);
      }
    } catch (err) {
      setUsernameValid("invalid");
      setUsernameLocked(false);
    }
  };

  const validateFayda = async () => {
    setFaydaValid("loading");
    try {
      const val = faydaId.trim();
      if (!val) throw new Error("empty");
      const res = await apiRequest(
        `/users/validate?field=faydaId&value=${encodeURIComponent(val)}`,
      );
      const payload = (res && (res as any).data) || res;
      const exists = Boolean(payload?.exists);
      const exactMatch =
        typeof payload?.exactMatch === "boolean" ? payload.exactMatch : null;
      const existingValue = payload?.existingValue ?? null;

      setFaydaExactMatch(exactMatch);
      setFaydaExistingValue(existingValue);

      if (exists) {
        setFaydaValid("invalid");
        setFaydaLocked(false);
      } else {
        setFaydaValid("valid");
        setFaydaLocked(true);
      }
    } catch (err) {
      setFaydaValid("invalid");
      setFaydaLocked(false);
    }
  };

  const validateEmail = async () => {
    setEmailValid("loading");
    try {
      const val = email.trim();
      const re = /\S+@\S+\.\S+/;
      if (!re.test(val)) throw new Error("format");
      const res = await apiRequest(
        `/users/validate?field=email&value=${encodeURIComponent(val)}`,
      );
      const payload = (res && (res as any).data) || res;
      const exists = Boolean(payload?.exists);
      const exactMatch =
        typeof payload?.exactMatch === "boolean" ? payload.exactMatch : null;
      const existingValue = payload?.existingValue ?? null;

      setEmailExactMatch(exactMatch);
      setEmailExistingValue(existingValue);

      if (exists) {
        setEmailValid("invalid");
        setEmailLocked(false);
      } else {
        setEmailValid("valid");
        setEmailLocked(true);
      }
    } catch (err) {
      setEmailValid("invalid");
      setEmailLocked(false);
    }
  };

  const validatePhone = async () => {
    setPhoneValid("loading");
    try {
      const val = phone.trim();
      const re = /^\+?\d{7,15}$/;
      if (!re.test(val)) throw new Error("format");
      const res = await apiRequest(
        `/users/validate?field=phone&value=${encodeURIComponent(val)}`,
      );
      const payload = (res && (res as any).data) || res;
      const exists = Boolean(payload?.exists);
      const exactMatch =
        typeof payload?.exactMatch === "boolean" ? payload.exactMatch : null;
      const existingValue = payload?.existingValue ?? null;

      setPhoneExactMatch(exactMatch);
      setPhoneExistingValue(existingValue);

      if (exists) {
        setPhoneValid("invalid");
        setPhoneLocked(false);
      } else {
        setPhoneValid("valid");
        setPhoneLocked(true);
      }
    } catch (err) {
      setPhoneValid("invalid");
      setPhoneLocked(false);
    }
  };

  const availableEducationOptions = educationOptions;
  const selectedPositionOption = positionOptions.find(
    (pos) => String(pos.id) === position,
  );
  const shouldShowEducationLevel = Boolean(
    selectedPositionOption && isAllowedPosition(selectedPositionOption.name),
  );

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const response = await apiRequest<{ success: boolean; data?: any }>(
          "/employees/my-organization",
        );
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
      }
    };

    fetchOrganization();

    const loadPositionOptions = async () => {
      setPositionLoading(true);
      try {
        const response = await apiRequest<{ success: boolean; data: any }>(
          "/positions",
        );
        const payload = response.data || response;
        const positions = Array.isArray(payload)
          ? payload
          : payload?.data || [];
        setPositionOptions(
          positions
            .map((item: any) => {
              const englishName = String(
                item?.nameEnglish || item?.name || item?.positionName || "",
              ).trim();
              const amharicName = String(
                item?.nameAmharic || item?.positionNameAm || "",
              ).trim();
              return {
                id: Number(item?.id),
                name: englishName || amharicName,
                nameEnglish: englishName,
                nameAmharic: amharicName,
              };
            })
            .filter((position: PositionOption) =>
              isAllowedPosition(
                position.nameEnglish ||
                  position.name ||
                  position.nameAmharic ||
                  "",
              ),
            ),
        );
      } catch (error) {
        console.error("Failed to load positions", error);
      } finally {
        setPositionLoading(false);
      }
    };

    const loadRegions = async () => {
      setLocationLoading(true);
      try {
        const response = await apiRequest<{ success: boolean; data: any }>(
          "/location/regions",
        );
        const payload = response.data || response;
        const regionList = Array.isArray(payload)
          ? payload
          : payload?.data || [];
        setRegions(
          regionList.map((item: any) => {
            const englishName = String(
              item?.nameEnglish ||
                item?.name ||
                item?.regionName ||
                item?.region_name_en ||
                "",
            ).trim();
            const amharicName = String(
              item?.nameAmharic ||
                item?.regionNameAm ||
                item?.region_name_am ||
                englishName,
            ).trim();
            return {
              id: Number(item?.id),
              name: englishName || amharicName,
              nameEnglish: englishName || amharicName,
              nameAmharic: amharicName || englishName,
            };
          }),
        );
      } catch (error) {
        console.error("Failed to load regions", error);
      } finally {
        setLocationLoading(false);
      }
    };

    loadPositionOptions();
    loadRegions();
  }, []);

  useEffect(() => {
    if (!region) {
      setZones([]);
      setWoredas([]);
      setKebeles([]);
      setZone("");
      setWoreda("");
      setKebele("");
      return;
    }

    const fetchZones = async () => {
      setLocationLoading(true);
      try {
        const response = await apiRequest<{ success: boolean; data: any }>(
          `/location/regions/${region}/zones`,
        );
        const payload = response.data || response;
        const zoneList = Array.isArray(payload) ? payload : payload?.data || [];
        setZones(
          zoneList.map((item: any) => {
            const englishName = String(
              item?.nameEnglish ||
                item?.name ||
                item?.zoneName ||
                item?.zone_name_en ||
                "",
            ).trim();
            const amharicName = String(
              item?.nameAmharic ||
                item?.zoneNameAm ||
                item?.zone_name_am ||
                englishName,
            ).trim();
            return {
              id: Number(item?.id),
              name: englishName || amharicName,
              nameEnglish: englishName || amharicName,
              nameAmharic: amharicName || englishName,
            };
          }),
        );
      } catch (error) {
        console.error("Failed to load zones", error);
        setZones([]);
      } finally {
        setLocationLoading(false);
      }
    };

    fetchZones();
  }, [region]);

  useEffect(() => {
    if (!zone) {
      setWoredas([]);
      setKebeles([]);
      setWoreda("");
      setKebele("");
      return;
    }

    const fetchWoredas = async () => {
      setLocationLoading(true);
      try {
        const response = await apiRequest<{ success: boolean; data: any }>(
          `/location/zones/${zone}/woredas`,
        );
        const payload = response.data || response;
        const woredaList = Array.isArray(payload)
          ? payload
          : payload?.data || [];
        setWoredas(
          woredaList.map((item: any) => {
            const englishName = String(
              item?.nameEnglish ||
                item?.name ||
                item?.woredaName ||
                item?.woreda_name_en ||
                "",
            ).trim();
            const amharicName = String(
              item?.nameAmharic ||
                item?.woredaNameAm ||
                item?.woreda_name_am ||
                englishName,
            ).trim();
            return {
              id: Number(item?.id),
              name: englishName || amharicName,
              nameEnglish: englishName || amharicName,
              nameAmharic: amharicName || englishName,
            };
          }),
        );
      } catch (error) {
        console.error("Failed to load woredas", error);
        setWoredas([]);
      } finally {
        setLocationLoading(false);
      }
    };

    fetchWoredas();
  }, [zone]);

  useEffect(() => {
    if (!woreda) {
      setKebeles([]);
      setKebele("");
      return;
    }

    const fetchKebeles = async () => {
      setLocationLoading(true);
      try {
        const response = await apiRequest<{ success: boolean; data: any }>(
          `/location/woredas/${woreda}/kebeles`,
        );
        const payload = response.data || response;
        const kebeleList = Array.isArray(payload)
          ? payload
          : payload?.data || [];
        setKebeles(
          kebeleList.map((item: any) => {
            const englishName = String(
              item?.nameEnglish ||
                item?.name ||
                item?.kebeleName ||
                item?.kebele_name_en ||
                "",
            ).trim();
            const amharicName = String(
              item?.nameAmharic ||
                item?.kebeleNameAm ||
                item?.kebele_name_am ||
                englishName,
            ).trim();
            return {
              id: Number(item?.id),
              name: englishName || amharicName,
              nameEnglish: englishName || amharicName,
              nameAmharic: amharicName || englishName,
            };
          }),
        );
      } catch (error) {
        console.error("Failed to load kebeles", error);
        setKebeles([]);
      } finally {
        setLocationLoading(false);
      }
    };

    fetchKebeles();
  }, [woreda]);

  useEffect(() => {
    if (!position) {
      setEducationOptions([]);
      setEducationLevel("");
      return;
    }

    const selectedPosition = positionOptions.find(
      (pos) => String(pos.id) === position,
    );

    if (!selectedPosition || !isAllowedPosition(selectedPosition.name)) {
      setEducationOptions([]);
      setEducationLevel("");
      return;
    }

    const loadPositionRequirements = async () => {
      try {
        const response = await apiRequest<{ success: boolean; data: any }>(
          `/positions/${position}`,
        );
        const payload = response.data || response;
        let requirements =
          payload?.requirements ||
          payload?.positionRequirements ||
          payload?.data?.requirements ||
          payload?.data?.positionRequirements ||
          [];

        if (!Array.isArray(requirements)) {
          requirements = [];
        }

        if (requirements.length === 0) {
          try {
            const reqResponse = await apiRequest<{
              success: boolean;
              data: any;
            }>(`/positions/${position}/requirements`);
            const reqPayload = reqResponse.data || reqResponse;
            requirements = Array.isArray(reqPayload)
              ? reqPayload
              : reqPayload?.data || [];
          } catch (innerError) {
            requirements = [];
          }
        }

        const optionSets: EducationOption[] = Array.from(
          new Map<string, EducationOption>(
            (requirements || [])
              .filter(
                (req: { requiredEducationLevel?: string | null }) =>
                  req?.requiredEducationLevel !== undefined &&
                  req?.requiredEducationLevel !== null &&
                  String(req.requiredEducationLevel).trim().length > 0,
              )
              .map((req: { requiredEducationLevel?: string | null }) => {
                const rawValue = String(req.requiredEducationLevel).trim();
                return [
                  rawValue,
                  {
                    value: rawValue,
                    labelEn: rawValue,
                    labelAm: rawValue,
                  },
                ] as const;
              }),
          ).values(),
        );

        setEducationOptions(optionSets);
        setEducationLevel((prev) =>
          optionSets.length === 0 ||
          !optionSets.some((opt: EducationOption) => opt.value === prev)
            ? ""
            : prev,
        );
      } catch (error) {
        console.error("Failed to load position requirements", error);
        setEducationOptions([]);
        setEducationLevel("");
      }
    };

    loadPositionRequirements();
  }, [position, positionOptions]);

  const infoTexts: Record<string, { en: string; am: string }> = {
    fingerprint: {
      en: "Fingerprint from the police (proof of criminal record)",
      am: "ከፖሊስ የጣት አሻራ (የወንጀል ሪከርድ ማረጋገጫ)",
    },
    medical: {
      en: "Bring your medical test outcome from a hospital or clinic",
      am: "ከሆስፒታል ወይም ክሊኒክ የህክምና ምርመራ ውጤትዎን ያምጡ",
    },
    national_id: {
      en: "Upload a photo of your National ID or Digital Fayda ID front and back as a PDF",
      am: "የብሄራዊ መታወቂያዎ ወይም የዲጂታል ፋይዳ መታወቂያዎ ፊት እና ጀርባ ፎቶ እንደ PDF ያስገቡ",
    },
  };

  const handleFileSelect = (docKey: string) => {
    setActiveDocKey(docKey);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeDocKey) {
      setFiles((prev) => ({ ...prev, [activeDocKey]: file }));
    }
    e.target.value = "";
  };

  const getCombinedName = () =>
    [firstName, middleName, lastName].filter(Boolean).join(" ");

  const getUploadRoleForPosition = (positionId: string) => {
    const selected = positionOptions.find((p) => String(p.id) === positionId);
    const title = String(selected?.name || "").toLowerCase();
    if (title.includes("manager")) return "manager";
    if (title.includes("administrator") || title.includes("admin"))
      return "administrator";
    if (title.includes("operation")) return "operations";
    if (title.includes("security") || title.includes("guard"))
      return "security_guard";
    return "organization";
  };

  const buildUploadFilesPayload = () => {
    const uploadRole = getUploadRoleForPosition(position);
    return Object.entries(files).reduce<Record<string, File>>(
      (payload, [docKey, file]) => {
        if (file) payload[`${uploadRole}_${docKey}`] = file;
        return payload;
      },
      {},
    );
  };

  const normalizeUploadedFilesKeys = (
    uploadedFiles: Record<string, string>,
  ) => {
    const uploadRole = getUploadRoleForPosition(position);
    const result: Record<string, string> = {};
    for (const [fieldName, url] of Object.entries(uploadedFiles)) {
      if (!fieldName) continue;
      if (fieldName.startsWith(`${uploadRole}_`)) {
        const withoutPrefix = fieldName.slice(uploadRole.length + 1);
        result[withoutPrefix] = url;
        result[fieldName] = url;
        continue;
      }
      const segments = fieldName.split("_");
      const key = segments.slice(1).join("_");
      result[key] = url;
    }
    return result;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setSubmitting(true);

    try {
      if (!organizationId || !organizationName) {
        throw new Error(
          isAm
            ? "ያለ ድርጅት መረጃ ሰራተኛ መመዝገብ አይቻልም"
            : "Cannot register employee without organization context",
        );
      }

      if (!newPassword || !confirmPassword) {
        throw new Error(
          isAm
            ? "እባክዎ የይለፍ ቃልና ማረጋገጫ ያስገቡ"
            : "Please enter both password and confirm password.",
        );
      }

      if (newPassword !== confirmPassword) {
        throw new Error(
          isAm
            ? "የይለፍ ቃል እና ማረጋገጫ የማይዛመዱ ናቸው"
            : "Password and confirm password do not match",
        );
      }

      // Upload files first
      const filesToUpload = buildUploadFilesPayload();
      let uploadedFilesMap: Record<string, string> = {};

      if (Object.keys(filesToUpload).length > 0) {
        const uploadResult = await uploadOrganizationDocuments(
          organizationName,
          filesToUpload,
          {
            employeeFullName: getCombinedName(),
            employeePositionName:
              positionOptions.find((p) => String(p.id) === position)?.name ||
              "",
          },
        );

        if (!uploadResult.success || !uploadResult.data?.uploadedFiles) {
          throw new Error(
            uploadResult.error || uploadResult.message || "Upload failed",
          );
        }

        uploadedFilesMap = normalizeUploadedFilesKeys(
          uploadResult.data.uploadedFiles,
        );
      }

      // This form is for registering a new employee, so it should always
      // submit as a new-personnel-change request regardless of position.
      const payload: any = {
        requestType: "NEW_EMPLOYEE",
        username:
          username ||
          faydaId ||
          (email ? email.split("@")[0] : phone || "user"),
        password: newPassword,
        confirmPassword: confirmPassword,
        fullName: getCombinedName(),
        email,
        phone,
        faydaId,
        organizationId,
        positionId: position ? Number(position) : null,
        educationLevel,
        workExpYears: workExpYears ? Number(workExpYears) : null,
        TotalExpYears: totalExpYears ? Number(totalExpYears) : null,
        gender,
        citizenship,
        age: age ? Number(age) : null,
        startedDate: null,
        kebeleId: kebele ? Number(kebele) : null,
        houseNo,
        specialLocation,
        reason: reason || "New employee registration",
        uploadedFiles: uploadedFilesMap,
      };

      const res = await apiRequest("/personnel-change-requests", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res?.success) {
        setSubmitted(true);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error(
          res?.message || "Failed to submit personnel change request",
        );
      }
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Submission error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="relative overflow-hidden bg-gradient-to-r from-[#003366] to-[#001F3F] rounded-3xl p-6 border border-white/10">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FFD700] via-[#C5A022] to-[#FFD700]" />
        <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-[#FFD700]/5" />
        <div className="relative z-10">
          <h1 className="text-xl font-black text-white uppercase tracking-tight">
            {t("New Personnel Details", "የአዲስ ሰራተኛ ዝርዝሮች")}
          </h1>
          <p className="text-xs text-white/50 font-medium mt-1">
            {t(
              "Fill in the details for the new personnel member",
              "የአዲሱን የሰራተኛ አባል ዝርዝሮች ያስገቡ",
            )}
          </p>
        </div>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="space-y-8 relative"
      >
        {submitting && (
          <LoadingSpinner overlay text="Sending personnel details..." />
        )}

        {submitted && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {t(
              "Personnel details sent successfully!",
              "የሰራተኛ ዝርዝሮች በተሳካ ሁኔታ ተልከዋል!",
            )}
          </div>
        )}

        {/* Basic Info */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#003366] to-[#001F3F] text-[#FFD700] flex items-center justify-center shadow-sm">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#003366]">
              {t("Basic Information", "መሰረታዊ መረጃ")}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#003366] uppercase tracking-wider mb-1.5">
                {t("First Name", "ስም")}{" "}
                <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) =>
                  setFirstName(
                    e.target.value.replace(/[^a-zA-Z\u1200-\u137F\s]/g, ""),
                  )
                }
                required
                placeholder={t("First name...", "ስም...")}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] hover:border-[#003366]/30 transition-all ${firstName ? "border-gray-200" : "border-gray-200"}`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#003366] uppercase tracking-wider mb-1.5">
                {t("Middle Name", "የአባት ስም")}{" "}
                <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                value={middleName}
                onChange={(e) =>
                  setMiddleName(
                    e.target.value.replace(/[^a-zA-Z\u1200-\u137F\s]/g, ""),
                  )
                }
                required
                placeholder={t("Middle name...", "የአባት ስም...")}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] hover:border-[#003366]/30 transition-all ${middleName ? "border-gray-200" : "border-gray-200"}`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#003366] uppercase tracking-wider mb-1.5">
                {t("Last Name", "የአያት ስም")}{" "}
                <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) =>
                  setLastName(
                    e.target.value.replace(/[^a-zA-Z\u1200-\u137F\s]/g, ""),
                  )
                }
                required
                placeholder={t("Last name...", "የአያት ስም...")}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] hover:border-[#003366]/30 transition-all ${lastName ? "border-gray-200" : "border-gray-200"}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#003366] uppercase tracking-wider mb-1.5">
                {t("Username", "የተጠቃሚ ስም")}{" "}
                <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={usernameLocked}
                required
                placeholder={t("Username...", "የተጠቃሚ ስም...")}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] hover:border-[#003366]/30 transition-all ${username ? "border-gray-200" : "border-gray-200"} ${usernameLocked ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""}`}
              />
              <div className="mt-2 flex items-center justify-end gap-2">
                {usernameValid === "loading" && (
                  <Loader2 className="w-4 h-4 text-[#003366] animate-spin" />
                )}
                {usernameValid === "valid" && (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                )}
                {usernameValid === "invalid" && (
                  <X className="w-4 h-4 text-rose-600" />
                )}
                <button
                  type="button"
                  onClick={validateUsername}
                  className="ml-2 bg-[#003366] text-white px-3 py-1.5 rounded-full text-sm font-semibold hover:bg-[#00264d] transition-all"
                >
                  {t("Validate", "ያረጋግጡ")}
                </button>
              </div>
              <p className="mt-1 text-xs">
                {usernameValid === "valid" && (
                  <span className="text-green-600">
                    {t("Available — locked", "እንደ ይዘት የለም — ተዘግቷል")}
                  </span>
                )}
                {usernameValid === "invalid" && (
                  <span className="text-rose-600">
                    {t("Already exists — please change", "ቀድሞ አለ — እባክዎ ይቀይሩ")}
                    {usernameExactMatch === false && usernameExistingValue && (
                      <span className="block text-[11px] text-rose-500">
                        {t("Existing value:", "ያለው:")} {usernameExistingValue}
                      </span>
                    )}
                  </span>
                )}
                {usernameValid === "loading" && (
                  <span className="text-gray-500">
                    {t("Checking...", "እየሰራ ነው...")}
                  </span>
                )}
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#003366] uppercase tracking-wider mb-1.5">
                {t("New Password", "አዲስ የይለፍ ቃል")}{" "}
                <span className="text-orange-500">*</span>
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder={t("New password...", "አዲስ የይለፍ ቃል...")}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] hover:border-[#003366]/30 transition-all ${newPassword ? "border-gray-200" : "border-gray-200"}`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#003366] uppercase tracking-wider mb-1.5">
                {t("Confirm Password", "የይለፍ ቃል ማረጋገጫ")}{" "}
                <span className="text-orange-500">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder={t("Confirm password...", "የይለፍ ቃል ያረጋግጡ...")}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] hover:border-[#003366]/30 transition-all ${confirmPassword ? "border-gray-200" : "border-gray-200"}`}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#003366] uppercase tracking-wider mb-1.5">
                {t("Gender", "ጾታ")} <span className="text-orange-500">*</span>
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] hover:border-[#003366]/30 transition-all"
              >
                <option value="">{t("Select...", "ይምረጡ...")}</option>
                <option value="Male">{t("Male", "ወንድ")}</option>
                <option value="Female">{t("Female", "ሴት")}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#003366] uppercase tracking-wider mb-1.5">
                {t("Age", "እድሜ")}
              </label>
              <div className="flex items-center rounded-xl border border-gray-200 bg-white focus-within:ring-2 focus-within:ring-[#003366]/20 focus-within:border-[#003366] transition-all">
                <input
                  type="text"
                  inputMode="numeric"
                  value={age}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "");
                    setAge(v);
                  }}
                  onBlur={() => {
                    if (
                      age !== "" &&
                      (parseInt(age) < 18 || parseInt(age) > 80)
                    )
                      setAge("18");
                  }}
                  placeholder={t("Age", "እድሜ")}
                  className="w-full px-4 py-2.5 text-sm outline-none bg-transparent"
                />
                <div className="flex flex-col border-l border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      const n = age === "" ? 18 : parseInt(age, 10);
                      if (n < 80) setAge(String(n + 1));
                    }}
                    className="px-2 py-0.5 text-gray-500 hover:text-[#003366] hover:bg-gray-50 transition-all text-xs leading-none border-b border-gray-200"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const n = age === "" ? 18 : parseInt(age, 10);
                      if (n > 18) setAge(String(n - 1));
                    }}
                    className="px-2 py-0.5 text-gray-500 hover:text-[#003366] hover:bg-gray-50 transition-all text-xs leading-none"
                  >
                    ▼
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#003366] uppercase tracking-wider mb-1.5">
                {t("Citizenship", "ዜግነት")}
              </label>
              <input
                type="text"
                value={citizenship}
                disabled
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none cursor-not-allowed bg-gray-50 text-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Identity & Contact */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#003366] to-[#001F3F] text-[#FFD700] flex items-center justify-center shadow-sm">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#003366]">
              {t("Identity & Contact", "መታወቂያ እና ግንኙነት")}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-[#003366] uppercase tracking-wider mb-1.5">
                <Fingerprint className="w-3.5 h-3.5 inline mr-1 text-[#FFD700]" />
                {t("Fayda ID", "የፋይዳ መታወቂያ")}{" "}
                <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                value={faydaId}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
                  setFaydaId(digits);
                }}
                disabled={faydaLocked}
                required
                placeholder="FAN-XXXXX"
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] hover:border-[#003366]/30 transition-all ${faydaId ? "border-gray-200" : "border-gray-200"} ${faydaLocked ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""}`}
              />
              <div className="mt-2 flex items-center justify-end gap-2">
                {faydaValid === "loading" && (
                  <Loader2 className="w-4 h-4 text-[#003366] animate-spin" />
                )}
                {faydaValid === "valid" && (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                )}
                {faydaValid === "invalid" && (
                  <X className="w-4 h-4 text-rose-600" />
                )}
                <button
                  type="button"
                  onClick={validateFayda}
                  className="ml-2 bg-[#003366] text-white px-3 py-1.5 rounded-full text-sm font-semibold hover:bg-[#00264d] transition-all"
                >
                  {t("Validate", "ያረጋግጡ")}
                </button>
              </div>
              <p className="mt-1 text-xs">
                {faydaValid === "valid" && (
                  <span className="text-green-600">
                    {t("Fayda not found — locked", "ፋይዳ አልተገኘም — ተዘግቷል")}
                  </span>
                )}
                {faydaValid === "invalid" && (
                  <span className="text-rose-600">
                    {t(
                      "Fayda exists — please provide a different one",
                      "ፋይዳ አለ — እባክዎ በሌላ ይሙሉ",
                    )}
                    {faydaExactMatch === false && faydaExistingValue && (
                      <span className="block text-[11px] text-rose-500">
                        {t("Existing value:", "ያለው:")} {faydaExistingValue}
                      </span>
                    )}
                  </span>
                )}
                {faydaValid === "loading" && (
                  <span className="text-gray-500">
                    {t("Checking...", "እየሰራ ነው...")}
                  </span>
                )}
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#003366] uppercase tracking-wider mb-1.5">
                <Mail className="w-3.5 h-3.5 inline mr-1 text-[#FFD700]" />
                {t("Email", "ኢሜይል")} <span className="text-orange-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={emailLocked}
                required
                placeholder="email@example.com"
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] hover:border-[#003366]/30 transition-all ${email ? "border-gray-200" : "border-gray-200"} ${emailLocked ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""}`}
              />
              <div className="mt-2 flex items-center justify-end gap-2">
                {emailValid === "loading" && (
                  <Loader2 className="w-4 h-4 text-[#003366] animate-spin" />
                )}
                {emailValid === "valid" && (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                )}
                {emailValid === "invalid" && (
                  <X className="w-4 h-4 text-rose-600" />
                )}
                <button
                  type="button"
                  onClick={validateEmail}
                  className="ml-2 bg-[#003366] text-white px-3 py-1.5 rounded-full text-sm font-semibold hover:bg-[#00264d] transition-all"
                >
                  {t("Validate", "ያረጋግጡ")}
                </button>
              </div>
              <p className="mt-1 text-xs">
                {emailValid === "valid" && (
                  <span className="text-green-600">
                    {t("Email not found — locked", "ኢሜይል አልተገኘም — ተዘግቷል")}
                  </span>
                )}
                {emailValid === "invalid" && (
                  <span className="text-rose-600">
                    {t(
                      "Email exists — please use another",
                      "ኢሜይል አለ — እባክዎ ሌላ ይጠቀሙ",
                    )}
                    {emailExactMatch === false && emailExistingValue && (
                      <span className="block text-[11px] text-rose-500">
                        {t("Existing value:", "ያለው:")} {emailExistingValue}
                      </span>
                    )}
                  </span>
                )}
                {emailValid === "loading" && (
                  <span className="text-gray-500">
                    {t("Checking...", "እየሰራ ነው...")}
                  </span>
                )}
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#003366] uppercase tracking-wider mb-1.5">
                <Phone className="w-3.5 h-3.5 inline mr-1 text-[#FFD700]" />
                {t("Phone", "ስልክ")} <span className="text-orange-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (!raw.startsWith("+251")) {
                    setPhone("+251");
                    return;
                  }
                  const suffix = raw.slice(4).replace(/\D/g, "").slice(0, 9);
                  setPhone("+251" + suffix);
                }}
                disabled={phoneLocked}
                required
                placeholder="+251..."
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] hover:border-[#003366]/30 transition-all ${phone ? "border-gray-200" : "border-gray-200"} ${phoneLocked ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""}`}
              />
              <div className="mt-2 flex items-center justify-end gap-2">
                {phoneValid === "loading" && (
                  <Loader2 className="w-4 h-4 text-[#003366] animate-spin" />
                )}
                {phoneValid === "valid" && (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                )}
                {phoneValid === "invalid" && (
                  <X className="w-4 h-4 text-rose-600" />
                )}
                <button
                  type="button"
                  onClick={validatePhone}
                  className="ml-2 bg-[#003366] text-white px-3 py-1.5 rounded-full text-sm font-semibold hover:bg-[#00264d] transition-all"
                >
                  {t("Validate", "ያረጋግጡ")}
                </button>
              </div>
              <p className="mt-1 text-xs">
                {phoneValid === "valid" && (
                  <span className="text-green-600">
                    {t("Phone not found — locked", "ስልክ አልተገኘም — ተዘግቷል")}
                  </span>
                )}
                {phoneValid === "invalid" && (
                  <span className="text-rose-600">
                    {t(
                      "Phone exists — please use another",
                      "ስልክ አለ — እባክዎ ሌላ ይጠቀሙ",
                    )}
                    {phoneExactMatch === false && phoneExistingValue && (
                      <span className="block text-[11px] text-rose-500">
                        {t("Existing value:", "ያለው:")} {phoneExistingValue}
                      </span>
                    )}
                  </span>
                )}
                {phoneValid === "loading" && (
                  <span className="text-gray-500">
                    {t("Checking...", "እየሰራ ነው...")}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Position & Experience */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#003366] to-[#001F3F] text-[#FFD700] flex items-center justify-center shadow-sm">
              <Briefcase className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#003366]">
              {t("Position & Experience", "ሹመት እና ልምድ")}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-[#003366] uppercase tracking-wider mb-1.5">
                <Briefcase className="w-3.5 h-3.5 inline mr-1 text-[#FFD700]" />
                {t("Position", "ሹመት")}{" "}
                <span className="text-orange-500">*</span>
              </label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] hover:border-[#003366]/30 transition-all"
              >
                <option value="">
                  {t("Select position...", "ሹመት ይምረጡ...")}
                </option>
                {positionLoading ? (
                  <option value="" disabled>
                    {t("Loading positions...", "ክፍል እየተጫነ ነው...")}
                  </option>
                ) : positionOptions.length > 0 ? (
                  positionOptions.map((pos) => (
                    <option key={pos.id} value={pos.id}>
                      {isAm
                        ? pos.nameAmharic || pos.nameEnglish || pos.name
                        : pos.nameEnglish || pos.nameAmharic || pos.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    {t(
                      "No authorized positions available",
                      "ለማስተዳደር ብቻ የተፈቀዱ ሹመቶች አልተገኙም",
                    )}
                  </option>
                )}
              </select>
            </div>
            {shouldShowEducationLevel ? (
              <div>
                <label className="block text-xs font-bold text-[#003366] uppercase tracking-wider mb-1.5">
                  <GraduationCap className="w-3.5 h-3.5 inline mr-1 text-[#FFD700]" />
                  {t("Education Level", "የትምህርት ደረጃ")}{" "}
                  <span className="text-orange-500">*</span>
                </label>
                <select
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] hover:border-[#003366]/30 transition-all"
                >
                  <option value="">{t("Select...", "ይምረጡ...")}</option>
                  {availableEducationOptions.length > 0 ? (
                    availableEducationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {isAm ? option.labelAm : option.labelEn}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      {t(
                        "No education options available for this position",
                        "ለዚህ ሹመት የትምህርት ደረጃ አማራጮች የሉም",
                      )}
                    </option>
                  )}
                </select>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3 text-sm text-gray-500">
                {t(
                  "Education level will appear when an authorized position is selected.",
                  "የትምህርት ደረጃ በተፈቀደ ሹመት ሲመረጥ ይታያል።",
                )}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-[#003366] uppercase tracking-wider mb-1.5">
                {t("Work Experience (Years)", "የስራ ልምድ (ዓመታት)")}{" "}
                <span className="text-orange-500">*</span>
              </label>
              <button
                type="button"
                onClick={() =>
                  setOpenPosInfo(openPosInfo === "workExp" ? null : "workExp")
                }
                className="inline-flex items-center space-x-1 text-[10px] font-bold text-orange-600 hover:text-orange-500 transition-all duration-300 hover:scale-105 active:scale-95 mb-1"
              >
                <motion.span
                  animate={{ rotate: openPosInfo === "workExp" ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-center w-4 h-4 rounded-full bg-orange-50 text-orange-600"
                >
                  <Info className="w-2.5 h-2.5" />
                </motion.span>
                <span>{t("Learn more", "ተጨማሪ ይወቁ")}</span>
                <motion.span
                  animate={{ rotate: openPosInfo === "workExp" ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-orange-400"
                >
                  <ChevronDown className="w-3 h-3" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {openPosInfo === "workExp" && (
                  <motion.div
                    key="workExpInfo"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="mb-2 p-2 bg-gradient-to-br from-orange-50 to-amber-50/50 border border-orange-200/70 rounded-xl shadow-sm">
                      <p className="text-[10px] text-orange-900 leading-relaxed font-medium">
                        {t(
                          "Enter your work experience years relevant to your current position.",
                          "ከአሁን ሹመትዎ ጋር የሚዛመድ የስራ ልምድ ዓመታትዎን ያስገቡ።",
                        )}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <input
                type="number"
                min="0"
                value={workExpYears}
                onChange={(e) => setWorkExpYears(e.target.value)}
                placeholder="0"
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] hover:border-[#003366]/30 transition-all ${workExpYears ? "border-gray-200" : "border-gray-200"}`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#003366] uppercase tracking-wider mb-1.5">
                {t("Total Experience (Years)", "አጠቃላይ ልምድ (ዓመታት)")}{" "}
                <span className="text-orange-500">*</span>
              </label>
              <button
                type="button"
                onClick={() =>
                  setOpenPosInfo(openPosInfo === "totalExp" ? null : "totalExp")
                }
                className="inline-flex items-center space-x-1 text-[10px] font-bold text-orange-600 hover:text-orange-500 transition-all duration-300 hover:scale-105 active:scale-95 mb-1"
              >
                <motion.span
                  animate={{ rotate: openPosInfo === "totalExp" ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-center w-4 h-4 rounded-full bg-orange-50 text-orange-600"
                >
                  <Info className="w-2.5 h-2.5" />
                </motion.span>
                <span>{t("Learn more", "ተጨማሪ ይወቁ")}</span>
                <motion.span
                  animate={{ rotate: openPosInfo === "totalExp" ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-orange-400"
                >
                  <ChevronDown className="w-3 h-3" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {openPosInfo === "totalExp" && (
                  <motion.div
                    key="totalExpInfo"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="mb-2 p-2 bg-gradient-to-br from-orange-50 to-amber-50/50 border border-orange-200/70 rounded-xl shadow-sm">
                      <p className="text-[10px] text-orange-900 leading-relaxed font-medium">
                        {t(
                          "Enter your total experience years across Police, Defence force, or other work areas.",
                          "በፖሊስ፣ በመከላከያ ሠራዊት ወይም በሌሎች የስራ ዘርፎች ያለዎትን አጠቃላይ የልምድ ዓመታት ያስገቡ።",
                        )}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <input
                type="number"
                min="0"
                value={totalExpYears}
                onChange={(e) => setTotalExpYears(e.target.value)}
                placeholder="0"
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] hover:border-[#003366]/30 transition-all ${totalExpYears ? "border-gray-200" : "border-gray-200"}`}
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#003366] to-[#001F3F] text-[#FFD700] flex items-center justify-center shadow-sm">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#003366]">
              {t("Residential Address", "የመኖሪያ አድራሻ")}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <SearchableLocationSelect
              label={t("Region", "ክልል")}
              placeholder={isAm ? "ክልል ይምረጡ" : "Select Region"}
              searchPlaceholder={isAm ? "ክልል ፈልግ..." : "Search region..."}
              value={region}
              options={regions}
              disabled={locationLoading && regions.length === 0}
              required
              language={language}
              onChange={(val) => {
                setRegion(val);
                setZone("");
                setWoreda("");
                setKebele("");
              }}
              onClear={() => {
                setRegion("");
                setZone("");
                setWoreda("");
                setKebele("");
              }}
            />
            <SearchableLocationSelect
              label={t("Zone", "ዞን")}
              placeholder={isAm ? "ዞን ይምረጡ" : "Select Zone"}
              searchPlaceholder={isAm ? "ዞን ፈልግ..." : "Search zone..."}
              value={zone}
              options={zones}
              disabled={!region || (locationLoading && zones.length === 0)}
              required
              language={language}
              onChange={(val) => {
                setZone(val);
                setWoreda("");
                setKebele("");
              }}
              onClear={() => {
                setZone("");
                setWoreda("");
                setKebele("");
              }}
            />
            <SearchableLocationSelect
              label={t("Woreda", "ወረዳ")}
              placeholder={isAm ? "ወረዳ ይምረጡ" : "Select Woreda"}
              searchPlaceholder={isAm ? "ወረዳ ፈልግ..." : "Search woreda..."}
              value={woreda}
              options={woredas}
              disabled={!zone || (locationLoading && woredas.length === 0)}
              required
              language={language}
              onChange={(val) => {
                setWoreda(val);
                setKebele("");
              }}
              onClear={() => {
                setWoreda("");
                setKebele("");
              }}
            />
            <SearchableLocationSelect
              label={t("Kebele", "ቀበሌ")}
              placeholder={isAm ? "ቀበሌ ይምረጡ" : "Select Kebele"}
              searchPlaceholder={isAm ? "ቀበሌ ፈልግ..." : "Search kebele..."}
              value={kebele}
              options={kebeles}
              disabled={!woreda || (locationLoading && kebeles.length === 0)}
              required
              language={language}
              onChange={(val) => setKebele(val)}
              onClear={() => setKebele("")}
            />
            <div>
              <label className="block text-xs font-bold text-[#003366] uppercase tracking-wider mb-1.5">
                {t("House Number", "የቤት ቁጥር")}{" "}
                <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                value={houseNo}
                onChange={(e) => setHouseNo(e.target.value)}
                required
                placeholder={t("e.g. House 123", "ለምሳሌ ቤት 123")}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] hover:border-[#003366]/30 transition-all ${houseNo ? "border-gray-200" : "border-gray-200"}`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#003366] uppercase tracking-wider mb-1.5">
                {t("Special Location", "ልዩ ቦታ")}
                <span className="text-orange-500 font-normal ml-1">
                  ({t("Optional", "አማራጭ")})
                </span>
              </label>
              <input
                type="text"
                value={specialLocation}
                onChange={(e) => setSpecialLocation(e.target.value)}
                placeholder={t("Near landmark...", "መስህር አጠገብ...")}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] hover:border-[#003366]/30 transition-all ${specialLocation ? "border-gray-200" : "border-gray-200"}`}
              />
            </div>
          </div>
        </div>

        {/* Reason for Change */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#003366] to-[#001F3F] text-[#FFD700] flex items-center justify-center shadow-sm">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#003366]">
              {t("Reason for Change", "የለውጡ ምክንያት")}{" "}
              <span className="text-orange-500">*</span>
            </h3>
          </div>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            rows={4}
            placeholder={t(
              "Describe the reason for this personnel change...",
              "የዚህን የሰራተኛ ለውጥ ምክንያት ይግለጹ...",
            )}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] hover:border-[#003366]/30 transition-all resize-none"
          />
        </div>

        {/* Document Uploads */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#003366] to-[#001F3F] text-[#FFD700] flex items-center justify-center shadow-sm">
              <Upload className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#003366]">
              {t("Required Documents", "የሚፈለጉ ሰነዶች")}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {documentTypes.map((doc) => {
              const uploadedFile = files[doc.key];
              const previewUrl = uploadedFile
                ? URL.createObjectURL(uploadedFile)
                : null;
              const hasExperience =
                Number(workExpYears) > 0 || Number(totalExpYears) > 0;
              const isRequired =
                doc.required ||
                (hasExperience &&
                  (doc.key === "work_exp" || doc.key === "resignation"));
              return (
                <motion.div
                  key={doc.key}
                  whileHover={{ y: -2 }}
                  className={`group relative rounded-[20px] border-2 transition-all duration-500 p-4 ${
                    uploadedFile
                      ? "bg-white border-solid border-green-200 shadow-lg shadow-green-500/5 ring-4 ring-green-50/30"
                      : "bg-gray-50/50 border-dashed border-gray-200 hover:border-[#003366]/40 hover:bg-white"
                  }`}
                >
                  {uploadedFile && (
                    <div className="absolute -top-3 -right-3 z-10">
                      <div className="flex items-center space-x-1 bg-green-500 text-white px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl shadow-green-500/30 border-2 border-white">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{t("UPLOADED", "ተሰቅሏል")}</span>
                      </div>
                    </div>
                  )}

                  {["fingerprint", "medical", "national_id"].includes(
                    doc.key,
                  ) &&
                    infoTexts[doc.key] && (
                      <div className="mb-3">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenInfo(openInfo === doc.key ? null : doc.key)
                          }
                          className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-orange-600 hover:text-orange-500 transition-all duration-300 hover:scale-105 active:scale-95"
                        >
                          <motion.span
                            animate={{ rotate: openInfo === doc.key ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-50 text-orange-600"
                          >
                            <Info className="w-3 h-3" />
                          </motion.span>
                          <span>{t("Learn more", "ተጨማሪ ይወቁ")}</span>
                          <motion.span
                            animate={{ rotate: openInfo === doc.key ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-orange-400"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </motion.span>
                        </button>
                        <AnimatePresence initial={false}>
                          {openInfo === doc.key && (
                            <motion.div
                              key="info"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="mt-2 p-3 bg-gradient-to-br from-orange-50 to-amber-50/50 border border-orange-200/70 rounded-xl shadow-sm">
                                <p className="text-[11px] text-orange-900 leading-relaxed font-medium">
                                  {isAm
                                    ? infoTexts[doc.key]?.am
                                    : infoTexts[doc.key]?.en}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 flex-shrink-0 shadow-sm ${
                        uploadedFile
                          ? "bg-green-50 text-green-500"
                          : "bg-white border text-gray-400"
                      }`}
                    >
                      {uploadedFile ? (
                        <FileText className="w-6 h-6" />
                      ) : (
                        <Upload className="w-6 h-6" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4
                          className={`text-sm font-black tracking-tight break-words leading-snug ${
                            uploadedFile ? "text-green-600" : "text-[#003366]"
                          }`}
                        >
                          {uploadedFile
                            ? uploadedFile.name
                            : isAm
                              ? doc.labelAm
                              : doc.labelEn}
                        </h4>
                        {isRequired && !uploadedFile && (
                          <span className="text-xs text-orange-500 font-black bg-orange-50 px-1.5 rounded-md">
                            *
                          </span>
                        )}
                        {!isRequired && !uploadedFile && (
                          <span className="text-[10px] text-amber-700 bg-amber-50 font-black rounded-md px-1.5 py-0.5 uppercase tracking-widest">
                            {t("Optional", "አማራጭ")}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                          {uploadedFile
                            ? `${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB`
                            : "PDF Max 5MB"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {!uploadedFile ? (
                        <button
                          type="button"
                          onClick={() => handleFileSelect(doc.key)}
                          className="px-4 py-2 bg-white border-2 border-gray-100 text-[#003366] rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:border-[#003366] hover:shadow-lg transition-all active:scale-95"
                        >
                          {t("Select File", "ፋይል ይምረጡ")}
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => setPreviewUrl(previewUrl)}
                            className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFiles((prev) => {
                                const next = { ...prev };
                                delete next[doc.key];
                                return next;
                              });
                            }}
                            className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf"
            className="hidden"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#003366] to-[#001F3F] text-white text-sm font-bold tracking-wide px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {submitting
                ? t("Submitting...", "በማስገባት ላይ...")
                : t("Submit Request", "ጥያቄ ያስገቡ")}
            </button>
          </div>
        </div>
      </motion.form>

      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => {
            setPreviewUrl(null);
            URL.revokeObjectURL(previewUrl);
          }}
        >
          <div
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                setPreviewUrl(null);
                URL.revokeObjectURL(previewUrl);
              }}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
            <iframe
              src={previewUrl}
              className="w-full h-full"
              title="Document Preview"
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
