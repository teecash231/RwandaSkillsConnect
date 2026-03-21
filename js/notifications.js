// js/notifications.js — Phase 7: Notifications Service

const NotificationService = (() => {
  const db = () => window.supabaseClient;
  let _sub = null;

  async function getNotifications(userId, limit = 50) {
    const { data, error } = await db()
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  }

  async function getUnreadCount(userId) {
    const { count, error } = await db()
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    if (error) return 0;
    return count || 0;
  }

  async function markRead(id) {
    const { error } = await db()
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    if (error) throw error;
  }

  async function markAllRead(userId) {
    const { error } = await db()
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    if (error) throw error;
  }

  async function deleteNotification(id) {
    const { error } = await db()
      .from('notifications')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  // Send a notification to ANY user (cross-user) via SECURITY DEFINER RPC.
  // Use this instead of direct insert when notifying another user.
  async function notify({
    userId, senderId = null, type = 'system',
    title, message, link = '#', jobId = null, appId = null
  }) {
    const { error } = await db().rpc('send_notification', {
      p_user_id:   userId,
      p_sender_id: senderId,
      p_type:      type,
      p_title:     title,
      p_message:   message,
      p_link:      link,
      p_job_id:    jobId,
      p_app_id:    appId
    });
    if (error) throw error;
  }

  // Self-notify (insert directly — allowed by RLS notif_insert_own policy)
  async function create(userId, type, title, message, link = '#') {
    const { error } = await db()
      .from('notifications')
      .insert({ user_id: userId, type, title, message, link });
    if (error) throw error;
  }

  function subscribeToNotifications(userId, onNew) {
    unsubscribe();
    _sub = db()
      .channel(`notifications:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, payload => onNew(payload.new))
      .subscribe();
  }

  function unsubscribe() {
    if (_sub) { db().removeChannel(_sub); _sub = null; }
  }

  return {
    getNotifications, getUnreadCount,
    markRead, markAllRead, deleteNotification,
    notify, create,
    subscribeToNotifications, unsubscribe
  };
})();

window.NotificationService = NotificationService;
