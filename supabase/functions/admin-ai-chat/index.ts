import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are the **SUPER ADMIN AI ASSISTANT** for a Viral Reel Analysis platform. You have FULL ACCESS to the entire system — every database table, every configuration, every edge function, and every diagnostic tool. You are the most powerful system administrator.

## Your Capabilities
You can READ, WRITE, UPDATE, DELETE data in ANY table. You can run complex queries, aggregate data, diagnose errors, fix configurations, manage users, control ads, analyze revenue, and troubleshoot ANY issue.

## System Architecture
- **Frontend**: React + Vite + Tailwind CSS + TypeScript (SPA deployed on Lovable)
- **Backend**: Supabase (Lovable Cloud) — PostgreSQL DB, Edge Functions, Auth
- **AI Provider**: Gemini API (multi-key rotation from DB, up to 10 keys)
- **Payments**: Razorpay / Stripe (configurable via site_config)
- **Scraping**: 4-layer fallback (meta tags → Firecrawl → oEmbed → noembed)

## Complete Database Schema

### usage_logs
Tracks every free reel analysis. Columns: id (uuid), reel_url (text), created_at (timestamptz), user_agent (text), ip_hash (text)

### viral_patterns
Stores detailed analysis results. Columns: id (uuid), reel_url (text), author_name, primary_category, sub_category, content_type, hook_type, hook_score (0-80), caption_score, hashtag_score, engagement_score, trend_score, viral_score, viral_status, video_length_estimate, scene_cuts, face_presence, text_overlay, motion_intensity, video_quality_score, audio_quality_score, music_usage, hashtag_count, caption_length, has_cta, curiosity_level, likes, comments, views, shares, saves, engagement_rate, matched_trends (text[]), emotional_triggers (text[]), thumbnail_analyzed, created_at

### paid_reports
Purchase tracking. Columns: id, reel_url, payment_id, payment_gateway (razorpay/stripe), amount, currency, status (pending/completed/paid/failed), customer_email, customer_phone, pdf_url, analysis_data (jsonb), created_at, completed_at

### ad_config
Ad slot management. Columns: id, slot_name, enabled (bool), ad_code (text), ad_type (adsense/affiliate/custom), updated_at

### site_config
Key-value system settings. Columns: id, config_key, config_value, updated_at
Known keys: report_price, payment_gateway, razorpay_key_id, razorpay_key_secret, stripe_key, whatsapp_number, example_pdf_url, gemini_api_keys, openai_api_keys, firecrawl_api_keys, behaviour_settings, currency

### feedback
User ratings. Columns: id, reel_url, rating (1-5), comment (text), created_at

### api_usage_logs
API call tracking. Columns: id, function_name, is_ai_call, estimated_cost, tokens_used, status_code, duration_ms, ai_model, ai_provider, created_at

### user_roles
Admin role management. Columns: id, user_id (uuid), role (admin/moderator/user)

### rate_limits
IP-based rate limiting. Columns: id, ip_hash, function_name, window_start, request_count

### traffic_sessions
Visitor traffic tracking with bot detection. Columns: id, session_id, referrer_source, referrer_url, utm_source, utm_medium, utm_campaign, share_id, device_type, browser, os, screen_size, language, timezone, ip_hash, country, city, session_start, session_end, page_views, scroll_depth, click_count, duration_seconds, has_mouse_movement, has_scroll, has_click, has_input_interaction, navigation_variation, is_bot, bot_score, bot_flags (text[]), is_real_user, created_at

### share_events
Share button click tracking. Columns: id, platform, share_id, shared_url, referrer_session_id, clicks_generated, created_at

