-- Migration: Add Verification System and Admin Management
-- Date: 2025-01-23
-- Description: Add admin role management, report verification system, and audit logging
-- This migration adds the foundation for manual verification of road damage reports

BEGIN;

-- Step 1: Add role field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'));
CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);

-- Step 2: Add verification fields to reports table
ALTER TABLE reports ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'deleted'));
ALTER TABLE reports ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES users(id);
ALTER TABLE reports ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Step 3: Add indexes for verification queries
CREATE INDEX IF NOT EXISTS reports_status_idx ON reports(status);
CREATE INDEX IF NOT EXISTS reports_verified_at_idx ON reports(verified_at DESC);
CREATE INDEX IF NOT EXISTS reports_verified_by_idx ON reports(verified_by);
CREATE INDEX IF NOT EXISTS reports_deleted_at_idx ON reports(deleted_at);

-- Step 4: Create admin activity logging table
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL, -- 'report', 'user', etc.
  target_id UUID NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Step 5: Add indexes for admin actions table
CREATE INDEX IF NOT EXISTS admin_actions_admin_idx ON admin_actions(admin_user_id);
CREATE INDEX IF NOT EXISTS admin_actions_target_idx ON admin_actions(target_type, target_id);
CREATE INDEX IF NOT EXISTS admin_actions_created_at_idx ON admin_actions(created_at DESC);

-- Step 6: Add composite indexes for common admin queries
CREATE INDEX IF NOT EXISTS reports_admin_status_created_idx 
ON reports(status, created_at DESC) 
WHERE status IN ('pending', 'verified', 'rejected');

CREATE INDEX IF NOT EXISTS reports_admin_user_status_idx 
ON reports(user_id, status, created_at DESC);

-- Step 7: Verify migration (safety check)
DO $$
BEGIN
    -- Check if role column exists and has correct constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'role'
    ) THEN
        RAISE EXCEPTION 'Migration failed: role column not found in users table';
    END IF;
    
    -- Check if status column exists and has correct constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reports' AND column_name = 'status'
    ) THEN
        RAISE EXCEPTION 'Migration failed: status column not found in reports table';
    END IF;
    
    -- Check if admin_actions table exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'admin_actions'
    ) THEN
        RAISE EXCEPTION 'Migration failed: admin_actions table not found';
    END IF;
    
    RAISE NOTICE 'Verification system migration verification passed';
END
$$;

-- Step 8: Update existing reports to have 'pending' status if not set
UPDATE reports SET status = 'pending' WHERE status IS NULL;

COMMIT;

-- Migration completed successfully
-- Next steps:
-- 1. Set up admin users using the setup-admin script
-- 2. Configure environment variables for admin emails
-- 3. Implement admin middleware and API endpoints 