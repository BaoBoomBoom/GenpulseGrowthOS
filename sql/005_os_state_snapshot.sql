-- =============================================================================
-- OS editable-state snapshot (for Vercel + Supabase persistence)
-- Run in Supabase SQL Editor after linking the project.
-- =============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS os_state (
  id          text PRIMARY KEY DEFAULT 'default',
  payload     jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE os_state IS
  'Full Genpulse Growth OS editable snapshot (deals, content DB, review tasks, …)';

ALTER TABLE os_state ENABLE ROW LEVEL SECURITY;

-- No anon/authenticated policies: only service_role (server) can read/write.
DROP POLICY IF EXISTS os_state_service_all ON os_state;

COMMIT;
