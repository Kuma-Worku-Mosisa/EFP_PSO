import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullPage?: boolean;
  overlay?: boolean;
}

export const LoadingSpinner = ({
  size = "md",
  text,
  fullPage = false,
  overlay = false,
}: LoadingSpinnerProps) => {
  const sizeMap = {
    sm: { icon: "w-5 h-5", container: "p-4" },
    md: { icon: "w-8 h-8", container: "p-6" },
    lg: { icon: "w-12 h-12", container: "p-8" },
  };

  const s = sizeMap[size];

  const content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col items-center justify-center gap-3 ${
        fullPage ? "min-h-[50vh]" : ""
      }`}
    >
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className={`${s.container} rounded-2xl bg-gradient-to-br from-[#003366] to-[#001F3F] shadow-lg flex items-center justify-center`}
        >
          <Loader2 className={`${s.icon} text-[#FFD700]`} />
        </motion.div>
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#FFD700] shadow-[0_0_8px_rgba(255,215,0,0.6)]"
        />
      </div>
      {text && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xs font-bold text-[#003366] tracking-wide uppercase"
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  );

  if (overlay) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      >
        {content}
      </motion.div>
    );
  }

  return content;
};

export const SkeletonCard = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="h-3 w-24 rounded-full bg-gray-200 animate-pulse" />
      <div className="h-10 w-10 rounded-xl bg-gray-200 animate-pulse" />
    </div>
    <div className="h-8 w-16 rounded-full bg-gray-200 animate-pulse" />
  </motion.div>
);

export const SkeletonChart = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6"
  >
    <div className="flex items-center gap-3 mb-6">
      <div className="h-10 w-10 rounded-xl bg-gray-200 animate-pulse" />
      <div className="h-4 w-48 rounded-full bg-gray-200 animate-pulse" />
    </div>
    <div className="h-[280px] rounded-xl bg-gray-100 animate-pulse" />
  </motion.div>
);

export const SkeletonTable = ({ rows = 5 }: { rows?: number }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
  >
    <div className="bg-gradient-to-r from-[#003366] to-[#001F3F] p-5">
      <div className="h-4 w-36 rounded-full bg-white/20 animate-pulse" />
    </div>
    <div className="p-5 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="h-3 w-1/4 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-3 w-1/4 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-3 w-1/4 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-3 w-1/6 rounded-full bg-gray-200 animate-pulse" />
        </div>
      ))}
    </div>
  </motion.div>
);

export const SkeletonActivityList = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
  >
    <div className="bg-gradient-to-r from-[#003366] to-[#001F3F] p-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-white/20 animate-pulse" />
        <div>
          <div className="h-4 w-36 rounded-full bg-white/20 animate-pulse mb-2" />
          <div className="h-3 w-24 rounded-full bg-white/10 animate-pulse" />
        </div>
      </div>
    </div>
    <div className="p-5 space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-start gap-4 p-4">
          <div className="h-9 w-9 rounded-xl bg-gray-200 animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/4 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-3 w-1/2 rounded-full bg-gray-200 animate-pulse" />
          </div>
          <div className="h-3 w-16 rounded-full bg-gray-200 animate-pulse shrink-0" />
        </div>
      ))}
    </div>
  </motion.div>
);

export default LoadingSpinner;
