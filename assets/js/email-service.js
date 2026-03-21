/**
 * Email Service Simulation
 * Simulates sending OTP emails for development purposes
 */

class EmailService {
    constructor() {
        this.emailQueue = [];
        this.init();
    }

    init() {
        // Create email viewer if it doesn't exist
        this.createEmailViewer();
        
        // Load existing emails from localStorage
        this.loadEmails();
    }

    // Send OTP email (with real email integration)
    async sendOTPEmail(email, otpCode, userData = {}) {
        const emailData = {
            id: 'email_' + Date.now(),
            to: email,
            subject: 'Rwanda SkillsConnect - Email Verification Code',
            otpCode: otpCode,
            userData: userData,
            timestamp: new Date().toISOString(),
            read: false,
            type: 'otp_verification'
        };

        // Add to queue for local viewer
        this.emailQueue.push(emailData);
        this.saveEmails();
        this.updateEmailViewer();
        
        // Try to send real email
        let realEmailSent = false;
        try {
            const realEmailResult = await this.sendRealEmail({
                to: email,
                subject: 'Rwanda SkillsConnect - Email Verification Code',
                type: 'otp',
                otp_code: otpCode,
                user_name: userData.fullName || 'User',
                message: `Your verification code is: ${otpCode}`
            });
            
            if (realEmailResult.success) {
                realEmailSent = true;
                console.log(`✅ Real email sent to ${email}`);
                this.showRealEmailNotification(email, 'OTP verification code', true);
            }
        } catch (error) {
            console.warn('⚠️ Real email failed, using local simulation:', error.message);
        }
        
        // Always show in local viewer as backup
        console.log(`📧 Email ${realEmailSent ? 'sent' : 'simulated'} to ${email}`);
        console.log(`🔐 OTP Code: ${otpCode}`);
        console.log(`⏰ Expires in 10 minutes`);
        
        if (!realEmailSent) {
            this.showEmailNotification(emailData);
            this.showRealEmailNotification(email, 'OTP verification code', false);
        }
        
        return {
            success: true,
            messageId: emailData.id,
            message: realEmailSent ? 'OTP email sent to your inbox' : 'OTP email sent (check email viewer)',
            realEmail: realEmailSent
        };
    }

    // Send welcome email
    async sendWelcomeEmail(email, userData) {
        const emailData = {
            id: 'email_' + Date.now(),
            to: email,
            subject: 'Welcome to Rwanda SkillsConnect!',
            userData: userData,
            timestamp: new Date().toISOString(),
            read: false,
            type: 'welcome'
        };

        this.emailQueue.push(emailData);
        this.saveEmails();
        this.updateEmailViewer();
        
        console.log(`📧 Welcome email sent to ${email}`);
        
        return {
            success: true,
            messageId: emailData.id
        };
    }

    // Send password reset email (with real email integration)
    async sendPasswordResetEmail(email, resetCode) {
        const emailData = {
            id: 'email_' + Date.now(),
            to: email,
            subject: 'Rwanda SkillsConnect - Password Reset Code',
            resetCode: resetCode,
            timestamp: new Date().toISOString(),
            read: false,
            type: 'password_reset'
        };

        this.emailQueue.push(emailData);
        this.saveEmails();
        this.updateEmailViewer();
        
        // Try to send real email
        let realEmailSent = false;
        try {
            const realEmailResult = await this.sendRealEmail({
                to: email,
                subject: 'Rwanda SkillsConnect - Password Reset Code',
                type: 'reset',
                reset_code: resetCode,
                user_name: 'User',
                message: `Your password reset code is: ${resetCode}`
            });
            
            if (realEmailResult.success) {
                realEmailSent = true;
                console.log(`✅ Real password reset email sent to ${email}`);
                this.showRealEmailNotification(email, 'Password reset code', true);
            }
        } catch (error) {
            console.warn('⚠️ Real email failed, using local simulation:', error.message);
        }
        
        console.log(`🔐 Password reset email ${realEmailSent ? 'sent' : 'simulated'} to ${email}`);
        console.log(`🔑 Reset Code: ${resetCode}`);
        console.log(`⏰ Expires in 10 minutes`);
        
        if (!realEmailSent) {
            this.showEmailNotification(emailData);
            this.showRealEmailNotification(email, 'Password reset code', false);
        }
        
        return {
            success: true,
            messageId: emailData.id,
            message: realEmailSent ? 'Password reset email sent to your inbox' : 'Password reset email sent (check email viewer)',
            realEmail: realEmailSent
        };
    }

