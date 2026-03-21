/**
 * Default Admin Setup Script
 * Sets up a default admin account for the Rwanda SkillsConnect platform
 */

// Secure credential generation
function generateSecurePassword(length = 12) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
}

// Get or create admin credentials
function getAdminCredentials() {
    // Check if credentials already exist in secure storage
    let storedCredentials = localStorage.getItem('admin_setup_credentials');
    
    if (storedCredentials) {
        return JSON.parse(storedCredentials);
    }
    
    // Generate new secure credentials
    const credentials = {
        email: 'admin@skillsconnect.rw',
        password: generateSecurePassword(16)
    };
    
    // Store for this session only
    localStorage.setItem('admin_setup_credentials', JSON.stringify(credentials));
    return credentials;
}

// Default admin template
function createDefaultAdmin() {
    const credentials = getAdminCredentials();
    
    return {
        id: 'admin_default_001',
        fullName: 'System Administrator',
        email: credentials.email,
        password: credentials.password,
        role: 'admin',
        verified: true,
        createdAt: new Date().toISOString(),
        lastLogin: null,
        phone: '+250788123456',
        profileComplete: true
    };
}

/**
 * Setup default admin account
 */
function setupDefaultAdmin() {
    try {
        // Get existing users
        let users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Create default admin with secure credentials
        const DEFAULT_ADMIN = createDefaultAdmin();
        
        // Check if admin already exists
        const existingAdmin = users.find(user => user.email === DEFAULT_ADMIN.email);
        
        if (existingAdmin) {
            console.log('✅ Default admin already exists:', DEFAULT_ADMIN.email);
            return {
                success: true,
                message: 'Default admin already exists',
                credentials: {
                    email: DEFAULT_ADMIN.email,
                    password: DEFAULT_ADMIN.password
                }
            };
        }
        
        // Add default admin
        users.push(DEFAULT_ADMIN);
        localStorage.setItem('users', JSON.stringify(users));
        
        console.log('✅ Default admin created successfully!');
        console.log('📧 Email:', DEFAULT_ADMIN.email);
        console.log('🔑 Password: [Generated - Check console output]');
        
        return {
            success: true,
            message: 'Default admin created successfully',
            credentials: {
                email: DEFAULT_ADMIN.email,
                password: DEFAULT_ADMIN.password
            }
        };
        
    } catch (error) {
        console.error('❌ Error setting up default admin:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Check current admin accounts
 */
function checkAdminAccounts() {
    try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const admins = users.filter(user => user.role === 'admin');
        
        console.log('👥 Current Admin Accounts:');
        if (admins.length === 0) {
            console.log('❌ No admin accounts found');
            return { admins: [], count: 0 };
        }
        
        admins.forEach((admin, index) => {
            console.log(`${index + 1}. ${admin.fullName} (${admin.email}) - ${admin.verified ? 'Verified' : 'Unverified'}`);
        });
        
        return { admins, count: admins.length };
        
    } catch (error) {
        console.error('❌ Error checking admin accounts:', error);
        return { admins: [], count: 0, error: error.message };
    }
}

/**
 * Test admin login functionality
 */
function testAdminLogin(email, password) {
    // Get current credentials if not provided
    if (!email || !password) {
        const credentials = getAdminCredentials();
        email = email || credentials.email;
        password = password || credentials.password;
    }
    try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const admin = users.find(user => user.email === email && user.role === 'admin');
        
        if (!admin) {
            console.log('❌ Admin account not found');
            return { success: false, error: 'Admin account not found' };
        }
        
        if (admin.password !== password) {
            console.log('❌ Invalid password');
            return { success: false, error: 'Invalid password' };
        }
        
        if (!admin.verified) {
            console.log('⚠️ Admin account not verified');
            return { success: false, error: 'Admin account not verified' };
        }
        
        console.log('✅ Admin login test successful!');
        return {
            success: true,
            admin: {
                id: admin.id,
                name: admin.fullName,
                email: admin.email,
                role: admin.role
            }
        };
        
    } catch (error) {
        console.error('❌ Error testing admin login:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Reset admin password
 */
function resetAdminPassword(email, newPassword) {
    try {
        let users = JSON.parse(localStorage.getItem('users') || '[]');
        const adminIndex = users.findIndex(user => user.email === email && user.role === 'admin');
        
        if (adminIndex === -1) {
            console.log('❌ Admin account not found');
            return { success: false, error: 'Admin account not found' };
        }
        
        users[adminIndex].password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));
        
        console.log('✅ Admin password reset successfully!');
        return {
            success: true,
            message: 'Admin password reset successfully',
            credentials: {
                email: email,
                password: newPassword
            }
        };
        
    } catch (error) {
        console.error('❌ Error resetting admin password:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Complete system check and setup
 */
function completeSystemCheck() {
    console.log('🔍 Rwanda SkillsConnect - System Check');
    console.log('=====================================');
    
    // Check existing admins
    const adminCheck = checkAdminAccounts();
    
    // Setup default admin if none exists
    if (adminCheck.count === 0) {
        console.log('\n🚀 Setting up default admin...');
        const setupResult = setupDefaultAdmin();
        
        if (setupResult.success) {
            console.log('\n✅ Default Admin Credentials:');
            console.log('📧 Email:', setupResult.credentials.email);
            console.log('🔑 Password:', setupResult.credentials.password);
            
            // Test the login
            console.log('\n🧪 Testing admin login...');
            testAdminLogin();
        }
    } else {
        console.log('\n✅ Admin accounts already exist');
        
        // Test default admin login if it exists
        const credentials = getAdminCredentials();
        const defaultAdmin = adminCheck.admins.find(admin => admin.email === credentials.email);
        if (defaultAdmin) {
            console.log('\n🧪 Testing default admin login...');
            const loginTest = testAdminLogin();
            
            if (loginTest.success) {
                console.log('\n✅ Default Admin Credentials:');
                console.log('📧 Email:', credentials.email);
                console.log('🔑 Password:', credentials.password);
            }
        }
    }
    
    console.log('\n📋 System Status:');
    console.log('- Total Users:', JSON.parse(localStorage.getItem('users') || '[]').length);
    console.log('- Admin Accounts:', adminCheck.count);
    console.log('- Authentication System: Ready');
    
    const credentials = getAdminCredentials();
    
    return {
        totalUsers: JSON.parse(localStorage.getItem('users') || '[]').length,
        adminCount: adminCheck.count,
        defaultAdminExists: adminCheck.admins.some(admin => admin.email === credentials.email),
        credentials: {
            email: credentials.email,
            password: credentials.password
        }
    };
}

// Make functions globally available
window.setupDefaultAdmin = setupDefaultAdmin;
window.checkAdminAccounts = checkAdminAccounts;
window.testAdminLogin = testAdminLogin;
window.resetAdminPassword = resetAdminPassword;
window.completeSystemCheck = completeSystemCheck;

// Auto-run system check when script loads
document.addEventListener('DOMContentLoaded', () => {
    // Run system check after a short delay
    setTimeout(() => {
        const result = completeSystemCheck();
        
        // Display credentials in a user-friendly way
        if (result.defaultAdminExists || result.adminCount > 0) {
            console.log('\n🎯 ADMIN LOGIN INSTRUCTIONS:');
            console.log('1. Go to login.html');
            console.log('2. Use these credentials:');
            console.log('   Email:', result.credentials.email);
            console.log('   Password:', result.credentials.password);
            console.log('3. You will be redirected to admin-dashboard.html');
        }
    }, 1000);
});

console.log('🔧 Default Admin Setup Script Loaded');