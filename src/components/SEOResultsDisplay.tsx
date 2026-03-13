import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BannerAd } from "./AdSlots";
import FeedbackRating from "./FeedbackRating";
import {
  Type, FileText, Tag, Hash, Music, Clock, TrendingUp,
  ExternalLink, Eye, Zap, Copy, CheckCircle2, Lightbulb, MessageSquare,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLang } from "@/lib/LangContext";

interface TopReel {
  title: string;
  creator: string;
  estimated_views: string;
  engagement: string;
  category: string;
  why_viral: string;
  search_url: string;
}

interface SEOData {
  title: string;
  caption: string;
  tags: string[];
  hashtags: {
    high_volume: string[];
    medium_volume: string[];
    niche: string[];
  };
  music_type: string;
  best_posting_time: string;
  posting_rationale?: string;
  top_reels: TopReel[];
  content_tips?: string[];
  hook_suggestions?: string[];
}

interface SEOResultsDisplayProps {
  data: SEOData;
  topic: string;
}

const CopyButton = ({ text, label }: { text: string; label: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="text-muted-foreground hover:text-primary transition-colors">
      {copied ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
    </button>
  );
};

const SectionCard = ({ icon: Icon, title, children, delay = 0 }: {
  icon: any; title: string; children: React.ReactNode; delay?: number;
}) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
    <Card className="glass p-4 sm:p-5 space-y-3">
      <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" /> {title}
      </h3>
      {children}
    </Card>
  </motion.div>
);

