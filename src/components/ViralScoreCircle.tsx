import { motion } from "framer-motion";
import { useLang } from "@/lib/LangContext";

interface ViralScoreCircleProps {
  score: number;
}

const ViralScoreCircle = ({ score }: ViralScoreCircleProps) => {
  const { t } = useLang();
  const circumference = 283;
  // Score is out of 80 max now
  const displayScore = Math.min(80, score);
  const offset = circumference - (displayScore / 80) * circumference;

  const getColor = () => {
    if (displayScore >= 60) return "hsl(var(--viral-high))";
    if (displayScore >= 35) return "hsl(var(--viral-mid))";
    return "hsl(var(--viral-low))";
  };

  const getLabel = () => {
    if (displayScore >= 65) return t.viralPotential;
    if (displayScore >= 50) return t.goodPotential;
    if (displayScore >= 30) return t.moderate;
    return t.needsWork;
  };

  return (
    <motion.div
      className="flex flex-col items-center gap-3"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      <div className="relative w-32 h-32 sm:w-44 sm:h-44">
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full blur-xl"
          style={{ background: getColor(), opacity: 0.15 }}
          animate={{ opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <svg className="w-full h-full -rotate-90 relative z-10" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
          <motion.circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke={getColor()}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          />
        </svg>
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <span className="text-3xl sm:text-5xl font-bold text-foreground">{displayScore}</span>
        </motion.div>
      </div>
      <motion.span
        className="text-sm font-medium text-foreground"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        {getLabel()}
      </motion.span>
    </motion.div>
  );
};

export default ViralScoreCircle;
