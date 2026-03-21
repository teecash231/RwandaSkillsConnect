# Rwanda SkillsConnect - Admin Credentials & System Information

## 🔐 Default Admin Login Credentials

**Email:** `admin@skillsconnect.rw`  
**Password:** `admin123`

## 🚀 Quick Access Links

- **Admin Setup Page:** [admin-setup.html](admin-setup.html)
- **Login Page:** [login.html](login.html)
- **Admin Dashboard:** [admin-dashboard.html](admin-dashboard.html)

## 📋 Login Instructions

### Method 1: Direct Login
1. Open [login.html](login.html) in your browser
2. Enter the credentials above
3. Click "Sign In"
4. You will be automatically redirected to the admin dashboard

### Method 2: Quick Fill (Recommended)
1. Open [login.html](login.html) in your browser
2. Click the "Fill Admin Credentials" button in the blue box
3. Click "Sign In"
4. Automatic redirect to admin dashboard

### Method 3: Admin Setup Page
1. Open [admin-setup.html](admin-setup.html) in your browser
2. View system status and credentials
3. Click "Go to Login" button
4. Use the displayed credentials to log in

## 🔧 System Features

### Authentication System
- **Dual Authentication:** Supports both Supabase and local authentication
- **Automatic Fallback:** If Supabase fails, local auth is used automatically
- **Session Management:** Secure session handling with role-based redirects
- **Default Admin Setup:** Automatically creates admin account if none exists

### Admin Dashboard Features
- **User Management:** View, edit, delete, and manage all users
- **Job Management:** Approve/reject job postings, manage job listings
- **Analytics & Reports:** Comprehensive platform analytics
- **System Settings:** Platform configuration and settings
- **Bulk Operations:** Mass user operations and data management

### Security Features
- **Role-Based Access:** Admin, Client, Freelancer role separation
- **Secure Deletion:** Permanent data deletion with audit trails
- **Session Protection:** Dashboard access protection
- **Data Validation:** Input validation and sanitization

## 🛠️ Technical Details

### File Structure
```
rwanda-skillsconnect/
├── admin-setup.html          # Admin setup and credentials page
├── admin-dashboard.html      # Main admin dashboard
├── login.html               # Enhanced login with local auth
├── local-auth.js            # Local authentication system
├── setup-default-admin.js   # Admin setup utilities
└── assets/js/
    ├── admin-dashboard.js   # Admin dashboard functionality
    ├── user-management.js   # User management system
    └── admin-*.js          # Other admin modules
```

### Database Schema
- **Users Table:** Stores all user accounts with roles
- **Jobs Table:** Job postings and applications
- **Local Storage:** Browser-based data storage for development

### Default Admin Account Details
```json
{
  "id": "admin_default_001",
  "fullName": "System Administrator",
  "email": "admin@skillsconnect.rw",
  "password": "admin123",
  "role": "admin",
  "verified": true,
  "phone": "+250788123456",
  "createdAt": "2024-11-24T19:25:00.000Z"
}
```

## 🔄 System Status Check

### Automatic Setup
The system automatically:
1. Creates default admin account if none exists
2. Sets up authentication system
3. Initializes dashboard components
4. Configures role-based access control

### Manual Setup
If needed, you can manually:
1. Run `setupDefaultAdmin()` in browser console
2. Use the admin-setup.html page
3. Check system status with `completeSystemCheck()`

## 🚨 Important Security Notes

### Production Deployment
**⚠️ CRITICAL:** Before deploying to production:

1. **Change Default Password:**
   ```javascript
   resetAdminPassword('admin@skillsconnect.rw', 'your-secure-password');
   ```

2. **Update Admin Email:**
   - Change from `admin@skillsconnect.rw` to your actual admin email
   - Update in both local storage and Supabase (if used)

3. **Remove Setup Files:**
   - Delete `admin-setup.html`
   - Delete `setup-default-admin.js`
   - Remove admin credential displays from login page

4. **Enable HTTPS:**
   - Use SSL certificates
   - Secure all authentication endpoints

### Development vs Production
- **Development:** Uses local storage for data persistence
- **Production:** Should use Supabase or proper database
- **Authentication:** Dual system supports both environments

## 🔍 Troubleshooting

### Login Issues
1. **Clear Browser Cache:** Clear localStorage and try again
2. **Check Console:** Open browser dev tools for error messages
3. **Verify Credentials:** Ensure exact email/password match
4. **Reset Admin:** Use `setupDefaultAdmin()` to recreate admin

### Dashboard Access Issues
1. **Check Session:** Verify user session in localStorage
2. **Role Verification:** Ensure user has 'admin' role
3. **File Permissions:** Check if admin files are accessible
4. **JavaScript Errors:** Check browser console for errors

### Common Solutions
```javascript
// Reset everything and create fresh admin
localStorage.clear();
setupDefaultAdmin();

// Check current admin accounts
checkAdminAccounts();

// Test login functionality
testAdminLogin('admin@skillsconnect.rw', 'admin123');
```

## 📞 Support

### Browser Console Commands
```javascript
// Setup admin account
setupDefaultAdmin()

// Check system status
completeSystemCheck()

// View all admin accounts
checkAdminAccounts()

// Test login
testAdminLogin()

// Reset password
resetAdminPassword('admin@skillsconnect.rw', 'newpassword')
```

### File Locations
- **Main Config:** `js/config.js`
- **Auth System:** `js/auth.js`, `local-auth.js`
- **Admin Dashboard:** `admin-dashboard.html`
- **User Management:** `assets/js/user-management.js`

---

## ✅ Quick Start Checklist

- [ ] Open [admin-setup.html](admin-setup.html) to verify system
- [ ] Note the admin credentials: `admin@skillsconnect.rw` / `admin123`
- [ ] Go to [login.html](login.html) and use credentials
- [ ] Access admin dashboard successfully
- [ ] Change default password for security
- [ ] Explore admin features and user management

**System Status:** ✅ Ready for use  
**Last Updated:** November 24, 2024  
**Version:** 1.0.0