import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export const NotFound = () => {
  const { language } = useLanguage();
  const title = language === "am" ? "ገጽ አልተገኘም" : "Page not found";
  const message =
    language === "am"
      ? "ይቅርታ፣ ይህ ገጽ አልተገኘም። እባክዎ ወደ መነሻ ገጹ ይመለሱ።"
      : "Sorry, that page was not found. Please return to the home page or sign in.";

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-3xl bg-white border border-gray-200 rounded-3xl shadow-sm p-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-secondary/80 mb-3">
          404
        </p>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-gray-600 mb-8">{message}</p>
        <div className="inline-flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            {language === "am" ? "ወደ መነሻ ገጽ ተመለስ" : "Go home"}
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-2xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            {language === "am" ? "እንደገና ይግቡ" : "Sign in"}
          </Link>
        </div>
      </div>
    </div>
  );
};
