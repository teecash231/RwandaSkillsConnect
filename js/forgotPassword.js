// Forgot Password functionality with OTP
async function sendPasswordResetOTP(email) {
    try {
        if (!email) {
            return { success: false, error: 'Email is required' };
        }

        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password.html'
        });

        if (error) {
            console.error('Password reset error:', error);
            let errorMessage = 'Failed to send reset email. Please try again.';
            
            if (error.message.includes('not found')) {
                errorMessage = 'No account found with this email address.';
            }
            
            return { success: false, error: errorMessage };
        }

        // Store email for reset process
        sessionStorage.setItem('resetEmail', email);

        return { success: true, message: 'Reset link sent to your email' };
    } catch (error) {
        console.error('Unexpected password reset error:', error);
        return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
}

// For OTP-based reset (alternative method)
async function sendPasswordResetWithOTP(email) {
    try {
        const { error } = await supabaseClient.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: false
            }
        });

        if (error) throw error;

        sessionStorage.setItem('resetEmail', email);
        return { success: true, message: 'Reset code sent to your email' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function verifyResetOTP(email, token) {
    try {
        const { data, error } = await supabaseClient.auth.verifyOtp({
            email,
            token,
            type: 'email'
        });

        if (error) throw error;

        return { success: true, session: data.session };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

window.sendPasswordResetOTP = sendPasswordResetOTP;
window.sendPasswordResetWithOTP = sendPasswordResetWithOTP;
window.verifyResetOTP = verifyResetOTP;