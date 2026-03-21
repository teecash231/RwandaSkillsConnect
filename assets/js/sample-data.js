/**
 * Sample Data for Rwanda SkillsConnect
 * Creates sample jobs and users for testing
 */

function initializeSampleData() {
    // Only initialize if no data exists
    if (localStorage.getItem('dataInitialized')) return;
    
    // Sample users
    const sampleUsers = [
        {
            id: 'admin_default',
            fullName: 'System Administrator',
            email: 'admin@skillsconnect.rw',
            phone: '+250788000000',
            role: 'admin',
            password: 'admin123',
            verified: true,
            emailVerified: true,
            createdAt: new Date().toISOString(),
            isDefault: true
        },
        {
            id: 'client_demo',
            fullName: 'John Client',
            email: 'client@test.com',
            phone: '+250788111111',
            role: 'client',
            password: 'client123',
            verified: true,
            emailVerified: true,
            createdAt: new Date().toISOString(),
            isDefault: true
        },
        {
            id: 'freelancer_demo',
            fullName: 'Jane Freelancer',
            email: 'freelancer@test.com',
            phone: '+250788222222',
            role: 'freelancer',
            password: 'freelancer123',
            verified: true,
            emailVerified: true,
            professionalTitle: 'Full Stack Developer',
            location: 'Kigali',
            experienceLevel: 'Mid Level',
            bio: 'Experienced web developer with expertise in React, Node.js, and Python.',
            skills: 'JavaScript, React, Node.js, Python, HTML, CSS',
            hourlyRate: '25000',
            createdAt: new Date().toISOString(),
            isDefault: true
        }
    ];
    
    // Sample jobs
    const sampleJobs = [
        {
            id: 'job_1',
            title: 'E-commerce Website Development',
            description: 'We need a modern e-commerce website built with React and Node.js. The site should include user authentication, product catalog, shopping cart, and payment integration.',
            skills: 'React, Node.js, JavaScript, MongoDB, Payment Integration',
            location: 'Kigali',
            salary: '800000',
            clientId: 'client_demo',
            clientName: 'John Client',
            category: 'web-development',
            experienceLevel: 'Mid Level',
            duration: '2-3 months',
            projectType: 'fixed',
            status: 'active',
            adminApproved: true,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
        },
        {
            id: 'job_2',
            title: 'Mobile App UI/UX Design',
            description: 'Looking for a talented designer to create modern and intuitive UI/UX designs for our mobile application. Experience with Figma and mobile design principles required.',
            skills: 'UI/UX Design, Figma, Mobile Design, Prototyping',
            location: 'Remote',
            salary: '600000',
            clientId: 'client_demo',
            clientName: 'John Client',
            category: 'graphic-design',
            experienceLevel: 'Senior Level',
            duration: '1 month',
            projectType: 'fixed',
            status: 'active',
            adminApproved: true,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
        },
        {
            id: 'job_3',
            title: 'Digital Marketing Campaign',
            description: 'Need an experienced digital marketer to create and manage social media campaigns for our startup. Must have experience with Facebook Ads, Google Ads, and content creation.',
            skills: 'Digital Marketing, Social Media, Facebook Ads, Google Ads, Content Creation',
            location: 'Huye',
            salary: '450000',
            clientId: 'client_demo',
            clientName: 'John Client',
            category: 'digital-marketing',
            experienceLevel: 'Mid Level',
            duration: '3 months',
            projectType: 'hourly',
            status: 'active',
            adminApproved: true,
            createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() // 3 hours ago
        },
        {
            id: 'job_4',
            title: 'Python Data Analysis Script',
            description: 'We need a Python script to analyze sales data and generate reports. The script should process CSV files and create visualizations using matplotlib or similar libraries.',
            skills: 'Python, Data Analysis, Pandas, Matplotlib, CSV Processing',
            location: 'Remote',
            salary: '300000',
            clientId: 'client_demo',
            clientName: 'John Client',
            category: 'data-science',
            experienceLevel: 'Entry Level',
            duration: '2 weeks',
            projectType: 'fixed',
            status: 'active',
            adminApproved: true,
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6 hours ago
        },
        {
            id: 'job_5',
            title: 'WordPress Website Maintenance',
            description: 'Looking for someone to maintain and update our WordPress website. Tasks include plugin updates, security monitoring, content updates, and performance optimization.',
            skills: 'WordPress, PHP, HTML, CSS, Website Maintenance',
            location: 'Musanze',
            salary: '200000',
            clientId: 'client_demo',
            clientName: 'John Client',
            category: 'web-development',
            experienceLevel: 'Entry Level',
            duration: 'Ongoing',
            projectType: 'hourly',
            status: 'active',
            adminApproved: true,
            createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() // 12 hours ago
        }
    ];
    
    // Initialize data if not exists
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const existingJobs = JSON.parse(localStorage.getItem('jobs') || '[]');
    
    // Add sample users if they don't exist
    sampleUsers.forEach(user => {
        if (!existingUsers.find(u => u.email === user.email)) {
            existingUsers.push(user);
        }
    });
    
    // Add sample jobs
    sampleJobs.forEach(job => {
        if (!existingJobs.find(j => j.id === job.id)) {
            existingJobs.push(job);
        }
    });
    
    // Save to localStorage
    localStorage.setItem('users', JSON.stringify(existingUsers));
    localStorage.setItem('jobs', JSON.stringify(existingJobs));
    
    // Initialize empty arrays for other data if they don't exist
    if (!localStorage.getItem('appliedJobs')) {
        localStorage.setItem('appliedJobs', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('conversations')) {
        localStorage.setItem('conversations', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('settings')) {
        localStorage.setItem('settings', JSON.stringify({
            jobApprovalRequired: true,
            emailNotifications: true,
            theme: 'light'
        }));
    }
    
    // Mark data as initialized
    localStorage.setItem('dataInitialized', 'true');
    
    console.log('Sample data initialized successfully');
}

// Auto-initialize when script loads
document.addEventListener('DOMContentLoaded', function() {
    initializeSampleData();
});

// Make function globally available
window.initializeSampleData = initializeSampleData;