import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";

interface ScoreBarChartProps {
  hookScore: number;
  captionScore: number;
  hashtagScore: number;
  engagementScore: number;
  trendScore: number;
  labels: {
    hook: string;
    caption: string;
    hashtag: string;
    engagement: string;
    trend: string;
  };
}

const getBarColor = (score: number) => {
  if (score >= 7) return "hsl(145, 65%, 45%)";
  if (score >= 4) return "hsl(45, 90%, 55%)";
  return "hsl(0, 75%, 55%)";
};

const ScoreBarChart = ({ hookScore, captionScore, hashtagScore, engagementScore, trendScore, labels }: ScoreBarChartProps) => {
  const data = [
    { name: labels.hook, score: hookScore, icon: "🎣" },
    { name: labels.caption, score: captionScore, icon: "✍️" },
    { name: labels.hashtag, score: hashtagScore, icon: "#️⃣" },
    { name: labels.engagement, score: engagementScore, icon: "📊" },
    { name: labels.trend, score: trendScore, icon: "🔥" },
  ];

  return (
    <div className="w-full h-52">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }} barSize={14}>
          <XAxis type="number" domain={[0, 10]} hide />
          <YAxis
            type="category"
            dataKey="icon"
            width={30}
            tick={{ fill: "hsl(210, 20%, 92%)", fontSize: 16 }}
            axisLine={false}
            tickLine={false}
          />
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
            formatter={(value: number) => [`${value}/10`, "Score"]}
            labelFormatter={(label) => {
              const item = data.find((d) => d.icon === label);
              return item ? `${item.icon} ${item.name}` : label;
            }}
          />
          <Bar dataKey="score" radius={[0, 6, 6, 0]} animationDuration={1500} animationBegin={300} barSize={14} label={{ position: "right", fill: "hsl(210, 20%, 92%)", fontSize: 13, fontWeight: 600, formatter: (v: number) => `${v}/10` }}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreBarChart;
