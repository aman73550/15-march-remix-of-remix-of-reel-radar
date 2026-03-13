import { motion } from "framer-motion";
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

const BeforeAfterSection = () => (
  <motion.div
    className="relative z-10 max-w-2xl mx-auto px-3 py-6"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 1.5 }}
  >
    <h3 className="text-sm font-semibold text-foreground text-center mb-4">
      📊 Before vs After Reel Analysis
    </h3>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
      {/* Before */}
      <Card className="glass p-4 space-y-2 border-destructive/20">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-destructive" />
          <span className="text-xs font-semibold text-destructive">Before</span>
        </div>
        <div className="space-y-1.5 text-[10px] text-muted-foreground">
          <div className="flex justify-between"><span>Avg Views</span><span className="text-foreground font-medium">500</span></div>
          <div className="flex justify-between"><span>Engagement</span><span className="text-foreground font-medium">1.2%</span></div>
          <div className="flex justify-between"><span>Viral Reels</span><span className="text-foreground font-medium">0</span></div>
          <div className="flex justify-between"><span>Hook Score</span><span className="text-foreground font-medium">3/10</span></div>
        </div>
      </Card>

      {/* Arrow */}
      <div className="hidden sm:flex justify-center">
        <motion.div
          animate={{ x: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ArrowRight className="w-8 h-8 text-primary" />
        </motion.div>
      </div>

      {/* After */}
      <Card className="glass p-4 space-y-2 border-[hsl(var(--viral-high))]/20">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[hsl(var(--viral-high))]" />
          <span className="text-xs font-semibold text-[hsl(var(--viral-high))]">After</span>
        </div>
        <div className="space-y-1.5 text-[10px] text-muted-foreground">
          <div className="flex justify-between"><span>Avg Views</span><span className="text-[hsl(var(--viral-high))] font-bold">15,000+</span></div>
          <div className="flex justify-between"><span>Engagement</span><span className="text-[hsl(var(--viral-high))] font-bold">8.5%</span></div>
          <div className="flex justify-between"><span>Viral Reels</span><span className="text-[hsl(var(--viral-high))] font-bold">4</span></div>
          <div className="flex justify-between"><span>Hook Score</span><span className="text-[hsl(var(--viral-high))] font-bold">8/10</span></div>
        </div>
      </Card>
    </div>

    <p className="text-center text-[9px] text-muted-foreground/60 mt-3">
      *Based on average improvement reported by creators who followed our AI recommendations
    </p>
  </motion.div>
);

export default BeforeAfterSection;
