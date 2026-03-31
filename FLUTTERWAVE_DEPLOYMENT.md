# Flutterwave Integration — Deployment Guide

## 1. Supabase Environment Variables

Set these in Supabase Dashboard → Project Settings → Edge Functions → Secrets:

```
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxxxxxxxxxxxxxxxxxxx   # Your FLW secret key
FLUTTERWAVE_WEBHOOK_HASH=your_random_secret_string          # You choose this — must match FLW dashboard
APP_URL=https://your-vercel-app.vercel.app                  # Your Vercel frontend URL
SUPABASE_URL=https://frynqsobruaczattynji.supabase.co       # Already set by Supabase
SUPABASE_ANON_KEY=sb_publishable_...                        # Already set by Supabase
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key             # From Supabase → Settings → API
```

## 2. Run SQL Migrations

In Supabase SQL Editor, run in order:
1. `supabase-schema.sql` (already done)
2. `supabase-rls-phase9.sql` (already done)
3. `sql/flutterwave-schema.sql` ← NEW — run this now

## 3. Deploy Edge Functions

Install Supabase CLI, then:

```bash
supabase login
supabase link --project-ref frynqsobruaczattynji

supabase functions deploy initiate-payment
supabase functions deploy flutterwave-webhook
supabase functions deploy release-escrow
supabase functions deploy flw-withdraw
```

## 4. Register Webhook in Flutterwave Dashboard

1. Go to https://dashboard.flutterwave.com
2. Settings → Webhooks
3. Set URL: `https://frynqsobruaczattynji.supabase.co/functions/v1/flutterwave-webhook`
4. Set Secret Hash: same value as `FLUTTERWAVE_WEBHOOK_HASH` above
5. Enable event: `charge.completed`

## 5. Vercel Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables:
- No secrets needed — frontend only uses the Supabase anon key (already in js/config.js)
- The Flutterwave secret key NEVER touches the frontend

## 6. Payment Flow Summary

### Deposit Flow
1. User clicks "Deposit" → enters amount + phone
2. Frontend calls `initiate-payment` Edge Function (with JWT)
3. Edge Function creates `flw_payment_intents` record, calls FLW API
4. User redirected to Flutterwave checkout (MTN/Airtel Rwanda)
5. User completes payment on phone
6. Flutterwave calls webhook → `flutterwave-webhook` Edge Function
7. Webhook verifies signature + re-verifies with FLW API
8. Wallet credited atomically

### Escrow Flow (Employer → Worker)
1. Employer clicks "Pay Worker" → selects worker, enters amount + phone
2. Frontend calls `initiate-payment` with `payment_type: 'escrow'`
3. Same FLW checkout flow
4. On webhook success: escrow record created, worker notified
5. Employer clicks "Release" after job completion
6. `release-escrow` Edge Function calls `release_escrow_payment` DB function
7. Worker wallet credited atomically

### Withdrawal Flow (Worker)
1. Worker selects Mobile Money on withdraw.html
2. Frontend calls `flw-withdraw` Edge Function
3. Balance deducted atomically (optimistic lock)
4. Flutterwave Transfer API called
5. On failure: balance refunded automatically

## 7. Testing

Use Flutterwave test credentials:
- Test card: 5531 8866 5214 2950, CVV: 564, Expiry: 09/32, PIN: 3310, OTP: 12345
- Test MoMo: any phone number in test mode

Test webhook locally:
```bash
supabase functions serve flutterwave-webhook --env-file .env.local
# Use ngrok or Flutterwave test webhook sender
```
