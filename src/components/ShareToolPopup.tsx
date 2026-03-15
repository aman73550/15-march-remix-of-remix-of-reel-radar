import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, X, Copy, Check, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getShareUrl } from "@/lib/trafficTracker";

const SHARE_TEXT = "Check if your Instagram Reel can go viral with this Reel Viral Analyzer.\nPaste your reel link and get a viral probability score instantly.\n\n";

const ShareToolPopup = () => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareOptions = [
    {
      name: "WhatsApp",
      icon: <MessageCircle className="w-5 h-5" />,
      color: "bg-[#25D366]/10 text-[#25D366] border-[#25D366]/20 hover:bg-[#25D366]/20",
      action: () => { const url = getShareUrl("whatsapp"); window.open(`https://wa.me/?text=${encodeURIComponent(SHARE_TEXT + url)}`, "_blank"); },
    },
    {
      name: "Twitter / X",
      icon: <span className="text-base font-bold">𝕏</span>,
      color: "bg-foreground/5 text-foreground border-foreground/10 hover:bg-foreground/10",
      action: () => { const url = getShareUrl("twitter"); window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(url)}`, "_blank"); },
    },
    {
      name: "Facebook",
      icon: <span className="text-base font-bold">f</span>,
      color: "bg-[#1877F2]/10 text-[#1877F2] border-[#1877F2]/20 hover:bg-[#1877F2]/20",
      action: () => { const url = getShareUrl("facebook"); window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank"); },
    },
  ];

  const handleCopy = async () => {
    const url = getShareUrl("copy");
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
        <Button
          variant="outline"
          onClick={() => setOpen(true)}
          className="gap-2 border-border bg-muted/30 hover:bg-muted/50 text-foreground"
        >
          <Share2 className="w-4 h-4" />
          Share This Tool
        </Button>
      </motion.div>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            {/* Popup */}
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <Card className="glass p-6 w-full max-w-sm pointer-events-auto space-y-5 relative">
                <button
                  onClick={() => setOpen(false)}
                  className="absolute top-3 right-3 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="text-center space-y-1">
                  <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-2">
                    <Share2 className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-base">Share This Tool</h3>
                  <p className="text-xs text-muted-foreground">Help your creator friends discover this tool</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {shareOptions.map((opt) => (
                    <motion.button
                      key={opt.name}
                      onClick={opt.action}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-colors ${opt.color}`}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {opt.icon}
                      <span className="text-[10px] font-medium">{opt.name}</span>
                    </motion.button>
                  ))}
                </div>

                {/* Copy Link */}
                <motion.button
                  onClick={handleCopy}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors text-sm"
                  whileTap={{ scale: 0.97 }}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-[hsl(var(--viral-high))]" />
                      <span className="text-[hsl(var(--viral-high))] font-medium text-xs">Link copied. Share it with your friends!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground font-medium text-xs">Copy Link</span>
                    </>
                  )}
                </motion.button>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ShareToolPopup;
