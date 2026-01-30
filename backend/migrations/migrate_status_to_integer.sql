-- Migration script: Convert status enum to integer and add lead_status for workflow tracking
-- Run this script after updating the SQLAlchemy models
--
-- For pre_leads table:
--   status: 0 = active, 1 = discarded
--   lead_status: new, contacted, validated, etc. (workflow tracking)
--
-- For leads table:
--   status: 0 = active, 1 = discarded
--   lead_status: new, contacted, qualified, proposal_sent, negotiation, won, lost (workflow tracking)

-- =====================================================
-- PRE_LEADS TABLE MIGRATION
-- =====================================================

-- Step 1: Add a temporary column for the new integer status
ALTER TABLE pre_leads ADD COLUMN status_new INTEGER DEFAULT 0;

-- Step 2: Migrate existing status values to integer
-- Active/New/Contacted status -> 0 (active)
UPDATE pre_leads SET status_new = 0 WHERE status::text IN ('new', 'contacted', 'validated', 'active');

-- Discarded status -> 1 (discarded)
UPDATE pre_leads SET status_new = 1 WHERE status::text = 'discarded';

-- Step 3: Copy workflow status to lead_status if not already set
UPDATE pre_leads SET lead_status = status::text WHERE lead_status IS NULL AND status::text IN ('new', 'contacted', 'validated');

-- Step 4: Drop the old status column and rename the new one
ALTER TABLE pre_leads DROP COLUMN status;
ALTER TABLE pre_leads RENAME COLUMN status_new TO status;

-- Step 5: Set NOT NULL constraint and default
ALTER TABLE pre_leads ALTER COLUMN status SET NOT NULL;
ALTER TABLE pre_leads ALTER COLUMN status SET DEFAULT 0;

-- =====================================================
-- LEADS TABLE MIGRATION
-- =====================================================

-- Step 1: Add lead_status column if not exists
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_status VARCHAR(50) DEFAULT 'new';

-- Step 2: Add a temporary column for the new integer status
ALTER TABLE leads ADD COLUMN status_new INTEGER DEFAULT 0;

-- Step 3: Migrate existing status values
-- Copy workflow status to lead_status
UPDATE leads SET lead_status = status::text WHERE lead_status IS NULL OR lead_status = 'new';

-- Active statuses -> 0
UPDATE leads SET status_new = 0 WHERE status::text IN ('new', 'contacted', 'qualified', 'proposal_sent', 'negotiation', 'won');

-- Lost/Discarded status -> 1
UPDATE leads SET status_new = 1 WHERE status::text = 'lost';

-- Step 4: Drop the old status column and rename the new one
ALTER TABLE leads DROP COLUMN status;
ALTER TABLE leads RENAME COLUMN status_new TO status;

-- Step 5: Set NOT NULL constraint and default
ALTER TABLE leads ALTER COLUMN status SET NOT NULL;
ALTER TABLE leads ALTER COLUMN status SET DEFAULT 0;

-- =====================================================
-- CLEANUP: Drop old enum types if they exist
-- =====================================================
DROP TYPE IF EXISTS preleadstatus CASCADE;
DROP TYPE IF EXISTS leadstatus CASCADE;

-- =====================================================
-- VERIFY MIGRATION
-- =====================================================
SELECT 'Pre-leads migration complete' AS message,
       COUNT(*) AS total,
       SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) AS active,
       SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) AS discarded
FROM pre_leads;

SELECT 'Leads migration complete' AS message,
       COUNT(*) AS total,
       SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) AS active,
       SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) AS discarded
FROM leads;
