import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

interface AnalysisCardProps {
  icon: string;
  title: string;
  score: number;
  details: string[];
  index?: number;
}

const AnalysisCard = ({ icon, title, score, details, index = 0 }: AnalysisCardProps) => {
  const getBarColor = () => {
    if (score >= 7) return "bg-viral-high";
    if (score >= 4) return "bg-viral-mid";
    return "bg-viral-low";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
    >
      <Card className="glass p-5 space-y-3 hover:border-primary/30 transition-colors duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.span
              className="text-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: index * 0.1 + 0.3 }}
            >
              {icon}
            </motion.span>
            <h3 className="font-semibold text-foreground text-sm">{title}</h3>
          </div>
          <motion.span
            className="text-sm font-bold text-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.5 }}
          >
            {score}/10
          </motion.span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${getBarColor()}`}
            initial={{ width: 0 }}
            animate={{ width: `${score * 10}%` }}
            transition={{ duration: 1, delay: index * 0.1 + 0.2, ease: "easeOut" }}
          />
        </div>
        <ul className="space-y-1.5">
          {details.map((detail, i) => (
            <motion.li
              key={i}
              className="text-xs text-muted-foreground leading-relaxed"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.4 + i * 0.1 }}
            >
              • {detail}
            </motion.li>
          ))}
        </ul>
      </Card>
    </motion.div>
  );
};

export default AnalysisCard;
