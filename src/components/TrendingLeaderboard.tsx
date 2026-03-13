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
}

// 25+ entries for better rotation variety
const ALL_ENTRIES: LeaderboardEntry[] = [
  { creator: "fitness_arjun", niche: "Gym Transformation", emoji: "💪", viralScore: 78, hookScore: 8, captionScore: 7, hashtagScore: 8, views: "1.2M" },
  { creator: "priya.cooks", niche: "Quick Recipe", emoji: "🍳", viralScore: 74, hookScore: 8, captionScore: 7, hashtagScore: 7, views: "856K" },
  { creator: "travel.with.mike", niche: "Hidden Gems", emoji: "✈️", viralScore: 71, hookScore: 7, captionScore: 8, hashtagScore: 7, views: "623K" },
  { creator: "comedy_raj", niche: "Relatable Skit", emoji: "😂", viralScore: 76, hookScore: 8, captionScore: 7, hashtagScore: 6, views: "2.1M" },
  { creator: "tech.sarah", niche: "iPhone Hack", emoji: "📱", viralScore: 69, hookScore: 7, captionScore: 7, hashtagScore: 8, views: "445K" },
  { creator: "dance.meera", niche: "Trending Audio", emoji: "💃", viralScore: 73, hookScore: 8, captionScore: 6, hashtagScore: 7, views: "934K" },
  { creator: "skincare.nisha", niche: "Night Routine", emoji: "✨", viralScore: 67, hookScore: 7, captionScore: 7, hashtagScore: 7, views: "312K" },
  { creator: "motivate.vikram", niche: "Morning Mindset", emoji: "🔥", viralScore: 65, hookScore: 7, captionScore: 8, hashtagScore: 6, views: "278K" },
  { creator: "pet.lover.sam", niche: "Dog Training", emoji: "🐕", viralScore: 72, hookScore: 8, captionScore: 6, hashtagScore: 7, views: "567K" },
  { creator: "fashion.divya", niche: "GRWM Outfit", emoji: "👗", viralScore: 70, hookScore: 7, captionScore: 7, hashtagScore: 7, views: "489K" },
  { creator: "car.enthusiast", niche: "Supercar Review", emoji: "🏎️", viralScore: 75, hookScore: 8, captionScore: 7, hashtagScore: 7, views: "1.5M" },
  { creator: "study.with.ana", niche: "Study Tips", emoji: "📚", viralScore: 63, hookScore: 6, captionScore: 8, hashtagScore: 7, views: "198K" },
  { creator: "wanderlust.emma", niche: "Solo Travel Vlog", emoji: "🌍", viralScore: 72, hookScore: 7, captionScore: 8, hashtagScore: 7, views: "734K" },
  { creator: "biryani.king", niche: "Street Food Review", emoji: "🍛", viralScore: 77, hookScore: 8, captionScore: 7, hashtagScore: 8, views: "1.8M" },
  { creator: "yoga.with.ananya", niche: "Morning Flow", emoji: "🧘", viralScore: 68, hookScore: 7, captionScore: 8, hashtagScore: 6, views: "356K" },
  { creator: "desi.memes.daily", niche: "Desi Comedy", emoji: "🤣", viralScore: 79, hookScore: 8, captionScore: 7, hashtagScore: 7, views: "3.2M" },
  { creator: "makeup.by.zara", niche: "Drugstore Dupe", emoji: "💄", viralScore: 71, hookScore: 7, captionScore: 7, hashtagScore: 8, views: "521K" },
  { creator: "crypto.decoded", niche: "Market Analysis", emoji: "💰", viralScore: 64, hookScore: 7, captionScore: 7, hashtagScore: 7, views: "234K" },
  { creator: "painting.daily", niche: "Art Timelapse", emoji: "🎨", viralScore: 74, hookScore: 8, captionScore: 6, hashtagScore: 7, views: "678K" },
  { creator: "bike.rides.india", niche: "Royal Enfield Tour", emoji: "🏍️", viralScore: 76, hookScore: 8, captionScore: 7, hashtagScore: 7, views: "1.1M" },
  { creator: "plantmom.life", niche: "Indoor Garden", emoji: "🌿", viralScore: 66, hookScore: 7, captionScore: 7, hashtagScore: 7, views: "289K" },
  { creator: "photography.lens", niche: "Phone Photography", emoji: "📷", viralScore: 70, hookScore: 7, captionScore: 8, hashtagScore: 7, views: "412K" },
  { creator: "cricket.clips", niche: "Match Highlights", emoji: "🏏", viralScore: 80, hookScore: 8, captionScore: 7, hashtagScore: 8, views: "4.5M" },
  { creator: "mumbai.foodie", niche: "Vada Pav Review", emoji: "🍔", viralScore: 73, hookScore: 8, captionScore: 7, hashtagScore: 6, views: "892K" },
  { creator: "baby.moments", niche: "First Steps Video", emoji: "👶", viralScore: 75, hookScore: 8, captionScore: 6, hashtagScore: 7, views: "1.3M" },
];

// Deterministic time labels rotating with seed
function getTimeLabel(seed: number, index: number): string {
  const opts = ["12m ago", "28m ago", "1h ago", "2h ago", "3h ago", "4h ago", "5h ago", "45m ago", "1.5h ago", "just now", "8m ago", "35m ago"];
  return opts[(seed + index * 5) % opts.length];
}

// Rotate every 3 days
function getEntriesForCycle(count: number): (LeaderboardEntry & { timeAgo: string })[] {
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 3));
  const seed = dayIndex * 13;
  const pool = [...ALL_ENTRIES];
  const result: (LeaderboardEntry & { timeAgo: string })[] = [];
  let idx = seed;
  while (result.length < count && pool.length > 0) {
    const pick = idx % pool.length;
    const entry = pool.splice(pick, 1)[0];
    result.push({ ...entry, timeAgo: getTimeLabel(seed, result.length) });
    idx += 7;
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
  const entries = useMemo(() => getEntriesForCycle(5), []);

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
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  i === 0 ? "bg-[hsl(var(--accent))]/15 text-[hsl(var(--accent))]" :
                  i <= 2 ? "bg-muted text-foreground" :
                  "bg-muted/50 text-muted-foreground"
                }`}>
                  #{i + 1}
                </div>
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
                    <span className="inline-flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" /> {entry.views}</span>
                    <span className="text-muted-foreground/50">{entry.timeAgo}</span>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <span className={`text-base sm:text-lg font-bold ${getScoreColor(entry.viralScore)}`}>{entry.viralScore}%</span>
                  <p className="text-[8px] sm:text-[9px] text-muted-foreground">viral score</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div className="mt-6 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>
        <Button onClick={onScrollToInput} className="gradient-primary-bg text-primary-foreground font-semibold shadow-glow hover:opacity-90 transition-opacity px-8">
          <TrendingUp className="w-4 h-4 mr-2" />
          Analyze Your Reel
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default TrendingLeaderboard;
