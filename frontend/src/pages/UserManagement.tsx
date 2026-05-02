import React, { useState } from 'react';
import { UserPlus, Shield, Mail, Phone, MoreVertical, Trash2, Edit2, Key, X, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

export const UserManagement = () => {
  const { language, t: translations } = useLanguage();
  const isAm = language === 'am';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [users, setUsers] = useState([
    { id: 1, name: "Admin One", email: "admin1@federalpolice.gov.et", role: "Super Admin", status: "Active", lastLogin: "2 hours ago" },
    { id: 2, name: "Reviewer Alpha", email: "alpha@federalpolice.gov.et", role: "Reviewer", status: "Active", lastLogin: "5 hours ago" },
    { id: 3, name: "Admin Beta", email: "beta@federalpolice.gov.et", role: "Admin", status: "Inactive", lastLogin: "2 days ago" },
  ]);

  const t = {
    title: isAm ? "የተጠቃሚዎች አስተዳደር" : "User Management",
    subtitle: isAm ? "የፌዴራል ፖሊስ አስተዳዳሪዎችን መለያዎች ያስተዳድሩ" : "Manage accounts for Federal Police administrators",
    addUser: isAm ? "አዲስ አስተዳዳሪ ጨምር" : "Add New Admin",
    editUser: isAm ? "አስተዳዳሪን አሻሽል" : "Edit Admin",
    table: {
      user: isAm ? "ተጠቃሚ" : "User",
      role: isAm ? "ሚና" : "Role",
      status: isAm ? "ሁኔታ" : "Status",
      lastLogin: isAm ? "የመጨረሻ መግቢያ" : "Last Login",
      actions: isAm ? "እርምጃዎች" : "Actions"
    },
    roles: {
      superAdmin: isAm ? "ዋና አስተዳዳሪ" : "Super Admin",
      admin: isAm ? "አስተዳዳሪ" : "Admin",
      reviewer: isAm ? "ገምጋሚ" : "Reviewer"
    },
    form: {
      name: isAm ? "ሙሉ ስም" : "Full Name",
      email: isAm ? "ኢሜል" : "Email",
      role: isAm ? "ሚና" : "Role",
      status: isAm ? "ሁኔታ" : "Status",
      save: isAm ? "አስቀምጥ" : "Save Changes",
      create: isAm ? "ፍጠር" : "Create Account",
      cancel: isAm ? "ሰርዝ" : "Cancel"
    },
    status: {
      active: isAm ? "ንቁ" : "Active",
      inactive: isAm ? "ቦዝኗል" : "Inactive",
      suspended: isAm ? "የታገደ" : "Suspended"
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm(isAm ? "እርግጠኛ ነዎት ይህን ተጠቃሚ መሰረዝ ይፈልጋሉ?" : "Are you sure you want to delete this user?")) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const userData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      role: formData.get('role') as string,
      status: formData.get('status') as string,
    };

    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...userData } : u));
    } else {
      setUsers([...users, { id: Date.now(), ...userData, lastLogin: "Never" }]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8">
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

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-8 py-4 font-bold">{t.table.user}</th>
                <th className="px-8 py-4 font-bold">{t.table.role}</th>
                <th className="px-8 py-4 font-bold">{t.table.status}</th>
                <th className="px-8 py-4 font-bold">{t.table.lastLogin}</th>
                <th className="px-8 py-4 font-bold text-right">{t.table.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-primary font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-primary text-sm">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex items-center space-x-2">
                      <Shield className={`w-4 h-4 ${user.role === 'Super Admin' ? 'text-purple-500' : 'text-blue-500'}`} />
                      <span className="text-sm text-gray-600">
                        {user.role === 'Super Admin' ? t.roles.superAdmin : 
                         user.role === 'Admin' ? t.roles.admin : t.roles.reviewer}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      user.status === 'Active' ? 'bg-green-100 text-green-700' : 
                      user.status === 'Suspended' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {user.status === 'Active' ? t.status.active : 
                       user.status === 'Suspended' ? t.status.suspended : t.status.inactive}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-sm text-gray-600">{user.lastLogin}</td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => handleEdit(user)}
                        className="p-2 text-gray-400 hover:text-primary transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
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

      {/* Modal */}
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
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b flex justify-between items-center">
                <h3 className="text-xl font-bold text-primary">{editingUser ? t.editUser : t.addUser}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t.form.name}</label>
                  <input 
                    name="name"
                    defaultValue={editingUser?.name}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t.form.email}</label>
                  <input 
                    name="email"
                    type="email"
                    defaultValue={editingUser?.email}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t.form.role}</label>
                    <select 
                      name="role"
                      defaultValue={editingUser?.role || "Admin"}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all"
                    >
                      <option value="Super Admin">{t.roles.superAdmin}</option>
                      <option value="Admin">{t.roles.admin}</option>
                      <option value="Reviewer">{t.roles.reviewer}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t.form.status}</label>
                    <select 
                      name="status"
                      defaultValue={editingUser?.status || "Active"}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all"
                    >
                      <option value="Active">{t.status.active}</option>
                      <option value="Inactive">{t.status.inactive}</option>
                      <option value="Suspended">{t.status.suspended}</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
