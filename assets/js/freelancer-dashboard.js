/**
 * Freelancer Dashboard JavaScript
 * Handles all freelancer dashboard functionality
 */

// Initialize freelancer dashboard
function initializeFreelancerDashboard() {
    const session = JSON.parse(localStorage.getItem('userSession') || 'null');
    if (!session || session.role !== 'freelancer') {
        window.location.href = 'login.html';
        return;
    }

    // Initialize components
    initializeSidebarNavigation();
    initializeUserMenu();
    initializeProfileManagement();
    loadDashboardData();
    updateProfileCompletion();
    loadRecentApplications();
    loadRecommendedJobs();
}

// Initialize sidebar navigation
function initializeSidebarNavigation() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href').substring(1);
            showSection(target);
            
            // Update active state
            sidebarLinks.forEach(l => {
                l.classList.remove('active', 'bg-blue-50', 'border-r-2', 'border-blue-500');
                l.classList.add('text-gray-600');
            });
            this.classList.add('active', 'bg-blue-50', 'border-r-2', 'border-blue-500');
            this.classList.remove('text-gray-600');
        });
    });
}

// Show specific section
function showSection(sectionName) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.add('hidden');
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.classList.remove('hidden');
        targetSection.classList.add('active');
        
        // Load section-specific data
        switch(sectionName) {
            case 'jobs':
                loadAvailableJobs();
                break;
            case 'applications':
                filterApplications();
                break;
            case 'earnings':
                loadEarningsData();
                break;
            case 'settings':
                initializeSettings();
                break;
        }
    }
}

// Initialize user menu
function initializeUserMenu() {
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userMenu = document.getElementById('userMenu');
    
    if (userMenuBtn && userMenu) {
        userMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            userMenu.classList.toggle('hidden');
        });
        
        document.addEventListener('click', function(e) {
            if (!userMenuBtn.contains(e.target) && !userMenu.contains(e.target)) {
                userMenu.classList.add('hidden');
            }
        });
    }
}

// Load dashboard data
function loadDashboardData() {
    const session = JSON.parse(localStorage.getItem('userSession') || 'null');
    if (!session) return;

    const name = session.fullName || session.name || 'Freelancer';
    
    // Update user name displays
    const userNameEl = document.getElementById('userName');
    const userInitialEl = document.getElementById('userInitial');
    
    if (userNameEl) userNameEl.textContent = name;
    if (userInitialEl) userInitialEl.textContent = name.charAt(0).toUpperCase();

    // Update dashboard user info
    const dashboardUserNameEl = document.getElementById('dashboardUserName');
    const dashboardInitialEl = document.getElementById('dashboardInitial');
    
    if (dashboardUserNameEl) dashboardUserNameEl.textContent = name;
    if (dashboardInitialEl) dashboardInitialEl.textContent = name.charAt(0).toUpperCase();

    // Update stats
    updateFreelancerStats(session);
}

// Update freelancer statistics
function updateFreelancerStats(session) {
    const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]')
        .filter(app => app.freelancerId === session.id);
    
    const activeProjects = appliedJobs.filter(app => app.status === 'accepted').length;
    const totalEarnings = activeProjects * 400000; // Mock calculation
    const profileViews = Math.floor(Math.random() * 200) + 50;
    
    // Update dashboard stats
    const totalApplicationsEl = document.getElementById('totalApplications');
    const activeProjectsEl = document.getElementById('activeProjects');
    const totalEarningsEl = document.getElementById('totalEarnings');
    const profileViewsEl = document.getElementById('profileViews');
    
    if (totalApplicationsEl) totalApplicationsEl.textContent = appliedJobs.length;
    if (activeProjectsEl) activeProjectsEl.textContent = activeProjects;
    if (totalEarningsEl) totalEarningsEl.textContent = `RWF ${totalEarnings.toLocaleString()}`;
    if (profileViewsEl) profileViewsEl.textContent = profileViews;
}

