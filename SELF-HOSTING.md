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
   npx supabase functions deploy check-reel-date
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

## Deploy Options

### Vercel
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

## Edge Functions
The `supabase/functions/` directory contains backend functions. Deploy them to your own Supabase project using the Supabase CLI.

## Notes
- The `lovable-tagger` dev dependency is optional and only used in Lovable's editor. It's safely ignored in production builds.
- All Supabase config is via environment variables — no hardcoded values.
