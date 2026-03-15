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
- **Multi-language Support** — English & Hindi interface toggle
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
├── components/          # UI components (analysis cards, charts, admin tools)
├── hooks/               # Custom React hooks
├── integrations/        # Supabase client & types (auto-generated)
├── lib/                 # Utilities, types, language context
├── pages/               # Route pages (Index, SEO, Admin, Blog)
├── index.css            # Design tokens & global styles
supabase/
├── functions/           # Edge functions (analyze-reel, seo-analyze, etc.)
├── migrations/          # Database migrations
├── config.toml          # Supabase configuration
```

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
