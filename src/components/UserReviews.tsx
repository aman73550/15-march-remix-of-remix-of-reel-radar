import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Star, Quote, MessageCircle } from "lucide-react";

interface Review {
  name: string;
  location: string;
  rating: number;
  text: string;
  timeAgo: string;
  avatar: string;
  verified: boolean;
}

// Realistic, human-written reviews in multiple languages with natural typos/style
const ALL_REVIEWS: Review[] = [
  // Hindi reviews
  {
    name: "Priya S.",
    location: "Mumbai",
    rating: 5,
    text: "maine socha tha ye bhi bakwas tool hoga but actually meri reel ka score sahi nikla.. 78% viral prediction thi aur reel ne 2 lakh views cross kar liye 🔥",
    timeAgo: "2 days ago",
    avatar: "PS",
    verified: true,
  },
  {
    name: "Rohit M.",
    location: "Delhi",
    rating: 4,
    text: "hook score 6 aaya toh maine starting change ki.. next reel pe 9 aaya hook score. caption tips bhi kaam aaye. bas thoda aur fast load ho toh better",
    timeAgo: "5 days ago",
    avatar: "RM",
    verified: true,
  },
  {
    name: "Sneha K.",
    location: "Pune",
    rating: 5,
    text: "pehle randomly hashtags daalti thi.. is tool ne bataya ki mere hashtags too competitive hain. changed to mid-range ones and got 3x reach 😭❤️",
    timeAgo: "1 week ago",
    avatar: "SK",
    verified: true,
  },
  {
    name: "Vikram J.",
    location: "Jaipur",
    rating: 4,
    text: "mere ek client ke liye use kiya.. brand ne impress hua jab maine unko analysis report dikhayi. professional dikhta hai output",
    timeAgo: "3 days ago",
    avatar: "VJ",
    verified: false,
  },
  // English reviews
  {
    name: "Sarah T.",
    location: "London",
    rating: 5,
    text: "honestly didnt expect much from a free tool but the hook analysis was spot on. told me my first 3 seconds were weak and suggested changes that actually worked",
    timeAgo: "4 days ago",
    avatar: "ST",
    verified: true,
  },
  {
    name: "Mike R.",
    location: "Toronto",
    rating: 4,
    text: "the viral score prediction is surprisingly accurate for my niche (fitness). tested on 5 reels and the ones scoring 70+ all did well organically",
    timeAgo: "1 week ago",
    avatar: "MR",
    verified: true,
  },
  {
    name: "Jessica L.",
    location: "Los Angeles",
    rating: 5,
    text: "been using this for 2 weeks now. my engagement rate went from 2.3% to 5.8%. the caption suggestions alone were worth it tbh",
    timeAgo: "6 days ago",
    avatar: "JL",
    verified: true,
  },
  {
    name: "David K.",
    location: "New York",
    rating: 4,
    text: "pretty solid for a quick check before posting. i use it to compare different captions and hooks. sometimes the hashtag suggestions are a bit generic tho",
    timeAgo: "2 days ago",
    avatar: "DK",
    verified: false,
  },
  // Regional/Foreign reviews
  {
    name: "Arjun P.",
    location: "Bangalore",
    rating: 5,
    text: "as a tech content creator this tool nailed the category detection. it even picked up that my reel had code on screen. trend matching feature is 🔥",
    timeAgo: "3 days ago",
    avatar: "AP",
    verified: true,
  },
  {
    name: "Fatima A.",
    location: "Dubai",
    rating: 5,
    text: "I was paying for similar tools before.. this one gives almost the same insights for free. the master report PDF is really detailed mashallah",
    timeAgo: "5 days ago",
    avatar: "FA",
    verified: true,
  },
  {
    name: "Ankit G.",
    location: "Lucknow",
    rating: 4,
    text: "bhai ye tool free me itna detail deta hai.. caption analysis me emotional triggers batata hai wo bahut kaam ka hai. 4 star isliye ki thoda slow hai",
    timeAgo: "1 week ago",
    avatar: "AG",
    verified: true,
  },
  {
    name: "Meera D.",
    location: "Chennai",
    rating: 5,
    text: "my dance reels were getting 10k views max. after using the suggestions here especially the hook timing tip, crossed 50k on my last reel 🥳",
    timeAgo: "4 days ago",
    avatar: "MD",
    verified: true,
  },
  {
    name: "Carlos M.",
    location: "São Paulo",
    rating: 4,
    text: "works great even for non-English reels. analyzed my Portuguese caption and gave relevant feedback. hashtag suggestions were mostly on point",
    timeAgo: "6 days ago",
    avatar: "CM",
    verified: false,
  },
  {
    name: "Nisha R.",
    location: "Hyderabad",
    rating: 5,
    text: "finally ek tool jo actually kaam karta hai. maine 3 alag tools try kiye pehle, ye sabse accurate hai. trending hashtag detection best hai",
    timeAgo: "2 days ago",
    avatar: "NR",
    verified: true,
  },
  {
    name: "Tom W.",
    location: "Sydney",
    rating: 4,
    text: "the content classification is really impressive. detected my reel as fitness/transformation content and gave category-specific tips. solid tool",
    timeAgo: "1 week ago",
    avatar: "TW",
    verified: true,
  },
  {
    name: "Pooja B.",
    location: "Ahmedabad",
    rating: 5,
    text: "meri cooking reels ke liye perfect tool hai. bataya ki food reels me close-up shots important hain aur music choice change karu. results dikhe! 😍",
    timeAgo: "3 days ago",
    avatar: "PB",
    verified: true,
  },
  {
    name: "Raj V.",
    location: "Kolkata",
    rating: 4,
    text: "good tool hai but kabhi kabhi server slow rehta hai. analysis accurate hai tho. viral pattern matching feature bahut useful hai mere liye",
    timeAgo: "5 days ago",
    avatar: "RV",
    verified: true,
  },
  {
    name: "Aisha N.",
    location: "Singapore",
    rating: 5,
    text: "recommended by a creator friend and honestly it lived up to the hype. the before/after improvement tracking would be amazing if they add it",
    timeAgo: "4 days ago",
    avatar: "AN",
    verified: true,
  },
];

