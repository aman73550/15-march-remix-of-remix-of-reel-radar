import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json();
    const { action } = body;

    if (action === "stats") {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekStart = new Date(now.getTime() - 7 * 86400000).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [todayRes, weekRes, monthRes, sharesRes] = await Promise.all([
        supabase.from("traffic_sessions").select("*").gte("created_at", todayStart).order("created_at", { ascending: false }).limit(500),
        supabase.from("traffic_sessions").select("*").gte("created_at", weekStart).limit(1000),
        supabase.from("traffic_sessions").select("session_id, is_bot, is_real_user, referrer_source, device_type, country, duration_seconds, created_at").gte("created_at", monthStart).limit(1000),
        supabase.from("share_events").select("*").gte("created_at", weekStart).order("created_at", { ascending: false }).limit(200),
      ]);

      const todayData = todayRes.data || [];
      const weekData = weekRes.data || [];
      const monthData = monthRes.data || [];
      const shares = sharesRes.data || [];

      // Real vs Bot
      const realToday = todayData.filter((s: any) => s.is_real_user).length;
      const botToday = todayData.filter((s: any) => s.is_bot).length;
      const realWeek = weekData.filter((s: any) => s.is_real_user).length;
      const botWeek = weekData.filter((s: any) => s.is_bot).length;

      // Traffic sources
      const sourceBreakdown: Record<string, { total: number; real: number; bot: number }> = {};
      for (const s of todayData) {
        const src = (s as any).referrer_source || "direct";
        if (!sourceBreakdown[src]) sourceBreakdown[src] = { total: 0, real: 0, bot: 0 };
        sourceBreakdown[src].total++;
        if ((s as any).is_real_user) sourceBreakdown[src].real++;
        if ((s as any).is_bot) sourceBreakdown[src].bot++;
      }

      // Device distribution
      const deviceBreakdown: Record<string, number> = {};
      for (const s of todayData) {
        const d = (s as any).device_type || "unknown";
        deviceBreakdown[d] = (deviceBreakdown[d] || 0) + 1;
      }

      // Country distribution
      const countryBreakdown: Record<string, number> = {};
      for (const s of monthData) {
        const c = (s as any).country || "Unknown";
        countryBreakdown[c] = (countryBreakdown[c] || 0) + 1;
      }

      // Engagement metrics
      const realSessions = todayData.filter((s: any) => s.is_real_user);
      const avgDuration = realSessions.length > 0
        ? Math.round(realSessions.reduce((sum: number, s: any) => sum + ((s as any).duration_seconds || 0), 0) / realSessions.length)
        : 0;
      const avgScrollDepth = realSessions.length > 0
        ? Math.round(realSessions.reduce((sum: number, s: any) => sum + ((s as any).scroll_depth || 0), 0) / realSessions.length)
        : 0;
      const avgClicks = realSessions.length > 0
        ? Math.round(realSessions.reduce((sum: number, s: any) => sum + ((s as any).click_count || 0), 0) / realSessions.length * 10) / 10
        : 0;

      // Viral detection: hourly sessions for spike detection
      const hourlyTraffic: Record<number, number> = {};
      for (const s of todayData) {
        const hour = new Date((s as any).created_at).getHours();
        hourlyTraffic[hour] = (hourlyTraffic[hour] || 0) + 1;
      }
      const avgHourly = Object.values(hourlyTraffic).length > 0
        ? Object.values(hourlyTraffic).reduce((a, b) => a + b, 0) / Object.values(hourlyTraffic).length
        : 0;
      const viralSpikes = Object.entries(hourlyTraffic)
        .filter(([, count]) => count > avgHourly * 2.5)
        .map(([hour, count]) => ({ hour: Number(hour), count, multiplier: Math.round((count / avgHourly) * 10) / 10 }));

      // Share tracking
      const sharePlatformBreakdown: Record<string, number> = {};
      for (const s of shares) {
        const p = (s as any).platform || "unknown";
        sharePlatformBreakdown[p] = (sharePlatformBreakdown[p] || 0) + 1;
      }

      // Share-attributed sessions
      const shareAttributed = weekData.filter((s: any) => s.share_id).length;

      return new Response(JSON.stringify({
        success: true,
        stats: {
          today: { total: todayData.length, real: realToday, bot: botToday, realPct: todayData.length > 0 ? Math.round((realToday / todayData.length) * 100) : 0 },
          week: { total: weekData.length, real: realWeek, bot: botWeek },
          month: { total: monthData.length },
          sourceBreakdown,
          deviceBreakdown,
          countryBreakdown,
          engagement: { avgDuration, avgScrollDepth, avgClicks },
          viralSpikes,
          hourlyTraffic,
          shares: { total: shares.length, platformBreakdown: sharePlatformBreakdown, attributedSessions: shareAttributed },
          recentSessions: todayData.slice(0, 15).map((s: any) => ({
            session_id: s.session_id,
            referrer_source: s.referrer_source,
            device_type: s.device_type,
            is_bot: s.is_bot,
            bot_score: s.bot_score,
            bot_flags: s.bot_flags,
            duration_seconds: s.duration_seconds,
            click_count: s.click_count,
            scroll_depth: s.scroll_depth,
            created_at: s.created_at,
          })),
        },
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "ai-analyze") {
      const { trafficData } = body;
      const startTime = Date.now();

      // Fetch Gemini API keys from database (multi-key rotation)
      const { data: geminiConfig } = await supabase
        .from("site_config")
        .select("config_value")
        .eq("config_key", "gemini_api_keys")
        .single();

      let geminiKeys: string[] = [];
      if (geminiConfig?.config_value) {
        geminiKeys = geminiConfig.config_value.split(",").map((k: string) => k.trim()).filter(Boolean);
      }
      if (geminiKeys.length === 0) {
        const singleKey = Deno.env.get("GEMINI_API_KEY");
        if (singleKey) geminiKeys = [singleKey];
      }
      if (geminiKeys.length === 0) throw new Error("No Gemini API keys configured");

      const systemPrompt = `You are a traffic intelligence analyst. Analyze the provided traffic data and return exactly 4 sections:

1. **Traffic Quality Assessment** (2-3 lines): Real vs bot ratio, overall traffic health.
2. **Bot Activity Report** (2-3 lines): Suspicious patterns detected, which sources send bots.
3. **Growth Opportunities** (2-3 lines): Best traffic sources, which channels to invest in.
4. **Viral Potential** (2-3 lines): Any traffic spikes, share performance, viral indicators.

Use specific numbers. Be actionable. Reply in English.`;

      let aiContent = "No analysis available.";
      let tokensUsed = 0;

      for (const apiKey of geminiKeys) {
        try {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
          const response = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: systemPrompt }] },
              contents: [{ role: "user", parts: [{ text: `Traffic analytics data:\n\n${JSON.stringify(trafficData, null, 2)}` }] }],
            }),
          });

          if (!response.ok) {
            if (response.status === 429 || response.status === 403) continue;
            throw new Error(`Gemini error: ${response.status}`);
          }

          const aiResult = await response.json();
          aiContent = aiResult.candidates?.[0]?.content?.parts?.[0]?.text || "No analysis available.";
          tokensUsed = aiResult.usageMetadata?.totalTokenCount || 0;
          break;
        } catch (e) {
          continue;
        }
      }

      const duration = Date.now() - startTime;

      await supabase.from("api_usage_logs").insert({
        function_name: "traffic-analytics",
        ai_model: "gemini-2.5-flash",
        ai_provider: "google-direct",
        is_ai_call: true,
        estimated_cost: (tokensUsed / 1000) * 0.00015,
        tokens_used: tokensUsed,
        status_code: 200,
        duration_ms: duration,
      });

      return new Response(JSON.stringify({
        success: true,
        analysis: aiContent,
        tokensUsed,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: false, error: "Invalid action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("traffic-analytics error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
