import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { reportId, razorpayPaymentId, razorpayOrderId, razorpaySignature, stripeSessionId } = body;

    if (!reportId) {
      return new Response(JSON.stringify({ success: false, error: "Report ID is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get config for verification
    const { data: configData } = await supabase.from("site_config").select("config_key, config_value");
    const config: Record<string, string> = {};
    if (configData) {
      for (const row of configData) config[row.config_key] = row.config_value;
    }

    const gateway = config.payment_gateway || "razorpay";

    // ===== RAZORPAY VERIFICATION =====
    if (gateway === "razorpay" && razorpayPaymentId) {
      const razorpayKeySecret = config.razorpay_key_secret;
      if (!razorpayKeySecret) {
        throw new Error("Payment configuration missing");
      }

      const encoder = new TextEncoder();
      const data = encoder.encode(`${razorpayOrderId}|${razorpayPaymentId}`);
      const key = encoder.encode(razorpayKeySecret);
      
      const cryptoKey = await crypto.subtle.importKey(
        "raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
      );
      const signature = await crypto.subtle.sign("HMAC", cryptoKey, data);
      const expectedSignature = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

      if (expectedSignature !== razorpaySignature) {
        console.error("Razorpay signature mismatch");
        return new Response(JSON.stringify({ success: false, error: "Payment verification failed" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Update report status to paid
      const { error: updateErr } = await supabase
        .from("paid_reports")
        .update({ status: "paid", payment_id: razorpayPaymentId })
        .eq("id", reportId);

      if (updateErr) {
        console.error("Failed to update report:", updateErr);
        throw new Error("Failed to update payment status");
      }
    }

    // ===== STRIPE VERIFICATION =====
    else if (gateway === "stripe" && stripeSessionId) {
      const stripeKey = config.stripe_key;
      if (!stripeKey) {
        throw new Error("Stripe configuration missing");
      }

      // Verify Stripe session
      const sessionResp = await fetch(`https://api.stripe.com/v1/checkout/sessions/${stripeSessionId}`, {
        headers: { "Authorization": `Bearer ${stripeKey}` },
      });

      if (!sessionResp.ok) {
        const errText = await sessionResp.text();
        console.error("Stripe session fetch failed:", errText);
        throw new Error("Failed to verify Stripe payment");
      }

      const session = await sessionResp.json();

      if (session.payment_status !== "paid") {
        return new Response(JSON.stringify({ success: false, error: "Payment not completed" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Verify report ID matches
      if (session.metadata?.report_id !== reportId) {
        return new Response(JSON.stringify({ success: false, error: "Report ID mismatch" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error: updateErr } = await supabase
        .from("paid_reports")
        .update({ status: "paid", payment_id: session.payment_intent || stripeSessionId })
        .eq("id", reportId);

      if (updateErr) {
        console.error("Failed to update report:", updateErr);
        throw new Error("Failed to update payment status");
      }
    } else {
      return new Response(JSON.stringify({ success: false, error: "Invalid payment verification request" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log usage
    supabase.from("api_usage_logs").insert({
      function_name: "verify-payment", is_ai_call: false, estimated_cost: 0, status_code: 200,
    }).catch(() => {});

    return new Response(JSON.stringify({ success: true, reportId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("verify-payment error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
