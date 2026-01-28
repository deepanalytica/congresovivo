-- Disable RLS temporarily for data injection
-- Run this in Supabase SQL Editor BEFORE running massive injection

-- Disable RLS on parliamentarians table
ALTER TABLE parliamentarians DISABLE ROW LEVEL SECURITY;

-- Disable RLS on bills table
ALTER TABLE bills DISABLE ROW LEVEL SECURITY;

-- Disable RLS on votes table
ALTER TABLE votes DISABLE ROW LEVEL SECURITY;

-- Disable RLS on vote_roll_call table
ALTER TABLE vote_roll_call DISABLE ROW LEVEL SECURITY;

-- Disable RLS on committees table
ALTER TABLE committees DISABLE ROW LEVEL SECURITY;

-- Disable RLS on committee_members table
ALTER TABLE committee_members DISABLE ROW LEVEL SECURITY;
