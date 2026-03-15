import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ReelAnalysis } from "@/lib/types";
import { Crown, FileText, Download, Loader2, CheckCircle, TrendingUp, Calendar, Target, Lightbulb, BarChart3, MessageCircle } from "lucide-react";
import MasterReportPDF from "./MasterReportPDF";
import MasterReportProcessing from "./MasterReportProcessing";
import PaymentReceipt from "./PaymentReceipt";
import WhatsAppErrorButton from "./WhatsAppErrorButton";

interface Props {
  analysis: ReelAnalysis;
  reelUrl: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const MasterReportButton = ({ analysis, reelUrl }: Props) => {
  const [loading, setLoading] = useState(false);
  const [premiumData, setPremiumData] = useState<any>(null);
  const [showReport, setShowReport] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [reportPrice, setReportPrice] = useState(29);
  const [currency, setCurrency] = useState("INR");

  useEffect(() => {
    // Fetch price from site_config (admin-configurable)
    const fetchPrice = async () => {
      try {
        const { data } = await supabase
          .from("site_config")
          .select("config_key, config_value")
          .in("config_key", ["report_price", "currency"]);
        if (data) {
          for (const row of data) {
            if (row.config_key === "report_price") setReportPrice(parseInt(row.config_value) || 29);
            if (row.config_key === "currency") setCurrency(row.config_value || "INR");
          }
        }
      } catch { /* use defaults */ }
    };
    fetchPrice();
  }, []);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleError = (msg: string) => {
    setErrorMsg(msg);
    toast.error(msg);
    setLoading(false);
  };

  const handleUnlock = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { data: paymentData, error: paymentErr } = await supabase.functions.invoke("create-payment", {
        body: { reelUrl, analysisData: analysis, tool: "master_report" },
      });

      if (paymentErr || !paymentData?.success) {
        throw new Error(paymentData?.error || "Payment creation failed");
      }

      // ===== RAZORPAY =====
      if (paymentData.gateway === "razorpay") {
        const loaded = await loadRazorpayScript();
        if (!loaded) throw new Error("Payment gateway failed to load");

        const options = {
          key: paymentData.keyId,
          amount: paymentData.amount * 100,
          currency: paymentData.currency,
          name: "Viral Reel Analyzer",
          description: "Master Analysis Report",
          order_id: paymentData.orderId,
          handler: async (response: any) => {
            try {
              const { data: verifyData, error: verifyErr } = await supabase.functions.invoke("verify-payment", {
                body: {
                  reportId: paymentData.reportId,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpaySignature: response.razorpay_signature,
                },
              });

              if (verifyErr || !verifyData?.success) {
                throw new Error("Payment verification failed");
              }

              setReceiptData({
                reportId: paymentData.reportId,
                paymentId: response.razorpay_payment_id,
                amount: paymentData.amount,
                currency: paymentData.currency,
              });
              setShowReceipt(true);
              toast.success("Payment successful! 🎉");

              setTimeout(() => {
                setShowReceipt(false);
                setShowProcessing(true);
              }, 2000);
              await generateReport(paymentData.reportId);
            } catch (err: any) {
              handleError("Payment verification failed: " + (err.message || "Unknown error"));
            }
          },
          modal: {
            ondismiss: () => setLoading(false),
          },
          theme: { color: "#e63976" },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        return;
      }

      // ===== FREE MODE =====
      if (paymentData.gateway === "free") {
        setShowProcessing(true);
        toast.success("Free mode active — generating report...");
        await generateReport(paymentData.reportId);
        return;
      }

      // ===== STRIPE =====
      if (paymentData.gateway === "stripe" && paymentData.sessionUrl) {
        window.location.href = paymentData.sessionUrl;
        return;
      }

      // Manual/WhatsApp payment fallback
      toast.info("Contact us on WhatsApp to complete payment");
      setLoading(false);
    } catch (err: any) {
      console.error("Payment error:", err);
      handleError(err.message || "Payment failed. Please try again.");
    }
  };

