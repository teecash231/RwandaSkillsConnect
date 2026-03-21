/**
 * Dashboard Statistics Management System
 * Centralized stats calculation and real-time updates
 */

class DashboardStats {
    constructor() {
        this.stats = {};
        this.listeners = [];
        this.init();
    }

    init() {
        this.calculateStats();
        this.setupEventListeners();
        this.startAutoRefresh();
    }

    setupEventListeners() {
        // Listen for data changes
        document.addEventListener('dataUpdated', () => {
            this.refresh();
        });

        // Listen for storage changes
        window.addEventListener('storage', (e) => {
            if (['users', 'jobs', 'appliedJobs'].includes(e.key)) {
                this.refresh();
            }
        });
    }

    startAutoRefresh() {
        // Refresh stats every 30 seconds
        setInterval(() => {
            this.refresh();
        }, 30000);
    }

    calculateStats() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        const applications = JSON.parse(localStorage.getItem('appliedJobs') || '[]');

        // Basic counts
        this.stats = {
            totalUsers: users.length,
            totalFreelancers: users.filter(u => u.role === 'freelancer').length,
            totalClients: users.filter(u => u.role === 'client').length,
            totalAdmins: users.filter(u => u.role === 'admin').length,
            verifiedUsers: users.filter(u => u.verified).length,
            pendingVerifications: users.filter(u => !u.verified && u.role === 'freelancer').length,

            totalJobs: jobs.length,
            activeJobs: jobs.filter(j => j.status === 'active').length,
            pendingJobs: jobs.filter(j => j.status === 'pending_admin_approval').length,
            closedJobs: jobs.filter(j => j.status === 'closed').length,
            rejectedJobs: jobs.filter(j => j.status === 'rejected').length,
            approvedJobs: jobs.filter(j => j.status === 'active').length,

            totalApplications: applications.length,
            pendingApplications: applications.filter(a => a.status === 'pending').length,
            reviewedApplications: applications.filter(a => a.status === 'reviewed').length,

            // Time-based stats
            ...this.calculateTimeBasedStats(users, jobs, applications)
        };

