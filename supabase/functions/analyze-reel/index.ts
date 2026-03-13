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

// ========== REGEX-BASED DATA EXTRACTION (NO AI) ==========

function parseNumberString(s: string | undefined | null): number | null {
  if (!s) return null;
  s = s.replace(/,/g, "").trim();
  if (/k$/i.test(s)) return Math.round(parseFloat(s) * 1000);
  if (/m$/i.test(s)) return Math.round(parseFloat(s) * 1000000);
  if (/b$/i.test(s)) return Math.round(parseFloat(s) * 1000000000);
  if (/lakh/i.test(s)) return Math.round(parseFloat(s) * 100000);
  if (/cr/i.test(s)) return Math.round(parseFloat(s) * 10000000);
  const n = parseInt(s);
  return isNaN(n) ? null : n;
}

function extractDataFromMarkdown(markdown: string): {
  caption: string;
  hashtags: string;
  likes: number | null;
  comments: number | null;
  views: number | null;
  shares: number | null;
  saves: number | null;
  authorName: string;
  postDate: string | null;
  sampleComments: string[];
} {
  const result = {
    caption: "",
    hashtags: "",
    likes: null as number | null,
    comments: null as number | null,
    views: null as number | null,
    shares: null as number | null,
    saves: null as number | null,
    authorName: "",
    postDate: null as string | null,
    sampleComments: [] as string[],
  };

  if (!markdown || markdown.length < 20) return result;

  const text = markdown;

  // --- Extract likes ---
  const likesPatterns = [
    /(\d[\d,.\w]*)\s+likes?/i,
    /likes?\s*[:=]\s*(\d[\d,.\w]*)/i,
    /❤️\s*(\d[\d,.\w]*)/i,
    /(\d[\d,.\w]*)\s*❤/i,
  ];
  for (const pat of likesPatterns) {
    const m = text.match(pat);
    if (m) { result.likes = parseNumberString(m[1]); break; }
  }

  // --- Extract comments count ---
  const commentsPatterns = [
    /(\d[\d,.\w]*)\s+comments?/i,
    /comments?\s*[:=]\s*(\d[\d,.\w]*)/i,
    /💬\s*(\d[\d,.\w]*)/i,
  ];
  for (const pat of commentsPatterns) {
    const m = text.match(pat);
    if (m) { result.comments = parseNumberString(m[1]); break; }
  }

  // --- Extract views ---
  const viewsPatterns = [
    /(\d[\d,.\w]*)\s+views?/i,
    /views?\s*[:=]\s*(\d[\d,.\w]*)/i,
    /▶️?\s*(\d[\d,.\w]*)/i,
    /(\d[\d,.\w]*)\s+plays?/i,
  ];
  for (const pat of viewsPatterns) {
    const m = text.match(pat);
    if (m) { result.views = parseNumberString(m[1]); break; }
  }

  // --- Extract shares ---
  const sharesMatch = text.match(/(\d[\d,.\w]*)\s+shares?/i) || text.match(/shares?\s*[:=]\s*(\d[\d,.\w]*)/i);
  if (sharesMatch) result.shares = parseNumberString(sharesMatch[1]);

  // --- Extract saves ---
  const savesMatch = text.match(/(\d[\d,.\w]*)\s+saves?/i) || text.match(/saves?\s*[:=]\s*(\d[\d,.\w]*)/i);
  if (savesMatch) result.saves = parseNumberString(savesMatch[1]);

  // --- Extract hashtags ---
  const hashtagMatches = text.match(/#[\w\u0900-\u097F]+/g);
  if (hashtagMatches) {
    result.hashtags = [...new Set(hashtagMatches)].join(" ");
  }

  // --- Extract caption ---
  // Pattern 1: "on Instagram: "caption""
  const captionMatch1 = text.match(/on Instagram:\s*["""]?([\s\S]*?)(?:["""]?\s*$|#\w)/im);
  if (captionMatch1) {
    result.caption = captionMatch1[1].replace(/#[\w]+/g, "").trim();
  }
  // Pattern 2: Look for a long paragraph that's not a comment
  if (!result.caption) {
    const lines = text.split("\n").filter(l => l.trim().length > 30 && !l.trim().startsWith("@") && !l.trim().startsWith("http"));
    if (lines.length > 0) {
      // Pick the longest line as likely caption
      result.caption = lines.sort((a, b) => b.length - a.length)[0].trim();
    }
  }
  // Remove hashtags from caption
  if (result.caption) {
    result.caption = result.caption.replace(/#[\w\u0900-\u097F]+/g, "").trim();
  }

  // --- Extract author/username ---
  const authorPatterns = [
    /(?:@|by\s+)(\w[\w.]{1,29})/i,
    /^(.+?)\s+on\s+Instagram/im,
    /(?:Author|Username|Posted by):\s*(.+)/im,
  ];
  for (const pat of authorPatterns) {
    const m = text.match(pat);
    if (m) { result.authorName = m[1].trim(); break; }
  }

  // --- Extract post date ---
  const datePatterns = [
    /(\d{4}-\d{2}-\d{2}T[\d:]+)/,  // ISO format
    /(\w+ \d{1,2},?\s*\d{4})/,      // "Jan 15, 2024"
    /(\d{1,2}\s+\w+\s+\d{4})/,      // "15 January 2024"
    /(\d{1,2}\/\d{1,2}\/\d{4})/,    // "01/15/2024"
    /(\d+)\s*(?:hours?|hrs?|h)\s*ago/i,
    /(\d+)\s*(?:days?|d)\s*ago/i,
    /(\d+)\s*(?:weeks?|w)\s*ago/i,
  ];
  for (const pat of datePatterns) {
    const m = text.match(pat);
    if (m) {
      // Handle relative dates
      if (/hours?\s*ago/i.test(m[0])) {
        const d = new Date(); d.setHours(d.getHours() - parseInt(m[1]));
        result.postDate = d.toISOString();
      } else if (/days?\s*ago/i.test(m[0])) {
        const d = new Date(); d.setDate(d.getDate() - parseInt(m[1]));
        result.postDate = d.toISOString();
      } else if (/weeks?\s*ago/i.test(m[0])) {
        const d = new Date(); d.setDate(d.getDate() - parseInt(m[1]) * 7);
        result.postDate = d.toISOString();
      } else {
        try {
          const d = new Date(m[1]);
          if (!isNaN(d.getTime())) result.postDate = d.toISOString();
        } catch { /* skip */ }
      }
      break;
    }
  }

  // --- Extract sample comments (lines starting with @username or short conversational lines) ---
  const commentLines = text.split("\n")
    .filter(l => /^@\w/.test(l.trim()) || (/^\w/.test(l.trim()) && l.trim().length < 150 && l.trim().length > 5))
    .slice(0, 5);
  result.sampleComments = commentLines.map(l => l.trim());

  return result;
}

// ========== LIGHTWEIGHT HEURISTIC SIGNALS (NO AI) ==========

function computeHeuristics(caption: string, hashtags: string, markdown: string): {
  hookStyleHint: string;
  textHookInCaption: boolean;
  estimatedTopicPopularity: string;
  captionLength: string;
  hashtagCount: number;
  hasCTA: boolean;
  hasEmoji: boolean;
  hasQuestion: boolean;
  languageHint: string;
} {
  const captionLower = caption.toLowerCase();
  const fullText = `${caption} ${hashtags}`.toLowerCase();

  // Hook style detection from caption
  let hookStyleHint = "unknown";
  if (/^(did you know|kya aapko pata|क्या आपको|have you ever|what if)/i.test(caption)) hookStyleHint = "question";
  else if (/^(shocking|unbelievable|you won't believe|😱|🤯)/i.test(caption)) hookStyleHint = "shock";
  else if (/^(story|let me tell|ek kahani|एक कहानी|once upon)/i.test(caption)) hookStyleHint = "storytelling";
  else if (/^(watch|look at|see this|dekho|देखो)/i.test(caption)) hookStyleHint = "visual";
  else if (/\d+%|\d+x|\d+ out of|\d+ million/i.test(caption.substring(0, 80))) hookStyleHint = "statistic";

  // Text hook presence
  const textHookInCaption = /^[A-Z🔥⚡💥😱🤯❗️].{5,60}[.!?…]/.test(caption.trim());

  // Topic popularity estimation
  const trendingKeywords = ["trend", "viral", "challenge", "grwm", "transformation", "recipe", "hack", "diy", "motivation", "gym", "fitness", "dance", "fashion", "festival", "wedding", "cricket", "ipl", "bollywood"];
  const matchedTrending = trendingKeywords.filter(k => fullText.includes(k));
  const estimatedTopicPopularity = matchedTrending.length >= 3 ? "high" : matchedTrending.length >= 1 ? "medium" : "low";

  // Caption length assessment
  const captionLen = caption.length;
  const captionLength = captionLen === 0 ? "missing" : captionLen < 30 ? "very_short" : captionLen < 100 ? "short" : captionLen < 300 ? "optimal" : "long";

  // Hashtag count
  const hashtagCount = (hashtags.match(/#/g) || []).length;

  // CTA detection
  const hasCTA = /follow|like|share|comment|save|subscribe|link in bio|swipe|tap|click|tag/i.test(captionLower);

  // Emoji presence
  const hasEmoji = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2702}-\u{27B0}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}]/u.test(caption);

  // Question in caption
  const hasQuestion = /\?|kya|क्या|kaise|कैसे|kyun|क्यों/.test(captionLower);

  // Language hint
  const languageHint = /[\u0900-\u097F]/.test(caption) ? "hindi" : /[a-zA-Z]/.test(caption) ? "english" : "unknown";

  return { hookStyleHint, textHookInCaption, estimatedTopicPopularity, captionLength, hashtagCount, hasCTA, hasEmoji, hasQuestion, languageHint };
}

// ========== SCRAPING FUNCTIONS ==========

async function scrapeMetaTags(url: string): Promise<{
  ogImage: string; ogDescription: string; ogTitle: string; authorName: string;
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

    if (!response.ok) return null;

    const html = await response.text();
    const getMetaContent = (property: string): string => {
      const regex = new RegExp(`<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']*)["']`, "i");
      const regex2 = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${property}["']`, "i");
      return regex.exec(html)?.[1] || regex2.exec(html)?.[1] || "";
    };

    const ogImage = getMetaContent("og:image");
    const ogDescription = getMetaContent("og:description");
    const ogTitle = getMetaContent("og:title");

    let authorName = "";
    const authorMatch = ogTitle.match(/^(.+?)\s+on\s+Instagram/i);
    if (authorMatch) authorName = authorMatch[1];
    if (!authorName) {
      const descAuthor = ogDescription.match(/^(\d[\d,.KMBkmb]*)\s+likes?,\s+\d+\s+comments?\s+-\s+(.+?)\s+\(/i);
      if (descAuthor) authorName = descAuthor[2];
    }

    if (!ogImage && !ogDescription) return null;
    return { ogImage, ogDescription, ogTitle, authorName };
  } catch (e) {
    console.error("Direct meta scrape error:", e);
    return null;
  }
}

async function scrapeReelWithFirecrawl(url: string): Promise<{ screenshot: string; markdown: string } | null> {
  const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
  if (!apiKey) return null;

  try {
    console.log("Scraping reel with Firecrawl:", url);
    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url, formats: ["screenshot", "markdown"], waitFor: 5000 }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return {
      screenshot: data.data?.screenshot || data.screenshot || "",
      markdown: data.data?.markdown || data.markdown || "",
    };
  } catch (e) {
    console.error("Firecrawl scrape error:", e);
    return null;
  }
}

// ========== PATTERN DB FUNCTIONS ==========

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
    if (error) { console.error("Error fetching patterns:", error); return []; }
    return data || [];
  } catch (e) { console.error("Pattern fetch error:", e); return []; }
}

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
  } catch (e) { console.error("Pattern store error:", e); }
}

function compareWithPatterns(analysis: any, patterns: any[]): any {
  if (patterns.length === 0) {
    return {
      patternsCompared: 0, similarityScore: null, categoryAvgScore: null,
      insights: ["No viral patterns in database yet for this category. Your analysis will help build the pattern database!"],
      topPatternFeatures: null,
    };
  }

  const scores = patterns.map(p => p.viral_score).filter(Boolean);
  const categoryAvg = scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0;

  let matchCount = 0, totalChecks = 0;
  const currentHookType = analysis.hookAnalysis?.openingType?.toLowerCase();
  const currentCategory = analysis.contentClassification?.primaryCategory?.toLowerCase();
  const currentFace = analysis.videoSignals?.facePresenceLikely?.toLowerCase();
  const currentMotion = analysis.videoSignals?.motionIntensity?.toLowerCase();
  const currentSceneCuts = analysis.videoSignals?.estimatedSceneCuts?.toLowerCase();

  const viralPatterns = patterns.filter(p => (p.viral_score || 0) >= 70);

  for (const p of viralPatterns) {
    if (p.hook_type) { totalChecks++; if (p.hook_type.toLowerCase() === currentHookType) matchCount++; }
    if (p.face_presence) { totalChecks++; if (p.face_presence.toLowerCase().includes(currentFace?.split("/")[0] || "")) matchCount++; }
    if (p.motion_intensity) { totalChecks++; if (p.motion_intensity.toLowerCase() === currentMotion) matchCount++; }
    if (p.scene_cuts) { totalChecks++; if (p.scene_cuts.toLowerCase() === currentSceneCuts) matchCount++; }
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

  if (currentScore > categoryAvg) insights.push(`Your reel scores ${currentScore - categoryAvg} points above the category average (${categoryAvg})`);
  else if (currentScore < categoryAvg) insights.push(`Your reel scores ${categoryAvg - currentScore} points below the category average (${categoryAvg})`);
  else insights.push(`Your reel matches the category average score of ${categoryAvg}`);

  if (similarityScore >= 70) insights.push(`High similarity (${similarityScore}%) with proven viral patterns in ${currentCategory}`);
  else if (similarityScore >= 40) insights.push(`Moderate similarity (${similarityScore}%) with viral patterns — some features align`);
  else insights.push(`Low similarity (${similarityScore}%) with known viral patterns — unique approach detected`);

  if (topHook) insights.push(`Most viral hook type in ${currentCategory}: "${topHook[0]}" (${Math.round((topHook[1] / viralPatterns.length) * 100)}% of viral reels)`);
  if (topFace) insights.push(`Face presence in viral reels: "${topFace[0]}" is most common`);
  if (topMotion) insights.push(`Dominant motion style: "${topMotion[0]}" among top performers`);

  const avgHookScore = Math.round(viralPatterns.reduce((s, p) => s + (p.hook_score || 0), 0) / Math.max(viralPatterns.length, 1));
  const avgCaptionScore = Math.round(viralPatterns.reduce((s, p) => s + (p.caption_score || 0), 0) / Math.max(viralPatterns.length, 1));

  return {
    patternsCompared: patterns.length, viralPatternsCount: viralPatterns.length,
    similarityScore, categoryAvgScore: categoryAvg,
    categoryAvgHookScore: avgHookScore, categoryAvgCaptionScore: avgCaptionScore,
    insights,
    topPatternFeatures: { hookType: topHook?.[0] || null, facePresence: topFace?.[0] || null, motionIntensity: topMotion?.[0] || null },
  };
}

// ========== MAIN HANDLER ==========

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { url, lang = "en", caption: userCaption, hashtags: userHashtags, metrics: userMetrics, sampleComments: userComments } = await req.json();
    const respondInHindi = lang === "hi";

    if (!url) {
      return new Response(JSON.stringify({ success: false, error: "URL is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKeys = getApiKeys();
    if (apiKeys.length === 0) throw new Error("No GEMINI_API_KEY or GEMINI_API_KEYS configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    // Log usage
    try {
      const supabaseForLog = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
      await supabaseForLog.from("usage_logs").insert({ reel_url: url, user_agent: req.headers.get("user-agent") || null });
    } catch (e) { console.error("Usage log error:", e); }

    // ==============================
    // STEP 1: Scrape reel page (parallel meta + Firecrawl)
    // ==============================
    console.log("STEP 1: Scraping reel page...");
    const [metaResult, scrapeResult] = await Promise.all([
      scrapeMetaTags(url),
      scrapeReelWithFirecrawl(url),
    ]);

    // ==============================
    // STEP 2: Parse with regex/parser (NO AI)
    // ==============================
    console.log("STEP 2: Regex-based extraction...");

    let caption = userCaption || "";
    let hashtags = userHashtags || "";
    let metrics: any = userMetrics || {};
    let sampleComments = userComments || "";
    let authorName = "";
    let thumbnailUrl = "";
    let screenshotUrl = "";
    let postDate: string | null = null;

    const userProvidedMetrics = userMetrics && Object.values(userMetrics).some((v: any) => v !== undefined && v !== null);

    // Layer 1: Meta tags
    if (metaResult) {
      if (!caption && metaResult.ogDescription) {
        const descMatch = metaResult.ogDescription.match(/on Instagram:\s*["""]?(.*)/is);
        if (descMatch) caption = descMatch[1].replace(/["""]$/, "").trim();
        else caption = metaResult.ogDescription;
      }
      if (!authorName && metaResult.authorName) authorName = metaResult.authorName;
      if (metaResult.ogImage) thumbnailUrl = metaResult.ogImage;

      // Extract metrics from og:description with regex
      if (!userProvidedMetrics && metaResult.ogDescription) {
        const likesMatch = metaResult.ogDescription.match(/([\d,.\w]+)\s+likes?/i);
        const commentsMatch = metaResult.ogDescription.match(/([\d,.\w]+)\s+comments?/i);
        if (likesMatch) metrics.likes = metrics.likes || parseNumberString(likesMatch[1]);
        if (commentsMatch) metrics.comments = metrics.comments || parseNumberString(commentsMatch[1]);
      }
    }

    // Layer 2: Firecrawl markdown — regex extraction (NO AI call)
    if (scrapeResult?.markdown) {
      console.log("Parsing Firecrawl markdown with regex...");
      const extracted = extractDataFromMarkdown(scrapeResult.markdown);

      if (!caption && extracted.caption) caption = extracted.caption;
      if (!hashtags && extracted.hashtags) hashtags = extracted.hashtags;
      if (!authorName && extracted.authorName) authorName = extracted.authorName;
      if (!sampleComments && extracted.sampleComments.length > 0) sampleComments = extracted.sampleComments.join("\n");
      if (extracted.postDate) postDate = extracted.postDate;
      if (!userProvidedMetrics && (!metrics.likes && !metrics.comments)) {
        metrics = {
          likes: extracted.likes,
          comments: extracted.comments,
          views: extracted.views,
          shares: extracted.shares,
          saves: extracted.saves,
        };
      }

      // Capture screenshot URL for vision in the single AI call
      if (scrapeResult.screenshot) {
        screenshotUrl = scrapeResult.screenshot.startsWith("data:")
          ? scrapeResult.screenshot
          : `data:image/png;base64,${scrapeResult.screenshot}`;
      }
    }

    // Layer 3: oEmbed fallback
    let metadata = "";
    if (!thumbnailUrl || !authorName) {
      try {
        const oembedResp = await fetch(`https://api.instagram.com/oembed?url=${encodeURIComponent(url)}`);
        if (oembedResp.ok) {
          const oembed = await oembedResp.json();
          metadata = `Title: ${oembed.title || "N/A"}\nAuthor: ${oembed.author_name || "N/A"}`;
          if (!thumbnailUrl) thumbnailUrl = oembed.thumbnail_url || "";
          if (!authorName) authorName = oembed.author_name || "";
          if (!caption && oembed.title) caption = oembed.title;
        }
      } catch { console.log("oEmbed fetch failed"); }
    }

    // Layer 4: noembed fallback
    if (!thumbnailUrl) {
      try {
        const noembedResp = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
        if (noembedResp.ok) {
          const noembed = await noembedResp.json();
          if (noembed.thumbnail_url) thumbnailUrl = noembed.thumbnail_url;
          if (!authorName && noembed.author_name) authorName = noembed.author_name;
          if (!caption && noembed.title) caption = noembed.title;
        }
      } catch { console.log("noembed fetch failed"); }
    }

    if (!metadata && authorName) metadata = `Author: ${authorName}`;

    // ==============================
    // STEP 3: Prepare structured input + heuristics
    // ==============================
    console.log("STEP 3: Computing heuristics...");
    const heuristics = computeHeuristics(caption, hashtags, scrapeResult?.markdown || "");

    // Extract hashtags from caption if not already found
    if (!hashtags && caption) {
      const captionHashtags = caption.match(/#[\w\u0900-\u097F]+/g);
      if (captionHashtags) hashtags = [...new Set(captionHashtags)].join(" ");
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
    if (sampleComments) commentsSection = `\nSample Comments (auto-extracted):\n${sampleComments}`;

    const heuristicsSection = `
=== PRE-COMPUTED HEURISTIC SIGNALS (use these as inputs) ===
Hook Style Hint (from caption text): ${heuristics.hookStyleHint}
Text Hook Present in Caption: ${heuristics.textHookInCaption}
Estimated Topic Popularity: ${heuristics.estimatedTopicPopularity}
Caption Length: ${heuristics.captionLength} (${caption.length} chars)
Hashtag Count: ${heuristics.hashtagCount}
CTA Detected: ${heuristics.hasCTA}
Emoji Present: ${heuristics.hasEmoji}
Question in Caption: ${heuristics.hasQuestion}
Language: ${heuristics.languageHint}
`;

    // ==============================
    // STEP 4: SINGLE AI CALL — full analysis + visual understanding
    // ==============================
    console.log("STEP 4: Single AI analysis call...");

    // Determine image source for vision (prefer screenshot > thumbnail)
    const imageForVision = screenshotUrl || thumbnailUrl;
    const isScreenshot = !!screenshotUrl;

    const langInstruction = respondInHindi
      ? "\n\nCRITICAL: Write ALL text values in Hindi. Keep JSON keys in English."
      : "";

    const prompt = `You are a world-class Instagram viral content analyst. Perform an extremely detailed analysis of this Reel.

=== INPUT DATA ===
Reel URL: ${url}
${metadata ? `Metadata:\n${metadata}` : ""}
${caption ? `Caption: ${caption}` : "No caption available"}
${hashtags ? `Hashtags: ${hashtags}` : "No hashtags detected"}${metricsSection}${commentsSection}
${heuristicsSection}

=== ANALYSIS INSTRUCTIONS ===

${imageForVision ? `IMPORTANT: You have been provided ${isScreenshot ? "a full page screenshot of the Instagram reel page (includes UI with metrics)" : "the reel's thumbnail image"}. Use this as a PRIMARY visual signal to understand what the reel is actually about. Extract any visible text, objects, people, and setting from the image.` : "No visual content available — analyze based on caption, hashtags, and metrics only."}

${isScreenshot ? `CRITICAL: If you can see engagement metrics (likes, comments, views) in the screenshot that differ from the extracted data above, use the SCREENSHOT values as they are more reliable.` : ""}

IMPORTANT SCORING RULES:
- ALL individual scores (hook, caption, hashtag, engagement, trend, video quality, audio quality) must be between 1-8. NEVER give any score above 8 out of 10.
- The overall viralScore must be between 5-80. NEVER give viralScore above 80.
- Be realistic and critical in scoring. 7-8 = EXCEPTIONALLY good. 5-6 = GOOD. 3-4 = AVERAGE. 1-2 = POOR.

HOOK TYPE CLASSIFICATION (classify into exactly one):
- "question" — opens with a question or curiosity gap
- "shock" — opens with a surprising/unbelievable claim
- "storytelling" — opens with a narrative or personal story
- "visual" — opens with a striking visual or action
- "statistic" — opens with a number, data, or percentage

VIRALITY FACTOR DETECTION (safe, reliable checks only):
- "recognizablePerson": true/false — is a well-known/recognizable person visible?
- "strongFacialExpression": true/false — does the person show a strong/dramatic facial expression?
- "strongVisualSubject": true/false — is there a visually compelling subject (luxury item, dramatic scene, beautiful location, etc.)?
- "famousPlaceOrObject": true/false — is a famous/iconic place or object shown?
- "deepVoiceLikely": true/false — does the content likely feature a deep/bass voice narration?
- "trendingTopicRelevance": "high/medium/low/none"
- "famousIncident": true/false — does this relate to a famous or newsworthy incident?

CONTENT VIRALITY FACTORS:
- Entertainment, music, GRWM, cars, bikes, fashion, dance categories have HIGHER viral potential.
- Educational, learning, tutorial content has LOWER viral potential on Instagram.
- If a RECOGNIZABLE PERSON (celebrity, influencer, public figure) is detected, increase viral potential significantly.
- If a FAMOUS PLACE (landmark, tourist spot) or FAMOUS OBJECT (luxury car, designer item) is shown, increase viral potential.
- If content relates to TRENDING NEWS or FAMOUS INCIDENT, increase viral potential.

Perform ALL of these analyses in this single response:

1. CONTENT CLASSIFICATION
2. HOOK ANALYSIS (opening type must be one of: question/shock/storytelling/visual/statistic)
3. CAPTION ANALYSIS
4. HASHTAG ANALYSIS
5. VIDEO SIGNALS (from visual analysis)
6. VIDEO QUALITY ASSESSMENT
7. AUDIO QUALITY ASSESSMENT
8. TREND MATCHING
9. ENGAGEMENT ANALYSIS${hasMetrics ? " with metrics comparison" : ""}
${sampleComments ? "10. COMMENT SENTIMENT" : ""}
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
      "estimatedTopic": "<main topic>"
    },
    "confidence": "<high/medium/low>",
    "reasoning": "<1-2 sentence explanation>",
    "hashtagAlignment": "<yes/partially/no + explanation>"
  },

  "viralityFactors": {
    "recognizablePerson": false,
    "strongFacialExpression": false,
    "strongVisualSubject": false,
    "famousPlaceOrObject": false,
    "deepVoiceLikely": false,
    "trendingTopicRelevance": "none",
    "famousIncident": false
  },

  "hookAnalysis": {
    "score": <1-8>,
    "firstThreeSeconds": "<what likely happens>",
    "openingType": "<question/shock/storytelling/visual/statistic>",
    "attentionGrabber": "<main attention element>",
    "details": ["<insight 1>", "<insight 2>", "<insight 3>"]
  },

  "captionAnalysis": {
    "score": <1-8>,
    "curiosityLevel": <1-10>,
    "emotionalTriggers": ["<trigger1>", "<trigger2>"],
    "callToAction": "<description or 'None detected'>",
    "keywordDensity": "<assessment>",
    "lengthEffectiveness": "<assessment>",
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
    "hookPattern": "<matched pattern>",
    "trendingStructure": "<structure type>",
    "matchedTrends": ["<trend1>", "<trend2>"],
    "details": ["<insight 1>", "<insight 2>", "<insight 3>"]
  },

  "engagementScore": <1-8>,
  "engagementDetails": ["<insight 1>", "<insight 2>", "<insight 3>"],
  "engagementRate": "<estimated rate>"${hasMetrics ? `,

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

  "topRecommendations": ["<rec 1>", "<rec 2>", "<rec 3>", "<rec 4>", "<rec 5>"]
}`;

    // Build message content — include image inline if available
    const userContent: any[] = [{ type: "text", text: prompt }];
    if (imageForVision) {
      userContent.push({ type: "image_url", image_url: { url: imageForVision } });
    }

    const response = await callGemini({
      model: "gemini-2.5-flash",
      messages: [
        { role: "system", content: "You are an expert Instagram viral content analyst with deep knowledge of trends, algorithms, and engagement patterns. You can analyze visual content from screenshots and thumbnails. Return only valid JSON. Be specific and actionable." },
        { role: "user", content: userContent },
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
      if (cc.confidence === "high") reasons.push(`Content identified as ${cc.primaryCategory} (${cc.subCategory}) with high confidence`);
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

    // === VIRALITY INSIGHTS ===
    const viralityInsights: { factor: string; detected: boolean; impact: string; score: number; reason: string; solution: string }[] = [];

    // === QUALITY BONUS/PENALTY ===
    let qualityBonus = 0;
    const vq = analysis.videoQuality;
    if (vq) {
      const vqScore = vq.qualityScore ?? 5;
      if (vqScore >= 7) {
        qualityBonus += 5;
        reasons.push("High video quality boosts viewer retention");
        viralityInsights.push({ factor: "Video Quality", detected: true, impact: "positive", score: 5, reason: "High quality video keeps viewers watching longer", solution: "Maintain this quality. Use natural light or ring light." });
      } else if (vqScore >= 5) {
        qualityBonus += 2;
      } else {
        qualityBonus -= 5;
        reasons.push("Low video quality may reduce viewer retention");
        viralityInsights.push({ factor: "Video Quality", detected: true, impact: "negative", score: -5, reason: "Low quality footage causes viewers to scroll away", solution: "Record in HD (1080p), use stable mounting, ensure proper lighting." });
      }
    }
    const aq = analysis.audioQuality;
    if (aq) {
      const aqScore = aq.qualityScore ?? 5;
      if (aqScore >= 7) { qualityBonus += 4; reasons.push("Clean audio quality enhances engagement"); }
      else if (aqScore >= 5) { qualityBonus += 2; }
      else { qualityBonus -= 5; reasons.push("Poor audio quality may cause viewers to skip"); }
    }
    qualityBonus = Math.max(-10, Math.min(10, qualityBonus));

    // === CONTENT CATEGORY BONUS ===
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
        viralityInsights.push({ factor: "Content Category", detected: true, impact: "positive", score: 5, reason: `${cc.primaryCategory} is viral-friendly on Instagram`, solution: "Keep creating in this niche with trending formats." });
      } else if (lowViralCategories.includes(catLower) || lowViralCategories.includes(contentTypeLower)) {
        categoryBonus -= 4;
        reasons.push("Educational content has lower viral potential on Instagram");
        viralityInsights.push({ factor: "Content Category", detected: true, impact: "negative", score: -4, reason: "Educational content gets less shares on Instagram", solution: "Make it entertaining — use humor, storytelling, quick cuts, trending audio." });
      }
      if (cc.hashtagAlignment?.toLowerCase().startsWith("yes")) categoryBonus += 2;
      else if (cc.hashtagAlignment?.toLowerCase().startsWith("no")) {
        categoryBonus -= 3;
        reasons.push("Hashtags don't match actual content");
        viralityInsights.push({ factor: "Hashtag-Content Mismatch", detected: true, impact: "negative", score: -3, reason: "Unrelated hashtags confuse the algorithm", solution: "Use hashtags that match your video content directly." });
      }
    }
    categoryBonus = Math.max(-7, Math.min(7, categoryBonus));

    // === VIRALITY FACTORS BONUS (updated: no "attractivePresenter") ===
    let viralityFactorsBonus = 0;
    const vf = analysis.viralityFactors;
    if (vf) {
      if (vf.recognizablePerson) {
        viralityFactorsBonus += 8;
        reasons.push("Recognizable person detected — significantly increases viral potential");
        viralityInsights.push({ factor: "Recognizable Person", detected: true, impact: "positive", score: 8, reason: "Content featuring recognizable personalities gets 3-5x more shares", solution: "Tag the person, use their trending hashtags." });
      }
      if (vf.strongFacialExpression) {
        viralityFactorsBonus += 2;
        viralityInsights.push({ factor: "Strong Facial Expression", detected: true, impact: "positive", score: 2, reason: "Dramatic facial expressions create emotional connection and stop the scroll", solution: "Use expressive reactions — surprise, excitement, shock — in opening frames." });
      }
      if (vf.strongVisualSubject) {
        viralityFactorsBonus += 3;
        viralityInsights.push({ factor: "Strong Visual Subject", detected: true, impact: "positive", score: 3, reason: "Visually compelling subjects hold attention and increase saves/shares", solution: "Lead with the most visually striking element in the first frame." });
      }
      if (vf.famousPlaceOrObject) {
        viralityFactorsBonus += 5;
        reasons.push("Famous place/object detected — increases viewer interest");
        viralityInsights.push({ factor: "Famous Place/Object", detected: true, impact: "positive", score: 5, reason: "Iconic locations and objects create aspirational content", solution: "Use location tags and location-specific hashtags." });
      }
      if (vf.deepVoiceLikely) {
        viralityFactorsBonus += 3;
        reasons.push("Deep/bass voice narration enhances engagement");
      }
      if (vf.famousIncident) {
        viralityFactorsBonus += 6;
        reasons.push("Content relates to a trending incident — high share potential");
        viralityInsights.push({ factor: "Trending Incident", detected: true, impact: "positive", score: 6, reason: "Trending news drives massive search traffic and shares", solution: "Post as quickly as possible. First-mover advantage is key." });
      }
      const trendRelevance = vf.trendingTopicRelevance?.toLowerCase();
      if (trendRelevance === "high") {
        viralityFactorsBonus += 7;
        reasons.push("Highly relevant to current trending topics");
        viralityInsights.push({ factor: "Trending Topic", detected: true, impact: "positive", score: 7, reason: "Trending content gets algorithmic boost to Explore page", solution: "Ride this trend with multiple variations quickly." });
      } else if (trendRelevance === "medium") {
        viralityFactorsBonus += 4;
        reasons.push("Moderately relevant to trending topics");
      }
    }

    // Additional content signals from video signals
    const vs = analysis.videoSignals;
    if (vs) {
      if (vs.facePresenceLikely?.toLowerCase().includes("yes")) {
        viralityFactorsBonus += 2;
        viralityInsights.push({ factor: "Face in Thumbnail", detected: true, impact: "positive", score: 2, reason: "Reels with faces get 38% more clicks", solution: "Show your face clearly in the first frame." });
      }
      if (vs.textOverlayLikely?.toLowerCase().includes("yes")) {
        viralityFactorsBonus += 2;
        viralityInsights.push({ factor: "Text Overlay", detected: true, impact: "positive", score: 2, reason: "On-screen text stops the scroll", solution: "Keep text hooks 5-7 words max with bold fonts." });
      }
      if (vs.motionIntensity?.toLowerCase() === "high") {
        viralityFactorsBonus += 2;
      } else if (vs.motionIntensity?.toLowerCase() === "low") {
        viralityInsights.push({ factor: "Low Motion", detected: true, impact: "negative", score: -1, reason: "Static content has higher drop-off", solution: "Add camera movement, zoom transitions, or text animations." });
      }
    }

    if (aq?.musicUsage?.toLowerCase() === "trending") {
      viralityFactorsBonus += 3;
      reasons.push("Trending background music boosts reach");
      viralityInsights.push({ factor: "Trending Music", detected: true, impact: "positive", score: 3, reason: "Instagram algorithm promotes trending audio content 2-3x", solution: "Use audio within first 48 hours of it trending." });
    }

    // Humor/memes/pets detection
    if (cc) {
      const catLower = cc.primaryCategory?.toLowerCase() || "";
      const subCatLower = cc.subCategory?.toLowerCase() || "";
      const topicLower = cc.detectedElements?.estimatedTopic?.toLowerCase() || "";

      if (catLower.includes("meme") || subCatLower.includes("meme") || subCatLower.includes("humor") || topicLower.includes("funny")) {
        viralityFactorsBonus += 3;
      }
      if (topicLower.includes("pet") || topicLower.includes("dog") || topicLower.includes("cat") || topicLower.includes("animal")) {
        viralityFactorsBonus += 3;
      }
      if (topicLower.includes("challenge") || topicLower.includes("trend") || topicLower.includes("festival")) {
        viralityFactorsBonus += 3;
      }
    }

    viralityFactorsBonus = Math.max(0, Math.min(18, viralityFactorsBonus));

    // === AGE PENALTY ===
    let agePenalty = 0;
    let resolvedPostDate: Date | null = null;
    let daysSincePost: number | null = null;

    // Use regex-extracted postDate or AI's _postDate
    const dateStr = postDate || analysis._postDate;
    if (dateStr) {
      const pd = new Date(dateStr);
      if (!isNaN(pd.getTime())) resolvedPostDate = pd;
    }

    if (resolvedPostDate) {
      const now = new Date();
      daysSincePost = (now.getTime() - resolvedPostDate.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSincePost <= 2) {
        agePenalty = 0;
        viralityInsights.push({ factor: "Reel Age (Fresh)", detected: true, impact: "positive", score: 0, reason: "Reel is fresh (0-2 days) — peak viral window", solution: "Maximize engagement NOW. Reply to every comment, share to stories." });
      } else if (daysSincePost <= 5) {
        agePenalty = -Math.round((daysSincePost - 2) * 2);
        reasons.push(`Reel is ${Math.round(daysSincePost)} days old — viral window narrowing`);
      } else if (daysSincePost <= 7) {
        agePenalty = -Math.round(6 + (daysSincePost - 5) * 2);
        reasons.push(`Reel is ${Math.round(daysSincePost)} days old — viral potential declining`);
      } else if (daysSincePost <= 15) {
        agePenalty = -Math.round(10 + (daysSincePost - 7) * 1.5);
        reasons.push(`Reel is ${Math.round(daysSincePost)} days old — viral chance very low`);
      } else {
        agePenalty = -Math.round(Math.min(25, 22 + (daysSincePost - 15) * 0.3));
        reasons.push(`Reel is ${Math.round(daysSincePost)}+ days old — viral window passed`);
      }
    }

    if (daysSincePost !== null && daysSincePost > 7 && hasMetrics && !isAlreadyViral && !isGrowing) {
      agePenalty -= 5;
    }

    // === PATTERN MATCHING ===
    let patternBonus = 0;
    let patternComparison = null;

    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const category = cc?.primaryCategory?.toLowerCase() || "other";
      const patterns = await fetchViralPatterns(category, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      patternComparison = compareWithPatterns(analysis, patterns);

      if (patternComparison.similarityScore !== null) {
        if (patternComparison.similarityScore >= 70) { patternBonus = 8; reasons.push(`High match (${patternComparison.similarityScore}%) with proven viral patterns`); }
        else if (patternComparison.similarityScore >= 40) { patternBonus = 4; reasons.push(`Moderate match (${patternComparison.similarityScore}%) with viral patterns`); }
        else { patternBonus = -3; }
      }
    }
    patternBonus = Math.max(-8, Math.min(8, patternBonus));

    // Hook insights
    const hookScore = analysis.hookAnalysis?.score ?? 5;
    if (hookScore >= 7) {
      viralityInsights.push({ factor: "Strong Hook", detected: true, impact: "positive", score: 3, reason: "Powerful opening stops the scroll", solution: "Keep using strong hooks. Test question, shock, and visual types." });
    } else if (hookScore <= 3) {
      viralityInsights.push({ factor: "Weak Hook", detected: true, impact: "negative", score: -2, reason: "Weak opening causes 60-70% drop in first 2 seconds", solution: "Start with bold text, surprising visual, or provocative question." });
    }

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

    viralScore = Math.min(80, viralScore);

    analysis.viralClassification = {
      status: viralStatus,
      score: viralScore,
      label: viralLabel,
      reasons: reasons.slice(0, 10),
      engagementRate: hasMetrics && viewsVal > 0 ? engRate : undefined,
    };

    analysis.thumbnailAnalyzed = !!imageForVision;
    analysis.patternComparison = patternComparison;

    // Store pattern + log in background
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      storePattern(analysis, url, metrics, caption || "", hashtags || "", SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        .catch(e => console.error("Background pattern store failed:", e));

      const logSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      logSupabase.from("api_usage_logs").insert({
        function_name: "analyze-reel",
        ai_model: "gemini-2.5-flash",
        ai_provider: "google",
        is_ai_call: true,
        estimated_cost: 0.002,
        tokens_used: 3000,
        status_code: 200,
        duration_ms: 0,
      }).then(() => {}).catch(e => console.error("Usage log failed:", e));
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
