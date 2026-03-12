import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

// Multi-key rotation with auto-failover
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

      // Success or other error - use this key next time too
      currentKeyIndex = idx;
      return response;
    } catch (e) {
      console.error(`Key #${idx + 1} network error:`, e);
      lastError = e instanceof Error ? e : new Error(String(e));
    }
  }

  // All keys exhausted - advance index for next call
  currentKeyIndex = (startIndex + 1) % keys.length;
  throw lastError || new Error("All API keys exhausted");
}

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
async function extractDataFromScrapedContent(markdown: string, _apiKey?: string): Promise<{
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
    const response = await callGemini({
      model: "gemini-2.5-flash",
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
async function analyzeVisual(imageUrl: string, _apiKey?: string, isScreenshot?: boolean): Promise<string> {
  try {
    const imageContent = { type: "image_url" as const, image_url: { url: imageUrl } };

    const response = await callGemini({
      model: "gemini-2.5-flash",
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

    const apiKeys = getApiKeys();
    if (apiKeys.length === 0) throw new Error("No GEMINI_API_KEY or GEMINI_API_KEYS configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    // Log usage for analytics
    try {
      const supabaseForLog = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
      await supabaseForLog.from("usage_logs").insert({
        reel_url: url,
        user_agent: req.headers.get("user-agent") || null,
      });
    } catch (e) {
      console.error("Usage log error:", e);
    }

    // === STEP 1: Direct meta tag scrape (fastest, most reliable) ===
    console.log("Step 1: Direct meta tag scrape...");
    const metaResult = await scrapeMetaTags(url);

    // === STEP 2: Firecrawl deep scrape (for screenshot + full content) ===
    console.log("Step 2: Firecrawl deep scrape...");
    const scrapeResult = await scrapeReelWithFirecrawl(url);

    // === STEP 3: Extract & merge data ===
    let caption = userCaption || "";
    let hashtags = userHashtags || "";
    let metrics: any = userMetrics || {};
    let sampleComments = userComments || "";
    let authorName = "";
    let visionAnalysis = "";
    let thumbnailUrl = "";
    let screenshotUsed = false;

    const userProvidedMetrics = userMetrics && Object.values(userMetrics).some((v: any) => v !== undefined && v !== null);

    // Layer 1: Meta tags data (og:description often has caption + metrics)
    if (metaResult) {
      if (!caption && metaResult.ogDescription) {
        // og:description format: "123 likes, 5 comments - Author (@handle) on Instagram: "caption text""
        const descMatch = metaResult.ogDescription.match(/on Instagram:\s*["""]?(.*)/is);
        if (descMatch) caption = descMatch[1].replace(/["""]$/, "").trim();
        else caption = metaResult.ogDescription;
      }
      if (!authorName && metaResult.authorName) authorName = metaResult.authorName;
      if (metaResult.ogImage) thumbnailUrl = metaResult.ogImage;
      
      // Try to extract metrics from og:description (e.g. "1,234 likes, 56 comments")
      if (!userProvidedMetrics && metaResult.ogDescription) {
        const likesMatch = metaResult.ogDescription.match(/([\d,.\w]+)\s+likes?/i);
        const commentsMatch = metaResult.ogDescription.match(/([\d,.\w]+)\s+comments?/i);
        if (likesMatch || commentsMatch) {
          const parseNum = (s: string) => {
            if (!s) return null;
            s = s.replace(/,/g, "");
            if (/k$/i.test(s)) return Math.round(parseFloat(s) * 1000);
            if (/m$/i.test(s)) return Math.round(parseFloat(s) * 1000000);
            return parseInt(s) || null;
          };
          metrics = {
            ...metrics,
            likes: metrics.likes || (likesMatch ? parseNum(likesMatch[1]) : null),
            comments: metrics.comments || (commentsMatch ? parseNum(commentsMatch[1]) : null),
          };
          console.log("Extracted metrics from meta tags:", JSON.stringify(metrics));
        }
      }
    }

    // Layer 2: Firecrawl data (richer, fills remaining gaps)
    if (scrapeResult) {
      console.log("Extracting data from Firecrawl content...");
      const extracted = await extractDataFromScrapedContent(scrapeResult.markdown);

      if (extracted) {
        if (!caption) caption = extracted.caption || "";
        if (!hashtags) hashtags = extracted.hashtags || "";
        if (!authorName) authorName = extracted.authorName || "";
        if (!sampleComments) sampleComments = extracted.sampleComments || "";
        if (!userProvidedMetrics && (!metrics.likes && !metrics.comments)) {
          metrics = {
            likes: extracted.likes,
            comments: extracted.comments,
            views: extracted.views,
            shares: extracted.shares,
            saves: extracted.saves,
          };
        }
        console.log("Firecrawl extracted data:", JSON.stringify({ caption: caption.substring(0, 100), hashtags, authorName }));
      }

      // Use screenshot for vision analysis
      if (scrapeResult.screenshot) {
        console.log("Running vision analysis on full screenshot...");
        const screenshotUrl = scrapeResult.screenshot.startsWith("data:")
          ? scrapeResult.screenshot
          : `data:image/png;base64,${scrapeResult.screenshot}`;
        visionAnalysis = await analyzeVisual(screenshotUrl, undefined, true);
        screenshotUsed = true;
        console.log("Screenshot vision analysis complete");
      }
    }

    // === Layer 3: oEmbed fallback ===
    let metadata = "";
    if (!thumbnailUrl || !authorName) {
      console.log("Fallback: Using oEmbed...");
      try {
        const oembedUrl = `https://api.instagram.com/oembed?url=${encodeURIComponent(url)}`;
        const oembedResp = await fetch(oembedUrl);
        if (oembedResp.ok) {
          const oembed = await oembedResp.json();
          metadata = `Title: ${oembed.title || "N/A"}\nAuthor: ${oembed.author_name || "N/A"}`;
          if (!thumbnailUrl) thumbnailUrl = oembed.thumbnail_url || "";
          if (!authorName) authorName = oembed.author_name || "";
          if (!caption && oembed.title) caption = oembed.title;
        }
      } catch {
        console.log("oEmbed fetch failed");
      }
    }

    // Layer 4: Alternative oEmbed (noembed.com)
    if (!thumbnailUrl) {
      console.log("Fallback: Using noembed...");
      try {
        const noembedResp = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
        if (noembedResp.ok) {
          const noembed = await noembedResp.json();
          if (!thumbnailUrl && noembed.thumbnail_url) thumbnailUrl = noembed.thumbnail_url;
          if (!authorName && noembed.author_name) authorName = noembed.author_name;
          if (!caption && noembed.title) caption = noembed.title;
        }
      } catch {
        console.log("noembed fetch failed");
      }
    }

    // Vision analysis on thumbnail if screenshot wasn't available
    if (thumbnailUrl && !visionAnalysis) {
      console.log("Running vision analysis on thumbnail (fallback)...");
      visionAnalysis = await analyzeVisual(thumbnailUrl, undefined, false);
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

IMPORTANT SCORING RULES:
- ALL individual scores (hook, caption, hashtag, engagement, trend, video quality, audio quality) must be between 1-8. NEVER give any score above 8 out of 10. Nothing is 100% perfect.
- The overall viralScore must be between 5-80. NEVER give viralScore above 80.
- Be realistic and critical in scoring. A score of 7-8 means EXCEPTIONALLY good.
- A score of 5-6 is GOOD. A score of 3-4 is AVERAGE. A score of 1-2 is POOR.

CONTENT VIRALITY FACTORS TO CONSIDER:
- Entertainment, music, GRWM, cars, bikes, fashion, dance categories have HIGHER viral potential — reflect this in scoring.
- Educational, learning, tutorial content has LOWER viral potential on Instagram — score conservatively for virality.
- If a FAMOUS PERSON (celebrity, influencer, politician, sports star) is detected, increase viral potential significantly.
- If a FAMOUS PLACE (landmark, tourist spot, iconic location) is shown, increase viral potential.
- If a FAMOUS OBJECT (luxury car, designer item, iconic product) is shown, increase viral potential.
- If content relates to a FAMOUS INCIDENT or TRENDING NEWS EVENT, increase viral potential.
- If a visually ATTRACTIVE person (beautiful woman, handsome man, bodybuilder/fitness model) is prominently featured, increase viral potential.
- If DEEP/BASS VOICE narration is detected or likely, increase viral potential.
- If content matches a CURRENT TRENDING TOPIC or format, increase viral potential significantly.

ADDITIONAL DETECTION (add to your analysis):
- "celebrityOrFamousPerson": true/false — is a recognizable celebrity or famous person in the reel?
- "famousPlaceOrObject": true/false — is a famous/iconic place or object shown?
- "attractivePresenter": true/false — is a visually attractive person prominently featured?
- "deepVoiceLikely": true/false — does the content likely feature a deep/bass voice?
- "trendingTopicRelevance": "high/medium/low/none" — how closely does this relate to current trending topics?
- "famousIncident": true/false — does this relate to a famous or newsworthy incident?

Perform ALL of these analyses:

1. CONTENT CLASSIFICATION (CRITICAL - analyze what the reel is actually about):
   - Primary category (education, motivation, comedy, marketing, fitness, lifestyle, cooking, beauty, tech, gaming, storytelling, news, entertainment, music, grwm, cars, bikes, dance, fashion, other)
   - Sub-category (more specific niche)
   - Content type (tutorial, entertainment, review, vlog, transformation, skit, etc.)
   - Detected elements: objects, people, actions, scene setting
   - On-screen text detected (from visual analysis)
   - Estimated spoken topic (inferred from visuals + caption)
   - Confidence level (high/medium/low) based on available signals

2. HOOK ANALYSIS (first 3 seconds):
   - What type of opening does the content suggest? (question, shock, story, visual)
   - Rate the attention-grabbing potential (MAX 8)
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
  "viralScore": <5-80>,
  "overallSummary": "<3-4 sentence comprehensive summary>",

  "contentClassification": {
    "primaryCategory": "<education/motivation/comedy/marketing/fitness/lifestyle/cooking/beauty/tech/gaming/storytelling/news/entertainment/music/grwm/cars/bikes/dance/fashion/other>",
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

  "viralityFactors": {
    "celebrityOrFamousPerson": false,
    "famousPlaceOrObject": false,
    "attractivePresenter": false,
    "deepVoiceLikely": false,
    "trendingTopicRelevance": "none",
    "famousIncident": false
  },

  "hookAnalysis": {
    "score": <1-8>,
    "firstThreeSeconds": "<what likely happens in first 3 seconds based on content>",
    "openingType": "<question/shock/story/visual/tutorial/other>",
    "attentionGrabber": "<main attention element>",
    "details": ["<specific insight 1>", "<insight 2>", "<insight 3>"]
  },

  "captionAnalysis": {
    "score": <1-8>,
    "curiosityLevel": <1-10>,
    "emotionalTriggers": ["<trigger1>", "<trigger2>"],
    "callToAction": "<description of CTA or 'None detected'>",
    "keywordDensity": "<assessment>",
    "lengthEffectiveness": "<too short/optimal/too long + why>",
    "details": ["<insight 1>", "<insight 2>", "<insight 3>"]
  },

  "hashtagAnalysis": {
    "score": <1-8>,
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
    "qualityScore": <1-8>
  },

  "audioQuality": {
    "voiceClarity": "<clear/muffled/none>",
    "backgroundAudio": "<clean/moderate/noisy>",
    "soundBalance": "<balanced/unbalanced/distorted>",
    "musicUsage": "<trending/original/none>",
    "qualityScore": <1-8>
  },

  "trendMatching": {
    "score": <1-8>,
    "formatSimilarity": "<description>",
    "hookPattern": "<matched pattern name>",
    "trendingStructure": "<structure type>",
    "matchedTrends": ["<trend1>", "<trend2>"],
    "details": ["<insight 1>", "<insight 2>", "<insight 3>"]
  },

  "engagementScore": <1-8>,
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

    const response = await callGemini({
      model: "gemini-2.5-flash",
      messages: [
        { role: "system", content: "You are an expert Instagram viral content analyst with deep knowledge of trends, algorithms, and engagement patterns. You can analyze visual content from screenshots and thumbnails to understand what a reel is actually about. Return only valid JSON. Be specific and actionable in your analysis." },
        { role: "user", content: prompt },
      ],
    });
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

    // === HARD CAP: Clamp all AI sub-scores to max 8 ===
    if (analysis.hookAnalysis) analysis.hookAnalysis.score = Math.min(8, analysis.hookAnalysis.score ?? 5);
    if (analysis.captionAnalysis) analysis.captionAnalysis.score = Math.min(8, analysis.captionAnalysis.score ?? 5);
    if (analysis.hashtagAnalysis) analysis.hashtagAnalysis.score = Math.min(8, analysis.hashtagAnalysis.score ?? 5);
    if (analysis.trendMatching) analysis.trendMatching.score = Math.min(8, analysis.trendMatching.score ?? 5);
    if (analysis.videoQuality) analysis.videoQuality.qualityScore = Math.min(8, analysis.videoQuality.qualityScore ?? 5);
    if (analysis.audioQuality) analysis.audioQuality.qualityScore = Math.min(8, analysis.audioQuality.qualityScore ?? 5);
    if (analysis.engagementScore) analysis.engagementScore = Math.min(8, analysis.engagementScore);
    if (analysis.viralScore) analysis.viralScore = Math.min(80, analysis.viralScore);

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

    // === BUILD VIRALITY INSIGHTS (for paid PDF) ===
    const viralityInsights: { factor: string; detected: boolean; impact: string; score: number; reason: string; solution: string }[] = [];

    // === QUALITY BONUS/PENALTY ===
    let qualityBonus = 0;
    const vq = analysis.videoQuality;
    if (vq) {
      const vqScore = vq.qualityScore ?? 5;
      if (vqScore >= 7) {
        qualityBonus += 5;
        reasons.push("High video quality boosts viewer retention");
        viralityInsights.push({ factor: "Video Quality", detected: true, impact: "positive", score: 5, reason: "High quality video with good lighting and clarity keeps viewers watching longer", solution: "Maintain this quality. Use natural light or ring light for consistency." });
      } else if (vqScore >= 5) {
        qualityBonus += 2;
        viralityInsights.push({ factor: "Video Quality", detected: true, impact: "neutral", score: 2, reason: "Average video quality — not bad but not standout", solution: "Upgrade to HD recording, use a tripod, and ensure good lighting to boost retention." });
      } else {
        qualityBonus -= 5;
        reasons.push("Low video quality may reduce viewer retention");
        viralityInsights.push({ factor: "Video Quality", detected: true, impact: "negative", score: -5, reason: "Low quality, dark or shaky footage causes viewers to scroll away quickly", solution: "Record in HD (1080p minimum), use stable mounting, and ensure proper lighting." });
      }
    }
    const aq = analysis.audioQuality;
    if (aq) {
      const aqScore = aq.qualityScore ?? 5;
      if (aqScore >= 7) {
        qualityBonus += 4;
        reasons.push("Clean audio quality enhances engagement");
        viralityInsights.push({ factor: "Audio Quality", detected: true, impact: "positive", score: 4, reason: "Clear audio keeps viewers engaged and increases watch time", solution: "Keep using quality mic setup. Consider adding trending background music for extra boost." });
      } else if (aqScore >= 5) {
        qualityBonus += 2;
      } else {
        qualityBonus -= 5;
        reasons.push("Poor audio quality may cause viewers to skip");
        viralityInsights.push({ factor: "Audio Quality", detected: true, impact: "negative", score: -5, reason: "Poor audio with noise/distortion causes immediate scroll-away", solution: "Use a lapel mic or phone close to mouth. Record in quiet environment. Add background music to mask minor noise." });
      }
    }
    qualityBonus = Math.max(-10, Math.min(10, qualityBonus));

    // === CONTENT CATEGORY BONUS (expanded) ===
    let categoryBonus = 0;
    const cc = analysis.contentClassification;
    if (cc) {
      const highViralCategories = ["comedy", "entertainment", "music", "grwm", "cars", "bikes", "dance", "fashion", "motivation", "fitness", "storytelling", "memes"];
      const lowViralCategories = ["education", "learning", "tutorial", "educational"];
      const catLower = cc.primaryCategory?.toLowerCase() || "";
      const contentTypeLower = cc.contentType?.toLowerCase() || "";

      if (highViralCategories.includes(catLower)) {
        categoryBonus += 5;
        reasons.push(`${cc.primaryCategory} content has higher viral potential on Instagram`);
        viralityInsights.push({ factor: "Content Category", detected: true, impact: "positive", score: 5, reason: `${cc.primaryCategory} is a viral-friendly niche — Instagram algorithm favors entertainment and visually engaging content`, solution: "Keep creating in this niche. Mix trending formats with your unique style for maximum reach." });
      } else if (lowViralCategories.includes(catLower) || lowViralCategories.includes(contentTypeLower)) {
        categoryBonus -= 4;
        reasons.push("Educational/learning content has lower viral potential on Instagram");
        viralityInsights.push({ factor: "Content Category", detected: true, impact: "negative", score: -4, reason: "Educational content gets less shares and saves compared to entertainment on Instagram", solution: "Make educational content entertaining — use humor, storytelling, quick cuts, and trending audio. 'Edutainment' format performs much better." });
      } else {
        viralityInsights.push({ factor: "Content Category", detected: true, impact: "neutral", score: 0, reason: `${cc.primaryCategory} has moderate viral potential`, solution: "Consider adding entertainment elements or trending hooks to boost shareability." });
      }
      if (cc.hashtagAlignment?.toLowerCase().startsWith("yes")) categoryBonus += 2;
      else if (cc.hashtagAlignment?.toLowerCase().startsWith("no")) {
        categoryBonus -= 3;
        reasons.push("Hashtags don't match actual content — reduces discoverability");
        viralityInsights.push({ factor: "Hashtag-Content Mismatch", detected: true, impact: "negative", score: -3, reason: "Using unrelated hashtags confuses the algorithm and reduces your content's reach to the right audience", solution: "Use hashtags that directly relate to your video content. Mix 3-5 niche hashtags with 2-3 broader ones." });
      }
    }
    categoryBonus = Math.max(-7, Math.min(7, categoryBonus));

    // === VIRALITY FACTORS BONUS ===
    let viralityFactorsBonus = 0;
    const vf = analysis.viralityFactors;
    if (vf) {
      if (vf.celebrityOrFamousPerson) {
        viralityFactorsBonus += 8;
        reasons.push("Famous person detected — significantly increases viral potential");
        viralityInsights.push({ factor: "Celebrity/Famous Person", detected: true, impact: "positive", score: 8, reason: "Content featuring celebrities or famous personalities gets 3-5x more shares due to existing fan base and curiosity", solution: "Tag the celebrity, use their trending hashtags, and post when their fans are most active." });
      } else {
        viralityInsights.push({ factor: "Celebrity/Famous Person", detected: false, impact: "neutral", score: 0, reason: "No famous personality detected in the reel", solution: "If relevant, create content around trending celebrities or react to their content for more visibility." });
      }
      if (vf.famousPlaceOrObject) {
        viralityFactorsBonus += 5;
        reasons.push("Famous place/object detected — increases viewer interest");
        viralityInsights.push({ factor: "Famous Place/Object", detected: true, impact: "positive", score: 5, reason: "Iconic locations and luxury/famous objects create aspirational content that gets high engagement", solution: "Use location tags, mention the place in caption, and use location-specific hashtags." });
      }
      if (vf.attractivePresenter) {
        viralityFactorsBonus += 4;
        reasons.push("Attractive presenter increases viewer retention and shares");
        viralityInsights.push({ factor: "Attractive Presenter", detected: true, impact: "positive", score: 4, reason: "Visually appealing presenters (beautiful/handsome/fit people) naturally hold attention longer and get more profile visits", solution: "Ensure good grooming, confident body language, and maintain eye contact with camera for maximum impact." });
      }
      if (vf.deepVoiceLikely) {
        viralityFactorsBonus += 3;
        reasons.push("Deep/bass voice narration enhances content authority and engagement");
        viralityInsights.push({ factor: "Deep/Unique Voice", detected: true, impact: "positive", score: 3, reason: "Deep or unique voice creates an authoritative, memorable impression that increases watch time", solution: "Use this voice consistently as your brand identity. Consider voiceover content where this becomes your signature." });
      }
      if (vf.famousIncident) {
        viralityFactorsBonus += 6;
        reasons.push("Content relates to a famous/trending incident — high share potential");
        viralityInsights.push({ factor: "Famous/Trending Incident", detected: true, impact: "positive", score: 6, reason: "Trending news and famous incidents drive massive search traffic and shares — timing is everything", solution: "Post as quickly as possible when incidents happen. First-mover advantage is key for news-related virality." });
      }
      const trendRelevance = vf.trendingTopicRelevance?.toLowerCase();
      if (trendRelevance === "high") {
        viralityFactorsBonus += 7;
        reasons.push("Highly relevant to current trending topics — strong viral potential");
        viralityInsights.push({ factor: "Trending Topic Relevance", detected: true, impact: "positive", score: 7, reason: "Content matching current trends gets algorithmic boost — Instagram pushes trending content to Explore page", solution: "Keep riding this trend while it's hot. Create multiple variations quickly to maximize reach window." });
      } else if (trendRelevance === "medium") {
        viralityFactorsBonus += 4;
        reasons.push("Moderately relevant to trending topics");
        viralityInsights.push({ factor: "Trending Topic Relevance", detected: true, impact: "positive", score: 4, reason: "Some connection to current trends helps discoverability", solution: "Strengthen the connection to trending topics in your hashtags and caption. Use trending audio to boost." });
      } else {
        viralityInsights.push({ factor: "Trending Topic Relevance", detected: false, impact: "neutral", score: 0, reason: "Content doesn't strongly connect to any current trending topic", solution: "Research daily trends on Instagram Explore, Twitter/X, and Google Trends. Adapt your content to include trending elements." });
      }
    }

    // === ADDITIONAL CONTENT FACTORS ===
    // Thumbnail/visual appeal (from video signals)
    const vs = analysis.videoSignals;
    if (vs) {
      if (vs.facePresenceLikely?.toLowerCase().includes("yes")) {
        viralityFactorsBonus += 2;
        viralityInsights.push({ factor: "Face in Thumbnail", detected: true, impact: "positive", score: 2, reason: "Reels with human faces in thumbnails get 38% more clicks — faces create instant emotional connection", solution: "Always show your face clearly in the first frame. Use expressive emotions for maximum thumbnail appeal." });
      }
      if (vs.textOverlayLikely?.toLowerCase().includes("yes")) {
        viralityFactorsBonus += 2;
        viralityInsights.push({ factor: "Text Overlay/Hook", detected: true, impact: "positive", score: 2, reason: "On-screen text hooks stop the scroll and give viewers a reason to watch even with sound off", solution: "Keep text hooks short (5-7 words max), use bold fonts, and create curiosity gaps." });
      }
      if (vs.motionIntensity?.toLowerCase() === "high") {
        viralityFactorsBonus += 2;
        viralityInsights.push({ factor: "High Motion/Action", detected: true, impact: "positive", score: 2, reason: "Dynamic, fast-paced content with action sequences maintains viewer attention through the full video", solution: "Maintain this energy. Use quick cuts (every 2-3 seconds) and avoid static shots longer than 3 seconds." });
      } else if (vs.motionIntensity?.toLowerCase() === "low") {
        viralityInsights.push({ factor: "Low Motion/Static", detected: true, impact: "negative", score: -1, reason: "Static or slow-moving content has higher drop-off rates on Instagram Reels", solution: "Add camera movement, zoom transitions, B-roll clips, or text animations to create visual dynamism." });
      }
    }

    // Trending music
    if (aq?.musicUsage?.toLowerCase() === "trending") {
      viralityFactorsBonus += 3;
      reasons.push("Trending background music boosts algorithmic reach");
      viralityInsights.push({ factor: "Trending Music", detected: true, impact: "positive", score: 3, reason: "Instagram algorithm heavily promotes content using currently trending audio — it can 2-3x your reach", solution: "Always check Instagram's trending audio section before posting. Use audio within first 48 hours of it trending." });
    } else if (aq?.musicUsage?.toLowerCase() === "none") {
      viralityInsights.push({ factor: "No Background Music", detected: true, impact: "negative", score: -1, reason: "Reels without any music/audio feel incomplete and get less engagement", solution: "Add trending or mood-matching background music. Even soft background music improves watch time significantly." });
    }

    // Humor/memes/pets detection from content classification
    if (cc) {
      const catLower = cc.primaryCategory?.toLowerCase() || "";
      const subCatLower = cc.subCategory?.toLowerCase() || "";
      const topicLower = cc.detectedElements?.estimatedTopic?.toLowerCase() || "";
      
      if (catLower.includes("meme") || subCatLower.includes("meme") || subCatLower.includes("humor") || topicLower.includes("meme") || topicLower.includes("funny")) {
        viralityFactorsBonus += 3;
        viralityInsights.push({ factor: "Humor/Memes", detected: true, impact: "positive", score: 3, reason: "Humorous and meme content is the most shared content type on Instagram — people love making others laugh", solution: "Keep the humor relatable. Use current meme formats and add your own twist for uniqueness." });
      }
      if (topicLower.includes("pet") || topicLower.includes("dog") || topicLower.includes("cat") || topicLower.includes("animal") || subCatLower.includes("pet")) {
        viralityFactorsBonus += 3;
        viralityInsights.push({ factor: "Cute Animals/Pets", detected: true, impact: "positive", score: 3, reason: "Pet and animal content consistently goes viral — it's universally loved and highly shareable", solution: "Capture candid, funny, or adorable moments. Add relatable captions from the pet's perspective." });
      }
      if (topicLower.includes("challenge") || topicLower.includes("trend") || subCatLower.includes("challenge") || topicLower.includes("festival")) {
        viralityFactorsBonus += 3;
        viralityInsights.push({ factor: "Challenge/Trend/Festival", detected: true, impact: "positive", score: 3, reason: "Challenges, trends, and festival content ride massive organic wave — perfect timing multiplies reach", solution: "Post challenge content within the first 48-72 hours of the trend. For festivals, start 2-3 days before." });
      }
    }

    viralityFactorsBonus = Math.max(0, Math.min(18, viralityFactorsBonus));

    // === AGE PENALTY: Refined gradual decrease ===
    let agePenalty = 0;
    let postDate: Date | null = null;
    let daysSincePost: number | null = null;
    if (analysis._postDate) {
      const pd = new Date(analysis._postDate);
      if (!isNaN(pd.getTime())) postDate = pd;
    }

    if (postDate) {
      const now = new Date();
      daysSincePost = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSincePost <= 2) {
        // 0-2 days: Full potential, no penalty
        agePenalty = 0;
        viralityInsights.push({ factor: "Reel Age (Fresh)", detected: true, impact: "positive", score: 0, reason: "Reel is fresh (0-2 days old) — this is the peak viral window. Most viral reels blow up within first 48 hours", solution: "Maximize engagement NOW. Reply to every comment, share to stories, and ask friends to engage in first hour." });
      } else if (daysSincePost <= 5) {
        // 3-5 days: Small gradual decrease
        agePenalty = -Math.round((daysSincePost - 2) * 2);
        reasons.push(`Reel is ${Math.round(daysSincePost)} days old — initial viral window narrowing`);
        viralityInsights.push({ factor: "Reel Age (3-5 Days)", detected: true, impact: "negative", score: agePenalty, reason: "Reel has passed the initial 48-hour peak window. Algorithm starts favoring newer content", solution: "Share to stories again, cross-post to other platforms, engage heavily with comments to signal activity." });
      } else if (daysSincePost <= 7) {
        // 6-7 days: Moderate decrease
        agePenalty = -Math.round(6 + (daysSincePost - 5) * 2);
        reasons.push(`Reel is ${Math.round(daysSincePost)} days old — viral potential declining`);
        viralityInsights.push({ factor: "Reel Age (6-7 Days)", detected: true, impact: "negative", score: agePenalty, reason: "After a week, the algorithm significantly reduces push for this content. Viral chance is much lower", solution: "Focus on creating a new reel with improved elements. Learn from this reel's analytics and iterate." });
      } else if (daysSincePost <= 15) {
        // 8-15 days: Low chance
        agePenalty = -Math.round(10 + (daysSincePost - 7) * 1.5);
        reasons.push(`Reel is ${Math.round(daysSincePost)} days old — viral chance is very low`);
        viralityInsights.push({ factor: "Reel Age (8-15 Days)", detected: true, impact: "negative", score: agePenalty, reason: "Content is too old for algorithm boost. Only exceptionally engaging content gets rediscovered after this point", solution: "Create a fresh version of this content with updated hooks and trending audio. Don't try to revive old reels." });
      } else {
        // 15+ days: Almost negligible
        agePenalty = -Math.round(Math.min(25, 22 + (daysSincePost - 15) * 0.3));
        reasons.push(`Reel is ${Math.round(daysSincePost)}+ days old — viral window has passed`);
        viralityInsights.push({ factor: "Reel Age (15+ Days)", detected: true, impact: "negative", score: agePenalty, reason: "Viral potential is almost negligible. Instagram prioritizes fresh content. If it didn't go viral in 1-2 days, it likely won't now", solution: "Don't waste time promoting old reels. Take the best elements and create new content. Consistency beats revival." });
      }
    }

    // Old reel + low engagement = extra penalty
    if (daysSincePost !== null && daysSincePost > 7 && hasMetrics && !isAlreadyViral && !isGrowing) {
      agePenalty -= 5;
      viralityInsights.push({ factor: "Old + Low Engagement", detected: true, impact: "negative", score: -5, reason: "Old reel with low engagement is a strong signal that the content won't go viral", solution: "Analyze what didn't work: Was the hook weak? Caption unengaging? Wrong posting time? Apply these learnings to your next reel." });
    }

    // === PATTERN MATCHING BONUS ===
    let patternBonus = 0;
    let patternComparison = null;

    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const category = cc?.primaryCategory?.toLowerCase() || "other";
      const patterns = await fetchViralPatterns(category, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      patternComparison = compareWithPatterns(analysis, patterns);

      if (patternComparison.similarityScore !== null) {
        if (patternComparison.similarityScore >= 70) {
          patternBonus = 8;
          reasons.push(`High match (${patternComparison.similarityScore}%) with proven viral patterns`);
        } else if (patternComparison.similarityScore >= 40) {
          patternBonus = 4;
          reasons.push(`Moderate match (${patternComparison.similarityScore}%) with viral patterns`);
        } else {
          patternBonus = -3;
        }
      }
    }
    patternBonus = Math.max(-8, Math.min(8, patternBonus));

    // === Hook in first 3 seconds bonus ===
    const hookScore = analysis.hookAnalysis?.score ?? 5;
    if (hookScore >= 7) {
      viralityInsights.push({ factor: "Strong Hook (First 3 Sec)", detected: true, impact: "positive", score: 3, reason: "A powerful opening hook in the first 3 seconds is the #1 factor for viral reels — it stops the scroll", solution: "Keep using strong hooks. Test different types: questions, shocking facts, visual surprises, or bold statements." });
    } else if (hookScore <= 3) {
      viralityInsights.push({ factor: "Weak Hook (First 3 Sec)", detected: true, impact: "negative", score: -2, reason: "Weak opening causes 60-70% of viewers to scroll away within first 2 seconds", solution: "Start with a bang: bold text overlay, surprising visual, provocative question, or emotional trigger in the very first frame." });
    }

    // Trending hashtags bonus
    if (analysis.hashtagAnalysis?.score >= 7) {
      viralityInsights.push({ factor: "Trending/Engaging Hashtags", detected: true, impact: "positive", score: 2, reason: "Well-researched hashtags help Instagram categorize and push your content to the right audience", solution: "Mix 5-7 niche + 3-5 broad hashtags. Research trending tags daily using Instagram search." });
    }

    // Caption engagement
    if (analysis.captionAnalysis?.score >= 7) {
      viralityInsights.push({ factor: "Engaging Caption", detected: true, impact: "positive", score: 2, reason: "Captions that create curiosity or emotion drive comments and saves, boosting algorithmic ranking", solution: "Keep using storytelling and questions in captions. End with a CTA that encourages comments." });
    }

    // Store insights in analysis for paid PDF
    analysis._viralityInsights = viralityInsights;
    analysis._daysSincePost = daysSincePost;

    let viralStatus, viralScore, viralLabel;
    const totalBonus = qualityBonus + categoryBonus + patternBonus + viralityFactorsBonus + agePenalty;

    if (hasMetrics && isAlreadyViral) {
      viralStatus = "Already Viral";
      viralScore = Math.min(80, Math.max(55, Math.round(60 + (engRate * 100) + totalBonus)));
      viralLabel = "Viral Strength";
    } else if (hasMetrics && isGrowing) {
      viralStatus = "Growing";
      const hookS = (analysis.hookAnalysis?.score ?? 5) / 8;
      const capS = (analysis.captionAnalysis?.score ?? 5) / 8;
      const hashS = (analysis.hashtagAnalysis?.score ?? 5) / 8;
      const engS = Math.min(1, engRate / 0.07);
      const comS = Math.min(1, commentsVal / 500);
      viralScore = Math.min(80, Math.max(5, Math.round((hookS * 25 + capS * 15 + hashS * 10 + engS * 20 + comS * 10) + totalBonus)));
      viralLabel = "Viral Potential";
    } else {
      viralStatus = hasMetrics ? "Low Viral Potential" : (analysis.viralScore >= 50 ? "Growing" : "Low Viral Potential");
      const hookS = (analysis.hookAnalysis?.score ?? 5) / 8;
      const capS = (analysis.captionAnalysis?.score ?? 5) / 8;
      const hashS = (analysis.hashtagAnalysis?.score ?? 5) / 8;
      const engS = hasMetrics ? Math.min(1, engRate / 0.07) : (analysis.engagementScore ?? 5) / 8;
      const comS = hasMetrics ? Math.min(1, commentsVal / 500) : 0.4;
      viralScore = Math.min(80, Math.max(5, Math.round((hookS * 25 + capS * 15 + hashS * 10 + engS * 20 + comS * 10) + totalBonus)));
      viralLabel = "Viral Potential";
      if (!hasMetrics && reasons.length === 0) {
        if (analysis.hookAnalysis?.score >= 5) reasons.push("Decent hook potential");
        if (analysis.captionAnalysis?.score >= 5) reasons.push("Caption has engagement potential");
        reasons.push("Metrics could not be extracted — score based on content analysis only");
      }
    }

    // Final hard cap at 80
    viralScore = Math.min(80, viralScore);

    analysis.viralClassification = {
      status: viralStatus,
      score: viralScore,
      label: viralLabel,
      reasons: reasons.slice(0, 10),
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
