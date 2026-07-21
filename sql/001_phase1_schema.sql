-- =============================================================================
-- Genpulse Growth OS  Phase 1 MVP
-- Executable Postgres schema: enums, tables, FKs, indexes, seed data
-- Compatible with: Postgres 14+ / Supabase
-- PRD: docs/Genpulse_Phase1_MVP_PRD.md
-- =============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- gen_random_uuid()

-- -----------------------------------------------------------------------------
-- 1. ENUMS
-- -----------------------------------------------------------------------------

CREATE TYPE knowledge_type AS ENUM (
  'research',
  'product',
  'brand',
  'founder'
);

CREATE TYPE brand_scope AS ENUM (
  'Genpulse',
  'Lushair',
  'CEO',
  'universal'
);

-- Topics / content brand (no universal  content always belongs to an IP)
CREATE TYPE brand_ip AS ENUM (
  'Genpulse',
  'Lushair',
  'CEO'
);

CREATE TYPE evidence_level AS ENUM (
  'high',
  'medium',
  'low',
  'narrative'
);

CREATE TYPE knowledge_status AS ENUM (
  'active',
  'archived'
);

CREATE TYPE topic_status AS ENUM (
  'backlog',
  'selected',
  'produced',
  'published',
  'archived'
);

CREATE TYPE content_platform AS ENUM (
  'TikTok',
  'Instagram',
  'X',
  'LinkedIn'
);

CREATE TYPE content_type AS ENUM (
  'video',
  'carousel',
  'thread',
  'post'
);

CREATE TYPE content_status AS ENUM (
  'draft',
  'approved',
  'published',
  'archived'
);

CREATE TYPE performance_event_type AS ENUM (
  'impression',
  'click',
  'install',
  'signup',
  'activation',
  'upload'
);

-- -----------------------------------------------------------------------------
-- 2. TABLES
-- -----------------------------------------------------------------------------

-- 2.1 knowledge_items
CREATE TABLE knowledge_items (
  knowledge_id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title               text NOT NULL,
  type                knowledge_type NOT NULL,
  brand               brand_scope NOT NULL,
  topic_tags          text[] NOT NULL DEFAULT '{}',
  summary             text NOT NULL,
  key_claims          text[] NOT NULL DEFAULT '{}',
  evidence_level      evidence_level NOT NULL,
  source_url          text,
  usable_formats      text[] NOT NULL DEFAULT '{}',
  audience_tags       text[] NOT NULL DEFAULT '{}',
  safety_notes        text,
  body                text,
  status              knowledge_status NOT NULL DEFAULT 'active',
  last_reviewed_at    timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT knowledge_items_title_nonempty CHECK (length(trim(title)) > 0),
  CONSTRAINT knowledge_items_summary_nonempty CHECK (length(trim(summary)) > 0),
  CONSTRAINT knowledge_items_tags_nonempty CHECK (cardinality(topic_tags) > 0)
);

COMMENT ON TABLE knowledge_items IS 'Structured knowledge callable by Topic Engine & Content Generator';
COMMENT ON COLUMN knowledge_items.usable_formats IS 'Allowed values conceptually: TikTok, Instagram, X, LinkedIn';

-- 2.2 topics
CREATE TABLE topics (
  topic_id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title                 text NOT NULL,
  core_angle            text NOT NULL,
  objective             text NOT NULL,
  brand                 brand_ip NOT NULL,
  platform              text[] NOT NULL DEFAULT '{}',
  audience              text,
  source_knowledge_ids  uuid[] NOT NULL DEFAULT '{}',
  evidence_level        evidence_level NOT NULL,
  format_hint           text,
  hook_candidates       text[] NOT NULL DEFAULT '{}',
  cta_type              text NOT NULL,
  priority_score        numeric(5,2) NOT NULL DEFAULT 50.00,
  status                topic_status NOT NULL DEFAULT 'backlog',
  week_key              text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT topics_title_nonempty CHECK (length(trim(title)) > 0),
  CONSTRAINT topics_core_angle_nonempty CHECK (length(trim(core_angle)) > 0),
  CONSTRAINT topics_platform_nonempty CHECK (cardinality(platform) > 0),
  CONSTRAINT topics_knowledge_nonempty CHECK (cardinality(source_knowledge_ids) > 0),
  CONSTRAINT topics_priority_range CHECK (priority_score >= 0 AND priority_score <= 100)
);

COMMENT ON TABLE topics IS 'Prioritized topic cards; source_knowledge_ids links to knowledge_items';
COMMENT ON COLUMN topics.priority_score IS 'objective_fit*0.30 + brand_fit*0.20 + platform_fit*0.15 + evidence*0.15 + hist*0.20';

