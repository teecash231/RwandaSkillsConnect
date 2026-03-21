/**
 * Storage Utilities for Rwanda SkillsConnect
 * Provides safe and reliable data storage operations
 */

class StorageUtils {
    constructor() {
        this.initializeStorage();
    }

    // Initialize storage with default data structure
    initializeStorage() {
        const defaultData = {
            users: [],
            jobs: [],
            appliedJobs: [],
            conversations: [],
            settings: {
                jobApprovalRequired: true,
                emailNotifications: true,
                theme: 'light'
            }
        };

        Object.keys(defaultData).forEach(key => {
            if (!this.safeGet(key)) {
                this.safeSet(key, defaultData[key]);
            }
        });
    }

    // Safe get operation with error handling
    safeGet(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            if (item === null) return defaultValue;
            return JSON.parse(item);
        } catch (error) {
            console.error(`Error reading ${key} from localStorage:`, error);
            return defaultValue;
        }
    }

    // Safe set operation with error handling
    safeSet(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error writing ${key} to localStorage:`, error);
            
            // Handle quota exceeded error
            if (error.name === 'QuotaExceededError') {
                this.handleStorageQuotaExceeded();
            }
            
            return false;
        }
    }

    // Handle storage quota exceeded
    handleStorageQuotaExceeded() {
        if (typeof showNotification === 'function') {
            showNotification('Storage quota exceeded. Some data may not be saved.', 'warning');
        }
        
        // Try to clean up old data
        this.cleanupOldData();
    }

    // Clean up old data to free storage space
    cleanupOldData() {
        try {
            // Remove old conversations (older than 30 days)
            const conversations = this.safeGet('conversations', []);
            const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
            
            const filteredConversations = conversations.filter(conv => {
                const lastMessageTime = new Date(conv.lastMessageTime).getTime();
                return lastMessageTime > thirtyDaysAgo;
            });
            
            this.safeSet('conversations', filteredConversations);
            
            // Remove old job applications (older than 90 days)
            const applications = this.safeGet('appliedJobs', []);
            const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
            
            const filteredApplications = applications.filter(app => {
                const appliedTime = new Date(app.appliedAt).getTime();
                return appliedTime > ninetyDaysAgo;
            });
            
            this.safeSet('appliedJobs', filteredApplications);
            
        } catch (error) {
            console.error('Error cleaning up old data:', error);
        }
    }

    // Get user by ID with validation
    getUser(userId) {
        if (!userId) return null;
        
        const users = this.safeGet('users', []);
        return users.find(user => user.id === userId) || null;
    }

    // Update user data with validation
    updateUser(userId, userData) {
        if (!userId || !userData) return false;
        
        const users = this.safeGet('users', []);
        const userIndex = users.findIndex(user => user.id === userId);
        
        if (userIndex === -1) return false;
        
        // Validate user data
        const validationResult = this.validateUserData(userData);
        if (!validationResult.isValid) {
            console.error('User data validation failed:', validationResult.errors);
            return false;
        }
        
        // Update user
        users[userIndex] = { ...users[userIndex], ...userData, updatedAt: new Date().toISOString() };
        
        return this.safeSet('users', users);
    }

    // Validate user data
    validateUserData(userData) {
        const rules = {
            fullName: { required: true, minLength: 2, maxLength: 100, label: 'Full Name' },
            email: { required: true, email: true, label: 'Email' },
            phone: { phone: true, label: 'Phone Number' },
            role: { required: true, custom: (value) => {
                const validRoles = ['freelancer', 'client', 'admin'];
                return validRoles.includes(value) ? null : 'Invalid role';
            }, label: 'Role' }
        };

        return ErrorHandler.validateFormData(userData, rules);
    }

    // Get job by ID with validation
    getJob(jobId) {
        if (!jobId) return null;
        
        const jobs = this.safeGet('jobs', []);
        return jobs.find(job => job.id === jobId) || null;
    }

    // Add new job with validation
    addJob(jobData) {
        if (!jobData) return false;
        
        // Validate job data
        const validationResult = this.validateJobData(jobData);
        if (!validationResult.isValid) {
            console.error('Job data validation failed:', validationResult.errors);
            return false;
        }
        
        const jobs = this.safeGet('jobs', []);
        const newJob = {
            ...jobData,
            id: jobData.id || this.generateId(),
            createdAt: new Date().toISOString(),
            status: jobData.status || 'active'
        };
        
        jobs.push(newJob);
        return this.safeSet('jobs', jobs);
    }

    // Validate job data
    validateJobData(jobData) {
        const rules = {
            title: { required: true, minLength: 5, maxLength: 200, label: 'Job Title' },
            description: { required: true, minLength: 20, maxLength: 2000, label: 'Job Description' },
            salary: { required: true, number: true, min: 1000, label: 'Salary' },
            clientId: { required: true, label: 'Client ID' },
            location: { required: true, minLength: 2, maxLength: 100, label: 'Location' }
        };

        return ErrorHandler.validateFormData(jobData, rules);
    }

    // Add job application with validation
    addJobApplication(applicationData) {
        if (!applicationData) return false;
        
        // Check if user already applied to this job
        const existingApplication = this.getJobApplication(applicationData.jobId, applicationData.freelancerId);
        if (existingApplication) {
            return { success: false, error: 'You have already applied to this job' };
        }
        
        // Validate application data
        const validationResult = this.validateApplicationData(applicationData);
        if (!validationResult.isValid) {
            console.error('Application data validation failed:', validationResult.errors);
            return { success: false, error: validationResult.errors[0] };
        }
        
        const applications = this.safeGet('appliedJobs', []);
        const newApplication = {
            ...applicationData,
            id: applicationData.id || this.generateId(),
            appliedAt: new Date().toISOString(),
            status: applicationData.status || 'pending'
        };
        
        applications.push(newApplication);
        const success = this.safeSet('appliedJobs', applications);
        
        return { success, application: success ? newApplication : null };
    }

    // Get job application
    getJobApplication(jobId, freelancerId) {
        if (!jobId || !freelancerId) return null;
        
        const applications = this.safeGet('appliedJobs', []);
        return applications.find(app => app.jobId === jobId && app.freelancerId === freelancerId) || null;
    }

    // Validate application data
    validateApplicationData(applicationData) {
        const rules = {
            jobId: { required: true, label: 'Job ID' },
            freelancerId: { required: true, label: 'Freelancer ID' },
            jobTitle: { required: true, minLength: 5, maxLength: 200, label: 'Job Title' },
            freelancerName: { required: true, minLength: 2, maxLength: 100, label: 'Freelancer Name' }
        };

        return ErrorHandler.validateFormData(applicationData, rules);
    }

    // Update job application status
    updateApplicationStatus(applicationId, status, updatedBy = null) {
        if (!applicationId || !status) return false;
        
        const validStatuses = ['pending', 'reviewed', 'accepted', 'rejected'];
        if (!validStatuses.includes(status)) {
            console.error('Invalid application status:', status);
            return false;
        }
        
        const applications = this.safeGet('appliedJobs', []);
        const applicationIndex = applications.findIndex(app => app.id === applicationId);
        
        if (applicationIndex === -1) return false;
        
        applications[applicationIndex] = {
            ...applications[applicationIndex],
            status,
            statusUpdatedAt: new Date().toISOString(),
            statusUpdatedBy: updatedBy
        };
        
        return this.safeSet('appliedJobs', applications);
    }

    // Get user settings
    getUserSettings(userId) {
        if (!userId) return {};
        
        return this.safeGet(`userSettings_${userId}`, {
            emailNotifications: 'all',
            profileVisibility: 'public',
            jobAlerts: true,
            marketingEmails: true
        });
    }

    // Update user settings
    updateUserSettings(userId, settings) {
        if (!userId || !settings) return false;
        
        const currentSettings = this.getUserSettings(userId);
        const updatedSettings = { ...currentSettings, ...settings };
        
        return this.safeSet(`userSettings_${userId}`, updatedSettings);
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Get storage usage statistics
    getStorageStats() {
        try {
            let totalSize = 0;
            const stats = {};
            
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    const size = localStorage[key].length;
                    totalSize += size;
                    stats[key] = size;
                }
            }
            
            return {
                totalSize,
                totalSizeKB: Math.round(totalSize / 1024),
                itemStats: stats,
                quotaUsed: totalSize / (5 * 1024 * 1024) * 100 // Assuming 5MB quota
            };
        } catch (error) {
            console.error('Error getting storage stats:', error);
            return null;
        }
    }

    // Export all data
    exportAllData() {
        try {
            const data = {
                users: this.safeGet('users', []),
                jobs: this.safeGet('jobs', []),
                appliedJobs: this.safeGet('appliedJobs', []),
                conversations: this.safeGet('conversations', []),
                settings: this.safeGet('settings', {}),
                exportDate: new Date().toISOString(),
                version: '1.0.0'
            };
            
            return data;
        } catch (error) {
            console.error('Error exporting data:', error);
            return null;
        }
    }

    // Import data with validation
    importData(data) {
        try {
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid data format');
            }
            
            // Validate required fields
            const requiredFields = ['users', 'jobs', 'appliedJobs'];
            for (const field of requiredFields) {
                if (!Array.isArray(data[field])) {
                    throw new Error(`Invalid ${field} data`);
                }
            }
            
            // Import data
            const success = this.safeSet('users', data.users) &&
                          this.safeSet('jobs', data.jobs) &&
                          this.safeSet('appliedJobs', data.appliedJobs);
            
            if (data.conversations) {
                this.safeSet('conversations', data.conversations);
            }
            
            if (data.settings) {
                this.safeSet('settings', data.settings);
            }
            
            return success;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Clear all data (for testing or reset)
    clearAllData() {
        try {
            const keys = ['users', 'jobs', 'appliedJobs', 'conversations', 'settings'];
            keys.forEach(key => localStorage.removeItem(key));
            
            // Remove user-specific settings
            for (let key in localStorage) {
                if (key.startsWith('userSettings_')) {
                    localStorage.removeItem(key);
                }
            }
            
            // Reinitialize with default data
            this.initializeStorage();
            
            return true;
        } catch (error) {
            console.error('Error clearing data:', error);
            return false;
        }
    }
}

// Initialize storage utils
const storageUtils = new StorageUtils();

// Make StorageUtils available globally
window.StorageUtils = StorageUtils;
window.storageUtils = storageUtils;