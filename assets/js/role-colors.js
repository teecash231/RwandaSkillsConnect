/**
 * Role-based color system for Rwanda SkillsConnect
 */

// Role color definitions
const ROLE_COLORS = {
  admin: {
    primary: '#dc2626',
    secondary: '#b91c1c',
    light: '#fee2e2',
    text: '#991b1b'
  },
  client: {
    primary: '#2563eb',
    secondary: '#1d4ed8',
    light: '#dbeafe',
    text: '#1e40af'
  },
  freelancer: {
    primary: '#059669',
    secondary: '#047857',
    light: '#d1fae5',
    text: '#065f46'
  }
};

// Apply role-based colors to elements
function applyRoleColors(role) {
  if (!role || !ROLE_COLORS[role]) return;
  
  const colors = ROLE_COLORS[role];
  const root = document.documentElement;
  
  // Set CSS custom properties
  root.style.setProperty('--role-primary', colors.primary);
  root.style.setProperty('--role-secondary', colors.secondary);
  root.style.setProperty('--role-light', colors.light);
  root.style.setProperty('--role-text', colors.text);
}

// Get role color classes for badges
function getRoleColorClasses(role) {
  const colorMap = {
    admin: 'bg-red-100 text-red-800',
    client: 'bg-blue-100 text-blue-800',
    freelancer: 'bg-green-100 text-green-800'
  };
  
  return colorMap[role] || 'bg-gray-100 text-gray-800';
}

// Initialize role colors on page load
function initializeRoleColors() {
  const session = JSON.parse(localStorage.getItem('userSession') || 'null');
  if (session && session.role) {
    applyRoleColors(session.role);
  }
}

// Export functions
window.roleColorManager = {
  applyRoleColors,
  getRoleColorClasses,
  initializeRoleColors
};

// Auto-initialize
document.addEventListener('DOMContentLoaded', initializeRoleColors);