## Edge Functions (11 Active)
1. **analyze-reel** — Main analysis engine. Fetches Instagram data, calls Gemini AI. Rate: 20/hr per IP
2. **generate-master-report** — Premium paid report with deep insights. Rate: 5/hr per IP
3. **seo-analyze** — SEO optimization for topics. Rate: 15/hr per IP
4. **create-payment** — Creates Razorpay/Stripe orders. Rate: 10/hr per IP
5. **verify-payment** — Verifies payment completion, updates paid_reports status
6. **check-reel-date** — Validates reel recency (15+ day penalty)
7. **create-admin** — One-time admin user setup (requires secret_key)
8. **usage-analyzer** — Usage statistics aggregation
9. **admin-ai-chat** — This assistant (admin-only)
10. **traffic-analytics** — Traffic intelligence: real vs bot detection, viral spikes, share tracking

## Scoring System
- ALL scores capped at 80 max (nothing is 100% perfect)
- Sub-scores max 8/10
- Virality bonuses: recognizable person, strong facial expression, trending topic, famous incident
- Category bonuses: entertainment/music/dance/fashion = higher; educational = lower
- Age penalty: 15+ day old reels get reduced score

## Available Actions
Use these action blocks to execute operations:

### Data Reading
- [ACTION:run_query:{"table":"TABLE","select":"COLUMNS","limit":N,"filters":[{"col":"COLUMN","op":"eq/gt/lt/gte/lte/like/neq/in","val":"VALUE"}],"order":{"col":"COLUMN","asc":false}}]
- [ACTION:count_rows:{"table":"TABLE","filters":[{"col":"COLUMN","op":"eq","val":"VALUE"}]}]
- [ACTION:aggregate:{"table":"TABLE","column":"COLUMN","operation":"sum/avg/min/max","filters":[]}]

### Configuration Management
- [ACTION:read_config:{"key":"config_key"}]
- [ACTION:update_config:{"key":"config_key","value":"new_value"}]
- [ACTION:read_all_config:{}]

### Data Modification
- [ACTION:insert_row:{"table":"TABLE","data":{"col1":"val1","col2":"val2"}}]
- [ACTION:update_rows:{"table":"TABLE","filters":[{"col":"COLUMN","op":"eq","val":"VALUE"}],"data":{"col1":"new_val"}}]
- [ACTION:delete_rows:{"table":"TABLE","filters":[{"col":"COLUMN","op":"eq","val":"VALUE"}]}]

### Ad Management
- [ACTION:toggle_ad:{"slot_name":"SLOT","enabled":true}]
- [ACTION:update_ad:{"slot_name":"SLOT","ad_code":"CODE","ad_type":"adsense/affiliate/custom"}]
- [ACTION:list_ads:{}]

### System Diagnostics
- [ACTION:check_stats:{}] — Full usage stats
- [ACTION:check_api_keys:{}] — API key health
- [ACTION:check_payments:{}] — Payment stats
- [ACTION:check_feedback:{}] — Feedback summary
- [ACTION:check_errors:{"hours":24}] — Recent API errors
- [ACTION:check_rate_limits:{}] — Current rate limit status
- [ACTION:system_health:{}] — Complete system health check

### Revenue & Analytics
- [ACTION:revenue_report:{"days":30}] — Revenue over period
- [ACTION:top_content:{"limit":10}] — Top viral content
- [ACTION:usage_trends:{"days":7}] — Daily usage trends

### User Management
- [ACTION:list_admins:{}] — List all admin users

### Bulk Operations
- [ACTION:clear_rate_limits:{}] — Clear all rate limits (if users stuck)
- [ACTION:reset_config:{"key":"KEY","default":"VALUE"}] — Reset config to default

