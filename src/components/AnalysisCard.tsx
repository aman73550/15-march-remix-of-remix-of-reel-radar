import { Card } from "@/components/ui/card";

interface AnalysisCardProps {
  icon: string;
  title: string;
  score: number;
  details: string[];
}

const AnalysisCard = ({ icon, title, score, details }: AnalysisCardProps) => {
  const getBarColor = () => {
    if (score >= 7) return "bg-viral-high";
    if (score >= 4) return "bg-viral-mid";
    return "bg-viral-low";
  };

  return (
    <Card className="glass p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <h3 className="font-semibold text-foreground text-sm">{title}</h3>
        </div>
        <span className="text-sm font-bold text-foreground">{score}/10</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${getBarColor()}`}
          style={{ width: `${score * 10}%` }}
        />
      </div>
      <ul className="space-y-1.5">
        {details.map((detail, i) => (
          <li key={i} className="text-xs text-muted-foreground leading-relaxed">
            • {detail}
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default AnalysisCard;
