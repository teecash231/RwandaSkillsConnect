/**
 * Enhanced Analytics System
 * Real-time analytics with interactive charts and comprehensive reporting
 */

class EnhancedAnalytics {
    constructor() {
        this.refreshInterval = null;
        this.chartInstances = {};
        this.isRealTimeEnabled = true;
        this.init();
    }

    init() {
        this.setupRealTimeUpdates();
        this.setupInteractiveFeatures();
        this.loadEnhancedAnalytics();
    }

    setupRealTimeUpdates() {
        if (this.isRealTimeEnabled) {
            this.refreshInterval = setInterval(() => {
                this.updateRealTimeMetrics();
            }, 30000); // Update every 30 seconds
        }
    }

    setupInteractiveFeatures() {
        // Setup export functionality
        this.setupExportFeatures();
        
        // Setup filter interactions
        this.setupFilterInteractions();
        
        // Setup chart interactions
        this.setupChartInteractions();
    }

    loadEnhancedAnalytics() {
        this.renderDashboardOverview();
        this.renderInteractiveCharts();
        this.renderAdvancedMetrics();
        this.renderPredictiveAnalytics();
    }

    renderDashboardOverview() {
        const container = document.getElementById('realTimeMetrics');
        if (!container) return;

        const data = this.getAnalyticsData();
        const trends = this.calculateTrends(data);

        container.innerHTML = `
            <div class="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl shadow-lg p-6 text-white mb-6">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h2 class="text-2xl font-bold flex items-center">
                            <i class="fas fa-analytics mr-3"></i>Analytics Dashboard
                        </h2>
                        <p class="text-indigo-100 mt-1">Real-time platform insights and performance metrics</p>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="flex items-center space-x-2 text-indigo-100">
                            <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span class="text-sm">Live Data</span>
                        </div>
                        <button onclick="enhancedAnalytics.toggleRealTime()" class="px-3 py-1 bg-white bg-opacity-20 rounded-lg text-sm hover:bg-opacity-30 transition-colors">
                            <i class="fas fa-pause mr-1"></i>Pause Updates
                        </button>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
                        <div class="flex items-center justify-between mb-2">
                            <i class="fas fa-users text-2xl"></i>
                            <span class="text-xs px-2 py-1 bg-green-400 rounded-full text-green-900">
                                ${trends.userGrowth > 0 ? '+' : ''}${trends.userGrowth}%
                            </span>
                        </div>
                        <div class="text-2xl font-bold">${data.totalUsers}</div>
                        <div class="text-sm text-indigo-100">Total Users</div>
                        <div class="text-xs mt-1">${data.newUsersToday} new today</div>
                    </div>
                    
                    <div class="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
                        <div class="flex items-center justify-between mb-2">
                            <i class="fas fa-briefcase text-2xl"></i>
                            <span class="text-xs px-2 py-1 bg-blue-400 rounded-full text-blue-900">
                                ${trends.jobGrowth > 0 ? '+' : ''}${trends.jobGrowth}%
                            </span>
                        </div>
                        <div class="text-2xl font-bold">${data.totalJobs}</div>
                        <div class="text-sm text-indigo-100">Total Jobs</div>
                        <div class="text-xs mt-1">${data.activeJobs} active</div>
                    </div>
                    
                    <div class="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
                        <div class="flex items-center justify-between mb-2">
                            <i class="fas fa-paper-plane text-2xl"></i>
                            <span class="text-xs px-2 py-1 bg-purple-400 rounded-full text-purple-900">
                                ${trends.applicationGrowth > 0 ? '+' : ''}${trends.applicationGrowth}%
                            </span>
                        </div>
                        <div class="text-2xl font-bold">${data.totalApplications}</div>
                        <div class="text-sm text-indigo-100">Applications</div>
                        <div class="text-xs mt-1">${data.applicationsToday} today</div>
                    </div>
                    
                    <div class="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
                        <div class="flex items-center justify-between mb-2">
                            <i class="fas fa-chart-line text-2xl"></i>
                            <span class="text-xs px-2 py-1 bg-yellow-400 rounded-full text-yellow-900">
                                ${data.engagementRate}%
                            </span>
                        </div>
                        <div class="text-2xl font-bold">${data.successRate}%</div>
                        <div class="text-sm text-indigo-100">Success Rate</div>
                        <div class="text-xs mt-1">Platform health</div>
                    </div>
                </div>
            </div>
        `;
    }

