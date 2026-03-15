import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, RefreshCw, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type TriggerMode = "disable" | "random" | "always";
type DisplayType = "card" | "popup" | "inline" | "bottom-bar";
type FrustrationLevel = "low" | "medium" | "high";

interface TriggerConfig {
  mode: TriggerMode;
  displayType: DisplayType;
  frustrationLevel: FrustrationLevel;
}

interface BehaviourSettings {
  server_load: TriggerConfig;
  queue_simulation: TriggerConfig;
  retry_prompt: TriggerConfig;
  trend_refresh: TriggerConfig;
}

const DEFAULT_SETTINGS: BehaviourSettings = {
  server_load: { mode: "disable", displayType: "popup", frustrationLevel: "low" },
  queue_simulation: { mode: "disable", displayType: "card", frustrationLevel: "low" },
  retry_prompt: { mode: "disable", displayType: "popup", frustrationLevel: "low" },
  trend_refresh: { mode: "disable", displayType: "card", frustrationLevel: "low" },
};

const TRIGGER_MESSAGES: Record<string, string[]> = {
  server_load: [
    "Currently many creators are analyzing reels. Please try again shortly.",
    "Server is currently processing many requests.",
    "High demand detected, please retry shortly.",
    "Our servers are experiencing heavy traffic right now.",
  ],
  queue_simulation: [
    "Your analysis is queued due to high demand.",
    "Analysis queue is busy right now. Estimated wait: 2-3 min.",
    "You're #12 in queue. Many creators analyzing right now.",
    "High volume detected — your request is in queue.",
  ],
  retry_prompt: [
    "Analysis service temporarily unavailable. Please try again later.",
    "Our analysis models are being updated. Please retry in a moment.",
    "Temporary processing delay. Service will resume shortly.",
    "System maintenance in progress. Please try again.",
  ],
  trend_refresh: [
    "Refreshing trending reel signals. Please wait a moment.",
    "Updating viral trend database... this may take a few seconds.",
    "Syncing latest trending audio & hashtag data...",
    "Calibrating models with latest viral patterns...",
  ],
};

const TRIGGER_BUTTONS: Record<string, { primary: string; secondary: string; tertiary: string }> = {
  server_load: { primary: "Try Again", secondary: "Try after some time", tertiary: "Server busy, retry shortly" },
  queue_simulation: { primary: "Wait for Report", secondary: "Retry Later", tertiary: "Check again after some time" },
  retry_prompt: { primary: "Retry Now", secondary: "Try after sometime", tertiary: "Return to Homepage" },
  trend_refresh: { primary: "Continue Analysis", secondary: "Try again later", tertiary: "Check after some time" },
};

const TRIGGER_ICONS: Record<string, typeof AlertTriangle> = {
  server_load: AlertTriangle,
  queue_simulation: Clock,
  retry_prompt: RefreshCw,
  trend_refresh: Loader2,
};

// Session key to track if user already saw a trigger this session
const SESSION_KEY = "behaviour_trigger_shown";

function getFrustrationChance(level: FrustrationLevel): number {
  switch (level) {
    case "low": return 0.10;
    case "medium": return 0.20;
    case "high": return 0.30;
  }
}

function shouldTrigger(config: TriggerConfig): boolean {
  if (config.mode === "disable") return false;
  if (config.mode === "always") return true;
  // Random mode - check if already shown this session (reward loop)
  const shown = sessionStorage.getItem(SESSION_KEY);
  if (shown === "true") return false; // After 1 error, next attempt always succeeds
  return Math.random() < getFrustrationChance(config.frustrationLevel);
}

function getRandomMessage(trigger: string): string {
  const msgs = TRIGGER_MESSAGES[trigger];
  return msgs[Math.floor(Math.random() * msgs.length)];
}

// Hook to load behaviour settings
export function useBehaviourSettings() {
  const [settings, setSettings] = useState<BehaviourSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("site_config")
        .select("config_key, config_value")
        .eq("config_key", "behaviour_settings")
        .maybeSingle();
      if (data) {
        try {
          setSettings(JSON.parse((data as any).config_value));
        } catch {}
      }
    };
    load();
  }, []);

  return settings;
}

// Main hook: returns a function to check triggers before analysis
export function useBehaviourTrigger() {
  const settings = useBehaviourSettings();
  const [activeTrigger, setActiveTrigger] = useState<{ trigger: string; message: string; displayType: DisplayType } | null>(null);

  const checkTriggers = useCallback((): boolean => {
    // Check triggers in order of priority
    const triggers = ["server_load", "queue_simulation", "retry_prompt", "trend_refresh"] as const;
    for (const t of triggers) {
      const config = settings[t];
      if (shouldTrigger(config)) {
        setActiveTrigger({
          trigger: t,
          message: getRandomMessage(t),
          displayType: config.displayType,
        });
        // Mark that we showed a trigger this session (reward loop)
        sessionStorage.setItem(SESSION_KEY, "true");
        return true; // Block the analysis
      }
    }
    return false; // Allow analysis
  }, [settings]);

  const dismissTrigger = useCallback(() => {
    setActiveTrigger(null);
  }, []);

  return { activeTrigger, checkTriggers, dismissTrigger };
}

