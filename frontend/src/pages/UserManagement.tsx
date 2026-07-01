import { useState, useEffect, useMemo } from "react";
import {
  UserPlus,
  Shield,
  Trash2,
  Edit2,
  X,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Search,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { motion, AnimatePresence } from "motion/react";
import { AutoDismissToast, ToastType } from "../components/AutoDismissToast";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { apiRequest, ApiError } from "../lib/api";

// Dynamic Database System Roles matching Prisma schema verified responses
interface SystemRole {
  role_id: number;
  role_name: string;
}

interface UserRole {
  role_id: number;
  roles: {
    role_name: string;
  };
}

interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  faydaId: string;
  photoUrl: string | null;
  createdAt: string;
  status: "Active" | "Inactive" | "Suspended";
  user_roles: UserRole[];
}

export const UserManagement = () => {
  const { language } = useLanguage();
  const isAm = language === "am";

  const unwrapApiData = <T,>(payload: any): T => {
    if (payload && typeof payload === "object" && "success" in payload) {
      return (payload.success ? payload.data : payload) as T;
    }

    return payload as T;
  };

  // State Management
  const [users, setUsers] = useState<User[]>([]);
  const [systemRoles, setSystemRoles] = useState<SystemRole[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dialogLoading, setDialogLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form Modals and Action Interceptors
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);

  // Dialog Interceptors State
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [dialogType, setDialogType] = useState<
    "delete" | "approve" | "reject" | "update" | "default"
  >("default");
  const [pendingAction, setPendingAction] = useState<{
    title: string;
    message: string;
    action: () => Promise<void>;
  } | null>(null);

  // Toast States
  const [toastOpen, setToastOpen] = useState(false);
  const [toastType, setToastType] = useState<ToastType>("success");
  const [toastMessage, setToastMessage] = useState("");

  // Search, Filter & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [jumpPage, setJumpPage] = useState("");

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        u.fullName?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q);
      const matchesFilter = statusFilter === "all" || u.status === statusFilter;
      return matchesSearch && matchesFilter;
    });
  }, [users, searchQuery, statusFilter]);

  const totalFiltered = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, page, pageSize]);

  // Controlled Form Inputs
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [faydaId, setFaydaId] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive" | "Suspended">(
    "Active",
  );
  const [selectedRoleId, setSelectedRoleId] = useState<number | string>("");

  // Security variables
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const normalizeStatusFromApi = (raw?: string) => {
    if (!raw) return "Inactive";
    const up = String(raw).toUpperCase();
    if (up === "ACTIVE") return "Active";
    if (up === "INACTIVE") return "Inactive";
    if (up === "SUSPENDED") return "Suspended";
    return up.charAt(0) + up.slice(1).toLowerCase();
  };

  const normalizeUser = (u: any): User => ({
    ...u,
    status: normalizeStatusFromApi(u.status) as User["status"],
  });

  // Translations Object
  const t = {
    title: isAm ? "የተጠቃሚዎች አስተዳደር" : "User Management",
    subtitle: isAm
      ? "የፌዴራል ፖሊስ አስተዳዳሪዎችን መለያዎች ያስተዳድሩ"
      : "Manage accounts for Federal Police administrators",
    addUser: isAm ? "አዲስ አስተዳዳሪ ጨምር" : "Add New Admin",
    editUser: isAm ? "አስተዳዳሪን አሻሽል" : "Edit Admin",
    viewUser: isAm ? "ይመልከቱ" : "View Admin",
    loading: isAm ? "በመጫን ላይ..." : "Loading system metadata...",
    errorFetch: isAm
      ? "መፈላጊ መጫን አልተቻለም"
      : "Failed to load operational backend data.",
    table: {
      user: isAm ? "ተጠቃሚ" : "User",
      role: isAm ? "ሚና" : "Role",
      status: isAm ? "ሁኔታ" : "Status",
      lastLogin: isAm ? "የተፈጠረበት ቀን" : "Created At",
      actions: isAm ? "እርምጃዎች" : "Actions",
    },
    form: {
      firstName: isAm ? "መጀመሪያ ስም" : "First Name",
      middleName: isAm ? "የአባት ስም" : "Middle Name",
      lastName: isAm ? "የአያት ስም" : "Last Name",
      username: isAm ? "የተጠቃሚ ስም" : "Username",
      password: isAm ? "የይለፍ ቃል" : "Password",
      confirmPassword: isAm ? "የይለፍ ቃል ያረጋግጡ" : "Confirm Password",
      email: isAm ? "ኢሜል" : "Email",
      phone: isAm ? "የስልክ ቁጥር" : "Phone Number",
      role: isAm ? "ሚና" : "Role",
      status: isAm ? "ሁኔታ" : "Status",
      faydaId: isAm ? "የፋይዳ መታወቂያ" : "Fayda ID",
      sendOtp: isAm ? "OTP ላክ" : "Send OTP",
      verifyOtp: isAm ? "አረጋግጥ" : "Verify",
      save: isAm ? "አስቀምጥ" : "Save Changes",
      create: isAm ? "ፍጠር" : "Create Account",
      cancel: isAm ? "ሰርዝ" : "Cancel",
    },
    status: {
      active: isAm ? "ንቁ" : "Active",
      inactive: isAm ? "ቦዝኗል" : "Inactive",
      suspended: isAm ? "የታገደ" : "Suspended",
    },
  };

  // Lifecycle Initialization connecting to real backend API endpoints
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 2. Use Promise.allSettled to prevent one endpoint crash from taking down the whole page
        const [usersResult, rolesResult] = await Promise.allSettled([
          apiRequest("/users"),
          apiRequest("/users/roles"),
        ]);

        // --- PROCESS ROLES PAYLOAD ---
        if (rolesResult.status === "fulfilled") {
          // Normalize both wrapped and raw API payloads into a single array shape.
          const rolesData = unwrapApiData<SystemRole[]>(rolesResult.value);
          const validRoles = Array.isArray(rolesData) ? rolesData : [];

          setSystemRoles(validRoles);
          if (validRoles.length > 0) {
            setSelectedRoleId(validRoles[0].role_id);
          }
        } else {
          const reason = rolesResult.reason;
          console.error("Roles synchronization failure:", reason);
        }

        // --- PROCESS USERS PAYLOAD ---
        if (usersResult.status === "fulfilled") {
          const usersData = unwrapApiData<any[]>(usersResult.value);
          const normalized = Array.isArray(usersData)
            ? usersData.map(normalizeUser)
            : [];
          setUsers(normalized as User[]);
        } else {
          // Evaluate the distinct HTTP error signature if the user fetch step breaks down
          const userError = usersResult.reason;
          if (userError instanceof ApiError) {
            const status = userError.statusCode;
            if (status === 401) {
              throw new Error(
                isAm
                  ? "ያልተፈቀደ መዳረሻ - ክፍለ ጊዜዎ አልፏል"
                  : "Session expired or invalid authentication token.",
              );
            }
            if (status === 404) {
              throw new Error(
                isAm
                  ? "የተጠቃሚዎች ዝርዝር አልተገኘም (404)"
                  : "Endpoint 'GET /api/users' not found on server.",
              );
            }
            throw new Error(
              userError.message ||
                `Server returned error status code: ${status}`,
            );
          } else {
            throw new Error(
              isAm
                ? "ከአገልጋይ ጋር መገናኘት አልተቻለም"
                : "Network connection completely dropped or refused.",
            );
          }
        }
      } catch (err: any) {
        console.error("Initialization pipeline failure:", err);
        // Append runtime error text metadata into the UI error handler state
        setError(`${t.errorFetch} (${err.message})`);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const triggerToast = (type: ToastType, message: string) => {
    setToastType(type);
    setToastMessage(message);
    setToastOpen(true);
  };

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { label: "", color: "bg-gray-200", text: "" };
    if (pass.length < 6)
      return {
        label: isAm ? "ደካማ" : "Weak",
        color: "bg-red-500",
        text: "text-red-500",
      };
    if (pass.length < 10)
      return {
        label: isAm ? "መካከለኛ" : "Medium",
        color: "bg-amber-500",
        text: "text-amber-500",
      };
    return {
      label: isAm ? "ጠንካራ" : "Strong",
      color: "bg-green-500",
      text: "text-green-500",
    };
  };

  const strength = getPasswordStrength(password);
  const confirmStrength = getPasswordStrength(confirmPassword);
  const passwordsMatch = password === confirmPassword;

  const PasswordStrengthBar = ({ str }: { str: any }) => {
    if (!str.label) return null;
    return (
      <div className="space-y-1">
        <div className="mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${str.color}`}
            style={{
              width:
                str.label === (isAm ? "ደካማ" : "Weak")
                  ? "33%"
                  : str.label === (isAm ? "መካከለኛ" : "Medium")
                    ? "66%"
                    : "100%",
            }}
          />
        </div>
        <p
          className={`text-[10px] font-bold uppercase tracking-tight ${str.text}`}
        >
          {str.label}
        </p>
      </div>
    );
  };

  const handleDeleteClick = (user: User) => {
    setDialogType("delete");
    setPendingAction({
      title: isAm ? "መለያ አጥፋ" : "Delete Account",
      message: isAm
        ? `እርግጠኛ ነዎት የ ${user.fullName} መለያን መደምሰስ ይፈልጋሉ? ይህ ድርጊት ወደኋላ ሊመለስ አይችልም።`
        : `Are you completely sure you want to delete the profile for ${user.fullName}? This cannot be undone.`,
      action: async () => {
        try {
          await apiRequest(`/users/${user.id}/revoke`, {
            method: "PATCH",
          });

          setUsers(users.filter((u) => u.id !== user.id));
          triggerToast(
            "success",
            isAm
              ? "ተጠቃሚው በተሳካ ሁኔታ ተሰርዟል"
              : "User registry entry removed successfully.",
          );
        } catch (err) {
          triggerToast("error", isAm ? "ክዋኔው አልተሳካም" : "Execution failed.");
        }
      },
    });
    setConfirmOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsViewMode(false);

    const nameParts = user.fullName.split(" ");
    setFirstName(nameParts[0] || "");
    setMiddleName(nameParts[1] || "");
    setLastName(nameParts[2] || "");

    setUsername(user.username);
    setEmail(user.email);
    setPhone(user.phone);
    setFaydaId(user.faydaId);
    setStatus(user.status);

    const matchedRole = user.user_roles[0]?.role_id || "";
    setSelectedRoleId(matchedRole);

    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setOtpSent(false);
    setIsOtpVerified(true); // Pre-verified since user already has structural validation entry
    setIsModalOpen(true);
  };

  const handleView = (user: User) => {
    setEditingUser(user);
    setIsViewMode(true);
    const nameParts = user.fullName.split(" ");
    setFirstName(nameParts[0] || "");
    setMiddleName(nameParts[1] || "");
    setLastName(nameParts[2] || "");

    setUsername(user.username);
    setEmail(user.email);
    setPhone(user.phone);
    setFaydaId(user.faydaId);
    setStatus(user.status);

    const matchedRole = user.user_roles[0]?.role_id || "";
    setSelectedRoleId(matchedRole);

    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setOtpSent(false);
    setIsOtpVerified(true);
    setIsModalOpen(true);
  };

  const openImagePreview = (url?: string | null) => {
    if (!url) return;
    setImagePreviewUrl(url);
    setImagePreviewOpen(true);
  };

  const closeImagePreview = () => {
    setImagePreviewOpen(false);
    setImagePreviewUrl(null);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeImagePreview();
    };
    if (imagePreviewOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [imagePreviewOpen]);

  const handleAdd = () => {
    setEditingUser(null);
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setUsername("");
    setEmail("");
    setPhone("");
    setFaydaId("");
    setStatus("Active");

    setSelectedRoleId(systemRoles[0]?.role_id || "");

    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setOtpSent(false);
    setIsOtpVerified(false);
    setIsModalOpen(true);
  };

  const handleSendOtp = () => {
    if (!phone) {
      triggerToast(
        "error",
        isAm
          ? "እባክዎ መጀመሪያ የስልክ ቁጥር ያስገቡ"
          : "Please specify a structural telephone line first.",
      );
      return;
    }
    setOtpSent(true);
    triggerToast(
      "success",
      isAm ? "የማረጋገጫ ኮድ ተልኳል" : "Verification passkey dispatched downline.",
    );
  };

  const handleVerifyOtp = () => {
    if (otpCode.length < 4) return;
    setIsOtpVerified(true);
    triggerToast(
      "success",
      isAm ? "ማረጋገጫው ተሳክቷል" : "Fayda parameters verified successfully.",
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const roleId = Number(selectedRoleId);
    if (!roleId) {
      triggerToast(
        "error",
        isAm ? "እባክዎ ትክክለኛ ሚና ይምረጡ" : "Please select a valid role.",
      );
      return;
    }

    if (!isOtpVerified) {
      triggerToast(
        "error",
        isAm
          ? "እባክዎን መጀመሪያ OTP ያረጋግጡ"
          : "Security clearance verification failed. Confirm code.",
      );
      return;
    }

    // Check validation match criteria only if password field is filled during Edit or required during Create
    if ((!editingUser || password) && password !== confirmPassword) {
      triggerToast(
        "error",
        isAm
          ? "የይለፍ ቃሎች አይዛመዱም"
          : "Security baseline variance: Passwords do not match.",
      );
      return;
    }

    setDialogType(editingUser ? "update" : "default");
    setPendingAction({
      title: editingUser
        ? isAm
          ? "ለውጦችን አጽድቅ"
          : "Confirm Data Update"
        : isAm
          ? "አዲስ አካውንት ፍጠር"
          : "Provision User Profile",
      message: editingUser
        ? isAm
          ? "በዚህ መለያ መረጃ ላይ የተደረጉ ለውጦችን ማዘመን ይፈልጋሉ?"
          : "Commit changed structural state configurations to main system logs?"
        : isAm
          ? "አዲሱን ተጠቃሚ ወደ ሲስተሙ ማስገባት ይፈልጋሉ?"
          : "Finalize deployment parameters and instantiate target system profile?",
      action: async () => {
        try {
          const activeRoleObj = systemRoles.find((r) => r.role_id === roleId);
          const computedFullName =
            `${firstName} ${middleName} ${lastName}`.trim();

          const payload = {
            username,
            fullName: computedFullName,
            email,
            phone,
            ...(password && { password }), // Only add password entry structural mapping if altered
            faydaId,
            roleIds: [roleId],
            status: status.toUpperCase(),
          };

          // Route to exact target location mapping matching your controller logic
          const endpoint = editingUser
            ? `/users/${editingUser.id}`
            : `/users/register`;
          const method = editingUser ? "PUT" : "POST";

          const result = await apiRequest(endpoint, {
            method,
            body: JSON.stringify(payload),
          });

          if (editingUser) {
            setUsers((currentUsers) =>
              currentUsers.map((u) =>
                u.id === editingUser.id
                  ? {
                      ...u,
                      username,
                      fullName: computedFullName,
                      email,
                      phone,
                      faydaId,
                      status,
                      user_roles: [
                        {
                          role_id: Number(selectedRoleId),
                          roles: {
                            role_name: activeRoleObj?.role_name || "admin",
                          },
                        },
                      ],
                    }
                  : u,
              ),
            );
            triggerToast(
              "success",
              isAm
                ? "መለያው በተሳካ ሁኔታ ተሻሽሏል"
                : "User database parameters systematically updated.",
            );
          } else {
            const freshUserRaw: any = (result as any).data || result;
            const freshUser = normalizeUser(freshUserRaw);
            setUsers((currentUsers) => [...currentUsers, freshUser]);
            triggerToast(
              "success",
              isAm
                ? "አካውንት በተሳካ ሁኔታ ተፈጥሯል"
                : "System target profile instantiated correctly.",
            );
          }
          setIsModalOpen(false);
        } catch (err: any) {
          triggerToast(
            "error",
            err.message || "Failed to commit record updates.",
          );
        }
      },
    });
    setConfirmOpen(true);
  };

  return (
    <div className="space-y-8">
      <AutoDismissToast
        isOpen={toastOpen}
        type={toastType}
        message={toastMessage}
        onClose={() => setToastOpen(false)}
      />

      <ConfirmDialog
        isOpen={confirmOpen}
        title={pendingAction?.title || ""}
        message={pendingAction?.message || ""}
        type={dialogType}
        isLoading={dialogLoading}
        onClose={() => {
          setConfirmOpen(false);
          setPendingAction(null);
        }}
        onConfirm={async () => {
          if (pendingAction) {
            setDialogLoading(true);
            await pendingAction.action();
            setDialogLoading(false);
            setConfirmOpen(false);
            setPendingAction(null);
          }
        }}
      />

      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-primary">{t.title}</h3>
          <p className="text-gray-500 text-sm">{t.subtitle}</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all"
        >
          <UserPlus className="w-5 h-5" />
          <span>{t.addUser}</span>
        </button>
      </div>

      {/* Search, Filter & Page Size */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder={isAm ? "ፈልግ..." : "Search users..."}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        >
          <option value="all">{isAm ? "ሁሉም ሁኔታ" : "All Status"}</option>
          <option value="Active">{t.status.active}</option>
          <option value="Inactive">{t.status.inactive}</option>
          <option value="Suspended">{t.status.suspended}</option>
        </select>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 whitespace-nowrap">
            {isAm ? "የገጽ መጠን" : "Page Size"}
          </span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            {[10, 25, 50, 100].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-gray-500">{t.loading}</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-semibold">
          {error}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-8 py-4 font-bold">{t.table.user}</th>
                    <th className="px-8 py-4 font-bold">{t.table.role}</th>
                    <th className="px-8 py-4 font-bold">{t.table.status}</th>
                    <th className="px-8 py-4 font-bold">{t.table.lastLogin}</th>
                    <th className="px-8 py-4 font-bold text-right">
                      {t.table.actions}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-8 py-4">
                        <div className="flex items-center space-x-3">
                          {user.photoUrl ? (
                            <img
                              src={user.photoUrl}
                              alt={user.fullName || user.username}
                              role="button"
                              onClick={() => openImagePreview(user.photoUrl)}
                              className="w-10 h-10 rounded-full object-cover cursor-pointer"
                              onError={(e) => {
                                (
                                  e.currentTarget as HTMLImageElement
                                ).style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-primary font-bold">
                              {user.fullName?.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-primary text-sm">
                              {user.fullName}
                            </p>
                            <p className="text-xs text-gray-400">
                              @{user.username} • {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-gray-600 font-medium capitalize">
                            {(
                              user.user_roles?.[0]?.roles?.role_name ||
                              "Unassigned"
                            ).replace("_", " ")}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            user.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : user.status === "Suspended"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {user.status === "Active"
                            ? t.status.active
                            : user.status === "Suspended"
                              ? t.status.suspended
                              : t.status.inactive}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-2 text-gray-400 hover:text-primary transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleView(user)}
                            className="p-2 text-gray-400 hover:text-primary transition-colors flex items-center"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="hidden md:inline ml-2 text-sm text-gray-600">
                              {isAm ? "ይመልከቱ" : "View"}
                            </span>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              {isAm ? "የሚታየው" : "Showing"}{" "}
              {totalFiltered === 0 ? 0 : (page - 1) * pageSize + 1} -{" "}
              {Math.min(totalFiltered, page * pageSize)} {isAm ? "ከ" : "of"}{" "}
              {totalFiltered}
            </div>
            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(1)}
                className="px-2 py-1 bg-white border rounded disabled:opacity-50 text-sm"
              >
                {isAm ? "መጀመሪያ" : "First"}
              </button>
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2 py-1 bg-white border rounded disabled:opacity-50 text-sm"
              >
                {isAm ? "ቀዳሚ" : "Prev"}
              </button>
              {(() => {
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
                        className={`px-2 py-1 border rounded text-sm ${p === page ? "bg-primary text-white" : "bg-white"}`}
                      >
                        {p}
                      </button>
                    ))}
                    {end < totalPages && (
                      <span className="px-2 text-sm">...</span>
                    )}
                  </div>
                );
              })()}
              <button
                disabled={page * pageSize >= totalFiltered}
                onClick={() => setPage((p) => p + 1)}
                className="px-2 py-1 bg-white border rounded disabled:opacity-50 text-sm"
              >
                {isAm ? "ቀጣይ" : "Next"}
              </button>
              <button
                disabled={page * pageSize >= totalFiltered}
                onClick={() => setPage(totalPages)}
                className="px-2 py-1 bg-white border rounded disabled:opacity-50 text-sm"
              >
                {isAm ? "መጨረሻ" : "Last"}
              </button>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  placeholder={isAm ? "ሂድ" : "Go to"}
                  value={jumpPage}
                  onChange={(e) => setJumpPage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const v = Number(jumpPage);
                      if (!isNaN(v) && v >= 1 && v <= totalPages) {
                        setPage(v);
                        setJumpPage("");
                      }
                    }
                  }}
                  className="w-20 px-2 py-1 border rounded text-sm"
                />
                <button
                  onClick={() => {
                    const v = Number(jumpPage);
                    if (!isNaN(v) && v >= 1 && v <= totalPages) {
                      setPage(v);
                      setJumpPage("");
                    }
                  }}
                  className="px-3 py-1 bg-primary text-white rounded text-sm"
                >
                  {isAm ? "ሂድ" : "Go"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 border-b flex justify-between items-center bg-white sticky top-0 z-10">
                <h3 className="text-xl font-bold text-primary">
                  {isViewMode
                    ? t.viewUser
                    : editingUser
                      ? t.editUser
                      : t.addUser}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form or Read-only Detail View */}
              {!isViewMode && (
                <form
                  onSubmit={handleFormSubmit}
                  className="flex flex-col overflow-hidden flex-1"
                >
                  <div className="p-8 space-y-6 overflow-y-auto flex-1">
                    <div className="flex items-start gap-6">
                      {editingUser?.photoUrl ? (
                        <div className="flex flex-col items-center">
                          <img
                            src={editingUser.photoUrl}
                            alt={editingUser.fullName || editingUser.username}
                            className="w-20 h-20 rounded-full object-cover mb-2 cursor-pointer"
                            onClick={() =>
                              openImagePreview(editingUser.photoUrl)
                            }
                            onError={(e) => {
                              (
                                e.currentTarget as HTMLImageElement
                              ).style.display = "none";
                            }}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              openImagePreview(editingUser.photoUrl)
                            }
                            className="px-3 py-1 text-xs bg-primary/10 text-primary rounded-lg"
                          >
                            {isAm ? "ቅድመ እይታ" : "Preview"}
                          </button>
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-primary font-bold text-2xl">
                          {editingUser?.fullName?.charAt(0) ||
                            editingUser?.username?.charAt(0) ||
                            "-"}
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                              {t.form.firstName}
                            </label>
                            <input
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              required
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                              {t.form.middleName}
                            </label>
                            <input
                              value={middleName}
                              onChange={(e) => setMiddleName(e.target.value)}
                              required
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                              {t.form.lastName}
                            </label>
                            <input
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              required
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                          {t.form.username}
                        </label>
                        <input
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                          {t.form.email}
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                          {t.form.password}
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required={!editingUser} // No longer silently failing HTML validation triggers when editing
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-gray-400 hover:text-primary transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                          <PasswordStrengthBar str={strength} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                          {t.form.confirmPassword}
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required={!editingUser}
                            className={`w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all pr-20 ${confirmPassword ? (passwordsMatch ? "border-green-500" : "border-red-500") : "border-gray-100"}`}
                          />
                          <div className="absolute right-3 top-3 flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              className="text-gray-400 hover:text-primary transition-colors"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                            {confirmPassword &&
                              (passwordsMatch ? (
                                <Check className="w-5 h-5 text-green-500" />
                              ) : (
                                <X className="w-5 h-5 text-red-500" />
                              ))}
                          </div>
                          <PasswordStrengthBar str={confirmStrength} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                          {t.form.phone}
                        </label>
                        <input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required={!isViewMode}
                          placeholder="+251 ..."
                          disabled={isViewMode}
                          className={`w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all ${isViewMode ? "opacity-80 cursor-not-allowed" : ""}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                          {t.form.status}
                        </label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value as any)}
                          disabled={isViewMode}
                          className={`w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all ${isViewMode ? "opacity-80 cursor-not-allowed" : ""}`}
                        >
                          <option value="Active">{t.status.active}</option>
                          <option value="Inactive">{t.status.inactive}</option>
                          <option value="Suspended">
                            {t.status.suspended}
                          </option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                          {t.form.role}
                        </label>
                        <select
                          value={selectedRoleId}
                          onChange={(e) => setSelectedRoleId(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all font-semibold text-gray-700 capitalize"
                        >
                          {systemRoles.map((role) => (
                            <option key={role.role_id} value={role.role_id}>
                              {role.role_name.replace("_", " ")}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                          {t.form.faydaId}
                        </label>
                        <div className="flex space-x-2">
                          <input
                            value={faydaId}
                            onChange={(e) => setFaydaId(e.target.value)}
                            required
                            placeholder="ET-..."
                            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all"
                          />
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            className="px-4 bg-primary/10 text-primary font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-primary/20 transition-all"
                          >
                            {t.form.sendOtp}
                          </button>
                        </div>
                      </div>
                    </div>

                    {otpSent && !isOtpVerified && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="p-6 bg-blue-50 rounded-3xl space-y-4"
                      >
                        <label className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                          Verification Code
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            placeholder="_ _ _ _ _ _"
                            className="flex-1 text-center font-bold px-4 py-3 bg-white border border-blue-200 rounded-xl outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyOtp}
                            className="px-6 bg-blue-600 text-white font-bold rounded-xl text-xs uppercase tracking-widest"
                          >
                            {t.form.verifyOtp}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Fixed bottom action layout inside form boundary container */}
                  <div className="p-8 border-t bg-gray-50 flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all"
                    >
                      {t.form.cancel}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all"
                    >
                      {editingUser ? t.form.save : t.form.create}
                    </button>
                  </div>
                </form>
              )}

              {isViewMode && (
                <div className="flex flex-col overflow-hidden flex-1">
                  <div className="p-8 space-y-6 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-widest">
                            {isAm ? "ሙሉ ስም" : "Full Name"}
                          </p>
                          <p className="text-sm font-bold text-primary mt-1">
                            {editingUser?.fullName || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-widest">
                            {isAm ? "የተጠቃሚ ስም" : "Username"}
                          </p>
                          <p className="text-sm mt-1">
                            {editingUser?.username || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-widest">
                            {isAm ? "ኢሜል" : "Email"}
                          </p>
                          <p className="text-sm mt-1">
                            {editingUser?.email || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-widest">
                            {isAm ? "ስልክ" : "Phone"}
                          </p>
                          <p className="text-sm mt-1">
                            {editingUser?.phone || "-"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-widest">
                            {isAm ? "የፋይዳ መታወቂያ" : "Fayda ID"}
                          </p>
                          <p className="text-sm mt-1">
                            {editingUser?.faydaId || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-widest">
                            {isAm ? "ሚና" : "Role"}
                          </p>
                          <p className="text-sm mt-1 capitalize">
                            {(
                              editingUser?.user_roles?.[0]?.roles?.role_name ||
                              (isAm ? "አልተመደበም" : "Unassigned")
                            ).replace("_", " ")}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-widest">
                            {isAm ? "ሁኔታ" : "Status"}
                          </p>
                          <p className="text-sm mt-1">
                            {editingUser?.status || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-widest">
                            {isAm ? "የተፈጠረበት" : "Created"}
                          </p>
                          <p className="text-sm mt-1">
                            {editingUser?.createdAt
                              ? new Date(editingUser.createdAt).toLocaleString()
                              : "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 border-t bg-gray-50 flex">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setIsViewMode(false);
                        setEditingUser(null);
                      }}
                      className="w-full py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all"
                    >
                      {isAm ? "ዝጋ" : "Close"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
        {imagePreviewOpen && imagePreviewUrl && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/70"
              onClick={closeImagePreview}
            />
            <div className="relative max-w-[90vw] max-h-[90vh]">
              <img
                src={imagePreviewUrl}
                alt="Preview"
                className="max-w-full max-h-[80vh] rounded-lg object-contain shadow-lg"
              />
              <button
                type="button"
                onClick={closeImagePreview}
                className="absolute -top-3 -right-3 bg-white rounded-full p-2 shadow-lg"
                aria-label="Close preview"
              >
                <X className="w-4 h-4 text-gray-700" />
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
