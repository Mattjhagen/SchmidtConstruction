-- Phase 7 (cont.): Employee Invite-Token Linking
-- Location: supabase/migrations/20260709010000_phase_7_employee_invites.sql
--
-- Secure account linking via one-time invite tokens (NO email-match auto-linking).
-- Policy chosen by owner:
--   - Tokens do NOT expire; they are revocable (admin can regenerate/clear).
--   - Redeeming REQUIRES the signed-in user's email to match the employee row's
--     email (prevents a forwarded invite link from linking the wrong account).
--
-- Workflow:
--   1. Admin creates an employee row (name/email/rate) and generates an invite token.
--   2. Admin sends the person: login.schmidt-construction.com/invite/<token>
--   3. The person signs up / signs in with Supabase Auth using their work email.
--   4. redeem_employee_invite(token) links employees.user_id = auth.uid()
--      IFF the token matches AND the caller's email matches the row's email.

-- 1. Invite columns on employees.
ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS invite_token UUID,
  ADD COLUMN IF NOT EXISTS invited_at   TIMESTAMPTZ;

-- Fast lookup by token.
CREATE UNIQUE INDEX IF NOT EXISTS uq_employees_invite_token
  ON employees(invite_token)
  WHERE invite_token IS NOT NULL;

-- 2. Redeem RPC — SECURITY DEFINER so it can read auth.users email + update the row,
--    but it only ever links the CALLER (auth.uid()) and enforces the email match.
CREATE OR REPLACE FUNCTION redeem_employee_invite(token UUID)
RETURNS employees
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_email TEXT;
  linked employees;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT email INTO caller_email FROM auth.users WHERE id = auth.uid();

  UPDATE employees e
     SET user_id      = auth.uid(),
         invite_token = NULL,          -- consume the token (one-time use)
         invited_at   = NULL
   WHERE e.invite_token = token
     AND e.user_id IS NULL
     AND lower(e.email) = lower(caller_email)   -- email must match
  RETURNING * INTO linked;

  IF linked.id IS NULL THEN
    RAISE EXCEPTION 'Invalid invite, or your email does not match this invitation.';
  END IF;

  RETURN linked;
END;
$$;

GRANT EXECUTE ON FUNCTION redeem_employee_invite(UUID) TO authenticated;

-- 3. Public-safe lookup so the /invite page can show WHO the invite is for
--    (name + email) before the person signs in, without exposing the whole table.
CREATE OR REPLACE FUNCTION get_invite_info(token UUID)
RETURNS TABLE (name TEXT, email TEXT, already_linked BOOLEAN)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT e.name, e.email, (e.user_id IS NOT NULL) AS already_linked
    FROM employees e
   WHERE e.invite_token = token;
$$;

-- Allow both anonymous and authenticated visitors to resolve invite info.
GRANT EXECUTE ON FUNCTION get_invite_info(UUID) TO anon, authenticated;