## Response Guidelines
1. **Be extremely helpful** — Solve problems, don't just describe them
2. **Execute actions proactively** — If asked to check something, run the query immediately
3. **Diagnose root causes** — Don't just report symptoms
4. **Suggest fixes** — Always provide actionable solutions
5. **Show data clearly** — Format tables, use emojis for status indicators
6. **Security conscious** — Mask sensitive values (API keys, secrets)
7. **Language matching** — Respond in Hindi/Hinglish if user writes in Hindi/Hinglish, English otherwise
8. **Be concise but thorough** — Cover all aspects without unnecessary padding`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, action } = await req.json();

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

    // Handle direct actions
    if (action) {
      const result = await executeAction(supabase, action);
      return new Response(JSON.stringify({ success: true, result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Gather comprehensive live system context
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
          { role: "system", content: SYSTEM_PROMPT + "\n\n## LIVE SYSTEM STATUS (Real-time Data)\n" + systemContext },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Admin AI chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function gatherSystemContext(supabase: any): Promise<string> {
  const lines: string[] = [];
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  try {
    const [totalUsage, todayUsage, weekUsage, paidReports, configData, adData, fbData, apiData, rateLimitData] = await Promise.all([
      supabase.from("usage_logs").select("id", { count: "exact", head: true }),
      supabase.from("usage_logs").select("id", { count: "exact", head: true }).gte("created_at", todayStart),
      supabase.from("usage_logs").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
      supabase.from("paid_reports").select("amount, status, payment_gateway, currency, created_at"),
      supabase.from("site_config").select("config_key, config_value"),
      supabase.from("ad_config").select("slot_name, enabled, ad_code, ad_type"),
      supabase.from("feedback").select("rating, comment, created_at").order("created_at", { ascending: false }).limit(20),
      supabase.from("api_usage_logs").select("function_name, estimated_cost, status_code, duration_ms, is_ai_call, ai_model, tokens_used").gte("created_at", yesterday),
      supabase.from("rate_limits").select("ip_hash, function_name, request_count, window_start").gte("window_start", todayStart),
    ]);

    // Usage
    lines.push(`### 📊 Usage Statistics`);
    lines.push(`- Total all-time: ${totalUsage.count || 0}`);
    lines.push(`- Today: ${todayUsage.count || 0}`);
    lines.push(`- This week: ${weekUsage.count || 0}`);

    // Revenue
    const paid = (paidReports.data || []) as any[];
    const completed = paid.filter((r: any) => r.status === "completed" || r.status === "paid");
    const pending = paid.filter((r: any) => r.status === "pending");
    const failed = paid.filter((r: any) => r.status === "failed");
    const revenue = completed.reduce((s: number, r: any) => s + (Number(r.amount) || 0), 0);
    const todayRevenue = completed.filter((r: any) => r.created_at >= todayStart).reduce((s: number, r: any) => s + (Number(r.amount) || 0), 0);
    lines.push(`### 💰 Revenue`);
    lines.push(`- Total revenue: ₹${revenue} (${completed.length} orders)`);
    lines.push(`- Today: ₹${todayRevenue}`);
    lines.push(`- Pending: ${pending.length}, Failed: ${failed.length}`);
    const gateways: Record<string, number> = {};
    completed.forEach((r: any) => { gateways[r.payment_gateway || "unknown"] = (gateways[r.payment_gateway || "unknown"] || 0) + 1; });
    lines.push(`- By gateway: ${JSON.stringify(gateways)}`);

    // Config
    if (configData.data) {
      lines.push(`### ⚙️ Configuration`);
      for (const row of configData.data as any[]) {
        if (row.config_key.includes("secret") || row.config_key.includes("key")) {
          const val = row.config_value;
          lines.push(`- ${row.config_key}: ${val ? `✅ SET (${val.split(",").length} key(s), ${val.length} chars)` : "❌ NOT SET"}`);
        } else if (row.config_key === "behaviour_settings") {
          try {
            const bs = JSON.parse(row.config_value);
            lines.push(`- behaviour_settings: ${JSON.stringify(bs)}`);
          } catch { lines.push(`- behaviour_settings: ${row.config_value || "empty"}`); }
        } else {
          lines.push(`- ${row.config_key}: ${row.config_value || "empty"}`);
        }
      }
    }

    // Ads
    if (adData.data) {
      const ads = adData.data as any[];
      const active = ads.filter((a: any) => a.enabled && a.ad_code);
      const enabledNoCode = ads.filter((a: any) => a.enabled && !a.ad_code);
      const disabled = ads.filter((a: any) => !a.enabled);
      lines.push(`### 📢 Ad Slots`);
      lines.push(`- Total: ${ads.length}, Active (with code): ${active.length}, Enabled (no code): ${enabledNoCode.length}, Disabled: ${disabled.length}`);
      const byType: Record<string, number> = {};
      ads.forEach((a: any) => { byType[a.ad_type] = (byType[a.ad_type] || 0) + 1; });
      lines.push(`- By type: ${JSON.stringify(byType)}`);
    }

    // Feedback
    if (fbData.data) {
      const fb = fbData.data as any[];
      const avg = fb.length ? (fb.reduce((s: number, f: any) => s + f.rating, 0) / fb.length).toFixed(1) : "N/A";
      const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      fb.forEach((f: any) => { dist[f.rating] = (dist[f.rating] || 0) + 1; });
      lines.push(`### ⭐ Feedback`);
      lines.push(`- Total: ${fb.length}, Avg: ${avg}/5`);
      lines.push(`- Distribution: ${Object.entries(dist).map(([k, v]) => `${k}★:${v}`).join(", ")}`);
      const recent = fb.slice(0, 3).map((f: any) => `${f.rating}★${f.comment ? `: "${f.comment.slice(0, 50)}"` : ""}`);
      if (recent.length) lines.push(`- Recent: ${recent.join(" | ")}`);
    }

    // API usage
    if (apiData.data) {
      const api = apiData.data as any[];
      const errors = api.filter((a: any) => a.status_code && a.status_code >= 400);
      const aiCalls = api.filter((a: any) => a.is_ai_call);
      const totalCost = api.reduce((s: number, a: any) => s + (Number(a.estimated_cost) || 0), 0);
      const totalTokens = aiCalls.reduce((s: number, a: any) => s + (Number(a.tokens_used) || 0), 0);
      const avgDuration = api.length ? Math.round(api.reduce((s: number, a: any) => s + (Number(a.duration_ms) || 0), 0) / api.length) : 0;
      const funcCounts: Record<string, number> = {};
      api.forEach((a: any) => { funcCounts[a.function_name] = (funcCounts[a.function_name] || 0) + 1; });
      const errorDetails: Record<string, number> = {};
      errors.forEach((a: any) => { errorDetails[`${a.function_name}:${a.status_code}`] = (errorDetails[`${a.function_name}:${a.status_code}`] || 0) + 1; });
      lines.push(`### 🔧 API Usage (24h)`);
      lines.push(`- Total calls: ${api.length}, AI calls: ${aiCalls.length}, Errors: ${errors.length}`);
      lines.push(`- Est. cost: $${totalCost.toFixed(4)}, Tokens: ${totalTokens}, Avg duration: ${avgDuration}ms`);
      lines.push(`- By function: ${JSON.stringify(funcCounts)}`);
      if (errors.length) lines.push(`- Errors: ${JSON.stringify(errorDetails)}`);
    }

    // Rate limits
    if (rateLimitData.data) {
      const rl = rateLimitData.data as any[];
      if (rl.length) {
        const blocked = rl.filter((r: any) => r.request_count >= 20);
        lines.push(`### 🚦 Rate Limits (Today)`);
        lines.push(`- Active entries: ${rl.length}, Potentially blocked: ${blocked.length}`);
      }
    }
  } catch (e) {
    lines.push(`- ⚠️ Error fetching context: ${e}`);
  }

  return lines.join("\n");
}

