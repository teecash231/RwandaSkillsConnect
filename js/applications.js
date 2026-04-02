// js/applications.js — Phase 5: Application System

const ApplicationService = (() => {
  const db = () => window.supabaseClient;

  // Employer: get all applications for a specific job
  async function getJobApplications(jobId) {
    const { data, error } = await db()
      .from('job_applications')
      .select(`
        *,
        profiles!job_applications_worker_id_fkey(
          id, full_name, phone, skills, experience_level,
          resume_url, profile_image, bio, headline, location, rating
        )
      `)
      .eq('job_id', jobId)
      .order('applied_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  // Employer: get all applications across all their jobs
  async function getAllEmployerApplications(employerId) {
    // First get the employer's job IDs, then fetch applications for those jobs
    const { data: jobs, error: jobsErr } = await db()
      .from('jobs')
      .select('id')
      .eq('employer_id', employerId);
    if (jobsErr) throw jobsErr;
    if (!jobs || !jobs.length) return [];

    const jobIds = jobs.map(j => j.id);
    const { data, error } = await db()
      .from('job_applications')
      .select(`
        *,
        jobs(id, title, location, job_type, employer_id),
        profiles!job_applications_worker_id_fkey(
          id, full_name, phone, profile_image, skills, experience_level
        )
      `)
      .in('job_id', jobIds)
      .order('applied_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  // Employer: update application status
  async function updateStatus(appId, status) {
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

  // Worker: withdraw application
  async function withdraw(appId, workerId) {
    const { error } = await db()
      .from('job_applications')
      .delete()
      .eq('id', appId)
      .eq('worker_id', workerId);
    if (error) throw error;
  }

  // Get single application with full details
  async function getById(appId) {
    const { data, error } = await db()
      .from('job_applications')
      .select(`
        *,
        jobs(id, title, location, job_type, description, requirements,
             salary_range_min, salary_range_max,
             profiles!jobs_employer_id_fkey(full_name, company_name, company_logo)),
        profiles!job_applications_worker_id_fkey(
          id, full_name, phone, profile_image, bio, headline,
          skills, experience_level, resume_url, location, rating
        )
      `)
      .eq('id', appId)
      .single();
    if (error) throw error;
    return data;
  }

  return { getJobApplications, getAllEmployerApplications, updateStatus, withdraw, getById };
})();

window.ApplicationService = ApplicationService;
