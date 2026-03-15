import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreditCard, Loader2, X, Shield, IndianRupee } from "lucide-react";

interface Props {
  reelUrl: string;
  price: number;
  onPaymentSuccess: (paymentToken: string) => void;
  onClose: () => void;
}

const AnalysisPaymentPopup = ({ reelUrl, price, onPaymentSuccess, onClose }: Props) => {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: { reelUrl, analysisData: null },
      });
      if (error || !data?.success) throw new Error(data?.error || "Payment creation failed");

      const { orderId, reportId, gateway, keyId } = data;

      if (gateway === "free") {
        toast.success("Free mode active! Starting analysis...");
        onPaymentSuccess(reportId);
        return;
      }

      if (gateway === "stripe" && data.sessionUrl) {
        window.location.href = data.sessionUrl;
        return;
      }

      if (gateway === "razorpay" && keyId) {
        // Load Razorpay script if not already loaded
        if (!(window as any).Razorpay) {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          document.head.appendChild(script);
          await new Promise((resolve) => { script.onload = resolve; });
        }

        const options = {
          key: keyId,
          amount: (data.amount || price) * 100,
          currency: data.currency || "INR",
          name: "Reel Viral Analyzer",
          description: `Reel Analysis — ₹${data.amount || price}`,
          order_id: orderId,
          handler: async (response: any) => {
            setVerifying(true);
            try {
              const { data: verifyData, error: verifyError } = await supabase.functions.invoke("verify-payment", {
                body: {
                  reportId,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpaySignature: response.razorpay_signature,
                },
              });
              if (verifyError || !verifyData?.success) throw new Error("Payment verification failed");
              toast.success("Payment successful! Starting analysis...");
              onPaymentSuccess(reportId);
            } catch (e: any) {
              toast.error(e.message || "Payment verification failed");
            } finally {
              setVerifying(false);
            }
          },
          theme: { color: "#e94560" },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        return;
      }

      throw new Error("Unsupported payment gateway configuration");
    } catch (e: any) {
      toast.error(e.message || "Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose} />

        {/* Popup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative z-10 w-full max-w-sm"
        >
          <Card className="p-6 space-y-5 border-primary/20 bg-card shadow-2xl">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-2">
              <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <CreditCard className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Analysis is Paid</h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
                The reel analysis service is currently in paid mode. Complete payment to proceed.
              </p>
            </div>

            {/* Price Display */}
            <div className="flex items-center justify-center gap-1 py-3 rounded-xl bg-primary/5 border border-primary/10">
              <IndianRupee className="w-5 h-5 text-primary" />
              <span className="text-3xl font-bold text-foreground">{price}</span>
              <span className="text-sm text-muted-foreground ml-1">per analysis</span>
            </div>

            {/* Features */}
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-[hsl(var(--viral-high))]" />
                <span>Complete viral score analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-[hsl(var(--viral-high))]" />
                <span>Hook, caption & hashtag breakdown</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-[hsl(var(--viral-high))]" />
                <span>AI-powered trend matching</span>
              </div>
            </div>

            <Button
              onClick={handlePayment}
              disabled={loading || verifying}
              className="w-full h-11 gap-2 text-sm font-semibold"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating order...</>
              ) : verifying ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Verifying payment...</>
              ) : (
                <>Pay ₹{price} & Analyze</>
              )}
            </Button>

            <p className="text-[10px] text-center text-muted-foreground">
              Secure payment via Razorpay/Stripe
            </p>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AnalysisPaymentPopup;
