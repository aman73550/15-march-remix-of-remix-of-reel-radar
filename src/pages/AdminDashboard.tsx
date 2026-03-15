import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Shield, LogOut, BarChart3, Megaphone, TrendingUp, Users, Eye, Calendar,
  CreditCard, Settings, IndianRupee, MessageCircle, FileText, Star, Crown,
  Loader2, Download, ArrowLeft, Search, Key, Menu, X, Zap, Target, Activity
} from "lucide-react";
import MasterReportPDF from "@/components/MasterReportPDF";
import AdminBehaviourSettings from "@/components/AdminBehaviourSettings";
import AdminAIUsage from "@/components/AdminAIUsage";
import AdminApiKeysManager from "@/components/AdminApiKeysManager";
import SEOResultsDisplay from "@/components/SEOResultsDisplay";
import AdminAIChat from "@/components/AdminAIChat";
import { Textarea } from "@/components/ui/textarea";

type AdminSection =
  | "dashboard"
  | "config"
  | "api-keys"
  | "ads"
  | "reports"
  | "usage"
  | "generator"
  | "seo"
  | "behaviour"
  | "feedback";

const SIDEBAR_ITEMS: { id: AdminSection; label: string; icon: any; emoji: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3, emoji: "📊" },
  { id: "config", label: "Payment & Config", icon: Settings, emoji: "⚙️" },
  { id: "api-keys", label: "API Keys", icon: Key, emoji: "🔑" },
  { id: "ads", label: "Ad Slots", icon: Megaphone, emoji: "📢" },
  { id: "reports", label: "Reports & Logs", icon: FileText, emoji: "📄" },
  { id: "usage", label: "API Usage", icon: Activity, emoji: "📈" },
  { id: "generator", label: "Report Generator", icon: Crown, emoji: "👑" },
  { id: "seo", label: "SEO Optimizer", icon: Search, emoji: "🔍" },
  { id: "behaviour", label: "Behaviour", icon: Target, emoji: "🎯" },
  { id: "feedback", label: "User Feedback", icon: Star, emoji: "⭐" },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ total: 0, today: 0, week: 0, month: 0 });
  const [paidStats, setPaidStats] = useState({ total: 0, revenue: 0, today: 0, todayRevenue: 0, pending: 0 });
  const [adSlots, setAdSlots] = useState<{ id: string; slot_name: string; enabled: boolean; ad_code: string | null; ad_type: string }[]>([]);
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [slotDraft, setSlotDraft] = useState<{ ad_type: string; ad_code: string }>({ ad_type: "custom", ad_code: "" });
  const [recentUrls, setRecentUrls] = useState<{ reel_url: string; created_at: string }[]>([]);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [config, setConfig] = useState<Record<string, string>>({});
  const [savingConfig, setSavingConfig] = useState(false);
  const [feedbackStats, setFeedbackStats] = useState({ total: 0, avg: 0, distribution: [0, 0, 0, 0, 0] });
  const [recentFeedback, setRecentFeedback] = useState<any[]>([]);
  const [adminReelUrl, setAdminReelUrl] = useState("");
  const [adminGenerating, setAdminGenerating] = useState(false);
  const [adminReportData, setAdminReportData] = useState<{ analysis: any; premium: any } | null>(null);
  const [adminShowPdfPreview, setAdminShowPdfPreview] = useState(false);
  const [adminSeoTopic, setAdminSeoTopic] = useState("");
  const [adminSeoGenerating, setAdminSeoGenerating] = useState(false);
  const [adminSeoResults, setAdminSeoResults] = useState<any>(null);

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  const checkAdminAndLoad = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/bosspage-login"); return; }
    const { data: roles } = await supabase
      .from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin");
    if (!roles || roles.length === 0) {
      await supabase.auth.signOut();
      navigate("/bosspage-login");
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
    setStats({ total: total.count || 0, today: today.count || 0, week: week.count || 0, month: month.count || 0 });
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
    const { data } = await supabase.from("paid_reports" as any)
      .select("id, reel_url, amount, status, created_at, payment_gateway")
      .order("created_at", { ascending: false }).limit(10);
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
    const { data } = await supabase.from("usage_logs")
      .select("reel_url, created_at").order("created_at", { ascending: false }).limit(10);
    if (data) setRecentUrls(data);
  };

  const toggleAd = async (id: string, enabled: boolean) => {
    const { error } = await supabase.from("ad_config")
      .update({ enabled, updated_at: new Date().toISOString() }).eq("id", id);
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
          .from("site_config" as any).select("id").eq("config_key", key).single();
        if (existing) {
          await supabase.from("site_config" as any)
            .update({ config_value: value, updated_at: new Date().toISOString() }).eq("config_key", key);
        } else {
          await supabase.from("site_config" as any)
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
    navigate("/bosspage-login");
  };

  const loadFeedback = async () => {
    const { data } = await supabase.from("feedback" as any).select("*").order("created_at", { ascending: false }).limit(20);
    if (!data) return;
    const all = data as any[];
    setRecentFeedback(all.slice(0, 10));
    const dist = [0, 0, 0, 0, 0];
    let sum = 0;
    for (const f of all) { dist[f.rating - 1]++; sum += f.rating; }
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
      const { data: analysisData, error: analysisErr } = await supabase.functions.invoke("analyze-reel", {
        body: { url: adminReelUrl.trim() },
      });
      if (analysisErr || !analysisData?.success) throw new Error(analysisData?.error || "Analysis failed");
      const analysis = analysisData.analysis;
      const { data: reportData, error: reportErr } = await supabase.functions.invoke("generate-master-report", {
        body: { reportId: null, analysisData: analysis, reelUrl: adminReelUrl.trim(), adminFree: true },
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
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `master-report-admin-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(blobUrl);
  };

  const handleAdminSeoGenerate = async () => {
    if (!adminSeoTopic.trim()) { toast.error("Enter a topic or context"); return; }
    setAdminSeoGenerating(true);
    setAdminSeoResults(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const { data, error } = await supabase.functions.invoke("seo-analyze", {
        body: { topic: adminSeoTopic.trim(), adminFree: true },
      });
      if (error || !data?.success) throw new Error(data?.error || error?.message || "SEO analysis failed");
      setAdminSeoResults(data.data);
      toast.success("SEO Analysis generated! 🎉");
    } catch (err: any) {
      console.error("Admin SEO error:", err);
      toast.error(err.message || "Failed to generate SEO analysis");
    } finally {
      setAdminSeoGenerating(false);
    }
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

  const slotLabels: Record<string, { label: string; group: string }> = {
    "banner-top": { label: "🔝 Top Banner (Homepage)", group: "Homepage" },
    "banner-mid": { label: "📍 Mid Banner", group: "Homepage" },
    "banner-bottom": { label: "⬇️ Bottom Banner (Results End)", group: "Homepage" },
    "sidebar-left": { label: "◀️ Left Sidebar (Desktop)", group: "Homepage" },
    "sidebar-right": { label: "▶️ Right Sidebar (Desktop)", group: "Homepage" },
    "processing-overlay": { label: "⏳ Analysis Processing Overlay", group: "Processing" },
    "below-progress": { label: "📊 Below Analysis Progress Bar", group: "Processing" },
    "report-progress-below": { label: "📊 Below Report Progress Bar", group: "Report Processing" },
    "report-processing-bottom": { label: "⬇️ Report Processing Bottom", group: "Report Processing" },
    "after-score": { label: "🎯 After Viral Score", group: "Results" },
    "mid-1": { label: "📊 Results Mid-1", group: "Results" },
    "after-charts": { label: "📈 After Charts Section", group: "Results" },
    "after-hooks": { label: "🪝 After Hook/Caption/Hashtag", group: "Results" },
    "mid-2": { label: "📊 Results Mid-2", group: "Results" },
    "mid-3": { label: "📊 Results Mid-3", group: "Results" },
    "after-recommendations": { label: "💡 After Recommendations", group: "Results" },
    "master-report-below": { label: "👑 Below Master Report CTA", group: "Results" },
    "report-after-category": { label: "📂 Report: After Category", group: "Master Report" },
    "report-after-famous": { label: "⭐ Report: After Famous Elements", group: "Master Report" },
    "report-mid-1": { label: "📊 Report: Mid Section 1", group: "Master Report" },
    "report-mid-2": { label: "📊 Report: Mid Section 2", group: "Master Report" },
    "report-bottom": { label: "⬇️ Report: Bottom Banner", group: "Master Report" },
    "seo-input-below": { label: "🔍 Below SEO Input", group: "SEO" },
    "seo-processing-top": { label: "⏳ SEO Processing Top", group: "SEO" },
    "seo-processing-mid": { label: "⏳ SEO Processing Mid", group: "SEO" },
    "seo-processing-bottom": { label: "⏳ SEO Processing Bottom", group: "SEO" },
    "seo-results-mid": { label: "📊 SEO Results Mid", group: "SEO" },
    "seo-results-bottom": { label: "📊 SEO Results Bottom", group: "SEO" },
    "before-leaderboard": { label: "🏆 Before Leaderboard", group: "Footer" },
    "before-reviews": { label: "💬 Before Reviews", group: "Footer" },
    "footer-above": { label: "📌 Above Footer", group: "Footer" },
    "share-gate-below": { label: "🔒 Below Share Gate", group: "Footer" },
    "footer-banner": { label: "🔻 Footer Banner", group: "Footer" },
  };

  const AD_TEMPLATES = [
    { name: "Google AdSense (Auto)", type: "adsense", code: '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>\n<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" data-ad-slot="XXXXXXXXXX" data-ad-format="auto" data-full-width-responsive="true"></ins>\n<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>' },
    { name: "Affiliate Banner", type: "affiliate", code: '<a href="YOUR_AFFILIATE_LINK" target="_blank" rel="noopener sponsored">\n  <img src="YOUR_BANNER_IMAGE_URL" alt="Ad" style="width:100%;height:auto;border-radius:8px;" />\n</a>' },
    { name: "Custom CTA Card", type: "custom", code: '<div style="background:linear-gradient(135deg,#1a1a2e,#16213e);padding:16px;border-radius:12px;text-align:center;">\n  <p style="color:#e94560;font-weight:bold;font-size:14px;margin:0 0 8px;">🔥 Special Offer!</p>\n  <p style="color:#eee;font-size:12px;margin:0 0 12px;">Get 50% off on our premium plan</p>\n  <a href="YOUR_LINK" style="background:#e94560;color:white;padding:8px 20px;border-radius:8px;text-decoration:none;font-size:12px;font-weight:bold;">Grab Deal →</a>\n</div>' },
  ];

  const groupedSlots: Record<string, typeof adSlots> = {};
  adSlots.forEach(slot => {
    const meta = slotLabels[slot.slot_name];
    const group = meta?.group || "Other";
    if (!groupedSlots[group]) groupedSlots[group] = [];
    groupedSlots[group].push(slot);
  });

  const handleSectionChange = (section: AdminSection) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

  // ============ SECTION RENDERERS ============

  const renderDashboard = () => (
    <div className="space-y-4 sm:space-y-6">
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
    </div>
  );

  const renderConfig = () => (
    <Card className="border-border bg-card">
      <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
          <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
          Payment & Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3 sm:space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-[10px] sm:text-xs text-muted-foreground">Report Price (₹)</Label>
            <Input type="number" value={config.report_price || "29"} onChange={(e) => updateConfig("report_price", e.target.value)} className="bg-muted/50 border-border h-8 sm:h-10 text-xs sm:text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] sm:text-xs text-muted-foreground">Gateway</Label>
            <select value={config.payment_gateway || "razorpay"} onChange={(e) => updateConfig("payment_gateway", e.target.value)} className="w-full h-8 sm:h-10 px-2 sm:px-3 rounded-md bg-muted/50 border border-border text-foreground text-xs sm:text-sm">
              <option value="razorpay">Razorpay</option>
              <option value="stripe">Stripe</option>
            </select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] sm:text-xs text-muted-foreground">Razorpay Key ID</Label>
          <Input value={config.razorpay_key_id || ""} onChange={(e) => updateConfig("razorpay_key_id", e.target.value)} placeholder="rzp_live_..." className="bg-muted/50 border-border h-8 sm:h-10 text-xs sm:text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] sm:text-xs text-muted-foreground">Razorpay Key Secret</Label>
          <Input type="password" value={config.razorpay_key_secret || ""} onChange={(e) => updateConfig("razorpay_key_secret", e.target.value)} placeholder="••••••••" className="bg-muted/50 border-border h-8 sm:h-10 text-xs sm:text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] sm:text-xs text-muted-foreground">Stripe Key</Label>
          <Input type="password" value={config.stripe_key || ""} onChange={(e) => updateConfig("stripe_key", e.target.value)} placeholder="sk_live_..." className="bg-muted/50 border-border h-8 sm:h-10 text-xs sm:text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
            <MessageCircle className="w-3 h-3" /> WhatsApp Number
          </Label>
          <Input value={config.whatsapp_number || ""} onChange={(e) => updateConfig("whatsapp_number", e.target.value)} placeholder="919876543210" className="bg-muted/50 border-border h-8 sm:h-10 text-xs sm:text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
            <FileText className="w-3 h-3" /> Example PDF URL (Sample Report)
          </Label>
          <Input value={config.example_pdf_url || ""} onChange={(e) => updateConfig("example_pdf_url", e.target.value)} placeholder="https://drive.google.com/file/d/.../preview" className="bg-muted/50 border-border h-8 sm:h-10 text-xs sm:text-sm" />
          <p className="text-[9px] text-muted-foreground/60">Paste a direct PDF link or Google Drive embed URL. Leave empty to hide.</p>
        </div>
        <Button onClick={saveConfig} disabled={savingConfig} className="w-full gradient-primary-bg text-primary-foreground h-9 sm:h-10 text-xs sm:text-sm">
          {savingConfig ? "Saving..." : "Save Configuration"}
        </Button>
      </CardContent>
    </Card>
  );

  const renderAds = () => (
    <Card className="border-border bg-card">
      <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
          <Megaphone className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" />
          Ad Slots ({adSlots.filter(s => s.enabled).length}/{adSlots.length} active)
        </CardTitle>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Google AdSense, Affiliate links, ya custom HTML ads — directly deploy from here</p>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-primary/10 p-2 text-center">
            <p className="text-lg font-bold text-primary">{adSlots.filter(s => s.ad_type === "adsense" && s.ad_code).length}</p>
            <p className="text-[9px] text-muted-foreground">AdSense</p>
          </div>
          <div className="rounded-lg bg-accent/10 p-2 text-center">
            <p className="text-lg font-bold text-accent">{adSlots.filter(s => s.ad_type === "affiliate" && s.ad_code).length}</p>
            <p className="text-[9px] text-muted-foreground">Affiliate</p>
          </div>
          <div className="rounded-lg bg-secondary/10 p-2 text-center">
            <p className="text-lg font-bold text-secondary">{adSlots.filter(s => s.ad_code).length}</p>
            <p className="text-[9px] text-muted-foreground">With Code</p>
          </div>
        </div>
        {Object.entries(groupedSlots).map(([group, slots]) => (
          <div key={group}>
            <h4 className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              {group === "Homepage" ? "🏠" : group === "Processing" ? "⏳" : group === "Report Processing" ? "👑" : group === "Results" ? "📊" : group === "Master Report" ? "📄" : group === "SEO" ? "🔍" : group === "Footer" ? "📌" : "📦"} {group}
            </h4>
            <div className="space-y-1.5">
              {slots.map((slot) => {
                const isEditing = editingSlot === slot.id;
                const meta = slotLabels[slot.slot_name];
                return (
                  <div key={slot.id} className="rounded-lg bg-muted/30 border border-border overflow-hidden">
                    <div className="flex items-center justify-between p-2 sm:p-2.5 gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Label className="text-[10px] sm:text-xs text-foreground cursor-pointer truncate">{meta?.label || slot.slot_name}</Label>
                        {slot.ad_code && (
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-medium ${slot.ad_type === "adsense" ? "bg-primary/20 text-primary" : slot.ad_type === "affiliate" ? "bg-accent/20 text-accent" : "bg-secondary/20 text-secondary"}`}>
                            {slot.ad_type === "adsense" ? "AdSense" : slot.ad_type === "affiliate" ? "Affiliate" : "Custom"}
                          </span>
                        )}
                        {!slot.ad_code && <span className="px-1.5 py-0.5 rounded text-[8px] font-medium bg-muted/50 text-muted-foreground">Empty</span>}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" onClick={() => {
                          if (isEditing) { setEditingSlot(null); } else { setEditingSlot(slot.id); setSlotDraft({ ad_type: slot.ad_type || "custom", ad_code: slot.ad_code || "" }); }
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
                              <button key={tpl.name} onClick={() => setSlotDraft({ ad_type: tpl.type, ad_code: tpl.code })} className="px-2 py-1 rounded-md text-[9px] font-medium bg-muted/40 border border-border hover:border-primary/40 hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-all">
                                {tpl.name}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground">Ad Type</Label>
                          <select value={slotDraft.ad_type} onChange={(e) => setSlotDraft(prev => ({ ...prev, ad_type: e.target.value }))} className="w-full h-8 px-2 rounded-md bg-muted/50 border border-border text-foreground text-xs">
                            <option value="adsense">Google AdSense</option>
                            <option value="affiliate">Affiliate Ad</option>
                            <option value="custom">Custom HTML</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground">
                            {slotDraft.ad_type === "adsense" ? "AdSense Code (paste full code)" : slotDraft.ad_type === "affiliate" ? "Affiliate HTML (banner/link)" : "Custom HTML/JS Code"}
                          </Label>
                          <textarea value={slotDraft.ad_code} onChange={(e) => setSlotDraft(prev => ({ ...prev, ad_code: e.target.value }))} placeholder={slotDraft.ad_type === "adsense" ? '<ins class="adsbygoogle"...' : slotDraft.ad_type === "affiliate" ? '<a href="..."><img src="banner.jpg" /></a>' : '<div>Your custom ad HTML here</div>'} rows={4} className="w-full px-2 py-1.5 rounded-md bg-muted/50 border border-border text-foreground text-xs font-mono resize-y min-h-[80px]" />
                        </div>
                        {slotDraft.ad_code && (
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground">👁️ Preview</Label>
                            <div className="rounded-lg border border-border bg-background p-2 max-h-[120px] overflow-auto">
                              <div dangerouslySetInnerHTML={{ __html: slotDraft.ad_code.replace(/<script[\s\S]*?<\/script>/gi, '<p style="color:#888;font-size:10px;">[Script will execute on live site]</p>') }} />
                            </div>
                          </div>
                        )}
                        <div className="flex gap-2">
                          {slot.ad_code && (
                            <Button variant="outline" size="sm" className="h-8 text-xs border-border flex-1" onClick={async () => {
                              const { error } = await supabase.from("ad_config").update({ ad_code: null, updated_at: new Date().toISOString() } as any).eq("id", slot.id);
                              if (error) { toast.error("Failed to clear ad"); return; }
                              setAdSlots(prev => prev.map(s => s.id === slot.id ? { ...s, ad_code: null } : s));
                              setEditingSlot(null);
                              toast.success("Ad cleared!");
                            }}>
                              🗑️ Clear Ad
                            </Button>
                          )}
                          <Button size="sm" className="h-8 text-xs gradient-primary-bg text-primary-foreground flex-1" onClick={async () => {
                            const { error } = await supabase.from("ad_config").update({ ad_type: slotDraft.ad_type, ad_code: slotDraft.ad_code, updated_at: new Date().toISOString() } as any).eq("id", slot.id);
                            if (error) { toast.error("Failed to save ad"); return; }
                            setAdSlots(prev => prev.map(s => s.id === slot.id ? { ...s, ad_type: slotDraft.ad_type, ad_code: slotDraft.ad_code } : s));
                            setEditingSlot(null);
                            toast.success("Ad deployed! 🚀 Live on website now.");
                          }}>
                            🚀 Deploy Ad
                          </Button>
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

  const renderReports = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      <Card className="border-border bg-card">
        <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
            <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-[hsl(var(--viral-high))] flex-shrink-0" />
            Recent Paid Reports
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
                    <span className={`px-1 sm:px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] ${r.status === "completed" || r.status === "paid" ? "bg-[hsl(var(--viral-high))]/20 text-[hsl(var(--viral-high))]" : "bg-[hsl(var(--viral-mid))]/20 text-[hsl(var(--viral-mid))]"}`}>
                      {r.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="border-border bg-card">
        <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
            <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-secondary flex-shrink-0" />
            Recent Free Analyses
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
                  <span className="text-muted-foreground whitespace-nowrap flex-shrink-0 text-[9px] sm:text-xs">{new Date(u.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderGenerator = () => (
    <Card className="border-border bg-card">
      <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
          <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
          Generate Master Report (Free)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-4">
        <p className="text-[10px] sm:text-xs text-muted-foreground">Enter any Instagram Reel URL to generate a Master Report without payment.</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input value={adminReelUrl} onChange={(e) => setAdminReelUrl(e.target.value)} placeholder="https://www.instagram.com/reel/..." className="bg-muted/50 border-border h-9 sm:h-10 text-xs sm:text-sm flex-1" />
          <Button onClick={handleAdminGenerateReport} disabled={adminGenerating} className="gradient-primary-bg text-primary-foreground h-9 sm:h-10 text-xs sm:text-sm px-4 sm:px-6 flex-shrink-0">
            {adminGenerating ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Generating...</> : <><Crown className="w-3.5 h-3.5 mr-1.5" /> Generate Report</>}
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
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={handleAdminDownloadTxt} variant="outline" className="border-border/50 text-foreground h-9 text-xs sm:text-sm">
                <Download className="w-3.5 h-3.5 mr-1.5" /> Download TXT
              </Button>
              <Button onClick={() => setAdminShowPdfPreview(true)} className="gradient-primary-bg text-primary-foreground h-9 text-xs sm:text-sm">
                <FileText className="w-3.5 h-3.5 mr-1.5" /> View Full Report & PDF
              </Button>
            </div>
            <p className="text-[9px] text-muted-foreground">Premium data sections: {Object.keys(adminReportData.premium).length} sections generated</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderSeo = () => (
    <Card className="border-border bg-card">
      <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
          SEO Optimizer (Free for Admin)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-4">
        <p className="text-[10px] sm:text-xs text-muted-foreground">Enter any topic or context to generate deep SEO optimization — titles, hashtags, music, posting time, top viral reels.</p>
        <Textarea value={adminSeoTopic} onChange={(e) => setAdminSeoTopic(e.target.value)} placeholder="Enter reel topic or context... (e.g., 'Morning routine for college students')" className="bg-muted/50 border-border text-xs sm:text-sm min-h-[80px] resize-none" />
        <Button onClick={handleAdminSeoGenerate} disabled={adminSeoGenerating || !adminSeoTopic.trim()} className="w-full gradient-primary-bg text-primary-foreground h-9 sm:h-10 text-xs sm:text-sm">
          {adminSeoGenerating ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Generating SEO Analysis...</> : <><Search className="w-3.5 h-3.5 mr-1.5" /> Generate SEO Analysis</>}
        </Button>
        {adminSeoResults && <div className="mt-4"><SEOResultsDisplay data={adminSeoResults} topic={adminSeoTopic} /></div>}
      </CardContent>
    </Card>
  );

  const renderFeedback = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case "dashboard": return renderDashboard();
      case "config": return renderConfig();
      case "api-keys": return <AdminApiKeysManager />;
      case "ads": return renderAds();
      case "reports": return renderReports();
      case "usage": return <AdminAIUsage />;
      case "generator": return renderGenerator();
      case "seo": return renderSeo();
      case "behaviour": return <AdminBehaviourSettings />;
      case "feedback": return renderFeedback();
      default: return renderDashboard();
    }
  };

  const activeItem = SIDEBAR_ITEMS.find(i => i.id === activeSection);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-56 border-r border-border bg-card/50 backdrop-blur-sm fixed inset-y-0 left-0 z-40">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground">Admin Panel</h1>
              <p className="text-[9px] text-muted-foreground">Control Center</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSectionChange(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all ${
                activeSection === item.id
                  ? "bg-primary/10 text-primary font-medium border border-primary/20"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <Button variant="outline" size="sm" onClick={handleLogout} className="w-full text-xs h-8">
            <LogOut className="w-3.5 h-3.5 mr-1.5" /> Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 inset-y-0 w-[75vw] max-w-72 bg-card border-r border-border flex flex-col animate-in slide-in-from-left duration-200 safe-area-inset">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-foreground">Admin Panel</h1>
                  <p className="text-[9px] text-muted-foreground">Control Center</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="h-9 w-9 p-0">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto overscroll-contain">
              {SIDEBAR_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSectionChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all active:scale-[0.97] ${
                    activeSection === item.id
                      ? "bg-primary/10 text-primary font-medium border border-primary/20"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <span className="text-lg">{item.emoji}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="p-3 border-t border-border pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <Button variant="outline" size="sm" onClick={handleLogout} className="w-full text-xs h-10">
                <LogOut className="w-3.5 h-3.5 mr-1.5" /> Logout
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-56 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-lg border-b border-border px-3 sm:px-6 py-2.5 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)} className="lg:hidden h-9 w-9 p-0 flex-shrink-0">
                <Menu className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2 min-w-0">
                {activeItem && <activeItem.icon className="w-4 h-4 text-primary flex-shrink-0" />}
                <h2 className="text-sm sm:text-lg font-semibold text-foreground truncate">{activeItem?.label || "Dashboard"}</h2>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="lg:hidden text-xs h-8 px-2 flex-shrink-0">
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-3 sm:p-6 max-w-5xl pb-20 sm:pb-6 overflow-x-hidden">
          {renderActiveSection()}
        </div>
      </main>

      {/* Full Report Preview Modal */}
      {adminShowPdfPreview && adminReportData && (
        <div className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-md overflow-y-auto">
          <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-4">
            <Button onClick={() => setAdminShowPdfPreview(false)} variant="outline" className="border-border/50 text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Admin
            </Button>
            <MasterReportPDF analysis={adminReportData.analysis} premiumData={adminReportData.premium} reelUrl={adminReelUrl} />
          </div>
        </div>
      )}
      {/* AI Chat Assistant */}
      <AdminAIChat />
    </div>
  );
};

export default AdminDashboard;
