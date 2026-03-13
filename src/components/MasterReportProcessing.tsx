import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, CreditCard, Brain, FileText, Download, Crown, Sparkles } from "lucide-react";
import { BannerAd } from "./AdSlots";
import { Button } from "@/components/ui/button";

interface Props {
  show: boolean;
  reportReady: boolean;
  onDownload: () => void;
}

const STEPS = [
  { label: "Payment verified", icon: CreditCard, duration: 3 },
  { label: "Analyzing deep metrics", icon: Brain, duration: 12 },
  { label: "Generating competitor insights", icon: Sparkles, duration: 15 },
  { label: "Building improvement roadmap", icon: FileText, duration: 12 },
  { label: "Preparing premium PDF", icon: Download, duration: 8 },
];

const TOTAL_DURATION = 45;

const MasterReportProcessing = ({ show, reportReady, onDownload }: Props) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number>();
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (show) {
      setProgress(0);
      setCurrentStep(0);
      setCompleted(false);
      startTimeRef.current = Date.now();
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
      const maxProgress = reportReady ? 100 : 92;
      const raw = Math.min((elapsed / TOTAL_DURATION) * 100, maxProgress);
      setProgress(raw);

      let accumulated = 0;
      for (let i = 0; i < STEPS.length; i++) {
        accumulated += STEPS[i].duration;
        if (elapsed < accumulated) { setCurrentStep(i); break; }
        if (i === STEPS.length - 1) setCurrentStep(i);
      }

      if (raw >= 100 && reportReady) {
        setCompleted(true);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [show, reportReady]);

  useEffect(() => {
    if (reportReady && show && progress >= 88) {
      setProgress(100);
    }
  }, [reportReady, show, progress]);

  if (!show) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-[92vw] max-w-lg mx-auto space-y-5 p-6 sm:p-8"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 25 }}
      >
        {/* Title */}
        <div className="text-center space-y-2">
          <motion.div
            animate={{ rotate: completed ? 0 : 360 }}
            transition={{ duration: 2, repeat: completed ? 0 : Infinity, ease: "linear" }}
            className="inline-flex"
          >
            {completed ? (
              <CheckCircle2 className="w-10 h-10 text-primary" />
            ) : (
              <Loader2 className="w-10 h-10 text-primary" />
            )}
          </motion.div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            {completed ? "Master Report Ready! 🎉" : "Generating Master Report"}
          </h2>
          {!completed && (
            <p className="text-xs text-muted-foreground">Our AI is crafting your premium analysis...</p>
          )}
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="w-full h-3 rounded-full bg-muted/50 border border-border overflow-hidden">
            <motion.div
              className="h-full rounded-full instagram-progress-bg"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{Math.round(progress)}%</span>
            <span>{completed ? "Complete!" : `~${Math.max(0, Math.round(TOTAL_DURATION - (progress / 100) * TOTAL_DURATION))}s remaining`}</span>
          </div>
        </div>

        {/* Ad below progress bar */}
        <div className="-mx-6 sm:mx-0">
          <BannerAd slot="report-progress-below" />
        </div>

        {/* Steps */}
        <div className="space-y-1.5">
          {STEPS.map((step, i) => {
            const StepIcon = step.icon;
            const isActive = i === currentStep && !completed;
            const isDone = i < currentStep || completed;
            return (
              <motion.div
                key={i}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? "bg-primary/10 text-foreground font-medium"
                    : isDone ? "text-muted-foreground/70"
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

        {/* Download button when complete */}
        {completed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              onClick={onDownload}
              className="w-full h-12 gradient-primary-bg text-primary-foreground font-bold shadow-glow hover:opacity-90 transition-opacity text-base"
            >
              <Crown className="w-5 h-5 mr-2" />
              Download Master Report
            </Button>
          </motion.div>
        )}

        {/* Ads during processing */}
        {!completed && (
          <>
            <div className="-mx-6 sm:mx-0">
              <BannerAd slot="processing-overlay" />
            </div>
            <div className="-mx-6 sm:mx-0">
              <BannerAd slot="report-processing-bottom" />
            </div>
          </>
        )}

        {/* Disclaimer */}
        {!completed && (
          <motion.div
            className="relative rounded-xl border border-primary/30 bg-primary/5 px-5 py-4 text-center overflow-hidden"
            animate={{ boxShadow: ["0 0 15px hsl(340 82% 55% / 0.1)", "0 0 25px hsl(340 82% 55% / 0.25)", "0 0 15px hsl(340 82% 55% / 0.1)"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="absolute inset-0 gradient-primary-bg opacity-[0.04]" />
            <p className="relative text-sm font-semibold text-primary leading-relaxed">
              ⏳ Please wait while your Master Report is being generated.
            </p>
            <p className="relative text-xs font-medium text-foreground/70 mt-1">
              ⚠️ Do not close this page until the report is ready.
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default MasterReportProcessing;
