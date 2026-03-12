import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Shield, LogOut, BarChart3, Megaphone, TrendingUp, Users, Eye, Calendar, CreditCard, Settings, IndianRupee, MessageCircle, FileText, Menu, X } from "lucide-react";

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

    await Promise.all([loadStats(), loadAdConfig(), loadRecentUsage(), loadConfig(), loadPaidStats(), loadRecentReports()]);
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
        await supabase
          .from("site_config" as any)
          .update({ config_value: value, updated_at: new Date().toISOString() })
          .eq("config_key", key);
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
    "banner-top": "🔝 Top Banner",
    "banner-mid": "📍 Mid Banner",
    "banner-bottom": "⬇️ Bottom Banner",
    "sidebar-left": "◀️ Left Sidebar",
    "sidebar-right": "▶️ Right Sidebar",
    "processing-overlay": "⏳ Processing",
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
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-2 sm:space-y-3">
              {adSlots.map((slot) => (
                <div key={slot.id} className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-muted/30 border border-border gap-2">
                  <Label className="text-xs sm:text-sm text-foreground cursor-pointer truncate">
                    {slotLabels[slot.slot_name] || slot.slot_name}
                  </Label>
                  <Switch
                    checked={slot.enabled}
                    onCheckedChange={(checked) => toggleAd(slot.id, checked)}
                  />
                </div>
              ))}
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
      </div>
    </div>
  );
};

export default AdminDashboard;
