/**
 * Rwanda SkillsConnect - Main JavaScript File
 * Handles all frontend functionality with localStorage simulation
 * Backend integration points are clearly marked with comments
 */

'use strict';

// ==================== UTILITY FUNCTIONS ====================

// Get current page name
function getCurrentPage() {
    try {
        return window.location.pathname.split('/').pop() || 'index.html';
    } catch (error) {
        console.error('Error getting current page:', error);
        return 'index.html';
    }
}

// Show alert messages (will be replaced by showNotification)
function showAlert(message, type = 'success') {
    if (typeof showNotification === 'function') {
        showNotification(message, type);
    } else {
        alert(message);
    }
}

// Generate unique ID with better entropy
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 15);
}

// CSRF Protection Functions
function generateCSRFToken() {
    try {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        sessionStorage.setItem('csrfToken', token);
        return token;
    } catch (error) {
        console.error('Error generating CSRF token:', error);
        // Fallback for older browsers
        const token = Date.now().toString(36) + Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem('csrfToken', token);
        return token;
    }
}

function getCSRFToken() {
    try {
        let token = sessionStorage.getItem('csrfToken');
        if (!token) {
            token = generateCSRFToken();
        }
        return token;
    } catch (error) {
        console.error('Error getting CSRF token:', error);
        return generateCSRFToken();
    }
}

function validateCSRFToken(form) {
    try {
        if (!form) return false;
        
        const formToken = form.querySelector('input[name="_token"]')?.value;
        const sessionToken = sessionStorage.getItem('csrfToken');
        
        if (!formToken || !sessionToken || formToken !== sessionToken) {
            return false;
        }
        
        // Generate new token after validation
        generateCSRFToken();
        return true;
    } catch (error) {
        console.error('Error validating CSRF token:', error);
        return false;
    }
}

function addCSRFTokenToForm(form) {
    try {
        if (!form) return;
        
        // Remove existing token if present
        const existingToken = form.querySelector('input[name="_token"]');
        if (existingToken) {
            existingToken.remove();
        }
        
        // Add new CSRF token
        const tokenInput = document.createElement('input');
        tokenInput.type = 'hidden';
        tokenInput.name = '_token';
        tokenInput.value = getCSRFToken();
        form.appendChild(tokenInput);
    } catch (error) {
        console.error('Error adding CSRF token to form:', error);
    }
}

// Generate OTP code
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Validate email format with improved regex
function validateEmail(email) {
    if (!email || typeof email !== 'string') return false;
    
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email) && email.length <= 254;
}

// Send OTP for password reset
function sendPasswordResetOTP(email) {
    return new Promise(async (resolve) => {
        try {
            // Check if user exists first
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === email);
            if (!user) {
                resolve({
                    success: false,
                    error: 'No account found with this email address'
                });
                return;
            }
            
            // Generate OTP
            const otpCode = generateOTP();
            const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes
            
            // Store OTP data
            sessionStorage.setItem('resetOTP', otpCode);
            sessionStorage.setItem('resetOTPExpiry', expiry.toString());
            sessionStorage.setItem('resetEmail', email);
            
            // Send OTP via email service
            if (window.emailService) {
                await emailService.sendPasswordResetEmail(email, otpCode);
            }
            
            console.log('Demo OTP for', email, ':', otpCode); // For testing
            
            resolve({
                success: true,
                message: 'OTP sent successfully'
            });
        } catch (error) {
            console.error('Send OTP error:', error);
            resolve({
                success: false,
                error: error.message || 'Failed to send OTP'
            });
        }
    });
}

// Verify password reset OTP
function verifyPasswordResetOTP(email, otpCode) {
    const storedOTP = sessionStorage.getItem('resetOTP');
    const storedExpiry = parseInt(sessionStorage.getItem('resetOTPExpiry') || '0');
    const storedEmail = sessionStorage.getItem('resetEmail');
    
    if (!storedOTP || !storedExpiry || !storedEmail) {
        return {
            success: false,
            error: 'No OTP session found. Please request a new OTP.'
        };
    }
    
    if (storedEmail !== email) {
        return {
            success: false,
            error: 'Email mismatch. Please request a new OTP.'
        };
    }
    
    if (Date.now() > storedExpiry) {
        return {
            success: false,
            error: 'OTP has expired. Please request a new one.'
        };
    }
    
    if (storedOTP !== otpCode) {
        return {
            success: false,
            error: 'Invalid OTP code. Please try again.'
        };
    }
    
    return {
        success: true,
        message: 'OTP verified successfully'
    };
}

// Reset password with verified OTP
function resetPasswordWithOTP(email, newPassword, otpCode) {
    // First verify OTP
    const otpVerification = verifyPasswordResetOTP(email, otpCode);
    if (!otpVerification.success) {
        return otpVerification;
    }
    
    try {
        // Update password in localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.email === email);
        
        if (userIndex === -1) {
            return {
                success: false,
                error: 'User not found'
            };
        }
        
        // Update password
        users[userIndex].password = newPassword;
        users[userIndex].passwordResetAt = new Date().toISOString();
        localStorage.setItem('users', JSON.stringify(users));
        
        // Clear OTP session
        sessionStorage.removeItem('resetOTP');
        sessionStorage.removeItem('resetOTPExpiry');
        sessionStorage.removeItem('resetEmail');
        
        return {
            success: true,
            message: 'Password reset successfully'
        };
    } catch (error) {
        console.error('Password reset error:', error);
        return {
            success: false,
            error: 'Failed to reset password. Please try again.'
        };
    }
}

// Check if freelancer can apply to more jobs
function canFreelancerApply(freelancerId) {
    const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
    const activeApplications = appliedJobs.filter(app => 
        app.freelancerId === freelancerId && 
        ['pending', 'reviewed', 'pending_client_review'].includes(app.status)
    );
    
    const maxAllowed = 10; // Maximum active applications
    
    return {
        canApply: activeApplications.length < maxAllowed,
        activeCount: activeApplications.length,
        maxAllowed: maxAllowed
    };
}

// ==================== AUTHENTICATION FUNCTIONS ====================

// Google Sign-In Handler
function handleGoogleSignIn(credential) {
    try {
        if (!credential || typeof credential !== 'string') {
            throw new Error('Invalid credential');
        }
        
        // Basic JWT structure validation
        const parts = credential.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid JWT format');
        }
        
        // In a real application, you would verify this token on your server
        const payload = JSON.parse(atob(parts[1]));
        
        // Validate required fields
        if (!payload.sub || !payload.email || !payload.name) {
            throw new Error('Missing required user data');
        }
        
        const userData = {
            id: 'google_' + payload.sub,
            name: payload.name,
            email: payload.email,
            role: 'client', // Default role for Google users
            token: credential,
            picture: payload.picture || '',
            provider: 'google'
        };
        
        // Save session
        localStorage.setItem('userSession', JSON.stringify(userData));
        
        // Add to users if not exists
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (!users.find(u => u.email === userData.email)) {
            users.push({
                ...userData,
                fullName: userData.name,
                phone: '',
                password: '', // Google users don't have passwords
                createdAt: new Date().toISOString()
            });
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        showNotification('Google Sign-In successful!', 'success');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'client-dashboard.html';
        }, 1000);
        
    } catch (error) {
        console.error('Google Sign-In error:', error);
        showNotification('Google Sign-In failed. Please try again.', 'error');
    }
}

// Check authentication status
function getAuthStatus() {
    const session = JSON.parse(localStorage.getItem('userSession') || 'null');
    return {
        isAuthenticated: !!session,
        user: session,
        role: session?.role || null
    };
}

// Registration Logic
function handleRegistration() {
    if (getCurrentPage() !== 'register.html') return;
    
    // Check if user is already logged in and redirect to dashboard
    const session = JSON.parse(localStorage.getItem('userSession') || 'null');
    if (session && session.role) {
        redirectToDashboard(session.role);
        return;
    }
    
    const roleCards = document.querySelectorAll('.role-card');
    const modal = document.getElementById('registrationModal');
    const closeModal = document.getElementById('closeModal');
    const form = document.getElementById('registerForm');
    const selectedRoleInput = document.getElementById('selectedRole');
    
    // Add CSRF protection to form
    if (form) {
        addCSRFTokenToForm(form);
    }

    // Handle role card selection
    roleCards.forEach(card => {
        card.addEventListener('click', function() {
            const role = this.dataset.role;
            selectedRoleInput.value = role;
            modal.classList.remove('hidden');
        });
    });

    // Handle modal close
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            modal.classList.add('hidden');
        });
    }

    // Handle form submission
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // CSRF Protection: Validate form token
            if (!validateCSRFToken(form)) {
                showAlert('Security validation failed. Please refresh and try again.', 'error');
                return;
            }
            
            const formData = new FormData(form);
            const userData = {
                id: generateId(),
                fullName: formData.get('fullName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                role: formData.get('role'),
                password: formData.get('password'),
                createdAt: new Date().toISOString()
            };

            // Check for existing email
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            if (users.find(user => user.email === userData.email)) {
                showAlert('Email already exists!', 'error');
                return;
            }

            // Save user to localStorage
            users.push(userData);
            localStorage.setItem('users', JSON.stringify(users));

            // TODO: Replace with API call
            // fetch('/api/register', {
            //     method: 'POST',
            //     headers: { 
            //         'Content-Type': 'application/json',
            //         'X-CSRF-Token': getCSRFToken()
            //     },
            //     body: JSON.stringify(userData)
            // })

            showAlert('Registration successful!');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        });
    }


}

// Login Logic
function handleLogin() {
    if (getCurrentPage() !== 'login.html') return;
    
    // Login functionality is now handled directly in login.html
    // This function serves as a fallback and for any additional login page setup
    
    // Don't automatically redirect from login page - let users logout first if needed
}

// Helper function to redirect to appropriate dashboard
function redirectToDashboard(role) {
    switch(role) {
        case 'freelancer':
            window.location.href = 'freelancer-dashboard.html';
            break;
        case 'client':
            window.location.href = 'client-dashboard.html';
            break;
        case 'admin':
            window.location.href = 'admin-dashboard.html';
            break;
        default:
            window.location.href = 'index.html';
    }
}

// Logout Logic
function handleLogout() {
    const logoutBtns = document.querySelectorAll('.logout-btn, [data-logout]');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Clear session
            localStorage.removeItem('userSession');
            
            // TODO: Replace with API call
            // fetch('/api/logout', { method: 'POST' })
            
            showAlert('Logged out successfully!');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 500);
        });
    });
}

