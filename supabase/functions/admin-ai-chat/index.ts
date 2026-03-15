import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are the Admin AI Assistant for a Viral Reel Analysis platform. You have complete knowledge of the system architecture and can help troubleshoot issues and manage configurations.

## System Architecture
- **Frontend**: React + Vite + Tailwind CSS + TypeScript (SPA)
- **Backend**: Supabase (Lovable Cloud) — PostgreSQL DB, Edge Functions, Auth
- **AI Provider**: Gemini API (multi-key rotation from DB)
- **Payments**: Razorpay / Stripe (configurable)

## Database Tables
1. **usage_logs** — Tracks free reel analyses (reel_url, ip_hash, user_agent, created_at)
2. **viral_patterns** — Stores analysis results (viral_score, hook_score, caption_score, etc.)
3. **paid_reports** — Paid master report orders (amount, status, payment_id, analysis_data, pdf_url)
4. **ad_config** — Ad slot configuration (slot_name, ad_code, ad_type, enabled)
5. **site_config** — Key-value settings (report_price, payment_gateway, whatsapp_number, api keys, behaviour_settings)
6. **feedback** — User ratings and comments
7. **api_usage_logs** — API call tracking (function_name, tokens_used, estimated_cost, ai_model)
8. **user_roles** — Admin role management (user_id, role)

## Edge Functions
1. **analyze-reel** — Main analysis: fetches Instagram reel data, calls Gemini for scoring. Rate limited: 20/hr per IP. Input validated: URL format, length, metrics.
2. **generate-master-report** — Premium paid report generation with deep insights. Rate limited: 5/hr per IP.
3. **seo-analyze** — SEO optimization for reel topics. Rate limited: 15/hr per IP. Input validated: topic length 3-1000 chars.
4. **create-payment** — Creates Razorpay/Stripe payment orders. Rate limited: 10/hr per IP. Input validated: URL format.
5. **verify-payment** — Verifies payment completion
6. **check-reel-date** — Validates reel recency
7. **create-admin** — One-time admin user creation
8. **usage-analyzer** — Usage statistics aggregation
9. **admin-ai-chat** — This AI assistant (admin-only, JWT + role verified)

## Rate Limiting
- All public edge functions have IP-based rate limiting via rate_limits table
- Limits: analyze-reel (20/hr), seo-analyze (15/hr), create-payment (10/hr), generate-master-report (5/hr)
- Rate limits use DB function check_rate_limit() with SHA-256 IP hashing
- Admin endpoints bypass rate limits via JWT verification

## Input Validation
- All URLs validated against Instagram pattern: /^https?:\\/\\/(www\\.)?(instagram\\.com|instagr\\.am)\\/(reel|reels|p)\\//
- Text fields have max length limits (URL: 500, caption: 5000, hashtags: 2000, topic: 1000)
- Numeric metrics validated as positive numbers
- Both client-side and server-side validation implemented

## Config Keys in site_config
- report_price, payment_gateway, razorpay_key_id, razorpay_key_secret, stripe_key
- whatsapp_number, example_pdf_url
- gemini_api_keys, openai_api_keys, firecrawl_api_keys (comma-separated multi-key)
- behaviour_settings (JSON with triggers, overlays, limits)

## Key Features
- Free reel viral score analysis (limited per day via behaviour settings)
- Paid Master Report with premium insights
- 35+ ad slots across all pages
- SEO optimizer tool
- Multi-API key rotation (10 keys per provider, auto-failover)
- Admin panel at /bosspage with sidebar navigation

## What You Can Do
1. **Check System Status**: Query database tables for health checks
2. **Diagnose Issues**: Analyze error patterns, check API key status, verify configurations
3. **Manage Config**: Update site_config values (prices, API keys, WhatsApp number, etc.)
4. **Ad Management**: Enable/disable ad slots, check ad deployment status
5. **View Analytics**: Pull usage stats, revenue data, feedback summaries
6. **Troubleshoot**: Guide admin through common issues and fixes

## Available Actions (use these JSON action blocks when you want to execute something)
When you need to execute an action, output it as: [ACTION:action_name:params_json]

Available actions:
- [ACTION:read_config:{"key":"config_key"}] — Read a config value
- [ACTION:update_config:{"key":"config_key","value":"new_value"}] — Update a config value
- [ACTION:check_stats:{}] — Get usage statistics
- [ACTION:check_api_keys:{}] — Check API key health
- [ACTION:toggle_ad:{"slot_name":"slot_name","enabled":true/false}] — Toggle an ad slot
- [ACTION:check_payments:{}] — Get payment statistics
- [ACTION:check_feedback:{}] — Get feedback summary
- [ACTION:run_query:{"table":"table_name","select":"columns","limit":10}] — Read data from a table

