// Backwards-compatible re-exports from new ad system
import { AdSlot, SidebarAds as SidebarAdsNew } from "./ads/AdSlot";

// BannerAd wraps AdSlot with variant="banner"
export const BannerAd = ({ slot = "banner", className = "" }: { slot?: string; className?: string }) => (
  <AdSlot slot={slot} variant="banner" className={className} />
);

// InlineAd wraps AdSlot with variant="inline"  
export const InlineAd = ({ slot = "inline" }: { slot?: string }) => (
  <AdSlot slot={slot} variant="inline" />
);

// SidebarAds
export const SidebarAds = SidebarAdsNew;

// InterstitialAd - keeping old interface but using popup system now
export const InterstitialAd = ({ show, onClose }: { show: boolean; onClose: () => void }) => {
  // Legacy component - popup ads now handled by PopupAdOverlay
  return null;
};

export default AdSlot;
