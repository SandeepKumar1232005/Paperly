-- ==============================================================================
-- SUPABASE POSTGRESQL RLS ENFORCEMENT SCRIPT
-- ==============================================================================
-- Description: 
-- This script resolves Supabase Advisor warnings by enabling Row Level Security 
-- (RLS) on all tables within the 'public' schema. 
-- 
-- Why this is needed:
-- Supabase exposes the 'public' schema via a REST API (PostgREST). If RLS is 
-- not enabled, anyone with the 'anon' key could theoretically read/write data.
-- 
-- How this works with our Architecture:
-- The Paperly React frontend never talks directly to this REST API. It routes 
-- all requests through the Django backend. 
-- Django connects to Supabase using the 'SUPABASE_SERVICE_ROLE_KEY' (via the 
-- supabase-py client). The service role automatically bypasses RLS. 
-- Therefore, by enabling RLS here and NOT creating any access policies for 
-- 'anon' or 'authenticated', we effectively lock down direct API access to the 
-- database, keeping the architecture secure while keeping Django fully operational.
-- ==============================================================================

DO $$ 
DECLARE
  rec RECORD;
BEGIN
  -- Loop through all tables in the 'public' schema
  FOR rec IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
  LOOP
    -- Execute ALTER TABLE ... ENABLE ROW LEVEL SECURITY for each table
    EXECUTE 'ALTER TABLE public.' || quote_ident(rec.tablename) || ' ENABLE ROW LEVEL SECURITY;';
    
    -- Print a notice (visible in some SQL editors)
    RAISE NOTICE 'Enabled RLS on table: %', rec.tablename;
  END LOOP;
END; 
$$;
