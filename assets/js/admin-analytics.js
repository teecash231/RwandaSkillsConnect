/**
 * Admin Analytics JavaScript
 * Comprehensive analytics and reporting system
 */

class AdminAnalytics {
    constructor() {
        this.dateFrom = null;
        this.dateTo = null;
        this.init();
    }

    init() {
        this.setupDateFilters();
        this.setupEventListeners();
        this.loadAnalytics();
    }

    setupDateFilters() {
        const today = new Date();
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        
        const dateFromInput = document.getElementById('analyticsDateFrom');
        const dateToInput = document.getElementById('analyticsDateTo');
        
        if (dateFromInput && dateToInput) {
            dateFromInput.value = lastMonth.toISOString().split('T')[0];
            dateToInput.value = today.toISOString().split('T')[0];
            
            this.dateFrom = lastMonth;
            this.dateTo = today;
        }
    }

    setupEventListeners() {
        const refreshBtn = document.getElementById('refreshAnalyticsBtn');
        const exportBtn = document.getElementById('exportReportBtn');
        const dateFromInput = document.getElementById('analyticsDateFrom');
        const dateToInput = document.getElementById('analyticsDateTo');
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshAnalytics());
        }
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportReport());
        }
        
        if (dateFromInput) {
            dateFromInput.addEventListener('change', (e) => {
                this.dateFrom = new Date(e.target.value);
                this.loadAnalytics();
            });
        }
        
        if (dateToInput) {
            dateToInput.addEventListener('change', (e) => {
                this.dateTo = new Date(e.target.value);
                this.loadAnalytics();
            });
        }
    }

    loadAnalytics() {
        this.renderRealTimeMetrics();
        this.renderPerformanceMetrics();
        this.renderRevenueStats();
        this.renderUserRoleChart();
        this.renderJobCategoryChart();
        this.renderVerificationChart();
        this.renderJobStatusChart();
        this.renderLocationChart();
        this.renderJobLocationChart();
        this.renderRevenueChart();
        this.renderTrendAnalysis();
        this.renderAdvancedCharts();
    }

    refreshAnalytics() {
        const refreshBtn = document.getElementById('refreshAnalyticsBtn');
        if (refreshBtn) {
            refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Refreshing...';
            refreshBtn.disabled = true;
        }
        
        setTimeout(() => {
            this.loadAnalytics();
            if (refreshBtn) {
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt mr-2"></i>Refresh';
                refreshBtn.disabled = false;
            }
        }, 1000);
    }

    getFilteredData() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        const applications = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
        
        const filteredUsers = users.filter(user => {
            const userDate = new Date(user.createdAt);
            return userDate >= this.dateFrom && userDate <= this.dateTo;
        });
        
        const filteredJobs = jobs.filter(job => {
            const jobDate = new Date(job.createdAt);
            return jobDate >= this.dateFrom && jobDate <= this.dateTo;
        });
        
        return { users, jobs, applications, filteredUsers, filteredJobs };
    }

    renderRealTimeMetrics() {
        const container = document.getElementById('realTimeMetrics');
        if (!container) return;
        
        const { users, jobs, applications } = this.getFilteredData();
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const todayUsers = users.filter(u => new Date(u.createdAt) >= today).length;
        const todayJobs = jobs.filter(j => new Date(j.createdAt) >= today).length;
        const todayApplications = applications.filter(a => new Date(a.appliedAt) >= today).length;
        const weeklyGrowth = users.filter(u => new Date(u.createdAt) >= thisWeek).length;
        
        container.innerHTML = `
            <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white mb-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-bold flex items-center">
                        <i class="fas fa-chart-line mr-3"></i>Real-Time Platform Metrics
                    </h3>
                    <div class="flex items-center space-x-2 text-blue-100">
                        <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span class="text-sm">Live Data</span>
                    </div>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="bg-white bg-opacity-20 rounded-lg p-4 text-center backdrop-blur-sm">
                        <div class="text-2xl font-bold">${todayUsers}</div>
                        <div class="text-sm text-blue-100">New Users Today</div>
                        <div class="text-xs text-green-300 mt-1">
                            <i class="fas fa-arrow-up mr-1"></i>+${((todayUsers / 24) * 100).toFixed(0)}% hourly
                        </div>
                    </div>
                    <div class="bg-white bg-opacity-20 rounded-lg p-4 text-center backdrop-blur-sm">
                        <div class="text-2xl font-bold">${todayJobs}</div>
                        <div class="text-sm text-blue-100">Jobs Posted Today</div>
                        <div class="text-xs text-green-300 mt-1">
                            <i class="fas fa-briefcase mr-1"></i>Active posting
                        </div>
                    </div>
                    <div class="bg-white bg-opacity-20 rounded-lg p-4 text-center backdrop-blur-sm">
                        <div class="text-2xl font-bold">${todayApplications}</div>
                        <div class="text-sm text-blue-100">Applications Today</div>
                        <div class="text-xs text-green-300 mt-1">
                            <i class="fas fa-paper-plane mr-1"></i>High activity
                        </div>
                    </div>
                    <div class="bg-white bg-opacity-20 rounded-lg p-4 text-center backdrop-blur-sm">
                        <div class="text-2xl font-bold">${weeklyGrowth}</div>
                        <div class="text-sm text-blue-100">Weekly Growth</div>
                        <div class="text-xs text-green-300 mt-1">
                            <i class="fas fa-chart-line mr-1"></i>+${((weeklyGrowth / 7) * 100).toFixed(0)}% daily avg
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderPerformanceMetrics() {
        const { users, jobs, applications } = this.getFilteredData();
        const container = document.getElementById('performanceMetrics');
        
        if (!container) return;
        
        const metrics = {
            totalUsers: users.length,
            activeJobs: jobs.filter(j => j.status === 'active').length,
            completedJobs: jobs.filter(j => j.status === 'completed').length,
            totalApplications: applications.length,
            verifiedFreelancers: users.filter(u => u.role === 'freelancer' && u.verified).length,
            pendingVerifications: users.filter(u => u.role === 'freelancer' && !u.verified).length,
            successRate: jobs.length > 0 ? ((jobs.filter(j => j.status === 'completed').length / jobs.length) * 100).toFixed(1) : 0,
            avgResponseTime: '2.3 hours', // Mock data
            platformUptime: '99.9%' // Mock data
        };
        
        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border p-6">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                        <i class="fas fa-tachometer-alt text-blue-600 mr-2"></i>Performance Metrics
                    </h3>
                    <div class="flex items-center space-x-2 text-sm text-gray-500">
                        <i class="fas fa-clock mr-1"></i>
                        <span>Updated ${new Date().toLocaleTimeString()}</span>
                    </div>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div class="metric-card blue p-4 rounded-lg hover:shadow-md transition-all">
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="text-2xl font-bold text-blue-600">${metrics.totalUsers}</div>
                                <div class="text-sm text-gray-600">Total Users</div>
                                <div class="text-xs text-blue-500 mt-1">All registered</div>
                            </div>
                            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <i class="fas fa-users text-blue-600"></i>
                            </div>
                        </div>
                    </div>
                    <div class="metric-card green p-4 rounded-lg hover:shadow-md transition-all">
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="text-2xl font-bold text-green-600">${metrics.activeJobs}</div>
                                <div class="text-sm text-gray-600">Active Jobs</div>
                                <div class="text-xs text-green-500 mt-1">Currently hiring</div>
                            </div>
                            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <i class="fas fa-briefcase text-green-600"></i>
                            </div>
                        </div>
                    </div>
                    <div class="metric-card purple p-4 rounded-lg hover:shadow-md transition-all">
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="text-2xl font-bold text-purple-600">${metrics.completedJobs}</div>
                                <div class="text-sm text-gray-600">Completed</div>
                                <div class="text-xs text-purple-500 mt-1">${metrics.successRate}% success</div>
                            </div>
                            <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <i class="fas fa-check-circle text-purple-600"></i>
                            </div>
                        </div>
                    </div>
                    <div class="metric-card orange p-4 rounded-lg hover:shadow-md transition-all">
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="text-2xl font-bold text-orange-600">${metrics.totalApplications}</div>
                                <div class="text-sm text-gray-600">Applications</div>
                                <div class="text-xs text-orange-500 mt-1">Total submitted</div>
                            </div>
                            <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                <i class="fas fa-paper-plane text-orange-600"></i>
                            </div>
                        </div>
                    </div>
                    <div class="metric-card teal p-4 rounded-lg hover:shadow-md transition-all">
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="text-2xl font-bold text-teal-600">${metrics.verifiedFreelancers}</div>
                                <div class="text-sm text-gray-600">Verified</div>
                                <div class="text-xs text-teal-500 mt-1">Freelancers</div>
                            </div>
                            <div class="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                                <i class="fas fa-user-check text-teal-600"></i>
                            </div>
                        </div>
                    </div>
                    <div class="metric-card red p-4 rounded-lg hover:shadow-md transition-all">
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="text-2xl font-bold text-red-600">${metrics.pendingVerifications}</div>
                                <div class="text-sm text-gray-600">Pending</div>
                                <div class="text-xs text-red-500 mt-1">Verification</div>
                            </div>
                            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <i class="fas fa-clock text-red-600"></i>
                            </div>
                        </div>
                    </div>
                    <div class="metric-card blue p-4 rounded-lg hover:shadow-md transition-all">
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="text-2xl font-bold text-blue-600">${metrics.avgResponseTime}</div>
                                <div class="text-sm text-gray-600">Avg Response</div>
                                <div class="text-xs text-blue-500 mt-1">Support time</div>
                            </div>
                            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <i class="fas fa-stopwatch text-blue-600"></i>
                            </div>
                        </div>
                    </div>
                    <div class="metric-card green p-4 rounded-lg hover:shadow-md transition-all">
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="text-2xl font-bold text-green-600">${metrics.platformUptime}</div>
                                <div class="text-sm text-gray-600">Uptime</div>
                                <div class="text-xs text-green-500 mt-1">Last 30 days</div>
                            </div>
                            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <i class="fas fa-server text-green-600"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderRevenueStats() {
        const { jobs } = this.getFilteredData();
        const container = document.getElementById('revenueStats');
        
        if (!container) return;
        
        const completedJobs = jobs.filter(j => j.status === 'completed');
        const activeJobs = jobs.filter(j => j.status === 'active');
        const totalJobValue = jobs.reduce((sum, job) => sum + parseInt(job.salary || job.maxBudget || 0), 0);
        const potentialRevenue = totalJobValue * 0.1; // 10% commission
        const avgJobValue = jobs.length > 0 ? totalJobValue / jobs.length : 0;
        const monthlyRevenue = 0; // No actual transactions yet
        
        // Calculate growth metrics
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const lastMonthJobs = jobs.filter(j => new Date(j.createdAt) >= lastMonth);
        const growthRate = lastMonthJobs.length > 0 ? ((lastMonthJobs.length / jobs.length) * 100).toFixed(1) : 0;
        
        container.innerHTML = `
            <div class="revenue-card">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-xl font-bold text-gray-900 flex items-center">
                        <i class="fas fa-chart-pie text-green-600 mr-3"></i>Revenue Analytics
                    </h3>
                    <div class="flex items-center space-x-2">
                        <span class="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
                            <i class="fas fa-trending-up mr-1"></i>+${growthRate}% Growth
                        </span>
                    </div>
                </div>
                
                <div class="revenue-highlight mb-6">
                    RWF ${potentialRevenue.toLocaleString()}
                    <div class="text-lg text-green-700 font-normal">Potential Platform Revenue</div>
                </div>
                
                <div class="revenue-breakdown">
                    <div class="breakdown-item">
                        <div class="breakdown-value">RWF ${monthlyRevenue.toLocaleString()}</div>
                        <div class="breakdown-label">Actual Revenue</div>
                        <div class="text-xs text-gray-500 mt-1">No transactions yet</div>
                    </div>
                    <div class="breakdown-item">
                        <div class="breakdown-value">RWF ${avgJobValue.toLocaleString()}</div>
                        <div class="breakdown-label">Average Job Value</div>
                        <div class="text-xs text-green-600 mt-1">Market rate</div>
                    </div>
                    <div class="breakdown-item">
                        <div class="breakdown-value">${completedJobs.length}</div>
                        <div class="breakdown-label">Completed Projects</div>
                        <div class="text-xs text-blue-600 mt-1">${jobs.length > 0 ? ((completedJobs.length / jobs.length) * 100).toFixed(1) : 0}% completion rate</div>
                    </div>
                    <div class="breakdown-item">
                        <div class="breakdown-value">${activeJobs.length}</div>
                        <div class="breakdown-label">Active Projects</div>
                        <div class="text-xs text-orange-600 mt-1">In progress</div>
                    </div>
                </div>
                
                <div class="mt-6 p-4 bg-white bg-opacity-50 rounded-lg">
                    <h4 class="font-semibold text-gray-800 mb-3 flex items-center">
                        <i class="fas fa-lightbulb text-yellow-500 mr-2"></i>Revenue Insights
                    </h4>
                    <div class="grid md:grid-cols-2 gap-4 text-sm">
                        <div class="flex items-center space-x-2">
                            <i class="fas fa-dollar-sign text-green-500"></i>
                            <span>Commission Rate: <strong>10%</strong> per completed job</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <i class="fas fa-calculator text-blue-500"></i>
                            <span>Total Job Value: <strong>RWF ${totalJobValue.toLocaleString()}</strong></span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <i class="fas fa-chart-line text-purple-500"></i>
                            <span>Growth Rate: <strong>+${growthRate}%</strong> this month</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <i class="fas fa-target text-red-500"></i>
                            <span>Conversion Rate: <strong>${jobs.length > 0 ? ((completedJobs.length / jobs.length) * 100).toFixed(1) : 0}%</strong></span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderUserRoleChart() {
        const { users } = this.getFilteredData();
        const container = document.getElementById('userRoleChart');
        
        if (!container) return;
        
        const roleCounts = users.reduce((acc, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
        }, {});
        
        const total = users.length;
        const roles = Object.keys(roleCounts);
        
        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">User Distribution by Role</h3>
                <div class="space-y-4">
                    ${roles.map(role => {
                        const count = roleCounts[role];
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

    renderJobCategoryChart() {
        const { jobs } = this.getFilteredData();
        const container = document.getElementById('jobCategoryChart');
        
        if (!container) return;
        
        const categoryCounts = jobs.reduce((acc, job) => {
            const category = job.category || 'Uncategorized';
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {});
        
        const total = jobs.length;
        const categories = Object.keys(categoryCounts);
        
        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Jobs by Category</h3>
                <div class="space-y-3">
                    ${categories.map((category, index) => {
                        const count = categoryCounts[category];
                        const percentage = total > 0 ? (count / total * 100).toFixed(1) : 0;
                        const color = this.getCategoryColor(index);
                        return `
                            <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                    <div class="w-3 h-3 rounded-full ${color} mr-3"></div>
                                    <span class="text-sm font-medium">${category}</span>
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

    renderVerificationChart() {
        const { users } = this.getFilteredData();
        const container = document.getElementById('verificationChart');
        
        if (!container) return;
        
        const freelancers = users.filter(u => u.role === 'freelancer');
        const verified = freelancers.filter(f => f.verified).length;
        const pending = freelancers.length - verified;
        const verificationRate = freelancers.length > 0 ? (verified / freelancers.length * 100).toFixed(1) : 0;
        
        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Freelancer Verification Status</h3>
                <div class="text-center mb-6">
                    <div class="text-4xl font-bold text-green-600">${verificationRate}%</div>
                    <div class="text-sm text-gray-600">Verification Rate</div>
                </div>
                <div class="space-y-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <div class="w-4 h-4 rounded bg-green-500 mr-3"></div>
                            <span>Verified</span>
                        </div>
                        <span class="font-semibold">${verified}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <div class="w-4 h-4 rounded bg-yellow-500 mr-3"></div>
                            <span>Pending</span>
                        </div>
                        <span class="font-semibold">${pending}</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderJobStatusChart() {
        const { jobs } = this.getFilteredData();
        const container = document.getElementById('jobStatusChart');
        
        if (!container) return;
        
        const statusCounts = jobs.reduce((acc, job) => {
            acc[job.status] = (acc[job.status] || 0) + 1;
            return acc;
        }, {});
        
        const total = jobs.length;
        const statuses = Object.keys(statusCounts);
        
        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Job Status Distribution</h3>
                <div class="space-y-3">
                    ${statuses.map(status => {
                        const count = statusCounts[status];
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

    renderLocationChart() {
        const { users } = this.getFilteredData();
        const container = document.getElementById('locationChart');
        
        if (!container) return;
        
        const locationCounts = users.reduce((acc, user) => {
            const location = user.location || 'Not specified';
            acc[location] = (acc[location] || 0) + 1;
            return acc;
        }, {});
        
        const sortedLocations = Object.entries(locationCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);
        
        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Top User Locations</h3>
                <div class="space-y-3">
                    ${sortedLocations.map(([location, count], index) => {
                        const color = this.getCategoryColor(index);
                        return `
                            <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                    <div class="w-3 h-3 rounded-full ${color} mr-3"></div>
                                    <span class="text-sm font-medium">${location}</span>
                                </div>
                                <span class="font-semibold">${count}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    renderJobLocationChart() {
        const { jobs } = this.getFilteredData();
        const container = document.getElementById('jobLocationChart');
        
        if (!container) return;
        
        const locationCounts = jobs.reduce((acc, job) => {
            const location = job.location || 'Remote';
            acc[location] = (acc[location] || 0) + 1;
            return acc;
        }, {});
        
        const sortedLocations = Object.entries(locationCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);
        
        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Job Locations</h3>
                <div class="space-y-3">
                    ${sortedLocations.map(([location, count], index) => {
                        const color = this.getCategoryColor(index);
                        return `
                            <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                    <div class="w-3 h-3 rounded-full ${color} mr-3"></div>
                                    <span class="text-sm font-medium">${location}</span>
                                </div>
                                <span class="font-semibold">${count}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    renderRevenueChart() {
        const { jobs } = this.getFilteredData();
        const container = document.getElementById('revenueChart');
        
        if (!container) return;
        
        // Group jobs by month for revenue trend
        const monthlyRevenue = {};
        const completedJobs = jobs.filter(j => j.status === 'completed');
        
        completedJobs.forEach(job => {
            const date = new Date(job.createdAt);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const revenue = parseInt(job.salary || job.maxBudget || 0) * 0.1; // 10% commission
            monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + revenue;
        });
        
        const months = Object.keys(monthlyRevenue).sort();
        const maxRevenue = Math.max(...Object.values(monthlyRevenue));
        
        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h3>
                <div class="space-y-4">
                    ${months.map(month => {
                        const revenue = monthlyRevenue[month];
                        const percentage = maxRevenue > 0 ? (revenue / maxRevenue * 100) : 0;
                        return `
                            <div class="flex items-center justify-between">
                                <div class="w-20 text-sm font-medium">${month}</div>
                                <div class="flex-1 mx-4">
                                    <div class="w-full bg-gray-200 rounded-full h-3">
                                        <div class="bg-green-500 h-3 rounded-full" style="width: ${percentage}%"></div>
                                    </div>
                                </div>
                                <div class="w-24 text-right font-semibold">RWF ${revenue.toLocaleString()}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    renderTrendAnalysis() {
        const { users, jobs, applications } = this.getFilteredData();
        const container = document.getElementById('trendAnalysis');
        
        if (!container) return;
        
        // Calculate growth trends
        const now = new Date();
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        const weeklyUsers = users.filter(u => new Date(u.createdAt) >= lastWeek).length;
        const monthlyUsers = users.filter(u => new Date(u.createdAt) >= lastMonth).length;
        const weeklyJobs = jobs.filter(j => new Date(j.createdAt) >= lastWeek).length;
        const monthlyJobs = jobs.filter(j => new Date(j.createdAt) >= lastMonth).length;
        
        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Trend Analysis</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="text-center p-4 bg-blue-50 rounded-lg">
                        <div class="text-2xl font-bold text-blue-600">${weeklyUsers}</div>
                        <div class="text-sm text-gray-600">New Users (7 days)</div>
                        <div class="text-xs text-green-600 mt-1">+${((weeklyUsers / 7) * 100).toFixed(0)}% daily avg</div>
                    </div>
                    <div class="text-center p-4 bg-green-50 rounded-lg">
                        <div class="text-2xl font-bold text-green-600">${monthlyUsers}</div>
                        <div class="text-sm text-gray-600">New Users (30 days)</div>
                        <div class="text-xs text-green-600 mt-1">+${((monthlyUsers / 30) * 100).toFixed(0)}% daily avg</div>
                    </div>
                    <div class="text-center p-4 bg-purple-50 rounded-lg">
                        <div class="text-2xl font-bold text-purple-600">${weeklyJobs}</div>
                        <div class="text-sm text-gray-600">New Jobs (7 days)</div>
                        <div class="text-xs text-green-600 mt-1">+${((weeklyJobs / 7) * 100).toFixed(0)}% daily avg</div>
                    </div>
                    <div class="text-center p-4 bg-orange-50 rounded-lg">
                        <div class="text-2xl font-bold text-orange-600">${monthlyJobs}</div>
                        <div class="text-sm text-gray-600">New Jobs (30 days)</div>
                        <div class="text-xs text-green-600 mt-1">+${((monthlyJobs / 30) * 100).toFixed(0)}% daily avg</div>
                    </div>
                </div>
                
                <div class="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 class="font-semibold text-gray-800 mb-3">Key Insights</h4>
                    <div class="space-y-2 text-sm text-gray-600">
                        <div class="flex items-center">
                            <i class="fas fa-arrow-up text-green-500 mr-2"></i>
                            <span>User registration is ${weeklyUsers > 5 ? 'growing steadily' : 'moderate'} with ${weeklyUsers} new users this week</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-briefcase text-blue-500 mr-2"></i>
                            <span>Job posting activity is ${weeklyJobs > 3 ? 'high' : 'steady'} with ${weeklyJobs} new jobs posted</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-chart-line text-purple-500 mr-2"></i>
                            <span>Platform engagement shows ${applications.length > 10 ? 'strong' : 'growing'} user interaction</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    exportReport() {
        const { users, jobs, applications } = this.getFilteredData();
        
        const report = {
            generatedAt: new Date().toISOString(),
            dateRange: {
                from: this.dateFrom.toISOString(),
                to: this.dateTo.toISOString()
            },
            summary: {
                totalUsers: users.length,
                totalJobs: jobs.length,
                totalApplications: applications.length,
                activeJobs: jobs.filter(j => j.status === 'active').length,
                completedJobs: jobs.filter(j => j.status === 'completed').length,
                verifiedFreelancers: users.filter(u => u.role === 'freelancer' && u.verified).length,
                pendingVerifications: users.filter(u => u.role === 'freelancer' && !u.verified).length
            },
            usersByRole: users.reduce((acc, user) => {
                acc[user.role] = (acc[user.role] || 0) + 1;
                return acc;
            }, {}),
            jobsByCategory: jobs.reduce((acc, job) => {
                const category = job.category || 'Uncategorized';
                acc[category] = (acc[category] || 0) + 1;
                return acc;
            }, {}),
            jobsByStatus: jobs.reduce((acc, job) => {
                acc[job.status] = (acc[job.status] || 0) + 1;
                return acc;
            }, {}),
            revenue: {
                totalRevenue: 0, // No transactions yet
                averageJobValue: jobs.length > 0 ? 
                    jobs.reduce((sum, job) => sum + parseInt(job.salary || job.maxBudget || 0), 0) / jobs.length : 0
            }
        };
        
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rwanda-skillsconnect-analytics-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Show success notification
        if (window.showNotification) {
            window.showNotification('Analytics report exported successfully!', 'success');
        }
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

    renderAdvancedCharts() {
        this.renderUserGrowthChart();
        this.renderJobCompletionChart();
        this.renderSkillDemandChart();
        this.renderEngagementMetrics();
    }

    renderUserGrowthChart() {
        const { users } = this.getFilteredData();
        const container = document.createElement('div');
        container.className = 'bg-white rounded-xl shadow-sm border p-6 mb-6';
        
        // Group users by month
        const monthlyGrowth = {};
        users.forEach(user => {
            const date = new Date(user.createdAt);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyGrowth[monthKey] = (monthlyGrowth[monthKey] || 0) + 1;
        });
        
        const months = Object.keys(monthlyGrowth).sort();
        const maxUsers = Math.max(...Object.values(monthlyGrowth));
        
        container.innerHTML = `
            <div class="chart-wrapper">
                <h3 class="chart-title flex items-center">
                    <i class="fas fa-chart-area text-blue-600 mr-2"></i>User Growth Trend
                </h3>
                <div class="bar-chart">
                    ${months.map(month => {
                        const count = monthlyGrowth[month];
                        const percentage = maxUsers > 0 ? (count / maxUsers * 100) : 0;
                        return `
                            <div class="bar-item">
                                <div class="bar-label">${month}</div>
                                <div class="bar-container">
                                    <div class="bar-fill" style="width: ${percentage}%"></div>
                                </div>
                                <div class="bar-value">${count}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        
        const reportsSection = document.getElementById('reports-section');
        if (reportsSection) {
            reportsSection.appendChild(container);
        }
    }

    renderJobCompletionChart() {
        const { jobs } = this.getFilteredData();
        const container = document.createElement('div');
        container.className = 'bg-white rounded-xl shadow-sm border p-6 mb-6';
        
        const statusCounts = jobs.reduce((acc, job) => {
            acc[job.status] = (acc[job.status] || 0) + 1;
            return acc;
        }, {});
        
        const total = jobs.length;
        
        container.innerHTML = `
            <div class="chart-wrapper">
                <h3 class="chart-title flex items-center">
                    <i class="fas fa-tasks text-green-600 mr-2"></i>Job Completion Status
                </h3>
                <div class="grid md:grid-cols-2 gap-6">
                    <div class="space-y-4">
                        ${Object.entries(statusCounts).map(([status, count]) => {
                            const percentage = total > 0 ? (count / total * 100).toFixed(1) : 0;
                            const color = this.getStatusColor(status).replace('bg-', '');
                            return `
                                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div class="flex items-center space-x-3">
                                        <div class="w-4 h-4 bg-${color}-500 rounded-full"></div>
                                        <span class="font-medium capitalize">${status.replace('_', ' ')}</span>
                                    </div>
                                    <div class="text-right">
                                        <div class="font-bold text-gray-900">${count}</div>
                                        <div class="text-sm text-gray-500">${percentage}%</div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    <div class="flex items-center justify-center">
                        <div class="text-center">
                            <div class="text-4xl font-bold text-green-600 mb-2">
                                ${total > 0 ? ((statusCounts.completed || 0) / total * 100).toFixed(1) : 0}%
                            </div>
                            <div class="text-gray-600">Completion Rate</div>
                            <div class="text-sm text-gray-500 mt-2">
                                ${statusCounts.completed || 0} of ${total} jobs completed
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const reportsSection = document.getElementById('reports-section');
        if (reportsSection) {
            reportsSection.appendChild(container);
        }
    }

    renderSkillDemandChart() {
        const { jobs } = this.getFilteredData();
        const container = document.createElement('div');
        container.className = 'bg-white rounded-xl shadow-sm border p-6 mb-6';
        
        // Extract and count skills
        const skillCounts = {};
        jobs.forEach(job => {
            if (job.skills) {
                job.skills.split(',').forEach(skill => {
                    const trimmedSkill = skill.trim().toLowerCase();
                    skillCounts[trimmedSkill] = (skillCounts[trimmedSkill] || 0) + 1;
                });
            }
        });
        
        const topSkills = Object.entries(skillCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);
        
        const maxCount = topSkills.length > 0 ? topSkills[0][1] : 0;
        
        container.innerHTML = `
            <div class="chart-wrapper">
                <h3 class="chart-title flex items-center">
                    <i class="fas fa-tools text-purple-600 mr-2"></i>Most Demanded Skills
                </h3>
                <div class="space-y-3">
                    ${topSkills.map(([skill, count], index) => {
                        const percentage = maxCount > 0 ? (count / maxCount * 100) : 0;
                        const color = this.getCategoryColor(index);
                        return `
                            <div class="flex items-center space-x-4">
                                <div class="w-24 text-sm font-medium capitalize">${skill}</div>
                                <div class="flex-1">
                                    <div class="w-full bg-gray-200 rounded-full h-3">
                                        <div class="${color} h-3 rounded-full transition-all duration-1000" style="width: ${percentage}%"></div>
                                    </div>
                                </div>
                                <div class="w-16 text-right">
                                    <span class="font-bold">${count}</span>
                                    <span class="text-sm text-gray-500 ml-1">jobs</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                ${topSkills.length === 0 ? `
                    <div class="text-center py-8 text-gray-500">
                        <i class="fas fa-search text-3xl mb-3"></i>
                        <p>No skill data available</p>
                        <p class="text-sm">Skills will appear as jobs are posted</p>
                    </div>
                ` : ''}
            </div>
        `;
        
        const reportsSection = document.getElementById('reports-section');
        if (reportsSection) {
            reportsSection.appendChild(container);
        }
    }

    renderEngagementMetrics() {
        const { users, jobs, applications } = this.getFilteredData();
        const container = document.createElement('div');
        container.className = 'bg-white rounded-xl shadow-sm border p-6 mb-6';
        
        const freelancers = users.filter(u => u.role === 'freelancer');
        const clients = users.filter(u => u.role === 'client');
        const avgApplicationsPerJob = jobs.length > 0 ? (applications.length / jobs.length).toFixed(1) : 0;
        const activeFreelancers = applications.reduce((acc, app) => {
            acc.add(app.freelancerId);
            return acc;
        }, new Set()).size;
        
        const engagementRate = freelancers.length > 0 ? ((activeFreelancers / freelancers.length) * 100).toFixed(1) : 0;
        
        container.innerHTML = `
            <div class="chart-wrapper">
                <h3 class="chart-title flex items-center">
                    <i class="fas fa-users-cog text-indigo-600 mr-2"></i>Platform Engagement Metrics
                </h3>
                <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                        <div class="text-3xl font-bold text-blue-600 mb-2">${avgApplicationsPerJob}</div>
                        <div class="text-sm text-gray-600">Avg Applications per Job</div>
                        <div class="text-xs text-blue-500 mt-1">
                            ${avgApplicationsPerJob > 3 ? 'High competition' : avgApplicationsPerJob > 1 ? 'Moderate interest' : 'Low competition'}
                        </div>
                    </div>
                    <div class="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                        <div class="text-3xl font-bold text-green-600 mb-2">${engagementRate}%</div>
                        <div class="text-sm text-gray-600">Freelancer Engagement</div>
                        <div class="text-xs text-green-500 mt-1">
                            ${activeFreelancers} of ${freelancers.length} active
                        </div>
                    </div>
                    <div class="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                        <div class="text-3xl font-bold text-purple-600 mb-2">${clients.length > 0 ? (jobs.length / clients.length).toFixed(1) : 0}</div>
                        <div class="text-sm text-gray-600">Jobs per Client</div>
                        <div class="text-xs text-purple-500 mt-1">
                            Client activity rate
                        </div>
                    </div>
                    <div class="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                        <div class="text-3xl font-bold text-orange-600 mb-2">${users.length > 0 ? ((applications.length / users.length) * 100).toFixed(0) : 0}%</div>
                        <div class="text-sm text-gray-600">User Activity Score</div>
                        <div class="text-xs text-orange-500 mt-1">
                            Platform interaction
                        </div>
                    </div>
                </div>
                
                <div class="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                    <h4 class="font-semibold text-gray-800 mb-3 flex items-center">
                        <i class="fas fa-chart-line text-indigo-500 mr-2"></i>Engagement Insights
                    </h4>
                    <div class="grid md:grid-cols-3 gap-4 text-sm">
                        <div class="flex items-start space-x-2">
                            <i class="fas fa-thumbs-up text-green-500 mt-0.5"></i>
                            <div>
                                <div class="font-medium">High Engagement</div>
                                <div class="text-gray-600">${engagementRate}% of freelancers are actively applying to jobs</div>
                            </div>
                        </div>
                        <div class="flex items-start space-x-2">
                            <i class="fas fa-chart-bar text-blue-500 mt-0.5"></i>
                            <div>
                                <div class="font-medium">Competition Level</div>
                                <div class="text-gray-600">Average ${avgApplicationsPerJob} applications per job posting</div>
                            </div>
                        </div>
                        <div class="flex items-start space-x-2">
                            <i class="fas fa-target text-purple-500 mt-0.5"></i>
                            <div>
                                <div class="font-medium">Platform Health</div>
                                <div class="text-gray-600">${users.length > 50 ? 'Growing' : users.length > 20 ? 'Stable' : 'Building'} user base with active participation</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const reportsSection = document.getElementById('reports-section');
        if (reportsSection) {
            reportsSection.appendChild(container);
        }
    }
}

// Initialize analytics when DOM is loaded
if (typeof window !== 'undefined') {
    window.AdminAnalytics = AdminAnalytics;
    
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('reports-section')) {
            window.adminAnalytics = new AdminAnalytics();
        }
    });
}