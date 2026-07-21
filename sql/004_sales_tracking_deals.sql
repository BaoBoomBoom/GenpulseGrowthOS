-- =============================================================================
-- Align deals table with Sales Tracking spreadsheet columns
-- Source: https://docs.google.com/spreadsheets/d/1WI8DFBL6KxwmWDD2SD_mbPLpNlENQlpZ
-- Run after: sql/003_phase0_review_sales.sql
-- =============================================================================

BEGIN;

-- Sheet enums (Status × Stage are orthogonal — Won/Lost is not a stage)
DO $$ BEGIN
  CREATE TYPE deal_status AS ENUM ('Open', 'Lost', 'Won');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE deal_pipeline_stage AS ENUM (
    'Lead',
    'Qualified',
    'Demo',
    'Discovery',
    'Proposal',
    'Negotiations'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Expand deals to match spreadsheet field set
ALTER TABLE deals
  ADD COLUMN IF NOT EXISTS title              text,
  ADD COLUMN IF NOT EXISTS organization       text,
  ADD COLUMN IF NOT EXISTS contact_person     text,
  ADD COLUMN IF NOT EXISTS contact_on         text,
  ADD COLUMN IF NOT EXISTS status             deal_status NOT NULL DEFAULT 'Open',
  ADD COLUMN IF NOT EXISTS pipeline_stage     deal_pipeline_stage NOT NULL DEFAULT 'Lead',
  ADD COLUMN IF NOT EXISTS label              text,
  ADD COLUMN IF NOT EXISTS channel            text,
  ADD COLUMN IF NOT EXISTS product_name       text,
  ADD COLUMN IF NOT EXISTS product_quantity   numeric(14,2),
  ADD COLUMN IF NOT EXISTS product_amount     numeric(14,2),
  ADD COLUMN IF NOT EXISTS currency           text NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS lost_reason        text,
  ADD COLUMN IF NOT EXISTS closed_on          date;

-- Backfill title / organization from legacy columns when present
UPDATE deals
SET
  title = COALESCE(NULLIF(title, ''), product_line, 'Untitled deal'),
  organization = COALESCE(NULLIF(organization, ''), company_id::text)
WHERE title IS NULL OR organization IS NULL;

ALTER TABLE deals
  ALTER COLUMN title SET NOT NULL,
  ALTER COLUMN organization SET NOT NULL;

-- Prefer sheet stage enum going forward (keep legacy deal_stage for compat)
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals (status);
CREATE INDEX IF NOT EXISTS idx_deals_pipeline_stage ON deals (pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_deals_owner ON deals (owner);
CREATE INDEX IF NOT EXISTS idx_deals_channel ON deals (channel);
CREATE INDEX IF NOT EXISTS idx_deals_closed_on ON deals (closed_on);

COMMENT ON TABLE deals IS
  'Deal-centric CRM aligned to Sales Tracking sheet (Title, Value, Org, Contact, Owner, Status, Stage, Label, Channel, Product, Lost reason, Closed on)';

COMMIT;
