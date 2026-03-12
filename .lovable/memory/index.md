# Memory: index.md
Dark theme Instagram Reel viral analysis tool. Design tokens in index.css (HSL).

- Stack: React + Vite + Tailwind + Supabase (Lovable Cloud)
- Primary: 340 82% 55% (pink-red), Secondary: 260 60% 55% (purple), Accent: 30 90% 55% (orange)
- Language: Hindi/English toggle
- Admin panel at /admin-login (see mem://features/admin.md)
- Ads: 6 slots managed via ad_config table
- Scraping: 4-layer fallback (meta tags → Firecrawl → oEmbed → noembed)
- Usage tracked in usage_logs table
- Payment: site_config table stores Razorpay/Stripe keys, price (default ₹29), WhatsApp number
- Paid reports: paid_reports table tracks purchases, admin can see analytics
- Master Report: Premium PDF (4-5 pages) with competitor comparison, content calendar, roadmap, AI tips
- PDF: html2canvas + jspdf for client-side generation
- WhatsApp: Floating button, number from site_config
- No user login required - payment only via gateway
