/**
 * Rwanda SkillsConnect - Menu Integration
 * Integrates menu system with existing pages
 */

class MenuIntegration {
    constructor() {
        this.init();
    }

    init() {
        this.integrateWithExistingPages();
        this.enhanceNavigationMenus();
        this.addMenuLinksToPages();
        this.setupGlobalMenuFeatures();
    }

    integrateWithExistingPages() {
        const currentPage = this.getCurrentPage();
        
        // Add menu links to dashboard pages
        if (currentPage.includes('dashboard.html')) {
            this.addMenuButtonToDashboard();
        }
        
        // Add menu navigation to all pages
        this.enhancePageNavigation();
        
        // Add quick menu access
        this.addQuickMenuAccess();
    }

    addMenuButtonToDashboard() {
        const session = JSON.parse(localStorage.getItem('userSession') || 'null');
        if (!session) return;

        const menuUrl = this.getMenuUrlForRole(session.role);
        if (!menuUrl) return;

        // Add menu button to dashboard header
        const headerActions = document.querySelector('.header-actions, .dashboard-actions, .flex.items-center.space-x-4');
        if (headerActions) {
            const menuButton = document.createElement('a');
            menuButton.href = menuUrl;
            menuButton.className = 'inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors';
            menuButton.innerHTML = '<i class="fas fa-th-large mr-2"></i>Menu';
            
            headerActions.appendChild(menuButton);
        }

        // Add menu card to dashboard if there's a grid
        const dashboardGrid = document.querySelector('.grid');
        if (dashboardGrid) {
            const menuCard = document.createElement('div');
            menuCard.className = 'bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer';
            menuCard.onclick = () => window.location.href = menuUrl;
            menuCard.innerHTML = `
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <i class="fas fa-th-large text-indigo-600 text-xl"></i>
                    </div>
                    <i class="fas fa-arrow-right text-gray-400"></i>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Menu</h3>
                <p class="text-gray-600 text-sm">Access all features and tools</p>
            `;
            
            dashboardGrid.appendChild(menuCard);
        }
    }

    enhancePageNavigation() {
        const session = JSON.parse(localStorage.getItem('userSession') || 'null');
        if (!session) return;

        // Add menu link to main navigation
        const navMenus = document.querySelectorAll('nav, .navigation, .nav-links');
        navMenus.forEach(nav => {
            const menuUrl = this.getMenuUrlForRole(session.role);
            if (!menuUrl) return;

            // Check if menu link already exists
            if (nav.querySelector(`a[href="${menuUrl}"]`)) return;

            const menuLink = document.createElement('a');
            menuLink.href = menuUrl;
            menuLink.className = 'nav-link text-gray-600 hover:text-indigo-600';
            menuLink.textContent = 'Menu';
            
            nav.appendChild(menuLink);
        });
    }

    addQuickMenuAccess() {
        const session = JSON.parse(localStorage.getItem('userSession') || 'null');
        if (!session) return;

        // Add floating menu button for non-menu pages
        const currentPage = this.getCurrentPage();
        if (currentPage.includes('menu.html')) return;

        const menuUrl = this.getMenuUrlForRole(session.role);
        if (!menuUrl) return;

        const floatingButton = document.createElement('div');
        floatingButton.className = 'fixed bottom-6 left-6 z-50';
        floatingButton.innerHTML = `
            <a href="${menuUrl}" 
               class="flex items-center justify-center w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:scale-110"
               title="Open Menu">
                <i class="fas fa-th-large text-xl"></i>
            </a>
        `;
        
        document.body.appendChild(floatingButton);
    }

    enhanceNavigationMenus() {
        // Enhance existing navigation with menu system features
        this.addNavigationBadges();
        this.addNavigationTooltips();
        this.improveNavigationAccessibility();
    }

    addNavigationBadges() {
        const session = JSON.parse(localStorage.getItem('userSession') || 'null');
        if (!session) return;

        // Add badges to navigation links
        const messageLinks = document.querySelectorAll('a[href*="messages"]');
        messageLinks.forEach(link => {
            const unreadCount = this.getUnreadMessagesCount(session);
            if (unreadCount > 0) {
                this.addBadgeToElement(link, unreadCount);
            }
        });

        // Add badges for admin verification links
        if (session.role === 'admin') {
            const verificationLinks = document.querySelectorAll('a[href*="verification"], a[href*="#verifications"]');
            verificationLinks.forEach(link => {
                const pendingCount = this.getPendingVerificationsCount();
                if (pendingCount > 0) {
                    this.addBadgeToElement(link, pendingCount);
                }
            });
        }
    }

