// release-escrow — REMOVED
// Escrow has been removed. Payments go directly from employer wallet to worker wallet
// via the process_wallet_payment Supabase RPC.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
Deno.serve((req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  return new Response(
    JSON.stringify({ error: 'This endpoint has been removed. Use the process_wallet_payment RPC instead.' }),
    { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
