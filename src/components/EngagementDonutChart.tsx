import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface EngagementDonutChartProps {
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  views?: number;
}

const COLORS = [
  "hsl(340, 82%, 55%)",  // likes - pink
  "hsl(200, 80%, 50%)",  // comments - blue
  "hsl(145, 65%, 45%)",  // shares - green
  "hsl(30, 90%, 55%)",   // saves - orange
];

const EngagementDonutChart = ({ likes, comments, shares, saves }: EngagementDonutChartProps) => {
  const rawData = [
    { name: "❤️ Likes", value: likes || 0 },
    { name: "💬 Comments", value: comments || 0 },
    { name: "🔄 Shares", value: shares || 0 },
    { name: "🔖 Saves", value: saves || 0 },
  ].filter(d => d.value > 0);

  if (rawData.length === 0) return null;

  const total = rawData.reduce((sum, d) => sum + d.value, 0);

  const formatNum = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  return (
    <div className="w-full">
      <div className="w-full h-52 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={rawData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              animationBegin={300}
              animationDuration={1200}
            >
              {rawData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "hsl(225, 20%, 12%)",
                border: "1px solid hsl(225, 15%, 22%)",
                borderRadius: "8px",
                color: "hsl(210, 20%, 95%)",
                fontSize: "12px",
              }}
              formatter={(value: number, name: string) => [formatNum(value), name]}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-lg font-bold text-foreground">{formatNum(total)}</span>
          <span className="text-[10px] text-muted-foreground">Total</span>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
        {rawData.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
            <span className="text-foreground/80">{item.name}: <span className="font-bold text-foreground">{formatNum(item.value)}</span></span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EngagementDonutChart;