const SEOResultsDisplay = ({ data, topic }: SEOResultsDisplayProps) => {
  const { lang } = useLang();
  const allHashtags = [
    ...(data.hashtags?.high_volume || []),
    ...(data.hashtags?.medium_volume || []),
    ...(data.hashtags?.niche || []),
  ].join(" ");

  return (
    <div className="space-y-4">
      {/* Optimized Title */}
      <SectionCard icon={Type} title={lang === "hi" ? "ऑप्टिमाइज़्ड रील टाइटल" : "Optimized Reel Title"} delay={0.05}>
        <div className="flex items-start justify-between gap-2">
          <p className="text-foreground font-medium text-base leading-relaxed">{data.title}</p>
          <CopyButton text={data.title} label="Title" />
        </div>
      </SectionCard>

      {/* Caption */}
      <SectionCard icon={FileText} title={lang === "hi" ? "SEO कैप्शन / डिस्क्रिप्शन" : "SEO Caption / Description"} delay={0.1}>
        <div className="flex items-start justify-between gap-2">
          <p className="text-foreground/90 text-sm leading-relaxed whitespace-pre-wrap">{data.caption}</p>
          <CopyButton text={data.caption} label="Caption" />
        </div>
      </SectionCard>

      {/* Tags */}
      <SectionCard icon={Tag} title={lang === "hi" ? "हाई-परफॉर्मिंग टैग्स" : "High-Performing Tags"} delay={0.15}>
        <div className="flex flex-wrap gap-2">
          {data.tags?.map((tag, i) => (
            <Badge key={i} variant="secondary" className="text-xs bg-muted/50 border-border">{tag}</Badge>
          ))}
        </div>
        <CopyButton text={data.tags?.join(", ") || ""} label="Tags" />
      </SectionCard>

      <BannerAd slot="seo-results-mid" />

      {/* Hashtags */}
      <SectionCard icon={Hash} title={lang === "hi" ? "हैशटैग्स (कैटेगरी वाइज़)" : "Hashtags (Categorized)"} delay={0.2}>
        {data.hashtags?.high_volume?.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1.5 font-medium">🔥 High Volume</p>
            <div className="flex flex-wrap gap-1.5">
              {data.hashtags.high_volume.map((h, i) => (
                <Badge key={i} className="text-xs gradient-primary-bg text-primary-foreground">{h}</Badge>
              ))}
            </div>
          </div>
        )}
        {data.hashtags?.medium_volume?.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1.5 font-medium">📊 Medium Volume</p>
            <div className="flex flex-wrap gap-1.5">
              {data.hashtags.medium_volume.map((h, i) => (
                <Badge key={i} variant="secondary" className="text-xs bg-secondary/20 text-secondary-foreground">{h}</Badge>
              ))}
            </div>
          </div>
        )}
        {data.hashtags?.niche?.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1.5 font-medium">🎯 Niche</p>
            <div className="flex flex-wrap gap-1.5">
              {data.hashtags.niche.map((h, i) => (
                <Badge key={i} variant="outline" className="text-xs border-accent/30 text-accent">{h}</Badge>
              ))}
            </div>
          </div>
        )}
        <div className="pt-1">
          <CopyButton text={allHashtags} label="All Hashtags" />
        </div>
      </SectionCard>

      {/* Music + Posting Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SectionCard icon={Music} title={lang === "hi" ? "सुझावित म्यूज़िक" : "Suggested Music"} delay={0.25}>
          <p className="text-foreground/90 text-sm">{data.music_type}</p>
        </SectionCard>
        <SectionCard icon={Clock} title={lang === "hi" ? "बेस्ट पोस्टिंग टाइम" : "Best Posting Time"} delay={0.3}>
          <p className="text-foreground font-medium text-sm">{data.best_posting_time}</p>
          {data.posting_rationale && (
            <p className="text-xs text-muted-foreground mt-1">{data.posting_rationale}</p>
          )}
        </SectionCard>
      </div>

      {/* Content Tips */}
      {data.content_tips?.length > 0 && (
        <SectionCard icon={Lightbulb} title={lang === "hi" ? "कंटेंट टिप्स" : "Content Tips"} delay={0.35}>
          <ul className="space-y-2">
            {data.content_tips.map((tip, i) => (
              <li key={i} className="text-sm text-foreground/90 flex items-start gap-2">
                <span className="text-primary text-xs mt-0.5">•</span> {tip}
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      {/* Hook Suggestions */}
      {data.hook_suggestions?.length > 0 && (
        <SectionCard icon={MessageSquare} title={lang === "hi" ? "हुक सुझाव" : "Hook Suggestions"} delay={0.4}>
          <ul className="space-y-2">
            {data.hook_suggestions.map((hook, i) => (
              <li key={i} className="text-sm text-foreground/90 flex items-start gap-2">
                <span className="text-accent text-xs mt-0.5">{i + 1}.</span> {hook}
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      <BannerAd slot="seo-results-bottom" />

      {/* Top 10 Viral Reels */}
      {data.top_reels?.length > 0 && (
        <SectionCard icon={TrendingUp} title={lang === "hi" ? "टॉप 10 वायरल रील्स (इस टॉपिक पर)" : "Top 10 Viral Reels (Related)"} delay={0.45}>
          <div className="space-y-3">
            {data.top_reels.map((reel, i) => (
              <motion.div
                key={i}
                className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      <span className="text-primary mr-1">#{i + 1}</span> {reel.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{reel.creator}</p>
                  </div>
                  <a
                    href={reel.search_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0"
                  >
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                      <ExternalLink className="w-3 h-3 mr-1" /> View
                    </Button>
                  </a>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-[10px] border-border">
                    <Eye className="w-3 h-3 mr-1" /> {reel.estimated_views}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      reel.engagement === "high" ? "border-primary/40 text-primary" :
                      reel.engagement === "medium" ? "border-accent/40 text-accent" :
                      "border-border"
                    }`}
                  >
                    <Zap className="w-3 h-3 mr-1" /> {reel.engagement}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] bg-muted/50">{reel.category}</Badge>
                </div>
                {reel.why_viral && (
                  <p className="text-xs text-muted-foreground italic">💡 {reel.why_viral}</p>
                )}
              </motion.div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Feedback */}
      <FeedbackRating reelUrl={`seo:${topic}`} />
    </div>
  );
};

export default SEOResultsDisplay;
