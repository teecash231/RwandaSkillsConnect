// Supabase Authentication Module
// Handles OTP email authentication and password reset

// Supabase configuration - Load from environment or config
function getSupabaseConfig() {
    // Try to get from environment variables or config file
    const config = {
        url: window.SUPABASE_URL || process?.env?.SUPABASE_URL || null,
        anonKey: window.SUPABASE_ANON_KEY || process?.env?.SUPABASE_ANON_KEY || null
    };
    
    // Fallback for development - these should be set via environment
    if (!config.url || !config.anonKey) {
        console.warn('Supabase credentials not found in environment. Using fallback mode.');
        return null;
    }
    
    return config;
}

const supabaseConfig = getSupabaseConfig();

// Initialize Supabase client
let supabaseClient;

// Fallback client for when Supabase is not available
const createFallbackClient = () => ({
  auth: {
    signInWithPassword: async () => ({ data: null, error: { message: 'Supabase not available' } }),
    onAuthStateChange: () => {},
    getSession: async () => ({ data: { session: null }, error: null }),
    signOut: async () => ({ error: null }),
    signInWithOtp: async () => ({ data: null, error: { message: 'Supabase not available' } }),
    signUp: async () => ({ data: null, error: { message: 'Supabase not available' } }),
    verifyOtp: async () => ({ data: null, error: { message: 'Supabase not available' } }),
    resetPasswordForEmail: async () => ({ data: null, error: { message: 'Supabase not available' } }),
    updateUser: async () => ({ data: null, error: { message: 'Supabase not available' } })
  }
});

try {
  if (supabaseConfig && typeof supabase !== 'undefined' && supabase.createClient) {
    const { createClient } = supabase;
    supabaseClient = createClient(supabaseConfig.url, supabaseConfig.anonKey);
    console.log('Supabase client initialized successfully');
  } else {
    console.warn('Supabase configuration not available, using fallback client');
    supabaseClient = createFallbackClient();
  }
} catch (error) {
  console.warn('Supabase initialization failed, using fallback:', error.message);
  supabaseClient = createFallbackClient();
}

// ==================== UTILITY FUNCTIONS ====================

// Sanitize text content to prevent XSS
function sanitizeText(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show notification function
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
    
    switch(type) {
        case 'success':
            notification.classList.add('bg-green-500', 'text-white');
            break;
        case 'error':
            notification.classList.add('bg-red-500', 'text-white');
            break;
        case 'warning':
            notification.classList.add('bg-yellow-500', 'text-white');
            break;
        case 'info':
            notification.classList.add('bg-blue-500', 'text-white');
            break;
        default:
            notification.classList.add('bg-gray-500', 'text-white');
    }
    
    // Create elements safely to prevent XSS
    const container = document.createElement('div');
    container.className = 'flex items-center space-x-2';
    
    const messageSpan = document.createElement('span');
    messageSpan.textContent = message; // Safe text assignment
    
    const closeButton = document.createElement('button');
    closeButton.className = 'ml-2 text-white hover:text-gray-200';
    closeButton.onclick = () => notification.remove();
    closeButton.innerHTML = `
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
        </svg>
    `;
    
    container.appendChild(messageSpan);
    container.appendChild(closeButton);
    notification.appendChild(container);
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// ==================== AUTHENTICATION FUNCTIONS ====================

// Initialize Supabase auth
function initializeSupabaseAuth() {
    // Listen for auth state changes
    supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log('Supabase auth event:', event, session);

        if (event === 'SIGNED_IN' && session) {
            handleSupabaseSignIn(session);
        } else if (event === 'SIGNED_OUT') {
            handleSupabaseSignOut();
        }
    });
}

