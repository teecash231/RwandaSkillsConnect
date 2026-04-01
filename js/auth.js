// ============================================================
// auth.js — Rwanda SkillsConnect Auth Module (Supabase)
// ============================================================

const Auth = (() => {
    const sb = () => window.supabaseClient;

    // ── Role → dashboard mapping ──────────────────────────────
    const DASHBOARDS = {
        admin:    'admin-dashboard.html',
        employer: 'employer-dashboard.html',
        worker:   'freelancer-dashboard.html'
    };

    // ── Sign Up ───────────────────────────────────────────────
    async function signUp(email, password, fullName, role, phone = '') {
        const { data, error } = await sb().auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName, role, phone },
                emailRedirectTo: `${location.origin}/otp-verification.html`
            }
        });
        if (error) return { success: false, error: error.message };

        // Profile is auto-created by DB trigger; return success
        return { success: true, user: data.user, needsVerification: true };
    }

    // ── Login ─────────────────────────────────────────────────
    async function login(email, password) {
        const { data, error } = await sb().auth.signInWithPassword({ email, password });
        if (error) {
            if (error.message.includes('Email not confirmed'))
                return { success: false, error: 'Please verify your email first.', needsVerification: true };
            return { success: false, error: 'Invalid email or password.' };
        }

        const profile = await getProfile(data.user.id);
        return { success: true, user: data.user, profile };
    }

    // ── Logout ────────────────────────────────────────────────
    async function logout() {
        await sb().auth.signOut();
        localStorage.removeItem('userSession');
        window.location.href = 'login.html';
    }

    // ── Get current session ───────────────────────────────────
    async function getSession() {
        const { data: { session } } = await sb().auth.getSession();
        return session;
    }

    // ── Get profile from DB ───────────────────────────────────
    async function getProfile(userId) {
        const { data, error } = await sb()
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        return error ? null : data;
    }

    // ── Redirect based on role ────────────────────────────────
    function redirectToDashboard(role) {
        window.location.href = DASHBOARDS[role] || 'index.html';
    }

    // ── Protect page: redirect if not logged in ───────────────
    async function requireAuth(allowedRoles = []) {
        const session = await getSession();
        if (!session) { window.location.href = 'login.html'; return null; }

        const profile = await getProfile(session.user.id);
        if (!profile) { window.location.href = 'login.html'; return null; }

        if (allowedRoles.length && !allowedRoles.includes(profile.role)) {
            redirectToDashboard(profile.role);
            return null;
        }
        return { session, profile };
    }

    // ── Redirect logged-in users away from auth pages ─────────
    async function redirectIfLoggedIn() {
        const session = await getSession();
        if (!session) return;
        const profile = await getProfile(session.user.id);
        if (profile) redirectToDashboard(profile.role);
    }

    // ── Forgot password ───────────────────────────────────────
    async function forgotPassword(email) {
        const { error } = await sb().auth.resetPasswordForEmail(email, {
            redirectTo: `${location.origin}/reset-password.html`
        });
        return error ? { success: false, error: error.message } : { success: true };
    }

    // ── Reset password ────────────────────────────────────────
    async function resetPassword(newPassword) {
        const { error } = await sb().auth.updateUser({ password: newPassword });
        return error ? { success: false, error: error.message } : { success: true };
    }

    // ── Verify OTP (email token) ──────────────────────────────
    async function verifyOtp(email, token) {
        const { data, error } = await sb().auth.verifyOtp({
            email, token, type: 'email'
        });
        if (error) return { success: false, error: error.message };
        return { success: true, user: data.user };
    }

    // ── OAuth: Google ─────────────────────────────────────────
    async function signInWithGoogle() {
        const { error } = await sb().auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${location.origin}/auth-callback.html` }
        });
        if (error) return { success: false, error: error.message };
        return { success: true };
    }

    // ── OAuth: LinkedIn ───────────────────────────────────────
    async function signInWithLinkedIn() {
        const { error } = await sb().auth.signInWithOAuth({
            provider: 'linkedin_oidc',
            options: { redirectTo: `${location.origin}/auth-callback.html` }
        });
        if (error) return { success: false, error: error.message };
        return { success: true };
    }

    return { signUp, login, logout, getSession, getProfile, requireAuth,
             redirectIfLoggedIn, redirectToDashboard, forgotPassword,
             resetPassword, verifyOtp, signInWithGoogle, signInWithLinkedIn, DASHBOARDS };
})();

window.Auth = Auth;
