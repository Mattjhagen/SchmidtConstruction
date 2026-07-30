<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Tomorrow's Work — Day 11 (2026-07-30)

## Priority 1: Verify Quote Requests Display

**Issue:** Dashboard now shows "Quote Requests" section but displays empty state despite 6+ quote requests existing in Supabase.

**Investigation Checklist:**
- [ ] Verify `quote_requests` table RLS policies allow SELECT for authenticated users
- [ ] Test Supabase query directly in console to confirm data is readable
- [ ] Check browser console for JavaScript errors
- [ ] Inspect network requests for failed API calls
- [ ] Confirm auth state and user permissions

**Success:** Dashboard displays all quote requests with Name, Service, Phone, Status columns populated.

---

## Priority 2: Test Quote Workflows

Once data loads:
- [ ] "Mark Contacted" button transitions pending requests to contacted status
- [ ] Status updates reflect immediately in dashboard
- [ ] "New Estimate" button pre-populates client data
- [ ] Email/phone links are functional

---

## Priority 3: Verify Contact Form Integration

Confirm end-to-end flow:
- [ ] Submit test quote via SchmidtWalls contact form
- [ ] Data appears in admin Supabase within 5 seconds
- [ ] Quote appears on dashboard after refresh
- [ ] Form displays success message

---

## Key Files
- **Dashboard:** `SchmidtAdmin/src/app/(app)/dashboard/page.tsx` (Lines 427–505)
- **Supabase Schema:** `SchmidtAdmin/supabase/migrations/` (Check quote_requests RLS)
- **Contact Form:** `SchmidtWalls/js/contact-form.js` (Verify API endpoints)

---

## Escalation Path
If quote requests don't load:
1. Check Supabase project logs and RLS policies
2. Verify environment variables on Netlify
3. Test with direct Supabase client query
4. Review quote_requests table schema and indexes
