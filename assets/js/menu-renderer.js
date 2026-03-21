/**
 * Rwanda SkillsConnect - Menu Renderer
 * Dynamically renders menus based on configuration
 */

class MenuRenderer {
    constructor() {
        this.config = window.MenuConfig;
        this.currentUser = null;
        this.init();
    }

    init() {
        this.loadUserSession();
        this.renderMenus();
        this.setupEventListeners();
    }

    loadUserSession() {
        this.currentUser = JSON.parse(localStorage.getItem('userSession') || 'null');
    }

    renderMenus() {
        if (!this.currentUser) return;

        const userRole = this.currentUser.role;
        const menuData = this.config.utils.getMenuForRole(userRole);

        // Render different menu sections
        this.renderCoreFeatures(menuData.primary, userRole);
        this.renderSecondaryFeatures(menuData.secondary, userRole);
        this.renderToolsAndResources(menuData.tools, userRole);
        this.renderQuickActions(userRole);
        this.renderBreadcrumbs();
    }

    renderCoreFeatures(items, userRole) {
        const container = document.querySelector('.core-features-grid, [data-menu-section="core"]');
        if (!container || !items) return;

        const categoryConfig = this.config.utils.getCategoryConfig('core');
        
        container.innerHTML = items.map(item => this.renderMenuItem(item, userRole)).join('');
    }

    renderSecondaryFeatures(items, userRole) {
        const container = document.querySelector('.secondary-features-grid, [data-menu-section="secondary"]');
        if (!container || !items) return;

        container.innerHTML = items.map(item => this.renderMenuItem(item, userRole)).join('');
    }

    renderToolsAndResources(items, userRole) {
        const container = document.querySelector('.tools-features-grid, [data-menu-section="tools"]');
        if (!container || !items) return;

        container.innerHTML = items.map(item => this.renderMenuItem(item, userRole)).join('');
    }

    renderMenuItem(item, userRole) {
        const isComingSoon = this.config.utils.isComingSoon(item);
        const shouldShowBadge = this.config.utils.shouldShowBadge(item);
        const categoryConfig = this.config.utils.getCategoryConfig(item.category);
        
        const badgeHtml = shouldShowBadge ? this.getBadgeHtml(item, userRole) : '';
        const clickHandler = isComingSoon ? 
            `onclick="showComingSoon('${item.label}')"` : 
            `onclick="window.location.href='${item.url}'"`;

        return `
            <div class="menu-card bg-white border-2 border-gray-200 rounded-xl p-6 text-center hover:border-${categoryConfig.color || 'indigo'}-300 fade-in-up" 
                 data-menu-item="${item.id}" 
                 data-category="${item.category}">
                <div class="relative">
                    <div class="w-16 h-16 bg-${categoryConfig.color || 'indigo'}-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="${item.icon} text-${categoryConfig.color || 'indigo'}-600 text-2xl"></i>
                    </div>
                    ${badgeHtml}
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">${item.label}</h3>
                <p class="text-gray-600 text-sm mb-4">${item.description}</p>
                <button ${clickHandler} 
                        class="inline-flex items-center px-4 py-2 bg-${categoryConfig.color || 'indigo'}-600 text-white rounded-lg hover:bg-${categoryConfig.color || 'indigo'}-700 transition-colors text-sm">
                    <i class="${this.getActionIcon(item)} mr-2"></i>${this.getActionText(item)}
                </button>
                ${this.getUsageStats(item)}
            </div>
        `;
    }

    getBadgeHtml(item, userRole) {
        const badgeCount = this.getBadgeCount(item, userRole);
        if (badgeCount === 0) return '';

        return `
            <span class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                ${badgeCount > 99 ? '99+' : badgeCount}
            </span>
        `;
    }

    getBadgeCount(item, userRole) {
        switch (item.id) {
            case 'messages':
                return this.getUnreadMessagesCount(userRole);
            case 'verifications':
                return this.getPendingVerificationsCount();
            case 'applications':
                return this.getNewApplicationsCount(userRole);
            default:
                return 0;
        }
    }

