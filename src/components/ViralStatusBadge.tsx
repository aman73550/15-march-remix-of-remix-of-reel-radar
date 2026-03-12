import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import type { ViralClassification } from "@/lib/types";
import { Flame, TrendingUp, AlertTriangle } from "lucide-react";

interface Props {
  classification: ViralClassification;
}

const ViralStatusBadge = ({ classification }: Props) => {
  const { status, score, label, reasons, engagementRate } = classification;

  const config = {
    "Already Viral": {
      icon: <Flame className="w-5 h-5" />,
      gradient: "from-[hsl(var(--viral-high))] to-[hsl(var(--viral-mid))]",
      bg: "bg-[hsl(var(--viral-high))]/10",
      border: "border-[hsl(var(--viral-high))]/30",
      color: "text-[hsl(var(--viral-high))]",
      glow: "hsl(var(--viral-high))",
    },
    Growing: {
      icon: <TrendingUp className="w-5 h-5" />,
      gradient: "from-[hsl(var(--viral-mid))] to-[hsl(var(--primary))]",
      bg: "bg-[hsl(var(--viral-mid))]/10",
      border: "border-[hsl(var(--viral-mid))]/30",
      color: "text-[hsl(var(--viral-mid))]",
      glow: "hsl(var(--viral-mid))",
    },
    "Low Viral Potential": {
      icon: <AlertTriangle className="w-5 h-5" />,
      gradient: "from-[hsl(var(--viral-low))] to-[hsl(var(--muted-foreground))]",
      bg: "bg-[hsl(var(--viral-low))]/10",
      border: "border-[hsl(var(--viral-low))]/30",
      color: "text-[hsl(var(--viral-low))]",
      glow: "hsl(var(--viral-low))",
    },
  };

  const c = config[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
    >
      <Card className="glass p-3.5 sm:p-5 space-y-3 sm:space-y-4 overflow-hidden relative">
        {/* Glow */}
        <motion.div
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20"
          style={{ background: c.glow }}
          animate={{ opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Status header */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <motion.div
              className={`p-2 rounded-xl ${c.bg} border ${c.border} ${c.color}`}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {c.icon}
            </motion.div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Reel Status</p>
              <p className={`text-base sm:text-lg font-bold ${c.color}`}>{status}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
            <motion.p
              className={`text-2xl sm:text-3xl font-bold ${c.color}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.3 }}
            >
              {score}%
            </motion.p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative z-10">
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${c.gradient}`}
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
            />
          </div>
        </div>

        {/* Engagement rate */}
        {engagementRate !== undefined && (
          <motion.div
            className="relative z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <span className="text-xs text-muted-foreground">Engagement Rate:</span>
            <span className={`text-sm font-bold ${c.color}`}>{(engagementRate * 100).toFixed(2)}%</span>
          </motion.div>
        )}

        {/* Reasons */}
        {reasons.length > 0 && (
          <div className="relative z-10 space-y-1.5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {status === "Already Viral" ? "Why this reel performed well" : "Analysis insights"}
            </p>
            {reasons.map((reason, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-2 text-xs text-muted-foreground"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + i * 0.1 }}
              >
                <span className={`mt-0.5 ${c.color}`}>•</span>
                {reason}
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default ViralStatusBadge;
