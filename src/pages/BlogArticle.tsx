import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import InternalLinks from "@/components/InternalLinks";
import MobileBottomNav from "@/components/MobileBottomNav";
import { ArrowLeft, Clock, TrendingUp } from "lucide-react";

interface BlogContent {
  metaTitle: string;
  metaDesc: string;
  keywords: string;
  title: string;
  readTime: string;
  sections: { heading: string; content: string }[];
  ctaText: string;
  ctaRoute: string;
}

const BLOG_DATA: Record<string, BlogContent> = {
  "best-reel-hooks-that-go-viral": {
    metaTitle: "Best Reel Hooks That Go Viral in 2025 — Top Hook Formulas",
    metaDesc: "Discover the most effective Instagram reel hook formulas that go viral. Learn question hooks, bold claim hooks, curiosity gaps, and pattern interrupt techniques.",
    keywords: "reel hooks, viral reel hooks, best hooks for reels, instagram reel hook ideas, how to hook viewers on reels",
    title: "Best Reel Hooks That Go Viral in 2025",
    readTime: "6 min read",
    sections: [
      { heading: "Why the First 3 Seconds Decide Your Reel's Fate", content: "Instagram's algorithm measures early retention aggressively. If viewers scroll past your reel within the first 2-3 seconds, the algorithm assumes your content isn't interesting and limits distribution. This means your hook — the opening moment of your reel — is the single most important factor in determining reach. Data shows reels with strong hooks get 3-5x more views than those with weak or no hooks." },
      { heading: "The Question Hook", content: "Starting your reel with a question immediately engages the viewer's brain. Their mind automatically starts thinking about the answer, which keeps them watching. Examples: 'Did you know most reels fail because of this one mistake?', 'What if I told you your hashtags are hurting your reach?'. Questions work because they create an information gap the viewer wants to close." },
      { heading: "The Bold Claim Hook", content: "Making a surprising or controversial statement in the first second grabs attention through shock value. Examples: 'This one trick gave me 100K views overnight', 'Stop using 30 hashtags — here's why'. Bold claims work because they challenge assumptions and trigger curiosity. Just make sure your reel actually delivers on the claim." },
      { heading: "The Pattern Interrupt Hook", content: "Pattern interrupts break the viewer's scrolling rhythm with something unexpected — a sudden movement, an unusual visual, or an on-screen text that creates urgency. This technique works because our brains are wired to notice things that don't fit the pattern. Examples: starting with a fast zoom, sudden audio change, or text that says 'WAIT — watch this till the end'." },
      { heading: "The Before/After Hook", content: "Showing a dramatic transformation in the first second creates immediate curiosity about how the change happened. This works for fitness, beauty, room makeovers, editing tutorials, and any content with visible results. The viewer stays to see the process that led to the transformation." },
      { heading: "The Curiosity Gap Hook", content: "Revealing partial information upfront and promising the full picture later in the reel. Example: showing the result but not the method, or stating 'I tested this for 30 days and here's what happened'. The incomplete information creates a psychological need to keep watching." },
      { heading: "How to Test Your Hook Strength", content: "Use ReelAnalyzer's hook analysis tool to score your reel's opening before posting. Our system evaluates hook type, visual impact, text overlay effectiveness, and compares it against high-performing hooks in your niche. Reels with hook scores above 7/10 consistently outperform those scoring below 5." },
    ],
    ctaText: "Test Your Reel's Hook Score",
    ctaRoute: "/",
  },
  "how-to-analyze-instagram-reels": {
    metaTitle: "How to Analyze Instagram Reels for Virality — Complete Guide",
    metaDesc: "Learn how to analyze Instagram reels step by step. Understand viral metrics, engagement rates, hook analysis, caption optimization, and hashtag strategy for better reel performance.",
    keywords: "how to analyze instagram reels, reel analysis guide, instagram reel metrics, reel performance analysis, analyze reel engagement",
    title: "How to Analyze Instagram Reels for Virality",
    readTime: "8 min read",
    sections: [
      { heading: "Why Analyzing Your Reels is Essential for Growth", content: "Most creators post reels and hope for the best. But the creators who grow consistently are the ones who analyze their content systematically. By understanding which elements of your reels contribute to engagement — and which elements hold you back — you can make data-driven improvements that compound over time. Analysis turns content creation from guesswork into a repeatable system." },
      { heading: "Key Metrics to Track for Every Reel", content: "Not all metrics are equal. Here's what matters most in order of importance: Watch-through rate (what percentage of viewers watch till the end), Saves (strongest engagement signal), Shares (indicates content value), Comments (shows active engagement), Likes (weakest signal but still relevant). Track these for every reel you post and look for patterns." },
      { heading: "Understanding Your Engagement Rate", content: "Engagement rate = (Likes + Comments + Shares + Saves) / Views × 100. Average engagement for reels is 1.5-3%. Above 5% is excellent. Above 8% suggests viral potential. But context matters — educational content typically has higher save rates while entertainment gets more shares. Compare against your niche benchmarks, not general averages." },
      { heading: "How to Analyze Hook Performance", content: "Your hook determines whether people watch or scroll. To analyze hook effectiveness: check your reel's retention graph in Instagram Insights (if available), note where the biggest drop-off happens, and compare opening techniques across your best and worst performing reels. A strong hook keeps 60%+ viewers past the 3-second mark." },
      { heading: "Caption Analysis for Better Reach", content: "Your caption affects both engagement and discoverability. Analyze: Does it start with a hook? Does it include searchable keywords? Is there a clear CTA? Are you using emotional triggers? Instagram now indexes captions for search — keywords in your caption directly affect who sees your reel in search results." },
      { heading: "Hashtag Strategy Analysis", content: "Review your hashtag performance: Are you using too many (30) or too few (3)? Are they relevant to your content? What competition level are they? The optimal approach is 8-12 hashtags mixing trending (3-4), mid-range (4-5), and niche-specific (2-3). Analyze which hashtag sets correlated with your highest-reaching reels." },
      { heading: "Using ReelAnalyzer for Automated Analysis", content: "Instead of manually tracking all these metrics, use ReelAnalyzer to get instant AI-powered analysis. Paste your reel URL and get a comprehensive breakdown of hook strength, caption quality, hashtag strategy, engagement predictions, trend matching, and specific improvement recommendations — all in seconds." },
    ],
    ctaText: "Analyze Your Reel Now",
    ctaRoute: "/",
  },
  "best-hashtags-for-instagram-reels": {
    metaTitle: "Best Hashtags for Instagram Reels 2025 — Strategy & Generator",
    metaDesc: "Complete guide to Instagram reel hashtags. Find the best hashtags for your niche, learn optimal hashtag count, competition targeting, and trending tag strategies for 2025.",
    keywords: "best hashtags for instagram reels, reel hashtags 2025, trending hashtags for reels, instagram reel hashtag strategy, hashtag generator for reels",
    title: "Best Hashtags for Instagram Reels — Complete Strategy Guide",
    readTime: "7 min read",
    sections: [
      { heading: "How Hashtags Work for Instagram Reels in 2025", content: "Instagram uses hashtags to categorize your content and match it with users who follow or browse those topics. For reels specifically, hashtags contribute to discoverability on the Explore page and the Reels tab. But the algorithm has evolved — simply adding 30 popular hashtags no longer works. Instagram now prioritizes relevance over volume." },
      { heading: "How Many Hashtags Should You Use?", content: "Research shows the optimal number for reels is 8-12 hashtags. Too few (under 5) limits your distribution channels. Too many (25-30) can trigger the algorithm to flag your content as spammy. The sweet spot gives you enough coverage across topics without diluting your content's categorization signal." },
      { heading: "The Three-Tier Hashtag Strategy", content: "The most effective approach uses three tiers: Trending hashtags (500K+ posts) — 3-4 tags for broad reach potential. Mid-range hashtags (50K-500K posts) — 4-5 tags where you can realistically appear in top posts. Niche-specific hashtags (under 50K posts) — 2-3 tags targeting your exact audience. This pyramid approach maximizes both reach and relevance." },
      { heading: "Best Hashtags by Niche", content: "Fitness: #fitnessmotivation #gymreels #workouttips #fitnessjourney. Food: #foodreels #recipeideas #cookingreels #foodtutorial. Fashion: #fashionreels #outfitideas #styletips #fashioninspo. Tech: #techreels #techtips #techhacks #gadgetreview. Travel: #travelreels #wanderlust #travelgram #travelhacks. Comedy: #funnyreels #comedy #relatable #memes. Always add niche-specific variations unique to your subcategory." },
      { heading: "How to Find Trending Hashtags", content: "Check Instagram's Explore page for trending topics in your niche. Look at what top creators in your category are using. Use ReelAnalyzer's hashtag analysis tool to identify which tags are currently trending and have the right competition level for your account size. Trending hashtags change weekly, so regular research is essential." },
      { heading: "Common Hashtag Mistakes to Avoid", content: "Using banned or flagged hashtags (Instagram maintains a shadow-ban list). Using only ultra-competitive hashtags where your content gets buried. Using irrelevant hashtags just because they're popular. Repeating the exact same hashtag set on every post (Instagram may reduce distribution). Not updating your hashtag strategy as trends change." },
    ],
    ctaText: "Generate Optimized Hashtags",
    ctaRoute: "/reel-hashtag-generator",
  },
  "instagram-reel-growth-strategy": {
    metaTitle: "Instagram Reel Growth Strategy 2025 — Data-Driven Guide",
    metaDesc: "Complete Instagram reel growth strategy for 2025. Learn posting frequency, content pillars, engagement tactics, algorithm optimization, and viral reel techniques.",
    keywords: "instagram reel growth strategy, reel growth tips, how to grow on instagram reels, viral reel strategy, reel content strategy",
    title: "Instagram Reel Growth Strategy for 2025",
    readTime: "10 min read",
    sections: [
      { heading: "Why Reels Are the Fastest Way to Grow on Instagram", content: "Instagram actively pushes reels to non-followers through the Explore page and Reels tab. This means your reel content has a much higher chance of reaching new audiences compared to feed posts or stories. Accounts that consistently post reels grow followers 2-4x faster than those relying only on static posts. Reels are Instagram's answer to TikTok, and the platform rewards creators who use the format." },
      { heading: "Posting Frequency: How Often Should You Post Reels?", content: "Data suggests 4-7 reels per week is optimal for growth. Posting less than 3 times per week doesn't give the algorithm enough content to work with. Posting more than once per day can cannibalize your own reach. The key is consistency — pick a frequency you can maintain for months, not just weeks." },
      { heading: "Content Pillars for Reel Creators", content: "Define 3-4 content pillars (recurring themes) for your reels. This helps the algorithm understand your niche and recommend your content to the right audience. Examples: A fitness creator might have Workout Tips, Nutrition Facts, Transformation Stories, and Myth Busting. Each reel should clearly fit into one pillar." },
      { heading: "The Viral Reel Formula", content: "While virality isn't guaranteed, high-performing reels share common elements: Strong hook in the first 2 seconds, valuable or entertaining content throughout, emotional trigger (surprise, humor, inspiration, outrage), clear on-screen text for sound-off viewers, trending audio or original audio that fits the mood, CTA in caption to drive saves and shares." },
      { heading: "Algorithm Optimization Tactics", content: "Post during your audience's peak hours (check Instagram Insights). Use captions with searchable keywords. Respond to comments within the first hour (signals active engagement). Share your reel to your story for initial momentum. Use on-screen text — Instagram indexes it for search. Keep reels between 15-30 seconds for optimal watch-through rate." },
      { heading: "Tracking and Iterating", content: "Growth comes from iteration, not just creation. Track your top 5 reels monthly — identify common patterns in hooks, topics, formats, and posting times. Double down on what works and stop doing what doesn't. Use ReelAnalyzer to analyze every reel before posting to catch weak spots early." },
    ],
    ctaText: "Analyze Your Reel Strategy",
    ctaRoute: "/",
  },
  "how-reel-seo-works": {
    metaTitle: "How Reel SEO Works in the Instagram Algorithm — Guide",
    metaDesc: "Understand how Instagram SEO works for reels. Learn about caption keywords, hashtag signals, on-screen text indexing, and discoverability optimization for reel creators.",
    keywords: "how reel seo works, instagram reel seo, reel discoverability, instagram search optimization, reel seo tips",
    title: "How Reel SEO Works in the Instagram Algorithm",
    readTime: "7 min read",
    sections: [
      { heading: "Instagram is Now a Search Engine", content: "Instagram has evolved beyond a social feed — it's now a visual search engine. Users search for topics, products, tutorials, and trends directly on Instagram. The platform indexes captions, hashtags, alt text, on-screen text, and even audio descriptions to match content with search queries. If your reels aren't optimized for search, you're missing a massive discovery channel." },
      { heading: "How Instagram Indexes Reel Content", content: "Instagram's search algorithm reads several content signals: Caption text (keywords and phrases), Hashtags (topic categorization), On-screen text overlays (OCR technology), Audio/music descriptions, Account category and niche signals, Alt text on images. Each signal helps Instagram understand what your reel is about and who might want to see it." },
      { heading: "Keywords in Captions: The Foundation of Reel SEO", content: "The most important SEO element for reels is your caption. Include 2-3 relevant keywords naturally in your caption — don't stuff them. For example, if you're posting a cooking reel, naturally include phrases like 'easy recipe', 'quick dinner idea', or 'healthy meal prep'. These keywords help Instagram show your reel when users search for those terms." },
      { heading: "On-Screen Text SEO", content: "Instagram uses OCR (Optical Character Recognition) to read text displayed on your reel. This means your on-screen titles, subtitles, and text overlays contribute to search indexing. Add keyword-rich text overlays — not just decorative text. A reel about 'morning workout routine' should have that phrase visible on screen." },
      { heading: "Hashtag SEO vs Keyword SEO", content: "Hashtags and caption keywords serve different purposes. Hashtags categorize your content into browseable topics (like folders). Caption keywords match your content to specific search queries. Use both: hashtags for broad topic discovery and keywords for specific search matching. Together they create a comprehensive discoverability strategy." },
      { heading: "Optimizing for the Explore Page", content: "The Explore page is curated by Instagram's recommendation algorithm, which considers: Content quality signals (engagement rate, watch time), User interest matching (behavioral data), Content freshness (recent posts prioritized), Creator authority (consistent posting, niche expertise). SEO optimization improves your content's relevance signal, increasing Explore page chances." },
    ],
    ctaText: "Optimize Your Reel SEO",
    ctaRoute: "/reel-seo-optimizer",
  },
};

const BlogArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  if (!slug || !BLOG_DATA[slug]) return <Navigate to="/blog" replace />;

  const article = BLOG_DATA[slug];

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden pb-20 md:pb-0">
      <SEOHead title={article.metaTitle} description={article.metaDesc} canonical={`https://reelanalyzer.app/blog/${slug}`} keywords={article.keywords} />

      <div className="max-w-2xl mx-auto px-4 pt-8 sm:pt-12 pb-6">
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-3 h-3" /> Back to Blog
        </Link>

        <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-3">
            <Clock className="w-3 h-3" />
            <span>{article.readTime}</span>
            <span>•</span>
            <span>March 2025</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-6 leading-tight">{article.title}</h1>

          <div className="space-y-6">
            {article.sections.map((section, i) => (
              <motion.section key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 * i }}>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-2">{section.heading}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
              </motion.section>
            ))}
          </div>

          {/* CTA */}
          <motion.div className="mt-8 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <Link to={article.ctaRoute}>
              <Button className="h-11 px-6 gradient-primary-bg text-primary-foreground font-semibold shadow-glow hover:opacity-90 text-sm">
                <TrendingUp className="w-4 h-4 mr-2" /> {article.ctaText}
              </Button>
            </Link>
          </motion.div>
        </motion.article>
      </div>

      <InternalLinks currentPath={`/blog/${slug}`} />

      <footer className="relative z-10 mt-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="border-t border-border/40" />
          <div className="py-6 text-center">
            <p className="text-[10px] text-muted-foreground/50">ReelAnalyzer — Free AI-powered Instagram Reel Analysis Tools</p>
          </div>
        </div>
      </footer>
      <MobileBottomNav />
    </div>
  );
};

export default BlogArticle;
