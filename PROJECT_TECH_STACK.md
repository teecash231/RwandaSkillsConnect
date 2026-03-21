# PROJECT_TECH_STACK.md
# Rwanda SkillsConnect — Complete Technology Stack Report

---

## 1. Project Overview

**Rwanda SkillsConnect** is a full-stack freelance job marketplace platform built for the Rwandan market. It connects **workers (freelancers)** with **employers (clients)** through a structured job posting, application, and payment system.

Key capabilities of the platform:
- Workers can browse jobs, apply, manage skills/profiles, and track earnings
- Employers can post jobs, manage applicants, process payments, and view invoices
- Admins can manage all users, jobs, transactions, analytics, and platform settings
- Built-in **e-wallet system** supporting deposits and withdrawals in **RWF (Rwandan Franc)**
- Real-time **chat/messaging** between workers and employers
- **Notification system** with polling-based updates
- **Reports & analytics** with PDF and Excel export capabilities
- **Role-based access control** (worker, employer, admin)

---

## 2. Programming Languages

| Language | Usage |
|----------|-------|
| **PHP 8.1+** | Primary backend language (controllers, models, views) |
| **JavaScript (ES6+)** | Frontend interactivity, AJAX, Supabase client, admin dashboards |
| **HTML5** | View templates (`.php` views + standalone `.html` pages) |
| **CSS3** | Custom styling, animations, responsive design |
| **SQL** | Database queries via CodeIgniter Query Builder + raw SQL in schema |

---

## 3. Frontend Technologies

### Frameworks & Libraries
- **Bootstrap 5.3.2** — UI component framework (loaded via CDN)
- **Chart.js** — Data visualization for analytics dashboards (loaded via CDN)
- **Font Awesome 6.4.2** — Icon library (loaded via CDN)
- **Supabase JS Client** — Used in standalone HTML pages for auth/data

### Fonts
- **Google Fonts** — Poppins (headings) and Inter (body text)

### Styling
- **Tailwind CSS 3.4.18** — Utility-first CSS framework (compiled via `npm run build`)
  - Source: `src/input.css`
  - Output: `assets/css/tailwind.css`
- **Custom CSS** — `assets/css/style.css`, `dashboard-styles.css`, `admin-styles.css`, `analytics-dashboard.css`
- CSS custom properties (variables) for theming (`--primary`, `--secondary`, `--accent`, etc.)

### Build Tools
- **npm / Node.js** — Package manager for frontend dependencies
- **Tailwind CSS CLI** — Compiles and minifies CSS
  - `npm run build-css` — Watch mode
  - `npm run build` — Minified production build
- `build.bat` / `dev.bat` — Windows batch scripts for build automation

### Standalone HTML Pages (Frontend-only, Supabase-backed)
The project contains a parallel set of standalone HTML pages that use Supabase directly (pre-CodeIgniter migration or prototype layer):
- `index.html`, `login.html`, `signup.html`, `register.html`
- `freelancer-dashboard.html`, `client-dashboard.html`, `admin-dashboard.html`
- `browse.html`, `post-job.html`, `profile.html`, `map.html`
- `otp-verification.html`, `forgot-password.html`, `reset-password.html`

---

## 4. Backend Technologies

### Server-Side Language
- **PHP 8.1+** (required by CodeIgniter 4)

### Framework
- **CodeIgniter 4** (`codeigniter4/framework ^4.0`) — MVC PHP framework
  - Routing: `app/Config/Routes.php`
  - Filters/Middleware: `app/Filters/AuthFilter.php`
  - Services: `app/Config/Services.php`
  - Email: CodeIgniter built-in Email library (SMTP/mail/sendmail)
  - Session: File-based sessions stored in `writable/session/`
  - Validation: CodeIgniter built-in Validation library
  - CSRF protection via `csrf_hash()` meta token

### API Architecture
- **REST-style API** — JSON responses via AJAX for:
  - Chat (`/chat/*`)
  - Notifications (`/notifications/*`)
  - E-wallet balance (`/ewallet/getBalance`)
  - Admin stats and revenue data
- All AJAX endpoints check `$this->request->isAJAX()` and return `setJSON()`

