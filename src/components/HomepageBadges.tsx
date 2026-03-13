import { motion } from "framer-motion";
import { Award, Star, Zap, Shield, Target, Trophy } from "lucide-react";

const badges = [
  { icon: Trophy, label: "Tool No.1 Accuracy Award", color: "text-accent" },
  { icon: Target, label: "Highest Viral Prediction Tool 2025", color: "text-primary" },
  { icon: Shield, label: "Trusted by 50K+ Creators", color: "text-[hsl(var(--viral-high))]" },
  { icon: Zap, label: "Fastest AI Analysis Engine", color: "text-secondary" },
  { icon: Award, label: "Best Reel Analytics Platform", color: "text-accent" },
  { icon: Star, label: "#1 Instagram Growth Tool", color: "text-primary" },
];

const HomepageBadges = () => (
  <motion.div
    className="relative z-10 max-w-2xl mx-auto px-3 py-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.9 }}
  >
    <div className="flex flex-wrap justify-center gap-2">
      {badges.map((badge, i) => (
        <motion.div
          key={i}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card/60 backdrop-blur-sm text-[10px] sm:text-xs font-medium text-muted-foreground"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 + i * 0.1 }}
          whileHover={{ scale: 1.05 }}
        >
          <badge.icon className={`w-3 h-3 ${badge.color}`} />
          {badge.label}
        </motion.div>
      ))}
    </div>
  </motion.div>
);

export default HomepageBadges;
