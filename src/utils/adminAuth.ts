import { supabase } from './supabase'

export interface AdminRole {
  id: string
  email: string
  role: 'super_admin' | 'content_admin' | 'analytics_admin'
  permissions: string[]
  created_at: string
  last_login: string
  is_active: boolean
}

export interface AdminPermissions {
  canManageUsers: boolean
  canCreateChallenges: boolean
  canViewAnalytics: boolean
  canManageContent: boolean
  canAccessAuditLog: boolean
  canManageSystem: boolean
}

// Default permissions for each role
export const ROLE_PERMISSIONS: Record<string, AdminPermissions> = {
  super_admin: {
    canManageUsers: true,
    canCreateChallenges: true,
    canViewAnalytics: true,
    canManageContent: true,
    canAccessAuditLog: true,
    canManageSystem: true
  },
  content_admin: {
    canManageUsers: false,
    canCreateChallenges: true,
    canViewAnalytics: true,
    canManageContent: true,
    canAccessAuditLog: false,
    canManageSystem: false
  },
  analytics_admin: {
    canManageUsers: false,
    canCreateChallenges: false,
    canViewAnalytics: true,
    canManageContent: false,
    canAccessAuditLog: true,
    canManageSystem: false
  }
}

export class AdminService {
  /**
   * Create a new admin user
   */
  static async createAdminUser(userData: {
    email: string
    role: AdminRole['role']
    permissions?: string[]
  }): Promise<AdminRole> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .insert({
          email: userData.email,
          role: userData.role,
          permissions: userData.permissions || [],
          is_active: true
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating admin user:', error)
      throw error
    }
  }

  /**
   * Get admin user by ID
   */
  static async getAdminUser(userId: string): Promise<AdminRole | null> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', userId)
        .eq('is_active', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // No rows returned
        throw error
      }

      return data
    } catch (error) {
      console.error('Error fetching admin user:', error)
      return null
    }
  }

  /**
   * Get admin user by email
   */
  static async getAdminUserByEmail(email: string): Promise<AdminRole | null> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('is_active', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }

      return data
    } catch (error) {
      console.error('Error fetching admin user by email:', error)
      return null
    }
  }

  /**
   * Update admin user role
   */
  static async updateAdminRole(
    userId: string, 
    role: AdminRole['role']
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({ 
          role,
          permissions: ROLE_PERMISSIONS[role] ? Object.keys(ROLE_PERMISSIONS[role]).filter(
            key => ROLE_PERMISSIONS[role][key as keyof AdminPermissions]
          ) : []
        })
        .eq('id', userId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error updating admin role:', error)
      return false
    }
  }

  /**
   * Check if user has specific role
   */
  static async hasRole(userId: string, role: AdminRole['role']): Promise<boolean> {
    const adminUser = await this.getAdminUser(userId)
    return adminUser?.role === role
  }

  /**
   * Check if user has specific permission
   */
  static async hasPermission(
    userId: string, 
    permission: keyof AdminPermissions
  ): Promise<boolean> {
    const adminUser = await this.getAdminUser(userId)
    if (!adminUser) return false

    const rolePermissions = ROLE_PERMISSIONS[adminUser.role]
    return rolePermissions?.[permission] || false
  }

  /**
   * Get user permissions
   */
  static async getUserPermissions(userId: string): Promise<AdminPermissions | null> {
    const adminUser = await this.getAdminUser(userId)
    if (!adminUser) return null

    return ROLE_PERMISSIONS[adminUser.role] || null
  }

  /**
   * Update last login timestamp
   */
  static async updateLastLogin(userId: string): Promise<void> {
    try {
      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId)
    } catch (error) {
      console.error('Error updating last login:', error)
    }
  }

  /**
   * Deactivate admin user
   */
  static async deactivateAdminUser(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({ is_active: false })
        .eq('id', userId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deactivating admin user:', error)
      return false
    }
  }

  /**
   * List all admin users
   */
  static async getAllAdminUsers(): Promise<AdminRole[]> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching admin users:', error)
      return []
    }
  }
}

/**
 * Audit logging service
 */
export class AuditService {
  static async logAdminAction(params: {
    userId: string
    action: string
    tableName: string
    recordId?: string
    oldValues?: any
    newValues?: any
  }) {
    try {
      await supabase
        .from('audit_log')
        .insert({
          user_id: params.userId,
          action: params.action,
          table_name: params.tableName,
          record_id: params.recordId,
          old_values: params.oldValues,
          new_values: params.newValues
        })
    } catch (error) {
      console.error('Error logging admin action:', error)
    }
  }

  static async getAuditLog(filters?: {
    userId?: string
    action?: string
    tableName?: string
    limit?: number
  }) {
    try {
      let query = supabase
        .from('audit_log')
        .select(`
          *,
          profiles:user_id(email, full_name)
        `)
        .order('created_at', { ascending: false })

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId)
      }
      if (filters?.action) {
        query = query.eq('action', filters.action)
      }
      if (filters?.tableName) {
        query = query.eq('table_name', filters.tableName)
      }
      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query
      if (error) throw error
      
      return data || []
    } catch (error) {
      console.error('Error fetching audit log:', error)
      return []
    }
  }
}