    renderInteractiveCharts() {
        this.renderUserActivityChart();
        this.renderJobPerformanceChart();
        this.renderRevenueProjectionChart();
        this.renderGeographicDistribution();
    }

    renderUserActivityChart() {
        const container = document.createElement('div');
        container.className = 'bg-white rounded-xl shadow-sm border p-6 mb-6';
        container.innerHTML = `
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                    <i class="fas fa-chart-area text-blue-600 mr-2"></i>User Activity Timeline
                </h3>
                <div class="flex space-x-2">
                    <button onclick="enhancedAnalytics.changeTimeframe('7d')" class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200">7D</button>
                    <button onclick="enhancedAnalytics.changeTimeframe('30d')" class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">30D</button>
                    <button onclick="enhancedAnalytics.changeTimeframe('90d')" class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">90D</button>
                </div>
            </div>
            <div id="userActivityChart" class="h-64"></div>
        `;

        const reportsSection = document.getElementById('reports-section');
        if (reportsSection) {
            reportsSection.appendChild(container);
        }

        this.renderActivityTimeline();
    }

    renderActivityTimeline() {
        const data = this.getUserActivityData();
        const chartContainer = document.getElementById('userActivityChart');
        
        if (!chartContainer) return;

        // Create simple line chart visualization
        const maxValue = Math.max(...data.map(d => d.value));
        
        chartContainer.innerHTML = `
            <div class="relative h-full">
                <svg class="w-full h-full" viewBox="0 0 800 200">
                    ${data.map((point, index) => {
                        const x = (index / (data.length - 1)) * 750 + 25;
                        const y = 175 - (point.value / maxValue) * 150;
                        const nextPoint = data[index + 1];
                        
                        let line = '';
                        if (nextPoint) {
                            const nextX = ((index + 1) / (data.length - 1)) * 750 + 25;
                            const nextY = 175 - (nextPoint.value / maxValue) * 150;
                            line = `<line x1="${x}" y1="${y}" x2="${nextX}" y2="${nextY}" stroke="#3b82f6" stroke-width="2"/>`;
                        }
                        
                        return `
                            ${line}
                            <circle cx="${x}" cy="${y}" r="4" fill="#3b82f6" class="hover:r-6 transition-all cursor-pointer"/>
                            <text x="${x}" y="195" text-anchor="middle" class="text-xs fill-gray-500">${point.label}</text>
                        `;
                    }).join('')}
                </svg>
                <div class="absolute top-0 left-0 text-xs text-gray-500">
                    <div>Users: ${maxValue}</div>
                </div>
                <div class="absolute bottom-0 left-0 text-xs text-gray-500">
                    <div>0</div>
                </div>
            </div>
        `;
    }

