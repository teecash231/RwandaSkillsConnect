-- ============================================================
-- Rwanda SkillsConnect — Supabase PostgreSQL Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- ── PROFILES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name       TEXT,
    role            TEXT NOT NULL CHECK (role IN ('admin','employer','worker')),
    phone           TEXT,
    profile_image   TEXT,
    resume_url      TEXT,
    bio             TEXT,
    headline        TEXT,
    skills          TEXT,
    experience_level TEXT,
    availability    TEXT,
    location        TEXT,
    company_name    TEXT,
    company_logo    TEXT,
    company_description TEXT,
    industry        TEXT,
    company_size    TEXT,
    website         TEXT,
    address         TEXT,
    rating          NUMERIC(3,2) DEFAULT 0,
    is_verified     BOOLEAN DEFAULT FALSE,
    status          TEXT DEFAULT 'active' CHECK (status IN ('active','inactive','suspended')),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── JOBS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
    id                  SERIAL PRIMARY KEY,
    employer_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title               TEXT NOT NULL,
    description         TEXT NOT NULL,
    requirements        TEXT,
    responsibilities    TEXT,
    location            TEXT NOT NULL,
    job_type            TEXT CHECK (job_type IN ('full_time','part_time','contract','internship')),
    experience_level    TEXT,
    salary_range_min    NUMERIC(12,2),
    salary_range_max    NUMERIC(12,2),
    salary_currency     TEXT DEFAULT 'RWF',
    skills_required     TEXT,
    benefits            TEXT,
    application_deadline DATE,
    vacancy_count       INTEGER DEFAULT 1,
    status              TEXT DEFAULT 'draft' CHECK (status IN ('draft','active','inactive','filled')),
    views_count         INTEGER DEFAULT 0,
    applications_count  INTEGER DEFAULT 0,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── JOB APPLICATIONS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_applications (
    id           SERIAL PRIMARY KEY,
    job_id       INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    worker_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    cover_letter TEXT,
    status       TEXT DEFAULT 'pending' CHECK (status IN ('pending','reviewing','shortlisted','accepted','rejected')),
    applied_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (job_id, worker_id)
);

