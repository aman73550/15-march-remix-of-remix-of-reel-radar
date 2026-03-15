import SEOOptimizerSection from "@/components/SEOOptimizerSection";
import MobileBottomNav from "@/components/MobileBottomNav";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { motion } from "framer-motion";

const SEOOptimizer = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden pb-20 md:pb-0">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-[120px]" animate={{ x: [0, 50, 0], y: [0, -30, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-secondary/10 blur-[120px]" animate={{ x: [0, -40, 0], y: [0, 40, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />
      </div>

      <SEOOptimizerSection />
      <MobileBottomNav />
    </div>
  );
};

export default SEOOptimizer;
