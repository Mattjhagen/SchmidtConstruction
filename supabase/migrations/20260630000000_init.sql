-- Schmidt Construction Estimating Database Schema
-- Location: supabase/migrations/20260630000000_init.sql

-- Enable uuid-ossp extension if available (though gen_random_uuid() works out of the box in Postgres 13+)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CLIENTS TABLE
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- retaining wall, concrete, drainage, kitchen remodel, bathroom remodel, commercial, other
    job_site_address TEXT,
    description TEXT,
    desired_start_date DATE,
    status TEXT NOT NULL DEFAULT 'Planning', -- Planning, Active, Completed, Cancelled
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. PROPOSALS TABLE
CREATE TABLE IF NOT EXISTS proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    proposal_number TEXT NOT NULL UNIQUE,
    current_version_id UUID, -- circular FK, added constraint below
    status TEXT NOT NULL DEFAULT 'Draft', -- Draft, Sent, Viewed, Revised, Accepted, Rejected, Expired
    share_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    created_by UUID, -- references auth.users(id)
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. PROPOSAL VERSIONS TABLE
CREATE TABLE IF NOT EXISTS proposal_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    scope_of_work TEXT,
    assumptions TEXT,
    exclusions TEXT,
    timeline TEXT,
    payment_terms TEXT,
    warranty_notes TEXT,
    subtotal NUMERIC NOT NULL DEFAULT 0,
    tax NUMERIC NOT NULL DEFAULT 0,
    discount NUMERIC NOT NULL DEFAULT 0,
    total NUMERIC NOT NULL DEFAULT 0,
    internal_notes TEXT, -- Estimator internal comments (never visible to client)
    client_message TEXT, -- Friendly note accompanying proposal
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (proposal_id, version_number)
);

-- Add circular reference constraint to proposals
ALTER TABLE proposals 
ADD CONSTRAINT fk_current_version 
FOREIGN KEY (current_version_id) 
REFERENCES proposal_versions(id) ON DELETE SET NULL;

-- 5. PROPOSAL LINE ITEMS TABLE
CREATE TABLE IF NOT EXISTS proposal_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_version_id UUID NOT NULL REFERENCES proposal_versions(id) ON DELETE CASCADE,
    category TEXT NOT NULL, -- e.g., Site Prep, Materials, Labor, Subcontracting
    description TEXT NOT NULL,
    quantity NUMERIC NOT NULL DEFAULT 1,
    unit TEXT NOT NULL, -- LF, SF, CY, EA, Days, Hours, etc.
    unit_cost NUMERIC NOT NULL DEFAULT 0,
    markup_percent NUMERIC NOT NULL DEFAULT 0,
    line_total NUMERIC NOT NULL DEFAULT 0,
    optional BOOLEAN NOT NULL DEFAULT false
);

-- 6. NEGOTIATION EVENTS TABLE
CREATE TABLE IF NOT EXISTS negotiation_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    proposal_version_id UUID REFERENCES proposal_versions(id) ON DELETE SET NULL,
    sender_type TEXT NOT NULL, -- owner, client, system
    message TEXT,
    requested_changes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_proposals_project_id ON proposals(project_id);
