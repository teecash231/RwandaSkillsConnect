/**
 * Job Management JavaScript
 * Comprehensive job management with permanent deletion capabilities
 */

class JobManagement {
    constructor() {
        this.init();
        console.log('Job Management initialized with permanent deletion support');
    }

    init() {
        this.setupEventListeners();
        this.loadJobs();
    }

    setupEventListeners() {
        // Bulk delete functionality
        const bulkDeleteBtn = document.getElementById('jobBulkActionBtn');
        if (bulkDeleteBtn) {
            bulkDeleteBtn.addEventListener('click', () => this.handleBulkActions());
        }

        // Select all checkbox
        const selectAllJobs = document.getElementById('selectAllJobs');
        if (selectAllJobs) {
            selectAllJobs.addEventListener('change', (e) => {
                const checkboxes = document.querySelectorAll('.job-checkbox');
                checkboxes.forEach(cb => cb.checked = e.target.checked);
            });
        }
    }

    loadJobs() {
        const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        this.renderJobsTable(jobs);
    }

    renderJobsTable(jobs) {
        const tbody = document.getElementById('jobsTableBody');
        if (!tbody) return;

        if (jobs.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-12 text-center">
                        <div class="text-gray-500">
                            <i class="fas fa-briefcase text-4xl mb-4"></i>
                            <p class="text-lg font-medium">No jobs found</p>
                            <p class="text-sm">Jobs will appear here when posted</p>
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
                    <div class="text-xs text-gray-400 mt-1">
                        <span class="inline-flex items-center">
                            <i class="fas fa-tag mr-1"></i>${job.category || 'Uncategorized'}
                        </span>
                    </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">${job.clientName}</td>
                <td class="px-6 py-4 text-sm font-medium text-green-600">RWF ${parseInt(job.salary || job.maxBudget || 0).toLocaleString()}</td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 text-xs rounded-full ${this.getJobStatusColor(job.status)}">${job.status}</span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                    ${new Date(job.createdAt).toLocaleDateString()}
                </td>
                <td class="px-6 py-4">
                    <div class="flex space-x-2">
                        <button class="text-blue-600 hover:text-blue-800" onclick="jobManagement.viewJobDetails('${job.id}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="text-green-600 hover:text-green-800" onclick="jobManagement.editJob('${job.id}')" title="Edit Job">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="text-red-600 hover:text-red-800" onclick="jobManagement.deleteJobPermanently('${job.id}')" title="Delete Permanently">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    deleteJobPermanently(jobId) {
        if (!confirm('⚠️ PERMANENT JOB DELETION\n\nThis will permanently remove:\n• The job posting\n• All applications\n• All conversations\n• All related data\n\nThis CANNOT be undone!\n\nContinue?')) {
            return;
        }

        const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        const job = jobs.find(j => j.id === jobId);
        
        if (!job) {
            this.showNotification('Job not found', 'error');
            return;
        }

        // Double confirmation with job title
        const confirmation = prompt(`Type "DELETE" to permanently remove job: "${job.title}"`);
        if (confirmation !== 'DELETE') {
            this.showNotification('Job deletion cancelled', 'warning');
            return;
        }

        try {
            const result = this.performPermanentJobDeletion(jobId, job);
            
            if (result.success) {
                this.showNotification(
                    `Job "${job.title}" permanently deleted!\nRemoved ${result.deletedApplications} applications and all related data.`,
                    'success'
                );
                
                // Refresh displays
                this.loadJobs();
                if (window.adminDashboard) {
                    window.adminDashboard.updateStats();
                    window.adminDashboard.loadJobApprovalsData();
                }
            } else {
                this.showNotification('Failed to delete job completely', 'error');
            }
        } catch (error) {
            console.error('Job deletion error:', error);
            this.showNotification('Error occurred during deletion', 'error');
        }
    }

    performPermanentJobDeletion(jobId, job) {
        try {
            // 1. Remove from jobs array
            let jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
            jobs = jobs.filter(j => j.id !== jobId);
            localStorage.setItem('jobs', JSON.stringify(jobs));

            // 2. Remove all applications
            let applications = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
            const originalAppCount = applications.length;
            applications = applications.filter(app => app.jobId !== jobId);
            localStorage.setItem('appliedJobs', JSON.stringify(applications));
            const deletedApplications = originalAppCount - applications.length;

            // 3. Clean user data
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            users.forEach(user => {
                if (user.postedJobs) {
                    user.postedJobs = user.postedJobs.filter(pJobId => pJobId !== jobId);
                }
                if (user.appliedJobs) {
                    user.appliedJobs = user.appliedJobs.filter(app => app.jobId !== jobId);
                }
                if (user.savedJobs) {
                    user.savedJobs = user.savedJobs.filter(savedJobId => savedJobId !== jobId);
                }
            });
            localStorage.setItem('users', JSON.stringify(users));

            // 4. Remove saved/bookmarked jobs
            let savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
            savedJobs = savedJobs.filter(savedJob => savedJob.jobId !== jobId);
            localStorage.setItem('savedJobs', JSON.stringify(savedJobs));

            // 5. Remove notifications
            let notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
            notifications = notifications.filter(notif => notif.jobId !== jobId);
            localStorage.setItem('notifications', JSON.stringify(notifications));

            let adminNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
            adminNotifications = adminNotifications.filter(notif => notif.jobId !== jobId);
            localStorage.setItem('adminNotifications', JSON.stringify(adminNotifications));

            // 6. Remove cached data
            localStorage.removeItem(`job_${jobId}`);
            localStorage.removeItem(`job_details_${jobId}`);
            localStorage.removeItem(`job_applications_${jobId}`);
            localStorage.removeItem(`job_conversations_${jobId}`);

            // 7. Log deletion for audit
            const auditLog = JSON.parse(localStorage.getItem('adminAuditLog') || '[]');
            auditLog.push({
                action: 'JOB_PERMANENT_DELETE',
                jobId: jobId,
                jobTitle: job.title,
                clientName: job.clientName,
                deletedApplications: deletedApplications,
                timestamp: new Date().toISOString(),
                adminUser: 'admin'
            });
            localStorage.setItem('adminAuditLog', JSON.stringify(auditLog));

            return {
                success: true,
                deletedApplications: deletedApplications,
                message: 'Job permanently deleted'
            };
        } catch (error) {
            console.error('Permanent deletion error:', error);
            return {
                success: false,
                error: error.message
            };
        }
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

    viewJobDetails(jobId) {
        const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        const job = jobs.find(j => j.id === jobId);
        
        if (!job) {
            this.showNotification('Job not found', 'error');
            return;
        }

        const applications = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
        const jobApplications = applications.filter(app => app.jobId === jobId);

        const modal = this.createModal('Job Details', `
            <div class="space-y-6">
                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <h3 class="font-semibold text-gray-800 mb-3">Job Information</h3>
                        <div class="space-y-2 text-sm">
                            <p><span class="font-medium">Title:</span> ${job.title}</p>
                            <p><span class="font-medium">Client:</span> ${job.clientName}</p>
                            <p><span class="font-medium">Category:</span> ${job.category || 'Not specified'}</p>
                            <p><span class="font-medium">Budget:</span> RWF ${parseInt(job.salary || job.maxBudget || 0).toLocaleString()}</p>
                            <p><span class="font-medium">Status:</span> <span class="px-2 py-1 text-xs rounded-full ${this.getJobStatusColor(job.status)}">${job.status}</span></p>
                            <p><span class="font-medium">Applications:</span> ${jobApplications.length}</p>
                        </div>
                    </div>
                    <div>
                        <h3 class="font-semibold text-gray-800 mb-3">Required Skills</h3>
                        <div class="flex flex-wrap gap-2">
                            ${job.skills ? job.skills.split(',').map(skill => 
                                `<span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">${skill.trim()}</span>`
                            ).join('') : '<span class="text-gray-500 text-sm">No skills listed</span>'}
                        </div>
                    </div>
                </div>
                <div>
                    <h3 class="font-semibold text-gray-800 mb-3">Description</h3>
                    <p class="text-gray-600 leading-relaxed">${job.description}</p>
                </div>
                <div class="flex justify-end space-x-3 pt-4 border-t">
                    <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                        Close
                    </button>
                    <button onclick="jobManagement.deleteJobPermanently('${job.id}'); this.closest('.fixed').remove();" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        <i class="fas fa-trash-alt mr-2"></i>Delete Permanently
                    </button>
                </div>
            </div>
        `);
    }

    editJob(jobId) {
        this.showNotification('Job editing functionality would be implemented here', 'info');
    }

    handleBulkActions() {
        const selectedJobs = Array.from(document.querySelectorAll('.job-checkbox:checked'))
            .map(cb => cb.dataset.jobId);

        if (selectedJobs.length === 0) {
            this.showNotification('No jobs selected', 'warning');
            return;
        }

        if (confirm(`⚠️ BULK PERMANENT DELETION\n\nDelete ${selectedJobs.length} jobs permanently?\n\nThis will remove ALL related data and CANNOT be undone!`)) {
            this.bulkDeleteJobs(selectedJobs);
        }
    }

    bulkDeleteJobs(jobIds) {
        let successCount = 0;
        let totalDeletedApps = 0;
        
        const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        
        jobIds.forEach(jobId => {
            const job = jobs.find(j => j.id === jobId);
            if (job) {
                const result = this.performPermanentJobDeletion(jobId, job);
                if (result.success) {
                    successCount++;
                    totalDeletedApps += result.deletedApplications;
                }
            }
        });

        this.showNotification(
            `Bulk deletion completed!\nDeleted ${successCount}/${jobIds.length} jobs\nRemoved ${totalDeletedApps} applications`,
            successCount === jobIds.length ? 'success' : 'warning'
        );

        this.loadJobs();
        if (window.adminDashboard) {
            window.adminDashboard.updateStats();
        }
    }

    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
            <div class="flex items-start space-x-2">
                <div class="flex-1">
                    ${message.split('\n').map(line => `<div>${line}</div>`).join('')}
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="text-white hover:text-gray-200 ml-2">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Initialize if needed
if (typeof window !== 'undefined') {
    window.JobManagement = JobManagement;
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (!window.jobManagement && document.getElementById('jobsTableBody')) {
                window.jobManagement = new JobManagement();
            }
        });
    } else {
        if (!window.jobManagement && document.getElementById('jobsTableBody')) {
            window.jobManagement = new JobManagement();
        }
    }
}