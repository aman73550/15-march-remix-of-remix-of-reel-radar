import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import ViralScoreCircle from "@/components/ViralScoreCircle";
import AnalysisCard from "@/components/AnalysisCard";
import CategoryPieChart from "@/components/CategoryPieChart";
import ScoreBarChart from "@/components/ScoreBarChart";
import ScoreRadarChart from "@/components/ScoreRadarChart";
import EngagementDonutChart from "@/components/EngagementDonutChart";
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
import SocialProofSection from "@/components/SocialProofSection";
import SampleAnalysisPreview from "@/components/SampleAnalysisPreview";
import ViralReelsShowcase from "@/components/ViralReelsShowcase";
import TrendingLeaderboard from "@/components/TrendingLeaderboard";
import UserReviews from "@/components/UserReviews";
import TrustBadges from "@/components/TrustBadges";
import { BannerAd, InlineAd, SidebarAds } from "@/components/AdSlots";
import ProcessingOverlay from "@/components/ProcessingOverlay";
import MasterReportButton from "@/components/MasterReportButton";
import FeedbackRating from "@/components/FeedbackRating";
import WhatsAppButton from "@/components/WhatsAppButton";
import ExamplePDFPreview from "@/components/ExamplePDFPreview";
import { canAnalyze, recordAnalysis, getRemainingAnalyses, FREE_LIMIT } from "@/lib/usageTracker";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/lib/LangContext";
import { useBehaviourTrigger, BehaviourTriggerDisplay } from "@/components/BehaviourTrigger";
import MobileBottomNav from "@/components/MobileBottomNav";
import InternalLinks from "@/components/InternalLinks";
import Footer from "@/components/Footer";
import AnalysisPaymentPopup from "@/components/AnalysisPaymentPopup";
import type { ReelAnalysis } from "@/lib/types";
import { Loader2, Link, Sparkles, TrendingUp, ChevronDown, ChevronUp, ShieldCheck, Crown, Zap, BarChart3, Globe, Users } from "lucide-react";

