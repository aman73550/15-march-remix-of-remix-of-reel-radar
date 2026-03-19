import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdConfig {
  enabled: boolean;
  ad_code: string | null;
  ad_type: string;
  device_target: string;
  slot_name: string;
}

// Global ad config cache to avoid N+1 queries
let adConfigCache: Map<string, AdConfig | null> = new Map();
let cachePromise: Promise<void> | null = null;

async function loadAllAdConfigs() {
  if (cachePromise) return cachePromise;
  cachePromise = (async () => {
    const { data } = await supabase
      .from("ad_config")
      .select("slot_name, enabled, ad_code, ad_type, device_target");
    if (data) {
      for (const row of data as any[]) {
        adConfigCache.set(row.slot_name, row as AdConfig);
      }
    }
  })();
  return cachePromise;
}

// Track impression
function trackImpression(slotName: string, deviceType: string) {
  const sessionId = sessionStorage.getItem("ad_session") || `ads_${Date.now()}`;
  sessionStorage.setItem("ad_session", sessionId);
  
  supabase.from("ad_impressions" as any).insert({
    slot_name: slotName,
    event_type: "impression",
    device_type: deviceType,
    session_id: sessionId,
  } as any).then(() => {});
}

// Track click
function trackClick(slotName: string) {
  const sessionId = sessionStorage.getItem("ad_session") || "";
  supabase.from("ad_impressions" as any).insert({
    slot_name: slotName,
    event_type: "click",
    session_id: sessionId,
  } as any).then(() => {});
}

// Track error
function trackError(slotName: string, error: string) {
  supabase.from("ad_impressions" as any).insert({
    slot_name: slotName,
    event_type: "error",
    error_message: error.substring(0, 200),
  } as any).then(() => {});
}

// Safe HTML renderer with script execution
const SafeAdRenderer = ({ html, slotName, className = "" }: { html: string; slotName: string; className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !html) return;

    try {
      containerRef.current.innerHTML = html;

      // Execute script tags (needed for AdSense etc.)
      const scripts = containerRef.current.querySelectorAll("script");
      scripts.forEach((oldScript) => {
        const newScript = document.createElement("script");
        Array.from(oldScript.attributes).forEach((attr) =>
          newScript.setAttribute(attr.name, attr.value)
        );
        newScript.textContent = oldScript.textContent;
        oldScript.parentNode?.replaceChild(newScript, oldScript);
      });

      // Sandbox iframes
      const iframes = containerRef.current.querySelectorAll("iframe");
      iframes.forEach((iframe) => {
        if (!iframe.getAttribute("sandbox")) {
          iframe.setAttribute("sandbox", "allow-scripts allow-same-origin allow-popups allow-forms");
        }
      });

      // Track clicks on links
      const links = containerRef.current.querySelectorAll("a");
      links.forEach((link) => {
        if (!link.getAttribute("target")) link.setAttribute("target", "_blank");
        if (!link.getAttribute("rel")) link.setAttribute("rel", "noopener sponsored");
        link.addEventListener("click", () => trackClick(slotName));
      });
    } catch (err: any) {
      trackError(slotName, err.message || "Render error");
    }
  }, [html, slotName]);

  return <div ref={containerRef} className={className} onClick={() => trackClick(slotName)} />;
};

// Standard ad dimensions for Adsterra/AdSense
const SLOT_DIMENSIONS: Record<string, { w: number; h: number; label: string }> = {
  "banner-top": { w: 728, h: 90, label: "Leaderboard" },
  "banner-mid": { w: 728, h: 90, label: "Leaderboard" },
  "banner-bottom": { w: 728, h: 90, label: "Leaderboard" },
  "footer-above": { w: 728, h: 90, label: "Leaderboard" },
  "footer-banner": { w: 468, h: 60, label: "Banner" },
  "sidebar-left": { w: 160, h: 600, label: "Wide Skyscraper" },
  "sidebar-right": { w: 160, h: 600, label: "Wide Skyscraper" },
  "after-score": { w: 336, h: 280, label: "Large Rectangle" },
  "mid-1": { w: 300, h: 250, label: "Medium Rectangle" },
  "mid-2": { w: 300, h: 250, label: "Medium Rectangle" },
  "mid-3": { w: 300, h: 250, label: "Medium Rectangle" },
  "after-charts": { w: 336, h: 280, label: "Large Rectangle" },
  "after-hooks": { w: 300, h: 250, label: "Medium Rectangle" },
  "after-recommendations": { w: 336, h: 280, label: "Large Rectangle" },
  "master-report-below": { w: 336, h: 280, label: "Large Rectangle" },
  "processing-overlay": { w: 300, h: 250, label: "Medium Rectangle" },
  "below-progress": { w: 468, h: 60, label: "Banner" },
  "before-leaderboard": { w: 336, h: 280, label: "Large Rectangle" },
  "before-reviews": { w: 300, h: 250, label: "Medium Rectangle" },
  "share-gate-below": { w: 300, h: 250, label: "Medium Rectangle" },
};

// Placeholder with slot name + dimensions
const AdPlaceholder = ({ slotName = "ad-slot" }: { slotName?: string }) => {
  const dim = SLOT_DIMENSIONS[slotName];
  return (
    <div className="w-full h-full bg-gradient-to-br from-muted/20 via-card to-muted/20 flex flex-col items-center justify-center gap-1 min-h-[60px] border border-dashed border-border/40 rounded">
      <span className="text-[10px] font-mono text-muted-foreground/50">{slotName}</span>
      {dim && (
        <span className="text-[9px] text-muted-foreground/35">{dim.w}×{dim.h} · {dim.label}</span>
      )}
    </div>
  );
};

