/**
 * Find Jobs functionality for freelancers
 */

let allJobs = [];
let filteredJobs = [];
let currentPage = 1;
const itemsPerPage = 9;

// Load and display jobs for freelancers
function loadJobsForFreelancers() {
    const session = JSON.parse(localStorage.getItem('userSession') || 'null');
    if (!session || session.role !== 'freelancer') return;

    allJobs = JSON.parse(localStorage.getItem('jobs') || '[]')
        .filter(job => job.status === 'active'); // Only show active jobs
    
    // Filter out jobs already applied to
    const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
    allJobs = allJobs.filter(job => {
        return !appliedJobs.find(app => app.jobId === job.id && app.freelancerId === session.id);
    });

    applyJobFilters();
}

// Apply filters to jobs
function applyJobFilters() {
    const searchTerm = document.getElementById('searchJobs')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';
    const budgetFilter = document.getElementById('budgetFilter')?.value || '';

    filteredJobs = allJobs.filter(job => {
        // Search filter
        if (searchTerm) {
            const searchableText = (job.title + ' ' + job.description + ' ' + job.clientName + ' ' + (job.skills || '')).toLowerCase();
            if (!searchableText.includes(searchTerm)) return false;
        }

        // Category filter
        if (categoryFilter && job.category !== categoryFilter) return false;

        // Budget filter
        if (budgetFilter) {
            const salary = parseInt(job.salary) || 0;
            if (budgetFilter === '0-500' && salary >= 500000) return false;
            if (budgetFilter === '500-1000' && (salary < 500000 || salary >= 1000000)) return false;
            if (budgetFilter === '1000+' && salary < 1000000) return false;
        }

        return true;
    });

    // Apply sorting
    sortJobs();
    
    // Reset pagination
    currentPage = 1;
    
    // Render jobs
    renderJobs();
    updateResultsCount();
}

// Sort jobs based on current sort option
function sortJobs() {
    const sortBy = document.getElementById('sortBy')?.value || 'newest';
    
    switch(sortBy) {
        case 'newest':
            filteredJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'salary-high':
            filteredJobs.sort((a, b) => (parseInt(b.salary) || 0) - (parseInt(a.salary) || 0));
            break;
        case 'salary-low':
            filteredJobs.sort((a, b) => (parseInt(a.salary) || 0) - (parseInt(b.salary) || 0));
            break;
        case 'title':
            filteredJobs.sort((a, b) => a.title.localeCompare(b.title));
            break;
    }
}

// Render jobs in the container
function renderJobs() {
    const container = document.getElementById('jobsContainer');
    if (!container) return;

    const startIndex = 0;
    const endIndex = currentPage * itemsPerPage;
    const jobsToShow = filteredJobs.slice(startIndex, endIndex);

    if (jobsToShow.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6"></path>
                </svg>
                <h3 class="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                <p class="text-gray-500">Try adjusting your search criteria or check back later for new opportunities.</p>
            </div>
        `;
        document.getElementById('loadMoreBtn').classList.add('hidden');
        return;
    }

    container.innerHTML = jobsToShow.map(job => `
        <div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden">
            <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex-1">
                        <h3 class="text-lg font-semibold text-gray-800 mb-2 hover:text-indigo-600 cursor-pointer" onclick="showJobModal('${job.id}')">${job.title}</h3>
                        <p class="text-gray-600 mb-2">${job.clientName}</p>
                        <div class="flex items-center text-sm text-gray-500 space-x-4">
                            <span><i class="fas fa-map-marker-alt mr-1"></i>${job.location}</span>
                            <span><i class="fas fa-clock mr-1"></i>${new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-2xl font-bold text-green-600">RWF ${parseInt(job.salary).toLocaleString()}</div>
                        <div class="text-sm text-gray-500">${job.projectType === 'hourly' ? 'Hourly' : 'Fixed Price'}</div>
                    </div>
                </div>
                
                <p class="text-gray-600 mb-4 line-clamp-3">${job.description}</p>
                
                ${job.skills ? `
                    <div class="flex flex-wrap gap-2 mb-4">
                        ${job.skills.split(',').slice(0, 4).map(skill => 
                            `<span class="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">${skill.trim()}</span>`
                        ).join('')}
                        ${job.skills.split(',').length > 4 ? `<span class="text-xs text-gray-500">+${job.skills.split(',').length - 4} more</span>` : ''}
                    </div>
                ` : ''}
                
                <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div class="flex items-center space-x-4 text-sm text-gray-500">
                        <span><i class="fas fa-user mr-1"></i>${job.experienceLevel || 'Any Level'}</span>
                        <span><i class="fas fa-calendar mr-1"></i>${job.duration || 'Not specified'}</span>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="showJobModal('${job.id}')" class="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                            View Details
                        </button>
                        <button onclick="applyToJob('${job.id}')" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                            <i class="fas fa-paper-plane mr-1"></i>Apply Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    // Show/hide load more button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (endIndex < filteredJobs.length) {
        loadMoreBtn.classList.remove('hidden');
    } else {
        loadMoreBtn.classList.add('hidden');
    }
}

// Update results count
function updateResultsCount() {
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        const showing = Math.min(currentPage * itemsPerPage, filteredJobs.length);
        resultsCount.textContent = `Showing ${showing} of ${filteredJobs.length} jobs`;
    }
}