// Enhanced authentication check with role-based access control
function checkAuth() {
    try {
        const sessionData = localStorage.getItem('userSession');
        const session = sessionData ? JSON.parse(sessionData) : null;
        const publicPages = ['index.html', 'login.html', 'register.html', 'about.html', 'debug-access.html', 'browse.html', 'map.html', ''];
        const currentPage = getCurrentPage();
        
        if (!session && !publicPages.includes(currentPage)) {
            showNotification('Please login to access this page', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
            return null;
        }
        
        // Enhanced role-based page access control
        if (session && session.role) {
            // Initialize role-based UI filtering
            if (typeof window.RoleAccessControl !== 'undefined') {
                window.RoleAccessControl.initializeRoleAccessControl();
            }
        }
        
        return session;
    } catch (error) {
        console.error('Error checking authentication:', error);
        localStorage.removeItem('userSession');
        return null;
    }
}

// ==================== DASHBOARD FUNCTIONS ====================

// Enhanced Freelancer Dashboard
function renderFreelancerDashboard() {
    if (getCurrentPage() !== 'freelancer-dashboard.html') return;
    
    const session = checkAuth();
    if (!session || session.role !== 'freelancer') return;

    // Update dashboard stats
    updateFreelancerStats(session);
    
    // Load user profile data
    loadFreelancerProfile(session);
    
    // Initialize dashboard components
    initializeFreelancerComponents();
}

function updateFreelancerStats(session) {
    const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]')
        .filter(app => app.freelancerId === session.id);
    
    const activeProjects = appliedJobs.filter(app => app.status === 'accepted').length;
    const totalEarnings = calculateTotalEarnings(session.id);
    const profileViews = Math.floor(Math.random() * 200) + 50; // Mock data
    
    // Update stats elements
    const totalApplicationsEl = document.getElementById('totalApplications');
    const activeProjectsEl = document.getElementById('activeProjects');
    const totalEarningsEl = document.getElementById('totalEarnings');
    const profileViewsEl = document.getElementById('profileViews');
    
    if (totalApplicationsEl) totalApplicationsEl.textContent = appliedJobs.length;
    if (activeProjectsEl) activeProjectsEl.textContent = activeProjects;
    if (totalEarningsEl) totalEarningsEl.textContent = `$${totalEarnings}`;
    if (profileViewsEl) profileViewsEl.textContent = profileViews;
}

function loadFreelancerProfile(session) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === session.id) || session;
    
    // Update profile information
    const profileNameEl = document.getElementById('profileName');
    const profileTitleEl = document.getElementById('profileTitle');
    const profileLocationEl = document.getElementById('profileLocation');
    const profileSkillsEl = document.getElementById('profileSkills');
    const profileContactEl = document.getElementById('profileContact');
    
    if (profileNameEl) profileNameEl.textContent = user.fullName || user.name || '';
    if (profileTitleEl) profileTitleEl.textContent = user.professionalTitle || user.title || '';
    if (profileLocationEl) profileLocationEl.textContent = user.location || '';
    
    if (profileSkillsEl && user.skills) {
        const skills = user.skills.split(',').map(skill => skill.trim());
        profileSkillsEl.innerHTML = skills.map(skill => 
            `<span class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">${skill}</span>`
        ).join('');
    }
    
    if (profileContactEl) {
        profileContactEl.innerHTML = `
            <p class="text-sm text-gray-600"><span class="font-medium">Email:</span> ${user.email}</p>
            <p class="text-sm text-gray-600"><span class="font-medium">Phone:</span> ${user.phone || ''}</p>
            <p class="text-sm text-gray-600"><span class="font-medium">Experience:</span> ${user.experienceLevel || ''}</p>
            <p class="text-sm text-gray-600"><span class="font-medium">Rate:</span> ${user.hourlyRate ? '$' + user.hourlyRate + '/hour' : ''}</p>
        `;
    }
    
    // Calculate and update profile completion
    updateDashboardProfileCompletion(user);
}

function updateDashboardProfileCompletion(user) {
    const requiredFields = {
        fullName: user.fullName || user.name,
        professionalTitle: user.professionalTitle,
        phone: user.phone,
        location: user.location,
        experienceLevel: user.experienceLevel,
        bio: user.bio,
        hourlyRate: user.hourlyRate,
        skills: user.skills
    };
    
    const totalFields = Object.keys(requiredFields).length;
    const completedFields = Object.values(requiredFields).filter(value => 
        value && value.toString().trim() !== ''
    ).length;
    
    const completion = Math.round((completedFields / totalFields) * 100);
    
    // Update dashboard elements
    const progressBar = document.getElementById('profileProgressBar');
    const completionText = document.getElementById('profileCompletion');
    
    if (progressBar) {
        progressBar.style.width = `${completion}%`;
        // Change color based on completion
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
    
    // Update missing fields message
    const missingFields = [];
    if (!requiredFields.professionalTitle) missingFields.push('Professional Title');
    if (!requiredFields.phone) missingFields.push('Phone Number');
    if (!requiredFields.location) missingFields.push('Location');
    if (!requiredFields.experienceLevel) missingFields.push('Experience Level');
    if (!requiredFields.bio) missingFields.push('Bio');
    if (!requiredFields.hourlyRate) missingFields.push('Hourly Rate');
    if (!requiredFields.skills) missingFields.push('Skills');
    
    const missingFieldsEl = document.querySelector('.profile-completion .text-gray-600');
    if (missingFieldsEl) {
        if (completion === 100) {
            missingFieldsEl.innerHTML = '<span class="font-medium text-green-600">Profile Complete!</span> You\'re ready to receive job offers.';
        } else {
            missingFieldsEl.innerHTML = `<span class="font-medium">Missing:</span> ${missingFields.join(', ')}`;
        }
    }
    
    return completion;
}

function initializeFreelancerComponents() {
    // Initialize job search
    const jobSearchInput = document.getElementById('jobSearch');
    if (jobSearchInput) {
        jobSearchInput.addEventListener('input', debounce(filterJobs, 300));
    }
    
    // Initialize application filter
    const applicationFilter = document.getElementById('applicationFilter');
    if (applicationFilter) {
        applicationFilter.addEventListener('change', filterApplications);
    }
    
    // Load initial applications data
    const session = JSON.parse(localStorage.getItem('userSession') || 'null');
    if (session) {
        filterApplications();
        updateApplicationStats(session.id);
    }
}

function filterJobs() {
    const searchTerm = document.getElementById('jobSearch').value.toLowerCase();
    const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
    
    const filteredJobs = jobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm) ||
        job.description.toLowerCase().includes(searchTerm) ||
        (job.skills && job.skills.toLowerCase().includes(searchTerm))
    );
    
    renderFilteredJobs(filteredJobs);
}

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

