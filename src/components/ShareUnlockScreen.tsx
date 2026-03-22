import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, MessageCircle, Copy, Check, Gift, Share2 } from "lucide-react";
import { recordShare, getShareCount, SHARE_REQUIRED, hasUnlockedBonus, BONUS_ANALYSES } from "@/lib/usageTracker";
import { getShareUrl } from "@/lib/trafficTracker";

interface Props {
  onUnlocked: () => void;
}

const SHARE_TEXT = "I just tested my Instagram reel here.\nCheck if your reel can go viral with this Reel Viral Analyzer.\nPaste your reel link and get a viral probability score instantly.\n\n";

const ShareUnlockScreen = ({ onUnlocked }: Props) => {
  const [shareCount, setShareCount] = useState(getShareCount());
  const [copied, setCopied] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const handleShare = (platform: string) => {
    const shareUrl = getShareUrl(platform);
    const msg = encodeURIComponent(SHARE_TEXT + shareUrl);

    switch (platform) {
      case "whatsapp":
        window.open(`https://wa.me/?text=${msg}`, "_blank");
        break;
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(shareUrl)}`, "_blank");
        break;
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
        break;
      case "copy":
        navigator.clipboard.writeText(shareUrl).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        break;
    }

    const newCount = recordShare();
    setShareCount(newCount);

    if (hasUnlockedBonus()) {
      setUnlocked(true);
      setTimeout(() => onUnlocked(), 2000);
    }
  };

  const remaining = Math.max(0, SHARE_REQUIRED - shareCount);
  const progress = Math.min(100, (shareCount / SHARE_REQUIRED) * 100);

  const shareButtons = [
    { id: "whatsapp", name: "WhatsApp", icon: <MessageCircle className="w-5 h-5" />, color: "bg-[#25D366]/10 text-[#25D366] border-[#25D366]/20 hover:bg-[#25D366]/20" },
    { id: "twitter", name: "Twitter / X", icon: <span className="text-base font-bold">𝕏</span>, color: "bg-foreground/5 text-foreground border-foreground/10 hover:bg-foreground/10" },
    { id: "facebook", name: "Facebook", icon: <span className="text-base font-bold">f</span>, color: "bg-[#1877F2]/10 text-[#1877F2] border-[#1877F2]/20 hover:bg-[#1877F2]/20" },
  ];

  return (
    <motion.div className="relative z-10 max-w-xl mx-auto px-4 py-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <AnimatePresence mode="wait">
        {unlocked ? (
          <motion.div key="unlocked" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <Card className="glass p-8 text-center space-y-4">
              <motion.div className="mx-auto w-16 h-16 rounded-full bg-[hsl(var(--viral-high))]/10 border border-[hsl(var(--viral-high))]/20 flex items-center justify-center" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6 }}>
                <Gift className="w-8 h-8 text-[hsl(var(--viral-high))]" />
              </motion.div>
              <h3 className="text-lg font-bold text-foreground">Thank you for sharing!</h3>
              <p className="text-sm text-muted-foreground">You have unlocked <span className="font-bold text-foreground">{BONUS_ANALYSES} more free analyses</span>.</p>
            </Card>
          </motion.div>
        ) : (
          <motion.div key="locked" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="glass p-6 space-y-5">
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-[hsl(var(--viral-mid))]/10 border border-[hsl(var(--viral-mid))]/20 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-[hsl(var(--viral-mid))]" />
                </div>
                <h3 className="text-base font-bold text-foreground">You've used your free analyses</h3>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  To unlock <span className="font-bold text-foreground">2 more reel analyses</span>, please share this tool with at least <span className="font-bold text-foreground">3-5 friends</span>.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Shares completed</span>
                  <span className="font-bold text-foreground">{shareCount} / {SHARE_REQUIRED}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--viral-mid))] to-[hsl(var(--viral-high))]" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
                </div>
                {remaining > 0 && <p className="text-[10px] text-muted-foreground text-center">{remaining} more share{remaining !== 1 ? "s" : ""} needed</p>}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {shareButtons.map((btn) => (
                  <motion.button key={btn.id} onClick={() => handleShare(btn.id)} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-colors ${btn.color}`} whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
                    {btn.icon}
                    <span className="text-[10px] font-medium">{btn.name}</span>
                  </motion.button>
                ))}
              </div>
              <motion.button onClick={() => handleShare("copy")} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors text-sm" whileTap={{ scale: 0.97 }}>
                {copied ? (<><Check className="w-4 h-4 text-[hsl(var(--viral-high))]" /><span className="text-[hsl(var(--viral-high))] font-medium text-xs">Link copied!</span></>) : (<><Copy className="w-4 h-4 text-muted-foreground" /><span className="text-foreground font-medium text-xs">Copy Link</span></>)}
              </motion.button>
              <p className="text-[10px] text-center text-muted-foreground">Each button click counts as 1 share.</p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ShareUnlockScreen;
