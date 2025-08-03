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

// Define profile type based on database schema
export interface UserProfile {
  id: string
  email: string
  name?: string
  sekolah?: string
  tingkatan?: string
  role: string
  created_at?: string
  xp?: number
  level?: number
  avatar_url?: string
  bio?: string
  updated_at?: string
}

// Baca pembolehubah persekitaran dengan cara yang paling serasi
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Fallback untuk development tanpa Supabase
const isDevelopment = process.env.NODE_ENV === 'development'
const isBuildTime = process.env.NODE_ENV === 'production' && typeof window === 'undefined'
const hasSupabaseConfig = supabaseUrl && supabaseAnonKey

// Mock client untuk development dan build time
function createMockClient() {
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => ({ data: { user: null }, error: null }),
      signOut: async () => ({ error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: { code: 'PGRST116' } })
        }),
        order: () => ({ data: [], error: null })
      }),
      insert: async () => ({ data: null, error: null }),
      update: async () => ({ data: null, error: null }),
      delete: async () => ({ data: null, error: null })
    })
  } as any
}

// Cipta client Supabase atau mock client untuk development
export const supabase = (hasSupabaseConfig && !isBuildTime)
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : createMockClient()

// Cache for user profiles to avoid repeated database calls
const profileCache = new Map<string, { profile: UserProfile | null, timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Helper function to get user profile from database
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    // Check cache first
    const cached = profileCache.get(userId)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Using cached profile for user:', userId) // Debug log
      return cached.profile
    }

    console.log('Fetching profile from database for user:', userId) // Debug log
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      // Cache null result to avoid repeated failed requests
      profileCache.set(userId, { profile: null, timestamp: Date.now() })
      return null
    }

    console.log('Profile data from database:', data) // Debug log
    
    // Cache the result
    profileCache.set(userId, { profile: data, timestamp: Date.now() })
    
    return data
  } catch (error) {
    console.error('Exception in getUserProfile:', error)
    return null
  }
}

// Helper function to get user role with database lookup
export const getUserRole = async (userData: CustomUser | null): Promise<string> => {
  if (!userData) {
    console.log('No user data provided, returning awam') // Debug log
    return 'awam'
  }
  
  console.log('Getting role for user:', userData.email, 'ID:', userData.id) // Debug log
  
  try {
    // First try to get role from database profile
    const profile = await getUserProfile(userData.id)
    
    if (profile && profile.role) {
      console.log('Found role in database profile:', profile.role) // Debug log
      return profile.role
    }
    
    // Fallback to metadata if profile not found
    const metadataRole = userData.user_metadata?.role || userData.app_metadata?.role
    if (metadataRole) {
      console.log('Found role in metadata:', metadataRole) // Debug log
      return metadataRole
    }
    
    // Email-based fallback
    if (userData.email?.includes('admin')) {
      console.log('Using email-based admin detection') // Debug log
      return 'admin'
    }
    
    console.log('No role found, defaulting to awam') // Debug log
    return 'awam'
    
  } catch (error) {
    console.error('Error in getUserRole:', error)
    return 'awam'
  }
}

// Synchronous version that uses cached data only
export const getUserRoleSync = (userData: CustomUser | null): string => {
  if (!userData) return 'awam'
  
  // Check cache for profile
  const cached = profileCache.get(userData.id)
  if (cached && cached.profile && cached.profile.role) {
    return cached.profile.role
  }
  
  // Fallback to metadata
  const metadataRole = userData.user_metadata?.role || userData.app_metadata?.role
  if (metadataRole) return metadataRole
  
  // Email-based fallback
  if (userData.email?.includes('admin')) return 'admin'
  
  return 'awam'
}

// Helper function to check if user is admin
export const isAdmin = async (userData: CustomUser | null): Promise<boolean> => {
  const role = await getUserRole(userData)
  return role === 'admin'
}

// Helper function to check if user is student
export const isStudent = async (userData: CustomUser | null): Promise<boolean> => {
  const role = await getUserRole(userData)
  return role === 'murid'
}

// Helper function to check if user is public
export const isPublic = async (userData: CustomUser | null): Promise<boolean> => {
  const role = await getUserRole(userData)
  return role === 'awam'
}

// Helper function to get user display name
export const getUserDisplayName = async (userData: CustomUser | null): Promise<string> => {
  if (!userData) return 'Tetamu'
  
  try {
    const profile = await getUserProfile(userData.id)
    
    return profile?.name || 
           userData.user_metadata?.full_name || 
           userData.email?.split('@')[0] || 
           'Pengguna'
  } catch (error) {
    console.error('Error getting display name:', error)
    return userData.email?.split('@')[0] || 'Pengguna'
  }
}

// Helper function to get role-specific dashboard URL
export const getDashboardUrl = async (userData: CustomUser | null): Promise<string> => {
  const role = await getUserRole(userData)
  
  switch (role) {
    case 'admin': return '/dashboard-admin'
    case 'murid': return '/dashboard-murid'
    case 'awam': return '/dashboard-awam'
    default: return '/dashboard-awam'
  }
}

// Helper function to get role-specific home URL
export const getHomeUrl = async (userData: CustomUser | null): Promise<string> => {
  const role = await getUserRole(userData)
  
  switch (role) {
    case 'admin': return '/home-admin'
    case 'murid': return '/home-murid'
    case 'awam': return '/home-awam'
    default: return '/'
  }
}

// Helper function to check if user has access to admin features
export const hasAdminAccess = async (userData: CustomUser | null): Promise<boolean> => {
  return await isAdmin(userData)
}

// Helper function to check if user has access to student features
export const hasStudentAccess = async (userData: CustomUser | null): Promise<boolean> => {
  const role = await getUserRole(userData)
  return role === 'murid' || role === 'admin'
}

// Helper function to get role display info
export const getRoleDisplayInfo = async (userData: CustomUser | null) => {
  const role = await getUserRole(userData)
  
  const roleInfo = {
    admin: { icon: '👨‍💼', label: 'Admin', color: 'text-green-400', bgColor: 'bg-green-500/20' },
    murid: { icon: '👨‍🎓', label: 'Murid', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
    awam: { icon: '👤', label: 'Awam', color: 'text-purple-400', bgColor: 'bg-purple-500/20' }
  }
  
  return roleInfo[role as keyof typeof roleInfo] || roleInfo.awam
}

// Helper function to update user profile
export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)

    if (error) {
      console.error('Error updating profile:', error)
      return false
    }

    // Clear cache for this user
    profileCache.delete(userId)
    
    return true
  } catch (error) {
    console.error('Exception in updateUserProfile:', error)
    return false
  }
}

// Helper function to create user profile
export const createUserProfile = async (userData: CustomUser): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: userData.id,
        email: userData.email || '',
        name: userData.user_metadata?.full_name || '',
        role: userData.user_metadata?.role || 'awam'
      })

    if (error) {
      console.error('Error creating profile:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Exception in createUserProfile:', error)
    return false
  }
}

// Clear profile cache (useful for logout)
export const clearProfileCache = (): void => {
  profileCache.clear()
}
