// Reset Password functionality
async function updatePassword(newPassword) {
    try {
        if (!newPassword) {
            return { success: false, error: 'New password is required' };
        }

        if (newPassword.length < 6) {
            return { success: false, error: 'Password must be at least 6 characters long' };
        }

        const { error } = await supabaseClient.auth.updateUser({
            password: newPassword
        });

        if (error) {
            console.error('Password update error:', error);
            let errorMessage = 'Failed to update password. Please try again.';
            
            if (error.message.includes('weak password')) {
                errorMessage = 'Password is too weak. Please use a stronger password.';
            } else if (error.message.includes('same password')) {
                errorMessage = 'New password must be different from the current password.';
            }
            
            return { success: false, error: errorMessage };
        }

        // Clear reset session
        sessionStorage.removeItem('resetEmail');

        return { success: true, message: 'Password updated successfully' };
    } catch (error) {
        console.error('Unexpected password update error:', error);
        return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
}

window.updatePassword = updatePassword;