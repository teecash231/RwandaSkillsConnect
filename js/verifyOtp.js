// verifyOtp.js — OTP/email confirmation helpers
// The primary OTP flow is handled directly in otp-verification.html.
// These helpers are kept for any legacy pages that may reference them.

async function verifyEmailConfirmation(token, type = 'signup') {
    try {
        if (!token) return { success: false, error: 'Confirmation token is required' };
        const { data, error } = await supabaseClient.auth.verifyOtp({ token_hash: token, type });
        if (error) return { success: false, error: 'Invalid or expired confirmation link. Please try signing up again.' };
        return { success: true, user: data.user };
    } catch (error) {
        return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
}

async function verifyOTP(email, token) {
    try {
        if (!email || !token) return { success: false, error: 'Email and verification code are required' };
        if (token.length !== 6) return { success: false, error: 'Verification code must be 6 digits' };
        const { data, error } = await supabaseClient.auth.verifyOtp({ email, token, type: 'signup' });
        if (error) {
            if (error.message.includes('expired')) return { success: false, error: 'Verification code has expired. Please request a new one.' };
            return { success: false, error: 'Invalid verification code. Please check and try again.' };
        }
        return { success: true, user: data.user };
    } catch (error) {
        return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
}

async function resendConfirmation(email) {
    try {
        const { error } = await supabaseClient.auth.resend({ type: 'signup', email });
        if (error) throw error;
        return { success: true, message: 'Confirmation email sent. Please check your inbox.' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

const resendOTP = resendConfirmation;

window.verifyOTP = verifyOTP;
window.verifyEmailConfirmation = verifyEmailConfirmation;
window.resendOTP = resendOTP;
window.resendConfirmation = resendConfirmation;