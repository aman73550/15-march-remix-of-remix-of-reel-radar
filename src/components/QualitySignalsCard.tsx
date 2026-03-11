import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Video, Volume2 } from "lucide-react";
import type { VideoQuality, AudioQuality } from "@/lib/types";

interface Props {
  videoQuality?: VideoQuality;
  audioQuality?: AudioQuality;
}

const getScoreColor = (s: number) => {
  if (s >= 7) return "text-[hsl(var(--viral-high))]";
  if (s >= 4) return "text-[hsl(var(--viral-mid))]";
  return "text-[hsl(var(--viral-low))]";
};

const getBarColor = (s: number) => {
  if (s >= 7) return "hsl(var(--viral-high))";
  if (s >= 4) return "hsl(var(--viral-mid))";
  return "hsl(var(--viral-low))";
};

const QualitySignalsCard = ({ videoQuality, audioQuality }: Props) => {
  if (!videoQuality && !audioQuality) return null;

  const items = [
    ...(videoQuality ? [
      { label: "Resolution", value: videoQuality.resolution },
      { label: "Lighting", value: videoQuality.lighting },
      { label: "Stability", value: videoQuality.cameraStability },
      { label: "Clarity", value: videoQuality.visualClarity },
    ] : []),
  ];

  const audioItems = [
    ...(audioQuality ? [
      { label: "Voice", value: audioQuality.voiceClarity },
      { label: "Background", value: audioQuality.backgroundAudio },
      { label: "Balance", value: audioQuality.soundBalance },
      { label: "Music/Sound", value: audioQuality.musicUsage },
    ] : []),
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
      <Card className="glass p-5 space-y-4">
        <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
          🎬 Production Quality
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Video Quality */}
          {videoQuality && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Video className="w-3.5 h-3.5" />
                  <span>Video Quality</span>
                </div>
                <span className={`text-sm font-bold ${getScoreColor(videoQuality.qualityScore)}`}>
                  {videoQuality.qualityScore}/10
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: getBarColor(videoQuality.qualityScore) }}
                  initial={{ width: 0 }}
                  animate={{ width: `${videoQuality.qualityScore * 10}%` }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                />
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {items.map((item, i) => (
                  <div key={i} className="rounded-md bg-muted/30 px-2.5 py-1.5">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
                    <p className="text-[11px] font-medium text-foreground capitalize">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audio Quality */}
          {audioQuality && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Audio Quality</span>
                </div>
                <span className={`text-sm font-bold ${getScoreColor(audioQuality.qualityScore)}`}>
                  {audioQuality.qualityScore}/10
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: getBarColor(audioQuality.qualityScore) }}
                  initial={{ width: 0 }}
                  animate={{ width: `${audioQuality.qualityScore * 10}%` }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                />
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {audioItems.map((item, i) => (
                  <div key={i} className="rounded-md bg-muted/30 px-2.5 py-1.5">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
                    <p className="text-[11px] font-medium text-foreground capitalize">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default QualitySignalsCard;
