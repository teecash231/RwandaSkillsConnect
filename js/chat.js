// ============================================================
// chat.js — Rwanda SkillsConnect Chat Service (Supabase)
// ============================================================

const ChatService = (() => {
    const sb = () => window.supabaseClient;
    let _realtimeSub = null;

    // ── Get or create a conversation between two users ────────
    async function getOrCreateConversation(myId, otherId, jobId = null) {
        // Canonical ID: sort user IDs so it's always the same
        const [a, b] = [myId, otherId].sort();
        const convId = `${a}_${b}${jobId ? '_' + jobId : ''}`;

        const { data: existing } = await sb()
            .from('conversations')
            .select('*')
            .eq('id', convId)
            .single();

        if (existing) return { data: existing, error: null };

        const { data, error } = await sb()
            .from('conversations')
            .insert({ id: convId, user1_id: a, user2_id: b, job_id: jobId })
            .select()
            .single();

        return { data, error };
    }

    // ── Get all conversations for current user ────────────────
    async function getConversations(userId) {
        const { data, error } = await sb()
            .from('conversations')
            .select(`
                *,
                user1:profiles!conversations_user1_id_fkey(id, full_name, profile_image, role),
                user2:profiles!conversations_user2_id_fkey(id, full_name, profile_image, role)
            `)
            .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
            .order('last_message_at', { ascending: false });

        return { data, error };
    }

    // ── Get messages for a conversation ───────────────────────
    async function getMessages(conversationId) {
        const { data, error } = await sb()
            .from('messages')
            .select(`*, sender:profiles!messages_sender_id_fkey(id, full_name, profile_image)`)
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        return { data, error };
    }

    // ── Send a message ────────────────────────────────────────
    async function sendMessage(conversationId, senderId, receiverId, text) {
        const { data, error } = await sb()
            .from('messages')
            .insert({ conversation_id: conversationId, sender_id: senderId, receiver_id: receiverId, message: text })
            .select()
            .single();

        if (!error) {
            // Update conversation last_message
            await sb()
                .from('conversations')
                .update({ last_message: text, last_message_at: new Date().toISOString() })
                .eq('id', conversationId);
        }

        return { data, error };
    }

    // ── Mark messages as read ─────────────────────────────────
    async function markRead(conversationId, userId) {
        await sb()
            .from('messages')
            .update({ is_read: true })
            .eq('conversation_id', conversationId)
            .eq('receiver_id', userId)
            .eq('is_read', false);
    }

    // ── Subscribe to new messages (Realtime) ──────────────────
    function subscribeToMessages(conversationId, onMessage) {
        unsubscribe(); // clean up previous
        _realtimeSub = sb()
            .channel(`messages:${conversationId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${conversationId}`
            }, payload => onMessage(payload.new))
            .subscribe();
    }

    // ── Unsubscribe from Realtime ─────────────────────────────
    function unsubscribe() {
        if (_realtimeSub) {
            sb().removeChannel(_realtimeSub);
            _realtimeSub = null;
        }
    }

    return { getOrCreateConversation, getConversations, getMessages, sendMessage, markRead, subscribeToMessages, unsubscribe };
})();

window.ChatService = ChatService;
