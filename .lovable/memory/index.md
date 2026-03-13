Dark theme Instagram Reel viral analysis tool. Design tokens in index.css (HSL).

- Stack: React + Vite + Tailwind + Supabase (Lovable Cloud)
- Primary: 340 82% 55% (pink-red), Secondary: 260 60% 55% (purple), Accent: 30 90% 55% (orange)
- Language: Hindi/English toggle
- **Sidebar navigation**: Reel Analyzer (/) + SEO Optimizer (/seo-optimizer) + WhatsApp Help
- Admin panel at /bosslogin and /bosspage (renamed from /admin)
- Legacy routes /admin and /admin-login still work
- Ads: 6 slots managed via ad_config table
- Scraping: 4-layer fallback (meta tags → Firecrawl → oEmbed → noembed)
- AI: Google Gemini multi-key rotation
- Payment: site_config table stores Razorpay/Stripe keys, prices for Master PDF + SEO tool
- Master PDF: display ₹99, actual ₹29
- SEO Tool: display ₹59, actual ₹10 (paid tool with step-by-step generation)
- Scoring: ALL scores capped at 80 max. Sub-scores max 8/10.
- Homepage features: badges, fake reviews (rotate every 3 days, multi-language), before/after section, today's fake links report, today's users counter
- Share popup has blurred background overlay
- Lazy loading on secondary pages (SeoOptimizer, AdminLogin, AdminDashboard)
- SEO: JSON-LD structured data, canonical tags, rich meta descriptions
- Feedback: star rating stored in feedback table