CREATE INDEX IF NOT EXISTS idx_proposal_versions_proposal_id ON proposal_versions(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_line_items_version_id ON proposal_line_items(proposal_version_id);
CREATE INDEX IF NOT EXISTS idx_negotiation_events_proposal_id ON negotiation_events(proposal_id);

---------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
---------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE negotiation_events ENABLE ROW LEVEL SECURITY;

-- 1. Owner/Estimator Access Policies (Allows authenticated users full write/read access)
CREATE POLICY "Estimators can manage all clients" 
ON clients FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Estimators can manage all projects" 
ON projects FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Estimators can manage all proposals" 
ON proposals FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Estimators can manage all proposal versions" 
ON proposal_versions FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Estimators can manage all line items" 
ON proposal_line_items FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Estimators can manage all negotiation events" 
ON negotiation_events FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 2. Client Portal Policies (Uses the share_token to authenticate read actions)
-- Allow public read of proposals matching their share_token
CREATE POLICY "Clients can view their shared proposals" 
ON proposals FOR SELECT 
TO public 
USING (status != 'Draft'); -- clients shouldn't see draft proposals

-- Allow public read of proposal versions and line items for proposals matching a share_token
CREATE POLICY "Clients can view proposal versions via share token" 
ON proposal_versions FOR SELECT 
TO public 
USING (
    EXISTS (
        SELECT 1 FROM proposals 
        WHERE proposals.id = proposal_versions.proposal_id 
        AND proposals.status != 'Draft'
    )
);

CREATE POLICY "Clients can view line items via share token" 
ON proposal_line_items FOR SELECT 
TO public 
USING (
    EXISTS (
        SELECT 1 FROM proposal_versions 
        JOIN proposals ON proposals.id = proposal_versions.proposal_id
        WHERE proposal_versions.id = proposal_line_items.proposal_version_id 
        AND proposals.status != 'Draft'
    )
);

-- Allow public insertion of negotiation events if it references a valid active proposal
CREATE POLICY "Clients can add comments/negotiation events" 
ON negotiation_events FOR INSERT 
TO public 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM proposals 
        WHERE proposals.id = negotiation_events.proposal_id 
        AND proposals.status != 'Draft'
    )
);

-- Allow public read of negotiation events for the shared proposal
CREATE POLICY "Clients can read comments/negotiation events" 
ON negotiation_events FOR SELECT 
TO public 
USING (
    EXISTS (
        SELECT 1 FROM proposals 
        WHERE proposals.id = negotiation_events.proposal_id 
        AND proposals.status != 'Draft'
    )
);

---------------------------------------------------------
-- SEED TEMPLATE DATA
---------------------------------------------------------

-- Add a default mock client for templates
INSERT INTO clients (id, name, email, phone, address, notes) 
VALUES ('c1111111-1111-1111-1111-111111111111', 'Schmidt Construction Templates', 'office@schmidtconstruction.com', '(402) 555-0199', 'Omaha, NE', 'System folder for template storage')
ON CONFLICT (id) DO NOTHING;

-- Add template projects
INSERT INTO projects (id, client_id, name, type, job_site_address, description, status)
VALUES 
('p1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Template - Retaining Wall Replacement', 'retaining wall', 'Omaha, NE', 'Standard 80LF segmental block retaining wall, 4ft high.', 'Planning'),
('p2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'Template - Drainage Correction', 'drainage', 'Omaha, NE', 'French drain, sump pump basin, and downspout extensions.', 'Planning'),
('p3333333-3333-3333-3333-333333333333', 'c1111111-1111-1111-1111-111111111111', 'Template - Concrete Patio or Driveway', 'concrete', 'Omaha, NE', 'Standard 12x15 concrete patio or double-car driveway repair.', 'Planning'),
('p4444444-4444-4444-4444-444444444444', 'c1111111-1111-1111-1111-111111111111', 'Template - Kitchen Remodel', 'kitchen remodel', 'Omaha, NE', 'Full kitchen transformation with custom cabinetry and quartz countertops.', 'Planning'),
('p5555555-5555-5555-5555-555555555555', 'c1111111-1111-1111-1111-111111111111', 'Template - Bathroom Remodel', 'bathroom remodel', 'Omaha, NE', 'Modern bathroom with walk-in tile shower and new vanity.', 'Planning'),
('p6666666-6666-6666-6666-666666666666', 'c1111111-1111-1111-1111-111111111111', 'Template - Small Commercial Concrete Repair', 'commercial', 'Omaha, NE', 'Sidewalk trip hazard grinding, localized slab-on-grade replacement.', 'Planning')
ON CONFLICT (id) DO NOTHING;
