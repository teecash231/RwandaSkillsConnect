# PROJECT_COMPLETION_GUIDE.md
# Rwanda SkillsConnect — What's Done, What's Missing, How to Finish

---

## 1. Current Project Status

The project has **two parallel layers** that must be understood separately:

| Layer | Status | Description |
|-------|--------|-------------|
| **CodeIgniter 4 (CI4) Backend** | ~75% complete | PHP MVC backend with MySQL, session auth, full routing |
| **Standalone HTML + Supabase** | ~90% complete | Prototype frontend pages using Supabase directly |

The CI4 backend is the **primary production layer**. The standalone HTML pages are a prototype/legacy layer.

---

## 2. What Is Already Complete

### ✅ Authentication (CI4)
- Login, registration, logout — `AuthController`
- Session-based auth with role redirect (`worker`, `employer`, `admin`)
- `password_hash()` / `password_verify()` on all passwords
- `AuthFilter` middleware protecting all role-specific routes
- Auto e-wallet creation on registration

### ✅ Worker (Freelancer) Features
- Dashboard with stats (jobs, applications, skills, rating)
- Browse and search jobs with filters (keyword, location, type, experience)
- Job details page with match percentage calculation
- Apply to job with cover letter + duplicate check + deadline check
- My Applications page with status tracking (pending, reviewing, shortlisted, accepted, rejected)
- Application details view
- Cancel pending application
- Skills management (AJAX update)
- Profile update with photo and resume upload
- Earnings dashboard with monthly stats and growth tracking
- Transaction history with filters
- E-wallet dashboard, transactions, and withdrawal request
- Notifications page with mark-read, mark-all-read, delete
- Settings page
- Chat: conversations list, send message, check updates (polling), start new chat, search employers

### ✅ Employer Features
- Dashboard with stats (active jobs, new applicants, active hires, application chart)
- Post job (multi-step form via `Employer\PostJobController`)
- Edit / delete / update job status
- Jobs list and job detail view
- Applicants list and status management (accept, reject, shortlist)
- Browse workers with filters
- Worker profile view
- Payments page with e-wallet balance display
- Create payment (e-wallet or traditional)
- E-wallet payment processing with balance check and atomic transaction
- Payment history and invoice list
- Invoice view
- E-wallet dashboard, deposit, withdraw, transactions, withdrawals
- Profile update with company logo upload
- Settings page
- Notifications (get dropdown, mark read, delete)
- Chat: send message, get workers for messages

### ✅ Admin Features
- Dashboard with stats and revenue data
- User management (list, view, edit, delete, toggle status)
- Job management (list, view, toggle status)
- Transaction management (list, view)
- Reports page with CSV export
- Skills management
- Workers and employers list
- Analytics page
- Settings page

### ✅ Shared Features
- Chat system (ChatController) for all roles — conversations, messages, polling, start chat, search users
- Notification system (NotificationController) — dropdown, count, mark read, delete
- Reports (ReportsController) — role-based reports, PDF generation stub, Excel export stub
- E-wallet (EwalletController) — balance API
- All routes defined in `app/Config/Routes.php`
- All models present: User, Job, JobApplication, Application, Conversations, Message, Ewallet, EwalletTransaction, EwalletWithdrawal, Payment, Notification, Skill

### ✅ Standalone HTML Pages
- `index.html` — Landing page (complete)
- `login.html` / `register.html` / `signup.html` — Auth pages
- `browse.html` — Browse talent / find jobs
- `post-job.html` — Post a job (3-step form)
- `map.html` — Talent/job map with Leaflet
- `about.html` — About page
- `freelancer-dashboard.html` / `client-dashboard.html` / `admin-dashboard.html`
- `profile.html`, `forgot-password.html`, `reset-password.html`

---

## 3. What Is Missing / Incomplete

### 🔴 Critical — Blocks the App from Running

#### 3.1 MySQL Database Schema
**The `app/Database/Migrations/` folder is empty.** There is no MySQL schema for the CI4 backend.
The `supabase-schema.sql` is PostgreSQL for Supabase only — it cannot be used with MySQL.

**You must create the MySQL database manually or via migrations.**

Run this SQL in phpMyAdmin or MySQL CLI to create the `skillsconnect` database:

