/**
 * Data Cleanup and Management System
 * Comprehensive data management for admin settings
 */

class DataCleanupManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupCleanupFunctions();
    }

    setupCleanupFunctions() {
        // Make functions globally available
        window.clearProjectData = () => this.clearProjectData();
        window.setupSampleData = () => this.setupSampleData();
        window.generateAnalyticsData = () => this.generateAnalyticsData();
    }

    /**
     * Clear all project data
     */
    clearProjectData() {
        if (!confirm('⚠️ CLEAR ALL DATA\n\nThis will permanently delete:\n• All users (except current admin)\n• All jobs and applications\n• All conversations and notifications\n• All platform data\n\nThis action CANNOT be undone!\n\nContinue?')) {
            return false;
        }

        const doubleConfirm = prompt('Type "CLEAR" to confirm this action:');
        if (doubleConfirm !== 'CLEAR') {
            this.showNotification('Data clearing cancelled', 'warning');
            return false;
        }

        try {
            // Keep current admin user
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const adminUsers = users.filter(u => u.role === 'admin');
            
            // Clear all data
            localStorage.setItem('users', JSON.stringify(adminUsers));
            localStorage.setItem('jobs', '[]');
            localStorage.setItem('appliedJobs', '[]');
            localStorage.setItem('conversations', '[]');
            localStorage.setItem('notifications', '[]');
            localStorage.setItem('adminNotifications', '[]');
            localStorage.setItem('savedJobs', '[]');
            
            // Clear cached data
            this.clearCachedData();
            
            this.showNotification('All project data cleared successfully!', 'success');
            
            // Refresh all components
            setTimeout(() => {
                if (window.refreshAllDashboardComponents) {
                    window.refreshAllDashboardComponents();
                }
                window.location.reload();
            }, 1500);
            
            return true;
            
        } catch (error) {
            console.error('Error clearing data:', error);
            this.showNotification('Error clearing data: ' + error.message, 'error');
            return false;
        }
    }

    /**
     * Setup sample data
     */
    setupSampleData() {
        if (!confirm('🚀 SETUP SAMPLE DATA\n\nThis will:\n• Clear existing data (except admin)\n• Generate realistic sample users\n• Create sample jobs and applications\n• Add test notifications\n\nContinue?')) {
            return false;
        }

        try {
            // Use enhanced sample data generator if available
            if (window.enhancedSampleDataGenerator) {
                const result = window.enhancedSampleDataGenerator.generateSampleData();
                
                if (result.success) {
                    this.showNotification(
                        `✅ Sample data generated!\n` +
                        `📊 ${result.stats.users} users\n` +
                        `💼 ${result.stats.jobs} jobs\n` +
                        `📝 ${result.stats.applications} applications`,
                        'success'
                    );
                    
                    // Refresh all components
                    setTimeout(() => {
                        if (window.refreshAllDashboardComponents) {
                            window.refreshAllDashboardComponents();
                        }
                    }, 1000);
                    
                    return true;
                } else {
                    this.showNotification('Failed to generate sample data: ' + result.message, 'error');
                    return false;
                }
            } else {
                // Fallback to basic sample data
                this.generateBasicSampleData();
                return true;
            }
            
        } catch (error) {
            console.error('Error setting up sample data:', error);
            this.showNotification('Error setting up sample data: ' + error.message, 'error');
            return false;
        }
    }

    /**
     * Generate analytics data
     */
    generateAnalyticsData() {
        return this.setupSampleData(); // Same as setup sample data
    }

    /**
     * Generate basic sample data (fallback)
     */
    generateBasicSampleData() {
        // Keep existing admin users
        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const adminUsers = existingUsers.filter(u => u.role === 'admin');
        
        // Generate basic users
        const sampleUsers = [
            {
                id: 'user_sample_1',
                fullName: 'Jean Uwimana',
                email: 'jean.uwimana@example.com',
                phone: '+250788123456',
                role: 'freelancer',
                password: 'password123',
                verified: true,
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                location: 'Kigali',
                professionalTitle: 'Full Stack Developer',
                skills: 'JavaScript, React, Node.js, PHP',
                experienceLevel: 'Expert',
                hourlyRate: 25
            },
            {
                id: 'user_sample_2',
                fullName: 'Marie Mukamana',
                email: 'marie.mukamana@example.com',
                phone: '+250788234567',
                role: 'client',
                password: 'password123',
                verified: true,
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                location: 'Kigali',
                companyName: 'Rwanda Tech Solutions',
                industry: 'Technology'
            },
            {
                id: 'user_sample_3',
                fullName: 'Pierre Niyonzima',
                email: 'pierre.niyonzima@example.com',
                phone: '+250788345678',
                role: 'freelancer',
                password: 'password123',
                verified: false,
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                location: 'Butare',
                professionalTitle: 'Graphic Designer',
                skills: 'Photoshop, Illustrator, Figma',
                experienceLevel: 'Intermediate',
                hourlyRate: 15
            }
        ];
        
        // Generate basic jobs
        const sampleJobs = [
            {
                id: 'job_sample_1',
                title: 'Build E-commerce Website',
                description: 'We need a modern e-commerce website with payment integration and admin dashboard.',
                category: 'web-development',
                skills: 'HTML, CSS, JavaScript, PHP, MySQL',
                clientId: 'user_sample_2',
                clientName: 'Marie Mukamana',
                location: 'Remote',
                projectType: 'fixed',
                salary: 500000,
                status: 'pending_admin_approval',
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'job_sample_2',
                title: 'Design Company Logo',
                description: 'Looking for a creative designer to create our company logo and branding materials.',
                category: 'graphic-design',
                skills: 'Logo Design, Branding, Illustrator',
                clientId: 'user_sample_2',
                clientName: 'Marie Mukamana',
                location: 'Kigali',
                projectType: 'fixed',
                salary: 150000,
                status: 'active',
                adminApproved: true,
                approvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
        
        // Generate basic applications
        const sampleApplications = [
            {
                id: 'app_sample_1',
                jobId: 'job_sample_2',
                jobTitle: 'Design Company Logo',
                freelancerId: 'user_sample_3',
                freelancerName: 'Pierre Niyonzima',
                clientId: 'user_sample_2',
                proposedRate: 150000,
                coverLetter: 'I am excited to work on your logo design project. I have experience in creating professional logos for various companies.',
                appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'pending'
            }
        ];
        
        // Save data
        const allUsers = [...adminUsers, ...sampleUsers];
        localStorage.setItem('users', JSON.stringify(allUsers));
        localStorage.setItem('jobs', JSON.stringify(sampleJobs));
        localStorage.setItem('appliedJobs', JSON.stringify(sampleApplications));
        
        // Generate notifications
        const notifications = [
            {
                id: 'notif_sample_1',
                type: 'warning',
                title: 'Pending Job Approval',
                message: '1 job waiting for approval',
                createdAt: new Date().toISOString(),
                read: false
            }
        ];
        localStorage.setItem('adminNotifications', JSON.stringify(notifications));
        
        this.showNotification('Basic sample data generated successfully!', 'success');
        
        // Refresh components
        setTimeout(() => {
            if (window.refreshAllDashboardComponents) {
                window.refreshAllDashboardComponents();
            }
        }, 1000);
    }

    /**
     * Clear cached data
     */
    clearCachedData() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('user_') || 
                key.startsWith('job_') || 
                key.startsWith('cache_') ||
                key.startsWith('temp_') ||
                key.startsWith('session_')) {
                localStorage.removeItem(key);
            }
        });
    }

    /**
     * Export platform data
     */
    exportPlatformData() {
        try {
            const data = {
                users: JSON.parse(localStorage.getItem('users') || '[]'),
                jobs: JSON.parse(localStorage.getItem('jobs') || '[]'),
                appliedJobs: JSON.parse(localStorage.getItem('appliedJobs') || '[]'),
                conversations: JSON.parse(localStorage.getItem('conversations') || '[]'),
                notifications: JSON.parse(localStorage.getItem('notifications') || '[]'),
                adminNotifications: JSON.parse(localStorage.getItem('adminNotifications') || '[]'),
                settings: JSON.parse(localStorage.getItem('adminSettings') || '{}'),
                exportedAt: new Date().toISOString(),
                version: '1.0'
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `rwanda-skillsconnect-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Platform data exported successfully!', 'success');
            return true;
            
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showNotification('Error exporting data: ' + error.message, 'error');
            return false;
        }
    }

    /**
     * Import platform data
     */
    importPlatformData(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('No file provided'));
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    // Validate data structure
                    if (!data.users || !data.jobs) {
                        throw new Error('Invalid data format');
                    }
                    
                    // Import data
                    localStorage.setItem('users', JSON.stringify(data.users));
                    localStorage.setItem('jobs', JSON.stringify(data.jobs));
                    localStorage.setItem('appliedJobs', JSON.stringify(data.appliedJobs || []));
                    localStorage.setItem('conversations', JSON.stringify(data.conversations || []));
                    localStorage.setItem('notifications', JSON.stringify(data.notifications || []));
                    localStorage.setItem('adminNotifications', JSON.stringify(data.adminNotifications || []));
                    
                    if (data.settings) {
                        localStorage.setItem('adminSettings', JSON.stringify(data.settings));
                    }
                    
                    this.showNotification('Platform data imported successfully!', 'success');
                    
                    // Refresh components
                    setTimeout(() => {
                        if (window.refreshAllDashboardComponents) {
                            window.refreshAllDashboardComponents();
                        }
                        window.location.reload();
                    }, 1500);
                    
                    resolve(data);
                    
                } catch (error) {
                    this.showNotification('Error importing data: ' + error.message, 'error');
                    reject(error);
                }
            };
            
            reader.onerror = () => {
                const error = new Error('Error reading file');
                this.showNotification('Error reading file', 'error');
                reject(error);
            };
            
            reader.readAsText(file);
        });
    }

    /**
     * Get data statistics
     */
    getDataStatistics() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        const applications = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
        
        return {
            users: {
                total: users.length,
                freelancers: users.filter(u => u.role === 'freelancer').length,
                clients: users.filter(u => u.role === 'client').length,
                admins: users.filter(u => u.role === 'admin').length,
                verified: users.filter(u => u.verified).length
            },
            jobs: {
                total: jobs.length,
                active: jobs.filter(j => j.status === 'active').length,
                pending: jobs.filter(j => j.status === 'pending_admin_approval').length,
                closed: jobs.filter(j => j.status === 'closed').length,
                rejected: jobs.filter(j => j.status === 'rejected').length
            },
            applications: {
                total: applications.length,
                pending: applications.filter(a => a.status === 'pending').length,
                reviewed: applications.filter(a => a.status === 'reviewed').length
            },
            storage: {
                used: this.calculateStorageUsage(),
                keys: Object.keys(localStorage).length
            }
        };
    }

    /**
     * Calculate storage usage
     */
    calculateStorageUsage() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return Math.round(total / 1024); // KB
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Use existing notification system if available
        if (window.showNotification) {
            window.showNotification(message, type);
            return;
        }

        // Fallback notification
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${this.getNotificationColor(type)}`;
        notification.innerHTML = `
            <div class=\"flex items-start text-white\">
                <div class=\"flex-1\">
                    ${message.split('\\n').map(line => `<div>${line}</div>`).join('')}
                </div>
                <button onclick=\"this.parentElement.parentElement.remove()\" class=\"ml-2 text-white hover:text-gray-200\">
                    <i class=\"fas fa-times\"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    getNotificationColor(type) {
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };
        return colors[type] || 'bg-gray-500';
    }
}

// Create global instance
window.dataCleanupManager = new DataCleanupManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataCleanupManager;
}

console.log('🧹 Data Cleanup Manager Loaded');