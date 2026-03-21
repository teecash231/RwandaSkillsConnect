/**
 * Menu Control Panel System
 * Advanced menu management and control system for admin dashboard
 */

class MenuControlPanel {
    constructor() {
        this.menuConfig = this.loadMenuConfig();
        this.init();
    }

    init() {
        this.setupMenuControlPanel();
        this.enhanceMenuManagement();
        this.setupMenuAnalytics();
    }

    loadMenuConfig() {
        return JSON.parse(localStorage.getItem('menuControlConfig') || JSON.stringify({
            enabled: true,
            theme: 'default',
            animations: true,
            shortcuts: true,
            analytics: true,
            customMenus: {},
            globalSettings: {
                showIcons: true,
                showBadges: true,
                compactMode: false,
                darkMode: false
            }
        }));
    }

    saveMenuConfig() {
        localStorage.setItem('menuControlConfig', JSON.stringify(this.menuConfig));
    }

    setupMenuControlPanel() {
        // Add menu control panel to admin dashboard
        this.addMenuControlSection();
        this.setupControlPanelEvents();
    }

    addMenuControlSection() {
        // Enhance the existing menu management section
        const menuSection = document.getElementById('menu-section');
        if (!menuSection) return;

        // Add control panel header
        const existingContent = menuSection.innerHTML;
        menuSection.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border">
                <!-- Enhanced Header -->
                <div class="p-6 border-b bg-gradient-to-r from-purple-50 to-indigo-50">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-2xl font-bold text-gray-900 flex items-center">
                                <i class="fas fa-cogs text-purple-600 mr-3"></i>
                                Advanced Menu Control Panel
                            </h3>
                            <p class="text-sm text-gray-600 mt-1">Complete menu management and customization system</p>
                        </div>
                        <div class="flex items-center space-x-3">
                            <div class="flex items-center space-x-2">
                                <span class="text-sm text-gray-600">Menu System:</span>
                                <div class="flex items-center">
                                    <div class="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                    <span class="text-sm font-medium text-green-600">Active</span>
                                </div>
                            </div>
                            <button id="menuControlToggle" class="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors">
                                <i class="fas fa-toggle-on mr-2"></i>Enabled
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Control Panel Tabs -->
                <div class="border-b">
                    <nav class="flex space-x-8 px-6">
                        <button class="control-tab py-4 px-1 border-b-2 border-purple-500 text-purple-600 font-medium" data-tab="overview">
                            <i class="fas fa-tachometer-alt mr-2"></i>Overview
                        </button>
                        <button class="control-tab py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700" data-tab="menus">
                            <i class="fas fa-bars mr-2"></i>Menu Management
                        </button>
                        <button class="control-tab py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700" data-tab="customization">
                            <i class="fas fa-palette mr-2"></i>Customization
                        </button>
                        <button class="control-tab py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700" data-tab="analytics">
                            <i class="fas fa-chart-bar mr-2"></i>Analytics
                        </button>
                        <button class="control-tab py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700" data-tab="settings">
                            <i class="fas fa-cog mr-2"></i>Settings
                        </button>
                    </nav>
                </div>

                <!-- Control Panel Content -->
                <div class="p-6">
                    <div id="controlPanelContent">
                        ${this.renderOverviewTab()}
                    </div>
                </div>
            </div>
        `;

        this.setupControlTabs();
    }

    setupControlTabs() {
        const tabs = document.querySelectorAll('.control-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Update active tab
                tabs.forEach(t => {
                    t.classList.remove('border-purple-500', 'text-purple-600');
                    t.classList.add('border-transparent', 'text-gray-500');
                });
                tab.classList.remove('border-transparent', 'text-gray-500');
                tab.classList.add('border-purple-500', 'text-purple-600');
                
                // Load tab content
                const tabName = tab.dataset.tab;
                this.loadTabContent(tabName);
            });
        });
    }

    loadTabContent(tabName) {
        const content = document.getElementById('controlPanelContent');
        if (!content) return;

        switch (tabName) {
            case 'overview':
                content.innerHTML = this.renderOverviewTab();
                break;
            case 'menus':
                content.innerHTML = this.renderMenusTab();
                break;
            case 'customization':
                content.innerHTML = this.renderCustomizationTab();
                break;
            case 'analytics':
                content.innerHTML = this.renderAnalyticsTab();
                break;
            case 'settings':
                content.innerHTML = this.renderSettingsTab();
                break;
        }

        this.setupTabEvents(tabName);
    }

    renderOverviewTab() {
        const menuStats = this.getMenuStatistics();
        
        return `
            <div class="space-y-6">
                <!-- System Status -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-blue-600 text-sm font-medium">Total Menu Items</p>
                                <p class="text-2xl font-bold text-blue-800">${menuStats.totalItems}</p>
                            </div>
                            <div class="bg-blue-500 p-3 rounded-lg">
                                <i class="fas fa-list text-white text-xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-green-600 text-sm font-medium">Active Menus</p>
                                <p class="text-2xl font-bold text-green-800">${menuStats.activeItems}</p>
                            </div>
                            <div class="bg-green-500 p-3 rounded-lg">
                                <i class="fas fa-check-circle text-white text-xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-purple-600 text-sm font-medium">Custom Items</p>
                                <p class="text-2xl font-bold text-purple-800">${menuStats.customItems}</p>
                            </div>
                            <div class="bg-purple-500 p-3 rounded-lg">
                                <i class="fas fa-magic text-white text-xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-orange-600 text-sm font-medium">Total Clicks</p>
                                <p class="text-2xl font-bold text-orange-800">${menuStats.totalClicks}</p>
                            </div>
                            <div class="bg-orange-500 p-3 rounded-lg">
                                <i class="fas fa-mouse-pointer text-white text-xl"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="bg-white border rounded-xl p-6">
                    <h4 class="font-semibold text-gray-900 mb-4">Quick Actions</h4>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button onclick="menuControlPanel.createNewMenu()" class="p-4 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-colors">
                            <i class="fas fa-plus text-2xl mb-2"></i>
                            <div class="text-sm font-medium">Create Menu</div>
                        </button>
                        <button onclick="menuControlPanel.importMenus()" class="p-4 border-2 border-dashed border-green-300 rounded-lg text-green-600 hover:border-green-400 hover:bg-green-50 transition-colors">
                            <i class="fas fa-upload text-2xl mb-2"></i>
                            <div class="text-sm font-medium">Import Menus</div>
                        </button>
                        <button onclick="menuControlPanel.exportMenus()" class="p-4 border-2 border-dashed border-purple-300 rounded-lg text-purple-600 hover:border-purple-400 hover:bg-purple-50 transition-colors">
                            <i class="fas fa-download text-2xl mb-2"></i>
                            <div class="text-sm font-medium">Export Menus</div>
                        </button>
                        <button onclick="menuControlPanel.resetAllMenus()" class="p-4 border-2 border-dashed border-red-300 rounded-lg text-red-600 hover:border-red-400 hover:bg-red-50 transition-colors">
                            <i class="fas fa-undo text-2xl mb-2"></i>
                            <div class="text-sm font-medium">Reset All</div>
                        </button>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="bg-white border rounded-xl p-6">
                    <h4 class="font-semibold text-gray-900 mb-4">Recent Menu Activity</h4>
                    <div class="space-y-3">
                        ${this.renderRecentActivity()}
                    </div>
                </div>
            </div>
        `;
    }

    renderMenusTab() {
        return `
            <div class="space-y-6">
                <!-- Menu Management Interface -->
                <div class="bg-white border rounded-xl p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h4 class="font-semibold text-gray-900">Menu Management</h4>
                        <div class="flex space-x-3">
                            <select id="menuRoleSelector" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                                <option value="client">Client Menus</option>
                                <option value="freelancer">Freelancer Menus</option>
                                <option value="admin">Admin Menus</option>
                            </select>
                            <button onclick="menuControlPanel.addMenuItem()" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm">
                                <i class="fas fa-plus mr-2"></i>Add Item
                            </button>
                        </div>
                    </div>
                    
                    <div id="menuItemsList">
                        ${this.renderMenuItemsList('client')}
                    </div>
                </div>
            </div>
        `;
    }

    renderCustomizationTab() {
        return `
            <div class="space-y-6">
                <!-- Theme Customization -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="bg-white border rounded-xl p-6">
                        <h4 class="font-semibold text-gray-900 mb-4">Theme Settings</h4>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Menu Theme</label>
                                <select id="menuThemeSelector" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                                    <option value="default">Default</option>
                                    <option value="dark">Dark Mode</option>
                                    <option value="colorful">Colorful</option>
                                    <option value="minimal">Minimal</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Animation Speed</label>
                                <select id="animationSpeedSelector" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                                    <option value="fast">Fast (200ms)</option>
                                    <option value="normal">Normal (300ms)</option>
                                    <option value="slow">Slow (500ms)</option>
                                    <option value="none">No Animation</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white border rounded-xl p-6">
                        <h4 class="font-semibold text-gray-900 mb-4">Display Options</h4>
                        <div class="space-y-4">
                            <label class="flex items-center">
                                <input type="checkbox" id="showMenuIcons" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked>
                                <span class="ml-2 text-sm text-gray-700">Show menu icons</span>
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" id="showMenuBadges" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked>
                                <span class="ml-2 text-sm text-gray-700">Show notification badges</span>
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" id="compactMenuMode" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                <span class="ml-2 text-sm text-gray-700">Compact menu mode</span>
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" id="enableMenuSearch" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked>
                                <span class="ml-2 text-sm text-gray-700">Enable menu search</span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <!-- Color Customization -->
                <div class="bg-white border rounded-xl p-6">
                    <h4 class="font-semibold text-gray-900 mb-4">Color Customization</h4>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="text-center">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                            <input type="color" id="primaryColor" value="#3B82F6" class="w-full h-12 rounded-lg border border-gray-300">
                        </div>
                        <div class="text-center">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                            <input type="color" id="secondaryColor" value="#6B7280" class="w-full h-12 rounded-lg border border-gray-300">
                        </div>
                        <div class="text-center">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                            <input type="color" id="accentColor" value="#10B981" class="w-full h-12 rounded-lg border border-gray-300">
                        </div>
                        <div class="text-center">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                            <input type="color" id="backgroundColor" value="#F9FAFB" class="w-full h-12 rounded-lg border border-gray-300">
                        </div>
                    </div>
                </div>
                
                <!-- Preview -->
                <div class="bg-white border rounded-xl p-6">
                    <h4 class="font-semibold text-gray-900 mb-4">Live Preview</h4>
                    <div id="menuPreview" class="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                        <p class="text-gray-500 text-center">Menu preview will appear here</p>
                    </div>
                </div>
            </div>
        `;
    }

    renderAnalyticsTab() {
        const analytics = this.getMenuAnalytics();
        
        return `
            <div class="space-y-6">
                <!-- Analytics Overview -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="bg-white border rounded-xl p-6">
                        <h4 class="font-semibold text-gray-900 mb-4">Usage Statistics</h4>
                        <div class="space-y-3">
                            <div class="flex justify-between">
                                <span class="text-gray-600">Total Clicks:</span>
                                <span class="font-semibold">${analytics.totalClicks}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Unique Users:</span>
                                <span class="font-semibold">${analytics.uniqueUsers}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Avg. Session:</span>
                                <span class="font-semibold">${analytics.avgSession}min</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white border rounded-xl p-6">
                        <h4 class="font-semibold text-gray-900 mb-4">Popular Items</h4>
                        <div class="space-y-2">
                            ${analytics.popularItems.map((item, index) => `
                                <div class="flex items-center justify-between text-sm">
                                    <span class="flex items-center">
                                        <span class="w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center mr-2">${index + 1}</span>
                                        ${item.name}
                                    </span>
                                    <span class="text-gray-500">${item.clicks}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="bg-white border rounded-xl p-6">
                        <h4 class="font-semibold text-gray-900 mb-4">Performance</h4>
                        <div class="space-y-3">
                            <div class="flex justify-between">
                                <span class="text-gray-600">Load Time:</span>
                                <span class="font-semibold text-green-600">${analytics.loadTime}ms</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Error Rate:</span>
                                <span class="font-semibold text-green-600">${analytics.errorRate}%</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Satisfaction:</span>
                                <span class="font-semibold text-green-600">${analytics.satisfaction}%</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Usage Chart -->
                <div class="bg-white border rounded-xl p-6">
                    <h4 class="font-semibold text-gray-900 mb-4">Usage Trends</h4>
                    <div id="usageChart" class="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                        <p class="text-gray-500">Usage chart would be displayed here</p>
                    </div>
                </div>
            </div>
        `;
    }

    renderSettingsTab() {
        return `
            <div class="space-y-6">
                <!-- Advanced Settings -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="bg-white border rounded-xl p-6">
                        <h4 class="font-semibold text-gray-900 mb-4">System Settings</h4>
                        <div class="space-y-4">
                            <label class="flex items-center">
                                <input type="checkbox" id="enableMenuSystem" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked>
                                <span class="ml-2 text-sm text-gray-700">Enable menu system</span>
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" id="enableMenuAnalytics" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked>
                                <span class="ml-2 text-sm text-gray-700">Track menu analytics</span>
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" id="enableMenuShortcuts" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked>
                                <span class="ml-2 text-sm text-gray-700">Enable keyboard shortcuts</span>
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" id="enableMenuCache" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked>
                                <span class="ml-2 text-sm text-gray-700">Enable menu caching</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="bg-white border rounded-xl p-6">
                        <h4 class="font-semibold text-gray-900 mb-4">Security Settings</h4>
                        <div class="space-y-4">
                            <label class="flex items-center">
                                <input type="checkbox" id="requireMenuAuth" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                <span class="ml-2 text-sm text-gray-700">Require authentication for menu access</span>
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" id="logMenuAccess" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked>
                                <span class="ml-2 text-sm text-gray-700">Log menu access attempts</span>
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" id="enableMenuEncryption" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                <span class="ml-2 text-sm text-gray-700">Encrypt menu configuration</span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <!-- Backup & Restore -->
                <div class="bg-white border rounded-xl p-6">
                    <h4 class="font-semibold text-gray-900 mb-4">Backup & Restore</h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button onclick="menuControlPanel.createBackup()" class="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            <i class="fas fa-save text-blue-500 text-2xl mb-2"></i>
                            <div class="text-sm font-medium">Create Backup</div>
                        </button>
                        <button onclick="menuControlPanel.restoreBackup()" class="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            <i class="fas fa-upload text-green-500 text-2xl mb-2"></i>
                            <div class="text-sm font-medium">Restore Backup</div>
                        </button>
                        <button onclick="menuControlPanel.resetToDefaults()" class="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            <i class="fas fa-undo text-red-500 text-2xl mb-2"></i>
                            <div class="text-sm font-medium">Reset to Defaults</div>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    setupControlPanelEvents() {
        // Menu control toggle
        const toggleBtn = document.getElementById('menuControlToggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.toggleMenuSystem();
            });
        }
    }

    setupTabEvents(tabName) {
        switch (tabName) {
            case 'menus':
                this.setupMenusTabEvents();
                break;
            case 'customization':
                this.setupCustomizationTabEvents();
                break;
            case 'settings':
                this.setupSettingsTabEvents();
                break;
        }
    }

    setupMenusTabEvents() {
        const roleSelector = document.getElementById('menuRoleSelector');
        if (roleSelector) {
            roleSelector.addEventListener('change', (e) => {
                const role = e.target.value;
                this.loadMenuItemsForRole(role);
            });
        }
    }

    setupCustomizationTabEvents() {
        // Theme selector
        const themeSelector = document.getElementById('menuThemeSelector');
        if (themeSelector) {
            themeSelector.addEventListener('change', (e) => {
                this.applyTheme(e.target.value);
            });
        }

        // Color inputs
        ['primaryColor', 'secondaryColor', 'accentColor', 'backgroundColor'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('change', () => {
                    this.updateColorScheme();
                });
            }
        });
    }

    setupSettingsTabEvents() {
        // System settings checkboxes
        const checkboxes = [
            'enableMenuSystem', 'enableMenuAnalytics', 'enableMenuShortcuts',
            'enableMenuCache', 'requireMenuAuth', 'logMenuAccess', 'enableMenuEncryption'
        ];

        checkboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    this.updateSystemSettings();
                });
            }
        });
    }

    // Helper methods
    getMenuStatistics() {
        const customMenus = JSON.parse(localStorage.getItem('customMenuItems') || '{}');
        const usage = JSON.parse(localStorage.getItem('menuUsage') || '{}');
        
        let totalItems = 0;
        let activeItems = 0;
        let customItems = 0;
        
        Object.values(customMenus).forEach(roleMenus => {
            totalItems += roleMenus.length;
            activeItems += roleMenus.filter(item => item.enabled !== false).length;
            customItems += roleMenus.filter(item => item.custom).length;
        });
        
        const totalClicks = Object.values(usage).reduce((sum, count) => sum + count, 0);
        
        return {
            totalItems,
            activeItems,
            customItems,
            totalClicks
        };
    }

    getMenuAnalytics() {
        return {
            totalClicks: 1250,
            uniqueUsers: 45,
            avgSession: 12.5,
            loadTime: 150,
            errorRate: 0.2,
            satisfaction: 94,
            popularItems: [
                { name: 'Dashboard', clicks: 450 },
                { name: 'Jobs', clicks: 320 },
                { name: 'Users', clicks: 280 },
                { name: 'Settings', clicks: 200 }
            ]
        };
    }

    renderRecentActivity() {
        const activities = [
            { action: 'Menu item added', item: 'New Dashboard Widget', time: '2 hours ago', type: 'success' },
            { action: 'Menu updated', item: 'User Management', time: '5 hours ago', type: 'info' },
            { action: 'Menu disabled', item: 'Legacy Reports', time: '1 day ago', type: 'warning' },
            { action: 'Menu restored', item: 'Analytics Panel', time: '2 days ago', type: 'success' }
        ];

        return activities.map(activity => `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-${activity.type === 'success' ? 'green' : activity.type === 'warning' ? 'yellow' : 'blue'}-100 rounded-full flex items-center justify-center">
                        <i class="fas fa-${activity.type === 'success' ? 'check' : activity.type === 'warning' ? 'exclamation' : 'info'} text-${activity.type === 'success' ? 'green' : activity.type === 'warning' ? 'yellow' : 'blue'}-600 text-sm"></i>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-900">${activity.action}</p>
                        <p class="text-xs text-gray-500">${activity.item}</p>
                    </div>
                </div>
                <span class="text-xs text-gray-400">${activity.time}</span>
            </div>
        `).join('');
    }

    renderMenuItemsList(role) {
        // This would integrate with the existing menu management system
        return `
            <div class="space-y-3">
                <p class="text-gray-500 text-center py-8">Menu items for ${role} role will be displayed here</p>
            </div>
        `;
    }

    // Action methods
    toggleMenuSystem() {
        this.menuConfig.enabled = !this.menuConfig.enabled;
        this.saveMenuConfig();
        
        const toggleBtn = document.getElementById('menuControlToggle');
        if (toggleBtn) {
            if (this.menuConfig.enabled) {
                toggleBtn.innerHTML = '<i class="fas fa-toggle-on mr-2"></i>Enabled';
                toggleBtn.className = 'bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors';
            } else {
                toggleBtn.innerHTML = '<i class="fas fa-toggle-off mr-2"></i>Disabled';
                toggleBtn.className = 'bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors';
            }
        }
        
        this.showNotification(`Menu system ${this.menuConfig.enabled ? 'enabled' : 'disabled'}`, 'success');
    }

    createNewMenu() {
        this.showNotification('Create new menu functionality would be implemented here', 'info');
    }

    importMenus() {
        this.showNotification('Import menus functionality would be implemented here', 'info');
    }

    exportMenus() {
        const menuData = {
            customMenus: JSON.parse(localStorage.getItem('customMenuItems') || '{}'),
            config: this.menuConfig,
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(menuData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `menu-config-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Menu configuration exported successfully', 'success');
    }

    resetAllMenus() {
        if (!confirm('Reset all menus to default configuration? This cannot be undone.')) return;

        localStorage.removeItem('customMenuItems');
        localStorage.removeItem('menuUsage');
        this.menuConfig = this.loadMenuConfig();
        
        this.showNotification('All menus reset to default configuration', 'success');
    }

    createBackup() {
        this.exportMenus(); // Same as export for now
    }

    restoreBackup() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        localStorage.setItem('customMenuItems', JSON.stringify(data.customMenus || {}));
                        this.menuConfig = { ...this.menuConfig, ...data.config };
                        this.saveMenuConfig();
                        this.showNotification('Menu backup restored successfully', 'success');
                    } catch (error) {
                        this.showNotification('Error restoring backup: ' + error.message, 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    resetToDefaults() {
        if (!confirm('Reset all menu settings to factory defaults? This cannot be undone.')) return;

        localStorage.removeItem('customMenuItems');
        localStorage.removeItem('menuUsage');
        localStorage.removeItem('menuControlConfig');
        this.menuConfig = this.loadMenuConfig();
        
        this.showNotification('All menu settings reset to defaults', 'success');
    }

    showNotification(message, type = 'info') {
        // Use existing notification system if available
        if (window.showNotification) {
            window.showNotification(message, type);
            return;
        }

        // Fallback notification
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${this.getNotificationColor(type)}`;
        notification.innerHTML = `
            <div class="flex items-center text-white">
                <i class="fas fa-${this.getNotificationIcon(type)} mr-2"></i>
                ${message}
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    getNotificationColor(type) {
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };
        return colors[type] || 'bg-gray-500';
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'times-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'bell';
    }
}

// Create global instance
window.menuControlPanel = new MenuControlPanel();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MenuControlPanel;
}

console.log('🎛️ Menu Control Panel System Loaded');