function renderFilteredJobs(jobs) {
    const container = document.getElementById('availableJobs');
    if (!container) return;
    
    if (jobs.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6"></path>
                </svg>
                <h3 class="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                <p class="text-gray-500">Try adjusting your search criteria.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = jobs.map(job => `
        <div class="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-lg font-semibold text-gray-800 mb-2">${job.title}</h3>
                    <p class="text-gray-600 mb-2">${job.clientName}</p>
                    <div class="flex items-center text-sm text-gray-500">
                        <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                        </svg>
                        ${job.location}
                    </div>
                </div>
                <span class="text-green-600 font-bold text-lg">$${job.salary}</span>
            </div>
            
            <p class="text-gray-600 mb-4">${job.description}</p>
            
            <div class="flex flex-wrap gap-2 mb-4">
                ${job.skills ? job.skills.split(',').map(skill => 
                    `<span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">${skill.trim()}</span>`
                ).join('') : ''}
            </div>
            
            <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">Posted ${new Date(job.createdAt).toLocaleDateString()}</span>
                <button onclick="applyToJob('${job.id}')" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
                    Apply Now
                </button>
            </div>
        </div>
    `).join('');
}

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
                    <button onclick="window.location.href='browse.html'" class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
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
                        <h3 class="text-lg font-semibold text-gray-800 mb-1">${job.title}</h3>
                        <p class="text-gray-600 mb-2">${job.clientName}</p>
                        <div class="flex items-center text-sm text-gray-500 mb-2">
                            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                            </svg>
                            ${job.location}
                            <span class="mx-2">•</span>
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
                
                <p class="text-gray-600 mb-4">${job.description}</p>
                
                ${job.skills ? `
                    <div class="flex flex-wrap gap-2 mb-4">
                        ${job.skills.split(',').map(skill => 
                            `<span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">${skill.trim()}</span>`
                        ).join('')}
                    </div>
                ` : ''}
                
                <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span class="text-green-600 font-bold text-lg">$${job.salary}</span>
                    <div class="flex items-center space-x-3">
                        <button onclick="viewJobDetails('${job.id}')" class="text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors">
                            View Details
                        </button>
                        ${app.status === 'pending' ? `
                            <button onclick="withdrawApplication('${app.id}')" class="text-red-500 hover:text-red-600 text-sm font-medium transition-colors">
                                Withdraw
                            </button>
                        ` : ''}
                        ${app.status === 'accepted' ? `
                            <button onclick="startProject('${app.id}')" class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors text-sm">
                                Start Project
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function calculateTotalEarnings(freelancerId) {
    // Mock calculation - in real app, this would come from completed projects
    const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]')
        .filter(app => app.freelancerId === freelancerId && app.status === 'accepted');
    
    return appliedJobs.length * 400000; // Mock RWF 400,000 per completed project
}

function getApplicationStatusColor(status) {
    switch(status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'reviewed': return 'bg-blue-100 text-blue-800';
        case 'accepted': return 'bg-green-100 text-green-800';
        case 'rejected': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

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
    // Create modal content using secure DOM methods
    const modalContent = document.createElement('div');
    modalContent.className = 'bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto';
    
    // Header
    const header = document.createElement('div');
    header.className = 'p-6 border-b border-gray-200';
    
    const headerFlex = document.createElement('div');
    headerFlex.className = 'flex justify-between items-start';
    
    const titleDiv = document.createElement('div');
    const title = document.createElement('h2');
    title.className = 'text-2xl font-bold text-gray-800 mb-2';
    title.textContent = job.title;
    
    const clientName = document.createElement('p');
    clientName.className = 'text-gray-600';
    clientName.textContent = job.clientName;
    
    titleDiv.appendChild(title);
    titleDiv.appendChild(clientName);
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'text-gray-400 hover:text-gray-600';
    closeBtn.onclick = () => modal.remove();
    closeBtn.innerHTML = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
    
    headerFlex.appendChild(titleDiv);
    headerFlex.appendChild(closeBtn);
    header.appendChild(headerFlex);
    
    // Body
    const body = document.createElement('div');
    body.className = 'p-6';
    
    // Job details section
    const detailsSection = document.createElement('div');
    detailsSection.className = 'grid md:grid-cols-2 gap-6 mb-6';
    
    const detailsDiv = document.createElement('div');
    const detailsTitle = document.createElement('h3');
    detailsTitle.className = 'font-semibold text-gray-800 mb-2';
    detailsTitle.textContent = 'Job Details';
    
    const detailsList = document.createElement('div');
    detailsList.className = 'space-y-2 text-sm';
    
    const locationP = document.createElement('p');
    locationP.innerHTML = '<span class="font-medium">Location:</span> ';
    locationP.appendChild(document.createTextNode(job.location || 'Not specified'));
    
    const budgetP = document.createElement('p');
    budgetP.innerHTML = '<span class="font-medium">Budget:</span> $';
    budgetP.appendChild(document.createTextNode(job.salary || '0'));
    
    const postedP = document.createElement('p');
    postedP.innerHTML = '<span class="font-medium">Posted:</span> ';
    postedP.appendChild(document.createTextNode(new Date(job.createdAt).toLocaleDateString()));
    
    detailsList.appendChild(locationP);
    detailsList.appendChild(budgetP);
    detailsList.appendChild(postedP);
    detailsDiv.appendChild(detailsTitle);
    detailsDiv.appendChild(detailsList);
    
    // Skills section
    const skillsDiv = document.createElement('div');
    const skillsTitle = document.createElement('h3');
    skillsTitle.className = 'font-semibold text-gray-800 mb-2';
    skillsTitle.textContent = 'Required Skills';
    
    const skillsContainer = document.createElement('div');
    skillsContainer.className = 'flex flex-wrap gap-2';
    
    if (job.skills) {
        job.skills.split(',').forEach(skill => {
            const skillSpan = document.createElement('span');
            skillSpan.className = 'px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded';
            skillSpan.textContent = skill.trim();
            skillsContainer.appendChild(skillSpan);
        });
    } else {
        const noSkills = document.createElement('span');
        noSkills.className = 'text-gray-500 text-sm';
        noSkills.textContent = 'No specific skills listed';
        skillsContainer.appendChild(noSkills);
    }
    
    skillsDiv.appendChild(skillsTitle);
    skillsDiv.appendChild(skillsContainer);
    
    detailsSection.appendChild(detailsDiv);
    detailsSection.appendChild(skillsDiv);
    
    // Description section
    const descSection = document.createElement('div');
    const descTitle = document.createElement('h3');
    descTitle.className = 'font-semibold text-gray-800 mb-2';
    descTitle.textContent = 'Description';
    
    const descText = document.createElement('p');
    descText.className = 'text-gray-600 leading-relaxed';
    descText.textContent = job.description || 'No description provided';
    
    descSection.appendChild(descTitle);
    descSection.appendChild(descText);
    
    body.appendChild(detailsSection);
    body.appendChild(descSection);
    
    modalContent.appendChild(header);
    modalContent.appendChild(body);
    modal.appendChild(modalContent);
    
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function startProject(applicationId) {
    showNotification('Project management feature coming soon!', 'info');
    // TODO: Implement project management functionality
}

function withdrawApplication(applicationId) {
    if (!confirm('Are you sure you want to withdraw this application?')) return;
    
    let appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
    appliedJobs = appliedJobs.filter(app => app.id !== applicationId);
    localStorage.setItem('appliedJobs', JSON.stringify(appliedJobs));
    
    showNotification('Application withdrawn successfully', 'success');
    filterApplications(); // Refresh the applications list
}

// Client Dashboard
function renderClientDashboard() {
    if (getCurrentPage() !== 'client-dashboard.html') return;
    
    const session = checkAuth();
    if (!session || session.role !== 'client') return;

    // Display user info
    const userNameEl = document.getElementById('userName');
    if (userNameEl) userNameEl.textContent = session.name;

    // Load client's posted jobs
    const jobs = JSON.parse(localStorage.getItem('jobs') || '[]')
        .filter(job => job.clientId === session.id);
    
    const jobsContainer = document.getElementById('postedJobs');
    if (jobsContainer) {
        jobsContainer.innerHTML = jobs.map(job => `
            <div class="bg-white p-6 rounded-lg shadow-md">
                <h3 class="text-lg font-semibold mb-2">${job.title}</h3>
                <p class="text-gray-600 mb-3">${job.description}</p>
                <div class="flex justify-between items-center">
                    <span class="text-green-600 font-bold">$${job.salary}</span>
                    <span class="text-sm text-gray-500">Posted: ${new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        `).join('');
    }

    // Load freelancers for browsing
    const freelancers = JSON.parse(localStorage.getItem('users') || '[]')
        .filter(user => user.role === 'freelancer');
    
    const freelancersContainer = document.getElementById('availableFreelancers');
    if (freelancersContainer) {
        freelancersContainer.innerHTML = freelancers.map(freelancer => `
            <div class="bg-white p-4 rounded-lg shadow-md">
                <h4 class="font-semibold">${freelancer.fullName}</h4>
                <p class="text-sm text-gray-600">${freelancer.email}</p>
                <button class="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                    View Profile
                </button>
            </div>
        `).join('');
    }
}

// Admin Dashboard
function renderAdminDashboard() {
    if (getCurrentPage() !== 'admin-dashboard.html') return;
    
    const session = checkAuth();
    if (!session || session.role !== 'admin') {
        // Redirect non-admin users
        window.location.href = 'login.html';
        return;
    }

    // Initialize admin dashboard
    initializeAdminDashboard();
}

function initializeAdminDashboard() {
    // Load dashboard statistics
    updateAdminStats();
    
    // Load recent activity
    loadRecentActivity();
    
    // Initialize filters
    initializeAdminFilters();
}

function updateAdminStats() {
    // Use the new dashboard stats system if available
    if (window.updateDashboardStats) {
        window.updateDashboardStats();
    } else {
        // Fallback to basic stats update with proper zero handling
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        const applications = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
        
        // Update stats counters with zero fallback
        const totalUsersEl = document.getElementById('totalUsers');
        const activeJobsEl = document.getElementById('activeJobs');
        const pendingVerificationsEl = document.getElementById('pendingVerifications');
        
        if (totalUsersEl) totalUsersEl.textContent = users.length || 0;
        if (activeJobsEl) activeJobsEl.textContent = jobs.filter(j => j.status === 'active').length || 0;

    }
}

function loadRecentActivity() {
    const activityContainer = document.getElementById('recentActivity');
    if (!activityContainer) return;
    
    // Mock recent activity data
    const activities = [
        { type: 'user', message: 'New user registered: John Doe', time: '2 minutes ago', color: 'blue' },
        { type: 'job', message: 'Job posted approved: Web Developer', time: '15 minutes ago', color: 'green' },

        { type: 'payment', message: 'Payment processed: $500', time: '2 hours ago', color: 'purple' },
        { type: 'user', message: 'User profile updated: Jane Doe', time: '3 hours ago', color: 'blue' }
    ];
    
    activityContainer.innerHTML = activities.map(activity => `
        <div class="flex items-start space-x-3">
            <div class="w-2 h-2 bg-${activity.color}-500 rounded-full mt-2"></div>
            <div>
                <p class="text-sm text-gray-900">${activity.message}</p>
                <p class="text-xs text-gray-500">${activity.time}</p>
            </div>
        </div>
    `).join('');
}

function initializeAdminFilters() {
    // User role filter
    const userRoleFilter = document.getElementById('userRoleFilter');
    if (userRoleFilter) {
        userRoleFilter.addEventListener('change', filterUsers);
    }
    
    // Job status filter
    const jobStatusFilter = document.getElementById('jobStatusFilter');
    if (jobStatusFilter) {
        jobStatusFilter.addEventListener('change', filterJobs);
    }
}

function filterUsers() {
    const filterValue = document.getElementById('userRoleFilter').value;
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    let filteredUsers = users;
    if (filterValue) {
        filteredUsers = users.filter(user => user.role === filterValue);
    }
    
    renderUsersTable(filteredUsers);
}

function filterJobs() {
    const filterValue = document.getElementById('jobStatusFilter').value;
    const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
    
    let filteredJobs = jobs;
    if (filterValue) {
        filteredJobs = jobs.filter(job => job.status === filterValue);
    }
    
    renderJobsTable(filteredJobs);
}

function renderUsersTable(users) {
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

function renderJobsTable(jobs) {
    const tbody = document.getElementById('jobsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = jobs.map(job => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4">
                <div class="font-medium text-gray-900">${job.title}</div>
                <div class="text-sm text-gray-500">${job.description.substring(0, 50)}...</div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-900">${job.clientName}</td>
            <td class="px-6 py-4 text-sm font-medium text-green-600">$${job.salary}</td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 text-xs rounded-full ${getJobStatusColor(job.status)}">${job.status}</span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">
                ${new Date(job.createdAt).toLocaleDateString()}
            </td>
            <td class="px-6 py-4">
                <div class="flex space-x-2">
                    <button class="text-blue-600 hover:text-blue-800" onclick="editJob('${job.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-800" onclick="deleteJob('${job.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
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
        'pending': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
}

// Admin action functions
function editUser(userId) {
    showNotification('Edit user functionality would be implemented here', 'info');
    // TODO: Implement user editing modal
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        let users = JSON.parse(localStorage.getItem('users') || '[]');
        users = users.filter(u => u.id !== userId);
        localStorage.setItem('users', JSON.stringify(users));
        filterUsers(); // Refresh the table
        updateAdminStats();
        showNotification('User deleted successfully', 'success');
    }
}

function editJob(jobId) {
    showNotification('Edit job functionality would be implemented here', 'info');
    // TODO: Implement job editing modal
}

function deleteJob(jobId) {
    if (confirm('Are you sure you want to delete this job?')) {
        let jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        jobs = jobs.filter(j => j.id !== jobId);
        localStorage.setItem('jobs', JSON.stringify(jobs));
        filterJobs(); // Refresh the table
        updateAdminStats();
        showNotification('Job deleted successfully', 'success');
    }
}

function approveUser(userId) {
    if (confirm('Approve this user verification?')) {
        let users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            users[userIndex].verified = true;
            localStorage.setItem('users', JSON.stringify(users));
            loadVerificationsData();
            updateAdminStats();
            showNotification('User verification approved', 'success');
        }
    }
}

function rejectUser(userId) {
    if (confirm('Reject this user verification?')) {
        showNotification('User verification rejected', 'warning');
        // TODO: Implement rejection with reason
    }
}

// ==================== PROFILE FUNCTIONS ====================

function handleProfile() {
    if (getCurrentPage() !== 'profile.html') return;
    
    const session = checkAuth();
    if (!session) return;

    // Load user data into form
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === session.id);
    
    if (user) {
        const form = document.getElementById('profileForm');
        if (form) {
            form.fullName.value = user.fullName;
            form.email.value = user.email;
            form.phone.value = user.phone;
            form.role.value = user.role;
        }
    }

    // Handle profile update
    const form = document.getElementById('profileForm');
    if (form) {
        // Add CSRF protection to profile form
        addCSRFTokenToForm(form);
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // CSRF Protection: Validate form token
            if (!validateCSRFToken(form)) {
                showAlert('Security validation failed. Please refresh and try again.', 'error');
                return;
            }
            
            const formData = new FormData(form);
            const updatedData = {
                fullName: formData.get('fullName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                role: formData.get('role')
            };

            // Update user in localStorage
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = users.findIndex(u => u.id === session.id);
            
            if (userIndex !== -1) {
                users[userIndex] = { ...users[userIndex], ...updatedData };
                localStorage.setItem('users', JSON.stringify(users));
                
                // Update session
                const updatedSession = { ...session, ...updatedData };
                localStorage.setItem('userSession', JSON.stringify(updatedSession));
            }

            // TODO: Replace with API call
            // fetch('/api/profile', {
            //     method: 'PUT',
            //     headers: { 
            //         'Content-Type': 'application/json',
            //         'X-CSRF-Token': getCSRFToken()
            //     },
            //     body: JSON.stringify(updatedData)
            // })

            showAlert('Profile updated successfully!');
        });
    }
}

// ==================== JOB FUNCTIONS ====================

function handlePostJob() {
    if (getCurrentPage() !== 'post-job.html') return;
    
    const session = checkAuth();
    if (!session || session.role !== 'client') return;

    const form = document.getElementById('postJobForm');
    if (!form) return;

    // Add CSRF protection to job posting form
    addCSRFTokenToForm(form);

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // CSRF Protection: Validate form token
        if (!validateCSRFToken(form)) {
            showAlert('Security validation failed. Please refresh and try again.', 'error');
            return;
        }
        
        const formData = new FormData(form);
        const jobData = {
            id: generateId(),
            title: formData.get('title'),
            description: formData.get('description'),
            skills: formData.get('skills'),
            location: formData.get('location'),
            salary: formData.get('salary'),
            clientId: session.id,
            clientName: session.name,
            createdAt: new Date().toISOString(),
            status: 'active'
        };

        // Save job to localStorage
        const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        jobs.push(jobData);
        localStorage.setItem('jobs', JSON.stringify(jobs));

        // TODO: Replace with API call
        // fetch('/api/jobs', {
        //     method: 'POST',
        //     headers: { 
        //         'Content-Type': 'application/json',
        //         'X-CSRF-Token': getCSRFToken()
        //     },
        //     body: JSON.stringify(jobData)
        // })

        showAlert('Job posted successfully!');
        setTimeout(() => {
            window.location.href = 'client-dashboard.html';
        }, 1000);
    });
}

