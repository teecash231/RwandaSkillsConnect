# Rwanda SkillsConnect — Files Roadmap (All Phases)

## Legend
- ✅ Complete
- 🔧 Modified in this phase
- 🆕 Created in this phase
- ⏳ Pending (future phase)

---

## PHASE 0 — PROJECT ANALYSIS (Analysis Only, No Code)

**Purpose:** Scan existing PHP/MySQL project, document architecture.

| File | Role |
|------|------|
| `app/Controllers/*.php` | PHP business logic (to be replaced) |
| `app/Models/*.php` | PHP data layer (to be replaced) |
| `app/Views/**/*.php` | PHP templates (to be migrated to HTML) |
| `app/Config/Database.php` | MySQL connection config |

**Output:** Architecture summary, data flow diagram.

---

## PHASE 1 — AUTHENTICATION ✅

**Purpose:** Replace PHP sessions with Supabase Auth.

| File | Status | Description |
|------|--------|-------------|
| `js/supabaseClient.js` | ✅ | Supabase JS client init |
| `js/config.js` | ✅ | SUPABASE_URL + ANON_KEY |
| `js/auth.js` | ✅ | Core auth helpers |
| `js/signup.js` | ✅ | Register with role selection |
| `js/login.js` | ✅ | Login + role-based redirect |
| `js/auth-utils.js` | ✅ | Session guard utilities |
| `js/auth-init.js` | ✅ | Page-level auth initializer |
| `js/dashboard-auth.js` | ✅ | Dashboard session check |
| `js/verifyOtp.js` | ✅ | OTP email verification |
| `js/forgotPassword.js` | ✅ | Password reset request |
| `js/resetPassword.js` | ✅ | Password reset handler |
| `login.html` | ✅ | Login page |
| `signup.html` | ✅ | Register page |
| `register.html` | ✅ | Alternate register page |
| `otp-verification.html` | ✅ | OTP verify page |
| `otp-verify.html` | ✅ | OTP verify (alternate) |
| `verify-otp.html` | ✅ | OTP verify (alternate) |
| `forgot-password.html` | ✅ | Forgot password page |
| `reset-password.html` | ✅ | Reset password page |
| `auth-callback.html` | ✅ | Supabase auth redirect handler |
| `role-selection.html` | ✅ | Role picker after signup |
| `email-confirmation.html` | ✅ | Email confirmed landing |
| `supabase-schema.sql` | ✅ | profiles table + auth trigger |

**Supabase:** `profiles` table, `handle_new_user()` trigger.

---

## PHASE 2 — FRONTEND CLEANUP ✅

**Purpose:** Remove PHP form actions, replace with JS + Supabase.

| File | Status | Description |
|------|--------|-------------|
| `index.html` | ✅ | Landing page (static) |
| `about.html` | ✅ | About page (static) |
| `profile.html` | ✅ | User profile editor |
| `browse.html` | ✅ | Worker/job browse page |
| `js/db.js` | ✅ | Generic Supabase query helpers |
| `js/worker-data.js` | ✅ | Worker-specific data helpers |
| `js/employer-data.js` | ✅ | Employer-specific data helpers |
| `assets/js/supabase-auth.js` | ✅ | Auth state management |
| `assets/js/role-access-control.js` | ✅ | Role-based page guards |
| `assets/js/storage-utils.js` | ✅ | File upload helpers |
| `vercel.json` | ✅ | Static routing config |

---

## PHASE 3 — DATABASE DESIGN ✅

**Purpose:** Full PostgreSQL schema for Supabase.

| File | Status | Description |
|------|--------|-------------|
| `supabase-schema.sql` | ✅ | Complete schema: all tables, indexes, triggers, RLS |

**Tables created:**
- `profiles` — users (admin/employer/worker)
- `jobs` — job listings
- `job_applications` — applications with UNIQUE(job_id, worker_id)
- `conversations` — chat threads
- `messages` — chat messages
- `notifications` — user notifications
- `ewallets` — wallet per user
- `ewallet_transactions` — immutable transaction log
- `ewallet_withdrawals` — withdrawal requests
- `payments` — employer→worker payments

---

## PHASE 4 — JOB SYSTEM ✅ ← CURRENT PHASE

**Purpose:** Employer posts/manages jobs; workers browse and apply.

| File | Status | Description |
|------|--------|-------------|
| `js/jobs.js` | ✅ | JobService module (createJob, getOpenJobs, applyToJob, etc.) |
| `post-job.html` | ✅ | 3-step job creation form (employer only) |
| `jobs.html` | ✅ | Employer job management (filter, status change, delete) |
| `find-jobs.html` | ✅ | Worker job browser with search/filter + apply modal |
| `my-applications.html` | 🆕 | Worker application tracker with status filter + stats |
| `employer-dashboard.html` | 🔧 | Fixed: status query `'open'→'active'`, wired sidebar links, live stats |
| `freelancer-dashboard.html` | 🔧 | Fixed: status query, wired sidebar + quick-action links |

