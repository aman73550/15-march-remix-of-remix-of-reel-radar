import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

const FOOTER_LINKS = {
  tools: [
    { path: "/", label: "Reel Analyzer" },
    { path: "/seo-optimizer", label: "SEO Optimizer" },
    { path: "/reel-hashtag-generator", label: "Hashtag Generator" },
    { path: "/reel-viral-checker", label: "Viral Checker" },
    { path: "/reel-caption-generator", label: "Caption Generator" },
  ],
  company: [
    { path: "/about", label: "About Us" },
    { path: "/contact", label: "Contact" },
    { path: "/partnership", label: "Partnership" },
    { path: "/collaboration", label: "Collaboration" },
    { path: "/promotion", label: "Promotion" },
  ],
  resources: [
    { path: "/blog", label: "Blog" },
    { path: "/privacy-policy", label: "Privacy Policy" },
    { path: "/terms", label: "Terms & Conditions" },
    { path: "/sitemap-page", label: "Sitemap" },
  ],
};

const Footer = () => (
  <footer className="relative z-10 mt-16 border-t border-border/30 bg-card/30 backdrop-blur-sm">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Top — Brand + Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-10 mb-10">
        {/* Brand column */}
        <div className="col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg gradient-primary-bg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold text-foreground tracking-tight">ReelAnalyzer</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">
            AI-powered Instagram Reel analysis trusted by 48,000+ creators worldwide.
          </p>
        </div>

        {/* Tools */}
        <div>
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Tools</h3>
          <ul className="space-y-2">
            {FOOTER_LINKS.tools.map((l) => (
              <li key={l.path}>
                <Link to={l.path} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Company</h3>
          <ul className="space-y-2">
            {FOOTER_LINKS.company.map((l) => (
              <li key={l.path}>
                <Link to={l.path} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Resources</h3>
          <ul className="space-y-2">
            {FOOTER_LINKS.resources.map((l) => (
              <li key={l.path}>
                <Link to={l.path} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-[11px] text-muted-foreground/60">
          © {new Date().getFullYear()} ReelAnalyzer. All rights reserved.
        </p>
        <p className="text-[10px] text-muted-foreground/40 text-center max-w-lg">
          This tool provides AI-based estimates. Not affiliated with Instagram or Meta Platforms, Inc.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
