import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Activity, BarChart3 } from "lucide-react";

// --- Live Activity Count ---
function useLiveCount(min: number, max: number, intervalMs: number) {
  const [count, setCount] = useState(
    () => Math.floor(Math.random() * (max - min + 1)) + min
  );
  useEffect(() => {
    const id = setInterval(() => {
      setCount(Math.floor(Math.random() * (max - min + 1)) + min);
    }, intervalMs);
    return () => clearInterval(id);
  }, [min, max, intervalMs]);
  return count;
}

// --- Activity Feed ---
const CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune", "Chennai",
  "Kolkata", "Jaipur", "Lucknow", "Ahmedabad", "Chandigarh", "Indore",
  "Surat", "Nagpur", "Patna", "Bhopal", "Kochi", "Goa",
];
const ROLES = ["creator", "marketer", "influencer", "brand", "content strategist"];

function generateEntry() {
  const city = CITIES[Math.floor(Math.random() * CITIES.length)];
  const role = ROLES[Math.floor(Math.random() * ROLES.length)];
  const seconds = Math.floor(Math.random() * 55) + 3;
  return {
    id: Date.now() + Math.random(),
    text: `A ${role} from ${city} analyzed a reel`,
    time: `${seconds}s ago`,
  };
}

// --- Reels Counter ---
const BASE_COUNT = 48750;
const STORAGE_KEY = "rva_reel_counter";

function getStoredCount(): number {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v) return Math.max(BASE_COUNT, parseInt(v, 10));
  } catch {}
  return BASE_COUNT;
}

function incrementStoredCount() {
  const current = getStoredCount();
  const next = current + 1;
  try { localStorage.setItem(STORAGE_KEY, String(next)); } catch {}
  return next;
}

// --- Components ---

export const LiveActivityIndicator = () => {
  const count = useLiveCount(8, 35, 12000);

  return (
    <motion.div
      className="flex items-center justify-center gap-2 text-xs text-muted-foreground"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--viral-high))]/60" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[hsl(var(--viral-high))]" />
      </span>
      <span>
        <motion.span
          key={count}
          className="font-bold text-foreground inline-block"
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {count}
        </motion.span>
        {" "}creators analyzing reels right now
      </span>
    </motion.div>
  );
};

export const ReelsAnalyzedCounter = () => {
  const [count, setCount] = useState(getStoredCount);

  // Slow organic increment every 30-60s
  useEffect(() => {
    const id = setInterval(() => {
      const next = incrementStoredCount();
      setCount(next);
    }, (Math.random() * 30000) + 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      className="flex items-center justify-center gap-2 text-xs text-muted-foreground"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
    >
      <BarChart3 className="w-3.5 h-3.5 text-primary" />
      <span>
        <span className="font-bold text-foreground">{count.toLocaleString()}</span>
        {" "}reels analyzed with this tool
      </span>
    </motion.div>
  );
};

export const ActivityFeed = () => {
  const [entries, setEntries] = useState(() => [generateEntry(), generateEntry(), generateEntry()]);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setEntries((prev) => {
        const next = [generateEntry(), ...prev];
        return next.slice(0, 4);
      });
    }, 6000);
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <motion.div
      className="overflow-hidden max-h-[72px] space-y-1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2 }}
    >
      <AnimatePresence initial={false}>
        {entries.slice(0, 3).map((entry) => (
          <motion.div
            key={entry.id}
            className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Activity className="w-2.5 h-2.5 text-primary/50 flex-shrink-0" />
            <span>{entry.text}</span>
            <span className="text-muted-foreground/50">– {entry.time}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export const SocialProofBadge = () => (
  <motion.p
    className="text-[11px] text-muted-foreground text-center"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.6 }}
  >
    Used by Instagram creators to check reel performance potential
  </motion.p>
);

const SocialProofSection = () => (
  <motion.div
    className="relative z-10 max-w-xl mx-auto px-4 py-4 space-y-3"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.7, duration: 0.5 }}
  >
    <LiveActivityIndicator />
    <ReelsAnalyzedCounter />
    <ActivityFeed />
  </motion.div>
);

export default SocialProofSection;