-- ── CONVERSATIONS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
    id              TEXT PRIMARY KEY,
    user1_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    user2_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    job_id          INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
    last_message    TEXT,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    unread_user1    INTEGER DEFAULT 0,
    unread_user2    INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── MESSAGES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
    id              SERIAL PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    message         TEXT NOT NULL,
    is_read         BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── NOTIFICATIONS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id              SERIAL PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    sender_id       UUID REFERENCES profiles(id) ON DELETE SET NULL,
    job_id          INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
    application_id  INTEGER REFERENCES job_applications(id) ON DELETE SET NULL,
    type            TEXT DEFAULT 'info',
    title           TEXT NOT NULL,
    message         TEXT NOT NULL,
    icon            TEXT DEFAULT 'fas fa-bell',
    color           TEXT DEFAULT 'info',
    link            TEXT DEFAULT '#',
    is_read         BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── EWALLETS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ewallets (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    balance           NUMERIC(15,2) DEFAULT 0 CHECK (balance >= 0),
    available_balance NUMERIC(15,2) DEFAULT 0 CHECK (available_balance >= 0),
    pending_balance   NUMERIC(15,2) DEFAULT 0 CHECK (pending_balance >= 0),
    currency          TEXT DEFAULT 'RWF',
    status            TEXT DEFAULT 'active' CHECK (status IN ('active','suspended','closed')),
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── EWALLET TRANSACTIONS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS ewallet_transactions (
    id               SERIAL PRIMARY KEY,
    ewallet_id       UUID NOT NULL REFERENCES ewallets(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN (
                         'deposit','withdrawal','payment_sent','payment_received','refund','commission')),
    amount           NUMERIC(15,2) NOT NULL CHECK (amount > 0),
    fee              NUMERIC(15,2) DEFAULT 0,
    net_amount       NUMERIC(15,2) NOT NULL,
    balance_before   NUMERIC(15,2) NOT NULL,
    balance_after    NUMERIC(15,2) NOT NULL,
    description      TEXT,
    reference_id     TEXT,
    reference_type   TEXT,
    status           TEXT DEFAULT 'pending' CHECK (status IN ('pending','completed','failed','cancelled')),
    payment_method   TEXT,
    payment_details  JSONB,
    metadata         JSONB,
    completed_at     TIMESTAMPTZ,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── EWALLET WITHDRAWALS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS ewallet_withdrawals (
    id                  SERIAL PRIMARY KEY,
    ewallet_id          UUID NOT NULL REFERENCES ewallets(id) ON DELETE CASCADE,
    amount              NUMERIC(15,2) NOT NULL CHECK (amount > 0),
    fee                 NUMERIC(15,2) DEFAULT 0,
    net_amount          NUMERIC(15,2) NOT NULL,
    withdrawal_method   TEXT NOT NULL,
    withdrawal_details  JSONB,
    status              TEXT DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','rejected')),
    admin_notes         TEXT,
    transaction_id      INTEGER REFERENCES ewallet_transactions(id),
    completed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── PAYMENTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
    id              SERIAL PRIMARY KEY,
    employer_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    worker_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    job_id          INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
    amount          NUMERIC(15,2) NOT NULL CHECK (amount > 0),
    payment_method  TEXT NOT NULL,
    notes           TEXT,
    status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','completed','failed','refunded')),
    transaction_id  TEXT,
    payment_date    TIMESTAMPTZ DEFAULT NOW(),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_jobs_employer      ON jobs(employer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status        ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_applications_job   ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_worker ON job_applications(worker_id);
CREATE INDEX IF NOT EXISTS idx_messages_conv      ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON ewallet_transactions(ewallet_id);
CREATE INDEX IF NOT EXISTS idx_ewallets_user      ON ewallets(user_id);

-- ============================================================
-- TRIGGER: auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, full_name, role, phone)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'worker'),
        COALESCE(NEW.raw_user_meta_data->>'phone', '')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- TRIGGER: auto-create ewallet on profile creation
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO ewallets (user_id) VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created ON profiles;
CREATE TRIGGER on_profile_created
    AFTER INSERT ON profiles
    FOR EACH ROW EXECUTE FUNCTION handle_new_profile();

-- ============================================================
-- TRIGGER: updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at   BEFORE UPDATE ON profiles   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_jobs_updated_at       BEFORE UPDATE ON jobs        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_ewallets_updated_at   BEFORE UPDATE ON ewallets    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_withdrawals_updated_at BEFORE UPDATE ON ewallet_withdrawals FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY — enable on all tables
-- Policies are defined in supabase-rls-phase9.sql
-- Run that file AFTER this one in Supabase SQL Editor
-- ============================================================
ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages             ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications        ENABLE ROW LEVEL SECURITY;
ALTER TABLE ewallets             ENABLE ROW LEVEL SECURITY;
ALTER TABLE ewallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ewallet_withdrawals  ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments             ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- IMMUTABLE TRANSACTION LOG (Phase 8 requirement)
-- Prevents any UPDATE or DELETE on ewallet_transactions
-- ============================================================
CREATE OR REPLACE FUNCTION prevent_transaction_mutation()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Transaction logs are immutable and cannot be modified or deleted.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_transactions_immutable_update ON ewallet_transactions;
CREATE TRIGGER trg_transactions_immutable_update
    BEFORE UPDATE ON ewallet_transactions
    FOR EACH ROW EXECUTE FUNCTION prevent_transaction_mutation();

DROP TRIGGER IF EXISTS trg_transactions_immutable_delete ON ewallet_transactions;
CREATE TRIGGER trg_transactions_immutable_delete
    BEFORE DELETE ON ewallet_transactions
    FOR EACH ROW EXECUTE FUNCTION prevent_transaction_mutation();

-- RLS: no UPDATE or DELETE allowed on transactions from client
CREATE POLICY "tx_no_update" ON ewallet_transactions FOR UPDATE USING (false);
CREATE POLICY "tx_no_delete" ON ewallet_transactions FOR DELETE USING (false);

-- ============================================================
-- ATOMIC PAYMENT FUNCTION (employer pays worker via Supabase RPC)
-- Call from JS: supabase.rpc('process_wallet_payment', {...})
-- ============================================================
CREATE OR REPLACE FUNCTION process_wallet_payment(
    p_employer_id UUID,
    p_worker_id   UUID,
    p_job_id      INTEGER,
    p_amount      NUMERIC,
    p_notes       TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_emp_wallet   ewallets%ROWTYPE;
    v_wrk_wallet   ewallets%ROWTYPE;
    v_ref          TEXT;
BEGIN
    -- Validate amount
    IF p_amount <= 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Amount must be greater than 0');
    END IF;

    -- Lock both wallets in consistent order to prevent deadlock
    SELECT * INTO v_emp_wallet FROM ewallets WHERE user_id = p_employer_id FOR UPDATE;
    SELECT * INTO v_wrk_wallet FROM ewallets WHERE user_id = p_worker_id   FOR UPDATE;

    IF v_emp_wallet.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Employer wallet not found');
    END IF;
    IF v_wrk_wallet.id IS NULL THEN
        -- Auto-create worker wallet
        INSERT INTO ewallets (user_id) VALUES (p_worker_id)
        RETURNING * INTO v_wrk_wallet;
    END IF;

    -- Check balance (DB constraint also enforces this)
    IF v_emp_wallet.available_balance < p_amount THEN
        RETURN jsonb_build_object('success', false, 'error',
            'Insufficient balance. Available: ' || v_emp_wallet.available_balance);
    END IF;

    v_ref := 'PAY-' || to_char(NOW(), 'YYYYMMDD') || '-' || upper(substr(gen_random_uuid()::text, 1, 8));

    -- Deduct employer
    UPDATE ewallets
    SET available_balance = available_balance - p_amount,
        balance           = balance - p_amount
    WHERE id = v_emp_wallet.id;

    INSERT INTO ewallet_transactions
        (ewallet_id, transaction_type, amount, fee, net_amount,
         balance_before, balance_after, description, reference_id,
         reference_type, status, payment_method, completed_at)
    VALUES
        (v_emp_wallet.id, 'payment_sent', p_amount, 0, p_amount,
         v_emp_wallet.available_balance,
         v_emp_wallet.available_balance - p_amount,
         COALESCE(p_notes, 'Payment to worker'), v_ref,
         'payment', 'completed', 'ewallet', NOW());

    -- Credit worker
    UPDATE ewallets
    SET available_balance = available_balance + p_amount,
        balance           = balance + p_amount
    WHERE id = v_wrk_wallet.id;

    INSERT INTO ewallet_transactions
        (ewallet_id, transaction_type, amount, fee, net_amount,
         balance_before, balance_after, description, reference_id,
         reference_type, status, payment_method, completed_at)
    VALUES
        (v_wrk_wallet.id, 'payment_received', p_amount, 0, p_amount,
         v_wrk_wallet.available_balance,
         v_wrk_wallet.available_balance + p_amount,
         COALESCE(p_notes, 'Payment from employer'), v_ref,
         'payment', 'completed', 'ewallet', NOW());

    -- Record payment
    INSERT INTO payments
        (employer_id, worker_id, job_id, amount, payment_method, notes, status, transaction_id)
    VALUES
        (p_employer_id, p_worker_id, p_job_id, p_amount, 'ewallet', p_notes, 'completed', v_ref);

    RETURN jsonb_build_object('success', true, 'transaction_id', v_ref);
END;
$$;

-- ============================================================
-- DEPOSIT FUNCTION (client calls RPC — bypasses RLS safely)
-- Call from JS: supabase.rpc('process_deposit', {...})
-- ============================================================
CREATE OR REPLACE FUNCTION process_deposit(
    p_user_id  UUID,
    p_amount   NUMERIC,
    p_phone    TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_wallet ewallets%ROWTYPE;
BEGIN
    IF p_amount <= 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Amount must be greater than 0');
    END IF;

    -- Only the authenticated user can deposit into their own wallet
    IF auth.uid() <> p_user_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
    END IF;

    SELECT * INTO v_wallet FROM ewallets WHERE user_id = p_user_id FOR UPDATE;

    IF v_wallet.id IS NULL THEN
        INSERT INTO ewallets (user_id) VALUES (p_user_id) RETURNING * INTO v_wallet;
    END IF;

    INSERT INTO ewallet_transactions
        (ewallet_id, transaction_type, amount, fee, net_amount,
         balance_before, balance_after, description,
         payment_method, payment_details, status, completed_at)
    VALUES
        (v_wallet.id, 'deposit', p_amount, 0, p_amount,
         v_wallet.available_balance,
         v_wallet.available_balance + p_amount,
         'MoMo deposit from ' || p_phone,
         'momo', jsonb_build_object('phone', p_phone),
         'completed', NOW());

    UPDATE ewallets
    SET balance           = balance + p_amount,
        available_balance = available_balance + p_amount
    WHERE id = v_wallet.id;

    RETURN jsonb_build_object('success', true, 'new_balance', v_wallet.available_balance + p_amount);
END;
$$;

-- ============================================================
-- WITHDRAWAL FUNCTION (client calls RPC — bypasses RLS safely)
-- Call from JS: supabase.rpc('process_withdrawal', {...})
-- ============================================================
CREATE OR REPLACE FUNCTION process_withdrawal(
    p_user_id UUID,
    p_amount  NUMERIC,
    p_method  TEXT,
    p_details JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_wallet ewallets%ROWTYPE;
    v_fee    NUMERIC;
    v_net    NUMERIC;
    v_tx_id  INTEGER;
BEGIN
    IF p_amount <= 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Amount must be greater than 0');
    END IF;

    IF auth.uid() <> p_user_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
    END IF;

    SELECT * INTO v_wallet FROM ewallets WHERE user_id = p_user_id FOR UPDATE;

    IF v_wallet.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Wallet not found');
    END IF;

    IF v_wallet.available_balance < p_amount THEN
        RETURN jsonb_build_object('success', false, 'error',
            'Insufficient balance. Available: ' || v_wallet.available_balance);
    END IF;

    v_fee := GREATEST(ROUND(p_amount * 0.01), 10);
    v_net := p_amount - v_fee;

    INSERT INTO ewallet_transactions
        (ewallet_id, transaction_type, amount, fee, net_amount,
         balance_before, balance_after, description,
         payment_method, payment_details, status)
    VALUES
        (v_wallet.id, 'withdrawal', p_amount, v_fee, v_net,
         v_wallet.available_balance,
         v_wallet.available_balance - p_amount,
         'Withdrawal via ' || p_method,
         p_method, p_details, 'pending')
    RETURNING id INTO v_tx_id;

    INSERT INTO ewallet_withdrawals
        (ewallet_id, amount, fee, net_amount,
         withdrawal_method, withdrawal_details, status, transaction_id)
    VALUES
        (v_wallet.id, p_amount, v_fee, v_net,
         p_method, p_details, 'pending', v_tx_id);

    -- Deduct available balance immediately
    UPDATE ewallets
    SET available_balance = available_balance - p_amount
    WHERE id = v_wallet.id;

    RETURN jsonb_build_object('success', true, 'new_balance', v_wallet.available_balance - p_amount);
END;
$$;

-- ============================================================
-- NOTIFICATION HELPER (SECURITY DEFINER — cross-user safe)
-- Allows any authenticated user to notify another user.
-- Called from JS: supabase.rpc('send_notification', {...})
-- Also called internally by DB triggers below.
-- ============================================================
CREATE OR REPLACE FUNCTION send_notification(
    p_user_id      UUID,
    p_sender_id    UUID,
    p_type         TEXT,
    p_title        TEXT,
    p_message      TEXT,
    p_link         TEXT    DEFAULT '#',
    p_job_id       INTEGER DEFAULT NULL,
    p_app_id       INTEGER DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO notifications
        (user_id, sender_id, type, title, message, link, job_id, application_id)
    VALUES
        (p_user_id, p_sender_id, p_type, p_title, p_message, p_link, p_job_id, p_app_id);
END;
$$;

-- ============================================================
-- TRIGGER: notify employer when worker applies
-- ============================================================
CREATE OR REPLACE FUNCTION trg_notify_new_application()
RETURNS TRIGGER AS $$
DECLARE
    v_job        jobs%ROWTYPE;
    v_worker     profiles%ROWTYPE;
BEGIN
    SELECT * INTO v_job    FROM jobs     WHERE id = NEW.job_id;
    SELECT * INTO v_worker FROM profiles WHERE id = NEW.worker_id;

    PERFORM send_notification(
        v_job.employer_id,
        NEW.worker_id,
        'application',
        'New Application Received',
        (COALESCE(v_worker.full_name, 'A worker') || ' applied for ' || v_job.title),
        'job-applications.html',
        NEW.job_id,
        NEW.id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_on_new_application ON job_applications;
CREATE TRIGGER trg_on_new_application
    AFTER INSERT ON job_applications
    FOR EACH ROW EXECUTE FUNCTION trg_notify_new_application();

-- ============================================================
-- TRIGGER: notify worker when application status changes
-- ============================================================
CREATE OR REPLACE FUNCTION trg_notify_status_change()
RETURNS TRIGGER AS $$
DECLARE
    v_job     jobs%ROWTYPE;
    v_title   TEXT;
    v_msg     TEXT;
BEGIN
    IF OLD.status = NEW.status THEN RETURN NEW; END IF;

    SELECT * INTO v_job FROM jobs WHERE id = NEW.job_id;

    v_title := CASE NEW.status
        WHEN 'reviewing'   THEN 'Application Under Review'
        WHEN 'shortlisted' THEN 'You''ve Been Shortlisted!'
        WHEN 'accepted'    THEN 'Application Accepted!'
        WHEN 'rejected'    THEN 'Application Update'
        ELSE 'Application Status Updated'
    END;

    v_msg := CASE NEW.status
        WHEN 'reviewing'   THEN 'Your application for ' || v_job.title || ' is being reviewed.'
        WHEN 'shortlisted' THEN 'Great news! You''ve been shortlisted for ' || v_job.title || '.'
        WHEN 'accepted'    THEN 'Congratulations! Your application for ' || v_job.title || ' was accepted.'
        WHEN 'rejected'    THEN 'Your application for ' || v_job.title || ' was not selected this time.'
        ELSE 'Your application status changed to ' || NEW.status || ' for ' || v_job.title || '.'
    END;

    PERFORM send_notification(
        NEW.worker_id,
        v_job.employer_id,
        'status',
        v_title,
        v_msg,
        'my-applications.html',
        NEW.job_id,
        NEW.id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_on_status_change ON job_applications;
CREATE TRIGGER trg_on_status_change
    AFTER UPDATE ON job_applications
    FOR EACH ROW EXECUTE FUNCTION trg_notify_status_change();

-- ============================================================
-- TRIGGER: notify both parties when payment is made
-- ============================================================
CREATE OR REPLACE FUNCTION trg_notify_payment()
RETURNS TRIGGER AS $$
DECLARE
    v_employer profiles%ROWTYPE;
    v_worker   profiles%ROWTYPE;
    v_job_title TEXT := 'a job';
BEGIN
    SELECT * INTO v_employer FROM profiles WHERE id = NEW.employer_id;
    SELECT * INTO v_worker   FROM profiles WHERE id = NEW.worker_id;
    IF NEW.job_id IS NOT NULL THEN
        SELECT title INTO v_job_title FROM jobs WHERE id = NEW.job_id;
    END IF;

    -- Notify worker: payment received
    PERFORM send_notification(
        NEW.worker_id,
        NEW.employer_id,
        'payment',
        'Payment Received',
        'You received RWF ' || NEW.amount || ' from ' || COALESCE(v_employer.company_name, v_employer.full_name, 'an employer') || ' for ' || v_job_title || '.',
        'worker-earnings.html',
        NEW.job_id,
        NULL
    );

    -- Notify employer: payment sent confirmation
    PERFORM send_notification(
        NEW.employer_id,
        NEW.worker_id,
        'payment',
        'Payment Sent',
        'RWF ' || NEW.amount || ' sent to ' || COALESCE(v_worker.full_name, 'worker') || ' for ' || v_job_title || '.',
        'employer-payments.html',
        NEW.job_id,
        NULL
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_on_payment ON payments;
CREATE TRIGGER trg_on_payment
    AFTER INSERT ON payments
    FOR EACH ROW EXECUTE FUNCTION trg_notify_payment();

-- ============================================================
-- TRIGGER: notify receiver when a new message arrives
-- ============================================================
CREATE OR REPLACE FUNCTION trg_notify_message()
RETURNS TRIGGER AS $$
DECLARE
    v_sender profiles%ROWTYPE;
BEGIN
    SELECT * INTO v_sender FROM profiles WHERE id = NEW.sender_id;
    PERFORM send_notification(
        NEW.receiver_id,
        NEW.sender_id,
        'message',
        'New Message from ' || COALESCE(v_sender.full_name, 'Someone'),
        LEFT(NEW.message, 100),
        'messages.html',
        NULL,
        NULL
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_on_new_message ON messages;
CREATE TRIGGER trg_on_new_message
    AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION trg_notify_message();

-- Notification insert policy is defined in supabase-rls-phase9.sql
