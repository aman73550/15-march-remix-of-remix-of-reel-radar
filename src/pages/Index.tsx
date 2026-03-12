import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import ViralScoreCircle from "@/components/ViralScoreCircle";
import AnalysisCard from "@/components/AnalysisCard";
import CategoryPieChart from "@/components/CategoryPieChart";
import ScoreBarChart from "@/components/ScoreBarChart";
import ReelPreview from "@/components/ReelPreview";
import MetricsComparison from "@/components/MetricsComparison";
import CommentSentiment from "@/components/CommentSentiment";
import HookAnalysisCard from "@/components/HookAnalysisCard";
import CaptionAnalysisCard from "@/components/CaptionAnalysisCard";
import HashtagAnalysisCard from "@/components/HashtagAnalysisCard";
import VideoSignalsCard from "@/components/VideoSignalsCard";
import QualitySignalsCard from "@/components/QualitySignalsCard";
import TrendMatchingCard from "@/components/TrendMatchingCard";
import ContentClassificationCard from "@/components/ContentClassificationCard";
import ViralPatternCard from "@/components/ViralPatternCard";
import ViralStatusBadge from "@/components/ViralStatusBadge";
import LanguageToggle from "@/components/LanguageToggle";
import ShareToolPopup from "@/components/ShareToolPopup";
import ShareUnlockScreen from "@/components/ShareUnlockScreen";
import SocialProofSection, { SocialProofBadge } from "@/components/SocialProofSection";
import SampleAnalysisPreview from "@/components/SampleAnalysisPreview";
import TrendingLeaderboard from "@/components/TrendingLeaderboard";
import { BannerAd, InlineAd } from "@/components/AdSlots";
import ProcessingOverlay from "@/components/ProcessingOverlay";
import { canAnalyze, recordAnalysis, getRemainingAnalyses, FREE_LIMIT } from "@/lib/usageTracker";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/lib/LangContext";
import type { ReelAnalysis } from "@/lib/types";
import { Loader2, Link, Sparkles, TrendingUp, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";

const Index = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ReelAnalysis | null>(null);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [showShareGate, setShowShareGate] = useState(false);
  const [remaining, setRemaining] = useState(getRemainingAnalyses());
  const { toast } = useToast();
  const { lang, t } = useLang();
  const inputRef = useRef<HTMLDivElement>(null);

  const scrollToInput = () => {
    inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const runAnalysis = useCallback(async () => {
    setLoading(true);
    setAnalysis(null);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-reel", {
        body: {
          url: url.trim(),
          lang,
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Analysis failed");
      setAnalysis(data.analysis);
      recordAnalysis();
      setRemaining(getRemainingAnalyses());
    } catch (err: any) {
      console.error("Analysis error:", err);
      toast({ title: t.analysisFailed, description: err.message || t.tryAgain, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [url, lang, t, toast]);

  const handleAnalyze = async () => {
    if (!url.trim()) {
      toast({ title: t.enterUrl, variant: "destructive" });
      return;
    }

    // Usage limit check
    if (!canAnalyze()) {
      setShowShareGate(true);
      return;
    }

    setShowShareGate(false);
    setShowInterstitial(true);
    runAnalysis();
  };

  // Build chart data from new structure
  const scores = analysis
    ? {
        hook: analysis.hookAnalysis?.score ?? analysis.hookScore ?? 0,
        caption: analysis.captionAnalysis?.score ?? analysis.captionScore ?? 0,
        hashtag: analysis.hashtagAnalysis?.score ?? analysis.hashtagScore ?? 0,
        engagement: analysis.engagementScore ?? 0,
        trend: analysis.trendMatching?.score ?? analysis.trendScore ?? 0,
      }
    : null;

  const chartLabels = {
    hook: t.hook,
    caption: t.caption,
    hashtag: t.hashtag,
    engagement: t.engagement,
    trend: t.trend,
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <LanguageToggle />
      <ProcessingOverlay show={showInterstitial} analysisComplete={!loading && analysis !== null} onComplete={() => setShowInterstitial(false)} />

      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-[120px]" animate={{ x: [0, 50, 0], y: [0, -30, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-secondary/10 blur-[120px]" animate={{ x: [0, -40, 0], y: [0, 40, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-accent/5 blur-[100px]" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />
      </div>

      {/* Hero */}
      <div className="relative z-10">
        <motion.div className="max-w-2xl mx-auto px-3 sm:px-4 pt-10 sm:pt-14 pb-6 sm:pb-8 text-center" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <motion.div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/50 text-xs text-muted-foreground mb-6" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
            <Sparkles className="w-3 h-3" />
            {t.badge}
          </motion.div>
          <motion.h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-foreground mb-2 sm:mb-3 tracking-tight leading-tight" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            {t.title1}
            <span className="gradient-primary">{t.title2}</span>
          </motion.h1>
          <motion.p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            {t.subtitle}
          </motion.p>
          <div className="mt-3">
            <SocialProofBadge />
          </div>
        </motion.div>
      </div>

      {/* Input — URL only */}
      <motion.div ref={inputRef} className="relative z-10 max-w-xl lg:max-w-2xl mx-auto px-3 sm:px-4 pb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card className="glass p-4 sm:p-5 space-y-3">
          <div className="relative">
            <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/70" />
            <Input placeholder={t.urlPlaceholder} value={url} onChange={(e) => setUrl(e.target.value)} className="pl-9 bg-muted/50 border-border h-11" />
          </div>

          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
            <Button onClick={handleAnalyze} disabled={loading} className="w-full h-12 sm:h-11 gradient-primary-bg text-primary-foreground font-semibold shadow-glow hover:opacity-90 transition-opacity text-sm sm:text-base">
              {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t.analyzing}</>) : (<><TrendingUp className="w-4 h-4 mr-2" />{t.analyzeBtn}</>)}
            </Button>
          </motion.div>

          <p className="text-center text-[10px] text-muted-foreground">
            {remaining > 0 ? `${remaining} free analysis${remaining !== 1 ? "es" : ""} remaining` : "No free analyses remaining — share to unlock more"}
          </p>
          <p className="text-center text-[10px] text-muted-foreground/60">
            No login required • Paste link & get full analysis automatically
          </p>
        </Card>
      </motion.div>

      {/* Share Unlock Gate */}
      {showShareGate && (
        <ShareUnlockScreen onUnlocked={() => { setShowShareGate(false); setRemaining(getRemainingAnalyses()); }} />
      )}

      {/* Social Proof Section */}
      {!analysis && !showShareGate && <SocialProofSection />}

      <div className="py-4"><BannerAd slot="top-banner" /></div>

      {/* Results */}
      <AnimatePresence>
        {analysis && scores && (
          <motion.div className="relative z-10 max-w-2xl mx-auto px-3 sm:px-4 pb-16 space-y-4 sm:space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Auto-extracted badge */}
            <motion.div className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full bg-[hsl(var(--viral-high))]/10 border border-[hsl(var(--viral-high))]/20 mx-auto w-fit" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[hsl(var(--viral-high))] flex-shrink-0" />
              <span className="text-[10px] sm:text-xs font-medium text-[hsl(var(--viral-high))] text-center">AI Auto-Analyzed • Data Extracted Automatically</span>
            </motion.div>

            {/* Viral Status Badge */}
            {analysis.viralClassification && (
              <ViralStatusBadge classification={analysis.viralClassification} />
            )}

            {/* Viral Score + Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              <motion.div className="sm:col-span-3" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <Card className="glass p-8 flex flex-col items-center h-full justify-center">
                  <ViralScoreCircle score={analysis.viralClassification?.score ?? analysis.viralScore} />
                  <motion.p className="mt-4 text-sm text-muted-foreground text-center max-w-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
                    {analysis.overallSummary}
                  </motion.p>
                </Card>
              </motion.div>
              <motion.div className="sm:col-span-2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                <ReelPreview url={url} />
              </motion.div>
            </div>

            {/* Metrics Comparison */}
            {analysis.metricsComparison && Object.keys(analysis.metricsComparison).length > 0 && (
              <MetricsComparison metrics={analysis.metricsComparison} />
            )}

            <InlineAd slot="mid-1" />

            {/* Charts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                <Card className="glass p-5">
                  <h3 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">📊 {t.categoryDistribution}</h3>
                  <CategoryPieChart hookScore={scores.hook} captionScore={scores.caption} hashtagScore={scores.hashtag} engagementScore={scores.engagement} trendScore={scores.trend} labels={chartLabels} />
                </Card>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                <Card className="glass p-5">
                  <h3 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">📈 {t.scoreBreakdown}</h3>
                  <ScoreBarChart hookScore={scores.hook} captionScore={scores.caption} hashtagScore={scores.hashtag} engagementScore={scores.engagement} trendScore={scores.trend} labels={chartLabels} />
                </Card>
              </motion.div>
            </div>

            {analysis.patternComparison && (
              <ViralPatternCard data={analysis.patternComparison} />
            )}

            {analysis.contentClassification && (
              <ContentClassificationCard data={analysis.contentClassification} thumbnailAnalyzed={analysis.thumbnailAnalyzed} />
            )}

            {analysis.hookAnalysis && <HookAnalysisCard data={analysis.hookAnalysis} title={t.hookTitle} />}
            {analysis.captionAnalysis && <CaptionAnalysisCard data={analysis.captionAnalysis} title={t.captionTitle} />}
            {analysis.hashtagAnalysis && <HashtagAnalysisCard data={analysis.hashtagAnalysis} title={t.hashtagTitle} />}

            <InlineAd slot="mid-2" />

            {analysis.videoSignals && <VideoSignalsCard data={analysis.videoSignals} title={t.videoTitle} />}
            {(analysis.videoQuality || analysis.audioQuality) && (
              <QualitySignalsCard videoQuality={analysis.videoQuality} audioQuality={analysis.audioQuality} />
            )}
            {analysis.trendMatching && <TrendMatchingCard data={analysis.trendMatching} title={t.trendTitle} />}

            <AnalysisCard icon="📊" title={t.engagementTitle} score={scores.engagement} details={analysis.engagementDetails || []} index={0} />

            {analysis.commentSentiment && <CommentSentiment sentiment={analysis.commentSentiment} />}

            <InlineAd slot="mid-3" />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
              <Card className="glass p-5">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><span>💡</span> {t.recommendations}</h3>
                <ul className="space-y-2">
                  {analysis.topRecommendations.map((rec, i) => (
                    <motion.li key={i} className="flex items-start gap-2 text-sm text-muted-foreground" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 + i * 0.1 }}>
                      <span className="gradient-primary font-bold">{i + 1}.</span>
                      {rec}
                    </motion.li>
                  ))}
                </ul>
              </Card>
            </motion.div>

            <motion.div className="flex flex-col items-center gap-3 text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
              <p className="text-sm text-muted-foreground">
                Want to check another reel?{" "}
                <span className="text-foreground font-medium">Share this tool with a friend and analyze together.</span>
              </p>
              <ShareToolPopup />
            </motion.div>

            <BannerAd slot="bottom-banner" />
          </motion.div>
        )}
      </AnimatePresence>

      {!analysis && (
        <div className="space-y-2">
          <SampleAnalysisPreview />
          <TrendingLeaderboard onScrollToInput={scrollToInput} />
          <div className="py-8 space-y-4">
            <div className="flex justify-center"><ShareToolPopup /></div>
            <BannerAd slot="footer-banner" />
          </div>
        </div>
      )}

      <footer className="relative z-10 mt-12 sm:mt-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="border-t border-border/40" />
          <div className="py-6 sm:py-8 space-y-2 text-center">
            <p className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">Disclaimer</p>
            <p className="text-[9px] sm:text-[10px] leading-relaxed text-muted-foreground/50 max-w-lg mx-auto">
              This tool provides AI-based estimates and analysis of Instagram Reel performance using publicly available data and predictive algorithms. The viral probability score is only an estimate and does not guarantee actual performance or reach. This website is not affiliated with, endorsed by, or officially connected to Instagram or Meta Platforms, Inc. All trademarks and platform names belong to their respective owners.
            </p>
            <p className="text-[8px] sm:text-[9px] text-muted-foreground/40 italic">
              For educational and informational purposes only.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
