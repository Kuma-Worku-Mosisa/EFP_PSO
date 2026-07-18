import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { Shield, Globe, Menu, X } from "lucide-react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

export const Navbar = () => {
  const { t, language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();

  const navLinks = [
    { name: t.nav.home, path: "/" },
    { name: t.nav.services, path: "/services" },
    { name: t.nav.requirements, path: "/requirements" },
    { name: t.nav.faq, path: "/faq" },
    { name: t.nav.contact, path: "/contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 glass shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-14 h-14 flex items-center justify-center overflow-hidden">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/3/30/Federal_Police_Commission_of_Ethiopia_Coat_of_Arms_and_Logo.png"
                  alt="Federal Police Logo"
                  className="w-14 h-14 object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="hidden md:block">
                <span className="text-primary font-bold text-lg leading-tight block">
                  ETHIOPIAN FEDERAL POLICE
                </span>
                <span className="text-accent font-bold text-[10px] tracking-wider uppercase block leading-tight">
                  {t.hero.titleLine2}
                </span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-accent",
                  location.pathname === link.path
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-600",
                )}
              >
                {link.name}
              </Link>
            ))}

            <div className="flex items-center space-x-1 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setLanguage("am")}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-black transition-all flex items-center space-x-1.5",
                  language === "am"
                    ? "bg-primary text-white shadow-lg scale-105"
                    : "text-gray-500 hover:text-primary",
                )}
              >
                <Globe className="w-3 h-3" />
                <span>አማርኛ</span>
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-black transition-all flex items-center space-x-1.5",
                  language === "en"
                    ? "bg-primary text-white shadow-lg scale-105"
                    : "text-gray-500 hover:text-primary",
                )}
              >
                <Globe className="w-3 h-3" />
                <span>ENGLISH</span>
              </button>
            </div>

            <Link
              to="/login"
              className="text-primary font-bold hover:text-accent transition-colors"
            >
              {t.nav.login}
            </Link>

            <Link
              to="/register"
              className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
            >
              {t.nav.signUp}
            </Link>
          </div>

          <div className="md:hidden flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setLanguage("am")}
                className={cn(
                  "px-2 py-1 rounded-md text-[10px] font-black transition-all",
                  language === "am"
                    ? "bg-primary text-white shadow-sm"
                    : "text-gray-500",
                )}
              >
                አማ
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={cn(
                  "px-2 py-1 rounded-md text-[10px] font-black transition-all",
                  language === "en"
                    ? "bg-primary text-white shadow-sm"
                    : "text-gray-500",
                )}
              >
                EN
              </button>
            </div>
            <Link
              to="/login"
              className="text-primary font-bold text-xs hover:text-accent transition-colors"
            >
              {t.nav.login}
            </Link>
            <Link
              to="/register"
              className="bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-primary/90 transition-all shadow-md"
            >
              {t.nav.signUp}
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-primary ml-1"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
