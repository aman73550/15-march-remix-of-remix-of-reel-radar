import { Link } from "react-router-dom";
import { Search } from "lucide-react";

const FOOTER_LINKS = {
  company: [
    { path: "/about", label: "About Us" },
    { path: "/contact", label: "Contact Us" },
    { path: "/partnership", label: "Partnership" },
    { path: "/collaboration", label: "Collaboration" },
    { path: "/promotion", label: "Promotion" },
  ],
  legal: [
    { path: "/privacy-policy", label: "Privacy Policy" },
    { path: "/terms", label: "Terms & Conditions" },
    { path: "/sitemap-page", label: "Sitemap" },
  ],
  tools: [
    { path: "/", label: "Reel Analyzer" },
    { path: "/seo-optimizer", label: "SEO Optimizer" },
    { path: "/reel-hashtag-generator", label: "Hashtag Generator" },
    { path: "/reel-viral-checker", label: "Viral Checker" },
  ],
};

const Footer = () => (
  <footer className="relative z-10 mt-12 sm:mt-16 border-t border-border bg-secondary/30">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Top: Logo + links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
        {/* Brand */}
        <div className="col-span-2 sm:col-span-1">
          <Link to="/" className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg gradient-primary-bg flex items-center justify-center">
              <Search className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground text-sm">Reel<span className="gradient-primary">Analyzer</span></span>
          </Link>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">
            AI-powered Instagram Reel analysis and optimization tools for creators.
          </p>
        </div>

        {/* Company */}
        <div>
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">Company</h3>
          <ul className="space-y-2">
            {FOOTER_LINKS.company.map((l) => (
              <li key={l.path}>
                <Link to={l.path} className="text-xs text-muted-foreground hover:text-primary transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">Legal</h3>
          <ul className="space-y-2">
            {FOOTER_LINKS.legal.map((l) => (
              <li key={l.path}>
                <Link to={l.path} className="text-xs text-muted-foreground hover:text-primary transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Tools */}
        <div>
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">Tools</h3>
          <ul className="space-y-2">
            {FOOTER_LINKS.tools.map((l) => (
              <li key={l.path}>
                <Link to={l.path} className="text-xs text-muted-foreground hover:text-primary transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="border-t border-border pt-6 space-y-2 text-center">
        <p className="text-[10px] leading-relaxed text-muted-foreground/70 max-w-xl mx-auto">
          This tool provides AI-based estimates of Instagram Reel performance. The viral probability score is an estimate and does not guarantee actual performance. Not affiliated with Instagram or Meta Platforms, Inc.
        </p>
        <p className="text-[10px] text-muted-foreground/50">
          © {new Date().getFullYear()} Reel Analyzer. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