// Load recent applications
function loadRecentApplications() {
    const container = document.getElementById('recentApplications');
    if (!container) return;
    
    const session = JSON.parse(localStorage.getItem('userSession') || 'null');
    if (!session) return;
    
    const applications = JSON.parse(localStorage.getItem('appliedJobs') || '[]')
        .filter(app => app.freelancerId === session.id)
        .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
        .slice(0, 3);
    
    if (applications.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <p class="text-gray-500 text-sm">No applications yet. Start applying to jobs!</p>
                <button onclick="showSection('jobs')" class="mt-3 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                    Find Jobs
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = applications.map(app => `
        <div class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div>
                <h3 class="font-semibold text-gray-800">${app.jobTitle}</h3>
                <p class="text-sm text-gray-600">${app.clientName || 'Client'}</p>
                <p class="text-xs text-gray-500">Applied ${new Date(app.appliedAt).toLocaleDateString()}</p>
            </div>
            <span class="px-3 py-1 text-xs rounded-full ${getApplicationStatusColor(app.status)}">
                ${app.status.charAt(0).toUpperCase() + app.status.slice(1)}
            </span>
        </div>
    `).join('');
}

// Load recommended jobs
function loadRecommendedJobs() {
    const container = document.getElementById('recommendedJobs');
    if (!container) return;
    
    const session = JSON.parse(localStorage.getItem('userSession') || 'null');
    if (!session) return;
    
    const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
    const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
    
    // Filter out already applied jobs
    const availableJobs = jobs.filter(job => {
        return job.status === 'active' && 
               !appliedJobs.find(app => app.jobId === job.id && app.freelancerId === session.id);
    }).slice(0, 4);
    
    if (availableJobs.length === 0) {
        container.innerHTML = `
            <div class="col-span-2 text-center py-8">
                <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6"></path>
                </svg>
                <p class="text-gray-500 text-sm">No new jobs available</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = availableJobs.map(job => `
        <div class="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h3 class="font-semibold text-gray-800 mb-2">${job.title}</h3>
            <p class="text-sm text-gray-600 mb-2">${job.clientName || 'Client'}</p>
            <p class="text-xs text-gray-500 mb-3">${job.description.substring(0, 100)}...</p>
            <div class="flex items-center justify-between">
                <span class="text-green-600 font-bold">RWF ${parseInt(job.salary || 0).toLocaleString()}</span>
                <button onclick="applyToJob('${job.id}')" class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors">
                    Apply
                </button>
            </div>
        </div>
    `).join('');
}

// Get application status color
function getApplicationStatusColor(status) {
    switch(status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'reviewed': return 'bg-blue-100 text-blue-800';
        case 'accepted': return 'bg-green-100 text-green-800';
        case 'rejected': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

// Apply to job function
function applyToJob(jobId) {
    const session = JSON.parse(localStorage.getItem('userSession') || 'null');
    if (!session) {
        showNotification('Please log in to apply for jobs', 'error');
        return;
    }
    
    const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
    const job = jobs.find(j => j.id === jobId);
    
    if (!job) {
        showNotification('Job not found', 'error');
        return;
    }
    
    // Check if already applied
    const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
    const existingApplication = appliedJobs.find(app => app.jobId === jobId && app.freelancerId === session.id);
    
    if (existingApplication) {
        showNotification('You have already applied for this job', 'warning');
        return;
    }
    
    if (confirm(`Apply for "${job.title}"? Your profile will be sent to the client for review.`)) {
        const application = {
            id: 'app_' + Date.now().toString(36) + Math.random().toString(36).substr(2),
            jobId: jobId,
            jobTitle: job.title,
            freelancerId: session.id,
            freelancerName: session.fullName || session.name,
            clientId: job.clientId,
            clientName: job.clientName,
            status: 'pending',
            appliedAt: new Date().toISOString()
        };
        
        appliedJobs.push(application);
        localStorage.setItem('appliedJobs', JSON.stringify(appliedJobs));
        
        showNotification('Application submitted successfully!', 'success');
        
        // Refresh dashboard data
        updateFreelancerStats(session);
        loadRecentApplications();
        loadRecommendedJobs();
    }
}

// Load available jobs for jobs section
function loadAvailableJobs() {
    const container = document.getElementById('availableJobs');
    if (!container) return;
    
    const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
    const session = JSON.parse(localStorage.getItem('userSession') || 'null');
    const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
    
    let availableJobs = jobs.filter(job => {
        return job.status === 'active' && 
               !appliedJobs.find(app => app.jobId === job.id && app.freelancerId === session?.id);
    });
    
    // Apply filters
    const categoryFilter = document.getElementById('jobCategoryFilter')?.value;
    const budgetFilter = document.getElementById('jobBudgetFilter')?.value;
    const searchTerm = document.getElementById('jobSearchInput')?.value?.toLowerCase();
    
    if (categoryFilter) {
        availableJobs = availableJobs.filter(job => job.category === categoryFilter);
    }
    
    if (budgetFilter) {
        const [min, max] = budgetFilter.split('-').map(v => v === '+' ? Infinity : parseInt(v));
        availableJobs = availableJobs.filter(job => {
            const salary = parseInt(job.salary) || 0;
            return max ? salary >= min && salary <= max : salary >= min;
        });
    }
    
    if (searchTerm) {
        availableJobs = availableJobs.filter(job => 
            job.title.toLowerCase().includes(searchTerm) ||
            job.description.toLowerCase().includes(searchTerm) ||
            (job.skills && job.skills.toLowerCase().includes(searchTerm))
        );
    }
    
    if (availableJobs.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6"></path>
                </svg>
                <h3 class="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                <p class="text-gray-500">Try adjusting your filters or check back later.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = availableJobs.map(job => `
        <div class="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow mb-4">
            <div class="flex justify-between items-start mb-4">
                <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-800 mb-2">${job.title}</h3>
                    <p class="text-gray-600 mb-2">${job.clientName || 'Client'}</p>
                    <div class="flex items-center text-sm text-gray-500 mb-3">
                        <i class="fas fa-map-marker-alt mr-1"></i>${job.location || 'Remote'}
                        <span class="mx-2">•</span>
                        <i class="fas fa-clock mr-1"></i>Posted ${new Date(job.createdAt).toLocaleDateString()}
                    </div>
                </div>
                <div class="text-right">
                    <span class="text-2xl font-bold text-green-600">RWF ${parseInt(job.salary || 0).toLocaleString()}</span>
                    <p class="text-sm text-gray-500">Budget</p>
                </div>
            </div>
            
            <p class="text-gray-600 mb-4 line-clamp-3">${job.description}</p>
            
            ${job.skills ? `
                <div class="flex flex-wrap gap-2 mb-4">
                    ${job.skills.split(',').map(skill => 
                        `<span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">${skill.trim()}</span>`
                    ).join('')}
                </div>
            ` : ''}
            
            <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                <div class="flex items-center space-x-4 text-sm text-gray-500">
                    <span><i class="fas fa-user mr-1"></i>${job.experienceLevel || 'Any Level'}</span>
                    <span><i class="fas fa-calendar mr-1"></i>${job.duration || 'Not specified'}</span>
                </div>
                <button onclick="applyToJob('${job.id}')" class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                    <i class="fas fa-paper-plane mr-2"></i>Apply Now
                </button>
            </div>
        </div>
    `).join('');
}

