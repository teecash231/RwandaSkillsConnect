-- ============================================================
-- PHASE 9 — ROW LEVEL SECURITY (RLS)
-- Run this in Supabase SQL Editor AFTER supabase-schema.sql
-- ============================================================

-- ── ADMIN HELPER ─────────────────────────────────────────────
-- Returns true if the calling user has role = 'admin'
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$;

-- ============================================================
-- DROP ALL EXISTING POLICIES (clean slate)
-- ============================================================
DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- ============================================================
-- PROFILES
-- ============================================================
-- Public read (needed for job browsing, employer cards, etc.)
CREATE POLICY "profiles_select_public"
    ON profiles FOR SELECT
    USING (true);

-- Own update / insert
CREATE POLICY "profiles_update_own"
    ON profiles FOR UPDATE
    USING (auth.uid() = id OR is_admin());

CREATE POLICY "profiles_insert_own"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Admin can delete any profile
CREATE POLICY "profiles_delete_admin"
    ON profiles FOR DELETE
    USING (is_admin());

-- ============================================================
-- JOBS
-- ============================================================
CREATE POLICY "jobs_select_all"
    ON jobs FOR SELECT
    USING (true);

CREATE POLICY "jobs_insert_employer"
    ON jobs FOR INSERT
    WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "jobs_update_employer_or_admin"
    ON jobs FOR UPDATE
    USING (auth.uid() = employer_id OR is_admin());

CREATE POLICY "jobs_delete_employer_or_admin"
    ON jobs FOR DELETE
    USING (auth.uid() = employer_id OR is_admin());

-- ============================================================
-- JOB APPLICATIONS
-- ============================================================
-- Worker sees own applications
CREATE POLICY "apps_select_worker"
    ON job_applications FOR SELECT
    USING (auth.uid() = worker_id);

-- Employer sees applications for their jobs
CREATE POLICY "apps_select_employer"
    ON job_applications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM jobs
            WHERE jobs.id = job_applications.job_id
              AND jobs.employer_id = auth.uid()
        )
    );

-- Admin sees all
CREATE POLICY "apps_select_admin"
    ON job_applications FOR SELECT
    USING (is_admin());

CREATE POLICY "apps_insert_worker"
    ON job_applications FOR INSERT
    WITH CHECK (auth.uid() = worker_id);

-- Employer updates status on their job's applications
CREATE POLICY "apps_update_employer"
    ON job_applications FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM jobs
            WHERE jobs.id = job_applications.job_id
              AND jobs.employer_id = auth.uid()
        )
        OR is_admin()
    );

CREATE POLICY "apps_delete_worker_or_admin"
    ON job_applications FOR DELETE
    USING (auth.uid() = worker_id OR is_admin());

-- ============================================================
-- CONVERSATIONS
-- ============================================================
CREATE POLICY "conv_select"
    ON conversations FOR SELECT
    USING (auth.uid() = user1_id OR auth.uid() = user2_id OR is_admin());

CREATE POLICY "conv_insert"
    ON conversations FOR INSERT
    WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "conv_update"
    ON conversations FOR UPDATE
    USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "conv_delete_admin"
    ON conversations FOR DELETE
    USING (is_admin());

-- ============================================================
-- MESSAGES
-- ============================================================
CREATE POLICY "msg_select"
    ON messages FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id OR is_admin());

CREATE POLICY "msg_insert"
    ON messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "msg_delete_admin"
    ON messages FOR DELETE
    USING (is_admin());

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE POLICY "notif_select"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id OR is_admin());

-- Allow insert only to own user_id (direct) or via send_notification RPC (SECURITY DEFINER bypasses this)
CREATE POLICY "notif_insert_own"
    ON notifications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notif_update"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "notif_delete"
    ON notifications FOR DELETE
    USING (auth.uid() = user_id OR is_admin());

-- ============================================================
-- EWALLETS
-- ============================================================
CREATE POLICY "wallet_select"
    ON ewallets FOR SELECT
    USING (auth.uid() = user_id OR is_admin());

-- Insert handled by handle_new_profile trigger (SECURITY DEFINER)
CREATE POLICY "wallet_insert_own"
    ON ewallets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wallet_update"
    ON ewallets FOR UPDATE
    USING (auth.uid() = user_id OR is_admin());

-- ============================================================
-- EWALLET TRANSACTIONS (immutable — no UPDATE/DELETE from client)
-- ============================================================
CREATE POLICY "tx_select"
    ON ewallet_transactions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM ewallets
            WHERE ewallets.id = ewallet_transactions.ewallet_id
              AND (ewallets.user_id = auth.uid() OR is_admin())
        )
    );

-- Insert only via SECURITY DEFINER RPCs (process_deposit, process_wallet_payment)
-- This policy allows the RPC functions to insert; direct client inserts are blocked
CREATE POLICY "tx_insert_rpc"
    ON ewallet_transactions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM ewallets
            WHERE ewallets.id = ewallet_transactions.ewallet_id
              AND ewallets.user_id = auth.uid()
        )
    );

CREATE POLICY "tx_no_update"
    ON ewallet_transactions FOR UPDATE
    USING (false);

CREATE POLICY "tx_no_delete"
    ON ewallet_transactions FOR DELETE
    USING (false);

-- ============================================================
-- EWALLET WITHDRAWALS
-- ============================================================
CREATE POLICY "wd_select"
    ON ewallet_withdrawals FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM ewallets
            WHERE ewallets.id = ewallet_withdrawals.ewallet_id
              AND (ewallets.user_id = auth.uid() OR is_admin())
        )
    );

CREATE POLICY "wd_insert"
    ON ewallet_withdrawals FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM ewallets
            WHERE ewallets.id = ewallet_withdrawals.ewallet_id
              AND ewallets.user_id = auth.uid()
        )
    );

-- Admin can update withdrawal status (approve/reject)
CREATE POLICY "wd_update_admin"
    ON ewallet_withdrawals FOR UPDATE
    USING (is_admin());

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE POLICY "pay_select"
    ON payments FOR SELECT
    USING (auth.uid() = employer_id OR auth.uid() = worker_id OR is_admin());

CREATE POLICY "pay_insert"
    ON payments FOR INSERT
    WITH CHECK (auth.uid() = employer_id);

-- ============================================================
-- GRANT execute on is_admin() to authenticated users
-- ============================================================
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
