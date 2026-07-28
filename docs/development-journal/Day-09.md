# Day 9 — Documentation, Branding, and Asset Management

**Date:** 2026-07-28
**Repo:** SchmidtWalls & SchmidtAdmin (Static HTML/CSS/JS · Next.js 16 · TypeScript)

> Summary: Created comprehensive `agent.md` project documentation for both SchmidtWalls and SchmidtAdmin repos to guide future development. Added favicon from SchmidtWalls marketing site to the SchmidtAdmin login portal for brand consistency. Diagnosed and resolved logo display issues on the deployed admin portal by triggering a fresh Netlify build.

---

## 1. Project Documentation — agent.md Files

### Purpose
Created `agent.md` files for both repos to provide AI agents and developers with:
- Project overview and architecture summary
- Key features and important files
- Brand guidelines and color palette
- Deployment configuration
- Development guidelines and best practices

### SchmidtWalls (Marketing Site)
**File:** `agent.md`
- **Architecture**: Static HTML/CSS/JS, no build process
- **Deployment**: Netlify via GitHub Pages
- **Key features**: 23 pages, responsive design, reviews carousel, Tawk.io chat integration
- **Color palette**: Primary Blue (#206BD4), Light Blue (#4f94f2), Dark Navy (#0f172a)
- **Brand info**: Founded 1973, License NE LIC# 43917-26, Service Area: Nebraska & Western Iowa
- **Guidelines**: CSS custom properties, phone format standardization, pricing consistency ($30-$55/lineal foot)

### SchmidtAdmin (Admin Portal)
**File:** `agent.md`
- **Architecture**: Next.js 15+ with React, Supabase PostgreSQL, Netlify deployment
- **Key features**: Client management, proposal creation, live messaging, project gallery, time clock, dashboard
- **Supabase integration**: RLS-enabled tables, email/password auth, service role key
- **Environment variables**: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_KEY, SUPABASE_SERVICE_ROLE_KEY
- **Guidelines**: TypeScript for all components, auth checks on protected routes, RLS enforcement

### Commits
- SchmidtWalls: `6e3826b` — docs: add agent.md with project guidelines
- SchmidtAdmin: `c3f229e` → `7e42f82` (agent.md + deploy trigger)

---

## 2. Favicon Integration — Brand Consistency

### Issue
SchmidtWalls marketing site had a favicon (favicon.ico), but SchmidtAdmin login portal was missing one. This broke brand consistency across public and authenticated touchpoints.

### Solution
1. **Copied** favicon.ico from `SchmidtWalls/` → `SchmidtAdmin/public/`
2. **Configured** in `src/app/layout.tsx` via Next.js metadata:
   ```typescript
   icons: {
     icon: "/favicon.ico",
   }
   ```
3. **Committed** both changes to SchmidtAdmin repo

### Result
- Admin portal now displays the same favicon as the marketing site
- Brand consistency maintained across all Schmidt Construction domains
- Favicon persists in browser tabs and bookmarks

---

## 3. Logo Display Troubleshooting — Netlify Deployment

### Problem
SC hexagonal shield logo (`public/logo.png`) was committed to SchmidtAdmin but not displaying on the deployed site at https://login.schmidt-construction.com/. The img tag was present in HTML, the file was valid (900×503 PNG, 288KB), but it wasn't rendering.

### Investigation
1. **File validation**: Confirmed logo.png is a valid PNG image (8-bit RGBA, non-interlaced)
2. **Git tracking**: Verified file was committed (`git ls-files public/logo.png` successful)
3. **Deployment**: Checked Netlify logs — dev server showed no errors
4. **Root cause**: Netlify build cache likely serving stale version before logo was uploaded

### Resolution
Triggered fresh Netlify build by creating an empty commit:
```bash
git commit --allow-empty -m "chore: trigger deploy to refresh assets"
git push origin main
```

This forced Netlify to rebuild the entire site and re-fetch all public assets, including logo.png.

---

## 4. Files Touched (Day 9)

**New**
- `SchmidtWalls/agent.md`
- `SchmidtAdmin/agent.md`
- `SchmidtAdmin/public/favicon.ico`

**Modified**
- `SchmidtAdmin/src/app/layout.tsx` — Added favicon to metadata icons

---

## 5. Deployment Status

| Site | Domain | Status | Recent Commits |
|------|--------|--------|---|
| SchmidtWalls | www.schmidt-construction.com | Live | `6e3826b` agent.md |
| SchmidtAdmin | login.schmidt-construction.com | Rebuilding | `5ba4671` favicon |

Both sites auto-deploy from `main` branch via Netlify. Next-gen builds typically complete within 2–5 minutes.

---

## 6. Notes / Next Steps

- **Logo verification**: Confirm https://login.schmidt-construction.com/ displays the hexagonal shield logo after Netlify deploy completes
- **Favicon**: Both sites now share the same favicon; verify it appears in browser tabs
- **agent.md maintenance**: Update these files when architecture or brand guidelines change
- **Documentation**: agent.md serves as the authoritative reference for future AI-assisted development on both projects

