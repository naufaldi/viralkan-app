-- Migration: Add admin audit log table
-- Description: Creates a table to track admin role changes for security auditing

CREATE TABLE IF NOT EXISTS admin_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('grant', 'revoke')),
    success BOOLEAN NOT NULL DEFAULT false,
    executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    executed_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_email ON admin_audit_log(email);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_executed_at ON admin_audit_log(executed_at);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON admin_audit_log(action);

-- Add comment for documentation
COMMENT ON TABLE admin_audit_log IS 'Audit trail for admin role changes - tracks who granted/revoked admin privileges and when'; 