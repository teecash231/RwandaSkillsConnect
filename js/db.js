// ============================================================
// db.js — Rwanda SkillsConnect Database Module (Supabase)
// Replaces all PHP Controllers + Models
// ============================================================

const DB = (() => {
    const sb = () => window.supabaseClient;

    // ── PROFILES ─────────────────────────────────────────────
    const profiles = {
        async get(id) {
            const { data } = await sb().from('profiles').select('*').eq('id', id).single();
            return data;
        },
        async update(id, fields) {
            const { error } = await sb().from('profiles').update(fields).eq('id', id);
            return !error;
        },
        async getWorkers(filters = {}) {
            let q = sb().from('profiles').select('*').eq('role', 'worker').eq('status', 'active');
            if (filters.keyword) q = q.or(`full_name.ilike.%${filters.keyword}%,bio.ilike.%${filters.keyword}%,skills.ilike.%${filters.keyword}%`);
            if (filters.location) q = q.ilike('location', `%${filters.location}%`);
            if (filters.experience) q = q.eq('experience_level', filters.experience);
            if (filters.availability) q = q.eq('availability', filters.availability);
            const { data } = await q.order('created_at', { ascending: false });
            return data || [];
        }
    };

    // ── JOBS ─────────────────────────────────────────────────
    const jobs = {
        async create(jobData) {
            const { data, error } = await sb().from('jobs').insert(jobData).select().single();
            return error ? { success: false, error: error.message } : { success: true, job: data };
        },
        async update(id, fields) {
            const { error } = await sb().from('jobs').update(fields).eq('id', id);
            return !error;
        },
        async delete(id) {
            const { error } = await sb().from('jobs').delete().eq('id', id);
            return !error;
        },
        async getById(id) {
            const { data } = await sb()
                .from('jobs')
                .select('*, employer:profiles!employer_id(full_name,company_name,company_logo,company_description,location)')
                .eq('id', id)
                .single();
            return data;
        },
        async getActive(limit = 50) {
            const today = new Date().toISOString().split('T')[0];
            const { data } = await sb()
                .from('jobs')
                .select('*, employer:profiles!employer_id(company_name,company_logo)')
                .eq('status', 'active')
                .gte('application_deadline', today)
                .order('created_at', { ascending: false })
                .limit(limit);
            return data || [];
        },
        async getByEmployer(employerId, status = null) {
            let q = sb().from('jobs').select('*').eq('employer_id', employerId);
            if (status) q = q.eq('status', status);
            const { data } = await q.order('created_at', { ascending: false });
            return data || [];
        },
        async search(filters = {}) {
            const today = new Date().toISOString().split('T')[0];
            let q = sb()
                .from('jobs')
                .select('*, employer:profiles!employer_id(company_name,company_logo)')
                .eq('status', 'active')
                .gte('application_deadline', today);
            if (filters.keyword) q = q.or(`title.ilike.%${filters.keyword}%,description.ilike.%${filters.keyword}%,skills_required.ilike.%${filters.keyword}%`);
            if (filters.location) q = q.ilike('location', `%${filters.location}%`);
            if (filters.job_type) q = q.eq('job_type', filters.job_type);
            if (filters.experience) q = q.eq('experience_level', filters.experience);
            const { data } = await q.order('created_at', { ascending: false });
            return data || [];
        },
        async incrementViews(id) {
            await sb().rpc('increment_job_views', { job_id: id });
        }
    };

    // ── APPLICATIONS ─────────────────────────────────────────
    const applications = {
        async apply(jobId, workerId, coverLetter = '') {
            const { data, error } = await sb()
                .from('job_applications')
                .insert({ job_id: jobId, worker_id: workerId, cover_letter: coverLetter })
                .select().single();
            if (error) {
                if (error.code === '23505') return { success: false, error: 'You have already applied for this job.' };
                return { success: false, error: error.message };
            }
            // Increment applications_count
            await sb().rpc('increment_applications_count', { job_id: jobId });
            return { success: true, application: data };
        },
        async cancel(applicationId, workerId) {
            const { error } = await sb()
                .from('job_applications')
                .delete()
                .eq('id', applicationId)
                .eq('worker_id', workerId)
                .eq('status', 'pending');
            return !error;
        },
        async hasApplied(jobId, workerId) {
            const { count } = await sb()
                .from('job_applications')
                .select('id', { count: 'exact', head: true })
                .eq('job_id', jobId)
                .eq('worker_id', workerId);
            return count > 0;
        },
        async getByWorker(workerId) {
            const { data } = await sb()
                .from('job_applications')
                .select('*, job:jobs(title,location,job_type,employer:profiles!employer_id(company_name,company_logo))')
                .eq('worker_id', workerId)
                .order('applied_at', { ascending: false });
            return data || [];
        },
        async getByJob(jobId) {
            const { data } = await sb()
                .from('job_applications')
                .select('*, worker:profiles!worker_id(full_name,profile_image,skills,experience_level,phone)')
                .eq('job_id', jobId)
                .order('applied_at', { ascending: false });
            return data || [];
        },
        async updateStatus(applicationId, status) {
            const { error } = await sb()
                .from('job_applications')
                .update({ status })
                .eq('id', applicationId);
            return !error;
        }
    };

    // ── MESSAGES / CHAT ───────────────────────────────────────
    const chat = {
        _convId(u1, u2, jobId = null) {
            const sorted = [u1, u2].sort();
            return jobId ? `${sorted[0]}_${sorted[1]}_job_${jobId}` : `${sorted[0]}_${sorted[1]}`;
        },
        async getOrCreateConversation(user1, user2, jobId = null) {
            const id = this._convId(user1, user2, jobId);
            const { data: existing } = await sb().from('conversations').select('*').eq('id', id).single();
            if (existing) return existing;
            const { data } = await sb().from('conversations')
                .insert({ id, user1_id: user1, user2_id: user2, job_id: jobId })
                .select().single();
            return data;
        },
        async sendMessage(senderId, receiverId, message, jobId = null) {
            const conv = await this.getOrCreateConversation(senderId, receiverId, jobId);
            if (!conv) return null;
            const { data, error } = await sb().from('messages')
                .insert({ conversation_id: conv.id, sender_id: senderId, receiver_id: receiverId, message })
                .select().single();
            if (!error) {
                await sb().from('conversations').update({
                    last_message: message,
                    last_message_at: new Date().toISOString()
                }).eq('id', conv.id);
            }
            return error ? null : data;
        },
        async getMessages(conversationId, limit = 100) {
            const { data } = await sb()
                .from('messages')
                .select('*, sender:profiles!sender_id(full_name,profile_image)')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true })
                .limit(limit);
            return data || [];
        },
        async getConversations(userId) {
            const { data } = await sb()
                .from('conversations')
                .select(`*, 
                    user1:profiles!user1_id(id,full_name,profile_image,role,company_name),
                    user2:profiles!user2_id(id,full_name,profile_image,role,company_name),
                    job:jobs(title)`)
                .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
                .order('last_message_at', { ascending: false });
            return (data || []).map(c => ({
                ...c,
                other: c.user1_id === userId ? c.user2 : c.user1
            }));
        },
        async markRead(conversationId, userId) {
            await sb().from('messages')
                .update({ is_read: true })
                .eq('conversation_id', conversationId)
                .eq('receiver_id', userId);
        },
        subscribeToMessages(conversationId, callback) {
            return sb().channel(`messages:${conversationId}`)
                .on('postgres_changes', {
                    event: 'INSERT', schema: 'public', table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`
                }, payload => callback(payload.new))
                .subscribe();
        }
    };

    // ── NOTIFICATIONS ─────────────────────────────────────────
    const notifications = {
        async get(userId, limit = 20) {
            const { data } = await sb()
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(limit);
            return data || [];
        },
        async unreadCount(userId) {
            const { count } = await sb()
                .from('notifications')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('is_read', false);
            return count || 0;
        },
        async markRead(id) {
            await sb().from('notifications').update({ is_read: true }).eq('id', id);
        },
        async markAllRead(userId) {
            await sb().from('notifications').update({ is_read: true }).eq('user_id', userId);
        },
        async create(userId, title, message, type = 'info', extras = {}) {
            await sb().from('notifications').insert({
                user_id: userId, title, message, type,
                icon: extras.icon || 'fas fa-bell',
                color: extras.color || 'info',
                link: extras.link || '#',
                sender_id: extras.sender_id || null,
                job_id: extras.job_id || null,
                application_id: extras.application_id || null
            });
        },
        subscribeToNotifications(userId, callback) {
            return sb().channel(`notifications:${userId}`)
                .on('postgres_changes', {
                    event: 'INSERT', schema: 'public', table: 'notifications',
                    filter: `user_id=eq.${userId}`
                }, payload => callback(payload.new))
                .subscribe();
        }
    };

    // ── EWALLET ───────────────────────────────────────────────
    const wallet = {
        async get(userId) {
            const { data } = await sb().from('ewallets').select('*').eq('user_id', userId).single();
            return data;
        },
        async getTransactions(walletId, limit = 20) {
            const { data } = await sb()
                .from('ewallet_transactions')
                .select('*')
                .eq('ewallet_id', walletId)
                .order('created_at', { ascending: false })
                .limit(limit);
            return data || [];
        },
        async requestWithdrawal(walletId, amount, method, details) {
            // Check balance first
            const { data: w } = await sb().from('ewallets').select('available_balance').eq('id', walletId).single();
            if (!w || w.available_balance < amount)
                return { success: false, error: 'Insufficient balance.' };
            if (amount < 1000)
                return { success: false, error: 'Minimum withdrawal is RWF 1,000.' };

            const fee = Math.max(amount * 0.01, 100);
            const { error } = await sb().from('ewallet_withdrawals').insert({
                ewallet_id: walletId, amount, fee,
                net_amount: amount - fee,
                withdrawal_method: method,
                withdrawal_details: details
            });
            return error ? { success: false, error: error.message } : { success: true };
        },
        async getWithdrawals(walletId) {
            const { data } = await sb()
                .from('ewallet_withdrawals')
                .select('*')
                .eq('ewallet_id', walletId)
                .order('created_at', { ascending: false });
            return data || [];
        }
    };

    // ── ADMIN ─────────────────────────────────────────────────
    const admin = {
        async getAllUsers(role = null) {
            let q = sb().from('profiles').select('*');
            if (role) q = q.eq('role', role);
            const { data } = await q.order('created_at', { ascending: false });
            return data || [];
        },
        async updateUserStatus(id, status) {
            const { error } = await sb().from('profiles').update({ status }).eq('id', id);
            return !error;
        },
        async getAllTransactions(limit = 50) {
            const { data } = await sb()
                .from('ewallet_transactions')
                .select('*, wallet:ewallets(user_id, user:profiles!user_id(full_name,email))')
                .order('created_at', { ascending: false })
                .limit(limit);
            return data || [];
        },
        async getDashboardStats() {
            const [users, jobs, apps, txs] = await Promise.all([
                sb().from('profiles').select('role', { count: 'exact' }),
                sb().from('jobs').select('status', { count: 'exact' }),
                sb().from('job_applications').select('status', { count: 'exact' }),
                sb().from('ewallet_transactions').select('amount,transaction_type,status')
            ]);
            return { users: users.data, jobs: jobs.data, applications: apps.data, transactions: txs.data };
        }
    };

    return { profiles, jobs, applications, chat, notifications, wallet, admin };
})();

window.DB = DB;
