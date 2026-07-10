-- Phase 7: Employee Time Clock
-- Location: supabase/migrations/20260709000000_phase_7_time_clock.sql
-- Adds self-service employee time tracking: employees + time_entries.
-- Employees clock themselves in/out (linked to Supabase Auth via user_id).
-- Hours engine (break deduction, weekly overtime, payroll cost) lives in src/lib/timeclock.ts.

-- 1. EMPLOYEES TABLE
-- One row per staff member. Linked to a Supabase Auth user so a signed-in
-- person is resolved to their employee profile (and hourly_rate) for payroll math.
CREATE TABLE IF NOT EXISTS employees (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL, -- Supabase Auth link
    name         TEXT NOT NULL,
    email        TEXT,
    role         TEXT NOT NULL DEFAULT 'employee', -- employee, admin
    hourly_rate  NUMERIC(10, 2) NOT NULL DEFAULT 0,
    active       BOOLEAN NOT NULL DEFAULT true,
    created_at   TIMESTAMPTZ DEFAULT now()
);

-- 2. TIME ENTRIES TABLE
-- One row per clock-in / clock-out shift. clock_out NULL == currently on the clock.
CREATE TABLE IF NOT EXISTS time_entries (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id    UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    clock_in       TIMESTAMPTZ NOT NULL DEFAULT now(),
    clock_out      TIMESTAMPTZ, -- NULL while the shift is open
    break_minutes  INTEGER NOT NULL DEFAULT 0,
    project_id     UUID REFERENCES projects(id) ON DELETE SET NULL, -- optional job costing link
    notes          TEXT,
    created_at     TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_employee_id ON time_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_clock_in ON time_entries(clock_in);
-- Guarantee a person can only have ONE open shift at a time.
CREATE UNIQUE INDEX IF NOT EXISTS uq_time_entries_open_shift
    ON time_entries(employee_id)
    WHERE clock_out IS NULL;

---------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
---------------------------------------------------------

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Helper: is the current auth user an admin employee?
CREATE OR REPLACE FUNCTION is_timeclock_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM employees e
        WHERE e.user_id = auth.uid() AND e.role = 'admin'
    );
$$;

-- EMPLOYEES: a signed-in user can read their own profile; admins read all.
CREATE POLICY "Employees can view their own profile"
    ON employees FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR is_timeclock_admin());

-- Only admins can create/edit/deactivate employee records.
CREATE POLICY "Admins manage employees"
    ON employees FOR ALL
    TO authenticated
    USING (is_timeclock_admin())
    WITH CHECK (is_timeclock_admin());

-- TIME ENTRIES: self-service — employees fully manage their OWN entries; admins see/manage all.
CREATE POLICY "Employees manage their own time entries"
    ON time_entries FOR ALL
    TO authenticated
    USING (
        employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
        OR is_timeclock_admin()
    )
    WITH CHECK (
        employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
        OR is_timeclock_admin()
    );
