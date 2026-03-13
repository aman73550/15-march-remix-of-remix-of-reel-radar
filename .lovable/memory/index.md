# Memory: index.md
Dark theme Instagram Reel viral analysis tool. Design tokens in index.css (HSL).

- Stack: React + Vite + Tailwind + Supabase (Lovable Cloud)
- Primary: 340 82% 55% (pink-red), Secondary: 260 60% 55% (purple), Accent: 30 90% 55% (orange)
- Language: Hindi/English toggle
- Admin panel at /admin-login (see mem://features/admin.md)
- Ads: 6 slots (banner-top/mid/bottom, sidebar-left/right, processing-overlay) managed via ad_config table with ad_type (adsense/affiliate/custom)
- Scraping: 4-layer fallback (meta tags → Firecrawl → oEmbed → noembed)
- Usage tracked in usage_logs table
- AI: Google Gemini direct API, multi-key rotation (GEMINI_API_KEYS comma-separated, fallback to GEMINI_API_KEY)
- Auto-failover on 429/402/403 errors, tries all keys before failing
- Payment: site_config table stores Razorpay/Stripe keys, price (default ₹29), WhatsApp number
- No user login required - payment only via gateway
- Scoring: ALL scores capped at 80 max (nothing is 100% perfect). Sub-scores max 8/10.
- Virality factors: recognizable person, strong facial expression, strong visual subject, famous place/object, deep voice, trending topic, famous incident — all give bonus
- Category bonuses: entertainment/music/GRWM/cars/bikes/dance/fashion = higher viral potential; educational/learning = lower
- Age penalty: 15+ day old reels get reduced viral score (peak virality happens in 1-2 days)
- Feedback: star rating (1-5) + optional comment, stored in feedback table, shown in admin panel
- OPTIMIZED: Single AI call architecture — regex extraction first, heuristics computed locally, one Gemini call for all analysis+vision
- Hook types: question/shock/storytelling/visual/statistic (classified by AI)
- No "attractive presenter" detection — replaced with strongFacialExpression + strongVisualSubject
