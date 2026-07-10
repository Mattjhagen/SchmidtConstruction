-- Schmidt Construction Estimating - Phase 2 Security & Audits
-- Location: supabase/migrations/20260630010000_phase_2_security.sql

-- 1. ADD EXPIRATION TO PROPOSALS
ALTER TABLE proposals 
ADD COLUMN IF NOT EXISTS expiration_date DATE DEFAULT (CURRENT_DATE + INTERVAL '30 days');

-- 2. CREATE AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
    user_id UUID, -- NULL if performed by public anonymous client
    action TEXT NOT NULL, -- e.g., 'CREATE', 'REVISE', 'VIEW', 'SIGN', 'COMMENT', 'STATUS_CHANGE'
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for quick lookups on proposal history
CREATE INDEX IF NOT EXISTS idx_audit_logs_proposal_id ON audit_logs(proposal_id);

-- 3. ENABLE RLS ON AUDIT LOGS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES FOR AUDIT LOGS
-- Estimators can read/write all audits
CREATE POLICY "Estimators can manage all audit logs" 
ON audit_logs FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Clients can write audit events when they interact with shared portal
CREATE POLICY "Clients can insert portal action audits" 
ON audit_logs FOR INSERT 
TO public 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM proposals 
        WHERE proposals.id = audit_logs.proposal_id 
        AND proposals.status != 'Draft'
    )
);

-- Clients can read audit events linked to their proposal
CREATE POLICY "Clients can view their proposal audit logs" 
ON audit_logs FOR SELECT 
TO public 
USING (
    EXISTS (
        SELECT 1 FROM proposals 
        WHERE proposals.id = audit_logs.proposal_id 
        AND proposals.status != 'Draft'
    )
);
