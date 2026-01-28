-- Drop existing tables and recreate from scratch
-- Run this in Supabase SQL Editor if you get "already exists" errors

-- Drop tables in reverse order (respecting foreign keys)
DROP TABLE IF EXISTS vote_roll_call CASCADE;
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS bill_events CASCADE;
DROP TABLE IF EXISTS bills CASCADE;
DROP TABLE IF EXISTS parliamentarians CASCADE;

-- Drop views
DROP VIEW IF EXISTS recent_activity CASCADE;
DROP VIEW IF EXISTS active_bills CASCADE;

-- Now run the full schema.sql content below this line
-- Copy and paste the entire content of schema.sql after this comment
