import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import type { ContentClassification } from "@/lib/types";

interface Props {
  data: ContentClassification;
  thumbnailAnalyzed?: boolean;
}

const categoryIcons: Record<string, string> = {
  education: "📚",
  motivation: "💪",
  comedy: "😂",
  marketing: "📢",
  fitness: "🏋️",
  lifestyle: "🌿",
  cooking: "🍳",
  beauty: "💄",
  tech: "💻",
  gaming: "🎮",
  storytelling: "📖",
  news: "📰",
  other: "🎬",
};

const confidenceColor: Record<string, string> = {
  high: "text-[hsl(var(--viral-high))]",
  medium: "text-[hsl(var(--viral-mid))]",
  low: "text-[hsl(var(--viral-low))]",
};

const ContentClassificationCard = ({ data, thumbnailAnalyzed }: Props) => {
  const icon = categoryIcons[data.primaryCategory?.toLowerCase()] || "🎬";
  const confClass = confidenceColor[data.confidence?.toLowerCase()] || "text-muted-foreground";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
      <Card className="glass p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
            🧠 Content Understanding
          </h3>
          {thumbnailAnalyzed && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium">
              👁️ Vision Analyzed
            </span>
          )}
        </div>

        {/* Category Badge */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-2xl">{icon}</span>
          <div>
            <p className="text-sm font-bold text-foreground capitalize">{data.primaryCategory}</p>
            <p className="text-[11px] text-muted-foreground capitalize">{data.subCategory} • {data.contentType}</p>
          </div>
          <div className="ml-auto">
            <span className={`text-[10px] font-semibold uppercase tracking-wider ${confClass}`}>
              {data.confidence} confidence
            </span>
          </div>
        </div>

        {/* Reasoning */}
        <p className="text-xs text-muted-foreground leading-relaxed">{data.reasoning}</p>

        {/* Detected Elements */}
        {data.detectedElements && (
          <div className="grid grid-cols-2 gap-2">
            {data.detectedElements.scene && (
              <div className="rounded-lg bg-muted/30 p-2.5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">🏠 Scene</p>
                <p className="text-xs font-medium text-foreground mt-0.5">{data.detectedElements.scene}</p>
              </div>
            )}
            {data.detectedElements.people && (
              <div className="rounded-lg bg-muted/30 p-2.5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">👤 People</p>
                <p className="text-xs font-medium text-foreground mt-0.5">{data.detectedElements.people}</p>
              </div>
            )}
            {data.detectedElements.estimatedTopic && (
              <div className="rounded-lg bg-muted/30 p-2.5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">🎯 Topic</p>
                <p className="text-xs font-medium text-foreground mt-0.5">{data.detectedElements.estimatedTopic}</p>
              </div>
            )}
            {data.detectedElements.actions?.length > 0 && (
              <div className="rounded-lg bg-muted/30 p-2.5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">⚡ Actions</p>
                <p className="text-xs font-medium text-foreground mt-0.5">{data.detectedElements.actions.join(", ")}</p>
              </div>
            )}
          </div>
        )}

        {/* Objects & On-Screen Text */}
        {data.detectedElements?.objects?.length > 0 && (
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">🔍 Detected Objects</p>
            <div className="flex flex-wrap gap-1.5">
              {data.detectedElements.objects.map((obj, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-muted/40 text-foreground/80">{obj}</span>
              ))}
            </div>
          </div>
        )}

        {data.detectedElements?.onScreenText?.length > 0 && data.detectedElements.onScreenText[0] !== "" && (
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">📝 On-Screen Text</p>
            <div className="space-y-1">
              {data.detectedElements.onScreenText.map((text, i) => (
                <p key={i} className="text-xs text-foreground/80 italic">"{text}"</p>
              ))}
            </div>
          </div>
        )}

        {/* Hashtag Alignment */}
        {data.hashtagAlignment && (
          <div className="rounded-lg bg-muted/20 p-2.5 border border-border/30">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">🏷️ Hashtag-Content Match</p>
            <p className="text-xs text-foreground/80">{data.hashtagAlignment}</p>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default ContentClassificationCard;
