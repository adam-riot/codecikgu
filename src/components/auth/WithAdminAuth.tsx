import React, { useState, useEffect } from 'react'
import { AdminRole, AdminService } from '../../utils/adminAuth'
import { supabase } from '../../utils/supabase'

interface WithAdminAuthProps {
  requiredRole?: AdminRole['role']
  children: React.ReactNode
}

export function WithAdminAuth({ requiredRole, children }: WithAdminAuthProps) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string; role: string; name?: string } | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get current user from your auth system
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          setIsAuthorized(false)
          return
        }

        const adminUser = await AdminService.getAdminUser(currentUser.id)
        if (!adminUser) {
          setIsAuthorized(false)
          return
        }

        if (requiredRole && adminUser.role !== requiredRole) {
          setIsAuthorized(false)
          return
        }

        setUser(adminUser)
        setIsAuthorized(true)
      } catch (error) {
        console.error('Auth check error:', error)
        setIsAuthorized(false)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [requiredRole])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export function withAdminAuth(requiredRole?: AdminRole['role']) {
  return function <T extends {}>(Component: React.ComponentType<T>) {
    return function AuthenticatedComponent(props: T) {
      return (
        <WithAdminAuth requiredRole={requiredRole}>
          <Component {...props} />
        </WithAdminAuth>
      )
    }
  }
}

// Get current user from Supabase auth
async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export default WithAdminAuth
