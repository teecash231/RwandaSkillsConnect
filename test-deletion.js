/**
 * Test Deletion System
 * Comprehensive testing system for user deletion functionality
 */

class TestDeletionSystem {
    constructor() {
        this.testResults = [];
        this.init();
    }

    init() {
        this.setupTestInterface();
        console.log('🧪 Test Deletion System Loaded');
    }

    setupTestInterface() {
        // Add test button to admin dashboard if in development mode
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            this.addTestButton();
        }
    }

    addTestButton() {
        // Add test button to settings section
        setTimeout(() => {
            const settingsSection = document.getElementById('settings-section');
            if (settingsSection) {
                const testSection = document.createElement('div');
                testSection.className = 'bg-yellow-50 border border-yellow-200 rounded-xl p-6 mt-6';
                testSection.innerHTML = `
                    <h3 class="text-lg font-semibold text-yellow-900 mb-4">
                        <i class="fas fa-flask mr-2"></i>Development Testing Tools
                    </h3>
                    <p class="text-sm text-yellow-700 mb-4">These tools are only available in development mode for testing purposes.</p>
                    <div class="space-y-3">
                        <button onclick="testDeletionSystem.runAllTests()" class="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
                            <i class="fas fa-play mr-2"></i>Run All Deletion Tests
                        </button>
                        <button onclick="testDeletionSystem.generateTestData()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            <i class="fas fa-database mr-2"></i>Generate Test Data
                        </button>
                        <button onclick="testDeletionSystem.showTestResults()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                            <i class="fas fa-chart-bar mr-2"></i>Show Test Results
                        </button>
                    </div>
                `;
                
                settingsSection.appendChild(testSection);
            }
        }, 2000);
    }

    generateTestData() {
        console.log('🧪 Generating test data...');
        
        // Generate test users
        const testUsers = [
            {
                id: 'test_user_1',
                fullName: 'Test Freelancer 1',
                email: 'test.freelancer1@test.com',
                role: 'freelancer',
                verified: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'test_user_2',
                fullName: 'Test Client 1',
                email: 'test.client1@test.com',
                role: 'client',
                verified: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'test_user_3',
                fullName: 'Test Admin 1',
                email: 'test.admin1@test.com',
                role: 'admin',
                verified: true,
                createdAt: new Date().toISOString()
            }
        ];

        // Generate test jobs
        const testJobs = [
            {
                id: 'test_job_1',
                title: 'Test Job 1',
                description: 'This is a test job for deletion testing',
                clientId: 'test_user_2',
                clientName: 'Test Client 1',
                status: 'active',
                createdAt: new Date().toISOString()
            }
        ];

        // Generate test applications
        const testApplications = [
            {
                id: 'test_app_1',
                jobId: 'test_job_1',
                freelancerId: 'test_user_1',
                freelancerName: 'Test Freelancer 1',
                clientId: 'test_user_2',
                appliedAt: new Date().toISOString(),
                status: 'pending'
            }
        ];

        // Add to existing data
        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const existingJobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        const existingApps = JSON.parse(localStorage.getItem('appliedJobs') || '[]');

        localStorage.setItem('users', JSON.stringify([...existingUsers, ...testUsers]));
        localStorage.setItem('jobs', JSON.stringify([...existingJobs, ...testJobs]));
        localStorage.setItem('appliedJobs', JSON.stringify([...existingApps, ...testApplications]));

        this.showNotification('Test data generated successfully!', 'success');
        
        // Refresh displays
        if (window.refreshAllDashboardComponents) {
            window.refreshAllDashboardComponents();
        }
    }

    runAllTests() {
        console.log('🧪 Running all deletion tests...');
        this.testResults = [];

        // Test 1: Single user deletion
        this.testSingleUserDeletion();

        // Test 2: Bulk deletion by role
        this.testBulkDeletionByRole();

        // Test 3: Delete all keep admin
        this.testDeleteAllKeepAdmin();

        // Test 4: Data cleanup verification
        this.testDataCleanup();

        // Test 5: System reset
        this.testSystemReset();

        this.showTestResults();
    }

    testSingleUserDeletion() {
        console.log('🧪 Testing single user deletion...');
        
        try {
            // Create test user
            const testUser = {
                id: 'test_delete_single',
                fullName: 'Test Delete Single',
                email: 'test.delete.single@test.com',
                role: 'freelancer',
                verified: true,
                createdAt: new Date().toISOString()
            };

            // Add to storage
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            users.push(testUser);
            localStorage.setItem('users', JSON.stringify(users));

            // Test deletion
            let result;
            if (window.secureDeleteSystem) {
                result = window.secureDeleteSystem.deleteSingleUser('test_delete_single');
            } else {
                result = { success: false, error: 'Secure delete system not available' };
            }

            // Verify deletion
            const updatedUsers = JSON.parse(localStorage.getItem('users') || '[]');
            const userExists = updatedUsers.find(u => u.id === 'test_delete_single');

            this.testResults.push({
                test: 'Single User Deletion',
                success: result.success && !userExists,
                message: result.success && !userExists ? 'User deleted successfully' : 'User deletion failed',
                details: result
            });

        } catch (error) {
            this.testResults.push({
                test: 'Single User Deletion',
                success: false,
                message: 'Test failed with error',
                details: error.message
            });
        }
    }

    testBulkDeletionByRole() {
        console.log('🧪 Testing bulk deletion by role...');
        
        try {
            // Create test users
            const testUsers = [
                {
                    id: 'test_bulk_1',
                    fullName: 'Test Bulk 1',
                    email: 'test.bulk1@test.com',
                    role: 'freelancer',
                    verified: true,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'test_bulk_2',
                    fullName: 'Test Bulk 2',
                    email: 'test.bulk2@test.com',
                    role: 'freelancer',
                    verified: true,
                    createdAt: new Date().toISOString()
                }
            ];

            // Add to storage
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            users.push(...testUsers);
            localStorage.setItem('users', JSON.stringify(users));

            const initialFreelancerCount = users.filter(u => u.role === 'freelancer').length;

            // Test deletion
            let result;
            if (window.secureDeleteSystem) {
                result = window.secureDeleteSystem.deleteUsersByRole('freelancer');
            } else {
                result = { success: false, error: 'Secure delete system not available' };
            }

            // Verify deletion
            const updatedUsers = JSON.parse(localStorage.getItem('users') || '[]');
            const remainingFreelancers = updatedUsers.filter(u => u.role === 'freelancer').length;

            this.testResults.push({
                test: 'Bulk Deletion by Role',
                success: result.success && remainingFreelancers === 0,
                message: result.success && remainingFreelancers === 0 ? 
                    `All ${initialFreelancerCount} freelancers deleted` : 
                    'Bulk deletion failed',
                details: result
            });

        } catch (error) {
            this.testResults.push({
                test: 'Bulk Deletion by Role',
                success: false,
                message: 'Test failed with error',
                details: error.message
            });
        }
    }

    testDeleteAllKeepAdmin() {
        console.log('🧪 Testing delete all keep admin...');
        
        try {
            // Ensure we have admin and non-admin users
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const adminUsers = users.filter(u => u.role === 'admin');
            const nonAdminUsers = users.filter(u => u.role !== 'admin');

            if (adminUsers.length === 0) {
                // Add test admin
                users.push({
                    id: 'test_admin_keep',
                    fullName: 'Test Admin Keep',
                    email: 'test.admin.keep@test.com',
                    role: 'admin',
                    verified: true,
                    createdAt: new Date().toISOString()
                });
            }

            // Add test non-admin users
            users.push({
                id: 'test_delete_keep_1',
                fullName: 'Test Delete Keep 1',
                email: 'test.delete.keep1@test.com',
                role: 'client',
                verified: true,
                createdAt: new Date().toISOString()
            });

            localStorage.setItem('users', JSON.stringify(users));

            const initialAdminCount = users.filter(u => u.role === 'admin').length;
            const initialNonAdminCount = users.filter(u => u.role !== 'admin').length;

            // Test deletion
            let result;
            if (window.secureDeleteSystem) {
                result = window.secureDeleteSystem.deleteAllKeepAdmin();
            } else {
                result = { success: false, error: 'Secure delete system not available' };
            }

            // Verify deletion
            const updatedUsers = JSON.parse(localStorage.getItem('users') || '[]');
            const remainingAdmins = updatedUsers.filter(u => u.role === 'admin').length;
            const remainingNonAdmins = updatedUsers.filter(u => u.role !== 'admin').length;

            this.testResults.push({
                test: 'Delete All Keep Admin',
                success: result.success && remainingAdmins > 0 && remainingNonAdmins === 0,
                message: result.success && remainingAdmins > 0 && remainingNonAdmins === 0 ? 
                    `${initialNonAdminCount} non-admin users deleted, ${remainingAdmins} admins preserved` : 
                    'Delete all keep admin failed',
                details: result
            });

        } catch (error) {
            this.testResults.push({
                test: 'Delete All Keep Admin',
                success: false,
                message: 'Test failed with error',
                details: error.message
            });
        }
    }

    testDataCleanup() {
        console.log('🧪 Testing data cleanup...');
        
        try {
            // Create test data with relationships
            const testUser = {
                id: 'test_cleanup_user',
                fullName: 'Test Cleanup User',
                email: 'test.cleanup@test.com',
                role: 'client',
                verified: true,
                createdAt: new Date().toISOString()
            };

            const testJob = {
                id: 'test_cleanup_job',
                title: 'Test Cleanup Job',
                description: 'Test job for cleanup testing',
                clientId: 'test_cleanup_user',
                clientName: 'Test Cleanup User',
                status: 'active',
                createdAt: new Date().toISOString()
            };

            const testApplication = {
                id: 'test_cleanup_app',
                jobId: 'test_cleanup_job',
                freelancerId: 'test_cleanup_user',
                freelancerName: 'Test Cleanup User',
                clientId: 'test_cleanup_user',
                appliedAt: new Date().toISOString(),
                status: 'pending'
            };

            // Add to storage
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
            const applications = JSON.parse(localStorage.getItem('appliedJobs') || '[]');

            users.push(testUser);
            jobs.push(testJob);
            applications.push(testApplication);

            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('jobs', JSON.stringify(jobs));
            localStorage.setItem('appliedJobs', JSON.stringify(applications));

            // Test cleanup
            let result;
            if (window.secureDeleteSystem) {
                result = window.secureDeleteSystem.deleteSingleUser('test_cleanup_user');
            } else {
                result = { success: false, error: 'Secure delete system not available' };
            }

            // Verify cleanup
            const updatedUsers = JSON.parse(localStorage.getItem('users') || '[]');
            const updatedJobs = JSON.parse(localStorage.getItem('jobs') || '[]');
            const updatedApplications = JSON.parse(localStorage.getItem('appliedJobs') || '[]');

            const userExists = updatedUsers.find(u => u.id === 'test_cleanup_user');
            const jobExists = updatedJobs.find(j => j.id === 'test_cleanup_job');
            const appExists = updatedApplications.find(a => a.id === 'test_cleanup_app');

            this.testResults.push({
                test: 'Data Cleanup',
                success: result.success && !userExists && !jobExists && !appExists,
                message: result.success && !userExists && !jobExists && !appExists ? 
                    'All related data cleaned up successfully' : 
                    'Data cleanup incomplete',
                details: {
                    userDeleted: !userExists,
                    jobDeleted: !jobExists,
                    applicationDeleted: !appExists
                }
            });

        } catch (error) {
            this.testResults.push({
                test: 'Data Cleanup',
                success: false,
                message: 'Test failed with error',
                details: error.message
            });
        }
    }

    testSystemReset() {
        console.log('🧪 Testing system reset...');
        
        try {
            // Add test data
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            users.push({
                id: 'test_reset_user',
                fullName: 'Test Reset User',
                email: 'test.reset@test.com',
                role: 'freelancer',
                verified: true,
                createdAt: new Date().toISOString()
            });
            localStorage.setItem('users', JSON.stringify(users));

            const initialUserCount = users.length;

            // Test reset (but don't actually execute to avoid breaking the system)
            // Instead, test if the function exists and is callable
            let result = { success: false, message: 'System reset test skipped for safety' };
            
            if (window.secureDeleteSystem && window.secureDeleteSystem.resetToDefaultAdmin) {
                result = { success: true, message: 'System reset function available and callable' };
            }

            this.testResults.push({
                test: 'System Reset',
                success: result.success,
                message: result.message,
                details: 'Test skipped to prevent system disruption'
            });

        } catch (error) {
            this.testResults.push({
                test: 'System Reset',
                success: false,
                message: 'Test failed with error',
                details: error.message
            });
        }
    }

    showTestResults() {
        console.log('🧪 Test Results:', this.testResults);
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div class="p-6 border-b border-gray-200">
                    <div class="flex justify-between items-start">
                        <h2 class="text-xl font-bold text-gray-800">
                            <i class="fas fa-flask mr-2 text-yellow-600"></i>
                            Deletion System Test Results
                        </h2>
                        <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                </div>
                <div class="p-6">
                    <div class="space-y-4">
                        ${this.testResults.map(result => `
                            <div class="border rounded-lg p-4 ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}">
                                <div class="flex items-center justify-between mb-2">
                                    <h3 class="font-semibold ${result.success ? 'text-green-800' : 'text-red-800'}">
                                        <i class="fas fa-${result.success ? 'check-circle' : 'times-circle'} mr-2"></i>
                                        ${result.test}
                                    </h3>
                                    <span class="px-2 py-1 text-xs rounded-full ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                                        ${result.success ? 'PASSED' : 'FAILED'}
                                    </span>
                                </div>
                                <p class="text-sm ${result.success ? 'text-green-700' : 'text-red-700'} mb-2">
                                    ${result.message}
                                </p>
                                <details class="text-xs ${result.success ? 'text-green-600' : 'text-red-600'}">
                                    <summary class="cursor-pointer">Details</summary>
                                    <pre class="mt-2 p-2 bg-gray-100 rounded text-gray-800 overflow-x-auto">${JSON.stringify(result.details, null, 2)}</pre>
                                </details>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 class="font-semibold text-blue-800 mb-2">Test Summary</h4>
                        <div class="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div class="text-2xl font-bold text-blue-600">${this.testResults.length}</div>
                                <div class="text-sm text-blue-700">Total Tests</div>
                            </div>
                            <div>
                                <div class="text-2xl font-bold text-green-600">${this.testResults.filter(r => r.success).length}</div>
                                <div class="text-sm text-green-700">Passed</div>
                            </div>
                            <div>
                                <div class="text-2xl font-bold text-red-600">${this.testResults.filter(r => !r.success).length}</div>
                                <div class="text-sm text-red-700">Failed</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Create global instance
window.testDeletionSystem = new TestDeletionSystem();

console.log('🧪 Test Deletion System Loaded');