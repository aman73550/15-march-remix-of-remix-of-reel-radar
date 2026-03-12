import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Database, TrendingUp, BarChart3, Zap } from "lucide-react";

interface PatternComparison {
  patternsCompared: number;
  viralPatternsCount?: number;
  similarityScore: number | null;
  categoryAvgScore: number | null;
  categoryAvgHookScore?: number;
  categoryAvgCaptionScore?: number;
  insights: string[];
  topPatternFeatures: {
    hookType: string | null;
    facePresence: string | null;
    motionIntensity: string | null;
  } | null;
}

interface Props {
  data: PatternComparison;
}

const ViralPatternCard = ({ data }: Props) => {
  const similarity = data.similarityScore ?? 0;
  const simColor = similarity >= 70
    ? "text-[hsl(var(--viral-high))]"
    : similarity >= 40
    ? "text-[hsl(var(--viral-mid))]"
    : "text-[hsl(var(--viral-low))]";

  const simBg = similarity >= 70
    ? "bg-[hsl(var(--viral-high))]/10 border-[hsl(var(--viral-high))]/20"
    : similarity >= 40
    ? "bg-[hsl(var(--viral-mid))]/10 border-[hsl(var(--viral-mid))]/20"
    : "bg-[hsl(var(--viral-low))]/10 border-[hsl(var(--viral-low))]/20";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <Card className="glass p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" />
            Viral Pattern Matching
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
            {data.patternsCompared} patterns analyzed
          </span>
        </div>

        {/* Similarity Score */}
        {data.similarityScore !== null && (
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${simBg}`}>
              <Zap className={`w-4 h-4 ${simColor}`} />
              <div>
                <p className={`text-lg font-bold ${simColor}`}>{data.similarityScore}%</p>
                <p className="text-[10px] text-muted-foreground">Pattern Match</p>
              </div>
            </div>

            {data.categoryAvgScore !== null && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted/30">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-lg font-bold text-foreground">{data.categoryAvgScore}</p>
                  <p className="text-[10px] text-muted-foreground">Category Avg</p>
                </div>
              </div>
            )}

            {data.viralPatternsCount !== undefined && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted/30">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-lg font-bold text-foreground">{data.viralPatternsCount}</p>
                  <p className="text-[10px] text-muted-foreground">Viral Reels</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Top Pattern Features */}
        {data.topPatternFeatures && (data.topPatternFeatures.hookType || data.topPatternFeatures.facePresence || data.topPatternFeatures.motionIntensity) && (
          <div className="grid grid-cols-3 gap-2">
            {data.topPatternFeatures.hookType && (
              <div className="text-center p-2 rounded-lg bg-muted/30 border border-border/50">
                <p className="text-[10px] text-muted-foreground mb-0.5">Top Hook</p>
                <p className="text-xs font-medium text-foreground capitalize">{data.topPatternFeatures.hookType}</p>
              </div>
            )}
            {data.topPatternFeatures.facePresence && (
              <div className="text-center p-2 rounded-lg bg-muted/30 border border-border/50">
                <p className="text-[10px] text-muted-foreground mb-0.5">Face Presence</p>
                <p className="text-xs font-medium text-foreground capitalize">{data.topPatternFeatures.facePresence}</p>
              </div>
            )}
            {data.topPatternFeatures.motionIntensity && (
              <div className="text-center p-2 rounded-lg bg-muted/30 border border-border/50">
                <p className="text-[10px] text-muted-foreground mb-0.5">Motion Style</p>
                <p className="text-xs font-medium text-foreground capitalize">{data.topPatternFeatures.motionIntensity}</p>
              </div>
            )}
          </div>
        )}

        {/* Insights */}
        <div className="space-y-1.5">
          {data.insights.map((insight, i) => (
            <motion.div
              key={i}
              className="flex items-start gap-2 text-xs text-muted-foreground"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
            >
              <span className="text-primary mt-0.5">•</span>
              <span>{insight}</span>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};

export default ViralPatternCard;
