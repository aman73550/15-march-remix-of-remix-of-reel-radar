import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PopupAdConfig {
  slot_name: string;
  ad_code: string | null;
  ad_type: string;
  enabled: boolean;
  trigger_type: string | null;
  frequency_limit: string | null;
  device_target: string;
}

const SESSION_KEY_PREFIX = "popup_shown_";

function hasSeenInSession(slotName: string): boolean {
  return sessionStorage.getItem(`${SESSION_KEY_PREFIX}${slotName}`) === "true";
}

function markSeenInSession(slotName: string) {
  sessionStorage.setItem(`${SESSION_KEY_PREFIX}${slotName}`, "true");
}

function trackPopupEvent(slotName: string, eventType: string) {
  supabase.from("ad_impressions" as any).insert({
    slot_name: slotName,
    event_type: eventType,
    device_type: window.innerWidth < 768 ? "mobile" : "desktop",
    session_id: sessionStorage.getItem("ad_session") || "",
  } as any).then(() => {});
}

// Prevent duplicate global script injection
const injectedScripts = new Set<string>();

const PopupAdRenderer = ({ html, slotName }: { html: string; slotName: string }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !html) return;
    ref.current.innerHTML = html;
    const scripts = ref.current.querySelectorAll("script");
    scripts.forEach((old) => {
      const src = old.getAttribute("src") || old.textContent || "";
      const key = src.substring(0, 200);
      if (injectedScripts.has(key)) { old.remove(); return; }
      injectedScripts.add(key);
      const s = document.createElement("script");
      Array.from(old.attributes).forEach((a) => s.setAttribute(a.name, a.value));
      s.textContent = old.textContent;
      old.parentNode?.replaceChild(s, old);
    });
    ref.current.querySelectorAll("a").forEach((link) => {
      if (!link.getAttribute("target")) link.setAttribute("target", "_blank");
      if (!link.getAttribute("rel")) link.setAttribute("rel", "noopener sponsored");
      link.addEventListener("click", () => trackPopupEvent(slotName, "click"));
    });
  }, [html, slotName]);

  return <div ref={ref} className="w-full" />;
};

export const PopupAdOverlay = () => {
  const [popupAd, setPopupAd] = useState<PopupAdConfig | null>(null);
  const [show, setShow] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    // Skip ads on admin pages
    if (window.location.pathname.startsWith("/bosspage")) return;
    if (loadedRef.current) return;
    loadedRef.current = true;

    const loadPopupAds = async () => {
      const { data } = await supabase
        .from("ad_config")
        .select("slot_name, ad_code, ad_type, enabled, trigger_type, frequency_limit, device_target")
        .in("ad_type", ["popup", "popunder"])
        .eq("enabled", true);
      
      if (!data || data.length === 0) return;
      const device = window.innerWidth < 768 ? "mobile" : "desktop";

      for (const ad of data as any[]) {
        const config = ad as PopupAdConfig;
        if (!config.ad_code) continue;
        if (config.device_target && config.device_target !== "both" && config.device_target !== device) continue;
        if (hasSeenInSession(config.slot_name)) continue;

        if (config.ad_type === "popup") {
          setPopupAd(config);
          const triggerType = config.trigger_type || "interaction";
          if (triggerType === "immediate") {
            setTimeout(() => {
              setShow(true);
              markSeenInSession(config.slot_name);
              trackPopupEvent(config.slot_name, "impression");
            }, 3000);
          } else {
            const handler = () => {
              setShow(true);
              markSeenInSession(config.slot_name);
              trackPopupEvent(config.slot_name, "impression");
              document.removeEventListener("click", handler);
              document.removeEventListener("scroll", handler);
            };
            setTimeout(() => {
              document.addEventListener("click", handler, { once: true });
              document.addEventListener("scroll", handler, { once: true });
            }, 5000);
          }
          break;
        }

        if (config.ad_type === "popunder") {
          const handlePopunder = () => {
            if (hasSeenInSession(config.slot_name)) return;
            markSeenInSession(config.slot_name);
            trackPopupEvent(config.slot_name, "impression");
            const w = window.open("about:blank", "_blank");
            if (w && config.ad_code) {
              w.document.write(`<!DOCTYPE html><html><head><title>Sponsored</title></head><body style="margin:0;padding:20px;background:#111;color:#fff;font-family:sans-serif;">${config.ad_code}</body></html>`);
              w.document.close();
              window.focus();
            }
            document.removeEventListener("click", handlePopunder);
          };

          const handleExitIntent = (e: MouseEvent) => {
            if (e.clientY <= 0) {
              handlePopunder();
              document.removeEventListener("mouseleave", handleExitIntent);
            }
          };

          setTimeout(() => {
            document.addEventListener("click", handlePopunder, { once: true });
            if (device === "desktop") {
              document.addEventListener("mouseleave", handleExitIntent as any);
            }
          }, 8000);
          break;
        }
      }
    };

    loadPopupAds();
  }, []);

  const handleClose = useCallback(() => {
    setShow(false);
    if (popupAd) trackPopupEvent(popupAd.slot_name, "close");
  }, [popupAd]);

  return (
    <AnimatePresence>
      {show && popupAd && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-background/90 backdrop-blur-md p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-md sm:max-w-lg mx-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
          >
            <button
              onClick={handleClose}
              className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xl">
              <div className="text-center text-xs text-muted-foreground py-1.5 bg-muted/30 border-b border-border">
                Sponsored · Ad
              </div>
              <div className="p-4 min-h-[200px] flex items-center justify-center">
                <PopupAdRenderer html={popupAd.ad_code!} slotName={popupAd.slot_name} />
              </div>
            </div>
            <p className="text-center text-xs text-muted-foreground/50 mt-3">
              Click ✕ to close
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PopupAdOverlay;
