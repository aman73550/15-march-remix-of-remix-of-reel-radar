import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

// DB-first multi-key rotation: reads from site_config table, falls back to env vars
let _cachedDbKeys: string[] | null = null;
let _cacheTs = 0;

async function getApiKeysFromDb(supabase: any): Promise<string[]> {
  if (_cachedDbKeys && Date.now() - _cacheTs < 60000) return _cachedDbKeys;
  try {
    const { data } = await supabase
      .from("site_config")
      .select("config_key, config_value")
      .eq("config_key", "gemini_api_keys");
    if (data) {
      for (const row of data) {
        if (row.config_value) {
          const keys = row.config_value.split(",").map((k: string) => k.trim()).filter(Boolean);
          if (keys.length > 0) {
            _cachedDbKeys = keys;
            _cacheTs = Date.now();
            console.log(`Loaded ${keys.length} Gemini keys from DB`);
            return keys;
          }
        }
      }
    }
  } catch (e) {
    console.warn("Failed to load keys from DB:", e);
  }
  return getApiKeysFromEnv();
}

function getApiKeysFromEnv(): string[] {
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

async function callGemini(body: Record<string, unknown>, supabase?: any): Promise<Response> {
  const keys = supabase ? await getApiKeysFromDb(supabase) : getApiKeysFromEnv();
  if (keys.length === 0) throw new Error("No Gemini API keys configured. Add keys in Admin Panel → API Keys Manager.");

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

async function generatePremiumAnalysis(analysis: any, reelUrl: string, supabase?: any): Promise<any> {
  const viralityInsights = analysis._viralityInsights || [];
  const daysSincePost = analysis._daysSincePost || null;
  const viralScore = analysis.viralClassification?.score || analysis.viralScore || 0;
  const category = analysis.contentClassification?.primaryCategory || "unknown";

  const response = await callGemini({
    model: "gemini-2.5-flash",
    messages: [
      {
        role: "system",
        content: `You are an expert Instagram growth strategist creating a PREMIUM, highly detailed PDF report. This is a PAID product — make it thorough, insightful, and actionable. Write in a professional but friendly tone. Include specific examples, real-world references, and data-backed insights. Return ONLY valid JSON, no markdown fences.`,
      },
      {
        role: "user",
        content: `Based on this reel analysis, generate an extremely comprehensive Master Report.

Current Analysis Data:
${JSON.stringify(analysis, null, 2)}

Reel URL: ${reelUrl}
Category: ${category}
Viral Score: ${viralScore}/80
Days Since Post: ${daysSincePost ?? "unknown"}

Generate ONLY valid JSON with ALL these sections:

{
  "reportIntro": {
    "title": "Viral Prediction Framework Report",
    "whatIsThis": "<2-3 sentences explaining what this viral prediction framework is and how to use this report to improve content>",
    "disclaimer": "This report provides a realistic viral probability estimate based on AI analysis of 20+ content signals. No tool can guarantee 100% virality — Instagram's algorithm considers hundreds of factors including timing, audience behavior, and platform trends. Use this as a data-driven guide, not a guarantee.",
    "baselineExplanation": "<2-3 sentences explaining that every reel starts with a neutral baseline score, and various factors (category, quality, timing, trending elements) adjust this score up or down. Explain that the maximum score is 80/80 because nothing is 100% guaranteed to go viral.>"
  },

  "executiveSummary": "<5-6 sentence comprehensive summary covering: what the reel is about, its strengths, weaknesses, viral probability assessment, and the single most important thing to improve>",

  "categoryInfluence": {
    "explanation": "<2-3 sentences explaining how content category dramatically affects viral potential on Instagram>",
    "highViralCategories": [
      {"category": "Entertainment/Comedy", "viralChance": "Very High", "reason": "<why this goes viral>", "examples": "Skits, pranks, funny reactions"},
      {"category": "Music/Dance", "viralChance": "Very High", "reason": "<why>", "examples": "Dance challenges, lip sync, music covers"},
      {"category": "GRWM (Get Ready With Me)", "viralChance": "High", "reason": "<why>", "examples": "Morning routines, outfit reveals, makeup transformations"},
      {"category": "Cars/Bikes/Luxury", "viralChance": "High", "reason": "<why>", "examples": "Supercar reveals, bike stunts, luxury lifestyle"},
      {"category": "Fashion/Beauty", "viralChance": "High", "reason": "<why>", "examples": "Outfit transitions, beauty hacks, style tips"},
      {"category": "Motivation/Fitness", "viralChance": "Medium-High", "reason": "<why>", "examples": "Transformation videos, motivational speeches, gym clips"}
    ],
    "lowViralCategories": [
      {"category": "Educational/Tutorials", "viralChance": "Low-Medium", "reason": "<why educational content struggles on IG>", "examples": "History facts, science explanations, how-to guides"},
      {"category": "News/Analysis", "viralChance": "Low", "reason": "<why>", "examples": "News commentary, political analysis"}
    ],
    "yourCategory": "<assessment of this reel's category and its viral potential with specific advice>"
  },

  "reelAgeFactor": {
    "explanation": "<2-3 sentences about why fresh content has the highest viral chance>",
    "peakWindow": "The first 1-2 days after posting is the PEAK viral window. Instagram's algorithm tests new content with a small audience first — if engagement is strong, it pushes to more people. After 48 hours, this initial boost significantly decreases.",
    "decayData": [
      {"period": "0-2 days", "viralProbability": "100%", "description": "Peak window — algorithm actively testing and pushing your content"},
      {"period": "3-5 days", "viralProbability": "60-70%", "description": "Initial push declining — still possible if engagement is strong"},
      {"period": "6-7 days", "viralProbability": "30-40%", "description": "Significant drop — algorithm favoring newer content"},
      {"period": "8-15 days", "viralProbability": "10-20%", "description": "Very low chance — only exceptional content gets rediscovered"},
      {"period": "15-30 days", "viralProbability": "2-5%", "description": "Almost negligible — viral window has essentially closed"},
      {"period": "30+ days", "viralProbability": "<1%", "description": "Extremely rare — would need external trigger (celebrity share, news event)"}
    ],
    "yourReelAge": "<specific assessment of this reel's age and what it means for viral potential>"
  },

  "famousElementsAnalysis": {
    "explanation": "<2-3 sentences about why famous elements dramatically increase viral potential>",
    "celebrityImpact": {
      "description": "<explain how celebrities/famous people boost virality>",
      "examples": ["A reel featuring a celebrity cameo gets 3-5x more shares", "Reacting to a trending celebrity moment can ride their massive audience", "Even mentioning a celebrity in caption/hashtags increases discoverability"],
      "yourReel": "<whether this reel has celebrity/famous person elements and what to do>"
    },
    "landmarkImpact": {
      "description": "<explain how famous places/landmarks/objects boost engagement>",
      "examples": ["Eiffel Tower, Taj Mahal, Times Square backgrounds create instant aspirational content", "Luxury cars (Lamborghini, Ferrari) and designer items (Gucci, Louis Vuitton) trigger curiosity", "Iconic food locations and tourist spots get high saves and shares"],
      "yourReel": "<assessment for this reel>"
    },
    "trendingIncidents": {
      "description": "<explain how trending news/incidents create viral opportunities>",
      "howToIdentify": ["Check Twitter/X trending topics daily", "Monitor Instagram Explore page for emerging content patterns", "Follow news accounts and react quickly to breaking stories", "Watch for festival/sports event/award show moments"],
      "examples": ["Cricket World Cup moments → massive engagement in India", "Festival content (Diwali, Holi, Eid) → seasonal viral waves", "Viral challenges (Ice bucket, bottle cap) → riding global trends"],
      "yourReel": "<assessment for this reel>"
    }
  },

  "presenterAnalysis": {
    "explanation": "<explain how presenter appearance, charisma, and style affect engagement — be respectful and nuanced>",
    "factors": [
      {"factor": "Visual Appeal", "description": "<attractive, well-groomed presenters naturally hold attention longer — this includes body language, confidence, eye contact>"},
      {"factor": "Body Language & Charisma", "description": "<energetic, expressive presenters create emotional connection — hand gestures, facial expressions, body movement>"},
      {"factor": "Style & Grooming", "description": "<well-styled appearance (fashion, hair, makeup) creates aspirational content that viewers want to share>"},
      {"factor": "Fitness/Physique", "description": "<fitness content with bodybuilders or fit presenters gets high engagement due to aspirational/motivational appeal>"}
    ],
    "yourReel": "<respectful assessment of presenter impact in this reel>"
  },

  "audioVoiceAnalysis": {
    "explanation": "<explain how audio/voice quality impacts reel performance>",
    "voiceImpact": {
      "deepVoice": "Deep, authoritative voices create a sense of expertise and trust — viewers are more likely to watch till the end and follow for more",
      "uniqueVoice": "Unique or catchy voices become recognizable brand signatures — think of how some creators are known just by their voice",
      "voiceTrends": ["ASMR-style whispering for relaxation content", "Fast-paced energetic narration for educational content", "Deep bass voice for motivation/storytelling", "Funny voice effects for comedy"],
      "yourReel": "<assessment of voice/audio in this reel>"
    },
    "musicImpact": {
      "trendingAudio": "Using trending audio can 2-3x your reach because Instagram actively promotes content with popular sounds",
      "howToFind": ["Instagram Reels → scroll and save trending sounds", "Check the audio page to see how many reels use it", "Use Instagram's music search to find trending tracks", "Follow audio trend accounts on Instagram"],
      "yourReel": "<assessment of music usage in this reel>"
    }
  },

  "thumbnailHookAnalysis": {
    "whyFirst3SecondsMatter": "<detailed explanation of why the first 3 seconds determine if someone watches or scrolls — Instagram tracks 'watch through rate' and rewards high retention>",
    "thumbnailTips": [
      {"tip": "<specific tip about thumbnail composition>", "reason": "<why it works>"},
      {"tip": "<tip about colors/contrast>", "reason": "<why>"},
      {"tip": "<tip about face/emotion in thumbnail>", "reason": "<why>"},
      {"tip": "<tip about text overlay in thumbnail>", "reason": "<why>"}
    ],
    "hookTypes": [
      {"type": "Question Hook", "example": "'Did you know this about...?'", "effectiveness": "High — creates curiosity gap"},
      {"type": "Shock/Surprise Hook", "example": "'This changed everything...'", "effectiveness": "Very High — triggers emotional response"},
      {"type": "Visual Hook", "example": "Stunning visual or unexpected scene in first frame", "effectiveness": "High — stops the scroll instantly"},
      {"type": "Story Hook", "example": "'The day I lost everything...'", "effectiveness": "High — humans are hardwired for stories"},
      {"type": "Result-First Hook", "example": "Show the end result first, then the process", "effectiveness": "Very High — creates 'how did they do that' curiosity"}
    ],
    "yourReel": "<specific assessment of this reel's thumbnail and hook with improvement suggestions>"
  },

  "motionDynamicsAnalysis": {
    "explanation": "<explain why dynamic, high-motion content performs better on Reels>",
    "tips": [
      {"tip": "Use quick cuts (every 2-3 seconds)", "reason": "Prevents viewer boredom and maintains attention through novelty"},
      {"tip": "Add camera movement (pan, zoom, dolly)", "reason": "Static shots feel 'dead' — movement creates energy and engagement"},
      {"tip": "Include transitions between scenes", "reason": "Smooth transitions look professional and keep viewers watching"},
      {"tip": "Use speed ramps (slow-mo + fast forward)", "reason": "Creates dramatic emphasis and visual interest"},
      {"tip": "Add B-roll and cutaway shots", "reason": "Breaks monotony of single-angle footage"}
    ],
    "yourReel": "<assessment of motion/dynamics in this reel>"
  },

  "hashtagCaptionStrategy": {
    "hashtagTips": {
      "explanation": "<why hashtags matter for discoverability>",
      "strategy": [
        {"type": "Niche Hashtags (3-5)", "description": "<specific to your content category>", "examples": "<relevant examples>"},
        {"type": "Broad Hashtags (2-3)", "description": "<wider reach tags>", "examples": "<relevant examples>"},
        {"type": "Trending Hashtags (1-2)", "description": "<currently trending>", "examples": "<relevant examples>"}
      ],
      "howToResearch": ["Use Instagram search bar — type keywords and see suggested tags", "Check competitor posts for their hashtag strategy", "Use the 'Recent' tab to see if a hashtag is actively being used", "Avoid banned/spammy hashtags that can limit reach"],
      "microCaseStudy": "<brief example: 'A reel posted with trending #GRWM hashtag got 5x more reach than the same creator's previous reel without it'>"
    },
    "captionTips": {
      "explanation": "<why captions drive engagement — saves, shares, comments>",
      "bestPractices": ["Start with a hook line that creates curiosity", "Include a call-to-action (save this, share with friend, comment below)", "Use line breaks for readability", "Add relevant emojis to break up text", "End with a question to encourage comments"],
      "yourCaption": "<assessment of this reel's caption with specific rewrite suggestions>"
    }
  },

  "humorMemePetsFactor": {
    "explanation": "<explain why humor, memes, pets, and challenges consistently go viral>",
    "categories": [
      {"type": "Humor/Comedy", "viralReason": "Most shared content type — people tag friends", "tips": "Keep it relatable, use current meme formats, add your twist"},
      {"type": "Cute Animals/Pets", "viralReason": "Universally loved, high save rate", "tips": "Capture candid moments, add funny captions from pet's perspective"},
      {"type": "Challenges/Trends", "viralReason": "Rides massive organic wave", "tips": "Join within first 48-72 hours of trend, add your unique spin"},
      {"type": "Festival/Cultural Content", "viralReason": "Seasonal viral waves with massive search traffic", "tips": "Start 2-3 days before festival, use festival-specific hashtags"}
    ],
    "yourReel": "<assessment of whether this reel leverages any of these>"
  },

  "nicheViralityTable": {
    "explanation": "<explain that niche choice is a foundational decision that affects all future content>",
    "niches": [
      {"niche": "Comedy/Entertainment", "viralFriendliness": "⭐⭐⭐⭐⭐", "avgEngagement": "High", "bestFormat": "Skits, reactions, pranks", "trendExample": "POV videos, relatable situations"},
      {"niche": "Music/Dance", "viralFriendliness": "⭐⭐⭐⭐⭐", "avgEngagement": "Very High", "bestFormat": "Challenges, covers, transitions", "trendExample": "Dance challenges, lip sync trends"},
      {"niche": "Fashion/Beauty/GRWM", "viralFriendliness": "⭐⭐⭐⭐", "avgEngagement": "High", "bestFormat": "Transformations, hauls, routines", "trendExample": "Outfit transitions, GRWM routines"},
      {"niche": "Cars/Bikes/Luxury", "viralFriendliness": "⭐⭐⭐⭐", "avgEngagement": "High", "bestFormat": "Reveals, reviews, lifestyle", "trendExample": "Supercar reveals, modification builds"},
      {"niche": "Fitness/Motivation", "viralFriendliness": "⭐⭐⭐⭐", "avgEngagement": "Medium-High", "bestFormat": "Transformations, tips, routines", "trendExample": "Before/after, workout challenges"},
      {"niche": "Food/Cooking", "viralFriendliness": "⭐⭐⭐", "avgEngagement": "Medium", "bestFormat": "Recipes, reviews, ASMR", "trendExample": "Street food, recipe hacks"},
      {"niche": "Tech/Gaming", "viralFriendliness": "⭐⭐⭐", "avgEngagement": "Medium", "bestFormat": "Reviews, tips, gameplay", "trendExample": "Unboxing, tech hacks"},
      {"niche": "Education/Learning", "viralFriendliness": "⭐⭐", "avgEngagement": "Low-Medium", "bestFormat": "Edutainment, quick facts", "trendExample": "Did you know, myth-busting"},
      {"niche": "News/Analysis", "viralFriendliness": "⭐", "avgEngagement": "Low", "bestFormat": "Hot takes, breaking news", "trendExample": "Trending news reactions"}
    ]
  },

  "videoQualityGuide": {
    "explanation": "<explain how video quality directly impacts viewer retention and algorithm ranking>",
    "tips": [
      {"area": "Resolution", "recommendation": "Always record in 1080p or higher — HD content gets 40% more engagement", "quick": "Settings → Camera → Record Video → 1080p/4K"},
      {"area": "Lighting", "recommendation": "Natural light is best. Face a window or use a ring light. Avoid harsh overhead lighting that creates shadows", "quick": "Golden hour (sunrise/sunset) = best natural light"},
      {"area": "Stability", "recommendation": "Use a tripod or stabilizer. Shaky footage = instant scroll-away. Even a phone stand works", "quick": "₹200-500 phone tripod from Amazon"},
      {"area": "Framing", "recommendation": "Rule of thirds — place your subject off-center. Fill the frame. Vertical 9:16 format always", "quick": "Use grid overlay on camera app"},
      {"area": "Color/Exposure", "recommendation": "Slightly warm tones and good contrast perform better. Avoid overexposed or underexposed footage", "quick": "Use Instagram's built-in editing tools for quick fixes"}
    ],
    "yourReel": "<specific quality assessment with improvement points>"
  },

  "creatorChecklist": [
    {"item": "Hook in first 3 seconds that stops the scroll", "category": "Hook", "priority": "Critical"},
    {"item": "Trending or popular background audio", "category": "Audio", "priority": "High"},
    {"item": "HD video quality (1080p minimum)", "category": "Quality", "priority": "High"},
    {"item": "Good lighting (natural or ring light)", "category": "Quality", "priority": "High"},
    {"item": "Engaging caption with CTA", "category": "Caption", "priority": "High"},
    {"item": "5-10 relevant hashtags (mix of niche + broad)", "category": "Hashtags", "priority": "Medium"},
    {"item": "Face visible in thumbnail/first frame", "category": "Thumbnail", "priority": "High"},
    {"item": "Text overlay with hook/key message", "category": "Visual", "priority": "Medium"},
    {"item": "Quick cuts (every 2-3 seconds)", "category": "Editing", "priority": "Medium"},
    {"item": "Posted during peak hours (7-9 PM or 12-2 PM)", "category": "Timing", "priority": "High"},
    {"item": "Reply to comments within first hour", "category": "Engagement", "priority": "Critical"},
    {"item": "Share to Stories immediately after posting", "category": "Distribution", "priority": "High"},
    {"item": "Content matches a trending topic/format", "category": "Trend", "priority": "Medium"},
    {"item": "Video length under 30 seconds for max retention", "category": "Format", "priority": "Medium"}
  ],

  "commonMistakes": [
    {"mistake": "<common mistake 1>", "why": "<why it hurts performance>", "fix": "<how to fix>"},
    {"mistake": "<common mistake 2>", "why": "<why>", "fix": "<fix>"},
    {"mistake": "<common mistake 3>", "why": "<why>", "fix": "<fix>"},
    {"mistake": "<common mistake 4>", "why": "<why>", "fix": "<fix>"},
    {"mistake": "<common mistake 5>", "why": "<why>", "fix": "<fix>"},
    {"mistake": "<common mistake 6>", "why": "<why>", "fix": "<fix>"},
    {"mistake": "<common mistake 7>", "why": "<why>", "fix": "<fix>"}
  ],

  "quickTips": {
    "lighting": ["<3 quick lighting tips>"],
    "audio": ["<3 quick audio tips>"],
    "thumbnail": ["<3 quick thumbnail tips>"],
    "hashtags": ["<3 quick hashtag tips>"],
    "posting": ["<3 quick posting time tips>"]
  },

  "competitorComparison": {
    "summary": "<2-3 sentence overview>",
    "topPerformers": [
      {"rank": 1, "trait": "<what top reels in this niche do>", "yourScore": "<comparison>", "recommendation": "<action>"},
      {"rank": 2, "trait": "...", "yourScore": "...", "recommendation": "..."},
      {"rank": 3, "trait": "...", "yourScore": "...", "recommendation": "..."},
      {"rank": 4, "trait": "...", "yourScore": "...", "recommendation": "..."},
      {"rank": 5, "trait": "...", "yourScore": "...", "recommendation": "..."}
    ],
    "categoryInsight": "<what traits viral reels in this niche share>"
  },

  "contentCalendar": {
    "bestPostingTimes": [
      {"day": "Monday", "time": "9:00 AM - 11:00 AM", "reason": "<why>"},
      {"day": "Wednesday", "time": "12:00 PM - 2:00 PM", "reason": "..."},
      {"day": "Friday", "time": "6:00 PM - 8:00 PM", "reason": "..."},
      {"day": "Saturday", "time": "10:00 AM - 12:00 PM", "reason": "..."},
      {"day": "Sunday", "time": "7:00 PM - 9:00 PM", "reason": "..."}
    ],
    "postingFrequency": "<recommended>",
    "contentMix": [{"type": "<type>", "percentage": "<>", "reason": "<>"}],
    "weeklyPlan": "<7-day content plan>"
  },

  "improvementRoadmap": {
    "steps": [
      {"step": 1, "title": "<title>", "description": "<2-3 sentences>", "impact": "high/medium/low", "effort": "easy/medium/hard", "timeline": "<when>"},
      {"step": 2, "title": "...", "description": "...", "impact": "...", "effort": "...", "timeline": "..."},
      {"step": 3, "title": "...", "description": "...", "impact": "...", "effort": "...", "timeline": "..."},
      {"step": 4, "title": "...", "description": "...", "impact": "...", "effort": "...", "timeline": "..."},
      {"step": 5, "title": "...", "description": "...", "impact": "...", "effort": "...", "timeline": "..."}
    ]
  },

  "aiRecommendations": {
    "hookAlternatives": ["<hook 1>", "<hook 2>", "<hook 3>"],
    "captionRewrite": "<improved caption>",
    "hashtagStrategy": ["<tag1>", "<tag2>", "<tag3>", "<tag4>", "<tag5>"],
    "trendingAudioSuggestions": ["<audio1>", "<audio2>", "<audio3>"],
    "thumbnailTips": ["<tip1>", "<tip2>", "<tip3>"],
    "engagementBoostTips": ["<tip1>", "<tip2>", "<tip3>", "<tip4>", "<tip5>"]
  },

  "scoreBreakdown": {
    "overall": ${viralScore},
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
  
  parsed.viralityInsights = viralityInsights;
  parsed.daysSincePost = daysSincePost;
  
  return parsed;
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

  try {
    const { reportId, analysisData, reelUrl, adminFree } = await req.json();

    // === INPUT VALIDATION ===
    if (reelUrl && (typeof reelUrl !== "string" || reelUrl.length > 500)) {
      return new Response(JSON.stringify({ success: false, error: "Invalid reel URL" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (reportId && (typeof reportId !== "string" || reportId.length > 100)) {
      return new Response(JSON.stringify({ success: false, error: "Invalid report ID" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const apiKeys = await getApiKeysFromDb(supabase);
    if (apiKeys.length === 0) throw new Error("No Gemini API keys configured. Add keys in Admin Panel → API Keys Manager.");

    // === RATE LIMITING ===
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ipHash = await hashString(clientIp);
    const { data: allowed } = await supabase.rpc("check_rate_limit", {
      p_ip_hash: ipHash,
      p_function_name: "generate-master-report",
      p_max_requests: 5,
      p_window_minutes: 60,
    });
    if (allowed === false) {
      return new Response(JSON.stringify({ success: false, error: "Too many report requests. Please try again later." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ===== SECURITY: Payment or Admin auth required =====
    if (adminFree) {
      // Admin free path: verify JWT + admin role
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ success: false, error: "Authorization required" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
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
      console.log("Admin free report generation authorized for user:", user.id);
    } else {
      // Paid path: reportId is REQUIRED and must be verified as paid
      if (!reportId) {
        return new Response(JSON.stringify({ success: false, error: "Report ID is required. Payment must be completed first." }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: report } = await supabase
        .from("paid_reports")
        .select("id, status, reel_url")
        .eq("id", reportId)
        .eq("status", "paid")
        .single();

      if (!report) {
        return new Response(JSON.stringify({ success: false, error: "Payment not verified. Please complete payment first." }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Extra security: verify the reel URL matches the paid report
      if (reelUrl && report.reel_url && report.reel_url !== reelUrl) {
        return new Response(JSON.stringify({ success: false, error: "Reel URL mismatch with payment record" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Generate premium analysis
    console.log("Generating premium analysis...");
    const genStart = Date.now();
    const premiumData = await generatePremiumAnalysis(analysisData, reelUrl, supabase);

    // Update report with analysis data (only for paid path)
    if (!adminFree && reportId) {
      await supabase
        .from("paid_reports")
        .update({
          analysis_data: { ...analysisData, premium: premiumData },
          completed_at: new Date().toISOString(),
          status: "completed",
        })
        .eq("id", reportId);
    }

    // Log usage
    const { error: logErr } = await supabase.from("api_usage_logs").insert({
      function_name: "generate-master-report",
      ai_model: "gemini-2.5-flash",
      ai_provider: "google",
      is_ai_call: true,
      estimated_cost: 0.004,
      tokens_used: 5000,
      status_code: 200,
      duration_ms: Date.now() - genStart,
    });
    if (logErr) console.error("Usage log failed:", logErr);

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
