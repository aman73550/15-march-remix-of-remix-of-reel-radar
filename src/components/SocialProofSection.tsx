import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, BarChart3 } from "lucide-react";

function useDriftingCount(base: number, range: number, intervalMs: number) {
  const [count, setCount] = useState(base);
  useEffect(() => {
    const id = setInterval(() => {
      setCount((prev) => {
        const maxStep = Math.max(1, Math.floor(range * 0.06));
        const delta = Math.floor(Math.random() * maxStep * 2) - maxStep;
        return Math.min(base + range, Math.max(base - range, prev + delta));
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [base, range, intervalMs]);
  return count;
}

// --- Names, cities, and actions pools expanded for more natural variety ---
const FIRST_NAMES = [
  "Priya", "Arjun", "Sneha", "Rahul", "Meera", "Vikram", "Ananya", "Rohit",
  "Divya", "Karan", "Nisha", "Amit", "Pooja", "Raj", "Shreya", "Aditya",
  "Sarah", "Mike", "Jessica", "David", "Emma", "James", "Lisa", "Tom",
  "Fatima", "Ali", "Carlos", "Ana", "Yuki", "Chen", "Ritu", "Manish",
  "Kavita", "Harsh", "Simran", "Neha", "Deepak", "Aarti", "Suresh", "Mohit",
  "Brandon", "Rachel", "Chris", "Sofia", "Diego", "Isabella", "Marcus", "Ben",
  "Omar", "Liam", "Anna", "Kriti", "Varun", "Sanya", "Tanvi", "Ananya",
];
const CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Pune", "Chennai", "Hyderabad",
  "Kolkata", "Jaipur", "Ahmedabad", "Surat", "Lucknow", "Indore",
  "Chandigarh", "Noida", "Gurgaon", "Kochi", "Goa", "Nagpur",
  "Dubai", "London", "New York", "Toronto", "Singapore", "Sydney",
  "Los Angeles", "Berlin", "Tokyo", "Bangkok", "São Paulo", "Amsterdam",
  "Auckland", "Milan", "Chicago", "Vancouver", "Dublin", "Riyadh",
];

// More natural, specific actions with scores/results embedded
const ACTIONS = [
  "just analyzed a reel",
  "got 76% viral score",
  "got 72% viral prediction",
  "got 68% on a cooking reel",
  "scored 80% on dance reel",
  "checked hook strength",
  "optimized hashtags for better reach",
  "downloaded analysis report",
  "tested caption quality",
  "improved hook score from 5 to 8",
  "analyzed trending reel format",
  "checked viral potential",
  "got caption score 7/10",
  "fixed weak hook intro",
  "compared 2 caption versions",
  "ran hashtag competition check",
  "scored 74% on fitness reel",
  "got engagement tips",
  "tested new reel before posting",
  "unlocked master report",
  "analyzed competitor's reel",
  "got 69% on tutorial reel",
  "improved viral score by 12%",
];

function generateEntry() {
  const name = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const city = CITIES[Math.floor(Math.random() * CITIES.length)];
  const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
  const seconds = Math.floor(Math.random() * 55) + 3;
  return {
    id: Date.now() + Math.random(),
    text: `${name} from ${city} ${action}`,
    time: `${seconds}s ago`,
  };
}

// --- Reels Counter ---
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
      const organic = Math.floor(elapsed / 1000 / 60 * (2 + Math.random() * 2));
      const total = Math.max(BASE_COUNT, stored + organic);
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
  const count = useDriftingCount(2200, 800, 8000 + Math.random() * 4000);
  return (
    <motion.div className="flex items-center justify-center gap-2 text-xs text-muted-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--viral-high))]/60" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[hsl(var(--viral-high))]" />
      </span>
      <span>
        <motion.span key={count} className="font-bold text-foreground inline-block" initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
          {count.toLocaleString()}
        </motion.span>
        {" "}creators analyzing reels right now
      </span>
    </motion.div>
  );
};

export const ReelsAnalyzedCounter = () => {
  const [count, setCount] = useState(getStoredCount);
  useEffect(() => {
    const tick = () => setCount(tickCounter());
    const id = setInterval(tick, 15000 + Math.random() * 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div className="flex items-center justify-center gap-2 text-xs text-muted-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
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
    <motion.div className="overflow-hidden max-h-[72px] space-y-1 px-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
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
  <motion.p className="text-[11px] text-muted-foreground text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
    Trusted by 48,000+ Instagram creators worldwide
  </motion.p>
);

const SocialProofSection = () => (
  <motion.div className="relative z-10 max-w-xl mx-auto px-4 py-4 space-y-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.5 }}>
    <LiveActivityIndicator />
    <ReelsAnalyzedCounter />
    <ActivityFeed />
  </motion.div>
);

export default SocialProofSection;
