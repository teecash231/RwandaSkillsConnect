-- Admin helper RPCs for Rwanda SkillsConnect
-- Run this file in Supabase SQL Editor (only in your project environment)

-- 1) Return profiles with email (admin only)
CREATE OR REPLACE FUNCTION admin_get_profiles()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow admins
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  RETURN (
    SELECT jsonb_agg(row_to_json(t))
    FROM (
      SELECT p.id, p.full_name, u.email, p.role, p.status, p.created_at
      FROM profiles p
      JOIN auth.users u ON u.id = p.id
      ORDER BY p.created_at DESC
    ) t
  );
END;
$$;

GRANT EXECUTE ON FUNCTION admin_get_profiles() TO authenticated;

-- 2) Admin-update user role
CREATE OR REPLACE FUNCTION admin_update_user_role(p_target_id UUID, p_role TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;
  IF p_role IS NULL OR NOT (p_role = ANY (ARRAY['admin','employer','worker'])) THEN
    RAISE EXCEPTION 'invalid_role';
  END IF;
  UPDATE profiles SET role = p_role WHERE id = p_target_id;
  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION admin_update_user_role(UUID, TEXT) TO authenticated;

-- 3) Admin-set user status (active/inactive/suspended)
CREATE OR REPLACE FUNCTION admin_set_user_status(p_target_id UUID, p_status TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;
  IF p_status IS NULL OR NOT (p_status = ANY (ARRAY['active','inactive','suspended'])) THEN
    RAISE EXCEPTION 'invalid_status';
  END IF;
  UPDATE profiles SET status = p_status WHERE id = p_target_id;
  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION admin_set_user_status(UUID, TEXT) TO authenticated;

-- 4) (Optional) Admin-delete-profile: soft-delete by setting status='inactive' or remove profile row.
-- Dropping/deleting auth.users requires service_role and is not provided to clients.

-- Note: Run this script in Supabase SQL editor. Keep service_role key private if you plan service-side deletes.
