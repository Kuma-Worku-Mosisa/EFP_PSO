import { useState } from "react";
import { useLanguage } from "../../../context/LanguageContext";
import { Mail, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../../../lib/api";

export const ForgotPassword = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await apiRequest("/users/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 p-8 md:p-12 space-y-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary">
              {language === "am" ? "የይለፍ ቃል ረሳሁ" : "Forgot Password"}
            </h1>
            <p className="text-gray-500 mt-2">
              {language === "am"
                ? "የመገለጫ ኢሜልዎን ያስገቡ እና እንደገና የይለፍ ቃል ለመቀየር አገናኝ እንልክልዎ።"
                : "Enter your email address and we'll send you a link to reset your password."}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center space-x-3 text-red-600 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-6">
            <div className="p-4 bg-green-50 border border-green-100 rounded-xl flex items-center space-x-3 text-green-600 text-sm">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>
                {language === "am"
                  ? "ኢሜልዎ ተቀብሎአል። የይለፍ ቃል ለመቀየር አገናኝ ወደ ኢሜልዎ ተልኳል።"
                  : "A reset link has been sent to your email."}
              </span>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-primary text-white font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 transition-all hover:shadow-lg active:scale-95"
            >
              <span>{language === "am" ? "ወደ መግቢያ ተመለስ" : "Return to Login"}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                {language === "am" ? "ኢሜይል" : "Email Address"}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all border-gray-200 focus:border-primary"
                  placeholder={language === "am" ? "ኢሜይል ያስገቡ" : "Enter your email"}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-primary text-white font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 transition-all ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg active:scale-95"
              }`}
            >
              <span>
                {loading
                  ? language === "am"
                    ? "በመላክ ላይ..."
                    : "Sending..."
                  : language === "am"
                    ? "የይለፍ ቃል ለዳግም ማሰናድ አገናኝ ላክ"
                    : "Send Reset Link"}
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
        )}
      </div>
    </div>
  );
};
