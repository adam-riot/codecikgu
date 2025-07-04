// src/utils/supabase.ts

import { createClient } from '@supabase/supabase-js'

// Define custom user type to avoid TypeScript errors
export interface CustomUser {
  id: string
  email?: string
  user_metadata?: {
    role?: string
    full_name?: string
    phone?: string
    address?: string
    school?: string
    tingkatan?: string
    [key: string]: any
  }
  app_metadata?: {
    role?: string
    [key: string]: any
  }
  created_at?: string
  [key: string]: any
}

// Baca pembolehubah persekitaran dengan cara yang paling serasi
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Semak jika pembolehubah wujud sebelum mencipta client
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL or Anon Key is missing from environment variables.')
}

// Cipta dan eksport client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to get user role with fallback logic
export const getUserRole = (userData: CustomUser | null): string => {
  if (!userData) return 'awam'
  
  console.log('Getting role for user:', userData.email) // Debug log
  
  // Check multiple possible locations for role
  const role = userData.user_metadata?.role || 
               userData.app_metadata?.role ||
               (userData.email?.includes('admin') ? 'admin' : 'awam')
  
  console.log('Found role in user_metadata:', userData.user_metadata?.role) // Debug log
  console.log('Found role in app_metadata:', userData.app_metadata?.role) // Debug log
  console.log('Final role:', role) // Debug log
  
  return role
}

// Helper function to check if user is admin
export const isAdmin = (userData: CustomUser | null): boolean => {
  return getUserRole(userData) === 'admin'
}

// Helper function to check if user is student
export const isStudent = (userData: CustomUser | null): boolean => {
  return getUserRole(userData) === 'murid'
}

// Helper function to check if user is public
export const isPublic = (userData: CustomUser | null): boolean => {
  return getUserRole(userData) === 'awam'
}

// Helper function to get user display name
export const getUserDisplayName = (userData: CustomUser | null): string => {
  if (!userData) return 'Tetamu'
  
  return userData.user_metadata?.full_name || 
         userData.email?.split('@')[0] || 
         'Pengguna'
}

// Helper function to get role-specific dashboard URL
export const getDashboardUrl = (userData: CustomUser | null): string => {
  const role = getUserRole(userData)
  
  switch (role) {
    case 'admin': return '/dashboard-admin'
    case 'murid': return '/dashboard-murid'
    case 'awam': return '/dashboard-awam'
    default: return '/dashboard-awam'
  }
}

// Helper function to get role-specific home URL
export const getHomeUrl = (userData: CustomUser | null): string => {
  const role = getUserRole(userData)
  
  switch (role) {
    case 'admin': return '/home-admin'
    case 'murid': return '/home-murid'
    case 'awam': return '/home-awam'
    default: return '/'
  }
}

// Helper function to check if user has access to admin features
export const hasAdminAccess = (userData: CustomUser | null): boolean => {
  return isAdmin(userData)
}

// Helper function to check if user has access to student features
export const hasStudentAccess = (userData: CustomUser | null): boolean => {
  return isStudent(userData) || isAdmin(userData)
}

// Helper function to get role display info
export const getRoleDisplayInfo = (userData: CustomUser | null) => {
  const role = getUserRole(userData)
  
  const roleInfo = {
    admin: { icon: '👨‍💼', label: 'Admin', color: 'text-green-400', bgColor: 'bg-green-500/20' },
    murid: { icon: '👨‍🎓', label: 'Murid', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
    awam: { icon: '👤', label: 'Awam', color: 'text-purple-400', bgColor: 'bg-purple-500/20' }
  }
  
  return roleInfo[role as keyof typeof roleInfo] || roleInfo.awam
}
