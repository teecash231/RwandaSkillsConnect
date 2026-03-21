/**
 * Rwanda SkillsConnect - Menu Management System
 * Handles all menu functionality and interconnections
 */

class MenuManager {
    constructor() {
        this.currentUser = null;
        this.menuItems = new Map();
        this.init();
    }

    init() {
        this.loadUserSession();
        this.initializeMenuItems();
        this.setupEventListeners();
        this.updateMenuVisibility();
    }

    loadUserSession() {
        this.currentUser = JSON.parse(localStorage.getItem('userSession') || 'null');
    }

    initializeMenuItems() {
        // Define all menu items with role-based access
        const menuConfig = {
            // Common items
            dashboard: {
                label: 'Dashboard',
                icon: 'fas fa-tachometer-alt',
                roles: ['client', 'freelancer', 'admin'],
                urls: {
                    client: 'client-dashboard.html',
                    freelancer: 'freelancer-dashboard.html',
                    admin: 'admin-dashboard.html'
                }
            },
            
            // Client-specific items
            postJob: {
                label: 'Post Job',
                icon: 'fas fa-plus-circle',
                roles: ['client'],
                urls: { client: 'post-job.html' }
            },
            browseTalent: {
                label: 'Browse Talent',
                icon: 'fas fa-users',
                roles: ['client'],
                urls: { client: 'browse.html' }
            },
            clientMessages: {
                label: 'Messages',
                icon: 'fas fa-envelope',
                roles: ['client'],
                urls: { client: 'client-messages.html' }
            },
            clientProfile: {
                label: 'Profile',
                icon: 'fas fa-user',
                roles: ['client'],
                urls: { client: 'client-profile.html' }
            },
            clientSettings: {
                label: 'Settings',
                icon: 'fas fa-cog',
                roles: ['client'],
                urls: { client: 'client-settings.html' }
            },
            
            // Freelancer-specific items
            findJobs: {
                label: 'Find Jobs',
                icon: 'fas fa-search',
                roles: ['freelancer'],
                urls: { freelancer: 'browse.html' }
            },
            jobMap: {
                label: 'Job Map',
                icon: 'fas fa-map-marked-alt',
                roles: ['freelancer'],
                urls: { freelancer: 'map.html' }
            },
            freelancerMessages: {
                label: 'Messages',
                icon: 'fas fa-envelope',
                roles: ['freelancer'],
                urls: { freelancer: 'freelancer-messages.html' }
            },
            freelancerProfile: {
                label: 'Profile',
                icon: 'fas fa-user',
                roles: ['freelancer'],
                urls: { freelancer: 'profile.html' }
            },
            
            // Admin-specific items
            userManagement: {
                label: 'User Management',
                icon: 'fas fa-users-cog',
                roles: ['admin'],
                urls: { admin: 'admin-dashboard.html#users' }
            },
            jobManagement: {
                label: 'Job Management',
                icon: 'fas fa-briefcase',
                roles: ['admin'],
                urls: { admin: 'admin-dashboard.html#jobs' }
            },
            adminSettings: {
                label: 'Settings',
                icon: 'fas fa-cog',
                roles: ['admin'],
                urls: { admin: 'admin-settings.html' }
            },
            
            // Shared items
            talentMap: {
                label: 'Talent Map',
                icon: 'fas fa-map-marked-alt',
                roles: ['client'],
                urls: { client: 'map.html' }
            }
        };

        // Store menu items
        Object.keys(menuConfig).forEach(key => {
            this.menuItems.set(key, menuConfig[key]);
        });
    }

    setupEventListeners() {
        // Mobile menu toggles
        document.addEventListener('click', (e) => {
            if (e.target.matches('#mobileMenuBtn, #mobileMenuBtn *')) {
                this.toggleMobileMenu();
            }
            
            if (e.target.matches('#userMenuBtn, #userMenuBtn *')) {
                this.toggleUserMenu();
            }
            
            // Close menus when clicking outside
            if (!e.target.closest('#mobileMenu') && !e.target.closest('#mobileMenuBtn')) {
                this.closeMobileMenu();
            }
            
            if (!e.target.closest('#userDropdown') && !e.target.closest('#userMenuBtn')) {
                this.closeUserMenu();
            }
        });

        // Logout functionality
        document.addEventListener('click', (e) => {
            if (e.target.matches('#logoutBtn, .logout-btn')) {
                e.preventDefault();
                this.handleLogout();
            }
        });

        // Menu navigation
        document.addEventListener('click', (e) => {
            const menuLink = e.target.closest('[data-menu-item]');
            if (menuLink) {
                const itemKey = menuLink.dataset.menuItem;
                this.navigateToMenuItem(itemKey);
            }
        });
    }

