# Day 12 — 2026-08-03

## Summary

Iterative TypeScript build fixes in SchmidtAdmin and elimination of duplicate Supabase GoTrueClient browser warnings.

---

## Build Fixes (SchmidtAdmin — Netlify)

### Fix 1: Missing `project` and `review_reason` on `TimeEntry`

`TimesheetList.tsx` referenced `entry.review_reason` (line 86) and `entry.project` (line 136), both present in the DB schema but absent from the `TimeEntry` TypeScript interface.

**File:** `src/lib/types.ts`
Added:
```typescript
project: string | null;
review_reason: string | null;
```

Also wired `payload.project` through to the DB insert in `clockIn()` — the UI was sending it but the server action was silently dropping it.

**File:** `src/app/actions/time-clock.ts`

---

### Fix 2: Implicit `any` in `tickets.ts` reduce callback

```
Type error: Parameter 'max' implicitly has an 'any' type.
Type error: Parameter 'item' implicitly has an 'any' type.
```

Two separate builds caught these in sequence (Netlify only reports one error at a time).

**File:** `src/lib/tickets.ts` — line 137
```typescript
items?.reduce((max: number, item: { order_index?: number | null }) => ...)
```

---

## Duplicate GoTrueClient Warning

Browser console showed repeated warnings about multiple GoTrueClient instances sharing the same storage key. Traced and eliminated four independent sources:

| File | Problem | Fix |
|------|---------|-----|
| `src/lib/auth.ts` | Module-level `createBrowserClient(...)` | Replaced with `getSupabaseBrowser()` |
| `src/components/SettingsClient.tsx` | Dynamic `createClient(...)` inside `useEffect` | Replaced with `getSupabaseBrowser()` |
| `src/app/(app)/projects/[id]/page.tsx` | Dynamic `createClient(...)` inside handler | Replaced with `getSupabaseBrowser()` |
| `src/lib/db.ts` | Module-level `createClient(...)` at load time | Replaced with `getSupabaseBrowser()` |

The singleton is `src/lib/supabaseClient.ts` — all browser-side Supabase access now flows through it.

**Note:** `src/app/actions/admin.ts`, `siteContent.ts`, `uploadImage.ts`, and all `src/app/api/` routes use the service-role key with `persistSession: false` — these are server-only and do not contribute to browser warnings.

---

## Commits

| Hash | Message |
|------|---------|
| `9906064` | fix: add missing project and review_reason fields to TimeEntry type |
| `4d33dc3` | fix: type annotate reduce accumulator in addChecklistItem |
| `0ad119c` | fix: type annotate item parameter in addChecklistItem reduce |
| `6377635` | fix: eliminate duplicate GoTrueClient by reusing getSupabaseBrowser singleton in auth.ts |
| `b9fb965` | fix: replace ad-hoc createClient calls with getSupabaseBrowser singleton |
| `2afa7dd` | fix: replace module-level createClient in db.ts with getSupabaseBrowser singleton |

---

## Status

- SchmidtAdmin build: passing (as of last Netlify deploy)
- Time Clock clock-in: schema column names corrected (`user_id`, `notes`, `project`)
- GoTrueClient warning: resolved
