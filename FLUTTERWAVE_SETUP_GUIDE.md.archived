# Flutterwave Complete Setup Guide
### Rwanda SkillsConnect — Step-by-Step for First-Timers

---

## What This Guide Covers

Your app uses Flutterwave for 3 things:
1. **Deposits** — Users top up their wallet via MTN/Airtel Rwanda
2. **Escrow Payments** — Employers pay workers (money held safely until job is done)
3. **Withdrawals** — Workers cash out to their mobile money

This guide walks you through every single step, in order, with screenshots descriptions and exact values to enter.

---

## Before You Start — What You Need

- [ ] A web browser (Chrome recommended)
- [ ] Your Supabase project open at https://supabase.com/dashboard
- [ ] Node.js installed on your computer (check: open terminal, type `node -v`)
- [ ] Your project folder open at `C:\RSC\rwanda-skillsconnect`

---

# PART 1 — FLUTTERWAVE ACCOUNT SETUP

## Step 1 — Create Your Flutterwave Account

1. Go to **https://dashboard.flutterwave.com/signup**
2. Fill in:
   - Business Name: `Rwanda SkillsConnect`
   - Email: your business email
   - Password: choose a strong password
3. Click **Create Account**
4. Check your email and click the verification link

> **You are now in TEST MODE by default.** This means no real money moves.
> You can test everything safely before going live.

---

## Step 2 — Get Your API Keys

1. In the Flutterwave dashboard, look at the **top-right corner**
2. You will see a toggle that says **"Test"** — leave it on Test for now
3. Click **Settings** in the left sidebar
4. Click **API Keys & Webhooks**
5. You will see 3 keys. Copy each one and save them somewhere safe (like Notepad):

```
Public Key:     FLWPUBK_TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-X
Secret Key:     FLWSECK_TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-X
Encryption Key: xxxxxxxxxxxxxxxxxxxxxxxx
```

> **IMPORTANT:** Never share your Secret Key. It goes only in Supabase, never in your HTML/JS files.

---

## Step 3 — Create Your Webhook Secret

A webhook secret is a password you make up yourself. Flutterwave will send it with every payment notification so your app knows the notification is real.

1. Open Notepad
2. Type any random string of letters and numbers, for example:
   ```
   rsc_webhook_2024_XkP9mNqR
   ```
3. Save this — you will use it in both Flutterwave AND Supabase

---

# PART 2 — SUPABASE SETUP

## Step 4 — Run the Flutterwave Database Schema

Your app needs extra database tables for Flutterwave payments.

1. Go to **https://supabase.com/dashboard**
2. Click on your project (`frynqsobruaczattynji`)
3. In the left sidebar, click **SQL Editor**
4. Click **New Query** (the `+` button)
5. Open the file `sql/flutterwave-schema.sql` from your project folder
6. Copy ALL the contents of that file
7. Paste it into the SQL Editor
8. Click the green **Run** button (or press `Ctrl+Enter`)
9. You should see: `Success. No rows returned`

> If you see an error like "already exists", that's fine — it means it was already run before.

---
<Done>


## Step 5 — Add Secrets to Supabase Edge Functions

Your Edge Functions (the server-side code) need your Flutterwave keys. Here's how to add them:

1. In Supabase dashboard, click **Settings** (gear icon, bottom of left sidebar)
2. Click **Edge Functions**
3. Click **Add new secret** for each of the following:

Add these one by one — click "Add new secret", type the name, paste the value, click Save:

| Secret Name | Value |
|---|---|
| `FLUTTERWAVE_SECRET_KEY` | Your Secret Key from Step 2 (starts with `FLWSECK_TEST-`) |
| `FLUTTERWAVE_WEBHOOK_HASH` | The random string you made in Step 3 |
| `APP_URL` | `https://your-app.vercel.app` (your Vercel URL, or `http://localhost:3000` for testing) |
| `SUPABASE_SERVICE_ROLE_KEY` | Get this from Settings → API → `service_role` key (keep this secret!) |
> **How to find SUPABASE_SERVICE_ROLE_KEY:**
> Settings → API → scroll down to "Project API keys" → copy the `service_role` key

---
<Done>


## Step 6 — Install the Supabase CLI

The Supabase CLI is a tool that lets you deploy your Edge Functions from your computer.

1. Open **Command Prompt** (press `Windows + R`, type `cmd`, press Enter)
2. Type this command and press Enter:
   ```
   npm install -g supabase
   ```
3. Wait for it to finish (takes 1-2 minutes)
4. Verify it worked:
   ```
   supabase --version
   ```
   You should see a version number like `1.x.x`

---

## Step 7 — Log In to Supabase CLI

1. In Command Prompt, type:
   ```
   supabase login
   ```
