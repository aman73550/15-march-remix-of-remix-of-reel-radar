import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type ToolType = "analysis" | "seo" | "master_report";

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}

function toPositiveNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return parsed;
}

function inferToolType(payload: { tool?: string; reelUrl: string; analysisData: unknown }): ToolType {
  if (payload.tool === "analysis" || payload.tool === "seo" || payload.tool === "master_report") return payload.tool;

  const isSeoRequest = payload.reelUrl.startsWith("seo:") ||
    (typeof payload.analysisData === "object" && payload.analysisData !== null && (payload.analysisData as any).type === "seo");
  if (isSeoRequest) return "seo";

  // Analysis popup currently sends null analysisData; master report sends full analysis object.
  if (payload.analysisData == null) return "analysis";
  return "master_report";
}

function getPricingForTool(tool: ToolType, config: Record<string, string>) {
  if (tool === "analysis") {
    return {
      mode: config.analysis_pricing_mode || "free",
      amount: toPositiveNumber(config.analysis_price, 10),
      label: "Reel Analysis",
    };
  }

  if (tool === "seo") {
    return {
      mode: config.seo_pricing_mode || config.report_pricing_mode || "paid",
      amount: toPositiveNumber(config.seo_price ?? config.report_price, 10),
      label: "SEO Analysis Report",
    };
  }

  return {
    mode: config.report_pricing_mode || "paid",
    amount: toPositiveNumber(config.report_price, 29),
    label: "Master Analysis Report",
  };
}

function buildReturnUrls(req: Request, tool: ToolType, reportId: string, reelUrl: string) {
  const referer = req.headers.get("referer") || "";
  let origin = req.headers.get("origin") || "";

  try {
    if (!origin && referer) origin = new URL(referer).origin;
  } catch {
    // ignore
  }

  if (!origin) origin = "https://localhost";

  let pathname = "/";
  try {
    if (referer) pathname = new URL(referer).pathname || "/";
  } catch {
    // ignore
  }

  const base = `${origin}${pathname}`;
  const encodedReelUrl = encodeURIComponent(reelUrl);

  return {
    successUrl: `${base}?payment=success&tool=${tool}&report_id=${reportId}&session_id={CHECKOUT_SESSION_ID}&reel_url=${encodedReelUrl}`,
    cancelUrl: `${base}?payment=cancelled&tool=${tool}`,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { reelUrl, analysisData, tool } = await req.json();

    if (!reelUrl || typeof reelUrl !== "string" || reelUrl.trim().length > 500) {
      return new Response(JSON.stringify({ success: false, error: "Invalid reel URL" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const trimmedReelUrl = reelUrl.trim();
    const toolType = inferToolType({ tool, reelUrl: trimmedReelUrl, analysisData });

    if (toolType !== "seo") {
      const urlPattern = /^https?:\/\/(www\.)?(instagram\.com|instagr\.am)\/(reel|reels|p)\//i;
      if (!urlPattern.test(trimmedReelUrl)) {
        return new Response(JSON.stringify({ success: false, error: "Invalid Instagram URL" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: configData } = await supabase.from("site_config").select("config_key, config_value");
    const config: Record<string, string> = {};
    if (configData) {
      for (const row of configData) config[row.config_key] = row.config_value;
    }

    const pricing = getPricingForTool(toolType, config);
    const gateway = config.payment_gateway || "razorpay";
    const currency = config.currency || "INR";
    const requiresPayment = pricing.mode === "paid" && pricing.amount > 0;

    // Free mode: create already-paid record and return directly
    if (!requiresPayment) {
      const { data: freeReport, error: freeInsertErr } = await supabase
        .from("paid_reports")
        .insert({
          reel_url: trimmedReelUrl,
          amount: 0,
          currency,
          payment_gateway: "free",
          status: "paid",
          completed_at: new Date().toISOString(),
          analysis_data: analysisData,
        })
        .select("id")
        .single();

      if (freeInsertErr || !freeReport) {
        throw new Error("Failed to create free report entry: " + (freeInsertErr?.message || "unknown"));
      }

      return new Response(JSON.stringify({
        success: true,
        gateway: "free",
        reportId: freeReport.id,
        amount: 0,
        currency,
        tool: toolType,
        pricingMode: "free",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Paid mode: create pending payment record first
    const { data: report, error: insertErr } = await supabase
      .from("paid_reports")
      .insert({
        reel_url: trimmedReelUrl,
        amount: pricing.amount,
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
        return new Response(JSON.stringify({ success: false, error: "Payment gateway not configured. Set Razorpay keys in Admin Panel → Config." }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const authHeader = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
      const orderResp = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(pricing.amount * 100),
          currency,
          receipt: report.id,
          notes: { report_id: report.id, reel_url: trimmedReelUrl, tool: toolType },
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
        amount: pricing.amount,
        currency,
        keyId: razorpayKeyId,
        tool: toolType,
        pricingMode: "paid",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (gateway === "stripe") {
      const stripeKey = config.stripe_key;

      if (!stripeKey) {
        return new Response(JSON.stringify({ success: false, error: "Stripe not configured. Set Stripe key in Admin Panel → Config." }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { successUrl, cancelUrl } = buildReturnUrls(req, toolType, report.id, trimmedReelUrl);

      const sessionResp = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          "mode": "payment",
          "payment_method_types[0]": "card",
          "line_items[0][price_data][currency]": currency.toLowerCase(),
          "line_items[0][price_data][unit_amount]": String(Math.round(pricing.amount * 100)),
          "line_items[0][price_data][product_data][name]": pricing.label,
          "success_url": successUrl,
          "cancel_url": cancelUrl,
          "metadata[report_id]": report.id,
          "metadata[reel_url]": trimmedReelUrl,
          "metadata[tool]": toolType,
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
        amount: pricing.amount,
        currency,
        tool: toolType,
        pricingMode: "paid",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      gateway: "manual",
      reportId: report.id,
      amount: pricing.amount,
      currency,
      tool: toolType,
      pricingMode: "paid",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("create-payment error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
