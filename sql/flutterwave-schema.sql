-- ============================================================
-- Flutterwave Integration — Schema Extension
-- Run in Supabase SQL Editor AFTER supabase-schema.sql
-- ============================================================

-- ── 1. Extend payments table with Flutterwave fields ─────────
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS transaction_ref    TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS payment_provider   TEXT DEFAULT 'internal'
      CHECK (payment_provider IN ('internal','flutterwave')),
  ADD COLUMN IF NOT EXISTS payment_status     TEXT DEFAULT 'pending'
      CHECK (payment_status IN ('pending','successful','failed','released'));

-- ── 2. Extend ewallet_transactions with provider ref ─────────
ALTER TABLE ewallet_transactions
  ADD COLUMN IF NOT EXISTS flw_ref            TEXT,
  ADD COLUMN IF NOT EXISTS payment_provider   TEXT DEFAULT 'internal';

-- ── 3. Flutterwave payment intents (tracks initiated payments) ─
CREATE TABLE IF NOT EXISTS flw_payment_intents (
    id              SERIAL PRIMARY KEY,
    transaction_ref TEXT NOT NULL UNIQUE,
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount          NUMERIC(15,2) NOT NULL CHECK (amount > 0),
    currency        TEXT NOT NULL DEFAULT 'RWF',
    payment_type    TEXT NOT NULL CHECK (payment_type IN ('deposit','escrow')),
    worker_id       UUID REFERENCES profiles(id) ON DELETE SET NULL,
    job_id          INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
    status          TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending','successful','failed')),
    flw_tx_id       BIGINT,
    flw_ref         TEXT,
    webhook_payload JSONB,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE flw_payment_intents ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_flw_intents_updated_at
    BEFORE UPDATE ON flw_payment_intents
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 4. Escrow table ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS escrow (
    id              SERIAL PRIMARY KEY,
    employer_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    worker_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    job_id          INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
    amount          NUMERIC(15,2) NOT NULL CHECK (amount > 0),
    transaction_ref TEXT NOT NULL REFERENCES flw_payment_intents(transaction_ref),
    status          TEXT NOT NULL DEFAULT 'held'
        CHECK (status IN ('held','released','refunded','disputed')),
    released_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE escrow ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_escrow_updated_at
    BEFORE UPDATE ON escrow
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 5. Indexes ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_flw_intents_user   ON flw_payment_intents(user_id);
CREATE INDEX IF NOT EXISTS idx_flw_intents_ref    ON flw_payment_intents(transaction_ref);
CREATE INDEX IF NOT EXISTS idx_flw_intents_status ON flw_payment_intents(status);
CREATE INDEX IF NOT EXISTS idx_escrow_employer    ON escrow(employer_id);
CREATE INDEX IF NOT EXISTS idx_escrow_worker      ON escrow(worker_id);
CREATE INDEX IF NOT EXISTS idx_escrow_status      ON escrow(status);

-- ── 6. RLS Policies ───────────────────────────────────────────
-- flw_payment_intents: user sees own, admin sees all
CREATE POLICY "flw_intent_select"
    ON flw_payment_intents FOR SELECT
    USING (auth.uid() = user_id OR is_admin());

-- No direct client inserts — Edge Functions use service_role
CREATE POLICY "flw_intent_no_insert"
    ON flw_payment_intents FOR INSERT
    WITH CHECK (false);

CREATE POLICY "flw_intent_no_update"
    ON flw_payment_intents FOR UPDATE
    USING (false);

-- escrow: employer and worker can see their own
CREATE POLICY "escrow_select"
    ON escrow FOR SELECT
    USING (auth.uid() = employer_id OR auth.uid() = worker_id OR is_admin());

CREATE POLICY "escrow_no_insert"
    ON escrow FOR INSERT
    WITH CHECK (false);

CREATE POLICY "escrow_no_update"
    ON escrow FOR UPDATE
    USING (false);

-- ── 7. Atomic escrow release function ────────────────────────
-- Called by release-escrow Edge Function (service_role)
CREATE OR REPLACE FUNCTION release_escrow_payment(
    p_escrow_id     INTEGER,
    p_employer_id   UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_escrow    escrow%ROWTYPE;
    v_wrk_wallet ewallets%ROWTYPE;
BEGIN
    SELECT * INTO v_escrow FROM escrow
    WHERE id = p_escrow_id
      AND employer_id = p_employer_id
      AND status = 'held'
    FOR UPDATE;

    IF v_escrow.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Escrow not found or already released');
    END IF;

    -- Credit worker wallet
    SELECT * INTO v_wrk_wallet FROM ewallets WHERE user_id = v_escrow.worker_id FOR UPDATE;
    IF v_wrk_wallet.id IS NULL THEN
        INSERT INTO ewallets (user_id) VALUES (v_escrow.worker_id) RETURNING * INTO v_wrk_wallet;
    END IF;

    UPDATE ewallets
    SET balance           = balance + v_escrow.amount,
        available_balance = available_balance + v_escrow.amount
    WHERE id = v_wrk_wallet.id;

    INSERT INTO ewallet_transactions
        (ewallet_id, transaction_type, amount, fee, net_amount,
         balance_before, balance_after, description, reference_id,
         reference_type, status, payment_method, completed_at)
    VALUES
        (v_wrk_wallet.id, 'payment_received', v_escrow.amount, 0, v_escrow.amount,
         v_wrk_wallet.available_balance,
         v_wrk_wallet.available_balance + v_escrow.amount,
         'Escrow released for job #' || COALESCE(v_escrow.job_id::TEXT, 'N/A'),
         v_escrow.transaction_ref, 'escrow', 'completed', 'flutterwave', NOW());

    -- Mark escrow released
    UPDATE escrow
    SET status = 'released', released_at = NOW()
    WHERE id = v_escrow.id;

    -- Update payment record
    UPDATE payments
    SET payment_status = 'released', status = 'completed'
    WHERE transaction_ref = v_escrow.transaction_ref;

    -- Notify worker
    PERFORM send_notification(
        v_escrow.worker_id, v_escrow.employer_id,
        'payment', 'Payment Released!',
        'RWF ' || v_escrow.amount || ' has been released to your wallet.',
        'worker-earnings.html', v_escrow.job_id, NULL
    );

    RETURN jsonb_build_object('success', true, 'amount', v_escrow.amount);
END;
$$;
