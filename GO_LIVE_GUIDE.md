# Rwanda SkillsConnect — Go Live Roadmap
Complete this guide phase by phase after finishing all testing in test mode.

---

## Phase 1 — Verify Your Flutterwave Account
**Goal:** Get your account approved for live payments.

- [ ] Log in at [app.flutterwave.com](https://app.flutterwave.com)
- [ ] Go to **Settings** → **Business Information**
- [ ] Fill in your business name, address, and category
- [ ] Upload a valid government-issued ID
- [ ] Upload proof of business (registration certificate or utility bill)
- [ ] Submit for review — Flutterwave typically approves within 1–3 business days
- [ ] Wait for approval email before proceeding to Phase 2

---

## Phase 2 — Get Your Live API Keys
**Goal:** Obtain live keys that process real money.

- [ ] In Flutterwave dashboard, toggle from **Test Mode** to **Live Mode** (top-right switch)
- [ ] Go to **Settings** → **API Keys**
- [ ] Copy your **Live Secret Key** (starts with `FLWSECK-` not `FLWSECK_TEST-`)
- [ ] Copy your **Live Public Key** (starts with `FLWPUBK-`)
- [ ] Save both keys somewhere safe (password manager recommended)

---

## Phase 3 — Update Supabase Secrets
**Goal:** Replace test keys with live keys in your Edge Functions.

- [ ] Go to [Supabase Dashboard](https://supabase.com/dashboard/project/frynqsobruaczattynji/functions) → **Edge Functions** → **Secrets**
- [ ] Click **Edit** on `FLUTTERWAVE_SECRET_KEY`
- [ ] Replace the test value with your **Live Secret Key**
- [ ] Click **Save**
- [ ] No redeployment needed — secrets are picked up automatically

---

## Phase 4 — Register Live Webhook in Flutterwave
**Goal:** Tell Flutterwave where to send live payment notifications.

- [ ] In Flutterwave (now in **Live Mode**) → **Settings** → **Webhooks**
- [ ] Add webhook URL:
  ```
  https://frynqsobruaczattynji.supabase.co/functions/v1/flutterwave-webhook
  ```
- [ ] Set **Secret Hash** to the same value as your `FLUTTERWAVE_WEBHOOK_HASH` Supabase secret
- [ ] Click **Save**
- [ ] Note: Test mode and Live mode have separate webhook settings — both need to be registered

---

## Phase 5 — Add Live Public Key to Frontend
**Goal:** The payment popup uses the public key — update it for live mode.

- [ ] Open `js/config.js` in your project
- [ ] Find the `FLUTTERWAVE_PUBLIC_KEY` value
- [ ] Replace the test public key (`FLWPUBK_TEST-...`) with your live public key (`FLWPUBK-...`)
- [ ] Save the file
- [ ] Run these commands to push to GitHub (Vercel auto-deploys):
  ```powershell
  cd c:\RSC\rwanda-skillsconnect
  git add js/config.js
  git commit -m "Switch Flutterwave to live mode"
  git push origin main
  ```

---

## Phase 6 — Do a Real Money Smoke Test
**Goal:** Confirm the full payment flow works with real money before announcing to users.

- [ ] Use your own personal card or mobile money
- [ ] Log in as an employer on your live site
- [ ] Top up wallet with the minimum amount (e.g., 500 RWF)
- [ ] Confirm wallet balance updates correctly
- [ ] Check Supabase → **Table Editor** → `flw_payment_intents` — status should be `successful`
- [ ] Check Supabase → **Table Editor** → `ewallet_transactions` — entry should exist
- [ ] Test a withdrawal to confirm funds can be sent out
- [ ] If anything fails, check **Edge Functions** → **Logs** in Supabase dashboard

---

## Phase 7 — Final Checks Before Announcing
**Goal:** Make sure everything is production-ready.

- [ ] Test on mobile (phone browser) — payment popup should work on small screens
- [ ] Test with MTN Mobile Money (common in Rwanda) if available
- [ ] Confirm `payment-callback.html` shows correct success/failure messages
- [ ] Check that escrow flow works: employer pays → funds held → employer releases → worker receives
- [ ] Review Flutterwave dashboard transaction history matches your Supabase records
- [ ] Set up email notifications in Flutterwave for failed transactions (Settings → Notifications)

---

## Phase 8 — Go Live 🚀
**Goal:** Open the platform to real users.

- [ ] Announce to your first users
- [ ] Monitor Supabase Edge Function logs for the first 24 hours
- [ ] Monitor Flutterwave dashboard for transaction success rates
- [ ] Keep test mode keys saved separately in case you need to debug later

---

## Quick Reference

| Item | Test Mode | Live Mode |
|------|-----------|-----------|
| Secret Key prefix | `FLWSECK_TEST-` | `FLWSECK-` |
| Public Key prefix | `FLWPUBK_TEST-` | `FLWPUBK-` |
| Real money moves | ❌ No | ✅ Yes |
| Webhook URL | Same | Same |
| Supabase secrets | Update `FLUTTERWAVE_SECRET_KEY` | ✅ Done in Phase 3 |
| Frontend config | Update `FLUTTERWAVE_PUBLIC_KEY` in `js/config.js` | ✅ Done in Phase 5 |

---

## If Something Goes Wrong

- **Payment fails silently** → Check Supabase → Edge Functions → `initiate-payment` → Logs
- **Webhook not firing** → Check Flutterwave → Settings → Webhooks → Recent deliveries
- **Wallet not updating** → Check `flutterwave-webhook` function logs
- **Escrow not releasing** → Check `release-escrow` function logs
- **Need to rollback to test mode** → Swap `FLUTTERWAVE_SECRET_KEY` back to test key in Supabase secrets
