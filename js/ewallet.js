// js/ewallet.js — Phase 8: E-Wallet & Payments Service

const EwalletService = (() => {
  const db = () => window.supabaseClient;

  // ── Get wallet for current user ───────────────────────────
  async function getWallet(userId) {
    const { data, error } = await db()
      .from('ewallets')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) throw error;
    return data;
  }

  // ── Get transaction history ───────────────────────────────
  async function getTransactions(walletId, limit = 50) {
    const { data, error } = await db()
      .from('ewallet_transactions')
      .select('*')
      .eq('ewallet_id', walletId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  }

  // ── Simulate MoMo deposit (via SECURITY DEFINER RPC) ────────
  async function deposit(userId, walletId, amount, phone, currentBalance) {
    if (amount <= 0) throw new Error('Amount must be greater than 0');

    const { data, error } = await db()
      .rpc('process_deposit', {
        p_user_id: userId,
        p_amount:  amount,
        p_phone:   phone
      });

    if (error) throw error;
    if (!data.success) throw new Error(data.error);
    return data.new_balance;
  }

  // ── Request withdrawal (via SECURITY DEFINER RPC) ──────────
  async function requestWithdrawal(walletId, amount, method, details, currentBalance) {
    if (amount <= 0) throw new Error('Amount must be greater than 0');
    if (amount > parseFloat(currentBalance)) throw new Error('Insufficient balance');

    // walletId unused — RPC resolves wallet by auth.uid() server-side
    const { data: { user } } = await db().auth.getUser();

    const { data, error } = await db()
      .rpc('process_withdrawal', {
        p_user_id: user.id,
        p_amount:  amount,
        p_method:  method,
        p_details: details
      });

    if (error) throw error;
    if (!data.success) throw new Error(data.error);
    return data.new_balance;
  }

  // ── Employer sends payment to worker (atomic via Supabase RPC) ──
  async function sendPayment(employerId, workerId, jobId, amount, method, notes) {
    if (amount <= 0) throw new Error('Amount must be greater than 0');

    // Use atomic server-side function — prevents race conditions & enforces no-negative-balance
    const { data, error } = await db()
      .rpc('process_wallet_payment', {
        p_employer_id: employerId,
        p_worker_id:   workerId,
        p_job_id:      jobId || null,
        p_amount:      amount,
        p_notes:       notes || null
      });

    if (error) throw error;
    if (!data.success) throw new Error(data.error);
    return data.transaction_id;
  }

  // ── Get payments (employer sent / worker received) ────────
  async function getPayments(userId, role) {
    const col = role === 'employer' ? 'employer_id' : 'worker_id';
    const { data, error } = await db()
      .from('payments')
      .select(`
        *,
        employer:profiles!payments_employer_id_fkey(full_name, company_name, profile_image),
        worker:profiles!payments_worker_id_fkey(full_name, profile_image),
        jobs(title)
      `)
      .eq(col, userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  return { getWallet, getTransactions, deposit, requestWithdrawal, sendPayment, getPayments };
})();

window.EwalletService = EwalletService;
