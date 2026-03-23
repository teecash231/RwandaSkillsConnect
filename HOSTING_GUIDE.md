# Rwanda SkillsConnect — Complete Hosting Guide
# From Your PC → GitHub → Vercel (Live Public App)

---

## PHASE 1 — Clean Up Before Uploading to GitHub

These files exist in your project but should NOT go to GitHub because they are
test files, documentation clutter, or sensitive. Clean them up first.

### 1.1 — Files you can DELETE (test/debug files, not needed in production)

Delete these files from your project folder:
```
debug-signup.html
test-admin-dashboard.html
test-admin-functionality.html
test-auth-fix.html
test-auth-flow.html
test-delete-functionality.html
test-freelancer-setup.html
test-login-fix.html
test-supabase.html
test-user-registration.html
setup-check.html
setup-complete.html
verify-setup.html
system-check.html
test-deletion.js
```

### 1.2 — Markdown docs you can DELETE (internal dev notes, not needed)

```
ADMIN_CREDENTIALS.md
ADMIN_DASHBOARD_COMPLETE_FIX.md
ADMIN_DASHBOARD_FIXES.md
ADMIN_JS_ERRORS_FIXED.md
AUTH_FIX_DOCUMENTATION.md
CLEANUP_SUMMARY.md
cleanup-log.md
FILES_ROADMAP.md
FREELANCER_DASHBOARD_IMPROVEMENTS.md
OTP_CONVERSION_GUIDE.md
PROJECT_COMPLETION_GUIDE.md
PROJECT_TECH_STACK.md
USER_REGISTRATION_FIXES.md
```

### 1.3 — IMPORTANT: Supabase Keys

Your file `js/supabaseClient.js` contains your Supabase URL and anon key.
The anon key is PUBLIC by design (it is safe to commit), BUT make sure your
Supabase Row Level Security (RLS) is enabled on all tables — this is your
real protection. Do NOT commit any service_role key anywhere.

---

## PHASE 2 — Upload Your Project to GitHub

### 2.1 — Create a GitHub account (if you don't have one)
1. Go to https://github.com
2. Click Sign Up → use your email → create account
3. Your username is shown top-right after login (e.g. roujee231)

### 2.2 — Create a new repository on GitHub
1. Click the + icon (top-right) → New repository
2. Repository name: `rwanda-skillsconnect`
3. Set to Public (so Vercel can access it for free)
4. DO NOT check "Add README" or "Add .gitignore" (you already have these)
5. Click Create repository
6. GitHub will show you a page with commands — keep this tab open

