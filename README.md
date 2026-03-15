# 🎯 Viral Reel Analyzer — Instagram Reel Viral Score & SEO Optimizer

> AI-powered Instagram Reel analysis tool that scores your content for virality, provides actionable insights, and generates premium master reports.

## 🚀 Features

- **Viral Score Analysis** — Paste any Instagram Reel URL and get a comprehensive viral score (0-100) with detailed breakdowns
- **Hook Analysis** — AI evaluates your opening hook strength and suggests improvements
- **Caption & Hashtag Scoring** — Analyzes caption quality, hashtag relevance, and engagement potential
- **Trend Matching** — Compares your content against current viral trends
- **Content Classification** — Categorizes your reel and identifies its viral pattern type
- **Master Report (PDF)** — Paid premium report with deep-dive analysis and recommendations
- **SEO Optimizer** — Generate optimized hashtags, titles, and posting times for any topic
- **SEO Tool Landing Pages** — Dedicated pages for Hashtag Generator, Viral Checker, Caption Generator, Engagement Calculator, etc.
- **Blog** — SEO-optimized articles targeting long-tail keywords for Instagram growth and reel strategies
- **Multi-language Support** — English & Hindi interface toggle
- **WhatsApp Support Button** — Floating WhatsApp contact on all key pages (About, Contact, Partnership, Collaboration, Promotion)
- **Admin Dashboard** — Full admin panel with analytics, API key management, ad slots, and AI assistant

## 🛠️ Tech Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Database, Auth, Edge Functions, Storage)
- **AI**: Google Gemini via Lovable AI Gateway (self-hosting supports direct Gemini/OpenAI)
- **Payments**: Razorpay / Stripe (configurable via admin panel)
- **Charts**: Recharts
- **PDF**: jsPDF + html2canvas

## 📦 Project Structure

```
src/
├── components/          # UI components (analysis cards, charts, admin tools, WhatsApp button)
├── hooks/               # Custom React hooks
├── integrations/        # Supabase client & types (auto-generated)
├── lib/                 # Utilities, types, language context, traffic tracker
├── pages/               # Route pages (see All Pages below)
├── index.css            # Design tokens & global styles
supabase/
├── functions/           # Edge functions (analyze-reel, seo-analyze, traffic-analytics, etc.)
├── migrations/          # Database migrations
├── config.toml          # Supabase configuration
```

## 📄 All Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/` | Homepage | Main Reel Analyzer tool |
| `/seo-optimizer` | SEO Optimizer | Generate optimized hashtags, titles, posting times |
| `/reel-analyzer` | SEO Landing | Reel Analyzer landing page |
| `/instagram-reel-analyzer` | SEO Landing | Instagram Reel Analyzer landing |
| `/reel-seo-optimizer` | SEO Landing | Reel SEO Optimizer landing |
| `/reel-hashtag-generator` | SEO Landing | Hashtag Generator tool page |
| `/reel-caption-generator` | SEO Landing | Caption Generator tool page |
| `/reel-title-generator` | SEO Landing | Title Generator tool page |
| `/reel-viral-checker` | SEO Landing | Viral Checker tool page |
| `/reel-engagement-calculator` | SEO Landing | Engagement Calculator tool page |
| `/blog` | Blog Index | SEO articles listing |
| `/blog/:slug` | Blog Article | Individual blog post |
| `/about` | About Us | About the platform |
| `/contact` | Contact Us | Contact form (saves to database) |
| `/partnership` | Partnership | Partnership opportunities |
| `/collaboration` | Collaboration | Creator collaboration info |
| `/promotion` | Promotion | Advertising/promotion info |
| `/privacy-policy` | Privacy Policy | Legal privacy policy |
| `/terms` | Terms & Conditions | Legal terms |
| `/sitemap-page` | Sitemap | HTML sitemap for users |
| `/bosspage-login` | Admin Login | Hidden admin login |
| `/bosspage` | Admin Dashboard | Full admin panel |

## 🔒 Security Features

- **Rate Limiting** — Per-IP rate limits on all edge functions (20/hr analysis, 15/hr SEO, 10/hr payments, 5/hr reports)
- **Input Validation** — Strict URL validation, character limits, sanitized inputs
- **RLS Policies** — Row-level security on all database tables
- **Admin Auth** — Role-based access with `user_roles` table (no client-side role checks)
- **Secret Management** — Payment keys and API keys stored in database, never in frontend code
- **Hidden Admin Routes** — Admin panel accessible only via `/bosspage-login`

## 🏃 Quick Start (Development)

```bash
# Clone & install
git clone <your-repo-url>
cd <project-folder>
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Start dev server
npm run dev
```

## 📖 Documentation

| Document | Description |
|---|---|
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Complete deployment & self-hosting guide |
| [SELF-HOSTING.md](./SELF-HOSTING.md) | Quick self-hosting setup reference |
| [ADS-SETUP-GUIDE.md](./ADS-SETUP-GUIDE.md) | Ad integration guide |
| [database-setup.sql](./database-setup.sql) | Database schema & migrations |
| [.env.example](./.env.example) | Environment variables reference |

## 🚀 Deployment

### Lovable (Recommended)
Click **Publish** in the Lovable editor.

### Self-Hosting
See [DEPLOYMENT.md](./DEPLOYMENT.md) for Vercel, Netlify, Cloudflare Pages, Docker, or any static host.

## 📋 Admin Panel

Access at `/bosspage-login` with admin credentials. Features:
- 📊 Analytics dashboard (usage, revenue, feedback)
- 🔑 API key manager (up to 10 keys per service with auto-failover)
- 📢 30+ ad slot management
- 💰 Payment gateway configuration
- 🤖 AI Assistant chatbot for natural language admin tasks
- 🎯 Behaviour trigger settings
- 📈 API usage & cost tracking
- 🌐 Traffic intelligence & bot detection

## 🔍 SEO

- Structured data (JSON-LD): SoftwareApplication + FAQ schemas
- Open Graph & Twitter Card meta tags on all pages
- Sitemap at `/sitemap.xml` and HTML sitemap at `/sitemap-page`
- Optimized `robots.txt` with crawl directives
- Keyword-rich meta titles & descriptions on every page
- Semantic heading hierarchy (H1/H2/H3) throughout
- 8 dedicated SEO tool landing pages for long-tail keyword targeting
