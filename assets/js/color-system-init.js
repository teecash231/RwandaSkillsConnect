/**
 * Color System Initialization Script
 * Ensures role-based colors are applied consistently across all pages
 */

(function() {
    'use strict';
    
    // Initialize color system as soon as possible
    function initializeColorSystem() {
        // Apply role-based body classes immediately
        const session = JSON.parse(localStorage.getItem('userSession') || 'null');
        if (session && session.role) {
            document.body.classList.add(`role-${session.role}`);
            
            // Apply theme class to main containers
            const containers = document.querySelectorAll('main, .main-content, .dashboard-content, .container');
            containers.forEach(container => {
                container.classList.add(`theme-${session.role}`);
            });
            
            // Update page title with role indicator
            const currentTitle = document.title;
            if (!currentTitle.includes(session.role.charAt(0).toUpperCase() + session.role.slice(1))) {
                document.title = `${currentTitle} - ${session.role.charAt(0).toUpperCase() + session.role.slice(1)}`;
            }
        }
        
        // Apply color system when role color manager is available
        if (typeof window.RoleColorManager !== 'undefined') {
            if (!window.roleColorManager) {
                window.roleColorManager = new window.RoleColorManager();
            }
            window.roleColorManager.applyRoleColors();
        } else {
            // Fallback: apply basic role-based styling
            applyBasicRoleColors();
        }
    }
    
    // Fallback function for basic role-based colors
    function applyBasicRoleColors() {
        const session = JSON.parse(localStorage.getItem('userSession') || 'null');
        if (!session || !session.role) return;
        
        const colorMap = {
            admin: '#ef4444',
            client: '#3b82f6',
            freelancer: '#22c55e'
        };
        
        const primaryColor = colorMap[session.role];
        if (!primaryColor) return;
        
        // Apply basic styling
        const style = document.createElement('style');
        style.textContent = `
            .btn-primary:not(.btn-admin):not(.btn-secondary):not(.btn-accent) {
                background-color: ${primaryColor} !important;
            }
            .text-primary-600 {
                color: ${primaryColor} !important;
            }
            .bg-primary-500 {
                background-color: ${primaryColor} !important;
            }
            .border-primary-500 {
                border-color: ${primaryColor} !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Initialize immediately if DOM is ready, otherwise wait
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeColorSystem);
    } else {
        initializeColorSystem();
    }
    
    // Re-apply colors when user session changes
    window.addEventListener('storage', function(e) {
        if (e.key === 'userSession') {
            setTimeout(initializeColorSystem, 100);
        }
    });
    
    // Export for manual initialization
    window.initializeColorSystem = initializeColorSystem;
})();