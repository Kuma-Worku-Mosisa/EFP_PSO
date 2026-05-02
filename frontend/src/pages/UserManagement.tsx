import React, { useState } from 'react';
import { UserPlus, Shield, Mail, Phone, MoreVertical, Trash2, Edit2, Key, X, Check, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

export const UserManagement = () => {
  const { language, t: translations } = useLanguage();
  const isAm = language === 'am';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [users, setUsers] = useState([
    { id: 1, firstName: "Admin", middleName: "System", lastName: "One", email: "admin1@federalpolice.gov.et", username: "admin1", role: "Admin", status: "Active", lastLogin: "2 hours ago" },
  ]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);

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
      admin: isAm ? "አስተዳዳሪ" : "Admin",
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
      verification: isAm ? "ማረጋገጫ" : "Verification",
      sendOtp: isAm ? "OTP ላክ" : "Send OTP",
      verifyOtp: isAm ? "አረጋግጥ" : "Verify",
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

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { label: '', color: 'bg-gray-200', text: '' };
    if (pass.length < 6) return { label: isAm ? 'ደካማ' : 'Weak', color: 'bg-red-500', text: 'text-red-500' };
    if (pass.length < 10) return { label: isAm ? 'መካከለኛ' : 'Medium', color: 'bg-amber-500', text: 'text-amber-500' };
    return { label: isAm ? 'ጠንካራ' : 'Strong', color: 'bg-green-500', text: 'text-green-500' };
  };

  const strength = getPasswordStrength(password);
  const confirmStrength = getPasswordStrength(confirmPassword);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const PasswordStrengthBar = ({ str }: { str: any }) => (
    <div className="space-y-1">
      <div className="mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all ${str.color}`} 
          style={{ width: str.label === (isAm ? 'ደካማ' : 'Weak') ? '33%' : str.label === (isAm ? 'መካከለኛ' : 'Medium') ? '66%' : str.label === '' ? '0%' : '100%' }} 
        />
      </div>
      <p className={`text-[10px] font-bold uppercase tracking-tight ${str.text}`}>{str.label}</p>
    </div>
  );

  const handleDelete = (id: number) => {
    if (window.confirm(isAm ? "እርግጠኛ ነዎት ይህን ተጠቃሚ መሰረዝ ይፈልጋሉ?" : "Are you sure you want to delete this user?")) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setOtpSent(false);
    setIsOtpVerified(true);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setOtpSent(false);
    setIsOtpVerified(false);
    setIsModalOpen(true);
  };

  const handleSendOtp = () => {
    setOtpSent(true);
    alert(isAm ? "OTP በተሳካ ሁኔታ ተልኳል" : "OTP sent successfully to your phone");
  };

  const handleVerifyOtp = () => {
    setIsOtpVerified(true);
    alert(isAm ? "OTP በትክክል ተረጋግጧል" : "OTP verified successfully");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOtpVerified) {
      alert(isAm ? "እባክዎን መጀመሪያ OTP ያረጋግጡ" : "Please verify OTP first");
      return;
    }
    if (password && password !== confirmPassword) {
      alert(isAm ? "የይለፍ ቃሎች አይዛመዱም" : "Passwords do not match");
      return;
    }
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const userData = {
      firstName: formData.get('firstName') as string,
      middleName: formData.get('middleName') as string,
      lastName: formData.get('lastName') as string,
      username: formData.get('username') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      role: "Admin",
      status: formData.get('status') as string,
      faydaId: formData.get('faydaId') as string,
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
              {users.map((user: any) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-primary font-bold">
                        {user.firstName?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-primary text-sm">{user.firstName} {user.middleName} {user.lastName}</p>
                        <p className="text-xs text-gray-400">@{user.username} • {user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600">{t.roles.admin}</span>
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
                <h3 className="text-xl font-bold text-primary">{editingUser ? t.editUser : t.addUser}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-8 space-y-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t.form.firstName}</label>
                    <input 
                      name="firstName"
                      defaultValue={editingUser?.firstName}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t.form.middleName}</label>
                    <input 
                      name="middleName"
                      defaultValue={editingUser?.middleName}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t.form.lastName}</label>
                    <input 
                      name="lastName"
                      defaultValue={editingUser?.lastName}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t.form.username}</label>
                    <input 
                      name="username"
                      defaultValue={editingUser?.username}
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t.form.password}</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required={!editingUser}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all pr-12" 
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-primary transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                      <PasswordStrengthBar str={strength} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t.form.confirmPassword}</label>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required={!editingUser}
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all pr-20 ${confirmPassword ? (passwordsMatch ? 'border-green-500' : 'border-red-500') : 'border-gray-100'}`}
                      />
                      <div className="absolute right-3 top-3 flex items-center space-x-2">
                        <button 
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="text-gray-400 hover:text-primary transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                        {confirmPassword && (
                          passwordsMatch ? <Check className="w-5 h-5 text-green-500" /> : <X className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <PasswordStrengthBar str={confirmStrength} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t.form.phone}</label>
                    <input 
                      name="phone"
                      defaultValue={editingUser?.phone}
                      required
                      placeholder="+251 ..."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all" 
                    />
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t.form.role}</label>
                    <input 
                      value={t.roles.admin}
                      disabled
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-100 rounded-xl outline-none text-gray-500 font-bold" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t.form.faydaId}</label>
                    <div className="flex space-x-2">
                      <input 
                        name="faydaId"
                        defaultValue={editingUser?.faydaId}
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
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-6 bg-blue-50 rounded-3xl space-y-4"
                  >
                    <label className="text-xs font-bold text-blue-600 uppercase tracking-widest">Verification Code</label>
                    <div className="flex space-x-2">
                      <input 
                        type="text"
                        placeholder="_ _ _ _ _ _"
                        className="flex-1 text-center font-bold tracking-[1em] px-4 py-3 bg-white border border-blue-200 rounded-xl outline-none" 
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

                <div className="flex space-x-4 pt-8 sticky bottom-0 bg-white">
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
