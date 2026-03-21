/**
 * Real Email Service
 * Sends actual emails using EmailJS service
 */

class RealEmailService {
    constructor() {
        this.serviceId = 'service_rwanda_skills';
        this.templateId = 'template_otp_email';
        this.publicKey = 'YOUR_EMAILJS_PUBLIC_KEY'; // You'll need to set this up
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            // Initialize EmailJS
            if (typeof emailjs !== 'undefined') {
                emailjs.init(this.publicKey);
                this.isInitialized = true;
                console.log('✅ Real Email Service initialized');
            } else {
                console.warn('⚠️ EmailJS not loaded, using fallback email service');
                this.initFallbackService();
            }
        } catch (error) {
            console.error('❌ Email service initialization failed:', error);
            this.initFallbackService();
        }
    }

    // Initialize fallback service using a simple SMTP service
    initFallbackService() {
        // Using a simple email API service as fallback
        this.fallbackApiUrl = 'https://api.emailjs.com/api/v1.0/email/send';
        this.isInitialized = true;
    }

    // Send OTP email
    async sendOTPEmail(email, otpCode, userData = {}) {
        try {
            const emailData = {
                to_email: email,
                to_name: userData.fullName || 'User',
                otp_code: otpCode,
                user_role: userData.role || 'user',
                company_name: 'Rwanda SkillsConnect',
                expiry_minutes: '10'
            };

            // Try multiple email sending methods
            let result = await this.sendViaEmailJS(emailData);
            
            if (!result.success) {
                result = await this.sendViaFallbackAPI(emailData);
            }

            if (!result.success) {
                result = await this.sendViaWebhook(emailData);
            }

            if (result.success) {
                console.log(`📧 OTP email sent successfully to ${email}`);
                console.log(`🔐 OTP Code: ${otpCode} (expires in 10 minutes)`);
                
                // Also show in local viewer for development
                if (window.emailService) {
                    await window.emailService.sendOTPEmail(email, otpCode, userData);
                }
                
                this.showEmailSentNotification(email, 'OTP verification code');
                return {
                    success: true,
                    message: 'OTP email sent successfully',
                    provider: result.provider
                };
            } else {
                throw new Error('All email sending methods failed');
            }

        } catch (error) {
            console.error('❌ Failed to send OTP email:', error);
            
            // Fallback to local simulation
            if (window.emailService) {
                await window.emailService.sendOTPEmail(email, otpCode, userData);
                this.showEmailFailureNotification(email);
                return {
                    success: true,
                    message: 'Email sent via local simulation (check email viewer)',
                    provider: 'local'
                };
            }
            
            throw error;
        }
    }

    // Send password reset email
    async sendPasswordResetEmail(email, resetCode) {
        try {
            const emailData = {
                to_email: email,
                to_name: 'User',
                reset_code: resetCode,
                company_name: 'Rwanda SkillsConnect',
                expiry_minutes: '10',
                reset_url: `${window.location.origin}/reset-password.html?email=${encodeURIComponent(email)}&code=${resetCode}`
            };

            let result = await this.sendPasswordResetViaEmailJS(emailData);
            
            if (!result.success) {
                result = await this.sendPasswordResetViaFallback(emailData);
            }

            if (result.success) {
                console.log(`🔐 Password reset email sent to ${email}`);
                
                // Also show in local viewer
                if (window.emailService) {
                    await window.emailService.sendPasswordResetEmail(email, resetCode);
                }
                
                this.showEmailSentNotification(email, 'Password reset code');
                return {
                    success: true,
                    message: 'Password reset email sent successfully',
                    provider: result.provider
                };
            } else {
                throw new Error('Failed to send password reset email');
            }

        } catch (error) {
            console.error('❌ Failed to send password reset email:', error);
            
            // Fallback to local simulation
            if (window.emailService) {
                await window.emailService.sendPasswordResetEmail(email, resetCode);
                this.showEmailFailureNotification(email);
                return {
                    success: true,
                    message: 'Email sent via local simulation',
                    provider: 'local'
                };
            }
            
            throw error;
        }
    }

    // Send via EmailJS
    async sendViaEmailJS(emailData) {
        try {
            if (!this.isInitialized || typeof emailjs === 'undefined') {
                return { success: false, error: 'EmailJS not available' };
            }

            const response = await emailjs.send(
                this.serviceId,
                this.templateId,
                emailData
            );

            return { success: true, provider: 'EmailJS', response };
        } catch (error) {
            console.error('EmailJS send failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Send password reset via EmailJS
    async sendPasswordResetViaEmailJS(emailData) {
        try {
            if (!this.isInitialized || typeof emailjs === 'undefined') {
                return { success: false, error: 'EmailJS not available' };
            }

            const response = await emailjs.send(
                this.serviceId,
                'template_password_reset',
                emailData
            );

            return { success: true, provider: 'EmailJS', response };
        } catch (error) {
            console.error('EmailJS password reset failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Fallback API method
    async sendViaFallbackAPI(emailData) {
        try {
            // Using a free email API service
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    access_key: 'YOUR_WEB3FORMS_KEY', // Free service key
                    to: emailData.to_email,
                    subject: 'Rwanda SkillsConnect - Email Verification Code',
                    message: `
                        Hello ${emailData.to_name},
                        
                        Your verification code for Rwanda SkillsConnect is: ${emailData.otp_code}
                        
                        This code will expire in ${emailData.expiry_minutes} minutes.
                        
                        If you didn't request this code, please ignore this email.
                        
                        Best regards,
                        Rwanda SkillsConnect Team
                    `,
                    from_name: 'Rwanda SkillsConnect'
                })
            });

            if (response.ok) {
                return { success: true, provider: 'Web3Forms' };
            } else {
                return { success: false, error: 'API request failed' };
            }
        } catch (error) {
            console.error('Fallback API failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Send password reset via fallback
    async sendPasswordResetViaFallback(emailData) {
        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    access_key: 'YOUR_WEB3FORMS_KEY',
                    to: emailData.to_email,
                    subject: 'Rwanda SkillsConnect - Password Reset Code',
                    message: `
                        Hello,
                        
                        Your password reset code for Rwanda SkillsConnect is: ${emailData.reset_code}
                        
                        You can also use this direct link to reset your password:
                        ${emailData.reset_url}
                        
                        This code will expire in ${emailData.expiry_minutes} minutes.
                        
                        If you didn't request this reset, please ignore this email.
                        
                        Best regards,
                        Rwanda SkillsConnect Team
                    `,
                    from_name: 'Rwanda SkillsConnect'
                })
            });

            if (response.ok) {
                return { success: true, provider: 'Web3Forms' };
            } else {
                return { success: false, error: 'API request failed' };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Webhook method (for custom email server)
    async sendViaWebhook(emailData) {
        try {
            // This would connect to your own email server/webhook
            const webhookUrl = 'YOUR_WEBHOOK_URL'; // Set this to your email webhook
            
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'otp_email',
                    ...emailData
                })
            });

            if (response.ok) {
                return { success: true, provider: 'Webhook' };
            } else {
                return { success: false, error: 'Webhook failed' };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Show success notification
    showEmailSentNotification(email, type) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
        notification.innerHTML = `
            <div class="flex items-start space-x-3">
                <svg class="w-6 h-6 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                </svg>
                <div class="flex-1">
                    <div class="font-semibold text-sm">Email Sent!</div>
                    <div class="text-sm opacity-90">${type} sent to:</div>
                    <div class="text-xs opacity-75 font-mono">${email}</div>
                    <div class="text-xs opacity-75 mt-1">Check your inbox and spam folder</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="text-white hover:text-gray-200">
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

    // Show failure notification
    showEmailFailureNotification(email) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-yellow-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
        notification.innerHTML = `
            <div class="flex items-start space-x-3">
                <svg class="w-6 h-6 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>
                <div class="flex-1">
                    <div class="font-semibold text-sm">Email Service Unavailable</div>
                    <div class="text-sm opacity-90">Using local simulation for:</div>
                    <div class="text-xs opacity-75 font-mono">${email}</div>
                    <div class="text-xs opacity-75 mt-1">Check the email viewer (bottom-left) for your code</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="text-white hover:text-gray-200">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 8000);
    }

    // Test email functionality
    async testEmailService() {
        const testEmail = 'test@example.com';
        const testOTP = '123456';
        
        console.log('🧪 Testing email service...');
        
        try {
            const result = await this.sendOTPEmail(testEmail, testOTP, {
                fullName: 'Test User',
                role: 'client'
            });
            
            console.log('✅ Email service test result:', result);
            return result;
        } catch (error) {
            console.error('❌ Email service test failed:', error);
            return { success: false, error: error.message };
        }
    }
}

// Initialize real email service
const realEmailService = new RealEmailService();

// Make it globally available
window.realEmailService = realEmailService;

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RealEmailService;
}