2. It will open a browser window asking you to log in to Supabase
3. Log in with your Supabase account
4. Come back to Command Prompt — you should see: `Logged in as your@email.com`

---

## Step 8 — Link Your Project

1. In Command Prompt, navigate to your project folder:
   ```
   cd C:\RSC\rwanda-skillsconnect
   ```
2. Link to your Supabase project:
   ```
   supabase link --project-ref frynqsobruaczattynji
   ```
3. It will ask for your database password — enter the password you set when creating the Supabase project
4. You should see: `Finished supabase link.`

---

## Step 9 — Deploy the Edge Functions

Now deploy all 4 payment functions. Run each command one at a time:

```
supabase functions deploy initiate-payment
```
Wait for: `Deployed Function initiate-payment`

```
supabase functions deploy flutterwave-webhook
```
Wait for: `Deployed Function flutterwave-webhook`

```
supabase functions deploy release-escrow
```
Wait for: `Deployed Function release-escrow`

```
supabase functions deploy flw-withdraw
```
Wait for: `Deployed Function flw-withdraw`

> **Verify they deployed:** Go to Supabase dashboard → Edge Functions. You should see all 4 listed.

---

# PART 3 — FLUTTERWAVE WEBHOOK SETUP

## Step 10 — Register the Webhook URL

This tells Flutterwave where to send payment notifications.

1. Go back to **https://dashboard.flutterwave.com**
2. Click **Settings** in the left sidebar
3. Click **API Keys & Webhooks**
4. Scroll down to the **Webhooks** section
5. In the **Webhook URL** field, enter:
   ```
   https://frynqsobruaczattynji.supabase.co/functions/v1/flutterwave-webhook
   ```
6. In the **Secret Hash** field, enter the same random string you made in Step 3
7. Click **Save**

> **What is this doing?** Every time someone pays, Flutterwave will send a message to this URL. Your app listens at that URL and credits the wallet automatically.

---

# PART 4 — CONNECT YOUR FRONTEND

## Step 11 — Update Your App URL

Your `js/config.js` already has the Supabase URL and key. The only thing to check is that `APP_URL` in Supabase secrets (Step 5) matches where your app is hosted.

**If testing locally:**
- `APP_URL` = `http://localhost:5500` (or whatever port your local server uses)

**If deployed on Vercel:**
- `APP_URL` = `https://your-project-name.vercel.app`

> The `APP_URL` is used as the redirect URL after payment — Flutterwave sends the user back to `APP_URL/payment-callback.html`

---

# PART 5 — TESTING

## Step 12 — Test a Deposit (Test Mode)

1. Open your app and log in as a worker or employer
2. Go to **wallet.html**
3. Click **Deposit**
4. Enter amount: `1000`
5. Enter phone: `07XXXXXXXX` (any number in test mode)
6. Click **Pay with Mobile Money**
7. You will be redirected to Flutterwave's test checkout page
8. Use these test credentials:
   - **Test Card:** `5531 8866 5214 2950`
   - **CVV:** `564`
   - **Expiry:** `09/32`
   - **PIN:** `3310`
   - **OTP:** `12345`
   
   OR for Mobile Money test:
   - Just click **Confirm** on the test MoMo page (no real number needed in test mode)

9. After payment, you are redirected to `payment-callback.html`
10. Wait 5-10 seconds, then check your wallet — balance should increase

> **If balance doesn't update:** The webhook may not have fired. Check Supabase → Edge Functions → `flutterwave-webhook` → Logs

---

## Step 13 — Test an Escrow Payment (Employer → Worker)

1. Log in as an **employer**
2. Go to **employer-payments.html**
3. Click **Pay Worker**
4. Select a worker from the dropdown
5. Enter amount: `5000`
6. Enter your phone number
7. Click **Pay via Mobile Money**
8. Complete the test payment (same test credentials as Step 12)
9. After redirect, check:
   - Employer sees payment in their payments list with status "pending"
   - Worker gets a notification: "Payment Secured in Escrow"

---

## Step 14 — Test Releasing Escrow

1. Still logged in as employer
2. Go to **employer-payments.html**
3. Find the payment with status "pending" and a **Release** button
4. Click **Release**
5. Confirm the popup
6. Check:
   - Payment status changes to "released"
   - Worker's wallet balance increases
   - Worker gets notification: "Payment Released!"

---

## Step 15 — Test a Withdrawal

1. Log in as a **worker** (make sure they have balance from a deposit or released escrow)
2. Go to **withdraw.html**
3. Select **Mobile Money**
4. Enter amount: `500`
5. Select network: **MTN**
6. Enter account name: `Test Worker`
7. Enter phone: `0781234567`
8. Click **Submit Withdrawal Request**
9. In test mode, this calls the Flutterwave Transfer API in test mode — it should return success

