-- Pairémancipation — Initialisation PostgreSQL
-- Création du schéma dédié aux données de santé (HDS)

-- 1. Schéma privé pour données de santé
CREATE SCHEMA IF NOT EXISTS private_health;

-- 2. Extensions utiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 3. Permissions
GRANT USAGE ON SCHEMA private_health TO strapi_user;
GRANT CREATE ON SCHEMA private_health TO strapi_user;
REVOKE ALL ON SCHEMA private_health FROM PUBLIC;

-- 4. Search path par défaut
ALTER ROLE strapi_user SET search_path TO public, private_health;

-- 5. Documentation
COMMENT ON SCHEMA private_health IS
  'Schéma isolé pour les données de santé (HDS). Accès restreint au service applicatif.';