    getUnreadMessagesCount(userRole) {
        const conversations = JSON.parse(localStorage.getItem('conversations') || '[]');
        const userId = this.currentUser.id;
        
        if (userRole === 'client') {
            return conversations
                .filter(conv => conv.clientId === userId)
                .reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
        } else if (userRole === 'freelancer') {
            return conversations
                .filter(conv => conv.freelancerId === userId)
                .reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
        }
        
        return 0;
    }

    getPendingVerificationsCount() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        return users.filter(u => u.role === 'freelancer' && !u.verified).length;
    }

    getNewApplicationsCount(userRole) {
        if (userRole !== 'client') return 0;

        const jobs = JSON.parse(localStorage.getItem('jobs') || '[]')
            .filter(job => job.clientId === this.currentUser.id);
        
        const newApplications = JSON.parse(localStorage.getItem('appliedJobs') || '[]')
            .filter(app => {
                const job = jobs.find(j => j.id === app.jobId);
                return job && app.status === 'pending' && 
                       new Date(app.appliedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000);
            });
        
        return newApplications.length;
    }

    getActionIcon(item) {
        if (this.config.utils.isComingSoon(item)) {
            return 'fas fa-clock';
        }
        
        const iconMap = {
            'dashboard': 'fas fa-arrow-right',
            'post-job': 'fas fa-briefcase',
            'browse-talent': 'fas fa-users',
            'find-jobs': 'fas fa-briefcase',
            'messages': 'fas fa-comment',
            'profile': 'fas fa-edit',
            'settings': 'fas fa-sliders-h'
        };
        
        return iconMap[item.id] || 'fas fa-arrow-right';
    }

    getActionText(item) {
        if (this.config.utils.isComingSoon(item)) {
            return 'Coming Soon';
        }
        
        const textMap = {
            'dashboard': 'Go to Dashboard',
            'post-job': 'Post New Job',
            'browse-talent': 'Browse Talent',
            'find-jobs': 'Browse Jobs',
            'messages': 'Open Messages',
            'profile': 'Edit Profile',
            'settings': 'Manage Settings'
        };
        
        return textMap[item.id] || 'Open';
    }

    getUsageStats(item) {
        if (!this.config.settings.enableAnalytics) return '';
        
        const usage = JSON.parse(localStorage.getItem('menuUsage') || '{}');
        const key = `${item.url}_${item.label}`;
        const count = usage[key] || 0;
        
        if (count === 0) return '';
        
        return `
            <div class="text-xs text-gray-500 mt-2">
                Used ${count} time${count !== 1 ? 's' : ''}
            </div>
        `;
    }

    renderQuickActions(userRole) {
        const container = document.querySelector('.quick-actions, [data-quick-actions]');
        if (!container) return;

        const actions = this.config.utils.getQuickActions(userRole);
        
        container.innerHTML = actions.map(action => `
            <a href="${action.url}" 
               class="inline-flex items-center px-6 py-3 ${action.class} font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl"
               data-menu-action="${action.label}">
                <i class="${action.icon} mr-2"></i>${action.label}
            </a>
        `).join('');
    }

    renderBreadcrumbs() {
        const container = document.querySelector('.breadcrumbs, [data-breadcrumbs]');
        if (!container) return;

        const currentPage = this.getCurrentPage();
        const breadcrumbs = this.config.utils.getBreadcrumbs(currentPage);
        
        if (breadcrumbs.length === 0) return;
        
        container.innerHTML = breadcrumbs.map((crumb, index) => `
            <span class="flex items-center">
                ${index > 0 ? '<i class="fas fa-chevron-right mx-2 text-gray-400"></i>' : ''}
                ${crumb.url ? 
                    `<a href="${crumb.url}" class="text-indigo-600 hover:text-indigo-800">${crumb.label}</a>` :
                    `<span class="text-gray-500">${crumb.label}</span>`
                }
            </span>
        `).join('');
    }

    renderCategoryHeaders() {
        const categories = ['core', 'account', 'career', 'tools', 'analytics', 'system'];
        
        categories.forEach(categoryId => {
            const header = document.querySelector(`[data-category-header="${categoryId}"]`);
            if (!header) return;
            
            const config = this.config.utils.getCategoryConfig(categoryId);
            if (!config.label) return;
            
            header.innerHTML = `
                <h2 class="text-xl font-bold flex items-center">
                    <i class="${config.icon} mr-3"></i>${config.label}
                </h2>
                <p class="text-blue-100 text-sm mt-1">${config.description}</p>
            `;
        });
    }

    renderStats(userRole) {
        const statsContainer = document.querySelector('.stats-grid, [data-stats]');
        if (!statsContainer) return;

        const stats = this.getStatsForRole(userRole);
        
        statsContainer.innerHTML = stats.map(stat => `
            <div class="text-center p-4 bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100 rounded-xl">
                <div class="text-3xl font-bold text-${stat.color}-600 mb-2" id="${stat.id}">0</div>
                <div class="text-sm text-gray-600">${stat.label}</div>
            </div>
        `).join('');

        // Animate counters
        setTimeout(() => {
            stats.forEach(stat => {
                this.animateCounter(stat.id, stat.value);
            });
        }, 500);
    }

    getStatsForRole(userRole) {
        const userId = this.currentUser.id;
        
        switch (userRole) {
            case 'client':
                return this.getClientStats(userId);
            case 'freelancer':
                return this.getFreelancerStats(userId);
            case 'admin':
                return this.getAdminStats();
            default:
                return [];
        }
    }

    getClientStats(clientId) {
        const jobs = JSON.parse(localStorage.getItem('jobs') || '[]')
            .filter(job => job.clientId === clientId);
        
        const applications = JSON.parse(localStorage.getItem('appliedJobs') || '[]')
            .filter(app => jobs.some(job => job.id === app.jobId));
        
        const hired = applications.filter(app => app.status === 'accepted');
        const totalSpent = hired.reduce((sum, hire) => {
            const job = jobs.find(j => j.id === hire.jobId);
            return sum + (job ? parseInt(job.salary) || 0 : 0);
        }, 0);

        return [
            { id: 'totalJobs', label: 'Jobs Posted', value: jobs.length, color: 'indigo' },
            { id: 'totalApplications', label: 'Applications Received', value: applications.length, color: 'emerald' },
            { id: 'totalHired', label: 'Freelancers Hired', value: hired.length, color: 'violet' },
            { id: 'totalSpent', label: 'Total Spent', value: totalSpent, color: 'amber', prefix: '$' }
        ];
    }

    getFreelancerStats(freelancerId) {
        const applications = JSON.parse(localStorage.getItem('appliedJobs') || '[]')
            .filter(app => app.freelancerId === freelancerId);
        
        const activeProjects = applications.filter(app => app.status === 'accepted').length;
        const totalEarnings = activeProjects * 400000;
        const profileViews = Math.floor(Math.random() * 200) + 50;

        return [
            { id: 'totalApplications', label: 'Applications Sent', value: applications.length, color: 'indigo' },
            { id: 'activeProjects', label: 'Active Projects', value: activeProjects, color: 'emerald' },
            { id: 'totalEarnings', label: 'Total Earnings', value: totalEarnings, color: 'violet', prefix: 'RWF ' },
            { id: 'profileViews', label: 'Profile Views', value: profileViews, color: 'amber' }
        ];
    }

    getAdminStats() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        const applications = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
        const pendingVerifications = users.filter(u => u.role === 'freelancer' && !u.verified).length;

        return [
            { id: 'totalUsers', label: 'Total Users', value: users.length, color: 'indigo' },
            { id: 'totalJobs', label: 'Active Jobs', value: jobs.length, color: 'emerald' },
            { id: 'totalApplications', label: 'Applications', value: applications.length, color: 'violet' },
            { id: 'pendingVerifications', label: 'Pending Verifications', value: pendingVerifications, color: 'amber' }
        ];
    }

    animateCounter(elementId, targetValue, prefix = '') {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        let currentValue = 0;
        const increment = Math.max(1, targetValue / 30);
        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= targetValue) {
                currentValue = targetValue;
                clearInterval(timer);
            }
            element.textContent = prefix + Math.floor(currentValue).toLocaleString();
        }, 50);
    }

    setupEventListeners() {
        // Track menu interactions
        document.addEventListener('click', (e) => {
            const menuItem = e.target.closest('[data-menu-item]');
            if (menuItem) {
                this.trackMenuClick(menuItem.dataset.menuItem);
            }
            
            const menuAction = e.target.closest('[data-menu-action]');
            if (menuAction) {
                this.trackMenuAction(menuAction.dataset.menuAction);
            }
        });
    }

    trackMenuClick(itemId) {
        if (!this.config.settings.enableAnalytics) return;
        
        const usage = JSON.parse(localStorage.getItem('menuUsage') || '{}');
        usage[itemId] = (usage[itemId] || 0) + 1;
        localStorage.setItem('menuUsage', JSON.stringify(usage));
    }

    trackMenuAction(actionLabel) {
        if (!this.config.settings.enableAnalytics) return;
        
        const actions = JSON.parse(localStorage.getItem('menuActions') || '{}');
        actions[actionLabel] = (actions[actionLabel] || 0) + 1;
        localStorage.setItem('menuActions', JSON.stringify(actions));
    }

    getCurrentPage() {
        return window.location.pathname.split('/').pop() || 'index.html';
    }

    // Public methods for external use
    refresh() {
        this.loadUserSession();
        this.renderMenus();
    }

    updateBadges() {
        if (!this.currentUser) return;
        
        const userRole = this.currentUser.role;
        const menuItems = document.querySelectorAll('[data-menu-item]');
        
        menuItems.forEach(item => {
            const itemId = item.dataset.menuItem;
            const menuConfig = this.config.utils.getAllMenuItems(userRole)
                .find(config => config.id === itemId);
            
            if (menuConfig && this.config.utils.shouldShowBadge(menuConfig)) {
                const existingBadge = item.querySelector('.absolute');
                if (existingBadge) {
                    existingBadge.remove();
                }
                
                const badgeHtml = this.getBadgeHtml(menuConfig, userRole);
                if (badgeHtml) {
                    const iconContainer = item.querySelector('.relative');
                    if (iconContainer) {
                        iconContainer.insertAdjacentHTML('beforeend', badgeHtml);
                    }
                }
            }
        });
    }

    showComingSoon(feature) {
        if (typeof showNotification === 'function') {
            showNotification(`${feature} feature coming soon!`, 'info');
        } else {
            alert(`${feature} feature coming soon!`);
        }
    }
}

// Initialize menu renderer
let menuRenderer;

document.addEventListener('DOMContentLoaded', function() {
    // Wait for MenuConfig to be available
    if (typeof window.MenuConfig !== 'undefined') {
        menuRenderer = new MenuRenderer();
    } else {
        // Retry after a short delay
        setTimeout(() => {
            if (typeof window.MenuConfig !== 'undefined') {
                menuRenderer = new MenuRenderer();
            }
        }, 100);
    }
});

// Make renderer globally available
window.MenuRenderer = MenuRenderer;
window.menuRenderer = menuRenderer;

// Global function for coming soon features
window.showComingSoon = function(feature) {
    if (menuRenderer) {
        menuRenderer.showComingSoon(feature);
    } else if (typeof showNotification === 'function') {
        showNotification(`${feature} feature coming soon!`, 'info');
    } else {
        alert(`${feature} feature coming soon!`);
    }
};