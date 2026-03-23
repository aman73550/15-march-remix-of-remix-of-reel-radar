import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Sparkles, CheckCircle2, Coins } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/LangContext";
import LanguageToggle from "@/components/LanguageToggle";
import UserReviews from "@/components/UserReviews";
import SEOProcessingOverlay from "@/components/SEOProcessingOverlay";
import SEOResultsDisplay from "@/components/SEOResultsDisplay";
import LoginPrompt from "@/components/LoginPrompt";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const SEOOptimizerSection = () => {
  const [input, setInput] = useState("");
  const { lang } = useLang();
  const [isPaying, setIsPaying] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [seoResults, setSeoResults] = useState<any>(null);
  const [reportId, setReportId] = useState<string | null>(null);

  const handlePay = async () => {
    if (!input.trim()) {
      toast.error(lang === "hi" ? "पहले अपना टॉपिक या कॉन्टेक्स्ट डालें" : "Please enter your topic or context first");
      return;
    }
    setIsPaying(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: { reelUrl: `seo:${input.trim()}`, analysisData: { type: "seo", topic: input.trim() }, tool: "seo" },
      });
      if (error || !data?.success) throw new Error(data?.error || error?.message || "Payment creation failed");
      if (data.gateway === "razorpay" && data.orderId) {
        if (!window.Razorpay) {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          document.head.appendChild(script);
          await new Promise((r) => setTimeout(r, 1500));
        }
        const options = {
          key: data.keyId, amount: data.amount * 100, currency: data.currency,
          name: "Reel SEO Optimizer", description: "Deep SEO Analysis", order_id: data.orderId,
          handler: async (response: any) => {
            const { data: verifyData, error: verifyErr } = await supabase.functions.invoke("verify-payment", {
              body: { reportId: data.reportId, razorpayPaymentId: response.razorpay_payment_id, razorpayOrderId: response.razorpay_order_id, razorpaySignature: response.razorpay_signature },
            });
            if (verifyErr || !verifyData?.success) { toast.error("Payment verification failed"); return; }
            setReportId(data.reportId);
            setIsPaid(true);
            toast.success("Payment successful! ✅");
          },
          theme: { color: "#e8365d" },
        };
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else if (data.gateway === "stripe" && data.sessionUrl) {
        window.location.href = data.sessionUrl;
        return;
      } else {
        setReportId(data.reportId);
        setIsPaid(true);
        toast.success("Payment successful!");
      }
    } catch (err: any) {
      toast.error(err.message || "Payment failed");
    } finally {
      setIsPaying(false);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!isPaid || !reportId) { toast.error("Please complete payment first"); return; }
    setIsProcessing(true);
    setAnalysisComplete(false);
    setSeoResults(null);
    try {
      const { data, error } = await supabase.functions.invoke("seo-analyze", { body: { topic: input.trim(), reportId } });
      if (error || !data?.success) throw new Error(data?.error || error?.message || "SEO analysis failed");
      setSeoResults(data.data);
      setAnalysisComplete(true);
    } catch (err: any) {
      toast.error(err.message || "Analysis failed");
      setIsProcessing(false);
    }
  }, [isPaid, reportId, input]);

  const handleProcessingComplete = useCallback(() => { setIsProcessing(false); }, []);

  return (
    <div className="relative z-10 max-w-xl lg:max-w-2xl mx-auto px-3 sm:px-4 py-6 pb-28">
      <SEOProcessingOverlay show={isProcessing} analysisComplete={analysisComplete} onComplete={handleProcessingComplete} />
      <div className="flex justify-end mb-4"><LanguageToggle /></div>
      <motion.div className="text-center mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/50 text-xs text-muted-foreground mb-3">
          <Search className="w-3 h-3" />
          {lang === "hi" ? "पेड टूल — SEO ऑप्टिमाइज़ेशन" : "Paid Tool — SEO Optimization"}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Reel <span className="text-primary">SEO Optimizer</span></h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {lang === "hi" ? "डीप रिसर्च से ट्रेंडिंग टाइटल, हैशटैग, म्यूज़िक सुझाव पाएं" : "Get trending titles, hashtags, music suggestions & content improvement tips"}
        </p>
      </motion.div>

      {seoResults && !isProcessing ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <SEOResultsDisplay data={seoResults} topic={input} />
        </motion.div>
      ) : (
        <>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="glass p-4 sm:p-5 mb-6">
              <Textarea value={input} onChange={(e) => setInput(e.target.value)}
                placeholder={lang === "hi" ? "अपना रील कॉन्टेक्स्ट यहाँ डालें..." : "Enter your reel context, caption, or topic here..."}
                className="min-h-[100px] bg-muted/30 border-border/50 text-foreground placeholder:text-muted-foreground/60 resize-none mb-4"
                disabled={isPaid} />
              {!isPaid ? (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-muted-foreground line-through text-sm">₹59</span>
                    <span className="text-2xl font-bold text-foreground">₹10</span>
                    <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-semibold">83% OFF</span>
                  </div>
                  <Button onClick={handlePay} disabled={isPaying || !input.trim()} className="w-full py-5 text-base font-semibold gradient-primary-bg text-primary-foreground hover:opacity-90 transition-opacity">
                    <Lock className="w-4 h-4 mr-2" />
                    {isPaying ? "Processing..." : "Pay ₹10 & Generate SEO Analysis"}
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-4 text-primary text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Payment successful! Click Submit to start
                  </div>
                  <Button onClick={handleSubmit} disabled={isProcessing} className="w-full py-5 text-base font-semibold gradient-primary-bg text-primary-foreground hover:opacity-90 transition-opacity">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Start SEO Analysis
                  </Button>
                </>
              )}
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <UserReviews title={lang === "hi" ? "SEO टूल रिव्यू" : "SEO Tool Reviews"} />
          </motion.div>
        </>
      )}
    </div>
  );
};

export default SEOOptimizerSection;
