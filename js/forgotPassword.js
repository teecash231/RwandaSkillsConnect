// js/forgotPassword.js — legacy helper
// Primary forgot-password flow is handled in forgot-password.html inline script.

async function sendPasswordResetOTP(email) {
    try {
        if (!email) return { success: false, error: 'Email is required' };

        const { error } = await window.supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password.html'
        });

        if (error) {
            if (error.message.toLowerCase().includes('rate limit'))
                return { success: false, error: 'Too many requests. Please wait a few minutes before trying again.' };
            return { success: false, error: 'Failed to send reset email. Please try again.' };
        }

        sessionStorage.setItem('resetEmail', email);
        return { success: true, message: 'Reset link sent to your email' };
    } catch (error) {
        return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
}

window.sendPasswordResetOTP = sendPasswordResetOTP;
