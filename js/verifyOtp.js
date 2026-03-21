// Email Confirmation Verification (for Supabase email confirmation)
async function verifyEmailConfirmation(token, type = 'signup') {
    try {
        if (!token) {
            return { success: false, error: 'Confirmation token is required' };
        }

        const { data, error } = await supabaseClient.auth.verifyOtp({
            token_hash: token,
            type: type
        });

        if (error) {
            console.error('Email confirmation error:', error);
            return { success: false, error: 'Invalid or expired confirmation link. Please try signing up again.' };
        }

        if (data.user) {
            // Update user verification status in admin system
            updateUserVerificationStatus(data.user.email, true);
            console.log('✅ Email confirmed successfully for:', data.user.email);
        }

        return { success: true, user: data.user, redirectToLogin: true };
    } catch (error) {
        console.error('Unexpected email confirmation error:', error);
        return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
}

// Legacy OTP verification (kept for backward compatibility)
async function verifyOTP(email, token) {
    try {
        if (!email || !token) {
            return { success: false, error: 'Email and verification code are required' };
        }

        if (token.length !== 6) {
            return { success: false, error: 'Verification code must be 6 digits' };
        }

        const { data, error } = await supabaseClient.auth.verifyOtp({
            email,
            token,
            type: 'email'
        });

        if (error) {
            console.error('OTP verification error:', error);
            let errorMessage = 'Invalid verification code. Please try again.';
            
            if (error.message.includes('expired')) {
                errorMessage = 'Verification code has expired. Please request a new one.';
            } else if (error.message.includes('invalid')) {
                errorMessage = 'Invalid verification code. Please check and try again.';
            }
            
            return { success: false, error: errorMessage };
        }

        if (data.user) {
            // Update user verification status in admin system
            updateUserVerificationStatus(data.user.email, true);
            console.log('✅ OTP verified successfully for:', data.user.email);
        }

        return { success: true, user: data.user, redirectToLogin: true };
    } catch (error) {
        console.error('Unexpected OTP verification error:', error);
        return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
}

async function resendConfirmation(email) {
    try {
        const { error } = await supabaseClient.auth.resend({
            type: 'signup',
            email: email
        });
        if (error) throw error;
        return { success: true, message: 'Confirmation email sent. Please check your inbox.' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Legacy resend OTP function
async function resendOTP(email) {
    try {
        const { error } = await supabaseClient.auth.resend({
            type: 'signup',
            email: email
        });
        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Update user verification status in admin system
function updateUserVerificationStatus(email, verified) {
    try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.email === email);
        
        if (userIndex !== -1) {
            users[userIndex].verified = verified;
            localStorage.setItem('users', JSON.stringify(users));
            console.log('✅ Updated verification status for:', email);
        }
    } catch (error) {
        console.error('❌ Error updating verification status:', error);
    }
}

window.verifyOTP = verifyOTP;
window.verifyEmailConfirmation = verifyEmailConfirmation;
window.resendOTP = resendOTP;
window.resendConfirmation = resendConfirmation;
window.updateUserVerificationStatus = updateUserVerificationStatus;