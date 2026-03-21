/**
 * Configuration file for Rwanda SkillsConnect
 * Set your environment variables here or in your deployment environment
 */

// Supabase Configuration
// IMPORTANT: Set these values in your environment variables for production
// For development, you can set them here temporarily, but never commit real credentials to version control

window.SUPABASE_URL = process?.env?.SUPABASE_URL || 'YOUR_SUPABASE_URL_HERE';
window.SUPABASE_ANON_KEY = process?.env?.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY_HERE';

// Development mode flag
window.DEV_MODE = true;

// Email service configuration (for fallback)
window.EMAIL_CONFIG = {
    enabled: false,
    service: 'local' // 'local' for development, 'smtp' for production
};

console.log('Configuration loaded');