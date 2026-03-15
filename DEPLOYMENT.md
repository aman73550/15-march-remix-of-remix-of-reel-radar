# 🚀 Complete Deployment & Self-Hosting Guide

## Table of Contents
1. [Quick Start](#quick-start)
2. [Environment Setup](#environment-setup)
3. [API Keys Integration](#api-keys-integration)
4. [Payment Integration](#payment-integration)
5. [Ads Integration](#ads-integration)
6. [Admin Panel Setup](#admin-panel-setup)
7. [Deployment Options](#deployment-options)
8. [User Manual](#user-manual)
9. [Troubleshooting](#troubleshooting)

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

# 4. Deploy Edge Functions
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

# 5. Start development
npm run dev

# 6. Build for production
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

> ⚠️ **IMPORTANT**: These are the ONLY keys stored in the .env file. All other secrets (API keys, payment keys) are stored securely in the database and managed via the Admin Panel.

### Backend Secrets (Auto-provided by Supabase)

| Secret | Description |
|---|---|
| `SUPABASE_URL` | Auto-provided in Edge Functions |
| `SUPABASE_ANON_KEY` | Auto-provided |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-provided (⚠️ never expose) |
| `SUPABASE_DB_URL` | Auto-provided |

### Edge Function Secrets (set in Supabase Dashboard → Edge Functions → Secrets)

| Secret | Required? | Description |
|---|---|---|
| `GEMINI_API_KEY` | Optional | Single Gemini key (fallback if DB keys not set) |
| `GEMINI_API_KEYS` | Optional | Comma-separated Gemini keys (fallback) |
| `FIRECRAWL_API_KEY` | Optional | Web scraping (fallback) |

> 💡 **Recommended**: Use the Admin Panel to manage all API keys instead of environment variables. Admin Panel keys take priority over env vars.

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
| Google Gemini | `gemini_api_keys` | 10 | Reel analysis, report generation |
| Firecrawl | `firecrawl_api_key` | 10 | Web scraping for SEO research |
| OpenAI | `openai_api_keys` | 10 | Alternative to Gemini |

### Setting Keys via Admin Panel (Recommended)

1. Login at `/admin-login`
2. Scroll to **"API Keys Manager"** section
3. Add keys one by one for each service
4. Click **"Save Keys"** for each group
5. Keys are immediately available to all edge functions

### Setting Keys via Environment Variables (Fallback)

```bash
# Single key
GEMINI_API_KEY=AIzaSy...

# Multiple keys (comma-separated)
GEMINI_API_KEYS=AIzaSy_key1,AIzaSy_key2,AIzaSy_key3

# Firecrawl
FIRECRAWL_API_KEY=fc-...
```

### Key Priority Order
1. Database keys (Admin Panel) — **checked first**
2. `GEMINI_API_KEYS` env var (multi-key)
3. `GEMINI_API_KEY` env var (single key)

---

## Payment Integration

### Supported Gateways
- **Razorpay** (default, recommended for India)
- **Stripe** (international)
- **Manual/WhatsApp** (fallback)

### Setup via Admin Panel

1. Go to Admin Panel → **Payment & Config**
2. Set **Gateway**: Razorpay or Stripe
3. Enter your API keys:
   - **Razorpay**: Key ID (`rzp_live_...`) + Secret
   - **Stripe**: Secret Key (`sk_live_...`)
4. Set **Report Price** (default: ₹29)
5. Click **Save Configuration**

### Where to Get Keys

| Gateway | Dashboard URL | Keys Needed |
|---|---|---|
| Razorpay | [dashboard.razorpay.com](https://dashboard.razorpay.com) | Key ID + Secret |
| Stripe | [dashboard.stripe.com](https://dashboard.stripe.com) | Secret Key |

### Payment Flow
1. User requests a paid report → `create-payment` creates an order
2. User completes payment on gateway → `verify-payment` validates
3. Report is generated → `generate-master-report` creates premium analysis
4. User gets the full report

> 🔒 **Security**: Payment keys are stored in the `site_config` database table (admin-only access via RLS), never in frontend code or .env files.

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

### AdSense Setup
1. Get your AdSense publisher ID (`ca-pub-XXXXXXXX`)
2. Create ad units in AdSense dashboard
3. Copy the ad code
4. Paste in any slot in Admin Panel

---

## Admin Panel Setup

### Creating First Admin

```bash
# Deploy the create-admin edge function
npx supabase functions deploy create-admin

# Call it with your email
curl -X POST https://<project-id>.supabase.co/functions/v1/create-admin \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com", "password": "your-secure-password"}'
```

### Admin Panel Features

| Section | What You Can Do |
|---|---|
| 📊 Analytics | View total analyses, daily/weekly/monthly stats |
| 💰 Payments | Revenue stats, recent paid reports |
| ⚙️ Config | Payment gateway, pricing, WhatsApp number |
| 🔑 API Keys | Add/remove up to 10 keys per service with auto-failover |
| 📢 Ad Slots | Deploy/manage 30+ ad placements |
| 🎯 Behaviour | Configure popups, triggers, CTAs |
| 📈 Usage | Track API calls, costs, AI model usage |
| ⭐ Feedback | View user ratings and comments |
| 👑 Free Tools | Generate reports/SEO analysis without payment |

---

## Deployment Options

### Vercel (Recommended)

```json
// vercel.json (already included)
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

1. Import GitHub repo in Vercel
2. Add env vars in Vercel dashboard (only VITE_* vars needed)
3. Deploy automatically

### Netlify

1. Import repo → Build: `npm run build` → Publish: `dist`
2. `public/_redirects` already configured: `/* /index.html 200`
3. Add env vars in Netlify dashboard

### Cloudflare Pages

1. Connect GitHub → Build: `npm run build` → Output: `dist`
2. Add env vars in Cloudflare dashboard

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
Upload `dist/` folder contents. Ensure SPA routing redirects all paths to `index.html`.

---

## User Manual

### For End Users

1. **Analyze a Reel**: Paste an Instagram Reel URL → Click "Analyze" → Get viral score & insights
2. **Optional Details**: Add caption, hashtags, engagement metrics for better accuracy
3. **Master Report**: Pay ₹29 (or configured price) → Get detailed PDF report
4. **SEO Optimizer**: Enter a topic → Get hashtags, titles, posting times

### For Admins

1. Login at `/admin-login` with your admin credentials
2. **Dashboard**: View analytics, revenue, and user engagement
3. **API Keys**: Add multiple keys for uninterrupted service
4. **Payment Config**: Set gateway, pricing, currency
5. **Ad Management**: Deploy ads to 30+ slots across the site
6. **Behaviour Settings**: Configure user engagement triggers
7. **Free Tools**: Generate reports without payment for testing

### Language Support
- English & Hindi toggle available on homepage
- All analysis results support both languages

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|---|---|
| "No API keys configured" | Add Gemini keys in Admin Panel → API Keys Manager |
| "Payment gateway not configured" | Set Razorpay/Stripe keys in Admin Panel → Config |
| Rate limiting errors | Add more API keys (up to 10) for auto-failover |
| Analysis stuck | Check edge function logs in Supabase dashboard |
| Admin can't login | Ensure user has `admin` role in `user_roles` table |
| Blank analysis | Verify Gemini API key is valid and has quota |

### Edge Function Logs

```bash
npx supabase functions logs analyze-reel --follow
npx supabase functions logs generate-master-report --follow
npx supabase functions logs seo-analyze --follow
```

### Security Checklist

- ✅ No private keys in frontend code
- ✅ Payment keys stored in DB (admin-only RLS)
- ✅ API keys stored in DB with admin-only access
- ✅ Admin routes protected by role-based auth
- ✅ Edge functions validate authorization
- ✅ CORS headers configured
- ✅ Service role key never exposed to client
