-- Optional CRM fields for Sales Tracking deals
-- Safe to run after sql/004_sales_tracking_deals.sql

BEGIN;

ALTER TABLE deals
  ADD COLUMN IF NOT EXISTS contact_info       text,
  ADD COLUMN IF NOT EXISTS city               text,
  ADD COLUMN IF NOT EXISTS address            text,
  ADD COLUMN IF NOT EXISTS last_contacted_on  date,
  ADD COLUMN IF NOT EXISTS recommendation_blocker text,
  ADD COLUMN IF NOT EXISTS expected_talk_at   text;

COMMENT ON COLUMN deals.contact_info IS 'Phone / email / WeChat ID etc.';
COMMENT ON COLUMN deals.city IS 'City of the account / contact';
COMMENT ON COLUMN deals.address IS 'Street address';
COMMENT ON COLUMN deals.last_contacted_on IS 'Date of most recent outreach or meeting';
COMMENT ON COLUMN deals.recommendation_blocker IS 'Blockers preventing recommendation / next step';
COMMENT ON COLUMN deals.expected_talk_at IS 'Expected next reachable / talk window';

CREATE INDEX IF NOT EXISTS idx_deals_city ON deals (city);
CREATE INDEX IF NOT EXISTS idx_deals_last_contacted ON deals (last_contacted_on);

COMMIT;
