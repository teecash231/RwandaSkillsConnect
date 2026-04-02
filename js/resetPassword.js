// js/resetPassword.js — legacy helper
// Primary reset-password flow is handled in reset-password.html inline script.

async function updatePassword(newPassword) {
    try {
        if (!newPassword) return { success: false, error: 'New password is required' };
        if (newPassword.length < 6) return { success: false, error: 'Password must be at least 6 characters long' };

        const { error } = await window.supabaseClient.auth.updateUser({ password: newPassword });

        if (error) {
            if (error.message.includes('weak password'))
                return { success: false, error: 'Password is too weak. Please use a stronger password.' };
            if (error.message.includes('same password'))
                return { success: false, error: 'New password must be different from the current password.' };
            return { success: false, error: 'Failed to update password. Please try again.' };
        }

        sessionStorage.removeItem('resetEmail');
        return { success: true, message: 'Password updated successfully' };
    } catch (error) {
        return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
}

window.updatePassword = updatePassword;
