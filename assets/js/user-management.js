/**
 * User Management JavaScript
 * Enhanced user management functionality for admin dashboard
 */

class UserManagement {
    constructor() {
        this.users = [];
        this.filteredUsers = [];
        this.currentPage = 1;
        this.usersPerPage = 10;
        this.init();
    }

    init() {
        this.loadUsers();
        this.setupEventListeners();
        this.renderUsers();
    }

    setupEventListeners() {
        // Add user button
        const addUserBtn = document.getElementById('addUserBtn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => this.showAddUserModal());
        }

        // Search functionality
        const searchInput = document.getElementById('userSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.searchUsers(e.target.value));
        }

        // Role filter
        const roleFilter = document.getElementById('userRoleFilter');
        if (roleFilter) {
            roleFilter.addEventListener('change', (e) => this.filterByRole(e.target.value));
        }

        // Status filter
        const statusFilter = document.getElementById('userStatusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => this.filterByStatus(e.target.value));
        }

        // Bulk actions
        const bulkActionBtn = document.getElementById('bulkActionBtn');
        if (bulkActionBtn) {
            bulkActionBtn.addEventListener('click', () => this.handleBulkActions());
        }

        // Select all checkbox
        const selectAllCheckbox = document.getElementById('selectAllUsers');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => this.selectAllUsers(e.target.checked));
        }
    }

    loadUsers() {
        this.users = JSON.parse(localStorage.getItem('users') || '[]');
        this.filteredUsers = [...this.users];
    }

    searchUsers(query) {
        if (!query.trim()) {
            this.filteredUsers = [...this.users];
        } else {
            const searchTerm = query.toLowerCase();
            this.filteredUsers = this.users.filter(user => 
                user.fullName.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm) ||
                user.role.toLowerCase().includes(searchTerm) ||
                (user.phone && user.phone.includes(searchTerm))
            );
        }
        this.currentPage = 1;
        this.renderUsers();
    }

    filterByRole(role) {
        if (!role) {
            this.filteredUsers = [...this.users];
        } else {
            this.filteredUsers = this.users.filter(user => user.role === role);
        }
        this.currentPage = 1;
        this.renderUsers();
    }

    filterByStatus(status) {
        if (!status) {
            this.filteredUsers = [...this.users];
        } else {
            const isVerified = status === 'verified';
            this.filteredUsers = this.users.filter(user => user.verified === isVerified);
        }
        this.currentPage = 1;
        this.renderUsers();
    }

    renderUsers() {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        const startIndex = (this.currentPage - 1) * this.usersPerPage;
        const endIndex = startIndex + this.usersPerPage;
        const paginatedUsers = this.filteredUsers.slice(startIndex, endIndex);

        if (paginatedUsers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-12 text-center">
                        <div class="text-gray-500">
                            <i class="fas fa-users text-4xl mb-4"></i>
                            <p class="text-lg font-medium">No users found</p>
                            <p class="text-sm">Try adjusting your search or filter criteria</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = paginatedUsers.map(user => `
            <tr class="hover:bg-gray-50 ${user.selected ? 'bg-blue-50' : ''}">
                <td class="px-6 py-4">
                    <input type="checkbox" class="user-checkbox rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                           data-user-id="${user.id}" ${user.selected ? 'checked' : ''}>
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                            <span class="text-white font-semibold">${user.fullName.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                            <div class="font-medium text-gray-900">${user.fullName}</div>
                            <div class="text-sm text-gray-500">${user.email}</div>
                            ${user.phone ? `<div class="text-xs text-gray-400">${user.phone}</div>` : ''}
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <span class="px-3 py-1 text-xs font-medium rounded-full ${this.getRoleColor(user.role)}">
                        ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <div class="w-2 h-2 rounded-full mr-2 ${user.verified ? 'bg-green-500' : 'bg-yellow-500'}"></div>
                        <span class="px-2 py-1 text-xs rounded-full ${user.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                            ${user.verified ? 'Verified' : 'Pending'}
                        </span>
                    </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                    <div>${new Date(user.createdAt).toLocaleDateString()}</div>
                    <div class="text-xs text-gray-400">${this.getTimeAgo(user.createdAt)}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center space-x-2">
                        <button class="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100" 
                                onclick="userManagement.viewUser('${user.id}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-100" 
                                onclick="userManagement.editUser('${user.id}')" title="Edit User">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${!user.verified && user.role === 'freelancer' ? `
                            <button class="text-purple-600 hover:text-purple-800 p-1 rounded hover:bg-purple-100" 
                                    onclick="userManagement.verifyUser('${user.id}')" title="Verify User">
                                <i class="fas fa-check-circle"></i>
                            </button>
                        ` : ''}
                        <button class="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100" 
                                onclick="userManagement.deleteUser('${user.id}')" title="Delete User">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Add event listeners for checkboxes
        tbody.querySelectorAll('.user-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.toggleUserSelection(e.target.dataset.userId, e.target.checked);
            });
        });

        this.renderPagination();
        this.updateStats();
    }

    renderPagination() {
        const paginationContainer = document.getElementById('usersPagination');
        if (!paginationContainer) return;

        const totalPages = Math.ceil(this.filteredUsers.length / this.usersPerPage);
        
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = `
            <div class="flex items-center justify-between">
                <div class="text-sm text-gray-700">
                    Showing ${(this.currentPage - 1) * this.usersPerPage + 1} to 
                    ${Math.min(this.currentPage * this.usersPerPage, this.filteredUsers.length)} of 
                    ${this.filteredUsers.length} users
                </div>
                <div class="flex space-x-1">
        `;

        // Previous button
        paginationHTML += `
            <button class="px-3 py-1 text-sm border rounded ${this.currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}" 
                    ${this.currentPage === 1 ? 'disabled' : ''} onclick="userManagement.goToPage(${this.currentPage - 1})">
                Previous
            </button>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                paginationHTML += `
                    <button class="px-3 py-1 text-sm border rounded ${i === this.currentPage ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}" 
                            onclick="userManagement.goToPage(${i})">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += `<span class="px-2 py-1 text-sm text-gray-500">...</span>`;
            }
        }

        // Next button
        paginationHTML += `
            <button class="px-3 py-1 text-sm border rounded ${this.currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}" 
                    ${this.currentPage === totalPages ? 'disabled' : ''} onclick="userManagement.goToPage(${this.currentPage + 1})">
                Next
            </button>
        `;

        paginationHTML += `
                </div>
            </div>
        `;

        paginationContainer.innerHTML = paginationHTML;
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderUsers();
    }

    updateStats() {
        const totalUsers = this.users.length;
        const verifiedUsers = this.users.filter(u => u.verified).length;
        const freelancers = this.users.filter(u => u.role === 'freelancer').length;
        const clients = this.users.filter(u => u.role === 'client').length;

        // Update stats in dashboard if elements exist
        const totalUsersEl = document.getElementById('totalUsersCount');
        if (totalUsersEl) totalUsersEl.textContent = totalUsers;

        const verifiedUsersEl = document.getElementById('verifiedUsersCount');
        if (verifiedUsersEl) verifiedUsersEl.textContent = verifiedUsers;

        const freelancersEl = document.getElementById('freelancersCount');
        if (freelancersEl) freelancersEl.textContent = freelancers;

        const clientsEl = document.getElementById('clientsCount');
        if (clientsEl) clientsEl.textContent = clients;
    }

    showAddUserModal() {
        const modal = this.createModal('Add New User', `
            <form id="addUserForm" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                        <input type="text" name="fullName" required class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                        <input type="email" name="email" required class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input type="tel" name="phone" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                        <select name="role" required class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option value="">Select Role</option>
                            <option value="freelancer">Freelancer</option>
                            <option value="client">Client</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                    <input type="password" name="password" required minlength="6" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <p class="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                </div>
                <div class="flex items-center space-x-4">
                    <label class="flex items-center">
                        <input type="checkbox" name="verified" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                        <span class="ml-2 text-sm text-gray-700">Verified</span>
                    </label>
                    <label class="flex items-center">
                        <input type="checkbox" name="sendWelcomeEmail" checked class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                        <span class="ml-2 text-sm text-gray-700">Send welcome email</span>
                    </label>
                </div>
                <div class="flex justify-end space-x-3 pt-4 border-t">
                    <button type="button" onclick="this.closest('.fixed').remove()" class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                        Cancel
                    </button>
                    <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Add User
                    </button>
                </div>
            </form>
        `);

        const form = modal.querySelector('#addUserForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddUser(form, modal);
        });
    }

    handleAddUser(form, modal) {
        const formData = new FormData(form);
        
        // Check if email already exists
        const email = formData.get('email');
        if (this.users.find(user => user.email === email)) {
            this.showNotification('Email already exists!', 'error');
            return;
        }

        const newUser = {
            id: 'user_' + Date.now(),
            fullName: formData.get('fullName'),
            email: email,
            phone: formData.get('phone') || '',
            role: formData.get('role'),
            password: formData.get('password'), // In real app, this would be hashed
            verified: formData.has('verified'),
            createdAt: new Date().toISOString(),
            lastLogin: null,
            profileComplete: false
        };

        // Add user to storage
        this.users.push(newUser);
        localStorage.setItem('users', JSON.stringify(this.users));

        // Send welcome email if checked
        if (formData.has('sendWelcomeEmail')) {
            this.sendWelcomeEmail(newUser);
        }

        this.showNotification('User added successfully!', 'success');
        this.loadUsers();
        this.renderUsers();
        modal.remove();
    }

    viewUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        const modal = this.createModal('User Details', `
            <div class="space-y-6">
                <div class="flex items-center space-x-4">
                    <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span class="text-white font-bold text-xl">${user.fullName.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-gray-900">${user.fullName}</h3>
                        <p class="text-gray-600">${user.email}</p>
                        <span class="px-3 py-1 text-xs font-medium rounded-full ${this.getRoleColor(user.role)}">
                            ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 class="font-semibold text-gray-800 mb-3">Contact Information</h4>
                        <div class="space-y-2 text-sm">
                            <p><span class="font-medium">Email:</span> ${user.email}</p>
                            <p><span class="font-medium">Phone:</span> ${user.phone || 'Not provided'}</p>
                            <p><span class="font-medium">Location:</span> ${user.location || 'Not specified'}</p>
                        </div>
                    </div>
                    <div>
                        <h4 class="font-semibold text-gray-800 mb-3">Account Status</h4>
                        <div class="space-y-2 text-sm">
                            <p><span class="font-medium">Status:</span> 
                                <span class="px-2 py-1 text-xs rounded-full ${user.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                                    ${user.verified ? 'Verified' : 'Pending'}
                                </span>
                            </p>
                            <p><span class="font-medium">Joined:</span> ${new Date(user.createdAt).toLocaleDateString()}</p>
                            <p><span class="font-medium">Last Login:</span> ${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</p>
                        </div>
                    </div>
                </div>

                ${user.role === 'freelancer' ? `
                    <div>
                        <h4 class="font-semibold text-gray-800 mb-3">Professional Information</h4>
                        <div class="space-y-2 text-sm">
                            <p><span class="font-medium">Title:</span> ${user.professionalTitle || 'Not specified'}</p>
                            <p><span class="font-medium">Skills:</span> ${user.skills || 'Not specified'}</p>
                            <p><span class="font-medium">Experience:</span> ${user.experienceLevel || 'Not specified'}</p>
                            <p><span class="font-medium">Hourly Rate:</span> ${user.hourlyRate ? '$' + user.hourlyRate : 'Not set'}</p>
                        </div>
                    </div>
                ` : ''}

                <div class="flex justify-end space-x-3 pt-4 border-t">
                    <button onclick="userManagement.editUser('${user.id}'); this.closest('.fixed').remove();" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Edit User
                    </button>
                    <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                        Close
                    </button>
                </div>
            </div>
        `);
    }

    editUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        const modal = this.createModal('Edit User', `
            <form id="editUserForm" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input type="text" name="fullName" value="${user.fullName}" required class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input type="email" name="email" value="${user.email}" required class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input type="tel" name="phone" value="${user.phone || ''}" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Role</label>
                        <select name="role" required class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option value="freelancer" ${user.role === 'freelancer' ? 'selected' : ''}>Freelancer</option>
                            <option value="client" ${user.role === 'client' ? 'selected' : ''}>Client</option>
                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                        </select>
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                    <label class="flex items-center">
                        <input type="checkbox" name="verified" ${user.verified ? 'checked' : ''} class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                        <span class="ml-2 text-sm text-gray-700">Verified</span>
                    </label>
                </div>
                <div class="flex justify-end space-x-3 pt-4 border-t">
                    <button type="button" onclick="this.closest('.fixed').remove()" class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                        Cancel
                    </button>
                    <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Save Changes
                    </button>
                </div>
            </form>
        `);

        const form = modal.querySelector('#editUserForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEditUser(userId, form, modal);
        });
    }

    handleEditUser(userId, form, modal) {
        const formData = new FormData(form);
        const userIndex = this.users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) return;

        // Check if email is being changed and if it already exists
        const newEmail = formData.get('email');
        const existingUser = this.users.find(u => u.email === newEmail && u.id !== userId);
        if (existingUser) {
            this.showNotification('Email already exists!', 'error');
            return;
        }

        // Update user
        this.users[userIndex] = {
            ...this.users[userIndex],
            fullName: formData.get('fullName'),
            email: newEmail,
            phone: formData.get('phone'),
            role: formData.get('role'),
            verified: formData.has('verified')
        };

        localStorage.setItem('users', JSON.stringify(this.users));
        
        this.showNotification('User updated successfully!', 'success');
        this.loadUsers();
        this.renderUsers();
        modal.remove();
    }

    deleteUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            this.showNotification('User not found', 'error');
            return;
        }

        if (!confirm(`⚠️ DELETE USER\n\nUser: ${user.fullName}\nEmail: ${user.email}\nRole: ${user.role}\n\nThis will permanently delete:\n• User account and profile\n• All jobs posted by this user\n• All job applications\n• All conversations\n• All related data\n\nThis action CANNOT be undone!\n\nContinue?`)) {
            return;
        }

        // Use secure permanent deletion system
        const result = window.secureDeleteSystem ? 
            window.secureDeleteSystem.deleteSingleUser(userId) : 
            this.fallbackDeleteUser(userId);
        
        if (result && result.success) {
            this.showNotification(result.message, 'success');
            this.loadUsers();
            this.renderUsers();
            this.updateStats();
            
            // Update dashboard components
            if (typeof loadDashboardData === 'function') {
                loadDashboardData();
            }
            if (window.updateDashboardStats) {
                window.updateDashboardStats();
            }
        } else {
            this.showNotification(result ? result.error : 'Failed to delete user', 'error');
        }
    }

    fallbackDeleteUser(userId) {
        try {
            let users = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = users.findIndex(u => u.id === userId);
            
            if (userIndex === -1) {
                return { success: false, error: 'User not found' };
            }
            
            const user = users[userIndex];
            users.splice(userIndex, 1);
            localStorage.setItem('users', JSON.stringify(users));
            
            return {
                success: true,
                message: `User "${user.fullName}" deleted successfully`
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    verifyUser(userId) {
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex === -1) return;

        this.users[userIndex].verified = true;
        localStorage.setItem('users', JSON.stringify(this.users));

        this.showNotification('User verified successfully!', 'success');
        this.loadUsers();
        this.renderUsers();
    }

    toggleUserSelection(userId, selected) {
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            this.users[userIndex].selected = selected;
        }
    }

    selectAllUsers(selected) {
        const startIndex = (this.currentPage - 1) * this.usersPerPage;
        const endIndex = startIndex + this.usersPerPage;
        const paginatedUsers = this.filteredUsers.slice(startIndex, endIndex);

        paginatedUsers.forEach(user => {
            const userIndex = this.users.findIndex(u => u.id === user.id);
            if (userIndex !== -1) {
                this.users[userIndex].selected = selected;
            }
        });

        this.renderUsers();
    }

    handleBulkActions() {
        const selectedUsers = this.users.filter(u => u.selected);
        if (selectedUsers.length === 0) {
            this.showNotification('Please select users first', 'warning');
            return;
        }

        const modal = this.createModal('Bulk Actions', `
            <div class="space-y-4">
                <p class="text-gray-600">Selected ${selectedUsers.length} user(s)</p>
                <div class="space-y-2">
                    <button onclick="userManagement.bulkVerify()" class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        <i class="fas fa-check-circle mr-2"></i>Verify Selected Users
                    </button>
                    <button onclick="userManagement.bulkUnverify()" class="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                        <i class="fas fa-times-circle mr-2"></i>Unverify Selected Users
                    </button>
                    <button onclick="userManagement.bulkDelete()" class="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        <i class="fas fa-trash mr-2"></i>Delete Selected Users
                    </button>
                    <hr class="my-3">
                    <button onclick="userManagement.showDeleteAllModal()" class="w-full px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900">
                        <i class="fas fa-exclamation-triangle mr-2"></i>Delete ALL Users
                    </button>
                </div>
                <div class="flex justify-end pt-4 border-t">
                    <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                        Cancel
                    </button>
                </div>
            </div>
        `);
    }

    bulkVerify() {
        const selectedUsers = this.users.filter(u => u.selected);
        selectedUsers.forEach(user => {
            const userIndex = this.users.findIndex(u => u.id === user.id);
            if (userIndex !== -1) {
                this.users[userIndex].verified = true;
                this.users[userIndex].selected = false;
            }
        });

        localStorage.setItem('users', JSON.stringify(this.users));
        this.showNotification(`${selectedUsers.length} user(s) verified successfully!`, 'success');
        this.loadUsers();
        this.renderUsers();
        document.querySelector('.fixed').remove();
    }

    bulkUnverify() {
        const selectedUsers = this.users.filter(u => u.selected);
        selectedUsers.forEach(user => {
            const userIndex = this.users.findIndex(u => u.id === user.id);
            if (userIndex !== -1) {
                this.users[userIndex].verified = false;
                this.users[userIndex].selected = false;
            }
        });

        localStorage.setItem('users', JSON.stringify(this.users));
        this.showNotification(`${selectedUsers.length} user(s) unverified successfully!`, 'success');
        this.loadUsers();
        this.renderUsers();
        document.querySelector('.fixed').remove();
    }

    bulkDelete() {
        const selectedUsers = this.users.filter(u => u.selected);
        
        if (selectedUsers.length === 0) {
            this.showNotification('No users selected', 'warning');
            return;
        }
        
        const userSummary = selectedUsers.map(u => `• ${u.fullName} (${u.email}) - ${u.role}`).join('\n');
        
        if (!confirm(`⚠️ BULK DELETE USERS\n\nThis will permanently delete ${selectedUsers.length} user(s):\n\n${userSummary}\n\nThis will also delete:\n• All jobs posted by these users\n• All job applications\n• All conversations\n• All related data\n\nThis action CANNOT be undone!\n\nContinue?`)) {
            return;
        }

        const selectedIds = selectedUsers.map(u => u.id);
        
        // Use secure bulk deletion
        if (window.secureDeleteSystem) {
            window.secureDeleteSystem.cleanupMultipleUsersData(selectedIds);
            
            let users = JSON.parse(localStorage.getItem('users') || '[]');
            users = users.filter(u => !selectedIds.includes(u.id));
            localStorage.setItem('users', JSON.stringify(users));
            
            this.showNotification(`${selectedUsers.length} user(s) deleted permanently!`, 'success');
        } else {
            // Fallback deletion
            let successCount = 0;
            selectedIds.forEach(userId => {
                const result = this.fallbackDeleteUser(userId);
                if (result && result.success) {
                    successCount++;
                }
            });
            
            this.showNotification(`${successCount} user(s) deleted!`, 'success');
        }

        this.loadUsers();
        this.renderUsers();
        this.updateStats();
        
        // Update dashboard stats
        if (typeof loadDashboardData === 'function') {
            loadDashboardData();
        }
        if (window.updateDashboardStats) {
            window.updateDashboardStats();
        }
        
        document.querySelector('.fixed').remove();
    }

    sendWelcomeEmail(user) {
        // Simulate sending welcome email
        console.log(`Welcome email sent to ${user.email}`);
    }

    // Utility functions
    getRoleColor(role) {
        const colors = {
            'admin': 'bg-red-100 text-red-800',
            'client': 'bg-blue-100 text-blue-800',
            'freelancer': 'bg-green-100 text-green-800'
        };
        return colors[role] || 'bg-gray-100 text-gray-800';
    }

    getTimeAgo(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        
        return date.toLocaleDateString();
    }

    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div class="p-6 border-b border-gray-200">
                    <div class="flex justify-between items-start">
                        <h2 class="text-xl font-bold text-gray-800">${title}</h2>
                        <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                </div>
                <div class="p-6">
                    ${content}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        return modal;
    }

    showDeleteAllModal() {
        const userCounts = this.getUserCounts();
        
        const modal = this.createModal('⚠️ DELETE ALL USERS', `
            <div class="space-y-6">
                <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div class="flex items-center mb-3">
                        <i class="fas fa-exclamation-triangle text-red-600 text-xl mr-3"></i>
                        <h3 class="text-lg font-semibold text-red-800">DANGER ZONE</h3>
                    </div>
                    <p class="text-red-700 mb-3">This action will permanently delete ALL users from the system:</p>
                    <ul class="text-red-700 space-y-1 ml-4">
                        <li>• ${userCounts.clients} Client${userCounts.clients !== 1 ? 's' : ''}</li>
                        <li>• ${userCounts.freelancers} Freelancer${userCounts.freelancers !== 1 ? 's' : ''}</li>
                        <li>• ${userCounts.admins} Admin${userCounts.admins !== 1 ? 's' : ''}</li>
                        <li>• <strong>Total: ${userCounts.total} users</strong></li>
                    </ul>
                </div>
                
                <div class="space-y-3">
                    <button onclick="userManagement.deleteAllUsers('all')" class="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">
                        <i class="fas fa-trash-alt mr-2"></i>Delete ALL Users (${userCounts.total})
                    </button>
                    <button onclick="userManagement.deleteAllUsers('clients')" class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <i class="fas fa-user-tie mr-2"></i>Delete Only Clients (${userCounts.clients})
                    </button>
                    <button onclick="userManagement.deleteAllUsers('freelancers')" class="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        <i class="fas fa-user-cog mr-2"></i>Delete Only Freelancers (${userCounts.freelancers})
                    </button>
                    <button onclick="userManagement.deleteAllUsers('admins')" class="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                        <i class="fas fa-user-shield mr-2"></i>Delete Only Admins (${userCounts.admins})
                    </button>
                </div>
                
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div class="flex items-center mb-2">
                        <i class="fas fa-info-circle text-yellow-600 mr-2"></i>
                        <span class="font-medium text-yellow-800">Alternative Options:</span>
                    </div>
                    <div class="space-y-2">
                        <button onclick="userManagement.deleteAllUsersKeepAdmin()" class="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                            <i class="fas fa-user-shield mr-2"></i>Delete All Users (Keep 1 Admin)
                        </button>
                        <button onclick="userManagement.resetToDefaults()" class="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                            <i class="fas fa-undo mr-2"></i>Reset to Default Admin Only
                        </button>
                    </div>
                </div>
                
                <div class="flex justify-end space-x-3 pt-4 border-t">
                    <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                        Cancel
                    </button>
                </div>
            </div>
        `);
    }

    getUserCounts() {
        const clients = this.users.filter(u => u.role === 'client').length;
        const freelancers = this.users.filter(u => u.role === 'freelancer').length;
        const admins = this.users.filter(u => u.role === 'admin').length;
        return {
            clients,
            freelancers,
            admins,
            total: this.users.length
        };
    }

    deleteAllUsers(type) {
        const counts = this.getUserCounts();
        const targetCount = type === 'all' ? counts.total : counts[type];
        
        if (targetCount === 0) {
            this.showNotification(`No ${type} users to delete`, 'info');
            document.querySelector('.fixed').remove();
            return;
        }
        
        let confirmMessage = `⚠️ DELETE ${type.toUpperCase()} USERS\n\nThis will permanently delete ${targetCount} ${type} user(s) and:\n• All their jobs and applications\n• All conversations\n• All related data\n\nThis action CANNOT be undone!\n\nContinue?`;
        
        if (!confirm(confirmMessage)) {
            return;
        }
        
        // Double confirmation for critical actions
        if (type === 'all' || type === 'admins') {
            const doubleConfirm = prompt('Type "DELETE" to confirm this dangerous action:');
            if (doubleConfirm !== 'DELETE') {
                this.showNotification('Action cancelled - confirmation failed', 'warning');
                return;
            }
        }
        
        // Use secure permanent deletion system
        try {
            const result = window.secureDeleteSystem ? 
                window.secureDeleteSystem.deleteUsersByRole(type) : 
                this.fallbackDeleteByRole(type);
            
            if (result && result.success) {
                this.showNotification(result.message, 'success');
                this.loadUsers();
                this.renderUsers();
                this.updateStats();
                
                // Update all dashboard data
                if (typeof loadDashboardData === 'function') {
                    loadDashboardData();
                }
                if (window.updateDashboardStats) {
                    window.updateDashboardStats();
                }
            } else {
                this.showNotification(result ? result.error : 'Deletion failed', 'error');
            }
        } catch (error) {
            this.showNotification('Error during deletion: ' + error.message, 'error');
        }
        
        // Close modal
        document.querySelector('.fixed').remove();
    }

    fallbackDeleteByRole(role) {
        try {
            let users = JSON.parse(localStorage.getItem('users') || '[]');
            const originalCount = users.length;
            
            if (role === 'all') {
                users = [];
            } else {
                users = users.filter(u => u.role !== role);
            }
            
            localStorage.setItem('users', JSON.stringify(users));
            
            return {
                success: true,
                message: `${originalCount - users.length} user(s) deleted`,
                deletedCount: originalCount - users.length
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    deleteAllUsersKeepAdmin() {
        const nonAdminUsers = this.users.filter(u => u.role !== 'admin');
        const adminUsers = this.users.filter(u => u.role === 'admin');
        
        if (nonAdminUsers.length === 0) {
            this.showNotification('No non-admin users to delete', 'info');
            document.querySelector('.fixed').remove();
            return;
        }
        
        if (!confirm(`⚠️ DELETE ALL NON-ADMIN USERS\n\nThis will delete ${nonAdminUsers.length} users while keeping ${adminUsers.length} admin(s):\n\n• All freelancers and clients will be removed\n• All their jobs and applications\n• All conversations and data\n• Admin accounts will be preserved\n\nThis action CANNOT be undone!\n\nContinue?`)) {
            return;
        }
        
        // Use secure permanent deletion system
        try {
            const result = window.secureDeleteSystem ? 
                window.secureDeleteSystem.deleteAllKeepAdmin() : 
                this.fallbackKeepAdmin();
            
            if (result && result.success) {
                this.showNotification(result.message, 'success');
                this.loadUsers();
                this.renderUsers();
                this.updateStats();
                
                // Update all dashboard data
                if (typeof loadDashboardData === 'function') {
                    loadDashboardData();
                }
                if (window.updateDashboardStats) {
                    window.updateDashboardStats();
                }
            } else {
                this.showNotification(result ? result.error : 'Failed to delete users', 'error');
            }
        } catch (error) {
            this.showNotification('Error: ' + error.message, 'error');
        }
        
        document.querySelector('.fixed').remove();
    }

    fallbackKeepAdmin() {
        try {
            let users = JSON.parse(localStorage.getItem('users') || '[]');
            const adminUsers = users.filter(u => u.role === 'admin');
            const deletedCount = users.length - adminUsers.length;
            
            localStorage.setItem('users', JSON.stringify(adminUsers));
            
            return {
                success: true,
                message: `${deletedCount} users deleted, ${adminUsers.length} admin(s) preserved`,
                deletedCount: deletedCount
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    resetToDefaults() {
        if (!confirm('⚠️ SYSTEM RESET\n\nThis will:\n• Delete ALL existing users\n• Clear ALL platform data\n• Create a fresh default admin account\n• Reset the entire system\n\nThis action CANNOT be undone!\n\nContinue?')) {
            return;
        }
        
        const doubleConfirm = prompt('Type "RESET" to confirm this dangerous action:');
        if (doubleConfirm !== 'RESET') {
            this.showNotification('Reset cancelled - confirmation failed', 'warning');
            return;
        }
        
        // Use secure permanent reset system
        try {
            const result = window.secureDeleteSystem ? 
                window.secureDeleteSystem.resetToDefaultAdmin() : 
                this.fallbackReset();
            
            if (result && result.success) {
                this.showNotification(result.message, 'success');
                this.loadUsers();
                this.renderUsers();
                this.updateStats();
                
                // Update all dashboard data
                if (typeof loadDashboardData === 'function') {
                    loadDashboardData();
                }
                if (window.updateDashboardStats) {
                    window.updateDashboardStats();
                }
            } else {
                this.showNotification(result ? result.error : 'Failed to reset system', 'error');
            }
        } catch (error) {
            this.showNotification('Error: ' + error.message, 'error');
        }
        
        document.querySelector('.fixed').remove();
    }

    fallbackReset() {
        try {
            const defaultAdmin = {
                id: 'admin_default_001',
                fullName: 'System Administrator',
                email: 'admin@skillsconnect.rw',
                password: 'admin123',
                role: 'admin',
                verified: true,
                createdAt: new Date().toISOString(),
                lastLogin: null,
                phone: '+250788123456',
                profileComplete: true
            };
            
            localStorage.setItem('users', JSON.stringify([defaultAdmin]));
            localStorage.setItem('jobs', '[]');
            localStorage.setItem('appliedJobs', '[]');
            
            return {
                success: true,
                message: 'System reset complete. Default admin created.',
                defaultAdmin: defaultAdmin
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    cleanupRelatedData(deletedUserIds) {
        // Clean up jobs posted by deleted users
        let jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        jobs = jobs.filter(job => !deletedUserIds.includes(job.clientId));
        localStorage.setItem('jobs', JSON.stringify(jobs));
        
        // Clean up job applications
        let applications = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
        applications = applications.filter(app => 
            !deletedUserIds.includes(app.freelancerId) && 
            !deletedUserIds.includes(app.clientId)
        );
        localStorage.setItem('appliedJobs', JSON.stringify(applications));
        
        // Clean up any user-specific data
        deletedUserIds.forEach(userId => {
            localStorage.removeItem(`user_${userId}_profile`);
            localStorage.removeItem(`user_${userId}_settings`);
        });
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
        
        switch(type) {
            case 'success':
                notification.classList.add('bg-green-500', 'text-white');
                break;
            case 'error':
                notification.classList.add('bg-red-500', 'text-white');
                break;
            case 'warning':
                notification.classList.add('bg-yellow-500', 'text-white');
                break;
            case 'info':
                notification.classList.add('bg-blue-500', 'text-white');
                break;
        }
        
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-white hover:text-gray-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }
}

// Initialize user management when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for the DOM to be fully ready
    setTimeout(() => {
        if (document.getElementById('usersTableBody')) {
            window.userManagement = new UserManagement();
        }
    }, 100);
});