import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BannerAd, InlineAd } from "@/components/AdSlots";
import type { ReelAnalysis } from "@/lib/types";
import { Download, FileText, Crown, BarChart3, Calendar, Target, Lightbulb, TrendingUp, CheckCircle, Star, Zap, ArrowUp, ArrowDown, Minus, AlertTriangle, Clock, Eye, Music, Hash, Video, Mic, Sparkles, Users, MapPin, ShieldCheck, XCircle, BookOpen } from "lucide-react";

interface Props {
  analysis: ReelAnalysis;
  premiumData: any;
  reelUrl: string;
}

const MasterReportPDF = ({ analysis, premiumData, reelUrl }: Props) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleTextDownload = () => {
    const lines: string[] = [];
    lines.push("═══════════════════════════════════════════");
    lines.push("       MASTER VIRAL ANALYSIS REPORT");
    lines.push("       Viral Reel Analyzer — Premium");
    lines.push("═══════════════════════════════════════════");
    lines.push("");
    lines.push(`Reel URL: ${reelUrl}`);
    lines.push(`Generated: ${new Date().toLocaleString("en-IN")}`);
    lines.push(`Viral Score: ${analysis.viralClassification?.score || analysis.viralScore || 0}/80`);
    lines.push(`Status: ${analysis.viralClassification?.status || "N/A"}`);
    lines.push("");

    if (premiumData.reportIntro) {
      lines.push("── INTRODUCTION ──");
      lines.push(premiumData.reportIntro.purpose || "");
      lines.push(premiumData.reportIntro.disclaimer || "");
      lines.push("");
    }

    if (premiumData.scoreBreakdown) {
      lines.push("── SCORE BREAKDOWN ──");
      const sb = premiumData.scoreBreakdown;
      Object.entries(sb).forEach(([key, val]) => {
        lines.push(`  ${key}: ${val}/8`);
      });
      lines.push("");
    }

    if (premiumData.viralityInsights) {
      lines.push("── VIRALITY FACTOR ANALYSIS ──");
      const vi = premiumData.viralityInsights;
      Object.entries(vi).forEach(([key, val]: [string, any]) => {
        lines.push(`\n▸ ${key.toUpperCase()}`);
        lines.push(`  Impact: ${val.impact || "N/A"}`);
        lines.push(`  Reason: ${val.reason || "N/A"}`);
        lines.push(`  Solution: ${val.solution || "N/A"}`);
      });
      lines.push("");
    }

    if (premiumData.categoryInfluence) {
      lines.push("── CATEGORY INFLUENCE ──");
      lines.push(`  Detected: ${premiumData.categoryInfluence.detected || "N/A"}`);
      lines.push(`  Impact: ${premiumData.categoryInfluence.impact || "N/A"}`);
      lines.push(`  Explanation: ${premiumData.categoryInfluence.explanation || "N/A"}`);
      lines.push("");
    }

    if (premiumData.reelAgeFactor) {
      lines.push("── REEL AGE FACTOR ──");
      lines.push(`  Age: ${premiumData.reelAgeFactor.age || "N/A"}`);
      lines.push(`  Impact: ${premiumData.reelAgeFactor.impact || "N/A"}`);
      lines.push(`  Explanation: ${premiumData.reelAgeFactor.explanation || "N/A"}`);
      lines.push("");
    }

    if (premiumData.famousElementsAnalysis) {
      lines.push("── FAMOUS ELEMENTS ──");
      const fe = premiumData.famousElementsAnalysis;
      if (fe.detected?.length) lines.push(`  Detected: ${fe.detected.join(", ")}`);
      lines.push(`  Impact: ${fe.impact || "N/A"}`);
      lines.push("");
    }

    if (premiumData.nicheViralityTable?.length) {
      lines.push("── NICHE VIRALITY TABLE ──");
      premiumData.nicheViralityTable.forEach((n: any) => {
        lines.push(`  ${n.niche}: ${"★".repeat(n.viralPotential || 0)}${"☆".repeat(5 - (n.viralPotential || 0))}`);
      });
      lines.push("");
    }

    if (premiumData.creatorChecklist?.length) {
      lines.push("── CREATOR PRE-POST CHECKLIST ──");
      premiumData.creatorChecklist.forEach((item: string, i: number) => {
        lines.push(`  ${i + 1}. ${item}`);
      });
      lines.push("");
    }

    if (premiumData.commonMistakes?.length) {
      lines.push("── COMMON MISTAKES TO AVOID ──");
      premiumData.commonMistakes.forEach((m: string, i: number) => {
        lines.push(`  ${i + 1}. ${m}`);
      });
      lines.push("");
    }

    if (premiumData.quickTips?.length) {
      lines.push("── QUICK TIPS ──");
      premiumData.quickTips.forEach((t: string, i: number) => {
        lines.push(`  ${i + 1}. ${t}`);
      });
      lines.push("");
    }

    if (premiumData.improvementRoadmap?.length) {
      lines.push("── 5-STEP IMPROVEMENT ROADMAP ──");
      premiumData.improvementRoadmap.forEach((step: any, i: number) => {
        lines.push(`  Step ${i + 1}: ${step.title || step}`);
        if (step.description) lines.push(`    → ${step.description}`);
      });
      lines.push("");
    }

    lines.push("═══════════════════════════════════════════");
    lines.push("  © Viral Reel Analyzer — Premium Report");
    lines.push("  100% guarantee nahi, realistic estimate hai.");
    lines.push("═══════════════════════════════════════════");

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const link = document.createElement("a");
    link.download = `master-report-${Date.now()}.txt`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");
      const element = reportRef.current;
      if (!element) {
        console.error("Report ref not found");
        setDownloading(false);
        return;
      }

      // Make visible off-screen for rendering
      element.style.display = "block";
      element.style.position = "fixed";
      element.style.left = "-10000px";
      element.style.top = "0";
      element.style.width = "800px";
      element.style.zIndex = "-1";

      // Wait for rendering
      await new Promise(r => setTimeout(r, 500));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#0a0b14",
        logging: false,
        width: 800,
        windowWidth: 800,
      });

      // Hide again
      element.style.display = "none";
      element.style.position = "";
      element.style.left = "";
      element.style.top = "";
      element.style.zIndex = "";

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate proper scaling
      const imgWidthPx = canvas.width;
      const imgHeightPx = canvas.height;
      const scaledHeight = (imgHeightPx * pdfWidth) / imgWidthPx;
      const totalPages = Math.ceil(scaledHeight / pdfHeight);

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage();
        const yOffset = -(page * pdfHeight);
        pdf.addImage(imgData, "PNG", 0, yOffset, pdfWidth, scaledHeight);
      }

      pdf.save(`master-report-${Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
      // Fallback: download as text
      handleTextDownload();
    } finally {
      setDownloading(false);
      // Ensure hidden
      if (reportRef.current) {
        reportRef.current.style.display = "none";
      }
    }
  };

  const viralScore = analysis.viralClassification?.score || analysis.viralScore || 0;
  const scores = premiumData.scoreBreakdown || {};
  const decayData = premiumData.reelAgeFactor?.decayData || [];

  return (
    <motion.div className="space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {/* Download CTA */}
      <Card className="glass p-4 flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary-bg flex items-center justify-center shadow-glow">
            <Crown className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Your Master Report is Ready! 🎉</h3>
            <p className="text-xs text-muted-foreground">Premium 10+ page comprehensive viral analysis PDF</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleTextDownload} variant="outline" className="border-border/50 text-foreground">
            <FileText className="w-4 h-4 mr-2" /> Download TXT
          </Button>
          <Button onClick={handleDownload} disabled={downloading} className="gradient-primary-bg text-primary-foreground font-semibold shadow-glow">
            {downloading ? "Generating PDF..." : <><Download className="w-4 h-4 mr-2" /> Download PDF</>}
          </Button>
        </div>
      </Card>

      {/* ===== ON-SCREEN PREVIEW SECTIONS ===== */}

      {/* Intro & Disclaimer */}
      {premiumData.reportIntro && (
        <Card className="glass p-5 space-y-3">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" /> {premiumData.reportIntro.title || "Viral Prediction Framework"}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{premiumData.reportIntro.whatIsThis}</p>
          <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
            <p className="text-[11px] text-accent leading-relaxed flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {premiumData.reportIntro.disclaimer}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">📊 Baseline Scoring</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{premiumData.reportIntro.baselineExplanation}</p>
          </div>
        </Card>
      )}

      {/* Executive Summary */}
      <Card className="glass p-5 space-y-3">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" /> Executive Summary
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{premiumData.executiveSummary}</p>
      </Card>

      {/* Category Influence */}
      {premiumData.categoryInfluence && (
        <Card className="glass p-5 space-y-3">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> Category Viral Potential
          </h3>
          <p className="text-xs text-muted-foreground">{premiumData.categoryInfluence.explanation}</p>
          <div className="space-y-1.5">
            <p className="text-[10px] text-[hsl(var(--viral-high))] font-semibold uppercase tracking-wider">🔥 High Viral Categories</p>
            {premiumData.categoryInfluence.highViralCategories?.map((c: any, i: number) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded bg-[hsl(var(--viral-high))]/5 border border-[hsl(var(--viral-high))]/10">
                <span className="text-[10px] font-bold text-[hsl(var(--viral-high))] w-20">{c.viralChance}</span>
                <span className="text-xs font-medium text-foreground">{c.category}</span>
                <span className="text-[10px] text-muted-foreground ml-auto">{c.examples}</span>
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] text-[hsl(var(--viral-low))] font-semibold uppercase tracking-wider">📉 Lower Viral Categories</p>
            {premiumData.categoryInfluence.lowViralCategories?.map((c: any, i: number) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded bg-[hsl(var(--viral-low))]/5 border border-[hsl(var(--viral-low))]/10">
                <span className="text-[10px] font-bold text-[hsl(var(--viral-low))] w-20">{c.viralChance}</span>
                <span className="text-xs font-medium text-foreground">{c.category}</span>
                <span className="text-[10px] text-muted-foreground ml-auto">{c.examples}</span>
              </div>
            ))}
          </div>
          <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-xs text-primary/90">{premiumData.categoryInfluence.yourCategory}</p>
          </div>
        </Card>
      )}

      {/* Reel Age Decay */}
      {premiumData.reelAgeFactor && (
        <Card className="glass p-5 space-y-3">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> Viral Probability vs Reel Age
          </h3>
          <p className="text-xs text-muted-foreground">{premiumData.reelAgeFactor.explanation}</p>
          
          {/* Visual decay chart */}
          <div className="space-y-1.5">
            {decayData.map((d: any, i: number) => {
              const prob = parseInt(d.viralProbability) || 0;
              const color = prob >= 80 ? "hsl(var(--viral-high))" : prob >= 40 ? "hsl(var(--viral-mid))" : "hsl(var(--viral-low))";
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[10px] text-muted-foreground w-16 flex-shrink-0">{d.period}</span>
                  <div className="flex-1 h-5 rounded-full bg-muted/30 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${prob}%` }}
                      transition={{ duration: 1, delay: i * 0.15 }}
                    />
                  </div>
                  <span className="text-[10px] font-bold w-12 text-right" style={{ color }}>{d.viralProbability}</span>
                </div>
              );
            })}
          </div>
          
          <div className="p-2.5 rounded-lg bg-muted/20 border border-border/30">
            <p className="text-[10px] font-medium text-foreground mb-0.5">⏰ Peak Window</p>
            <p className="text-[10px] text-muted-foreground">{premiumData.reelAgeFactor.peakWindow}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-xs text-primary/90">{premiumData.reelAgeFactor.yourReelAge}</p>
          </div>
        </Card>
      )}

      {/* Niche Virality Table */}
      {premiumData.nicheViralityTable && (
        <Card className="glass p-5 space-y-3">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" /> Niche Virality Comparison
          </h3>
          <p className="text-xs text-muted-foreground">{premiumData.nicheViralityTable.explanation}</p>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left py-1.5 text-muted-foreground font-medium">Niche</th>
                  <th className="text-center py-1.5 text-muted-foreground font-medium">Viral Score</th>
                  <th className="text-left py-1.5 text-muted-foreground font-medium">Best Format</th>
                  <th className="text-left py-1.5 text-muted-foreground font-medium">Trend Example</th>
                </tr>
              </thead>
              <tbody>
                {premiumData.nicheViralityTable.niches?.map((n: any, i: number) => (
                  <tr key={i} className="border-b border-border/10">
                    <td className="py-1.5 font-medium text-foreground">{n.niche}</td>
                    <td className="py-1.5 text-center">{n.viralFriendliness}</td>
                    <td className="py-1.5 text-muted-foreground">{n.bestFormat}</td>
                    <td className="py-1.5 text-muted-foreground">{n.trendExample}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Famous Elements */}
      {premiumData.famousElementsAnalysis && (
        <Card className="glass p-5 space-y-3">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Star className="w-4 h-4 text-primary" /> Famous Elements Impact
          </h3>
          <p className="text-xs text-muted-foreground">{premiumData.famousElementsAnalysis.explanation}</p>
          
          {premiumData.famousElementsAnalysis.celebrityImpact && (
            <div className="p-3 rounded-lg bg-muted/20 border border-border/30 space-y-1.5">
              <p className="text-xs font-semibold text-foreground">👤 Celebrity/Famous Person Impact</p>
              <p className="text-[11px] text-muted-foreground">{premiumData.famousElementsAnalysis.celebrityImpact.description}</p>
              {premiumData.famousElementsAnalysis.celebrityImpact.examples?.map((e: string, i: number) => (
                <p key={i} className="text-[10px] text-muted-foreground/80 flex items-start gap-1">• {e}</p>
              ))}
              <p className="text-[11px] text-primary/90 mt-1">{premiumData.famousElementsAnalysis.celebrityImpact.yourReel}</p>
            </div>
          )}
          
          {premiumData.famousElementsAnalysis.landmarkImpact && (
            <div className="p-3 rounded-lg bg-muted/20 border border-border/30 space-y-1.5">
              <p className="text-xs font-semibold text-foreground">🏛️ Famous Places/Objects</p>
              <p className="text-[11px] text-muted-foreground">{premiumData.famousElementsAnalysis.landmarkImpact.description}</p>
              {premiumData.famousElementsAnalysis.landmarkImpact.examples?.map((e: string, i: number) => (
                <p key={i} className="text-[10px] text-muted-foreground/80 flex items-start gap-1">• {e}</p>
              ))}
            </div>
          )}

          {premiumData.famousElementsAnalysis.trendingIncidents && (
            <div className="p-3 rounded-lg bg-muted/20 border border-border/30 space-y-1.5">
              <p className="text-xs font-semibold text-foreground">📰 Trending Topics/Incidents</p>
              <p className="text-[11px] text-muted-foreground">{premiumData.famousElementsAnalysis.trendingIncidents.description}</p>
              <p className="text-[10px] font-medium text-foreground mt-1">How to identify:</p>
              {premiumData.famousElementsAnalysis.trendingIncidents.howToIdentify?.map((h: string, i: number) => (
                <p key={i} className="text-[10px] text-muted-foreground/80 flex items-start gap-1">✓ {h}</p>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Thumbnail & Hook */}
      {premiumData.thumbnailHookAnalysis && (
        <Card className="glass p-5 space-y-3">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" /> First 3 Seconds & Thumbnail
          </h3>
          <p className="text-xs text-muted-foreground">{premiumData.thumbnailHookAnalysis.whyFirst3SecondsMatter}</p>
          
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold text-foreground uppercase tracking-wider">Hook Types</p>
            {premiumData.thumbnailHookAnalysis.hookTypes?.map((h: any, i: number) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded bg-muted/20">
                <span className="text-[10px] font-bold text-primary w-24 flex-shrink-0">{h.type}</span>
                <span className="text-[10px] text-muted-foreground flex-1">"{h.example}"</span>
                <span className="text-[9px] text-[hsl(var(--viral-high))] flex-shrink-0">{h.effectiveness}</span>
              </div>
            ))}
          </div>
          
          <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-xs text-primary/90">{premiumData.thumbnailHookAnalysis.yourReel}</p>
          </div>
        </Card>
      )}

      {/* Audio & Voice */}
      {premiumData.audioVoiceAnalysis && (
        <Card className="glass p-5 space-y-3">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Mic className="w-4 h-4 text-primary" /> Audio, Voice & Music Strategy
          </h3>
          <p className="text-xs text-muted-foreground">{premiumData.audioVoiceAnalysis.explanation}</p>
          
          {premiumData.audioVoiceAnalysis.voiceImpact && (
            <div className="p-3 rounded-lg bg-muted/20 border border-border/30 space-y-1.5">
              <p className="text-xs font-semibold text-foreground">🎙️ Voice Trends</p>
              {premiumData.audioVoiceAnalysis.voiceImpact.voiceTrends?.map((t: string, i: number) => (
                <p key={i} className="text-[10px] text-muted-foreground/80">• {t}</p>
              ))}
            </div>
          )}
          
          {premiumData.audioVoiceAnalysis.musicImpact && (
            <div className="p-3 rounded-lg bg-muted/20 border border-border/30 space-y-1.5">
              <p className="text-xs font-semibold text-foreground">🎵 Finding Trending Audio</p>
              <p className="text-[11px] text-muted-foreground">{premiumData.audioVoiceAnalysis.musicImpact.trendingAudio}</p>
              {premiumData.audioVoiceAnalysis.musicImpact.howToFind?.map((h: string, i: number) => (
                <p key={i} className="text-[10px] text-muted-foreground/80">✓ {h}</p>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Hashtag & Caption Strategy */}
      {premiumData.hashtagCaptionStrategy && (
        <Card className="glass p-5 space-y-3">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Hash className="w-4 h-4 text-primary" /> Hashtag & Caption Strategy
          </h3>
          
          {premiumData.hashtagCaptionStrategy.hashtagTips && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">{premiumData.hashtagCaptionStrategy.hashtagTips.explanation}</p>
              {premiumData.hashtagCaptionStrategy.hashtagTips.strategy?.map((s: any, i: number) => (
                <div key={i} className="p-2 rounded bg-muted/20 border border-border/20">
                  <span className="text-[10px] font-bold text-primary">{s.type}</span>
                  <p className="text-[10px] text-muted-foreground">{s.description}</p>
                  <p className="text-[10px] text-foreground/60 italic">{s.examples}</p>
                </div>
              ))}
              {premiumData.hashtagCaptionStrategy.hashtagTips.microCaseStudy && (
                <div className="p-2.5 rounded bg-accent/5 border border-accent/20">
                  <p className="text-[10px] text-accent">📌 Case Study: {premiumData.hashtagCaptionStrategy.hashtagTips.microCaseStudy}</p>
                </div>
              )}
            </div>
          )}
          
          {premiumData.hashtagCaptionStrategy.captionTips && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground">✍️ Caption Best Practices</p>
              {premiumData.hashtagCaptionStrategy.captionTips.bestPractices?.map((b: string, i: number) => (
                <p key={i} className="text-[10px] text-muted-foreground">✓ {b}</p>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Creator Checklist */}
      {premiumData.creatorChecklist?.length > 0 && (
        <Card className="glass p-5 space-y-3">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" /> Creator Pre-Post Checklist
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {premiumData.creatorChecklist.map((item: any, i: number) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded bg-muted/15">
                <CheckCircle className="w-3 h-3 text-[hsl(var(--viral-high))] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-foreground">{item.item}</p>
                  <p className="text-[9px] text-muted-foreground">{item.category} • {item.priority}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Common Mistakes */}
      {premiumData.commonMistakes?.length > 0 && (
        <Card className="glass p-5 space-y-3">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <XCircle className="w-4 h-4 text-[hsl(var(--viral-low))]" /> Common Mistakes to Avoid
          </h3>
          <div className="space-y-2">
            {premiumData.commonMistakes.map((m: any, i: number) => (
              <div key={i} className="p-2.5 rounded-lg bg-[hsl(var(--viral-low))]/5 border border-[hsl(var(--viral-low))]/15">
                <p className="text-xs font-medium text-foreground">❌ {m.mistake}</p>
                <p className="text-[10px] text-muted-foreground">{m.why}</p>
                <p className="text-[10px] text-[hsl(var(--viral-high))]">✅ Fix: {m.fix}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Tips */}
      {premiumData.quickTips && (
        <Card className="glass p-5 space-y-3">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-primary" /> Quick Tips
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(premiumData.quickTips).map(([key, tips]: [string, any]) => (
              <div key={key} className="p-2.5 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-1">{key}</p>
                {(tips as string[])?.map((t: string, i: number) => (
                  <p key={i} className="text-[10px] text-muted-foreground">• {t}</p>
                ))}
              </div>
            ))}
          </div>
        </Card>
      )}

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
                  <span className="w-6 h-6 rounded-full gradient-primary-bg flex items-center justify-center text-primary-foreground text-xs font-bold">{s.step}</span>
                  <span className="text-sm font-medium text-foreground">{s.title}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full ml-auto ${s.impact === "high" ? "bg-[hsl(var(--viral-high))]/20 text-[hsl(var(--viral-high))]" : s.impact === "medium" ? "bg-[hsl(var(--viral-mid))]/20 text-[hsl(var(--viral-mid))]" : "bg-muted text-muted-foreground"}`}>
                    {s.impact} impact
                  </span>
                </div>
                <p className="text-xs text-muted-foreground ml-8">{s.description}</p>
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
                    <Star className="w-3 h-3 text-accent flex-shrink-0 mt-0.5" />{h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {premiumData.aiRecommendations.captionRewrite && (
            <div>
              <p className="text-xs font-medium text-foreground mb-1">✍️ Improved Caption:</p>
              <p className="text-xs text-muted-foreground p-2 rounded bg-muted/30 border border-border/30 italic">{premiumData.aiRecommendations.captionRewrite}</p>
            </div>
          )}

          {premiumData.aiRecommendations.hashtagStrategy?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-foreground mb-1"># Suggested Hashtags:</p>
              <div className="flex flex-wrap gap-1">
                {premiumData.aiRecommendations.hashtagStrategy.map((h: string, i: number) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{h}</span>
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
                    <CheckCircle className="w-3 h-3 text-[hsl(var(--viral-high))] flex-shrink-0 mt-0.5" />{t}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      {/* Virality Factors Deep Analysis */}
      {premiumData.viralityInsights?.length > 0 && (
        <Card className="glass p-5 space-y-3">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" /> Virality Factors Deep Analysis
          </h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Each factor affecting your reel's viral potential — with actionable solutions
          </p>
          <div className="space-y-2">
            {premiumData.viralityInsights.map((insight: any, i: number) => (
              <div key={i} className={`p-3 rounded-lg border ${insight.impact === "positive" ? "bg-[hsl(var(--viral-high))]/5 border-[hsl(var(--viral-high))]/20" : insight.impact === "negative" ? "bg-[hsl(var(--viral-low))]/5 border-[hsl(var(--viral-low))]/20" : "bg-muted/20 border-border/30"}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {insight.impact === "positive" ? <ArrowUp className="w-3.5 h-3.5 text-[hsl(var(--viral-high))]" /> : insight.impact === "negative" ? <ArrowDown className="w-3.5 h-3.5 text-[hsl(var(--viral-low))]" /> : <Minus className="w-3.5 h-3.5 text-muted-foreground" />}
                    <span className="text-xs font-semibold text-foreground">{insight.factor}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${insight.score > 0 ? "bg-[hsl(var(--viral-high))]/20 text-[hsl(var(--viral-high))]" : insight.score < 0 ? "bg-[hsl(var(--viral-low))]/20 text-[hsl(var(--viral-low))]" : "bg-muted text-muted-foreground"}`}>
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

      {/* ===== HIDDEN PDF RENDER ===== */}
      <div ref={reportRef} style={{ display: "none" }}>
        <div style={{ width: "800px", padding: "40px", backgroundColor: "#0a0b14", color: "#e5e7eb", fontFamily: "Inter, sans-serif" }}>
          
          {/* PAGE 1: Cover + Intro + Score */}
          <div style={{ minHeight: "1100px", paddingBottom: "40px" }}>
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <h1 style={{ fontSize: "32px", fontWeight: "bold", background: "linear-gradient(135deg, #e63976, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Master Analysis Report
              </h1>
              <p style={{ fontSize: "14px", color: "#9ca3af", marginTop: "8px" }}>Viral Reel Analyzer • Premium Report</p>
              <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>{new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>
            </div>

            {/* URL */}
            <div style={{ padding: "16px", borderRadius: "12px", border: "1px solid #1f2937", marginBottom: "20px", background: "#111827" }}>
              <p style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "4px" }}>Reel URL</p>
              <p style={{ fontSize: "12px", color: "#e5e7eb", wordBreak: "break-all" }}>{reelUrl}</p>
            </div>

            {/* Intro & Disclaimer */}
            {premiumData.reportIntro && (
              <>
                <p style={{ fontSize: "12px", color: "#9ca3af", lineHeight: "1.7", marginBottom: "16px" }}>{premiumData.reportIntro.whatIsThis}</p>
                <div style={{ padding: "12px", borderRadius: "8px", background: "#1c1007", border: "1px solid #78350f", marginBottom: "16px" }}>
                  <p style={{ fontSize: "11px", color: "#f59e0b", lineHeight: "1.6" }}>⚠️ {premiumData.reportIntro.disclaimer}</p>
                </div>
                <div style={{ padding: "12px", borderRadius: "8px", background: "#111827", border: "1px solid #1f2937", marginBottom: "20px" }}>
                  <p style={{ fontSize: "10px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>📊 Baseline Scoring</p>
                  <p style={{ fontSize: "11px", color: "#9ca3af", lineHeight: "1.6" }}>{premiumData.reportIntro.baselineExplanation}</p>
                </div>
              </>
            )}

            {/* Score Circle + Breakdown */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
              <div style={{ width: "120px", height: "120px", borderRadius: "50%", background: `conic-gradient(#e63976 ${(viralScore / 80) * 360}deg, #1f2937 0deg)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: "100px", height: "100px", borderRadius: "50%", backgroundColor: "#0a0b14", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                  <span style={{ fontSize: "28px", fontWeight: "bold", color: "#e63976" }}>{viralScore}</span>
                  <span style={{ fontSize: "10px", color: "#9ca3af" }}>/80 Viral Score</span>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "24px" }}>
              {[
                { label: "Hook", score: scores.hook },
                { label: "Caption", score: scores.caption },
                { label: "Hashtag", score: scores.hashtag },
                { label: "Engagement", score: scores.engagement },
                { label: "Trend", score: scores.trend },
                { label: "Video", score: scores.videoQuality },
                { label: "Audio", score: scores.audioQuality },
              ].map((s, i) => (
                <div key={i} style={{ padding: "10px", borderRadius: "8px", background: "#111827", border: "1px solid #1f2937", textAlign: "center" }}>
                  <p style={{ fontSize: "18px", fontWeight: "bold", color: "#e63976" }}>{s.score}/8</p>
                  <p style={{ fontSize: "10px", color: "#9ca3af" }}>{s.label}</p>
                </div>
              ))}
            </div>

            <h2 style={{ fontSize: "16px", fontWeight: "bold", color: "#e5e7eb", marginBottom: "10px" }}>Executive Summary</h2>
            <p style={{ fontSize: "12px", color: "#9ca3af", lineHeight: "1.8" }}>{premiumData.executiveSummary}</p>
          </div>

          {/* PAGE 2: Category + Age Decay */}
          <div style={{ minHeight: "1100px", paddingBottom: "40px" }}>
            {premiumData.categoryInfluence && (
              <>
                <h2 style={{ fontSize: "16px", fontWeight: "bold", color: "#e5e7eb", marginBottom: "12px", paddingTop: "20px" }}>🎯 Category Viral Potential</h2>
                <p style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "12px", lineHeight: "1.6" }}>{premiumData.categoryInfluence.explanation}</p>
                
                <p style={{ fontSize: "11px", color: "#10b981", fontWeight: "600", marginBottom: "6px" }}>🔥 High Viral Categories</p>
                {premiumData.categoryInfluence.highViralCategories?.map((c: any, i: number) => (
                  <div key={i} style={{ padding: "8px 12px", borderRadius: "6px", background: "#0a1f0a", border: "1px solid #064e3b", marginBottom: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", fontWeight: "600", color: "#e5e7eb" }}>{c.category}</span>
                    <span style={{ fontSize: "10px", color: "#10b981" }}>{c.viralChance} • {c.examples}</span>
                  </div>
                ))}
                
                <p style={{ fontSize: "11px", color: "#ef4444", fontWeight: "600", marginBottom: "6px", marginTop: "12px" }}>📉 Lower Viral Categories</p>
                {premiumData.categoryInfluence.lowViralCategories?.map((c: any, i: number) => (
                  <div key={i} style={{ padding: "8px 12px", borderRadius: "6px", background: "#1f0a0a", border: "1px solid #7f1d1d", marginBottom: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", fontWeight: "600", color: "#e5e7eb" }}>{c.category}</span>
                    <span style={{ fontSize: "10px", color: "#ef4444" }}>{c.viralChance} • {c.examples}</span>
                  </div>
                ))}

                <div style={{ padding: "12px", borderRadius: "8px", background: "#0a0b14", border: "1px solid #e63976", marginTop: "12px" }}>
                  <p style={{ fontSize: "11px", color: "#e63976", lineHeight: "1.6" }}>📌 Your Reel: {premiumData.categoryInfluence.yourCategory}</p>
                </div>
              </>
            )}

            {/* Age Decay */}
            {premiumData.reelAgeFactor && (
              <>
                <h2 style={{ fontSize: "16px", fontWeight: "bold", color: "#e5e7eb", marginBottom: "12px", marginTop: "30px" }}>⏰ Viral Probability vs Reel Age</h2>
                <p style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "12px", lineHeight: "1.6" }}>{premiumData.reelAgeFactor.explanation}</p>
                
                {/* Visual bars */}
                {decayData.map((d: any, i: number) => {
                  const prob = parseInt(d.viralProbability) || 0;
                  const barColor = prob >= 80 ? "#10b981" : prob >= 40 ? "#f59e0b" : "#ef4444";
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                      <span style={{ fontSize: "10px", color: "#9ca3af", width: "70px", flexShrink: 0 }}>{d.period}</span>
                      <div style={{ flex: 1, height: "16px", borderRadius: "8px", background: "#1f2937", overflow: "hidden" }}>
                        <div style={{ width: `${prob}%`, height: "100%", borderRadius: "8px", background: barColor }} />
                      </div>
                      <span style={{ fontSize: "10px", fontWeight: "bold", color: barColor, width: "40px", textAlign: "right" }}>{d.viralProbability}</span>
                    </div>
                  );
                })}

                <div style={{ padding: "10px", borderRadius: "8px", background: "#111827", border: "1px solid #1f2937", marginTop: "12px" }}>
                  <p style={{ fontSize: "10px", color: "#6b7280", marginBottom: "4px" }}>⏰ Peak Window</p>
                  <p style={{ fontSize: "11px", color: "#9ca3af", lineHeight: "1.5" }}>{premiumData.reelAgeFactor.peakWindow}</p>
                </div>
              </>
            )}
          </div>

          {/* PAGE 3: Niche Table + Famous Elements */}
          <div style={{ minHeight: "1100px", paddingBottom: "40px" }}>
            {premiumData.nicheViralityTable && (
              <>
                <h2 style={{ fontSize: "16px", fontWeight: "bold", color: "#e5e7eb", marginBottom: "12px", paddingTop: "20px" }}>📊 Niche Virality Comparison</h2>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px", marginBottom: "24px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #1f2937" }}>
                      <th style={{ textAlign: "left", padding: "8px 6px", color: "#6b7280" }}>Niche</th>
                      <th style={{ textAlign: "center", padding: "8px 6px", color: "#6b7280" }}>Score</th>
                      <th style={{ textAlign: "left", padding: "8px 6px", color: "#6b7280" }}>Best Format</th>
                      <th style={{ textAlign: "left", padding: "8px 6px", color: "#6b7280" }}>Trend Example</th>
                    </tr>
                  </thead>
                  <tbody>
                    {premiumData.nicheViralityTable.niches?.map((n: any, i: number) => (
                      <tr key={i} style={{ borderBottom: "1px solid #111827" }}>
                        <td style={{ padding: "6px", color: "#e5e7eb", fontWeight: "500" }}>{n.niche}</td>
                        <td style={{ padding: "6px", textAlign: "center" }}>{n.viralFriendliness}</td>
                        <td style={{ padding: "6px", color: "#9ca3af" }}>{n.bestFormat}</td>
                        <td style={{ padding: "6px", color: "#9ca3af" }}>{n.trendExample}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {premiumData.famousElementsAnalysis && (
              <>
                <h2 style={{ fontSize: "16px", fontWeight: "bold", color: "#e5e7eb", marginBottom: "12px" }}>⭐ Famous Elements Impact</h2>
                <p style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "12px", lineHeight: "1.6" }}>{premiumData.famousElementsAnalysis.explanation}</p>
                
                {premiumData.famousElementsAnalysis.celebrityImpact && (
                  <div style={{ padding: "12px", borderRadius: "8px", background: "#111827", border: "1px solid #1f2937", marginBottom: "10px" }}>
                    <p style={{ fontSize: "12px", fontWeight: "600", color: "#e5e7eb", marginBottom: "6px" }}>👤 Celebrity Impact</p>
                    <p style={{ fontSize: "11px", color: "#9ca3af", lineHeight: "1.5" }}>{premiumData.famousElementsAnalysis.celebrityImpact.description}</p>
                    {premiumData.famousElementsAnalysis.celebrityImpact.examples?.map((e: string, i: number) => (
                      <p key={i} style={{ fontSize: "10px", color: "#6b7280", marginTop: "2px" }}>• {e}</p>
                    ))}
                  </div>
                )}
                
                {premiumData.famousElementsAnalysis.trendingIncidents && (
                  <div style={{ padding: "12px", borderRadius: "8px", background: "#111827", border: "1px solid #1f2937", marginBottom: "10px" }}>
                    <p style={{ fontSize: "12px", fontWeight: "600", color: "#e5e7eb", marginBottom: "6px" }}>📰 Trending Incidents</p>
                    <p style={{ fontSize: "11px", color: "#9ca3af", lineHeight: "1.5" }}>{premiumData.famousElementsAnalysis.trendingIncidents.description}</p>
                    <p style={{ fontSize: "10px", color: "#e5e7eb", fontWeight: "500", marginTop: "8px" }}>How to identify:</p>
                    {premiumData.famousElementsAnalysis.trendingIncidents.howToIdentify?.map((h: string, i: number) => (
                      <p key={i} style={{ fontSize: "10px", color: "#6b7280", marginTop: "2px" }}>✓ {h}</p>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* PAGE 4: Hook, Audio, Motion */}
          <div style={{ minHeight: "1100px", paddingBottom: "40px" }}>
            {premiumData.thumbnailHookAnalysis && (
              <>
                <h2 style={{ fontSize: "16px", fontWeight: "bold", color: "#e5e7eb", marginBottom: "12px", paddingTop: "20px" }}>👁️ First 3 Seconds & Thumbnail</h2>
                <p style={{ fontSize: "11px", color: "#9ca3af", lineHeight: "1.6", marginBottom: "12px" }}>{premiumData.thumbnailHookAnalysis.whyFirst3SecondsMatter}</p>
                
                <p style={{ fontSize: "11px", color: "#e5e7eb", fontWeight: "600", marginBottom: "6px" }}>Hook Types</p>
                {premiumData.thumbnailHookAnalysis.hookTypes?.map((h: any, i: number) => (
                  <div key={i} style={{ display: "flex", gap: "8px", padding: "8px", borderRadius: "6px", background: "#111827", marginBottom: "4px", alignItems: "center" }}>
                    <span style={{ fontSize: "10px", fontWeight: "bold", color: "#e63976", width: "100px", flexShrink: 0 }}>{h.type}</span>
                    <span style={{ fontSize: "10px", color: "#9ca3af", flex: 1 }}>"{h.example}"</span>
                    <span style={{ fontSize: "9px", color: "#10b981", flexShrink: 0 }}>{h.effectiveness}</span>
                  </div>
                ))}
                <div style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e63976", marginTop: "12px" }}>
                  <p style={{ fontSize: "11px", color: "#e63976", lineHeight: "1.5" }}>📌 {premiumData.thumbnailHookAnalysis.yourReel}</p>
                </div>
              </>
            )}

            {premiumData.audioVoiceAnalysis && (
              <>
                <h2 style={{ fontSize: "16px", fontWeight: "bold", color: "#e5e7eb", marginBottom: "12px", marginTop: "28px" }}>🎙️ Audio, Voice & Music</h2>
                <p style={{ fontSize: "11px", color: "#9ca3af", lineHeight: "1.6", marginBottom: "10px" }}>{premiumData.audioVoiceAnalysis.explanation}</p>
                
                {premiumData.audioVoiceAnalysis.voiceImpact?.voiceTrends && (
                  <div style={{ padding: "10px", borderRadius: "8px", background: "#111827", border: "1px solid #1f2937", marginBottom: "10px" }}>
                    <p style={{ fontSize: "11px", fontWeight: "600", color: "#e5e7eb", marginBottom: "4px" }}>Voice Trends</p>
                    {premiumData.audioVoiceAnalysis.voiceImpact.voiceTrends.map((t: string, i: number) => (
                      <p key={i} style={{ fontSize: "10px", color: "#9ca3af" }}>• {t}</p>
                    ))}
                  </div>
                )}
                
                {premiumData.audioVoiceAnalysis.musicImpact && (
                  <div style={{ padding: "10px", borderRadius: "8px", background: "#111827", border: "1px solid #1f2937" }}>
                    <p style={{ fontSize: "11px", fontWeight: "600", color: "#e5e7eb", marginBottom: "4px" }}>🎵 Finding Trending Audio</p>
                    <p style={{ fontSize: "10px", color: "#9ca3af", marginBottom: "6px" }}>{premiumData.audioVoiceAnalysis.musicImpact.trendingAudio}</p>
                    {premiumData.audioVoiceAnalysis.musicImpact.howToFind?.map((h: string, i: number) => (
                      <p key={i} style={{ fontSize: "10px", color: "#6b7280" }}>✓ {h}</p>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* PAGE 5: Hashtag, Caption, Video Quality */}
          <div style={{ minHeight: "1100px", paddingBottom: "40px" }}>
            {premiumData.hashtagCaptionStrategy && (
              <>
                <h2 style={{ fontSize: "16px", fontWeight: "bold", color: "#e5e7eb", marginBottom: "12px", paddingTop: "20px" }}># Hashtag & Caption Strategy</h2>
                {premiumData.hashtagCaptionStrategy.hashtagTips?.strategy?.map((s: any, i: number) => (
                  <div key={i} style={{ padding: "10px", borderRadius: "6px", background: "#111827", border: "1px solid #1f2937", marginBottom: "6px" }}>
                    <p style={{ fontSize: "11px", fontWeight: "600", color: "#e63976" }}>{s.type}</p>
                    <p style={{ fontSize: "10px", color: "#9ca3af" }}>{s.description}</p>
                    <p style={{ fontSize: "10px", color: "#6b7280", fontStyle: "italic" }}>{s.examples}</p>
                  </div>
                ))}
                {premiumData.hashtagCaptionStrategy.hashtagTips?.microCaseStudy && (
                  <div style={{ padding: "10px", borderRadius: "8px", background: "#1c1007", border: "1px solid #78350f", marginBottom: "16px" }}>
                    <p style={{ fontSize: "10px", color: "#f59e0b" }}>📌 Case Study: {premiumData.hashtagCaptionStrategy.hashtagTips.microCaseStudy}</p>
                  </div>
                )}
                {premiumData.hashtagCaptionStrategy.captionTips?.bestPractices && (
                  <>
                    <p style={{ fontSize: "12px", fontWeight: "600", color: "#e5e7eb", marginBottom: "6px" }}>✍️ Caption Best Practices</p>
                    {premiumData.hashtagCaptionStrategy.captionTips.bestPractices.map((b: string, i: number) => (
                      <p key={i} style={{ fontSize: "10px", color: "#9ca3af", marginBottom: "2px" }}>✓ {b}</p>
                    ))}
                  </>
                )}
              </>
            )}

            {premiumData.videoQualityGuide && (
              <>
                <h2 style={{ fontSize: "16px", fontWeight: "bold", color: "#e5e7eb", marginBottom: "12px", marginTop: "28px" }}>📹 Video Quality Guide</h2>
                {premiumData.videoQualityGuide.tips?.map((t: any, i: number) => (
                  <div key={i} style={{ padding: "10px", borderRadius: "6px", background: "#111827", border: "1px solid #1f2937", marginBottom: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "600", color: "#e5e7eb" }}>{t.area}</span>
                      <span style={{ fontSize: "9px", color: "#10b981", background: "#064e3b", padding: "2px 6px", borderRadius: "8px" }}>Quick: {t.quick}</span>
                    </div>
                    <p style={{ fontSize: "10px", color: "#9ca3af", lineHeight: "1.5" }}>{t.recommendation}</p>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* PAGE 6: Competitor + Calendar + Roadmap */}
          <div style={{ minHeight: "1100px", paddingBottom: "40px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "bold", color: "#e5e7eb", marginBottom: "12px", paddingTop: "20px" }}>📊 Competitor Comparison</h2>
            <p style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "12px" }}>{premiumData.competitorComparison?.summary}</p>
            {premiumData.competitorComparison?.topPerformers?.map((p: any, i: number) => (
              <div key={i} style={{ padding: "12px", borderRadius: "8px", background: "#111827", border: "1px solid #1f2937", marginBottom: "8px" }}>
                <p style={{ fontSize: "12px", fontWeight: "600", color: "#e5e7eb" }}>#{p.rank} {p.trait}</p>
                <p style={{ fontSize: "10px", color: "#9ca3af", marginTop: "2px" }}>Your Score: {p.yourScore}</p>
                <p style={{ fontSize: "10px", color: "#10b981", marginTop: "2px" }}>→ {p.recommendation}</p>
              </div>
            ))}

            <h2 style={{ fontSize: "16px", fontWeight: "bold", color: "#e5e7eb", marginBottom: "12px", marginTop: "28px" }}>📅 Content Calendar</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
              {premiumData.contentCalendar?.bestPostingTimes?.map((t: any, i: number) => (
                <div key={i} style={{ padding: "10px", borderRadius: "8px", background: "#111827", border: "1px solid #1f2937" }}>
                  <p style={{ fontSize: "12px", fontWeight: "600", color: "#e5e7eb" }}>{t.day}</p>
                  <p style={{ fontSize: "11px", color: "#e63976" }}>{t.time}</p>
                  <p style={{ fontSize: "9px", color: "#6b7280", marginTop: "2px" }}>{t.reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* PAGE 7: Roadmap + AI Recommendations */}
          <div style={{ minHeight: "1100px", paddingBottom: "40px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "bold", color: "#e5e7eb", marginBottom: "12px", paddingTop: "20px" }}>🎯 5-Step Improvement Roadmap</h2>
            {premiumData.improvementRoadmap?.steps?.map((s: any, i: number) => (
              <div key={i} style={{ padding: "14px", borderRadius: "8px", background: "#111827", border: "1px solid #1f2937", marginBottom: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: "linear-gradient(135deg, #e63976, #7c3aed)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold", color: "#fff" }}>{s.step}</span>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#e5e7eb" }}>{s.title}</span>
                  <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "10px", backgroundColor: s.impact === "high" ? "#064e3b" : "#78350f", color: s.impact === "high" ? "#10b981" : "#f59e0b", marginLeft: "auto" }}>{s.impact}</span>
                </div>
                <p style={{ fontSize: "11px", color: "#9ca3af", lineHeight: "1.5", marginLeft: "34px" }}>{s.description}</p>
              </div>
            ))}

            <h2 style={{ fontSize: "16px", fontWeight: "bold", color: "#e5e7eb", marginBottom: "12px", marginTop: "28px" }}>💡 AI Recommendations</h2>
            {premiumData.aiRecommendations?.hookAlternatives?.map((h: string, i: number) => (
              <p key={i} style={{ fontSize: "11px", color: "#9ca3af", padding: "8px 12px", background: "#111827", borderRadius: "6px", marginBottom: "4px", borderLeft: "3px solid #e63976" }}>{h}</p>
            ))}
            {premiumData.aiRecommendations?.captionRewrite && (
              <div style={{ marginTop: "12px" }}>
                <p style={{ fontSize: "11px", fontWeight: "600", color: "#e5e7eb", marginBottom: "4px" }}>✍️ Improved Caption</p>
                <p style={{ fontSize: "11px", color: "#9ca3af", padding: "10px", background: "#111827", borderRadius: "8px", fontStyle: "italic", lineHeight: "1.6" }}>{premiumData.aiRecommendations.captionRewrite}</p>
              </div>
            )}
            {premiumData.aiRecommendations?.hashtagStrategy?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "12px" }}>
                {premiumData.aiRecommendations.hashtagStrategy.map((h: string, i: number) => (
                  <span key={i} style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "12px", background: "#1a0a1e", border: "1px solid #e63976", color: "#e63976" }}>{h}</span>
                ))}
              </div>
            )}
          </div>

          {/* PAGE 8: Virality Factors + Checklist */}
          <div style={{ minHeight: "1100px", paddingBottom: "40px" }}>
            {premiumData.viralityInsights?.length > 0 && (
              <>
                <h2 style={{ fontSize: "16px", fontWeight: "bold", color: "#e5e7eb", marginBottom: "8px", paddingTop: "20px" }}>⚡ Virality Factors Deep Analysis</h2>
                <p style={{ fontSize: "10px", color: "#6b7280", marginBottom: "12px" }}>Each factor with reason + actionable solution</p>
                {premiumData.viralityInsights.map((insight: any, i: number) => (
                  <div key={i} style={{ padding: "10px", borderRadius: "8px", background: "#111827", border: `1px solid ${insight.impact === "positive" ? "#064e3b" : insight.impact === "negative" ? "#7f1d1d" : "#1f2937"}`, marginBottom: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "600", color: "#e5e7eb" }}>{insight.impact === "positive" ? "↑" : insight.impact === "negative" ? "↓" : "→"} {insight.factor}</span>
                      <span style={{ fontSize: "10px", fontWeight: "bold", padding: "2px 6px", borderRadius: "8px", backgroundColor: insight.score > 0 ? "#064e3b" : insight.score < 0 ? "#7f1d1d" : "#1f2937", color: insight.score > 0 ? "#10b981" : insight.score < 0 ? "#ef4444" : "#9ca3af" }}>{insight.score > 0 ? `+${insight.score}` : insight.score} pts</span>
                    </div>
                    <p style={{ fontSize: "10px", color: "#9ca3af", lineHeight: "1.5", marginBottom: "4px" }}>{insight.reason}</p>
                    <div style={{ padding: "6px 8px", borderRadius: "4px", background: "#0a0b14", borderLeft: "3px solid #e63976" }}>
                      <p style={{ fontSize: "10px", color: "#e63976", lineHeight: "1.4" }}>💡 {insight.solution}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* PAGE 9: Checklist + Common Mistakes + Quick Tips */}
          <div style={{ minHeight: "1100px", paddingBottom: "40px" }}>
            {premiumData.creatorChecklist?.length > 0 && (
              <>
                <h2 style={{ fontSize: "16px", fontWeight: "bold", color: "#e5e7eb", marginBottom: "12px", paddingTop: "20px" }}>✅ Creator Pre-Post Checklist</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "6px", marginBottom: "24px" }}>
                  {premiumData.creatorChecklist.map((item: any, i: number) => (
                    <div key={i} style={{ padding: "8px", borderRadius: "6px", background: "#111827", border: "1px solid #1f2937", display: "flex", alignItems: "flex-start", gap: "6px" }}>
                      <span style={{ color: "#10b981", fontSize: "10px" }}>☑</span>
                      <div>
                        <p style={{ fontSize: "10px", color: "#e5e7eb" }}>{item.item}</p>
                        <p style={{ fontSize: "9px", color: "#6b7280" }}>{item.category} • {item.priority}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {premiumData.commonMistakes?.length > 0 && (
              <>
                <h2 style={{ fontSize: "16px", fontWeight: "bold", color: "#e5e7eb", marginBottom: "12px" }}>❌ Common Mistakes to Avoid</h2>
                {premiumData.commonMistakes.map((m: any, i: number) => (
                  <div key={i} style={{ padding: "10px", borderRadius: "6px", background: "#1f0a0a", border: "1px solid #7f1d1d", marginBottom: "6px" }}>
                    <p style={{ fontSize: "11px", fontWeight: "600", color: "#ef4444" }}>❌ {m.mistake}</p>
                    <p style={{ fontSize: "10px", color: "#9ca3af", marginTop: "2px" }}>{m.why}</p>
                    <p style={{ fontSize: "10px", color: "#10b981", marginTop: "2px" }}>✅ Fix: {m.fix}</p>
                  </div>
                ))}
              </>
            )}

            {premiumData.quickTips && (
              <>
                <h2 style={{ fontSize: "16px", fontWeight: "bold", color: "#e5e7eb", marginBottom: "12px", marginTop: "24px" }}>💡 Quick Tips</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                  {Object.entries(premiumData.quickTips).map(([key, tips]: [string, any]) => (
                    <div key={key} style={{ padding: "10px", borderRadius: "8px", background: "#111827", border: "1px solid #1f2937" }}>
                      <p style={{ fontSize: "10px", fontWeight: "bold", color: "#e63976", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>{key}</p>
                      {(tips as string[])?.map((t: string, i: number) => (
                        <p key={i} style={{ fontSize: "9px", color: "#9ca3af", marginBottom: "2px" }}>• {t}</p>
                      ))}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Footer */}
            <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid #1f2937", textAlign: "center" }}>
              <p style={{ fontSize: "11px", color: "#6b7280" }}>Generated by Viral Reel Analyzer • {new Date().toLocaleDateString("en-IN")}</p>
              <p style={{ fontSize: "10px", color: "#4b5563", marginTop: "4px" }}>This report is for educational and informational purposes only.</p>
              <p style={{ fontSize: "10px", color: "#4b5563", marginTop: "2px" }}>Scores are capped at 80/80 — no content is 100% guaranteed to go viral.</p>
              <p style={{ fontSize: "9px", color: "#374151", marginTop: "4px" }}>© {new Date().getFullYear()} Viral Reel Analyzer. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MasterReportPDF;