    // Create email viewer UI
    createEmailViewer() {
        // Check if viewer already exists
        if (document.getElementById('emailViewer')) return;

        const viewer = document.createElement('div');
        viewer.id = 'emailViewer';
        viewer.className = 'fixed bottom-4 left-4 w-80 bg-white border border-gray-300 rounded-lg shadow-lg z-50 hidden';
        viewer.innerHTML = `
            <div class="bg-blue-500 text-white p-3 rounded-t-lg flex justify-between items-center">
                <h3 class="font-semibold text-sm">📧 Email Inbox (Dev Mode)</h3>
                <div class="flex space-x-2">
                    <button onclick="emailService.toggleViewer()" class="text-white hover:text-gray-200">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                        </svg>
                    </button>
                    <button onclick="emailService.clearEmails()" class="text-white hover:text-gray-200">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd"></path>
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <div id="emailList" class="max-h-64 overflow-y-auto">
                <div class="p-4 text-center text-gray-500 text-sm">
                    No emails yet
                </div>
            </div>
        `;

        document.body.appendChild(viewer);

        // Add toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'emailToggleBtn';
        toggleBtn.className = 'fixed bottom-4 left-4 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors z-40';
        toggleBtn.innerHTML = `
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
            </svg>
            <span id="emailCount" class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center hidden">0</span>
        `;
        toggleBtn.onclick = () => this.toggleViewer();

        document.body.appendChild(toggleBtn);
    }

    // Toggle email viewer visibility
    toggleViewer() {
        const viewer = document.getElementById('emailViewer');
        if (viewer.classList.contains('hidden')) {
            viewer.classList.remove('hidden');
            this.markAllAsRead();
        } else {
            viewer.classList.add('hidden');
        }
    }

    // Update email viewer content
    updateEmailViewer() {
        const emailList = document.getElementById('emailList');
        if (!emailList) return;

        if (this.emailQueue.length === 0) {
            emailList.innerHTML = `
                <div class="p-4 text-center text-gray-500 text-sm">
                    No emails yet
                </div>
            `;
            return;
        }

        // Sort emails by timestamp (newest first)
        const sortedEmails = [...this.emailQueue].sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        emailList.innerHTML = sortedEmails.map(email => `
            <div class="border-b border-gray-200 p-3 hover:bg-gray-50 ${!email.read ? 'bg-blue-50' : ''}">
                <div class="flex justify-between items-start mb-2">
                    <div class="flex-1">
                        <div class="font-semibold text-sm text-gray-800">${email.subject}</div>
                        <div class="text-xs text-gray-500">To: ${email.to}</div>
                        <div class="text-xs text-gray-400">${new Date(email.timestamp).toLocaleString()}</div>
                    </div>
                    ${!email.read ? '<div class="w-2 h-2 bg-blue-500 rounded-full"></div>' : ''}
                </div>
                ${email.type === 'otp_verification' ? `
                    <div class="bg-gray-100 p-2 rounded text-center">
                        <div class="text-xs text-gray-600 mb-1">Your verification code:</div>
                        <div class="font-mono text-lg font-bold text-blue-600">${email.otpCode}</div>
                        <div class="text-xs text-gray-500 mt-1">Valid for 10 minutes</div>
                        <button onclick="emailService.copyOTP('${email.otpCode}')" class="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600">
                            Copy Code
                        </button>
                    </div>
                ` : email.type === 'password_reset' ? `
                    <div class="bg-red-50 p-2 rounded text-center border border-red-200">
                        <div class="text-xs text-red-600 mb-1">Your password reset code:</div>
                        <div class="font-mono text-lg font-bold text-red-600">${email.resetCode}</div>
                        <div class="text-xs text-red-500 mt-1">Valid for 10 minutes</div>
                        <button onclick="emailService.copyOTP('${email.resetCode}')" class="mt-2 bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600">
                            Copy Reset Code
                        </button>
                        <button onclick="emailService.openResetPage('${email.to}', '${email.resetCode}')" class="mt-2 ml-2 bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600">
                            Reset Password
                        </button>
                    </div>
                ` : `
                    <div class="text-sm text-gray-600">
                        Welcome to Rwanda SkillsConnect! Your account has been created successfully.
                    </div>
                `}
            </div>
        `).join('');

        // Update email count badge
        this.updateEmailCount();
    }

