# Day 8 — Employee Time Clock, Access Control & Payroll Timesheets

**Date:** 2026-07-09
**Repo:** SchmidtConstruction (Next.js 16 · TypeScript · Tailwind 4 · Supabase)

> Summary: Built a complete employee time-tracking system on top of the existing
> proposals app — self-service time clock, admin timesheets with payroll, a
> host-split access-control model, invite-token employee onboarding, and a
> branded PDF/CSV/email export pipeline. Also fixed a login-session bug that
> blocked email/password sign-in.

---

## 1. Employee Time Clock (Phase 7 core)

### Database (`supabase/migrations/20260709000000_phase_7_time_clock.sql`)
- New `employees` table — `id`, `user_id` (→ `auth.users`), `name`, `email`, `role` (`employee` | `admin`), `hourly_rate`, `active`.
- New `time_entries` table — `clock_in`, `clock_out` (NULL = on the clock), `break_minutes`, optional `project_id`, `notes`.
- Unique index guarantees only **one open shift** per employee at a time.
- RLS: employees see/manage **their own** entries; admins see all via `is_timeclock_admin()` helper function.

### Hours engine (`src/lib/timeclock.ts`)
- Worked hours = `(clock_out − clock_in) − break_minutes`.
- **Overtime** computed per ISO week (Mon–Sun): hours over 40 billed at **1.5×**.
- Payroll cost = regular × rate + overtime × rate × 1.5.
- Verified: 42.5h week → 40 regular + 2.5 OT = $1,312.50 at $30/hr.

### DB adapter (`src/lib/db.ts`)
- Added clock in/out, open-shift lookup, employee CRUD, and manual entry methods — all following the existing Supabase ↔ LocalStorage fallback pattern.

### UI
- **`/timeclock`** — self-service page: big Clock In / Clock Out button, live running timer, break entry on clock-out, today/this-week stats, recent shifts. (Project dropdown was added then removed per request.)
- **`/timesheets`** — admin payroll view: per-employee rollups, overtime flagged, payroll cost, pay-period date range, CSV export.

---

## 2. Access Control — Host Split (single deployment, two hosts)

- **`schmidt-construction.com`** → public marketing only. Any authenticated route (admin app **or** portal) is redirected to the login subdomain.
- **`login.schmidt-construction.com`** → authenticated gateway. Single login; employees route to the admin app, clients to the portal.
- **Critical fix:** the old `src/proxy.ts` was never executing — Next.js only runs middleware by the correct filename. Renamed to the Next.js 16 **`proxy`** convention (`src/proxy.ts` exporting `proxy()`), with real hostname enforcement + matcher config.
- Single login with **role-based redirect** via `resolveRole()` — checks the `employees` table to decide staff (`/dashboard`) vs. client (`/portal/dashboard`).

---

## 3. Employee Onboarding — Invite Tokens

`supabase/migrations/20260709010000_phase_7_employee_invites.sql`

