import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Shield, LogOut, BarChart3, Megaphone, TrendingUp, Users, Eye, Calendar, CreditCard, Settings, IndianRupee, MessageCircle, FileText, Menu, X, Star, Crown, Loader2, Download } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, today: 0, week: 0, month: 0 });
  const [paidStats, setPaidStats] = useState({ total: 0, revenue: 0, today: 0, todayRevenue: 0, pending: 0 });
  const [adSlots, setAdSlots] = useState<{ id: string; slot_name: string; enabled: boolean; ad_code: string | null; ad_type: string }[]>([]);
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [slotDraft, setSlotDraft] = useState<{ ad_type: string; ad_code: string }>({ ad_type: "custom", ad_code: "" });
  const [recentUrls, setRecentUrls] = useState<{ reel_url: string; created_at: string }[]>([]);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [config, setConfig] = useState<Record<string, string>>({});
  const [savingConfig, setSavingConfig] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [feedbackStats, setFeedbackStats] = useState({ total: 0, avg: 0, distribution: [0, 0, 0, 0, 0] });
  const [recentFeedback, setRecentFeedback] = useState<any[]>([]);
  const [adminReelUrl, setAdminReelUrl] = useState("");
  const [adminGenerating, setAdminGenerating] = useState(false);
  const [adminReportData, setAdminReportData] = useState<{ analysis: any; premium: any } | null>(null);

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  const checkAdminAndLoad = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/admin-login"); return; }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin");

    if (!roles || roles.length === 0) {
      await supabase.auth.signOut();
      navigate("/admin-login");
      return;
    }

    await Promise.all([loadStats(), loadAdConfig(), loadRecentUsage(), loadConfig(), loadPaidStats(), loadRecentReports(), loadFeedback()]);
    setLoading(false);
  };

  const loadStats = async () => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now.getTime() - 7 * 86400000).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [total, today, week, month] = await Promise.all([
      supabase.from("usage_logs").select("id", { count: "exact", head: true }),
      supabase.from("usage_logs").select("id", { count: "exact", head: true }).gte("created_at", todayStart),
      supabase.from("usage_logs").select("id", { count: "exact", head: true }).gte("created_at", weekStart),
      supabase.from("usage_logs").select("id", { count: "exact", head: true }).gte("created_at", monthStart),
    ]);

    setStats({
      total: total.count || 0,
      today: today.count || 0,
      week: week.count || 0,
      month: month.count || 0,
    });
  };

  const loadPaidStats = async () => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    const [allPaid, todayPaid, pending] = await Promise.all([
      supabase.from("paid_reports" as any).select("amount, status").in("status", ["paid", "completed"]),
      supabase.from("paid_reports" as any).select("amount, status").in("status", ["paid", "completed"]).gte("created_at", todayStart),
      supabase.from("paid_reports" as any).select("id", { count: "exact", head: true }).eq("status", "pending"),
    ]);

    const allData = (allPaid.data || []) as any[];
    const todayData = (todayPaid.data || []) as any[];

    setPaidStats({
      total: allData.length,
      revenue: allData.reduce((s: number, r: any) => s + (Number(r.amount) || 0), 0),
      today: todayData.length,
      todayRevenue: todayData.reduce((s: number, r: any) => s + (Number(r.amount) || 0), 0),
      pending: pending.count || 0,
    });
  };

  const loadRecentReports = async () => {
    const { data } = await supabase
      .from("paid_reports" as any)
      .select("id, reel_url, amount, status, created_at, payment_gateway")
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) setRecentReports(data as any[]);
  };

  const loadConfig = async () => {
    const { data } = await supabase.from("site_config" as any).select("config_key, config_value");
    if (data) {
      const c: Record<string, string> = {};
      for (const row of data as any[]) c[row.config_key] = row.config_value;
      setConfig(c);
    }
  };

  const loadAdConfig = async () => {
    const { data } = await supabase.from("ad_config").select("*").order("slot_name");
    if (data) setAdSlots(data);
  };

  const loadRecentUsage = async () => {
    const { data } = await supabase
      .from("usage_logs")
      .select("reel_url, created_at")
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) setRecentUrls(data);
  };

  const toggleAd = async (id: string, enabled: boolean) => {
    const { error } = await supabase
      .from("ad_config")
      .update({ enabled, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) { toast.error("Failed to update ad slot"); return; }
    setAdSlots(prev => prev.map(s => s.id === id ? { ...s, enabled } : s));
    toast.success(`Ad slot ${enabled ? "enabled" : "disabled"}`);
  };

  const updateConfig = (key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const saveConfig = async () => {
    setSavingConfig(true);
    try {
      for (const [key, value] of Object.entries(config)) {
        const { data: existing } = await supabase
          .from("site_config" as any)
          .select("id")
          .eq("config_key", key)
          .single();
        if (existing) {
          await supabase
            .from("site_config" as any)
            .update({ config_value: value, updated_at: new Date().toISOString() })
            .eq("config_key", key);
        } else {
          await supabase
            .from("site_config" as any)
            .insert({ config_key: key, config_value: value } as any);
        }
      }
      toast.success("Configuration saved!");
    } catch {
      toast.error("Failed to save configuration");
    } finally {
      setSavingConfig(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin-login");
  };

  const loadFeedback = async () => {
    const { data } = await supabase.from("feedback" as any).select("*").order("created_at", { ascending: false }).limit(20);
    if (!data) return;
    const all = data as any[];
    setRecentFeedback(all.slice(0, 10));
    const dist = [0, 0, 0, 0, 0];
    let sum = 0;
    for (const f of all) {
      dist[f.rating - 1]++;
      sum += f.rating;
    }
    setFeedbackStats({
      total: all.length,
      avg: all.length ? Math.round((sum / all.length) * 10) / 10 : 0,
      distribution: dist,
    });
  };

  const handleAdminGenerateReport = async () => {
    if (!adminReelUrl.trim()) { toast.error("Enter a reel URL"); return; }
    setAdminGenerating(true);
    setAdminReportData(null);
    try {
      // Step 1: Analyze the reel
      const { data: analysisData, error: analysisErr } = await supabase.functions.invoke("analyze-reel", {
        body: { url: adminReelUrl.trim() },
      });
      if (analysisErr || !analysisData?.success) throw new Error(analysisData?.error || "Analysis failed");

      const analysis = analysisData.analysis;

      // Step 2: Generate master report (no payment needed)
      const { data: reportData, error: reportErr } = await supabase.functions.invoke("generate-master-report", {
        body: { reportId: null, analysisData: analysis, reelUrl: adminReelUrl.trim() },
      });
      if (reportErr || !reportData?.success) throw new Error(reportData?.error || "Report generation failed");

      setAdminReportData({ analysis, premium: reportData.premiumAnalysis });
      toast.success("Master Report generated! 🎉");
    } catch (err: any) {
      console.error("Admin report error:", err);
      toast.error(err.message || "Failed to generate report");
    } finally {
      setAdminGenerating(false);
    }
  };

  const handleAdminDownloadTxt = () => {
    if (!adminReportData) return;
    const { analysis, premium } = adminReportData;
    const lines: string[] = [];
    lines.push("═══════════════════════════════════════════");
    lines.push("       MASTER VIRAL ANALYSIS REPORT");
    lines.push("       Admin Generated — No Payment");
    lines.push("═══════════════════════════════════════════");
    lines.push("");
    lines.push(`Reel URL: ${adminReelUrl}`);
    lines.push(`Generated: ${new Date().toLocaleString("en-IN")}`);
    lines.push(`Viral Score: ${analysis.viralClassification?.score || analysis.viralScore || 0}/80`);
    lines.push(`Status: ${analysis.viralClassification?.status || "N/A"}`);
    lines.push("");

    if (premium.scoreBreakdown) {
      lines.push("── SCORE BREAKDOWN ──");
      Object.entries(premium.scoreBreakdown).forEach(([k, v]) => lines.push(`  ${k}: ${v}/8`));
      lines.push("");
    }
    if (premium.viralityInsights) {
      lines.push("── VIRALITY INSIGHTS ──");
      Object.entries(premium.viralityInsights).forEach(([k, v]: [string, any]) => {
        lines.push(`  ${k}:`);
        if (v?.impact) lines.push(`    Impact: ${v.impact}`);
        if (v?.reason) lines.push(`    Reason: ${v.reason}`);
        if (v?.solution) lines.push(`    Solution: ${v.solution}`);
      });
      lines.push("");
    }
    if (premium.improvementRoadmap) {
      lines.push("── 5-STEP IMPROVEMENT ROADMAP ──");
      premium.improvementRoadmap.forEach((step: any, i: number) => {
        lines.push(`  Step ${i + 1}: ${step.title || step.step || ""}`);
        if (step.description) lines.push(`    ${step.description}`);
      });
      lines.push("");
    }
    if (premium.quickTips) {
      lines.push("── QUICK TIPS ──");
      premium.quickTips.forEach((t: string, i: number) => lines.push(`  ${i + 1}. ${t}`));
      lines.push("");
    }

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `master-report-admin-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const statCards = [
    { label: "Total Analyses", value: stats.total, icon: BarChart3, color: "text-primary" },
    { label: "Today", value: stats.today, icon: TrendingUp, color: "text-[hsl(var(--viral-high))]" },
    { label: "This Week", value: stats.week, icon: Calendar, color: "text-secondary" },
    { label: "This Month", value: stats.month, icon: Users, color: "text-accent" },
  ];

  const paidStatCards = [
    { label: "Reports Sold", value: paidStats.total, icon: FileText, color: "text-primary" },
    { label: "Total Revenue", value: `₹${paidStats.revenue}`, icon: IndianRupee, color: "text-[hsl(var(--viral-high))]" },
    { label: "Today Revenue", value: `₹${paidStats.todayRevenue}`, icon: TrendingUp, color: "text-accent" },
    { label: "Pending", value: paidStats.pending, icon: CreditCard, color: "text-[hsl(var(--viral-mid))]" },
  ];

  const slotLabels: Record<string, string> = {
    "banner-top": "🔝 Top Banner (Homepage)",
    "banner-mid": "📍 Mid Banner",
    "banner-bottom": "⬇️ Bottom Banner (Results End)",
    "sidebar-left": "◀️ Left Sidebar (Desktop)",
    "sidebar-right": "▶️ Right Sidebar (Desktop)",
    "processing-overlay": "⏳ Processing Overlay",
    "below-progress": "📊 Below Progress Bar",
    "after-score": "🎯 After Viral Score",
    "after-charts": "📈 After Charts Section",
    "after-hooks": "🪝 After Hook/Caption/Hashtag",
    "after-recommendations": "💡 After Recommendations",
    "master-report-below": "👑 Below Master Report",
    "before-leaderboard": "🏆 Before Leaderboard",
    "before-reviews": "💬 Before Reviews",
    "footer-above": "📌 Above Footer",
    "share-gate-below": "🔒 Below Share Gate",
    "footer-banner": "🔻 Footer Banner",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border px-3 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold text-foreground truncate">Admin Panel</h1>
              <p className="text-[10px] sm:text-sm text-muted-foreground hidden sm:block">Analytics, Payments & Configuration</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="flex-shrink-0 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3">
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> 
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden">Exit</span>
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Free Analysis Stats */}
        <div>
          <h2 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 sm:mb-3">📊 Free Analysis Stats</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            {statCards.map((s) => (
              <Card key={s.label} className="border-border bg-card">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                    <s.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${s.color} flex-shrink-0`} />
                    <span className="text-[10px] sm:text-xs text-muted-foreground truncate">{s.label}</span>
                  </div>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Paid Reports Stats */}
        <div>
          <h2 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 sm:mb-3">💰 Paid Reports</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            {paidStatCards.map((s) => (
              <Card key={s.label} className="border-border bg-card">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                    <s.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${s.color} flex-shrink-0`} />
                    <span className="text-[10px] sm:text-xs text-muted-foreground truncate">{s.label}</span>
                  </div>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Payment & Site Config */}
          <Card className="border-border bg-card">
            <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                Payment & Config
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3 sm:space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] sm:text-xs text-muted-foreground">Report Price (₹)</Label>
                  <Input
                    type="number"
                    value={config.report_price || "29"}
                    onChange={(e) => updateConfig("report_price", e.target.value)}
                    className="bg-muted/50 border-border h-8 sm:h-10 text-xs sm:text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] sm:text-xs text-muted-foreground">Gateway</Label>
                  <select
                    value={config.payment_gateway || "razorpay"}
                    onChange={(e) => updateConfig("payment_gateway", e.target.value)}
                    className="w-full h-8 sm:h-10 px-2 sm:px-3 rounded-md bg-muted/50 border border-border text-foreground text-xs sm:text-sm"
                  >
                    <option value="razorpay">Razorpay</option>
                    <option value="stripe">Stripe</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] sm:text-xs text-muted-foreground">Razorpay Key ID</Label>
                <Input
                  value={config.razorpay_key_id || ""}
                  onChange={(e) => updateConfig("razorpay_key_id", e.target.value)}
                  placeholder="rzp_live_..."
                  className="bg-muted/50 border-border h-8 sm:h-10 text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] sm:text-xs text-muted-foreground">Razorpay Key Secret</Label>
                <Input
                  type="password"
                  value={config.razorpay_key_secret || ""}
                  onChange={(e) => updateConfig("razorpay_key_secret", e.target.value)}
                  placeholder="••••••••"
                  className="bg-muted/50 border-border h-8 sm:h-10 text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] sm:text-xs text-muted-foreground">Stripe Key</Label>
                <Input
                  type="password"
                  value={config.stripe_key || ""}
                  onChange={(e) => updateConfig("stripe_key", e.target.value)}
                  placeholder="sk_live_..."
                  className="bg-muted/50 border-border h-8 sm:h-10 text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" /> WhatsApp Number
                </Label>
                <Input
                  value={config.whatsapp_number || ""}
                  onChange={(e) => updateConfig("whatsapp_number", e.target.value)}
                  placeholder="919876543210"
                  className="bg-muted/50 border-border h-8 sm:h-10 text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                  <FileText className="w-3 h-3" /> Example PDF URL (Sample Report)
                </Label>
                <Input
                  value={config.example_pdf_url || ""}
                  onChange={(e) => updateConfig("example_pdf_url", e.target.value)}
                  placeholder="https://drive.google.com/file/d/.../preview"
                  className="bg-muted/50 border-border h-8 sm:h-10 text-xs sm:text-sm"
                />
                <p className="text-[9px] text-muted-foreground/60">Paste a direct PDF link or Google Drive embed URL. Leave empty to hide.</p>
              </div>

              <Button onClick={saveConfig} disabled={savingConfig} className="w-full gradient-primary-bg text-primary-foreground h-9 sm:h-10 text-xs sm:text-sm">
                {savingConfig ? "Saving..." : "Save Configuration"}
              </Button>
            </CardContent>
          </Card>

          {/* Ad Management */}
          <Card className="border-border bg-card">
            <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
                <Megaphone className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" />
                Ad Slots
              </CardTitle>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Google AdSense, Affiliate links, ya custom HTML ads lagao</p>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-2 sm:space-y-3">
              {adSlots.map((slot) => {
                const isEditing = editingSlot === slot.id;
                return (
                  <div key={slot.id} className="rounded-lg bg-muted/30 border border-border overflow-hidden">
                    <div className="flex items-center justify-between p-2.5 sm:p-3 gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Label className="text-xs sm:text-sm text-foreground cursor-pointer truncate">
                          {slotLabels[slot.slot_name] || slot.slot_name}
                        </Label>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] font-medium ${
                          slot.ad_type === "adsense" ? "bg-primary/20 text-primary" :
                          slot.ad_type === "affiliate" ? "bg-accent/20 text-accent" :
                          "bg-secondary/20 text-secondary"
                        }`}>
                          {slot.ad_type === "adsense" ? "AdSense" : slot.ad_type === "affiliate" ? "Affiliate" : "Custom"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[10px] sm:text-xs"
                          onClick={() => {
                            if (isEditing) {
                              setEditingSlot(null);
                            } else {
                              setEditingSlot(slot.id);
                              setSlotDraft({ ad_type: slot.ad_type || "custom", ad_code: slot.ad_code || "" });
                            }
                          }}
                        >
                          {isEditing ? "Cancel" : "Edit"}
                        </Button>
                        <Switch
                          checked={slot.enabled}
                          onCheckedChange={(checked) => toggleAd(slot.id, checked)}
                        />
                      </div>
                    </div>

                    {isEditing && (
                      <div className="px-2.5 sm:px-3 pb-3 space-y-2 border-t border-border pt-2">
                        <div className="space-y-1">
                          <Label className="text-[10px] sm:text-xs text-muted-foreground">Ad Type</Label>
                          <select
                            value={slotDraft.ad_type}
                            onChange={(e) => setSlotDraft(prev => ({ ...prev, ad_type: e.target.value }))}
                            className="w-full h-8 px-2 rounded-md bg-muted/50 border border-border text-foreground text-xs"
                          >
                            <option value="adsense">Google AdSense</option>
                            <option value="affiliate">Affiliate Ad</option>
                            <option value="custom">Custom HTML</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] sm:text-xs text-muted-foreground">
                            {slotDraft.ad_type === "adsense" ? "AdSense Code (paste <script> + <ins> tag)" :
                             slotDraft.ad_type === "affiliate" ? "Affiliate HTML (banner img, link, etc.)" :
                             "Custom HTML/JS Code"}
                          </Label>
                          <textarea
                            value={slotDraft.ad_code}
                            onChange={(e) => setSlotDraft(prev => ({ ...prev, ad_code: e.target.value }))}
                            placeholder={
                              slotDraft.ad_type === "adsense"
                                ? '<ins class="adsbygoogle"...\n<script>(adsbygoogle = ...).push({});</script>'
                                : slotDraft.ad_type === "affiliate"
                                ? '<a href="https://affiliate-link.com"><img src="banner.jpg" /></a>'
                                : '<div>Your custom ad HTML here</div>'
                            }
                            rows={4}
                            className="w-full px-2 py-1.5 rounded-md bg-muted/50 border border-border text-foreground text-xs font-mono resize-y min-h-[80px]"
                          />
                        </div>
                        <Button
                          size="sm"
                          className="w-full h-8 text-xs gradient-primary-bg text-primary-foreground"
                          onClick={async () => {
                            const { error } = await supabase
                              .from("ad_config")
                              .update({
                                ad_type: slotDraft.ad_type,
                                ad_code: slotDraft.ad_code,
                                updated_at: new Date().toISOString(),
                              } as any)
                              .eq("id", slot.id);
                            if (error) { toast.error("Failed to save ad"); return; }
                            setAdSlots(prev => prev.map(s => s.id === slot.id ? { ...s, ad_type: slotDraft.ad_type, ad_code: slotDraft.ad_code } : s));
                            setEditingSlot(null);
                            toast.success("Ad saved!");
                          }}
                        >
                          Save Ad Code
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Recent Paid Reports */}
          <Card className="border-border bg-card">
            <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-[hsl(var(--viral-high))] flex-shrink-0" />
                Recent Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              {recentReports.length === 0 ? (
                <p className="text-xs sm:text-sm text-muted-foreground">No paid reports yet</p>
              ) : (
                <div className="space-y-1.5 sm:space-y-2">
                  {recentReports.map((r: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 sm:p-2.5 rounded-lg bg-muted/20 text-[10px] sm:text-xs gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="text-foreground truncate block max-w-[120px] sm:max-w-[180px]">{r.reel_url}</span>
                        <span className="text-muted-foreground text-[9px] sm:text-[10px]">{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                        <span className="font-medium text-foreground">₹{r.amount}</span>
                        <span className={`px-1 sm:px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] ${
                          r.status === "completed" || r.status === "paid"
                            ? "bg-[hsl(var(--viral-high))]/20 text-[hsl(var(--viral-high))]"
                            : "bg-[hsl(var(--viral-mid))]/20 text-[hsl(var(--viral-mid))]"
                        }`}>
                          {r.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Usage */}
          <Card className="border-border bg-card">
            <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
                <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-secondary flex-shrink-0" />
                Recent Analyses
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              {recentUrls.length === 0 ? (
                <p className="text-xs sm:text-sm text-muted-foreground">No analyses yet</p>
              ) : (
                <div className="space-y-1.5 sm:space-y-2">
                  {recentUrls.map((u, i) => (
                    <div key={i} className="flex items-center justify-between p-2 sm:p-2.5 rounded-lg bg-muted/20 text-[10px] sm:text-xs gap-2">
                      <span className="text-foreground truncate min-w-0 flex-1">{u.reel_url}</span>
                      <span className="text-muted-foreground whitespace-nowrap flex-shrink-0 text-[9px] sm:text-xs">
                        {new Date(u.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Admin Master Report Generator */}
        <div>
          <h2 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 sm:mb-3">👑 Generate Master Report (Free)</h2>
          <Card className="border-border bg-card">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Enter any Instagram Reel URL to generate a Master Report without payment.</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={adminReelUrl}
                  onChange={(e) => setAdminReelUrl(e.target.value)}
                  placeholder="https://www.instagram.com/reel/..."
                  className="bg-muted/50 border-border h-9 sm:h-10 text-xs sm:text-sm flex-1"
                />
                <Button
                  onClick={handleAdminGenerateReport}
                  disabled={adminGenerating}
                  className="gradient-primary-bg text-primary-foreground h-9 sm:h-10 text-xs sm:text-sm px-4 sm:px-6 flex-shrink-0"
                >
                  {adminGenerating ? (
                    <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Generating...</>
                  ) : (
                    <><Crown className="w-3.5 h-3.5 mr-1.5" /> Generate Report</>
                  )}
                </Button>
              </div>

              {adminReportData && (
                <div className="rounded-lg bg-[hsl(var(--viral-high))]/10 border border-[hsl(var(--viral-high))]/30 p-3 sm:p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">Report Ready!</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--viral-high))]/20 text-[hsl(var(--viral-high))] font-medium">
                      Score: {adminReportData.analysis.viralClassification?.score || adminReportData.analysis.viralScore || 0}/80
                    </span>
                  </div>
                  <Button
                    onClick={handleAdminDownloadTxt}
                    className="w-full sm:w-auto gradient-primary-bg text-primary-foreground h-9 text-xs sm:text-sm"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" /> Download Master Report (TXT)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* User Feedback */}
        <div>
          <h2 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 sm:mb-3">⭐ User Feedback</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Feedback Stats */}
            <Card className="border-border bg-card">
              <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" />
                  Rating Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-3xl sm:text-4xl font-bold text-foreground">{feedbackStats.avg}</p>
                    <div className="flex gap-0.5 justify-center mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(feedbackStats.avg) ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />
                      ))}
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{feedbackStats.total} reviews</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = feedbackStats.distribution[star - 1];
                      const pct = feedbackStats.total ? (count / feedbackStats.total) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-2 text-[10px] sm:text-xs">
                          <span className="text-muted-foreground w-3">{star}</span>
                          <Star className="w-3 h-3 fill-accent text-accent" />
                          <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
                            <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-muted-foreground w-5 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Feedback */}
            <Card className="border-border bg-card">
              <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-secondary flex-shrink-0" />
                  Recent Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                {recentFeedback.length === 0 ? (
                  <p className="text-xs sm:text-sm text-muted-foreground">No feedback yet</p>
                ) : (
                  <div className="space-y-2">
                    {recentFeedback.map((f: any, i: number) => (
                      <div key={i} className="p-2 sm:p-2.5 rounded-lg bg-muted/20 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`w-3 h-3 ${s <= f.rating ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />
                            ))}
                          </div>
                          <span className="text-[9px] sm:text-[10px] text-muted-foreground">{new Date(f.created_at).toLocaleDateString()}</span>
                        </div>
                        {f.comment && <p className="text-[10px] sm:text-xs text-muted-foreground">{f.comment}</p>}
                        <p className="text-[9px] sm:text-[10px] text-muted-foreground/60 truncate">{f.reel_url}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
