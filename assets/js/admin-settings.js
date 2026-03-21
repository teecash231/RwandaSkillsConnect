/**
 * Admin Settings JavaScript
 * Handles all admin settings functionality
 */

class AdminSettings {
    constructor() {
        this.currentSection = 'general';
        this.settings = this.loadSettings();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSettingsData();
    }

    setupEventListeners() {
        // Settings navigation
        document.querySelectorAll('.settings-nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = item.getAttribute('href').substring(1);
                this.showSettingsSection(targetId);
            });
        });

        // Form submissions
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmission(form);
            });
        });

        // Test email button
        const testEmailBtn = document.querySelector('button[type="button"]');
        if (testEmailBtn && testEmailBtn.textContent.includes('Test Email')) {
            testEmailBtn.addEventListener('click', () => this.testEmailSettings());
        }

        // Backup buttons
        const createBackupBtn = document.querySelector('button:contains("Create Backup")');
        if (createBackupBtn) {
            createBackupBtn.addEventListener('click', () => this.createBackup());
        }

        // File upload for restore
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleBackupRestore(e));
        }
    }

    showSettingsSection(sectionId) {
        const targetId = sectionId + '-section';
        
        // Update active nav item
        document.querySelectorAll('.settings-nav-item').forEach(nav => {
            nav.classList.remove('text-blue-600', 'bg-blue-50', 'active');
            nav.classList.add('text-gray-600');
        });
        
        const activeNav = document.querySelector(`[href="#${sectionId}"]`);
        if (activeNav) {
            activeNav.classList.remove('text-gray-600');
            activeNav.classList.add('text-blue-600', 'bg-blue-50', 'active');
        }
        
        // Show/hide sections
        document.querySelectorAll('.settings-section').forEach(section => {
            section.classList.add('hidden');
        });
        
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }

        this.currentSection = sectionId;
        this.loadSectionData(sectionId);
    }

    loadSettings() {
        return JSON.parse(localStorage.getItem('adminSettings') || JSON.stringify({
            general: {
                platformName: 'Rwanda SkillsConnect',
                platformUrl: 'https://skillsconnect.rw',
                currency: 'RWF',
                commissionRate: 10,
                description: 'Rwanda SkillsConnect is the premier platform for connecting skilled professionals with clients across Rwanda.',
                allowRegistration: true,
                requireEmailVerification: true
            },
            email: {
                smtpServer: '',
                smtpPort: 587,
                username: '',
                password: '',
                fromEmail: 'noreply@skillsconnect.rw',
                useSSL: false
            },
            security: {
                minPasswordLength: 8,
                requireUppercase: true,
                requireSpecialChars: false,
                enable2FA: false,
                sessionTimeout: 30,
                maxLoginAttempts: 5
            },
            payment: {
                gateway: 'stripe',
                processingFee: 2.9,
                minimumWithdrawal: 50,
                payoutSchedule: 'weekly'
            },
            notifications: {
                emailNotifications: {
                    newUsers: true,
                    newJobs: true,
                    payments: true,
                    systemAlerts: true
                },
                smsNotifications: {
                    criticalAlerts: false,
                    paymentConfirmations: false
                }
            },
            backup: {
                frequency: 'daily',
                retentionPeriod: 30
            }
        }));
    }

    loadSettingsData() {
        this.populateGeneralSettings();
        this.populateEmailSettings();
        this.populateSecuritySettings();
        this.populatePaymentSettings();
        this.populateNotificationSettings();
        this.populateBackupSettings();
    }

    loadSectionData(sectionId) {
        switch(sectionId) {
            case 'general':
                this.populateGeneralSettings();
                break;
            case 'email':
                this.populateEmailSettings();
                break;
            case 'security':
                this.populateSecuritySettings();
                break;
            case 'payment':
                this.populatePaymentSettings();
                break;
            case 'notifications':
                this.populateNotificationSettings();
                break;
            case 'backup':
                this.populateBackupSettings();
                break;
        }
    }

    populateGeneralSettings() {
        const section = document.getElementById('general-section');
        if (!section) return;

        const settings = this.settings.general;
        
        this.setInputValue(section, 'input[value="Rwanda SkillsConnect"]', settings.platformName);
        this.setInputValue(section, 'input[value="https://skillsconnect.rw"]', settings.platformUrl);
        this.setSelectValue(section, 'select', settings.currency);
        this.setInputValue(section, 'input[value="10"]', settings.commissionRate);
        this.setTextareaValue(section, 'textarea', settings.description);
        this.setCheckboxValue(section, 'input[type="checkbox"]:first-of-type', settings.allowRegistration);
        this.setCheckboxValue(section, 'input[type="checkbox"]:last-of-type', settings.requireEmailVerification);
    }

    populateEmailSettings() {
        const section = document.getElementById('email-section');
        if (!section) return;

        const settings = this.settings.email;
        
        const inputs = section.querySelectorAll('input');
        if (inputs[0]) inputs[0].value = settings.smtpServer;
        if (inputs[1]) inputs[1].value = settings.smtpPort;
        if (inputs[2]) inputs[2].value = settings.username;
        if (inputs[3]) inputs[3].value = settings.password;
        if (inputs[4]) inputs[4].value = settings.fromEmail;
        
        const sslCheckbox = section.querySelector('input[type="checkbox"]');
        if (sslCheckbox) sslCheckbox.checked = settings.useSSL;
    }

    populateSecuritySettings() {
        const section = document.getElementById('security-section');
        if (!section) return;

        const settings = this.settings.security;
        
        const checkboxes = section.querySelectorAll('input[type="checkbox"]');
        if (checkboxes[0]) checkboxes[0].checked = settings.minPasswordLength >= 8;
        if (checkboxes[1]) checkboxes[1].checked = settings.requireUppercase;
        if (checkboxes[2]) checkboxes[2].checked = settings.requireSpecialChars;
        
        const toggle = section.querySelector('.peer');
        if (toggle) toggle.checked = settings.enable2FA;
        
        const numberInputs = section.querySelectorAll('input[type="number"]');
        if (numberInputs[0]) numberInputs[0].value = settings.sessionTimeout;
        if (numberInputs[1]) numberInputs[1].value = settings.maxLoginAttempts;
    }

    populatePaymentSettings() {
        const section = document.getElementById('payment-section');
        if (!section) return;

        const settings = this.settings.payment;
        
        const selects = section.querySelectorAll('select');
        if (selects[0]) selects[0].value = settings.gateway;
        if (selects[1]) selects[1].value = settings.payoutSchedule;
        
        const numberInputs = section.querySelectorAll('input[type="number"]');
        if (numberInputs[0]) numberInputs[0].value = settings.processingFee;
        if (numberInputs[1]) numberInputs[1].value = settings.minimumWithdrawal;
    }

    populateNotificationSettings() {
        const section = document.getElementById('notifications-section');
        if (!section) return;

        const settings = this.settings.notifications;
        
        // Email notifications
        const emailCheckboxes = section.querySelectorAll('input[type="checkbox"]');
        if (emailCheckboxes[0]) emailCheckboxes[0].checked = settings.emailNotifications.newUsers;
        if (emailCheckboxes[1]) emailCheckboxes[1].checked = settings.emailNotifications.newJobs;
        if (emailCheckboxes[2]) emailCheckboxes[2].checked = settings.emailNotifications.payments;
        if (emailCheckboxes[3]) emailCheckboxes[3].checked = settings.emailNotifications.systemAlerts;
        if (emailCheckboxes[4]) emailCheckboxes[4].checked = settings.smsNotifications.criticalAlerts;
        if (emailCheckboxes[5]) emailCheckboxes[5].checked = settings.smsNotifications.paymentConfirmations;
    }

    populateBackupSettings() {
        const section = document.getElementById('backup-section');
        if (!section) return;

        const settings = this.settings.backup;
        
        const selects = section.querySelectorAll('select');
        if (selects[0]) selects[0].value = settings.frequency;
        
        const numberInputs = section.querySelectorAll('input[type="number"]');
        if (numberInputs[0]) numberInputs[0].value = settings.retentionPeriod;
    }

    handleFormSubmission(form) {
        const formData = new FormData(form);
        const sectionId = this.getSectionIdFromForm(form);
        
        switch(sectionId) {
            case 'general':
                this.saveGeneralSettings(formData);
                break;
            case 'email':
                this.saveEmailSettings(formData);
                break;
            case 'security':
                this.saveSecuritySettings(formData);
                break;
            case 'payment':
                this.savePaymentSettings(formData);
                break;
            case 'notifications':
                this.saveNotificationSettings(formData);
                break;
            case 'backup':
                this.saveBackupSettings(formData);
                break;
        }
    }

    getSectionIdFromForm(form) {
        const section = form.closest('.settings-section');
        if (section) {
            return section.id.replace('-section', '');
        }
        return 'general';
    }

    saveGeneralSettings(formData) {
        this.settings.general = {
            platformName: formData.get('platformName') || this.settings.general.platformName,
            platformUrl: formData.get('platformUrl') || this.settings.general.platformUrl,
            currency: formData.get('currency') || this.settings.general.currency,
            commissionRate: parseFloat(formData.get('commissionRate')) || this.settings.general.commissionRate,
            description: formData.get('description') || this.settings.general.description,
            allowRegistration: formData.has('allowRegistration'),
            requireEmailVerification: formData.has('requireEmailVerification')
        };
        
        this.saveSettings();
        this.showNotification('General settings saved successfully!', 'success');
    }

    saveEmailSettings(formData) {
        this.settings.email = {
            smtpServer: formData.get('smtpServer') || this.settings.email.smtpServer,
            smtpPort: parseInt(formData.get('smtpPort')) || this.settings.email.smtpPort,
            username: formData.get('username') || this.settings.email.username,
            password: formData.get('password') || this.settings.email.password,
            fromEmail: formData.get('fromEmail') || this.settings.email.fromEmail,
            useSSL: formData.has('useSSL')
        };
        
        this.saveSettings();
        this.showNotification('Email settings saved successfully!', 'success');
    }

    saveSecuritySettings(formData) {
        this.settings.security = {
            minPasswordLength: formData.has('minLength') ? 8 : 6,
            requireUppercase: formData.has('requireUppercase'),
            requireSpecialChars: formData.has('requireSpecialChars'),
            enable2FA: formData.has('enable2FA'),
            sessionTimeout: parseInt(formData.get('sessionTimeout')) || this.settings.security.sessionTimeout,
            maxLoginAttempts: parseInt(formData.get('maxLoginAttempts')) || this.settings.security.maxLoginAttempts
        };
        
        this.saveSettings();
        this.showNotification('Security settings saved successfully!', 'success');
    }

    savePaymentSettings(formData) {
        this.settings.payment = {
            gateway: formData.get('gateway') || this.settings.payment.gateway,
            processingFee: parseFloat(formData.get('processingFee')) || this.settings.payment.processingFee,
            minimumWithdrawal: parseFloat(formData.get('minimumWithdrawal')) || this.settings.payment.minimumWithdrawal,
            payoutSchedule: formData.get('payoutSchedule') || this.settings.payment.payoutSchedule
        };
        
        this.saveSettings();
        this.showNotification('Payment settings saved successfully!', 'success');
    }

    saveNotificationSettings(formData) {
        this.settings.notifications = {
            emailNotifications: {
                newUsers: formData.has('newUsers'),
                newJobs: formData.has('newJobs'),
                payments: formData.has('payments'),
                systemAlerts: formData.has('systemAlerts')
            },
            smsNotifications: {
                criticalAlerts: formData.has('criticalAlerts'),
                paymentConfirmations: formData.has('paymentConfirmations')
            }
        };
        
        this.saveSettings();
        this.showNotification('Notification settings saved successfully!', 'success');
    }

    saveBackupSettings(formData) {
        this.settings.backup = {
            frequency: formData.get('frequency') || this.settings.backup.frequency,
            retentionPeriod: parseInt(formData.get('retentionPeriod')) || this.settings.backup.retentionPeriod
        };
        
        this.saveSettings();
        this.showNotification('Backup settings saved successfully!', 'success');
    }

    saveSettings() {
        localStorage.setItem('adminSettings', JSON.stringify(this.settings));
    }

    testEmailSettings() {
        const emailSettings = this.settings.email;
        
        if (!emailSettings.smtpServer || !emailSettings.fromEmail) {
            this.showNotification('Please configure SMTP settings first', 'error');
            return;
        }

        // Simulate email test
        this.showNotification('Testing email configuration...', 'info');
        
        setTimeout(() => {
            // Simulate successful test
            this.showNotification('Test email sent successfully!', 'success');
        }, 2000);
    }

    createBackup() {
        this.showNotification('Creating backup...', 'info');
        
        const backupData = {
            users: JSON.parse(localStorage.getItem('users') || '[]'),
            jobs: JSON.parse(localStorage.getItem('jobs') || '[]'),
            appliedJobs: JSON.parse(localStorage.getItem('appliedJobs') || '[]'),
            conversations: JSON.parse(localStorage.getItem('conversations') || '[]'),
            settings: this.settings,
            timestamp: new Date().toISOString()
        };

        const dataStr = JSON.stringify(backupData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `skillsconnect-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showNotification('Backup created and downloaded successfully!', 'success');
    }

    handleBackupRestore(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!confirm('Are you sure you want to restore from this backup? This will overwrite all current data.')) {
            event.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const backupData = JSON.parse(e.target.result);
                
                // Validate backup data structure
                if (!backupData.users || !backupData.jobs || !backupData.settings) {
                    throw new Error('Invalid backup file format');
                }

                // Restore data
                localStorage.setItem('users', JSON.stringify(backupData.users));
                localStorage.setItem('jobs', JSON.stringify(backupData.jobs));
                localStorage.setItem('appliedJobs', JSON.stringify(backupData.appliedJobs || []));
                localStorage.setItem('conversations', JSON.stringify(backupData.conversations || []));
                localStorage.setItem('adminSettings', JSON.stringify(backupData.settings));

                this.settings = backupData.settings;
                this.loadSettingsData();

                this.showNotification('Backup restored successfully!', 'success');
                
                // Refresh page after 2 seconds
                setTimeout(() => {
                    window.location.reload();
                }, 2000);

            } catch (error) {
                this.showNotification('Error restoring backup: ' + error.message, 'error');
            }
        };
        
        reader.readAsText(file);
        event.target.value = '';
    }

    // Utility functions
    setInputValue(section, selector, value) {
        const input = section.querySelector(selector);
        if (input) input.value = value;
    }

    setSelectValue(section, selector, value) {
        const select = section.querySelector(selector);
        if (select) select.value = value;
    }

    setTextareaValue(section, selector, value) {
        const textarea = section.querySelector(selector);
        if (textarea) textarea.value = value;
    }

    setCheckboxValue(section, selector, value) {
        const checkbox = section.querySelector(selector);
        if (checkbox) checkbox.checked = value;
    }

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
        }
        
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-white hover:text-gray-200">
                    <i class="fas fa-times"></i>
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
}

// Initialize admin settings when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminSettings = new AdminSettings();
});

// Global function for notifications
window.showNotification = function(message, type) {
    if (window.adminSettings) {
        window.adminSettings.showNotification(message, type);
    }
};