import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { reelUrl, analysisData } = await req.json();

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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

    if (gateway === "razorpay") {
      const razorpayKeyId = config.razorpay_key_id;
      const razorpayKeySecret = config.razorpay_key_secret;

      if (!razorpayKeyId || !razorpayKeySecret) {
        return new Response(JSON.stringify({ success: false, error: "Payment gateway not configured" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create Razorpay order
      const authHeader = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
      const orderResp = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${authHeader}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: price * 100, // Razorpay expects paisa
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

      // Update report with payment info
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
        keyId: razorpayKeyId, // Public key for frontend
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: return report info for manual/WhatsApp payment
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
