import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import InternalLinks from "@/components/InternalLinks";
import MobileBottomNav from "@/components/MobileBottomNav";
import Footer from "@/components/Footer";
import { ArrowLeft, Clock, TrendingUp, Calendar, User } from "lucide-react";
import { SEO_ARTICLES } from "@/lib/seoArticles";

const SEOArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  if (!slug || !SEO_ARTICLES[slug]) return <Navigate to="/blog" replace />;

  const article = SEO_ARTICLES[slug];

  // FAQ structured data
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: article.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.h1,
    description: article.metaDesc,
    author: { "@type": "Organization", name: "ReelAnalyzer" },
    publisher: {
      "@type": "Organization",
      name: "ReelAnalyzer",
      logo: { "@type": "ImageObject", url: "https://reelsanylizer.in/favicon.png" },
    },
    dateModified: "2026-03-21",
    datePublished: "2026-03-01",
    mainEntityOfPage: `https://reelsanylizer.in/guides/${slug}`,
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden pb-20 md:pb-0">
      <SEOHead
        title={article.metaTitle}
        description={article.metaDesc}
        canonical={`https://reelsanylizer.in/guides/${slug}`}
        keywords={article.keywords}
      />

      {/* Inject structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <div className="max-w-2xl mx-auto px-4 pt-8 sm:pt-12 pb-6">
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-3 h-3" /> Back to Blog
        </Link>

        <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground mb-4">
            <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {article.readTime}</span>
            <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" /> Updated {article.lastUpdated}</span>
            <span className="inline-flex items-center gap-1"><User className="w-3 h-3" /> ReelAnalyzer Team</span>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight">{article.h1}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed mb-8 border-l-2 border-primary/30 pl-4">{article.intro}</p>

          {/* Table of Contents */}
          <nav className="mb-8 p-4 rounded-lg bg-muted/30 border border-border/50">
            <p className="text-xs font-bold text-foreground mb-2">📋 In This Article</p>
            <ul className="space-y-1">
              {article.sections.map((s, i) => (
                <li key={i}>
                  <a href={`#section-${i}`} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                    → {s.heading}
                  </a>
                </li>
              ))}
              <li>
                <a href="#faq" className="text-xs text-muted-foreground hover:text-primary transition-colors">→ Frequently Asked Questions</a>
              </li>
            </ul>
          </nav>

          {/* Content sections */}
          <div className="space-y-6">
            {article.sections.map((section, i) => (
              <motion.section key={i} id={`section-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.03 * i }}>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-2">{section.heading}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
              </motion.section>
            ))}
          </div>

          {/* Mid-article CTA */}
          <div className="my-8 p-4 rounded-lg bg-primary/5 border border-primary/20 text-center">
            <p className="text-sm font-semibold text-foreground mb-2">🚀 Ready to optimize your next reel?</p>
            <p className="text-xs text-muted-foreground mb-3">Paste your reel URL and get instant analysis — hook score, caption quality, hashtag strategy, and viral prediction.</p>
            <Link to="/">
              <Button className="h-10 px-6 bg-primary text-primary-foreground font-semibold hover:bg-primary/90 text-sm">
                <TrendingUp className="w-4 h-4 mr-2" /> Analyze Your Reel Now — Free
              </Button>
            </Link>
          </div>

          {/* FAQ Section */}
          <section id="faq" className="mt-8">
            <h2 className="text-lg font-bold text-foreground mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {article.faq.map((f, i) => (
                <div key={i} className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <h3 className="text-sm font-semibold text-foreground mb-1">{f.q}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Bottom CTA */}
          <div className="mt-8 text-center">
            <Link to="/">
              <Button className="h-11 px-6 bg-primary text-primary-foreground font-semibold hover:bg-primary/90 text-sm">
                <TrendingUp className="w-4 h-4 mr-2" /> Analyze Your Reel Now
              </Button>
            </Link>
          </div>
        </motion.article>
      </div>

      <InternalLinks currentPath={`/guides/${slug}`} />
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default SEOArticlePage;
