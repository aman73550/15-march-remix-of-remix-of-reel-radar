import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ExternalLink, Play } from "lucide-react";

interface ReelPreviewProps {
  url: string;
}

const getReelId = (url: string): string | null => {
  // Match /reel/XXXX or /reels/XXXX
  const match = url.match(/\/(reel|reels)\/([A-Za-z0-9_-]+)/);
  return match ? match[2] : null;
};

const ReelPreview = ({ url }: ReelPreviewProps) => {
  const reelId = getReelId(url);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
    >
      <Card className="glass overflow-hidden">
        <div className="p-3 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full gradient-primary-bg flex items-center justify-center">
              <Play className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="text-xs font-medium text-foreground truncate max-w-[180px]">
              Instagram Reel
            </span>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {reelId ? (
          <div className="relative w-full" style={{ paddingBottom: "125%" }}>
            <iframe
              src={`https://www.instagram.com/reel/${reelId}/embed/`}
              className="absolute inset-0 w-full h-full border-0"
              allowFullScreen
              loading="lazy"
              title="Instagram Reel Preview"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-3">
              <Play className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              Reel preview will appear here
            </p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-xs text-primary hover:underline flex items-center gap-1"
            >
              Open on Instagram <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default ReelPreview;
