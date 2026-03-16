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

// Placeholder
const AdPlaceholder = ({ label = "Ad Space" }: { label?: string }) => (
  <div className="w-full h-full bg-gradient-to-br from-muted/30 via-card to-muted/30 flex flex-col items-center justify-center gap-2 min-h-[60px]">
    <div className="w-10 h-10 rounded-xl gradient-primary-bg opacity-20" />
    <span className="text-[9px] text-muted-foreground/40">{label}</span>
  </div>
);

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

  // Fetch ad config
  useEffect(() => {
    if (!visible) return;

    const fetchAd = async () => {
      try {
        await loadAllAdConfigs();
        const cached = adConfigCache.get(slot) || null;
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

  // Not visible yet (lazy)
  if (!visible) {
    return <div ref={sentinelRef} className={`min-h-[50px] ${className}`} />;
  }

  // Loading
  if (ad === undefined) return null;

  // Disabled or null
  if (ad === null || !ad.enabled) return null;

  // Device targeting
  const device = getDeviceType();
  if (ad.device_target && ad.device_target !== "both") {
    if (ad.device_target !== device) return null;
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
          {ad.ad_code ? (
            <SafeAdRenderer html={ad.ad_code} slotName={slot} className="w-full h-full" />
          ) : (
            <AdPlaceholder label={slot} />
          )}
        </div>
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div className={`w-full relative z-10 ${className}`}>
        <div className="w-full px-0 sm:px-4 sm:max-w-2xl sm:mx-auto">
          <div className="w-full sm:rounded-lg border-y sm:border border-border bg-card overflow-hidden">
            <div className="text-center text-[10px] text-muted-foreground/60 py-0.5 bg-muted/20 border-b border-border">
              {labelText}
            </div>
            <div className="w-full aspect-video sm:h-[120px] sm:aspect-auto flex items-center justify-center">
              {ad.ad_code ? (
                <SafeAdRenderer html={ad.ad_code} slotName={slot} className="w-full h-full flex items-center justify-center" />
              ) : (
                <AdPlaceholder label={slot} />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // inline (default)
  return (
    <div className={`w-full sm:rounded-lg border-y sm:border border-border bg-card overflow-hidden ${className}`}>
      <div className="text-center text-[10px] text-muted-foreground/50 py-0.5 bg-muted/20 border-b border-border">
        Sponsored
      </div>
      <div className="w-full aspect-[16/7] sm:h-[80px] sm:aspect-auto flex items-center justify-center">
        {ad.ad_code ? (
          <SafeAdRenderer html={ad.ad_code} slotName={slot} className="w-full h-full flex items-center justify-center" />
        ) : (
          <AdPlaceholder label={slot} />
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
