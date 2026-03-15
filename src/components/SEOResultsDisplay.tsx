import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BannerAd } from "./AdSlots";
import FeedbackRating from "./FeedbackRating";
import {
  Type, FileText, Tag, Hash, Music, Clock, TrendingUp,
  ExternalLink, Eye, Zap, Copy, CheckCircle2, Lightbulb, MessageSquare,
  BarChart3, Target, Users, Search, Youtube,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLang } from "@/lib/LangContext";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

interface TopReel {
  title: string;
  creator: string;
  estimated_views: string;
  engagement: string;
  category: string;
  why_viral: string;
  search_url: string;
}

interface YouTubeShort {
  title: string;
  channel: string;
  estimated_views: string;
  engagement: string;
  category: string;
  why_trending: string;
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
  top_youtube_shorts?: YouTubeShort[];
  content_tips?: string[];
  hook_suggestions?: string[];
  keyword_analysis?: {
    primary_keywords: string[];
    secondary_keywords: string[];
    long_tail_keywords: string[];
    trending_keywords: string[];
  };
  competitor_analysis?: {
    top_creators: { name: string; followers: string; avg_views: string; strength: string; content_style: string }[];
    content_gaps: string[];
    winning_formats: string[];
  };
  score_breakdown?: {
    title_seo_score: number;
    caption_seo_score: number;
    hashtag_effectiveness: number;
    trend_alignment: number;
    content_potential: number;
    overall_seo_score: number;
  };
  platform_distribution?: {
    instagram_reels: number;
    youtube_shorts: number;
    tiktok: number;
  };
  engagement_prediction?: {
    estimated_reach: string;
    estimated_likes: string;
    estimated_comments: string;
    estimated_shares: string;
    confidence: string;
  };
  description_seo?: string;
}

interface SEOResultsDisplayProps {
  data: SEOData;
  topic: string;
}

