import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X, LogIn, LogOut, Coins, History, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const { user, credits, maxCredits, signInWithGoogle, signOut, analyses, loading } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
      if (historyRef.current && !historyRef.current.contains(e.target as Node)) setHistoryOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const userInitial = user?.user_metadata?.full_name?.[0] || user?.email?.[0] || "U";
  const userAvatar = user?.user_metadata?.avatar_url;
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  const maskUrl = (url: string) => {
    const match = url.match(/\/(reel|reels|p)\/([^/?]+)/);
    if (match) return `reel/${match[2].slice(0, 4)}...${match[2].slice(-3)}`;
    return url.slice(0, 25) + "...";
  };

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

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* History button (logged in only, desktop) */}
          {user && analyses.length > 0 && (
            <div className="relative hidden sm:block" ref={historyRef}>
              <button
                onClick={() => setHistoryOpen(!historyOpen)}
                className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                title="Analysis History"
              >
                <History className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {historyOpen && (
                  <motion.div
                    className="absolute right-0 top-full mt-2 w-72 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50"
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  >
                    <div className="px-4 py-3 border-b border-border bg-muted/30">
                      <p className="text-xs font-semibold text-foreground">Recent Analyses</p>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {analyses.slice(0, 5).map((a: any) => (
                        <div key={a.id} className="px-4 py-2.5 border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <p className="text-xs font-medium text-foreground truncate">{maskUrl(a.reel_url)}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(a.created_at).toLocaleDateString()}
                            </span>
                            {a.viral_score != null && (
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                a.viral_score >= 80 ? "bg-green-500/10 text-green-600" :
                                a.viral_score >= 60 ? "bg-yellow-500/10 text-yellow-600" :
                                "bg-red-500/10 text-red-600"
                              }`}>
                                {a.viral_score}/100
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* User area */}
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 p-1 rounded-full hover:bg-muted transition-colors"
              >
                {userAvatar ? (
                  <img src={userAvatar} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-primary/30" />
                ) : (
                  <div className="w-8 h-8 rounded-full gradient-primary-bg flex items-center justify-center text-primary-foreground text-xs font-bold">
                    {userInitial.toUpperCase()}
                  </div>
                )}
                <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50"
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  >
                    <div className="px-4 py-3 border-b border-border bg-muted/30">
                      <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <div className="px-4 py-2.5 border-b border-border">
                      <div className="flex items-center gap-2">
                        <Coins className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs text-foreground font-medium">{credits} / {maxCredits} credits</span>
                      </div>
                      <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full gradient-primary-bg transition-all"
                          style={{ width: `${(credits / maxCredits) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Mobile history */}
                    {analyses.length > 0 && (
                      <div className="sm:hidden border-b border-border">
                        <div className="px-4 py-2 text-[10px] font-semibold text-muted-foreground uppercase">Recent</div>
                        {analyses.slice(0, 3).map((a: any) => (
                          <div key={a.id} className="px-4 py-2 hover:bg-muted/30">
                            <p className="text-[11px] text-foreground truncate">{maskUrl(a.reel_url)}</p>
                            <span className="text-[10px] text-muted-foreground">{a.viral_score != null ? `Score: ${a.viral_score}` : ""}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => { signOut(); setUserMenuOpen(false); }}
                      className="w-full px-4 py-2.5 text-left text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-sm font-medium text-foreground transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Login</span>
            </button>
          )}

          {/* Mobile hamburger */}
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 text-foreground" />}
          </button>
        </div>
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
