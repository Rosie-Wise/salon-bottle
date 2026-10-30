# RAD — Salon Bottle Platform

Premium AI-powered salon label customization and ordering platform. Salons upload their logo, receive three structured SVG label designs, refine them with AI chat, approve artwork, and submit orders that sync to Microsoft Excel.

## Quick start (demo mode)

No credentials are required to run locally in **demo mode**. Orders persist to `.data/orders.json`, logo uploads return inline data URLs, and AI routes use offline heuristics when `OPENAI_API_KEY` is unset.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Copy `.env.example` to `.env.local` and fill in values as needed:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (browser + server session) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only admin operations (never expose client-side) |
| `OPENAI_API_KEY` | Logo analysis and natural-language design edits |
| `MS_TENANT_ID`, `MS_CLIENT_ID`, `MS_CLIENT_SECRET` | Microsoft Graph app registration |
| `MS_DRIVE_ID` or `MS_SITE_ID` | Target document library |
| `MS_WORKBOOK_PATH` | Path to workbook (e.g. `/Salon Bottle Orders.xlsx`) |
| `NEXT_PUBLIC_APP_URL` | Canonical app URL for links and callbacks |
| `ADMIN_EMAILS` | Comma-separated emails treated as admins (plus `profiles.role = admin`) |

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Run the migration in `supabase/migrations/001_initial_schema.sql` via the SQL editor or Supabase CLI.
3. Enable Email auth (or your preferred provider) under Authentication.
4. Add the three Supabase keys to `.env.local`.
5. Storage buckets `logos` and `stickers` are created by the migration (private).
6. Promote an admin: update `profiles.role` to `admin` for your user, or list your email in `ADMIN_EMAILS`.

## OpenAI setup

1. Create an API key at [platform.openai.com](https://platform.openai.com).
2. Set `OPENAI_API_KEY` in `.env.local`.
3. Without a key, `/api/ai/analyze` and `/api/ai/customize` still work using built-in fallbacks (`openAiConfigured: false` in responses).

## Microsoft Graph / Excel setup

1. Register an app in Azure AD with **Application** permission `Files.ReadWrite.All` (admin consent).
2. Set `MS_TENANT_ID`, `MS_CLIENT_ID`, `MS_CLIENT_SECRET`.
3. Set `MS_DRIVE_ID` (document library drive) or `MS_SITE_ID`.
4. Upload or create **Salon Bottle Orders** workbook at `MS_WORKBOOK_PATH` with an Excel table named **Orders** and headers matching `src/lib/excel/graph-client.ts` (`EXCEL_ORDER_COLUMNS`).
5. Call `GET /api/excel/sync` to verify configuration; `POST /api/excel/sync` (admin) processes pending jobs.

When Graph is not configured, orders still save; sync jobs remain pending/failed with `excelConfigured: false`.

## API overview

| Route | Description |
|-------|-------------|
| `POST /api/ai/analyze` | Logo → brand palette |
| `POST /api/ai/generate` | Brand → three starter designs |
| `POST /api/ai/customize` | NL message → design patch |
| `POST /api/logos/upload` | Logo file (5MB max; SVG sanitized) |
| `GET/POST /api/orders` | List / create orders |
| `GET/PATCH /api/orders/[id]` | Order detail; admin status updates |
| `GET/POST /api/excel/sync` | Sync job status / process queue |
| `GET /api/print/[designId]` | Production proof SVG (`?format=svg\|png\|pdf`) |
| `GET /api/admin/stats` | Dashboard metrics |
| `GET /api/admin/customers` | Customer directory |

## Deploy on Vercel

1. Push the repo to GitHub and import the project in [Vercel](https://vercel.com).
2. Add all environment variables from `.env.example` in Project Settings → Environment Variables.
3. Set `NEXT_PUBLIC_APP_URL` to your production domain.
4. Run Supabase migration against your production database.
5. Optionally configure a Vercel Cron job to `POST /api/excel/sync` with an admin session or protect it via secret header (extend as needed).

## Local data

Demo orders and sync jobs are stored under `.data/` (gitignored). Do not commit `.env.local` or service role keys.
