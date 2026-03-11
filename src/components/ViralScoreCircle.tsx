interface ViralScoreCircleProps {
  score: number;
}

const ViralScoreCircle = ({ score }: ViralScoreCircleProps) => {
  const circumference = 283;
  const offset = circumference - (score / 100) * circumference;
  
  const getColor = () => {
    if (score >= 70) return "hsl(var(--viral-high))";
    if (score >= 40) return "hsl(var(--viral-mid))";
    return "hsl(var(--viral-low))";
  };

  const getLabel = () => {
    if (score >= 80) return "🔥 Viral Potential";
    if (score >= 60) return "📈 Good Potential";
    if (score >= 40) return "⚡ Moderate";
    return "💡 Needs Work";
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
          />
          <circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke={getColor()}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="animate-score-fill"
            style={{ "--score-offset": offset } as React.CSSProperties}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-foreground">{score}</span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>
      <span className="text-sm font-medium text-foreground">{getLabel()}</span>
    </div>
  );
};

export default ViralScoreCircle;
