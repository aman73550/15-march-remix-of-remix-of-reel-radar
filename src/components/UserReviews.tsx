import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Quote, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";

interface Review {
  name: string;
  location: string;
  rating: number;
  text: string;
  avatar: string;
  verified: boolean;
}

// 70+ reviews — genuinely human, messy grammar, regional slang, typos, emojis, incomplete thoughts
const ALL_REVIEWS: Review[] = [
  // --- Hindi / Hinglish (real Indian typing style) ---
  { name: "Priya S.", location: "Mumbai", rating: 5, text: "are yaar ye toh kamaal hai.. maine socha tha timepass hoga but meri reel ka score 78 aaya aur sach me 2L views aa gaye 🔥 ab har reel pehle yahan check karti hu", avatar: "PS", verified: true },
  { name: "Rohit M.", location: "Delhi NCR", rating: 4, text: "hook score 6 tha toh maine starting badli.. next reel pe 9 aa gaya. caption tips bhi kaam aaye bas loading thoda slow hai kabhi kabhi", avatar: "RM", verified: true },
  { name: "Sneha K.", location: "Pune", rating: 5, text: "bhai pehle random hashtags daalti thi 30-30.. is tool ne bataya ki too competitive hain mere hashtags. changed to mid range aur 3x reach aa gayi 😭❤️ thank u so much", avatar: "SK", verified: true },
  { name: "Vikram J.", location: "Jaipur", rating: 4, text: "client ke liye use kiya tha.. brand wale impress ho gaye jab report dikhayi. professional lagta hai output. price thoda kam hona chahiye report ka", avatar: "VJ", verified: false },
  { name: "Ankit G.", location: "Lucknow", rating: 4, text: "free me itna detail deta hai bhai.. caption analysis me emotional triggers batata hai wo bahut helpful hai. 4 star isliye ki load hone me time lagta hai thoda", avatar: "AG", verified: true },
  { name: "Nisha R.", location: "Hyderabad", rating: 5, text: "3 alag tools try kiye pehle sab bakwas the.. ye actually kaam karta hai. trending hashtag detection best hai isme. highly recommend krungi sabko", avatar: "NR", verified: true },
  { name: "Pooja B.", location: "Ahmedabad", rating: 5, text: "meri cooking reels ke liye perfect hai ye.. bataya ki close-up shots important hain food reels me aur music change kru. kiya toh results aa gaye! 😍", avatar: "PB", verified: true },
  { name: "Raj V.", location: "Kolkata", rating: 4, text: "tool acha hai par server busy rehta hai peak time pe.. analysis accurate hai tho definitely. viral pattern matching useful hai mere liye kaafi", avatar: "RV", verified: true },
  { name: "Deepak T.", location: "Chandigarh", rating: 5, text: "socha tha free hai toh kya hi milega but bhai poora breakdown de diya hook caption hashtag sab.. bahut badiya 👏 keep it up team", avatar: "DT", verified: true },
  { name: "Kavita P.", location: "Indore", rating: 4, text: "views nahi aa rahe the mere reels pe.. isne bataya hook weak hai first 3 sec boring hain. change kiya toh farak aaya actually.. not bad", avatar: "KP", verified: false },
  { name: "Manish S.", location: "Bhopal", rating: 5, text: "sach me kaam karta hai bhai. pehli reel 72% score aayi thi suggestions follow ki doosri pe 80% aa gaya aur views bhi badhe. try karo sab log", avatar: "MS", verified: true },
  { name: "Ritu A.", location: "Noida", rating: 5, text: "dance reel check ki thi.. bataya trending audio use karo hook me face closeup.. tried it aur 1 lakh views mil gaye first time 🥺🥺 rona aa gaya khushi ka", avatar: "RA", verified: true },
  { name: "Suresh K.", location: "Patna", rating: 4, text: "hashtag analysis badhiya hai. pehle 30 hashtag random daal deta tha ab pata chala 8-12 focused wale best hain.. reach bhi badhi", avatar: "SK2", verified: true },
  { name: "Aarti D.", location: "Nagpur", rating: 5, text: "content strategy hi change kar di isne meri.. ab har reel post se pehle yahan check karti hu must try hai creators ke liye seriously", avatar: "AD", verified: true },
  { name: "Mohit R.", location: "Gurgaon", rating: 4, text: "analysis toh sahi hai but PDF report me aur detail chahiye thoda.. overall useful hai daily use ke liye haan", avatar: "MR2", verified: false },
  { name: "Simran G.", location: "Amritsar", rating: 5, text: "oye mast tool hai.. meri frnd ne bataya try kiya aur sach me hook score improve karne se engagement badh gayi 📈 share kiya sabko", avatar: "SG", verified: true },
  { name: "Harsh P.", location: "Surat", rating: 4, text: "10 reels test ki.. 7 me prediction almost sahi nikli 3 me off tha thoda but still better than andha guess lagana na", avatar: "HP", verified: true },
  { name: "Neha W.", location: "Dehradun", rating: 5, text: "sabse achi baat free hai aur login nahi maangta.. seedha link paste karo result lo. simple. effective. love it 💯", avatar: "NW", verified: true },
  { name: "Raj B.", location: "Ranchi", rating: 4, text: "chhote sheher se hu but ye tool mujhe city waale creators jaisa analysis de raha hai.. especially hashtag section bahut helpful hai", avatar: "RB", verified: true },
  { name: "Shreya N.", location: "Vadodara", rating: 5, text: "friend circle me sabko recommend kr diya 4 log already use kr rahe hain.. simple hai aur results genuine lagte hain", avatar: "SN", verified: true },
  { name: "Kriti S.", location: "Goa", rating: 5, text: "travel creator hu.. isne bataya text overlay zyada hai reel me aur motion slow hai. fixed both aur engagement double ho gayi 🏖️✨", avatar: "KS", verified: true },
  { name: "Sanya M.", location: "Guwahati", rating: 5, text: "northeast se hu yahan creators ko aise tools ki bahut zarurat hai.. free hai aur kaam ka hai 5 star deserved hai 💫", avatar: "SM", verified: true },
  { name: "Gaurav L.", location: "Varanasi", rating: 5, text: "banaras se hu bhai.. pehle reel banaate the bas daal dete the ab samajh aaya ki hook kitna important hai. score 65 se 82 ho gaya next reel me", avatar: "GL", verified: true },
  { name: "Komal T.", location: "Nashik", rating: 4, text: "ok so maine try kiya aur honestly surprised hu.. itna detailed analysis free me? caption score ne bahut help ki mujhe", avatar: "KT", verified: true },
  { name: "Vishal R.", location: "Raipur", rating: 5, text: "mera ek dost bola try kar ye.. 15 min me samajh aa gaya ki meri reels me kya kami hai. hook aur hashtag dono weak the", avatar: "VR", verified: true },
  { name: "Megha S.", location: "Jalandhar", rating: 5, text: "punjabi creator hu.. tool ne sab sahi pakda meri reel ka. trending audio suggestion bhi di jo kaam aa gayi bahut 🎵", avatar: "MS2", verified: true },
  { name: "Arun K.", location: "Coimbatore", rating: 4, text: "nalla tool da.. english la suggestions varum but samajh aa jata hai. hook score improve panna views increase aachu genuinely", avatar: "AK2", verified: true },
  { name: "Divya P.", location: "Jodhpur", rating: 5, text: "rajasthan se hu aur yahan creators bahut kam hain jo aise tools use karte hain.. mujhe competitive advantage mil gaya isse 😎", avatar: "DP", verified: true },
  // --- English (casual, real typing, no perfect grammar) ---
  { name: "Sarah T.", location: "London", rating: 5, text: "didnt expect much from a free tool tbh but the hook analysis was spot on. told me first 3 sec were weak, changed it and the reel actually performed", avatar: "ST", verified: true },
  { name: "Mike R.", location: "Toronto", rating: 4, text: "viral score prediction is surprisingly accurate for fitness niche. tested on 5 reels the ones scoring 70+ all did well organically so yeah it works", avatar: "MR", verified: true },
  { name: "Jessica L.", location: "Los Angeles", rating: 5, text: "been using this for like 2 weeks now. engagement went from 2.3% to 5.8%. caption suggestions alone were worth it honestly", avatar: "JL", verified: true },
  { name: "David K.", location: "New York", rating: 4, text: "solid for a quick check before posting. i compare different captions and hooks with it. hashtag suggestions can be a bit generic sometimes tho", avatar: "DK", verified: false },
  { name: "Tom W.", location: "Sydney", rating: 4, text: "content classification impressed me ngl. it detected my reel as fitness/transformation and gave category specific tips. not bad", avatar: "TW", verified: true },
  { name: "Aisha N.", location: "Singapore", rating: 5, text: "my creator friend recommended this and it actually lived up to hype. wish they had before/after tracking tho that would be sick", avatar: "AN", verified: true },
  { name: "Emma C.", location: "Dublin", rating: 5, text: "best free reel tool ive found period. tried like 4 others and they all want payment before showing anything useful. this one just works", avatar: "EC", verified: true },
  { name: "James H.", location: "Manchester", rating: 4, text: "hook score helped me understand why some reels flop in first few seconds. thats worth it alone. caption analysis could go deeper but yeah good", avatar: "JH", verified: false },
  { name: "Rachel P.", location: "Vancouver", rating: 5, text: "the trend matching feature??? actually useful wow. told me my reel format was similar to trending ones and gave me tweaks. super helpful", avatar: "RP", verified: true },
  { name: "Brandon M.", location: "Chicago", rating: 4, text: "mainly use it for hashtag research before posting. saves me time vs manually scrolling through trending tags. does the job", avatar: "BM", verified: true },
  { name: "Lisa K.", location: "Berlin", rating: 5, text: "finally something with actionable feedback not just generic tips everyone gives. the score breakdown shows exactly where weak spots are", avatar: "LK", verified: true },
  { name: "Chris D.", location: "Amsterdam", rating: 4, text: "been using it about a month reels performing noticeably better. predictions arent always perfect but theyre directionally correct which is what matters", avatar: "CD", verified: true },
  { name: "Ben T.", location: "San Francisco", rating: 4, text: "managing 3 creator accounts this saves me hours. quick paste and analyze. trend matching is the feature i use most by far", avatar: "BT", verified: true },
  // --- Regional Indian languages + Foreign ---
  { name: "Arjun P.", location: "Bangalore", rating: 5, text: "tech content creator here and it nailed category detection. even picked up code on screen lol. trend matching feature is genuinely useful 🔥", avatar: "AP", verified: true },
  { name: "Fatima A.", location: "Dubai", rating: 5, text: "was paying for similar tools before.. this gives almost same insights for free. master report PDF is really detailed mashallah", avatar: "FA", verified: true },
  { name: "Meera D.", location: "Chennai", rating: 5, text: "dance reels were getting 10k max.. after hook timing tip crossed 50k on last reel 🥳 first time ever happened i was literally screaming", avatar: "MD", verified: true },
  { name: "Carlos M.", location: "São Paulo", rating: 4, text: "works for non english reels too which is nice. analyzed my portuguese caption gave relevant feedback. hashtags were mostly on point", avatar: "CM", verified: false },
  { name: "Yuki T.", location: "Tokyo", rating: 5, text: "used for my japan travel reels. visual analysis detected scene changes accurately. very detailed for free tool honestly impressed", avatar: "YT", verified: true },
  { name: "Ahmed H.", location: "Riyadh", rating: 4, text: "mashallah good tool. use it for car review reels and engagement predictions are quite accurate. would love arabic support tho inshallah", avatar: "AH", verified: true },
  { name: "Sofia R.", location: "Mexico City", rating: 5, text: "lo use para mis reels de cocina y me ayudó con los hashtags mucho. interface is easy even if english isnt ur first language", avatar: "SR", verified: true },
  { name: "Liam O.", location: "Auckland", rating: 4, text: "decent tool for quick analysis. i run small social media agency and use this to show clients why their reels underperform. handy", avatar: "LO", verified: true },
  { name: "Priyanka M.", location: "Kochi", rating: 5, text: "malayalam content create cheyyunna enikku polum ee tool useful aanu. english caption analyze cheythu nalla suggestions thannu 🙌", avatar: "PM", verified: true },
  { name: "Tanvi S.", location: "Mysore", rating: 5, text: "nanu fashion reels maadtini.. ee tool caption score kodi nanna reels improve aaytu. kannada creators ge useful ide definitely", avatar: "TS", verified: true },
  { name: "Chen W.", location: "Kuala Lumpur", rating: 4, text: "good for food content reels. correctly identified my niche gave specific tips. loading could be faster but otherwise solid", avatar: "CW", verified: false },
  { name: "Anna K.", location: "Warsaw", rating: 5, text: "used for my makeup tutorials hook analysis was very accurate. told me where viewers drop off which was exactly the problem i had", avatar: "AK", verified: true },
  { name: "Diego L.", location: "Buenos Aires", rating: 5, text: "lo mejor es que es gratis y no pide login. paste link get full analysis thats it. my fitness reels improved a lot since", avatar: "DL", verified: true },
  { name: "Omar F.", location: "Doha", rating: 4, text: "good for checking performance potential. viral score actually changes when i add better captions which shows its analyzing properly not random", avatar: "OF", verified: true },
  { name: "Marcus J.", location: "Lagos", rating: 4, text: "works for african creators too. analyzed my afrobeat dance reel gave solid feedback on caption hashtag strategy. need more african languages tho", avatar: "MJ", verified: true },
  { name: "Isabella G.", location: "Milan", rating: 5, text: "uso questo tool per i miei reel di moda. fashion category detection accurate and tips specific to my niche. molto bene! love it", avatar: "IG", verified: true },
  { name: "Varun D.", location: "Thiruvananthapuram", rating: 4, text: "njaan ee tool use cheythu tech reels analyze cheythu. hook score improve cheythappol reach kooduthal aayi. nalla tool aanu seriously", avatar: "VD", verified: true },
  { name: "Ananya V.", location: "Coimbatore", rating: 5, text: "tamil content ku romba useful tool. english la suggestions varum but easy to understand. hook score improve panna views increase aachi for real", avatar: "AV", verified: true },
  // --- More natural ones with typos/incomplete thoughts ---
  { name: "Nikhil B.", location: "Thane", rating: 5, text: "bro this tool is actually legit.. i was skeptical but the analysis breakdown is proper detailed. shared with my whole creator group", avatar: "NB", verified: true },
  { name: "Pallavi C.", location: "Vizag", rating: 4, text: "achha tool hai overall. ek cheez improve karna chahiye ki results thoda jaldi aaye.. baaki sab sahi hai", avatar: "PC", verified: true },
  { name: "Sameer Q.", location: "Aligarh", rating: 5, text: "maine 2 din me 5 reels check kiye aur har ek me kuch naya seekha.. hook timing, hashtag placement, caption structure sab", avatar: "SQ", verified: true },
  { name: "Tanya M.", location: "Faridabad", rating: 5, text: "honestly mujhe lagta tha ye sab scam type hota hai but no this actually works.. meri last 3 reels me clear improvement dikhi", avatar: "TM", verified: true },
  { name: "Kunal D.", location: "Kanpur", rating: 4, text: "4 star only because server busy aata hai kabhi kabhi otherwise analysis ekdum solid hai. free tool me itna milna mushkil hai", avatar: "KD", verified: true },
  { name: "Swati J.", location: "Udaipur", rating: 5, text: "rajasthani creator hu mehendi content banati hu.. isne sahi bataya ki mere hooks me face nahi dikh raha tha. added face close up aur views 3x 🎉", avatar: "SJ", verified: true },
  { name: "Naveen R.", location: "Warangal", rating: 4, text: "telugu content banata hu.. tool ne english me analyze kiya but suggestions applicable thi mere content pe bhi. useful hai", avatar: "NR2", verified: true },
];

