import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const startTime = Date.now();

  try {
    const { topic, reportId, adminFree } = await req.json();

    if (!topic) {
      return new Response(JSON.stringify({ success: false, error: "Topic is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    if (!LOVABLE_API_KEY) {
      throw new Error("AI API key not configured");
    }

    // Verify payment status (skip for admin free access)
    if (!adminFree) {
      if (!reportId) {
        return new Response(JSON.stringify({ success: false, error: "reportId is required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: report } = await supabase
        .from("paid_reports")
        .select("status")
        .eq("id", reportId)
        .single();

      if (!report || report.status !== "paid") {
        return new Response(JSON.stringify({ success: false, error: "Payment not verified" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      // Verify admin role via auth header
      const authHeader = req.headers.get("Authorization");
      if (authHeader) {
        const token = authHeader.replace("Bearer ", "");
        const { data: { user } } = await supabase.auth.getUser(token);
        if (!user) {
          return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
            status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin");
        if (!roles || roles.length === 0) {
          return new Response(JSON.stringify({ success: false, error: "Admin access required" }), {
            status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } else {
        return new Response(JSON.stringify({ success: false, error: "Authorization required" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    console.log("Starting SEO analysis for topic:", topic);

    const systemPrompt = `You are a world-class Instagram Reels SEO expert and content strategist. You analyze topics/contexts and provide deeply optimized SEO recommendations that maximize discoverability, engagement, and virality on Instagram.

You MUST respond with a valid JSON object (no markdown, no code fences). Follow this exact structure:

{
  "title": "A highly optimized, catchy reel title (under 60 chars)",
  "caption": "An SEO-optimized caption/description with strategic keyword placement (150-300 chars). Include relevant emojis and a CTA.",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10"],
  "hashtags": {
    "high_volume": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"],
    "medium_volume": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"],
    "niche": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"]
  },
  "music_type": "Description of the best music type/genre for this reel (e.g., 'Upbeat Lo-fi with bass drops')",
  "best_posting_time": "Best time to post with timezone consideration (e.g., '7:00 PM - 9:00 PM IST, Tuesday/Thursday')",
  "posting_rationale": "Brief explanation of why this posting time works",
  "top_reels": [
    {
      "title": "Descriptive title of a popular viral reel on this topic",
      "creator": "@creator_handle",
      "estimated_views": "2.5M",
      "engagement": "high",
      "category": "entertainment",
      "why_viral": "Brief reason why this reel went viral",
      "search_url": "https://www.instagram.com/explore/tags/relevant_hashtag/"
    }
  ],
  "content_tips": ["tip1", "tip2", "tip3"],
  "hook_suggestions": ["hook1", "hook2", "hook3"]
}

For top_reels, generate 10 realistic examples of viral reels related to the topic. Use realistic creator handles, view counts, and engagement metrics. Make the search_url point to relevant Instagram explore/hashtag pages.

Be specific, actionable, and data-driven. All recommendations should be optimized for the Instagram algorithm.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this topic/context for Instagram Reels SEO optimization: "${topic}"` },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ success: false, error: "AI service is busy, please try again in a moment" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ success: false, error: "AI service quota exceeded" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI analysis failed");
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    // Parse JSON from AI response
    let seoResult;
    try {
      // Try to extract JSON from potential markdown code fences
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      seoResult = JSON.parse(jsonMatch[1].trim());
    } catch (parseErr) {
      console.error("Failed to parse AI response:", content.substring(0, 500));
      throw new Error("Failed to parse SEO analysis");
    }

    // Update the paid report with SEO results
    await supabase
      .from("paid_reports")
      .update({
        analysis_data: seoResult,
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", reportId);

    const durationMs = Date.now() - startTime;

    // Log usage
    await supabase.from("api_usage_logs").insert({
      function_name: "seo-analyze",
      is_ai_call: true,
      estimated_cost: 0.005,
      status_code: 200,
      duration_ms: durationMs,
      ai_model: "gemini-2.5-flash",
      ai_provider: "lovable-ai",
    });

    console.log("SEO analysis complete in", durationMs, "ms");

    return new Response(JSON.stringify({ success: true, data: seoResult, reportId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("seo-analyze error:", error);

    // Log failure
    try {
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
      const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      await supabase.from("api_usage_logs").insert({
        function_name: "seo-analyze",
        is_ai_call: true,
        estimated_cost: 0,
        status_code: 500,
        duration_ms: Date.now() - startTime,
      });
    } catch {}

    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
