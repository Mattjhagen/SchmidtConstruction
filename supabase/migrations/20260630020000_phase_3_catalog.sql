-- Phase 3: Catalog System, Multi-Contact Clients, Measurement Templates
-- Migration: 20260630020000_phase_3_catalog.sql
-- Run AFTER 20260630010000_phase_2_security.sql

-- ============================================================
-- SUPPLIERS
-- ============================================================
CREATE TABLE IF NOT EXISTS suppliers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  contact_name TEXT,
  phone        TEXT,
  email        TEXT,
  account_num  TEXT,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- CATALOG CATEGORIES (hierarchical)
-- ============================================================
CREATE TABLE IF NOT EXISTS catalog_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id   UUID REFERENCES catalog_categories(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL
    CHECK (type IN ('material','labor','equipment','assembly','snippet','template')),
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- CATALOG ITEMS (polymorphic core)
-- ============================================================
CREATE TABLE IF NOT EXISTS catalog_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id  UUID REFERENCES catalog_categories(id) ON DELETE SET NULL,
  type         TEXT NOT NULL
    CHECK (type IN ('material','labor','equipment','assembly','snippet','template')),
  name         TEXT NOT NULL,
  description  TEXT,
  search_tags  TEXT[],
  active       BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- MATERIALS
-- ============================================================
CREATE TABLE IF NOT EXISTS materials (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_item_id UUID REFERENCES catalog_items(id) ON DELETE CASCADE,
  unit            TEXT NOT NULL,
  unit_cost       NUMERIC(10,2) NOT NULL,
  default_markup  NUMERIC(5,2) DEFAULT 35,
  taxable         BOOLEAN DEFAULT false,
  supplier_id     UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  last_price_date DATE
);

-- ============================================================
-- LABOR RATES
-- ============================================================
CREATE TABLE IF NOT EXISTS labor_rates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_item_id UUID REFERENCES catalog_items(id) ON DELETE CASCADE,
  skill_type      TEXT,
  rate_per_hour   NUMERIC(10,2) NOT NULL,
  burden_rate     NUMERIC(5,2) DEFAULT 0,
  default_markup  NUMERIC(5,2) DEFAULT 25
);

-- ============================================================
-- EQUIPMENT RATES
-- ============================================================
CREATE TABLE IF NOT EXISTS equipment_rates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_item_id UUID REFERENCES catalog_items(id) ON DELETE CASCADE,
  rate_type       TEXT DEFAULT 'daily'
    CHECK (rate_type IN ('hourly','daily','weekly')),
  hourly_rate     NUMERIC(10,2),
  daily_rate      NUMERIC(10,2),
  weekly_rate     NUMERIC(10,2),
  default_markup  NUMERIC(5,2) DEFAULT 15
);

-- ============================================================
-- SUPPLIER PRICE HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS supplier_prices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_item_id UUID REFERENCES catalog_items(id) ON DELETE CASCADE,
  supplier_id     UUID REFERENCES suppliers(id) ON DELETE CASCADE,
  unit_cost       NUMERIC(10,2) NOT NULL,
  effective_date  DATE NOT NULL,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ASSEMBLIES
-- ============================================================
CREATE TABLE IF NOT EXISTS assemblies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_item_id UUID REFERENCES catalog_items(id) ON DELETE CASCADE,
  notes           TEXT
);

CREATE TABLE IF NOT EXISTS assembly_components (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assembly_id      UUID REFERENCES assemblies(id) ON DELETE CASCADE,
  component_id     UUID REFERENCES catalog_items(id) ON DELETE CASCADE,
  quantity         NUMERIC(10,4) DEFAULT 1,
  quantity_unit    TEXT,
  quantity_formula TEXT,  -- e.g. "length * height * 1.12" for calculated quantities
  sort_order       INT DEFAULT 0
);

-- ============================================================
-- SCOPE SNIPPETS
-- ============================================================
CREATE TABLE IF NOT EXISTS scope_snippets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_item_id UUID REFERENCES catalog_items(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  insert_target   TEXT DEFAULT 'scope_of_work'
    CHECK (insert_target IN ('scope_of_work','assumptions','exclusions','payment_terms','warranty_notes'))
);

-- ============================================================
-- MULTI-CONTACT CLIENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS client_contacts (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id          UUID REFERENCES clients(id) ON DELETE CASCADE,
  name               TEXT NOT NULL,
  role               TEXT,
  email              TEXT,
  phone              TEXT,
  is_primary         BOOLEAN DEFAULT false,
  receives_proposals BOOLEAN DEFAULT true,
  notes              TEXT,
  created_at         TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- RLS POLICIES
-- ============================================================
ALTER TABLE catalog_categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials             ENABLE ROW LEVEL SECURITY;
ALTER TABLE labor_rates           ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_rates       ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers             ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_prices       ENABLE ROW LEVEL SECURITY;
ALTER TABLE assemblies            ENABLE ROW LEVEL SECURITY;
ALTER TABLE assembly_components   ENABLE ROW LEVEL SECURITY;
ALTER TABLE scope_snippets        ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_contacts       ENABLE ROW LEVEL SECURITY;

-- Authenticated users (estimators) get full access
CREATE POLICY "Authenticated full access" ON catalog_categories    FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access" ON catalog_items         FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access" ON materials             FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access" ON labor_rates           FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access" ON equipment_rates       FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access" ON suppliers             FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access" ON supplier_prices       FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access" ON assemblies            FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access" ON assembly_components   FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access" ON scope_snippets        FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access" ON client_contacts       FOR ALL USING (auth.role() = 'authenticated');