**JobService API (`js/jobs.js`):**
```
createJob(employerId, data)
getEmployerJobs(employerId)
getOpenJobs({ search, location, jobType })
getJobById(id)
updateJob(id, employerId, data)
deleteJob(id, employerId)
applyToJob(jobId, workerId, coverLetter)
getWorkerApplications(workerId)
hasApplied(jobId, workerId)
getJobApplications(jobId, employerId)
updateApplicationStatus(appId, status)
```

**Role enforcement:**
- Employers: can create/edit/delete own jobs only (RLS + JS guard)
- Workers: can apply once per job (UNIQUE constraint + RLS)
- Public: can read active jobs (RLS `jobs_select_all`)

---

## PHASE 5 — APPLICATION SYSTEM ⏳

**Purpose:** Full application lifecycle management.

| File | Status | Description |
|------|--------|-------------|
| `my-applications.html` | ✅ (created Phase 4) | Worker view |
| `job-applications.html` | ✅ | Employer view of applicants per job |
| `applicant-profile.html` | ✅ | Employer views worker profile |
| `js/applications.js` | ✅ | ApplicationService module |

**Tasks:**
- Employer reviews applicants per job
- Update status: pending → reviewing → shortlisted → accepted/rejected
- Prevent duplicate applications (already enforced by DB UNIQUE constraint)

---

## PHASE 6 — CHAT SYSTEM (REALTIME) ⏳

**Purpose:** Live messaging between employers and workers.

| File | Status | Description |
|------|--------|-------------|
| `client-messages.html` | ✅ | Employer chat UI (redirects to messages.html) |
| `freelancer-messages.html` | ✅ | Worker chat UI (redirects to messages.html) |
| `js/chat.js` | ✅ | ChatService + Supabase Realtime subscription |

**Tasks:**
- Create/find conversation between two users
- Send/receive messages in real time via `supabase.channel()`
- Unread count badges

---

## PHASE 7 — NOTIFICATIONS ⏳

**Purpose:** Event-driven notifications for key actions.

| File | Status | Description |
|------|--------|-------------|
| `js/notifications.js` | ✅ | NotificationService module |
| `notifications.html` | ✅ | Notifications list page |

**Triggers (DB-level or JS-level):**
- New application → notify employer
- Application status change → notify worker
- New message → notify recipient

---

## PHASE 8 — E-WALLET SYSTEM ✅

**Purpose:** Balance tracking, deposits, withdrawals, payments.

| File | Status | Description |
|------|--------|-------------|
| `js/ewallet.js` | ✅ | EwalletService module (deposit, withdraw, sendPayment, getTransactions) |
| `wallet.html` | ✅ | Standalone wallet dashboard (balance + history + deposit modal) |
| `withdraw.html` | ✅ | Standalone withdrawal request form (MoMo / Bank / Cash) |

**Rules enforced:**
- `balance >= 0` (DB CHECK constraint)
- Transactions are INSERT-only (immutable log)
- Withdrawal deducts from `available_balance`

---

## PHASE 9 — SECURITY (RLS) ✅

**Purpose:** Row Level Security on all tables.

| File | Status | Description |
|------|--------|-------------|
| `supabase-schema.sql` | ✅ | All RLS policies defined |

**Policies summary:**
- `profiles`: own read/write; public read for job browsing
- `jobs`: public read; employer write own
- `job_applications`: worker sees own; employer sees for their jobs
- `conversations/messages`: participants only
- `notifications`: own only
- `ewallets/transactions/withdrawals`: own wallet only
- `payments`: employer or worker party only

---

## PHASE 10 — REMOVE PHP BACKEND ✅

**Purpose:** Delete all PHP files, keep only frontend.

| Action | Files | Status |
|--------|-------|--------|
| Deleted | `app/Controllers/*.php` (14 files) | ✅ |
| Deleted | `app/Models/*.php` (12 files) | ✅ |
| Deleted | `app/Filters/AuthFilter.php` | ✅ |
| Deleted | `app/Helpers/*.php` (3 files) | ✅ |
| Deleted | `index.php`, `preload.php`, `spark` | ✅ |
| Deleted | `composer.json`, `composer.lock`, `vendor/` | ✅ |
| Deleted | `app/Config/`, `app/Database/`, `app/Language/`, `app/Libraries/`, `app/ThirdParty/` | ✅ |
| Deleted | `app/Views/` (all PHP templates) | ✅ |
| Deleted | `app/Common.php`, `.htaccess`, `phpunit.xml.dist`, `tests/`, `writable/` | ✅ |
| Deleted | `app/` directory (entirely removed) | ✅ |
| Kept | All `.html` files in root | ✅ |
| Kept | `js/`, `assets/`, `public/favicon.ico` | ✅ |
| Kept | `supabase-schema.sql`, `supabase-rls-phase9.sql` | ✅ |
| Kept | `vercel.json` | ✅ |

