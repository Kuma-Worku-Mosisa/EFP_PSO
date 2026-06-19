// Location: frontend/src/components/FormalRequestManager.tsx
import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import {
  ChevronDown,
  FileText,
  Eye,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  User as UserIcon,
  X,
  Check,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { apiRequest, API_BASE } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { ConfirmDialog } from "./ConfirmDialog";
import { AutoDismissToast } from "./AutoDismissToast";

const transliterateAmharic = (input: string): string => {
  const map: Record<string, string> = {
    ሀ: "ha", ሁ: "hu", ሂ: "hi", ሃ: "ha", ሄ: "he", ህ: "h", ሆ: "ho",
    ለ: "la", ሉ: "lu", ሊ: "li", ላ: "la", ሌ: "le", ል: "l", ሎ: "lo", ሏ: "la",
    መ: "ma", ሙ: "mu", ሚ: "mi", ማ: "ma", ሜ: "me", ም: "m", ሞ: "mo", ሟ: "ma",
    ረ: "ra", ሩ: "ru", ሪ: "ri", ራ: "ra", ሬ: "re", ር: "r", ሮ: "ro", ሯ: "ra",
    ሰ: "sa", ሱ: "su", ሲ: "si", ሳ: "sa", ሴ: "se", ስ: "s", ሶ: "so", ሷ: "sa",
    ሸ: "sha", ሹ: "shu", ሺ: "shi", ሻ: "sha", ሼ: "she", ሽ: "sh", ሾ: "sho", ሿ: "sha",
    ቀ: "qa", ቁ: "qu", ቂ: "qi", ቃ: "qa", ቄ: "qe", ቅ: "q", ቆ: "qo", ቇ: "qa",
    በ: "ba", ቡ: "bu", ቢ: "bi", ባ: "ba", ቤ: "be", ብ: "b", ቦ: "bo", ቧ: "ba",
    ተ: "ta", ቱ: "tu", ቲ: "ti", ታ: "ta", ቴ: "te", ት: "t", ቶ: "to", ቷ: "ta",
    ቸ: "cha", ቹ: "chu", ቺ: "chi", ቻ: "cha", ቼ: "che", ች: "ch", ቾ: "cho", ቿ: "cha",
    ኀ: "ha", ኁ: "hu", ኂ: "hi", ኃ: "ha", ኄ: "he", ኅ: "h", ኆ: "ho", ኇ: "ha",
    ነ: "na", ኑ: "nu", ኒ: "ni", ና: "na", ኔ: "ne", ን: "n", ኖ: "no", ኗ: "na",
    አ: "a", ኡ: "u", ኢ: "i", ኣ: "a", ኤ: "e", እ: "e", ኦ: "o", ኧ: "a",
    ከ: "ka", ኩ: "ku", ኪ: "ki", ካ: "ka", ኬ: "ke", ክ: "k", ኮ: "ko", ኯ: "ka",
    ወ: "wa", ዉ: "wu", ዊ: "wi", ዋ: "wa", ዌ: "we", ው: "w", ዎ: "wo", ዏ: "wa",
    ዐ: "a", ዑ: "u", ዒ: "i", ዓ: "a", ዔ: "e", ዕ: "e", ዖ: "o",
    ዘ: "za", ዙ: "zu", ዚ: "zi", ዛ: "za", ዜ: "ze", ዝ: "z", ዞ: "zo", ዟ: "za",
    ዠ: "zha", ዡ: "zhu", ዢ: "zhi", ዣ: "zha", ዤ: "zhe", ዥ: "zh", ዦ: "zho", ዧ: "zha",
    የ: "ya", ዩ: "yu", ዪ: "yi", ያ: "ya", ዬ: "ye", ይ: "y", ዮ: "yo", ዯ: "ya",
    ደ: "da", ዱ: "du", ዲ: "di", ዳ: "da", ዴ: "de", ድ: "d", ዶ: "do", ዷ: "da",
    ጀ: "ja", ጁ: "ju", ጂ: "ji", ጃ: "ja", ጄ: "je", ጅ: "j", ጆ: "jo", ጇ: "ja",
    ገ: "ga", ጉ: "gu", ጊ: "gi", ጋ: "ga", ጌ: "ge", ግ: "g", ጎ: "go", ጏ: "ga",
    ጠ: "ta", ጡ: "tu", ጢ: "ti", ጣ: "ta", ጤ: "te", ጥ: "t", ጦ: "to", ጧ: "ta",
    ጨ: "cha", ጩ: "chu", ጪ: "chi", ጫ: "cha", ጬ: "che", ጭ: "ch", ጮ: "cho", ጯ: "cha",
    ጰ: "pa", ጱ: "pu", ጲ: "pi", ጳ: "pa", ጴ: "pe", ጵ: "p", ጶ: "po", ጷ: "pa",
    ጸ: "tsa", ጹ: "tsu", ጺ: "tsi", ጻ: "tsa", ጼ: "tse", ጽ: "ts", ጾ: "tso", ጿ: "tsa",
    ፀ: "tsa", ፁ: "tsu", ፂ: "tsi", ፃ: "tsa", ፄ: "tse", ፅ: "ts", ፆ: "tso",
    ፈ: "fa", ፉ: "fu", ፊ: "fi", ፋ: "fa", ፌ: "fe", ፍ: "f", ፎ: "fo", ፏ: "fa",
    ፐ: "pa", ፑ: "pu", ፒ: "pi", ፓ: "pa", ፔ: "pe", ፕ: "p", ፖ: "po", ፗ: "pa",
    " ": " ", ".": ".", ",": ",",
  };
  let result = "";
  for (const char of input) {
    result += map[char] ?? char;
  }
  return result;
};

const VIEWED_IDS_KEY = "formal-request-viewed-ids";

const getViewedIds = (): Set<number> => {
  try {
    const raw = localStorage.getItem(VIEWED_IDS_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
};

const markAsViewed = (id: number) => {
  const ids = getViewedIds();
  ids.add(id);
  localStorage.setItem(VIEWED_IDS_KEY, JSON.stringify(Array.from(ids)));
};

const emitUnreadCount = () => {
  window.dispatchEvent(new CustomEvent("formal-request-unread"));
};

const timeAgo = (dateStr: string, isAm: boolean): string => {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  if (diffMs < 0) return isAm ? "አሁን" : "just now";
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return isAm ? "አሁን" : "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return isAm ? `${minutes} ደቂቃ በፊት` : `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return isAm ? `${hours} ሰዓት በፊት` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return isAm ? `${days} ቀን በፊት` : `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return isAm ? `${months} ወር በፊት` : `${months}mo ago`;
  return isAm ? `${Math.floor(months / 12)} ዓመት በፊት` : `${Math.floor(months / 12)}y ago`;
};

interface Request {
  id: number;
  requestLetterUrl: string;
  status: string;
  createdAt: string;
}

interface UserData {
  id: number;
  fullName: string;
  username?: string;
  faydaId?: string;
  formalRequests: Request[];
}

const mapRequestsToUsers = (requests: any[]): UserData[] => {
  const usersMap = new Map<number, UserData>();

  requests.forEach((req) => {
    const user = req.user || {};
    const userId = Number(user.id || req.userId);
    if (!userId) return;

    if (!usersMap.has(userId)) {
      usersMap.set(userId, {
        id: userId,
        fullName: user.fullName || user.username || `User ${userId}`,
        username: user.username,
        faydaId : user.faydaId,
        formalRequests: [],
      });
    }

    usersMap.get(userId)?.formalRequests.push({
      id: req.id,
      requestLetterUrl: req.requestLetterUrl,
      status: req.status,
      createdAt: req.createdAt,
    });
  });

  // Sort requests within each user by newest first, then sort users by their most recent request
  for (const user of usersMap.values()) {
    user.formalRequests.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }
  return Array.from(usersMap.values()).sort((a, b) => {
    const aDate = a.formalRequests[0]?.createdAt || "";
    const bDate = b.formalRequests[0]?.createdAt || "";
    return new Date(bDate).getTime() - new Date(aDate).getTime();
  });
};

const FormalRequestManager = ({
  users: initialUsers = [],
}: {
  users?: UserData[];
}) => {
  const { token } = useAuth();
  const { language } = useLanguage();
  const isAm = language === "am";
  const t = {
    title: isAm ? "ማመልከቻ ደብዳቤ አያያዝ" : "Formal Request Management",
    loading: isAm ? "ማመልከቻ ደብዳቤዎችን በመጫን ላይ..." : "Loading formal requests...",
    noRequests: isAm ? "ምንም ማመልከቻ ደብዳቤ አልተገኘም።" : "No formal requests found.",
    noFilterMatch: isAm ? "ከፍለጋ ወይም ማጣሪያ ጋር የሚዛመድ ተጠቃሚ የለም።" : "No users match your search or filter.",
    searchPlaceholder: isAm ? "በተጠቃሚ ስም ይፈልጉ..." : "Search by user name...",
    allStatuses: isAm ? "ሁሉም ሁኔታዎች" : "All Statuses",
    pending: isAm ? "በመጠባበቅ ላይ" : "Pending",
    approved: isAm ? "ጸድቋል" : "Approved",
    rejected: isAm ? "ውድቅ ተደርጓል" : "Rejected",
    totalSubmissions: isAm ? "ጠቅላላ ማስገቢያዎች" : "Total Submissions",
    faydaNo: isAm ? "ፋይዳ መለያ" : "Fayda Number",
    year: isAm ? "ዓመት" : "Year",
    requestLetter: isAm ? "ማመልከቻ ደብዳቤ #" : "Request Letter #",
    noRequestsForUser: isAm ? "ለዚህ ተጠቃሚ ምንም ማመልከቻ ደብዳቤ አልተገኘም።" : "No requests found for this user.",
    newLabel: isAm ? "አዲስ" : "new",
  };
  const [users, setUsers] = React.useState<UserData[]>(initialUsers);
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [readVersion, setReadVersion] = useState(0);

  React.useEffect(() => {
    const handler = () => {
      setReadVersion((v) => v + 1);
    };
    window.addEventListener("formal-request-unread", handler);
    return () => window.removeEventListener("formal-request-unread", handler);
  }, []);

  const filteredUsers = users.filter((user) => {
    const q = searchQuery.toLowerCase();
    const qLatin = transliterateAmharic(q);
    const matchName = user.fullName.toLowerCase().includes(qLatin);
    const matchUsername = user.username?.toLowerCase().includes(q);
    const matchRequestId = user.formalRequests.some((r) =>
      String(r.id).includes(searchQuery),
    );
    if (!matchName && !matchUsername && !matchRequestId) return false;
    if (statusFilter === "ALL") return true;
    return user.formalRequests.some((req) => req.status === statusFilter);
  });

  const updateRequestStatus = (
    userId: number,
    requestId: number,
    status: string,
  ) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id !== userId
          ? user
          : {
              ...user,
              formalRequests: user.formalRequests.map((req) =>
                req.id === requestId ? { ...req, status } : req,
              ),
            },
      ),
    );
  };

  React.useEffect(() => {
    if (initialUsers.length > 0) return;

    const loadFormalRequests = async () => {
      setLoading(true);
      setErrorMessage(null);

      try {
        const response = await apiRequest<{ data: any[] }>("/formal-requests", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const rows = Array.isArray(response?.data) ? response.data : [];
        const mapped = mapRequestsToUsers(rows);
        setUsers(mapped);
        emitUnreadCount();
      } catch (error: any) {
        setErrorMessage(error?.message || "Failed to load formal requests.");
      } finally {
        setLoading(false);
      }
    };

    loadFormalRequests();
  }, [initialUsers.length, token]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="border-l-4 border-[#DCC380] pl-4">
          <h2 className="text-xl font-black text-[#0C2A4C] uppercase tracking-tighter">
            {t.title}
          </h2>
        </div>
        {(() => {
          const viewed = getViewedIds();
          let count = 0;
          for (const u of users) {
            for (const r of u.formalRequests) {
              if (r.status === "PENDING" && !viewed.has(r.id)) count++;
            }
          }
          return count > 0 ? (
            <span
              key={readVersion}
              className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full leading-none whitespace-nowrap"
            >
              {count} {t.newLabel}
            </span>
          ) : null;
        })()}
      </div>

      {loading && (
        <p className="text-center text-xs text-gray-400 font-bold uppercase py-4">
          {t.loading}
        </p>
      )}

      {!loading && errorMessage && (
        <p className="text-center text-xs text-red-500 font-bold uppercase py-4">
          {errorMessage}
        </p>
      )}

      {!loading && !errorMessage && users.length === 0 && (
        <p className="text-center text-xs text-gray-400 font-bold uppercase py-4">
          {t.noRequests}
        </p>
      )}

      {!loading && !errorMessage && users.length > 0 && filteredUsers.length === 0 && (
        <p className="text-center text-xs text-gray-400 font-bold uppercase py-4">
          {t.noFilterMatch}
        </p>
      )}

      {!loading && !errorMessage && users.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-4 pr-10 py-3 rounded-2xl border-2 border-gray-200 bg-white text-sm text-[#0C2A4C] font-bold outline-none focus:ring-2 focus:ring-[#DCC380]/30 focus:border-[#DCC380] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-44 px-4 py-3 rounded-2xl border-2 border-gray-200 bg-white text-sm text-[#0C2A4C] font-bold outline-none focus:ring-2 focus:ring-[#DCC380]/30 focus:border-[#DCC380] transition-all"
          >
            <option value="ALL">{t.allStatuses}</option>
            <option value="PENDING">{t.pending}</option>
            <option value="APPROVED">{t.approved}</option>
            <option value="REJECTED">{t.rejected}</option>
          </select>
        </div>
      )}

      {!loading &&
        !errorMessage &&
        filteredUsers.length > 0 &&
        filteredUsers.map((user) => (
          <UserRequestDropdown
            key={user.id}
            user={user}
            token={token}
            onStatusUpdate={updateRequestStatus}
          />
        ))}
    </div>
  );
};

const UserRequestDropdown = ({
  user,
  token,
  onStatusUpdate,
}: {
  user: UserData;
  token: string | null;
  onStatusUpdate: (userId: number, requestId: number, status: string) => void;
}) => {
  const { language } = useLanguage();
  const isAm = language === "am";
  const dt = isAm
    ? {
        totalSubmissions: "ጠቅላላ ማስገቢያዎች",
        year: "ዓመት",
        requestLetter: "ማመልከቻ ደብዳቤ #",
        noRequestsForUser: "ለዚህ ተጠቃሚ ምንም ማመልከቻ ደብዳቤ አልተገኘም።",
        statusAction: "የሁኔታ እርምጃ",
        finalized: "የተጠናቀቀ",
        finalizedTitle: "ይህ ጥያቄ የተጠናቀቀ ነው እና መለወጥ አይቻልም።",
        approve: "ማጽደቅ",
        reject: "ውድቅ ማድረግ",
        apply: "ተግባራዊ አድርግ",
        action: "እርምጃ",
        updating: "በማዘመን ላይ...",
        rejectionFeedback: "የውድቅ ግብረመልስ",
        rejectionPlaceholder: "ለውድቅ ምክንያቱን ያስረዱ...",
        formalRequest: "ማመልከቻ ደብዳቤ",
        submitted: "የቀረበ",
        download: "አውርድ",
        previewNotAvailable: "ቅድመ እይታ አይገኝም።",
        fileActions: "የፋይል እርምጃዎች",
        viewFullscreen: "ሙሉ ማያ ገጽ ይመልከቱ",
        confirmApproveTitle: "ጥያቄውን ያጽድቁ?",
        confirmRejectTitle: "ጥያቄውን ውድቅ ያድርጉ?",
        confirmApproveMsg: "ይህ ጥያቄውን እንደ ተፈቀደ ምልክት ያደርገዋል እና ለተጠቃሚው ያሳውቃል።",
        confirmRejectMsg: "ይህ ጥያቄውን እንደ ተቀባይነት የሌለው ምልክት ያደርገዋል እና ለተጠቃሚው ያሳውቃል።",
        toastApproved: "ማመልከቻ ደብዳቤ ጸድቋል።",
        toastRejected: "ማመልከቻ ደብዳቤ ውድቅ ተደርጓል።",
        pending: "በመጠባበቅ ላይ",
        approved: "ጸድቋል",
        rejected: "ውድቅ ተደርጓል",
        searchPlaceholder: "በተጠቃሚ ስም ይፈልጉ...",
        allStatuses: "ሁሉም ሁኔታዎች",
        title: "ማመልከቻ ደብዳቤ አያያዝ",
        loading: "ማመልከቻ ደብዳቤዎችን በመጫን ላይ...",
        noRequests: "ምንም ማመልከቻ ደብዳቤ አልተገኘም።",
        noFilterMatch: "ከፍለጋ ወይም ማጣሪያ ጋር የሚዛመድ ተጠቃሚ የለም።",
        newLabel: "አዲስ",
        faydaNo: "ፋይዳ መለያ",
      }
    : {
        totalSubmissions: "Total Submissions",
        year: "Year",
        requestLetter: "Request Letter #",
        noRequestsForUser: "No requests found for this user.",
        statusAction: "Status Action",
        finalized: "Finalized",
        finalizedTitle: "This request is finalized and cannot be changed.",
        approve: "Approve",
        reject: "Reject",
        apply: "Apply",
        action: "Action",
        updating: "Updating...",
        rejectionFeedback: "Rejection Feedback",
        rejectionPlaceholder: "Provide reason for rejection...",
        formalRequest: "Formal Request",
        submitted: "Submitted",
        download: "Download",
        previewNotAvailable: "Preview not available.",
        fileActions: "File Actions",
        viewFullscreen: "View Fullscreen",
        confirmApproveTitle: "Approve request?",
        confirmRejectTitle: "Reject request?",
        confirmApproveMsg: "This will mark the request as approved and notify the user.",
        confirmRejectMsg: "This will mark the request as rejected and notify the user.",
        toastApproved: "Formal request approved.",
        toastRejected: "Formal request rejected.",
        pending: "Pending",
        approved: "Approved",
        rejected: "Rejected",
        searchPlaceholder: "Search by user name...",
        allStatuses: "All Statuses",
        title: "Formal Request Management",
        loading: "Loading formal requests...",
        noRequests: "No formal requests found.",
        noFilterMatch: "No users match your search or filter.",
        newLabel: "NEW",
        faydaNo: "Fayda Number",
      };
  const [isOpen, setIsOpen] = useState(false);
  const [activeRequest, setActiveRequest] = useState<Request | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [statusSelection, setStatusSelection] = useState<
    "APPROVED" | "REJECTED"
  >("APPROVED");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMessage, setToastMessage] = useState("");
  const [feedbackByRequest, setFeedbackByRequest] = useState<
    Record<number, string>
  >({});
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [showActionDropdown, setShowActionDropdown] = useState(false);

  const getFileTypeFromUrl = (url: string) => {
    const cleanPath = url.split("?")[0].split("#")[0];
    const ext = cleanPath.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return "application/pdf";
    if (ext === "png") return "image/png";
    if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
    if (ext === "webp") return "image/webp";
    if (ext === "gif") return "image/gif";
    return "application/octet-stream";
  };

  const getFileNameFromUrl = (url: string) => {
    const cleanPath = url.split("?")[0].split("#")[0];
    return cleanPath.split("/").pop() || "formal_request";
  };

  const getDownloadFileName = (url: string) => {
    const fileName = getFileNameFromUrl(url);
    const prefix = "FormalRequest_";
    return `${prefix}${fileName}`;
  };

  const resolveFileUrl = (url: string) => {
    if (!url) return url;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const base = API_BASE.replace(/\/api\/?$/, "");
    return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const currentFeedback = activeRequest
    ? feedbackByRequest[activeRequest.id] || ""
    : "";
  const trimmedFeedbackLength = currentFeedback.trim().length;
  const isFinalStatus =
    activeRequest?.status === "APPROVED" ||
    activeRequest?.status === "REJECTED";
  const isFeedbackValid =
    statusSelection !== "REJECTED" || trimmedFeedbackLength >= 30;

  const handleFeedbackChange = (value: string) => {
    if (!activeRequest) return;
    setFeedbackByRequest((prev) => ({ ...prev, [activeRequest.id]: value }));
    if (feedbackError) {
      setFeedbackError(null);
    }
  };

  const handleOpenViewer = (request: Request) => {
    markAsViewed(request.id);
    setActiveRequest(request);
    setIsViewerOpen(true);
    setStatusSelection(request.status === "REJECTED" ? "REJECTED" : "APPROVED");
    setUpdateError(null);
    setFeedbackError(null);
    emitUnreadCount();
  };

  const handleUpdateStatus = async () => {
    if (!activeRequest) return;
    if (isFinalStatus) return;

    if (statusSelection === "REJECTED") {
      if (trimmedFeedbackLength < 30) {
        setFeedbackError("Please provide at least 30 characters of feedback.");
        return;
      }
    }

    setIsUpdating(true);
    setUpdateError(null);
    setFeedbackError(null);

    try {
      const endpoint =
        statusSelection === "APPROVED"
          ? `/formal-requests/${activeRequest.id}/approve`
          : `/formal-requests/${activeRequest.id}/reject`;

      await apiRequest(endpoint, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: JSON.stringify({
          adminFeedback:
            statusSelection === "REJECTED" ? currentFeedback.trim() : "",
        }),
      });

      onStatusUpdate(user.id, activeRequest.id, statusSelection);
      setActiveRequest({ ...activeRequest, status: statusSelection });
      setToastType("success");
      setToastMessage(
        statusSelection === "APPROVED"
          ? dt.toastApproved
          : dt.toastRejected,
      );
      setToastOpen(true);
      setIsViewerOpen(false);
    } catch (error: any) {
      setUpdateError(error?.message || "Failed to update status.");
      setToastType("error");
      setToastMessage(error?.message || "Failed to update status.");
      setToastOpen(true);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRequestStatusUpdate = () => {
    if (!activeRequest) return;
    if (isFinalStatus) return;
    if (statusSelection === "REJECTED") {
      if (trimmedFeedbackLength < 30) {
        setFeedbackError("Please provide at least 30 characters of feedback.");
        return;
      }
    }
    setIsConfirmOpen(true);
  };

  const handleDownload = (url: string) => {
    const resolvedUrl = resolveFileUrl(url);
    const fileName = getDownloadFileName(url);
    
    // For PDFs and other files, fetch and create blob for reliable download
    fetch(resolvedUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.blob();
      })
      .then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      })
      .catch((error) => {
        console.error("Download failed:", error);
        // Fallback to direct download
        const link = document.createElement("a");
        link.href = resolvedUrl;
        link.download = fileName;
        link.rel = "noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
  };

  // LOGIC: Group requests by year calculated from 'createdAt'
  const groupedRequests = user.formalRequests?.reduce(
    (acc, request) => {
      const year = new Date(request.createdAt).getFullYear();
      if (!acc[year]) acc[year] = [];
      acc[year].push(request);
      return acc;
    },
    {} as Record<number, Request[]>,
  );

  const sortedYears = Object.keys(groupedRequests || {}).sort(
    (a, b) => Number(b) - Number(a),
  );

  return (
    <div className="overflow-hidden rounded-[32px] border-2 border-gray-100 bg-white transition-all shadow-sm">
      {/* Header: User Profile */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center justify-between p-6 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-2xl bg-[#0C2A4C] flex items-center justify-center">
            <UserIcon className="text-[#DCC380] w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-[#0C2A4C] uppercase text-sm flex items-center gap-2">
              {user.fullName} <br />{" "}
              {user.formalRequests.some(
                (r) => r.status === "PENDING" && !getViewedIds().has(r.id),
              ) && (
                <>
                  <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded leading-none">
                    {dt.newLabel}
                  </span>
                  <span className="text-[9px] text-gray-400 font-bold">
                    {timeAgo(
                      user.formalRequests
                        .filter(
                          (r) =>
                            r.status === "PENDING" && !getViewedIds().has(r.id),
                        )
                        .sort(
                          (a, b) =>
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime(),
                        )[0]?.createdAt ?? "",
                      isAm,
                    )}
                  </span>
                </>
              )}
            </h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {dt.totalSubmissions}: {user.formalRequests.length} <br />
              {dt.faydaNo}: {user.faydaId}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-[#0C2A4C] transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {/* Expanded Content: Year-based Grouping */}
      {isOpen && (
        <div className="bg-gray-50/50 p-6 border-t border-gray-100 space-y-8">
          {sortedYears.length > 0 ? (
            sortedYears.map((year) => (
              <div key={year} className="space-y-4">
                {/* Year Label */}
                <div className="flex items-center space-x-3">
                  <span className="text-[11px] font-black text-[#DCC380] uppercase tracking-[0.2em] bg-white px-3 py-1 rounded-full border border-gray-200">
                    {dt.year} {year}
                  </span>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>

                {/* Letters for that year */}
                <div className="grid gap-3 pl-4">
                  {groupedRequests[Number(year)].map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 group hover:border-[#0C2A4C] transition-all"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-[#0C2A4C]/5 p-2 rounded-lg group-hover:bg-[#0C2A4C] transition-colors">
                          <FileText className="w-4 h-4 text-[#0C2A4C] group-hover:text-[#DCC380]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#0C2A4C]">
                            {dt.requestLetter}
                            {req.id}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {new Date(req.createdAt).toLocaleDateString(
                              isAm ? "am-ET" : "en-US",
                              { day: "numeric", month: "short" },
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div
                          className={`flex items-center space-x-1 px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                            req.status === "APPROVED"
                              ? "bg-emerald-50 text-emerald-600"
                              : req.status === "REJECTED"
                                ? "bg-red-50 text-red-600"
                                : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {req.status === "APPROVED" ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : req.status === "REJECTED" ? (
                            <XCircle className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          <span>
                            {req.status === "APPROVED"
                              ? dt.approved
                              : req.status === "REJECTED"
                                ? dt.rejected
                                : dt.pending}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenViewer(req)}
                          className="p-2 text-[#0C2A4C] hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-xs text-gray-400 font-bold uppercase py-4">
              {dt.noRequestsForUser}
            </p>
          )}
        </div>
      )}
      {isViewerOpen && activeRequest && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-xl">
          <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-7xl h-full overflow-hidden flex flex-col">
            <div className="p-4 sm:p-6 border-b flex items-center justify-between bg-white z-20 flex-shrink-0">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-[#0C2A4C] flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-[#DCC380]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                    {dt.formalRequest}
                  </p>
                  <h3 className="text-sm sm:text-base font-black text-[#0C2A4C] truncate">
                    {getFileNameFromUrl(activeRequest.requestLetterUrl)}
                  </h3>
                  <p className="text-[10px] text-gray-500">
                    {dt.submitted}{" "}
                    {new Date(activeRequest.createdAt).toLocaleDateString(
                      isAm ? "am-ET" : "en-US",
                      { day: "numeric", month: "long", year: "numeric" },
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload(activeRequest.requestLetterUrl)}
                  className="inline-flex items-center justify-center rounded-xl border-2 border-blue-500 bg-blue-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-500 hover:text-white transition-all"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  {dt.download}
                </button>
                {!isFinalStatus && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowActionDropdown(!showActionDropdown)}
                      className="inline-flex items-center justify-center rounded-xl bg-[#0C2A4C] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#DCC380] hover:bg-[#0C2A4C]/90 transition-all"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 mr-1.5 transition-transform ${showActionDropdown ? "rotate-180" : ""}`}
                      />
                      {dt.action}
                    </button>
                    <AnimatePresence>
                      {showActionDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border-2 border-[#0C2A4C] overflow-hidden z-30"
                        >
                          <div className="p-5 space-y-4">
                            <div className="flex gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setStatusSelection("APPROVED");
                                  setFeedbackError(null);
                                }}
                                className={`flex-1 flex items-center justify-center rounded-xl px-4 py-3.5 text-sm font-black uppercase tracking-widest transition-all border-2 ${
                                  statusSelection === "APPROVED"
                                    ? "bg-white text-green-600 border-green-600 shadow-md"
                                    : "bg-white text-green-600 border-green-200 hover:border-green-600"
                                }`}
                              >
                                <Check className="w-4 h-4 mr-2" />
                                {dt.approve}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setStatusSelection("REJECTED");
                                  setFeedbackError(null);
                                }}
                                className={`flex-1 flex items-center justify-center rounded-xl px-4 py-3.5 text-sm font-black uppercase tracking-widest transition-all border-2 ${
                                  statusSelection === "REJECTED"
                                    ? "bg-white text-red-600 border-red-600 shadow-md"
                                    : "bg-white text-red-600 border-red-200 hover:border-red-600"
                                }`}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                {dt.reject}
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={handleRequestStatusUpdate}
                              disabled={isUpdating}
                              className="w-full flex items-center justify-center rounded-xl bg-[#0C2A4C] text-[#DCC380] text-sm font-black uppercase tracking-widest px-5 py-3.5 transition-all hover:bg-[#0C2A4C]/90 disabled:opacity-60 disabled:cursor-not-allowed border-2 border-[#DCC380]"
                            >
                              {isUpdating
                                ? dt.updating
                                : `${dt.apply} ${statusSelection}`}
                            </button>
                            {statusSelection === "REJECTED" && (
                              <div className="space-y-3 border-2 border-gray-100 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                                    {dt.rejectionFeedback}
                                  </label>
                                  <span
                                    className={`text-xs font-black uppercase tracking-widest ${
                                      trimmedFeedbackLength < 30
                                        ? "text-yellow-600"
                                        : "text-blue-600"
                                    }`}
                                  >
                                    {trimmedFeedbackLength}/30
                                  </span>
                                </div>
                                <textarea
                                  value={currentFeedback}
                                  onChange={(event) =>
                                    handleFeedbackChange(event.target.value)
                                  }
                                  rows={5}
                                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm text-[#0C2A4C] focus:outline-none focus:ring-2 focus:ring-yellow-300/20"
                                  placeholder={dt.rejectionPlaceholder}
                                />
                                {feedbackError && (
                                  <p className="text-xs text-red-500 font-bold">
                                    {feedbackError}
                                  </p>
                                )}
                              </div>
                            )}
                            {updateError && (
                              <p className="text-xs text-red-500 font-bold">
                                {updateError}
                              </p>
                            )}
                            {getFileTypeFromUrl(
                              activeRequest.requestLetterUrl,
                            ) === "application/pdf" && (
                              <div className="pt-2 border-t-2 border-gray-100">
                                <a
                                  href={resolveFileUrl(
                                    activeRequest.requestLetterUrl,
                                  )}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center justify-center rounded-xl bg-gray-100 px-5 py-3.5 text-sm font-black uppercase tracking-widest text-[#0C2A4C] hover:bg-gray-200 transition-all border-2 border-gray-200"
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  {dt.viewFullscreen}
                                </a>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
                {isFinalStatus && (
                  <span
                    title={dt.finalizedTitle}
                    className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1.5 rounded-full"
                  >
                    {dt.finalized}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsViewerOpen(false);
                    setShowActionDropdown(false);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-gray-100 p-4 sm:p-6 flex items-stretch justify-center overflow-auto">
              {getFileTypeFromUrl(activeRequest.requestLetterUrl).startsWith(
                "image/",
              ) ? (
                <img
                  src={resolveFileUrl(activeRequest.requestLetterUrl)}
                  alt={dt.formalRequest}
                  className="max-w-full max-h-full object-contain rounded-2xl shadow-lg bg-white"
                />
              ) : getFileTypeFromUrl(activeRequest.requestLetterUrl) ===
                "application/pdf" ? (
                <iframe
                  src={`${resolveFileUrl(activeRequest.requestLetterUrl)}#toolbar=0`}
                  title={dt.formalRequest}
                  className="w-full h-full rounded-2xl border-0 bg-white shadow-lg"
                />
              ) : (
                <div className="bg-white rounded-2xl p-8 shadow-lg text-center self-center">
                  <FileText className="w-10 h-10 text-gray-300 mx-auto" />
                  <p className="mt-3 text-sm text-gray-500">
                    {dt.previewNotAvailable}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <>
        <ConfirmDialog
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={async () => {
            await handleUpdateStatus();
            setIsConfirmOpen(false);
          }}
          isConfirmDisabled={!isFeedbackValid || isFinalStatus}
          title={
            statusSelection === "APPROVED"
              ? dt.confirmApproveTitle
              : dt.confirmRejectTitle
          }
          message={
            statusSelection === "APPROVED"
              ? dt.confirmApproveMsg
              : dt.confirmRejectMsg
          }
          type={statusSelection === "APPROVED" ? "approve" : "reject"}
          isLoading={isUpdating}
        />
        <AutoDismissToast
          isOpen={toastOpen}
          type={toastType}
          message={toastMessage}
          onClose={() => setToastOpen(false)}
        />
      </>
    </div>
  );
};

export default FormalRequestManager;
