import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  TrendingUp, Zap, BarChart3, Hash, FileText, Eye, 
  ArrowRight, CheckCircle2, Star, Search, Sparkles, 
  Video, MessageSquare, Target
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/* ─── Features Section ─── */
const FEATURES = [
  { icon: TrendingUp, title: "Viral Score Prediction", desc: "AI analyzes your reel against thousands of viral patterns to predict performance." },
  { icon: Zap, title: "Hook Strength Analysis", desc: "Get scored on your opening 3 seconds — the make-or-break moment for viewers." },
  { icon: BarChart3, title: "Engagement Metrics", desc: "Compare your likes, comments, shares and saves against category benchmarks." },
  { icon: Hash, title: "Hashtag Optimization", desc: "Smart hashtag strategy analysis with competition levels and reach estimates." },
  { icon: FileText, title: "Caption SEO", desc: "Optimize your captions for Instagram's search algorithm with keyword analysis." },
  { icon: Eye, title: "Thumbnail & Visual Analysis", desc: "AI reviews your video quality, scene cuts, motion intensity and visual appeal." },
];

export const FeaturesSection = () => (
  <section className="py-16 sm:py-20 bg-secondary/30">
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Powerful Analysis Features</h2>
        <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">Everything you need to understand and improve your reel performance.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map((f, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
            <Card className="p-6 h-full border border-border bg-card hover:shadow-lg hover:border-primary/20 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl gradient-primary-bg flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── Tools Section ─── */
const TOOLS = [
  { path: "/", title: "Reel Analyzer", desc: "Full AI analysis of any Instagram reel", icon: Search },
  { path: "/seo-optimizer", title: "SEO Optimizer", desc: "Optimize titles, captions & hashtags", icon: Target },
  { path: "/reel-hashtag-generator", title: "Hashtag Generator", desc: "Generate strategic hashtag sets", icon: Hash },
  { path: "/reel-viral-checker", title: "Viral Checker", desc: "Check viral probability of your reel", icon: TrendingUp },
  { path: "/reel-caption-generator", title: "Caption Generator", desc: "AI-powered caption suggestions", icon: MessageSquare },
  { path: "/reel-engagement-calculator", title: "Engagement Calculator", desc: "Calculate your engagement rate", icon: BarChart3 },
];

export const ToolsSection = () => (
  <section className="py-16 sm:py-20">
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">All Tools</h2>
        <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">Free tools to supercharge your Instagram content strategy.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOOLS.map((tool, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
            <Link to={tool.path}>
              <Card className="p-5 border border-border bg-card hover:shadow-md hover:border-primary/30 transition-all duration-300 group">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <tool.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm mb-1 group-hover:text-primary transition-colors">{tool.title}</h3>
                    <p className="text-xs text-muted-foreground">{tool.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── How It Works ─── */
const STEPS = [
  { num: "01", title: "Paste Your Reel URL", desc: "Copy the link of any Instagram reel and paste it into the analyzer." },
  { num: "02", title: "AI Analyzes Your Reel", desc: "Our AI extracts data, analyzes patterns, and scores every aspect of your reel." },
  { num: "03", title: "Get Detailed Report", desc: "Receive a comprehensive report with scores, charts, and actionable recommendations." },
];

export const HowItWorksSection = () => (
  <section className="py-16 sm:py-20 bg-secondary/30">
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">How It Works</h2>
        <p className="text-muted-foreground text-sm sm:text-base">Three simple steps to analyze any Instagram reel.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
        {STEPS.map((step, i) => (
          <motion.div key={i} className="text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
            <div className="w-14 h-14 rounded-2xl gradient-primary-bg flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-foreground font-bold text-lg">{step.num}</span>
            </div>
            <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── Testimonials ─── */
const TESTIMONIALS = [
  { name: "Priya S.", role: "Content Creator", text: "This tool helped me understand why some reels go viral. My engagement doubled in 2 weeks!", rating: 5 },
  { name: "Rahul M.", role: "Social Media Manager", text: "I use the hashtag analyzer daily. It's like having an Instagram strategist on call.", rating: 5 },
  { name: "Ananya K.", role: "Influencer", text: "The viral score prediction is surprisingly accurate. Great for planning content.", rating: 4 },
];

export const TestimonialsSection = () => (
  <section className="py-16 sm:py-20">
    <div className="max-w-5xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">What Creators Say</h2>
        <p className="text-muted-foreground text-sm sm:text-base">Trusted by thousands of Instagram creators.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {TESTIMONIALS.map((t, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
            <Card className="p-6 border border-border bg-card h-full">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-foreground mb-4 leading-relaxed">"{t.text}"</p>
              <div>
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── CTA Section ─── */
export const CTASection = ({ onCTAClick }: { onCTAClick: () => void }) => (
  <section className="py-16 sm:py-20">
    <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Ready to Go Viral?</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">Analyze your first reel for free. No sign-up required.</p>
        <Button onClick={onCTAClick} size="lg" className="gradient-primary-bg text-primary-foreground font-semibold shadow-glow hover:opacity-90 transition-opacity px-8">
          <Sparkles className="w-4 h-4 mr-2" />
          Start Analyzing — It's Free
        </Button>
      </motion.div>
    </div>
  </section>
);
