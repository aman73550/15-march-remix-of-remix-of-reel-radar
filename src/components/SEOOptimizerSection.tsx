import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Sparkles, CheckCircle2, Coins } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/LangContext";
import LanguageToggle from "@/components/LanguageToggle";
import UserReviews from "@/components/UserReviews";
import SEOProcessingOverlay from "@/components/SEOProcessingOverlay";
import SEOResultsDisplay from "@/components/SEOResultsDisplay";
import LoginPrompt from "@/components/LoginPrompt";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const SEOOptimizerSection = () => {
  const [input, setInput] = useState("");
  const { lang } = useLang();
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [seoResults, setSeoResults] = useState<any>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const { user, canUseCredit, credits, maxCredits, refreshUsage, loadAnalyses, signInWithGoogle } = useAuth();

  const handleSubmit = useCallback(async () => {
    if (!input.trim()) {
      toast.error(lang === "hi" ? "पहले अपना टॉपिक डालें" : "Please enter your topic first");
      return;
    }
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    if (!canUseCredit) {
      toast.error(`No credits remaining. You've used all ${maxCredits} credits.`);
      return;
    }
    setIsProcessing(true);
    setAnalysisComplete(false);
    setSeoResults(null);
    try {
      const { data, error } = await supabase.functions.invoke("seo-analyze", { body: { topic: input.trim() } });
      if (error || !data?.success) throw new Error(data?.error || error?.message || "SEO analysis failed");
      setSeoResults(data.data);
      setAnalysisComplete(true);
      // Save as a credit usage
      if (user) {
        await supabase.from("user_analyses" as any).insert({
          user_id: user.id,
          reel_url: `seo:${input.trim().slice(0, 100)}`,
          viral_score: null,
          analysis_data: { type: "seo", topic: input.trim() },
        } as any);
        await refreshUsage();
        await loadAnalyses();
      }
    } catch (err: any) {
      toast.error(err.message || "Analysis failed");
      setIsProcessing(false);
    }
  }, [user, canUseCredit, maxCredits, input, lang, refreshUsage, loadAnalyses]);

  const handleProcessingComplete = useCallback(() => { setIsProcessing(false); }, []);

  return (
    <div className="relative z-10 max-w-xl lg:max-w-2xl mx-auto px-3 sm:px-4 py-6 pb-28">
      <LoginPrompt open={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />
      <SEOProcessingOverlay show={isProcessing} analysisComplete={analysisComplete} onComplete={handleProcessingComplete} />
      <div className="flex justify-end mb-4"><LanguageToggle /></div>
      <motion.div className="text-center mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/50 text-xs text-muted-foreground mb-3">
          <Search className="w-3 h-3" />
          {lang === "hi" ? "पेड टूल — SEO ऑप्टिमाइज़ेशन" : "Paid Tool — SEO Optimization"}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Reel <span className="text-primary">SEO Optimizer</span></h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {lang === "hi" ? "डीप रिसर्च से ट्रेंडिंग टाइटल, हैशटैग, म्यूज़िक सुझाव पाएं" : "Get trending titles, hashtags, music suggestions & content improvement tips"}
        </p>
      </motion.div>

      {seoResults && !isProcessing ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <SEOResultsDisplay data={seoResults} topic={input} />
        </motion.div>
      ) : (
        <>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="glass p-4 sm:p-5 mb-6">
              <Textarea value={input} onChange={(e) => setInput(e.target.value)}
                placeholder={lang === "hi" ? "अपना रील कॉन्टेक्स्ट यहाँ डालें..." : "Enter your reel context, caption, or topic here..."}
                className="min-h-[100px] bg-muted/30 border-border/50 text-foreground placeholder:text-muted-foreground/60 resize-none mb-4" />
              
              {user && (
                <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                  <Coins className="w-3.5 h-3.5 text-primary" />
                  {credits > 0 ? `${credits} credit${credits !== 1 ? "s" : ""} remaining` : "No credits remaining"}
                </div>
              )}

              <Button onClick={handleSubmit} disabled={isProcessing || !input.trim()} className="w-full py-5 text-base font-semibold gradient-primary-bg text-primary-foreground hover:opacity-90 transition-opacity">
                <Sparkles className="w-4 h-4 mr-2" />
                {isProcessing ? "Analyzing..." : user ? "Start SEO Analysis (1 Credit)" : "Login & Analyze"}
              </Button>
              
              {!user && (
                <p className="text-center text-xs text-primary mt-2 cursor-pointer hover:underline" onClick={() => setShowLoginPrompt(true)}>
                  Sign in to get {maxCredits} free credits
                </p>
              )}
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <UserReviews title={lang === "hi" ? "SEO टूल रिव्यू" : "SEO Tool Reviews"} />
          </motion.div>
        </>
      )}
    </div>
  );
};

export default SEOOptimizerSection;
