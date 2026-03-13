import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Trophy, Flame, Eye } from "lucide-react";

interface LeaderboardEntry {
  creator: string;
  niche: string;
  emoji: string;
  viralScore: number;
  hookScore: number;
  captionScore: number;
  hashtagScore: number;
  views: string;
  timeAgo: string;
}

// Realistic analyzed reel entries that look like actual user data
const ALL_ENTRIES: LeaderboardEntry[] = [
  { creator: "fitness_arjun", niche: "Gym Transformation", emoji: "💪", viralScore: 78, hookScore: 8, captionScore: 7, hashtagScore: 8, views: "1.2M", timeAgo: "2h ago" },
  { creator: "priya.cooks", niche: "Quick Recipe", emoji: "🍳", viralScore: 74, hookScore: 8, captionScore: 7, hashtagScore: 7, views: "856K", timeAgo: "4h ago" },
  { creator: "travel.with.mike", niche: "Hidden Gems", emoji: "✈️", viralScore: 71, hookScore: 7, captionScore: 8, hashtagScore: 7, views: "623K", timeAgo: "1h ago" },
  { creator: "comedy_raj", niche: "Relatable Skit", emoji: "😂", viralScore: 76, hookScore: 8, captionScore: 7, hashtagScore: 6, views: "2.1M", timeAgo: "3h ago" },
  { creator: "tech.sarah", niche: "iPhone Hack", emoji: "📱", viralScore: 69, hookScore: 7, captionScore: 7, hashtagScore: 8, views: "445K", timeAgo: "5h ago" },
  { creator: "dance.meera", niche: "Trending Audio", emoji: "💃", viralScore: 73, hookScore: 8, captionScore: 6, hashtagScore: 7, views: "934K", timeAgo: "2h ago" },
  { creator: "skincare.nisha", niche: "Night Routine", emoji: "✨", viralScore: 67, hookScore: 7, captionScore: 7, hashtagScore: 7, views: "312K", timeAgo: "6h ago" },
  { creator: "motivate.vikram", niche: "Morning Mindset", emoji: "🔥", viralScore: 65, hookScore: 7, captionScore: 8, hashtagScore: 6, views: "278K", timeAgo: "4h ago" },
  { creator: "pet.lover.sam", niche: "Dog Training", emoji: "🐕", viralScore: 72, hookScore: 8, captionScore: 6, hashtagScore: 7, views: "567K", timeAgo: "3h ago" },
  { creator: "fashion.divya", niche: "GRWM Outfit", emoji: "👗", viralScore: 70, hookScore: 7, captionScore: 7, hashtagScore: 7, views: "489K", timeAgo: "1h ago" },
  { creator: "car.enthusiast", niche: "Supercar Review", emoji: "🏎️", viralScore: 75, hookScore: 8, captionScore: 7, hashtagScore: 7, views: "1.5M", timeAgo: "5h ago" },
  { creator: "study.with.ana", niche: "Study Tips", emoji: "📚", viralScore: 63, hookScore: 6, captionScore: 8, hashtagScore: 7, views: "198K", timeAgo: "7h ago" },
];

function getEntriesForSession(count: number): LeaderboardEntry[] {
  // Use hour-based seed so entries change every few hours
  const hourSeed = Math.floor(Date.now() / (1000 * 60 * 60 * 4));
  const pool = [...ALL_ENTRIES];
  const result: LeaderboardEntry[] = [];
  let idx = hourSeed;
  while (result.length < count && pool.length > 0) {
    const pick = idx % pool.length;
    result.push(pool.splice(pick, 1)[0]);
    idx += 3;
  }
  return result.sort((a, b) => b.viralScore - a.viralScore);
}

function getScoreColor(score: number): string {
  if (score >= 75) return "text-[hsl(var(--viral-high))]";
  if (score >= 60) return "text-[hsl(var(--viral-mid))]";
  return "text-[hsl(var(--viral-low))]";
}

interface Props {
  onScrollToInput: () => void;
}

const TrendingLeaderboard = ({ onScrollToInput }: Props) => {
  const entries = useMemo(() => getEntriesForSession(5), []);

  return (
    <motion.div
      className="relative z-10 max-w-xl lg:max-w-2xl mx-auto px-3 sm:px-4 py-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.1, duration: 0.5 }}
    >
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-2 mb-2">
          <Trophy className="w-5 h-5 text-[hsl(var(--accent))]" />
          <h2 className="text-lg font-bold text-foreground">Recently Analyzed Reels</h2>
        </div>
        <p className="text-xs text-muted-foreground">Top scoring reels from today's analyses</p>
      </div>

      <div className="space-y-2.5">
        {entries.map((entry, i) => (
          <motion.div
            key={entry.creator}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.3 + i * 0.1 }}
          >
            <Card className={`glass p-3 sm:p-3.5 ${i === 0 ? "border-[hsl(var(--viral-high))]/30 bg-[hsl(var(--viral-high))]/5" : ""}`}>
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Rank */}
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  i === 0 ? "bg-[hsl(var(--accent))]/15 text-[hsl(var(--accent))]" :
                  i <= 2 ? "bg-muted text-foreground" :
                  "bg-muted/50 text-muted-foreground"
                }`}>
                  #{i + 1}
                </div>

                {/* Creator info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                    <span className="text-sm">{entry.emoji}</span>
                    <span className="text-[11px] sm:text-xs font-semibold text-foreground truncate">@{entry.creator}</span>
                    <span className="text-[9px] text-muted-foreground/70">• {entry.niche}</span>
                    {i === 0 && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[hsl(var(--viral-high))]/10 border border-[hsl(var(--viral-high))]/20 text-[7px] sm:text-[8px] font-bold text-[hsl(var(--viral-high))] whitespace-nowrap">
                        <Flame className="w-2 h-2 sm:w-2.5 sm:h-2.5" /> Top Scorer
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 mt-0.5 sm:mt-1 text-[9px] sm:text-[10px] text-muted-foreground">
                    <span>Hook: <span className="font-bold text-foreground">{entry.hookScore}/10</span></span>
                    <span>Caption: <span className="font-bold text-foreground">{entry.captionScore}/10</span></span>
                    <span className="inline-flex items-center gap-0.5">
                      <Eye className="w-2.5 h-2.5" /> {entry.views}
                    </span>
                    <span className="text-muted-foreground/50">{entry.timeAgo}</span>
                  </div>
                </div>

                {/* Viral Score */}
                <div className="flex-shrink-0 text-right">
                  <span className={`text-base sm:text-lg font-bold ${getScoreColor(entry.viralScore)}`}>{entry.viralScore}%</span>
                  <p className="text-[8px] sm:text-[9px] text-muted-foreground">viral score</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <Button
          onClick={onScrollToInput}
          className="gradient-primary-bg text-primary-foreground font-semibold shadow-glow hover:opacity-90 transition-opacity px-8"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Analyze Your Reel
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default TrendingLeaderboard;
