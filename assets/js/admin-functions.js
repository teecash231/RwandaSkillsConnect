// Admin-specific JavaScript functions

/**
 * Initialize admin dashboard functionality
 */
function initializeAdminDashboard() {
    // Initialize sidebar toggle
    const openSidebar = document.getElementById('openSidebar');
    const closeSidebar = document.getElementById('closeSidebar');
    const sidebar = document.getElementById('sidebar');
    const mobileOverlay = document.getElementById('mobileOverlay');
    
    if (openSidebar) {
        openSidebar.addEventListener('click', toggleSidebar);
    }
    
    if (closeSidebar) {
        closeSidebar.addEventListener('click', toggleSidebar);
    }
    
    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', toggleSidebar);
    }

    // Navigation functionality
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', handleNavClick);
    });

    // Initialize other admin components
    initializeDataTables();
    initializeModals();
}

/**
 * Toggle sidebar visibility
 */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mobileOverlay = document.getElementById('mobileOverlay');
    
    if (sidebar && mobileOverlay) {
        sidebar.classList.toggle('-translate-x-full');
        mobileOverlay.classList.toggle('hidden');
        document.body.style.overflow = 
            document.body.style.overflow === 'hidden' ? '' : 'hidden';
    }
}

/**
 * Handle navigation item clicks
 */
function handleNavClick(e) {
    e.preventDefault();
    const sectionName = this.getAttribute('data-section');
    showSection(sectionName);
    updateActiveNav(this);
}

/**
 * Show the specified section
 */
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show the selected section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update page title
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        const navItem = document.querySelector(`[data-section="${sectionName}"]`);
        if (navItem) {
            pageTitle.textContent = navItem.textContent.trim();
        }
    }
}

/**
 * Update active navigation item
 */
function updateActiveNav(clickedItem) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        item.classList.add('text-slate-300', 'hover:bg-slate-700', 'hover:text-white');
    });
    
    clickedItem.classList.add('active', 'text-white', 'bg-slate-800');
    clickedItem.classList.remove('text-slate-300', 'hover:bg-slate-700', 'hover:text-white');
}

/**
 * Initialize DataTables if available
 */
function initializeDataTables() {
    if (typeof $ !== 'undefined' && $.fn.DataTable) {
        $('.datatable').DataTable({
            responsive: true,
            pageLength: 10,
            language: {
                search: "_INPUT_",
                searchPlaceholder: "Search..."
            }
        });
    }
}

/**
 * Initialize modal dialogs
 */
function initializeModals() {
    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.add('hidden');
        }
    });
    
    // Close buttons
    document.querySelectorAll('.modal-close, .btn-close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.add('hidden');
            }
        });
    });
}

/**
 * Show notification message
 */
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeAdminDashboard);

// Make functions available globally
window.showNotification = showNotification;
