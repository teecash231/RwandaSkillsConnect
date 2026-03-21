/**
 * Role-Based Access Control System
 * Restricts freelancer access to only relevant functionality
 */

// Define role-based access permissions
const ROLE_PERMISSIONS = {
    freelancer: {
        allowedPages: [
            'index.html',
            'login.html', 
            'register.html',
            'about.html',
            'freelancer-dashboard.html',
            'profile.html',
            'browse.html', // For finding jobs
            'map.html',    // For job map
            'freelancer-messages.html' // For messaging
        ],
        allowedNavigation: [
            { href: 'index.html', text: 'Home' },
            { href: 'freelancer-dashboard.html', text: 'Dashboard' },
            { href: 'browse.html', text: 'Find Jobs' },
            { href: 'profile.html', text: 'My Profile' },
            { href: 'map.html', text: 'Job Map' }
        ],
        restrictedPages: [
            'client-dashboard.html',
            'client-profile.html',
            'client-settings.html',
            'client-messages.html',
            'client-menu.html',
            'post-job.html',
            'admin-dashboard.html',
            'admin-settings.html'
        ],
        restrictedNavigation: [
            'Browse Talent',
            'Post Job',
            'Client Dashboard',
            'Admin Dashboard',
            'Admin Portal'
        ]
    },
    client: {
        allowedPages: '*', // Allow all pages for clients
        restrictedPages: [
            'freelancer-dashboard.html',
            'freelancer-messages.html', 
            'profile.html', // Freelancer profile page
            'admin-dashboard.html',
            'admin-settings.html'
        ],
        allowedNavigation: [
            { href: 'index.html', text: 'Home' },
            { href: 'client-dashboard.html', text: 'Dashboard' },
            { href: 'browse.html', text: 'Browse Talent' },
            { href: 'post-job.html', text: 'Post Job' },
            { href: 'map.html', text: 'Talent Map' }
        ],

        restrictedNavigation: [
            'Find Jobs',
            'My Profile',
            'Freelancer Dashboard',
            'Admin Dashboard',
            'Admin Portal'
        ]
    },
    admin: {
        allowedPages: '*', // Admin has access to all pages
        allowedNavigation: '*',
        restrictedPages: [],
        restrictedNavigation: []
    }
};

/**
 * Initialize role-based access control
 */
function initializeRoleAccessControl() {
    const session = JSON.parse(localStorage.getItem('userSession') || 'null');
    
    if (session && session.role) {
        console.log('Initializing access control for role:', session.role, 'on page:', getCurrentPage());
        enforcePageAccess(session.role);
        filterNavigation(session.role);
        hideRestrictedElements(session.role);
        updatePageContent(session.role);
    } else {
        console.log('No valid session found for access control');
    }
}

/**
 * Enforce page access based on user role
 */
function enforcePageAccess(userRole) {
    const currentPage = getCurrentPage();
    const permissions = ROLE_PERMISSIONS[userRole];
    
    if (!permissions) return;
    
    // Allow access to all pages for admin
    if (permissions.allowedPages === '*') return;
    
    // Check if current page is allowed
    const isAllowed = permissions.allowedPages.includes(currentPage) || 
                     permissions.allowedPages.includes('') ||
                     currentPage === '' || currentPage === 'index.html';
    
    // Additional check for restricted pages - only block if explicitly restricted
    if (permissions.restrictedPages.includes(currentPage)) {
        showNotification('Access denied. You don\'t have permission to access this page.', 'error');
        setTimeout(() => {
            redirectToUserDashboard(userRole);
        }, 2000);
        return;
    }
    
    // Only redirect if page is not allowed AND not a public page
    const publicPages = ['index.html', 'login.html', 'register.html', 'about.html', ''];
    if (!isAllowed && !publicPages.includes(currentPage)) {
        showNotification('Access denied. Redirecting to your dashboard...', 'error');
        setTimeout(() => {
            redirectToUserDashboard(userRole);
        }, 2000);
    }
}

/**
 * Filter navigation elements based on user role
 */
function filterNavigation(userRole) {
    const permissions = ROLE_PERMISSIONS[userRole];
    
    if (!permissions || permissions.allowedNavigation === '*') return;
    
    // Hide restricted navigation items
    hideRestrictedNavigationItems(permissions.restrictedNavigation);
    
    // Update navigation text for role-specific context
    updateNavigationText(userRole);
    
    // Remove restricted links from footer
    filterFooterLinks(permissions.restrictedNavigation);
}

/**
 * Hide restricted navigation items
 */
