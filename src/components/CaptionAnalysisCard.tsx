import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import type { CaptionAnalysis } from "@/lib/types";

interface Props {
  data: CaptionAnalysis;
  title: string;
}

const CaptionAnalysisCard = ({ data, title }: Props) => {
  const getColor = (s: number) => {
    if (s >= 7) return "hsl(var(--viral-high))";
    if (s >= 4) return "hsl(var(--viral-mid))";
    return "hsl(var(--viral-low))";
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <Card className="glass p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">✍️ {title}</h3>
          <span className="text-sm font-bold" style={{ color: getColor(data.score) }}>{data.score}/10</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-muted/30 p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Curiosity Level</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ background: getColor(data.curiosityLevel) }} initial={{ width: 0 }} animate={{ width: `${data.curiosityLevel * 10}%` }} transition={{ duration: 1 }} />
              </div>
              <span className="text-xs font-bold text-foreground">{data.curiosityLevel}/10</span>
            </div>
          </div>
          <div className="rounded-lg bg-muted/30 p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Call to Action</p>
            <p className="text-xs font-medium text-foreground">{data.callToAction}</p>
          </div>
          <div className="rounded-lg bg-muted/30 p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Keyword Density</p>
            <p className="text-xs font-medium text-foreground">{data.keywordDensity}</p>
          </div>
          <div className="rounded-lg bg-muted/30 p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Length</p>
            <p className="text-xs font-medium text-foreground">{data.lengthEffectiveness}</p>
          </div>
        </div>

        {data.emotionalTriggers.length > 0 && (
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Emotional Triggers</p>
            <div className="flex flex-wrap gap-1.5">
              {data.emotionalTriggers.map((trigger, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-xs text-foreground">{trigger}</span>
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

export default CaptionAnalysisCard;
