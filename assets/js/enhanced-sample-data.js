/**
 * Enhanced Sample Data Generator for Rwanda SkillsConnect
 * Generates comprehensive sample data for testing and demonstration
 */

class EnhancedSampleDataGenerator {
    constructor() {
        this.categories = [
            'web-development', 'mobile-development', 'graphic-design', 
            'digital-marketing', 'content-writing', 'data-science',
            'ui-ux-design', 'video-editing', 'translation', 'accounting'
        ];
        
        this.skills = {
            'web-development': ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'PHP', 'Python', 'WordPress'],
            'mobile-development': ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Ionic', 'Xamarin'],
            'graphic-design': ['Photoshop', 'Illustrator', 'InDesign', 'Figma', 'Canva', 'CorelDraw'],
            'digital-marketing': ['SEO', 'Google Ads', 'Facebook Ads', 'Content Marketing', 'Email Marketing'],
            'content-writing': ['Blog Writing', 'Copywriting', 'Technical Writing', 'Social Media Content'],
            'data-science': ['Python', 'R', 'SQL', 'Machine Learning', 'Data Visualization', 'Statistics'],
            'ui-ux-design': ['Figma', 'Sketch', 'Adobe XD', 'Prototyping', 'User Research', 'Wireframing'],
            'video-editing': ['Adobe Premiere', 'Final Cut Pro', 'After Effects', 'DaVinci Resolve'],
            'translation': ['English', 'French', 'Kinyarwanda', 'Swahili', 'German', 'Spanish'],
            'accounting': ['QuickBooks', 'Excel', 'Financial Analysis', 'Tax Preparation', 'Bookkeeping']
        };
        
        this.locations = [
            'Kigali', 'Butare', 'Gisenyi', 'Ruhengeri', 'Byumba', 
            'Cyangugu', 'Kibungo', 'Gitarama', 'Nyanza', 'Remote'
        ];
        
        this.firstNames = [
            'Jean', 'Marie', 'Pierre', 'Claire', 'Emmanuel', 'Grace', 'David', 'Sarah',
            'Patrick', 'Immaculee', 'Joseph', 'Jeanne', 'Claude', 'Esperance', 'Eric',
            'Diane', 'Samuel', 'Beatrice', 'Vincent', 'Chantal', 'Robert', 'Agnes'
        ];
        
