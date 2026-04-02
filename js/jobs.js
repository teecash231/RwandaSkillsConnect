// js/jobs.js — Phase 4: Job System (Supabase)

const JobService = (() => {
  const db = () => window.supabaseClient;

  async function createJob(employerId, data) {
    const { data: job, error } = await db()
      .from('jobs')
      .insert({ ...data, employer_id: employerId, status: data.status || 'active' })
      .select()
      .single();
    if (error) throw error;
    return job;
  }

  async function getEmployerJobs(employerId) {
    const { data, error } = await db()
      .from('jobs')
      .select('*, job_applications(count)')
      .eq('employer_id', employerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async function getOpenJobs({ search = '', location = '', jobType = '' } = {}) {
    const today = new Date().toISOString().split('T')[0];
    let query = db()
      .from('jobs')
      .select('*, profiles!jobs_employer_id_fkey(full_name, company_name, company_logo)')
      .eq('status', 'active')
      .gte('application_deadline', today)
      .order('created_at', { ascending: false });

    if (search)   query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,skills_required.ilike.%${search}%`);
    if (location) query = query.ilike('location', `%${location}%`);
    if (jobType)  query = query.eq('job_type', jobType);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async function getJobById(id) {
    const { data, error } = await db()
      .from('jobs')
      .select('*, profiles!jobs_employer_id_fkey(full_name, company_name, company_logo, location)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  async function updateJob(id, employerId, data) {
    const { data: job, error } = await db()
      .from('jobs')
      .update(data)
      .eq('id', id)
      .eq('employer_id', employerId)
      .select()
      .single();
    if (error) throw error;
    return job;
  }

  async function deleteJob(id, employerId) {
    const { error } = await db()
      .from('jobs')
      .delete()
      .eq('id', id)
      .eq('employer_id', employerId);
    if (error) throw error;
  }

  async function applyToJob(jobId, workerId, coverLetter = '') {
    const { data, error } = await db()
      .from('job_applications')
      .insert({ job_id: jobId, worker_id: workerId, cover_letter: coverLetter })
      .select()
      .single();
    if (error) {
      if (error.code === '23505') throw new Error('You have already applied to this job.');
      throw error;
    }
    // DB trigger trg_on_new_application fires automatically — notifies employer
    return data;
  }

  async function getWorkerApplications(workerId) {
    const { data, error } = await db()
      .from('job_applications')
      .select('*, jobs(title, location, job_type, employer_id, profiles!jobs_employer_id_fkey(full_name, company_name))')
      .eq('worker_id', workerId)
      .order('applied_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async function hasApplied(jobId, workerId) {
    const { count } = await db()
      .from('job_applications')
      .select('*', { count: 'exact', head: true })
      .eq('job_id', jobId)
      .eq('worker_id', workerId);
    return count > 0;
  }

  async function getJobApplications(jobId, employerId) {
    // Verify ownership first via RLS — employer_id check is in policy
    const { data, error } = await db()
      .from('job_applications')
      .select('*, profiles!job_applications_worker_id_fkey(full_name, phone, skills, experience_level, resume_url, profile_image)')
      .eq('job_id', jobId)
      .order('applied_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async function updateApplicationStatus(appId, status) {
    const { data, error } = await db()
      .from('job_applications')
      .update({ status })
      .eq('id', appId)
      .select()
      .single();
    if (error) throw error;
    // DB trigger trg_on_status_change fires automatically — notifies worker
    return data;
  }

  return {
    createJob, getEmployerJobs, getOpenJobs, getJobById,
    updateJob, deleteJob,
    applyToJob, getWorkerApplications, hasApplied,
    getJobApplications, updateApplicationStatus
  };
})();

window.JobService = JobService;
