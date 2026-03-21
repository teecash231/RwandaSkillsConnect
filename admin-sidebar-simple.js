// Simple Admin Sidebar Fix
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu
    const openBtn = document.getElementById('openSidebar');
    const closeBtn = document.getElementById('closeSidebar');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileOverlay');

    if (openBtn && sidebar && overlay) {
        openBtn.onclick = () => {
            sidebar.classList.remove('-translate-x-full');
            overlay.classList.remove('hidden');
        };
    }

    if (closeBtn && sidebar && overlay) {
        closeBtn.onclick = () => {
            sidebar.classList.add('-translate-x-full');
            overlay.classList.add('hidden');
        };
    }

    if (overlay && sidebar) {
        overlay.onclick = () => {
            sidebar.classList.add('-translate-x-full');
            overlay.classList.add('hidden');
        };
    }

    // Navigation
    const navItems = document.querySelectorAll('.nav-item[data-section]');
    const sections = document.querySelectorAll('.section');
    const pageTitle = document.getElementById('pageTitle');

    navItems.forEach(item => {
        item.onclick = (e) => {
            e.preventDefault();
            const sectionName = item.dataset.section;
            
            // Hide all sections
            sections.forEach(s => s.classList.remove('active'));
            
            // Show target section
            const target = document.getElementById(sectionName + '-section');
            if (target) target.classList.add('active');
            
            // Update nav
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            
            // Update title
            const titles = {
                'dashboard': 'Admin Dashboard',
                'users': 'Users Management', 
                'jobs': 'Jobs Management',
                'job-approvals': 'Job Approvals',
                'reports': 'Reports & Analytics',
                'settings': 'Settings',
                'menu': 'Menu Management'
            };
            if (pageTitle) pageTitle.textContent = titles[sectionName] || 'Admin Dashboard';
            
            // Close mobile menu
            if (sidebar && overlay) {
                sidebar.classList.add('-translate-x-full');
                overlay.classList.add('hidden');
            }
        };
    });

    // Quick actions
    window.quickShowSection = (sectionName) => {
        const navItem = document.querySelector(`[data-section="${sectionName}"]`);
        if (navItem) navItem.click();
    };
});