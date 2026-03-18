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

// Real Indian names + global, varied cities, natural messy actions
const FIRST_NAMES = [
  "Priya", "Arjun", "Sneha", "Rahul", "Meera", "Vikram", "Ananya", "Rohit",
  "Divya", "Karan", "Nisha", "Amit", "Pooja", "Raj", "Shreya", "Aditya",
  "Sarah", "Mike", "Jessica", "David", "Emma", "James", "Lisa", "Tom",
  "Fatima", "Ali", "Carlos", "Ana", "Yuki", "Chen", "Ritu", "Manish",
  "Kavita", "Harsh", "Simran", "Neha", "Deepak", "Aarti", "Suresh", "Mohit",
  "Gaurav", "Komal", "Sameer", "Tanya", "Kunal", "Swati", "Nikhil", "Pallavi",
  "Naveen", "Megha", "Vishal", "Divya", "Kriti", "Varun", "Sanya", "Tanvi",
];
const CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Pune", "Chennai", "Hyderabad",
  "Kolkata", "Jaipur", "Ahmedabad", "Surat", "Lucknow", "Indore",
  "Chandigarh", "Noida", "Gurgaon", "Kochi", "Goa", "Nagpur",
  "Patna", "Ranchi", "Bhopal", "Varanasi", "Thane", "Vizag",
  "Dubai", "London", "New York", "Toronto", "Singapore", "Sydney",
  "São Paulo", "Berlin", "Tokyo", "Auckland", "Lagos", "Riyadh",
];

// Natural varied actions — some with scores, some casual, some with typos
const ACTIONS = [
  "just analyzed a reel",
  "got 76% viral score 🔥",
  "scored 72% on a new reel",
  "got 68% on cooking reel",
  "scored 81% on dance reel",
  "checked hook strength",
  "optimized hashtags",
  "downloaded the PDF report",
  "tested caption quality",
  "improved hook score to 8",
  "analyzed trending format",
  "checked viral potential",
  "got caption score 7/10",
  "fixed weak hook intro",
  "compared 2 caption versions",
  "ran hashtag check",
  "scored 74% on fitness reel",
  "got engagement tips",
  "tested reel before posting",
  "got master report",
  "got 69% on tutorial reel",
  "improved viral score by 12%",
  "re-analyzed after edits",
  "checked trend matching",
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

// --- Today's Reels Counter (resets daily, drifts naturally) ---
const TODAY_COUNTER_KEY = "rva_today_counter";
const TODAY_DATE_KEY = "rva_today_date";

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function getTodayCount(): number {
  try {
    const storedDate = localStorage.getItem(TODAY_DATE_KEY);
    const today = getTodayString();
    if (storedDate === today) {
      return parseInt(localStorage.getItem(TODAY_COUNTER_KEY) || "320", 10);
    }
    // New day — reset with random base
    const base = 280 + Math.floor(Math.random() * 150);
    localStorage.setItem(TODAY_DATE_KEY, today);
    localStorage.setItem(TODAY_COUNTER_KEY, String(base));
    return base;
  } catch {}
  return 320;
}

function tickTodayCounter(): number {
  try {
    const today = getTodayString();
    const storedDate = localStorage.getItem(TODAY_DATE_KEY);
    if (storedDate !== today) {
      const base = 280 + Math.floor(Math.random() * 150);
      localStorage.setItem(TODAY_DATE_KEY, today);
      localStorage.setItem(TODAY_COUNTER_KEY, String(base));
      return base;
    }
    const current = parseInt(localStorage.getItem(TODAY_COUNTER_KEY) || "320", 10);
    const bump = Math.floor(Math.random() * 3) + 1;
    const next = current + bump;
    localStorage.setItem(TODAY_COUNTER_KEY, String(next));
    return next;
  } catch {}
  return 320;
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
  const [count, setCount] = useState(getTodayCount);
  useEffect(() => {
    const tick = () => setCount(tickTodayCounter());
    const id = setInterval(tick, 12000 + Math.random() * 20000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div className="flex items-center justify-center gap-2 text-xs text-muted-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
      <BarChart3 className="w-3.5 h-3.5 text-primary" />
      <span>
        Today analyzed{" "}
        <span className="font-bold text-foreground">{count.toLocaleString()}</span>
        {" "}reels
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
  </motion.div>
);

export default SocialProofSection;
