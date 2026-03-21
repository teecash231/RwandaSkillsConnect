/**
 * Admin Dashboard Initialization
 * Ensures all admin dashboard functionality is properly initialized
 */

(function() {
    'use strict';

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        // Wait a bit for other scripts to load
        setTimeout(initializeAdminDashboard, 200);
    });

    function initializeAdminDashboard() {
        console.log('Initializing Admin Dashboard...');
        
        // Check authentication
        if (!checkAdminAuth()) {
            return;
        }

        // Initialize all components
        initializeDataLoading();
        initializeEventListeners();
        initializeNotifications();
        
        console.log('Admin Dashboard initialized successfully');
    }

    function checkAdminAuth() {
        const session = JSON.parse(localStorage.getItem('userSession') || 'null');
        if (!session || session.role !== 'admin') {
            console.warn('Admin access required');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
            return false;
        }
        return true;
    }

    function initializeDataLoading() {
        // Load dashboard data
        if (typeof loadDashboardData === 'function') {
            loadDashboardData();
        }

        // Load users data
        if (typeof loadUsersData === 'function') {
            loadUsersData();
        }

        // Load jobs data
        if (typeof loadJobsData === 'function') {
            loadJobsData();
        }

        // Load job approvals data
        if (typeof loadJobApprovalsData === 'function') {
            loadJobApprovalsData();
        }

        // Initialize analytics if available
        if (window.adminAnalytics && typeof window.adminAnalytics.loadAnalytics === 'function') {
            window.adminAnalytics.loadAnalytics();
        }
    }

    function initializeEventListeners() {
        // Add User button
        const addUserBtn = document.getElementById('addUserBtn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', function() {
                if (typeof showAddUserModal === 'function') {
                    showAddUserModal();
                } else if (window.userManagement && typeof window.userManagement.showAddUserModal === 'function') {
                    window.userManagement.showAddUserModal();
                }
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                if (confirm('Are you sure you want to logout?')) {
                    localStorage.clear();
                    window.location.href = 'login.html';
                }
            });
        }

        // Search and filter inputs
        setupSearchAndFilters();
    }

    function setupSearchAndFilters() {
        // User search
        const userSearch = document.getElementById('userSearch');
        if (userSearch) {
            userSearch.addEventListener('input', debounce(function() {
                if (typeof filterUsers === 'function') {
                    filterUsers();
                }
            }, 300));
        }

        // User role filter
        const userRoleFilter = document.getElementById('userRoleFilter');
        if (userRoleFilter) {
            userRoleFilter.addEventListener('change', function() {
                if (typeof filterUsers === 'function') {
                    filterUsers();
                }
            });
        }

        // Job search
        const jobSearch = document.getElementById('jobSearch');
        if (jobSearch) {
            jobSearch.addEventListener('input', debounce(function() {
                if (typeof filterJobs === 'function') {
                    filterJobs();
                }
            }, 300));
        }

        // Job status filter
        const jobStatusFilter = document.getElementById('jobStatusFilter');
        if (jobStatusFilter) {
            jobStatusFilter.addEventListener('change', function() {
                if (typeof filterJobs === 'function') {
                    filterJobs();
                }
            });
        }
    }

    function initializeNotifications() {
        // Initialize notification system
        if (typeof initializeNotifications === 'function') {
            initializeNotifications();
        }

        // Update notification count
        if (typeof updateNotificationCount === 'function') {
            updateNotificationCount();
        }
    }

    // Utility function for debouncing
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Enhanced data loading functions
    window.loadDashboardData = function() {
        try {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
            const applications = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
            
            // Calculate metrics
            const totalUsers = users.length;
            const freelancers = users.filter(u => u.role === 'freelancer').length;
            const clients = users.filter(u => u.role === 'client').length;
            const totalJobs = jobs.length;
            const pendingJobs = jobs.filter(j => j.status === 'pending_admin_approval').length;
            const approvedJobs = jobs.filter(j => j.status === 'active').length;
            
            // Calculate monthly stats
            const now = new Date();
            const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const monthlyUsers = users.filter(u => new Date(u.createdAt) >= thisMonth).length;
            const monthlyJobs = jobs.filter(j => new Date(j.createdAt) >= thisMonth).length;
            
            // Update dashboard elements
            updateElement('totalUsers', totalUsers);
            updateElement('totalFreelancers', freelancers);
            updateElement('totalClients', clients);
            updateElement('totalJobs', totalJobs);
            updateElement('pendingApprovals', pendingJobs);
            updateElement('approvedJobs', approvedJobs);
            updateElement('monthlyUsers', monthlyUsers);
            updateElement('monthlyJobs', monthlyJobs);
            
            // Update pending jobs count in navigation
            const pendingJobsCount = document.getElementById('pendingJobsCount');
            if (pendingJobsCount) {
                pendingJobsCount.textContent = pendingJobs;
                pendingJobsCount.style.display = pendingJobs > 0 ? 'inline' : 'none';
            }
            
            // Update pending jobs display
            const pendingJobsCountDisplay = document.getElementById('pendingJobsCountDisplay');
            if (pendingJobsCountDisplay) {
                pendingJobsCountDisplay.textContent = pendingJobs > 0 ? `${pendingJobs} Pending` : '0 Pending';
            }
            
            console.log('Dashboard data loaded successfully');
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    };

    window.loadUsersData = function() {
        try {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const tbody = document.getElementById('usersTableBody');
            
            if (!tbody) return;
            
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
            
            console.log('Users data loaded successfully');
        } catch (error) {
            console.error('Error loading users data:', error);
        }
    };

    window.loadJobsData = function() {
        try {
            const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
            const tbody = document.getElementById('jobsTableBody');
            
            if (!tbody) return;
            
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
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
            
            console.log('Jobs data loaded successfully');
        } catch (error) {
            console.error('Error loading jobs data:', error);
        }
    };

    window.loadJobApprovalsData = function() {
        try {
            const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
            const pendingJobs = jobs.filter(job => job.status === 'pending_admin_approval');
            const tbody = document.getElementById('jobApprovalsTableBody');
            
            if (!tbody) return;
            
            if (pendingJobs.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" class="px-6 py-16 text-center">
                            <div class="text-gray-500">
                                <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <i class="fas fa-check-circle text-green-600 text-3xl"></i>
                                </div>
                                <p class="text-xl font-semibold text-gray-700 mb-2">All Caught Up!</p>
                                <p class="text-sm text-gray-500">No pending job approvals at the moment</p>
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
                    <td class="px-6 py-4">
                        <div class="text-sm text-gray-900">${job.clientName}</div>
                        <div class="text-xs text-gray-500">${job.location || 'Remote'}</div>
                    </td>
                    <td class="px-6 py-4">
                        <div class="text-sm font-medium text-green-600">RWF ${parseInt(job.salary || 0).toLocaleString()}</div>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-500">
                        ${new Date(job.createdAt).toLocaleDateString()}
                    </td>
                    <td class="px-6 py-4">
                        <div class="flex space-x-2">
                            <button class="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600" onclick="viewJobDetails('${job.id}')">
                                <i class="fas fa-eye mr-1"></i>View
                            </button>
                            <button class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700" onclick="approveJob('${job.id}')">
                                <i class="fas fa-check mr-1"></i>Approve
                            </button>
                            <button class="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700" onclick="rejectJobWithReason('${job.id}')">
                                <i class="fas fa-times mr-1"></i>Reject
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
            
            console.log('Job approvals data loaded successfully');
        } catch (error) {
            console.error('Error loading job approvals data:', error);
        }
    };

    // Utility functions
    function updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value || 0;
        }
    }

    function getRoleColor(role) {
        const colors = {
            'admin': 'bg-red-100 text-red-800',
            'client': 'bg-blue-100 text-blue-800',
            'freelancer': 'bg-green-100 text-green-800'
        };
        return colors[role] || 'bg-gray-100 text-gray-800';
    }

    function getJobStatusColor(status) {
        const colors = {
            'active': 'bg-green-100 text-green-800',
            'closed': 'bg-gray-100 text-gray-800',
            'pending': 'bg-yellow-100 text-yellow-800',
            'pending_admin_approval': 'bg-orange-100 text-orange-800',
            'rejected': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    }

    // Make functions globally available
    window.getRoleColor = getRoleColor;
    window.getJobStatusColor = getJobStatusColor;
    window.updateElement = updateElement;

})();