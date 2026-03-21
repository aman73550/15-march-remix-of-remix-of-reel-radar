import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import SEOHead from "@/components/SEOHead";
import InternalLinks from "@/components/InternalLinks";
import MobileBottomNav from "@/components/MobileBottomNav";
import Footer from "@/components/Footer";
import { BookOpen, ArrowRight, Clock, Calendar } from "lucide-react";
import { SEO_ARTICLES } from "@/lib/seoArticles";

interface Article {
  slug: string;
  title: string;
  excerpt: string;
  readTime: string;
  date: string;
  type: "blog" | "guide";
  path: string;
}

// Original blog articles
const BLOG_ARTICLES: Article[] = [
  { slug: "best-reel-hooks-that-go-viral", title: "Best Reel Hooks That Go Viral in 2025", excerpt: "Discover the top hook formulas that successful creators use to stop the scroll and keep viewers watching.", readTime: "6 min read", date: "March 2025", type: "blog", path: "/blog/best-reel-hooks-that-go-viral" },
  { slug: "how-to-analyze-instagram-reels", title: "How to Analyze Instagram Reels for Virality", excerpt: "A complete guide to analyzing your Instagram reels. Learn which metrics matter and how to use analysis tools.", readTime: "8 min read", date: "March 2025", type: "blog", path: "/blog/how-to-analyze-instagram-reels" },
  { slug: "best-hashtags-for-instagram-reels", title: "Best Hashtags for Instagram Reels — Complete Strategy Guide", excerpt: "The definitive guide to Instagram reel hashtags. How many to use, which competition levels to target.", readTime: "7 min read", date: "March 2025", type: "blog", path: "/blog/best-hashtags-for-instagram-reels" },
  { slug: "instagram-reel-growth-strategy", title: "Instagram Reel Growth Strategy for 2025", excerpt: "A data-driven approach to growing your Instagram through reels. Posting frequency, content pillars, and more.", readTime: "10 min read", date: "March 2025", type: "blog", path: "/blog/instagram-reel-growth-strategy" },
  { slug: "how-reel-seo-works", title: "How Reel SEO Works in the Instagram Algorithm", excerpt: "Understanding how Instagram indexes and ranks reels in search. Caption keywords, on-screen text, and hashtag signals.", readTime: "7 min read", date: "March 2025", type: "blog", path: "/blog/how-reel-seo-works" },
];

// Convert SEO articles to display format
const GUIDE_ARTICLES: Article[] = Object.values(SEO_ARTICLES).map((a) => ({
  slug: a.slug,
  title: a.h1,
  excerpt: a.metaDesc,
  readTime: a.readTime,
  date: a.lastUpdated,
  type: "guide" as const,
  path: `/guides/${a.slug}`,
}));

const ALL_ARTICLES = [...BLOG_ARTICLES, ...GUIDE_ARTICLES];

const BlogIndex = () => (
  <div className="min-h-screen bg-background relative overflow-x-hidden pb-20 md:pb-0">
    <SEOHead
      title="Blog & Guides — Instagram Reel Growth, SEO Tips & Viral Strategies | ReelAnalyzer"
      description="Expert guides on Instagram reel growth, viral strategies, hashtag optimization, reel SEO, engagement tips, and creator growth strategies. 30+ in-depth articles."
      canonical="https://reelsanylizer.in/blog"
      keywords="instagram reel tips, reel growth guide, how to go viral on instagram, reel seo guide, reel hashtag tips, instagram growth 2026"
    />

    <div className="max-w-2xl mx-auto px-4 pt-10 sm:pt-14 pb-6">
      <motion.div className="text-center mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/50 text-xs text-muted-foreground mb-4">
          <BookOpen className="w-3 h-3" /> {ALL_ARTICLES.length}+ Articles & Guides
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Instagram Reel Growth Hub</h1>
        <p className="text-sm text-muted-foreground">Expert strategies, tips, and in-depth guides to help your Instagram reels go viral and grow your audience.</p>
      </motion.div>

      {/* Featured guides */}
      <div className="mb-6">
        <h2 className="text-sm font-bold text-foreground mb-3">📚 Featured Guides</h2>
        <div className="space-y-3">
          {GUIDE_ARTICLES.slice(0, 6).map((article, i) => (
            <motion.div key={article.slug} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
              <Link to={article.path}>
                <Card className="p-4 hover:border-primary/30 transition-all group cursor-pointer border-border/50">
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-1.5">
                    <Clock className="w-3 h-3" /><span>{article.readTime}</span>
                    <span>•</span>
                    <Calendar className="w-3 h-3" /><span>{article.date}</span>
                    <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[9px] font-medium">Guide</span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors mb-1">{article.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{article.excerpt}</p>
                  <span className="text-xs text-primary font-medium inline-flex items-center gap-1 mt-2 group-hover:gap-2 transition-all">
                    Read guide <ArrowRight className="w-3 h-3" />
                  </span>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* All articles */}
      <div>
        <h2 className="text-sm font-bold text-foreground mb-3">📖 All Articles</h2>
        <div className="space-y-2">
          {ALL_ARTICLES.slice(6).map((article, i) => (
            <motion.div key={article.slug + article.type} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.03 * i }}>
              <Link to={article.path}>
                <div className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors group">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">{article.title}</p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                      <span>{article.readTime}</span>
                      <span>•</span>
                      <span>{article.date}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-primary flex-shrink-0 ml-2" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>

    <InternalLinks currentPath="/blog" />
    <Footer />
    <MobileBottomNav />
  </div>
);

export { BLOG_ARTICLES };
export default BlogIndex;
