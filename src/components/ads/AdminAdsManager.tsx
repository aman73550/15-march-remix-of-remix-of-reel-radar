import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Megaphone, Plus, BarChart3, CheckCircle2, AlertTriangle, XCircle, MinusCircle } from "lucide-react";
import { invalidateAdCache } from "./AdSlot";

interface AdSlotRow {
  id: string;
  slot_name: string;
  enabled: boolean;
  ad_code: string | null;
  ad_type: string;
  ad_name: string | null;
  device_target: string;
  trigger_type: string | null;
  frequency_limit: string | null;
}

interface AdStats {
  slot_name: string;
  impressions: number;
  clicks: number;
  errors: number;
}

const AD_TYPE_OPTIONS = [
  { value: "custom", label: "Custom HTML" },
  { value: "adsense", label: "Display Banner (AdSense)" },
  { value: "affiliate", label: "Affiliate Banner" },
  { value: "native", label: "Native Ad" },
  { value: "popup", label: "Popup Ad" },
  { value: "popunder", label: "Popunder" },
  { value: "social_bar", label: "Social Bar" },
  { value: "sticky", label: "Sticky Banner" },
  { value: "video", label: "Video Ad" },
];

const DEVICE_OPTIONS = [
  { value: "both", label: "Both" },
  { value: "mobile", label: "Mobile Only" },
  { value: "desktop", label: "Desktop Only" },
];

const SLOT_LABELS: Record<string, { label: string; group: string }> = {
  "banner-top": { label: "🔝 Top Banner", group: "Homepage" },
  "banner-mid": { label: "📍 Mid Banner", group: "Homepage" },
  "banner-bottom": { label: "⬇️ Bottom Banner", group: "Homepage" },
  "sidebar-left": { label: "◀️ Left Sidebar", group: "Homepage" },
  "sidebar-right": { label: "▶️ Right Sidebar", group: "Homepage" },
  "processing-overlay": { label: "⏳ Processing Overlay", group: "Processing" },
  "below-progress": { label: "📊 Below Progress", group: "Processing" },
  "report-progress-below": { label: "📊 Report Progress Below", group: "Report" },
  "report-processing-bottom": { label: "⬇️ Report Bottom", group: "Report" },
  "after-score": { label: "🎯 After Score", group: "Results" },
  "mid-1": { label: "📊 Mid-1", group: "Results" },
  "after-charts": { label: "📈 After Charts", group: "Results" },
  "after-hooks": { label: "🪝 After Hooks", group: "Results" },
  "mid-2": { label: "📊 Mid-2", group: "Results" },
  "mid-3": { label: "📊 Mid-3", group: "Results" },
  "after-recommendations": { label: "💡 After Recs", group: "Results" },
  "master-report-below": { label: "👑 Master Report Below", group: "Results" },
  "seo-input-below": { label: "🔍 SEO Input Below", group: "SEO" },
  "seo-processing-top": { label: "⏳ SEO Process Top", group: "SEO" },
  "seo-processing-mid": { label: "⏳ SEO Process Mid", group: "SEO" },
  "seo-processing-bottom": { label: "⏳ SEO Process Bottom", group: "SEO" },
  "seo-results-mid": { label: "📊 SEO Results Mid", group: "SEO" },
  "seo-results-bottom": { label: "📊 SEO Results Bottom", group: "SEO" },
  "before-leaderboard": { label: "🏆 Before Leaderboard", group: "Footer" },
  "before-reviews": { label: "💬 Before Reviews", group: "Footer" },
  "footer-above": { label: "📌 Above Footer", group: "Footer" },
  "footer-banner": { label: "🔻 Footer Banner", group: "Footer" },
  "share-gate-below": { label: "🔒 Share Gate Below", group: "Footer" },
};

