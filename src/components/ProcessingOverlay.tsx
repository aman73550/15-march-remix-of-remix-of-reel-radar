import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, Link, Video, ScanSearch, Brain, FileText } from "lucide-react";

interface ProcessingOverlayProps {
  show: boolean;
  analysisComplete: boolean;
  onComplete: () => void;
}

const STEPS = [
  { label: "Validating reel link", icon: Link, duration: 8 },
  { label: "Preparing video analysis", icon: Video, duration: 10 },
  { label: "Injection Deploying", icon: ScanSearch, duration: 12 },
  { label: "Running smart analysis", icon: Brain, duration: 18 },
  { label: "Generating final report", icon: FileText, duration: 12 },
];

const TOTAL_DURATION = 55;

const ProcessingOverlay = ({ show, analysisComplete, onComplete }: ProcessingOverlayProps) => {
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
      const eased = raw < maxProgress ? raw : maxProgress;
      setProgress(eased);

      let accumulated = 0;
      for (let i = 0; i < STEPS.length; i++) {
        accumulated += STEPS[i].duration;
        if (elapsed < accumulated) {
          setCurrentStep(i);
          break;
        }
        if (i === STEPS.length - 1) setCurrentStep(i);
      }

      if (eased >= 100 && analysisComplete && !hasCompleted.current) {
        hasCompleted.current = true;
        setTimeout(onComplete, 600);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [show, analysisComplete, onComplete]);

  useEffect(() => {
    if (analysisComplete && show && progress >= 90) {
      setProgress(100);
    }
  }, [analysisComplete, show, progress]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-md overflow-y-auto py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="w-[92vw] max-w-lg mx-auto space-y-6 p-6 sm:p-8"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
          >
            {/* Title */}
            <div className="text-center space-y-2">
              <motion.div
                animate={{ rotate: progress >= 100 ? 0 : 360 }}
                transition={{ duration: 2, repeat: progress >= 100 ? 0 : Infinity, ease: "linear" }}
                className="inline-flex"
              >
                {progress >= 100 ? (
                  <CheckCircle2 className="w-10 h-10 text-primary" />
                ) : (
                  <Loader2 className="w-10 h-10 text-primary" />
                )}
              </motion.div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                {progress >= 100 ? "Analysis Complete!" : "Analyzing Your Reel"}
              </h2>
            </div>

            {/* Progress bar */}
            <div className="space-y-2 sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-2 -mx-6 px-6 sm:-mx-8 sm:px-8 rounded-lg">
              <div className="w-full h-3 rounded-full bg-muted/50 border border-border overflow-hidden">
                <motion.div
                  className="h-full rounded-full instagram-progress-bg"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{Math.round(progress)}%</span>
                <span>{progress >= 100 ? "Done" : `~${Math.max(0, Math.round(TOTAL_DURATION - (progress / 100) * TOTAL_DURATION))}s remaining`}</span>
              </div>
            </div>

            {/* Status steps */}
            <div className="space-y-1.5">
              {STEPS.map((step, i) => {
                const StepIcon = step.icon;
                const isActive = i === currentStep;
                const isDone = i < currentStep || progress >= 100;
                return (
                  <motion.div
                    key={i}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "bg-primary/10 text-foreground font-medium"
                        : isDone
                        ? "text-muted-foreground/70"
                        : "text-muted-foreground/40"
                    }`}
                    animate={isActive ? { x: [0, 4, 0] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    ) : isActive ? (
                      <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
                    ) : (
                      <StepIcon className="w-4 h-4 shrink-0" />
                    )}
                    <span>{step.label}</span>
                  </motion.div>
                );
              })}
            </div>

            {/* Disclaimer */}
            <motion.div
              className="relative rounded-xl border border-primary/30 bg-primary/5 px-5 py-4 text-center overflow-hidden"
              animate={{ boxShadow: ["0 0 15px hsl(340 82% 55% / 0.1)", "0 0 25px hsl(340 82% 55% / 0.25)", "0 0 15px hsl(340 82% 55% / 0.1)"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="absolute inset-0 gradient-primary-bg opacity-[0.04]" />
               <p className="relative text-sm font-semibold text-primary leading-relaxed">
                 ⏳ Please wait while your reel is being analyzed.
              </p>
              <p className="relative text-xs font-medium text-foreground/70 mt-1">
                ⚠️ Do not close this page until the progress bar completes.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProcessingOverlay;