  const generateReport = async (reportId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("generate-master-report", {
        body: { reportId, analysisData: analysis, reelUrl },
      });

      if (error || !data?.success) {
        throw new Error(data?.error || "Report generation failed");
      }

      setPremiumData(data.premiumAnalysis);
      toast.success("Master Report ready! 🎉");
    } catch (err: any) {
      handleError("Report generation failed: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // Handle Stripe redirect back
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");
    const stripeReportId = params.get("report_id");
    const sessionId = params.get("session_id");

    if (paymentStatus === "success" && stripeReportId && sessionId) {
      // Clear URL params
      window.history.replaceState({}, "", window.location.pathname);
      
      // Verify and generate report
      setLoading(true);
      setShowProcessing(true);
      
      (async () => {
        try {
          const { data: verifyData, error: verifyErr } = await supabase.functions.invoke("verify-payment", {
            body: { reportId: stripeReportId, stripeSessionId: sessionId },
          });

          if (verifyErr || !verifyData?.success) {
            throw new Error("Payment verification failed");
          }

          toast.success("Payment successful! 🎉");
          await generateReport(stripeReportId);
        } catch (err: any) {
          handleError("Payment verification failed: " + (err.message || "Unknown error"));
          setShowProcessing(false);
        }
      })();
    }
  }, []);

  const features = [
    { icon: BarChart3, text: "Top 10 Competitor Comparison" },
    { icon: Calendar, text: "Best Posting Times Calendar" },
    { icon: Target, text: "5-Step Improvement Roadmap" },
    { icon: Lightbulb, text: "Personalized Tips" },
    { icon: FileText, text: "4-5 Page Professional PDF" },
  ];

  if (showReport && premiumData) {
    return <MasterReportPDF analysis={analysis} premiumData={premiumData} reelUrl={reelUrl} />;
  }

  if (showProcessing) {
    return (
      <MasterReportProcessing
        show={true}
        reportReady={!!premiumData}
        onDownload={() => {
          setShowProcessing(false);
          setShowReport(true);
        }}
      />
    );
  }

  if (showReceipt && receiptData) {
    return (
      <PaymentReceipt
        reportId={receiptData.reportId}
        paymentId={receiptData.paymentId}
        amount={receiptData.amount}
        currency={receiptData.currency}
        reelUrl={reelUrl}
        onContinue={() => {
          setShowReceipt(false);
          setShowProcessing(true);
        }}
      />
    );
  }

  const currencySymbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="space-y-3"
    >
      <Card className="relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-card to-secondary/5">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 pointer-events-none" />

        <div className="relative p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary-bg flex items-center justify-center shadow-glow">
              <Crown className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
                Master Analysis Report
                <span className="text-[10px] px-2 py-0.5 rounded-full gradient-primary-bg text-primary-foreground font-semibold">
                  PREMIUM
                </span>
              </h3>
              <p className="text-xs text-muted-foreground">Deep-dive insights your competitors don't have</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {features.map((f, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border/50"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
              >
                <f.icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="text-xs text-foreground">{f.text}</span>
                <CheckCircle className="w-3 h-3 text-[hsl(var(--viral-high))] ml-auto flex-shrink-0" />
              </motion.div>
            ))}
          </div>

          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleUnlock}
              disabled={loading}
              className="w-full h-12 gradient-primary-bg text-primary-foreground font-bold shadow-glow hover:opacity-90 transition-opacity text-base"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
              ) : (
                <>
                  <Crown className="w-4 h-4 mr-2" />
                  Unlock Master Report — {currencySymbol}{reportPrice} Only
                </>
              )}
            </Button>
          </motion.div>

          <p className="text-center text-[10px] text-muted-foreground/60">
            Secure payment • Instant PDF delivery • No login required
          </p>
        </div>
      </Card>

      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-2"
        >
          <p className="text-xs text-destructive text-center">{errorMsg}</p>
        </motion.div>
      )}

      <div className="flex justify-center">
        <WhatsAppErrorButton errorMessage={errorMsg || "I need help with the Master Report"} className="w-full sm:w-auto" />
      </div>
    </motion.div>
  );
};

export default MasterReportButton;