// Filter applications
function filterApplications() {
    const filterValue = document.getElementById('applicationFilter')?.value || 'all';
    const session = JSON.parse(localStorage.getItem('userSession') || 'null');
    if (!session) return;
    
    let applications = JSON.parse(localStorage.getItem('appliedJobs') || '[]')
        .filter(app => app.freelancerId === session.id);
    
    if (filterValue !== 'all') {
        applications = applications.filter(app => app.status === filterValue);
    }
    
    renderFilteredApplications(applications);
    updateApplicationStats(session.id);
}

// Render filtered applications
function renderFilteredApplications(applications) {
    const container = document.getElementById('myApplications');
    if (!container) return;
    
    const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
    
    if (applications.length === 0) {
        const filterValue = document.getElementById('applicationFilter')?.value || 'all';
        const emptyMessage = filterValue === 'all' 
            ? 'You haven\'t applied to any jobs yet. Start browsing available opportunities!'
            : `No ${filterValue} applications found.`;
        
        container.innerHTML = `
            <div class="text-center py-12">
                <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <h3 class="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
                <p class="text-gray-500 mb-4">${emptyMessage}</p>
                ${filterValue === 'all' ? `
                    <button onclick="showSection('jobs')" class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                        Browse Jobs
                    </button>
                ` : ''}
            </div>
        `;
        return;
    }
    
    // Sort applications by date (newest first)
    applications.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
    
    container.innerHTML = applications.map(app => {
        const job = jobs.find(j => j.id === app.jobId);
        if (!job) return '';
        
        const statusInfo = getApplicationStatusInfo(app.status);
        const timeAgo = getTimeAgo(app.appliedAt);
        
        return `
            <div class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow mb-4">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex-1">
                        <div class="flex items-start justify-between">
                            <div>
                                <h3 class="text-lg font-semibold text-gray-800 mb-1">${job.title}</h3>
                                <p class="text-gray-600 mb-2">${job.clientName || 'Client'}</p>
                                <div class="flex items-center text-sm text-gray-500 mb-2">
                                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                                    </svg>
                                    ${job.location || 'Remote'}
                                    <span class="mx-2">•</span>
                                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                                    </svg>
                                    Applied ${timeAgo}
                                </div>
                            </div>
                            <div class="text-right">
                                <span class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${statusInfo.color}">
                                    ${statusInfo.text}
                                </span>
                                <p class="text-sm text-gray-500 mt-1">${new Date(app.appliedAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <p class="text-gray-600 mb-4 line-clamp-2">${job.description}</p>
                
                ${job.skills ? `
                    <div class="flex flex-wrap gap-2 mb-4">
                        ${job.skills.split(',').map(skill => 
                            `<span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">${skill.trim()}</span>`
                        ).join('')}
                    </div>
                ` : ''}
                
                <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div class="flex items-center space-x-4">
                        <span class="text-green-600 font-bold text-lg">RWF ${parseInt(job.salary || 0).toLocaleString()}</span>
                        <span class="text-sm text-gray-500">Budget</span>
                    </div>
                    <div class="flex items-center space-x-3">
                        <button onclick="viewJobDetails('${job.id}')" class="text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors">
                            View Job Details
                        </button>
                        ${app.status === 'pending' ? `
                            <button onclick="withdrawApplication('${app.id}')" class="text-red-500 hover:text-red-600 text-sm font-medium transition-colors">
                                Withdraw Application
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Get application status info
function getApplicationStatusInfo(status) {
    const statusMap = {
        pending: {
            text: 'Pending Review',
            color: 'bg-yellow-100 text-yellow-800'
        },
        reviewed: {
            text: 'Under Review',
            color: 'bg-blue-100 text-blue-800'
        },
        accepted: {
            text: 'Accepted',
            color: 'bg-green-100 text-green-800'
        },
        rejected: {
            text: 'Not Selected',
            color: 'bg-red-100 text-red-800'
        }
    };
    
    return statusMap[status] || statusMap.pending;
}

// Get time ago
function getTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString();
}

// Update application stats
function updateApplicationStats(freelancerId) {
    const applications = JSON.parse(localStorage.getItem('appliedJobs') || '[]')
        .filter(app => app.freelancerId === freelancerId);
    
    const totalApps = applications.length;
    const pendingApps = applications.filter(app => app.status === 'pending').length;
    const acceptedApps = applications.filter(app => app.status === 'accepted').length;
    const successRate = totalApps > 0 ? Math.round((acceptedApps / totalApps) * 100) : 0;
    
    // Update stats in applications section
    const totalEl = document.getElementById('appTotalApplications');
    const pendingEl = document.getElementById('appPendingApplications');
    const acceptedEl = document.getElementById('appAcceptedApplications');
    const successEl = document.getElementById('appSuccessRate');
    
    if (totalEl) totalEl.textContent = totalApps;
    if (pendingEl) pendingEl.textContent = pendingApps;
    if (acceptedEl) acceptedEl.textContent = acceptedApps;
    if (successEl) successEl.textContent = `${successRate}%`;
}

// View job details
function viewJobDetails(jobId) {
    const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
    const job = jobs.find(j => j.id === jobId);
    
    if (!job) {
        showNotification('Job not found', 'error');
        return;
    }
    
    // Create modal for job details
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b border-gray-200">
                <div class="flex justify-between items-start">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-800 mb-2">${job.title}</h2>
                        <p class="text-gray-600">${job.clientName || 'Client'}</p>
                    </div>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="p-6">
                <div class="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <h3 class="font-semibold text-gray-800 mb-2">Job Details</h3>
                        <div class="space-y-2 text-sm">
                            <p><span class="font-medium">Location:</span> ${job.location || 'Remote'}</p>
                            <p><span class="font-medium">Budget:</span> RWF ${parseInt(job.salary || 0).toLocaleString()}</p>
                            <p><span class="font-medium">Posted:</span> ${new Date(job.createdAt).toLocaleDateString()}</p>
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
}

// Withdraw application
function withdrawApplication(applicationId) {
    if (!confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) return;
    
    let appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
    const application = appliedJobs.find(app => app.id === applicationId);
    
    if (!application) {
        showNotification('Application not found', 'error');
        return;
    }
    
    appliedJobs = appliedJobs.filter(app => app.id !== applicationId);
    localStorage.setItem('appliedJobs', JSON.stringify(appliedJobs));
    
    showNotification(`Application for "${application.jobTitle}" withdrawn successfully`, 'success');
    
    // Refresh the applications list and stats
    filterApplications();
    
    // Update dashboard stats if on dashboard
    const session = JSON.parse(localStorage.getItem('userSession') || 'null');
    if (session) {
        updateFreelancerStats(session);
        loadRecentApplications();
        loadRecommendedJobs();
    }
}

// Initialize profile management
function initializeProfileManagement() {
    const form = document.getElementById('profileUpdateForm');
    if (form) {
        form.addEventListener('submit', saveProfile);
    }
    
    loadProfileData();
    initializeSkillHandlers();
    initializePreviewUpdates();
}

// Initialize skill input handlers
function initializeSkillHandlers() {
    const addSkillBtn = document.getElementById('addSkillBtn');
    const skillInput = document.getElementById('skillInput');
    
    if (addSkillBtn) {
        addSkillBtn.addEventListener('click', addSkill);
    }
    
    if (skillInput) {
        skillInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addSkill();
            }
        });
    }
}

