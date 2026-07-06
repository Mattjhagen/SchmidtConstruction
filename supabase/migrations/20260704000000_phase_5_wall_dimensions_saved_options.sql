-- Phase 5: Wall Dimensions & Saved Proposal Options
-- Adds wall_sections JSONB to proposal_versions and creates saved_proposal_options table.

-- 1. Add wall sections storage to proposal versions
ALTER TABLE proposal_versions
  ADD COLUMN IF NOT EXISTS wall_sections JSONB DEFAULT '[]'::jsonb;

-- 2. Saved reusable options library
CREATE TABLE IF NOT EXISTS saved_proposal_options (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  description           TEXT,
  category              TEXT,
  default_price         NUMERIC(12, 2) DEFAULT 0,
  default_unit          TEXT DEFAULT 'EA',
  default_quantity      NUMERIC(12, 4) DEFAULT 1,
  default_markup_percent NUMERIC(6, 2) DEFAULT 0,
  line_item_type        TEXT DEFAULT 'optional',
  client_selectable     BOOLEAN DEFAULT true,
  selected_by_default   BOOLEAN DEFAULT false,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE saved_proposal_options ENABLE ROW LEVEL SECURITY;

-- Only authenticated estimators may manage saved options; public portal cannot access them.
CREATE POLICY "Estimators manage saved proposal options"
  ON saved_proposal_options
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
