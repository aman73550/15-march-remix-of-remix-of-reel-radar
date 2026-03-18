import { motion } from "framer-motion";
import { Sparkles, Search, TrendingUp, Radio } from "lucide-react";

const BADGES = [
  {
    icon: Sparkles,
    title: "Smart Reel Analyzer",
    subtitle: "Detects Viral Hooks and Engagement Signals",
  },
  {
    icon: Search,
    title: "SEO Optimization Engine",
    subtitle: "Finds Trending Titles, Tags, and Hashtags",
  },
  {
    icon: TrendingUp,
    title: "Viral Probability Predictor",
    subtitle: "Estimates Reel Growth Potential",
  },
  {
    icon: Radio,
    title: "Real-Time Trend Detection",
    subtitle: "Tracks Trending Audio and Topics",
  },
];

const TrustBadges = () => {
  return (
    <motion.div
      className="relative z-10 max-w-2xl mx-auto px-4 py-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {BADGES.map((badge, i) => (
          <motion.div
            key={badge.title}
            className="group relative flex items-start gap-3 px-4 py-3.5 rounded-xl border border-border/60 bg-card/50 backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_24px_-6px_hsl(var(--primary)/0.25)] hover:-translate-y-0.5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 + i * 0.1 }}
          >
            <div className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center transition-colors duration-300 group-hover:bg-primary/20">
              <badge.icon className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground leading-tight">
                {badge.title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                {badge.subtitle}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default TrustBadges;
