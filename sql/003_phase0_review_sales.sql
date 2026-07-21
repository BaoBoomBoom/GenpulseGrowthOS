-- =============================================================================
-- Genpulse AMOS + SAOS — Phase 0 schema extensions
-- Review gate state machine + CRM objects (local / HubSpot-ready)
-- Run after: sql/001_phase1_schema.sql
-- =============================================================================

BEGIN;

-- Content task lifecycle (hard gate: no publish without approved)
CREATE TYPE content_task_status AS ENUM (
  'draft',
  'in_review',
  'approved',
  'rejected',
  'scheduled',
  'published',
  'archived'
);

CREATE TYPE icp_type AS ENUM (
  'pharma_rd',
  'cosmetics_brand',
  'indie_brand',
  'salon_clinic'
);

CREATE TYPE lead_status AS ENUM (
  'new',
  'enriched',
  'scored',
  'routed',
  'contacted',
  'replied',
  'qualified',
  'disqualified'
);

CREATE TYPE deal_stage AS ENUM (
  'discovery',
  'qualified',
  'proposal',
  'negotiation',
  'won',
  'lost'
);

CREATE TYPE activity_type AS ENUM (
  'email',
  'call',
  'meeting',
  'note',
  'outreach_draft'
);

CREATE TYPE actor_type AS ENUM (
  'agent',
  'human'
);

-- Content tasks feeding review gate + publish
CREATE TABLE content_tasks (
  task_id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id            text NOT NULL,
  channel             text NOT NULL,
  topic               text NOT NULL,
  status              content_task_status NOT NULL DEFAULT 'draft',
  health_claim_flag   boolean NOT NULL DEFAULT false,
  health_claim_detail text,
  draft_content       jsonb NOT NULL DEFAULT '{}'::jsonb,
  brand_tone_score    numeric(5,2),
  database_entry_id   text,
  scheduled_at        timestamptz,
  reviewed_by         text,
  reviewed_at         timestamptz,
  review_notes        text,
  published_at        timestamptz,
  publish_url         text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT content_tasks_topic_nonempty CHECK (length(trim(topic)) > 0),
  -- Hard gate: published requires approved (or scheduled?published after approve)
  CONSTRAINT content_tasks_publish_requires_approval CHECK (
    status <> 'published'
    OR reviewed_at IS NOT NULL
  )
);

CREATE INDEX idx_content_tasks_status ON content_tasks (status);
CREATE INDEX idx_content_tasks_brand ON content_tasks (brand_id);
CREATE INDEX idx_content_tasks_health ON content_tasks (health_claim_flag)
  WHERE health_claim_flag = true;
CREATE INDEX idx_content_tasks_review_queue
  ON content_tasks (status, health_claim_flag, created_at DESC);

CREATE OR REPLACE FUNCTION enforce_content_task_transitions()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Cannot jump to published from draft/in_review/rejected
  IF NEW.status = 'published' AND OLD.status NOT IN ('approved', 'scheduled', 'published') THEN
    RAISE EXCEPTION 'content_tasks: publish blocked — status must be approved/scheduled first (hard gate)';
  END IF;
  IF NEW.status = 'approved' AND OLD.status NOT IN ('in_review', 'approved') THEN
    RAISE EXCEPTION 'content_tasks: approve only from in_review';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_content_tasks_transitions
  BEFORE UPDATE ON content_tasks
  FOR EACH ROW
  EXECUTE PROCEDURE enforce_content_task_transitions();

-- CRM
CREATE TABLE companies (
  company_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  industry     text,
  size_band    text,
  icp_type     icp_type NOT NULL,
  website      text,
  notes        text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE leads (
  lead_id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      uuid REFERENCES companies(company_id) ON DELETE SET NULL,
  full_name       text NOT NULL,
  title           text,
  email           text,
  icp_type        icp_type NOT NULL,
  source_channel  text,
  score           numeric(5,2) NOT NULL DEFAULT 0,
  status          lead_status NOT NULL DEFAULT 'new',
  research_summary text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE deals (
  deal_id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id              uuid NOT NULL REFERENCES companies(company_id) ON DELETE RESTRICT,
  product_line            text NOT NULL,
  stage                   deal_stage NOT NULL DEFAULT 'discovery',
  amount                  numeric(14,2),
  content_attribution_id  text,
  owner                   text,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE activities (
  activity_id  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id      uuid REFERENCES leads(lead_id) ON DELETE CASCADE,
  deal_id      uuid REFERENCES deals(deal_id) ON DELETE CASCADE,
  type         activity_type NOT NULL,
  content      text NOT NULL,
  created_by   actor_type NOT NULL DEFAULT 'agent',
  created_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT activities_has_parent CHECK (lead_id IS NOT NULL OR deal_id IS NOT NULL)
);

CREATE TABLE proposals (
  proposal_id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id          uuid NOT NULL REFERENCES deals(deal_id) ON DELETE CASCADE,
  version          int NOT NULL DEFAULT 1,
  pricing_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  status           text NOT NULL DEFAULT 'draft',
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_leads_status ON leads (status);
CREATE INDEX idx_leads_score ON leads (score DESC);
CREATE INDEX idx_deals_stage ON deals (stage);
CREATE INDEX idx_companies_icp ON companies (icp_type);

COMMIT;