        this.lastNames = [
            'Uwimana', 'Mukamana', 'Niyonzima', 'Habimana', 'Uwumuremyi', 'Mukasine',
            'Nzeyimana', 'Uwamahoro', 'Bizimana', 'Mukamuganga', 'Nsengimana', 'Uwera',
            'Hakizimana', 'Mukamana', 'Niyitegeka', 'Uwimana', 'Bizumuremyi', 'Mukasonga'
        ];
    }

    generateSampleData() {
        try {
            // Clear existing data except admin
            this.clearExistingData();
            
            // Generate users
            const users = this.generateUsers(30);
            
            // Generate jobs
            const jobs = this.generateJobs(25, users);
            
            // Generate applications
            const applications = this.generateApplications(jobs, users);
            
            // Generate notifications
            const notifications = this.generateNotifications(users, jobs);
            
            // Save all data
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('jobs', JSON.stringify(jobs));
            localStorage.setItem('appliedJobs', JSON.stringify(applications));
            localStorage.setItem('adminNotifications', JSON.stringify(notifications));
            
            const stats = {
                users: users.length,
                freelancers: users.filter(u => u.role === 'freelancer').length,
                clients: users.filter(u => u.role === 'client').length,
                jobs: jobs.length,
                pendingJobs: jobs.filter(j => j.status === 'pending_admin_approval').length,
                applications: applications.length
            };
            
            return {
                success: true,
                message: 'Enhanced sample data generated successfully',
                stats: stats
            };
            
        } catch (error) {
            console.error('Error generating sample data:', error);
            return {
                success: false,
                message: 'Failed to generate sample data: ' + error.message
            };
        }
    }

    clearExistingData() {
        // Keep admin users
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const adminUsers = users.filter(u => u.role === 'admin');
        localStorage.setItem('users', JSON.stringify(adminUsers));
        
        // Clear other data
        localStorage.setItem('jobs', '[]');
        localStorage.setItem('appliedJobs', '[]');
        localStorage.setItem('adminNotifications', '[]');
    }

    generateUsers(count) {
        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const users = [...existingUsers]; // Keep existing admin users
        
        for (let i = 0; i < count; i++) {
            const role = Math.random() < 0.6 ? 'freelancer' : 'client';
            const firstName = this.getRandomItem(this.firstNames);
            const lastName = this.getRandomItem(this.lastNames);
            const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
            
            const user = {
                id: `user_${Date.now()}_${i}`,
                fullName: `${firstName} ${lastName}`,
                email: email,
                phone: `+25078${this.getRandomNumber(1000000, 9999999)}`,
                role: role,
                password: 'password123',
                verified: Math.random() < 0.8, // 80% verified
                createdAt: this.getRandomDate(30), // Within last 30 days
                lastLogin: Math.random() < 0.7 ? this.getRandomDate(7) : null,
                location: this.getRandomItem(this.locations),
                profileComplete: Math.random() < 0.9
            };
            
            // Add role-specific data
            if (role === 'freelancer') {
                const category = this.getRandomItem(this.categories);
                user.professionalTitle = this.generateProfessionalTitle(category);
                user.skills = this.getRandomItems(this.skills[category] || [], 3, 6).join(', ');
                user.experienceLevel = this.getRandomItem(['Entry Level', 'Intermediate', 'Expert']);
                user.hourlyRate = this.getRandomNumber(5, 50);
                user.bio = this.generateBio(role, category);
                user.portfolio = `https://portfolio-${firstName.toLowerCase()}-${lastName.toLowerCase()}.com`;
            } else {
                user.companyName = this.generateCompanyName();
                user.industry = this.getRandomItem(['Technology', 'Healthcare', 'Education', 'Finance', 'Retail', 'Manufacturing']);
                user.bio = this.generateBio(role);
            }
            
            users.push(user);
        }
        
        return users;
    }

    generateJobs(count, users) {
        const jobs = [];
        const clients = users.filter(u => u.role === 'client');
        
        if (clients.length === 0) return jobs;
        
        for (let i = 0; i < count; i++) {
            const client = this.getRandomItem(clients);
            const category = this.getRandomItem(this.categories);
            const skills = this.skills[category] || [];
            
            const job = {
                id: `job_${Date.now()}_${i}`,
                title: this.generateJobTitle(category),
                description: this.generateJobDescription(category),
                category: category,
                skills: this.getRandomItems(skills, 2, 5).join(', '),
                clientId: client.id,
                clientName: client.fullName,
                clientCompany: client.companyName || client.fullName,
                location: Math.random() < 0.3 ? 'Remote' : this.getRandomItem(this.locations),
                projectType: Math.random() < 0.6 ? 'fixed' : 'hourly',
                experienceLevel: this.getRandomItem(['Entry Level', 'Intermediate', 'Expert']),
                duration: this.getRandomItem(['Less than 1 month', '1-3 months', '3-6 months', 'More than 6 months']),
                salary: this.getRandomNumber(50000, 2000000), // RWF
                maxBudget: this.getRandomNumber(100000, 5000000), // RWF
                minBudget: this.getRandomNumber(50000, 500000), // RWF
                status: this.getJobStatus(),
                createdAt: this.getRandomDate(45), // Within last 45 days
                deadline: this.getFutureDate(30, 90), // 30-90 days from now
                applicationsCount: 0,
                viewsCount: this.getRandomNumber(5, 100)
            };
            
            // Add approval data for some jobs
            if (job.status === 'active') {
                job.adminApproved = true;
                job.approvedAt = this.getRandomDate(30);
                job.approvedBy = 'admin';
            } else if (job.status === 'rejected') {
                job.adminApproved = false;
                job.rejectedAt = this.getRandomDate(15);
                job.rejectionReason = this.getRandomItem([
                    'Insufficient job details',
                    'Unrealistic budget',
                    'Inappropriate content',
                    'Duplicate posting'
                ]);
            }
            
            jobs.push(job);
        }
        
        return jobs;
    }

    generateApplications(jobs, users) {
        const applications = [];
        const freelancers = users.filter(u => u.role === 'freelancer' && u.verified);
        const activeJobs = jobs.filter(j => j.status === 'active');
        
        if (freelancers.length === 0 || activeJobs.length === 0) return applications;
        
        // Generate 2-8 applications per active job
        activeJobs.forEach(job => {
            const numApplications = this.getRandomNumber(2, 8);
            const applicants = this.getRandomItems(freelancers, numApplications);
            
            applicants.forEach((freelancer, index) => {
                const application = {
                    id: `app_${Date.now()}_${job.id}_${index}`,
                    jobId: job.id,
                    jobTitle: job.title,
                    freelancerId: freelancer.id,
                    freelancerName: freelancer.fullName,
                    clientId: job.clientId,
                    clientName: job.clientName,
                    proposedRate: job.projectType === 'hourly' ? 
                        this.getRandomNumber(5, 30) : 
                        this.getRandomNumber(job.minBudget || 50000, job.maxBudget || 500000),
                    coverLetter: this.generateCoverLetter(job.title, freelancer.professionalTitle),
                    appliedAt: this.getRandomDate(20),
                    status: this.getRandomItem(['pending', 'reviewed', 'shortlisted', 'rejected']),
                    estimatedDuration: this.getRandomItem(['1 week', '2 weeks', '1 month', '2 months']),
                    portfolio: freelancer.portfolio || null
                };\n                \n                applications.push(application);\n            });\n            \n            // Update job applications count\n            job.applicationsCount = applicants.length;\n        });\n        \n        return applications;\n    }\n\n    generateNotifications(users, jobs) {\n        const notifications = [];\n        const pendingJobs = jobs.filter(j => j.status === 'pending_admin_approval');\n        const newUsers = users.filter(u => {\n            const createdDate = new Date(u.createdAt);\n            const daysDiff = (new Date() - createdDate) / (1000 * 60 * 60 * 24);\n            return daysDiff <= 7; // Last 7 days\n        });\n        \n        // Pending job notifications\n        if (pendingJobs.length > 0) {\n            notifications.push({\n                id: 'notif_pending_jobs',\n                type: 'warning',\n                title: 'Pending Job Approvals',\n                message: `${pendingJobs.length} job${pendingJobs.length > 1 ? 's' : ''} waiting for approval`,\n                createdAt: new Date().toISOString(),\n                read: false,\n                actionUrl: '#job-approvals'\n            });\n        }\n        \n        // New users notification\n        if (newUsers.length > 0) {\n            notifications.push({\n                id: 'notif_new_users',\n                type: 'success',\n                title: 'New User Registrations',\n                message: `${newUsers.length} new user${newUsers.length > 1 ? 's' : ''} registered this week`,\n                createdAt: new Date().toISOString(),\n                read: false,\n                actionUrl: '#users'\n            });\n        }\n        \n        // System notifications\n        notifications.push({\n            id: 'notif_system_health',\n            type: 'info',\n            title: 'System Health Check',\n            message: 'All systems operational. Platform performance is optimal.',\n            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago\n            read: false\n        });\n        \n        return notifications;\n    }\n\n    // Helper methods\n    getRandomItem(array) {\n        return array[Math.floor(Math.random() * array.length)];\n    }\n\n    getRandomItems(array, min, max) {\n        const count = this.getRandomNumber(min, max);\n        const shuffled = [...array].sort(() => 0.5 - Math.random());\n        return shuffled.slice(0, Math.min(count, array.length));\n    }\n\n    getRandomNumber(min, max) {\n        return Math.floor(Math.random() * (max - min + 1)) + min;\n    }\n\n    getRandomDate(daysBack) {\n        const now = new Date();\n        const randomDays = Math.floor(Math.random() * daysBack);\n        const date = new Date(now.getTime() - randomDays * 24 * 60 * 60 * 1000);\n        return date.toISOString();\n    }\n\n    getFutureDate(minDays, maxDays) {\n        const now = new Date();\n        const randomDays = this.getRandomNumber(minDays, maxDays);\n        const date = new Date(now.getTime() + randomDays * 24 * 60 * 60 * 1000);\n        return date.toISOString();\n    }\n\n    getJobStatus() {\n        const statuses = [\n            { status: 'active', weight: 0.5 },\n            { status: 'pending_admin_approval', weight: 0.3 },\n            { status: 'closed', weight: 0.15 },\n            { status: 'rejected', weight: 0.05 }\n        ];\n        \n        const random = Math.random();\n        let cumulative = 0;\n        \n        for (const item of statuses) {\n            cumulative += item.weight;\n            if (random <= cumulative) {\n                return item.status;\n            }\n        }\n        \n        return 'active';\n    }\n\n    generateProfessionalTitle(category) {\n        const titles = {\n            'web-development': ['Full Stack Developer', 'Frontend Developer', 'Backend Developer', 'WordPress Developer'],\n            'mobile-development': ['Mobile App Developer', 'iOS Developer', 'Android Developer', 'React Native Developer'],\n            'graphic-design': ['Graphic Designer', 'Brand Designer', 'Logo Designer', 'Print Designer'],\n            'digital-marketing': ['Digital Marketing Specialist', 'SEO Expert', 'Social Media Manager', 'PPC Specialist'],\n            'content-writing': ['Content Writer', 'Copywriter', 'Blog Writer', 'Technical Writer'],\n            'data-science': ['Data Scientist', 'Data Analyst', 'Machine Learning Engineer', 'Business Intelligence Analyst'],\n            'ui-ux-design': ['UI/UX Designer', 'Product Designer', 'User Experience Designer', 'Interface Designer'],\n            'video-editing': ['Video Editor', 'Motion Graphics Designer', 'Video Producer', 'Post-Production Specialist'],\n            'translation': ['Translator', 'Interpreter', 'Localization Specialist', 'Language Consultant'],\n            'accounting': ['Accountant', 'Bookkeeper', 'Financial Analyst', 'Tax Consultant']\n        };\n        \n        return this.getRandomItem(titles[category] || ['Professional']);\n    }\n\n    generateCompanyName() {\n        const prefixes = ['Rwanda', 'Kigali', 'East Africa', 'Digital', 'Smart', 'Tech', 'Global', 'Premier'];\n        const suffixes = ['Solutions', 'Technologies', 'Enterprises', 'Group', 'Company', 'Services', 'Systems', 'Innovations'];\n        \n        return `${this.getRandomItem(prefixes)} ${this.getRandomItem(suffixes)}`;\n    }\n\n    generateJobTitle(category) {\n        const titles = {\n            'web-development': [\n                'Build a Modern E-commerce Website',\n                'Develop Custom WordPress Theme',\n                'Create React.js Web Application',\n                'Build Company Portfolio Website',\n                'Develop Online Learning Platform'\n            ],\n            'mobile-development': [\n                'Develop iOS Mobile App',\n                'Create Android E-commerce App',\n                'Build Cross-platform Mobile App',\n                'Develop Food Delivery App',\n                'Create Fitness Tracking App'\n            ],\n            'graphic-design': [\n                'Design Company Logo and Branding',\n                'Create Marketing Brochure Design',\n                'Design Social Media Graphics',\n                'Create Product Packaging Design',\n                'Design Business Card and Stationery'\n            ],\n            'digital-marketing': [\n                'SEO Optimization for Website',\n                'Manage Social Media Campaigns',\n                'Create Google Ads Campaign',\n                'Develop Content Marketing Strategy',\n                'Email Marketing Campaign Setup'\n            ],\n            'content-writing': [\n                'Write Blog Posts for Tech Company',\n                'Create Website Copy and Content',\n                'Develop Product Descriptions',\n                'Write Technical Documentation',\n                'Create Social Media Content'\n            ]\n        };\n        \n        const categoryTitles = titles[category] || ['Professional Service Required'];\n        return this.getRandomItem(categoryTitles);\n    }\n\n    generateJobDescription(category) {\n        const descriptions = {\n            'web-development': [\n                'We are looking for an experienced web developer to create a modern, responsive website for our business. The project requires expertise in HTML, CSS, JavaScript, and modern frameworks.',\n                'Need a skilled developer to build a custom e-commerce platform with payment integration, user management, and admin dashboard.',\n                'Looking for a WordPress expert to develop a custom theme and implement advanced functionality for our corporate website.'\n            ],\n            'mobile-development': [\n                'We need a mobile app developer to create a cross-platform application for our service. The app should work on both iOS and Android devices.',\n                'Looking for an experienced developer to build a native mobile app with real-time features and cloud integration.',\n                'Need a React Native developer to create a mobile app with user authentication, push notifications, and offline capabilities.'\n            ],\n            'graphic-design': [\n                'We are seeking a creative graphic designer to develop our brand identity including logo, color scheme, and marketing materials.',\n                'Need a designer to create engaging visual content for our social media campaigns and digital marketing efforts.',\n                'Looking for a professional designer to create print materials including brochures, flyers, and business cards.'\n            ]\n        };\n        \n        const categoryDescriptions = descriptions[category] || [\n            'We are looking for a skilled professional to help us with our project. The ideal candidate should have relevant experience and be able to deliver high-quality work within the specified timeframe.'\n        ];\n        \n        return this.getRandomItem(categoryDescriptions);\n    }\n\n    generateBio(role, category = null) {\n        if (role === 'freelancer') {\n            const bios = [\n                `Experienced ${category} professional with over 5 years of experience delivering high-quality projects for clients worldwide.`,\n                `Passionate about creating innovative solutions and helping businesses achieve their goals through professional ${category} services.`,\n                `Dedicated freelancer specializing in ${category} with a track record of successful project completions and satisfied clients.`,\n                `Creative professional with expertise in ${category} and a commitment to delivering exceptional results on time and within budget.`\n            ];\n            return this.getRandomItem(bios);\n        } else {\n            const bios = [\n                'We are a growing company looking to work with talented freelancers to help us achieve our business objectives.',\n                'Our organization values quality work and professional collaboration. We believe in building long-term relationships with skilled professionals.',\n                'We are committed to innovation and excellence, seeking creative professionals to join our projects and contribute to our success.',\n                'As a forward-thinking company, we partner with freelancers who share our vision for quality and professional excellence.'\n            ];\n            return this.getRandomItem(bios);\n        }\n    }\n\n    generateCoverLetter(jobTitle, professionalTitle) {\n        const templates = [\n            `Dear Hiring Manager,\\n\\nI am excited to apply for the \"${jobTitle}\" position. As a ${professionalTitle}, I have the skills and experience necessary to deliver exceptional results for your project.\\n\\nI would love to discuss how I can contribute to your project's success.\\n\\nBest regards`,\n            `Hello,\\n\\nI noticed your posting for \"${jobTitle}\" and I believe my background as a ${professionalTitle} makes me an ideal candidate for this project.\\n\\nI am confident I can deliver high-quality work within your timeline and budget.\\n\\nLooking forward to hearing from you.`,\n            `Hi there,\\n\\nI'm interested in your \"${jobTitle}\" project. With my experience as a ${professionalTitle}, I can provide exactly what you're looking for.\\n\\nI'd be happy to discuss the project details and how I can help achieve your goals.\\n\\nThank you for your consideration.`\n        ];\n        \n        return this.getRandomItem(templates);\n    }\n}\n\n// Create global instance\nwindow.enhancedSampleDataGenerator = new EnhancedSampleDataGenerator();\n\n// Export for use in other modules\nif (typeof module !== 'undefined' && module.exports) {\n    module.exports = EnhancedSampleDataGenerator;\n}\n\nconsole.log('📊 Enhanced Sample Data Generator Loaded');\n