// UI Components
interface TriggerDisplayProps {
  trigger: string;
  message: string;
  displayType: DisplayType;
  onDismiss: () => void;
  onRetry: () => void;
}

export function BehaviourTriggerDisplay({ trigger, message, displayType, onDismiss, onRetry }: TriggerDisplayProps) {
  const Icon = TRIGGER_ICONS[trigger] || AlertTriangle;
  const buttons = TRIGGER_BUTTONS[trigger] || TRIGGER_BUTTONS.server_load;

  if (displayType === "card") return <CardTrigger icon={Icon} message={message} buttons={buttons} onDismiss={onDismiss} onRetry={onRetry} />;
  if (displayType === "popup") return <PopupTrigger icon={Icon} message={message} buttons={buttons} onDismiss={onDismiss} onRetry={onRetry} />;
  if (displayType === "inline") return <InlineTrigger icon={Icon} message={message} buttons={buttons} onDismiss={onDismiss} onRetry={onRetry} />;
  if (displayType === "bottom-bar") return <BottomBarTrigger icon={Icon} message={message} buttons={buttons} onDismiss={onDismiss} onRetry={onRetry} />;
  return null;
}

interface TriggerUIProps {
  icon: typeof AlertTriangle;
  message: string;
  buttons: { primary: string; secondary: string; tertiary: string };
  onDismiss: () => void;
  onRetry: () => void;
}

function CardTrigger({ icon: Icon, message, buttons, onDismiss, onRetry }: TriggerUIProps) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-background/60 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onDismiss}
      >
        <motion.div onClick={(e) => e.stopPropagation()} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
          <Card className="glass p-5 sm:p-6 max-w-sm w-full space-y-4 border-primary/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Please Wait</h3>
                <p className="text-xs text-muted-foreground mt-1">{message}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Button onClick={onRetry} className="w-full h-9 gradient-primary-bg text-primary-foreground text-xs">{buttons.primary}</Button>
              <Button onClick={onDismiss} variant="outline" className="w-full h-8 text-xs border-border">{buttons.secondary}</Button>
              <button onClick={onDismiss} className="w-full text-[10px] text-muted-foreground hover:text-foreground transition-colors py-1">{buttons.tertiary}</button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function PopupTrigger({ icon: Icon, message, buttons, onDismiss, onRetry }: TriggerUIProps) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/70 backdrop-blur-md"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl relative"
          initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 20 }}
        >
          <button onClick={onDismiss} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Icon className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-bold text-foreground text-base">High Demand Detected</h3>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
          <div className="mt-5 space-y-2">
            <Button onClick={onRetry} className="w-full h-10 gradient-primary-bg text-primary-foreground text-sm font-semibold">{buttons.primary}</Button>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={onDismiss} variant="outline" className="h-9 text-xs border-border">{buttons.secondary}</Button>
              <Button onClick={onDismiss} variant="ghost" className="h-9 text-xs">{buttons.tertiary}</Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function InlineTrigger({ icon: Icon, message, buttons, onDismiss, onRetry }: TriggerUIProps) {
  return (
    <motion.div
      className="max-w-xl mx-auto px-3 sm:px-4 pb-4"
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
    >
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary flex-shrink-0" />
          <p className="text-xs text-foreground font-medium">{message}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onRetry} size="sm" className="h-8 text-xs gradient-primary-bg text-primary-foreground">{buttons.primary}</Button>
          <Button onClick={onDismiss} size="sm" variant="outline" className="h-8 text-xs border-border">{buttons.secondary}</Button>
        </div>
      </div>
    </motion.div>
  );
}

function BottomBarTrigger({ icon: Icon, message, buttons, onDismiss, onRetry }: TriggerUIProps) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-[100] bg-card border-t border-border shadow-2xl px-4 py-3"
        initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
      >
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <p className="text-xs text-foreground flex-1">{message}</p>
          <div className="flex gap-2 flex-shrink-0">
            <Button onClick={onRetry} size="sm" className="h-8 text-xs gradient-primary-bg text-primary-foreground">{buttons.primary}</Button>
            <Button onClick={onDismiss} size="sm" variant="ghost" className="h-8 text-xs">
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default BehaviourTriggerDisplay;