```sql
CREATE DATABASE IF NOT EXISTS skillsconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE skillsconnect;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    role ENUM('admin','employer','worker') NOT NULL DEFAULT 'worker',
    password VARCHAR(255) NOT NULL,
    profile_image VARCHAR(255),
    resume_url VARCHAR(255),
    bio TEXT,
    headline VARCHAR(255),
    skills TEXT,
    experience_level VARCHAR(50),
    availability VARCHAR(50),
    location VARCHAR(100),
    company_name VARCHAR(100),
    company_logo VARCHAR(255),
    description TEXT,
    industry VARCHAR(50),
    company_size VARCHAR(20),
    website VARCHAR(200),
    address VARCHAR(500),
    rating DECIMAL(3,2) DEFAULT 0.00,
    status ENUM('active','inactive','suspended') DEFAULT 'active',
    settings JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employer_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    responsibilities TEXT,
    location VARCHAR(100) NOT NULL,
    job_type ENUM('full_time','part_time','contract','internship') DEFAULT 'full_time',
    experience_level VARCHAR(50),
    salary_range_min DECIMAL(12,2),
    salary_range_max DECIMAL(12,2),
    salary_currency VARCHAR(10) DEFAULT 'RWF',
    skills_required TEXT,
    benefits TEXT,
    application_deadline DATE,
    vacancy_count INT DEFAULT 1,
    status ENUM('draft','active','inactive','filled') DEFAULT 'draft',
    views_count INT DEFAULT 0,
    applications_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE job_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    worker_id INT NOT NULL,
    cover_letter TEXT,
    status ENUM('pending','reviewing','shortlisted','accepted','rejected') DEFAULT 'pending',
    notes TEXT,
    reviewed_at DATETIME,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_application (job_id, worker_id),
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE conversations (
    id VARCHAR(255) PRIMARY KEY,
    user1_id INT NOT NULL,
    user2_id INT NOT NULL,
    job_id INT,
    last_message TEXT,
    last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    unread_user1 INT DEFAULT 0,
    unread_user2 INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL
);

CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id VARCHAR(255) NOT NULL,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    sender_id INT,
    job_id INT,
    application_id INT,
    type VARCHAR(50) DEFAULT 'info',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    icon VARCHAR(100) DEFAULT 'fas fa-bell',
    color VARCHAR(50) DEFAULT 'info',
    link VARCHAR(500) DEFAULT '#',
    is_read TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE ewallets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    balance DECIMAL(15,2) DEFAULT 0.00,
    available_balance DECIMAL(15,2) DEFAULT 0.00,
    pending_balance DECIMAL(15,2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'RWF',
    status ENUM('active','suspended','closed') DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE ewallet_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ewallet_id INT NOT NULL,
    transaction_type ENUM('deposit','withdrawal','payment_sent','payment_received','refund','commission') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    fee DECIMAL(15,2) DEFAULT 0.00,
    net_amount DECIMAL(15,2) NOT NULL,
    balance_before DECIMAL(15,2) NOT NULL,
    balance_after DECIMAL(15,2) NOT NULL,
    description TEXT,
    reference_id VARCHAR(100),
    reference_type VARCHAR(50),
    status ENUM('pending','completed','failed','cancelled') DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_details JSON,
    metadata JSON,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ewallet_id) REFERENCES ewallets(id) ON DELETE CASCADE
);

CREATE TABLE ewallet_withdrawals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ewallet_id INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    fee DECIMAL(15,2) DEFAULT 0.00,
    net_amount DECIMAL(15,2) NOT NULL,
    withdrawal_method VARCHAR(50) NOT NULL,
    withdrawal_details JSON,
    status ENUM('pending','processing','completed','rejected') DEFAULT 'pending',
    admin_notes TEXT,
    transaction_id INT,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ewallet_id) REFERENCES ewallets(id) ON DELETE CASCADE
);

CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employer_id INT NOT NULL,
    worker_id INT NOT NULL,
    job_id INT,
    amount DECIMAL(15,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    notes TEXT,
    status ENUM('pending','completed','failed','refunded') DEFAULT 'pending',
    transaction_id VARCHAR(100),
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL
);

-- Default admin user (password: admin123)
INSERT INTO users (name, email, phone, role, password, status) VALUES
('System Admin', 'admin@skillsconnect.rw', '+250788000000', 'admin',
 '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'active');
```

#### 3.2 Missing View Files
The following views are referenced in controllers but **do not exist**:

