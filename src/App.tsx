import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LangProvider } from "@/lib/LangContext";
import Index from "./pages/Index.tsx";
import SEOOptimizer from "./pages/SEOOptimizer.tsx";
import PopupAdOverlay from "./components/ads/PopupAds";
import { Loader2 } from "lucide-react";

// Lazy load secondary pages
const AdminLogin = lazy(() => import("./pages/AdminLogin.tsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const SEOToolPage = lazy(() => import("./pages/SEOToolPage.tsx"));
const BlogIndex = lazy(() => import("./pages/BlogIndex.tsx"));
const BlogArticle = lazy(() => import("./pages/BlogArticle.tsx"));
const AboutPage = lazy(() => import("./pages/AboutPage.tsx"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage.tsx"));
const TermsPage = lazy(() => import("./pages/TermsPage.tsx"));
const ContactPage = lazy(() => import("./pages/ContactPage.tsx"));
const SitemapPage = lazy(() => import("./pages/SitemapPage.tsx"));
const PartnershipPage = lazy(() => import("./pages/PartnershipPage.tsx"));
const CollaborationPage = lazy(() => import("./pages/CollaborationPage.tsx"));
const PromotionPage = lazy(() => import("./pages/PromotionPage.tsx"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <Loader2 className="w-6 h-6 text-primary animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LangProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Main pages */}
              <Route path="/" element={<Index />} />
              <Route path="/seo-optimizer" element={<SEOOptimizer />} />

              {/* SEO Tool Landing Pages */}
              <Route path="/reel-analyzer" element={<SEOToolPage slug="reel-analyzer" />} />
              <Route path="/instagram-reel-analyzer" element={<SEOToolPage slug="instagram-reel-analyzer" />} />
              <Route path="/reel-seo-optimizer" element={<SEOToolPage slug="reel-seo-optimizer" />} />
              <Route path="/reel-hashtag-generator" element={<SEOToolPage slug="reel-hashtag-generator" />} />
              <Route path="/reel-caption-generator" element={<SEOToolPage slug="reel-caption-generator" />} />
              <Route path="/reel-title-generator" element={<SEOToolPage slug="reel-title-generator" />} />
              <Route path="/reel-viral-checker" element={<SEOToolPage slug="reel-viral-checker" />} />
              <Route path="/reel-engagement-calculator" element={<SEOToolPage slug="reel-engagement-calculator" />} />

              {/* Blog */}
              <Route path="/blog" element={<BlogIndex />} />
              <Route path="/blog/:slug" element={<BlogArticle />} />

              {/* Info Pages */}
              <Route path="/about" element={<AboutPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/sitemap-page" element={<SitemapPage />} />
              <Route path="/partnership" element={<PartnershipPage />} />
              <Route path="/collaboration" element={<CollaborationPage />} />
              <Route path="/promotion" element={<PromotionPage />} />

              {/* Admin — hidden route */}
              <Route path="/bosspage-login" element={<AdminLogin />} />
              <Route path="/bosspage" element={<AdminDashboard />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </LangProvider>
  </QueryClientProvider>
);

export default App;
