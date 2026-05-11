# Kezia Kenova — Site + Admin Portal

A link-in-bio style site with a full admin backend. Built with Next.js + Supabase.

## What's inside

**Public site** (`/`)
- Loading screen with logo
- Hero image, social links (Instagram, TikTok, Email)
- Product grid in 4 categories: Jewellery, Makeup, Fashion, Skincare
- Newsletter signup form
- Affiliate disclosure
- All content is dynamic — pulled from the database

**Admin portal** (`/admin`)
- Login with email + password
- Dashboard with stats (products, subscribers, total clicks, weekly clicks)
- Products manager — add, edit, delete, hide/show, reorder
- Subscribers list with CSV export
- Analytics — last 7 days chart + top performing products by clicks

---

## One-time setup (you do this once)

### Step 1 — Create a Supabase project (free)

1. Go to [supabase.com](https://supabase.com), sign up, click **New Project**
2. Name: `kezia-kenova` (or anything). Region: closest to where Kezia lives. Pick a strong DB password and save it somewhere.
3. Wait ~1 minute for it to spin up.

### Step 2 — Run the database setup script

1. In your Supabase project, click **SQL Editor** in the left nav
2. Click **+ New query**
3. Open the file `supabase-setup.sql` from this project, copy everything, paste into the editor
4. Click **Run**
5. You should see "Success. No rows returned." — that means it worked.

### Step 3 — Create the admin login account

1. Still in Supabase, click **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Email: Kezia's email (or yours for testing)
4. Password: pick a strong one — this is what gets her into `/admin`
5. **Check "Auto Confirm User"**
6. Click **Create user**

That's the login for the admin portal.

### Step 4 — Get your Supabase credentials

1. In Supabase, click the **gear icon** (Project Settings) → **API**
2. Copy two values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### Step 5 — Deploy to Vercel

1. Push this folder to a GitHub repo (or drag-drop the folder at [vercel.com/new](https://vercel.com/new))
2. When Vercel asks for **Environment Variables**, add these two:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | (your Project URL from step 4) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (your anon key from step 4) |

3. Click **Deploy**. About 90 seconds later, your site is live.

### Step 6 — (optional) Connect a custom domain

In Vercel → your project → **Settings → Domains** → add `keziakenova.com` and follow the DNS instructions. The admin portal will then live at `keziakenova.com/admin`.

---

## How Kezia uses it

1. She goes to `keziakenova.com/admin`
2. Logs in with the email + password you set in Step 3
3. Clicks **Products** → **+ Add Product**
4. Fills in: name, brand, category, the affiliate link, an image URL
5. Saves. The product appears on her live site immediately.

To edit later: click the product → **Edit**. To remove: **Delete** or uncheck "Visible on site" to hide without deleting.

To get email subscribers: click **Subscribers** → **Export CSV** → opens in Excel or Mail Merge.

To see what's performing: **Analytics** shows last 7 days of clicks and top products.

---

## Local development

If you want to run it on your Mac before deploying:

```bash
cp .env.example .env.local
# edit .env.local with your real Supabase URL + key
npm install
npm run dev
```

Then open http://localhost:3000

---

## Files you'll want to edit later

- **Hero photo**: replace `public/kezia.jpeg`
- **Site title / metadata**: `app/layout.js`
- **Loading screen logo**: `components/LoadingScreen.js` (currently a styled "K" — swap for an SVG of her real logo when ready)
- **Section subtitles** (e.g. "pieces I wear every day"): `app/HomePage.js`, search for `SECTION_SUBS`

Everything else (products, social links, bio, location) is editable from the admin panel — no code changes needed.
