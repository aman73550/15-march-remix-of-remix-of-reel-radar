import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { url } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ success: false, error: "URL is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let publishDate: string | null = null;

    // Method 1: Fetch Instagram page and look for datePublished in JSON-LD or meta tags
    try {
      const pageResp = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml",
          "Accept-Language": "en-US,en;q=0.9",
        },
        redirect: "follow",
      });

      if (pageResp.ok) {
        const html = await pageResp.text();

        // Try JSON-LD datePublished
        const jsonLdMatch = html.match(/"datePublished"\s*:\s*"([^"]+)"/);
        if (jsonLdMatch) {
          publishDate = jsonLdMatch[1];
        }

        // Try og:published_time or article:published_time meta tag
        if (!publishDate) {
          const metaMatch = html.match(/<meta[^>]*(?:property|name)=["'](?:og:published_time|article:published_time)["'][^>]*content=["']([^"']+)["']/i);
          if (metaMatch) {
            publishDate = metaMatch[1];
          }
        }

        // Try datetime attribute in time tags
        if (!publishDate) {
          const timeMatch = html.match(/<time[^>]*datetime=["']([^"']+)["']/i);
          if (timeMatch) {
            publishDate = timeMatch[1];
          }
        }

        // Try data-testid="post-timestamp" or similar patterns
        if (!publishDate) {
          const timestampMatch = html.match(/["']uploadDate["']\s*:\s*["']([^"']+)["']/);
          if (timestampMatch) {
            publishDate = timestampMatch[1];
          }
        }

        // Try to find any ISO date pattern near "published" or "created" or "posted"
        if (!publishDate) {
          const isoMatch = html.match(/(?:publish|created|posted|upload)(?:ed|_at|Date|Time)["'\s:]*["'](\d{4}-\d{2}-\d{2}T[\d:.]+Z?)["']/i);
          if (isoMatch) {
            publishDate = isoMatch[1];
          }
        }
      }
    } catch (e) {
      console.log("Page fetch failed:", e);
    }

    // Validate the date if found
    let validDate: string | null = null;
    if (publishDate) {
      const parsed = new Date(publishDate);
      if (!isNaN(parsed.getTime())) {
        validDate = parsed.toISOString();
      }
    }

    // Calculate age
    let daysSincePost: number | null = null;
    let hoursSincePost: number | null = null;
    let isTooNew = false;

    if (validDate) {
      const posted = new Date(validDate);
      const now = new Date();
      hoursSincePost = (now.getTime() - posted.getTime()) / (1000 * 60 * 60);
      daysSincePost = hoursSincePost / 24;
      isTooNew = hoursSincePost < 48;
    }

    return new Response(JSON.stringify({
      success: true,
      publishDate: validDate,
      daysSincePost: daysSincePost !== null ? Math.round(daysSincePost * 10) / 10 : null,
      hoursSincePost: hoursSincePost !== null ? Math.round(hoursSincePost) : null,
      isTooNew,
      dateFound: validDate !== null,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("check-reel-date error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