function hideRestrictedNavigationItems(restrictedItems) {
    // Hide navigation links in header
    const navLinks = document.querySelectorAll('nav a, .nav-link');
    
    navLinks.forEach(link => {
        const linkText = link.textContent.trim();
        const linkHref = link.getAttribute('href');
        
        // Check if this navigation item should be hidden
        const shouldHide = restrictedItems.some(restricted => {
            return linkText.includes(restricted) || 
                   (linkHref && isRestrictedPage(linkHref));
        });
        
        if (shouldHide) {
            // Hide the entire list item if it exists
            const listItem = link.closest('li');
            if (listItem) {
                listItem.style.display = 'none';
            } else {
                link.style.display = 'none';
            }
        }
    });
    
    // Hide mobile menu items
    const mobileNavLinks = document.querySelectorAll('#mobileMenu a');
    mobileNavLinks.forEach(link => {
        const linkText = link.textContent.trim();
        const linkHref = link.getAttribute('href');
        
        const shouldHide = restrictedItems.some(restricted => {
            return linkText.includes(restricted) || 
                   (linkHref && isRestrictedPage(linkHref));
        });
        
        if (shouldHide) {
            link.style.display = 'none';
        }
    });
}

/**
 * Update navigation text for role-specific context
 */
function updateNavigationText(userRole) {
    const browseLinks = document.querySelectorAll('a[href="browse.html"]');
    
    browseLinks.forEach(link => {
        if (userRole === 'freelancer') {
            // Change "Browse Talent" to "Find Jobs" for freelancers
            if (link.textContent.includes('Browse') || link.textContent.includes('Talent')) {
                link.textContent = 'Find Jobs';
            }
        } else if (userRole === 'client') {
            // Ensure it says "Browse Talent" for clients
            if (link.textContent.includes('Find') || link.textContent.includes('Jobs')) {
                link.textContent = 'Browse Talent';
            }
        }
    });
    
    // Update map links
    const mapLinks = document.querySelectorAll('a[href="map.html"]');
    mapLinks.forEach(link => {
        if (userRole === 'freelancer') {
            link.textContent = 'Job Map';
        } else if (userRole === 'client') {
            link.textContent = 'Talent Map';
        }
    });
}

/**
 * Filter footer links based on role
 */
function filterFooterLinks(restrictedItems) {
    const footerLinks = document.querySelectorAll('footer a');
    
    footerLinks.forEach(link => {
        const linkText = link.textContent.trim();
        const linkHref = link.getAttribute('href');
        
        const shouldHide = restrictedItems.some(restricted => {
            return linkText.includes(restricted) || 
                   (linkHref && isRestrictedPage(linkHref));
        });
        
        if (shouldHide) {
            const listItem = link.closest('li');
            if (listItem) {
                listItem.style.display = 'none';
            } else {
                link.style.display = 'none';
            }
        }
    });
}

/**
 * Hide restricted elements on the page
 */
function hideRestrictedElements(userRole) {
    const permissions = ROLE_PERMISSIONS[userRole];
    
    if (!permissions || permissions.allowedNavigation === '*') return;
    
    // Hide buttons and links that lead to restricted pages
    const allLinks = document.querySelectorAll('a, button[onclick]');
    
    allLinks.forEach(element => {
        const href = element.getAttribute('href');
        const onclick = element.getAttribute('onclick');
        
        // Check href attribute
        if (href && isRestrictedPage(href)) {
            hideElement(element);
        }
        
        // Check onclick attribute for page redirects
        if (onclick && containsRestrictedPageRedirect(onclick, userRole)) {
            hideElement(element);
        }
        
        // Check button text for restricted actions
        const text = element.textContent.trim();
        if (isRestrictedAction(text, userRole)) {
            hideElement(element);
        }
    });
    
    // Hide specific sections based on role
    hideRestrictedSections(userRole);
}

/**
 * Update page content based on user role
 */
function updatePageContent(userRole) {
    const currentPage = getCurrentPage();
    
    // Update page titles and descriptions
    if (currentPage === 'browse.html') {
        updateBrowsePage(userRole);
    } else if (currentPage === 'map.html') {
        updateMapPage(userRole);
    } else if (currentPage === 'index.html' || currentPage === '') {
        updateHomePage(userRole);
    }
}

/**
 * Update browse page content based on role
 */
