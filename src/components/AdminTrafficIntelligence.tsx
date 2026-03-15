import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Globe, Users, Bot, Zap, Share2, Smartphone, Monitor, Tablet,
  Loader2, Sparkles, RefreshCw, TrendingUp, Shield, AlertTriangle, Eye
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import ReactMarkdown from "react-markdown";

interface TrafficStats {
  today: { total: number; real: number; bot: number; realPct: number };
  week: { total: number; real: number; bot: number };
  month: { total: number };
  sourceBreakdown: Record<string, { total: number; real: number; bot: number }>;
  deviceBreakdown: Record<string, number>;
  countryBreakdown: Record<string, number>;
  engagement: { avgDuration: number; avgScrollDepth: number; avgClicks: number };
  viralSpikes: { hour: number; count: number; multiplier: number }[];
  hourlyTraffic: Record<number, number>;
  shares: { total: number; platformBreakdown: Record<string, number>; attributedSessions: number };
  recentSessions: any[];
}

const PIE_COLORS = [
  "hsl(340, 82%, 55%)", "hsl(260, 60%, 55%)", "hsl(30, 90%, 55%)",
  "hsl(170, 60%, 45%)", "hsl(200, 70%, 50%)", "hsl(50, 80%, 50%)",
];

export default function AdminTrafficIntelligence() {
  const [stats, setStats] = useState<TrafficStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const loadStats = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("traffic-analytics", {
        body: { action: "stats" },
      });
      if (error) throw error;
      if (data?.success) setStats(data.stats);
      else throw new Error(data?.error || "Failed to load");
    } catch (e: any) {
      toast.error(e.message || "Failed to load traffic stats");
    } finally {
      setLoading(false);
    }
  };

  const runAIAnalysis = async () => {
    if (!stats) { toast.error("Load stats first"); return; }
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("traffic-analytics", {
        body: { action: "ai-analyze", trafficData: stats },
      });
      if (error) throw error;
      if (data?.success) setAiAnalysis(data.analysis);
      else throw new Error(data?.error || "AI analysis failed");
    } catch (e: any) {
      toast.error(e.message || "AI analysis failed");
    } finally {
      setAiLoading(false);
    }
  };

  const hourlyData = stats ? Object.entries(stats.hourlyTraffic).map(([hour, count]) => ({
    hour: `${hour}:00`, count,
  })).sort((a, b) => parseInt(a.hour) - parseInt(b.hour)) : [];

  const sourceData = stats ? Object.entries(stats.sourceBreakdown).map(([name, v]) => ({
    name, total: v.total, real: v.real, bot: v.bot,
  })).sort((a, b) => b.total - a.total) : [];

  const deviceData = stats ? Object.entries(stats.deviceBreakdown).map(([name, value]) => ({ name, value })) : [];
  const shareData = stats ? Object.entries(stats.shares.platformBreakdown).map(([name, value]) => ({ name, value })) : [];

  const getDeviceIcon = (d: string) => {
    if (d === "mobile") return <Smartphone className="w-4 h-4" />;
    if (d === "tablet") return <Tablet className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" /> Traffic Intelligence
        </h2>
        <div className="flex gap-2">
          <Button onClick={loadStats} disabled={loading} size="sm" variant="outline" className="gap-1.5">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Load Data
          </Button>
          {stats && (
            <Button onClick={runAIAnalysis} disabled={aiLoading} size="sm" className="gap-1.5">
              {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Analyze Traffic
            </Button>
          )}
        </div>
      </div>

      {!stats && !loading && (
        <Card className="p-8 text-center">
          <Globe className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
          <p className="text-sm text-muted-foreground">Click "Load Data" to view traffic intelligence</p>
        </Card>
      )}

      {stats && (
        <>
          {/* Top Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Eye className="w-3.5 h-3.5" /> Today
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.today.total}</p>
              <p className="text-[10px] text-muted-foreground">sessions</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Users className="w-3.5 h-3.5" /> Real Users
              </div>
              <p className="text-2xl font-bold text-[hsl(var(--viral-high))]">{stats.today.realPct}%</p>
              <p className="text-[10px] text-muted-foreground">{stats.today.real} of {stats.today.total}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Bot className="w-3.5 h-3.5" /> Bots Detected
              </div>
              <p className="text-2xl font-bold text-primary">{stats.today.bot}</p>
              <p className="text-[10px] text-muted-foreground">flagged today</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Share2 className="w-3.5 h-3.5" /> Shares
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.shares.total}</p>
              <p className="text-[10px] text-muted-foreground">{stats.shares.attributedSessions} attributed visits</p>
            </Card>
          </div>

          {/* Viral Spikes Alert */}
          {stats.viralSpikes.length > 0 && (
            <Card className="border-primary/30 bg-primary/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">🔥 Viral Traffic Detected</span>
              </div>
              <div className="space-y-1">
                {stats.viralSpikes.map((spike) => (
                  <p key={spike.hour} className="text-xs text-muted-foreground">
                    <span className="font-bold text-foreground">{spike.hour}:00</span> — {spike.count} sessions ({spike.multiplier}x above average)
                  </p>
                ))}
              </div>
            </Card>
          )}

          {/* Engagement Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Avg Duration</p>
              <p className="text-lg font-bold text-foreground">{stats.engagement.avgDuration}s</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Avg Scroll</p>
              <p className="text-lg font-bold text-foreground">{stats.engagement.avgScrollDepth}%</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Avg Clicks</p>
              <p className="text-lg font-bold text-foreground">{stats.engagement.avgClicks}</p>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Hourly Traffic */}
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Hourly Traffic
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2 pb-4">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={hourlyData}>
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(340, 82%, 55%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Device Distribution */}
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Smartphone className="w-4 h-4" /> Devices
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {deviceData.length > 0 ? (
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer width="50%" height={140}>
                      <PieChart>
                        <Pie data={deviceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={55} innerRadius={30}>
                          {deviceData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2">
                      {deviceData.map((d, i) => (
                        <div key={d.name} className="flex items-center gap-2 text-xs">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span className="text-muted-foreground capitalize">{d.name}</span>
                          <span className="font-bold text-foreground">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : <p className="text-xs text-muted-foreground text-center py-8">No device data</p>}
              </CardContent>
            </Card>
          </div>

          {/* Traffic Sources */}
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Globe className="w-4 h-4" /> Traffic Sources
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {sourceData.length > 0 ? (
                <div className="space-y-2">
                  {sourceData.slice(0, 8).map((s) => (
                    <div key={s.name} className="flex items-center gap-3">
                      <span className="text-xs font-medium w-20 truncate capitalize text-foreground">{s.name}</span>
                      <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden flex">
                        <div className="h-full bg-[hsl(var(--viral-high))]" style={{ width: `${(s.real / Math.max(s.total, 1)) * 100}%` }} />
                        <div className="h-full bg-primary/60" style={{ width: `${(s.bot / Math.max(s.total, 1)) * 100}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground w-12 text-right">{s.total}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[hsl(var(--viral-high))]" /> Real</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary/60" /> Bot</span>
                  </div>
                </div>
              ) : <p className="text-xs text-muted-foreground text-center py-4">No source data</p>}
            </CardContent>
          </Card>

          {/* Share Tracking */}
          {shareData.length > 0 && (
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Share2 className="w-4 h-4" /> Share Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {shareData.map((s) => (
                    <div key={s.name} className="text-center p-3 rounded-lg bg-muted/30 border border-border">
                      <p className="text-lg font-bold text-foreground">{s.value}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">{s.name}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Sessions */}
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4" /> Recent Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {stats.recentSessions.map((s: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20 border border-border text-xs">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${s.is_bot ? "bg-primary/10 text-primary" : "bg-[hsl(var(--viral-high))]/10 text-[hsl(var(--viral-high))]"}`}>
                      {s.is_bot ? "BOT" : "REAL"}
                    </span>
                    <span className="text-muted-foreground capitalize">{s.referrer_source}</span>
                    <span className="text-muted-foreground">{s.device_type}</span>
                    <span className="text-muted-foreground ml-auto">{s.duration_seconds}s</span>
                    {s.is_bot && s.bot_flags?.length > 0 && (
                      <span className="text-[10px] text-primary flex items-center gap-0.5">
                        <AlertTriangle className="w-3 h-3" /> {s.bot_flags.join(", ")}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis */}
          {aiAnalysis && (
            <Card className="border-primary/20">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> AI Traffic Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="prose prose-sm dark:prose-invert max-w-none text-xs [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
