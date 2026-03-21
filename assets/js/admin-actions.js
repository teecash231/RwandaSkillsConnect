/**
 * Admin Actions Handler
 * Handles all admin dashboard actions like edit, delete, approve, etc.
 */

(function() {
    'use strict';

    // User Management Actions
    window.editUser = function(userId) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.id === userId);
        
        if (!user) {
            showNotification('User not found', 'error');
            return;
        }

        // Create edit modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-lg max-w-md w-full">
                <div class="p-6 border-b border-gray-200">
                    <h3 class="text-lg font-semibold text-gray-900">Edit User</h3>
                </div>
                <div class="p-6">
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
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle form submission
        const form = modal.querySelector('#editUserForm');
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // CSRF Protection
            const sessionUser = JSON.parse(localStorage.getItem('userSession') || '{}');
            if (!sessionUser.id || sessionUser.role !== 'admin') {
                showNotification('Unauthorized action', 'error');
                return;
            }
            
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
                
                showNotification('User updated successfully', 'success');
                loadUsersData();
                loadDashboardData();
                modal.remove();
            }
        });

        // Close modal when clicking outside
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
    };

    window.deleteUser = function(userId) {
        // CSRF Protection
        const sessionUser = JSON.parse(localStorage.getItem('userSession') || '{}');
        if (!sessionUser.id || sessionUser.role !== 'admin') {
            showNotification('Unauthorized action', 'error');
            return;
        }
        
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            let users = JSON.parse(localStorage.getItem('users') || '[]');
            const userToDelete = users.find(u => u.id === userId);
            
            if (!userToDelete) {
                showNotification('User not found', 'error');
                return;
            }

            // Remove user
            users = users.filter(u => u.id !== userId);
            localStorage.setItem('users', JSON.stringify(users));

            // Remove user's applications
            let applications = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
            applications = applications.filter(app => app.freelancerId !== userId);
            localStorage.setItem('appliedJobs', JSON.stringify(applications));

            // Remove user's jobs if they're a client
            if (userToDelete.role === 'client') {
                let jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
                jobs = jobs.filter(job => job.clientId !== userId);
                localStorage.setItem('jobs', JSON.stringify(jobs));
            }

            showNotification(`User ${userToDelete.fullName} deleted successfully`, 'success');
            loadUsersData();
            loadDashboardData();
        } catch (error) {
            console.error('Error deleting user:', error);
            showNotification('Failed to delete user', 'error');
        }
    };

    // Job Management Actions
    window.deleteJob = function(jobId) {
        if (!confirm('Are you sure you want to delete this job? This will also remove all applications for this job.')) {
            return;
        }

        try {
            let jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
            const jobToDelete = jobs.find(j => j.id === jobId);
            
            if (!jobToDelete) {
                showNotification('Job not found', 'error');
                return;
            }

            // Remove job
            jobs = jobs.filter(j => j.id !== jobId);
            localStorage.setItem('jobs', JSON.stringify(jobs));

            // Remove job applications
            let applications = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
            applications = applications.filter(app => app.jobId !== jobId);
            localStorage.setItem('appliedJobs', JSON.stringify(applications));

            showNotification(`Job "${jobToDelete.title}" deleted successfully`, 'success');
            loadJobsData();
            loadJobApprovalsData();
            loadDashboardData();
        } catch (error) {
            console.error('Error deleting job:', error);
            showNotification('Failed to delete job', 'error');
        }
    };

    // Job Approval Actions
    window.approveJob = function(jobId) {
        if (!confirm('Approve this job posting? It will become visible to freelancers.')) {
            return;
        }

        try {
            let jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
            const jobIndex = jobs.findIndex(j => j.id === jobId);
            
            if (jobIndex !== -1) {
                jobs[jobIndex].status = 'active';
                jobs[jobIndex].adminApproved = true;
                jobs[jobIndex].approvedAt = new Date().toISOString();
                
                localStorage.setItem('jobs', JSON.stringify(jobs));
                
                showNotification('Job approved successfully!', 'success');
                loadJobApprovalsData();
                loadJobsData();
                loadDashboardData();
            } else {
                showNotification('Job not found', 'error');
            }
        } catch (error) {
            console.error('Error approving job:', error);
            showNotification('Failed to approve job', 'error');
        }
    };

    window.rejectJobWithReason = function(jobId) {
        const reason = prompt('Please provide a reason for rejection (optional):');
        
        if (reason === null) return; // User cancelled
        
        if (!confirm('Reject this job posting? The client will be notified.')) {
            return;
        }

        try {
            let jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
            const jobIndex = jobs.findIndex(j => j.id === jobId);
            
            if (jobIndex !== -1) {
                jobs[jobIndex].status = 'rejected';
                jobs[jobIndex].adminApproved = false;
                jobs[jobIndex].rejectedAt = new Date().toISOString();
                jobs[jobIndex].rejectionReason = reason || 'No reason provided';
                
                localStorage.setItem('jobs', JSON.stringify(jobs));
                
                showNotification('Job rejected successfully!', 'success');
                loadJobApprovalsData();
                loadJobsData();
                loadDashboardData();
            } else {
                showNotification('Job not found', 'error');
            }
        } catch (error) {
            console.error('Error rejecting job:', error);
            showNotification('Failed to reject job', 'error');
        }
    };

    // Filter Functions
    window.filterUsers = function() {
        const searchTerm = document.getElementById('userSearch')?.value.toLowerCase() || '';
        const roleFilter = document.getElementById('userRoleFilter')?.value || '';
        const statusFilter = document.getElementById('userStatusFilter')?.value || '';
        
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        let filteredUsers = users.filter(user => {
            const matchesSearch = !searchTerm || 
                user.fullName.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm);
            
            const matchesRole = !roleFilter || user.role === roleFilter;
            
            const matchesStatus = !statusFilter || 
                (statusFilter === 'verified' && user.verified) ||
                (statusFilter === 'pending' && !user.verified);
            
            return matchesSearch && matchesRole && matchesStatus;
        });
        
        renderUsersTable(filteredUsers);
    };

    window.filterJobs = function() {
        const searchTerm = document.getElementById('jobSearch')?.value.toLowerCase() || '';
        const statusFilter = document.getElementById('jobStatusFilter')?.value || '';
        const categoryFilter = document.getElementById('jobCategoryFilter')?.value || '';
        
        const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        
        let filteredJobs = jobs.filter(job => {
            const matchesSearch = !searchTerm || 
                job.title.toLowerCase().includes(searchTerm) ||
                job.description.toLowerCase().includes(searchTerm) ||
                job.clientName.toLowerCase().includes(searchTerm);
            
            const matchesStatus = !statusFilter || job.status === statusFilter;
            
            const matchesCategory = !categoryFilter || job.category === categoryFilter;
            
            return matchesSearch && matchesStatus && matchesCategory;
        });
        
        renderJobsTable(filteredJobs);
    };

    function renderUsersTable(users) {
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
    }

    function renderJobsTable(jobs) {
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
    }

    // Notification function
    function showNotification(message, type = 'success') {
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

    // Make showNotification globally available
    window.showNotification = showNotification;

})();