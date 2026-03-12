# Memory: index.md
Dark theme Instagram Reel viral analysis tool. Design tokens in index.css (HSL).

- Stack: React + Vite + Tailwind + Supabase (Lovable Cloud)
- Primary: 340 82% 55% (pink-red), Secondary: 260 60% 55% (purple), Accent: 30 90% 55% (orange)
- Language: Hindi/English toggle
- Admin panel at /admin-login (see mem://features/admin.md)
- Ads: 6 slots (banner-top/mid/bottom, sidebar-left/right, processing-overlay) managed via ad_config table with ad_type (adsense/affiliate/custom)
- Scraping: 4-layer fallback (meta tags → Firecrawl → oEmbed → noembed)
- Usage tracked in usage_logs table
- AI: Google Gemini direct API (GEMINI_API_KEY secret), NOT Lovable AI gateway
- Payment: site_config table stores Razorpay/Stripe keys, price (default ₹29), WhatsApp number
- No user login required - payment only via gateway