// Initialize preview updates
function initializePreviewUpdates() {
    const inputs = ['fullName', 'professionalTitle', 'location', 'hourlyRate'];
    inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', updatePreview);
        }
    });
    
    // Initial preview update
    setTimeout(updatePreview, 100);
}

// Update preview function
function updatePreview() {
    const session = JSON.parse(localStorage.getItem('userSession') || 'null');
    if (!session) return;
    
    const fullName = document.getElementById('fullName')?.value || 'Your Name';
    const title = document.getElementById('professionalTitle')?.value || 'Your Title';
    const location = document.getElementById('location')?.value || 'Your Location';
    const rate = document.getElementById('hourlyRate')?.value;
    
    // Update preview elements
    const previewNameEl = document.getElementById('previewName');
    const previewTitleEl = document.getElementById('previewTitle');
    const previewLocationEl = document.getElementById('previewLocation');
    const previewRateEl = document.getElementById('previewRate');
    
    if (previewNameEl) previewNameEl.textContent = fullName;
    if (previewTitleEl) previewTitleEl.textContent = title;
    if (previewLocationEl) previewLocationEl.textContent = location;
    if (previewRateEl) {
        previewRateEl.textContent = rate ? `RWF ${parseInt(rate).toLocaleString()}/hour` : 'RWF --/hour';
    }
    
    // Update preview photo or initial
    const previewPhoto = document.getElementById('previewProfilePhoto');
    const previewInitialDiv = document.getElementById('previewProfileInitial');
    const previewInitial = document.getElementById('previewInitial');
    
    if (session.profilePhoto && previewPhoto) {
        previewPhoto.src = session.profilePhoto;
        previewPhoto.style.display = 'block';
        if (previewInitialDiv) previewInitialDiv.style.display = 'none';
    } else {
        if (previewPhoto) previewPhoto.style.display = 'none';
        if (previewInitialDiv) previewInitialDiv.style.display = 'flex';
        if (previewInitial) previewInitial.textContent = fullName.charAt(0).toUpperCase();
    }
    
    // Update skills preview
    const skills = getCurrentSkills();
    const previewSkills = document.getElementById('previewSkills');
    if (previewSkills) {
        if (skills.length > 0) {
            previewSkills.innerHTML = skills.map(skill => 
                `<span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">${skill}</span>`
            ).join('');
        } else {
            previewSkills.innerHTML = '<span class="text-xs text-gray-500">Add skills to see them here</span>';
        }
    }
    
    // Update profile completion
    const completion = calculateProfileCompletion();
    const previewProgress = document.getElementById('previewProgress');
    const previewPercentage = document.getElementById('previewPercentage');
    
    if (previewProgress) previewProgress.style.width = `${completion}%`;
    if (previewPercentage) previewPercentage.textContent = `${completion}% Complete`;
    
    // Update profile status badge
    updateProfileStatusBadge(completion);
}

