import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useLang } from "@/lib/LangContext";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { ReelAnalysis } from "@/lib/types";

interface CommentSentimentProps {
  sentiment: NonNullable<ReelAnalysis["commentSentiment"]>;
}

const COLORS = {
  positive: "hsl(145, 65%, 45%)",
  neutral: "hsl(215, 15%, 45%)",
  negative: "hsl(0, 75%, 55%)",
};

const CommentSentiment = ({ sentiment }: CommentSentimentProps) => {
  const { t } = useLang();

  const data = [
    { name: t.positive, value: sentiment.positive, color: COLORS.positive },
    { name: t.neutral, value: sentiment.neutral, color: COLORS.neutral },
    { name: t.negative, value: sentiment.negative, color: COLORS.negative },
  ];

  const dominantSentiment = data.reduce((a, b) => (a.value > b.value ? a : b));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="glass p-5">
        <h3 className="font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
          💬 {t.commentSentiment}
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Pie Chart */}
          <div className="w-40 h-40 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={60}
                  paddingAngle={3}
                  dataKey="value"
                  animationBegin={200}
                  animationDuration={1000}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(225, 20%, 8%)",
                    border: "1px solid hsl(225, 15%, 16%)",
                    borderRadius: "8px",
                    color: "hsl(210, 20%, 92%)",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`${value}%`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend + Details */}
          <div className="flex-1 space-y-3">
            {/* Sentiment bars */}
            {data.map((item, i) => (
              <motion.div
                key={i}
                className="space-y-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
              >
                <div className="flex justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-medium text-foreground">{item.value}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: item.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 1, delay: 0.7 + i * 0.1 }}
                  />
                </div>
              </motion.div>
            ))}

            {/* Dominant sentiment */}
            <div className="pt-1 text-xs text-muted-foreground">
              {t.dominant}: <span className="font-medium" style={{ color: dominantSentiment.color }}>{dominantSentiment.name}</span>
            </div>
          </div>
        </div>

        {/* Top themes */}
        {sentiment.topThemes.length > 0 && (
          <motion.div
            className="mt-4 pt-3 border-t border-border"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <p className="text-xs text-muted-foreground mb-2">{t.topThemes}:</p>
            <div className="flex flex-wrap gap-1.5">
              {sentiment.topThemes.map((theme, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-full bg-muted/50 text-xs text-foreground border border-border"
                >
                  {theme}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Summary */}
        <motion.p
          className="mt-3 text-xs text-muted-foreground leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          {sentiment.summary}
        </motion.p>
      </Card>
    </motion.div>
  );
};

export default CommentSentiment;
