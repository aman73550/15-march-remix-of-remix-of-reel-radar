import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, X, TrendingUp, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

const LastAnalysisButton = () => {
  const { user, lastAnalysis } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user || !lastAnalysis) return null;

  const score = lastAnalysis.viral_score || 0;
  const reelUrl = lastAnalysis.reel_url || "";
  const maskedUrl = reelUrl.length > 40
    ? reelUrl.substring(0, 30) + "..." + reelUrl.substring(reelUrl.length - 10)
    : reelUrl;
  const createdAt = new Date(lastAnalysis.created_at).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed top-20 right-3 z-40 flex items-center gap-1.5 px-3 py-2 rounded-full bg-card border border-border shadow-lg text-xs font-medium text-foreground hover:border-primary/40 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <History className="w-3.5 h-3.5 text-primary" />
        <span className="hidden sm:inline">Last Analysis</span>
        <span className="sm:hidden">Last</span>
      </motion.button>

      {/* Popup */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-start justify-end p-4 pt-24 sm:pt-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div className="absolute inset-0 bg-background/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.div
              className="relative z-10 w-full max-w-xs"
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
            >
              <Card className="p-4 border border-border bg-card shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <History className="w-4 h-4 text-primary" />
                    Last Analysis
                  </h3>
                  <button onClick={() => setOpen(false)} className="p-1 rounded-full hover:bg-muted">
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>

                {/* Score */}
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                    score >= 80 ? "bg-[hsl(var(--viral-high))]/10 text-[hsl(var(--viral-high))]" :
                    score >= 60 ? "bg-primary/10 text-primary" :
                    "bg-amber-500/10 text-amber-500"
                  }`}>
                    {score}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground truncate font-mono">{maskedUrl}</p>
                    <p className="text-[10px] text-muted-foreground/60">{createdAt}</p>
                  </div>
                </div>

                {/* Quick stats from analysis_data */}
                {lastAnalysis.analysis_data && (
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Hook", val: lastAnalysis.analysis_data?.hookAnalysis?.score },
                      { label: "Caption", val: lastAnalysis.analysis_data?.captionAnalysis?.score },
                      { label: "Hashtag", val: lastAnalysis.analysis_data?.hashtagAnalysis?.score },
                    ].filter(s => s.val != null).map((s, i) => (
                      <div key={i} className="text-center p-2 rounded-lg bg-muted/30">
                        <p className="text-xs font-bold text-foreground">{s.val}</p>
                        <p className="text-[9px] text-muted-foreground">{s.label}</p>
                      </div>
                    ))}
                  </div>
                )}

                <a
                  href={reelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open Reel
                </a>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LastAnalysisButton;
