-- Phase 6: Admin-editable site content
-- Tables: portfolio_items, site_config, service_overrides
-- Storage: marketing-images bucket

-- Portfolio Items
CREATE TABLE IF NOT EXISTS portfolio_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  location     TEXT NOT NULL DEFAULT '',
  service_slug TEXT NOT NULL DEFAULT '',
  service_name TEXT NOT NULL DEFAULT '',
  description  TEXT NOT NULL DEFAULT '',
  image_url    TEXT NOT NULL DEFAULT '',
  featured     BOOLEAN NOT NULL DEFAULT false,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_manage_portfolio" ON portfolio_items
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public_read_portfolio" ON portfolio_items
  FOR SELECT TO anon USING (true);

-- Site Config (key/value)
CREATE TABLE IF NOT EXISTS site_config (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_manage_site_config" ON site_config
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public_read_site_config" ON site_config
  FOR SELECT TO anon USING (true);

-- Seed default site config values
INSERT INTO site_config (key, value) VALUES
  ('phone', '(402) 555-0100'),
  ('phone_href', 'tel:+14025550100'),
  ('email', 'estimates@schmidt-construction.com'),
  ('address', 'Omaha, NE'),
  ('hours_weekday', 'Monday–Friday: 7am–5pm'),
  ('hours_weekend', 'Saturday: By appointment'),
  ('about_text', 'Schmidt Construction was founded in 1976 and has served the Omaha metro area for over 50 years. What started as a small family operation has grown into one of the most trusted names in retaining walls, concrete work, drainage solutions, and remodeling in eastern Nebraska.'),
  ('tagline', '50+ Years of Family-Owned Excellence')
ON CONFLICT (key) DO NOTHING;

-- Service Overrides (per-slug overrides for description and image)
CREATE TABLE IF NOT EXISTS service_overrides (
  slug             TEXT PRIMARY KEY,
  long_description TEXT,
  image_url        TEXT,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE service_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_manage_service_overrides" ON service_overrides
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public_read_service_overrides" ON service_overrides
  FOR SELECT TO anon USING (true);

-- Updated_at trigger helper
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER portfolio_items_updated_at
  BEFORE UPDATE ON portfolio_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER service_overrides_updated_at
  BEFORE UPDATE ON service_overrides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
