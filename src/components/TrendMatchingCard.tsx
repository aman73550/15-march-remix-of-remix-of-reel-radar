import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import type { TrendMatching } from "@/lib/types";

interface Props {
  data: TrendMatching;
  title: string;
}

const TrendMatchingCard = ({ data, title }: Props) => {
  const getColor = (s: number) => {
    if (s >= 7) return "hsl(var(--viral-high))";
    if (s >= 4) return "hsl(var(--viral-mid))";
    return "hsl(var(--viral-low))";
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
      <Card className="glass p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">🔥 {title}</h3>
          <span className="text-sm font-bold" style={{ color: getColor(data.score) }}>{data.score}/10</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="rounded-lg bg-muted/30 p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Format</p>
            <p className="text-xs font-medium text-foreground">{data.formatSimilarity}</p>
          </div>
          <div className="rounded-lg bg-muted/30 p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Hook Pattern</p>
            <p className="text-xs font-medium text-foreground">{data.hookPattern}</p>
          </div>
          <div className="rounded-lg bg-muted/30 p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Structure</p>
            <p className="text-xs font-medium text-foreground">{data.trendingStructure}</p>
          </div>
        </div>

        {data.matchedTrends.length > 0 && (
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Matched Trends</p>
            <div className="flex flex-wrap gap-1.5">
              {data.matchedTrends.map((trend, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-xs text-foreground">{trend}</span>
              ))}
            </div>
          </div>
        )}

        <ul className="space-y-1.5">
          {data.details.map((d, i) => (
            <li key={i} className="text-xs text-muted-foreground">• {d}</li>
          ))}
        </ul>
      </Card>
    </motion.div>
  );
};

export default TrendMatchingCard;
