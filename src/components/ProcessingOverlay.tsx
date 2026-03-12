import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, Link, Video, ScanSearch, Brain, FileText } from "lucide-react";
import { BannerAd } from "./AdSlots";

interface ProcessingOverlayProps {
  show: boolean;
  analysisComplete: boolean;
  onComplete: () => void;
}

const STEPS = [
  { label: "Validating reel link", icon: Link, duration: 8 },
  { label: "Preparing video analysis", icon: Video, duration: 10 },
  { label: "Extracting frames", icon: ScanSearch, duration: 12 },
  { label: "Running AI analysis", icon: Brain, duration: 18 },
  { label: "Generating final report", icon: FileText, duration: 12 },
];

const TOTAL_DURATION = 55; // seconds

const ProcessingOverlay = ({ show, analysisComplete, onComplete }: ProcessingOverlayProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number>();
  const hasCompleted = useRef(false);

  // Reset on show
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

  // Animate progress
  useEffect(() => {
    if (!show) return;

    const tick = () => {
      if (!startTimeRef.current) return;
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      // Ease out — slows down near end, caps at 95% until analysis is truly done
      const maxProgress = analysisComplete ? 100 : 95;
      const raw = Math.min((elapsed / TOTAL_DURATION) * 100, maxProgress);
      // Ease-out curve
      const eased = raw < maxProgress ? raw : maxProgress;
      setProgress(eased);

      // Determine current step
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

  // When analysis completes, jump to 100
  useEffect(() => {
    if (analysisComplete && show && progress >= 90) {
      setProgress(100);
    }
  }, [analysisComplete, show, progress]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-md"
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
            <div className="space-y-2">
              <div className="w-full h-3 rounded-full bg-muted/50 border border-border overflow-hidden">
                <motion.div
                  className="h-full rounded-full gradient-primary-bg"
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

            {/* Video ad area */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="text-center text-[10px] text-muted-foreground py-1 bg-muted/30 border-b border-border">
                Sponsored · Ad
              </div>
              <div
                className="w-full h-[200px] sm:h-[250px] flex items-center justify-center"
                data-ad-slot="processing-video"
                id="ad-processing-video"
              >
                <div className="w-full h-full bg-gradient-to-br from-muted/30 via-card to-muted/30 flex flex-col items-center justify-center gap-2">
                  <div className="w-14 h-14 rounded-2xl gradient-primary-bg opacity-20" />
                  <span className="text-xs text-muted-foreground/50">Video Ad Space</span>
                </div>
              </div>
            </div>

            {/* Banner ad */}
            <BannerAd slot="processing-banner" />

            {/* Disclaimer */}
            <p className="text-center text-[11px] text-muted-foreground/60 leading-relaxed">
              Please wait while our AI analyzes your reel.<br />
              Do not close this page until the progress bar completes.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProcessingOverlay;
