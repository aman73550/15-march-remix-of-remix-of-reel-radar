import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Hook to fetch ad config for a slot
function useAdSlot(slotName: string) {
  const [ad, setAd] = useState<{ enabled: boolean; ad_code: string | null; ad_type: string } | null>(null);

  useEffect(() => {
    supabase
      .from("ad_config")
      .select("enabled, ad_code, ad_type")
      .eq("slot_name", slotName)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setAd(data as any);
      });
  }, [slotName]);

  return ad;
}

// Renders ad HTML safely (supports script tags for AdSense)
const AdRenderer = ({ html, className = "" }: { html: string; className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !html) return;
    containerRef.current.innerHTML = html;

    // Execute any script tags (needed for AdSense)
    const scripts = containerRef.current.querySelectorAll("script");
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) =>
        newScript.setAttribute(attr.name, attr.value)
      );
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [html]);

  return <div ref={containerRef} className={className} />;
};

// Placeholder when no ad code is set
const AdPlaceholder = ({ label = "Ad Space" }: { label?: string }) => (
  <div className="w-full h-full bg-gradient-to-br from-muted/30 via-card to-muted/30 flex flex-col items-center justify-center gap-2">
    <div className="w-12 h-12 sm:w-10 sm:h-10 rounded-xl gradient-primary-bg opacity-20" />
    <span className="text-xs text-muted-foreground/40">{label}</span>
  </div>
);

// === BANNER AD ===
interface BannerAdProps {
  slot?: string;
  className?: string;
}

export const BannerAd = ({ slot = "banner", className = "" }: BannerAdProps) => {
  const ad = useAdSlot(slot === "banner" ? "banner-top" : slot.startsWith("banner-") ? slot : `banner-${slot}`);

  if (ad && !ad.enabled) return null;

  return (
    <div className={`w-full relative z-10 ${className}`}>
      <div className="w-full px-0 sm:px-4 sm:max-w-2xl sm:mx-auto">
        <div className="w-full sm:rounded-lg border-y sm:border border-border bg-card overflow-hidden">
          <div className="text-center text-[10px] text-muted-foreground/60 py-0.5 bg-muted/20 border-b border-border">
            Sponsored · Ad
          </div>
          <div className="w-full aspect-video sm:h-[120px] sm:aspect-auto flex items-center justify-center">
            {ad?.ad_code ? (
              <AdRenderer html={ad.ad_code} className="w-full h-full flex items-center justify-center" />
            ) : (
              <AdPlaceholder label="Banner Ad" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// === INTERSTITIAL AD ===
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
            <button
              onClick={onClose}
              className="absolute top-3 right-3 sm:-top-3 sm:-right-3 z-10 w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex-1 sm:rounded-xl border-0 sm:border border-border bg-card overflow-hidden sm:shadow-2xl flex flex-col">
              <div className="text-center text-xs text-muted-foreground py-1.5 bg-muted/30 border-b border-border">
                Sponsored · Ad
              </div>
              <div className="flex-1 sm:h-[400px] w-full flex items-center justify-center">
                <AdPlaceholder label="Interstitial Ad" />
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

// === INLINE AD ===
interface InlineAdProps {
  slot?: string;
}

export const InlineAd = ({ slot = "inline" }: InlineAdProps) => {
  const slotName = slot.startsWith("banner-") ? slot : `banner-${slot}`;
  const ad = useAdSlot(slotName);

  if (ad && !ad.enabled) return null;

  return (
    <div className="w-full sm:rounded-lg border-y sm:border border-border bg-card overflow-hidden">
      <div className="text-center text-[10px] text-muted-foreground/50 py-0.5 bg-muted/20 border-b border-border">
        Sponsored
      </div>
      <div className="w-full aspect-[16/7] sm:h-[80px] sm:aspect-auto flex items-center justify-center">
        {ad?.ad_code ? (
          <AdRenderer html={ad.ad_code} className="w-full h-full flex items-center justify-center" />
        ) : (
          <AdPlaceholder label="Inline Ad" />
        )}
      </div>
    </div>
  );
};

// === SIDEBAR ADS ===
export const SidebarAds = () => {
  const leftAd = useAdSlot("sidebar-left");
  const rightAd = useAdSlot("sidebar-right");

  return (
    <>
      {(!leftAd || leftAd.enabled) && (
        <div className="hidden xl:block fixed left-0 top-1/2 -translate-y-1/2 z-20 w-[160px] pl-2">
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="text-center text-[9px] text-muted-foreground/50 py-0.5 bg-muted/20 border-b border-border">
              Ad
            </div>
            <div className="w-full h-[600px] flex items-center justify-center">
              {leftAd?.ad_code ? (
                <AdRenderer html={leftAd.ad_code} className="w-full h-full" />
              ) : (
                <AdPlaceholder label="Sidebar Ad" />
              )}
            </div>
          </div>
        </div>
      )}

      {(!rightAd || rightAd.enabled) && (
        <div className="hidden xl:block fixed right-0 top-1/2 -translate-y-1/2 z-20 w-[160px] pr-2">
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="text-center text-[9px] text-muted-foreground/50 py-0.5 bg-muted/20 border-b border-border">
              Ad
            </div>
            <div className="w-full h-[600px] flex items-center justify-center">
              {rightAd?.ad_code ? (
                <AdRenderer html={rightAd.ad_code} className="w-full h-full" />
              ) : (
                <AdPlaceholder label="Sidebar Ad" />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