    updateMenuVisibility() {
        if (!this.currentUser) return;

        const userRole = this.currentUser.role;
        
        // Update navigation menus
        this.updateNavigationMenu(userRole);
        this.updateUserDropdown();
        this.updateMobileMenu(userRole);
        this.updateQuickActions(userRole);
    }

    updateNavigationMenu(userRole) {
        const navContainer = document.querySelector('nav .hidden.md\\:flex, nav .md\\:flex');
        if (!navContainer) return;

        const menuItems = this.getMenuItemsForRole(userRole);
        const currentPage = this.getCurrentPage();
        
        navContainer.innerHTML = menuItems.map(item => {
            const url = item.urls[userRole];
            const isActive = this.isCurrentPage(url, currentPage);
            
            return `
                <a href="${url}" 
                   class="nav-link text-gray-600 hover:text-indigo-600 ${isActive ? 'text-indigo-600 font-medium' : ''}"
                   data-menu-item="${item.key}">
                    ${item.label}
                </a>
            `;
        }).join('');
    }

    updateUserDropdown() {
        const dropdown = document.getElementById('userDropdown');
        if (!dropdown) return;

        const userRole = this.currentUser.role;
        const userName = this.currentUser.name || this.currentUser.fullName || 'User';
        const userEmail = this.currentUser.email || 'user@example.com';

        // Update user info
        const dropdownUserName = document.getElementById('dropdownUserName');
        const dropdownUserEmail = document.getElementById('dropdownUserEmail');
        
        if (dropdownUserName) dropdownUserName.textContent = userName;
        if (dropdownUserEmail) dropdownUserEmail.textContent = userEmail;

        // Update dropdown menu items
        const dropdownMenu = dropdown.querySelector('.py-2');
        if (dropdownMenu) {
            const menuItems = this.getDropdownMenuItems(userRole);
            
            dropdownMenu.innerHTML = menuItems.map(item => `
                <a href="${item.url}" 
                   class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                   data-menu-item="${item.key}">
                    <i class="${item.icon} mr-2"></i>${item.label}
                </a>
            `).join('') + `
                <hr class="my-2">
                <button id="logoutBtn" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    <i class="fas fa-sign-out-alt mr-2"></i>Logout
                </button>
            `;
        }
    }

    updateMobileMenu(userRole) {
        const mobileMenu = document.getElementById('mobileMenu');
        if (!mobileMenu) return;

        const menuItems = this.getMenuItemsForRole(userRole);
        
        mobileMenu.innerHTML = `
            <div class="px-2 pt-2 pb-3 space-y-1">
                ${menuItems.map(item => {
                    const url = item.urls[userRole];
                    return `
                        <a href="${url}" 
                           class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md"
                           data-menu-item="${item.key}">
                            <i class="${item.icon} mr-2"></i>${item.label}
                        </a>
                    `;
                }).join('')}
            </div>
        `;
    }

    updateQuickActions(userRole) {
        // Update quick action buttons based on role
        const quickActionContainers = document.querySelectorAll('.quick-actions, [data-quick-actions]');
        
        quickActionContainers.forEach(container => {
            const actions = this.getQuickActionsForRole(userRole);
            
            container.innerHTML = actions.map(action => `
                <a href="${action.url}" 
                   class="inline-flex items-center px-6 py-3 ${action.class} font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl"
                   data-menu-item="${action.key}">
                    <i class="${action.icon} mr-2"></i>${action.label}
                </a>
            `).join('');
        });
    }

