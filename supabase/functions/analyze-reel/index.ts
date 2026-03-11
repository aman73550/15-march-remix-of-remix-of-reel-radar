import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Step 1: Analyze thumbnail with Gemini vision
async function analyzeThumbnail(thumbnailUrl: string, apiKey: string): Promise<string> {
  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this Instagram Reel thumbnail image in detail. Describe:
1. OBJECTS: What objects, items, or props are visible?
2. PEOPLE: Are there people? How many? What are they doing? Facial expressions?
3. SCENE: What is the setting/environment? (gym, kitchen, office, outdoors, studio, street, etc.)
4. ACTIONS: What activity or action seems to be happening?
5. TEXT ON SCREEN: Is there any visible text, captions, or overlay text? What does it say?
6. VISUAL STYLE: Is it professional, casual, cinematic, raw/unfiltered?
7. COLORS & MOOD: Dominant colors, lighting mood (bright, dark, warm, cool)
8. ESTIMATED CATEGORY: Based on visuals, what content niche does this likely belong to? (education, motivation, comedy, fitness, cooking, marketing, lifestyle, beauty, tech, gaming, storytelling, news, etc.)

Be specific and factual about what you see. Do not guess beyond what's visible.`
              },
              {
                type: "image_url",
                image_url: { url: thumbnailUrl }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      console.error("Vision analysis failed:", response.status);
      return "";
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  } catch (e) {
    console.error("Thumbnail analysis error:", e);
    return "";
  }
}

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

    // oEmbed metadata + thumbnail
    let metadata = "";
    let thumbnailUrl = "";
    try {
      const oembedUrl = `https://api.instagram.com/oembed?url=${encodeURIComponent(url)}`;
      const oembedResp = await fetch(oembedUrl);
      if (oembedResp.ok) {
        const oembed = await oembedResp.json();
        metadata = `Title: ${oembed.title || "N/A"}\nAuthor: ${oembed.author_name || "N/A"}`;
        thumbnailUrl = oembed.thumbnail_url || "";
      }
    } catch {
      console.log("oEmbed fetch failed");
    }

    // Run vision analysis on thumbnail (if available)
    let visionAnalysis = "";
    if (thumbnailUrl) {
      console.log("Running vision analysis on thumbnail...");
      visionAnalysis = await analyzeThumbnail(thumbnailUrl, LOVABLE_API_KEY);
      console.log("Vision analysis complete:", visionAnalysis.substring(0, 200));
    }

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
      commentsSection = `\nSample Comments:\n${sampleComments}`;
    }

    const visionSection = visionAnalysis
      ? `\n=== VISUAL CONTENT ANALYSIS (from thumbnail) ===\n${visionAnalysis}\n`
      : "";

    const langInstruction = respondInHindi
      ? "\n\nCRITICAL: Write ALL text values in Hindi. Keep JSON keys in English."
      : "";

    const prompt = `You are a world-class Instagram viral content analyst. Perform an extremely detailed analysis of this Reel.

=== INPUT DATA ===
Reel URL: ${url}
${metadata ? `Metadata:\n${metadata}` : ""}
${caption ? `Caption: ${caption}` : "No caption provided"}
${hashtags ? `Hashtags: ${hashtags}` : "No hashtags provided"}${metricsSection}${commentsSection}
${visionSection}
=== ANALYSIS INSTRUCTIONS ===

${visionAnalysis ? `IMPORTANT: You have VISUAL ANALYSIS DATA from the reel's thumbnail. Use this as the PRIMARY signal to understand what the reel is actually about. Cross-reference with caption and hashtags to classify the content accurately. The visual content should take priority over hashtags when determining the reel's true category.` : ""}

Perform ALL of these analyses:

1. CONTENT CLASSIFICATION (CRITICAL - analyze what the reel is actually about):
   - Primary category (education, motivation, comedy, marketing, fitness, lifestyle, cooking, beauty, tech, gaming, storytelling, news, other)
   - Sub-category (more specific niche)
   - Content type (tutorial, entertainment, review, vlog, transformation, skit, etc.)
   - Detected elements: objects, people, actions, scene setting
   - On-screen text detected (from visual analysis)
   - Estimated spoken topic (inferred from visuals + caption)
   - Confidence level (high/medium/low) based on available signals

2. HOOK ANALYSIS (first 3 seconds):
   - What type of opening does the content suggest? (question, shock, story, visual)
   - Rate the attention-grabbing potential
   - Estimate hook effectiveness

3. CAPTION ANALYSIS (NLP):
   - Curiosity level (1-10)
   - Identify emotional triggers (fear, joy, surprise, anger, etc.)
   - Is there a call-to-action? What type?
   - Keyword density assessment
   - Caption length effectiveness

4. HASHTAG ANALYSIS:
   - For each hashtag: competition level, relevance, trend strength
   - Overall hashtag strategy quality
   - Do hashtags match the actual detected content?

5. VIDEO SIGNALS (estimate from content/niche):
   - Estimated scene cuts frequency
   - Text overlay likelihood
   - Face presence likelihood
   - Motion intensity
   - Visual engagement level

6. VIDEO QUALITY ASSESSMENT:
   - Estimated resolution quality (HD/SD/Low)
   - Lighting quality (good/average/poor)
   - Camera stability (stable/moderate/shaky)
   - Overall visual clarity (sharp/average/blurry)

7. AUDIO QUALITY ASSESSMENT:
   - Voice clarity (clear/muffled/none)
   - Background audio quality (clean/moderate/noisy)
   - Sound balance (balanced/unbalanced/distorted)
   - Music/sound usage (trending audio/original/none)

8. TREND MATCHING:
   - Format similarity to current viral trends
   - Hook pattern matching
   - Trending structure alignment
   - Name specific trends it matches

9. ENGAGEMENT ANALYSIS:
   - Overall engagement quality${hasMetrics ? "\n   - Compare each metric against estimated category averages" : ""}
   - Engagement rate estimate${sampleComments ? `

