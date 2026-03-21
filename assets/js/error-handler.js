/**
 * Global Error Handler for Rwanda SkillsConnect
 * Handles errors gracefully and provides user feedback
 */

class ErrorHandler {
    constructor() {
        this.initializeGlobalErrorHandling();
        this.setupUnhandledRejectionHandler();
    }

    // Initialize global error handling
    initializeGlobalErrorHandling() {
        window.addEventListener('error', (event) => {
            this.handleError(event.error, 'JavaScript Error');
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason, 'Promise Rejection');
        });
    }

    // Setup unhandled promise rejection handler
    setupUnhandledRejectionHandler() {
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            
            // Prevent the default browser behavior
            event.preventDefault();
            
            // Show user-friendly error message
            this.showUserError('Something went wrong. Please try again.');
        });
    }

    // Handle different types of errors
    handleError(error, type = 'Error') {
        console.error(`${type}:`, error);

        // Don't show error notifications for certain types of errors
        const silentErrors = [
            'ResizeObserver loop limit exceeded',
            'Non-Error promise rejection captured',
            'Script error'
        ];

        const errorMessage = error?.message || error?.toString() || 'Unknown error';
        
        if (silentErrors.some(silent => errorMessage.includes(silent))) {
            return;
        }

        // Show appropriate error message to user
        this.showUserError(this.getUserFriendlyMessage(error));
    }

    // Get user-friendly error message
    getUserFriendlyMessage(error) {
        const errorMessage = error?.message || error?.toString() || '';

        // Network errors
        if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
            return 'Network connection issue. Please check your internet connection.';
        }

        // Authentication errors
        if (errorMessage.includes('auth') || errorMessage.includes('login')) {
            return 'Authentication error. Please log in again.';
        }

        // Storage errors
        if (errorMessage.includes('localStorage') || errorMessage.includes('storage')) {
            return 'Storage error. Please clear your browser cache and try again.';
        }

        // Permission errors
        if (errorMessage.includes('permission') || errorMessage.includes('denied')) {
            return 'Permission denied. You don\'t have access to this feature.';
        }

        // Default error message
        return 'Something went wrong. Please try again or contact support if the problem persists.';
    }

    // Show error to user
    showUserError(message) {
        if (typeof showNotification === 'function') {
            showNotification(message, 'error');
        } else {
            // Fallback to alert if notification system is not available
            alert(message);
        }
    }

    // Validate form data
    static validateFormData(formData, rules) {
        const errors = [];

        Object.keys(rules).forEach(field => {
            const value = formData[field];
            const rule = rules[field];

            // Required field validation
            if (rule.required && (!value || value.toString().trim() === '')) {
                errors.push(`${rule.label || field} is required`);
                return;
            }

            // Skip other validations if field is empty and not required
            if (!value || value.toString().trim() === '') {
                return;
            }

            // Email validation
            if (rule.email && !this.isValidEmail(value)) {
                errors.push(`${rule.label || field} must be a valid email address`);
            }

            // Phone validation
            if (rule.phone && !this.isValidPhone(value)) {
                errors.push(`${rule.label || field} must be a valid phone number`);
            }

            // Minimum length validation
            if (rule.minLength && value.length < rule.minLength) {
                errors.push(`${rule.label || field} must be at least ${rule.minLength} characters`);
            }

            // Maximum length validation
            if (rule.maxLength && value.length > rule.maxLength) {
                errors.push(`${rule.label || field} must not exceed ${rule.maxLength} characters`);
            }

            // Number validation
            if (rule.number && isNaN(Number(value))) {
                errors.push(`${rule.label || field} must be a valid number`);
            }

            // Minimum value validation
            if (rule.min && Number(value) < rule.min) {
                errors.push(`${rule.label || field} must be at least ${rule.min}`);
            }

            // Maximum value validation
            if (rule.max && Number(value) > rule.max) {
                errors.push(`${rule.label || field} must not exceed ${rule.max}`);
            }

            // Custom validation
            if (rule.custom && typeof rule.custom === 'function') {
                const customError = rule.custom(value);
                if (customError) {
                    errors.push(customError);
                }
            }
        });

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Email validation
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Phone validation (supports international formats)
    static isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
        return phoneRegex.test(cleanPhone) && cleanPhone.length >= 10;
    }

    // Sanitize HTML to prevent XSS
    static sanitizeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Safe localStorage operations
    static safeLocalStorageGet(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    }

    static safeLocalStorageSet(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error writing to localStorage:', error);
            if (typeof showNotification === 'function') {
                showNotification('Storage error. Please clear your browser cache.', 'error');
            }
            return false;
        }
    }

    // Retry mechanism for failed operations
    static async retryOperation(operation, maxRetries = 3, delay = 1000) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await operation();
            } catch (error) {
                if (i === maxRetries - 1) {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
            }
        }
    }

    // Debounce function to prevent excessive API calls
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Throttle function to limit function execution frequency
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Initialize error handler
const errorHandler = new ErrorHandler();

// Make ErrorHandler available globally
window.ErrorHandler = ErrorHandler;

// Export utility functions
window.safeLocalStorageGet = ErrorHandler.safeLocalStorageGet;
window.safeLocalStorageSet = ErrorHandler.safeLocalStorageSet;
window.validateFormData = ErrorHandler.validateFormData;
window.sanitizeHTML = ErrorHandler.sanitizeHTML;
window.retryOperation = ErrorHandler.retryOperation;
window.debounceUtil = ErrorHandler.debounce;
window.throttleUtil = ErrorHandler.throttle;