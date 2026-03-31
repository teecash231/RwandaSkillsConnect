const SUPABASE_URL = 'https://frynqsobruaczattynji.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyeW5xc29icnVhY3phdHR5bmppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MjcyNTAsImV4cCI6MjA4OTUwMzI1MH0.oRs3AkfPXz1NtC001Ngml_MTG7jmvW2ErqScUVm8Anw';

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

window.supabaseClient = supabaseClient;
