import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Activity, Cpu, DollarSign, Zap, BarChart3, Clock, AlertTriangle,
  TrendingUp, Loader2, Sparkles, RefreshCw, ChevronDown, ChevronUp
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface UsageStats {
  totalApiToday: number;
  totalAiToday: number;
  totalCostToday: number;
  totalCostWeek: number;
  totalCostMonth: number;
  totalApiWeek: number;
  totalApiMonth: number;
  functionBreakdown: Record<string, { count: number; aiCalls: number; cost: number }>;
  modelBreakdown: Record<string, { count: number; cost: number; tokens: number }>;
  hourlyDistribution: Record<number, number>;
  avgDuration: number;
  errorRate: number;
  errorCount: number;
}

const COST_THRESHOLDS = { low: 0.05, medium: 0.20 }; // USD

function getCostLevel(cost: number): { color: string; label: string; bg: string } {
  if (cost <= COST_THRESHOLDS.low) return { color: "text-[hsl(var(--viral-high))]", label: "Low", bg: "bg-[hsl(var(--viral-high))]/10" };
  if (cost <= COST_THRESHOLDS.medium) return { color: "text-accent", label: "Medium", bg: "bg-accent/10" };
  return { color: "text-primary", label: "High", bg: "bg-primary/10" };
}

const PIE_COLORS = [
  "hsl(340, 82%, 55%)", "hsl(260, 60%, 55%)", "hsl(30, 90%, 55%)",
  "hsl(170, 60%, 45%)", "hsl(200, 70%, 50%)", "hsl(50, 80%, 50%)",
];

