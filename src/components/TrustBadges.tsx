import { motion } from "framer-motion";
import { Sparkles, Search, TrendingUp, Radio, Shield, Zap } from "lucide-react";

const BADGES = [
  {
    icon: Sparkles,
    title: "AI Reel Analyzer",
    subtitle: "Deep hook, caption & engagement analysis",
  },
  {
    icon: Search,
    title: "SEO Engine",
    subtitle: "Trending titles, tags & hashtag optimization",
  },
  {
    icon: TrendingUp,
    title: "Viral Predictor",
    subtitle: "ML-powered growth potential scoring",
  },
  {
    icon: Radio,
    title: "Trend Detection",
    subtitle: "Real-time trending audio & topic tracking",
  },
];

const TrustBadges = () => {
  return (
    <motion.div
      className="relative z-10 max-w-2xl mx-auto px-4 py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
    >
      {/* Section header */}
      <div className="text-center mb-6">
        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">Why Creators Choose Us</p>
        <h2 className="text-lg sm:text-xl font-bold text-foreground">Enterprise-Grade Analysis, Completely Free</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {BADGES.map((badge, i) => (
          <motion.div
            key={badge.title}
            className="group relative flex items-start gap-3.5 px-4 py-4 rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card/80"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 + i * 0.1 }}
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center transition-colors duration-300 group-hover:bg-primary/15">
              <badge.icon className="w-5 h-5 text-primary" />
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
