// worker-data.js — loads real data from Supabase for the worker dashboard
// Runs after dashboard-auth.js sets window.currentProfile

(async () => {
    // Wait for auth to complete
    await new Promise(r => setTimeout(r, 300));

    const profile = window.currentProfile;
    const userId  = window.currentUserId;
    if (!profile || !userId) return;

    // ── Populate header ───────────────────────────────────────
    const nameEl = document.getElementById('userName');
    const initEl = document.getElementById('userInitial');
    if (nameEl) nameEl.textContent = profile.full_name || 'Worker';
    if (initEl) initEl.textContent = (profile.full_name || 'W')[0].toUpperCase();

    // ── Load dashboard stats ──────────────────────────────────
    const [apps, wallet] = await Promise.all([
        DB.applications.getByWorker(userId),
        DB.wallet.get(userId)
    ]);

    const accepted = apps.filter(a => a.status === 'accepted').length;
    const totalEarnings = wallet?.available_balance || 0;

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('totalApplications', apps.length);
    set('activeProjects', accepted);
    set('totalEarnings', `RWF ${totalEarnings.toLocaleString()}`);

    // ── Load recent applications ──────────────────────────────
    const recentEl = document.getElementById('recentApplications');
    if (recentEl) {
        const recent = apps.slice(0, 5);
        if (recent.length === 0) {
            recentEl.innerHTML = '<p class="text-gray-500 text-sm">No applications yet. <a href="browse.html" class="text-blue-600 hover:underline">Browse jobs</a></p>';
        } else {
            recentEl.innerHTML = recent.map(a => `
                <div class="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                        <p class="font-medium text-gray-800">${a.job?.title || 'Job'}</p>
                        <p class="text-sm text-gray-500">${a.job?.employer?.company_name || ''} · ${a.job?.location || ''}</p>
                    </div>
                    <span class="px-2 py-1 text-xs rounded-full ${statusColor(a.status)}">${a.status}</span>
                </div>`).join('');
        }
    }

    // ── Load recommended jobs ─────────────────────────────────
    const jobsEl = document.getElementById('recommendedJobs');
    if (jobsEl) {
        const jobs = await DB.jobs.getActive(6);
        if (jobs.length === 0) {
            jobsEl.innerHTML = '<p class="text-gray-500 col-span-2">No active jobs at the moment.</p>';
        } else {
            jobsEl.innerHTML = jobs.map(j => `
                <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 class="font-semibold text-gray-800 mb-1">${j.title}</h3>
                    <p class="text-sm text-gray-500 mb-2">${j.employer?.company_name || ''} · ${j.location}</p>
                    <p class="text-sm text-gray-600 mb-3 line-clamp-2">${j.description}</p>
                    <div class="flex justify-between items-center">
                        <span class="text-green-600 font-semibold text-sm">
                            ${j.salary_range_min ? `RWF ${Number(j.salary_range_min).toLocaleString()}` : 'Negotiable'}
                        </span>
                        <a href="browse.html?job=${j.id}" class="text-blue-600 text-sm hover:underline">View →</a>
                    </div>
                </div>`).join('');
        }
    }

    // ── Load applications section ─────────────────────────────
    const myAppsEl = document.getElementById('myApplications');
    if (myAppsEl) {
        renderApplications(apps, myAppsEl);
        // Stats
        set('appTotalApplications', apps.length);
        set('appPendingApplications', apps.filter(a => a.status === 'pending').length);
        set('appAcceptedApplications', accepted);
        const rate = apps.length ? Math.round((accepted / apps.length) * 100) : 0;
        set('appSuccessRate', `${rate}%`);
    }

    // ── Load earnings section ─────────────────────────────────
    if (wallet) {
        const txs = await DB.wallet.getTransactions(wallet.id, 50);
        const received = txs.filter(t => t.transaction_type === 'payment_received' && t.status === 'completed');
        const thisMonth = new Date().toISOString().slice(0, 7);
        const monthly = received.filter(t => t.created_at.startsWith(thisMonth)).reduce((s, t) => s + Number(t.amount), 0);
        const total   = received.reduce((s, t) => s + Number(t.amount), 0);

        set('totalEarningsAmount', `RWF ${total.toLocaleString()}`);
        set('monthlyEarnings', `RWF ${monthly.toLocaleString()}`);
        set('completedProjectsCount', accepted);

        const recentPayEl = document.getElementById('recentPayments');
        if (recentPayEl) {
            if (received.length === 0) {
                recentPayEl.innerHTML = '<p class="text-gray-500 text-sm text-center py-6">No payments received yet.</p>';
            } else {
                recentPayEl.innerHTML = received.slice(0, 5).map(t => `
                    <div class="flex justify-between items-center py-3 border-b last:border-0">
                        <div>
                            <p class="font-medium text-gray-800">${t.description || 'Payment received'}</p>
                            <p class="text-sm text-gray-500">${new Date(t.created_at).toLocaleDateString()}</p>
                        </div>
                        <span class="text-green-600 font-bold">+RWF ${Number(t.amount).toLocaleString()}</span>
                    </div>`).join('');
            }
        }
    }

    // ── Profile section ───────────────────────────────────────
    const fnEl = document.getElementById('fullName');
    if (fnEl) {
        fnEl.value = profile.full_name || '';
        const fields = {
            professionalTitle: profile.headline,
            email: window.currentUser?.email,
            phone: profile.phone,
            location: profile.location,
            experienceLevel: profile.experience_level,
            bio: profile.bio,
            portfolioUrl: profile.website,
        };
        Object.entries(fields).forEach(([id, val]) => {
            const el = document.getElementById(id);
            if (el && val) el.value = val;
        });
        if (profile.skills) {
            const skills = profile.skills.split(',').map(s => s.trim()).filter(Boolean);
            displaySkills(skills);
        }
    }

    // ── Profile update form ───────────────────────────────────
    const profileForm = document.getElementById('profileUpdateForm');
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const skills = getCurrentSkills().join(', ');
            const ok = await DB.profiles.update(userId, {
                full_name: document.getElementById('fullName')?.value,
                headline: document.getElementById('professionalTitle')?.value,
                phone: document.getElementById('phone')?.value,
                location: document.getElementById('location')?.value,
                experience_level: document.getElementById('experienceLevel')?.value,
                bio: document.getElementById('bio')?.value,
                website: document.getElementById('portfolioUrl')?.value,
                skills
            });
            showNotification(ok ? 'Profile updated!' : 'Update failed.', ok ? 'success' : 'error');
        });
    }

    // ── Logout ────────────────────────────────────────────────
    window.handleLogout = () => Auth.logout();
    document.querySelectorAll('.logout-btn, [data-logout]').forEach(btn => {
        btn.addEventListener('click', (e) => { e.preventDefault(); Auth.logout(); });
    });

    // ── Application filter ────────────────────────────────────
    const filterEl = document.getElementById('applicationFilter');
    if (filterEl) {
        filterEl.addEventListener('change', () => {
            const filtered = filterEl.value === 'all' ? apps : apps.filter(a => a.status === filterEl.value);
            renderApplications(filtered, myAppsEl);
        });
    }

    // ── Helpers ───────────────────────────────────────────────
    function statusColor(s) {
        return { pending: 'bg-yellow-100 text-yellow-800', reviewing: 'bg-blue-100 text-blue-800',
                 shortlisted: 'bg-purple-100 text-purple-800', accepted: 'bg-green-100 text-green-800',
                 rejected: 'bg-red-100 text-red-800' }[s] || 'bg-gray-100 text-gray-800';
    }

    function renderApplications(list, container) {
        if (!container) return;
        if (list.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">No applications found.</p>';
            return;
        }
        container.innerHTML = list.map(a => `
            <div class="border rounded-lg p-5 mb-4 hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-semibold text-gray-800">${a.job?.title || 'Job'}</h3>
                        <p class="text-sm text-gray-500">${a.job?.employer?.company_name || ''} · ${a.job?.location || ''}</p>
                        <p class="text-xs text-gray-400 mt-1">Applied ${new Date(a.applied_at).toLocaleDateString()}</p>
                    </div>
                    <span class="px-3 py-1 text-xs rounded-full ${statusColor(a.status)}">${a.status}</span>
                </div>
            </div>`).join('');
    }
})();