// Update profile status badge
function updateProfileStatusBadge(completion) {
    const statusBadge = document.getElementById('profileStatusBadge');
    if (!statusBadge) return;
    
    if (completion === 100) {
        statusBadge.innerHTML = '<i class="fas fa-check-circle mr-1"></i>Profile Complete';
        statusBadge.className = 'inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800';
    } else if (completion >= 75) {
        statusBadge.innerHTML = '<i class="fas fa-clock mr-1"></i>Almost Complete';
        statusBadge.className = 'inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800';
    } else {
        statusBadge.innerHTML = '<i class="fas fa-exclamation-triangle mr-1"></i>Profile Incomplete';
        statusBadge.className = 'inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800';
    }
}

// Calculate profile completion with better accuracy
function calculateProfileCompletion() {
    const fields = {
        fullName: document.getElementById('fullName')?.value,
        professionalTitle: document.getElementById('professionalTitle')?.value,
        phone: document.getElementById('phone')?.value,
        location: document.getElementById('location')?.value,
        experienceLevel: document.getElementById('experienceLevel')?.value,
        bio: document.getElementById('bio')?.value,
        hourlyRate: document.getElementById('hourlyRate')?.value,
        skills: getCurrentSkills().length > 0
    };
    
    const totalFields = Object.keys(fields).length;
    const completedFields = Object.values(fields).filter(value => {
        if (typeof value === 'boolean') return value;
        return value && value.toString().trim() !== '';
    }).length;
    
    return Math.round((completedFields / totalFields) * 100);
}

// Load profile data
function loadProfileData() {
    const session = JSON.parse(localStorage.getItem('userSession') || 'null');
    if (!session) return;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === session.id) || session;
    
    // Update form fields
    const fullNameEl = document.getElementById('fullName');
    const professionalTitleEl = document.getElementById('professionalTitle');
    const emailEl = document.getElementById('email');
    const phoneEl = document.getElementById('phone');
    const locationEl = document.getElementById('location');
    const experienceLevelEl = document.getElementById('experienceLevel');
    const bioEl = document.getElementById('bio');
    const portfolioUrlEl = document.getElementById('portfolioUrl');
    const hourlyRateEl = document.getElementById('hourlyRate');
    
    if (fullNameEl) fullNameEl.value = user.fullName || user.name || '';
    if (professionalTitleEl) professionalTitleEl.value = user.professionalTitle || '';
    if (emailEl) emailEl.value = user.email || '';
    if (phoneEl) phoneEl.value = user.phone || '';
    if (locationEl) locationEl.value = user.location || '';
    if (experienceLevelEl) experienceLevelEl.value = user.experienceLevel || '';
    if (bioEl) bioEl.value = user.bio || '';
    if (portfolioUrlEl) portfolioUrlEl.value = user.portfolioUrl || '';
    if (hourlyRateEl) hourlyRateEl.value = user.hourlyRate || '';
    
    // Load skills
    const skills = user.skills ? user.skills.split(',').map(s => s.trim()) : [];
    displaySkills(skills);
}

