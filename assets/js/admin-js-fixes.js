/**
 * Admin JS Fixes - Comprehensive Error Resolution
 * Fixes all critical errors in admin JavaScript files
 */

// Fix missing function references and undefined variables
(function() {
    'use strict';

    // Fix loadVerificationsData function (missing in admin-dashboard.js)
    window.loadVerificationsData = function() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const pendingVerifications = users.filter(u => !u.verified && u.role === 'freelancer');
        
        const container = document.getElementById('pendingVerifications');
        if (container) {
            container.innerHTML = pendingVerifications.length.toString();
        }
        
        const verificationsList = document.getElementById('verificationsList');
        if (verificationsList) {
            if (pendingVerifications.length === 0) {
                verificationsList.innerHTML = '<p class="text-gray-500">No pending verifications</p>';
            } else {
                verificationsList.innerHTML = pendingVerifications.map(user => `
                    <div class="flex items-center justify-between p-3 border rounded">
                        <div>
                            <p class="font-medium">${user.fullName}</p>
                            <p class="text-sm text-gray-500">${user.email}</p>
                        </div>
                        <div class="space-x-2">
                            <button onclick="approveUser('${user.id}')" class="text-green-600 hover:text-green-800">
                                <i class="fas fa-check"></i>
                            </button>
                            <button onclick="rejectUser('${user.id}')" class="text-red-600 hover:text-red-800">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                `).join('');
            }
        }
    };

    // Fix missing updateDashboardStats function
    window.updateDashboardStats = function() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        const applications = JSON.parse(localStorage.getItem('appliedJobs') || '[]');

        // Update all dashboard stat elements
        const stats = {
            totalUsers: users.length,
            totalFreelancers: users.filter(u => u.role === 'freelancer').length,
            totalClients: users.filter(u => u.role === 'client').length,
            totalJobs: jobs.length,
            activeJobs: jobs.filter(j => j.status === 'active').length,
            pendingApprovals: jobs.filter(j => j.status === 'pending_admin_approval').length,
            approvedJobs: jobs.filter(j => j.status === 'active').length,
            monthlyUsers: users.filter(u => {
                const created = new Date(u.createdAt);
                const now = new Date();
                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
            }).length,
            monthlyJobs: jobs.filter(j => {
                const created = new Date(j.createdAt);
                const now = new Date();
                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
            }).length
        };

        // Update elements safely
        Object.keys(stats).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.textContent = stats[key];
            }
        });

        // Update pending jobs badge
        const pendingBadge = document.getElementById('pendingJobsCount');
        if (pendingBadge) {
            pendingBadge.textContent = stats.pendingApprovals;
            pendingBadge.style.display = stats.pendingApprovals > 0 ? 'inline' : 'none';
        }
    };

    // Fix missing loadJobApprovalsData function
    window.loadJobApprovalsData = function() {
        const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        const pendingJobs = jobs.filter(job => job.status === 'pending_admin_approval');
        const tbody = document.getElementById('jobApprovalsTableBody');
        
        if (!tbody) return;
        
        if (pendingJobs.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-16 text-center">
                        <div class="text-gray-500">
                            <i class="fas fa-check-circle text-4xl mb-4 text-green-500"></i>
                            <p class="text-xl font-semibold text-gray-700 mb-2">All Caught Up!</p>
                            <p class="text-sm text-gray-500">No pending job approvals</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = pendingJobs.map(job => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4">
                    <div class="font-medium text-gray-900">${job.title}</div>
                    <div class="text-sm text-gray-500">${job.description.substring(0, 80)}...</div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">${job.clientName}</td>
                <td class="px-6 py-4 text-sm font-medium text-green-600">RWF ${parseInt(job.salary || 0).toLocaleString()}</td>
                <td class="px-6 py-4 text-sm text-gray-500">
                    ${new Date(job.createdAt).toLocaleDateString()}
                </td>
                <td class="px-6 py-4">
                    <div class="flex space-x-2">
                        <button class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700" onclick="approveJob('${job.id}')">
                            <i class="fas fa-check mr-1"></i>Approve
                        </button>
                        <button class="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700" onclick="rejectJob('${job.id}')">
                            <i class="fas fa-times mr-1"></i>Reject
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    };

    // Fix missing approveJob function
    window.approveJob = function(jobId) {
        if (!confirm('Approve this job posting?')) return;

        let jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        const jobIndex = jobs.findIndex(j => j.id === jobId);
        
        if (jobIndex !== -1) {
            jobs[jobIndex].status = 'active';
            jobs[jobIndex].adminApproved = true;
            jobs[jobIndex].approvedAt = new Date().toISOString();
            
            localStorage.setItem('jobs', JSON.stringify(jobs));
            
            if (typeof showNotification === 'function') {
                showNotification('Job approved successfully!', 'success');
            }
            
            // Refresh data
            if (typeof loadJobApprovalsData === 'function') loadJobApprovalsData();
            if (typeof updateDashboardStats === 'function') updateDashboardStats();
        }
    };

    // Fix missing rejectJob function
    window.rejectJob = function(jobId) {
        const reason = prompt('Reason for rejection (optional):') || 'No reason provided';
        
        if (!confirm('Reject this job posting?')) return;

        let jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        const jobIndex = jobs.findIndex(j => j.id === jobId);
        
        if (jobIndex !== -1) {
            jobs[jobIndex].status = 'rejected';
            jobs[jobIndex].adminApproved = false;
            jobs[jobIndex].rejectedAt = new Date().toISOString();
            jobs[jobIndex].rejectionReason = reason;
            
            localStorage.setItem('jobs', JSON.stringify(jobs));
            
            if (typeof showNotification === 'function') {
                showNotification('Job rejected successfully!', 'success');
            }
            
            // Refresh data
            if (typeof loadJobApprovalsData === 'function') loadJobApprovalsData();
            if (typeof updateDashboardStats === 'function') updateDashboardStats();
        }
    };

    // Fix missing loadUsersData function
    window.loadUsersData = function() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const tbody = document.getElementById('usersTableBody');
        
        if (!tbody) return;

        if (users.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-12 text-center">
                        <div class="text-gray-500">
                            <i class="fas fa-users text-4xl mb-4"></i>
                            <p class="text-lg font-medium">No users found</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = users.map(user => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4">
                    <input type="checkbox" class="user-checkbox rounded border-gray-300 text-blue-600 focus:ring-blue-500" data-user-id="${user.id}">
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                            <span class="text-white font-semibold">${user.fullName.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                            <div class="font-medium text-gray-900">${user.fullName}</div>
                            <div class="text-sm text-gray-500">${user.email}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 text-xs rounded-full ${getRoleColor(user.role)}">${user.role}</span>
                </td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 text-xs rounded-full ${user.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                        ${user.verified ? 'Verified' : 'Pending'}
                    </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                    ${new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td class="px-6 py-4">
                    <div class="flex space-x-2">
                        <button class="text-blue-600 hover:text-blue-800" onclick="editUser('${user.id}')" title="Edit User">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="text-red-600 hover:text-red-800" onclick="deleteUser('${user.id}')" title="Delete User">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    };

    // Fix missing loadJobsData function
    window.loadJobsData = function() {
        const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        const tbody = document.getElementById('jobsTableBody');
        
        if (!tbody) return;

        if (jobs.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-12 text-center">
                        <div class="text-gray-500">
                            <i class="fas fa-briefcase text-4xl mb-4"></i>
                            <p class="text-lg font-medium">No jobs found</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = jobs.map(job => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4">
                    <input type="checkbox" class="job-checkbox rounded border-gray-300 text-blue-600 focus:ring-blue-500" data-job-id="${job.id}">
                </td>
                <td class="px-6 py-4">
                    <div class="font-medium text-gray-900">${job.title}</div>
                    <div class="text-sm text-gray-500">${job.description.substring(0, 50)}...</div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">${job.clientName}</td>
                <td class="px-6 py-4 text-sm font-medium text-green-600">RWF ${parseInt(job.salary || 0).toLocaleString()}</td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 text-xs rounded-full ${getJobStatusColor(job.status)}">${job.status}</span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                    ${new Date(job.createdAt).toLocaleDateString()}
                </td>
                <td class="px-6 py-4">
                    <div class="flex space-x-2">
                        <button class="text-blue-600 hover:text-blue-800" onclick="viewJobDetails('${job.id}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="text-red-600 hover:text-red-800" onclick="deleteJob('${job.id}')" title="Delete Job">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    };

    // Fix missing loadDashboardData function
    window.loadDashboardData = function() {
        if (typeof updateDashboardStats === 'function') {
            updateDashboardStats();
        }
        if (typeof loadVerificationsData === 'function') {
            loadVerificationsData();
        }
    };

    // Fix missing utility functions
    window.getRoleColor = function(role) {
        const colors = {
            'admin': 'bg-red-100 text-red-800',
            'client': 'bg-blue-100 text-blue-800',
            'freelancer': 'bg-green-100 text-green-800'
        };
        return colors[role] || 'bg-gray-100 text-gray-800';
    };

    window.getJobStatusColor = function(status) {
        const colors = {
            'active': 'bg-green-100 text-green-800',
            'closed': 'bg-gray-100 text-gray-800',
            'pending': 'bg-yellow-100 text-yellow-800',
            'pending_admin_approval': 'bg-orange-100 text-orange-800',
            'rejected': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    // Fix missing showNotification function
    if (typeof window.showNotification !== 'function') {
        window.showNotification = function(message, type = 'success') {
            const notification = document.createElement('div');
            notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300`;
            
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
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 3000);
        };
    }

    // Fix missing editUser function
    window.editUser = function(userId) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.id === userId);
        
        if (!user) {
            showNotification('User not found', 'error');
            return;
        }

        const newName = prompt('Enter new name:', user.fullName);
        if (newName && newName !== user.fullName) {
            const userIndex = users.findIndex(u => u.id === userId);
            users[userIndex].fullName = newName;
            localStorage.setItem('users', JSON.stringify(users));
            
            showNotification('User updated successfully', 'success');
            if (typeof loadUsersData === 'function') loadUsersData();
        }
    };

    // Fix missing deleteUser function
    window.deleteUser = function(userId) {
        if (!confirm('Are you sure you want to delete this user?')) return;

        let users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.id === userId);
        
        if (user) {
            users = users.filter(u => u.id !== userId);
            localStorage.setItem('users', JSON.stringify(users));
            
            showNotification(`User "${user.fullName}" deleted successfully`, 'success');
            if (typeof loadUsersData === 'function') loadUsersData();
            if (typeof updateDashboardStats === 'function') updateDashboardStats();
        }
    };

    // Fix missing viewJobDetails function
    window.viewJobDetails = function(jobId) {
        const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        const job = jobs.find(j => j.id === jobId);
        
        if (!job) {
            showNotification('Job not found', 'error');
            return;
        }

        alert(`Job: ${job.title}\nClient: ${job.clientName}\nBudget: RWF ${parseInt(job.salary || 0).toLocaleString()}\nDescription: ${job.description}`);
    };

    // Fix missing deleteJob function
    window.deleteJob = function(jobId) {
        if (!confirm('Are you sure you want to delete this job?')) return;

        let jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        const job = jobs.find(j => j.id === jobId);
        
        if (job) {
            jobs = jobs.filter(j => j.id !== jobId);
            localStorage.setItem('jobs', JSON.stringify(jobs));
            
            showNotification(`Job "${job.title}" deleted successfully`, 'success');
            if (typeof loadJobsData === 'function') loadJobsData();
            if (typeof updateDashboardStats === 'function') updateDashboardStats();
        }
    };

    // Fix missing approveUser function
    window.approveUser = function(userId) {
        if (!confirm('Approve this user?')) return;

        let users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex !== -1) {
            users[userIndex].verified = true;
            localStorage.setItem('users', JSON.stringify(users));
            
            showNotification('User approved successfully', 'success');
            if (typeof loadVerificationsData === 'function') loadVerificationsData();
            if (typeof updateDashboardStats === 'function') updateDashboardStats();
        }
    };

    // Fix missing rejectUser function
    window.rejectUser = function(userId) {
        if (!confirm('Reject this user?')) return;
        
        showNotification('User rejected', 'warning');
        if (typeof loadVerificationsData === 'function') loadVerificationsData();
    };

    // Fix missing showAddUserModal function
    window.showAddUserModal = function() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-lg max-w-md w-full p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold">Add New User</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form id="addUserForm" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input type="text" name="fullName" required class="w-full border border-gray-300 rounded px-3 py-2">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" name="email" required class="w-full border border-gray-300 rounded px-3 py-2">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select name="role" required class="w-full border border-gray-300 rounded px-3 py-2">
                            <option value="">Select Role</option>
                            <option value="freelancer">Freelancer</option>
                            <option value="client">Client</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input type="password" name="password" required class="w-full border border-gray-300 rounded px-3 py-2">
                    </div>
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" onclick="this.closest('.fixed').remove()" class="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                            Cancel
                        </button>
                        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            Add User
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const form = modal.querySelector('#addUserForm');
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(form);
            
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            if (users.find(u => u.email === formData.get('email'))) {
                showNotification('Email already exists!', 'error');
                return;
            }
            
            const newUser = {
                id: 'user_' + Date.now(),
                fullName: formData.get('fullName'),
                email: formData.get('email'),
                role: formData.get('role'),
                password: formData.get('password'),
                verified: true,
                createdAt: new Date().toISOString()
            };
            
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            showNotification('User added successfully!', 'success');
            modal.remove();
            
            if (typeof loadUsersData === 'function') loadUsersData();
            if (typeof updateDashboardStats === 'function') updateDashboardStats();
        });
    };

    // Initialize error-free environment
    console.log('Admin JS fixes applied successfully');

})();