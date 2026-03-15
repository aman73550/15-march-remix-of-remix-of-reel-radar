import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { TrendingUp, MessageSquare, Bookmark, Users, AlertTriangle, Activity, Eye } from "lucide-react";

const SIGNAL_TYPES = [
  { label: "High Engagement Spike", icon: TrendingUp, color: "hsl(var(--viral-high))" },
  { label: "Unusual Save Growth", icon: Bookmark, color: "hsl(var(--accent))" },
  { label: "Rapid Comment Activity", icon: MessageSquare, color: "hsl(var(--primary))" },
  { label: "Audience Boost Pattern", icon: Users, color: "hsl(var(--secondary))" },
  { label: "Possible Bot Interaction", icon: AlertTriangle, color: "hsl(var(--viral-low))" },
  { label: "Watch Time Anomaly", icon: Eye, color: "hsl(var(--viral-mid))" },
  { label: "Share Velocity Surge", icon: Activity, color: "hsl(var(--viral-high))" },
];

const USERNAMES = [
  "creator_vibe", "reel_magic", "viral_studio", "content_hub", "daily_clips",
  "trend_wave", "insta_pro", "story_maker", "edit_king", "reel_queen",
  "explore_daily", "vlog_star", "snap_creator", "media_flow", "clip_master",
];

const REEL_CODES = [
  "AB7kQ91", "Cx3mP82", "Dz9nR47", "Ew5tL63", "Fv2yK18",
  "Gq8wJ54", "Hr4uN76", "Ip6sM39", "Jk1rO25", "Ln3xH87",
  "Mo7vG42", "Ns5cF61", "Ot9bE38", "Pu2aD74", "Qw4zC56",
];

function maskUsername(name: string): string {
  if (name.length <= 4) return name.slice(0, 2) + "**";
  const keep = Math.ceil(name.length * 0.4);
  return name.slice(0, keep) + "***";
}

function maskReelCode(code: string): string {
  return code.slice(0, 3) + "***" + code.slice(-2);
}

function generateEntry(seed: number) {
  const signal = SIGNAL_TYPES[seed % SIGNAL_TYPES.length];
  const username = USERNAMES[(seed * 7 + 3) % USERNAMES.length];
  const reelCode = REEL_CODES[(seed * 11 + 5) % REEL_CODES.length];
  const confidence = 72 + ((seed * 13) % 26); // 72-97%
  return {
    id: seed,
    username: maskUsername(username),
    reelCode: maskReelCode(reelCode),
    signal: signal.label,
    Icon: signal.icon,
    color: signal.color,
    confidence,
  };
}

const SampleAnalysisPreview = () => {
  const [cycle, setCycle] = useState(0);

  // Auto-refresh every 12 seconds
  useEffect(() => {
    const interval = setInterval(() => setCycle((c) => c + 1), 12000);
    return () => clearInterval(interval);
  }, []);

  const entries = useMemo(() => {
    const base = cycle * 3;
    return Array.from({ length: 7 }, (_, i) => generateEntry(base + i));
  }, [cycle]);

  return (
    <motion.div
      className="relative z-10 max-w-xl lg:max-w-2xl mx-auto px-3 sm:px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.5 }}
    >
      <div className="text-center mb-3 sm:mb-4">
        <div className="inline-flex items-center gap-1.5 mb-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-viral-high opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-viral-high" />
          </span>
          <span className="text-[10px] font-medium text-viral-high uppercase tracking-wider">Live</span>
        </div>
        <h2 className="text-base sm:text-lg font-bold text-foreground">Reel Activity Insights</h2>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
          Automatically generated insights from recently analyzed reels
        </p>
      </div>

      <Card className="glass overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-[1fr_1fr_auto] sm:grid-cols-[1.2fr_1.5fr_auto] gap-2 px-3 sm:px-4 py-2 border-b border-border/50 text-[9px] sm:text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          <span>Source</span>
          <span>Signal Detected</span>
          <span className="text-right">Conf.</span>
        </div>

        {/* Entries */}
        <div className="divide-y divide-border/30">
          <AnimatePresence mode="popLayout">
            {entries.map((entry, i) => (
              <motion.div
                key={`${cycle}-${entry.id}`}
                className="grid grid-cols-[1fr_1fr_auto] sm:grid-cols-[1.2fr_1.5fr_auto] gap-2 px-3 sm:px-4 py-2.5 items-center hover:bg-muted/20 transition-colors"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: i * 0.06 }}
              >
                {/* Source */}
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-xs font-medium text-foreground truncate">
                    @{entry.username}
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground/60 truncate">
                    /reel/{entry.reelCode}
                  </p>
                </div>

                {/* Signal */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <entry.Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" style={{ color: entry.color }} />
                  <span className="text-[10px] sm:text-xs text-foreground/80 truncate">{entry.signal}</span>
                </div>

                {/* Confidence */}
                <div className="text-right">
                  <span
                    className="text-[11px] sm:text-xs font-bold tabular-nums"
                    style={{ color: entry.confidence >= 85 ? "hsl(var(--viral-high))" : entry.confidence >= 78 ? "hsl(var(--viral-mid))" : "hsl(var(--muted-foreground))" }}
                  >
                    {entry.confidence}%
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Card>

      <p className="text-[8px] sm:text-[9px] text-muted-foreground/40 text-center mt-2.5 px-2">
        Usernames and reel links are partially masked for privacy. Insights are generated automatically by our analysis system.
      </p>
    </motion.div>
  );
};

export default SampleAnalysisPreview;
