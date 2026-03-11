import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

const SampleAnalysisPreview = () => {
  const scores = [
    { label: "Hook Score", score: 8, color: "hsl(var(--viral-high))" },
    { label: "Caption Score", score: 7, color: "hsl(var(--primary))" },
    { label: "Hashtag Score", score: 6, color: "hsl(var(--secondary))" },
  ];
  const viralScore = 74;

  return (
    <motion.div
      className="relative z-10 max-w-xl lg:max-w-2xl mx-auto px-3 sm:px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.5 }}
    >
      <div className="text-center mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg font-bold text-foreground">Sample Analysis Preview</h2>
        <p className="text-[10px] sm:text-xs text-muted-foreground">Here's what your analysis will look like</p>
      </div>

      <Card className="glass p-4 sm:p-5 space-y-4">
        {/* Viral Score Circle */}
        <div className="flex items-center justify-center">
          <div className="relative w-24 h-24">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
              <motion.circle
                cx="50" cy="50" r="42" fill="none"
                stroke="hsl(var(--viral-high))"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - viralScore / 100) }}
                transition={{ duration: 1.5, delay: 1.2, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-foreground">{viralScore}%</span>
              <span className="text-[9px] text-muted-foreground">Viral Probability</span>
            </div>
          </div>
        </div>

        {/* Score Bars */}
        <div className="space-y-2.5">
          {scores.map((s, i) => (
            <div key={s.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{s.label}</span>
                <span className="font-bold text-foreground">{s.score}/10</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: s.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${s.score * 10}%` }}
                  transition={{ duration: 0.8, delay: 1.4 + i * 0.15, ease: "easeOut" }}
                />
              </div>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-center text-muted-foreground italic">
          This is a sample preview. Your actual results may vary.
        </p>
      </Card>
    </motion.div>
  );
};

export default SampleAnalysisPreview;