IMPORTANT: Always explain what you're doing. Be helpful, concise, and proactive. If you detect a potential issue, suggest a fix. Respond in the same language as the user (Hindi/Hinglish or English).`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, action } = await req.json();

    // Verify admin role
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user is admin
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin");

    if (!roles || roles.length === 0) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle direct actions (from parsed action blocks)
    if (action) {
      const result = await executeAction(supabase, action);
      return new Response(JSON.stringify({ success: true, result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Gather live system context
    const systemContext = await gatherSystemContext(supabase);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI gateway not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + "\n\n## LIVE SYSTEM STATUS\n" + systemContext },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Lovable workspace settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Admin AI chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function gatherSystemContext(supabase: any): Promise<string> {
  const lines: string[] = [];

  try {
    // Usage stats
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const [totalUsage, todayUsage] = await Promise.all([
      supabase.from("usage_logs").select("id", { count: "exact", head: true }),
      supabase.from("usage_logs").select("id", { count: "exact", head: true }).gte("created_at", todayStart),
    ]);
    lines.push(`- Total analyses: ${totalUsage.count || 0}, Today: ${todayUsage.count || 0}`);

    // Paid reports
    const { data: paidData } = await supabase.from("paid_reports").select("amount, status");
    const paid = (paidData || []) as any[];
    const completed = paid.filter((r: any) => r.status === "completed" || r.status === "paid");
    const revenue = completed.reduce((s: number, r: any) => s + (Number(r.amount) || 0), 0);
    lines.push(`- Paid reports: ${completed.length}, Revenue: ₹${revenue}, Pending: ${paid.filter((r: any) => r.status === "pending").length}`);

    // Config
    const { data: configData } = await supabase.from("site_config").select("config_key, config_value");
    if (configData) {
      const configs: Record<string, string> = {};
      for (const row of configData as any[]) {
        // Mask sensitive values
        if (row.config_key.includes("secret") || row.config_key.includes("key")) {
          configs[row.config_key] = row.config_value ? `***set*** (${row.config_value.length} chars)` : "NOT SET";
        } else {
          configs[row.config_key] = row.config_value || "empty";
        }
      }
      lines.push(`- Config keys: ${JSON.stringify(configs)}`);
    }

    // Ad slots
    const { data: adData } = await supabase.from("ad_config").select("slot_name, enabled, ad_code, ad_type");
    if (adData) {
      const ads = adData as any[];
      const active = ads.filter((a: any) => a.enabled && a.ad_code);
      lines.push(`- Ad slots: ${ads.length} total, ${active.length} active with code`);
    }

    // Feedback
    const { data: fbData } = await supabase.from("feedback").select("rating");
    if (fbData) {
      const fb = fbData as any[];
      const avg = fb.length ? (fb.reduce((s: number, f: any) => s + f.rating, 0) / fb.length).toFixed(1) : "N/A";
      lines.push(`- Feedback: ${fb.length} reviews, Avg rating: ${avg}/5`);
    }

    // API usage (last 24h)
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    const { data: apiData } = await supabase.from("api_usage_logs").select("function_name, estimated_cost, status_code")
      .gte("created_at", yesterday);
    if (apiData) {
      const api = apiData as any[];
      const errors = api.filter((a: any) => a.status_code && a.status_code >= 400);
      const cost = api.reduce((s: number, a: any) => s + (Number(a.estimated_cost) || 0), 0);
      lines.push(`- API calls (24h): ${api.length}, Errors: ${errors.length}, Est. cost: $${cost.toFixed(4)}`);
    }
  } catch (e) {
    lines.push(`- Error fetching context: ${e}`);
  }

  return lines.join("\n");
}

async function executeAction(supabase: any, action: { name: string; params: Record<string, any> }): Promise<any> {
  switch (action.name) {
    case "read_config": {
      const { data } = await supabase.from("site_config").select("config_value").eq("config_key", action.params.key).single();
      return data?.config_value || null;
    }
    case "update_config": {
      const { data: existing } = await supabase.from("site_config").select("id").eq("config_key", action.params.key).single();
      if (existing) {
        await supabase.from("site_config").update({ config_value: action.params.value, updated_at: new Date().toISOString() }).eq("config_key", action.params.key);
      } else {
        await supabase.from("site_config").insert({ config_key: action.params.key, config_value: action.params.value });
      }
      return `Config '${action.params.key}' updated to '${action.params.value}'`;
    }
    case "check_stats": {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const [total, today] = await Promise.all([
        supabase.from("usage_logs").select("id", { count: "exact", head: true }),
        supabase.from("usage_logs").select("id", { count: "exact", head: true }).gte("created_at", todayStart),
      ]);
      return { total: total.count || 0, today: today.count || 0 };
    }
    case "check_api_keys": {
      const { data } = await supabase.from("site_config").select("config_key, config_value")
        .in("config_key", ["gemini_api_keys", "openai_api_keys", "firecrawl_api_keys"]);
      const result: Record<string, any> = {};
      for (const row of (data || []) as any[]) {
        const keys = row.config_value ? row.config_value.split(",").filter(Boolean) : [];
        result[row.config_key] = { count: keys.length, configured: keys.length > 0 };
      }
      return result;
    }
    case "toggle_ad": {
      const { error } = await supabase.from("ad_config")
        .update({ enabled: action.params.enabled, updated_at: new Date().toISOString() })
        .eq("slot_name", action.params.slot_name);
      return error ? `Error: ${error.message}` : `Ad slot '${action.params.slot_name}' ${action.params.enabled ? "enabled" : "disabled"}`;
    }
    case "check_payments": {
      const { data } = await supabase.from("paid_reports").select("amount, status, created_at").order("created_at", { ascending: false }).limit(10);
      return data || [];
    }
    case "check_feedback": {
      const { data } = await supabase.from("feedback").select("rating, comment, created_at").order("created_at", { ascending: false }).limit(10);
      return data || [];
    }
    case "run_query": {
      const { table, select, limit } = action.params;
      const allowedTables = ["usage_logs", "viral_patterns", "paid_reports", "ad_config", "site_config", "feedback", "api_usage_logs"];
      if (!allowedTables.includes(table)) return { error: "Table not allowed" };
      const { data, error } = await supabase.from(table).select(select || "*").limit(limit || 10).order("created_at", { ascending: false });
      return error ? { error: error.message } : data;
    }
    default:
      return { error: "Unknown action" };
  }
}