function applyToJob(jobId) {
    try {
        if (!jobId || typeof jobId !== 'string') {
            showNotification('Invalid job ID', 'error');
            return;
        }
        
        const session = checkAuth();
        if (!session || session.role !== 'freelancer') {
            showNotification('Please login as a freelancer to apply for jobs', 'error');
            return;
        }

        const applicationCheck = typeof canFreelancerApply === 'function' 
            ? canFreelancerApply(session.id) 
            : { canApply: true };
            
        if (!applicationCheck.canApply) {
            showNotification(`You can only apply to ${applicationCheck.maxAllowed} jobs at a time. You currently have ${applicationCheck.activeCount} active applications.`, 'error');
            return;
        }

        const jobsData = localStorage.getItem('jobs');
        const jobs = jobsData ? JSON.parse(jobsData) : [];
        const job = jobs.find(j => j.id === jobId);
        
        if (!job) {
            showNotification('Job not found', 'error');
            return;
        }

        if (job.status !== 'active') {
            showNotification('This job is not available for applications', 'error');
            return;
        }

        const application = {
            id: generateId(),
            jobId: jobId,
            freelancerId: session.id,
            freelancerName: session.name || session.fullName || 'Unknown',
            status: 'pending',
            appliedAt: new Date().toISOString(),
            jobTitle: job.title || 'Untitled Job',
            clientName: job.clientName || 'Unknown Client',
            clientId: job.clientId
        };

        const appliedJobsData = localStorage.getItem('appliedJobs');
        const appliedJobs = appliedJobsData ? JSON.parse(appliedJobsData) : [];
        
        if (appliedJobs.find(app => app.jobId === jobId && app.freelancerId === session.id)) {
            showNotification('You have already applied to this job!', 'warning');
            return;
        }

        appliedJobs.push(application);
        localStorage.setItem('appliedJobs', JSON.stringify(appliedJobs));

        showNotification(`Successfully applied to ${job.title}!`, 'success');
        
        setTimeout(() => {
            try {
                if (getCurrentPage() === 'freelancer-dashboard.html') {
                    if (typeof updateFreelancerStats === 'function') {
                        updateFreelancerStats(session);
                    }
                    if (typeof loadRecentApplications === 'function') {
                        loadRecentApplications();
                    }
                }
                
                const jobsSection = document.getElementById('jobs-section');
                if (jobsSection && !jobsSection.classList.contains('hidden')) {
                    if (typeof loadAvailableJobs === 'function') {
                        loadAvailableJobs();
                    }
                }
                
                if (getCurrentPage() === 'browse.html') {
                    if (typeof loadJobs === 'function') {
                        loadJobs();
                    } else if (typeof applyFilters === 'function') {
                        applyFilters();
                    }
                }
                
                if (typeof loadJobsForFreelancers === 'function') {
                    loadJobsForFreelancers();
                }
            } catch (updateError) {
                console.error('Error updating UI after job application:', updateError);
            }
        }, 500);
        
    } catch (error) {
        console.error('Error applying to job:', error);
        showNotification('Failed to apply to job. Please try again.', 'error');
    }
}

// ==================== BROWSE TALENT FUNCTIONS ====================