- Chosen model: **one-time invite tokens**, no expiry, revocable, **email-match required** on redemption (a forwarded link can't link the wrong account).
- `redeem_employee_invite(token)` RPC — links `employees.user_id` to `auth.uid()` only if the token matches AND the caller's email matches the row.
- `get_invite_info(token)` RPC — public-safe lookup so the invite page shows who it's for.
- **`/invite/[token]`** page — employee signs in with their work email and activates staff access.
- Admin roster shows **Generate invite → Copy link → Revoke** controls per employee.

---

## 4. Login Session Fix (email/password "nothing happens" bug)

- **Root cause:** email/password login used the plain `@supabase/supabase-js` client, which stores the session only in **localStorage**. The proxy/middleware reads the session from **cookies** via `@supabase/ssr` — so after login it saw no session and bounced the user back to `/login` (infinite loop). Google OAuth worked because it flowed through the cookie-based callback.
- **Fix:** routed `login`, `logout`, `getAuthUserId`, and `resolveRole` in `src/lib/auth.ts` through the cookie-backed `getSupabaseBrowser()` client.
- Added **"Continue with Google"** to the unified `/login` page (previously only on `/portal/login`).
- Added **`/reset-password`** page + "Forgot password?" link — recovery email routes through the auth callback to establish a session, then to the reset page. (Fixes recovery links that previously bounced to sign-in with no reset screen.)

### First-admin bootstrap
- Chicken-and-egg (can't reach `/timesheets` to invite yourself until you're staff) solved by linking the first admin directly in SQL. Confirmed `mattjhagen0@gmail.com` = **Matthew Hagen**, `role = admin`, linked.

---

## 5. Admin Timesheet Tools

- **Manual add-hours** — admins record shifts that weren't clocked (employee, date, in/out, break, notes).
- **Inline roster editing** — rename employees, set hourly rate, change role directly in the UI (no SQL). Used to rename accounts:
  - `mattjhagen0@gmail.com` → **Matthew Hagen**
  - `admin@schmidt-construction.com` → **Payroll**
  - `matty@p3lending.space` → **Matty Hagen**
- **Role-based views** — regular employees see only their **own** timesheet ("My Timesheet"); admins see everyone. Admin **"My timesheet only"** toggle. Roster + admin action buttons hidden from non-admins.
  - Admin detection matches by `user_id`, with an **email fallback** for resilience.
- **Per-shift edit/delete** — expand any employee to see individual shifts; edit date/in/out/break or delete a shift; totals recalculate.

---

## 6. Branded Export Pipeline (PDF · CSV · Email)

### PDF (`src/lib/timesheetPdf.ts`)
- Schmidt Construction **logo** embedded in the letterhead + website palette (slate-900 header, amber-600 accent).
- **Daily-row breakdown** per employee: Date · In · Out · **Break / Notes** (comments shown here) · Hours, then per-employee subtotal and grand totals.
- Signature lines + per-page footer.
- **Filename = pay period**, e.g. `Schmidt-Timesheet-2026-07-06_to_2026-07-12.pdf`.

### Email (`/api/timesheets/send` + `sendTimesheetEmail` in `src/lib/email.ts`)
- Admin-only endpoint (auth + role check), sends via the app's existing **Resend** pipeline.
- HTML summary table in the body + **PDF and CSV attachments**.
- Recipient defaults to **mike@walls2.com** (editable).
- Owner email **Mike@walls2.com** now shown on the PDF letterhead and email footer.

---

## Configuration Checklist (do outside the code)

- [ ] Run both migrations on Supabase: `20260709000000_phase_7_time_clock.sql`, then `20260709010000_phase_7_employee_invites.sql`.
- [ ] Vercel domain: add `login.schmidt-construction.com` to the project.
- [ ] Supabase → Auth → URL Configuration → Redirect URLs:
  - `https://login.schmidt-construction.com/portal/auth/callback`
  - `https://login.schmidt-construction.com/portal/dashboard`
  - `https://login.schmidt-construction.com/dashboard`
  - `https://login.schmidt-construction.com/reset-password`
  - Site URL: `https://login.schmidt-construction.com`
- [ ] Vercel env var: `NEXT_PUBLIC_PORTAL_URL=https://login.schmidt-construction.com` (clean quote links, no redirect hop), then redeploy.
- [ ] Confirm `RESEND_API_KEY` set in Vercel for timesheet email delivery.

---

## Files Touched (Day 8)

**New**
- `supabase/migrations/20260709000000_phase_7_time_clock.sql`
- `supabase/migrations/20260709010000_phase_7_employee_invites.sql`
- `src/lib/timeclock.ts`
- `src/lib/timesheetPdf.ts`
- `src/app/(app)/timeclock/page.tsx`
- `src/app/(app)/timesheets/page.tsx`
- `src/app/invite/[token]/page.tsx`
- `src/app/reset-password/page.tsx`
- `src/app/api/timesheets/send/route.ts`
- `src/proxy.ts` (renamed from the never-running middleware)

**Modified**
- `src/lib/types.ts` — `Employee`, `TimeEntry`, `TimeEntryWithHours`, `TimesheetSummary`, invite fields
- `src/lib/db.ts` — time clock + employee + invite methods, seed data
- `src/lib/auth.ts` — cookie-based session, `resolveRole()`
- `src/lib/email.ts` — `sendTimesheetEmail()`, owner email
- `src/components/Header.tsx` — Time Clock + Timesheets nav links
- `src/components/marketing/MarketingFooter.tsx` — login-subdomain link
- `src/app/portal/dashboard/page.tsx` — auto-route linked staff to admin app
- `next.config.ts` — `turbopack.root` (silences multi-lockfile warning)

---

## Notes / Known Limitations
- Manual and per-shift edits assume **same-day** shifts (clock-in and clock-out on the chosen date). Overnight shifts crossing midnight not yet supported.
- Demo mode (no Supabase env) uses LocalStorage; email sending is disabled and reports so.
- All builds this day compiled clean (`npm run build`) before each push.
