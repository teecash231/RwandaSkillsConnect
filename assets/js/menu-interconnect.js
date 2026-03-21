/**
 * Rwanda SkillsConnect - Menu Interconnection System
 * Enhances menu functionality across all pages
 */

class MenuInterconnect {
    constructor() {
        this.init();
    }

    init() {
        this.setupGlobalMenuEnhancements();
        this.addMenuBadges();
        this.setupMenuSearch();
        this.addMenuShortcuts();
        this.setupMenuAnalytics();
    }

    setupGlobalMenuEnhancements() {
        // Add menu enhancement styles
        const style = document.createElement('style');
        style.textContent = `
            .menu-badge {
                position: absolute;
                top: -8px;
                right: -8px;
                background: #ef4444;
                color: white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                font-size: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
            }
            
            .menu-search {
                position: relative;
            }
            
            .menu-search-results {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                z-index: 1000;
                max-height: 300px;
                overflow-y: auto;
            }
            
            .menu-shortcut {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 1000;
            }
            
            .menu-analytics {
                font-size: 12px;
                color: #6b7280;
                margin-top: 4px;
            }
            
            .menu-notification {
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
        `;
        document.head.appendChild(style);
    }

    addMenuBadges() {
        const session = JSON.parse(localStorage.getItem('userSession') || 'null');
        if (!session) return;

        // Add notification badges to menu items
        this.addMessagesBadge(session);
        this.addApplicationsBadge(session);
        this.addVerificationsBadge(session);
    }

    addMessagesBadge(session) {
        const conversations = JSON.parse(localStorage.getItem('conversations') || '[]');
        let unreadCount = 0;

        if (session.role === 'client') {
            unreadCount = conversations
                .filter(conv => conv.clientId === session.id)
                .reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
        } else if (session.role === 'freelancer') {
            unreadCount = conversations
                .filter(conv => conv.freelancerId === session.id)
                .reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
        }

        if (unreadCount > 0) {
            const messageLinks = document.querySelectorAll('a[href*="messages.html"]');
            messageLinks.forEach(link => {
                if (!link.querySelector('.menu-badge')) {
                    const badge = document.createElement('span');
                    badge.className = 'menu-badge';
                    badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                    link.style.position = 'relative';
                    link.appendChild(badge);
                }
            });
        }
    }

    addApplicationsBadge(session) {
        if (session.role !== 'client') return;

        const jobs = JSON.parse(localStorage.getItem('jobs') || '[]')
            .filter(job => job.clientId === session.id);
        
        const newApplications = JSON.parse(localStorage.getItem('appliedJobs') || '[]')
            .filter(app => {
                const job = jobs.find(j => j.id === app.jobId);
                return job && app.status === 'pending' && 
                       new Date(app.appliedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000);
            }).length;

        if (newApplications > 0) {
            const dashboardLinks = document.querySelectorAll('a[href*="dashboard.html"]');
            dashboardLinks.forEach(link => {
                if (!link.querySelector('.menu-badge')) {
                    const badge = document.createElement('span');
                    badge.className = 'menu-badge menu-notification';
                    badge.textContent = newApplications;
                    link.style.position = 'relative';
                    link.appendChild(badge);
                }
            });
        }
    }

    addVerificationsBadge(session) {
        if (session.role !== 'admin') return;

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const pendingVerifications = users.filter(u => u.role === 'freelancer' && !u.verified).length;

        if (pendingVerifications > 0) {
            const verificationLinks = document.querySelectorAll('a[href*="verifications"], a[href*="#verifications"]');
            verificationLinks.forEach(link => {
                if (!link.querySelector('.menu-badge')) {
                    const badge = document.createElement('span');
                    badge.className = 'menu-badge';
                    badge.textContent = pendingVerifications;
                    link.style.position = 'relative';
                    link.appendChild(badge);
                }
            });
        }
    }

