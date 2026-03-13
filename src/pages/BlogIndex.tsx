import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import SEOHead from "@/components/SEOHead";
import InternalLinks from "@/components/InternalLinks";
import MobileBottomNav from "@/components/MobileBottomNav";
import { BookOpen, ArrowRight, Clock } from "lucide-react";

interface Article {
  slug: string;
  title: string;
  excerpt: string;
  readTime: string;
  date: string;
}

const ARTICLES: Article[] = [
  {
    slug: "best-reel-hooks-that-go-viral",
    title: "Best Reel Hooks That Go Viral in 2025",
    excerpt: "Discover the top hook formulas that successful creators use to stop the scroll and keep viewers watching. From question hooks to bold claims, learn what actually works.",
    readTime: "6 min read",
    date: "March 2025",
  },
  {
    slug: "how-to-analyze-instagram-reels",
    title: "How to Analyze Instagram Reels for Virality",
    excerpt: "A complete guide to analyzing your Instagram reels. Learn which metrics matter, how to interpret engagement data, and how to use analysis tools to improve your content.",
    readTime: "8 min read",
    date: "March 2025",
  },
  {
    slug: "best-hashtags-for-instagram-reels",
    title: "Best Hashtags for Instagram Reels — Complete Strategy Guide",
    excerpt: "The definitive guide to Instagram reel hashtags. How many to use, which competition levels to target, and how to find trending tags for your niche.",
    readTime: "7 min read",
    date: "March 2025",
  },
  {
    slug: "instagram-reel-growth-strategy",
    title: "Instagram Reel Growth Strategy for 2025",
    excerpt: "A data-driven approach to growing your Instagram through reels. Posting frequency, content pillars, engagement tactics, and algorithm optimization tips.",
    readTime: "10 min read",
    date: "March 2025",
  },
  {
    slug: "how-reel-seo-works",
    title: "How Reel SEO Works in the Instagram Algorithm",
    excerpt: "Understanding how Instagram indexes and ranks reels in search. Learn about caption keywords, on-screen text, and hashtag signals that affect discoverability.",
    readTime: "7 min read",
    date: "March 2025",
  },
];

const BlogIndex = () => (
  <div className="min-h-screen bg-background relative overflow-x-hidden pb-20 md:pb-0">
    <SEOHead
      title="Blog — Instagram Reel Growth Guides & SEO Tips | ReelAnalyzer"
      description="Expert guides on Instagram reel growth, viral strategies, hashtag optimization, reel SEO, and engagement tips. Learn how to make your reels go viral."
      canonical="https://reelanalyzer.app/blog"
      keywords="instagram reel tips, reel growth guide, how to go viral on instagram, reel seo guide, reel hashtag tips"
    />

    <div className="max-w-2xl mx-auto px-4 pt-10 sm:pt-14 pb-6">
      <motion.div className="text-center mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/50 text-xs text-muted-foreground mb-4">
          <BookOpen className="w-3 h-3" /> Reel Growth Blog
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Instagram Reel Growth Guides</h1>
        <p className="text-sm text-muted-foreground">Expert strategies, tips, and guides to help your Instagram reels go viral.</p>
      </motion.div>

      <div className="space-y-4">
        {ARTICLES.map((article, i) => (
          <motion.div key={article.slug} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
            <Link to={`/blog/${article.slug}`}>
              <Card className="glass p-4 sm:p-5 hover:border-primary/30 transition-all group cursor-pointer">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-2">
                  <Clock className="w-3 h-3" />
                  <span>{article.readTime}</span>
                  <span>•</span>
                  <span>{article.date}</span>
                </div>
                <h2 className="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors mb-1.5">
                  {article.title}
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">{article.excerpt}</p>
                <span className="text-xs text-primary font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  Read article <ArrowRight className="w-3 h-3" />
                </span>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>

    <InternalLinks currentPath="/blog" />

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

export { ARTICLES };
export default BlogIndex;
