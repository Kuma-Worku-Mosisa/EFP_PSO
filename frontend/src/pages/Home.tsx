import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import {
  Shield,
  ArrowRight,
  Download,
  CheckCircle,
  Newspaper,
  Globe,
  Sparkles,
  Zap,
  X,
  Calendar,
  User,
  Tag,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { apiRequest, API_BASE } from "../lib/api";

/* ── Desktop-responsive overrides ─────────────────────────────── */
/* These classes scale up the layout on very wide (≥1536px) screens */
const c = {
  wrapper:
    "max-w-7xl desktop:max-w-none mx-auto desktop:mx-0 px-4 sm:px-6 lg:px-8 desktop:px-16",
  heroTitle:
    "block text-4xl md:text-[60px] md:leading-[72px] desktop:text-[72px] desktop:leading-[84px] font-sans",
  heroSubtitle: "text-3xl md:text-[52px] desktop:text-[64px]",
  heroDesc: "text-lg md:text-[20px] desktop:text-[22px]",
  cardIcon: "w-12 h-12 desktop:w-14 desktop:h-14",
  cardText:
    "text-white font-black text-lg desktop:text-xl uppercase tracking-tight",
  newsTitle:
    "text-4xl desktop:text-5xl font-black text-primary uppercase tracking-tighter leading-none",
  trustTitle:
    "text-5xl md:text-7xl desktop:text-8xl font-black text-primary uppercase tracking-tighter leading-[0.8]",
  trustDesc: "text-xl desktop:text-2xl",
  shieldCircle:
    "w-80 desktop:w-96 h-80 desktop:h-96 border-2 border-dashed border-primary/5 rounded-full flex items-center justify-center",
  shieldIcon:
    "w-32 h-32 desktop:w-40 desktop:h-40 text-primary opacity-60 group-hover/logo:opacity-100 transition-opacity duration-500 animate-pulse",
  downloadsTitle:
    "text-4xl desktop:text-5xl font-black text-primary uppercase tracking-tighter",
  downloadsDesc: "text-lg desktop:text-xl",
  sectionGap: "space-y-32 desktop:space-y-40 pb-32",
};

type PublicNewsItem = {
  id: number;
  title: string;
  titleAm?: string;
  category: string;
  summary?: string;
  summaryAm?: string;
  content: string;
  contentAm?: string;
  imageUrl?: string;
  publishedAt: string;
  status: string;
};

type HomeNewsItem = {
  id: number;
  title: string;
  desc: string;
  date: string;
  tag: string;
  image: string;
};

export const Home = () => {
  const { t, language } = useLanguage();
  const isAm = language === "am";
  const [news, setNews] = useState<HomeNewsItem[]>([]);
  const [showArchive, setShowArchive] = useState(false);
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);

  // Framer-motion variants are unused here; keep for future animations

  const formatNews = (items: PublicNewsItem[]): HomeNewsItem[] => {
    const backendBase = API_BASE.replace(/\/api$/, "");
    return items.map((item) => {
      let image = `https://picsum.photos/seed/news${item.id}/800/600`;
      const assetPath = item.imageUrl?.trim();
      if (assetPath) {
        if (/^https?:\/\//.test(assetPath)) {
          image = assetPath;
        } else {
          const normalizedPath = assetPath.startsWith("/")
            ? assetPath
            : `/${assetPath}`;
          image = `${backendBase}${normalizedPath}`;
        }
      }
      return {
        id: item.id,
        title: isAm && item.titleAm ? item.titleAm : item.title,
        desc: isAm
          ? item.summaryAm ||
            item.contentAm ||
            item.summary ||
            item.content.slice(0, 120)
          : item.summary || item.content.slice(0, 120),
        date: new Date(item.publishedAt).toLocaleDateString(
          isAm ? "am-ET" : "en-US",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          },
        ),
        tag: item.category || (isAm ? "አጋር" : "General"),
        image,
      };
    });
  };

  useEffect(() => {
    const loadNews = async () => {
      setNewsLoading(true);
      setNewsError(null);
      try {
        const response = await apiRequest<{ data: PublicNewsItem[] }>("/news");
        setNews(formatNews(response.data));
      } catch (error) {
        setNewsError(
          error instanceof Error
            ? error.message
            : "Failed to load latest news.",
        );
      } finally {
        setNewsLoading(false);
      }
    };

    loadNews();
  }, [isAm]);

  const displayedNews = showArchive ? news : news.slice(0, 3);

  return (
    <div className={c.sectionGap}>
      {/* Hero Section */}
      <section className="relative h-[90vh] desktop:h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            src="https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=2000"
            alt="Security Background"
            className="w-full h-full object-cover brightness-[0.3]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-transparent" />
        </div>

        <div className={`${c.wrapper} relative z-10 w-full`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 desktop:gap-20 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl text-white space-y-8 flex flex-col items-center lg:items-start"
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center space-x-2 bg-secondary/20 border border-secondary/30 px-4 py-2 rounded-full backdrop-blur-sm"
              >
                <Shield className="w-5 h-5 text-secondary" />
                <span className="text-secondary font-bold text-sm tracking-widest uppercase">
                  {t.hero.badge}
                </span>
              </motion.div>

              <h1 className="font-extrabold tracking-tight text-center lg:text-left">
                <span className={c.heroTitle}>{t.hero.titleLine1}</span>
                <span className={`text-secondary ${c.heroSubtitle}`}>
                  {t.hero.titleLine2}
                </span>
              </h1>

              <p
                className={`text-gray-300 font-medium leading-relaxed max-w-2xl text-center lg:text-left ${c.heroDesc}`}
              >
                {t.hero.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
                <Link
                  to="/register"
                  className="gold-gradient text-primary px-10 py-5 rounded-2xl font-bold text-lg flex items-center justify-center space-x-3 hover:shadow-2xl hover:scale-105 transition-all group"
                >
                  <span>{t.hero.applyNow}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-5 rounded-2xl font-bold text-lg flex items-center justify-center hover:bg-white/20 transition-all"
                >
                  {t.hero.login}
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="hidden lg:block relative"
            >
              <div className="absolute inset-0 bg-secondary/20 blur-[100px] rounded-full animate-pulse" />
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-12 rounded-[40px] shadow-2xl overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-50" />
                <div className="relative z-10 space-y-8">
                  <div className="flex items-center justify-between border-b border-white/10 pb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full" />
                      <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                    </div>
                    <span className="text-secondary font-black uppercase tracking-widest text-xs">
                      {t.hero.trackStatus}
                    </span>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm group-hover:bg-white/10 transition-all">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`${c.cardIcon} bg-secondary/20 rounded-2xl flex items-center justify-center`}
                        >
                          <Shield className="w-6 h-6 text-secondary" />
                        </div>
                        <div>
                          <p className={c.cardText}>
                            {t.hero.card.commandCenter}
                          </p>
                          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-0.5">
                            {t.hero.card.securityOversight}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm group-hover:bg-white/10 transition-all delay-75">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-white font-black text-lg uppercase tracking-tight">
                            {t.hero.card.realTimeLicensing}
                          </p>
                          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-0.5">
                            {t.hero.card.complianceGrid}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 flex flex-col items-center space-y-4">
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden relative">
                      <motion.div
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="absolute inset-0 w-1/3 bg-secondary"
                      />
                    </div>
                    <div className="flex items-center space-x-3 text-secondary font-black uppercase text-[10px] tracking-widest">
                      <Sparkles className="w-3 h-3 animate-spin" />
                      <span>{t.hero.card.clearanceActive}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section Mobile Removed */}

      {/* Latest News & Announcements */}
      <section className={c.wrapper}>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-primary px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/10">
              <Newspaper className="w-3 h-3" />
              <span>{t.services.items[2].title}</span>
            </div>
            <h3 className={c.newsTitle}>{t.services.newsTitle}</h3>
          </div>
        </div>

        {newsLoading ? (
          <div className="py-16 text-center text-primary font-black uppercase tracking-widest">
            {isAm ? "ዜና በመጫን ላይ ነው..." : "Loading latest news..."}
          </div>
        ) : newsError ? (
          <div className="py-16 text-center text-red-600 font-black uppercase tracking-widest">
            {newsError}
          </div>
        ) : (
          <div className="space-y-12">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.35em] text-primary/70">
                  {showArchive
                    ? isAm
                      ? "ሁሉም ማስታወቂያዎች"
                      : "All Announcements"
                    : isAm
                      ? "የቅርብ ዜና"
                      : "Latest News"}
                </p>
                <p className="text-2xl font-black text-primary tracking-tight">
                  {showArchive
                    ? isAm
                      ? "ሁሉን ማስታወቂያ ይመልከቱ"
                      : "Browse the full archive"
                    : isAm
                      ? "አዲስ ዜና እና ማስታወቂያዎች"
                      : "Latest News & Updates"}
                </p>
              </div>
              <button
                onClick={() => setShowArchive((prev) => !prev)}
                className="text-primary font-black uppercase text-xs tracking-widest flex items-center space-x-2 group"
              >
                <span>
                  {showArchive
                    ? isAm
                      ? "ወደ ቅርብ ዜና"
                      : "View Latest"
                    : isAm
                      ? "የማህበረሰብ ቅዱስ ፅኑ"
                      : "View Archive"}
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 desktop:grid-cols-4">
              {displayedNews.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    delay: i * 0.1,
                  }}
                  viewport={{ once: true }}
                  className="group bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all overflow-hidden"
                >
                  <div className="h-72 desktop:h-80 relative overflow-hidden bg-gray-50 group-hover:bg-gray-100 transition-colors duration-700">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/[0.03] to-transparent opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Newspaper className="w-12 h-12 text-primary/10 group-hover:scale-110 transition-all duration-700" />
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-white/90 backdrop-blur-md text-primary px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">
                        {item.tag}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest block mb-3">
                      {item.date}
                    </span>
                    <h4 className="text-lg font-black text-primary mb-3 uppercase tracking-tight group-hover:text-accent transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed italic line-clamp-2 mb-6">
                      {item.desc}
                    </p>
                    <button
                      onClick={() => setSelectedNews(item)}
                      className="text-primary font-black uppercase text-[10px] tracking-widest flex items-center space-x-2 group/btn"
                    >
                      <span>{t.services.learnMore}</span>
                      <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* News Modal */}
        <AnimatePresence>
          {selectedNews && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedNews(null)}
                className="absolute inset-0 bg-primary/40 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              >
                <div className="h-[48rem] sm:h-[56rem] relative bg-gray-900 flex items-center justify-center overflow-hidden">
                  {selectedNews.image ? (
                    <img
                      src={selectedNews.image}
                      alt={selectedNews.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/[0.05] to-transparent" />
                  )}
                  {!selectedNews.image && (
                    <Newspaper className="w-24 h-24 text-primary/10" />
                  )}
                  <button
                    onClick={() => setSelectedNews(null)}
                    className="absolute top-6 right-6 p-3 bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl text-primary hover:bg-primary hover:text-white transition-all z-10"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <div className="absolute top-6 left-6">
                    <span className="bg-primary text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                      {selectedNews.tag}
                    </span>
                  </div>
                </div>

                <div className="p-8 sm:p-12 overflow-y-auto">
                  <div className="flex flex-wrap items-center gap-6 mb-8 text-[11px] font-black uppercase tracking-widest text-primary/40">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{selectedNews.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{t.services.federalDesk}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-accent">
                      <Tag className="w-4 h-4" />
                      <span>{t.services.officialBulletin}</span>
                    </div>
                  </div>

                  <h3 className="text-3xl sm:text-4xl font-black text-primary uppercase tracking-tighter leading-tight mb-8">
                    {selectedNews.title}
                  </h3>

                  <div className="space-y-6 text-gray-600 text-lg leading-relaxed font-medium">
                    <p className="italic border-l-4 border-accent pl-6 bg-accent/5 py-4 rounded-r-2xl">
                      {selectedNews.desc}
                    </p>
                    <p>
                      {isAm
                        ? "ይህ መመሪያ ከዛሬ ጀምሮ ተግባራዊ የሚደረግ ሲሆን፣ ሁሉም የሚመለከታቸው አካላት ተገቢውን ዝግጅት እንዲያደርጉ እናበረታታለን። ተጨማሪ መረጃ ለማግኘት የፌዴራል ፖሊስ ኮሚሽን ድረ-ገጽን መከታተል ይቻላል።"
                        : "This initiative represents a major step forward in our national security framework. All stakeholders are advised to review the full technical documentation available in the resources section. Our team is working around the clock to ensure a smooth transition for all registered Organizations."}
                    </p>
                    <p>
                      {isAm
                        ? " የግል ጥበቃ ድርጅቶች ስራቸውን በብቃት እና በሃላፊነት እንዲወጡ የሚያግዙ አዳዲስ አሰራሮች በየጊዜው ይፋ ይደረጋሉ።"
                        : "Continuous monitoring and evaluation will follow to guarantee compliance and operational safety across all regional sectors."}
                    </p>
                  </div>

                  <div className="mt-12 pt-12 border-t border-gray-100 flex justify-between items-center">
                    <button
                      onClick={() => setSelectedNews(null)}
                      className="text-primary font-black uppercase text-xs tracking-widest flex items-center space-x-2 group"
                    >
                      <ArrowRight className="w-4 h-4 rotate-180" />
                      <span>{t.services.back}</span>
                    </button>
                    <Link
                      to="/contact"
                      className="bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:shadow-xl hover:scale-105 transition-all"
                    >
                      {t.services.question}
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </section>

      {/* Trust & Excellence - High Impact Section for Public Users */}
      <section className="relative py-32 overflow-hidden bg-white">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(30deg,#0a192f_1px,transparent_1px),linear-gradient(150deg,#0a192f_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        <div className={`${c.wrapper} relative z-10`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 desktop:gap-28 gap-20 items-center">
            <div className="space-y-10">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                whileHover={{ x: 10 }}
                viewport={{ once: true }}
                className="inline-flex items-center space-x-3 bg-primary/5 border border-primary/10 px-6 py-2 rounded-full cursor-default"
              >
                <motion.div
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 bg-accent rounded-full shadow-[0_0_10px_rgba(239,221,15,0.5)]"
                />
                <span className="text-primary font-black text-[10px] tracking-[0.3em] uppercase">
                  {t.trust.badge}
                </span>
              </motion.div>

              <div className="space-y-6">
                <motion.h3
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 50, delay: 0.1 }}
                  viewport={{ once: true }}
                  className={c.trustTitle}
                >
                  {t.trust.title}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 50, delay: 0.2 }}
                  viewport={{ once: true }}
                  className={`text-gray-600 ${c.trustDesc} font-medium leading-relaxed max-w-lg italic`}
                >
                  {t.trust.desc}
                </motion.p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 100, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="group bg-white border border-gray-100 p-10 rounded-[40px] space-y-6 hover:shadow-2xl hover:border-accent/20 transition-all duration-500 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-700" />
                  <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-[360deg] transition-transform duration-700">
                    <Globe className="w-7 h-7 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-primary font-black uppercase text-sm tracking-widest">
                      {t.trust.networkTitle}
                    </h4>
                    <p className="text-gray-500 text-xs font-semibold italic leading-relaxed">
                      {t.trust.networkDesc}
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 100, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="group bg-primary p-10 rounded-[40px] space-y-6 hover:shadow-2xl transition-all duration-500 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-700" />
                  <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-125 transition-transform duration-500">
                    <Zap className="w-7 h-7 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-white font-black uppercase text-sm tracking-widest">
                      {t.trust.digitalTitle}
                    </h4>
                    <p className="text-gray-300/80 text-xs font-semibold italic leading-relaxed">
                      {t.trust.digitalDesc}
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, rotate: 5, scale: 0.9 }}
              whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-square"
            >
              <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full animate-pulse" />
              <div className="relative h-full w-full bg-white border border-gray-100 rounded-[80px] p-6 group overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)]">
                <div className="relative h-full w-full bg-gray-50 border border-gray-100 rounded-[60px] p-12 flex flex-col justify-center items-center text-center space-y-12 group overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent opacity-50" />

                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 60,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className={c.shieldCircle}
                  >
                    <div className="absolute inset-0 border border-accent/20 rounded-full animate-[ping_4s_ease-in-out_infinite]" />
                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center p-8 shadow-2xl border border-gray-100 relative group/logo overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-tr from-primary/[0.03] to-transparent" />
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.1, 0.3, 0.1],
                        }}
                        transition={{
                          duration: 8,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="absolute inset-6 border-2 border-primary/20 rounded-full"
                      />
                      <motion.div
                        animate={{
                          scale: [1.2, 1, 1.2],
                          opacity: [0.1, 0.5, 0.1],
                        }}
                        transition={{
                          duration: 6,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="absolute inset-16 border-2 border-accent/40 rounded-full"
                      />
                      <div className="relative z-10">
                        <Shield className={c.shieldIcon} />
                      </div>
                    </div>
                  </motion.div>

                  <div className="space-y-4">
                    <h4 className="text-4xl font-black text-primary uppercase tracking-tighter">
                      {t.trust.alpha}
                    </h4>
                    <p className="text-gray-500 text-sm font-semibold italic max-w-sm">
                      {t.trust.alphaDesc}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{
                          duration: 2,
                          delay: i * 0.2,
                          repeat: Infinity,
                        }}
                        className="w-3 h-3 rounded-full bg-accent/40"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Requirement Highlight */}
      <section className="bg-dark-blue py-24 overflow-hidden relative">
        <div className={`${c.wrapper} relative z-10`}>
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-secondary font-bold tracking-widest uppercase text-sm">
              {t.fayda.badge}
            </h2>
            <h3 className="text-4xl md:text-5xl desktop:text-6xl font-bold text-white leading-tight">
              {t.fayda.title}
            </h3>
            <p className="text-gray-300 text-lg leading-relaxed">
              {t.fayda.desc}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              {t.fayda.features.map((item: string, i: number) => (
                <div
                  key={i}
                  className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10 flex flex-col items-center space-y-2"
                >
                  <CheckCircle className="text-secondary w-6 h-6" />
                  <span className="text-white text-sm font-bold">{item}</span>
                </div>
              ))}
            </div>
            <div className="pt-8">
              <Link
                to="/register"
                className="gold-gradient text-primary px-8 py-4 rounded-xl font-bold inline-flex items-center space-x-2 hover:shadow-lg transition-all"
              >
                <span>{t.hero.applyNow}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Downloads Section Only */}
      <section className={`${c.wrapper}`}>
        <div className="bg-gray-50 rounded-[64px] p-12 md:p-20 desktop:p-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full -mr-32 -mt-32" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 desktop:gap-20 gap-16 items-center">
            <div className="space-y-6">
              <h3 className={c.downloadsTitle}>{t.rules.title}</h3>
              <p
                className={`text-gray-500 font-medium ${c.downloadsDesc} leading-relaxed italic max-w-lg`}
              >
                {isAm
                  ? "ሁሉንም የፌዴራል ፖሊስ ደንቦች እና መመሪያዎች እዚህ ያግኙ። እነዚህም ሰነዶች ለድርጅቶች ስራ መሰረት ናቸው።"
                  : "Access the complete library of federal security mandates and procedural frameworks required for operational legitimacy."}
              </p>
              <Link
                to="/services"
                className="inline-flex items-center space-x-2 text-primary font-black uppercase text-xs tracking-widest group"
              >
                <span>{t.rules.learnMore}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {t.rules.items.map((doc: any, i: number) => (
                <div
                  key={i}
                  className="flex flex-col justify-between p-6 bg-white rounded-3xl hover:shadow-xl transition-all border border-transparent hover:border-secondary group h-full"
                >
                  <div className="space-y-4">
                    <div className="p-3 bg-primary/5 rounded-2xl text-primary w-fit group-hover:bg-primary group-hover:text-white transition-colors">
                      <Download className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-black text-primary uppercase tracking-tight leading-none mb-2">
                        {doc.title}
                      </p>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                        {doc.size} • {t.rules.pdfFormat}
                      </p>
                    </div>
                  </div>
                  <a
                    href="#"
                    className="mt-6 text-accent hover:text-primary transition-colors flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest"
                  >
                    <span>{t.rules.download}</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact section removed to avoid duplicate contact info on homepage. */}
    </div>
  );
};
