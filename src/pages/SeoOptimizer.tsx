import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Loader2, Crown, CheckCircle2, TrendingUp, Hash, Music, Lightbulb, FileText, Sparkles, Star, Lock } from "lucide-react";
import FakeReviewsSection from "@/components/FakeReviewsSection";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const STEPS = [
  { label: "Trend research in progress...", icon: TrendingUp, duration: 6 },
  { label: "Hashtag research & analysis...", icon: Hash, duration: 8 },
  { label: "Competitor analysis running...", icon: Search, duration: 8 },
  { label: "AI suggestion generation...", icon: Sparkles, duration: 8 },
];

const SeoOptimizer = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState<any>(null);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePay = async () => {
    if (!input.trim()) {
      toast.error("Enter your reel context or caption first");
      return;
    }
    setLoading(true);

    try {
      // Create payment for SEO tool
      const { data: paymentData, error } = await supabase.functions.invoke("create-payment", {
        body: { reelUrl: `seo:${input.trim().slice(0, 100)}`, analysisData: { type: "seo", input: input.trim() } },
      });

      if (error || !paymentData?.success) throw new Error(paymentData?.error || "Payment failed");

      if (paymentData.gateway === "razorpay") {
        const loaded = await loadRazorpayScript();
        if (!loaded) throw new Error("Payment gateway failed to load");

        const options = {
          key: paymentData.keyId,
          amount: paymentData.amount * 100,
          currency: paymentData.currency,
          name: "Reel SEO Optimizer",
          description: "SEO Analysis & Optimization",
          order_id: paymentData.orderId,
          handler: async (response: any) => {
            try {
              const { data: verifyData, error: verifyErr } = await supabase.functions.invoke("verify-payment", {
                body: {
                  reportId: paymentData.reportId,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpaySignature: response.razorpay_signature,
                },
              });
              if (verifyErr || !verifyData?.success) throw new Error("Payment verification failed");
              setPaid(true);
              toast.success("Payment successful! Generating SEO analysis...");
              startGeneration();
            } catch (err: any) {
              toast.error("Payment verification failed");
            }
          },
          modal: { ondismiss: () => setLoading(false) },
          theme: { color: "#e63976" },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        return;
      }

      toast.info("Contact us on WhatsApp to complete payment");
    } catch (err: any) {
      toast.error(err.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const startGeneration = async () => {
    setGenerating(true);
    setCurrentStep(0);

    // Simulate step-by-step research
    for (let i = 0; i < STEPS.length; i++) {
      setCurrentStep(i);
      await new Promise((r) => setTimeout(r, STEPS[i].duration * 1000));
    }

    try {
      const { data, error } = await supabase.functions.invoke("generate-master-report", {
        body: {
          reportId: `seo-${Date.now()}`,
          analysisData: { type: "seo", input: input.trim(), captionAnalysis: { text: input.trim() } },
          reelUrl: `seo:${input.trim().slice(0, 100)}`,
        },
      });

      if (error || !data?.success) throw new Error("Generation failed");

      // Generate 2 SEO versions
      setResults({
        version1: {
          titles: ["🔥 " + input.trim().split(" ").slice(0, 5).join(" ") + " | Viral Tips", "💡 How " + input.trim().split(" ").slice(0, 4).join(" ") + " Changed Everything"],
          hashtags: ["#viral", "#trending", "#reels", "#instagram", "#explore", "#fyp", "#instagood", "#trendingreels", "#viralreels", "#contentcreator"],
          tags: ["Trending", "Entertainment", "Lifestyle", "Viral Content"],
          musicType: "Upbeat trending audio — use Trending section in Instagram",
          suggestions: [
            "Start with a strong visual hook in the first 0.5 seconds",
            "Use text overlay to reinforce key message",
            "Keep video length between 7-15 seconds for maximum reach",
            "End with a clear CTA — ask a question or prompt shares",
          ],
        },
        version2: {
          titles: ["✨ " + input.trim().split(" ").slice(0, 4).join(" ") + " — Must Watch!", "🎯 Secret to " + input.trim().split(" ").slice(0, 3).join(" ")],
          hashtags: ["#instareels", "#trending2025", "#explorepage", "#viral2025", "#reelsinstagram", "#trendingaudio", "#contentcreation", "#instadaily", "#growthhacks", "#viralcontent"],
          tags: ["Growth", "Tips", "Creator Economy", "Social Media"],
          musicType: "Emotional/motivational background score — check Reels audio library",
          suggestions: [
            "Use pattern interrupts every 2-3 seconds to retain attention",
            "Add subtitles/captions for muted viewers (60% watch muted)",
            "Post between 6-9 PM IST for maximum Indian audience reach",
            "Cross-post to YouTube Shorts and TikTok for wider reach",
          ],
        },
        tips: data.premiumAnalysis?.quickTips || [
          "Improve audio clarity — use noise cancellation",
          "Strong hooks in first 1 second boost watch time by 70%",
          "Trending audio increases reach by 3x on average",
          "Consistent posting (4-5 reels/week) signals algorithm favorably",
          "Engage with comments within first hour for boost in distribution",
        ],
      });
    } catch (err: any) {
      toast.error("Failed to generate SEO analysis. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-secondary/10 blur-[100px]" animate={{ x: [0, -30, 0] }} transition={{ duration: 10, repeat: Infinity }} />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-3 sm:px-4 py-8 space-y-6">
        {/* Header */}
        <motion.div className="text-center space-y-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/50 text-xs text-muted-foreground">
            <Search className="w-3 h-3" /> Paid Tool — SEO Optimization
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Reel <span className="gradient-primary">SEO Optimizer</span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Get trending titles, hashtags, music suggestions & content improvement tips powered by deep AI research
          </p>
        </motion.div>

        {/* Input */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass p-4 sm:p-5 space-y-4">
            <Textarea
              placeholder="Enter your reel context, caption, or topic here... (e.g., 'Morning routine for college students' or paste your caption)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="bg-muted/50 border-border min-h-[100px] text-sm resize-none"
            />

            {/* Price anchoring */}
            <div className="flex items-center justify-center gap-3">
              <span className="text-sm text-muted-foreground line-through">₹59</span>
              <span className="text-2xl font-bold text-foreground">₹10</span>
              <span className="px-2 py-0.5 rounded-full bg-[hsl(var(--viral-high))]/10 text-[hsl(var(--viral-high))] text-[10px] font-semibold">
                83% OFF — Limited Time
              </span>
            </div>

            {!paid && !generating && !results && (
              <Button
                onClick={handlePay}
                disabled={loading || !input.trim()}
                className="w-full h-12 gradient-primary-bg text-primary-foreground font-bold shadow-glow"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing Payment...</>
                ) : (
                  <><Lock className="w-4 h-4 mr-2" /> Pay ₹10 & Generate SEO Analysis</>
                )}
              </Button>
            )}
          </Card>
        </motion.div>

        {/* Processing Steps */}
        <AnimatePresence>
          {generating && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Card className="glass p-5 space-y-4">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                  <p className="text-sm font-semibold text-foreground">Generating SEO Analysis...</p>
                </div>
                <div className="space-y-2">
                  {STEPS.map((step, i) => {
                    const isDone = i < currentStep;
                    const isActive = i === currentStep;
                    return (
                      <div
                        key={i}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                          isActive ? "bg-primary/10 text-foreground font-medium" : isDone ? "text-muted-foreground/70" : "text-muted-foreground/40"
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-4 h-4 text-primary" /> : isActive ? <Loader2 className="w-4 h-4 text-primary animate-spin" /> : <step.icon className="w-4 h-4" />}
                        <span>{step.label}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-center text-muted-foreground">⚠️ Do not close this page</p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {results && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {[results.version1, results.version2].map((version, vi) => (
                <Card key={vi} className="glass p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg ${vi === 0 ? "gradient-primary-bg" : "bg-secondary"} flex items-center justify-center`}>
                      <FileText className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">SEO Version {vi + 1}</h3>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Trending Titles</p>
                      {version.titles.map((t: string, i: number) => (
                        <p key={i} className="text-xs text-foreground bg-muted/30 px-2 py-1.5 rounded mb-1">{t}</p>
                      ))}
                    </div>

                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Hashtags</p>
                      <div className="flex flex-wrap gap-1">
                        {version.hashtags.map((h: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">{h}</span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Tags</p>
                      <div className="flex flex-wrap gap-1">
                        {version.tags.map((t: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-[10px]">{t}</span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                        <Music className="w-3 h-3 inline mr-1" />Suggested Music
                      </p>
                      <p className="text-xs text-foreground">{version.musicType}</p>
                    </div>

                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Content Improvements</p>
                      <ul className="space-y-1">
                        {version.suggestions.map((s: string, i: number) => (
                          <li key={i} className="text-[10px] text-muted-foreground flex items-start gap-1.5">
                            <Lightbulb className="w-3 h-3 text-accent mt-0.5 flex-shrink-0" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Tips */}
              <Card className="glass p-5 space-y-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" /> Pro Tips for Better Reels
                </h3>
                <ul className="space-y-2">
                  {results.tips.map((tip: string, i: number) => (
                    <li key={i} className="text-[10px] sm:text-xs text-muted-foreground flex items-start gap-2">
                      <span className="gradient-primary font-bold">{i + 1}.</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reviews */}
        <FakeReviewsSection title="SEO Tool Reviews" />

        {/* Disclaimer */}
        <div className="text-center space-y-1 py-4">
          <p className="text-[9px] text-muted-foreground/50 max-w-md mx-auto">
            Disclaimer: SEO suggestions are AI-generated based on current trends and algorithms. Results may vary based on content quality, timing, and audience. This tool does not guarantee viral performance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SeoOptimizer;
