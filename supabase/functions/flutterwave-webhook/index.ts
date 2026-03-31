import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// No CORS headers — this endpoint is called by Flutterwave servers only
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    // ── 1. Verify Flutterwave webhook signature ───────────────
    const signature = req.headers.get('verif-hash');
    const expectedHash = Deno.env.get('FLUTTERWAVE_WEBHOOK_HASH');

    if (!signature || signature !== expectedHash) {
      console.error('Webhook signature mismatch');
      return new Response('Unauthorized', { status: 401 });
    }

    const payload = await req.json();
    const { event, data } = payload;

    // Only process charge completion events
    if (event !== 'charge.completed') {
      return new Response('OK', { status: 200 });
    }

    const { tx_ref, id: flw_tx_id, flw_ref, status: flw_status, amount, currency } = data;

    if (!tx_ref) return new Response('Bad Request', { status: 400 });

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // ── 2. Idempotency: check if already processed ────────────
    const { data: intent } = await adminClient
      .from('flw_payment_intents')
      .select('*')
      .eq('transaction_ref', tx_ref)
      .single();

    if (!intent) {
      console.error('Unknown tx_ref:', tx_ref);
      return new Response('OK', { status: 200 }); // Acknowledge to stop retries
    }

    if (intent.status !== 'pending') {
      console.log('Already processed:', tx_ref);
      return new Response('OK', { status: 200 }); // Idempotent
    }

    // ── 3. Verify transaction with Flutterwave API ────────────
    const verifyRes = await fetch(`https://api.flutterwave.com/v3/transactions/${flw_tx_id}/verify`, {
      headers: { Authorization: `Bearer ${Deno.env.get('FLUTTERWAVE_SECRET_KEY')}` },
    });
    const verifyData = await verifyRes.json();

    const verified = verifyData.status === 'success' &&
      verifyData.data.status === 'successful' &&
      verifyData.data.tx_ref === tx_ref &&
      Number(verifyData.data.amount) >= Number(intent.amount) &&
      verifyData.data.currency === 'RWF';

    // ── 4. Update intent with webhook payload ─────────────────
    await adminClient
      .from('flw_payment_intents')
      .update({
        status: verified ? 'successful' : 'failed',
        flw_tx_id,
        flw_ref,
        webhook_payload: payload,
      })
      .eq('transaction_ref', tx_ref);

    if (!verified) {
      console.error('Verification failed for tx_ref:', tx_ref);
      return new Response('OK', { status: 200 });
    }

    // ── 5. Process based on payment_type ─────────────────────
    if (intent.payment_type === 'deposit') {
      await processDeposit(adminClient, intent);
    } else if (intent.payment_type === 'escrow') {
      await processEscrow(adminClient, intent);
    }

    return new Response('OK', { status: 200 });

  } catch (err) {
    console.error('Webhook error:', err);
    // Return 200 to prevent Flutterwave from retrying on our internal errors
    return new Response('OK', { status: 200 });
  }
});

async function processDeposit(adminClient: ReturnType<typeof createClient>, intent: Record<string, unknown>) {
  // Get or create wallet
  let { data: wallet } = await adminClient
    .from('ewallets')
    .select('*')
    .eq('user_id', intent.user_id)
    .single();

  if (!wallet) {
    const { data: newWallet } = await adminClient
      .from('ewallets')
      .insert({ user_id: intent.user_id })
      .select()
      .single();
    wallet = newWallet;
  }

  const amount = Number(intent.amount);

  // Credit wallet
  await adminClient
    .from('ewallets')
    .update({
      balance: wallet.balance + amount,
      available_balance: wallet.available_balance + amount,
    })
    .eq('id', wallet.id);

  // Record transaction
  await adminClient.from('ewallet_transactions').insert({
    ewallet_id: wallet.id,
    transaction_type: 'deposit',
    amount,
    fee: 0,
    net_amount: amount,
    balance_before: wallet.available_balance,
    balance_after: wallet.available_balance + amount,
    description: 'Mobile Money deposit via Flutterwave',
    reference_id: intent.transaction_ref,
    reference_type: 'flutterwave_deposit',
    status: 'completed',
    payment_method: 'mobilemoneyrwanda',
    payment_provider: 'flutterwave',
    flw_ref: intent.flw_ref,
    completed_at: new Date().toISOString(),
  });

  // Notify user
  await adminClient.from('notifications').insert({
    user_id: intent.user_id,
    type: 'payment',
    title: 'Deposit Successful',
    message: `RWF ${amount.toLocaleString()} has been added to your wallet.`,
    link: 'wallet.html',
  });
}

async function processEscrow(adminClient: ReturnType<typeof createClient>, intent: Record<string, unknown>) {
  const amount = Number(intent.amount);

  // Create escrow record
  await adminClient.from('escrow').insert({
    employer_id: intent.user_id,
    worker_id: intent.worker_id,
    job_id: intent.job_id || null,
    amount,
    transaction_ref: intent.transaction_ref,
    status: 'held',
  });

  // Record payment
  await adminClient.from('payments').insert({
    employer_id: intent.user_id,
    worker_id: intent.worker_id,
    job_id: intent.job_id || null,
    amount,
    payment_method: 'flutterwave',
    payment_provider: 'flutterwave',
    payment_status: 'successful',
    transaction_ref: intent.transaction_ref,
    status: 'pending', // pending until released
    notes: 'Flutterwave escrow payment',
  });

  // Notify employer
  await adminClient.from('notifications').insert({
    user_id: intent.user_id,
    type: 'payment',
    title: 'Payment Held in Escrow',
    message: `RWF ${amount.toLocaleString()} is held in escrow. Release it when the job is complete.`,
    link: 'employer-payments.html',
  });

  // Notify worker
  await adminClient.from('notifications').insert({
    user_id: intent.worker_id,
    type: 'payment',
    title: 'Payment Secured in Escrow',
    message: `RWF ${amount.toLocaleString()} has been secured in escrow for your job. Complete the work to receive payment.`,
    link: 'worker-earnings.html',
  });
}
