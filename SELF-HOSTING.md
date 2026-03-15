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

4. **Deploy Edge Functions**
   Install Supabase CLI and deploy:
   ```bash
   npx supabase login
   npx supabase link --project-ref <your-project-id>
   npx supabase functions deploy analyze-reel
   npx supabase functions deploy generate-master-report
   npx supabase functions deploy create-payment
   npx supabase functions deploy verify-payment
   npx supabase functions deploy check-reel-date
   npx supabase functions deploy create-admin
   ```

5. **Run locally**
   ```bash
   npm run dev
   ```

6. **Build for production**
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
| `FIRECRAWL_API_KEY` | [firecrawl.dev](https://firecrawl.dev) | Optional (improves scraping) |

### AI Provider (choose ONE — replace Lovable AI)

| Provider | Secret Name | Get from | Notes |
|---|---|---|---|
| Google Gemini (single) | `GEMINI_API_KEY` | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | Single API key |
| Google Gemini (multi) | `GEMINI_API_KEYS` | Same as above | Comma-separated keys, auto-failover on rate limits |
| OpenAI | `OPENAI_API_KEY` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) | Single key |

**To switch AI provider**, edit these 2 files:
1. `supabase/functions/analyze-reel/index.ts`
2. `supabase/functions/generate-master-report/index.ts`

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

These are set from the Admin Panel UI at `/admin`, NOT in env files:

| Config Key | Description | Where to get |
|---|---|---|
| `payment_gateway` | `razorpay` or `stripe` | Choose one |
| `report_price` | Price in ₹ (default: 29) | Your choice |
| `currency` | `INR` | Your choice |
| `razorpay_key_id` | `rzp_live_...` | [dashboard.razorpay.com](https://dashboard.razorpay.com) → Settings → API Keys |
| `razorpay_key_secret` | Secret key | Same Razorpay dashboard |
| `stripe_key` | `sk_live_...` | [dashboard.stripe.com](https://dashboard.stripe.com) → Developers → API Keys |
| `whatsapp_number` | `919876543210` (no +) | Your WhatsApp business number |

---

## Deploy Options

### Vercel (Recommended)
- Import GitHub repo → auto-detected as Vite project
- Add env vars in Vercel dashboard
- `vercel.json` is already configured

### Netlify
- Import repo → Build command: `npm run build` → Publish dir: `dist`
- Add `_redirects` file in `public/`: `/* /index.html 200`

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

1. Deploy the `create-admin` edge function
2. Call it with your email to create admin user
3. Login at `/bosspage-login`
4. Configure payment keys, WhatsApp number, ad slots from the dashboard

## Notes
- The `lovable-tagger` dev dependency is optional and only used in Lovable's editor
- All Supabase config is via environment variables — no hardcoded values
- Payment keys are in the database (admin panel), NOT in env files for security
