import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    // ── Auth: verify caller ───────────────────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Unauthorized' }, 401);

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authErr } = await adminClient.auth.getUser(token);
    if (authErr || !user) return json({ error: 'Unauthorized' }, 401);

    // ── Parse & validate body ─────────────────────────────────
    const { amount, payment_type, worker_id, job_id, phone } = await req.json();

    if (!amount || amount < 500) return json({ error: 'Minimum amount is RWF 500' }, 400);
    if (!['deposit', 'escrow'].includes(payment_type)) return json({ error: 'Invalid payment_type' }, 400);
    if (payment_type === 'escrow' && !worker_id) return json({ error: 'worker_id required for escrow' }, 400);

    // ── Fetch caller profile ──────────────────────────────────
    const { data: profile } = await adminClient
      .from('profiles')
      .select('full_name, phone, role')
      .eq('id', user.id)
      .single();

    if (!profile) return json({ error: 'Profile not found' }, 404);
    if (payment_type === 'escrow' && profile.role !== 'employer') {
      return json({ error: 'Only employers can initiate escrow payments' }, 403);
    }

    // ── Generate unique transaction ref ───────────────────────
    const tx_ref = `RSC-${Date.now()}-${crypto.randomUUID().split('-')[0].toUpperCase()}`;

    // ── Store payment intent (service_role bypasses RLS) ──────
    const { error: intentErr } = await adminClient
      .from('flw_payment_intents')
      .insert({
        transaction_ref: tx_ref,
        user_id: user.id,
        amount,
        currency: 'RWF',
        payment_type,
        worker_id: worker_id || null,
        job_id: job_id || null,
        status: 'pending',
      });

    if (intentErr) throw new Error('Failed to create payment intent: ' + intentErr.message);

    // ── Call Flutterwave Standard Payment API ─────────────────
    const flwPayload = {
      tx_ref,
      amount,
      currency: 'RWF',
      redirect_url: `${Deno.env.get('APP_URL')}/payment-callback.html`,
      payment_options: 'mobilemoneyrwanda',
      customer: {
        email: user.email,
        phonenumber: phone || profile.phone || '',
        name: profile.full_name || user.email,
      },
      customizations: {
        title: 'Rwanda SkillsConnect',
        description: payment_type === 'escrow' ? 'Escrow Payment for Job' : 'Wallet Deposit',
        logo: `${Deno.env.get('APP_URL')}/assets/logo.png`,
      },
      meta: {
        user_id: user.id,
        payment_type,
        worker_id: worker_id || null,
        job_id: job_id || null,
      },
    };

    const flwRes = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Deno.env.get('FLUTTERWAVE_SECRET_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(flwPayload),
    });

    const flwData = await flwRes.json();

    if (flwData.status !== 'success') {
      // Clean up intent on FLW failure
      await adminClient.from('flw_payment_intents').delete().eq('transaction_ref', tx_ref);
      return json({ error: flwData.message || 'Flutterwave error' }, 502);
    }

    return json({ payment_link: flwData.data.link, tx_ref });

  } catch (err) {
    console.error('initiate-payment error:', err);
    return json({ error: err.message || 'Internal error' }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
