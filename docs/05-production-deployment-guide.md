# Production Deployment Guide: Manish Kumawat Portfolio

This guide details the exact steps required to deploy the portfolio to production on **Vercel** with a live **Supabase** backend, **Resend** transactional email, and **Cloudflare Turnstile** bot protection.

---

## 1. Environment Variables Audit

The production deployment requires exactly **nine** environment variables.

| Variable | Scope | Description & Source |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public / Client | Supabase Project URL (`https://xyzcompany.supabase.co`). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public / Client | Supabase Anonymous Key (safe in browser; governed strictly by RLS). |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server-Only** | Privileged key bypassing RLS. Reached only through `lib/supabase/admin.ts`. **Never** prefix with `NEXT_PUBLIC_`. |
| `NEXT_PUBLIC_SITE_URL` | Public / Client | Canonical URL (e.g. `https://manishkumawat.com`). |
| `RESEND_API_KEY` | **Server-Only** | API Key from Resend dashboard (`re_...`). |
| `RESEND_FROM_EMAIL` | Server-Only | Verified sender address (e.g. `contact@manishkumawat.com`). |
| `CONTACT_NOTIFY_EMAIL` | Server-Only | Destination inbox where contact notifications arrive (e.g. `manish@manishkumawat.com`). |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Public / Client | Cloudflare Turnstile Site Key for the public contact widget. |
| `TURNSTILE_SECRET_KEY` | **Server-Only** | Cloudflare Turnstile Secret Key for server-side verification. |
| `CONTACT_IP_SALT` | Server-Only | Cryptographic salt for hashing IP addresses in `contact_submissions` (e.g. random 32-char hex). |

> [!CAUTION]
> **Law #3**: Never prefix `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, or `TURNSTILE_SECRET_KEY` with `NEXT_PUBLIC_`. They must remain server-side only.

---

## 2. Supabase Live Setup

1. **Create or Open Supabase Project**:
   - Log in to [supabase.com](https://supabase.com) and navigate to your project dashboard.
2. **Execute Database Migrations**:
   - Go to the **SQL Editor** in your Supabase dashboard.
   - Run the files in `supabase/migrations/` in sequence:
     1. `0001_enums.sql`
     2. `0002_tables.sql`
     3. `0003_rls_and_policies.sql`
     4. `0004_storage.sql`
   - *(Optional for initial content)* Run `supabase/seed.sql` to populate initial projects, copy keys, and settings.
3. **Create Authorized Administrator**:
   - In Supabase dashboard → **Authentication** → **Users**, click **Add User** (Create User with email & password).
   - Copy the newly created user's **UUID**.
   - In the **SQL Editor**, insert that UUID into the `admins` table:
     ```sql
     insert into public.admins (user_id, email)
     values ('YOUR-USER-UUID-HERE', 'admin@manishkumawat.com');
     ```
   - Only accounts present in `public.admins` can access `/admin`.
4. **Verify Storage Buckets**:
   - In Supabase dashboard → **Storage**, confirm two buckets exist:
     - `media` (Public: Enabled)
     - `documents` (Public: Enabled)
   - Ensure the RLS storage policies from `0004_storage.sql` are active.

---

## 3. Vercel Deployment

1. **Push Code to GitHub**:
   - Push your working branch to your GitHub repository.
2. **Import Project into Vercel**:
   - Log in to [vercel.com](https://vercel.com) and click **Add New...** → **Project**.
   - Select your repository.
   - Set **Root Directory** to `Portfolio - Manish Kumawat` (if using the subdirectory) or `./` if at the repo root.
   - Framework preset will automatically detect **Next.js**.
3. **Configure Environment Variables**:
   - Paste all 9 environment variables into the **Environment Variables** section for both `Production` and `Preview`.
4. **Deploy**:
   - Click **Deploy**. Vercel will run `npm run build` and launch the project on an edge CDN.
5. **Connect Custom Domain**:
   - Under Project Settings → **Domains**, add `manishkumawat.com` and `www.manishkumawat.com`.
   - Update your DNS A / CNAME records as directed by Vercel.

---

## 4. Resend & Cloudflare Turnstile Configuration

### Resend (Contact Delivery)
1. Add your custom domain (e.g. `manishkumawat.com`) in [resend.com/domains](https://resend.com/domains).
2. Add the provided DKIM, SPF, and DMARC TXT records to your DNS provider.
3. Once verified, generate an API key and set `RESEND_FROM_EMAIL=contact@manishkumawat.com`.

### Cloudflare Turnstile (Anti-Spam)
1. Navigate to the Cloudflare dashboard → **Turnstile**.
2. Add a new widget for your domain (`manishkumawat.com` and `localhost` for testing).
3. Copy the **Site Key** (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`) and **Secret Key** (`TURNSTILE_SECRET_KEY`).

---

## 5. End-to-End Verification Checklist

- [ ] **Hero Headline**: Loads smoothly via Instrument Sans clamp scale with zero layout shift.
- [ ] **Deployment Trace Chart**: Renders horizontal timeline on desktop and vertical axis on mobile with latest ongoing marker `◆` in `--mark`.
- [ ] **Work & Case Studies**: Individual `/work/[slug]` pages render Problem → Approach → Outcome with blur-up media.
- [ ] **Contact Form**: Submitting the form delivers an email via Resend and creates a row in `contact_submissions`.
- [ ] **Admin Console (`/admin`)**:
  - Gated by root `middleware.ts`.
  - Non-admins are rejected with `unauthorized`.
  - Authorized admins can edit copy, update site settings, and reorder sections with instant cache invalidation.
- [ ] **Submissions Inbox (`/admin/inbox`)**:
  - Real submissions show up immediately with status controls and mailto reply.
