import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Zap, AlertTriangle, Clock, RefreshCw, Loader2, Save } from "lucide-react";

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

const TRIGGER_META = [
  {
    key: "server_load" as const,
    label: "⚠️ High Server Load Message",
    desc: "Shows server busy message to create demand perception",
    icon: AlertTriangle,
    preview: "Currently many creators are analyzing reels...",
  },
  {
    key: "queue_simulation" as const,
    label: "📊 Analysis Queue Simulation",
    desc: "Shows queued position to create urgency",
    icon: Clock,
    preview: "Your analysis is queued due to high demand...",
  },
  {
    key: "retry_prompt" as const,
    label: "🔄 Temporary Retry Prompt",
    desc: "Shows temporary unavailable message",
    icon: RefreshCw,
    preview: "Analysis service temporarily unavailable...",
  },
  {
    key: "trend_refresh" as const,
    label: "📡 Trend Data Refresh Delay",
    desc: "Shows trend refresh loading message",
    icon: Loader2,
    preview: "Refreshing trending reel signals...",
  },
];

export default function AdminBehaviourSettings() {
  const [settings, setSettings] = useState<BehaviourSettings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
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
    setLoaded(true);
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from("site_config")
        .select("id")
        .eq("config_key", "behaviour_settings")
        .maybeSingle();

      const payload = { config_key: "behaviour_settings", config_value: JSON.stringify(settings), updated_at: new Date().toISOString() };

      if (existing) {
        await supabase.from("site_config").update(payload as any).eq("config_key", "behaviour_settings");
      } else {
        await supabase.from("site_config").insert(payload as any);
      }
      toast.success("Behaviour settings saved!");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const updateTrigger = (key: keyof BehaviourSettings, field: keyof TriggerConfig, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  if (!loaded) return null;

  const frustrationLabel: Record<FrustrationLevel, string> = {
    low: "🟢 Low (~10% users)",
    medium: "🟡 Medium (~20% users)",
    high: "🔴 High (~30% users)",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" /> Behaviour Triggers
          </h2>
          <p className="text-[10px] text-muted-foreground mt-1">
            Smart prompts that create demand perception. After 1 trigger → next attempt always succeeds (reward loop).
          </p>
        </div>
      </div>

      {/* Global Frustration Level */}
      <Card className="border-border bg-card">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <Label className="text-xs font-semibold text-foreground">Global Frustration Level</Label>
              <p className="text-[10px] text-muted-foreground">Controls how often random triggers fire for ALL triggers</p>
            </div>
            <div className="flex gap-1.5">
              {(["low", "medium", "high"] as FrustrationLevel[]).map((level) => {
                const isActive = Object.values(settings).every(s => s.frustrationLevel === level);
                return (
                  <button
                    key={level}
                    onClick={() => {
                      setSettings(prev => {
                        const next = { ...prev };
                        for (const k of Object.keys(next) as (keyof BehaviourSettings)[]) {
                          next[k] = { ...next[k], frustrationLevel: level };
                        }
                        return next;
                      });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-all ${
                      isActive
                        ? "gradient-primary-bg text-primary-foreground shadow-glow"
                        : "bg-muted/30 text-muted-foreground border border-border hover:border-primary/30"
                    }`}
                  >
                    {frustrationLabel[level]}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Triggers */}
      {TRIGGER_META.map(({ key, label, desc, icon: Icon, preview }) => {
        const config = settings[key];
        return (
          <Card key={key} className="border-border bg-card overflow-hidden">
            <CardHeader className="px-4 sm:px-6 py-3 sm:py-4 pb-0">
              <CardTitle className="flex items-center gap-2 text-xs sm:text-sm">
                <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                {label}
              </CardTitle>
              <p className="text-[10px] text-muted-foreground">{desc}</p>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 py-3 sm:py-4 space-y-3">
              {/* Preview */}
              <div className="rounded-lg bg-muted/20 border border-border/50 p-2.5 text-[10px] text-muted-foreground italic">
                💬 "{preview}"
              </div>

              {/* Mode Selection */}
              <div className="space-y-1.5">
                <Label className="text-[10px] sm:text-xs text-muted-foreground">Trigger Mode</Label>
                <div className="flex gap-1.5">
                  {(["disable", "random", "always"] as TriggerMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => updateTrigger(key, "mode", mode)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-all flex-1 ${
                        config.mode === mode
                          ? mode === "disable"
                            ? "bg-muted text-foreground border border-border"
                            : mode === "random"
                            ? "bg-accent/20 text-accent border border-accent/30"
                            : "gradient-primary-bg text-primary-foreground"
                          : "bg-muted/20 text-muted-foreground border border-border/50 hover:border-border"
                      }`}
                    >
                      {mode === "disable" ? "🚫 Disable" : mode === "random" ? "🎲 Random" : "✅ Always"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Display Type */}
              {config.mode !== "disable" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] sm:text-xs text-muted-foreground">Display Style</Label>
                    <select
                      value={config.displayType}
                      onChange={(e) => updateTrigger(key, "displayType", e.target.value)}
                      className="w-full h-8 px-2 rounded-md bg-muted/50 border border-border text-foreground text-xs"
                    >
                      <option value="card">📋 Card Message</option>
                      <option value="popup">💬 Popup Prompt</option>
                      <option value="inline">📝 Inline Notification</option>
                      <option value="bottom-bar">📌 Bottom Alert Bar</option>
                    </select>
                  </div>

                  {/* Per-trigger Frustration Level */}
                  <div className="space-y-1.5">
                    <Label className="text-[10px] sm:text-xs text-muted-foreground">Frustration Level (this trigger)</Label>
                    <div className="flex gap-1.5">
                      {(["low", "medium", "high"] as FrustrationLevel[]).map((level) => (
                        <button
                          key={level}
                          onClick={() => updateTrigger(key, "frustrationLevel", level)}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-medium flex-1 transition-all ${
                            config.frustrationLevel === level
                              ? level === "low"
                                ? "bg-[hsl(var(--viral-high))]/20 text-[hsl(var(--viral-high))] border border-[hsl(var(--viral-high))]/30"
                                : level === "medium"
                                ? "bg-accent/20 text-accent border border-accent/30"
                                : "bg-primary/20 text-primary border border-primary/30"
                              : "bg-muted/20 text-muted-foreground border border-border/50"
                          }`}
                        >
                          {frustrationLabel[level]}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Save Button */}
      <Button
        onClick={saveSettings}
        disabled={saving}
        className="w-full h-10 gradient-primary-bg text-primary-foreground font-semibold text-sm"
      >
        {saving ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
        ) : (
          <><Save className="w-4 h-4 mr-2" /> Save Behaviour Settings</>
        )}
      </Button>
    </div>
  );
}
