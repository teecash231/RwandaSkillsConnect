-- Create a master skills table for platform-level skill management
-- Apply this in Supabase SQL Editor to enable persistent skill management from the admin UI

CREATE TABLE IF NOT EXISTS skills_master (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional: grant basic select/insert/delete to authenticated role if desired
-- GRANT SELECT, INSERT, DELETE ON skills_master TO authenticated;
