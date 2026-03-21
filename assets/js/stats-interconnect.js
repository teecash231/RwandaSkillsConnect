/**
 * Stats Interconnection System
 * Ensures all dashboard components stay synchronized
 */

class StatsInterconnect {
    constructor() {
        this.components = new Map();
        this.eventQueue = [];
        this.isProcessing = false;
        this.init();
    }

    init() {
        this.setupGlobalEventSystem();
        this.registerComponents();
        this.startEventProcessor();
        this.setupDataWatchers();
    }

    setupGlobalEventSystem() {
        // Create custom event dispatcher
        window.statsEventBus = {
            emit: (event, data) => this.emit(event, data),
            on: (event, callback) => this.on(event, callback),
            off: (event, callback) => this.off(event, callback)
        };

        this.eventListeners = new Map();
    }

    registerComponents() {
        // Register all dashboard components
        this.registerComponent('dashboardStats', () => window.dashboardStats);
        this.registerComponent('userManagement', () => window.userManagement);
        this.registerComponent('jobManagement', () => window.jobManagement);
        this.registerComponent('adminDashboard', () => window.adminDashboard);
        this.registerComponent('adminAnalytics', () => window.adminAnalytics);
    }

    registerComponent(name, getter) {
        this.components.set(name, {
            name,
            getter,
            instance: null,
            lastUpdate: null
        });
    }

    getComponent(name) {
        const component = this.components.get(name);
        if (!component) return null;

        if (!component.instance) {
            component.instance = component.getter();
        }

        return component.instance;
    }

    emit(event, data) {
        this.eventQueue.push({ event, data, timestamp: Date.now() });
        this.processEventQueue();
    }

    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    off(event, callback) {
        if (!this.eventListeners.has(event)) return;
        const listeners = this.eventListeners.get(event);
        const index = listeners.indexOf(callback);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    }

    processEventQueue() {
        if (this.isProcessing || this.eventQueue.length === 0) return;

        this.isProcessing = true;

        while (this.eventQueue.length > 0) {
            const { event, data } = this.eventQueue.shift();
            this.processEvent(event, data);
        }

        this.isProcessing = false;
    }

