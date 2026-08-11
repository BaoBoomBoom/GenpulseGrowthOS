# Genpulse Growth OS

AMOS + SAOS operating system for Genpulse / Lushair content, review, and sales.

**操作手册（中文）**：[docs/Genpulse_Growth_OS_操作手册.md](docs/Genpulse_Growth_OS_操作手册.md)

**内容发布平台顺序（OS 约定）**：TikTok → Instagram → X → LinkedIn → Pinterest → Newsletter  
（Home / Brands / Content / Creative / Calendar 界面均有编号标注）

## What's included

| Path | Purpose |
|---|---|
| `web/` | Vite + React UI (Content, Agents, Review gate, Sales CRM, Brands) |
| `sql/` | Postgres schemas (Phase 1 content loop + Phase 0 review/sales + Sales Tracking deals) |
| `docs/` | PRDs + Chinese ops manual |

## Deploy on Vercel

The Vite app lives in **`web/`** (repo root has no `package.json`).

In the Vercel project:

1. **Root Directory** → `web`
2. Framework Preset → Vite (auto)
3. Build Command → `npm run build`
4. Output Directory → `dist`
5. If the GitHub repo is **private**, grant Vercel access to `BaoBoomBoom/GenpulseGrowthOS`

A root `vercel.json` is also present so default imports without Root Directory still build from `web/`.

SPA routes are rewritten to `index.html` via `web/vercel.json`.

## Quick start (UI)

```bash
cd web
npm install
npm run dev -- --host 127.0.0.1 --port 5190
```

Open http://127.0.0.1:5190/

## SQL

```bash
psql "$DATABASE_URL" -f sql/001_phase1_schema.sql
psql "$DATABASE_URL" -f sql/002_phase1_seed.sql
psql "$DATABASE_URL" -f sql/003_phase0_review_sales.sql
psql "$DATABASE_URL" -f sql/004_sales_tracking_deals.sql
```

See `sql/README.md` for details.



## Supabase + Edge Config (Vercel Storage)

You linked:

- **Supabase** → durable Save / auto-persist target  
- **Edge Config** (`genpulse-growth-os-global-config`) → optional flags / global config  

### 1. Create the snapshot table

In Supabase → SQL Editor, run:

`sql/005_os_state_snapshot.sql`

### 2. Confirm env on Vercel

Storage integrations should inject at least:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_ANON_KEY` for first test)
- `EDGE_CONFIG`

Redeploy after linking. Then open `/api/health` — expect `"storage":"supabase"` and `"durable":true`.

### 3. Local with the same DB

```bash
vercel env pull .env.local   # from linked project
npm run start:api            # uses Supabase when env present
```


## Persistence (backend save)

Editable OS state (Content Database, Calendar, Review tasks, Sales deals, Agents outputs, etc.) is persisted via:

- **API**: `GET/PUT /api/state` (+ `GET /api/health`)
- **Local server**: `data/os-store.json` (run API on port 8787)
- **Browser mirror**: `localStorage` fallback if API is offline
- **UI**: top-bar **Save** button; edits auto-save ~700ms after change

```bash
# terminal 1 — API
npm run start:api

# terminal 2 — UI (proxies /api → 8787)
cd web && npm run dev -- --host 127.0.0.1 --port 5190

# or both:
npm run dev:all
```

On Vercel, `/api/state` and `/api/health` serverless routes are included (ephemeral `/tmp` storage unless you later attach Postgres/Blob).

## Product surfaces

- **Content** — database + calendar
- **Agents** — Scientist / Creative Director / Growth Manager
- **Review** — hard publish gate (`health_claim_flag`, approve before publish)
- **Sales** — deal CRM aligned to Sales Tracking sheet (pipeline + editable fields)
- **Brands** — brand matrix + publish order + platform strategy / weekly frequency

Human-in-the-loop: no auto-publish, no auto-send outreach.
