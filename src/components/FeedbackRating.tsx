import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLang } from "@/lib/LangContext";

interface FeedbackRatingProps {
  reelUrl: string;
}

const FeedbackRating = ({ reelUrl }: FeedbackRatingProps) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { lang } = useLang();

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    const { error } = await supabase.from("feedback" as any).insert({
      reel_url: reelUrl,
      rating,
      comment: comment.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error(lang === "hi" ? "फीडबैक भेजने में गलती हुई" : "Failed to submit feedback");
      return;
    }
    setSubmitted(true);
    toast.success(lang === "hi" ? "धन्यवाद! आपका फीडबैक मिल गया ⭐" : "Thank you for your feedback! ⭐");
  };

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <Card className="glass p-5 text-center space-y-2">
          <div className="text-3xl">🎉</div>
          <p className="text-sm font-medium text-foreground">
            {lang === "hi" ? "आपका फीडबैक मिल गया! धन्यवाद" : "Thanks for your feedback!"}
          </p>
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`w-5 h-5 ${s <= rating ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />
            ))}
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
      <Card className="glass p-5 space-y-3">
        <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
          ⭐ {lang === "hi" ? "इस Analysis को Rate करें" : "Rate this Analysis"}
        </h3>
        <p className="text-xs text-muted-foreground">
          {lang === "hi" ? "आपकी राय हमें बेहतर बनाने में मदद करेगी" : "Your feedback helps us improve"}
        </p>

        <div className="flex items-center gap-1.5 justify-center py-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="transition-transform hover:scale-125 focus:outline-none"
            >
              <Star
                className={`w-8 h-8 sm:w-9 sm:h-9 transition-colors ${
                  star <= (hover || rating)
                    ? "fill-accent text-accent drop-shadow-[0_0_6px_hsl(var(--accent)/0.5)]"
                    : "text-muted-foreground/30"
                }`}
              />
            </button>
          ))}
        </div>

        {rating > 0 && (
          <AnimatePresence>
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={lang === "hi" ? "कोई सुझाव? (optional)" : "Any suggestions? (optional)"}
                className="bg-muted/50 border-border text-xs min-h-[60px] resize-none"
                maxLength={500}
              />
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full gradient-primary-bg text-primary-foreground h-9 text-xs"
              >
                {submitting
                  ? (lang === "hi" ? "भेज रहे हैं..." : "Submitting...")
                  : (lang === "hi" ? "फीडबैक भेजें" : "Submit Feedback")}
              </Button>
            </motion.div>
          </AnimatePresence>
        )}
      </Card>
    </motion.div>
  );
};

export default FeedbackRating;
