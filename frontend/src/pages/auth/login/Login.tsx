import { useState } from "react";
import { useLanguage } from "../../../context/LanguageContext";
import { useAuth } from "../../../context/AuthContext";
import {
  Shield,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  Mail,
  MessageSquare,
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
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [otpMethod, setOtpMethod] = useState<"email" | "sms">("email");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const handleSendOtp = async () => {
    setOtpLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsOtpSent(true);
    setOtpLoading(false);
  };

  const onSubmit = async (data: LoginFormValues) => {
    setLoginError(null);
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

      // Dynamic Role-Based Navigation
      if (normalizedUser.roles?.includes("system_admin")) {
        // System admins go to the system admin dashboard
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
              Secure Access Portal
            </h2>
            <p className="text-gray-300 text-lg">{t.footer.desc}</p>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="p-8 md:p-16 space-y-8">
          <div className="flex flex-col items-center space-y-6">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/3/30/Federal_Police_Commission_of_Ethiopia_Coat_of_Arms_and_Logo.png"
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
                  Forgot Password?
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

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOtpMethod("email")}
                  className={`p-3 rounded-xl border flex items-center justify-center space-x-2 transition-all ${
                    otpMethod === "email"
                      ? "border-primary bg-primary/5 text-primary font-bold"
                      : "border-gray-200 text-gray-500"
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOtpMethod("sms")}
                  className={`p-3 rounded-xl border flex items-center justify-center space-x-2 transition-all ${
                    otpMethod === "sms"
                      ? "border-primary bg-primary/5 text-primary font-bold"
                      : "border-gray-200 text-gray-500"
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm">SMS</span>
                </button>
              </div>

              {!isOtpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="w-full py-3 bg-gray-100 text-primary font-bold rounded-xl hover:bg-gray-200"
                >
                  {otpLoading ? "Sending..." : t.auth.sendOtp}
                </button>
              ) : (
                <input
                  {...register("otpCode")}
                  placeholder="OTP Code"
                  className="w-full py-4 bg-primary/5 border border-primary/20 rounded-2xl text-center font-bold tracking-[0.5em]"
                />
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-primary text-white font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 transition-all ${
                isSubmitting
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:shadow-lg active:scale-95"
              }`}
            >
              <span>{isSubmitting ? "Logging in..." : t.auth.signIn}</span>
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
    </div>
  );
};
