import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Step 0a: Direct HTML fetch with browser headers to extract meta tags (bypasses 403 often)
async function scrapeMetaTags(url: string): Promise<{
  ogImage: string;
  ogDescription: string;
  ogTitle: string;
  authorName: string;
} | null> {
  try {
    console.log("Attempting direct meta tag scrape:", url);
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      console.log("Direct fetch failed:", response.status);
      return null;
    }

    const html = await response.text();
    
    const getMetaContent = (property: string): string => {
      // Match both property="og:x" and name="og:x" patterns
      const regex = new RegExp(`<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']*)["']`, "i");
      const regex2 = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${property}["']`, "i");
      return regex.exec(html)?.[1] || regex2.exec(html)?.[1] || "";
    };

    const ogImage = getMetaContent("og:image");
    const ogDescription = getMetaContent("og:description");
    const ogTitle = getMetaContent("og:title");
    
    // Extract author from og:title pattern "Author on Instagram: ..."
    let authorName = "";
    const authorMatch = ogTitle.match(/^(.+?)\s+on\s+Instagram/i);
    if (authorMatch) authorName = authorMatch[1];

    // Also try to get from description pattern
    if (!authorName) {
      const descAuthor = ogDescription.match(/^(\d[\d,.KMBkmb]*)\s+likes?,\s+\d+\s+comments?\s+-\s+(.+?)\s+\(/i);
      if (descAuthor) authorName = descAuthor[2];
    }

    console.log("Meta scrape result - ogImage:", ogImage ? "yes" : "no", "ogDesc length:", ogDescription.length, "author:", authorName);

    if (!ogImage && !ogDescription) {
      console.log("No useful meta tags found");
      return null;
    }

    return { ogImage, ogDescription, ogTitle, authorName };
  } catch (e) {
    console.error("Direct meta scrape error:", e);
    return null;
  }
}

// Step 0b: Scrape reel page with Firecrawl to get screenshot + page content
async function scrapeReelWithFirecrawl(url: string): Promise<{ screenshot: string; markdown: string; html: string } | null> {
  const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
  if (!apiKey) {
    console.log("FIRECRAWL_API_KEY not configured, skipping scrape");
    return null;
  }

  try {
    console.log("Scraping reel with Firecrawl:", url);
    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["screenshot", "markdown"],
        waitFor: 5000,
      }),
    });

    if (!response.ok) {
      console.error("Firecrawl scrape failed:", response.status);
      return null;
    }

    const data = await response.json();
    const screenshot = data.data?.screenshot || data.screenshot || "";
    const markdown = data.data?.markdown || data.markdown || "";
    const html = data.data?.html || data.html || "";

    console.log("Firecrawl scrape success, screenshot:", screenshot ? "yes" : "no", "markdown length:", markdown.length);
    return { screenshot, markdown, html };
  } catch (e) {
    console.error("Firecrawl scrape error:", e);
    return null;
  }
}

// Step 0b: Use AI to extract structured data from scraped content
async function extractDataFromScrapedContent(markdown: string, apiKey: string): Promise<{
  caption: string;
  hashtags: string;
  likes: number | null;
  comments: number | null;
  views: number | null;
  shares: number | null;
  saves: number | null;
  authorName: string;
  postDate: string | null;
  sampleComments: string;
} | null> {
  if (!markdown || markdown.length < 50) return null;

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
            role: "system",
            content: "You extract structured data from scraped Instagram reel pages. Return ONLY valid JSON, no markdown fences.",
          },
          {
            role: "user",
            content: `Extract the following data from this scraped Instagram reel page content. If a field is not found, use null for numbers and empty string for text.

Page content:
${markdown.substring(0, 8000)}

Return JSON:
{
  "caption": "<full caption text without hashtags>",
  "hashtags": "<all hashtags space-separated>",
  "likes": <number or null>,
  "comments": <number or null>,
  "views": <number or null>,
  "shares": <number or null>,
  "saves": <number or null>,
  "authorName": "<username or author name>",
  "postDate": "<ISO date string or null>",
  "sampleComments": "<up to 5 sample comments, one per line>"
}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("Data extraction AI failed:", response.status);
      return null;
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content?.trim() || "";
    if (content.startsWith("```")) {
      content = content.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    return JSON.parse(content);
  } catch (e) {
    console.error("Data extraction error:", e);
    return null;
  }
}