const AD_TEMPLATES = [
  { name: "Google AdSense", type: "adsense", code: '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXX" crossorigin="anonymous"></script>\n<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-XXXXXXX" data-ad-slot="XXXXXXX" data-ad-format="auto" data-full-width-responsive="true"></ins>\n<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>' },
  { name: "Affiliate Banner", type: "affiliate", code: '<a href="YOUR_LINK" target="_blank" rel="noopener sponsored">\n  <img src="YOUR_BANNER_URL" alt="Ad" style="width:100%;height:auto;border-radius:8px;" />\n</a>' },
  { name: "Custom CTA", type: "custom", code: '<div style="background:linear-gradient(135deg,#1a1a2e,#16213e);padding:16px;border-radius:12px;text-align:center;">\n  <p style="color:#e94560;font-weight:bold;font-size:14px;margin:0 0 8px;">🔥 Special Offer!</p>\n  <a href="YOUR_LINK" target="_blank" rel="noopener sponsored" style="background:#e94560;color:white;padding:8px 20px;border-radius:8px;text-decoration:none;font-size:12px;font-weight:bold;">Grab Deal →</a>\n</div>' },
];

export const AdminAdsManager = () => {
  const [adSlots, setAdSlots] = useState<AdSlotRow[]>([]);
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [slotDraft, setSlotDraft] = useState({ ad_type: "custom", ad_code: "", device_target: "both", trigger_type: "", frequency_limit: "once_per_session" });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSlot, setNewSlot] = useState({ ad_name: "", slot_name: "", ad_type: "custom", ad_code: "", device_target: "both", trigger_type: "", frequency_limit: "once_per_session" });
  const [adStats, setAdStats] = useState<AdStats[]>([]);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    loadSlots();
  }, []);

  const loadSlots = async () => {
    const { data } = await supabase.from("ad_config").select("*").order("slot_name");
    if (data) setAdSlots(data as any[]);
  };

  const loadStats = async () => {
    const { data } = await supabase.from("ad_impressions" as any)
      .select("slot_name, event_type")
      .gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString());
    
    if (!data) return;

    const statsMap: Record<string, AdStats> = {};
    for (const row of data as any[]) {
      if (!statsMap[row.slot_name]) {
        statsMap[row.slot_name] = { slot_name: row.slot_name, impressions: 0, clicks: 0, errors: 0 };
      }
      if (row.event_type === "impression") statsMap[row.slot_name].impressions++;
      else if (row.event_type === "click") statsMap[row.slot_name].clicks++;
      else if (row.event_type === "error") statsMap[row.slot_name].errors++;
    }
    setAdStats(Object.values(statsMap).sort((a, b) => b.impressions - a.impressions));
    setShowStats(true);
  };

  const toggleAd = async (id: string, enabled: boolean) => {
    const { error } = await supabase.from("ad_config")
      .update({ enabled, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) { toast.error("Failed to update"); return; }
    setAdSlots(prev => prev.map(s => s.id === id ? { ...s, enabled } : s));
    invalidateAdCache();
    toast.success(`Ad ${enabled ? "enabled" : "disabled"}`);
  };

  const saveSlot = async (id: string) => {
    const { error } = await supabase.from("ad_config").update({
      ad_type: slotDraft.ad_type,
      ad_code: slotDraft.ad_code || null,
      device_target: slotDraft.device_target,
      trigger_type: slotDraft.trigger_type || null,
      frequency_limit: slotDraft.frequency_limit || "once_per_session",
      updated_at: new Date().toISOString(),
    } as any).eq("id", id);
    if (error) { toast.error("Failed to save"); return; }
    setAdSlots(prev => prev.map(s => s.id === id ? { ...s, ...slotDraft, ad_code: slotDraft.ad_code || null } : s));
    setEditingSlot(null);
    invalidateAdCache();
    toast.success("Ad deployed! 🚀");
  };

  const clearSlot = async (id: string) => {
    const { error } = await supabase.from("ad_config").update({ ad_code: null, updated_at: new Date().toISOString() } as any).eq("id", id);
    if (error) { toast.error("Failed to clear"); return; }
    setAdSlots(prev => prev.map(s => s.id === id ? { ...s, ad_code: null } : s));
    setEditingSlot(null);
    invalidateAdCache();
    toast.success("Ad cleared!");
  };

  const addNewSlot = async () => {
    if (!newSlot.slot_name.trim()) { toast.error("Slot name required"); return; }
    const slotKey = newSlot.slot_name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const { error } = await supabase.from("ad_config").insert({
      slot_name: slotKey,
      ad_name: newSlot.ad_name || slotKey,
      ad_type: newSlot.ad_type,
      ad_code: newSlot.ad_code || null,
      device_target: newSlot.device_target,
      trigger_type: newSlot.trigger_type || null,
      frequency_limit: newSlot.frequency_limit || "once_per_session",
      enabled: true,
    } as any);
    if (error) { toast.error("Failed to add slot: " + error.message); return; }
    await loadSlots();
    invalidateAdCache();
    setShowAddForm(false);
    setNewSlot({ ad_name: "", slot_name: "", ad_type: "custom", ad_code: "", device_target: "both", trigger_type: "", frequency_limit: "once_per_session" });
    toast.success("New ad slot created! 🎉");
  };

  const getHealth = (slot: AdSlotRow): { status: string; color: string; icon: any } => {
    if (!slot.enabled) return { status: "Disabled", color: "text-muted-foreground", icon: MinusCircle };
    const stat = adStats.find(s => s.slot_name === slot.slot_name);
    if (stat?.errors && stat.errors > 0) return { status: "Script Error", color: "text-destructive", icon: XCircle };
    if (!slot.ad_code) return { status: "No Code", color: "text-[hsl(var(--viral-mid))]", icon: AlertTriangle };
    if (stat && stat.impressions > 0) return { status: "Working", color: "text-[hsl(var(--viral-high))]", icon: CheckCircle2 };
    return { status: "Not Rendering", color: "text-[hsl(var(--viral-mid))]", icon: AlertTriangle };
  };

  // Group slots
  const grouped: Record<string, AdSlotRow[]> = {};
  adSlots.forEach(slot => {
    const meta = SLOT_LABELS[slot.slot_name];
    const group = meta?.group || "Custom";
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(slot);
  });

  return (
    <Card className="border-border bg-card">
      <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
            <Megaphone className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" />
            Ad Slots ({adSlots.filter(s => s.enabled).length}/{adSlots.length} active)
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-7 text-[10px] sm:text-xs" onClick={loadStats}>
              <BarChart3 className="w-3 h-3 mr-1" /> Stats
            </Button>
            <Button size="sm" className="h-7 text-[10px] sm:text-xs gradient-primary-bg text-primary-foreground" onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="w-3 h-3 mr-1" /> Add More Ads
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4">
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-primary/10 p-2 text-center">
            <p className="text-lg font-bold text-primary">{adSlots.filter(s => s.ad_code).length}</p>
            <p className="text-[9px] text-muted-foreground">With Code</p>
          </div>
          <div className="rounded-lg bg-accent/10 p-2 text-center">
            <p className="text-lg font-bold text-accent">{adSlots.filter(s => s.enabled).length}</p>
            <p className="text-[9px] text-muted-foreground">Enabled</p>
          </div>
          <div className="rounded-lg bg-secondary/10 p-2 text-center">
            <p className="text-lg font-bold text-secondary">{adSlots.filter(s => ["popup", "popunder"].includes(s.ad_type)).length}</p>
            <p className="text-[9px] text-muted-foreground">Popup/Under</p>
          </div>
        </div>

        {/* Performance Stats Panel */}
        {showStats && adStats.length > 0 && (
          <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
            <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-primary" /> Ad Performance (7 days)
            </h4>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <div className="text-center">
                <p className="text-sm font-bold text-foreground">{adStats.reduce((s, a) => s + a.impressions, 0)}</p>
                <p className="text-[9px] text-muted-foreground">Impressions</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-foreground">{adStats.reduce((s, a) => s + a.clicks, 0)}</p>
                <p className="text-[9px] text-muted-foreground">Clicks</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-foreground">
                  {(() => {
                    const imp = adStats.reduce((s, a) => s + a.impressions, 0);
                    const clk = adStats.reduce((s, a) => s + a.clicks, 0);
                    return imp > 0 ? ((clk / imp) * 100).toFixed(1) + "%" : "0%";
                  })()}
                </p>
                <p className="text-[9px] text-muted-foreground">CTR</p>
              </div>
            </div>
            <div className="space-y-1 max-h-[200px] overflow-auto">
              {adStats.slice(0, 10).map((s) => (
                <div key={s.slot_name} className="flex items-center justify-between text-[10px] px-2 py-1 rounded bg-background/50">
                  <span className="text-foreground truncate max-w-[140px]">{SLOT_LABELS[s.slot_name]?.label || s.slot_name}</span>
                  <div className="flex gap-3 text-muted-foreground">
                    <span>{s.impressions} imp</span>
                    <span>{s.clicks} clk</span>
                    {s.errors > 0 && <span className="text-destructive">{s.errors} err</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Slot Form */}
        {showAddForm && (
          <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4 space-y-3">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" /> Add New Ad Slot
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Ad Name</Label>
                <Input value={newSlot.ad_name} onChange={(e) => setNewSlot(p => ({ ...p, ad_name: e.target.value }))} placeholder="My Ad" className="h-8 text-xs bg-background" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Slot Position (key)</Label>
                <Input value={newSlot.slot_name} onChange={(e) => setNewSlot(p => ({ ...p, slot_name: e.target.value }))} placeholder="custom-slot-1" className="h-8 text-xs bg-background" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Ad Type</Label>
                <select value={newSlot.ad_type} onChange={(e) => setNewSlot(p => ({ ...p, ad_type: e.target.value }))} className="w-full h-8 px-2 rounded-md bg-background border border-border text-foreground text-xs">
                  {AD_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Device Target</Label>
                <select value={newSlot.device_target} onChange={(e) => setNewSlot(p => ({ ...p, device_target: e.target.value }))} className="w-full h-8 px-2 rounded-md bg-background border border-border text-foreground text-xs">
                  {DEVICE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
            {(newSlot.ad_type === "popup" || newSlot.ad_type === "popunder") && (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Trigger</Label>
                  <select value={newSlot.trigger_type} onChange={(e) => setNewSlot(p => ({ ...p, trigger_type: e.target.value }))} className="w-full h-8 px-2 rounded-md bg-background border border-border text-foreground text-xs">
                    <option value="interaction">On User Interaction</option>
                    <option value="immediate">After Delay (3s)</option>
                    <option value="exit_intent">On Exit Intent</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Frequency</Label>
                  <select value={newSlot.frequency_limit} onChange={(e) => setNewSlot(p => ({ ...p, frequency_limit: e.target.value }))} className="w-full h-8 px-2 rounded-md bg-background border border-border text-foreground text-xs">
                    <option value="once_per_session">Once per session</option>
                    <option value="once_per_day">Once per day</option>
                    <option value="always">Always</option>
                  </select>
                </div>
              </div>
            )}
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Ad Code (HTML/JS)</Label>
              <Textarea value={newSlot.ad_code} onChange={(e) => setNewSlot(p => ({ ...p, ad_code: e.target.value }))} placeholder="Paste your ad code here..." rows={4} className="text-xs font-mono bg-background" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={() => setShowAddForm(false)}>Cancel</Button>
              <Button size="sm" className="flex-1 h-8 text-xs gradient-primary-bg text-primary-foreground" onClick={addNewSlot}>Create Slot</Button>
            </div>
          </div>
        )}

        {/* Grouped Slots */}
        {Object.entries(grouped).map(([group, slots]) => (
          <div key={group}>
            <h4 className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              {group}
            </h4>
            <div className="space-y-1.5">
              {slots.map((slot) => {
                const isEditing = editingSlot === slot.id;
                const meta = SLOT_LABELS[slot.slot_name];
                const health = getHealth(slot);
                const HealthIcon = health.icon;
                return (
                  <div key={slot.id} className="rounded-lg bg-muted/30 border border-border overflow-hidden">
                    <div className="flex items-center justify-between p-2 sm:p-2.5 gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Label className="text-[10px] sm:text-xs text-foreground truncate">{meta?.label || slot.ad_name || slot.slot_name}</Label>
                        {slot.ad_code && (
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-medium ${slot.ad_type === "adsense" ? "bg-primary/20 text-primary" : slot.ad_type === "popup" || slot.ad_type === "popunder" ? "bg-destructive/20 text-destructive" : "bg-secondary/20 text-secondary"}`}>
                            {AD_TYPE_OPTIONS.find(o => o.value === slot.ad_type)?.label || slot.ad_type}
                          </span>
                        )}
                        {showStats && <HealthIcon className={`w-3 h-3 ${health.color} flex-shrink-0`} />}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" onClick={() => {
                          if (isEditing) { setEditingSlot(null); } else { 
                            setEditingSlot(slot.id); 
                            setSlotDraft({ 
                              ad_type: slot.ad_type || "custom", 
                              ad_code: slot.ad_code || "", 
                              device_target: slot.device_target || "both",
                              trigger_type: slot.trigger_type || "",
                              frequency_limit: slot.frequency_limit || "once_per_session",
                            }); 
                          }
                        }}>
                          {isEditing ? "Cancel" : "Edit"}
                        </Button>
                        <Switch checked={slot.enabled} onCheckedChange={(checked) => toggleAd(slot.id, checked)} />
                      </div>
                    </div>
                    {isEditing && (
                      <div className="px-2.5 sm:px-3 pb-3 space-y-2 border-t border-border pt-2">
                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground">⚡ Quick Templates</Label>
                          <div className="flex gap-1.5 flex-wrap">
                            {AD_TEMPLATES.map((tpl) => (
                              <button key={tpl.name} onClick={() => setSlotDraft(p => ({ ...p, ad_type: tpl.type, ad_code: tpl.code }))} className="px-2 py-1 rounded-md text-[9px] font-medium bg-muted/40 border border-border hover:border-primary/40 hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-all">
                                {tpl.name}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground">Ad Type</Label>
                            <select value={slotDraft.ad_type} onChange={(e) => setSlotDraft(p => ({ ...p, ad_type: e.target.value }))} className="w-full h-8 px-2 rounded-md bg-muted/50 border border-border text-foreground text-xs">
                              {AD_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground">Device</Label>
                            <select value={slotDraft.device_target} onChange={(e) => setSlotDraft(p => ({ ...p, device_target: e.target.value }))} className="w-full h-8 px-2 rounded-md bg-muted/50 border border-border text-foreground text-xs">
                              {DEVICE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                          </div>
                        </div>
                        {(slotDraft.ad_type === "popup" || slotDraft.ad_type === "popunder") && (
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label className="text-[10px] text-muted-foreground">Trigger</Label>
                              <select value={slotDraft.trigger_type} onChange={(e) => setSlotDraft(p => ({ ...p, trigger_type: e.target.value }))} className="w-full h-8 px-2 rounded-md bg-muted/50 border border-border text-foreground text-xs">
                                <option value="interaction">On Interaction</option>
                                <option value="immediate">After Delay</option>
                                <option value="exit_intent">Exit Intent</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] text-muted-foreground">Frequency</Label>
                              <select value={slotDraft.frequency_limit} onChange={(e) => setSlotDraft(p => ({ ...p, frequency_limit: e.target.value }))} className="w-full h-8 px-2 rounded-md bg-muted/50 border border-border text-foreground text-xs">
                                <option value="once_per_session">Once/session</option>
                                <option value="once_per_day">Once/day</option>
                                <option value="always">Always</option>
                              </select>
                            </div>
                          </div>
                        )}
                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground">Ad Code</Label>
                          <textarea value={slotDraft.ad_code} onChange={(e) => setSlotDraft(p => ({ ...p, ad_code: e.target.value }))} rows={4} className="w-full px-2 py-1.5 rounded-md bg-muted/50 border border-border text-foreground text-xs font-mono resize-y min-h-[80px]" />
                        </div>
                        {slotDraft.ad_code && (
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground">👁️ Preview</Label>
                            <div className="rounded-lg border border-border bg-background p-2 max-h-[120px] overflow-auto">
                              <div dangerouslySetInnerHTML={{ __html: slotDraft.ad_code.replace(/<script[\s\S]*?<\/script>/gi, '<p style="color:#888;font-size:10px;">[Script executes on live site]</p>') }} />
                            </div>
                          </div>
                        )}
                        <div className="flex gap-2">
                          {slot.ad_code && (
                            <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={() => clearSlot(slot.id)}>🗑️ Clear</Button>
                          )}
                          <Button size="sm" className="flex-1 h-8 text-xs gradient-primary-bg text-primary-foreground" onClick={() => saveSlot(slot.id)}>🚀 Deploy</Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AdminAdsManager;
