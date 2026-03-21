/**
 * Sample Data Initialization for Admin Dashboard
 * Creates sample users and jobs if none exist
 */

function initializeSampleData() {
    console.log('Initializing sample data...');
    
    // Check if data already exists
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const existingJobs = JSON.parse(localStorage.getItem('jobs') || '[]');
    
    if (existingUsers.length === 0) {
        createSampleUsers();
    }
    
    if (existingJobs.length === 0) {
        createSampleJobs();
    }
    
    console.log('Sample data initialization complete');
}

function createSampleUsers() {
    const sampleUsers = [
        {
            id: 'admin_001',
            fullName: 'System Administrator',
            email: 'admin@skillsconnect.rw',
            password: 'admin123',
            role: 'admin',
            verified: true,
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            phone: '+250788123456'
        },
        {
            id: 'client_001',
            fullName: 'John Uwimana',
            email: 'john.uwimana@company.rw',
            password: 'client123',
            role: 'client',
            verified: true,
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            phone: '+250788234567'
        },
        {
            id: 'client_002',
            fullName: 'Marie Mukamana',
            email: 'marie.mukamana@business.rw',
            password: 'client123',
            role: 'client',
            verified: true,
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            phone: '+250788345678'
        },
        {
            id: 'freelancer_001',
            fullName: 'David Nkurunziza',
            email: 'david.nkurunziza@gmail.com',
            password: 'freelancer123',
            role: 'freelancer',
            verified: true,
            createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            phone: '+250788456789',
            skills: 'Web Development, JavaScript, React',
            hourlyRate: 25
        },
        {
            id: 'freelancer_002',
            fullName: 'Grace Uwimana',
            email: 'grace.uwimana@gmail.com',
            password: 'freelancer123',
            role: 'freelancer',
            verified: true,
            createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
            phone: '+250788567890',
            skills: 'Graphic Design, UI/UX, Adobe Creative Suite',
            hourlyRate: 20
        },
        {
            id: 'freelancer_003',
            fullName: 'Patrick Habimana',
            email: 'patrick.habimana@gmail.com',
            password: 'freelancer123',
            role: 'freelancer',
            verified: false,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            phone: '+250788678901',
            skills: 'Mobile Development, Flutter, Android',
            hourlyRate: 30
        },
        {
            id: 'freelancer_004',
            fullName: 'Aline Mutesi',
            email: 'aline.mutesi@gmail.com',
            password: 'freelancer123',
            role: 'freelancer',
            verified: true,
            createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            phone: '+250788789012',
            skills: 'Digital Marketing, SEO, Content Writing',
            hourlyRate: 18
        },
        {
            id: 'client_003',
            fullName: 'Robert Kayitare',
            email: 'robert.kayitare@startup.rw',
            password: 'client123',
            role: 'client',
            verified: false,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            phone: '+250788890123'
        }
    ];
    
    localStorage.setItem('users', JSON.stringify(sampleUsers));
    console.log('Sample users created:', sampleUsers.length);
}

