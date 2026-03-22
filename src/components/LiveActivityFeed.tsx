import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Zap, BarChart3, Clock } from "lucide-react";

const ROLES = ["A creator", "An influencer", "A business", "A user", "A content creator", "A brand", "A social media manager", "A digital marketer"];
const REEL_IDS = ["C9xK...mQ2p", "DA3r...vB7n", "C8fL...kT4w", "DB2m...pN5x", "C7qR...jH8s", "DC5t...wF3y", "C6nP...hU9z", "DD8v...xE2a", "C5bW...gM6k", "DE1s...yR4c", "C4dJ...fL7m", "DF7u...zQ1b"];
const CATEGORIES = ["Fashion", "Comedy", "Education", "Food", "Travel", "Fitness", "Tech", "Beauty", "Dance", "Motivation", "DIY", "Music"];
const TIMES = ["just now", "2s ago", "5s ago", "8s ago", "12s ago", "18s ago", "25s ago", "30s ago", "45s ago", "1m ago"];

interface FeedItem {
  id: number;
  role: string;
  reelId: string;
  score: number;
  category: string;
  time: string;
}

function generateItem(id: number): FeedItem {
  return {
    id,
    role: ROLES[Math.floor(Math.random() * ROLES.length)],
    reelId: REEL_IDS[Math.floor(Math.random() * REEL_IDS.length)],
    score: Math.floor(Math.random() * 40) + 55, // 55-94
    category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
    time: TIMES[Math.floor(Math.random() * TIMES.length)],
  };
}

function getScoreColor(score: number) {
  if (score >= 80) return "text-[hsl(var(--viral-high))]";
  if (score >= 65) return "text-primary";
  return "text-amber-500";
}

function getScoreLabel(score: number) {
  if (score >= 85) return "🔥 Viral";
  if (score >= 75) return "📈 High";
  if (score >= 65) return "⚡ Good";
  return "💡 Moderate";
}

const LiveActivityFeed = () => {
  const [items, setItems] = useState<FeedItem[]>(() =>
    Array.from({ length: 5 }, (_, i) => generateItem(i))
  );
  const [counter, setCounter] = useState(6);

  // Rotate items every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCounter((c) => c + 1);
      setItems((prev) => {
        const newItem = generateItem(counter);
        return [newItem, ...prev.slice(0, 4)];
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [counter]);

  return (
    <div className="relative z-10 max-w-xl lg:max-w-2xl mx-auto px-4 sm:px-6 pb-6">
      {/* Live indicator */}
      <div className="flex items-center gap-2 mb-3">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--viral-high))] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[hsl(var(--viral-high))]" />
        </span>
        <span className="text-xs font-medium text-muted-foreground">Recent Analyses</span>
      </div>

      {/* Feed list */}
      <div className="space-y-2 overflow-hidden">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35 }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-card/60 backdrop-blur-sm"
            >
              {/* Score circle */}
              <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0 ${
                item.score >= 80 ? "border-[hsl(var(--viral-high))]/40 bg-[hsl(var(--viral-high))]/10" :
                item.score >= 65 ? "border-primary/40 bg-primary/10" :
                "border-amber-500/40 bg-amber-500/10"
              }`}>
                <span className={`text-xs font-bold ${getScoreColor(item.score)}`}>{item.score}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground leading-tight">
                  <span className="font-medium">{item.role}</span>
                  <span className="text-muted-foreground"> analyzed </span>
                  <span className="font-mono text-[11px] text-muted-foreground/70">instagram.com/reel/{item.reelId}</span>
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] font-semibold ${getScoreColor(item.score)}`}>{getScoreLabel(item.score)}</span>
                  <span className="text-[10px] text-muted-foreground/50">•</span>
                  <span className="text-[10px] text-muted-foreground/60">{item.category}</span>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-center gap-1 shrink-0">
                <Clock className="w-2.5 h-2.5 text-muted-foreground/40" />
                <span className="text-[10px] text-muted-foreground/50">{item.time}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LiveActivityFeed;
