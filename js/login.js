// Login functionality
async function handleLogin(email, password) {
    try {
        if (!email || !password) {
            return { success: false, error: 'Email and password are required' };
        }

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error('Login error:', error);
            let errorMessage = 'Login failed. Please check your credentials.';
            
            if (error.message.includes('Invalid login credentials')) {
                errorMessage = 'Invalid email or password. Please try again.';
            } else if (error.message.includes('Email not confirmed')) {
                errorMessage = 'Please verify your email before logging in.';
            }
            
            return { success: false, error: errorMessage };
        }

        // Check if email is verified
        if (!data.user.email_confirmed_at) {
            await supabaseClient.auth.signOut();
            return { 
                success: false, 
                error: 'Please verify your email before signing in.' 
            };
        }

        // Store session data
        const sessionData = {
            id: data.user.id,
            name: data.user.user_metadata?.full_name || data.user.email,
            email: data.user.email,
            role: data.user.user_metadata?.role || 'user',
            token: data.session.access_token,
            provider: 'supabase'
        };
        
        localStorage.setItem('userSession', JSON.stringify(sessionData));
        sessionStorage.setItem('userSession', JSON.stringify({
            user: data.user,
            session: data.session
        }));

        return { success: true, user: data.user };
    } catch (error) {
        console.error('Unexpected login error:', error);
        return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
}

// Check authentication state
supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
        // Redirect to dashboard based on user role
        const role = session.user.user_metadata?.role || 'user';
        redirectToDashboard(role);
    }
});

function redirectToDashboard(role) {
    switch(role) {
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

window.handleLogin = handleLogin;