| Missing View | Referenced In |
|---|---|
| `app/Views/worker/messages.php` | `WorkerController::messages()` |
| `app/Views/worker/ewallet/withdraw.php` | `WorkerController::ewalletWithdraw()` |
| `app/Views/employer/ewallet/transactions.php` | `EmployerController::ewalletTransactions()` |
| `app/Views/employer/invoices/pdf_template.php` | `EmployerController::downloadInvoice()` |
| `app/Views/jobs/job-details.php` | Referenced in jobs views folder |

#### 3.3 Missing Composer Package — PDF Generation
`EmployerController::downloadInvoice()` calls `new \Dompdf\Dompdf()` but **dompdf is not installed**.

```bash
composer require dompdf/dompdf
```

#### 3.4 Missing Composer Package — Excel Export
`ReportsController::exportExcel()` references Excel export but **phpspreadsheet is not installed**.

```bash
composer require phpoffice/phpspreadsheet
```

#### 3.5 ApplicationModel vs JobApplicationModel Conflict
`WorkerController` uses both `ApplicationModel` and `JobApplicationModel` interchangeably. The `ApplicationModel` (`app/Models/ApplicationModel.php`) must exist and map to the `job_applications` table. Verify both models point to the same table.

---

### 🟡 Incomplete — Partially Built

#### 3.6 Worker E-Wallet — Missing `ewalletWithdrawals` View
`WorkerController::ewalletWithdrawals()` is defined in routes but the view `worker/ewallet/withdrawals.php` does not exist. Create it similar to `worker/ewallet/transactions.php`.

#### 3.7 Worker E-Wallet — Missing `ewalletDeposit` View
`WorkerController::ewalletDeposit()` is in routes but has no method in `WorkerController`. Add the method and create `worker/ewallet/deposit.php`.

#### 3.8 Employer Messages View
`EmployerController::sendMessage()` and `deleteConversation()` exist but there is no `employer/messages.php` view or route for the employer messages page.

#### 3.9 Admin — Missing Routes for Some Pages
The admin routes define `analytics`, `workers`, `employers`, `skills` but the `AdminController` methods for these may be stubs. Verify each method returns a proper view.

#### 3.10 Reports — PDF and Excel Are Stubs
`ReportsController::generatePdf()` and `exportExcel()` are referenced in routes but likely return placeholder responses until dompdf and phpspreadsheet are installed (see 3.3 and 3.4).

#### 3.11 `notifyPayment()` Has Debug Output
`EmployerController::notifyPayment()` contains raw `echo` and `print_r` debug statements that will break JSON responses and page rendering in production. Remove all debug output from this method.

#### 3.12 Worker `ewalletWithdraw` Route Mismatch
Routes define `worker/ewallet/withdrawals` (plural) pointing to `WorkerController::ewalletWithdrawals()` but the method in the controller is named `ewalletWithdraw()` (singular). Align the method name with the route.

---

### 🟢 Nice-to-Have — Not Blocking

#### 3.13 No Database Migrations
All schema is managed manually. Add CodeIgniter migration files in `app/Database/Migrations/` for reproducibility and team collaboration.

#### 3.14 Supabase Keys Exposed in Client-Side JS
`js/config.js` and `js/supabaseClient.js` contain the Supabase anon key in plain text. For production, proxy Supabase calls through the CI4 backend or use environment variables.

#### 3.15 40+ Overlapping JS Files
`assets/js/` has many files with overlapping responsibilities (multiple admin dashboard files, multiple menu files). Bundle and consolidate before production deployment.

#### 3.16 Test/Debug HTML Files in Root
Files like `test-admin-dashboard.html`, `debug-signup.html`, `system-check.html`, `ADMIN_CREDENTIALS.md` should be removed before going live.

#### 3.17 PHP 8.1 EOL
PHP 8.1 reaches end-of-life December 31, 2025. Upgrade to PHP 8.2 or 8.3.

---

## 4. Step-by-Step Completion Checklist

### Phase 1 — Get the App Running (Critical)

- [ ] **Create MySQL database** — Run the SQL schema from Section 3.1 in phpMyAdmin
- [ ] **Verify `.env`** — Confirm `database.default.database = skillsconnect` and credentials match XAMPP
- [ ] **Test login** — Visit `http://localhost/rwanda-skillsconnect/login` and log in as admin (`admin@skillsconnect.rw` / `admin123`)
- [ ] **Install dompdf** — `composer require dompdf/dompdf`
- [ ] **Install phpspreadsheet** — `composer require phpoffice/phpspreadsheet`

### Phase 2 — Fix Broken Pages

