/**
 * Analytics Interconnection System
 * Connects analytics with dashboard components for real-time updates
 */

class AnalyticsInterconnect {
    constructor() {
        this.analyticsData = {};
        this.updateInterval = null;
        this.init();
    }

    init() {
        this.setupAnalyticsIntegration();
        this.startRealTimeUpdates();
        this.setupEventListeners();
    }

    setupAnalyticsIntegration() {
        // Enhance admin analytics if available
        if (window.adminAnalytics) {
            this.enhanceAnalytics();
        } else {
            // Wait for analytics to load
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => {
                    if (window.adminAnalytics) {
                        this.enhanceAnalytics();
                    }
                }, 1000);
            });
        }
    }

    enhanceAnalytics() {
        const analytics = window.adminAnalytics;
        
        // Store original methods
        const originalLoadAnalytics = analytics.loadAnalytics.bind(analytics);
        
        // Enhance loadAnalytics method
        analytics.loadAnalytics = () => {
            originalLoadAnalytics();
            this.updateAnalyticsData();
        };
        
        // Add real-time update capability
        analytics.enableRealTimeUpdates = () => {
            this.startRealTimeUpdates();
        };
        
        analytics.disableRealTimeUpdates = () => {
            this.stopRealTimeUpdates();
        };
    }

    startRealTimeUpdates() {
        // Update analytics every 30 seconds
        this.updateInterval = setInterval(() => {
            this.updateAnalyticsData();
            this.refreshAnalyticsDisplays();
        }, 30000);
    }

    stopRealTimeUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    setupEventListeners() {
        // Listen for data changes
        if (window.statsEventBus) {
            window.statsEventBus.on('usersDataChanged', () => {
                this.updateAnalyticsData();
                this.refreshAnalyticsDisplays();
            });
            
            window.statsEventBus.on('jobsDataChanged', () => {
                this.updateAnalyticsData();
                this.refreshAnalyticsDisplays();
            });
            
            window.statsEventBus.on('applicationsDataChanged', () => {
                this.updateAnalyticsData();
                this.refreshAnalyticsDisplays();
            });
        }
    }

    updateAnalyticsData() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        const applications = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
        
        this.analyticsData = {
            users: this.analyzeUsers(users),
            jobs: this.analyzeJobs(jobs),
            applications: this.analyzeApplications(applications),
            performance: this.calculatePerformanceMetrics(users, jobs, applications),
            trends: this.calculateTrends(users, jobs, applications),
            lastUpdated: new Date().toISOString()
        };
    }

    analyzeUsers(users) {
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        
        return {
            total: users.length,
            byRole: this.groupBy(users, 'role'),
            byLocation: this.groupBy(users, 'location'),
            verified: users.filter(u => u.verified).length,
            thisMonth: users.filter(u => new Date(u.createdAt) >= thisMonth).length,
            lastMonth: users.filter(u => {
                const date = new Date(u.createdAt);
                return date >= lastMonth && date < thisMonth;
            }).length,
            growthRate: this.calculateGrowthRate(
                users.filter(u => new Date(u.createdAt) >= thisMonth).length,
                users.filter(u => {
                    const date = new Date(u.createdAt);
                    return date >= lastMonth && date < thisMonth;
                }).length
            )
        };
    }

    analyzeJobs(jobs) {
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        
        return {
            total: jobs.length,
            byStatus: this.groupBy(jobs, 'status'),
            byCategory: this.groupBy(jobs, 'category'),
            byLocation: this.groupBy(jobs, 'location'),
            thisMonth: jobs.filter(j => new Date(j.createdAt) >= thisMonth).length,
            lastMonth: jobs.filter(j => {
                const date = new Date(j.createdAt);
                return date >= lastMonth && date < thisMonth;
            }).length,
            averageBudget: this.calculateAverageBudget(jobs),
            growthRate: this.calculateGrowthRate(
                jobs.filter(j => new Date(j.createdAt) >= thisMonth).length,
                jobs.filter(j => {
                    const date = new Date(j.createdAt);
                    return date >= lastMonth && date < thisMonth;
                }).length
            )
        };
    }

    analyzeApplications(applications) {
        return {
            total: applications.length,
            byStatus: this.groupBy(applications, 'status'),
            averagePerJob: applications.length > 0 ? 
                applications.length / new Set(applications.map(a => a.jobId)).size : 0,
            successRate: this.calculateApplicationSuccessRate(applications)
        };
    }

    calculatePerformanceMetrics(users, jobs, applications) {
        const freelancers = users.filter(u => u.role === 'freelancer');
        const clients = users.filter(u => u.role === 'client');
        const activeJobs = jobs.filter(j => j.status === 'active');
        
        return {
            userEngagement: {
                freelancerToJobRatio: activeJobs.length > 0 ? freelancers.length / activeJobs.length : 0,
                applicationRate: jobs.length > 0 ? applications.length / jobs.length : 0,
                verificationRate: freelancers.length > 0 ? 
                    freelancers.filter(f => f.verified).length / freelancers.length : 0
            },
            platformHealth: {
                jobApprovalRate: this.calculateJobApprovalRate(jobs),
                averageTimeToApproval: this.calculateAverageApprovalTime(jobs),
                clientRetentionRate: this.calculateClientRetentionRate(clients, jobs)
            }
        };
    }

    calculateTrends(users, jobs, applications) {
        const periods = this.generateTimePeriods(30); // Last 30 days
        
        return {
            userRegistrations: this.calculateTrendData(users, periods, 'createdAt'),
            jobPostings: this.calculateTrendData(jobs, periods, 'createdAt'),
            applications: this.calculateTrendData(applications, periods, 'appliedAt')
        };
    }

    refreshAnalyticsDisplays() {
        if (window.adminAnalytics) {
            // Refresh performance metrics
            this.updatePerformanceMetricsDisplay();
            
            // Refresh charts
            this.updateChartsDisplay();
            
            // Update trend analysis
            this.updateTrendAnalysisDisplay();
        }
    }

    updatePerformanceMetricsDisplay() {
        const container = document.getElementById('performanceMetrics');
        if (!container || !this.analyticsData.performance) return;
        
        const metrics = this.analyticsData.performance;
        
        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="text-center p-4 bg-blue-50 rounded-lg">
                        <div class="text-2xl font-bold text-blue-600">${metrics.userEngagement.freelancerToJobRatio.toFixed(1)}</div>
                        <div class="text-sm text-gray-600">Freelancer/Job Ratio</div>
                    </div>
                    <div class="text-center p-4 bg-green-50 rounded-lg">
                        <div class="text-2xl font-bold text-green-600">${metrics.userEngagement.applicationRate.toFixed(1)}</div>
                        <div class="text-sm text-gray-600">Avg Applications/Job</div>
                    </div>
                    <div class="text-center p-4 bg-purple-50 rounded-lg">
                        <div class="text-2xl font-bold text-purple-600">${(metrics.userEngagement.verificationRate * 100).toFixed(1)}%</div>
                        <div class="text-sm text-gray-600">Verification Rate</div>
                    </div>
                    <div class="text-center p-4 bg-orange-50 rounded-lg">
                        <div class="text-2xl font-bold text-orange-600">${(metrics.platformHealth.jobApprovalRate * 100).toFixed(1)}%</div>
                        <div class="text-sm text-gray-600">Job Approval Rate</div>
                    </div>
                </div>
            </div>
        `;
    }

    updateChartsDisplay() {
        // Update user role chart
        this.updateUserRoleChart();
        
        // Update job category chart
        this.updateJobCategoryChart();
        
        // Update job status chart
        this.updateJobStatusChart();
    }

    updateUserRoleChart() {
        const container = document.getElementById('userRoleChart');
        if (!container || !this.analyticsData.users) return;
        
        const roleData = this.analyticsData.users.byRole;
        const total = this.analyticsData.users.total;
        
        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">User Distribution by Role</h3>
                <div class="space-y-4">
                    ${Object.entries(roleData).map(([role, count]) => {
                        const percentage = total > 0 ? (count / total * 100).toFixed(1) : 0;
                        const color = this.getRoleColor(role);
                        return `
                            <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                    <div class="w-4 h-4 rounded ${color} mr-3"></div>
                                    <span class="capitalize font-medium">${role}</span>
                                </div>
                                <div class="text-right">
                                    <div class="font-semibold">${count}</div>
                                    <div class="text-sm text-gray-500">${percentage}%</div>
                                </div>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="${color} h-2 rounded-full" style="width: ${percentage}%"></div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    updateJobCategoryChart() {
        const container = document.getElementById('jobCategoryChart');
        if (!container || !this.analyticsData.jobs) return;
        
        const categoryData = this.analyticsData.jobs.byCategory;
        const total = this.analyticsData.jobs.total;
        
        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Jobs by Category</h3>
                <div class="space-y-3">
                    ${Object.entries(categoryData).map(([category, count], index) => {
                        const percentage = total > 0 ? (count / total * 100).toFixed(1) : 0;
                        const color = this.getCategoryColor(index);
                        return `
                            <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                    <div class="w-3 h-3 rounded-full ${color} mr-3"></div>
                                    <span class="text-sm font-medium">${category || 'Uncategorized'}</span>
                                </div>
                                <div class="text-right">
                                    <span class="font-semibold">${count}</span>
                                    <span class="text-sm text-gray-500 ml-2">${percentage}%</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    updateJobStatusChart() {
        const container = document.getElementById('jobStatusChart');
        if (!container || !this.analyticsData.jobs) return;
        
        const statusData = this.analyticsData.jobs.byStatus;
        const total = this.analyticsData.jobs.total;
        
        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Job Status Distribution</h3>
                <div class="space-y-3">
                    ${Object.entries(statusData).map(([status, count]) => {
                        const percentage = total > 0 ? (count / total * 100).toFixed(1) : 0;
                        const color = this.getStatusColor(status);
                        return `
                            <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                    <div class="w-3 h-3 rounded-full ${color} mr-3"></div>
                                    <span class="text-sm font-medium capitalize">${status.replace('_', ' ')}</span>
                                </div>
                                <div class="text-right">
                                    <span class="font-semibold">${count}</span>
                                    <span class="text-sm text-gray-500 ml-2">${percentage}%</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    updateTrendAnalysisDisplay() {
        const container = document.getElementById('trendAnalysis');
        if (!container || !this.analyticsData.trends) return;
        
        const trends = this.analyticsData.trends;
        const userGrowth = this.analyticsData.users.growthRate;
        const jobGrowth = this.analyticsData.jobs.growthRate;
        
        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Trend Analysis</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="text-center p-4 bg-blue-50 rounded-lg">
                        <div class="text-2xl font-bold text-blue-600">${this.analyticsData.users.thisMonth}</div>
                        <div class="text-sm text-gray-600">New Users This Month</div>
                        <div class="text-xs ${userGrowth >= 0 ? 'text-green-600' : 'text-red-600'} mt-1">
                            ${userGrowth >= 0 ? '+' : ''}${userGrowth.toFixed(1)}% vs last month
                        </div>
                    </div>
                    <div class="text-center p-4 bg-green-50 rounded-lg">
                        <div class="text-2xl font-bold text-green-600">${this.analyticsData.jobs.thisMonth}</div>
                        <div class="text-sm text-gray-600">New Jobs This Month</div>
                        <div class="text-xs ${jobGrowth >= 0 ? 'text-green-600' : 'text-red-600'} mt-1">
                            ${jobGrowth >= 0 ? '+' : ''}${jobGrowth.toFixed(1)}% vs last month
                        </div>
                    </div>
                    <div class="text-center p-4 bg-purple-50 rounded-lg">
                        <div class="text-2xl font-bold text-purple-600">${this.analyticsData.applications.total}</div>
                        <div class="text-sm text-gray-600">Total Applications</div>
                        <div class="text-xs text-green-600 mt-1">
                            ${this.analyticsData.applications.averagePerJob.toFixed(1)} avg per job
                        </div>
                    </div>
                    <div class="text-center p-4 bg-orange-50 rounded-lg">
                        <div class="text-2xl font-bold text-orange-600">${(this.analyticsData.applications.successRate * 100).toFixed(1)}%</div>
                        <div class="text-sm text-gray-600">Application Success Rate</div>
                        <div class="text-xs text-green-600 mt-1">Platform engagement</div>
                    </div>
                </div>
            </div>
        `;
    }

    // Helper methods
    groupBy(array, key) {
        return array.reduce((groups, item) => {
            const value = item[key] || 'Unknown';
            groups[value] = (groups[value] || 0) + 1;
            return groups;
        }, {});
    }

    calculateGrowthRate(current, previous) {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    }

    calculateAverageBudget(jobs) {
        const jobsWithBudget = jobs.filter(j => j.salary || j.maxBudget);
        if (jobsWithBudget.length === 0) return 0;
        
        const total = jobsWithBudget.reduce((sum, job) => {
            return sum + (job.salary || job.maxBudget || 0);
        }, 0);
        
        return total / jobsWithBudget.length;
    }

    calculateApplicationSuccessRate(applications) {
        if (applications.length === 0) return 0;
        const successful = applications.filter(a => 
            a.status === 'accepted' || a.status === 'hired' || a.status === 'shortlisted'
        ).length;
        return successful / applications.length;
    }

    calculateJobApprovalRate(jobs) {
        if (jobs.length === 0) return 0;
        const approved = jobs.filter(j => j.status === 'active').length;
        return approved / jobs.length;
    }

    calculateAverageApprovalTime(jobs) {
        const approvedJobs = jobs.filter(j => j.approvedAt && j.createdAt);
        if (approvedJobs.length === 0) return 0;
        
        const totalTime = approvedJobs.reduce((sum, job) => {
            const created = new Date(job.createdAt);
            const approved = new Date(job.approvedAt);
            return sum + (approved - created);
        }, 0);
        
        return totalTime / approvedJobs.length / (1000 * 60 * 60); // Hours
    }

    calculateClientRetentionRate(clients, jobs) {
        if (clients.length === 0) return 0;
        const activeClients = new Set(jobs.map(j => j.clientId));
        return activeClients.size / clients.length;
    }

    generateTimePeriods(days) {
        const periods = [];
        const now = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            periods.push({
                date: date.toISOString().split('T')[0],
                start: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
                end: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
            });
        }
        
        return periods;
    }

    calculateTrendData(items, periods, dateField) {
        return periods.map(period => {
            const count = items.filter(item => {
                const itemDate = new Date(item[dateField]);
                return itemDate >= period.start && itemDate < period.end;
            }).length;
            
            return {
                date: period.date,
                count: count
            };
        });
    }

    getRoleColor(role) {
        const colors = {
            'admin': 'bg-red-500',
            'client': 'bg-blue-500',
            'freelancer': 'bg-green-500'
        };
        return colors[role] || 'bg-gray-500';
    }

    getCategoryColor(index) {
        const colors = [
            'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500',
            'bg-teal-500', 'bg-pink-500', 'bg-indigo-500', 'bg-yellow-500',
            'bg-red-500', 'bg-gray-500'
        ];
        return colors[index % colors.length];
    }

    getStatusColor(status) {
        const colors = {
            'active': 'bg-green-500',
            'completed': 'bg-blue-500',
            'closed': 'bg-gray-500',
            'pending': 'bg-yellow-500',
            'pending_admin_approval': 'bg-orange-500',
            'rejected': 'bg-red-500'
        };
        return colors[status] || 'bg-gray-500';
    }

    // Public API
    getAnalyticsData() {
        return { ...this.analyticsData };
    }

    forceUpdate() {
        this.updateAnalyticsData();
        this.refreshAnalyticsDisplays();
    }
}

// Create global instance
window.analyticsInterconnect = new AnalyticsInterconnect();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsInterconnect;
}

console.log('📈 Analytics Interconnection System Loaded');