### Controllers
| Controller | Responsibility |
|-----------|---------------|
| `AuthController` | Login, registration, logout, e-wallet auto-creation |
| `WorkerController` | Worker dashboard, jobs, applications, skills, earnings, chat |
| `EmployerController` | Employer dashboard, job management, payments, invoices, workers |
| `AdminController` | User/job/transaction management, analytics, settings |
| `ChatController` | Messaging for all roles (conversations, send, poll updates) |
| `EwalletController` | Deposit, withdraw, transactions, balance API |
| `NotificationController` | Notification dropdown, mark read, delete |
| `ReportsController` | Role-based reports, PDF generation, Excel export |
| `HomeController` | Landing page |

### Helpers
- `notification_helper.php` — Notification creation utilities
- `text_helper.php` — Text formatting
- `time_helper.php` — Time/date formatting

---

## 5. Database

### Database System
- **MySQL** (via XAMPP/localhost)
  - Driver: `MySQLi`
  - Database name: `skillsconnect`
  - Host: `localhost`, Port: `3306`
  - Charset: `utf8mb4`, Collation: `utf8mb4_general_ci`

### Schema Files
- `supabase-schema.sql` — PostgreSQL schema for Supabase (profiles table, RLS policies, triggers)
- No CodeIgniter migration files found (migrations folder is empty — schema managed manually or via Supabase)

### ORM / Query Tools
- **CodeIgniter 4 Query Builder** — Used throughout all models (`where()`, `join()`, `like()`, `findAll()`, `selectSum()`, etc.)
- **CodeIgniter Model class** — Active Record pattern with `$allowedFields`, `$useTimestamps`, validation rules, and before/after callbacks

### Key Database Tables (inferred from models)
| Table | Model |
|-------|-------|
| `users` | `UserModel` |
| `jobs` | `JobModel` |
| `job_applications` | `JobApplicationModel` |
| `conversations` | `ConversationsModel` |
| `messages` | `MessageModel` |
| `ewallets` | `EwalletModel` |
| `ewallet_transactions` | `EwalletTransactionModel` |
| `ewallet_withdrawals` | `EwalletWithdrawalModel` |
| `payments` | `PaymentModel` |
| `notifications` | `NotificationModel` |
| `skills` | `SkillModel` |
| `applications` | `ApplicationModel` |

### Test Database
- **SQLite3 (in-memory)** — Used exclusively for PHPUnit tests (`database: ':memory:'`)

---

## 6. Authentication & Security

### Login System
- **Session-based authentication** using CodeIgniter's session library
- Session data stored in `writable/session/` as file-based sessions
- Session variables: `user_id`, `user_name`, `role`, `logged_in`
- Role-based redirect on login: `admin → /admin/dashboard`, `employer → /employer/dashboard`, `worker → /worker/dashboard`

### Password Encryption
- **PHP `password_hash()` with `PASSWORD_DEFAULT`** (bcrypt) on registration
- **`password_verify()`** on login

### Route Protection
- `AuthFilter` middleware checks `session()->get('logged_in')` on every protected route
- Role enforcement: `['filter' => 'auth:worker']`, `['filter' => 'auth:employer']`, `['filter' => 'auth:admin']`

### CSRF Protection
- CodeIgniter built-in CSRF token via `csrf_hash()`
- Meta tag: `<meta name="csrf-token" content="<?= csrf_hash() ?>">`
- Sent as `X-CSRF-TOKEN` header in all AJAX POST requests

### Supabase Auth (Standalone HTML layer)
- **Supabase Authentication** with OTP email verification
- `supabaseClient.js` / `js/supabaseClient.js` — Supabase JS client initialization
- OTP flow: `otp-verification.html`, `verify-otp.html`, `verifyOtp.js`
- Password reset: `forgotPassword.js`, `resetPassword.js`
- Row Level Security (RLS) policies defined in `supabase-schema.sql`

---

## 7. Real-time Features

### Chat System
- **Polling-based real-time chat** (not WebSockets)
- `ChatController` handles conversations and messages for all roles
- Frontend polls `/chat/check-updates` every N seconds with `last_message_id`
- Conversations stored in `conversations` table; messages in `messages` table
- Supports: start new chat, send message, mark as read, search users, get contacts from job applications

### Notifications
- **Polling-based notification system** — polls `/notifications/dropdown` every **30 seconds**
- `NotificationSystem` JavaScript class in `partials/header.php`
- Supports: unread count badge, mark as read, mark all as read, delete

### E-Wallet Balance Updates
- Wallet balance auto-refreshes every **30 seconds** via AJAX to `/ewallet/getBalance`

> **Note:** No WebSockets or server-sent events are used. All real-time features are implemented via HTTP polling.

---

## 8. APIs & External Services