-- Array FK not native; enforce via trigger
CREATE OR REPLACE FUNCTION validate_topic_knowledge_ids()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  missing_count int;
BEGIN
  SELECT count(*) INTO missing_count
  FROM unnest(NEW.source_knowledge_ids) AS kid
  WHERE NOT EXISTS (
    SELECT 1 FROM knowledge_items k WHERE k.knowledge_id = kid
  );

  IF missing_count > 0 THEN
    RAISE EXCEPTION 'topics.source_knowledge_ids contains % unknown knowledge_id(s)', missing_count;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_topics_validate_knowledge
  BEFORE INSERT OR UPDATE OF source_knowledge_ids ON topics
  FOR EACH ROW
  EXECUTE PROCEDURE validate_topic_knowledge_ids();

-- 2.3 content_assets
CREATE TABLE content_assets (
  content_id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id              uuid NOT NULL REFERENCES topics(topic_id) ON DELETE RESTRICT,
  brand                 brand_ip NOT NULL,
  platform              content_platform NOT NULL,
  content_type          content_type NOT NULL,
  title                 text NOT NULL,
  script_or_copy        jsonb NOT NULL DEFAULT '{}'::jsonb,
  hook                  text,
  cta                   text NOT NULL,
  source_knowledge_ids  uuid[] NOT NULL DEFAULT '{}',
  tracking_params       jsonb NOT NULL DEFAULT '{}'::jsonb,
  status                content_status NOT NULL DEFAULT 'draft',
  publish_url           text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  approved_at           timestamptz,
  published_at          timestamptz,

  CONSTRAINT content_assets_title_nonempty CHECK (length(trim(title)) > 0),
  CONSTRAINT content_assets_cta_nonempty CHECK (length(trim(cta)) > 0),
  CONSTRAINT content_assets_knowledge_nonempty CHECK (cardinality(source_knowledge_ids) > 0),
  CONSTRAINT content_assets_published_requires_tracking CHECK (
    status <> 'published'
    OR (
      tracking_params ? 'content_id'
      AND tracking_params ? 'topic_id'
      AND tracking_params ? 'brand'
      AND tracking_params ? 'platform'
    )
  ),
  CONSTRAINT content_assets_platform_type_match CHECK (
    (platform = 'TikTok'     AND content_type = 'video')
    OR (platform = 'Instagram' AND content_type = 'carousel')
    OR (platform = 'X'         AND content_type = 'thread')
    OR (platform = 'LinkedIn'  AND content_type = 'post')
  )
);

CREATE OR REPLACE FUNCTION validate_content_knowledge_ids()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  missing_count int;
BEGIN
  SELECT count(*) INTO missing_count
  FROM unnest(NEW.source_knowledge_ids) AS kid
  WHERE NOT EXISTS (
    SELECT 1 FROM knowledge_items k WHERE k.knowledge_id = kid
  );

  IF missing_count > 0 THEN
    RAISE EXCEPTION 'content_assets.source_knowledge_ids contains % unknown knowledge_id(s)', missing_count;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_content_validate_knowledge
  BEFORE INSERT OR UPDATE OF source_knowledge_ids ON content_assets
  FOR EACH ROW
  EXECUTE PROCEDURE validate_content_knowledge_ids();

-- Keep tracking_params in sync
CREATE OR REPLACE FUNCTION sync_content_tracking_params()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.tracking_params := coalesce(NEW.tracking_params, '{}'::jsonb)
    || jsonb_build_object(
      'content_id', NEW.content_id::text,
      'topic_id',   NEW.topic_id::text,
      'brand',      NEW.brand::text,
      'platform',   NEW.platform::text
    );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_content_sync_tracking
  BEFORE INSERT OR UPDATE OF topic_id, brand, platform, status ON content_assets
  FOR EACH ROW
  EXECUTE PROCEDURE sync_content_tracking_params();

-- 2.4 published_posts
CREATE TABLE published_posts (
  publish_id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id      uuid NOT NULL REFERENCES content_assets(content_id) ON DELETE RESTRICT,
  platform        content_platform NOT NULL,
  published_at    timestamptz NOT NULL DEFAULT now(),
  url             text NOT NULL,
  campaign_tag    text,
  created_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT published_posts_url_nonempty CHECK (length(trim(url)) > 0)
);

