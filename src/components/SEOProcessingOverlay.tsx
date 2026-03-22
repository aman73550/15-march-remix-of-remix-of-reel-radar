import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, Search, Brain, FileText, TrendingUp, Hash } from "lucide-react";

interface SEOProcessingOverlayProps {
  show: boolean;
  analysisComplete: boolean;
  onComplete: () => void;
}

const STEPS = [
  { label: "Validating input & payment", icon: Search, duration: 8 },
  { label: "Researching trending keywords", icon: TrendingUp, duration: 12 },
  { label: "Analyzing hashtag performance", icon: Hash, duration: 10 },
  { label: "Running deep SEO analysis", icon: Brain, duration: 18 },
  { label: "Generating optimized report", icon: FileText, duration: 12 },
];

const TOTAL_DURATION = 60;

const SEOProcessingOverlay = ({ show, analysisComplete, onComplete }: SEOProcessingOverlayProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number>();
  const hasCompleted = useRef(false);

  useEffect(() => {
    if (show) {
      setProgress(0);
      setCurrentStep(0);
      startTimeRef.current = Date.now();
      hasCompleted.current = false;
    } else {
      startTimeRef.current = null;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
  }, [show]);

  useEffect(() => {
    if (!show) return;
    const tick = () => {
      if (!startTimeRef.current) return;
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const maxProgress = analysisComplete ? 100 : 95;
      const raw = Math.min((elapsed / TOTAL_DURATION) * 100, maxProgress);
      setProgress(raw);
      let accumulated = 0;
      for (let i = 0; i < STEPS.length; i++) {
        accumulated += STEPS[i].duration;
        if (elapsed < accumulated) { setCurrentStep(i); break; }
        if (i === STEPS.length - 1) setCurrentStep(i);
      }
      if (raw >= 100 && analysisComplete && !hasCompleted.current) {
        hasCompleted.current = true;
        setTimeout(onComplete, 600);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [show, analysisComplete, onComplete]);

  useEffect(() => {
    if (analysisComplete && show && progress >= 90) setProgress(100);
  }, [analysisComplete, show, progress]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-md overflow-y-auto"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-[92vw] max-w-lg mx-auto space-y-5 p-6 sm:p-8 my-6"
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
          >
            <div className="text-center space-y-2">
              <motion.div
                animate={{ rotate: progress >= 100 ? 0 : 360 }}
                transition={{ duration: 2, repeat: progress >= 100 ? 0 : Infinity, ease: "linear" }}
                className="inline-flex"
              >
                {progress >= 100 ? <CheckCircle2 className="w-10 h-10 text-primary" /> : <Loader2 className="w-10 h-10 text-primary" />}
              </motion.div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                {progress >= 100 ? "SEO Analysis Complete!" : "Deep SEO Analysis Running"}
              </h2>
            </div>

            <div className="space-y-2">
              <div className="w-full h-3 rounded-full bg-muted/50 border border-border overflow-hidden">
                <motion.div className="h-full rounded-full gradient-primary-bg" style={{ width: `${progress}%` }} transition={{ duration: 0.3, ease: "easeOut" }} />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{Math.round(progress)}%</span>
                <span>{progress >= 100 ? "Done" : `~${Math.max(0, Math.round(TOTAL_DURATION - (progress / 100) * TOTAL_DURATION))}s remaining`}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              {STEPS.map((step, i) => {
                const StepIcon = step.icon;
                const isActive = i === currentStep;
                const isDone = i < currentStep || progress >= 100;
                return (
                  <motion.div
                    key={i}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive ? "bg-primary/10 text-foreground font-medium" : isDone ? "text-muted-foreground/70" : "text-muted-foreground/40"
                    }`}
                    animate={isActive ? { x: [0, 4, 0] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> : isActive ? <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" /> : <StepIcon className="w-4 h-4 shrink-0" />}
                    <span>{step.label}</span>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              className="relative rounded-xl border border-primary/30 bg-primary/5 px-5 py-4 text-center overflow-hidden"
              animate={{ boxShadow: ["0 0 15px hsl(340 82% 55% / 0.1)", "0 0 25px hsl(340 82% 55% / 0.25)", "0 0 15px hsl(340 82% 55% / 0.1)"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <p className="text-sm font-semibold text-primary leading-relaxed">⏳ Please wait while deep SEO research is being performed.</p>
              <p className="text-xs font-medium text-foreground/70 mt-1">⚠️ Do not close this page until the progress bar completes.</p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SEOProcessingOverlay;