    setupMenuSearch() {
        // Add search functionality to menu pages
        const menuContainers = document.querySelectorAll('.menu-card');
        if (menuContainers.length === 0) return;

        const searchContainer = document.querySelector('.text-center.mb-8');
        if (!searchContainer) return;

        const searchHTML = `
            <div class="menu-search max-w-md mx-auto mt-4">
                <div class="relative">
                    <input type="text" 
                           id="menuSearch" 
                           placeholder="Search menu items..." 
                           class="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                </div>
                <div id="menuSearchResults" class="menu-search-results hidden"></div>
            </div>
        `;

        searchContainer.insertAdjacentHTML('beforeend', searchHTML);

        const searchInput = document.getElementById('menuSearch');
        const searchResults = document.getElementById('menuSearchResults');

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            if (query.length < 2) {
                searchResults.classList.add('hidden');
                this.showAllMenuCards();
                return;
            }

            this.filterMenuCards(query);
            this.showSearchSuggestions(query, searchResults);
        });

        // Close search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.menu-search')) {
                searchResults.classList.add('hidden');
            }
        });
    }

    filterMenuCards(query) {
        const menuCards = document.querySelectorAll('.menu-card');
        let visibleCount = 0;

        menuCards.forEach(card => {
            const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
            const description = card.querySelector('p')?.textContent.toLowerCase() || '';
            
            if (title.includes(query) || description.includes(query)) {
                card.style.display = 'block';
                card.classList.add('highlight-match');
                visibleCount++;
            } else {
                card.style.display = 'none';
                card.classList.remove('highlight-match');
            }
        });

        // Show no results message if needed
        this.toggleNoResultsMessage(visibleCount === 0);
    }

    showAllMenuCards() {
        const menuCards = document.querySelectorAll('.menu-card');
        menuCards.forEach(card => {
            card.style.display = 'block';
            card.classList.remove('highlight-match');
        });
        this.toggleNoResultsMessage(false);
    }

    showSearchSuggestions(query, resultsContainer) {
        const session = JSON.parse(localStorage.getItem('userSession') || 'null');
        if (!session) return;

        const suggestions = this.getMenuSuggestions(query, session.role);
        
        if (suggestions.length === 0) {
            resultsContainer.classList.add('hidden');
            return;
        }

        resultsContainer.innerHTML = suggestions.map(suggestion => `
            <div class="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0" 
                 onclick="window.location.href='${suggestion.url}'">
                <div class="flex items-center space-x-3">
                    <i class="${suggestion.icon} text-indigo-600"></i>
                    <div>
                        <div class="font-medium text-gray-900">${suggestion.title}</div>
                        <div class="text-sm text-gray-500">${suggestion.description}</div>
                    </div>
                </div>
            </div>
        `).join('');

        resultsContainer.classList.remove('hidden');
    }

    getMenuSuggestions(query, userRole) {
        const allSuggestions = {
            client: [
                { title: 'Post Job', description: 'Create a new job posting', icon: 'fas fa-plus-circle', url: 'post-job.html' },
                { title: 'Browse Talent', description: 'Find skilled freelancers', icon: 'fas fa-users', url: 'browse.html' },
                { title: 'Messages', description: 'Chat with freelancers', icon: 'fas fa-envelope', url: 'client-messages.html' },
                { title: 'Profile', description: 'Manage your profile', icon: 'fas fa-user', url: 'client-profile.html' },
                { title: 'Settings', description: 'Account settings', icon: 'fas fa-cog', url: 'client-settings.html' }
            ],
            freelancer: [
                { title: 'Find Jobs', description: 'Browse available jobs', icon: 'fas fa-search', url: 'browse.html' },
                { title: 'Job Map', description: 'Find jobs by location', icon: 'fas fa-map-marked-alt', url: 'map.html' },
                { title: 'Messages', description: 'Chat with clients', icon: 'fas fa-envelope', url: 'freelancer-messages.html' },
                { title: 'Profile', description: 'Manage your profile', icon: 'fas fa-user', url: 'profile.html' }
            ],
            admin: [
                { title: 'User Management', description: 'Manage users and roles', icon: 'fas fa-users-cog', url: 'admin-dashboard.html#users' },
                { title: 'Job Management', description: 'Oversee job postings', icon: 'fas fa-briefcase', url: 'admin-dashboard.html#jobs' },
                { title: 'Verifications', description: 'Review user verifications', icon: 'fas fa-certificate', url: 'admin-dashboard.html#verifications' },
                { title: 'Settings', description: 'System configuration', icon: 'fas fa-cog', url: 'admin-settings.html' }
            ]
        };

        const suggestions = allSuggestions[userRole] || [];
        return suggestions.filter(suggestion => 
            suggestion.title.toLowerCase().includes(query) || 
            suggestion.description.toLowerCase().includes(query)
        );
    }

    toggleNoResultsMessage(show) {
        let noResultsMsg = document.getElementById('noMenuResults');
        
        if (show && !noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.id = 'noMenuResults';
            noResultsMsg.className = 'text-center py-12 col-span-full';
            noResultsMsg.innerHTML = `
                <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <h3 class="text-lg font-medium text-gray-900 mb-2">No menu items found</h3>
                <p class="text-gray-500">Try adjusting your search terms.</p>
            `;
            
            const firstGrid = document.querySelector('.grid');
            if (firstGrid) {
                firstGrid.appendChild(noResultsMsg);
            }
        } else if (!show && noResultsMsg) {
            noResultsMsg.remove();
        }
    }

    addMenuShortcuts() {
        const session = JSON.parse(localStorage.getItem('userSession') || 'null');
        if (!session) return;

        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'd':
                        e.preventDefault();
                        this.navigateToDashboard(session.role);
                        break;
                    case 'm':
                        e.preventDefault();
                        this.navigateToMessages(session.role);
                        break;
                    case 'p':
                        e.preventDefault();
                        this.navigateToProfile(session.role);
                        break;
                    case '/':
                        e.preventDefault();
                        document.getElementById('menuSearch')?.focus();
                        break;
                }
            }
        });

        // Add shortcut hints
        this.addShortcutHints();
    }

    addShortcutHints() {
        const shortcuts = document.createElement('div');
        shortcuts.className = 'fixed bottom-4 left-4 bg-gray-800 text-white p-3 rounded-lg text-xs z-50 opacity-75 hover:opacity-100 transition-opacity';
        shortcuts.innerHTML = `
            <div class="font-semibold mb-2">Keyboard Shortcuts:</div>
            <div>Ctrl+D: Dashboard</div>
            <div>Ctrl+M: Messages</div>
            <div>Ctrl+P: Profile</div>
            <div>Ctrl+/: Search</div>
        `;
        
        // Only show on menu pages
        if (window.location.pathname.includes('menu.html')) {
            document.body.appendChild(shortcuts);
        }
    }

    navigateToDashboard(role) {
        const dashboardUrls = {
            client: 'client-dashboard.html',
            freelancer: 'freelancer-dashboard.html',
            admin: 'admin-dashboard.html'
        };
        window.location.href = dashboardUrls[role] || 'index.html';
    }

    navigateToMessages(role) {
        const messageUrls = {
            client: 'client-messages.html',
            freelancer: 'freelancer-messages.html',
            admin: 'admin-dashboard.html'
        };
        window.location.href = messageUrls[role] || 'index.html';
    }

    navigateToProfile(role) {
        const profileUrls = {
            client: 'client-profile.html',
            freelancer: 'profile.html',
            admin: 'admin-settings.html'
        };
        window.location.href = profileUrls[role] || 'index.html';
    }

    setupMenuAnalytics() {
        // Track menu usage
        this.trackMenuClicks();
        this.addUsageStats();
    }

    trackMenuClicks() {
        document.addEventListener('click', (e) => {
            const menuLink = e.target.closest('.menu-card a, nav a, .nav-link');
            if (menuLink) {
                const href = menuLink.getAttribute('href');
                const text = menuLink.textContent.trim();
                
                // Store usage data
                const usage = JSON.parse(localStorage.getItem('menuUsage') || '{}');
                const key = `${href}_${text}`;
                usage[key] = (usage[key] || 0) + 1;
                localStorage.setItem('menuUsage', JSON.stringify(usage));
            }
        });
    }

    addUsageStats() {
        const menuCards = document.querySelectorAll('.menu-card');
        const usage = JSON.parse(localStorage.getItem('menuUsage') || '{}');
        
        menuCards.forEach(card => {
            const link = card.querySelector('a');
            if (link) {
                const href = link.getAttribute('href');
                const text = link.textContent.trim();
                const key = `${href}_${text}`;
                const count = usage[key] || 0;
                
                if (count > 0) {
                    const analytics = document.createElement('div');
                    analytics.className = 'menu-analytics';
                    analytics.textContent = `Used ${count} time${count !== 1 ? 's' : ''}`;
                    card.appendChild(analytics);
                }
            }
        });
    }

    // Menu state synchronization
    syncMenuStates() {
        // Sync menu states across tabs/windows
        window.addEventListener('storage', (e) => {
            if (e.key === 'userSession') {
                // Reload page if user session changes
                window.location.reload();
            }
        });
    }

    // Menu accessibility enhancements
    enhanceAccessibility() {
        // Add ARIA labels and keyboard navigation
        const menuCards = document.querySelectorAll('.menu-card');
        
        menuCards.forEach((card, index) => {
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', `Menu item ${index + 1}`);
            
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const link = card.querySelector('a');
                    if (link) link.click();
                }
            });
        });
    }

    // Menu performance optimization
    optimizePerformance() {
        // Lazy load menu icons
        const icons = document.querySelectorAll('.menu-card i[class*="fa-"]');
        
        const iconObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    iconObserver.unobserve(entry.target);
                }
            });
        });
        
        icons.forEach(icon => {
            icon.style.opacity = '0';
            icon.style.transition = 'opacity 0.3s ease';
            iconObserver.observe(icon);
        });
    }
}

// Initialize menu interconnection
document.addEventListener('DOMContentLoaded', function() {
    const menuInterconnect = new MenuInterconnect();
    menuInterconnect.enhanceAccessibility();
    menuInterconnect.optimizePerformance();
    menuInterconnect.syncMenuStates();
});

// Export for global access
window.MenuInterconnect = MenuInterconnect;