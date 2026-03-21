// Authentication Initialization and Session Management
class AuthManager {
    constructor() {
        this.supabase = window.supabaseClient;
        this.init();
    }

    async init() {
        // Check for existing session on page load
        await this.checkSession();
        
        // Listen for auth state changes
        this.supabase.auth.onAuthStateChange((event, session) => {
            this.handleAuthStateChange(event, session);
        });
    }

    async checkSession() {
        try {
            const { data: { session }, error } = await this.supabase.auth.getSession();
            
            if (error) {
                console.error('Session check error:', error);
                return;
            }

            if (session) {
                this.updateSessionStorage(session);
                this.redirectIfNeeded();
            }
        } catch (error) {
            console.error('Session initialization error:', error);
        }
    }

    handleAuthStateChange(event, session) {
        console.log('Auth state changed:', event, session);
        
        switch (event) {
            case 'SIGNED_IN':
                if (session) {
                    this.updateSessionStorage(session);
                    this.redirectToDashboard(session.user);
                }
                break;
            case 'SIGNED_OUT':
                this.clearSessionData();
                this.redirectToLogin();
                break;
            case 'TOKEN_REFRESHED':
                if (session) {
                    this.updateSessionStorage(session);
                }
                break;
        }
    }

    updateSessionStorage(session) {
        const userData = {
            id: session.user.id,
            email: session.user.email,
            role: session.user.user_metadata?.role || 'user',
            firstName: session.user.user_metadata?.first_name || '',
            lastName: session.user.user_metadata?.last_name || '',
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
        // Only redirect if we're on auth pages
        const currentPage = window.location.pathname.split('/').pop();
        const authPages = ['login.html', 'signup.html', 'register.html', 'verify-otp.html'];
        
        if (authPages.includes(currentPage)) {
            const role = user.user_metadata?.role || 'user';
            
            switch (role) {
                case 'freelancer':
                    window.location.href = 'freelancer-dashboard.html';
                    break;
                case 'client':
                    window.location.href = 'client-dashboard.html';
                    break;
                case 'admin':
                    window.location.href = 'admin-dashboard.html';
                    break;
                default:
                    window.location.href = 'index.html';
            }
        }
    }

    redirectToLogin() {
        // Only redirect if we're on protected pages
        const currentPage = window.location.pathname.split('/').pop();
        const protectedPages = [
            'freelancer-dashboard.html', 'client-dashboard.html', 'admin-dashboard.html',
            'profile.html', 'freelancer-messages.html', 'client-messages.html'
        ];
        
        if (protectedPages.includes(currentPage)) {
            window.location.href = 'login.html';
        }
    }

    redirectIfNeeded() {
        const userData = JSON.parse(localStorage.getItem('userSession') || '{}');
        if (userData.id) {
            this.redirectToDashboard({ user_metadata: { role: userData.role } });
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        const userData = JSON.parse(localStorage.getItem('userSession') || '{}');
        return !!userData.id && !!userData.emailConfirmed;
    }

    // Get current user data
    getCurrentUserData() {
        return JSON.parse(localStorage.getItem('userSession') || '{}');
    }

    // Protect page (call this on protected pages)
    async protectPage() {
        const { data: { session }, error } = await this.supabase.auth.getSession();
        
        if (error || !session) {
            window.location.href = 'login.html';
            return false;
        }

        if (!session.user.email_confirmed_at) {
            window.location.href = 'verify-otp.html?email=' + encodeURIComponent(session.user.email);
            return false;
        }

        return true;
    }
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});

// Export for global use
window.AuthManager = AuthManager;