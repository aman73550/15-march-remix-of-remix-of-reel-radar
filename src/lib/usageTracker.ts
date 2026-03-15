const STORAGE_KEY = "rva_usage";

interface UsageData {
  fingerprint: string;
  analysisCount: number;
  shareCount: number;
  extraUnlocked: number;
  lastReset: string;
}

// Simple browser fingerprint from stable properties
function generateFingerprint(): string {
  const nav = window.navigator;
  const screen = window.screen;
  const raw = [
    nav.userAgent,
    nav.language,
    nav.hardwareConcurrency,
    screen.width,
    screen.height,
    screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    nav.maxTouchPoints,
  ].join("|");

  // Simple hash
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const chr = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return "fp_" + Math.abs(hash).toString(36);
}

function getUsageData(): UsageData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored) as UsageData;
      // Verify fingerprint matches
      const fp = generateFingerprint();
      if (data.fingerprint === fp) return data;
    }
  } catch {}

  // Initialize fresh
  const data: UsageData = {
    fingerprint: generateFingerprint(),
    analysisCount: 0,
    shareCount: 0,
    extraUnlocked: 0,
    lastReset: new Date().toISOString(),
  };
  saveUsageData(data);
  return data;
}

function saveUsageData(data: UsageData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    // Also store in cookie as backup
    document.cookie = `${STORAGE_KEY}=${encodeURIComponent(JSON.stringify(data))}; max-age=31536000; path=/; SameSite=Strict`;
  } catch {}
}

// Try to restore from cookie if localStorage was cleared
function restoreFromCookie(): UsageData | null {
  try {
    const match = document.cookie.match(new RegExp(`${STORAGE_KEY}=([^;]+)`));
    if (match) {
      const data = JSON.parse(decodeURIComponent(match[1])) as UsageData;
      if (data.fingerprint === generateFingerprint()) {
        saveUsageData(data);
        return data;
      }
    }
  } catch {}
  return null;
}

export const FREE_LIMIT = 2;
export const SHARE_REQUIRED = 5;
export const BONUS_ANALYSES = 2;

export function getUsage(): UsageData {
  let data = getUsageData();
  // If localStorage was empty but cookie exists
  if (data.analysisCount === 0 && data.shareCount === 0) {
    const cookieData = restoreFromCookie();
    if (cookieData && (cookieData.analysisCount > 0 || cookieData.shareCount > 0)) {
      data = cookieData;
    }
  }
  return data;
}

export function getRemainingAnalyses(): number {
  const data = getUsage();
  const totalAllowed = FREE_LIMIT + data.extraUnlocked;
  return Math.max(0, totalAllowed - data.analysisCount);
}

export function canAnalyze(): boolean {
  return getRemainingAnalyses() > 0;
}

export function recordAnalysis(): void {
  const data = getUsage();
  data.analysisCount += 1;
  saveUsageData(data);
}

export function recordShare(): number {
  const data = getUsage();
  data.shareCount += 1;
  // Calculate how many total analyses are currently allowed
  const totalAllowed = FREE_LIMIT + data.extraUnlocked;
  // If all analyses used up, allow another unlock cycle by adding more bonus
  if (data.analysisCount >= totalAllowed) {
    data.extraUnlocked += BONUS_ANALYSES;
  } else if (data.extraUnlocked < BONUS_ANALYSES) {
    // First time unlock
    data.extraUnlocked = BONUS_ANALYSES;
  }
  saveUsageData(data);
  // Return fake progress: jump to SHARE_REQUIRED on unlock
  return data.shareCount >= 1 ? SHARE_REQUIRED : data.shareCount;
}

export function hasUnlockedBonus(): boolean {
  const data = getUsage();
  return data.extraUnlocked >= BONUS_ANALYSES;
}

export function getShareCount(): number {
  return getUsage().shareCount;
}

export function getAnalysisCount(): number {
  return getUsage().analysisCount;
}
