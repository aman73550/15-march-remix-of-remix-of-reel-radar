import SEOHead from "@/components/SEOHead";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Link } from "react-router-dom";
import { ArrowLeft, Users, Video, PenTool, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWhatsAppNumber } from "@/hooks/useWhatsAppNumber";

const CollaborationPage = () => {
  const { whatsappNumber, openWhatsApp } = useWhatsAppNumber();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead title="Collaboration – Reel Analyzer" description="Collaborate with Reel Analyzer as a creator, influencer, or content strategist. Let's grow together." canonical="https://reelanalyzer.app/collaboration" />

      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Collaboration</h1>
        <p className="text-sm text-muted-foreground mb-8">We love working with creators and content strategists. Here's how we can collaborate.</p>

        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          {[
            { icon: Video, title: "Content Creators", desc: "Use our tool in your content and get featured on our platform." },
            { icon: Users, title: "Influencers", desc: "Share Reel Analyzer with your audience and earn exclusive benefits." },
            { icon: PenTool, title: "Guest Writers", desc: "Write for our blog and reach thousands of Instagram creators." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-4 rounded-xl border border-border/50 bg-card/50">
              <Icon className="w-5 h-5 text-primary mb-2" />
              <h3 className="text-xs font-bold text-foreground mb-1">{title}</h3>
              <p className="text-[10px] text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>

        <div className="text-sm text-muted-foreground space-y-4">
          <p>Ready to collaborate? Reach out on WhatsApp with your proposal and social media handles.</p>
          {whatsappNumber && (
            <Button onClick={() => openWhatsApp("Hi! I'm interested in collaborating with Reel Analyzer.")} className="gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white">
              <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
            </Button>
          )}
        </div>
      </div>

      <Footer />
      <MobileBottomNav />
      <WhatsAppButton />
    </div>
  );
};

export default CollaborationPage;