-- 2.5 performance_events
CREATE TABLE performance_events (
  event_id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id      uuid NOT NULL REFERENCES content_assets(content_id) ON DELETE RESTRICT,
  topic_id        uuid NOT NULL REFERENCES topics(topic_id) ON DELETE RESTRICT,
  brand           brand_ip NOT NULL,
  platform        content_platform NOT NULL,
  event_type      performance_event_type NOT NULL,
  value           numeric(14,4) NOT NULL DEFAULT 1,
  event_date      date NOT NULL DEFAULT (CURRENT_DATE),
  campaign_tag    text,
  raw_payload     jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT performance_events_value_positive CHECK (value > 0)
);

-- -----------------------------------------------------------------------------
-- 3. updated_at helper
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_knowledge_updated_at
  BEFORE UPDATE ON knowledge_items
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TRIGGER trg_topics_updated_at
  BEFORE UPDATE ON topics
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TRIGGER trg_content_updated_at
  BEFORE UPDATE ON content_assets
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- -----------------------------------------------------------------------------
-- 4. INDEXES
-- -----------------------------------------------------------------------------

CREATE INDEX idx_knowledge_type ON knowledge_items (type);
CREATE INDEX idx_knowledge_brand ON knowledge_items (brand);
CREATE INDEX idx_knowledge_status ON knowledge_items (status);
CREATE INDEX idx_knowledge_evidence ON knowledge_items (evidence_level);
CREATE INDEX idx_knowledge_topic_tags ON knowledge_items USING gin (topic_tags);
CREATE INDEX idx_knowledge_audience_tags ON knowledge_items USING gin (audience_tags);
CREATE INDEX idx_knowledge_usable_formats ON knowledge_items USING gin (usable_formats);
CREATE INDEX idx_knowledge_reviewed_at ON knowledge_items (last_reviewed_at DESC NULLS LAST);

CREATE INDEX idx_topics_status ON topics (status);
CREATE INDEX idx_topics_brand ON topics (brand);
CREATE INDEX idx_topics_objective ON topics (objective);
CREATE INDEX idx_topics_week_key ON topics (week_key);
CREATE INDEX idx_topics_priority ON topics (priority_score DESC);
CREATE INDEX idx_topics_platform ON topics USING gin (platform);
CREATE INDEX idx_topics_source_knowledge ON topics USING gin (source_knowledge_ids);
CREATE INDEX idx_topics_status_priority ON topics (status, priority_score DESC);

CREATE INDEX idx_content_topic_id ON content_assets (topic_id);
CREATE INDEX idx_content_brand ON content_assets (brand);
CREATE INDEX idx_content_platform ON content_assets (platform);
CREATE INDEX idx_content_status ON content_assets (status);
CREATE INDEX idx_content_published_at ON content_assets (published_at DESC NULLS LAST);
CREATE INDEX idx_content_source_knowledge ON content_assets USING gin (source_knowledge_ids);
CREATE INDEX idx_content_tracking_params ON content_assets USING gin (tracking_params);
CREATE UNIQUE INDEX uq_content_topic_platform
  ON content_assets (topic_id, platform)
  WHERE status <> 'archived';

CREATE INDEX idx_published_content_id ON published_posts (content_id);
CREATE INDEX idx_published_platform ON published_posts (platform);
CREATE INDEX idx_published_at ON published_posts (published_at DESC);
CREATE INDEX idx_published_campaign ON published_posts (campaign_tag);

CREATE INDEX idx_events_content_id ON performance_events (content_id);
CREATE INDEX idx_events_topic_id ON performance_events (topic_id);
CREATE INDEX idx_events_brand ON performance_events (brand);
CREATE INDEX idx_events_platform ON performance_events (platform);
CREATE INDEX idx_events_type ON performance_events (event_type);
CREATE INDEX idx_events_date ON performance_events (event_date DESC);
CREATE INDEX idx_events_campaign ON performance_events (campaign_tag);
CREATE INDEX idx_events_dashboard
  ON performance_events (event_date, brand, platform, event_type);
CREATE INDEX idx_events_topic_type_date
  ON performance_events (topic_id, event_type, event_date);

-- -----------------------------------------------------------------------------
-- 5. DASHBOARD HELPER VIEW
-- -----------------------------------------------------------------------------

CREATE OR REPLACE VIEW v_content_performance_weekly AS
SELECT
  date_trunc('week', e.event_date::timestamptz)::date AS week_start,
  e.topic_id,
  t.title AS topic_title,
  e.brand,
  e.platform,
  e.content_id,
  c.title AS content_title,
  e.event_type,
  sum(e.value) AS total_value
FROM performance_events e
JOIN topics t ON t.topic_id = e.topic_id
JOIN content_assets c ON c.content_id = e.content_id
GROUP BY 1, 2, 3, 4, 5, 6, 7, 8;

COMMIT;