10. COMMENT SENTIMENT:
    - Percentage breakdown: positive, neutral, negative (must sum to 100)
    - Question ratio (% of comments that are questions)
    - Engagement signals in comments
    - Audience intent (curiosity, support, criticism, etc.)
    - Top 3-5 themes
    - 2-sentence summary` : ""}
${langInstruction}

=== REQUIRED JSON OUTPUT ===
Return ONLY valid JSON (no markdown, no code fences):
{
  "viralScore": <0-100>,
  "overallSummary": "<3-4 sentence comprehensive summary>",

  "contentClassification": {
    "primaryCategory": "<education/motivation/comedy/marketing/fitness/lifestyle/cooking/beauty/tech/gaming/storytelling/news/other>",
    "subCategory": "<specific niche>",
    "contentType": "<tutorial/entertainment/review/vlog/transformation/skit/montage/other>",
    "detectedElements": {
      "objects": ["<object1>", "<object2>"],
      "people": "<description of people detected>",
      "actions": ["<action1>", "<action2>"],
      "scene": "<scene/setting description>",
      "onScreenText": ["<text1>", "<text2>"],
      "estimatedTopic": "<main topic of the reel>"
    },
    "confidence": "<high/medium/low>",
    "reasoning": "<1-2 sentence explanation of why this category was chosen>",
    "hashtagAlignment": "<do hashtags match the actual content? yes/partially/no + explanation>"
  },

  "hookAnalysis": {
    "score": <1-10>,
    "firstThreeSeconds": "<what likely happens in first 3 seconds based on content>",
    "openingType": "<question/shock/story/visual/tutorial/other>",
    "attentionGrabber": "<main attention element>",
    "details": ["<specific insight 1>", "<insight 2>", "<insight 3>"]
  },

  "captionAnalysis": {
    "score": <1-10>,
    "curiosityLevel": <1-10>,
    "emotionalTriggers": ["<trigger1>", "<trigger2>"],
    "callToAction": "<description of CTA or 'None detected'>",
    "keywordDensity": "<assessment>",
    "lengthEffectiveness": "<too short/optimal/too long + why>",
    "details": ["<insight 1>", "<insight 2>", "<insight 3>"]
  },

  "hashtagAnalysis": {
    "score": <1-10>,
    "hashtags": [
      { "tag": "#example", "competition": "high/medium/low", "relevance": "high/medium/low", "trendStrength": "strong/moderate/weak" }
    ],
    "details": ["<insight 1>", "<insight 2>", "<insight 3>"]
  },

  "videoSignals": {
    "estimatedSceneCuts": "<frequent/moderate/minimal/single-shot>",
    "textOverlayLikely": "<yes/no/likely + reasoning>",
    "facePresenceLikely": "<yes/no/likely + reasoning>",
    "motionIntensity": "<high/medium/low>",
    "visualEngagement": "<high/medium/low + why>",
    "details": ["<insight 1>", "<insight 2>", "<insight 3>"]
  },

  "videoQuality": {
    "resolution": "<HD/SD/Low>",
    "lighting": "<good/average/poor>",
    "cameraStability": "<stable/moderate/shaky>",
    "visualClarity": "<sharp/average/blurry>",
    "qualityScore": <1-10>
  },

  "audioQuality": {
    "voiceClarity": "<clear/muffled/none>",
    "backgroundAudio": "<clean/moderate/noisy>",
    "soundBalance": "<balanced/unbalanced/distorted>",
    "musicUsage": "<trending/original/none>",
    "qualityScore": <1-10>
  },

  "trendMatching": {
    "score": <1-10>,
    "formatSimilarity": "<description>",
    "hookPattern": "<matched pattern name>",
    "trendingStructure": "<structure type>",
    "matchedTrends": ["<trend1>", "<trend2>"],
    "details": ["<insight 1>", "<insight 2>", "<insight 3>"]
  },

  "engagementScore": <1-10>,
  "engagementDetails": ["<insight 1>", "<insight 2>", "<insight 3>"],
  "engagementRate": "<estimated rate if metrics provided>"${hasMetrics ? `,

  "metricsComparison": {
    ${metrics?.likes !== undefined ? '"likes": { "value": ' + metrics.likes + ', "avgInCategory": <estimated>, "verdict": "<verdict>" },' : ''}
    ${metrics?.comments !== undefined ? '"comments": { "value": ' + metrics.comments + ', "avgInCategory": <estimated>, "verdict": "<verdict>" },' : ''}
    ${metrics?.views !== undefined ? '"views": { "value": ' + metrics.views + ', "avgInCategory": <estimated>, "verdict": "<verdict>" },' : ''}
    ${metrics?.shares !== undefined ? '"shares": { "value": ' + metrics.shares + ', "avgInCategory": <estimated>, "verdict": "<verdict>" },' : ''}
    ${metrics?.saves !== undefined ? '"saves": { "value": ' + metrics.saves + ', "avgInCategory": <estimated>, "verdict": "<verdict>" }' : ''}
  }` : ""}${sampleComments ? `,

  "commentSentiment": {
    "positive": <0-100>,
    "neutral": <0-100>,
    "negative": <0-100>,
    "questionRatio": <0-100>,
    "engagementSignals": ["<signal1>", "<signal2>"],
    "audienceIntent": "<primary intent>",
    "topThemes": ["<theme1>", "<theme2>", "<theme3>"],
    "summary": "<2-sentence summary>"
  }` : ""},

  "topRecommendations": ["<actionable rec 1>", "<rec 2>", "<rec 3>", "<rec 4>", "<rec 5>"]
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
          { role: "system", content: "You are an expert Instagram viral content analyst with deep knowledge of trends, algorithms, and engagement patterns. You can analyze visual content from thumbnails to understand what a reel is actually about. Return only valid JSON. Be specific and actionable in your analysis." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ success: false, error: "Rate limited. Please try again in a moment." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ success: false, error: "AI credits exhausted. Please add credits." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
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

    // === VIRAL CLASSIFICATION ENGINE ===
    const m = metrics || {};
    const likesVal = m.likes ?? 0;
    const commentsVal = m.comments ?? 0;
    const viewsVal = m.views ?? 0;
    const engRate = viewsVal > 0 ? (likesVal + commentsVal) / viewsVal : 0;

    const isAlreadyViral = viewsVal > 100000 || engRate > 0.07 || likesVal > 10000;
    const isGrowing = viewsVal > 10000 || engRate > 0.03 || likesVal > 1000;

    const reasons: string[] = [];

    // Content classification reason
    if (analysis.contentClassification) {
      const cc = analysis.contentClassification;
      if (cc.confidence === "high") {
        reasons.push(`Content identified as ${cc.primaryCategory} (${cc.subCategory}) with high confidence`);
      }
    }

    if (hasMetrics) {
      if (viewsVal > 100000) reasons.push("High view count (100K+) indicates strong reach");
      else if (viewsVal > 10000) reasons.push("Growing view count shows expanding reach");
      if (engRate > 0.07) reasons.push(`Strong engagement rate (${(engRate * 100).toFixed(2)}%) well above average`);
      else if (engRate > 0.03) reasons.push(`Decent engagement rate (${(engRate * 100).toFixed(2)}%)`);
      if (likesVal > 10000) reasons.push("High like count signals strong audience approval");
      else if (likesVal > 1000) reasons.push("Growing likes indicate audience interest");
      if (commentsVal > 500) reasons.push("Active comment section shows high audience engagement");
      else if (commentsVal > 50) reasons.push("Good comment activity");
    }
    // Add AI-derived reasons
    if (analysis.hookAnalysis?.score >= 7) reasons.push("Effective hook grabs attention in first 3 seconds");
    if (analysis.captionAnalysis?.score >= 7) reasons.push("Strong caption drives curiosity and engagement");
    if (analysis.hashtagAnalysis?.score >= 7) reasons.push("Well-optimized hashtag strategy");
    if (analysis.trendMatching?.score >= 7) reasons.push("Content aligns with current viral trends");

    // === QUALITY BONUS/PENALTY (capped at ±15 total) ===
    let qualityBonus = 0;

    const vq = analysis.videoQuality;
    if (vq) {
      const vqScore = vq.qualityScore ?? 5;
      if (vqScore >= 8) {
        qualityBonus += 8;
        reasons.push("High video quality boosts viewer retention");
      } else if (vqScore >= 6) {
        qualityBonus += 3;
      } else if (vqScore <= 3) {
        qualityBonus -= 5;
        reasons.push("Low video quality may reduce viewer retention");
      }
    }

    const aq = analysis.audioQuality;
    if (aq) {
      const aqScore = aq.qualityScore ?? 5;
      if (aqScore >= 8) {
        qualityBonus += 5;
        reasons.push("Clean audio quality enhances engagement");
      } else if (aqScore >= 6) {
        qualityBonus += 3;
      } else if (aqScore <= 3) {
        qualityBonus -= 5;
        reasons.push("Poor audio quality may cause viewers to skip");
      }
    }

    qualityBonus = Math.max(-15, Math.min(15, qualityBonus));

    // === CONTENT CATEGORY BONUS (±5) ===
    let categoryBonus = 0;
    const cc = analysis.contentClassification;
    if (cc) {
      // High-viral categories get a small boost
      const highViralCategories = ["comedy", "motivation", "fitness", "storytelling"];
      if (highViralCategories.includes(cc.primaryCategory?.toLowerCase())) {
        categoryBonus += 3;
      }
      // Hashtag-content alignment bonus
      if (cc.hashtagAlignment?.toLowerCase().startsWith("yes")) {
        categoryBonus += 2;
      } else if (cc.hashtagAlignment?.toLowerCase().startsWith("no")) {
        categoryBonus -= 3;
        reasons.push("Hashtags don't match actual content — reduces discoverability");
      }
    }
    categoryBonus = Math.max(-5, Math.min(5, categoryBonus));

    let viralStatus, viralScore, viralLabel;
    const totalBonus = qualityBonus + categoryBonus;

    if (hasMetrics && isAlreadyViral) {
      viralStatus = "Already Viral";
      viralScore = Math.min(98, Math.max(80, Math.round(80 + (engRate * 100) + totalBonus)));
      viralLabel = "Viral Strength";
    } else if (hasMetrics && isGrowing) {
      viralStatus = "Growing";
      const hookS = (analysis.hookAnalysis?.score ?? 5) / 10;
      const capS = (analysis.captionAnalysis?.score ?? 5) / 10;
      const hashS = (analysis.hashtagAnalysis?.score ?? 5) / 10;
      const engS = Math.min(1, engRate / 0.07);
      const comS = Math.min(1, commentsVal / 500);
      viralScore = Math.min(95, Math.max(5, Math.round((hookS * 30 + capS * 20 + hashS * 15 + engS * 25 + comS * 10) + totalBonus)));
      viralLabel = "Viral Potential";
    } else {
      viralStatus = hasMetrics ? "Low Viral Potential" : (analysis.viralScore >= 60 ? "Growing" : "Low Viral Potential");
      const hookS = (analysis.hookAnalysis?.score ?? 5) / 10;
      const capS = (analysis.captionAnalysis?.score ?? 5) / 10;
      const hashS = (analysis.hashtagAnalysis?.score ?? 5) / 10;
      const engS = hasMetrics ? Math.min(1, engRate / 0.07) : (analysis.engagementScore ?? 5) / 10;
      const comS = hasMetrics ? Math.min(1, commentsVal / 500) : 0.5;
      viralScore = Math.min(95, Math.max(5, Math.round((hookS * 30 + capS * 20 + hashS * 15 + engS * 25 + comS * 10) + totalBonus)));
      viralLabel = "Viral Potential";
      if (!hasMetrics && reasons.length === 0) {
        if (analysis.hookAnalysis?.score >= 5) reasons.push("Decent hook potential");
        if (analysis.captionAnalysis?.score >= 5) reasons.push("Caption has engagement potential");
        reasons.push("Add engagement metrics for more accurate classification");
      }
    }

    analysis.viralClassification = {
      status: viralStatus,
      score: viralScore,
      label: viralLabel,
      reasons: reasons.slice(0, 6),
      engagementRate: hasMetrics && viewsVal > 0 ? engRate : undefined,
    };

    // Add thumbnail analysis flag
    analysis.thumbnailAnalyzed = !!visionAnalysis;

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
