import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

// === BANNER AD (inline, non-overlapping) ===
interface BannerAdProps {
  slot?: string;
  className?: string;
}

export const BannerAd = ({ slot = "banner", className = "" }: BannerAdProps) => (
  <div className={`w-full relative z-10 ${className}`}>
    <div className="max-w-2xl mx-auto px-4">
      <div className="w-full rounded-lg border border-border bg-muted/30 overflow-hidden">
        {/* Replace this div with your real ad code (e.g. Google AdSense) */}
        <div
          className="w-full flex items-center justify-center text-muted-foreground text-xs py-1 bg-muted/20"
        >
          Ad
        </div>
        <div
          className="w-full h-[90px] sm:h-[100px] flex items-center justify-center"
          data-ad-slot={slot}
          id={`ad-${slot}`}
        >
          {/* 
            Replace with real ad code, e.g.:
            <ins className="adsbygoogle" style={{ display: "block" }}
              data-ad-client="ca-pub-XXXXXXXX"
              data-ad-slot="XXXXXXXX"
              data-ad-format="auto"
              data-full-width-responsive="true" />
          */}
          <div className="w-full h-full rounded-b-lg bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40 flex items-center justify-center">
            <span className="text-xs text-muted-foreground/50">Advertisement Space</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// === INTERSTITIAL AD (fullscreen overlay, closeable) ===
interface InterstitialAdProps {
  show: boolean;
  onClose: () => void;
}

export const InterstitialAd = ({ show, onClose }: InterstitialAdProps) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="relative w-[90vw] max-w-md mx-auto"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xl">
              <div className="text-center text-xs text-muted-foreground py-1.5 bg-muted/30 border-b border-border">
                Sponsored · Ad
              </div>
              <div
                className="w-full h-[300px] sm:h-[350px] flex items-center justify-center"
                data-ad-slot="interstitial"
                id="ad-interstitial"
              >
                {/* 
                  Replace with real ad code here 
                */}
                <div className="w-full h-full bg-gradient-to-br from-muted/30 via-card to-muted/30 flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-2xl gradient-primary-bg opacity-20" />
                  <span className="text-sm text-muted-foreground/50">Your Ad Here</span>
                  <span className="text-xs text-muted-foreground/30">300×250 or 300×350</span>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground/50 mt-3">
              Click ✕ to continue to your results
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// === INLINE AD (between content sections) ===
interface InlineAdProps {
  slot?: string;
}

export const InlineAd = ({ slot = "inline" }: InlineAdProps) => (
  <div className="w-full rounded-lg border border-border bg-muted/20 overflow-hidden">
    <div className="text-center text-[10px] text-muted-foreground/50 py-0.5 bg-muted/20">
      Sponsored
    </div>
    <div
      className="w-full h-[70px] flex items-center justify-center"
      data-ad-slot={slot}
      id={`ad-${slot}`}
    >
      <div className="w-full h-full bg-gradient-to-r from-muted/20 via-muted/10 to-muted/20 flex items-center justify-center">
        <span className="text-[10px] text-muted-foreground/40">Ad</span>
      </div>
    </div>
  </div>
);