function updateBrowsePage(userRole) {
    const pageTitle = document.querySelector('h1, h2');
    const pageDescription = document.querySelector('h1 + p, h2 + p');
    
    if (userRole === 'freelancer') {
        if (pageTitle) pageTitle.textContent = 'Find Jobs';
        if (pageDescription) pageDescription.textContent = 'Discover opportunities that match your skills and expertise';
        
        // Update document title
        document.title = 'Find Jobs - Rwanda SkillsConnect';
        
        // Update navigation badge
        const badge = document.querySelector('.bg-green-100');
        if (badge) badge.textContent = 'Find Jobs';
        
        // Update search placeholder
        const searchInput = document.getElementById('searchJobs');
        if (searchInput) {
            searchInput.placeholder = 'Search by job title, skills, or company...';
        }
        
    } else if (userRole === 'client') {
        if (pageTitle) pageTitle.textContent = 'Browse Talent';
        if (pageDescription) pageDescription.textContent = 'Find skilled freelancers for your projects';
        
        // Update document title
        document.title = 'Browse Talent - Rwanda SkillsConnect';
    }
}

/**
 * Update map page content based on role
 */
function updateMapPage(userRole) {
    const pageTitle = document.querySelector('h1, h2');
    
    if (userRole === 'freelancer') {
        if (pageTitle) pageTitle.textContent = 'Job Map';
        document.title = 'Job Map - Rwanda SkillsConnect';
    } else if (userRole === 'client') {
        if (pageTitle) pageTitle.textContent = 'Talent Map';
        document.title = 'Talent Map - Rwanda SkillsConnect';
    }
}

/**
 * Update home page content for logged-in users
 */
function updateHomePage(userRole) {
    // Hide registration CTAs for logged-in users
    const registerButtons = document.querySelectorAll('a[href="register.html"]');
    registerButtons.forEach(btn => {
        if (btn.textContent.includes('Join') || btn.textContent.includes('Register')) {
            btn.textContent = 'Dashboard';
            btn.href = getDashboardUrl(userRole);
            btn.classList.remove('bg-green-500', 'hover:bg-green-600');
            btn.classList.add('bg-blue-500', 'hover:bg-blue-600');
        }
    });
    
    // Update hero search placeholder for freelancers
    if (userRole === 'freelancer') {
        const heroSearch = document.getElementById('heroSearch');
        if (heroSearch) {
            heroSearch.placeholder = 'Search for jobs...';
        }
    }
}

/**
 * Helper function to check if a page is restricted
 */
function isRestrictedPage(href) {
    if (!href) return false;
    
    const session = JSON.parse(localStorage.getItem('userSession') || 'null');
    if (!session) return false;
    
    const permissions = ROLE_PERMISSIONS[session.role];
    if (!permissions) return false;
    
    const pageName = href.split('/').pop() || href;
    return permissions.restrictedPages.includes(pageName);
}

/**
 * Helper function to check if onclick contains restricted page redirect
 */
function containsRestrictedPageRedirect(onclick, userRole) {
    if (!onclick) return false;
    
    const permissions = ROLE_PERMISSIONS[userRole];
    if (!permissions) return false;
    
    return permissions.restrictedPages.some(page => onclick.includes(page));
}

/**
 * Helper function to check if an action is restricted
 */
function isRestrictedAction(text, userRole) {
    const restrictedActions = {
        freelancer: [
            'Post Job',
            'Post a Job', 
            'Browse Talent',
            'Client Dashboard',
            'Admin Dashboard',
            'Admin Portal',
            'Hire Freelancer',
            'Contact Freelancer'
        ],
        client: [
            'Find Jobs',
            'Apply to Job',
            'Freelancer Dashboard',
            'My Profile',
            'Admin Dashboard',
            'Admin Portal'
        ]
    };
    
    const restricted = restrictedActions[userRole] || [];
    return restricted.some(action => text.includes(action));
}

/**
 * Helper function to hide an element
 */
function hideElement(element) {
    // Hide the element and its parent container if appropriate
    const container = element.closest('.btn-container, .button-group, .nav-item');
    if (container && container.children.length === 1) {
        container.style.display = 'none';
    } else {
        element.style.display = 'none';
    }
}

/**
 * Hide restricted sections based on role
 */
function hideRestrictedSections(userRole) {
    // Hide client-specific sections for freelancers
    if (userRole === 'freelancer') {
        const clientSections = document.querySelectorAll(
            '.client-only, [data-role="client"], .post-job-section'
        );
        clientSections.forEach(section => section.style.display = 'none');
    }
    
    // Hide freelancer-specific sections for clients
    if (userRole === 'client') {
        const freelancerSections = document.querySelectorAll(
            '.freelancer-only, [data-role="freelancer"], .job-application-section'
        );
        freelancerSections.forEach(section => section.style.display = 'none');
    }
    
    // Hide admin sections for non-admins
    if (userRole !== 'admin') {
        const adminSections = document.querySelectorAll(
            '.admin-only, [data-role="admin"], .admin-section'
        );
        adminSections.forEach(section => section.style.display = 'none');
    }
}

