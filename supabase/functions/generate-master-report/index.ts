import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

function getApiKeys(): string[] {
  const multiKeys = Deno.env.get("GEMINI_API_KEYS");
  if (multiKeys) {
    const keys = multiKeys.split(",").map(k => k.trim()).filter(Boolean);
    if (keys.length > 0) return keys;
  }
  const singleKey = Deno.env.get("GEMINI_API_KEY");
  if (singleKey) return [singleKey];
  return [];
}

let currentKeyIndex = 0;

async function callGemini(body: Record<string, unknown>): Promise<Response> {
  const keys = getApiKeys();
  if (keys.length === 0) throw new Error("No GEMINI_API_KEY or GEMINI_API_KEYS configured");

  const startIndex = currentKeyIndex % keys.length;
  let lastError: Error | null = null;

  for (let i = 0; i < keys.length; i++) {
    const idx = (startIndex + i) % keys.length;
    const key = keys[idx];
    console.log(`Trying Gemini API key #${idx + 1}/${keys.length}`);

    try {
      const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.status === 429 || response.status === 402 || response.status === 403) {
        console.warn(`Key #${idx + 1} hit limit (${response.status}), trying next...`);
        lastError = new Error(`Key #${idx + 1} rate limited (${response.status})`);
        continue;
      }

      currentKeyIndex = idx;
      return response;
    } catch (e) {
      console.error(`Key #${idx + 1} network error:`, e);
      lastError = e instanceof Error ? e : new Error(String(e));
    }
  }

  currentKeyIndex = (startIndex + 1) % keys.length;
  throw lastError || new Error("All API keys exhausted");
}

async function getConfig(supabase: any): Promise<Record<string, string>> {
  const { data } = await supabase.from("site_config").select("config_key, config_value");
  const config: Record<string, string> = {};
  if (data) {
    for (const row of data) {
      config[row.config_key] = row.config_value;
    }
  }
  return config;
}