    getMenuItemsForRole(role) {
        const items = [];
        
        this.menuItems.forEach((item, key) => {
            if (item.roles.includes(role)) {
                items.push({ ...item, key });
            }
        });
        
        return items;
    }

    getDropdownMenuItems(role) {
        const commonItems = [
            { key: 'dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt', url: this.getDashboardUrl(role) }
        ];

        const roleSpecificItems = {
            client: [
                { key: 'clientProfile', label: 'Profile', icon: 'fas fa-user', url: 'client-profile.html' },
                { key: 'clientSettings', label: 'Settings', icon: 'fas fa-cog', url: 'client-settings.html' }
            ],
            freelancer: [
                { key: 'freelancerProfile', label: 'Profile', icon: 'fas fa-user', url: 'profile.html' }
            ],
            admin: [
                { key: 'adminSettings', label: 'Settings', icon: 'fas fa-cog', url: 'admin-settings.html' }
            ]
        };

        return [...commonItems, ...(roleSpecificItems[role] || [])];
    }

    getQuickActionsForRole(role) {
        const actions = {
            client: [
                {
                    key: 'postJob',
                    label: 'Post Your First Job',
                    icon: 'fas fa-plus',
                    url: 'post-job.html',
                    class: 'bg-indigo-600 text-white hover:bg-indigo-700'
                },
                {
                    key: 'browseTalent',
                    label: 'Browse Talent Now',
                    icon: 'fas fa-search',
                    url: 'browse.html',
                    class: 'bg-green-600 text-white hover:bg-green-700'
                }
            ],
            freelancer: [
                {
                    key: 'findJobs',
                    label: 'Find Jobs Now',
                    icon: 'fas fa-search',
                    url: 'browse.html',
                    class: 'bg-indigo-600 text-white hover:bg-indigo-700'
                },
                {
                    key: 'freelancerProfile',
                    label: 'Complete Profile',
                    icon: 'fas fa-user-edit',
                    url: 'profile.html',
                    class: 'bg-green-600 text-white hover:bg-green-700'
                }
            ],
            admin: [
                {
                    key: 'userManagement',
                    label: 'Manage Users',
                    icon: 'fas fa-users-cog',
                    url: 'admin-dashboard.html#users',
                    class: 'bg-indigo-600 text-white hover:bg-indigo-700'
                },
                {
                    key: 'jobManagement',
                    label: 'Manage Jobs',
                    icon: 'fas fa-briefcase',
                    url: 'admin-dashboard.html#jobs',
                    class: 'bg-green-600 text-white hover:bg-green-700'
                }
            ]
        };

        return actions[role] || [];
    }

