import SEOHead from "@/components/SEOHead";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap, Target, Users } from "lucide-react";

const AboutPage = () => (
  <div className="min-h-screen bg-background text-foreground">
    <SEOHead title="About Us – Reel Analyzer" description="Learn about Reel Analyzer, the AI-powered Instagram Reel analysis tool that helps creators go viral." canonical="https://reelanalyzer.app/about" />

    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
      </Link>

      <h1 className="text-2xl sm:text-3xl font-bold mb-6">About Reel Analyzer</h1>

      <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
        <p>
          Reel Analyzer is an AI-powered platform designed to help Instagram creators, marketers, and brands understand what makes a Reel go viral. Our advanced algorithms analyze engagement patterns, content quality, hashtag effectiveness, and trending signals to give you actionable insights.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: Zap, title: "AI-Powered", desc: "Advanced AI models analyze every aspect of your Reel for viral potential." },
            { icon: Target, title: "Actionable Insights", desc: "Get specific recommendations to improve engagement and reach." },
            { icon: Users, title: "Creator-First", desc: "Built by creators, for creators who want to grow on Instagram." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-4 rounded-xl border border-border/50 bg-card/50">
              <Icon className="w-5 h-5 text-primary mb-2" />
              <h3 className="text-xs font-bold text-foreground mb-1">{title}</h3>
              <p className="text-[10px] text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>

        <h2 className="text-lg font-bold text-foreground pt-4">Our Mission</h2>
        <p>
          We believe every creator deserves data-driven insights to grow their audience. Our mission is to democratize social media analytics by making professional-grade analysis tools accessible and affordable for everyone.
        </p>

        <h2 className="text-lg font-bold text-foreground pt-4">How It Works</h2>
        <p>
          Simply paste your Instagram Reel URL into our analyzer. Our AI examines engagement metrics, caption quality, hashtag strategy, hook effectiveness, trend alignment, and visual quality to generate a comprehensive viral score and detailed recommendations.
        </p>
      </div>
    </div>

    <Footer />
    <MobileBottomNav />
  </div>
);

export default AboutPage;
