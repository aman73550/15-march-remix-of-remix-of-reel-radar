import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import ViralScoreCircle from "@/components/ViralScoreCircle";
import AnalysisCard from "@/components/AnalysisCard";
import { supabase } from "@/integrations/supabase/client";
import type { ReelAnalysis } from "@/lib/types";
import { Loader2, Link, Sparkles, TrendingUp } from "lucide-react";

const Index = () => {
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ReelAnalysis | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!url.trim()) {
      toast({ title: "Enter a Reel URL", variant: "destructive" });
      return;
    }

    setLoading(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-reel", {
        body: { url: url.trim(), caption: caption.trim(), hashtags: hashtags.trim() },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Analysis failed");

      setAnalysis(data.analysis);
    } catch (err: any) {
      console.error("Analysis error:", err);
      toast({
        title: "Analysis failed",
        description: err.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary/30 blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-secondary/30 blur-[100px]" />
        </div>

        <div className="relative max-w-2xl mx-auto px-4 pt-12 pb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/50 text-xs text-muted-foreground mb-6">
            <Sparkles className="w-3 h-3" />
            AI-Powered Reel Analysis
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-foreground mb-3 tracking-tight">
            Reel Viral
            <span className="gradient-primary bg-clip-text text-transparent"> Analyzer</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
            Paste your Instagram Reel link and get an AI-powered viral potential score with actionable insights
          </p>
        </div>
      </div>

      {/* Input */}
      <div className="max-w-xl mx-auto px-4 pb-8">
        <Card className="glass p-5 space-y-3">
          <div className="relative">
            <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="https://www.instagram.com/reel/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pl-9 bg-muted/50 border-border h-11"
            />
          </div>
          <Input
            placeholder="Paste caption (optional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="bg-muted/50 border-border h-10 text-sm"
          />
          <Input
            placeholder="Hashtags (optional, e.g. #viral #trending)"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            className="bg-muted/50 border-border h-10 text-sm"
          />
          <Button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full h-11 gradient-primary text-primary-foreground font-semibold shadow-glow hover:opacity-90 transition-opacity"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 mr-2" />
                Analyze Viral Potential
              </>
            )}
          </Button>
        </Card>
      </div>

      {/* Results */}
      {analysis && (
        <div className="max-w-2xl mx-auto px-4 pb-16 space-y-6">
          {/* Score */}
          <Card className="glass p-8 flex flex-col items-center">
            <ViralScoreCircle score={analysis.viralScore} />
            <p className="mt-4 text-sm text-muted-foreground text-center max-w-md">
              {analysis.overallSummary}
            </p>
          </Card>

          {/* Category Scores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AnalysisCard icon="🎣" title="Hook & Opening" score={analysis.hookScore} details={analysis.hookDetails} />
            <AnalysisCard icon="✍️" title="Caption Quality" score={analysis.captionScore} details={analysis.captionDetails} />
            <AnalysisCard icon="#️⃣" title="Hashtag Strategy" score={analysis.hashtagScore} details={analysis.hashtagDetails} />
            <AnalysisCard icon="📊" title="Engagement Signals" score={analysis.engagementScore} details={analysis.engagementDetails} />
            <AnalysisCard icon="🔥" title="Trend Alignment" score={analysis.trendScore} details={analysis.trendDetails} />
          </div>

          {/* Recommendations */}
          <Card className="glass p-5">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>💡</span> Top Recommendations
            </h3>
            <ul className="space-y-2">
              {analysis.topRecommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="gradient-primary bg-clip-text text-transparent font-bold">{i + 1}.</span>
                  {rec}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Index;
