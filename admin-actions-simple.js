// Simple Admin Actions
window.editUser = function(userId) {
    alert('Edit user: ' + userId);
};

window.deleteUser = function(userId) {
    if (confirm('Delete user?')) {
        let users = JSON.parse(localStorage.getItem('users') || '[]');
        users = users.filter(u => u.id !== userId);
        localStorage.setItem('users', JSON.stringify(users));
        if (typeof loadUsersData === 'function') loadUsersData();
        alert('User deleted');
    }
};

window.deleteJob = function(jobId) {
    if (confirm('Delete job?')) {
        let jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        jobs = jobs.filter(j => j.id !== jobId);
        localStorage.setItem('jobs', JSON.stringify(jobs));
        if (typeof loadJobsData === 'function') loadJobsData();
        alert('Job deleted');
    }
};

window.approveJob = function(jobId) {
    if (confirm('Approve job?')) {
        let jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        const job = jobs.find(j => j.id === jobId);
        if (job) {
            job.status = 'active';
            localStorage.setItem('jobs', JSON.stringify(jobs));
            if (typeof loadJobApprovalsData === 'function') loadJobApprovalsData();
            alert('Job approved');
        }
    }
};

window.rejectJobWithReason = function(jobId) {
    const reason = prompt('Rejection reason:') || 'No reason';
    if (confirm('Reject job?')) {
        let jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        const job = jobs.find(j => j.id === jobId);
        if (job) {
            job.status = 'rejected';
            job.rejectionReason = reason;
            localStorage.setItem('jobs', JSON.stringify(jobs));
            if (typeof loadJobApprovalsData === 'function') loadJobApprovalsData();
            alert('Job rejected');
        }
    }
};