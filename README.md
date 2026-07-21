# Genpulse Growth OS

AMOS + SAOS operating system for Genpulse / Lushair content, review, and sales.

## What's included

| Path | Purpose |
|---|---|
| `web/` | Vite + React UI (Content, Agents, Review gate, Sales CRM, Brands) |
| `sql/` | Postgres schemas (Phase 1 content loop + Phase 0 review/sales + Sales Tracking deals) |
| `docs/` | PRDs (Phase 1 MVP, AMOS+SAOS) |

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

## Product surfaces

- **Content** — database + calendar
- **Agents** — Scientist / Creative Director / Growth Manager
- **Review** — hard publish gate (`health_claim_flag`, approve before publish)
- **Sales** — deal CRM aligned to Sales Tracking sheet (pipeline + editable fields)
- **Brands** — brand matrix + platform strategy / weekly frequency

Human-in-the-loop: no auto-publish, no auto-send outreach.