    // Update email count badge
    updateEmailCount() {
        const unreadCount = this.emailQueue.filter(email => !email.read).length;
        const countBadge = document.getElementById('emailCount');
        
        if (countBadge) {
            if (unreadCount > 0) {
                countBadge.textContent = unreadCount;
                countBadge.classList.remove('hidden');
            } else {
                countBadge.classList.add('hidden');
            }
        }
    }

    // Mark all emails as read
    markAllAsRead() {
        this.emailQueue.forEach(email => email.read = true);
        this.saveEmails();
        this.updateEmailViewer();
    }

    // Copy OTP to clipboard
    copyOTP(otpCode) {
        navigator.clipboard.writeText(otpCode).then(() => {
            this.showNotification('Code copied to clipboard!', 'success');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = otpCode;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showNotification('Code copied to clipboard!', 'success');
        });
    }

    // Open reset password page with pre-filled data
    openResetPage(email, resetCode) {
        // Store reset data for the reset page
        sessionStorage.setItem('resetEmail', email);
        sessionStorage.setItem('resetCode', resetCode);
        sessionStorage.setItem('resetExpiry', (Date.now() + 10 * 60 * 1000).toString());
        
        // Open reset page
        window.open('reset-password-local.html', '_blank');
        this.showNotification('Opening password reset page...', 'info');
    }

    // Clear all emails
    clearEmails() {
        if (confirm('Clear all emails?')) {
            this.emailQueue = [];
            this.saveEmails();
            this.updateEmailViewer();
            this.showNotification('All emails cleared', 'info');
        }
    }

    // Show email notification
    showEmailNotification(emailData) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 left-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
        notification.innerHTML = `
            <div class="flex items-start space-x-3">
                <svg class="w-6 h-6 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                </svg>
                <div class="flex-1">
                    <div class="font-semibold text-sm">New Email</div>
                    <div class="text-sm opacity-90">${emailData.subject}</div>
                    <div class="text-xs opacity-75">To: ${emailData.to}</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="text-white hover:text-gray-200">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // Show notification
    showNotification(message, type = 'success') {
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
        
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-white hover:text-gray-200">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                </button>
            </div>
        `;
        
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

    // Save emails to localStorage
    saveEmails() {
        localStorage.setItem('emailQueue', JSON.stringify(this.emailQueue));
    }

    // Load emails from localStorage
    loadEmails() {
        const saved = localStorage.getItem('emailQueue');
        if (saved) {
            this.emailQueue = JSON.parse(saved);
            this.updateEmailViewer();
        }
    }

    // Get email by ID
    getEmail(emailId) {
        return this.emailQueue.find(email => email.id === emailId);
    }

    // Get emails for specific recipient
    getEmailsForRecipient(email) {
        return this.emailQueue.filter(emailItem => emailItem.to === email);
    }

    // Send real email via PHP backend
    async sendRealEmail(emailData) {
        try {
            const response = await fetch('send-email.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailData)
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Real email sending failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Show real email notification
    showRealEmailNotification(email, type, success) {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 left-1/2 transform -translate-x-1/2 ${success ? 'bg-green-500' : 'bg-yellow-500'} text-white p-4 rounded-lg shadow-lg z-50 max-w-md`;
        
        const icon = success ? 
            `<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
            </svg>` :
            `<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
            </svg>`;
        
        notification.innerHTML = `
            <div class="flex items-start space-x-3">
                ${icon}
                <div class="flex-1">
                    <div class="font-semibold text-sm">${success ? '📧 Email Sent!' : '⚠️ Email Service Unavailable'}</div>
                    <div class="text-sm opacity-90">${type} ${success ? 'sent to' : 'simulated for'}:</div>
                    <div class="text-xs opacity-75 font-mono break-all">${email}</div>
                    <div class="text-xs opacity-75 mt-1">
                        ${success ? 'Check your inbox and spam folder' : 'Check the email viewer (bottom-left) for your code'}
                    </div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="text-white hover:text-gray-200 flex-shrink-0">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto remove after 8 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 8000);
    }
}

// Initialize email service
const emailService = new EmailService();

// Make it globally available
window.emailService = emailService;

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmailService;
}