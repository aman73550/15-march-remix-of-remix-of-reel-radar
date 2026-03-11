import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import type { HashtagAnalysis } from "@/lib/types";

interface Props {
  data: HashtagAnalysis;
  title: string;
}

const getTagColor = (level: string) => {
  const l = level.toLowerCase();
  if (l === "high" || l === "strong") return "hsl(var(--viral-high))";
  if (l === "medium" || l === "moderate") return "hsl(var(--viral-mid))";
  return "hsl(var(--viral-low))";
};

const HashtagAnalysisCard = ({ data, title }: Props) => {
  const getColor = (s: number) => {
    if (s >= 7) return "hsl(var(--viral-high))";
    if (s >= 4) return "hsl(var(--viral-mid))";
    return "hsl(var(--viral-low))";
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
      <Card className="glass p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">#️⃣ {title}</h3>
          <span className="text-sm font-bold" style={{ color: getColor(data.score) }}>{data.score}/10</span>
        </div>

        {data.hashtags.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground text-[10px] uppercase tracking-wider">
                  <th className="text-left pb-2 font-medium">Hashtag</th>
                  <th className="text-center pb-2 font-medium">Competition</th>
                  <th className="text-center pb-2 font-medium">Relevance</th>
                  <th className="text-center pb-2 font-medium">Trend</th>
                </tr>
              </thead>
              <tbody>
                {data.hashtags.map((h, i) => (
                  <motion.tr key={i} className="border-t border-border/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.05 }}>
                    <td className="py-1.5 text-foreground font-medium">{h.tag}</td>
                    <td className="py-1.5 text-center">
                      <span className="px-1.5 py-0.5 rounded text-[10px]" style={{ color: getTagColor(h.competition) }}>{h.competition}</span>
                    </td>
                    <td className="py-1.5 text-center">
                      <span className="px-1.5 py-0.5 rounded text-[10px]" style={{ color: getTagColor(h.relevance) }}>{h.relevance}</span>
                    </td>
                    <td className="py-1.5 text-center">
                      <span className="px-1.5 py-0.5 rounded text-[10px]" style={{ color: getTagColor(h.trendStrength) }}>{h.trendStrength}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
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

export default HashtagAnalysisCard;
