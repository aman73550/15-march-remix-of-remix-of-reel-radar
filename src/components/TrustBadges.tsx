import { useMemo } from "react";
import { motion } from "framer-motion";
import { Shield, Award, Target, TrendingUp, Star, Users, CheckCircle } from "lucide-react";

// All possible badges - rotate every 3 days showing 4
const ALL_BADGES = [
  { icon: Target, label: "93.7% Accuracy", sub: "Prediction Rate", color: "hsl(var(--viral-high))" },
  { icon: Award, label: "#1 Reel Analyzer", sub: "2024-25", color: "hsl(var(--accent))" },
  { icon: Shield, label: "48K+ Reels", sub: "Analyzed", color: "hsl(var(--primary))" },
  { icon: TrendingUp, label: "Viral Predictor", sub: "Top Rated Tool", color: "hsl(var(--secondary))" },
  { icon: Star, label: "4.8★ Rating", sub: "from 2.3K users", color: "hsl(var(--accent))" },
  { icon: Users, label: "12K+ Creators", sub: "Active Monthly", color: "hsl(var(--viral-high))" },
  { icon: CheckCircle, label: "AI Verified", sub: "Analysis Engine", color: "hsl(var(--primary))" },
  { icon: Award, label: "Best Free Tool", sub: "Creator Awards '25", color: "hsl(var(--accent))" },
  { icon: Target, label: "8/10 Avg Score", sub: "Hook Detection", color: "hsl(var(--viral-mid))" },
  { icon: Shield, label: "256-bit Secure", sub: "Data Protected", color: "hsl(var(--secondary))" },
];

function getBadgesForCycle(count: number) {
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 3));
  const seed = dayIndex * 11;
  const pool = [...ALL_BADGES];
  const result: typeof ALL_BADGES = [];
  let idx = seed;
  while (result.length < count && pool.length > 0) {
    const pick = idx % pool.length;
    result.push(pool.splice(pick, 1)[0]);
    idx += 5;
  }
  return result;
}

const TrustBadges = () => {
  const badges = useMemo(() => getBadgesForCycle(4), []);

  return (
    <motion.div
      className="relative z-10 max-w-xl lg:max-w-2xl mx-auto px-3 sm:px-4 py-4"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.5 }}
    >
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {badges.map((badge, i) => (
          <motion.div
            key={badge.label}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-muted/30 backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 + i * 0.12 }}
            whileHover={{ scale: 1.04 }}
          >
            <badge.icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: badge.color }} />
            <div className="text-left">
              <span className="text-[10px] sm:text-[11px] font-bold text-foreground leading-none block">{badge.label}</span>
              <span className="text-[8px] text-muted-foreground leading-none">{badge.sub}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default TrustBadges;
