// employer-data.js — loads real data from Supabase for the employer dashboard

(async () => {
    await new Promise(r => setTimeout(r, 300));

    const profile = window.currentProfile;
    const userId  = window.currentUserId;
    if (!profile || !userId) return;

    // ── Populate header ───────────────────────────────────────
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    const name = profile.full_name || profile.company_name || 'Employer';
    set('userName', name);
    set('userNameWelcome', name);
    set('profileName', name);
    set('dropdownUserName', name);
    set('dropdownUserEmail', window.currentUser?.email || '');
    set('profileEmail', window.currentUser?.email || '');
    const init = name[0]?.toUpperCase() || 'E';
    set('userInitial', init);
    set('profileInitial', init);

    // ── Load stats ────────────────────────────────────────────
    const [myJobs, wallet] = await Promise.all([
        DB.jobs.getByEmployer(userId),
        DB.wallet.get(userId)
    ]);

    const activeJobs = myJobs.filter(j => j.status === 'active');

    // Get all applications for employer's jobs
    const appPromises = myJobs.map(j => DB.applications.getByJob(j.id));
    const allAppsNested = await Promise.all(appPromises);
    const allApps = allAppsNested.flat();
    const hired = allApps.filter(a => a.status === 'accepted');

    const totalSpent = wallet ? (wallet.balance - wallet.available_balance) : 0;

    set('activeJobsCount', activeJobs.length);
    set('applicationsCount', allApps.length);
    set('hiredCount', hired.length);
    set('totalSpent', `RWF ${totalSpent.toLocaleString()}`);
    set('jobSlotsIndicator', `${5 - activeJobs.length} of 5 job slots available`);

    // ── Date/time ─────────────────────────────────────────────
    function updateDateTime() {
        const now = new Date();
        set('currentDate', now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
        set('currentTime', now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    }
    updateDateTime();
    setInterval(updateDateTime, 60000);

    // ── Jobs modal ────────────────────────────────────────────
    window.showJobsModal = async () => {
        const container = document.getElementById('jobsModalContent');
        if (!container) return;
        if (myJobs.length === 0) {
            container.innerHTML = `<div class="text-center py-12">
                <i class="fas fa-briefcase text-gray-300 text-6xl mb-4"></i>
                <h3 class="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
                <a href="post-job.html" class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">Post Your First Job</a>
            </div>`;
        } else {
            container.innerHTML = myJobs.map(j => `
                <div class="border rounded-lg p-5 mb-4">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="font-semibold text-gray-800">${j.title}</h3>
                            <p class="text-sm text-gray-500">${j.location} · ${j.job_type || ''}</p>
                        </div>
                        <span class="px-2 py-1 text-xs rounded-full ${j.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}">${j.status}</span>
                    </div>
                    <div class="flex gap-2 mt-3">
                        <button onclick="window.deleteJobSupabase('${j.id}')" class="text-red-500 text-sm hover:underline">Delete</button>
                    </div>
                </div>`).join('');
        }
        document.getElementById('jobsModal')?.classList.remove('hidden');
    };

    window.deleteJobSupabase = async (jobId) => {
        if (!confirm('Delete this job?')) return;
        const ok = await DB.jobs.delete(jobId);
        if (ok) { showNotification('Job deleted.', 'success'); window.showJobsModal(); }
    };

    // ── Applications modal ────────────────────────────────────
    window.showApplicationsModal = async () => {
        const container = document.getElementById('applicationsModalContent');
        if (!container) return;
        if (allApps.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">No applications yet.</p>';
        } else {
            container.innerHTML = allApps.map(a => `
                <div class="border rounded-lg p-5 mb-4">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="font-semibold text-gray-800">${a.worker?.full_name || 'Worker'}</p>
                            <p class="text-sm text-gray-500">Applied ${new Date(a.applied_at).toLocaleDateString()}</p>
                        </div>
                        <span class="px-2 py-1 text-xs rounded-full ${statusColor(a.status)}">${a.status}</span>
                    </div>
                    ${a.status === 'pending' ? `
                    <div class="flex gap-2 mt-3">
                        <button onclick="window.updateAppStatus(${a.id},'accepted')" class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">Accept</button>
                        <button onclick="window.updateAppStatus(${a.id},'rejected')" class="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">Reject</button>
                    </div>` : ''}
                </div>`).join('');
        }
        document.getElementById('applicationsModal')?.classList.remove('hidden');
    };

    window.updateAppStatus = async (appId, status) => {
        const ok = await DB.applications.updateStatus(appId, status);
        if (ok) {
            showNotification(`Application ${status}.`, 'success');
            // Notify worker
            const app = allApps.find(a => a.id === appId);
            if (app) {
                await DB.notifications.create(app.worker_id,
                    status === 'accepted' ? 'Application Accepted 🎉' : 'Application Update',
                    status === 'accepted' ? 'Your application has been accepted!' : 'Your application was not selected.',
                    status === 'accepted' ? 'accept' : 'reject',
                    { sender_id: userId, application_id: appId }
                );
            }
            window.showApplicationsModal();
        }
    };

    // ── Hired modal ───────────────────────────────────────────
    window.showHiredModal = () => {
        const container = document.getElementById('hiredModalContent');
        if (!container) return;
        if (hired.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">No hired workers yet.</p>';
        } else {
            container.innerHTML = hired.map(a => `
                <div class="border rounded-lg p-5 mb-4">
                    <p class="font-semibold text-gray-800">${a.worker?.full_name || 'Worker'}</p>
                    <p class="text-sm text-gray-500">${a.worker?.skills || ''}</p>
                </div>`).join('');
        }
        document.getElementById('hiredModal')?.classList.remove('hidden');
    };

    window.showSpendingModal = () => {
        const container = document.getElementById('spendingModalContent');
        if (container) container.innerHTML = `
            <div class="text-center py-6">
                <p class="text-3xl font-bold text-gray-800">RWF ${totalSpent.toLocaleString()}</p>
                <p class="text-gray-500 mt-2">Total spent via e-wallet</p>
                <p class="mt-4 text-gray-600">Available balance: <strong>RWF ${(wallet?.available_balance || 0).toLocaleString()}</strong></p>
            </div>`;
        document.getElementById('spendingModal')?.classList.remove('hidden');
    };

    window.closeModal = (id) => {
        document.getElementById(id)?.classList.add('hidden');
    };

    // ── Logout ────────────────────────────────────────────────
    document.getElementById('logoutBtn')?.addEventListener('click', () => Auth.logout());

    // ── Helpers ───────────────────────────────────────────────
    function statusColor(s) {
        return { pending: 'bg-yellow-100 text-yellow-800', accepted: 'bg-green-100 text-green-800',
                 rejected: 'bg-red-100 text-red-800', reviewing: 'bg-blue-100 text-blue-800' }[s] || 'bg-gray-100 text-gray-800';
    }

    function showNotification(msg, type = 'success') {
        const n = document.createElement('div');
        n.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm ${type === 'error' ? 'bg-red-500' : 'bg-green-500'}`;
        n.textContent = msg;
        document.body.appendChild(n);
        setTimeout(() => n.remove(), 3000);
    }
    window.showNotification = showNotification;
})();
