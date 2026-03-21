/**
 * Admin Dashboard JavaScript
 * Handles all admin functionality including user management, job approvals, settings, etc.
 */

// Admin Dashboard Core Functions
class AdminDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadInitialData();
        this.updateStats();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.showSection(section);
            });
        });

        // Mobile menu
        const openSidebar = document.getElementById('openSidebar');
        const closeSidebar = document.getElementById('closeSidebar');
        const sidebar = document.getElementById('sidebar');
        const mobileOverlay = document.getElementById('mobileOverlay');

        if (openSidebar) {
            openSidebar.addEventListener('click', () => {
                sidebar.classList.remove('-translate-x-full');
                mobileOverlay.classList.remove('hidden');
            });
        }

        if (closeSidebar) {
            closeSidebar.addEventListener('click', () => {
                sidebar.classList.add('-translate-x-full');
                mobileOverlay.classList.add('hidden');
            });
        }

        if (mobileOverlay) {
            mobileOverlay.addEventListener('click', () => {
                sidebar.classList.add('-translate-x-full');
                mobileOverlay.classList.add('hidden');
            });
        }

        // Filters
        const userRoleFilter = document.getElementById('userRoleFilter');
        if (userRoleFilter) {
            userRoleFilter.addEventListener('change', () => this.filterUsers());
        }

        const jobStatusFilter = document.getElementById('jobStatusFilter');
        if (jobStatusFilter) {
            jobStatusFilter.addEventListener('change', () => this.filterJobs());
        }

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(sectionName + '-section');
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update navigation
        document.querySelectorAll('.nav-item').forEach(nav => {
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

        this.currentSection = sectionName;

        // Load section-specific data
        this.loadSectionData(sectionName);
    }

    loadSectionData(sectionName) {
        switch(sectionName) {
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
        }
    }

    loadInitialData() {
        this.loadDashboardData();
        this.loadRecentActivity();
    }

    updateStats() {
        // Use the new dashboard stats system if available
        if (window.dashboardStats) {
            window.dashboardStats.refresh();
        } else {
            // Fallback to basic stats update with proper zero handling
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
            const applications = JSON.parse(localStorage.getItem('appliedJobs') || '[]');

            // Update dashboard stats with zero fallback
            const totalUsersEl = document.getElementById('totalUsers');
            if (totalUsersEl) totalUsersEl.textContent = users.length || 0;

            const activeJobsEl = document.getElementById('activeJobs');
            if (activeJobsEl) activeJobsEl.textContent = jobs.filter(j => j.status === 'active').length || 0;



            // Update pending jobs count with zero handling
            const pendingJobs = jobs.filter(j => j.status === 'pending_admin_approval').length;
            const pendingJobsCount = document.getElementById('pendingJobsCount');
            if (pendingJobsCount) {
                pendingJobsCount.textContent = pendingJobs || 0;
                pendingJobsCount.style.display = pendingJobs > 0 ? 'inline' : 'none';
            }

            const pendingJobsCountDisplay = document.getElementById('pendingJobsCountDisplay');
            if (pendingJobsCountDisplay) {
                pendingJobsCountDisplay.textContent = pendingJobs > 0 ? `${pendingJobs} Pending` : '0 Pending';
            }


        }
        
        // Trigger data update event for interconnection
        document.dispatchEvent(new CustomEvent('dataUpdated'));
    }

    loadDashboardData() {
        this.updateStats();
        // Ensure all interconnected components are updated
        setTimeout(() => {
            if (window.updateDashboardStats) {
                window.updateDashboardStats();
            }
        }, 100);
    }

    loadRecentActivity() {
        const activityContainer = document.getElementById('recentActivity');
        if (!activityContainer) return;

        // Generate recent activity based on actual data
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        const applications = JSON.parse(localStorage.getItem('appliedJobs') || '[]');

        const activities = [];

        // Recent user registrations
        users.slice(-3).forEach(user => {
            activities.push({
                type: 'user',
                message: `New user registered: ${user.fullName}`,
                time: this.getTimeAgo(user.createdAt),
                color: 'blue'
            });
        });

        // Recent job postings
        jobs.slice(-2).forEach(job => {
            activities.push({
                type: 'job',
                message: `Job posted: ${job.title}`,
                time: this.getTimeAgo(job.createdAt),
                color: 'green'
            });
        });

        // Recent applications
        applications.slice(-2).forEach(app => {
            activities.push({
                type: 'application',
                message: `New job application received`,
                time: this.getTimeAgo(app.appliedAt),
                color: 'purple'
            });
        });

        // Sort by time and take latest 5
        activities.sort((a, b) => new Date(b.time) - new Date(a.time));
        const recentActivities = activities.slice(0, 5);

        activityContainer.innerHTML = recentActivities.map(activity => `
            <div class="flex items-start space-x-3">
                <div class="w-2 h-2 bg-${activity.color}-500 rounded-full mt-2"></div>
                <div>
                    <p class="text-sm text-gray-900">${activity.message}</p>
                    <p class="text-xs text-gray-500">${activity.time}</p>
                </div>
            </div>
        `).join('');
    }

    // User Management Functions
    loadUsersData() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        this.renderUsersTable(users);
    }

    filterUsers() {
        const filterValue = document.getElementById('userRoleFilter').value;
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        let filteredUsers = users;
        if (filterValue) {
            filteredUsers = users.filter(user => user.role === filterValue);
        }
        
        this.renderUsersTable(filteredUsers);
    }

    renderUsersTable(users) {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        tbody.innerHTML = users.map(user => `
            <tr class="hover:bg-gray-50">
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
                        <button class="text-blue-600 hover:text-blue-800" onclick="adminDashboard.editUser('${user.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="text-red-600 hover:text-red-800" onclick="adminDashboard.deleteUser('${user.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                        ${!user.verified && user.role === 'freelancer' ? `
                            <button class="text-green-600 hover:text-green-800" onclick="adminDashboard.verifyUser('${user.id}')" title="Verify User">
                                <i class="fas fa-check-circle"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    }

    editUser(userId) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.id === userId);
        
        if (!user) {
            this.showNotification('User not found', 'error');
            return;
        }

        // Create edit modal
        const modal = this.createModal('Edit User', `
            <form id="editUserForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input type="text" name="fullName" value="${user.fullName}" class="w-full border border-gray-300 rounded-lg px-3 py-2" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input type="email" name="email" value="${user.email}" class="w-full border border-gray-300 rounded-lg px-3 py-2" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input type="tel" name="phone" value="${user.phone || ''}" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <select name="role" class="w-full border border-gray-300 rounded-lg px-3 py-2" required>
                        <option value="freelancer" ${user.role === 'freelancer' ? 'selected' : ''}>Freelancer</option>
                        <option value="client" ${user.role === 'client' ? 'selected' : ''}>Client</option>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                </div>
                <div class="flex items-center">
                    <input type="checkbox" name="verified" ${user.verified ? 'checked' : ''} class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                    <label class="ml-2 text-sm text-gray-700">Verified</label>
                </div>
                <div class="flex justify-end space-x-3 pt-4">
                    <button type="button" onclick="this.closest('.fixed').remove()" class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                        Cancel
                    </button>
                    <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Save Changes
                    </button>
                </div>
            </form>
        `);

        // Handle form submission
        const form = modal.querySelector('#editUserForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            
            const updatedUser = {
                ...user,
                fullName: formData.get('fullName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                role: formData.get('role'),
                verified: formData.has('verified')
            };

            // Update user in storage
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = users.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
                users[userIndex] = updatedUser;
                localStorage.setItem('users', JSON.stringify(users));
                
                this.showNotification('User updated successfully', 'success');
                this.loadUsersData();
                this.updateStats();
                modal.remove();
            }
        });
    }

    deleteUser(userId) {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        // Use secure permanent deletion
        const result = window.secureDeleteUser ? window.secureDeleteUser(userId) : window.deleteSingleUserPermanent(userId);
        
        if (result && result.success) {
            this.showNotification(result.message, 'success');
            
            // Update all interconnected components
            this.loadUsersData();
            this.updateStats();
            
            // Refresh user management if available
            if (window.userManagement) {
                window.userManagement.loadUsers();
                window.userManagement.renderUsers();
            }
            
            // Trigger global stats update
            if (window.updateDashboardStats) {
                window.updateDashboardStats();
            }
        } else {
            this.showNotification('Failed to delete user permanently', 'error');
        }
    }

    verifyUser(userId) {
        if (!confirm('Verify this user?')) return;

        let users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex !== -1) {
            users[userIndex].verified = true;
            localStorage.setItem('users', JSON.stringify(users));
            
            this.showNotification('User verified successfully', 'success');
            
            // Update all interconnected components
            this.loadUsersData();
            this.loadVerificationsData();
            this.updateStats();
            
            // Trigger global stats update
            if (window.updateDashboardStats) {
                window.updateDashboardStats();
            }
        }
    }

    // Job Management Functions
    loadJobsData() {
        const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        this.renderJobsTable(jobs);
    }

    filterJobs() {
        const filterValue = document.getElementById('jobStatusFilter').value;
        const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        
        let filteredJobs = jobs;
        if (filterValue) {
            filteredJobs = jobs.filter(job => job.status === filterValue);
        }
        
        this.renderJobsTable(filteredJobs);
    }

    renderJobsTable(jobs) {
        const tbody = document.getElementById('jobsTableBody');
        if (!tbody) return;

        tbody.innerHTML = jobs.map(job => `
            <tr class="hover:bg-gray-50">
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
                        <button class="text-blue-600 hover:text-blue-800" onclick="adminDashboard.viewJobDetails('${job.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="text-red-600 hover:text-red-800" onclick="adminDashboard.deleteJob('${job.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    viewJobDetails(jobId) {
        const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        const job = jobs.find(j => j.id === jobId);
        
        if (!job) {
            this.showNotification('Job not found', 'error');
            return;
        }

        const modal = this.createModal('Job Details', `
            <div class="space-y-6">
                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <h3 class="font-semibold text-gray-800 mb-2">Job Information</h3>
                        <div class="space-y-2 text-sm">
                            <p><span class="font-medium">Title:</span> ${job.title}</p>
                            <p><span class="font-medium">Client:</span> ${job.clientName}</p>
                            <p><span class="font-medium">Category:</span> ${job.category || 'Not specified'}</p>
                            <p><span class="font-medium">Location:</span> ${job.location || 'Remote'}</p>
                            <p><span class="font-medium">Budget:</span> RWF ${parseInt(job.salary || 0).toLocaleString()}</p>
                            <p><span class="font-medium">Type:</span> ${job.projectType === 'hourly' ? 'Hourly Rate' : 'Fixed Price'}</p>
                            <p><span class="font-medium">Status:</span> <span class="px-2 py-1 text-xs rounded-full ${this.getJobStatusColor(job.status)}">${job.status}</span></p>
                        </div>
                    </div>
                    <div>
                        <h3 class="font-semibold text-gray-800 mb-2">Required Skills</h3>
                        <div class="flex flex-wrap gap-2">
                            ${job.skills ? job.skills.split(',').map(skill => 
                                `<span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">${skill.trim()}</span>`
                            ).join('') : '<span class="text-gray-500 text-sm">No specific skills listed</span>'}
                        </div>
                    </div>
                </div>
                <div>
                    <h3 class="font-semibold text-gray-800 mb-2">Description</h3>
                    <p class="text-gray-600 leading-relaxed">${job.description}</p>
                </div>
                <div class="flex justify-end space-x-3 pt-4 border-t">
                    <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                        Close
                    </button>
                </div>
            </div>
        `);
    }

    deleteJob(jobId) {
        if (!confirm('⚠️ PERMANENT JOB DELETION\n\nThis will permanently delete:\n• The job posting\n• All applications for this job\n• All related conversations\n• All job history\n\nThis action CANNOT be undone!\n\nContinue?')) {
            return;
        }

        // Get job details for confirmation
        const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        const job = jobs.find(j => j.id === jobId);
        
        if (!job) {
            this.showNotification('Job not found', 'error');
            return;
        }

        // Final confirmation with job title
        if (!confirm(`Delete job: "${job.title}"?\n\nType the job title to confirm deletion.`) || 
            prompt(`Type "${job.title}" to confirm permanent deletion:`) !== job.title) {
            this.showNotification('Job deletion cancelled', 'warning');
            return;
        }

        try {
            // 1. Remove job from jobs array
            const updatedJobs = jobs.filter(j => j.id !== jobId);
            localStorage.setItem('jobs', JSON.stringify(updatedJobs));

            // 2. Remove all applications for this job
            let applications = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
            const originalAppCount = applications.length;
            applications = applications.filter(app => app.jobId !== jobId);
            localStorage.setItem('appliedJobs', JSON.stringify(applications));
            const deletedApps = originalAppCount - applications.length;

            // 3. Remove job from user's posted jobs (if stored separately)
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            users.forEach(user => {
                if (user.postedJobs) {
                    user.postedJobs = user.postedJobs.filter(pJobId => pJobId !== jobId);
                }
                if (user.appliedJobs) {
                    user.appliedJobs = user.appliedJobs.filter(app => app.jobId !== jobId);
                }
            });
            localStorage.setItem('users', JSON.stringify(users));

            // 4. Remove from any saved/bookmarked jobs
            const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
            const updatedSavedJobs = savedJobs.filter(savedJob => savedJob.jobId !== jobId);
            localStorage.setItem('savedJobs', JSON.stringify(updatedSavedJobs));

            // 5. Remove any job-related notifications
            const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
            const updatedNotifications = notifications.filter(notif => notif.jobId !== jobId);
            localStorage.setItem('notifications', JSON.stringify(updatedNotifications));

            // 6. Remove from admin notifications
            const adminNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
            const updatedAdminNotifications = adminNotifications.filter(notif => notif.jobId !== jobId);
            localStorage.setItem('adminNotifications', JSON.stringify(updatedAdminNotifications));

            // 7. Clear any cached job data
            localStorage.removeItem(`job_${jobId}`);
            localStorage.removeItem(`job_details_${jobId}`);
            localStorage.removeItem(`job_applications_${jobId}`);

            // Success notification with details
            this.showNotification(
                `Job "${job.title}" permanently deleted!\n` +
                `• Removed ${deletedApps} application(s)\n` +
                `• Cleared all related data`, 
                'success'
            );

            // Refresh all relevant sections
            this.loadJobsData();
            this.loadJobApprovalsData();
            this.updateStats();

            // Log the deletion for audit purposes
            const auditLog = JSON.parse(localStorage.getItem('adminAuditLog') || '[]');
            auditLog.push({
                action: 'JOB_PERMANENT_DELETE',
                jobId: jobId,
                jobTitle: job.title,
                clientName: job.clientName,
                deletedApplications: deletedApps,
                timestamp: new Date().toISOString(),
                adminUser: 'admin' // In a real app, get from session
            });
            localStorage.setItem('adminAuditLog', JSON.stringify(auditLog));

        } catch (error) {
            console.error('Error during job deletion:', error);
            this.showNotification('Failed to delete job completely. Some data may remain.', 'error');
        }
    }

    // Job Approvals Functions
    loadJobApprovalsData() {
        const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        const pendingJobs = jobs.filter(job => job.status === 'pending_admin_approval');
        this.renderJobApprovalsTable(pendingJobs);
    }

    renderJobApprovalsTable(jobs) {
        const tbody = document.getElementById('jobApprovalsTableBody');
        if (!tbody) return;

        if (jobs.length === 0) {
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

        tbody.innerHTML = jobs.map(job => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4">
                    <div>
                        <div class="font-medium text-gray-900">${job.title}</div>
                        <div class="text-sm text-gray-500">${job.description.substring(0, 80)}...</div>
                        <div class="text-xs text-gray-400 mt-1">
                            <span class="inline-flex items-center">
                                <i class="fas fa-tag mr-1"></i>${job.category || 'Uncategorized'}
                            </span>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-gray-900">${job.clientName}</div>
                    <div class="text-xs text-gray-500">${job.location || 'Remote'}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm font-medium text-green-600">RWF ${parseInt(job.salary || 0).toLocaleString()}</div>
                    <div class="text-xs text-gray-500">${job.projectType === 'hourly' ? 'Hourly' : 'Fixed Price'}</div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                    ${new Date(job.createdAt).toLocaleDateString()}
                </td>
                <td class="px-6 py-4">
                    <div class="flex space-x-2">
                        <button class="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600" onclick="adminDashboard.viewJobDetails('${job.id}')">
                            <i class="fas fa-eye mr-1"></i>View
                        </button>
                        <button class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700" onclick="adminDashboard.approveJob('${job.id}')">
                            <i class="fas fa-check mr-1"></i>Approve
                        </button>
                        <button class="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700" onclick="adminDashboard.rejectJob('${job.id}')">
                            <i class="fas fa-times mr-1"></i>Reject
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    approveJob(jobId) {
        if (!confirm('Approve this job posting? It will become visible to freelancers.')) {
            return;
        }

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
            this.updateStats();
        }
    }

    rejectJob(jobId) {
        const reason = prompt('Please provide a reason for rejection (optional):');
        
        if (!confirm('Reject this job posting? The client will be notified.')) {
            return;
        }

        let jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        const jobIndex = jobs.findIndex(j => j.id === jobId);
        
        if (jobIndex !== -1) {
            jobs[jobIndex].status = 'rejected';
            jobs[jobIndex].adminApproved = false;
            jobs[jobIndex].rejectedAt = new Date().toISOString();
            jobs[jobIndex].rejectionReason = reason || 'No reason provided';
            
            localStorage.setItem('jobs', JSON.stringify(jobs));
            
            this.showNotification('Job rejected successfully!', 'success');
            this.loadJobApprovalsData();
            this.loadJobsData();
            this.updateStats();
        }
    }



    // Reports Functions
    loadReportsData() {
        // Generate sample analytics data
        this.generateAnalyticsCharts();
    }

    generateAnalyticsCharts() {
        // This would integrate with a charting library like Chart.js
        console.log('Analytics charts would be generated here');
    }

    // Settings Functions
    loadSettingsData() {
        // Load current settings
        const settings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
        this.populateSettingsForm(settings);
    }

    populateSettingsForm(settings) {
        // Populate settings form with current values
        console.log('Settings form populated');
    }

    saveSettings(formData) {
        localStorage.setItem('adminSettings', JSON.stringify(formData));
        this.showNotification('Settings saved successfully', 'success');
    }

    // Menu Management Functions
    loadMenuData() {
        // Load menu items
        console.log('Menu management loaded');
    }

    // Utility Functions
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
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        
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
        
        // Close modal when clicking outside
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        return modal;
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

    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('userSession');
            this.showNotification('Logged out successfully!', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        }
    }
}

// Initialize admin dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for admin login check to complete
    setTimeout(() => {
        // Initialize admin dashboard
        window.adminDashboard = new AdminDashboard();
        
        // Initialize other components after a short delay
        setTimeout(() => {
            // Ensure all management classes are initialized
            if (!window.userManagement && document.getElementById('usersTableBody')) {
                window.userManagement = new UserManagement();
            }
            if (!window.jobManagement && document.getElementById('jobsTableBody')) {
                window.jobManagement = new JobManagement();
            }
            if (!window.adminAnalytics && document.getElementById('reports-section')) {
                window.adminAnalytics = new AdminAnalytics();
            }
        }, 200);
    }, 100);
});

// Make functions globally available for onclick handlers
window.showSection = function(sectionName) {
    if (window.adminDashboard) {
        window.adminDashboard.showSection(sectionName);
    }
};