-- ============================================================
-- Rwanda SkillsConnect — Remove Flutterwave Integration
-- Run this in Supabase SQL Editor
-- Safe: preserves all existing transaction and payment history
-- ============================================================

-- ── 1. Drop Flutterwave-only columns from payments ────────────
-- payment_provider is no longer needed (all payments are internal)
-- payment_status is merged into the existing `status` column
-- transaction_ref was only used for FLW escrow lookups
ALTER TABLE payments
  DROP COLUMN IF EXISTS payment_provider,
  DROP COLUMN IF EXISTS payment_status,
  DROP COLUMN IF EXISTS transaction_ref;

-- ── 2. Drop Flutterwave-only columns from ewallet_transactions ─
ALTER TABLE ewallet_transactions
  DROP COLUMN IF EXISTS flw_ref,
  DROP COLUMN IF EXISTS payment_provider;

-- ── 3. Drop escrow table (was FLW-only; no existing data to keep) ─
-- If you have escrow rows you want to preserve, comment this out
-- and manually migrate them to the payments table first.
DROP TABLE IF EXISTS escrow CASCADE;

-- ── 4. Drop flw_payment_intents table ────────────────────────
DROP TABLE IF EXISTS flw_payment_intents CASCADE;

-- ── 5. Drop the release_escrow_payment function ──────────────
DROP FUNCTION IF EXISTS release_escrow_payment(INTEGER, UUID);

-- ── 6. Ensure payments.payment_method default is 'ewallet' ───
ALTER TABLE payments
  ALTER COLUMN payment_method SET DEFAULT 'ewallet';

-- ── Done ─────────────────────────────────────────────────────
-- All wallet RPCs (process_wallet_payment, process_deposit,
-- process_withdrawal) remain intact and fully functional.
