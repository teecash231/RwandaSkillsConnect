/**
 * Rwanda SkillsConnect - Admin Menu Management System
 * Effective menu management for admin dashboard
 */

class AdminMenuManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupMenuManagement();
        this.enhanceAdminNavigation();
        this.addQuickActions();
        this.setupMenuAnalytics();
    }

    setupMenuManagement() {
        // Add menu management to admin dashboard
        this.addMenuManagementSection();
        this.setupMenuControls();
        this.loadMenuItems();
    }

    addMenuManagementSection() {
        const menuSection = document.getElementById('menu-section');
        if (!menuSection) return;

        menuSection.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border">
                <div class="p-6 border-b">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-xl font-semibold text-gray-900">Menu Management</h3>
                            <p class="text-sm text-gray-600 mt-1">Control navigation menus across all user roles</p>
                        </div>
                        <div class="flex space-x-3">
                            <button id="addMenuItemBtn" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                                <i class="fas fa-plus mr-2"></i>Add Menu Item
                            </button>
                            <button id="resetMenusBtn" class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                                <i class="fas fa-undo mr-2"></i>Reset to Default
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Menu Tabs -->
                <div class="border-b">
                    <nav class="flex space-x-8 px-6">
                        <button class="menu-tab py-4 px-1 border-b-2 border-blue-500 text-blue-600 font-medium" data-role="client">
                            Client Menu
                        </button>
                        <button class="menu-tab py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700" data-role="freelancer">
                            Freelancer Menu
                        </button>
                        <button class="menu-tab py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700" data-role="admin">
                            Admin Menu
                        </button>
                        <button class="menu-tab py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700" data-role="global">
                            Global Settings
                        </button>
                    </nav>
                </div>
                
                <!-- Menu Content -->
                <div class="p-6">
                    <div id="menuContent">
                        <!-- Menu items will be loaded here -->
                    </div>
                </div>
            </div>
        `;

        this.setupMenuTabs();
        this.loadMenuForRole('client');
    }

    setupMenuTabs() {
        const tabs = document.querySelectorAll('.menu-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Update active tab
                tabs.forEach(t => {
                    t.classList.remove('border-blue-500', 'text-blue-600');
                    t.classList.add('border-transparent', 'text-gray-500');
                });
                tab.classList.remove('border-transparent', 'text-gray-500');
                tab.classList.add('border-blue-500', 'text-blue-600');
                
                // Load menu for selected role
                const role = tab.dataset.role;
                this.loadMenuForRole(role);
            });
        });
    }

    loadMenuForRole(role) {
        const content = document.getElementById('menuContent');
        if (!content) return;

        if (role === 'global') {
            this.loadGlobalSettings(content);
            return;
        }

        const menuItems = this.getMenuItemsForRole(role);
        
        content.innerHTML = `
            <div class="space-y-6">
                <!-- Menu Statistics -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <div class="text-2xl font-bold text-blue-600">${menuItems.length}</div>
                        <div class="text-sm text-blue-700">Total Menu Items</div>
                    </div>
                    <div class="bg-green-50 p-4 rounded-lg">
                        <div class="text-2xl font-bold text-green-600">${menuItems.filter(item => item.enabled !== false).length}</div>
                        <div class="text-sm text-green-700">Active Items</div>
                    </div>
                    <div class="bg-orange-50 p-4 rounded-lg">
                        <div class="text-2xl font-bold text-orange-600">${this.getMenuUsageCount(role)}</div>
                        <div class="text-sm text-orange-700">Total Clicks</div>
                    </div>
                </div>

                <!-- Menu Items List -->
                <div class="space-y-3" id="menuItemsList">
                    ${menuItems.map(item => this.renderMenuItem(item, role)).join('')}
                </div>
                
                <!-- Add New Item Button -->
                <button onclick="adminMenuManager.showAddItemModal('${role}')" class="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-300 hover:text-blue-500 transition-colors">
                    <i class="fas fa-plus mr-2"></i>Add New Menu Item
                </button>
            </div>
        `;
    }

    renderMenuItem(item, role) {
        const usageCount = this.getItemUsageCount(item.id);
        const isEnabled = item.enabled !== false;
        
        return `
            <div class="flex items-center justify-between p-4 border rounded-lg ${isEnabled ? 'bg-white' : 'bg-gray-50'}" data-item-id="${item.id}">
                <div class="flex items-center space-x-4">
                    <div class="cursor-move">
                        <i class="fas fa-grip-vertical text-gray-400"></i>
                    </div>
                    <div class="w-10 h-10 bg-${item.color || 'blue'}-100 rounded-lg flex items-center justify-center">
                        <i class="${item.icon} text-${item.color || 'blue'}-600"></i>
                    </div>
                    <div>
                        <div class="font-medium text-gray-900 ${!isEnabled ? 'opacity-50' : ''}">${item.label}</div>
                        <div class="text-sm text-gray-500">${item.url}</div>
                        <div class="text-xs text-gray-400">${item.description}</div>
                    </div>
                </div>
                <div class="flex items-center space-x-3">
                    <div class="text-right">
                        <div class="text-sm font-medium text-gray-600">${usageCount} clicks</div>
                        <div class="text-xs text-gray-400">Priority: ${item.priority || 1}</div>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button onclick="adminMenuManager.toggleMenuItem('${item.id}', '${role}')" 
                                class="p-2 rounded ${isEnabled ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}" 
                                title="${isEnabled ? 'Disable' : 'Enable'}">
                            <i class="fas fa-${isEnabled ? 'toggle-on' : 'toggle-off'}"></i>
                        </button>
                        <button onclick="adminMenuManager.editMenuItem('${item.id}', '${role}')" 
                                class="p-2 text-blue-600 hover:bg-blue-50 rounded">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="adminMenuManager.deleteMenuItem('${item.id}', '${role}')" 
                                class="p-2 text-red-600 hover:bg-red-50 rounded">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    loadGlobalSettings(content) {
        content.innerHTML = `
            <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Menu Behavior Settings -->
                    <div class="bg-white border rounded-lg p-6">
                        <h4 class="font-semibold text-gray-900 mb-4">Menu Behavior</h4>
                        <div class="space-y-4">
                            <label class="flex items-center">
                                <input type="checkbox" id="enableMenuSearch" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked>
                                <span class="ml-2 text-sm text-gray-700">Enable menu search</span>
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" id="enableMenuBadges" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked>
                                <span class="ml-2 text-sm text-gray-700">Show notification badges</span>
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" id="enableMenuAnalytics" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked>
                                <span class="ml-2 text-sm text-gray-700">Track menu usage</span>
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" id="enableMenuShortcuts" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked>
                                <span class="ml-2 text-sm text-gray-700">Enable keyboard shortcuts</span>
                            </label>
                        </div>
                    </div>

                    <!-- Menu Appearance -->
                    <div class="bg-white border rounded-lg p-6">
                        <h4 class="font-semibold text-gray-900 mb-4">Appearance</h4>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Menu Theme</label>
                                <select id="menuTheme" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                                    <option value="default">Default</option>
                                    <option value="dark">Dark</option>
                                    <option value="colorful">Colorful</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Animation Speed</label>
                                <select id="animationSpeed" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                                    <option value="fast">Fast (200ms)</option>
                                    <option value="normal" selected>Normal (300ms)</option>
                                    <option value="slow">Slow (500ms)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Menu Usage Analytics -->
                <div class="bg-white border rounded-lg p-6">
                    <h4 class="font-semibold text-gray-900 mb-4">Usage Analytics</h4>
                    <div id="menuAnalyticsChart">
                        ${this.renderUsageAnalytics()}
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex space-x-4">
                    <button onclick="adminMenuManager.saveGlobalSettings()" class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
                        Save Settings
                    </button>
                    <button onclick="adminMenuManager.resetAllMenus()" class="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600">
                        Reset All Menus
                    </button>
                    <button onclick="adminMenuManager.exportMenuConfig()" class="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600">
                        Export Configuration
                    </button>
                </div>
            </div>
        `;
    }

    renderUsageAnalytics() {
        const usage = JSON.parse(localStorage.getItem('menuUsage') || '{}');
        const topItems = Object.entries(usage)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);

        if (topItems.length === 0) {
            return '<p class="text-gray-500 text-center py-8">No usage data available</p>';
        }

        return `
            <div class="space-y-3">
                <h5 class="font-medium text-gray-700">Most Used Menu Items</h5>
                ${topItems.map(([item, count], index) => `
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div class="flex items-center space-x-3">
                            <span class="w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">${index + 1}</span>
                            <span class="text-sm font-medium">${item.split('_')[1] || item}</span>
                        </div>
                        <span class="text-sm text-gray-600">${count} clicks</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getMenuItemsForRole(role) {
        const defaultMenus = {
            client: [
                { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt', url: 'client-dashboard.html', description: 'Overview and statistics', priority: 1, color: 'blue' },
                { id: 'post-job', label: 'Post Job', icon: 'fas fa-plus-circle', url: 'post-job.html', description: 'Create new job posting', priority: 2, color: 'green' },
                { id: 'browse-talent', label: 'Browse Talent', icon: 'fas fa-users', url: 'browse.html', description: 'Find freelancers', priority: 3, color: 'purple' },
                { id: 'messages', label: 'Messages', icon: 'fas fa-envelope', url: 'client-messages.html', description: 'Communication center', priority: 4, color: 'indigo' },
                { id: 'profile', label: 'Profile', icon: 'fas fa-user', url: 'client-profile.html', description: 'Account settings', priority: 5, color: 'gray' }
            ],
            freelancer: [
                { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt', url: 'freelancer-dashboard.html', description: 'Overview and statistics', priority: 1, color: 'blue' },
                { id: 'find-jobs', label: 'Find Jobs', icon: 'fas fa-search', url: 'browse.html', description: 'Browse opportunities', priority: 2, color: 'green' },
                { id: 'job-map', label: 'Job Map', icon: 'fas fa-map-marked-alt', url: 'map.html', description: 'Location-based jobs', priority: 3, color: 'red' },
                { id: 'messages', label: 'Messages', icon: 'fas fa-envelope', url: 'freelancer-messages.html', description: 'Communication center', priority: 4, color: 'indigo' },
                { id: 'profile', label: 'Profile', icon: 'fas fa-user', url: 'profile.html', description: 'Professional profile', priority: 5, color: 'gray' }
            ],
            admin: [
                { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt', url: 'admin-dashboard.html', description: 'System overview', priority: 1, color: 'red' },
                { id: 'users', label: 'Users', icon: 'fas fa-users-cog', url: 'admin-dashboard.html#users', description: 'User management', priority: 2, color: 'blue' },
                { id: 'jobs', label: 'Jobs', icon: 'fas fa-briefcase', url: 'admin-dashboard.html#jobs', description: 'Job management', priority: 3, color: 'green' },
                { id: 'verifications', label: 'Verifications', icon: 'fas fa-certificate', url: 'admin-dashboard.html#verifications', description: 'User verifications', priority: 4, color: 'orange' },
                { id: 'settings', label: 'Settings', icon: 'fas fa-cog', url: 'admin-settings.html', description: 'System settings', priority: 5, color: 'gray' }
            ]
        };

        // Get custom menu items from localStorage
        const customMenus = JSON.parse(localStorage.getItem('customMenuItems') || '{}');
        const roleMenus = customMenus[role] || defaultMenus[role] || [];
        
        return roleMenus;
    }

    getMenuUsageCount(role) {
        const usage = JSON.parse(localStorage.getItem('menuUsage') || '{}');
        return Object.values(usage).reduce((sum, count) => sum + count, 0);
    }

    getItemUsageCount(itemId) {
        const usage = JSON.parse(localStorage.getItem('menuUsage') || '{}');
        return Object.entries(usage)
            .filter(([key]) => key.includes(itemId))
            .reduce((sum, [, count]) => sum + count, 0);
    }

    toggleMenuItem(itemId, role) {
        const customMenus = JSON.parse(localStorage.getItem('customMenuItems') || '{}');
        if (!customMenus[role]) {
            customMenus[role] = this.getMenuItemsForRole(role);
        }
        
        const item = customMenus[role].find(item => item.id === itemId);
        if (item) {
            item.enabled = item.enabled !== false ? false : true;
            localStorage.setItem('customMenuItems', JSON.stringify(customMenus));
            this.loadMenuForRole(role);
            this.showNotification(`Menu item ${item.enabled ? 'enabled' : 'disabled'}`, 'success');
        }
    }

    editMenuItem(itemId, role) {
        const menuItems = this.getMenuItemsForRole(role);
        const item = menuItems.find(item => item.id === itemId);
        if (!item) return;

        this.showEditItemModal(item, role);
    }

    deleteMenuItem(itemId, role) {
        if (!confirm('Are you sure you want to delete this menu item?')) return;

        const customMenus = JSON.parse(localStorage.getItem('customMenuItems') || '{}');
        if (!customMenus[role]) {
            customMenus[role] = this.getMenuItemsForRole(role);
        }
        
        customMenus[role] = customMenus[role].filter(item => item.id !== itemId);
        localStorage.setItem('customMenuItems', JSON.stringify(customMenus));
        this.loadMenuForRole(role);
        this.showNotification('Menu item deleted', 'success');
    }

    showAddItemModal(role) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-lg max-w-md w-full">
                <div class="p-6 border-b">
                    <h3 class="text-lg font-semibold">Add Menu Item</h3>
                </div>
                <form id="addItemForm" class="p-6 space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Label</label>
                        <input type="text" name="label" required class="w-full border border-gray-300 rounded-lg px-3 py-2">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">URL</label>
                        <input type="text" name="url" required class="w-full border border-gray-300 rounded-lg px-3 py-2">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Icon (Font Awesome class)</label>
                        <input type="text" name="icon" placeholder="fas fa-star" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <input type="text" name="description" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Color</label>
                        <select name="color" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                            <option value="blue">Blue</option>
                            <option value="green">Green</option>
                            <option value="red">Red</option>
                            <option value="purple">Purple</option>
                            <option value="indigo">Indigo</option>
                            <option value="yellow">Yellow</option>
                            <option value="gray">Gray</option>
                        </select>
                    </div>
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" onclick="this.closest('.fixed').remove()" class="px-4 py-2 border border-gray-300 rounded-lg">Cancel</button>
                        <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Add Item</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        const form = modal.querySelector('#addItemForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            
            const newItem = {
                id: 'custom_' + Date.now(),
                label: formData.get('label'),
                url: formData.get('url'),
                icon: formData.get('icon') || 'fas fa-star',
                description: formData.get('description') || '',
                color: formData.get('color'),
                priority: 999,
                enabled: true,
                custom: true
            };

            const customMenus = JSON.parse(localStorage.getItem('customMenuItems') || '{}');
            if (!customMenus[role]) {
                customMenus[role] = this.getMenuItemsForRole(role);
            }
            
            customMenus[role].push(newItem);
            localStorage.setItem('customMenuItems', JSON.stringify(customMenus));
            
            this.loadMenuForRole(role);
            this.showNotification('Menu item added', 'success');
            modal.remove();
        });
    }

    showEditItemModal(item, role) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-lg max-w-md w-full">
                <div class="p-6 border-b">
                    <h3 class="text-lg font-semibold">Edit Menu Item</h3>
                </div>
                <form id="editItemForm" class="p-6 space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Label</label>
                        <input type="text" name="label" value="${item.label}" required class="w-full border border-gray-300 rounded-lg px-3 py-2">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">URL</label>
                        <input type="text" name="url" value="${item.url}" required class="w-full border border-gray-300 rounded-lg px-3 py-2">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                        <input type="text" name="icon" value="${item.icon}" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <input type="text" name="description" value="${item.description || ''}" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Color</label>
                        <select name="color" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                            <option value="blue" ${item.color === 'blue' ? 'selected' : ''}>Blue</option>
                            <option value="green" ${item.color === 'green' ? 'selected' : ''}>Green</option>
                            <option value="red" ${item.color === 'red' ? 'selected' : ''}>Red</option>
                            <option value="purple" ${item.color === 'purple' ? 'selected' : ''}>Purple</option>
                            <option value="indigo" ${item.color === 'indigo' ? 'selected' : ''}>Indigo</option>
                            <option value="yellow" ${item.color === 'yellow' ? 'selected' : ''}>Yellow</option>
                            <option value="gray" ${item.color === 'gray' ? 'selected' : ''}>Gray</option>
                        </select>
                    </div>
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" onclick="this.closest('.fixed').remove()" class="px-4 py-2 border border-gray-300 rounded-lg">Cancel</button>
                        <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Save Changes</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        const form = modal.querySelector('#editItemForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            
            const customMenus = JSON.parse(localStorage.getItem('customMenuItems') || '{}');
            if (!customMenus[role]) {
                customMenus[role] = this.getMenuItemsForRole(role);
            }
            
            const itemIndex = customMenus[role].findIndex(i => i.id === item.id);
            if (itemIndex !== -1) {
                customMenus[role][itemIndex] = {
                    ...customMenus[role][itemIndex],
                    label: formData.get('label'),
                    url: formData.get('url'),
                    icon: formData.get('icon'),
                    description: formData.get('description'),
                    color: formData.get('color')
                };
                
                localStorage.setItem('customMenuItems', JSON.stringify(customMenus));
                this.loadMenuForRole(role);
                this.showNotification('Menu item updated', 'success');
            }
            
            modal.remove();
        });
    }

    setupMenuControls() {
        // Add menu item button
        const addBtn = document.getElementById('addMenuItemBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                const activeTab = document.querySelector('.menu-tab.border-blue-500');
                const role = activeTab ? activeTab.dataset.role : 'client';
                if (role !== 'global') {
                    this.showAddItemModal(role);
                }
            });
        }

        // Reset menus button
        const resetBtn = document.getElementById('resetMenusBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Reset all menus to default? This will remove all customizations.')) {
                    localStorage.removeItem('customMenuItems');
                    const activeTab = document.querySelector('.menu-tab.border-blue-500');
                    const role = activeTab ? activeTab.dataset.role : 'client';
                    this.loadMenuForRole(role);
                    this.showNotification('Menus reset to default', 'success');
                }
            });
        }
    }

    enhanceAdminNavigation() {
        // Add menu management to admin sidebar
        const sidebar = document.querySelector('#sidebar nav');
        if (sidebar) {
            const menuLink = sidebar.querySelector('[data-section="menu"]');
            if (menuLink) {
                // Add badge for menu management
                const badge = document.createElement('span');
                badge.className = 'ml-auto bg-blue-500 text-white text-xs px-2 py-1 rounded-full';
                badge.textContent = 'NEW';
                menuLink.appendChild(badge);
            }
        }
    }

    addQuickActions() {
        // Add quick menu actions to dashboard
        const quickActions = document.querySelector('.bg-white.rounded-xl.p-6.shadow-sm.border h3');
        if (quickActions && quickActions.textContent.includes('Quick Actions')) {
            const container = quickActions.parentElement.querySelector('.space-y-3');
            if (container) {
                const menuAction = document.createElement('button');
                menuAction.className = 'w-full flex items-center px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors';
                menuAction.innerHTML = '<i class="fas fa-bars mr-3"></i>Menu Management';
                menuAction.onclick = () => window.showSection('menu');
                container.appendChild(menuAction);
            }
        }
    }

    setupMenuAnalytics() {
        // Track menu management usage
        this.trackMenuManagementUsage();
    }

    trackMenuManagementUsage() {
        const usage = JSON.parse(localStorage.getItem('adminMenuUsage') || '{}');
        usage.menuManagementAccess = (usage.menuManagementAccess || 0) + 1;
        usage.lastAccessed = new Date().toISOString();
        localStorage.setItem('adminMenuUsage', JSON.stringify(usage));
    }

    saveGlobalSettings() {
        const settings = {
            enableSearch: document.getElementById('enableMenuSearch')?.checked || false,
            enableBadges: document.getElementById('enableMenuBadges')?.checked || false,
            enableAnalytics: document.getElementById('enableMenuAnalytics')?.checked || false,
            enableShortcuts: document.getElementById('enableMenuShortcuts')?.checked || false,
            theme: document.getElementById('menuTheme')?.value || 'default',
            animationSpeed: document.getElementById('animationSpeed')?.value || 'normal'
        };

        localStorage.setItem('menuGlobalSettings', JSON.stringify(settings));
        this.showNotification('Settings saved successfully', 'success');
    }

    resetAllMenus() {
        if (!confirm('Reset ALL menus to default? This will remove all customizations for all roles.')) return;

        localStorage.removeItem('customMenuItems');
        localStorage.removeItem('menuGlobalSettings');
        localStorage.removeItem('menuUsage');
        
        this.showNotification('All menus reset to default', 'success');
        
        // Reload current view
        const activeTab = document.querySelector('.menu-tab.border-blue-500');
        const role = activeTab ? activeTab.dataset.role : 'client';
        this.loadMenuForRole(role);
    }

    exportMenuConfig() {
        const config = {
            customMenuItems: JSON.parse(localStorage.getItem('customMenuItems') || '{}'),
            globalSettings: JSON.parse(localStorage.getItem('menuGlobalSettings') || '{}'),
            usage: JSON.parse(localStorage.getItem('menuUsage') || '{}'),
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `menu-config-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Menu configuration exported', 'success');
    }

    showNotification(message, type = 'info') {
        // Use existing notification system if available
        if (typeof showNotification === 'function') {
            showNotification(message, type);
            return;
        }

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

// Initialize admin menu manager
let adminMenuManager;

document.addEventListener('DOMContentLoaded', function() {
    // Only initialize on admin dashboard
    if (window.location.pathname.includes('admin-dashboard.html')) {
        adminMenuManager = new AdminMenuManager();
        window.adminMenuManager = adminMenuManager;
    }
});

// Export for global access
window.AdminMenuManager = AdminMenuManager;