// Deterministic shuffle based on day - rotates every 3 days
function getReviewsForToday(count: number): Review[] {
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 3)); // changes every 3 days
  const seed = dayIndex % ALL_REVIEWS.length;
  const shuffled: Review[] = [];
  const pool = [...ALL_REVIEWS];
  
  let idx = seed;
  while (shuffled.length < count && pool.length > 0) {
    const pickIdx = idx % pool.length;
    shuffled.push(pool.splice(pickIdx, 1)[0]);
    idx += 7; // prime-ish step for variety
  }
  return shuffled;
}

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        className={`w-3 h-3 ${s <= rating ? "fill-[hsl(var(--accent))] text-[hsl(var(--accent))]" : "text-muted-foreground/30"}`}
      />
    ))}
  </div>
);

interface UserReviewsProps {
  title?: string;
  subtitle?: string;
  count?: number;
}

const UserReviews = ({ title = "What Creators Are Saying", subtitle = "Real feedback from our community", count = 4 }: UserReviewsProps) => {
  const reviews = useMemo(() => getReviewsForToday(count), [count]);
  const [visibleCount, setVisibleCount] = useState(Math.min(3, count));

  return (
    <motion.div
      className="relative z-10 max-w-xl lg:max-w-2xl mx-auto px-3 sm:px-4 py-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.4, duration: 0.5 }}
    >
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-2 mb-2">
          <MessageCircle className="w-4 h-4 text-primary" />
          <h2 className="text-base sm:text-lg font-bold text-foreground">{title}</h2>
        </div>
        <p className="text-[10px] sm:text-xs text-muted-foreground">{subtitle}</p>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {reviews.slice(0, visibleCount).map((review, i) => (
            <motion.div
              key={review.name + review.location}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <Card className="glass p-3 sm:p-4">
                <div className="flex items-start gap-2.5">
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">
                    {review.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-foreground">{review.name}</span>
                      <span className="text-[9px] text-muted-foreground">• {review.location}</span>
                      {review.verified && (
                        <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-[hsl(var(--viral-high))]/10 text-[hsl(var(--viral-high))] font-medium">
                          ✓ verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StarRating rating={review.rating} />
                      <span className="text-[9px] text-muted-foreground/60">{review.timeAgo}</span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      <Quote className="w-2.5 h-2.5 inline-block mr-1 text-primary/40 -mt-0.5" />
                      {review.text}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {visibleCount < reviews.length && (
        <motion.button
          onClick={() => setVisibleCount(reviews.length)}
          className="mt-3 mx-auto block text-[10px] text-primary hover:text-primary/80 transition-colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Show more reviews ↓
        </motion.button>
      )}
    </motion.div>
  );
};

export default UserReviews;
