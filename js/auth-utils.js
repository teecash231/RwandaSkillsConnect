// Authentication utility functions
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }
}

function hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.classList.add('hidden');
    }
}

function showSuccess(elementId, message) {
    const successElement = document.getElementById(elementId);
    if (successElement) {
        successElement.textContent = message;
        successElement.classList.remove('hidden');
    }
}

function setLoading(buttonId, isLoading, loadingText = 'Loading...', normalText = 'Submit') {
    const button = document.getElementById(buttonId);
    if (button) {
        button.disabled = isLoading;
        button.textContent = isLoading ? loadingText : normalText;
    }
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

// Export functions
window.authUtils = {
    showError,
    hideError,
    showSuccess,
    setLoading,
    validateEmail,
    validatePassword
};