// Show job details modal
function showJobModal(jobId) {
    const job = allJobs.find(j => j.id === jobId);
    if (!job) {
        showNotification('Job not found', 'error');
        return;
    }

    const modal = document.getElementById('profileModal');
    const modalContent = document.getElementById('profileModalContent');
    
    modalContent.innerHTML = `
        <div class="mb-6">
            <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                    <h3 class="text-2xl font-bold text-gray-800 mb-2">${job.title}</h3>
                    <p class="text-lg text-gray-600 mb-2">${job.clientName}</p>
                    <div class="flex items-center space-x-4 text-sm text-gray-500">
                        <span><i class="fas fa-map-marker-alt mr-1"></i>${job.location}</span>
                        <span><i class="fas fa-clock mr-1"></i>Posted ${new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-3xl font-bold text-green-600">RWF ${parseInt(job.salary).toLocaleString()}</div>
                    <div class="text-sm text-gray-500">${job.projectType === 'hourly' ? 'Hourly Rate' : 'Fixed Price'}</div>
                </div>
            </div>
        </div>
        
        <div class="space-y-6">
            <div>
                <h4 class="text-lg font-semibold text-gray-800 mb-3">Job Description</h4>
                <p class="text-gray-600 leading-relaxed">${job.description}</p>
            </div>
            
            ${job.skills ? `
                <div>
                    <h4 class="text-lg font-semibold text-gray-800 mb-3">Required Skills</h4>
                    <div class="flex flex-wrap gap-2">
                        ${job.skills.split(',').map(skill => 
                            `<span class="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">${skill.trim()}</span>`
                        ).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div class="bg-gray-50 rounded-lg p-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <h5 class="font-medium text-gray-800 mb-2">Project Details</h5>
                        <div class="space-y-1 text-sm text-gray-600">
                            <p><span class="font-medium">Experience Level:</span> ${job.experienceLevel || 'Any Level'}</p>
                            <p><span class="font-medium">Duration:</span> ${job.duration || 'Not specified'}</p>
                            <p><span class="font-medium">Project Type:</span> ${job.projectType === 'hourly' ? 'Hourly' : 'Fixed Price'}</p>
                        </div>
                    </div>
                    <div>
                        <h5 class="font-medium text-gray-800 mb-2">Budget Information</h5>
                        <div class="space-y-1 text-sm text-gray-600">
                            <p><span class="font-medium">Budget:</span> RWF ${parseInt(job.salary).toLocaleString()}</p>
                            ${job.minBudget ? `<p><span class="font-medium">Min Budget:</span> RWF ${parseInt(job.minBudget).toLocaleString()}</p>` : ''}
                            ${job.maxBudget ? `<p><span class="font-medium">Max Budget:</span> RWF ${parseInt(job.maxBudget).toLocaleString()}</p>` : ''}
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="flex space-x-4 pt-4 border-t">
                <button onclick="applyToJob('${job.id}'); closeJobModal();" class="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                    <i class="fas fa-paper-plane mr-2"></i>Apply for this Job
                </button>
                <button onclick="saveJob('${job.id}')" class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <i class="fas fa-bookmark mr-2"></i>Save Job
                </button>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Close job modal
function closeJobModal() {
    document.getElementById('profileModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Save job for later
function saveJob(jobId) {
    const session = JSON.parse(localStorage.getItem('userSession') || 'null');
    if (!session) return;

    let savedJobs = JSON.parse(localStorage.getItem('savedJobs_' + session.id) || '[]');
    
    if (!savedJobs.includes(jobId)) {
        savedJobs.push(jobId);
        localStorage.setItem('savedJobs_' + session.id, JSON.stringify(savedJobs));
        showNotification('Job saved successfully!', 'success');
    } else {
        showNotification('Job already saved', 'info');
    }
}

// Initialize find jobs page
function initializeFindJobsPage() {
    // Load jobs
    loadJobsForFreelancers();
    
    // Setup event listeners
    const searchInput = document.getElementById('searchJobs');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(applyJobFilters, 300));
    }
    
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyJobFilters);
    }
    
    const budgetFilter = document.getElementById('budgetFilter');
    if (budgetFilter) {
        budgetFilter.addEventListener('change', applyJobFilters);
    }
    
    const sortBy = document.getElementById('sortBy');
    if (sortBy) {
        // Update sort options for jobs
        sortBy.innerHTML = `
            <option value="newest">Newest First</option>
            <option value="salary-high">Highest Budget</option>
            <option value="salary-low">Lowest Budget</option>
            <option value="title">Job Title (A-Z)</option>
        `;
        sortBy.addEventListener('change', applyJobFilters);
    }
    
    // Quick filter badges
    document.querySelectorAll('.filter-badge').forEach(badge => {
        badge.addEventListener('click', () => {
            const filter = badge.getAttribute('data-filter');
            document.getElementById('categoryFilter').value = filter;
            applyJobFilters();
        });
    });
    
    // Load more button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            currentPage++;
            renderJobs();
            updateResultsCount();
        });
    }
    
    // Modal close functionality
    const modal = document.getElementById('profileModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeJobModal();
            }
        });
    }
}

// Debounce function
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

// Make functions globally available
window.showJobModal = showJobModal;
window.closeJobModal = closeJobModal;
window.saveJob = saveJob;
window.initializeFindJobsPage = initializeFindJobsPage;
window.loadJobsForFreelancers = loadJobsForFreelancers;
window.applyJobFilters = applyJobFilters;