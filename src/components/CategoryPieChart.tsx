import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface CategoryPieChartProps {
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

const COLORS = [
  "hsl(340, 82%, 55%)",
  "hsl(260, 60%, 55%)",
  "hsl(30, 90%, 55%)",
  "hsl(145, 65%, 45%)",
  "hsl(200, 80%, 50%)",
];

const CategoryPieChart = ({ hookScore, captionScore, hashtagScore, engagementScore, trendScore, labels }: CategoryPieChartProps) => {
  const data = [
    { name: labels.hook, value: hookScore, icon: "🎣" },
    { name: labels.caption, value: captionScore, icon: "✍️" },
    { name: labels.hashtag, value: hashtagScore, icon: "#️⃣" },
    { name: labels.engagement, value: engagementScore, icon: "📊" },
    { name: labels.trend, value: trendScore, icon: "🔥" },
  ];

  return (
    <div className="w-full">
      <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
            animationBegin={200}
            animationDuration={1200}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} stroke="none" />
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
            itemStyle={{ color: "hsl(210, 20%, 95%)" }}
            labelStyle={{ color: "hsl(210, 20%, 80%)" }}
            formatter={(value: number, name: string) => [`${value}/10`, name]}
          />
        </PieChart>
      </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-3">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs sm:text-sm">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: COLORS[i] }} />
            <span className="text-foreground/90">{item.icon} {item.name}: <span className="font-bold text-foreground">{item.value}/10</span></span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPieChart;
