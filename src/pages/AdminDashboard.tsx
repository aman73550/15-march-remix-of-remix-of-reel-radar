import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield, LogOut, BarChart3, Megaphone, TrendingUp, Users, Eye, Calendar } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, today: 0, week: 0, month: 0 });
  const [adSlots, setAdSlots] = useState<{ id: string; slot_name: string; enabled: boolean; ad_code: string | null }[]>([]);
  const [recentUrls, setRecentUrls] = useState<{ reel_url: string; created_at: string }[]>([]);

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

    await Promise.all([loadStats(), loadAdConfig(), loadRecentUsage()]);
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

    if (error) {
      toast.error("Failed to update ad slot");
      return;
    }
    setAdSlots(prev => prev.map(s => s.id === id ? { ...s, enabled } : s));
    toast.success(`Ad slot ${enabled ? "enabled" : "disabled"}`);
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
    { label: "Today", value: stats.today, icon: TrendingUp, color: "text-green-400" },
    { label: "This Week", value: stats.week, icon: Calendar, color: "text-blue-400" },
    { label: "This Month", value: stats.month, icon: Users, color: "text-accent" },
  ];

  const slotLabels: Record<string, string> = {
    "banner-top": "🔝 Top Banner",
    "banner-mid": "📍 Middle Banner",
    "banner-bottom": "⬇️ Bottom Banner",
    "sidebar-left": "◀️ Left Sidebar",
    "sidebar-right": "▶️ Right Sidebar",
    "processing-overlay": "⏳ Processing Overlay",
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
              <p className="text-sm text-muted-foreground">Usage Analytics & Ad Management</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <Card key={s.label} className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Ad Management */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Megaphone className="w-5 h-5 text-accent" />
                Ad Slots
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {adSlots.map((slot) => (
                <div key={slot.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                  <Label className="text-sm text-foreground cursor-pointer">
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

          {/* Recent Usage */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Eye className="w-5 h-5 text-blue-400" />
                Recent Analyses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentUrls.length === 0 ? (
                <p className="text-sm text-muted-foreground">No analyses yet</p>
              ) : (
                <div className="space-y-2">
                  {recentUrls.map((u, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 text-xs">
                      <span className="text-foreground truncate max-w-[200px]">{u.reel_url}</span>
                      <span className="text-muted-foreground whitespace-nowrap ml-2">
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
