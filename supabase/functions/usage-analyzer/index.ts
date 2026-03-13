import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MODEL_COSTS: Record<string, number> = {
  "gemini-2.5-flash": 0.00015,
  "gemini-2.5-pro": 0.00125,
  "gemini-2.5-flash-lite": 0.00008,
  "google/gemini-3-flash-preview": 0.0002,
  "google/gemini-2.5-flash": 0.00015,
  "google/gemini-2.5-pro": 0.00125,
  "gpt-5": 0.005,
  "gpt-5-mini": 0.0015,
  "gpt-5-nano": 0.0005,
  default: 0.0003,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Parse body ONCE and reuse
    const body = await req.json();
    const { action, usageData } = body;

    if (action === "stats") {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekStart = new Date(now.getTime() - 7 * 86400000).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [todayRes, weekRes, monthRes] = await Promise.all([
        supabase.from("api_usage_logs").select("*").gte("created_at", todayStart).order("created_at", { ascending: false }),
        supabase.from("api_usage_logs").select("*").gte("created_at", weekStart),
        supabase.from("api_usage_logs").select("*").gte("created_at", monthStart),
      ]);

      const logs = todayRes.data || [];
      const weekData = weekRes.data || [];
      const monthData = monthRes.data || [];

      const totalApiToday = logs.length;
      const totalAiToday = logs.filter((l: any) => l.is_ai_call).length;
      const totalCostToday = logs.reduce((sum: number, l: any) => sum + (Number(l.estimated_cost) || 0), 0);
      const totalCostWeek = weekData.reduce((sum: number, l: any) => sum + (Number(l.estimated_cost) || 0), 0);
      const totalCostMonth = monthData.reduce((sum: number, l: any) => sum + (Number(l.estimated_cost) || 0), 0);

      const functionBreakdown: Record<string, { count: number; aiCalls: number; cost: number }> = {};
      for (const log of logs) {
        const fn = log.function_name;
        if (!functionBreakdown[fn]) functionBreakdown[fn] = { count: 0, aiCalls: 0, cost: 0 };
        functionBreakdown[fn].count++;
        if (log.is_ai_call) functionBreakdown[fn].aiCalls++;
        functionBreakdown[fn].cost += Number(log.estimated_cost) || 0;
      }

      const modelBreakdown: Record<string, { count: number; cost: number; tokens: number }> = {};
      for (const log of logs) {
        if (log.is_ai_call && log.ai_model) {
          if (!modelBreakdown[log.ai_model]) modelBreakdown[log.ai_model] = { count: 0, cost: 0, tokens: 0 };
          modelBreakdown[log.ai_model].count++;
          modelBreakdown[log.ai_model].cost += Number(log.estimated_cost) || 0;
          modelBreakdown[log.ai_model].tokens += Number(log.tokens_used) || 0;
        }
      }

      const hourlyDistribution: Record<number, number> = {};
      for (const log of logs) {
        const hour = new Date(log.created_at).getHours();
        hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + 1;
      }

      const avgDuration = logs.length > 0
        ? Math.round(logs.reduce((sum: number, l: any) => sum + (Number(l.duration_ms) || 0), 0) / logs.length)
        : 0;

      const errorCount = logs.filter((l: any) => l.status_code >= 400).length;
      const errorRate = logs.length > 0 ? Math.round((errorCount / logs.length) * 100) : 0;

      return new Response(JSON.stringify({
        success: true,
        stats: {
          totalApiToday, totalAiToday,
          totalCostToday: Math.round(totalCostToday * 10000) / 10000,
          totalCostWeek: Math.round(totalCostWeek * 10000) / 10000,
          totalCostMonth: Math.round(totalCostMonth * 10000) / 10000,
          totalApiWeek: weekData.length,
          totalApiMonth: monthData.length,
          functionBreakdown, modelBreakdown, hourlyDistribution,
          avgDuration, errorRate, errorCount,
          recentLogs: logs.slice(0, 20),
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "ai-suggest") {
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

      const startTime = Date.now();

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `You are an API usage cost optimizer. Analyze the provided usage data and return exactly 2 sections:

1. **Usage Insight** (2-3 lines): Which API/AI model is consuming the most credits and why.
2. **Optimization Suggestion** (2-3 lines): Actionable steps to reduce cost or improve efficiency.

Keep it short, clear, and actionable. Use specific numbers from the data. Reply in English.`
            },
            {
              role: "user",
              content: `Here is today's API usage data:\n\n${JSON.stringify(usageData, null, 2)}`
            }
          ],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ success: false, error: "Rate limit exceeded. Try again later." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ success: false, error: "Credits exhausted. Please add funds." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const aiResult = await response.json();
      const aiContent = aiResult.choices?.[0]?.message?.content || "No analysis available.";
      const tokensUsed = aiResult.usage?.total_tokens || 0;
      const duration = Date.now() - startTime;

      await supabase.from("api_usage_logs").insert({
        function_name: "usage-analyzer",
        ai_model: "google/gemini-3-flash-preview",
        ai_provider: "lovable-ai",
        is_ai_call: true,
        estimated_cost: (tokensUsed / 1000) * (MODEL_COSTS["google/gemini-3-flash-preview"] || MODEL_COSTS.default),
        tokens_used: tokensUsed,
        status_code: 200,
        duration_ms: duration,
      });

      return new Response(JSON.stringify({
        success: true,
        analysis: aiContent,
        tokensUsed,
        cost: Math.round((tokensUsed / 1000) * (MODEL_COSTS["google/gemini-3-flash-preview"] || MODEL_COSTS.default) * 10000) / 10000,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: false, error: "Invalid action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("usage-analyzer error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
