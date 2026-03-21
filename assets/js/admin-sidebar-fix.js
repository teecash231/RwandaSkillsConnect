/**
 * Admin Dashboard Sidebar Fix
 * Ensures proper sidebar navigation functionality
 */

(function() {
    'use strict';

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        initializeSidebar();
    });

    function initializeSidebar() {
        // Mobile menu functionality
        setupMobileMenu();
        
        // Navigation functionality
        setupNavigation();
        
        // Initialize sections
        initializeSections();
        
        // Set default active section
        setDefaultSection();
    }

    function setupMobileMenu() {
        const openSidebar = document.getElementById('openSidebar');
        const closeSidebar = document.getElementById('closeSidebar');
        const sidebar = document.getElementById('sidebar');
        const mobileOverlay = document.getElementById('mobileOverlay');

        if (openSidebar && sidebar && mobileOverlay) {
            openSidebar.addEventListener('click', function(e) {
                e.preventDefault();
                sidebar.classList.remove('-translate-x-full');
                mobileOverlay.classList.remove('hidden');
            });
        }

        if (closeSidebar && sidebar && mobileOverlay) {
            closeSidebar.addEventListener('click', function(e) {
                e.preventDefault();
                sidebar.classList.add('-translate-x-full');
                mobileOverlay.classList.add('hidden');
            });
        }

        if (mobileOverlay && sidebar) {
            mobileOverlay.addEventListener('click', function() {
                sidebar.classList.add('-translate-x-full');
                mobileOverlay.classList.add('hidden');
            });
        }
    }

    function setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item[data-section]');
        
        navItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                
                const sectionName = this.dataset.section;
                if (sectionName) {
                    showSection(sectionName);
                    updateActiveNavItem(this);
                    closeMobileMenu();
                }
            });
        });
    }

    function showSection(sectionName) {
        // Hide all sections
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionName + '-section');
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update page title
        updatePageTitle(sectionName);

        // Load section-specific data
        loadSectionData(sectionName);
    }

    function updateActiveNavItem(activeItem) {
        // Remove active class from all nav items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to clicked item
        activeItem.classList.add('active');
    }

    function updatePageTitle(sectionName) {
        const pageTitle = document.getElementById('pageTitle');
        if (!pageTitle) return;

        const titles = {
            'dashboard': 'Admin Dashboard',
            'users': 'Users Management',
            'jobs': 'Jobs Management',
            'job-approvals': 'Job Approvals',
            'reports': 'Reports & Analytics',
            'settings': 'Settings',
            'menu': 'Menu Management'
        };

        pageTitle.textContent = titles[sectionName] || 'Admin Dashboard';
    }

    function loadSectionData(sectionName) {
        // Call appropriate data loading functions based on section
        switch(sectionName) {
            case 'dashboard':
                if (typeof loadDashboardData === 'function') {
                    loadDashboardData();
                }
                break;
            case 'users':
                if (typeof loadUsersData === 'function') {
                    loadUsersData();
                }
                break;
            case 'jobs':
                if (typeof loadJobsData === 'function') {
                    loadJobsData();
                }
                break;
            case 'job-approvals':
                if (typeof loadJobApprovalsData === 'function') {
                    loadJobApprovalsData();
                }
                break;
            case 'reports':
                if (window.adminAnalytics && typeof window.adminAnalytics.loadAnalytics === 'function') {
                    window.adminAnalytics.loadAnalytics();
                }
                break;
            case 'settings':
                // Settings data loading if needed
                break;
            case 'menu':
                // Menu management data loading if needed
                break;
        }
    }

    function closeMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const mobileOverlay = document.getElementById('mobileOverlay');
        
        if (sidebar) {
            sidebar.classList.add('-translate-x-full');
        }
        if (mobileOverlay) {
            mobileOverlay.classList.add('hidden');
        }
    }

    function initializeSections() {
        // Ensure all sections are hidden initially except dashboard
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.classList.remove('active');
        });
    }

    function setDefaultSection() {
        // Set dashboard as default active section
        const dashboardSection = document.getElementById('dashboard-section');
        if (dashboardSection) {
            dashboardSection.classList.add('active');
        }

        // Set dashboard nav item as active
        const dashboardNavItem = document.querySelector('.nav-item[data-section="dashboard"]');
        if (dashboardNavItem) {
            dashboardNavItem.classList.add('active');
        }
    }

    // Make showSection globally available
    window.showSection = function(sectionName) {
        showSection(sectionName);
        
        // Update nav item
        const navItem = document.querySelector(`.nav-item[data-section="${sectionName}"]`);
        if (navItem) {
            updateActiveNavItem(navItem);
        }
    };

    // Quick action functions for dashboard buttons
    window.quickShowSection = function(sectionName) {
        showSection(sectionName);
        
        // Update nav item
        const navItem = document.querySelector(`.nav-item[data-section="${sectionName}"]`);
        if (navItem) {
            updateActiveNavItem(navItem);
        }
        
        // Close mobile menu if open
        closeMobileMenu();
    };

})();