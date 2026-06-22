//file: src/pages/Contact.tsx
import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { apiRequest } from "../lib/api";

export const Contact = () => {
  const { t, language } = useLanguage();
  const isAm = language === "am";
  const [showMap, setShowMap] = React.useState(false);
  const [departmentRole, setDepartmentRole] = React.useState<
    "admin" | "system_admin"
  >("admin");
  const [formValues, setFormValues] = React.useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [formStatus, setFormStatus] = React.useState<{
    type: "idle" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [roleContact, setRoleContact] = React.useState<{
    email?: string | null;
    phone?: string | null;
    fullName?: string | null;
  }>({});

  const handleFormChange =
    (field: "name" | "email" | "subject" | "message") =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormStatus({ type: "idle", message: "" });

    if (
      !formValues.name.trim() ||
      !formValues.email.trim() ||
      !formValues.subject.trim() ||
      !formValues.message.trim()
    ) {
      setFormStatus({
        type: "error",
        message: t.contact.form.validation || "Please fill out all fields.",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      await apiRequest("/contact/submit", {
        method: "POST",
        body: JSON.stringify({
          senderName: formValues.name.trim(),
          senderEmail: formValues.email.trim(),
          subject: formValues.subject.trim(),
          message: formValues.message.trim(),
          department:
            departmentRole === "admin"
              ? t.contact.tabs.admin
              : t.contact.tabs.systemAdmin,
          departmentHeadRole: departmentRole,
        }),
      });

      setFormStatus({
        type: "success",
        message:
          t.contact.form.success || "Your message was sent successfully.",
      });

      setFormValues({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error: any) {
      setFormStatus({
        type: "error",
        message:
          error?.message ||
          t.contact.form.error ||
          "Unable to send your message. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Normalize Ethiopian phone numbers into a display-friendly form
  const normalizePhone = (raw?: string | null) => {
    if (!raw) return "";
    const s = String(raw).trim();
    if (s.startsWith("+")) return s;
    if (s.startsWith("0") && s.length >= 9) return `+251${s.slice(1)}`;
    if (s.startsWith("251") && s.length >= 11) return `+${s}`;
    return s;
  };

  React.useEffect(() => {
    let cancelled = false;
    const fetchRoleContact = async () => {
      try {
        const q = `?role=${encodeURIComponent(departmentRole)}`;
        const data: any = await apiRequest(`/contact/role-info${q}`);
        if (cancelled) return;
        setRoleContact({
          email: data?.data?.email || null,
          phone: data?.data?.phone || null,
          fullName: data?.data?.fullName || null,
        });
      } catch (err) {
        // silently ignore - keep defaults
        setRoleContact({});
      }
    };

    fetchRoleContact();
    return () => {
      cancelled = true;
    };
  }, [departmentRole]);

  // Only show role-specific contact data from the backend.
  // Do not fall back to translation mock values on the contact page.
  const displayedPhone = roleContact.phone
    ? normalizePhone(roleContact.phone)
    : "";
  const displayedEmail = roleContact.email || "";

  return (
    <div className="py-24 space-y-24">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-accent font-bold tracking-widest uppercase text-sm">
            {t.contact.badge}
          </h2>
          <h3 className="text-4xl font-bold text-primary">{t.contact.title}</h3>
          <div className="w-24 h-1 bg-secondary mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="space-y-4">
            {[
              {
                icon: <Phone className="w-6 h-6 md:w-7 md:h-7" />,
                title: t.contact.info.phone.title,
                detail: displayedPhone,
                sub: t.contact.info.phone.sub,
              },
              {
                icon: <Mail className="w-6 h-6 md:w-7 md:h-7" />,
                title: t.contact.info.email.title,
                detail: displayedEmail,
                sub: t.contact.info.email.sub,
              },
              {
                icon: <MapPin className="w-6 h-6 md:w-7 md:h-7" />,
                title: t.contact.info.visit.title,
                detail: t.contact.info.visit.detail,
                sub: t.contact.info.visit.sub,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                viewport={{ once: true }}
                className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 flex items-start space-x-4 sm:space-x-6"
              >
                <div className="p-3 sm:p-4 bg-gray-50 rounded-2xl text-primary flex items-center justify-center">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">
                    {item.title}
                  </h4>
                  <p className="text-lg sm:text-xl font-bold text-primary mb-1 break-words">
                    {item.detail}
                  </p>
                  <p className="text-xs text-gray-500">{item.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 md:p-12 rounded-[28px] shadow-xl border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="rounded-[32px] bg-gray-50 p-2 grid grid-cols-2 gap-2">
                {[
                  { role: "admin", label: t.contact.tabs.admin },
                  { role: "system_admin", label: t.contact.tabs.systemAdmin },
                ].map((tab) => (
                  <button
                    key={tab.role}
                    type="button"
                    onClick={() =>
                      setDepartmentRole(tab.role as "admin" | "system_admin")
                    }
                    className={`rounded-[28px] py-3 text-sm sm:text-sm font-semibold transition-all w-full ${
                      departmentRole === tab.role
                        ? "bg-primary text-white shadow-lg"
                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    {t.contact.form.name}
                  </label>
                  <input
                    type="text"
                    value={formValues.name}
                    onChange={handleFormChange("name")}
                    placeholder={t.contact.form.placeholder.name}
                    className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all"
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    {t.contact.form.email}
                  </label>
                  <input
                    type="email"
                    value={formValues.email}
                    onChange={handleFormChange("email")}
                    placeholder={t.contact.form.placeholder.email}
                    className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all"
                    autoComplete="email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">
                  {t.contact.form.subject}
                </label>
                <input
                  type="text"
                  value={formValues.subject}
                  onChange={handleFormChange("subject")}
                  placeholder={t.contact.form.placeholder.subject}
                  className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">
                  {t.contact.form.message}
                </label>
                <textarea
                  rows={6}
                  value={formValues.message}
                  onChange={handleFormChange("message")}
                  placeholder={t.contact.form.placeholder.message}
                  className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                />
              </div>
              {formStatus.type !== "idle" && (
                <div
                  className={`rounded-2xl p-4 text-sm font-medium ${
                    formStatus.type === "success"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      : "bg-rose-50 text-rose-700 border border-rose-100"
                  }`}
                  role="status"
                  aria-live="polite"
                >
                  {formStatus.message}
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full blue-gradient text-white font-bold py-4 sm:py-5 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-[1.01] transition-all flex items-center justify-center space-x-3 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span>{t.contact.form.submit}</span>
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-64 sm:h-96 lg:h-[500px] bg-gray-100 rounded-[30px] relative overflow-hidden shadow-2xl border border-gray-100">
          <AnimatePresence mode="wait">
            {!showMap ? (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="absolute inset-0 opacity-20">
                  <img
                    src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=2000"
                    alt="Map Background"
                    className="w-full h-full object-cover grayscale"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="relative z-10 bg-white/80 backdrop-blur-xl p-10 rounded-[40px] shadow-2xl border border-white/50 flex flex-col items-center text-center space-y-6 max-w-sm">
                  <div className="w-20 h-20 bg-red-50 rounded-[28px] flex items-center justify-center text-red-600 shadow-2xl animate-bounce border border-red-100">
                    <MapPin className="w-10 h-10 fill-red-600/10" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-2xl font-black text-primary uppercase tracking-tighter">
                      {t.contact.map.title}
                    </h4>
                    <p className="text-gray-500 text-sm font-medium">
                      {t.contact.map.desc}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowMap(true)}
                    className="gold-gradient text-primary font-black px-10 py-4 rounded-2xl shadow-xl hover:scale-105 transition-all text-sm uppercase tracking-widest"
                  >
                    {t.contact.map.btn}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="map"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="w-full h-full relative"
              >
                <iframe
                  src="https://maps.google.com/maps?q=9.01127,38.74087+(Ethiopian+Federal+Police+Commission+HQ)&hl=en&z=18&t=m&output=embed"
                  className="w-full h-full border-0"
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ethiopian Federal Police HQ Map"
                ></iframe>
                <button
                  onClick={() => setShowMap(false)}
                  className="absolute bottom-10 left-10 bg-white/95 backdrop-blur-md text-red-600 px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl border border-red-50 hover:bg-red-600 hover:text-white transition-all flex items-center space-x-2"
                >
                  <MapPin className="w-3 h-3 fill-current" />
                  <span>{isAm ? "ካርታውን ዝጋ" : "Hide Map"}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};
