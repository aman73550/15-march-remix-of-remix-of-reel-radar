import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import type { VideoSignals } from "@/lib/types";

interface Props {
  data: VideoSignals;
  title: string;
}

const VideoSignalsCard = ({ data, title }: Props) => {
  const signals = [
    { label: "Scene Cuts", value: data.estimatedSceneCuts, icon: "🎬" },
    { label: "Text Overlay", value: data.textOverlayLikely, icon: "📝" },
    { label: "Face Presence", value: data.facePresenceLikely, icon: "👤" },
    { label: "Motion", value: data.motionIntensity, icon: "💫" },
    { label: "Visual Engagement", value: data.visualEngagement, icon: "👁️" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
      <Card className="glass p-5 space-y-4">
        <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">🎥 {title}</h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {signals.map((s, i) => (
            <motion.div
              key={i}
              className="rounded-lg bg-muted/30 p-3 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.08 }}
            >
              <span className="text-lg">{s.icon}</span>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{s.label}</p>
              <p className="text-xs font-medium text-foreground mt-0.5">{s.value}</p>
            </motion.div>
          ))}
        </div>

        <ul className="space-y-1.5">
          {data.details.map((d, i) => (
            <li key={i} className="text-xs text-muted-foreground">• {d}</li>
          ))}
        </ul>
      </Card>
    </motion.div>
  );
};

export default VideoSignalsCard;
