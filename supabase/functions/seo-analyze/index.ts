import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Firecrawl search for web research
async function firecrawlSearch(query: string, apiKey: string): Promise<any[]> {
  try {
    console.log("Firecrawl search:", query);
    const response = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        limit: 5,
        scrapeOptions: { formats: ["markdown"] },
      }),
    });
    if (!response.ok) {
      console.warn("Firecrawl search failed:", response.status);
      return [];
    }
    const data = await response.json();
    return data.data || [];
  } catch (e) {
    console.error("Firecrawl search error:", e);
    return [];
  }
}

// Hash utility for rate limiting
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const startTime = Date.now();

  try {
    const { topic, reportId, adminFree } = await req.json();

    // === INPUT VALIDATION ===
    if (!topic || typeof topic !== "string") {
      return new Response(JSON.stringify({ success: false, error: "Topic is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (topic.trim().length > 1000) {
      return new Response(JSON.stringify({ success: false, error: "Topic too long (max 1000 chars)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (topic.trim().length < 3) {
      return new Response(JSON.stringify({ success: false, error: "Topic too short (min 3 chars)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // === RATE LIMITING ===
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ipHash = await hashString(clientIp);
    const { data: allowed } = await supabase.rpc("check_rate_limit", {
      p_ip_hash: ipHash,
      p_function_name: "seo-analyze",
      p_max_requests: 15,
      p_window_minutes: 60,
    });
    if (allowed === false) {
      return new Response(JSON.stringify({ success: false, error: "Rate limit exceeded. Please try again later." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    let FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    
    // Try loading Firecrawl key from DB (admin panel)
    try {
      const { data: fcData } = await supabase
        .from("site_config")
        .select("config_value")
        .eq("config_key", "firecrawl_api_key")
        .single();
      if (fcData?.config_value) {
        const fcKeys = fcData.config_value.split(",").map((k: string) => k.trim()).filter(Boolean);
        if (fcKeys.length > 0) FIRECRAWL_API_KEY = fcKeys[0];
      }
    } catch {}

    if (!LOVABLE_API_KEY) {
      throw new Error("API key not configured");
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

    // ========== STEP 1: Web Research via Firecrawl ==========
    let webResearchContext = "";
    if (FIRECRAWL_API_KEY) {
      console.log("Running web research...");
      const [
        trendingResults,
        hashtagResults,
        youtubeResults,
      ] = await Promise.all([
        firecrawlSearch(`top trending Instagram reels ${topic} 2025`, FIRECRAWL_API_KEY),
        firecrawlSearch(`best hashtags for ${topic} Instagram reels trending`, FIRECRAWL_API_KEY),
        firecrawlSearch(`top trending YouTube shorts ${topic} 2025 viral`, FIRECRAWL_API_KEY),
      ]);

      const trendingMarkdown = trendingResults.map(r => `Title: ${r.title || ""}\nURL: ${r.url || ""}\n${(r.markdown || "").substring(0, 500)}`).join("\n---\n");
      const hashtagMarkdown = hashtagResults.map(r => `Title: ${r.title || ""}\n${(r.markdown || "").substring(0, 400)}`).join("\n---\n");
      const youtubeMarkdown = youtubeResults.map(r => `Title: ${r.title || ""}\nURL: ${r.url || ""}\n${(r.markdown || "").substring(0, 400)}`).join("\n---\n");

      webResearchContext = `
=== WEB RESEARCH DATA (USE THIS FOR ACCURATE RECOMMENDATIONS) ===

--- Trending Instagram Reels Research ---
${trendingMarkdown || "No results found"}

--- Hashtag Research ---
${hashtagMarkdown || "No results found"}

--- Trending YouTube Shorts Research ---
${youtubeMarkdown || "No results found"}
===========================`;
      console.log("Web research complete, context length:", webResearchContext.length);
    } else {
      console.log("No Firecrawl key — skipping web research");
    }

    // ========== STEP 2: AI Analysis with Research Context ==========
    const systemPrompt = `You are a world-class Instagram Reels & YouTube Shorts SEO expert and content strategist. You have been given real web research data about trending content. Use this data to provide ACCURATE, DATA-DRIVEN recommendations.

You MUST respond with a valid JSON object (no markdown, no code fences). Follow this EXACT structure:

{
  "title": "A highly optimized, catchy reel title (under 60 chars)",
  "caption": "An SEO-optimized caption/description with strategic keyword placement (150-300 chars). Include relevant emojis and a CTA.",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10"],
  "hashtags": {
    "high_volume": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"],
    "medium_volume": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"],
    "niche": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"]
  },
  "music_type": "Description of the best music type/genre for this reel",
  "best_posting_time": "Best time to post with timezone (e.g., '7:00 PM - 9:00 PM IST, Tuesday/Thursday')",
  "posting_rationale": "Brief explanation of why this posting time works",
  "top_reels": [
    {
      "title": "Title of a real/realistic viral reel on this topic",
      "creator": "@creator_handle",
      "estimated_views": "2.5M",
      "engagement": "high",
      "category": "entertainment",
      "why_viral": "Brief reason why this reel went viral",
      "search_url": "https://www.instagram.com/explore/tags/relevant_hashtag/"
    }
  ],
  "top_youtube_shorts": [
    {
      "title": "Title of a trending YouTube Short on this topic",
      "channel": "@channel_name",
      "estimated_views": "1.8M",
      "engagement": "high",
      "category": "entertainment",
      "why_trending": "Why this short is trending",
      "search_url": "https://www.youtube.com/results?search_query=relevant+query&sp=EgQQARgD"
    }
  ],
  "content_tips": ["tip1", "tip2", "tip3", "tip4", "tip5"],
  "hook_suggestions": ["hook1", "hook2", "hook3", "hook4", "hook5"],
  "keyword_analysis": {
    "primary_keywords": ["keyword1", "keyword2", "keyword3"],
    "secondary_keywords": ["keyword1", "keyword2", "keyword3"],
    "long_tail_keywords": ["keyword phrase 1", "keyword phrase 2", "keyword phrase 3"],
    "trending_keywords": ["keyword1", "keyword2", "keyword3"]
  },
  "competitor_analysis": {
    "top_creators": [
      { "name": "@creator", "followers": "500K", "avg_views": "200K", "strength": "Strong hooks", "content_style": "Entertainment" }
    ],
    "content_gaps": ["gap1", "gap2", "gap3"],
    "winning_formats": ["format1", "format2", "format3"]
  },
  "score_breakdown": {
    "title_seo_score": 85,
    "caption_seo_score": 78,
    "hashtag_effectiveness": 82,
    "trend_alignment": 75,
    "content_potential": 80,
    "overall_seo_score": 80
  },
  "platform_distribution": {
    "instagram_reels": 45,
    "youtube_shorts": 30,
    "tiktok": 25
  },
  "engagement_prediction": {
    "estimated_reach": "10K-50K",
    "estimated_likes": "500-2K",
    "estimated_comments": "50-200",
    "estimated_shares": "100-500",
    "confidence": "medium"
  },
  "description_seo": "A 2-3 line SEO-optimized description for bio/profile linking to this content type"
}

For top_reels, generate 10 realistic examples based on the web research data. Use realistic creator handles and view counts.
For top_youtube_shorts, generate 5 realistic examples of trending YouTube Shorts on this topic.
Make score_breakdown scores between 0-100.
Make platform_distribution percentages that sum to 100.
Be specific, actionable, and data-driven.`;

    const userMessage = `Analyze this topic/context for Instagram Reels & YouTube Shorts SEO optimization: "${topic}"

${webResearchContext}

Based on the web research above (if available), provide the most accurate and up-to-date SEO recommendations. Use REAL trending hashtags, realistic creator handles, and data-backed suggestions.`;

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
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gateway error:", response.status, errText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ success: false, error: "Service is busy, please try again in a moment" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ success: false, error: "Service quota exceeded" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("Analysis failed");
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    let seoResult;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      seoResult = JSON.parse(jsonMatch[1].trim());
    } catch (parseErr) {
      console.error("Failed to parse response:", content.substring(0, 500));
      throw new Error("Failed to parse SEO analysis");
    }

    // Update the paid report with SEO results
    if (!adminFree && reportId) {
      await supabase
        .from("paid_reports")
        .update({
          analysis_data: seoResult,
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", reportId);
    }

    const durationMs = Date.now() - startTime;

    await supabase.from("api_usage_logs").insert({
      function_name: "seo-analyze",
      is_ai_call: true,
      estimated_cost: 0.008,
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
