import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Activity, BarChart3 } from "lucide-react";

// --- Smooth drift: number changes by small ±delta, not random jumps ---
function useDriftingCount(base: number, range: number, intervalMs: number) {
  const [count, setCount] = useState(base);
  useEffect(() => {
    const id = setInterval(() => {
      setCount((prev) => {
        // Drift by ±1 to ±5% of range, stay within bounds
        const maxStep = Math.max(1, Math.floor(range * 0.06));
        const delta = Math.floor(Math.random() * maxStep * 2) - maxStep;
        const next = prev + delta;
        const min = base - range;
        const max = base + range;
        return Math.min(max, Math.max(min, next));
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [base, range, intervalMs]);
  return count;
}

// --- Activity Feed ---
const CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune", "Chennai",
  "Kolkata", "Jaipur", "Lucknow", "Ahmedabad", "Chandigarh", "Indore",
  "Surat", "Nagpur", "Patna", "Bhopal", "Kochi", "Goa",
  "Noida", "Gurgaon", "Vadodara", "Ranchi", "Dehradun", "Mysore",
  "Dubai", "London", "New York", "Toronto", "Singapore", "Sydney",
  "Los Angeles", "San Francisco", "Berlin", "Tokyo", "Jakarta",
  "Kuala Lumpur", "Bangkok", "Riyadh", "Doha", "Amsterdam",
];
const ROLES = ["creator", "marketer", "influencer", "brand strategist", "content creator", "social media manager", "blogger"];
const ACTIONS = [
  "analyzed a reel",
  "checked viral potential",
  "ran a reel analysis",
  "tested a reel",
];

function generateEntry() {
  const city = CITIES[Math.floor(Math.random() * CITIES.length)];
  const role = ROLES[Math.floor(Math.random() * ROLES.length)];
  const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
  const seconds = Math.floor(Math.random() * 55) + 3;
  return {
    id: Date.now() + Math.random(),
    text: `A ${role} from ${city} ${action}`,
    time: `${seconds}s ago`,
  };
}

// --- Reels Counter: time-based organic growth ---
const BASE_COUNT = 48750;
const STORAGE_KEY = "rva_reel_counter";
const COUNTER_TS_KEY = "rva_counter_ts";

function getStoredCount(): number {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    const ts = localStorage.getItem(COUNTER_TS_KEY);
    if (v && ts) {
      const stored = parseInt(v, 10);
      const elapsed = Date.now() - parseInt(ts, 10);
      // Grow ~2-4 per minute organically based on time elapsed
      const organic = Math.floor(elapsed / 1000 / 60 * (2 + Math.random() * 2));
      const total = Math.max(BASE_COUNT, stored + organic);
      // Save updated
      localStorage.setItem(STORAGE_KEY, String(total));
      localStorage.setItem(COUNTER_TS_KEY, String(Date.now()));
      return total;
    }
  } catch {}
  try {
    localStorage.setItem(STORAGE_KEY, String(BASE_COUNT));
    localStorage.setItem(COUNTER_TS_KEY, String(Date.now()));
  } catch {}
  return BASE_COUNT;
}

function tickCounter(): number {
  try {
    const current = parseInt(localStorage.getItem(STORAGE_KEY) || String(BASE_COUNT), 10);
    // Add 1-3 randomly per tick
    const bump = Math.floor(Math.random() * 3) + 1;
    const next = current + bump;
    localStorage.setItem(STORAGE_KEY, String(next));
    localStorage.setItem(COUNTER_TS_KEY, String(Date.now()));
    return next;
  } catch {}
  return BASE_COUNT;
}

// --- Components ---

export const LiveActivityIndicator = () => {
  // Drift around 2200 ± 800, small steps every 8-12s
  const count = useDriftingCount(2200, 800, 8000 + Math.random() * 4000);

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
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {count.toLocaleString()}
        </motion.span>
        {" "}creators analyzing reels right now
      </span>
    </motion.div>
  );
};

export const ReelsAnalyzedCounter = () => {
  const [count, setCount] = useState(getStoredCount);

  // Tick every 15-45s with small random bumps
  useEffect(() => {
    const tick = () => {
      setCount(tickCounter());
    };
    const id = setInterval(tick, 15000 + Math.random() * 30000);
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

  useEffect(() => {
    // Vary interval between 4-9 seconds for natural feel
    let timeout: ReturnType<typeof setTimeout>;
    const scheduleNext = () => {
      const delay = 4000 + Math.random() * 5000;
      timeout = setTimeout(() => {
        setEntries((prev) => [generateEntry(), ...prev].slice(0, 4));
        scheduleNext();
      }, delay);
    };
    scheduleNext();
    return () => clearTimeout(timeout);
  }, []);

  return (
    <motion.div
      className="overflow-hidden max-h-[72px] space-y-1 px-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2 }}
    >
      <AnimatePresence initial={false}>
        {entries.slice(0, 3).map((entry) => (
          <motion.div
            key={entry.id}
            className="flex items-center justify-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] text-muted-foreground text-center flex-wrap"
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