**Result:** Project is now 100% frontend — HTML + JS + Supabase only. No PHP runtime required.

---

## PHASE 11 — DEPLOYMENT ⏳

**Purpose:** Deploy to Vercel via GitHub.

| File | Status | Description |
|------|--------|-------------|
| `vercel.json` | ✅ | Static routing + security headers |
| `js/config.js` | ✅ | Supabase credentials (move to env vars) |
| `.env.example` | ✅ | Template for environment variables |
| `.gitignore` | ✅ | Excludes vendor/, .env |

**Steps:**
1. Push to GitHub
2. Connect repo to Vercel
3. Set env vars: `SUPABASE_URL`, `SUPABASE_ANON_KEY`
4. Update `js/config.js` to read from injected env at build time

---

## PHASE 12 — FINAL OPTIMIZATION ⏳

**Purpose:** Performance, UX polish, code cleanup.

| Task | File(s) |
|------|---------|
| Lazy-load job cards | `find-jobs.html`, `js/jobs.js` |
| Debounce search input | `find-jobs.html` |
| Add pagination | `find-jobs.html`, `jobs.html` |
| Consolidate duplicate CSS | `assets/css/style.css` |
| Remove unused JS files | `assets/js/sample-data*.js`, `assets/js/enhanced-sample-data.js` |
| Add loading skeletons | All dashboard pages |
| PWA manifest | `manifest.json` | ✅ |
| Final documentation | `PROJECT_COMPLETION_GUIDE.md` |

---

## Complete File Tree (Frontend — Post Phase 10)

```
rwanda-skillsconnect/
├── index.html                    # Landing page
├── login.html                    # Auth
├── signup.html                   # Auth
├── register.html                 # Auth
├── role-selection.html           # Auth
├── otp-verification.html         # Auth
├── forgot-password.html          # Auth
├── reset-password.html           # Auth
├── auth-callback.html            # Auth
├── email-confirmation.html       # Auth
│
├── employer-dashboard.html       # Phase 4
├── freelancer-dashboard.html     # Phase 4
├── admin-dashboard.html          # Phase 0 (existing)
│
├── post-job.html                 # Phase 4
├── jobs.html                     # Phase 4
├── find-jobs.html                # Phase 4
├── my-applications.html          # Phase 4 🆕
├── job-applications.html         # Phase 5 ⏳
├── applicant-profile.html        # Phase 5 ⏳
│
├── client-messages.html          # Phase 6 ⏳
├── freelancer-messages.html      # Phase 6 ⏳
├── notifications.html            # Phase 7 ⏳
├── wallet.html                   # Phase 8 ⏳
├── withdraw.html                 # Phase 8 ⏳
│
├── profile.html                  # Phase 2
├── browse.html                   # Phase 2
├── about.html                    # Static
│
├── js/
│   ├── supabaseClient.js         # Phase 1
│   ├── config.js                 # Phase 1
│   ├── auth.js                   # Phase 1
│   ├── auth-utils.js             # Phase 1
│   ├── auth-init.js              # Phase 1
│   ├── dashboard-auth.js         # Phase 1
│   ├── signup.js                 # Phase 1
│   ├── login.js                  # Phase 1
│   ├── verifyOtp.js              # Phase 1
│   ├── forgotPassword.js         # Phase 1
│   ├── resetPassword.js          # Phase 1
│   ├── db.js                     # Phase 2
│   ├── worker-data.js            # Phase 2
│   ├── employer-data.js          # Phase 2
│   ├── jobs.js                   # Phase 4
│   ├── applications.js           # Phase 5 ⏳
│   ├── chat.js                   # Phase 6 ⏳
│   ├── notifications.js          # Phase 7 ⏳
│   └── ewallet.js                # Phase 8 ⏳
│
├── assets/
│   ├── css/
│   │   ├── style.css
│   │   └── dashboard-styles.css
│   ├── js/
│   │   ├── supabase-auth.js
│   │   ├── role-access-control.js
│   │   └── storage-utils.js
│   └── sounds/
│       └── notification.mp3
│
├── public/
│   └── favicon.ico
│
├── supabase-schema.sql           # Phase 3
└── vercel.json                   # Phase 11
```
