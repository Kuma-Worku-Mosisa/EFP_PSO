import { useState } from "react";
import { motion } from "framer-motion";
import {
  UserCheck,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Eye,
  X,
  Building2,
  Briefcase,
  User,
  FileText,
  Calendar,
  Mail,
  Phone,
  Fingerprint,
  GraduationCap,
  MapPin,
  Shield,
  BookOpen,
  Award,
  IdCard,
  Heart,
  Upload,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

interface ChangeRequest {
  id: number;
  organizationName: string;
  positionType: string;
  newPersonName: string;
  previousPersonName: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  date: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  citizenship: string;
  faydaId: string;
  email: string;
  phone: string;
  position: string;
  educationLevel: string;
  workExpYears: number;
  totalExpYears: number;
  region: string;
  zone: string;
  woreda: string;
  kebele: string;
  houseNumber: string;
  specialLocation: string;
  documents: { key: string; labelEn: string; labelAm: string; required: boolean; fileName?: string }[];
}

const mockRequests: ChangeRequest[] = [
  {
    id: 1, organizationName: "ABC Security PLC", positionType: "Personnel Manager", newPersonName: "Abebe Kebede", previousPersonName: "Meron Alemu", reason: "Resignation of the previous personnel manager due to personal reasons", status: "Pending", date: "2025-06-15",
    firstName: "Abebe", middleName: "Girma", lastName: "Kebede", gender: "Male", citizenship: "Ethiopian", faydaId: "FAN-001234", email: "abebe.k@abcsecurity.com", phone: "+251911123456",
    position: "Personnel Manager", educationLevel: "Degree", workExpYears: 12, totalExpYears: 15,
    region: "Addis Ababa", zone: "Bole", woreda: "Woreda 03", kebele: "Kebele 08", houseNumber: "House 123", specialLocation: "Near Bole International Airport",
    documents: [
      { key: "fingerprint", labelEn: "Fingerprint from Police", labelAm: "ከፖሊስ የጣት አሻራ", required: true, fileName: "fingerprint_abebe.pdf" },
      { key: "medical", labelEn: "Medical Result", labelAm: "የህክምና ውጤት", required: true, fileName: "medical_abebe.pdf" },
      { key: "education", labelEn: "Educational Certificate", labelAm: "የትምህርት የምስክር ወረቀት", required: true, fileName: "degree_certificate.pdf" },
      { key: "collateral", labelEn: "Proof of Collateral", labelAm: "የማስረጃ ማስረጃ", required: true },
      { key: "training", labelEn: "Training Certificate", labelAm: "የስልጠና የምስክር ወረቀት", required: false, fileName: "training_cert.pdf" },
    ],
  },
  {
    id: 2, organizationName: "Ethio Guard Solutions", positionType: "Operations Head", newPersonName: "Tigist Haile", previousPersonName: "Dawit Eshetu", reason: "Internal transfer to branch office", status: "Pending", date: "2025-06-10",
    firstName: "Tigist", middleName: "Mekonnen", lastName: "Haile", gender: "Female", citizenship: "Ethiopian", faydaId: "FAN-005678", email: "tigist.h@ethioguard.com", phone: "+251911789012",
    position: "Operations Head", educationLevel: "Degree", workExpYears: 16, totalExpYears: 18,
    region: "Addis Ababa", zone: "Kirkos", woreda: "Woreda 01", kebele: "Kebele 05", houseNumber: "Apt 45", specialLocation: "Near Kirkos Church",
    documents: [
      { key: "fingerprint", labelEn: "Fingerprint from Police", labelAm: "ከፖሊስ የጣት አሻራ", required: true, fileName: "fingerprint_tigist.pdf" },
      { key: "medical", labelEn: "Medical Result", labelAm: "የህክምና ውጤት", required: true, fileName: "medical_tigist.pdf" },
      { key: "education", labelEn: "Educational Certificate", labelAm: "የትምህርት የምስክር ወረቀት", required: true },
      { key: "collateral", labelEn: "Proof of Collateral", labelAm: "የማስረጃ ማስረጃ", required: true, fileName: "collateral_tigist.pdf" },
    ],
  },
  {
    id: 3, organizationName: "Tena Security Services", positionType: "Admin Head", newPersonName: "Biruk Tadesse", previousPersonName: "Sara Hailu", reason: "Promotion due to outstanding performance", status: "Approved", date: "2025-06-05",
    firstName: "Biruk", middleName: "Ayele", lastName: "Tadesse", gender: "Male", citizenship: "Ethiopian", faydaId: "FAN-009876", email: "biruk.t@tenasecurity.com", phone: "+251911345678",
    position: "Admin Head", educationLevel: "Degree", workExpYears: 8, totalExpYears: 10,
    region: "Addis Ababa", zone: "Arada", woreda: "Woreda 02", kebele: "Kebele 03", houseNumber: "Villa 7", specialLocation: "Near Arada Stadium",
    documents: [
      { key: "fingerprint", labelEn: "Fingerprint from Police", labelAm: "ከፖሊስ የጣት አሻራ", required: true, fileName: "fingerprint_biruk.pdf" },
      { key: "medical", labelEn: "Medical Result", labelAm: "የህክምና ውጤት", required: true },
      { key: "education", labelEn: "Educational Certificate", labelAm: "የትምህርት የምስክር ወረቀት", required: true, fileName: "ba_degree.pdf" },
      { key: "collateral", labelEn: "Proof of Collateral", labelAm: "የማስረጃ ማስረጃ", required: true },
    ],
  },
  {
    id: 4, organizationName: "ABC Security PLC", positionType: "Compliance Officer", newPersonName: "Henok Mesfin", previousPersonName: "Betelhem Assefa", reason: "Resignation", status: "Rejected", date: "2025-05-28",
    firstName: "Henok", middleName: "Daniel", lastName: "Mesfin", gender: "Male", citizenship: "Ethiopian", faydaId: "FAN-003456", email: "henok.m@abcsecurity.com", phone: "+251911567890",
    position: "Compliance Officer", educationLevel: "Degree", workExpYears: 4, totalExpYears: 5,
    region: "Addis Ababa", zone: "Bole", woreda: "Woreda 06", kebele: "Kebele 12", houseNumber: "House 89", specialLocation: "Near Bole Medhanealem Church",
    documents: [
      { key: "fingerprint", labelEn: "Fingerprint from Police", labelAm: "ከፖሊስ የጣት አሻራ", required: true },
      { key: "medical", labelEn: "Medical Result", labelAm: "የህክምና ውጤት", required: true, fileName: "medical_henok.pdf" },
      { key: "education", labelEn: "Educational Certificate", labelAm: "የትምህርት የምስክር ወረቀት", required: true },
      { key: "collateral", labelEn: "Proof of Collateral", labelAm: "የማስረጃ ማስረጃ", required: true },
    ],
  },
  {
    id: 5, organizationName: "Addis Shield Security", positionType: "Field Agent", newPersonName: "Tekle Ayele", previousPersonName: "Lemlem Wondimu", reason: "Transfer to new department", status: "Pending", date: "2025-06-18",
    firstName: "Tekle", middleName: "Hailu", lastName: "Ayele", gender: "Male", citizenship: "Ethiopian", faydaId: "FAN-007890", email: "tekle.a@addisshield.com", phone: "+251911234567",
    position: "Field Agent", educationLevel: "Diploma", workExpYears: 7, totalExpYears: 9,
    region: "Addis Ababa", zone: "Kirkos", woreda: "Woreda 04", kebele: "Kebele 09", houseNumber: "House 34", specialLocation: "Near Kirkos Police Station",
    documents: [
      { key: "fingerprint", labelEn: "Fingerprint from Police", labelAm: "ከፖሊስ የጣት አሻራ", required: true, fileName: "fingerprint_tekle.pdf" },
      { key: "medical", labelEn: "Medical Result", labelAm: "የህክምና ውጤት", required: true },
      { key: "education", labelEn: "Educational Certificate", labelAm: "የትምህርት የምስክር ወረቀት", required: true, fileName: "diploma_cert.pdf" },
      { key: "collateral", labelEn: "Proof of Collateral", labelAm: "የማስረጃ ማስረጃ", required: true },
      { key: "training", labelEn: "Training Certificate", labelAm: "የስልጠና የምስክር ወረቀት", required: false, fileName: "field_training.pdf" },
    ],
  },
];

const documentLabels = [
  { key: "fingerprint", labelEn: "Fingerprint from Police", labelAm: "ከፖሊስ የጣት አሻራ" },
  { key: "medical", labelEn: "Medical Result", labelAm: "የህክምና ውጤት" },
  { key: "training", labelEn: "Training Certificate", labelAm: "የስልጠና የምስክር ወረቀት" },
  { key: "support_letter", labelEn: "Support Letter (Kebele)", labelAm: "የድጋፍ ደብዳቤ (ቀበሌ)" },
  { key: "collateral", labelEn: "Proof of Collateral", labelAm: "የማስረጃ ማስረጃ" },
  { key: "work_exp", labelEn: "Work Experience", labelAm: "የስራ ልምድ" },
  { key: "resignation", labelEn: "Resignation Record", labelAm: "የመልቀቂያ መዝገብ" },
  { key: "education", labelEn: "Educational Certificate", labelAm: "የትምህርት የምስክር ወረቀት" },
  { key: "national_id", labelEn: "National ID", labelAm: "ብሔራዊ መታወቂያ" },
  { key: "kebele_id", labelEn: "Renewed Kebele ID/Passport", labelAm: "የታደሰ የቀበሌ መታወቂያ/ፓስፖርት" },
  { key: "org_id", labelEn: "Organization Identification", labelAm: "የድርጅት መታወቂያ" },
];

export const PersonnelChangeApprovals = () => {
  const { language } = useLanguage();
  const isAm = language === "am";
  const [requests, setRequests] = useState<ChangeRequest[]>(mockRequests);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [previewRequest, setPreviewRequest] = useState<ChangeRequest | null>(null);
  const [previewDocKey, setPreviewDocKey] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const filtered = requests.filter((r) => {
    const matchesSearch =
      !searchQuery ||
      r.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.positionType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.newPersonName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "ALL" || r.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleAction = (id: number, action: "Approved" | "Rejected") => {
    setProcessing(true);
    setTimeout(() => {
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: action } : r)),
      );
      setPreviewRequest(null);
      setProcessing(false);
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="relative overflow-hidden bg-gradient-to-r from-[#003366] to-[#001F3F] rounded-3xl p-6 border border-white/10">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FFD700] via-[#C5A022] to-[#FFD700]" />
        <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-[#FFD700]/5" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FFD700]/20 flex items-center justify-center">
            <UserCheck className="w-6 h-6 text-[#FFD700]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white uppercase tracking-tight">
              {isAm ? "የሰራተኞች ለውጥ ማረጋገጫ" : "Personnel Change Approvals"}
            </h1>
            <p className="text-xs text-white/50 font-medium mt-1">
              {isAm
                ? "ከድርጅቶች የቀረቡ የሰራተኞች ለውጥ ጥያቄዎችን ይመልከቱ እና ያረጋግጡ"
                : "Review and approve personnel change requests submitted by organizations"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAm ? "በድርጅት ወይም በስም ፈልግ..." : "Search by organization or name..."}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]/50 outline-none transition-all"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]/50 outline-none transition-all"
          >
            <option value="ALL">{isAm ? "ሁሉም" : "All Status"}</option>
            <option value="Pending">{isAm ? "በመጠባበቅ ላይ" : "Pending"}</option>
            <option value="Approved">{isAm ? "ጸድቋል" : "Approved"}</option>
            <option value="Rejected">{isAm ? "ውድቅ" : "Rejected"}</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#003366] text-white text-[11px] uppercase tracking-[0.2em]">
                <th className="p-4">{isAm ? "ድርጅት" : "Organization"}</th>
                <th className="p-4">{isAm ? "ቦታ" : "Position"}</th>
                <th className="p-4">{isAm ? "አዲስ ሰው" : "New Person"}</th>
                <th className="p-4">{isAm ? "የቀድሞ ሰው" : "Previous"}</th>
                <th className="p-4">{isAm ? "ምክንያት" : "Reason"}</th>
                <th className="p-4">{isAm ? "ሁኔታ" : "Status"}</th>
                <th className="p-4">{isAm ? "ቀን" : "Date"}</th>
                <th className="p-4 text-right">{isAm ? "ድርጊት" : "Action"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700">
              {filtered.map((req) => (
                <motion.tr
                  key={req.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ backgroundColor: "rgba(0,51,102,0.02)" }}
                  className="transition-colors"
                >
                  <td className="p-4 font-bold text-[#003366]">{req.organizationName}</td>
                  <td className="p-4">{req.positionType}</td>
                  <td className="p-4">{req.newPersonName}</td>
                  <td className="p-4 text-gray-500">{req.previousPersonName}</td>
                  <td className="p-4 max-w-[120px] truncate">{req.reason}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
                      req.status === "Approved" ? "bg-green-50 text-green-700 border border-green-200" :
                      req.status === "Pending" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                      "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                      {req.status === "Approved" ? <CheckCircle className="w-3 h-3" /> :
                       req.status === "Pending" ? <Clock className="w-3 h-3" /> :
                       <XCircle className="w-3 h-3" />}
                      {isAm ?
                        req.status === "Approved" ? "ጸድቋል" :
                        req.status === "Pending" ? "በመጠባበቅ ላይ" :
                        "ውድቅ"
                        : req.status}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-gray-400">{req.date}</td>
                  <td className="p-4 text-right">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setPreviewRequest(req)}
                      className="px-3 py-1.5 bg-[#003366] text-white rounded-lg text-xs font-bold hover:bg-[#001F3F] transition-colors inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> {isAm ? "ተመልከት" : "Preview"}
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400">
                    {isAm ? "ምንም ጥያቄ የለም" : "No requests found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      {previewRequest && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 pt-8 overflow-y-auto"
          onClick={() => !processing && setPreviewRequest(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden my-8"
          >
            <div className="relative bg-gradient-to-r from-[#003366] to-[#001F3F] p-5">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD700] via-[#C5A022] to-[#FFD700]" />
              <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-[#FFD700]/5" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#FFD700]/20 flex items-center justify-center">
                    <Eye className="w-4 h-4 text-[#FFD700]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {isAm ? "የጥያቄ ዝርዝር" : "Request Details"}
                    </h3>
                    <p className="text-[10px] text-white/50 font-medium">
                      {isAm ? "ከድርጅቱ የቀረበውን ሙሉ መረጃ ይገምግሙ" : "Review full details submitted by the organization"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => !processing && setPreviewRequest(null)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-6 max-h-[calc(100vh-12rem)] overflow-y-auto space-y-5">
              {/* Basic Information */}
              <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-blue-50/30 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <User className="w-4 h-4 text-[#003366]" />
                  <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#003366]">
                    {isAm ? "መሠረታዊ መረጃ" : "Basic Information"}
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-gray-400 mb-1">{isAm ? "ስም" : "First Name"} *</p>
                    <p className="text-sm font-semibold text-gray-800">{previewRequest.firstName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-gray-400 mb-1">{isAm ? "የአባት ስም" : "Middle Name"} *</p>
                    <p className="text-sm font-semibold text-gray-800">{previewRequest.middleName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-gray-400 mb-1">{isAm ? "የአያት ስም" : "Last Name"} *</p>
                    <p className="text-sm font-semibold text-gray-800">{previewRequest.lastName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-gray-400 mb-1">{isAm ? "ጾታ" : "Gender"} *</p>
                    <p className="text-sm font-semibold text-gray-800">{previewRequest.gender}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-gray-400 mb-1">{isAm ? "ዜግነት" : "Citizenship"}</p>
                    <p className="text-sm font-semibold text-gray-800">{previewRequest.citizenship}</p>
                  </div>
                </div>
              </div>

              {/* Identity & Contact */}
              <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-purple-50/30 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <IdCard className="w-4 h-4 text-[#003366]" />
                  <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#003366]">
                    {isAm ? "መታወቂያ እና መገኛ" : "Identity & Contact"}
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-gray-400 mb-1">Fayda ID *</p>
                    <p className="text-sm font-semibold font-mono text-gray-800">{previewRequest.faydaId}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-gray-400 mb-1">Email *</p>
                    <p className="text-sm font-semibold text-gray-800 flex items-center gap-1"><Mail className="w-3 h-3 text-gray-400" /> {previewRequest.email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-gray-400 mb-1">Phone *</p>
                    <p className="text-sm font-semibold text-gray-800 flex items-center gap-1"><Phone className="w-3 h-3 text-gray-400" /> {previewRequest.phone}</p>
                  </div>
                </div>
              </div>

              {/* Position & Experience */}
              <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-emerald-50/30 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <Briefcase className="w-4 h-4 text-[#003366]" />
                  <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#003366]">
                    {isAm ? "ቦታ እና ልምድ" : "Position & Experience"}
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-gray-400 mb-1">{isAm ? "ቦታ" : "Position"} *</p>
                    <p className="text-sm font-semibold text-gray-800">{previewRequest.position}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-gray-400 mb-1">{isAm ? "የትምህርት ደረጃ" : "Education Level"}</p>
                    <p className="text-sm font-semibold text-gray-800">{previewRequest.educationLevel || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-gray-400 mb-1">{isAm ? "የስራ ልምድ (ዓመታት)" : "Work Experience (Years)"}</p>
                    <p className="text-sm font-semibold text-gray-800">{previewRequest.workExpYears} {isAm ? "ዓመታት" : "years"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-gray-400 mb-1">{isAm ? "አጠቃላይ ልምድ (ዓመታት)" : "Total Experience (Years)"}</p>
                    <p className="text-sm font-semibold text-gray-800">{previewRequest.totalExpYears} {isAm ? "ዓመታት" : "years"}</p>
                  </div>
                </div>
              </div>

              {/* Residential Address */}
              <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-amber-50/30 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <MapPin className="w-4 h-4 text-[#003366]" />
                  <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#003366]">
                    {isAm ? "የመኖሪያ አድራሻ" : "Residential Address"}
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-gray-400 mb-1">{isAm ? "ክልል" : "Region"} *</p>
                    <p className="text-sm font-semibold text-gray-800">{previewRequest.region}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-gray-400 mb-1">{isAm ? "ዞን" : "Zone"} *</p>
                    <p className="text-sm font-semibold text-gray-800">{previewRequest.zone}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-gray-400 mb-1">{isAm ? "ወረዳ" : "Woreda"} *</p>
                    <p className="text-sm font-semibold text-gray-800">{previewRequest.woreda}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-gray-400 mb-1">{isAm ? "ቀበሌ" : "Kebele"} *</p>
                    <p className="text-sm font-semibold text-gray-800">{previewRequest.kebele}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-gray-400 mb-1">{isAm ? "የቤት ቁጥር" : "House Number"} *</p>
                    <p className="text-sm font-semibold text-gray-800">{previewRequest.houseNumber}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-gray-400 mb-1">{isAm ? "ልዩ ቦታ" : "Special Location"}</p>
                    <p className="text-sm font-semibold text-gray-800">{previewRequest.specialLocation || "—"}</p>
                  </div>
                </div>
              </div>

              {/* Reason for Change */}
              <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-red-50/30 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <FileText className="w-4 h-4 text-[#003366]" />
                  <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#003366]">
                    {isAm ? "የለውጥ ምክንያት" : "Reason for Change"}
                  </h4>
                </div>
                <p className="text-sm text-gray-700 bg-white rounded-xl p-3 border border-gray-100">
                  {previewRequest.reason}
                </p>
              </div>

              {/* Required Documents */}
              <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-cyan-50/30 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <Upload className="w-4 h-4 text-[#003366]" />
                  <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#003366]">
                    {isAm ? "አስፈላጊ ሰነዶች" : "Required Documents"}
                  </h4>
                  {previewDocKey && (
                    <button
                      onClick={() => setPreviewDocKey(null)}
                      className="ml-auto text-[10px] font-bold text-[#003366] hover:text-[#FFD700] transition-colors flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> {isAm ? "ወደ ዝርዝር ተመለስ" : "Back to list"}
                    </button>
                  )}
                </div>
                {previewDocKey ? (
                  <div className="space-y-3">
                    {(() => {
                      const doc = documentLabels.find((d) => d.key === previewDocKey);
                      const uploaded = previewRequest.documents.find((d) => d.key === previewDocKey);
                      if (!doc) return null;
                      return (
                        <>
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <div className="flex-1">
                              <p className="text-sm font-bold text-gray-800">{isAm ? doc.labelAm : doc.labelEn}</p>
                              <p className="text-xs text-gray-500">{uploaded?.fileName || "document.pdf"}</p>
                            </div>
                            {uploaded && <CheckCircle className="w-5 h-5 text-green-500" />}
                          </div>
                          <div className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
                            <div className="bg-gray-100 px-4 py-2 flex items-center justify-between border-b border-gray-200">
                              <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5" /> {uploaded?.fileName || "document.pdf"}
                              </span>
                              <span className="text-[10px] text-gray-400">PDF {isAm ? "ተመልከት" : "Preview"}</span>
                            </div>
                            <div className="bg-white flex items-center justify-center" style={{ height: 400 }}>
                              <iframe
                                src="/placeholder.pdf"
                                className="w-full h-full border-0"
                                title={isAm ? doc.labelAm : doc.labelEn}
                              >
                                {isAm ? "ይህ አሳሽ የPDF ቅድመ እይታን አይደግፍም" : "Your browser does not support PDF preview"}
                              </iframe>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {documentLabels.map((doc) => {
                      const uploaded = previewRequest.documents.find((d) => d.key === doc.key);
                      const isRequired = previewRequest.documents.find((d) => d.key === doc.key)?.required ?? false;
                      return (
                        <div
                          key={doc.key}
                          className={`flex items-center gap-3 p-3 rounded-xl border text-sm ${
                            uploaded
                              ? "bg-green-50/50 border-green-200"
                              : "bg-gray-50/50 border-gray-200 text-gray-400"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            uploaded ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-400"
                          }`}>
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-semibold ${uploaded ? "text-gray-800" : "text-gray-400"}`}>
                              {isAm ? doc.labelAm : doc.labelEn}
                              {isRequired && <span className="text-red-500 ml-0.5">*</span>}
                            </p>
                            {uploaded?.fileName ? (
                              <p className="text-[10px] text-green-600 truncate">{uploaded.fileName}</p>
                            ) : (
                              <p className="text-[10px]">{isAm ? "አልተሰቀለም" : "Not uploaded"}</p>
                            )}
                          </div>
                          {uploaded && (
                            <button
                              onClick={() => setPreviewDocKey(doc.key)}
                              className="shrink-0 w-7 h-7 rounded-lg bg-[#003366]/10 hover:bg-[#003366]/20 flex items-center justify-center transition-colors"
                              title={isAm ? "ተመልከት" : "Preview"}
                            >
                              <Eye className="w-3.5 h-3.5 text-[#003366]" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Status & Actions */}
              <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#003366]" />
                    <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#003366]">
                      {isAm ? "የጥያቄ ሁኔታ" : "Request Status"}
                    </h4>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${
                    previewRequest.status === "Approved" ? "bg-green-100 text-green-700" :
                    previewRequest.status === "Pending" ? "bg-amber-100 text-amber-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {previewRequest.status === "Approved" ? <CheckCircle className="w-3.5 h-3.5" /> :
                     previewRequest.status === "Pending" ? <Clock className="w-3.5 h-3.5" /> :
                     <XCircle className="w-3.5 h-3.5" />}
                    {isAm ?
                      previewRequest.status === "Approved" ? "ጸድቋል" :
                      previewRequest.status === "Pending" ? "በመጠባበቅ ላይ" :
                      "ውድቅ"
                      : previewRequest.status}
                  </span>
                </div>
                {previewRequest.status === "Pending" && (
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAction(previewRequest.id, "Rejected")}
                      disabled={processing}
                      className="flex-1 px-4 py-2.5 rounded-xl border-2 border-red-200 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                      {isAm ? "እምቢ በል" : "Reject"}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAction(previewRequest.id, "Approved")}
                      disabled={processing}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#003366] to-[#001F3F] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all inline-flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      {isAm ? "አረጋግጥ" : "Approve"}
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};