const Index = () => {
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [likes, setLikes] = useState("");
  const [comments, setComments] = useState("");
  const [views, setViews] = useState("");
  const [shares, setShares] = useState("");
  const [saves, setSaves] = useState("");
  const [sampleComments, setSampleComments] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ReelAnalysis | null>(null);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [showShareGate, setShowShareGate] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [analysisPrice, setAnalysisPrice] = useState(0);
  const [pendingPaymentToken, setPendingPaymentToken] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(getRemainingAnalyses());
  const { toast } = useToast();
  const { lang, t } = useLang();
  const { activeTrigger, checkTriggers, dismissTrigger } = useBehaviourTrigger();
  const inputRef = useRef<HTMLDivElement>(null);
  const masterReportRef = useRef<HTMLDivElement>(null);
  const scrollToMasterReport = () => {
    masterReportRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const scrollToInput = () => {
    inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const runAnalysis = useCallback(async (paymentToken?: string) => {
    setLoading(true);
    setAnalysis(null);
    try {
      const bodyPayload: any = {
        url: url.trim(),
        caption: caption.trim() || undefined,
        hashtags: hashtags.trim() || undefined,
        lang,
        metrics: {
          likes: likes ? parseInt(likes) : undefined,
          comments: comments ? parseInt(comments) : undefined,
          views: views ? parseInt(views) : undefined,
          shares: shares ? parseInt(shares) : undefined,
          saves: saves ? parseInt(saves) : undefined,
        },
        sampleComments: sampleComments.trim() || undefined,
      };
      if (paymentToken) bodyPayload.paymentToken = paymentToken;

      const { data, error } = await supabase.functions.invoke("analyze-reel", {
        body: bodyPayload,
      });

      if (error) throw error;

      if (!data?.success && data?.error === "payment_required") {
        setAnalysisPrice(data.price || 10);
        setShowInterstitial(false);
        setShowPaymentPopup(true);
        setLoading(false);
        return;
      }
      if (!data?.success && data?.error === "payment_invalid") {
        toast({ title: "Payment Invalid", description: data.message || "Please complete payment first", variant: "destructive" });
        setAnalysisPrice(data.price || 10);
        setShowInterstitial(false);
        setShowPaymentPopup(true);
        setLoading(false);
        return;
      }

      if (!data?.success) throw new Error(data?.error || "Analysis failed");
      setAnalysis(data.analysis);
      setPendingPaymentToken(null);
      recordAnalysis();
      setRemaining(getRemainingAnalyses());
    } catch (err: any) {
      setShowInterstitial(false);
      console.error("Analysis error:", err);
      toast({ title: t.analysisFailed, description: err.message || t.tryAgain, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [url, caption, hashtags, likes, comments, views, shares, saves, sampleComments, lang, t, toast]);

  const handlePaymentSuccess = (paymentToken: string) => {
    setShowPaymentPopup(false);
    setPendingPaymentToken(paymentToken);
    setShowInterstitial(true);
    runAnalysis(paymentToken);
  };

  const handleAnalyze = async () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      toast({ title: t.enterUrl, variant: "destructive" });
      return;
    }

    const urlPattern = /^https?:\/\/(www\.)?(instagram\.com|instagr\.am)\/(reel|reels|p)\//i;
    if (!urlPattern.test(trimmedUrl)) {
      toast({ title: "Invalid URL", description: "Please enter a valid Instagram Reel URL (e.g., https://www.instagram.com/reel/...)", variant: "destructive" });
      return;
    }
    if (trimmedUrl.length > 500) {
      toast({ title: "URL too long", variant: "destructive" });
      return;
    }

    const numFields = [likes, comments, views, shares, saves];
    for (const val of numFields) {
      if (val && (isNaN(Number(val)) || Number(val) < 0)) {
        toast({ title: "Invalid metric value", description: "Metrics must be positive numbers", variant: "destructive" });
        return;
      }
    }

    if (!canAnalyze()) {
      setShowShareGate(true);
      return;
    }

    if (checkTriggers()) return;

    setShowShareGate(false);
    setShowInterstitial(true);
    runAnalysis();
  };

  const handleTriggerRetry = () => {
    dismissTrigger();
    setShowInterstitial(true);
    runAnalysis();
  };

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
    <div className="min-h-screen bg-background relative overflow-x-hidden pb-20 md:pb-0">
      <LanguageToggle />
      <SidebarAds />
      <MobileBottomNav />
      <ProcessingOverlay show={showInterstitial} analysisComplete={!loading && analysis !== null} onComplete={() => setShowInterstitial(false)} />

      {activeTrigger && (
        <BehaviourTriggerDisplay
          trigger={activeTrigger.trigger}
          message={activeTrigger.message}
          displayType={activeTrigger.displayType}
          onDismiss={dismissTrigger}
          onRetry={handleTriggerRetry}
        />
      )}

      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,hsl(var(--primary)/0.12),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_50%,hsl(var(--secondary)/0.06),transparent)]" />
      </div>

      {/* ─── HERO ─── */}
      <div className="relative z-10">
        <motion.div
          className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-4 sm:pb-6 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Pill badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs font-medium text-primary mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Zap className="w-3.5 h-3.5" />
            {t.badge}
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-foreground mb-4 sm:mb-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {t.title1}
            <br className="hidden sm:block" />
            <span className="gradient-primary">{t.title2}</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {t.subtitle}
          </motion.p>

          {/* Stats row */}
          <motion.div
            className="flex items-center justify-center gap-4 sm:gap-8 mt-6 sm:mt-8 flex-wrap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm sm:text-base font-bold text-foreground">48,000+</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Creators</p>
              </div>
            </div>
            <div className="w-px h-8 bg-border/50 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-secondary" />
              </div>
              <div className="text-left">
                <p className="text-sm sm:text-base font-bold text-foreground">2.5M+</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Reels Analyzed</p>
              </div>
            </div>
            <div className="w-px h-8 bg-border/50 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <Globe className="w-4 h-4 text-accent" />
              </div>
              <div className="text-left">
                <p className="text-sm sm:text-base font-bold text-foreground">120+</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Countries</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ─── INPUT CARD ─── */}
      <motion.div
        ref={inputRef}
        className="relative z-10 max-w-xl lg:max-w-2xl mx-auto px-4 sm:px-6 pb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="glass p-5 sm:p-6 space-y-4 shadow-2xl shadow-primary/5 border-border/50">
          {/* URL input */}
          <div className="relative">
            <Link className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder={t.urlPlaceholder}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pl-10 bg-muted/50 border-border h-12 text-sm"
            />
          </div>

          {/* Add More Details */}
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg bg-muted/30 border border-border/50 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              ⚡ Boost Accuracy — Add Details (Highly Recommended!)
            </span>
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <AnimatePresence>
            {showDetails && (
              <motion.div className="space-y-3" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                <Input placeholder={t.captionPlaceholder} value={caption} onChange={(e) => setCaption(e.target.value)} className="bg-muted/50 border-border h-10 text-sm" />
                <Input placeholder={t.hashtagPlaceholder} value={hashtags} onChange={(e) => setHashtags(e.target.value)} className="bg-muted/50 border-border h-10 text-sm" />

                <button type="button" onClick={() => setShowMetrics(!showMetrics)} className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-muted/20 border border-border/50 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <span>{t.metricsLabel}</span>
                  {showMetrics ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <AnimatePresence>
                  {showMetrics && (
                    <motion.div className="space-y-2" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                      <div className="grid grid-cols-2 gap-2">
                        <Input type="number" placeholder={t.likesPlaceholder} value={likes} onChange={(e) => setLikes(e.target.value)} className="bg-muted/50 border-border h-9 text-xs" />
                        <Input type="number" placeholder={t.commentsPlaceholder} value={comments} onChange={(e) => setComments(e.target.value)} className="bg-muted/50 border-border h-9 text-xs" />
                        <Input type="number" placeholder={t.viewsPlaceholder} value={views} onChange={(e) => setViews(e.target.value)} className="bg-muted/50 border-border h-9 text-xs" />
                        <Input type="number" placeholder={t.sharesPlaceholder} value={shares} onChange={(e) => setShares(e.target.value)} className="bg-muted/50 border-border h-9 text-xs" />
                        <Input type="number" placeholder={t.savesPlaceholder} value={saves} onChange={(e) => setSaves(e.target.value)} className="bg-muted/50 border-border h-9 text-xs col-span-2 sm:col-span-1" />
                      </div>
                      <Textarea placeholder={t.sampleCommentsPlaceholder} value={sampleComments} onChange={(e) => setSampleComments(e.target.value)} className="bg-muted/50 border-border text-xs min-h-[70px] resize-none" rows={3} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full h-12 gradient-primary-bg text-primary-foreground font-semibold shadow-glow hover:opacity-90 transition-opacity text-sm sm:text-base rounded-lg"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t.analyzing}</>
            ) : (
              <><TrendingUp className="w-4 h-4 mr-2" />{t.analyzeBtn}</>
            )}
          </Button>

          <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
            <span>{remaining > 0 ? `${remaining} free analyses left` : "Share to unlock more"}</span>
            <span className="w-px h-3 bg-border" />
            <span>No login required</span>
          </div>
        </Card>
      </motion.div>

      {/* Share Unlock Gate */}
      <AnimatePresence>
        {showShareGate && (
          <motion.div className="fixed inset-0 z-[60] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="absolute inset-0 bg-background/70 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowShareGate(false)} />
            <motion.div className="relative z-10 w-full max-w-xl" initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}>
              <ShareUnlockScreen onUnlocked={() => { setShowShareGate(false); setRemaining(getRemainingAnalyses()); }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Popup */}
      {showPaymentPopup && (
        <AnalysisPaymentPopup
          reelUrl={url.trim()}
          price={analysisPrice}
          onPaymentSuccess={handlePaymentSuccess}
          onClose={() => { setShowInterstitial(false); setShowPaymentPopup(false); }}
        />
      )}

      {/* Social Proof (live counters) */}
      {!analysis && !showShareGate && <div className="relative z-10"><SocialProofSection /></div>}

      <div className="relative z-10 py-4"><BannerAd slot="banner-top" /></div>

      {!analysis && <div className="relative z-10 py-2"><BannerAd slot="banner-mid" /></div>}

      {/* ─── RESULTS ─── */}
      <AnimatePresence>
        {analysis && scores && (
          <motion.div className="relative z-10 max-w-2xl mx-auto px-3 sm:px-4 pb-16 space-y-4 sm:space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="flex justify-center" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <button onClick={scrollToMasterReport} className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full gradient-primary-bg text-primary-foreground font-semibold text-xs sm:text-sm shadow-glow hover:opacity-90 transition-opacity">
                <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Get Master Report
                <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </motion.div>

            <motion.div className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full bg-[hsl(var(--viral-high))]/10 border border-[hsl(var(--viral-high))]/20 mx-auto w-fit" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[hsl(var(--viral-high))] flex-shrink-0" />
              <span className="text-[10px] sm:text-xs font-medium text-[hsl(var(--viral-high))] text-center">Auto-Analyzed • Data Extracted Automatically</span>
            </motion.div>

            {analysis.viralClassification && <ViralStatusBadge classification={analysis.viralClassification} />}

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              <motion.div className="sm:col-span-3" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <Card className="glass p-5 sm:p-8 flex flex-col items-center h-full justify-center">
                  <ViralScoreCircle score={analysis.viralClassification?.score ?? analysis.viralScore} />
                  <motion.p className="mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground text-center max-w-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
                    {analysis.overallSummary}
                  </motion.p>
                </Card>
              </motion.div>
              <motion.div className="sm:col-span-2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                <ReelPreview url={url} />
              </motion.div>
            </div>

            <InlineAd slot="after-score" />

            {analysis.metricsComparison && Object.keys(analysis.metricsComparison).length > 0 && (
              <MetricsComparison metrics={analysis.metricsComparison} />
            )}

            <InlineAd slot="mid-1" />

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
                <Card className="glass p-5">
                  <h3 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">🕸️ Performance Radar</h3>
                  <ScoreRadarChart hookScore={scores.hook} captionScore={scores.caption} hashtagScore={scores.hashtag} engagementScore={scores.engagement} trendScore={scores.trend} labels={chartLabels} />
                </Card>
              </motion.div>
              {analysis.metricsComparison && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                  <Card className="glass p-5">
                    <h3 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">🎯 Engagement Breakdown</h3>
                    <EngagementDonutChart
                      likes={analysis.metricsComparison.likes?.value}
                      comments={analysis.metricsComparison.comments?.value}
                      shares={analysis.metricsComparison.shares?.value}
                      saves={analysis.metricsComparison.saves?.value}
                    />
                  </Card>
                </motion.div>
              )}
            </div>

            <InlineAd slot="after-charts" />

            {analysis.patternComparison && <ViralPatternCard data={analysis.patternComparison} />}
            {analysis.contentClassification && <ContentClassificationCard data={analysis.contentClassification} thumbnailAnalyzed={analysis.thumbnailAnalyzed} />}
            {analysis.hookAnalysis && <HookAnalysisCard data={analysis.hookAnalysis} title={t.hookTitle} />}
            {analysis.captionAnalysis && <CaptionAnalysisCard data={analysis.captionAnalysis} title={t.captionTitle} />}
            {analysis.hashtagAnalysis && <HashtagAnalysisCard data={analysis.hashtagAnalysis} title={t.hashtagTitle} />}

            <InlineAd slot="after-hooks" />
            <InlineAd slot="mid-2" />

            {analysis.videoSignals && <VideoSignalsCard data={analysis.videoSignals} title={t.videoTitle} />}
            {(analysis.videoQuality || analysis.audioQuality) && <QualitySignalsCard videoQuality={analysis.videoQuality} audioQuality={analysis.audioQuality} />}
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

            <InlineAd slot="after-recommendations" />

            <div ref={masterReportRef}>
              <MasterReportButton analysis={analysis} reelUrl={url} />
            </div>

            <InlineAd slot="master-report-below" />
            <ExamplePDFPreview />
            <FeedbackRating reelUrl={url} />

            <motion.div className="flex flex-col items-center gap-3 text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
              <p className="text-sm text-muted-foreground">
                Want to check another reel?{" "}
                <span className="text-foreground font-medium">Share this tool with a friend and analyze together.</span>
              </p>
              <ShareToolPopup />
            </motion.div>

            <BannerAd slot="banner-bottom" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── PRE-ANALYSIS CONTENT ─── */}
      {!analysis && (
        <div className="relative z-10 space-y-2">
          <TrustBadges />
          <ViralReelsShowcase onAnalyzeClick={scrollToInput} />
          <SampleAnalysisPreview />
          <InlineAd slot="before-leaderboard" />
          <TrendingLeaderboard onScrollToInput={scrollToInput} />
          <InlineAd slot="before-reviews" />
          <UserReviews />

          {/* SEO Content Block */}
          <section className="relative z-10 max-w-2xl mx-auto px-4 py-8 space-y-5">
            <h2 className="text-lg font-bold text-foreground">Free Instagram Reel Analyzer & SEO Optimization Tool</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              ReelAnalyzer is a free AI-powered tool that helps Instagram creators analyze their reel performance, predict viral potential, and optimize content for maximum reach. Paste any Instagram reel URL and get instant insights on hook strength, caption quality, hashtag effectiveness, engagement metrics, and trend alignment.
            </p>
            <h3 className="text-sm font-semibold text-foreground">How Does Reel Analysis Help Your Growth?</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Creators who analyze their reels before posting see 2-3x better engagement rates. Our reel performance analyzer checks your hook timing, caption SEO, hashtag competition levels, and content classification to identify exactly what's working and what needs improvement.
            </p>
            <h3 className="text-sm font-semibold text-foreground">Reel SEO Optimization & Hashtag Strategy</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Instagram has become a search engine — users search for topics, tutorials, and trends directly on the platform. Our reel SEO optimizer helps you generate keyword-rich titles, optimized captions, and strategic hashtag sets so Instagram's algorithm can properly categorize and distribute your content.
            </p>
          </section>

          <InternalLinks currentPath="/" />

          <div className="py-8 space-y-4">
            <BannerAd slot="footer-above" />
            <div className="flex justify-center"><ShareToolPopup /></div>
            <BannerAd slot="footer-banner" />
          </div>
        </div>
      )}

      <WhatsAppButton />
      <Footer />
    </div>
  );
};

export default Index;
