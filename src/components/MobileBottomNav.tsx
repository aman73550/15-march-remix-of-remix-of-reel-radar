import { motion } from "framer-motion";
import { TrendingUp, Search } from "lucide-react";

interface MobileBottomNavProps {
  activeTool: "reel" | "seo";
  onToolChange: (tool: "reel" | "seo") => void;
}

const MobileBottomNav = ({ activeTool, onToolChange }: MobileBottomNavProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="mx-3 mb-3">
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-[0_-4px_30px_-8px_hsl(var(--primary)/0.15)]">
          {/* Reel Analyzer */}
          <button
            onClick={() => onToolChange("reel")}
            className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 ${
              activeTool === "reel"
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {activeTool === "reel" && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-xl gradient-primary-bg shadow-glow"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              Reel Analyzer
            </span>
          </button>

          {/* SEO Optimizer */}
          <button
            onClick={() => onToolChange("seo")}
            className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 ${
              activeTool === "seo"
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {activeTool === "seo" && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-xl gradient-primary-bg shadow-glow"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Search className="w-4 h-4" />
              SEO Optimizer
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileBottomNav;