    toggleMobileMenu() {
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu) {
            mobileMenu.classList.toggle('hidden');
        }
    }

    closeMobileMenu() {
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu) {
            mobileMenu.classList.add('hidden');
        }
    }

    toggleUserMenu() {
        const userDropdown = document.getElementById('userDropdown');
        if (userDropdown) {
            userDropdown.classList.toggle('hidden');
        }
    }

    closeUserMenu() {
        const userDropdown = document.getElementById('userDropdown');
        if (userDropdown) {
            userDropdown.classList.add('hidden');
        }
    }

    navigateToMenuItem(itemKey) {
        const item = this.menuItems.get(itemKey);
        if (!item || !this.currentUser) return;

        const userRole = this.currentUser.role;
        const url = item.urls[userRole];
        
        if (url) {
            window.location.href = url;
        }
    }

    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('userSession');
            this.showNotification('Logged out successfully!', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        }
    }

    getDashboardUrl(role) {
        const dashboardUrls = {
            client: 'client-dashboard.html',
            freelancer: 'freelancer-dashboard.html',
            admin: 'admin-dashboard.html'
        };
        return dashboardUrls[role] || 'index.html';
    }

    getCurrentPage() {
        return window.location.pathname.split('/').pop() || 'index.html';
    }

    isCurrentPage(url, currentPage) {
        if (!url) return false;
        const urlPage = url.split('#')[0].split('/').pop();
        return urlPage === currentPage;
    }

    showNotification(message, type = 'success', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
        
        const colors = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            warning: 'bg-yellow-500 text-white',
            info: 'bg-blue-500 text-white'
        };
        
        notification.className += ` ${colors[type] || colors.success}`;
        
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-white hover:text-gray-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.remove('translate-x-full'), 100);
        
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    // Menu statistics and analytics
    updateMenuStats() {
        if (!this.currentUser) return;

        const userRole = this.currentUser.role;
        const userId = this.currentUser.id;

        switch (userRole) {
            case 'client':
                this.updateClientMenuStats(userId);
                break;
            case 'freelancer':
                this.updateFreelancerMenuStats(userId);
                break;
            case 'admin':
                this.updateAdminMenuStats();
                break;
        }
    }

    updateClientMenuStats(clientId) {
        const jobs = JSON.parse(localStorage.getItem('jobs') || '[]')
            .filter(job => job.clientId === clientId);
        
        const applications = JSON.parse(localStorage.getItem('appliedJobs') || '[]')
            .filter(app => jobs.some(job => job.id === app.jobId));
        
        const hired = applications.filter(app => app.status === 'accepted');
        const totalSpent = hired.reduce((sum, hire) => {
            const job = jobs.find(j => j.id === hire.jobId);
            return sum + (job ? parseInt(job.salary) || 0 : 0);
        }, 0);

        this.animateCounter('totalJobs', jobs.length);
        this.animateCounter('totalApplications', applications.length);
        this.animateCounter('totalHired', hired.length);
        
        setTimeout(() => {
            const totalSpentEl = document.getElementById('totalSpent');
            if (totalSpentEl) {
                totalSpentEl.textContent = `$${totalSpent.toLocaleString()}`;
            }
        }, 500);
    }

    updateFreelancerMenuStats(freelancerId) {
        const applications = JSON.parse(localStorage.getItem('appliedJobs') || '[]')
            .filter(app => app.freelancerId === freelancerId);
        
        const activeProjects = applications.filter(app => app.status === 'accepted').length;
        const totalEarnings = activeProjects * 400000;
        const profileViews = Math.floor(Math.random() * 200) + 50;

        this.animateCounter('totalApplications', applications.length);
        this.animateCounter('activeProjects', activeProjects);
        this.animateCounter('profileViews', profileViews);
        
        setTimeout(() => {
            const totalEarningsEl = document.getElementById('totalEarnings');
            if (totalEarningsEl) {
                totalEarningsEl.textContent = `RWF ${totalEarnings.toLocaleString()}`;
            }
        }, 500);
    }

    updateAdminMenuStats() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        const applications = JSON.parse(localStorage.getItem('appliedJobs') || '[]');

        this.animateCounter('totalUsers', users.length);
        this.animateCounter('totalJobs', jobs.length);
        this.animateCounter('totalApplications', applications.length);
        this.animateCounter('pendingVerifications', users.filter(u => !u.verified).length);
    }

    animateCounter(elementId, targetValue) {
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
            element.textContent = Math.floor(currentValue);
        }, 50);
    }

    // Menu interconnection methods
    interconnectMenus() {
        this.addBreadcrumbs();
        this.addQuickNavigation();
        this.syncMenuStates();
    }

    addBreadcrumbs() {
        const breadcrumbContainer = document.querySelector('.breadcrumbs, [data-breadcrumbs]');
        if (!breadcrumbContainer) return;

        const currentPage = this.getCurrentPage();
        const breadcrumbs = this.generateBreadcrumbs(currentPage);
        
        breadcrumbContainer.innerHTML = breadcrumbs.map((crumb, index) => `
            <span class="flex items-center">
                ${index > 0 ? '<i class="fas fa-chevron-right mx-2 text-gray-400"></i>' : ''}
                ${crumb.url ? 
                    `<a href="${crumb.url}" class="text-indigo-600 hover:text-indigo-800">${crumb.label}</a>` :
                    `<span class="text-gray-500">${crumb.label}</span>`
                }
            </span>
        `).join('');
    }

    generateBreadcrumbs(currentPage) {
        const breadcrumbMap = {
            'client-dashboard.html': [
                { label: 'Home', url: 'index.html' },
                { label: 'Client Dashboard', url: null }
            ],
            'freelancer-dashboard.html': [
                { label: 'Home', url: 'index.html' },
                { label: 'Freelancer Dashboard', url: null }
            ],
            'admin-dashboard.html': [
                { label: 'Home', url: 'index.html' },
                { label: 'Admin Dashboard', url: null }
            ],
            'client-menu.html': [
                { label: 'Home', url: 'index.html' },
                { label: 'Dashboard', url: 'client-dashboard.html' },
                { label: 'Menu', url: null }
            ],
            'freelancer-menu.html': [
                { label: 'Home', url: 'index.html' },
                { label: 'Dashboard', url: 'freelancer-dashboard.html' },
                { label: 'Menu', url: null }
            ]
        };

        return breadcrumbMap[currentPage] || [{ label: 'Home', url: 'index.html' }];
    }

    addQuickNavigation() {
        if (!this.currentUser) return;

        const quickNavContainer = document.querySelector('.quick-nav, [data-quick-nav]');
        if (!quickNavContainer) return;

        const userRole = this.currentUser.role;
        const quickNavItems = this.getQuickNavItems(userRole);
        
        quickNavContainer.innerHTML = `
            <div class="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
                ${quickNavItems.map(item => `
                    <a href="${item.url}" 
                       class="bg-${item.color}-500 text-white p-3 rounded-full shadow-lg hover:bg-${item.color}-600 transition-colors" 
                       title="${item.label}">
                        <i class="${item.icon}"></i>
                    </a>
                `).join('')}
            </div>
        `;
    }

    getQuickNavItems(role) {
        const quickNavMap = {
            client: [
                { label: 'Dashboard', icon: 'fas fa-tachometer-alt', url: 'client-dashboard.html', color: 'blue' },
                { label: 'Post Job', icon: 'fas fa-plus', url: 'post-job.html', color: 'green' },
                { label: 'Browse Talent', icon: 'fas fa-users', url: 'browse.html', color: 'purple' }
            ],
            freelancer: [
                { label: 'Dashboard', icon: 'fas fa-tachometer-alt', url: 'freelancer-dashboard.html', color: 'blue' },
                { label: 'Find Jobs', icon: 'fas fa-search', url: 'browse.html', color: 'green' },
                { label: 'Profile', icon: 'fas fa-user', url: 'profile.html', color: 'purple' }
            ],
            admin: [
                { label: 'Dashboard', icon: 'fas fa-tachometer-alt', url: 'admin-dashboard.html', color: 'blue' },
                { label: 'Users', icon: 'fas fa-users', url: 'admin-dashboard.html#users', color: 'green' },
                { label: 'Settings', icon: 'fas fa-cog', url: 'admin-settings.html', color: 'purple' }
            ]
        };

        return quickNavMap[role] || [];
    }

    syncMenuStates() {
        // Sync menu states across different components
        const currentPage = this.getCurrentPage();
        
        // Update active states
        document.querySelectorAll('[data-menu-item]').forEach(item => {
            const itemKey = item.dataset.menuItem;
            const menuItem = this.menuItems.get(itemKey);
            
            if (menuItem && this.currentUser) {
                const url = menuItem.urls[this.currentUser.role];
                if (this.isCurrentPage(url, currentPage)) {
                    item.classList.add('active', 'text-indigo-600', 'font-medium');
                }
            }
        });
    }
}

// Initialize menu manager
let menuManager;

document.addEventListener('DOMContentLoaded', function() {
    menuManager = new MenuManager();
    
    // Update menu stats if on menu pages
    const currentPage = menuManager.getCurrentPage();
    if (currentPage.includes('menu.html')) {
        setTimeout(() => {
            menuManager.updateMenuStats();
        }, 500);
    }
    
    // Add interconnection features
    menuManager.interconnectMenus();
});

// Export for global access
window.MenuManager = MenuManager;
window.menuManager = menuManager;

// Load menu integration on all pages
if (typeof document !== 'undefined') {
    const menuIntegrationScript = document.createElement('script');
    menuIntegrationScript.src = 'assets/js/menu-integration.js';
    menuIntegrationScript.async = true;
    document.head.appendChild(menuIntegrationScript);
}