- [ ] **Create `worker/messages.php` view** — Copy structure from `worker/notifications.php`, adapt for chat UI
- [ ] **Create `worker/ewallet/withdraw.php` view** — Copy from `employer/ewallet/withdraw.php`, adjust routes
- [ ] **Create `worker/ewallet/withdrawals.php` view** — List withdrawal requests with status badges
- [ ] **Create `worker/ewallet/deposit.php` view** — Add `ewalletDeposit()` method to `WorkerController`
- [ ] **Create `employer/ewallet/transactions.php` view** — Copy from `worker/ewallet/transactions.php`
- [ ] **Create `employer/invoices/pdf_template.php` view** — HTML invoice template for dompdf
- [ ] **Fix `notifyPayment()` debug output** — Remove all `echo` and `print_r` from `EmployerController::notifyPayment()`
- [ ] **Fix route/method name mismatch** — Rename `WorkerController::ewalletWithdraw()` to `ewalletWithdrawals()` or update the route

### Phase 3 — Verify All Flows

- [ ] Register a new worker account → verify e-wallet is auto-created
- [ ] Register a new employer account → post a job → verify it appears in worker job list
- [ ] Worker applies to job → employer sees application → employer accepts → worker sees accepted status
- [ ] Employer deposits to e-wallet → admin approves → employer pays worker → worker sees payment in transactions
- [ ] Worker requests withdrawal → admin processes it
- [ ] Chat between worker and employer works (send, receive, polling)
- [ ] Notifications appear in dropdown and notification page

### Phase 4 — Production Readiness

- [ ] Set `CI_ENVIRONMENT = production` in `.env`
- [ ] Set a strong `encryption.key` in `.env`
- [ ] Remove all test HTML files from project root
- [ ] Remove `ADMIN_CREDENTIALS.md`
- [ ] Move Supabase keys out of client-side JS
- [ ] Run `npm run build` to minify Tailwind CSS
- [ ] Configure Apache virtual host to point to `public/` folder
- [ ] Enable HTTPS

---

## 5. Key File Reference

| What You Need to Change | File |
|---|---|
| Database credentials | `.env` |
| All URL routes | `app/Config/Routes.php` |
| Login / Register logic | `app/Controllers/AuthController.php` |
| Worker features | `app/Controllers/WorkerController.php` |
| Employer features | `app/Controllers/EmployerController.php` |
| Admin features | `app/Controllers/AdminController.php` |
| Chat (all roles) | `app/Controllers/ChatController.php` |
| Notifications (all roles) | `app/Controllers/NotificationController.php` |
| E-wallet balance API | `app/Controllers/EwalletController.php` |
| Reports / exports | `app/Controllers/ReportsController.php` |
| Shared header/nav | `app/Views/partials/header.php` |
| Shared footer | `app/Views/partials/footer.php` |
| Landing page (CI4) | `app/Views/home.php` |
| Landing page (HTML) | `index.html` |
| Tailwind source | `src/input.css` → compiled to `assets/css/tailwind.css` |
| MySQL schema | Run SQL from Section 3.1 |

---

## 6. Local Development Setup (Fresh Machine)

```bash
# 1. Install XAMPP (PHP 8.1+, MySQL, Apache)
# 2. Clone/copy project to C:\xampp\htdocs\rwanda-skillsconnect\

# 3. Install PHP dependencies
composer install

# 4. Install Node dependencies and build CSS
npm install
npm run build

# 5. Copy env template and configure
copy env .env
# Edit .env: set app.baseURL and database credentials

# 6. Create database
# Open phpMyAdmin → create database 'skillsconnect'
# Run the SQL from Section 3.1

# 7. Start Apache and MySQL in XAMPP Control Panel

# 8. Visit http://localhost/rwanda-skillsconnect/login
# Login: admin@skillsconnect.rw / admin123
```

---

## 7. Architecture Quick Reference

```
Browser
  │
  ├── Standalone HTML pages (index.html, login.html, etc.)
  │     └── Supabase JS Client → Supabase Cloud (PostgreSQL + Auth)
  │
  └── CodeIgniter 4 (PRIMARY)
        ├── Apache → public/index.php (entry point)
        ├── Router (app/Config/Routes.php)
        ├── AuthFilter (session role check)
        ├── Controller → Model → MySQL (skillsconnect DB)
        └── View (PHP template → HTML)

Polling (every 30s):
  - /notifications/dropdown
  - /ewallet/getBalance
  - /chat/check-updates
```

---

*Last updated: based on full codebase scan of all controllers, models, views, routes, and configuration files.*
