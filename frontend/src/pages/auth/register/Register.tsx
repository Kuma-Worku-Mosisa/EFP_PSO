//frontend/src/pages/auth/register/Register.tsx
import React from "react";
import { useLanguage } from "../../../context/LanguageContext";
import {
  Shield,
  User,
  Mail,
  Phone,
  Fingerprint,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  X,
  RefreshCw,
} from "lucide-react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiRequest } from "../../../lib/api";
import {
  AutoDismissToast,
  type ToastType,
} from "../../../components/AutoDismissToast";

const registerSchema = z
  .object({
    firstName: z.string().min(2, "First name is required"),
    middleName: z.string().min(2, "Middle name is required"),
    lastName: z.string().min(2, "Last name is required"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(13, "Enter a valid 9‑digit phone number"),
    faydaId: z.string().length(16, "Fayda ID must be exactly 16 digits"),
    otpCode: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const getSafeRegistrationErrorMessage = (error: unknown): string => {
  const statusCode =
    typeof error === "object" && error !== null && "statusCode" in error
      ? (error as { statusCode?: number | null }).statusCode
      : null;

  if (statusCode === 400) {
    return "Registration data is invalid. Please review your input and try again.";
  }

  if (statusCode === 409) {
    return "An account with these details already exists.";
  }

  if (statusCode === 429) {
    return "Too many requests. Please wait a moment and try again.";
  }

  if (typeof statusCode === "number" && statusCode >= 500) {
    return "Service Unavailable: Please try again later.";
  }

  return "Service Unavailable: Please check your connection and try again.";
};

export const Register = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [toast, setToast] = React.useState<{
    isOpen: boolean;
    type: ToastType;
    message: string;
  }>({
    isOpen: false,
    type: "success",
    message: "",
  });
  const [showOtpField, setShowOtpField] = React.useState(false);
  const [isOtpSent, setIsOtpSent] = React.useState(false);
  const [isOtpVerified, setIsOtpVerified] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [showEmailOtpModal, setShowEmailOtpModal] = React.useState(false);
  const [isEmailVerified, setIsEmailVerified] = React.useState(false);
  const [emailOtpCode, setEmailOtpCode] = React.useState("");
  const [emailOtpLoading, setEmailOtpLoading] = React.useState(false);
  const [usernameExists, setUsernameExists] = React.useState(false);
  const [faydaIdExists, setFaydaIdExists] = React.useState(false);
  const [emailExists, setEmailExists] = React.useState(false);
  const [otpAttempts, setOtpAttempts] = React.useState(0);
  const [maxOtpAttempts] = React.useState(3);

  const showToast = React.useCallback((type: ToastType, message: string) => {
    setToast({ isOpen: true, type, message });
  }, []);

  const closeToast = React.useCallback(() => {
    setToast((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const [phoneInput, setPhoneInput] = React.useState("+251");
  const [faydaIdInput, setFaydaIdInput] = React.useState("");

  const faydaIdValue = faydaIdInput;
  const otpCodeValue = watch("otpCode");
  const passwordValue = watch("password") || "";
  const confirmPasswordValue = watch("confirmPassword") || "";

  const getPasswordStrength = (password: string) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const strength = getPasswordStrength(passwordValue);

  const getStrengthColor = (level: number) => {
    switch (level) {
      case 0:
        return "bg-gray-200";
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-orange-500";
      case 3:
        return "bg-yellow-500";
      case 4:
        return "bg-green-500";
      default:
        return "bg-gray-200";
    }
  };
  const getStrengthText = (level: number) => {
    if (!passwordValue) return "";
    switch (level) {
      case 1:
        return "Very Weak";
      case 2:
        return "Weak";
      case 3:
        return "Medium";
      case 4:
        return "Strong";
      default:
        return "";
    }
  };

  const handleSendOtp = async () => {
    if (!faydaIdValue || faydaIdValue.length < 16) return;
    setIsOtpSent(true);
    setShowOtpField(true);
    showToast(
      "success",
      "Verification code sent to the phone number linked to your Fayda ID.",
    );
  };

  const handleVerifyOtp = async () => {
    if (!otpCodeValue || otpCodeValue.length !== 6) {
      showToast("error", "Please enter a valid 6-digit verification code.");
      return;
    }
    // Simulate verification
    setIsOtpVerified(true);
    showToast("success", "Fayda ID verified successfully.");
  };

  const handleSendEmailOtp = async () => {
    const email = watch("email");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast("error", "Please enter a valid email address.");
      return;
    }
    setEmailOtpLoading(true);
    try {
      await apiRequest("/users/register/email-otp/send", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setShowEmailOtpModal(true);
      setOtpAttempts(0); // Reset attempts when new OTP is sent
      setEmailOtpCode(""); // Clear previous code
      showToast("success", "Verification code sent to your email.");
    } catch (err: any) {
      showToast("error", err.message || "Failed to send verification code.");
    } finally {
      setEmailOtpLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    const email = watch("email");
    if (!emailOtpCode || emailOtpCode.length !== 6) {
      showToast("error", "Please enter a valid 6-digit verification code.");
      return;
    }

    if (otpAttempts >= maxOtpAttempts) {
      showToast("error", "Maximum attempts reached. Please request a new code.");
      return;
    }

    setEmailOtpLoading(true);
    try {
      await apiRequest("/users/register/email-otp/verify", {
        method: "POST",
        body: JSON.stringify({ email, code: emailOtpCode }),
      });
      setIsEmailVerified(true);
      setShowEmailOtpModal(false);
      setEmailOtpCode("");
      setOtpAttempts(0);
      showToast("success", "Email verified successfully.");
    } catch (err: any) {
      setOtpAttempts(prev => prev + 1);
      const remainingAttempts = maxOtpAttempts - (otpAttempts + 1);
      if (remainingAttempts > 0) {
        showToast("error", `Invalid verification code. ${remainingAttempts} attempts remaining.`);
      } else {
        showToast("error", "Maximum attempts reached. Please request a new code.");
      }
    } finally {
      setEmailOtpLoading(false);
    }
  };

  const handleClearOtp = () => {
    setEmailOtpCode("");
  };

  const handleCloseEmailOtpModal = () => {
    setShowEmailOtpModal(false);
    setEmailOtpCode("");
  };

  const checkFieldExists = async (field: string, value: string) => {
    if (!value || value.length < 3) return;

    try {
      const response = await apiRequest(`/users/validate?field=${field}&value=${encodeURIComponent(value)}`);
      if (response.exists) {
        if (field === "username") setUsernameExists(true);
        if (field === "faydaId") setFaydaIdExists(true);
        if (field === "email") setEmailExists(true);
      } else {
        if (field === "username") setUsernameExists(false);
        if (field === "faydaId") setFaydaIdExists(false);
        if (field === "email") setEmailExists(false);
      }
    } catch (error) {
      // If validation fails, we don't block the user
      console.error(`Field validation error for ${field}:`, error);
    }
  };

  const handleUsernameChange = (value: string) => {
    setValue("username", value);
    checkFieldExists("username", value);
  };

  const handleFaydaIdChange = (value: string) => {
    setFaydaIdInput(value);
    setValue("faydaId", value);
    if (value.length === 16) {
      checkFieldExists("faydaId", value);
    } else {
      setFaydaIdExists(false);
    }
  };

  const handleEmailChange = (value: string) => {
    setValue("email", value);
    // Only check if email format is valid
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      checkFieldExists("email", value);
    } else {
      setEmailExists(false);
    }
  };

  const onSubmit = async (data: RegisterFormValues) => {
    // Prevent submission if fields already exist
    if (usernameExists) {
      showToast("error", "Username already taken. Please choose a different username.");
      return;
    }
    if (emailExists) {
      showToast("error", "Email already registered. Please use a different email address.");
      return;
    }
    if (faydaIdExists) {
      showToast("error", "Fayda ID already registered. Please use a different Fayda ID.");
      return;
    }

    // if (!isOtpVerified) {
    //   alert("Please verify your Fayda ID via SMS first.");
    //   return;
    // }
    // // Map frontend fields to backend fields
    const payload = {
      username: data.username,
      fullName: `${data.firstName} ${data.middleName} ${data.lastName}`.trim(),
      email: data.email,
      phone: data.phone,
      faydaId: data.faydaId,
      password: data.password,
      // addressId: ... // Add if you have address selection in the form
    };
    try {
      await apiRequest("/users/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setIsSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: unknown) {
      showToast("error", getSafeRegistrationErrorMessage(err));
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white p-12 rounded-[40px] shadow-2xl text-center space-y-6 border border-gray-100"
        >
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-primary">
            {t.register.success}
          </h2>
          <p className="text-gray-500">{t.register.successSub}</p>
          <div className="pt-4">
            <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 3 }}
                className="h-full bg-green-500"
              />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <AutoDismissToast
        isOpen={toast.isOpen}
        type={toast.type}
        message={toast.message}
        onClose={closeToast}
        durationMs={5000}
      />
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-5 bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100">
        {/* Left Side - Info */}
        <div className="lg:col-span-2 bg-primary p-12 text-white space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <Shield className="w-16 h-16 text-secondary" />
          <h2 className="text-4xl font-bold leading-tight">
            {t.register.joinNetwork}
          </h2>
          <p className="text-blue-100 text-lg">{t.register.joinNetworkSub}</p>

          <div className="space-y-6 pt-8">
            {t.register.features.map((item: any, i: number) => (
              <div key={i} className="flex space-x-4">
                <div className="w-6 h-6 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 bg-secondary rounded-full" />
                </div>
                <div>
                  <h4 className="font-bold text-white">{item.title}</h4>
                  <p className="text-sm text-blue-200">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="lg:col-span-3 p-8 md:p-16 space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-primary">
                {t.register.title}
              </h1>
              <p className="text-gray-500">{t.register.subtitle}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">
                  {t.register.firstName}
                </label>
                <input
                  {...register("firstName")}
                  placeholder={t.register.firstNamePlaceholder}
                  onKeyDown={(e) => {
                    const key = e.key;
                    if (
                      key === "Backspace" ||
                      key === "Delete" ||
                      key === "Tab" ||
                      key === "Enter" ||
                      key === "ArrowLeft" ||
                      key === "ArrowRight" ||
                      key === "Home" ||
                      key === "End"
                    )
                      return;
                    if (!/^[a-zA-Z\u1200-\u137F]$/.test(key))
                      e.preventDefault();
                  }}
                  className={`w-full px-4 py-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all ${
                    errors.firstName ? "border-red-500" : "border-gray-200"
                  }`}
                />
                {errors.firstName && (
                  <p className="text-xs text-red-500 ml-1">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">
                  {t.register.middleName}
                </label>
                <input
                  {...register("middleName")}
                  placeholder={t.register.middleNamePlaceholder}
                  onKeyDown={(e) => {
                    const key = e.key;
                    if (
                      key === "Backspace" ||
                      key === "Delete" ||
                      key === "Tab" ||
                      key === "Enter" ||
                      key === "ArrowLeft" ||
                      key === "ArrowRight" ||
                      key === "Home" ||
                      key === "End"
                    )
                      return;
                    if (!/^[a-zA-Z\u1200-\u137F]$/.test(key))
                      e.preventDefault();
                  }}
                  className={`w-full px-4 py-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all ${
                    errors.middleName ? "border-red-500" : "border-gray-200"
                  }`}
                />
                {errors.middleName && (
                  <p className="text-xs text-red-500 ml-1">
                    {errors.middleName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">
                  {t.register.lastName}
                </label>
                <input
                  {...register("lastName")}
                  placeholder={t.register.lastNamePlaceholder}
                  onKeyDown={(e) => {
                    const key = e.key;
                    if (
                      key === "Backspace" ||
                      key === "Delete" ||
                      key === "Tab" ||
                      key === "Enter" ||
                      key === "ArrowLeft" ||
                      key === "ArrowRight" ||
                      key === "Home" ||
                      key === "End"
                    )
                      return;
                    if (!/^[a-zA-Z\u1200-\u137F]$/.test(key))
                      e.preventDefault();
                  }}
                  className={`w-full px-4 py-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all ${
                    errors.lastName ? "border-red-500" : "border-gray-200"
                  }`}
                />
                {errors.lastName && (
                  <p className="text-xs text-red-500 ml-1">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t.register.phone}
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (!raw.startsWith("+251")) {
                      setPhoneInput("+251");
                      return;
                    }
                    const suffix = raw.slice(4).replace(/\D/g, "").slice(0, 9);
                    const newVal = "+251" + suffix;
                    setPhoneInput(newVal);
                    setValue("phone", newVal);
                  }}
                  placeholder={t.register.phonePlaceholder}
                  className={`w-full pl-12 pr-4 py-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all ${
                    errors.phone ? "border-red-500" : "border-gray-200"
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-red-500 ml-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-4 p-6 bg-gray-50 rounded-3xl border border-gray-100">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">
                  {t.register.faydaId}
                </label>
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={faydaIdInput}
                      onChange={(e) => {
                        const digits = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 16);
                        handleFaydaIdChange(digits);
                      }}
                      disabled={isOtpVerified}
                      placeholder={t.register.faydaPlaceholder}
                      className={`w-full pl-12 pr-4 py-4 bg-white border rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all ${
                        errors.faydaId ? "border-red-500" : faydaIdExists ? "border-orange-500" : "border-gray-200"
                      } ${isOtpVerified ? "bg-green-50" : ""}`}
                    />
                  </div>
                  {!isOtpVerified && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={!faydaIdValue || isOtpSent}
                      className="px-6 py-4 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl disabled:opacity-50 transition-all"
                    >
                      {isOtpSent ? "Sent" : t.register.sendOtp}
                    </button>
                  )}
                  {isOtpVerified && (
                    <div className="flex items-center space-x-2 text-green-600 font-bold px-4">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Verified</span>
                    </div>
                  )}
                </div>
                {errors.faydaId && (
                  <p className="text-xs text-red-500 ml-1">
                    {errors.faydaId.message}
                  </p>
                )}
                {faydaIdExists && !errors.faydaId && (
                  <p className="text-xs text-orange-500 ml-1">
                    Fayda ID already registered
                  </p>
                )}
              </div>

              {showOtpField && !isOtpVerified && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-3 pt-2"
                >
                  <label className="text-xs font-bold text-gray-500 ml-1">
                    {t.register.otpPlaceholder}
                  </label>
                  <div className="flex gap-3">
                    <input
                      {...register("otpCode")}
                      maxLength={6}
                      className="flex-1 p-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary text-center tracking-[1em] font-bold"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      className="px-6 py-4 bg-secondary text-primary rounded-2xl font-bold text-sm shadow-md"
                    >
                      Verify
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">
                  {t.register.email}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...register("email")}
                    type="email"
                    placeholder={t.register.emailPlaceholder}
                    disabled={isEmailVerified}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className={`w-full pl-12 pr-24 py-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all ${
                      errors.email ? "border-red-500" : emailExists ? "border-orange-500" : "border-gray-200"
                    } ${isEmailVerified ? "bg-green-50" : ""}`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {isEmailVerified ? (
                      <div className="flex items-center space-x-1 text-green-600 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verified</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendEmailOtp}
                        disabled={emailOtpLoading || emailExists}
                        className="text-xs font-bold text-primary hover:text-secondary transition-colors disabled:opacity-50"
                      >
                        {emailOtpLoading ? "Sending..." : "Verify Email"}
                      </button>
                    )}
                  </div>
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 ml-1">
                    {errors.email.message}
                  </p>
                )}
                {emailExists && !errors.email && (
                  <p className="text-xs text-orange-500 ml-1">
                    Email already registered
                  </p>
                )}
              </div>

              {isEmailVerified && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    {t.register.username}
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...register("username")}
                      placeholder={t.register.usernamePlaceholder}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      className={`w-full pl-12 pr-4 py-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all ${
                        errors.username ? "border-red-500" : usernameExists ? "border-orange-500" : "border-gray-200"
                      }`}
                    />
                  </div>
                  {errors.username && (
                    <p className="text-xs text-red-500 ml-1">
                      {errors.username.message}
                    </p>
                  )}
                  {usernameExists && !errors.username && (
                    <p className="text-xs text-orange-500 ml-1">
                      Username already taken
                    </p>
                  )}
                </div>
              )}
            </div>

            {isEmailVerified && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    {t.register.password}
                  </label>
                  <div className="relative">
                    <input
                      {...register("password")}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={`w-full px-6 py-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all pr-12 ${
                        errors.password ? "border-red-500" : "border-gray-200"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-primary transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {passwordValue && (
                    <div className="space-y-1.5 px-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          Security Strength
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase tracking-widest ${
                            strength === 1
                              ? "text-red-500"
                              : strength === 2
                                ? "text-orange-500"
                                : strength === 3
                                  ? "text-yellow-600"
                                  : "text-green-600"
                          }`}
                        >
                          {getStrengthText(strength)}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden flex gap-0.5">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`h-full flex-1 transition-all duration-500 ${
                              strength >= step
                                ? getStrengthColor(strength)
                                : "bg-gray-100"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {errors.password && (
                    <p className="text-xs text-red-500 ml-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    {t.register.confirmPassword}
                  </label>
                  <div className="relative">
                    <input
                      {...register("confirmPassword")}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={`w-full px-6 py-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all pr-12 ${
                        errors.confirmPassword
                          ? "border-red-500"
                          : "border-gray-200"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-primary transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {confirmPasswordValue && (
                    <div className="space-y-1.5 px-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          Match Accuracy
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase tracking-widest ${
                            confirmPasswordValue === passwordValue
                              ? "text-green-600"
                              : "text-red-500"
                          }`}
                        >
                          {confirmPasswordValue === passwordValue
                            ? "MATCHED"
                            : "MISMATCH"}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={false}
                          animate={{
                            width:
                              confirmPasswordValue === passwordValue
                                ? "100%"
                                : "30%",
                            backgroundColor:
                              confirmPasswordValue === passwordValue
                                ? "#10b981"
                                : "#ef4444",
                          }}
                          className="h-full rounded-full"
                        />
                      </div>
                    </div>
                  )}

                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500 ml-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {isEmailVerified && (
              <div className="md:col-span-2 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full blue-gradient text-white font-bold py-5 rounded-2xl hover:shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center space-x-2 ${
                    isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  <span>
                    {isSubmitting ? t.register.submitting : t.register.submit}
                  </span>
                  {!isSubmitting && <ArrowRight className="w-5 h-5" />}
                </button>
              </div>
            )}
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              {t.register.alreadyAccount}{" "}
              <Link
                to="/login"
                className="text-accent font-bold hover:underline"
              >
                {t.auth.signIn}
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Email OTP Modal */}
      {showEmailOtpModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
          >
            <button
              onClick={handleCloseEmailOtpModal}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-primary" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-900">
                  Verify Your Email
                </h3>
                <p className="text-gray-500 text-sm">
                  Enter the 6-digit code sent to{" "}
                  <span className="font-semibold text-gray-700">
                    {watch("email")}
                  </span>
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2 justify-center">
                  {Array(6)
                    .fill(0)
                    .map((_, i) => (
                      <input
                        key={i}
                        type="text"
                        maxLength={1}
                        value={emailOtpCode[i] || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (!/\d/.test(value)) return;
                          const newCode =
                            emailOtpCode.slice(0, i) + value + emailOtpCode.slice(i + 1);
                          setEmailOtpCode(newCode);
                          if (value && i < 5) {
                            (e.target.nextElementSibling as HTMLInputElement)?.focus();
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace" && !emailOtpCode[i] && i > 0) {
                            const target = e.target as HTMLInputElement;
                            const prev = target.previousElementSibling as HTMLInputElement;
                            if (prev) prev.focus();
                          }
                        }}
                        className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    ))}
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleClearOtp}
                    disabled={!emailOtpCode}
                    className="text-sm text-gray-500 hover:text-primary transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Clear
                  </button>
                  <span className="text-xs text-gray-400">
                    {maxOtpAttempts - otpAttempts} attempts remaining
                  </span>
                </div>

                <button
                  onClick={handleVerifyEmailOtp}
                  disabled={emailOtpLoading || emailOtpCode.length !== 6 || otpAttempts >= maxOtpAttempts}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {emailOtpLoading ? "Verifying..." : "Verify Email"}
                </button>

                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Didn't receive the code?{" "}
                    <button
                      type="button"
                      onClick={handleSendEmailOtp}
                      disabled={emailOtpLoading}
                      className="text-primary font-bold hover:underline disabled:opacity-50"
                    >
                      Resend
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
