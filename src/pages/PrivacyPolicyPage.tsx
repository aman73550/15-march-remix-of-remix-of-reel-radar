import SEOHead from "@/components/SEOHead";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicyPage = () => (
  <div className="min-h-screen bg-background text-foreground">
    <SEOHead title="Privacy Policy – Reel Analyzer" description="Read Reel Analyzer's privacy policy to understand how we collect, use, and protect your data." canonical="https://reelsanylizer.in/privacy-policy" />

    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
      </Link>

      <h1 className="text-2xl sm:text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-xs text-muted-foreground mb-8">Last updated: March 15, 2026</p>

      <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-base font-bold text-foreground mb-2">1. Information We Collect</h2>
          <p>We collect information you provide directly, such as Instagram Reel URLs submitted for analysis, contact form submissions, and feedback. We also collect usage data including IP address (hashed), browser type, device information, and session data for analytics purposes.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">2. How We Use Your Information</h2>
          <p>We use collected information to provide and improve our analysis services, respond to inquiries, detect and prevent abuse, generate anonymous usage statistics, and enhance user experience.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">3. Data Storage & Security</h2>
          <p>Your data is stored securely using industry-standard encryption. We do not sell personal information to third parties. Reel URLs are stored for analysis caching and improving our AI models. IP addresses are hashed before storage for privacy.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">4. Cookies & Tracking</h2>
          <p>We use essential cookies to maintain session state and usage limits. We may use analytics tools to understand how users interact with our platform. You can disable cookies in your browser settings.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">5. Third-Party Services</h2>
          <p>We use third-party services for payment processing, AI analysis, and hosting. These services have their own privacy policies. We are not responsible for their data handling practices.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">6. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at our Contact page. We will respond within 30 days.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">7. Changes to This Policy</h2>
          <p>We may update this privacy policy from time to time. Changes will be posted on this page with an updated date.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">8. Contact</h2>
          <p>If you have questions about this Privacy Policy, please visit our <Link to="/contact" className="text-primary hover:underline">Contact page</Link>.</p>
        </section>
      </div>
    </div>

    <Footer />
    <MobileBottomNav />
  </div>
);

export default PrivacyPolicyPage;