function handleBrowseTalent() {
    if (getCurrentPage() !== 'browse.html') return;
    
    const session = checkAuth();
    if (!session) return;
    
    // Show jobs for freelancers, talent for clients
    if (session.role === 'freelancer') {
        if (typeof loadJobsForFreelancer === 'function') {
            loadJobsForFreelancer(session);
        } else {
            loadAvailableJobs();
        }
        return;
    }

    // Load freelancers for clients
    let allFreelancers = JSON.parse(localStorage.getItem('users') || '[]')
        .filter(user => user.role === 'freelancer');
    
    let currentPage = 1;
    const itemsPerPage = 9;
    let filteredFreelancers = [...allFreelancers];
    
    // Check for search query from home page
    const searchQuery = localStorage.getItem('searchQuery');
    if (searchQuery) {
        document.getElementById('searchTalent').value = searchQuery;
        localStorage.removeItem('searchQuery');
    }
    
    function applyFilters() {
        const searchTerm = document.getElementById('searchTalent').value.toLowerCase();
        const skillFilter = document.getElementById('skillFilter').value.toLowerCase();
        const locationFilter = document.getElementById('locationFilter').value.toLowerCase();
        
        filteredFreelancers = allFreelancers.filter(freelancer => {
            const matchesSearch = !searchTerm || 
                freelancer.fullName.toLowerCase().includes(searchTerm) ||
                (freelancer.skills && freelancer.skills.toLowerCase().includes(searchTerm)) ||
                (freelancer.location && freelancer.location.toLowerCase().includes(searchTerm));
            
            const matchesSkill = !skillFilter || 
                (freelancer.skills && freelancer.skills.toLowerCase().includes(skillFilter));
            
            const matchesLocation = !locationFilter || 
                (freelancer.location && freelancer.location.toLowerCase().includes(locationFilter));
            
            return matchesSearch && matchesSkill && matchesLocation;
        });
        
        currentPage = 1;
        renderFreelancers();
        updateResultsCount();
    }
    
    function renderFreelancers() {
        const container = document.getElementById('freelancersContainer');
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (!container) return;
        
        const startIndex = 0;
        const endIndex = currentPage * itemsPerPage;
        let freelancersToShow = filteredFreelancers.slice(startIndex, endIndex);
        
        // Apply sorting
        if (typeof currentSort !== 'undefined') {
            freelancersToShow = sortFreelancers(freelancersToShow, currentSort);
        }
        
        if (freelancersToShow.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">No freelancers found</h3>
                    <p class="text-gray-500">Try adjusting your search criteria or filters.</p>
                </div>
            `;
            loadMoreBtn.classList.add('hidden');
            return;
        }
        
        const cardClass = (typeof currentView !== 'undefined' && currentView === 'list') 
            ? 'bg-white p-6 rounded-lg shadow-sm hover-lift card mb-4' 
            : 'bg-white p-6 rounded-lg shadow-sm hover-lift card talent-card';
        
        container.innerHTML = freelancersToShow.map(freelancer => `
            <div class="${cardClass}">
                <div class="flex items-center mb-4">
                    ${freelancer.profilePhoto ? 
                        `<img src="${freelancer.profilePhoto}" class="w-12 h-12 rounded-full object-cover border-2 border-gray-200">` :
                        `<div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            ${freelancer.fullName.charAt(0).toUpperCase()}
                        </div>`
                    }
                    <div class="ml-3">
                        <h3 class="text-lg font-semibold text-gray-900">${freelancer.fullName}</h3>
                        <p class="text-sm text-gray-500">${freelancer.professionalTitle || 'Professional'}</p>
                        <p class="text-sm text-gray-500">
                            <i class="fas fa-map-marker-alt mr-1"></i>${freelancer.location || 'Location not specified'}
                        </p>
                    </div>
                </div>
                
                <div class="mb-4">
                    <div class="flex flex-wrap gap-2 mb-3">
                        ${freelancer.skills ? freelancer.skills.split(',').slice(0, 3).map(skill => 
                            `<span class="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">${skill.trim()}</span>`
                        ).join('') : '<span class="text-gray-500 text-sm">No skills listed</span>'}
                        ${freelancer.skills && freelancer.skills.split(',').length > 3 ? 
                            `<span class="text-xs text-gray-500">+${freelancer.skills.split(',').length - 3} more</span>` : ''}
                    </div>
                    <div class="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <p><span class="font-medium">Rate:</span> ${freelancer.hourlyRate ? 'RWF ' + parseInt(freelancer.hourlyRate).toLocaleString() + '/hr' : 'Not set'}</p>
                        <p><span class="font-medium">Experience:</span> ${freelancer.experienceLevel || 'Not specified'}</p>
                    </div>
                    ${freelancer.bio ? `<p class="text-sm text-gray-600 mt-2 line-clamp-2">${freelancer.bio.substring(0, 100)}${freelancer.bio.length > 100 ? '...' : ''}</p>` : ''}
                </div>
                
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <div class="flex text-yellow-400">
                            ${Array(5).fill().map((_, i) => `
                                <i class="fas fa-star ${i < 4 ? 'text-yellow-400' : 'text-gray-300'} text-sm"></i>
                            `).join('')}
                        </div>
                        <span class="text-sm text-gray-500">(4.0)</span>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="showProfileModal('${freelancer.id}')" class="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 transition-colors text-sm">
                            <i class="fas fa-eye mr-1"></i>View
                        </button>
                        <button onclick="contactFreelancer('${freelancer.id}')" class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors text-sm">
                            <i class="fas fa-message mr-1"></i>Contact
                        </button>
                    </div>
                </div>
                
                <div class="mt-3 pt-3 border-t border-gray-100">
                    <p class="text-xs text-gray-500">Member since ${new Date(freelancer.createdAt).toLocaleDateString()}</p>
                </div>
            </div>
        `).join('');
        
        // Show/hide load more button
        if (endIndex < filteredFreelancers.length) {
            loadMoreBtn.classList.remove('hidden');
        } else {
            loadMoreBtn.classList.add('hidden');
        }
    }
    
    function sortFreelancers(freelancers, sortBy) {
        switch(sortBy) {
            case 'newest':
                return freelancers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            case 'rating':
                return freelancers.sort((a, b) => 4.0 - 4.0); // Mock rating sort
            case 'experience':
                return freelancers.sort((a, b) => {
                    const expOrder = { 'Senior Level': 3, 'Mid Level': 2, 'Entry Level': 1 };
                    return (expOrder[b.experienceLevel] || 0) - (expOrder[a.experienceLevel] || 0);
                });
            case 'name':
                return freelancers.sort((a, b) => a.fullName.localeCompare(b.fullName));
            default:
                return freelancers;
        }
    }
    
    function updateResultsCount() {
        const resultsCount = document.getElementById('resultsCount');
        if (resultsCount) {
            const total = filteredFreelancers.length;
            const showing = Math.min(currentPage * itemsPerPage, total);
            resultsCount.textContent = `Showing ${showing} of ${total} freelancers`;
        }
    }
    
    // Event listeners
    const searchInput = document.getElementById('searchTalent');
    const skillFilter = document.getElementById('skillFilter');
    const locationFilter = document.getElementById('locationFilter');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(applyFilters, 300));
    }
    
    if (skillFilter) {
        skillFilter.addEventListener('change', applyFilters);
    }
    
    if (locationFilter) {
        locationFilter.addEventListener('change', applyFilters);
    }
    
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            currentPage++;
            renderFreelancers();
            updateResultsCount();
        });
    }
    
    // Initial render
    applyFilters();
    
    // Add sort functionality if not already defined
    if (typeof currentSort === 'undefined') {
        window.currentSort = 'newest';
    }
}

// Debounce function for search input
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

// View freelancer profile
function viewFreelancerProfile(freelancerId) {
    const freelancers = JSON.parse(localStorage.getItem('users') || '[]');
    const freelancer = freelancers.find(f => f.id === freelancerId && f.role === 'freelancer');
    
    if (!freelancer) {
        showNotification('Freelancer not found', 'error');
        return;
    }
    
    // If we have a showProfileModal function available (on browse page), use it
    if (typeof showProfileModal === 'function') {
        showProfileModal(freelancerId);
    } else {
        // Otherwise, show basic info
        showNotification(`Contact ${freelancer.fullName} at ${freelancer.email}`, 'info', 5000);
    }
}

// Contact freelancer
function contactFreelancer(freelancerId) {
    const session = JSON.parse(localStorage.getItem('userSession') || 'null');
    if (!session) {
        showNotification('Please login to contact freelancers', 'error');
        return;
    }

    const freelancers = JSON.parse(localStorage.getItem('users') || '[]');
    const freelancer = freelancers.find(f => f.id === freelancerId);
    
    if (freelancer) {
        // Create or find existing conversation
        let conversations = JSON.parse(localStorage.getItem('conversations') || '[]');
        let conversation = conversations.find(conv => 
            conv.clientId === session.id && conv.freelancerId === freelancerId
        );
        
        if (!conversation) {
            // Create new conversation
            conversation = {
                id: 'conv' + Date.now(),
                clientId: session.id,
                freelancerId: freelancerId,
                freelancerName: freelancer.fullName,
                clientName: session.fullName || session.name,
                lastMessage: 'Conversation started',
                lastMessageTime: new Date().toISOString(),
                unreadCount: 0,
                status: 'active',
                messages: []
            };
            
            conversations.push(conversation);
            localStorage.setItem('conversations', JSON.stringify(conversations));
        }
        
        // Redirect to messages with conversation ID
        const messagesUrl = session.role === 'client' ? 'client-messages.html' : 'freelancer-messages.html';
        window.location.href = `${messagesUrl}?conv=${conversation.id}`;
    }
}

// Show freelancer profile modal
function showProfileModal(freelancerId) {
    const freelancers = JSON.parse(localStorage.getItem('users') || '[]');
    const freelancer = freelancers.find(f => f.id === freelancerId && f.role === 'freelancer');
    
    if (!freelancer) {
        showNotification('Freelancer not found', 'error');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    // Create modal content using secure DOM methods
    const modalContent = document.createElement('div');
    modalContent.className = 'bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto';
    
    // Header section
    const header = document.createElement('div');
    header.className = 'p-6 border-b border-gray-200';
    
    const headerFlex = document.createElement('div');
    headerFlex.className = 'flex justify-between items-start';
    
    const profileSection = document.createElement('div');
    profileSection.className = 'flex items-center space-x-4';
    
    // Profile image or initial
    if (freelancer.profilePhoto) {
        const img = document.createElement('img');
        img.src = freelancer.profilePhoto;
        img.className = 'w-16 h-16 rounded-full object-cover border-2 border-gray-200';
        profileSection.appendChild(img);
    } else {
        const initialDiv = document.createElement('div');
        initialDiv.className = 'w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center';
        const initialSpan = document.createElement('span');
        initialSpan.className = 'text-white font-bold text-xl';
        initialSpan.textContent = freelancer.fullName.charAt(0).toUpperCase();
        initialDiv.appendChild(initialSpan);
        profileSection.appendChild(initialDiv);
    }
    
    // Profile info
    const profileInfo = document.createElement('div');
    const nameH2 = document.createElement('h2');
    nameH2.className = 'text-2xl font-bold text-gray-800';
    nameH2.textContent = freelancer.fullName;
    
    const titleP = document.createElement('p');
    titleP.className = 'text-gray-600';
    titleP.textContent = freelancer.professionalTitle || 'Professional';
    
    const locationP = document.createElement('p');
    locationP.className = 'text-gray-500';
    locationP.innerHTML = '<i class="fas fa-map-marker-alt mr-1"></i>';
    locationP.appendChild(document.createTextNode(freelancer.location || 'Location not specified'));
    
    profileInfo.appendChild(nameH2);
    profileInfo.appendChild(titleP);
    profileInfo.appendChild(locationP);
    profileSection.appendChild(profileInfo);
    
    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'text-gray-400 hover:text-gray-600';
    closeBtn.onclick = () => modal.remove();
    closeBtn.innerHTML = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
    
    headerFlex.appendChild(profileSection);
    headerFlex.appendChild(closeBtn);
    header.appendChild(headerFlex);
    
    // Body section
    const body = document.createElement('div');
    body.className = 'p-6';
    
    const grid = document.createElement('div');
    grid.className = 'grid md:grid-cols-2 gap-6 mb-6';
    
    // Professional details
    const detailsDiv = document.createElement('div');
    const detailsH3 = document.createElement('h3');
    detailsH3.className = 'font-semibold text-gray-800 mb-3';
    detailsH3.textContent = 'Professional Details';
    
    const detailsContainer = document.createElement('div');
    detailsContainer.className = 'space-y-2 text-sm';
    
    const details = [
        ['Experience:', freelancer.experienceLevel || 'Not specified'],
        ['Rate:', freelancer.hourlyRate ? 'RWF ' + parseInt(freelancer.hourlyRate).toLocaleString() + '/hour' : 'Not set'],
        ['Availability:', (freelancer.hoursPerWeek || 'Not specified') + ' hours/week'],
        ['Response Time:', freelancer.responseTime || 'Not specified']
    ];
    
    details.forEach(([label, value]) => {
        const p = document.createElement('p');
        const span = document.createElement('span');
        span.className = 'font-medium';
        span.textContent = label;
        p.appendChild(span);
        p.appendChild(document.createTextNode(' ' + value));
        detailsContainer.appendChild(p);
    });
    
    detailsDiv.appendChild(detailsH3);
    detailsDiv.appendChild(detailsContainer);
    
    // Skills section
    const skillsDiv = document.createElement('div');
    const skillsH3 = document.createElement('h3');
    skillsH3.className = 'font-semibold text-gray-800 mb-3';
    skillsH3.textContent = 'Skills';
    
    const skillsContainer = document.createElement('div');
    skillsContainer.className = 'flex flex-wrap gap-2';
    
    if (freelancer.skills) {
        freelancer.skills.split(',').forEach(skill => {
            const span = document.createElement('span');
            span.className = 'px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full';
            span.textContent = skill.trim();
            skillsContainer.appendChild(span);
        });
    } else {
        const span = document.createElement('span');
        span.className = 'text-gray-500 text-sm';
        span.textContent = 'No skills listed';
        skillsContainer.appendChild(span);
    }
    
    skillsDiv.appendChild(skillsH3);
    skillsDiv.appendChild(skillsContainer);
    
    grid.appendChild(detailsDiv);
    grid.appendChild(skillsDiv);
    body.appendChild(grid);
    
    // Bio section
    if (freelancer.bio) {
        const bioDiv = document.createElement('div');
        bioDiv.className = 'mb-6';
        const bioH3 = document.createElement('h3');
        bioH3.className = 'font-semibold text-gray-800 mb-3';
        bioH3.textContent = 'About';
        const bioP = document.createElement('p');
        bioP.className = 'text-gray-600 leading-relaxed';
        bioP.textContent = freelancer.bio;
        bioDiv.appendChild(bioH3);
        bioDiv.appendChild(bioP);
        body.appendChild(bioDiv);
    }
    
    // Buttons section
    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'flex justify-end space-x-3';
    
    const contactBtn = document.createElement('button');
    contactBtn.className = 'bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors';
    contactBtn.onclick = () => contactFreelancer(freelancer.id);
    contactBtn.innerHTML = '<i class="fas fa-message mr-2"></i>Contact';
    
    const closeBtn2 = document.createElement('button');
    closeBtn2.className = 'bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors';
    closeBtn2.onclick = () => modal.remove();
    closeBtn2.textContent = 'Close';
    
    buttonsDiv.appendChild(contactBtn);
    buttonsDiv.appendChild(closeBtn2);
    body.appendChild(buttonsDiv);
    
    modalContent.appendChild(header);
    modalContent.appendChild(body);
    modal.appendChild(modalContent);
    
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// ==================== MAP FUNCTIONS ====================

// Role-based map initialization (legacy support)
function initializeMapWithRoleAccess() {
    console.log('Map initialization handled by map.html');
}



// ==================== INITIALIZATION ====================

// Initialize minimal data if not exists with error handling
function initializeMinimalData() {
    try {
        // Only create default users if no users exist
        if (!localStorage.getItem('users')) {
            const defaultUsers = [
                {
                    id: 'admin_default',
                    fullName: 'System Administrator',
                    email: 'admin@skillsconnect.rw',
                    phone: '+250788000000',
                    role: 'admin',
                    password: 'admin123',
                    verified: true,
                    emailVerified: true,
                    createdAt: new Date().toISOString(),
                    isDefault: true
                }
            ];
            localStorage.setItem('users', JSON.stringify(defaultUsers));
        }

        // Initialize empty arrays for other data
        const dataKeys = ['jobs', 'appliedJobs', 'conversations'];
        dataKeys.forEach(key => {
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify([]));
            }
        });

        if (!localStorage.getItem('settings')) {
            localStorage.setItem('settings', JSON.stringify({
                jobApprovalRequired: true,
                emailNotifications: true,
                theme: 'light'
            }));
        }
    } catch (error) {
        console.error('Error initializing data:', error);
    }
}

// ==================== HOME PAGE FUNCTIONS ====================

// Handle home page functionality
function handleHomePage() {
    if (getCurrentPage() !== 'index.html' && getCurrentPage() !== '') return;
    
    // Don't automatically redirect logged-in users from home page
    // Let them stay on the home page if they want to
    
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
            mobileMenu.classList.toggle('mobile-menu');
            mobileMenu.classList.toggle('show');
        });
    }
    
    // Hero search functionality
    const heroSearch = document.getElementById('heroSearch');
    const heroSearchBtn = document.getElementById('heroSearchBtn');
    
    if (heroSearch && heroSearchBtn) {
        function performSearch() {
            const query = heroSearch.value.trim();
            if (query) {
                // Store search query and redirect to browse page
                localStorage.setItem('searchQuery', query);
                window.location.href = 'browse.html';
            }
        }
        
        heroSearchBtn.addEventListener('click', performSearch);
        heroSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    // Animate stats counters
    animateCounters();
    
    // Add scroll animations
    addScrollAnimations();
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Animate counter numbers
function animateCounters() {
    const counters = [
        { id: 'statsFreelancers', target: 500, suffix: '+' },
        { id: 'statsJobs', target: 200, suffix: '+' },
        { id: 'statsClients', target: 150, suffix: '+' },
        { id: 'statsProjects', target: 300, suffix: '+' }
    ];
    
    counters.forEach(counter => {
        const element = document.getElementById(counter.id);
        if (!element) return;
        
        let current = 0;
        const increment = counter.target / 100;
        const timer = setInterval(() => {
            current += increment;
            if (current >= counter.target) {
                current = counter.target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current) + counter.suffix;
        }, 20);
    });
}

// Add scroll-triggered animations
function addScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements with fade-in class
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
}

// ==================== ENHANCED SEARCH FUNCTIONS ====================

// Enhanced search with filters
function enhancedSearch(query, filters = {}) {
    const freelancers = JSON.parse(localStorage.getItem('users') || '[]')
        .filter(user => user.role === 'freelancer');
    
    const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
    
    let results = {
        freelancers: [],
        jobs: []
    };
    
    if (query) {
        const searchTerm = query.toLowerCase();
        
        // Search freelancers
        results.freelancers = freelancers.filter(freelancer => 
            freelancer.fullName.toLowerCase().includes(searchTerm) ||
            (freelancer.skills && freelancer.skills.toLowerCase().includes(searchTerm)) ||
            (freelancer.location && freelancer.location.toLowerCase().includes(searchTerm))
        );
        
        // Search jobs
        results.jobs = jobs.filter(job => 
            job.title.toLowerCase().includes(searchTerm) ||
            job.description.toLowerCase().includes(searchTerm) ||
            (job.skills && job.skills.toLowerCase().includes(searchTerm)) ||
            (job.location && job.location.toLowerCase().includes(searchTerm))
        );
    } else {
        results.freelancers = freelancers;
        results.jobs = jobs;
    }
    
    // Apply filters
    if (filters.location) {
        results.freelancers = results.freelancers.filter(f => 
            f.location && f.location.toLowerCase().includes(filters.location.toLowerCase())
        );
        results.jobs = results.jobs.filter(j => 
            j.location && j.location.toLowerCase().includes(filters.location.toLowerCase())
        );
    }
    
    if (filters.skills) {
        results.freelancers = results.freelancers.filter(f => 
            f.skills && f.skills.toLowerCase().includes(filters.skills.toLowerCase())
        );
        results.jobs = results.jobs.filter(j => 
            j.skills && j.skills.toLowerCase().includes(filters.skills.toLowerCase())
        );
    }
    
    return results;
}

// ==================== NOTIFICATION SYSTEM ====================

// Enhanced notification system
function showNotification(message, type = 'success', duration = 3000) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
    
    // Set notification style based on type
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
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Auto remove
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, duration);
}

// Replace the old showAlert function
function showAlert(message, type = 'success') {
    showNotification(message, type);
}

// ==================== LOADING STATES ====================

// Show loading state
function showLoading(element, text = 'Loading...') {
    if (typeof element === 'string') {
        element = document.getElementById(element);
    }
    if (!element) return;
    
    element.innerHTML = `
        <div class="flex items-center justify-center space-x-2">
            <div class="loading"></div>
            <span>${text}</span>
        </div>
    `;
}

// Hide loading state
function hideLoading(element, originalContent = '') {
    if (typeof element === 'string') {
        element = document.getElementById(element);
    }
    if (!element) return;
    
    element.innerHTML = originalContent;
}

// ==================== FORM VALIDATION ====================

// Enhanced form validation
function validateForm(formId, rules) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    let isValid = true;
    const errors = [];
    
    Object.keys(rules).forEach(fieldName => {
        const field = form.querySelector(`[name="${fieldName}"]`);
        const rule = rules[fieldName];
        
        if (!field) return;
        
        // Remove previous error styling
        field.classList.remove('border-red-500');
        
        // Required validation
        if (rule.required && !field.value.trim()) {
            isValid = false;
            errors.push(`${rule.label || fieldName} is required`);
            field.classList.add('border-red-500');
            return;
        }
        
        // Email validation
        if (rule.email && field.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                isValid = false;
                errors.push(`${rule.label || fieldName} must be a valid email`);
                field.classList.add('border-red-500');
            }
        }
        
        // Phone validation
        if (rule.phone && field.value) {
            const phoneRegex = /^\+?[1-9]\d{1,14}$/;
            if (!phoneRegex.test(field.value.replace(/\s/g, ''))) {
                isValid = false;
                errors.push(`${rule.label || fieldName} must be a valid phone number`);
                field.classList.add('border-red-500');
            }
        }
        
        // Min length validation
        if (rule.minLength && field.value.length < rule.minLength) {
            isValid = false;
            errors.push(`${rule.label || fieldName} must be at least ${rule.minLength} characters`);
            field.classList.add('border-red-500');
        }
    });
    
    if (!isValid) {
        showNotification(errors[0], 'error');
    }
    
    return isValid;
}

// Enhanced main initialization function with role-based access control
document.addEventListener('DOMContentLoaded', function() {
    try {
        initializeMinimalData();
        initializeChatSystem();
        
        const session = checkAuth();
        
        // Initialize page-specific functionality
        const pageHandlers = [
            handleHomePage,
            handleRegistration, 
            handleLogin,
            handleLogout,
            handleProfile,
            handlePostJob,
            handleBrowseTalent
        ];
        
        pageHandlers.forEach(handler => {
            try {
                if (typeof handler === 'function') {
                    handler();
                }
            } catch (handlerError) {
                console.error('Error in page handler:', handlerError);
            }
        });

        // Initialize dashboards based on user role
        if (session && session.role) {
            const dashboardHandlers = {
                'freelancer': renderFreelancerDashboard,
                'client': renderClientDashboard,
                'admin': renderAdminDashboard
            };
            
            const handler = dashboardHandlers[session.role];
            if (typeof handler === 'function') {
                handler();
            }
        }

        // Initialize admin dashboard if on admin page
        if (getCurrentPage() === 'admin-dashboard.html') {
            setTimeout(() => {
                const adminFunctions = ['loadDashboardData', 'loadUsersData', 'loadJobsData'];
                adminFunctions.forEach(funcName => {
                    if (typeof window[funcName] === 'function') {
                        try {
                            window[funcName]();
                        } catch (error) {
                            console.error(`Error calling ${funcName}:`, error);
                        }
                    }
                });
            }, 100);
        }

        // Initialize page-specific enhancements
        if (getCurrentPage() === 'client-dashboard.html') {
            initializeClientDashboard();
        }

        // Initialize map with role-based content
        if (getCurrentPage() === 'map.html' && typeof L !== 'undefined') {
            initializeMapWithRoleAccess();
        }

        // Add global event listeners
        document.addEventListener('click', function(e) {
            try {
                const mobileMenu = document.getElementById('mobileMenu');
                const mobileMenuBtn = document.getElementById('mobileMenuBtn');

                if (mobileMenu && mobileMenuBtn && !mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                    mobileMenu.classList.add('hidden');
                }

                const link = e.target.closest('a');
                if (link && session && session.role) {
                    const href = link.getAttribute('href');
                    if (href && isRestrictedPageForRole(href, session.role)) {
                        e.preventDefault();
                        showNotification('Access denied. You don\'t have permission to view this page.', 'error');
                        return false;
                    }
                }
            } catch (clickError) {
                console.error('Error in click handler:', clickError);
            }
        });

        updateNavigationAuth();

        if (session && session.role) {
            applyRoleBasedRestrictions(session.role);

            if (session.role === 'freelancer') {
                updateFreelancerNavigation();
                interconnectFreelancerPages();
            }
        }
        
    } catch (error) {
        console.error('Error in DOMContentLoaded handler:', error);
    }
});

// Check if a page is restricted for a specific role
function isRestrictedPageForRole(href, role) {
    if (!href) return false;
    
    const restrictedPages = {
        freelancer: ['client-dashboard.html', 'post-job.html', 'admin-dashboard.html', 'admin-settings.html'],
        client: ['freelancer-dashboard.html', 'profile.html', 'admin-dashboard.html', 'admin-settings.html'],
        admin: [] // Admin has access to all pages
    };
    
    const pageName = href.split('/').pop();
    return restrictedPages[role]?.includes(pageName) || false;
}

// Apply comprehensive role-based restrictions
function applyRoleBasedRestrictions(userRole) {
    // Hide restricted buttons and elements
    const restrictedElements = {
        freelancer: [
            'button[onclick*="post-job"]',
            'button[onclick*="client-dashboard"]',
            '.client-only',
            '.admin-only'
        ],
        client: [
            'button[onclick*="freelancer-dashboard"]',
            'button[onclick*="profile.html"]',
            '.freelancer-only',
            '.admin-only'
        ],
        admin: [] // Admin can see everything
    };
    
    const elementsToHide = restrictedElements[userRole] || [];
    
    elementsToHide.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.style.display = 'none';
        });
    });
    
    // Hide restricted action buttons by text content
    const restrictedActions = {
        freelancer: ['Post Job', 'Browse Talent', 'Hire Freelancer', 'Contact Freelancer'],
        client: ['Apply to Job', 'Find Jobs', 'My Applications'],
        admin: []
    };
    
    const actionsToHide = restrictedActions[userRole] || [];
    
    actionsToHide.forEach(actionText => {
        const buttons = document.querySelectorAll('button, a');
        buttons.forEach(button => {
            if (button.textContent.trim().includes(actionText)) {
                button.style.display = 'none';
            }
        });
    });
}

// Enhanced navigation for freelancers
function updateFreelancerNavigation() {
    const session = JSON.parse(localStorage.getItem('userSession') || 'null');
    if (!session || session.role !== 'freelancer') return;
    
    // Update all navigation links to freelancer-appropriate pages
    const navLinks = document.querySelectorAll('nav a, .nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        // Update dashboard links
        if (href === 'client-dashboard.html') {
            link.href = 'freelancer-dashboard.html';
            link.textContent = 'Dashboard';
        }
        
        // Update browse links for job finding
        if (href === 'browse.html' && link.textContent.includes('Talent')) {
            link.textContent = 'Find Jobs';
        }
        
        // Update map links
        if (href === 'map.html' && link.textContent.includes('Talent')) {
            link.textContent = 'Job Map';
        }
    });
    
    // Update footer links
    const footerLinks = document.querySelectorAll('footer a');
    footerLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        if (href === 'browse.html' && link.textContent.includes('Browse Talent')) {
            link.textContent = 'Find Jobs';
        }
        
        if (href === 'map.html' && link.textContent.includes('Talent Map')) {
            link.textContent = 'Job Map';
        }
    });
}

// Enhanced navigation update with comprehensive role-based filtering
function updateNavigationAuth() {
    const authStatus = getAuthStatus();
    
    if (authStatus.isAuthenticated) {
        const userRole = authStatus.user.role;
        
        // Apply comprehensive role-based navigation filtering
        applyRoleBasedNavigation(userRole);
        
        // Update authentication buttons
        updateAuthenticationButtons(authStatus.user, userRole);
        
        // Hide restricted footer links
        hideRestrictedFooterLinks(userRole);
        
        // Update page-specific content
        updatePageContentForRole(userRole);
    }
}

// Apply role-based navigation filtering
function applyRoleBasedNavigation(userRole) {
    const navigationRules = {
        freelancer: {
            hide: [
                'a[href="post-job.html"]',
                'a[href="client-dashboard.html"]', 
                'a[href="admin-dashboard.html"]',
                'a[href="admin-settings.html"]'
            ],
            updateText: {
                'a[href="browse.html"]': 'Find Jobs',
                'a[href="map.html"]': 'Job Map'
            },
            hideByText: ['Browse Talent', 'Post Job', 'Client Dashboard', 'Admin Portal']
        },
        client: {
            hide: [
                'a[href="freelancer-dashboard.html"]',
                'a[href="profile.html"]',
                'a[href="admin-dashboard.html"]',
                'a[href="admin-settings.html"]'
            ],
            updateText: {
                'a[href="browse.html"]': 'Browse Talent',
                'a[href="map.html"]': 'Talent Map'
            },
            hideByText: ['Find Jobs', 'My Profile', 'Freelancer Dashboard', 'Admin Portal']
        },
        admin: {
            hide: [], // Admin can see everything
            updateText: {},
            hideByText: []
        }
    };
    
    const rules = navigationRules[userRole];
    if (!rules) return;
    
    // Hide specific links by selector
    rules.hide.forEach(selector => {
        const links = document.querySelectorAll(selector);
        links.forEach(link => {
            const listItem = link.closest('li');
            if (listItem) {
                listItem.style.display = 'none';
            } else {
                link.style.display = 'none';
            }
        });
    });
    
    // Update text for specific links
    Object.keys(rules.updateText).forEach(selector => {
        const links = document.querySelectorAll(selector);
        links.forEach(link => {
            link.textContent = rules.updateText[selector];
        });
    });
    
    // Hide links by text content
    rules.hideByText.forEach(text => {
        const allLinks = document.querySelectorAll('a, button');
        allLinks.forEach(element => {
            if (element.textContent.trim().includes(text)) {
                const listItem = element.closest('li');
                if (listItem) {
                    listItem.style.display = 'none';
                } else {
                    element.style.display = 'none';
                }
            }
        });
    });
}

// Update authentication buttons
function updateAuthenticationButtons(user, userRole) {
    const signInBtns = document.querySelectorAll('a[href="login.html"]');
    const joinBtns = document.querySelectorAll('a[href="register.html"]');
    
    signInBtns.forEach(btn => {
        if (btn.textContent.includes('Sign In')) {
            btn.textContent = user.name || user.fullName || 'Dashboard';
            btn.href = getDashboardUrl(userRole);
            btn.classList.remove('bg-blue-500', 'hover:bg-blue-600');
            btn.classList.add('bg-green-500', 'hover:bg-green-600');
        }
    });
    
    joinBtns.forEach(btn => {
        if (btn.textContent.includes('Join')) {
            btn.textContent = 'Logout';
            btn.href = '#';
            btn.classList.remove('bg-green-500', 'hover:bg-green-600');
            btn.classList.add('bg-red-500', 'hover:bg-red-600');
            
            // Remove existing event listeners
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('Are you sure you want to logout?')) {
                    localStorage.removeItem('userSession');
                    showNotification('Logged out successfully!', 'success');
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1000);
                }
            });
        }
    });
}

// Hide restricted footer links
function hideRestrictedFooterLinks(userRole) {
    const footerRestrictedLinks = {
        freelancer: ['Post a Job', 'Client Dashboard', 'Admin Portal'],
        client: ['Join as Freelancer', 'Freelancer Dashboard', 'Manage Profile', 'Find Work', 'Admin Portal'],
        admin: [] // Admin can see all footer links
    };
    
    const restrictedTexts = footerRestrictedLinks[userRole] || [];
    
    restrictedTexts.forEach(text => {
        const footerLinks = document.querySelectorAll('footer a');
        footerLinks.forEach(link => {
            if (link.textContent.trim().includes(text)) {
                const listItem = link.closest('li');
                if (listItem) {
                    listItem.style.display = 'none';
                } else {
                    link.style.display = 'none';
                }
            }
        });
    });
}

// Update page content for specific roles
function updatePageContentForRole(userRole) {
    const currentPage = getCurrentPage();
    
    // Update browse page content
    if (currentPage === 'browse.html') {
        const pageTitle = document.querySelector('h1, h2');
        const pageDescription = document.querySelector('h1 + p, h2 + p');
        
        if (userRole === 'freelancer') {
            if (pageTitle) pageTitle.textContent = 'Find Jobs';
            if (pageDescription) pageDescription.textContent = 'Discover opportunities that match your skills';
            document.title = 'Find Jobs - Rwanda SkillsConnect';
        } else if (userRole === 'client') {
            if (pageTitle) pageTitle.textContent = 'Browse Talent';
            if (pageDescription) pageDescription.textContent = 'Find skilled freelancers for your projects';
            document.title = 'Browse Talent - Rwanda SkillsConnect';
        }
    }
    
    // Update map page content
    if (currentPage === 'map.html') {
        const pageTitle = document.querySelector('h1, h2');
        
        if (userRole === 'freelancer') {
            if (pageTitle) pageTitle.textContent = 'Job Map';
            document.title = 'Job Map - Rwanda SkillsConnect';
        } else if (userRole === 'client') {
            if (pageTitle) pageTitle.textContent = 'Talent Map';
            document.title = 'Talent Map - Rwanda SkillsConnect';
        }
    }
}

// Get dashboard URL based on role
function getDashboardUrl(role) {
    switch(role) {
        case 'freelancer': return 'freelancer-dashboard.html';
        case 'client': return 'client-dashboard.html';
        case 'admin': return 'admin-dashboard.html';
        default: return 'dashboard.html';
    }
}

// Interconnect freelancer pages
function interconnectFreelancerPages() {
    const session = JSON.parse(localStorage.getItem('userSession') || 'null');
    if (!session || session.role !== 'freelancer') return;
    
    // Add quick navigation buttons to pages
    const quickNavHTML = `
        <div class="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
            <a href="freelancer-dashboard.html" class="bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors" title="Dashboard">
                <i class="fas fa-tachometer-alt"></i>
            </a>
            <a href="browse.html" class="bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-colors" title="Find Jobs">
                <i class="fas fa-search"></i>
            </a>
            <a href="profile.html" class="bg-purple-500 text-white p-3 rounded-full shadow-lg hover:bg-purple-600 transition-colors" title="My Profile">
                <i class="fas fa-user"></i>
            </a>
        </div>
    `;
    
    // Add to pages that don't have main navigation
    const currentPage = getCurrentPage();
    if (['browse.html', 'map.html'].includes(currentPage)) {
        document.body.insertAdjacentHTML('beforeend', quickNavHTML);
    }
}

// Enhanced freelancer dashboard functions
function loadRecentApplications() {
    const container = document.getElementById('recentApplications');
    if (!container) return;
    
    const session = JSON.parse(localStorage.getItem('userSession') || 'null');
    if (!session) return;
    
    const applications = JSON.parse(localStorage.getItem('appliedJobs') || '[]')
        .filter(app => app.freelancerId === session.id)
        .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
        .slice(0, 3); // Show only recent 3
    
    if (applications.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <p class="text-gray-500 text-sm">No applications yet. Start applying to jobs!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = applications.map(app => `
        <div class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div>
                <h3 class="font-semibold text-gray-800">${app.jobTitle}</h3>
                <p class="text-sm text-gray-600">${app.clientName}</p>
                <p class="text-xs text-gray-500">Applied ${new Date(app.appliedAt).toLocaleDateString()}</p>
            </div>
            <span class="px-3 py-1 text-xs rounded-full ${getApplicationStatusColor(app.status)}">
                ${app.status.charAt(0).toUpperCase() + app.status.slice(1)}
            </span>
        </div>
    `).join('');
}

// Enhanced client dashboard functions
function renderClientDashboard() {
    if (getCurrentPage() !== 'client-dashboard.html') return;
    
    const session = checkAuth();
    if (!session || session.role !== 'client') return;

    // Update user info in header
    const userName = session.name || session.fullName || "User";
    const userEmail = session.email || "user@example.com";
    
    // Update all user name elements
    const userNameElements = document.querySelectorAll('#userName');
    userNameElements.forEach(el => el.textContent = userName);
    
    const userInitialElements = document.querySelectorAll('#userInitial');
    userInitialElements.forEach(el => el.textContent = userName.charAt(0).toUpperCase());
    
    // Update welcome section
    const welcomeNameEl = document.getElementById('userNameWelcome');
    if (welcomeNameEl) welcomeNameEl.textContent = userName;
    
    // Update profile section
    const profileNameEl = document.getElementById('profileName');
    if (profileNameEl) profileNameEl.textContent = userName;
    
    const profileEmailEl = document.getElementById('profileEmail');
    if (profileEmailEl) profileEmailEl.textContent = userEmail;
    
    const profileInitialEl = document.getElementById('profileInitial');
    if (profileInitialEl) profileInitialEl.textContent = userName.charAt(0).toUpperCase();
    
    // Load and display client statistics
    updateClientDashboardStats(session);
}

function updateClientDashboardStats(session) {
    const jobs = JSON.parse(localStorage.getItem('jobs') || '[]')
        .filter(job => job.clientId === session.id);
    
    const applications = JSON.parse(localStorage.getItem('appliedJobs') || '[]')
        .filter(app => jobs.some(job => job.id === app.jobId));
    
    const hired = applications.filter(app => app.status === 'accepted');
    
    const totalSpent = hired.reduce((sum, hire) => {
        const job = jobs.find(j => j.id === hire.jobId);
        return sum + (job ? parseInt(job.salary) || parseInt(job.maxBudget) || 0 : 0);
    }, 0);

    // Update stats with animation
    setTimeout(() => {
        animateCounter('activeJobsCount', jobs.length);
        animateCounter('applicationsCount', applications.length);
        animateCounter('hiredCount', hired.length);
        
        const totalSpentEl = document.getElementById('totalSpent');
        if (totalSpentEl) {
            totalSpentEl.textContent = `$${totalSpent.toLocaleString()}`;
        }
        
        // Update change indicators
        const jobsWeeklyChangeEl = document.getElementById('jobsWeeklyChange');
        if (jobsWeeklyChangeEl) {
            jobsWeeklyChangeEl.textContent = `+${Math.max(1, Math.floor(jobs.length * 0.2))}`;
        }
        
        const applicationsChangeEl = document.getElementById('applicationsChange');
        if (applicationsChangeEl) {
            applicationsChangeEl.textContent = `+${Math.max(0, Math.floor(applications.length * 0.3))}`;
        }
        
        const inProgressCountEl = document.getElementById('inProgressCount');
        if (inProgressCountEl) {
            inProgressCountEl.textContent = Math.max(0, Math.floor(hired.length * 0.7));
        }
    }, 500);
}

function animateCounter(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    let currentValue = 0;
    const increment = Math.max(1, targetValue / 30);
    const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= targetValue) {
            currentValue = targetValue;
            clearInterval(timer);
        }
        element.textContent = Math.floor(currentValue);
    }, 50);
}

function loadAvailableJobs() {
    const container = document.getElementById('availableJobs');
    if (!container) return;
    
    const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
    const session = JSON.parse(localStorage.getItem('userSession') || 'null');
    const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
    
    // Filter out jobs already applied to
    const availableJobs = jobs.filter(job => {
        return !appliedJobs.find(app => app.jobId === job.id && app.freelancerId === session?.id);
    });
    
    if (availableJobs.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6"></path>
                </svg>
                <h3 class="text-lg font-medium text-gray-900 mb-2">No new jobs available</h3>
                <p class="text-gray-500">Check back later for new opportunities or browse all jobs.</p>
                <button onclick="window.location.href='browse.html'" class="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                    Browse All Jobs
                </button>
            </div>
        `;
        return;
    }
    
    renderFilteredJobs(availableJobs);
}

// Initialize client dashboard specific functionality
function initializeClientDashboard() {
    // Add any client dashboard specific initialization here
    console.log('Client dashboard initialized');
}

// Chat system functions
function initializeChatSystem() {
    // Create conversations storage if it doesn't exist
    if (!localStorage.getItem('conversations')) {
        localStorage.setItem('conversations', JSON.stringify([]));
    }
}

// Send message in chat
function sendChatMessage(conversationId, message, senderId, senderName) {
    const conversations = JSON.parse(localStorage.getItem('conversations') || '[]');
    const convIndex = conversations.findIndex(conv => conv.id === conversationId);
    
    if (convIndex === -1) return false;
    
    const newMessage = {
        id: 'msg' + Date.now(),
        senderId: senderId,
        senderName: senderName,
        message: message,
        timestamp: new Date().toISOString(),
        type: 'text'
    };
    
    conversations[convIndex].messages.push(newMessage);
    conversations[convIndex].lastMessage = message;
    conversations[convIndex].lastMessageTime = newMessage.timestamp;
    
    // Update unread count for recipient
    const session = JSON.parse(localStorage.getItem('userSession') || 'null');
    if (session && session.id !== senderId) {
        conversations[convIndex].unreadCount++;
    }
    
    localStorage.setItem('conversations', JSON.stringify(conversations));
    return true;
}

// Get conversation by ID
function getConversation(conversationId) {
    const conversations = JSON.parse(localStorage.getItem('conversations') || '[]');
    return conversations.find(conv => conv.id === conversationId);
}

// Get user conversations
function getUserConversations(userId, userRole) {
    const conversations = JSON.parse(localStorage.getItem('conversations') || '[]');
    
    if (userRole === 'client') {
        return conversations.filter(conv => conv.clientId === userId);
    } else if (userRole === 'freelancer') {
        return conversations.filter(conv => conv.freelancerId === userId);
    }
    
    return [];
}

// Mark conversation as read
function markConversationAsRead(conversationId, userId) {
    const conversations = JSON.parse(localStorage.getItem('conversations') || '[]');
    const convIndex = conversations.findIndex(conv => conv.id === conversationId);
    
    if (convIndex !== -1) {
        conversations[convIndex].unreadCount = 0;
        localStorage.setItem('conversations', JSON.stringify(conversations));
    }
}



// Make essential functions globally available
const globalFunctions = {
    // Core functions
    applyToJob,
    viewFreelancerProfile,
    contactFreelancer,
    showProfileModal,
    handleGoogleSignIn,
    fillDemoCredentials,
    withdrawApplication,
    viewJobDetails,
    startProject,
    redirectToDashboard,
    showSection,
    validateEmail,
    generateId,
    
    // Dashboard functions
    loadRecentApplications,
    loadAvailableJobs,
    filterApplications,
    updateApplicationStats,
    renderClientDashboard,
    updateClientDashboardStats,
    animateCounter,
    
    // Admin functions
    editUser,
    deleteUser,
    editJob,
    deleteJob,
    approveUser,
    rejectUser,
    getRoleColor,
    getJobStatusColor,
    filterUsers,
    filterJobs,
    
    // Utility functions
    getApplicationStatusInfo,
    getTimeAgo,
    generateOTP,
    sendPasswordResetOTP,
    verifyPasswordResetOTP,
    resetPasswordWithOTP,
    canFreelancerApply,
    
    // Chat functions
    initializeChatSystem,
    sendChatMessage,
    getConversation,
    getUserConversations,
    markConversationAsRead
};

// Assign to window object
Object.assign(window, globalFunctions);

// Demo credentials function
function fillDemoCredentials(type) {
    try {
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        
        if (!emailInput || !passwordInput) {
            console.error('Email or password input not found');
            return;
        }
        
        const credentials = {
            client: { email: 'client@test.com', password: 'client123' },
            freelancer: { email: 'freelancer@test.com', password: 'freelancer123' },
            admin: { email: 'admin@skillsconnect.rw', password: 'admin123' }
        };
        
        const cred = credentials[type];
        if (cred) {
            emailInput.value = cred.email;
            passwordInput.value = cred.password;
        }
    } catch (error) {
        console.error('Error filling demo credentials:', error);
    }
}

// Global showSection function for admin dashboard
function showSection(sectionName) {
    const sections = document.querySelectorAll('.section');
    const navItems = document.querySelectorAll('.nav-item');
    const pageTitle = document.getElementById('pageTitle');
    
    // Hide all sections
    sections.forEach(section => section.classList.remove('active'));
    
    // Show selected section
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update active nav item
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

        'reports': 'Reports & Analytics',
        'settings': 'Settings',
        'menu': 'Menu Management'
    };
    
    if (pageTitle) {
        pageTitle.textContent = titles[sectionName] || 'Admin Dashboard';
    }
}