    addBadgeToElement(element, count) {
        // Remove existing badge
        const existingBadge = element.querySelector('.nav-badge');
        if (existingBadge) {
            existingBadge.remove();
        }

        // Add new badge
        const badge = document.createElement('span');
        badge.className = 'nav-badge absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold';
        badge.textContent = count > 99 ? '99+' : count;
        
        element.style.position = 'relative';
        element.appendChild(badge);
    }

    addNavigationTooltips() {
        const navLinks = document.querySelectorAll('nav a, .nav-link');
        navLinks.forEach(link => {
            if (!link.title && link.textContent.trim()) {
                link.title = `Go to ${link.textContent.trim()}`;
            }
        });
    }

    improveNavigationAccessibility() {
        const navLinks = document.querySelectorAll('nav a, .nav-link');
        navLinks.forEach((link, index) => {
            // Add ARIA labels
            if (!link.getAttribute('aria-label')) {
                link.setAttribute('aria-label', `Navigation link: ${link.textContent.trim()}`);
            }
            
            // Add keyboard navigation
            link.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    link.click();
                }
            });
        });
    }

    addMenuLinksToPages() {
        const session = JSON.parse(localStorage.getItem('userSession') || 'null');
        if (!session) return;

        // Add menu links to footer
        this.addMenuLinkToFooter(session.role);
        
        // Add menu links to breadcrumbs
        this.addMenuToBreadcrumbs(session.role);
        
        // Add menu shortcuts to help sections
        this.addMenuShortcutsToHelp();
    }

    addMenuLinkToFooter(userRole) {
        const footer = document.querySelector('footer');
        if (!footer) return;

        const menuUrl = this.getMenuUrlForRole(userRole);
        if (!menuUrl) return;

        // Find or create navigation section in footer
        let footerNav = footer.querySelector('.footer-nav, .footer-links');
        if (!footerNav) {
            footerNav = document.createElement('div');
            footerNav.className = 'footer-nav';
            footer.appendChild(footerNav);
        }

        // Add menu link
        const menuLink = document.createElement('a');
        menuLink.href = menuUrl;
        menuLink.className = 'text-gray-600 hover:text-indigo-600 transition-colors';
        menuLink.textContent = 'Menu';
        
        footerNav.appendChild(menuLink);
    }

    addMenuToBreadcrumbs(userRole) {
        const breadcrumbs = document.querySelector('.breadcrumbs, .breadcrumb');
        if (!breadcrumbs) return;

        const currentPage = this.getCurrentPage();
        if (currentPage.includes('menu.html')) return;

        const menuUrl = this.getMenuUrlForRole(userRole);
        if (!menuUrl) return;

        // Add menu to breadcrumb trail
        const menuCrumb = document.createElement('span');
        menuCrumb.innerHTML = `
            <i class="fas fa-chevron-right mx-2 text-gray-400"></i>
            <a href="${menuUrl}" class="text-indigo-600 hover:text-indigo-800">Menu</a>
        `;
        
        breadcrumbs.appendChild(menuCrumb);
    }

    addMenuShortcutsToHelp() {
        const helpSections = document.querySelectorAll('.help, .shortcuts, .keyboard-shortcuts');
        helpSections.forEach(section => {
            const shortcutsInfo = document.createElement('div');
            shortcutsInfo.className = 'menu-shortcuts-info mt-4 p-4 bg-gray-50 rounded-lg';
            shortcutsInfo.innerHTML = `
                <h4 class="font-semibold text-gray-800 mb-2">Menu Shortcuts:</h4>
                <div class="text-sm text-gray-600 space-y-1">
                    <div><kbd class="px-2 py-1 bg-gray-200 rounded">Ctrl+M</kbd> Open Menu</div>
                    <div><kbd class="px-2 py-1 bg-gray-200 rounded">Ctrl+D</kbd> Dashboard</div>
                    <div><kbd class="px-2 py-1 bg-gray-200 rounded">Ctrl+/</kbd> Search</div>
                </div>
            `;
            
            section.appendChild(shortcutsInfo);
        });
    }

    setupGlobalMenuFeatures() {
        // Add global keyboard shortcuts
        this.setupGlobalShortcuts();
        
        // Add global search functionality
        this.setupGlobalSearch();
        
        // Add global menu state synchronization
        this.setupMenuStatSync();
    }

    setupGlobalShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                const session = JSON.parse(localStorage.getItem('userSession') || 'null');
                if (!session) return;

                switch(e.key.toLowerCase()) {
                    case 'm':
                        e.preventDefault();
                        const menuUrl = this.getMenuUrlForRole(session.role);
                        if (menuUrl) window.location.href = menuUrl;
                        break;
                    case 'd':
                        e.preventDefault();
                        const dashboardUrl = this.getDashboardUrlForRole(session.role);
                        if (dashboardUrl) window.location.href = dashboardUrl;
                        break;
                }
            }
        });
    }

    setupGlobalSearch() {
        // Add global search functionality (Ctrl+/)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                
                // Focus existing search input or create modal search
                const searchInput = document.querySelector('#menuSearch, #globalSearch, input[type="search"]');
                if (searchInput) {
                    searchInput.focus();
                } else {
                    this.createGlobalSearchModal();
                }
            }
        });
    }

    createGlobalSearchModal() {
        const session = JSON.parse(localStorage.getItem('userSession') || 'null');
        if (!session) return;

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 class="text-lg font-semibold mb-4">Quick Search</h3>
                <input type="text" 
                       id="globalSearchInput" 
                       placeholder="Search menu items..." 
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                <div id="globalSearchResults" class="mt-4 max-h-60 overflow-y-auto"></div>
                <div class="mt-4 flex justify-end">
                    <button onclick="this.closest('.fixed').remove()" 
                            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                        Close
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const searchInput = modal.querySelector('#globalSearchInput');
        const searchResults = modal.querySelector('#globalSearchResults');
        
        searchInput.focus();
        
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (query.length < 2) {
                searchResults.innerHTML = '';
                return;
            }
            
            const results = this.searchMenuItems(session.role, query);
            this.renderSearchResults(results, searchResults);
        });
        
        // Close on escape
        document.addEventListener('keydown', function escapeHandler(e) {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', escapeHandler);
            }
        });
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    searchMenuItems(userRole, query) {
        if (typeof window.MenuConfig === 'undefined') return [];
        
        return window.MenuConfig.utils.searchMenuItems(userRole, query);
    }

    renderSearchResults(results, container) {
        if (results.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-sm">No results found</p>';
            return;
        }
        
        container.innerHTML = results.map(item => `
            <div class="p-2 hover:bg-gray-50 cursor-pointer rounded" 
                 onclick="window.location.href='${item.url}'">
                <div class="flex items-center space-x-3">
                    <i class="${item.icon} text-indigo-600"></i>
                    <div>
                        <div class="font-medium">${item.label}</div>
                        <div class="text-sm text-gray-500">${item.description}</div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    setupMenuStatSync() {
        // Synchronize menu state across tabs
        window.addEventListener('storage', (e) => {
            if (e.key === 'userSession') {
                // Reload page if user session changes
                window.location.reload();
            }
            
            if (e.key === 'menuUsage') {
                // Update menu usage indicators
                this.updateUsageIndicators();
            }
        });
    }

    updateUsageIndicators() {
        const usage = JSON.parse(localStorage.getItem('menuUsage') || '{}');
        
        // Add usage indicators to navigation links
        document.querySelectorAll('nav a, .nav-link').forEach(link => {
            const href = link.getAttribute('href');
            const text = link.textContent.trim();
            const key = `${href}_${text}`;
            const count = usage[key] || 0;
            
            if (count > 0) {
                let indicator = link.querySelector('.usage-indicator');
                if (!indicator) {
                    indicator = document.createElement('span');
                    indicator.className = 'usage-indicator text-xs text-gray-400 ml-1';
                    link.appendChild(indicator);
                }
                indicator.textContent = `(${count})`;
            }
        });
    }

    // Utility methods
    getCurrentPage() {
        return window.location.pathname.split('/').pop() || 'index.html';
    }

    getMenuUrlForRole(role) {
        const menuUrls = {
            client: 'client-menu.html',
            freelancer: 'freelancer-menu.html',
            admin: 'admin-menu.html'
        };
        return menuUrls[role] || null;
    }

    getDashboardUrlForRole(role) {
        const dashboardUrls = {
            client: 'client-dashboard.html',
            freelancer: 'freelancer-dashboard.html',
            admin: 'admin-dashboard.html'
        };
        return dashboardUrls[role] || 'index.html';
    }

    getUnreadMessagesCount(session) {
        const conversations = JSON.parse(localStorage.getItem('conversations') || '[]');
        const userId = session.id;
        const userRole = session.role;
        
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
}

// Initialize menu integration
document.addEventListener('DOMContentLoaded', function() {
    new MenuIntegration();
});

// Export for global access
window.MenuIntegration = MenuIntegration;