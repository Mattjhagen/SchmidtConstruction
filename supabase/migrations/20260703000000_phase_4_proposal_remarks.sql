-- Phase 4: Proposal Remarks, Structured Payment Terms, and Phased/Optional Work Items
-- Location: supabase/migrations/20260703000000_phase_4_proposal_remarks.sql
--
-- NEW COLUMNS ON proposal_versions:
--   remarks            — client-visible "Please Note" block (never internal)
--   deposit_percentage — e.g. 50 = 50% deposit required to schedule
--   deposit_amount     — explicit flat deposit amount (used when deposit_percentage = 0)
--   balance_due_text   — free-text balance description, e.g. "Balance due upon completion"
--   acceptance_language — per-proposal acceptance / authorization text shown above signature
--
-- NEW COLUMNS ON proposal_line_items:
--   line_item_type     — required | optional | phase | alternate
--   client_selectable  — when true, client can check/uncheck in the portal; total updates live
--   selected_by_default— pre-checked state for client_selectable items
--   sort_order         — display ordering within each item type group

ALTER TABLE proposal_versions
  ADD COLUMN IF NOT EXISTS remarks TEXT,
  ADD COLUMN IF NOT EXISTS deposit_percentage NUMERIC DEFAULT 50,
  ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS balance_due_text TEXT DEFAULT 'Balance due upon completion',
  ADD COLUMN IF NOT EXISTS acceptance_language TEXT;

ALTER TABLE proposal_line_items
  ADD COLUMN IF NOT EXISTS line_item_type TEXT NOT NULL DEFAULT 'required',
  ADD COLUMN IF NOT EXISTS client_selectable BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS selected_by_default BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

-- Guard valid line_item_type values (PostgreSQL ADD CONSTRAINT IF NOT EXISTS requires PG 9.6+)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'chk_line_item_type'
      AND table_name = 'proposal_line_items'
  ) THEN
    ALTER TABLE proposal_line_items
      ADD CONSTRAINT chk_line_item_type
      CHECK (line_item_type IN ('required', 'optional', 'phase', 'alternate'));
  END IF;
END $$;

-- Index to sort client-selectable items efficiently in the portal query
CREATE INDEX IF NOT EXISTS idx_line_items_type_sort
  ON proposal_line_items (proposal_version_id, line_item_type, sort_order);
