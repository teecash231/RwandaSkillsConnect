const SUPABASE_URL = 'https://frynqsobruaczattynji.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_3l7ucHnCkuP2HUv1ctfCBg_Q6HcLcix';

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

window.supabaseClient = supabaseClient;
