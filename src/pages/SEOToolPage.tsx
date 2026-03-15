import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SEOHead from "@/components/SEOHead";
import InternalLinks from "@/components/InternalLinks";
import MobileBottomNav from "@/components/MobileBottomNav";
import UserReviews from "@/components/UserReviews";
import { TrendingUp, Sparkles, Hash, FileText, Target, BarChart3, Search, Zap } from "lucide-react";

interface ToolPageConfig {
  slug: string;
  title: string;
  metaTitle: string;
  metaDesc: string;
  keywords: string;
  h1: string;
  subtitle: string;
  ctaText: string;
  ctaRoute: string;
  icon: typeof TrendingUp;
  features: { icon: typeof TrendingUp; title: string; desc: string }[];
  howItWorks: { step: string; desc: string }[];
  contentBlocks: { heading: string; text: string }[];
}

const PAGES: Record<string, ToolPageConfig> = {
  "reel-analyzer": {
    slug: "/reel-analyzer",
    title: "Reel Analyzer",
    metaTitle: "Reel Analyzer – Free Instagram Reel Analysis Tool",
    metaDesc: "Analyze your Instagram reel performance with our free reel analyzer. Get viral score prediction, hook analysis, caption tips, and engagement insights instantly.",
    keywords: "reel analyzer, reel analyzer tool, reel analytics tool, reel performance analyzer, analyze instagram reel",
    h1: "Free Reel Analyzer Tool",
    subtitle: "Paste your Instagram reel URL and get instant analysis with viral score prediction, hook strength detection, and engagement optimization tips.",
    ctaText: "Analyze Your Reel Now",
    ctaRoute: "/",
    icon: TrendingUp,
    features: [
      { icon: Target, title: "Viral Score Prediction", desc: "Predicts your reel's viral potential with a 0-100 score based on engagement patterns and content quality signals." },
      { icon: Zap, title: "Hook Strength Analysis", desc: "Detects whether your first 3 seconds are strong enough to stop the scroll and retain viewers." },
      { icon: Hash, title: "Hashtag Performance Check", desc: "Analyzes your hashtag strategy — competition level, relevance, and optimal count for maximum reach." },
      { icon: BarChart3, title: "Engagement Rate Calculator", desc: "Compares your likes, comments, shares, and saves against category benchmarks to gauge performance." },
    ],
    howItWorks: [
      { step: "Paste Reel URL", desc: "Copy your Instagram reel link and paste it into the analyzer input field." },
      { step: "Smart Analysis Runs", desc: "Our system extracts reel data, analyzes hook, caption, hashtags, and engagement signals." },
      { step: "Get Your Report", desc: "Receive a detailed breakdown with viral score, weak spots, and actionable recommendations." },
    ],
    contentBlocks: [
      { heading: "Why Use a Reel Analyzer?", text: "Instagram's algorithm prioritizes reels with strong hooks, optimized captions, and trending content formats. Without data-driven analysis, creators often post reels blindly — hoping for views without understanding what actually drives engagement. A reel analyzer gives you clarity on what's working and what's not, so every reel you post has a better chance of reaching more people." },
      { heading: "How Reel Analysis Improves Your Growth", text: "Creators who analyze their reels before posting consistently see 2-3x better engagement rates. By identifying weak hooks, poor hashtag choices, and missing emotional triggers in your caption, you can make targeted improvements that compound over time. The best part? Our reel analyzer tool is completely free — no login, no account required." },
    ],
  },
  "instagram-reel-analyzer": {
    slug: "/instagram-reel-analyzer",
    title: "Instagram Reel Analyzer",
    metaTitle: "Instagram Reel Analyzer – Check Reel Performance & Viral Potential",
    metaDesc: "Free Instagram reel analyzer tool. Check your reel's viral potential, analyze engagement metrics, get hook score, caption tips & hashtag optimization. No login required.",
    keywords: "instagram reel analyzer, instagram reel checker, instagram reel analysis, reel performance checker, check reel engagement",
    h1: "Instagram Reel Analyzer — Check Your Reel's Viral Potential",
    subtitle: "The most comprehensive free Instagram reel analysis tool. Get smart insights on hook strength, caption quality, hashtag strategy, and viral probability.",
    ctaText: "Check Your Instagram Reel",
    ctaRoute: "/",
    icon: Search,
    features: [
      { icon: Search, title: "Deep Reel Analysis", desc: "Comprehensive analysis covering content classification, hook quality, caption sentiment, and engagement metrics." },
      { icon: TrendingUp, title: "Trend Matching", desc: "Detects if your reel format matches currently trending content patterns for higher discoverability." },
      { icon: Sparkles, title: "Smart Insights", desc: "Advanced models analyze visual elements, text overlays, music usage, and scene transitions." },
      { icon: FileText, title: "Detailed PDF Report", desc: "Get a master report with competitor analysis, improvement roadmap, and premium insights." },
    ],
    howItWorks: [
      { step: "Copy Reel Link", desc: "Go to Instagram, open your reel, tap Share, and copy the link." },
      { step: "Paste & Analyze", desc: "Paste the link into our analyzer. Optionally add caption, hashtags, and engagement data for better accuracy." },
      { step: "Review Results", desc: "Get viral score, hook analysis, caption tips, hashtag optimization, and growth recommendations." },
    ],
    contentBlocks: [
      { heading: "What Does an Instagram Reel Analyzer Do?", text: "An Instagram reel analyzer examines every element of your reel — from the opening hook to the caption, hashtags, and engagement metrics. It predicts viral potential by comparing your content against patterns of high-performing reels in your niche. Think of it as a pre-posting quality check that tells you exactly what to fix before hitting publish." },
      { heading: "Instagram Reel SEO and Discoverability", text: "Instagram uses signals like watch time, caption keywords, and hashtag relevance to decide which reels to push to the Explore page and Reels tab. By optimizing these elements based on data — not guesswork — you significantly increase your chances of getting organic reach. Our analyzer identifies exactly which SEO signals your reel is missing." },
    ],
  },
  "reel-seo-optimizer": {
    slug: "/reel-seo-optimizer",
    title: "Reel SEO Optimizer",
    metaTitle: "Reel SEO Optimizer – Optimize Instagram Reel for Search & Discovery",
    metaDesc: "Free reel SEO optimization tool. Generate SEO-optimized titles, captions, and hashtags for Instagram reels. Improve discoverability and get more views.",
    keywords: "reel seo optimization tool, reel seo analyzer, instagram reel seo optimization, reel title generator, reel caption generator",
    h1: "Reel SEO Optimization Tool",
    subtitle: "Generate SEO-optimized titles, captions, and hashtags that help Instagram's algorithm push your reels to more people. Free smart reel SEO tool.",
    ctaText: "Optimize Your Reel SEO",
    ctaRoute: "/seo-optimizer",
    icon: Search,
    features: [
      { icon: FileText, title: "SEO Title Generation", desc: "Generate keyword-rich titles that Instagram's search algorithm indexes for discoverability." },
      { icon: Sparkles, title: "Caption Optimization", desc: "Rewrites your caption with emotional hooks, keywords, and CTAs that drive engagement." },
      { icon: Hash, title: "Smart Hashtag Strategy", desc: "Get a mix of trending, mid-range, and niche hashtags optimized for your content category." },
      { icon: TrendingUp, title: "Trend-Based Keywords", desc: "Identifies trending keywords and phrases in your niche to boost search visibility." },
    ],
    howItWorks: [
      { step: "Enter Reel Details", desc: "Provide your reel topic, niche, and existing caption for optimization." },
      { step: "Smart Optimization", desc: "Our system generates SEO-optimized titles, captions, hashtags, and keyword suggestions." },
      { step: "Apply & Post", desc: "Copy the optimized content and apply it to your reel before posting." },
    ],
    contentBlocks: [
      { heading: "Why Reel SEO Matters", text: "Instagram has become a search engine. Users search for topics, trends, and niches directly on Instagram. If your reel caption, title, and hashtags aren't optimized for these searches, your content won't appear in results — no matter how good it is. Reel SEO optimization ensures your content is discoverable by the right audience." },
      { heading: "How Instagram Reel SEO Works", text: "Instagram indexes reel captions, on-screen text, hashtags, and audio descriptions to understand what your content is about. The algorithm then matches reels to user searches and interests. By using the right keywords naturally in your caption and hashtags, you tell Instagram exactly who should see your reel — leading to higher organic reach." },
    ],
  },
  "reel-hashtag-generator": {
    slug: "/reel-hashtag-generator",
    title: "Reel Hashtag Generator",
    metaTitle: "Reel Hashtag Generator – Best Hashtags for Instagram Reels 2025",
    metaDesc: "Generate the best hashtags for your Instagram reels. AI-powered hashtag generator finds trending, niche-specific tags to maximize reach and engagement. Free tool.",
    keywords: "reel hashtag generator, best hashtags for instagram reels, instagram reel hashtags, trending hashtags for reels, hashtag generator",
    h1: "Free Reel Hashtag Generator",
    subtitle: "Generate the perfect hashtag mix for your Instagram reels. Smart analysis finds trending, mid-range, and niche-specific hashtags that maximize your reach.",
    ctaText: "Generate Hashtags Now",
    ctaRoute: "/",
    icon: Hash,
    features: [
      { icon: Hash, title: "Trending Hashtag Detection", desc: "Identifies currently trending hashtags in your content category for maximum visibility." },
      { icon: Target, title: "Competition Analysis", desc: "Categorizes hashtags by competition level — helps you pick tags you can actually rank for." },
      { icon: BarChart3, title: "Optimal Count", desc: "Recommends the ideal number of hashtags (8-12) based on your niche and content type." },
      { icon: Zap, title: "Niche-Specific Tags", desc: "Generates highly relevant hashtags specific to your content subcategory." },
    ],
    howItWorks: [
      { step: "Describe Your Reel", desc: "Enter your reel topic, niche, or paste your caption." },
      { step: "Smart Hashtag Generation", desc: "Our system researches trending tags, analyzes competition, and generates optimized sets." },
      { step: "Copy & Use", desc: "Copy the hashtag set and paste it into your Instagram reel caption or first comment." },
    ],
    contentBlocks: [
      { heading: "How Hashtags Affect Instagram Reel Reach", text: "Hashtags are one of the primary signals Instagram uses to categorize and distribute your reels. Using the right hashtags puts your content in front of users who are actively browsing those topics. But using too many, too competitive, or irrelevant hashtags can actually hurt your reach. The key is a balanced mix of trending, mid-range, and niche-specific tags." },
      { heading: "Best Hashtag Strategy for Reels in 2025", text: "The optimal hashtag strategy for Instagram reels in 2025 is: 3-4 trending hashtags (500K+ posts), 4-5 mid-range hashtags (50K-500K posts), and 2-3 niche-specific tags (under 50K posts). This combination gives you broad reach potential while still being discoverable in smaller, highly engaged communities. Our generator does this research automatically." },
    ],
  },
  "reel-caption-generator": {
    slug: "/reel-caption-generator",
    title: "Reel Caption Generator",
    metaTitle: "Reel Caption Generator – Smart Instagram Caption Writer",
    metaDesc: "Generate engaging, SEO-optimized captions for Instagram reels. Smart caption writer with hooks, emotional triggers, CTAs, and trending keywords. Free tool.",
    keywords: "reel caption generator, best reel caption generator, instagram reel caption, caption generator for reels, reel caption ideas",
    h1: "Smart Reel Caption Generator",
    subtitle: "Generate scroll-stopping captions for your Instagram reels. Our smart writer creates captions with emotional hooks, trending keywords, and engagement-driving CTAs.",
    ctaText: "Generate Caption Now",
    ctaRoute: "/seo-optimizer",
    icon: FileText,
    features: [
      { icon: Sparkles, title: "Hook Writing", desc: "First line written to stop scrollers — question hooks, bold claims, curiosity triggers." },
      { icon: Target, title: "Emotional Triggers", desc: "Adds emotional words proven to drive saves, shares, and comments." },
      { icon: FileText, title: "CTA Integration", desc: "Includes natural calls-to-action that boost engagement without feeling forced." },
      { icon: Search, title: "Keyword Optimization", desc: "Embeds search-friendly keywords so Instagram indexes your reel for relevant searches." },
    ],
    howItWorks: [
      { step: "Enter Reel Topic", desc: "Describe what your reel is about — topic, key message, target audience." },
      { step: "Smart Caption Writing", desc: "Get multiple caption variations with different tones and hook styles." },
      { step: "Customize & Post", desc: "Pick your favorite, tweak it to match your voice, and publish." },
    ],
    contentBlocks: [
      { heading: "Why Reel Captions Matter More Than You Think", text: "Many creators focus on video quality but neglect captions. Instagram's algorithm reads your caption to understand your content and decide who to show it to. A well-written caption with the right keywords, emotional triggers, and a clear CTA can be the difference between 500 views and 50,000 views. It's the most underrated growth lever for reel creators." },
      { heading: "Anatomy of a Viral Reel Caption", text: "The best-performing reel captions follow a structure: Hook (first line that stops scrolling) → Value (insight, tip, or story) → CTA (ask for engagement). Add 1-2 relevant keywords naturally, use line breaks for readability, and end with a question or prompt that encourages comments. Our AI generator follows this exact formula." },
    ],
  },
  "reel-title-generator": {
    slug: "/reel-title-generator",
    title: "Reel Title Generator",
    metaTitle: "Reel Title Generator – SEO Optimized Titles for Instagram Reels",
    metaDesc: "Generate SEO-optimized titles for Instagram reels. AI creates clickable, keyword-rich titles that improve discoverability in Instagram search. Free tool.",
    keywords: "reel title generator, instagram reel title, reel title ideas, seo reel title, best titles for reels",
    h1: "SEO Reel Title Generator",
    subtitle: "Generate attention-grabbing, keyword-optimized titles for your Instagram reels. Titles that Instagram's search algorithm loves and viewers can't ignore.",
    ctaText: "Generate Reel Titles",
    ctaRoute: "/seo-optimizer",
    icon: FileText,
    features: [
      { icon: FileText, title: "Keyword-Rich Titles", desc: "Titles embedded with searchable keywords that help Instagram categorize your content." },
      { icon: Zap, title: "Click-Worthy Headlines", desc: "Curiosity-driven titles that compel users to watch when they see your reel in search." },
      { icon: TrendingUp, title: "Trend-Aware", desc: "Incorporates trending phrases and formats that are currently getting high engagement." },
      { icon: Target, title: "Niche-Specific", desc: "Tailored titles for your content category — fitness, food, tech, fashion, comedy, etc." },
    ],
    howItWorks: [
      { step: "Enter Topic", desc: "Tell us what your reel is about and your niche." },
      { step: "Smart Title Generation", desc: "Get 5-10 title options with different styles — curiosity, how-to, listicle, provocative." },
      { step: "Pick & Apply", desc: "Choose the best title and add it as your reel's on-screen text or caption header." },
    ],
    contentBlocks: [
      { heading: "Do Instagram Reels Need Titles?", text: "Yes! Instagram now indexes on-screen text and caption headers for search. A clear, keyword-rich title at the start of your caption (or as text overlay) tells Instagram what your reel is about. This directly impacts whether your reel appears when users search for related topics. Think of it as your reel's headline — make it count." },
      { heading: "What Makes a Good Reel Title?", text: "A good reel title is specific, includes a relevant keyword, and creates curiosity or promises value. 'How I got 10K followers in 30 days' performs better than 'Growth tips'. Numbers, specific outcomes, and emotional words make titles more clickable. Our generator creates titles following proven formulas used by top-performing reels." },
    ],
  },
  "reel-viral-checker": {
    slug: "/reel-viral-checker",
    title: "Reel Viral Checker",
    metaTitle: "Reel Viral Checker – Check if Your Reel Can Go Viral",
    metaDesc: "Free reel viral checker. Check your Instagram reel's viral probability with AI analysis. Get viral score, engagement prediction, and improvement tips before posting.",
    keywords: "reel viral checker, reel viral score checker, reel viral prediction tool, viral reel strategy, how to make reels go viral",
    h1: "Check if Your Reel Can Go Viral",
    subtitle: "Our system predicts your reel's viral probability before you post. Get a viral score, identify weak spots, and fix them to maximize your chances of going viral.",
    ctaText: "Check Viral Potential",
    ctaRoute: "/",
    icon: Sparkles,
    features: [
      { icon: Sparkles, title: "Viral Score (0-100)", desc: "Calculates a viral probability score based on hook, caption, hashtags, and content quality." },
      { icon: TrendingUp, title: "Trend Alignment", desc: "Checks if your reel matches currently viral content formats, audio trends, and topics." },
      { icon: Target, title: "Weak Spot Detection", desc: "Pinpoints exactly what's holding your reel back — weak hook, poor hashtags, or missing CTA." },
      { icon: BarChart3, title: "Benchmark Comparison", desc: "Compares your reel's metrics against average performance in your content category." },
    ],
    howItWorks: [
      { step: "Paste Reel Link", desc: "Copy your Instagram reel URL and paste it into the viral checker." },
      { step: "Smart Virality Prediction", desc: "Our system analyzes all viral signals — hook strength, caption quality, hashtag relevance, engagement patterns." },
      { step: "Get Viral Score", desc: "Receive a 0-100 viral score with specific recommendations to improve your chances." },
    ],
    contentBlocks: [
      { heading: "What Makes a Reel Go Viral?", text: "Viral reels share common traits: a hook that grabs attention in under 2 seconds, high watch-through rate (most viewers watch till the end), emotional triggers that drive shares and saves, and alignment with trending formats or audio. Our viral checker analyzes all these signals to predict your reel's probability of breaking out." },
      { heading: "Can You Predict if a Reel Will Go Viral?", text: "While no tool can guarantee virality, data analysis can identify the presence or absence of viral signals. Reels scoring above 70 on our viral checker consistently outperform reels scoring below 50. The prediction isn't perfect, but it gives you data-driven confidence about whether to post or improve first." },
    ],
  },
  "reel-engagement-calculator": {
    slug: "/reel-engagement-calculator",
    title: "Reel Engagement Calculator",
    metaTitle: "Reel Engagement Calculator – Calculate Instagram Reel Engagement Rate",
    metaDesc: "Free reel engagement rate calculator. Calculate your Instagram reel's engagement rate and compare against niche benchmarks. Understand your reel performance metrics.",
    keywords: "reel engagement rate calculator, reel engagement analyzer, check reel engagement, reel performance analytics, instagram reel engagement",
    h1: "Instagram Reel Engagement Rate Calculator",
    subtitle: "Calculate your reel's engagement rate and see how it compares to benchmarks in your niche. Understand which metrics matter most for growth.",
    ctaText: "Calculate Engagement",
    ctaRoute: "/",
    icon: BarChart3,
    features: [
      { icon: BarChart3, title: "Engagement Rate", desc: "Calculates (likes + comments + shares + saves) / views to give you a clear engagement percentage." },
      { icon: Target, title: "Niche Benchmarks", desc: "Compares your engagement against average rates for your content category." },
      { icon: TrendingUp, title: "Metric Breakdown", desc: "Shows which metrics (saves, shares, comments) are strong and which need improvement." },
      { icon: Zap, title: "Growth Tips", desc: "Actionable tips to improve specific engagement metrics based on your content type." },
    ],
    howItWorks: [
      { step: "Enter Reel Data", desc: "Paste your reel link or manually enter views, likes, comments, shares, and saves." },
      { step: "AI Calculates", desc: "Engagement rate computed and compared against 10,000+ reels in your niche." },
      { step: "Get Insights", desc: "See your performance level, metric breakdown, and specific improvement recommendations." },
    ],
    contentBlocks: [
      { heading: "What is a Good Engagement Rate for Reels?", text: "Average engagement rate for Instagram reels is around 1.5-3%. Anything above 3% is considered good, above 5% is excellent, and above 8% suggests viral potential. However, engagement rate varies significantly by niche — educational content typically has higher save rates, while entertainment content gets more shares. Context matters." },
      { heading: "Which Engagement Metrics Matter Most?", text: "Not all engagement is equal. Instagram's algorithm weights different metrics: Saves > Shares > Comments > Likes. A reel with 100 saves and 50 shares will outperform one with 1,000 likes and zero saves. Our calculator breaks down each metric so you understand exactly which types of engagement to optimize for." },
    ],
  },
};