// Step 1: Analyze screenshot/thumbnail with Gemini vision
async function analyzeVisual(imageUrl: string, apiKey: string, isScreenshot: boolean): Promise<string> {
  try {
    const imageContent = isScreenshot && imageUrl.startsWith("data:")
      ? { type: "image_url" as const, image_url: { url: imageUrl } }
      : { type: "image_url" as const, image_url: { url: imageUrl } };

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
                text: isScreenshot
                  ? `This is a screenshot of an Instagram Reel page. Analyze EVERYTHING visible:
1. INSTAGRAM UI DATA: Extract any visible likes count, comments count, views count, username, caption text, hashtags, date posted
2. VIDEO CONTENT: What is shown in the video player? Describe the scene, objects, people, actions
3. TEXT ON SCREEN: Any overlay text, captions, subtitles visible
4. VISUAL STYLE: Professional, casual, cinematic, raw?
5. COLORS & MOOD: Dominant colors, lighting
6. ESTIMATED CATEGORY: Content niche (education, motivation, comedy, fitness, cooking, marketing, lifestyle, beauty, tech, gaming, storytelling, news, etc.)
7. ENGAGEMENT SIGNALS: Any visible engagement indicators (comment previews, like counts, share counts)

Be extremely specific about numbers and text you can read. This is a full page screenshot so extract ALL visible Instagram data.`
                  : `Analyze this Instagram Reel thumbnail image in detail. Describe:
1. OBJECTS: What objects, items, or props are visible?
2. PEOPLE: Are there people? How many? What are they doing?
3. SCENE: What is the setting/environment?
4. ACTIONS: What activity or action seems to be happening?
5. TEXT ON SCREEN: Is there any visible text or overlay text?
6. VISUAL STYLE: Professional, casual, cinematic, raw?
7. COLORS & MOOD: Dominant colors, lighting mood
8. ESTIMATED CATEGORY: Content niche

Be specific and factual about what you see.`,
              },
              imageContent,
            ],
          },
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
    console.error("Visual analysis error:", e);
    return "";
  }
}

// Step 2: Fetch similar viral patterns from database
async function fetchViralPatterns(category: string, supabaseUrl: string, serviceKey: string): Promise<any[]> {
  try {
    const supabase = createClient(supabaseUrl, serviceKey);
    const { data, error } = await supabase
      .from("viral_patterns")
      .select("*")
      .eq("primary_category", category)
      .gte("viral_score", 50)
      .order("viral_score", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Error fetching patterns:", error);
      return [];
    }
    return data || [];
  } catch (e) {
    console.error("Pattern fetch error:", e);
    return [];
  }
}