// Device check
function getDeviceType(): "mobile" | "desktop" {
  return window.innerWidth < 768 ? "mobile" : "desktop";
}

// ============ MAIN COMPONENT ============
interface AdSlotProps {
  slot: string;
  variant?: "banner" | "inline" | "sidebar";
  className?: string;
  showLabel?: boolean;
  lazy?: boolean;
}

export const AdSlot = ({ slot, variant = "inline", className = "", showLabel = true, lazy = true }: AdSlotProps) => {
  const isAdmin = typeof window !== "undefined" && window.location.pathname.startsWith("/bosspage");
  const [ad, setAd] = useState<AdConfig | null | undefined>(undefined);
  const [visible, setVisible] = useState(!lazy);
  const [hasError, setHasError] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const impressionTracked = useRef(false);

  // Lazy loading with IntersectionObserver
  useEffect(() => {
    if (!lazy || visible) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [lazy, visible]);

  // Fetch ad config with fallback to generic pool
  useEffect(() => {
    if (!visible) return;

    const fetchAd = async () => {
      try {
        await loadAllAdConfigs();
        // Try exact slot match first
        let cached = adConfigCache.get(slot) || null;
        // Fallback: if no exact match, use any available enabled ad with code
        if (!cached) {
          for (const [, config] of adConfigCache) {
            if (config && config.enabled && config.ad_code && config.ad_type !== "popup" && config.ad_type !== "popunder") {
              cached = config;
              break;
            }
          }
        }
        setAd(cached);
      } catch {
        setHasError(true);
        trackError(slot, "Failed to fetch ad config");
      }
    };
    fetchAd();
  }, [slot, visible]);

  // Track impression
  useEffect(() => {
    if (ad && ad.enabled && ad.ad_code && visible && !impressionTracked.current) {
      impressionTracked.current = true;
      trackImpression(slot, getDeviceType());
    }
  }, [ad, visible, slot]);

  // Never render ads on admin pages
  if (isAdmin) return null;

  // Not visible yet (lazy)
  if (!visible) {
    return <div ref={sentinelRef} className={`min-h-[50px] ${className}`} />;
  }

  // Loading
  if (ad === undefined) return null;

  // No ad configured — show placeholder with slot info so admin knows where to add ads
  const hasAdCode = ad && ad.enabled && ad.ad_code;

  // Device targeting — only hide if ad exists and targets different device
  const device = getDeviceType();
  if (hasAdCode && ad!.device_target && ad!.device_target !== "both" && ad!.device_target !== device) {
    return null;
  }

  // Error state
  if (hasError) return null;

  const labelText = showLabel ? "Sponsored · Ad" : "Ad";

  if (variant === "sidebar") {
    return (
      <div className={`rounded-lg border border-border bg-card overflow-hidden ${className}`}>
        <div className="text-center text-[9px] text-muted-foreground/50 py-0.5 bg-muted/20 border-b border-border">
          {labelText}
        </div>
        <div className="w-full h-[600px] flex items-center justify-center">
           {hasAdCode ? (
            <SafeAdRenderer html={ad!.ad_code!} slotName={slot} className="w-full h-full" />
          ) : (
            <AdPlaceholder slotName={slot} />
          )}
        </div>
      </div>
    );
  }

  if (variant === "banner") {
    const dim = SLOT_DIMENSIONS[slot];
    const minH = dim ? `${dim.h}px` : "90px";
    return (
      <div className={`w-full relative z-10 ${className}`}>
        <div className="w-full px-0 sm:px-4 sm:max-w-2xl sm:mx-auto">
          <div className="w-full sm:rounded-lg border-y sm:border border-border bg-card overflow-hidden">
            <div className="text-center text-[10px] text-muted-foreground/60 py-0.5 bg-muted/20 border-b border-border">
              {labelText}
            </div>
            <div className="w-full flex items-center justify-center" style={{ minHeight: minH }}>
              {hasAdCode ? (
                <SafeAdRenderer html={ad!.ad_code!} slotName={slot} className="w-full flex items-center justify-center" />
              ) : (
                <AdPlaceholder slotName={slot} />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // inline (default)
  const dimInline = SLOT_DIMENSIONS[slot];
  const minHInline = dimInline ? `${dimInline.h}px` : "250px";
  return (
    <div className={`w-full sm:rounded-lg border-y sm:border border-border bg-card overflow-hidden ${className}`}>
      <div className="text-center text-[10px] text-muted-foreground/50 py-0.5 bg-muted/20 border-b border-border">
        Sponsored
      </div>
      <div className="w-full flex items-center justify-center" style={{ minHeight: minHInline }}>
        {hasAdCode ? (
          <SafeAdRenderer html={ad!.ad_code!} slotName={slot} className="w-full flex items-center justify-center" />
        ) : (
          <AdPlaceholder slotName={slot} />
        )}
      </div>
    </div>
  );
};

// ============ SIDEBAR ADS ============
export const SidebarAds = () => (
  <>
    <div className="hidden xl:block fixed left-0 top-1/2 -translate-y-1/2 z-20 w-[160px] pl-2">
      <AdSlot slot="sidebar-left" variant="sidebar" lazy={false} showLabel={false} />
    </div>
    <div className="hidden xl:block fixed right-0 top-1/2 -translate-y-1/2 z-20 w-[160px] pr-2">
      <AdSlot slot="sidebar-right" variant="sidebar" lazy={false} showLabel={false} />
    </div>
  </>
);

// Invalidate cache (for admin updates)
export function invalidateAdCache() {
  adConfigCache.clear();
  cachePromise = null;
}

export default AdSlot;
