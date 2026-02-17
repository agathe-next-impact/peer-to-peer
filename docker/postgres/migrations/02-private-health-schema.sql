-- Migration: Create private_health schema for HDS-compliant data isolation
-- ref: Architecture Step 1 §3 + Step 3 §2.1
--
-- This script creates the isolated schema for health data (personal notebooks,
-- goals, assessments, calendar events, documents, recovery profiles).
-- It must be run AFTER the default Strapi tables are created in the public schema.

BEGIN;

-- ============================================================
-- 1. Create the private_health schema
-- ============================================================
CREATE SCHEMA IF NOT EXISTS private_health;

COMMENT ON SCHEMA private_health IS
  'Schéma isolé pour les données de santé chiffrées (conformité HDS).';

-- ============================================================
-- 2. Extensions (if not already available)
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 3. Grant usage to the Strapi database user
-- ============================================================
DO $$
DECLARE
  db_user TEXT;
BEGIN
  SELECT current_user INTO db_user;
  EXECUTE format('GRANT USAGE ON SCHEMA private_health TO %I', db_user);
  EXECUTE format('GRANT CREATE ON SCHEMA private_health TO %I', db_user);
  EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA private_health GRANT ALL ON TABLES TO %I', db_user);
  EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA private_health GRANT ALL ON SEQUENCES TO %I', db_user);
END
$$;

-- ============================================================
-- 4. Move sensitive tables to private_health schema
--    (run after Strapi creates them in public)
-- ============================================================
-- NOTE: These ALTER TABLE statements should be run AFTER initial Strapi boot.
-- They move the tables from public to private_health schema.
-- Uncomment and run manually after first `npm run develop`:

-- ALTER TABLE public.personal_notebooks SET SCHEMA private_health;
-- ALTER TABLE public.personal_goals SET SCHEMA private_health;
-- ALTER TABLE public.self_assessments SET SCHEMA private_health;
-- ALTER TABLE public.generated_documents SET SCHEMA private_health;
-- ALTER TABLE public.personal_calendar_events SET SCHEMA private_health;
-- ALTER TABLE public.recovery_profiles SET SCHEMA private_health;
-- ALTER TABLE public.recovery_recommendations SET SCHEMA private_health;

-- ============================================================
-- 5. Recommended indexes for performance on private data
-- ============================================================
-- These indexes optimize common queries (list by owner, sort by date).
-- Apply after tables are in the private_health schema.

-- CREATE INDEX IF NOT EXISTS idx_notebooks_owner ON private_health.personal_notebooks (owner);
-- CREATE INDEX IF NOT EXISTS idx_notebooks_date ON private_health.personal_notebooks (date DESC);
-- CREATE INDEX IF NOT EXISTS idx_goals_owner ON private_health.personal_goals (owner);
-- CREATE INDEX IF NOT EXISTS idx_goals_status ON private_health.personal_goals (status);
-- CREATE INDEX IF NOT EXISTS idx_assessments_owner ON private_health.self_assessments (owner);
-- CREATE INDEX IF NOT EXISTS idx_assessments_date ON private_health.self_assessments (date DESC);
-- CREATE INDEX IF NOT EXISTS idx_calendar_owner ON private_health.personal_calendar_events (owner);
-- CREATE INDEX IF NOT EXISTS idx_calendar_start ON private_health.personal_calendar_events ("startDate");
-- CREATE INDEX IF NOT EXISTS idx_documents_owner ON private_health.generated_documents (owner);
-- CREATE INDEX IF NOT EXISTS idx_recovery_owner ON private_health.recovery_profiles (owner);
-- CREATE INDEX IF NOT EXISTS idx_recommendations_owner ON private_health.recovery_recommendations (owner);

-- ============================================================
-- 6. Row-level security (RLS) — defense in depth
-- ============================================================
-- RLS ensures data isolation even if the application layer is bypassed.
-- Uncomment and adapt after moving tables to private_health.

-- ALTER TABLE private_health.personal_notebooks ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY notebooks_owner_policy ON private_health.personal_notebooks
--   USING (owner = current_setting('app.current_user_id')::integer);

-- (Repeat for each sensitive table)

COMMIT;
