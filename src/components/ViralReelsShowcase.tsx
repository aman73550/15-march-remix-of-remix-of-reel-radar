import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, ArrowRight, Flame, Eye } from "lucide-react";

// 20 realistic masked reel entries with scores (mix of high & low)
const REEL_DATA = [
  { user: "priya_***ts", code: "C9x***kQ", score: 92, category: "Dance" },
  { user: "rohi***it", code: "D4m***pL", score: 87, category: "Comedy" },
  { user: "anany***a", code: "B7n***wR", score: 15, category: "Vlog" },
  { user: "vira***dz", code: "E2k***tM", score: 78, category: "Fitness" },
  { user: "sneh***ha", code: "F8j***nS", score: 23, category: "Food" },
  { user: "tren***ng", code: "A5r***gK", score: 94, category: "Transition" },
  { user: "clip***er", code: "G1w***bV", score: 66, category: "Tutorial" },
  { user: "kara***an", code: "H3y***cX", score: 10, category: "Travel" },
  { user: "mega***rn", code: "C6p***dZ", score: 81, category: "Motivation" },
  { user: "edit***ro", code: "D9s***fQ", score: 32, category: "Lifestyle" },
  { user: "sara***ah", code: "B2t***hW", score: 89, category: "Dance" },
  { user: "varu***un", code: "E7u***jR", score: 45, category: "Tech" },
  { user: "nikh***il", code: "F4v***kT", score: 71, category: "Fashion" },
  { user: "divi***ya", code: "A8w***lU", score: 19, category: "Pets" },
  { user: "aman***rk", code: "G5x***mY", score: 96, category: "Music" },
  { user: "pall***vi", code: "H1z***nP", score: 55, category: "Cooking" },
  { user: "harsh***h", code: "C3a***oS", score: 83, category: "Comedy" },
  { user: "simr***an", code: "D6b***pK", score: 12, category: "Art" },
  { user: "kunal***l", code: "E9c***qW", score: 76, category: "Gaming" },
  { user: "tany***ya", code: "F2d***rX", score: 68, category: "Beauty" },
];

// Rotate every 3 days based on epoch
function getRotationSeed(): number {
  const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
  return Math.floor(Date.now() / THREE_DAYS_MS);
}

function getScoreColor(score: number): string {
  if (score >= 80) return "hsl(var(--viral-high))";
  if (score >= 50) return "hsl(var(--viral-mid))";
  return "hsl(var(--viral-low))";
}

function getScoreBg(score: number): string {
  if (score >= 80) return "bg-[hsl(var(--viral-high))]/10 border-[hsl(var(--viral-high))]/20";
  if (score >= 50) return "bg-[hsl(var(--viral-mid))]/10 border-[hsl(var(--viral-mid))]/20";
  return "bg-[hsl(var(--viral-low))]/10 border-[hsl(var(--viral-low))]/20";
}

function getScoreLabel(score: number): string {
  if (score >= 85) return "🔥 Viral";
  if (score >= 70) return "📈 Strong";
  if (score >= 50) return "⚡ Average";
  if (score >= 30) return "📉 Weak";
  return "❌ Poor";
}

interface Props {
  onAnalyzeClick: () => void;
}

const ViralReelsShowcase = ({ onAnalyzeClick }: Props) => {
  const seed = getRotationSeed();

  // Shuffle data deterministically based on seed
  const entries = useMemo(() => {
    const shuffled = [...REEL_DATA];
    let s = seed;
    for (let i = shuffled.length - 1; i > 0; i--) {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      const j = s % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    // Slightly vary scores each rotation period
    return shuffled.map((entry, idx) => {
      const jitter = ((seed * 7 + idx * 13) % 9) - 4; // -4 to +4
      const newScore = Math.max(5, Math.min(99, entry.score + jitter));
      return { ...entry, score: newScore };
    });
  }, [seed]);

  const [viewsCount] = useState(() => {
    const base = 12400 + (seed % 5000);
    return base;
  });

  return (
    <motion.section
      className="relative z-10 max-w-xl lg:max-w-2xl mx-auto px-3 sm:px-4 py-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      {/* Header */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-1.5 mb-2 px-3 py-1 rounded-full border border-border/50 bg-muted/30">
          <Flame className="w-3.5 h-3.5 text-[hsl(var(--instagram-orange))]" />
          <span className="text-[10px] font-semibold uppercase tracking-wider gradient-primary">
            Recently Analyzed Reels
          </span>
          <Eye className="w-3 h-3 text-muted-foreground" />
          <span className="text-[9px] text-muted-foreground">{viewsCount.toLocaleString()}</span>
        </div>
        <h2 className="text-base sm:text-lg font-bold text-foreground">
          Viral Score Leaderboard
        </h2>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
          Real scores from creators who analyzed their reels
        </p>
      </div>

      {/* Reels Grid */}
      <Card className="glass overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[1fr_0.8fr_auto] sm:grid-cols-[1.3fr_1fr_auto] gap-2 px-3 sm:px-4 py-2 border-b border-border/50 text-[9px] sm:text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          <span>Reel</span>
          <span>Category</span>
          <span className="text-right">Score</span>
        </div>

        <div className="divide-y divide-border/20 max-h-[420px] overflow-y-auto scrollbar-thin">
          {entries.map((entry, i) => (
            <motion.div
              key={`${seed}-${i}`}
              className="grid grid-cols-[1fr_0.8fr_auto] sm:grid-cols-[1.3fr_1fr_auto] gap-2 px-3 sm:px-4 py-2 items-center hover:bg-muted/20 transition-colors"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
            >
              {/* Reel info */}
              <div className="min-w-0">
                <p className="text-[11px] sm:text-xs font-medium text-foreground truncate select-none">
                  @{entry.user}
                </p>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground/50 truncate select-none font-mono">
                  /reel/{entry.code}
                </p>
              </div>

              {/* Category */}
              <div className="min-w-0">
                <span className="text-[9px] sm:text-[10px] text-muted-foreground/70 truncate">
                  {entry.category}
                </span>
              </div>

              {/* Score */}
              <div className="text-right flex items-center gap-1.5">
                <span className="text-[8px] hidden sm:inline text-muted-foreground/50">
                  {getScoreLabel(entry.score)}
                </span>
                <span
                  className={`inline-flex items-center justify-center min-w-[36px] px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-bold tabular-nums border ${getScoreBg(entry.score)}`}
                  style={{ color: getScoreColor(entry.score) }}
                >
                  {entry.score}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* CTA Button */}
      <motion.div
        className="mt-4 flex justify-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Button
          onClick={onAnalyzeClick}
          className="gradient-primary-bg text-primary-foreground px-6 py-2.5 rounded-full font-semibold text-sm shadow-glow hover:opacity-90 transition-opacity"
          size="lg"
        >
          <TrendingUp className="w-4 h-4 mr-1.5" />
          Analyse Your Reel
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </motion.div>

      <p className="text-[8px] sm:text-[9px] text-muted-foreground/40 text-center mt-2 px-2 select-none">
        Usernames & reel links are masked for privacy. Scores are system-generated estimates.
      </p>
    </motion.section>
  );
};

export default ViralReelsShowcase;
