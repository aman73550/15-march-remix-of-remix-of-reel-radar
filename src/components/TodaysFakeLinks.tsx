import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Users } from "lucide-react";

// Generate deterministic fake links based on date
function generateFakeLinks() {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const usernames = ["@viral_queen", "@reels_master", "@trend_setter", "@content_king", "@insta_pro", "@reel_guru", "@creator_x", "@digi_star"];
  const statuses = ["Fake Engagement", "Bot Views", "Fake Likes", "Bot Comments", "Inflated Saves"];

  const links = [];
  for (let i = 0; i < 5; i++) {
    const idx = (seed + i * 7) % usernames.length;
    const statusIdx = (seed + i * 3) % statuses.length;
    const fakeId = `C${String((seed * (i + 1)) % 99999).padStart(5, "0")}${String.fromCharCode(65 + (i % 26))}`;
    links.push({
      user: usernames[idx],
      reelId: fakeId,
      status: statuses[statusIdx],
      confidence: 75 + ((seed + i) % 20),
    });
  }
  return links;
}

function getTodayUserCount() {
  const h = new Date().getHours();
  return 120 + h * 8 + Math.floor(Math.random() * 15);
}

const TodaysFakeLinks = () => {
  const [links] = useState(generateFakeLinks);
  const [userCount, setUserCount] = useState(getTodayUserCount);

  useEffect(() => {
    const id = setInterval(() => setUserCount((p) => p + Math.floor(Math.random() * 3)), 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      className="relative z-10 max-w-2xl mx-auto px-3 py-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
    >
      <Card className="glass p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[hsl(var(--viral-mid))]" />
            <h3 className="text-xs font-semibold text-foreground">Today's Fake Reel Analysis Report</h3>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Users className="w-3 h-3" />
            <span>Today's Users: <span className="font-bold text-foreground">{userCount}</span></span>
          </div>
        </div>

        <div className="space-y-1.5">
          {links.map((link, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-1.5 px-2 rounded-md bg-muted/20 text-[10px]"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-muted-foreground">{link.user}</span>
                <span className="text-muted-foreground/40 font-mono select-none blur-[2px]">
                  instagram.com/reel/{link.reelId}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-medium text-[9px]">
                  {link.status}
                </span>
                <span className="text-muted-foreground">{link.confidence}%</span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[8px] text-muted-foreground/50 text-center">
          Links are masked for privacy • Auto-detected by our AI system
        </p>
      </Card>
    </motion.div>
  );
};

export default TodaysFakeLinks;
