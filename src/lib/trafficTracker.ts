import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "rva_traffic_session";

interface SessionData {
  sessionId: string;
  startTime: number;
  pageViews: number;
  scrollDepth: number;
  clickCount: number;
  hasMouseMovement: boolean;
  hasScroll: boolean;
  hasClick: boolean;
  hasInputInteraction: boolean;
  navigationVariation: number;
  pagesVisited: string[];
}

function generateSessionId(): string {
  return "s_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

function getDeviceType(): string {
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

function getBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("OPR") || ua.includes("Opera")) return "Opera";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  return "Other";
}

function getOS(): string {
  const ua = navigator.userAgent;
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac OS")) return "macOS";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  if (ua.includes("Linux")) return "Linux";
  return "Other";
}

function getReferrerSource(): { source: string; url: string } {
  const ref = document.referrer;
  if (!ref) return { source: "direct", url: "" };
  try {
    const host = new URL(ref).hostname.toLowerCase();
    if (host.includes("google")) return { source: "google", url: ref };
    if (host.includes("facebook") || host.includes("fb.com")) return { source: "facebook", url: ref };
    if (host.includes("twitter") || host.includes("t.co") || host.includes("x.com")) return { source: "twitter", url: ref };
    if (host.includes("instagram")) return { source: "instagram", url: ref };
    if (host.includes("youtube")) return { source: "youtube", url: ref };
    if (host.includes("linkedin")) return { source: "linkedin", url: ref };
    if (host.includes("whatsapp") || host.includes("wa.me")) return { source: "whatsapp", url: ref };
    if (host.includes("reddit")) return { source: "reddit", url: ref };
    if (host.includes("bing")) return { source: "bing", url: ref };
    return { source: "referral", url: ref };
  } catch {
    return { source: "referral", url: ref };
  }
}

function getUTMParams(): { utm_source?: string; utm_medium?: string; utm_campaign?: string; share_id?: string } {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source") || undefined,
    utm_medium: params.get("utm_medium") || undefined,
    utm_campaign: params.get("utm_campaign") || undefined,
    share_id: params.get("sid") || undefined,
  };
}

function hashIP(): string {
  // We can't get real IP client-side; use a fingerprint-like identifier
  const raw = [navigator.userAgent, navigator.language, screen.width, screen.height, new Date().toDateString()].join("|");
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash) + raw.charCodeAt(i);
    hash |= 0;
  }
  return "ip_" + Math.abs(hash).toString(36);
}

// Bot detection signals
function calculateBotScore(session: SessionData, elapsed: number): { score: number; flags: string[] } {
  const flags: string[] = [];
  let score = 0;

  // No mouse movement after 5+ seconds
  if (elapsed > 5000 && !session.hasMouseMovement) { score += 25; flags.push("no_mouse"); }
  // No scroll after 10+ seconds
  if (elapsed > 10000 && !session.hasScroll) { score += 20; flags.push("no_scroll"); }
  // No clicks after 15+ seconds
  if (elapsed > 15000 && !session.hasClick) { score += 15; flags.push("no_click"); }
  // Very short session with actions (< 2s with clicks = scripted)
  if (elapsed < 2000 && session.clickCount > 3) { score += 30; flags.push("fast_clicks"); }
  // Headless browser indicators
  if (navigator.webdriver) { score += 40; flags.push("webdriver"); }
  if (!navigator.languages || navigator.languages.length === 0) { score += 15; flags.push("no_languages"); }
  // No navigation variation (single page, no interaction variety)
  if (elapsed > 30000 && session.navigationVariation === 0 && !session.hasInputInteraction) { score += 10; flags.push("no_variation"); }

  return { score: Math.min(100, score), flags };
}

let currentSession: SessionData | null = null;
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let dbRowCreated = false;

function getOrCreateSession(): SessionData {
  if (currentSession) return currentSession;

  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      currentSession = JSON.parse(stored);
      dbRowCreated = true; // assume already saved
      return currentSession!;
    }
  } catch {}

  currentSession = {
    sessionId: generateSessionId(),
    startTime: Date.now(),
    pageViews: 1,
    scrollDepth: 0,
    clickCount: 0,
    hasMouseMovement: false,
    hasScroll: false,
    hasClick: false,
    hasInputInteraction: false,
    navigationVariation: 0,
    pagesVisited: [window.location.pathname],
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(currentSession));
  return currentSession;
}

function saveSessionLocal() {
  if (currentSession) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(currentSession));
  }
}

