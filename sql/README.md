# Genpulse Phase 1 ? SQL

## Apply

```bash
# Local Postgres
psql "$DATABASE_URL" -f sql/001_phase1_schema.sql
psql "$DATABASE_URL" -f sql/002_phase1_seed.sql

# Supabase SQL editor: paste 001 then 002 in order
```

## Files

| File | Purpose |
|---|---|
| `001_phase1_schema.sql` | Enums, 5 tables, FKs, triggers, indexes, dashboard view |
| `003_phase0_review_sales.sql` | Review gate (`content_tasks`) + CRM skeleton |
| `005_os_state_snapshot.sql` | Supabase snapshot table for Save / auto-persist (`os_state`) |



## Primary key chain

`knowledge_id` ? `topic_id` ? `content_id` ? `performance_events`

## Seed demo chain

- Topic: sleep / melatonin download angle (`b2000000-...-0001`)
- Content: TikTok published + LinkedIn approved
- Events: 12k impressions ? 340 clicks ? 46 installs ? 12 activations ? 4 uploads
