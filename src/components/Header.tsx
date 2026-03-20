import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Menu, X } from "lucide-react";
import { useState } from "react";

const NAV_LINKS = [
  { path: "/", label: "Analyzer" },
  { path: "/seo-optimizer", label: "SEO Optimizer" },
  { path: "/blog", label: "Blog" },
  { path: "/about", label: "About" },
  { path: "/contact", label: "Contact" },
];

const Header = ({ onCTAClick }: { onCTAClick?: () => void }) => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 sm:h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary-bg flex items-center justify-center">
            <Search className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground text-base sm:text-lg tracking-tight">Reel<span className="gradient-primary">Analyzer</span></span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === l.path ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <button
          onClick={onCTAClick}
          className="hidden md:inline-flex px-4 py-2 rounded-lg gradient-primary-bg text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Analyze Reel
        </button>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 text-foreground" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          className="md:hidden bg-background border-b border-border px-4 pb-4"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
        >
          <nav className="flex flex-col gap-3 pt-2">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.path}
                to={l.path}
                onClick={() => setMobileOpen(false)}
                className={`text-sm font-medium py-1 ${
                  location.pathname === l.path ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <button
              onClick={() => { setMobileOpen(false); onCTAClick?.(); }}
              className="mt-1 px-4 py-2.5 rounded-lg gradient-primary-bg text-primary-foreground text-sm font-semibold text-center"
            >
              Analyze Reel
            </button>
          </nav>
        </motion.div>
      )}
    </header>
  );
};

export default Header;
