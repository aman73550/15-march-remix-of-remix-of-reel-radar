import { useState, useCallback } from "react";
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
import ReelPreview from "@/components/ReelPreview";
import MetricsComparison from "@/components/MetricsComparison";
import CommentSentiment from "@/components/CommentSentiment";
import LanguageToggle from "@/components/LanguageToggle";
import { BannerAd, InterstitialAd, InlineAd } from "@/components/AdSlots";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/lib/LangContext";
import type { ReelAnalysis } from "@/lib/types";
import { Loader2, Link, Sparkles, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";

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
  const [showMetrics, setShowMetrics] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ReelAnalysis | null>(null);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [pendingAnalysis, setPendingAnalysis] = useState(false);
  const { toast } = useToast();
  const { lang, t } = useLang();

  const runAnalysis = useCallback(async () => {
    setLoading(true);
    setAnalysis(null);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-reel", {
        body: {
          url: url.trim(),
          caption: caption.trim(),
          hashtags: hashtags.trim(),
          lang,
          metrics: {
            likes: likes ? parseInt(likes) : undefined,
            comments: comments ? parseInt(comments) : undefined,
            views: views ? parseInt(views) : undefined,
            shares: shares ? parseInt(shares) : undefined,
            saves: saves ? parseInt(saves) : undefined,
          },
          sampleComments: sampleComments.trim() || undefined,
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Analysis failed");
      setAnalysis(data.analysis);
    } catch (err: any) {
      console.error("Analysis error:", err);
      toast({
        title: t.analysisFailed,
        description: err.message || t.tryAgain,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [url, caption, hashtags, likes, comments, views, shares, saves, sampleComments, lang, t, toast]);

  const handleAnalyze = () => {
    if (!url.trim()) {
      toast({ title: t.enterUrl, variant: "destructive" });
      return;
    }
    setShowInterstitial(true);
    setPendingAnalysis(true);
    runAnalysis().finally(() => setPendingAnalysis(false));
  };

  const handleCloseAd = () => {
    setShowInterstitial(false);
  };

  const chartLabels = {
    hook: t.hook,
    caption: t.caption,
    hashtag: t.hashtag,
    engagement: t.engagement,
    trend: t.trend,
  };

  return (
    <div className="min-h-screen bg-background relative">
      <LanguageToggle />
      <InterstitialAd show={showInterstitial} onClose={handleCloseAd} />

      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-[120px]"
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-secondary/10 blur-[120px]"
          animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-accent/5 blur-[100px]"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Hero */}
      <div className="relative z-10">
        <motion.div
          className="max-w-2xl mx-auto px-4 pt-14 pb-8 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/50 text-xs text-muted-foreground mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="w-3 h-3" />
            {t.badge}
          </motion.div>
          <motion.h1
            className="text-3xl sm:text-5xl font-bold text-foreground mb-3 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {t.title1}
            <span className="gradient-primary">{t.title2}</span>
          </motion.h1>
          <motion.p
            className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {t.subtitle}
          </motion.p>
        </motion.div>
      </div>

      {/* Input */}
      <motion.div
        className="relative z-10 max-w-xl mx-auto px-4 pb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="glass p-5 space-y-3">
          <div className="relative">
            <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t.urlPlaceholder}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pl-9 bg-muted/50 border-border h-11"
            />
          </div>
          <Input
            placeholder={t.captionPlaceholder}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="bg-muted/50 border-border h-10 text-sm"
          />
          <Input
            placeholder={t.hashtagPlaceholder}
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            className="bg-muted/50 border-border h-10 text-sm"
          />

          {/* Expandable Metrics Section */}
          <button
            type="button"
            onClick={() => setShowMetrics(!showMetrics)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-muted/30 border border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>{t.metricsLabel}</span>
            {showMetrics ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <AnimatePresence>
            {showMetrics && (
              <motion.div
                className="space-y-2"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder={t.likesPlaceholder}
                    value={likes}
                    onChange={(e) => setLikes(e.target.value)}
                    className="bg-muted/50 border-border h-9 text-xs"
                  />
                  <Input
                    type="number"
                    placeholder={t.commentsPlaceholder}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="bg-muted/50 border-border h-9 text-xs"
                  />
                  <Input
                    type="number"
                    placeholder={t.viewsPlaceholder}
                    value={views}
                    onChange={(e) => setViews(e.target.value)}
                    className="bg-muted/50 border-border h-9 text-xs"
                  />
                  <Input
                    type="number"
                    placeholder={t.sharesPlaceholder}
                    value={shares}
                    onChange={(e) => setShares(e.target.value)}
                    className="bg-muted/50 border-border h-9 text-xs"
                  />
                  <Input
                    type="number"
                    placeholder={t.savesPlaceholder}
                    value={saves}
                    onChange={(e) => setSaves(e.target.value)}
                    className="bg-muted/50 border-border h-9 text-xs col-span-2 sm:col-span-1"
                  />
                </div>
                <Textarea
                  placeholder={t.sampleCommentsPlaceholder}
                  value={sampleComments}
                  onChange={(e) => setSampleComments(e.target.value)}
                  className="bg-muted/50 border-border text-xs min-h-[70px] resize-none"
                  rows={3}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full h-11 gradient-primary-bg text-primary-foreground font-semibold shadow-glow hover:opacity-90 transition-opacity"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t.analyzing}
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  {t.analyzeBtn}
                </>
              )}
            </Button>
          </motion.div>
        </Card>
      </motion.div>

      {/* Banner Ad */}
      <div className="py-4">
        <BannerAd slot="top-banner" />
      </div>

      {/* Results */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            className="relative z-10 max-w-2xl mx-auto px-4 pb-16 space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Score + Reel Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              <motion.div
                className="sm:col-span-3"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="glass p-8 flex flex-col items-center h-full justify-center">
                  <ViralScoreCircle score={analysis.viralScore} />
                  <motion.p
                    className="mt-4 text-sm text-muted-foreground text-center max-w-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                  >
                    {analysis.overallSummary}
                  </motion.p>
                </Card>
              </motion.div>
              <motion.div
                className="sm:col-span-2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <ReelPreview url={url} />
              </motion.div>
            </div>

            {/* Metrics Comparison (if provided) */}
            {analysis.metricsComparison && Object.keys(analysis.metricsComparison).length > 0 && (
              <MetricsComparison metrics={analysis.metricsComparison} />
            )}

            {/* Comment Sentiment (if available) */}
            {analysis.commentSentiment && (
              <CommentSentiment sentiment={analysis.commentSentiment} />
            )}

            <InlineAd slot="mid-content-1" />

            {/* Charts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="glass p-5">
                  <h3 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                    📊 {t.categoryDistribution}
                  </h3>
                  <CategoryPieChart
                    hookScore={analysis.hookScore}
                    captionScore={analysis.captionScore}
                    hashtagScore={analysis.hashtagScore}
                    engagementScore={analysis.engagementScore}
                    trendScore={analysis.trendScore}
                    labels={chartLabels}
                  />
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="glass p-5">
                  <h3 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                    📈 {t.scoreBreakdown}
                  </h3>
                  <ScoreBarChart
                    hookScore={analysis.hookScore}
                    captionScore={analysis.captionScore}
                    hashtagScore={analysis.hashtagScore}
                    engagementScore={analysis.engagementScore}
                    trendScore={analysis.trendScore}
                    labels={chartLabels}
                  />
                </Card>
              </motion.div>
            </div>

            {/* Category Scores */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <AnalysisCard icon="🎣" title={t.hook} score={analysis.hookScore} details={analysis.hookDetails} index={0} />
              <AnalysisCard icon="✍️" title={t.caption} score={analysis.captionScore} details={analysis.captionDetails} index={1} />
              <AnalysisCard icon="#️⃣" title={t.hashtag} score={analysis.hashtagScore} details={analysis.hashtagDetails} index={2} />
              <AnalysisCard icon="📊" title={t.engagement} score={analysis.engagementScore} details={analysis.engagementDetails} index={3} />
              <AnalysisCard icon="🔥" title={t.trend} score={analysis.trendScore} details={analysis.trendDetails} index={4} />
            </div>

            <InlineAd slot="mid-content-2" />

            {/* Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="glass p-5">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span>💡</span> {t.recommendations}
                </h3>
                <ul className="space-y-2">
                  {analysis.topRecommendations.map((rec, i) => (
                    <motion.li
                      key={i}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + i * 0.1 }}
                    >
                      <span className="gradient-primary font-bold">{i + 1}.</span>
                      {rec}
                    </motion.li>
                  ))}
                </ul>
              </Card>
            </motion.div>

            <BannerAd slot="bottom-banner" />
          </motion.div>
        )}
      </AnimatePresence>

      {!analysis && (
        <div className="py-8">
          <BannerAd slot="footer-banner" />
        </div>
      )}
    </div>
  );
};

export default Index;
