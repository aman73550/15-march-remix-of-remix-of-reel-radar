import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import ViralScoreCircle from "@/components/ViralScoreCircle";
import AnalysisCard from "@/components/AnalysisCard";
import CategoryPieChart from "@/components/CategoryPieChart";
import ScoreBarChart from "@/components/ScoreBarChart";
import ReelPreview from "@/components/ReelPreview";
import LanguageToggle from "@/components/LanguageToggle";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/lib/LangContext";
import type { ReelAnalysis } from "@/lib/types";
import { Loader2, Link, Sparkles, TrendingUp } from "lucide-react";

const Index = () => {
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ReelAnalysis | null>(null);
  const { toast } = useToast();
  const { lang, t } = useLang();

  const handleAnalyze = async () => {
    if (!url.trim()) {
      toast({ title: t.enterUrl, variant: "destructive" });
      return;
    }

    setLoading(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-reel", {
        body: { url: url.trim(), caption: caption.trim(), hashtags: hashtags.trim(), lang },
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
            <span className="gradient-primary bg-clip-text text-transparent">{t.title2}</span>
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
        className="relative z-10 max-w-xl mx-auto px-4 pb-8"
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
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full h-11 gradient-primary text-primary-foreground font-semibold shadow-glow hover:opacity-90 transition-opacity"
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

      {/* Results */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            className="relative z-10 max-w-2xl mx-auto px-4 pb-16 space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Score + Reel Preview side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              {/* Score - takes 3 cols */}
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

              {/* Reel Preview - takes 2 cols */}
              <motion.div
                className="sm:col-span-2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <ReelPreview url={url} />
              </motion.div>
            </div>

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
                      <span className="gradient-primary bg-clip-text text-transparent font-bold">{i + 1}.</span>
                      {rec}
                    </motion.li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
