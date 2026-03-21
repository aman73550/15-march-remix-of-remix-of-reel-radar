import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { TrendingUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const StickyCTA = () => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const location = useLocation();

  // Don't show on homepage or admin pages
  const isHomepage = location.pathname === "/";
  const isAdmin = location.pathname.startsWith("/bosspage");

  useEffect(() => {
    if (isHomepage || isAdmin || dismissed) return;

    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomepage, isAdmin, dismissed]);

  if (!visible || isHomepage || isAdmin || dismissed) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-4">
      <div className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-full shadow-lg">
        <Link to="/">
          <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10 font-semibold text-xs h-8 px-3">
            <TrendingUp className="w-3.5 h-3.5 mr-1.5" /> Analyze Your Reel Now
          </Button>
        </Link>
        <button onClick={() => setDismissed(true)} className="p-1 hover:bg-primary-foreground/10 rounded-full">
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default StickyCTA;
