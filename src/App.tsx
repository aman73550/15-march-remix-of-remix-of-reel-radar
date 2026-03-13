import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LangProvider } from "@/lib/LangContext";
import { lazy, Suspense } from "react";
import AppLayout from "@/components/AppLayout";
import Index from "./pages/Index.tsx";

const SeoOptimizer = lazy(() => import("./pages/SeoOptimizer.tsx"));
const AdminLogin = lazy(() => import("./pages/AdminLogin.tsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const queryClient = new QueryClient();

const Loader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LangProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public pages with sidebar */}
            <Route path="/" element={<AppLayout><Index /></AppLayout>} />
            <Route path="/seo-optimizer" element={<AppLayout><Suspense fallback={<Loader />}><SeoOptimizer /></Suspense></AppLayout>} />

            {/* Admin pages (no sidebar) */}
            <Route path="/bosslogin" element={<Suspense fallback={<Loader />}><AdminLogin /></Suspense>} />
            <Route path="/bosspage" element={<Suspense fallback={<Loader />}><AdminDashboard /></Suspense>} />

            {/* Legacy redirects */}
            <Route path="/admin-login" element={<Suspense fallback={<Loader />}><AdminLogin /></Suspense>} />
            <Route path="/admin" element={<Suspense fallback={<Loader />}><AdminDashboard /></Suspense>} />

            <Route path="*" element={<Suspense fallback={<Loader />}><NotFound /></Suspense>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LangProvider>
  </QueryClientProvider>
);

export default App;
