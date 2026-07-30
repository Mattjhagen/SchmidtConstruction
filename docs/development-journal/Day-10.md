# Day 10 — Dashboard Refactor: Quote Requests Replace Proposals

**Date:** 2026-07-29
**Repo:** SchmidtAdmin (Next.js 16 · TypeScript · Supabase)

> Summary: Refactored the dashboard's main content section to display quote requests from the contact form instead of the non-functional proposals table. Updated the Supabase query to load all quote requests (not just pending), allowing the admin portal to serve as the single source of truth for customer inquiries without needing a full proposal system.

---

## 1. Dashboard Refactor — Quote Requests Integration

### Context
Earlier in the session, the contact form on the marketing site (SchmidtWalls) was successfully wired to submit quote requests to the admin portal (SchmidtAdmin). However, the dashboard still displayed "Active Proposals" which referenced a `proposals` table that no longer exists in the admin Supabase schema.

The user confirmed: **"since we switched from a wizard to a contact forum we may not have a table set up for it"** — indicating the proposal system is no longer needed. Decision: Replace the proposals display with quote requests.

### Changes Made

#### Dashboard Section Replacement
**File:** `src/app/(app)/dashboard/page.tsx`

1. **Renamed section**: "Active Proposals" → "Quote Requests"
2. **Updated description**: "Track and manage recent construction proposals" → "Contact form submissions from the website"
3. **Changed table columns**:
   - Old: Proposal No., Project & Client, Status, Estimate Total, Manage
   - New: Name, Service, Phone, Status, Actions

#### Data Query Update
Modified the Supabase query in `loadData()` function:
```typescript
// Before: Load only pending requests
.eq('status', 'pending')

// After: Load all requests to show complete history
// (query removed the .eq('status', 'pending') filter)
```

#### Table Row Rendering
Replaced proposal-specific rendering with quote request data:
- **Name column**: Shows customer name + email (if available)
- **Service column**: Displays service type as badge (e.g., "General Inquiry")
- **Phone column**: Shows phone number in monospace font
- **Status column**: Color-coded badges (Pending=amber, Contacted=blue, Converted=green, Dismissed=gray)
- **Actions column**: "Mark Contacted" button for pending requests only

#### Status Badge Styling
```typescript
req.status === 'pending' ? 'bg-amber-100 text-amber-800' :
req.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
req.status === 'converted' ? 'bg-green-100 text-green-800' :
'bg-slate-100 text-slate-800'
```

### Empty State
Changed empty state message from "No proposals found. Start by creating a client and starting a project." to "No quote requests yet. Quote requests from the website contact form will appear here."

---

## 2. Impact

### Dashboard UX Flow
1. **Pending Quote Requests section** (above) — Shows pending requests with quick actions
   - "New Estimate" button to pre-populate client data
   - "Mark Contacted" to move from pending state
2. **Quote Requests table** (main) — Shows all submissions (pending, contacted, converted, dismissed)
   - Complete history of customer inquiries
   - Status tracking across lifecycle
   - Direct phone/email contact links

### Data Flow
- Contact form on SchmidtWalls → Submits to admin Supabase `quote_requests` table
- Dashboard loads all quote requests via Supabase REST API
- No dependency on `proposals` or `projects` tables for quote management
- Admins can create formal proposals from contact data using "New Estimate" button

---

## 3. Git History

**Commit:** `dac3342` — refactor: replace Active Proposals with Quote Requests in dashboard
- 45 insertions, 35 deletions
- Single file: `src/app/(app)/dashboard/page.tsx`
- Pushed to GitHub main branch

---

## 4. Deployment Status

**Current state:**
- Code changes committed and pushed to `github.com:Mattjhagen/SchmidtAdmin.git`
- Netlify auto-deploy in progress (typical build time: 2–5 minutes)
- URL: https://login.schmidt-construction.com/dashboard

**Next action:** Confirm deploy completed and verify quote requests display in production

---

## 5. Test Data

From earlier session context, 6 quote requests exist in admin Supabase `quote_requests` table:
- All submitted via the contact form modal on SchmidtWalls
- Current status: primarily "pending"
- Dashboard should display all 6 once redeploy completes

---

## 6. Files Touched (Day 10)

**Modified**
- `SchmidtAdmin/src/app/(app)/dashboard/page.tsx` — Section refactoring + query update

**No new files** — existing component structure retained, only table content changed

---

## 7. Notes / Next Steps

- **Verify deployment**: Check https://login.schmidt-construction.com/dashboard after Netlify build completes
- **Test quote workflows**: Confirm "Mark Contacted" button works and transitions status correctly
- **Monitor form submissions**: Future contact form submissions should appear immediately on dashboard
- **Consider future enhancements**:
  - Export quote requests (CSV, PDF)
  - Search/filter by status, date, or service type
  - Bulk actions (mark multiple as contacted, convert to estimate)
  - Email notification when new quote arrives

---

## 8. Architecture Notes

**Why remove the proposals table?**
- User switched from guided wizard → simple contact form for quote collection
- Proposals table adds schema complexity without active use
- Contact form data is lighter weight and faster to process
- Can create formal proposals (with versions, totals, etc.) on demand from quote data
- Simpler for admins: one unified inbox for all incoming inquiries

**Data model now:**
```
Contact Form (SchmidtWalls)
    ↓
quote_requests table (Admin Supabase)
    ↓
Dashboard view (read all statuses)
    ↓
Admin actions: Mark Contacted → Create Estimate → Formal Proposal (if needed)
```

