# 🚀 Complete Deployment & Self-Hosting Guide

## Table of Contents
1. [Quick Start](#quick-start)
2. [Environment Setup](#environment-setup)
3. [API Keys Integration](#api-keys-integration)
4. [Payment Integration](#payment-integration)
5. [Ads Integration](#ads-integration)
6. [Admin Panel Setup](#admin-panel-setup)
7. [Security Features](#security-features)
8. [Deployment Options](#deployment-options)
9. [All Pages & Routes](#all-pages--routes)
10. [User Manual](#user-manual)
11. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm or bun
- A Supabase project (free tier works)

### Setup
```bash
# 1. Clone and install
git clone <your-repo-url>
cd <project-folder>
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# 3. Run database migrations
# Import database-setup.sql into your Supabase project

# 4. Set Edge Function Secrets (in Supabase Dashboard)
# ADMIN_EMAIL, ADMIN_PASSWORD, GEMINI_API_KEY (or GEMINI_API_KEYS)

# 5. Deploy Edge Functions
npx supabase login
npx supabase link --project-ref <your-project-id>
npx supabase functions deploy analyze-reel
npx supabase functions deploy generate-master-report
npx supabase functions deploy seo-analyze
npx supabase functions deploy create-payment
npx supabase functions deploy verify-payment
npx supabase functions deploy check-reel-date
npx supabase functions deploy create-admin
npx supabase functions deploy usage-analyzer
npx supabase functions deploy admin-ai-chat
npx supabase functions deploy traffic-analytics

# 6. Create admin user
curl -X POST https://<project-id>.supabase.co/functions/v1/create-admin \
  -H "Content-Type: application/json" \
  -d '{"secret_key": "setup-admin-73550"}'

# 7. Start development
npm run dev

# 8. Build for production
npm run build
```

---

## Environment Setup

### Frontend (.env file)

| Variable | Description | Where to get |
|---|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Supabase → Settings → API → Project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key | Supabase → Settings → API → anon key |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID | Supabase → Settings → General |

> ⚠️ **IMPORTANT**: These are the ONLY keys stored in the .env file. All other secrets are stored securely as edge function secrets or in the database via the Admin Panel.

### Backend Secrets (Auto-provided by Supabase)

| Secret | Description |
|---|---|
| `SUPABASE_URL` | Auto-provided in Edge Functions |
| `SUPABASE_ANON_KEY` | Auto-provided |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-provided (⚠️ never expose) |
| `SUPABASE_DB_URL` | Auto-provided |

### Edge Function Secrets (set in Supabase Dashboard → Settings → Edge Functions → Secrets)

| Secret | Required? | Description |
|---|---|---|
| `ADMIN_EMAIL` | ✅ Required | Admin login email address |
| `ADMIN_PASSWORD` | ✅ Required | Admin login password |
| `GEMINI_API_KEY` | Optional | Single Gemini key (fallback if DB keys not set) |
| `GEMINI_API_KEYS` | Optional | Comma-separated Gemini keys (fallback) |
| `FIRECRAWL_API_KEY` | Optional | Web scraping (fallback) |

---

## API Keys Integration

### How Multi-Key Rotation Works

The system supports **up to 10 API keys per service** with automatic failover:

1. When a request is made, the system tries Key #1
2. If Key #1 hits rate limits (429/402/403), it automatically switches to Key #2
3. This continues through all available keys
4. Keys are loaded from the **database first** (Admin Panel), then from environment variables as fallback

### Supported API Key Types

| Service | Config Key | Max Keys | Purpose |
|---|---|---|---|
| Google Gemini | `gemini_api_keys` | 10 | Reel analysis, report generation, AI assistant |
| Firecrawl | `firecrawl_api_key` | 10 | Web scraping for SEO research |
| OpenAI | `openai_api_keys` | 10 | Alternative to Gemini |

### Setting Keys via Admin Panel (Recommended)

1. Login at `/bosspage-login`
2. Scroll to **"API Keys Manager"** section
3. Add keys one by one for each service
4. Click **"Save Keys"** for each group
5. Keys are immediately available to all edge functions

### Key Priority Order
1. Database keys (Admin Panel) — **checked first**
2. `GEMINI_API_KEYS` env var (multi-key)
3. `GEMINI_API_KEY` env var (single key)

---

## Payment Integration

### Supported Gateways
- **Razorpay** (default, recommended for India) — Inline checkout
- **Stripe** (international) — Redirect to Stripe Checkout
- **Manual/WhatsApp** (fallback when no gateway configured)

### Setup via Admin Panel

1. Go to Admin Panel (`/bosspage-login`) → **Payment & Config**
2. Set **Gateway**: `razorpay` or `stripe`
3. Enter your API keys:
   - **Razorpay**: Key ID (`rzp_live_...`) + Secret
   - **Stripe**: Secret Key (`sk_live_...`)
4. Set **Report Price** (default: 29) — shown dynamically in UI
5. Set **Currency** (INR, USD, etc.)
6. Click **Save Configuration**

### Where to Get Keys

| Gateway | Dashboard URL | Keys Needed |
|---|---|---|
| Razorpay | [dashboard.razorpay.com](https://dashboard.razorpay.com) | Key ID + Secret |
| Stripe | [dashboard.stripe.com](https://dashboard.stripe.com) | Secret Key (`sk_live_...` or `sk_test_...`) |

### Payment Flow

#### Razorpay
1. User clicks "Unlock Report" → `create-payment` creates Razorpay order
2. Razorpay inline checkout opens on page
3. User pays → `verify-payment` verifies HMAC-SHA256 signature
4. Report generated → `generate-master-report` creates premium PDF

#### Stripe
1. User clicks "Unlock Report" → `create-payment` creates Stripe Checkout Session
2. User redirected to Stripe Checkout page
3. After payment → Redirected back with `session_id`
4. `verify-payment` checks session `payment_status === "paid"` via Stripe API
5. Report generated → `generate-master-report` creates premium PDF

### Dynamic Pricing
Report price is fetched from the database and displayed dynamically in the button. Change it anytime from Admin Panel without code changes.

> 🔒 **Security**: Payment keys are stored in the `site_config` database table (admin-only access via RLS), never in frontend code or .env files. Razorpay payments verified via HMAC signature. Stripe payments verified via session API.

---

## Ads Integration

### Supported Ad Types
- **Google AdSense** (auto, display, in-article)
- **Affiliate Banners** (custom links + images)
- **Custom HTML** (any HTML/JS code)

### Available Ad Slots (30+)

| Group | Slots |
|---|---|
| Homepage | Top Banner, Mid Banner, Bottom Banner, Left Sidebar, Right Sidebar |
| Processing | Analysis Overlay, Below Progress Bar |
| Report Processing | Below Report Progress, Report Processing Bottom |
| Results | After Score, Mid-1/2/3, After Charts, After Hooks, After Recommendations |
| Master Report | After Category, After Famous, Mid 1/2, Bottom Banner |
| SEO | Below Input, Processing Top/Mid/Bottom, Results Mid/Bottom |
| Footer | Before Leaderboard, Before Reviews, Above Footer, Share Gate, Footer Banner |

### Setup via Admin Panel

1. Go to Admin Panel → **Ad Slots**
2. Click any slot to expand
3. Choose ad type (AdSense/Affiliate/Custom)
4. Paste your ad code
5. Click **Deploy Ad** — it's live immediately!
6. Use toggle to enable/disable any slot

See [ADS-SETUP-GUIDE.md](./ADS-SETUP-GUIDE.md) for detailed ad setup instructions.

---

## Admin Panel Setup

### Creating First Admin

1. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` as edge function secrets in Supabase Dashboard
2. Deploy the `create-admin` edge function
3. Call it to create the admin user:
   ```bash
   curl -X POST https://<project-id>.supabase.co/functions/v1/create-admin \
     -H "Content-Type: application/json" \
     -d '{"secret_key": "setup-admin-73550"}'
   ```
4. Login at **`/bosspage-login`** with your admin credentials

> ⚠️ **IMPORTANT**: The old `/admin` and `/admin-login` routes are disabled. Only `/bosspage-login` and `/bosspage` work.

### Admin Panel Features

| Section | What You Can Do |
|---|---|
| 📊 Dashboard | View total analyses, daily/weekly/monthly stats, revenue |
| 💰 Payment & Config | Payment gateway, pricing (dynamic), currency, WhatsApp number |
| 🔑 API Keys | Add/remove up to 10 keys per service with auto-failover |
| 📢 Ad Slots | Deploy/manage 30+ ad placements |
| 📄 Reports & Logs | View recent reports, payment history |
| 📈 API Usage | Track API calls, costs, AI model usage |
| 🌐 Traffic Intelligence | Bot detection, real user analytics, geo data |
| 👑 Report Generator | Generate free reports (admin only, no payment) |
| 🔍 SEO Optimizer | Free SEO analysis (admin only) |
| 🎯 Behaviour | Configure popups, triggers, CTAs |
| ⭐ Feedback | View user ratings and comments |
| 🤖 AI Assistant | Natural language chatbot for admin tasks |

### AI Assistant Chatbot

Access via the floating chat button (💬). Can:
- Check system status, API health, usage stats
- Update configuration via natural language
- View revenue reports and analytics
- Toggle ad slots, manage settings
- Troubleshoot issues

---

## Security Features

### Rate Limiting

| Function | Limit (per hour) |
|---|---|
| `analyze-reel` | 20 requests |
| `seo-analyze` | 15 requests |
| `create-payment` | 10 requests |
| `generate-master-report` | 5 requests |

IPs are hashed (SHA-256) before storage for privacy.

### Input Validation

| Input | Validation |
|---|---|
| Reel URL | Must match Instagram Reel pattern or `seo:` prefix |
| URL length | Max 500 characters |
| Caption | Max 5,000 characters |
| Topic/keyword | Max 1,000 characters |
| Engagement metrics | Must be positive numbers |

### Payment Security
- ✅ Razorpay: HMAC-SHA256 signature verification
- ✅ Stripe: Server-side session verification via API
- ✅ Report generation requires verified payment status
- ✅ Payment keys stored in database (admin-only RLS)

### Other Security
- ✅ RLS policies on all database tables
- ✅ Admin auth via `user_roles` table (server-side)
- ✅ Hidden admin route (`/bosspage-login`)
- ✅ Admin credentials in env secrets, not in code
- ✅ Service role key never exposed to client

---

## Deployment Options

### Vercel (Recommended)
1. Import GitHub repo in Vercel
2. Add env vars (only VITE_* vars needed)
3. Deploy automatically — `vercel.json` included

### Netlify
1. Import repo → Build: `npm run build` → Publish: `dist`
2. `public/_redirects` already configured

### Cloudflare Pages
1. Connect GitHub → Build: `npm run build` → Output: `dist`

### Docker
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### Any Static Host
Upload `dist/` folder. Ensure SPA routing redirects all paths to `index.html`.

---

## All Pages & Routes

| Route | Component | Description |
|---|---|---|
| `/` | Index | Main Reel Analyzer tool (homepage) |
| `/seo-optimizer` | SEOOptimizer | SEO optimization tool |
| `/reel-analyzer` | SEOToolPage | Reel Analyzer landing page |
| `/instagram-reel-analyzer` | SEOToolPage | Instagram Reel Analyzer landing |
| `/reel-seo-optimizer` | SEOToolPage | Reel SEO Optimizer landing |
| `/reel-hashtag-generator` | SEOToolPage | Hashtag Generator tool page |
| `/reel-caption-generator` | SEOToolPage | Caption Generator tool page |
| `/reel-title-generator` | SEOToolPage | Title Generator tool page |
| `/reel-viral-checker` | SEOToolPage | Viral Checker tool page |
| `/reel-engagement-calculator` | SEOToolPage | Engagement Calculator tool page |
| `/blog` | BlogIndex | Blog articles listing |
| `/blog/:slug` | BlogArticle | Individual blog post |
| `/about` | AboutPage | About the platform |
| `/contact` | ContactPage | Contact form |
| `/partnership` | PartnershipPage | Partnership opportunities |
| `/collaboration` | CollaborationPage | Creator collaboration |
| `/promotion` | PromotionPage | Advertising/promotion info |
| `/privacy-policy` | PrivacyPolicyPage | Privacy policy |
| `/terms` | TermsPage | Terms & conditions |
| `/sitemap-page` | SitemapPage | HTML sitemap |
| `/bosspage-login` | AdminLogin | Admin login (hidden) |
| `/bosspage` | AdminDashboard | Admin dashboard (hidden) |

---

## User Manual

### For End Users

1. **Analyze a Reel**: Paste Instagram Reel URL → Click "Analyze" → Get viral score & insights
2. **Optional Details**: Add caption, hashtags, engagement metrics for better accuracy
3. **Master Report**: Click "Unlock Master Report" → Pay configured price → Get detailed PDF
4. **SEO Optimizer**: Enter topic → Pay → Get optimized hashtags, titles, posting times
5. **Language Toggle**: Switch between English & Hindi
6. **WhatsApp Support**: Click the green WhatsApp button (visible on About, Contact, Partnership, Collaboration, Promotion pages) for quick support

### For Admins

1. Login at **`/bosspage-login`** with admin credentials
2. **Dashboard**: View analytics, revenue, user engagement
3. **Payment & Config**: Set gateway (Razorpay/Stripe), pricing, currency
4. **API Keys**: Add multiple keys for uninterrupted service
5. **Ad Management**: Deploy ads to 30+ slots
6. **Traffic Intelligence**: Monitor real users vs bots, geo distribution
7. **AI Assistant**: Use chatbot (💬) for quick admin tasks
8. **Free Tools**: Generate reports/SEO analysis without payment

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|---|---|
| "No API keys configured" | Add Gemini keys in Admin Panel → API Keys |
| "Payment gateway not configured" | Set Razorpay/Stripe keys in Admin Panel → Config |
| "Invalid Instagram Reel URL" | Ensure URL matches `instagram.com/reel/...` pattern |
| "Rate limit exceeded" | Wait 1 hour or add more API keys |
| Stripe redirect not working | Verify `stripe_key` is set and valid in Admin Config |
| Razorpay checkout not opening | Check `razorpay_key_id` and `razorpay_key_secret` in Config |
| Admin can't login | Verify `ADMIN_EMAIL`/`ADMIN_PASSWORD` secrets |
| Old `/admin` URL not working | Use `/bosspage-login` instead |
| Price shows ₹29 even after change | Refresh the page — price is fetched on load |
| WhatsApp button not showing | Set `whatsapp_number` in Admin Panel → Config |

### Edge Function Logs

```bash
npx supabase functions logs analyze-reel --follow
npx supabase functions logs create-payment --follow
npx supabase functions logs verify-payment --follow
npx supabase functions logs generate-master-report --follow
npx supabase functions logs admin-ai-chat --follow
npx supabase functions logs traffic-analytics --follow
```

### Edge Functions Reference

| Function | Purpose | Rate Limit |
|---|---|---|
| `analyze-reel` | Core reel analysis | 20/hr |
| `generate-master-report` | Premium PDF report | 5/hr |
| `seo-analyze` | SEO optimization | 15/hr |
| `create-payment` | Payment order (Razorpay/Stripe) | 10/hr |
| `verify-payment` | Payment verification (signature/session) | — |
| `check-reel-date` | Reel date validation | — |
| `create-admin` | Admin user setup | — |
| `usage-analyzer` | API usage tracking | — |
| `admin-ai-chat` | AI assistant for admin | — |
| `traffic-analytics` | Traffic & bot detection | — |