async function saveToDatabase() {
  if (!currentSession) return;

  const elapsed = Date.now() - currentSession.startTime;
  const { score: botScore, flags: botFlags } = calculateBotScore(currentSession, elapsed);
  const isBot = botScore >= 50;
  const { source, url } = getReferrerSource();
  const utm = getUTMParams();

  const payload = {
    session_id: currentSession.sessionId,
    referrer_source: utm.utm_source || source,
    referrer_url: url || null,
    utm_source: utm.utm_source || null,
    utm_medium: utm.utm_medium || null,
    utm_campaign: utm.utm_campaign || null,
    share_id: utm.share_id || null,
    device_type: getDeviceType(),
    browser: getBrowser(),
    os: getOS(),
    screen_size: `${screen.width}x${screen.height}`,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    ip_hash: hashIP(),
    page_views: currentSession.pageViews,
    scroll_depth: currentSession.scrollDepth,
    click_count: currentSession.clickCount,
    duration_seconds: Math.round(elapsed / 1000),
    has_mouse_movement: currentSession.hasMouseMovement,
    has_scroll: currentSession.hasScroll,
    has_click: currentSession.hasClick,
    has_input_interaction: currentSession.hasInputInteraction,
    navigation_variation: currentSession.navigationVariation,
    is_bot: isBot,
    bot_score: botScore,
    bot_flags: botFlags,
    is_real_user: !isBot,
  };

  try {
    if (!dbRowCreated) {
      await supabase.from("traffic_sessions" as any).insert(payload as any);
      dbRowCreated = true;
    } else {
      await supabase.from("traffic_sessions" as any)
        .update({
          page_views: payload.page_views,
          scroll_depth: payload.scroll_depth,
          click_count: payload.click_count,
          duration_seconds: payload.duration_seconds,
          has_mouse_movement: payload.has_mouse_movement,
          has_scroll: payload.has_scroll,
          has_click: payload.has_click,
          has_input_interaction: payload.has_input_interaction,
          navigation_variation: payload.navigation_variation,
          is_bot: payload.is_bot,
          bot_score: payload.bot_score,
          bot_flags: payload.bot_flags,
          is_real_user: payload.is_real_user,
          session_end: new Date().toISOString(),
        } as any)
        .eq("session_id", currentSession.sessionId);
    }
  } catch (e) {
    console.error("Traffic tracking error:", e);
  }
}

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveToDatabase();
  }, 5000); // batch saves every 5 seconds
}

export function initTrafficTracker() {
  const session = getOrCreateSession();

  // Mouse movement
  let mouseMoveCount = 0;
  const onMouseMove = () => {
    mouseMoveCount++;
    if (mouseMoveCount > 3 && !session.hasMouseMovement) {
      session.hasMouseMovement = true;
      saveSessionLocal();
      scheduleSave();
    }
  };

  // Scroll
  const onScroll = () => {
    session.hasScroll = true;
    const scrollPct = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    );
    if (scrollPct > session.scrollDepth) {
      session.scrollDepth = Math.min(100, scrollPct);
    }
    saveSessionLocal();
    scheduleSave();
  };

  // Click
  const onClick = (e: MouseEvent) => {
    session.hasClick = true;
    session.clickCount++;
    // Check if it's an input/button interaction
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "BUTTON" || target.closest("button")) {
      session.hasInputInteraction = true;
    }
    saveSessionLocal();
    scheduleSave();
  };

  // Track navigation changes
  let lastPath = window.location.pathname;
  const checkNavigation = () => {
    const current = window.location.pathname;
    if (current !== lastPath) {
      lastPath = current;
      session.pageViews++;
      if (!session.pagesVisited.includes(current)) {
        session.pagesVisited.push(current);
        session.navigationVariation++;
      }
      saveSessionLocal();
      scheduleSave();
    }
  };

  document.addEventListener("mousemove", onMouseMove, { passive: true });
  document.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("click", onClick, { passive: true });

  const navInterval = setInterval(checkNavigation, 2000);

  // Initial save after 3 seconds
  setTimeout(() => saveToDatabase(), 3000);

  // Save on page unload
  const onUnload = () => {
    saveToDatabase();
  };
  window.addEventListener("beforeunload", onUnload);

  // Periodic save every 30 seconds
  const periodicSave = setInterval(() => saveToDatabase(), 30000);

  return () => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("scroll", onScroll);
    document.removeEventListener("click", onClick);
    window.removeEventListener("beforeunload", onUnload);
    clearInterval(navInterval);
    clearInterval(periodicSave);
    if (saveTimer) clearTimeout(saveTimer);
  };
}

// Share tracking
export function trackShareEvent(platform: string): string {
  const shareId = "sh_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 6);
  const session = getOrCreateSession();

  supabase.from("share_events" as any).insert({
    platform,
    share_id: shareId,
    shared_url: window.location.origin,
    referrer_session_id: session.sessionId,
  } as any).then(() => {});

  return shareId;
}

export function getShareUrl(platform: string): string {
  const shareId = trackShareEvent(platform);
  const base = window.location.origin;
  return `${base}?utm_source=${platform}&utm_medium=share&sid=${shareId}`;
}

export function getSessionId(): string {
  return getOrCreateSession().sessionId;
}