// Save profile
function saveProfile(e) {
    e.preventDefault();
    
    const session = JSON.parse(localStorage.getItem('userSession') || 'null');
    if (!session) return;
    
    const formData = {
        fullName: document.getElementById('fullName').value,
        professionalTitle: document.getElementById('professionalTitle').value,
        phone: document.getElementById('phone').value,
        location: document.getElementById('location').value,
        experienceLevel: document.getElementById('experienceLevel').value,
        bio: document.getElementById('bio').value,
        portfolioUrl: document.getElementById('portfolioUrl').value,
        hourlyRate: document.getElementById('hourlyRate').value,
        skills: getCurrentSkills().join(', ')
    };
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === session.id);
    
    if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...formData };
        localStorage.setItem('users', JSON.stringify(users));
        
        const updatedSession = { ...session, ...formData };
        localStorage.setItem('userSession', JSON.stringify(updatedSession));
    }
    
    showNotification('Profile updated successfully!', 'success');
    updateProfileCompletion();
    loadDashboardData();
}

// Display skills
function displaySkills(skills) {
    const container = document.getElementById('skillsList');
    if (!container) return;
    
    container.innerHTML = skills.map(skill => `
        <span class="skill-tag inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
            ${skill}
            <button type="button" onclick="removeSkill('${skill}')" class="ml-2 text-blue-600 hover:text-blue-800">
                ×
            </button>
        </span>
    `).join('');
}

// Get current skills
function getCurrentSkills() {
    const skillsContainer = document.getElementById('skillsList');
    if (!skillsContainer) return [];
    
    const skillElements = skillsContainer.querySelectorAll('.skill-tag');
    return Array.from(skillElements).map(el => el.textContent.replace('×', '').trim());
}

// Add skill
function addSkill() {
    const skillInput = document.getElementById('skillInput');
    if (!skillInput) return;
    
    const skill = skillInput.value.trim();
    if (!skill) {
        showNotification('Please enter a skill', 'warning');
        return;
    }
    
    if (skill.length < 2) {
        showNotification('Skill must be at least 2 characters long', 'warning');
        return;
    }
    
    const currentSkills = getCurrentSkills();
    if (currentSkills.includes(skill)) {
        showNotification('Skill already added', 'warning');
        return;
    }
    
    if (currentSkills.length >= 20) {
        showNotification('Maximum 20 skills allowed', 'warning');
        return;
    }
    
    currentSkills.push(skill);
    displaySkills(currentSkills);
    skillInput.value = '';
    updatePreview();
    showNotification('Skill added successfully', 'success');
}

// Remove skill
function removeSkill(skill) {
    const currentSkills = getCurrentSkills().filter(s => s !== skill);
    displaySkills(currentSkills);
    updatePreview();
    showNotification('Skill removed', 'info');
}

// Update profile completion
function updateProfileCompletion() {
    const session = JSON.parse(localStorage.getItem('userSession') || 'null');
    if (!session) return;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === session.id) || session;
    
    const fields = {
        fullName: user.fullName || user.name,
        professionalTitle: user.professionalTitle,
        phone: user.phone,
        location: user.location,
        experienceLevel: user.experienceLevel,
        bio: user.bio,
        hourlyRate: user.hourlyRate,
        skills: user.skills
    };
    
    const totalFields = Object.keys(fields).length;
    const completedFields = Object.values(fields).filter(value => 
        value && value.toString().trim() !== ''
    ).length;
    
    const completion = Math.round((completedFields / totalFields) * 100);
    
    const progressBar = document.getElementById('profileProgressBar');
    const completionText = document.getElementById('profileCompletion');
    
    if (progressBar) {
        progressBar.style.width = `${completion}%`;
        if (completion === 100) {
            progressBar.className = 'bg-green-500 h-3 rounded-full transition-all duration-300';
        } else if (completion >= 75) {
            progressBar.className = 'bg-blue-500 h-3 rounded-full transition-all duration-300';
        } else {
            progressBar.className = 'bg-yellow-500 h-3 rounded-full transition-all duration-300';
        }
    }
    
    if (completionText) {
        completionText.textContent = `${completion}%`;
    }
    
    return completion;
}

// Load earnings data
function loadEarningsData() {
    const session = JSON.parse(localStorage.getItem('userSession') || 'null');
    if (!session) return;
    
    const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]')
        .filter(app => app.freelancerId === session.id && app.status === 'accepted');
    
    const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
    
    let totalEarnings = 0;
    let monthlyEarnings = 0;
    let completedProjects = 0;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Calculate earnings with proper date filtering
    appliedJobs.forEach(app => {
        const job = jobs.find(j => j.id === app.jobId);
        if (job) {
            const earnings = parseInt(job.salary) || 0;
            totalEarnings += earnings;
            completedProjects++;
            
            const appliedDate = new Date(app.appliedAt);
            if (appliedDate.getMonth() === currentMonth && appliedDate.getFullYear() === currentYear) {
                monthlyEarnings += earnings;
            }
        }
    });
    
    const averageRate = completedProjects > 0 ? Math.round(totalEarnings / completedProjects) : 0;
    
    // Update earnings display with animation
    updateEarningsDisplay(totalEarnings, monthlyEarnings, completedProjects, averageRate);
    
    // Load recent payments
    loadRecentPayments(appliedJobs, jobs);
    
    // Initialize earnings chart
    initializeEarningsChart(appliedJobs, jobs);
}

