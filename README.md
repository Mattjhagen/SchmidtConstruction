# Schmidt Construction - Estimating & Proposals App

An Omaha-local family contractor web app for creating, revising, sending, and negotiating construction proposals with clients. Includes electronic signatures, version side-by-side comparisons, audit trail logging, and automatic expiration warnings.

---

## Key Features

- **Pipeline Dashboard**: High-fidelity metrics (Total Pipeline, Secured Contracts, Out for Review, Drafts) and near-expiration alerts.
- **Client Directory**: Track client contact profiles and link projects.
- **Proposal Versioning**: Direct "Draft Revision" duplicating of estimates to preserve historical versions.
- **Side-by-Side Comparisons**: Inspect scope and pricing adjustments side-by-side between any proposal versions.
- **Client Portal**: Public portal URL `/portal/[share_token]` containing project scopes, optional add-on math totals, commentary feed, and electronic signatory authorizing.
- **Operational Audits**: Complete operational audit trail of creation, revisions, portal views, and signature accepts.
- **Server-Side Sanitization**: Public portals use Next.js Server Components to sanitize payloads before serialization, preventing estimators' `internal_notes` from ever being sent to the client browser.

---

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4 with Slate/Amber contractor palette
- **Icons**: Lucide React
- **Database**: Supabase PostgreSQL (Production) / LocalStorage Adapter (Demo Mode Fallback)

---

## Environment Variables Configuration

To run in **Supabase mode**, configure the following variables in a `.env.local` file at the root of the project:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_public_key
```

If these keys are missing, the app automatically runs in **Demo Mode**, pre-seeding the browser's `localStorage` with mock clients, projects, proposals, and logs.

---

## Database Migrations

Database tables, constraints, indexes, and Row Level Security (RLS) policies are organized inside the `supabase/migrations/` directory:

1. `20260630000000_init.sql`: Sets up core tables (`clients`, `projects`, `proposals`, `proposal_versions`, `proposal_line_items`, `negotiation_events`) and secure `share_token` SELECT select policies for anon public portal users.
2. `20260630010000_phase_2_security.sql`: Updates proposals with `expiration_date` and defines the `audit_logs` security trail table.

To deploy migrations onto a live Supabase instance:
- Copy the migration SQL directly into the Supabase SQL Editor, or
- Run the Supabase CLI: `supabase db push`

---

## Local Development & Testing

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Start Dev Server**:
   ```bash
   npm run dev
   ```
3. **Integration Verification Script**:
   Verify migration RLS policies and table structures against a live Supabase database instance:
   ```bash
   node scripts/test-supabase.js
   ```

---

## Vercel Production Deployment

To host this estimating tool in production:

1. **Create Vercel Project**: Link your Git repository on the Vercel Dashboard.
2. **Inject Environment Variables**: In project settings under Environment Variables, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Deploy**: Build commands will automatically compile and optimize static/dynamic routing elements. Ensure your Supabase instance has had the migration scripts run prior to deployment.
