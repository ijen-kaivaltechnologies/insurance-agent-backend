-- Migration: Create file_uploaded table for storing uploaded file metadata
-- Run this script in your PostgreSQL database

ALTER TABLE IF EXISTS public.policies
    ALTER COLUMN policy_num DROP NOT NULL;

ALTER TABLE IF EXISTS public.policies
    ALTER COLUMN start_date DROP NOT NULL;

ALTER TABLE IF EXISTS public.policies
    ALTER COLUMN end_date DROP NOT NULL;

ALTER TABLE IF EXISTS public.policies
    ALTER COLUMN term_year DROP NOT NULL;

ALTER TABLE IF EXISTS public.policies
    ALTER COLUMN premium_pay_term DROP NOT NULL;

ALTER TABLE IF EXISTS public.policies
    ALTER COLUMN plan_name DROP NOT NULL;

ALTER TABLE IF EXISTS public.policies
    ALTER COLUMN payment_mode DROP NOT NULL;

ALTER TABLE IF EXISTS public.policies
    ALTER COLUMN insurance_company_name DROP NOT NULL;

ALTER TABLE IF EXISTS public.policies
    ALTER COLUMN policy_type DROP NOT NULL;

ALTER TABLE IF EXISTS public.policies
    ALTER COLUMN net_primium DROP NOT NULL;

ALTER TABLE IF EXISTS public.policies
    ALTER COLUMN gst_percent DROP NOT NULL;

ALTER TABLE IF EXISTS public.policies
    ALTER COLUMN total_premium DROP NOT NULL;

CREATE TABLE IF NOT EXISTS file_uploaded (
    md5 VARCHAR(32) PRIMARY KEY,
    relative_path VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
