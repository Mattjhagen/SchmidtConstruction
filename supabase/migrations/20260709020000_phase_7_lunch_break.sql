-- Phase 7 (cont.): Lunch Break Tracking
-- Location: supabase/migrations/20260709020000_phase_7_lunch_break.sql
--
-- Adds break_start so employees can punch a lunch break with a button while
-- staying clocked in. When lunch ends, the elapsed minutes are added to
-- break_minutes and break_start is cleared. break_minutes remains editable
-- for manual corrections.

ALTER TABLE time_entries
  ADD COLUMN IF NOT EXISTS break_start TIMESTAMPTZ; -- non-null while on lunch