function createSampleJobs() {
    const sampleJobs = [
        {
            id: 'job_001',
            title: 'E-commerce Website Development',
            description: 'We need a modern e-commerce website built with React and Node.js. The site should include user authentication, product catalog, shopping cart, and payment integration.',
            clientId: 'client_001',
            clientName: 'John Uwimana',
            category: 'web-development',
            skills: 'React, Node.js, MongoDB, Payment Integration',
            salary: 800000,
            maxBudget: 1000000,
            projectType: 'fixed',
            experienceLevel: 'intermediate',
            duration: '2-3 months',
            location: 'Remote',
            status: 'active',
            adminApproved: true,
            createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            approvedAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'job_002',
            title: 'Mobile App UI/UX Design',
            description: 'Looking for a talented UI/UX designer to create modern and intuitive designs for our mobile application. Experience with Figma and mobile design principles required.',
            clientId: 'client_002',
            clientName: 'Marie Mukamana',
            category: 'graphic-design',
            skills: 'UI/UX Design, Figma, Mobile Design, Prototyping',
            salary: 400000,
            maxBudget: 500000,
            projectType: 'fixed',
            experienceLevel: 'intermediate',
            duration: '1 month',
            location: 'Kigali',
            status: 'active',
            adminApproved: true,
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            approvedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'job_003',
            title: 'Digital Marketing Campaign',
            description: 'Need an experienced digital marketer to create and manage social media campaigns for our new product launch. Must have experience with Facebook Ads and Google Ads.',
            clientId: 'client_001',
            clientName: 'John Uwimana',
            category: 'digital-marketing',
            skills: 'Digital Marketing, Facebook Ads, Google Ads, Social Media',
            salary: 300000,
            maxBudget: 400000,
            projectType: 'hourly',
            experienceLevel: 'expert',
            duration: '2 months',
            location: 'Remote',
            status: 'pending_admin_approval',
            adminApproved: false,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'job_004',
            title: 'Flutter Mobile App Development',
            description: 'Seeking a Flutter developer to build a cross-platform mobile application for our delivery service. The app should include real-time tracking, payment integration, and user management.',
            clientId: 'client_003',
            clientName: 'Robert Kayitare',
            category: 'mobile-development',
            skills: 'Flutter, Dart, Firebase, API Integration',
            salary: 1200000,
            maxBudget: 1500000,
            projectType: 'fixed',
            experienceLevel: 'expert',
            duration: '3-4 months',
            location: 'Remote',
            status: 'pending_admin_approval',
            adminApproved: false,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'job_005',
            title: 'Content Writing for Website',
            description: 'Looking for a skilled content writer to create engaging content for our company website. Must have experience in SEO writing and understanding of our industry.',
            clientId: 'client_002',
            clientName: 'Marie Mukamana',
            category: 'content-writing',
            skills: 'Content Writing, SEO, Copywriting, Research',
            salary: 200000,
            maxBudget: 250000,
            projectType: 'fixed',
            experienceLevel: 'intermediate',
            duration: '3 weeks',
            location: 'Remote',
            status: 'closed',
            adminApproved: true,
            createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
            approvedAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString(),
            closedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];
    
    localStorage.setItem('jobs', JSON.stringify(sampleJobs));
    console.log('Sample jobs created:', sampleJobs.length);
}

function createSampleApplications() {
    const sampleApplications = [
        {
            id: 'app_001',
            jobId: 'job_001',
            freelancerId: 'freelancer_001',
            freelancerName: 'David Nkurunziza',
            clientId: 'client_001',
            proposal: 'I have extensive experience in React and Node.js development. I can deliver a high-quality e-commerce solution within your timeline.',
            proposedRate: 750000,
            coverLetter: 'I am excited about this project and confident I can deliver excellent results.',
            appliedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'pending'
        },
        {
            id: 'app_002',
            jobId: 'job_002',
            freelancerId: 'freelancer_002',
            freelancerName: 'Grace Uwimana',
            clientId: 'client_002',
            proposal: 'I specialize in mobile UI/UX design and have worked on similar projects. I can create modern and user-friendly designs.',
            proposedRate: 450000,
            coverLetter: 'Looking forward to working on this exciting project.',
            appliedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'accepted'
        },
        {
            id: 'app_003',
            jobId: 'job_001',
            freelancerId: 'freelancer_003',
            freelancerName: 'Patrick Habimana',
            clientId: 'client_001',
            proposal: 'While I primarily work with mobile development, I also have web development experience and can contribute to this project.',
            proposedRate: 850000,
            coverLetter: 'I believe my skills can add value to your project.',
            appliedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'rejected'
        }
    ];
    
    localStorage.setItem('appliedJobs', JSON.stringify(sampleApplications));
    console.log('Sample applications created:', sampleApplications.length);
}

// Auto-initialize when script loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit to ensure other scripts are loaded
    setTimeout(() => {
        initializeSampleData();
        createSampleApplications();
    }, 500);
});

// Make functions globally available
window.initializeSampleData = initializeSampleData;
window.createSampleUsers = createSampleUsers;
window.createSampleJobs = createSampleJobs;
window.createSampleApplications = createSampleApplications;