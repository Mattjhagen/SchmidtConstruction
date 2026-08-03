# Day 11 — SchmidtWalls Header & Map Cleanup

**Date:** 2026-08-03
**Repo:** SchmidtWalls (static HTML · Netlify · `www.schmidt-construction.com`)

> Summary: Cleaned up the marketing site header and project map. Removed duplicate/misplaced contact info from the nav bar, stripped the dark topbar from `index.html`, removed all non-retaining-wall markers and photos from the service areas map, and wired up 9 confirmed retaining-wall project photos to map popups.

---

## 1. Header Contact Info

### Problem
The nav bar showed phone numbers for Mike and Mikiel but no names or emails, making it unclear who to contact for what.

### Changes
**Files:** all 22 `*.html` pages

- Added names (`Mike:`, `Mikiel:`) and email links alongside each phone number in the nav contact block.
- Discovered a separate dark `topbar` div (index.html only) already had the correct contact info — the nav block was a duplicate.
- Removed the contact block from the nav entirely across all 22 pages (only the topbar on index.html should show it).
- Subsequently removed the topbar from `index.html` entirely at user request — contact info is now only in the `<nav>` if re-added, or simply absent.

**Final state:** Clean white nav with logo, navigation links, and "Free Estimate" CTA only. No contact strip.

---

## 2. Project Map — Non-Retaining-Wall Markers Removed

### Problem
The service-areas map (`service-areas.html`) had 6 markers for non-retaining-wall project types: Concrete (×2), Kitchen Remodel, Bathroom Remodel (×2), Water Feature.

### Changes
**File:** `service-areas.html`

Removed these entries from `PROJECTS`:
| Name | Type |
|------|------|
| Julie C. | Concrete |
| Richard P. | Concrete |
| Kris K. | Kitchen Remodel |
| Sushama C. | Bathroom Remodel |
| Donna N. | Bathroom Remodel |
| Jerry & Carol S. | Water Feature |

19 retaining-wall markers remain.

---

## 3. Project Map — Photo Audit & Cleanup

### Problem
The `images/` folder contained 25 `project-map-*.jpg` files mixed in with kitchen remodels, pest bait stations, hardware store shelves, truck engines, bathroom tiles, scooters, office lobby signage, and HEIC iPhone photos — none of which belong on a retaining wall contractor's map.

### Audit Results (AI vision classification)
| Classification | Count | Files |
|---|---|---|
| Retaining wall ✓ | 9 | 2, 3, 4, 5, 11, 12, 13, 17, 18 |
| Not retaining wall ✗ | 13 | 0, 1, 6, 8, 9, 10, 14, 15, 16, 20, 21, 22, 24 |
| HEIC (unviewable in browser) | 3 | 7, 19, 23 |
| 404 | 1 | 25 |

### Changes
- Deleted all 16 non-retaining-wall images (13 bad + 3 HEIC) from the repo.
- Updated `service-areas.html` to replace the generic `TYPE_PHOTOS` lookup with a `MAP_PHOTOS` array of the 9 confirmed retaining-wall images, cycling through them across the 19 markers:
  - `project-map-2.jpg` — sheet-pile seawall installation (aerial, excavator)
  - `project-map-3.jpg` — vinyl sheet-pile seawall with lumber cap
  - `project-map-4.jpg` — sheet-pile seawall wide view
  - `project-map-5.jpg` — failing timber wall before replacement
  - `project-map-11.jpg` — stone/masonry retaining wall
  - `project-map-12.jpg` — new segmental block wall replacing railroad ties
  - `project-map-13.jpg` — same block wall, different angle
  - `project-map-17.jpg` — block wall with integrated steps
  - `project-map-18.jpg` — residential front-yard block wall with steps

---

## Key Files Changed
- `service-areas.html` — PROJECTS array, MAP_PHOTOS, marker popup logic
- `index.html` — topbar removed
- All 22 `*.html` pages — nav contact block cleanup
- `images/project-map-{0,1,6,7,8,9,10,14,15,16,19,20,21,22,23,24}.jpg` — deleted