    renderJobPerformanceChart() {
        const container = document.createElement('div');
        container.className = 'bg-white rounded-xl shadow-sm border p-6 mb-6';
        
        const data = this.getJobPerformanceData();
        
        container.innerHTML = `
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                    <i class="fas fa-tasks text-green-600 mr-2"></i>Job Performance Analytics
                </h3>
                <div class="flex items-center space-x-4">
                    <div class="flex items-center space-x-2 text-sm text-gray-600">
                        <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Completed</span>
                    </div>
                    <div class="flex items-center space-x-2 text-sm text-gray-600">
                        <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>Active</span>
                    </div>
                    <div class="flex items-center space-x-2 text-sm text-gray-600">
                        <div class="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span>Pending</span>
                    </div>
                </div>
            </div>
            
            <div class="grid md:grid-cols-2 gap-6">
                <div class="space-y-4">
                    ${Object.entries(data.statusBreakdown).map(([status, count]) => {
                        const percentage = data.total > 0 ? (count / data.total * 100).toFixed(1) : 0;
                        const color = this.getStatusColorClass(status);
                        return `
                            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div class="flex items-center space-x-3">
                                    <div class="w-4 h-4 ${color} rounded-full"></div>
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
                
                <div class="flex flex-col items-center justify-center">
                    <div class="text-center mb-4">
                        <div class="text-4xl font-bold text-green-600 mb-2">
                            ${data.completionRate}%
                        </div>
                        <div class="text-gray-600">Overall Completion Rate</div>
                    </div>
                    
                    <div class="w-32 h-32 relative">
                        <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" stroke-width="8"/>
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" stroke-width="8" 
                                stroke-dasharray="${data.completionRate * 2.51} 251" stroke-linecap="round"/>
                        </svg>
                    </div>
                </div>
            </div>
        `;

        const reportsSection = document.getElementById('reports-section');
        if (reportsSection) {
            reportsSection.appendChild(container);
        }
    }

    renderRevenueProjectionChart() {
        const container = document.createElement('div');
        container.className = 'bg-white rounded-xl shadow-sm border p-6 mb-6';
        
        const data = this.getRevenueProjectionData();
        
        container.innerHTML = `
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                    <i class="fas fa-chart-line text-purple-600 mr-2"></i>Revenue Projections
                </h3>
                <div class="text-sm text-gray-500">
                    Based on current trends and 10% commission rate
                </div>
            </div>
            
            <div class="grid md:grid-cols-3 gap-6 mb-6">
                <div class="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                    <div class="text-2xl font-bold text-green-600">RWF ${data.projectedMonthly.toLocaleString()}</div>
                    <div class="text-sm text-gray-600">Projected Monthly</div>
                    <div class="text-xs text-green-500 mt-1">+${data.monthlyGrowth}% growth</div>
                </div>
                <div class="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                    <div class="text-2xl font-bold text-blue-600">RWF ${data.projectedQuarterly.toLocaleString()}</div>
                    <div class="text-sm text-gray-600">Projected Quarterly</div>
                    <div class="text-xs text-blue-500 mt-1">Q${Math.ceil((new Date().getMonth() + 1) / 3)} estimate</div>
                </div>
                <div class="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                    <div class="text-2xl font-bold text-purple-600">RWF ${data.projectedYearly.toLocaleString()}</div>
                    <div class="text-sm text-gray-600">Projected Yearly</div>
                    <div class="text-xs text-purple-500 mt-1">${new Date().getFullYear()} target</div>
                </div>
            </div>
            
            <div class="bg-gray-50 rounded-lg p-4">
                <h4 class="font-semibold text-gray-800 mb-3">Revenue Breakdown</h4>
                <div class="space-y-2">
                    ${data.breakdown.map(item => `
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-gray-600">${item.category}</span>
                            <span class="font-medium">RWF ${item.amount.toLocaleString()}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        const reportsSection = document.getElementById('reports-section');
        if (reportsSection) {
            reportsSection.appendChild(container);
        }
    }

    renderGeographicDistribution() {
        const container = document.createElement('div');
        container.className = 'bg-white rounded-xl shadow-sm border p-6 mb-6';
        
        const data = this.getGeographicData();
        
        container.innerHTML = `
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                    <i class="fas fa-map-marked-alt text-red-600 mr-2"></i>Geographic Distribution
                </h3>
                <div class="flex space-x-2">
                    <button onclick="enhancedAnalytics.toggleMapView('users')" class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200">Users</button>
                    <button onclick="enhancedAnalytics.toggleMapView('jobs')" class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">Jobs</button>
                </div>
            </div>
            
            <div class="grid md:grid-cols-2 gap-6">
                <div>
                    <h4 class="font-medium text-gray-800 mb-3">Top Locations - Users</h4>
                    <div class="space-y-2">
                        ${data.userLocations.map((location, index) => {
                            const maxCount = data.userLocations[0]?.count || 1;
                            const percentage = (location.count / maxCount) * 100;
                            return `
                                <div class="flex items-center space-x-3">
                                    <div class="w-20 text-sm font-medium">${location.name}</div>
                                    <div class="flex-1">
                                        <div class="w-full bg-gray-200 rounded-full h-2">
                                            <div class="bg-blue-500 h-2 rounded-full transition-all duration-1000" style="width: ${percentage}%"></div>
                                        </div>
                                    </div>
                                    <div class="w-12 text-right text-sm font-bold">${location.count}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <div>
                    <h4 class="font-medium text-gray-800 mb-3">Top Locations - Jobs</h4>
                    <div class="space-y-2">
                        ${data.jobLocations.map((location, index) => {
                            const maxCount = data.jobLocations[0]?.count || 1;
                            const percentage = (location.count / maxCount) * 100;
                            return `
                                <div class="flex items-center space-x-3">
                                    <div class="w-20 text-sm font-medium">${location.name}</div>
                                    <div class="flex-1">
                                        <div class="w-full bg-gray-200 rounded-full h-2">
                                            <div class="bg-green-500 h-2 rounded-full transition-all duration-1000" style="width: ${percentage}%"></div>
                                        </div>
                                    </div>
                                    <div class="w-12 text-right text-sm font-bold">${location.count}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;

        const reportsSection = document.getElementById('reports-section');
        if (reportsSection) {
            reportsSection.appendChild(container);
        }
    }

    renderAdvancedMetrics() {
        this.renderConversionFunnel();
        this.renderUserRetention();
        this.renderPlatformHealth();
    }

    renderConversionFunnel() {
        const container = document.createElement('div');
        container.className = 'bg-white rounded-xl shadow-sm border p-6 mb-6';
        
        const data = this.getConversionData();
        
        container.innerHTML = `
            <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-900 flex items-center mb-2">
                    <i class="fas fa-filter text-indigo-600 mr-2"></i>Conversion Funnel
                </h3>
                <p class="text-sm text-gray-600">Track user journey from registration to job completion</p>
            </div>
            
            <div class="space-y-4">
                ${data.stages.map((stage, index) => {
                    const width = (stage.count / data.stages[0].count) * 100;
                    const conversionRate = index > 0 ? ((stage.count / data.stages[index - 1].count) * 100).toFixed(1) : 100;
                    return `
                        <div class="relative">
                            <div class="flex items-center justify-between mb-2">
                                <span class="font-medium text-gray-800">${stage.name}</span>
                                <div class="text-right">
                                    <span class="font-bold text-gray-900">${stage.count}</span>
                                    ${index > 0 ? `<span class="text-sm text-gray-500 ml-2">${conversionRate}%</span>` : ''}
                                </div>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-8 relative overflow-hidden">
                                <div class="bg-gradient-to-r from-indigo-500 to-purple-600 h-8 rounded-full transition-all duration-1000 flex items-center justify-center text-white text-sm font-medium" style="width: ${width}%">
                                    ${width > 20 ? stage.count : ''}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            
            <div class="mt-6 p-4 bg-indigo-50 rounded-lg">
                <div class="flex items-center justify-between">
                    <div>
                        <div class="font-semibold text-indigo-900">Overall Conversion Rate</div>
                        <div class="text-sm text-indigo-700">From registration to job completion</div>
                    </div>
                    <div class="text-2xl font-bold text-indigo-600">
                        ${data.overallConversion}%
                    </div>
                </div>
            </div>
        `;

        const reportsSection = document.getElementById('reports-section');
        if (reportsSection) {
            reportsSection.appendChild(container);
        }
    }

    renderUserRetention() {
        const container = document.createElement('div');
        container.className = 'bg-white rounded-xl shadow-sm border p-6 mb-6';
        
        const data = this.getRetentionData();
        
        container.innerHTML = `
            <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-900 flex items-center mb-2">
                    <i class="fas fa-user-clock text-teal-600 mr-2"></i>User Retention Analysis
                </h3>
                <p class="text-sm text-gray-600">User activity and return rates over time</p>
            </div>
            
            <div class="grid md:grid-cols-3 gap-6 mb-6">
                <div class="text-center p-4 bg-teal-50 rounded-lg">
                    <div class="text-2xl font-bold text-teal-600">${data.dailyActive}%</div>
                    <div class="text-sm text-gray-600">Daily Active Users</div>
                    <div class="text-xs text-teal-500 mt-1">Last 7 days avg</div>
                </div>
                <div class="text-center p-4 bg-blue-50 rounded-lg">
                    <div class="text-2xl font-bold text-blue-600">${data.weeklyActive}%</div>
                    <div class="text-sm text-gray-600">Weekly Active Users</div>
                    <div class="text-xs text-blue-500 mt-1">Last 4 weeks avg</div>
                </div>
                <div class="text-center p-4 bg-purple-50 rounded-lg">
                    <div class="text-2xl font-bold text-purple-600">${data.monthlyActive}%</div>
                    <div class="text-sm text-gray-600">Monthly Active Users</div>
                    <div class="text-xs text-purple-500 mt-1">Last 3 months avg</div>
                </div>
            </div>
            
            <div class="space-y-3">
                <h4 class="font-medium text-gray-800">Retention by User Type</h4>
                ${data.byUserType.map(type => `
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div class="flex items-center space-x-3">
                            <i class="fas ${type.icon} text-${type.color}-600"></i>
                            <span class="font-medium">${type.name}</span>
                        </div>
                        <div class="text-right">
                            <div class="font-bold text-gray-900">${type.retention}%</div>
                            <div class="text-sm text-gray-500">retention rate</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        const reportsSection = document.getElementById('reports-section');
        if (reportsSection) {
            reportsSection.appendChild(container);
        }
    }

    renderPlatformHealth() {
        const container = document.createElement('div');
        container.className = 'bg-white rounded-xl shadow-sm border p-6 mb-6';
        
        const data = this.getPlatformHealthData();
        
        container.innerHTML = `
            <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-900 flex items-center mb-2">
                    <i class="fas fa-heartbeat text-red-600 mr-2"></i>Platform Health Score
                </h3>
                <p class="text-sm text-gray-600">Overall platform performance and user satisfaction metrics</p>
            </div>
            
            <div class="text-center mb-6">
                <div class="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white mb-4">
                    <div class="text-center">
                        <div class="text-3xl font-bold">${data.overallScore}</div>
                        <div class="text-sm">Health Score</div>
                    </div>
                </div>
                <div class="text-lg font-semibold text-gray-800">${data.status}</div>
                <div class="text-sm text-gray-600">${data.description}</div>
            </div>
            
            <div class="grid md:grid-cols-2 gap-6">
                <div>
                    <h4 class="font-medium text-gray-800 mb-3">Performance Metrics</h4>
                    <div class="space-y-3">
                        ${data.metrics.map(metric => `
                            <div class="flex items-center justify-between">
                                <span class="text-sm text-gray-600">${metric.name}</span>
                                <div class="flex items-center space-x-2">
                                    <div class="w-20 bg-gray-200 rounded-full h-2">
                                        <div class="bg-${metric.color}-500 h-2 rounded-full" style="width: ${metric.value}%"></div>
                                    </div>
                                    <span class="text-sm font-medium w-12 text-right">${metric.value}%</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div>
                    <h4 class="font-medium text-gray-800 mb-3">Key Indicators</h4>
                    <div class="space-y-3">
                        ${data.indicators.map(indicator => `
                            <div class="flex items-center justify-between p-2 rounded-lg ${indicator.status === 'good' ? 'bg-green-50' : indicator.status === 'warning' ? 'bg-yellow-50' : 'bg-red-50'}">
                                <div class="flex items-center space-x-2">
                                    <i class="fas ${indicator.icon} text-${indicator.status === 'good' ? 'green' : indicator.status === 'warning' ? 'yellow' : 'red'}-600"></i>
                                    <span class="text-sm font-medium">${indicator.name}</span>
                                </div>
                                <span class="text-sm font-bold text-${indicator.status === 'good' ? 'green' : indicator.status === 'warning' ? 'yellow' : 'red'}-600">
                                    ${indicator.value}
                                </span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        const reportsSection = document.getElementById('reports-section');
        if (reportsSection) {
            reportsSection.appendChild(container);
        }
    }

    renderPredictiveAnalytics() {
        const container = document.createElement('div');
        container.className = 'bg-white rounded-xl shadow-sm border p-6 mb-6';
        
        const predictions = this.getPredictiveData();
        
        container.innerHTML = `
            <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-900 flex items-center mb-2">
                    <i class="fas fa-crystal-ball text-purple-600 mr-2"></i>Predictive Analytics
                </h3>
                <p class="text-sm text-gray-600">AI-powered insights and future trend predictions</p>
            </div>
            
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${predictions.map(prediction => `
                    <div class="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                        <div class="flex items-center justify-between mb-3">
                            <h4 class="font-medium text-gray-800">${prediction.title}</h4>
                            <span class="px-2 py-1 text-xs rounded-full ${prediction.confidence > 80 ? 'bg-green-100 text-green-800' : prediction.confidence > 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}">
                                ${prediction.confidence}% confidence
                            </span>
                        </div>
                        <div class="text-2xl font-bold text-gray-900 mb-2">${prediction.value}</div>
                        <div class="text-sm text-gray-600 mb-3">${prediction.description}</div>
                        <div class="flex items-center text-xs text-gray-500">
                            <i class="fas fa-clock mr-1"></i>
                            <span>${prediction.timeframe}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        const reportsSection = document.getElementById('reports-section');
        if (reportsSection) {
            reportsSection.appendChild(container);
        }
    }

    // Data retrieval methods
    getAnalyticsData() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        const applications = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
        
        const today = new Date().toDateString();
        const newUsersToday = users.filter(u => new Date(u.createdAt).toDateString() === today).length;
        const applicationsToday = applications.filter(a => new Date(a.appliedAt).toDateString() === today).length;
        
        return {
            totalUsers: users.length,
            totalJobs: jobs.length,
            totalApplications: applications.length,
            activeJobs: jobs.filter(j => j.status === 'active').length,
            newUsersToday,
            applicationsToday,
            engagementRate: users.length > 0 ? ((applications.length / users.length) * 100).toFixed(1) : 0,
            successRate: jobs.length > 0 ? ((jobs.filter(j => j.status === 'completed').length / jobs.length) * 100).toFixed(1) : 0
        };
    }

    calculateTrends(data) {
        // Mock trend calculations - in real app, compare with previous periods
        return {
            userGrowth: Math.floor(Math.random() * 20) + 5,
            jobGrowth: Math.floor(Math.random() * 15) + 3,
            applicationGrowth: Math.floor(Math.random() * 25) + 8
        };
    }

    getUserActivityData() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const last7Days = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayUsers = users.filter(u => 
                new Date(u.createdAt).toDateString() === date.toDateString()
            ).length;
            
            last7Days.push({
                label: date.toLocaleDateString('en-US', { weekday: 'short' }),
                value: dayUsers
            });
        }
        
        return last7Days;
    }

    getJobPerformanceData() {
        const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        
        const statusBreakdown = jobs.reduce((acc, job) => {
            acc[job.status] = (acc[job.status] || 0) + 1;
            return acc;
        }, {});
        
        const completedJobs = jobs.filter(j => j.status === 'completed').length;
        const completionRate = jobs.length > 0 ? ((completedJobs / jobs.length) * 100).toFixed(1) : 0;
        
        return {
            statusBreakdown,
            total: jobs.length,
            completionRate: parseFloat(completionRate)
        };
    }

    getRevenueProjectionData() {
        const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        const totalJobValue = jobs.reduce((sum, job) => sum + parseInt(job.salary || job.maxBudget || 0), 0);
        const avgJobValue = jobs.length > 0 ? totalJobValue / jobs.length : 0;
        
        // Mock projections based on current data
        const projectedMonthly = avgJobValue * 0.1 * Math.max(jobs.length, 10);
        const projectedQuarterly = projectedMonthly * 3;
        const projectedYearly = projectedMonthly * 12;
        
        return {
            projectedMonthly,
            projectedQuarterly,
            projectedYearly,
            monthlyGrowth: 15,
            breakdown: [
                { category: 'Web Development', amount: projectedMonthly * 0.4 },
                { category: 'Mobile Development', amount: projectedMonthly * 0.25 },
                { category: 'Design', amount: projectedMonthly * 0.2 },
                { category: 'Other', amount: projectedMonthly * 0.15 }
            ]
        };
    }

    getGeographicData() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        
        // Mock geographic data
        const userLocations = [
            { name: 'Kigali', count: Math.floor(users.length * 0.6) },
            { name: 'Butare', count: Math.floor(users.length * 0.15) },
            { name: 'Gisenyi', count: Math.floor(users.length * 0.1) },
            { name: 'Ruhengeri', count: Math.floor(users.length * 0.08) },
            { name: 'Other', count: Math.floor(users.length * 0.07) }
        ].filter(loc => loc.count > 0);
        
        const jobLocations = [
            { name: 'Remote', count: Math.floor(jobs.length * 0.5) },
            { name: 'Kigali', count: Math.floor(jobs.length * 0.3) },
            { name: 'Butare', count: Math.floor(jobs.length * 0.1) },
            { name: 'Gisenyi', count: Math.floor(jobs.length * 0.06) },
            { name: 'Other', count: Math.floor(jobs.length * 0.04) }
        ].filter(loc => loc.count > 0);
        
        return { userLocations, jobLocations };
    }

    getConversionData() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        const applications = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
        
        const freelancers = users.filter(u => u.role === 'freelancer');
        const appliedFreelancers = new Set(applications.map(a => a.freelancerId)).size;
        const completedJobs = jobs.filter(j => j.status === 'completed').length;
        
        const stages = [
            { name: 'User Registration', count: users.length },
            { name: 'Profile Completion', count: Math.floor(users.length * 0.8) },
            { name: 'Job Application', count: appliedFreelancers },
            { name: 'Job Completion', count: completedJobs }
        ];
        
        const overallConversion = users.length > 0 ? ((completedJobs / users.length) * 100).toFixed(1) : 0;
        
        return { stages, overallConversion };
    }

    getRetentionData() {
        // Mock retention data
        return {
            dailyActive: 45,
            weeklyActive: 68,
            monthlyActive: 82,
            byUserType: [
                { name: 'Freelancers', icon: 'fa-user-cog', color: 'green', retention: 75 },
                { name: 'Clients', icon: 'fa-user-tie', color: 'blue', retention: 68 },
                { name: 'Admins', icon: 'fa-user-shield', color: 'red', retention: 95 }
            ]
        };
    }

    getPlatformHealthData() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        const applications = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
        
        // Calculate health score based on various metrics
        const userGrowth = users.length > 10 ? 90 : users.length * 9;
        const jobActivity = jobs.length > 5 ? 85 : jobs.length * 17;
        const engagement = applications.length > 0 ? Math.min(applications.length * 10, 95) : 0;
        
        const overallScore = Math.round((userGrowth + jobActivity + engagement) / 3);
        
        let status, description;
        if (overallScore >= 80) {
            status = 'Excellent';
            description = 'Platform is performing exceptionally well';
        } else if (overallScore >= 60) {
            status = 'Good';
            description = 'Platform is healthy with room for improvement';
        } else if (overallScore >= 40) {
            status = 'Fair';
            description = 'Platform needs attention in some areas';
        } else {
            status = 'Needs Improvement';
            description = 'Platform requires immediate attention';
        }
        
        return {
            overallScore,
            status,
            description,
            metrics: [
                { name: 'User Growth', value: userGrowth, color: 'blue' },
                { name: 'Job Activity', value: jobActivity, color: 'green' },
                { name: 'User Engagement', value: engagement, color: 'purple' },
                { name: 'Platform Stability', value: 95, color: 'teal' }
            ],
            indicators: [
                { name: 'System Uptime', value: '99.9%', status: 'good', icon: 'fa-server' },
                { name: 'Response Time', value: '< 2s', status: 'good', icon: 'fa-tachometer-alt' },
                { name: 'Error Rate', value: '0.1%', status: 'good', icon: 'fa-exclamation-triangle' },
                { name: 'User Satisfaction', value: '4.8/5', status: 'good', icon: 'fa-star' }
            ]
        };
    }

    getPredictiveData() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        
        return [
            {
                title: 'User Growth',
                value: `+${Math.floor(users.length * 0.3)} users`,
                description: 'Expected new user registrations',
                timeframe: 'Next 30 days',
                confidence: 85
            },
            {
                title: 'Job Postings',
                value: `+${Math.floor(jobs.length * 0.4)} jobs`,
                description: 'Projected new job postings',
                timeframe: 'Next month',
                confidence: 78
            },
            {
                title: 'Revenue Growth',
                value: '+25%',
                description: 'Expected revenue increase',
                timeframe: 'Next quarter',
                confidence: 72
            },
            {
                title: 'Market Expansion',
                value: '3 new cities',
                description: 'Potential market expansion',
                timeframe: 'Next 6 months',
                confidence: 65
            },
            {
                title: 'Platform Adoption',
                value: '90% increase',
                description: 'User engagement improvement',
                timeframe: 'Next quarter',
                confidence: 88
            },
            {
                title: 'Success Rate',
                value: '95%',
                description: 'Job completion success rate',
                timeframe: 'Next 3 months',
                confidence: 82
            }
        ];
    }

    // Utility methods
    getStatusColorClass(status) {
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

    // Interactive methods
    toggleRealTime() {
        this.isRealTimeEnabled = !this.isRealTimeEnabled;
        
        if (this.isRealTimeEnabled) {
            this.setupRealTimeUpdates();
        } else {
            if (this.refreshInterval) {
                clearInterval(this.refreshInterval);
                this.refreshInterval = null;
            }
        }
        
        // Update button text
        const button = document.querySelector('[onclick="enhancedAnalytics.toggleRealTime()"]');
        if (button) {
            button.innerHTML = this.isRealTimeEnabled 
                ? '<i class="fas fa-pause mr-1"></i>Pause Updates'
                : '<i class="fas fa-play mr-1"></i>Resume Updates';
        }
    }

    changeTimeframe(timeframe) {
        // Update active button
        document.querySelectorAll('[onclick^="enhancedAnalytics.changeTimeframe"]').forEach(btn => {
            btn.className = btn.className.replace('bg-blue-100 text-blue-700', 'bg-gray-100 text-gray-700');
        });
        
        event.target.className = event.target.className.replace('bg-gray-100 text-gray-700', 'bg-blue-100 text-blue-700');
        
        // Reload chart with new timeframe
        this.renderActivityTimeline();
    }

    toggleMapView(view) {
        // Update active button
        document.querySelectorAll('[onclick^="enhancedAnalytics.toggleMapView"]').forEach(btn => {
            btn.className = btn.className.replace('bg-blue-100 text-blue-700', 'bg-gray-100 text-gray-700');
        });
        
        event.target.className = event.target.className.replace('bg-gray-100 text-gray-700', 'bg-blue-100 text-blue-700');
        
        // Update map view (placeholder for future implementation)
        console.log(`Switching to ${view} view`);
    }

    updateRealTimeMetrics() {
        if (!this.isRealTimeEnabled) return;
        
        // Update dashboard overview
        this.renderDashboardOverview();
        
        // Update timestamp
        const timestamps = document.querySelectorAll('[data-timestamp]');
        timestamps.forEach(el => {
            el.textContent = `Updated ${new Date().toLocaleTimeString()}`;
        });
    }

    setupExportFeatures() {
        // Enhanced export functionality will be added here
    }

    setupFilterInteractions() {
        // Advanced filtering will be added here
    }

    setupChartInteractions() {
        // Chart interaction handlers will be added here
    }

    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }
}

// Initialize enhanced analytics
if (typeof window !== 'undefined') {
    window.EnhancedAnalytics = EnhancedAnalytics;
    
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('reports-section')) {
            window.enhancedAnalytics = new EnhancedAnalytics();
        }
    });
}