        return this.stats;
    }

    calculateTimeBasedStats(users, jobs, applications) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        return {
            // Today's stats
            usersToday: users.filter(u => new Date(u.createdAt) >= today).length,
            jobsToday: jobs.filter(j => new Date(j.createdAt) >= today).length,
            applicationsToday: applications.filter(a => new Date(a.appliedAt) >= today).length,

            // This week's stats
            usersThisWeek: users.filter(u => new Date(u.createdAt) >= thisWeek).length,
            jobsThisWeek: jobs.filter(j => new Date(j.createdAt) >= thisWeek).length,
            applicationsThisWeek: applications.filter(a => new Date(a.appliedAt) >= thisWeek).length,

            // This month's stats
            usersThisMonth: users.filter(u => new Date(u.createdAt) >= thisMonth).length,
            jobsThisMonth: jobs.filter(j => new Date(j.createdAt) >= thisMonth).length,
            applicationsThisMonth: applications.filter(a => new Date(a.appliedAt) >= thisMonth).length,

            // Last month's stats for comparison
            usersLastMonth: users.filter(u => {
                const date = new Date(u.createdAt);
                return date >= lastMonth && date < thisMonth;
            }).length,
            jobsLastMonth: jobs.filter(j => {
                const date = new Date(j.createdAt);
                return date >= lastMonth && date < thisMonth;
            }).length
        };
    }

    refresh() {
        this.calculateStats();
        this.updateAllDisplays();
        this.notifyListeners();
    }

    updateAllDisplays() {
        // Update main dashboard stats
        this.updateElement('totalUsers', this.stats.totalUsers);
        this.updateElement('totalFreelancers', this.stats.totalFreelancers);
        this.updateElement('totalClients', this.stats.totalClients);
        this.updateElement('totalJobs', this.stats.totalJobs);
        this.updateElement('activeJobs', this.stats.activeJobs);
        this.updateElement('pendingApprovals', this.stats.pendingJobs);
        this.updateElement('approvedJobs', this.stats.approvedJobs);
        this.updateElement('monthlyUsers', this.stats.usersThisMonth);
        this.updateElement('monthlyJobs', this.stats.jobsThisMonth);

        // Update pending jobs count with notification badge
        this.updatePendingJobsDisplay();

        // Update growth indicators
        this.updateGrowthIndicators();

        // Update verification stats
        this.updateVerificationStats();

        // Update time-based displays
        this.updateTimeBasedDisplays();
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            // Animate number change
            this.animateNumber(element, parseInt(element.textContent) || 0, value || 0);
        }
    }

    animateNumber(element, from, to) {
        const duration = 500;
        const steps = 20;
        const stepValue = (to - from) / steps;
        const stepDuration = duration / steps;
        
        let current = from;
        let step = 0;
        
        const timer = setInterval(() => {
            step++;
            current += stepValue;
            
            if (step >= steps) {
                element.textContent = to;
                clearInterval(timer);
            } else {
                element.textContent = Math.round(current);
            }
        }, stepDuration);
    }

    updatePendingJobsDisplay() {
        const pendingCount = this.stats.pendingJobs;
        
        // Update navigation badge
        const pendingJobsCount = document.getElementById('pendingJobsCount');
        if (pendingJobsCount) {
            pendingJobsCount.textContent = pendingCount;
            pendingJobsCount.style.display = pendingCount > 0 ? 'inline' : 'none';
            
            if (pendingCount > 0) {
                pendingJobsCount.classList.add('notification-badge');
            } else {
                pendingJobsCount.classList.remove('notification-badge');
            }
        }

        // Update display badge
        const pendingJobsCountDisplay = document.getElementById('pendingJobsCountDisplay');
        if (pendingJobsCountDisplay) {
            pendingJobsCountDisplay.textContent = pendingCount > 0 ? `${pendingCount} Pending` : '0 Pending';
            
            // Update styling based on count
            if (pendingCount > 0) {
                pendingJobsCountDisplay.className = 'px-4 py-2 bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 text-sm font-semibold rounded-full shadow-sm notification-badge';
            } else {
                pendingJobsCountDisplay.className = 'px-4 py-2 bg-gradient-to-r from-green-100 to-green-200 text-green-800 text-sm font-semibold rounded-full shadow-sm';
            }
        }
    }

    updateGrowthIndicators() {
        // Calculate growth percentages
        const userGrowth = this.calculateGrowthPercentage(this.stats.usersThisMonth, this.stats.usersLastMonth);
        const jobGrowth = this.calculateGrowthPercentage(this.stats.jobsThisMonth, this.stats.jobsLastMonth);

        // Update user growth indicator
        const totalUsersChange = document.getElementById('totalUsersChange');
        if (totalUsersChange) {
            const weeklyUsers = this.stats.usersThisWeek;
            totalUsersChange.innerHTML = `<i class="fas fa-arrow-up mr-1"></i>+${weeklyUsers} this week`;
        }

        // Update other growth indicators
        this.updateGrowthElement('freelancersChange', 'Active talent', 'fa-user-cog');
        this.updateGrowthElement('clientsChange', 'Job posters', 'fa-user-tie');
        this.updateGrowthElement('jobsChange', 'All time', 'fa-briefcase');
        this.updateGrowthElement('approvalsChange', 'Needs review', 'fa-clock');
    }

    updateGrowthElement(elementId, label, icon) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `<i class="fas ${icon} mr-1"></i>${label}`;
        }
    }

    calculateGrowthPercentage(current, previous) {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
    }

    updateVerificationStats() {
        const verificationRate = this.stats.totalFreelancers > 0 ? 
            Math.round((this.stats.verifiedUsers / this.stats.totalFreelancers) * 100) : 0;

        // Update verification elements if they exist
        const verificationRateEl = document.getElementById('verificationRate');
        if (verificationRateEl) {
            verificationRateEl.textContent = `${verificationRate}%`;
        }

        const pendingVerificationsEl = document.getElementById('pendingVerifications');
        if (pendingVerificationsEl) {
            pendingVerificationsEl.textContent = this.stats.pendingVerifications;
        }
    }

    updateTimeBasedDisplays() {
        // Update system status
        const activeSessions = this.calculateActiveSessions();
        const activeSessionsEl = document.getElementById('activeSessions');
        if (activeSessionsEl) {
            activeSessionsEl.textContent = `${activeSessions} Active`;
        }

        // Update last updated time
        const lastUpdatedEl = document.getElementById('lastUpdated');
        if (lastUpdatedEl) {
            lastUpdatedEl.textContent = new Date().toLocaleTimeString();
        }
    }

    calculateActiveSessions() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        return users.filter(user => {
            if (!user.lastLogin) return false;
            const lastLogin = new Date(user.lastLogin);
            return lastLogin > oneDayAgo;
        }).length;
    }

    // Listener management
    addListener(callback) {
        this.listeners.push(callback);
    }

    removeListener(callback) {
        const index = this.listeners.indexOf(callback);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }

    notifyListeners() {
        this.listeners.forEach(callback => {
            try {
                callback(this.stats);
            } catch (error) {
                console.error('Error in stats listener:', error);
            }
        });
    }

    // Public API methods
    getStats() {
        return { ...this.stats };
    }

    getStatValue(key) {
        return this.stats[key] || 0;
    }

    // Category-specific stats
    getJobsByCategory() {
        const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        const categories = {};
        
        jobs.forEach(job => {
            const category = job.category || 'Uncategorized';
            categories[category] = (categories[category] || 0) + 1;
        });
        
        return categories;
    }

    getUsersByLocation() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const locations = {};
        
        users.forEach(user => {
            const location = user.location || 'Not specified';
            locations[location] = (locations[location] || 0) + 1;
        });
        
        return locations;
    }

    getApplicationStats() {
        const applications = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
        const stats = {
            total: applications.length,
            pending: applications.filter(a => a.status === 'pending').length,
            reviewed: applications.filter(a => a.status === 'reviewed').length,
            shortlisted: applications.filter(a => a.status === 'shortlisted').length,
            rejected: applications.filter(a => a.status === 'rejected').length
        };
        
        return stats;
    }

    // Export stats for reporting
    exportStats() {
        return {
            timestamp: new Date().toISOString(),
            stats: this.getStats(),
            categoryBreakdown: this.getJobsByCategory(),
            locationBreakdown: this.getUsersByLocation(),
            applicationStats: this.getApplicationStats()
        };
    }
}

// Create global instance
window.dashboardStats = new DashboardStats();

// Global update function for backward compatibility
window.updateDashboardStats = function() {
    if (window.dashboardStats) {
        window.dashboardStats.refresh();
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardStats;
}

console.log('📊 Dashboard Stats System Loaded');