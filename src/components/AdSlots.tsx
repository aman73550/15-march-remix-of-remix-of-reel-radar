import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

// === BANNER AD (full-width, responsive, video-preferred) ===
interface BannerAdProps {
  slot?: string;
  className?: string;
}

export const BannerAd = ({ slot = "banner", className = "" }: BannerAdProps) => (
  <div className={`w-full relative z-10 ${className}`}>
    <div className="w-full px-0 sm:px-4 sm:max-w-2xl sm:mx-auto">
      <div className="w-full sm:rounded-lg border-y sm:border border-border bg-card overflow-hidden">
        <div className="text-center text-[10px] text-muted-foreground/60 py-0.5 bg-muted/20 border-b border-border">
          Sponsored · Ad
        </div>
        <div
          className="w-full aspect-video sm:h-[120px] sm:aspect-auto flex items-center justify-center"
          data-ad-slot={slot}
          data-ad-format="video"
          id={`ad-${slot}`}
        >
          {/* Replace with real video ad code (Google AdSense video, etc.) */}
          <div className="w-full h-full bg-gradient-to-br from-muted/30 via-card to-muted/30 flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 sm:w-10 sm:h-10 rounded-xl gradient-primary-bg opacity-20" />
            <span className="text-xs text-muted-foreground/40">Video Ad Space</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// === INTERSTITIAL AD (fullscreen overlay, closeable, video-focused) ===
interface InterstitialAdProps {
  show: boolean;
  onClose: () => void;
}

export const InterstitialAd = ({ show, onClose }: InterstitialAdProps) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="relative w-full h-full sm:w-[90vw] sm:max-w-lg sm:h-auto mx-auto flex flex-col sm:block"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 sm:-top-3 sm:-right-3 z-10 w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Mobile: full screen video ad */}
            <div className="flex-1 sm:rounded-xl border-0 sm:border border-border bg-card overflow-hidden sm:shadow-2xl flex flex-col">
              <div className="text-center text-xs text-muted-foreground py-1.5 bg-muted/30 border-b border-border">
                Sponsored · Ad
              </div>
              <div
                className="flex-1 sm:h-[400px] w-full flex items-center justify-center"
                data-ad-slot="interstitial"
                data-ad-format="video"
                id="ad-interstitial"
              >
                {/* Replace with real video ad */}
                <div className="w-full h-full bg-gradient-to-br from-muted/30 via-card to-muted/30 flex flex-col items-center justify-center gap-3">
                  <div className="w-20 h-20 sm:w-16 sm:h-16 rounded-2xl gradient-primary-bg opacity-20" />
                  <span className="text-sm text-muted-foreground/50">Video Ad</span>
                  <span className="text-xs text-muted-foreground/30">Full Screen · Video Preferred</span>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground/50 py-3 sm:mt-3 sm:py-0">
              Click ✕ to continue to your results
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// === INLINE AD (between content sections, full-width, video-preferred) ===
interface InlineAdProps {
  slot?: string;
}

export const InlineAd = ({ slot = "inline" }: InlineAdProps) => (
  <div className="w-full sm:rounded-lg border-y sm:border border-border bg-card overflow-hidden">
    <div className="text-center text-[10px] text-muted-foreground/50 py-0.5 bg-muted/20 border-b border-border">
      Sponsored
    </div>
    <div
      className="w-full aspect-[16/7] sm:h-[80px] sm:aspect-auto flex items-center justify-center"
      data-ad-slot={slot}
      data-ad-format="video"
      id={`ad-${slot}`}
    >
      <div className="w-full h-full bg-gradient-to-r from-muted/20 via-card to-muted/20 flex items-center justify-center">
        <span className="text-[10px] text-muted-foreground/40">Video Ad</span>
      </div>
    </div>
  </div>
);
