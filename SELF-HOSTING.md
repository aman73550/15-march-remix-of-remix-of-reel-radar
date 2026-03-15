# Self-Hosting Guide

## Prerequisites
- Node.js 18+ 
- npm or bun
- A Supabase project (free tier works)

## Quick Start

1. **Clone the repo**
   ```bash
   git clone <your-repo-url>
   cd <project-folder>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Supabase credentials:
   - `VITE_SUPABASE_URL` — Your Supabase project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY` — Your Supabase anon/public key
   - `VITE_SUPABASE_PROJECT_ID` — Your Supabase project ID

4. **Run database migrations**
   Import `database-setup.sql` into your Supabase project via the SQL editor.

5. **Set Edge Function Secrets**
   In Supabase Dashboard → Settings → Edge Functions → Secrets, add:
   - `ADMIN_EMAIL` — Your admin email address
   - `ADMIN_PASSWORD` — Your admin password
   - `GEMINI_API_KEY` or `GEMINI_API_KEYS` — AI provider key(s)
   - `FIRECRAWL_API_KEY` — (Optional) Web scraping

6. **Deploy Edge Functions**
   ```bash
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
   ```

7. **Create Admin User**
   ```bash
   curl -X POST https://<project-id>.supabase.co/functions/v1/create-admin \
     -H "Content-Type: application/json" \
     -d '{"secret_key": "setup-admin-73550"}'
   ```
   This creates the admin user using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from your edge function secrets.

8. **Run locally**
   ```bash
   npm run dev
   ```

9. **Build for production**
   ```bash
   npm run build
   ```
   Output will be in `dist/` folder.

---

## All Secrets & Keys Reference

### Frontend (.env file)

| Variable | Where to get |
|---|---|
| `VITE_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase → Settings → API → anon/public key |
| `VITE_SUPABASE_PROJECT_ID` | Supabase → Settings → General → Project ID |

### Backend Secrets (Supabase Dashboard → Edge Functions → Secrets)

| Secret | Where to get | Required? |
|---|---|---|
| `SUPABASE_URL` | Auto-provided by Supabase | ✅ Auto |
| `SUPABASE_ANON_KEY` | Auto-provided by Supabase | ✅ Auto |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-provided by Supabase | ✅ Auto |
| `SUPABASE_DB_URL` | Auto-provided by Supabase | ✅ Auto |
| `ADMIN_EMAIL` | Your admin login email | ✅ Required |
| `ADMIN_PASSWORD` | Your admin login password | ✅ Required |
| `FIRECRAWL_API_KEY` | [firecrawl.dev](https://firecrawl.dev) | Optional (improves scraping) |

### AI Provider (choose ONE — replace Lovable AI)

| Provider | Secret Name | Get from | Notes |
|---|---|---|---|
| Google Gemini (single) | `GEMINI_API_KEY` | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | Single API key |
| Google Gemini (multi) | `GEMINI_API_KEYS` | Same as above | Comma-separated keys, auto-failover on rate limits |
| OpenAI | `OPENAI_API_KEY` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) | Single key |

**To switch AI provider**, edit these files:
1. `supabase/functions/analyze-reel/index.ts`
2. `supabase/functions/generate-master-report/index.ts`
3. `supabase/functions/admin-ai-chat/index.ts`

Find and replace:
```
OLD: https://ai.gateway.lovable.dev/v1/chat/completions
NEW: <your chosen AI URL from table above>

OLD: LOVABLE_API_KEY
NEW: GEMINI_API_KEY  (or OPENAI_API_KEY)

