import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const TOOL_LINKS = [
  { path: "/reel-analyzer", label: "Reel Analyzer", desc: "Analyze reel viral potential" },
  { path: "/instagram-reel-analyzer", label: "Instagram Reel Analyzer", desc: "Full Instagram reel analysis" },
  { path: "/reel-seo-optimizer", label: "Reel SEO Optimizer", desc: "Optimize reel captions & titles" },
  { path: "/reel-hashtag-generator", label: "Reel Hashtag Generator", desc: "Generate trending hashtags" },
  { path: "/reel-caption-generator", label: "Reel Caption Generator", desc: "AI-powered caption writing" },
  { path: "/reel-title-generator", label: "Reel Title Generator", desc: "SEO optimized reel titles" },
  { path: "/reel-viral-checker", label: "Reel Viral Checker", desc: "Check viral probability score" },
  { path: "/reel-engagement-calculator", label: "Engagement Calculator", desc: "Calculate reel engagement rate" },
];

const BLOG_LINKS = [
  { path: "/blog/best-reel-hooks-that-go-viral", label: "Best Reel Hooks That Go Viral" },
  { path: "/blog/how-to-analyze-instagram-reels", label: "How to Analyze Instagram Reels" },
  { path: "/blog/best-hashtags-for-instagram-reels", label: "Best Hashtags for Instagram Reels" },
  { path: "/blog/instagram-reel-growth-strategy", label: "Instagram Reel Growth Strategy" },
  { path: "/blog/how-reel-seo-works", label: "How Reel SEO Works in Instagram Algorithm" },
];

interface InternalLinksProps {
  currentPath?: string;
  showBlog?: boolean;
  compact?: boolean;
}

const InternalLinks = ({ currentPath, showBlog = true, compact = false }: InternalLinksProps) => {
  const filteredTools = TOOL_LINKS.filter(l => l.path !== currentPath);

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2 justify-center">
        {filteredTools.slice(0, 4).map(link => (
          <Link
            key={link.path}
            to={link.path}
            className="text-[10px] sm:text-xs px-3 py-1.5 rounded-full border border-border bg-muted/30 text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <section className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Tools */}
      <div>
        <h2 className="text-sm font-bold text-foreground mb-3">Free Reel Analysis Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {filteredTools.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className="group flex items-center justify-between px-3 py-2.5 rounded-lg border border-border/50 bg-card/50 hover:border-primary/30 hover:bg-primary/5 transition-all"
            >
              <div>
                <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{link.label}</p>
                <p className="text-[10px] text-muted-foreground">{link.desc}</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* Blog */}
      {showBlog && (
        <div>
          <h2 className="text-sm font-bold text-foreground mb-3">Guides & Articles</h2>
          <div className="space-y-1.5">
            {BLOG_LINKS.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className="group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/5 transition-colors"
              >
                <span className="text-primary text-xs">📖</span>
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export { TOOL_LINKS, BLOG_LINKS };
export default InternalLinks;