// Handle successful Supabase sign in
async function handleSupabaseSignIn(session) {
    try {
        const user = session.user;
        
        // Check if user is verified
        if (!user.email_confirmed_at) {
            showNotification('Please verify your email before signing in.', 'error');
            await supabaseSignOut();
            return;
        }

        const userData = {
            id: user.id,
            name: user.user_metadata?.full_name || user.email,
            email: user.email,
            role: user.user_metadata?.role || 'client',
            token: session.access_token,
            provider: 'supabase'
        };

        // Save to localStorage for compatibility with existing system
        localStorage.setItem('userSession', JSON.stringify(userData));

        // Add to users list if not exists
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const existingUser = users.find(u => u.email === userData.email);
        
        if (!existingUser) {
            users.push({
                ...userData,
                fullName: userData.name,
                phone: user.user_metadata?.phone || '',
                createdAt: user.created_at || new Date().toISOString(),
                verified: true,
                emailVerified: true,
                supabaseUser: true,
                supabaseId: user.id
            });
            localStorage.setItem('users', JSON.stringify(users));
        } else {
            // Update existing user with Supabase data
            existingUser.verified = true;
            existingUser.emailVerified = true;
            existingUser.supabaseUser = true;
            existingUser.supabaseId = user.id;
            localStorage.setItem('users', JSON.stringify(users));
        }

        showNotification('Authentication successful!', 'success');

        // Redirect to appropriate dashboard
        setTimeout(() => {
            redirectToDashboard(userData.role);
        }, 1000);

    } catch (error) {
        console.error('Supabase sign in error:', error);
        showNotification('Authentication failed. Please try again.', 'error');
    }
}

// Handle Supabase sign out
function handleSupabaseSignOut() {
    localStorage.removeItem('userSession');
    showNotification('Signed out successfully', 'success');
}

// ==================== OTP FUNCTIONS ====================

// Sign in with email and password
async function supabaseSignIn(email, password) {
    try {
        console.log('Attempting Supabase login for:', email);
        
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        console.log('Supabase login response:', { data, error });

        if (error) {
            console.error('Supabase login error:', error);
            throw error;
        }

        if (data.user && data.session) {
            console.log('Login successful:', data.user.id);
            return { success: true, user: data.user, session: data.session };
        } else {
            throw new Error('No user session returned');
        }

    } catch (error) {
        console.error('Login error:', error);
        let errorMessage = 'Login failed. Please check your credentials.';
        
        if (error.message.includes('Invalid login credentials')) {
            errorMessage = 'Invalid email or password. Please try again.';
        } else if (error.message.includes('Email not confirmed')) {
            errorMessage = 'Please verify your email before logging in. Check your inbox for the verification link.';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        return { success: false, error: errorMessage };
    }
}

// Send OTP for sign in
async function sendSignInOTP(email) {
    try {
        const { data, error } = await supabaseClient.auth.signInWithOtp({
            email: email,
            options: {
                shouldCreateUser: false, // Only allow existing users to sign in
                emailRedirectTo: `${window.location.origin}/login.html`
            }
        });

        if (error) throw error;

        showNotification('Sign-in code sent to your email!', 'success');
        return { success: true };

    } catch (error) {
        console.error('OTP send error:', error);
        showNotification(error.message || 'Failed to send sign-in code. Please try again.', 'error');
        return { success: false, error: error.message };
    }
}

// Send OTP for sign up
async function sendSignUpOTP(email, password, userData = {}) {
    try {
        console.log('Attempting Supabase signup for:', email);
        
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: userData.fullName,
                    role: userData.role,
                    phone: userData.phone
                },
                emailRedirectTo: `${window.location.origin}/auth-callback.html`
            }
        });

        console.log('Supabase signup response:', { data, error });

        if (error) {
            console.error('Supabase signup error:', error);
            throw error;
        }

        if (data.user) {
            console.log('User created successfully:', data.user.id);
            
            // Store user data temporarily for verification process
            const tempUserData = {
                ...userData,
                id: data.user.id,
                email: data.user.email,
                createdAt: new Date().toISOString(),
                verified: false,
                supabaseUser: true
            };
            sessionStorage.setItem('pendingUserData', JSON.stringify(tempUserData));

            if (data.user.email_confirmed_at) {
                showNotification('Account created successfully! You can now log in.', 'success');
            } else {
                showNotification('Verification email sent! Please check your inbox and click the verification link.', 'success');
            }
            
            return { success: true, user: data.user, needsVerification: !data.user.email_confirmed_at };
        } else {
            throw new Error('No user data returned from Supabase');
        }

    } catch (error) {
        console.error('Sign up error:', error);
        let errorMessage = 'Failed to send verification email. Please try again.';
        
        if (error.message.includes('already registered')) {
            errorMessage = 'This email is already registered. Please use a different email or try logging in.';
        } else if (error.message.includes('invalid email')) {
            errorMessage = 'Please enter a valid email address.';
        } else if (error.message.includes('weak password')) {
            errorMessage = 'Password is too weak. Please use at least 6 characters.';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        showNotification(errorMessage, 'error');
        return { success: false, error: errorMessage };
    }
}

