import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import type { HookAnalysis as HookAnalysisType } from "@/lib/types";

interface Props {
  data: HookAnalysisType;
  title: string;
}

const HookAnalysisCard = ({ data, title }: Props) => {
  const getScoreColor = (s: number) => {
    if (s >= 7) return "hsl(var(--viral-high))";
    if (s >= 4) return "hsl(var(--viral-mid))";
    return "hsl(var(--viral-low))";
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <Card className="glass p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">🎣 {title}</h3>
          <span className="text-sm font-bold" style={{ color: getScoreColor(data.score) }}>{data.score}/10</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="rounded-lg bg-muted/30 p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Opening Type</p>
            <p className="text-xs font-medium text-foreground">{data.openingType}</p>
          </div>
          <div className="rounded-lg bg-muted/30 p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Attention Grabber</p>
            <p className="text-xs font-medium text-foreground">{data.attentionGrabber}</p>
          </div>
          <div className="rounded-lg bg-muted/30 p-3 sm:col-span-1 col-span-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">First 3 Seconds</p>
            <p className="text-xs font-medium text-foreground">{data.firstThreeSeconds}</p>
          </div>
        </div>

        <ul className="space-y-1.5">
          {data.details.map((d, i) => (
            <motion.li key={i} className="text-xs text-muted-foreground" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
              • {d}
            </motion.li>
          ))}
        </ul>
      </Card>
    </motion.div>
  );
};

export default HookAnalysisCard;