async function executeAction(supabase: any, action: { name: string; params: Record<string, any> }): Promise<any> {
  const ALLOWED_TABLES = ["usage_logs", "viral_patterns", "paid_reports", "ad_config", "site_config", "feedback", "api_usage_logs", "rate_limits", "user_roles"];
  
  const applyFilters = (query: any, filters: any[]) => {
    if (!filters?.length) return query;
    for (const f of filters) {
      switch (f.op) {
        case "eq": query = query.eq(f.col, f.val); break;
        case "neq": query = query.neq(f.col, f.val); break;
        case "gt": query = query.gt(f.col, f.val); break;
        case "lt": query = query.lt(f.col, f.val); break;
        case "gte": query = query.gte(f.col, f.val); break;
        case "lte": query = query.lte(f.col, f.val); break;
        case "like": query = query.like(f.col, f.val); break;
        case "ilike": query = query.ilike(f.col, f.val); break;
        case "in": query = query.in(f.col, f.val); break;
        case "is": query = query.is(f.col, f.val); break;
      }
    }
    return query;
  };

  try {
    switch (action.name) {
      // ===== DATA READING =====
      case "run_query": {
        const { table, select, limit, filters, order } = action.params;
        if (!ALLOWED_TABLES.includes(table)) return { error: `Table '${table}' not allowed` };
        let query = supabase.from(table).select(select || "*");
        query = applyFilters(query, filters);
        if (order) query = query.order(order.col, { ascending: order.asc ?? false });
        else query = query.order("created_at", { ascending: false });
        query = query.limit(limit || 20);
        const { data, error } = await query;
        return error ? { error: error.message } : data;
      }

      case "count_rows": {
        const { table, filters } = action.params;
        if (!ALLOWED_TABLES.includes(table)) return { error: `Table '${table}' not allowed` };
        let query = supabase.from(table).select("id", { count: "exact", head: true });
        query = applyFilters(query, filters);
        const { count, error } = await query;
        return error ? { error: error.message } : { count };
      }

      case "aggregate": {
        const { table, column, operation, filters } = action.params;
        if (!ALLOWED_TABLES.includes(table)) return { error: `Table '${table}' not allowed` };
        let query = supabase.from(table).select(column);
        query = applyFilters(query, filters);
        const { data, error } = await query;
        if (error) return { error: error.message };
        const values = (data || []).map((r: any) => Number(r[column])).filter((v: number) => !isNaN(v));
        if (!values.length) return { result: null, count: 0 };
        switch (operation) {
          case "sum": return { result: values.reduce((a: number, b: number) => a + b, 0), count: values.length };
          case "avg": return { result: values.reduce((a: number, b: number) => a + b, 0) / values.length, count: values.length };
          case "min": return { result: Math.min(...values), count: values.length };
          case "max": return { result: Math.max(...values), count: values.length };
          default: return { error: "Unknown operation" };
        }
      }

      // ===== CONFIG =====
      case "read_config": {
        const { data } = await supabase.from("site_config").select("config_value").eq("config_key", action.params.key).single();
        return data?.config_value ?? null;
      }

      case "read_all_config": {
        const { data } = await supabase.from("site_config").select("config_key, config_value");
        const result: Record<string, string> = {};
        for (const row of (data || []) as any[]) {
          if (row.config_key.includes("secret") || row.config_key.includes("key")) {
            result[row.config_key] = row.config_value ? `[SET - ${row.config_value.split(",").length} key(s)]` : "[NOT SET]";
          } else {
            result[row.config_key] = row.config_value || "";
          }
        }
        return result;
      }

      case "update_config": {
        const { data: existing } = await supabase.from("site_config").select("id").eq("config_key", action.params.key).single();
        if (existing) {
          const { error } = await supabase.from("site_config").update({ config_value: action.params.value, updated_at: new Date().toISOString() }).eq("config_key", action.params.key);
          if (error) return { error: error.message };
        } else {
          const { error } = await supabase.from("site_config").insert({ config_key: action.params.key, config_value: action.params.value });
          if (error) return { error: error.message };
        }
        return `✅ Config '${action.params.key}' updated`;
      }

      case "reset_config": {
        const { error } = await supabase.from("site_config").update({ config_value: action.params.default, updated_at: new Date().toISOString() }).eq("config_key", action.params.key);
        return error ? { error: error.message } : `✅ Config '${action.params.key}' reset to '${action.params.default}'`;
      }

      // ===== DATA MODIFICATION =====
      case "insert_row": {
        const { table, data } = action.params;
        if (!ALLOWED_TABLES.includes(table)) return { error: `Table '${table}' not allowed` };
        const { data: result, error } = await supabase.from(table).insert(data).select();
        return error ? { error: error.message } : result;
      }

      case "update_rows": {
        const { table, filters, data } = action.params;
        if (!ALLOWED_TABLES.includes(table)) return { error: `Table '${table}' not allowed` };
        if (!filters?.length) return { error: "Filters required for update" };
        let query = supabase.from(table).update(data);
        query = applyFilters(query, filters);
        const { data: result, error } = await query.select();
        return error ? { error: error.message } : { updated: result?.length || 0, data: result };
      }

      case "delete_rows": {
        const { table, filters } = action.params;
        if (!ALLOWED_TABLES.includes(table)) return { error: `Table '${table}' not allowed` };
        if (!filters?.length) return { error: "Filters required for delete" };
        let query = supabase.from(table).delete();
        query = applyFilters(query, filters);
        const { data: result, error } = await query.select();
        return error ? { error: error.message } : { deleted: result?.length || 0 };
      }

      // ===== AD MANAGEMENT =====
      case "toggle_ad": {
        const { error } = await supabase.from("ad_config").update({ enabled: action.params.enabled, updated_at: new Date().toISOString() }).eq("slot_name", action.params.slot_name);
        return error ? { error: error.message } : `✅ Ad '${action.params.slot_name}' ${action.params.enabled ? "enabled" : "disabled"}`;
      }

      case "update_ad": {
        const updateData: any = { updated_at: new Date().toISOString() };
        if (action.params.ad_code !== undefined) updateData.ad_code = action.params.ad_code;
        if (action.params.ad_type !== undefined) updateData.ad_type = action.params.ad_type;
        if (action.params.enabled !== undefined) updateData.enabled = action.params.enabled;
        const { error } = await supabase.from("ad_config").update(updateData).eq("slot_name", action.params.slot_name);
        return error ? { error: error.message } : `✅ Ad '${action.params.slot_name}' updated`;
      }

      case "list_ads": {
        const { data } = await supabase.from("ad_config").select("*").order("slot_name");
        return data;
      }

      // ===== DIAGNOSTICS =====
      case "check_stats": {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
        const [total, today, week] = await Promise.all([
          supabase.from("usage_logs").select("id", { count: "exact", head: true }),
          supabase.from("usage_logs").select("id", { count: "exact", head: true }).gte("created_at", todayStart),
          supabase.from("usage_logs").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
        ]);
        return { total: total.count || 0, today: today.count || 0, this_week: week.count || 0 };
      }

      case "check_api_keys": {
        const { data } = await supabase.from("site_config").select("config_key, config_value")
          .in("config_key", ["gemini_api_keys", "openai_api_keys", "firecrawl_api_keys", "razorpay_key_id", "razorpay_key_secret", "stripe_key"]);
        const result: Record<string, any> = {};
        for (const row of (data || []) as any[]) {
          const keys = row.config_value ? row.config_value.split(",").filter(Boolean) : [];
          result[row.config_key] = { count: keys.length, configured: keys.length > 0, lengths: keys.map((k: string) => k.trim().length) };
        }
        return result;
      }

      case "check_payments": {
        const { data } = await supabase.from("paid_reports").select("*").order("created_at", { ascending: false }).limit(20);
        const all = data || [];
        const completed = all.filter((r: any) => r.status === "completed" || r.status === "paid");
        const revenue = completed.reduce((s: number, r: any) => s + (Number(r.amount) || 0), 0);
        return { total_orders: all.length, completed: completed.length, revenue, recent: all.slice(0, 10) };
      }

      case "check_feedback": {
        const { data } = await supabase.from("feedback").select("*").order("created_at", { ascending: false }).limit(20);
        const fb = data || [];
        const avg = fb.length ? (fb.reduce((s: number, f: any) => s + f.rating, 0) / fb.length).toFixed(1) : "N/A";
        return { total: fb.length, average: avg, recent: fb.slice(0, 10) };
      }

      case "check_errors": {
        const hours = action.params.hours || 24;
        const since = new Date(Date.now() - hours * 3600000).toISOString();
        const { data } = await supabase.from("api_usage_logs").select("*").gte("created_at", since).gte("status_code", 400).order("created_at", { ascending: false }).limit(50);
        return { errors: data || [], count: data?.length || 0, period: `${hours}h` };
      }

      case "check_rate_limits": {
        const todayStart = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).toISOString();
        const { data } = await supabase.from("rate_limits").select("*").gte("window_start", todayStart).order("request_count", { ascending: false }).limit(20);
        return data || [];
      }

      case "system_health": {
        const results: Record<string, any> = {};
        const tables = ["usage_logs", "viral_patterns", "paid_reports", "ad_config", "site_config", "feedback", "api_usage_logs"];
        const counts = await Promise.all(
          tables.map(t => supabase.from(t).select("id", { count: "exact", head: true }))
        );
        tables.forEach((t, i) => { results[t] = { rows: counts[i].count || 0, status: counts[i].error ? "❌" : "✅" }; });
        
        // Check critical configs
        const { data: configs } = await supabase.from("site_config").select("config_key, config_value");
        const critical = ["payment_gateway", "report_price", "gemini_api_keys"];
        const configStatus: Record<string, string> = {};
        for (const key of critical) {
          const found = (configs || []).find((c: any) => c.config_key === key);
          configStatus[key] = found?.config_value ? "✅" : "❌ MISSING";
        }
        results.critical_configs = configStatus;
        return results;
      }

      // ===== ANALYTICS =====
      case "revenue_report": {
        const days = action.params.days || 30;
        const since = new Date(Date.now() - days * 86400000).toISOString();
        const { data } = await supabase.from("paid_reports").select("amount, status, currency, payment_gateway, created_at").gte("created_at", since).order("created_at", { ascending: false });
        const all = data || [];
        const completed = all.filter((r: any) => r.status === "completed" || r.status === "paid");
        return {
          period: `${days} days`,
          total_orders: all.length,
          completed: completed.length,
          revenue: completed.reduce((s: number, r: any) => s + (Number(r.amount) || 0), 0),
          details: all,
        };
      }

      case "top_content": {
        const { data } = await supabase.from("viral_patterns").select("reel_url, author_name, viral_score, primary_category, views, likes").order("viral_score", { ascending: false }).limit(action.params.limit || 10);
        return data || [];
      }

      case "usage_trends": {
        const days = action.params.days || 7;
        const since = new Date(Date.now() - days * 86400000).toISOString();
        const { data } = await supabase.from("usage_logs").select("created_at").gte("created_at", since);
        const daily: Record<string, number> = {};
        for (const row of (data || []) as any[]) {
          const day = row.created_at.slice(0, 10);
          daily[day] = (daily[day] || 0) + 1;
        }
        return { period: `${days} days`, daily, total: data?.length || 0 };
      }

      // ===== USER MANAGEMENT =====
      case "list_admins": {
        const { data } = await supabase.from("user_roles").select("user_id, role").eq("role", "admin");
        return data || [];
      }

      // ===== BULK OPS =====
      case "clear_rate_limits": {
        const { error } = await supabase.from("rate_limits").delete().lt("window_start", new Date().toISOString());
        return error ? { error: error.message } : "✅ Rate limits cleared";
      }

      default:
        return { error: `Unknown action: ${action.name}` };
    }
  } catch (e) {
    return { error: `Action failed: ${e instanceof Error ? e.message : String(e)}` };
  }
}
