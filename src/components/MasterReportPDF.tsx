import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ReelAnalysis } from "@/lib/types";
import { Download, FileText, Crown, BarChart3, Calendar, Target, Lightbulb, TrendingUp, CheckCircle, Star, MessageCircle, Zap, AlertTriangle, ArrowUp, ArrowDown, Minus } from "lucide-react";

interface Props {
  analysis: ReelAnalysis;
  premiumData: any;
  reelUrl: string;
}

const MasterReportPDF = ({ analysis, premiumData, reelUrl }: Props) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Dynamic import of html2canvas and jspdf
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const element = reportRef.current;
      if (!element) return;

      // Make report visible for capture
      element.style.display = "block";
      element.style.position = "absolute";
      element.style.left = "-9999px";
      element.style.width = "800px";

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#0a0b14",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = pdfWidth / (imgWidth / 2);
      const totalPages = Math.ceil((imgHeight / 2 * ratio) / pdfHeight);

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage();
        const yOffset = -(page * pdfHeight / ratio) * 2;
        pdf.addImage(imgData, "PNG", 0, yOffset * ratio / 2, pdfWidth, (imgHeight / 2) * ratio);
      }

      pdf.save(`master-report-${Date.now()}.pdf`);
      element.style.display = "none";
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setDownloading(false);
    }
  };

  const viralScore = analysis.viralClassification?.score || analysis.viralScore || 0;
  const scores = premiumData.scoreBreakdown || {};

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Download CTA */}
      <Card className="glass p-4 flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary-bg flex items-center justify-center shadow-glow">
            <Crown className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Your Master Report is Ready! 🎉</h3>
            <p className="text-xs text-muted-foreground">Download your professional 4-5 page PDF report</p>
          </div>
        </div>
        <Button
          onClick={handleDownload}
          disabled={downloading}
          className="gradient-primary-bg text-primary-foreground font-semibold shadow-glow"
        >
          {downloading ? "Generating PDF..." : <><Download className="w-4 h-4 mr-2" /> Download PDF</>}
        </Button>
      </Card>

      {/* On-screen preview of premium sections */}
      {/* Executive Summary */}
      <Card className="glass p-5 space-y-3">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" /> Executive Summary
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{premiumData.executiveSummary}</p>
      </Card>

      {/* Competitor Comparison */}
      {premiumData.competitorComparison && (
        <Card className="glass p-5 space-y-3">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" /> Competitor Comparison
          </h3>
          <p className="text-xs text-muted-foreground">{premiumData.competitorComparison.summary}</p>
          <div className="space-y-2">
            {premiumData.competitorComparison.topPerformers?.map((p: any, i: number) => (
              <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primary">#{p.rank}</span>
                  <span className="text-xs font-medium text-foreground">{p.trait}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Your Score: {p.yourScore}</p>
                <p className="text-[10px] text-[hsl(var(--viral-high))]">→ {p.recommendation}</p>
              </div>
            ))}
          </div>
          {premiumData.competitorComparison.categoryInsight && (
            <p className="text-xs text-accent italic">{premiumData.competitorComparison.categoryInsight}</p>
          )}
        </Card>
      )}

      {/* Content Calendar */}
      {premiumData.contentCalendar && (
        <Card className="glass p-5 space-y-3">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" /> Best Posting Times
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {premiumData.contentCalendar.bestPostingTimes?.map((t: any, i: number) => (
              <div key={i} className="p-2 rounded-lg bg-muted/20 border border-border/30 text-xs">
                <span className="font-medium text-foreground">{t.day}</span>
                <span className="text-muted-foreground"> • {t.time}</span>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">{t.reason}</p>
              </div>
            ))}
          </div>
          {premiumData.contentCalendar.postingFrequency && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Recommended frequency:</span> {premiumData.contentCalendar.postingFrequency}
            </p>
          )}
        </Card>
      )}

      {/* Improvement Roadmap */}
      {premiumData.improvementRoadmap && (
        <Card className="glass p-5 space-y-3">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" /> 5-Step Improvement Roadmap
          </h3>
          <div className="space-y-3">
            {premiumData.improvementRoadmap.steps?.map((s: any, i: number) => (
              <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded-full gradient-primary-bg flex items-center justify-center text-primary-foreground text-xs font-bold">
                    {s.step}
                  </span>
                  <span className="text-sm font-medium text-foreground">{s.title}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full ml-auto ${
                    s.impact === "high" ? "bg-[hsl(var(--viral-high))]/20 text-[hsl(var(--viral-high))]" :
                    s.impact === "medium" ? "bg-[hsl(var(--viral-mid))]/20 text-[hsl(var(--viral-mid))]" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {s.impact} impact
                  </span>
                </div>
                <p className="text-xs text-muted-foreground ml-8">{s.description}</p>
                <div className="flex gap-3 ml-8 mt-1">
                  <span className="text-[10px] text-muted-foreground/60">Effort: {s.effort}</span>
                  <span className="text-[10px] text-muted-foreground/60">Timeline: {s.timeline}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* AI Recommendations */}
      {premiumData.aiRecommendations && (
        <Card className="glass p-5 space-y-3">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-primary" /> AI Personalized Recommendations
          </h3>

          {premiumData.aiRecommendations.hookAlternatives?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-foreground mb-1">🎣 Alternative Hooks:</p>
              <ul className="space-y-1">
                {premiumData.aiRecommendations.hookAlternatives.map((h: string, i: number) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <Star className="w-3 h-3 text-accent flex-shrink-0 mt-0.5" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {premiumData.aiRecommendations.captionRewrite && (
            <div>
              <p className="text-xs font-medium text-foreground mb-1">✍️ Improved Caption:</p>
              <p className="text-xs text-muted-foreground p-2 rounded bg-muted/30 border border-border/30 italic">
                {premiumData.aiRecommendations.captionRewrite}
              </p>
            </div>
          )}

          {premiumData.aiRecommendations.hashtagStrategy?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-foreground mb-1"># Suggested Hashtags:</p>
              <div className="flex flex-wrap gap-1">
                {premiumData.aiRecommendations.hashtagStrategy.map((h: string, i: number) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}

          {premiumData.aiRecommendations.engagementBoostTips?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-foreground mb-1">🚀 Engagement Boost Tips:</p>
              <ul className="space-y-1">
                {premiumData.aiRecommendations.engagementBoostTips.map((t: string, i: number) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <CheckCircle className="w-3 h-3 text-[hsl(var(--viral-high))] flex-shrink-0 mt-0.5" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      {/* Virality Factors Deep Analysis (Premium Only) */}
      {premiumData.viralityInsights?.length > 0 && (
        <Card className="glass p-5 space-y-3">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" /> Virality Factors Analysis
          </h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Each factor that affects your reel's viral potential — with actionable solutions
          </p>
          <div className="space-y-2">
            {premiumData.viralityInsights.map((insight: any, i: number) => (
              <div key={i} className={`p-3 rounded-lg border ${
                insight.impact === "positive" 
                  ? "bg-[hsl(var(--viral-high))]/5 border-[hsl(var(--viral-high))]/20" 
                  : insight.impact === "negative"
                  ? "bg-[hsl(var(--viral-low))]/5 border-[hsl(var(--viral-low))]/20"
                  : "bg-muted/20 border-border/30"
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {insight.impact === "positive" ? (
                      <ArrowUp className="w-3.5 h-3.5 text-[hsl(var(--viral-high))]" />
                    ) : insight.impact === "negative" ? (
                      <ArrowDown className="w-3.5 h-3.5 text-[hsl(var(--viral-low))]" />
                    ) : (
                      <Minus className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                    <span className="text-xs font-semibold text-foreground">{insight.factor}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    insight.score > 0 
                      ? "bg-[hsl(var(--viral-high))]/20 text-[hsl(var(--viral-high))]"
                      : insight.score < 0
                      ? "bg-[hsl(var(--viral-low))]/20 text-[hsl(var(--viral-low))]"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {insight.score > 0 ? `+${insight.score}` : insight.score} pts
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed mb-1.5">{insight.reason}</p>
                <div className="flex items-start gap-1.5 p-2 rounded bg-primary/5 border border-primary/10">
                  <Lightbulb className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-primary/90 leading-relaxed">{insight.solution}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Hidden PDF content for rendering */}
      <div ref={reportRef} style={{ display: "none" }}>
        <div style={{ width: "800px", padding: "40px", backgroundColor: "#0a0b14", color: "#e5e7eb", fontFamily: "Inter, sans-serif" }}>
          {/* Page 1: Cover + Summary */}
          <div style={{ minHeight: "1100px", paddingBottom: "40px" }}>
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <h1 style={{ fontSize: "32px", fontWeight: "bold", background: "linear-gradient(135deg, #e63976, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Master Analysis Report
              </h1>
              <p style={{ fontSize: "14px", color: "#9ca3af", marginTop: "8px" }}>Viral Reel Analyzer • Premium Report</p>
              <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>{new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>
            </div>

            <div style={{ padding: "20px", borderRadius: "12px", border: "1px solid #1f2937", marginBottom: "24px", background: "#111827" }}>
              <p style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "4px" }}>Reel URL</p>
              <p style={{ fontSize: "13px", color: "#e5e7eb", wordBreak: "break-all" }}>{reelUrl}</p>
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: "30px" }}>
              <div style={{ width: "120px", height: "120px", borderRadius: "50%", background: `conic-gradient(#e63976 ${viralScore * 3.6}deg, #1f2937 0deg)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: "100px", height: "100px", borderRadius: "50%", backgroundColor: "#0a0b14", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                  <span style={{ fontSize: "28px", fontWeight: "bold", color: "#e63976" }}>{viralScore}</span>
                  <span style={{ fontSize: "10px", color: "#9ca3af" }}>Viral Score</span>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "30px" }}>
              {[
                { label: "Hook", score: scores.hook },
                { label: "Caption", score: scores.caption },
                { label: "Hashtag", score: scores.hashtag },
                { label: "Engagement", score: scores.engagement },
              ].map((s, i) => (
                <div key={i} style={{ padding: "12px", borderRadius: "8px", background: "#111827", border: "1px solid #1f2937", textAlign: "center" }}>
                  <p style={{ fontSize: "20px", fontWeight: "bold", color: "#e63976" }}>{s.score}/10</p>
                  <p style={{ fontSize: "11px", color: "#9ca3af" }}>{s.label}</p>
                </div>
              ))}
            </div>

            <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#e5e7eb", marginBottom: "12px" }}>Executive Summary</h2>
            <p style={{ fontSize: "13px", color: "#9ca3af", lineHeight: "1.8" }}>{premiumData.executiveSummary}</p>
          </div>

          {/* Page 2: Competitor Comparison */}
          <div style={{ minHeight: "1100px", paddingBottom: "40px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#e5e7eb", marginBottom: "16px", paddingTop: "20px" }}>📊 Competitor Comparison</h2>
            <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "16px" }}>{premiumData.competitorComparison?.summary}</p>
            {premiumData.competitorComparison?.topPerformers?.map((p: any, i: number) => (
              <div key={i} style={{ padding: "14px", borderRadius: "8px", background: "#111827", border: "1px solid #1f2937", marginBottom: "10px" }}>
                <p style={{ fontSize: "13px", fontWeight: "600", color: "#e5e7eb" }}>#{p.rank} {p.trait}</p>
                <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "4px" }}>Your Score: {p.yourScore}</p>
                <p style={{ fontSize: "11px", color: "#10b981", marginTop: "2px" }}>→ {p.recommendation}</p>
              </div>
            ))}
            {premiumData.competitorComparison?.categoryInsight && (
              <p style={{ fontSize: "12px", color: "#f59e0b", fontStyle: "italic", marginTop: "12px" }}>{premiumData.competitorComparison.categoryInsight}</p>
            )}
          </div>

          {/* Page 3: Content Calendar */}
          <div style={{ minHeight: "1100px", paddingBottom: "40px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#e5e7eb", marginBottom: "16px", paddingTop: "20px" }}>📅 Content Calendar</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", marginBottom: "20px" }}>
              {premiumData.contentCalendar?.bestPostingTimes?.map((t: any, i: number) => (
                <div key={i} style={{ padding: "12px", borderRadius: "8px", background: "#111827", border: "1px solid #1f2937" }}>
                  <p style={{ fontSize: "13px", fontWeight: "600", color: "#e5e7eb" }}>{t.day}</p>
                  <p style={{ fontSize: "12px", color: "#e63976" }}>{t.time}</p>
                  <p style={{ fontSize: "10px", color: "#6b7280", marginTop: "4px" }}>{t.reason}</p>
                </div>
              ))}
            </div>
            {premiumData.contentCalendar?.postingFrequency && (
              <p style={{ fontSize: "13px", color: "#9ca3af" }}>
                <strong style={{ color: "#e5e7eb" }}>Recommended Frequency:</strong> {premiumData.contentCalendar.postingFrequency}
              </p>
            )}
            {premiumData.contentCalendar?.weeklyPlan && (
              <div style={{ padding: "14px", borderRadius: "8px", background: "#111827", border: "1px solid #1f2937", marginTop: "16px" }}>
                <p style={{ fontSize: "13px", fontWeight: "600", color: "#e5e7eb", marginBottom: "6px" }}>Weekly Plan</p>
                <p style={{ fontSize: "12px", color: "#9ca3af", lineHeight: "1.7" }}>{premiumData.contentCalendar.weeklyPlan}</p>
              </div>
            )}
          </div>

          {/* Page 4: Improvement Roadmap */}
          <div style={{ minHeight: "1100px", paddingBottom: "40px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#e5e7eb", marginBottom: "16px", paddingTop: "20px" }}>🎯 5-Step Improvement Roadmap</h2>
            {premiumData.improvementRoadmap?.steps?.map((s: any, i: number) => (
              <div key={i} style={{ padding: "16px", borderRadius: "8px", background: "#111827", border: "1px solid #1f2937", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <span style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #e63976, #7c3aed)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "bold", color: "#fff" }}>
                    {s.step}
                  </span>
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#e5e7eb" }}>{s.title}</span>
                  <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "12px", backgroundColor: s.impact === "high" ? "#064e3b" : s.impact === "medium" ? "#78350f" : "#1f2937", color: s.impact === "high" ? "#10b981" : s.impact === "medium" ? "#f59e0b" : "#9ca3af", marginLeft: "auto" }}>
                    {s.impact} impact
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "#9ca3af", lineHeight: "1.6", marginLeft: "38px" }}>{s.description}</p>
                <div style={{ marginLeft: "38px", marginTop: "6px", display: "flex", gap: "16px" }}>
                  <span style={{ fontSize: "10px", color: "#6b7280" }}>Effort: {s.effort}</span>
                  <span style={{ fontSize: "10px", color: "#6b7280" }}>Timeline: {s.timeline}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Page 5: AI Recommendations */}
          <div style={{ minHeight: "1100px", paddingBottom: "40px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#e5e7eb", marginBottom: "16px", paddingTop: "20px" }}>💡 AI Personalized Recommendations</h2>

            {premiumData.aiRecommendations?.hookAlternatives?.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <p style={{ fontSize: "14px", fontWeight: "600", color: "#e5e7eb", marginBottom: "8px" }}>🎣 Alternative Hooks</p>
                {premiumData.aiRecommendations.hookAlternatives.map((h: string, i: number) => (
                  <p key={i} style={{ fontSize: "12px", color: "#9ca3af", padding: "8px 12px", background: "#111827", borderRadius: "6px", marginBottom: "6px", borderLeft: "3px solid #e63976" }}>
                    {h}
                  </p>
                ))}
              </div>
            )}

            {premiumData.aiRecommendations?.captionRewrite && (
              <div style={{ marginBottom: "20px" }}>
                <p style={{ fontSize: "14px", fontWeight: "600", color: "#e5e7eb", marginBottom: "8px" }}>✍️ Improved Caption</p>
                <p style={{ fontSize: "12px", color: "#9ca3af", padding: "12px", background: "#111827", borderRadius: "8px", border: "1px solid #1f2937", fontStyle: "italic", lineHeight: "1.7" }}>
                  {premiumData.aiRecommendations.captionRewrite}
                </p>
              </div>
            )}

            {premiumData.aiRecommendations?.hashtagStrategy?.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <p style={{ fontSize: "14px", fontWeight: "600", color: "#e5e7eb", marginBottom: "8px" }}># Suggested Hashtags</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {premiumData.aiRecommendations.hashtagStrategy.map((h: string, i: number) => (
                    <span key={i} style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "16px", background: "#1a0a1e", border: "1px solid #e63976", color: "#e63976" }}>
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {premiumData.aiRecommendations?.engagementBoostTips?.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <p style={{ fontSize: "14px", fontWeight: "600", color: "#e5e7eb", marginBottom: "8px" }}>🚀 Engagement Boost Tips</p>
                {premiumData.aiRecommendations.engagementBoostTips.map((t: string, i: number) => (
                  <p key={i} style={{ fontSize: "12px", color: "#9ca3af", padding: "8px 12px", background: "#111827", borderRadius: "6px", marginBottom: "6px", borderLeft: "3px solid #10b981" }}>
                    ✓ {t}
                  </p>
                ))}
              </div>
            )}

            {/* Page 6: Virality Factors Deep Analysis */}
            {premiumData.viralityInsights?.length > 0 && (
              <div style={{ minHeight: "1100px", paddingBottom: "40px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#e5e7eb", marginBottom: "8px", paddingTop: "20px" }}>⚡ Virality Factors Deep Analysis</h2>
                <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "16px" }}>Each factor affecting your reel's viral potential — with reasons and actionable solutions</p>
                {premiumData.viralityInsights.map((insight: any, i: number) => (
                  <div key={i} style={{ padding: "12px", borderRadius: "8px", background: "#111827", border: `1px solid ${insight.impact === "positive" ? "#064e3b" : insight.impact === "negative" ? "#7f1d1d" : "#1f2937"}`, marginBottom: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "#e5e7eb" }}>
                        {insight.impact === "positive" ? "↑" : insight.impact === "negative" ? "↓" : "→"} {insight.factor}
                      </span>
                      <span style={{ fontSize: "11px", fontWeight: "bold", padding: "2px 8px", borderRadius: "10px", backgroundColor: insight.score > 0 ? "#064e3b" : insight.score < 0 ? "#7f1d1d" : "#1f2937", color: insight.score > 0 ? "#10b981" : insight.score < 0 ? "#ef4444" : "#9ca3af" }}>
                        {insight.score > 0 ? `+${insight.score}` : insight.score} pts
                      </span>
                    </div>
                    <p style={{ fontSize: "11px", color: "#9ca3af", lineHeight: "1.6", marginBottom: "6px" }}>{insight.reason}</p>
                    <div style={{ padding: "8px 10px", borderRadius: "6px", background: "#0a0b14", borderLeft: "3px solid #e63976" }}>
                      <p style={{ fontSize: "11px", color: "#e63976", lineHeight: "1.5" }}>💡 {insight.solution}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid #1f2937", textAlign: "center" }}>
              <p style={{ fontSize: "11px", color: "#6b7280" }}>Generated by Viral Reel Analyzer • {new Date().toLocaleDateString("en-IN")}</p>
              <p style={{ fontSize: "10px", color: "#4b5563", marginTop: "4px" }}>This report is for educational and informational purposes only.</p>
              <p style={{ fontSize: "10px", color: "#4b5563", marginTop: "2px" }}>Scores are capped at 80/80 — no content is 100% guaranteed to go viral.</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MasterReportPDF;
