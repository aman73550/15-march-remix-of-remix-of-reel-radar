import SEOHead from "@/components/SEOHead";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Link } from "react-router-dom";
import { ArrowLeft, Handshake, BarChart3, Globe } from "lucide-react";

const PartnershipPage = () => (
  <div className="min-h-screen bg-background text-foreground">
    <SEOHead title="Partnership – Reel Analyzer" description="Partner with Reel Analyzer to grow together. Explore partnership opportunities for agencies, tools, and platforms." canonical="https://reelanalyzer.app/partnership" />

    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
      </Link>

      <h1 className="text-2xl sm:text-3xl font-bold mb-2">Partnership</h1>
      <p className="text-sm text-muted-foreground mb-8">We're looking for strategic partners who share our vision of empowering content creators with data-driven insights.</p>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {[
          { icon: Handshake, title: "Agency Partners", desc: "Integrate Reel Analyzer into your social media management offering." },
          { icon: BarChart3, title: "Tech Partners", desc: "API integrations and white-label solutions for analytics platforms." },
          { icon: Globe, title: "Regional Partners", desc: "Help us expand to new markets and languages worldwide." },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="p-4 rounded-xl border border-border/50 bg-card/50">
            <Icon className="w-5 h-5 text-primary mb-2" />
            <h3 className="text-xs font-bold text-foreground mb-1">{title}</h3>
            <p className="text-[10px] text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>

      <div className="text-sm text-muted-foreground space-y-4">
        <p>Interested in partnering with us? Reach out through our <Link to="/contact" className="text-primary hover:underline">Contact page</Link> with details about your organization and proposed partnership.</p>
      </div>
    </div>

    <Footer />
    <MobileBottomNav />
  </div>
);

export default PartnershipPage;
