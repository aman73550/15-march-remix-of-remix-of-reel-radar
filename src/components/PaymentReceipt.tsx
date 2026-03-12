import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, Crown, Calendar, CreditCard, FileText, Share2 } from "lucide-react";

interface ReceiptProps {
  reportId: string;
  paymentId: string;
  amount: number;
  currency: string;
  reelUrl: string;
  onContinue: () => void;
}

const PaymentReceipt = ({ reportId, paymentId, amount, currency, reelUrl, onContinue }: ReceiptProps) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const receiptNo = `VRA-${reportId.slice(0, 8).toUpperCase()}`;

  const currencySymbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency;

  const handleSaveReceipt = async () => {
    setSaving(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const element = receiptRef.current;
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#0a0b14",
      });

      const link = document.createElement("a");
      link.download = `receipt-${receiptNo}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Receipt save error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", duration: 0.6 }}
      className="space-y-4"
    >
      <Card className="relative overflow-hidden border-2 border-[hsl(var(--viral-high))]/30 bg-gradient-to-br from-[hsl(var(--viral-high))]/5 via-card to-primary/5">
        <div ref={receiptRef} className="p-5 sm:p-6 space-y-5 bg-card">
          {/* Success Animation */}
          <motion.div
            className="flex flex-col items-center gap-3 pt-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <div className="w-16 h-16 rounded-full bg-[hsl(var(--viral-high))]/20 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-[hsl(var(--viral-high))]" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Payment Successful! 🎉</h2>
            <p className="text-sm text-muted-foreground text-center">
              Your Master Analysis Report is being generated
            </p>
          </motion.div>

          {/* Receipt Details */}
          <div className="space-y-3 bg-muted/20 rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Payment Receipt</span>
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Receipt No.</span>
                <span className="font-mono text-foreground font-medium">{receiptNo}</span>
              </div>
              <div className="border-t border-border/30" />

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Date & Time
                </span>
                <span className="text-foreground">{dateStr}, {timeStr}</span>
              </div>
              <div className="border-t border-border/30" />

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" /> Payment ID
                </span>
                <span className="font-mono text-foreground text-xs">{paymentId.slice(0, 20)}...</span>
              </div>
              <div className="border-t border-border/30" />

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Item</span>
                <span className="text-foreground">Master Analysis Report</span>
              </div>
              <div className="border-t border-border/30" />

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Reel URL</span>
                <span className="text-primary text-xs truncate max-w-[180px]">{reelUrl}</span>
              </div>
              <div className="border-t border-border/30" />

              <div className="flex justify-between items-center text-base">
                <span className="font-semibold text-foreground">Amount Paid</span>
                <span className="font-bold text-[hsl(var(--viral-high))] text-lg">{currencySymbol}{amount}</span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 justify-center bg-[hsl(var(--viral-high))]/10 rounded-lg p-2.5">
            <CheckCircle className="w-4 h-4 text-[hsl(var(--viral-high))]" />
            <span className="text-sm font-medium text-[hsl(var(--viral-high))]">Payment Verified & Confirmed</span>
          </div>

          {/* Branding */}
          <div className="text-center pt-1">
            <p className="text-[10px] text-muted-foreground/50">Viral Reel Analyzer • Premium Report Service</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 pt-0 flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleSaveReceipt}
            disabled={saving}
            variant="outline"
            className="flex-1 border-border/50"
          >
            <Download className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Receipt"}
          </Button>
          <Button
            onClick={onContinue}
            className="flex-1 gradient-primary-bg text-primary-foreground font-semibold shadow-glow"
          >
            <Crown className="w-4 h-4 mr-2" />
            View Report
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default PaymentReceipt;
