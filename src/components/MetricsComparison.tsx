import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useLang } from "@/lib/LangContext";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, Legend } from "recharts";
import type { ReelAnalysis } from "@/lib/types";

interface MetricsComparisonProps {
  metrics: NonNullable<ReelAnalysis["metricsComparison"]>;
}

const MetricsComparison = ({ metrics }: MetricsComparisonProps) => {
  const { t } = useLang();

  const data = Object.entries(metrics)
    .filter(([_, v]) => v)
    .map(([key, val]) => ({
      name: t[`metric_${key}` as keyof typeof t] || key.charAt(0).toUpperCase() + key.slice(1),
      yours: val!.value,
      average: val!.avgInCategory,
      verdict: val!.verdict,
    }));

  const getVerdictColor = (verdict: string) => {
    const v = verdict.toLowerCase();
    if (v.includes("above") || v.includes("great") || v.includes("excellent") || v.includes("अच्छ")) return "hsl(145, 65%, 45%)";
    if (v.includes("below") || v.includes("low") || v.includes("कम")) return "hsl(0, 75%, 55%)";
    return "hsl(45, 90%, 55%)";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="glass p-5">
        <h3 className="font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
          📊 {t.metricsVsAvg}
        </h3>

        <div className="w-full h-52 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: 0, right: 10 }}>
              <XAxis
                dataKey="name"
                tick={{ fill: "hsl(210, 20%, 92%)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: "hsl(225, 20%, 12%)",
                  border: "1px solid hsl(225, 15%, 22%)",
                  borderRadius: "8px",
                  color: "hsl(210, 20%, 95%)",
                  fontSize: "12px",
                }}
                itemStyle={{ color: "hsl(210, 20%, 95%)" }}
                labelStyle={{ color: "hsl(210, 20%, 80%)" }}
                formatter={(value: number) => value?.toLocaleString() ?? "0"}
              />
              <Legend
                wrapperStyle={{ fontSize: "11px" }}
                formatter={(value: string) => <span style={{ color: "hsl(210, 20%, 75%)" }}>{value}</span>}
              />
              <Bar dataKey="yours" name={t.yours} fill="hsl(340, 82%, 55%)" radius={[4, 4, 0, 0]} minPointSize={4} />
              <Bar dataKey="average" name={t.categoryAvg} fill="hsl(215, 15%, 45%)" radius={[4, 4, 0, 0]} minPointSize={4} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {data.map((item, i) => (
            <motion.div
              key={i}
              className="rounded-lg bg-muted/30 p-3 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              <p className="text-xs text-muted-foreground mb-1">{item.name}</p>
              <p className="text-lg font-bold text-foreground">{(item.yours ?? 0).toLocaleString()}</p>
              <p className="text-[10px] mt-1" style={{ color: getVerdictColor(item.verdict) }}>
                {item.verdict}
              </p>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};

export default MetricsComparison;