const CHART_COLORS = [
  "hsl(340, 82%, 55%)", // primary
  "hsl(260, 60%, 55%)", // secondary
  "hsl(30, 90%, 55%)",  // accent
  "hsl(180, 60%, 45%)", // teal
  "hsl(120, 50%, 45%)", // green
  "hsl(45, 90%, 50%)",  // gold
];

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

  // Score breakdown chart data
  const scoreData = data.score_breakdown ? [
    { name: "Title SEO", score: data.score_breakdown.title_seo_score },
    { name: "Caption SEO", score: data.score_breakdown.caption_seo_score },
    { name: "Hashtags", score: data.score_breakdown.hashtag_effectiveness },
    { name: "Trend", score: data.score_breakdown.trend_alignment },
    { name: "Content", score: data.score_breakdown.content_potential },
  ] : [];

  // Platform distribution pie chart data
  const platformData = data.platform_distribution ? [
    { name: "Instagram Reels", value: data.platform_distribution.instagram_reels },
    { name: "YouTube Shorts", value: data.platform_distribution.youtube_shorts },
    { name: "TikTok", value: data.platform_distribution.tiktok },
  ] : [];

  // Radar chart data
  const radarData = data.score_breakdown ? [
    { subject: "Title", A: data.score_breakdown.title_seo_score },
    { subject: "Caption", A: data.score_breakdown.caption_seo_score },
    { subject: "Hashtags", A: data.score_breakdown.hashtag_effectiveness },
    { subject: "Trend", A: data.score_breakdown.trend_alignment },
    { subject: "Content", A: data.score_breakdown.content_potential },
  ] : [];

  return (
    <div className="space-y-4">
      {/* Overall SEO Score */}
      {data.score_breakdown && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.02 }}>
          <Card className="glass p-5 text-center space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center justify-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              {lang === "hi" ? "ओवरऑल SEO स्कोर" : "Overall SEO Score"}
            </h3>
            <div className="text-5xl font-bold text-primary">{data.score_breakdown.overall_seo_score}<span className="text-lg text-muted-foreground">/100</span></div>
            <p className="text-xs text-muted-foreground">
              {data.score_breakdown.overall_seo_score >= 80 ? "🔥 Excellent SEO optimization!" :
               data.score_breakdown.overall_seo_score >= 60 ? "✅ Good SEO potential" :
               "⚡ Room for improvement"}
            </p>
          </Card>
        </motion.div>
      )}

      {/* Score Breakdown Charts */}
      {data.score_breakdown && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Bar Chart */}
          <SectionCard icon={BarChart3} title={lang === "hi" ? "स्कोर ब्रेकडाउन" : "Score Breakdown"} delay={0.05}>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }} barSize={14}>
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                  <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                    {scoreData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          {/* Radar Chart */}
          <SectionCard icon={Target} title={lang === "hi" ? "SEO रडार" : "SEO Radar"} delay={0.1}>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
                  <Radar name="Score" dataKey="A" stroke="hsl(340, 82%, 55%)" fill="hsl(340, 82%, 55%)" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>
      )}

      {/* Platform Distribution Pie Chart */}
      {data.platform_distribution && (
        <SectionCard icon={TrendingUp} title={lang === "hi" ? "प्लेटफ़ॉर्म डिस्ट्रिब्यूशन" : "Platform Distribution"} delay={0.12}>
          <div className="flex items-center gap-4">
            <div className="w-32 h-32 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={platformData} cx="50%" cy="50%" innerRadius={25} outerRadius={55} dataKey="value" paddingAngle={3}>
                    {platformData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {platformData.map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-sm" style={{ background: CHART_COLORS[i] }} />
                  <span className="text-foreground font-medium">{p.name}</span>
                  <span className="text-muted-foreground">{p.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      )}

      {/* Engagement Prediction */}
      {data.engagement_prediction && (
        <SectionCard icon={Eye} title={lang === "hi" ? "एंगेजमेंट प्रेडिक्शन" : "Engagement Prediction"} delay={0.14}>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Reach", value: data.engagement_prediction.estimated_reach, icon: "👁️" },
              { label: "Likes", value: data.engagement_prediction.estimated_likes, icon: "❤️" },
              { label: "Comments", value: data.engagement_prediction.estimated_comments, icon: "💬" },
              { label: "Shares", value: data.engagement_prediction.estimated_shares, icon: "📤" },
            ].map((item, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/50 text-center">
                <div className="text-lg">{item.icon}</div>
                <div className="text-xs font-bold text-foreground">{item.value}</div>
                <div className="text-[10px] text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
            Confidence: <span className="font-medium text-foreground">{data.engagement_prediction.confidence}</span>
          </p>
        </SectionCard>
      )}

      {/* Optimized Title */}
      <SectionCard icon={Type} title={lang === "hi" ? "ऑप्टिमाइज़्ड रील टाइटल" : "Optimized Reel Title"} delay={0.15}>
        <div className="flex items-start justify-between gap-2">
          <p className="text-foreground font-medium text-base leading-relaxed">{data.title}</p>
          <CopyButton text={data.title} label="Title" />
        </div>
      </SectionCard>

      {/* Caption */}
      <SectionCard icon={FileText} title={lang === "hi" ? "SEO कैप्शन / डिस्क्रिप्शन" : "SEO Caption / Description"} delay={0.18}>
        <div className="flex items-start justify-between gap-2">
          <p className="text-foreground/90 text-sm leading-relaxed whitespace-pre-wrap">{data.caption}</p>
          <CopyButton text={data.caption} label="Caption" />
        </div>
      </SectionCard>

      {/* Tags */}
      <SectionCard icon={Tag} title={lang === "hi" ? "हाई-परफॉर्मिंग टैग्स" : "High-Performing Tags"} delay={0.2}>
        <div className="flex flex-wrap gap-2">
          {data.tags?.map((tag, i) => (
            <Badge key={i} variant="secondary" className="text-xs bg-muted/50 border-border">{tag}</Badge>
          ))}
        </div>
        <CopyButton text={data.tags?.join(", ") || ""} label="Tags" />
      </SectionCard>

      <BannerAd slot="seo-results-mid" />

      {/* Hashtags */}
      <SectionCard icon={Hash} title={lang === "hi" ? "हैशटैग्स (कैटेगरी वाइज़)" : "Hashtags (Categorized)"} delay={0.22}>
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

      {/* Keyword Analysis */}
      {data.keyword_analysis && (
        <SectionCard icon={Search} title={lang === "hi" ? "कीवर्ड एनालिसिस" : "Keyword Analysis"} delay={0.24}>
          <div className="space-y-3">
            {data.keyword_analysis.primary_keywords?.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1 font-medium">🎯 Primary Keywords</p>
                <div className="flex flex-wrap gap-1.5">
                  {data.keyword_analysis.primary_keywords.map((k, i) => (
                    <Badge key={i} className="text-xs gradient-primary-bg text-primary-foreground">{k}</Badge>
                  ))}
                </div>
              </div>
            )}
            {data.keyword_analysis.trending_keywords?.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1 font-medium">🔥 Trending Keywords</p>
                <div className="flex flex-wrap gap-1.5">
                  {data.keyword_analysis.trending_keywords.map((k, i) => (
                    <Badge key={i} variant="secondary" className="text-xs bg-accent/20 text-accent">{k}</Badge>
                  ))}
                </div>
              </div>
            )}
            {data.keyword_analysis.long_tail_keywords?.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1 font-medium">📝 Long-tail Keywords</p>
                <div className="flex flex-wrap gap-1.5">
                  {data.keyword_analysis.long_tail_keywords.map((k, i) => (
                    <Badge key={i} variant="outline" className="text-xs border-border">{k}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SectionCard>
      )}

      {/* Music + Posting Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SectionCard icon={Music} title={lang === "hi" ? "सुझावित म्यूज़िक" : "Suggested Music"} delay={0.26}>
          <p className="text-foreground/90 text-sm">{data.music_type}</p>
        </SectionCard>
        <SectionCard icon={Clock} title={lang === "hi" ? "बेस्ट पोस्टिंग टाइम" : "Best Posting Time"} delay={0.28}>
          <p className="text-foreground font-medium text-sm">{data.best_posting_time}</p>
          {data.posting_rationale && (
            <p className="text-xs text-muted-foreground mt-1">{data.posting_rationale}</p>
          )}
        </SectionCard>
      </div>

      {/* Content Tips */}
      {data.content_tips && data.content_tips.length > 0 && (
        <SectionCard icon={Lightbulb} title={lang === "hi" ? "कंटेंट टिप्स" : "Content Tips"} delay={0.3}>
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
      {data.hook_suggestions && data.hook_suggestions.length > 0 && (
        <SectionCard icon={MessageSquare} title={lang === "hi" ? "हुक सुझाव" : "Hook Suggestions"} delay={0.32}>
          <ul className="space-y-2">
            {data.hook_suggestions.map((hook, i) => (
              <li key={i} className="text-sm text-foreground/90 flex items-start gap-2">
                <span className="text-accent text-xs mt-0.5">{i + 1}.</span> {hook}
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      {/* Competitor Analysis */}
      {data.competitor_analysis && (
        <SectionCard icon={Users} title={lang === "hi" ? "कॉम्पिटिटर एनालिसिस" : "Competitor Analysis"} delay={0.34}>
          {data.competitor_analysis.top_creators?.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">👤 Top Creators</p>
              {data.competitor_analysis.top_creators.map((creator, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{creator.name}</span>
                    <span className="text-[10px] text-muted-foreground">{creator.followers} followers</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px]">Avg: {creator.avg_views}</Badge>
                    <Badge variant="secondary" className="text-[10px]">{creator.content_style}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">💪 {creator.strength}</p>
                </div>
              ))}
            </div>
          )}
          {data.competitor_analysis.content_gaps?.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground font-medium mt-2">🎯 Content Gaps (Opportunities)</p>
              <ul className="space-y-1 mt-1">
                {data.competitor_analysis.content_gaps.map((gap, i) => (
                  <li key={i} className="text-xs text-foreground/90">• {gap}</li>
                ))}
              </ul>
            </div>
          )}
          {data.competitor_analysis.winning_formats?.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground font-medium mt-2">🏆 Winning Formats</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {data.competitor_analysis.winning_formats.map((f, i) => (
                  <Badge key={i} variant="outline" className="text-[10px] border-primary/30 text-primary">{f}</Badge>
                ))}
              </div>
            </div>
          )}
        </SectionCard>
      )}

      <BannerAd slot="seo-results-bottom" />

      {/* Top 10 Viral Reels */}
      {data.top_reels?.length > 0 && (
        <SectionCard icon={TrendingUp} title={lang === "hi" ? "टॉप 10 वायरल रील्स (इस टॉपिक पर)" : "Top 10 Viral Reels (Related)"} delay={0.36}>
          <div className="space-y-3">
            {data.top_reels.map((reel, i) => (
              <motion.div
                key={i}
                className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      <span className="text-primary mr-1">#{i + 1}</span> {reel.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{reel.creator}</p>
                  </div>
                  <a href={reel.search_url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                      <ExternalLink className="w-3 h-3 mr-1" /> View
                    </Button>
                  </a>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-[10px] border-border">
                    <Eye className="w-3 h-3 mr-1" /> {reel.estimated_views}
                  </Badge>
                  <Badge variant="outline" className={`text-[10px] ${reel.engagement === "high" ? "border-primary/40 text-primary" : reel.engagement === "medium" ? "border-accent/40 text-accent" : "border-border"}`}>
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

      {/* Top YouTube Shorts */}
      {data.top_youtube_shorts && data.top_youtube_shorts.length > 0 && (
        <SectionCard icon={Youtube} title={lang === "hi" ? "टॉप ट्रेंडिंग YouTube Shorts" : "Top Trending YouTube Shorts"} delay={0.4}>
          <div className="space-y-3">
            {data.top_youtube_shorts.map((short, i) => (
              <motion.div
                key={i}
                className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.05 }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      <span className="text-accent mr-1">#{i + 1}</span> {short.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{short.channel}</p>
                  </div>
                  <a href={short.search_url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                      <ExternalLink className="w-3 h-3 mr-1" /> View
                    </Button>
                  </a>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-[10px] border-border">
                    <Eye className="w-3 h-3 mr-1" /> {short.estimated_views}
                  </Badge>
                  <Badge variant="outline" className={`text-[10px] ${short.engagement === "high" ? "border-accent/40 text-accent" : "border-border"}`}>
                    <Zap className="w-3 h-3 mr-1" /> {short.engagement}
                  </Badge>
                </div>
                {short.why_trending && (
                  <p className="text-xs text-muted-foreground italic">🔥 {short.why_trending}</p>
                )}
              </motion.div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* SEO Description */}
      {data.description_seo && (
        <SectionCard icon={FileText} title={lang === "hi" ? "SEO डिस्क्रिप्शन (बायो/प्रोफ़ाइल)" : "SEO Description (Bio/Profile)"} delay={0.45}>
          <div className="flex items-start justify-between gap-2">
            <p className="text-foreground/90 text-sm leading-relaxed">{data.description_seo}</p>
            <CopyButton text={data.description_seo} label="Description" />
          </div>
        </SectionCard>
      )}

      {/* Feedback */}
      <FeedbackRating reelUrl={`seo:${topic}`} />
    </div>
  );
};

export default SEOResultsDisplay;
