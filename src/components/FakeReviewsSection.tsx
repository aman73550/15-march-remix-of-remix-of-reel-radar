import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";

// Pre-written reviews that feel human-written, multi-language
const ALL_REVIEWS = [
  { name: "Priya S.", location: "Mumbai", rating: 5, text: "maine apni reel check ki thi yahan pe, aur sach me viral ho gayi! 45k views aaye 2 din me. best tool hai ye 🔥", lang: "hi" },
  { name: "Rahul M.", location: "Delhi", rating: 5, text: "I was skeptical at first but this actually works. My reel got 3x more reach after following the suggestions. Totally recommend!", lang: "en" },
  { name: "Ananya K.", location: "Bangalore", rating: 4, text: "Good analysis, the hook score really helped me understand why my reels weren't performing. Changed my opening and saw 2x improvement", lang: "en" },
  { name: "محمد الريس", location: "Dubai", rating: 5, text: "Amazing tool! I use it every day before posting. My engagement went from 2% to 8% in just one month", lang: "en" },
  { name: "Sneha R.", location: "Pune", rating: 5, text: "ye tool bahut kamaal ka hai! pehle meri reels 500 views pe ruk jaati thi, ab 10k+ aa rahe hain consistently 💪", lang: "hi" },
  { name: "James W.", location: "London", rating: 4, text: "Really impressed with the AI analysis depth. It caught things I never noticed about my content strategy. Worth every penny for the premium report", lang: "en" },
  { name: "Sakura T.", location: "Tokyo", rating: 5, text: "This is the best reel analysis tool I've ever used. The trending hashtag suggestions are incredibly accurate!", lang: "en" },
  { name: "Carlos M.", location: "São Paulo", rating: 5, text: "Incredible tool! My reels are getting so much more traction now. The viral score prediction is surprisingly accurate 🎯", lang: "en" },
  { name: "Deepak J.", location: "Jaipur", rating: 4, text: "Master report mein jo roadmap mila, woh game changer tha mere liye. Ab har reel plan karke banata hoon", lang: "hi" },
  { name: "Sophie L.", location: "Paris", rating: 5, text: "Finally a tool that actually understands Instagram algorithm! My fashion reels are reaching 5x more people now", lang: "en" },
  { name: "Amit P.", location: "Ahmedabad", rating: 5, text: "bhai kya baat hai, ek dum sahi analysis deta hai. meri last 3 reels viral hui iske suggestions follow karke 🚀", lang: "hi" },
  { name: "Fatima A.", location: "Riyadh", rating: 4, text: "Very helpful for understanding what makes content viral. The engagement prediction is quite accurate", lang: "en" },
  { name: "Neha G.", location: "Chennai", rating: 5, text: "I'm a social media manager and I use this for all my clients. Saves so much time and the insights are on point!", lang: "en" },
  { name: "Vikram S.", location: "Chandigarh", rating: 5, text: "pehle try kara toh laga fake hoga, but genuinely accurate results deta hai. 10/10 recommend karunga sabko", lang: "hi" },
  { name: "Kim J.", location: "Seoul", rating: 5, text: "Love how detailed the analysis is! The caption score helped me write better hooks and my watch time doubled 📈", lang: "en" },
];

// Determine which reviews to show based on date (rotates every 3 days)
function getReviewsForToday(): typeof ALL_REVIEWS {
  const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const rotation = Math.floor(daysSinceEpoch / 3) % Math.ceil(ALL_REVIEWS.length / 6);
  const start = (rotation * 6) % ALL_REVIEWS.length;
  const reviews = [];
  for (let i = 0; i < 6; i++) {
    reviews.push(ALL_REVIEWS[(start + i) % ALL_REVIEWS.length]);
  }
  return reviews;
}

const FakeReviewsSection = ({ title = "What Creators Are Saying" }: { title?: string }) => {
  const [reviews] = useState(getReviewsForToday);

  return (
    <motion.div
      className="relative z-10 max-w-2xl mx-auto px-3 py-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2 }}
    >
      <div className="flex items-center justify-center gap-2 mb-4">
        <MessageSquare className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {reviews.map((review, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 + i * 0.1 }}
          >
            <Card className="glass p-3 space-y-2 h-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full gradient-primary-bg flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">{review.name}</p>
                    <p className="text-[9px] text-muted-foreground">{review.location}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-2.5 h-2.5 ${s <= review.rating ? "fill-accent text-accent" : "text-muted-foreground/30"}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-relaxed">
                "{review.text}"
              </p>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default FakeReviewsSection;
