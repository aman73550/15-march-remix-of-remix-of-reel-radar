import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { reelUrl, analysisData } = await req.json();

    // === INPUT VALIDATION ===
    if (!reelUrl || typeof reelUrl !== "string" || reelUrl.trim().length > 500) {
      return new Response(JSON.stringify({ success: false, error: "Invalid reel URL" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // Allow both Instagram URLs and seo: prefixed topics
    const isSeoRequest = reelUrl.startsWith("seo:");
    if (!isSeoRequest) {
      const urlPattern = /^https?:\/\/(www\.)?(instagram\.com|instagr\.am)\/(reel|reels|p)\//i;
      if (!urlPattern.test(reelUrl.trim())) {
        return new Response(JSON.stringify({ success: false, error: "Invalid Instagram URL" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // === RATE LIMITING ===
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ipHash = await hashString(clientIp);
    const { data: allowed } = await supabase.rpc("check_rate_limit", {
      p_ip_hash: ipHash,
      p_function_name: "create-payment",
      p_max_requests: 10,
      p_window_minutes: 60,
    });
    if (allowed === false) {
      return new Response(JSON.stringify({ success: false, error: "Too many payment requests. Please try again later." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get config
    const { data: configData } = await supabase.from("site_config").select("config_key, config_value");
    const config: Record<string, string> = {};
    if (configData) {
      for (const row of configData) config[row.config_key] = row.config_value;
    }

    const gateway = config.payment_gateway || "razorpay";
    const price = parseInt(config.report_price || "29");
    const currency = config.currency || "INR";

    // Create paid_reports entry
    const { data: report, error: insertErr } = await supabase
      .from("paid_reports")
      .insert({
        reel_url: reelUrl,
        amount: price,
        currency,
        payment_gateway: gateway,
        status: "pending",
        analysis_data: analysisData,
      })
      .select("id")
      .single();

    if (insertErr || !report) {
      throw new Error("Failed to create report entry: " + (insertErr?.message || "unknown"));
    }

    // ===== RAZORPAY =====
    if (gateway === "razorpay") {
      const razorpayKeyId = config.razorpay_key_id;
      const razorpayKeySecret = config.razorpay_key_secret;

      if (!razorpayKeyId || !razorpayKeySecret) {
        return new Response(JSON.stringify({ success: false, error: "Payment gateway not configured. Set Razorpay keys in Admin Panel → Config." }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const authHeader = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
      const orderResp = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${authHeader}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: price * 100,
          currency,
          receipt: report.id,
          notes: { report_id: report.id, reel_url: reelUrl },
        }),
      });

      if (!orderResp.ok) {
        const errText = await orderResp.text();
        console.error("Razorpay order creation failed:", errText);
        throw new Error("Payment order creation failed");
      }

      const order = await orderResp.json();

      await supabase
        .from("paid_reports")
        .update({ payment_id: order.id })
        .eq("id", report.id);

      return new Response(JSON.stringify({
        success: true,
        gateway: "razorpay",
        orderId: order.id,
        reportId: report.id,
        amount: price,
        currency,
        keyId: razorpayKeyId,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ===== STRIPE =====
    if (gateway === "stripe") {
      const stripeKey = config.stripe_key;

      if (!stripeKey) {
        return new Response(JSON.stringify({ success: false, error: "Stripe not configured. Set Stripe key in Admin Panel → Config." }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create Stripe Checkout Session
      const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/$/, "") || "https://localhost";
      const sessionResp = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${stripeKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          "mode": "payment",
          "payment_method_types[0]": "card",
          "line_items[0][price_data][currency]": currency.toLowerCase(),
          "line_items[0][price_data][unit_amount]": String(price * 100),
          "line_items[0][price_data][product_data][name]": isSeoRequest ? "SEO Analysis Report" : "Master Analysis Report",
          "success_url": `${origin}?payment=success&report_id=${report.id}&session_id={CHECKOUT_SESSION_ID}`,
          "cancel_url": `${origin}?payment=cancelled`,
          "metadata[report_id]": report.id,
          "metadata[reel_url]": reelUrl,
        }),
      });

      if (!sessionResp.ok) {
        const errText = await sessionResp.text();
        console.error("Stripe session creation failed:", errText);
        throw new Error("Stripe checkout session creation failed");
      }

      const session = await sessionResp.json();

      await supabase
        .from("paid_reports")
        .update({ payment_id: session.id })
        .eq("id", report.id);

      return new Response(JSON.stringify({
        success: true,
        gateway: "stripe",
        sessionId: session.id,
        sessionUrl: session.url,
        reportId: report.id,
        amount: price,
        currency,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log usage
    supabase.from("api_usage_logs").insert({
      function_name: "create-payment", is_ai_call: false, estimated_cost: 0, status_code: 200,
    }).catch(() => {});

    // Fallback: manual/WhatsApp payment
    return new Response(JSON.stringify({
      success: true,
      gateway: "manual",
      reportId: report.id,
      amount: price,
      currency,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("create-payment error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