export default function AdminAIUsage() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCost, setAiCost] = useState<number>(0);
  const [expanded, setExpanded] = useState(true);

  const loadStats = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("usage-analyzer", {
        body: { action: "stats" },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Failed to load stats");
      setStats(data.stats);
    } catch (err: any) {
      toast.error(err.message || "Failed to load usage stats");
    } finally {
      setLoading(false);
    }
  };

  const runAiSuggest = async () => {
    if (!stats) {
      toast.error("Load stats first");
      return;
    }
    setAiLoading(true);
    setAiAnalysis(null);
    try {
      const { data, error } = await supabase.functions.invoke("usage-analyzer", {
        body: {
          action: "ai-suggest",
          usageData: {
            totalApiToday: stats.totalApiToday,
            totalAiToday: stats.totalAiToday,
            totalCostToday: stats.totalCostToday,
            totalCostWeek: stats.totalCostWeek,
            totalCostMonth: stats.totalCostMonth,
            functionBreakdown: stats.functionBreakdown,
            modelBreakdown: stats.modelBreakdown,
            avgDuration: stats.avgDuration,
            errorRate: stats.errorRate,
          },
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "AI analysis failed");
      setAiAnalysis(data.analysis);
      setAiCost(data.cost || 0);
      toast.success("AI analysis complete!");
    } catch (err: any) {
      toast.error(err.message || "AI analysis failed");
    } finally {
      setAiLoading(false);
    }
  };

  // Prepare chart data
  const functionChartData = stats
    ? Object.entries(stats.functionBreakdown).map(([name, d]) => ({
        name: name.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
        requests: d.count,
        aiCalls: d.aiCalls,
        cost: Math.round(d.cost * 10000) / 10000,
      }))
    : [];

  const modelPieData = stats
    ? Object.entries(stats.modelBreakdown).map(([name, d]) => ({
        name,
        value: d.count,
        cost: d.cost,
      }))
    : [];

  const hourlyData = stats
    ? Array.from({ length: 24 }, (_, h) => ({
        hour: `${h}:00`,
        requests: stats.hourlyDistribution[h] || 0,
      }))
    : [];

  const todayCost = stats ? getCostLevel(stats.totalCostToday) : getCostLevel(0);
  const weekCost = stats ? getCostLevel(stats.totalCostWeek) : getCostLevel(0);
  const monthCost = stats ? getCostLevel(stats.totalCostMonth) : getCostLevel(0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2">
          <h2 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" /> AI & API Usage Analyzer
          </h2>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>
        <Button
          onClick={loadStats}
          disabled={loading}
          variant="outline"
          size="sm"
          className="h-8 text-xs border-border"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <RefreshCw className="w-3.5 h-3.5 mr-1" />}
          {stats ? "Refresh" : "Load Stats"}
        </Button>
      </div>

      {!expanded && <p className="text-[10px] text-muted-foreground">Click to expand usage dashboard</p>}

      {expanded && (
        <div className="space-y-4">
          {!stats && !loading && (
            <Card className="border-border bg-card">
              <CardContent className="p-6 text-center space-y-3">
                <Activity className="w-10 h-10 text-muted-foreground/30 mx-auto" />
                <p className="text-sm text-muted-foreground">Click "Load Stats" to view API & AI usage data</p>
                <p className="text-[10px] text-muted-foreground/60">All tracking is done automatically from backend logs — no AI runs until you click the suggest button</p>
              </CardContent>
            </Card>
          )}

          {stats && (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <StatCard icon={Zap} label="API Requests Today" value={stats.totalApiToday} color="text-primary" />
                <StatCard icon={Cpu} label="AI Calls Today" value={stats.totalAiToday} color="text-secondary" />
                <StatCard icon={Clock} label="Avg Response" value={`${stats.avgDuration}ms`} color="text-accent" />
                <StatCard icon={AlertTriangle} label="Error Rate" value={`${stats.errorRate}%`} color={stats.errorRate > 5 ? "text-primary" : "text-[hsl(var(--viral-high))]"} />
              </div>

              {/* Cost Meters */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <CostMeter label="Today" cost={stats.totalCostToday} level={todayCost} />
                <CostMeter label="This Week" cost={stats.totalCostWeek} level={weekCost} />
                <CostMeter label="This Month" cost={stats.totalCostMonth} level={monthCost} />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {/* Function Breakdown Bar Chart */}
                <Card className="border-border bg-card">
                  <CardHeader className="px-4 py-3">
                    <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-primary" /> Requests by Function
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-2 pb-3">
                    {functionChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={functionChartData}>
                          <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                          <YAxis tick={{ fontSize: 9 }} />
                          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                          <Bar dataKey="requests" fill="hsl(340, 82%, 55%)" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="aiCalls" fill="hsl(260, 60%, 55%)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-[10px] text-muted-foreground text-center py-8">No data yet</p>
                    )}
                  </CardContent>
                </Card>

                {/* Model Distribution Pie */}
                <Card className="border-border bg-card">
                  <CardHeader className="px-4 py-3">
                    <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-secondary" /> AI Model Usage
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-2 pb-3">
                    {modelPieData.length > 0 ? (
                      <div className="flex items-center gap-2">
                        <ResponsiveContainer width="50%" height={160}>
                          <PieChart>
                            <Pie data={modelPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} innerRadius={30}>
                              {modelPieData.map((_, i) => (
                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="flex-1 space-y-1.5">
                          {modelPieData.map((m, i) => (
                            <div key={m.name} className="flex items-center gap-1.5">
                              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                              <span className="text-[9px] text-muted-foreground truncate">{m.name}</span>
                              <span className="text-[9px] font-medium text-foreground ml-auto">{m.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-muted-foreground text-center py-8">No AI calls yet</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Hourly Distribution */}
              <Card className="border-border bg-card">
                <CardHeader className="px-4 py-3">
                  <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-accent" /> Hourly Traffic (Today)
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-2 pb-3">
                  <ResponsiveContainer width="100%" height={120}>
                    <BarChart data={hourlyData}>
                      <XAxis dataKey="hour" tick={{ fontSize: 8 }} interval={2} />
                      <YAxis tick={{ fontSize: 9 }} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                      <Bar dataKey="requests" fill="hsl(30, 90%, 55%)" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Per-function Cost Table */}
              <Card className="border-border bg-card">
                <CardHeader className="px-4 py-3">
                  <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[hsl(var(--viral-high))]" /> Cost per API Function
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="space-y-1.5">
                    {functionChartData.map((fn) => {
                      const fnCost = getCostLevel(fn.cost);
                      return (
                        <div key={fn.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 text-[10px] sm:text-xs">
                          <span className="text-foreground font-medium">{fn.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-muted-foreground">{fn.requests} calls</span>
                            <span className={`font-semibold ${fnCost.color}`}>
                              ${fn.cost.toFixed(4)}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-medium ${fnCost.bg} ${fnCost.color}`}>
                              {fnCost.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {functionChartData.length === 0 && (
                      <p className="text-[10px] text-muted-foreground text-center py-4">No API calls logged yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* AI Check & Suggest Button */}
              <Card className="border-primary/20 bg-card overflow-hidden">
                <CardContent className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" /> AI Check & Suggest
                      </h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        AI will analyze your usage data and suggest cost optimizations
                      </p>
                    </div>
                    <Button
                      onClick={runAiSuggest}
                      disabled={aiLoading || !stats}
                      className="gradient-primary-bg text-primary-foreground text-xs h-9 px-4"
                    >
                      {aiLoading ? (
                        <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Analyzing...</>
                      ) : (
                        <><Sparkles className="w-3.5 h-3.5 mr-1.5" /> AI Check & Suggest</>
                      )}
                    </Button>
                  </div>

                  {aiAnalysis && (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-medium text-primary">AI Analysis Result</span>
                        {aiCost > 0 && (
                          <span className="text-[9px] text-muted-foreground">This analysis cost: ${aiCost.toFixed(4)}</span>
                        )}
                      </div>
                      <div className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                        {aiAnalysis}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Sub-components
function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-1.5 mb-1">
          <Icon className={`w-3.5 h-3.5 ${color} flex-shrink-0`} />
          <span className="text-[10px] sm:text-xs text-muted-foreground truncate">{label}</span>
        </div>
        <p className="text-lg sm:text-2xl font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

function CostMeter({ label, cost, level }: { label: string; cost: number; level: { color: string; label: string; bg: string } }) {
  const maxCost = 1.0; // $1 max for meter
  const pct = Math.min(100, (cost / maxCost) * 100);

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-3 sm:p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-xs text-muted-foreground">{label}</span>
          <span className={`px-1.5 py-0.5 rounded text-[8px] font-medium ${level.bg} ${level.color}`}>
            {level.label}
          </span>
        </div>
        <p className={`text-lg font-bold ${level.color}`}>${cost.toFixed(4)}</p>
        <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: level.label === "Low"
                ? "hsl(var(--viral-high))"
                : level.label === "Medium"
                ? "hsl(var(--accent))"
                : "hsl(var(--primary))",
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
