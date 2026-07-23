//filepath: frontend/src/pages/auth/login/Login.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "../../../context/LanguageContext";
import { useAuth } from "../../../context/AuthContext";
import {
  Shield,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

import { apiRequest } from "../../../lib/api";
import { normalizeRoles } from "../../../lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const loginSchema = z.object({
  identifier: z.string().min(1, "Required field"),
  password: z.string().min(1, "Required field"),
  otpCode: z.string().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const normalizeStatusFromApi = (raw?: string) => {
  if (!raw) return "Inactive";
  const up = String(raw).toUpperCase();
  if (up === "ACTIVE") return "Active";
  if (up === "INACTIVE") return "Inactive";
  if (up === "SUSPENDED") return "Suspended";
  return up.charAt(0) + up.slice(1).toLowerCase();
};

export const Login = () => {
  const { t, language } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""));
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpExpiryTime, setOtpExpiryTime] = useState<number | null>(null);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpResendCountdown, setOtpResendCountdown] = useState(0);
  const [otpInvalidAttempts, setOtpInvalidAttempts] = useState(0);
  const [otpLocked, setOtpLocked] = useState(false);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState<string>("");

  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const otpStatusClasses = useMemo(() => {
    if (!isOtpSent) return "text-gray-500";
    if (otpCountdown <= 60) return "text-amber-600";
    return "text-emerald-600";
  }, [isOtpSent, otpCountdown]);

  useEffect(() => {
    if (!otpExpiryTime) return;

    const updateCountdown = () => {
      const remainingMs = otpExpiryTime - Date.now();
      const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));
      setOtpCountdown(remainingSec);

      if (remainingSec <= 0) {
        setOtpVerified(false);
        setOtpMessage(
          language === "am"
            ? "የማረጋገጫ ኮድ ጊዜው አልፎበታል። እባክዎ አዲስ ኮድ ይላኩ።"
            : "The verification code has expired. Please request a new one.",
        );
      }
    };

    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, [otpExpiryTime, language]);

  useEffect(() => {
    if (!isOtpSent || otpResendCountdown <= 0 || otpVerified || otpLocked)
      return;

    const timer = window.setInterval(() => {
      setOtpResendCountdown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isOtpSent, otpResendCountdown, otpVerified, otpLocked]);

  const handleOtpChange = (index: number, value: string) => {
    const cleanedValue = value.replace(/\D/g, "").slice(0, 1);
    const nextDigits = [...otpDigits];
    nextDigits[index] = cleanedValue;
    setOtpDigits(nextDigits);
    setValue("otpCode", nextDigits.join(""), { shouldValidate: true });

    if (cleanedValue && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && !otpDigits[index] && index > 0) {
      const nextDigits = [...otpDigits];
      nextDigits[index - 1] = "";
      setOtpDigits(nextDigits);
      setValue("otpCode", nextDigits.join(""), { shouldValidate: true });
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;

    event.preventDefault();
    const nextDigits = Array(6).fill("");
    pasted.split("").forEach((digit, index) => {
      nextDigits[index] = digit;
    });

    setOtpDigits(nextDigits);
    setValue("otpCode", nextDigits.join(""), { shouldValidate: true });
    const focusIndex = Math.min(pasted.length, 5);
    otpRefs.current[focusIndex]?.focus();
  };

  const handleSendOtp = async () => {
    setOtpLoading(true);
    setLoginError(null);
    setOtpMessage(null);
    setOtpLocked(false);
    setOtpInvalidAttempts(0);

    try {
      const identifier = watch("identifier")?.trim();
      const password = watch("password")?.trim();

      if (!identifier) {
        setOtpMessage(
          language === "am"
            ? "እባክዎ መጀመሪያ የተጠቃሚ ስም ያስገቡ"
            : "Please enter your username first",
        );
        setOtpLoading(false);
        return;
      }

      if (!password) {
        setOtpMessage(
          language === "am"
            ? "እባክዎ መጀመሪያ የይለፍ ቃል ያስገቡ"
            : "Please enter your password first",
        );
        setOtpLoading(false);
        return;
      }

      const res = await apiRequest("/users/login/otp/send", {
        method: "POST",
        body: JSON.stringify({
          identifier,
          password,
          method: "email",
        }),
      });

      const email = res?.data?.email || res?.email || "";
      setMaskedEmail(email ? maskEmail(email) : "");
      setIsOtpSent(true);
      setShowOtpModal(true);
      setOtpVerified(false);
      setOtpDigits(Array(6).fill(""));
      setValue("otpCode", "", { shouldValidate: true });
      setOtpExpiryTime(Date.now() + 5 * 60 * 1000);
      setOtpResendCountdown(60);
      setOtpMessage(null);
    } catch (err: any) {
      const errorMessage = err?.message || "Unable to send OTP";
      setOtpMessage(errorMessage);
      setLoginError(errorMessage);
    } finally {
      setOtpLoading(false);
    }
  };

  const maskEmail = (email: string) => {
    const trimmed = email.trim();
    if (!trimmed.includes("@")) return trimmed;

    const [localPart, domain] = trimmed.split("@", 2);
    if (!localPart || !domain) return trimmed;

    const visiblePrefix = localPart.slice(0, Math.min(2, localPart.length));
    const maskedLocal = `${visiblePrefix}${"*".repeat(Math.max(1, localPart.length - visiblePrefix.length))}`;

    return `${maskedLocal}@${domain}`;
  };

  const handleVerifyOtp = async () => {
    if (otpLocked) {
      setOtpMessage(
        language === "am"
          ? "ብዙ የማይሰራ ሙከራዎች ተከትለዋል። እባክዎ አዲስ ኮድ ይላኩ።"
          : "Too many invalid attempts. Please request a new code.",
      );
      return;
    }

    const identifier = watch("identifier")?.trim();
    const joinedOtp = otpDigits.join("");
    if (!identifier || joinedOtp.length !== 6) {
      setOtpMessage(
        language === "am"
          ? "እባክዎ ኮድ ያስገቡ"
          : "Please enter the verification code",
      );
      return;
    }

    try {
      await apiRequest("/users/login/otp/verify", {
        method: "POST",
        body: JSON.stringify({
          identifier,
          code: joinedOtp,
        }),
      });
      setOtpVerified(true);
      setOtpInvalidAttempts(0);
      setOtpMessage(
        language === "am"
          ? "ኮድ ተረጋግጧል። በራስ-ግባ በመሄድ ላይ..."
          : "Code verified successfully. Signing you in...",
      );

      const password = watch("password")?.trim();
      const loginData = {
        identifier,
        password,
        otpCode: joinedOtp,
      };

      await performLogin(loginData, true);
      setShowOtpModal(false);
    } catch (err: any) {
      const nextAttempts = otpInvalidAttempts + 1;
      setOtpInvalidAttempts(nextAttempts);

      if (nextAttempts >= 3) {
        setOtpLocked(true);
        setOtpMessage(
          language === "am"
            ? "በጣም ብዙ የማይሰራ ሙከራዎች ተከትለዋል። እባክዎ አዲስ ኮድ ይላኩ።"
            : "Too many invalid attempts. Please request a new code.",
        );
      } else {
        const remaining = 3 - nextAttempts;
        setOtpMessage(
          language === "am"
            ? `${remaining} ቀሪ ሙከራዎች አሉ።`
            : `${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
        );
      }
      setOtpVerified(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpResendCountdown > 0 || otpLocked || otpVerified) return;
    await handleSendOtp();
  };

  const performLogin = async (
    data: LoginFormValues,
    otpIsVerified = otpVerified,
  ) => {
    setLoginError(null);

    if (!otpIsVerified) {
      setLoginError(
        language === "am"
          ? "እባክዎ የማረጋገጫ ኮድ በመጀመሪያ ያረጋግጡ"
          : "Please verify the OTP before logging in",
      );
      return;
    }

    try {
      const res = await apiRequest("/users/login", {
        method: "POST",
        body: JSON.stringify({
          username: data.identifier,
          password: data.password,
        }),
      });

      const { user, token } = res.data;
      const normalizedStatus = normalizeStatusFromApi(user.status);

      if (normalizedStatus !== "Active") {
        setLoginError(
          normalizedStatus === "Suspended"
            ? "Your account has been suspended. Contact your administrator."
            : "Your account is inactive. Contact your administrator.",
        );
        return;
      }

      const normalizedUser = {
        ...user,
        status: normalizedStatus,
        roles: normalizeRoles(user.roles),
      };

      login(normalizedUser, token);

      if (normalizedUser.roles?.includes("system_admin")) {
        navigate("/system-admin/dashboard");
      } else if (normalizedUser.roles?.includes("super_admin")) {
        navigate("/super-admin/dashboard");
      } else if (normalizedUser.roles?.includes("licensing_authority")) {
        navigate("/licensing-authority");
      } else if (normalizedUser.roles?.includes("org_hr_manager")) {
        navigate("/org-hr-manager");
      } else if (normalizedUser.roles?.includes("admin")) {
        navigate("/admin");
      } else if (normalizedUser.roles?.includes("field_reviewer")) {
        navigate("/field-reviewer");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setLoginError(err.message || "Login failed");
    }
  };

  const onSubmit = async (data: LoginFormValues) => {
    if (!otpVerified) {
      await handleSendOtp();
      return;
    }

    await performLogin(data, otpVerified);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100">
        {/* Left Side Visual */}
        <div className="hidden lg:block relative">
          <img
            src="https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=1000"
            alt="Security"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm flex flex-col justify-center p-12 text-white space-y-8">
            <Shield className="w-16 h-16 text-secondary" />
            <h2 className="text-4xl font-bold leading-tight">
              {language === "am"
                ? "ደህንነት የተጠበቀ መግቢያ ፖርታል"
                : "Secure Access Portal"}
            </h2>
            <p className="text-gray-300 text-lg">{t.footer.desc}</p>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="p-8 md:p-16 space-y-8">
          <div className="flex flex-col items-center space-y-6">
            <img
              src="../../../../public/images/efp-logo.png"
              alt="Logo"
              className="w-20 h-20 object-contain"
            />
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-primary">
                {t.auth.userLogin}
              </h1>
              <p className="text-gray-500">{t.auth.signIn}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {loginError && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center space-x-3 text-red-600 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t.auth.username}
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...register("identifier")}
                  className={`w-full pl-12 pr-4 py-4 bg-gray-50 border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all ${
                    errors.identifier ? "border-red-500" : "border-gray-200"
                  }`}
                  placeholder={t.auth.username}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-bold text-gray-700">
                  {t.auth.password}
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[10px] text-accent hover:underline"
                >
                  {language === "am" ? "የይለፍ ቃል ረሳሁ?" : "Forgot Password?"}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  className={`w-full pl-12 pr-12 py-4 bg-gray-50 border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all ${
                    errors.password ? "border-red-500" : "border-gray-200"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || otpLoading}
              className={`w-full bg-primary text-white font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 transition-all ${
                isSubmitting || otpLoading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:shadow-lg active:scale-95"
              }`}
            >
              <span>
                {isSubmitting || otpLoading
                  ? language === "am"
                    ? "በመላክ ላይ..."
                    : "Sending OTP..."
                  : t.auth.signIn}
              </span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <p className="text-center text-sm text-gray-500">
            {t.auth.noAccount}{" "}
            <Link
              to="/register"
              className="text-accent font-bold hover:underline"
            >
              {t.auth.register}
            </Link>
          </p>
        </div>
      </div>

      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-primary">
                  {language === "am" ? "የማረጋገጫ ኮድ" : "Verification Code"}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {language === "am"
                    ? `ይህ ኮድ ወደ "${maskedEmail || "ኢሜልዎ"}" ተልኳል። በ5 ደቂቃ ውስጥ ያረጋግጡ።`
                    : `We sent a one-time code to "${maskedEmail || "your email"}". Please verify it within 5 minutes.`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="text-xl text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className={`font-medium ${otpStatusClasses}`}>
                  {otpCountdown > 0
                    ? `${language === "am" ? "የቀሪ ሰአት" : "Time remaining"}: ${Math.floor(otpCountdown / 60)}:${String(otpCountdown % 60).padStart(2, "0")}`
                    : language === "am"
                      ? "ኮድ ጊዜው አልፎበታል"
                      : "Code expired"}
                </span>
                <span className="text-gray-500">
                  {otpInvalidAttempts > 0
                    ? `${language === "am" ? "ሙከራ" : "Attempts"}: ${otpInvalidAttempts}/3`
                    : ""}
                </span>
              </div>

              <div className="rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 to-white p-4">
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(element) => {
                        otpRefs.current[index] = element;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(event) =>
                        handleOtpChange(index, event.target.value)
                      }
                      onKeyDown={(event) => handleOtpKeyDown(index, event)}
                      onPaste={handleOtpPaste}
                      className={`h-12 w-11 rounded-xl border text-center text-lg font-bold outline-none transition-all sm:h-14 sm:w-12 ${
                        otpVerified
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : otpCountdown <= 60
                            ? "border-amber-300 bg-amber-50 text-amber-700"
                            : "border-primary/20 bg-white text-primary shadow-sm focus:border-primary"
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-3 text-center text-xs text-gray-500">
                  {language === "am"
                    ? "በ6 አሃዝ ኮድ ያስገቡ"
                    : "Enter the 6-digit code"}
                </p>
              </div>

              {otpMessage && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-700">
                  {otpMessage}
                </div>
              )}

              <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50/70 px-3 py-3">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={otpResendCountdown > 0 || otpLocked || otpVerified}
                  className={`flex items-center gap-2 text-sm font-semibold ${
                    otpResendCountdown > 0 || otpLocked || otpVerified
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-accent hover:underline"
                  }`}
                >
                  <span className="text-xs  tracking-[0.1em] text-gray-400">
                    {language === "am" ? "ካላደረሱ" : "If you don't get OTP yet"}
                  </span>
                  <span>
                    {otpResendCountdown > 0
                      ? `${language === "am" ? "እንደገና ላክ" : "Resend"} (${otpResendCountdown}s)`
                      : language === "am"
                        ? "እንደገና ላክ"
                        : "Resend"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={otpDigits.join("").length !== 6 || otpLocked}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {language === "am" ? "አረጋግጥ" : "Verify"}
                </button>
              </div>

              {otpMessage && (
                <div
                  className={`rounded-2xl border px-3 py-3 text-sm ${
                    otpMessage.toLowerCase().includes("expired") ||
                    otpMessage.toLowerCase().includes("invalid") ||
                    otpMessage.toLowerCase().includes("attempt")
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : otpVerified
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 bg-gray-50 text-gray-600"
                  }`}
                >
                  {otpMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
