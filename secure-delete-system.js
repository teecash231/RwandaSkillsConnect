/**
 * Secure Delete System for User Management
 * Comprehensive user deletion with data cleanup and audit trails
 */

class SecureDeleteSystem {
    constructor() {
        this.auditLog = JSON.parse(localStorage.getItem('deleteAuditLog') || '[]');
    }

    /**
     * Delete single user permanently
     */
    deleteSingleUser(userId) {
        try {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = users.findIndex(u => u.id === userId);
            
            if (userIndex === -1) {
                return { success: false, error: 'User not found' };
            }
            
            const user = users[userIndex];
            
            // Remove user from array
            users.splice(userIndex, 1);
            localStorage.setItem('users', JSON.stringify(users));
            
            // Clean up related data
            this.cleanupUserData(userId);
            
            // Log the deletion
            this.logDeletion('SINGLE_USER_DELETE', {
                userId: userId,
                userName: user.fullName,
                userEmail: user.email,
                userRole: user.role
            });
            
            return {
                success: true,
                message: `User "${user.fullName}" deleted permanently`,
                deletedUser: user
            };
            
        } catch (error) {
            console.error('Error deleting user:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Delete users by role
     */
    deleteUsersByRole(role) {
        try {
            let users = JSON.parse(localStorage.getItem('users') || '[]');
            const originalCount = users.length;
            
            let usersToDelete = [];
            if (role === 'all') {
                usersToDelete = [...users];
                users = [];
            } else {
                usersToDelete = users.filter(u => u.role === role);
                users = users.filter(u => u.role !== role);
            }
            
            if (usersToDelete.length === 0) {
                return { success: false, error: `No ${role} users found to delete` };
            }
            
            // Save updated users array
            localStorage.setItem('users', JSON.stringify(users));
            
            // Clean up related data for all deleted users
            const deletedIds = usersToDelete.map(u => u.id);
            this.cleanupMultipleUsersData(deletedIds);
            
            // Log the deletion
            this.logDeletion('BULK_DELETE_BY_ROLE', {
                role: role,
                deletedCount: usersToDelete.length,
                deletedUsers: usersToDelete.map(u => ({ id: u.id, name: u.fullName, email: u.email }))
            });
            
            return {
                success: true,
                message: `${usersToDelete.length} ${role} user(s) deleted permanently`,
                deletedCount: usersToDelete.length,
                deletedUsers: usersToDelete
            };
            
        } catch (error) {
            console.error('Error deleting users by role:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Delete all users but keep admin
     */
    deleteAllKeepAdmin() {
        try {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const adminUsers = users.filter(u => u.role === 'admin');
            const nonAdminUsers = users.filter(u => u.role !== 'admin');
            
            if (nonAdminUsers.length === 0) {
                return { success: false, error: 'No non-admin users to delete' };
            }
            
            if (adminUsers.length === 0) {
                return { success: false, error: 'No admin users found to preserve' };
            }
            
            // Keep only admin users
            localStorage.setItem('users', JSON.stringify(adminUsers));
            
            // Clean up related data
            const deletedIds = nonAdminUsers.map(u => u.id);
            this.cleanupMultipleUsersData(deletedIds);
            
            // Log the deletion
            this.logDeletion('DELETE_ALL_KEEP_ADMIN', {
                deletedCount: nonAdminUsers.length,
                preservedAdmins: adminUsers.length,
                deletedUsers: nonAdminUsers.map(u => ({ id: u.id, name: u.fullName, email: u.email, role: u.role }))
            });
            
            return {
                success: true,
                message: `${nonAdminUsers.length} users deleted, ${adminUsers.length} admin(s) preserved`,
                deletedCount: nonAdminUsers.length,
                preservedCount: adminUsers.length
            };
            
        } catch (error) {
            console.error('Error in deleteAllKeepAdmin:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Reset to default admin only
     */
    resetToDefaultAdmin() {
        try {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const originalCount = users.length;
            
            // Create default admin
            const defaultAdmin = {
                id: 'admin_default_001',
                fullName: 'System Administrator',
                email: 'admin@skillsconnect.rw',
                password: 'admin123',
                role: 'admin',
                verified: true,
                createdAt: new Date().toISOString(),
                lastLogin: null,
                phone: '+250788123456',
                profileComplete: true
            };
            
            // Replace all users with just the default admin
            localStorage.setItem('users', JSON.stringify([defaultAdmin]));
            
            // Clean up all related data
            const deletedIds = users.map(u => u.id);
            this.cleanupMultipleUsersData(deletedIds);
            
            // Clear all other data
            this.clearAllPlatformData();
            
            // Log the reset
            this.logDeletion('SYSTEM_RESET_TO_DEFAULT', {
                originalUserCount: originalCount,
                deletedUsers: users.map(u => ({ id: u.id, name: u.fullName, email: u.email, role: u.role })),
                newDefaultAdmin: defaultAdmin.email
            });
            
            return {
                success: true,
                message: `System reset complete. ${originalCount} users deleted, default admin created`,
                deletedCount: originalCount,
                defaultAdmin: defaultAdmin
            };
            
        } catch (error) {
            console.error('Error in resetToDefaultAdmin:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Clean up data for a single user
     */
    cleanupUserData(userId) {
        try {
            // Remove user's jobs
            let jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
            const originalJobsCount = jobs.length;
            jobs = jobs.filter(job => job.clientId !== userId && job.freelancerId !== userId);
            localStorage.setItem('jobs', JSON.stringify(jobs));
            
            // Remove user's job applications
            let applications = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
            const originalAppsCount = applications.length;
            applications = applications.filter(app => app.freelancerId !== userId && app.clientId !== userId);
            localStorage.setItem('appliedJobs', JSON.stringify(applications));
            
            // Remove user's conversations
            let conversations = JSON.parse(localStorage.getItem('conversations') || '[]');
            conversations = conversations.filter(conv => 
                conv.participants && !conv.participants.includes(userId)
            );
            localStorage.setItem('conversations', JSON.stringify(conversations));
            
            // Remove user's saved jobs
            let savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
            savedJobs = savedJobs.filter(saved => saved.userId !== userId);
            localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
            
            // Remove user-specific data
            localStorage.removeItem(`user_${userId}_profile`);
            localStorage.removeItem(`user_${userId}_settings`);
            localStorage.removeItem(`user_${userId}_notifications`);
            
            console.log(`Cleaned up data for user ${userId}: ${originalJobsCount - jobs.length} jobs, ${originalAppsCount - applications.length} applications`);
            
        } catch (error) {
            console.error('Error cleaning up user data:', error);
        }
    }

    /**
     * Clean up data for multiple users
     */
    cleanupMultipleUsersData(userIds) {
        try {
            // Remove jobs posted by or assigned to deleted users
            let jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
            const originalJobsCount = jobs.length;
            jobs = jobs.filter(job => 
                !userIds.includes(job.clientId) && 
                !userIds.includes(job.freelancerId) &&
                !userIds.includes(job.assignedTo)
            );
            localStorage.setItem('jobs', JSON.stringify(jobs));
            
            // Remove job applications from deleted users
            let applications = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
            const originalAppsCount = applications.length;
            applications = applications.filter(app => 
                !userIds.includes(app.freelancerId) && 
                !userIds.includes(app.clientId)
            );
            localStorage.setItem('appliedJobs', JSON.stringify(applications));
            
            // Remove conversations involving deleted users
            let conversations = JSON.parse(localStorage.getItem('conversations') || '[]');
            conversations = conversations.filter(conv => {
                if (!conv.participants) return true;
                return !conv.participants.some(participantId => userIds.includes(participantId));
            });
            localStorage.setItem('conversations', JSON.stringify(conversations));
            
            // Remove saved jobs by deleted users
            let savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
            savedJobs = savedJobs.filter(saved => !userIds.includes(saved.userId));
            localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
            
            // Remove user-specific data
            userIds.forEach(userId => {
                localStorage.removeItem(`user_${userId}_profile`);
                localStorage.removeItem(`user_${userId}_settings`);
                localStorage.removeItem(`user_${userId}_notifications`);
            });
            
            console.log(`Bulk cleanup completed: ${originalJobsCount - jobs.length} jobs, ${originalAppsCount - applications.length} applications removed`);
            
        } catch (error) {
            console.error('Error in bulk cleanup:', error);
        }
    }

    /**
     * Clear all platform data (for system reset)
     */
    clearAllPlatformData() {
        try {
            // Clear all main data arrays
            localStorage.setItem('jobs', '[]');
            localStorage.setItem('appliedJobs', '[]');
            localStorage.setItem('conversations', '[]');
            localStorage.setItem('savedJobs', '[]');
            localStorage.setItem('notifications', '[]');
            localStorage.setItem('adminNotifications', '[]');
            
            // Clear any cached data
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('user_') || 
                    key.startsWith('job_') || 
                    key.startsWith('cache_') ||
                    key.startsWith('temp_')) {
                    localStorage.removeItem(key);
                }
            });
            
            console.log('All platform data cleared');
            
        } catch (error) {
            console.error('Error clearing platform data:', error);
        }
    }

    /**
     * Log deletion action for audit trail
     */
    logDeletion(action, details) {
        try {
            const logEntry = {
                id: 'log_' + Date.now(),
                action: action,
                timestamp: new Date().toISOString(),
                details: details,
                adminUser: this.getCurrentAdminUser()
            };
            
            this.auditLog.push(logEntry);
            
            // Keep only last 100 log entries
            if (this.auditLog.length > 100) {
                this.auditLog = this.auditLog.slice(-100);
            }
            
            localStorage.setItem('deleteAuditLog', JSON.stringify(this.auditLog));
            
            console.log('Deletion logged:', action, details);
            
        } catch (error) {
            console.error('Error logging deletion:', error);
        }
    }

    /**
     * Get current admin user for logging
     */
    getCurrentAdminUser() {
        try {
            const session = JSON.parse(localStorage.getItem('userSession') || '{}');
            return session.email || 'unknown_admin';
        } catch (error) {
            return 'system';
        }
    }

    /**
     * Get deletion audit log
     */
    getAuditLog() {
        return this.auditLog;
    }

    /**
     * Clear audit log
     */
    clearAuditLog() {
        this.auditLog = [];
        localStorage.removeItem('deleteAuditLog');
        return { success: true, message: 'Audit log cleared' };
    }

    /**
     * Get deletion statistics
     */
    getDeletionStats() {
        const stats = {
            totalDeletions: this.auditLog.length,
            singleUserDeletions: this.auditLog.filter(log => log.action === 'SINGLE_USER_DELETE').length,
            bulkDeletions: this.auditLog.filter(log => log.action === 'BULK_DELETE_BY_ROLE').length,
            systemResets: this.auditLog.filter(log => log.action === 'SYSTEM_RESET_TO_DEFAULT').length,
            lastDeletion: this.auditLog.length > 0 ? this.auditLog[this.auditLog.length - 1].timestamp : null
        };
        
        return stats;
    }
}

// Create global instance
window.secureDeleteSystem = new SecureDeleteSystem();

// Global functions for backward compatibility
window.secureDeleteUser = function(userId) {
    return window.secureDeleteSystem.deleteSingleUser(userId);
};

window.deleteSingleUserPermanent = function(userId) {
    return window.secureDeleteSystem.deleteSingleUser(userId);
};

window.secureDeleteUsersByRole = function(role) {
    return window.secureDeleteSystem.deleteUsersByRole(role);
};

window.deleteUsersByRolePermanent = function(role) {
    return window.secureDeleteSystem.deleteUsersByRole(role);
};

window.secureDeleteAllKeepAdmin = function() {
    return window.secureDeleteSystem.deleteAllKeepAdmin();
};

window.deleteAllUsersKeepAdminPermanent = function() {
    return window.secureDeleteSystem.deleteAllKeepAdmin();
};

window.secureResetToDefault = function() {
    return window.secureDeleteSystem.resetToDefaultAdmin();
};

window.resetToDefaultAdminPermanent = function() {
    return window.secureDeleteSystem.resetToDefaultAdmin();
};

// Enhanced delete user function for user management
window.enhancedDeleteUser = function(userId) {
    const result = window.secureDeleteSystem.deleteSingleUser(userId);
    
    if (result.success) {
        // Update all dashboard components
        if (typeof loadDashboardData === 'function') {
            loadDashboardData();
        }
        if (typeof loadUsersData === 'function') {
            loadUsersData();
        }
        if (window.userManagement) {
            window.userManagement.loadUsers();
            window.userManagement.renderUsers();
        }
        if (window.updateDashboardStats) {
            window.updateDashboardStats();
        }
    }
    
    return result;
};

console.log('🔒 Secure Delete System Loaded');