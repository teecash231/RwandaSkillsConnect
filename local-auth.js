/**
 * Local Authentication System
 * Fallback authentication for local development and default admin
 */

class LocalAuth {
    constructor() {
        this.init();
    }

    init() {
        // Ensure default admin exists
        this.ensureDefaultAdmin();
    }

    /**
     * Ensure default admin account exists
     */
    ensureDefaultAdmin() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const defaultAdmin = users.find(user => user.email === 'admin@skillsconnect.rw');
        
        if (!defaultAdmin) {
            const adminUser = {
                id: 'admin_default_001',
                fullName: 'System Administrator',
                email: 'admin@skillsconnect.rw',
                password: 'admin123',
                role: 'admin',
                verified: true,
                createdAt: new Date().toISOString(),
                lastLogin: null,
                phone: '+250788123456',
                profileComplete: true
            };
            
            users.push(adminUser);
            localStorage.setItem('users', JSON.stringify(users));
            console.log('✅ Default admin created:', adminUser.email);
        }
    }

    /**
     * Local login function
     */
    async localLogin(email, password) {
        try {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
            
            if (!user) {
                return {
                    success: false,
                    error: 'Invalid email or password'
                };
            }
            
            if (user.password !== password) {
                return {
                    success: false,
                    error: 'Invalid email or password'
                };
            }
            
            if (!user.verified) {
                return {
                    success: false,
                    error: 'Please verify your email before signing in',
                    needsVerification: true
                };
            }
            
            // Update last login
            const userIndex = users.findIndex(u => u.id === user.id);
            if (userIndex !== -1) {
                users[userIndex].lastLogin = new Date().toISOString();
                localStorage.setItem('users', JSON.stringify(users));
            }
            
            // Create session data
            const sessionData = {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.fullName,
                verified: user.verified,
                loginTime: new Date().toISOString()
            };
            
            // Store session
            localStorage.setItem('userSession', JSON.stringify(sessionData));
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            
            return {
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    user_metadata: {
                        role: user.role,
                        first_name: user.fullName.split(' ')[0],
                        last_name: user.fullName.split(' ').slice(1).join(' '),
                        full_name: user.fullName
                    }
                },
                session: sessionData
            };
            
        } catch (error) {
            console.error('Local login error:', error);
            return {
                success: false,
                error: 'An error occurred during login'
            };
        }
    }

    /**
     * Check if user is logged in
     */
    isLoggedIn() {
        const session = localStorage.getItem('userSession');
        return !!session;
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        const sessionData = localStorage.getItem('userSession');
        if (!sessionData) return null;
        
        try {
            return JSON.parse(sessionData);
        } catch (error) {
            console.error('Error parsing session data:', error);
            return null;
        }
    }

    /**
     * Logout
     */
    logout() {
        localStorage.removeItem('userSession');
        sessionStorage.removeItem('currentUser');
        return { success: true };
    }

    /**
     * Register new user (local)
     */
    async localRegister(userData) {
        try {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            // Check if email already exists
            if (users.find(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
                return {
                    success: false,
                    error: 'Email already exists'
                };
            }
            
            const newUser = {
                id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                fullName: userData.fullName,
                email: userData.email.toLowerCase(),
                password: userData.password,
                role: userData.role || 'user',
                verified: userData.verified || false,
                createdAt: new Date().toISOString(),
                lastLogin: null,
                phone: userData.phone || '',
                profileComplete: false
            };
            
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            return {
                success: true,
                user: newUser,
                message: 'User registered successfully'
            };
            
        } catch (error) {
            console.error('Local registration error:', error);
            return {
                success: false,
                error: 'An error occurred during registration'
            };
        }
    }
}

// Enhanced login function that tries both Supabase and local auth
async function enhancedLogin(email, password) {
    console.log('🔐 Attempting login for:', email);
    
    // First try Supabase authentication
    if (window.authSystem && typeof window.authSystem.signIn === 'function') {
        try {
            console.log('📡 Trying Supabase authentication...');
            const supabaseResult = await window.authSystem.signIn(email, password);
            
            if (supabaseResult.success) {
                console.log('✅ Supabase login successful');
                return supabaseResult;
            } else {
                console.log('❌ Supabase login failed:', supabaseResult.error);
            }
        } catch (error) {
            console.log('❌ Supabase error:', error.message);
        }
    }
    
    // Fallback to local authentication
    console.log('🏠 Trying local authentication...');
    const localAuth = new LocalAuth();
    const localResult = await localAuth.localLogin(email, password);
    
    if (localResult.success) {
        console.log('✅ Local login successful');
    } else {
        console.log('❌ Local login failed:', localResult.error);
    }
    
    return localResult;
}

// Initialize local auth system
window.localAuth = new LocalAuth();
window.enhancedLogin = enhancedLogin;

// Auto-setup when script loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔧 Local Authentication System Loaded');
    
    // Ensure default admin exists
    window.localAuth.ensureDefaultAdmin();
    
    // Check if user is already logged in
    const currentUser = window.localAuth.getCurrentUser();
    if (currentUser) {
        console.log('👤 User already logged in:', currentUser.email);
        
        // Redirect to appropriate dashboard if on login page
        if (window.location.pathname.includes('login.html')) {
            const role = currentUser.role;
            let redirectUrl = 'index.html';
            
            switch(role) {
                case 'admin':
                    redirectUrl = 'admin-dashboard.html';
                    break;
                case 'freelancer':
                    redirectUrl = 'freelancer-dashboard.html';
                    break;
                case 'client':
                    redirectUrl = 'client-dashboard.html';
                    break;
            }
            
            console.log('🔄 Redirecting to:', redirectUrl);
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 1000);
        }
    }
});

console.log('🔐 Local Authentication System Ready');