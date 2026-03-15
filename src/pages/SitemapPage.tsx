import SEOHead from "@/components/SEOHead";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const SITEMAP_SECTIONS = [
  {
    title: "Main Tools",
    links: [
      { path: "/", label: "Reel Analyzer – Viral Score Checker" },
      { path: "/seo-optimizer", label: "SEO Optimizer" },
    ],
  },
  {
    title: "Free Analysis Tools",
    links: [
      { path: "/reel-analyzer", label: "Reel Analyzer" },
      { path: "/instagram-reel-analyzer", label: "Instagram Reel Analyzer" },
      { path: "/reel-seo-optimizer", label: "Reel SEO Optimizer" },
      { path: "/reel-hashtag-generator", label: "Reel Hashtag Generator" },
      { path: "/reel-caption-generator", label: "Reel Caption Generator" },
      { path: "/reel-title-generator", label: "Reel Title Generator" },
      { path: "/reel-viral-checker", label: "Reel Viral Checker" },
      { path: "/reel-engagement-calculator", label: "Reel Engagement Calculator" },
    ],
  },
  {
    title: "Blog & Guides",
    links: [
      { path: "/blog", label: "Blog" },
      { path: "/blog/best-reel-hooks-that-go-viral", label: "Best Reel Hooks That Go Viral" },
      { path: "/blog/how-to-analyze-instagram-reels", label: "How to Analyze Instagram Reels" },
      { path: "/blog/best-hashtags-for-instagram-reels", label: "Best Hashtags for Instagram Reels" },
      { path: "/blog/instagram-reel-growth-strategy", label: "Instagram Reel Growth Strategy" },
      { path: "/blog/how-reel-seo-works", label: "How Reel SEO Works" },
    ],
  },
  {
    title: "Company",
    links: [
      { path: "/about", label: "About Us" },
      { path: "/contact", label: "Contact Us" },
      { path: "/partnership", label: "Partnership" },
      { path: "/collaboration", label: "Collaboration" },
      { path: "/promotion", label: "Promotion" },
    ],
  },
  {
    title: "Legal",
    links: [
      { path: "/privacy-policy", label: "Privacy Policy" },
      { path: "/terms", label: "Terms & Conditions" },
    ],
  },
];

const SitemapPage = () => (
  <div className="min-h-screen bg-background text-foreground">
    <SEOHead title="Sitemap – Reel Analyzer" description="Browse all pages and tools available on Reel Analyzer." canonical="https://reelanalyzer.app/sitemap-page" />

    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
      </Link>

      <h1 className="text-2xl sm:text-3xl font-bold mb-8">Sitemap</h1>

      <div className="space-y-8">
        {SITEMAP_SECTIONS.map((section) => (
          <div key={section.title}>
            <h2 className="text-sm font-bold text-foreground mb-3">{section.title}</h2>
            <ul className="space-y-1.5">
              {section.links.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                    → {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>

    <Footer />
    <MobileBottomNav />
  </div>
);

export default SitemapPage;
