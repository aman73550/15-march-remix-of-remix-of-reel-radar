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
| `report_price` | Price in ₹ (default: 29) | Your choice |
| `currency` | `INR` | Your choice |
| `razorpay_key_id` | `rzp_live_...` | [dashboard.razorpay.com](https://dashboard.razorpay.com) → Settings → API Keys |
| `razorpay_key_secret` | Secret key | Same Razorpay dashboard |
| `stripe_key` | `sk_live_...` | [dashboard.stripe.com](https://dashboard.stripe.com) → Developers → API Keys |
| `whatsapp_number` | `919876543210` (no +) | Your WhatsApp business number |

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
- **Character limits**: URL (500), Caption (5000), Topic (1000)
- **Numeric validation**: Engagement metrics must be positive numbers
- **Sanitization**: All inputs trimmed and validated before processing

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

## Admin AI Assistant

The admin panel includes a built-in AI chatbot that can:
- Check system status, API health, and revenue stats
- Update site configuration via natural language
- Toggle ad slots on/off
- Query database analytics
- Troubleshoot common issues

Access it via the floating chat button on the admin dashboard.

## Notes
- The `lovable-tagger` dev dependency is optional and only used in Lovable's editor
- All Supabase config is via environment variables — no hardcoded values
- Payment keys are in the database (admin panel), NOT in env files for security
- Admin credentials are stored as edge function secrets, never in frontend code
- Admin route is hidden at `/bosspage-login` (not `/admin`)