### 2.3 — Open Terminal in your project folder
In VS Code:
- Press Ctrl + ` (backtick) to open the terminal
- Make sure it shows: `C:\RSC\pre\rwanda-skillsconnect>`

### 2.4 — Run these commands ONE BY ONE

```bash
git init
```
(Initializes git in your project — only needed once)

```bash
git add -A
```
(Stages all your files for upload)

```bash
git commit -m "initial deploy"
```
(Saves a snapshot of your project)

```bash
git branch -M main
```
(Names your branch "main")

```bash
git remote add origin https://github.com/roujee231/rwanda-skillsconnect.git
```
(Links your local project to your GitHub repo)

```bash
git push -u origin main
```
(Uploads everything to GitHub)

### 2.5 — GitHub will ask for login credentials
- Username: your GitHub username (e.g. roujee231)
- Password: NOT your GitHub password — you need a Personal Access Token

**How to get a Personal Access Token:**
1. Go to https://github.com/settings/tokens
2. Click Generate new token → Generate new token (classic)
3. Note: give it a name like "vercel deploy"
4. Expiration: 90 days or No expiration
5. Check the box: repo (full control of private repositories)
6. Click Generate token
7. COPY the token immediately — you won't see it again
8. Paste it as your password when git asks

### 2.6 — Verify upload worked
Go to: https://github.com/roujee231/rwanda-skillsconnect
You should see all your files listed there.

---

## PHASE 3 — Configure Supabase for Production

Before deploying, make sure Supabase is ready for public users.

### 3.1 — Set your live site URL in Supabase
1. Go to https://supabase.com → login → open your project
2. Go to Authentication → URL Configuration
3. Set Site URL to: `https://rwanda-skillsconnect.vercel.app`
   (You'll get this URL after deploying in Phase 4 — come back and set it)
4. Under Redirect URLs, add:
   ```
   https://rwanda-skillsconnect.vercel.app/**
   https://rwanda-skillsconnect.vercel.app/auth-callback.html
   ```

### 3.2 — Check Row Level Security (RLS) is ON
1. In Supabase → go to Table Editor
2. Click each table → check that RLS is enabled (green shield icon)
3. This protects your data from unauthorized access

### 3.3 — Check Email settings (for registration/OTP)
1. Go to Authentication → Providers → Email
2. Make sure "Enable Email provider" is ON
3. For production, consider setting up a custom SMTP (optional but recommended)
   - Supabase free tier has a limit of 3 emails/hour
   - Use Resend.com (free) or SendGrid for more emails

---

## PHASE 4 — Deploy on Vercel

### 4.1 — Create a Vercel account
1. Go to https://vercel.com
2. Click Sign Up → Continue with GitHub
3. Authorize Vercel to access your GitHub account

### 4.2 — Import your project
1. On Vercel dashboard → click Add New Project
2. Find `rwanda-skillsconnect` in the list → click Import
3. Vercel will detect your `vercel.json` automatically

### 4.3 — Configure build settings
Vercel should auto-detect these from your vercel.json, but verify:
- Framework Preset: Other
- Build Command: `npm run build`
- Output Directory: `.` (a single dot — means root folder)
- Install Command: `npm install`

### 4.4 — Deploy
1. Click Deploy
2. Wait 1-2 minutes
3. Vercel gives you a live URL like: `https://rwanda-skillsconnect.vercel.app`

### 4.5 — Go back to Supabase and set the URL
Now that you have your Vercel URL, go back to Phase 3.1 and set:
- Site URL: `https://rwanda-skillsconnect.vercel.app`
- Redirect URLs: `https://rwanda-skillsconnect.vercel.app/**`

---

## PHASE 5 — Test Your Live App

### 5.1 — Test these flows on the live URL
Open https://rwanda-skillsconnect.vercel.app and test:

- [ ] Home page loads correctly
- [ ] Register a new account (worker role)
- [ ] Register a new account (employer role)
- [ ] Login works
- [ ] Forgot password email arrives
- [ ] OTP verification works
- [ ] Freelancer dashboard loads
- [ ] Employer dashboard loads
- [ ] Admin dashboard loads (use your admin credentials)
- [ ] Job posting works
- [ ] Job browsing works
- [ ] Profile page loads

### 5.2 — Check browser console for errors
1. Open your live site
2. Press F12 → Console tab
3. Look for any red errors
4. Common issues and fixes are in Phase 6

---

## PHASE 6 — Common Problems & Fixes

### Problem: "Invalid API key" or Supabase not connecting
Fix: Check `js/supabaseClient.js` — make sure SUPABASE_URL and SUPABASE_ANON_KEY
are correct. Get them from Supabase → Project Settings → API.

### Problem: Login redirects to wrong page or loops
Fix: In Supabase → Authentication → URL Configuration, make sure Site URL
is set to your exact Vercel URL (no trailing slash).

### Problem: Email confirmation link doesn't work
Fix: In Supabase → Authentication → URL Configuration → Redirect URLs,
add: `https://rwanda-skillsconnect.vercel.app/**`

### Problem: Images/uploads not showing
Fix: Your `uploads/` folder is in .gitignore (correct). For production,
all file uploads must go to Supabase Storage, not your local folder.
Make sure your upload code points to Supabase Storage bucket.

### Problem: Page shows 404 on refresh
Fix: Your `vercel.json` already handles this with rewrites. If still broken,
check that vercel.json was committed and pushed to GitHub.

### Problem: CSS/styles not loading
Fix: Run `npm run build` locally first, then push again:
```bash
npm run build
git add -A
git commit -m "rebuild css"
git push
```

---

## PHASE 7 — Pushing Future Updates

Every time you make changes to your project:

```bash
git add -A
git commit -m "describe what you changed"
git push
```

Vercel automatically detects the push and redeploys in ~30 seconds.
Your live site updates without any manual action.

---

## PHASE 8 — Optional: Custom Domain

If you want `www.rwandaskillsconnect.com` instead of `.vercel.app`:

1. Buy a domain from Namecheap, GoDaddy, or Google Domains (~$10-15/year)
2. In Vercel dashboard → your project → Settings → Domains
3. Add your domain → Vercel gives you DNS records
4. In your domain registrar, add those DNS records
5. Wait 24-48 hours for DNS to propagate
6. Update Supabase Site URL to your new custom domain

---

## QUICK REFERENCE — Commands You'll Use Most

### First time upload to GitHub:
```bash
git init
git add -A
git commit -m "initial deploy"
git branch -M main
git remote add origin https://github.com/roujee231/rwanda-skillsconnect.git
git push -u origin main
```

### Every update after that:
```bash
git add -A
git commit -m "your message here"
git push
```

### If you need to rebuild CSS before pushing:
```bash
npm run build
git add -A
git commit -m "update styles"
git push
```

---

## YOUR PROJECT LINKS (fill these in after deploying)

- GitHub repo:  https://github.com/roujee231/rwanda-skillsconnect
- Live app:     https://rwanda-skillsconnect.vercel.app  (confirm after deploy)
- Supabase:     https://supabase.com/dashboard
- Vercel:       https://vercel.com/dashboard

---

*Guide created for Rwanda SkillsConnect — roujee231*
