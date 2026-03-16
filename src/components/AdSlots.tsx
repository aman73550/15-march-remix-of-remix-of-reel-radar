// Re-export from new ad system for backwards compatibility
export { AdSlot as BannerAd } from "./ads/AdSlot";
export { AdSlot as InlineAd } from "./ads/AdSlot";
export { SidebarAds } from "./ads/AdSlot";
export { AdSlot as InterstitialAd } from "./ads/AdSlot";

// Default export
export { default } from "./ads/AdSlot";
