import SEOHead from "@/components/SEOHead";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Link } from "react-router-dom";
import { ArrowLeft, Megaphone, TrendingUp, Share2 } from "lucide-react";

const PromotionPage = () => (
  <div className="min-h-screen bg-background text-foreground">
    <SEOHead title="Promotion – Reel Analyzer" description="Promote your brand, tool, or service on Reel Analyzer. Reach thousands of Instagram creators and marketers." canonical="https://reelanalyzer.app/promotion" />

    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
      </Link>

      <h1 className="text-2xl sm:text-3xl font-bold mb-2">Promotion</h1>
      <p className="text-sm text-muted-foreground mb-8">Reach a highly targeted audience of Instagram creators, marketers, and brands through Reel Analyzer.</p>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {[
          { icon: Megaphone, title: "Sponsored Placement", desc: "Feature your tool or service within our analysis results and reports." },
          { icon: TrendingUp, title: "Newsletter Sponsorship", desc: "Get in front of our growing creator community via email." },
          { icon: Share2, title: "Cross-Promotion", desc: "Mutual promotion partnerships to grow both our audiences." },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="p-4 rounded-xl border border-border/50 bg-card/50">
            <Icon className="w-5 h-5 text-primary mb-2" />
            <h3 className="text-xs font-bold text-foreground mb-1">{title}</h3>
            <p className="text-[10px] text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>

      <div className="text-sm text-muted-foreground">
        <p>Interested in promoting on our platform? Reach out via our <Link to="/contact" className="text-primary hover:underline">Contact page</Link> with your campaign details and budget.</p>
      </div>
    </div>

    <Footer />
    <MobileBottomNav />
  </div>
);

export default PromotionPage;