async function generatePremiumAnalysis(analysis: any, reelUrl: string): Promise<any> {
  // Extract virality insights from analysis (already computed by analyze-reel)
  const viralityInsights = analysis._viralityInsights || [];
  const daysSincePost = analysis._daysSincePost || null;

  const response = await callGemini({
    model: "gemini-2.5-flash",
    messages: [
      {
        role: "system",
        content: "You are an expert Instagram growth strategist creating premium PDF reports. Return ONLY valid JSON, no markdown fences.",
      },
      {
        role: "user",
        content: `Based on this reel analysis, generate a comprehensive Master Report with these sections.

Current Analysis Data:
${JSON.stringify(analysis, null, 2)}

Reel URL: ${reelUrl}

Generate ONLY valid JSON with these sections:

{
  "executiveSummary": "<4-5 sentence professional summary of the reel's performance and potential>",
  
  "competitorComparison": {
    "summary": "<2-3 sentence overview>",
    "topPerformers": [
      {"rank": 1, "trait": "<what top reels in this niche do>", "yourScore": "<how this reel compares>", "recommendation": "<specific action>"},
      {"rank": 2, "trait": "...", "yourScore": "...", "recommendation": "..."},
      {"rank": 3, "trait": "...", "yourScore": "...", "recommendation": "..."},
      {"rank": 4, "trait": "...", "yourScore": "...", "recommendation": "..."},
      {"rank": 5, "trait": "...", "yourScore": "...", "recommendation": "..."}
    ],
    "categoryInsight": "<what percentage of viral reels in this niche share common traits>"
  },

  "contentCalendar": {
    "bestPostingTimes": [
      {"day": "Monday", "time": "9:00 AM - 11:00 AM", "reason": "<why this time works>"},
      {"day": "Wednesday", "time": "12:00 PM - 2:00 PM", "reason": "..."},
      {"day": "Friday", "time": "6:00 PM - 8:00 PM", "reason": "..."},
      {"day": "Saturday", "time": "10:00 AM - 12:00 PM", "reason": "..."},
      {"day": "Sunday", "time": "7:00 PM - 9:00 PM", "reason": "..."}
    ],
    "postingFrequency": "<recommended frequency>",
    "contentMix": [
      {"type": "<content type>", "percentage": "<recommended %>", "reason": "<why>"}
    ],
    "weeklyPlan": "<brief 7-day content plan outline>"
  },

  "improvementRoadmap": {
    "steps": [
      {"step": 1, "title": "<action title>", "description": "<detailed 2-3 sentence description>", "impact": "high/medium/low", "effort": "easy/medium/hard", "timeline": "<when to do this>"},
      {"step": 2, "title": "...", "description": "...", "impact": "...", "effort": "...", "timeline": "..."},
      {"step": 3, "title": "...", "description": "...", "impact": "...", "effort": "...", "timeline": "..."},
      {"step": 4, "title": "...", "description": "...", "impact": "...", "effort": "...", "timeline": "..."},
      {"step": 5, "title": "...", "description": "...", "impact": "...", "effort": "...", "timeline": "..."}
    ]
  },

  "aiRecommendations": {
    "hookAlternatives": ["<alternative hook 1>", "<alternative hook 2>", "<alternative hook 3>"],
    "captionRewrite": "<improved caption suggestion>",
    "hashtagStrategy": ["<suggested hashtag 1>", "<hashtag 2>", "<hashtag 3>", "<hashtag 4>", "<hashtag 5>"],
    "trendingAudioSuggestions": ["<audio/sound suggestion 1>", "<suggestion 2>", "<suggestion 3>"],
    "thumbnailTips": ["<tip 1>", "<tip 2>", "<tip 3>"],
    "engagementBoostTips": ["<actionable tip 1>", "<tip 2>", "<tip 3>", "<tip 4>", "<tip 5>"]
  },

  "scoreBreakdown": {
    "overall": ${analysis.viralClassification?.score || analysis.viralScore || 0},
    "hook": ${analysis.hookAnalysis?.score || 0},
    "caption": ${analysis.captionAnalysis?.score || 0},
    "hashtag": ${analysis.hashtagAnalysis?.score || 0},
    "engagement": ${analysis.engagementScore || 0},
    "trend": ${analysis.trendMatching?.score || 0},
    "videoQuality": ${analysis.videoQuality?.qualityScore || 0},
    "audioQuality": ${analysis.audioQuality?.qualityScore || 0}
  }
}`,
      },
    ],
  });

  if (!response.ok) {
    console.error("Premium analysis AI failed:", response.status);
    throw new Error("Failed to generate premium analysis");
  }

  const data = await response.json();
  let content = data.choices?.[0]?.message?.content?.trim() || "";
  if (content.startsWith("```")) {
    content = content.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }
  const parsed = JSON.parse(content);
  
  // Attach virality insights directly (pre-computed, not AI-generated)
  parsed.viralityInsights = viralityInsights;
  parsed.daysSincePost = daysSincePost;
  
  return parsed;
}
}`,
      },
    ],
  });

  if (!response.ok) {
    console.error("Premium analysis AI failed:", response.status);
    throw new Error("Failed to generate premium analysis");
  }

  const data = await response.json();
  let content = data.choices?.[0]?.message?.content?.trim() || "";
  if (content.startsWith("```")) {
    content = content.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }
  return JSON.parse(content);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { reportId, analysisData, reelUrl } = await req.json();

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const apiKeys = getApiKeys();
    if (apiKeys.length === 0) throw new Error("No GEMINI_API_KEY or GEMINI_API_KEYS configured");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify the report exists and is paid
    if (reportId) {
      const { data: report } = await supabase
        .from("paid_reports")
        .select("*")
        .eq("id", reportId)
        .eq("status", "paid")
        .single();

      if (!report) {
        return new Response(JSON.stringify({ success: false, error: "Payment not verified" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Generate premium analysis
    console.log("Generating premium analysis...");
    const premiumData = await generatePremiumAnalysis(analysisData, reelUrl);

    // Update report with analysis data
    if (reportId) {
      await supabase
        .from("paid_reports")
        .update({
          analysis_data: { ...analysisData, premium: premiumData },
          completed_at: new Date().toISOString(),
          status: "completed",
        })
        .eq("id", reportId);
    }

    return new Response(
      JSON.stringify({ success: true, premiumAnalysis: premiumData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-master-report error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
