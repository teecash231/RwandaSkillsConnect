/**
 * Rwanda SkillsConnect - Menu Configuration
 * Centralized menu configuration and settings
 */

const MenuConfig = {
    // Menu structure definition
    menuStructure: {
        client: {
            primary: [
                {
                    id: 'dashboard',
                    label: 'Dashboard',
                    icon: 'fas fa-tachometer-alt',
                    url: 'client-dashboard.html',
                    description: 'Overview of your projects and activities',
                    category: 'core',
                    priority: 1
                },
                {
                    id: 'post-job',
                    label: 'Post Job',
                    icon: 'fas fa-plus-circle',
                    url: 'post-job.html',
                    description: 'Create new job postings to find talent',
                    category: 'core',
                    priority: 2
                },
                {
                    id: 'browse-talent',
                    label: 'Browse Talent',
                    icon: 'fas fa-users',
                    url: 'browse.html',
                    description: 'Search and discover skilled freelancers',
                    category: 'core',
                    priority: 3
                },
                {
                    id: 'messages',
                    label: 'Messages',
                    icon: 'fas fa-envelope',
                    url: 'client-messages.html',
                    description: 'Communicate with freelancers',
                    category: 'core',
                    priority: 4,
                    badge: true
                }
            ],
            secondary: [
                {
                    id: 'profile',
                    label: 'My Profile',
                    icon: 'fas fa-user',
                    url: 'client-profile.html',
                    description: 'Update your profile and company information',
                    category: 'account',
                    priority: 1
                },
                {
                    id: 'settings',
                    label: 'Settings',
                    icon: 'fas fa-cog',
                    url: 'client-settings.html',
                    description: 'Account preferences and security settings',
                    category: 'account',
                    priority: 2
                },
                {
                    id: 'billing',
                    label: 'Billing',
                    icon: 'fas fa-credit-card',
                    url: '#',
                    description: 'Payment methods and billing history',
                    category: 'account',
                    priority: 3,
                    comingSoon: true
                }
            ],
            tools: [
                {
                    id: 'talent-map',
                    label: 'Talent Map',
                    icon: 'fas fa-map-marked-alt',
                    url: 'map.html',
                    description: 'Geographic view of available talent',
                    category: 'tools',
                    priority: 1
                },
                {
                    id: 'analytics',
                    label: 'Analytics',
                    icon: 'fas fa-chart-bar',
                    url: '#',
                    description: 'Track your hiring performance',
                    category: 'tools',
                    priority: 2,
                    comingSoon: true
                },
                {
                    id: 'reports',
                    label: 'Reports',
                    icon: 'fas fa-file-alt',
                    url: '#',
                    description: 'Generate detailed project reports',
                    category: 'tools',
                    priority: 3,
                    comingSoon: true
                },
                {
                    id: 'help',
                    label: 'Help Center',
                    icon: 'fas fa-question-circle',
                    url: '#',
                    description: 'Get support and find answers',
                    category: 'tools',
                    priority: 4,
                    comingSoon: true
                }
            ]
        },
        
        freelancer: {
            primary: [
                {
                    id: 'dashboard',
                    label: 'Dashboard',
                    icon: 'fas fa-tachometer-alt',
                    url: 'freelancer-dashboard.html',
                    description: 'Overview of your applications and projects',
                    category: 'core',
                    priority: 1
                },
                {
                    id: 'find-jobs',
                    label: 'Find Jobs',
                    icon: 'fas fa-search',
                    url: 'browse.html',
                    description: 'Browse and apply to available job opportunities',
                    category: 'core',
                    priority: 2
                },
                {
                    id: 'job-map',
                    label: 'Job Map',
                    icon: 'fas fa-map-marked-alt',
                    url: 'map.html',
                    description: 'Find job opportunities by location',
                    category: 'core',
                    priority: 3
                },
                {
                    id: 'messages',
                    label: 'Messages',
                    icon: 'fas fa-envelope',
                    url: 'freelancer-messages.html',
                    description: 'Communicate with clients',
                    category: 'core',
                    priority: 4,
                    badge: true
                }
            ],
            secondary: [
                {
                    id: 'profile',
                    label: 'My Profile',
                    icon: 'fas fa-user',
                    url: 'profile.html',
                    description: 'Update your profile and showcase your skills',
                    category: 'career',
                    priority: 1
                },
                {
                    id: 'applications',
                    label: 'My Applications',
                    icon: 'fas fa-file-alt',
                    url: 'freelancer-dashboard.html#applications',
                    description: 'Track your job applications and status',
                    category: 'career',
                    priority: 2
                },
                {
                    id: 'earnings',
                    label: 'Earnings',
                    icon: 'fas fa-wallet',
                    url: 'freelancer-dashboard.html#earnings',
                    description: 'Track your earnings and payment history',
                    category: 'career',
                    priority: 3
                }
            ],
            tools: [
                {
                    id: 'portfolio',
                    label: 'Portfolio',
                    icon: 'fas fa-folder-open',
                    url: '#',
                    description: 'Showcase your work and projects',
                    category: 'tools',
                    priority: 1,
                    comingSoon: true
                },
                {
                    id: 'skills-test',
                    label: 'Skills Test',
                    icon: 'fas fa-certificate',
                    url: '#',
                    description: 'Take tests to verify your skills',
                    category: 'tools',
                    priority: 2,
                    comingSoon: true
                },
                {
                    id: 'learning',
                    label: 'Learning',
                    icon: 'fas fa-graduation-cap',
                    url: '#',
                    description: 'Improve your skills with courses',
                    category: 'tools',
                    priority: 3,
                    comingSoon: true
                },
                {
                    id: 'help',
                    label: 'Help Center',
                    icon: 'fas fa-question-circle',
                    url: '#',
                    description: 'Get support and find answers',
                    category: 'tools',
                    priority: 4,
                    comingSoon: true
                }
            ]
        },
        
        admin: {
            primary: [
                {
                    id: 'dashboard',
                    label: 'Dashboard',
                    icon: 'fas fa-tachometer-alt',
                    url: 'admin-dashboard.html',
                    description: 'System overview and key metrics',
                    category: 'core',
                    priority: 1
                },
                {
                    id: 'users',
                    label: 'User Management',
                    icon: 'fas fa-users-cog',
                    url: 'admin-dashboard.html#users',
                    description: 'Manage users, roles, and permissions',
                    category: 'core',
                    priority: 2
                },
                {
                    id: 'jobs',
                    label: 'Job Management',
                    icon: 'fas fa-briefcase',
                    url: 'admin-dashboard.html#jobs',
                    description: 'Oversee job postings and applications',
                    category: 'core',
                    priority: 3
                },
                {
                    id: 'verifications',
                    label: 'Verifications',
                    icon: 'fas fa-certificate',
                    url: 'admin-dashboard.html#verifications',
                    description: 'Review and approve user verifications',
                    category: 'core',
                    priority: 4,
                    badge: true
                }
            ],
            secondary: [
                {
                    id: 'analytics',
                    label: 'Analytics',
                    icon: 'fas fa-chart-bar',
                    url: '#',
                    description: 'Platform usage and performance metrics',
                    category: 'analytics',
                    priority: 1,
                    comingSoon: true
                },
                {
                    id: 'reports',
                    label: 'Reports',
                    icon: 'fas fa-file-alt',
                    url: '#',
                    description: 'Generate detailed system reports',
                    category: 'analytics',
                    priority: 2,
                    comingSoon: true
                },
                {
                    id: 'audit-logs',
                    label: 'Audit Logs',
                    icon: 'fas fa-history',
                    url: '#',
                    description: 'System activity and security logs',
                    category: 'analytics',
                    priority: 3,
                    comingSoon: true
                }
            ],
            tools: [
                {
                    id: 'settings',
                    label: 'Settings',
                    icon: 'fas fa-cog',
                    url: 'admin-settings.html',
                    description: 'System configuration and preferences',
                    category: 'system',
                    priority: 1
                },
                {
                    id: 'backup',
                    label: 'Backup',
                    icon: 'fas fa-database',
                    url: '#',
                    description: 'Data backup and restore operations',
                    category: 'system',
                    priority: 2,
                    comingSoon: true
                },
                {
                    id: 'security',
                    label: 'Security',
                    icon: 'fas fa-shield-alt',
                    url: '#',
                    description: 'Security settings and monitoring',
                    category: 'system',
                    priority: 3,
                    comingSoon: true
                },
                {
                    id: 'maintenance',
                    label: 'Maintenance',
                    icon: 'fas fa-tools',
                    url: '#',
                    description: 'System maintenance and optimization',
                    category: 'system',
                    priority: 4,
                    comingSoon: true
                }
            ]
        }
    },

    // Category configurations
    categories: {
        core: {
            label: 'Core Features',
            icon: 'fas fa-star',
            description: 'Essential tools for managing your account',
            color: 'indigo'
        },
        account: {
            label: 'Account Management',
            icon: 'fas fa-user-cog',
            description: 'Manage your profile and account settings',
            color: 'pink'
        },
        career: {
            label: 'Profile & Career',
            icon: 'fas fa-user-cog',
            description: 'Manage your profile and build your freelance career',
            color: 'pink'
        },
        tools: {
            label: 'Tools & Resources',
            icon: 'fas fa-tools',
            description: 'Additional tools to help you succeed',
            color: 'yellow'
        },
        analytics: {
            label: 'Analytics & Reports',
            icon: 'fas fa-chart-line',
            description: 'Data insights and reporting tools',
            color: 'green'
        },
        system: {
            label: 'System Management',
            icon: 'fas fa-cogs',
            description: 'System configuration and maintenance',
            color: 'yellow'
        }
    },

    // Menu themes and styling
    themes: {
        default: {
            primaryColor: '#4f46e5',
            secondaryColor: '#6366f1',
            accentColor: '#8b5cf6',
            backgroundColor: '#f9fafb',
            cardBackground: '#ffffff',
            textColor: '#1f2937',
            borderColor: '#e5e7eb'
        },
        dark: {
            primaryColor: '#6366f1',
            secondaryColor: '#8b5cf6',
            accentColor: '#a855f7',
            backgroundColor: '#111827',
            cardBackground: '#1f2937',
            textColor: '#f9fafb',
            borderColor: '#374151'
        }
    },

    // Menu behavior settings
    settings: {
        enableSearch: true,
        enableShortcuts: true,
        enableBadges: true,
        enableAnalytics: true,
        enableAnimations: true,
        autoHideComingSoon: false,
        maxRecentItems: 5,
        searchMinLength: 2,
        animationDuration: 300
    },

    // Quick actions configuration
    quickActions: {
        client: [
            {
                label: 'Post Your First Job',
                icon: 'fas fa-plus',
                url: 'post-job.html',
                class: 'bg-indigo-600 text-white hover:bg-indigo-700',
                primary: true
            },
            {
                label: 'Browse Talent Now',
                icon: 'fas fa-search',
                url: 'browse.html',
                class: 'bg-green-600 text-white hover:bg-green-700',
                primary: false
            }
        ],
        freelancer: [
            {
                label: 'Find Jobs Now',
                icon: 'fas fa-search',
                url: 'browse.html',
                class: 'bg-indigo-600 text-white hover:bg-indigo-700',
                primary: true
            },
            {
                label: 'Complete Profile',
                icon: 'fas fa-user-edit',
                url: 'profile.html',
                class: 'bg-green-600 text-white hover:bg-green-700',
                primary: false
            }
        ],
        admin: [
            {
                label: 'Manage Users',
                icon: 'fas fa-users-cog',
                url: 'admin-dashboard.html#users',
                class: 'bg-red-600 text-white hover:bg-red-700',
                primary: true
            },
            {
                label: 'System Settings',
                icon: 'fas fa-cog',
                url: 'admin-settings.html',
                class: 'bg-blue-600 text-white hover:bg-blue-700',
                primary: false
            }
        ]
    },

    // Navigation breadcrumbs
    breadcrumbs: {
        'client-menu.html': [
            { label: 'Home', url: 'index.html' },
            { label: 'Dashboard', url: 'client-dashboard.html' },
            { label: 'Menu', url: null }
        ],
        'freelancer-menu.html': [
            { label: 'Home', url: 'index.html' },
            { label: 'Dashboard', url: 'freelancer-dashboard.html' },
            { label: 'Menu', url: null }
        ],
        'admin-menu.html': [
            { label: 'Home', url: 'index.html' },
            { label: 'Dashboard', url: 'admin-dashboard.html' },
            { label: 'Menu', url: null }
        ]
    },

    // Keyboard shortcuts
    shortcuts: {
        'ctrl+d': 'dashboard',
        'ctrl+m': 'messages',
        'ctrl+p': 'profile',
        'ctrl+s': 'settings',
        'ctrl+/': 'search',
        'ctrl+h': 'help'
    },

    // Menu statistics tracking
    analytics: {
        trackClicks: true,
        trackTime: true,
        trackSearch: true,
        trackErrors: true
    },

    // Utility functions
    utils: {
        getMenuForRole(role) {
            return this.menuStructure[role] || {};
        },

        getCategoryConfig(categoryId) {
            return this.categories[categoryId] || {};
        },

        getTheme(themeName = 'default') {
            return this.themes[themeName] || this.themes.default;
        },

        getQuickActions(role) {
            return this.quickActions[role] || [];
        },

        getBreadcrumbs(page) {
            return this.breadcrumbs[page] || [];
        },

        isComingSoon(menuItem) {
            return menuItem.comingSoon === true;
        },

        shouldShowBadge(menuItem) {
            return menuItem.badge === true && this.settings.enableBadges;
        },

        getMenuItemsByCategory(role, category) {
            const menu = this.getMenuForRole(role);
            const items = [];
            
            Object.keys(menu).forEach(section => {
                menu[section].forEach(item => {
                    if (item.category === category) {
                        items.push(item);
                    }
                });
            });
            
            return items.sort((a, b) => a.priority - b.priority);
        },

        getAllMenuItems(role) {
            const menu = this.getMenuForRole(role);
            const items = [];
            
            Object.keys(menu).forEach(section => {
                items.push(...menu[section]);
            });
            
            return items;
        },

        searchMenuItems(role, query) {
            const allItems = this.getAllMenuItems(role);
            const searchTerm = query.toLowerCase();
            
            return allItems.filter(item => 
                item.label.toLowerCase().includes(searchTerm) ||
                item.description.toLowerCase().includes(searchTerm)
            );
        }
    }
};

// Make configuration globally available
window.MenuConfig = MenuConfig;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MenuConfig;
}