import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";

interface ScoreRadarChartProps {
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

const ScoreRadarChart = ({ hookScore, captionScore, hashtagScore, engagementScore, trendScore, labels }: ScoreRadarChartProps) => {
  const data = [
    { subject: labels.hook, score: hookScore, fullMark: 10 },
    { subject: labels.caption, score: captionScore, fullMark: 10 },
    { subject: labels.hashtag, score: hashtagScore, fullMark: 10 },
    { subject: labels.engagement, score: engagementScore, fullMark: 10 },
    { subject: labels.trend, score: trendScore, fullMark: 10 },
  ];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="hsl(225, 15%, 22%)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "hsl(210, 20%, 85%)", fontSize: 11, fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 10]}
            tick={{ fill: "hsl(210, 20%, 60%)", fontSize: 9 }}
            tickCount={6}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="hsl(340, 82%, 55%)"
            fill="url(#radarGradient)"
            fillOpacity={0.45}
            strokeWidth={2}
            animationDuration={1500}
            animationBegin={200}
          />
          <defs>
            <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(340, 82%, 55%)" stopOpacity={0.6} />
              <stop offset="50%" stopColor="hsl(260, 60%, 55%)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="hsl(30, 90%, 55%)" stopOpacity={0.6} />
            </linearGradient>
          </defs>
          <Tooltip
            contentStyle={{
              background: "hsl(225, 20%, 12%)",
              border: "1px solid hsl(225, 15%, 22%)",
              borderRadius: "8px",
              color: "hsl(210, 20%, 95%)",
              fontSize: "12px",
            }}
            formatter={(value: number) => [`${value}/10`, "Score"]}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreRadarChart;