---

# PART 6 — GO LIVE (When Ready)

## Step 16 — Switch to Live Mode

> **Only do this when you are ready to accept real money.**

### In Flutterwave Dashboard:
1. Click the **"Test"** toggle at the top-right → switch to **"Live"**
2. Go to Settings → API Keys & Webhooks
3. Copy your **LIVE** keys (they start with `FLWPUBK-` and `FLWSECK-` without `_TEST`)
4. Update the webhook URL (same URL, just make sure it's still correct)

### In Supabase:
1. Go to Settings → Edge Functions → Secrets
2. Update `FLUTTERWAVE_SECRET_KEY` with your **live** secret key (replace the test one)
3. Re-deploy all functions:
   ```
   supabase functions deploy initiate-payment
   supabase functions deploy flutterwave-webhook
   supabase functions deploy release-escrow
   supabase functions deploy flw-withdraw
   ```

### Business Verification:
Before Flutterwave activates your live account, you need to:
1. Go to **Settings → Business Information**
2. Fill in your business details
3. Upload required documents (business registration, ID)
4. Wait for approval (usually 1-3 business days)

---

# PART 7 — TROUBLESHOOTING

## Common Problems & Fixes

### "Payment link not generated"
- Check that `FLUTTERWAVE_SECRET_KEY` is set correctly in Supabase secrets
- Make sure you are using the TEST key in test mode
- Check Edge Function logs: Supabase → Edge Functions → `initiate-payment` → Logs

### "Wallet not updating after payment"
- The webhook is not reaching your function
- Go to Flutterwave dashboard → Settings → Webhooks → click **Send Test Webhook**
- Check Supabase → Edge Functions → `flutterwave-webhook` → Logs for errors
- Make sure `FLUTTERWAVE_WEBHOOK_HASH` in Supabase matches the Secret Hash in Flutterwave

### "Unauthorized" error when paying
- The user's Supabase session may have expired — ask them to log out and log back in
- Check that `js/supabaseClient.js` is loaded before `js/ewallet.js` on the page

### "Insufficient balance" on withdrawal
- The worker's `available_balance` in the `ewallets` table is 0
- Make sure a deposit was completed AND the webhook processed it
- Check the `ewallets` table in Supabase → Table Editor

### Edge Functions not found after deploy
- Run `supabase functions list` to see deployed functions
- If missing, re-run the deploy commands from Step 9

### "supabase: command not found"
- Close and reopen Command Prompt after installing
- Or try: `npx supabase --version`

---

# PART 8 — QUICK REFERENCE

## Your Key URLs

| What | URL |
|---|---|
| Flutterwave Dashboard | https://dashboard.flutterwave.com |
| Supabase Dashboard | https://supabase.com/dashboard/project/frynqsobruaczattynji |
| Initiate Payment Function | `https://frynqsobruaczattynji.supabase.co/functions/v1/initiate-payment` |
| Webhook Function | `https://frynqsobruaczattynji.supabase.co/functions/v1/flutterwave-webhook` |
| Release Escrow Function | `https://frynqsobruaczattynji.supabase.co/functions/v1/release-escrow` |
| Withdrawal Function | `https://frynqsobruaczattynji.supabase.co/functions/v1/flw-withdraw` |
| Payment Callback Page | `your-app-url/payment-callback.html` |

## Test Card Details (Test Mode Only)

| Field | Value |
|---|---|
| Card Number | `5531 8866 5214 2950` |
| CVV | `564` |
| Expiry | `09/32` |
| PIN | `3310` |
| OTP | `12345` |

## Checklist — Everything Done?

- [ ] Step 1: Flutterwave account created and email verified
- [ ] Step 2: API keys copied and saved
- [ ] Step 3: Webhook secret string created
- [ ] Step 4: `sql/flutterwave-schema.sql` run in Supabase SQL Editor
- [ ] Step 5: All 4 secrets added to Supabase Edge Functions
- [ ] Step 6: Supabase CLI installed (`supabase --version` works)
- [ ] Step 7: Logged in to Supabase CLI
- [ ] Step 8: Project linked (`supabase link` done)
- [ ] Step 9: All 4 Edge Functions deployed
- [ ] Step 10: Webhook URL registered in Flutterwave dashboard
- [ ] Step 11: `APP_URL` secret matches your hosted app URL
- [ ] Step 12: Test deposit works end-to-end
- [ ] Step 13: Test escrow payment works
- [ ] Step 14: Test escrow release works
- [ ] Step 15: Test withdrawal works
- [ ] Step 16: (When ready) Switched to live keys and business verified

---

*Guide written for Rwanda SkillsConnect — Flutterwave API v3, Supabase Edge Functions (Deno)*