### Supabase (Backend-as-a-Service)
- **Supabase** (`https://hbaslkqfuudplimgbsem.supabase.co`) — Used in standalone HTML pages
  - Supabase Auth (email/OTP login)
  - Supabase Database (PostgreSQL)
  - Row Level Security
- Client initialized in `js/supabaseClient.js` and `js/config.js`

### Email Service
- CodeIgniter built-in Email library configured in `app/Config/Email.php`
- Supports: `mail`, `sendmail`, `smtp` protocols
- Used for deposit/withdrawal notifications to admin and users
- `assets/js/email-service.js` and `assets/js/real-email-service.js` — client-side email utilities (standalone HTML layer)

### Payment / E-Wallet
- **Custom internal e-wallet system** in RWF (Rwandan Franc)
- Payment methods supported: `mobile_money`, `bank_transfer`, `cash`
- Mobile money networks: MTN (referenced in withdrawal logic)
- No third-party payment gateway SDK detected (payments are manually verified by admin)

### CDN Resources
- `cdn.jsdelivr.net` — Bootstrap 5, Chart.js
- `cdnjs.cloudflare.com` — Font Awesome
- `fonts.googleapis.com` — Google Fonts

### Geographic Data
- `counties_data.csv` — Location/county data for Rwanda (used in forms/maps)

---

## 9. Development Tools

### Package Managers
- **Composer** — PHP dependency management (`composer.json`, `composer.lock`)
- **npm** — Node.js package management (`package.json`, `package-lock.json`)

### Testing Framework
- **PHPUnit 10.5.16** — PHP unit testing
  - Config: `phpunit.xml.dist`
  - Test files: `tests/unit/HealthTest.php`, `tests/database/ExampleDatabaseTest.php`, `tests/session/ExampleSessionTest.php`
  - Test database: SQLite3 in-memory

### Debugging
- **CodeIgniter Debug Toolbar** — Active in development mode (debug files in `writable/debugbar/`)
- **Kint** — PHP debugging library (configured in `app/Config/Kint.php`)

### Logging
- CodeIgniter file-based logging in `writable/logs/`
- Log files present from 2026-01-26 to 2026-02-11

### Version Control
- **Git** — `.gitignore` present at project root

### Build Scripts
- `build.bat` — Windows batch file for production CSS build
- `dev.bat` — Windows batch file for development/watch mode
- `spark` — CodeIgniter CLI tool for running migrations, seeds, and server

### Linting / Code Quality
- No linter configuration files detected (no `.eslintrc`, `.phpcs.xml`, etc.)

---

## 10. Hosting & Deployment

### Current Environment
- **XAMPP** (local development server on Windows)
  - Apache web server
  - PHP 8.1+
  - MySQL via phpMyAdmin
  - Base URL: `http://localhost/rwanda-skillsconnect/`

### Environment Configuration
- `.env` file — Active environment config (CI_ENVIRONMENT, baseURL, DB credentials)
- `env` file — Template/example environment file
- `CI_ENVIRONMENT = development` (currently in development mode)

### Web Server Configuration
- `.htaccess` files at root, `app/`, and `tests/` for URL rewriting
- `public/` folder is the intended web root (CodeIgniter 4 standard)
- `robots.txt` present in `public/`

### Upload Storage
- `public/uploads/profiles/` — Profile images
- `public/uploads/resumes/` — Resume PDFs
- `uploads/employers/`, `uploads/profiles/`, `uploads/resumes/` — Additional upload directories
- `writable/uploads/` — Writable upload storage

### Docker / Cloud
- No Docker configuration (`Dockerfile`, `docker-compose.yml`) detected
- No cloud deployment configuration (AWS, Heroku, etc.) detected
- Supabase cloud is used for the standalone HTML layer

---

## 11. Folder Structure Explanation