// Update earnings display with animation
function updateEarningsDisplay(totalEarnings, monthlyEarnings, completedProjects, averageRate) {
    const elements = [
        { id: 'totalEarningsAmount', value: totalEarnings, prefix: 'RWF ', suffix: '' },
        { id: 'monthlyEarnings', value: monthlyEarnings, prefix: 'RWF ', suffix: '' },
        { id: 'completedProjectsCount', value: completedProjects, prefix: '', suffix: '' },
        { id: 'averageRate', value: averageRate, prefix: 'RWF ', suffix: '/project' }
    ];
    
    elements.forEach(({ id, value, prefix, suffix }) => {
        const element = document.getElementById(id);
        if (element) {
            animateCounter(element, value, prefix, suffix);
        }
    });
}

// Animate counter with prefix and suffix
function animateCounter(element, targetValue, prefix = '', suffix = '') {
    let currentValue = 0;
    const increment = Math.max(1, targetValue / 30);
    const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= targetValue) {
            currentValue = targetValue;
            clearInterval(timer);
        }
        element.textContent = prefix + Math.floor(currentValue).toLocaleString() + suffix;
    }, 50);
}

// Load recent payments
function loadRecentPayments(appliedJobs, jobs) {
    const container = document.getElementById('recentPayments');
    if (!container) return;
    
    const recentPayments = appliedJobs.slice(-5).reverse();
    
    if (recentPayments.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-receipt text-gray-300 text-4xl mb-3"></i>
                <p class="text-gray-500">No payments yet. Complete projects to see your earnings here.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = recentPayments.map(payment => {
        const job = jobs.find(j => j.id === payment.jobId);
        const paymentDate = new Date(payment.appliedAt);
        return `
            <div class="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div class="flex items-center">
                    <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <i class="fas fa-check text-green-600"></i>
                    </div>
                    <div>
                        <h4 class="font-medium text-gray-800">${job?.title || 'Project'}</h4>
                        <p class="text-sm text-gray-500">Completed ${paymentDate.toLocaleDateString()}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="font-bold text-green-600">+RWF ${parseInt(job?.salary || 0).toLocaleString()}</p>
                    <p class="text-xs text-gray-500">Payment received</p>
                </div>
            </div>
        `;
    }).join('');
}

// Initialize earnings chart
function initializeEarningsChart(appliedJobs, jobs) {
    const ctx = document.getElementById('earningsChart');
    if (!ctx || typeof Chart === 'undefined') {
        console.log('Chart.js not available or canvas element not found');
        return;
    }
    
    // Destroy existing chart if it exists
    if (window.earningsChartInstance) {
        window.earningsChartInstance.destroy();
    }
    
    const monthlyData = new Array(12).fill(0);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    appliedJobs.forEach(app => {
        const job = jobs.find(j => j.id === app.jobId);
        if (job) {
            const appDate = new Date(app.appliedAt);
            if (appDate.getFullYear() === currentYear) {
                const month = appDate.getMonth();
                monthlyData[month] += parseInt(job.salary) || 0;
            }
        }
    });
    
    window.earningsChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthNames,
            datasets: [{
                label: 'Monthly Earnings (RWF)',
                data: monthlyData,
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#3B82F6',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'RWF ' + context.parsed.y.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'RWF ' + value.toLocaleString();
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// Initialize settings
function initializeSettings() {
    const session = JSON.parse(localStorage.getItem('userSession') || 'null');
    if (!session) return;
    
    // Load current settings
    const settings = JSON.parse(localStorage.getItem('userSettings_' + session.id) || '{}');
    
    // Set form values
    const emailNotificationsEl = document.getElementById('emailNotifications');
    const profileVisibilityEl = document.getElementById('profileVisibility');
    const jobAlertsEl = document.getElementById('jobAlerts');
    const marketingEmailsEl = document.getElementById('marketingEmails');
    
    if (emailNotificationsEl) emailNotificationsEl.value = settings.emailNotifications || 'all';
    if (profileVisibilityEl) profileVisibilityEl.value = settings.profileVisibility || 'public';
    if (jobAlertsEl) jobAlertsEl.checked = settings.jobAlerts !== false;
    if (marketingEmailsEl) marketingEmailsEl.checked = settings.marketingEmails !== false;
    
    // Update summary
    updateSettingsSummary(settings);
    
    // Initialize form handlers
    initializeSettingsFormHandlers(session);
}

// Update settings summary
function updateSettingsSummary(settings) {
    const visibilityStatusEl = document.getElementById('visibilityStatus');
    const notificationStatusEl = document.getElementById('notificationStatus');
    const alertsStatusEl = document.getElementById('alertsStatus');
    const lastLoginEl = document.getElementById('lastLogin');
    const accountCreatedEl = document.getElementById('accountCreated');
    
    if (visibilityStatusEl) visibilityStatusEl.textContent = settings.profileVisibility === 'private' ? 'Private' : 'Public';
    if (notificationStatusEl) notificationStatusEl.textContent = settings.emailNotifications || 'All';
    if (alertsStatusEl) alertsStatusEl.textContent = settings.jobAlerts !== false ? 'Enabled' : 'Disabled';
    if (lastLoginEl) lastLoginEl.textContent = 'Today';
    
    const session = JSON.parse(localStorage.getItem('userSession') || 'null');
    if (accountCreatedEl && session) {
        accountCreatedEl.textContent = new Date(session.createdAt || Date.now()).toLocaleDateString();
    }
}

// Initialize settings form handlers
function initializeSettingsFormHandlers(session) {
    // Account settings form
    const accountForm = document.getElementById('accountSettingsForm');
    if (accountForm) {
        accountForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveAccountSettings(session);
        });
    }
    
    // Security form
    const securityForm = document.getElementById('securityForm');
    if (securityForm) {
        securityForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updatePassword(session);
        });
    }
}

