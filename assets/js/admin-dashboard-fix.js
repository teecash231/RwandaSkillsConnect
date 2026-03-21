/**
 * Admin Dashboard Fix - Complete Sidebar Navigation and Functionality
 * This file ensures all admin dashboard features work properly
 */

class AdminDashboardController {
    constructor() {
        this.currentSection = 'dashboard';
        this.isInitialized = false;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        console.log('Initializing Admin Dashboard Controller...');
        
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        try {
            this.setupSidebarNavigation();
            this.setupMobileMenu();
            this.setupSectionSwitching();
            this.setupQuickActions();
            this.setupLogout();
            this.loadInitialData();
            this.isInitialized = true;
            console.log('Admin Dashboard Controller initialized successfully');
        } catch (error) {
            console.error('Error initializing Admin Dashboard:', error);
        }
    }

    setupSidebarNavigation() {
        const navItems = document.querySelectorAll('.nav-item[data-section]');
        
        navItems.forEach(item => {
            // Remove existing event listeners
            item.replaceWith(item.cloneNode(true));
        });

        // Re-select after cloning
        document.querySelectorAll('.nav-item[data-section]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionName = item.getAttribute('data-section');
                console.log('Navigation clicked:', sectionName);
                this.showSection(sectionName);
            });
        });

        console.log('Sidebar navigation setup complete');
    }

    setupMobileMenu() {
        const openBtn = document.getElementById('openSidebar');
        const closeBtn = document.getElementById('closeSidebar');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('mobileOverlay');

        if (openBtn && sidebar && overlay) {
            openBtn.addEventListener('click', () => {
                sidebar.classList.remove('-translate-x-full');
                overlay.classList.remove('hidden');
            });
        }

        if (closeBtn && sidebar && overlay) {
            closeBtn.addEventListener('click', () => {
                sidebar.classList.add('-translate-x-full');
                overlay.classList.add('hidden');
            });
        }

        if (overlay && sidebar) {
            overlay.addEventListener('click', () => {
                sidebar.classList.add('-translate-x-full');
                overlay.classList.add('hidden');
            });
        }

        console.log('Mobile menu setup complete');
    }

    setupSectionSwitching() {
        // Ensure all sections are properly hidden initially
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.classList.remove('active');
        });

        // Show dashboard by default
        const dashboardSection = document.getElementById('dashboard-section');
        if (dashboardSection) {
            dashboardSection.classList.add('active');
        }

        console.log('Section switching setup complete');
    }

    setupQuickActions() {
        // Make quick action functions globally available
        window.quickShowSection = (sectionName) => {
            console.log('Quick action:', sectionName);
            this.showSection(sectionName);
        };

        console.log('Quick actions setup complete');
    }

    setupLogout() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to logout?')) {
                    localStorage.clear();
                    window.location.href = 'login.html';
                }
            });
        }
    }

    showSection(sectionName) {
        console.log('Switching to section:', sectionName);

        // Hide all sections
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionName + '-section');
        if (targetSection) {
            targetSection.classList.add('active');
            console.log('Section shown:', sectionName);
        } else {
            console.error('Section not found:', sectionName + '-section');
        }

        // Update navigation active state
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(nav => {
            nav.classList.remove('active');
        });

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

        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            pageTitle.textContent = titles[sectionName] || 'Admin Dashboard';
        }

        // Close mobile menu if open
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('mobileOverlay');
        if (sidebar && overlay) {
            sidebar.classList.add('-translate-x-full');
            overlay.classList.add('hidden');
        }

        // Load section-specific data
        this.loadSectionData(sectionName);
        this.currentSection = sectionName;
    }

    loadSectionData(sectionName) {
        console.log('Loading data for section:', sectionName);

        switch(sectionName) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'users':
                this.loadUsersData();
                break;
            case 'jobs':
                this.loadJobsData();
                break;
            case 'job-approvals':
                this.loadJobApprovalsData();
                break;
            case 'reports':
                this.loadReportsData();
                break;
            case 'settings':
                this.loadSettingsData();
                break;
            case 'menu':
                this.loadMenuData();
                break;
            default:
                console.log('No specific data loader for section:', sectionName);
        }
    }

    loadInitialData() {
        console.log('Loading initial dashboard data...');
        this.loadDashboardData();
    }

    loadDashboardData() {
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
            this.updateElement('totalUsers', totalUsers);
            this.updateElement('totalFreelancers', freelancers);
            this.updateElement('totalClients', clients);
            this.updateElement('totalJobs', totalJobs);
            this.updateElement('pendingApprovals', pendingJobs);
            this.updateElement('approvedJobs', approvedJobs);
            this.updateElement('monthlyUsers', monthlyUsers);
            this.updateElement('monthlyJobs', monthlyJobs);

            // Update pending jobs count in navigation
            const pendingJobsCount = document.getElementById('pendingJobsCount');
            if (pendingJobsCount) {
                pendingJobsCount.textContent = pendingJobs;
                pendingJobsCount.style.display = pendingJobs > 0 ? 'inline' : 'none';
            }

            const pendingJobsCountDisplay = document.getElementById('pendingJobsCountDisplay');
            if (pendingJobsCountDisplay) {
                pendingJobsCountDisplay.textContent = pendingJobs > 0 ? `${pendingJobs} Pending` : '0 Pending';
            }

            // Load recent activity
            this.loadRecentActivity();

            console.log('Dashboard data loaded successfully');
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    loadUsersData() {
        try {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const tbody = document.getElementById('usersTableBody');
            
            if (!tbody) {
                console.log('Users table body not found');
                return;
            }

            if (users.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" class="px-6 py-12 text-center">
                            <div class="text-gray-500">
                                <i class="fas fa-users text-4xl mb-4"></i>
                                <p class="text-lg font-medium">No users found</p>
                                <p class="text-sm">Users will appear here when they register</p>
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
                        <span class="px-2 py-1 text-xs rounded-full ${this.getRoleColor(user.role)}">${user.role}</span>
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
                            <button class="text-blue-600 hover:text-blue-800" onclick="adminController.editUser('${user.id}')" title="Edit User">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="text-red-600 hover:text-red-800" onclick="adminController.deleteUser('${user.id}')" title="Delete User">
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
    }

    loadJobsData() {
        try {
            const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
            const tbody = document.getElementById('jobsTableBody');
            
            if (!tbody) {
                console.log('Jobs table body not found');
                return;
            }

            if (jobs.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" class="px-6 py-12 text-center">
                            <div class="text-gray-500">
                                <i class="fas fa-briefcase text-4xl mb-4"></i>
                                <p class="text-lg font-medium">No jobs found</p>
                                <p class="text-sm">Job postings will appear here</p>
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
                        <span class="px-2 py-1 text-xs rounded-full ${this.getJobStatusColor(job.status)}">${job.status}</span>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-500">
                        ${new Date(job.createdAt).toLocaleDateString()}
                    </td>
                    <td class="px-6 py-4">
                        <div class="flex space-x-2">
                            <button class="text-blue-600 hover:text-blue-800" onclick="adminController.viewJobDetails('${job.id}')" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="text-red-600 hover:text-red-800" onclick="adminController.deleteJob('${job.id}')" title="Delete Job">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');

            console.log('Jobs data loaded successfully');
        } catch (error) {
            console.error('Error loading jobs data:', error);
        }
    }

    loadJobApprovalsData() {
        try {
            const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
            const pendingJobs = jobs.filter(job => job.status === 'pending_admin_approval');
            const tbody = document.getElementById('jobApprovalsTableBody');
            
            if (!tbody) {
                console.log('Job approvals table body not found');
                return;
            }

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
                    <td class="px-6 py-4 text-sm text-gray-900">${job.clientName}</td>
                    <td class="px-6 py-4 text-sm font-medium text-green-600">RWF ${parseInt(job.salary || 0).toLocaleString()}</td>
                    <td class="px-6 py-4 text-sm text-gray-500">
                        ${new Date(job.createdAt).toLocaleDateString()}
                    </td>
                    <td class="px-6 py-4">
                        <div class="flex space-x-2">
                            <button class="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600" onclick="adminController.viewJobDetails('${job.id}')">
                                <i class="fas fa-eye mr-1"></i>View
                            </button>
                            <button class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700" onclick="adminController.approveJob('${job.id}')">
                                <i class="fas fa-check mr-1"></i>Approve
                            </button>
                            <button class="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700" onclick="adminController.rejectJob('${job.id}')">
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
    }

    loadReportsData() {
        console.log('Loading reports data...');
        // Initialize analytics if available
        if (window.adminAnalytics) {
            window.adminAnalytics.loadAnalytics();
        }
    }

    loadSettingsData() {
        console.log('Loading settings data...');
        // Settings functionality would be implemented here
    }

    loadMenuData() {
        console.log('Loading menu data...');
        // Menu management functionality would be implemented here
    }

    loadRecentActivity() {
        const activityContainer = document.getElementById('recentActivity');
        if (!activityContainer) return;

        try {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
            const applications = JSON.parse(localStorage.getItem('appliedJobs') || '[]');

            const activities = [];

            // Recent user registrations (last 5)
            users.slice(-5).forEach(user => {
                activities.push({
                    type: 'user',
                    message: `New ${user.role} registered: ${user.fullName}`,
                    time: user.createdAt,
                    timeAgo: this.getTimeAgo(user.createdAt),
                    color: 'blue',
                    icon: user.role === 'freelancer' ? 'fa-user-cog' : 'fa-user-tie'
                });
            });

            // Recent job postings (last 3)
            jobs.slice(-3).forEach(job => {
                activities.push({
                    type: 'job',
                    message: `Job posted: ${job.title}`,
                    time: job.createdAt,
                    timeAgo: this.getTimeAgo(job.createdAt),
                    color: 'green',
                    icon: 'fa-briefcase'
                });
            });

            // Sort by time and take latest 8
            activities.sort((a, b) => new Date(b.time) - new Date(a.time));
            const recentActivities = activities.slice(0, 8);

            if (recentActivities.length === 0) {
                activityContainer.innerHTML = `
                    <div class="flex items-center justify-center py-8">
                        <div class="text-center text-gray-500">
                            <i class="fas fa-history text-3xl mb-3"></i>
                            <p class="text-sm">No recent activity</p>
                        </div>
                    </div>
                `;
                return;
            }

            activityContainer.innerHTML = recentActivities.map(activity => `
                <div class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-${activity.color}-100 rounded-full flex items-center justify-center">
                            <i class="fas ${activity.icon} text-${activity.color}-600 text-sm"></i>
                        </div>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900">${activity.message}</p>
                        <p class="text-xs text-gray-500">${activity.timeAgo}</p>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading recent activity:', error);
        }
    }

    // User Management Functions
    editUser(userId) {
        console.log('Edit user:', userId);
        alert('Edit user functionality - User ID: ' + userId);
    }

    deleteUser(userId) {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                let users = JSON.parse(localStorage.getItem('users') || '[]');
                users = users.filter(u => u.id !== userId);
                localStorage.setItem('users', JSON.stringify(users));
                
                this.showNotification('User deleted successfully', 'success');
                this.loadUsersData();
                this.loadDashboardData();
            } catch (error) {
                console.error('Error deleting user:', error);
                this.showNotification('Error deleting user', 'error');
            }
        }
    }

    // Job Management Functions
    viewJobDetails(jobId) {
        console.log('View job details:', jobId);
        
        const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        const job = jobs.find(j => j.id === jobId);
        
        if (!job) {
            this.showNotification('Job not found', 'error');
            return;
        }

        alert(`Job Details:\n\nTitle: ${job.title}\nClient: ${job.clientName}\nBudget: RWF ${parseInt(job.salary || 0).toLocaleString()}\nStatus: ${job.status}\n\nDescription: ${job.description}`);
    }

    deleteJob(jobId) {
        if (confirm('Are you sure you want to delete this job?')) {
            try {
                let jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
                jobs = jobs.filter(j => j.id !== jobId);
                localStorage.setItem('jobs', JSON.stringify(jobs));
                
                this.showNotification('Job deleted successfully', 'success');
                this.loadJobsData();
                this.loadDashboardData();
            } catch (error) {
                console.error('Error deleting job:', error);
                this.showNotification('Error deleting job', 'error');
            }
        }
    }

    approveJob(jobId) {
        if (confirm('Approve this job posting?')) {
            try {
                let jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
                const jobIndex = jobs.findIndex(j => j.id === jobId);
                
                if (jobIndex !== -1) {
                    jobs[jobIndex].status = 'active';
                    jobs[jobIndex].adminApproved = true;
                    jobs[jobIndex].approvedAt = new Date().toISOString();
                    
                    localStorage.setItem('jobs', JSON.stringify(jobs));
                    
                    this.showNotification('Job approved successfully!', 'success');
                    this.loadJobApprovalsData();
                    this.loadJobsData();
                    this.loadDashboardData();
                }
            } catch (error) {
                console.error('Error approving job:', error);
                this.showNotification('Error approving job', 'error');
            }
        }
    }

    rejectJob(jobId) {
        const reason = prompt('Please provide a reason for rejection (optional):') || 'No reason provided';
        
        if (confirm('Reject this job posting?')) {
            try {
                let jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
                const jobIndex = jobs.findIndex(j => j.id === jobId);
                
                if (jobIndex !== -1) {
                    jobs[jobIndex].status = 'rejected';
                    jobs[jobIndex].adminApproved = false;
                    jobs[jobIndex].rejectedAt = new Date().toISOString();
                    jobs[jobIndex].rejectionReason = reason;
                    
                    localStorage.setItem('jobs', JSON.stringify(jobs));
                    
                    this.showNotification('Job rejected successfully!', 'success');
                    this.loadJobApprovalsData();
                    this.loadJobsData();
                    this.loadDashboardData();
                }
            } catch (error) {
                console.error('Error rejecting job:', error);
                this.showNotification('Error rejecting job', 'error');
            }
        }
    }

    // Utility Functions
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value || 0;
        }
    }

    getRoleColor(role) {
        const colors = {
            'admin': 'bg-red-100 text-red-800',
            'client': 'bg-blue-100 text-blue-800',
            'freelancer': 'bg-green-100 text-green-800'
        };
        return colors[role] || 'bg-gray-100 text-gray-800';
    }

    getJobStatusColor(status) {
        const colors = {
            'active': 'bg-green-100 text-green-800',
            'closed': 'bg-gray-100 text-gray-800',
            'pending': 'bg-yellow-100 text-yellow-800',
            'pending_admin_approval': 'bg-orange-100 text-orange-800',
            'rejected': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
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

    showNotification(message, type = 'success') {
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
    }
}

// Initialize the admin dashboard controller
let adminController;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing admin controller...');
    adminController = new AdminDashboardController();
    
    // Make it globally available
    window.adminController = adminController;
});

// Fallback initialization if DOMContentLoaded already fired
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => {
        if (!adminController) {
            console.log('Fallback initialization...');
            adminController = new AdminDashboardController();
            window.adminController = adminController;
        }
    }, 100);
}