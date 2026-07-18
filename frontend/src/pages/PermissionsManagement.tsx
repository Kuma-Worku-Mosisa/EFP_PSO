import React, { useState } from "react";
import {
  Shield,
  Lock,
  Users,
  Key,
  Info,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Save,
  SlidersHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "../context/LanguageContext";
import { cn } from "../lib/utils";

export const PermissionsManagement = () => {
  const { language } = useLanguage();
  const isAm = language === "am";
  const [selectedRole, setSelectedRole] = useState("super_admin");

  const roles = [
    {
      id: "super_admin",
      label: isAm ? "ዋና አስተዳዳሪ" : "Super Admin",
      count: 2,
      icon: <ShieldCheck className="w-5 h-5 text-purple-600" />,
      level: "Level 10",
    },
    {
      id: "admin",
      label: isAm ? "አስተዳዳሪ" : "Admin",
      count: 5,
      icon: <Shield className="w-5 h-5 text-blue-600" />,
      level: "Level 7",
    },
    {
      id: "reviewer",
      label: isAm ? "ገምጋሚ" : "Reviewer",
      count: 12,
      icon: <Key className="w-5 h-5 text-amber-600" />,
      level: "Level 4",
    },
    {
      id: "regional_head",
      label: isAm ? "የክልል ኃላፊ" : "Regional Head",
      count: 11,
      icon: <Users className="w-5 h-5 text-green-600" />,
      level: "Level 6",
    },
  ];

  const permissionGroups = [
    {
      title: isAm ? "የማመልከቻ ቁጥጥር" : "Application Workflow",
      permissions: [
        {
          key: "view_app",
          label: isAm ? "ማመልከቻዎችን ይመልከቱ" : "View Applications",
          desc: isAm
            ? "ለሁሉም የማመልከቻ አይነቶች የማንበብ ፍቃድ"
            : "Read-only access to all application types",
        },
        {
          key: "approve_app",
          label: isAm ? "ማመልከቻዎችን ያጽድቁ" : "Approve Applications",
          desc: isAm
            ? "የመጨረሻውን የማጽደቅ ስልጣን"
            : "Authority to finalize application decisions",
        },
        {
          key: "reject_app",
          label: isAm ? "ማመልከቻዎችን ውድቅ ያድርጉ" : "Reject/Flag Applications",
          desc: isAm
            ? "ወደ እርማት የመመለስ ወይም ውድቅ የማድረግ ስልጣን"
            : "Authority to flag items for correction",
        },
      ],
    },
    {
      title: isAm ? "የኤጀንሲ አስተዳደር" : "Organization Governance",
      permissions: [
        {
          key: "edit_agency",
          label: isAm ? "የድርጅት መገለጫዎችን ያሻሽሉ" : "Modify Organization Profiles",
          desc: isAm
            ? "የድርጅቶችን መረጃ የማስተካከል ፍቃድ"
            : "Edit core Organization structural data",
        },
        {
          key: "suspend_agency",
          label: isAm ? "ድርጅቶችን ያግዱ" : "Suspend Licenses",
          desc: isAm
            ? "የስራ ፍቃድ የማገድ ስልጣን"
            : "Kill-switch authority for organization operations",
        },
        {
          key: "view_gps",
          label: isAm ? "ጂፒኤስ መከታተል" : "GPS Fleet Tracking",
          desc: isAm
            ? "የደህንነት ሰራተኞችን እንቅስቃሴ ይከታተሉ"
            : "Live surveillance of active security units",
        },
      ],
    },
    {
      title: isAm ? "የስርአት ቁጥጥር" : "System Oversight",
      permissions: [
        {
          key: "manage_users",
          label: isAm ? "ተጠቃሚዎችን ያስተዳድሩ" : "Admin User Management",
          desc: isAm
            ? "አዲስ አስተዳዳሪዎችን የመጨመር እና የመሰረዝ ፍቃድ"
            : "Provisioning of Federal Police admin accounts",
        },
        {
          key: "view_reports",
          label: isAm ? "ሪፖርቶችን ይመልከቱ" : "Audit Log Access",
          desc: isAm
            ? "ሁሉንም የስርአት እንቅስቃሴዎች ይመልከቱ"
            : "Access to immutable forensic audit logs",
        },
        {
          key: "backup_access",
          label: isAm ? "መጠባበቂያዎችን ያስተዳድሩ" : "Backup Orchestration",
          desc: isAm
            ? "የውሂብ መመለሻ ነጥቦችን የማስተዳደር ፍቃድ"
            : "Permission to trigger system-wide snapshots",
        },
      ],
    },
  ];

  return (
    <div className="space-y-10 pb-20">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-primary tracking-tighter uppercase">
            {isAm ? "ፍቃዶች እና ሚናዎች" : "Permissions & Access Control"}
          </h2>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-widest opacity-60 italic">
            {isAm
              ? "የተጠቃሚዎችን የፍቃድ ደረጃዎች እና የሚና መዋቅሮችን ያዋቅሩ"
              : "Architect granular access vectors for all system archetypes"}
          </p>
        </div>
        <button className="flex items-center space-x-2 px-8 py-3 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
          <ChevronRight className="w-4 h-4" />
          <span>{isAm ? "አዲስ ሚና ፍጠር" : "Define New Role Schema"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Role Archetypes */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] pl-4 mb-4">
            {isAm ? "ሚናዎች" : "Defined Roles"}
          </h3>
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={cn(
                "w-full p-6 rounded-[32px] border-2 transition-all text-left flex items-center justify-between group",
                selectedRole === role.id
                  ? "border-primary bg-white shadow-2xl scale-[1.02]"
                  : "border-gray-50 bg-gray-50/50 hover:border-primary/20",
              )}
            >
              <div className="flex items-center space-x-4">
                <div
                  className={cn(
                    "p-3 rounded-2xl transition-all",
                    selectedRole === role.id
                      ? "bg-primary text-white shadow-lg"
                      : "bg-white text-gray-400 group-hover:text-primary",
                  )}
                >
                  {role.icon}
                </div>
                <div>
                  <p
                    className={cn(
                      "text-sm font-black tracking-tight",
                      selectedRole === role.id
                        ? "text-primary"
                        : "text-gray-600",
                    )}
                  >
                    {role.label}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {role.count} {isAm ? "ተጠቃሚዎች" : "Users"}
                  </p>
                </div>
              </div>
              <p className="text-[10px] font-black text-primary opacity-20 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">
                {role.level}
              </p>
            </button>
          ))}

          <div className="mt-10 p-8 bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
            <ShieldAlert className="w-10 h-10 text-gray-300 mb-4" />
            <p className="text-xs font-black text-gray-600 uppercase tracking-tight">
              {isAm ? "ሚናዎችን ማሻሻል" : "Role Integrity Warning"}
            </p>
            <p className="text-[10px] text-gray-400 font-medium italic mt-2">
              {isAm
                ? "ሚናዎችን ማሻሻል ንቁ ተጠቃሚዎች ላይ ወዲያውኑ ተጽዕኖ ይኖረዋል"
                : "Modifying core permissions propagates changes instantly to all active tokens."}
            </p>
          </div>
        </div>

        {/* Matrix Area */}
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white p-10 rounded-[48px] shadow-sm border border-gray-100 space-y-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-50 pb-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-primary uppercase tracking-tighter">
                    {roles.find((r) => r.id === selectedRole)?.label}{" "}
                    {isAm ? "ፍቃዶች" : "Capabilities Matrix"}
                  </h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                    {isAm
                      ? "ፍቃዶችን ለማሻሻል ይቀይሩ"
                      : "Toggle vectors to refine role scope"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-2xl">
                <button className="px-4 py-2 bg-white shadow-sm rounded-xl text-[10px] font-black uppercase tracking-widest text-primary border border-gray-100">
                  Standard View
                </button>
                <button className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-all">
                  JSON Schema
                </button>
              </div>
            </div>

            <div className="space-y-12">
              {permissionGroups.map((group, gIdx) => (
                <div key={gIdx} className="space-y-6">
                  <div className="flex items-center space-x-3 px-2">
                    <div className="w-1 h-4 bg-primary rounded-full" />
                    <h5 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">
                      {group.title}
                    </h5>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {group.permissions.map((perm, pIdx) => (
                      <div
                        key={pIdx}
                        className="group p-6 bg-gray-50/50 hover:bg-white border hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 rounded-[32px] transition-all flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center space-x-5">
                          <div className="w-10 h-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-300 group-hover:text-primary transition-colors">
                            <Shield className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-primary uppercase tracking-tight">
                              {perm.label}
                            </p>
                            <p className="text-[10px] font-bold text-gray-400 italic">
                              {perm.desc}
                            </p>
                          </div>
                        </div>
                        <div
                          className={cn(
                            "w-14 h-8 rounded-full relative transition-all shadow-inner",
                            selectedRole === "super_admin"
                              ? "bg-primary cursor-not-allowed opacity-50"
                              : "bg-gray-200",
                          )}
                        >
                          <div
                            className={cn(
                              "absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all",
                              selectedRole === "super_admin"
                                ? "right-1"
                                : "left-1",
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-10 flex justify-between items-center bg-gray-50/20 -mx-10 -mb-10 p-10 mt-10 rounded-b-[48px]">
              <div className="flex items-center space-x-3">
                <Info className="w-4 h-4 text-gray-400" />
                <p className="text-[10px] font-bold text-gray-400 italic">
                  Permissions for Super Admin are hard-locked to prevent
                  self-lockout.
                </p>
              </div>
              <button className="flex items-center space-x-4 px-10 py-5 bg-black text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl">
                <Save className="w-5 h-5" />
                <span>Update Audit Integrity</span>
              </button>
            </div>
          </div>

          <div className="p-10 border-2 border-dashed border-gray-100 rounded-[48px] flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-primary/20 transition-all cursor-pointer">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <SlidersHorizontal className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-black text-primary uppercase tracking-tighter">
                  Bulk Permission Orchestrator
                </h4>
                <p className="text-sm text-gray-500 font-bold opacity-60">
                  Architect cross-role permission clusters for regional nodes.
                </p>
              </div>
            </div>
            <button className="px-8 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm">
              Open Orchestrator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
