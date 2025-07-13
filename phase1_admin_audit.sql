-- Phase 1: Admin Role Management & Audit System
-- This script adds admin user management and audit logging to the existing schema

-- Create admin_users table for role-based access control
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'content_admin' CHECK (role IN ('super_admin', 'content_admin', 'analytics_admin')),
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_log table for tracking all system changes
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  admin_user_id UUID REFERENCES admin_users(id),
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(50) NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role_active ON admin_users(role, is_active);
CREATE INDEX IF NOT EXISTS idx_admin_users_last_login ON admin_users(last_login DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_admin_user_id ON audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_record_id ON audit_log(record_id);

-- Enhanced indexes for challenges table
CREATE INDEX IF NOT EXISTS idx_challenges_performance ON challenges(type, difficulty, status, created_at);
CREATE INDEX IF NOT EXISTS idx_challenges_created_by ON challenges(created_by);
CREATE INDEX IF NOT EXISTS idx_challenges_search ON challenges USING gin(to_tsvector('english', title || ' ' || description));

-- Enhanced indexes for profiles table
CREATE INDEX IF NOT EXISTS idx_profiles_role_xp ON profiles(role, xp DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_email_verified ON profiles(email_verified, role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);

-- Add foreign key constraints with proper error handling
DO $$
BEGIN
    -- Add foreign key for challenges.created_by if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_challenges_created_by' 
        AND table_name = 'challenges'
    ) THEN
        ALTER TABLE challenges 
        ADD CONSTRAINT fk_challenges_created_by 
        FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;
    END IF;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Could not add foreign key constraint: %', SQLERRM;
END $$;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for admin_users updated_at
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function for audit logging
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    old_data JSONB;
    new_data JSONB;
    current_user_id UUID;
BEGIN
    -- Get current user ID from context or session
    current_user_id := COALESCE(
        (current_setting('app.current_user_id', true))::UUID,
        auth.uid()
    );

    -- Prepare old and new data
    IF TG_OP = 'DELETE' THEN
        old_data := to_jsonb(OLD);
        new_data := NULL;
    ELSIF TG_OP = 'UPDATE' THEN
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
    ELSIF TG_OP = 'INSERT' THEN
        old_data := NULL;
        new_data := to_jsonb(NEW);
    END IF;

    -- Insert audit record
    INSERT INTO audit_log (
        user_id,
        action,
        table_name,
        record_id,
        old_values,
        new_values
    ) VALUES (
        current_user_id,
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        old_data,
        new_data
    );

    -- Return appropriate record
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for important tables
DROP TRIGGER IF EXISTS audit_challenges ON challenges;
CREATE TRIGGER audit_challenges
    AFTER INSERT OR UPDATE OR DELETE ON challenges
    FOR EACH ROW
    EXECUTE FUNCTION create_audit_log();

DROP TRIGGER IF EXISTS audit_profiles ON profiles;
CREATE TRIGGER audit_profiles
    AFTER INSERT OR UPDATE OR DELETE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION create_audit_log();

DROP TRIGGER IF EXISTS audit_admin_users ON admin_users;
CREATE TRIGGER audit_admin_users
    AFTER INSERT OR UPDATE OR DELETE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION create_audit_log();

-- Row Level Security (RLS) policies
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Admin users policies
DROP POLICY IF EXISTS "Super admins can manage all admin users" ON admin_users;
CREATE POLICY "Super admins can manage all admin users" ON admin_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.id = auth.uid() 
            AND au.role = 'super_admin' 
            AND au.is_active = true
        )
    );

DROP POLICY IF EXISTS "Admins can view their own profile" ON admin_users;
CREATE POLICY "Admins can view their own profile" ON admin_users
    FOR SELECT USING (id = auth.uid());

-- Audit log policies
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_log;
CREATE POLICY "Admins can view audit logs" ON audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.id = auth.uid() 
            AND au.is_active = true
            AND (
                au.role = 'super_admin' 
                OR au.role = 'analytics_admin'
            )
        )
    );

-- Insert default super admin (replace with actual email)
INSERT INTO admin_users (email, role, permissions, is_active) 
VALUES (
    'admin@codecikgu.com', 
    'super_admin',
    '["canManageUsers", "canCreateChallenges", "canViewAnalytics", "canManageContent", "canAccessAuditLog", "canManageSystem"]'::jsonb,
    true
) ON CONFLICT (email) DO NOTHING;

-- Create view for admin dashboard
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM profiles WHERE role = 'murid') as total_students,
    (SELECT COUNT(*) FROM profiles WHERE role = 'guru') as total_teachers,
    (SELECT COUNT(*) FROM profiles WHERE role = 'awam') as total_public,
    (SELECT COUNT(*) FROM challenges WHERE status = 'published') as published_challenges,
    (SELECT COUNT(*) FROM challenges WHERE status = 'draft') as draft_challenges,
    (SELECT COUNT(*) FROM audit_log WHERE created_at >= NOW() - INTERVAL '24 hours') as actions_last_24h,
    (SELECT COUNT(*) FROM profiles WHERE created_at >= NOW() - INTERVAL '7 days') as new_users_last_week;

-- Grant necessary permissions
GRANT SELECT ON admin_dashboard_stats TO authenticated;

-- Create function to get user role info
CREATE OR REPLACE FUNCTION get_user_role_info(user_email TEXT)
RETURNS TABLE (
    user_type TEXT,
    is_admin BOOLEAN,
    admin_role TEXT,
    permissions JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(p.role, 'unknown')::TEXT as user_type,
        (au.id IS NOT NULL)::BOOLEAN as is_admin,
        COALESCE(au.role, '')::TEXT as admin_role,
        COALESCE(au.permissions, '[]'::jsonb) as permissions
    FROM profiles p
    LEFT JOIN admin_users au ON p.email = au.email AND au.is_active = true
    WHERE p.email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE admin_users IS 'Admin user management with role-based access control';
COMMENT ON TABLE audit_log IS 'Comprehensive audit trail for all system changes';
COMMENT ON FUNCTION create_audit_log IS 'Trigger function to automatically log data changes';
COMMENT ON FUNCTION get_user_role_info IS 'Get user role and admin status information';
COMMENT ON VIEW admin_dashboard_stats IS 'Real-time statistics for admin dashboard';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Phase 1 database schema successfully applied:';
    RAISE NOTICE '✅ Admin user management system created';
    RAISE NOTICE '✅ Audit logging system created';
    RAISE NOTICE '✅ Performance indexes added';
    RAISE NOTICE '✅ Row Level Security policies configured';
    RAISE NOTICE '✅ Triggers and functions created';
    RAISE NOTICE '✅ Default super admin user added';
END $$;