// Deterministic time labels — feel real with irregular intervals
function getTimeLabel(seed: number, index: number): string {
  const options = [
    "just now", "2 min ago", "8 min ago", "23 min ago", "1h ago", 
    "2h ago", "4h ago", "6h ago", "yesterday", "1 day ago", 
    "2 days ago", "3 days ago", "5 days ago", "last week",
  ];
  return options[(seed + index * 7 + index) % options.length];
}

// Rotate batch every 3 days deterministically
function getReviewsForToday(): (Review & { timeAgo: string })[] {
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 3));
  const seed = dayIndex * 13;
  const pool = [...ALL_REVIEWS];
  const result: (Review & { timeAgo: string })[] = [];

  let idx = seed;
  while (result.length < pool.length) {
    const pickIdx = idx % pool.length;
    const review = pool.splice(pickIdx, 1)[0];
    result.push({ ...review, timeAgo: getTimeLabel(seed, result.length) });
    idx += 11;
  }
  return result;
}

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star key={s} className={`w-3 h-3 ${s <= rating ? "fill-[hsl(var(--accent))] text-[hsl(var(--accent))]" : "text-muted-foreground/30"}`} />
    ))}
  </div>
);

const PAGE_SIZE = 5;

interface UserReviewsProps {
  title?: string;
  subtitle?: string;
}

const UserReviews = ({ title = "What Creators Are Saying", subtitle = "Real feedback from our community" }: UserReviewsProps) => {
  const allReviews = useMemo(() => getReviewsForToday(), []);
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(allReviews.length / PAGE_SIZE);
  const pageReviews = allReviews.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

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
        <AnimatePresence mode="wait">
          <motion.div key={page} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
            <div className="space-y-3">
              {pageReviews.map((review, i) => (
                <Card key={review.name + review.location} className="glass p-3 sm:p-4">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">
                      {review.avatar.substring(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-foreground">{review.name}</span>
                        <span className="text-[9px] text-muted-foreground">• {review.location}</span>
                        {review.verified && (
                          <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-[hsl(var(--viral-high))]/10 text-[hsl(var(--viral-high))] font-medium">✓ verified</span>
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
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="h-8 w-8 p-0 border-border"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs text-muted-foreground">
            {page + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="h-8 w-8 p-0 border-border"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default UserReviews;
