import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { url, caption, hashtags, lang = "en", metrics, sampleComments } = await req.json();
    const respondInHindi = lang === "hi";

    if (!url) {
      return new Response(JSON.stringify({ success: false, error: "URL is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Try to get oEmbed metadata
    let metadata = "";
    try {
      const oembedUrl = `https://api.instagram.com/oembed?url=${encodeURIComponent(url)}`;
      const oembedResp = await fetch(oembedUrl);
      if (oembedResp.ok) {
        const oembed = await oembedResp.json();
        metadata = `Title: ${oembed.title || "N/A"}\nAuthor: ${oembed.author_name || "N/A"}`;
      }
    } catch {
      console.log("oEmbed fetch failed, continuing with user-provided data");
    }

    // Build metrics section
    const hasMetrics = metrics && Object.values(metrics).some((v: any) => v !== undefined && v !== null);
    let metricsSection = "";
    if (hasMetrics) {
      const parts = [];
      if (metrics.likes !== undefined) parts.push(`Likes: ${metrics.likes}`);
      if (metrics.comments !== undefined) parts.push(`Comments: ${metrics.comments}`);
      if (metrics.views !== undefined) parts.push(`Views: ${metrics.views}`);
      if (metrics.shares !== undefined) parts.push(`Shares: ${metrics.shares}`);
      if (metrics.saves !== undefined) parts.push(`Saves: ${metrics.saves}`);
      metricsSection = `\nEngagement Metrics:\n${parts.join("\n")}`;
    }

    let commentsSection = "";
    if (sampleComments) {
      commentsSection = `\nSample Comments (for sentiment analysis):\n${sampleComments}`;
    }

    const langInstruction = respondInHindi
      ? "\n\nIMPORTANT: Write ALL text values (details, summary, recommendations, verdicts, themes) in Hindi language. Keep JSON keys in English."
      : "";

    // Build the metrics comparison instruction
    const metricsComparisonInstruction = hasMetrics
      ? `\n\nAlso provide "metricsComparison" in the JSON. For each provided metric, estimate the average for similar Reels in this category/niche and provide a verdict. Format:
"metricsComparison": {
  "likes": { "value": <user's likes>, "avgInCategory": <estimated avg>, "verdict": "<Above/Below/At average - brief reason>" },
  "comments": { "value": <user's comments>, "avgInCategory": <estimated avg>, "verdict": "<verdict>" },
  "shares": { "value": <user's shares>, "avgInCategory": <estimated avg>, "verdict": "<verdict>" },
  "saves": { "value": <user's saves>, "avgInCategory": <estimated avg>, "verdict": "<verdict>" },
  "views": { "value": <user's views>, "avgInCategory": <estimated avg>, "verdict": "<verdict>" }
}
Only include metrics that were provided by the user.`
      : "";

    const sentimentInstruction = sampleComments
      ? `\n\nAlso analyze the provided comments for sentiment and provide "commentSentiment" in the JSON:
"commentSentiment": {
  "positive": <percentage 0-100>,
  "neutral": <percentage 0-100>,
  "negative": <percentage 0-100>,
  "topThemes": ["theme1", "theme2", "theme3"],
  "summary": "<2 sentence summary of comment sentiment and what people are saying>"
}
The positive+neutral+negative should sum to 100.`
      : "";

    const prompt = `You are a viral content expert analyzing an Instagram Reel. Analyze the following and return a JSON object.

Reel URL: ${url}
${metadata ? `Metadata:\n${metadata}` : ""}
${caption ? `Caption: ${caption}` : "No caption provided"}
${hashtags ? `Hashtags: ${hashtags}` : "No hashtags provided"}${metricsSection}${commentsSection}

Analyze this Reel based on the available information. Score each category 1-10 and provide 2-3 specific, actionable detail points for each. If limited info is available, analyze based on what's provided and make educated assessments.

Categories:
1. Hook & Opening - Does the caption/content suggest a strong hook?
2. Caption Quality - Curiosity, emotional triggers, CTA, readability
3. Hashtag Strategy - Relevance, mix of reach levels, trend alignment
4. Engagement Signals - Likelihood of comments, shares, saves based on content type
5. Trend Alignment - How well it fits current Instagram trends
${metricsComparisonInstruction}${sentimentInstruction}${langInstruction}

Return ONLY valid JSON (no markdown, no code fences):
{
  "viralScore": <0-100 overall score>,
  "hookScore": <1-10>,
  "hookDetails": ["detail1", "detail2", "detail3"],
  "captionScore": <1-10>,
  "captionDetails": ["detail1", "detail2", "detail3"],
  "hashtagScore": <1-10>,
  "hashtagDetails": ["detail1", "detail2", "detail3"],
  "engagementScore": <1-10>,
  "engagementDetails": ["detail1", "detail2", "detail3"],
  "trendScore": <1-10>,
  "trendDetails": ["detail1", "detail2", "detail3"],
  "overallSummary": "<2-3 sentence summary>",
  "topRecommendations": ["rec1", "rec2", "rec3", "rec4", "rec5"]${hasMetrics ? ',\n  "metricsComparison": { ... }' : ""}${sampleComments ? ',\n  "commentSentiment": { ... }' : ""}
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert Instagram viral content analyst. Return only valid JSON." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ success: false, error: "Rate limited. Please try again in a moment." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ success: false, error: "AI credits exhausted. Please add credits." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error("AI analysis failed");
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) throw new Error("No AI response content");

    let cleanContent = content.trim();
    if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const analysis = JSON.parse(cleanContent);

    return new Response(JSON.stringify({ success: true, analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyze-reel error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
