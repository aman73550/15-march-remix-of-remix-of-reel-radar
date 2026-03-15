import { Link } from "react-router-dom";

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
  <footer className="relative z-10 mt-12 sm:mt-16 border-t border-border/40">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Links Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8 mb-8">
        {/* Company */}
        <div>
          <h3 className="text-[11px] sm:text-xs font-bold text-foreground uppercase tracking-wider mb-3">Company</h3>
          <ul className="space-y-2">
            {FOOTER_LINKS.company.map((l) => (
              <li key={l.path}>
                <Link to={l.path} className="text-[10px] sm:text-xs text-muted-foreground hover:text-primary transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {/* Legal */}
        <div>
          <h3 className="text-[11px] sm:text-xs font-bold text-foreground uppercase tracking-wider mb-3">Legal</h3>
          <ul className="space-y-2">
            {FOOTER_LINKS.legal.map((l) => (
              <li key={l.path}>
                <Link to={l.path} className="text-[10px] sm:text-xs text-muted-foreground hover:text-primary transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {/* Tools */}
        <div className="col-span-2 sm:col-span-1">
          <h3 className="text-[11px] sm:text-xs font-bold text-foreground uppercase tracking-wider mb-3">Tools</h3>
          <ul className="space-y-2">
            {FOOTER_LINKS.tools.map((l) => (
              <li key={l.path}>
                <Link to={l.path} className="text-[10px] sm:text-xs text-muted-foreground hover:text-primary transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="border-t border-border/30 pt-6 space-y-2 text-center">
        <p className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">Disclaimer</p>
        <p className="text-[9px] sm:text-[10px] leading-relaxed text-muted-foreground/50 max-w-lg mx-auto">
          This tool provides AI-based estimates and analysis of Instagram Reel performance using publicly available data and predictive algorithms. The viral probability score is only an estimate and does not guarantee actual performance or reach. This website is not affiliated with, endorsed by, or officially connected to Instagram or Meta Platforms, Inc.
        </p>
        <p className="text-[8px] sm:text-[9px] text-muted-foreground/40">
          © {new Date().getFullYear()} Reel Analyzer. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