OLD: model: "google/gemini-2.5-flash"
NEW: model: "gemini-2.5-flash"  (for Gemini) or "gpt-4o-mini" (for OpenAI)
```

### Admin Panel Configurable (Database → `site_config` table)

These are set from the Admin Panel UI at `/bosspage-login`, NOT in env files:

| Config Key | Description | Where to get |
|---|---|---|
| `payment_gateway` | `razorpay` or `stripe` | Choose one |
| `report_price` | Price (default: 29) | Your choice (shown dynamically in UI) |
| `currency` | `INR`, `USD`, etc. | Your choice |
| `razorpay_key_id` | `rzp_live_...` | [dashboard.razorpay.com](https://dashboard.razorpay.com) → Settings → API Keys |
| `razorpay_key_secret` | Secret key | Same Razorpay dashboard |
| `stripe_key` | `sk_live_...` | [dashboard.stripe.com](https://dashboard.stripe.com) → Developers → API Keys |
| `whatsapp_number` | `919876543210` (no +) | Your WhatsApp business number |

---

## All Pages & Routes

| Route | Description |
|---|---|
| `/` | Main Reel Analyzer tool (homepage) |
| `/seo-optimizer` | SEO optimization tool |
| `/reel-analyzer` | Reel Analyzer SEO landing page |
| `/instagram-reel-analyzer` | Instagram Reel Analyzer landing |
| `/reel-seo-optimizer` | Reel SEO Optimizer landing |
| `/reel-hashtag-generator` | Hashtag Generator tool page |
| `/reel-caption-generator` | Caption Generator tool page |
| `/reel-title-generator` | Title Generator tool page |
| `/reel-viral-checker` | Viral Checker tool page |
| `/reel-engagement-calculator` | Engagement Calculator tool page |
| `/blog` | Blog articles listing |
| `/blog/:slug` | Individual blog post |
| `/about` | About the platform |
| `/contact` | Contact form |
| `/partnership` | Partnership opportunities |
| `/collaboration` | Creator collaboration |
| `/promotion` | Advertising/promotion info |
| `/privacy-policy` | Privacy policy |
| `/terms` | Terms & conditions |
| `/sitemap-page` | HTML sitemap |
| `/bosspage-login` | Admin login (hidden) |
| `/bosspage` | Admin dashboard (hidden) |

---

## Payment System

### Supported Gateways
- **Razorpay** — Inline checkout (stays on page), signature verification via HMAC-SHA256
- **Stripe** — Redirect to Stripe Checkout, session verification via API
- **Manual/WhatsApp** — Fallback when no gateway configured

### Payment Flow

#### Razorpay Flow
1. `create-payment` → Creates Razorpay order via API → Returns `orderId` + `keyId`
2. Frontend opens Razorpay inline checkout
3. User pays → `verify-payment` verifies HMAC signature
4. On success → `generate-master-report` creates the premium PDF

#### Stripe Flow
1. `create-payment` → Creates Stripe Checkout Session → Returns `sessionUrl`
2. Frontend redirects to Stripe Checkout
3. After payment → User redirected back with `session_id`
4. Frontend calls `verify-payment` with `stripeSessionId`
5. Backend verifies session `payment_status === "paid"` via Stripe API
6. On success → `generate-master-report` creates the premium PDF

### Dynamic Pricing
The report price is fetched from `site_config` table and shown dynamically in the UI. Change it anytime from Admin Panel → Config without code changes.

---

## Security Features

### Rate Limiting
All edge functions enforce per-IP rate limits using the `rate_limits` database table:

| Function | Limit (per hour) |
|---|---|
| `analyze-reel` | 20 requests |
| `seo-analyze` | 15 requests |
| `create-payment` | 10 requests |
| `generate-master-report` | 5 requests |

### Input Validation
- **URL validation**: Only valid Instagram Reel URLs accepted (regex pattern matching)
- **SEO requests**: Prefixed with `seo:` for differentiation
- **Character limits**: URL (500), Caption (5000), Topic (1000)
- **Numeric validation**: Engagement metrics must be positive numbers

---

## Deploy Options

### Vercel (Recommended)
- Import GitHub repo → auto-detected as Vite project
- Add env vars in Vercel dashboard
- `vercel.json` is already configured

### Netlify
- Import repo → Build command: `npm run build` → Publish dir: `dist`
- `public/_redirects` already configured: `/* /index.html 200`

### Cloudflare Pages
- Connect GitHub → Build command: `npm run build` → Output: `dist`

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
Just upload the `dist/` folder contents. Ensure SPA routing redirects all paths to `index.html`.

---

## Setting up Admin

1. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` as edge function secrets in Supabase
2. Deploy the `create-admin` edge function
3. Call it with `{"secret_key": "setup-admin-73550"}` to create the admin user
4. Login at `/bosspage-login` with your credentials
5. Configure payment keys, WhatsApp number, API keys, and ad slots from the dashboard

## Super Admin AI Assistant

The admin panel includes a powerful AI assistant with **full system access**:

### Data Operations (All Tables)
- **Read** any table with filters, ordering, pagination
- **Write/Update/Delete** rows in any table
- **Aggregate** data (sum, avg, min, max) with filters
- **Count** rows with complex filter conditions

### System Diagnostics
- Complete system health check (all tables + critical configs)
- API error analysis with function-wise breakdown
- Rate limit monitoring — blocked IPs, usage vs limits
- API key health check (Gemini, OpenAI, Firecrawl, Razorpay, Stripe)

### Configuration Management
- Read/update any site_config value via natural language
- Reset configs to defaults
- Manage behaviour settings (triggers, overlays, limits)

### Ad Management
- List all ad slots with status
- Toggle slots on/off
- Update ad code and type (adsense/affiliate/custom)

### Revenue & Analytics
- Revenue reports by period with gateway breakdown
- Usage trends (daily/weekly)
- Top viral content rankings
- Payment order tracking (completed/pending/failed)

### Traffic Intelligence
- Real user vs bot detection
- Geographic distribution
- Device & browser analytics
- Referrer source tracking

### User Feedback
- Rating distribution analysis
- Recent comment review
- Trend identification

### Bulk Operations
- Clear rate limits (unblock stuck users)
- Reset configurations to defaults

Access via the ⚡ floating button on the admin dashboard. Supports Hindi/Hinglish.

## Notes
- The `lovable-tagger` dev dependency is optional and only used in Lovable's editor
- All Supabase config is via environment variables — no hardcoded values
- Payment keys are in the database (admin panel), NOT in env files for security
- Admin credentials are stored as edge function secrets, never in frontend code
- Admin route is hidden at `/bosspage-login` (not `/admin`)
- Report price is dynamic — fetched from database and displayed in real-time
- WhatsApp button appears on About, Contact, Partnership, Collaboration, and Promotion pages
