import SEOHead from "@/components/SEOHead";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TermsPage = () => (
  <div className="min-h-screen bg-background text-foreground">
    <SEOHead title="Terms & Conditions – Reel Analyzer" description="Read the terms and conditions for using Reel Analyzer's Instagram Reel analysis services." canonical="https://reelanalyzer.app/terms" />

    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
      </Link>

      <h1 className="text-2xl sm:text-3xl font-bold mb-2">Terms & Conditions</h1>
      <p className="text-xs text-muted-foreground mb-8">Last updated: March 15, 2026</p>

      <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-base font-bold text-foreground mb-2">1. Acceptance of Terms</h2>
          <p>By accessing and using Reel Analyzer, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">2. Service Description</h2>
          <p>Reel Analyzer provides AI-powered analysis of Instagram Reel content. Our viral scores, recommendations, and insights are estimates based on predictive algorithms and do not guarantee actual performance or reach on Instagram.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">3. User Responsibilities</h2>
          <p>You agree to use the service only for lawful purposes. You must not submit URLs that you do not have permission to analyze. You must not attempt to abuse, overload, or reverse-engineer our systems.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">4. Payments & Refunds</h2>
          <p>Paid services including Master Reports and premium analyses are non-refundable once the analysis has been generated. Prices are displayed before purchase and may change without notice.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">5. Intellectual Property</h2>
          <p>All content, design, and technology on Reel Analyzer is our intellectual property. Generated reports are licensed for your personal or business use but may not be resold.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">6. Limitation of Liability</h2>
          <p>Reel Analyzer is provided "as is" without warranties. We are not liable for any damages arising from your use of the service, including lost revenue, data, or business opportunities.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">7. Disclaimer</h2>
          <p>This website is not affiliated with, endorsed by, or officially connected to Instagram or Meta Platforms, Inc. All trademarks belong to their respective owners.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">8. Contact</h2>
          <p>For questions about these terms, visit our <Link to="/contact" className="text-primary hover:underline">Contact page</Link>.</p>
        </section>
      </div>
    </div>

    <Footer />
    <MobileBottomNav />
  </div>
);

export default TermsPage;