```
rwanda-skillsconnect/
├── app/                        # Core CodeIgniter application
│   ├── Config/                 # All framework configuration files
│   ├── Controllers/            # Request handlers (Auth, Worker, Employer, Admin, Chat, etc.)
│   │   └── employer/           # Employer-specific sub-controllers (PostJob, Jobs, Applicants)
│   ├── Database/
│   │   ├── Migrations/         # Database migration files (currently empty)
│   │   └── Seeds/              # Database seed files
│   ├── Filters/                # HTTP middleware (AuthFilter for role-based access)
│   ├── Helpers/                # Custom helper functions (notification, text, time)
│   ├── Models/                 # Database models (User, Job, Application, Chat, Ewallet, etc.)
│   ├── Views/                  # PHP view templates
│   │   ├── admin/              # Admin panel views (dashboard, users, jobs, reports, etc.)
│   │   ├── auth/               # Login and registration views
│   │   ├── employer/           # Employer views (dashboard, jobs, payments, ewallet, etc.)
│   │   ├── worker/             # Worker views (dashboard, jobs, applications, earnings, etc.)
│   │   ├── partials/           # Shared layout components (header, footer, sidebar)
│   │   ├── reports/            # Report views and PDF templates
│   │   ├── notifications/      # Notification page view
│   │   └── errors/             # Error pages (404, 400, exceptions)
│   └── ThirdParty/             # Third-party libraries (currently empty)
│
├── assets/                     # Static frontend assets
│   ├── css/                    # Compiled CSS files (tailwind.css, style.css, dashboard-styles.css)
│   ├── js/                     # JavaScript files (admin, dashboard, analytics, chat, etc.)
│   └── sounds/                 # Audio files (notification.mp3)
│
├── js/                         # Supabase-related JS for standalone HTML pages
│   ├── supabaseClient.js       # Supabase client initialization
│   ├── auth.js / login.js / signup.js  # Auth flows for HTML pages
│   └── config.js               # Supabase URL and key config
│
├── public/                     # Web server document root
│   ├── uploads/                # User-uploaded files (profiles, resumes)
│   ├── favicon.ico
│   └── robots.txt
│
├── src/                        # Tailwind CSS source
│   └── input.css               # Tailwind directives input file
│
├── tests/                      # PHPUnit test suite
│   ├── unit/                   # Unit tests
│   ├── database/               # Database tests
│   └── session/                # Session tests
│
├── uploads/                    # Additional upload storage (employers, profiles, resumes)
│
├── vendor/                     # Composer dependencies (CodeIgniter, PHPUnit, Faker, etc.)
│
├── writable/                   # Runtime writable directory
│   ├── cache/                  # Application cache
│   ├── debugbar/               # Debug toolbar data files
│   ├── logs/                   # Application log files
│   ├── session/                # PHP session files
│   └── uploads/                # Writable uploads
│
├── *.html                      # Standalone HTML prototype pages (Supabase-backed)
├── .env                        # Active environment configuration
├── composer.json               # PHP dependencies
├── package.json                # Node.js dependencies
├── tailwind.config.js          # Tailwind CSS configuration
├── supabase-schema.sql         # Supabase/PostgreSQL schema definition
├── phpunit.xml.dist            # PHPUnit configuration
└── spark                       # CodeIgniter CLI tool
```

---

## 12. Dependencies

### PHP Dependencies (`composer.json`)

**Production:**
| Package | Version | Purpose |
|---------|---------|---------|
| `codeigniter4/framework` | `^4.0` | Core MVC framework |
| `php` | `^8.1` | Runtime requirement |

**Development:**
| Package | Version | Purpose |
|---------|---------|---------|
| `fakerphp/faker` | `^1.9` | Fake data generation for tests/seeds |
| `mikey179/vfsstream` | `^1.6` | Virtual filesystem for testing |
| `phpunit/phpunit` | `^10.5.16` | Unit testing framework |

**Transitive Dependencies (in `vendor/`):**
- `laminas/laminas-escaper` — Output escaping
- `nikic/php-parser` — PHP code parsing
- `psr/container`, `psr/log` — PSR interfaces
- `sebastian/*` — PHPUnit support libraries
- `symfony/deprecation-contracts` — Symfony contracts
- `theseer/tokenizer` — Code tokenization

### Node.js Dependencies (`package.json`)

**Development:**
| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | `^3.4.18` | Utility-first CSS framework |

### Frontend CDN Dependencies (no local install)
| Library | Version | Source |
|---------|---------|--------|
| Bootstrap | 5.3.2 | `cdn.jsdelivr.net` |
| Chart.js | latest | `cdn.jsdelivr.net` |
| Font Awesome | 6.4.2 | `cdnjs.cloudflare.com` |
| Google Fonts (Poppins, Inter) | — | `fonts.googleapis.com` |
| Supabase JS | — | Referenced in HTML pages |

---

## 13. Architecture Summary

### Overall Architecture: **Monolithic MVC + Hybrid Frontend**

The project follows a **dual-layer architecture**:

