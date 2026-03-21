/**
 * Admin Dashboard Fixes and Enhancements
 * Comprehensive fixes to ensure all admin functionality works properly
 */

(function() {
    'use strict';

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        initializeAdminFixes();
    });

    function initializeAdminFixes() {
        console.log('🔧 Initializing Admin Dashboard Fixes...');
        
        // Fix 1: Ensure all required functions are available
        ensureGlobalFunctions();
        
        // Fix 2: Initialize missing components
        initializeMissingComponents();
        
        // Fix 3: Fix navigation and section switching
        fixNavigationSystem();
        
        // Fix 4: Enhance data loading and display
        enhanceDataLoading();
        
        // Fix 5: Fix notification system
        fixNotificationSystem();
        
        // Fix 6: Ensure proper event handling
        fixEventHandling();
        
        // Fix 7: Initialize interconnection systems
        initializeInterconnections();
        
        console.log('✅ Admin Dashboard Fixes Applied Successfully');
    }

    function ensureGlobalFunctions() {
        // Ensure showSection function exists
        if (!window.showSection) {
            window.showSection = function(sectionName) {
                const sections = document.querySelectorAll('.section');
                const navItems = document.querySelectorAll('.nav-item');
                const pageTitle = document.getElementById('pageTitle');
                
                // Hide all sections
                sections.forEach(section => section.classList.remove('active'));
                
                // Show target section
                const targetSection = document.getElementById(sectionName + '-section');
                if (targetSection) {
                    targetSection.classList.add('active');
                }
                
                // Update navigation
                navItems.forEach(nav => nav.classList.remove('active'));
                const activeNav = document.querySelector(`[data-section="${sectionName}"]`);
                if (activeNav) {
                    activeNav.classList.add('active');
                }
                
                // Update page title
                const titles = {
                    'dashboard': 'Admin Dashboard',
                    'users': 'Users Management',
                    'jobs': 'Jobs Management',
                    'job-approvals': 'Job Approvals',
                    'reports': 'Reports & Analytics',
                    'settings': 'Settings',
                    'menu': 'Menu Management'
                };
                
                if (pageTitle) {
                    pageTitle.textContent = titles[sectionName] || 'Admin Dashboard';
                }
                
                // Load section data
                loadSectionData(sectionName);
            };
        }

        // Ensure data loading functions exist
        if (!window.loadDashboardData) {
            window.loadDashboardData = function() {
                if (window.dashboardStats) {
                    window.dashboardStats.refresh();
                } else {
                    loadBasicDashboardData();
                }
            };
        }

        if (!window.loadUsersData) {
            window.loadUsersData = function() {
                if (window.userManagement) {
                    window.userManagement.loadUsers();
                    window.userManagement.renderUsers();
                } else {
                    loadBasicUsersData();
                }
            };
        }

        if (!window.loadJobsData) {
            window.loadJobsData = function() {
                if (window.jobManagement) {
                    window.jobManagement.loadJobs();
                } else {
                    loadBasicJobsData();
                }
            };
        }

        if (!window.loadJobApprovalsData) {
            window.loadJobApprovalsData = function() {
                if (window.adminDashboard && window.adminDashboard.loadJobApprovalsData) {
                    window.adminDashboard.loadJobApprovalsData();
                } else {
                    loadBasicJobApprovalsData();
                }
            };
        }
    }

    function initializeMissingComponents() {
        // Initialize dashboard stats if not available
        if (!window.dashboardStats) {
            setTimeout(() => {
                if (window.DashboardStats) {
                    window.dashboardStats = new window.DashboardStats();
                }
            }, 100);
        }

        // Initialize user management if not available
        if (!window.userManagement && document.getElementById('usersTableBody')) {
            setTimeout(() => {
                if (window.UserManagement) {
                    window.userManagement = new window.UserManagement();
                }
            }, 200);
        }

        // Initialize job management if not available
        if (!window.jobManagement && document.getElementById('jobsTableBody')) {
            setTimeout(() => {
                if (window.JobManagement) {
                    window.jobManagement = new window.JobManagement();
                }
            }, 300);
        }

        // Initialize admin analytics if not available
        if (!window.adminAnalytics && document.getElementById('reports-section')) {
            setTimeout(() => {
                if (window.AdminAnalytics) {
                    window.adminAnalytics = new window.AdminAnalytics();
                }
            }, 400);
        }
    }

    function fixNavigationSystem() {
        // Fix navigation item clicks
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            // Remove existing listeners to prevent duplicates
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);
            
            // Add proper event listener
            newItem.addEventListener('click', function(e) {
                e.preventDefault();
                const sectionName = this.dataset.section;
                if (sectionName && window.showSection) {
                    window.showSection(sectionName);
                }
            });
        });

        // Fix mobile menu
        const openSidebar = document.getElementById('openSidebar');
        const closeSidebar = document.getElementById('closeSidebar');
        const sidebar = document.getElementById('sidebar');
        const mobileOverlay = document.getElementById('mobileOverlay');

        if (openSidebar && sidebar && mobileOverlay) {
            openSidebar.addEventListener('click', () => {
                sidebar.classList.remove('-translate-x-full');
                mobileOverlay.classList.remove('hidden');
            });
        }

        if (closeSidebar && sidebar && mobileOverlay) {
            closeSidebar.addEventListener('click', () => {
                sidebar.classList.add('-translate-x-full');
                mobileOverlay.classList.add('hidden');
            });
        }

        if (mobileOverlay && sidebar) {
            mobileOverlay.addEventListener('click', () => {
                sidebar.classList.add('-translate-x-full');
                mobileOverlay.classList.add('hidden');
            });
        }
    }

    function enhanceDataLoading() {
        // Enhance data loading with proper error handling
        function loadSectionData(sectionName) {
            try {
                switch(sectionName) {
                    case 'dashboard':
                        if (window.loadDashboardData) window.loadDashboardData();
                        break;
                    case 'users':
                        if (window.loadUsersData) window.loadUsersData();
                        break;
                    case 'jobs':
                        if (window.loadJobsData) window.loadJobsData();
                        break;
                    case 'job-approvals':
                        if (window.loadJobApprovalsData) window.loadJobApprovalsData();
                        break;
                    case 'reports':
                        if (window.adminAnalytics && window.adminAnalytics.loadAnalytics) {
                            window.adminAnalytics.loadAnalytics();
                        }
                        break;
                }
            } catch (error) {
                console.error('Error loading section data:', error);
            }
        }

        // Make function globally available
        window.loadSectionData = loadSectionData;
    }

    function fixNotificationSystem() {
        // Ensure notification system works
        if (!window.showNotification) {
            window.showNotification = function(message, type = 'info') {
                const notification = document.createElement('div');
                notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
                
                const colors = {
                    success: 'bg-green-500 text-white',
                    error: 'bg-red-500 text-white',
                    warning: 'bg-yellow-500 text-white',
                    info: 'bg-blue-500 text-white'
                };
                
                notification.className += ' ' + (colors[type] || colors.info);
                
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
            };
        }
    }

    function fixEventHandling() {
        // Fix logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                if (confirm('Are you sure you want to logout?')) {
                    localStorage.clear();
                    window.location.href = 'login.html';
                }
            });
        }

        // Fix add user button
        const addUserBtn = document.getElementById('addUserBtn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', function() {
                if (window.userManagement && window.userManagement.showAddUserModal) {
                    window.userManagement.showAddUserModal();
                } else if (window.showAddUserModal) {
                    window.showAddUserModal();
                } else {
                    window.showNotification('Add user functionality not available', 'warning');
                }
            });
        }

        // Fix bulk action buttons
        const bulkActionBtn = document.getElementById('bulkActionBtn');
        if (bulkActionBtn) {
            bulkActionBtn.addEventListener('click', function() {
                if (window.userManagement && window.userManagement.handleBulkActions) {
                    window.userManagement.handleBulkActions();
                } else {
                    window.showNotification('Bulk actions functionality not available', 'warning');
                }
            });
        }
    }

    function initializeInterconnections() {
        // Initialize stats interconnection
        setTimeout(() => {
            if (window.statsInterconnect) {
                window.statsInterconnect.refreshAllComponents();
            }
        }, 1000);

        // Initialize analytics interconnection
        setTimeout(() => {
            if (window.analyticsInterconnect) {
                window.analyticsInterconnect.forceUpdate();
            }
        }, 1500);
    }

    // Basic fallback data loading functions
    function loadBasicDashboardData() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        const applications = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
        
        // Update basic stats
        updateElement('totalUsers', users.length);
        updateElement('totalFreelancers', users.filter(u => u.role === 'freelancer').length);
        updateElement('totalClients', users.filter(u => u.role === 'client').length);
        updateElement('totalJobs', jobs.length);
        updateElement('pendingApprovals', jobs.filter(j => j.status === 'pending_admin_approval').length);
        updateElement('approvedJobs', jobs.filter(j => j.status === 'active').length);
        
        // Update monthly stats
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        updateElement('monthlyUsers', users.filter(u => new Date(u.createdAt) >= thisMonth).length);
        updateElement('monthlyJobs', jobs.filter(j => new Date(j.createdAt) >= thisMonth).length);
    }

    function loadBasicUsersData() {
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
                        <button class="text-blue-600 hover:text-blue-800" onclick="editUser('${user.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="text-red-600 hover:text-red-800" onclick="deleteUser('${user.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function loadBasicJobsData() {
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
                        <button class="text-blue-600 hover:text-blue-800" onclick="viewJobDetails('${job.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="text-red-600 hover:text-red-800" onclick="deleteJob('${job.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function loadBasicJobApprovalsData() {
        const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        const pendingJobs = jobs.filter(job => job.status === 'pending_admin_approval');
        const tbody = document.getElementById('jobApprovalsTableBody');
        
        if (!tbody) return;
        
        if (pendingJobs.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-12 text-center">
                        <div class="text-gray-500">
                            <i class="fas fa-check-circle text-4xl mb-4"></i>
                            <p class="text-lg font-medium">No pending job approvals</p>
                            <p class="text-sm">All job postings have been reviewed</p>
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
                        <button class="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600" onclick="viewJobDetails('${job.id}')">
                            View
                        </button>
                        <button class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700" onclick="approveJob('${job.id}')">
                            Approve
                        </button>
                        <button class="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700" onclick="rejectJob('${job.id}')">
                            Reject
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Helper functions
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

    // Basic action functions
    window.editUser = function(userId) {
        if (window.userManagement && window.userManagement.editUser) {
            window.userManagement.editUser(userId);
        } else {
            window.showNotification('Edit user functionality not available', 'warning');
        }
    };

    window.deleteUser = function(userId) {
        if (confirm('Are you sure you want to delete this user?')) {
            if (window.secureDeleteUser) {
                const result = window.secureDeleteUser(userId);
                if (result && result.success) {
                    window.showNotification(result.message, 'success');
                    window.loadUsersData();
                    window.loadDashboardData();
                }
            } else {
                window.showNotification('Delete user functionality not available', 'warning');
            }
        }
    };

    window.viewJobDetails = function(jobId) {
        if (window.adminDashboard && window.adminDashboard.viewJobDetails) {
            window.adminDashboard.viewJobDetails(jobId);
        } else {
            window.showNotification('View job details functionality not available', 'warning');
        }
    };

    window.deleteJob = function(jobId) {
        if (confirm('Are you sure you want to delete this job?')) {
            let jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
            jobs = jobs.filter(j => j.id !== jobId);
            localStorage.setItem('jobs', JSON.stringify(jobs));
            window.loadJobsData();
            window.loadDashboardData();
            window.showNotification('Job deleted successfully', 'success');
        }
    };

    window.approveJob = function(jobId) {
        if (confirm('Approve this job posting?')) {
            let jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
            const jobIndex = jobs.findIndex(j => j.id === jobId);
            if (jobIndex !== -1) {
                jobs[jobIndex].status = 'active';
                jobs[jobIndex].adminApproved = true;
                jobs[jobIndex].approvedAt = new Date().toISOString();
                localStorage.setItem('jobs', JSON.stringify(jobs));
                window.loadJobApprovalsData();
                window.loadJobsData();
                window.loadDashboardData();
                window.showNotification('Job approved successfully!', 'success');
            }
        }
    };

    window.rejectJob = function(jobId) {
        const reason = prompt('Please provide a reason for rejection (optional):');
        if (confirm('Reject this job posting?')) {
            let jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
            const jobIndex = jobs.findIndex(j => j.id === jobId);
            if (jobIndex !== -1) {
                jobs[jobIndex].status = 'rejected';
                jobs[jobIndex].adminApproved = false;
                jobs[jobIndex].rejectedAt = new Date().toISOString();
                jobs[jobIndex].rejectionReason = reason || 'No reason provided';
                localStorage.setItem('jobs', JSON.stringify(jobs));
                window.loadJobApprovalsData();
                window.loadJobsData();
                window.loadDashboardData();
                window.showNotification('Job rejected successfully!', 'success');
            }
        }
    };

    // Auto-refresh data every 30 seconds
    setInterval(() => {
        if (window.dashboardStats) {
            window.dashboardStats.refresh();
        } else {
            window.loadDashboardData();
        }
    }, 30000);

})();