// Save account settings
function saveAccountSettings(session) {
    const newSettings = {
        emailNotifications: document.getElementById('emailNotifications')?.value || 'all',
        profileVisibility: document.getElementById('profileVisibility')?.value || 'public',
        jobAlerts: document.getElementById('jobAlerts')?.checked !== false,
        marketingEmails: document.getElementById('marketingEmails')?.checked !== false
    };
    
    localStorage.setItem('userSettings_' + session.id, JSON.stringify(newSettings));
    updateSettingsSummary(newSettings);
    showNotification('Settings saved successfully!', 'success');
}

// Update password
function updatePassword(session) {
    const currentPassword = document.getElementById('currentPassword')?.value;
    const newPassword = document.getElementById('newPassword')?.value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        showNotification('Please fill in all password fields', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    
    // Update password in users array
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === session.id);
    
    if (userIndex !== -1 && users[userIndex].password === currentPassword) {
        users[userIndex].password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));
        
        // Clear form
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        
        showNotification('Password updated successfully!', 'success');
    } else {
        showNotification('Current password is incorrect', 'error');
    }
}

// Export data function
function exportData() {
    const session = JSON.parse(localStorage.getItem('userSession') || 'null');
    if (!session) return;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === session.id);
    const applications = JSON.parse(localStorage.getItem('appliedJobs') || '[]')
        .filter(app => app.freelancerId === session.id);
    const settings = JSON.parse(localStorage.getItem('userSettings_' + session.id) || '{}');
    
    const exportData = {
        profile: user,
        applications: applications,
        settings: settings,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `rwanda-skillsconnect-data-${session.id}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showNotification('Data exported successfully!', 'success');
}

// Delete account function
function deleteAccount() {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    
    if (!confirm('This will permanently delete all your data, applications, and profile. Are you absolutely sure?')) return;
    
    const session = JSON.parse(localStorage.getItem('userSession') || 'null');
    if (!session) return;
    
    // Remove user from users array
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    users = users.filter(u => u.id !== session.id);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Remove user applications
    let applications = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
    applications = applications.filter(app => app.freelancerId !== session.id);
    localStorage.setItem('appliedJobs', JSON.stringify(applications));
    
    // Remove user settings
    localStorage.removeItem('userSettings_' + session.id);
    
    // Clear session
    localStorage.removeItem('userSession');
    
    showNotification('Account deleted successfully', 'success');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

// Notification system
function showNotification(message, type = 'success', duration = 3000) {
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
        default:
            notification.classList.add('bg-gray-500', 'text-white');
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
    }, duration);
}

// Make functions globally available
window.initializeFreelancerDashboard = initializeFreelancerDashboard;
window.showSection = showSection;
window.applyToJob = applyToJob;
window.loadAvailableJobs = loadAvailableJobs;
window.filterApplications = filterApplications;
window.updateApplicationStats = updateApplicationStats;
window.viewJobDetails = viewJobDetails;
window.withdrawApplication = withdrawApplication;
window.addSkill = addSkill;
window.removeSkill = removeSkill;
window.loadEarningsData = loadEarningsData;
window.initializeSettings = initializeSettings;
window.showNotification = showNotification;
window.exportData = exportData;
window.deleteAccount = deleteAccount;
window.updatePreview = updatePreview;
window.calculateProfileCompletion = calculateProfileCompletion;
window.loadRecentPayments = loadRecentPayments;
window.initializeEarningsChart = initializeEarningsChart;