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
   * Create a new admin user in the profiles table
   */
  static async createAdminUser(userData: {
    email: string
    role: AdminRole['role']
    permissions?: string[]
  }): Promise<AdminRole> {
    try {
      // First check if user exists in profiles
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', userData.email)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (existingUser) {
        // Update existing user to admin role
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            role: 'admin',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingUser.id)

        if (updateError) throw updateError

        return {
          id: existingUser.id,
          email: existingUser.email,
          role: 'super_admin',
          permissions: userData.permissions || [],
          created_at: existingUser.created_at,
          last_login: new Date().toISOString(),
          is_active: true
        }
      } else {
        // Create new admin user
        const { data: newUser, error: insertError } = await supabase
          .from('profiles')
          .insert({
            email: userData.email,
            role: 'admin',
            name: userData.email.split('@')[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (insertError) throw insertError

        return {
          id: newUser.id,
          email: newUser.email,
          role: 'super_admin',
          permissions: userData.permissions || [],
          created_at: newUser.created_at,
          last_login: new Date().toISOString(),
          is_active: true
        }
      }
    } catch (error) {
      console.error('Error creating admin user:', error)
      throw error
    }
  }

  /**
   * Get admin user by ID from profiles table
   */
  static async getAdminUser(userId: string): Promise<AdminRole | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .eq('role', 'admin')
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // No rows returned
        throw error
      }

      return {
        id: data.id,
        email: data.email,
        role: 'super_admin',
        permissions: [],
        created_at: data.created_at,
        last_login: data.updated_at,
        is_active: true
      }
    } catch (error) {
      console.error('Error fetching admin user:', error)
      return null
    }
  }

  /**
   * Get admin user by email from profiles table
   */
  static async getAdminUserByEmail(email: string): Promise<AdminRole | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .eq('role', 'admin')
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // No rows returned
        throw error
      }

      return {
        id: data.id,
        email: data.email,
        role: 'super_admin',
        permissions: [],
        created_at: data.created_at,
        last_login: data.updated_at,
        is_active: true
      }
    } catch (error) {
      console.error('Error fetching admin user by email:', error)
      return null
    }
  }

  /**
   * Update admin user role in profiles table
   */
  static async updateAdminRole(
    userId: string, 
    role: AdminRole['role']
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: 'admin',
          updated_at: new Date().toISOString()
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
   * Check if user has admin role
   */
  static async hasRole(userId: string, role: AdminRole['role']): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (error) return false
      return data.role === 'admin'
    } catch (error) {
      return false
    }
  }

  /**
   * Check if user has specific permission
   */
  static async hasPermission(
    userId: string, 
    permission: keyof AdminPermissions
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (error) return false
      
      // Admin users have all permissions
      if (data.role === 'admin') return true
      
      // For other roles, check specific permissions
      const userPermissions = ROLE_PERMISSIONS[data.role] || {}
      return userPermissions[permission] || false
    } catch (error) {
      return false
    }
  }

  /**
   * Get user permissions
   */
  static async getUserPermissions(userId: string): Promise<AdminPermissions | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (error) return null
      
      // Admin users have all permissions
      if (data.role === 'admin') {
        return ROLE_PERMISSIONS.super_admin
      }
      
      return ROLE_PERMISSIONS[data.role] || null
    } catch (error) {
      return null
    }
  }

  /**
   * Update last login time
   */
  static async updateLastLogin(userId: string): Promise<void> {
    try {
      await supabase
        .from('profiles')
        .update({ updated_at: new Date().toISOString() })
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
        .from('profiles')
        .update({ 
          role: 'awam',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deactivating admin user:', error)
      return false
    }
  }

  /**
   * Get all admin users from profiles table
   */
  static async getAllAdminUsers(): Promise<AdminRole[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'admin')
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map((user: any) => ({
        id: user.id,
        email: user.email,
        role: 'super_admin',
        permissions: [],
        created_at: user.created_at,
        last_login: user.updated_at,
        is_active: true
      }))
    } catch (error) {
      console.error('Error fetching all admin users:', error)
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
    oldValues?: unknown
    newValues?: unknown
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
