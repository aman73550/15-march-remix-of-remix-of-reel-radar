import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Trophy, Flame } from "lucide-react";

interface LeaderboardEntry {
  category: string;
  emoji: string;
  viralScore: number;
  hookScore: number;
  captionScore: number;
  hashtagScore: number;
}

const ALL_ENTRIES: LeaderboardEntry[] = [
  { category: "Fitness", emoji: "💪", viralScore: 92, hookScore: 9, captionScore: 8, hashtagScore: 9 },
  { category: "Marketing", emoji: "📈", viralScore: 88, hookScore: 9, captionScore: 8, hashtagScore: 7 },
  { category: "Travel", emoji: "✈️", viralScore: 85, hookScore: 8, captionScore: 9, hashtagScore: 7 },
  { category: "Comedy", emoji: "😂", viralScore: 83, hookScore: 9, captionScore: 7, hashtagScore: 6 },
  { category: "Food", emoji: "🍕", viralScore: 81, hookScore: 8, captionScore: 7, hashtagScore: 8 },
  { category: "Tech", emoji: "💻", viralScore: 79, hookScore: 7, captionScore: 8, hashtagScore: 8 },
  { category: "Fashion", emoji: "👗", viralScore: 77, hookScore: 8, captionScore: 7, hashtagScore: 7 },
  { category: "Education", emoji: "📚", viralScore: 75, hookScore: 7, captionScore: 8, hashtagScore: 7 },
  { category: "Gaming", emoji: "🎮", viralScore: 74, hookScore: 8, captionScore: 6, hashtagScore: 7 },
  { category: "Music", emoji: "🎵", viralScore: 72, hookScore: 7, captionScore: 7, hashtagScore: 7 },
  { category: "Beauty", emoji: "💄", viralScore: 71, hookScore: 7, captionScore: 8, hashtagScore: 6 },
  { category: "Motivation", emoji: "🔥", viralScore: 70, hookScore: 8, captionScore: 7, hashtagScore: 6 },
  { category: "Pets", emoji: "🐶", viralScore: 68, hookScore: 7, captionScore: 6, hashtagScore: 7 },
  { category: "DIY", emoji: "🔧", viralScore: 66, hookScore: 6, captionScore: 7, hashtagScore: 7 },
];

function shuffleAndPick(arr: LeaderboardEntry[], count: number): LeaderboardEntry[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).sort((a, b) => b.viralScore - a.viralScore);
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-[hsl(var(--viral-high))]";
  if (score >= 60) return "text-[hsl(var(--viral-mid))]";
  return "text-[hsl(var(--viral-low))]";
}

interface Props {
  onScrollToInput: () => void;
}

const TrendingLeaderboard = ({ onScrollToInput }: Props) => {
  const entries = useMemo(() => shuffleAndPick(ALL_ENTRIES, 6), []);

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
          <h2 className="text-lg font-bold text-foreground">Trending Reel Analyses</h2>
        </div>
        <p className="text-xs text-muted-foreground">Top performing reels analyzed by our community</p>
      </div>

      <div className="space-y-2.5">
        {entries.map((entry, i) => (
          <motion.div
            key={entry.category}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.3 + i * 0.1 }}
          >
            <Card className={`glass p-3 sm:p-3.5 ${i === 0 ? "border-[hsl(var(--viral-high))]/30 bg-[hsl(var(--viral-high))]/5" : ""}`}>
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Rank */}
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  i === 0 ? "bg-[hsl(var(--accent))]/15 text-[hsl(var(--accent))]" :
                  i === 1 ? "bg-muted text-foreground" :
                  i === 2 ? "bg-muted text-foreground" :
                  "bg-muted/50 text-muted-foreground"
                }`}>
                  #{i + 1}
                </div>

                {/* Category */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                    <span className="text-sm">{entry.emoji}</span>
                    <span className="text-xs sm:text-sm font-semibold text-foreground">{entry.category}</span>
                    {i === 0 && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[hsl(var(--viral-high))]/10 border border-[hsl(var(--viral-high))]/20 text-[7px] sm:text-[8px] font-bold text-[hsl(var(--viral-high))] whitespace-nowrap">
                        <Flame className="w-2 h-2 sm:w-2.5 sm:h-2.5" /> High Viral
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 mt-0.5 sm:mt-1 text-[9px] sm:text-[10px] text-muted-foreground">
                    <span>Hook: <span className="font-bold text-foreground">{entry.hookScore}/10</span></span>
                    <span>Caption: <span className="font-bold text-foreground">{entry.captionScore}/10</span></span>
                    <span className="hidden xs:inline">Hashtag: <span className="font-bold text-foreground">{entry.hashtagScore}/10</span></span>
                  </div>
                </div>

                {/* Viral Score */}
                <div className="flex-shrink-0 text-right">
                  <span className={`text-base sm:text-lg font-bold ${getScoreColor(entry.viralScore)}`}>{entry.viralScore}%</span>
                  <p className="text-[8px] sm:text-[9px] text-muted-foreground">viral</p>
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