#### Layer 1 — CodeIgniter 4 MVC (Primary Backend)
```
Browser Request
    → Apache (.htaccess URL rewrite)
    → public/index.php (entry point)
    → CodeIgniter Router (app/Config/Routes.php)
    → AuthFilter (session/role check)
    → Controller (business logic)
    → Model (Query Builder → MySQL)
    → View (PHP template → HTML response)
```

- **Model**: CodeIgniter Model classes wrapping MySQL tables via Query Builder
- **View**: PHP templates with embedded HTML, Bootstrap, Chart.js, and inline JS
- **Controller**: Handles HTTP requests, session management, validation, and JSON API responses
- **Shared Layout**: `partials/header.php` and `partials/footer.php` included in all views

#### Layer 2 — Standalone HTML + Supabase (Prototype/Legacy Layer)
```
Browser → Static HTML page
    → Supabase JS Client
    → Supabase Cloud (Auth + PostgreSQL)
```
- Standalone `.html` files at the project root use Supabase directly for auth and data
- This layer appears to be a prototype or earlier version that coexists with the CI4 backend

#### Communication Patterns
- **Server-rendered pages** — Full page loads for dashboards and forms
- **AJAX/JSON API** — Chat, notifications, wallet balance, admin stats (polling, not WebSockets)
- **Form POST** — Standard HTML form submissions for create/update operations
- **CSRF tokens** — Sent via meta tag and `X-CSRF-TOKEN` header on AJAX requests

#### Role-Based Access
```
/login, /register          → Public
/worker/*                  → AuthFilter (role: worker)
/employer/*                → AuthFilter (role: employer)
/admin/*                   → AuthFilter (role: admin)
/notifications/*, /chat/*  → AuthFilter (any authenticated user)
```

---

## 14. Suggested Improvements

### Security
- **Move Supabase keys out of client-side JS** — `js/config.js` and `js/supabaseClient.js` expose the Supabase anon key in plain text. Use environment variables or a backend proxy instead.
- **Add rate limiting** on login and registration endpoints to prevent brute-force attacks.
- **Implement HTTPS** — No SSL/TLS configuration detected; required before production deployment.
- **Session hardening** — Consider setting `session.cookie_secure`, `session.cookie_httponly`, and `session.cookie_samesite` in PHP config.

### Architecture
- **Consolidate the two frontend layers** — The project has both a CodeIgniter MVC layer and a standalone Supabase HTML layer. These should be unified into a single consistent architecture to reduce maintenance overhead.
- **Replace polling with WebSockets** — Chat and notifications currently use HTTP polling (every 30 seconds). Consider using WebSockets (e.g., Ratchet for PHP, or Pusher/Ably) for true real-time communication.
- **Add database migrations** — The `app/Database/Migrations/` folder is empty. All schema changes should be tracked as migration files for reproducibility.

### Performance
- **Add caching** — CodeIgniter's cache library is configured but not actively used. Cache frequently-read data (job listings, user stats).
- **Lazy-load Chart.js** — Chart.js is loaded on every page via the shared header, even pages that don't use charts.
- **Optimize session storage** — With many active sessions in `writable/session/`, consider switching to database-backed sessions for scalability.

### Code Quality
- **Add a linter** — No ESLint or PHP_CodeSniffer configuration exists. Adding these would enforce consistent code style.
- **Reduce JavaScript file count** — `assets/js/` contains 40+ JS files, many with overlapping responsibilities (e.g., multiple admin dashboard files). These should be consolidated and bundled.
- **Remove test/debug HTML files** — Files like `test-admin-dashboard.html`, `test-auth-fix.html`, `debug-signup.html`, `system-check.html` should not be in a production codebase.
- **Remove hardcoded credentials** — `ADMIN_CREDENTIALS.md` should not exist in the repository; use environment variables.

### Dependencies
- **PHP 8.1 EOL** — PHP 8.1 reaches end-of-life on December 31, 2025. Upgrade to PHP 8.2 or 8.3.
- **Add a PDF library** — `ReportsController` references PDF generation but no PDF library (TCPDF, mPDF, Dompdf) is installed. Add one via Composer.
- **Add PhpSpreadsheet** — Excel export is referenced in `ReportsController` but not yet implemented. Install `phpoffice/phpspreadsheet` via Composer.
- **Tailwind CSS v4** — Tailwind 3.4.x is the latest v3 release. Consider upgrading to Tailwind CSS v4 when stable.

---

*Report generated by scanning all project files, configurations, controllers, models, views, and dependencies.*
