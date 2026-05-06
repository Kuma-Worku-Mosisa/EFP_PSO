import React, { useState } from "react";
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
  Smartphone,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

import { apiRequest } from "../../../lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const loginSchema = z.object({
  identifier: z.string().min(1, "Required field"),
  password: z.string().min(1, "Required field"),
  otpCode: z.string().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

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
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const otpCodeValue = watch("otpCode");

  const handleSendOtp = async () => {
    setOtpLoading(true);
    // Simulate sending OTP
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

      // Save token and user info as needed
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("fp_user", JSON.stringify(res.data.user));

      // Optionally update AuthContext here if needed
      // login(res.data.user.role); // If your AuthContext supports this

      // Redirect to dashboard or appropriate page
      navigate("/dashboard");
    } catch (err: any) {
      setLoginError(err.message || "Login failed");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100">
        {/* Left Side - Visual */}
        <div className="hidden lg:block relative">
          <img
            src="https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=1000"
            alt="Police"
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm flex flex-col justify-center p-12 text-white space-y-8">
            <Shield className="w-16 h-16 text-secondary" />
            <h2 className="text-4xl font-bold leading-tight">
              Secure Access Portal
            </h2>
            <p className="text-gray-300 text-lg">{t.footer.desc}</p>
            <div className="space-y-4">
              {t.fayda.features.slice(0, 3).map((item: string, i: number) => (
                <div key={i} className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-secondary rounded-full" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="p-8 md:p-16 space-y-8">
          <div className="flex flex-col items-center space-y-6">
            <div className="w-20 h-20 flex items-center justify-center overflow-hidden">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/3/30/Federal_Police_Commission_of_Ethiopia_Coat_of_Arms_and_Logo.png"
                alt="Ethiopian Federal Police Logo"
                className="w-20 h-20 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
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
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="text-gray-400 w-5 h-5" />
                </div>
                <input
                  {...register("identifier")}
                  type="text"
                  placeholder={t.auth.username}
                  className={`w-full pl-12 pr-4 py-4 bg-gray-50 border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
                    errors.identifier ? "border-red-500" : "border-gray-200"
                  }`}
                />
              </div>
              {errors.identifier && (
                <p className="text-xs text-red-500 flex items-center mt-1 ml-1">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.identifier.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-bold text-gray-700">
                  {t.auth.password}
                </label>
                <a href="#" className="text-xs text-accent hover:underline">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="text-gray-400 w-5 h-5" />
                </div>
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-12 py-4 bg-gray-50 border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
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

              {watch("password") && (
                <div className="space-y-1.5 px-1">
                  <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden flex gap-0.5">
                    {[1, 2, 3, 4].map((step) => {
                      const password = watch("password") || "";
                      let strength = 0;
                      if (password.length >= 8) strength += 1;
                      if (/[A-Z]/.test(password)) strength += 1;
                      if (/[0-9]/.test(password)) strength += 1;
                      if (/[^A-Za-z0-9]/.test(password)) strength += 1;

                      const colors = [
                        "bg-gray-200",
                        "bg-red-500",
                        "bg-orange-500",
                        "bg-yellow-500",
                        "bg-green-500",
                      ];
                      return (
                        <div
                          key={step}
                          className={`h-full flex-1 transition-all duration-500 ${
                            strength >= step ? colors[strength] : "bg-gray-100"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {errors.password && (
                <p className="text-xs text-red-500 flex items-center mt-1 ml-1">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex flex-col space-y-3">
                <label className="text-sm font-bold text-gray-700 ml-1">
                  {t.auth.otpOption}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setOtpMethod("email")}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-xl border transition-all ${
                      otpMethod === "email"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    <span className="text-sm font-semibold">
                      {t.auth.otpMethodEmail}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOtpMethod("sms")}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-xl border transition-all ${
                      otpMethod === "sms"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm font-semibold">
                      {t.auth.otpMethodSms}
                    </span>
                  </button>
                </div>
              </div>

              {!isOtpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={otpLoading}
                  className="w-full py-3 bg-gray-100 text-primary font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center space-x-2 outline-none"
                >
                  {otpLoading ? (
                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  ) : (
                    <>
                      <Smartphone className="w-4 h-4" />
                      <span>{t.auth.sendOtp}</span>
                    </>
                  )}
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="text-primary w-5 h-5" />
                    </div>
                    <input
                      {...register("otpCode")}
                      type="text"
                      maxLength={6}
                      placeholder={t.auth.otpPlaceholder}
                      className="w-full pl-12 pr-4 py-4 bg-primary/5 border border-primary/20 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-mono tracking-[0.5em] text-center text-lg font-bold"
                    />
                  </div>
                  <p className="text-[10px] text-primary/60 text-center uppercase tracking-wider font-bold">
                    Code sent via {otpMethod.toUpperCase()} (Simulated: 123456)
                  </p>
                </motion.div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full blue-gradient text-white font-bold py-4 rounded-2xl hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center space-x-2 ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              <span>{isSubmitting ? t.common.loading : t.auth.signIn}</span>
              {!isSubmitting && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <div className="text-center space-y-4">
            <p className="text-sm text-gray-500">
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
    </div>
  );
};
