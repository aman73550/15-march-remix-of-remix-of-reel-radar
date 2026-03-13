import { motion } from "framer-motion";
import { Search, Hash, FileText, TrendingUp, Sparkles, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";

const SEOOptimizerSection = () => {
  const features = [
    { icon: Hash, title: "Hashtag Research", desc: "Find high-performing hashtags for maximum reach" },
    { icon: FileText, title: "Caption Generator", desc: "AI-crafted captions optimized for engagement" },
    { icon: TrendingUp, title: "Trend Keywords", desc: "Discover trending keywords in your niche" },
    { icon: Search, title: "SEO Score Checker", desc: "Analyze your content's discoverability score" },
  ];

  return (
    <div className="relative z-10 max-w-xl lg:max-w-2xl mx-auto px-3 sm:px-4 py-10 pb-28">
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/50 text-xs text-muted-foreground mb-4">
          <Sparkles className="w-3 h-3" />
          Coming Soon
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
          SEO Optimization <span className="gradient-primary">Engine</span>
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Optimize your Reels with AI-powered hashtags, captions, and trend keywords for maximum discoverability.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.1 }}
          >
            <Card className="glass p-4 relative overflow-hidden group">
              <div className="absolute inset-0 bg-muted/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Lock className="w-3.5 h-3.5" />
                  Coming Soon
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-4.5 h-4.5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{feature.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{feature.desc}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="mt-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p className="text-xs text-muted-foreground/60">
          🚀 We're building something powerful. Stay tuned for updates.
        </p>
      </motion.div>
    </div>
  );
};

export default SEOOptimizerSection;
