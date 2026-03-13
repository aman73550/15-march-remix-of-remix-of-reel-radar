import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Sparkles, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/LangContext";
import LanguageToggle from "@/components/LanguageToggle";
import UserReviews from "@/components/UserReviews";

const SEOOptimizerSection = () => {
  const [input, setInput] = useState("");
  const { lang } = useLang();

  const handlePay = () => {
    // Payment integration placeholder
  };

  return (
    <div className="relative z-10 max-w-xl lg:max-w-2xl mx-auto px-3 sm:px-4 py-6 pb-28">
      {/* Language Toggle */}
      <div className="flex justify-end mb-4">
        <LanguageToggle />
      </div>

      {/* Header */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/50 text-xs text-muted-foreground mb-3">
          <Search className="w-3 h-3" />
          {lang === "hi" ? "पेड टूल — SEO ऑप्टिमाइज़ेशन" : "Paid Tool — SEO Optimization"}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Reel <span className="text-primary">SEO Optimizer</span>
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {lang === "hi"
            ? "डीप AI रिसर्च से ट्रेंडिंग टाइटल, हैशटैग, म्यूज़िक सुझाव और कंटेंट सुधार टिप्स पाएं"
            : "Get trending titles, hashtags, music suggestions & content improvement tips powered by deep AI research"}
        </p>
      </motion.div>

      {/* Input Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="glass p-4 sm:p-5 mb-6">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              lang === "hi"
                ? "अपना रील कॉन्टेक्स्ट, कैप्शन, या टॉपिक यहाँ डालें... (जैसे, 'Morning routine for college students' या अपना कैप्शन पेस्ट करें)"
                : "Enter your reel context, caption, or topic here... (e.g., 'Morning routine for college students' or paste your caption)"
            }
            className="min-h-[100px] bg-muted/30 border-border/50 text-foreground placeholder:text-muted-foreground/60 resize-none mb-4"
          />

          {/* Pricing */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-muted-foreground line-through text-sm">₹59</span>
            <span className="text-2xl font-bold text-foreground">₹10</span>
            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-semibold">
              83% OFF — Limited Time
            </span>
          </div>

          {/* Pay Button */}
          <Button
            onClick={handlePay}
            className="w-full py-5 text-base font-semibold gradient-primary-bg text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Lock className="w-4 h-4 mr-2" />
            {lang === "hi" ? "₹10 दें और SEO एनालिसिस जेनरेट करें" : "Pay ₹10 & Generate SEO Analysis"}
          </Button>
        </Card>
      </motion.div>

      {/* Reviews */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <UserReviews title={lang === "hi" ? "SEO टूल रिव्यू" : "SEO Tool Reviews"} />
      </motion.div>
    </div>
  );
};

export default SEOOptimizerSection;