// Verify OTP
async function verifyOTP(email, token) {
    try {
        const { data, error } = await supabaseClient.auth.verifyOtp({
            email: email,
            token: token,
            type: 'email'
        });

        if (error) throw error;

        // If verification successful, complete user registration
        if (data.session && data.user) {
            await completeUserRegistration(data.user, data.session);
        }

        return { success: true, session: data.session, user: data.user };

    } catch (error) {
        console.error('OTP verification error:', error);
        showNotification(error.message || 'Invalid verification code. Please try again.', 'error');
        return { success: false, error: error.message };
    }
}

// ==================== PASSWORD RESET FUNCTIONS ====================

// Send password reset email
async function sendPasswordResetEmail(email) {
    try {
        console.log('Sending password reset email to:', email);
        
        // Try Supabase first
        const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password-callback.html`
        });

        console.log('Supabase reset response:', { data, error });

        if (error) {
            console.error('Supabase reset error:', error);
            throw error;
        }

        console.log('Password reset email sent successfully via Supabase');
        showNotification('Password reset email sent! Check your inbox for the reset link.', 'success');
        return { success: true };

    } catch (error) {
        console.error('Password reset error:', error);
        
        // Fallback to local reset with OTP
        console.log('Falling back to local reset method');
        return await sendLocalPasswordReset(email);
    }
}

// Local password reset fallback
async function sendLocalPasswordReset(email) {
    try {
        const resetCode = generateOTP();
        sessionStorage.setItem('resetCode', resetCode);
        sessionStorage.setItem('resetEmail', email);
        sessionStorage.setItem('resetExpiry', (Date.now() + 10 * 60 * 1000).toString());
        
        if (window.emailService) {
            await emailService.sendPasswordResetEmail(email, resetCode);
        }
        
        showNotification('Password reset code sent! Check the email viewer (bottom-left) for your reset code.', 'success');
        return { success: true };
    } catch (error) {
        console.error('Local password reset error:', error);
        showNotification('Failed to send reset email. Please try again.', 'error');
        return { success: false, error: error.message };
    }
}

// Update password
async function updatePassword(newPassword) {
    try {
        // Try Supabase first
        const { data, error } = await supabaseClient.auth.updateUser({
            password: newPassword
        });

        if (error) {
            console.log('Supabase update failed, using local method:', error.message);
            return await updateLocalPassword(newPassword);
        }

        showNotification('Password updated successfully!', 'success');
        return { success: true };

    } catch (error) {
        console.error('Password update error:', error);
        return await updateLocalPassword(newPassword);
    }
}

// Local password update fallback
async function updateLocalPassword(newPassword) {
    try {
        const resetEmail = sessionStorage.getItem('resetEmail');
        if (!resetEmail) {
            throw new Error('No reset session found');
        }

        // Update password in local storage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.email === resetEmail);
        
        if (userIndex === -1) {
            throw new Error('User not found');
        }

        users[userIndex].password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));

        // Clear reset session
        sessionStorage.removeItem('resetCode');
        sessionStorage.removeItem('resetEmail');
        sessionStorage.removeItem('resetExpiry');

        showNotification('Password updated successfully!', 'success');
        return { success: true };
    } catch (error) {
        console.error('Local password update error:', error);
        showNotification(error.message || 'Failed to update password.', 'error');
        return { success: false, error: error.message };
    }
}

// Verify reset code
async function verifyResetCode(email, code) {
    const storedCode = sessionStorage.getItem('resetCode');
    const storedEmail = sessionStorage.getItem('resetEmail');
    const expiry = parseInt(sessionStorage.getItem('resetExpiry') || '0');

    if (Date.now() > expiry) {
        throw new Error('Reset code has expired');
    }

    if (email !== storedEmail || code !== storedCode) {
        throw new Error('Invalid reset code');
    }

    return { success: true };
}

// Complete user registration after email verification
async function completeUserRegistration(supabaseUser, session) {
    try {
        const pendingData = JSON.parse(sessionStorage.getItem('pendingUserData') || '{}');
        
        const userData = {
            id: supabaseUser.id,
            fullName: pendingData.fullName || supabaseUser.user_metadata?.full_name || supabaseUser.email,
            email: supabaseUser.email,
            phone: pendingData.phone || supabaseUser.user_metadata?.phone || '',
            role: pendingData.role || supabaseUser.user_metadata?.role || 'client',
            password: pendingData.password || '', // Keep for compatibility
            createdAt: supabaseUser.created_at || new Date().toISOString(),
            verified: true,
            emailVerified: true,
            verifiedAt: new Date().toISOString(),
            supabaseUser: true,
            supabaseId: supabaseUser.id
        };

        // Save to localStorage for compatibility with existing system
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Remove any existing user with same email
        const filteredUsers = users.filter(u => u.email !== userData.email);
        filteredUsers.push(userData);
        localStorage.setItem('users', JSON.stringify(filteredUsers));

        // Set user session
        const sessionData = {
            id: userData.id,
            name: userData.fullName,
            email: userData.email,
            role: userData.role,
            token: session.access_token,
            provider: 'supabase'
        };
        localStorage.setItem('userSession', JSON.stringify(sessionData));

        // Clear pending data
        sessionStorage.removeItem('pendingUserData');
        
        return userData;
    } catch (error) {
        console.error('Complete registration error:', error);
        throw error;
    }
}

// Generate unique ID for fallback
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Generate OTP code
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// ==================== UTILITY FUNCTIONS ====================

// Check if user is authenticated with Supabase
function isSupabaseAuthenticated() {
    return !!supabaseClient.auth.getSession();
}

// Get current Supabase session
async function getSupabaseSession() {
    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error) throw error;
        return session;
    } catch (error) {
        console.error('Get session error:', error);
        return null;
    }
}

// Sign out from Supabase
async function supabaseSignOut() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Sign out error:', error);
        return { success: false, error: error.message };
    }
}

// ==================== MODAL MANAGEMENT ====================

// Show OTP verification modal
function showOTPModal(email, type = 'signin') {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.id = 'otpModal';

    const title = type === 'signup' ? 'Verify Your Email' : 'Enter OTP';
    const subtitle = type === 'signup'
        ? 'We sent a verification code to your email'
        : 'Enter the 6-digit code sent to your email';

    // Create modal content safely
    const modalContent = document.createElement('div');
    modalContent.className = 'bg-white rounded-lg p-6 w-full max-w-md mx-4';

    // Header section
    const header = document.createElement('div');
    header.className = 'flex justify-between items-center mb-4';
    
    const titleElement = document.createElement('h2');
    titleElement.className = 'text-xl font-bold text-gray-800';
    titleElement.textContent = title;
    
    const closeButton = document.createElement('button');
    closeButton.className = 'text-gray-500 hover:text-gray-700';
    closeButton.onclick = closeOTPModal;
    closeButton.innerHTML = `
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
    `;
    
    header.appendChild(titleElement);
    header.appendChild(closeButton);

    // Info section
    const infoSection = document.createElement('div');
    infoSection.className = 'mb-4';
    
    const subtitleElement = document.createElement('p');
    subtitleElement.className = 'text-gray-600 text-sm';
    subtitleElement.textContent = subtitle;
    
    const emailElement = document.createElement('p');
    emailElement.className = 'text-gray-800 font-medium';
    emailElement.textContent = email;
    
    infoSection.appendChild(subtitleElement);
    infoSection.appendChild(emailElement);

    // Form section
    const form = document.createElement('form');
    form.id = 'otpForm';
    form.className = 'space-y-4';
    
    const inputDiv = document.createElement('div');
    const label = document.createElement('label');
    label.className = 'block text-sm font-medium text-gray-700 mb-2';
    label.textContent = 'Verification Code';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'otpCode';
    input.maxLength = 6;
    input.className = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono tracking-widest';
    input.placeholder = '000000';
    input.required = true;
    
    inputDiv.appendChild(label);
    inputDiv.appendChild(input);
    
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.id = 'verifyOTPBtn';
    submitButton.className = 'w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200';
    submitButton.textContent = 'Verify Code';
    
    const resendDiv = document.createElement('div');
    resendDiv.className = 'text-center';
    
    const resendButton = document.createElement('button');
    resendButton.type = 'button';
    resendButton.className = 'text-sm text-blue-500 hover:text-blue-600';
    resendButton.textContent = "Didn't receive code? Resend";
    resendButton.onclick = () => resendOTP(email, type);
    
    resendDiv.appendChild(resendButton);
    
    form.appendChild(inputDiv);
    form.appendChild(submitButton);
    form.appendChild(resendDiv);

    // Assemble modal
    modalContent.appendChild(header);
    modalContent.appendChild(infoSection);
    modalContent.appendChild(form);
    modal.appendChild(modalContent);

    document.body.appendChild(modal);

    // Focus on OTP input
    setTimeout(() => {
        input.focus();
    }, 100);

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const otpCode = input.value.trim();

        if (!otpCode || otpCode.length !== 6) {
            showNotification('Please enter a valid 6-digit code', 'error');
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Verifying...';

        const result = await verifyOTP(email, otpCode);

        if (result.success) {
            closeOTPModal();
        } else {
            submitButton.disabled = false;
            submitButton.textContent = 'Verify Code';
        }
    });

    // Auto-format OTP input
    input.addEventListener('input', function(e) {
        // Remove non-numeric characters
        this.value = this.value.replace(/[^0-9]/g, '');

        // Auto-submit when 6 digits entered
        if (this.value.length === 6) {
            setTimeout(() => {
                form.dispatchEvent(new Event('submit'));
            }, 500);
        }
    });
}

// Close OTP modal
function closeOTPModal() {
    const modal = document.getElementById('otpModal');
    if (modal) {
        modal.remove();
    }
}

// Resend OTP
async function resendOTP(email, type) {
    showNotification('Sending new code...', 'info');

    let result;
    if (type === 'signup') {
        result = await sendSignUpOTP(email);
    } else {
        result = await sendSignInOTP(email);
    }

    if (result.success) {
        showNotification('New code sent!', 'success');
    }
}

// Redirect to appropriate dashboard
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

// ==================== INITIALIZATION ====================

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeSupabaseAuth();
});

// Export functions for global use
window.supabaseClient = supabaseClient;
window.initializeSupabaseAuth = initializeSupabaseAuth;
window.supabaseSignIn = supabaseSignIn;
window.sendSignInOTP = sendSignInOTP;
window.sendSignUpOTP = sendSignUpOTP;
window.verifyOTP = verifyOTP;
window.sendPasswordResetEmail = sendPasswordResetEmail;
window.updatePassword = updatePassword;
window.isSupabaseAuthenticated = isSupabaseAuthenticated;
window.getSupabaseSession = getSupabaseSession;
window.supabaseSignOut = supabaseSignOut;
window.showOTPModal = showOTPModal;
window.closeOTPModal = closeOTPModal;
window.resendOTP = resendOTP;
window.completeUserRegistration = completeUserRegistration;
window.generateId = generateId;
window.redirectToDashboard = redirectToDashboard;
window.showNotification = showNotification;
window.sendLocalPasswordReset = sendLocalPasswordReset;
window.updateLocalPassword = updateLocalPassword;
window.verifyResetCode = verifyResetCode;
window.generateOTP = generateOTP;
