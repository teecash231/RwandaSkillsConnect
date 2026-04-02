// auth-init.js — legacy AuthManager kept for backward compatibility.
// The primary auth system uses Auth (auth.js) + dashboard-auth.js.
// AuthManager is NOT loaded on any active page — it is safe to keep as-is.
// Role mappings corrected to match actual schema values: worker/employer/admin.
class AuthManager {
    constructor() {
        this.supabase = window.supabaseClient;
        this.init();
    }

    async init() {
        await this.checkSession();
        this.supabase.auth.onAuthStateChange((event, session) => {
            this.handleAuthStateChange(event, session);
        });
    }

    async checkSession() {
        try {
            const { data: { session }, error } = await this.supabase.auth.getSession();
            if (error) { console.error('Session check error:', error); return; }
            if (session) { this.updateSessionStorage(session); this.redirectIfNeeded(); }
        } catch (error) {
            console.error('Session initialization error:', error);
        }
    }

    handleAuthStateChange(event, session) {
        switch (event) {
            case 'SIGNED_IN':
                if (session) { this.updateSessionStorage(session); this.redirectToDashboard(session.user); }
                break;
            case 'SIGNED_OUT':
                this.clearSessionData(); this.redirectToLogin();
                break;
            case 'TOKEN_REFRESHED':
                if (session) this.updateSessionStorage(session);
                break;
        }
    }

    updateSessionStorage(session) {
        const userData = {
            id: session.user.id,
            email: session.user.email,
            role: session.user.user_metadata?.role || 'worker',
            fullName: session.user.user_metadata?.full_name || '',
            emailConfirmed: !!session.user.email_confirmed_at,
            accessToken: session.access_token,
            refreshToken: session.refresh_token
        };
        localStorage.setItem('userSession', JSON.stringify(userData));
        sessionStorage.setItem('supabaseSession', JSON.stringify(session));
    }

    clearSessionData() {
        localStorage.removeItem('userSession');
        sessionStorage.removeItem('supabaseSession');
        sessionStorage.removeItem('pendingUser');
        sessionStorage.removeItem('pendingUserData');
        sessionStorage.removeItem('resetEmail');
    }

    redirectToDashboard(user) {
        const currentPage = window.location.pathname.split('/').pop();
        const authPages = ['login.html', 'signup.html', 'register.html', 'verify-otp.html', 'otp-verification.html'];
        if (!authPages.includes(currentPage)) return;
        const role = user.user_metadata?.role || 'worker';
        const map = { worker: 'freelancer-dashboard.html', employer: 'employer-dashboard.html', admin: 'admin-dashboard.html' };
        window.location.href = map[role] || 'freelancer-dashboard.html';
    }

    redirectToLogin() {
        const currentPage = window.location.pathname.split('/').pop();
        const protectedPages = ['freelancer-dashboard.html', 'employer-dashboard.html', 'admin-dashboard.html', 'profile.html', 'messages.html', 'wallet.html', 'notifications.html'];
        if (protectedPages.includes(currentPage)) window.location.href = 'login.html';
    }

    redirectIfNeeded() {
        const userData = JSON.parse(localStorage.getItem('userSession') || '{}');
        if (userData.id) this.redirectToDashboard({ user_metadata: { role: userData.role } });
    }

    isAuthenticated() {
        const userData = JSON.parse(localStorage.getItem('userSession') || '{}');
        return !!userData.id && !!userData.emailConfirmed;
    }

    getCurrentUserData() {
        return JSON.parse(localStorage.getItem('userSession') || '{}');
    }

    async protectPage() {
        const { data: { session }, error } = await this.supabase.auth.getSession();
        if (error || !session) { window.location.href = 'login.html'; return false; }
        if (!session.user.email_confirmed_at) {
            window.location.href = 'otp-verification.html?email=' + encodeURIComponent(session.user.email);
            return false;
        }
        return true;
    }
}

document.addEventListener('DOMContentLoaded', () => { window.authManager = new AuthManager(); });
window.AuthManager = AuthManager;