// Step 3: Store new pattern in database
async function storePattern(analysis: any, url: string, metrics: any, caption: string, hashtags: string, supabaseUrl: string, serviceKey: string) {
  try {
    const supabase = createClient(supabaseUrl, serviceKey);
    const cc = analysis.contentClassification;
    const hashtagCount = hashtags ? hashtags.split(/[#\s,]+/).filter((h: string) => h.length > 0).length : 0;

    const pattern = {
      reel_url: url,
      primary_category: cc?.primaryCategory || "other",
      sub_category: cc?.subCategory || null,
      content_type: cc?.contentType || null,
      hook_type: analysis.hookAnalysis?.openingType || null,
      hook_score: analysis.hookAnalysis?.score || null,
      caption_score: analysis.captionAnalysis?.score || null,
      hashtag_score: analysis.hashtagAnalysis?.score || null,
      engagement_score: analysis.engagementScore || null,
      trend_score: analysis.trendMatching?.score || null,
      viral_score: analysis.viralClassification?.score || analysis.viralScore || null,
      viral_status: analysis.viralClassification?.status || null,
      scene_cuts: analysis.videoSignals?.estimatedSceneCuts || null,
      face_presence: analysis.videoSignals?.facePresenceLikely || null,
      text_overlay: analysis.videoSignals?.textOverlayLikely || null,
      motion_intensity: analysis.videoSignals?.motionIntensity || null,
      video_quality_score: analysis.videoQuality?.qualityScore || null,
      audio_quality_score: analysis.audioQuality?.qualityScore || null,
      music_usage: analysis.audioQuality?.musicUsage || null,
      hashtag_count: hashtagCount,
      caption_length: caption?.length || 0,
      has_cta: analysis.captionAnalysis?.callToAction && analysis.captionAnalysis.callToAction !== "None detected",
      curiosity_level: analysis.captionAnalysis?.curiosityLevel || null,
      likes: metrics?.likes || null,
      comments: metrics?.comments || null,
      views: metrics?.views || null,
      shares: metrics?.shares || null,
      saves: metrics?.saves || null,
      engagement_rate: analysis.viralClassification?.engagementRate || null,
      matched_trends: analysis.trendMatching?.matchedTrends || [],
      emotional_triggers: analysis.captionAnalysis?.emotionalTriggers || [],
      thumbnail_analyzed: analysis.thumbnailAnalyzed || false,
    };

    const { error } = await supabase.from("viral_patterns").insert(pattern);
    if (error) console.error("Error storing pattern:", error);
    else console.log("Pattern stored successfully");
  } catch (e) {
    console.error("Pattern store error:", e);
  }
}

// Step 4: Compare current reel against viral patterns
function compareWithPatterns(analysis: any, patterns: any[]): any {
  if (patterns.length === 0) {
    return {
      patternsCompared: 0,
      similarityScore: null,
      categoryAvgScore: null,
      insights: ["No viral patterns in database yet for this category. Your analysis will help build the pattern database!"],
      topPatternFeatures: null,
    };
  }

  const scores = patterns.map(p => p.viral_score).filter(Boolean);
  const categoryAvg = scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0;

  let matchCount = 0;
  let totalChecks = 0;
  const currentHookType = analysis.hookAnalysis?.openingType?.toLowerCase();
  const currentCategory = analysis.contentClassification?.primaryCategory?.toLowerCase();
  const currentFace = analysis.videoSignals?.facePresenceLikely?.toLowerCase();
  const currentMotion = analysis.videoSignals?.motionIntensity?.toLowerCase();
  const currentSceneCuts = analysis.videoSignals?.estimatedSceneCuts?.toLowerCase();

  const viralPatterns = patterns.filter(p => (p.viral_score || 0) >= 70);

  for (const p of viralPatterns) {
    if (p.hook_type) {
      totalChecks++;
      if (p.hook_type.toLowerCase() === currentHookType) matchCount++;
    }
    if (p.face_presence) {
      totalChecks++;
      if (p.face_presence.toLowerCase().includes(currentFace?.split("/")[0] || "")) matchCount++;
    }
    if (p.motion_intensity) {
      totalChecks++;
      if (p.motion_intensity.toLowerCase() === currentMotion) matchCount++;
    }
    if (p.scene_cuts) {
      totalChecks++;
      if (p.scene_cuts.toLowerCase() === currentSceneCuts) matchCount++;
    }
  }

  const similarityScore = totalChecks > 0 ? Math.round((matchCount / totalChecks) * 100) : 50;

  const hookTypes: Record<string, number> = {};
  const facePresence: Record<string, number> = {};
  const motionLevels: Record<string, number> = {};

  for (const p of viralPatterns) {
    if (p.hook_type) hookTypes[p.hook_type] = (hookTypes[p.hook_type] || 0) + 1;
    if (p.face_presence) facePresence[p.face_presence] = (facePresence[p.face_presence] || 0) + 1;
    if (p.motion_intensity) motionLevels[p.motion_intensity] = (motionLevels[p.motion_intensity] || 0) + 1;
  }

  const topHook = Object.entries(hookTypes).sort((a, b) => b[1] - a[1])[0];
  const topFace = Object.entries(facePresence).sort((a, b) => b[1] - a[1])[0];
  const topMotion = Object.entries(motionLevels).sort((a, b) => b[1] - a[1])[0];

  const insights: string[] = [];
  const currentScore = analysis.viralClassification?.score || analysis.viralScore || 0;

  if (currentScore > categoryAvg) {
    insights.push(`Your reel scores ${currentScore - categoryAvg} points above the category average (${categoryAvg})`);
  } else if (currentScore < categoryAvg) {
    insights.push(`Your reel scores ${categoryAvg - currentScore} points below the category average (${categoryAvg})`);
  } else {
    insights.push(`Your reel matches the category average score of ${categoryAvg}`);
  }

  if (similarityScore >= 70) {
    insights.push(`High similarity (${similarityScore}%) with proven viral patterns in ${currentCategory}`);
  } else if (similarityScore >= 40) {
    insights.push(`Moderate similarity (${similarityScore}%) with viral patterns — some features align`);
  } else {
    insights.push(`Low similarity (${similarityScore}%) with known viral patterns — unique approach detected`);
  }

  if (topHook) insights.push(`Most viral hook type in ${currentCategory}: "${topHook[0]}" (${Math.round((topHook[1] / viralPatterns.length) * 100)}% of viral reels)`);
  if (topFace) insights.push(`Face presence in viral reels: "${topFace[0]}" is most common`);
  if (topMotion) insights.push(`Dominant motion style: "${topMotion[0]}" among top performers`);

  const avgHookScore = Math.round(viralPatterns.reduce((s, p) => s + (p.hook_score || 0), 0) / Math.max(viralPatterns.length, 1));
  const avgCaptionScore = Math.round(viralPatterns.reduce((s, p) => s + (p.caption_score || 0), 0) / Math.max(viralPatterns.length, 1));

  return {
    patternsCompared: patterns.length,
    viralPatternsCount: viralPatterns.length,
    similarityScore,
    categoryAvgScore: categoryAvg,
    categoryAvgHookScore: avgHookScore,
    categoryAvgCaptionScore: avgCaptionScore,
    insights,
    topPatternFeatures: {
      hookType: topHook?.[0] || null,
      facePresence: topFace?.[0] || null,
      motionIntensity: topMotion?.[0] || null,
    },
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { url, lang = "en", caption: userCaption, hashtags: userHashtags, metrics: userMetrics, sampleComments: userComments } = await req.json();
    const respondInHindi = lang === "hi";

    if (!url) {
      return new Response(JSON.stringify({ success: false, error: "URL is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    // === STEP 1: Scrape reel page with Firecrawl ===
    console.log("Step 1: Scraping reel page...");
    const scrapeResult = await scrapeReelWithFirecrawl(url);

    // === STEP 2: Extract data from scraped content ===
    let caption = userCaption || "";
    let hashtags = userHashtags || "";
    let metrics: any = userMetrics || {};
    let sampleComments = userComments || "";
    let authorName = "";
    let visionAnalysis = "";
    let thumbnailUrl = "";
    let screenshotUsed = false;

    // Check if user provided meaningful metrics
    const userProvidedMetrics = userMetrics && Object.values(userMetrics).some((v: any) => v !== undefined && v !== null);

    if (scrapeResult) {
      // Use AI to extract structured data from markdown (fill gaps user didn't provide)
      console.log("Step 2: Extracting data from scraped content...");
      const extracted = await extractDataFromScrapedContent(scrapeResult.markdown, LOVABLE_API_KEY);

      if (extracted) {
        // Only use auto-extracted data if user didn't provide it
        if (!caption) caption = extracted.caption || "";
        if (!hashtags) hashtags = extracted.hashtags || "";
        if (!authorName) authorName = extracted.authorName || "";
        if (!sampleComments) sampleComments = extracted.sampleComments || "";
        if (!userProvidedMetrics) {
          metrics = {
            likes: extracted.likes,
            comments: extracted.comments,
            views: extracted.views,
            shares: extracted.shares,
            saves: extracted.saves,
          };
        }
        console.log("Extracted data:", JSON.stringify({ caption: caption.substring(0, 100), hashtags, authorName, metrics }));
      }

      // Use screenshot for vision analysis (much richer than thumbnail)
      if (scrapeResult.screenshot) {
        console.log("Step 3: Running vision analysis on full screenshot...");
        const screenshotUrl = scrapeResult.screenshot.startsWith("data:")
          ? scrapeResult.screenshot
          : `data:image/png;base64,${scrapeResult.screenshot}`;
        visionAnalysis = await analyzeVisual(screenshotUrl, LOVABLE_API_KEY, true);
        screenshotUsed = true;
        console.log("Screenshot vision analysis complete");
      }
    }

    // === FALLBACK: oEmbed if Firecrawl failed ===
    let metadata = "";
    if (!scrapeResult || !visionAnalysis) {
      console.log("Fallback: Using oEmbed...");
      try {
        const oembedUrl = `https://api.instagram.com/oembed?url=${encodeURIComponent(url)}`;
        const oembedResp = await fetch(oembedUrl);
        if (oembedResp.ok) {
          const oembed = await oembedResp.json();
          metadata = `Title: ${oembed.title || "N/A"}\nAuthor: ${oembed.author_name || "N/A"}`;
          thumbnailUrl = oembed.thumbnail_url || "";
          if (!authorName) authorName = oembed.author_name || "";
        }
      } catch {
        console.log("oEmbed fetch failed");
      }

      // Fallback vision on thumbnail
      if (thumbnailUrl && !visionAnalysis) {
        console.log("Running vision analysis on thumbnail (fallback)...");
        visionAnalysis = await analyzeVisual(thumbnailUrl, LOVABLE_API_KEY, false);
      }
    }

    if (!metadata && authorName) {
      metadata = `Author: ${authorName}`;
    }

    const hasMetrics = metrics && Object.values(metrics).some((v: any) => v !== undefined && v !== null && v !== 0);
    let metricsSection = "";
    if (hasMetrics) {
      const parts = [];
      if (metrics.likes) parts.push(`Likes: ${metrics.likes}`);
      if (metrics.comments) parts.push(`Comments: ${metrics.comments}`);
      if (metrics.views) parts.push(`Views: ${metrics.views}`);
      if (metrics.shares) parts.push(`Shares: ${metrics.shares}`);
      if (metrics.saves) parts.push(`Saves: ${metrics.saves}`);
      metricsSection = `\nEngagement Metrics (auto-extracted):\n${parts.join("\n")}`;
    }

    let commentsSection = "";
    if (sampleComments) {
      commentsSection = `\nSample Comments (auto-extracted):\n${sampleComments}`;
    }

    const visionSection = visionAnalysis
      ? `\n=== VISUAL CONTENT ANALYSIS (from ${screenshotUsed ? "full page screenshot" : "thumbnail"}) ===\n${visionAnalysis}\n`
      : "";

    const langInstruction = respondInHindi
      ? "\n\nCRITICAL: Write ALL text values in Hindi. Keep JSON keys in English."
      : "";

    const prompt = `You are a world-class Instagram viral content analyst. Perform an extremely detailed analysis of this Reel.

=== INPUT DATA ===
Reel URL: ${url}
${metadata ? `Metadata:\n${metadata}` : ""}
${caption ? `Caption: ${caption}` : "No caption available"}
${hashtags ? `Hashtags: ${hashtags}` : "No hashtags detected"}${metricsSection}${commentsSection}
${visionSection}
=== ANALYSIS INSTRUCTIONS ===

${visionAnalysis ? `IMPORTANT: You have VISUAL ANALYSIS DATA from the reel's ${screenshotUsed ? "full page screenshot (includes Instagram UI with metrics)" : "thumbnail"}. Use this as the PRIMARY signal to understand what the reel is actually about. Cross-reference with caption and hashtags to classify the content accurately. The visual content should take priority over hashtags when determining the reel's true category.` : ""}

${screenshotUsed ? `CRITICAL: The screenshot shows the actual Instagram page. If you can see engagement metrics (likes, comments, views) in the screenshot that differ from the extracted data, use the SCREENSHOT values as they are more reliable.` : ""}

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
    ${metrics?.likes ? '"likes": { "value": ' + metrics.likes + ', "avgInCategory": <estimated>, "verdict": "<verdict>" },' : ''}
    ${metrics?.comments ? '"comments": { "value": ' + metrics.comments + ', "avgInCategory": <estimated>, "verdict": "<verdict>" },' : ''}
    ${metrics?.views ? '"views": { "value": ' + metrics.views + ', "avgInCategory": <estimated>, "verdict": "<verdict>" },' : ''}
    ${metrics?.shares ? '"shares": { "value": ' + metrics.shares + ', "avgInCategory": <estimated>, "verdict": "<verdict>" },' : ''}
    ${metrics?.saves ? '"saves": { "value": ' + metrics.saves + ', "avgInCategory": <estimated>, "verdict": "<verdict>" }' : ''}
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
          { role: "system", content: "You are an expert Instagram viral content analyst with deep knowledge of trends, algorithms, and engagement patterns. You can analyze visual content from screenshots and thumbnails to understand what a reel is actually about. Return only valid JSON. Be specific and actionable in your analysis." },
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
    if (analysis.hookAnalysis?.score >= 7) reasons.push("Effective hook grabs attention in first 3 seconds");
    if (analysis.captionAnalysis?.score >= 7) reasons.push("Strong caption drives curiosity and engagement");
    if (analysis.hashtagAnalysis?.score >= 7) reasons.push("Well-optimized hashtag strategy");
    if (analysis.trendMatching?.score >= 7) reasons.push("Content aligns with current viral trends");

    // === QUALITY BONUS/PENALTY ===
    let qualityBonus = 0;
    const vq = analysis.videoQuality;
    if (vq) {
      const vqScore = vq.qualityScore ?? 5;
      if (vqScore >= 8) { qualityBonus += 8; reasons.push("High video quality boosts viewer retention"); }
      else if (vqScore >= 6) { qualityBonus += 3; }
      else if (vqScore <= 3) { qualityBonus -= 5; reasons.push("Low video quality may reduce viewer retention"); }
    }
    const aq = analysis.audioQuality;
    if (aq) {
      const aqScore = aq.qualityScore ?? 5;
      if (aqScore >= 8) { qualityBonus += 5; reasons.push("Clean audio quality enhances engagement"); }
      else if (aqScore >= 6) { qualityBonus += 3; }
      else if (aqScore <= 3) { qualityBonus -= 5; reasons.push("Poor audio quality may cause viewers to skip"); }
    }
    qualityBonus = Math.max(-15, Math.min(15, qualityBonus));

    // === CONTENT CATEGORY BONUS ===
    let categoryBonus = 0;
    const cc = analysis.contentClassification;
    if (cc) {
      const highViralCategories = ["comedy", "motivation", "fitness", "storytelling"];
      if (highViralCategories.includes(cc.primaryCategory?.toLowerCase())) categoryBonus += 3;
      if (cc.hashtagAlignment?.toLowerCase().startsWith("yes")) categoryBonus += 2;
      else if (cc.hashtagAlignment?.toLowerCase().startsWith("no")) {
        categoryBonus -= 3;
        reasons.push("Hashtags don't match actual content — reduces discoverability");
      }
    }
    categoryBonus = Math.max(-5, Math.min(5, categoryBonus));

    // === PATTERN MATCHING BONUS ===
    let patternBonus = 0;
    let patternComparison = null;

    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const category = cc?.primaryCategory?.toLowerCase() || "other";
      const patterns = await fetchViralPatterns(category, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      patternComparison = compareWithPatterns(analysis, patterns);

      if (patternComparison.similarityScore !== null) {
        if (patternComparison.similarityScore >= 70) {
          patternBonus = 10;
          reasons.push(`High match (${patternComparison.similarityScore}%) with proven viral patterns`);
        } else if (patternComparison.similarityScore >= 40) {
          patternBonus = 5;
          reasons.push(`Moderate match (${patternComparison.similarityScore}%) with viral patterns`);
        } else {
          patternBonus = -3;
        }
      }
    }
    patternBonus = Math.max(-10, Math.min(10, patternBonus));

    let viralStatus, viralScore, viralLabel;
    const totalBonus = qualityBonus + categoryBonus + patternBonus;

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
        reasons.push("Metrics could not be extracted — score based on content analysis only");
      }
    }

    analysis.viralClassification = {
      status: viralStatus,
      score: viralScore,
      label: viralLabel,
      reasons: reasons.slice(0, 8),
      engagementRate: hasMetrics && viewsVal > 0 ? engRate : undefined,
    };

    analysis.thumbnailAnalyzed = !!visionAnalysis;
    analysis.patternComparison = patternComparison;

    // Store pattern in background
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      storePattern(analysis, url, metrics, caption || "", hashtags || "", SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        .catch(e => console.error("Background pattern store failed:", e));
    }

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