    processEvent(event, data) {
        // Notify event listeners
        const listeners = this.eventListeners.get(event) || [];
        listeners.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event listener for ${event}:`, error);
            }
        });

        // Handle specific events
        switch (event) {
            case 'userCreated':
            case 'userDeleted':
            case 'userUpdated':
                this.handleUserEvent(event, data);
                break;
            case 'jobCreated':
            case 'jobDeleted':
            case 'jobUpdated':
            case 'jobApproved':
            case 'jobRejected':
                this.handleJobEvent(event, data);
                break;
            case 'applicationCreated':
            case 'applicationUpdated':
                this.handleApplicationEvent(event, data);
                break;
            case 'dataRefreshRequested':
                this.handleDataRefresh();
                break;
        }
    }

    handleUserEvent(event, data) {
        // Update dashboard stats
        const dashboardStats = this.getComponent('dashboardStats');
        if (dashboardStats) {
            dashboardStats.refresh();
        }

        // Update user management display
        const userManagement = this.getComponent('userManagement');
        if (userManagement && userManagement.loadUsers) {
            userManagement.loadUsers();
            userManagement.renderUsers();
        }

        // Update admin dashboard
        const adminDashboard = this.getComponent('adminDashboard');
        if (adminDashboard && adminDashboard.updateStats) {
            adminDashboard.updateStats();
        }

        // Update analytics
        const adminAnalytics = this.getComponent('adminAnalytics');
        if (adminAnalytics && adminAnalytics.loadAnalytics) {
            adminAnalytics.loadAnalytics();
        }

        // Update global functions
        if (typeof loadDashboardData === 'function') {
            loadDashboardData();
        }
        if (typeof loadUsersData === 'function') {
            loadUsersData();
        }
    }

    handleJobEvent(event, data) {
        // Update dashboard stats
        const dashboardStats = this.getComponent('dashboardStats');
        if (dashboardStats) {
            dashboardStats.refresh();
        }

        // Update job management display
        const jobManagement = this.getComponent('jobManagement');
        if (jobManagement && jobManagement.loadJobs) {
            jobManagement.loadJobs();
        }

        // Update admin dashboard
        const adminDashboard = this.getComponent('adminDashboard');
        if (adminDashboard) {
            if (adminDashboard.updateStats) {
                adminDashboard.updateStats();
            }
            if (adminDashboard.loadJobsData) {
                adminDashboard.loadJobsData();
            }
            if (adminDashboard.loadJobApprovalsData) {
                adminDashboard.loadJobApprovalsData();
            }
        }

        // Update global functions
        if (typeof loadJobsData === 'function') {
            loadJobsData();
        }
        if (typeof loadJobApprovalsData === 'function') {
            loadJobApprovalsData();
        }
    }

    handleApplicationEvent(event, data) {
        // Update dashboard stats
        const dashboardStats = this.getComponent('dashboardStats');
        if (dashboardStats) {
            dashboardStats.refresh();
        }

        // Update admin dashboard
        const adminDashboard = this.getComponent('adminDashboard');
        if (adminDashboard && adminDashboard.updateStats) {
            adminDashboard.updateStats();
        }
    }

    handleDataRefresh() {
        // Refresh all components
        this.components.forEach((component, name) => {
            const instance = this.getComponent(name);
            if (instance) {
                if (instance.refresh) {
                    instance.refresh();
                } else if (instance.loadData) {
                    instance.loadData();
                } else if (instance.updateStats) {
                    instance.updateStats();
                }
            }
        });

        // Refresh global functions
        if (typeof loadDashboardData === 'function') {
            loadDashboardData();
        }
    }

    startEventProcessor() {
        // Process events every 100ms
        setInterval(() => {
            this.processEventQueue();
        }, 100);
    }

    setupDataWatchers() {
        // Watch for localStorage changes
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = (key, value) => {
            const oldValue = localStorage.getItem(key);
            originalSetItem.call(localStorage, key, value);
            
            if (oldValue !== value) {
                this.handleStorageChange(key, value, oldValue);
            }
        };

        // Watch for storage events from other tabs
        window.addEventListener('storage', (e) => {
            this.handleStorageChange(e.key, e.newValue, e.oldValue);
        });
    }

    handleStorageChange(key, newValue, oldValue) {
        switch (key) {
            case 'users':
                this.emit('usersDataChanged', { newValue, oldValue });
                break;
            case 'jobs':
                this.emit('jobsDataChanged', { newValue, oldValue });
                break;
            case 'appliedJobs':
                this.emit('applicationsDataChanged', { newValue, oldValue });
                break;
        }

        // Trigger general data refresh
        setTimeout(() => {
            this.emit('dataRefreshRequested', { key });
        }, 50);
    }

    // Public API methods
    refreshAllComponents() {
        this.emit('dataRefreshRequested', { source: 'manual' });
    }

    notifyUserAction(action, userData) {
        this.emit(`user${action.charAt(0).toUpperCase() + action.slice(1)}`, userData);
    }

    notifyJobAction(action, jobData) {
        this.emit(`job${action.charAt(0).toUpperCase() + action.slice(1)}`, jobData);
    }

    notifyApplicationAction(action, applicationData) {
        this.emit(`application${action.charAt(0).toUpperCase() + action.slice(1)}`, applicationData);
    }

    // Component health check
    checkComponentHealth() {
        const health = {};
        
        this.components.forEach((component, name) => {
            const instance = this.getComponent(name);
            health[name] = {
                registered: true,
                instance: !!instance,
                lastUpdate: component.lastUpdate,
                methods: instance ? Object.getOwnPropertyNames(Object.getPrototypeOf(instance)) : []
            };
        });

        return health;
    }

    // Debug information
    getDebugInfo() {
        return {
            components: Array.from(this.components.keys()),
            eventQueue: this.eventQueue.length,
            eventListeners: Array.from(this.eventListeners.keys()),
            isProcessing: this.isProcessing,
            health: this.checkComponentHealth()
        };
    }
}

// Create global instance
window.statsInterconnect = new StatsInterconnect();

// Global helper functions
window.refreshAllDashboardComponents = function() {
    if (window.statsInterconnect) {
        window.statsInterconnect.refreshAllComponents();
    }
};

window.notifyUserAction = function(action, userData) {
    if (window.statsInterconnect) {
        window.statsInterconnect.notifyUserAction(action, userData);
    }
};

window.notifyJobAction = function(action, jobData) {
    if (window.statsInterconnect) {
        window.statsInterconnect.notifyJobAction(action, jobData);
    }
};

// Enhanced global update function
window.updateDashboardStats = function() {
    if (window.dashboardStats) {
        window.dashboardStats.refresh();
    }
    if (window.statsInterconnect) {
        window.statsInterconnect.refreshAllComponents();
    }
};

// Setup event listeners for common actions
document.addEventListener('DOMContentLoaded', () => {
    // Listen for data update events
    document.addEventListener('dataUpdated', () => {
        if (window.statsInterconnect) {
            window.statsInterconnect.emit('dataRefreshRequested', { source: 'dataUpdated' });
        }
    });

    // Listen for user management events
    document.addEventListener('userManagementAction', (e) => {
        if (window.statsInterconnect) {
            window.statsInterconnect.notifyUserAction(e.detail.action, e.detail.data);
        }
    });

    // Listen for job management events
    document.addEventListener('jobManagementAction', (e) => {
        if (window.statsInterconnect) {
            window.statsInterconnect.notifyJobAction(e.detail.action, e.detail.data);
        }
    });
});

console.log('🔗 Stats Interconnection System Loaded');