interface SEOToolPageProps {
  slug: string;
}

const SEOToolPage = ({ slug }: SEOToolPageProps) => {
  const navigate = useNavigate();
  const config = PAGES[slug];
  if (!config) return null;
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden pb-20 md:pb-0">
      <SEOHead title={config.metaTitle} description={config.metaDesc} canonical={`https://reelanalyzer.app${config.slug}`} keywords={config.keywords} />

      {/* Hero */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-10 sm:pt-14 pb-8 text-center">
        <motion.div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/50 text-xs text-muted-foreground mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Icon className="w-3 h-3" /> Free Tool • No Login Required
        </motion.div>
        <motion.h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 tracking-tight leading-tight" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {config.h1}
        </motion.h1>
        <motion.p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          {config.subtitle}
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Button onClick={() => navigate(config.ctaRoute)} className="h-12 px-8 gradient-primary-bg text-primary-foreground font-semibold shadow-glow hover:opacity-90 transition-opacity text-sm sm:text-base">
            <Icon className="w-4 h-4 mr-2" /> {config.ctaText}
          </Button>
        </motion.div>
      </div>

      {/* Features */}
      <section className="max-w-2xl mx-auto px-4 pb-8">
        <h2 className="text-lg font-bold text-foreground mb-4 text-center">Key Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {config.features.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
              <Card className="glass p-4 h-full">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <f.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{f.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-2xl mx-auto px-4 pb-8">
        <h2 className="text-lg font-bold text-foreground mb-4 text-center">How It Works</h2>
        <div className="space-y-3">
          {config.howItWorks.map((step, i) => (
            <Card key={i} className="glass p-4">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full gradient-primary-bg flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{step.step}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Content Blocks */}
      {config.contentBlocks.map((block, i) => (
        <section key={i} className="max-w-2xl mx-auto px-4 pb-6">
          <h2 className="text-base font-bold text-foreground mb-2">{block.heading}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{block.text}</p>
        </section>
      ))}

      {/* CTA repeat */}
      <section className="max-w-2xl mx-auto px-4 pb-8 text-center">
        <Button onClick={() => navigate(config.ctaRoute)} className="h-11 px-6 gradient-primary-bg text-primary-foreground font-semibold shadow-glow hover:opacity-90 text-sm">
          <Icon className="w-4 h-4 mr-2" /> {config.ctaText}
        </Button>
      </section>

      {/* Reviews */}
      <UserReviews title="Trusted by 48,000+ Creators" subtitle="See what creators say about our reel analysis tools" />

      {/* Internal Links */}
      <InternalLinks currentPath={config.slug} />

      {/* Footer */}
      <footer className="relative z-10 mt-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="border-t border-border/40" />
          <div className="py-6 text-center">
            <p className="text-[10px] text-muted-foreground/50 max-w-lg mx-auto">
              ReelAnalyzer provides AI-based estimates of Instagram Reel performance. Viral scores are predictions and do not guarantee results. Not affiliated with Instagram or Meta.
            </p>
          </div>
        </div>
      </footer>

      <MobileBottomNav />
    </div>
  );
};

export { PAGES };
export default SEOToolPage;
