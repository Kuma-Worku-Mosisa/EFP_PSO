import { useState, useEffect } from "react";
import { useLanguage } from "../../../context/LanguageContext";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { apiRequest } from "../../../lib/api";

export const ResetPassword = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  // Password strength indicators
  const [strength, setStrength] = useState(0);
  const [passwordMatch, setPasswordMatch] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link");
      setTokenValid(false);
      return;
    }

    // Verify token
    apiRequest(`/users/reset-password/verify?token=${token}`)
      .then(() => {
        setTokenValid(true);
      })
      .catch(() => {
        setError("Invalid or expired reset link");
        setTokenValid(false);
      });
  }, [token]);

  useEffect(() => {
    // Calculate password strength
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    setStrength(Math.min(score, 4));

    // Check password match
    setPasswordMatch(password === confirmPassword && password.length > 0);
  }, [password, confirmPassword]);

  const getStrengthColor = (level: number) => {
    switch (level) {
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
    switch (level) {
      case 1:
        return language === "am" ? "ደካማ" : "Weak";
      case 2:
        return language === "am" ? "መካከለኛ" : "Fair";
      case 3:
        return language === "am" ? "ጥሩ" : "Good";
      case 4:
        return language === "am" ? "ኃይለኛ" : "Strong";
      default:
        return "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError(language === "am" ? "የይለፍ ቃል ቢያንስ 8 ፊደላት መሆን አለበት" : "Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError(language === "am" ? "የይለፍ ቃሎች አይደሉም" : "Passwords do not match");
      return;
    }

    if (!token) {
      setError(language === "am" ? "ልኩ ያልሆነ አገናኝ" : "Invalid reset link");
      return;
    }

    setLoading(true);

    try {
      await apiRequest("/users/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (tokenValid === null) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">
            {language === "am" ? "በመረጋገጥ ላይ..." : "Verifying..."}
          </p>
        </div>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 p-8 md:p-12 space-y-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-red-600">
                {language === "am" ? "ልኩ ያልሆነ አገናኝ" : "Invalid Link"}
              </h1>
              <p className="text-gray-500 mt-2">
                {error || (language === "am"
                  ? "የይለፍ ቃል ለመቀየር አገናኑ ልኩ ወይም ጊዜው አልፎበታል።"
                  : "The password reset link is invalid or has expired.")}
              </p>
            </div>
          </div>
          <Link
            to="/forgot-password"
            className="w-full bg-primary text-white font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 transition-all hover:shadow-lg active:scale-95"
          >
            <span>
              {language === "am"
                ? "አዲስ አገናኝ ይጠይቁ"
                : "Request New Link"}
            </span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 p-8 md:p-12 space-y-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-green-600">
                {language === "am" ? "የይለፍ ቃል ተቀይሯል" : "Password Reset Successful"}
              </h1>
              <p className="text-gray-500 mt-2">
                {language === "am"
                  ? "የይለፍ ቃሎን በአግባቡ ቀይረዋል። እባክዎ አዲስ የይለፍ ቃልዎን በመጠቀም ይግቡ።"
                  : "Your password has been successfully reset. Please log in with your new password."}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-primary text-white font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 transition-all hover:shadow-lg active:scale-95"
          >
            <span>{language === "am" ? "ወደ መግቢያ ተመለስ" : "Return to Login"}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 p-8 md:p-12 space-y-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary">
              {language === "am" ? "የይለፍ ቃል ለዳግም አደራደር" : "Reset Password"}
            </h1>
            <p className="text-gray-500 mt-2">
              {language === "am"
                ? "እባክዎ አዲስ ጠንካራ የይለፍ ቃል ያስገቡ"
                : "Please enter a new strong password"}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center space-x-3 text-red-600 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">
              {language === "am" ? "አዲስ የይለፍ ቃል" : "New Password"}
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-gray-50 border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all border-gray-200 focus:border-primary"
                placeholder={language === "am" ? "አዲስ የይለፍ ቃል ያስገቡ" : "Enter new password"}
                required
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

            {password && (
              <div className="space-y-1.5 px-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    {language === "am" ? "የደህንነት ጥቅም" : "Security Strength"}
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
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">
              {language === "am" ? "አዲስ የይለፍ ቃል ያረጋግጡ" : "Confirm New Password"}
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-gray-50 border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all border-gray-200 focus:border-primary"
                placeholder={language === "am" ? "አዲስ የይለፍ ቃል ያስገቡ" : "Confirm new password"}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {confirmPassword && (
              <div className="space-y-1.5 px-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    {language === "am" ? "የመሳሰሉት ነው" : "Match Accuracy"}
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest ${
                      passwordMatch
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {passwordMatch
                      ? language === "am"
                        ? "ይደማል"
                        : "MATCHED"
                      : language === "am"
                        ? "አይደማም"
                        : "MISMATCH"}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      passwordMatch
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: passwordMatch ? "100%" : "30%" }}
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || password.length < 8 || password !== confirmPassword}
            className={`w-full bg-primary text-white font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 transition-all ${
              loading || password.length < 8 || password !== confirmPassword
                ? "opacity-50 cursor-not-allowed"
                : "hover:shadow-lg active:scale-95"
            }`}
          >
            <span>
              {loading
                ? language === "am"
                  ? "በመቀየር ላይ..."
                  : "Resetting..."
                : language === "am"
                  ? "የይለፍ ቃል ያድርጉ"
                  : "Reset Password"}
            </span>
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm text-gray-500 hover:text-primary transition-colors"
            >
              {language === "am"
                ? "ወደ መግቢያ ተመለስ"
                : "Back to Login"}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
