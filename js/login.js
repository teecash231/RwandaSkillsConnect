// js/login.js — legacy helper, primary login is handled in login.html inline script
// Kept for any pages that import this file directly.

async function handleLogin(email, password) {
    try {
        if (!email || !password) return { success: false, error: 'Email and password are required' };

        const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email, password });

        if (error) {
            if (error.message.includes('Invalid login credentials'))
                return { success: false, error: 'Invalid email or password. Please try again.' };
            if (error.message.includes('Email not confirmed'))
                return { success: false, error: 'Please verify your email before logging in.' };
            return { success: false, error: 'Login failed. Please check your credentials.' };
        }

        if (!data.user.email_confirmed_at) {
            await window.supabaseClient.auth.signOut();
            return { success: false, error: 'Please verify your email before signing in.' };
        }

        localStorage.setItem('userSession', JSON.stringify({
            id: data.user.id,
            name: data.user.user_metadata?.full_name || data.user.email,
            email: data.user.email,
            role: data.user.user_metadata?.role || 'worker',
            token: data.session.access_token,
            provider: 'supabase'
        }));

        return { success: true, user: data.user };
    } catch (error) {
        return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
}

function redirectToDashboard(role) {
    const map = { worker: 'freelancer-dashboard.html', employer: 'employer-dashboard.html', admin: 'admin-dashboard.html' };
    window.location.href = map[role] || 'freelancer-dashboard.html';
}

window.handleLogin = handleLogin;
window.redirectToDashboard = redirectToDashboard;
