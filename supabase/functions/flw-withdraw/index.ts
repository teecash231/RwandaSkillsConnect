import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Unauthorized' }, 401);

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authErr } = await adminClient.auth.getUser(token);
    if (authErr || !user) return json({ error: 'Unauthorized' }, 401);

    const { amount, phone, network, account_name } = await req.json();

    if (!amount || amount < 1000) return json({ error: 'Minimum withdrawal is RWF 1,000' }, 400);
    if (!phone) return json({ error: 'Phone number is required' }, 400);
    if (!account_name) return json({ error: 'Account name is required' }, 400);
    if (!['MTN', 'AIRTEL'].includes((network || '').toUpperCase())) {
      return json({ error: 'Network must be MTN or AIRTEL' }, 400);
    }

    // ── Check & deduct wallet balance atomically ──────────────
    const { data: wallet } = await adminClient
      .from('ewallets')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!wallet) return json({ error: 'Wallet not found' }, 404);

    const fee = Math.max(Math.round(amount * 0.01), 10);
    const net = amount - fee;

    if (wallet.available_balance < amount) {
      return json({ error: `Insufficient balance. Available: RWF ${wallet.available_balance}` }, 400);
    }

    // Deduct balance first (prevents double-spend)
    const { error: deductErr } = await adminClient
      .from('ewallets')
      .update({
        available_balance: wallet.available_balance - amount,
        balance: wallet.balance - amount,
      })
      .eq('id', wallet.id)
      .eq('available_balance', wallet.available_balance); // Optimistic lock

    if (deductErr) return json({ error: 'Balance update failed, please retry' }, 409);

    // ── Call Flutterwave Transfer API ─────────────────────────
    const transferRef = `WD-${Date.now()}-${crypto.randomUUID().split('-')[0].toUpperCase()}`;
    const secretKey = Deno.env.get('FLUTTERWAVE_SECRET_KEY') || '';
    const isTestMode = secretKey.startsWith('FLWSECK_TEST-');

    if (!isTestMode) {
      const networkMap: Record<string, string> = { MTN: 'MPS', AIRTEL: 'AIRTEL' };

      const flwRes = await fetch('https://api.flutterwave.com/v3/transfers', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_bank: networkMap[network.toUpperCase()],
          account_number: phone,
          amount: net,
          narration: 'Rwanda SkillsConnect withdrawal',
          currency: 'RWF',
          reference: transferRef,
          beneficiary_name: account_name,
          meta: [{ mobile_number: phone }],
        }),
      });

      const flwData = await flwRes.json();

      if (flwData.status !== 'success') {
        // Refund balance on FLW failure
        await adminClient
          .from('ewallets')
          .update({
            available_balance: wallet.available_balance,
            balance: wallet.balance,
          })
          .eq('id', wallet.id);

        return json({ error: flwData.message || 'Transfer failed' }, 502);
      }
    }
    // In test mode: skip real transfer, simulate success

    // ── Record transaction ────────────────────────────────────
    await adminClient.from('ewallet_transactions').insert({
      ewallet_id: wallet.id,
      transaction_type: 'withdrawal',
      amount,
      fee,
      net_amount: net,
      balance_before: wallet.available_balance,
      balance_after: wallet.available_balance - amount,
      description: `Withdrawal to ${network} ${phone}`,
      reference_id: transferRef,
      reference_type: 'flutterwave_transfer',
      status: 'completed',
      payment_method: 'mobilemoneyrwanda',
      payment_provider: 'flutterwave',
      completed_at: new Date().toISOString(),
    });

    await adminClient.from('ewallet_withdrawals').insert({
      ewallet_id: wallet.id,
      amount,
      fee,
      net_amount: net,
      withdrawal_method: 'mobile_money',
      withdrawal_details: { phone, network, account_name, flw_ref: transferRef },
      status: 'completed',
    });

    return json({ success: true, reference: transferRef, net_amount: net });

  } catch (err) {
    console.error('flw-withdraw error:', err);
    return json({ error: err.message || 'Internal error' }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
