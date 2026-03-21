// dashboard-auth.js — include on every protected dashboard page
// Usage: <script src="js/supabaseClient.js"></script>
//        <script src="js/auth.js"></script>
//        <script src="js/dashboard-auth.js" data-roles="worker"></script>

(async () => {
    const script  = document.currentScript;
    const allowed = (script?.dataset?.roles || '').split(',').map(r => r.trim()).filter(Boolean);

    const result = await Auth.requireAuth(allowed);
    if (!result) return; // requireAuth already redirected

    const { session, profile } = result;

    // Expose globally for other scripts
    window.currentUser    = session.user;
    window.currentProfile = profile;
    window.currentUserId  = session.user.id;

    // Populate any [data-user-name], [data-user-role], [data-user-email] elements
    document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = profile.full_name || '');
    document.querySelectorAll('[data-user-role]').forEach(el => el.textContent = profile.role || '');
    document.querySelectorAll('[data-user-email]').forEach(el => el.textContent = session.user.email || '');
    document.querySelectorAll('[data-user-avatar]').forEach(el => {
        if (profile.profile_image) el.src = profile.profile_image;
    });

    // Wire logout buttons
    document.querySelectorAll('[data-logout]').forEach(btn => {
        btn.addEventListener('click', (e) => { e.preventDefault(); Auth.logout(); });
    });
})();