/**
 * Redirect to appropriate dashboard based on role
 */
function redirectToUserDashboard(userRole) {
    const dashboardUrls = {
        freelancer: 'freelancer-dashboard.html',
        client: 'client-dashboard.html', 
        admin: 'admin-dashboard.html'
    };
    
    const dashboardUrl = dashboardUrls[userRole];
    if (dashboardUrl) {
        console.log('Redirecting', userRole, 'to dashboard:', dashboardUrl);
        showNotification('Redirecting to your dashboard...', 'info', 1500);
        setTimeout(() => {
            window.location.href = dashboardUrl;
        }, 1500);
    } else {
        console.error('No dashboard URL found for role:', userRole);
    }
}

/**
 * Get dashboard URL for role
 */
function getDashboardUrl(role) {
    const dashboardUrls = {
        freelancer: 'freelancer-dashboard.html',
        client: 'client-dashboard.html',
        admin: 'admin-dashboard.html'
    };
    return dashboardUrls[role] || 'index.html';
}

/**
 * Get current page name
 */
function getCurrentPage() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    // Handle empty page name
    return page === '' ? 'index.html' : page;
}

/**
 * Enhanced page access control with real-time monitoring
 */
function monitorPageAccess() {
    // Monitor for dynamic content changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                const session = JSON.parse(localStorage.getItem('userSession') || 'null');
                if (session && session.role) {
                    // Re-apply access control to new elements
                    hideRestrictedElements(session.role);
                }
            }
        });
    });
    
    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

/**
 * Intercept navigation attempts to restricted pages
 */
function interceptRestrictedNavigation() {
    // Intercept click events on links
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (!link) return;
        
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
        
        const session = JSON.parse(localStorage.getItem('userSession') || 'null');
        if (!session || !session.role) return;
        
        const pageName = href.split('/').pop();
        
        if (isRestrictedPage(pageName)) {
            e.preventDefault();
            showNotification('Access denied. You don\'t have permission to view this page.', 'error');
            redirectToUserDashboard(session.role);
        }
    });
}

/**
 * Initialize role-based access control system
 */
function initializeAccessControlSystem() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initializeRoleAccessControl();
            monitorPageAccess();
            interceptRestrictedNavigation();
        });
    } else {
        initializeRoleAccessControl();
        monitorPageAccess();
        interceptRestrictedNavigation();
    }
}

/**
 * Debug function to check current access permissions
 */
function debugAccessControl() {
    const session = JSON.parse(localStorage.getItem('userSession') || 'null');
    const currentPage = getCurrentPage();
    
    console.log('=== ACCESS CONTROL DEBUG ===');
    console.log('Current Page:', currentPage);
    console.log('User Session:', session);
    
    if (session && session.role) {
        const permissions = ROLE_PERMISSIONS[session.role];
        console.log('User Role:', session.role);
        console.log('Role Permissions:', permissions);
        console.log('Is page allowed?', permissions.allowedPages.includes(currentPage) || permissions.allowedPages === '*');
        console.log('Is page restricted?', permissions.restrictedPages.includes(currentPage));
    } else {
        console.log('No user session found');
    }
    console.log('=== END DEBUG ===');
}

/**
 * Test function to simulate different user roles
 */
function testRoleAccess(role, testPage = null) {
    const originalPage = getCurrentPage();
    if (testPage) {
        // Temporarily change page for testing
        const originalPathname = window.location.pathname;
        Object.defineProperty(window.location, 'pathname', {
            value: testPage,
            configurable: true
        });
    }
    
    const permissions = ROLE_PERMISSIONS[role];
    const currentPage = getCurrentPage();
    
    console.log(`Testing ${role} access to ${currentPage}:`);
    console.log('Allowed:', permissions.allowedPages.includes(currentPage) || permissions.allowedPages === '*');
    console.log('Restricted:', permissions.restrictedPages.includes(currentPage));
    
    if (testPage) {
        // Restore original page
        Object.defineProperty(window.location, 'pathname', {
            value: originalPage,
            configurable: true
        });
    }
}

// Auto-initialize the system
initializeAccessControlSystem();

// Export functions for use in other scripts
if (typeof window !== 'undefined') {
    window.RoleAccessControl = {
        initializeRoleAccessControl,
        enforcePageAccess,
        filterNavigation,
        hideRestrictedElements,
        updatePageContent,
        redirectToUserDashboard,
        getDashboardUrl,
        debugAccessControl,
        testRoleAccess
    };
}